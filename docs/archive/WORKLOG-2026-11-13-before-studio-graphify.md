# Nhật ký công việc

Một nhật ký chính, tối đa ba mục. [Log trước lượt phát hành Snake](archive/WORKLOG-2026-11-13-before-snake-public.md). Xem WORKFLOW và COMPLETED.

## 13/11/2026 · SN-R2b đang phát hành · codex/snake-public-release

- Chủ dự án yêu cầu merge main và deploy Netlify. Tách Snake từ ứng viên 4432a0e sang nhánh dựa trên main9061bfd. R01 miễn phí, lưu trên thiết bị theo owner, không dùng cloud save hay thưởng chung ở bản sảnh.
- Build production và rollback, Chrome card/tải gói/retry/reload offline/ảnh/âm thanh/đổi account đã qua. Ẩn công cụ QA trong game public. Chờ CI trên PR trước khi merge. [Báo cáo](qa/SNAKE-PUBLIC-2026-11-13.md).

## 08/11/2026 · ONLINE-ERROR phát hành / Free phục hồi thủ công · codex/online-error-release-verification

- PR21/head47649f9 fullCI36success→merge9061bfd; Netlify6af075593632a228f5ca3102 Published đúngSHA, hai bundlepublic byte-match. ClientTank deadline/lateevents và NốiTừ503/mấtmembership đã phát hành; local52WordChain/9UI/69Tank/18WS qua.
- Sau update ở sảnh, NốiTừ tạo/rờiSSQT7U qua. Tank hồi chiều hai account vàoMFSSFS; sau nhiều giờ ngủ lại timeout180s, robots báo đang ngủ. User chọn “Giữ Free, chưa nâng gói”.
- Redeploy đúngc705100 lần cuối dep-dbo7ke3rjlhs73aktsj0 Live20:35GMT+7; health200/~0,45s/WSSopen~0,29s. Client mới tự nối lại nhậnMB7CU8, đã Rời phòng→menu. Đây là phục hồi thủ công, chưa sửa ổn định cold start.
- [Bằng chứng/giới hạn](qa/ONLINE-ERROR-2026-11-08.md).409cũ chưa cóbody; ON5/ON6 cònQA. Ảnhfixture chỉlocal; không đổiSQL/gói/Auth/commerce. Log trước đóng giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error-release-close.md).

## 08/11/2026 · WC-PUBLIC DONE phát hành · codex/word-chain-release-handoff

- PR19 merge256620c/CI29; PR20 head970a941/full CI32 success, merge086d6ac. Netlify6af00f400397c396a118ca39 hiện Published/main086d6ac, đã đọc dashboard thật.
- Backend production áp đúng gói schema/Edge/CORS/Auth/cron/Vault được user duyệt; tick200, denial probes đúng, dictionarypublic34.512 byte-match. Không đọc/xuất secret.
- Public Chrome với phiên registered: tạo phòng X9FL8R 1/2→rời, queue1/4→hủy, đều về menu. Lần tải đầu lỗi, hard reload rồi mở được; nguyên nhân chưa xác định. CI32 giữ fixture,7offline/7WordChainUI/13TankUI và50logiccheck.
- User bỏ gate3/4người; chưa2thiết bị/2mạng/soak/Auth/IME/no-client turn. Thưởng online tắt. [Báo cáo cuối](word-chain/PUBLIC-RELEASE-2026-11-08.md); checkpoint này chỉ docs, chưa bắt đầu Snake.
