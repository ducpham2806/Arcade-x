# ArcadeX — kế hoạch công việc · 05/11/2026

Căn cứ: `main@affc5e8`, PR #15, code/config và bàn giao trong repo. CI mốc này qua; trạng thái production/backend chưa kiểm trực tiếp. `[ ]` là chưa nghiệm thu, kể cả phần đã có code. Đây là kế hoạch đề xuất; không tự mở rộng phạm vi P3 đã duyệt thành phê duyệt hosting, thanh toán hay phát hành.

Cập nhật 05/11: FX1/TC1 đã có bản sửa/test cục bộ, vẫn chờ duyệt. TC2 trên `codex/tank-clash-tc2-readiness`: Render Free/review `3950abb` đã Live, 4 tester staging; 17 WS/ops + 11 UI và một phiên thật tạo/rời phòng qua. Còn trận nhiều người, hai mạng/thiết bị và tải Render; xem `tank-clash/TC2-review.md`. Không deploy Netlify trước khi duyệt.

## 1. Thứ tự và cách chia đợt

| Đợt | Đầu ra | Phụ thuộc / ai xử lý |
|---|---|---|
| D0 (lần này) | Kế hoạch, lối đọc ngắn, lịch sử nguyên vẹn | Đã hoàn tất, bằng chứng trong WORKLOG/archive |
| A | TC1: UI online 2v2, bản thử để duyệt | Code/test cục bộ xong; chờ chủ dự án duyệt; QA1 độc lập |
| B | TC2: hosting + thử mạng thật; WC1/WC2 và DU1 trên staging | Chủ dự án chốt #1/#4/#7/#8/#9; kỹ thuật chuẩn bị trước khi triển khai |
| C | TC3/TC4: tích hợp + QA để xin duyệt phát hành | TC1 + TC2 đạt; art dựa trên phản hồi gameplay |
| D | CM1 → CM2 → CM3/CM4: commerce pilot | #1/#2/#3, phục hồi và xác thực admin thật |
| Duy trì | QA2/ART1/TD1–TD3 | Theo lỗi/ảnh hưởng; không chặn TC1 trừ lỗi nghiêm trọng |

Đường phụ thuộc Tank: **TC1 → TC2 (UI + nghiệm thu thật) → TC3 → TC4 → duyệt phát hành**. Chọn hosting/chuẩn bị TC2 thực hiện song song lúc làm TC1. Không chờ commerce để thử Tank; không gộp các lần bật backend thành một đợt production lớn.

Một đợt kỹ thuật nên vừa một thay đổi có thể review/test/commit. Chưa hứa ngày hoàn tất: hosting, merchant và lịch chơi thật chưa có. Khi bắt đầu từng task, chốt phạm vi với code hiện tại; tách đợt nếu lớn, không giảm tiêu chí để kịp lịch.

## 2. Tank Clash

### TC1 · P3d — code/test cục bộ xong, chờ duyệt

- [x] Thêm lối vào 1v1 riêng / 2v2 riêng / tìm trận 2v2; dùng API hiện hành `room.ts`/`net-client.ts`, protocol `tank-clash.p3.v1`.
- [x] Sảnh 4 ghế: mã/link mời, chuyển đội, chủ phòng xếp ghế, ready, người xem; không bắt đầu thiếu người, không bot online.
- [x] Hàng chờ người lẻ/tổ: đồng hồ, số người, hủy luôn thấy; sau 60 s cho đợi tiếp hoặc rời hàng để luyện bot **cục bộ**. Hiển thị đăng nhập cần thiết cho hàng chờ.
- [x] HUD 4 xe, HP/đội/tên, viền xe mình; báo đồng đội rớt/rời không chặn trận. Người xem không có điều khiển.
- [x] Kết quả theo server, đánh dấu bỏ trận, đầu hàng đúng điều kiện; đấu lại phòng riêng/phòng ghép theo đặc tả, hết hạn 20 s không chờ vô tận.
- [x] Bổ sung test server/UI 4 trang; ảnh 1280×760, 390×844, 844×390; tạo `docs/tank-clash/P3-review.md` **sau khi có kết quả thật**.

**Bằng chứng:** `tank-clash/P3-review.md`; 66 core, 6 WS, 9 UI; ảnh 3 viewport. Còn nghiệm thu cảm giác chơi và TC2 trên thiết bị/mạng thật.

**Đầu ra:** bản preview + code/test + báo cáo P3, không đưa vào catalog. **Nghiệm thu:** D1–D7 trong `tank-clash/P3-SPEC.md`; cả 4 client cùng kết quả; tổ không bị tách; hủy/mất mạng/đấu lại đúng; 1v1 cũ không hỏng; modal đúng AGENTS.
**Kiểm tra:** lint, build, bundle, test:fast, test:tank-clash-server, test:tank-clash-ui; thêm smoke/modals khi chạm launcher/khung modal. Giữ đo băng thông ≤20 KB/s/client; hiện 19,3 sát trần, không thêm snapshot tùy tiện.

### TC2 · Hosting, tài khoản, mạng thật

**Phụ thuộc:** #9 cho đăng ký/triển khai, staging cho tài khoản; TC1 trước nghiệm thu UI 2v2.
- [x] Đề xuất VPS hỗ trợ WS dài hạn: [TC2-RUNBOOK](tank-clash/TC2-RUNBOOK.md), giá/khu vực, template WSS/systemd/env, health/metrics/log/restart/rollback, package + preflight đã kiểm cục bộ; chưa đăng ký/deploy VPS.
- [x] Tạo Supabase staging riêng theo chủ dự án: Nam A Uniform, Singapore; metadata/Auth endpoint/public schema/advisors đã kiểm, ref ở [TC2-review](tank-clash/TC2-review.md); không dữ liệu/migration production.
- [x] Chuẩn bị gate Auth/tester/origin/cap/metrics/restart, 15 WS/ops + 9 Chrome UI qua; local WSS và soak 30 phút (204 trận 1v1/167 trận 2v2) có báo cáo nguồn/số đo/giới hạn ở [TC2-review](tank-clash/TC2-review.md).
- [x] Profile Render Free/Singapore/Node24/một process, exact frontend origin Netlify, metrics public tắt; schema Blueprint hợp lệ. Đã deploy, chưa chạy lại soak trên Render.
- [x] Review/backend `3950abb` Live, HTML public khớp build; WSS/TLS/origin/token giả qua; 4 tester staging đã xác nhận. Login/refresh/logout/đổi tài khoản/backend cố định: 17 WS/ops + 11 UI; một tester thật tạo/rời phòng và mã phòng cũ bị từ chối.
- [x] Staging review có exact origin/WSS, Supabase Auth thật + UUID tester phía server, không token ra host ngoài allowlist. Review không dùng cờ khách; entitlement sản phẩm/launcher vẫn thuộc TC3.
- [ ] Chạy 2 tài khoản staging; thử token sai/hết hạn, trùng tài khoản, spectator, reconnect đúng ghế/HP; không ghi log token.
- [ ] ≥10 trận mỗi quy mô 2/4 người, hai thiết bị/hai mạng; bao gồm phòng riêng và hàng chờ. Ghi RTT, jitter/loss nếu đo được, hiệu chỉnh xe, kết quả, tab/khóa màn hình, reconnect.
- [ ] Soak ≥30 phút trên backend đích (Render/VPS), load tăng dần và đo giới hạn thực: CPU/RAM, số phòng/socket, băng thông, listener/timer; thử restart (hiện trận/hàng chờ trong RAM sẽ mất), ghi giới hạn phục vụ và cách báo người chơi. Kết quả loopback ở trên chưa thay bước này.

**Đầu ra:** runbook + URL staging + báo cáo đo, không chứa secret. **Nghiệm thu:** auth/origin đúng, không lệch HP/hiệp/kết quả; không nhân ghế; tài nguyên không tăng vô hạn; công khai rủi ro restart. Chỉ làm lag compensation khi số đo/phản hồi chứng minh cần.

### TC3 · P4 — tích hợp sản phẩm

**Phụ thuộc:** TC1/TC2 đạt, chủ dự án chấp thuận hướng gameplay.
- [ ] Adapter launcher: tải gói, pause/mute/exit, cleanup socket/timer/RAF, lỗi kết nối; catalog/registry/packageAssets/art đồng bộ.
- [ ] Quyền chơi và kết quả do backend xác nhận, ghi một lần theo match ID; nối lại không cấp thưởng trùng, không ghi vị trí/đạn theo tick. Chốt mô hình dữ liệu/thưởng trước khi xây; chưa coi là đã có.
- [ ] Art/VFX/âm thanh sản xuất, phân biệt đội bằng màu + biểu tượng, BOT rõ; giới hạn âm thanh chồng và dừng khi thoát. Đo bundle sau đổi asset.
- [ ] Bổ sung test save/quyền/kết quả và cập nhật 3 test cố định số game khi đăng ký game thứ 24.

**Nghiệm thu:** vào/thoát nhiều lần sạch tài nguyên, quyền đúng, reward không trùng, save cũ giữ được; build/bundle/fast + launcher/game/offline/modal liên quan qua.

### TC4 · P5 — cổng phát hành

- [ ] QA PC/touch, ngang/dọc, điện thoại yếu; người mới hiểu lái/bắn/bật tường trong 60 s (mục tiêu cần đo).
- [ ] Đo FPS: hướng 60, giảm hiệu ứng ≥30; mạng 80/150/250 ms, jitter 30, loss 1–3%; so kết quả giữa máy. Soak/load theo TC2 trên build phát hành.
- [ ] Đóng lỗi chặn chơi/lệch kết quả/quyền/token/rò tài nguyên; đính kèm giới hạn còn lại, runbook và đường lui.
- [ ] Chạy toàn bộ CI trên commit cuối; gửi bản duyệt, chỉ merge/phát hành khi chủ dự án yêu cầu.

P6/P7 (3v3/4v4) và 4 ý tưởng PvP khác giữ backlog; không mở trước khi MVP có bằng chứng chơi tốt.

## 3. Nối Từ và Duel

### WC1 · Nối Từ trong danh mục

- [ ] Kiểm catalog/migration history hiện tại bằng đọc môi trường đích; không suy ra production từ file repo.
- [ ] Thử `20261102090000_word_chain_catalog.sql` trên staging; kiểm không trùng danh mục, quyền và offline/bot vẫn chạy.
- [ ] Chuẩn bị thay đổi catalog/đường lui; chủ dự án xử lý bước production riêng theo #8 và quy tắc AGENTS. Không chạy lại toàn bộ migrations lên project đang dùng.

**Nghiệm thu:** game xuất hiện ở launcher mục tiêu, mở/chơi bot/thoát được, game cũ không mất. Online có thể vẫn tắt; không đánh đồng hai bước.

### WC2 · Nối Từ online

**Phụ thuộc:** #1/#7; WC1 cần cho người chơi vào qua production, không cản thử server staging.
- [ ] Theo `WORD-CHAIN-SERVER.md`: schema staging → test → prepare/deploy `word-chain-room` → Vault + scheduler tick → cờ online chỉ ở build thử.
- [ ] Dùng 2–4 tài khoản thật: tạo/join/ghép, bắt đầu sớm/tự bắt đầu, sai từ/retry, disconnect, tải lại, loại/xếp hạng, rematch, danh tính và quyền.
- [ ] Telex/VNI và bàn phím điện thoại: không mất dấu/submit sớm khi IME đang composing; rà từ thiếu/không phù hợp bằng nguồn từ điển và test builder.
- [ ] Báo cáo kết quả, trình kế hoạch bật và đường lui (tắt flag + build); xác minh scheduler không bỏ phòng cũ treo.

**Kiểm tra:** test:word-chain, test:word-chain-ui, test:sql + smoke/game/offline khi đổi launcher. **Nghiệm thu:** 2–4 người cùng trạng thái, không tự ghi phòng từ client, không lặp lượt/kết quả, bot offline giữ nguyên.

### DU1 · Duel server và cutover UI

**Phụ thuộc:** #1/#4. Đây còn là **tích hợp UI**, không chỉ deploy.
- [ ] Schema staging → prepare/deploy `duel-room` → lịch tick 10–15 s; xác minh quyền và CAS/receipt/presence.
- [ ] Nối `DuelClient` vào Chess/Xiangqi/Caro sau feature flag; đồng hồ, nước đi, timeout, đầu hàng, cầu hòa, reconnect theo server.
- [ ] Hai tài khoản thật/game; thử nước sai/client sửa đổi, gửi lặp, rớt mạng, timeout và đường lui về cờ cũ.
- [ ] Chỉ xóa service/type cũ sau cutover ổn định và không còn consumer; không xóa cùng lúc thử lần đầu.

**Kiểm tra:** test:duel, test:duel-server, test:sql và UI/smoke tương ứng. **Nghiệm thu:** server từ chối nước/kết quả trái luật; hai máy thống nhất. Queue/rematch/chat/Elo chưa có trong phase 1, không hứa kèm.

## 4. Commerce — triển khai sau staging, giữ flag tắt

| Task | Công việc / đầu ra | Điều kiện xong |
|---|---|---|
| CM1 | Chọn staging/admin (#1), kiểm rollout access v2 với 1–2 tài khoản pilot, game free/paid/block/expiry/starter gift | `verify-access-rollout.mjs` + SQL qua; rollout `off` phục hồi được hành vi cũ |
| CM2 | Chọn runtime (#3); repository bền vững cho order/receipt/review/audit, transaction/unique/khóa; adapter session và private permission thật + MFA `aal2`; tách quyền admin RPC cũ | Test tích hợp DB/auth thật, cross-account bị chặn, revoke có hiệu lực ngay, retry không nhân đơn; không dùng ledger trong RAM làm backend thật |
| CM3 | Chọn provider (#2); raw-body signature, sandbox webhook, idempotency, refund/reconcile; tắt/đối soát đường thanh toán cũ trước checkout | Sự kiện giả bị từ chối; replay/out-of-order không nhân payment/grant; refunded/expired không giữ quyền; kiểm luồng merchant sandbox |
| CM4 | Backup DB + object/config, cảnh báo, restore staging cô lập, đối soát sau restore; pilot từng flag theo runbook | Đo RPO/RTO thật (24 h/4 h chỉ mục tiêu đề xuất); không checkout trước khi restore/reconciliation đạt; ghi người vận hành/phục hồi và bằng chứng |

Thứ tự flag/đường lui chi tiết giữ ở `COMMERCE-ROLLOUT.md`; kiểm bảo mật/phục hồi bắt buộc ở `operations/SECURITY-RECOVERY.md` và `server/commerce/README.md`. Không nén các runbook này thành vài câu làm mất bước. CM2 trước orders/review thật, CM3 trước checkout, CM4 là cổng trước nhận tiền; bật từng flag riêng và kiểm lại. Test:sql/commerce/subscriptions + integration adapter thật; Docker khi cần kiểm tranh khóa.

## 5. Chất lượng, art và nợ kỹ thuật

| ID | Việc cụ thể | Kiểm chứng / phụ thuộc |
|---|---|---|
| QA1 | Chạy tái hiện test auth/launcher/Blossom cũ: bỏ chờ `#auth-entry-screen` đã mất; xử lý `import.meta.env` ngoài Vite, bỏ phụ thuộc HTML ngoài repo bằng fixture/build trong repo | Test cũ kiểm đúng luồng hiện tại, không chỉ xóa assertion; chỉ chuyển vào CI sau khi ổn định; không sửa test đang xanh vô cớ |
| QA2 | Review UX Battleship/Nối Từ: modal, chạm, bàn phím, focus, chữ/điều khiển; đo phối cảnh Battleship trên điện thoại yếu | Ảnh/video + FPS/CPU có thiết bị/build cụ thể; so cùng kịch bản, chưa coi CPU ~1,6× trong ghi chú là số đo mới |
| ART1 | Sinh lại icon/banner bằng pipeline để bỏ vệt đen; thêm `sharp` đúng cách nếu thiếu; kiểm manifest/hash/cache và budget | test:artwork, test:bundle + xem ảnh trước/sau; output chỉ sinh bằng script |
| ART2 | Block Breaker ảnh đầy đủ; Blossom biểu cảm/huy hiệu/board; Battleship tàu tùy chọn | Chủ dự án cung cấp/duyệt nguồn, giữ giấy phép; test/screenshot theo game, không chặn TC1 |
| TD1 | Gộp khung phòng Battleship/Duel/Nối Từ: CAS/receipt/presence/store/Edge, giữ adapter luật riêng | Thiết kế trước, đổi từng game; test 3 bộ + schema + UI, không đổi protocol vô ý; làm trước game thứ tư dùng **cùng mẫu Edge/CAS**, Tank WS là hệ khác |
| TD2 | Cập nhật docs cùng mỗi thay đổi, chuyển log cũ nguyên văn, sửa trạng thái/đường dẫn lệch | Một nơi ghi luật/trạng thái/quyết định; checklist đọc ở INDEX; không tự đọc toàn bộ archive |
| TD3 | Đo kích thước Git/assets rồi trình rewrite/LFS/cache/shallow clone | #5 trước rewrite hoặc LFS; không tự viết lại lịch sử; clone shallow không xóa lịch sử remote |

## 6. Hoàn tất một task

1. Đọc AGENTS + handoff + mục log mới nhất, sau đó đúng spec/runbook của task; đối chiếu code và môi trường thực.
2. Ghi phạm vi/phụ thuộc, sửa trên nhánh riêng; test liên quan và giữ bằng chứng kết quả thật (commit/build, môi trường, ca test, số đo, lỗi còn lại).
3. Cập nhật WORKLOG ngay khi xong; handoff giữ bước tiếp theo, decisions giữ quyết định, plan đánh dấu task chỉ khi đạt nghiệm thu.
4. Trước merge: chạy đủ workflow CI trên commit cuối; chỉ merge khi chủ dự án yêu cầu. Bước production và dịch vụ trả phí phải tuân quyết định đã ghi; chuẩn bị xong bản review/runbook trước.
