# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Bản nguyên văn trước thiết lập Studio/Graphify](archive/WORKLOG-2026-11-13-before-studio-graphify.md). Xem WORKFLOW và COMPLETED.

## 13/11/2026 · DOC-02 Studio/Graphify · codex/studio-graphify-workflow

- Theo yêu cầu chủ dự án, lưu hai repo trong AGENTS/project/skill đầu mối; mỗi task chọn skill/vai trò và graph đúng module. [Nguồn/cài đặt](studio/GRAPHIFY.md).
- So297tệp Studio với head357b1a1: khớp toàn bộ. Cài Graphify0.9.108/pin52cb282 trong venv riêng; AST46file services cho484node/1291edge; query session/restore/storage budget900/depth2 qua, không LLM. CLI/graph ngoài git, tái lập theo tài liệu.
- Kiểm docs/link/budget/297blob và npm test:claude qua; không chạy full gameplay cho thay đổi hướng dẫn. Main19af480 đã merge PR29; CI48 còn lỗi cross-tab UI, Netlify chưa xác minh. Chưa sửa Auth hoặc deploy. Bàn giao giữ đúng bước tiếp.

## 13/11/2026 · SN-R2b đang phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. Chờ CI trên PR trước khi merge. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).

## 08/11/2026 · ONLINE-ERROR phát hành / Free phục hồi thủ công · codex/online-error-release-verification

- PR21/head47649f9 fullCI36success→merge9061bfd; Netlify6af075593632a228f5ca3102 Published đúngSHA, hai bundlepublic byte-match. ClientTank deadline/lateevents và NốiTừ503/mấtmembership đã phát hành; local52WordChain/9UI/69Tank/18WS qua.
- Sau update ở sảnh, NốiTừ tạo/rờiSSQT7U qua. Tank hồi chiều hai account vàoMFSSFS; sau nhiều giờ ngủ lại timeout180s, robots báo đang ngủ. User chọn “Giữ Free, chưa nâng gói”.
- Redeploy đúngc705100 lần cuối dep-dbo7ke3rjlhs73aktsj0 Live20:35GMT+7; health200/~0,45s/WSSopen~0,29s. Client mới tự nối lại nhậnMB7CU8, đã Rời phòng→menu. Đây là phục hồi thủ công, chưa sửa ổn định cold start.
- [Bằng chứng/giới hạn](qa/ONLINE-ERROR-2026-11-08.md).409cũ chưa cóbody; ON5/ON6 cònQA. Ảnhfixture chỉlocal; không đổiSQL/gói/Auth/commerce. Log trước đóng giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error-release-close.md).
