# Folk Games — Ô Ăn Quan trước, rồi Nhảy Lò Cò

15/11/2026 · nguồn main `a55af6e`. Anh cho thực hiện plan, chốt Ô Ăn Quan trước rồi Lò Cò; bản đầu dùng Kẹo Dân Gian, Xu/XP/rương chung làm sau. Netlify HOLD; commit/PR có `[skip netlify]`; chưa merge/phát hành hoặc SQL production.

## Đầu vào

[GDD v2 gốc](../folk/GDD-V2-SOURCE.md) giữ nguyên văn 24.429 ký tự/274 dòng từ a55af6e, là thiết kế mục tiêu. Khung hai game, 27 skin và room memory đã có. Main CI đỏ bởi JSX/card count; test.mjs chứa TypeScript. OAQ preview/AI sửa nhầm state; online và save/reward chưa đủ an toàn.

## FD-0 · DONE kỹ thuật / chưa merge · khóa baseline local

[Story/DoR](../../production/stories/FD-0-baseline.md), [QA](../qa/FOLK-FD0-2026-11-15.md). Phạm vi: entry/registry/Vite, OAQ rules, Folk economy/menu/shop/renderers, tests và CI/docs.

- Sửa JSX/runner và đăng ký tám module card; giữ assertions/budgets và GDD gốc.
- Reducer clone input, kể cả rải sinh; preview/bot giữ nguyên bàn. Test deep-freeze, seed, sibling branches và illegal move.
- Default/production không đăng ký hai prototype thiếu art/package. Mode `folk-preview` có smoke riêng; guard manifest kiểm loại trừ production.
- Online disabled/Sắp có; không mount màn phòng memory. Local chỉ cộng Kẹo, coins/exp=0; spy kiểm không gọi grant/quest/loot.
- Browser: local 2p rải/chuyển lượt, bot trả nước, shop Kẹo, mở sân NLC/exit trên desktop và phone, không pageerror. Modal authored và nhãn Canvas đọc rõ. Unit/browser/package vào CI, artifact giữ trước suite khác dọn output.

Baseline đã qua local và full CI63/head a4d1a9c cả verify/snake_ui. PR37 chưa merge; không đánh cả game DONE từ mốc này.

## FD-4A · ACTIVE theo ưu tiên asset/UI mới của anh

[Story](../../production/stories/FD-4A-oaq-art-ui.md), [QA](../qa/FOLK-OAQ-ART-2026-11-15.md). Studio mới fa7b1db; asset/UI Ô Ăn Quan theo Nắng sân đình, 12 skin có art riêng, home/board/shop/keyboard/pause và cỡ320/ngang. Source/runtime/provenance/QA phải đủ; không bật catalog production hoặc tiền chung. Đây là đợt asset/UI trước; FD-1 và toàn bộ Lò Cò vẫn còn.

## Các mốc còn lại

| Mốc | Mục tiêu / gate |
|---|---|
| FD-1 | Ô Ăn Quan: biến thể luật/rải sinh/nợ/hốt tàn, ba bot, animation rải, tutorial, lifecycle/input và offline 2p đầy đủ |
| FD-2 | Lò Cò: nhịp thực, nhặt Chàm/chọn nhà/own house, ba bot, ba nhà hoặc năm vòng, mobile/audio/pause |
| FD-3 | Profile tách owner, giao dịch mua/lưu báo lỗi rõ, receipt bền vững, cap và mô phỏng 90 ngày; tiền chung chỉ sau verifier/ledger |
| FD-4 | Duyệt bảy bộ mặc định trước; đủ 29 skin (thiếu Tấm/Cuội), atlas/icon/banner/audio và preview thực |
| FD-ON1 | Edge+DB/CAS/FIFO/JWT/replay, skin hai bên, reconnect/timeout/rematch; PGlite |
| FD-ON2 | Hai account staging/device và full CI; quyết định phát hành riêng, giữ Commerce OFF/Netlify HOLD |

## Giới hạn còn giữ

Profile key chung có thể lẫn owner/game; claimedMatchIds chỉ giữ 100 nên replay cũ có thể cộng lại; save nuốt lỗi. Preview/candy-only không thay FD-3. OAQ pause/overlay đã bổ sung trong FD-4A; NLC chưa có nhịp/pickup thực. Art OAQ mới là candidate full-color, palette32/launcher art và bộ Lò Cò vẫn cần gate riêng. Memory/CAS fixture không chứng minh hai thiết bị hoặc receipt server.

## Studio / Graphify

FD-0 dùng game-production-scrum và game-qa-playtest, Technical Director giao story đủ DoR, QA đọc diff độc lập. Graphify AST scoped Folk, query 700–900 token/depth 1; làm mới sau sửa rồi đối chiếu source/tests. Đóng bằng QA, WORKLOG ≤3 mục, COMPLETED/bàn giao và PR có skip marker. Không nạp cả thư viện hoặc chạy semantic cloud.

**Tiếp:** chốt asset/UI FD-4A theo yêu cầu mới, rồi FD-1 Ô Ăn Quan; xem QA đúng head trước merge.
