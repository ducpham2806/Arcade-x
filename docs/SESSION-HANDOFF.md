# Bàn giao · 08/11/2026 · WC-PUBLIC ACTIVE

**User mới nhất:** yêu cầu merge và phát hành online công khai, bỏ gate nghiệm thu3–4người. Không hỏi lại quyền merge/public hoặc bắt chạy ca thật3/4. Giữ CI/fixture; các ca chưa kiểm vẫn ghi chưa kiểm.

PR19 đã merge main256620c sau full CI29/headfde7810success; Netlify tự build, chưa xác nhận Published. Bộ từ34.512/client đã merge, main online=false. Nhánh mới `codex/word-chain-public-release` bật flagtrue, thêm UIassert3entryhiện/guestphảilogin rồi bot chơi; local Node24 lint/50check/launcher/build/bundle qua. CI31 đã fail kiểm offline cũ; xem bước dưới. `deliverables/` cũ không commit.

## Bước cần làm ngay

PR20/nhánhrelease, codehead ea4fc66 CI31FAILED assertion offline cũ trước-release; đã sửa source menu3nút disabled khi offline/re-enable khi online, guardplatform và testoffline7check/2ảnh. Cần commit/push→fullCI head mới trước mergeflagtrue. Backend production **đã sẵn sàng**, không hỏi permission lại: user08/11 đã duyệt exception hẹp schema/cron/Vault/function/CORS/JWT OFF ởwhjatkhhupeqfngakmee; không mở quyền script production khác.

Productionschema transactionSuccess, Edgeartifactaeafa…/487.451byte deploy, JWTlegacyOFFsave/reload, CORS chỉarcade-x.netlify.app. Cronjob3/10s/active/hash_readytrue; smokeVaulttickrequest25HTTP200/updated0/no timeout. ProbeCORS204, originlạ403, thiếu/saiAuth401, tickgiả/browser403, publicRPC401/42501. Dictionarypublic200/34.512 byte-match; chưa xác nhậnflagtruePublished. [Gói + bằng chứng](word-chain/PUBLIC-RELEASE-2026-11-08.md). CIxanh→mergePR20→NetlifyPublished đúngSHA→kiểm UIpublic/guest và phiên registered nếu có; ghi giới hạn, không bắtkiểm3/4.

Stagingkhqipuipeawzlkqmdzdg đã có schema/Edge/CORSlocalhost4335, handlerAuth/cron10s/token riêng Vault; user đã duyệt staging, không hỏi lại. [QA08](qa/WC-STAGING-2026-11-08.md):2account thật phòng riêng/PK/host transfer/closedcode, queue/hủy/20s/timeout/rematch qua. Đóng hai tab→cron đóng phòng hết rematch/HTTP200. Chưa chứng minh no-client turn timeout;3/4người chưa kiểm và đã được user bỏ gate. Các tab đóng, RAMAuth không còn.

Online pilot không thưởng XP/xu; receipt bền vững cần trước mở thưởng.2thiết bị/2mạng/soak/reconnect/IME/expiredAuth chưa kiểm, ghi giới hạn khi public. Từ cũ/3.011opener vàsave giữ nguyên; V2<400KB/URLhash/34.512mục.

## Giữ bối cảnh

- Sau Nối Từ tiếp [Snake](plans/SNAKE.md): bundle1,92MB raw/~1,35MB gzip/UI/save/Auth thật/thiết bị còn thiếu;7suite local trước qua, chưa public.
- TC-R0 ca A/mã B cũ user để sau; không hỏi lại. Renderc705100/Free/cap16/Blueprintpaused, không sync/deploy vô cớ. Commerce tắt.
- Studio c5dac462 đủ297blob/116skill/21role; không cài/nạp lại toàn bộ. WORKLOG≤3, COMPLETED tóm tắt/archive nguyên văn; doc checker trước commit. Chrome kiểm profilexuan duc, tab production mở riêng; tránh cửa sổ công việc khác.
