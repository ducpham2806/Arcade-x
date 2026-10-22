/** v3 tuning hypotheses. Keep encounter identity separate from the timer-based boss phase. */
export type RoomKind = 'scout' | 'armor' | 'swarm' | 'caster' | 'elite' | 'treasure' | 'gauntlet' | 'rest' | 'boss';
export const ROOM_RULES: Record<RoomKind, { name: string; hint: string; hp: number; gold: number; waves: number }> = {
  scout: { name: 'Trinh sát', hint: 'Chạm hoặc giữ Tấn công để nối combo.', hp: 1, gold: 1, waves: 1 },
  armor: { name: 'Thiết giáp', hint: 'Đòn thứ 8 phá giáp. Dồn tuyệt kỹ khi giáp vỡ.', hp: 1.15, gold: 1.2, waves: 1 },
  swarm: { name: 'Bầy đàn', hint: 'Ba đợt nhỏ. Giữ nhịp combo qua các đợt.', hp: 1.1, gold: 1.15, waves: 3 },
  caster: { name: 'Pháp sư', hint: 'Hạ nhanh để hồi thêm 15 năng lượng.', hp: .9, gold: 1, waves: 1 },
  elite: { name: 'Tinh anh', hint: 'Địch bền hơn; phần thưởng vàng và đồ tốt hơn.', hp: 1.65, gold: 1.8, waves: 1 },
  treasure: { name: 'Kho báu', hint: 'Khoảng nghỉ ngắn để kiếm vàng nâng cấp.', hp: .65, gold: 1.8, waves: 1 },
  gauntlet: { name: 'Liên chiến', hint: 'Hai đợt liên tiếp. Tích năng lượng cho boss.', hp: 1.3, gold: 1.4, waves: 2 },
  rest: { name: 'Suối hồi phục', hint: 'Hạ hộ vệ để hồi 30 năng lượng trước boss.', hp: .65, gold: .9, waves: 1 },
  boss: { name: 'Cổng Titan', hint: 'Đỡ đòn lúc vòng cảnh báo sáng; phản công khi lộ lõi.', hp: 4.8, gold: 4, waves: 1 },
};
const RHYTHMS: RoomKind[][] = [
 ['scout','armor','swarm','caster','elite','treasure','armor','gauntlet','rest','boss'],
 ['scout','swarm','caster','armor','elite','treasure','gauntlet','armor','rest','boss'],
 ['scout','caster','armor','swarm','elite','treasure','armor','gauntlet','rest','boss'],
];
export function roomFor(stage: number): RoomKind {
  return RHYTHMS[Math.floor((stage - 1) / 10) % RHYTHMS.length][(stage - 1) % 10];
}
export const STANCES = {
 blade: { name: 'Kiếm vũ', description: '+25% sát thương chạm', tap: 1.25, ally: 1, gold: 1 },
 legion: { name: 'Quân đoàn', description: '+30% sát thương đồng đội', tap: 1, ally: 1.3, gold: 1 },
 fortune: { name: 'Thợ săn', description: '+25% vàng hạ quái', tap: 1, ally: 1, gold: 1.25 },
};
export type Stance = keyof typeof STANCES;
export function bossPhase(time: number, _hpRatio=1, stage=10) {
  const pattern=bossPattern(stage),duration=pattern.cycle;
  const cycle=Math.floor(time/duration),t=time%duration;
  return { cycle,t,duration,phase:t<pattern.strikeAt-2?'guard':t<pattern.strikeAt?'windup':'exposed',canParry:t>=pattern.strikeAt-pattern.window&&t<pattern.strikeAt } as const;
}
export const runeCost = (level: number) => 1 + Math.floor(level / 2);
export const BOSS_PATTERNS = [
 {name:'Chùy chấn địa',cycle:7.5,strikeAt:4.5,window:1.25,penalty:2,guard:8,effect:'slam',hint:'Đỡ chùy để mở lõi Titan.'},
 {name:'Khiên xương',cycle:8,strikeAt:4.75,window:1.25,penalty:2,guard:10,effect:'shield',hint:'Giáp bền hơn: cần 10 nhát phá giáp.'},
 {name:'Tơ độc',cycle:7,strikeAt:4.25,window:1.25,penalty:3,guard:8,effect:'poison',hint:'Trượt đỡ: tơ độc lấy 3 giây.'},
 {name:'Huyết triều',cycle:7.75,strikeAt:4.75,window:1.25,penalty:2,guard:8,effect:'siphon',hint:'Trượt đỡ: hút thêm 15 năng lượng.'},
 {name:'Hỏa tức',cycle:8.5,strikeAt:5,window:1.5,penalty:4,guard:8,effect:'fire',hint:'Hỏa tức chậm nhưng lấy 4 giây nếu trượt.'},
 {name:'Băng phong',cycle:8,strikeAt:4.75,window:1.25,penalty:2,guard:9,effect:'frost',hint:'Trượt đỡ: đóng băng 10 năng lượng.'},
 {name:'Lôi kích',cycle:6.75,strikeAt:4,window:1,penalty:2.5,guard:8,effect:'thunder',hint:'Nhịp nhanh; cửa sổ đỡ dài 1 giây.'},
 {name:'Hư vô',cycle:7,strikeAt:4.5,window:1.25,penalty:3,guard:8,effect:'void',hint:'Trượt đỡ: tăng hồi chiêu kỹ năng thêm 1,5 giây.'},
] as const;
export function bossPattern(stage:number) {
 const starts=[1,21,41,61,81,101,131,161];let chapter=0;starts.forEach((start,i)=>{if(stage>=start)chapter=i;});return BOSS_PATTERNS[chapter];
}
