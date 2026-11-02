# Tank Clash — Kế hoạch phát triển v1.1

Ngày lập: 02/11/2026 (Việt Nam) · Dự án: Arcade-x

**Trạng thái cập nhật 02/11/2026:** đã triển khai nền P0 và bản thử P1: năm bài sân tập, đấu bot, luật hiệp, React adapter và spike WebSocket hai client cục bộ. Có GDD và bảng cân bằng v1. Bản P1 dùng hình tạm, còn cần chơi thử trên thiết bị thật; chưa có phòng online/matchmaking cho người dùng. Anh Đức đã yêu cầu merge phần đang làm sau kiểm thử.

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

Các mục trên đã có đầu ra trong đợt P0/P1. Bước tiếp theo là P2: hoàn thiện giao thức phòng 1v1, nối UI vào server và kiểm chứng mạng Internet. Bản chơi hiện tại vẫn là luyện tập cục bộ.

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
