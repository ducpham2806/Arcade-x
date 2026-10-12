-- Initial catalog only; future availability and merchandising are managed in Supabase.
insert into public.launcher_games(id,engine_key,title,category,short_description,status,sort_order,featured) values
('word-cross','word-cross','Word Cross','Arcade','Nối chữ tìm từ vựng tiếng Anh, thử thách Daily Puzzle toàn cầu','published',0,false),
('car-escape','car-escape','Car Escape','Puzzle','Giải đố kẹt xe đỉnh cao, di chuyển xe để mở đường cho xe cứu thương thoát hiểm.','published',1,true),
('dungeon-tap','dungeon-tap','Dungeon Titan','Action','Nhập vai RPG chém boss khổng lồ, săn đồ & chiêu mộ đồng đội','published',2,false),
('mummy-escape','mummy-escape','Mummy Escape','Puzzle','Game giải đố chiến thuật vượt ngục Kim Tự Tháp Pharaoh kinh điển theo lượt','published',3,false),
('shikaku','shikaku','Shikaku','Puzzle','Vẽ các hình chữ nhật để lấp đầy bảng theo số ô cho sẵn','published',4,false),
('eat-em-all','eat-em-all','Eat ''Em All - Nuốt Chửng Nguyên Tố','Arcade','Điều khiển nhân vật hứng nuốt các item rơi, chuyển đổi Băng/Lửa và bão cuồng nộ Fury x10','published',5,false),
('scoodoku','scoodoku','Scoodoku','Puzzle','Game Sudoku đa cấp độ từ ô vuông 3x3 đến ma trận IQ 180 bậc thang','published',6,false),
('fill-the-space','fill-the-space','Lấp Đầy Khoảng Trống','Puzzle','Xếp các khối gỗ 3D lấp đầy khuôn rỗng chạm khắc trên mặt bàn','published',7,false),
('blocker','blocker','Xếp Gạch','Puzzle','Xếp gạch, phá hàng ngang dọc và ghi điểm','published',8,true),
('chess','chess','Cờ Vua Quốc Tế','Multiplayer','Đấu trí Cờ Vua đỉnh cao, ghép trận PvP thời gian thực, chế độ AI Đại Kiện Tướng và xếp hạng ELO','published',9,false),
('xiangqi','xiangqi','Cờ Tướng Online','Multiplayer','Đấu trí Cờ Tướng đối kháng trực tuyến thời gian thực, xếp hạng ELO và tạo phòng 6 số','published',10,false),
('caro-gomoku','caro-gomoku','Cờ Caro Gomoku Online','Multiplayer','Đấu trí 15x15 nhiều người chơi, ghép trận PvP thời gian thực và xếp hạng ELO','published',11,false),
('neon-runner','neon-runner','Neon Runner 2099','Arcade','Game chạy vô tận Cyberpunk tốc độ cao né bẫy nhặt ngọc','published',12,false),
('cosmic-defense','cosmic-defense','Cosmic Defense','Action','Bắn ruồi không gian retro và tiêu diệt hạm đội Boss','published',13,false),
('cyber-slice','cyber-slice','Cyber Blade Slice','Reflex','Chém quả cầu năng lượng tốc độ cao tránh bom tử thần','published',14,false),
('hex-match','hex-match','Hex Collapse Puzzle','Puzzle','Xếp hình tổ ong ghép màu nổ dây chuyền','published',15,false),
('tile-2048','tile-2048','Xếp Gạch 2048','Puzzle','Vuốt ghép các ô số, chinh phục mốc 2048','published',16,true),
('draw-a-shape','draw-a-shape','Draw A Shape','Puzzle','Nối các điểm màu và lấp đầy bảng.','published',17,false)
on conflict(id) do nothing;
