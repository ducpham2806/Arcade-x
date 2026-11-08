# Bàn giao · 08/11/2026 · WC-PUBLIC đã phát hành

**Đã xong:** phòng riêng/nhập mã/PK/ghép trận Nối Từ và kho 34.512 từ đã merge, public tại https://arcade-x.netlify.app/. PR19 merge256620c sau full CI29; PR20 head970a941 qua full CI32 (run42429931818), merge **086d6ac**. Netlify deploy6af00f400397c396a118ca39 đã quan sát **Currently published / main@086d6ac**. Không chờ merge hoặc bật flag nữa.

**Production đã kiểm 08/11:** Chrome xuan duc mở game, đủ3 entry online/34.512 từ; dùng phiên registered sẵn có tạo phòng X9FL8R (1/2), rời về menu; vào queue (1/4), hủy về menu. Không còn giữ phòng/hàng chờ thử. Lần mở đầu lỗi tải game, hard reload rồi mở lại thành công; chưa xác định nguyên nhân, chưa gọi là đã sửa lỗi cache. [Bằng chứng release](word-chain/PUBLIC-RELEASE-2026-11-08.md).

Backend whjatkhhupeqfngakmee đã cài đúng gói user duyệt: schema/Edge, handler Auth.getUser registered-only, legacyJWT OFF riêng word-chain-room, CORS chỉarcade-x.netlify.app, cronjob3/10s/Vault hash_ready. Tick thật200/updated0; CORS/Auth/tick giả/publicRPC denial đúng; dictionarypublic byte-match. Exception SQL/JWT chỉ gói này; không tự mở quyền production khác, không hỏi lại việc đã duyệt.

**Giới hạn giữ nguyên:** user bỏ gate nghiệm thu thật3–4người, không nói đã qua; fixture4ghế/CI vẫn giữ. Staging2account đã kiểm phòng/PK/host transfer/queue/countdown20s/timeout/rematch; đóng tab→cron đóng phòng hết rematch. Chưa no-client turn timeout,2thiết bị/2mạng/soak/reconnect/IME/expiredAuth bằng phiên thật. Online chưa thưởng XP/xu; phải có receipt bền vững trước mở thưởng. Không tự thêm bot vào queue.

**Tiếp theo:** WC-ON5/ON6 là backlog QA; thứ tự roadmap tiếp [Snake](plans/SNAKE.md), bắt đầu R0a baseline/bundle rồi R0b UI/save/Auth thật. Chưa bắt đầu task Snake trong checkpoint này. TC-R0 ca A/mã B cũ user để sau; Renderc705100/Free/cap16/Blueprintpaused, không deploy vô cớ; commerce tắt.

Checkpoint tài liệu: codex/word-chain-release-handoff trên main086d6ac, chỉ cập nhật bằng chứng/bàn giao; không đổi runtime. deliverables/ cũ không commit. Studio c5dac462 đủ297blob/116skill/21role; không cài/nạp lại toàn bộ. WORKLOG≤3, COMPLETED/archive giữ lịch sử; chạy doc checker trước commit.
