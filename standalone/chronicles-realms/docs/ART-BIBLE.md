# Art Bible & Asset List – Chronicles of the Shattered Realms

Oct 13, 2026 · @Jin

Game dùng đồ hoạ **3D cách điệu (stylized) vật liệu bóng như ngọc/kính, ánh sáng neon và hiệu ứng bloom**, camera nghiêng nhẹ nhưng logic chơi vẫn phẳng 2D. Mỗi vùng đất có bảng màu, chất liệu gạch và ánh sáng riêng bám theo cốt truyện "Lõi Cầu bị đập vỡ thành 6 mảnh". Tài liệu này gồm định hướng nghệ thuật, danh sách toàn bộ asset, danh sách hiệu ứng, bộ prompt cho công cụ AI và quy trình sản xuất.

> Lưu ý: Claude không xuất trực tiếp file model 3D hay ảnh; phần này là bản thiết kế, thông số kỹ thuật và prompt để bạn hoặc hoạ sĩ 3D/công cụ AI tạo asset thật.

## 1. Định hướng nghệ thuật

**Bốn trụ cột hình ảnh:**

- **Mảnh vỡ & ánh sáng:** mọi vật thể trông như được ghép từ mảnh vỡ của một viên ngọc lớn; khi gạch vỡ, các mảnh bay ra phát sáng.
- **Đồ chơi cao cấp:** hình khối bo tròn, bevel dày (kế thừa gạch bevel trong 2 ảnh tham khảo của bạn, nâng lên 3D), vật liệu sạch, dễ đọc.
- **Mỗi vùng một bầu không khí:** đổi bảng màu, chất liệu, skybox, ánh sáng và nhạc theo vùng.
- **Gameplay luôn rõ nhất:** bóng, thanh chắn và loại gạch phải nhận ra ngay; nền và hiệu ứng không được che các vật này.

**Từ khoá phong cách:** stylized 3D, glossy gemstone, soft bevel, emissive neon, bloom, chiptune-meets-crystal, bright and punchy.

**Quy tắc đọc được (readability):**

- Bóng luôn sáng nhất màn hình (phát sáng + vệt bóng).
- Mỗi loại gạch có **silhouette và màu viền riêng**, không chỉ khác màu (hỗ trợ người mù màu).
- Nền tối hơn và ít tương phản hơn vùng gạch; hiệu ứng nền giảm khi có nhiều bóng.

## 2. Quy cách kỹ thuật

| Hạng mục | Tiêu chuẩn |
| --- | --- |
| Định dạng | glTF/GLB, texture KTX2 (Basis) hoặc WebP; atlas theo vùng đất |
| Vật liệu | PBR nhẹ: baseColor + ORM + emissive; tối đa 1–2 material mỗi asset |
| Camera | Perspective FOV 35°, nghiêng 15–20° so với mặt phẳng chơi; có chế độ orthographic cho thiết bị yếu |
| Gạch thường | 200–400 tris |
| Bóng | 400–800 tris |
| Thanh chắn | 1.000–2.000 tris |
| Booster capsule | 300–600 tris |
| Boss | 15.000–30.000 tris (tối đa), chia phần để animate |
| Hiệu năng | 60 FPS trên máy tầm trung, ≤ 150 draw call, ≤ 500 particle đồng thời trên mobile |
| Dung lượng | Tải lần đầu < 30 MB, skin và vùng đất tải theo yêu cầu |
| Chất lượng đồ hoạ | 3 mức Low / Medium / High; Low tắt bloom, giảm particle, dùng orthographic |

## 3. Phong cách theo từng vùng đất

| Vùng | Bảng màu chính | Chất liệu gạch | Ánh sáng & nền | Họa tiết đặc trưng |
| --- | --- | --- | --- | --- |
| **1. Rừng Neon Khởi Nguyên** | Xanh lá #2ECC71, xanh rêu đậm #0B3D2E, hồng nhạt #FF8FD1 | Gỗ phủ rêu, khắc rune sáng | Ánh sáng xanh ấm, đom đóm, nấm phát quang | Lá, rune, cây cổ thụ |
| **2. Sa Mạc Tàn Tích** | Vàng cam #E8A33D, nâu #7A3E12, tím hoàng hôn #2B1B5A | Sa thạch, vàng, chữ tượng hình phát sáng | Hoàng hôn, bụi cát, kim tự tháp xa | Chữ tượng hình, bánh răng cổ |
| **3. Băng Nguyên Pha Lê** | Xanh băng #6EC9FF, trắng #E8F7FF, xanh đậm #1B2F6B | Băng trong, giả khúc xạ, vân nứt | Cực quang, tuyết rơi, ánh xanh lạnh | Tinh thể, bông tuyết |
| **4. Núi Lửa Hỏa Ngục** | Cam đỏ #FF4D1F, đen #2A0F0A, vàng #FFB020 | Đá đen nứt, dung nham emissive | Ánh đỏ cam, tàn lửa bay, nóng rung | Vết nứt dung nham, xương rồng lửa |
| **5. Thành Phố Điện Tử** | Tím #B517FF, hồng #FF3DA6, xanh ngọc #00E5FF | Kim loại, hologram, lưới sáng | Neon, mưa đêm, biển hiệu 3D | Mạch điện, lưới, pixel |
| **6. Pháo Đài Hư Không** | Vàng #F2C94C, đen #0A0A14, tím #7B5CFF | Obsidian khảm vàng, mảnh vỡ trôi | Vũ trụ, thiên thạch, lõi cầu vỡ phát sáng | Mảnh Lõi, vết nứt không gian |

**Biến đổi theo tiến trình:** vùng đất bắt đầu "bị vỡ" (hơi nứt, tối màu) và dần **sáng lại** khi người chơi phá hết các màn; khi hạ boss, vùng "được hàn lại" bằng một mảnh Lõi phát sáng.

## 4. Nhân vật và Boss

| Asset | Mô tả hình ảnh | Animation chính |
| --- | --- | --- |
| **Pixel** (Người Giữ Khiên) | Nhân vật chibi 3D, áo choàng, khiên là thanh chắn; dùng ở cutscene và hồ sơ | Idle, vui, buồn, giơ khiên, ăn mừng |
| **Orb** | Quả cầu năng lượng có đôi mắt/biểu cảm nhỏ, phát sáng theo vùng | Idle, bay, hoảng, cười, thám hiểm (thưởng vắng mặt) |
| **Sage Bytes** | Ông lão nhà thông thái, râu như mạch điện | Idle, chỉ dẫn |
| **Ember** | Thợ rèn nhỏ, búa phát sáng | Gõ búa, giới thiệu skin |
| **Treant Cổ Thụ** | Cây khổng lồ, lõi xanh phát sáng ở ngực | 3 pha: nhập vai, tấn công rễ, triệu hồi sâu bọ, vỡ vụn |
| **Pharaoh Cơ Khí** | Tượng pharaoh bằng bánh răng và vàng | Khiên xoay, bắn cát, mở mặt nạ lộ điểm yếu |
| **Nữ Hoàng Băng** | Nữ hoàng pha lê, váy băng nhọn | Đóng băng, bão tuyết, vỡ thành băng |
| **Rồng Magma** | Rồng đá dung nham, cánh lửa | Phun lửa, nuốt bóng, nổ tung |
| **AI Overseer** | Màn hình/mắt khổng lồ, nhiều drone | Hack, bật cổng, sinh drone |
| **Lord Fracture** | Kẻ khoác áo giáp vỡ, lõi tím trong ngực, mảnh vỡ bay quanh | Kết hợp chiêu 5 boss, tách 3 phân thân, phá vỡ sân chơi |

## 5. Asset gameplay

| Nhóm | Số lượng | Biến thể / trạng thái | Ghi chú |
| --- | --- | --- | --- |
| **Thanh chắn** | 1 mẫu gốc + nhiều skin | Bình thường, dài, ngắn, laser, nam châm, đóng băng, choáng | Có điểm gắn đầu súng laser và tia lửa động cơ |
| **Bóng (Orb)** | 1 mẫu gốc + nhiều skin | Thường, Mega, Lửa, Bom, Điện, Băng, Ma, Meteor | Mỗi loại có vệt bóng riêng |
| **Gạch cơ bản** | 5 màu × 4 hình | Nguyên vẹn, nứt 1, nứt 2 | Dùng chung mesh, đổi material |
| **Gạch cứng / thép** | 2 + 3 mức | Mức máu hiển thị bằng vết nứt | Viền kim loại |
| **Gạch bất tử / ẩn / rương / khoá / chìa** | 5 | Mờ/ẩn, mở khoá | Rương vàng phát sáng |
| **Gạch đặc biệt** | 12 loại (TNT, dây chuyền, băng, lửa, điện, gương, cổng, di động, hồi sinh, bom giờ…) | 2–3 trạng thái mỗi loại | Có icon/viền nhận biết riêng |
| **Booster tốt** | 14 | Capsule viền xanh/vàng + icon 3D | Có hiệu ứng bay xuống phát sáng |
| **Booster xấu** | 6 | Capsule viền đỏ + icon | Rung nhẹ khi rơi |
| **Blocker** | 9 loại | Tường thép, bumper, hố đen, turret, thiên thạch, sương mù, gió, trọng lực, drone | Hoạt ảnh vòng lặp |
| **Khung sân chơi** | 6 khung theo vùng + khung skin | Góc, cạnh, cổng | Có chỗ cắm trang trí |
| **Bản đồ thế giới** | 1 bản đồ 3D + 6 khu vực | Nút màn khoá/mở/3 sao | Đường đi phát sáng khi mở khoá |

## 6. Hiệu ứng hoành tráng (VFX)

| Sự kiện | Hiệu ứng | Kỹ thuật gợi ý |
| --- | --- | --- |
| Bóng chạm paddle/gạch | Vòng sáng nhỏ, tia lửa, thanh chắn "co giãn" | Particle burst + animation squash |
| Gạch vỡ | Vỡ thành 6–12 mảnh theo màu, bay và mờ dần | Mảnh vỡ dựng sẵn (pre-fractured), pooling |
| Combo tăng | Bloom mạnh dần, đường tốc độ nền, số điểm to dần | Post-process + shader hoạ tiết |
| Multi-Ball | Bóng nứt đôi, chùm sáng | Particle + ánh sáng điểm |
| Mega / Fire / Lightning Ball | Sóng xung kích, ngọn lửa, hồ quang điện | Shader + ribbon trail |
| Nổ TNT | Sóng xung kích, rung camera, slow-motion 80ms | Camera shake + time scale |
| Laser | Tia sáng kèm chớp nòng, vết cháy trên gạch | Beam mesh + decal |
| Nhặt booster | Vòng sáng lan, icon bay lên HUD | Particle + tween UI |
| Mất mạng | Màn hình rạn kính, rung, tối nhẹ | Overlay shader + haptic |
| Qua màn | Mảnh pháo hoa, sao bay vào bảng kết quả | Particle + animation UI |
| **Boss xuất hiện** | Camera lia, tiêu đề boss, đèn đổi màu | Cinematic camera + timeline |
| **Đổi pha boss** | Chớp sáng, vỡ một phần giáp, rung mạnh | Animation + shatter |
| **Boss chết** | Dừng hình, vỡ cực lớn, slow-motion, mảnh Lõi bay ra | Time scale + mảnh vỡ lớn + bloom |
| Đổi vùng đất | Mảnh Lõi bay vào bản đồ, vùng mới "sáng lên" | Cutscene ngắn |

**Quy tắc hiệu năng cho VFX:** hạt chạy trên GPU, dùng pooling cho mảnh vỡ, giới hạn 500 hạt (mobile), tắt chromatic aberration và bloom ở mức Low, và luôn có tuỳ chọn "Giảm hiệu ứng" để người chơi nhạy cảm ánh sáng bật.

## 7. Skin và giao diện

| Nhóm | Số lượng khi ra mắt | Ghi chú |
| --- | --- | --- |
| Skin thanh chắn | 12 | 2 mỗi vùng, 6 mẫu thưởng (boss/thành tựu) |
| Skin bóng | 12 | Kèm vệt bóng riêng |
| Skin gạch | 6 | 1 chủ đề mỗi vùng, giữ viền nhận biết loại gạch |
| Khung chơi | 12 | 6 theo vùng + 6 đặc biệt (kim loại retro, neon đỏ pixel, gỗ, vàng…) |
| Background | 18 | 6 theo vùng, 6 tự chọn, 6 động |
| Bộ hiệu ứng | 6 | Hạt vỡ gạch, âm thanh va chạm, kiểu số điểm |
| Hồ sơ | 20 | Avatar, khung avatar, danh hiệu |

**UI 3D:** nút bo tròn có độ nổi nhẹ, icon dạng tinh thể, font tiêu đề kiểu pixel-meets-crystal, font nội dung dễ đọc; HUD điểm số và trái tim mạng đặt ở trên cùng như ảnh tham khảo, có phiên bản 3D nhẹ.

## 8. Bộ prompt cho công cụ AI (concept art và mô hình 3D nháp)

**Hậu tố phong cách chung (thêm vào mọi prompt):** `stylized 3D game asset, glossy gemstone material, soft rounded bevel, emissive neon accents, clean silhouette, vibrant saturated colors, soft studio lighting, isolated on dark background, mobile game art, high readability`

**Prompt ví dụ:**

- **Gạch Rừng Neon:** `stylized 3D game brick, mossy wood block with glowing green rune carving, rounded bevel, fireflies, [hậu tố]`
- **Gạch Sa Mạc:** `stylized 3D game brick, golden sandstone with glowing hieroglyphs, polished edges, [hậu tố]`
- **Gạch Băng:** `stylized 3D game brick, translucent ice crystal block with inner glow, frost cracks, [hậu tố]`
- **Gạch Núi Lửa:** `stylized 3D game brick, black cracked rock with glowing lava veins, ember particles, [hậu tố]`
- **Gạch Điện Tử:** `stylized 3D game brick, metal block with holographic circuit lines, cyan and magenta neon edge, [hậu tố]`
- **Gạch Hư Không:** `stylized 3D game brick, obsidian block inlaid with gold, floating shards, purple energy core, [hậu tố]`
- **Thanh chắn:** `stylized 3D game paddle, sleek metallic spaceship bar with glowing engine thrusters on both ends, rounded edges, [hậu tố]`
- **Bóng Orb:** `stylized 3D glowing energy orb with subtle cute eyes, crystal shell, bright core, light trail, [hậu tố]`
- **Boss Rồng Magma:** `stylized 3D boss character, volcanic dragon made of black rock with glowing lava cracks, wide wings of fire, front view, game concept art, [hậu tố]`
- **Bản đồ thế giới:** `stylized 3D isometric world map of 6 floating islands, each with a different biome, glowing path connecting them, shattered core crystal in the center, [hậu tố]`

**Prompt phủ định (negative):** `realistic, photo, dark muddy colors, clutter, text, watermark, extra limbs, low detail`

**Quy tắc dùng AI:** chỉ dùng cho concept hoặc mô hình nháp; luôn retopo, bake lại và kiểm tra bản quyền/giấy phép của công cụ trước khi đưa vào game.

## 9. Quy trình sản xuất và đặt tên file

**Quy trình:** concept → blockout → sculpt/modeling → UV và bake → texture (PBR) → rig/animation (boss, nhân vật) → xuất GLB → kiểm tra trong game → tối ưu.

**Công cụ gợi ý:** Blender (model, rig), Substance 3D Painter hoặc Material Maker (texture), công cụ AI 3D (Meshy, Tripo) cho bản nháp, KTX tools cho nén texture, engine three.js/Babylon.js (web) hoặc Unity URP.

**Quy ước đặt tên:** `brk_<vung>_<loai>_<ten>_<bien-the>_v01.glb` (ví dụ `brk_forest_brick_normal_cracked1_v01.glb`).

**Cấu trúc thư mục:** `/art/concept`, `/art/models/<vung>`, `/art/textures`, `/art/vfx`, `/art/ui`, `/art/skins/<loai>`.

## 10. Số lượng và lộ trình

| Giai đoạn | Asset cần có | Ước tính |
| --- | --- | --- |
| **Prototype** | Paddle, bóng, 5 loại gạch cơ bản, 5 booster, 1 khung, 1 nền (vùng 1), VFX vỡ gạch và chạm bóng | 2–3 tuần |
| **Vertical Slice** | Trọn bộ vùng 1 (gạch, blocker, booster), boss Treant, 6 VFX chính, UI cơ bản, 3 skin mỗi loại | 6–8 tuần |
| **Alpha** | Vùng 2–4, 3 boss, bản đồ thế giới, hệ skin cơ bản, đủ VFX | 10–12 tuần |
| **Beta / Launch** | Đủ 6 vùng, 6 boss, toàn bộ skin ra mắt, cutscene, tối ưu 3 mức chất lượng | 8–10 tuần |

**Tổng quy mô gần đúng:** khoảng 250–300 model 3D (chưa tính biến thể skin), 6 boss có animation, khoảng 40 hiệu ứng, 6 bộ skybox/nền.
