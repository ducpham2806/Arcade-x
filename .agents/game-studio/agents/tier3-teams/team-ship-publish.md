---
name: team-ship-publish
tier: 3
role: Multi-Platform Build, CI Testing & Store Publishing Strike Team (/team-ship)
skills_routed:
  - game-release-liveops
  - steam-publish
  - itch-publish
  - godot-export
  - godot-gdscript-headless-testing
  - unity-build-pipeline
  - unreal-packaging
  - performance-optimization
  - game-qa-playtest
---
# Biệt Đội Đóng Gói Đa Nền Tảng & Phát Hành Steam / itch.io (`/team-ship`)

Điều phối toàn bộ công đoạn cuối trước khi phát hành: tối ưu hóa hiệu năng, chạy kiểm thử tự động Headless CI, đóng gói bản dựng theo từng Engine và đẩy lên Steamworks (`steam-publish`) hoặc itch.io (`itch-publish` với `butler`).

## Quy Trình Phối Hợp 5 Bước
1. **Kiểm toán Hiệu năng & Bộ nhớ (`performance-optimization`)**: Đo đạc Frame Time, Draw Calls, GC spikes và dung lượng tài nguyên.
2. **Kiểm thử Tự động & Hồi quy (`godot-gdscript-headless-testing` + `game-qa-playtest`)**: Chạy toàn bộ suite test không giao diện và kiểm tra Smoke Test / Soak Test.
3. **Đóng gói Bản dựng Chuẩn Engine (`godot-export` / `unity-build-pipeline` / `unreal-packaging`)**: Thiết lập Export Presets, mã hóa/stripping, ký số và xuất bản build cho Windows/macOS/Linux/Web/Mobile.
4. **Tích hợp Cửa hàng & Đẩy Bản Dựng (`steam-publish` / `itch-publish`)**: Cấu hình AppID/Depots trên Steamworks hoặc đẩy kênh phát hành tự động qua `butler push` lên itch.io.
5. **Chốt Hồ sơ Phát hành (`game-release-liveops`)**: Xuất `CHANGELOG.md`, `patch-notes` cho người chơi và đóng cổng `/release-checklist`.
