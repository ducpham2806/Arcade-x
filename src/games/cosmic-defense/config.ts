import type {
  DropRateConfig,
  GameAchievementDef,
  GameControlInfo,
} from "../../types";
export const COSMIC_DEFENSE_ACHIEVEMENTS: GameAchievementDef[] = [];
export const COSMIC_DEFENSE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0,
  scoreThresholdForDrop: Number.MAX_SAFE_INTEGER,
  chestWeights: [],
};
export const COSMIC_DEFENSE_CONTROLS: GameControlInfo[] = [
  {
    key: "Kéo / Mũi tên / WASD",
    action: "Bay tương đối, né đạn bằng hitbox lõi trắng",
  },
  { key: "Tự động bắn", action: "Thu Plasma để nâng cấp hỏa lực Lv1–5" },
  { key: "Q / Space · E · R", action: "Dùng item trong các slot tương ứng" },
  { key: "Escape", action: "Tạm dừng; luyện tập có thể tua lại 10 giây" },
];
