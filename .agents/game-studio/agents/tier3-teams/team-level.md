---
name: team-level
tier: 3
role: Cross-Functional Level Design, Tilemap & World Building Strike Team (/team-level)
skills_routed:
  - level-designer
  - level-design
  - procedural-gen
  - generate2dmap
  - godot-tilemap
  - godot-3d-essentials
  - unity-tilemap-2d
  - unity-navmesh
  - unreal-world-builder
  - camera-systems
  - game-systems-ai-programmer
  - game-qa-playtest
---
# Biệt Đội Thiết Kế Màn Chơi, Tilemap & Thế Giới (`/team-level`)

Phối hợp thiết kế bố cục không gian (`level-designer`, `level-design`), sinh bản đồ thủ tục (`procedural-gen`), tạo Tilemap/Props (`generate2dmap`, `godot-tilemap`, `unity-tilemap-2d`, `unreal-world-builder`) và kiểm tra đường đi AI.

## Quy Trình Phối Hợp 4 Bước
1. **Quy hoạch Nhịp độ & Bố cục Greybox (`level-designer` + `level-design`)**: Thiết kế sơ đồ luồng di chuyển, điểm nghẽn chiến thuật (Chokepoints), khu an toàn (Safe Hub), điểm nhìn dẫn hướng (Landmarks) và vùng giới hạn Camera (`camera-systems`).
2. **Xây dựng Địa hình, Tilemap & Sinh Thủ tục (`generate2dmap` + `procedural-gen` + `godot-tilemap` / `unity-tilemap-2d` / `unreal-world-builder`)**: Dựng các lớp mặt đất, autotile, vật cản Y-Sort, cổng dịch chuyển và ánh sáng môi trường.
3. **Thiết lập Va chạm, Navigation & Đợt Quái (`unity-navmesh` + `game-systems-ai-programmer`)**: Cấu hình Physics Layers, NavigationPolygon/NavMesh và kịch bản sinh quái theo đợt (Wave Spawner).
4. **Kiểm tra Khả năng Đi Thông Suốt (`game-qa-playtest`)**: Kiểm chứng không bị kẹt địa hình, cổng chuyển cảnh hoạt động hai chiều và lưu bằng chứng tại `production/qa/evidence/`.
