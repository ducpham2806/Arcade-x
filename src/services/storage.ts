import {
  InventoryItem,
  PlayerProfile,
  PlayerStats,
  Achievement,
  DailyQuest,
  LeaderboardEntry,
  ChestTypeInfo,
  Rarity,
  DailyLoginRewardItem,
  DailyChallenge,
  ForgeMasteryState,
  PausedGameSession,
  LegendaryBlueprint,
  RecipeDiscoveryLogEntry,
  DailyResetTimer,
  Friend,
  FriendChallenge,
  WeeklyQuest,
  WeeklyMilestoneReward,
  WeeklyResetTimer,
  MatchHistoryItem,
} from '../types';
import { QuestGeneratorService } from './questGenerator';
import { DEFAULT_LEGENDARY_BLUEPRINTS } from '../data/legendaryBlueprints';

const STORAGE_KEYS = {
  PROFILE: 'arcadex_player_profile',
  INVENTORY: 'arcadex_inventory',
  ACHIEVEMENTS: 'arcadex_achievements',
  DAILY_QUESTS: 'arcadex_daily_quests',
  LAST_QUEST_DATE: 'arcadex_last_quest_date',
  LEADERBOARD: 'arcadex_leaderboard_custom',
  SOUND_MUTED: 'arcadex_sound_muted',
  FAVORITES: 'arcadex_favorite_games_v1',
  RECENT_GAMES: 'arcadex_recently_played_games_v1',
  DAILY_CHALLENGE: 'arcadex_daily_challenge_blocker_v2',
  ALL_DAILY_CHALLENGES: 'arcadex_all_daily_challenges_v3',
  FORGE_MASTERY: 'arcadex_forge_mastery_v1',
  PAUSED_GAME: 'arcadex_paused_game_session_v1',
  BLUEPRINTS: 'arcadex_legendary_blueprints_v1',
  DISCOVERY_LOG: 'arcadex_recipe_discovery_log_v1',
  DAILY_LEADERBOARDS: 'arcadex_daily_leaderboards_v2',
  ONBOARDING_COMPLETED: 'arcadex_onboarding_completed_v1',
  FRIENDS_LIST: 'arcadex_friends_list_v2',
  WEEKLY_QUESTS: 'arcadex_weekly_quests_v2',
  WEEKLY_QUEST_WEEK_KEY: 'arcadex_weekly_quest_week_key_v2',
  WEEKLY_MILESTONES: 'arcadex_weekly_milestones_v2',
  MATCH_HISTORY: 'arcadex_match_history_v1',
};

export const CHEST_TYPES: Record<'common' | 'rare' | 'epic' | 'legendary', ChestTypeInfo> = {
  common: {
    id: 'common',
    name: 'Rương Đồng Cổ Điển',
    color: '#38bdf8', // sky
    glowColor: 'rgba(56, 189, 248, 0.4)',
    borderClass: 'border-sky-500/50 shadow-sky-500/20',
    bgGradient: 'from-sky-950/60 to-slate-900/90',
    minCoins: 50,
    maxCoins: 150,
    minGems: 1,
    maxGems: 5,
    itemDropChance: 0.35,
    possibleRarities: [
      { rarity: 'common', weight: 65 },
      { rarity: 'uncommon', weight: 25 },
      { rarity: 'rare', weight: 10 },
    ],
  },
  rare: {
    id: 'rare',
    name: 'Rương Bạc Neon',
    color: '#818cf8', // indigo
    glowColor: 'rgba(129, 140, 248, 0.5)',
    borderClass: 'border-indigo-500/50 shadow-indigo-500/25',
    bgGradient: 'from-indigo-950/60 to-slate-900/90',
    minCoins: 150,
    maxCoins: 400,
    minGems: 5,
    maxGems: 15,
    itemDropChance: 0.65,
    possibleRarities: [
      { rarity: 'uncommon', weight: 35 },
      { rarity: 'rare', weight: 45 },
      { rarity: 'epic', weight: 20 },
    ],
  },
  epic: {
    id: 'epic',
    name: 'Rương Vàng Cyberpunk',
    color: '#c084fc', // purple
    glowColor: 'rgba(192, 132, 252, 0.6)',
    borderClass: 'border-purple-500/50 shadow-purple-500/30',
    bgGradient: 'from-purple-950/70 to-slate-900/90',
    minCoins: 400,
    maxCoins: 1000,
    minGems: 15,
    maxGems: 40,
    itemDropChance: 0.85,
    possibleRarities: [
      { rarity: 'rare', weight: 30 },
      { rarity: 'epic', weight: 45 },
      { rarity: 'legendary', weight: 20 },
      { rarity: 'mythic', weight: 5 },
    ],
  },
  legendary: {
    id: 'legendary',
    name: 'Rương Thần Thoại ArcadeX',
    color: '#f59e0b', // amber
    glowColor: 'rgba(245, 158, 11, 0.7)',
    borderClass: 'border-amber-500/60 shadow-amber-500/40',
    bgGradient: 'from-amber-950/70 to-slate-900/90',
    minCoins: 1000,
    maxCoins: 2500,
    minGems: 40,
    maxGems: 100,
    itemDropChance: 1.0,
    possibleRarities: [
      { rarity: 'legendary', weight: 45 },
      { rarity: 'mythic', weight: 30 },
      { rarity: 'relic', weight: 15 },
      { rarity: 'masterwork', weight: 8 },
      { rarity: 'eternal', weight: 2 },
    ],
  },
};

export const ALL_DEFAULT_ITEMS: InventoryItem[] = [
  // ==========================================
  // CONSUMABLES (SCROLLS)
  // ==========================================
  {
    id: 'scroll-basic',
    name: 'Cuộn Giấy Rèn Sơ Cấp',
    type: 'consumable',
    rarity: 'rare',
    description: 'Tăng 10% tỷ lệ dung hợp thành công',
    bonusDescription: '+10% Thành Công',
    bonusValue: 10,
    icon: '📜',
    count: 5,
    unlockedAt: Date.now(),
  },
  {
    id: 'scroll-medium',
    name: 'Cuộn Giấy Rèn Trung Cấp',
    type: 'consumable',
    rarity: 'epic',
    description: 'Tăng 25% tỷ lệ dung hợp thành công',
    bonusDescription: '+25% Thành Công',
    bonusValue: 25,
    icon: '🧧',
    count: 2,
    unlockedAt: Date.now(),
  },
  {
    id: 'scroll-advanced',
    name: 'Cuộn Giấy Rèn Cao Cấp',
    type: 'consumable',
    rarity: 'legendary',
    description: 'Tăng 50% tỷ lệ dung hợp thành công',
    bonusDescription: '+50% Thành Công',
    bonusValue: 50,
    icon: '🎫',
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'scroll-mythic',
    name: 'Cuộn Giấy Rèn Thần Thoại',
    type: 'consumable',
    rarity: 'mythic',
    description: 'Tăng 75% tỷ lệ dung hợp thành công và tăng cường phẩm chất rèn',
    bonusDescription: '+75% Thành Công',
    bonusValue: 75,
    icon: '📜✨',
    count: 0,
    unlockedAt: Date.now(),
  },
  {
    id: 'scroll-relic',
    name: 'Cuộn Giấy Cổ Vật Tối Thượng',
    type: 'consumable',
    rarity: 'relic',
    description: 'Tuyệt kỹ rèn thần thánh: Đảm bảo 100% dung hợp thành công và kích hoạt bạo kích rèn',
    bonusDescription: '+100% Thành Công (Tuyệt Đối)',
    bonusValue: 100,
    icon: '🌟📜',
    count: 0,
    unlockedAt: Date.now(),
  },
  // ==========================================
  // TIER 1: COMMON ( C ) - #FDFEFE
  // ==========================================
  {
    id: 'skin-runner-default',
    name: 'Cyber Runner Gốc',
    type: 'skin',
    rarity: 'common',
    description: 'Trang phục thể thao phản quang tiêu chuẩn của cư dân Neon City.',
    icon: '🏃',
    gameId: 'neon-runner',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'skin-ship-viper',
    name: 'Viper Scout Mk-1',
    type: 'skin',
    rarity: 'common',
    description: 'Phi thuyền tiêm kích cơ bản trang bị súng laser kép tốc độ cao.',
    icon: '🚀',
    gameId: 'cosmic-defense',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'skin-blade-laser',
    name: 'Kiếm Laser Xanh Lam',
    type: 'skin',
    rarity: 'common',
    description: 'Thanh katana ánh sáng tiêu chuẩn tạo vệt cắt mượt mà.',
    icon: '🗡️',
    gameId: 'cyber-slice',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'weapon-dungeon-iron',
    name: 'Kiếm Thép Hiệp Sĩ',
    type: 'weapon',
    rarity: 'common',
    description: 'Vũ khí sắt vững chắc giúp bạn vượt qua những tầng hầm đầu tiên.',
    icon: '⚔️',
    gameId: 'dungeon-tap',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'avatar-pixel-hero',
    name: 'Pixel Hero',
    type: 'avatar',
    rarity: 'common',
    description: 'Avatar anh hùng 8-bit đại diện cho game thủ khởi đầu.',
    icon: '👾',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'title-novice',
    name: 'Tân Binh Arcade',
    type: 'title',
    rarity: 'common',
    description: 'Danh hiệu dành cho những người bắt đầu hành trình tại ArcadeX.',
    icon: '🔰',
    equipped: true,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'mat-cyber-alloy',
    name: 'Hợp Kim Cyber Titan',
    type: 'material',
    rarity: 'common',
    description: 'Nguyên liệu kết cấu siêu bền dùng trong lò rèn để chế tạo và nâng cấp trang bị.',
    icon: '🔩',
    count: 15,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 2: UNCOMMON ( U ) - #27AE60
  // ==========================================
  {
    id: 'skin-runner-emerald',
    name: 'Giáp Sinh Tồn Emerald',
    type: 'skin',
    rarity: 'uncommon',
    description: 'Bộ giáp tăng sinh lực từ sợi sinh học tinh thể ngọc bích.',
    icon: '🎽',
    gameId: 'neon-runner',
    bonusDescription: '+5% Tốc độ di chuyển',
    bonusValue: 0.05,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'skin-ship-mantis',
    name: 'Tàu Trinh Sát Độc Tố Mantis',
    type: 'skin',
    rarity: 'uncommon',
    description: 'Phi thuyền nhanh nhẹn phủ lớp giáp xanh lá kháng độc.',
    icon: '🛸',
    gameId: 'cosmic-defense',
    bonusDescription: '+8% Tốc độ bay',
    bonusValue: 0.08,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'skin-blade-emerald',
    name: 'Song Đao Lục Bảo',
    type: 'skin',
    rarity: 'uncommon',
    description: 'Vũ khí chém tinh gọn tỏa ánh hào quang xanh lá.',
    icon: '🔪',
    gameId: 'cyber-slice',
    bonusDescription: '+5% Điểm chém',
    bonusValue: 0.05,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-forest',
    name: 'Kiếm Rừng Rậm Cổ Thụ',
    type: 'weapon',
    rarity: 'uncommon',
    description: 'Thanh gươm rèn từ lõi gỗ thần ngàn năm.',
    icon: '🗡️',
    gameId: 'dungeon-tap',
    bonusDescription: '+12 Sát thương vật lý',
    bonusValue: 12,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-emerald-ranger',
    name: 'Diệp Lục Dũng Sĩ',
    type: 'avatar',
    rarity: 'uncommon',
    description: 'Chiến binh bảo vệ thung lũng ngọc lục bảo.',
    icon: '🧝',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-forest-stalker',
    name: 'Thợ Săn Rừng Xanh',
    type: 'title',
    rarity: 'uncommon',
    description: 'Dành cho những thợ săn bóng đêm kiên cường.',
    icon: '🍃',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'mat-emerald-crystal',
    name: 'Tinh Thể Ngọc Lục Bảo',
    type: 'material',
    rarity: 'uncommon',
    description: 'Tinh thể khoáng thạch màu xanh lá dùng để nâng cấp vật phẩm cấp Đặc Biệt.',
    icon: '🧪',
    count: 10,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 3: RARE ( R ) - #2471A3
  // ==========================================
  {
    id: 'skin-runner-phantom',
    name: 'Bóng Ma Tím Neon',
    type: 'skin',
    rarity: 'rare',
    description: 'Phát ra tàn ảnh màu tím huyền ảo khi chạy và tăng 10% điểm combo.',
    icon: '⚡',
    gameId: 'neon-runner',
    bonusDescription: '+10% Điểm Combo',
    bonusValue: 0.1,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-cyber-samurai',
    name: 'Cyber Samurai 2099',
    type: 'avatar',
    rarity: 'rare',
    description: 'Chiến binh võ sĩ đạo công nghệ cao trong thế giới tương lai.',
    icon: '🥷',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-space-pilot',
    name: 'Chỉ Huy Không Gian',
    type: 'avatar',
    rarity: 'rare',
    description: 'Phi công vũ trụ kỳ cựu của hạm đội phòng thủ thiên hà.',
    icon: '👨‍🚀',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-speed-demon',
    name: 'Ma Tốc Độ Cyber',
    type: 'title',
    rarity: 'rare',
    description: 'Dành cho những ai vượt qua 1500m trong Neon Runner.',
    icon: '⚡',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'boost-exp-potion',
    name: 'Bình EXP Siêu Cấp',
    type: 'boost',
    rarity: 'rare',
    description: 'Bình dược ma thuật giúp tăng 50% lượng EXP nhận được sau mỗi trận đấu.',
    icon: '🧪',
    bonusDescription: '+50% EXP Thưởng',
    bonusValue: 0.5,
    count: 3,
    unlockedAt: Date.now(),
  },
  {
    id: 'mat-mana-crystal',
    name: 'Pha Lê Năng Lượng Neon',
    type: 'material',
    rarity: 'rare',
    description: 'Kết tinh tinh thể phát quang mang nguồn năng lượng ánh sáng dồi dào.',
    icon: '💎',
    count: 8,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 4: EPIC ( E ) - #7D3C98
  // ==========================================
  {
    id: 'skin-ship-phoenix',
    name: 'Phượng Hoàng Lửa Plasma',
    type: 'skin',
    rarity: 'epic',
    description: 'Động cơ phản lực plasma tăng tốc độ di chuyển và đạn chùm rực lửa.',
    icon: '🔥',
    gameId: 'cosmic-defense',
    bonusDescription: '+15% Tốc Độ Bắn',
    bonusValue: 0.15,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'skin-blade-dragon',
    name: 'Long Đao Hỏa Thần',
    type: 'skin',
    rarity: 'epic',
    description: 'Để lại vệt lửa rồng cuộn và tăng thời gian Fever Mode.',
    icon: '🐉',
    gameId: 'cyber-slice',
    bonusDescription: '+20% Thời Gian Cuồng Nộ',
    bonusValue: 0.2,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-galaxy-defender',
    name: 'Đấng Cứu Thế Vũ Trụ',
    type: 'title',
    rarity: 'epic',
    description: 'Hạ gục Hạm trưởng Boss trong Cosmic Defense.',
    icon: '🌌',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'boost-score-multiplier',
    name: 'Bùa Bội Số Điểm Arcade',
    type: 'boost',
    rarity: 'epic',
    description: 'Tăng 25% tổng điểm số đạt được trong tất cả mini-game.',
    icon: '⚡',
    bonusDescription: '+25% Điểm Kỷ Lục',
    bonusValue: 0.25,
    count: 2,
    unlockedAt: Date.now(),
  },
  {
    id: 'mat-rune-fragment',
    name: 'Mảnh Cổ Ngữ Cổ Đại',
    type: 'material',
    rarity: 'epic',
    description: 'Tàn tích khắc chạm ma thuật cổ xưa dùng để dung hợp vật phẩm cao cấp.',
    icon: '📜',
    count: 5,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 5: LEGENDARY ( L ) - #F1C40F
  // ==========================================
  {
    id: 'skin-runner-overdrive',
    name: 'Overdrive Cyber Lord',
    type: 'skin',
    rarity: 'legendary',
    description: 'Bộ giáp Cyberpunk phát sáng rực rỡ với hiệu ứng tia sét lượng tử.',
    icon: '👑',
    gameId: 'neon-runner',
    bonusDescription: '+25% Điểm Thưởng & Khiên Ban Đầu',
    bonusValue: 0.25,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'skin-ship-apex',
    name: 'Apex Star Destroyer',
    type: 'skin',
    rarity: 'legendary',
    description: 'Chiến hạm hạm đội liên ngân hà với hiệu ứng laser chùm siêu cấp.',
    icon: '🛸',
    gameId: 'cosmic-defense',
    bonusDescription: '+1 Bom EMP khởi đầu',
    bonusValue: 1,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-runic',
    name: 'Thần Kiếm Runic',
    type: 'weapon',
    rarity: 'legendary',
    description: 'Thanh kiếm cổ ngữ ma thuật gây sát thương chí mạng 200%.',
    icon: '✨',
    gameId: 'dungeon-tap',
    bonusDescription: '+35% Sát Thương Chí Mạng',
    bonusValue: 0.35,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-mecha-overlord',
    name: 'Robot Chiến Binh Titan',
    type: 'avatar',
    rarity: 'legendary',
    description: 'Chiến giáp cơ khí tối tân đại diện cho game thủ cấp thần.',
    icon: '🤖',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-arcade-legend',
    name: 'Huyền Thoại Vô Song',
    type: 'title',
    rarity: 'legendary',
    description: 'Danh hiệu tối thượng dành cho bậc thầy thống trị tất cả mini-game.',
    icon: '👑',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-daily-streak-master',
    name: 'Huyền Thoại Đăng Nhập',
    type: 'title',
    rarity: 'legendary',
    description: 'Danh hiệu danh giá nhận được khi hoàn thành trọn vẹn chuỗi điểm danh 7 ngày liên tiếp.',
    icon: '👑',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'boost-lucky-charm',
    name: 'Bùa May Mắn Thần Tài',
    type: 'boost',
    rarity: 'legendary',
    description: 'Tăng 30% tỷ lệ mở khóa vật phẩm quý hiếm từ tất cả rương báu.',
    icon: '🧿',
    bonusDescription: '+30% Tỷ Lệ Rơi Đồ Quý',
    bonusValue: 0.3,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'mat-astral-core',
    name: 'Lõi Lượng Tử Tinh Tú',
    type: 'material',
    rarity: 'legendary',
    description: 'Lõi năng lượng vũ trụ siêu cấp dùng để kích hoạt các bảo vật cấp Huyền Thoại.',
    icon: '⚛️',
    count: 2,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 6: MYTHIC ( M ) - #D35400
  // ==========================================
  {
    id: 'skin-runner-inferno',
    name: 'Chiến Giáp Hỏa Ngục Diệt Thế',
    type: 'skin',
    rarity: 'mythic',
    description: 'Giáp lửa thiêu đốt mặt đất tạo vệt dung nham bất hoại khi lướt.',
    icon: '🌋',
    gameId: 'neon-runner',
    bonusDescription: '+35% Điểm Thưởng & Kháng Va Chạm 1 Lần',
    bonusValue: 0.35,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-asura',
    name: 'Hỏa Long Trảm Thánh Đao',
    type: 'weapon',
    rarity: 'mythic',
    description: 'Tuyệt thế ma đao phong ấn linh hồn Viêm Long nghìn năm.',
    icon: '🗡️',
    gameId: 'dungeon-tap',
    bonusDescription: '+60 Sát Thương Lửa Hỗn Mang',
    bonusValue: 60,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-asura-god',
    name: 'Hỏa Thần Asura',
    type: 'avatar',
    rarity: 'mythic',
    description: 'Hóa thân của thần chiến tranh rực lửa.',
    icon: '👺',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-flame-emperor',
    name: 'Bạo Chúa Rực Lửa',
    type: 'title',
    rarity: 'mythic',
    description: 'Kẻ ngự trị ngọn lửa thiêng bất diệt của thần giới.',
    icon: '🔥',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'mat-magma-heart',
    name: 'Trái Tim Dung Nham Hỗn Mang',
    type: 'material',
    rarity: 'mythic',
    description: 'Nguyên liệu Thần Thoại nung nấu từ tâm tinh cầu lửa.',
    icon: '🔮',
    count: 1,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 7: RELIC ( Re ) - #7B241C
  // ==========================================
  {
    id: 'skin-ship-bloodstone',
    name: 'Hạm Đội Huyết Tế Cổ Đại',
    type: 'skin',
    rarity: 'relic',
    description: 'Chiến hạm di tích nghìn năm hấp thụ năng lượng sinh mệnh kẻ thù.',
    icon: '🩸',
    gameId: 'cosmic-defense',
    bonusDescription: '+40% Sát Thương Đạn Huyết Thạch',
    bonusValue: 0.4,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-bloodstone',
    name: 'Huyết Kiếm Bloodstone Thánh Tích',
    type: 'weapon',
    rarity: 'relic',
    description: 'Cổ kiếm rèn từ máu rồng cổ đại và đá đỏ Bloodstone.',
    icon: '⚔️',
    gameId: 'dungeon-tap',
    bonusDescription: '+85 Sát Thương Hút Máu',
    bonusValue: 85,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-blood-monarch',
    name: 'Huyết Ma Đế Vương',
    type: 'avatar',
    rarity: 'relic',
    description: 'Vương tôn huyết tộc thức tỉnh từ giấc ngủ ngàn năm.',
    icon: '🧛',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-relic-awakener',
    name: 'Kẻ Thức Tỉnh Thánh Tích',
    type: 'title',
    rarity: 'relic',
    description: 'Chủ nhân mở khóa được cổ vật thất truyền của thế giới ngầm.',
    icon: '🏺',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'mat-blood-ruby',
    name: 'Tàn Tích Huyết Ngọc Ngàn Năm',
    type: 'material',
    rarity: 'relic',
    description: 'Ngọc huyết cổ đại chứa đựng phong ấn thần thánh nghìn năm tuổi.',
    icon: '🔴',
    count: 1,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 8: MASTERWORK ( Ma ) - #B3CA1F
  // ==========================================
  {
    id: 'skin-runner-masterwork',
    name: 'Giáp Công Nghệ Tinh Hoa Alpha',
    type: 'skin',
    rarity: 'masterwork',
    description: 'Kiệt tác chế tác đỉnh cao từ kim loại hiếm Electrum Thái Dương.',
    icon: '🦾',
    gameId: 'neon-runner',
    bonusDescription: '+50% Tốc Độ & Nhân Đôi Tiền Thưởng',
    bonusValue: 0.5,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-masterwork',
    name: 'Tuyệt Tác Vô Cực Trảm Kiếm',
    type: 'weapon',
    rarity: 'masterwork',
    description: 'Vũ khí hoàn mỹ đến từng vi phân tử, chém xuyên không gian.',
    icon: '🗡️',
    gameId: 'dungeon-tap',
    bonusDescription: '+120 Sát Thương Tuyệt Đối',
    bonusValue: 120,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-master-artisan',
    name: 'Đại Sư Chế Tác Cyber',
    type: 'avatar',
    rarity: 'masterwork',
    description: 'Bậc thầy công nghệ chế tác nên những kiệt tác tối thượng.',
    icon: '🧙‍♂️',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-masterwork-artisan',
    name: 'Bậc Thầy Tuyệt Tác',
    type: 'title',
    rarity: 'masterwork',
    description: 'Danh hiệu vinh danh người thợ rèn đạt tới cảnh giới tuyệt mỹ.',
    icon: '🎖️',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'mat-solar-gold',
    name: 'Thỏi Vàng Thái Dương Masterwork',
    type: 'material',
    rarity: 'masterwork',
    description: 'Kim loại nguyên chất cô đặc từ ánh sáng thái dương.',
    icon: '🪙',
    count: 1,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // TIER 9: ETERNAL ( Et ) - #DC2367
  // ==========================================
  {
    id: 'skin-ship-eternal',
    name: 'Siêu Hạm Vạn Giới Eternal',
    type: 'skin',
    rarity: 'eternal',
    description: 'Chiến hạm siêu vũ trụ sở hữu sức mạnh xuyên không gian thời gian bất diệt.',
    icon: '🌌',
    gameId: 'cosmic-defense',
    bonusDescription: '+100% Sức Mạnh & Bất Hoại Vĩnh Hằng',
    bonusValue: 1.0,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'weapon-dungeon-eternal',
    name: 'Thiên Mệnh Vĩnh Cửu Kiếm',
    type: 'weapon',
    rarity: 'eternal',
    description: 'Bảo kiếm tồn tại vĩnh hằng cùng vũ trụ, ngự trị toàn bộ định mệnh.',
    icon: '⚔️',
    gameId: 'dungeon-tap',
    bonusDescription: '+200 Sát Thương Thần Thánh & Trảm Sát',
    bonusValue: 200,
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'avatar-eternal-deity',
    name: 'Đấng Tạo Hóa Vô Biên',
    type: 'avatar',
    rarity: 'eternal',
    description: 'Hiện thân của quyền năng vĩnh hằng chi phối vạn vật.',
    icon: '✨',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'title-eternal-sovereign',
    name: 'Chí Tôn Bất Diệt Vĩnh Hằng',
    type: 'title',
    rarity: 'eternal',
    description: 'Danh hiệu tối thượng duy nhất khẳng định vị thế bất diệt.',
    icon: '👑',
    count: 0,
    unlockedAt: 0,
  },
  {
    id: 'boost-eternal-elixir',
    name: 'Thánh Dược Vĩnh Sinh Eternal',
    type: 'boost',
    rarity: 'eternal',
    description: 'Bình dược tinh hoa đa vũ trụ tăng gấp 3 toàn bộ tài nguyên nhận được.',
    icon: '💖',
    bonusDescription: '+200% Vàng, EXP và Điểm Kỷ Lục',
    bonusValue: 2.0,
    count: 1,
    unlockedAt: Date.now(),
  },
  {
    id: 'mat-eternal-essence',
    name: 'Tinh Hoa Vĩnh Hằng Đa Vũ Trụ',
    type: 'material',
    rarity: 'eternal',
    description: 'Nguyên chất năng lượng tạo nên sự sống của đa vũ trụ.',
    icon: '💎',
    count: 1,
    unlockedAt: Date.now(),
  },

  // ==========================================
  // HELMET SLOT ITEMS (Mũ/Nón)
  // ==========================================
  { id: 'helmet-common', name: 'Mũ Sắt Sơ Cấp', type: 'helmet', slot: 'helmet', rarity: 'common', description: 'Mũ bảo hiểm sắt tiêu chuẩn cho binh sĩ.', icon: '🪖', bonusDescription: '+10 DEF', count: 1, unlockedAt: Date.now(), equipped: false },
  { id: 'helmet-uncommon', name: 'Mũ Giáp Ngọc Bích', type: 'helmet', slot: 'helmet', rarity: 'uncommon', description: 'Mũ giáp chế tác từ tinh thể ngọc bích.', icon: '🟢', bonusDescription: '+22 DEF, +5% Kháng', count: 0, unlockedAt: 0 },
  { id: 'helmet-rare', name: 'Mũ Hiệp Sĩ Bạc', type: 'helmet', slot: 'helmet', rarity: 'rare', description: 'Mũ trụ rèn từ bạc nguyên chất.', icon: '🛡️', bonusDescription: '+45 DEF, +10 HP', count: 0, unlockedAt: 0 },
  { id: 'helmet-epic', name: 'Mũ Giáp Plasma Tương Lai', type: 'helmet', slot: 'helmet', rarity: 'epic', description: 'Mũ công nghệ cao tích hợp kính HUD.', icon: '🧢', bonusDescription: '+85 DEF, +15% Tốc Độ', count: 0, unlockedAt: 0 },
  { id: 'helmet-legendary', name: 'Mũ Trụ Chiến Thần Vô Song', type: 'helmet', slot: 'helmet', rarity: 'legendary', description: 'Mũ trụ của các vị thần chiến tranh cổ đại.', icon: '👑', bonusDescription: '+150 DEF, +25% Sức Mạnh', count: 0, unlockedAt: 0 },
  { id: 'helmet-mythic', name: 'Mũ Giáp Hỏa Long', type: 'helmet', slot: 'helmet', rarity: 'mythic', description: 'Mũ giáp phong ấn sức mạnh rồng lửa.', icon: '👺', bonusDescription: '+250 DEF, +35% Kháng Hỏa', count: 0, unlockedAt: 0 },
  { id: 'helmet-relic', name: 'Mũ Cổ Vật Huyết Tộc', type: 'helmet', slot: 'helmet', rarity: 'relic', description: 'Cổ vật ngàn năm của vương triều huyết tộc.', icon: '🧛', bonusDescription: '+380 DEF, +50 Hút Máu', count: 0, unlockedAt: 0 },
  { id: 'helmet-masterwork', name: 'Mũ Tuyệt Tác Electrum', type: 'helmet', slot: 'helmet', rarity: 'masterwork', description: 'Kiệt tác nón giáp từ kim loại quý hiếm Electrum.', icon: '✨', bonusDescription: '+520 DEF, +60% Phòng Thủ', count: 0, unlockedAt: 0 },
  { id: 'helmet-eternal', name: 'Vương Miện Vĩnh Hằng Eternal', type: 'helmet', slot: 'helmet', rarity: 'eternal', description: 'Vương miện tối thượng của vũ trụ vĩnh cửu.', icon: '🌟', bonusDescription: '+800 DEF, +100% Toàn Chỉ Số', count: 0, unlockedAt: 0 },

  // ==========================================
  // NECKLACE SLOT ITEMS (Dây Chuyền)
  // ==========================================
  { id: 'necklace-common', name: 'Dây Chuyền Đồng Cổ', type: 'necklace', slot: 'necklace', rarity: 'common', description: 'Dây chuyền đồng nguyên chất tăng chút sinh lực.', icon: '📿', bonusDescription: '+15 HP', count: 1, unlockedAt: Date.now(), equipped: false },
  { id: 'necklace-uncommon', name: 'Vòng Cổ Ngọc Lục Bảo', type: 'necklace', slot: 'necklace', rarity: 'uncommon', description: 'Vòng cổ khắc ngọc bích giúp hồi phục thể lực.', icon: '💚', bonusDescription: '+35 HP, +5% Hồi Phục', count: 0, unlockedAt: 0 },
  { id: 'necklace-rare', name: 'Dây Chuyền Ánh Trăng', type: 'necklace', slot: 'necklace', rarity: 'rare', description: 'Tỏa ánh trăng dịu mát tăng may mắn.', icon: '🌙', bonusDescription: '+75 HP, +10% May Mắn', count: 0, unlockedAt: 0 },
  { id: 'necklace-epic', name: 'Mặt Dây Chuyền Hỏa Long', type: 'necklace', slot: 'necklace', rarity: 'epic', description: 'Chứa tinh hoa long tâm ấm áp.', icon: '🔥', bonusDescription: '+140 HP, +15% Sát Thương', count: 0, unlockedAt: 0 },
  { id: 'necklace-legendary', name: 'Dây Chuyền Tinh Tú', type: 'necklace', slot: 'necklace', rarity: 'legendary', description: 'Đính các hạt sao băng rơi từ thiên hà.', icon: '🌌', bonusDescription: '+260 HP, +25% EXP', count: 0, unlockedAt: 0 },
  { id: 'necklace-mythic', name: 'Mặt Dây Chuyền Huyết Ngọc', type: 'necklace', slot: 'necklace', rarity: 'mythic', description: 'Mặt ngọc rực rỡ sắc máu tối cao.', icon: '🩸', bonusDescription: '+400 HP, +30% Hút Máu', count: 0, unlockedAt: 0 },
  { id: 'necklace-relic', name: 'Dây Chuyền Thái Cổ Cổ Vật', type: 'necklace', slot: 'necklace', rarity: 'relic', description: 'Bảo vật truyền đời của các đấng tối cao.', icon: '🏺', bonusDescription: '+600 HP, +40% Kháng', count: 0, unlockedAt: 0 },
  { id: 'necklace-masterwork', name: 'Vòng Cổ Tuyệt Tác Thái Dương', type: 'necklace', slot: 'necklace', rarity: 'masterwork', description: 'Tỏa sáng rực rỡ như mặt trời.', icon: '☀️', bonusDescription: '+850 HP, +50% Sinh Lực', count: 0, unlockedAt: 0 },
  { id: 'necklace-eternal', name: 'Dây Chuyền Vĩnh Hằng Eternal', type: 'necklace', slot: 'necklace', rarity: 'eternal', description: 'Kết tinh vĩnh cửu của nguồn sống đa vũ trụ.', icon: '💎', bonusDescription: '+1200 HP, +100% Sinh Lực', count: 0, unlockedAt: 0 },

  // ==========================================
  // RING LEFT SLOT ITEMS (Nhẫn Trái)
  // ==========================================
  { id: 'ring-left-common', name: 'Nhẫn Sắt Thô Sơ', type: 'ringLeft', slot: 'ringLeft', rarity: 'common', description: 'Nhẫn sắt đơn giản tăng chút sức tấn công.', icon: '💍', bonusDescription: '+8 ATK', count: 1, unlockedAt: Date.now(), equipped: false },
  { id: 'ring-left-uncommon', name: 'Nhẫn Bạc May Mắn', type: 'ringLeft', slot: 'ringLeft', rarity: 'uncommon', description: 'Nhẫn bạc khắc hoa văn tinh xảo.', icon: '💍', bonusDescription: '+18 ATK, +6% May Mắn', count: 0, unlockedAt: 0 },
  { id: 'ring-left-rare', name: 'Nhẫn Vàng Hoàng Gia', type: 'ringLeft', slot: 'ringLeft', rarity: 'rare', description: 'Nhẫn vàng ròng của hoàng tộc.', icon: '💍', bonusDescription: '+38 ATK, +12% Vàng', count: 0, unlockedAt: 0 },
  { id: 'ring-left-epic', name: 'Nhẫn Long Tộc Chiến Thần', type: 'ringLeft', slot: 'ringLeft', rarity: 'epic', description: 'Chứa long lực mãnh liệt.', icon: '💍', bonusDescription: '+75 ATK, +20% Sát Thương', count: 0, unlockedAt: 0 },
  { id: 'ring-left-legendary', name: 'Nhẫn Thần Lực Tối Thượng', type: 'ringLeft', slot: 'ringLeft', rarity: 'legendary', description: 'Nhẫn ban phước sức mạnh thần thánh.', icon: '💍', bonusDescription: '+135 ATK, +30% Chí Mạng', count: 0, unlockedAt: 0 },
  { id: 'ring-left-mythic', name: 'Nhẫn Hỗn Mang Ma Lực', type: 'ringLeft', slot: 'ringLeft', rarity: 'mythic', description: 'Mang năng lượng hắc ám hỗ trợ sát thương.', icon: '💍', bonusDescription: '+220 ATK, +40% Sát Thương Lửa', count: 0, unlockedAt: 0 },
  { id: 'ring-left-relic', name: 'Nhẫn Cổ Vật Runic', type: 'ringLeft', slot: 'ringLeft', rarity: 'relic', description: 'Khắc cổ ngữ xuyên giáp cổ xưa.', icon: '💍', bonusDescription: '+340 ATK, +50% Xuyên Giáp', count: 0, unlockedAt: 0 },
  { id: 'ring-left-masterwork', name: 'Nhẫn Tuyệt Tác Vô Cực', type: 'ringLeft', slot: 'ringLeft', rarity: 'masterwork', description: 'Chế tác hoàn mỹ tăng sát thương tuyệt đối.', icon: '💍', bonusDescription: '+480 ATK, +70% Sát Thương', count: 0, unlockedAt: 0 },
  { id: 'ring-left-eternal', name: 'Nhẫn Bất Diệt Eternal', type: 'ringLeft', slot: 'ringLeft', rarity: 'eternal', description: 'Tồn tại vĩnh hằng cùng thời gian.', icon: '💍', bonusDescription: '+700 ATK, +100% Sát Thương Tuyệt Đối', count: 0, unlockedAt: 0 },

  // ==========================================
  // RING RIGHT SLOT ITEMS (Nhẫn Phải)
  // ==========================================
  { id: 'ring-right-common', name: 'Nhẫn Đồng Khởi Đầu', type: 'ringRight', slot: 'ringRight', rarity: 'common', description: 'Nhẫn đồng bảo vệ ngón tay.', icon: '💍', bonusDescription: '+8 DEF', count: 1, unlockedAt: Date.now(), equipped: false },
  { id: 'ring-right-uncommon', name: 'Nhẫn Ngọc Bích Bảo Hộ', type: 'ringRight', slot: 'ringRight', rarity: 'uncommon', description: 'Nhẫn ngọc bích giúp tăng né tránh.', icon: '💍', bonusDescription: '+18 DEF, +6% Né Tránh', count: 0, unlockedAt: 0 },
  { id: 'ring-right-rare', name: 'Nhẫn Hộ Mệnh Ruby', type: 'ringRight', slot: 'ringRight', rarity: 'rare', description: 'Đính ruby giảm thiểu sát thương nhận vào.', icon: '💍', bonusDescription: '+38 DEF, +12% Giảm Sát Thương', count: 0, unlockedAt: 0 },
  { id: 'ring-right-epic', name: 'Nhẫn Hắc Kim Siêu Cấp', type: 'ringRight', slot: 'ringRight', rarity: 'epic', description: 'Làm từ hợp kim hắc kim kiên cố.', icon: '💍', bonusDescription: '+75 DEF, +20% Kháng', count: 0, unlockedAt: 0 },
  { id: 'ring-right-legendary', name: 'Nhẫn Vĩnh Hằng Bảo Hộ', type: 'ringRight', slot: 'ringRight', rarity: 'legendary', description: 'Tạo lớp khiên năng lượng bảo vệ.', icon: '💍', bonusDescription: '+135 DEF, +30% Khiên', count: 0, unlockedAt: 0 },
  { id: 'ring-right-mythic', name: 'Nhẫn Giáp Thiên Thần', type: 'ringRight', slot: 'ringRight', rarity: 'mythic', description: 'Ban phước bởi thiên thần hộ mệnh.', icon: '💍', bonusDescription: '+220 DEF, +40% Hấp Thụ Sát Thương', count: 0, unlockedAt: 0 },
  { id: 'ring-right-relic', name: 'Nhẫn Cổ Đại Hộ Mệnh', type: 'ringRight', slot: 'ringRight', rarity: 'relic', description: 'Cổ vật bảo hộ tối tân.', icon: '💍', bonusDescription: '+340 DEF, +50% Giáp Vật Lý', count: 0, unlockedAt: 0 },
  { id: 'ring-right-masterwork', name: 'Nhẫn Tuyệt Tác Khiên', type: 'ringRight', slot: 'ringRight', rarity: 'masterwork', description: 'Kiệt tác phòng thủ hoàn hảo.', icon: '💍', bonusDescription: '+480 DEF, +70% Kháng Cự', count: 0, unlockedAt: 0 },
  { id: 'ring-right-eternal', name: 'Nhẫn Khiên Bất Diệt Eternal', type: 'ringRight', slot: 'ringRight', rarity: 'eternal', description: 'Bất khả xâm phạm trước mọi đòn tấn công.', icon: '💍', bonusDescription: '+700 DEF, +100% Phòng Thủ Tuyệt Đối', count: 0, unlockedAt: 0 },

  // ==========================================
  // EXCLUSIVE ARCADE SHOP COSMETIC THEMES
  // ==========================================
  { id: 'skin-eat-em-all-neon', name: 'Vệt Sáng Neon Cầu Vồng (Neon Trails)', type: 'skin', rarity: 'epic', description: 'Vệt hào quang Neon rực rỡ kéo dài phía sau nhân vật, sóng năng lượng cầu vồng lung linh.', icon: '✨', gameId: 'eat-em-all', bonusDescription: 'Vệt đuôi Neon Ribbon uốn lượn liên tục', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-eat-em-all-cyber', name: 'Cyber Glutton Mk-II', type: 'skin', rarity: 'legendary', description: 'Bộ giáp cơ giới hóa Cyberpunk với kính ngắm HUD và vệt ma trận dữ liệu Matrix xanh lục.', icon: '🤖', gameId: 'eat-em-all', bonusDescription: 'Kính ngắm mục tiêu quét HUD & vệt Matrix', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-eat-em-all-dragon', name: 'Hỏa Long Hoàng Gia', type: 'skin', rarity: 'mythic', description: 'Linh thú chân long hoàng kim với vệt lửa thần thánh phụt ra tia sáng kim quang chói lọi.', icon: '🐉', gameId: 'eat-em-all', bonusDescription: 'Vệt lửa thần thánh phụt tia lửa đỏ cam', count: 0, unlockedAt: 0, equipped: false },

  { id: 'skin-scoodoku-retro', name: 'Retro-Pixel 8-Bit Arcade', type: 'skin', rarity: 'rare', description: 'Giao diện màn hình máy điện tử thùng thập niên 80 với hiệu ứng CRT scanline và font số Pixel xanh phosphor.', icon: '🕹️', gameId: 'scoodoku', bonusDescription: 'Hiệu ứng sọc quét CRT Scanlines & font 8-bit', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-scoodoku-cyberpunk', name: 'Cyberpunk Neon Synthwave', type: 'skin', rarity: 'epic', description: 'Ma trận số phát quang sắc tím neon synthwave, viền laser hologram và hiệu ứng vệt sáng ma thuật.', icon: '🔮', gameId: 'scoodoku', bonusDescription: 'Viền lưới Laser tím Neon & dạ quang Holographic', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-scoodoku-zen', name: 'Zen Garden Parchment (Thiền Trúc)', type: 'skin', rarity: 'uncommon', description: 'Giao diện thanh tịnh bằng gỗ quý mun đen và giấy cổ parchment thiền định phong cách mực thư pháp.', icon: '🎋', gameId: 'scoodoku', bonusDescription: 'Chất liệu giấy cổ Parchment & mực tàu thanh nhã', count: 0, unlockedAt: 0, equipped: false },

  { id: 'skin-runner-phantom', name: 'Phantom Neon Overdrive', type: 'skin', rarity: 'rare', description: 'Vệt bóng mờ tím hư không cùng trang phục phản quang điện tử siêu tốc độ.', icon: '⚡', gameId: 'neon-runner', bonusDescription: 'Dư ảnh bóng ma tím Phantom sau mỗi cú nhảy', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-ship-phoenix', name: 'Chiến Hạm Hỏa Phụng', type: 'skin', rarity: 'epic', description: 'Phi thuyền tiêm kích lửa thần thoại phát đạn pháo plasma đỏ rực và đuôi lửa phượng hoàng.', icon: '🛸', gameId: 'cosmic-defense', bonusDescription: 'Động cơ tia lửa đỏ & khiên lửa phượng hoàng', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-blade-rainbow', name: 'Lưỡi Đao Lục Sắc Prism', type: 'skin', rarity: 'rare', description: 'Thanh katana tán sắc cầu vồng để lại vệt chém hào quang 7 màu siêu ảo diệu.', icon: '🌈', gameId: 'cyber-slice', bonusDescription: 'Vệt chém cầu vồng 7 màu quang phổ liên tục', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-caro-neon', name: 'Bàn Cờ Cyber Laser', type: 'skin', rarity: 'rare', description: 'Bàn cờ ma trận vị lai với quân X neon xanh ngọc và O neon hồng tím phát quang rực rỡ.', icon: '⚡', gameId: 'caro-gomoku', bonusDescription: 'Quân X xanh Cyan & O hồng Magenta phát sáng', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-blocker-crystal', name: 'Khối Pha Lê Hoàng Gia', type: 'skin', rarity: 'rare', description: 'Bộ khối gạch pha lê trong suốt phản chiếu ánh sáng lấp lánh khi phá hủy hàng cột.', icon: '💎', gameId: 'blocker', bonusDescription: 'Khối gạch pha lê 3D phát nổ hạt sao', count: 0, unlockedAt: 0, equipped: false },
  
  { id: 'skin-car-escape-firetruck', name: 'Xe Cứu Hỏa', type: 'skin', rarity: 'epic', description: 'Xe cứu hỏa đỏ rực, tiếng còi inh ỏi.', icon: '🚒', gameId: 'car-escape', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-car-escape-police', name: 'Xe Cảnh Sát', type: 'skin', rarity: 'rare', description: 'Xe cảnh sát bọc thép sẵn sàng dẹp đường.', icon: '🚓', gameId: 'car-escape', count: 0, unlockedAt: 0, equipped: false },
  { id: 'skin-car-escape-sports', name: 'Siêu Xe Thể Thao', type: 'skin', rarity: 'legendary', description: 'Siêu xe tốc độ cao, trượt siêu mượt.', icon: '🏎️', gameId: 'car-escape', count: 0, unlockedAt: 0, equipped: false },
];

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-game',
    gameId: 'global',
    title: 'Bước Chân Đầu Tiên',
    description: 'Chơi bất kỳ 1 ván mini-game nào tại ArcadeX.',
    icon: '🎮',
    category: 'Chung',
    rarity: 'common',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 50,
    rewardCoins: 100,
    rewardGems: 5,
    rewardTitle: 'Game Thủ Giải Trí',
  },
  {
    id: 'ach-open-first-chest',
    gameId: 'global',
    title: 'Khai Mở Vận May',
    description: 'Mở 1 rương báu bất kỳ trong Kho Rương Đồ.',
    icon: '🎁',
    category: 'Rương',
    rarity: 'common',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 80,
    rewardCoins: 150,
    rewardGems: 10,
    rewardTitle: 'Thợ Săn Kho Báu',
  },
  {
    id: 'ach-runner-500',
    gameId: 'neon-runner',
    title: 'Tăng Tốc Neon',
    description: 'Đạt 500 điểm trong Neon Runner.',
    icon: '🏃',
    category: 'Neon Runner',
    rarity: 'common',
    target: 500,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
  },
  {
    id: 'ach-runner-2000',
    gameId: 'neon-runner',
    title: 'Phá Vỡ Giới Hạn Âm Thanh',
    description: 'Đạt 2,000 điểm trong Neon Runner.',
    icon: '⚡',
    category: 'Neon Runner',
    rarity: 'legendary',
    target: 2000,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 300,
    rewardCoins: 600,
    rewardGems: 30,
    rewardTitle: 'Người Thích Tốc Độ',
  },
  {
    id: 'ach-cosmic-boss',
    gameId: 'cosmic-defense',
    title: 'Tiêu Diệt Tàu Mẹ',
    description: 'Hạ gục Boss hạm đội trong Cosmic Defense (Đạt 1,500 điểm).',
    icon: '🛸',
    category: 'Cosmic Defense',
    rarity: 'rare',
    target: 1500,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 20,
  },
  {
    id: 'ach-slice-combo-10',
    gameId: 'cyber-slice',
    title: 'Kiếm Thuật Thần Sầu',
    description: 'Cắt đứt liên hoàn 10 mục tiêu trong Cyber Slice.',
    icon: '🗡️',
    category: 'Cyber Slice',
    rarity: 'rare',
    target: 10,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 15,
  },
  {
    id: 'ach-dungeon-floor-5',
    gameId: 'dungeon-tap',
    title: 'Chinh Phục Tầng 5',
    description: 'Vượt qua 5 tầng quái vật và Boss hầm ngục.',
    icon: '🛡️',
    category: 'Dungeon Tap',
    rarity: 'rare',
    target: 5,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 200,
    rewardCoins: 450,
    rewardGems: 25,
  },
  {
    id: 'ach-hex-1000',
    gameId: 'hex-match',
    title: 'Bậc Thầy Xếp Lưới',
    description: 'Đạt 1,000 điểm trong Hex Match.',
    icon: '🔷',
    category: 'Hex Match',
    rarity: 'rare',
    target: 1000,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 180,
    rewardCoins: 350,
    rewardGems: 20,
  },
  {
    id: 'ach-2048-reach-512',
    gameId: 'tile-2048',
    title: 'Thợ Săn Ngọc 512',
    description: 'Ghép thành công ô số 512 và kích hoạt tính năng rớt 10 Ngọc.',
    icon: '💎',
    category: 'Xếp Gạch 2048',
    rarity: 'rare',
    target: 512,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 15,
  },
  {
    id: 'ach-2048-reach-1024',
    gameId: 'tile-2048',
    title: 'Đại Phú Hào 1024',
    description: 'Ghép thành công ô số 1024 và kích hoạt rớt 25 Ngọc.',
    icon: '✨',
    category: 'Xếp Gạch 2048',
    rarity: 'epic',
    target: 1024,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 250,
    rewardCoins: 600,
    rewardGems: 30,
  },
  {
    id: 'ach-2048-reach-2048',
    gameId: 'tile-2048',
    title: 'Huyền Thoại 2048',
    description: 'Chinh phục ô số 2048 tối thượng và ẵm trọn 50 Ngọc thưởng.',
    icon: '👑',
    category: 'Xếp Gạch 2048',
    rarity: 'legendary',
    target: 2048,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 500,
    rewardCoins: 1200,
    rewardGems: 60,
    rewardTitle: 'Đại Hào Phú',
  },
  {
    id: 'ach-2048-score-5000',
    gameId: 'tile-2048',
    title: 'Bậc Thầy Tính Toán',
    description: 'Đạt tổng điểm 5,000 trong Xếp Gạch 2048.',
    icon: '🔢',
    category: 'Xếp Gạch 2048',
    rarity: 'epic',
    target: 5000,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 200,
    rewardCoins: 400,
    rewardGems: 20,
  },
  {
    id: 'caro_first_win',
    gameId: 'caro-gomoku',
    title: 'Kỳ Thủ Cờ Caro',
    description: 'Giành chiến thắng ván cờ Caro đầu tiên.',
    icon: '⭕',
    category: 'Cờ Caro',
    rarity: 'common',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
    rewardTitle: 'Kỳ Thủ Cờ Caro',
  },
  {
    id: 'chess_first_win',
    gameId: 'chess',
    title: 'Đại Kiện Tướng',
    description: 'Giành chiến thắng ván cờ vua đầu tiên.',
    icon: '♞',
    category: 'Cờ Vua',
    rarity: 'rare',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 150,
    rewardCoins: 300,
    rewardGems: 20,
    rewardTitle: 'Chiến Thuật Gia',
  },
  {
    id: 'fts-level-3',
    gameId: 'fill-the-space',
    title: 'Thợ Gỗ Tập Sự',
    description: 'Vượt qua Màn 3 trong Lấp Đầy Khoảng Trống.',
    icon: '🪵',
    category: 'Lấp Đầy Khoảng Trống',
    rarity: 'common',
    target: 3,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 250,
    rewardGems: 0,
  },
  {
    id: 'fts-streak-3',
    gameId: 'fill-the-space',
    title: 'Kỳ Thủ Tự Lực (x2 Điểm)',
    description: 'Đạt chuỗi 3 màn liên tiếp thắng không dùng gợi ý trong Lấp Đầy Khoảng Trống.',
    icon: '🔥',
    category: 'Lấp Đầy Khoảng Trống',
    rarity: 'epic',
    target: 3,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 250,
    rewardCoins: 600,
    rewardGems: 10,
  },
  {
    id: 'fts-combo-master',
    gameId: 'fill-the-space',
    title: 'Combo Master',
    description: 'Đạt được 5 chuỗi 3 màn thắng liên tiếp trong Fill The Space mà không sử dụng bất kỳ gợi ý nào.',
    icon: '⚡',
    category: 'Lấp Đầy Khoảng Trống',
    rarity: 'epic',
    target: 5,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 500,
    rewardCoins: 1200,
    rewardGems: 30,
    rewardTitle: 'Combo Master',
  },
  {
    id: 'fts-level-10',
    gameId: 'fill-the-space',
    title: 'Bậc Thầy Xếp Gỗ',
    description: 'Vượt qua Màn 10 trong Lấp Đầy Khoảng Trống.',
    icon: '🧩',
    category: 'Lấp Đầy Khoảng Trống',
    rarity: 'epic',
    target: 10,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 350,
    rewardCoins: 800,
    rewardGems: 15,
  },
  {
    id: 'fts-level-25',
    gameId: 'fill-the-space',
    title: 'Kỳ Tài Giải Đố Không Gian',
    description: 'Vượt qua Màn 25 trong Lấp Đầy Khoảng Trống.',
    icon: '👑',
    category: 'Lấp Đầy Khoảng Trống',
    rarity: 'legendary',
    target: 25,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 750,
    rewardCoins: 2000,
    rewardGems: 50,
  },
  {
    id: 'ach-scoodoku-first-win',
    gameId: 'scoodoku',
    title: 'Khai Mở Trí Tuệ Sudoku',
    description: 'Hoàn thành chiến thắng 1 ván Scoodoku bất kỳ.',
    icon: '🔢',
    category: 'Scoodoku',
    rarity: 'common',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
    rewardTitle: 'Tân Kỳ Thủ Sudoku',
  },
  {
    id: 'ach-scoodoku-stage-5',
    gameId: 'scoodoku',
    title: 'Chiến Binh Ma Trận Số',
    description: 'Chinh phục 5 màn chơi trong Scoodoku.',
    icon: '⚡',
    category: 'Scoodoku',
    rarity: 'rare',
    target: 5,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 220,
    rewardCoins: 450,
    rewardGems: 20,
  },
  {
    id: 'ach-scoodoku-hard-win',
    gameId: 'scoodoku',
    title: 'Bậc Thầy Tính Toán Sudoku',
    description: 'Chiến thắng ván Scoodoku độ khó Khó hoặc ma trận 16x16.',
    icon: '🔥',
    category: 'Scoodoku',
    rarity: 'epic',
    target: 1,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 400,
    rewardCoins: 900,
    rewardGems: 35,
    rewardTitle: 'Kỳ Thủ Số Học',
  },
  {
    id: 'ach-scoodoku-stage-12',
    gameId: 'scoodoku',
    title: 'Đại Pháp Sư Ma Trận Tối Thượng',
    description: 'Chinh phục trọn vẹn 12 màn chiến dịch Scoodoku.',
    icon: '👑',
    category: 'Scoodoku',
    rarity: 'legendary',
    target: 12,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 1000,
    rewardCoins: 2500,
    rewardGems: 60,
    rewardTitle: 'Đại Pháp Sư Sudoku',
  },
  {
    id: 'ach-eat-first-game',
    gameId: 'eat-em-all',
    title: 'Tân Binh Nuốt Chửng',
    description: 'Ăn thành công 20 vật phẩm trong Eat em All.',
    icon: '😋',
    category: "Eat 'Em All",
    rarity: 'common',
    target: 20,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
    rewardTitle: 'Tân Binh Nuốt Chửng',
  },
  {
    id: 'ach-eat-fury-master',
    gameId: 'eat-em-all',
    title: 'Bão Lửa Cuồng Nộ Fury x10',
    description: 'Kích hoạt trạng thái Elemental Fury 3 lần.',
    icon: '⚡',
    category: "Eat 'Em All",
    rarity: 'rare',
    target: 3,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 250,
    rewardCoins: 500,
    rewardGems: 25,
    rewardTitle: 'Chiến Tướng Cuồng Nộ',
  },
  {
    id: 'ach-eat-target-stage-5',
    gameId: 'eat-em-all',
    title: 'Chiến Binh Nguyên Tố',
    description: 'Chinh phục 5 màn chơi trong chế độ Chiến Dịch (Target Mode).',
    icon: '🛡️',
    category: "Eat 'Em All",
    rarity: 'epic',
    target: 5,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 400,
    rewardCoins: 800,
    rewardGems: 35,
    rewardTitle: 'Pháp Sư Nguyên Tố',
  },
  {
    id: 'ach-eat-endless-1500',
    gameId: 'eat-em-all',
    title: 'Kẻ Nuốt Chửng Huyền Thoại',
    description: 'Đạt 1,500 điểm trong chế độ Sinh Tồn (Endless Survival).',
    icon: '👑',
    category: "Eat 'Em All",
    rarity: 'legendary',
    target: 1500,
    current: 0,
    unlocked: false,
    claimed: false,
    rewardExp: 750,
    rewardCoins: 1500,
    rewardGems: 60,
    rewardTitle: 'Chúa Tể Nuốt Chửng',
  }
];

export const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'quest-hex-score-500',
    title: 'Thần Tài Hex Match',
    description: 'Đạt từ 500 điểm trong game Hex Match hôm nay.',
    gameId: 'hex-match',
    type: 'game_score',
    icon: '🔷',
    target: 500,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 350,
    rewardGems: 15,
    rewardExp: 150,
  },
  {
    id: 'quest-play-3-matches',
    title: 'Nhiệt Huyết Arcade',
    description: 'Chơi 3 ván mini-game bất kỳ hôm nay.',
    type: 'play_matches',
    icon: '🎮',
    target: 3,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 250,
    rewardGems: 10,
    rewardExp: 120,
  },
  {
    id: 'quest-score-1000',
    title: 'Tay Đua Siêu Cấp',
    description: 'Đạt tổng cộng 1,000 điểm trên tất cả các game.',
    type: 'total_score',
    icon: '🏆',
    target: 1000,
    current: 0,
    completed: false,
    claimed: false,
    rewardCoins: 300,
    rewardGems: 15,
    rewardExp: 150,
  },
];

export const INITIAL_PLAYER_PROFILE: PlayerProfile = {
  id: 'guest_' + Math.random().toString(36).substring(2, 9),
  username: 'CyberGamer_' + Math.floor(1000 + Math.random() * 9000),
  avatar: '👾',
  currentTitle: 'Tân Binh Arcade',
  level: 1,
  exp: 0,
  coins: 200,
  gems: 25,
  stats: {
    totalGamesPlayed: 0,
    totalScore: 0,
    totalTimePlayedSeconds: 0,
    chestsOpened: 0,
    achievementsUnlocked: 0,
    dailyStreak: 1,
    lastLoginDate: new Date().toISOString().split('T')[0],
    highScores: {},
    gamesPlayedCount: {},
    dailyScoreHistory: {},
    hasPermanentLuckBuff: false,
  },
  equippedSkins: {
    'neon-runner': 'skin-runner-default',
    'cosmic-defense': 'skin-ship-viper',
    'cyber-slice': 'skin-blade-laser',
    'dungeon-tap': 'weapon-dungeon-iron',
  },
  equippedAvatar: 'avatar-pixel-hero',
  equippedTitle: 'title-novice',
  createdAt: Date.now(),
};

export const INITIAL_LEADERBOARD: Record<string, LeaderboardEntry[]> = {
  'blocker': [
    { id: 'lb-b1', rank: 1, playerName: 'MasterBlocker_VN', avatar: '🧱', title: 'Chiến Thần Xếp Gạch', score: 8450, gameId: 'blocker', date: '2026-08-31' },
    { id: 'lb-b2', rank: 2, playerName: 'ComboKing_Arcade', avatar: '⚡', title: 'Bậc Thầy Combo', score: 6820, gameId: 'blocker', date: '2026-08-31' },
    { id: 'lb-b3', rank: 3, playerName: 'NeonMason', avatar: '👑', title: 'Huyền Thoại Vô Song', score: 5390, gameId: 'blocker', date: '2026-09-01' },
    { id: 'lb-b4', rank: 4, playerName: 'GridBreaker', avatar: '🤖', title: 'Thợ Săn Đá Quý', score: 4620, gameId: 'blocker', date: '2026-09-01' },
    { id: 'lb-b5', rank: 5, playerName: 'PixelCrafter', avatar: '👾', title: 'Tân Binh Arcade', score: 3880, gameId: 'blocker', date: '2026-09-01' },
  ],
  'neon-runner': [
    { id: 'lb-1', rank: 1, playerName: 'KuroNeko_99', avatar: '🥷', title: 'Ma Tốc Độ Cyber', score: 4850, gameId: 'neon-runner', date: '2026-08-31' },
    { id: 'lb-2', rank: 2, playerName: 'NeonValkyrie', avatar: '👑', title: 'Huyền Thoại Vô Song', score: 3920, gameId: 'neon-runner', date: '2026-08-31' },
    { id: 'lb-3', rank: 3, playerName: 'CyberPulse', avatar: '🤖', title: 'Thần Sấm Arcade', score: 3210, gameId: 'neon-runner', date: '2026-09-01' },
    { id: 'lb-4', rank: 4, playerName: 'ZeroGravity', avatar: '👨‍🚀', title: 'Tân Binh Arcade', score: 2450, gameId: 'neon-runner', date: '2026-09-01' },
    { id: 'lb-5', rank: 5, playerName: 'VortexPilot', avatar: '⚡', title: 'Cao Thủ Phản Xạ', score: 1890, gameId: 'neon-runner', date: '2026-09-01' },
  ],
  'tile-2048': [
    { id: 'lb-t1', rank: 1, playerName: 'MatrixLord_2048', avatar: '👑', title: 'Huyền Thoại 2048', score: 18450, gameId: 'tile-2048', date: '2026-08-31' },
    { id: 'lb-t2', rank: 2, playerName: 'NeonSwipe', avatar: '⚡', title: 'Bậc Thầy Tính Toán', score: 12600, gameId: 'tile-2048', date: '2026-08-31' },
    { id: 'lb-t3', rank: 3, playerName: 'GemHunter_VN', avatar: '💎', title: 'Thợ Săn Ngọc', score: 8940, gameId: 'tile-2048', date: '2026-09-01' },
    { id: 'lb-t4', rank: 4, playerName: 'TileMaster', avatar: '🔢', title: 'Tân Binh Arcade', score: 5420, gameId: 'tile-2048', date: '2026-09-01' },
    { id: 'lb-t5', rank: 5, playerName: 'SwiftMerger', avatar: '🎯', title: 'Cao Thủ Tính Toán', score: 4180, gameId: 'tile-2048', date: '2026-09-01' },
  ],
  'cosmic-defense': [
    { id: 'lb-c1', rank: 1, playerName: 'StarLord_VN', avatar: '👨‍🚀', title: 'Đấng Cứu Thế Vũ Trụ', score: 5400, gameId: 'cosmic-defense', date: '2026-08-31' },
    { id: 'lb-c2', rank: 2, playerName: 'AstroNova', avatar: '🛸', title: 'Sát Thủ Không Gian', score: 4120, gameId: 'cosmic-defense', date: '2026-09-01' },
    { id: 'lb-c3', rank: 3, playerName: 'BlasterPro', avatar: '👾', title: 'Bách Phát Bách Trúng', score: 3100, gameId: 'cosmic-defense', date: '2026-09-01' },
    { id: 'lb-c4', rank: 4, playerName: 'GalaxyDefender', avatar: '🚀', title: 'Thiện Xạ Tinh Vân', score: 2380, gameId: 'cosmic-defense', date: '2026-09-01' },
    { id: 'lb-c5', rank: 5, playerName: 'NebulaSniper', avatar: '⭐', title: 'Tân Binh Vũ Trụ', score: 1750, gameId: 'cosmic-defense', date: '2026-09-01' },
  ],
  'cyber-slice': [
    { id: 'lb-s1', rank: 1, playerName: 'ShadowBlade', avatar: '🥷', title: 'Kiếm Thánh Cyber', score: 620, gameId: 'cyber-slice', date: '2026-08-31' },
    { id: 'lb-s2', rank: 2, playerName: 'KatanaMaster', avatar: '🐉', title: 'Đao Phủ Siêu Tốc', score: 490, gameId: 'cyber-slice', date: '2026-09-01' },
    { id: 'lb-s3', rank: 3, playerName: 'BladeRunner_VN', avatar: '⚡', title: 'Chớp Mắt Đoạt Mệnh', score: 380, gameId: 'cyber-slice', date: '2026-09-01' },
    { id: 'lb-s4', rank: 4, playerName: 'NeonCutter', avatar: '🗡️', title: 'Kiếm Sư Phản Xạ', score: 275, gameId: 'cyber-slice', date: '2026-09-01' },
    { id: 'lb-s5', rank: 5, playerName: 'VaporSlice', avatar: '🌀', title: 'Tân Thủ Kiếm Đạo', score: 195, gameId: 'cyber-slice', date: '2026-09-01' },
  ],
  'dungeon-tap': [
    { id: 'lb-d1', rank: 1, playerName: 'RuneKnight', avatar: '🛡️', title: 'Vua Hầm Ngục', score: 24, gameId: 'dungeon-tap', date: '2026-08-31' },
    { id: 'lb-d2', rank: 2, playerName: 'DragonBane', avatar: '⚔️', title: 'Chiến Binh Quả Cảm', score: 18, gameId: 'dungeon-tap', date: '2026-09-01' },
    { id: 'lb-d3', rank: 3, playerName: 'ShadowStalker', avatar: '🗡️', title: 'Sát Thủ Bóng Đêm', score: 14, gameId: 'dungeon-tap', date: '2026-09-01' },
    { id: 'lb-d4', rank: 4, playerName: 'IronClad_VN', avatar: '🧙‍♂️', title: 'Dũng Sĩ Hầm Ngục', score: 11, gameId: 'dungeon-tap', date: '2026-09-01' },
    { id: 'lb-d5', rank: 5, playerName: 'TavernHero', avatar: '🍺', title: 'Tân Binh Mạo Hiểm', score: 8, gameId: 'dungeon-tap', date: '2026-09-01' },
  ],
  'hex-match': [
    { id: 'lb-h1', rank: 1, playerName: 'MindBender', avatar: '🔷', title: 'Bậc Thầy Xếp Lưới', score: 3800, gameId: 'hex-match', date: '2026-08-31' },
    { id: 'lb-h2', rank: 2, playerName: 'PuzzleQueen', avatar: '👑', title: 'Trí Tuệ Đỉnh Cao', score: 2950, gameId: 'hex-match', date: '2026-09-01' },
    { id: 'lb-h3', rank: 3, playerName: 'HexaGod_VN', avatar: '🔮', title: 'Phù Thủy Lục Giác', score: 2310, gameId: 'hex-match', date: '2026-09-01' },
    { id: 'lb-h4', rank: 4, playerName: 'PrismMaster', avatar: '💎', title: 'Chuyên Gia Ghép Hình', score: 1820, gameId: 'hex-match', date: '2026-09-01' },
    { id: 'lb-h5', rank: 5, playerName: 'ColorFlow', avatar: '🎨', title: 'Tân Binh Lục Lăng', score: 1340, gameId: 'hex-match', date: '2026-09-01' },
  ],
  'chess': [
    { id: 'lb-ch1', rank: 1, playerName: 'Grandmaster_VN', avatar: '♟️', title: 'Đại Kiện Tướng', score: 2150, gameId: 'chess', date: '2026-08-31' },
    { id: 'lb-ch2', rank: 2, playerName: 'DeepKnight', avatar: '🐴', title: 'Bậc Thầy Khai Cuộc', score: 1980, gameId: 'chess', date: '2026-08-31' },
    { id: 'lb-ch3', rank: 3, playerName: 'QueenGambit_Pro', avatar: '👑', title: 'Nữ Hoàng Bàn Cờ', score: 1820, gameId: 'chess', date: '2026-09-01' },
    { id: 'lb-ch4', rank: 4, playerName: 'RookMaster', avatar: '🏰', title: 'Kỳ Thủ Chiến Thuật', score: 1690, gameId: 'chess', date: '2026-09-01' },
    { id: 'lb-ch5', rank: 5, playerName: 'PawnStormer', avatar: '🎯', title: 'Tân Kỳ Thủ Quốc Tế', score: 1540, gameId: 'chess', date: '2026-09-01' },
  ],
  'xiangqi': [
    { id: 'lb-xq1', rank: 1, playerName: 'KyVuong_SaiGon', avatar: '🏮', title: 'Kỳ Vương Phương Nam', score: 2240, gameId: 'xiangqi', date: '2026-08-31' },
    { id: 'lb-xq2', rank: 2, playerName: 'MaChienKyThu', avatar: '🐴', title: 'Bát Quái Trận Đồ', score: 2050, gameId: 'xiangqi', date: '2026-08-31' },
    { id: 'lb-xq3', rank: 3, playerName: 'PhaoDauSatThu', avatar: '💣', title: 'Pháo Đầu Thần Tốc', score: 1910, gameId: 'xiangqi', date: '2026-09-01' },
    { id: 'lb-xq4', rank: 4, playerName: 'XeXuatTran', avatar: '🏎️', title: 'Xe Xuất Hoành Tảo', score: 1780, gameId: 'xiangqi', date: '2026-09-01' },
    { id: 'lb-xq5', rank: 5, playerName: 'TuongDieuBinh', avatar: '🏯', title: 'Kỳ Thủ Trầm Tĩnh', score: 1620, gameId: 'xiangqi', date: '2026-09-01' },
  ],
  'caro-gomoku': [
    { id: 'lb-cg1', rank: 1, playerName: 'CaroGod_VN', avatar: '⭕', title: 'Bất Bại Cờ Caro', score: 2310, gameId: 'caro-gomoku', date: '2026-08-31' },
    { id: 'lb-cg2', rank: 2, playerName: 'GomokuMaster', avatar: '❌', title: 'Bậc Thầy Chặn 4', score: 2120, gameId: 'caro-gomoku', date: '2026-08-31' },
    { id: 'lb-cg3', rank: 3, playerName: 'FiveInRow', avatar: '🎯', title: 'Thần Tốc Ngũ Tử', score: 1940, gameId: 'caro-gomoku', date: '2026-09-01' },
    { id: 'lb-cg4', rank: 4, playerName: 'CaroPro99', avatar: '👑', title: 'Kỳ Thủ Chiến Lược', score: 1790, gameId: 'caro-gomoku', date: '2026-09-01' },
    { id: 'lb-cg5', rank: 5, playerName: 'AlphaCaro', avatar: '🤖', title: 'Tân Kỳ Thủ Caro', score: 1650, gameId: 'caro-gomoku', date: '2026-09-01' },
  ],
  'eat-em-all': [
    { id: 'lb-eea1', rank: 1, playerName: 'BaoBao_Eater', avatar: '😋', title: 'Thực Thần Tối Thượng', score: 6250, gameId: 'eat-em-all', date: '2026-08-31' },
    { id: 'lb-eea2', rank: 2, playerName: 'FrostFury_99', avatar: '❄️', title: 'Băng Thần Tuyệt Đỉnh', score: 5120, gameId: 'eat-em-all', date: '2026-08-31' },
    { id: 'lb-eea3', rank: 3, playerName: 'FlameFeast', avatar: '🔥', title: 'Hỏa Thần Cuồng Nộ', score: 4380, gameId: 'eat-em-all', date: '2026-09-01' },
    { id: 'lb-eea4', rank: 4, playerName: 'HungryPanda', avatar: '🐼', title: 'Vua Ăn Vặt', score: 3490, gameId: 'eat-em-all', date: '2026-09-01' },
    { id: 'lb-eea5', rank: 5, playerName: 'NeonMouth', avatar: '👾', title: 'Tân Binh Phàm Ăn', score: 2650, gameId: 'eat-em-all', date: '2026-09-01' },
  ],
  'scoodoku': [
    { id: 'lb-sc1', rank: 1, playerName: 'SudokuGod_VN', avatar: '🔢', title: 'IQ 180 Tuyệt Đỉnh', score: 5890, gameId: 'scoodoku', date: '2026-08-31' },
    { id: 'lb-sc2', rank: 2, playerName: 'MatrixMaster', avatar: '🧠', title: 'Thiên Tài Tính Toán', score: 4720, gameId: 'scoodoku', date: '2026-08-31' },
    { id: 'lb-sc3', rank: 3, playerName: 'LogicQueen', avatar: '👑', title: 'Nữ Hoàng Ma Trận', score: 3950, gameId: 'scoodoku', date: '2026-09-01' },
    { id: 'lb-sc4', rank: 4, playerName: 'NumberNinja', avatar: '🥷', title: 'Bậc Thầy Điền Số', score: 3180, gameId: 'scoodoku', date: '2026-09-01' },
    { id: 'lb-sc5', rank: 5, playerName: 'BrainyBoy_HN', avatar: '🎯', title: 'Tân Kỳ Thủ Sudoku', score: 2450, gameId: 'scoodoku', date: '2026-09-01' },
  ],
};

export const DEFAULT_DAILY_CHALLENGERS: Record<string, Omit<LeaderboardEntry, 'id' | 'date' | 'rank'>[]> = {
  'eat-em-all': [
    { playerName: 'BaoBao_Eater', avatar: '😋', title: 'Thực Thần Tối Thượng', score: 3850, gameId: 'eat-em-all', extraStats: { maxCombo: 18, itemsEaten: 142, mode: 'Chiến Dịch' } },
    { playerName: 'FrostFury_99', avatar: '❄️', title: 'Băng Thần Tuyệt Đỉnh', score: 3120, gameId: 'eat-em-all', extraStats: { maxCombo: 14, itemsEaten: 118, mode: 'Endless' } },
    { playerName: 'FlameFeast', avatar: '🔥', title: 'Hỏa Thần Cuồng Nộ', score: 2640, gameId: 'eat-em-all', extraStats: { maxCombo: 11, itemsEaten: 98, mode: 'Time 60s' } },
    { playerName: 'HungryPanda', avatar: '🐼', title: 'Vua Ăn Vặt', score: 1980, gameId: 'eat-em-all', extraStats: { maxCombo: 8, itemsEaten: 76, mode: 'Chiến Dịch' } },
    { playerName: 'NeonMouth', avatar: '👾', title: 'Tân Binh Phàm Ăn', score: 1450, gameId: 'eat-em-all', extraStats: { maxCombo: 6, itemsEaten: 55, mode: 'Endless' } },
  ],
  'scoodoku': [
    { playerName: 'SudokuGod_VN', avatar: '🔢', title: 'IQ 180 Tuyệt Đỉnh', score: 4680, gameId: 'scoodoku', extraStats: { timeSpent: 105, difficulty: 'Chuyên Gia (IQ 180)', mistakes: 0 } },
    { playerName: 'MatrixMaster', avatar: '🧠', title: 'Thiên Tài Tính Toán', score: 3920, gameId: 'scoodoku', extraStats: { timeSpent: 132, difficulty: 'Khó', mistakes: 0 } },
    { playerName: 'LogicQueen', avatar: '👑', title: 'Nữ Hoàng Ma Trận', score: 3150, gameId: 'scoodoku', extraStats: { timeSpent: 168, difficulty: 'Khó', mistakes: 1 } },
    { playerName: 'NumberNinja', avatar: '🥷', title: 'Bậc Thầy Điền Số', score: 2400, gameId: 'scoodoku', extraStats: { timeSpent: 195, difficulty: 'Trung Bình', mistakes: 0 } },
    { playerName: 'BrainyBoy_HN', avatar: '🎯', title: 'Tân Kỳ Thủ Sudoku', score: 1850, gameId: 'scoodoku', extraStats: { timeSpent: 220, difficulty: 'Trung Bình', mistakes: 2 } },
  ],
};

export class StorageService {
  public static loadProfile(): PlayerProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...INITIAL_PLAYER_PROFILE, ...parsed };
      }
    } catch {
      // ignore
    }
    return INITIAL_PLAYER_PROFILE;
  }

  public static saveProfile(profile: PlayerProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }

  public static isOnboardingCompleted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
    } catch {
      return false;
    }
  }

  public static setOnboardingCompleted(completed: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, completed ? 'true' : 'false');
    } catch {
      // ignore
    }
  }


  public static loadInventory(): InventoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      if (data) {
        const parsed: InventoryItem[] = JSON.parse(data);
        // Merge with any new items that might have been added to defaults
        const existingIds = new Set(parsed.map(i => i.id));
        const missingDefaults = ALL_DEFAULT_ITEMS.filter(d => !existingIds.has(d.id));
        return [...parsed, ...missingDefaults];
      }
    } catch {
      // ignore
    }
    return ALL_DEFAULT_ITEMS;
  }

  public static saveInventory(items: InventoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  public static loadAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        const parsed: Achievement[] = JSON.parse(data);
        const existingIds = new Set(parsed.map(a => a.id));
        const missing = DEFAULT_ACHIEVEMENTS.filter(d => !existingIds.has(d.id));
        
        // Ensure rewardTitle and rarity are injected into parsed achievements
        const mergedParsed = parsed.map(p => {
          const def = DEFAULT_ACHIEVEMENTS.find(d => d.id === p.id);
          const updated = { ...p };
          if (def && def.rewardTitle && !updated.rewardTitle) {
            updated.rewardTitle = def.rewardTitle;
          }
          if (def && def.rarity && !updated.rarity) {
            updated.rarity = def.rarity;
          }
          return updated;
        });
        
        return [...mergedParsed, ...missing];
      }
    } catch {
      // ignore
    }
    return DEFAULT_ACHIEVEMENTS;
  }

  public static saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch {
      // ignore
    }
  }

  public static loadDailyQuests(): DailyQuest[] {
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
    this.saveDailyQuests(fresh);
    return fresh;
  }

  public static saveDailyQuests(quests: DailyQuest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
    } catch {
      // ignore
    }
  }

  public static loadLeaderboards(): Record<string, LeaderboardEntry[]> {
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

  public static saveLeaderboards(data: Record<string, LeaderboardEntry[]>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  // ==========================================
  // --- 24-HOUR DAILY LEADERBOARD SYSTEM ---
  // ==========================================
  public static getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  public static getYesterdayDateString(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }

  /**
   * Calculates time remaining until the next 24-hour reset (local midnight)
   */
  public static getDailyResetCountdown(): DailyResetTimer {
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
  public static loadAllDailyLeaderboards(): Record<string, Record<string, LeaderboardEntry[]>> {
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
  public static saveAllDailyLeaderboards(data: Record<string, Record<string, LeaderboardEntry[]>>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DAILY_LEADERBOARDS, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  /**
   * Generates default daily seed challengers for a game on a given dateKey
   */
  private static generateDailySeedEntries(gameId: string, dateKey: string): LeaderboardEntry[] {
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
  public static loadDailyLeaderboard(gameId: string, dateKey?: string): LeaderboardEntry[] {
    const targetDate = dateKey || this.getTodayDateString();
    const allData = this.loadAllDailyLeaderboards();
    const gameBoards = allData[gameId] || {};

    if (gameBoards[targetDate] && Array.isArray(gameBoards[targetDate]) && gameBoards[targetDate].length > 0) {
      // Re-sort to be confident
      const sorted = [...gameBoards[targetDate]].sort((a, b) => b.score - a.score);
      return sorted.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    }

    // Initialize fresh daily seed for this date
    const seeded = this.generateDailySeedEntries(gameId, targetDate);
    if (!allData[gameId]) allData[gameId] = {};
    allData[gameId][targetDate] = seeded;
    this.saveAllDailyLeaderboards(allData);

    return seeded;
  }

  /**
   * Save daily leaderboard for a specific game and date
   */
  public static saveDailyLeaderboard(gameId: string, dateKey: string, entries: LeaderboardEntry[]): void {
    const allData = this.loadAllDailyLeaderboards();
    if (!allData[gameId]) allData[gameId] = {};
    allData[gameId][dateKey] = entries;
    this.saveAllDailyLeaderboards(allData);
  }

  /**
   * Submit or update a player's score on the 24-hour daily leaderboard for today
   */
  public static submitDailyScore(
    gameId: string,
    playerName: string,
    score: number,
    avatar: string,
    title: string,
    extraStats?: Record<string, any>
  ): { rank: number; isNewDailyBest: boolean; entries: LeaderboardEntry[] } {
    const today = this.getTodayDateString();
    const currentList = this.loadDailyLeaderboard(gameId, today);
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

    this.saveDailyLeaderboard(gameId, today, updatedWithRanks);

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
  public static getDailyPersonalBest(gameId: string, playerName: string, dateKey?: string): number {
    const targetDate = dateKey || this.getTodayDateString();
    const list = this.loadDailyLeaderboard(gameId, targetDate);
    const entry = list.find((e) => e.playerName === playerName);
    return entry ? entry.score : 0;
  }

  // --- MULTI-GAME DAILY CHALLENGE SYSTEM ---
  public static loadAllDailyChallenges(): Record<string, DailyChallenge> {
    const today = new Date().toISOString().split('T')[0];
    const definitions: Record<string, Omit<DailyChallenge, 'id' | 'date' | 'completed' | 'claimed' | 'bestScoreAchieved' | 'bestTimeSpent'>> = {
      'blocker': {
        gameId: 'blocker',
        title: 'Thử Thách Xếp Gạch Siêu Tốc',
        description: 'Đạt 5,000 điểm trong vòng 3 phút trong mini-game Xếp Gạch',
        targetScore: 5000,
        timeLimitSeconds: 180,
        rewardCoins: 500,
        rewardGems: 25,
        rewardExp: 150,
        rewardTitle: 'Chiến Thần Xếp Gạch',
      },
      'chess': {
        gameId: 'chess',
        title: 'Đại Kiện Tướng Cờ Vua',
        description: 'Giành chiến thắng ván Cờ Vua trước Đại Kiện Tướng AI hoặc Người Chơi',
        targetScore: 1,
        timeLimitSeconds: 600,
        rewardCoins: 800,
        rewardGems: 40,
        rewardExp: 200,
        rewardTitle: 'Vua Cờ Vua',
      },
      'xiangqi': {
        gameId: 'xiangqi',
        title: 'Kỳ Thủ Cờ Tướng Lỗi Lạc',
        description: 'Chiếu tướng thành công đối thủ trong ván Cờ Tướng',
        targetScore: 1,
        timeLimitSeconds: 600,
        rewardCoins: 800,
        rewardGems: 40,
        rewardExp: 200,
        rewardTitle: 'Cao Thủ Cờ Tướng',
      },
      'caro-gomoku': {
        gameId: 'caro-gomoku',
        title: 'Bậc Thầy Caro Gomoku 15x15',
        description: 'Chiến thắng 1 trận Caro 15x15 trên bàn cờ chuẩn',
        targetScore: 1,
        timeLimitSeconds: 300,
        rewardCoins: 600,
        rewardGems: 30,
        rewardExp: 180,
        rewardTitle: 'Vua Caro',
      },
      'neon-runner': {
        gameId: 'neon-runner',
        title: 'Tốc Độ Ánh Sáng Cyberpunk',
        description: 'Chạy vượt mốc 3,500 điểm trên đại lộ Neon 2099',
        targetScore: 3500,
        timeLimitSeconds: 180,
        rewardCoins: 500,
        rewardGems: 25,
        rewardExp: 150,
        rewardTitle: 'Tia Chớp Neon',
      },
      'tile-2048': {
        gameId: 'tile-2048',
        title: 'Chinh Phục Ô Số 2048',
        description: 'Ghép thành công ô số 1024 hoặc 2048 trong Xếp Gạch 2048',
        targetScore: 1024,
        timeLimitSeconds: 300,
        rewardCoins: 600,
        rewardGems: 30,
        rewardExp: 180,
        rewardTitle: 'Bậc Thầy 2048',
      },
      'cyber-slice': {
        gameId: 'cyber-slice',
        title: 'Thần Kiếm Năng Lượng',
        description: 'Chém trúng 40 quả cầu năng lượng trong Cyber Slice',
        targetScore: 40,
        timeLimitSeconds: 120,
        rewardCoins: 450,
        rewardGems: 20,
        rewardExp: 120,
        rewardTitle: 'Kiếm Sĩ Cyber',
      },
      'cosmic-defense': {
        gameId: 'cosmic-defense',
        title: 'Hạm Đội Bảo Vệ Ngân Hà',
        description: 'Tiêu diệt 30 kẻ địch trong Cosmic Defense',
        targetScore: 30,
        timeLimitSeconds: 180,
        rewardCoins: 500,
        rewardGems: 25,
        rewardExp: 150,
        rewardTitle: 'Đại Tướng Không Gian',
      },
      'dungeon-tap': {
        gameId: 'dungeon-tap',
        title: 'Canh Nhịp Hầm Ngục Tối',
        description: 'Đạt điểm số 2,500 trong Dungeon Tap Roguelike',
        targetScore: 2500,
        timeLimitSeconds: 180,
        rewardCoins: 500,
        rewardGems: 25,
        rewardExp: 150,
        rewardTitle: 'Hiệp Sĩ Hầm Ngục',
      },
      'hex-match': {
        gameId: 'hex-match',
        title: 'Nổ Dây Chuyền Lục Giác',
        description: 'Đạt 4,000 điểm combo trong Hex Collapse',
        targetScore: 4000,
        timeLimitSeconds: 180,
        rewardCoins: 450,
        rewardGems: 20,
        rewardExp: 120,
        rewardTitle: 'Bậc Thầy Hex',
      },
      'draw-a-shape': {
        gameId: 'draw-a-shape',
        title: 'Nghệ Sĩ Vẽ Đường Nét',
        description: 'Vẽ chính xác 15 hình trong Draw A Shape',
        targetScore: 15,
        timeLimitSeconds: 120,
        rewardCoins: 400,
        rewardGems: 15,
        rewardExp: 100,
        rewardTitle: 'Bút Vàng Tài Hoa',
      },
    };

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

    this.saveAllDailyChallenges(defaultAll);
    return defaultAll;
  }

  public static saveAllDailyChallenges(challenges: Record<string, DailyChallenge>): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ALL_DAILY_CHALLENGES, JSON.stringify(challenges));
    } catch {
      // ignore
    }
  }

  public static loadDailyChallenge(gameId: string = 'blocker'): DailyChallenge {
    const all = this.loadAllDailyChallenges();
    return all[gameId] || all['blocker'];
  }

  public static saveDailyChallenge(challenge: DailyChallenge): void {
    const all = this.loadAllDailyChallenges();
    all[challenge.gameId] = challenge;
    this.saveAllDailyChallenges(all);
  }

  public static recordDailyChallengeAttempt(
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

    const all = this.loadAllDailyChallenges();
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
    this.saveAllDailyChallenges(all);
    return { challenge: updated, newlyCompleted, allChallenges: all };
  }

  public static claimDailyChallengeReward(gameId: string = 'blocker'): { challenge: DailyChallenge; success: boolean; allChallenges: Record<string, DailyChallenge> } {
    const all = this.loadAllDailyChallenges();
    const current = all[gameId] || all['blocker'];
    if (current && current.completed && !current.claimed) {
      const updated = { ...current, claimed: true };
      all[gameId] = updated;
      this.saveAllDailyChallenges(all);
      return { challenge: updated, success: true, allChallenges: all };
    }
    return { challenge: current || Object.values(all)[0], success: false, allChallenges: all };
  }

  public static loadFavorites(): string[] {
    return this.loadGeneric<string[]>(STORAGE_KEYS.FAVORITES, ['neon-runner', 'tile-2048']);
  }

  public static saveFavorites(favorites: string[]): void {
    this.saveGeneric<string[]>(STORAGE_KEYS.FAVORITES, favorites);
  }

  public static toggleFavorite(gameId: string): string[] {
    const current = this.loadFavorites();
    const exists = current.includes(gameId);
    const updated = exists ? current.filter(id => id !== gameId) : [...current, gameId];
    this.saveFavorites(updated);
    return updated;
  }

  public static loadRecentlyPlayed(): string[] {
    return this.loadGeneric<string[]>(STORAGE_KEYS.RECENT_GAMES, ['neon-runner', 'tile-2048', 'cyber-slice']);
  }

  public static recordRecentlyPlayed(gameId: string): string[] {
    const current = this.loadRecentlyPlayed().filter(id => id !== gameId);
    const updated = [gameId, ...current].slice(0, 3);
    this.saveGeneric<string[]>(STORAGE_KEYS.RECENT_GAMES, updated);
    return updated;
  }

  public static loadGeneric<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return defaultValue;
  }

  public static saveGeneric<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  public static exportData(): string {
    return this.exportDataBackup();
  }

  public static importData(jsonStr: string): boolean {
    return this.importDataBackup(jsonStr);
  }

  public static loadForgeMastery(): ForgeMasteryState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FORGE_MASTERY);
      if (data) {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_FORGE_MASTERY, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_FORGE_MASTERY;
  }

  public static saveForgeMastery(state: ForgeMasteryState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FORGE_MASTERY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }

  public static clearAll(): void {
    try {
      localStorage.clear();
    } catch {
      // ignore
    }
  }

  public static exportDataBackup(): string {
    const backup = {
      profile: this.loadProfile(),
      inventory: this.loadInventory(),
      achievements: this.loadAchievements(),
      dailyQuests: this.loadDailyQuests(),
      leaderboards: this.loadLeaderboards(),
      forgeMastery: this.loadForgeMastery(),
      timestamp: Date.now(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public static importDataBackup(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) this.saveProfile(data.profile);
      if (data.inventory) this.saveInventory(data.inventory);
      if (data.achievements) this.saveAchievements(data.achievements);
      if (data.dailyQuests) this.saveDailyQuests(data.dailyQuests);
      if (data.forgeMastery) this.saveForgeMastery(data.forgeMastery);
      return true;
    } catch {
      return false;
    }
  }

  // --- PAUSED GAME STATE (AUTO-SAVE/RESUME) ---
  public static savePausedGame(session: PausedGameSession | null): void {
    try {
      if (!session) {
        localStorage.removeItem(STORAGE_KEYS.PAUSED_GAME);
      } else {
        localStorage.setItem(STORAGE_KEYS.PAUSED_GAME, JSON.stringify(session));
      }
    } catch {
      // ignore
    }
  }

  public static loadPausedGame(): PausedGameSession | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PAUSED_GAME);
      return data ? (JSON.parse(data) as PausedGameSession) : null;
    } catch {
      return null;
    }
  }

  public static clearPausedGame(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PAUSED_GAME);
    } catch {
      // ignore
    }
  }

  // --- RECIPE DISCOVERY & LEGENDARY BLUEPRINTS ---
  public static loadDiscoveredBlueprintIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BLUEPRINTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return ['bp-infinity-edge']; // Player starts with 1 unlocked blueprint for exploration!
  }

  public static saveDiscoveredBlueprintIds(blueprintIds: string[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BLUEPRINTS, JSON.stringify(blueprintIds));
    } catch {
      // ignore
    }
  }

  public static unlockBlueprint(blueprintId: string): boolean {
    const current = this.loadDiscoveredBlueprintIds();
    if (!current.includes(blueprintId)) {
      const updated = [...current, blueprintId];
      this.saveDiscoveredBlueprintIds(updated);
      return true;
    }
    return false;
  }

  public static loadDiscoveryLog(): RecipeDiscoveryLogEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DISCOVERY_LOG);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    // Seed with an inspiring initial entry if empty
    return [
      {
        id: 'log-welcome-discovery',
        timestamp: Date.now() - 3600000 * 2,
        ingredients: [
          { id: 'mat-cyber-alloy', name: 'Hợp Kim Cyber Titan', icon: '🔩', rarity: 'common' },
          { id: 'mat-neon-battery', name: 'Pin Lăng Kính Neon', icon: '🔋', rarity: 'common' },
          { id: 'skin-runner-emerald', name: 'Giáp Sinh Tồn Emerald', icon: '🎽', rarity: 'uncommon' },
        ],
        success: true,
        discoveredBlueprint: DEFAULT_LEGENDARY_BLUEPRINTS[0],
        rewardDescription: 'Phát hiện cổ thư thất truyền! Bản Thiết Kế Gươm Thần Vô Cực đã mở khóa.',
        rewardCoins: 500,
        rewardGems: 20,
        rewardExp: 150,
      },
    ];
  }

  public static saveDiscoveryLog(log: RecipeDiscoveryLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DISCOVERY_LOG, JSON.stringify(log.slice(0, 50))); // Keep last 50 entries
    } catch {
      // ignore
    }
  }

  public static addDiscoveryLogEntry(entry: RecipeDiscoveryLogEntry): RecipeDiscoveryLogEntry[] {
    const current = this.loadDiscoveryLog();
    const updated = [entry, ...current].slice(0, 50);
    this.saveDiscoveryLog(updated);
    return updated;
  }

  public static clearDiscoveryLog(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.DISCOVERY_LOG);
    } catch {
      // ignore
    }
  }

  // ==========================================
  // --- FRIENDS LIST SYSTEM ---
  // ==========================================
  public static loadFriends(): Friend[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FRIENDS_LIST);
      if (data) {
        const parsed = JSON.parse(data) as Friend[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Dynamic presence jitter for simulated online friends to feel alive
          const now = Date.now();
          return parsed.map((f, idx) => {
            const isSimulated = f.id.startsWith('friend_sim_');
            if (isSimulated) {
              const isOnline = idx % 2 === 0 || now % 3 !== 0;
              return {
                ...f,
                isOnline,
                lastSeen: isOnline ? now - (idx * 60000) : now - (idx * 3600000),
              };
            }
            return f;
          });
        }
      }
    } catch {
      // ignore
    }
    const defaults = DEFAULT_SEED_FRIENDS;
    this.saveFriends(defaults);
    return defaults;
  }

  public static saveFriends(friends: Friend[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.FRIENDS_LIST, JSON.stringify(friends));
    } catch {
      // ignore
    }
  }

  public static addFriend(friend: Friend): Friend[] {
    const current = this.loadFriends();
    const existingIndex = current.findIndex(f => f.id === friend.id || f.username.toLowerCase() === friend.username.toLowerCase());
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...friend };
      this.saveFriends(current);
      return current;
    }
    const updated = [friend, ...current];
    this.saveFriends(updated);
    return updated;
  }

  public static removeFriend(friendId: string): Friend[] {
    const current = this.loadFriends();
    const updated = current.filter(f => f.id !== friendId);
    this.saveFriends(updated);
    return updated;
  }

  public static loadMatchHistory(): MatchHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCH_HISTORY);
      if (data) {
        return JSON.parse(data) as MatchHistoryItem[];
      }
    } catch {
      // ignore
    }
    return [];
  }

  public static saveMatchHistory(history: MatchHistoryItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MATCH_HISTORY, JSON.stringify(history.slice(0, 50)));
    } catch {
      // ignore
    }
  }

  public static addMatchHistory(item: MatchHistoryItem): MatchHistoryItem[] {
    const current = this.loadMatchHistory();
    const updated = [item, ...current].slice(0, 50);
    this.saveMatchHistory(updated);
    return updated;
  }

  // ==========================================
  // --- WEEKLY QUEST & MILESTONE SYSTEM ---
  // ==========================================
  public static getWeeklyQuestWeekKey(): string {
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
  public static getWeeklyResetCountdown(): WeeklyResetTimer {
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

  public static loadWeeklyQuests(): WeeklyQuest[] {
    try {
      const currentWeekKey = this.getWeeklyQuestWeekKey();
      const savedWeekKey = localStorage.getItem(STORAGE_KEYS.WEEKLY_QUEST_WEEK_KEY);

      if (savedWeekKey !== currentWeekKey) {
        // New week: Reset weekly quests and milestone rewards
        localStorage.setItem(STORAGE_KEYS.WEEKLY_QUEST_WEEK_KEY, currentWeekKey);
        const freshQuests = DEFAULT_WEEKLY_QUESTS;
        const freshMilestones = DEFAULT_WEEKLY_MILESTONES;
        this.saveWeeklyQuests(freshQuests);
        this.saveWeeklyMilestones(freshMilestones);
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
    this.saveWeeklyQuests(fresh);
    return fresh;
  }

  public static saveWeeklyQuests(quests: WeeklyQuest[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_QUESTS, JSON.stringify(quests));
    } catch {
      // ignore
    }
  }

  public static loadWeeklyMilestones(): WeeklyMilestoneReward[] {
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
    this.saveWeeklyMilestones(defaults);
    return defaults;
  }

  public static saveWeeklyMilestones(milestones: WeeklyMilestoneReward[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.WEEKLY_MILESTONES, JSON.stringify(milestones));
    } catch {
      // ignore
    }
  }
}

export const DEFAULT_SEED_FRIENDS: Friend[] = [
  {
    id: 'friend_sim_1',
    username: 'ShadowBlade_VN',
    avatar: '🥷',
    currentTitle: 'Cao Thủ Cờ Tướng',
    level: 18,
    elo: 1520,
    isOnline: true,
    lastSeen: Date.now() - 120000,
    customStatus: 'Sẵn sàng thách đấu Cờ Tướng!',
    favoriteGameId: 'xiangqi',
    friendshipDate: Date.now() - 86400000 * 12,
  },
  {
    id: 'friend_sim_2',
    username: 'CyberDragon_VN',
    avatar: '🐉',
    currentTitle: 'Thợ Săn Điểm Kỷ Lục',
    level: 26,
    elo: 1840,
    isOnline: true,
    lastSeen: Date.now() - 45000,
    customStatus: 'Đang cày top Hex Match 🧩',
    favoriteGameId: 'hex-match',
    friendshipDate: Date.now() - 86400000 * 20,
  },
  {
    id: 'friend_sim_3',
    username: 'NeonValkyrie',
    avatar: '⚡',
    currentTitle: 'Tia Chớp Neon',
    level: 14,
    elo: 1310,
    isOnline: false,
    lastSeen: Date.now() - 3600000 * 3,
    customStatus: 'Ngoại tuyến 3 giờ trước',
    favoriteGameId: 'neon-runner',
    friendshipDate: Date.now() - 86400000 * 5,
  },
  {
    id: 'friend_sim_4',
    username: 'GrandMaster_Dan',
    avatar: '👑',
    currentTitle: 'Đại Kỳ Thủ Caro',
    level: 32,
    elo: 2150,
    isOnline: true,
    lastSeen: Date.now() - 10000,
    customStatus: 'Đang leo tháp Cao Thủ Caro ⚔️',
    favoriteGameId: 'caro-gomoku',
    friendshipDate: Date.now() - 86400000 * 30,
  },
];

export const DEFAULT_WEEKLY_QUESTS: WeeklyQuest[] = [
  {
    id: 'wq_1',
    title: 'Chiến Binh Bất Tận',
    description: 'Chơi tổng cộng 15 ván game bất kỳ trong tuần',
    type: 'play_games',
    icon: '🎮',
    target: 15,
    current: 4,
    completed: false,
    claimed: false,
    questPoints: 25,
    rewardCoins: 800,
    rewardGems: 20,
    rewardExp: 600,
  },
  {
    id: 'wq_2',
    title: 'Cơn Mưa Điểm Số',
    description: 'Tích lũy tổng cộng 20,000 điểm trên mọi trò chơi',
    type: 'total_score',
    icon: '⚡',
    target: 20000,
    current: 6850,
    completed: false,
    claimed: false,
    questPoints: 30,
    rewardCoins: 1000,
    rewardGems: 25,
    rewardExp: 800,
  },
  {
    id: 'wq_3',
    title: 'Vua Đấu Trường PvP',
    description: 'Chiến thắng 3 ván Đấu Trí PvP hoặc Thách Đấu Bạn Bè (Cờ Tướng / Caro)',
    type: 'win_matches',
    icon: '⚔️',
    target: 3,
    current: 1,
    completed: false,
    claimed: false,
    questPoints: 30,
    rewardCoins: 1200,
    rewardGems: 30,
    rewardExp: 1000,
  },
  {
    id: 'wq_4',
    title: 'Nhà Khai Quật Kho Báu',
    description: 'Mở 6 rương báu các loại nhận từ chiến tích',
    type: 'open_chests',
    icon: '📦',
    target: 6,
    current: 2,
    completed: false,
    claimed: false,
    questPoints: 20,
    rewardCoins: 600,
    rewardGems: 15,
    rewardExp: 400,
  },
  {
    id: 'wq_5',
    title: 'Bậc Thầy Tôi Luyện',
    description: 'Chế tác hoặc dung hợp 3 trang bị trong Lò Rèn Ma Thuật',
    type: 'craft_items',
    icon: '🔨',
    target: 3,
    current: 1,
    completed: false,
    claimed: false,
    questPoints: 20,
    rewardCoins: 600,
    rewardGems: 15,
    rewardExp: 400,
  },
  {
    id: 'wq_6',
    title: 'Chinh Phục Thử Thách Ngày',
    description: 'Vượt qua 3 màn Thử Thách Ngày (Daily Challenge)',
    type: 'daily_challenges',
    icon: '🏆',
    target: 3,
    current: 1,
    completed: false,
    claimed: false,
    questPoints: 25,
    rewardCoins: 900,
    rewardGems: 25,
    rewardExp: 750,
  },
];

export const DEFAULT_WEEKLY_MILESTONES: WeeklyMilestoneReward[] = [
  {
    tier: 1,
    requiredPoints: 25,
    percentage: 25,
    title: 'Cột Mốc Đồng (25 Điểm)',
    description: 'Khởi đầu tuần mới! Nhận Rương Đồng và quà tân thủ.',
    chestType: 'common',
    chestCount: 1,
    rewardCoins: 500,
    rewardGems: 10,
    rewardExp: 300,
    claimed: false,
    icon: '🥉',
  },
  {
    tier: 2,
    requiredPoints: 50,
    percentage: 50,
    title: 'Cột Mốc Bạc (50 Điểm)',
    description: 'Bứt phá giữa tuần! Nhận Rương Bạc Neon cao cấp.',
    chestType: 'rare',
    chestCount: 1,
    rewardCoins: 1000,
    rewardGems: 25,
    rewardExp: 700,
    claimed: false,
    icon: '🥈',
  },
  {
    tier: 3,
    requiredPoints: 75,
    percentage: 75,
    title: 'Cột Mốc Vàng (75 Điểm)',
    description: 'Bậc thầy nỗ lực! Nhận Rương Vàng Cyberpunk huyền bí.',
    chestType: 'epic',
    chestCount: 1,
    rewardCoins: 2000,
    rewardGems: 50,
    rewardExp: 1500,
    claimed: false,
    icon: '🥇',
  },
  {
    tier: 4,
    requiredPoints: 100,
    percentage: 100,
    title: 'Cột Mốc Thần Thoại (100 Điểm)',
    description: 'Đỉnh cao vinh quang tuần! Rương Thần Thoại + Danh Hiệu 👑 Bậc Thầy Tuần!',
    chestType: 'legendary',
    chestCount: 1,
    rewardCoins: 4000,
    rewardGems: 120,
    rewardExp: 3500,
    specialTitle: '👑 Bậc Thầy Tuần',
    claimed: false,
    icon: '💎',
  },
];

export { DEFAULT_LEGENDARY_BLUEPRINTS } from '../data/legendaryBlueprints';

export interface ForgeMasteryLevelDef {
  level: number;
  title: string;
  expNeeded: number;
  criticalUnlocked: boolean;
  criticalRate: number; // 0 to 1
  description: string;
}

export const FORGE_MASTERY_LEVELS: ForgeMasteryLevelDef[] = [
  {
    level: 1,
    title: 'Tập Sự Lò Rèn',
    expNeeded: 100,
    criticalUnlocked: false,
    criticalRate: 0,
    description: 'Bắt đầu rèn đúc cơ bản. Nâng cấp 3 món đồng cấp thành 1 món cấp kế tiếp.',
  },
  {
    level: 2,
    title: 'Thợ Rèn Tinh Anh',
    expNeeded: 250,
    criticalUnlocked: false,
    criticalRate: 0,
    description: 'Kỹ năng nâng cao. Chuẩn bị khai mở tuyệt kỹ Bạo Kích Luyện Kim (Critical Crafting).',
  },
  {
    level: 3,
    title: 'Nghệ Nhân Luyện Kim',
    expNeeded: 500,
    criticalUnlocked: true,
    criticalRate: 0.10, // 10% critical rate
    description: '⚡ Mở Khóa Critical Crafting! 10% cơ hội đột phá trực tiếp ra trang bị HUYỀN THOẠI (Legendary)!',
  },
  {
    level: 4,
    title: 'Bậc Thầy Tôi Luyện',
    expNeeded: 900,
    criticalUnlocked: true,
    criticalRate: 0.18, // 18% critical rate
    description: '⚡ Bậc Thầy Rèn Đúc! Tăng tỷ lệ Bạo Kích Luyện Kim lên 18% nhận trang bị HUYỀN THOẠI.',
  },
  {
    level: 5,
    title: 'Đại Sư Lò Rèn Thần Thánh',
    expNeeded: 999999,
    criticalUnlocked: true,
    criticalRate: 0.25, // 25% critical rate
    description: '👑 Cảnh Giới Tối Cao! 25% cơ hội Bạo Kích Luyện Kim tạo ra kỳ quan HUYỀN THOẠI vượt cấp.',
  },
];

export const DEFAULT_FORGE_MASTERY: ForgeMasteryState = {
  level: 1,
  title: 'Tập Sự Lò Rèn',
  exp: 0,
  expNeeded: 100,
  totalCrafts: 0,
  criticalCraftsCount: 0,
  criticalUnlocked: false,
  criticalRate: 0,
};

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

export const DAILY_LOGIN_REWARDS_LIST: DailyLoginRewardItem[] = [
  {
    day: 1,
    title: 'Khởi Đầu Tân Binh',
    coins: 300,
    gems: 5,
    exp: 50,
    icon: '🪙',
  },
  {
    day: 2,
    title: 'Tăng Tốc Năng Lượng',
    coins: 450,
    gems: 15,
    exp: 80,
    icon: '⚡',
  },
  {
    day: 3,
    title: 'Hòm Báu Quý Hiếm',
    coins: 500,
    gems: 20,
    exp: 100,
    chestType: 'rare',
    chestCount: 1,
    badge: 'RƯƠNG HIẾM',
    icon: '📦',
  },
  {
    day: 4,
    title: 'Kho Báu Kim Cương',
    coins: 700,
    gems: 30,
    exp: 150,
    icon: '💎',
  },
  {
    day: 5,
    title: 'Hòm Sử Thi Tinh Anh',
    coins: 800,
    gems: 35,
    exp: 200,
    chestType: 'epic',
    chestCount: 1,
    badge: 'RƯƠNG SỬ THI',
    icon: '🧰',
  },
  {
    day: 6,
    title: 'Chiến Tích Bất Diệt',
    coins: 1000,
    gems: 50,
    exp: 250,
    icon: '🔥',
  },
  {
    day: 7,
    title: 'Đại Tiệc Huyền Thoại 7 Ngày',
    coins: 2000,
    gems: 100,
    exp: 500,
    chestType: 'legendary',
    chestCount: 1,
    specialItemTitle: 'Rương Huyền Thoại + Danh Hiệu 👑',
    badge: 'JACKPOT 7 NGÀY',
    highlight: true,
    icon: '👑',
  },
];

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


