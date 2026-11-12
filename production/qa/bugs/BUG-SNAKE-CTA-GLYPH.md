# BUG-SNAKE-CTA-GLYPH · S3 · FIXED local · 12/11/2026

- Nguồn:1f4bfc9 trước patch, nhánh codex/snake-r0a-baseline. Node24.19.0, Chromium151/Debian13, viewport390×844 và1440×900.
- Tái hiện: build root rồi build:snake-preview; mở /preview/snake/ với khách; nhìn ký hiệu bên phải nút Đăng nhập để chơi thử.
- Mong đợi: mũi tên chỉ hướng rõ ràng. Thực tế: glyph U+2197 hiện ô vuông trong font của môi trường; không có JS error hoặc asset404.
- Sửa: dùng ArrowUpRight SVG từ lucide-react đã có, giữ nhãn aria và hành vi đăng nhập. Không đổi art/master, CSS dùng chung hoặc engine.
- Bằng chứng: trước/sau lưu tại /workspace/arcadex-snake-r0a-evidence-2026-11-12; preview-runtime kiểm SVG, bounds và ảnh ở320/390/844/1440. [Baseline](../../../docs/qa/SNAKE-R0A-2026-11-12.md) ghi kết quả cuối. Chưa merge/deploy, chưa thiết bị thật.
