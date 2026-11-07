# Snapshot từ điển bổ sung

Đây là dữ liệu máy đọc do importer sinh, không phải file hướng dẫn session. Nguồn/giấy phép/chính sách/tái tạo: [SOURCES](../../public/games/word-chain/SOURCES.md). Snapshot có checksum được builder kiểm; không sửa tay để thêm từ. Khi cần bổ sung từ phản hồi từ người chơi, đối chiếu nguồn, cập nhật importer/snapshot có chủ đích và regression.

Raw gzip được giữ local trong/tmp để tránh đưa34MB dữ liệu tất cả ngôn ngữ vào Git. JSON trong thư mục chỉ giữ mục tiếng Việt đã lọc và ví dụ nguyên cụm2âm tiết kèm head nguồn. V1/public và opener cũ giữ nguyên; runtime v2 nén cấu trúc, không nới budget400KB.
