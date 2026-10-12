# ArcadeX — Đợt A: backend Supabase
Ngày: 12/10/2026. Project: `whjatkhhupeqfngakmee` (Arcade-x), Singapore, PostgreSQL 17.
Source đối chiếu: `ba3919c648fcf3e3122c7ce7a444901ca5892462`.

## Kết quả triển khai
Đã triển khai trực tiếp lên đúng project bằng kết nối Supabase Arcade-x. Không dùng mật khẩu database trong source hoặc cấu hình frontend.

Trước nâng cấp: chỉ có `arcadex_player_bindings`, `arcadex_documents` và RPC nền; không có identity/catalog/backend game; không có Edge Function. Lịch sử migration rỗng vì phần nền được cài trước bằng SQL. Số tài khoản Auth, binding và document đều bằng 0 tại thời điểm kiểm tra.

Sau nâng cấp: 18 bảng ứng dụng đều bật RLS, catalog 18 game published/free, Car Escape 100 màn campaign v2, Word Cross pack 1 có 7.321 từ common và 110.276 từ extended (117.597 tổng), Cosmic pack v2, Shikaku pack v3. Commerce/donation giữ tắt.

## Migration đã áp trên máy chủ
| Version | Tên | Nội dung |
|---|---|---|
| 20261012065411 | arcadex_phase_a_missing_backend_schema | Các migration identity, launcher/catalog, schema/RPC Car, Word, Cosmic và Shikaku; thu hồi quyền gọi helper/trigger nội bộ |
| 20261012065430 | arcadex_phase_a_car_escape_campaign | 100 màn và metadata 2D |
| 20261012065733 | arcadex_phase_a_word_cross_lexicon | Từ điển đầy đủ đúng source |
| 20261012065925 | arcadex_phase_a_function_hardening | Cố định search_path 5 helper; chặn gọi event trigger qua API |
| 20261012070221 | arcadex_phase_a_owner_policies_and_indexes | Policy theo owner/tài khoản email, Auth initplan, 8 chỉ mục FK |

Giữ nguyên bảng/RPC nền đã cài, không chạy FRESH-INSTALL trên project hiện có. Không tạo bảng mật khẩu riêng.

Lịch sử máy chủ ghi nhận các đợt triển khai gộp nêu trên; không trùng version với 11 file nguồn ban đầu. Không chạy `supabase db push` hoặc bộ FRESH vào project này mà chưa đối chiếu/repair lịch sử với schema thực tế. Các file nguồn là nguồn của SQL đã triển khai, không phải danh sách còn thiếu cần chạy lại.

## Edge Function
`cosmic-verify` version 1, ACTIVE, `verify_jwt=true`.
Bundle nguồn: `deploy/cosmic-verify/index.ts`; SHA-256 do Supabase trả: `eb7e511b62206407587256e4de6762c11ea57b14bee3684f25a89689d0160a5e`.
Gateway JWT bật; handler vẫn gọi `auth.getUser`, kiểm tài khoản email, chủ vé và replay. Khóa service chỉ được lấy từ biến server có sẵn.

## Kiểm thử thực tế
| Ca | Kết quả |
|---|---|
| API công khai launcher_catalog | HTTP 200, đủ 18 game |
| API công khai Car/Word/Cosmic/Shikaku ranking | Cả 4 HTTP 200, mảng rỗng vì chưa có kết quả chơi |
| POST cosmic-verify không token | HTTP 401, Sign in required; không còn NOT_FOUND |
| Identity save/read và canonical name trigger | PASS |
| Save/read qua arcadex_commit/read | PASS |
| Update đúng revision / ghi stale revision | PASS / bị chặn 40001 |
| Tài khoản B đọc/ghi save A | Bị chặn; hồ sơ công khai không lộ accountState |
| RLS SELECT trực tiếp save A từ B | Không thấy bản ghi |
| Favorite, library, start/finish launcher session | PASS |
| Car Escape level 1, replay 5 bước, submit lặp | PASS, 3 sao; lần lặp giữ kết quả |
| Word Cross sinh puzzle, submit lời giải, submit lặp | PASS |
| Shikaku daily 4x4, hint event lặp, submit/lặp | PASS, hint tính đúng một lần |
| Cosmic tạo ticket/config v2 | PASS |
| Browser quyền cosmic_accept/payment/internal helpers | Không có quyền |
| Anonymous JWT claims tạo Cosmic ranked ticket | Bị chặn |

Các ca có owner dùng role `authenticated` và JWT claims mô phỏng trong giao dịch PostgreSQL thật. Đây là kiểm thử contract database, không phải chứng minh đăng nhập email/JWT từ trình duyệt hoặc hai thiết bị đã hoàn chỉnh.

Fixture Auth/application được tạo trong transaction rồi ROLLBACK; kiểm lại Auth, binding, document, identity, run, library/session đều 0. Sequence có thể tăng do kiểm thử, đó là hành vi PostgreSQL bình thường. Script tái hiện: `tests/supabase-phase-a.sql`.

## Advisors và quyền
Đã sửa cảnh báo search_path mutable, quyền RPC event trigger, 7 policy Auth initplan, 8 FK thiếu index. Performance advisor sau sửa chỉ còn thông tin unused_index của hệ thống mới chưa có tải; không xóa các index này.

Security advisor còn cảnh báo theo kiến trúc:
- Catalog/ranking là RPC SECURITY DEFINER công khai có chủ đích, trả dữ liệu công khai được giới hạn.
- RPC owner chạy SECURITY DEFINER để ghi qua API kiểm quyền, direct browser writes bị thu hồi.
- 10 bảng bật RLS không policy: truy cập browser trực tiếp bị chặn, đi qua RPC được kiểm soát.
- Chính sách khách anonymous của arcadex_documents là chức năng khách có chủ đích, có kiểm owner/phòng.
Không gọi hệ thống là không còn mọi cảnh báo.
Tham khảo: https://supabase.com/docs/guides/database/database-linter

## Cách cài mới và các phần tiếp theo
Cài mới: chạy 11 migration nguồn theo thứ tự hoặc FRESH bundle một lần, sau đó `supabase/phase-a-hardening.sql`, deploy cosmic-verify với JWT gateway bật. Không cần chạy lại SQL này trên Arcade-x hiện tại.

Đợt A đã khớp schema/API với frontend hiện có. Các hạng mục sau chưa thuộc kết quả nghiệm thu này:
- B: đăng ký/xác nhận email, đăng nhập/refresh/reset password, URL redirect/SMTP và JWT thực tế.
- C: Dungeon Titan save/account separation, snapshot CAS trong frontend, nhiều tab/hai thiết bị/offline.
- Cosmic: ván chơi hợp lệ với JWT email đi trọn client → function → replay → accept.
- PvP hai thiết bị, mobile/PWA và gameplay tiếp tục theo kế hoạch.

Rollback không tự động DROP bảng sau khi bắt đầu có người chơi. Với lỗi function/policy, áp forward fix hoặc khôi phục định nghĩa đã lưu/đối chiếu; giữ Auth và save. Chưa đổi bản deploy frontend hoặc gameplay trong đợt này.
