# Nối Từ · phát hành online công khai · 08/11/2026

**DONE phát hành:** phòng riêng/nhập mã/PK/ghép trận và34.512từ tại https://arcade-x.netlify.app/. PR20 merge086d6ac, NetlifyPublished đúngSHA, đã kiểm tạo/rời phòng và vào/hủy queue bằng phiên registered thật. User bỏ gate nghiệm thu3–4người; không nhận đã qua, giữ fixture/CI. Online chưa thưởng XP/xu; bot/offline/save giữ tương thích.

## Nguồn, CI và Netlify

- [PR19](https://github.com/ducpham2806/Arcade-x/pull/19): headfde7810/full CI29 success, merge256620c93c9aa22141f72786352168052f8caf40. Client phòng và từ điển đã merge; Netlify6aefbb84f938d9fb0842e6a4 Published ở mốc này.
- [PR20](https://github.com/ducpham2806/Arcade-x/pull/20): nhánhcodex/word-chain-public-release, head970a9416d859fd5b2b332d7513c5aeb2ed7ebf95; [full CI32](https://github.com/ducpham2806/Arcade-x/actions/runs/42429931818) **success**, job128576372469. Merge **086d6ac4619f77bad8470d09f9c0bf0c7f17df23**.
- CI32:50logic/schema/Edge/client checks,7offline,7WordChainUI,13TankUI, toàn bộ build/bundle/fast/motion/generated clean. Đã xem ảnh menu3nút khóa offline và botready trong artifact13596604240; UIartifact13597566803. Không bỏ test4ghế.
- CI31/head ea4fc66 trước đó fail assertion offline cũ “online rooms exposed before release”. Đã sửa contract public:3nút hiện nhưng disabled offline/thông báo rõ, bot vẫn chơi; reconnect mở lại nút, platform guard offline trước Auth. CI32 kiểm đúng head sửa. Lịch sử nguyên văn [ở đây](../archive/WC-PUBLIC-2026-11-08-before-release-close.md).
- CUA dashboard Netlify đã thấy **Currently published Production / main@086d6ac / Release public Nối Từ rooms and matchmaking**, [deploy6af00f400397c396a118ca39](https://app.netlify.com/projects/arcade-x/deploys/6af00f400397c396a118ca39). Không dùng báo cáo release cũ làm bằng chứng Published hiện tại.

## Quyền và artifact backend đã áp

User08/11 trả lời **“Cho phép gói Nối Từ production”** sau review file/SHA cho đúng projectwhjatkhhupeqfngakmee: schema, cron/token Vault riêng, functionword-chain-room, CORS chỉhttps://arcade-x.netlify.app, legacyJWT OFF. Handler vẫn Auth.getUser/registered-only. Đây là exception hẹp WC-PUBLIC đối với AGENTS, không cho phép SQL production khác; không hỏi lại quyền đã dùng.

| Artifact đã review và áp | Byte | SHA256 |
|---|---:|---|
| word-chain-production-schema.sql (BEGIN/COMMIT từ schema.sql) | 12.310 | `17116490a6ebd87118fccf8244f2f733b65dfc86baaa1da5d11fa78f03add814` |
| word-chain-room-index.ts (build:word-chain-edge) | 487.451 | `aeafa014767d50b2da523682e91f35f5f95d5abc5cc0a5f1c4c30de7c6a752d8` |
| word-chain-production-scheduler.sql (URL production + transaction/guard) | 2.202 | `d55f1f7da51743b3ac845673247a4260c30fd23b518a9d1175ea48791d3b162b` |

Nguồn: [schema](../../supabase/word-chain/schema.sql), [scheduler](../../supabase/word-chain/scheduler.sql), supabase/functions/word-chain-room. Artifact dựng ở/private/tmp, không phải đầu vào phiên bền vững. Schema chỉwc_private/public.wc_room_*, service-only/CAS/one-seat/rate/receipt. Scheduler tự sinh token trong Vault/DB chỉhash, không copy service-role key vào cron/browser. Không đọc/xuất secret; không đổi save/Auth/commerce.

## Bằng chứng backend production08/11

- Trước cutover endpoint404. Đúng dashboardArcade-x/whjatkhhupeqfngakmee/Nam A Uniform/Free/Healthy; schema transaction query2f5bbaf5-d489-4e78-8508-fb075006bb14 trả **Success. No rows returned**.
- Edgeartifact đúng đầu/cuối/tên đã deploy; Details lưu legacyJWT OFF, reload xác nhận OFF/Save disabled. WORD_CHAIN_ALLOWED_ORIGINS Save thành công, chỉhttps://arcade-x.netlify.app; không wildcard/localhost/staging.
- Scheduler query392a5dfb-5346-43b6-9b6a-7f0c0e3e76bf trảjob3; audit5f8d83a8-9c15-48d2-8085-d91fb85838d1:word-chain-room-timeouts/10seconds/active=true/hash_ready=true.
- Smoke tick thật dùng Vault header nội bộ, không xuất token: request25, HTTP200/timed_out=false/{updated:0,serverNow:1794097340202}, response2026-11-08T00:22:17.403772Z. Không có room tới hạn lúc probe; không coi updated0 là đã kiểm turn timeout.
- HTTPS probes: publicpreflight204/exactACAO; originlạ403ORIGIN_DENIED; thiếu/sai bearer401UNAUTHORIZED; tickgiả và browser-origin tick403UNAUTHORIZED_TICK. Publickey gọiwc_room_read/wc_room_tick_authorized đều401/42501.
- Dictionarypublic `/games/word-chain/words.v2-4809405e0579.json`:200/34.512/byte-match; SHA256`b88db3f2d250b1a705e7b1b6aaf1746397841959509560821acdee93818ed773`. Giữ toàn bộ từ cũ/3.011opener, v1 không đổi; v2prefixpacked328.672byte trong budget400KB.

## Giao diện public08/11

Chrome profilexuan duc, URLhttps://arcade-x.netlify.app/: sảnh có icon/banner Nối Từ; mở menu thấy LUYỆN VỚI BOT/GHÉP TRẬN/TẠO PHÒNG/NHẬP MÃ và34.512từ. Lần mở đầu hiện lỗi tải game, thử lại chưa được; hard reload rồi mở từ sảnh thành công. Chưa xác định nguyên nhân; không tuyên bố đã sửa lỗi cache.

Phiên registered sẵn có: chọn2ghế→tạo **X9FL8R,1/2** (chủ phòng/ghế trống/cầnít nhất2người), screenshot inline đã xem; Rời phòng→menu. Ghép trận→**1/4,đang ghép người chơi**→Hủy tìm trận→menu. Không giữ phòng/queue thử sau kiểm. Không đổi mật khẩu, không đọc token, không tạo giả user/đáp án. Không có account thứhai trong smoke production này; PK2account đã kiểm staging, guest guard kiểm trong CI32.

## Phần còn lại và rollback

[Pilot2account thật](../qa/WC-STAGING-2026-11-08.md) đã qua phòng/PK/queue/timeout/rematch/host transfer. Đóng2tab→cron đóng phòng hết rematch; no-client turn timeout riêng chưa chứng minh. User bỏ gate3/4người, không báo đã kiểm. ON5/ON6 còn2thiết bị/2mạng/soak/IME/expiredAuth/reconnect bằng phiên thật. Online chưa XP/xu, cần receipt bền vững trước mở thưởng.

Rollback: tắt online-config và deploy lại launcher, bot vẫn hoạt động; dừng tick bằng cron.alter_job theo mẫu scheduler nếu được yêu cầu. Giữ room/receipt, không DROP/DELETE. Checkpoint codex/word-chain-release-handoff chỉ ghi bằng chứng/tóm tắt sau phát hành; runtime đã ở main086d6ac, không triển khai lại backend để chốt docs.
