---
name: team-combat
tier: 3
role: Cross-Functional Combat Strike Team (/team-combat)
skills_routed:
  - game-gdd-architect
  - game-systems-ai-programmer
  - game-ai
  - ai-behavior-trees-utility-ai
  - godot-gameplay-scripter
  - godot-gdscript
  - godot-2d-movement
  - godot-physics
  - unity-architect
  - unity-csharp-scripting
  - unity-physics
  - unreal-systems-engineer
  - unreal-cpp-gameplay
  - unreal-behavior-trees
  - game-feel
  - camera-systems
  - input-systems
  - physics-tuning
  - generate2dsprite
  - video2dsprite
  - pixelfx
  - technical-artist
  - game-audio-engineer
  - audio-design
  - game-qa-playtest
  - evidence-collector
  - godot-gdscript-headless-testing
---
# Biệt Đội Tác Chiến Hệ Thống Chiến Đấu (`/team-combat`)

Điều phối liên phòng ban để thiết kế, lập trình, làm hiệu ứng và kiểm thử trọn gói một hệ thống chiến đấu (vũ khí, kỹ năng, sát thương, kẻ địch, Boss).

## Quy Trình Phối Hợp 5 Bước
1. **Thiết kế & Công thức (`game-gdd-architect` + `game-designer`)**: Chốt bảng thông số kỹ năng (`Startup / Active / Recovery`), công thức sát thương/phá giáp và cơ chế tài nguyên chiến đấu.
2. **Kiến trúc Va chạm, Điều khiển & Máy Trạng thái (`game-systems-ai-programmer` + `input-systems` + Engine Scripter)**: Triển khai `HitboxComponent`, `HurtboxComponent`, `StatsComponent`, `PlayerStateMachine`, `CombatMathEngine` và `ObjectPoolManager`.
3. **AI Kẻ Địch, Behavior Tree & Vòng Báo Nguy (`game-ai` + `ai-behavior-trees-utility-ai`)**: Lập trình AI quái vật phân tầng (Bầy đàn tách bầy Boids, Blackboard Behavior Tree, Utility AI, Giáp đồng Super Armor, Tinh Anh, Boss 2 Phase kèm `TelegraphZone2D`).
4. **Hoạt ảnh, VFX & Cảm giác Chơi (`game-feel` + `camera-systems` + `generate2dsprite` + `video2dsprite` + `pixelfx` + `audio-design`)**: Tạo hoạt ảnh chém/trúng đòn, tia lửa va chạm, Hit-stop, Squash & Stretch, rung camera có hướng và âm thanh biến thiên cao độ. Với game pixel art, lấy hiệu ứng va chạm/phép/đòn đánh từ `pixelfx` (`src/fx/moves/`, `melee/`, `impacts/`) và dùng dữ liệu `act` (`windup`, `hits[].t`, `hits[].freeze`, shake) làm nguồn thời điểm duy nhất cho hit-stop — không để cả hiệu ứng lẫn game cùng dừng thời gian.
5. **Kiểm thử & Nghiệm thu (`game-qa-playtest` + `godot-gdscript-headless-testing` + `evidence-collector`)**: Chạy Unit Test Headless cho `CombatMathEngine`, Integration Test cho va chạm Hitbox/Hurtbox và chụp bằng chứng hiển thị HUD/VFX tại `production/qa/evidence/`.
