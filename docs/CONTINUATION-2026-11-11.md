# Kế hoạch tiếp tục ArcadeX — 11/11/2026

## Mục tiêu

Hoàn tất các phần dở trên main `9061bfd`, chuẩn bị quảng cáo Google; **hoãn commerce, thanh toán và thuê game** theo yêu cầu chủ dự án. Không gỡ nền tảng commerce đã có, không bật các flag đang tắt. Plan không cấp thêm quyền SQL production, mua dịch vụ hay tự phát hành.

Nguồn và phần chưa merge: [merge audit](qa/MERGE-AUDIT-2026-11-11.md). Quảng cáo: [plan](ads/GOOGLE-ADS-PLAN.md), [vị trí](ads/PLACEMENTS.md). Tra task ngắn qua [PROJECT-PLAN](PROJECT-PLAN.md).

## Thứ tự thực hiện

| Đợt | Công việc | Đầu ra / phụ thuộc |
|---|---|---|
| 0 | BASE-01 bàn giao, QA-ENV runner, ONLINE-V1 kiểm sau PR21 | Đúng nguồn và bằng chứng, không làm lại release đã xong |
| 1 | AD-01 nội dung/site readiness → AD-02 slot mock | Làm trước trong lúc chờ account hoặc thiết bị; chưa có ads thật |
| 2 | Snake R0a → R0b → R1 → R2 | Giữ Snake là ưu tiên nội dung; kiểm save trước thêm nội dung |
| 3 | WC-ON5/ON6, TC-R1; TC-R2 port phần cần thiết từ P2 | Thiết bị/mạng thật và staging; lỗi chặn chơi hoặc mất dữ liệu được xử lý ngay |
| 4 | Duel staging → Chess → Xiangqi → Caro → pilot | Cutover từng game, giữ AI/local/save |
| 5 | QA/polish từng game; test cũ, art và nợ kỹ thuật | Có repro trước khi sửa; không viết lại đồng loạt |
| Theo duyệt | AD-03 bật thật → AD-04 đo; AD-05 H5 tùy chọn | Google duyệt site, consent và lịch phát hành |
| Hoãn | CM1–CM4, checkout, gói thuê, cổng thanh toán | Không nằm trong lượt triển khai tiếp theo |

Ước lượng dưới đây là **ngày công kỹ thuật**, khoảng 6–8 giờ/ngày, không phải lịch cam kết. Thời gian chờ Google, account, thiết bị và người chơi không nằm trong số này. Mỗi story nên đóng trong 0,5–2 ngày; task lớn chia tiếp trước khi code. Các nhóm việc độc lập không phải yêu cầu chạy nhiều agent.

## Đợt 0 — nguồn và kiểm chứng

| Task / công | Việc và file đích | Điều kiện hoàn tất |
|---|---|---|
| BASE-01 / 0,5 ngày | Fetch remote; cập nhật SESSION-HANDOFF, PROJECT-PLAN, OWNER-TODO; lưu archive | Có audit ba nhánh còn lại, phân biệt code/merge/deploy/nghiệm thu. Phần plan của lượt này hoàn tất khi checker qua |
| QA-ENV / 0,5–1 ngày | Tests UI Tank/Nối Từ, tests/smoke/offline-shell.cjs, playwright.config.ts | Fixture dùng HTTP local khi Chromium chặn file://; giữ assertion. Xác minh offline qua reload với browser đúng CI và thiết bị thật; không sửa app chỉ để chiều harness |
| ONLINE-V1 / 0,5 ngày + phiên thật | Runbook hiện hành, client hai game, server/tank-clash-room | Xác minh frontend/backend SHA và profile; health/WSS; hai account tạo/join/ready/leave và hủy queue. Lưu body lỗi khi gặp 503/403/409, không lưu token |

PR21 đã merge/phát hành; việc cần làm là kiểm sau sửa. CI hoặc screenshot cũ không chứng minh dịch vụ đang khỏe. Nếu không truy cập Render, ghi WAITING với blocker và tiếp việc local độc lập; không đổi CORS/JWT/SQL hay redeploy để thử vận may.

## Đợt 1 — quảng cáo Google

| Task / công | Việc | Điều kiện hoàn tất |
|---|---|---|
| AD-01a / 0,5 ngày | Owner tạo AdSense, chọn domain đang kiểm soát, thêm/xác minh site | Có trạng thái thật trong Google Sites; không bịa publisher ID hoặc hứa ngày duyệt |
| AD-01b / 1–2 ngày | About/Contact/Privacy; hướng dẫn game gốc, public và crawl được; kiểm license | URL HTML thật, nội dung hữu ích và liên hệ do owner xác nhận; privacy phản ánh dữ liệu thực |
| AD-02a / 1 ngày | Module ads riêng: policy, loader single-flight, fake provider, flag off | Thiếu ID/consent hoặc đang chơi thì không request; lỗi ads không chặn game |
| AD-02b / 0,5–1 ngày | Desktop AD-L1, mobile AD-L2; AD-G1 sau khi có guide | 320–1440px không tràn, không che Chơi/filter/mobile nav; khung mẫu chỉ ở preview |

Có thể làm AD-01b/AD-02 trong lúc chờ Google. AD-03 chỉ bật thật khi site Ready, ID và consent đủ. [Thẻ ADS](plans/ADS.md) có file đích và test; không dùng display ad bọc modal để giả preroll hoặc rewarded ad.

## Đợt 2 — Snake Legend

| Task / công | Việc / file đích | Acceptance criteria và kiểm |
|---|---|---|
| SN-R0a / 0,5 ngày | src/preview/snake, cấu hình Vite preview, tests Snake | Route/deep-link/noindex/flags và lazy graph đúng; 6 suite + package test qua. Đo lại chunk 1,917 MB raw / 1,346 MB gzip; chưa thêm registry |
| SN-R0b-1 / 1 ngày | SnakeLegendPreview, integration save-policy/host/session | Qua UI thật: login → chơi → thắng → save → reload; stage, tài nguyên và owner phục hồi đúng |
| SN-R0b-2 / 1 ngày | cloud-campaign, save-hooks và Auth binding | Lost ACK/retry không nhân thưởng; offline → online; logout/account swap/JWT expiry không ghi save sang account khác. Cần hai account/staging |
| SN-R2a-size / 1–2 ngày | Import assets/audio/sprites, chia gói Vite | Lazy theo world/audio hoặc external assets; đo trước/sau và lập budget. Không nâng ngưỡng CI để qua; giữ hình, âm thanh, hash và lazy loading |
| SN-R1a / 1 ngày + thiết bị | Input/canvas/safe area/audio/cleanup | Android Chrome, iOS Safari, desktop: đa chạm, xoay, ẩn tab, khóa màn hình, mute. Soak 30 phút; ghi FPS/memory/listener/RAF và máy thực |
| SN-R1b / 1–2 ngày + playtest | 10 màn R01, Nhện Mẹ, journey/props/audio | Chơi đủ 10 màn qua UI; lưu/reload ở boss, mục tiêu/checkpoint đọc được. Chỉ sửa lỗi cụ thể, chưa mở map/shop mới |
| SN-R2a/b / 1 ngày + duyệt | Catalog/adapter/gameUiPolicy/package assets, candidate release | Chốt free/save/reward; full CI, ảnh mobile, pilot và đường lui. Chỉ đưa ra sảnh khi owner chọn phát hành; không bật XP/xu chung để qua test |

Art/icon/banner đã có. Không làm lại cloud hydrate từ ghi chú lịch sử. Chi tiết giữ ở [Snake](plans/SNAKE.md); runner service không thay UI thật hoặc điện thoại.

## Đợt 3 — Nối Từ và Tank

| Task / công | Việc / file đích | Điều kiện hoàn tất |
|---|---|---|
| WC-ON5a / 1 ngày | OnlineRoom/online-client/online-platform và Auth integration | Exit launcher gửi leave đúng một lần; refresh/drop/lost ACK/retry không giữ ghế ma. Logout/account swap cô lập; membership hết hạn dọn resume key/notice |
| WC-ON5b / 0,5–1 ngày + thiết bị | MatchView/input/mobile layout | Telex/VNI/composition/Enter không mất dấu hoặc gửi hai lần; bàn phím mềm không che input/timer ở 320–430px |
| WC-ON6 / 1 ngày + phiên thật | Scheduler/staging QA và mạng | Đóng mọi client giữa lượt → cron xử timeout; ≥10 trận mỗi format đang nghiệm thu, hai thiết bị/hai mạng, soak 30 phút. Gate người thật 3–4 người đã được user bỏ; không mở lại hoặc tính fixture là người thật |
| TC-R2a / 1 ngày | protocol/room/net-client, trust/resume | Đối chiếu P2 bdc6f85 với P3; dựng repro input/snapshot cũ qua hiệp, control ACK mất/duplicate, resume khác endpoint. Không làm lại watchdog/stale socket đã có trong PR21 |
| TC-R2b / 1–2 ngày | Cùng file và hợp đồng deploy | Port epoch/control receipt/resume binding còn cần; giữ 1v1/2v2/party/queue/spectator. Đổi wire thì đổi version, plan server/client cùng đợt và phục hồi; không merge nguyên P2 |
| TC-R1a / 1 ngày + phiên thật | Room server/netcode và báo cáo QA | ≥10 trận 1v1 và 2v2; drop/resume, ready, surrender/rematch, token; hai thiết bị/hai mạng cùng HP/giờ/kết quả. Ca account A/mã B user để sau vẫn deferred |
| TC-R1b / 1 ngày + backend | Soak/health/ops trong cap 16 Free | 30 phút, đo RTT/băng thông/CPU/RAM/rooms/socket; restart/cold start và UX. Không tự nâng gói; phản ánh đúng việc RAM state mất khi restart |
| TC-R3 / 1–2 ngày khi chọn | Server onResult + DB receipt, test staging | Nếu mở lưu kết quả/thưởng: match ID unique, credit atomic, retry/reconnect/replay không nhân thưởng. Tách khỏi checkout; SQL production cần phạm vi riêng |
| TC-R4 / từng task ≤2 ngày | Renderer/CSS/audio/art pipeline | Xe/đội đọc được ở mobile, BOT rõ, mute/exit sạch; hình trước/sau, bundle và QA. 3v3/4v4 vẫn backlog |

WC kiểm `test:word-chain`, UI và SQL; Tank kiểm logic, WS/ops, UI và launcher/motion liên quan. Full CI trước merge code; loopback không thay Internet/thiết bị thật. [Nối Từ](plans/WORD-CHAIN.md), [Tank](plans/TANK-CLASH.md).

## Đợt 4 — Duel server cho ba game cờ

1. **DU-R0, 1 ngày:** schema/function/tick staging, fixture hai client, flag off. Kiểm membership/CAS/idempotency/presence/timeouts và denial probes.
2. **DU-R1-Chess, 1–2 ngày:** nối DuelClient sau flag; nước đi, chiếu hết/phong cấp, đồng hồ, draw/surrender/drop; giữ AI/local/save. Hai UI cùng kết quả.
3. **DU-R1-Xiangqi, 1–2 ngày:** thêm các tình huống đối mặt tướng, chiếu và tắc quân theo engine hiện hành; không đổi luật hoặc save.
4. **DU-R1-Caro, 1 ngày:** bàn 15×15 theo luật hiện hành, chặn nước sai/duplicate, timer/result phía server.
5. **DU-R2, 1 ngày + hai account thật:** pilot từng game, reload/logout/expiry/disconnect; flag off quay về luồng cũ. Chỉ bỏ service/type cũ khi hết consumer và cutover ổn.

File và runbook trong [Duel](plans/DUEL.md). Kiểm duel, duel-server, SQL, UI mới và 24 game smoke. Queue/rematch/chat/Elo server là scope sau, không lẫn vào cutover.

## Đợt 5 — QA từng game và bảo trì

Mỗi hàng bắt đầu bằng GP-R0 điều tra khoảng 0,5 ngày; có repro mới tách GP-R1 bugfix ≤2 ngày. Ghi chú cũ không mặc định là lỗi hiện tại.

| Game | Lát cắt cần chơi/đo | Xong khi |
|---|---|---|
| Battleship | Touch board/focus/modal, online hai account, máy yếu | Tap đúng ô, ready/result/reconnect đúng; đo CPU/FPS cùng kịch bản |
| Dungeon Titan | Loop/equipment/save/boss/touch | Equip/forge/target/save không mất hoặc nhân item; đọc được ở 320–390px |
| Block Breaker | Boss/hitbox/crop; mẫu theo world trong campaign 96 màn | Không cắt sprite/sai hitbox; nguồn ảnh full-res xác minh; progress/reload đúng |
| Blossom | Tutorial → level → result/save, boss/pacing | Giữ 55 UI cases; art phụ chờ nguồn/duyệt, không thay đồng loạt |
| Boom Buddies | Combat/input/Pip, khó và pacing | Touch không che nhân vật; pause/mute/exit sạch; người chơi kiểm nhịp độ |
| Cosmic Defend | Escort/boss/mật độ đạn/FPS | Replay cũ vẫn xác minh; không xóa legacy engine đang dùng |
| Eat Em All | Tốc độ rơi/touch/Fury/boss/economy | Không nhân reward; cảm giác được chơi thật, không lấy oracle win rate làm playtest |
| Neon Run | 40 màn/checkpoint/star/boss | Kiểm đủ năm world, đường đi/save đúng; nội dung mới là task riêng |
| Rainbow | iOS Safari/gamepad/replay/local save | Input/save/replay đúng; online/BXH/theme động vẫn Phase 2 |
| Puzzle còn lại | Car Escape/Shikaku/Word Cross/2048/Blocker/Sudoku/Fill/Draw/Mummy | Engine/solver qua; chơi → pause/save/reload/exit đúng; 320px không tràn |
| Chronicles | Standalone 96 màn, quan hệ với Block Breaker | Browser/local save được kiểm; chưa thêm vào launcher/account/reward như game mới |

MT1 sửa test cũ auth-entry-screen/import.meta/fixture ngoài repo bằng hành vi thật. MT2 art/banner có nguồn/license, so trước/sau. MT3 chỉ tách phòng dùng chung sau khi chốt hợp đồng, chuyển từng game và giữ ba bộ test. MT4 đo Git rồi đề xuất; không rewrite/LFS khi chưa duyệt. [Game polish](plans/GAME-POLISH.md), [bảo trì](plans/MAINTENANCE.md).

## Hai lượt đầu nên giao

- Lượt 1: QA-ENV + ONLINE-V1; trong thời gian chờ account/Render thì làm AD-01b/AD-02 mock.
- Lượt 2: SN-R0a → SN-R0b-1/2 và đo asset. Chờ AdSense không chặn Snake.

Mỗi task có nhánh, nguồn, file, AC, test, ảnh nếu sửa UI và giới hạn chưa kiểm. Cập nhật WORKLOG/COMPLETED/bàn giao theo WORKFLOW. Trước merge kiểm main mới và CI đúng head. Plan và mock hiện tại không đồng nghĩa quảng cáo đã tích hợp hoặc đang kiếm tiền.
