import {
  GameControlInfo,
  DropRateConfig,
  GameAchievementDef,
} from "../../types";

export const CAR_ESCAPE_CONTROLS: GameControlInfo[] = [
  {
    key: "Kéo / chạm",
    action: "Trượt xe dọc theo đường ray; chạm xe rồi chạm điểm đến cũng được",
    touchInstruction: "Kéo xe hoặc chọn xe rồi chạm điểm xanh",
  },
  {
    key: "Mũi tên / Shift",
    action: "Mũi tên trượt 1 ô; giữ Shift để trượt tới cuối đường",
    touchInstruction: "Mỗi lần trượt tính 1 lượt",
  },
  {
    key: "Mục tiêu",
    action: "Đưa xe cứu hộ vàng tới lối EXIT màu xanh",
    touchInstruction: "Mở lối cho xe vàng",
  },
  {
    key: "Hint / sao",
    action:
      "Hint miễn phí gợi một bước; có hint tối đa 1 sao, không hint có thể đạt 3 sao",
    touchInstruction: "Hoàn tác tính thêm 1 lượt",
  },
];

export const CAR_ESCAPE_DROP_RATES: DropRateConfig = {
  baseChestDropChance: 0,
  scoreThresholdForDrop: 0,
  chestWeights: [],
};
export const CAR_ESCAPE_ACHIEVEMENTS: GameAchievementDef[] = [];

