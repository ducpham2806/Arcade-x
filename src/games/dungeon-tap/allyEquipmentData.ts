import { AllyEquipmentItem, AllyEquipSlot, AllyProfession, ItemRarity } from './types';
import { RARITY_CONFIG, getRandomRarity } from './equipmentData';

export interface ProfessionMeta {
  id: AllyProfession;
  name: string;
  icon: string;
  role: string;
  weaponSlotName: string;
  armorSlotName: string;
  accessorySlotName: string;
  weaponIcon: string;
  armorIcon: string;
  accessoryIcon: string;
  description: string;
}

export const PROFESSION_METAS: Record<AllyProfession, ProfessionMeta> = {
  archer: {
    id: 'archer',
    name: 'Xạ Thủ',
    icon: '🏹',
    role: 'Sát thương vật lý tầm xa & Bão tên',
    weaponSlotName: 'Cung Tên Chuyên Dụng',
    armorSlotName: 'Áo Choàng / Giáp Gió',
    accessorySlotName: 'Ống Tên / Nhẫn Phong Linh',
    weaponIcon: '🏹',
    armorIcon: '🪶',
    accessoryIcon: '🎯',
    description: 'Thành thạo cung tên và ống tiễn ma thuật, bắn rách phòng thủ quái vật.',
  },
  mage: {
    id: 'mage',
    name: 'Pháp Sư',
    icon: '🧙‍♂️',
    role: 'Sát thương ma pháp bộc phát & Thiên thạch',
    weaponSlotName: 'Pháp Trượng Ma Thuật',
    armorSlotName: 'Pháp Bào / Áo Choàng',
    accessorySlotName: 'Quả Cầu / Dây Chuyền Tinh Tú',
    weaponIcon: '🪄',
    armorIcon: '🔮',
    accessoryIcon: '✨',
    description: 'Điều khiển hỏa diệm nguyên tố và ngưng tụ thiên thạch hủy diệt.',
  },
  golem: {
    id: 'golem',
    name: 'Hộ Vệ Titan',
    icon: '🗿',
    role: 'Chấn động diện rộng & Đỡ đòn mặt đất',
    weaponSlotName: 'Chùy Gai Nham Thạch',
    armorSlotName: 'Giáp Hắc Thạch / Bàn Thạch',
    accessorySlotName: 'Lõi Địa Cầu / Phù Hiệu Titan',
    weaponIcon: '🔨',
    armorIcon: '🪨',
    accessoryIcon: '💎',
    description: 'Sức mạnh bàn thạch dẫm nát mặt đất và gây chấn động khôn lường.',
  },
  assassin: {
    id: 'assassin',
    name: 'Sát Thủ',
    icon: '🥷',
    role: 'Chí mạng tử huyệt & Trảm kích bóng tối',
    weaponSlotName: 'Song Đao Hắc Ám',
    armorSlotName: 'Giáp Dạ Hành / Áo Choàng Đen',
    accessorySlotName: 'Mặt Nạ Hư Không / Nhẫn Đoạt Mệnh',
    weaponIcon: '🗡️',
    armorIcon: '🎭',
    accessoryIcon: '💍',
    description: 'Ẩn hiện trong bóng đêm, kết liễu quái vật bằng những nhát đâm hiểm hóc.',
  },
  priestess: {
    id: 'priestess',
    name: 'Thánh Nữ',
    icon: '🧚‍♀️',
    role: 'Hồi phục Mana & Phúc lành ánh sáng',
    weaponSlotName: 'Quyền Trượng Thánh Quang',
    armorSlotName: 'Thánh Y / Áo Choàng Tinh Linh',
    accessorySlotName: 'Vương Miện / Dây Chuyền Thánh Linh',
    weaponIcon: '✨',
    armorIcon: '👑',
    accessoryIcon: '📿',
    description: 'Truyền dẫn năng lượng tinh linh thanh tẩy và tiếp tế linh lực cho toàn đội.',
  },
  dragon_knight: {
    id: 'dragon_knight',
    name: 'Kỵ Sĩ Long Vương',
    icon: '🐲',
    role: 'Long hống cuồng bạo & Hơi thở rồng thiêng',
    weaponSlotName: 'Long Thương Thái Cổ',
    armorSlotName: 'Long Giáp Vảy Rồng',
    accessorySlotName: 'Long Châu / Vảy Rồng Thần',
    weaponIcon: '🔱',
    armorIcon: '🛡️',
    accessoryIcon: '🔮',
    description: 'Thừa hưởng long huyết vĩ đại, càn quét sa trường bằng ngọn giáo rồng thần.',
  },
};

const WEAPONS_BY_PROFESSION: Record<AllyProfession, string[]> = {
  archer: ['Cung Săn Rừng Xanh', 'Cung Gỗ Tinh Linh', 'Thần Cung Phong Bão', 'Nỏ Thần Băng Giá', 'Nguyệt Ảnh Cung', 'Vô Ảnh Thần Cung'],
  mage: ['Gậy Phép Học Việc', 'Trượng Hỏa Long', 'Pháp Trượng Hư Vô', 'Quyền Trượng Bão Lửa', 'Thánh Trượng Tinh Tú', 'Trượng Hỗn Mang'],
  golem: ['Chùy Khối Đá', 'Búa Rèn Cự Thần', 'Chùy Gai Nham Thạch', 'Nắm Đấm Hộ Vệ', 'Thiên Nham Thiết Chùy', 'Cột Trụ Titan'],
  assassin: ['Dao Găm Thép Đen', 'Đoản Kiếm Tẩm Độc', 'Song Đao Huyết Dạ', 'Lưỡi Hái Vô Ảnh', 'Tuyệt Mệnh Song Đao', 'Thần Kiếm Hư Không'],
  priestess: ['Chuông Nguyện Cầu', 'Trượng Thánh Linh', 'Quyền Trượng Ánh Sáng', 'Gậy Phép Tinh Linh', 'Thánh Quang Thần Trượng', 'Khải Hoàn Thánh Trượng'],
  dragon_knight: ['Trường Thương Hiệp Sĩ', 'Long Thương Vảy Đỏ', 'Chiến Kích Long Thần', 'Hắc Long Trảm Đao', 'Bá Vương Long Thương', 'Long Thần Diệt Thế Thương'],
};

const ARMORS_BY_PROFESSION: Record<AllyProfession, string[]> = {
  archer: ['Áo Vải Ngụy Trang', 'Áo Choàng Gió', 'Giáp Da Xạ Thủ', 'Mũ Thợ Săn Tinh Linh', 'Vũ Dực Phi Phong', 'Thần Phong Vũ Y'],
  mage: ['Áo Choàng Tân Pháp Sư', 'Pháp Bào Hỏa Linh', 'Áo Choàng Ma Lực', 'Vương Miện Nguyên Tố', 'Hắc Ma Áo Choàng', 'Chí Tôn Ma Thần Bào'],
  golem: ['Tấm Chắn Đá Hoa', 'Giáp Hắc Thạch', 'Khiên Bàn Thạch', 'Khối Nham Thạch Bất Hoại', 'Thái Cổ Thạch Giáp', 'Titan Bất Diệt Thuẫn'],
  assassin: ['Mặt Nạ Vải Đen', 'Giáp Da Dạ Hành', 'Áo Choàng Bóng Tối', 'Hắc Y Thích Khách', 'U Linh Ám Y', 'Hư Không Vô Ảnh Giáp'],
  priestess: ['Khăn Thánh Mẫu', 'Thánh Y Bạch Ngân', 'Vòng Nguyệt Quế Ánh Sáng', 'Trang Phục Tinh Linh', 'Thiên Sứ Thánh Bào', 'Thần Thánh Quang Huy Giáp'],
  dragon_knight: ['Giáp Da Rồng Lửa', 'Long Giáp Vảy Rồng', 'Khiên Đầu Rồng', 'Mũ Giáp Long Vương', 'Huyết Long Chiến Khải', 'Thần Long Bất Tử Giáp'],
};

const ACCESSORIES_BY_PROFESSION: Record<AllyProfession, string[]> = {
  archer: ['Ống Tên Sơ Cấp', 'Nhẫn Phong Linh', 'Kính Ngắm Tinh Linh', 'Bùa Ước Thần Phong', 'Lông Vũ Phượng Hoàng', 'Thần Xạ Di vật'],
  mage: ['Quả Cầu Tập Sự', 'Dây Chuyền Tinh Tú', 'Lọ Ma Lực Vĩnh Cửu', 'Trái Tim Hỏa Long', 'Bảo Ngọc Nguyên Tố', 'Tinh Thể Hỗn Mang'],
  golem: ['Mảnh Vụn Hắc Thạch', 'Lõi Địa Cầu', 'Phù Hiệu Cự Thần', 'Ấn Tín Bàn Thạch', 'Trái Tim Nham Thạch', 'Di Vật Cổ Titan'],
  assassin: ['Nhẫn Thép Đen', 'Mặt Nạ Hư Không', 'Nhẫn Đoạt Mệnh', 'Bùa Ám Dạ', 'Huyết Châu Thích Khách', 'Hư Không Tử Thần Thạch'],
  priestess: ['Chuỗi Hạt Bình An', 'Dây Chuyền Tinh Linh', 'Thánh Huy Ánh Sáng', 'Chén Thánh Ban Phúc', 'Bảo Châu Quang Diệu', 'Hào Quang Nữ Thần'],
  dragon_knight: ['Móng Vuốt Rồng Con', 'Vảy Rồng Thần', 'Long Châu Thái Cổ', 'Trái Tim Long Vương', 'Bảo Hộ Long Thần', 'Di Vật Long Hoàng'],
};

export function generateAllyLootItem(
  stage: number,
  forcedProfession?: AllyProfession,
  forcedSlot?: AllyEquipSlot
): AllyEquipmentItem {
  const professions: AllyProfession[] = ['archer', 'mage', 'golem', 'assassin', 'priestess', 'dragon_knight'];
  const profession = forcedProfession || professions[Math.floor(Math.random() * professions.length)];
  const profMeta = PROFESSION_METAS[profession];

  const slots: AllyEquipSlot[] = ['ally_weapon', 'ally_armor', 'ally_accessory'];
  const slot = forcedSlot || slots[Math.floor(Math.random() * slots.length)];

  const rarity = getRandomRarity(stage);
  const rarityInfo = RARITY_CONFIG[rarity];

  const nameList =
    slot === 'ally_weapon'
      ? WEAPONS_BY_PROFESSION[profession]
      : slot === 'ally_armor'
      ? ARMORS_BY_PROFESSION[profession]
      : ACCESSORIES_BY_PROFESSION[profession];
  const baseName = nameList[Math.floor(Math.random() * nameList.length)];
  const itemLevel = 1;

  const stageScale = Math.pow(1.08, Math.max(0, stage - 1));
  const statScale = stageScale * rarityInfo.statMultiplier;

  let dpsBonusPercent = 0;
  let skillBonusPercent = 0;
  let cooldownReductionSec = 0;
  let teamBuffBonusPercent = 0;

  if (slot === 'ally_weapon') {
    dpsBonusPercent = Math.round(25 * statScale);
    skillBonusPercent = Math.round(20 * statScale);
  } else if (slot === 'ally_armor') {
    dpsBonusPercent = Math.round(15 * statScale);
    skillBonusPercent = Math.round(15 * statScale);
    cooldownReductionSec = Math.min(4.0, Math.round(0.5 * rarityInfo.statMultiplier * 10) / 10);
    teamBuffBonusPercent = Math.round(8 * statScale);
  } else {
    // Accessory slot: rich blend of cooldown reduction, skill bonus, and team buff
    dpsBonusPercent = Math.round(18 * statScale);
    skillBonusPercent = Math.round(25 * statScale);
    cooldownReductionSec = Math.min(3.0, Math.round(0.4 * rarityInfo.statMultiplier * 10) / 10);
    teamBuffBonusPercent = Math.round(15 * statScale);
  }

  const sellValue = Math.round(25 * statScale);
  const upgradeCost = Math.round(40 * statScale);
  const icon =
    slot === 'ally_weapon'
      ? profMeta.weaponIcon
      : slot === 'ally_armor'
      ? profMeta.armorIcon
      : profMeta.accessoryIcon;

  return {
    id: `ally-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: baseName,
    profession,
    professionName: profMeta.name,
    slot,
    rarity,
    level: 1,
    dpsBonusPercent,
    skillBonusPercent,
    cooldownReductionSec,
    teamBuffBonusPercent,
    icon,
    description: `Trang bị ${rarityInfo.name} chuyên dụng cho ${profMeta.name} cấp ${itemLevel}.`,
    sellValue,
    upgradeCost,
  };
}

export const STARTER_ALLY_EQUIPMENT: Record<
  AllyProfession,
  { weapon: AllyEquipmentItem; armor: AllyEquipmentItem; accessory: AllyEquipmentItem }
> = {
  archer: {
    weapon: {
      id: 'starter-archer-weapon',
      name: 'Cung Gỗ Sơ Cấp (+1)',
      profession: 'archer',
      professionName: 'Xạ Thủ',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 15,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: '🏹',
      description: 'Cung gỗ khởi đầu giúp cung thủ tăng tốc độ bắn tên.',
      sellValue: 15,
      upgradeCost: 30,
    },
    armor: {
      id: 'starter-archer-armor',
      name: 'Áo Choàng Rừng Xanh (+1)',
      profession: 'archer',
      professionName: 'Xạ Thủ',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 10,
      skillBonusPercent: 10,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 5,
      icon: '🪶',
      description: 'Khăn choàng ngụy trang bảo hộ cung thủ.',
      sellValue: 15,
      upgradeCost: 30,
    },
    accessory: {
      id: 'starter-archer-accessory',
      name: 'Ống Tên Phong Linh (+1)',
      profession: 'archer',
      professionName: 'Xạ Thủ',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 18,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 8,
      icon: '🎯',
      description: 'Ống tên tinh linh giúp tên bắn nhanh và chuẩn xác hơn.',
      sellValue: 15,
      upgradeCost: 30,
    },
  },
  mage: {
    weapon: {
      id: 'starter-mage-weapon',
      name: 'Gậy Phép Tập Sự (+1)',
      profession: 'mage',
      professionName: 'Pháp Sư',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 25,
      skillBonusPercent: 20,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: '🪄',
      description: 'Gậy gỗ tập ngưng tụ quả cầu ma thuật.',
      sellValue: 20,
      upgradeCost: 40,
    },
    armor: {
      id: 'starter-mage-armor',
      name: 'Pháp Bào Học Việc (+1)',
      profession: 'mage',
      professionName: 'Pháp Sư',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 12,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 5,
      icon: '🔮',
      description: 'Áo choàng giúp ổn định luồng ma lực.',
      sellValue: 20,
      upgradeCost: 40,
    },
    accessory: {
      id: 'starter-mage-accessory',
      name: 'Quả Cầu Tinh Tú (+1)',
      profession: 'mage',
      professionName: 'Pháp Sư',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 22,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 10,
      icon: '✨',
      description: 'Quả cầu thủy tinh khuếch đại uy lực pháp thuật.',
      sellValue: 20,
      upgradeCost: 40,
    },
  },
  golem: {
    weapon: {
      id: 'starter-golem-weapon',
      name: 'Chùy Khối Đá Nhỏ (+1)',
      profession: 'golem',
      professionName: 'Hộ Vệ Titan',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 22,
      skillBonusPercent: 20,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: '🔨',
      description: 'Khối đá thô cứng tạo nên cú đập mạnh mẽ.',
      sellValue: 30,
      upgradeCost: 60,
    },
    armor: {
      id: 'starter-golem-armor',
      name: 'Tấm Chắn Đất Mẹ (+1)',
      profession: 'golem',
      professionName: 'Hộ Vệ Titan',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 10,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 8,
      icon: '🪨',
      description: 'Mặt giáp bằng đá hoa gia cố thân thể Titan.',
      sellValue: 30,
      upgradeCost: 60,
    },
    accessory: {
      id: 'starter-golem-accessory',
      name: 'Lõi Địa Cầu Titan (+1)',
      profession: 'golem',
      professionName: 'Hộ Vệ Titan',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 16,
      skillBonusPercent: 18,
      cooldownReductionSec: 0.4,
      teamBuffBonusPercent: 12,
      icon: '💎',
      description: 'Tinh thạch lõi đất nung nóng năng lượng bàn thạch.',
      sellValue: 30,
      upgradeCost: 60,
    },
  },
  assassin: {
    weapon: {
      id: 'starter-assassin-weapon',
      name: 'Đoản Đao Hắc Sắc (+1)',
      profession: 'assassin',
      professionName: 'Sát Thủ',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 30,
      skillBonusPercent: 25,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 0,
      icon: '🗡️',
      description: 'Lưỡi đoản đao rèn thép đen sắc bén.',
      sellValue: 50,
      upgradeCost: 100,
    },
    armor: {
      id: 'starter-assassin-armor',
      name: 'Giáp Da Dạ Hành (+1)',
      profession: 'assassin',
      professionName: 'Sát Thủ',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 15,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 5,
      icon: '🎭',
      description: 'Trang phục đen tuyền giúp sát thủ hòa vào bóng tối.',
      sellValue: 50,
      upgradeCost: 100,
    },
    accessory: {
      id: 'starter-assassin-accessory',
      name: 'Nhẫn Đoạt Mệnh (+1)',
      profession: 'assassin',
      professionName: 'Sát Thủ',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 25,
      cooldownReductionSec: 0.6,
      teamBuffBonusPercent: 8,
      icon: '💍',
      description: 'Chiếc nhẫn tẩm ám khí tăng khả năng chí mạng hiểm ác.',
      sellValue: 50,
      upgradeCost: 100,
    },
  },
  priestess: {
    weapon: {
      id: 'starter-priestess-weapon',
      name: 'Trượng Tinh Linh Non (+1)',
      profession: 'priestess',
      professionName: 'Thánh Nữ',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.5,
      teamBuffBonusPercent: 10,
      icon: '✨',
      description: 'Cành cây thần phát sáng ban phước lành.',
      sellValue: 80,
      upgradeCost: 150,
    },
    armor: {
      id: 'starter-priestess-armor',
      name: 'Vòng Nguyệt Quế (+1)',
      profession: 'priestess',
      professionName: 'Thánh Nữ',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 12,
      skillBonusPercent: 20,
      cooldownReductionSec: 1.0,
      teamBuffBonusPercent: 10,
      icon: '👑',
      description: 'Vương miện kết từ lá cây thánh quang.',
      sellValue: 80,
      upgradeCost: 150,
    },
    accessory: {
      id: 'starter-priestess-accessory',
      name: 'Dây Chuyền Thánh Quang (+1)',
      profession: 'priestess',
      professionName: 'Thánh Nữ',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 15,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 18,
      icon: '📿',
      description: 'Chuỗi ngọc thánh liên tục tích lũy linh lực chữa lành.',
      sellValue: 80,
      upgradeCost: 150,
    },
  },
  dragon_knight: {
    weapon: {
      id: 'starter-dragon-weapon',
      name: 'Long Thương Rèn Thô (+1)',
      profession: 'dragon_knight',
      professionName: 'Kỵ Sĩ Long Vương',
      slot: 'ally_weapon',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 35,
      skillBonusPercent: 25,
      cooldownReductionSec: 0,
      teamBuffBonusPercent: 8,
      icon: '🔱',
      description: 'Thanh trường thương đúc bằng vảy rồng non.',
      sellValue: 120,
      upgradeCost: 250,
    },
    armor: {
      id: 'starter-dragon-armor',
      name: 'Long Giáp Vảy Đỏ (+1)',
      profession: 'dragon_knight',
      professionName: 'Kỵ Sĩ Long Vương',
      slot: 'ally_armor',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 20,
      skillBonusPercent: 15,
      cooldownReductionSec: 1.0,
      teamBuffBonusPercent: 12,
      icon: '🛡️',
      description: 'Tấm giáp kiên cố chống chịu hơi thở rồng dữ.',
      sellValue: 120,
      upgradeCost: 250,
    },
    accessory: {
      id: 'starter-dragon-accessory',
      name: 'Long Châu Thái Cổ (+1)',
      profession: 'dragon_knight',
      professionName: 'Kỵ Sĩ Long Vương',
      slot: 'ally_accessory',
      rarity: 'common',
      level: 1,
      dpsBonusPercent: 25,
      skillBonusPercent: 30,
      cooldownReductionSec: 0.8,
      teamBuffBonusPercent: 15,
      icon: '🔮',
      description: 'Viên long châu cổ tỏa nhiệt huyết rồng thần uy dũng.',
      sellValue: 120,
      upgradeCost: 250,
    },
  },
};

export function calculateAllyItemPower(item: AllyEquipmentItem | null | undefined): number {
  if (!item) return 0;
  return Math.round(
    item.dpsBonusPercent * 1.5 +
    item.skillBonusPercent * 1.2 +
    item.cooldownReductionSec * 15 +
    item.teamBuffBonusPercent * 2 +
    item.level * 3
  );
}

