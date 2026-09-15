import { GameBridgeAPI, SoundEffect, DropRateConfig } from '../types';
import { soundEngine } from '../services/audio';

export interface CreateBridgeOptions {
  gameId: string;
  dropRates: DropRateConfig;
  onRecordScore: (gameId: string, score: number) => { isNewHighScore: boolean };
  onAddExp: (amount: number) => void;
  onAddCoins: (amount: number) => void;
  onAddGems: (amount: number) => void;
  onAddChest: (type: 'common' | 'rare' | 'epic' | 'legendary') => void;
  onReportAchievement: (achievementId: string, deltaOrVal: number, isAbsolute?: boolean) => void;
  onReportQuest: (questCategory: string, delta: number) => void;
  onSubmitLeaderboard: (gameId: string, score: number, extraStats?: Record<string, any>) => Promise<void>;
  getSkin: (gameId: string) => string;
  onUpdateSessionState?: (state: { score?: number; moves?: number; timeElapsed?: number; extra?: Record<string, any> }) => void;
  onRecordMove?: (count?: number) => void;
}

export function createGameBridge(opts: CreateBridgeOptions): GameBridgeAPI {
  return {
    submitScore: async (score: number, extraStats?: Record<string, number>) => {
      const { isNewHighScore } = opts.onRecordScore(opts.gameId, score);
      
      // Update quests
      opts.onReportQuest('play_any', 1);
      opts.onReportQuest('quest-score-1000', score);
      opts.onReportQuest('score_any', score);
      opts.onReportQuest(`game_score:${opts.gameId}`, score);
      opts.onReportQuest(`game_play:${opts.gameId}`, 1);
      if (extraStats && (extraStats.isWin || extraStats.won || extraStats['chess-wins'] || extraStats['xiangqi-wins'])) {
        opts.onReportQuest('win_match', 1);
      }

      // Global first game achievement
      opts.onReportAchievement('ach-first-game', 1, false);

      // Submit to leaderboard
      await opts.onSubmitLeaderboard(opts.gameId, score, extraStats);

      // Calculate EXP based on score
      const expEarned = Math.max(50, Math.floor(score / 10) + 60);
      opts.onAddExp(expEarned);

      // Calculate Arcade Coins earned based on performance
      const baseCoinsEarned = Math.max(20, Math.floor(score / 8));
      let highScoreBonusCoins = 0;

      // Extra bonus Arcade Coins for breaking personal high score
      if (isNewHighScore && score > 50) {
        highScoreBonusCoins = Math.max(50, Math.floor(score / 6));
      }

      const totalCoinsEarned = baseCoinsEarned + highScoreBonusCoins;
      opts.onAddCoins(totalCoinsEarned);

      // Calculate chest drop roll
      let droppedChest: 'common' | 'rare' | 'epic' | 'legendary' | null = null;
      if (score >= opts.dropRates.scoreThresholdForDrop) {
        if (Math.random() <= opts.dropRates.baseChestDropChance) {
          const totalWeight = opts.dropRates.chestWeights.reduce((sum, c) => sum + c.weight, 0);
          let rand = Math.random() * totalWeight;
          for (const item of opts.dropRates.chestWeights) {
            if (rand < item.weight) {
              droppedChest = item.type;
              break;
            }
            rand -= item.weight;
          }
          if (droppedChest) {
            opts.onAddChest(droppedChest);
            opts.onReportAchievement('ach-open-first-chest', 0); // trigger check
          }
        }
      }

      return {
        isNewHighScore,
        droppedChest,
        coinsEarned: totalCoinsEarned,
        highScoreBonusCoins,
        expEarned,
      };
    },

    grantExp: (amount: number) => {
      queueMicrotask(() => {
        opts.onAddExp(amount);
      });
    },

    grantCoins: (amount: number) => {
      queueMicrotask(() => {
        opts.onAddCoins(amount);
      });
    },

    grantGems: (amount: number) => {
      queueMicrotask(() => {
        opts.onAddGems(amount);
      });
    },

    reportProgress: (achievementId: string, deltaOrVal: number, isAbsolute: boolean = false) => {
      queueMicrotask(() => {
        opts.onReportAchievement(achievementId, deltaOrVal, isAbsolute);
      });
    },
    reportQuest: (questCategory: string, delta: number) => {
      queueMicrotask(() => {
        opts.onReportQuest(questCategory, delta);
      });
    },

    triggerLootRoll: (score: number) => {
      if (score < opts.dropRates.scoreThresholdForDrop) return null;
      if (Math.random() <= opts.dropRates.baseChestDropChance) {
        const totalWeight = opts.dropRates.chestWeights.reduce((sum, c) => sum + c.weight, 0);
        let rand = Math.random() * totalWeight;
        for (const item of opts.dropRates.chestWeights) {
          if (rand < item.weight) {
            opts.onAddChest(item.type);
            return item.type;
          }
          rand -= item.weight;
        }
      }
      return null;
    },

    playSound: (soundName: SoundEffect) => {
      soundEngine.play(soundName);
    },

    getEquippedSkin: () => {
      return opts.getSkin(opts.gameId);
    },

    getSkin: (gameId?: string) => {
      return opts.getSkin(gameId || opts.gameId);
    },

    saveGameState: (data: unknown) => {
      try {
        localStorage.setItem(`arcadex_gamestate_${opts.gameId}`, JSON.stringify(data));
      } catch {
        // ignore
      }
    },

    loadGameState: <T>() => {
      try {
        const item = localStorage.getItem(`arcadex_gamestate_${opts.gameId}`);
        return item ? (JSON.parse(item) as T) : null;
      } catch {
        return null;
      }
    },

    updateSessionState: (state) => {
      if (opts.onUpdateSessionState) {
        opts.onUpdateSessionState(state);
      }
    },

    recordMove: (count = 1) => {
      if (opts.onRecordMove) {
        opts.onRecordMove(count);
      }
    },
  };
}
