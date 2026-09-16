import { GameConfig } from '../types';

export interface RecommendedGameItem {
  game: GameConfig;
  matchPercentage: number;
  reason: string;
  badge: {
    icon: string;
    text: string;
    colorClass: string;
  };
  score: number;
}

export function computeGameRecommendations(
  allGames: GameConfig[],
  gamesPlayedCount: Record<string, number> = {},
  recentlyPlayed: string[] = [],
  favorites: string[] = [],
  highScores: Record<string, number> = {},
  refreshOffset: number = 0
): RecommendedGameItem[] {
  // 1. Calculate category and tag preference weights
  const categoryWeights: Record<string, number> = {};
  const tagWeights: Record<string, number> = {};
  let totalPlays = 0;

  // Weight plays
  Object.entries(gamesPlayedCount).forEach(([gameId, count]) => {
    if (count <= 0) return;
    totalPlays += count;
    const game = allGames.find((g) => g.id === gameId);
    if (!game) return;

    categoryWeights[game.category] = (categoryWeights[game.category] || 0) + count * 3;
    game.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagWeights[lowerTag] = (tagWeights[lowerTag] || 0) + count * 2;
    });
  });

  // Weight favorites (strong preference)
  favorites.forEach((favId) => {
    const game = allGames.find((g) => g.id === favId);
    if (!game) return;
    categoryWeights[game.category] = (categoryWeights[game.category] || 0) + 12;
    game.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagWeights[lowerTag] = (tagWeights[lowerTag] || 0) + 8;
    });
  });

  // Weight recently played
  recentlyPlayed.forEach((recId, idx) => {
    const game = allGames.find((g) => g.id === recId);
    if (!game) return;
    const recWeight = Math.max(1, 6 - idx * 2);
    categoryWeights[game.category] = (categoryWeights[game.category] || 0) + recWeight;
    game.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase();
      tagWeights[lowerTag] = (tagWeights[lowerTag] || 0) + recWeight;
    });
  });

  // Find top played game name if any
  let topPlayedGameId: string | null = null;
  let maxPlays = 0;
  Object.entries(gamesPlayedCount).forEach(([id, cnt]) => {
    if (cnt > maxPlays) {
      maxPlays = cnt;
      topPlayedGameId = id;
    }
  });
  const topPlayedGame = topPlayedGameId ? allGames.find((g) => g.id === topPlayedGameId) : null;

  // 2. Score candidate games
  const candidates: RecommendedGameItem[] = allGames.map((game) => {
    const isFav = favorites.includes(game.id);
    const playCount = gamesPlayedCount[game.id] || 0;
    const isRecent = recentlyPlayed.includes(game.id);
    const highScore = highScores[game.id] || 0;

    let rawScore = 30; // base score

    // Category affinity
    const catWeight = categoryWeights[game.category] || 0;
    rawScore += Math.min(45, catWeight * 2);

    // Tag affinities
    let sharedTagScore = 0;
    game.tags.forEach((tag) => {
      const w = tagWeights[tag.toLowerCase()] || 0;
      sharedTagScore += w;
    });
    rawScore += Math.min(30, sharedTagScore);

    // Mechanical similarity with top played game
    if (topPlayedGame && topPlayedGame.id !== game.id) {
      if (topPlayedGame.category === game.category) {
        rawScore += 18;
      }
      const sharedTags = game.tags.filter((t) =>
        topPlayedGame.tags.some((pt) => pt.toLowerCase() === t.toLowerCase())
      );
      rawScore += sharedTags.length * 8;
    }

    // Favorite bonus
    if (isFav) {
      rawScore += 15;
    }

    // High score mastery bonus
    if (highScore > 0) {
      rawScore += 10;
    }

    // Novelty bonus (games user hasn't played yet or hasn't played today)
    if (!isRecent && playCount === 0 && (catWeight > 0 || totalPlays === 0)) {
      rawScore += 20; // Suggest something exciting in their preferred genre
    } else if (playCount > 0 && !isRecent) {
      rawScore += 14; // Revisit a game they enjoy
    }

    // Specific game mechanic correlations
    if (gamesPlayedCount['car-escape'] > 0 && ['shikaku', 'tile-2048', 'blocker'].includes(game.id)) {
      rawScore += 22;
    }
    if (gamesPlayedCount['dungeon-tap'] > 0 && ['cyber-slice', 'neon-runner', 'cosmic-defense'].includes(game.id)) {
      rawScore += 22;
    }
    if ((gamesPlayedCount['caro-gomoku'] > 0 || gamesPlayedCount['xiangqi'] > 0) && ['chess', 'xiangqi', 'caro-gomoku'].includes(game.id)) {
      rawScore += 25;
    }
    if (gamesPlayedCount['scoodoku'] > 0 && ['shikaku', 'hex-match', 'tile-2048'].includes(game.id)) {
      rawScore += 22;
    }

    // Calculate match percentage (normalize between 82% and 99%)
    const matchPercentage = Math.min(99, Math.max(82, Math.round(75 + (rawScore / 180) * 24)));

    // Generate personalized recommendation reason & badge
    let reason = 'Được gợi ý phù hợp với phong cách của bạn';
    let badge = {
      icon: '✨',
      text: 'Gợi ý hot',
      colorClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    };

    if (totalPlays === 0 && favorites.length === 0) {
      // New user recommendations
      if (game.id === 'dungeon-tap') {
        reason = 'Game nhập vai hành động nhịp độ cao được yêu thích nhất';
        badge = { icon: '👑', text: 'Top 1 Server', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      } else if (game.id === 'car-escape') {
        reason = 'Thử thách đỗ xe logic cực cuốn, dễ làm quen';
        badge = { icon: '🚗', text: 'Thịnh hành', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      } else if (game.id === 'tile-2048') {
        reason = 'Kinh điển giải đố số học thư giãn đầu óc';
        badge = { icon: '🧩', text: 'Kinh điển', colorClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      } else {
        reason = `Trải nghiệm mini-game ${game.category} hấp dẫn`;
        badge = { icon: '🔥', text: 'Đề xuất mới', colorClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      }
    } else {
      // Personalized recommendation based on user history
      if (topPlayedGame && topPlayedGame.id !== game.id && (topPlayedGame.category === game.category || game.tags.some(t => topPlayedGame.tags.includes(t)))) {
        reason = `Lối chơi tương đồng với ${topPlayedGame.title} bạn hay chơi`;
        badge = { icon: '🎯', text: `Tương tự ${topPlayedGame.title}`, colorClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      } else if (isFav) {
        reason = 'Trò chơi trong danh sách yêu thích của bạn';
        badge = { icon: '❤️', text: 'Yêu thích', colorClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      } else if (catWeight >= 15) {
        reason = `Dựa trên sở thích thể loại ${game.category} của bạn`;
        badge = { icon: '⚡', text: `Hợp gu ${game.category}`, colorClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
      } else if (playCount === 0) {
        reason = `Khám phá thử thách mới thể loại ${game.category}`;
        badge = { icon: '🌟', text: 'Chưa thử sức', colorClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      } else {
        reason = `Bạn đã chơi ${playCount} trận với điểm kỷ lục ${highScore.toLocaleString()}`;
        badge = { icon: '🏆', text: 'Kỷ lục cao', colorClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40' };
      }
    }

    return {
      game,
      matchPercentage,
      reason,
      badge,
      score: rawScore,
    };
  });

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  // Apply refresh rotation if user pressed "Làm mới gợi ý"
  const total = candidates.length;
  if (total === 0) return [];
  const normalizedOffset = refreshOffset % Math.max(1, total - 2);

  // Take a window of exactly 3 games
  const selected = candidates.slice(normalizedOffset, normalizedOffset + 3);
  if (selected.length < 3) {
    return candidates.slice(0, 3);
  }
  return selected;
}
