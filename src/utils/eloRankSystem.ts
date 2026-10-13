import type { Rarity } from '../types';

export type LienQuanRankTierId =
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'diamond'
  | 'veteran'
  | 'master'
  | 'challenger';

export interface LienQuanRankInfo {
  tierId: LienQuanRankTierId;
  tierName: string; // Đồng, Bạc, Vàng, Bạch Kim, Kim Cương, Tinh Anh, Cao Thủ, Chiến Tướng
  divisionName: string; // e.g. "Kim Cương III", "Cao Thủ 15★", "Chiến Tướng 68★"
  divisionRoman: string; // "I", "II", "III", "IV", "V", or "★"
  divisionLevel: number; // 1 to 5 (or star count)
  badgeEmoji: string;
  badgeSymbol: string;
  theme: {
    textColor: string;
    bgBadge: string;
    borderClass: string;
    glowClass: string;
    hexPrimary: string;
    hexSecondary: string;
    gradientClass: string;
  };
  minElo: number;
  maxElo: number;
  currentElo: number;
  nextRankName: string | null;
  nextRankElo: number | null;
  eloToNextRank: number;
  progressPercent: number; // 0 to 100
  perkDescription: string;
}

export interface SubRankTierConfig {
  tierId: LienQuanRankTierId;
  tierName: string;
  divisionRoman: string;
  divisionLevel: number;
  minElo: number;
  maxElo: number;
  badgeEmoji: string;
  badgeSymbol: string;
  theme: {
    textColor: string;
    bgBadge: string;
    borderClass: string;
    glowClass: string;
    hexPrimary: string;
    hexSecondary: string;
    gradientClass: string;
  };
  perkDescription: string;
}

export const LIEN_QUAN_RANKS_CONFIG: SubRankTierConfig[] = [
  // 1. ĐỒNG (Bronze: 0 - 799)
  {
    tierId: 'bronze',
    tierName: 'Đồng',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 0,
    maxElo: 299,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥉',
    theme: {
      textColor: 'text-amber-600',
      bgBadge: 'bg-amber-950/40',
      borderClass: 'border-amber-700/50',
      glowClass: 'shadow-[0_0_10px_rgba(180,83,9,0.25)]',
      hexPrimary: '#b45309',
      hexSecondary: '#78350f',
      gradientClass: 'from-amber-700 to-amber-900',
    },
    perkDescription: 'Bậc khởi đầu cho tân binh tập luyện.',
  },
  {
    tierId: 'bronze',
    tierName: 'Đồng',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 300,
    maxElo: 549,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥉',
    theme: {
      textColor: 'text-amber-500',
      bgBadge: 'bg-amber-950/50',
      borderClass: 'border-amber-600/50',
      glowClass: 'shadow-[0_0_12px_rgba(217,119,6,0.3)]',
      hexPrimary: '#d97706',
      hexSecondary: '#92400e',
      gradientClass: 'from-amber-600 to-amber-800',
    },
    perkDescription: 'Đang làm quen với nhịp độ thi đấu.',
  },
  {
    tierId: 'bronze',
    tierName: 'Đồng',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 550,
    maxElo: 799,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥉',
    theme: {
      textColor: 'text-amber-400',
      bgBadge: 'bg-amber-950/60',
      borderClass: 'border-amber-500/60',
      glowClass: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
      hexPrimary: '#f59e0b',
      hexSecondary: '#b45309',
      gradientClass: 'from-amber-500 to-amber-700',
    },
    perkDescription: 'Sẵn sàng đột phá lên bậc Bạc.',
  },

  // 2. BẠC (Silver: 800 - 1599)
  {
    tierId: 'silver',
    tierName: 'Bạc',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 800,
    maxElo: 1049,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥈',
    theme: {
      textColor: 'text-slate-300',
      bgBadge: 'bg-slate-800/40',
      borderClass: 'border-slate-500/50',
      glowClass: 'shadow-[0_0_10px_rgba(148,163,184,0.25)]',
      hexPrimary: '#94a3b8',
      hexSecondary: '#475569',
      gradientClass: 'from-slate-400 to-slate-600',
    },
    perkDescription: 'Nắm vững các kỹ năng phản xạ cơ bản.',
  },
  {
    tierId: 'silver',
    tierName: 'Bạc',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 1050,
    maxElo: 1299,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥈',
    theme: {
      textColor: 'text-slate-200',
      bgBadge: 'bg-slate-800/50',
      borderClass: 'border-slate-400/60',
      glowClass: 'shadow-[0_0_12px_rgba(203,213,225,0.3)]',
      hexPrimary: '#cbd5e1',
      hexSecondary: '#64748b',
      gradientClass: 'from-slate-300 to-slate-500',
    },
    perkDescription: 'Phong độ ổn định, tiến bộ từng ván.',
  },
  {
    tierId: 'silver',
    tierName: 'Bạc',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 1300,
    maxElo: 1599,
    badgeEmoji: '🛡️',
    badgeSymbol: '🥈',
    theme: {
      textColor: 'text-white',
      bgBadge: 'bg-slate-700/50',
      borderClass: 'border-slate-300/70',
      glowClass: 'shadow-[0_0_15px_rgba(241,245,249,0.35)]',
      hexPrimary: '#f1f5f9',
      hexSecondary: '#94a3b8',
      gradientClass: 'from-slate-200 to-slate-400',
    },
    perkDescription: 'Đỉnh cao bậc Bạc, cận kề Vàng danh vọng.',
  },

  // 3. VÀNG (Gold: 1600 - 2799)
  {
    tierId: 'gold',
    tierName: 'Vàng',
    divisionRoman: 'IV',
    divisionLevel: 4,
    minElo: 1600,
    maxElo: 1899,
    badgeEmoji: '🏅',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-yellow-400',
      bgBadge: 'bg-yellow-950/40',
      borderClass: 'border-yellow-500/50',
      glowClass: 'shadow-[0_0_12px_rgba(234,179,8,0.3)]',
      hexPrimary: '#eab308',
      hexSecondary: '#a16207',
      gradientClass: 'from-yellow-400 to-amber-600',
    },
    perkDescription: 'Gia nhập hàng ngũ cao thủ tầm trung.',
  },
  {
    tierId: 'gold',
    tierName: 'Vàng',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 1900,
    maxElo: 2199,
    badgeEmoji: '🏅',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-yellow-300',
      bgBadge: 'bg-yellow-950/50',
      borderClass: 'border-yellow-400/60',
      glowClass: 'shadow-[0_0_15px_rgba(250,204,21,0.35)]',
      hexPrimary: '#facc15',
      hexSecondary: '#ca8a04',
      gradientClass: 'from-yellow-300 to-amber-500',
    },
    perkDescription: 'Khả năng đọc trận và né đòn xuất sắc.',
  },
  {
    tierId: 'gold',
    tierName: 'Vàng',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 2200,
    maxElo: 2499,
    badgeEmoji: '🏅',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-yellow-200',
      bgBadge: 'bg-yellow-900/50',
      borderClass: 'border-yellow-300/70',
      glowClass: 'shadow-[0_0_18px_rgba(253,224,71,0.4)]',
      hexPrimary: '#fde047',
      hexSecondary: '#eab308',
      gradientClass: 'from-yellow-200 to-amber-400',
    },
    perkDescription: 'Tỷ lệ thắng cao, sẵn sàng bứt phá.',
  },
  {
    tierId: 'gold',
    tierName: 'Vàng',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 2500,
    maxElo: 2799,
    badgeEmoji: '🏅',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-amber-200',
      bgBadge: 'bg-amber-900/60',
      borderClass: 'border-amber-300/80',
      glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
      hexPrimary: '#fbbf24',
      hexSecondary: '#d97706',
      gradientClass: 'from-amber-200 to-yellow-500',
    },
    perkDescription: 'Đỉnh cao bậc Vàng, chuẩn bị bước vào Bạch Kim.',
  },

  // 4. BẠCH KIM (Platinum: 2800 - 4399)
  {
    tierId: 'platinum',
    tierName: 'Bạch Kim',
    divisionRoman: 'V',
    divisionLevel: 5,
    minElo: 2800,
    maxElo: 3099,
    badgeEmoji: '💠',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-teal-300',
      bgBadge: 'bg-teal-950/40',
      borderClass: 'border-teal-500/50',
      glowClass: 'shadow-[0_0_15px_rgba(20,184,166,0.35)]',
      hexPrimary: '#14b8a6',
      hexSecondary: '#0f766e',
      gradientClass: 'from-teal-400 to-emerald-600',
    },
    perkDescription: 'Gia nhập đấu trường chuyên nghiệp cấp cao.',
  },
  {
    tierId: 'platinum',
    tierName: 'Bạch Kim',
    divisionRoman: 'IV',
    divisionLevel: 4,
    minElo: 3100,
    maxElo: 3399,
    badgeEmoji: '💠',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-teal-200',
      bgBadge: 'bg-teal-950/50',
      borderClass: 'border-teal-400/60',
      glowClass: 'shadow-[0_0_18px_rgba(45,212,191,0.4)]',
      hexPrimary: '#2dd4bf',
      hexSecondary: '#115e59',
      gradientClass: 'from-teal-300 to-cyan-500',
    },
    perkDescription: 'Tốc độ phản xạ và combo điêu luyện.',
  },
  {
    tierId: 'platinum',
    tierName: 'Bạch Kim',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 3400,
    maxElo: 3699,
    badgeEmoji: '💠',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-cyan-300',
      bgBadge: 'bg-cyan-950/50',
      borderClass: 'border-cyan-400/60',
      glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.45)]',
      hexPrimary: '#06b6d4',
      hexSecondary: '#0e7490',
      gradientClass: 'from-cyan-300 to-teal-500',
    },
    perkDescription: 'Tự tin gánh đội trong mọi trận đối kháng.',
  },
  {
    tierId: 'platinum',
    tierName: 'Bạch Kim',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 3700,
    maxElo: 4049,
    badgeEmoji: '💠',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-cyan-200',
      bgBadge: 'bg-cyan-950/60',
      borderClass: 'border-cyan-300/70',
      glowClass: 'shadow-[0_0_22px_rgba(34,211,238,0.5)]',
      hexPrimary: '#22d3ee',
      hexSecondary: '#155e75',
      gradientClass: 'from-cyan-200 to-blue-500',
    },
    perkDescription: 'Khả năng kiểm soát trận đấu hoàn hảo.',
  },
  {
    tierId: 'platinum',
    tierName: 'Bạch Kim',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 4050,
    maxElo: 4399,
    badgeEmoji: '💠',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-emerald-200',
      bgBadge: 'bg-emerald-950/60',
      borderClass: 'border-emerald-300/80',
      glowClass: 'shadow-[0_0_25px_rgba(52,211,153,0.55)]',
      hexPrimary: '#34d399',
      hexSecondary: '#065f46',
      gradientClass: 'from-emerald-300 to-teal-400',
    },
    perkDescription: 'Cửa ngõ tiến vào Kim Cương huyền thoại.',
  },

  // 5. KIM CƯƠNG (Diamond: 4400 - 6499)
  {
    tierId: 'diamond',
    tierName: 'Kim Cương',
    divisionRoman: 'V',
    divisionLevel: 5,
    minElo: 4400,
    maxElo: 4799,
    badgeEmoji: '🔷',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-sky-300',
      bgBadge: 'bg-sky-950/50',
      borderClass: 'border-sky-500/60',
      glowClass: 'shadow-[0_0_18px_rgba(56,189,248,0.4)]',
      hexPrimary: '#38bdf8',
      hexSecondary: '#0369a1',
      gradientClass: 'from-sky-400 to-indigo-600',
    },
    perkDescription: 'Mở khóa khung viền Kim Cương rực sáng.',
  },
  {
    tierId: 'diamond',
    tierName: 'Kim Cương',
    divisionRoman: 'IV',
    divisionLevel: 4,
    minElo: 4800,
    maxElo: 5199,
    badgeEmoji: '🔷',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-sky-200',
      bgBadge: 'bg-sky-950/60',
      borderClass: 'border-sky-400/70',
      glowClass: 'shadow-[0_0_20px_rgba(56,189,248,0.5)]',
      hexPrimary: '#38bdf8',
      hexSecondary: '#0284c7',
      gradientClass: 'from-sky-300 to-blue-600',
    },
    perkDescription: 'Kỹ năng phản ứng cực nhạy dưới 100ms.',
  },
  {
    tierId: 'diamond',
    tierName: 'Kim Cương',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 5200,
    maxElo: 5599,
    badgeEmoji: '🔷',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-blue-300',
      bgBadge: 'bg-blue-950/60',
      borderClass: 'border-blue-400/70',
      glowClass: 'shadow-[0_0_22px_rgba(96,165,250,0.5)]',
      hexPrimary: '#60a5fa',
      hexSecondary: '#1e40af',
      gradientClass: 'from-blue-300 to-indigo-500',
    },
    perkDescription: 'Bậc đấu của những tay bấm tốc độ cao.',
  },
  {
    tierId: 'diamond',
    tierName: 'Kim Cương',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 5600,
    maxElo: 6049,
    badgeEmoji: '🔷',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-blue-200',
      bgBadge: 'bg-blue-950/70',
      borderClass: 'border-blue-300/80',
      glowClass: 'shadow-[0_0_25px_rgba(147,197,253,0.55)]',
      hexPrimary: '#93c5fd',
      hexSecondary: '#1d4ed8',
      gradientClass: 'from-blue-200 to-sky-400',
    },
    perkDescription: 'Chiếm lĩnh bảng xếp hạng phòng đấu đơn & đội.',
  },
  {
    tierId: 'diamond',
    tierName: 'Kim Cương',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 6050,
    maxElo: 6499,
    badgeEmoji: '🔷',
    badgeSymbol: '💎',
    theme: {
      textColor: 'text-indigo-200',
      bgBadge: 'bg-indigo-950/70',
      borderClass: 'border-indigo-300/80',
      glowClass: 'shadow-[0_0_28px_rgba(165,180,252,0.6)]',
      hexPrimary: '#a5b4fc',
      hexSecondary: '#3730a3',
      gradientClass: 'from-indigo-200 to-sky-400',
    },
    perkDescription: 'Đỉnh cao Kim Cương, sắp chạm mốc Tinh Anh.',
  },

  // 6. TINH ANH (Veteran: 6500 - 8999)
  {
    tierId: 'veteran',
    tierName: 'Tinh Anh',
    divisionRoman: 'V',
    divisionLevel: 5,
    minElo: 6500,
    maxElo: 6999,
    badgeEmoji: '🔮',
    badgeSymbol: '🌌',
    theme: {
      textColor: 'text-purple-300',
      bgBadge: 'bg-purple-950/60',
      borderClass: 'border-purple-500/60',
      glowClass: 'shadow-[0_0_20px_rgba(168,85,247,0.45)]',
      hexPrimary: '#a855f7',
      hexSecondary: '#6b21a8',
      gradientClass: 'from-purple-400 to-indigo-600',
    },
    perkDescription: 'Thuộc top 10% người chơi giỏi nhất ArcadeX.',
  },
  {
    tierId: 'veteran',
    tierName: 'Tinh Anh',
    divisionRoman: 'IV',
    divisionLevel: 4,
    minElo: 7000,
    maxElo: 7499,
    badgeEmoji: '🔮',
    badgeSymbol: '🌌',
    theme: {
      textColor: 'text-purple-200',
      bgBadge: 'bg-purple-950/70',
      borderClass: 'border-purple-400/70',
      glowClass: 'shadow-[0_0_22px_rgba(192,132,252,0.5)]',
      hexPrimary: '#c084fc',
      hexSecondary: '#581c87',
      gradientClass: 'from-purple-300 to-fuchsia-600',
    },
    perkDescription: 'Phong thái bậc thầy, chiến thuật biến hóa.',
  },
  {
    tierId: 'veteran',
    tierName: 'Tinh Anh',
    divisionRoman: 'III',
    divisionLevel: 3,
    minElo: 7500,
    maxElo: 7999,
    badgeEmoji: '🔮',
    badgeSymbol: '🌌',
    theme: {
      textColor: 'text-fuchsia-300',
      bgBadge: 'bg-fuchsia-950/70',
      borderClass: 'border-fuchsia-400/70',
      glowClass: 'shadow-[0_0_25px_rgba(232,121,249,0.55)]',
      hexPrimary: '#e879f9',
      hexSecondary: '#701a75',
      gradientClass: 'from-fuchsia-300 to-purple-600',
    },
    perkDescription: 'Chuỗi thắng liên hoàn, đối thủ phải dè chừng.',
  },
  {
    tierId: 'veteran',
    tierName: 'Tinh Anh',
    divisionRoman: 'II',
    divisionLevel: 2,
    minElo: 8000,
    maxElo: 8499,
    badgeEmoji: '🔮',
    badgeSymbol: '🌌',
    theme: {
      textColor: 'text-fuchsia-200',
      bgBadge: 'bg-fuchsia-950/80',
      borderClass: 'border-fuchsia-300/80',
      glowClass: 'shadow-[0_0_28px_rgba(240,171,252,0.6)]',
      hexPrimary: '#f0abfc',
      hexSecondary: '#86198f',
      gradientClass: 'from-fuchsia-200 to-violet-500',
    },
    perkDescription: 'Thống trị các phòng xếp hạng khốc liệt.',
  },
  {
    tierId: 'veteran',
    tierName: 'Tinh Anh',
    divisionRoman: 'I',
    divisionLevel: 1,
    minElo: 8500,
    maxElo: 8999,
    badgeEmoji: '🔮',
    badgeSymbol: '🌌',
    theme: {
      textColor: 'text-violet-200',
      bgBadge: 'bg-violet-950/80',
      borderClass: 'border-violet-300/90',
      glowClass: 'shadow-[0_0_30px_rgba(196,181,253,0.65)]',
      hexPrimary: '#c4b5fd',
      hexSecondary: '#4c1d95',
      gradientClass: 'from-violet-200 to-fuchsia-500',
    },
    perkDescription: 'Cánh cổng bước vào Cao Thủ Đỉnh Cao.',
  },

  // 7. CAO THỦ (Master: 9000 - 12499)
  {
    tierId: 'master',
    tierName: 'Cao Thủ',
    divisionRoman: '★',
    divisionLevel: 1,
    minElo: 9000,
    maxElo: 9999,
    badgeEmoji: '🔥',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-rose-400',
      bgBadge: 'bg-rose-950/70',
      borderClass: 'border-rose-500/70',
      glowClass: 'shadow-[0_0_25px_rgba(244,63,94,0.55)]',
      hexPrimary: '#f43f5e',
      hexSecondary: '#881337',
      gradientClass: 'from-rose-500 to-red-600',
    },
    perkDescription: 'Bậc Cao Thủ sơ khởi (1 - 10 sao).',
  },
  {
    tierId: 'master',
    tierName: 'Cao Thủ',
    divisionRoman: '★★',
    divisionLevel: 2,
    minElo: 10000,
    maxElo: 11199,
    badgeEmoji: '🔥',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-red-300',
      bgBadge: 'bg-red-950/80',
      borderClass: 'border-red-500/80',
      glowClass: 'shadow-[0_0_28px_rgba(239,68,68,0.65)]',
      hexPrimary: '#ef4444',
      hexSecondary: '#7f1d1d',
      gradientClass: 'from-red-400 to-rose-600',
    },
    perkDescription: 'Cao Thủ tinh nhuệ (11 - 25 sao).',
  },
  {
    tierId: 'master',
    tierName: 'Cao Thủ',
    divisionRoman: '★★★',
    divisionLevel: 3,
    minElo: 11200,
    maxElo: 12499,
    badgeEmoji: '🔥',
    badgeSymbol: '👑',
    theme: {
      textColor: 'text-red-200',
      bgBadge: 'bg-red-950/90',
      borderClass: 'border-red-400/90',
      glowClass: 'shadow-[0_0_32px_rgba(252,165,165,0.7)]',
      hexPrimary: '#fca5a5',
      hexSecondary: '#991b1b',
      gradientClass: 'from-red-300 to-amber-500',
    },
    perkDescription: 'Cao Thủ xuất sắc (26 - 49 sao), sát Chiến Tướng.',
  },

  // 8. CHIẾN TƯỚNG / THÁCH ĐẤU (Challenger: 12500+)
  {
    tierId: 'challenger',
    tierName: 'Chiến Tướng',
    divisionRoman: '✪ 50★+',
    divisionLevel: 1,
    minElo: 12500,
    maxElo: 99999999,
    badgeEmoji: '🌟',
    badgeSymbol: '⚡',
    theme: {
      textColor: 'text-amber-300',
      bgBadge: 'bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-red-950/90',
      borderClass: 'border-amber-400',
      glowClass: 'shadow-[0_0_35px_rgba(251,191,36,0.8)] animate-pulse',
      hexPrimary: '#fbbf24',
      hexSecondary: '#ec4899',
      gradientClass: 'from-amber-400 via-rose-500 to-purple-600',
    },
    perkDescription: 'Đỉnh cao vinh quang vô song • Top 50 Thách Đấu Toàn Server.',
  },
];

export interface MainRankOverview {
  tierId: LienQuanRankTierId;
  tierName: string;
  badgeEmoji: string;
  minElo: number;
  theme: {
    textColor: string;
    bgBadge: string;
    borderClass: string;
    glowClass: string;
  };
}

export const LIEN_QUAN_MAIN_TIERS_OVERVIEW: MainRankOverview[] = [
  { tierId: 'bronze', tierName: 'Đồng', badgeEmoji: '🛡️', minElo: 0, theme: { textColor: 'text-amber-500', bgBadge: 'bg-amber-950/40', borderClass: 'border-amber-700/50', glowClass: '' } },
  { tierId: 'silver', tierName: 'Bạc', badgeEmoji: '⚔️', minElo: 800, theme: { textColor: 'text-slate-300', bgBadge: 'bg-slate-900/60', borderClass: 'border-slate-500/50', glowClass: '' } },
  { tierId: 'gold', tierName: 'Vàng', badgeEmoji: '🏆', minElo: 1800, theme: { textColor: 'text-yellow-400', bgBadge: 'bg-yellow-950/40', borderClass: 'border-yellow-500/50', glowClass: 'shadow-[0_0_12px_rgba(234,179,8,0.2)]' } },
  { tierId: 'platinum', tierName: 'Bạch Kim', badgeEmoji: '💠', minElo: 3200, theme: { textColor: 'text-teal-300', bgBadge: 'bg-teal-950/40', borderClass: 'border-teal-500/50', glowClass: 'shadow-[0_0_15px_rgba(20,184,166,0.3)]' } },
  { tierId: 'diamond', tierName: 'Kim Cương', badgeEmoji: '💎', minElo: 5000, theme: { textColor: 'text-sky-300', bgBadge: 'bg-sky-950/40', borderClass: 'border-sky-500/50', glowClass: 'shadow-[0_0_20px_rgba(56,189,248,0.35)]' } },
  { tierId: 'veteran', tierName: 'Tinh Anh', badgeEmoji: '🔮', minElo: 7200, theme: { textColor: 'text-purple-300', bgBadge: 'bg-purple-950/40', borderClass: 'border-purple-500/50', glowClass: 'shadow-[0_0_25px_rgba(168,85,247,0.4)]' } },
  { tierId: 'master', tierName: 'Cao Thủ', badgeEmoji: '🔥', minElo: 9800, theme: { textColor: 'text-rose-400', bgBadge: 'bg-rose-950/40', borderClass: 'border-rose-500/50', glowClass: 'shadow-[0_0_30px_rgba(244,63,94,0.5)]' } },
  { tierId: 'challenger', tierName: 'Thách Đấu', badgeEmoji: '👑', minElo: 12500, theme: { textColor: 'text-amber-300', bgBadge: 'bg-gradient-to-r from-amber-950/90 to-red-950/90', borderClass: 'border-amber-400', glowClass: 'shadow-[0_0_35px_rgba(251,191,36,0.7)]' } },
];

/**
 * Calculates the exact Liên Quân rank info based on an ELO score.
 */
export function getLienQuanRankInfo(elo: number): LienQuanRankInfo {
  const safeElo = Math.max(0, Math.round(elo || 0));

  let matchedConfig = LIEN_QUAN_RANKS_CONFIG[0];
  let matchedIndex = 0;

  for (let i = 0; i < LIEN_QUAN_RANKS_CONFIG.length; i++) {
    const config = LIEN_QUAN_RANKS_CONFIG[i];
    if (safeElo >= config.minElo && safeElo <= config.maxElo) {
      matchedConfig = config;
      matchedIndex = i;
      break;
    }
  }

  // If ELO exceeds max, use Challenger
  if (safeElo >= 12500) {
    matchedConfig = LIEN_QUAN_RANKS_CONFIG[LIEN_QUAN_RANKS_CONFIG.length - 1];
    matchedIndex = LIEN_QUAN_RANKS_CONFIG.length - 1;
  }

  const isMaxTier = matchedIndex === LIEN_QUAN_RANKS_CONFIG.length - 1;
  const nextConfig = !isMaxTier ? LIEN_QUAN_RANKS_CONFIG[matchedIndex + 1] : null;

  const nextRankName = nextConfig ? `${nextConfig.tierName} ${nextConfig.divisionRoman}` : null;
  const nextRankElo = nextConfig ? nextConfig.minElo : null;
  const eloToNextRank = nextRankElo !== null ? Math.max(0, nextRankElo - safeElo) : 0;

  let progressPercent = 100;
  if (!isMaxTier) {
    const range = matchedConfig.maxElo - matchedConfig.minElo + 1;
    const earnedInRange = safeElo - matchedConfig.minElo;
    progressPercent = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
  }

  let divisionName = `${matchedConfig.tierName} ${matchedConfig.divisionRoman}`;
  if (matchedConfig.tierId === 'master') {
    const stars = Math.max(1, Math.min(49, Math.floor((safeElo - 9000) / 75) + 1));
    divisionName = `Cao Thủ ${stars}★`;
  } else if (matchedConfig.tierId === 'challenger') {
    const stars = Math.max(50, Math.floor((safeElo - 12500) / 100) + 50);
    divisionName = `Chiến Tướng ${stars}★`;
  }

  return {
    tierId: matchedConfig.tierId,
    tierName: matchedConfig.tierName,
    divisionName,
    divisionRoman: matchedConfig.divisionRoman,
    divisionLevel: matchedConfig.divisionLevel,
    badgeEmoji: matchedConfig.badgeEmoji,
    badgeSymbol: matchedConfig.badgeSymbol,
    theme: matchedConfig.theme,
    minElo: matchedConfig.minElo,
    maxElo: matchedConfig.maxElo,
    currentElo: safeElo,
    nextRankName,
    nextRankElo,
    eloToNextRank,
    progressPercent,
    perkDescription: matchedConfig.perkDescription,
  };
}

/**
 * Calculates overall combined player ELO from stats (high scores, games, achievements, streak).
 */
export function calculateOverallPlayerElo(stats?: {
  totalScore?: number;
  highScores?: Record<string, number>;
  totalGamesPlayed?: number;
  dailyStreak?: number;
  achievementsUnlocked?: number;
}): number {
  if (!stats) return 1200;

  const highScores = stats.highScores || {};
  const sumHighScores = Object.values(highScores).reduce((a, b) => a + b, 0);
  const totalScore = stats.totalScore || 0;
  const gamesPlayed = stats.totalGamesPlayed || 0;
  const streak = stats.dailyStreak || 1;

  // Base starting ELO + skill contribution from all games
  const eloFromHighScores = Math.round(sumHighScores * 0.45);
  const eloFromScore = Math.round(totalScore * 0.08);
  const eloFromExperience = Math.min(2500, gamesPlayed * 25);
  const eloFromStreak = Math.min(1000, streak * 50);

  const calculated = 800 + eloFromHighScores + eloFromScore + eloFromExperience + eloFromStreak;
  return Math.max(100, calculated);
}

export interface DailyEloPoint {
  date: string;
  dayLabel: string;
  fullDateLabel: string;
  elo: number;
  gamesPlayed: number;
  rankInfo: LienQuanRankInfo;
  deltaElo: number;
}

/**
 * Generates 7-day ELO progression points for D3.js visualization.
 */
export function getRecent7DaysEloProgression(stats: {
  totalScore?: number;
  highScores?: Record<string, number>;
  totalGamesPlayed?: number;
  dailyStreak?: number;
  dailyScoreHistory?: Record<string, number>;
}): DailyEloPoint[] {
  const currentElo = calculateOverallPlayerElo(stats);
  const history = stats?.dailyScoreHistory || {};
  const today = new Date();
  const points: DailyEloPoint[] = [];

  // Build 7 days history from 6 days ago to today
  const dailyScores: number[] = [];
  const dateStrs: { dateStr: string; dayLabel: string; fullDateLabel: string; isToday: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const weekday = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
    const isToday = i === 0;

    const recordedScore = history[dateStr];
    dailyScores.push(recordedScore !== undefined ? recordedScore : 0);
    dateStrs.push({
      dateStr,
      dayLabel: isToday ? 'Hôm nay' : `${weekday} ${day}/${month}`,
      fullDateLabel: `${weekday}, ngày ${day}/${month}/${d.getFullYear()}`,
      isToday,
    });
  }

  // Calculate realistic progressive ELO baseline over the 7 days ending at currentElo
  const total7DaysScore = dailyScores.reduce((a, b) => a + b, 0);
  let simulatedEloAccum = currentElo;

  // We walk backwards to compute daily ELO trajectory
  const eloHistoryReversed: number[] = [];
  for (let i = 6; i >= 0; i--) {
    if (i === 6) {
      eloHistoryReversed.push(currentElo);
    } else {
      const dayScore = dailyScores[i + 1];
      // Day elo contribution
      const dayDelta = dayScore > 0 
        ? Math.round(dayScore * 0.18 + 25) 
        : Math.round(Math.max(10, (currentElo * 0.03) * (0.8 + (i % 3) * 0.15)));
      simulatedEloAccum = Math.max(300, simulatedEloAccum - dayDelta);
      eloHistoryReversed.push(simulatedEloAccum);
    }
  }

  const eloHistory = eloHistoryReversed.reverse();

  for (let i = 0; i < 7; i++) {
    const eloVal = eloHistory[i];
    const prevElo = i > 0 ? eloHistory[i - 1] : Math.max(100, eloVal - 40);
    const deltaElo = eloVal - prevElo;
    const dayScore = dailyScores[i];
    const games = dayScore > 0 ? Math.max(1, Math.round(dayScore / 250)) : (i === 6 && (stats.totalGamesPlayed || 0) > 0 ? 1 : 0);

    points.push({
      date: dateStrs[i].dateStr,
      dayLabel: dateStrs[i].dayLabel,
      fullDateLabel: dateStrs[i].fullDateLabel,
      elo: eloVal,
      gamesPlayed: games,
      rankInfo: getLienQuanRankInfo(eloVal),
      deltaElo,
    });
  }

  return points;
}

export interface EloTitleMilestone {
  id: string;
  minElo: number;
  title: string;
  badge: string;
  description: string;
  rarity: Rarity;
}

export const ELO_TITLE_MILESTONES: EloTitleMilestone[] = [
  { id: 'title-newbie', minElo: 0, title: 'Tập Sự', badge: '🌱', description: 'Dành cho các nhà thám hiểm mới bước chân vào thế giới ArcadeX.', rarity: 'common' },
  { id: 'title-challenger', minElo: 1200, title: 'Chiến Binh Sơ Cấp', badge: '⚔️', description: 'Đạt mốc 1,200 ELO, minh chứng cho sự nỗ lực ban đầu.', rarity: 'uncommon' },
  { id: 'title-sharp', minElo: 1400, title: 'Thiện Xạ Kỷ Lục', badge: '🎯', description: 'Đạt mốc 1,400 ELO với kỹ năng phản xạ sắc bén.', rarity: 'rare' },
  { id: 'title-master', minElo: 1600, title: 'Cao Thủ Bách Thắng', badge: '🏆', description: 'Đạt mốc 1,600 ELO, nỗi khiếp sợ của nhiều đối thủ.', rarity: 'epic' },
  { id: 'title-grandmaster', minElo: 1850, title: 'Đại Sư Hạng Nặng', badge: '👑', description: 'Đạt mốc 1,850 ELO, đỉnh cao chiến thuật và tốc độ.', rarity: 'legendary' },
  { id: 'title-legend', minElo: 2100, title: 'Huyền Thoại Arcane', badge: '🌌', description: 'Đạt mốc 2,100 ELO, biểu tượng của sự hoàn hảo.', rarity: 'mythic' },
  { id: 'title-god', minElo: 2400, title: 'Thần Thánh ArcaneX', badge: '⚡', description: 'Đạt đỉnh cao 2,400+ ELO, vị thần tối cao của bảng xếp hạng.', rarity: 'relic' },
];

export function getUnlockedTitles(peakElo: number): EloTitleMilestone[] {
  const safePeak = Math.max(800, peakElo || 800);
  return ELO_TITLE_MILESTONES.filter(m => safePeak >= m.minElo);
}

export function getTitleForElo(elo: number): string {
  let matched = ELO_TITLE_MILESTONES[0].title;
  for (const m of ELO_TITLE_MILESTONES) {
    if (elo >= m.minElo) {
      matched = m.title;
    }
  }
  return matched;
}


