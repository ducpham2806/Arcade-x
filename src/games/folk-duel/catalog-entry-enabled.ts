import { packageLazy } from '../gamePackages';
import type { GameMetadata } from '../../types';
import { O_AN_QUAN_ACHIEVEMENTS, O_AN_QUAN_DROP_RATES, O_AN_QUAN_CONTROLS } from '../o-an-quan/config';
import { NHAY_LO_CO_ACHIEVEMENTS, NHAY_LO_CO_DROP_RATES, NHAY_LO_CO_CONTROLS } from '../nhay-lo-co/config';
const OAnQuanGame = packageLazy('o-an-quan', () => import('../o-an-quan').then(module => ({ default: module.OAnQuanGame })));
const NhayLoCoGame = packageLazy('nhay-lo-co', () => import('../nhay-lo-co').then(module => ({ default: module.NhayLoCoGame })));

export const folkCatalogEntries: Record<string, GameMetadata> = {
  'o-an-quan': {
    id: 'o-an-quan',
    title: 'Ô Ăn Quan · Sân Đình',
    shortDesc: 'Bản thử nội bộ · Bot và hai người cùng máy',
    description: 'Bản chơi thử offline với bot và hai người chung máy. Tiệm Tạp Hóa dùng Kẹo Mạch Nha; các tính năng online đang được phát triển.',
    category: 'Multiplayer',
    difficulty: 'Trung Bình',
    icon: '🪨',
    bannerGradient: 'from-amber-900 via-orange-950 to-stone-950',
    themeColor: '#f59e0b',
    tags: ['Game mới', 'Dân Gian', 'Ô Ăn Quan', '1vs1', 'Pixel Art', 'Offline'],
    supportsAI: true,
    multiplayer: false,
    launcherScores: false,
    controls: O_AN_QUAN_CONTROLS.filter(control => control.key !== 'Phòng 1vs1'),
    achievements: O_AN_QUAN_ACHIEVEMENTS,
    dropRates: O_AN_QUAN_DROP_RATES,
    component: OAnQuanGame,
  },
  'nhay-lo-co': {
    id: 'nhay-lo-co',
    title: 'Nhảy Lò Cò · Ngõ Nhỏ',
    shortDesc: 'Bản thử nội bộ · Thảy Chàm và nhảy 1–2 chân',
    description: 'Bản chơi thử offline với bot và hai người chung máy. Tiệm Tạp Hóa dùng Kẹo Mạch Nha; các tính năng online đang được phát triển.',
    category: 'Multiplayer',
    difficulty: 'Dễ',
    icon: '🦘',
    bannerGradient: 'from-orange-900 via-rose-950 to-stone-950',
    themeColor: '#fbbf24',
    tags: ['Game mới', 'Dân Gian', 'Nhảy Lò Cò', '1vs1', 'Pixel Art', 'Skin Gạch Đôi'],
    supportsAI: true,
    multiplayer: false,
    launcherScores: false,
    controls: NHAY_LO_CO_CONTROLS.filter(control => control.key !== 'Phòng 1vs1'),
    achievements: NHAY_LO_CO_ACHIEVEMENTS,
    dropRates: NHAY_LO_CO_DROP_RATES,
    component: NhayLoCoGame,
  },
};
