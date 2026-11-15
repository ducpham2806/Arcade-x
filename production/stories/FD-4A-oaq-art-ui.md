# FD-4A · Ô Ăn Quan: asset và UI đồng bộ

ACTIVE · 15/11/2026 · codex/folk-oaq-art-ui-20261115 từ a4d1a9c/PR37. Anh yêu cầu ưu tiên asset/UI thật chuẩn chỉnh và cập nhật Game Studio Agent. Thứ tự Ô Ăn Quan trước/Lò Cò sau và Netlify HOLD giữ nguyên. FD-0 qua fullCI63/head a4d1a9c cả verify/snake_ui, PR37 chưa merge.

## DoR và phạm vi

Cập nhật thư viện Studio tới fa7b1db, giữ byte nguồn, flatten skill như adapter cũ; không nhập cache graphify-out hoặc chạy initializer. Dùng create-game-assets/game-ui-ux/game-qa-playtest, Art/UI Lead và Technical Director/QA. Graphify scoped OAQ/Folk, đối chiếu source và browser.

Art giữ hướng GDD: pixel Việt Nam, nắng sân đình, gạch tàu, tre xanh, phấn trắng/sỏi/đá Quan; chữ và tương tác bằng DOM. Tạo một master sân đình rồi bộ prop cùng phong cách bằng ImageGen, lưu provenance, normalize có script, kiểm kích thước/alpha/palette/budget và xem ở kích thước game. Không coi palette circles là asset hoàn thiện. Bộ đầu tập trung Ô Ăn Quan; Lò Cò và 29 skin toàn bộ chưa thuộc nghiệm thu mốc này.

UI Ô Ăn Quan: màn chính có CTA luyện bot/local dễ thấy; online Sắp có; bàn đấu cân đối khung, lượt P1/P2 và điểm đúng người, chọn ô/hướng rõ; nút cảm ứng ≥56px; keyboard/focus, hướng dẫn, pause/overlay chặn input đúng. Shop giữ khung theo AGENTS, đồng bộ màu và preview asset thật; có trạng thái mua/trang bị rõ. Dùng Kẹo; không bật Xu/XP/quest/loot/backend hoặc phát hành catalog mặc định.

## AC

- [x] Snapshot Studio mới + manifest/hash/validator và adapter docs qua; ghi phạm vi nguồn bỏ qua.
- [x] Asset source/runtime/manifest/provenance có đủ; report kỹ thuật và contact sheet qua, đã xem trong game.
- [x] Home/board/rules/shop, keyboard/focus/pause và local/bot input hoạt động; fallback lỗi ảnh không treo game.
- [x] Browser desktop/mobile và phone ngang nhỏ; không overflow/che nút, chọn ô/đổi lượt/mua skin đúng; screenshot đúng file stamp.
- [x] Unit/typecheck/build/budget/docs và hồi quy liên quan qua; QA đọc diff độc lập, ghi giới hạn thật.
- [ ] Commit/push/PR có [skip netlify]; không merge/deploy/SQL production; checkpoint đầy đủ.

Local candidate đã qua9 browser/9 unit + artguard12skin, lint/build/budget/package/fast/catalog. QA và ảnh/stamp ở docs/qa/FOLK-OAQ-ART-2026-11-15.md. FullCI cho nhánh mới chưa có kết quả; human/device thật, palette32 và launcherart chuẩn còn riêng.
