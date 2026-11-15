# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước triển khai chat](archive/WORKLOG-2026-11-15-before-chat-implementation.md). Xem WORKFLOW và COMPLETED.

## 15/11/2026 · CHAT native cả3game / staging, chờ2tester · codex/chat-bubble-wireframe

- User duyệt bố cục và yêu cầu hoàn thiện Tank/Nối Từ/Hải Chiến, kiểm staging trước merge. Hải Chiến đã có chat riêng/receipt/membership/HUD; Tank sửa UTC/spectator; Word chat đồng thời không nới guard gameplay. Speech đo thật, tránh board/timer/nút, giữ unread/nháp/input chung.
- Native UI3/3 và commonChat3/3 qua; build/lint/bundle/social, Tank70/WS18, Word54, Battleship toàn bộ qua. Ảnh native dùng Auth fixture+WS/PGlite, không là bằng chứng2account thật.
- Đã áp SQL staging khqipuipeawzlkqmdzdg, deploy Word4/Battleship2; 12probe HTTPS/Auth-negative qua. Tank process riêng localhost4335, không đổi Render production. [QA nguồn/hash/giới hạn](chat/NATIVE-MATCH-QA-2026-11-15.md).
- User báo đăng nhập;2tab profile xuan duc vẫn form login, đang xác định phiên để kiểm positive. Chưa merge/deploy production; còn fullCI/nghiệm thu. Mốc sync trước native local4f96eea/remote05506ec cùngtreee8dcffc; không force-push. [Log trước native](archive/WORKLOG-2026-11-15-before-native-chat-staging.md).

## 13/11/2026 · SN-R2b đã phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. PR #29, CI #47 success ở `a215da6` sau sửa đọc phiên cũ xuyên tab. Merge `19af480`, Netlify Published 14:59 GMT+7. Chrome public qua tải gói/reload offline/màn 1/thoát, JS game và 20 media khớp SHA-256. Còn nghiệm thu thiết bị và lưu cloud thật. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).

## 08/11/2026 · ONLINE-ERROR phát hành / Free phục hồi thủ công · codex/online-error-release-verification

- PR21/head47649f9 fullCI36success→merge9061bfd; Netlify6af075593632a228f5ca3102 Published đúngSHA, hai bundlepublic byte-match. ClientTank deadline/lateevents và NốiTừ503/mấtmembership đã phát hành; local52WordChain/9UI/69Tank/18WS qua.
- Sau update ở sảnh, NốiTừ tạo/rờiSSQT7U qua. Tank hồi chiều hai account vàoMFSSFS; sau nhiều giờ ngủ lại timeout180s, robots báo đang ngủ. User chọn “Giữ Free, chưa nâng gói”.
- Redeploy đúngc705100 lần cuối dep-dbo7ke3rjlhs73aktsj0 Live20:35GMT+7; health200/~0,45s/WSSopen~0,29s. Client mới tự nối lại nhậnMB7CU8, đã Rời phòng→menu. Đây là phục hồi thủ công, chưa sửa ổn định cold start.
- [Bằng chứng/giới hạn](qa/ONLINE-ERROR-2026-11-08.md).409cũ chưa cóbody; ON5/ON6 cònQA. Ảnhfixture chỉlocal; không đổiSQL/gói/Auth/commerce. Log trước đóng giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error-release-close.md).
