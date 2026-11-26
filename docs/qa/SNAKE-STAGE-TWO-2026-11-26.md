# Snake Legend · Đường thử Chặng 2 · 26/11/2026

`codex/snake-trial-second-stage` tiếp trên PR #50 tại `09c94e7`. Vào **Hành trình → Đường thử → Chặng 2** hoặc dùng nút Sang chặng 2 sau khi hoàn thành Vòng Gai Cổ Thụ. Ba màn có thể chọn ngay và hoàn thành khi thu đủ quả theo thứ tự. Mốc Dash là mục tiêu riêng của mỗi màn.

| Màn | Bố cục và nhịp chơi | Quả | Thường | Dash / mốc |
|---|---|---:|---:|---:|
| Bờ Hồ Cong | Đường thẳng ở bờ nam, vòng góc đông, rẽ rồi men bờ bắc | 12 | 18,78 giây | 16,02 / 17,5 giây |
| Vườn Tuần Tra | Bãi vào rộng, hành lang giữa hai hàng vật cản di động, vòng đầu đông rồi quay lại | 15 | 19,13 giây | 16,42 / 18 giây |
| Hẻm Đá Ba Cầu | Ba cầu ở ba cao độ. Hai cồn để căn lại hướng, gai giới hạn chỗ cắt, bờ cuối rộng để quay | 18 | 23,18 giây | 19,95 / 21,5 giây |

Khối xám dùng tốc độ 3,5 đơn vị/giây, Dash 6, đầu bán kính 0,42. Hai hàng vật cản của Vườn Tuần Tra chuyển động theo Engine, có hành lang giữa hai vùng quét. Cầu Hẻm Đá rộng 3,2–3,8 đơn vị và hình mặt cầu khớp hai nửa nước sinh từ cùng hình chữ nhật.

Đường đi dùng `trials.ts`. Một lớp dữ liệu cung cấp điểm quả, địa hình, hướng dẫn, mục tiêu và mặt cầu cho game, bản đồ xem trước và ca Engine. Chọn theo nhóm ba màn ngang, giữ chiều cao thanh để đất chơi vẫn đủ trên màn ngang thấp. Save phiên bản 1 giữ ba ô cũ, đọc thêm ba ô mới và hợp nhất thời gian tốt nhất theo hồ sơ. Engine, bản đồ chiến dịch và checkpoint R01 giữ nguyên.

Studio Level Design, QA & Playtest, vai trò Team Level và QA Lead. Graphify AST Snake 491 nút/1.277 cạnh. Truy vấn `TRIAL_STAGE_SIZE` xác minh dữ liệu chia nhóm đi vào màn chơi.

## Kiểm chứng

- `test:snake-journey` qua sáu lượt thường và sáu lượt Dash, đủ tim và không chạm tường/thân. Kiểm ba cầu mới, rơi hồ/lệch cầu, va vật cản mất tim, save ba kỷ lục cũ và một ghi đồng thời từ dữ liệu ít ô. Chiến dịch R01 vẫn qua 10/10 màn mô phỏng.

- Chromium qua 3 ca mục tiêu: chạy thắng cả 6 đường bằng joystick, chuyển chặng qua nút tiếp ở màn 3, tải lại kỷ lục, giữ bản save 3 màn cũ và byte checkpoint R01, kiểm map Chặng 2 ở 320×568. Đã xem ảnh thực thi và lưu `test-results/snake-stage-two-visuals/gorge-phone.png` cùng bản sao bỏ qua trong thư mục bằng chứng Studio.
- TypeScript, nhóm hiển thị Snake, build và bundle qua. HTML sinh 2.300.615 byte. Chromium tải đúng bản qua loopback, tắt mạng, vào Chặng 2, xem và chơi Hẻm Đá Ba Cầu, tạm dừng rồi quay về Hành trình. Không có yêu cầu bên ngoài hay lỗi trang.

Thiết bị thật, chơi thử bởi người mới và production còn chờ nghiệm thu.
