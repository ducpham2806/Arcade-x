# Nối Từ — ra sảnh và hoàn tất online

Mốc08/11/2026: **WC-PUBLIC đã phát hành**. PR19 merge256620c/full CI29; PR20 head970a941/full CI32 success, merge086d6ac; NetlifyPublished đúng086d6ac. Backend production đã áp/probe theo gói user duyệt, online=true. Không viết lại phòng hoặc chờ bật flag nữa. [Bằng chứng cuối](../word-chain/PUBLIC-RELEASE-2026-11-08.md).

## WC-L0 · DONE · phát hành bot/offline và artwork

Chủ dự án đã duyệt đưa game ra sảnh với icon/banner. PR#18 có bundled-free, policy server giữ ưu tiên;2master ImageGen, icon512/banner1280×640, URL hash/offline package. Local lint/build/bundle/fast, engine36check và CUA desktop/phone qua, gồm controls320/360/375/390. [Báo cáo](../qa/WC-L0-2026-11-07.md).

- Full CI24/run42342747871/head5882adf success sau bổ sung focus/caret/value fixture; Word Chain5/5/Tank13/13/generated clean qua. PR18 merge3f943d9; Netlify deploy6aeebb61665214227ba314ef Published; CUA sảnh/menu/bot/exit và4JS+2ảnh byte-match. CI24không lưu ảnh vì suite sau dọn output; giới hạn ở báo cáo.
- Ở mốc WC-L0 giữ online=false, không SQL/catalog production; WC-PUBLIC08/11 đã bật online theo quyền riêng. Game_Studio_Agent vẫn đủ116skill/21role/297blob; đọc theo nhiệm vụ.

## WC-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu mới: [plan phòng/ghép trận/PK](../word-chain/ONLINE-PLAN.md). Plan dựa source5a64fef; là lịch triển khai, chưa phải bằng chứng server đã deploy. Mỗi phiên chỉ đọc mục task đang làm.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| WC-ON1 | ĐÃ KIỂM staging pilot | Auth/schema/Edge/CORS/cron; tự đóng room vắng client, thưởng tắt; chưa no-client turn |
| WC-ON2 | ĐÃ KIỂM hai account | Tạo/join/start2/cap4, mã sai/đóng, host transfer/rời; full/race có fixture |
| WC-ON3 | PILOT2account qua; user bỏ gate3/4 | Hủy/tìm lại/trả ghế/resetcountdown20s qua; FIFO/one-seat có fixture |
| WC-ON4 | PILOT2account qua; user bỏ gate3/4 | Server nhận từ, đầu hàng/timeout/kết quả, đủ phiếu tái đấu qua |
| WC-ON5 | BACKLOG tiếpQA; lát cắt lỗi08/11 đã phát hành | Mạng/reload/Exit/Auth/account swap/IME và mobile |
| WC-ON6 | BACKLOG sau ON5 | ≥10trận mỗi format,2thiết bị/2mạng,soak30phút, cutover/rollback |
| WC-PUBLIC | DONE phát hành08/11 | Backend/flagtrue/CI32/merge086d6ac/NetlifyPublished; public tạo-rời phòng, vào-hủy queue qua |

**Khoảng trống cụ thể:** pilot đã bỏ online `submitScore`; cần receipt bền vững trước mở thưởng. Bỏ cuộc qua `onExit`→leave/server forfeit đã có regression UI, không thêm lệnh trùng. Đã sửa cleanup/response muộn/mất ACK, còn kiểm Exit launcher, logout/đổi account bằng phiên thật.

**File đích:** `src/games/word-chain/{OnlineRoom,MatchView,online-client,online-platform,server,rules}.ts(x)`, `supabase/functions/word-chain-room/`, `supabase/word-chain/`, scripts package và `tests/word-chain/`. Hợp đồng/AC/ước lượng/bằng chứng từng task trong plan chi tiết. [Runbook backend](../WORD-CHAIN-SERVER.md) chỉ mở khi làm ON1; ưu tiên AGENTS hiện hành.

**Kiểm:** `test:word-chain`, `test:word-chain-ui`, `test:sql`, generated clean; full CI trước merge. Fixture/PGlite không thay nhiều account/Edge/tick/thiết bị thật. Kết quả server và biên nhận bền vững cần có trước XP/coin; không tự thêm bot vào queue người thật.

## Phạm vi cũ được sắp lại

WC-R0 catalog: WC-L0 giải quyết hiển thị bằng bundle; migration/history staging chỉ khi backend cần, không là điều kiện để game hiện sảnh. WC-R1 chuyển thành ON1–ON4; WC-R2 thành ON5–ON6. Quyết định#7 public online và #8 bot đã duyệt; xem [PENDING-DECISIONS](../PENDING-DECISIONS.md).

**Còn lại:** ON5/ON6 (mạng/Exit/Auth/account swap/IME/mobile,2thiết bị/2mạng/soak và no-client turn timeout). User bỏ gate nghiệm thu thật3/4người, không nhận đã qua; fixture4ghế/CI còn nguyên. Online chưa thưởng XP/xu, cần receipt bền vững trước mở. Sau checkpoint WC-PUBLIC, ưu tiên roadmap tiếp Snake; không bắt đầu task mới khi bàn giao chưa xong.

**Quyền08/11:** user yêu cầu merge/public và đã duyệt riêng schema/cron/Vault/function/CORS/JWT cho productionwhjatkhhupeqfngakmee. Gói đã áp; không hỏi lại hoặc mở rộng exception sang script khác. Backend/nguồn/UI public đã xác nhận; đây là phát hành lát cắt phòng/PK/queue, không đóng toàn bộ ON5/ON6.

## Yêu cầu triển khai · 07/11/2026

Chủ dự án yêu cầu phòng riêng/PK trước→matchmaking; PR19, nền3f943d9+19afc84. WC-LEX34.512từ/nguồn/checksum/giấy phép, giữ từ cũ/3.011opener; URLhash/revision và50check/CI28qua. Staging schema/Edge/CORS/JWT handlerAuth/cron đã cài theo quyền user; hai account đã kiểm phòng riêng trước rồi queue/PK/rematch. [QA mới nhất](../qa/WC-STAGING-2026-11-08.md), [nguồn](../qa/WC-ONLINE-2026-11-07.md). Sau pilot đã merge/phát hành bộ từ mới và online trong WC-PUBLIC08/11; giữ cấm SQL production ngoài exception đúng gói đã duyệt.

## ONLINE-ERROR · đã phát hành client · 08/11/2026

PR21/fullCI36head47649f9success đã merge9061bfd, NetlifyPublished và2bundlebyte-match. NốiTừ đã xử lý503gateway/mấtmembership,9UI/52check qua; public mới tạo/rờiSSQT7U qua.409cũ thiếubody, chưa phân loại. [Báo cáo](../qa/ONLINE-ERROR-2026-11-08.md).

Tank client deadline/latecallbacks cũng đã phát hành; user giữRenderFree sau lỗi không tự thức khi ngủ. Đã khôi phục thủ công đúngbackendc705100, health/WSS vàroomMB7CU8 qua, đã rời. Không coi cold start đã sửa ổn định; không nâng gói/SyncBlueprint/keep-alive từ quyết định này. ON5/ON6 cònQA, user bỏ gate thật3/4người.
