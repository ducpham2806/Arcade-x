# Cosmic Defend — gói asset pixel (v1.2)

Gói này gồm sprite sheet, nền hành tinh, bộ nhận diện, bảng màu và tệp mô tả (manifest) để dựng game theo tài liệu thiết kế (mục 28 và 29).
Toàn bộ asset do script trong `tools/` tạo ra cho dự án này; không dùng asset của bên thứ ba.

## Thông số
- Độ phân giải gốc 180 x 320, phóng nguyên x6 lên 1080 x 1920. Lọc ảnh Nearest, đặt tọa độ nguyên.
- UI vẽ trên lưới 360 x 640 (x3). Sprite game vẽ trên lưới 180 x 320 (x6).
- Bảng màu Cosmic 32 (`palette.json`, `Cosmic32.gpl` mở được bằng Aseprite/GIMP, `palette.png`).

## Nội dung
| Thư mục / tệp | Nội dung |
|---|---|
| `sprites/enemies.png` | 13 enemy với khung bay, telegraph, chớp trúng đạn; khiên Mantis (8 hướng), mìn, vòng hồi máu/buff/khóa, tia nhắm, hiệu ứng nổ, tia lửa |
| `sprites/ship.png` | Aegis Nova Lv1-5 x 3 hướng nghiêng (3 khung lửa), lớp hư hại 3/2/1 HP, chớp bất tử, tàng hình, khiên, nổ lớn; bảng hoán đổi màu cho skin và 3 phi thuyền phụ |
| `sprites/items.png` | 10 item (khung tròn = tự động, lục giác = bấm), hiệu ứng xuất hiện/nhặt, Star Core, Credits, Blueprint, Repair Kit, mảnh điểm, các loại đạn, tia laser lát |
| `sprites/ui.png` | Icon 12x12, khung 9-slice, tim HP, sao, thanh, công tắc, ô item lục giác, 10 hành tinh (+bản khóa), nút màn, nút boss, huy hiệu, vòng cooldown |
| `sprites/bosses.png` | 10 boss: khung chờ, điểm yếu, hư hại 1/2, chớp trúng đạn, kèm bộ phận rời |
| `sprites/portraits.png`, `sprites/logo.png` | Chân dung 48 x 48 (Kai, LUMI, Elara, Xar'Kul, mỗi người 3 biểu cảm); logo dạng chồng và dạng ngang |
| `backgrounds/` | 10 hành tinh x 3 lớp parallax (far, mid, near), tile 180 x 720 lặp liền theo chiều dọc |
| `story/` | 13 minh họa cốt truyện 180 x 225 (10 hành tinh + 3 tranh kết), mỗi tranh có bản gốc và bản phóng x6 (1080 x 1350) |
| `brand/` | Icon ứng dụng (512 và 1024), feature graphic 1024 x 500, 7 ảnh chụp màn hình 1080 x 1920 |
| `asset_manifest.json` | Vị trí, kích thước, số khung, tốc độ khung, pivot của từng sprite; bảng màu; hoán đổi màu skin và tông enemy theo hành tinh |
| `tools/` | Mã Python tạo asset (chạy `python3 package.py` cần Pillow; `store.py` dựng ảnh cửa hàng) |

## Cách dùng sprite sheet
Mỗi sprite là một dãy khung ngang: khung `i` nằm ở `x + i * stride`, `y`, kích thước `w x h` (xem `asset_manifest.json`).
`fps` là tốc độ hoạt ảnh gợi ý (0 = ảnh tĩnh). Sprite UI có `nine_slice` = [trái, trên, phải, dưới].
```
meta = manifest.sprites["scout"]
frame = int(time * meta.fps) % meta.frames
src = Rect(meta.x + frame * meta.stride, meta.y, meta.w, meta.h)
draw(texture(meta.sheet), src, position)   # lọc Nearest, vị trí số nguyên
```

## Thứ tự lớp của phi thuyền
Dùng sẵn `aegis_lvN_{l|c|r}` (đã có pod và lửa). Vẽ chồng `aegis_dmg3/2/1` theo HP, rồi `aegis_shield` nếu có khiên. Skin: áp bảng hoán đổi màu trong manifest (`palette_swaps.skins`).

## Chưa có trong gói
- Âm thanh (nhạc, hiệu ứng) và lời thoại.
- Tệp font: dùng VT323 (SIL OFL, có tiếng Việt), tải từ Google Fonts và kiểm tra đủ dấu.
- Mã game, dữ liệu wave và màn chơi (xem mục 24 và 25 của tài liệu).
- Hoạt ảnh cho tranh minh họa (tranh hiện là ảnh tĩnh, có thể tách lớp khi làm parallax).
- Hoạt ảnh nghiêng 2 mức mỗi hướng cho phi thuyền (hiện có 1 mức mỗi hướng).

## Chất lượng
Sprite do thuật toán dựng từ hình khối đơn giản nhằm chốt kích thước, bảng màu, bố cục và khung hoạt ảnh; dùng được cho prototype và vertical slice. Bản phát hành cần họa sĩ pixel vẽ lại hoặc tinh chỉnh, nhất là boss, nền và chân dung.
Ảnh chụp màn hình trong `brand/` là ảnh ghép mockup từ chính các sprite trong gói, chữ dùng font DejaVu Sans Mono làm thay thế (trong game dùng VT323). Khi có bản build hãy chụp lại từ game thật.
