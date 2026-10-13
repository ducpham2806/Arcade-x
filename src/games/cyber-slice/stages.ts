import { StageConfig } from './types';

export const CYBER_SLICE_STAGES: StageConfig[] = [
  {
    id: 1,
    name: 'Vườn Táo & Chuối',
    chapter: 'Chương 1: Khởi Đầu Ngọt Ngào',
    description: 'Làm quen với đường kiếm ánh sáng! Chém táo đỏ và chuối tiêu vừa chín tới.',
    objectives: [
      { type: 'fruit_type', target: 8, fruitKind: 'apple_red', current: 0, label: 'Táo Đỏ', icon: '🍎' },
      { type: 'fruit_type', target: 6, fruitKind: 'banana', current: 0, label: 'Chuối Tiêu', icon: '🍌' },
    ],
    starScores: [150, 300, 450],
    allowedFruits: ['apple_red', 'banana', 'orange'],
    bombChance: 0, // No bombs for tutorial stage
    speedMultiplier: 0.85,
  },
  {
    id: 2,
    name: 'Dưa Hấu Mọng Nước',
    chapter: 'Chương 1: Khởi Đầu Ngọt Ngào',
    description: 'Chém nát những quả dưa hấu khổng lồ và thu thập điểm số đầu tiên.',
    objectives: [
      { type: 'fruit_type', target: 10, fruitKind: 'watermelon', current: 0, label: 'Dưa Hấu', icon: '🍉' },
      { type: 'score', target: 300, current: 0, label: 'Đạt 300 Điểm', icon: '🏆' },
    ],
    starScores: [300, 500, 750],
    allowedFruits: ['watermelon', 'apple_red', 'banana'],
    bombChance: 0.05,
    speedMultiplier: 0.9,
  },
  {
    id: 3,
    name: 'Cam Sành & Dứa Vàng',
    chapter: 'Chương 1: Khởi Đầu Ngọt Ngào',
    description: 'Trái dứa thơm lừng và cam ngọt. Chú ý né tránh quả bom đầu tiên!',
    objectives: [
      { type: 'fruit_type', target: 8, fruitKind: 'pineapple', current: 0, label: 'Dứa Khóm', icon: '🍍' },
      { type: 'fruit_type', target: 8, fruitKind: 'orange', current: 0, label: 'Cam Sành', icon: '🍊' },
    ],
    starScores: [400, 650, 900],
    allowedFruits: ['pineapple', 'orange', 'watermelon', 'banana'],
    bombChance: 0.1,
    speedMultiplier: 0.92,
  },
  {
    id: 4,
    name: 'Nghệ Thuật Combo 3x',
    chapter: 'Chương 2: Kiếm Vũ Nhiệt Đới',
    description: 'Canh nhịp vuốt 1 đường kiếm chém từ 3 quả trở lên cùng lúc để kích hoạt Combo.',
    objectives: [
      { type: 'combo', target: 3, current: 0, label: 'Combo 3x trở lên (3 lần)', icon: '⚡' },
      { type: 'fruit_count', target: 20, current: 0, label: 'Chém 20 Trái Cây', icon: '🗡️' },
    ],
    starScores: [500, 800, 1100],
    allowedFruits: ['watermelon', 'pineapple', 'apple_red', 'orange', 'banana'],
    bombChance: 0.1,
    speedMultiplier: 0.95,
  },
  {
    id: 5,
    name: 'Dâu Tây & Kiwi Tuyệt Hảo',
    chapter: 'Chương 2: Kiếm Vũ Nhiệt Đới',
    description: 'Thu hoạch quả dâu tây đỏ mọng và kiwi ngọc bích.',
    objectives: [
      { type: 'fruit_type', target: 10, fruitKind: 'strawberry', current: 0, label: 'Dâu Tây', icon: '🍓' },
      { type: 'fruit_type', target: 8, fruitKind: 'kiwi', current: 0, label: 'Kiwi Xanh', icon: '🥝' },
      { type: 'score', target: 500, current: 0, label: 'Đạt 500 Điểm', icon: '🏆' },
    ],
    starScores: [600, 950, 1300],
    allowedFruits: ['strawberry', 'kiwi', 'apple_green', 'orange', 'lemon'],
    bombChance: 0.12,
    speedMultiplier: 0.95,
  },
  {
    id: 6,
    name: 'Kỷ Băng Hà Chill Out',
    chapter: 'Chương 2: Kiếm Vũ Nhiệt Đới',
    description: 'Chém quả Băng Giá để làm chậm thời gian và tha hồ vuốt chém hàng loạt!',
    objectives: [
      { type: 'fruit_type', target: 2, fruitKind: 'freeze_fruit', current: 0, label: 'Quả Băng Giá', icon: '❄️' },
      { type: 'fruit_count', target: 25, current: 0, label: 'Chém 25 Trái Cây', icon: '🍉' },
    ],
    starScores: [700, 1100, 1500],
    allowedFruits: ['freeze_fruit', 'watermelon', 'apple_green', 'strawberry', 'lemon'],
    bombChance: 0.1,
    speedMultiplier: 1.0,
  },
  {
    id: 7,
    name: 'Dừa Xiêm & Lựu Đỏ Hoàng Cung',
    chapter: 'Chương 3: Hương Vị Thượng Hạng',
    description: 'Những trái dừa chắc nịch và quả lựu quý hiếm mang lại lượng điểm khổng lồ.',
    objectives: [
      { type: 'fruit_type', target: 8, fruitKind: 'coconut', current: 0, label: 'Dừa Xiêm', icon: '🥥' },
      { type: 'fruit_type', target: 8, fruitKind: 'pomegranate', current: 0, label: 'Lựu Đỏ', icon: '🫐' },
    ],
    starScores: [800, 1250, 1700],
    allowedFruits: ['coconut', 'pomegranate', 'pineapple', 'watermelon', 'orange'],
    bombChance: 0.12,
    speedMultiplier: 1.0,
  },
  {
    id: 8,
    name: 'Bão Táp Trái Cây Frenzy',
    chapter: 'Chương 3: Hương Vị Thượng Hạng',
    description: 'Kích hoạt quả Bão Táp để mở ra cơn mưa hàng chục trái cây phun trào!',
    objectives: [
      { type: 'fruit_type', target: 2, fruitKind: 'frenzy_fruit', current: 0, label: 'Quả Bão Táp', icon: '🌪️' },
      { type: 'score', target: 900, current: 0, label: 'Đạt 900 Điểm', icon: '🏆' },
    ],
    starScores: [900, 1400, 1900],
    allowedFruits: ['frenzy_fruit', 'freeze_fruit', 'watermelon', 'banana', 'kiwi', 'strawberry'],
    bombChance: 0.1,
    speedMultiplier: 1.0,
  },
  {
    id: 9,
    name: 'Vũ Điệu Né Bom Tử Thần',
    chapter: 'Chương 3: Hương Vị Thượng Hạng',
    description: 'Sự tập trung tuyệt đối! Chém 30 quả trái cây mà KHÔNG được chạm vào bom.',
    objectives: [
      { type: 'fruit_count', target: 30, current: 0, label: 'Chém 30 Trái Cây', icon: '🍎' },
      { type: 'no_bomb', target: 1, current: 0, label: 'Tuyệt Đối Né Bom', icon: '🛡️' },
    ],
    starScores: [1000, 1500, 2000],
    allowedFruits: ['watermelon', 'pineapple', 'orange', 'apple_red', 'kiwi'],
    bombChance: 0.22,
    speedMultiplier: 0.95,
  },
  {
    id: 10,
    name: 'Trái Cây Hoàng Kim Huyền Thoại',
    chapter: 'Chương 4: Đấu Trường Đao Khách',
    description: 'Săn lùng quả táo sao vàng lấp lánh mang lại điểm số bùng nổ.',
    objectives: [
      { type: 'fruit_type', target: 3, fruitKind: 'golden_fruit', current: 0, label: 'Trái Hoàng Kim', icon: '⭐' },
      { type: 'score', target: 1200, current: 0, label: 'Đạt 1,200 Điểm', icon: '🏆' },
    ],
    starScores: [1200, 1800, 2400],
    allowedFruits: ['golden_fruit', 'watermelon', 'strawberry', 'pineapple', 'coconut'],
    bombChance: 0.14,
    speedMultiplier: 1.02,
  },
  {
    id: 11,
    name: 'Đại Tiệc Buffet Trái Cây',
    chapter: 'Chương 4: Đấu Trường Đao Khách',
    description: 'Một bữa tiệc hoành tráng gồm đủ mọi loại hoa quả tươi ngon nhất.',
    objectives: [
      { type: 'fruit_type', target: 10, fruitKind: 'watermelon', current: 0, label: 'Dưa Hấu', icon: '🍉' },
      { type: 'fruit_type', target: 8, fruitKind: 'pineapple', current: 0, label: 'Dứa Khóm', icon: '🍍' },
      { type: 'fruit_type', target: 10, fruitKind: 'strawberry', current: 0, label: 'Dâu Tây', icon: '🍓' },
    ],
    starScores: [1400, 2000, 2600],
    allowedFruits: ['watermelon', 'pineapple', 'strawberry', 'banana', 'orange', 'lemon'],
    bombChance: 0.14,
    speedMultiplier: 1.05,
  },
  {
    id: 12,
    name: 'Kiếm Sư Combo 4x Thần Sầu',
    chapter: 'Chương 4: Đấu Trường Đao Khách',
    description: 'Thực hiện 3 lần Combo 4x bằng những đường lướt chém điêu luyện.',
    objectives: [
      { type: 'combo', target: 3, current: 0, label: 'Combo 4x trở lên (3 lần)', icon: '⚡' },
      { type: 'score', target: 1500, current: 0, label: 'Đạt 1,500 Điểm', icon: '🏆' },
    ],
    starScores: [1600, 2300, 3000],
    allowedFruits: ['watermelon', 'apple_red', 'orange', 'banana', 'freeze_fruit', 'frenzy_fruit'],
    bombChance: 0.15,
    speedMultiplier: 1.05,
  },
  {
    id: 13,
    name: 'Trận Chiến Băng & Lửa',
    chapter: 'Chương 5: Đỉnh Cao Kiếm Thuật',
    description: 'Kết hợp liên hoàn Đóng Băng và Bão Táp để chinh phục mốc điểm khổng lồ.',
    objectives: [
      { type: 'fruit_type', target: 3, fruitKind: 'freeze_fruit', current: 0, label: 'Quả Băng Giá', icon: '❄️' },
      { type: 'fruit_type', target: 3, fruitKind: 'frenzy_fruit', current: 0, label: 'Quả Bão Táp', icon: '🌪️' },
      { type: 'score', target: 2000, current: 0, label: 'Đạt 2,000 Điểm', icon: '🏆' },
    ],
    starScores: [2000, 2800, 3600],
    allowedFruits: ['freeze_fruit', 'frenzy_fruit', 'golden_fruit', 'coconut', 'pomegranate', 'watermelon'],
    bombChance: 0.16,
    speedMultiplier: 1.08,
  },
  {
    id: 14,
    name: 'Bão Bom Cyber Phục Kích',
    chapter: 'Chương 5: Đỉnh Cao Kiếm Thuật',
    description: 'Mật độ bom dày đặc đòi hỏi đường kiếm phải vô cùng chuẩn xác.',
    objectives: [
      { type: 'fruit_count', target: 45, current: 0, label: 'Chém 45 Trái Cây', icon: '🗡️' },
      { type: 'score', target: 2400, current: 0, label: 'Đạt 2,400 Điểm', icon: '🏆' },
    ],
    starScores: [2400, 3200, 4000],
    allowedFruits: ['watermelon', 'pineapple', 'apple_green', 'strawberry', 'orange', 'kiwi'],
    bombChance: 0.25,
    speedMultiplier: 1.1,
  },
  {
    id: 15,
    name: 'Đại Sư Cyber Blade Tối Thượng',
    chapter: 'Chương 5: Đỉnh Cao Kiếm Thuật',
    description: 'Thử thách tối hậu của toàn bộ học viện kiếm thuật Cyber Blade!',
    objectives: [
      { type: 'fruit_type', target: 12, fruitKind: 'watermelon', current: 0, label: 'Dưa Hấu', icon: '🍉' },
      { type: 'fruit_type', target: 10, fruitKind: 'coconut', current: 0, label: 'Dừa Xiêm', icon: '🥥' },
      { type: 'fruit_type', target: 3, fruitKind: 'golden_fruit', current: 0, label: 'Trái Hoàng Kim', icon: '⭐' },
      { type: 'score', target: 3000, current: 0, label: 'Đạt 3,000 Điểm', icon: '🏆' },
    ],
    starScores: [3000, 4000, 5000],
    allowedFruits: [
      'watermelon',
      'pineapple',
      'coconut',
      'pomegranate',
      'golden_fruit',
      'freeze_fruit',
      'frenzy_fruit',
    ],
    bombChance: 0.18,
    speedMultiplier: 1.12,
  },
];

const STORAGE_KEY_UNLOCKED = 'arcadex_cyber_slice_unlocked_stage';
const STORAGE_KEY_STARS = 'arcadex_cyber_slice_stage_stars';

export function getUnlockedStage(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEY_UNLOCKED);
    return val ? Math.max(1, parseInt(val, 10)) : 1;
  } catch {
    return 1;
  }
}

export function saveUnlockedStage(stageId: number): void {
  try {
    const current = getUnlockedStage();
    if (stageId > current) {
      localStorage.setItem(STORAGE_KEY_UNLOCKED, stageId.toString());
    }
  } catch {}
}

export function getStageStars(): Record<number, number> {
  try {
    const val = localStorage.getItem(STORAGE_KEY_STARS);
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

export function saveStageStars(stageId: number, stars: number): void {
  try {
    const existing = getStageStars();
    const prev = existing[stageId] || 0;
    if (stars > prev) {
      existing[stageId] = stars;
      localStorage.setItem(STORAGE_KEY_STARS, JSON.stringify(existing));
    }
  } catch {}
}

