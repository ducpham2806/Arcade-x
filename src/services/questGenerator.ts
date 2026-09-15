import { DailyQuest, DailyQuestType } from '../types';

export interface QuestTemplate {
  id: string;
  title: string;
  description: string;
  type: DailyQuestType;
  gameId?: string;
  icon: string;
  target: number;
  rewardCoins: number;
  rewardGems: number;
  rewardExp: number;
}

/**
 * Pool of potential daily objectives.
 * Includes game-specific score objectives (e.g. 'Score 500 in Hex')
 * as well as broader arcade gameplay milestones (e.g. 'Play 3 matches').
 */
export const QUEST_POOL: QuestTemplate[] = [
  // 1. Hex Match target score (Primary user requirement)
  {
    id: 'hex-score-500',
    title: 'Thần Tài Hex Match',
    description: 'Đạt từ 500 điểm trong game Hex Match hôm nay.',
    type: 'game_score',
    gameId: 'hex-match',
    icon: '🔷',
    target: 500,
    rewardCoins: 350,
    rewardGems: 15,
    rewardExp: 150,
  },
  // 2. Play 3 matches (Primary user requirement)
  {
    id: 'play-3-matches',
    title: 'Nhiệt Huyết Arcade',
    description: 'Chơi 3 ván mini-game bất kỳ hôm nay.',
    type: 'play_matches',
    icon: '🎮',
    target: 3,
    rewardCoins: 250,
    rewardGems: 10,
    rewardExp: 120,
  },
  // 3. Cyber Slice target score
  {
    id: 'cyber-slice-400',
    title: 'Lưỡi Kiếm Siêu Âm',
    description: 'Chém hoa quả đạt 400 điểm trong Cyber Slice.',
    type: 'game_score',
    gameId: 'cyber-slice',
    icon: '🍉',
    target: 400,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 4. Neon Runner target score
  {
    id: 'neon-runner-350',
    title: 'Tốc Độ Ánh Sáng',
    description: 'Lướt đường hầm đạt 350 điểm trong Neon Runner 2099.',
    type: 'game_score',
    gameId: 'neon-runner',
    icon: '⚡',
    target: 350,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 140,
  },
  // 5. Eat 'Em All target score
  {
    id: 'eat-em-all-600',
    title: 'Quái Thú Háu Ăn',
    description: 'Nuốt chửng đạt 600 điểm trong game Eat \'Em All.',
    type: 'game_score',
    gameId: 'eat-em-all',
    icon: '👾',
    target: 600,
    rewardCoins: 350,
    rewardGems: 15,
    rewardExp: 150,
  },
  // 6. Cosmic Defense target score
  {
    id: 'cosmic-defense-400',
    title: 'Phòng Tuyến Ngân Hà',
    description: 'Bảo vệ căn cứ đạt 400 điểm trong Cosmic Defense.',
    type: 'game_score',
    gameId: 'cosmic-defense',
    icon: '🚀',
    target: 400,
    rewardCoins: 320,
    rewardGems: 14,
    rewardExp: 140,
  },
  // 7. Tile 2048 target score
  {
    id: 'tile-2048-512',
    title: 'Thiên Tài Số Học',
    description: 'Ghép khối đạt 512 điểm trong Tile 2048 Neon.',
    type: 'game_score',
    gameId: 'tile-2048',
    icon: '🔢',
    target: 512,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 8. Dungeon Tap target score
  {
    id: 'dungeon-tap-350',
    title: 'Chinh Phục Hầm Ngục',
    description: 'Vượt ải quái vật đạt 350 điểm trong Dungeon Tap.',
    type: 'game_score',
    gameId: 'dungeon-tap',
    icon: '🗡️',
    target: 350,
    rewardCoins: 320,
    rewardGems: 14,
    rewardExp: 140,
  },
  // 9. Blocker 10x10 target score
  {
    id: 'blocker-400',
    title: 'Kỹ Sư Xếp Khối',
    description: 'Xếp hình khối đạt 400 điểm trong Blocker 10x10.',
    type: 'game_score',
    gameId: 'blocker',
    icon: '🧱',
    target: 400,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 10. Shikaku Master target score
  {
    id: 'shikaku-300',
    title: 'Trí Tuệ Shikaku',
    description: 'Giải đố chữ nhật đạt 300 điểm trong Shikaku Master.',
    type: 'game_score',
    gameId: 'shikaku',
    icon: '📐',
    target: 300,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 11. Mummy Escape target score
  {
    id: 'mummy-escape-250',
    title: 'Thám Hiểm Kim Tự Tháp',
    description: 'Thoát khỏi hầm mộ đạt 250 điểm trong Mummy Escape.',
    type: 'game_score',
    gameId: 'mummy-escape',
    icon: '🏺',
    target: 250,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 12. Fill The Space target score
  {
    id: 'fill-space-300',
    title: 'Lấp Đầy Không Gian',
    description: 'Lấp đầy các ô trống đạt 300 điểm trong Fill The Space.',
    type: 'game_score',
    gameId: 'fill-the-space',
    icon: '🧩',
    target: 300,
    rewardCoins: 300,
    rewardGems: 12,
    rewardExp: 130,
  },
  // 13. Total score: 1000 points
  {
    id: 'total-score-1000',
    title: 'Thợ Săn Điểm Số',
    description: 'Đạt tổng cộng 1,000 điểm trên tất cả các mini-game.',
    type: 'total_score',
    icon: '🏆',
    target: 1000,
    rewardCoins: 400,
    rewardGems: 18,
    rewardExp: 180,
  },
  // 14. Total score: 2000 points
  {
    id: 'total-score-2000',
    title: 'Kỷ Lục Gia Huyền Thoại',
    description: 'Đạt tổng cộng 2,000 điểm tích lũy trong ngày.',
    type: 'total_score',
    icon: '👑',
    target: 2000,
    rewardCoins: 550,
    rewardGems: 25,
    rewardExp: 250,
  },
  // 15. Win 1 match
  {
    id: 'win-1-match',
    title: 'Vinh Quang Chiến Thắng',
    description: 'Giành chiến thắng 1 ván đấu (PvP hoặc đấu với AI).',
    type: 'win_match',
    icon: '⚔️',
    target: 1,
    rewardCoins: 300,
    rewardGems: 15,
    rewardExp: 150,
  },
  // 16. Open 1 chest
  {
    id: 'open-1-chest',
    title: 'Thợ Mở Kho Báu',
    description: 'Mở 1 rương báu bất kỳ để tìm kiếm trang bị mới.',
    type: 'open_chest',
    icon: '📦',
    target: 1,
    rewardCoins: 250,
    rewardGems: 12,
    rewardExp: 120,
  },
  // 17. Craft 1 item
  {
    id: 'craft-1-item',
    title: 'Nghệ Nhân Lò Rèn',
    description: 'Rèn hoặc ghép thành công 1 trang bị trong Lò Rèn.',
    type: 'craft_item',
    icon: '🔨',
    target: 1,
    rewardCoins: 250,
    rewardGems: 12,
    rewardExp: 120,
  },
  // 18. Play 5 matches
  {
    id: 'play-5-matches',
    title: 'Game Thủ Siêu Cấp',
    description: 'Chơi 5 ván mini-game bất kỳ hôm nay.',
    type: 'play_matches',
    icon: '🔥',
    target: 5,
    rewardCoins: 450,
    rewardGems: 20,
    rewardExp: 200,
  },
];

/**
 * Automated Daily Quest Generator.
 * Selects 3 distinct random objectives from the pool with balanced distribution:
 * (at least one game-specific score objective and at least one general gameplay/meta objective).
 */
export class QuestGeneratorService {
  /**
   * Generates 3 random objectives from QUEST_POOL
   */
  public static generate3RandomQuests(): DailyQuest[] {
    const pool = [...QUEST_POOL];
    
    // Separate into game-specific score quests and general quests to guarantee balanced variety
    const gameScoreQuests = pool.filter((q) => q.type === 'game_score');
    const generalQuests = pool.filter((q) => q.type !== 'game_score');

    // Shuffle arrays
    const shuffledScore = [...gameScoreQuests].sort(() => Math.random() - 0.5);
    const shuffledGeneral = [...generalQuests].sort(() => Math.random() - 0.5);

    const selectedTemplates: QuestTemplate[] = [];

    // Pick 1 or 2 game-score quests
    const scoreCount = Math.random() > 0.5 ? 2 : 1;
    const generalCount = 3 - scoreCount;

    for (let i = 0; i < scoreCount && shuffledScore.length > 0; i++) {
      const item = shuffledScore.pop();
      if (item) selectedTemplates.push(item);
    }

    for (let i = 0; i < generalCount && shuffledGeneral.length > 0; i++) {
      const item = shuffledGeneral.pop();
      if (item) selectedTemplates.push(item);
    }

    // If still less than 3, fill from remaining
    const remaining = [...shuffledScore, ...shuffledGeneral].sort(() => Math.random() - 0.5);
    while (selectedTemplates.length < 3 && remaining.length > 0) {
      const nextItem = remaining.pop();
      if (nextItem && !selectedTemplates.some((t) => t.id === nextItem.id)) {
        selectedTemplates.push(nextItem);
      }
    }

    // Map templates to active DailyQuest instances
    return selectedTemplates.map((template, idx) => ({
      id: `daily-quest-${template.id}-${Date.now().toString(36)}-${idx}`,
      title: template.title,
      description: template.description,
      gameId: template.gameId,
      type: template.type,
      icon: template.icon,
      target: template.target,
      current: 0,
      completed: false,
      claimed: false,
      rewardCoins: template.rewardCoins,
      rewardGems: template.rewardGems,
      rewardExp: template.rewardExp,
    }));
  }

  /**
   * Returns all available templates in the objective pool
   */
  public static getPoolTemplates(): QuestTemplate[] {
    return QUEST_POOL;
  }
}
