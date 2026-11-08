# Nhật ký công việc

Nhật ký chính duy nhất, giữ≤3mục. Trước chốt public đã lưu [nguyên văn](archive/WORKLOG-2026-11-08-before-public-release-close.md); các mốc cũ liên kết trong archive đó. Quy trình ở WORKFLOW; tóm tắt bền vững ở COMPLETED.

## 08/11/2026 · ONLINE-ERROR ACTIVE · codex/fix-online-room-errors

- User gửi ảnh, xác nhận cả Nối Từ403/409 và TankWebSocket/kẹt kết nối. Chưa có responsebody của request Nối Từ; không kết luận mọi409 là hỏng server. CORSprobe204 đúngpublicorigin.
- Tankhealth3lần timeout25/20/15s, DNS/TCP/TLS thành công nhưng không cófirstbyte; chưa xác định Render/service/networkedge. Dashboard chưa đọc; Chrome đổi cửa sổ, đã hỏi user giữ tab lỗi trước5phút.
- Tái hiện clientTank không có hạn chờhandshake: testđỏ sau75s vẫnconnecting. Thêm watchdog75s cho coldstart/10s reconnect, chặn callbacksocketcũ và dọn timer/queue khi đóng.3regression xanh,69Tankchecks+launcher/18WSops/lint qua. Chưa deploy bản sửa, chưa gọi backend đã khôi phục.
- [Bug đang kiểm](qa/ONLINE-ERROR-2026-11-08.md); log trước task giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-online-error.md). Không chạy ca3/4người hoặcTCaccountA userđểsau.

## 08/11/2026 · WC-PUBLIC DONE phát hành · codex/word-chain-release-handoff

- PR19 merge256620c/CI29; PR20 head970a941/full CI32 success, merge086d6ac. Netlify6af00f400397c396a118ca39 hiện Published/main086d6ac, đã đọc dashboard thật.
- Backend production áp đúng gói schema/Edge/CORS/Auth/cron/Vault được user duyệt; tick200, denial probes đúng, dictionarypublic34.512 byte-match. Không đọc/xuất secret.
- Public Chrome với phiên registered: tạo phòng X9FL8R 1/2→rời, queue1/4→hủy, đều về menu. Lần tải đầu lỗi, hard reload rồi mở được; nguyên nhân chưa xác định. CI32 giữ fixture,7offline/7WordChainUI/13TankUI và50logiccheck.
- User bỏ gate3/4người; chưa2thiết bị/2mạng/soak/Auth/IME/no-client turn. Thưởng online tắt. [Báo cáo cuối](word-chain/PUBLIC-RELEASE-2026-11-08.md); checkpoint này chỉ docs, chưa bắt đầu Snake.

## 08/11/2026 · WC-ON1–ON4 pilot hai tài khoản · codex/word-chain-online

- Staging đã cài schema/Edge/CORS/JWT handlerAuth/cron10s, qua probeAuth/tick; user duyệt rõ từng gói.
- Hai account thật: tạo/join/start2/cap4/ready/nhận từ, đầu hàng/kết quả, host transfer/mã đóng; queue hủy/tìm lại/trả ghế/reset20s, timeout và đủ2phiếu tái đấu qua.
- Đóng cả hai tab→cron đóng phòng hết rematch/HTTP200; không chứng minh no-client turn timeout. [QA](qa/WC-STAGING-2026-11-08.md). Sau pilot đã merge và public qua WC-PUBLIC ở trên; không còn chờ bật online.
