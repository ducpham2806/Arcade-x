import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';
import { BackgroundTheme, ComboTierInfo, Difficulty, PowerUpType, StageConfig } from './types';

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

export const STAGES_CONFIG: StageConfig[] = [
  {
    id: 1,
    title: 'Màn 1: Tập Huấn Băng Tuyết',
    subtitle: 'Làm quen thao tác hứng quả cầu',
    targetCount: 15,
    targetItems: { ice: 10, star: 5 },
    fallSpeedMultiplier: 1.0,
    spawnIntervalMs: 1100,
    bombChance: 0.08,
    poisonChance: 0.0,
    powerUpChance: 0.12,
    theme: 'day',
    description: 'Hứng 10 Quả Cầu Băng (❄) và 5 Ngôi Sao (⭐). Tránh bom!',
  },
  {
    id: 2,
    title: 'Màn 2: Hỏa Diệm Khởi Sắc',
    subtitle: 'Luyện tập chuyển đổi hệ Lửa',
    targetCount: 20,
    targetItems: { fire: 12, star: 8 },
    fallSpeedMultiplier: 1.15,
    spawnIntervalMs: 1000,
    bombChance: 0.12,
    poisonChance: 0.0,
    powerUpChance: 0.12,
    theme: 'day',
    description: 'Nhấn Space đổi sang Hệ Lửa (🔥) để ăn 12 Quả Cầu Lửa và 8 Sao.',
  },
  {
    id: 3,
    title: 'Màn 3: Song Trận Băng & Hỏa',
    subtitle: 'Chuyển đổi hệ liên tục',
    targetCount: 25,
    targetItems: { ice: 12, fire: 13 },
    fallSpeedMultiplier: 1.25,
    spawnIntervalMs: 950,
    bombChance: 0.15,
    poisonChance: 0.02,
    powerUpChance: 0.14,
    theme: 'day',
    description: 'Ăn đúng 12 Băng và 13 Lửa. Nhớ đổi hệ để không bị thương!',
  },
  {
    id: 4,
    title: 'Màn 4: Cơn Mưa Tinh Thể',
    subtitle: 'Tập trung nhặt Ngọc & Sao',
    targetCount: 30,
    targetItems: { gem: 6, star: 14, ice: 10 },
    fallSpeedMultiplier: 1.35,
    spawnIntervalMs: 900,
    bombChance: 0.18,
    poisonChance: 0.03,
    powerUpChance: 0.15,
    theme: 'sunset',
    description: 'Ăn 6 Viên Ngọc (💎), 14 Sao (⭐) và 10 Quả Cầu Băng (❄).',
  },
  {
    id: 5,
    title: 'Màn 5: Kích Hoạt Cuồng Nộ',
    subtitle: 'Nạp đầy năng lượng Fury x10',
    targetCount: 35,
    targetItems: { ice: 15, fire: 15, gem: 5 },
    fallSpeedMultiplier: 1.45,
    spawnIntervalMs: 850,
    bombChance: 0.2,
    poisonChance: 0.05,
    powerUpChance: 0.16,
    theme: 'sunset',
    description: 'Ăn liên hoàn để kích hoạt trạng thái ELEMENTAL FURY quét sạch bom!',
  },
  {
    id: 6,
    title: 'Màn 6: Bão Bom Tử Thần',
    subtitle: 'Đấu trường chướng ngại vật',
    targetCount: 35,
    targetItems: { ice: 15, fire: 15, star: 5 },
    fallSpeedMultiplier: 1.55,
    spawnIntervalMs: 800,
    bombChance: 0.28,
    poisonChance: 0.06,
    powerUpChance: 0.16,
    theme: 'sunset',
    description: 'Tần suất bom xuất hiện dày đặc! Luồn lách khéo léo để sống sót.',
  },
  {
    id: 7,
    title: 'Màn 7: Đầm Lầy Độc Dược',
    subtitle: 'Tránh xa bình độc hóa chất',
    targetCount: 40,
    targetItems: { ice: 18, fire: 18, gem: 4 },
    fallSpeedMultiplier: 1.65,
    spawnIntervalMs: 760,
    bombChance: 0.24,
    poisonChance: 0.12,
    powerUpChance: 0.18,
    theme: 'night',
    description: 'Coi chừng những bình độc màu xanh lá (☠️). Ăn nhầm sẽ mất máu lập tức!',
  },
  {
    id: 8,
    title: 'Màn 8: Siêu Tốc Phản Xạ',
    subtitle: 'Tốc độ rơi tăng 80%',
    targetCount: 42,
    targetItems: { ice: 20, fire: 20, star: 2 },
    fallSpeedMultiplier: 1.8,
    spawnIntervalMs: 700,
    bombChance: 0.26,
    poisonChance: 0.08,
    powerUpChance: 0.18,
    theme: 'night',
    description: 'Tốc độ rơi cực nhanh. Cần phán đoán trước vị trí các quả cầu rơi.',
  },
  {
    id: 9,
    title: 'Màn 9: Cuồng Phong Hỗn Loạn',
    subtitle: 'Vật phẩm bay lượn zic-zac',
    targetCount: 45,
    targetItems: { ice: 20, fire: 20, gem: 5 },
    fallSpeedMultiplier: 1.9,
    spawnIntervalMs: 660,
    bombChance: 0.28,
    poisonChance: 0.1,
    powerUpChance: 0.2,
    theme: 'night',
    description: 'Các quả cầu rung lắc dữ dội theo quỹ đạo sin wave. Căn nhịp chính xác!',
  },
  {
    id: 10,
    title: 'Màn 10: Ma Trận Nguyên Tố Đỉnh Cao',
    subtitle: 'Thử thách phản xạ bậc thầy',
    targetCount: 50,
    targetItems: { ice: 22, fire: 22, gem: 6 },
    fallSpeedMultiplier: 2.05,
    spawnIntervalMs: 620,
    bombChance: 0.3,
    poisonChance: 0.1,
    powerUpChance: 0.2,
    theme: 'space',
    description: 'Hoàn thành 50 vật phẩm nguyên tố để khẳng định đẳng cấp cao thủ.',
  },
  {
    id: 11,
    title: 'Màn 11: Đấu Trường Cực Hạn',
    subtitle: 'Cận kề ranh giới sinh tử',
    targetCount: 55,
    targetItems: { ice: 25, fire: 25, star: 5 },
    fallSpeedMultiplier: 2.2,
    spawnIntervalMs: 580,
    bombChance: 0.32,
    poisonChance: 0.12,
    powerUpChance: 0.22,
    theme: 'space',
    description: 'Mưa bom bão đạn dữ dội! Tận dụng triệt để trạng thái Fury để càn quét.',
  },
  {
    id: 12,
    title: 'Màn 12: Chúa Tể Nuốt Chửng Vô Song',
    subtitle: 'Thách thức tối thượng 12/12',
    targetCount: 60,
    targetItems: { ice: 28, fire: 28, gem: 4 },
    fallSpeedMultiplier: 2.4,
    spawnIntervalMs: 540,
    bombChance: 0.35,
    poisonChance: 0.12,
    powerUpChance: 0.25,
    theme: 'space',
    description: 'Chinh phục cửa ải cuối cùng để ẵm trọn danh hiệu Đại Pháp Sư Nuốt Chửng!',
  },
];

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
  { key: 'Thanh Cuồng Nộ (FURY x10)', action: 'Đầy thanh sẽ hóa cuồng nộ x10 điểm, nuốt trọn tất cả bom độc!' },
];
