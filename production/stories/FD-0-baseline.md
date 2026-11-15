# FD-0 · baseline Folk chạy được và đúng phạm vi

15/11/2026 · nhánh `codex/folk-fd0-baseline-20261115` từ `a55af6e`. Owner đã duyệt Ô Ăn Quan → Lò Cò; Kẹo trước, Xu/XP/rương sau; Netlify HOLD.

## DoR / quyết định

UI và AI đi qua reducer OAQ; reducer trả state mới, không sửa input. Giữ công thức luật hiện hành trong baseline; biến thể luật làm ở FD-1. Default/production không đăng ký Folk; Vite mode `folk-preview` mở hai prototype. Online disabled/Sắp có và không mount màn phòng memory. Reward coins/exp=0, không gọi bridge grant/quest/loot. Shop dùng Kẹo.

Giữ GDD nguyên văn trong docs/folk; card ≤6500 và đăng ký tám card trong checker, không nới budget/hash. Test TypeScript bundle bằng esbuild qua runner ESM; unit/browser/package có step CI riêng và artifact riêng. Worktree riêng, không trộn nhánh Snake PR36.

## AC / bằng chứng

- [x] Ghi lỗi JSX, card count và test parse; giữ assertions, dùng runner đúng cú pháp.
- [x] Deep-freeze legal/illegal/resow, preview hai hướng, bot easy/hard, sibling branches; 9 unit PASS.
- [x] Candy reward/shop chạy; coins/exp=0, spy không nhận grant/quest/loot. Không nhận đã chữa owner/save/receipt.
- [x] Production manifest loại hai engine; preview có hai entry; online UI không vào được.
- [x] Browser 2 viewport: local rải quân, bot trả nước, shop, mở sân NLC, exit; zero pageerror. Shop đọc rõ dưới toolbar, nhãn Canvas qua helper tương phản.
- [x] Lint/build/bundle và Dungeon quota 4 ca PASS; GDD tách nguyên văn, docs/structure PASS.
- [x] Fast suite, Snake catalog/rollback và QA đọc diff cuối PASS; checkpoint local đã ghi.
- [ ] Commit/push có `[skip netlify]`; full CI đúng head trên PR trước merge.

[QA](../../docs/qa/FOLK-FD0-2026-11-15.md) ghi red/green và giới hạn. Không sửa SQL/Edge, shared save contract, commerce hoặc asset sinh; không merge/deploy. Game chưa xử lý đầy đủ pause, hướng dẫn hoặc complete match; chúng thuộc FD-1/2.
