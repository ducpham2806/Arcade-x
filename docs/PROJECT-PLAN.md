# Kế hoạch tiếp tục ArcadeX · 11/11/2026

Nguồn main **9061bfd**: PR #21 đã merge và Netlify production ready đúng SHA; CI #36 xanh trên head PR. [Merge audit](qa/MERGE-AUDIT-2026-11-11.md) xác nhận 28/31 head là tổ tiên main, còn một docs tương đương, một P3 song song và nhánh Tank P2 cần port chọn lọc. Không merge nguyên P2 vào P3.

## Phạm vi mới

Chủ dự án yêu cầu plan chi tiết, thêm vị trí quảng cáo Google và **hoãn commerce** (11/11). Chưa có AdSense/site Ready. [Plan thực hiện đầy đủ](CONTINUATION-2026-11-11.md) có task, file đích, AC, test, ước lượng và thứ tự. Quảng cáo thật chưa tích hợp; chuẩn bị nội dung và mock trước.

| Đợt | Nhóm | Bước tiếp theo | Thẻ / chi tiết |
|---|---|---|---|
| 0 | Nguồn và QA | BASE-01 bàn giao; QA-ENV cho HTTP fixture/offline runner; ONLINE-V1 xác minh sau PR #21 | [Plan chi tiết](CONTINUATION-2026-11-11.md), [bảo trì](plans/MAINTENANCE.md) |
| 1 | Quảng cáo Google | AD-01 nội dung/domain/account; AD-02 slot policy/mock trong lúc chờ Google | [ADS](plans/ADS.md), [vị trí](ads/PLACEMENTS.md) |
| 2 | Snake Legend | R0a baseline → R0b UI/save/Auth → R1 thiết bị/nội dung → R2 candidate/release | [Snake](plans/SNAKE.md) |
| 3 | Nối Từ/Tank | WC-ON5/ON6, TC-R1 mạng/soak; TC-R2 port P2 còn thiếu | [Nối Từ](plans/WORD-CHAIN.md), [Tank](plans/TANK-CLASH.md) |
| 4 | Chess/Xiangqi/Caro | DU-R0 staging → DU-R1 từng game → DU-R2 account thật | [Duel](plans/DUEL.md) |
| 5 | Game và nền tảng | GP-R0 xác minh → GP-R1 sửa từng lỗi; MT1/MT2; MT3/MT4 theo lợi ích | [Game polish](plans/GAME-POLISH.md), [bảo trì](plans/MAINTENANCE.md) |
| Theo Google/owner | Ads thật | AD-03 pilot một slot → AD-04 đo; H5 AD-05 riêng | [Google Ads plan](ads/GOOGLE-ADS-PLAN.md) |
| Hoãn | Commerce | CM1–CM4 để sau; không bật checkout/payment/thuê game | [Commerce](plans/COMMERCE.md) |

Lỗi đang chặn chơi hoặc mất dữ liệu ưu tiên xử lý ngay, không đợi hết một đợt. Có thể tiếp task local độc lập khi chờ thiết bị/Google, không tự bỏ nghiệm thu thật. Ca Tank account A/mã B cũ user để sau vẫn deferred; gate Nối Từ người thật 3–4 người đã được bỏ, không hỏi lại.

## Những phần không làm lại

- Tank P3b/P3c/P3d, adapter sảnh, motion và polish Battleship/Dungeon đã merge PR16; game thứ24 đã có trong launcher.
- Nối Từ public phòng/PK/queue, từ điển34.512 từ và bot/offline đã phát hành. Online flag=true, không còn chờ “bật máy chủ”.
- PR #21 đã phát hành: handshake watchdog/stale socket Tank; mutation ID/gateway code/notice membership Nối Từ. ONLINE-V1 là kiểm sau sửa, không viết lại patch.
- Snake journey/cloud/session/boss/props/audio có nguồn; chưa catalog public. Các báo cáo “chưa merge” cũ không dùng làm hiện trạng.

## Gate đóng task

Task có file/AC rõ; logic/integration đúng phạm vi, UI được chạy và quan sát, bằng chứng gắn SHA/môi trường/ngày và giới hạn. Full CI trước merge code; chỉ merge/publish khi owner yêu cầu. Không lấy mock/loopback thay account/mạng/thiết bị thật. Quảng cáo cần Google/site approval riêng, không coi plan hoặc slot placeholder là đã kiếm tiền.

[WORKFLOW](WORKFLOW.md), [COMPLETED](COMPLETED.md), [WORKLOG](WORKLOG.md), [quyết định](PENDING-DECISIONS.md). Plan cũ giữ trong archive trước checkpoint11/11.
