# AD-02a · policy/loader core · 11/11/2026

Nhánh codex/ads-policy-loader từ482b8ed/PR24. CI40 của PR24 success; đây không phải kết quả CI nhánh mới. Chưa merge/deploy, chưa có AdSense/site Ready, không đổi commerce/SQL/backend.

## Đường đi và mặc định

LauncherAdProvider đọc GameSession/LauncherUi, busy/notice và số game; App truyền splash/discard. AdProvider theo dõi online, document visibility, breakpoint768 và force-update pending. LauncherAdPlacement chọn preview dev hoặc AdSlot thật. Config thiếu/flag off/consent unknown không tạo khung hoặc tải SDK. Một tab đã vào trận, lobby, queue, loading hoặc kết quả vẫn có activeGameId nên bị chặn toàn bộ display ads.

Config chỉ nhận enabled/siteReady bằng chuỗi true, PROD boolean và VITE_ADS_DEPLOYMENT=production, publisher/unit đúng định dạng. Đọc VITE_ADS_ENABLED, VITE_ADS_SITE_READY, VITE_ADS_CLIENT, VITE_ADS_L1/L2; không có ID mẫu trong config runtime. Những biến này là public, không phải secret. Chưa đặt biến nào lên Netlify. Đến AD-03 phải scope Build/production, giữ CI/deploy-preview tắt và kiểm lại bản build thực tế.

Consent mặc định unknown; không lấy consent từ query/localStorage, login, locale hoặc navigator. AdProvider chỉ có hợp đồng nhận snapshot status/canRequestAds từ integration CMP sau này; LauncherAdProvider chưa cấp granted. Vì vậy chỉ bật env cũng không thể request ads. Không tự làm popup giả thay CMP, không tự xác nhận tuân thủ từ boolean; đây là gate pilot của dự án, chưa là bộ giải mã TCF. [Yêu cầu CMP của Google](https://support.google.com/adsense/answer/13554116?hl=en) đã đọc lại: chọn và tích hợp CMP phù hợp trước bật thật, gồm yêu cầu certified CMP/TCF cho personalized ads ở EEA/UK/Switzerland.

## Tải, request và kết quả

- SDK một promise/client/document; mismatch hoặc tag không thuộc loader bị từ chối. Error/timeout/insert failure là terminal trong document, không retry bằng timer/filter; lỗi load cũng đóng các mount sau trong document thay vì tạo lại khoảng trống. Mã adapter nội bộ có trong bundle; script Google tải khi eligible, core loader timeout8s, kết quả unit timeout10s. Chỉ URL SDK chuẩn và publisher ID được truyền, push rỗng theo code display; không UID/email/JWT/room/save/custom targeting.
- StrictMode replay được hủy bằng AbortController; sau await phải kiểm lại config, consent, ngữ cảnh và layout. Container hidden/width0 không load; ResizeObserver cho phép tiếp tục khi đo được, không polling.
- Budget launcher dùng chung cho document, một lần thử request; Google adapter cũng chặn push trùng element. Modal/filter/game/auth-provider remount hoặc resize không reset budget. Nếu bị chặn trước push thì chưa tiêu budget; load đang có vẫn dùng chung. Nếu đã request rồi dỡ slot, quay lại cùng document không tạo lượt khác. Đây là pilot bảo thủ, chưa tối ưu doanh thu.
- data-ad-status filled/unfilled/unfill-optimized khác data-adsbygoogle-status xử lý. Observer/timer/listener được dọn khi xong hoặc abort. No-fill/error/timeout giữ diện tích đã reserve trong view; không collapse đột ngột hoặc chèn liên kết/thưởng để thay creative. Flag off/ineligible không tạo placeholder. [Nguồn trạng thái và collapse](https://support.google.com/adsense/answer/10762946?hl=en).
- Vào game/mất consent dỡ unit và hủy callback ứng dụng. Script đã chạy không thể được ứng dụng cam kết ngừng mọi kết nối nội bộ Google; không sửa creative/iframe. Chỉ display ngoài gameplay theo [hướng dẫn game pages](https://support.google.com/adsense/answer/2768340?hl=en); H5 vẫn ngoài scope.

## Regression về thứ tự khởi tạo

Đã tái hiện red: runtime defer adapter.load vào microtask làm SDK append thấy eligibility=false sau khi caller rời lượt đủ quyền. Dynamic import adapter cũng tạo một khoảng await tương tự. Sửa bằng adapter nội bộ import tĩnh và runtime gọi load đồng bộ trong cùng lượt đã kiểm quyền; script Google vẫn tải theo gate. Regression dùng iframe với append bị thay bằng spy: red [false], green [true],0 request ngoài. StrictMode vẫn single-flight. Sau await SDK, trước push tiếp tục kiểm consent/context/layout; script đã bắt đầu trước khi quyền đổi vẫn chịu giới hạn nêu trên. Không giữ lazy module import để đổi lấy rủi ro khởi tạo muộn; chi phí mã nội bộ được đo ở bundle.

## Kiểm và giới hạn

- Renderer2/2, browser18/18: config/context/empty gate; zero width; eligible StrictMode; SDK single-flight/failure/timeout/client conflict; duplicate push; processing khác fill; abort/late result; no-fill/error/timeout vẫn bấm Chơi; modal/filter/remount/resize không refresh. Harness fake adapter và SDK event giả trong iframe có append bị chặn, không chèn script Google vào mạng. AfterEach xác nhận0 request Google ads. Harness dưới tests không vào dist.
- App preview320–1440px và splash/force-update qua; production10HTML/PWA guide/privacy offline, query không bật ads,0 Google ads request/lỗi JS qua. Không có real fill, CMP/TCF certification test hoặc extension adblock thật.
- Typecheck/build/bundle/startup/storage/readability qua: launcher293,5kB gzip (+2,3kB so PR24), dưới400kB;90chunk, precache61entry. Chưa tính băng thông Google/CMP vì chưa bật thật. Motion48/48+VFX25/25, smoke game24/24, launcher7/7/offline7/7 và idle3,9render/s trong12s đã qua. Sau sửa thứ tự SDK:18browser+2renderer qua; lint/build/bundle/production/perf/launcher7/7/offline7/7 qua. Game24/24 và motion48/48+25/25 được kiểm trước sửa loader cuối, không chạy lặp vì CSS/engine không đổi; full CI sau commit vẫn là gate trước merge. Bằng chứng cục bộ ở /workspace/arcadex-ad-policy-evidence-2026-11-11.

## Graphify và phần tiếp

AST local0.9.106, scope ads/App/catalog/GameContext/ForceUpdate/LauncherContext/tests,238node/399edge; query AdSlot symbol+contextcall/budget700 cho6node/6edge. Hai test inline thiếu symbol dùng rg hẹp. Không LLM/upload hoặc nạp toàn graph; chưa đo tỷ lệ tiết kiệm token.

AD-02a core có code; CMP thực, owner account/site Ready/ID/domain/license/CSP/deploy context vẫn là gate AD-03. G1 chưa gắn. Cần profile CLS/LCP/INP và byte Google/CMP trên pilot được duyệt; fake frame/bundle budget không chứng minh hiệu năng ads thật. ONLINE-V1 chưa chạy lại: policy môi trường vẫn revision1/host trống, chưa có hai account thật. Không retry Render khi host chưa được mở.
