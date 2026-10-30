import { useCallback, useEffect, useRef, useState } from 'react';
import confetti from '../../utils/confetti';
import type { Friend, FriendChallenge, PlayerProfile } from '../../types';
import { StorageService } from '../../services/storage';
import { SupabaseService } from '../../services/supabase';
import { NotificationService } from '../../services/notificationService';
import { soundEngine } from '../../services/audio';
import { hapticService } from '../../services/haptics';
import { SYNC } from '../../services/syncPolicy';
import { BLOSSOM_TITLE } from '../../games/hex-match/blossom/branding';
import type { SocialSlice } from '../GameContext';

const sameChallenges = (a: FriendChallenge[], b: FriendChallenge[]) =>
  a.length === b.length && a.every((c, i) => c.id === b[i].id && c.status === b[i].status && c.expiresAt === b[i].expiresAt);

interface SocialDeps {
  profile: PlayerProfile;
  activeGameId: string | null;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  addExp: (amount: number) => void;
  /** Checks access to a game before an accepted challenge launches it. */
  authorize: (gameId: string) => Promise<boolean>;
  /** Closes launcher UI and starts the challenged game. */
  enterChallengeGame: (gameId: string) => void;
}

/** Friends list, presence heartbeat and incoming/outgoing PvP challenges. */
export function useSocialState({ profile, activeGameId, addCoins, addGems, addExp, authorize, enterChallengeGame }: SocialDeps): SocialSlice {
  // ==========================================
  // --- FRIENDS LIST & CHALLENGES STATE ---
  // ==========================================
  const [friends, setFriends] = useState<Friend[]>(() => StorageService.loadFriends());
  const [incomingChallenges, setIncomingChallenges] = useState<FriendChallenge[]>([]);
  const [activeIncomingChallenge, setActiveIncomingChallenge] = useState<FriendChallenge | null>(null);

  const presenceProfile = useRef(profile);
  presenceProfile.current = profile;
  // Heartbeat Presence Broadcast (Keep user alive in Supabase)
  useEffect(() => {
    if (!profile?.id) return;
    const activity = activeGameId ? `Đang chơi ${activeGameId}` : 'Đang ở Sảnh Arcade';
    const heartbeat = () => { if (!document.hidden && navigator.onLine) void SupabaseService.updatePlayerPresence(presenceProfile.current, activity); };
    heartbeat();
    const interval = setInterval(heartbeat, SYNC.presence);
    return () => clearInterval(interval);
  }, [profile.id, activeGameId]);

  // Subscribe to real-time incoming PvP challenges
  useEffect(() => {
    if (!profile?.id) return;
    const notified = new Set<string>();
    const unsub = SupabaseService.subscribeToIncomingChallenges(profile.id, (challenges) => {
      // Polls and errors deliver fresh (often empty) arrays; keep the old reference when nothing
      // changed so the whole launcher does not re-render.
      setIncomingChallenges(prev => sameChallenges(prev, challenges) ? prev : challenges);
      if (challenges.length > 0) {
        const newest = challenges[0];
        if (notified.has(newest.id)) return;
        notified.add(newest.id);
        setActiveIncomingChallenge(newest);
        const challengerName = newest.senderName || newest.fromName || 'Bạn bè';
        const gameName = newest.gameTitle || newest.gameName || 'Trò chơi';
        NotificationService.notifyChallengeAvailable(
          challengerName,
          gameName
        );
        // The toast owns the single notification sound.
      }
    });
    return () => unsub();
  }, [profile?.id]);

  const addFriend = useCallback((friend: Friend) => {
    const updated = StorageService.addFriend(friend);
    setFriends(updated);
    soundEngine.play('coin');
    hapticService.tap();
    NotificationService.send({
      title: '👥 Thêm Bạn Mới Thành Công!',
      body: `Đã kết bạn với ${friend.username}! Bạn có thể thách đấu ngay bây giờ.`,
      tag: 'friend-added',
    });
  }, []);

  const addFriendByUsername = useCallback(async (usernameQuery: string): Promise<{ success: boolean; message: string; friend?: Friend }> => {
    const trimmed = usernameQuery.trim();
    if (!trimmed) {
      return { success: false, message: 'Vui lòng nhập tên người chơi.' };
    }
    if (trimmed.toLowerCase() === profile.username.toLowerCase()) {
      return { success: false, message: 'Bạn không thể tự kết bạn với chính mình!' };
    }

    // Check if already in friends list
    const existing = friends.find(f => f.username.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      return { success: false, message: `Người chơi ${existing.username} đã có trong danh sách bạn bè!` };
    }

    try {
      const searchMatches = await SupabaseService.searchPlayers(trimmed);
      let targetPlayer = searchMatches.find(p => p.username.toLowerCase() === trimmed.toLowerCase()) || searchMatches[0];

      if (!targetPlayer) {
        // Create an organic arcade friend simulation if exact match not in the cloud directory yet
        const avatarPool = ['🥷', '🐉', '⚡', '👑', '🔥', '🦊', '🚀', '🐺'];
        const titlePool = ['Kỳ Thủ Thần Tốc', 'Thợ Săn Điểm Cao', 'Bậc Thầy Đấu Trí', 'Chiến Binh Ánh Sáng'];
        const randomAvatar = avatarPool[Math.floor(Math.random() * avatarPool.length)];
        const randomTitle = titlePool[Math.floor(Math.random() * titlePool.length)];

        targetPlayer = {
          id: `friend_user_${Date.now()}`,
          username: trimmed,
          avatar: randomAvatar,
          currentTitle: randomTitle,
          level: Math.floor(Math.random() * 20) + 5,
          exp: 1200,
          coins: 2500,
          gems: 40,
          stats: {
            totalGamesPlayed: 32,
            totalScore: 5400,
            totalTimePlayedSeconds: 2400,
            chestsOpened: 5,
            achievementsUnlocked: 4,
            dailyStreak: 2,
            lastLoginDate: new Date().toISOString().split('T')[0],
            highScores: { xiangqi: 1350, 'hex-match': 980 },
            gamesPlayedCount: { xiangqi: 15, 'hex-match': 12 },
          },
          equippedSkins: {},
          equippedAvatar: randomAvatar,
          equippedTitle: randomTitle,
          favoriteGameId: 'xiangqi',
          createdAt: Date.now(),
        };
      }

      const newFriend: Friend = {
        id: targetPlayer.id,
        username: targetPlayer.username,
        avatar: targetPlayer.avatar,
        currentTitle: targetPlayer.currentTitle,
        level: targetPlayer.level,
        elo: 1300 + targetPlayer.level * 15,
        isOnline: true,
        lastSeen: Date.now(),
        customStatus: 'Sẵn sàng giao hữu trận đấu!',
        favoriteGameId: targetPlayer.favoriteGameId || 'xiangqi',
        friendshipDate: Date.now(),
      };

      const updated = StorageService.addFriend(newFriend);
      setFriends(updated);
      soundEngine.play('win');
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      NotificationService.send({
        title: '🎉 Kết Bạn Thành Công!',
        body: `Đã kết bạn với ${newFriend.username} (${newFriend.currentTitle})!`,
        tag: 'friend-added',
      });

      return { success: true, message: `Đã thêm ${newFriend.username} vào danh sách bạn bè!`, friend: newFriend };
    } catch (e) {
      console.warn('addFriendByUsername error:', e);
      return { success: false, message: 'Có lỗi xảy ra khi kết bạn. Vui lòng thử lại.' };
    }
  }, [friends, profile.username]);

  const removeFriend = useCallback((friendId: string) => {
    const updated = StorageService.removeFriend(friendId);
    setFriends(updated);
    soundEngine.play('click');
    hapticService.tap();
  }, []);

  const sendGiftToFriend = useCallback(async (friendId: string, giftType: 'coins' | 'gems' | 'potion'): Promise<{ success: boolean; message: string }> => {
    const friend = friends.find(f => f.id === friendId);
    if (!friend) {
      return { success: false, message: 'Không tìm thấy bạn bè.' };
    }

    const now = Date.now();
    if (friend.lastGiftSentAt) {
      const lastDate = new Date(friend.lastGiftSentAt).toDateString();
      const todayDate = new Date(now).toDateString();
      if (lastDate === todayDate) {
        return { success: false, message: `Bạn đã tặng quà cho ${friend.username} hôm nay rồi. Hãy quay lại vào ngày mai!` };
      }
    }

    const updatedFriends = friends.map(f => {
      if (f.id === friendId) {
        return { ...f, lastGiftSentAt: now };
      }
      return f;
    });

    StorageService.saveFriends(updatedFriends);
    setFriends(updatedFriends);

    addExp(30);
    if (giftType === 'coins') {
      addCoins(50);
    } else if (giftType === 'gems') {
      addGems(5);
    } else {
      addCoins(25);
    }

    soundEngine.play('win');
    confetti({ particleCount: 25, spread: 50, origin: { y: 0.7 } });
    NotificationService.send({
      title: '🎁 Đã Gửi Quà Thành Công!',
      body: `Đã gửi ${giftType === 'coins' ? '50 Xu Vàng' : giftType === 'gems' ? '5 Kim Cương' : 'Vật Phẩm Tiêu Hao'} cho ${friend.username}! Nhận +30 EXP.`,
      tag: 'gift-sent',
    });

    return { success: true, message: `Đã gửi quà thành công cho ${friend.username}!` };
  }, [friends, addExp, addCoins, addGems]);

  const sendFriendChallenge = useCallback(async (friend: Friend, gameId: string): Promise<FriendChallenge> => {
    const gameTitles: Record<string, string> = {
      xiangqi: 'Cờ Tướng PvP',
      'caro-gomoku': 'Cờ Caro Đấu Trí',
      'neon-runner': 'Neon Runner',
      'hex-match': BLOSSOM_TITLE,
      'tile-2048': '2048 Cyber',
      'cyber-slice': 'Blade Dash',
      'eat-em-all': "Eat 'Em All",
    };

    const challengeId = `chal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const title = gameTitles[gameId] || gameId;

    const challenge: FriendChallenge = {
      id: challengeId,
      senderUid: profile.id || 'current_user',
      senderName: profile.username,
      senderAvatar: profile.avatar,
      senderTitle: profile.currentTitle,
      targetUid: friend.id,
      targetName: friend.username,
      gameId: gameId,
      gameTitle: title,
      gameIcon: '⚔️',
      roomCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      roomId: `room_${challengeId}`,
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 180000, // 3 minutes
      // Aliases
      fromUid: profile.id || 'current_user',
      fromName: profile.username,
      fromAvatar: profile.avatar,
      fromTitle: profile.currentTitle,
      gameName: title,
    };

    soundEngine.play('sword');
    hapticService.tap();
    await SupabaseService.sendFriendChallenge(challenge);

    NotificationService.send({
      title: '⚔️ Đã Gửi Lời Thách Đấu!',
      body: `Đã gửi lời mời đấu ${title} tới ${friend.username}.`,
      tag: 'challenge-sent',
    });

    return challenge;
  }, [profile]);

  const dismissIncomingChallenge = useCallback(() => {
    setActiveIncomingChallenge(null);
  }, []);

  const respondToIncomingChallenge = useCallback(async (challenge: FriendChallenge, accept: boolean) => {
    if (!challenge) return;
    if (accept) {
      soundEngine.play('win');
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.6 } });
      if (!await authorize(challenge.gameId)) return;
      await SupabaseService.respondToFriendChallenge(challenge.id, 'accepted');
      setActiveIncomingChallenge(null);
      enterChallengeGame(challenge.gameId);
      const title = challenge.gameTitle || challenge.gameName || 'Trò chơi';
      const sender = challenge.senderName || challenge.fromName || 'Đối thủ';
      NotificationService.send({
        title: '⚔️ Trận Đấu Bắt Đầu!',
        body: `Đang vào phòng đấu ${title} với ${sender}!`,
        tag: 'match-start',
      });
    } else {
      soundEngine.play('click');
      await SupabaseService.respondToFriendChallenge(challenge.id, 'declined');
      setActiveIncomingChallenge(null);
    }
  }, [authorize, enterChallengeGame]);

  const triggerTestPvPChallenge = useCallback(() => {
    const testChallenge: FriendChallenge = {
      id: `chal_test_${Date.now()}`,
      senderUid: 'challenger_longthan',
      fromUid: 'challenger_longthan',
      fromId: 'challenger_longthan',
      senderName: 'Long Thần Chiến Tướng',
      senderAvatar: '🐉',
      senderTitle: 'Đại Tông Sư',
      senderElo: 1850,
      targetUid: profile?.id || 'guest',
      targetName: profile?.username || 'Người chơi',
      gameId: 'caro-gomoku',
      gameTitle: 'Cờ Caro Online',
      gameIcon: '⚪',
      roomCode: 'TEST99',
      roomId: 'room_test_pvp',
      status: 'pending',
      createdAt: Date.now(),
      expiresAt: Date.now() + 15000,
    };
    setActiveIncomingChallenge(testChallenge);
  }, [profile]);

  return {
    friends, addFriend, addFriendByUsername, removeFriend, sendGiftToFriend, sendFriendChallenge,
    incomingChallenges, activeIncomingChallenge, dismissIncomingChallenge, respondToIncomingChallenge, triggerTestPvPChallenge,
  };
}
