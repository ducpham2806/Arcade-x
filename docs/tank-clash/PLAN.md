# Tank Clash — Kế hoạch phát triển v1.3 — bàn giao

Ngày lập: 02/11/2026 (Việt Nam) · Dự án: Arcade-x

**Trạng thái bàn giao 03/11/2026:** đã có P0/P1 và bản kỹ thuật P2 online 1v1. Bản bàn giao dùng room host/netcode/WS server mới hơn đã vào main qua PR #13; hợp nhất lịch sử nhánh P2 ngày 02/11 và ghi rõ các khác biệt. Xem **§15** để chạy, kiểm thử và tiếp quản. Chưa nghiệm thu Internet/thiết bị thật, chưa có 2v2/matchmaking hoặc art/audio sản xuất; chưa duyệt phát hành công khai.

## 1. Mục tiêu sản phẩm

Một game xe tăng đấu trường góc nhìn từ trên xuống, chơi trên web điện thoại và PC. Người chơi lái, ngắm và bắn độc lập; đọc đường đạn, tận dụng tường phản xạ và phối hợp đánh vòng để thắng.

**Giả thuyết về độ vui:** né được đạn rồi bắn bật tường trúng đối thủ tạo khoảnh khắc dễ hiểu, đã tay và khiến người chơi muốn đấu lại.

Các trụ cột:

- Dễ điều khiển trên điện thoại, phản hồi ngay khi thao tác.
- Đường đạn và vật cản rõ ràng; thắng thua có thể giải thích được.
- Đấu đội tạo cơ hội phối hợp, không chỉ thêm người vào bản đồ 1v1.
- Vào trận với bạn bè nhanh bằng mã hoặc link.
- Đồng bộ ổn định, hạn chế lưu dữ liệu không cần thiết.

## 2. Phạm vi và thứ tự

| Mốc | Nội dung | Phạm vi |
|---|---|---|
| Bản thử cảm giác chơi | Lái, ngắm, bắn bật tường, vật cản, một kỹ năng, bot luyện tập | Chơi thử cục bộ; chưa được gọi là multiplayer online |
| Bản thử online đầu | Phòng riêng 1v1, máy chủ quyết định gameplay, trở lại trận sau mất mạng | Kiểm chứng độ trễ trước khi đầu tư nhiều nội dung |
| MVP để anh chơi thử | 1v1 và 2v2 phòng riêng; chơi nhanh 2v2; tổ đội; kết quả và đấu lại | Một luật đấu loại theo hiệp, cùng loại xe và chỉ số ngang nhau |
| Mở rộng sau MVP | 3v3 tranh khu vực; 4v4 cướp lõi | Bản đồ và cân bằng riêng, mở sau khi mốc trước đạt kiểm thử |

Trong MVP, 1v1 ưu tiên thách đấu/phòng riêng. Chỉ mở hàng chờ công khai 2v2 lúc đầu để tập trung người chơi. Không đưa ranked, battle pass, cây nâng cấp sức mạnh, bang hội, voice chat hoặc campaign vào phạm vi MVP.

## 3. Vòng chơi và luật MVP đề xuất

### 3.1 Vòng chơi

Vào sảnh → luyện tập hoặc chọn phòng → chia đội/sẵn sàng → tải trận → đấu từng hiệp → bảng kết quả → đấu lại hoặc về sảnh.

Trong trận: tìm góc bắn → ép đối thủ rời chỗ nấp → né/đỡ đạn → tận dụng cơ hội → thắng hiệp. Sau mỗi trận có thống kê gọn về kết quả và đóng góp; chưa cần hệ thống nâng cấp sức mạnh lâu dài.

### 3.2 Điều khiển

| Thiết bị | Di chuyển | Ngắm/bắn | Kỹ năng |
|---|---|---|---|
| Điện thoại | Cần ảo bên trái, thân xe quay theo hướng di chuyển | Cần ngắm bên phải; kéo để ngắm, nhả để bắn trong bản thử đầu | Một nút khiên riêng |
| PC | WASD hoặc phím mũi tên | Chuột ngắm, chuột trái bắn | Space |

Ưu tiên màn hình ngang trong trận. Sảnh có thể xem dọc; chỉ dẫn xoay máy trước khi sẵn sàng. Bản thử sẽ so sánh nhả để bắn với giữ để bắn, rồi chọn một cách mặc định dựa trên khả năng thao tác thật. Kéo ngắm có vùng hủy để tránh bắn ngoài ý muốn. Khi mất focus hoặc mất kết nối, input được đưa về trạng thái trung tính.

Thân xe và tháp pháo xoay độc lập; giới hạn tốc độ quay được điều chỉnh bằng thử nghiệm. Không dùng điều khiển tiến/lùi kiểu mô phỏng làm mặc định. Vùng chạm nằm ngoài các điểm quan trọng của HUD và được kiểm tra với mép màn hình, tai thỏ, thao tác hai ngón.

### 3.3 Đặc tả cơ chế ban đầu

| Cơ chế | Mục đích/trải nghiệm | Input → output | Trường hợp cần xử lý |
|---|---|---|---|
| Di chuyển và ngắm độc lập | Vừa né vừa giữ góc bắn | Hướng cần lái + hướng ngắm → vị trí/thân xe/tháp pháo | Kẹt góc, áp sát tường, nhiều xe chạm nhau, input cũ sau reconnect |
| Đạn bật tường | Tạo lựa chọn bắn gián tiếp | Lệnh bắn hợp lệ → đạn, phản xạ ở tường thép | Va góc, đạn nhanh xuyên tường, nhiều va chạm cùng nhịp, vượt số lần bật |
| Gạch phá được | Mở đường và thay đổi chỗ nấp | Đạn trúng → gạch mất độ bền; viên đạn dừng | Hai đạn cùng phá một ô, trạng thái gạch khác giữa các máy |
| Khiên ngắn hạn | Cho một cơ hội phản ứng, tránh phải thêm nhiều nút | Kích hoạt hợp lệ → chặn sát thương trong cửa sổ ngắn | Đạn và khiên cùng nhịp, spam lệnh, mất mạng, khiên đã hồi hay chưa |
| Loại khỏi hiệp | Tạo hệ quả rõ ràng | HP về không → xe dừng tham chiến, chuyển xem trận | Hai đội bị loại đồng thời, người rời trận, spectator gửi input |
| Reset hiệp | Cho cơ hội bắt đầu lại công bằng | Máy chủ mở hiệp mới → phục hồi xe, gạch và vị trí | Đạn/VFX cũ còn tồn tại, kết quả hiệp bị cộng hai lần |

Luật đề xuất: tường thép phản xạ; gạch nhận sát thương và chặn viên đạn; mép ngoài bản đồ hấp thụ đạn. Đạn của mình có thể gây sát thương cho mình sau khi bật; friendly fire giữa đồng đội tắt trong MVP. Một viên đạn biến mất khi gây sát thương hoặc bị khiên chặn, không gây nhiều lần từ cùng một va chạm. Những quy tắc này cần hướng dẫn trực quan trong sân tập.

Không có nhặt tăng sát thương ngẫu nhiên trong MVP để dễ đọc kết quả và cân bằng. Bot luyện tập dùng cùng quy tắc xe, đạn và khiên như người chơi.

### 3.4 Thông số để bắt đầu thử

**Tất cả giá trị trong bảng là [PLACEHOLDER], chưa phải cân bằng đã được chơi thử.** Bảng tuning có thể chỉnh được sẽ là đầu ra của giai đoạn P0/P1.

| Biến | Giá trị khởi điểm [PLACEHOLDER] | Lý do thử |
|---|---|---|
| HP mỗi xe | 3 | Cho phép mắc lỗi, vẫn dễ đọc số lần trúng |
| Sát thương mỗi đạn | 1 | Dễ giải thích kết quả và so sánh thay đổi |
| Hồi bắn | 0,65 giây | Tạo khoảng né và tránh spam kín sân |
| Đạn đang tồn tại tối đa mỗi xe | 3 | Giới hạn độ rối và tải mô phỏng |
| Số lần phản xạ | 1 | Dễ học đường đạn và kiểm soát tình huống |
| Tuổi thọ tối đa viên đạn | 2,5 giây | Tránh đạn tồn tại quá lâu hoặc lặp vô hạn |
| Khiên | Hiệu lực 0,8 giây; hồi 8 giây | Một quyết định phản ứng có giá trị, chưa lấn át bắn/né |
| Độ bền gạch | 2 lần trúng | Giữ ý nghĩa chỗ nấp nhưng vẫn mở đường được |
| Thời lượng hiệp | 60 giây | Nhịp ngắn để sớm được chơi lại sau khi bị loại |
| Số hiệp tối đa/trận | 3 | Trận gọn, có cơ hội sửa cách chơi |
| Bảo lưu ghế khi mất kết nối | 20 giây | Có cơ hội quay lại mà không giữ phòng vô hạn |

Tốc độ xe, đạn, quay tháp pháo và kích thước hitbox sẽ được chọn theo kích thước màn hình và bản đồ trong P1, thay vì chốt số tùy ý trước khi có prototype.

### 3.5 Xác định thắng thua

- Đội còn xe khi đối phương đã bị loại hết thắng hiệp. Xe bị loại không hồi sinh giữa hiệp.
- Hết giờ: so số xe còn sống, sau đó tổng HP còn lại; nếu vẫn bằng thì hiệp hòa.
- Tối đa ba hiệp [PLACEHOLDER]; đội thắng nhiều hiệp hơn thắng trận, đạt hai hiệp thắng thì kết thúc sớm. Nếu bằng số hiệp thắng sau giới hạn, trận hòa.
- Cùng bị loại trong cùng nhịp mô phỏng: hiệp hòa. Không dùng thứ tự nhận gói tin trên từng máy để quyết định thắng.
- Kết quả, đồng hồ, sát thương và chuyển hiệp do máy chủ xác nhận.
- Xem trận dùng góc nhìn công khai vì MVP không có sương mù hoặc thông tin chiến đấu bí mật.

## 4. Bản đồ và nội dung

### MVP

- Sân tập an toàn: thử lái, bắn thẳng, bắn bật, phá gạch và khiên. Thành công đầu tiên đến từ bia đứng yên, chưa đặt người mới vào tình huống bị loại ngay.
- Bản đồ Duel nhỏ cho 1v1: góc bắn rõ, không có đường bắn trực tiếp vào vị trí xuất phát.
- Bản đồ Crossfire cho 2v2: lối chính, đường vòng hai bên, vật cản cho phối hợp. Có nhiều đường tiếp cận để giảm thủ góc.
- Một chassis xe cùng chỉ số; nhận diện đồng đội/đối thủ bằng màu cộng biểu tượng và viền, không chỉ dựa vào màu.
- Nếu hai bản đồ đầu chưa đủ vui, sửa chúng trước khi thêm bản đồ mới.

### Sau MVP

- 3v3: tranh giữ một khu vực; cần hồi sinh và bảo vệ điểm xuất phát, quy tắc mới được đặc tả riêng.
- 4v4: cướp lõi, có người mang lõi và đồng đội hộ tống; cần kiểm tra camera, minimap và đường về căn cứ.
- Chỉ cân nhắc loại xe/kỹ năng mới sau khi xe nền đạt cân bằng; không gắn sức mạnh vào gói trả phí.

## 5. Phòng, matchmaking và kết nối

### Phòng riêng

Tạo phòng → chọn 1v1/2v2 → mã/link mời → người chơi vào → chia đội → sẵn sàng → bắt đầu khi hợp lệ.

- Mã mời dễ đọc, có thời hạn; không dùng mã phòng làm bằng chứng danh tính.
- Hiển thị rõ phòng không tồn tại, đã đầy, đang chơi, hết hạn hoặc khác phiên bản.
- Chủ phòng được chỉnh đội và luật trước trận; đổi cấu hình làm hủy trạng thái sẵn sàng của người chơi.
- Trong trận, chủ phòng không có quyền thay HP, kết quả hoặc đội.
- Chủ phòng rời sảnh: chuyển quyền cho người còn lại theo quy tắc cố định. Chủ phòng rời trận: máy chủ vẫn tiếp tục mô phỏng.
- Hai người tranh ghế cuối hoặc gửi bắt đầu cùng lúc phải được xử lý nguyên tử tại server.
- MVP khóa người mới vào khi trận đã bắt đầu; reconnect được về đúng ghế cũ.

### Chơi nhanh và tổ đội

- Một hàng chờ 2v2 công khai ban đầu; người chơi solo có thể được ghép thành đội.
- Tổ đội hai người phải ở cùng đội khi tìm trận; ưu tiên ghép với tổ đội tương đương, mở rộng điều kiện theo thời gian chờ và báo cho người chơi.
- Lọc khu vực/độ trễ trước, mức kỹ năng khi đủ dữ liệu. Chưa cần ranked trong MVP.
- Hủy tìm trận phải giải phóng ghế; không cho một tài khoản chiếm nhiều trận đang chạy.
- Nếu thiếu người, cho chọn tiếp tục đợi hoặc chuyển luyện tập với bot. Không tự thêm bot rồi hiển thị như người thật.

### Mất mạng và bỏ trận

- Xe mất kết nối không nhận input mới; dừng theo mô phỏng server và vẫn có thể chịu sát thương. Không bất tử do mất mạng.
- Trong thời gian bảo lưu [PLACEHOLDER], kết nối lại nhận snapshot hiện tại và tiếp tục với HP/kỹ năng cũ.
- Hết thời gian: người chơi bị tính bỏ trận và xe bị loại khỏi phần còn lại của trận; đồng đội còn lại có thể tiếp tục. Cả đội không còn người hợp lệ thì thua do bỏ trận.
- Hai đội cùng mất kết nối và hết hạn: hủy trận, không trao thưởng thắng/thua. Máy chủ lỗi: ghi trận hủy, không để client tự tuyên bố thắng.
- Đổi tab, khóa màn hình hoặc đưa app xuống nền phải được thử như tình huống mất mạng.
- Sau trận: đấu lại chỉ khi đủ người đồng ý; nếu thiếu người thì về sảnh, không chờ vô hạn.

## 6. Kiến trúc đề xuất và tích hợp Arcade-x

Đây là hướng kiến trúc để thử nghiệm, chưa phải cam kết chọn nhà cung cấp hoặc kết luận về source hiện tại.

| Thành phần | Trách nhiệm đề xuất |
|---|---|
| Client web | Input, hiển thị, âm thanh; dự đoán chuyển động xe mình và làm mượt xe khác; có đối soát với server |
| Room server | Giữ trận trong bộ nhớ; xác thực input; tính xe, đạn, va chạm, HP, đồng hồ, thắng thua và ghế reconnect |
| Supabase hiện có | Tài khoản và dữ liệu bền vững phù hợp sau khi kiểm kê: kết quả trận, thống kê, quyền chơi; không ghi vị trí/đạn theo từng nhịp |
| Launcher | Lối vào game, tải asset khi cần, quyền truy cập, thoát game và trạng thái kết nối |
| Lưu kết quả | Server ghi theo match ID có chống ghi trùng; client không tự cấp chiến thắng/phần thưởng |

Ưu tiên tương thích runtime của Arcade-x sau khi đọc repository. Nếu phù hợp, thử TypeScript cho logic dùng chung và server phòng; **Colyseus là một ứng viên để đánh giá**, chưa đăng ký dịch vụ trả phí hoặc đổi hạ tầng chỉ vì kế hoạch này. Room server cần môi trường chạy tiến trình và kết nối lâu dài; phương án hosting sẽ được đưa ra cùng phép đo và chi phí trước khi chọn.

Nguyên tắc đồng bộ:

- Client gửi ý định di chuyển, ngắm, bắn và kỹ năng; không gửi vị trí/HP cuối cùng như kết quả được tin cậy.
- Server giới hạn tần suất input, tốc độ di chuyển, hồi chiêu, số đạn và quyền của người chơi.
- Tách nhịp mô phỏng, nhịp gửi mạng và nhịp vẽ màn hình; điều chỉnh bằng số đo trong P0/P2.
- Chỉ truyền trạng thái thay đổi cần thiết; không gửi toàn bộ thế giới mỗi frame.
- Animation, tiếng nổ, rung và VFX được dựng tại client từ sự kiện, không phát sinh bản ghi database riêng.
- Không truy vấn database trong vòng lặp bắn/di chuyển. Luồng thường hoàn tất trận ghi kết quả gọn theo giao dịch; số thao tác không tăng theo số frame.
- Lỗi lưu kết quả không làm đứng trận; retry có giới hạn và chống ghi trùng, hiển thị trạng thái chưa đồng bộ nếu cần.
- Rời game phải hủy listener, timer, input và kết nối sở hữu bởi game.

Nếu bổ sung dữ liệu Supabase: thiết kế migration riêng có kiểm thử trên môi trường thử; kiểm tra quyền đọc/ghi và không đưa secret vào client. Quyền truy cập game và quyền nhận phần thưởng được xác nhận tại backend. Đây là việc của giai đoạn triển khai, chưa thực hiện thay đổi DB trong đợt này.

Đưa Tank Clash vào launcher bằng cấu hình thử nghiệm, tái sử dụng tài khoản và UI phù hợp sau kiểm kê. Không sửa đồng loạt các game PvP đang có để phục vụ prototype. Nếu launcher có subscription, kiểm tra quyền lúc vào/tìm trận; không cắt ngang trận hợp lệ vừa hết hạn gói giữa chừng, áp dụng lại khi vào trận sau.

## 7. Hướng art, UI và âm thanh

- 2D góc nhìn từ trên xuống, tạo cảm giác khối qua ánh sáng/bóng; xe nhỏ nhưng tháp pháo và hướng bắn rõ. Tông arcade cơ khí, tránh quá nhiều chi tiết làm khó nhận đạn.
- Chất liệu thép phản xạ và gạch phá được khác nhau về hình, màu và phản hồi trúng.
- HUD tối giản: đội, HP, thời gian, điểm hiệp, trạng thái khiên. Cần điều khiển không che xe và góc bắn quan trọng.
- Các trạng thái cần art: idle, di chuyển/bánh xích, quay tháp, giật nòng, trúng đạn, khiên, bị loại; tái sử dụng phần chuyển động theo lớp thay vì tạo quá nhiều bộ sprite.
- Tạo asset bằng công cụ tạo ảnh khi vào giai đoạn art; chuẩn hóa qua workflow tech-art. Chưa tạo hình trong đợt lên kế hoạch này.
- Icon/banner phải thể hiện xe tăng và bắn bật tường, thống nhất với tên/asset trong màn loading.
- SFX: động cơ, bắn, đạn bật, gạch vỡ, khiên và kết thúc hiệp. Âm thanh có giới hạn số tiếng chồng, điều chỉnh âm lượng và dừng khi thoát. Nhạc không che tín hiệu chiến đấu.
- Art sản xuất thực hiện sau khi prototype chứng minh được gameplay; hình tạm được ghi rõ là hình tạm.

## 8. Các giai đoạn thực hiện

| Mốc | Công việc | Đầu ra | Điều kiện chuyển bước |
|---|---|---|---|
| **P0 — Nền và thiết kế** | Kiểm kê source/launcher, room/auth hiện có; chốt GDD ngắn và bảng tuning; thử kết nối server với input và snapshot tối thiểu | GDD v1, tuning v1, sơ đồ module, báo cáo phương án mạng/hosting | Có hướng chạy local và đường lên online rõ; ghi được phép đo ban đầu; không phụ thuộc giả định module sẵn có |
| **P1 — Cảm giác chơi** | Lái/ngắm độc lập; đạn bật; gạch; HP; khiên; bot; sân tập và bản đồ đầu | Bản chơi thử cục bộ mobile/PC | Không kẹt góc/xuyên tường; hành động dễ hiểu; kiểm chứng pha bắn bật có thú vị |
| **P2 — Online 1v1** | Server mô phỏng; mã/link phòng; ready; đồng hồ; thắng thua; reconnect; đối soát và làm mượt | Bản thử phòng 1v1 thật giữa hai client | Hai máy thống nhất kết quả; host rời không phá trận; có phép đo độ trễ và băng thông |
| **P3 — MVP 2v2** | Đội, tổ đội, phòng riêng, queue 2v2, bản đồ đội; xem trận; hủy queue; đấu lại | Bản thử hai hoặc bốn người | Ghép/chia đội đúng; xử lý thiếu người/bỏ trận; không thêm bot ẩn |
| **P4 — Hoàn thiện trải nghiệm** | Art xe/map/VFX; UI/HUD; icon/banner; SFX/BGM; hướng dẫn; tích hợp launcher và kết quả | Bản preview tích hợp đầy đủ phạm vi MVP | Loading đúng icon/%; quyền chơi đúng; tải asset theo nhu cầu; thoát game sạch |
| **P5 — QA và duyệt MVP** | Chơi thử thật; mạng yếu; thiết bị; soak/load test; sửa lỗi và ghi kết quả | Build test + checklist + báo cáo lỗi/giới hạn | Qua các tiêu chí kiểm thử, sẵn sàng để anh duyệt phát hành |
| **P6 — 3v3** | Đặc tả tranh khu vực, hồi sinh, bản đồ và camera mới | Bản thử sáu người | Gameplay, mạng và độ rõ hình đạt kiểm thử riêng |
| **P7 — 4v4** | Đặc tả cướp lõi, vai trò hộ tống, minimap và bản đồ đội lớn | Bản thử tám người | Không chỉ tăng số slot; kiểm thử tám người và tải đồng thời đạt mục tiêu |

Thứ tự phụ thuộc: P0 → P1 → P2 → P3 → P4 → P5 → P6 → P7. Có thể làm thêm art thăm dò sau P1, nhưng không dời kiểm chứng online ra sau sản xuất art. Chưa gán ngày hoàn thành trước khi kiểm kê source và có phép đo P0/P1.

## 9. Kế hoạch kiểm thử và mục tiêu đo

Các số dưới đây là **mục tiêu nghiệm thu [PLACEHOLDER]**, chưa phải kết quả đã đạt. P0 sẽ ghi thiết bị, trình duyệt và cấu hình mạng cụ thể để phép đo có thể lặp lại.

| Nhóm | Cách kiểm tra | Mục tiêu ban đầu [PLACEHOLDER] |
|---|---|---|
| Cảm giác chơi | Người mới thử điều khiển và bắn bật không cần người hướng dẫn liên tục | Tự di chuyển, bắn và hiểu tường phản xạ trong 60 giây |
| Đồ họa mobile | Đo trong giao tranh trên thiết bị Android mục tiêu | Hướng tới 60 FPS; chế độ giảm hiệu ứng giữ ít nhất 30 FPS |
| Mạng | Mô phỏng RTT 80/150/250 ms, jitter 30 ms và loss 1–3% | Không bất đồng kết quả/HP/hiệp; ghi độ hiệu chỉnh vị trí và cảm nhận điều khiển, không tuyên bố hết lag |
| Tải mạng | Đo byte vào/ra theo client, cả lúc chiến đấu và reconnect | Trần thử 20 KB/giây/client trung bình trong trận; điều chỉnh theo dữ liệu thực |
| Tính nhất quán | Chạy va chạm, bắn đồng thời, đạn bật góc, kết thúc hiệp | Không có hai kết quả khác nhau; kết quả không được ghi trùng |
| Kết nối | Mất mạng, đổi tab, khóa màn hình, rời phòng, đóng client chủ phòng | Không nhân đôi xe/ghế; không bất tử; khôi phục đúng HP hoặc kết thúc theo luật |
| Database | Đếm thao tác và dữ liệu trước/trong/sau trận | Không ghi tọa độ hoặc đạn từng tick; thao tác bền vững gắn với tài khoản/kết quả, có chống trùng |
| Tài nguyên | Chơi nhiều trận rồi vào/ra launcher | Chạy liên tục 30 phút; không tăng listener/timer theo từng lần vào game, không lặp âm thanh nền |
| Multiplayer thật | Hai và bốn người trên thiết bị/trình duyệt độc lập | Hoàn thành ít nhất 10 trận mỗi quy mô; kiểm tra cả phòng riêng và queue |

Công cụ mô phỏng nhiều client không thay cho chơi thử nhiều người trên mạng thật. Nếu không có đủ người tham gia, báo đúng phần đã kiểm bằng bot/client tự động và phần còn thiếu.

Kiểm thử mã tập trung vào phần dễ gây sai kết quả: phản xạ/va chạm, damage một lần, đồng hồ/đổi hiệp, ghế reconnect, queue cancellation và lưu kết quả chống trùng. UI và cảm giác chơi cần kiểm trực tiếp, không chỉ dựa vào unit test.

Những dấu hiệu buộc dừng mở rộng nội dung: người mới không hiểu vì sao chết, thủ góc quá hiệu quả, thao tác che tầm nhìn, xe hiệu chỉnh giật thường xuyên, hai máy khác kết quả, tải dữ liệu tăng theo thời gian dù không thêm người. Giải quyết nguyên nhân trước khi mở 3v3/4v4.

## 10. Việc đầu tiên khi bắt đầu triển khai

- [x] **P0.1:** lấy đúng bản source Arcade-x hiện hành, đọc quy định repo và xác định nhánh làm việc; không giả định bản nào là mới nhất.
- [x] **P0.2:** kiểm kê điểm vào game, renderer/input/audio, hệ phòng, tài khoản, quyền chơi và quy trình build; ghi phần tái sử dụng/phần cần mới.
- [x] **P0.3:** viết GDD ngắn và bảng tuning chỉnh được theo các luật trên; xác định ID/version của giao thức trận.
- [x] **P0.4:** tạo thử nghiệm mạng tối thiểu chạy local với hai client, đo input/snapshot và rời–vào lại; đánh giá ứng viên room server.
- [x] **P1.1:** dựng sân tập và bản prototype mobile/PC cho anh thử lái, ngắm, bắn bật tường và khiên.

Các mục trên đã có đầu ra trong đợt P0/P1.

**P2 (03/11/2026, chi tiết ở `docs/tank-clash/P2-review.md`):**
- [x] **P2.1:** giao thức `tank-clash.p2.v1`, xác thực Supabase tuỳ chọn, mã phòng, lỗi rõ ràng, khóa khi đang trong trận.
- [x] **P2.2:** máy chủ phòng làm trọng tài: sẵn sàng, đếm ngược, đồng hồ, thắng thua, giữ ghế 20 s, xử thua, hủy trận, đấu lại, kết quả một lần theo `matchId`.
- [x] **P2.3:** client dự đoán/đối soát xe mình, nội suy xe đối thủ, tự nối lại; giao diện online trong bản preview.
- [x] **P2.4:** thử RTT 80/150/250 ms, jitter 30 ms, mất gói 1–3 % trên mạng ảo; đo băng thông.
- [ ] **P2.5:** chọn hosting và deploy staging (cần anh duyệt chi phí).
- [ ] **P2.6:** chơi thử 10 trận trên hai thiết bị thật qua Internet; quyết định có cần lag compensation.

## 11. Quy trình giao bản và giới hạn phát hành

Mỗi giai đoạn giao một bản test có số phiên bản, thay đổi chính, phần đã kiểm và lỗi còn lại; cập nhật checkbox và nhật ký trong kế hoạch. Khi cần tích hợp repo, làm trên nhánh riêng và build kiểm trước. Theo quy ước Arcade-x: chỉ đưa lên công khai sau khi anh duyệt bản cụ thể. Ngày 02/11/2026, anh Đức yêu cầu tiếp tục phần đang dừng và merge sau khi hoàn tất. Thực hiện merge source sau kiểm thử; trạng thái local/remote được ghi rõ trong báo cáo bàn giao. Phát hành công khai vẫn cần duyệt bản cụ thể.

## 12. Căn cứ kỹ thuật và phần cần xác nhận

Tham khảo tài liệu chính thức ngày 02/11/2026:

- [Colyseus — State Synchronization](https://docs.colyseus.io/state): server cập nhật trạng thái và đồng bộ phần thay đổi. Đây là căn cứ cho ứng viên kiến trúc, không phải bằng chứng đã đo hiệu năng Tank Clash.
- [Colyseus — Matchmaking](https://docs.colyseus.io/matchmaker): hỗ trợ tìm/tạo phòng, vào phòng theo ID và lọc phòng. Luật tổ đội, mã ngắn, quyền vào, fairness và UX cần do game xây thêm.

Các nội dung cần giải quyết qua P0/P1, chưa cần hỏi thêm để hoàn tất plan: runtime phù hợp sau kiểm kê source; phương án hosting và chi phí; thiết bị mobile mục tiêu; cách bắn mặc định sau thử nghiệm; thông số tuning. Nếu lựa chọn hạ tầng phát sinh chi phí thì trình phương án cụ thể trước khi đăng ký.

## 13. Nhật ký

| Phiên bản/ngày | Thay đổi | Trạng thái thực thi |
|---|---|---|
| v1.0 · 02/11/2026 | Lập phạm vi MVP 1v1/2v2, bắn bật tường, phòng/matchmaking, kiến trúc đề xuất, các mốc P0–P7 và tiêu chí kiểm thử | Chỉ hoàn thành tài liệu; bắt đầu triển khai từ P0 |

## 14. Kết quả triển khai P0/P1 ngày 02/11/2026

- Source đã kiểm kê tại `ducpham2806/Arcade-x`, base ban đầu `7df4d1812aac7e8889d13c656c85adb599673208`; cập nhật main mới trước merge.
- `Tank_Clash_P1_Playtest.html`: HTML tự chứa, sân tập 5 bài và 1v1 với bot. PC dùng WASD/chuột/Space; điện thoại dùng hai cần và nút khiên.
- `docs/tank-clash/`: README, GDD-v1 và báo cáo P0/P1 trong source.
- Có 13 ca kiểm thử engine/mạng và kiểm tra TypeScript phạm vi Tank Clash. Kết quả lượt cuối nằm trong báo cáo bàn giao.
- Đã quan sát bố cục desktop và khung mobile dọc/ngang; chưa nghiệm thu FPS trên thiết bị thật, mạng yếu hay playtest nhiều người.
- Spike WebSocket chỉ chạy loopback, không phải phòng production và chưa nối vào UI.
- P2 tiếp theo: auth/quyền vào phòng, tạo/vào bằng mã, ready, prediction/reconciliation/interpolation, luật rời trận và thử RTT/jitter/loss.

| Phiên bản/ngày | Thay đổi | Trạng thái |
|---|---|---|
| v1.1 · 02/11/2026 | Triển khai P0 và prototype P1; bổ sung GDD, tuning và kiểm thử | Bản thử để anh chơi; chuẩn bị P2 |
| v1.2 · 03/11/2026 | P2: giao thức phòng, room server, netcode, server WebSocket, giao diện online, test mạng ảo và trình duyệt | Chạy được cục bộ; chờ chọn hosting và chơi thử thật |

## 15. Bàn giao cho người phát triển tiếp — 03/11/2026

### 15.1. Đọc phần này trước

**Điểm bàn giao:** mã nguồn P0/P1 và bản kỹ thuật P2 phòng riêng 1v1. Gameplay và online đã chạy cục bộ; chưa nghiệm thu Internet/thiết bị thật, chưa có 2v2, chưa phát hành công khai. Lấy source từ `main` của [ducpham2806/Arcade-x](https://github.com/ducpham2806/Arcade-x), không tiếp tục bằng cách copy một HTML cũ vào launcher.

Repository có hai hướng P2 được phát triển song song. Lần bàn giao này hợp nhất lịch sử nhánh `feat/tank-clash-p2-rooms` với main đã nhận PR #13; giữ **một bộ chạy hiện hành** là `room.ts` + `net-client.ts` + `server/tank-clash-room/` từ bản P2 mới hơn trên main. Bản cũ `server/tank-clash/` + `online-client.ts` được bảo toàn trong lịch sử commit, không để chạy lẫn với bộ hiện hành. Chi tiết khác biệt và cách tìm lại nằm ở §15.8.

| Mốc | Đã làm | Chưa hoàn tất |
|---|---|---|
| P0 | Audit các điểm tích hợp Arcade-x; GDD v1, tuning v1; engine thuần và spike WebSocket 2 client | Spike chỉ để tham chiếu; không dùng làm server sản phẩm |
| P1 | Năm bài sân tập, bot 1v1, điều khiển PC/touch, luật đạn/tường/gạch/khiên/hiệp, HUD/dialog/cleanup | Playtest người mới, cân bằng, FPS mobile thật |
| P2 | Phòng riêng 1v1 thật; tạo/vào bằng mã/link; sảnh/ready/countdown; server làm trọng tài; reconnect/forfeit/rematch; prediction/reconciliation/interpolation; WS adapter và auth hook | Hosting WSS, phiên tài khoản thật/quyền chơi, 10 trận hai thiết bị qua Internet, soak/load và đánh giá lag compensation |
| P3 | Chưa triển khai | 2v2, party, queue/matchmaking, map đội, hủy queue, xem trận |
| P4 | Có React adapter làm nền; chưa tích hợp catalog | Art/animation/VFX/icon/banner/audio, launcher/loading, entitlement, kết quả bền vững/thưởng |
| P5 | Có test tự động và các lần kiểm UI cục bộ | QA đa thiết bị, playtest nhiều người, hiệu năng/soak/load, anh duyệt phát hành |
| P6–P7 | Chỉ có định hướng | 3v3 tranh khu vực và 4v4 cướp lõi; đặc tả luật/map/respawn/camera riêng |

### 15.2. Gameplay và UI đã thực hiện

- Engine TypeScript thuần, chạy fixed step 60 Hz ở Node và browser; không phụ thuộc DOM, mạng hoặc database. Thân xe quay theo hướng lái; tháp pháo ngắm độc lập. Di chuyển chéo được chuẩn hóa, kiểm va chạm tường/xe và trượt dọc tường.
- Đạn kiểm va chạm quét; một viên chỉ gây sát thương một lần; thép phản xạ một lần, gạch chặn đạn và phá sau hai lần trúng; đạn ra ngoài biên bị loại. Đạn của mình sau phản xạ có thể trúng mình; friendly fire giữa đồng đội tắt.
- HP, hồi bắn, giới hạn số đạn, khiên có thời gian hiệu lực/hồi chiêu. Xe HP 0 ngừng tham chiến, chờ kết thúc hiệp. Bot dùng cùng luật xe/đạn/khiên; hiển thị BOT rõ.
- Năm bài: lái tới mục tiêu → bắn bia → bắn bật → phá gạch → đỡ đạn bằng khiên. Phải thực hiện đúng hành động để mở bài tiếp; đường ngắm dự báo dùng chung luật phản xạ.
- Bản đồ Duel đầu có thép/gạch và vật cản giữa hai điểm spawn. Tối đa ba hiệp, đạt hai hiệp thắng thì kết thúc sớm. Hết giờ so số xe sống rồi HP; bằng thì hòa. Hai bên chết cùng tick hòa. Hiệp mới reset xe/gạch/đạn.
- PC: WASD/mũi tên lái, chuột ngắm/giữ chuột trái bắn, Space khiên. Touch: cần trái lái, kéo cần phải ngắm rồi nhả bắn, nút khiên riêng. Controls đặt ngoài vùng chiến đấu; có bố cục ngang/dọc.
- Menu sân tập/bot/online, hướng dẫn, HUD HP/hiệp/tỉ số/thời gian/khiên, cue đổi hiệp, kết quả, pause offline và góp ý sao chép thủ công. Không tự gửi góp ý ra ngoài.
- Offline blur/ẩn tab thì pause và xóa input. Online blur/Escape/pause từ launcher chỉ ngừng điều khiển; trận trên server vẫn chạy và xe vẫn bị bắn. UI giải thích rời trận là nhận thua.
- Online màu/nhãn theo mình–đối thủ, ghế B thấy đúng xe mình; có ping và thông báo nối lại. Form/đấu trường đã được kiểm bố cục 1280×760, 390×844, 844×390; đây không phải benchmark mobile.
- React adapter nhận `isPaused`, cleanup controller khi unmount. `destroy()` hủy RAF/listener/input/socket/timer sở hữu. Không gọi bridge cấp coin/EXP/leaderboard. `window.__tankClash` chỉ có trong preview để đọc trạng thái khi kiểm thử.

Thông số nguồn nằm ở `CONFIG` trong engine, không đọc trực tiếp từ workbook. **Tất cả vẫn là [PLACEHOLDER]**: world 800×480, radius 16, xe 155 px/s, turnSpeed 10 rad/s, HP 3, damage 1, hồi bắn 0,65 s, tối đa 3 đạn/xe, đạn 340 px/s, radius 3, tồn tại 2,5 s, bật 1 lần, khiên 0,8 s/hồi 8 s, hiệp 60 s, tối đa 3 hiệp. Sửa bảng cân bằng không tự đổi game.

### 15.3. Hệ online hiện hành

- Mã phòng 6 ký tự tránh 0/O/1/I/L; nhận mã được chuẩn hóa. Chỉ hai ghế A/B, không ghép bot giả người thật. Có lỗi tiếng Việt cho sai phiên bản, mã không tồn tại, đầy, đang chơi, phiên lỗi và gửi quá nhanh.
- Hai bên ready → đếm ngược 3 s → trận. Mỗi match có ID riêng. Server quyết định vị trí/va chạm/đạn/HP/khiên/gạch/đồng hồ/hiệp/kết quả. Chủ phòng không được sửa gameplay.
- Hai người tranh ghế cuối chỉ một người được vào, kể cả auth bất đồng bộ. Một tài khoản đã xác thực không chiếm nhiều phòng. Khách dev không phải tài khoản sản phẩm.
- Reconnect giữ ghế 20 s, giữ đúng HP và trạng thái; xe vẫn chịu sát thương khi mất mạng. Hết hạn xử thua nếu đối thủ còn; cả hai vắng thì hủy. Rời giữa trận xử thua ngay. Chủ phòng rời sảnh chuyển quyền; máy chủ vẫn mô phỏng độc lập với client chủ phòng.
- Thiết bị có resume token có thể nối lại/chiếm đúng ghế, ngắt kết nối cũ. Token tạm giữ trong sessionStorage, không phải mã phòng hay JWT. Phòng và token nằm trong RAM; restart server không phục hồi trận. Phòng trống 60 s hoặc sảnh idle 10 phút được dọn.
- Đấu lại dùng ready của cả hai, tạo match ID mới. Kết quả gọi `onResult` một lần/match ID; hiện chỉ log, chưa ghi DB. Sau kết quả đối thủ rời thì vẫn giữ màn kết quả cho người còn lại.
- Giao thức hiện hành `tank-clash.p2.v1`: client gửi `create/join/resume/ready/leave/input/ping`; server trả `joined/room/start/snapshot/result/error/pong/left`. Input chỉ gồm x/y/aim/fire/shield, sequence và batch tối đa 4; không nhận vị trí/HP do client tự quyết.
- Server simulation 60 Hz, snapshot 20 Hz; payload tối đa 2 KB, rate limit 120 gói/s/kết nối, hàng đợi/tín dụng tối đa 30 input. Input trễ được bù tối đa 2/nhịp trong giới hạn tín dụng, không chạy xe nhanh hơn thời gian thực; stale 250 ms về neutral.
- Xe mình dự đoán bằng `driveTank`, replay input chưa ack để đối soát; xe khác nội suy lùi 100 ms, ngoại suy tối đa 150 ms khi thiếu snapshot, không nội suy qua reset hiệp, giới hạn bước làm mượt. HP/kết quả luôn từ server; chưa có lag compensation khi bắn.
- Origin allowlist, heartbeat 10 s, đóng consumer chậm khi buffer vượt 256 KiB, `/health` có số liệu. Mở HTML `file://` gửi origin `null` chỉ được nhận khi server bind loopback. Server hiện hành chỉ phục vụ WS và health, **không phục vụ HTML**.
- Tài khoản: có `SUPABASE_URL` + `SUPABASE_ANON_KEY` thì xác minh bearer token qua `/auth/v1/user`, timeout 4 s, cache ngắn 60 s. Không cần service-role key. Production mặc định không chạy nếu thiếu cấu hình auth; `TANK_ALLOW_GUESTS=1` chỉ dành môi trường thử được chủ động cấu hình.
- Chưa nối token tài khoản vào adapter launcher, chưa có entitlement theo gói thuê và chưa tích hợp allowlist tài khoản thử nghiệm ở bộ server hiện hành. Không suy ra quyền chơi từ metadata người dùng. Không query/ghi DB trong vòng lặp bắn/lái.

### 15.4. Bản đồ mã nguồn và tài liệu

| Đường dẫn trong repo | Vai trò / nơi sửa tiếp |
|---|---|
| `src/games/tank-clash/engine.ts` | CONFIG, state, luật mô phỏng, bot, bài học, kết quả; `createState('duel', { online: true })` giữ cả hai ghế là người qua mọi hiệp |
| `src/games/tank-clash/protocol.ts` | Hợp đồng wire, NET, validation, tên/mã phòng, snapshot |
| `src/games/tank-clash/room.ts` | Host thuần, identity/ghế, lifecycle, input credit, deadline và `onResult` |
| `src/games/tank-clash/net-client.ts` | `createNetSession` thuần và `connectTankRoom` cho browser, prediction/reconcile/smoothing/reconnect |
| `src/games/tank-clash/runtime.ts` | DOM/Canvas, input/HUD/dialog và nối online; có `serverUrl`/`getToken` options để nối host sau |
| `src/games/tank-clash/tank-clash.css` | CSS riêng prefix `tc-`, responsive và dialog |
| `src/games/tank-clash/index.tsx` | Adapter React hiện chỉ nhận pause; chưa đăng ký launcher/catalog |
| `src/games/tank-clash/preview.ts` | Entrypoint standalone và hook đọc trạng thái dành test |
| `server/tank-clash-room/` | WS server hiện hành, package/lock riêng `ws@8.22.1`, chạy Node 22.18+ / khuyến nghị Node 24 |
| `server/tank-clash-spike/` | Spike P0 lịch sử; chỉ chạy test đối chiếu, không dùng mở phòng sản phẩm |
| `scripts/export-tank-review.mjs` | Build UI HTML tự chứa, đầu ra chính `deliverables/Tank_Clash_P2_Playtest.html`; giữ alias tên P1 để tương thích công cụ cũ |
| `tests/tank-clash/engine.test.mjs` | 12 ca engine |
| `tests/tank-clash/room.test.mjs` | 10 ca giao thức/phòng/race/reconnect/kết quả/rate limit |
| `tests/tank-clash/harness.mjs`, `netcode.test.mjs` | Đồng hồ/mạng ảo, 5 ca mạng và prediction |
| `tests/tank-clash/server.test.mjs`, `network.test.mjs` | 3 ca server thật + spike P0: tổng 4 ca |
| `tests/tank-clash/online-ui.test.ts` | Một ca 2 browser + WS thật; create/join/ready/lái/rời xử thua |
| `.github/workflows/ci.yml` | Các bước lint/build/budget/fast/server/browser, đã có test Tank Clash |
| `docs/tank-clash/GDD-v1.md` | GDD/tuning mechanics bản nền |
| `docs/tank-clash/P0-P1-review.md`, `P2-review.md` | Bằng chứng triển khai và giới hạn các lần kiểm |
| `docs/WORKLOG.md`, `SESSION-HANDOFF.md`, `OWNER-TODO.md`, `PENDING-DECISIONS.md` | Nhật ký repo, bàn giao chung, việc chủ dự án và quyết định hosting đang chờ |

Các file được sinh (`deliverables`, `preview/tank-clash/index.html`) không phải source chính; build lại bằng script. Workbook `Tank_Clash_Balance_v1.xlsx` đã lưu riêng cùng tài liệu bàn giao trước, là đề xuất tuning chưa nghiệm thu. Không đưa cả repo vào file HTML hoặc workbook.

### 15.5. Dựng môi trường và chạy lại

Từ một checkout **đầy đủ** của repo (không bỏ `public/`, `art/`, `standalone/`, `supabase/` nếu chạy CI toàn launcher):

```bash
git clone https://github.com/ducpham2806/Arcade-x.git
cd Arcade-x
git switch main
npm ci
npm ci --prefix server/tank-clash-room --ignore-scripts
npm ci --prefix server/tank-clash-spike --ignore-scripts
node scripts/export-tank-review.mjs
npm run dev:tank-server
```

Giữ terminal server đang chạy, mặc định `ws://127.0.0.1:3223/tank`. Mở `deliverables/Tank_Clash_P2_Playtest.html` ở hai cửa sổ/tab độc lập; chọn **Online 1v1 / Phòng riêng**, tạo phòng ở máy A, nhập mã ở B, cả hai ready. Có thể chỉ định `?server=ws://127.0.0.1:3223/tank`; link mời hiện hành dùng query `?room=MÃ&server=...`. Mở HTML đơn lẻ vẫn chơi sân tập/bot được; online cần server riêng đang chạy. Chưa có URL server Internet đi kèm file.

Các biến môi trường hiện hành:

| Biến | Công dụng |
|---|---|
| `HOST`, `PORT` | Mặc định `127.0.0.1`, `3223`. Muốn LAN/staging phải cấu hình host thực và origin đúng |
| `TANK_ALLOWED_ORIGINS` | Danh sách origin cách nhau bởi dấu phẩy; không phải URL `/tank` |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Bật xác thực tài khoản; chỉ đặt cấu hình thật ngoài source, không commit token/secret |
| `NODE_ENV=production` | Bắt buộc auth mặc định; không dùng môi trường production để chạy thử DB |
| `TANK_ALLOW_GUESTS=1` | Ngoại lệ khách cho host thử có chủ đích, không thay quyền chơi theo subscription |

Môi trường máy khác cần HTTPS/WSS/reverse proxy và origin phù hợp; trang HTML nên phục vụ qua HTTPS khi thử đa thiết bị. Máy chủ WS hiện hành không tự phục vụ file game. Khi đổi giữa bản/server cũ và mới, tải lại cả client lẫn server và xóa phiên ghế cũ trong sessionStorage (key hiện hành `tank-clash.seat`); không chuyển resume token sang server khác. Các alias HTML tên P1 được script hiện hành tạo lại là UI hiện hành, không phải bản P1 lịch sử lưu ngày 02/11.

Lệnh kiểm tra độc lập:

```bash
npm run test:tank-clash
npm run test:tank-clash-server
npm run lint
node scripts/export-tank-review.mjs
npm run build
npm run test:bundle
npm run test:fast
# Các test browser trong CI cần Chromium và môi trường browser phù hợp:
npm run test:tank-clash-ui
```

Thứ tự kiểm CI toàn repo lấy từ `.github/workflows/ci.yml`. Không nới test để có kết quả xanh. `test:tank-clash-ui` là script đã có cho người nhận bàn giao/CI; việc chạy browser trong từng môi trường phải tuân theo hướng dẫn công cụ của môi trường đó.

### 15.6. Bằng chứng đã kiểm, không đánh đồng với nghiệm thu

- Đợt P0/P1 ngày 02/11: 12 engine + 1 WS spike qua, targeted TypeScript và standalone export qua; đã kiểm sân tập/pause/bố cục dọc–ngang.
- Đợt P2 nhánh `feat/tank-clash-p2-rooms` ngày 02/11: 28/28 qua; WS proxy thật tạo RTT danh nghĩa 80/150/250 ms, jitter ±30 ms mỗi chiều, bỏ 1/2/3% snapshot ứng dụng và lặp command. Có resume thủ công/tự nối lại giữ HP, không lặp phát bắn. JSON tải xuống ngắn khoảng 10,6–10,9 KiB/s/client; correction lớn nhất của A 8/21/44 world px. Đây là bằng chứng **bản P2 cũ**, không phải thông số giao thức hiện hành.
- Đợt P2 mới trên main ngày 03/11 (PR #13): 27 engine/room/netcode, 4 server/spike và 1 test UI được tác giả ghi nhận qua; lint/build/budget/fast qua theo `docs/WORKLOG.md`. Đã ghi ảnh bố cục 1280×760, 390×844, 844×390. Đây là kết quả lịch sử có nguồn trong repo, không tự coi là toàn bộ CI vừa chạy lại ở lượt bàn giao.
- Bộ hiện hành dùng mạng ảo bảo toàn thứ tự kiểu TCP: mất gói thành retransmission delay ≥200 ms và chặn gói sau. Trận đủ hiệp tại RTT 80/150/250, jitter 30, mất 1/2/3% đều thống nhất tỉ số/kết quả; tải xuống 11,5/11,3/10,2 KB/s, tải lên 4,2/4,1/3,9 KB/s; lỗi hiển thị xe đối thủ TB/p95 tương ứng 15/28, 19/40, 32/86 px. Chưa có lag compensation.
- Kiểm lại ngay lượt bàn giao 03/11: **27/27 engine/room/netcode và 4/4 WS server/spike qua**. **`npm run lint`, `npm run build`, `npm run test:bundle`, `npm run test:fast` và export HTML P2 đều qua** sau khi lấy đủ file checkout. Build P2 tự chứa 56.280 byte. Lần đầu lint/build/budget thiếu file vì sparse checkout đã được khắc phục; không sửa/nới test. Các test UI/browser của CI không chạy lại trong lượt bàn giao; code gameplay/client/server/CI được giữ nguyên so với main PR #13, chỉ tài liệu và metadata/tên export thay đổi.
- Không biến phép thử mạng ảo/proxy thành tuyên bố đã chơi Internet. Không biến hai browser trên một host thành hai người/mạng thật. Browser kiểm tra cũ bị giới hạn khoảng 1 FPS; chưa đo 60/30 FPS trên điện thoại.
- Chưa có 10 trận hai thiết bị thật, soak 30 phút, load nhiều phòng, đối soát kết quả ghi DB hoặc quyền subscription sản phẩm. Chưa chạy/đổi schema Supabase trong các đợt này.

### 15.7. Việc còn lại, theo thứ tự tiếp quản

1. **Khép P2 vận hành:** đề xuất nơi chạy tiến trình WS lâu dài, khu vực, TLS/WSS/reverse proxy, dự toán chi phí; chỉ đăng ký tài nguyên phát sinh phí sau khi được duyệt. Không coi Netlify static/function thông thường là nơi giữ vòng mô phỏng/socket lâu dài.
2. **Khép P2 tài khoản** *(03/11, phần client đã xong: launcher lấy `access_token` từ phiên Supabase hiện có; token chỉ gửi tới máy chủ `wss` có trong `VITE_TANK_CLASH_SERVERS` (khớp đúng origin + path) hoặc máy chủ loopback; máy chủ khác từ link mời → vào như khách và UI báo rõ; module `src/games/tank-clash/trust.ts`, test `tests/tank-clash/trust.test.mjs`. Còn lại: kiểm hai tài khoản staging, allowlist tester/entitlement.)*: nối `getToken` từ phiên Supabase thật, kiểm hai tài khoản staging; bổ sung allowlist tester/entitlement phù hợp. Khi cấp token cho client, khóa endpoint vào origin WSS tin cậy (trừ loopback dev); không gửi JWT tới `server` lấy tùy ý từ link mời. Test user không được tự khai role/quyền. Không chạm DB production để làm thử nghiệm.
3. **Khép P2 chơi thử:** hai người/hai máy/hai mạng hoàn tất ít nhất 10 trận; ghi disconnect/tab/screen lock, HP/hiệp/kết quả, ping/correction, ngắm/bắn và yêu cầu lag compensation. Chạy soak/load, restart/half-open, bộ nhớ và dọn timer. Xem lại retry/pending queue/timeout, input qua ranh giới hiệp, và giới hạn truy cập trước khi mở staging cho nhiều người.
4. **Đối chiếu tính năng từ nhánh cũ nếu cần:** bộ cũ có thống kê riêng A/B, opId/ack cho command, epoch cho hiệp, revision tường có ack và allowlist tester. Bộ hiện hành chưa port nguyên các hợp đồng này; không được mô tả là đang có. Muốn giữ các khả năng đó phải thiết kế theo protocol hiện hành, kèm regression tests. UI online hiện hành chưa trình thống kê bắn/trúng cá nhân, không dùng `state.stats` (vốn phục vụ A offline) làm thống kê cho ghế B.
5. **P3:** *(03/11: đặc tả v0.1 ở `docs/tank-clash/P3-SPEC.md`, chờ duyệt; chưa code)* đặc tả rồi làm 2v2 trước: đội/party 2 người, room riêng, một queue 2v2, map Crossfire, spectator, hủy queue, thiếu người/forfeit/rematch. Chưa mở thêm queue 1v1/3v3/4v4 để phân tán người chơi.
6. **P4:** art xe/map/animation/VFX, icon/banner/loading cùng bộ, SFX/BGM; tích hợp catalog/lazy package/launcher/PWA theo rule Arcade-x. Auth quyền gói kiểm tại backend; kết quả/thưởng ghi theo match ID chống trùng, không để client tự cấp thưởng.
7. **P5 rồi P6/P7:** QA và anh duyệt bản cụ thể; sau đó mới thiết kế 3v3/4v4 với mục tiêu/map/camera/respawn riêng. Không chỉ tăng số slot.

Giữ các rule đã chốt: CSS tách prefix; modal mobile trọn màn hình, desktop rộng và outer frame ổn định, phần trong cuộn riêng; thông báo trong trận không chặn gameplay; không force-update khi đang chơi; không ghi vị trí/đạn vào DB từng frame; bot ghi rõ BOT; art tạm ghi rõ; không làm vỡ save cũ; không sửa PvP game khác để ép vừa prototype; không public/đăng ký dịch vụ trả phí khi chưa duyệt. Đọc và cập nhật `docs/WORKLOG.md` cùng mỗi thay đổi.

### 15.8. Nguồn, lịch sử nhánh và quy tắc tiếp nối

- P0/P1 đã lưu bằng commit tính năng `8ced9b64b21f26f1d0dfd9991d685e0a5de13275`, merge main `6fe42ee28010098604569b25d8846214dd47c0b2`.
- P2 ngày 02/11 của phiên làm việc này: [`1efae4587d68b524fd1ea03f3422750c1bcb6bac`](https://github.com/ducpham2806/Arcade-x/commit/1efae4587d68b524fd1ea03f3422750c1bcb6bac), nhánh `feat/tank-clash-p2-rooms`; test log và review ngày 02/11 đã lưu. Có thể dùng `git show COMMIT:path` hoặc tạo nhánh từ commit này để xem lại server/client/test cũ.
- P2 mới hơn đã vào main qua [PR #13](https://github.com/ducpham2806/Arcade-x/pull/13), gồm `07ffed6`, `b0524ab`, `35da8a0`; bản main lúc bắt đầu bàn giao là `5815e3e`.
- **Quyết định hợp nhất:** giữ code vận hành mới hơn của PR #13, merge lịch sử nhánh P2 ngày 02/11, ghi cả phần đã làm và phần không có trong code hiện hành. Không giữ song song hai bộ server hoặc thay protocol hiện hành bằng file từ nhánh cũ. Các thay đổi game khác trên main được giữ nguyên.
- Hai bộ từng cùng dùng chuỗi version `tank-clash.p2.v1` nhưng wire khác (`hello/state` của bản cũ so với `create/join/snapshot` hiện hành). Chúng **không tương thích**; không dùng version string đó làm căn cứ trộn client/server. Mọi thay đổi hợp đồng tiếp theo cần version/migration rõ ràng.
- Bản HTML P2 lưu ngày 02/11 và review tương ứng thuộc bộ cũ. Build lại từ main theo §15.5 để nhận bộ hiện hành. Tài liệu này là điểm tiếp quản; những câu "P2 tiếp theo" trong báo cáo P0/P1 là ghi chép lịch sử, không phải việc chưa code ở hiện tại.
- Để kiểm tra bàn giao không bỏ lịch sử: `git merge-base --is-ancestor 1efae4587d68b524fd1ea03f3422750c1bcb6bac origin/main` phải trả mã 0 sau merge. Tiếp tục trên nhánh mới tách từ main, không tách lại từ nhánh P2 cũ.

| Phiên bản/ngày | Thay đổi | Trạng thái |
|---|---|---|
| v1.3 · 03/11/2026 | Bàn giao đầy đủ P0–P2, hợp nhất lịch sử hai hướng P2, xác định bộ chạy hiện hành và checklist P2–P7 còn lại | Source bàn giao trên main sau kiểm tra; không deploy công khai |
