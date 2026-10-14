# Kiểm tra v0.1

20 kiểm tra engine và 9 kiểm tra DOM đạt.

- Kiểm tra swept collision tốc độ cao, seeded replay, paddle/Perfect Catch, mất mạng, booster/cộng thời gian/Meteor, shield, TNT/steel/lock/key/mirror, chains/electric groups, portals, moving/regen, kỹ năng và ngưỡng sao.
- Chạy đủ ba pha của sáu boss để kiểm tra telegraph và thực thi chiêu; mô phỏng fixed-step cho 96 màn không sinh NaN hoặc vượt giới hạn bóng.
- Kiểm tra luồng story → canvas → pause/resume → kết quả/lưu xu → shop/equip → practice không thưởng → claim idempotent → settings. Tất cả sprite skin và đường dẫn sheet đều tồn tại.
- JavaScript syntax check đạt. File offline chứa toàn bộ 26 PNG, không dùng CDN.

Chưa có kiểm tra trực quan trong trình duyệt hoặc chơi thử trên phần cứng thực. DOM test dùng canvas recording mock, không xác minh pixel/layout/FPS.
