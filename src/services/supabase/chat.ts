import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, increment, arrayUnion, arrayRemove, runTransaction } from '../cloudStore';
import type { ChatMessage } from '../../types';
import { StorageService } from '../storage';
import { cloudDb } from './db';

// Initial mock tips and welcoming messages for arcade community
const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome_1',
    senderId: 'bot_arcadex_guide',
    senderName: 'ArcadeX Bot',
    senderAvatar: '🤖',
    senderTitle: 'Trợ Thủ Arcade',
    senderLevel: 99,
    text: 'Chào mừng các game thủ đến với ArcadeX! Hãy chia sẻ mẹo chơi, khoe huy hiệu và lập kỷ lục mới nhé! 🎉',
    timestamp: Date.now() - 3600000 * 2,
    gameTipTag: 'tip',
    likes: 12,
    likedBy: [],
  },
  {
    id: 'msg_tip_runner',
    senderId: 'player_dragon_master',
    senderName: 'DragonSlayer',
    senderAvatar: '🐉',
    senderTitle: 'Bậc Thầy Neon',
    senderLevel: 24,
    text: 'Mẹo Neon Runner: Nhảy 2 lần (Double Jump) ở độ cao rơi vừa phải sẽ giúp né chướng ngại vật kép cực dễ! ⚡',
    timestamp: Date.now() - 1800000,
    gameTipTag: 'tip',
    likes: 8,
    likedBy: [],
  },
  {
    id: 'msg_tip_stack',
    senderId: 'player_ninja_cut',
    senderName: 'ShadowBlade',
    senderAvatar: '⚡',
    senderTitle: 'Thần Sấm',
    senderLevel: 19,
    text: 'Blade Dash: Tích combo x5 trở lên sẽ tăng điểm x2 và nhận thêm rương báu lúc kết thúc game đấy!',
    timestamp: Date.now() - 600000,
    gameTipTag: 'score',
    likes: 5,
    likedBy: [],
  },
];

const LOCAL_CHAT_STORAGE_KEY = 'arcadex_local_chat_messages_v1';

/**
 * Subscribe to real-time chat messages from Supabase with offline fallback
 */
export function subscribeToChat(callback: (messages: ChatMessage[]) => void): () => void {
  if (!cloudDb) {
    const local = getLocalChatMessages();
    callback(local);
    const interval = setInterval(() => {
      callback(getLocalChatMessages());
    }, 5000);
    return () => clearInterval(interval);
  }

  try {
    const messagesRef = collection(cloudDb, 'chat_messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          // If empty in cloud, fallback to default seed
          const local = getLocalChatMessages();
          callback(local);
          return;
        }

        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            senderId: data.senderId || 'anon',
            senderName: data.senderName || 'Game Thủ',
            senderAvatar: data.senderAvatar || '🎮',
            senderTitle: data.senderTitle || 'Tân Thủ',
            senderLevel: data.senderLevel || 1,
            text: data.text || '',
            timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp || Date.now(),
            gameTipTag: data.gameTipTag || 'general',
            sharedAchievement: data.sharedAchievement,
            sharedScore: data.sharedScore,
            likes: data.likes || 0,
            likedBy: data.likedBy || [],
          });
        });

        // Sort ascending for chronological reading
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        callback(msgs);
      },
      (error) => {
        console.warn('Supabase chat onSnapshot fallback:', error.message);
        callback(getLocalChatMessages());
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Supabase chat subscribe failed, using local:', err);
    callback(getLocalChatMessages());
    return () => {};
  }
}

/**
 * Send a chat message to Supabase or local fallback
 */
export async function sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'likes' | 'likedBy'>): Promise<boolean> {
  const newMsg: ChatMessage = {
    ...message,
    id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    timestamp: Date.now(),
    likes: 0,
    likedBy: [],
  };

  // Save to local cache first
  saveLocalChatMessage(newMsg);

  if (cloudDb) {
    try {
      const messagesRef = collection(cloudDb, 'chat_messages');
      await addDoc(messagesRef, {
        ...message,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        createdAt: Date.now(),
      });
      return true;
    } catch (err) {
      console.warn('Could not post to Supabase chat, saved locally:', err);
    }
  }

  return false;
}

/**
 * Toggle like on a chat message
 */
export async function toggleLikeChatMessage(messageId: string, userId: string): Promise<void> {
  // Update local cache
  const localMsgs = getLocalChatMessages();
  const target = localMsgs.find((m) => m.id === messageId);
  if (target) {
    const likedBy = target.likedBy || [];
    const hasLiked = likedBy.includes(userId);
    if (hasLiked) {
      target.likedBy = likedBy.filter((id) => id !== userId);
      target.likes = Math.max(0, (target.likes || 1) - 1);
    } else {
      target.likedBy = [...likedBy, userId];
      target.likes = (target.likes || 0) + 1;
    }
    StorageService.saveGeneric(LOCAL_CHAT_STORAGE_KEY, localMsgs);
  }

  if (cloudDb && !messageId.startsWith('msg_welcome_') && !messageId.startsWith('msg_tip_')) {
    try {
      const msgDocRef = doc(cloudDb, 'chat_messages', messageId);
      await runTransaction(cloudDb, async tx => {
        const snapshot = await tx.get(msgDocRef);
        if (!snapshot.exists()) return;
        const likedBy: string[] = snapshot.data().likedBy || [];
        const hasLiked = likedBy.includes(userId);
        tx.update(msgDocRef, {
          likes: increment(hasLiked ? -1 : 1),
          likedBy: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
        });
      });
    } catch (err) {
      console.warn('Supabase toggleLike error:', err);
    }
  }
}

function getLocalChatMessages(): ChatMessage[] {
  const saved = StorageService.loadGeneric<ChatMessage[]>(LOCAL_CHAT_STORAGE_KEY, DEFAULT_CHAT_MESSAGES);
  if (saved && Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  return DEFAULT_CHAT_MESSAGES;
}

function saveLocalChatMessage(msg: ChatMessage) {
  const list = getLocalChatMessages();
  list.push(msg);
  if (list.length > 100) {
    list.splice(0, list.length - 100);
  }
  StorageService.saveGeneric(LOCAL_CHAT_STORAGE_KEY, list);
}
