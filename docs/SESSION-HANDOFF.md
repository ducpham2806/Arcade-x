# Bàn giao · 18/11/2026 · FD-L1 chờ duyệt

User yêu cầu tiếp theo plan. [Thẻ Folk Duel](plans/FOLK-GAMES-PLAN.md), nhánh `codex/folk-duel-foundation`, [PR 40 nháp](https://github.com/ducpham2806/Arcade-x/pull/40) tách từ nhánh chat. Bản FD-L1 từ `20c5a72`, giữ giới hạn duyệt trước merge. [Bàn giao FD-L0](archive/SESSION-HANDOFF-2026-11-18-before-folk-offline.md).

Lưu GameBridge sau mỗi lượt, một ván offline gần nhất cho từng game. Nhảy dở quay về đầu lượt, xem tiếp kết quả giữ receipt. Hồ sơ profile cũ qua GameBridge vẫn đọc được. Không nhập dữ liệu legacy toàn thiết bị thiếu owner sang tài khoản khác. Bước lỗi ghi có nút thử lưu lại; thưởng chỉ cộng sau khi ghi receipt. Ô Ăn Quan touch/phím chọn đúng ô. Nhảy Lò Cò có pha nhặt Chàm, canh lực, bỏ Nhà đối thủ. Hai game sửa HUD theo lượt, chế độ bot tạm dừng khi chat hoặc mở shop.

Node 24 lint, build, bundle, test:fast và Folk 11/11 qua. Playwright 4/4, ván trọn cho hai game và hai chế độ. Reload giữa chừng, xem kết quả không thưởng lặp, kiểm skin và đấu lại. Chromium 320 dọc và 844 ngang qua mở luật, thoát sảnh và chơi tiếp. Ảnh `test-results/folk-offline/`; chưa chạy máy thật. Sửa notification Bạn bè mở cộng đồng đầy đủ, modal 36/36 và chat chung 3/3 qua. Preview dev backend tắt, [Ô Ăn Quan](http://127.0.0.1:4357/?review=o-an-quan) và [Nhảy Lò Cò](http://127.0.0.1:4357/?review=nhay-lo-co).

Studio `fa7b1db`, Game UI/UX, Save Systems, QA/Playtest, vai trò QA Lead. Graphify AST Ô Ăn Quan 5 tệp/75 nút, Nhảy Lò Cò 5 tệp/65 nút và Folk Duel 9 tệp/101 nút. Query OaqMatchBoard, NlcMatchCourt depth 1 và kiểm thêm nguồn GameBridge/owner storage ngoài graph.

FD-ON1 kế tiếp khi chủ dự án duyệt bản offline, còn phòng 1v1 dùng backend, staging hai tài khoản và chat Trận. PR 38 còn kiểm staging thật riêng. Chưa merge hay deploy production.
