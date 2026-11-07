# Nối Từ — ra sảnh và hoàn tất online

Mốc 07/11/2026 · runtime `5a64fef`, merge `3f943d9` · nhánh `codex/word-chain-launcher-release`. Bot/offline, UI/core phòng, schema/Edge/test đã có. Online flag false; backend online chưa nghiệm thu. Không viết lại phòng từ đầu, không chạy SQL production.

## WC-L0 · DONE · phát hành bot/offline và artwork

Chủ dự án đã duyệt đưa game ra sảnh với icon/banner. PR#18 có bundled-free, policy server giữ ưu tiên;2master ImageGen, icon512/banner1280×640, URL hash/offline package. Local lint/build/bundle/fast, engine36check và CUA desktop/phone qua, gồm controls320/360/375/390. [Báo cáo](../qa/WC-L0-2026-11-07.md).

- Full CI24/run42342747871/head5882adf success sau bổ sung focus/caret/value fixture; Word Chain5/5/Tank13/13/generated clean qua. PR18 merge3f943d9; Netlify deploy6aeebb61665214227ba314ef Published; CUA sảnh/menu/bot/exit và4JS+2ảnh byte-match. CI24không lưu ảnh vì suite sau dọn output; giới hạn ở báo cáo.
- Giữ online=false, không SQL/catalog production. Game_Studio_Agent vẫn đủ116skill/21role/297blob; đọc theo nhiệm vụ.

## WC-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu mới: [plan phòng/ghép trận/PK](../word-chain/ONLINE-PLAN.md). Plan dựa source5a64fef; là lịch triển khai, chưa phải bằng chứng server đã deploy. Mỗi phiên chỉ đọc mục task đang làm.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| WC-ON1 | ACTIVE chuẩn bị/staging | Auth/schema/Edge/tick thật; pilot tắt thưởng chung; không lộ secret |
| WC-ON2 | ACTIVE hoàn thiện sau nền ON1 | Hai account tạo/join mã/start; full/wrong/closed/retry/host leave |
| WC-ON3 | BACKLOG sau ON2 | FIFO2–4người,20giây từ người thứ2, cancel/race/one-seat |
| WC-ON4 | BACKLOG sau ON3 | PK server-authoritative, đầu hàng, kết quả, tái đấu |
| WC-ON5 | BACKLOG sau ON4 | Mạng/reload/Exit/Auth/account swap/IME và mobile |
| WC-ON6 | BACKLOG sau ON5 | ≥10trận mỗi format,2thiết bị/2mạng,soak30phút, cutover/rollback |

**Khoảng trống cụ thể:** online `submitScore` chỉ có ref chặn lặp trong một mount; phải tắt thưởng pilot và có receipt bền vững trước mở thưởng. Xác nhận bỏ cuộc hiện qua `onExit`→leave, server đã tính forfeit dù callback riêng rỗng; kiểm toàn luồng/retry, không thêm lệnh trùng. Resume key theo UID đã có nhưng cần kiểm Exit launcher, response cũ, logout/đổi account bằng phiên thật.

**File đích:** `src/games/word-chain/{OnlineRoom,MatchView,online-client,online-platform,server,rules}.ts(x)`, `supabase/functions/word-chain-room/`, `supabase/word-chain/`, scripts package và `tests/word-chain/`. Hợp đồng/AC/ước lượng/bằng chứng từng task trong plan chi tiết. [Runbook backend](../WORD-CHAIN-SERVER.md) chỉ mở khi làm ON1; ưu tiên AGENTS hiện hành.

**Kiểm:** `test:word-chain`, `test:word-chain-ui`, `test:sql`, generated clean; full CI trước merge. Fixture/PGlite không thay nhiều account/Edge/tick/thiết bị thật. Kết quả server và biên nhận bền vững cần có trước XP/coin; không tự thêm bot vào queue người thật.

## Phạm vi cũ được sắp lại

WC-R0 catalog: WC-L0 giải quyết hiển thị bằng bundle; migration/history staging chỉ khi backend cần, không là điều kiện để game hiện sảnh. WC-R1 chuyển thành ON1–ON4; WC-R2 thành ON5–ON6. Quyết định#7 online chưa hoàn tất, #8 public bot đã duyệt; xem [PENDING-DECISIONS](../PENDING-DECISIONS.md).

**Tiếp theo đề xuất:** ON1 rồi lát cắt hai người tạo phòng→nhập mã→PK→thoát. Chưa bật online production từ plan này.

## Yêu cầu triển khai · 07/11/2026

Chủ dự án yêu cầu làm phòng riêng/vào PK trước, sau đó matchmaking; mở rộng từ điển vì thiếu từ. Nhánh `codex/word-chain-online`, nền3f943d9+checkpoint19afc84. ON1/ON2 ACTIVE; ON3 sau khi lát cắt phòng riêng đã kiểm. Bổ sung WC-LEX: nguồn có giấy phép, checksum/provenance, giữ từ cũ và luật2âm tiết, đồng bộ browser/Edge, test số lượng/từ thực tế/Unicode/offline. Chưa triển khai online production hoặc SQL production.
