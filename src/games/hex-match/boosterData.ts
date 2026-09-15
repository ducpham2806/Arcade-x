import { BoosterType } from './types';

export interface BoosterProduct {
  id: string;
  boosterType?: BoosterType;
  name: string;
  icon: string;
  count: number;
  priceCoins: number;
  description: string;
  tag?: string;
  isBundle?: boolean;
  bundleContents?: { type: BoosterType; count: number }[];
}

export const HEX_BOOSTER_PRODUCTS: BoosterProduct[] = [
  {
    id: 'booster_pack_hammer',
    boosterType: 'hammer',
    name: 'Gói Búa Kẹo (x3)',
    icon: '🔨',
    count: 3,
    priceCoins: 150,
    description: 'Đập vỡ tức thì 1 viên kẹo hoặc vật cản bất kỳ (Băng/Chocolate).',
  },
  {
    id: 'booster_pack_rocket',
    boosterType: 'rocket',
    name: 'Gói Kẹo Sọc (x2)',
    icon: '⚡',
    count: 2,
    priceCoins: 200,
    description: 'Bắn tia năng lượng quét sạch toàn bộ 1 hàng ngang trên bàn cờ.',
  },
  {
    id: 'booster_pack_color_bomb',
    boosterType: 'color_bomb',
    name: 'Gói Bom Cầu Vồng (x1)',
    icon: '💣',
    count: 1,
    priceCoins: 280,
    description: 'Kích nổ quét sạch tất cả các viên kẹo cùng màu được chọn.',
    tag: 'SIÊU MẠNH',
  },
  {
    id: 'booster_pack_shuffle',
    boosterType: 'shuffle',
    name: 'Gói Xáo Trộn Bàn (x3)',
    icon: '🔄',
    count: 3,
    priceCoins: 100,
    description: 'Đảo vị trí toàn bộ kẹo trên bàn khi gặp thế cờ bế tắc.',
  },
  {
    id: 'booster_pack_mega_bundle',
    name: 'Combo Siêu Trợ Lực (Mega Pack)',
    icon: '🎁',
    count: 7,
    priceCoins: 499,
    description: 'Bao gồm 2 Búa Kẹo + 2 Kẹo Sọc + 1 Bom Cầu Vồng + 2 Xáo Trộn.',
    tag: 'TIẾT KIỆM 230 XU',
    isBundle: true,
    bundleContents: [
      { type: 'hammer', count: 2 },
      { type: 'rocket', count: 2 },
      { type: 'color_bomb', count: 1 },
      { type: 'shuffle', count: 2 },
    ],
  },
];

export function getStoredHexBoosters(): Record<BoosterType, number> {
  try {
    const saved = localStorage.getItem('arcadex_hex_boosters');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        hammer: typeof parsed.hammer === 'number' ? parsed.hammer : 3,
        rocket: typeof parsed.rocket === 'number' ? parsed.rocket : 2,
        color_bomb: typeof parsed.color_bomb === 'number' ? parsed.color_bomb : 1,
        shuffle: typeof parsed.shuffle === 'number' ? parsed.shuffle : 2,
      };
    }
  } catch {}
  return {
    hammer: 3,
    rocket: 2,
    color_bomb: 1,
    shuffle: 2,
  };
}

export function saveStoredHexBoosters(boosters: Record<BoosterType, number>): void {
  try {
    localStorage.setItem('arcadex_hex_boosters', JSON.stringify(boosters));
    window.dispatchEvent(new CustomEvent('arcadex_hex_boosters_updated'));
  } catch {}
}

export function addBoostersToInventory(type: BoosterType, amount: number): void {
  const current = getStoredHexBoosters();
  current[type] = (current[type] || 0) + amount;
  saveStoredHexBoosters(current);
}

export function addBundleToInventory(bundle: { type: BoosterType; count: number }[]): void {
  const current = getStoredHexBoosters();
  bundle.forEach((item) => {
    current[item.type] = (current[item.type] || 0) + item.count;
  });
  saveStoredHexBoosters(current);
}
