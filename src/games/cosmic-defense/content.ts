import campaign from "./data/campaign.json" with { type: "json" };
import type { Level, Upgrade, Booster, Mutator, ItemKind } from "./types.ts";
export const LEVELS = campaign as Level[];
export const PLANETS = [
  {
    name: "Asteria",
    key: "asteria",
    boss: "Grindjaw",
    theme: "Vành đai tiểu hành tinh",
    tip: "Né làn đỏ. Bắn lõi khi hàm mở.",
    story:
      "Mỏ đã im lặng. Kai và LUMI tiến vào vành đai, tìm Lõi Sao đầu tiên giữa những cỗ máy bị chiếm quyền.",
  },
  {
    name: "Verdantia",
    key: "verdantia",
    boss: "Sporemother",
    theme: "Rừng sinh học",
    tip: "Tránh bào tử, hạ trứng trước khi nở.",
    story:
      "Khu rừng vẫn thở, nhưng bầy Zerrith đang biến ký ức của nó thành một ổ trứng.",
  },
  {
    name: "Glacius",
    key: "glacius",
    boss: "Cryowyrm",
    theme: "Băng giá",
    tip: "Đổi làn khi đầu rắn ngóc lên.",
    story:
      "Dưới cực quang cuối cùng, một lời cầu cứu bị đóng băng đang chờ Aegis Nova.",
  },
  {
    name: "Pyrrhos",
    key: "pyrrhos",
    boss: "Ignarok",
    theme: "Lò rèn dung nham",
    tip: "Né cột lửa, tìm khe an toàn trong tường đạn.",
    story:
      "Lò rèn từng phục vụ Solaris giờ nhận tàu Aegis là nguyên liệu. Vết nứt sáng trên ngực Ignarok là cơ hội duy nhất.",
  },
  {
    name: "Aquaris",
    key: "aquaris",
    boss: "Abyssal Maw",
    theme: "Đại dương sâu",
    tip: "Phá xúc tu để lộ đầu. Thoát lực hút.",
    story:
      "Hạm đội mất tích dưới đáy biển. Kai lần theo những tín hiệu cuối cùng vào miệng vực sâu.",
  },
  {
    name: "Machina Prime",
    key: "machina",
    boss: "Overseer Unit-9",
    theme: "Thành phố máy",
    tip: "Phá tháp pháo, dùng item trước EMP.",
    story:
      "Hồ sơ Hybrid cho thấy Liên bang từng thử nghiệm Zerrith. LUMI nhận ra một phần mã của mình trong hệ thống địch.",
  },
  {
    name: "Umbra",
    key: "umbra",
    boss: "Veilweaver",
    theme: "Mạng nhện bóng tối",
    tip: "Bản thật có viền sáng. Canh lúc hiện hình.",
    story:
      "Bóng của Kai không còn theo anh. LUMI giữ đèn lõi sáng, chọn đứng về phía con người.",
  },
  {
    name: "Tempest",
    key: "tempest",
    boss: "Thunderhead",
    theme: "Bão giông",
    tip: "Phá cột thu lôi. Rời vạch sét trước khi sáng.",
    story:
      "Bầu trời đang đếm ngược. Giữa những đợt gió, ba cột thu lôi giữ lõi bão bất khả xâm phạm.",
  },
  {
    name: "Crystalis",
    key: "crystalis",
    boss: "Prism Sovereign",
    theme: "Vương quốc tinh thể",
    tip: "Bắn mặt sáng; đạn ở mặt tối bị phản lại.",
    story:
      "Mỗi mặt gương kể một sự thật khác nhau. Kai phải tìm ánh sáng thật trước khi tiến vào tổ mẹ.",
  },
  {
    name: "Nexus Core",
    key: "nexus",
    boss: "Xar’Kul",
    theme: "Tổ mẹ Hư Không",
    tip: "Giữ Bomb và Laser cho pha lõi cuối cùng.",
    story:
      "Mười Lõi Sao mở đường tới Xar’Kul. LUMI im lặng một nhịp, rồi cùng Kai chọn đóng tổ mẹ bằng cổng sáng.",
  },
];
export const GATES = [0, 12, 30, 50, 70, 95, 120, 150, 180, 210];
export const UPGRADE_INFO: Record<
  Upgrade,
  { name: string; factor: number; description: string }
> = {
  cannon: {
    name: "Pháo",
    factor: 1,
    description: "+4% sát thương / cấp; Lv5 thêm nòng",
  },
  hull: {
    name: "Thân tàu",
    factor: 1.2,
    description: "−3% hao mòn / cấp; Lv5 thêm 1 HP",
  },
  reactor: {
    name: "Lò phản ứng",
    factor: 1,
    description: "+3% thời lượng item; Lv10 thêm slot",
  },
  magnet: {
    name: "Nam châm",
    factor: 0.6,
    description: "+5% tầm hút; Lv5 hút Star Core",
  },
  thrusters: {
    name: "Động cơ",
    factor: 0.6,
    description: "+2% tốc độ; Lv5 mở dash",
  },
  core: {
    name: "Lõi kỹ năng",
    factor: 1.4,
    description: "Lv3/6/9: Attack/Defense/Booster Lv2",
  },
};
export const BOOSTERS: Record<
  Booster,
  {
    name: string;
    price: number;
    unlock: number;
    description: string;
    icon: ItemKind;
  }
> = {
  shield: {
    name: "Shield Start",
    price: 150,
    unlock: 1,
    description: "Khiên ngay khi cất cánh",
    icon: "shield",
  },
  missile: {
    name: "Missile Start",
    price: 150,
    unlock: 1,
    description: "Tên lửa tự dẫn Lv1",
    icon: "missile",
  },
  weapon: {
    name: "Weapon Boost",
    price: 300,
    unlock: 2,
    description: "Bắt đầu với 3 nòng",
    icon: "plasma",
  },
  bomb: {
    name: "Bomb Pack",
    price: 250,
    unlock: 2,
    description: "Một Nova Bomb trong slot",
    icon: "bomb",
  },
  overdrive: {
    name: "Overdrive Start",
    price: 200,
    unlock: 3,
    description: "Overdrive sẵn trong slot",
    icon: "overdrive",
  },
  magnet: {
    name: "Magnet Pulse",
    price: 120,
    unlock: 1,
    description: "Hút vật phẩm đầu và giữa màn",
    icon: "magnet",
  },
  amp: {
    name: "Score Rocket",
    price: 200,
    unlock: 3,
    description: "Điểm ×2 trong 30 giây đầu",
    icon: "amp",
  },
  lucky: {
    name: "Lucky Drop",
    price: 180,
    unlock: 2,
    description: "+25% tỷ lệ rơi item",
    icon: "star",
  },
  nano: {
    name: "Nanobot Reserve",
    price: 200,
    unlock: 1,
    description: "Nanobot đảm bảo giữa màn",
    icon: "nano",
  },
  revive: {
    name: "Revive Token",
    price: 300,
    unlock: 3,
    description: "Chọn hồi sinh 2 HP một lần",
    icon: "phase",
  },
};
export const MUTATORS: Record<
  Mutator,
  { name: string; bonus: number; description: string }
> = {
  glass: {
    name: "Glass Cannon",
    bonus: 0.6,
    description: "1 HP, không hồi máu",
  },
  swarm: { name: "Swarm", bonus: 0.3, description: "Enemy thêm 50%" },
  fast: {
    name: "Fast Forward",
    bonus: 0.25,
    description: "Tốc độ enemy/đạn ×1,2",
  },
  iron: { name: "Iron Hide", bonus: 0.25, description: "Máu enemy ×1,5" },
  blackout: { name: "Blackout", bonus: 0.2, description: "Thu hẹp tầm nhìn" },
  dry: { name: "Dry Run", bonus: 0.3, description: "Chỉ rơi Nanobot" },
  pacifist: {
    name: "Pacifist Lite",
    bonus: 0.2,
    description: "Không dùng item bấm",
  },
  remix: {
    name: "Boss Remix",
    bonus: 0.25,
    description: "Đổi thứ tự pattern boss",
  },
};
export const ITEM_NAMES: Record<ItemKind, string> = {
  plasma: "Plasma Spread",
  missile: "Homing Missile",
  bomb: "Nova Bomb",
  laser: "Laser Lance",
  shield: "Energy Shield",
  nano: "Repair Nanobot",
  phase: "Phase Cloak",
  magnet: "Star Magnet",
  overdrive: "Overdrive Core",
  amp: "Quantum Amplifier",
  star: "Star Core",
};
export const BOSS_HP = [
  1200, 2000, 3000, 4200, 5600, 7200, 9000, 11000, 13500, 20000,
];
export function levelFor(id: number) {
  return LEVELS[Math.max(0, Math.min(99, Math.trunc(id) - 1))];
}
export function upgradeCost(kind: Upgrade, level: number) {
  return Math.round(500 * 1.45 ** level * UPGRADE_INFO[kind].factor);
}
export function dailySeed(day: string) {
  return Number(day.replaceAll("-", "")) >>> 0;
}
export function weeklySeed(day: string) {
  const d = new Date(day + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return dailySeed(d.toISOString().slice(0, 10));
}

