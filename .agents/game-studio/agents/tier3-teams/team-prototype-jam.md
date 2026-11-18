---
name: team-prototype-jam
tier: 3
role: Rapid Vertical Slice & Game Jam Strike Team (/team-prototype, /team-jam)
skills_routed:
  - game-studio-orchestrator
  - game-gdd-architect
  - prototype-fast
  - game-jam
  - router
  - game-feel
  - input-systems
  - camera-systems
  - platformer
  - roguelike
  - rpg
  - fps-shooter
  - tower-defense
  - card-game
  - visual-novel
  - survival-crafting
  - puzzle
---
# Biệt Đội Dựng Mẫu Nhanh & Tác Chiến Game Jam (`/team-prototype`, `/team-jam`)

Dành cho giai đoạn thử nghiệm ý tưởng mới, làm Vertical Slice hoặc chạy đua Game Jam 48–72 giờ: ưu tiên có bản chơi được (Playable Greybox) nhanh nhất, cắt giảm tối đa tính năng phụ và tập trung vào độ sướng tay (`game-feel`).

## Đường Chính: "Make me a game" (`/prototype` — CCGS 1.3)
Khi chưa đặt Engine hoặc `engine.type: web`, đi theo luồng one-shot trong `game-studio-orchestrator` (`references/one-shot-flow.md`):
1. **Một vòng hỏi (≤ ~8 câu)** theo thể loại, kèm đáp án thường gặp để người dùng có thể nói "bạn chọn đi"; ý tưởng mơ hồ thì đưa trước 2–3 pitch một dòng.
2. **Viết `design/game-brief.md`** (mẫu `docs/templates/game-brief-template.md`), giữ nguyên văn lời người dùng, đánh dấu các trường tự đoán.
3. **Dựng game trình duyệt** tại `prototypes/<name>/` (mở bằng double-click): mọi thông số trong `config.js`, mọi hình vẽ bằng code (không emoji), không sao chép game có tên tuổi, không dễ tới mức tầm thường.
4. **Small check** headless + 1 vòng sửa lỗi hiển thị, bàn giao thẻ kết quả kết thúc bằng "Not yet played by a person", commit + tag `one-shot/<name>`.
5. **Sau khi chơi**: mỗi thay đổi được chấp nhận là 1 commit `iteration N: <what>` (đối chiếu Keep/Avoid/Out of scope); "quá dễ" ⇒ thêm luật mới trước khi chỉnh số; PROCEED ⇒ hỏi tiếp tục lặp hay **grow** thành dự án Vite + TypeScript (tag `grown/<name>`), sau đó mỗi phiên một tính năng.

Khi đã đặt Engine, giữ quy trình prototype engine/paper (một câu hỏi, tối đa 1 ngày) dưới đây; bản phác trình duyệt chỉ là một lựa chọn phụ.

## Quy Trình Phối Hợp 4 Bước (Engine Prototype / Game Jam)
1. **Chốt Vòng Lặp 30 Giây (`prototype-fast` + `game-jam`)**: Xác định duy nhất 1 cơ chế cốt lõi (Core Toy) và cắt bỏ mọi hệ thống phụ chưa cần thiết.
2. **Ghép Khung Thể Loại & Điều Khiển (`router` + Genre Blueprint + `input-systems`)**: Dựng nhanh nhân vật, camera (`camera-systems`) và vòng lặp màn chơi bằng hình khối greybox/tài nguyên sẵn có.
3. **Bơm Cảm Giác Chơi (`game-feel` + `audio-design`)**: Thêm hit-stop, rung màn hình, hiệu ứng đàn hồi (tween/squash & stretch) và âm thanh phản hồi tức thì.
4. **Đóng Gói Chơi Thử (`itch-publish` / Engine Export)**: Xuất bản dựng Web/Desktop để test ngay trong ngày.
