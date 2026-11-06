# Chỉ mục đọc theo nhiệm vụ

## Đầu phiên — đọc tối thiểu

AGENTS (nếu chưa tự nạp) → [SESSION-HANDOFF](SESSION-HANDOFF.md) → một thẻ `plans/*.md` trong [PROJECT-PLAN](PROJECT-PLAN.md). Không cần đọc cả file chỉ mục này hoặc toàn bộ WORKLOG mỗi phiên.

- Cách đóng/tóm tắt trước đổi task: [WORKFLOW](WORKFLOW.md).
- Thành quả đã thu gọn: [COMPLETED](COMPLETED.md); nhật ký chính: [WORKLOG](WORKLOG.md).
- Công nghệ/cấu hình làm việc: [project.md](../project.md).
- Thư viện 116 skill/21 vai trò: [studio/INDEX](studio/INDEX.md), chỉ nạp phần phù hợp.

## Tra sâu khi thẻ việc yêu cầu

| Nhiệm vụ | Tài liệu đầu vào tiếp theo |
|---|---|
| Lập kế hoạch tổng thể | [PROJECT-PLAN](PROJECT-PLAN.md); IDs/quyết định ở [PENDING-DECISIONS](PENDING-DECISIONS.md), việc chủ dự án ở [OWNER-TODO](OWNER-TODO.md) |
| Tank P3d | [P3-SPEC](tank-clash/P3-SPEC.md) §7–§9; [PLAN](tank-clash/PLAN.md) §10–§12 khi cần hosting/kiến trúc; [README](tank-clash/README.md) để chạy |
| Tank network/thiết kế | `tank-clash/P3-review.md` (mốc cục bộ mới nhất), `tank-clash/P2-review.md` (lịch sử), `GDD-v1.md`; ý tưởng sau MVP: `PVP-BACKLOG.md` |
| Tank tích hợp/phát hành sảnh | [LAUNCHER-RELEASE](tank-clash/LAUNCHER-RELEASE.md) → registry/catalog/adapter; runbook TC2 khi vận hành |
| Tank TC2 hosting/Auth/vận hành | [TC2-review](tank-clash/TC2-review.md) (bằng chứng/việc còn lại) → [TC2-RUNBOOK](tank-clash/TC2-RUNBOOK.md) (cấu hình/triển khai/rollback); không đọc lại toàn bộ P3 spec |
| Nối Từ | [WORD-CHAIN-SERVER](WORD-CHAIN-SERVER.md), `src/games/word-chain/online-config.json`; nguồn từ điển `public/games/word-chain/SOURCES.md` |
| Chess/Xiangqi/Caro online | [DUEL-SERVER](DUEL-SERVER.md); `DUEL-UPGRADE.md` khi sửa AI |
| Commerce/quyền chơi | [COMMERCE-ROLLOUT](COMMERCE-ROLLOUT.md) → `server/commerce/README.md`; trước nhận tiền phải đọc [SECURITY-RECOVERY](operations/SECURITY-RECOVERY.md); schema/access gốc: `SUBSCRIPTION-FOUNDATION.md` |
| Battleship | `battleship/P2-P3-CHECKPOINT.md` → đúng runbook `CLOUD-ACTIVATION`, `MAINTENANCE`, `MATCHMAKING`, `ONLINE-SQUAD`, `REMATCH-AUDIO`, `ONLINE-CONTRACT`; QA: `QA.md`, `QA-ADMIN-GUIDE.vi.md` |
| Snake | `SNAKE_PREVIEW.md`; theo phần đang sửa: `SNAKE_CLOUD_PROGRESS`, `SNAKE_LIVE_SAVE_QA`, `SNAKE_JOURNEY_UI`, `SNAKE_BOSS_FEEDBACK`, `SNAKE_PROPS_A2`, `SNAKE_AUDIO_R02` |
| Blossom / Neon | `BLOSSOM-BLAST-REVIEW.md` / `NEON-RUN-REVIEW.md`; Blossom merge cũ: `BLOSSOM-MERGE-AUDIT.md` |
| Block Breaker | `BLOCK-BREAKER-HYBRID-V5.md`; thêm đúng phần `BOSS-ART-V6`, `BOSS-CROP-FIX`, `CHOICES-V4`, `LEVEL-DESIGN-V3`; `SCIFI` là thiết kế gốc |
| Eat / Boom / Cosmic | Đúng file theo thay đổi: `EAT-RHYTHM-V6`, `EAT-VICTORY-V5`, `EAT-ECONOMY-V4`, `EAT-ART-V3`, `EAT-EM-ALL-*`; `BOOM-PIP-V4`, `BOOM-ART-V3`, `BOOM-LEVEL-DESIGN`, `BOOM-BUDDIES-INTEGRATION`; `COSMIC-LEVELS-V4`, `COSMIC-COMBAT-REVIEW`, `COSMIC-V3-HANDOFF` |
| Dungeon Titan | `dungeon-titan/INTEGRATION.md` → đúng phần `DESIGN-v3`, `ART-v5`, `UX-v4`/`UX-v6*`; phiên bản khác nhau bổ sung nhau, không mặc định bỏ bản cũ |
| Rainbow / Chronicles | `RAINBOW-BLOCKS.md` trước; chỉ mở phần liên quan trong `Rainbow-Blocks-GDD.md`; Chronicles: `standalone/chronicles-realms/README.md`, `docs/DEV_BRIEF.md`, `docs/ART-BIBLE.md` bên trong standalone |
| Art/pipeline | `GAME-ARTWORK.md`, `launcher-icon-pipeline.md`, `LAUNCHER-ART-BUDGETS.md`; art Gemini: `art/gemini/README.md`; giữ SOURCES/LICENSES/CCGS-NOTICE |
| Auth/sync/social/UX/perf | Đúng chủ đề: `AUTH-PORTABLE-FIX`, `ONLINE-SYNC-FIX`, `SOCIAL-COMMUNITY`, `READABILITY-AUDIT`, `PC-MOBILE-PARITY-AUDIT`, `ux-entry-audit-2026-10-15`; `performance/SYNC-EFFICIENCY-2026-10-23.md` |
| Test/preview | [TESTING](TESTING.md); lệnh/script chính xác ở `package.json`, thứ tự `.github/workflows/ci.yml` |
| Nợ kỹ thuật/lịch sử | [TECH-DEBT](TECH-DEBT.md); archive/release/JSON kết quả chỉ đọc khi truy vết |

## Nguồn dữ liệu và cách giữ tài liệu gọn

- **Luật:** AGENTS. **Trạng thái:** SESSION-HANDOFF. **Công việc/điều kiện xong:** PROJECT-PLAN và spec module. **Quyết định:** PENDING-DECISIONS. **Bằng chứng đã làm:** WORKLOG. Mỗi thông tin có một nơi chính; tài liệu khác dẫn link.
- WORKLOG giữ tối đa 3 mục, chuyển nguyên văn mục cũ vào archive; không tóm tắt rồi xóa bằng chứng.
- Spec dài: giữ yêu cầu/tiêu chí hiện hành ở bản đọc; chuyển lịch sử/kết quả chi tiết vào archive, dẫn rõ bản/ngày. Giữ ID mục đã được tham chiếu.
- Runbook bảo mật, triển khai, khôi phục; test fixtures/manifest/hash; nguồn/giấy phép **giữ đầy đủ**, chỉ nạp khi đúng nhiệm vụ. Báo cáo cũ không chứng minh trạng thái hiện tại.
- `.claude/agents`/`skills` chỉ nạp theo vai trò; agent không phải nguồn số game/trạng thái phát hành. Không đọc hàng loạt để bắt đầu phiên.
- Kiểm kê và số đo đợt này: [DOCUMENTATION-AUDIT](DOCUMENTATION-AUDIT.md). Đo byte/chữ không đồng nghĩa token chính xác; không cần đọc file này mỗi phiên.
