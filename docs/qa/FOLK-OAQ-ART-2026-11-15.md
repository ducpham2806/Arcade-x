# Ô Ăn Quan · asset/UI v1 · 15/11/2026

Nguồn `a4d1a9c`/PR37; nhánh `codex/folk-oaq-art-ui-20261115`. Anh yêu cầu ưu tiên asset và UI chuẩn chỉnh, update Game Studio Agent. Ô Ăn Quan trước/Lò Cò sau; Kẹo trước/tiền chung sau; Netlify HOLD.

## Bản thay đổi

- Studio cập nhật chính xác tới `fa7b1db`:340 blob/125 skill/21 role/4 rule/7 template; không collision. Bỏ297 file cache graphify-out upstream. Manifest hash không nới; nguồn/root check và per-skill125 PASS. Validator source9 warning; validator flatten3 lỗi đường router, trigger fixtures thiếu90 mục ở cả nguồn và bản cài: ghi trong INSTALLATION, không nhận đã PASS mọi upstream check. Giữ15 whitespace nguồn ui-designer nguyên byte.
- Dùng create-game-assets/game-ui-ux/game-qa-playtest, Art/UI Lead, Technical Director và QA độc lập. Graphify local OAQ7 file/82 node/170 edge, shared11/97/198; query render depth1/budget900 tìm drawOaqProp/drawOaqHand. Wrapper được đọc nguồn và kiểm qua browser; graph không thay runtime.
- Bốn master ImageGen có provenance: sân đình, atlas quân/đạo cụ, tay/mẹt, mặt bàn. Năm cặp Dân/Quan, bốn mặt bàn, ba tay/mẹt có mapping riêng dùng trong match/HUD/shop. Source PNG giữ nguyên; WebP lossless đúng từng pixel RGBA; atlas cắt bằng rect engine đã kiểm, không tin grid sinh.
- Home mới có CTA bot/local rõ và online Sắp có. Bàn giữ P1/P2 cố định, điểm đúng bên; nhãn số DOM≥10px trên phone, native chọn ô bổ sung cho ô chạm nhỏ, nút rải≥56px. Modal focus trap/Escape/khôi phục focus; shop/hướng dẫn/internal pause và pause ngoài game chặn bot/input; giảm chuyển động dừng bob preview.
- Launcher pause/exit cho Folk không còn quảng bá resume một ván chưa serializable: bỏ generic autosave/suspend cho đúng hai ID Folk, copy nói rõ rời sân kết thúc ván. Không đổi save profile format/owner/receipt hoặc luồng của game khác. Envelope paused Folk từ preview cũ chưa được dọn; thuộc giới hạn legacy preview/FD-3.

## Kiểm chứng local

- Studio340/340 hash; docs/structure PASS. Art report: dimensions thực1536×1024 và1254×1254, alpha thật cho hai atlas, source/runtime RGBA giống nhau. Tám file source/runtime có SHA256/provenance; 12 skin mapping đầy đủ; crop trong texture; runtime **5.633.804 byte**, decoded **25.161.648 byte**, dưới6MiB/32MiB. Đã xem contact sheet.
- Folk rules/reward9 unit và asset guard PASS; lint PASS. Build/bundle/package/fast và Snake rollback/catalog PASS: launcher292,4kB gzip, max chunk455,0kB raw; full-release24 game/933 resources/24 art giữ nguyên.
- Browser bốn viewport1440×900,390×844,320×568,844×390: home/board/shop, local rải/chuyển lượt, điểmP1=6/P2=0 sau nước mở đầu, label số, focus/Tab/Escape/native select; action≥56px; bounds và không giao HUD/board/control; không pageerror. Bot dừng và tiếp tục sau các overlay; fallback ảnh vẫn đi được. Đường pause exit và exit-confirm không quảng bá lưu ván. **9/9 PASS** ở rerun cuối1,3phút; đã xem home desktop, shop390, board320 và844×390, contact sheet. QA độc lập không còn blocker tĩnh; đầy đủ full CI đúng head còn chờ.
- Red đã sửa: shop mobile mất tên vì display:none;320px P1strip chồng controls dù bounds ngoài vẫn đúng; home caption nhạt do readability tính nền dưới pseudo-gradient. Đổi aria-label, board fit theo chiều cao có reserve HUD, nền caption thực. Test pause ban đầu dùng locator không scoped trùng nút launcher/game: sửa fixture, không coi là lỗi sản phẩm.

## Bằng chứng / tái tạo

`npm run test:folk`, `npm run test:folk-ui`, `npm run build && npm run test:folk-package && npm run test:bundle`, `npm run test:fast`. Binaries/log/report ở production/qa/evidence/folk-oaq-art-20261115 (ignore); stamp.md ghi hash nguồn. CI giữ test-results/folk-ui và folk-assets trong artifact ngay sau suite. Lần chụp sau cùng phải khớp stamp; không dùng ảnh trước sửa layout thay bằng chứng mới.

## Giới hạn

**Not yet played by a person.** Chromium viewport không thay Android/iPhone/người mới thật. Đây là candidate asset/UI Ô Ăn Quan; full-color pixel-style master chưa khóa palette32 màu như mục tiêu GDD. Icon/banner launcher hiện dùng scene trong preview, chưa phải bộ512/1280 đã nghiệm thu. Lò Cò và đủ29 skin toàn dự án chưa hoàn tất; ba bot/biến thể luật/animation rải theo bước/timer/onboarding chơi được còn FD-1. Owner/save lỗi/receipt100 còn FD-3. Online/tiền chung/commerce chưa bật; production catalog vẫn loại Folk. CI đúng head trước merge; chưa merge/deploy/SQL production.
