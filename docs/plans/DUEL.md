# Chess / Xiangqi / Caro — chuyển sang trọng tài server

Mốc 06/11/2026. Core Duel server/CAS/receipt/presence/luật/test đã có. UI ba game còn luồng online cũ; việc còn lại là tích hợp và triển khai, không chỉ bật function.

**Đầu vào:** [DUEL-SERVER](../DUEL-SERVER.md), phần schema/prepare/client/cutover; [DUEL-UPGRADE](../DUEL-UPGRADE.md) chỉ khi sửa AI; quyết định #4 ở [PENDING-DECISIONS](../PENDING-DECISIONS.md).
**File đích:** `src/games/duel/`, `supabase/functions/duel-room/`, `supabase/duel/`, index của `chess`, `xiangqi`, `caro-gomoku` và service online cũ được import thực tế.

## DU-R0 · READY chuẩn bị / WAITING môi trường rollout

- [ ] Kiểm schema staging; prepare/deploy duel-room và tick 10–15 giây theo runbook; xác minh owner/membership/CAS/receipt/presence.
- [ ] Xây fixture cho từng game và kế hoạch bật/tắt flag. Ghi môi trường/commit/bằng chứng `.md`; không đụng migration production.

## DU-R1 · READY sau DU-R0 · nối UI từng game

Làm lần lượt Chess → Xiangqi → Caro; mỗi game là một task nhỏ, không đổi cả ba rồi mới test.
- [ ] Nối DuelClient sau flag: nước đi/đồng hồ/timeout/surrender/draw/reconnect/result do server quyết định; bảo toàn AI/local và save.
- [ ] Hai client thống nhất; nước sai/client sửa payload/retry lặp bị xử đúng, không nhân lượt/kết quả; timeout theo server.
- [ ] Test UI và smoke game tương ứng; chỉ bỏ service/type cũ khi không còn consumer và cutover đã ổn định.

## DU-R2 · WAITING tài khoản/thiết bị · nghiệm thu rollout

- Hai account thật mỗi game: drop/reload, expiry, hòa/đầu hàng/hết giờ; xác minh đường lui flag cũ.
- Kiểm: `test:duel`, `test:duel-server`, `test:sql`, test UI bổ sung đúng luồng; full CI trước merge code.
- DONE chỉ khi có bằng chứng trên môi trường đích, không chỉ unit test. Queue/rematch/chat/Elo chưa nằm trong phase này; không tự bổ sung.
- Bước đầu: DU-R0 đọc runbook và đối chiếu import UI thực tế trước sửa adapter.
