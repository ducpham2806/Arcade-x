import { sessionWriter } from '../services/sessionSync';
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Achievement, DailyQuest,
  FriendQuest, LeaderboardEntry, GameMetadata, ActiveModal, ShareData, DailyChallenge, PausedGameSession, PlayerProfile,
  Friend, FriendChallenge, WeeklyQuest, WeeklyMilestoneReward } from '../types';
import { StorageService } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { MatchmakingService } from '../services/matchmakingService';
import { QuestGeneratorService } from '../services/questGenerator';
import { NotificationService } from '../services/notificationService';
import { soundEngine, audioManager, MusicTheme } from '../services/audio';
import { hapticService } from '../services/haptics';
import { usePlayer } from './PlayerContext';
import confetti from 'canvas-confetti';
import { useLauncher } from '../launcher/LauncherContext';
import { useAudioSettingsState } from './game/useAudioSettingsState';
import { useSocialState } from './game/useSocialState';

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
  soundVolume: number;
  setSoundVolume: (val: number) => void;
  isMusicMuted: boolean;
  toggleMusic: () => void;
  musicVolume: number;
  setMusicVolume: (val: number) => void;
  musicTheme: MusicTheme;
  setMusicTheme: (theme: MusicTheme) => void;
  playBGM: (theme?: MusicTheme) => void;
  stopBGM: () => void;
  playTestTone: () => void;
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

export type GameSessionSlice = Pick<GameContextType, 'activeGameId' | 'launchGame' | 'isPracticeMode' | 'isDailyChallengeMode' | 'setIsDailyChallengeMode' | 'exitGame' | 'pausedGameSession' | 'saveAndSuspendGame' | 'autoSaveGameSession' | 'resumePausedGame' | 'discardPausedGame' | 'submitGameScore' | 'comboMultiplier' | 'triggerComboBoost' | 'triggerConfetti'>;
export type LauncherUiSlice = Pick<GameContextType, 'activeModal' | 'setActiveModal' | 'shareData' | 'openShareModal' | 'closeShareModal' | 'isChatOpen' | 'toggleChat' | 'openChat' | 'targetAchievementCategory' | 'setTargetAchievementCategory' | 'selectedGameForDetail' | 'closeGameDetail' | 'viewingProfileData' | 'openPublicProfile' | 'closePublicProfile' | 'isOnboardingActive' | 'startOnboarding' | 'finishOnboarding'>;
export type LibrarySlice = Pick<GameContextType, 'favorites' | 'toggleFavorite' | 'recentlyPlayed' | 'openGameDetail'>;
export type AudioSettingsSlice = Pick<GameContextType, 'isSoundMuted' | 'toggleSound' | 'soundVolume' | 'setSoundVolume' | 'isMusicMuted' | 'toggleMusic' | 'musicVolume' | 'setMusicVolume' | 'musicTheme' | 'setMusicTheme' | 'playBGM' | 'stopBGM' | 'playTestTone'>;
export type ProgressionSlice = Pick<GameContextType, 'achievements' | 'dailyQuests' | 'friendQuests' | 'claimFriendQuest' | 'weeklyQuests' | 'weeklyMilestones' | 'weeklyPoints' | 'claimWeeklyQuest' | 'claimWeeklyMilestoneReward' | 'reportWeeklyQuestProgress' | 'leaderboards' | 'reportAchievementProgress' | 'claimAchievement' | 'reportQuestProgress' | 'claimDailyQuest' | 'generateNewDailyQuests' | 'dailyChallenge' | 'dailyChallenges' | 'launchDailyChallenge' | 'claimDailyChallenge' | 'recordDailyChallengeAttempt' | 'unlockedAchievement' | 'dismissUnlockedAchievement' | 'activeQuestToast' | 'dismissQuestToast'>;
export type SocialSlice = Pick<GameContextType, 'friends' | 'addFriend' | 'addFriendByUsername' | 'removeFriend' | 'sendGiftToFriend' | 'sendFriendChallenge' | 'incomingChallenges' | 'activeIncomingChallenge' | 'dismissIncomingChallenge' | 'respondToIncomingChallenge' | 'triggerTestPvPChallenge'>;

const GameSessionContext = createContext<GameSessionSlice | null>(null);
const LauncherUiContext = createContext<LauncherUiSlice | null>(null);
const LibraryContext = createContext<LibrarySlice | null>(null);
const AudioSettingsContext = createContext<AudioSettingsSlice | null>(null);
const ProgressionContext = createContext<ProgressionSlice | null>(null);
const SocialContext = createContext<SocialSlice | null>(null);

/** Returns the previous object while every field is still identical (Object.is). */
function useShallowStable<T extends object>(value: T): T {
  const ref = useRef(value);
  const prev = ref.current as Record<string, unknown>;
  const next = value as Record<string, unknown>;
  const keys = Object.keys(next);
  if (keys.length !== Object.keys(prev).length || keys.some(k => !Object.is(prev[k], next[k]))) ref.current = value;
  return ref.current;
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, addCoins, addGems, addExp } = usePlayer();
  const { favorites, recentlyPlayed, toggleFavorite, authorize, recordPlay, finishPlay } = useLauncher();
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [isDailyChallengeMode, setIsDailyChallengeMode] = useState<boolean>(false);
  const [activeModalState, setActiveModalState] = useState<ActiveModal>('none');
  const setActiveModal = useCallback((modal: ActiveModal | null | undefined) => {
    const available: ActiveModal[] = ['none', 'profile', 'settings', 'auth', 'share', 'gameDetail', 'leaderboard', 'pvpHistory'];
    setActiveModalState(modal && available.includes(modal) ? modal : 'none');
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

  const [friendQuests, setFriendQuests] = useState<FriendQuest[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('arcadex_friend_quests_v1') || 'null');
      if (Array.isArray(saved)) return saved;
    } catch { /* start fresh */ }
    return [
    {
      id: 'fq_1',
      title: 'Đồng Đội Săn Mồi',
      description: 'Cùng đạt tổng 1000 điểm trong Eat \'Em All',
      gameId: 'eat-em-all',
      target: 1000,
      current: 0,
      status: 'active',
      participants: [
        { name: 'Player1', avatar: '🐉', contribution: 0 },
        { name: 'Bạn', avatar: '🎮', contribution: 0 }
      ],
      rewardCoins: 500,
      rewardGems: 20,
      rewardExp: 1000
    },
    {
      id: 'fq_2',
      title: 'Bộ Đôi Hoàn Hảo',
      description: 'Hoàn thành 2 ván Blocker',
      gameId: 'blocker',
      target: 2,
      current: 0,
      status: 'active',
      participants: [
        { name: 'Gosu', avatar: '🔥', contribution: 0 },
        { name: 'Bạn', avatar: '🎮', contribution: 0 }
      ],
      rewardCoins: 1000,
      rewardGems: 50,
      rewardExp: 2500
    }
    ];
  });
  const friendQuestsRef = useRef(friendQuests);
  friendQuestsRef.current = friendQuests;
  useEffect(() => {
    localStorage.setItem('arcadex_friend_quests_v1', JSON.stringify(friendQuests));
  }, [friendQuests]);

  const claimFriendQuest = useCallback((questId: string) => {
    const quest = friendQuestsRef.current.find(q => q.id === questId);
    if (!quest || quest.status !== 'completed') return;
    const next = friendQuestsRef.current.map(q => q.id === questId ? { ...q, status: 'claimed' as const } : q);
    // Persist and update the synchronous guard before granting, including repeated clicks in one render.
    localStorage.setItem('arcadex_friend_quests_v1', JSON.stringify(next));
    friendQuestsRef.current = next;
    setFriendQuests(next);
    addCoins(quest.rewardCoins);
    addGems(quest.rewardGems);
    addExp(quest.rewardExp);
    hapticService.claimReward();
    soundEngine.play('claim');
  }, [addCoins, addGems, addExp]);

  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>(() => StorageService.loadLeaderboards());
  const [dailyChallenges, setDailyChallenges] = useState<Record<string, DailyChallenge>>(() => StorageService.loadAllDailyChallenges());
  const dailyChallenge = dailyChallenges[activeGameId || 'blocker'] || dailyChallenges['blocker'] || Object.values(dailyChallenges)[0];
  const audioState = useAudioSettingsState();
  const { musicTheme } = audioState;
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [pausedGameSession, setPausedGameSession] = useState<PausedGameSession | null>(() => StorageService.loadPausedGame());
  const [unlockedAchievement, setUnlockedAchievement] = useState<Achievement | null>(null);
  const [activeQuestToast, setActiveQuestToast] = useState<{ id: string; title: string; current: number; target: number; isWeekly?: boolean } | null>(null);
  const dismissQuestToast = useCallback(() => setActiveQuestToast(null), []);

  const latestProfile = useRef(profile);
  latestProfile.current = profile;
  const enterChallengeGame = useCallback((gameId: string) => {
    setActiveModal('none');
    recordPlay(gameId);
    setActiveGameId(gameId);
    setIsDailyChallengeMode(false);
    setIsPracticeMode(false);
  }, [setActiveModal, recordPlay]);
  const socialState = useSocialState({ profile, activeGameId, addCoins, addGems, addExp, authorize, enterChallengeGame });

  // ==========================================
  // --- WEEKLY QUEST & MILESTONE SYSTEM ---
  // ==========================================
  const [weeklyQuests, setWeeklyQuests] = useState<WeeklyQuest[]>(() => StorageService.loadWeeklyQuests());
  const [weeklyMilestones, setWeeklyMilestones] = useState<WeeklyMilestoneReward[]>(() => StorageService.loadWeeklyMilestones());
  // The live weekly reset countdown lives in useWeeklyCountdown so its tick does not
  // re-render every GameContext consumer.

  const weeklyPoints = useMemo(() => {
    return weeklyQuests.reduce((sum, q) => (q.completed ? sum + q.questPoints : sum), 0);
  }, [weeklyQuests]);

  const reportWeeklyQuestProgress = useCallback((typeOrCategory: string, progressDelta: number) => {
    // Platform progression was retired; game integrations keep a compatible callback.

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

  const autosaveQueue = useMemo(() => sessionWriter<PausedGameSession>({
    owner: profile.id,
    activeOwner: () => StorageService.loadProfile().id,
    readLocal: () => StorageService.loadPausedGame(),
    upload: session => SupabaseService.syncGameSessionToCloud(profile.id, session, false),
  }), [profile.id]);
  useEffect(() => {
    autosaveQueue.restore();
    const flush = () => { void autosaveQueue.flush(); };
    const switching = () => autosaveQueue.cancel();
    window.addEventListener('pagehide', flush);
    window.addEventListener('online', flush);
    window.addEventListener('arcadex:account_switching', switching);
    const visibility = () => { if (document.hidden) flush(); };
    document.addEventListener('visibilitychange', visibility);
    return () => {
      autosaveQueue.cancel();
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('online', flush);
      window.removeEventListener('arcadex:account_switching', switching);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [autosaveQueue]);

  const saveAndSuspendGame = useCallback((session: PausedGameSession, exitToHub: boolean = true) => {
    autosaveQueue.cancel();
    StorageService.savePausedGame(session);
    setPausedGameSession(session);
    if (exitToHub) {
      finishPlay();
      setActiveGameId(null);
      setIsDailyChallengeMode(false);
      hapticService.tap();
      soundEngine.play('click');
    }
    if (profile.id) {
      autosaveQueue.enqueue(session);
      void autosaveQueue.flush();
    }
  }, [profile.id, finishPlay, autosaveQueue]);

  const autoSaveGameSession = useCallback((session: PausedGameSession) => {
    StorageService.savePausedGame(session);
    autosaveQueue.enqueue(session);
  }, [autosaveQueue]);

  const resumePausedGame = useCallback(async () => {
    const session = StorageService.loadPausedGame() || pausedGameSession;
    if (!session || !await authorize(session.gameId)) return;
    recordPlay(session.gameId);
    hapticService.tap();
    soundEngine.play('click');
    setIsPracticeMode(!!session.isPracticeMode);
    setIsDailyChallengeMode(!!session.isDailyChallengeMode);
    setActiveGameId(session.gameId);
    setActiveModal('none');
  }, [pausedGameSession, authorize, recordPlay]);

  const discardPausedGame = useCallback(() => {
    autosaveQueue.cancel();
    hapticService.tap();
    soundEngine.play('click');
    StorageService.clearPausedGame();
    setPausedGameSession(null);
    if (profile.id) {
      autosaveQueue.enqueue(null);
      void autosaveQueue.flush();
    }
  }, [profile.id, autosaveQueue]);

  // Subscribe to Cloud Game Session (Cross-device auto-save and resume)
  useEffect(() => {
    if (!profile.id) return;
    let mounted = true;
    SupabaseService.loadGameSessionFromCloud(profile.id).then((cloudSession) => {
      if (!mounted || autosaveQueue.busy || StorageService.loadProfile().id !== profile.id) return;
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

    const unsubscribe = SupabaseService.subscribeToCloudGameSession(profile.id, (cloudSession) => {
      // A queued local save or clear takes precedence over an older server echo.
      if (autosaveQueue.busy) return;
      if (cloudSession) {
        setPausedGameSession((prev) => {
          const local = StorageService.loadPausedGame();
          if (local && local.savedAt > cloudSession.savedAt) return local;
          if (!prev || cloudSession.savedAt > prev.savedAt) {
            StorageService.savePausedGame(cloudSession);
            return cloudSession;
          }
          return prev;
        });
      } else {
        // If discarded or completed on another device, update local state
        const local = StorageService.loadPausedGame();
        if (local && !autosaveQueue.busy) {
          StorageService.clearPausedGame();
          setPausedGameSession(null);
        }
      }
    });

    return () => { mounted = false; unsubscribe(); };
  }, [profile.id, autosaveQueue]);

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

  const getGameMusicTheme = (gameId: string): MusicTheme => {
    if (['dungeon-tap', 'mummy-escape'].includes(gameId)) return 'dungeon';
    if (['cyber-slice', 'neon-runner', 'car-escape', 'space-invaders', 'brick-breaker'].includes(gameId)) return 'action';
    if (['hex-match', 'tile-2048', 'scoodoku', 'word-cross', 'chess', 'xiangqi', 'fill-the-space', 'shikaku'].includes(gameId)) return 'puzzle';
    return 'arcade';
  };

  const launchGame = useCallback(async (gameId: string, isPracticeMode = false, isDailyChallenge = false) => {
    if (!await authorize(gameId)) return;
    recordPlay(gameId);
    setIsPracticeMode(isPracticeMode);
    setIsDailyChallengeMode(isDailyChallenge);
    soundEngine.play('click');
    
    setActiveGameId(gameId);
    setActiveModal('none');
    setSelectedGameForDetail(null);
    audioManager.playMusic(getGameMusicTheme(gameId));
  }, [authorize, recordPlay]);

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
      SupabaseService.syncDailyChallenge(result.challenge, profile.id);
    }
  }, [addCoins, addGems, addExp, profile.id, activeGameId]);

  const recordDailyChallengeAttempt = useCallback((gameIdOrScore: string | number, scoreOrTime: number, timeSpentSecondsArg?: number) => {
    const targetGameId = typeof gameIdOrScore === 'string' ? gameIdOrScore : (activeGameId || 'blocker');
    const score = typeof gameIdOrScore === 'string' ? scoreOrTime : gameIdOrScore;
    const timeSpent = typeof gameIdOrScore === 'string' ? (timeSpentSecondsArg ?? 180) : scoreOrTime;

    const result = StorageService.recordDailyChallengeAttempt(targetGameId, score, timeSpent);
    setDailyChallenges(result.allChallenges);
    SupabaseService.syncDailyChallenge(result.challenge, profile.id);
    if (result.newlyCompleted) {
      soundEngine.play('win');
      confetti({ particleCount: 100, spread: 80 });
    }
    return result;
  }, [profile.id, activeGameId]);

  const exitGame = useCallback(() => {
    void autosaveQueue.flush();
    finishPlay();
    soundEngine.play('click');
    setActiveGameId(null);
    setIsDailyChallengeMode(false);
    audioManager.playMusic(musicTheme);
  }, [musicTheme, finishPlay, autosaveQueue]);


  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  }, []);

  const reportAchievementProgress = useCallback((achievementId: string, progressDeltaOrValue: number, isAbsolute: boolean = false) => {
    // Platform progression was retired; game integrations keep a compatible callback.

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
    // Platform progression was retired; game integrations keep a compatible callback.

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

  // Reads the latest profile through a ref so coin/exp changes do not replace the callback
  // (and with it the GameSession slice) mid-game.
  const submitGameScore = useCallback(async (gameId: string, score: number, extraStats?: Record<string, any>) => {
    const current = latestProfile.current;
    await SupabaseService.submitLeaderboardScore(gameId, current.username, score, current.avatar, current.currentTitle, extraStats);
    setLeaderboards(StorageService.loadLeaderboards());
  }, []);

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

  // Each slice keeps its identity until one of its own fields changes, so consumers of a
  // narrow hook (useGameSession, useLauncherUi, ...) skip unrelated updates.
  const session = useShallowStable<GameSessionSlice>({
    activeGameId, launchGame, isPracticeMode, isDailyChallengeMode, setIsDailyChallengeMode, exitGame,
    pausedGameSession, saveAndSuspendGame, autoSaveGameSession, resumePausedGame, discardPausedGame, submitGameScore,
    comboMultiplier, triggerComboBoost, triggerConfetti,
  });
  const launcherUi = useShallowStable<LauncherUiSlice>({
    activeModal, setActiveModal, shareData, openShareModal, closeShareModal, isChatOpen,
    toggleChat, openChat, targetAchievementCategory, setTargetAchievementCategory, selectedGameForDetail, closeGameDetail,
    viewingProfileData, openPublicProfile, closePublicProfile, isOnboardingActive, startOnboarding, finishOnboarding,
  });
  const library = useShallowStable<LibrarySlice>({
    favorites, toggleFavorite, recentlyPlayed, openGameDetail,
  });
  const audio = useShallowStable<AudioSettingsSlice>(audioState);
  const progression = useShallowStable<ProgressionSlice>({
    achievements, dailyQuests, friendQuests, claimFriendQuest, weeklyQuests, weeklyMilestones,
    weeklyPoints, claimWeeklyQuest, claimWeeklyMilestoneReward, reportWeeklyQuestProgress, leaderboards, reportAchievementProgress,
    claimAchievement, reportQuestProgress, claimDailyQuest, generateNewDailyQuests, dailyChallenge, dailyChallenges,
    launchDailyChallenge, claimDailyChallenge, recordDailyChallengeAttempt, unlockedAchievement, dismissUnlockedAchievement, activeQuestToast,
    dismissQuestToast,
  });
  const social = useShallowStable<SocialSlice>(socialState);
  const contextValue = useMemo<GameContextType>(
    () => ({ ...session, ...launcherUi, ...library, ...audio, ...progression, ...social }),
    [session, launcherUi, library, audio, progression, social]
  );

  return (
    <GameContext.Provider value={contextValue}>
      <GameSessionContext.Provider value={session}>
        <LauncherUiContext.Provider value={launcherUi}>
          <LibraryContext.Provider value={library}>
            <AudioSettingsContext.Provider value={audio}>
              <ProgressionContext.Provider value={progression}>
                <SocialContext.Provider value={social}>
                  {children}
                </SocialContext.Provider>
              </ProgressionContext.Provider>
            </AudioSettingsContext.Provider>
          </LibraryContext.Provider>
        </LauncherUiContext.Provider>
      </GameSessionContext.Provider>
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

export const useGameSession = (): GameSessionSlice => {
  const context = useContext(GameSessionContext);
  if (!context) throw new Error('useGameSession must be used within GameProvider');
  return context;
};

export const useLauncherUi = (): LauncherUiSlice => {
  const context = useContext(LauncherUiContext);
  if (!context) throw new Error('useLauncherUi must be used within GameProvider');
  return context;
};

export const useAudioSettings = (): AudioSettingsSlice => {
  const context = useContext(AudioSettingsContext);
  if (!context) throw new Error('useAudioSettings must be used within GameProvider');
  return context;
};

export const useProgression = (): ProgressionSlice => {
  const context = useContext(ProgressionContext);
  if (!context) throw new Error('useProgression must be used within GameProvider');
  return context;
};

export const useSocial = (): SocialSlice => {
  const context = useContext(SocialContext);
  if (!context) throw new Error('useSocial must be used within GameProvider');
  return context;
};

export const useLibrary = (): LibrarySlice => {
  const context = useContext(LibraryContext);
  if (!context) throw new Error('useLibrary must be used within GameProvider');
  return context;
};
