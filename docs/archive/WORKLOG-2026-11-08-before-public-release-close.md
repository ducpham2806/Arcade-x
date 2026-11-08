# Nhật ký công việc

Nhật ký chính duy nhất; giữ≤3mục. Chi tiết trước chốt release giữ [nguyên văn](archive/WORKLOG-2026-11-07-before-release-close.md); DOC-01 ở [archive riêng](archive/WORKLOG-2026-11-06-DOC-01.md). Tóm tắt ở COMPLETED; checkpoint trước pilot giữ [nguyên văn](archive/WORKLOG-2026-11-08-before-staging-pilot.md), quy trình ở WORKFLOW.

## 08/11/2026 · WC-PUBLIC ACTIVE · codex/word-chain-public-release

- User yêu cầu merge/public và bỏ nghiệm thu3–4người. PR19 merge256620c sau full CI29/headfde7810success; Netlify build tự động, Published chưa xác nhận.
- Bật flag ở nhánh release, UI regression đổi từ onlineẩn sang3entryhiện/guestbịyêucầulogin; bot vẫn phải qua. Local lint/50check/launcher/build/bundle qua. Không tắt test4người hoặc nới assert.
- Production ban đầu404; đã áp schema/Edge/handlerAuth/CORS và cronjob3/10s. Smoke tick200, CORS/Auth/role denial đúng; dictionarypublic34.512byte-match. [Gói review](word-chain/PUBLIC-RELEASE-2026-11-08.md); user đã xác nhận “Cho phép gói Nối Từ production”, exception hẹp cho đúng gói/project; chưa áp tại checkpoint chuẩn bị.
- Log/COMPLETED trước release giữ nguyên văn trong archive08/11-before-public-online; pilot2account đã tóm tắt. CI31failassertofflinecũ; sửa3nút tự khóa/mở theo mạng, giữ bot và thêm reconnect. Chờ fullCI head sửa trước mergePR20; backend đã sẵn sàng.

## 08/11/2026 · WC-ON1–ON4 pilot2account đã kiểm · codex/word-chain-online

- User duyệt JWT riêng staging và2tester; đã lưu/reload OFF đúng function. Schema/Edge/CORS/cron10giây active/hash_ready qua; thiếu/badbearer401, tickgiả/browser403. Không hỏi lại quyền đã có.
- PhòngSUKT6K: tạo4ghế/join/start2/ready, server nhận2đáp án, B bỏ cuộc→A thắng/rời.77YYHF kiểm host transfer, ghế cuối rời/closed code. Queue hủy/tìm lại/trả ghế/resetcountdown20s qua, timeout đúng hai bên,2phiếu tái đấu tạo trận mới.
- Cả hai tab đã đóng; cron tự đóngNS8MXF sau hạn rematch,3responseHTTP200/no timeout. Lượt đã timeout trước mốc đóng nên không nhận chứng minh no-client turn. [QA hiện tại](qa/WC-STAGING-2026-11-08.md); ảnh staging inline chưa có artifact local.
- CI28/head001d9c5success;34.512từ/50check,7UI/13Tank/offline/generated clean. Config.toml ghi setting đã duyệt; kiểm CI checkpoint mới trên PR19 trước merge. Chưa merge/phát hành từ mới/online, còn3–4account/2mạng/thiết bị/soak. Log/COMPLETED trước checkpoint giữ nguyên văn trong archive.

## 07/11/2026 · WC-PLAN / SN-PLAN DONE tài liệu · codex/word-chain-launcher-release

- Chủ dự án yêu cầu plan phòng/ghép trận/PK Nối Từ và phần còn thiếu của Rắn. Đối chiếu source5a64fef, core/Edge/UI và live-save QA; dùng playbook game-production-scrum, không nạp lại cả thư viện.
- [Nối Từ](word-chain/ONLINE-PLAN.md): ON1staging/tắt thưởng pilot→phòng riêng→FIFO→PK/đầu hàng→mạng/Auth/IME→nghiệm thu. Điểm thưởng chỉ có ref chống lặp cần gate; đầu hàng đã qua leave/server forfeit, cần kiểm toàn luồng thay vì nối thêm lệnh trùng. Không triển khai backend từ yêu cầu lập plan.
- [Snake](snake/CONTINUATION-PLAN.md): baseline/bundle→UI chơi-lưu-reload/JWT thật→thiết bị→R01/art/audio/playtest→candidate/phát hành. Cloud core và icon/banner đã có, không làm lại; chưa public.
- Build preview/test:snake-preview local qua; chunk game1,92MB raw/~1,35MB gzip là gap đóng gói public, sau đó6suite cloud/session/journey/boss/props/audio local cùng qua; chưa kiểm UI/thiết bị/live mới. [Số đo](qa/SNAKE-PLAN-BASELINE-2026-11-07.md).
- Đã cập nhật thẻ/roadmap/bàn giao, giữ tài liệu chi tiết đọc theo task. TC-R0 do chủ dự án để sau, log giữ [nguyên văn](archive/WORKLOG-2026-11-07-TC-R0-deferred.md). WC-L0 đã xong/merge3f943d9/Published sau CI24success; checkpoint báo cáo sau release tiếp ở nhánh.
