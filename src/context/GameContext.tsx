import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Achievement, DailyQuest,
  FriendQuest, LeaderboardEntry, GameMetadata, ActiveModal, ShareData, DailyChallenge, PausedGameSession, PlayerProfile,
  Friend, FriendChallenge, WeeklyQuest, WeeklyMilestoneReward, WeeklyResetTimer } from '../types';
import { StorageService } from '../services/storage';
import { FirebaseService } from '../services/firebase';
import { MatchmakingService } from '../services/matchmakingService';
import { QuestGeneratorService } from '../services/questGenerator';
import { NotificationService } from '../services/notificationService';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import { usePlayer } from './PlayerContext';
import confetti from 'canvas-confetti';

export type { ActiveModal };

interface GameContextType {
  activeGameId: string | null;
  activeModal: ActiveModal;
  setActiveModal: (modal: ActiveModal) => void;
  launchGame: (gameId: string, isPracticeMode?: boolean, isDailyChallenge?: boolean) => void;
  isPracticeMode: boolean;
  isDailyChallengeMode: boolean;
  setIsDailyChallengeMode: (val: boolean) => void;
  exitGame: () => void;
  achievements: Achievement[];
  dailyQuests: DailyQuest[];
  friendQuests: FriendQuest[];
  claimFriendQuest: (questId: string) => void;
  // Weekly Quest & Milestone Progression System
  weeklyQuests: WeeklyQuest[];
  weeklyMilestones: WeeklyMilestoneReward[];
  weeklyPoints: number;
  claimWeeklyQuest: (questId: string) => void;
  claimWeeklyMilestoneReward: (tier: number) => void;
  reportWeeklyQuestProgress: (typeOrCategory: string, progressDelta: number) => void;
  weeklyCountdown: WeeklyResetTimer;
  // Friends System & Direct Challenges
  friends: Friend[];
  addFriend: (friend: Friend) => void;
  addFriendByUsername: (username: string) => Promise<{ success: boolean; message: string; friend?: Friend }>;
  removeFriend: (friendId: string) => void;
  sendGiftToFriend: (friendId: string, giftType: 'coins' | 'gems' | 'potion') => Promise<{ success: boolean; message: string }>;
  sendFriendChallenge: (friend: Friend, gameId: string) => Promise<FriendChallenge>;
  incomingChallenges: FriendChallenge[];
  activeIncomingChallenge: FriendChallenge | null;
  dismissIncomingChallenge: () => void;
  respondToIncomingChallenge: (challenge: FriendChallenge, accept: boolean) => Promise<void>;
  triggerTestPvPChallenge?: () => void;
  leaderboards: Record<string, LeaderboardEntry[]>;
  reportAchievementProgress: (achievementId: string, progressDeltaOrValue: number, isAbsolute?: boolean) => void;
  claimAchievement: (achievementId: string) => void;
  reportQuestProgress: (questIdOrCategory: string, progressDelta: number) => void;
  claimDailyQuest: (questId: string) => void;
  generateNewDailyQuests: () => void;
  viewingProfileData: PlayerProfile | null;
  openPublicProfile: (profileOrId?: PlayerProfile | string) => void;
  closePublicProfile: () => void;
  isSoundMuted: boolean;
  toggleSound: () => void;
  triggerConfetti: () => void;
  submitGameScore: (gameId: string, score: number, extraStats?: Record<string, any>) => Promise<void>;
  shareData: ShareData | null;
  openShareModal: (data: ShareData) => void;
  closeShareModal: () => void;
  isChatOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  targetAchievementCategory: string | null;
  setTargetAchievementCategory: (category: string | null) => void;
  favorites: string[];
  toggleFavorite: (gameId: string) => void;
  recentlyPlayed: string[];
  selectedGameForDetail: string | null;
  openGameDetail: (gameId: string) => void;
  closeGameDetail: () => void;
  dailyChallenge: DailyChallenge;
  dailyChallenges: Record<string, DailyChallenge>;
  launchDailyChallenge: (gameId?: string) => void;
  claimDailyChallenge: (gameId?: string) => void;
  recordDailyChallengeAttempt: (gameIdOrScore: string | number, scoreOrTime: number, timeSpentSecondsArg?: number) => { challenge: DailyChallenge; newlyCompleted: boolean; allChallenges: Record<string, DailyChallenge> };
  // Paused Game State (Auto-save / Resume)
  pausedGameSession: PausedGameSession | null;
  saveAndSuspendGame: (session: PausedGameSession, exitToHub?: boolean) => void;
  autoSaveGameSession: (session: PausedGameSession) => void;
  resumePausedGame: () => void;
  discardPausedGame: () => void;
  // Achievement Celebration Overlay Popup
  unlockedAchievement: Achievement | null;
  dismissUnlockedAchievement: () => void;
  // Interactive Onboarding Walkthrough
  isOnboardingActive: boolean;
  startOnboarding: () => void;
  finishOnboarding: () => void;
  comboMultiplier: number;
  triggerComboBoost: (multiplier?: number) => void;
  activeQuestToast: { id: string; title: string; current: number; target: number; isWeekly?: boolean } | null;
  dismissQuestToast: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, addCoins, addGems, addExp } = usePlayer();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [isDailyChallengeMode, setIsDailyChallengeMode] = useState<boolean>(false);
  const [activeModalState, setActiveModalState] = useState<ActiveModal>('none');
  const setActiveModal = useCallback((modal: ActiveModal | null | undefined) => {
    setActiveModalState(modal || 'none');
  }, []);
  const activeModal = activeModalState;
  const [selectedGameForDetail, setSelectedGameForDetail] = useState<string | null>(null);
  const [targetAchievementCategory, setTargetAchievementCategory] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>(() => StorageService.loadAchievements());
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => StorageService.loadDailyQuests());
  const [viewingProfileData, setViewingProfileData] = useState<PlayerProfile | null>(null);

  // Interactive Onboarding State
  const [isOnboardingActive, setIsOnboardingActive] = useState<boolean>(() => {
    try {
      return !StorageService.isOnboardingCompleted();
    } catch {
      return false;
    }
  });

  const startOnboarding = useCallback(() => {
    soundEngine.play('click');
    setIsOnboardingActive(true);
  }, []);

  const finishOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    StorageService.setOnboardingCompleted(true);
  }, []);

  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerComboBoost = useCallback((multiplier = 2) => {
    setComboMultiplier(multiplier);
    soundEngine.play('powerup');
    hapticService.claimReward();
    if (comboTimer) clearTimeout(comboTimer);
    const timer = setTimeout(() => {
      setComboMultiplier(1);
    }, 20000);
    setComboTimer(timer);
  }, [comboTimer]);

  const [friendQuests, setFriendQuests] = useState<FriendQuest[]>([
    {
      id: 'fq_1',
      title: 'Đồng Đội Săn Mồi',
      description: 'Cùng đạt tổng 1000 điểm trong Eat \'Em All',
      gameId: 'eat-em-all',
      target: 1000,
      current: 750,
      status: 'active',
      participants: [
        { name: 'Player1', avatar: '🐉', contribution: 450 },
        { name: 'Bạn', avatar: '🎮', contribution: 300 }
      ],
      rewardCoins: 500,
      rewardGems: 20,
      rewardExp: 1000
    },
    {
      id: 'fq_2',
      title: 'Bộ Đôi Hoàn Hảo',
      description: 'Cả hai cùng qua màn 5 Block Puzzle',
      gameId: 'block-puzzle',
      target: 2,
      current: 2,
      status: 'completed',
      participants: [
        { name: 'Gosu', avatar: '🔥', contribution: 1 },
        { name: 'Bạn', avatar: '🎮', contribution: 1 }
      ],
      rewardCoins: 1000,
      rewardGems: 50,
      rewardExp: 2500
    }
  ]);
  
  const claimFriendQuest = useCallback((questId: string) => {
    const quest = friendQuests.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed') return;

    addCoins(quest.rewardCoins);
    addGems(quest.rewardGems);
    addExp(quest.rewardExp);
    hapticService.claimReward();
    soundEngine.play('claim');

    setFriendQuests(prev =>
      prev.map(q => (q.id === questId ? { ...q, status: 'claimed' } : q))
    );
  }, [friendQuests, addCoins, addGems, addExp]);

  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>(() => StorageService.loadLeaderboards());
  const [dailyChallenges, setDailyChallenges] = useState<Record<string, DailyChallenge>>(() => StorageService.loadAllDailyChallenges());
  const dailyChallenge = dailyChallenges[activeGameId || 'blocker'] || dailyChallenges['blocker'] || Object.values(dailyChallenges)[0];
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(() => soundEngine.getIsMuted());
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>(() => StorageService.loadFavorites());
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => StorageService.loadRecentlyPlayed());
  const [pausedGameSession, setPausedGameSession] = useState<PausedGameSession | null>(() => StorageService.loadPausedGame());
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [activeQuestToast, setActiveQuestToast] = useState<{ id: string; title: string; current: number; target: number; isWeekly?: boolean } | null>(null);
  const dismissQuestToast = useCallback(() => setActiveQuestToast(null), []);

  // ==========================================
  // --- FRIENDS LIST & CHALLENGES STATE ---
  // ==========================================
  const [friends, setFriends] = useState<Friend[]>(() => StorageService.loadFriends());
  const [incomingChallenges, setIncomingChallenges] = useState<FriendChallenge[]>([]);
  const [activeIncomingChallenge, setActiveIncomingChallenge] = useState<FriendChallenge | null>(null);

  // Heartbeat Presence Broadcast (Keep user alive in Firestore)
  useEffect(() => {
    if (!profile?.id) return;
    const activity = activeGameId ? `Đang chơi ${activeGameId}` : 'Đang ở Sảnh Arcade';
    FirebaseService.updatePlayerPresence(profile, activity);
    const interval = setInterval(() => {
      FirebaseService.updatePlayerPresence(profile, activity);
    }, 45000);
    return () => clearInterval(interval);
  }, [profile, activeGameId]);

  // Subscribe to real-time incoming PvP challenges
  useEffect(() => {
    if (!profile?.id) return;
    const unsub = FirebaseService.subscribeToIncomingChallenges(profile.id, (challenges) => {
      setIncomingChallenges(challenges);
      if (challenges.length > 0) {
        const newest = challenges[0];
        setActiveIncomingChallenge(newest);
        const challengerName = newest.senderName || newest.fromName || 'Bạn bè';
        const gameName = newest.gameTitle || newest.gameName || 'Trò chơi';
        NotificationService.notifyChallengeAvailable(
          challengerName,
          gameName
        );
        soundEngine.play('notification');
        hapticService.tap();
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
      const searchMatches = await FirebaseService.searchPlayers(trimmed);
      let targetPlayer = searchMatches.find(p => p.username.toLowerCase() === trimmed.toLowerCase()) || searchMatches[0];

      if (!targetPlayer) {
        // Create an organic arcade friend simulation if exact match not in firestore yet
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
      'hex-match': 'Hex Match',
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
    await FirebaseService.sendFriendChallenge(challenge);

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
      await FirebaseService.respondToFriendChallenge(challenge.id, 'accepted');
      setActiveIncomingChallenge(null);
      setActiveModal('none');
      // Launch target game
      setActiveGameId(challenge.gameId);
      setIsDailyChallengeMode(false);
      setIsPracticeMode(false);
      const title = challenge.gameTitle || challenge.gameName || 'Trò chơi';
      const sender = challenge.senderName || challenge.fromName || 'Đối thủ';
      NotificationService.send({
        title: '⚔️ Trận Đấu Bắt Đầu!',
        body: `Đang vào phòng đấu ${title} với ${sender}!`,
        tag: 'match-start',
      });
    } else {
      soundEngine.play('click');
      await FirebaseService.respondToFriendChallenge(challenge.id, 'declined');
      setActiveIncomingChallenge(null);
    }
  }, []);

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

  // ==========================================
  // --- WEEKLY QUEST & MILESTONE SYSTEM ---
  // ==========================================
  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuest[]>(() => StorageService.loadWeeklyQuests());
  const [weeklyMilestones, setWeeklyMilestones] = useState<WeeklyMilestoneReward[]>(() => StorageService.loadWeeklyMilestones());
  const [weeklyCountdown, setWeeklyCountdown] = useState<WeeklyResetTimer>(() => StorageService.getWeeklyResetCountdown());

  // Countdown timer updater
  useEffect(() => {
    const timer = setInterval(() => {
      setWeeklyCountdown(StorageService.getWeeklyResetCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const weeklyPoints = useMemo(() => {
    return weeklyQuests.reduce((sum, q) => (q.completed ? sum + q.questPoints : sum), 0);
  }, [weeklyQuests]);

  const reportWeeklyQuestProgress = useCallback((typeOrCategory: string, progressDelta: number) => {
    setWeeklyQuests(prev => {
      let changed = false;
      const updated = prev.map(q => {
        let isMatch = false;
        let isScoreMax = false;

        if (q.id === typeOrCategory) {
          isMatch = true;
        } else if (
          (typeOrCategory === 'play_any' || typeOrCategory === 'play_matches') &&
          q.type === 'play_games'
        ) {
          isMatch = true;
        } else if (
          (typeOrCategory === 'score_any' || typeOrCategory === 'total_score' || typeOrCategory.startsWith('game_score:')) &&
          q.type === 'total_score'
        ) {
          isMatch = true;
        } else if (
          (typeOrCategory === 'win_match' || typeOrCategory === 'win_matches') &&
          q.type === 'win_matches'
        ) {
          isMatch = true;
        } else if (
          (typeOrCategory === 'open_chest' || typeOrCategory === 'craft_or_open') &&
          q.type === 'open_chests'
        ) {
          isMatch = true;
        } else if (
          (typeOrCategory === 'craft_item' || typeOrCategory === 'craft_or_open') &&
          q.type === 'craft_items'
        ) {
          isMatch = true;
        } else if (
          typeOrCategory === 'daily_challenge_completed' &&
          q.type === 'daily_challenges'
        ) {
          isMatch = true;
        }

        if (isMatch) {
          changed = true;
          const newCurrent = isScoreMax ? Math.max(q.current, progressDelta) : q.current + progressDelta;
          const completed = newCurrent >= q.target;
          const updatedCurrent = Math.min(newCurrent, q.target);

          setActiveQuestToast({
            id: q.id,
            title: q.title,
            current: updatedCurrent,
            target: q.target,
            isWeekly: true,
          });

          if (completed && !q.completed) {
            NotificationService.notifyQuestCompleted(
              `⭐ Nhiệm Vụ Tuần: ${q.title}`,
              `+${q.questPoints} Điểm Tuần, +${q.rewardCoins} Coins, +${q.rewardGems} Gems!`
            );
            soundEngine.play('win');
            hapticService.claimReward();
          }

          return {
            ...q,
            current: updatedCurrent,
            completed: completed || q.completed,
          };
        }
        return q;
      });

      if (changed) {
        StorageService.saveWeeklyQuests(updated);
      }
      return updated;
    });
  }, []);

  const claimWeeklyQuest = useCallback((questId: string) => {
    const quest = weeklyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    addCoins(quest.rewardCoins);
    addGems(quest.rewardGems);
    addExp(quest.rewardExp);
    hapticService.claimReward();
    soundEngine.play('claim');

    setWeeklyQuests(prev => {
      const next = prev.map(q => (q.id === questId ? { ...q, claimed: true } : q));
      StorageService.saveWeeklyQuests(next);
      return next;
    });
  }, [weeklyQuests, addCoins, addGems, addExp]);

  const claimWeeklyMilestoneReward = useCallback((tier: number) => {
    const milestone = weeklyMilestones.find(m => m.tier === tier);
    if (!milestone || milestone.claimed) return;
    if (weeklyPoints < milestone.requiredPoints) return;

    addCoins(milestone.rewardCoins);
    addGems(milestone.rewardGems);
    addExp(milestone.rewardExp);
    hapticService.claimReward();
    soundEngine.play('win');
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.5 } });

    NotificationService.send({
      title: `🎁 Nhận Cột Mốc Tuần: ${milestone.title}!`,
      body: `Nhận +${milestone.rewardCoins} Coins, +${milestone.rewardGems} Gems, +${milestone.rewardExp} EXP!`,
      tag: 'weekly-milestone',
    });

    setWeeklyMilestones(prev => {
      const next = prev.map(m => (m.tier === tier ? { ...m, claimed: true } : m));
      StorageService.saveWeeklyMilestones(next);
      return next;
    });
  }, [weeklyMilestones, weeklyPoints, addCoins, addGems, addExp]);

  const saveAndSuspendGame = useCallback((session: PausedGameSession, exitToHub: boolean = true) => {
    StorageService.savePausedGame(session);
    setPausedGameSession(session);
    if (exitToHub) {
      setActiveGameId(null);
      setIsDailyChallengeMode(false);
      hapticService.tap();
      soundEngine.play('click');
    }
    if (profile.id) {
      FirebaseService.syncGameSessionToCloud(profile.id, session);
    }
  }, [profile.id]);

  const autoSaveGameSession = useCallback((session: PausedGameSession) => {
    saveAndSuspendGame(session, false);
  }, [saveAndSuspendGame]);

  const resumePausedGame = useCallback(() => {
    const session = pausedGameSession || StorageService.loadPausedGame();
    if (!session) return;
    hapticService.tap();
    soundEngine.play('click');
    setIsPracticeMode(!!session.isPracticeMode);
    setIsDailyChallengeMode(!!session.isDailyChallengeMode);
    setActiveGameId(session.gameId);
    setActiveModal('none');
  }, [pausedGameSession]);

  const discardPausedGame = useCallback(() => {
    hapticService.tap();
    soundEngine.play('click');
    StorageService.clearPausedGame();
    setPausedGameSession(null);
    if (profile.id) {
      FirebaseService.syncGameSessionToCloud(profile.id, null);
    }
  }, [profile.id]);

  // Subscribe to Cloud Game Session (Cross-device auto-save and resume)
  useEffect(() => {
    if (!profile.id) return;
    FirebaseService.loadGameSessionFromCloud(profile.id).then((cloudSession) => {
      if (cloudSession) {
        setPausedGameSession((prev) => {
          if (!prev || cloudSession.savedAt > prev.savedAt) {
            StorageService.savePausedGame(cloudSession);
            return cloudSession;
          }
          return prev;
        });
      }
    });

    const unsubscribe = FirebaseService.subscribeToCloudGameSession(profile.id, (cloudSession) => {
      if (cloudSession) {
        setPausedGameSession((prev) => {
          if (!prev || cloudSession.savedAt >= prev.savedAt) {
            StorageService.savePausedGame(cloudSession);
            return cloudSession;
          }
          return prev;
        });
      } else {
        // If discarded or completed on another device, update local state
        const local = StorageService.loadPausedGame();
        if (local) {
          StorageService.clearPausedGame();
          setPausedGameSession(null);
        }
      }
    });

    return () => unsubscribe();
  }, [profile.id]);

  const dismissUnlockedAchievement = useCallback(() => {
    setUnlockedAchievement(null);
  }, []);

  // Save changes to storage
  useEffect(() => {
    StorageService.saveAchievements(achievements);
  }, [achievements]);

  useEffect(() => {
    StorageService.saveDailyQuests(dailyQuests);
  }, [dailyQuests]);

  useEffect(() => {
    StorageService.saveFavorites(favorites);
  }, [favorites]);

  // Reload achievements, quests, favorites on auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setAchievements(StorageService.loadAchievements());
      setDailyQuests(StorageService.loadDailyQuests());
      setLeaderboards(StorageService.loadLeaderboards());
      setFavorites(StorageService.loadFavorites());
      setRecentlyPlayed(StorageService.loadRecentlyPlayed());
    };
    window.addEventListener('arcadex_auth_changed', handleAuthChange);
    return () => window.removeEventListener('arcadex_auth_changed', handleAuthChange);
  }, []);

  // Lock body scroll when modal or game is active
  useEffect(() => {
    if (activeModal !== 'none' || activeGameId !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal, activeGameId]);

  const toggleFavorite = useCallback((gameId: string) => {
    soundEngine.play('click');
    setFavorites(prev => {
      const exists = prev.includes(gameId);
      const updated = exists ? prev.filter(id => id !== gameId) : [...prev, gameId];
      StorageService.saveFavorites(updated);
      return updated;
    });
  }, []);

  const launchGame = useCallback((gameId: string, isPracticeMode = false, isDailyChallenge = false) => {
    setIsPracticeMode(isPracticeMode);
    setIsDailyChallengeMode(isDailyChallenge);
    soundEngine.play('click');
    
    const updatedRecents = StorageService.recordRecentlyPlayed(gameId);
    setRecentlyPlayed(updatedRecents);
    setActiveGameId(gameId);
    setActiveModal('none');
    setSelectedGameForDetail(null);
  }, []);

  const openGameDetail = useCallback((gameId: string) => {
    soundEngine.play('click');
    setSelectedGameForDetail(gameId);
    setActiveModal('gameDetail');
  }, []);

  const closeGameDetail = useCallback(() => {
    setSelectedGameForDetail(null);
    if (activeModal === 'gameDetail') {
      setActiveModal('none');
    }
  }, [activeModal]);

  const launchDailyChallenge = useCallback((gameId: string = 'blocker') => {
    launchGame(gameId, false, true);
  }, [launchGame]);

  const claimDailyChallenge = useCallback((gameId: string = activeGameId || 'blocker') => {
    const result = StorageService.claimDailyChallengeReward(gameId);
    if (result.success) {
      addCoins(result.challenge.rewardCoins);
      addGems(result.challenge.rewardGems);
      addExp(result.challenge.rewardExp);
      hapticService.claimReward();
      soundEngine.play('claim');
      confetti({ particleCount: 80, spread: 70 });
      setDailyChallenges(result.allChallenges);
      FirebaseService.syncDailyChallenge(result.challenge, profile.id);
    }
  }, [addCoins, addGems, addExp, profile.id, activeGameId]);

  const recordDailyChallengeAttempt = useCallback((gameIdOrScore: string | number, scoreOrTime: number, timeSpentSecondsArg?: number) => {
    const targetGameId = typeof gameIdOrScore === 'string' ? gameIdOrScore : (activeGameId || 'blocker');
    const score = typeof gameIdOrScore === 'string' ? scoreOrTime : gameIdOrScore;
    const timeSpent = typeof gameIdOrScore === 'string' ? (timeSpentSecondsArg ?? 180) : scoreOrTime;

    const result = StorageService.recordDailyChallengeAttempt(targetGameId, score, timeSpent);
    setDailyChallenges(result.allChallenges);
    FirebaseService.syncDailyChallenge(result.challenge, profile.id);
    if (result.newlyCompleted) {
      soundEngine.play('win');
      confetti({ particleCount: 100, spread: 80 });
    }
    return result;
  }, [profile.id, activeGameId]);

  const exitGame = useCallback(() => {
    soundEngine.play('click');
    setActiveGameId(null);
    setIsDailyChallengeMode(false);
  }, []);

  const toggleSound = useCallback(() => {
    const newMuted = !isSoundMuted;
    setIsSoundMuted(newMuted);
    soundEngine.setMuted(newMuted);
    if (!newMuted) {
      soundEngine.play('click');
    }
  }, [isSoundMuted]);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const reportAchievementProgress = useCallback((achievementId: string, progressDeltaOrValue: number, isAbsolute: boolean = false) => {
    let newlyUnlockedAch: Achievement | null = null;
    setAchievements(prev => {
      return prev.map(ach => {
        if (ach.id !== achievementId || ach.unlocked) return ach;
        
        const newProgress = isAbsolute ? progressDeltaOrValue : ach.current + progressDeltaOrValue;
        const reached = newProgress >= ach.target;

        if (reached && !ach.unlocked) {
          newlyUnlockedAch = {
            ...ach,
            current: Math.min(newProgress, ach.target),
            unlocked: true,
          };
        }

        return {
          ...ach,
          current: Math.min(newProgress, ach.target),
          unlocked: reached || ach.unlocked,
        };
      });
    });

    if (newlyUnlockedAch) {
      soundEngine.play('win');
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.5 } });
      setUnlockedAchievement(newlyUnlockedAch);
    }
  }, []);

  const claimAchievement = useCallback((achievementId: string) => {
    const ach = achievements.find(a => a.id === achievementId);
    if (!ach || !ach.unlocked || ach.claimed) return;

    // Perform rewards updates on PlayerContext outside of any state updater
    addExp(ach.rewardExp);
    addCoins(ach.rewardCoins);
    addGems(ach.rewardGems);
    hapticService.claimReward();
    soundEngine.play('claim');

    setAchievements(prev =>
      prev.map(a => (a.id === achievementId ? { ...a, claimed: true } : a))
    );
    setUnlockedAchievement(prev => (prev && prev.id === achievementId ? { ...prev, claimed: true } : prev));

    // Non-intrusive toast notification for claiming achievement reward
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('arcadex:show_toast', {
          detail: {
            type: 'achievement_reward',
            achievement: {
              id: ach.id,
              title: ach.title,
              icon: ach.icon,
              rewardCoins: ach.rewardCoins,
              rewardGems: ach.rewardGems,
              rewardExp: ach.rewardExp,
            },
          },
        })
      );
    }
  }, [achievements, addExp, addCoins, addGems]);

  const reportQuestProgress = useCallback((questIdOrCategory: string, progressDelta: number) => {
    setDailyQuests(prev => {
      let changed = false;
      const updated = prev.map(q => {
        let isMatch = false;
        let isScoreMax = false;

        // 1. Direct ID match
        if (q.id === questIdOrCategory) {
          isMatch = true;
        }
        // 2. Play matches objective (e.g. 'Play 3 matches')
        else if (
          (questIdOrCategory === 'play_any' || questIdOrCategory === 'play_matches') &&
          (q.type === 'play_matches' || q.id.includes('play'))
        ) {
          isMatch = true;
        }
        // 3. Total score objective
        else if (
          (questIdOrCategory === 'score_any' || questIdOrCategory === 'quest-score-1000' || questIdOrCategory === 'total_score') &&
          (q.type === 'total_score' || q.id.includes('total-score') || q.id.includes('score-1000'))
        ) {
          isMatch = true;
        }
        // 4. Game-specific score objective (e.g. 'Score 500 in Hex')
        else if (questIdOrCategory.startsWith('game_score:')) {
          const targetGameId = questIdOrCategory.replace('game_score:', '');
          if (q.type === 'game_score' && q.gameId === targetGameId) {
            isMatch = true;
            isScoreMax = true;
          }
        }
        // 5. Win match objective
        else if (
          (questIdOrCategory === 'win_match' || questIdOrCategory === 'quest-win-1-match') &&
          (q.type === 'win_match' || q.id.includes('win'))
        ) {
          isMatch = true;
        }
        // 6. Open chest objective
        else if (
          (questIdOrCategory === 'open_chest' || questIdOrCategory === 'quest-open-chest') &&
          (q.type === 'open_chest' || q.id.includes('chest'))
        ) {
          isMatch = true;
        }
        // 7. Craft item objective
        else if (
          (questIdOrCategory === 'craft_item' || questIdOrCategory === 'quest-craft') &&
          (q.type === 'craft_item' || q.id.includes('craft'))
        ) {
          isMatch = true;
        }
        else if (questIdOrCategory === 'craft_or_open') {
          if (q.type === 'open_chest' || q.type === 'craft_item' || q.id.includes('chest') || q.id.includes('craft')) {
            isMatch = true;
          }
        }

        if (isMatch) {
          changed = true;
          const newCurrent = isScoreMax
            ? Math.max(q.current, progressDelta)
            : q.current + progressDelta;
          const completed = newCurrent >= q.target;
          const updatedCurrent = Math.min(newCurrent, q.target);

          setActiveQuestToast({
            id: q.id,
            title: q.title,
            current: updatedCurrent,
            target: q.target,
            isWeekly: false,
          });

          // Trigger notification if newly completed
          if (completed && !q.completed) {
            NotificationService.notifyQuestCompleted(
              q.title,
              `Nhận +${q.rewardCoins} Coins, +${q.rewardExp} EXP!`
            );
            soundEngine.play('win');
            hapticService.claimReward();
          }

          return {
            ...q,
            current: updatedCurrent,
            completed: completed || q.completed,
          };
        }
        return q;
      });

      if (changed) {
        StorageService.saveDailyQuests(updated);
      }
      return updated;
    });

    // Also forward progress seamlessly to Weekly Quests
    reportWeeklyQuestProgress(questIdOrCategory, progressDelta);
  }, [reportWeeklyQuestProgress]);

  const claimDailyQuest = useCallback((questId: string) => {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;

    // Perform rewards updates on PlayerContext outside of any state updater
    addCoins(quest.rewardCoins);
    addGems(quest.rewardGems);
    addExp(quest.rewardExp);
    hapticService.claimReward();
    soundEngine.play('claim');

    setDailyQuests(prev => {
      const next = prev.map(q => (q.id === questId ? { ...q, claimed: true } : q));
      StorageService.saveDailyQuests(next);
      return next;
    });
  }, [dailyQuests, addCoins, addGems, addExp]);

  const generateNewDailyQuests = useCallback(() => {
    const newQuests = QuestGeneratorService.generate3RandomQuests();
    setDailyQuests(newQuests);
    StorageService.saveDailyQuests(newQuests);
    hapticService.tap();
    soundEngine.play('coin');
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
    NotificationService.send({
      title: '📜 Bộ Nhiệm Vụ Ngày Mới!',
      body: `Đã làm mới 3 nhiệm vụ ngày! Hoàn thành để tích lũy EXP và Arcade Coins.`,
      tag: 'new-quests',
    });
  }, []);

  const openPublicProfile = useCallback((profileOrId?: PlayerProfile | string) => {
    soundEngine.play('click');
    if (!profileOrId) {
      setViewingProfileData(profile);
    } else if (typeof profileOrId === 'string') {
      if (profileOrId === profile.id) {
        setViewingProfileData(profile);
      } else {
        const leaderboardsData = StorageService.loadLeaderboards();
        let matched: any = null;
        for (const list of Object.values(leaderboardsData)) {
          const entry = list.find(e => e.playerName === profileOrId || e.id === profileOrId);
          if (entry) {
            matched = entry;
            break;
          }
        }
        if (matched) {
          setViewingProfileData({
            id: matched.id || profileOrId,
            username: matched.playerName,
            avatar: matched.avatar || '👾',
            currentTitle: matched.title || 'Chiến Binh Arcade',
            level: matched.level || 12,
            exp: 950,
            coins: 3500,
            gems: 80,
            stats: {
              totalGamesPlayed: 64,
              totalScore: matched.score || 8500,
              totalTimePlayedSeconds: 5400,
              chestsOpened: 14,
              achievementsUnlocked: 12,
              dailyStreak: 5,
              lastLoginDate: new Date().toISOString().split('T')[0],
              highScores: { 'hex-match': matched.score || 1200, 'neon-runner': 850 },
              gamesPlayedCount: { 'hex-match': 35, 'neon-runner': 18, 'cyber-slice': 11 },
            },
            equippedSkins: {},
            equippedAvatar: matched.avatar || '👾',
            equippedTitle: matched.title || 'Chiến Binh Arcade',
            favoriteGameId: 'hex-match',
            createdAt: Date.now() - 14 * 86400000,
          });
        } else {
          setViewingProfileData(profile);
        }
      }
    } else {
      setViewingProfileData(profileOrId);
    }
    setActiveModalState('publicProfile');
  }, [profile]);

  const closePublicProfile = useCallback(() => {
    setActiveModalState((prev) => (prev === 'publicProfile' ? 'none' : prev));
    setViewingProfileData(null);
  }, []);

  const submitGameScore = useCallback(async (gameId: string, score: number, extraStats?: Record<string, any>) => {
    await FirebaseService.submitLeaderboardScore(gameId, profile.username, score, profile.avatar, profile.currentTitle, extraStats);
    setLeaderboards(StorageService.loadLeaderboards());
  }, [profile]);

  const openShareModal = useCallback((data: ShareData) => {
    soundEngine.play('click');
    setShareData(data);
    setActiveModal('share');
  }, []);

  const closeShareModal = useCallback(() => {
    setShareData(null);
    if (activeModal === 'share') {
      setActiveModal('none');
    }
  }, [activeModal]);

  const toggleChat = useCallback(() => {
    soundEngine.play('click');
    setIsChatOpen(prev => !prev);
  }, []);

  const openChat = useCallback(() => {
    soundEngine.play('click');
    setIsChatOpen(true);
  }, []);

  const contextValue = useMemo<GameContextType>(
    () => ({
      activeGameId,
      activeModal,
      setActiveModal,
      launchGame,
      isPracticeMode,
      exitGame,
      achievements,
      dailyQuests,
      generateNewDailyQuests,
      // Weekly Quests & Milestones
      weeklyQuests,
      weeklyMilestones,
      weeklyPoints,
      claimWeeklyQuest,
      claimWeeklyMilestoneReward,
      reportWeeklyQuestProgress,
      weeklyCountdown,
      // Friends & Challenges
      friends,
      addFriend,
      addFriendByUsername,
      removeFriend,
      sendGiftToFriend,
      sendFriendChallenge,
      incomingChallenges,
      activeIncomingChallenge,
      dismissIncomingChallenge,
      respondToIncomingChallenge,
      triggerTestPvPChallenge,
      viewingProfileData,
      openPublicProfile,
      closePublicProfile,
      leaderboards,
      reportAchievementProgress,
      claimAchievement,
      reportQuestProgress,
      claimDailyQuest,
      friendQuests,
      claimFriendQuest,
      isSoundMuted,
      toggleSound,
      triggerConfetti,
      submitGameScore,
      shareData,
      openShareModal,
      closeShareModal,
      isChatOpen,
      toggleChat,
      openChat,
      targetAchievementCategory,
      setTargetAchievementCategory,
      favorites,
      toggleFavorite,
      recentlyPlayed,
      selectedGameForDetail,
      openGameDetail,
      closeGameDetail,
      isDailyChallengeMode,
      setIsDailyChallengeMode,
      dailyChallenge,
      dailyChallenges,
      launchDailyChallenge,
      claimDailyChallenge,
      recordDailyChallengeAttempt,
      pausedGameSession,
      saveAndSuspendGame,
      autoSaveGameSession,
      resumePausedGame,
      discardPausedGame,
      unlockedAchievement,
      dismissUnlockedAchievement,
      isOnboardingActive,
      startOnboarding,
      finishOnboarding,
      comboMultiplier,
      triggerComboBoost,
      activeQuestToast,
      dismissQuestToast,
    }),
    [
      activeGameId,
      activeModal,
      setActiveModal,
      launchGame,
      isPracticeMode,
      exitGame,
      achievements,
      dailyQuests,
      generateNewDailyQuests,
      weeklyQuests,
      weeklyMilestones,
      weeklyPoints,
      claimWeeklyQuest,
      claimWeeklyMilestoneReward,
      reportWeeklyQuestProgress,
      weeklyCountdown,
      friends,
      addFriend,
      addFriendByUsername,
      removeFriend,
      sendFriendChallenge,
      incomingChallenges,
      activeIncomingChallenge,
      dismissIncomingChallenge,
      respondToIncomingChallenge,
      triggerTestPvPChallenge,
      viewingProfileData,
      openPublicProfile,
      closePublicProfile,
      leaderboards,
      reportAchievementProgress,
      claimAchievement,
      reportQuestProgress,
      claimDailyQuest,
      friendQuests,
      claimFriendQuest,
      isSoundMuted,
      toggleSound,
      triggerConfetti,
      submitGameScore,
      shareData,
      openShareModal,
      closeShareModal,
      isChatOpen,
      toggleChat,
      openChat,
      targetAchievementCategory,
      setTargetAchievementCategory,
      favorites,
      toggleFavorite,
      recentlyPlayed,
      selectedGameForDetail,
      openGameDetail,
      closeGameDetail,
      isDailyChallengeMode,
      setIsDailyChallengeMode,
      dailyChallenge,
      dailyChallenges,
      launchDailyChallenge,
      claimDailyChallenge,
      recordDailyChallengeAttempt,
      pausedGameSession,
      saveAndSuspendGame,
      autoSaveGameSession,
      resumePausedGame,
      discardPausedGame,
      unlockedAchievement,
      dismissUnlockedAchievement,
      isOnboardingActive,
      startOnboarding,
      finishOnboarding,
      comboMultiplier,
      triggerComboBoost,
      activeQuestToast,
      dismissQuestToast,
    ]
  );

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
