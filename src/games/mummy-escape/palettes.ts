import { GridPaletteId, GridPaletteTheme } from './types';

export const GRID_PALETTES: Record<GridPaletteId, GridPaletteTheme> = {
  classic_sand: {
    id: 'classic_sand',
    name: 'Pharaoh Sandstone',
    nameVi: 'Cát Vàng Pharaoh (Mặc định)',
    description: 'Phiến đá sa thạch hoàng gia truyền thống Ai Cập cổ đại.',
    tileLight: '#d0b585',
    tileDark: '#c2a677',
    tileBorder: 'rgba(143, 113, 66, 0.35)',
    boardBg: '#baa175',
    boardBorder: '#6d4c20',
    wallBg: '#422c15',
    wallHighlight: '#785025',
    wallShadow: '#261709',
    watermarkColor: 'rgba(92, 53, 14, 0.18)',
    watermarkSymbol: '𓆣',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    accentBadgeBg: 'bg-amber-900/60 border-amber-600/50',
    accentBadgeText: 'text-amber-300',
  },
  obsidian_crypt: {
    id: 'obsidian_crypt',
    name: 'Obsidian Crypt',
    nameVi: 'Mộ Hắc Diện Thạch (Obsidian)',
    description: 'Đá đen huyền bí bóng đêm kết hợp ánh xanh phát quang huyền ảo.',
    tileLight: '#1e293b',
    tileDark: '#0f172a',
    tileBorder: 'rgba(56, 189, 248, 0.25)',
    boardBg: '#0b1120',
    boardBorder: '#1e3a8a',
    wallBg: '#090d16',
    wallHighlight: '#38bdf8',
    wallShadow: '#020617',
    watermarkColor: 'rgba(56, 189, 248, 0.2)',
    watermarkSymbol: '𓁹',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    accentBadgeBg: 'bg-sky-950/70 border-sky-600/50',
    accentBadgeText: 'text-sky-300',
  },
  emerald_temple: {
    id: 'emerald_temple',
    name: 'Emerald Oasis',
    nameVi: 'Điện Thờ Ngọc Bích (Emerald)',
    description: 'Màu đá rêu cẩm thạch thiêng liêng phủ bóng trong ốc đảo bí mật.',
    tileLight: '#133e32',
    tileDark: '#0d2820',
    tileBorder: 'rgba(45, 212, 191, 0.25)',
    boardBg: '#091c16',
    boardBorder: '#0f766e',
    wallBg: '#081a14',
    wallHighlight: '#2dd4bf',
    wallShadow: '#020c09',
    watermarkColor: 'rgba(45, 212, 191, 0.2)',
    watermarkSymbol: '𓆗',
    glowColor: 'rgba(20, 184, 166, 0.45)',
    accentBadgeBg: 'bg-teal-950/70 border-teal-600/50',
    accentBadgeText: 'text-teal-300',
  },
  crimson_catacomb: {
    id: 'crimson_catacomb',
    name: 'Crimson Catacomb',
    nameVi: 'Hầm Mộ Huyết Thạch (Crimson)',
    description: 'Địa đạo dung nham đỏ thẫm rực lửa của các vị vua hắc ám.',
    tileLight: '#451616',
    tileDark: '#2e0e0e',
    tileBorder: 'rgba(244, 63, 94, 0.3)',
    boardBg: '#1f0808',
    boardBorder: '#9f1239',
    wallBg: '#1c0505',
    wallHighlight: '#fb7185',
    wallShadow: '#080101',
    watermarkColor: 'rgba(244, 63, 94, 0.22)',
    watermarkSymbol: '𓊝',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    accentBadgeBg: 'bg-rose-950/70 border-rose-600/50',
    accentBadgeText: 'text-rose-300',
  },
  amethyst_tomb: {
    id: 'amethyst_tomb',
    name: 'Amethyst Sanctuary',
    nameVi: 'Thánh Đường Tử Thạch (Amethyst)',
    description: 'Tinh thể thạch anh tím huyền bí tràn ngập ma thuật cổ xưa.',
    tileLight: '#32194a',
    tileDark: '#200f30',
    tileBorder: 'rgba(192, 132, 252, 0.3)',
    boardBg: '#150920',
    boardBorder: '#7e22ce',
    wallBg: '#13061c',
    wallHighlight: '#c084fc',
    wallShadow: '#06010a',
    watermarkColor: 'rgba(192, 132, 252, 0.22)',
    watermarkSymbol: '𓂀',
    glowColor: 'rgba(168, 85, 247, 0.45)',
    accentBadgeBg: 'bg-purple-950/70 border-purple-600/50',
    accentBadgeText: 'text-purple-300',
  },
  high_contrast_slate: {
    id: 'high_contrast_slate',
    name: 'High Contrast Slate',
    nameVi: 'Đá Đen Tương Phản Cao (High Contrast)',
    description: 'Tối ưu độ rõ nét với nền đá đen mờ và viền tường vàng sáng nổi bật.',
    tileLight: '#333740',
    tileDark: '#21252d',
    tileBorder: 'rgba(255, 255, 255, 0.25)',
    boardBg: '#16191f',
    boardBorder: '#fbbf24',
    wallBg: '#0f1115',
    wallHighlight: '#fde047',
    wallShadow: '#000000',
    watermarkColor: 'rgba(255, 255, 255, 0.15)',
    watermarkSymbol: '𓀠',
    glowColor: 'rgba(250, 204, 21, 0.4)',
    accentBadgeBg: 'bg-zinc-900 border-yellow-500/50',
    accentBadgeText: 'text-yellow-300',
  },
};

const PALETTE_STORAGE_KEY = 'mummy_escape_palette_pref_v1';
const SHOW_WATERMARK_KEY = 'mummy_escape_watermark_pref_v1';
const SCREEN_SHAKE_KEY = 'mummy_escape_screenshake_pref_v1';

export function getSavedPalette(): GridPaletteId {
  try {
    const saved = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (saved && saved in GRID_PALETTES) {
      return saved as GridPaletteId;
    }
  } catch {
    // fallback
  }
  return 'classic_sand';
}

export function savePalettePreference(id: GridPaletteId): void {
  try {
    localStorage.setItem(PALETTE_STORAGE_KEY, id);
  } catch {
    // ignore
  }
}

export function getSavedWatermarkPreference(): boolean {
  try {
    const saved = localStorage.getItem(SHOW_WATERMARK_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // ignore
  }
  return true;
}

export function saveWatermarkPreference(show: boolean): void {
  try {
    localStorage.setItem(SHOW_WATERMARK_KEY, String(show));
  } catch {
    // ignore
  }
}

export function getSavedScreenShakePreference(): boolean {
  try {
    const saved = localStorage.getItem(SCREEN_SHAKE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  } catch {
    // ignore
  }
  return true;
}

export function saveScreenShakePreference(enabled: boolean): void {
  try {
    localStorage.setItem(SCREEN_SHAKE_KEY, String(enabled));
  } catch {
    // ignore
  }
}

