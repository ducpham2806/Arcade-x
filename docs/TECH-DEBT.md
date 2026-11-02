# Nợ kỹ thuật

Danh sách giữ bằng skill `/tech-debt`. Mỗi mục ghi rõ chi phí nếu để nguyên và lợi ích khi sửa.

| # | Vùng | Vấn đề | Chi phí nếu để nguyên | Cách sửa | Lợi ích |
|---|---|---|---|---|---|
| 1 | Phòng online | Có ba bản chép của cùng mẫu phòng server làm trọng tài: Battleship (`src/games/battleship/server.ts`, `online-client.ts`, `supabase/functions/battleship-room`), Duel (`src/games/duel/…`, `supabase/functions/duel-room`) và Nối Từ (`src/games/word-chain/server.ts`, `supabase/functions/word-chain-room`). SQL cũng chép ba lần (`supabase/{battleship,duel,word-chain}`). | Sửa lỗi CAS, presence hay hạn mức phải sửa ở ba nơi; dễ lệch nhau. | Tách phần chung (vòng CAS và receipt, presence 90 giây, khung Edge handler, `PostgresStore`, `RoomClient<Seat>`) thành module dùng chung; mỗi game chỉ giữ luật và lệnh riêng. Nên làm trước khi thêm game online thứ tư, kèm test của cả ba. | Một chỗ sửa, test dùng chung. |
