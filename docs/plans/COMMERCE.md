# Commerce — luồng riêng, chưa nhận tiền

Mốc 06/11/2026. Có core checkout/order/review/reconciliation và test; chưa có deployed HTTP endpoint/DB/provider adapter hoàn chỉnh. Checkout vẫn tắt. Không nằm trên đường bắt buộc để thử Tank miễn phí.

**Đầu vào:** [COMMERCE-ROLLOUT](../COMMERCE-ROLLOUT.md), [server README](../../server/commerce/README.md); trước live payment bắt buộc [SECURITY-RECOVERY](../operations/SECURITY-RECOVERY.md). Quyết định còn thiếu #1/#2/#3 tại [PENDING-DECISIONS](../PENDING-DECISIONS.md).
**File đích:** `server/commerce/`, schema subscriptions, client access/checkout thực tế và tests/subscriptions; đối chiếu import trước sửa.

| Task | Trạng thái / phụ thuộc | Việc và điều kiện xong |
|---|---|---|
| CM1 | READY chuẩn bị; WAITING chọn admin/operator | Pilot access v2 trên staging: free/paid/block/expiry/starter-gift bằng 1–2 account; SQL + verify-access-rollout qua, flag off phục hồi hành vi cũ |
| CM2 | WAITING runtime và CM1 | DB repository bền vững ACID/unique/receipt/audit; session/permission thật, MFA aal2, revoke có hiệu lực; concurrent/retry/cross-account không nhân đơn hoặc vượt quyền |
| CM3 | WAITING provider/merchant và CM2 | Webhook raw-body signature, sandbox success/fail/duplicate/out-of-order/refund/reconcile; không dùng RAM ledger/test verifier cho live handler |
| CM4 | WAITING CM2/CM3 | Backup DB/object/config, restore staging cô lập, đo RPO/RTO thật, đối soát sau restore, cảnh báo và runbook operator; pilot từng flag sau bằng chứng |

RPO 24h/RTO 4h là mục tiêu đề xuất, chưa phải số đo. Không mở checkout trước CM4 và quyền phát hành cụ thể. Kiểm `test:sql`, `test:commerce`, `test:subscriptions` cộng tích hợp DB/provider thật; mock unit không chứng minh concurrency hoặc giao dịch thật. Báo cáo `.md` không chứa secret/payment data nhạy cảm. Bước đầu: chuẩn bị CM1 và danh sách quyết định, không tự triển khai production.
