import { SudokuDifficulty, SudokuGameMode, SudokuGridSize } from './types';

export interface GamePerformanceRecord {
  id: string;
  timestamp: number;
  mode: SudokuGameMode;
  size: SudokuGridSize;
  difficulty: SudokuDifficulty;
  won: boolean;
  timeSpentSeconds: number;
  mistakes: number;
  hintsUsed: number;
}

export interface DynamicDifficultySuggestion {
  currentDifficulty: SudokuDifficulty;
  suggestedDifficulty: SudokuDifficulty;
  suggestedSize: SudokuGridSize;
  trend: 'harder' | 'easier' | 'balanced';
  reason: string;
  winRate: number; // percentage 0 - 100
  avgCompletionTime: number; // seconds
  totalGames: number;
  totalWins: number;
  skillTier: string;
  skillScore: number;
}

const STORAGE_KEY = 'arcadex_scoodoku_performance_v1';

export const DynamicDifficultyService = {
  getHistory(): GamePerformanceRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data) as GamePerformanceRecord[];
    } catch {
      return [];
    }
  },

  recordMatch(record: Omit<GamePerformanceRecord, 'id' | 'timestamp'>): void {
    try {
      const current = this.getHistory();
      const newEntry: GamePerformanceRecord = {
        ...record,
        id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      // Keep last 30 matches for clean rolling analysis
      const updated = [newEntry, ...current].slice(0, 30);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore local storage errors
    }
  },

  analyze(
    currentDifficulty: SudokuDifficulty = 'medium',
    currentSize: SudokuGridSize = '9x9'
  ): DynamicDifficultySuggestion {
    const history = this.getHistory();
    const totalGames = history.length;
    const wins = history.filter((m) => m.won);
    const totalWins = wins.length;
    const winRate = totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 50;

    // Average time across wins
    const avgCompletionTime =
      totalWins > 0
        ? Math.round(wins.reduce((acc, cur) => acc + cur.timeSpentSeconds, 0) / totalWins)
        : 180;

    // Last 5 games recent performance
    const recent = history.slice(0, 5);
    const recentWins = recent.filter((m) => m.won).length;
    const recentWinRate = recent.length > 0 ? (recentWins / recent.length) * 100 : winRate;

    // Determine Skill Tier
    let skillTier = 'Tập Sự Sudoku';
    let skillScore = 1000 + totalWins * 30 + Math.max(0, 100 - Math.floor(avgCompletionTime / 3));

    if (totalWins >= 15 && winRate >= 75) {
      skillTier = 'Đại Trí Tuệ IQ 180';
      skillScore += 500;
    } else if (totalWins >= 8 && winRate >= 65) {
      skillTier = 'Kiện Tướng Sudoku';
      skillScore += 300;
    } else if (totalWins >= 3 && winRate >= 50) {
      skillTier = 'Kỳ Thủ Thâm Niên';
      skillScore += 150;
    }

    // Evaluate Difficulty Suggestion
    // Order: easy -> medium -> hard -> expert
    const diffLevels: SudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
    const currentIndex = diffLevels.indexOf(currentDifficulty);

    let suggestedDifficulty: SudokuDifficulty = currentDifficulty;
    let suggestedSize: SudokuGridSize = currentSize;
    let trend: 'harder' | 'easier' | 'balanced' = 'balanced';
    let reason = `Độ khó hiện tại đang cân bằng tối ưu với phong độ tư duy của bạn (Tỷ lệ thắng ${winRate}%, Thời gian TB ${Math.floor(avgCompletionTime / 60)}p${avgCompletionTime % 60}s).`;

    // If enough data (at least 2 games)
    if (totalGames >= 2) {
      // PROMOTION: High win rate, fast completion, or strong recent win streak
      const isFast = avgCompletionTime < 240;
      const isDominating = recentWinRate >= 80 || (winRate >= 75 && totalGames >= 3);

      if (isDominating && isFast && currentIndex < diffLevels.length - 1) {
        suggestedDifficulty = diffLevels[currentIndex + 1];
        trend = 'harder';
        const diffNames: Record<SudokuDifficulty, string> = {
          easy: 'Dễ',
          medium: 'Vừa',
          hard: 'Khó',
          expert: 'Cực Khó (IQ 180)',
        };
        reason = `Hiệu suất vượt trội! Tỷ lệ thắng ${winRate}% cùng tốc độ giải ${Math.floor(avgCompletionTime / 60)}p${avgCompletionTime % 60}s cho thấy bạn đã thuần thục. Hệ thống đề xuất thăng cấp lên độ khó ${diffNames[suggestedDifficulty]}!`;
        if (suggestedDifficulty === 'expert' && currentSize === '9x9') {
          suggestedSize = 'staircase'; // IQ 180 Staircase
        }
      }
      // DEMOTION: Low win rate, struggling or recent losing streak
      else if (
        (recentWinRate <= 30 || winRate < 40 || (avgCompletionTime > 450 && winRate < 50)) &&
        currentIndex > 0
      ) {
        suggestedDifficulty = diffLevels[currentIndex - 1];
        trend = 'easier';
        const diffNames: Record<SudokuDifficulty, string> = {
          easy: 'Dễ (Khởi Động)',
          medium: 'Vừa',
          hard: 'Khó',
          expert: 'Cực Khó',
        };
        reason = `Các câu đố hiện tại đang khá thử thách (Tỷ lệ thắng ${winRate}%). Hệ thống khuyến nghị chuyển sang độ khó ${diffNames[suggestedDifficulty]} để lấy lại nhịp độ và củng cố chiến thuật loại trừ.`;
        if (currentSize === 'staircase' || currentSize === 'multigrid') {
          suggestedSize = '9x9';
        }
      }
    }

    return {
      currentDifficulty,
      suggestedDifficulty,
      suggestedSize,
      trend,
      reason,
      winRate,
      avgCompletionTime,
      totalGames,
      totalWins,
      skillTier,
      skillScore,
    };
  },
};
