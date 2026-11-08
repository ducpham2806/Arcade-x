# Nối Từ · phát hành online công khai · 08/11/2026

**ACTIVE.** User yêu cầu merge và phát hành online, không cần nghiệm thu3–4người nữa. Đây là waiver ca thật, không ghi chúng đã qua; giữ nguyên fixture và mọi kiểm tra CI. Thưởng online vẫn tắt; bot/offline và save giữ tương thích.

## Mốc đã làm

- PR19 đã merge main`256620c93c9aa22141f72786352168052f8caf40` sau full CI29/headfde7810success. Netlify tự build; chưa xác nhận Published cho mốc này. Main hiện vẫn online=false; bộ từ34.512 và client phòng đã merge.
- Nhánh tiếp `codex/word-chain-public-release`: bật online-config=true, kiểm tên function, UI phone/desktop bắt buộc thấy3entry online nhưng guest phải nhận yêu cầu đăng nhập trước khi tạo ghế; sau đó bot vẫn chơi hết trận. Không bỏ/nới assert hoặc tắt fixture4người.
- Local Node24 lint,50check Word Chain, launcher regression, build/bundle đã exit0. Full CI của bản bật flag cần qua trước merge.
- Production Auth/config của launcher dùng `https://whjatkhhupeqfngakmee.supabase.co`; room client tự dùng cùng URL/key/UID. Không dùng Auth hoặc DB staging cho người chơi public.
- Probe OPTIONS endpoint production `word-chain-room` trả404NOT_FOUND. CUA đọc dashboard đúng projectArcade-x/whjatkhhupeqfngakmee, orgNam A Uniform/Free,Healthy; chưa ghi SQL hoặc deploy function production.

## Gói backend cụ thể đã chuẩn bị, chưa áp

1. [Schema](../../supabase/word-chain/schema.sql), đã PGlite/staging kiểm: chỉ wc_private và public.wc_room_*; RLS/service-only, CAS/one-seat/rate/receipt. Artifact `/private/tmp/word-chain-production-schema.sql`,12.310byte, SHA256`17116490a6ebd87118fccf8244f2f733b65dfc86baaa1da5d11fa78f03add814`, BEGIN/COMMIT bao quanh nguồn.
2. `build:word-chain-edge` tạo `/private/tmp/word-chain-room-index.ts`,487.451byte, SHA256`aeafa014767d50b2da523682e91f35f5f95d5abc5cc0a5f1c4c30de7c6a752d8`. Deploy riêng `word-chain-room` production, dùng env server Supabase cung cấp. Legacy JWT OFF; handler vẫn Auth.getUser/registered-only, tick dùng credential riêng.
3. WORD_CHAIN_ALLOWED_ORIGINS chỉ`https://arcade-x.netlify.app`. Không wildcard; không mở localhost hoặc staging trong production.
4. [Scheduler](../../supabase/word-chain/scheduler.sql), thay public projectURL đúng production. Artifact `/private/tmp/word-chain-production-scheduler.sql`,2.202byte, SHA256`d55f1f7da51743b3ac845673247a4260c30fd23b518a9d1175ea48791d3b162b`; transaction và guard từ chối Vault projectURL khác nếu đã có. Script sinh token riêng trong Vault, chỉ lưu hash ở wc_private, cron10giây chỉ POST khi có room đến hạn. Không đọc/copy service-role key hoặc token ra ngoài.

**Quyền đã có:** user08/11 trả lời “Cho phép gói Nối Từ production” cho đúng schema/cron/token Vault, function, CORS và legacyJWT OFF ở whjatkhhupeqfngakmee. Đây là exception hẹp cho WC-PUBLIC đối với AGENTS cấm SQL production; không mở quyền script production khác. Xác nhận CUA đổi lớp JWT production đã có trong cùng gói. Không hỏi lại. Chưa áp backend tại checkpoint chuẩn bị này; ghi kết quả thực sau thao tác.

## Thứ tự cutover khi được xác nhận

Áp schema→deploy artifact/handlerAuth/CORS→cài cron→đọc job/hash_ready/role denial và probe Auth/CORS thật→full CI của flagtrue→merge release→Netlify Published đúng SHA→kiểm asset dictionary byte/revision và UI sảnh/guest/registered nếu còn phiên thật. Không mở flag public trước backend sẵn sàng.

## Giới hạn và rollback

Pilot2account thật đã qua ở [QA staging](../qa/WC-STAGING-2026-11-08.md). User bỏ gate3/4người; không báo đã kiểm.2thiết bị/2mạng/soak, IME/expiredAuth/reconnect và no-client turn timeout riêng chưa nghiệm thu; ghi rõ sau phát hành, không giả dữ liệu/thành tích.

Rollback: tắt online-config và deploy lại launcher; bot tiếp tục hoạt động. Nếu cần dừng tick, cron.alter_job theo mẫu cuối scheduler.sql. Giữ dữ liệu phòng/receipt để truy vết; không DROP/DELETE hoặc đổi schema save/Auth/commerce trong gói này.
