# Dungeon Titan — Equipment UX v6.3

Chạy `npm run export:dungeon-review` để sinh file (không còn lưu trong git), rồi mở `dungeon-titan-equipment-v6-3-playtest.html`. Menu → Chế độ thử → Xem art mở thư viện có đủ boss, anh hùng, quái, trang bị, kỹ năng, vùng đất, biểu tượng và hiệu ứng. Tab Titan có nút Đấu thử từng boss. Có thể tạm dừng hoặc chọn từng tư thế.

Patch dựa trên `ducpham2806/Arcade-x` main tại `c143446375eb7bbfa003e75418dad0403d3ce7f2`, cộng gameplay v3 và UX v4 đã gửi trước đó. Đây là source patch Dungeon, không phải full launcher checkout. Áp dụng trên nhánh công việc riêng; đối chiếu diff nếu Dungeon đã thay đổi sau mốc trên. Chưa push, merge hoặc deploy.

V5 đã thay `TitanArt.tsx` và `FantasyIcon.tsx` bằng bộ lấy ô từ WebP atlas, thêm `RasterSprite.tsx`, `CombatArt.tsx`, `assets/art-v5/` và gallery. `FantasyHUD.tsx` dùng hình mới cho toàn bộ các nhóm hiển thị. Các component UI v2/v3 còn trong source để tham chiếu nhưng không mount trong core đang chạy. V6 thêm enemyRoster.ts, BattlefieldV6.tsx và battlefield-v6.css; schema4 quản lý đội lính nhiều mục tiêu và bộ đếm lượt gặp. Bản lưu v3 vẫn được nhập qua restoreState; chi phí nâng cấp và adapter profile/BXH được giữ.

Bản HTML dùng khóa lưu riêng `dungeon_titan_v6_review_isolated`; nếu chưa có, đọc tiến trình v5/v4/v3 cùng origin. File HTML mở qua file/content URI có thể không chia sẻ localStorage giữa các phiên bản hoặc trình duyệt; dữ liệu live không tự chuyển vào bản thử.

```bash
node tests/dungeon/engine.mjs
node tests/dungeon/squads-v6.mjs
node scripts/export-dungeon-review.mjs
node tests/dungeon/ui.mjs
node tests/dungeon/art-v5.mjs
```

Targeted TypeScript check dùng `--types vite/client` cho khai báo WebP. Vite production xử lý import ảnh; esbuild export dùng loader dataurl để HTML chạy độc lập. Không thêm dependency runtime.

Bộ asset riêng chứa PNG nguồn, WebP tối ưu, atlas manifest, prompt briefs và script đóng atlas. Để đóng lại ảnh cần Python/Pillow/NumPy/SciPy và ImageMagick. Script chỉ phân tích alpha, cắt/đóng ô và đổi định dạng; không vẽ thay cho nguồn raster tạo bằng Imagegen.

`UX-v6.md` mô tả bố cục theo ảnh và cơ chế đội lính. `ART-v5.md` mô tả nền art kế thừa; art-source-v6 chứa thêm24 loài mới. `UX-v4.md` mô tả luồng quản lý. `DESIGN-v3.md`, bảng tuning và mô phỏng là tài liệu gameplay lịch sử.

Đã kiểm tra logic/DOM, TypeScript và tệp ảnh. Chưa xác nhận layout trên browser/điện thoại thật, FPS/GPU, full launcher build và GameBridge/BXH online. Cần các bước này trước production sign-off.

V6.1 chỉ thay UX dưới chiến đấu: bốn chỉ số chỉ đọc trên một hàng, mana gọn, kỹ năng 48px, nút giữ chém rộng 64px (58px trên màn hình thấp), bỏ nâng cấp cạnh vùng đánh. Nâng cấp qua tab Anh hùng. Xem `UX-v6.1.md`. Schema4, khóa lưu, gameplay và asset giữ nguyên.

V6.2: thêm unified-v6-2.css dùng chung vật liệu, typography, nút, thẻ và thanh tab cho toàn bộ 8 màn quản lý/tiện ích. Battlefield dùng một biến kích thước chung cho hero và cả 6 đồng đội. TitanArt nhận facing và chỉ lật sprite khi cần theo hướng nguồn; không lật chữ/thanh máu/VFX. Xem UX-v6.2.md; thêm kiểm tra `node tests/dungeon/facing-v6-2.mjs`. Không thay schema, gameplay hoặc texture.

V6.3: EquipmentPanel.tsx thay phần quản lý trang bị cũ. equipment-v6-3.css và selector badge trong fantasy.css sửa lỗi hình raster bị áp absolute bottom/right của nhãn cấp. Slot hiện tên, độ hiếm, cấp, dấu đang mặc và highlight thay đổi. Có preview trước/sau và phản hồi từ state thực tế. Đồng đội có chọn chủ sở hữu, ba slot và kho theo nghề; best nhận allyId tùy chọn để chỉ mặc cho đồng đội đã chọn. Không đổi công thức sức mạnh hoặc schema4. Test thêm `node tests/dungeon/equipment-v6-3.mjs`; xem UX-v6.3.md.
