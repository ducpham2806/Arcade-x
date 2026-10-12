import type {
  GameControlInfo,
  GameAchievementDef,
  DropRateConfig,
} from "../../types";
export const WORD_CROSS_CONTROLS: GameControlInfo[] = [
  {
    key: "Kéo / Chạm",
    action: "Nối theo hàng, cột hoặc đường chéo; hoặc chạm ô đầu rồi ô cuối.",
  },
  {
    key: "Phím mũi tên / Enter",
    action: "Di chuyển con trỏ; Enter chọn đầu và cuối, Escape hủy.",
  },
  {
    key: "Hint miễn phí",
    action: "Chỉ đường cho một từ; dùng hint tối đa 1 sao.",
  },
];
export const WORD_CROSS_ACHIEVEMENTS: GameAchievementDef[] = [];
export const WORD_CROSS_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0,
  scoreThresholdForDrop: 0,
  chestWeights: [],
};
