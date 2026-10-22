import { StoryChapter, TitanMonster } from './types';

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 1,
    name: 'Chương 1: Thung Lũng Goblin',
    title: 'Biên Giới Hắc Ám',
    lore: 'Lũ Goblin nổi loạn dưới sự bảo hộ của tộc Titan cổ đại. Hãy vung thanh kiếm thần mở đường qua thung lũng đá cuội.',
    startStage: 1,
    endStage: 20,
    bossName: 'Goblin Vương Khổng Lồ',
    bossAvatar: '👺',
    bgGradient: 'from-amber-950 via-slate-900 to-stone-950',
    badge: '🌲',
  },
  {
    id: 2,
    name: 'Chương 2: Hầm Mỏ Khung Xương',
    title: 'Lăng Mộ Bị Nguyền Rủa',
    lore: 'Tầng sâu hầm mỏ bỏ hoang tràn ngập các chiến binh vong linh và người đá bất tử canh giữ kho báu ngàn năm.',
    startStage: 21,
    endStage: 40,
    bossName: 'Đại Tướng Khung Xương Bất Diệt',
    bossAvatar: '💀',
    bgGradient: 'from-slate-950 via-zinc-900 to-indigo-950',
    badge: '⛏️',
  },
  {
    id: 3,
    name: 'Chương 3: Rừng Phù Thủy Ma Quái',
    title: 'Vùng Đất Độc Dược',
    lore: 'Những cây đại thụ phát sáng lân tinh và bầy nhện hư không phục kích bất kỳ lữ khách nào dám đặt chân vào.',
    startStage: 41,
    endStage: 60,
    bossName: 'Mẫu Chúa Nhện Hư Không',
    bossAvatar: '🕷️',
    bgGradient: 'from-emerald-950 via-slate-950 to-teal-950',
    badge: '🌿',
  },
  {
    id: 4,
    name: 'Chương 4: Pháo Đài Huyết Ma',
    title: 'Thành Trì Bóng Tối',
    lore: 'Lâu đài cổ kính che khuất ánh mặt trời, nơi các ác ma và bá tước ma cà rồng thao túng ma thuật đen tối.',
    startStage: 61,
    endStage: 80,
    bossName: 'Bá Tước Huyết Ma Dracula',
    bossAvatar: '🧛‍♂️',
    bgGradient: 'from-rose-950 via-neutral-950 to-slate-950',
    badge: '🏰',
  },
  {
    id: 5,
    name: 'Chương 5: Núi Lửa Dung Nham',
    title: 'Trái Tim Rồng Lửa',
    lore: 'Dòng dung nham cuồn cuộn đỏ rực nung chảy mọi thứ. Nơi ngự trị của chúa tể rồng lửa và các Titan dung nham.',
    startStage: 81,
    endStage: 100,
    bossName: 'HỎA LONG VƯƠNG TITAN',
    bossAvatar: '🐉',
    bgGradient: 'from-red-950 via-amber-950 to-stone-950',
    badge: '🌋',
  },
  {
    id: 6,
    name: 'Chương 6: Băng Phong Cực Địa',
    title: 'Vùng Đất Băng Giá Vĩnh Hằng',
    lore: 'Cơn bão tuyết vĩnh cửu đóng băng cả linh hồn. Người khổng lồ băng tuyết canh giữ cánh cổng thiên đường.',
    startStage: 101,
    endStage: 130,
    bossName: 'Băng Ma Khổng Lồ Frostbite',
    bossAvatar: '🥶',
    bgGradient: 'from-cyan-950 via-sky-950 to-slate-950',
    badge: '❄️',
  },
  {
    id: 7,
    name: 'Chương 7: Đền Thờ Lôi Điện',
    title: 'Điện Thờ Thần Sấm',
    lore: 'Sét rạch xé toạc bầu trời, nguồn năng lượng nguyên bản của vũ trụ đang chờ đợi kẻ xứng đáng hấp thu.',
    startStage: 131,
    endStage: 160,
    bossName: 'Lôi Thần Titan Mjölnir',
    bossAvatar: '⚡',
    bgGradient: 'from-yellow-950 via-indigo-950 to-slate-950',
    badge: '⚡',
  },
  {
    id: 8,
    name: 'Chương 8: Vực Thẳm Titan Hư Vô',
    title: 'Hư Không Vô Tận',
    lore: 'Không gian bị bóp méo, nơi quy tụ những Titan vũ trụ tối thượng với sức mạnh hủy diệt thế giới.',
    startStage: 161,
    endStage: 200,
    bossName: 'CHÚA TỂ HƯ VÔ KAI THE PUPPET',
    bossAvatar: '👹',
    bgGradient: 'from-purple-950 via-slate-950 to-zinc-950',
    badge: '🌌',
  },
];

export const REGULAR_MONSTER_NAMES = [
  { name: 'Goblin Trinh Sát', avatar: '👺' },
  { name: 'Khung Xương Đao Phủ', avatar: '💀' },
  { name: 'Yêu Tinh Rừng Già', avatar: '🧌' },
  { name: 'Bọ Cạp Độc Thần', avatar: '🦂' },
  { name: 'Chiến Binh Người Đá', avatar: '🗿' },
  { name: 'Quỷ Lửa Ma Đạo', avatar: '🔥' },
  { name: 'Phù Thủy Hắc Ám', avatar: '🧙‍♂️' },
  { name: 'Người Sói Cuồng Loạn', avatar: '🐺' },
  { name: 'Chiến Binh Giáp Sắt', avatar: '🛡️' },
  { name: 'Rồng Con Độc Dược', avatar: '🦎' },
  { name: 'Ma Cây Ngàn Năm', avatar: '🌳' },
  { name: 'Bóng Ma Vong Hồn', avatar: '👻' },
  { name: 'Dơi Khát Máu', avatar: '🦇' },
  { name: 'Sát Thủ Bóng Đêm', avatar: '🥷' },
  { name: 'Khỉ Đột Titan', avatar: '🦍' },
];

export const BOSS_NAMES = [
  { name: 'Goblin Đại Tướng', avatar: '👺', title: 'Thủ Lĩnh Bộ Lạc' },
  { name: 'Hộ Vệ Hoàng Kim Titan', avatar: '🗿', title: 'Hộ Vệ Cổ Tích' },
  { name: 'Chúa Tể Nhện Quỷ', avatar: '🕷️', title: 'Kẻ Săn Đêm' },
  { name: 'Bá Tước Ma Cà Rồng', avatar: '🧛‍♂️', title: 'Bất Tử Huyết Tộc' },
  { name: 'HỎA LONG TITAN', avatar: '🐉', title: 'Hủy Diệt Long Thần' },
  { name: 'Băng Vương Tuyết Sơn', avatar: '🥶', title: 'Lãnh Chúa Băng Giá' },
  { name: 'Lôi Thần Cuồng Bạo', avatar: '⚡', title: 'Bão Tố Sấm Sét' },
  { name: 'Vua Hư Vô Kai Puppet', avatar: '👹', title: 'Đấng Thao Túng Vũ Trụ' },
  { name: 'Ma Thần Bất Diệt', avatar: '👿', title: 'Bóng Tối Tối Thượng' },
  { name: 'TITAN THÁI CỔ', avatar: '👑', title: 'Chúa Tể Hư Không' },
];

export function getStoryChapterForStage(stage: number): StoryChapter {
  const found = STORY_CHAPTERS.find((c) => stage >= c.startStage && stage <= c.endStage);
  if (found) return found;
  // Fallback for stages > 200 (endless scaling)
  return {
    id: Math.floor((stage - 1) / 20) + 1,
    name: `Chương ${Math.floor((stage - 1) / 20) + 1}: Vực Thẳm Cực Hạn`,
    title: 'Chinh Phục Huyền Thoại',
    lore: 'Vượt qua mọi giới hạn của người trần mắt thịt, đối đầu trực diện với những Titan hùng mạnh nhất vũ trụ.',
    startStage: Math.floor((stage - 1) / 20) * 20 + 1,
    endStage: Math.floor((stage - 1) / 20) * 20 + 20,
    bossName: 'CHÚA TỂ TITAN THÁI CỔ',
    bossAvatar: '👑',
    bgGradient: 'from-violet-950 via-neutral-950 to-slate-950',
    badge: '👑',
  };
}

/**
 * Generates a monster for the specified stage.
 * Cứ 10 level (stage % 10 === 0) là BOSS Titan khổng lồ!
 */
export function generateMonsterForStage(stage: number): TitanMonster {
  const isBoss = stage % 10 === 0;
  const chapter = getStoryChapterForStage(stage);

  // Health and stats mathematical scaling
  // Base HP scales exponentially with stage
  const baseHealth = 85;
  const healthGrowth = 1.16; // 18% increase per stage
  let calculatedHp = Math.round(baseHealth * Math.pow(healthGrowth, stage - 1));

  // Boss has 5.5x health multiplier and 30s timer
  if (isBoss) {
    calculatedHp = Math.round(calculatedHp * 5.5);
  }

  // Base Attack Power (damage to player/timer urgency)
  const baseAtk = 10;
  const attackPower = Math.round(baseAtk * Math.pow(1.15, stage - 1));

  // Gold reward
  const baseGold = 18;
  let goldReward = Math.round(baseGold * Math.pow(1.16, stage - 1));
  if (isBoss) {
    goldReward = Math.round(goldReward * 4.5);
  }

  if (isBoss) {
    const bossIdx = Math.min(7, chapter.id - 1);
    const minibossNames = ['Goblin Chùy Sắt','Hộ Vệ Xương Cổ','Nhện Dệt Tơ Độc','Hiệp Sĩ Huyết Nguyệt','Ấu Long Dung Nham','Cự Nhân Băng Giáp','Kỵ Sĩ Lôi Vũ','Sứ Giả Hư Vô'];
    const bossTemplate = {name:stage===chapter.endStage?chapter.bossName:minibossNames[bossIdx],avatar:chapter.bossAvatar,title:stage===chapter.endStage?'Thủ lĩnh chương':'Hộ vệ cổng Titan'};
    return {
      id: `boss-${stage}-${Date.now()}`,
      name: `[CẤP ${stage}] ${bossTemplate.name}`,
      title: `${bossTemplate.title} - BOSS TẦNG ${stage}`,
      avatar: bossTemplate.avatar,
      level: stage,
      stage,
      hp: calculatedHp,
      maxHp: calculatedHp,
      attackPower,
      goldReward,
      isBoss: true,
      timeRemaining: 30, // 30s countdown for boss
      maxTime: 30,
      theme: chapter.bgGradient,
    };
  }

  // Regular Titan
  const pools = [
    ['Goblin Trinh Sát','Goblin Thiết Giáp','Quỷ Rừng'],['Khung Xương Đao Phủ','Hộ Vệ Lăng Mộ','Pháp Sư Vong Linh'],
    ['Nhện Hư Không','Ma Cây Độc Dược','Phù Thủy Rừng'],['Dơi Huyết Dạ','Lính Gác Huyết Ma','Bóng Ma Thành Cổ'],
    ['Tinh Linh Hỏa Ngục','Hộ Vệ Dung Nham','Rồng Con Lửa'],['Băng Linh','Chiến Binh Tuyết','Phù Thủy Băng'],
    ['Hộ Vệ Lôi Điện','Sứ Giả Sấm Sét','Kỵ Binh Thiên Lôi'],['Kẻ Săn Hư Vô','Ảo Ảnh Titan','Bóng Ma Vực Thẳm'],
  ];
  const regTemplate = {name:pools[Math.min(7,chapter.id-1)][(stage*7+3)%3],avatar:chapter.bossAvatar};
  return {
    id: `mob-${stage}-${Date.now()}`,
    name: `${regTemplate.name} (T${stage})`,
    title: `Quái Vật Cấp ${stage}`,
    avatar: regTemplate.avatar,
    level: stage,
    stage,
    hp: calculatedHp,
    maxHp: calculatedHp,
    attackPower,
    goldReward,
    isBoss: false,
    timeRemaining: 999,
    maxTime: 999,
    theme: chapter.bgGradient,
  };
}
