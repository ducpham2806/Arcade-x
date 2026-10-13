import {
  DropRateConfig,
  GameAchievementDef,
  GameControlInfo,
} from "../../types";

// Blossom's badges and Xu rewards are settled in its own idempotent ledger.
export const HEX_MATCH_ACHIEVEMENTS: GameAchievementDef[] = [];

export const HEX_MATCH_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0,
  scoreThresholdForDrop: 400,
  chestWeights: [
    { type: "common", weight: 45 },
    { type: "rare", weight: 35 },
    { type: "epic", weight: 15 },
    { type: "legendary", weight: 5 },
  ],
};

export const HEX_MATCH_CONTROLS: GameControlInfo[] = [
  {
    key: "Chạm nhóm ≥3 hoa",
    action: "Nổ nhóm kề ngang hoặc dọc; chạm sai không tốn lượt",
  },
  {
    key: "Nhóm 5–6 / 7–8 / 9–10 / 11+",
    action: "Tạo Ong / Bom Hoa / Cầu Vồng / Mặt Trời",
  },
  {
    key: "Ghép đôi",
    action: "Chọn hai vật phẩm đặc biệt cạnh nhau; dùng 1 lượt",
  },
  {
    key: "Chuẩn bị trước ván",
    action: "Tối đa 3 loại khởi đầu; hỗ trợ chưa dùng được hoàn trả",
  },
];
