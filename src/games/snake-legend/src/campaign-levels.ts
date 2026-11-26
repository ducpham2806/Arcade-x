import type { Arena, V } from './core';
import type { Food, Story } from './story-data';

type Pair = [x: number, y: number];
type Layout = Omit<Arena, 'id' | 'heading' | 'route' | 'walls' | 'water' | 'spikes' | 'story'>
  & Partial<Pick<Arena, 'walls' | 'water' | 'spikes'>>
  & {story: Omit<Story, 'id' | 'order'>};

const point = (x: number, y: number): V => ({x, y});
const route = (...pairs: Pair[]) => pairs.map(([x, y]) => point(x, y));
const food = (kind: Food['kind'], ...pairs: Pair[]): Food[] =>
  pairs.map(([x, y], index) => ({id: `${kind}-${index}`, kind, x, y}));
const timeStar = (seconds: number): Story['star3'] =>
  ({kind: 'time', value: seconds, label: `Về đích trong ${seconds} giây`});
const trapStar: Story['star3'] = {kind: 'trap', value: 1, label: 'Dụ ít nhất 1 nhện vào tơ'};

function level(chapter: 2 | 3, order: number, layout: Layout): Arena {
  return {
    id: 19 + (chapter - 2) * 5 + order, heading: 0, route: [], walls: [], water: [], spikes: [],
    ...layout,
    story: {...layout.story, id: `${chapter}-${order + 1}`, order},
  };
}

function riverBands(height: number, ...crossings: [x: number, width: number, y: number, bridgeWidth: number][]) {
  const bridges = crossings.map(([x, w, y, h], index) => ({id: `bridge-${index + 1}`, x, y, w, h}));
  const water = bridges.flatMap(({x, y, w, h}) => [
    {x, y: 0, w, h: y},
    {x, y: y + h, w, h: height - y - h},
  ]);
  return {bridges, water};
}

const amberBridges = riverBands(46, [17, 8, 30, 3.8], [42, 9, 10.5, 3.2]);

export const AMBER_LEVELS: Arena[] = [
  level(2, 0, {
    name: 'Bến Quả Hổ Phách', subtitle: 'Thu 6 quả · tìm cổng qua bến phía bắc',
    w: 54, h: 38, length: 6, start: point(8, 31),
    walls: [{x: 19, y: 16, w: 12, h: 7}, {x: 10, y: 19, w: 3, h: 4}],
    story: {
      goal: 'eat', target: 6, exit: point(15, 11),
      foods: [...food('apple', [15,31], [25,30], [36,30], [43,26], [46,19], [45,12]), ...food('gold', [35,22])],
      guide: route([8,31], [15,31], [25,30], [36,30], [43,26], [46,19], [45,12], [39,7], [30,7], [22,10], [15,11]),
      parSeconds: 45, star3: timeStar(45),
      intro: 'Lão Quy: Nước hạ ở bến phía bắc. Đi vòng bãi quả để tìm lối dẫn vào vùng suối.',
      lesson: 'Thu đủ 6 quả rồi về cổng. Nhánh quả vàng nằm trong bãi cỏ giữa bến.',
      beats: [
        {x: 15, y: 31, r: 3, text: 'Đường bờ rộng đủ để giữ Dash rồi nhả trước khúc cua.'},
        {x: 36, y: 30, r: 4, text: 'Có quả vàng trong bãi cỏ bên trái. Lối vòng ngoài tiếp tục tới cổng.'},
      ],
    },
  }),
  level(2, 1, {
    name: 'Lối Đầm Hai Nhịp', subtitle: 'Qua 2 cầu lệch hướng · nghỉ trên cồn giữa',
    w: 64, h: 46, length: 9, start: point(7, 31.9), water: amberBridges.water,
    walls: [{x: 28, y: 16, w: 2, h: 9}, {x: 54, y: 22, w: 4, h: 7}],
    story: {
      goal: 'pass', target: 2, bridges: amberBridges.bridges, exit: point(59, 34),
      foods: food('apple', [12,31.9], [21,31.9], [31,31.9], [36,24], [37,12.1], [46,12.1], [58,16], [60,30]),
      guide: route([7,31.9], [13,31.9], [31,31.9], [36,26], [36,16], [37,12.1], [40,12.1], [55,12.1], [60,16], [61,29], [59,34]),
      parSeconds: 65, star3: {kind: 'clean', value: 0, label: 'Qua suối mà không chạm thân'},
      intro: 'Lão Quy: Cầu đầu nằm ngay trước mũi. Trên cồn giữa, rẽ lên bờ bắc để tìm cầu thứ hai.',
      lesson: 'Lấy đà thẳng theo ván cầu. Đi hết bờ bên kia rồi mới rẽ.',
      beats: [
        {x: 13, y: 31.9, r: 3, text: 'Cầu đầu rộng 3,8 u. Giữ hướng tới quả táo bên kia.'},
        {x: 31, y: 31.9, r: 3, text: 'Đã tới cồn. Vòng qua hàng sậy, sang cầu thứ hai ở phía trên.'},
        {x: 55, y: 12.1, r: 3, text: 'Hai cầu đã qua. Rẽ xuống bãi rộng để tới cổng.'},
      ],
    },
  }),
  level(2, 2, {
    name: 'Vườn Sậy Ven Nước', subtitle: 'Hái 7 hoa · lần lượt quanh hai đầm cạn',
    w: 62, h: 50, length: 7, start: point(8, 42),
    water: [{x: 20, y: 8, w: 12, h: 9}, {x: 37, y: 27, w: 13, h: 10}],
    walls: [{x: 30, y: 31, w: 3, h: 5}, {x: 46, y: 9, w: 3, h: 3}],
    story: {
      goal: 'collect', target: 7, exit: point(11, 7),
      foods: [...food('flower', [16,42], [39,43], [55,42], [53,18], [37,20], [28,24], [18,22], [7,29]), ...food('apple', [26,42], [55,30], [43,14])],
      guide: route([8,42], [16,42], [27,42], [39,43], [55,42], [55,30], [53,18], [43,14], [37,20], [28,24], [18,22], [12,12], [11,7]),
      parSeconds: 85, star3: timeStar(65),
      intro: 'Lão Quy: Hoa sậy mọc dọc mép đầm. Theo bờ ngoài trước rồi vòng vào dải đất giữa hai đầm.',
      lesson: 'Chỉ hoa tính vào mục tiêu. Giữ khoảng cách với mép nước khi lượn.',
      beats: [
        {x: 16, y: 42, r: 3, text: 'Hoa vàng bên bờ là mục tiêu. Táo chỉ tăng chiều dài.'},
        {x: 53, y: 18, r: 3, text: 'Qua hết đầm rồi vòng vào bãi cỏ giữa để hái lượt hoa cuối.'},
      ],
    },
  }),
  level(2, 3, {
    name: 'Cửa Xả Cũ', subtitle: 'Chốt công tắc phía đông · quay về buồng cửa xả',
    w: 70, h: 50, length: 8, start: point(9, 42),
    walls: [
      {x: 25, y: 16, w: 30, h: 14},
      {x: 6, y: 4, w: 2, h: 17}, {x: 18, y: 4, w: 2, h: 17},
      {x: 8, y: 4, w: 10, h: 2}, {x: 8, y: 19, w: 3, h: 2}, {x: 14, y: 19, w: 4, h: 2},
    ],
    story: {
      goal: 'puzzle', target: 1, exit: point(12.5, 9), switch: point(61, 11), gate: {x:11, y:19, w:3, h:2},
      foods: food('apple', [22,42], [45,42], [62,35], [63,24], [61,11], [43,10], [21,13], [22,25]),
      guide: route([9,42], [22,42], [45,42], [61,38], [63,25], [61,11], [49,9], [34,10], [22,12], [22,24], [17,26], [12.5,25], [12.5,18], [12.5,9]),
      parSeconds: 80, star3: {kind: 'clean', value: 0, label: 'Mở cửa mà không chạm thân'},
      intro: 'Lão Quy: Công tắc phía đông còn hoạt động. Đường nước cũ dẫn vòng quanh đập về cửa xả.',
      lesson: 'Chạm công tắc để giữ cửa mở, sau đó đi vào cửa từ bãi phía dưới.',
      beats: [
        {x: 45, y: 42, r: 4, text: 'Bờ dưới rộng để lấy đà. Công tắc nằm sau góc đông.'},
        {x: 61, y: 11, r: 3, text: 'Cửa đã chốt mở. Đi vòng phía trên đập rồi căn vào lối hẹp.'},
        {x: 12.5, y: 25, r: 2.5, text: 'Đi thẳng qua khe cửa trước mặt.'},
      ],
    },
  }),
  level(2, 4, {
    name: 'Bãi Tơ Hổ Phách', subtitle: 'Đạt 18 đốt · dùng tơ để thoát nhện',
    w: 72, h: 50, length: 9, start: point(8, 40),
    walls: [{x: 26, y: 18, w: 7, h: 9}, {x: 42, y: 19, w: 5, h: 10}],
    story: {
      goal: 'length', target: 18, exit: point(12, 24),
      foods: food('apple', [16,40], [23,40], [29,40], [36,40], [43,40], [53,39], [61,38], [63,27], [62,14], [49,10], [37,10], [24,10], [13,15]),
      guide: route([8,40], [16,40], [29,40], [43,40], [61,38], [63,27], [62,14], [49,10], [37,10], [24,10], [13,15], [12,24]),
      encounter: {
        webs: [{id: 'web-bank', x: 18, y: 37.2, r: 1.65}, {id: 'web-willow', x: 59, y: 35, r: 1.75}],
        spiders: [{id: 'spider-bank', x: 16, y: 34}, {id: 'spider-willow', x: 54, y: 29, afterTrap: true}],
      },
      parSeconds: 90, star3: trapStar,
      intro: 'Lão Quy: Đây là bãi nhện canh lối lên đền. Bờ dưới rộng để dụ nhện qua tơ, bờ bắc dẫn tới cổng.',
      lesson: 'Chờ nhện báo hiệu rồi lái dọc bờ cỏ. Nếu bị bám, dùng đoạn thẳng để tạo khoảng cách.',
      beats: [
        {x: 12, y: 40, r: 3, text: 'Nhện bên trái bắt đầu báo động. Men dưới đám tơ để dẫn nó theo.'},
        {x: 53, y: 39, r: 3, text: 'Giữ trống khoảng sân phía đông để đổi hướng khi nhện thứ hai đuổi tới.'},
      ],
    },
  }),
];

const dawnBridges = riverBands(62, [19, 7, 46.6, 3], [42, 9, 14.5, 2.8], [68, 7, 38.8, 2.4]);
const dawnRain: Food[] = [
  ...route([14,30], [22,30], [29,30], [36,28], [43,24], [43,17], [40,10], [34,8]),
  ...route([27,8], [20,9], [13,12], [8,17], [8,24], [14,30], [22,32], [30,32]),
  ...route([38,30], [44,23], [43,14], [34,8], [25,8], [16,10], [11,16], [9,24]),
].map((p, index) => ({...p, id: `rain-${index}`, kind: 'gold', readyAt: 1 + index * 1.7}));

export const DAWN_LEVELS: Arena[] = [
  level(3, 0, {
    name: 'Sân Trụ Nắng', subtitle: 'Đạt 17 đốt · chọn lối an toàn ngoài sân trụ',
    w: 60, h: 44, length: 9, start: point(8, 35),
    walls: [{x: 16, y: 16, w: 3, h: 7}, {x: 26, y: 17, w: 3, h: 5}, {x: 40, y: 16, w: 3, h: 5}],
    story: {
      goal: 'length', target: 17, exit: point(12, 27),
      foods: [
        ...food('apple', [17,35], [30,35], [44,35], [51,28], [51,17], [43,10], [33,10], [24,10], [15,13], [12,22]),
        ...food('gold', [34,27], [40,26]), ...food('poison', [31,25], [36,24], [42,26]),
      ],
      guide: route([8,35], [17,35], [30,35], [44,35], [51,28], [51,17], [43,10], [33,10], [24,10], [15,13], [12,22], [12,27]),
      parSeconds: 65, star3: {kind: 'noPoison', value: 0, label: 'Không ăn quả độc'},
      intro: 'Lão Quy: Táo chín ở lối ngoài. Quả vàng nằm giữa các trụ đá và quả độc.',
      lesson: 'Đủ 17 đốt thì về cổng. Bờ ngoài có đủ táo để đi vòng an toàn.',
      beats: [
        {x: 30, y: 35, r: 4, text: 'Rẽ vào giữa để tìm quả vàng, hoặc đi vòng ngoài theo dải táo.'},
        {x: 51, y: 17, r: 4, text: 'Khúc cua quanh trụ thoáng hơn nếu nhả Dash trước.'},
      ],
    },
  }),
  level(3, 1, {
    name: 'Cầu Ba Vệt Sáng', subtitle: 'Qua 3 cầu · đổi hướng trên từng cồn đá',
    w: 88, h: 62, length: 12, start: point(8, 48.1), water: dawnBridges.water,
    walls: [{x: 28, y: 24, w: 2, h: 11}, {x: 64, y: 15, w: 2, h: 12}, {x: 77, y: 21, w: 3, h: 8}],
    story: {
      goal: 'pass', target: 3, bridges: dawnBridges.bridges, exit: point(81, 14),
      foods: food('apple', [16,48.1], [23,48.1], [31,48.1], [34,33], [40,15.9], [46,15.9], [55,15.9], [60,29], [66,40], [71,40], [79,40]),
      guide: route([8,48.1], [16,48.1], [31,48.1], [34,44], [34,24], [35,18], [37,15.9], [40,15.9], [55,15.9], [59,21], [60,34], [62,40], [66,40], [79,40], [83,37], [83,27], [81,14]),
      parSeconds: 95, star3: {kind:'clean', value: 0, label: 'Qua ba cầu mà không chạm thân'},
      intro: 'Lão Quy: Ba chiếc cầu đổi hướng theo bậc đá. Đoạn cuối hẹp nhất; hãy dành chỗ để căn đầu trên cồn.',
      lesson: 'Từ mỗi cồn, lái song song với ván rồi mới qua nước. Dùng đảo làm chỗ quay.',
      beats: [
        {x: 31, y: 48.1, r: 3, text: 'Đã qua cầu nam. Lên đầu cồn rồi căn sang cầu bắc.'},
        {x: 55, y: 15.9, r: 3, text: 'Cầu thứ ba rộng 2,4 u. Căn đầu trên bãi cỏ bên này.'},
        {x: 66, y: 40, r: 2, text: 'Giữ thẳng thêm một nhịp tới bờ bên kia.'},
      ],
    },
  }),
  level(3, 2, {
    name: 'Vườn Hoa Bình Minh', subtitle: 'Chơi đủ 45 giây · tìm ngọc trên bờ phía bắc',
    w: 51, h: 39, length: 6, start: point(8, 30),
    walls: [{x: 18, y: 16, w: 6, h: 7}, {x: 31, y: 17, w: 6, h: 7}],
    story: {
      goal: 'timed_collect', target: 1, durationSeconds: 45, exit: point(42, 8),
      foods: [...dawnRain, ...food('jade', [39,7])],
      guide: route([8,30], [15,30], [34,30], [43,24], [43,13], [39,7], [31,7], [20,8], [10,13], [7,22], [12,30], [23,32], [37,31], [44,24], [44,15], [36,9], [22,9], [12,14], [9,23], [16,30]),
      parSeconds: 45, star3: {kind:'secret', value:1, label:'Tìm mảnh ngọc Bình Minh'},
      intro: 'Lão Quy: Nghỉ một vòng quanh vườn trong mưa quả. Tìm ánh ngọc ở bờ bắc trước khi nắng lên.',
      lesson: 'Tiếp tục di chuyển đủ 45 giây. Bóng dưới đất báo quả sắp rơi.',
      beats: [
        {x: 15, y: 30, r: 4, text: 'Quả xuất hiện theo từng đợt quanh bờ vườn.'},
        {x: 43, y: 13, r: 4, text: 'Ánh xanh sau lối bắc là một mảnh ngọc bí mật.'},
      ],
    },
  }),
  level(3, 3, {
    name: 'Cổng Ba Phiến Đá', subtitle: 'Chốt công tắc sau ba trụ · dẫn nhện ra khỏi lối về',
    w: 78, h: 56, length: 11, start: point(8, 46),
    walls: [
      {x: 22, y: 27, w: 4, h: 9}, {x: 36, y: 17, w: 5, h: 17}, {x: 53, y: 21, w: 4, h: 14},
      {x: 8, y: 11, w: 2, h: 14}, {x: 10, y: 11, w: 10, h: 2}, {x: 10, y: 23, w: 10, h: 2},
      {x: 20, y: 11, w: 2, h: 5}, {x: 20, y: 20, w: 2, h: 5},
    ],
    story: {
      goal: 'puzzle', target: 1, exit: point(15, 18), switch: point(66, 10), gate: {x:20, y:16, w:2, h:4},
      foods: food('apple', [18,46], [31,46], [47,45], [63,43], [68,29], [66,10], [50,9], [33,11]),
      guide: route([8,46], [18,46], [31,46], [47,45], [63,43], [68,35], [68,24], [66,10], [50,9], [38,10], [33,11], [29,18], [24,18], [15,18]),
      encounter: {
        webs: [{id:'web-stone', x:21, y:42.7, r:1.75}],
        spiders: [{id:'spider-stone', x:19, y:39}],
      },
      parSeconds: 95, star3: trapStar,
      intro: 'Lão Quy: Nhện canh lối dưới chân ba trụ. Dụ nó qua tơ trước khi tìm công tắc phía đông.',
      lesson: 'Chốt công tắc rồi vòng theo mép trên, vào cổng từ phía đông của buồng đá.',
      beats: [
        {x: 15, y: 46, r: 4, text: 'Giữ về bờ dưới để nhện băng qua tơ.'},
        {x: 66, y: 10, r: 3, text: 'Công tắc đã chốt. Quay về cổng theo lối trên các trụ.'},
        {x: 28, y: 18, r: 3, text: 'Lối vào nằm thẳng trước mặt, giữa hai phiến đá.'},
      ],
    },
  }),
  level(3, 4, {
    name: 'Nhện Mẹ Canh Đền', subtitle: 'Húc 6 lần qua 3 pha · mở cổng đền',
    w: 66, h: 56, length: 16, start: point(19, 39),
    walls: [
      {x: 8, y: 12, w: 5, h: 8}, {x: 51, y: 12, w: 4, h: 8},
      {x: 8, y: 33, w: 3, h: 11}, {x: 52, y: 34, w: 4, h: 11},
    ],
    story: {
      goal: 'boss', target: 6, exit: point(32, 12),
      foods: food('apple', [18,39], [24,41], [32,41], [40,41], [46,37], [46,27], [44,17], [36,15], [27,15], [18,19], [16,27], [19,33])
        .map(apple => ({...apple, respawnSeconds: 2})),
      guide: route([19,39], [24,41], [40,41], [46,37], [46,27], [44,17], [36,15], [27,15], [18,19], [16,27], [19,33], [19,39]),
      encounter: {
        webs: [{id:'web-west', x:24, y:35, r:1.6}, {id:'web-east', x:40, y:35, r:1.6}],
        spiders: [],
        boss: {center: point(31.5,31), weak: point(31.5,34), posts: [point(28,33), point(35,33)]},
      },
      parSeconds: 160, star3: timeStar(145),
      intro: 'Lão Quy: Nhện Mẹ chắn cửa đền. Vòng táo ngoài các trụ là chỗ đổi hướng và bù chiều dài.',
      lesson: 'Né tơ, dụ nhện con rồi nối hai cột bằng thân. Giữ Dash khi vòng ngọc mở.',
      beats: [
        {x: 24, y: 41, r: 3, text: 'Dùng vòng táo phía nam để giữ đà và né hướng bắn.'},
        {x: 44, y: 17, r: 3, text: 'Lối vòng phía đông lên cổng bắc. Cổng mở sau khi hạ Nhện Mẹ.'},
      ],
    },
  }),
];
