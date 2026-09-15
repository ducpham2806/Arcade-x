import { HEX_LEVELS } from './levels';

export interface LevelLeaderboardEntry {
  rank: number;
  playerName: string;
  avatar: string;
  score: number;
  date: string;
  isCurrentPlayer?: boolean;
}

// Preset bot avatars and names for realistic competition
const RIVAL_BOTS = [
  { name: 'Kẹo Thủ Neon', avatar: '🍬' },
  { name: 'SugarQueen_99', avatar: '👑' },
  { name: 'BánhBao_Pro', avatar: '🧁' },
  { name: 'ChocoMaster', avatar: '🍫' },
  { name: 'GấuDẻoBắcCực', avatar: '🐻' },
  { name: 'HexKing_VN', avatar: '⚡' },
  { name: 'SweetLegend', avatar: '🍭' },
  { name: 'RainbowNova', avatar: '🌈' },
];

export function getLevelLeaderboard(levelId: number): LevelLeaderboardEntry[] {
  const level = HEX_LEVELS.find((l) => l.id === levelId) || HEX_LEVELS[0];
  const baseTargetScore = level.stars[2] || 3500;

  // Retrieve user's high score for this level if saved
  let userScore = 0;
  let userName = 'Bạn';
  let userAvatar = '😎';

  try {
    const savedLevelScores = localStorage.getItem('arcadex_hex_level_scores');
    if (savedLevelScores) {
      const parsed = JSON.parse(savedLevelScores);
      userScore = parsed[levelId] || 0;
    }
    const profileStr = localStorage.getItem('arcadex_player_profile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      userName = profile.username || 'Bạn';
      userAvatar = profile.avatar || '😎';
    }
  } catch {}

  // Generate deterministic rival scores based on levelId
  const bot1 = RIVAL_BOTS[(levelId * 3) % RIVAL_BOTS.length];
  const bot2 = RIVAL_BOTS[(levelId * 5 + 1) % RIVAL_BOTS.length];
  const bot3 = RIVAL_BOTS[(levelId * 7 + 2) % RIVAL_BOTS.length];

  const score1 = Math.round(baseTargetScore * (1.25 + ((levelId * 17) % 20) / 100));
  const score2 = Math.round(baseTargetScore * (1.12 + ((levelId * 13) % 15) / 100));
  const score3 = Math.round(baseTargetScore * (1.02 + ((levelId * 11) % 12) / 100));

  const entries: { playerName: string; avatar: string; score: number; date: string; isCurrentPlayer?: boolean }[] = [
    { playerName: bot1.name, avatar: bot1.avatar, score: score1, date: 'Gần đây' },
    { playerName: bot2.name, avatar: bot2.avatar, score: score2, date: 'Gần đây' },
    { playerName: bot3.name, avatar: bot3.avatar, score: score3, date: 'Gần đây' },
  ];

  if (userScore > 0) {
    entries.push({
      playerName: userName,
      avatar: userAvatar,
      score: userScore,
      date: 'Hôm nay',
      isCurrentPlayer: true,
    });
  }

  // Sort descending by score
  entries.sort((a, b) => b.score - a.score);

  // Return top 3 with assigned ranks
  return entries.slice(0, 3).map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

export function saveLevelScore(levelId: number, score: number): void {
  try {
    const savedLevelScores = localStorage.getItem('arcadex_hex_level_scores');
    const parsed = savedLevelScores ? JSON.parse(savedLevelScores) : {};
    if (!parsed[levelId] || score > parsed[levelId]) {
      parsed[levelId] = score;
      localStorage.setItem('arcadex_hex_level_scores', JSON.stringify(parsed));
    }
  } catch {}
}
