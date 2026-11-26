# Blossom Blast · hiệu ứng lượt đi · 26/11/2026

Nhánh `codex/blossom-vivid-effects`, nối từ `codex/blossom-garden-ui@b916d33`. Phạm vi là trình diễn kết quả lượt đi hợp lệ của engine. Luật, điểm, lượt và cấu trúc save giữ theo bản giao diện.

- Nhóm hoa có nhịp tô viền từ ô chạm. Ong theo hàng hoặc cột, Mặt Trời theo giao tuyến và Bom Hoa/Cầu Vồng hiện đúng ô tác động. Cầu Vồng giữ đủ dấu ô kể cả khi chỉ chọn một số ô để vẽ tia và hạt phụ.
- Hai vật phẩm vừa ghép có vòng và dây vàng rồi mới tới lớp nổ riêng. Vật phẩm đặc biệt mới nở tại ô đã rơi tới. Cổng A và B có nhịp tím và đường nối theo điểm đi/đến của engine.
- HUD báo số điểm tăng, tiến độ và lần đầu hoàn thành mục tiêu. Chế độ giảm chuyển động của game hoặc hệ thống dùng dấu tĩnh. Người chơi vẫn có thể thực hiện lượt kế tiếp khi các lớp VFX đang chạy.

## Nguồn và dựng lại

Game Studio Game Feel và PixelFX, vai trò Art & UI Lead. [PixelFX `5294518`](https://github.com/patch-gg/pixelfx/tree/5294518) dựng `nature/healing-bloom`, `pickups/collect-burst`, `spawn/spawn-portal`. [Agent Sprite Forge `25203d0`](https://github.com/0x0funky/agent-sprite-forge/tree/25203d0) kiểm pixel RGBA bằng `assemble_frames.py --strict` trước khi ép thành strip. Ba WebP lossless, mỗi strip 16 khung 128×128, tổng 174.298 byte. Giấy phép MIT ở `public/blossom/vfx/PIXELFX-LICENSE.txt`.

```sh
python3 art/blossom/vfx/build.py --pixelfx /path/to/pixelfx --forge /path/to/agent-sprite-forge
node scripts/blossom-preview.mjs /tmp/blossom-vivid.html
```

## Kiểm chứng

- Graphify AST `src/games/hex-match`, 203 nút/551 cạnh. Truy vấn `describeTurn` xác nhận HUD đọc chênh lệch sau `act`; kiểm vùng tác động bằng `Effect.cells` và vệt cổng bằng `portalMoves`.
- Playwright kiểm đúng ô cho sáu loại nổ, hai đầu ghép, hình tĩnh khi giảm chuyển động, vị trí vật phẩm mới, dấu hoàn thành mục tiêu và cổng. Playwright 66/66, engine 21/21, bộ `test:fast`, lint, build và ngân sách bundle đều qua.
- Dựng lại ba strip có byte trùng. Kiểm ba cảnh VFX trong HTML 18,8 MB sau khi tắt mạng ở Chromium, với art vẽ và VFX nhúng. Thiết bị thật và cảm giác chơi người thật còn chờ.
