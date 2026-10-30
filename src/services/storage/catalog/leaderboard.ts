import type { LeaderboardEntry } from '../../../types';

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
