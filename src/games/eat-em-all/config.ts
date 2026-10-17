import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';
import { BackgroundTheme, ComboTierInfo, Difficulty, PowerUpType } from './types';

export const EAT_EM_ALL_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'ach-eat-first-game',
    title: 'Tân Binh Nuốt Chửng',
    description: 'Ăn thành công 20 vật phẩm trong Eat em All.',
    icon: '😋',
    target: 20,
    rewardExp: 100,
    rewardCoins: 200,
    rewardGems: 10,
  },
  {
    id: 'ach-eat-combo-master',
    title: 'Bậc Thầy Combo x15',
    description: 'Đạt chuỗi ăn liên hoàn liên tiếp 15 combo mà không bị đứt đoạn.',
    icon: '🔥',
    target: 15,
    rewardExp: 300,
    rewardCoins: 600,
    rewardGems: 20,
  },
  {
    id: 'ach-eat-powerup-collector',
    title: 'Chiến Binh Đầy Năng Lượng',
    description: 'Thu thập 6 vật phẩm hỗ trợ Power-up (Khiên, Nam Châm, Tăng Tốc, Đóng Băng).',
    icon: '🧲',
    target: 6,
    rewardExp: 250,
    rewardCoins: 500,
    rewardGems: 15,
  },
  {
    id: 'ach-eat-fury-master',
    title: 'Bão Lửa Cuồng Nộ Fury x10',
    description: 'Kích hoạt trạng thái Elemental Fury 3 lần.',
    icon: '⚡',
    target: 3,
    rewardExp: 250,
    rewardCoins: 500,
    rewardGems: 25,
  },
  {
    id: 'ach-eat-target-stage-5',
    title: 'Chiến Binh Nguyên Tố',
    description: 'Chinh phục 5 màn chơi trong chế độ Chiến Dịch (Target Mode).',
    icon: '🛡️',
    target: 5,
    rewardExp: 400,
    rewardCoins: 800,
    rewardGems: 35,
  },
  {
    id: 'ach-eat-space-theme',
    title: 'Du Hành Không Gian',
    description: 'Mở khóa hoặc tiến sâu vào chủ đề Vũ Trụ Deep Space.',
    icon: '🌌',
    target: 1,
    rewardExp: 500,
    rewardCoins: 1000,
    rewardGems: 40,
  },
  {
    id: 'ach-eat-endless-1500',
    title: 'Kẻ Nuốt Chửng Huyền Thoại',
    description: 'Đạt 1,500 điểm trong chế độ Sinh Tồn (Endless Survival).',
    icon: '👑',
    target: 1500,
    rewardExp: 750,
    rewardCoins: 1500,
    rewardGems: 60,
  },
];

export const EAT_EM_ALL_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.5,
  scoreThresholdForDrop: 250,
  chestWeights: [
    { type: 'common', weight: 50 },
    { type: 'rare', weight: 30 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const DIFFICULTY_PRESETS: Record<
  Difficulty,
  {
    label: string;
    description: string;
    color: string;
    speedMultiplier: number;
    spawnIntervalMs: number;
    initialLives: number;
    scoreBonus: number;
    bombRate: number;
  }
> = {
  easy: {
    label: 'Dễ',
    description: 'Tốc độ rơi nhẹ nhàng, ít bom độc, 5 Mạng hồi sức',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10',
    speedMultiplier: 1.0,
    spawnIntervalMs: 1100,
    initialLives: 5,
    scoreBonus: 1.0,
    bombRate: 0.12,
  },
  normal: {
    label: 'Vừa',
    description: 'Tốc độ rơi chuẩn arcade, bom vừa phải, 3 Mạng',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10',
    speedMultiplier: 1.35,
    spawnIntervalMs: 900,
    initialLives: 3,
    scoreBonus: 1.25,
    bombRate: 0.2,
  },
  hard: {
    label: 'Khó',
    description: 'Tốc độ rơi nhanh, phản xạ đổi hệ chớp nhoáng, bom dày',
    color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',
    speedMultiplier: 1.75,
    spawnIntervalMs: 720,
    initialLives: 3,
    scoreBonus: 1.6,
    bombRate: 0.28,
  },
  insane: {
    label: 'Điên Cuồng',
    description: 'Mưa vật phẩm siêu tốc, bão bom tử thần, chỉ dành cho cao thủ',
    color: 'text-rose-500 border-rose-500/40 bg-rose-500/10',
    speedMultiplier: 2.2,
    spawnIntervalMs: 550,
    initialLives: 2,
    scoreBonus: 2.0,
    bombRate: 0.35,
  },
};

export { CAMPAIGN_STAGES as STAGES_CONFIG } from './campaign';

export const COMBO_TIERS: ComboTierInfo[] = [
  { minCombo: 30, multiplier: 6, name: 'GODLIKE! 👑', color: '#f43f5e', badgeBg: 'bg-rose-500/20 border-rose-500/60 text-rose-300', icon: '👑' },
  { minCombo: 20, multiplier: 5, name: 'ULTRA! 💎', color: '#ec4899', badgeBg: 'bg-pink-500/20 border-pink-500/60 text-pink-300', icon: '💎' },
  { minCombo: 15, multiplier: 4, name: 'MEGA! 🌟', color: '#a855f7', badgeBg: 'bg-purple-500/20 border-purple-500/60 text-purple-300', icon: '🌟' },
  { minCombo: 10, multiplier: 3, name: 'SUPER! ⚡', color: '#38bdf8', badgeBg: 'bg-sky-500/20 border-sky-500/60 text-sky-300', icon: '⚡' },
  { minCombo: 5, multiplier: 2, name: 'NICE! 🔥', color: '#f59e0b', badgeBg: 'bg-amber-500/20 border-amber-500/60 text-amber-300', icon: '🔥' },
  { minCombo: 0, multiplier: 1, name: 'READY', color: '#94a3b8', badgeBg: 'bg-slate-700/20 border-slate-600/40 text-slate-300', icon: '✨' },
];

export function getComboTier(combo: number): ComboTierInfo {
  return COMBO_TIERS.find(t => combo >= t.minCombo) || COMBO_TIERS[COMBO_TIERS.length - 1];
}

export interface ThemeConfig {
  id: BackgroundTheme;
  name: string;
  subname: string;
  icon: string;
  topGradient: string;
  midGradient: string;
  botGradient: string;
  ambientColor: string;
  accentColor: string;
  featureDescription: string;
}

export const THEME_CONFIGS: Record<BackgroundTheme, ThemeConfig> = {
  day: {
    id: 'day',
    name: 'Bình Minh Skylight',
    subname: 'Vùng Trời Thanh Khiết',
    icon: '☀️',
    topGradient: '#075985',
    midGradient: '#0284c7',
    botGradient: '#0c4a6e',
    ambientColor: 'rgba(56, 189, 248, 0.18)',
    accentColor: '#38bdf8',
    featureDescription: 'Ánh nắng ban mai trong lành & làn mây lượn lờ bồng bềnh',
  },
  sunset: {
    id: 'sunset',
    name: 'Hoàng Hôn Twilight',
    subname: 'Đỉnh Núi Ráng Chiều',
    icon: '🌅',
    topGradient: '#4c0519',
    midGradient: '#881337',
    botGradient: '#1e081c',
    ambientColor: 'rgba(244, 63, 94, 0.22)',
    accentColor: '#fb7185',
    featureDescription: 'Ráng chiều rực rỡ & đom đóm dạ quang lơ lửng',
  },
  night: {
    id: 'night',
    name: 'Đêm Huyền Bí Midnight',
    subname: 'Bầu Trời Cực Quang',
    icon: '🌙',
    topGradient: '#020617',
    midGradient: '#0f172a',
    botGradient: '#1e1b4b',
    ambientColor: 'rgba(129, 140, 248, 0.2)',
    accentColor: '#818cf8',
    featureDescription: 'Chòm sao tinh tú lấp lánh & dải cực quang lung linh',
  },
  space: {
    id: 'space',
    name: 'Vũ Trụ Sâu Thẳm Deep Space',
    subname: 'Thiên Hà Tinh Vân',
    icon: '🌌',
    topGradient: '#090514',
    midGradient: '#190a36',
    botGradient: '#07020e',
    ambientColor: 'rgba(168, 85, 247, 0.25)',
    accentColor: '#c084fc',
    featureDescription: 'Tinh vân xoắn ốc vô tận & mưa bụi sao thiên thạch',
  },
  solar: {
    id: 'solar',
    name: 'Bão Mặt Trời Solar Flare',
    subname: 'Vành Nhật Hoa Rực Lửa',
    icon: '☀️🔥',
    topGradient: '#360900',
    midGradient: '#571300',
    botGradient: '#180400',
    ambientColor: 'rgba(249, 115, 22, 0.3)',
    accentColor: '#fb923c',
    featureDescription: 'Bão năng lượng nguyên tử & vành nhật hoa plasma',
  },
};

export const POWERUP_CONFIGS: Record<PowerUpType, {
  name: string;
  icon: string;
  shortDesc: string;
  description: string;
  duration?: number;
  color: string;
  bgBadge: string;
}> = {
  shield: {
    name: 'Khiên Bảo Hộ',
    icon: '🛡️',
    shortDesc: 'Chặn 1 đòn sát thương',
    description: 'Bảo vệ bạn khỏi 1 va chạm bom hoặc độc mà không mất máu hay rớt chuỗi combo!',
    color: '#06b6d4',
    bgBadge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  },
  magnet: {
    name: 'Nam Châm Hút Quả',
    icon: '🧲',
    shortDesc: 'Hút vật phẩm ăn được trong 8s',
    description: 'Tạo luồng từ trường siêu mạnh kéo toàn bộ quả cầu ăn được về miệng nhân vật!',
    duration: 8,
    color: '#a855f7',
    bgBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
  speed: {
    name: 'Tăng Tốc Phản Xạ',
    icon: '⚡',
    shortDesc: 'Di chuyển siêu tốc trong 8s',
    description: 'Tăng gấp đôi tốc độ di chuyển và độ linh hoạt giúp bạn dễ dàng đón bắt quả cầu!',
    duration: 8,
    color: '#eab308',
    bgBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  slowmo: {
    name: 'Đóng Băng Thời Gian',
    icon: '❄️',
    shortDesc: 'Làm chậm tốc độ rơi 40% trong 6s',
    description: 'Làm chậm thời gian khiến tất cả quả cầu rơi nhẹ như bông tuyết để kịp xử lý!',
    duration: 6,
    color: '#38bdf8',
    bgBadge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
  },
};

export const EAT_EM_ALL_CONTROLS: GameControlInfo[] = [
  { key: 'Trượt Ngón Tay / Chuột', action: 'Điều khiển nhân vật di chuyển ngang bắt các vật phẩm' },
  { key: 'Phím Phím Mũi Tên / A - D', action: 'Di chuyển nhân vật sang Trái hoặc Phải' },
  { key: 'Phím Space / Nút Đổi Hệ', action: 'Chuyển đổi trạng thái BĂNG (❄) hoặc LỬA (🔥)' },
  { key: 'Combo Meter & Multiplier', action: 'Ăn liên tiếp để tăng điểm nhân x2, x3, x4, x5 lên tới x6 (GODLIKE)!' },
  { key: 'Vật Phẩm Hỗ Trợ (Power-ups)', action: 'Nhặt Khiên (🛡️), Nam Châm (🧲), Tăng Tốc (⚡), Đóng Băng (❄️)' },
  { key: 'F / Nút FURY', action: 'Đầy thanh: chủ động kích hoạt Fury 5 giây, điểm x5 và nuốt cả bom độc.' },
];


