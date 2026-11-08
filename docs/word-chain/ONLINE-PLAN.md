# Nối Từ — kế hoạch phòng, ghép trận và PK

Ngày 07/11/2026 · nhánh `codex/word-chain-launcher-release` · nguồn code `5a64fef`. Đây là kế hoạch được yêu cầu, chưa phải triển khai backend. WC-L0 đã merge3f943d9/Published sau full CI24/head5882adf; bot/offline ra sảnh đã kiểm, online vẫn tắt. Đọc [thẻ công việc](../plans/WORD-CHAIN.md) để lấy trạng thái mới nhất; chỉ mở mục dưới đây của task đang làm.

## Kết quả cần đạt

Người chơi đăng nhập có thể tạo phòng riêng → gửi mã cho bạn → vào phòng → PK; hoặc chọn Ghép trận để gặp người thật. Hỗ trợ 2–4 người, kết quả do server quyết định, vào lại được khi mất mạng ngắn. Không tự điền bot vào hàng online. Bot/offline tiếp tục hoạt động độc lập.

## Đã có và khoảng trống

| Phần | Đã có trong source | Cần làm tiếp |
|---|---|---|
| Phòng và hàng đợi | Tạo/join mã, ghế 2–4, FIFO, một phòng/account, ready/start, leave, rematch | Triển khai staging, kiểm đồng thời và trải nghiệm bằng tài khoản thật |
| Luật và đồng bộ | Luật dùng chung với bot, server làm trọng tài, CAS/version, request receipt, polling/resume | Kiểm giờ thực, retry/mất mạng/đổi account và cleanup khi thoát launcher |
| Backend | Schema, Edge Function, scheduler mẫu, PGlite/HTTP fixture | Auth đúng project, quyền, lịch tick thật, origin, quan sát lỗi và rollback |
| UI | `OnlineRoom`, `MatchView`, create/join/queue/lobby/result | Xác nhận bỏ cuộc dùng đường leave; kiểm toàn chuỗi không gửi lệnh trùng, trạng thái chờ/lỗi/hủy và bàn phím |
| Phần thưởng | UI online gọi `bridge.submitScore`; ref chỉ chặn lặp trong một lần mount | Chưa đủ bảo đảm chống nhận lặp sau reload. Pilot tắt thưởng chung; cần biên nhận bền vững/verifier trước thưởng cạnh tranh |

36 kiểm tra luật/server/schema/Edge fixture đã qua ở checkpoint WC-L0. Chúng không chứng minh Edge, scheduler và nhiều tài khoản đã chạy thật. Không viết lại hệ thống phòng từ đầu.

## Hợp đồng giữ nguyên trong đợt đầu

- Mã phòng 6 ký tự; bộ sinh tránh ký tự dễ nhầm. Phòng riêng chọn 2/3/4 ghế; chủ phòng có thể bắt đầu từ 2 người, đầy phòng chuyển chuẩn bị.
- Ghép vào phòng công khai hợp lệ cũ nhất còn chỗ. Đầy 4 người hoặc đủ 20 giây từ người thứ hai thì bắt đầu; một tài khoản chỉ có một ghế đang mở.
- Chuẩn bị 30 giây, đếm ngược 3 giây; lượt 30 giây, từ vòng 4 còn 20 giây, vòng 7 còn 15 giây. Vắng 90 giây, phòng chờ hết hạn 10 phút, phiếu tái đấu 60 giây.
- Client không đọc/ghi bảng phòng trực tiếp; Edge kiểm registered user và server kiểm từ, lượt, giờ, kết quả. Pilot giữ điểm/thứ hạng trong trận, tắt XP/coin chung cho online.
- Polling hiện tại 1 giây khi có đồng hồ, 3 giây khi chờ; tick mẫu mỗi 10 giây. Phải đo độ trễ thực tế và trường hợp không còn client trước khi chốt lịch; chưa thay thông số chỉ từ ước đoán.

## Thứ tự triển khai

### WC-ON1 · READY chuẩn bị · nền staging và chặn thưởng lặp · 1–2 ngày

**Phụ thuộc:** WC-L0 có checkpoint ổn định; xác định staging và tài khoản thử. Chuẩn bị local/PGlite làm ngay; deploy staging cần môi trường phù hợp. Không chạy SQL/script lên Supabase production.

**File:** `supabase/word-chain/{schema,scheduler}.sql`, `supabase/functions/word-chain-room/`, `src/games/word-chain/{online-config.json,OnlineRoom.tsx,online-platform.ts}`, script package và tests tương ứng.

1. Đối chiếu schema/Edge/generated package, thử quyền và rollback trên PGlite rồi staging. Dùng URL, publishable key và Auth issuer cùng project; không gửi JWT production sang staging khác issuer.
2. Xác minh JWT/registered-only, CORS cho origin thử được chọn, hạn mức đọc/ghi, lỗi hết phiên. Chặn client truy cập bảng/RPC đặc quyền; secret chỉ ở server/Vault.
3. Lắp tick/Vault staging; kiểm phòng hết hạn hoặc hết lượt vẫn được giải quyết khi đóng mọi tab. Ghi timestamp, độ trễ, HTTP lỗi và dọn dữ liệu thử.
4. Tách pilot online khỏi thưởng launcher; kiểm reload/remount kết quả không tạo yêu cầu nhận XP/coin. Trước khi bật thưởng sau này, thiết kế match ID + receipt theo account + verifier/idempotency bền vững phía server.

**Đạt khi:** staging health/Auth/schema/tick có bằng chứng thật; anonymous/bad token/bad origin bị từ chối phù hợp; frontend không chứa secret; không phát thưởng chung; bot không bị ảnh hưởng. Online production vẫn false.

### WC-ON2 · BACKLOG sau ON1 · tạo phòng và vào phòng riêng · 1–2 ngày

**File:** `OnlineRoom.tsx`, `online-client.ts`, `online-platform.ts`, `server.ts`, `tests/word-chain/online.test.ts` và server/Edge tests.

**Luồng:** đăng nhập → chọn số ghế → tạo phòng → sao chép mã → tài khoản B nhập mã → lobby cập nhật → chủ phòng bắt đầu/đầy phòng tự chuẩn bị.

- Kiểm mã sai/không tồn tại/đóng/đầy, nhập thường/khoảng trắng theo quy tắc chuẩn hóa; thông báo dễ hiểu, thử lại không tạo ghế trùng.
- Người vào sau thấy đúng chủ phòng, số ghế, ready và thời gian; nút Start chỉ hợp lệ từ 2 người và đúng quyền.
- Chốt rõ leave của host, người còn lại, phòng cuối cùng trống; đối chiếu server contract và sửa UI/logic nếu chưa khớp. Không tự thêm kick/password/chat vào đợt này.
- Chặn double click/request đang chạy; nhận lại cùng phòng khi response thất lạc.

**Đạt khi:** 2 tài khoản thật tạo/join/start được; fixture bao phủ 2/3/4 ghế, join đồng thời, host leave, mã đầy/hết hạn. Có ảnh desktop/mobile của lobby và lỗi; mọi tab thấy cùng danh sách.

### WC-ON3 · BACKLOG sau ON2 · ghép trận và hủy tìm · 1 ngày

**File:** queue/match trong `server.ts`, store/schema, `OnlineRoom.tsx`, client và tests.

- Ghép đúng FIFO vào phòng hợp lệ, tối đa 4 người, không ghép với bản thân hoặc nhân đôi ghế từ nhiều tab.
- Hiện số người và thời gian chờ; 2 người chờ đủ 20 giây thì bắt đầu, đủ 4 bắt đầu sớm theo contract.
- Hủy tìm trả ghế thật; xử lý race hủy/được ghép, double click, timeout/retry và resume cùng account. Không để queue âm thầm chạy sau khi người chơi đã thoát.
- Chưa đủ 2 người thì tiếp tục chờ và cho hủy; không giả người thật bằng bot.

**Đạt khi:** test đồng thời xác nhận FIFO/one-seat/cancel, 2–4 account thật ghép và hủy đúng, không còn ghế mồ côi sau expiry. Có số request/độ trễ để đánh giá polling trong quota hiện có.

### WC-ON4 · BACKLOG sau ON3 · PK, đầu hàng, kết quả và tái đấu · 1–2 ngày

**File:** `OnlineRoom.tsx`, `MatchView.tsx`, `rules.ts`, `server.ts`, client và tests.

- Nối từ hợp lệ/sai/lặp, gửi ngoài lượt, gửi sát giờ, retry cùng request ID: server quyết định duy nhất; client đồng bộ lại khi version đổi.
- Xác nhận bỏ cuộc hiện gọi `onExit`→`leave`; server leave trong trận đã tính forfeit. Callback `onForfeit` riêng rỗng không có nghĩa nút vô hiệu. Kiểm toàn chuỗi/ACK/retry, không thêm hai lệnh cạnh tranh; nếu cần tách đầu hàng và rời thì chốt UX rồi sửa có regression. Kết quả/xếp hạng phải cập nhật cho mọi client.
- Kiểm loại người, chuyển lượt, người xem còn lại, hạng cuối, lý do kết thúc; tất cả client cùng kết quả. Không lấy đồng hồ client làm nguồn chân lý.
- Tái đấu đủ phiếu, thiếu phiếu/hết 60 giây, người rời giữa lúc vote; trận mới không mang từ/giờ/receipt cũ.

**Đạt khi:** hoàn thành thật format 2/3/4 người; fixture race/timeout/forfeit/rematch qua; đóng toàn bộ client giữa trận vẫn được tick xử lý. Thưởng chung còn tắt nếu chưa có verifier/receipt bền vững.

### WC-ON5 · BACKLOG sau ON4 · mạng, phiên và bàn phím · 1–2 ngày

**File:** platform/client/room UI, auth integration, tests online/UI.

- Phân biệt reload/mất mạng ngắn để giữ ghế 90 giây với chủ động Exit để rời phòng; kiểm đường Exit ở launcher, không chỉ nút trong game. Dừng polling/listener và bỏ response cũ khi unmount.
- Offline → reconnect, background → focus, token refresh/hết hạn, logout xuyên tab, A→B khi request đang bay. Resume key theo UID không trao phòng/ghế A cho B.
- Hạn mức/mã lỗi/HTTP timeout có trạng thái phục hồi và nút thử lại; không lặp request vô hạn, không hiện nhầm thành công.
- Telex/VNI/IME, submit trong composition, mobile keyboard/safe area/dọc-ngang, copy mã; không đổi luật từ điển để che lỗi nhập liệu.

**Đạt khi:** regression stale response/auth/cleanup qua; có phiên thật và ít nhất 2 thiết bị/2 mạng. Ghi riêng ca fixture, browser mô phỏng và điện thoại thật.

### WC-ON6 · BACKLOG sau ON5 · nghiệm thu và mở online có kiểm soát · 1–2 ngày + lịch người chơi

- Chạy tối thiểu 10 trận mỗi format 2/3/4 người và soak 30 phút, có rời/rejoin/hủy queue/rematch; không vượt quota/tạo chi phí ngoài phạm vi đã duyệt.
- Báo cáo lỗi Edge/tick, độ trễ đồng bộ, ghế tồn, request/account, kết quả trùng/lệch và phần thưởng. Không còn lỗi mất lượt/chiếm ghế account khác/nhận thưởng lặp.
- Chạy đủ CI đúng SHA; build thử online bằng môi trường đã kiểm. Viết runbook tắt online, hủy tick staging/dọn fixture, giữ bot và save tương thích.
- Chỉ đề xuất mở production sau khi các gate đạt và có quyền môi trường cần thiết. Không cần migration catalog production chỉ để game xuất hiện: WC-L0 đã dùng bundled catalog. Plan này không cho phép chạy SQL production.

**Đạt khi:** báo cáo `.md` có SHA/build/backend, số ca thật, ảnh, giới hạn, rollback; phân biệt đã code/merge/deploy/nghiệm thu. Nếu chưa đủ thiết bị/người chơi thì giữ WAITING, không bật flag để coi là xong.

## Kiểm tra và cách tiếp quản

Mỗi task lấy đúng mục của plan; ước lượng trên là công triển khai/kiểm tra, không phải ngày hẹn và có thể đổi sau ON1. Nhánh riêng theo module, commit/push; không gom cả online thành một PR khó kiểm.

- Logic/schema/Edge: `npm run test:word-chain`, `npm run test:sql`, package generation phải sạch; thêm regression đúng hành vi thay đổi.
- UI: `npm run test:word-chain-ui`, quan sát bản chạy create/join/queue/PK trên desktop/mobile; mock không thay kiểm server thật.
- Launcher/Auth/art liên quan: chạy suite tương ứng; full CI trước merge. Không tắt/nới test để xanh.
- Sau mỗi ON: ghi bằng chứng vào `docs/qa/`, cập nhật thẻ; COMPLETED tóm tắt 5–8 dòng, WORKLOG≤3 mục, archive giữ chi tiết, bàn giao nêu một bước tiếp. Tài liệu mới dùng `.md`.

**Bước đầu đề xuất:** WC-ON1, rồi hoàn thành lát cắt 2 tài khoản tạo phòng → nhập mã → PK → thoát trước khi mở rộng ghép trận 4 người. Không chặn lát cắt đầu bằng tính năng chat, bảng xếp hạng mùa hoặc monetization chưa được yêu cầu.
