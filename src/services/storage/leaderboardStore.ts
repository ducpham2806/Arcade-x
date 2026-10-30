import type { LeaderboardEntry, DailyResetTimer } from '../../types';
import { DEFAULT_DAILY_CHALLENGERS, INITIAL_LEADERBOARD } from './catalog/leaderboard';
import { STORAGE_KEYS } from './keys';

export function loadLeaderboards(): Record<string, LeaderboardEntry[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (data) {
      const parsed: Record<string, LeaderboardEntry[]> = JSON.parse(data);
      // Merge every game with INITIAL_LEADERBOARD to guarantee at least top 5
      const merged: Record<string, LeaderboardEntry[]> = { ...INITIAL_LEADERBOARD };
      for (const [gId, entries] of Object.entries(parsed)) {
        if (Array.isArray(entries) && entries.length > 0) {
          const defEntries = INITIAL_LEADERBOARD[gId] || [];
          const uniqueEntriesMap = new Map<string, LeaderboardEntry>();
          defEntries.forEach(d => uniqueEntriesMap.set(d.playerName, d));
          entries.forEach(e => uniqueEntriesMap.set(e.playerName, e));
          const sorted = Array.from(uniqueEntriesMap.values()).sort((a, b) => b.score - a.score);
          merged[gId] = sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
        }
      }
      return merged;
    }
  } catch {
    // ignore
  }
  return INITIAL_LEADERBOARD;
}

export function saveLeaderboards(data: Record<string, LeaderboardEntry[]>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// ==========================================
// --- 24-HOUR DAILY LEADERBOARD SYSTEM ---
// ==========================================
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Calculates time remaining until the next 24-hour reset (local midnight)
 */

/**
 * Calculates time remaining until the next 24-hour reset (local midnight)
 */
export function getDailyResetCountdown(): DailyResetTimer {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const remainingMs = Math.max(0, midnight.getTime() - now.getTime());
  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  const formatted = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  return { remainingMs, hours, minutes, seconds, formatted };
}

/**
 * Loads all daily leaderboard data from localStorage: gameId -> dateKey -> entries
 */

/**
 * Loads all daily leaderboard data from localStorage: gameId -> dateKey -> entries
 */
export function loadAllDailyLeaderboards(): Record<string, Record<string, LeaderboardEntry[]>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_LEADERBOARDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

/**
 * Saves all daily leaderboards mapping to localStorage
 */

/**
 * Saves all daily leaderboards mapping to localStorage
 */
export function saveAllDailyLeaderboards(data: Record<string, Record<string, LeaderboardEntry[]>>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_LEADERBOARDS, JSON.stringify(data));
  } catch {
    // ignore
  }
}

/**
 * Generates default daily seed challengers for a game on a given dateKey
 */

/**
 * Generates default daily seed challengers for a game on a given dateKey
 */
function generateDailySeedEntries(gameId: string, dateKey: string): LeaderboardEntry[] {
  const challengers = DEFAULT_DAILY_CHALLENGERS[gameId] || [
    { playerName: 'CyberRival_VN', avatar: '🥷', title: 'Thợ Săn Điểm Ngày', score: 3200, gameId },
    { playerName: 'NeonGlitcher', avatar: '⚡', title: 'Tia Chớp 24H', score: 2600, gameId },
    { playerName: 'PixelWarrior', avatar: '👾', title: 'Chiến Binh Hàng Ngày', score: 2100, gameId },
    { playerName: 'VortexSpeed', avatar: '🌀', title: 'Cơn Lốc Tốc Độ', score: 1650, gameId },
    { playerName: 'ArcadeRookie', avatar: '🎮', title: 'Tân Thủ Nỗ Lực', score: 1100, gameId },
  ];

  const baseTime = new Date(`${dateKey}T08:00:00`).getTime() || (Date.now() - 3600 * 4 * 1000);

  return challengers.map((c, idx) => ({
    id: `daily_${gameId}_${dateKey}_${idx + 1}`,
    rank: idx + 1,
    playerName: c.playerName,
    avatar: c.avatar,
    title: c.title,
    score: c.score,
    gameId,
    date: dateKey,
    timestamp: baseTime + idx * 1800 * 1000,
    extraStats: c.extraStats,
  }));
}

/**
 * Load daily leaderboard for a specific game and date (defaults to today)
 */

/**
 * Load daily leaderboard for a specific game and date (defaults to today)
 */
export function loadDailyLeaderboard(gameId: string, dateKey?: string): LeaderboardEntry[] {
  const targetDate = dateKey || getTodayDateString();
  const allData = loadAllDailyLeaderboards();
  const gameBoards = allData[gameId] || {};

  if (gameBoards[targetDate] && Array.isArray(gameBoards[targetDate]) && gameBoards[targetDate].length > 0) {
    // Re-sort to be confident
    const sorted = [...gameBoards[targetDate]].sort((a, b) => b.score - a.score);
    return sorted.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }

  // Initialize fresh daily seed for this date
  const seeded = generateDailySeedEntries(gameId, targetDate);
  if (!allData[gameId]) allData[gameId] = {};
  allData[gameId][targetDate] = seeded;
  saveAllDailyLeaderboards(allData);

  return seeded;
}

/**
 * Save daily leaderboard for a specific game and date
 */

/**
 * Save daily leaderboard for a specific game and date
 */
export function saveDailyLeaderboard(gameId: string, dateKey: string, entries: LeaderboardEntry[]): void {
  const allData = loadAllDailyLeaderboards();
  if (!allData[gameId]) allData[gameId] = {};
  allData[gameId][dateKey] = entries;
  saveAllDailyLeaderboards(allData);
}

/**
 * Submit or update a player's score on the 24-hour daily leaderboard for today
 */

/**
 * Submit or update a player's score on the 24-hour daily leaderboard for today
 */
export function submitDailyScore(
  gameId: string,
  playerName: string,
  score: number,
  avatar: string,
  title: string,
  extraStats?: Record<string, any>
): { rank: number; isNewDailyBest: boolean; entries: LeaderboardEntry[] } {
  const today = getTodayDateString();
  const currentList = loadDailyLeaderboard(gameId, today);
  const existingIdx = currentList.findIndex((e) => e.playerName === playerName);

  let isNewDailyBest = false;
  const nowMs = Date.now();

  if (existingIdx >= 0) {
    if (score > currentList[existingIdx].score) {
      isNewDailyBest = true;
      currentList[existingIdx] = {
        ...currentList[existingIdx],
        score,
        avatar: avatar || currentList[existingIdx].avatar,
        title: title || currentList[existingIdx].title,
        timestamp: nowMs,
        extraStats: extraStats || currentList[existingIdx].extraStats,
        isCurrentPlayer: true,
      };
    }
  } else {
    isNewDailyBest = true;
    currentList.push({
      id: `daily_${gameId}_${today}_${nowMs}_${Math.random().toString(36).slice(2, 6)}`,
      rank: 0,
      playerName,
      avatar,
      title,
      score,
      gameId,
      date: today,
      timestamp: nowMs,
      extraStats,
      isCurrentPlayer: true,
    });
  }

  // Sort descending by score
  currentList.sort((a, b) => b.score - a.score);
  const updatedWithRanks = currentList.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
    isCurrentPlayer: entry.playerName === playerName,
  }));

  saveDailyLeaderboard(gameId, today, updatedWithRanks);

  const userEntry = updatedWithRanks.find((e) => e.playerName === playerName);
  const userRank = userEntry ? userEntry.rank : updatedWithRanks.length;

  return {
    rank: userRank,
    isNewDailyBest,
    entries: updatedWithRanks,
  };
}

/**
 * Get player's personal best daily high score for today or a specific date
 */

/**
 * Get player's personal best daily high score for today or a specific date
 */
export function getDailyPersonalBest(gameId: string, playerName: string, dateKey?: string): number {
  const targetDate = dateKey || getTodayDateString();
  const list = loadDailyLeaderboard(gameId, targetDate);
  const entry = list.find((e) => e.playerName === playerName);
  return entry ? entry.score : 0;
}
