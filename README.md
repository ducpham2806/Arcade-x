# ArcadeX · 2.12.2

PWA launcher 23 mini-game, React 19 + Vite + TypeScript + Supabase; hỗ trợ offline và đồng bộ tài khoản. Tank Clash còn là bản thử riêng, chưa nằm trong 23 game.

## Bắt đầu

Node **24** (`.nvmrc`):

```bash
npm ci
npm run dev        # http://localhost:3000
npm run lint       # tsc --noEmit
npm run build      # dist/
```

Backend riêng: sao chép `.env.example` → `.env.local`, điền URL/publishable key. Không đưa database password/service-role key vào frontend. Không chạy lại migrations lên project đang dùng; quy tắc tại [AGENTS.md](AGENTS.md).

## Đọc theo mục đích

| Cần biết | Đọc |
|---|---|
| Bắt đầu phiên | [AGENTS](AGENTS.md) → [bàn giao](docs/SESSION-HANDOFF.md) + mục mới nhất [WORKLOG](docs/WORKLOG.md) |
| Việc cần làm | [Kế hoạch chi tiết](docs/PROJECT-PLAN.md); [quyết định chờ](docs/PENDING-DECISIONS.md) |
| Đúng tài liệu của module | [INDEX](docs/INDEX.md), không nạp toàn bộ `docs/`/`.claude/` |
| Test/preview và giới hạn đã biết | [TESTING](docs/TESTING.md); `package.json`, `.github/workflows/ci.yml` là nguồn lệnh |
| Claude Code | [CLAUDE.md](CLAUDE.md); nguồn/giấy phép [CCGS-NOTICE](.claude/CCGS-NOTICE.md) |

## Mã nguồn

- Launcher: `src/App.tsx`, `src/launcher/`; context chia slice ở `src/context/`.
- Lưu local/cloud: `src/services/storage/`, `src/services/supabase/`.
- Game: `src/games/<id>/`; registry, lazy packages và asset manifest trong `src/games/`; asset ở `public/`, art nguồn ở `art/`.
- Backend: `supabase/`; commerce: `src/commerce/`, `server/commerce/`, `shared/`; room WS Tank: `server/tank-clash-room/`.
- Standalone: `standalone/chronicles-realms/`, `public/standalone/`; preview/review: `preview/`, `review/`; công cụ/test: `scripts/`, `tests/`.

Netlify tự build/deploy từ `main`; cấu hình ở `netlify.toml`, Vercel ở `vercel.json`. Chi tiết triển khai đọc runbook đúng module qua INDEX. Release cũ: [2.12.0](docs/RELEASE-2.12.0.md), manifest và cleanup giữ trong `docs/`.
