/**
 * Firebase Firestore Integration Service
 * Real-time global chat, community tips, leaderboards, and cloud backup.
 */
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  getDocs,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  PlayerProfile,
  InventoryItem,
  Achievement,
  ChatMessage,
  WeeklyTopPlayer,
  LeaderboardEntry,
  DailyChallenge,
  PausedGameSession,
  ForgeMasteryState,
  Friend,
  FriendChallenge,
} from '../types';
import { StorageService } from './storage';
import firebaseConfigJson from '../../firebase-applet-config.json';

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

try {
  setLogLevel('silent');
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfigJson);
  } else {
    firebaseApp = getApp();
  }
  if (firebaseConfigJson.firestoreDatabaseId) {
    firestoreDb = initializeFirestore(firebaseApp, { experimentalAutoDetectLongPolling: true }, firebaseConfigJson.firestoreDatabaseId);
  } else {
    firestoreDb = initializeFirestore(firebaseApp, { experimentalAutoDetectLongPolling: true });
  }
} catch (err) {
  console.warn('Firebase initialization note: using hybrid offline/online fallback mode', err);
}

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

const DEFAULT_WEEKLY_TOP_PLAYERS: WeeklyTopPlayer[] = [
  {
    rank: 1,
    playerName: 'CyberViper_VN',
    avatar: '👑',
    title: 'Vua Phản Xạ Neon',
    totalScore: 28450,
    bestGameTitle: 'Neon Runner 2099',
    level: 42,
  },
  {
    rank: 2,
    playerName: 'MatrixLord_2048',
    avatar: '⚡',
    title: 'Huyền Thoại 2048',
    totalScore: 24190,
    bestGameTitle: 'Xếp Gạch 2048',
    level: 38,
  },
  {
    rank: 3,
    playerName: 'ShadowBlade',
    avatar: '⚔️',
    title: 'Thần Sấm Cyber',
    totalScore: 21800,
    bestGameTitle: 'Cyber Slice 3000',
    level: 35,
  },
  {
    rank: 4,
    playerName: 'GalacticHero',
    avatar: '🛡️',
    title: 'Vệ Binh Vũ Trụ',
    totalScore: 18650,
    bestGameTitle: 'Cosmic Defense',
    level: 31,
  },
  {
    rank: 5,
    playerName: 'DungeonCrawler',
    avatar: '💎',
    title: 'Chiến Thần Hầm Ngục',
    totalScore: 15300,
    bestGameTitle: 'Dungeon Tap Hero',
    level: 27,
  },
];

export class FirebaseService {
  public static getDb(): Firestore | null {
    return firestoreDb;
  }

  /**
   * Subscribe to real-time chat messages from Firestore with offline fallback
   */
  public static subscribeToChat(callback: (messages: ChatMessage[]) => void): () => void {
    if (!firestoreDb) {
      const local = this.getLocalChatMessages();
      callback(local);
      const interval = setInterval(() => {
        callback(this.getLocalChatMessages());
      }, 5000);
      return () => clearInterval(interval);
    }

    try {
      const messagesRef = collection(firestoreDb, 'chat_messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(50));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            // If empty in cloud, fallback to default seed
            const local = this.getLocalChatMessages();
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
          console.warn('Firestore chat onSnapshot fallback:', error.message);
          callback(this.getLocalChatMessages());
        }
      );

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore chat subscribe failed, using local:', err);
      callback(this.getLocalChatMessages());
      return () => {};
    }
  }

  /**
   * Send a chat message to Firestore or local fallback
   */
  public static async sendChatMessage(message: Omit<ChatMessage, 'id' | 'timestamp' | 'likes' | 'likedBy'>): Promise<boolean> {
    const newMsg: ChatMessage = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      likes: 0,
      likedBy: [],
    };

    // Save to local cache first
    this.saveLocalChatMessage(newMsg);

    if (firestoreDb) {
      try {
        const messagesRef = collection(firestoreDb, 'chat_messages');
        await addDoc(messagesRef, {
          ...message,
          timestamp: serverTimestamp(),
          likes: 0,
          likedBy: [],
          createdAt: Date.now(),
        });
        return true;
      } catch (err) {
        console.warn('Could not post to Firestore chat, saved locally:', err);
      }
    }

    return true;
  }

  /**
   * Toggle like on a chat message
   */
  public static async toggleLikeChatMessage(messageId: string, userId: string): Promise<void> {
    // Update local cache
    const localMsgs = this.getLocalChatMessages();
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

    if (firestoreDb && !messageId.startsWith('msg_welcome_') && !messageId.startsWith('msg_tip_')) {
      try {
        const msgDocRef = doc(firestoreDb, 'chat_messages', messageId);
        if (target?.likedBy?.includes(userId)) {
          await updateDoc(msgDocRef, {
            likes: increment(1),
            likedBy: arrayUnion(userId),
          });
        } else {
          await updateDoc(msgDocRef, {
            likes: increment(-1),
            likedBy: arrayRemove(userId),
          });
        }
      } catch (err) {
        console.warn('Firestore toggleLike error:', err);
      }
    }
  }

  private static getLocalChatMessages(): ChatMessage[] {
    const saved = StorageService.loadGeneric<ChatMessage[]>(LOCAL_CHAT_STORAGE_KEY, DEFAULT_CHAT_MESSAGES);
    if (saved && Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
    return DEFAULT_CHAT_MESSAGES;
  }

  private static saveLocalChatMessage(msg: ChatMessage) {
    const list = this.getLocalChatMessages();
    list.push(msg);
    if (list.length > 100) {
      list.splice(0, list.length - 100);
    }
    StorageService.saveGeneric(LOCAL_CHAT_STORAGE_KEY, list);
  }

  public static async syncProfileToCloud(profile: PlayerProfile): Promise<boolean> {
    StorageService.saveProfile(profile);
    if (firestoreDb && profile.id) {
      try {
        const userRef = doc(firestoreDb, 'players', profile.id);
        await setDoc(userRef, {
          username: profile.username,
          avatar: profile.avatar,
          currentTitle: profile.currentTitle,
          level: profile.level,
          coins: profile.coins,
          gems: profile.gems,
          stats: profile.stats,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } catch (e) {
        console.warn('Cloud sync error (fallback to local):', e);
      }
    }
    return true;
  }

  /**
   * Sync player inventory, chest reserves, and forge mastery to Firebase Firestore
   */
  public static async syncInventoryToCloud(
    playerId: string,
    inventory: InventoryItem[],
    chestCounts?: Record<string, number>,
    forgeMastery?: ForgeMasteryState,
    discoveredBlueprintIds?: string[]
  ): Promise<boolean> {
    StorageService.saveInventory(inventory);
    if (!firestoreDb || !playerId) {
      return true;
    }

    try {
      const invRef = doc(firestoreDb, 'players', playerId, 'inventory_data', 'main');
      await setDoc(invRef, {
        playerId,
        items: inventory,
        chestCounts: chestCounts || null,
        forgeMastery: forgeMastery || null,
        discoveredBlueprintIds: discoveredBlueprintIds || null,
        updatedAt: serverTimestamp(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 100) : 'web',
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('Cloud inventory sync error:', e);
      return false;
    }
  }

  /**
   * Fetch player inventory from Firebase Firestore for cross-device restore
   */
  public static async loadInventoryFromCloud(playerId: string): Promise<{
    items?: InventoryItem[];
    chestCounts?: Record<string, number>;
    forgeMastery?: ForgeMasteryState;
    discoveredBlueprintIds?: string[];
  } | null> {
    if (!firestoreDb || !playerId) return null;
    try {
      const invRef = doc(firestoreDb, 'players', playerId, 'inventory_data', 'main');
      const snap = await getDoc(invRef);
      if (snap.exists()) {
        return snap.data() as any;
      }
    } catch (e) {
      console.warn('Load cloud inventory error:', e);
    }
    return null;
  }

  /**
   * Real-time subscription to cloud inventory changes
   */
  public static subscribeToCloudInventory(
    playerId: string,
    callback: (data: { items?: InventoryItem[]; chestCounts?: Record<string, number>; forgeMastery?: ForgeMasteryState; discoveredBlueprintIds?: string[] }) => void
  ): () => void {
    if (!firestoreDb || !playerId) return () => {};
    try {
      const invRef = doc(firestoreDb, 'players', playerId, 'inventory_data', 'main');
      return onSnapshot(invRef, (snap) => {
        if (snap.exists()) {
          callback(snap.data() as any);
        }
      }, (err) => {
        console.warn('Cloud inventory subscription error:', err);
      });
    } catch (e) {
      console.warn('Subscribe cloud inventory error:', e);
      return () => {};
    }
  }

  /**
   * Sync active/paused game session to Firestore for seamless cross-device continuation
   */
  public static async syncGameSessionToCloud(
    playerId: string,
    session: PausedGameSession | null
  ): Promise<boolean> {
    StorageService.savePausedGame(session);

    if (typeof window !== 'undefined' && session) {
      window.dispatchEvent(
        new CustomEvent('arcadex:cloud_sync', {
          detail: {
            status: 'saving',
            gameId: session.gameId,
            gameTitle: session.gameTitle,
            timestamp: Date.now(),
          },
        })
      );
    }

    if (!firestoreDb || !playerId) {
      if (typeof window !== 'undefined' && session) {
        setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent('arcadex:cloud_sync', {
              detail: {
                status: 'synced',
                offline: true,
                gameId: session.gameId,
                timestamp: Date.now(),
              },
            })
          );
        }, 500);
      }
      return true;
    }

    try {
      const sessionRef = doc(firestoreDb, 'players', playerId, 'game_sessions', 'current');
      if (!session) {
        await setDoc(sessionRef, {
          playerId,
          status: 'cleared',
          clearedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        await setDoc(sessionRef, {
          playerId,
          gameId: session.gameId,
          gameTitle: session.gameTitle,
          gameIcon: session.gameIcon,
          currentScore: session.currentScore,
          isPracticeMode: !!session.isPracticeMode,
          isDailyChallengeMode: !!session.isDailyChallengeMode,
          savedAt: session.savedAt,
          gameStateData: session.gameStateData || null,
          totalMoves: session.totalMoves || session.sessionStats?.moves || 0,
          timeElapsedSeconds: session.timeElapsedSeconds || session.sessionStats?.timeElapsed || 0,
          sessionStats: session.sessionStats || null,
          status: 'suspended',
          updatedAt: serverTimestamp(),
        }, { merge: true });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('arcadex:cloud_sync', {
              detail: {
                status: 'synced',
                offline: false,
                gameId: session.gameId,
                timestamp: Date.now(),
              },
            })
          );
        }
      }
      return true;
    } catch (e) {
      console.warn('Cloud game session sync error:', e);
      if (typeof window !== 'undefined' && session) {
        window.dispatchEvent(
          new CustomEvent('arcadex:cloud_sync', {
            detail: {
              status: 'synced',
              offline: true,
              gameId: session.gameId,
              timestamp: Date.now(),
            },
          })
        );
      }
      return false;
    }
  }

  /**
   * Load active paused game session from Firestore
   */
  public static async loadGameSessionFromCloud(playerId: string): Promise<PausedGameSession | null> {
    if (!firestoreDb || !playerId) return null;
    try {
      const sessionRef = doc(firestoreDb, 'players', playerId, 'game_sessions', 'current');
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.status === 'suspended' && data.gameId) {
          return {
            gameId: data.gameId,
            gameTitle: data.gameTitle,
            gameIcon: data.gameIcon,
            currentScore: data.currentScore,
            isPracticeMode: data.isPracticeMode,
            isDailyChallengeMode: data.isDailyChallengeMode,
            savedAt: data.savedAt,
            gameStateData: data.gameStateData,
            totalMoves: data.totalMoves ?? data.sessionStats?.moves ?? 0,
            timeElapsedSeconds: data.timeElapsedSeconds ?? data.sessionStats?.timeElapsed ?? 0,
            sessionStats: data.sessionStats || undefined,
          };
        }
      }
    } catch (e) {
      console.warn('Load cloud game session error:', e);
    }
    return null;
  }

  /**
   * Real-time subscription to cloud game session (auto-updates across tabs/devices)
   */
  public static subscribeToCloudGameSession(
    playerId: string,
    callback: (session: PausedGameSession | null) => void
  ): () => void {
    if (!firestoreDb || !playerId) return () => {};
    try {
      const sessionRef = doc(firestoreDb, 'players', playerId, 'game_sessions', 'current');
      return onSnapshot(sessionRef, (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.status === 'suspended' && data.gameId) {
            callback({
              gameId: data.gameId,
              gameTitle: data.gameTitle,
              gameIcon: data.gameIcon,
              currentScore: data.currentScore,
              isPracticeMode: data.isPracticeMode,
              isDailyChallengeMode: data.isDailyChallengeMode,
              savedAt: data.savedAt,
              gameStateData: data.gameStateData,
              totalMoves: data.totalMoves ?? data.sessionStats?.moves ?? 0,
              timeElapsedSeconds: data.timeElapsedSeconds ?? data.sessionStats?.timeElapsed ?? 0,
              sessionStats: data.sessionStats || undefined,
            });
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      }, (err) => {
        console.warn('Cloud game session subscription error:', err);
      });
    } catch (e) {
      console.warn('Subscribe cloud game session error:', e);
      return () => {};
    }
  }

  public static async syncAchievementsToCloud(achievements: Achievement[]): Promise<boolean> {
    StorageService.saveAchievements(achievements);
    return true;
  }

  public static async submitLeaderboardScore(
    gameId: string,
    playerName: string,
    score: number,
    avatar: string,
    title: string,
    extraStats?: Record<string, any>
  ): Promise<void> {
    const today = StorageService.getTodayDateString();
    const leaderboards = StorageService.loadLeaderboards();
    const list = leaderboards[gameId] || [];
    
    // Add or update player entry in all-time board
    const existingIndex = list.findIndex(e => e.playerName === playerName);
    const newEntry: LeaderboardEntry = {
      id: 'score_' + Date.now(),
      rank: 1,
      playerName,
      avatar,
      title,
      score,
      gameId,
      date: today,
      timestamp: Date.now(),
      extraStats,
      isCurrentPlayer: true,
    };

    if (existingIndex >= 0) {
      if (score > list[existingIndex].score) {
        list[existingIndex] = newEntry;
      }
    } else {
      list.push(newEntry);
    }

    // Sort descending by score
    list.sort((a, b) => b.score - a.score);
    // Assign ranks
    list.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    leaderboards[gameId] = list.slice(0, 50);
    StorageService.saveLeaderboards(leaderboards);

    // Also record to the 24-hour daily leaderboard
    StorageService.submitDailyScore(gameId, playerName, score, avatar, title, extraStats);

    // Also push to Firestore if online
    if (firestoreDb) {
      try {
        const boardRef = collection(firestoreDb, 'leaderboards', gameId, 'scores');
        addDoc(boardRef, {
          playerName,
          score,
          avatar,
          title,
          date: today,
          extraStats: extraStats || null,
          timestamp: serverTimestamp(),
        }).catch(e => console.warn('Firestore leaderboard write error:', e));

        // Push to daily 24-hour subcollection
        const dailyBoardRef = collection(firestoreDb, 'daily_leaderboards', `${gameId}_${today}`, 'scores');
        addDoc(dailyBoardRef, {
          playerName,
          score,
          avatar,
          title,
          gameId,
          date: today,
          extraStats: extraStats || null,
          timestamp: serverTimestamp(),
        }).catch(e => console.warn('Firestore daily leaderboard write error:', e));
      } catch (e) {
        console.warn('Firestore leaderboard write error (offline ok):', e);
      }
    }
  }

  /**
   * Subscribe to Weekly Top Players from Firestore with fallback to local leaderboard aggregate
   */
  public static subscribeToWeeklyTopPlayers(callback: (players: WeeklyTopPlayer[]) => void): () => void {
    const currentProfile = StorageService.loadProfile();

    const computeLocalTopPlayers = (): WeeklyTopPlayer[] => {
      const leaderboards = StorageService.loadLeaderboards();
      const playerMap = new Map<string, { totalScore: number; avatar: string; title: string; bestGame: string; level: number }>();

      // Seed with default champions
      DEFAULT_WEEKLY_TOP_PLAYERS.forEach((p) => {
        playerMap.set(p.playerName, {
          totalScore: p.totalScore,
          avatar: p.avatar,
          title: p.title,
          bestGame: p.bestGameTitle || 'Arcade',
          level: p.level || 20,
        });
      });

      // Aggregate high scores across games
      Object.entries(leaderboards).forEach(([gameId, list]) => {
        list.forEach((entry) => {
          const current = playerMap.get(entry.playerName) || {
            totalScore: 0,
            avatar: entry.avatar,
            title: entry.title,
            bestGame: gameId,
            level: 15,
          };
          current.totalScore += entry.score;
          if (entry.avatar) current.avatar = entry.avatar;
          if (entry.title) current.title = entry.title;
          playerMap.set(entry.playerName, current);
        });
      });

      // Include current user
      if (currentProfile && currentProfile.username) {
        const userTotal = currentProfile.stats.totalScore || Object.values(currentProfile.stats.highScores).reduce((a, b) => a + b, 0);
        playerMap.set(currentProfile.username, {
          totalScore: Math.max(userTotal, playerMap.get(currentProfile.username)?.totalScore || 0),
          avatar: currentProfile.avatar,
          title: currentProfile.currentTitle,
          bestGame: 'ArcadeX Top',
          level: currentProfile.level,
        });
      }

      const list: WeeklyTopPlayer[] = Array.from(playerMap.entries()).map(([playerName, data]) => ({
        rank: 1,
        playerName,
        avatar: data.avatar,
        title: data.title,
        totalScore: data.totalScore,
        bestGameTitle: data.bestGame,
        level: data.level,
        isCurrentPlayer: playerName === currentProfile?.username,
      }));

      list.sort((a, b) => b.totalScore - a.totalScore);
      list.forEach((p, idx) => {
        p.rank = idx + 1;
      });

      return list.slice(0, 5);
    };

    if (!firestoreDb) {
      callback(computeLocalTopPlayers());
      return () => {};
    }

    try {
      const playersRef = collection(firestoreDb, 'players');
      const q = query(playersRef, limit(10));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (snapshot.empty) {
            callback(computeLocalTopPlayers());
            return;
          }

          const remotePlayers: WeeklyTopPlayer[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const stats = data.stats || {};
            const totalScore = stats.totalScore || 0;
            remotePlayers.push({
              rank: 1,
              playerName: data.username || 'Game Thủ',
              avatar: data.avatar || '🎮',
              title: data.currentTitle || 'Tân Thủ',
              totalScore,
              level: data.level || 1,
              bestGameTitle: 'ArcadeX Champion',
              isCurrentPlayer: data.username === currentProfile?.username,
            });
          });

          // Merge with defaults if few remote players
          const mergedMap = new Map<string, WeeklyTopPlayer>();
          DEFAULT_WEEKLY_TOP_PLAYERS.forEach((d) => mergedMap.set(d.playerName, d));
          remotePlayers.forEach((r) => mergedMap.set(r.playerName, r));

          if (currentProfile && currentProfile.username) {
            const userTotal = currentProfile.stats.totalScore || Object.values(currentProfile.stats.highScores).reduce((a, b) => a + b, 0);
            mergedMap.set(currentProfile.username, {
              rank: 1,
              playerName: currentProfile.username,
              avatar: currentProfile.avatar,
              title: currentProfile.currentTitle,
              totalScore: userTotal,
              level: currentProfile.level,
              bestGameTitle: 'ArcadeX Top',
              isCurrentPlayer: true,
            });
          }

          const sorted = Array.from(mergedMap.values()).sort((a, b) => b.totalScore - a.totalScore);
          sorted.forEach((p, idx) => {
            p.rank = idx + 1;
          });

          callback(sorted.slice(0, 5));
        },
        (err) => {
          console.warn('Firestore weekly players snapshot fallback:', err);
          callback(computeLocalTopPlayers());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Firestore weekly players subscribe exception:', e);
      callback(computeLocalTopPlayers());
      return () => {};
    }
  }

  /**
   * Real-time subscribe to the Top 10 players globally based on total EXP.
   */
  public static subscribeToGlobalExpLeaderboard(
    callback: (entries: LeaderboardEntry[]) => void,
    topLimit: number = 10
  ): () => void {
    if (!firestoreDb) {
      // Fallback local profile if offline
      const currentProfile = StorageService.loadProfile();
      if (currentProfile) {
        callback([{
          id: currentProfile.id,
          rank: 1,
          playerName: currentProfile.username,
          avatar: currentProfile.avatar,
          title: currentProfile.currentTitle || 'Tân Binh',
          score: currentProfile.exp || 0,
          gameId: 'global',
          date: new Date().toISOString(),
          isCurrentPlayer: true
        }]);
      } else {
        callback([]);
      }
      return () => {};
    }

    try {
      const playersRef = collection(firestoreDb, 'players');
      const q = query(
        playersRef,
        orderBy('exp', 'desc'),
        limit(topLimit)
      );

      return onSnapshot(q, (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        const currentProfile = StorageService.loadProfile();
        
        snapshot.docs.forEach((docSnap, index) => {
          const data = docSnap.data();
          entries.push({
            id: docSnap.id,
            rank: index + 1,
            playerName: data.username || 'Unknown',
            avatar: data.avatar || '😎',
            title: data.currentTitle || 'Tân Binh',
            score: data.exp || 0,
            gameId: 'global',
            date: new Date().toISOString(),
            isCurrentPlayer: data.username === currentProfile?.username,
          });
        });

        callback(entries);
      }, (error) => {
        console.warn('Error listening to global exp leaderboard:', error);
        callback([]);
      });
    } catch (e) {
      console.warn('Failed to setup global exp leaderboard listener', e);
      callback([]);
      return () => {};
    }
  }

  /**
   * Real-time subscribe to the Top scores for a specific mini-game (e.g. top 5 or top 50)
   * If filterDate is provided, delegates to the 24-hour daily leaderboard for that date.
   */
  public static subscribeToGameLeaderboard(
    gameId: string,
    callback: (entries: LeaderboardEntry[]) => void,
    topLimit: number = 5,
    filterDate?: string
  ): () => void {
    if (filterDate) {
      return this.subscribeToDailyLeaderboard(gameId, filterDate, callback, topLimit);
    }

    const computeLocal = (): LeaderboardEntry[] => {
      const allBoards = StorageService.loadLeaderboards();
      const list = allBoards[gameId] || [];
      const currentProfile = StorageService.loadProfile();
      return list.slice(0, topLimit).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentPlayer: entry.playerName === currentProfile?.username,
      }));
    };

    if (!firestoreDb) {
      callback(computeLocal());
      return () => {};
    }

    try {
      const scoresRef = collection(firestoreDb, 'leaderboards', gameId, 'scores');
      const q = query(scoresRef, orderBy('score', 'desc'), limit(15));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const currentProfile = StorageService.loadProfile();
          const localEntries = StorageService.loadLeaderboards()[gameId] || [];

          const map = new Map<string, LeaderboardEntry>();
          // Seed with local/default entries so there are always at least 5 top players
          localEntries.forEach((entry) => map.set(entry.playerName, entry));

          // Overlay remote records
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const playerName = data.playerName || 'Vô Danh';
            const score = typeof data.score === 'number' ? data.score : 0;
            const existing = map.get(playerName);

            if (!existing || score > existing.score) {
              map.set(playerName, {
                id: docSnap.id,
                rank: 1,
                playerName,
                avatar: data.avatar || '🎮',
                title: data.title || 'Cao Thủ Arcade',
                score,
                gameId,
                date: data.date || new Date().toISOString().split('T')[0],
                timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : data.timestamp,
                extraStats: data.extraStats,
                isCurrentPlayer: playerName === currentProfile?.username,
              });
            }
          });

          // Check if current user has a score in profile stats
          if (currentProfile?.username) {
            const userGameScore = currentProfile.stats.highScores[gameId];
            if (userGameScore && (!map.has(currentProfile.username) || userGameScore > (map.get(currentProfile.username)?.score || 0))) {
              map.set(currentProfile.username, {
                id: 'current-user-game-score',
                rank: 1,
                playerName: currentProfile.username,
                avatar: currentProfile.avatar,
                title: currentProfile.currentTitle,
                score: userGameScore,
                gameId,
                date: new Date().toISOString().split('T')[0],
                isCurrentPlayer: true,
              });
            }
          }

          const sorted = Array.from(map.values()).sort((a, b) => b.score - a.score);
          const topList = sorted.slice(0, topLimit).map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            isCurrentPlayer: entry.playerName === currentProfile?.username,
          }));

          callback(topList);
        },
        (err) => {
          console.warn(`Firestore leaderboard for ${gameId} failed, using local:`, err);
          callback(computeLocal());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn(`Exception subscribing to leaderboard ${gameId}:`, e);
      callback(computeLocal());
      return () => {};
    }
  }

  /**
   * Real-time subscribe to the 24-hour Daily Leaderboard for a specific game and date
   * Backed by Firestore collection `daily_leaderboards/${gameId}_${dateKey}/scores` with fallback to localStorage
   */
  public static subscribeToDailyLeaderboard(
    gameId: string,
    dateKey: string,
    callback: (entries: LeaderboardEntry[]) => void,
    topLimit: number = 20
  ): () => void {
    const computeLocal = (): LeaderboardEntry[] => {
      const localEntries = StorageService.loadDailyLeaderboard(gameId, dateKey);
      const currentProfile = StorageService.loadProfile();
      return localEntries.slice(0, topLimit).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentPlayer: entry.playerName === currentProfile?.username,
      }));
    };

    if (!firestoreDb) {
      callback(computeLocal());
      return () => {};
    }

    try {
      const dailyCollectionKey = `${gameId}_${dateKey}`;
      const dailyScoresRef = collection(firestoreDb, 'daily_leaderboards', dailyCollectionKey, 'scores');
      const q = query(dailyScoresRef, orderBy('score', 'desc'), limit(topLimit * 2));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const currentProfile = StorageService.loadProfile();
          const localEntries = StorageService.loadDailyLeaderboard(gameId, dateKey);

          const map = new Map<string, LeaderboardEntry>();
          // Seed with local entries (which guarantees realistic top players even when server collection is brand new)
          localEntries.forEach((entry) => map.set(entry.playerName, entry));

          // Overlay remote entries from Firestore
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const playerName = data.playerName || 'Vô Danh';
            const score = typeof data.score === 'number' ? data.score : 0;
            const existing = map.get(playerName);

            if (!existing || score > existing.score) {
              map.set(playerName, {
                id: docSnap.id,
                rank: 1,
                playerName,
                avatar: data.avatar || '🎮',
                title: data.title || 'Thợ Săn Điểm Ngày',
                score,
                gameId,
                date: data.date || dateKey,
                timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp || Date.now()),
                extraStats: data.extraStats,
                isCurrentPlayer: playerName === currentProfile?.username,
              });
            }
          });

          // Check if current player has local daily best
          if (currentProfile?.username) {
            const localDailyScore = StorageService.getDailyPersonalBest(gameId, currentProfile.username, dateKey);
            if (localDailyScore > 0 && (!map.has(currentProfile.username) || localDailyScore > (map.get(currentProfile.username)?.score || 0))) {
              map.set(currentProfile.username, {
                id: 'current-user-daily-score',
                rank: 1,
                playerName: currentProfile.username,
                avatar: currentProfile.avatar,
                title: currentProfile.currentTitle,
                score: localDailyScore,
                gameId,
                date: dateKey,
                timestamp: Date.now(),
                isCurrentPlayer: true,
              });
            }
          }

          const sorted = Array.from(map.values()).sort((a, b) => b.score - a.score);
          const topList = sorted.slice(0, topLimit).map((entry, idx) => ({
            ...entry,
            rank: idx + 1,
            isCurrentPlayer: entry.playerName === currentProfile?.username,
          }));

          callback(topList);
        },
        (err) => {
          console.warn(`Firestore daily leaderboard for ${gameId} failed, using local:`, err);
          callback(computeLocal());
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn(`Exception subscribing to daily leaderboard ${gameId}:`, e);
      callback(computeLocal());
      return () => {};
    }
  }

  /**
   * Sync daily challenge progress to Firestore
   */
  public static async syncDailyChallenge(challenge: DailyChallenge, userId?: string): Promise<void> {
    if (!firestoreDb) return;
    try {
      const docId = `${userId || 'guest'}_${challenge.date}_${challenge.gameId}`;
      const challengeRef = doc(firestoreDb, 'daily_challenges', docId);
      await setDoc(
        challengeRef,
        {
          ...challenge,
          userId: userId || 'guest',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Daily challenge Firestore sync error:', e);
    }
  }

  // ==========================================
  // --- REAL-TIME PLAYER PRESENCE & FRIENDS ---
  // ==========================================
  /**
   * Updates player's online heartbeat and status in Firestore `players` collection
   */
  public static async updatePlayerPresence(profile: PlayerProfile, currentActivity: string = 'Đang rảnh tay'): Promise<void> {
    if (!firestoreDb || !profile.id) return;
    try {
      const playerRef = doc(firestoreDb, 'players', profile.id);
      await setDoc(
        playerRef,
        {
          id: profile.id,
          username: profile.username,
          avatar: profile.avatar,
          currentTitle: profile.currentTitle,
          level: profile.level,
          isOnline: true,
          lastSeen: Date.now(),
          customStatus: currentActivity,
          favoriteGameId: profile.favoriteGameId || 'xiangqi',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn('Presence update error:', e);
    }
  }

  /**
   * Search players by username from Firestore and local storage directory
   */
  public static async searchPlayers(queryText: string): Promise<PlayerProfile[]> {
    const trimmed = queryText.trim().toLowerCase();
    if (!trimmed) return [];

    const resultsMap = new Map<string, PlayerProfile>();

    // 1. Check local seed & mock directory first
    const seedFriends = StorageService.loadFriends();
    seedFriends.forEach(f => {
      if (f.username.toLowerCase().includes(trimmed)) {
        resultsMap.set(f.username.toLowerCase(), {
          id: f.id,
          username: f.username,
          avatar: f.avatar,
          currentTitle: f.currentTitle,
          level: f.level,
          exp: 500,
          coins: 2000,
          gems: 50,
          stats: {
            totalGamesPlayed: 45,
            totalScore: 7800,
            totalTimePlayedSeconds: 3600,
            chestsOpened: 8,
            achievementsUnlocked: 6,
            dailyStreak: 3,
            lastLoginDate: new Date().toISOString().split('T')[0],
            highScores: { [f.favoriteGameId || 'xiangqi']: 1200 },
            gamesPlayedCount: { [f.favoriteGameId || 'xiangqi']: 20 },
          },
          equippedSkins: {},
          equippedAvatar: f.avatar,
          equippedTitle: f.currentTitle,
          favoriteGameId: f.favoriteGameId,
          createdAt: f.friendshipDate,
        });
      }
    });

    // 2. Query Firestore if online
    if (firestoreDb) {
      try {
        const playersRef = collection(firestoreDb, 'players');
        const q = query(playersRef, limit(20));
        const snapshot = await getDocs(q);
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.username && data.username.toLowerCase().includes(trimmed)) {
            resultsMap.set(data.username.toLowerCase(), {
              id: docSnap.id,
              username: data.username,
              avatar: data.avatar || '🎮',
              currentTitle: data.currentTitle || 'Chiến Binh Arcade',
              level: data.level || 1,
              exp: data.exp || 0,
              coins: data.coins || 0,
              gems: data.gems || 0,
              stats: data.stats || {
                totalGamesPlayed: 10,
                totalScore: 1500,
                totalTimePlayedSeconds: 600,
                chestsOpened: 1,
                achievementsUnlocked: 1,
                dailyStreak: 1,
                lastLoginDate: new Date().toISOString().split('T')[0],
                highScores: {},
                gamesPlayedCount: {},
              },
              equippedSkins: data.equippedSkins || {},
              equippedAvatar: data.avatar || '🎮',
              equippedTitle: data.currentTitle || 'Chiến Binh Arcade',
              favoriteGameId: data.favoriteGameId || 'xiangqi',
              createdAt: data.createdAt || Date.now(),
            });
          }
        });
      } catch (e) {
        console.warn('Firestore player search error:', e);
      }
    }

    return Array.from(resultsMap.values());
  }

  /**
   * Send a direct challenge to a friend
   */
  public static async sendFriendChallenge(challenge: FriendChallenge): Promise<boolean> {
    if (!firestoreDb) return false;
    try {
      const challengeRef = doc(firestoreDb, 'friend_challenges', challenge.id);
      await setDoc(challengeRef, {
        ...challenge,
        createdAt: Date.now(),
        serverTimestamp: serverTimestamp(),
      });
      return true;
    } catch (e) {
      console.warn('Error sending friend challenge to Firestore:', e);
      return false;
    }
  }

  /**
   * Listen for incoming challenges directed to target user
   */
  public static subscribeToIncomingChallenges(
    targetUid: string,
    callback: (challenges: FriendChallenge[]) => void
  ): () => void {
    if (!firestoreDb || !targetUid) {
      callback([]);
      return () => {};
    }

    try {
      const challengesRef = collection(firestoreDb, 'friend_challenges');
      const q = query(
        challengesRef,
        where('targetUid', '==', targetUid),
        where('status', '==', 'pending'),
        limit(10)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const now = Date.now();
          const list: FriendChallenge[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as FriendChallenge;
            // Filter out expired challenges
            if (data.expiresAt > now) {
              list.push({ ...data, id: docSnap.id });
            }
          });
          callback(list);
        },
        (err) => {
          console.warn('Error listening for friend challenges:', err);
          callback([]);
        }
      );

      return unsubscribe;
    } catch (e) {
      console.warn('Exception subscribing to friend challenges:', e);
      callback([]);
      return () => {};
    }
  }

  /**
   * Respond to friend challenge (accept or decline)
   */
  public static async respondToFriendChallenge(challengeId: string, status: 'accepted' | 'declined'): Promise<void> {
    if (!firestoreDb || !challengeId) return;
    try {
      const challengeRef = doc(firestoreDb, 'friend_challenges', challengeId);
      await updateDoc(challengeRef, {
        status,
        respondedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Error responding to friend challenge:', e);
    }
  }
}
