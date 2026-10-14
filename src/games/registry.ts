import { lazy } from 'react';
import { BLOSSOM_TITLE } from './hex-match/blossom/branding';
const BoomBuddiesGame = lazy(() => import('./boom-buddies'));
const RainbowBlocksGame = lazy(() => import('./rainbow-blocks'));
import { GameMetadata } from '../types';
const NeonRunnerGame = lazy(() => import('./neon-runner').then(module => ({ default: module.NeonRunnerGame })));
import { NEON_RUNNER_ACHIEVEMENTS, NEON_RUNNER_DROP_RATES, NEON_RUNNER_CONTROLS } from './neon-runner/config';
const CosmicDefenseGame = lazy(() => import('./cosmic-defense').then(module => ({ default: module.CosmicDefenseGame })));
import { COSMIC_DEFENSE_ACHIEVEMENTS, COSMIC_DEFENSE_DROP_RATES, COSMIC_DEFENSE_CONTROLS } from './cosmic-defense/config';
const CyberSliceGame = lazy(() => import('./cyber-slice').then(module => ({ default: module.CyberSliceGame })));
import { CYBER_SLICE_ACHIEVEMENTS, CYBER_SLICE_DROP_RATES, CYBER_SLICE_CONTROLS } from './cyber-slice/config';
const DungeonTapGame = lazy(() => import('./dungeon-tap').then(module => ({ default: module.DungeonTapGame })));
import { DUNGEON_TAP_ACHIEVEMENTS, DUNGEON_TAP_DROP_RATES, DUNGEON_TAP_CONTROLS } from './dungeon-tap/config';
const HexMatchGame = lazy(() => import('./hex-match').then(module => ({ default: module.HexMatchGame })));
import { HEX_MATCH_ACHIEVEMENTS, HEX_MATCH_DROP_RATES, HEX_MATCH_CONTROLS } from './hex-match/config';
const Tile2048Game = lazy(() => import('./tile-2048').then(module => ({ default: module.Tile2048Game })));
import { TILE_2048_ACHIEVEMENTS, TILE_2048_DROP_RATES, TILE_2048_CONTROLS } from './tile-2048/config';
import { DrawAShapeMeta } from './draw-a-shape/meta';
const CaroGomokuGame = lazy(() => import('./caro-gomoku').then(module => ({ default: module.CaroGomokuGame })));
import { CARO_GOMOKU_ACHIEVEMENTS, CARO_GOMOKU_DROP_RATES, CARO_GOMOKU_CONTROLS } from './caro-gomoku/config';
const XiangqiGame = lazy(() => import('./xiangqi').then(module => ({ default: module.XiangqiGame })));
import { XIANGQI_ACHIEVEMENTS, XIANGQI_DROP_RATES, XIANGQI_CONTROLS } from './xiangqi/config';
const ChessGame = lazy(() => import('./chess').then(module => ({ default: module.ChessGame })));
const BlockerGame = lazy(() => import('./blocker').then(module => ({ default: module.BlockerGame })));
import { BLOCKER_ACHIEVEMENTS, BLOCKER_DROP_RATES, BLOCKER_CONTROLS } from './blocker/config';
const FillTheSpaceGame = lazy(() => import('./fill-the-space').then(module => ({ default: module.FillTheSpaceGame })));
import { FILL_THE_SPACE_ACHIEVEMENTS, FILL_THE_SPACE_DROP_RATES, FILL_THE_SPACE_CONTROLS } from './fill-the-space/config';
const ScoodokuGame = lazy(() => import('./scoodoku').then(module => ({ default: module.ScoodokuGame })));
import { SCOODOKU_ACHIEVEMENTS, SCOODOKU_DROP_RATES, SCOODOKU_CONTROLS } from './scoodoku/config';
const ShikakuGame = lazy(() => import('./shikaku').then(module => ({ default: module.ShikakuGame })));
import { SHIKAKU_ACHIEVEMENTS, SHIKAKU_DROP_RATES, SHIKAKU_CONTROLS } from './shikaku/config';
const EatEmAllGame = lazy(() => import('./eat-em-all').then(module => ({ default: module.EatEmAllGame })));
import { EAT_EM_ALL_ACHIEVEMENTS, EAT_EM_ALL_DROP_RATES, EAT_EM_ALL_CONTROLS } from './eat-em-all/config';
const MummyEscapeGame = lazy(() => import('./mummy-escape').then(module => ({ default: module.MummyEscapeGame })));
import { MUMMY_ESCAPE_ACHIEVEMENTS, MUMMY_ESCAPE_DROP_RATES, MUMMY_ESCAPE_CONTROLS } from './mummy-escape/config';

import { CHESS_ACHIEVEMENTS, CHESS_DROP_RATES, CHESS_CONTROLS } from './chess/config';

const CarEscapeGame = lazy(() => import('./car-escape').then(module => ({ default: module.CarEscapeGame })));
import { CAR_ESCAPE_ACHIEVEMENTS, CAR_ESCAPE_DROP_RATES, CAR_ESCAPE_CONTROLS } from './car-escape/config';

const WordCrossGame = lazy(() => import('./word-cross').then(module => ({ default: module.WordCrossGame })));
import { WORD_CROSS_ACHIEVEMENTS, WORD_CROSS_DROP_RATES, WORD_CROSS_CONTROLS } from './word-cross/config';

export const GAME_REGISTRY: Record<string, GameMetadata> = {
  'boom-buddies': {
    id:'boom-buddies',title:'Boom Buddies',shortDesc:'Đặt bom, né lửa · Bản thử điều khiển mượt',
    description:'Bản thử offline: di chuyển liên tục, joystick giữ–kéo và bom nổ liền mạch. Tiến trình lưu trên thiết bị, chưa đồng bộ tài khoản hoặc bảng xếp hạng server.',
    category:'Arcade',difficulty:'Trung Bình',icon:'💣',bannerGradient:'from-orange-700 via-amber-800 to-green-900',themeColor:'#d8732e',
    tags:['Bản thử','Đặt bom','Joystick','Offline'],controls:[{key:'WASD / Mũi tên',action:'Di chuyển liên tục',touchInstruction:'Giữ và kéo joystick'},{key:'Space',action:'Đặt bom',touchInstruction:'Chạm nút bom khi đang di chuyển'},{key:'E',action:'Kỹ năng'},{key:'Escape',action:'Tạm dừng'}],
    achievements:[],dropRates:{baseChestDropChance:0,scoreThresholdForDrop:Number.MAX_SAFE_INTEGER,chestWeights:[]},component:BoomBuddiesGame,
  },
  'rainbow-blocks': {
    id:'rainbow-blocks',title:'Rainbow Blocks',shortDesc:'Xếp sắc màu, xoá hàng và bật cầu vồng',
    description:'Game khối rơi 10×20 với xoay SRS, giữ khối, bóng rơi và 5 chế độ chơi. Thử sức với Điểm cao, Đua thời gian, Thư giãn, Tốc độ riêng và Sprint 40 hàng.',
    category:'Puzzle',difficulty:'Trung Bình',icon:'🌈',bannerGradient:'from-sky-900 via-indigo-900 to-violet-950',themeColor:'#1ec8f0',
    tags:['Game mới','Xếp khối','Cầu vồng','Combo','Cảm ứng'],
    controls:[{key:'← → / A D',action:'Di chuyển',touchInstruction:'Kéo ngang để di chuyển'},{key:'↑ / X · Z',action:'Xoay khối',touchInstruction:'Chạm để xoay'},{key:'Space',action:'Thả ngay',touchInstruction:'Vuốt nhanh xuống'},{key:'C / Shift',action:'Giữ khối',touchInstruction:'Chạm ô Giữ hoặc vuốt lên'},{key:'P',action:'Tạm dừng'}],
    achievements:[],dropRates:{baseChestDropChance:0,scoreThresholdForDrop:1000,chestWeights:[]},component:RainbowBlocksGame,
  },
  'word-cross': {
    id: 'word-cross',
    title: 'Word Cross',
    shortDesc: '200 màn tìm từ, 5 chế độ và kho từ offline phong phú',
    description: 'Tìm từ tiếng Anh theo hàng, cột và đường chéo. 200 màn với bảng 6×6 đến 12×12, 5 chế độ và 117.597 dạng từ offline. Mỗi ván chiến dịch chọn từ và bố cục mới; tiếp tục ván giữ nguyên bảng. Nhận 1–3 sao theo độ chính xác, thời gian và hint. Thử thách ngày dùng chung đề; bảng thành tích kiểm tra lời giải trên máy chủ.',
    category: 'Arcade',
    difficulty: 'Trung Bình',
    icon: '🔠',
    bannerGradient: 'from-fuchsia-900/60 via-purple-950/80 to-slate-900',
    themeColor: '#d946ef',
    tags: ['Word Cross', 'Tìm Chữ', 'Daily Puzzle', 'Từ Vựng', 'Giải Đố', 'Vocabulary'],
    controls: WORD_CROSS_CONTROLS,
    achievements: WORD_CROSS_ACHIEVEMENTS,
    dropRates: WORD_CROSS_DROP_RATES,
    component: WordCrossGame,
  },
  'car-escape': {
    id: 'car-escape',
    title: 'Car Escape',
    shortDesc: 'Giải đố kẹt xe đỉnh cao, di chuyển xe để mở đường cho xe cứu thương thoát hiểm.',
    description: 'Giải cứu xe vàng trên bãi xe 2D. 100 màn được kiểm chứng cần 5–26 lượt tối ưu; bàn 6×6, 7×7 và 8×8. Chơi tự do, giới hạn lượt, đếm ngược hoặc đường dài. Thu thập 3 sao khi giải hiệu quả không dùng hint, và thi tài theo từng màn.',
    category: 'Puzzle',
    difficulty: 'Thử Thách',
    icon: '🚑',
    bannerGradient: 'from-red-900/60 via-orange-950/80 to-slate-900',
    themeColor: '#ef4444',
    tags: ['Giải Đố', 'Kẹt Xe', 'Car Escape', 'Puzzle', 'Logic'],
    controls: CAR_ESCAPE_CONTROLS,
    achievements: CAR_ESCAPE_ACHIEVEMENTS,
    dropRates: CAR_ESCAPE_DROP_RATES,
    component: CarEscapeGame,
  },
  'dungeon-tap': {
    id: 'dungeon-tap',
    title: 'Dungeon Titan',
    shortDesc: 'Nhập vai RPG chém boss khổng lồ, săn đồ & chiêu mộ đồng đội',
    description: 'Game nhập vai Tap Titans đỉnh cao! Chạm liên tục tiêu diệt Titan khổng lồ, cốt truyện tuyến tính qua nhiều chương hồi, cứ 10 level đấu Boss 30 giây nghẹt thở, quái vật rơi đồ ngẫu nhiên, màn hình trang bị 5 món, nâng cấp Kiếm Sĩ và kích hoạt 4 tuyệt kỹ tối thượng: Thiên Kiếm, Cuồng Nộ, Bàn Tay Vàng và Phân Thân!',
    category: 'Action',
    difficulty: 'Thử Thách',
    icon: '⚔️',
    bannerGradient: 'from-amber-900/60 via-orange-950/80 to-slate-900',
    themeColor: '#f59e0b',
    tags: ['Tap Titans', 'Dungeon Tap', 'Loot Đồ', 'Trang Bị', 'Boss Rush', 'RPG'],
    controls: DUNGEON_TAP_CONTROLS,
    achievements: DUNGEON_TAP_ACHIEVEMENTS,
    dropRates: DUNGEON_TAP_DROP_RATES,
    component: DungeonTapGame,
  },
  'mummy-escape': {
    id: 'mummy-escape',
    title: 'Mummy Escape',
    shortDesc: 'Game giải đố chiến thuật vượt ngục Kim Tự Tháp Pharaoh kinh điển theo lượt',
    description: 'Game giải đố chiến thuật Turn-based Mummy Maze kinh điển! Điều khiển nhà thám hiểm di chuyển từng bước để tìm đường đến cầu thang thoát hiểm. Mỗi khi bạn đi 1 bước, các xác ướp sẽ di chuyển 2 bước để truy đuổi. Tận dụng tường đá, ngõ cụt, chìa khóa mở cổng và bẫy hố sâu để lừa xác ướp!',
    category: 'Puzzle',
    difficulty: 'Trung Bình',
    icon: '🧟‍♂️',
    bannerGradient: 'from-amber-950/90 via-[#2e1d0f] to-stone-950',
    themeColor: '#f59e0b',
    tags: ['Mummy Escape', 'Mummy Maze', 'Giải Đố', 'Xác Ướp', 'Kim Tự Tháp', 'Turn-based', 'Pharaoh', 'Puzzle'],
    controls: MUMMY_ESCAPE_CONTROLS,
    achievements: MUMMY_ESCAPE_ACHIEVEMENTS,
    dropRates: MUMMY_ESCAPE_DROP_RATES,
    component: MummyEscapeGame,
  },
  'shikaku': {
    id: 'shikaku',
    title: 'Shikaku',
    shortDesc: 'Vẽ các hình chữ nhật để lấp đầy bảng theo số ô cho sẵn',
    description: 'Game giải đố không gian Shikaku! Dùng tay vẽ các hình chữ nhật trên grid sao cho mỗi hình chứa đúng 1 số, và diện tích (số ô) của hình chữ nhật đó phải bằng đúng số đã cho. Lấp đầy toàn bộ bảng để chiến thắng! Chơi thư giãn hoặc thử thách 3 phút, chọn bảng 4×4 đến 8×8. Kéo thả trực tiếp, hoàn tác và gợi ý miễn phí.',
    category: 'Puzzle',
    difficulty: 'Trung Bình',
    icon: '🟥',
    bannerGradient: 'from-blue-900/80 via-indigo-900 to-slate-950',
    themeColor: '#3b82f6',
    tags: ['Shikaku', 'Giải Đố', 'Không Gian', 'Grid', 'Draw a Square'],
    controls: SHIKAKU_CONTROLS,
    achievements: SHIKAKU_ACHIEVEMENTS,
    dropRates: SHIKAKU_DROP_RATES,
    component: ShikakuGame,
  },
  'eat-em-all': {
    id: 'eat-em-all',
    title: "Eat 'Em All - Nuốt Chửng Nguyên Tố",
    shortDesc: 'Điều khiển nhân vật hứng nuốt các item rơi, chuyển đổi Băng/Lửa và bão cuồng nộ Fury x10',
    description: 'Game Arcade phản xạ đỉnh cao theo phong cách Catch-the-Falling-Element! Điều khiển nhân vật di chuyển hứng nuốt các quả cầu nguyên tố rơi xuống từ trên cao. Linh hoạt chuyển đổi trạng thái BĂNG (❄) và LỬA (🔥) để ăn đúng hệ, né tránh bom tử thần và bình độc.',
    category: 'Arcade',
    difficulty: 'Trung Bình',
    icon: '😋',
    bannerGradient: 'from-cyan-900/70 via-indigo-950/80 to-orange-950/70',
    themeColor: '#06b6d4',
    tags: ['Eat em All', 'Arcade', 'Phản Xạ', 'Elemental Fury', 'Băng Lửa', 'Target Mode', 'Endless'],
    controls: EAT_EM_ALL_CONTROLS,
    achievements: EAT_EM_ALL_ACHIEVEMENTS,
    dropRates: EAT_EM_ALL_DROP_RATES,
    component: EatEmAllGame,
  },
  'scoodoku': {
    id: 'scoodoku',
    title: 'Scoodoku',
    shortDesc: 'Game Sudoku đa cấp độ từ ô vuông 3x3 đến ma trận IQ 180 bậc thang',
    description: 'Game giải đố Sudoku đỉnh cao đa cấp độ! Trải nghiệm từ bảng Mini 4x4, 6x6, Cổ Điển 9x9, Ma Trận Bậc Thang IQ 180 đến Song Trận Giao Thoa.',
    category: 'Puzzle',
    difficulty: 'Trung Bình',
    icon: '🔢',
    bannerGradient: 'from-amber-900/80 via-[#331c10] to-stone-950',
    themeColor: '#f59e0b',
    tags: ['Sudoku', 'Scoodoku', 'IQ 180', 'Giải Đố', 'Ma Trận Số', 'Trí Tuệ', 'Puzzle'],
    controls: SCOODOKU_CONTROLS,
    achievements: SCOODOKU_ACHIEVEMENTS,
    dropRates: SCOODOKU_DROP_RATES,
    component: ScoodokuGame,
  },
  'fill-the-space': {
    id: 'fill-the-space',
    title: 'Lấp Đầy Khoảng Trống',
    shortDesc: 'Xếp các khối gỗ 3D lấp đầy khuôn rỗng chạm khắc trên mặt bàn',
    description: 'Game giải đố xếp gỗ 3D phong cách Block Crush! Kéo thả và lắp ghép các khối gạch gỗ chuẩn bị sẵn để lấp đầy khuôn rỗng được chạm khắc trên mặt bàn.',
    category: 'Puzzle',
    difficulty: 'Trung Bình',
    icon: '🪵',
    bannerGradient: 'from-amber-900/80 via-[#3a2215] to-stone-950',
    themeColor: '#d97706',
    tags: ['Giải Đố', 'Fill The Space', 'Xếp Gỗ', 'Wood Puzzle', 'Polyomino', 'Trí Tuệ'],
    controls: FILL_THE_SPACE_CONTROLS,
    achievements: FILL_THE_SPACE_ACHIEVEMENTS,
    dropRates: FILL_THE_SPACE_DROP_RATES,
    component: FillTheSpaceGame,
  },
  'draw-a-shape': DrawAShapeMeta,
  'blocker': {
    id: 'blocker',
    title: 'Xếp Gạch',
    shortDesc: 'Chơi tự do hoặc khám phá 100 màn sắc màu',
    description: 'Xếp Gạch Color Pop: tự do không đồng hồ hoặc hành trình 100 màn qua 10 vùng đất. Xoay và gợi ý miễn phí, combo rực rỡ, thu sao, phá băng và dùng xu trong game để mua booster.',
    category: 'Puzzle',
    difficulty: 'Dễ',
    icon: '🧱',
    bannerGradient: 'from-blue-900/60 via-purple-950/80 to-slate-900',
    themeColor: '#3b82f6',
    tags: ['Giải Đố', 'Xếp Hình', 'Block Puzzle', 'Combo', 'Trí Tuệ'],
    controls: BLOCKER_CONTROLS,
    achievements: BLOCKER_ACHIEVEMENTS,
    dropRates: BLOCKER_DROP_RATES,
    component: BlockerGame,
  },

  'chess': {
    id: 'chess',
    title: 'Cờ Vua Quốc Tế',
    shortDesc: 'Đấu trí Cờ Vua đỉnh cao, ghép trận PvP thời gian thực, chế độ AI Đại Kiện Tướng và xếp hạng ELO',
    description: 'Chế độ Cờ Vua Quốc Tế chuẩn luật FIDE! Tích hợp luật nhập thành, phong cấp, bắt tốt qua đường, chống đi vào ô chiếu, tìm trận ngẫu nhiên, tạo phòng 6 số và bảng xếp hạng ELO.',
    category: 'Multiplayer',
    difficulty: 'Thử Thách',
    icon: '♟️',
    bannerGradient: 'from-amber-900/80 via-slate-900 to-zinc-950',
    themeColor: '#d97706',
    tags: ['Cờ Vua', 'Chess', 'PvP Online', 'Multiplayer Real-time', 'Xếp Hạng ELO', 'Phòng Riêng 6 Số'],
    controls: CHESS_CONTROLS,
    achievements: CHESS_ACHIEVEMENTS,
    dropRates: CHESS_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: ChessGame,
  },
  'xiangqi': {
    id: 'xiangqi',
    title: 'Cờ Tướng Online',
    shortDesc: 'Đấu trí Cờ Tướng đối kháng trực tuyến thời gian thực, xếp hạng ELO và tạo phòng 6 số',
    description: 'Chế độ Cờ Tướng kinh điển kết nối 2 kỳ thủ trực tuyến! Hệ thống kiểm tra nước đi hợp lệ chuẩn mực (Tướng, Sĩ, Tượng, Xe, Pháo, Mã, Tốt), chống lộ mặt Tướng, phòng thi đấu 6 số, đồng bộ thời gian thực và xếp hạng ELO quốc tế.',
    category: 'Multiplayer',
    difficulty: 'Thử Thách',
    icon: '🎴',
    bannerGradient: 'from-amber-950/80 via-[#221510] to-slate-950',
    themeColor: '#f59e0b',
    tags: ['Cờ Tướng', 'Xiangqi', 'PvP Online', 'Multiplayer Real-time', 'Xếp Hạng ELO', 'Phòng Riêng 6 Số'],
    controls: XIANGQI_CONTROLS,
    achievements: XIANGQI_ACHIEVEMENTS,
    dropRates: XIANGQI_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: XiangqiGame,
  },
  'caro-gomoku': {
    id: 'caro-gomoku',
    title: 'Cờ Caro Gomoku Online',
    shortDesc: 'Đấu trí 15x15 nhiều người chơi, ghép trận PvP thời gian thực và xếp hạng ELO',
    description: 'Chế độ cờ Caro / Gomoku 15x15 đỉnh cao! Hỗ trợ ghép trận nhanh ngẫu nhiên, tạo phòng riêng có mã mời 6 số, đồng bộ nước đi theo thời gian thực và tính điểm ELO.',
    category: 'Multiplayer',
    difficulty: 'Thử Thách',
    icon: '🎯',
    bannerGradient: 'from-indigo-900/70 via-purple-950/80 to-slate-900',
    themeColor: '#6366f1',
    tags: ['Cờ Caro', 'Gomoku', 'PvP Online', 'Multiplayer Real-time', 'Xếp Hạng ELO', 'Phòng Riêng 6 Số'],
    controls: CARO_GOMOKU_CONTROLS,
    achievements: CARO_GOMOKU_ACHIEVEMENTS,
    dropRates: CARO_GOMOKU_DROP_RATES,
    multiplayer: true,
    supportsAI: true,
    component: CaroGomokuGame,
  },
  'neon-runner': {
    id: 'neon-runner',
    title: 'Neon Runner 2099',
    shortDesc: 'Game chạy vô tận Cyberpunk tốc độ cao né bẫy nhặt ngọc',
    description: 'Chạy qua đô thị tương lai rực rỡ ánh đèn neon, thực hiện nhảy kép, trượt né chướng ngại vật và kích hoạt khiên chắn lượng tử.',
    category: 'Arcade',
    difficulty: 'Trung Bình',
    icon: '🏃',
    bannerGradient: 'from-cyan-900/60 via-blue-950/80 to-slate-900',
    themeColor: '#06b6d4',
    tags: ['Cyberpunk', 'Endless Runner', 'Phản Xạ', 'Nhảy Kép'],
    controls: NEON_RUNNER_CONTROLS,
    achievements: NEON_RUNNER_ACHIEVEMENTS,
    dropRates: NEON_RUNNER_DROP_RATES,
    component: NeonRunnerGame,
  },
  'cosmic-defense': {
    id: 'cosmic-defense',
    title: 'Cosmic Defend',
    shortDesc: '100 nhiệm vụ pixel, 10 hành tinh và 10 boss',
    description: 'Lái Aegis Nova qua 100 nhiệm vụ trên 10 hành tinh. Tự bắn, né đạn, thu thập 10 item, nâng cấp Hangar và chinh phục 10 boss với đồ họa pixel gốc.',
    category: 'Action',
    difficulty: 'Thử Thách',
    icon: '🚀',
    bannerGradient: 'from-purple-900/60 via-indigo-950/80 to-slate-900',
    themeColor: '#8b5cf6',
    tags: ['Space Shooter', 'Bắn Súng', 'Đạn Chùm', 'Boss Fight'],
    controls: COSMIC_DEFENSE_CONTROLS,
    achievements: COSMIC_DEFENSE_ACHIEVEMENTS,
    dropRates: COSMIC_DEFENSE_DROP_RATES,
    component: CosmicDefenseGame,
  },
  'cyber-slice': {
    id: 'cyber-slice',
    title: 'Cyber Blade Slice',
    shortDesc: 'Chém quả cầu năng lượng tốc độ cao tránh bom tử thần',
    description: 'Lướt ngón tay tạo ra đường kiếm ánh sáng chém nát các quả cầu năng lượng và đá quý, kích hoạt trạng thái Fever Mode bùng nổ điểm số.',
    category: 'Reflex',
    difficulty: 'Dễ',
    icon: '🗡️',
    bannerGradient: 'from-rose-900/60 via-pink-950/80 to-slate-900',
    themeColor: '#f43f5e',
    tags: ['Chém Hoa Quả', 'Cảm Ứng', 'Fever Mode', 'Combo'],
    controls: CYBER_SLICE_CONTROLS,
    achievements: CYBER_SLICE_ACHIEVEMENTS,
    dropRates: CYBER_SLICE_DROP_RATES,
    component: CyberSliceGame,
  },
  'hex-match': {
    id: 'hex-match',
    title: BLOSSOM_TITLE,
    shortDesc: 'Chạm hoa, giải cứu khu vườn qua 100 màn',
    description: 'Chạm nhóm từ 3 hoa kề ngang hoặc dọc, ghép Ong Mật, Bom Hoa, Cầu Vồng và Mặt Trời để đánh thức Cây Sự Sống.',
    category: 'Puzzle',
    difficulty: 'Dễ',
    icon: '🌸',
    bannerGradient: 'from-emerald-900/60 via-teal-950/80 to-slate-900',
    themeColor: '#10b981',
    tags: ['Giải Đố', 'Xếp Hình', 'Combo Nổ', 'Trí Tuệ'],
    controls: HEX_MATCH_CONTROLS,
    achievements: HEX_MATCH_ACHIEVEMENTS,
    dropRates: HEX_MATCH_DROP_RATES,
    component: HexMatchGame,
  },
  'tile-2048': {
    id: 'tile-2048',
    title: 'Xếp Gạch 2048',
    shortDesc: 'Vuốt ghép các ô số, chinh phục mốc 2048',
    description: 'Vuốt các ô số để ghép thành 2048! Kết hợp những ô giống nhau, giữ ô lớn nhất ở một góc và thử phá kỷ lục điểm số của bạn.',
    category: 'Puzzle',
    difficulty: 'Trung Bình',
    icon: '🔢',
    bannerGradient: 'from-amber-900/60 via-yellow-950/80 to-slate-900',
    themeColor: '#f59e0b',
    tags: ['2048', 'Xếp Gạch', 'Ghép Số', 'Giải Đố', 'Vuốt Chạm'],
    controls: TILE_2048_CONTROLS,
    achievements: TILE_2048_ACHIEVEMENTS,
    dropRates: TILE_2048_DROP_RATES,
    component: Tile2048Game,
  },
};

export const ALL_GAMES_LIST = Object.values(GAME_REGISTRY);

// 5 new & featured highlight games for the top slider
export const FEATURED_SLIDER_GAME_IDS = [
  'rainbow-blocks',
  'hex-match',
  'word-cross',   // Newest release with Daily Puzzle & Vocab
  'car-escape',   // Hot 100-level parking puzzle
  'dungeon-tap',  // RPG Tap Titans Boss Rush
  'mummy-escape', // Turn-based pyramid tactical puzzle
  'tile-2048',    // Jewel-dropping 2048 puzzle
];

