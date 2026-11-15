# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước triển khai chat](archive/WORKLOG-2026-11-15-before-chat-implementation.md). Xem WORKFLOW và COMPLETED.

## 15/11/2026 · CH1–CH4 chat bubble, chờ chủ dự án kiểm · codex/chat-bubble-wireframe

- Chủ dự án duyệt wireframe14/11, yêu cầu code sảnh/ingame và kiểm trước merge; tiếp tục15/11. Tiếp từ thiết kế064a3a5; implementation ở commit cùng bàn giao này. Thêm host/store theo owner, khung sảnh nhỏ, bubble kéo/nhớ, thu/phóng giữ nháp, unread đúng kênh, input isolation và lời nổi cạnh avatar/HUD.
- Caro/Chess/Xiangqi đăng ký phòng social cũ; Tank WS và Nối Từ có transport/server chat riêng, ID gửi do server ràng buộc thành viên, rate limit/dedupe và capability fallback. Chỉ sửa nguồn/SQL local; không áp production hay đổi save gameplay.
- Chat UI3ca, Tank UI13ca, Nối Từ8ca+phone retry, fast/typecheck/build/bundle đã có kiểm local; motion50game/mode và lượt tách25/25UI qua; giữ nguyên assertion. [QA và giới hạn](chat/IMPLEMENTATION-QA-2026-11-15.md) ghi đúng lượt cuối; không nới test. Trang kiểm dùng component thật + dữ liệu thử.
- Nhánh đã đưa qua GitHub connector: implementation localb502e7c/remote36d4e06 cùngtreec32aa1d; CLI chưa có credentials. Không force-push.
- Chưa merge/deploy; private chat Tank/Nối Từ cần staging/backend mới trước phát hành. Còn thiết bị thật, bàn phím ảo và hai tài khoản thật. Bước tiếp: anh kiểm local rồi phản hồi; không tự mở CH5.

## 13/11/2026 · SN-R2b đã phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. PR #29, CI #47 success ở `a215da6` sau sửa đọc phiên cũ xuyên tab. Merge `19af480`, Netlify Published 14:59 GMT+7. Chrome public qua tải gói/reload offline/màn 1/thoát, JS game và 20 media khớp SHA-256. Còn nghiệm thu thiết bị và lưu cloud thật. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).

## 08/11/2026 · ONLINE-ERROR phát hành / Free phục hồi thủ công · codex/online-error-release-verification

- PR21/head47649f9 fullCI36success→merge9061bfd; Netlify6af075593632a228f5ca3102 Published đúngSHA, hai bundlepublic byte-match. ClientTank deadline/lateevents và NốiTừ503/mấtmembership đã phát hành; local52WordChain/9UI/69Tank/18WS qua.
- Sau update ở sảnh, NốiTừ tạo/rờiSSQT7U qua. Tank hồi chiều hai account vàoMFSSFS; sau nhiều giờ ngủ lại timeout180s, robots báo đang ngủ. User chọn “Giữ Free, chưa nâng gói”.
- Redeploy đúngc705100 lần cuối dep-dbo7ke3rjlhs73aktsj0 Live20:35GMT+7; health200/~0,45s/WSSopen~0,29s. Client mới tự nối lại nhậnMB7CU8, đã Rời phòng→menu. Đây là phục hồi thủ công, chưa sửa ổn định cold start.
- [Bằng chứng/giới hạn](qa/ONLINE-ERROR-2026-11-08.md).409cũ chưa cóbody; ON5/ON6 cònQA. Ảnhfixture chỉlocal; không đổiSQL/gói/Auth/commerce. Log trước đóng giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error-release-close.md).
