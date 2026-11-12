# Bàn giao · 12/11/2026 · Snake Legend SN-R2a

## Kết quả local

Nhánh `codex/snake-r2a-preview-assets` từ 2f82945. Chủ dự án cho tiếp phát triển và nghiệm thu sau. Tách 6 atlas/14 WAV ra khỏi JS, game chunk 1.917.496 → 151.769 byte, chunk lớn nhất preview 420.125 byte. Art chỉ tải khi vào màn và WAV khi bật tiếng. Chrome đã xem hình thay thế rồi sprite, thử lại một WAV lỗi và hủy 14 request khi thoát. [QA SN-R2a](qa/SNAKE-R2A-2026-11-12.md).

SN-R1b đã kiểm 10 màn, 28/30 sao, lưu/ngọc qua mô phỏng và ca ba cầu qua Chrome fixture. HTML chơi thử offline tạo bằng `npm run export:snake-journey`, đầu ra `dist/Snake_Legend_Journey_Playtest.html`. Preview dùng tài khoản đăng ký và save qua verifier. Build/budget, 6 suite Snake, 10 UI và 3 guard qua.

## Việc tiếp theo

- Đọc [thẻ Snake](plans/SNAKE.md). Khi anh nghiệm thu, kiểm người mới chơi, Android/iPhone thật, art/animation/audio, chuyển nền, điều khiển ba cầu và pha 3 Nhện Mẹ.
- SN-R0b live chờ staging có verifier/schema và fixture đúng scope. Ca thật cần save/reload, mất ACK, đổi tài khoản, cạnh tranh hai phiên và JWT hết hạn. [Runbook](snake/UI-SAVE-RUNBOOK.md).
- Ứng viên catalog/SN-R2b chờ quyết định phát hành. Nối media từ manifest vào gói offline, xác nhận budget trên build catalog, full CI rồi pilot. Giữ save, Gold/Gem riêng và thưởng chung tắt.

Checkpoint local trên nhánh riêng. WORKLOG giữ tối đa ba mục, archive giữ nguyên văn. Studio đã cài đủ. Ads thật chờ AD-03, commerce hoãn, ONLINE-V1 có gate riêng.
