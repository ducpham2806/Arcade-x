import { BossDef } from './types';

export const BOSS_RUSH_ROSTER: BossDef[] = [
  {
    id: 'dragon_melon',
    phase: 1,
    name: 'Hắc Long Dưa Hấu',
    title: 'Thủ Lĩnh Tầng 1 - Cyber Dragon Melon',
    avatar: '🐲🍉',
    maxHp: 15,
    radius: 46,
    speed: 1.0,
    color: '#ef4444',
    accentColor: '#10b981',
    timeLimit: 40,
    description: 'Dưa hấu khổng lồ bọc giáp titan vảy rồng, lượn sóng trên bầu trời và phát phóng tia plasma bảo vệ.',
    dialogue: 'Ngươi dám thách thức đao pháp của tộc Hắc Long sao?! Chém vào giáp vảy của ta đi!',
    hazards: ['Bom Gai Bảo Vệ', 'Phi Tiêu Quả Tốc Độ'],
  },
  {
    id: 'mecha_pineapple',
    phase: 2,
    name: 'Cơ Khí Đại Bát Khóm',
    title: 'Pháo Đài Tầng 2 - Mecha Pineapple Golem',
    avatar: '🤖🍍',
    maxHp: 22,
    radius: 50,
    speed: 1.15,
    color: '#f59e0b',
    accentColor: '#eab308',
    timeLimit: 45,
    description: 'Khối cơ khí dứa hoàng kim tích tụ năng lượng phản hạt, xoay tròn lưỡi cưa hạt nhân và bẫy bom chùm.',
    dialogue: 'Cảnh báo: Lõi cơ khí quá tải! Tiếp chiêu bão laser dứa hoàng kim!',
    hazards: ['Tia Xung Kích Hạt Nhân', 'Bẫy Bom Xoay Vòng'],
  },
  {
    id: 'emperor_coconut',
    phase: 3,
    name: 'Ma Vương Dừa Xiêm Cực Quang',
    title: 'Chúa Tể Tối Thượng - Titan Aurora Coconut',
    avatar: '👑🥥',
    maxHp: 30,
    radius: 54,
    speed: 1.3,
    color: '#a855f7',
    accentColor: '#38bdf8',
    timeLimit: 50,
    description: 'Chúa tể dừa hắc diện thạch mang vương miện sấm sét tím, lướt siêu âm và triệu hồi bão tuyết đóng băng.',
    dialogue: 'Trước uy lực của Ma Vương Dừa Cực Quang, đao kiếm của ngươi chỉ là trò con trẻ!',
    hazards: ['Bão Bom Chùm Hắc Tinh', 'Khối Quả Đóng Băng Deceptive'],
  },
];

export const getBossByPhase = (phase: number): BossDef => {
  const index = Math.min(phase - 1, BOSS_RUSH_ROSTER.length - 1);
  return BOSS_RUSH_ROSTER[Math.max(0, index)];
};
