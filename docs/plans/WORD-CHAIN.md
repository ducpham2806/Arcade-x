# Nối Từ — ra sảnh và hoàn tất online

Mốc08/11/2026: PR19 đã merge256620c; nhánh `codex/word-chain-public-release` chuẩn bị online=true. Staging2account qua, main hiện online=false; backend production đang cài theo exception user đã duyệt riêng. Không viết lại phòng từ đầu.

## WC-L0 · DONE · phát hành bot/offline và artwork

Chủ dự án đã duyệt đưa game ra sảnh với icon/banner. PR#18 có bundled-free, policy server giữ ưu tiên;2master ImageGen, icon512/banner1280×640, URL hash/offline package. Local lint/build/bundle/fast, engine36check và CUA desktop/phone qua, gồm controls320/360/375/390. [Báo cáo](../qa/WC-L0-2026-11-07.md).

- Full CI24/run42342747871/head5882adf success sau bổ sung focus/caret/value fixture; Word Chain5/5/Tank13/13/generated clean qua. PR18 merge3f943d9; Netlify deploy6aeebb61665214227ba314ef Published; CUA sảnh/menu/bot/exit và4JS+2ảnh byte-match. CI24không lưu ảnh vì suite sau dọn output; giới hạn ở báo cáo.
- Giữ online=false, không SQL/catalog production. Game_Studio_Agent vẫn đủ116skill/21role/297blob; đọc theo nhiệm vụ.

## WC-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu mới: [plan phòng/ghép trận/PK](../word-chain/ONLINE-PLAN.md). Plan dựa source5a64fef; là lịch triển khai, chưa phải bằng chứng server đã deploy. Mỗi phiên chỉ đọc mục task đang làm.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| WC-ON1 | ĐÃ KIỂM staging pilot | Auth/schema/Edge/CORS/cron; tự đóng room vắng client, thưởng tắt; chưa no-client turn |
| WC-ON2 | ĐÃ KIỂM hai account | Tạo/join/start2/cap4, mã sai/đóng, host transfer/rời; full/race có fixture |
| WC-ON3 | PILOT2account qua; user bỏ gate3/4 | Hủy/tìm lại/trả ghế/resetcountdown20s qua; FIFO/one-seat có fixture |
| WC-ON4 | PILOT2account qua; user bỏ gate3/4 | Server nhận từ, đầu hàng/timeout/kết quả, đủ phiếu tái đấu qua |
| WC-ON5 | BACKLOG sau ON4 | Mạng/reload/Exit/Auth/account swap/IME và mobile |
| WC-ON6 | BACKLOG sau ON5 | ≥10trận mỗi format,2thiết bị/2mạng,soak30phút, cutover/rollback |
| WC-PUBLIC | ACTIVE theo yêu cầu08/11 | PR19 đã merge256620c; chuẩn bị backend production/flagtrue/CI/phát hành |

**Khoảng trống cụ thể:** pilot đã bỏ online `submitScore`; cần receipt bền vững trước mở thưởng. Bỏ cuộc qua `onExit`→leave/server forfeit đã có regression UI, không thêm lệnh trùng. Đã sửa cleanup/response muộn/mất ACK, còn kiểm Exit launcher, logout/đổi account bằng phiên thật.

**File đích:** `src/games/word-chain/{OnlineRoom,MatchView,online-client,online-platform,server,rules}.ts(x)`, `supabase/functions/word-chain-room/`, `supabase/word-chain/`, scripts package và `tests/word-chain/`. Hợp đồng/AC/ước lượng/bằng chứng từng task trong plan chi tiết. [Runbook backend](../WORD-CHAIN-SERVER.md) chỉ mở khi làm ON1; ưu tiên AGENTS hiện hành.

**Kiểm:** `test:word-chain`, `test:word-chain-ui`, `test:sql`, generated clean; full CI trước merge. Fixture/PGlite không thay nhiều account/Edge/tick/thiết bị thật. Kết quả server và biên nhận bền vững cần có trước XP/coin; không tự thêm bot vào queue người thật.

## Phạm vi cũ được sắp lại

WC-R0 catalog: WC-L0 giải quyết hiển thị bằng bundle; migration/history staging chỉ khi backend cần, không là điều kiện để game hiện sảnh. WC-R1 chuyển thành ON1–ON4; WC-R2 thành ON5–ON6. Quyết định#7 online chưa hoàn tất, #8 public bot đã duyệt; xem [PENDING-DECISIONS](../PENDING-DECISIONS.md).

**Tiếp theo:** ON5/ON6,3/4account và no-client turn timeout riêng. Lát cắt phòng riêng/PK/matchmaking2account đã qua staging, không đồng nghĩa release online production.

**Yêu cầu mới08/11 ưu tiên:** user yêu cầu merge và public ngay, không cần nghiệm thu3/4người. PR19 đã merge sau CI29; tiếp [gói WC-PUBLIC](../word-chain/PUBLIC-RELEASE-2026-11-08.md). Không coi3/4 đã qua, không bỏ fixture/CI. Production endpoint đang404; phải cài đúng backend trước merge flagtrue. User đã xác nhận riêng gói SQL/JWT production trong cùng08/11; áp đúng phạm vi ở releaseplan, không hỏi lại.

## Yêu cầu triển khai · 07/11/2026

Chủ dự án yêu cầu phòng riêng/PK trước→matchmaking; PR19, nền3f943d9+19afc84. WC-LEX34.512từ/nguồn/checksum/giấy phép, giữ từ cũ/3.011opener; URLhash/revision và50check/CI28qua. Staging schema/Edge/CORS/JWT handlerAuth/cron đã cài theo quyền user; hai account đã kiểm phòng riêng trước rồi queue/PK/rematch. [QA mới nhất](../qa/WC-STAGING-2026-11-08.md), [nguồn](../qa/WC-ONLINE-2026-11-07.md). Chưa merge/phát hành bộ từ mới; online production=false, không SQL production.
