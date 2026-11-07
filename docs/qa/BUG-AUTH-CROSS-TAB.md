# AUTH-XTAB · 07/11/2026 · hồ sơ cũ sau logout/đổi account xuyên tab

Trạng thái: **đã merge/phát hành, retest logout trên production qua**; ca đăng nhập A sau release còn chờ theo lựa chọn chủ dự án. Phát hiện ở production c705100; sửa phát hành main1131927 qua PR#17. Không ghi email/UUID/token thật; gọi tài khoản đang dùng là A, tài khoản kế tiếp là B.

## Tái hiện thực tế

1. Tab game production có phiên A, tạo phòng1v1 và đang giữ ghế.
2. Mở tab launcher thứ hai cùng browser/origin; Profile → Đăng xuất.
3. Tab điều khiển sau logout hiển thị nút Đăng nhập, xác nhận đã thoát.
4. Tank ở tab game tự về menu, mất ghế ở giao diện. Nhưng chọn Online lại mở EntryScreen “Chào mừng trở lại” với hồ sơ A, không phải form đăng nhập.

Đây là lỗi đồng bộ trạng thái giao diện tài khoản. Adapter Tank có listener SDK riêng nên đã hạ quyền online; chưa thấy bypass xác thực hoặc kết quả/thưởng sai từ ca này. Sau khi có phiên B hợp lệ, nhập mã phòng A cũ nhận “Không tìm thấy phòng với mã này”. Backend ngủ/thức có instance mới trong lượt kiểm; không restart/deploy lại.

## Nguyên nhân và sửa

AuthService.listen so sánh event với arcadex_current_user trong localStorage dùng chung. Tab kia có thể xóa/đổi key trước khi SDK phát event: SIGNED_OUT thấy currentId rỗng hoặc SIGNED_IN thấy ID mới đã trùng nên bỏ qua callback, trong khi React state của tab hiện tại vẫn là A.

- `src/services/auth.ts`: giữ observedId riêng trong closure mỗi listener; INITIAL_SESSION thiết lập ID nhưng không hydrate dư; manual operation và refresh giữ chính sách cũ. Đổi identity bên ngoài tăng authEpoch để restore đang chờ của account trước không kích hoạt lại hồ sơ cũ. Callback vẫn deferred, không gọi SDK khi đang giữ auth lock.
- `tests/auth/cross-tab.mjs`: bundle AuthService thật với SDK/storage fixture để mô phỏng thứ tự cập nhật xuyên tab; không dùng tài khoản thật hoặc gọi cloud.
- `package.json`: test:auth-session chạy trong test:fast để CI giữ regression này.

## Kiểm chứng

- Trước sửa: 4/5 test mới fail (mất logout, bỏ qua accountB, INITIAL_SESSION→logout, restore cũ không hủy); ca chống hydrate dư qua.
- Sau sửa: 5/5 qua; TypeScript qua. Build/bundle và toàn bộ test:fast qua (exit0), gồm tương thích save/SQL/engine/game hiện có.
- Browser local với **AuthProvider + AuthService thật**, SDK/storage/cloud fixtures: UI owner-a → external logout sau xóa storage → guest → external sign-in sau ghi storage → owner-b. Đã quan sát từng trạng thái trên page, không chỉ parse/syntax. Harness tạm không gọi production.
- Hai account production: chủ dự án đăng nhập B ở tab2; đối chiếu hồ sơ DOM xác nhận B khác A và tab game đã chuyển sang B. Mã A cũ XAV9V6 không còn; B tạo phòng1v1 mới FD5PQG thành công. Không lưu định danh. Production vẫn là c705100; ca login B qua không phủ nhận race logout đã tái hiện.
- Quan sát cuối có kết quả máy chủ 0:2 sau2hiệp, mã WFQSS7-1-d10dc1fb. Không đủ thao tác/thiết bị của trận để tính TC-R1. Giữ tab cho chủ dự án, không đăng xuất lại.

## Bước tiếp

Full CI run42311533962 success trước merge PR#17; production1131927 Published/deploy6aee682dc2bd2dba16385690, bundle mới index-rWU2dYT6.js đã byte-match build local.

- Hai tab production mới đều tải bundle mới; hồ sơ B thật xác nhận đúng ở cả hai. B tạo phòng1v1 9FNNVT và đang giữ ghế.
- Logout B ở tab điều khiển: tab game tự về thư viện, mất màn phòng. Vào Tank→Online lại hiện Email/mật khẩu/Đăng nhập, không còn email B hay “Chào mừng trở lại”. Regression logout production PASS.
- Health sau ca200/ok; không dùng health suy ra room đã xóa vì response không trả room count. Muốn xác minh mã9FNNVT không còn cần account hợp lệ khác.
- Chủ dự án chọn **“Để kiểm ca này sau”** khi được đề nghị đăng nhập A sau release. Chưa kiểm A→join mã B cũ trên bản mới; không đánh TC-R0 DONE. Hai account/mã A cũ đã qua trước bản sửa không thay ca còn thiếu này.
