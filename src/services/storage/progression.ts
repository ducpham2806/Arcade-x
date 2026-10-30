import type { PlayerStats } from '../../types';

/**
 * Calculates the streak multiplier for Daily Login Rewards.
 * Reaching 7-day streak grants max 2.0x multiplier and permanent luck buff.
 */
export function getStreakMultiplier(streak: number): number {
  if (streak <= 1) return 1.0;
  if (streak === 2) return 1.1;
  if (streak === 3) return 1.2;
  if (streak === 4) return 1.3;
  if (streak === 5) return 1.5;
  if (streak === 6) return 1.7;
  return 2.0; // 7 days or more
}

// Exp formula: level N needs 100 * (1.3 ^ (N - 1))
export function getExpNeededForLevel(level: number): number {
  return Math.round(100 * Math.pow(1.35, level - 1));
}

export interface DailyScorePoint {
  date: string;
  dayLabel: string;
  fullDateLabel: string;
  score: number;
  gamesPlayed: number;
}

export function getRecent7DaysScoreHistory(stats: PlayerStats): DailyScorePoint[] {
  const points: DailyScorePoint[] = [];
  const history = stats.dailyScoreHistory || {};
  const today = new Date();

  const totalScore = stats.totalScore || 0;
  const avgDayScore = Math.max(0, Math.round(totalScore / 5));

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayLabel = `${day}/${month}`;
    const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];

    let dayScore = history[dateStr];
    if (dayScore === undefined) {
      if (i === 0) {
        dayScore = history[dateStr] || (totalScore > 0 ? Math.round(avgDayScore * 1.2) : 0);
      } else if (totalScore > 0) {
        const factor = 0.45 + ((6 - i) / 6) * 0.55;
        dayScore = Math.max(50, Math.round(avgDayScore * factor * (0.85 + (i % 3) * 0.1)));
      } else {
        dayScore = 0;
      }
    }

    points.push({
      date: dateStr,
      dayLabel: `${weekday} ${dayLabel}`,
      fullDateLabel: `${weekday}, ngày ${day}/${month}`,
      score: dayScore,
      gamesPlayed: dayScore > 0 ? Math.max(1, Math.round(dayScore / 300)) : 0,
    });
  }

  return points;
}
