export interface MobileGestureGuide {
  icon: string;
  gesture: string;
  action: string;
  badge?: string;
}

export interface GestureOverlayZone {
  id: string;
  name: string;
  action: string;
  subAction?: string;
  colorTheme: 'cyan' | 'rose' | 'amber' | 'indigo' | 'emerald' | 'purple';
  position: {
    left?: string;
    right?: string;
    top?: string;
    bottom?: string;
    width?: string;
    height?: string;
  };
  icon: string;
  badge: string;
  gestureType: 'tap' | 'double-tap' | 'slide-down' | 'jump-up' | 'drag-horizontal' | 'drag-free' | 'swipe-blade' | 'grid-tap';
  interactiveTestMessage: string;
}

export interface GameGestureGuideConfig {
  headlineTip: string;
  layoutType: 'split-half' | 'swipe-canvas' | 'bottom-controls' | 'grid-touch' | 'free-drag';
  zones: GestureOverlayZone[];
}

export interface GameOnboardingInfo {
  gameId: string;
  headlineObjective: string;
  rules: string[];
  mobileGestures: MobileGestureGuide[];
  proTip: string;
  touchLayoutTip?: string;
  gestureGuide?: GameGestureGuideConfig;
}

export const GAME_ONBOARDING_DATA: Record<string, GameOnboardingInfo> = {
  'mummy-escape': {
    gameId: 'mummy-escape',
    headlineObjective: 'Điều khiển nhà thám hiểm vượt qua mê cung Kim Tự Tháp, lừa xác ướp rơi vào góc chết và tìm đường đến cầu thang thoát hiểm!',
    rules: [
      'Bạn đi 1 bước, Xác Ướp Trắng/Đỏ sẽ đi 2 bước để săn đuổi bạn.',
      'Xác Ướp Trắng ưu tiên đi Ngang trước; Xác Ướp Đỏ ưu tiên đi Dọc trước.',
      'Lợi dụng tường đá, ngõ chữ U và nút Bỏ Lượt để lừa xác ướp bị kẹt hoặc đâm vào nhau tan biến.',
      'Nhặt Chìa Khóa Vàng/Đỏ để mở cổng đá bị khóa và bước vào Cầu Thang Thoát Hiểm.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Vuốt 4 Hướng / D-Pad',
        action: 'Di chuyển thám hiểm 1 ô (Lên/Xuống/Trái/Phải)',
        badge: 'Di Chuyển',
      },
      {
        icon: '⏳',
        gesture: 'Chạm Nút Bỏ Lượt',
        action: 'Đứng yên tại chỗ để dụ xác ướp di chuyển vào thế bẫy',
        badge: 'Skip Turn',
      },
      {
        icon: '↩️',
        gesture: 'Chạm Nút Undo (Lùi)',
        action: 'Quay lại bước đi trước đó khi bị dồn vào thế hiểm',
        badge: 'Hoàn Tác',
      },
      {
        icon: '🎯',
        gesture: 'Chạm Ô Kế Bên',
        action: 'Chạm trực tiếp vào ô có chấm sáng để đi tới đó',
        badge: 'Chạm Trực Tiếp',
      },
    ],
    proTip: 'Khi xác ướp bị chặn bởi một bức tường theo hướng ưu tiên của nó, hãy bấm nút Đứng Yên (Bỏ Lượt / Space) để xác ướp không thể tiến lại gần!',
    touchLayoutTip: 'Vuốt bất kỳ đâu trên ma trận hoặc dùng bàn phím ảo D-Pad phía dưới để điều hướng chuẩn xác.',
    gestureGuide: {
      headlineTip: 'Vuốt 4 hướng trên bàn chơi hoặc bấm cụm phím D-Pad bên dưới để di chuyển.',
      layoutType: 'bottom-controls',
      zones: [
        {
          id: 'swipe-board-zone',
          name: 'Vùng Mê Cung 6x6',
          action: 'Vuốt / Chạm ô để Di Chuyển',
          subAction: 'Vuốt Lên/Xuống/Trái/Phải hoặc chạm trực tiếp vào ô sáng kế bên để đi 1 bước',
          colorTheme: 'amber',
          position: { left: '5%', top: '5%', width: '90%', height: '55%' },
          icon: '🧭',
          badge: 'VUỐT MA TRẬN',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'Đã thử DI CHUYỂN: Nhà thám hiểm bước 1 ô trong lăng mộ!',
        },
        {
          id: 'wait-turn-zone',
          name: 'Nút Bỏ Lượt (Skip / Wait)',
          action: 'Đứng Yên Lừa Xác Ướp',
          subAction: 'Không di chuyển để kích hoạt lượt đi của xác ướp khi chúng đang kẹt',
          colorTheme: 'cyan',
          position: { left: '35%', bottom: '8%', width: '30%', height: '25%' },
          icon: '⏳',
          badge: 'BỎ LƯỢT',
          gestureType: 'tap',
          interactiveTestMessage: 'Đã thử BỎ LƯỢT: Đứng yên nhử xác ướp đâm vào tường chắn!',
        },
        {
          id: 'dpad-zone',
          name: 'Cụm Phím D-Pad Cảm Ứng',
          action: 'Điều Hướng 4 Chiều Chuẩn Xác',
          subAction: 'Bấm các mũi tên Lên/Xuống/Trái/Phải để chuyển hướng nhanh',
          colorTheme: 'emerald',
          position: { left: '5%', bottom: '5%', width: '90%', height: '32%' },
          icon: '🎮',
          badge: 'D-PAD',
          gestureType: 'tap',
          interactiveTestMessage: 'Đã thử D-PAD: Điều hướng mượt mà trên thiết bị di động!',
        },
      ],
    },
  },
  'neon-runner': {
    gameId: 'neon-runner',
    headlineObjective: 'Chạy qua đô thị tương lai Cyberpunk, né bẫy laser và hố sâu, thu thập ngọc để tích lũy điểm kỷ lục!',
    rules: [
      'Né tránh chướng ngại vật đỏ và khoảng trống tử thần.',
      'Thu thập ngọc xanh và chip năng lượng để tăng tốc độ và điểm số.',
      'Sử dụng nhảy kép đúng lúc để vượt qua các chướng ngại vật dài.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Nửa Phải',
        action: 'Nhảy lên cao (Chạm 2 lần liên tiếp để Nhảy Kép)',
        badge: 'Phải',
      },
      {
        icon: '👇',
        gesture: 'Chạm Nửa Trái',
        action: 'Trượt người né bẫy laser trên cao',
        badge: 'Trái',
      },
      {
        icon: '↔️',
        gesture: 'Vuốt Màn Hình',
        action: 'Vuốt Lên để Nhảy, Vuốt Xuống để Trượt nhanh',
        badge: 'Cử chỉ',
      },
    ],
    proTip: 'Nhấn đúp nửa phải màn hình để thực hiện Nhảy Kép vượt qua 2 bẫy liên tiếp an toàn!',
    touchLayoutTip: 'Chia màn hình làm 2 nửa: Chạm bên phải để Nhảy, chạm bên trái để Trượt.',
    gestureGuide: {
      headlineTip: 'Màn hình được chia làm 2 nửa: Bên Trái để TRƯỢT NÉ, bên Phải để NHẢY.',
      layoutType: 'split-half',
      zones: [
        {
          id: 'dodge-zone',
          name: 'Nửa Trái Màn Hình',
          action: 'Trượt / Cúi Người Né Bẫy',
          subAction: 'Chạm nửa trái hoặc vuốt ↓ để cúi trượt qua tia laser trên cao',
          colorTheme: 'rose',
          position: { left: '0%', top: '0%', width: '50%', height: '100%' },
          icon: '👇',
          badge: 'TRƯỢT / NÉ',
          gestureType: 'slide-down',
          interactiveTestMessage: 'Đã thử TRƯỢT: Nhân vật cúi người né tia laser an toàn!',
        },
        {
          id: 'jump-zone',
          name: 'Nửa Phải Màn Hình',
          action: 'Nhảy Cao & Nhảy Kép',
          subAction: 'Chạm 1 lần để nhảy, chạm 2 lần liên tiếp để Nhảy Kép qua hố sâu',
          colorTheme: 'cyan',
          position: { right: '0%', top: '0%', width: '50%', height: '100%' },
          icon: '👆',
          badge: 'NHẢY / NHẢY KÉP',
          gestureType: 'jump-up',
          interactiveTestMessage: 'Đã thử NHẢY: Bật cao vượt qua hố sâu tử thần!',
        },
      ],
    },
  },

  'eat-em-all': {
    gameId: 'eat-em-all',
    headlineObjective: 'Hứng nuốt quả cầu nguyên tố rơi xuống. Chuyển đổi đúng hệ BĂNG/LỬA, né bom tử thần và kích hoạt Fury x10!',
    rules: [
      'Chuyển sang dạng Băng (❄) để ăn cầu Băng, dạng Lửa (🔥) để ăn cầu Lửa.',
      'Ăn sai hệ sẽ bị trừ máu. Tuyệt đối né bom đỏ và lọ thuốc độc.',
      'Ăn liên tục tích đầy nộ khí nộ FURY x10 quét sạch màn hình!',
    ],
    mobileGestures: [
      {
        icon: '↔️',
        gesture: 'Kéo / Vuốt Ngang',
        action: 'Di chuyển nhân vật qua lại đón hứng quả cầu',
        badge: 'Di chuyển',
      },
      {
        icon: '🔄',
        gesture: 'Chạm Nút Đổi Hệ',
        action: 'Chạm nút Băng ❄ / Lửa 🔥 để đổi nguyên tố tức thì',
        badge: 'Đổi hệ',
      },
      {
        icon: '💥',
        gesture: 'Chạm Nút Fury',
        action: 'Kích hoạt bão cuồng nộ x10 điểm khi đầy thanh nộ',
        badge: 'Nộ khí',
      },
    ],
    proTip: 'Ăn liên tiếp 5 quả cùng màu kích hoạt chuỗi Combo nhân đôi điểm và nạp đầy nộ khí cực nhanh!',
    touchLayoutTip: 'Dùng ngón cái kéo nhẹ dưới đáy màn hình để di chuyển mượt mà.',
    gestureGuide: {
      headlineTip: 'Kéo ngón tay dưới đáy để hứng quả, chạm 2 nút bên dưới để đổi hệ hoặc bộc nộ.',
      layoutType: 'bottom-controls',
      zones: [
        {
          id: 'catch-track',
          name: 'Vùng Đón Quả Cầu',
          action: 'Kéo Ngang Qua Lại',
          subAction: 'Dùng ngón tay kéo nhẹ để di chuyển linh hoạt hứng cầu rơi',
          colorTheme: 'indigo',
          position: { left: '0%', top: '20%', width: '100%', height: '52%' },
          icon: '↔️',
          badge: 'HỨNG CẦU',
          gestureType: 'drag-horizontal',
          interactiveTestMessage: 'Đã thử DI CHUYỂN: Giỏ hứng đón trúng cầu nguyên tố!',
        },
        {
          id: 'element-switch',
          name: 'Góc Dưới Bên Trái',
          action: 'Chuyển Hệ Băng ❄ / Lửa 🔥',
          subAction: 'Chạm để đổi màu nguyên tố tức thì đón đúng loại cầu',
          colorTheme: 'cyan',
          position: { left: '6%', bottom: '6%', width: '42%', height: '20%' },
          icon: '❄️/🔥',
          badge: 'ĐỔI NGUYÊN TỐ',
          gestureType: 'tap',
          interactiveTestMessage: 'Đã đổi hệ: Băng ❄ <-> Lửa 🔥 sẵn sàng hứng cầu!',
        },
        {
          id: 'fury-burst',
          name: 'Góc Dưới Bên Phải',
          action: 'Cuồng Nộ FURY (x10 Điểm)',
          subAction: 'Chạm khi đầy bình nộ khí để ăn sạch mọi quả cầu trên màn',
          colorTheme: 'amber',
          position: { right: '6%', bottom: '6%', width: '42%', height: '20%' },
          icon: '💥',
          badge: 'NỘ FURY x10',
          gestureType: 'tap',
          interactiveTestMessage: 'KÍCH HOẠT FURY: Sấm sét bùng nổ, điểm số x10!',
        },
      ],
    },
  },

  'cosmic-defense': {
    gameId: 'cosmic-defense',
    headlineObjective: 'Lái Aegis Nova qua 100 nhiệm vụ, thu hồi Lõi Sao và hạ 10 boss trên 10 hành tinh.',
    rules: [
      'Chiến hạm tự động bắn laser liên tục khi bạn di chuyển.',
      'Né tránh làn đạn của phi thuyền địch và thiên thạch va chạm.',
      'Nhặt 10 loại item; bấm các slot để dùng Nova Bomb, Laser, Phase Cloak hoặc Overdrive.',
    ],
    mobileGestures: [
      {
        icon: '🖐️',
        gesture: 'Chạm & Kéo',
        action: 'Điều khiển chiến hạm bay theo ngón tay (Tự động bắn)',
        badge: 'Lái tàu',
      },
      {
        icon: '💣',
        gesture: 'Chạm slot item',
        action: 'Kích nổ sóng xung kích tiêu diệt toàn bộ đạn quái',
        badge: 'Bom nổ',
      },
      {
        icon: '⚡',
        gesture: 'Ăn Power-Up',
        action: 'Bay vào biểu tượng đạn chùm để nâng cấp hỏa lực',
        badge: 'Nâng cấp',
      },
    ],
    proTip: 'Giữ ngón tay phía dưới thân tàu để không bị ngón tay che khuất tầm nhìn chiến hạm!',
    touchLayoutTip: 'Kéo ngón tay cách tàu một khoảng nhỏ để quan sát đường đạn địch dễ dàng.',
    gestureGuide: {
      headlineTip: 'Chạm & kéo tự do trên màn hình để lái tàu. Chạm slot item dưới góc khi nguy cấp.',
      layoutType: 'free-drag',
      zones: [
        {
          id: 'pilot-arena',
          name: 'Vùng Bay Chiến Đấu',
          action: 'Chạm & Kéo Điều Khiển Tàu',
          subAction: 'Tàu bay theo ngón tay của bạn và tự động xả bão đạn laser',
          colorTheme: 'cyan',
          position: { left: '4%', top: '8%', width: '92%', height: '66%' },
          icon: '🛸',
          badge: 'LÁI TÀU & BẮN',
          gestureType: 'drag-free',
          interactiveTestMessage: 'Đã thử LÁI TÀU: Phi thuyền lượn né đạn và bắn laser cực mượt!',
        },
        {
          id: 'emp-trigger',
          name: 'Góc Dưới Bên Phải',
          action: 'Kích Nổ Bom EMP Xung Kích',
          subAction: 'Quét sạch toàn bộ làn đạn kẻ thù khi bị bao vây tứ phía',
          colorTheme: 'rose',
          position: { right: '6%', bottom: '6%', width: '45%', height: '18%' },
          icon: '💣',
          badge: 'BOM EMP',
          gestureType: 'tap',
          interactiveTestMessage: 'SÓNG EMP PHÁT NỔ: Toàn bộ đạn quái vật đã bị tiêu hủy!',
        },
      ],
    },
  },

  'cyber-slice': {
    gameId: 'cyber-slice',
    headlineObjective: 'Lướt ngón tay như kiếm ánh sáng chém nát các quả cầu năng lượng bay lên và né quả bom tử thần!',
    rules: [
      'Chém trúng mọi quả cầu màu tím, xanh, vàng để ghi điểm.',
      'Không để rơi quá 3 quả cầu xuống đáy màn hình.',
      'Tuyệt đối KHÔNG chém trúng bom đỏ (Nổ ngay lập tức).',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Vuốt / Quẹt Nhanh',
        action: 'Tạo đường kiếm chém đứt mọi quả cầu đi qua',
        badge: 'Chém',
      },
      {
        icon: '✨',
        gesture: 'Chém Nhiều Quả',
        action: 'Chém từ 3 quả trong 1 nhát để kích hoạt Combo x2',
        badge: 'Combo',
      },
      {
        icon: '⚠️',
        gesture: 'Tránh Xa Bom',
        action: 'Nhấc ngón tay lên khi bom bay ngang đường chém',
        badge: 'Cảnh giác',
      },
    ],
    proTip: 'Đợi các quả cầu đạt đỉnh rơi tụ lại gần nhau rồi chém 1 đường vòng cung để đạt combo khủng!',
    touchLayoutTip: 'Vuốt dứt khoát và nhấc ngón tay khi thấy bom đỏ xuất hiện.',
    gestureGuide: {
      headlineTip: 'Vuốt ngón tay liên tục trên màn hình để vung kiếm chém bóng, né bom đỏ!',
      layoutType: 'swipe-canvas',
      zones: [
        {
          id: 'blade-arena',
          name: 'Toàn Màn Hình Cắt Chém',
          action: 'Vuốt Nhanh Tạo Vết Chém Kiếm',
          subAction: 'Cắt đứt quả cầu màu; nhấc tay lên khi bom đỏ bay tới',
          colorTheme: 'emerald',
          position: { left: '4%', top: '6%', width: '92%', height: '88%' },
          icon: '⚔️',
          badge: 'VÙNG CHÉM KIẾM',
          gestureType: 'swipe-blade',
          interactiveTestMessage: 'VẾT CHÉM HOÀN HẢO: Cắt đôi quả cầu, kích hoạt Combo!',
        },
      ],
    },
  },

  'dungeon-tap': {
    gameId: 'dungeon-tap',
    headlineObjective: 'Chinh phục hầm ngục quái vật: Canh nhịp thanh tấn công vào vùng xanh bạo kích và giương khiên phản đòn!',
    rules: [
      'Quan sát thanh nhịp chạy: Nhấn khi vạch đỏ đi vào tâm vùng Xanh.',
      'Càng gần tâm thì sát thương gây ra càng mạnh (Critical Hit).',
      'Giương khiên đỡ đòn khi quái vật chuẩn bị vung kiếm tấn công.',
    ],
    mobileGestures: [
      {
        icon: '⚔️',
        gesture: 'Chạm Nút Tấn Công',
        action: 'Chạm đúng thời điểm thanh nhịp chạm vùng xanh',
        badge: 'Đánh',
      },
      {
        icon: '🛡️',
        gesture: 'Chạm Nút Khiên',
        action: 'Giương khiên phản đòn trước khi quái vật chém trúng',
        badge: 'Phản đòn',
      },
      {
        icon: '🧪',
        gesture: 'Chạm Bình Máu',
        action: 'Hồi phục HP khi lượng máu xuống mức báo động',
        badge: 'Hồi phục',
      },
    ],
    proTip: 'Đếm nhịp đập của vạch dao động giúp bạn canh thời gian chuẩn xác mà không cần nhìn chăm chú!',
    touchLayoutTip: 'Dùng 2 ngón tay cái: Ngón phải tấn công, ngón trái sẵn sàng bấm khiên.',
    gestureGuide: {
      headlineTip: 'Ngón cái trái sẵn sàng giương khiên đỡ đòn, ngón cái phải canh nhịp bạo kích.',
      layoutType: 'bottom-controls',
      zones: [
        {
          id: 'defend-zone',
          name: 'Góc Dưới Bên Trái',
          action: 'Giương Khiên Chặn Đòn',
          subAction: 'Bấm khiên ngay trước khi quái vật vung đao chém',
          colorTheme: 'cyan',
          position: { left: '6%', bottom: '8%', width: '42%', height: '24%' },
          icon: '🛡️',
          badge: 'KHIÊN PHẢN ĐÒN',
          gestureType: 'tap',
          interactiveTestMessage: 'ĐÃ GIƯƠNG KHIÊN: Phản đòn thành công, chặn đứng sát thương quái!',
        },
        {
          id: 'attack-zone',
          name: 'Góc Dưới Bên Phải',
          action: 'Tấn Công Bạo Kích',
          subAction: 'Chạm nút khi vạch dao động chạy vào tâm vùng XANH',
          colorTheme: 'amber',
          position: { right: '6%', bottom: '8%', width: '42%', height: '24%' },
          icon: '⚔️',
          badge: 'TẤN CÔNG CHÍ MẠNG',
          gestureType: 'tap',
          interactiveTestMessage: 'ĐÒN ĐÁNH CHÍ MẠNG: Đánh trúng hồng tâm, quái vật choáng váng!',
        },
      ],
    },
  },

  'blocker': {
    gameId: 'blocker',
    headlineObjective: 'Kéo thả các khối gạch đủ hình dạng vào bàn cờ 8x8. Lấp đầy hàng ngang hoặc dọc để phá hàng và ghi điểm!',
    rules: [
      'Mỗi lượt bạn nhận được 3 khối gạch bên dưới.',
      'Phải đặt hết 3 khối mới nhận được đợt gạch tiếp theo.',
      'Hai chế độ: tự do không đồng hồ và hành trình 100 màn. Mỗi lượt có một lần cứu bàn miễn phí.',
    ],
    mobileGestures: [
      {
        icon: '🖐️',
        gesture: 'Kéo & Thả Khối',
        action: 'Chạm giữ khối gạch bên dưới rồi kéo vào vị trí trên bàn cờ',
        badge: 'Đặt gạch',
      },
      {
        icon: '💥',
        gesture: 'Phá Nhiều Hàng',
        action: 'Xếp đầy cùng lúc 2-3 hàng/cột để kích hoạt Multi-Clear',
        badge: 'Combo',
      },
      {
        icon: '🎯',
        gesture: 'Giữ Chỗ Trống',
        action: 'Xoay khối và dùng gợi ý miễn phí để tìm vị trí phù hợp',
        badge: 'Chiến thuật',
      },
    ],
    proTip: 'Xoay và gợi ý luôn miễn phí. Xóa liên tiếp hoặc nhiều hàng cùng lúc để tăng combo!',
    touchLayoutTip: 'Khối gạch hiển thị nhô cao hơn vị trí ngón tay để không bị che khuất điểm đặt.',
    gestureGuide: {
      headlineTip: 'Chạm giữ khối gạch ở khay đáy, kéo thả vào các ô trống trên bàn cờ 8x8.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'grid-arena',
          name: 'Bàn Cờ 8x8 Phía Trên',
          action: 'Khu Vực Thả Gạch Ăn Điểm',
          subAction: 'Xếp kín hàng ngang hoặc dọc để kích nổ chuỗi khối',
          colorTheme: 'indigo',
          position: { left: '5%', top: '8%', width: '90%', height: '54%' },
          icon: '🧱',
          badge: 'BÀN CỜ 8x8',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'VỊ TRÍ HỢP LỆ: Khối gạch sẵn sàng thả vào bàn cờ!',
        },
        {
          id: 'tray-area',
          name: 'Khay 3 Khối Gạch Ở Đáy',
          action: 'Chạm Giữ & Kéo Lên',
          subAction: 'Chọn 1 trong 3 khối gạch xuất hiện để đưa vào bàn cờ',
          colorTheme: 'cyan',
          position: { left: '5%', bottom: '6%', width: '90%', height: '26%' },
          icon: '🖐️',
          badge: 'KHAY CHỌN GẠCH',
          gestureType: 'drag-free',
          interactiveTestMessage: 'ĐÃ CHỌN KHỐI: Kéo khối gạch thả lên vị trí mong muốn!',
        },
      ],
    },
  },

  'tile-2048': {
    gameId: 'tile-2048',
    headlineObjective: 'Vuốt 4 hướng để trượt và hợp nhất các ô số giống nhau, chinh phục mốc 2048 và phá kỷ lục điểm số!',
    rules: [
      'Khi vuốt, tất cả các ô số trên bàn cờ đều trượt theo hướng đó.',
      'Hai ô có cùng giá trị va chạm sẽ gộp lại thành ô có giá trị gấp đôi (2+2=4, 4+4=8...).',
      'Sau mỗi lượt vuốt, một ô số mới (2 hoặc 4) sẽ ngẫu nhiên xuất hiện.',
    ],
    mobileGestures: [
      {
        icon: '↔️',
        gesture: 'Vuốt Trái / Phải',
        action: 'Dồn toàn bộ các ô số sang mép trái hoặc mép phải',
        badge: 'Trượt ngang',
      },
      {
        icon: '↕️',
        gesture: 'Vuốt Lên / Xuống',
        action: 'Dồn toàn bộ các ô số lên trên hoặc xuống dưới',
        badge: 'Trượt dọc',
      },
      {
        icon: '🔢',
        gesture: 'Mốc 512 / 1024 / 2048',
        action: 'Ghép các ô giống nhau để đạt ô số lớn hơn và tăng điểm',
        badge: 'Ghép số',
      },
    ],
    proTip: 'Chiến thuật bất bại: Luôn giữ ô số lớn nhất nằm cố định ở một góc (ví dụ góc dưới cùng bên phải) và không bao giờ vuốt ngược lên!',
    touchLayoutTip: 'Vuốt dứt khoát trên bề mặt bàn cờ theo 4 phương cơ bản.',
    gestureGuide: {
      headlineTip: 'Vuốt ngón tay theo 4 hướng: Lên, Xuống, Trái, Phải để dồn các ô số gộp lại.',
      layoutType: 'free-drag',
      zones: [
        {
          id: 'swipe-board',
          name: 'Toàn Vùng Bàn Cờ Số',
          action: 'Vuốt 4 Hướng (↑ ↓ ← →)',
          subAction: 'Dồn các ô cùng giá trị va vào nhau để nhân đôi điểm số',
          colorTheme: 'amber',
          position: { left: '5%', top: '12%', width: '90%', height: '76%' },
          icon: '🔄',
          badge: 'VUỐT 4 CHIỀU',
          gestureType: 'drag-free',
          interactiveTestMessage: 'ĐÃ TRƯỢT SỐ: 2 ô số giống nhau đã gộp lại nhân đôi!',
        },
      ],
    },
  },

  'shikaku': {
    gameId: 'shikaku',
    headlineObjective: 'Vẽ các hình chữ nhật bao quanh mỗi con số sao cho diện tích bằng đúng số ô đó, phủ kín toàn bộ bảng!',
    rules: [
      'Mỗi hình chữ nhật chỉ được chứa DUY NHẤT 1 con số.',
      'Số ô (diện tích) của hình phải bằng đúng giá trị con số đó (ví dụ số 6 = hình 2x3 hoặc 1x6).',
      'Các hình không được chồng lấn lên nhau và phải lấp kín toàn bộ ô.',
    ],
    mobileGestures: [
      {
        icon: '🖐️',
        gesture: 'Chạm & Kéo Lưới',
        action: 'Chạm vào ô chứa số rồi kéo chéo để vẽ hình chữ nhật',
        badge: 'Vẽ hình',
      },
      {
        icon: '👆',
        gesture: 'Chạm Hình Đã Vẽ',
        action: 'Chạm vào hình đã tạo để xóa bỏ và vẽ lại',
        badge: 'Xóa',
      },
      {
        icon: '🔄',
        gesture: 'Nút Hoàn Tác',
        action: 'Chạm nút Undo để quay lại bước trước đó',
        badge: 'Hoàn tác',
      },
    ],
    proTip: 'Hãy bắt đầu từ các số nguyên tố (2, 3, 5, 7) và các số nằm ở góc bảng vì chúng chỉ có 1-2 cách tạo hình duy nhất!',
    touchLayoutTip: 'Kéo nhẹ nhàng từ góc này sang góc đối diện của hình chữ nhật.',
    gestureGuide: {
      headlineTip: 'Chạm ô có số, kéo chéo sang ô đối diện để vẽ hình chữ nhật bao trọn.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'grid-draw',
          name: 'Lưới Số Shikaku',
          action: 'Chạm & Kéo Chéo Vẽ Hình',
          subAction: 'Vẽ hình bao quanh đúng 1 số với diện tích bằng đúng giá trị số đó',
          colorTheme: 'indigo',
          position: { left: '5%', top: '10%', width: '90%', height: '80%' },
          icon: '📐',
          badge: 'VẼ HÌNH CHỮ NHẬT',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'ĐÃ VẼ HÌNH: Khung chữ nhật đã bao trọn số ô chính xác!',
        },
      ],
    },
  },

  'fill-the-space': {
    gameId: 'fill-the-space',
    headlineObjective: 'Lắp ghép các mảnh gỗ 3D chuẩn bị sẵn để lấp kín toàn bộ khuôn rỗng chạm khắc trên mặt bàn!',
    rules: [
      'Mỗi màn chơi có một hình khuôn rỗng cố định.',
      'Kéo tất cả các khối gỗ vào khuôn sao cho không còn ô hở nào.',
      'Các khối gỗ không được đè lên nhau hay vượt ra ngoài viền.',
    ],
    mobileGestures: [
      {
        icon: '🖐️',
        gesture: 'Kéo & Thả Khối Gỗ',
        action: 'Kéo các mảnh gỗ từ khay bên dưới thả vào khuôn',
        badge: 'Lắp ghép',
      },
      {
        icon: '↩️',
        gesture: 'Kéo Trở Lại Khay',
        action: 'Kéo mảnh gỗ ra ngoài khuôn để thử xếp lại cách khác',
        badge: 'Tháo gỡ',
      },
      {
        icon: '💡',
        gesture: 'Nút Gợi Ý / Undo',
        action: 'Dùng gợi ý nếu bí đường hoặc hoàn tác bước đi',
        badge: 'Trợ giúp',
      },
    ],
    proTip: 'Ưu tiên đặt các mảnh gỗ có hình dạng dị biệt (chữ T, chữ L dài) vào các góc trước!',
    touchLayoutTip: 'Thả ngón tay vào ô trống trên khuôn gỗ để mảnh tự động hút vào đúng vị trí.',
    gestureGuide: {
      headlineTip: 'Kéo khối gỗ từ khay thả vào khuôn rỗng trên mặt bàn.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'wood-tray',
          name: 'Khay Mảnh Gỗ Đáy',
          action: 'Kéo Thả Mảnh Gỗ Vào Khuôn',
          subAction: 'Nhấc mảnh ghép từ khay thả vừa khít vào khuôn rỗng phía trên',
          colorTheme: 'amber',
          position: { left: '6%', top: '10%', width: '88%', height: '80%' },
          icon: '🪵',
          badge: 'LẮP GHÉP GỖ',
          gestureType: 'drag-free',
          interactiveTestMessage: 'KHỚP VỊ TRÍ: Khối gỗ hút vừa khít vào khuôn chạm trổ!',
        },
      ],
    },
  },

  'scoodoku': {
    gameId: 'scoodoku',
    headlineObjective: 'Điền các chữ số từ 1 đến 9 sao cho mỗi hàng, mỗi cột và mỗi khối 3x3 đều chứa đủ các số không trùng lặp!',
    rules: [
      'Không trùng chữ số trên cùng 1 hàng ngang.',
      'Không trùng chữ số trên cùng 1 hàng dọc.',
      'Không trùng chữ số trong cùng 1 khối vuông 3x3 viền đậm.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Chọn Ô',
        action: 'Chạm vào ô trống trên bàn cờ Sudoku cần điền',
        badge: 'Chọn ô',
      },
      {
        icon: '🔢',
        gesture: 'Chạm Bàn Phím Số',
        action: 'Chạm các số từ 1 đến 9 bên dưới để điền số',
        badge: 'Điền số',
      },
      {
        icon: '✏️',
        gesture: 'Bật Chế Độ Ghi Nháp',
        action: 'Bật biểu tượng bút chì để ghi nháp các số khả thi',
        badge: 'Bút chì',
      },
    ],
    proTip: 'Sử dụng chế độ Bút Chì nháp khi có 2 con số phân vân, tránh điền ẩu bị tính lỗi trừ điểm!',
    touchLayoutTip: 'Chạm vào một số bất kỳ để làm nổi bật tất cả các số giống nhau trên toàn bàn cờ.',
    gestureGuide: {
      headlineTip: 'Chạm chọn ô trống trên bàn cờ 9x9, sau đó chạm số 1-9 ở khay phím dưới để điền.',
      layoutType: 'bottom-controls',
      zones: [
        {
          id: 'board-select',
          name: 'Bàn Cờ 9x9',
          action: 'Chạm Ô Trống Cần Điền',
          subAction: 'Chọn ô để làm sáng hàng, cột và khối 3x3 tương ứng',
          colorTheme: 'indigo',
          position: { left: '5%', top: '6%', width: '90%', height: '60%' },
          icon: '🔢',
          badge: 'CHỌN Ô',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'ĐÃ CHỌN Ô: Hàng & Cột đã được làm nổi bật để phân tích!',
        },
        {
          id: 'numpad-area',
          name: 'Bàn Phím Số 1 - 9',
          action: 'Chạm Số Cần Điền',
          subAction: 'Nhấn số tương ứng hoặc bật nút bút chì để ghi nháp',
          colorTheme: 'cyan',
          position: { left: '5%', bottom: '6%', width: '90%', height: '24%' },
          icon: '⌨️',
          badge: 'ĐIỀN SỐ 1-9',
          gestureType: 'tap',
          interactiveTestMessage: 'ĐIỀN SỐ THÀNH CÔNG: Con số hợp lệ được ghi vào ô!',
        },
      ],
    },
  },

  'hex-match': {
    gameId: 'hex-match',
    headlineObjective: 'Chạm vào các nhóm từ 3 khối lục giác cùng màu trở lên để kích nổ chuỗi và gia hạn thêm thời gian thi đấu!',
    rules: [
      'Cụm càng nhiều khối nổ cùng lúc thì điểm thưởng càng khổng lồ.',
      'Mỗi lần kích nổ cụm lớn sẽ cộng thêm thời gian vào đồng hồ.',
      'Trò chơi kết thúc khi đồng hồ đếm ngược về số 0.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Nhóm Lục Giác',
        action: 'Chạm vào khối màu có ít nhất 2 khối cùng màu kề bên',
        badge: 'Kích nổ',
      },
      {
        icon: '⚡',
        gesture: 'Tạo Khối Đặc Biệt',
        action: 'Phá nhóm 5+ khối để tạo khối sấm sét phá hàng',
        badge: 'Power-up',
      },
      {
        icon: '⏱️',
        gesture: 'Nạp Đồng Hồ',
        action: 'Thao tác liên tục để không bị cạn thời gian',
        badge: 'Thời gian',
      },
    ],
    proTip: 'Đừng vội phá các nhóm 3 ô nhỏ, hãy để chúng tích lũy thành cụm 7-8 ô để kích nổ bom cực mạnh!',
    touchLayoutTip: 'Chạm trực tiếp vào trung tâm nhóm màu để nổ tức thì.',
    gestureGuide: {
      headlineTip: 'Chạm vào các cụm từ 3 ô lục giác cùng màu kề nhau để kích nổ gom điểm.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'hex-arena',
          name: 'Lưới Tổ Ong Lục Giác',
          action: 'Chạm Kích Nổ Cụm Cùng Màu',
          subAction: 'Nổ cụm lớn để tạo sét phá hàng và kéo dài thời gian',
          colorTheme: 'purple',
          position: { left: '5%', top: '10%', width: '90%', height: '80%' },
          icon: '⬡',
          badge: 'CHẠM NỔ LỤC GIÁC',
          gestureType: 'tap',
          interactiveTestMessage: 'BÙNG NỔ COMBO: Cụm lục giác nổ tung, đồng hồ được cộng thêm 3s!',
        },
      ],
    },
  },

  'chess': {
    gameId: 'chess',
    headlineObjective: 'Đấu trí Cờ Vua chuẩn quốc tế FIDE: Bày binh bố trận, bảo vệ Vua và chiếu bí Vua đối phương để giành chiến thắng!',
    rules: [
      'Mỗi quân cờ có quy luật di chuyển đặc trưng (Xe, Mã, Tượng, Hậu, Vua, Tốt).',
      'Hỗ trợ đầy đủ luật Nhập thành, Bắt tốt qua đường (En Passant) và Phong cấp.',
      'Chiếu bí (Checkmate) đối phương hoặc đối phương hết thời gian sẽ giành chiến thắng.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Quân Cờ',
        action: 'Chọn quân cần đi, bàn cờ sẽ sáng đèn các nước đi hợp lệ',
        badge: 'Chọn quân',
      },
      {
        icon: '🎯',
        gesture: 'Chạm Ô Đích',
        action: 'Chạm ô sáng màu để di chuyển quân cờ đến vị trí đó',
        badge: 'Đi cờ',
      },
      {
        icon: '👑',
        gesture: 'Chọn Phong Cấp',
        action: 'Khi Tốt xuống hàng cuối, chạm chọn Hậu/Xe/Tượng/Mã',
        badge: 'Phong cấp',
      },
    ],
    proTip: 'Chiếm lĩnh 4 ô trung tâm bàn cờ ngay từ khai cuộc để mở rộng đường đi cho Hậu và các quân cờ mạnh!',
    touchLayoutTip: 'Chạm một lần để chọn quân, chạm lần hai vào ô hợp lệ để di chuyển an toàn.',
    gestureGuide: {
      headlineTip: 'Chạm một lần để chọn quân cờ, chạm lần hai vào ô sáng màu để đi.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'board-touch',
          name: 'Bàn Cờ Vua Quốc Tế',
          action: 'Chạm Chọn Quân & Đi Cờ',
          subAction: 'Hệ thống tự động hiển thị chấm xanh các nước đi hợp lệ',
          colorTheme: 'indigo',
          position: { left: '5%', top: '10%', width: '90%', height: '80%' },
          icon: '♟️',
          badge: 'CHẠM QUÂN / Ô ĐÍCH',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'NƯỚC ĐI HỢP LỆ: Quân cờ di chuyển và phát động tấn công!',
        },
      ],
    },
  },

  'xiangqi': {
    gameId: 'xiangqi',
    headlineObjective: 'Cờ Tướng kinh điển: Điều binh khiển Tướng, Sĩ, Tượng, Xe, Pháo, Mã, Tốt vượt sông công thành chiếu bí Tướng địch!',
    rules: [
      'Tướng và Sĩ chỉ được di chuyển trong cung 3x3 cấm địa.',
      'Tượng không được qua sông, Pháo phải có ngòi mới được ăn quân.',
      'Mã bị cản chân không đi được, hai Tướng không được nhìn mặt nhau trên cùng một cột.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Quân Cờ',
        action: 'Chọn quân cờ, hệ thống sẽ hiện vòng tròn các nước đi hợp lệ',
        badge: 'Chọn quân',
      },
      {
        icon: '🎯',
        gesture: 'Chạm Điểm Đến',
        action: 'Chạm vào giao điểm hợp lệ để di chuyển hoặc ăn quân',
        badge: 'Nước đi',
      },
      {
        icon: '⚔️',
        gesture: 'Chiếu Tướng',
        action: 'Tấn công ép Tướng đối phương không còn đường né',
        badge: 'Chiếu bí',
      },
    ],
    proTip: 'Đầu trận nên ưu tiên xuất quân Xe thật nhanh ("Nhất Xe bằng thập mã") và bố trí Pháo đầu công phá trung lộ!',
    touchLayoutTip: 'Giao điểm các đường kẻ có vòng tròn xanh hướng dẫn giúp bạn chạm chính xác.',
    gestureGuide: {
      headlineTip: 'Chạm quân cờ để xem vòng tròn nước đi hợp lệ, chạm giao điểm để hạ quân.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'xiangqi-board',
          name: 'Chiến Tuyến Cờ Tướng',
          action: 'Chạm Quân & Giao Điểm Đường Kẻ',
          subAction: 'Vòng tròn xanh sẽ hướng dẫn chính xác các bước đi hợp lệ',
          colorTheme: 'amber',
          position: { left: '5%', top: '8%', width: '90%', height: '84%' },
          icon: '🀄',
          badge: 'CHỌN QUÂN & HẠ NƯỚC',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'NƯỚC CỜ HIỂM: Pháo vào đầu, Xe chiếm lộ, uy hiếp Tướng địch!',
        },
      ],
    },
  },

  'caro-gomoku': {
    gameId: 'caro-gomoku',
    headlineObjective: 'Cờ Caro Gomoku 15x15: Khéo léo tạo chuỗi 5 quân cờ liên tiếp theo hàng ngang, dọc hoặc chéo để chiến thắng!',
    rules: [
      'Hai bên lần lượt đặt 1 quân cờ (X hoặc O) vào các giao điểm trống.',
      'Người đầu tiên tạo được 5 quân liên tiếp không bị chặn 2 đầu sẽ thắng.',
      'Tạo các thế bẫy 3-3 hoặc 4-3 để đối thủ không kịp phòng thủ.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Giao Điểm',
        action: 'Chạm nhẹ vào giao điểm ô cờ cần hạ quân',
        badge: 'Đặt cờ',
      },
      {
        icon: '🔍',
        gesture: 'Thu Phóng / Kéo',
        action: 'Dễ dàng quan sát toàn bộ bàn cờ 15x15 rộng lớn',
        badge: 'Góc nhìn',
      },
      {
        icon: '🎯',
        gesture: 'Xác Nhận Nước Đi',
        action: 'Chạm ô sẽ có hiệu ứng sáng hiển thị nước đi vừa đánh',
        badge: 'Tọa độ',
      },
    ],
    proTip: 'Đừng chỉ chăm chú tấn công, hãy luôn để mắt tới chuỗi 3 quân của đối thủ để chặn kịp thời trước khi họ thành chuỗi 4!',
    touchLayoutTip: 'Chạm chuẩn xác vào giao điểm đường kẻ để quân cờ hiển thị đẹp mắt.',
    gestureGuide: {
      headlineTip: 'Chạm chính xác vào giao điểm 15x15 để hạ quân X/O.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'gomoku-grid',
          name: 'Giao Điểm 15x15',
          action: 'Chạm Hạ Quân Cờ',
          subAction: 'Tạo thế 5 quân liên tiếp ngang, dọc hoặc chéo',
          colorTheme: 'cyan',
          position: { left: '5%', top: '10%', width: '90%', height: '80%' },
          icon: '⭕/❌',
          badge: 'ĐẶT QUÂN CARO',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'HẠ QUÂN CHÍNH XÁC: Tạo thế cờ 4 quân liên tiếp uy hiếp!',
        },
      ],
    },
  },

  'draw-a-shape': {
    gameId: 'draw-a-shape',
    headlineObjective: 'Vuốt từ các ô số để tạo đường đi phủ kín ô trống sao cho độ dài mỗi đường bằng đúng số ghi trên ô xuất phát!',
    rules: [
      'Mỗi đường vẽ bắt đầu từ một ô có số.',
      'Số ô mà đường vẽ đi qua phải bằng đúng giá trị của số đó.',
      'Mọi ô vuông trên bảng phải được lấp đầy hoàn hảo, không để sót ô trống.',
    ],
    mobileGestures: [
      {
        icon: '👆',
        gesture: 'Chạm Vào Ô Số',
        action: 'Bắt đầu từ ô số rồi vuốt liền mạch qua các ô trống kề cận',
        badge: 'Bắt đầu',
      },
      {
        icon: '↔️',
        gesture: 'Vuốt Tạo Đường',
        action: 'Kéo ngón tay theo đường ngang/dọc để vẽ đường khối',
        badge: 'Vẽ đường',
      },
      {
        icon: '🔄',
        gesture: 'Chạm Lại Để Xóa',
        action: 'Chạm vào đường đã vẽ để rút lại nếu thấy đi sai hướng',
        badge: 'Xóa đường',
      },
    ],
    proTip: 'Bắt đầu từ các ô có số lớn hoặc các ô nằm sát góc/cạnh vì chúng có ít hướng rẽ nhánh hơn!',
    touchLayoutTip: 'Vuốt liên tục theo đường ngang hoặc dọc, không nhấc tay cho đến khi đủ số ô.',
    gestureGuide: {
      headlineTip: 'Chạm giữ từ ô có số, vuốt liền mạch qua các ô trống để lấp đầy số ô yêu cầu.',
      layoutType: 'grid-touch',
      zones: [
        {
          id: 'draw-path',
          name: 'Lưới Vẽ Khối Đường',
          action: 'Vuốt Nối Ô Trống Liền Kề',
          subAction: 'Độ dài đường vẽ bằng đúng số ghi trên ô khởi đầu',
          colorTheme: 'emerald',
          position: { left: '5%', top: '10%', width: '90%', height: '80%' },
          icon: '✏️',
          badge: 'VUỐT VẼ ĐƯỜNG',
          gestureType: 'grid-tap',
          interactiveTestMessage: 'ĐƯỜNG VẼ CHÍNH XÁC: Đã bao phủ đủ số ô yêu cầu!',
        },
      ],
    },
  },
};
