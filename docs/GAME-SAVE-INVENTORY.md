# Bản đồ lưu dữ liệu game

Sinh từ các lời gọi localStorage và GameBridge trong source ngày 11/10/2026. Các khóa template giữ nguyên dạng `${...}`; đây là inventory nguồn, không phải đã di chuyển tất cả dữ liệu. StorageService/PlayerContext có thể lưu thêm dữ liệu dùng chung ngoài danh sách này.

| Game | GameBridge save/load | Khóa local trực tiếp trong thư mục game |
|---|---|---|
| tile-2048 | loadGameState, saveGameState | `arcadex_best_2048_v2_${gameMode}_${assisted ? 'assisted' : 'pure'}` |
| blocker | loadGameState, saveGameState | `blocker_best` |
| neon-runner | loadGameState, saveGameState | Không có literal trực tiếp |
| car-escape | loadGameState, saveGameState | `car-escape-progress-v2` |
| scoodoku | loadGameState, saveGameState | Không có literal trực tiếp |
| shikaku | loadGameState, saveGameState | Không có literal trực tiếp |
| fill-the-space | loadGameState, saveGameState | Không có literal trực tiếp |
| draw-a-shape | Không có | Không có literal trực tiếp |
| word-cross | loadGameState, saveGameState | Không có literal trực tiếp |
| mummy-escape | Không có | Không có literal trực tiếp |
| hex-match | Không có | `arcadex_hex_boosters`; `arcadex_hex_level_scores`; `arcadex_hex_stars`; `arcadex_hex_touch_sensitivity`; `arcadex_hex_unlocked_lvl`; `arcadex_player_profile` |
| cosmic-defense | Không có | Không có literal trực tiếp |
| cyber-slice | Không có | `arcadex_cyber_slice_speed` |
| eat-em-all | Không có | Không có literal trực tiếp |
| caro-gomoku | Không có | Không có literal trực tiếp |
| chess | Không có | Không có literal trực tiếp |
| xiangqi | Không có | Không có literal trực tiếp |
| dungeon-tap | Không có | Không có literal trực tiếp |
