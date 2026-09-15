import { DropRateConfig, GameAchievementDef, GameControlInfo } from '../../types';

export const FILL_THE_SPACE_ACHIEVEMENTS: GameAchievementDef[] = [
  {
    id: 'fts-level-3',
    title: 'Thợ Gỗ Tập Sự',
    description: 'Vượt qua Màn 3 trong Lấp Đầy Khoảng Trống',
    icon: '🪵',
    target: 3,
    rewardExp: 100,
    rewardCoins: 250,
    rewardGems: 0,
  },
  {
    id: 'fts-streak-3',
    title: 'Kỳ Thủ Tự Lực (x2 Điểm)',
    description: 'Đạt chuỗi 3 màn liên tiếp thắng không dùng gợi ý trong Lấp Đầy Khoảng Trống',
    icon: '🔥',
    target: 3,
    rewardExp: 250,
    rewardCoins: 600,
    rewardGems: 10,
  },
  {
    id: 'fts-combo-master',
    title: 'Combo Master',
    description: 'Đạt được 5 chuỗi 3 màn thắng liên tiếp trong Fill The Space mà không sử dụng bất kỳ gợi ý nào',
    icon: '⚡',
    target: 5,
    rewardExp: 500,
    rewardCoins: 1200,
    rewardGems: 30,
    rewardTitle: 'Combo Master',
  },
  {
    id: 'fts-level-10',
    title: 'Bậc Thầy Xếp Gỗ',
    description: 'Vượt qua Màn 10 trong Lấp Đầy Khoảng Trống',
    icon: '🧩',
    target: 10,
    rewardExp: 350,
    rewardCoins: 800,
    rewardGems: 15,
  },
  {
    id: 'fts-level-25',
    title: 'Kỳ Tài Giải Đố Không Gian',
    description: 'Vượt qua Màn 25 trong Lấp Đầy Khoảng Trống',
    icon: '👑',
    target: 25,
    rewardExp: 750,
    rewardCoins: 2000,
    rewardGems: 50,
  },
];

export const FILL_THE_SPACE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0.65,
  scoreThresholdForDrop: 500,
  chestWeights: [
    { type: 'common', weight: 45 },
    { type: 'rare', weight: 35 },
    { type: 'epic', weight: 15 },
    { type: 'legendary', weight: 5 },
  ],
};

export const FILL_THE_SPACE_CONTROLS: GameControlInfo[] = [
  {
    key: 'Kéo Thả Khối Gỗ',
    action: 'Kéo khối gỗ từ khay/vị trí bên ngoài và thả chính xác vào khoảng trống cần lấp',
    touchInstruction: 'Chạm giữ khối gỗ và kéo vào vùng rỗng trên bàn',
  },
  {
    key: 'Chạm Để Chọn & Đặt',
    action: 'Chạm vào khối gỗ để chọn, sau đó chạm vào ô trống để đặt vào vị trí',
    touchInstruction: 'Chạm khối gỗ -> Chạm ô trống',
  },
  {
    key: 'Gợi Ý (Hint 💡)',
    action: 'Xem vị trí chính xác của 1 khối gỗ (lưu ý: dùng gợi ý sẽ đặt lại chuỗi tự lực về 0)',
    touchInstruction: 'Nhấn nút 💡 Gợi Ý trên thanh công cụ',
  },
  {
    key: 'Chuỗi Tự Lực (x2 Điểm 🔥)',
    action: 'Thắng 3 màn liên tiếp không dùng gợi ý để kích hoạt hiệu ứng pháo hoa neon và nhân đôi (x2) toàn bộ điểm số & quà thưởng',
    touchInstruction: 'Hoàn thành 3 màn liên tục mà không bấm 💡 Gợi Ý',
  },
  {
    key: 'Chế Độ Zen (Thư Giãn 🌸)',
    action: 'Chơi xếp hình không áp lực thời gian, không giới hạn lượt Undo, miễn phí gợi ý và tùy chọn kích thước bàn',
    touchInstruction: 'Chuyển tab 🌸 Chế Độ Zen trên thanh tiêu đề',
  },
  {
    key: 'Thành Tựu Combo Master ⚡',
    action: 'Đạt được 5 chuỗi 3 màn thắng liên tiếp không dùng gợi ý để nhận danh hiệu Combo Master và rương báu',
    touchInstruction: 'Hoàn thành 5 lần chuỗi 3 màn tự lực',
  },
  {
    key: 'Lùi Bước (Undo)',
    action: 'Hoàn tác nước vừa đi (tối đa 3 lượt mỗi màn)',
    touchInstruction: 'Nhấn nút Undo (3/3) trên thanh công cụ',
  },
  {
    key: 'Thu Hồi Khối Gỗ',
    action: 'Chạm vào khối gỗ đã đặt trên bàn để trả về khay',
    touchInstruction: 'Chạm vào khối gỗ trên bàn để gỡ ra',
  },
];
