import type { DailyChallenge } from '../../types';
import { DAILY_CHALLENGE_DEFINITIONS } from './catalog/dailyChallenges';
import { STORAGE_KEYS } from './keys';

// --- MULTI-GAME DAILY CHALLENGE SYSTEM ---
export function loadAllDailyChallenges(): Record<string, DailyChallenge> {
  const today = new Date().toISOString().split('T')[0];
  const definitions = DAILY_CHALLENGE_DEFINITIONS;

  const defaultAll: Record<string, DailyChallenge> = {};
  for (const [gameId, def] of Object.entries(definitions)) {
    defaultAll[gameId] = {
      id: `${gameId}-daily-${today}`,
      ...def,
      date: today,
      completed: false,
      claimed: false,
      bestScoreAchieved: 0,
      currentBestScore: 0,
      bestTimeSpent: 0,
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALL_DAILY_CHALLENGES);
    if (data) {
      const parsed: Record<string, DailyChallenge> = JSON.parse(data);
      const firstVal = Object.values(parsed)[0];
      if (firstVal && firstVal.date === today) {
        const merged = { ...defaultAll };
        for (const [gid, ch] of Object.entries(parsed)) {
          if (merged[gid]) {
            const bestScore = ch.bestScoreAchieved ?? ch.currentBestScore ?? 0;
            merged[gid] = {
              ...merged[gid],
              ...ch,
              bestScoreAchieved: bestScore,
              currentBestScore: bestScore,
              bestTimeSpent: ch.bestTimeSpent ?? 0,
            };
          }
        }
        return merged;
      }
    }
  } catch {
    // ignore
  }

  saveAllDailyChallenges(defaultAll);
  return defaultAll;
}

export function saveAllDailyChallenges(challenges: Record<string, DailyChallenge>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ALL_DAILY_CHALLENGES, JSON.stringify(challenges));
  } catch {
    // ignore
  }
}

export function loadDailyChallenge(gameId: string = 'blocker'): DailyChallenge {
  const all = loadAllDailyChallenges();
  return all[gameId] || all['blocker'];
}

export function saveDailyChallenge(challenge: DailyChallenge): void {
  const all = loadAllDailyChallenges();
  all[challenge.gameId] = challenge;
  saveAllDailyChallenges(all);
}

export function recordDailyChallengeAttempt(
  gameIdOrScore: string | number,
  scoreOrTime: number,
  timeSpentSecondsArg?: number
): { challenge: DailyChallenge; newlyCompleted: boolean; allChallenges: Record<string, DailyChallenge> } {
  let gameId = 'blocker';
  let score = 0;
  let timeSpentSeconds = 180;

  if (typeof gameIdOrScore === 'string') {
    gameId = gameIdOrScore;
    score = scoreOrTime;
    timeSpentSeconds = timeSpentSecondsArg ?? 180;
  } else {
    score = gameIdOrScore;
    timeSpentSeconds = scoreOrTime;
  }

  const all = loadAllDailyChallenges();
  const current = all[gameId] || all['blocker'] || {
    id: `${gameId}-daily-today`,
    gameId,
    title: 'Thử Thách Hàng Ngày',
    description: 'Hoàn thành thử thách trò chơi',
    targetScore: 1000,
    timeLimitSeconds: 180,
    rewardCoins: 500,
    rewardGems: 25,
    rewardExp: 150,
    date: new Date().toISOString().split('T')[0],
    completed: false,
    claimed: false,
    bestScoreAchieved: 0,
  };

  const isCompleted = score >= current.targetScore && timeSpentSeconds <= current.timeLimitSeconds;
  const newlyCompleted = isCompleted && !current.completed;

  const newBest = Math.max(current.bestScoreAchieved || 0, current.currentBestScore || 0, score);
  const updated: DailyChallenge = {
    ...current,
    bestScoreAchieved: newBest,
    currentBestScore: newBest,
    bestTimeSpent:
      current.bestTimeSpent && current.bestTimeSpent > 0
        ? Math.min(current.bestTimeSpent, timeSpentSeconds)
        : timeSpentSeconds,
    completed: current.completed || isCompleted,
  };

  all[gameId] = updated;
  saveAllDailyChallenges(all);
  return { challenge: updated, newlyCompleted, allChallenges: all };
}

export function claimDailyChallengeReward(gameId: string = 'blocker'): { challenge: DailyChallenge; success: boolean; allChallenges: Record<string, DailyChallenge> } {
  const all = loadAllDailyChallenges();
  const current = all[gameId] || all['blocker'];
  if (current && current.completed && !current.claimed) {
    const updated = { ...current, claimed: true };
    all[gameId] = updated;
    saveAllDailyChallenges(all);
    return { challenge: updated, success: true, allChallenges: all };
  }
  return { challenge: current || Object.values(all)[0], success: false, allChallenges: all };
}
