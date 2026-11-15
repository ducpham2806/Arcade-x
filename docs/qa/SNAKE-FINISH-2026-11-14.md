# Snake R01 · hoàn thiện kỹ thuật · 14/11/2026

Nhánh `codex/snake-r01-finish`, từ2ca0b3c/PR33. Bản public vẫn8320385 tại checkpoint; chưa merge/deploy các bản sửa. [Thẻ Snake](../plans/SNAKE.md), [nghiệm thu còn lại](../snake/R01-ACCEPTANCE.md).

## Lỗi đã sửa

| Mức | Trước sửa / cách tái hiện | Bản sửa và kiểm chứng |
|---|---|---|
| S1 | Tài khoản mới Journey0màn, vào Story lại thấy sao/màn mở của guest; thắng/checkpoint/settings ghi guest | Truyền cùng store từ app sang story/lab, giữ completion.storage ưu tiên. Redbrowser2ca0b3c thất bại enabled!=disabled ởmàn2; green thắng bằngpointer, save/reload vàA/B/guest cùng checkpoint/tùy chỉnh theoowner. [Bug](../../production/qa/bugs/BUG-SNAKE-CATALOG-STORAGE.md) |
| S2 | Space trên Bắt đầu bị windowControls chặn; focus thoát dialog, Escape không đóng settings | Native button/input/select semantics, gameplaykeys chỉ khi chơi, focus theo lớp modal, Tab/ShiftTab wrap, Escape đóngsettings trướcwindow handler. RedSpace không đóngoverlay; green bắt đầu/settings/focus/Escape/tiếp tục. [Bug](../../production/qa/bugs/BUG-SNAKE-KEYBOARD-MENUS.md) |
| S2 | Marker boss ghi ĐIỂM YẾU nhưng chỉ tơ/cột; thiếu dài vẫn chỉ cột | Presentation chọn đúng target vàlabel TƠ/ĂN TÁO/CỘT A-B/ĐIỂM YẾU/CỔNG, minimap dùng chung kết quả; mộtpass chọn thức ăn, không đổi simulation. Unit kiểmtarget+label+purity và6ảnhfixtureRenderer. [Bug](../../production/qa/bugs/BUG-SNAKE-BOSS-OBJECTIVE.md) |

Không đổi engine/encounters, replay digest, save/checkpoint format, key/version, Gold/Gem hoặc thưởng chung. Dữ liệu guest cũ giữ nguyên, không tự gán cho một account không rõ owner. Public catalog vẫn lưu trên thiết bị; cloud preview không tự bật trong public.

## Runtime và kiểm tra

- `test:snake-player`:3ca browser đã qua trước checkpoint cuối: actual public catalog accountA thắng/lưu/reload, Btrống/guestbyte-identical; checkpoint vàsettings theoowner; nativekeyboard/focus/Escape. Ca bổ sung kiểm đổi tay ởsânluyện vẫn giữ sound/volume của Story đã có red/green; Lab giữ các trường tùy chỉnh ngoài schema riêng. Dedicated mode snake-catalog, file.browser.ts không thu vào defaultdevmode. CI snake_ui giữartifact `snake-player-evidence` trước suite sau dọn output.
- `test:snake-campaign-browser`: runner mới dùng Engine observer chỉ đọc và tuyến steering kiểm định có sẵn; game vẫn nhận pointer/keyboard qua UI với frame/time thật. Không sửa tim/thắng/tick/clock hoặc ghi sẵn campaign. Kiểm tuần tự mở khóa, tutorialboss, kết quả, receipt đúngmộtlần, journey/reload/cleanup. Lượt2màn đầu PASS. Lượt10màn đầu qua9màn3sao, thua bosspha2/3hit; giữreportFAIL. Chẩn đoán driverunit cập nhật mỗi60Hztick, vòngbrowser30ms+RPC giữinput nhiều tick nên tuyến lái nhạy. Driver mới giảm khoảng chờ/gửiDash chỉkhiđổi, resetvòngnốicột sauhitpha3 và backupstate thuđược sau mỗi thắng; khôngđổi luật game. V2 PASS10/10màn qua UI trong593,89giây wall-clock/555,15giây simulation,29/30sao, cả10màn còn3tim; boss6hit, tutorialpha2/3 bằngclick,2sao do4selfhit. Tiến trình/journey đúng sau reload và cleanup RAF/RO/listener/audio đều0, khôngpageerror. V2 chạy mới từblank không dùng --resume; cơ chếbackup/resume chưa được dùng để tạo kết quả này. LượtV1FAIL vẫn giữ riêng, không gọi runner thắnglượtđầu.
- Lint, build production/preview/rollback, bundle,6suite Snake local, previewpackage và media budget qua. Publicgame133.731byte raw, initialJS301.337byte gzip, maxchunk470.090byte raw; previewgame154.358byte raw; không nội tuyến media. Catalog/offline/retry503/guest-account và storagecompatibility qua. Player cuối3/3 (52,1s), hosting5/5 (29,6s) qua, không retry/skip/flaky. UI save/controls12ca đầy đủ do CI chạy đúnghead.
- `test:snake-ui-live -- --preflight`: exit2/WAITING_BINDINGS trướcnetwork; thiếu SNAKE_LIVE_EMAIL/PASSWORD/ACTOR_ID/GRANT_CONFIRMED. Chưa login/ghi backend, không có issuer expiry thật. Đây là thiếu fixture/grant, không phải lỗi code đã được tái hiện.

Evidence local đầy đủ `/workspace/tooling/snake-finish-evidence/`; bản local theo LookRule tại [production evidence](../../production/qa/evidence/snake-r01-20261114/README.md). Ảnh/JSON/trace ignored; source/art đã có giữ nguyên. Logs `/tmp/snake-player-red.log`, `snake-keyboard-red.log`, `snake-player-green.log`, `snake-campaign-full.log`, `snake-finish-*`. Không upload tài khoản/credential thật.

Ảnh boss6fixture là trạng thái đặt cho QA renderer ở390×844, không phải lượt chơi tự nhiên. Fullcampaign chụp kết quả từ gameplay thật theo đầu vào tự động, không phải human M2. Resourceprobe kiểm ownership/cleanup, cadence tối đa600frame gần nhất mỗi màn trong Chromium headless, không chứng minh60FPS/heap ổn định trên điện thoại.


| Màn | Giây engine | Sao | Tim |
|---|---:|---:|---:|
| 1-1 | 21.17 | 3 | 3 |
| 1-2 | 34.60 | 3 | 3 |
| 1-3 | 43.58 | 3 | 3 |
| 1-4 | 47.47 | 3 | 3 |
| 1-5 | 69.73 | 3 | 3 |
| 1-6 | 64.55 | 3 | 3 |
| 1-7 | 65.68 | 3 | 3 |
| 1-8 | 45.00 | 3 | 3 |
| 1-9 | 79.77 | 3 | 3 |
| 1-10 | 83.60 | 2 | 3 |

## CI56 và phép kiểm save-status Dungeon

CI56/head89e6aac: snake_ui success toàn bộ12UI+3player+5hosting/catalog, desktopmotion50/50 qua; verify dừng ở1/25ca polish Dungeon (24ca khác qua). Test phát eventerror giả, autosave thật5giây phátlocal và xóa UI đúng hành vi, nên assertion đua với autosave. Local test cũ8lần qua không thay bằng chứng failureCI; không coi đây là lỗi production của Snake.

Đổi test thành quota fault chỉ ở envelope Dungeon, thay đổi trạng thái bằng attack thật rồi bấm Lưu. Assert write đã thử/thất bại, thông báo còn khi lifecycle save thử lại, bytes bản lưu cũ giữ nguyên; khôi phục storage và Lưu lại phải hết lỗi. Không tăng timeout, tắt test hoặc sửa production. Lặp2viewport×2motion×3 đạt12/12(2phút), không skip/retry; CI bổ sung artifact motion-regression-evidence trước suite tiếp theo dọn output.

## Studio / Graphify / đóng mốc

Dùng game-qa-playtest/game-feel/game-ui-ux và Technical Director/QA. Delegate QA tìm/sửa marker, review độc lập storage/focus không còn blocker. AST code-only/local cùngscope src/games/snake-legend sau sửa:46file/424node/1101edge. QueryshowStory contextcall/depth1/budget700→3node2edge; graph đưa tới mountStory nhưng lỗi storage được xác minh từsource+redbrowser. Graph không thay runtime hoặc deployment proof.

Bản kỹ thuật R01 đã có code và lượt10màn UI. Kiểm cuối/CI xem kết quả đúnghead trước merge. Trạng thái fullCI/merge/deploy theo PR đúnghead sau push, không dùngCI55 của nguồn trước làm proof bản mới. R1a Android/iPhone/Safari, R1b người mới/art/animation/audio thật và R0b backend/JWT thật tiếp tục WAITING cho tới khi có kết quả thực. [Phiếu nghiệm thu](../snake/R01-ACCEPTANCE.md) sẵn sàng, chưa điền PASS cho người chưa chơi.
