# Bàn giao · 07/11/2026 · sau PR#17

**Frontend/source:** main1131927. **Backend:** Render c705100, không đổi server. **Nhánh checkpoint:** codex/tank-clash-release-verification; kiểm git status/log. DOC-01, sửa Netlify và sửa nguồn Auth đã tóm tắt ở COMPLETED.

## Đã xong

- PR#17 merge sau full CI b644da2 success/run42311533962, gồm Nối Từ/Tank UI và generated clean. Thư viện116skill/21role/4rules + roadmap Markdown đã vào main.
- Netlify thiếu ws của browser fixture: thêm deps:tank-clash dùng chung CI/production/preview trước lint/build, không bỏ test. Checkout sạch red/green qua; Preview success; production1131927 Published/deploy6aee682dc2bd2dba16385690.4bundle đầu byte-match. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- Auth listener giữ identity riêng, hủy restore cũ;5regression qua. Sau release,2tab bundle mới/B thật: tạo phòng→logout tab kia→về thư viện→Online mở login, không còn hồ sơ B. [Bằng chứng](qa/BUG-AUTH-CROSS-TAB.md).
- Nối Từ có source/test trong main; CI engine/UI qua. RPC public23mục không trả word-chain; fallback chỉ DEV, online flagfalse. [Audit](qa/WC-R0-2026-11-07.md). Không thiếu merge game; chưa thay DB/catalog/online.

## Còn dở / bước tiếp

- **TC-R0 WAITING:** chủ dự án chọn “Để kiểm ca này sau” với đăng nhập lại A sau release. Khi sẵn sàng: A phải khác B, kiểm mã phòng B9FNNVT không còn/không tiếp quản ghế và tab nhận đúng A; không hỏi password/JWT.2account/mã A cũ đã qua trước release không thay ca còn thiếu. Tab thử hiện guest; không tự đăng nhập hộ.
- TC-R1 cần≥10trận mỗi format/2thiết bị/2mạng/soak30phút, chưa đạt. P2 wire cũ chỉ port sang P3 theo TC-R2, không merge nguyên nhánh.
- Nối Từ tiếp WC-R0: history/catalog staging, thử migration/rollback; thời điểm catalog/online theo quyết định#8/#7. Không SQL production. Duel còn UI, Snake preview, commerce tắt.

## Giữ lại

- Render một Free/cap16/registered-free; Blueprint cũ paused, không Sync hay redeploy server vô cớ. Không chi phí thêm/khóa mới. Chủ dự án đã cho public thư viện và metadata báo cáo TC-R0.
- deliverables/ là artifact local cũ, không commit. Đọc AGENTS→bàn giao→một thẻ plans; chỉ nạp skill cần. Trước đổi việc: COMPLETED, WORKLOG≤3, archive nguyên văn, doc checker theo WORKFLOW.
