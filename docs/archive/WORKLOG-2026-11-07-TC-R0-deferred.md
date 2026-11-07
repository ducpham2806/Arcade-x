# Nhật ký TC-R0 khi chuyển sang plan Nối Từ/Snake

## 07/11/2026 · TC-R0 WAITING ca A sau release

- Auth xuyên tab: 4/5 fail trước sửa,5/5 qua sau sửa; AuthProvider fixture A→guest→B qua; sửa đã phát hành1131927. [Chi tiết](qa/BUG-AUTH-CROSS-TAB.md).
- Hai account thật trước release: B khác A, tab nhận B, mã A cũ không còn, phòng B tạo được. Sau release: cả2tab bundle mới/B thật, tạo phòng9FNNVT→logout tab kia→tab game về thư viện→Online mở login, không còn B/Welcome cũ. Health200/ok.
- Chủ dự án chọn “Để kiểm ca này sau” với đăng nhập lại A/kiểm mã B cũ sau release; giữ WAITING, không đánh TC-R0 DONE. Không lưu định danh/password/JWT; các tab mới còn guest. TC-R1 nhiều thiết bị/mạng/soak chưa đạt.
