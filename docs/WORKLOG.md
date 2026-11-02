# Nhật ký công việc (bắt buộc)

Quy tắc của chủ dự án (02/11/2026): **mọi việc Claude làm xong đều phải ghi vào file này**, ngay khi xong từng phần (không đợi cuối session), và commit cùng thay đổi đó. Mục mới nhất ở trên cùng.

Mỗi mục ghi: ngày, nhánh, việc đã làm, file chính, lệnh test đã chạy và kết quả thật, phần chưa làm hoặc còn rủi ro. Tóm tắt dài hạn nằm ở `docs/SESSION-HANDOFF.md`; việc chủ dự án cần làm ở `docs/OWNER-TODO.md`.

---

## 02/11/2026 · nhánh `ccr-ff972ce9-1yqkwu` (tách từ `main` `c8aac24`)

### Bắt đầu session
- Trạng thái lúc vào: nhánh trùng `main` (`c8aac24`, đã có Tank Clash P0/P1, Snake journey, và toàn bộ nhánh `claude/busy-edison-1clj3h` qua PR #11). `docs/SESSION-HANDOFF.md` còn ghi nhánh cũ "16 commit chưa merge" → đã sửa.
- Việc tiếp theo theo `docs/tank-clash/PLAN.md` §10/§14: **Tank Clash P2 — online 1v1** (giao thức phòng, mã phòng, ready, dự đoán/đối soát/làm mượt, luật rời trận, thử RTT/jitter/loss). Không deploy, không đăng ký hosting (cần chủ dự án duyệt chi phí).
- Kiểm tra nền: `node --test tests/tank-clash/engine.test.mjs tests/tank-clash/network.test.mjs` → 13/13 qua.
- Đã tạo file này và thêm quy tắc "Nhật ký bắt buộc" vào `CLAUDE.md`.
