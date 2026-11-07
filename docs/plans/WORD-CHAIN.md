# Nối Từ — ra sảnh và hoàn tất online

Mốc 07/11/2026 · nguồn `5a64fef` · nhánh `codex/word-chain-launcher-release`. Bot/offline, UI/core phòng, schema/Edge/test đã có. Online flag false; backend online chưa nghiệm thu. Không viết lại phòng từ đầu, không chạy SQL production.

## WC-L0 · ACTIVE · phát hành bot/offline và artwork

Chủ dự án đã duyệt đưa game ra sảnh với icon/banner. PR#18 có bundled-free, policy server giữ ưu tiên;2master ImageGen, icon512/banner1280×640, URL hash/offline package. Local lint/build/bundle/fast, engine36check và CUA desktop/phone qua, gồm controls320/360/375/390. [Báo cáo](../qa/WC-L0-2026-11-07.md).

- Preview5a64fef success; CI23/run42341160368 fail nhập suffix desktop,4/5WC UI qua (narrow/phone/private/queue). Bổ sung focus/caret/value assertions; cần full CI head mới trước merge/production.
- Giữ online=false, không SQL/catalog production. Game_Studio_Agent vẫn đủ116skill/21role/297blob; đọc theo nhiệm vụ.

## WC-PLAN · DONE tài liệu · 07/11/2026

Theo yêu cầu mới: [plan phòng/ghép trận/PK](../word-chain/ONLINE-PLAN.md). Plan dựa source5a64fef; là lịch triển khai, chưa phải bằng chứng server đã deploy. Mỗi phiên chỉ đọc mục task đang làm.

| Task | Trạng thái / phụ thuộc | Kết quả cần đạt |
|---|---|---|
| WC-ON1 | READY chuẩn bị local; staging theo môi trường | Auth/schema/Edge/tick thật; pilot tắt thưởng chung; không lộ secret |
| WC-ON2 | BACKLOG sau ON1 | Hai account tạo/join mã/start; full/wrong/closed/retry/host leave |
| WC-ON3 | BACKLOG sau ON2 | FIFO2–4người,20giây từ người thứ2, cancel/race/one-seat |
| WC-ON4 | BACKLOG sau ON3 | PK server-authoritative, đầu hàng, kết quả, tái đấu |
| WC-ON5 | BACKLOG sau ON4 | Mạng/reload/Exit/Auth/account swap/IME và mobile |
| WC-ON6 | BACKLOG sau ON5 | ≥10trận mỗi format,2thiết bị/2mạng,soak30phút, cutover/rollback |

**Khoảng trống cụ thể:** online `submitScore` chỉ có ref chặn lặp trong một mount; phải tắt thưởng pilot và có receipt bền vững trước mở thưởng. Xác nhận bỏ cuộc hiện qua `onExit`→leave, server đã tính forfeit dù callback riêng rỗng; kiểm toàn luồng/retry, không thêm lệnh trùng. Resume key theo UID đã có nhưng cần kiểm Exit launcher, response cũ, logout/đổi account bằng phiên thật.

**File đích:** `src/games/word-chain/{OnlineRoom,MatchView,online-client,online-platform,server,rules}.ts(x)`, `supabase/functions/word-chain-room/`, `supabase/word-chain/`, scripts package và `tests/word-chain/`. Hợp đồng/AC/ước lượng/bằng chứng từng task trong plan chi tiết. [Runbook backend](../WORD-CHAIN-SERVER.md) chỉ mở khi làm ON1; ưu tiên AGENTS hiện hành.

**Kiểm:** `test:word-chain`, `test:word-chain-ui`, `test:sql`, generated clean; full CI trước merge. Fixture/PGlite không thay nhiều account/Edge/tick/thiết bị thật. Kết quả server và biên nhận bền vững cần có trước XP/coin; không tự thêm bot vào queue người thật.

## Phạm vi cũ được sắp lại

WC-R0 catalog: WC-L0 giải quyết hiển thị bằng bundle; migration/history staging chỉ khi backend cần, không là điều kiện để game hiện sảnh. WC-R1 chuyển thành ON1–ON4; WC-R2 thành ON5–ON6. Quyết định#7 online chưa hoàn tất, #8 public bot đã duyệt; xem [PENDING-DECISIONS](../PENDING-DECISIONS.md).

**Tiếp theo:** đóng WC-L0 sau CI/deploy; bắt đầu ON1 rồi lát cắt hai người tạo phòng→nhập mã→PK→thoát. Chưa bật online production từ plan này.
