# Nối Từ — catalog và online

Mốc 06/11/2026. Có bot/offline, UI/core phòng server, schema/Edge/test. `src/games/word-chain/online-config.json` đang `enabled:false`. Trạng thái migration/catalog production chưa xác minh; game có trong registry không chứng minh DB đích đã cập nhật.

**Đầu vào Markdown:** [WORD-CHAIN-SERVER](../WORD-CHAIN-SERVER.md), phần triển khai/schema/tick; [PENDING-DECISIONS](../PENDING-DECISIONS.md) #7/#8. Chỉ đọc spec luật khi đổi luật.

## WC-L0 · ACTIVE · ra sảnh với bot và artwork · 07/11/2026

- Chủ dự án yêu cầu public game trong sảnh, icon/banner. Phát hành free/offline từ bundle giống Tank; giữ online=false và ưu tiên maintenance/premium của server; không migration production.
- File đích: catalog/repository, registry/FeaturedCarousel, art pipeline/masters, packageAssets và test catalog/offline/UI.
- ImageGen:2master phong cách khối chữ ivory/amber trên nền indigo; icon512 và banner1280×640, URL có hash, lưu prompt/provenance Markdown cạnh master. Không đưa toàn ảnh vào JS đầu trang.
- [ ] Catalog cloud cũ vẫn hiện đúng1game, mở/bot/favorite/recent/offline; không bypass policy server.
- [ ] Icon/banner thực tế PC/mobile, chữ dấu Việt đúng; build/bundle/fast và full CI trước merge/phát hành, kiểm Netlify production.
- Game_Studio_Agent main vẫn c5dac462,297blob/116skill/21role/4rules đã khớp; giữ một discovery entrypoint, đọc theo nhiệm vụ.

## WC-R0 · READY · catalog/schema staging sau release bundle

- Audit07/11: source/test đã có trong main và nhánh hiện tại; RPC catalog công khai không trả word-chain, fallback chỉ DEV; online vẫn tắt. [Bằng chứng](../qa/WC-R0-2026-11-07.md). Chưa kiểm history/staging hoặc thay DB.

- File đích: `supabase/migrations/20261102090000_word_chain_catalog.sql`, `src/launcher/catalog.ts`, registry và package game.
- [ ] Đọc catalog/migration history đích; thử riêng migration trên staging, không chạy lại cả bộ lên production.
- [ ] Kiểm không trùng ID/quyền, bot/offline/mở/thoát và game cũ giữ nguyên. Chuẩn bị rollback; production theo quyền hiện hành, không coi roadmap là quyền SQL.
- **Xong:** báo cáo `.md` có project/mốc nguồn/SQL test/kết quả catalog; production chưa đổi ghi riêng.

## WC-R1 · READY phần chuẩn bị / WAITING triển khai được chọn

- File đích: `supabase/functions/word-chain-room/`, `supabase/word-chain/`, script prepare, `src/games/word-chain/online-client.ts`, online-config.
- [ ] Schema staging → test → deploy function → Vault/scheduler tick; xác nhận quyền server và phòng không treo. Không lộ secret trong báo cáo.
- [ ] Bật online trong build thử; 2–4 account tạo/join/queue, host bắt đầu sớm/tự bắt đầu, sai từ/retry/idempotency, drop/reload/elimination/result/rematch.
- **Xong:** mọi client cùng lượt/kết quả; client không tự ghi phòng; scheduler giải quyết phòng bỏ dở; có đường tắt flag và rollback.

## WC-R2 · WAITING thiết bị · bàn phím và nghiệm thu

- [ ] Telex/VNI trên desktop/điện thoại; không mất dấu hoặc submit lúc IME composing; focus/modal/bàn phím dọc/ngang.
- [ ] Rà từ thiếu/không phù hợp bằng nguồn từ điển và builder; không sửa nội dung chỉ từ giả định.
- Kiểm: `test:word-chain`, `test:word-chain-ui`, `test:sql`; smoke/game/offline khi đổi launcher. Tài khoản/mạng thật tách khỏi HTTP fixture.
- Đầu việc đầu tiên: WC-R0 kiểm catalog hiện tại; sau đó triển khai thử theo #7, không bật production từ plan này.
