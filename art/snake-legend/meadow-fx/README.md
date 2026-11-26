# Snake Legend · Hiệu ứng Đồng Cỏ · 26/11/2026

Atlas 512×256 RGBA chứa bốn hàng, mỗi hàng tám khung 64×64.

| Hàng | Phản hồi trong game | Nguồn và phối màu |
| --- | --- | --- |
| 0 | Nhặt quả, hoa hoặc ngọc | `pickups/collect-burst` phối hổ phách. Viền nâu giữ nét trên cỏ sáng. |
| 1 | Bắt đầu Dash | `impacts/hit-spark` phối ngọc lam, quay theo hướng rắn. |
| 2 | Đủ mục tiêu để mở cổng | `holy/sunburst` phối vàng, đặt tại cổng. |
| 3 | Hoàn thành màn hoặc đường thử | `nature/healing-bloom` phối lá non và cánh đào. |

Tạo từ [PixelFX `5294518`](https://github.com/patch-gg/pixelfx/tree/5294518), dùng [Agent Sprite Forge `25203d0`](https://github.com/0x0funky/agent-sprite-forge/tree/25203d0) để kiểm và ráp khung với `--strict`. [Giấy phép PixelFX](PIXELFX-LICENSE).

```sh
python3 art/snake-legend/meadow-fx/build.py \
  --pixelfx /path/to/pixelfx --forge /path/to/agent-sprite-forge \
  --review /tmp/snake-meadow-fx-review.png
```

Generator kiểm đăng ký từng khung, alpha và ngân sách 72 KiB. Atlas 60.158 byte, 524.288 byte RGBA sau giải mã; SHA-256 `7a6ddae1f5a01e17d02a21862ce8719bb33f2770e51365cd5abf23d2136cd972`. Bản hosted xuất WebP có hash vào gói game. Bản HTML dùng cùng dữ liệu nhúng.

Chuyển động dựa trên tick mô phỏng và thời gian ăn mừng của màn. Chế độ giảm chuyển động dùng một khung cố định cho nhặt vật phẩm, mở cổng và hoàn thành. Vệt Dash liên tục và ánh nước chuyển động giảm về chỉ dấu tĩnh. Sprite, cảnh và bảng màu chỉ đọc dữ liệu engine.
