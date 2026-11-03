# Việc chủ dự án cần làm

Cập nhật: 03/11/2026. Làm xong việc nào thì đánh dấu `[x]`. Các câu hỏi cần quyết định có chi tiết ở `docs/PENDING-DECISIONS.md`. Tóm tắt những gì đã làm: `docs/SESSION-HANDOFF.md`.

## Ưu tiên cao
- [x] **Đưa lên production:** `claude/busy-edison-1clj3h` đã merge vào `main` (PR #11).
- [ ] **Hiện Nối Từ ở bản production:** áp `supabase/migrations/20261102090000_word_chain_catalog.sql`. Chưa áp thì game chỉ thấy khi chạy dev. (Mục 8 trong PENDING-DECISIONS.)
- [ ] **Bật Nối Từ online** (mục 7), làm theo `docs/WORD-CHAIN-SERVER.md`:
  1. Áp `supabase/word-chain/schema.sql` lên **staging**, rồi chạy lại `npm run test:word-chain`.
  2. Chạy `npm run prepare:word-chain-server`, rồi deploy `supabase/functions/word-chain-room`.
  3. Tạo secret `wc_room_service_key` trong Vault, thay URL trong `supabase/word-chain/scheduler.sql`, rồi chạy file đó.
  4. Đặt `enabled: true` trong `src/games/word-chain/online-config.json`, rồi bảo Claude build và test lại.
  5. Thử với 2–4 tài khoản thật: tạo phòng, nhập mã, ghép trận.

- [ ] **Tank Clash online 1v1:** chọn nơi chạy room server (mục 9 trong PENDING-DECISIONS). Trong lúc chờ, có thể thử trên một máy: `npm ci --prefix server/tank-clash-room && npm run dev:tank-server`, rồi mở bản preview ở hai cửa sổ (`docs/tank-clash/P2-review.md`). Khi đã có server, đặt biến build `VITE_TANK_CLASH_SERVERS="wss://<máy chủ>/tank"` trên Netlify; thiếu biến này thì game không gửi tài khoản tới server (chơi khách).

- [x] **Tank Clash 2v2 (P3):** đã duyệt đặc tả và 4 câu hỏi (03/11).

## Quyết định đang chờ (`docs/PENDING-DECISIONS.md`)
- [ ] **1–3. Commerce:** project staging và tài khoản admin; cổng thanh toán; nơi chạy server (Supabase hay Netlify).
- [ ] **4. Duel server** (Cờ vua, Cờ tướng, Caro): áp schema, deploy `duel-room`, lên lịch `tick` (`docs/DUEL-SERVER.md`).
- [ ] **5. Dung lượng `.git`** (114 MB): viết lại lịch sử hay chuyển sang Git LFS.
- [ ] **6.** Có ghi ngoại lệ "popup xác nhận/kết quả giữ kích thước nhỏ" vào `AGENTS.md` không.

## Cần anh cung cấp
- [ ] Ảnh Block Breaker độ phân giải đầy đủ (hiện chỉ có 512×286).
- [ ] *(Tuỳ chọn)* Ảnh tàu Battleship theo `docs/battleship/GEMINI-SHIP-PROMPTS.md`: thay file là xong, không cần sửa code.
- [ ] *(Tuỳ chọn)* Thêm biểu cảm nhân vật Blossom, và art cho huy hiệu, ô bàn, khung bàn.

## Nên thử bằng tay
- [ ] Tank Clash "2v2 với bot" (bản preview, thẻ 03): sân to có thấy rõ xe trên điện thoại không, bot đồng đội/đối thủ có quá dễ hay quá khó, bố cục ngẫu nhiên có trận nào thấy bất công. Mã sân hiện ở màn kết quả, gửi lại cho Claude nếu gặp bố cục xấu.
- [ ] Nối Từ trên điện thoại thật với Telex/VNI và bàn phím điện thoại: dấu không bị mất khi bấm Enter.
- [ ] Đọc lướt từ điển Nối Từ: báo cho Claude từ thông dụng bị thiếu hoặc từ không phù hợp còn sót (sửa trong `scripts/word-chain/build-lexicon.mjs`).
- [ ] Battleship trên điện thoại cấu hình thấp (độ mượt của bàn phối cảnh).
- [ ] Tank Clash online: khi đã có server, chơi 10 trận trên hai thiết bị thật; báo cảm giác bắn vào xe đang chạy (để quyết định lag compensation).
- [ ] Tank Clash 2v2 online (khi đã có server, hoặc thử local: `npm run dev:tank-server` rồi mở bản preview ở 4 cửa sổ): phòng riêng 2v2, tìm trận (1 tổ + 2 người lẻ), xem trận, đầu hàng. Báo chỗ nào khó hiểu hoặc xe giật khi chạm nhau (`docs/tank-clash/P3-review.md` §5).

## Tuỳ chọn, bảo Claude làm khi cần
- [ ] Sinh lại toàn bộ icon và banner (sửa vệt đen ở banner cũ). Cần cài `sharp` cho `scripts/build-launcher-art.mjs`.
- [ ] Gộp mẫu phòng online đang chép 3 lần (`docs/TECH-DEBT.md`), nên làm trước khi thêm game online thứ tư.
- [ ] Chạy `/ux-review` cho Battleship và Nối Từ.
