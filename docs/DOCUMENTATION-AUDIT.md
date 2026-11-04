# Rà soát tài liệu · 04/11/2026

## Phạm vi và căn cứ

Mốc `main@affc5e8`, 134 file Markdown được kiểm kê đường dẫn/kích thước. Đọc sâu các tài liệu đầu phiên, kế hoạch/spec Tank, owner/decision/log, runbook Duel/Nối Từ/commerce/recovery, CI và code/config liên quan. Không tuyên bố đã nghiệm thu gameplay hoặc đọc sâu mọi GDD, license, artifact lịch sử. Clone thành công bằng `--depth 1`; lịch sử remote giữ nguyên.

## Cách rút gọn

- AGENTS là nguồn quy tắc chung (giữ nguyên modal/toast/update, save/secrets và quy tắc làm việc); CLAUDE chỉ nạp AGENTS + đường dẫn tiếp quản.
- Handoff giữ trạng thái/bước tiếp; INDEX định tuyến theo module; kế hoạch chi tiết chỉ mở khi cần lập kế hoạch, không bắt đọc mỗi phiên.
- README chỉ setup/cấu trúc/đường dẫn; chuyển nguyên phần test/preview sang TESTING. Sửa README Tank (P3 wire, nút 04), SHA/PR bàn giao, backlog PvP.
- Có sẵn WORKLOG và archive; chuyển nguyên 6 mục 03/11 sang archive, giữ 1 mục mới. Không tạo sổ lịch sử khác. Chỉ đọc mục mới nhất, tối đa 3 mục ở file chính.
- Tank PLAN/P3-SPEC bỏ mô tả code trước triển khai, sơ đồ nháp và lịch sử lặp; giữ ID mục, D1–D7, luật, quyết định, test và giới hạn. Bản gốc nguyên byte lưu `archive/tank-clash-PLAN-v1.4.md`, `archive/tank-clash-P3-SPEC-v0.4.md`.
- 19 agent bỏ số 22 game lỗi thời; không sửa vai trò, frontmatter, skill hoặc license. Agent/skill chỉ nạp khi dùng.

## Số đo UTF-8 (byte, không phải token)

| File | Trước | Sau |
|---|---:|---:|
| `AGENTS.md` | 1,759 | 2,032 |
| `CLAUDE.md` | 3,256 | 459 |
| `README.md` | 7,555 | 2,117 |
| `docs/SESSION-HANDOFF.md` | 3,419 | 2,215 |
| `docs/OWNER-TODO.md` | 3,983 | 1,401 |
| `docs/PENDING-DECISIONS.md` | 3,206 | 1,756 |
| `docs/WORKLOG.md` | 10,677 | 1,982 |
| `docs/tank-clash/README.md` | 5,379 | 1,315 |
| `docs/tank-clash/PLAN.md` | 14,566 | 8,755 |
| `docs/tank-clash/P3-SPEC.md` | 33,988 | 14,859 |

- Bộ đầu phiên (AGENTS + CLAUDE + handoff + WORKLOG): **19,111 → 6,688 byte (−65.0%)**; nếu đọc toàn INDEX lần đầu: **11,499 byte (−39.8%)**. Chỉ đọc mục log/route liên quan còn ít hơn.
- Ba tài liệu Tank: **53,933 → 24,929 byte (−53.8%)**. Làm P3d chỉ cần §7–§9 trước.
- 10 file so sánh: **87,788 → 36,891 byte (−58.0%)**. Đây không phải tổng dung lượng repo: có thêm kế hoạch/chỉ mục và archive; không đánh đồng giảm dung lượng đọc với giảm dung lượng lưu.
- Token tùy tokenizer/ngôn ngữ. Chưa đo bằng tokenizer; không quy đổi byte thành số token giả chính xác.

## Tài liệu giữ đầy đủ, đọc khi cần

Runbook bảo mật/khôi phục/triển khai, commerce API, SQL, JSON kết quả/manifest, nguồn/giấy phép và GDD từng game không bị cắt đại trà. GDD Rainbow (~52,7 KB), subscription foundation (~17,7 KB), commerce README (~23,8 KB) cần mở đúng phần khi sửa module; bản cũ có thể chứa quyết định chưa thay thế. Archive là bằng chứng lịch sử, không phải trạng thái hiện hành.

Không sửa/xóa các báo cáo cũ để tạo cảm giác mới. `operations/SECURITY-RECOVERY.md` còn mốc reminder cũ: phải xác minh trạng thái riêng nếu thực hiện commerce, không suy ra automation còn tồn tại. Không viết lại Git/LFS nếu chưa quyết #5.

## Kiểm chứng đợt này

Đã qua `node tests/claude/structure.cjs` (19 agent/11 skill), `git diff --check` và kiểm tra tài liệu: 40 liên kết local tồn tại; 2 archive khớp nguyên byte nguồn; 6 mục log và lịch sử archive cũ giữ nguyên; đủ §1–§12/§1–§15 và D1–D7; mọi lệnh npm tham chiếu tồn tại, chỉ Markdown thay đổi. Không chạy build/gameplay vì chỉ đổi tài liệu; CI main là bằng chứng cũ, không thay test thay đổi code tương lai.
