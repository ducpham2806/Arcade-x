import type { DailyQuest, WeeklyQuest, WeeklyMilestoneReward, WeeklyResetTimer } from '../../types';
import { QuestGeneratorService } from '../../services/questGenerator';
import { DEFAULT_WEEKLY_MILESTONES, DEFAULT_WEEKLY_QUESTS } from './catalog/quests';
import { STORAGE_KEYS } from './keys';

export function loadDailyQuests(): DailyQuest[] {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = localStorage.getItem(STORAGE_KEYS.LAST_QUEST_DATE);
    
    if (lastDate !== today) {
      // Reset daily quests for the new day: Automatically generate 3 random objectives from the pool
      localStorage.setItem(STORAGE_KEYS.LAST_QUEST_DATE, today);
      const generated = QuestGeneratorService.generate3RandomQuests();
      localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(generated));
      return generated;
    }

    const data = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
    if (data) {
      const parsed = JSON.parse(data) as DailyQuest[];
      if (Array.isArray(parsed) && parsed.length === 3) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const fresh = QuestGeneratorService.generate3RandomQuests();
  saveDailyQuests(fresh);
  return fresh;
}

export function saveDailyQuests(quests: DailyQuest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
  } catch {
    // ignore
  }
}

// ==========================================
// --- WEEKLY QUEST & MILESTONE SYSTEM ---
// ==========================================
export function getWeeklyQuestWeekKey(): string {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

/**
 * Calculates time remaining until weekly reset (next Monday 00:00:00 local time)
 */

/**
 * Calculates time remaining until weekly reset (next Monday 00:00:00 local time)
 */
export function getWeeklyResetCountdown(): WeeklyResetTimer {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilNextMonday = currentDay === 0 ? 1 : 8 - currentDay;
  
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilNextMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const remainingMs = Math.max(0, nextMonday.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const formatted = `${days} ngày ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;

  return { remainingMs, days, hours, minutes, seconds, formatted };
}

export function loadWeeklyQuests(): WeeklyQuest[] {
  try {
    const currentWeekKey = getWeeklyQuestWeekKey();
    const savedWeekKey = localStorage.getItem(STORAGE_KEYS.WEEKLY_QUEST_WEEK_KEY);

    if (savedWeekKey !== currentWeekKey) {
      // New week: Reset weekly quests and milestone rewards
      localStorage.setItem(STORAGE_KEYS.WEEKLY_QUEST_WEEK_KEY, currentWeekKey);
      const freshQuests = DEFAULT_WEEKLY_QUESTS;
      const freshMilestones = DEFAULT_WEEKLY_MILESTONES;
      saveWeeklyQuests(freshQuests);
      saveWeeklyMilestones(freshMilestones);
      return freshQuests;
    }

    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_QUESTS);
    if (data) {
      const parsed = JSON.parse(data) as WeeklyQuest[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const fresh = DEFAULT_WEEKLY_QUESTS;
  saveWeeklyQuests(fresh);
  return fresh;
}

export function saveWeeklyQuests(quests: WeeklyQuest[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_QUESTS, JSON.stringify(quests));
  } catch {
    // ignore
  }
}

export function loadWeeklyMilestones(): WeeklyMilestoneReward[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEEKLY_MILESTONES);
    if (data) {
      const parsed = JSON.parse(data) as WeeklyMilestoneReward[];
      if (Array.isArray(parsed) && parsed.length === 4) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  const defaults = DEFAULT_WEEKLY_MILESTONES;
  saveWeeklyMilestones(defaults);
  return defaults;
}

export function saveWeeklyMilestones(milestones: WeeklyMilestoneReward[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKLY_MILESTONES, JSON.stringify(milestones));
  } catch {
    // ignore
  }
}
