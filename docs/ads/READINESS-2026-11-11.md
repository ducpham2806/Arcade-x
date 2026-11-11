# Ads readiness · 11/11/2026

Nhánh codex/ads-readiness-display-slots từ QA882e12e/PR23, kế tiếp plan7aae308/PR22. Chưa merge/deploy. Commerce hoãn; AdSense chưa có/site chưa Ready.

## Phần triển khai

- AD-01b phần nội dung: mười trang HTML public được sinh từ Markdown: năm hướng dẫn Nối Từ, Tank, Car Escape, Shikaku, Word Cross; chỉ mục hướng dẫn; About, Contact, Privacy, nội dung/hình ảnh. Không thêm dependency hoặc JavaScript vào các trang này. Footer/intro launcher có link thật.
- Liên hệ dùng GitHub Issues công khai đã kiểm đường dẫn tồn tại; không bịa email/tên pháp nhân. Trang cảnh báo không đăng dữ liệu nhạy cảm, hướng người cần xử lý tài khoản hỏi kênh riêng trước. Owner còn xác nhận contact/chủ thể, thời hạn dữ liệu và quyền sử dụng từng asset; đây chưa phải kiểm toán giấy phép hoặc hồ sơ sẵn sàng gửi Google.
- scripts/site-pages.mjs phục vụ dev và emit build cùng nội dung; renderer hẹp có escape HTML và chỉ nhận link nội bộ/HTTPS. Không sử dụng raw HTML từ Markdown. Cấu hình SITE_URL chỉ nhận HTTPS origin; không đặt thì bỏ canonical/sitemap thay vì đoán domain. Chốt domain rồi đặt SITE_URL ở môi trường build, rebuild và kiểm canonical/sitemap trước review. robots.txt được sinh; chưa ads.txt vì chưa có publisher ID thật.
- Service worker precache các trang nội dung và loại chúng khỏi SPA navigate fallback. Thêm trang404/rule Netlify cho đường dẫn nội dung chưa tồn tại, không force che file thật. Local Vite không mô phỏng đầy đủ CDN Netlify; vẫn cần kiểm status404 sau deploy được duyệt.
- AD-02b preview L1 desktop sau intro/benefits; L2 mobile sau tám thẻ All Games, không hiện khi tìm/lọc hoặc thư viện ≤8. Mỗi breakpoint chỉ một vị trí hiển thị. CSS giới hạn launcher, không sửa gameplay.
- Mở preview bằng npm run dev rồi /?ads-preview=1. Production không cho query bật preview; mặc định không có placeholder/khoảng trống ads. Preview dỡ khi activeGameId, activeModal, chat, store hoặc offline. Gate cho splash/discard/force-update và consent vẫn phải hoàn thiện ở AD-02a trước SDK thật. Không Google SDK/ID/request; đây chưa phải AD-02a loader/provider/consent, không đánh single-flight/no-fill/timeout là đã triển khai.

## Kiểm nguồn tài nguyên trong phạm vi lượt này

Tìm tên file license/credits/attribution ngoài dependencies/archive thấy bốn file giấy phép. Word Cross giữ Unlicense và [SOURCES](../../public/games/word-cross/SOURCES.md) nêu dwyl/english-words cùng hash; Nối Từ giữ CC BY-SA4.0 và [SOURCES](../../public/games/word-chain/SOURCES.md) nêu which-dialect/Kaikki/Wiktionary, bản thích nghi và attribution. src/games/word-chain/index.tsx có dòng ghi công trong game. Blossom có public/blossom/LICENSES.md (mô tả gói concept/script đời trước) và nhạc procedural CC0 riêng. Sự tồn tại các file này chưa chứng minh mọi art/font/audio của 24 game hiện tại đã được đối chiếu từng tệp; không xóa hoặc đổi attribution/giấy phép. Còn lập inventory bao phủ tài nguyên thực tế trước hồ sơ kiếm tiền; không đánh AD-01b toàn bộ là DONE.

## Kiểm chứng

- Renderer/link/safe HTML/canonical:2/2; browser preview:3/3. 320/390/768/1280/1440px không tràn, L2 đúng sau tám card, tìm/lọc/modal/chat/offline/game gate qua; không request Google ads.
- Production:10 trang trả HTML đúng byte output, service worker mở guide/privacy offline đúng trang (không SPA fallback), query không bật được preview; không lỗi JS/request Google ads. Đã xem ảnh guide390/1440 và launcher390. Mười trang thêm38.674byte HTML trước nén, không JS trang nội dung.
- Motion lượt đầu47/48: Battleship normal không tiến frame ở probe. BaselineQA882e12e riêng2/2 qua; không sửa/nới test. Lượt full cuối48/48 desktop +25/25VFX/polish qua; chưa kết luận nguyên nhân lượt đầu, giữ log đỏ cùng log cuối.
- Typecheck/build/bundle/startup/storage/structure qua; bản lưu giữ65method/112replay và Supabase23method/60replay khớp golden. Bundle launcher291,2kB gzip dưới400kB, precache61entry; không dependency mới.
- Test mới ban đầu dùng selector trùng/không hợp mobile và Escape trước dialog lazy mount; sửa selector/đợi dialog thật. Production runner ban đầu reload trước worker activation; chờ serviceWorker.ready rồi qua. Không thay runtime Auth/game để xử lý các lỗi runner này.
- Smoke cuối: launcher7/7flow, game24/24mở/input/thoát, offline7/7 qua. Log/ảnh cục bộ ở /workspace/arcadex-ads-evidence-2026-11-11. Không dùng fixture hoặc preview chứng minh Google đã duyệt hay serve ads. Chưa thiết bị thật, chưa kiểm CDN Netlify hoặc full CI của nhánh.

## Graphify và đầu vào

CLI0.9.106 AST-only, không LLM/upload. scripts/graphify-qa.py thêm --include lặp để đổi scope hợp lệ trong repo; không reuse graph QA cho launcher. Lần đầu12file→147node/277edge; sau module mới177node/328edge. Query bằng symbol seed và --context call giữ câu trả lời nhỏ: GameCatalogView→AdPlacementPreview. Hai test inline không sinh symbol hữu ích, dùng rg hẹp. Không công bố tỷ lệ tiết kiệm token chưa đo.

## Bước tiếp

AD-01a chờ account/domain/verification; AD-01b chờ owner xác nhận và kiểm asset; AD-02a còn policy/consent/config/provider/loader/fake-provider với StrictMode/single-flight/no-fill/timeout; G1 chưa gắn. AD-03 chờ site Ready, ID, CMP phù hợp và thời điểm phát hành. ONLINE-V1 vẫn chờ egress và hai phiên account thật; kiểm lại revision1/custom_hosts trống và Render CONNECT403 trước backend trong lượt này. Không đổi SQL/server/env/gói.
