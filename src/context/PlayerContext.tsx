import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { PlayerProfile, PlayerStats, DailyLoginRewardItem } from '../types';
import { StorageService, getExpNeededForLevel, getStreakMultiplier } from '../services/storage';
import { SupabaseService } from '../services/supabase';
import { soundEngine } from '../services/audio';
import { hapticService } from '../services/haptics';
import confetti from '../utils/confetti';

interface LevelUpInfo {
  newLevel: number;
  rewardCoins: number;
  rewardGems: number;
}

interface PlayerContextType {
  profile: PlayerProfile;
  expNeeded: number;
  levelUpInfo: LevelUpInfo | null;
  addExp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  recordGamePlayed: (gameId: string, score: number, timeSpentSeconds?: number) => { isNewHighScore: boolean };
  updateUsername: (name: string) => void;
  updateAvatar: (avatar: string) => void;
  updateTitle: (title: string) => void;
  updateFavoriteGame: (gameId: string) => void;
  updateIntensity: (intensity: 'casual' | 'normal' | 'hardcore') => void;
  claimDailyStreakBonus: () => { coins: number; gems: number; streak: number } | null;
  claimDailyLoginReward: (reward: DailyLoginRewardItem, dayNumber: number) => { day: number; coins: number; gems: number; exp: number; streak: number } | null;
  spinDailyWheel: (reward: { coins: number; gems: number; label: string }) => boolean;
  dismissLevelUp: () => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageService.loadProfile());
  const [levelUpInfo, setLevelUpInfo] = useState<LevelUpInfo | null>(null);
  const prevLevelRef = useRef<number | null>(null);

  // Sync to storage on profile change
  useEffect(() => {
    StorageService.saveProfile(profile);
    const timer = setTimeout(() => { void SupabaseService.syncProfileToCloud(profile); }, 5000);
    return () => clearTimeout(timer);
  }, [profile]);

  // Reload profile when auth state changes (login, register, logout, switch account)
  useEffect(() => {
    const handleAuthChange = () => {
      const reloaded = StorageService.loadProfile();
      prevLevelRef.current = reloaded.level;
      setProfile(reloaded);
    };
    window.addEventListener('arcadex_auth_changed', handleAuthChange);
    return () => window.removeEventListener('arcadex_auth_changed', handleAuthChange);
  }, []);

  const expNeeded = getExpNeededForLevel(profile.level);

  const addExp = useCallback((_amount: number) => {
    // User accounts no longer have an XP progression loop.
  }, []);

  const addCoins = useCallback((amount: number) => {
    if (amount <= 0) return;
    setProfile(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const addGems = useCallback((amount: number) => {
    if (amount <= 0) return;
    setProfile(prev => ({ ...prev, gems: prev.gems + amount }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    if (profile.coins < amount) return false;
    soundEngine.play('click');
    setProfile(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [profile.coins]);

  const spendGems = useCallback((amount: number): boolean => {
    if (profile.gems < amount) return false;
    soundEngine.play('click');
    setProfile(prev => ({ ...prev, gems: prev.gems - amount }));
    return true;
  }, [profile.gems]);

  const recordGamePlayed = useCallback((gameId: string, score: number, timeSpentSeconds: number = 30): { isNewHighScore: boolean } => {
    let isNewHigh = false;
    const today = new Date().toISOString().split('T')[0];

    setProfile(prev => {
      const prevHigh = prev.stats.highScores[gameId] || 0;
      if (score > prevHigh) {
        isNewHigh = true;
      }
      const prevDaily = prev.stats.dailyScoreHistory || {};
      const currentTodayScore = prevDaily[today] || 0;

      const newStats: PlayerStats = {
        ...prev.stats,
        totalGamesPlayed: prev.stats.totalGamesPlayed + 1,
        totalScore: prev.stats.totalScore + score,
        totalTimePlayedSeconds: prev.stats.totalTimePlayedSeconds + timeSpentSeconds,
        highScores: {
          ...prev.stats.highScores,
          [gameId]: Math.max(prevHigh, score),
        },
        gamesPlayedCount: {
          ...prev.stats.gamesPlayedCount,
          [gameId]: (prev.stats.gamesPlayedCount[gameId] || 0) + 1,
        },
        dailyScoreHistory: {
          ...prevDaily,
          [today]: currentTodayScore + score,
        },
      };

      return {
        ...prev,
        stats: newStats,
      };
    });

    return { isNewHighScore: isNewHigh };
  }, []);

  const updateUsername = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setProfile(prev => ({ ...prev, username: trimmed }));
  }, []);

  const updateAvatar = useCallback((avatar: string) => {
    setProfile(prev => ({ ...prev, avatar, equippedAvatar: avatar }));
  }, []);

  const updateTitle = useCallback((title: string) => {
    setProfile(prev => ({ ...prev, currentTitle: title, equippedTitle: title }));
  }, []);

  const updateFavoriteGame = useCallback((gameId: string) => {
    setProfile(prev => ({ ...prev, favoriteGameId: gameId }));
  }, []);

  const updateIntensity = useCallback((intensity: 'casual' | 'normal' | 'hardcore') => {
    setProfile(prev => ({ ...prev, gameIntensity: intensity }));
  }, []);

  const claimDailyStreakBonus = useCallback((): { coins: number; gems: number; streak: number } | null => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.stats.lastLoginDate === today) {
      return null;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = profile.stats.lastLoginDate === yesterday;
    const newStreak = isConsecutive ? profile.stats.dailyStreak + 1 : 1;

    const bonusCoins = 150 + newStreak * 50;
    const bonusGems = 5 + Math.min(newStreak * 2, 20);

    setProfile(prev => {
      const existingHistory = prev.stats.loginHistoryDates || [];
      const updatedHistory = existingHistory.includes(today) ? existingHistory : [...existingHistory, today];
      return {
        ...prev,
        coins: prev.coins + bonusCoins,
        gems: prev.gems + bonusGems,
        stats: {
          ...prev.stats,
          dailyStreak: newStreak,
          lastLoginDate: today,
          loginHistoryDates: updatedHistory,
        },
      };
    });

    hapticService.claimReward();
    soundEngine.play('claim');
    confetti({ particleCount: 50, spread: 60 });
    return { coins: bonusCoins, gems: bonusGems, streak: newStreak };
  }, [profile.stats]);

  const claimDailyLoginReward = useCallback((reward: DailyLoginRewardItem, dayNumber: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.stats.lastLoginDate === today) {
      return null;
    }

    const streakMultiplier = getStreakMultiplier(dayNumber);
    const multipliedCoins = Math.round(reward.coins * streakMultiplier);
    const multipliedExp = Math.round((reward.exp || 0) * streakMultiplier);
    const shouldUnlockLuckBuff = dayNumber >= 7 || (profile.stats.dailyStreak + 1) >= 7;

    setProfile(prev => {
      let currentExp = prev.exp + multipliedExp;
      let currentLevel = prev.level;
      let needed = getExpNeededForLevel(currentLevel);
      let rewardCoinsTotal = multipliedCoins;
      let rewardGemsTotal = reward.gems;

      while (currentExp >= needed) {
        currentExp -= needed;
        currentLevel += 1;
        needed = getExpNeededForLevel(currentLevel);
        const levelBonusCoins = currentLevel * 100;
        const levelBonusGems = Math.floor(currentLevel / 2) * 5 + 5;
        rewardCoinsTotal += levelBonusCoins;
        rewardGemsTotal += levelBonusGems;
      }

      const existingHistory = prev.stats.loginHistoryDates || [];
      const updatedHistory = existingHistory.includes(today) ? existingHistory : [...existingHistory, today];

      return {
        ...prev,
        level: currentLevel,
        exp: currentExp,
        coins: prev.coins + rewardCoinsTotal,
        gems: prev.gems + rewardGemsTotal,
        stats: {
          ...prev.stats,
          dailyStreak: dayNumber,
          lastLoginDate: today,
          loginHistoryDates: updatedHistory,
          hasPermanentLuckBuff: Boolean(prev.stats.hasPermanentLuckBuff || shouldUnlockLuckBuff),
        },
      };
    });

    hapticService.claimReward();
    soundEngine.play('claim');
    confetti({
      particleCount: reward.highlight ? 100 : 60,
      spread: 70,
      origin: { y: 0.55 },
    });

    return {
      day: dayNumber,
      coins: multipliedCoins,
      gems: reward.gems,
      exp: multipliedExp,
      streak: dayNumber,
    };
  }, [profile.stats]);

  const dismissLevelUp = useCallback(() => {
    setLevelUpInfo(null);
  }, []);

  const spinDailyWheel = useCallback((reward: { coins: number; gems: number; label: string }): boolean => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.stats.lastSpinDate === today) {
      return false;
    }

    setProfile(prev => ({
      ...prev,
      coins: prev.coins + reward.coins,
      gems: prev.gems + reward.gems,
      stats: {
        ...prev.stats,
        lastSpinDate: today,
      },
    }));

    hapticService.claimReward();
    soundEngine.play('claim');
    confetti({ particleCount: 70, spread: 80 });
    return true;
  }, [profile.stats.lastSpinDate]);

  return (
    <PlayerContext.Provider
      value={{
        profile,
        expNeeded,
        levelUpInfo,
        addExp,
        addCoins,
        addGems,
        spendCoins,
        spendGems,
        recordGamePlayed,
        updateUsername,
        updateAvatar,
        updateTitle,
        updateFavoriteGame,
        updateIntensity,
        claimDailyStreakBonus,
        claimDailyLoginReward,
        spinDailyWheel,
        dismissLevelUp,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};


