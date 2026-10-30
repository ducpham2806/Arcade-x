import type { ForgeMasteryState } from '../../../types';

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
