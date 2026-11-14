# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước thiết kế chat](archive/WORKLOG-2026-11-14-before-chat-design.md). Xem WORKFLOW và COMPLETED.

## 14/11/2026 · CH0 thiết kế chat bubble · codex/chat-bubble-wireframe

- Nguồn 260f160; chủ dự án yêu cầu kế hoạch và wireframe duyệt trước. Đã khảo sát chat UI/service/room schema, tham khảo Roblox và FFXIV; đề xuất sảnh nhỏ, bubble theo vùng công cụ từng game, chấm chưa đọc, lời cạnh avatar và tách input khỏi pause PvP.
- [Kế hoạch](chat/BUBBLE-CHAT-PLAN.md) có CH1–CH5, file đích, hợp đồng room và ma trận QA. Wireframe bốn bối cảnh dùng dữ liệu mẫu; Chromium kiểm kéo/chạm, thu/phóng, tin mới, gửi mẫu và bounds 16 tổ hợp cỡ màn; đã quan sát ảnh desktop/mobile.
- Chưa triển khai runtime/backend, merge/deploy hoặc nghiệm thu thiết bị. CH0 WAITING chủ dự án duyệt; CH1 chưa bắt đầu. Bằng chứng/check cuối ở [QA thiết kế](chat/DESIGN-QA-2026-11-14.md); giữ chi tiết log cũ nguyên văn trong archive.

## 13/11/2026 · SN-R2b đã phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. PR #29, CI #47 success ở `a215da6` sau sửa đọc phiên cũ xuyên tab. Merge `19af480`, Netlify Published 14:59 GMT+7. Chrome public qua tải gói/reload offline/màn 1/thoát, JS game và 20 media khớp SHA-256. Còn nghiệm thu thiết bị và lưu cloud thật. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).

## 08/11/2026 · ONLINE-ERROR phát hành / Free phục hồi thủ công · codex/online-error-release-verification

- PR21/head47649f9 fullCI36success→merge9061bfd; Netlify6af075593632a228f5ca3102 Published đúngSHA, hai bundlepublic byte-match. ClientTank deadline/lateevents và NốiTừ503/mấtmembership đã phát hành; local52WordChain/9UI/69Tank/18WS qua.
- Sau update ở sảnh, NốiTừ tạo/rờiSSQT7U qua. Tank hồi chiều hai account vàoMFSSFS; sau nhiều giờ ngủ lại timeout180s, robots báo đang ngủ. User chọn “Giữ Free, chưa nâng gói”.
- Redeploy đúngc705100 lần cuối dep-dbo7ke3rjlhs73aktsj0 Live20:35GMT+7; health200/~0,45s/WSSopen~0,29s. Client mới tự nối lại nhậnMB7CU8, đã Rời phòng→menu. Đây là phục hồi thủ công, chưa sửa ổn định cold start.
- [Bằng chứng/giới hạn](qa/ONLINE-ERROR-2026-11-08.md).409cũ chưa cóbody; ON5/ON6 cònQA. Ảnhfixture chỉlocal; không đổiSQL/gói/Auth/commerce. Log trước đóng giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error-release-close.md).
