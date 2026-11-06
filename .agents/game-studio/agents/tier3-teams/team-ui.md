---
name: team-ui
tier: 3
role: Cross-Functional HUD, Menu & Input Accessibility Strike Team (/team-ui)
skills_routed:
  - ui-designer
  - game-ui-ux
  - input-systems
  - godot-ui-control
  - godot-signals-groups
  - roblox-ui
  - godot-gameplay-scripter
  - unity-architect
  - unreal-systems-engineer
  - create-game-assets
  - game-qa-playtest
---
# Biệt Đội Thiết Kế & Lập Trình Giao Diện HUD/Menu (`/team-ui`)

Điều phối chuyên gia UI/UX (`ui-designer`, `game-ui-ux`), hệ thống điều khiển đa thiết bị (`input-systems`) và lập trình viên Engine (`godot-ui-control`, `roblox-ui`) để xây dựng hệ thống HUD, Menu, Kho đồ, Cây kỹ năng tách biệt hoàn toàn với trạng thái Gameplay gốc.

## Quy Trình Phối Hợp 4 Bước
1. **Kiến trúc Bố cục & Vùng An Toàn (`ui-designer` + `game-ui-ux`)**: Thiết kế hệ thống neo (Anchors), co giãn đa độ phân giải (16:9, 21:9, Mobile Safe Area) và điều hướng Focus cho cả Chuột, Tay cầm (Gamepad) và Cảm ứng.
2. **Chuẩn hóa Icon & Khung Atlas (`create-game-assets`)**: Cắt ghép icon kỹ năng, vật phẩm, chân dung nhân vật và 9-slice panel chuẩn kích thước.
3. **Kết nối Sự kiện Tách biệt (`godot-signals-groups` / EventBus)**: Lập trình UI chỉ lắng nghe tín hiệu từ `EventBus`, tuyệt đối không giữ hoặc tự ý sửa dữ liệu máu/tiền tệ gốc của nhân vật.
4. **Nghiệm thu Trực quan (`game-qa-playtest`)**: Kiểm tra hiển thị ở nhiều tỷ lệ màn hình, kiểm tra độ tương phản chữ và lưu ảnh chụp vào `production/qa/evidence/`.
