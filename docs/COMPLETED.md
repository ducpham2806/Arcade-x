# Tóm tắt công việc đã hoàn tất

Nguồn dài trước checkpoint11/11 được [lưu nguyên văn](archive/COMPLETED-2026-11-11-before-continuation-plan.md). “Đã merge/phát hành” không đồng nghĩa nghiệm thu toàn bộ thiết bị.

## PLAN-ADS / MERGE-AUDIT · 11/11/2026

- Main9061bfd/PR21 đã merge, CI36 xanh trên head47649f9; Netlify ready đúng main, sửa ghi chú bàn giao cũ.
- 28/31 head là tổ tiên main; docs patch tương đương, P3 song song, TankP2 còn port chọn lọc. Không merge lẫn P2/P3.
- User hoãn commerce và yêu cầu Google ads; chưa có AdSense/site Ready. Có plan/task/AC/test và vị trí L1/L2/G1, mock review không SDK.
- Không đổi runtime, SQL, payment hoặc phục vụ ads thật. Plan là đầu vào thi công, không đánh dấu các task gameplay/ads triển khai xong.
- Kiểm của lượt này ở WORKLOG; bước tiếp QA-ENV/ONLINE-V1 và ads readiness, rồi Snake theo roadmap.

## NETLIFY-BUILD · DONE · 07/11/2026

- Tái hiện TS2307 thiếu nested ws trên checkout sạch; dùng deps:tank-clash chung CI/Netlify trước lint/build, giữ Snake preview và mọi test.
- Local chuỗi preview exit0, Netlify Preview success; full CI b644da2 success, PR#17 merge main1131927. [Báo cáo](qa/NETLIFY-BUILD-2026-11-07.md).
- Production deploy6aee682dc2bd2dba16385690 Published,4bundle đầu trùng byte build đã kiểm; không đổi DB/server wire/chi phí.

## AUTH-XTAB phần sửa nguồn / logout release · 07/11/2026

- Nhánh codex/tank-clash-release-verification: sửa listener Auth giữ identity riêng, hủy restore cũ; thêm test:auth-session vào fast.
- Red/green:4/5 fail trước sửa,5/5 qua sau sửa; lint/build/bundle/fast qua; UI AuthProvider thật với fixture A→guest→B qua.
- Production hai account thật: B khác A, tab game nhận B, phòng A cũ không còn, tạo phòng B qua. [Chi tiết](qa/BUG-AUTH-CROSS-TAB.md).
- PR#17 đã merge/phát hành1131927. Hai tab bundle mới/B thật: tạo phòng→logout tab kia→về thư viện→Online hiện login, không còn hồ sơ B. Chủ dự án để ca đăng nhập A/mã B cũ sau; TC-R0 còn WAITING, TC-R1 chưa đạt.

## WC-PLAN / SN-PLAN · DONE tài liệu · 07/11/2026

- Nhánh codex/word-chain-launcher-release, nguồn5a64fef: [Nối Từ](word-chain/ONLINE-PLAN.md) staging→phòng→queue→PK→mạng/Auth→nghiệm thu; [Snake](snake/CONTINUATION-PLAN.md) baseline→UI/save→thiết bị/nội dung→release. Có task/file/AC/bằng chứng/ước lượng; lập plan không tự deploy hay bật flag.

## WC-L0 · DONE bot/offline ra sảnh · 07/11/2026

- PR18/main3f943d9: bundled-free/policy server, icon512/banner1280×640 từ2master ImageGen, hash/offline package. Online=false, không SQL production.
- Full CI24/head5882adf success,5UI Nối Từ/13Tank/generated clean; CUA PC/phone320–390 qua. Netlify6aeebb61665214227ba314ef Published,4JS+2ảnh byte-match; bot “cấm địa”→“địa giới”, exit qua. [QA](qa/WC-L0-2026-11-07.md).
- Audit WC-R0 xác nhận source đã ở main, catalog thiếu game; WC-L0 xử lý bằng bundled entry. CI24ảnh bị dọn, đã sửa upload trong PR19/CI26–28. Lịch sử chi tiết giữ [nguyên văn](archive/COMPLETED-2026-11-08-before-word-chain-pilot.md).

## WC-ON1–ON4 / WC-PUBLIC · đã pilot và phát hành · 08/11/2026

- Nhánh codex/word-chain-online→codex/word-chain-public-release: PR19 merge256620c/CI29; PR20 head970a941/full CI32 success, merge086d6ac. Netlify6af00f400397c396a118ca39 Published/main086d6ac đã đọc live;34.512từ public byte-match.
- Staging2account thật qua tạo/join/start2/cap4/PK, đầu hàng/kết quả, host transfer/mã đóng, queue/hủy/reset20s/timeout/2phiếu rematch; cron đóng phòng hết rematch khi đóng tab. [QA](qa/WC-STAGING-2026-11-08.md).
- User duyệt gói production riêng: schema/Edge/handlerAuth, CORS exact, legacyJWT OFF, cron10s/Vault. Đã áp và probe Auth/CORS/tick/RPC denial; tick thật200. Không lộ secret, không thay save/Auth/commerce.
- Public registered thật: tạo X9FL8R1/2→rời; queue1/4→hủy về menu. Lần đầu lỗi tải game, hard reload rồi mở được, nguyên nhân chưa xác định. [Bằng chứng cuối](word-chain/PUBLIC-RELEASE-2026-11-08.md).
- User bỏ gate3/4người, không nhận đã kiểm; ON5/ON6 (2thiết bị/2mạng/soak/Auth/IME/no-client turn) còn backlog. Online không XP/xu, cần receipt bền vững trước mở thưởng.
- Checkpoint codex/word-chain-release-handoff chỉ tài liệu; lịch sử [nguyên văn](archive/COMPLETED-2026-11-08-before-public-release-close.md). Tiếp Snake theo roadmap, chưa bắt đầu.

## Các module và mốc trước

TankP3/sảnh/motion/Battleship/Dungeon và nền tảng M0–M8 đã có trong main; Snake journey/save/audio là preview; Duel chưa cutover UI, commerce hoãn. Bằng chứng và giới hạn từng module giữ trong [bản đầy đủ trước checkpoint](archive/COMPLETED-2026-11-11-before-continuation-plan.md) và thẻ plans, không làm lại từ báo cáo cũ.
