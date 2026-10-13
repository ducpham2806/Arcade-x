import { Run } from "./types";
import { groups, neighbors, hasHazard } from "./engine";
export interface Lesson {
  id: string;
  title: string;
  body: string;
  cue: string;
  cells?: number[];
  target?: "board" | "goals" | "moves" | "merge" | "tools";
  practice?: boolean;
}
const hazards: Record<string, [string, string]> = {
  weed: [
    "Cỏ dại",
    "Nổ một nhóm hoa sát cỏ để nhổ nó. Ô vừa dọn sẽ được lấp bằng hoa mới.",
  ],
  rock: [
    "Đá nhiều lớp",
    "Nổ nhóm sát đá để làm mất một lớp. Số trên viên đá cho biết số lần cần phá. Phá hết lớp mới tính một ô vào mục tiêu.",
  ],
  cocoon: [
    "Kén tơ",
    "Hoa hoặc bạn nhỏ trong kén chưa thể chạm. Nổ sát kén để giải phóng; biểu tượng bàn chân là bạn cần cứu.",
  ],
  ice: [
    "Băng",
    "Hoa đóng băng không thể chạm. Nổ sát nó hoặc dùng special để phá từng lớp băng.",
  ],
  vine: [
    "Dây leo lan",
    "Mỗi 3 thao tác hợp lệ, dây leo mọc thêm một ô. Dọn sớm bằng nhóm nổ sát dây leo.",
  ],
  bug: [
    "Sâu bọ",
    "Sâu di chuyển một ô và ăn hoa sau mỗi lượt. Nổ sát vị trí của sâu hoặc đánh trúng bằng special.",
  ],
  bomb: [
    "Bom hẹn giờ",
    "Số trên bom giảm sau mỗi thao tác hợp lệ. Phá bằng nhóm nổ chạm bom hoặc special trước khi về 0.",
  ],
  honey: [
    "Mật ong",
    "Mật ong chặn đường hoa rơi. Nổ nhóm sát ô mật để mở đường.",
  ],
  fog: [
    "Sương mù",
    "Sương che màu hoa. Nổ sát vùng sương để nhìn rõ những ô bên trong.",
  ],
};
const goalText: Record<string, [string, string]> = {
  score: [
    "Mục tiêu điểm",
    "Tích điểm bằng nhóm hoa và special. Chỉ khi đủ số điểm ghi ở thanh mục tiêu, màn mới hoàn thành.",
  ],
  collect: [
    "Thu thập đúng hoa",
    "Chỉ hoa được chỉ trong thanh mục tiêu mới được tính. Số bên trái là đã thu, bên phải là cần thu.",
  ],
  drop: [
    "Thả hạt xuống đáy",
    "Hạt không bị phá. Dọn hoa nằm dưới hạt, để hạt rơi xuống hàng cuối cùng.",
  ],
  rescue: [
    "Giải cứu bạn nhỏ",
    "Tìm ô có dấu bàn chân. Phá hết lớp kén hoặc băng giữ bạn ấy để ghi một lượt giải cứu.",
  ],
  combo: [
    "Giữ chuỗi chạm",
    "Chạm các nhóm hợp lệ cách nhau dưới 2 giây. Mục tiêu tính số lần liên tiếp, multiplier điểm tối đa ×4.",
  ],
  gift: [
    "Mở hộp quà",
    "Nổ sát hộp để mở. Quà có thể là special, Xu hoặc lượt thêm; không cần mua bất cứ thứ gì.",
  ],
};
const specialText: Record<string, [string, string]> = {
  bee_h: [
    "Ong Mật ngang",
    "Nhóm 5–6 hoa tạo Ong. Chạm Ong để quét cả hàng; vạch và mũi tên trên ô cho biết hướng bay.",
  ],
  bee_v: [
    "Ong Mật dọc",
    "Ong có mũi tên dọc quét cả cột. Chạm Ong khi muốn mở đường từ trên xuống.",
  ],
  bloom_bomb: [
    "Bom Hoa",
    "Nhóm 7–8 hoa tạo Bom Hoa. Chạm để nổ vùng 5×5 quanh nó, chạm được nhiều chướng ngại cùng lúc.",
  ],
  rainbow_orb: [
    "Cầu Vồng",
    "Nhóm 9–10 hoa tạo Cầu Vồng. Chạm để quét màu đang cần thu; nếu không có, quét màu nhiều nhất.",
  ],
  sun: [
    "Mặt Trời",
    "Nhóm từ 11 hoa tạo Mặt Trời. Chạm để quét 3 hàng và 3 cột qua tâm ô.",
  ],
};
export function lessonsFor(s: Run, seen: string[], basic = true): Lesson[] {
  const out: Lesson[] = [],
    add = (l: Lesson) => {
      if (!seen.includes(l.id) && !out.some((x) => x.id === l.id)) out.push(l);
    };
  if (s.level.id === 87 && s.turns === 0 && s.board[77]?.special === "bee_v")
    add({
      id: "seed-route-87",
      title: "Mở lối cho bốn hạt giống",
      body: "Màn này có một Ong dọc sẵn ở chân cột hạt. Thử dùng Ong để mở một đường rơi, rồi ưu tiên nhóm sát dưới các hạt còn lại. Cổng A chỉ chuyển sang B khi đầu ra trống.",
      cue: "Chạm Ong được đánh dấu để mở cột.",
      cells: [77],
      target: "board",
      practice: true,
    });
  if (basic) {
    const best = groups(s).sort(
      (a, b) => Math.abs(a.length - 3) - Math.abs(b.length - 3),
    )[0];
    if (best)
      add({
        id: "tap-4-way",
        title: "Hãy làm nở nhóm hoa đầu tiên",
        body: "Chạm nhóm từ 3 hoa cùng màu kề ngang hoặc dọc. Kề chéo không tính; chạm sai không mất lượt.",
        cue: "Chạm một ô đang sáng trên bàn.",
        cells: best,
        target: "board",
        practice: true,
      });
  }
  for (const g of s.level.goals) {
    if (goalText[g.kind])
      add({
        id: `goal-${g.kind}`,
        title: goalText[g.kind][0],
        body: goalText[g.kind][1],
        cue: "Nhìn thanh mục tiêu phía trên bàn.",
        target: "goals",
      });
  }
  const companionTips: Record<string, [string, string]> = {
    bibi: [
      "Bibi và gợi ý miễn phí",
      "Bấm Bibi dưới bàn để tìm một nhóm tốt. Bibi có một gợi ý chủ động mỗi ván; gợi ý tự động sau 8 giây có thể bật trong cài đặt.",
    ],
    pip: [
      "Pip đồng hành",
      "Pip thêm 5 Xu khi bạn thắng màn. Không cần bấm để kích hoạt.",
    ],
    bunny: [
      "Thỏ Bông đồng hành",
      "Thỏ thêm 3 giây vào màn tính giờ. Đồng hồ đã tính cả phần cộng thêm.",
    ],
    owl: [
      "Cú Đêm đồng hành",
      "Bấm Cú dưới bàn để xua một vùng sương. Chỉ dùng một lần mỗi ván.",
    ],
    turtle: [
      "Rùa Vàng đồng hành",
      "Khi còn 3 lượt, Rùa tặng thêm 1 lượt một lần. Không áp dụng cho màn tính giờ.",
    ],
  };
  if (companionTips[s.companion])
    add({
      id: `companion-${s.companion}`,
      title: companionTips[s.companion][0],
      body: companionTips[s.companion][1],
      cue: "Bạn đồng hành không xuất hiện trong thử thách ngày.",
      target: "tools",
    });
  if (s.level.seconds)
    add({
      id: "timed",
      title: "Màn chơi tính giờ",
      body: "Đồng hồ chạy thay cho số lượt. Thời gian dừng khi đọc hướng dẫn hoặc tạm dừng; bom giờ vẫn tính theo thao tác.",
      cue: "Để ý số giây còn lại.",
      target: "moves",
    });
  for (const kind of new Set(
    s.board
      .flatMap((t) => [t.hazard, ...(t.fog ? ["fog" as const] : [])])
      .filter(Boolean),
  )) {
    const cell = s.board.findIndex((t) => hasHazard(t, kind)),
      g = groups(s).find((g) => g.some((i) => neighbors(s, i).includes(cell)));
    add({
      id: `hazard-${kind}`,
      title: hazards[kind!][0],
      body: hazards[kind!][1],
      cue: g
        ? "Nhóm sáng nằm cạnh chướng ngại vật mới."
        : "Quan sát ô được đánh dấu trên bàn.",
      cells: g || [cell],
      target: "board",
      practice: !!g,
    });
  }
  if (s.portals.length)
    add({
      id: "portal",
      title: "Cổng dịch chuyển",
      body: "Khi cổng B có ô trống, hoa, hạt hoặc special tại cổng A đi sang B rồi tiếp tục rơi. Nếu B đang đầy, vật phẩm không dịch chuyển.",
      cue: "Hai vòng sáng là vị trí cặp cổng.",
      cells: s.portals,
      target: "board",
    });
  if (s.combo >= 2)
    add({
      id: "combo-rhythm",
      title: "Nhịp chạm tạo Combo",
      body: "Hai thao tác hợp lệ cách nhau không quá 2 giây tăng hệ số điểm. Giữ nhịp để lên tối đa ×4; dừng lâu sẽ bắt đầu chuỗi mới.",
      cue: "Hệ số Combo nằm cạnh điểm.",
      target: "moves",
    });
  if (s.phase > 1)
    add({
      id: `boss-${s.level.chapter}-phase-${s.phase}`,
      title: `Boss chuyển sang pha ${s.phase}`,
      body:
        s.level.chapter === 6
          ? "Bọ Cạp bắt đầu thả bom hẹn giờ. Hãy phá bom trước khi số đếm về 0."
          : "Nữ Hoàng phối hợp dây leo, sâu bọ và mật ở pha 2; băng, vùng sương 2×2 và bom giờ ở pha 3. Hãy xử lý bom trước khi số đếm về 0.",
      cue: "Số pha nằm trên thanh HP của boss.",
      target: "board",
    });
  if (s.level.bossHP) {
    const names = [
      "Sâu Bướm Xám",
      "Quạ Tham Ăn",
      "Cối Xay Gió Xám",
      "Cua Khổng Lồ",
      "Nấm Độc",
      "Bọ Cạp Xám",
      "Yeti Bụi Xám",
      "Rồng Bụi Đầm",
      "Nhện Đêm",
      "Nữ Hoàng Xám",
    ];
    const attacks = [
      "phủ cỏ",
      "phủ cỏ",
      "trộn từng cột sau 5 lượt",
      "sinh dây leo",
      "thả sâu bọ",
      "đổi sang bom giờ ở pha 2",
      "đóng băng hoa",
      "thổi sương",
      "giăng kén",
      "đổi chướng ngại qua 3 pha",
    ];
    add({
      id: `boss-${s.level.chapter}`,
      title: `Boss mới: ${names[s.level.chapter - 1]}`,
      body: `Nổ nhóm sát boss gây 1 sát thương; Ong/Bom gây 2, Cầu Vồng/Mặt Trời gây 3. Boss ${attacks[s.level.chapter - 1]}.`,
      cue: "Thanh HP trên boss phải về 0 để thắng.",
      cells: s.board.map((t, i) => (t.boss ? i : -1)).filter((i) => i >= 0),
      target: "board",
    });
  }
  for (const [k, v] of Object.entries(s.used))
    if (k.startsWith("reserved:") && v > 0)
      add({
        id: `booster-${k.slice(9)}`,
        title: "Vật phẩm đã mang vào ván",
        body:
          k === "reserved:undo"
            ? "Hoàn tác trả bàn, điểm và lượt về trước lần chạm cuối. Vật phẩm đã dùng không được hoàn lại."
            : k === "reserved:shuffle"
              ? "Bấm Trộn để xáo hoa mà không mất lượt. Chướng ngại vẫn ở vị trí cũ."
              : "Chọn công cụ dưới bàn, rồi chọn ô để dùng. Hỗ trợ không mất lượt; phần chưa dùng sẽ được trả khi kết thúc.",
        cue: "Vật phẩm khởi đầu đã đặt lên bàn; hỗ trợ nằm ở thanh dưới.",
        target: "tools",
      });
  s.board.forEach((t, i) => {
    if (t.special)
      add({
        id: `special-${t.special}`,
        title: specialText[t.special][0],
        body: specialText[t.special][1],
        cue: "Special có viền sáng, ký hiệu riêng và hướng tác động.",
        cells: [i],
        target: "board",
        practice: true,
      });
  });
  if (
    s.board.some(
      (t, i) => t.special && neighbors(s, i).some((n) => s.board[n].special),
    )
  )
    add({
      id: "merge-pair",
      title: "Hai special cạnh nhau",
      body: "Bấm Ghép đôi rồi chọn hai special cạnh nhau để kết hợp sức mạnh. Ghép đôi dùng một lượt.",
      cue: "Bấm Ghép đôi khi bạn sẵn sàng kết hợp.",
      target: "merge",
    });
  if (s.level.colors > 4)
    add({
      id: `palette-${s.level.colors}`,
      title: `Bàn chơi có ${s.level.colors} màu hoa`,
      body: "Nhiều màu hơn sẽ làm nhóm lớn hiếm hơn. Hãy nhận diện cả hình dáng của hoa và chọn nhóm giúp hoàn thành mục tiêu trước.",
      cue: "Mỗi màu có một hình hoa riêng để dễ phân biệt.",
      target: "board",
    });
  return out;
}
