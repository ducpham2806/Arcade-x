import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp, doc, setDoc } from '../cloudStore';
import type { WeeklyTopPlayer, LeaderboardEntry, DailyChallenge } from '../../types';
import { StorageService } from '../storage';
import { cloudDb } from './db';

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

export async function submitLeaderboardScore(
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

  // Also push to Supabase if online
  if (cloudDb) {
    try {
      const boardRef = collection(cloudDb, 'leaderboards', gameId, 'scores');
      addDoc(boardRef, {
        playerId: StorageService.loadProfile().id,
        playerName,
        score,
        avatar,
        title,
        date: today,
        extraStats: extraStats || null,
        timestamp: serverTimestamp(),
      }).catch(e => console.warn('Supabase leaderboard write error:', e));

      // Push to daily 24-hour subcollection
      const dailyBoardRef = collection(cloudDb, 'daily_leaderboards', `${gameId}_${today}`, 'scores');
      addDoc(dailyBoardRef, {
        playerId: StorageService.loadProfile().id,
        playerName,
        score,
        avatar,
        title,
        gameId,
        date: today,
        extraStats: extraStats || null,
        timestamp: serverTimestamp(),
      }).catch(e => console.warn('Supabase daily leaderboard write error:', e));
    } catch (e) {
      console.warn('Supabase leaderboard write error (offline ok):', e);
    }
  }
}

/**
 * Subscribe to Weekly Top Players from Supabase with fallback to local leaderboard aggregate
 */
export function subscribeToWeeklyTopPlayers(callback: (players: WeeklyTopPlayer[]) => void): () => void {
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

  if (!cloudDb) {
    callback(computeLocalTopPlayers());
    return () => {};
  }

  try {
    const playersRef = collection(cloudDb, 'players');
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
        console.warn('Supabase weekly players snapshot fallback:', err);
        callback(computeLocalTopPlayers());
      }
    );

    return unsubscribe;
  } catch (e) {
    console.warn('Supabase weekly players subscribe exception:', e);
    callback(computeLocalTopPlayers());
    return () => {};
  }
}

/**
 * Real-time subscribe to the Top 10 players globally based on total EXP.
 */
export function subscribeToGlobalExpLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  topLimit: number = 10
): () => void {
  if (!cloudDb) {
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
    const playersRef = collection(cloudDb, 'players');
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
export function subscribeToGameLeaderboard(
  gameId: string,
  callback: (entries: LeaderboardEntry[]) => void,
  topLimit: number = 5,
  filterDate?: string
): () => void {
  if (filterDate) {
    return subscribeToDailyLeaderboard(gameId, filterDate, callback, topLimit);
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

  if (!cloudDb) {
    callback(computeLocal());
    return () => {};
  }

  try {
    const scoresRef = collection(cloudDb, 'leaderboards', gameId, 'scores');
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
        console.warn(`Supabase leaderboard for ${gameId} failed, using local:`, err);
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
 * Backed by Supabase collection `daily_leaderboards/${gameId}_${dateKey}/scores` with fallback to localStorage
 */
export function subscribeToDailyLeaderboard(
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

  if (!cloudDb) {
    callback(computeLocal());
    return () => {};
  }

  try {
    const dailyCollectionKey = `${gameId}_${dateKey}`;
    const dailyScoresRef = collection(cloudDb, 'daily_leaderboards', dailyCollectionKey, 'scores');
    const q = query(dailyScoresRef, orderBy('score', 'desc'), limit(topLimit * 2));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const currentProfile = StorageService.loadProfile();
        const localEntries = StorageService.loadDailyLeaderboard(gameId, dateKey);

        const map = new Map<string, LeaderboardEntry>();
        // Seed with local entries (which guarantees realistic top players even when server collection is brand new)
        localEntries.forEach((entry) => map.set(entry.playerName, entry));

        // Overlay remote entries from Supabase
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
        console.warn(`Supabase daily leaderboard for ${gameId} failed, using local:`, err);
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
 * Sync daily challenge progress to Supabase
 */
export async function syncDailyChallenge(challenge: DailyChallenge, userId?: string): Promise<void> {
  if (!cloudDb) return;
  try {
    const docId = `${userId || 'guest'}_${challenge.date}_${challenge.gameId}`;
    const challengeRef = doc(cloudDb, 'daily_challenges', docId);
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
    console.warn('Daily challenge Supabase sync error:', e);
  }
}
