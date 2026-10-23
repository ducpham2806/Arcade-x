# Arcade-x sync efficiency — 23 October 2026

Base: main `2dad648486b3cd9a9aa4ddf12251e3f03fa60a0e` (22-game release).

## Findings

- `autoSaveGameSession` previously updated shared React state and uploaded the complete paused session on every game autosave callback.
- The account provider captured/serialized local account state every 5 seconds. Separately versioned saves and their legacy mirrors could also affect account backup uploads.
- The library provider read the same library twice every 30 seconds, even when no favorite mutation existed.
- Presence restarted immediately whenever the entire profile object changed.
- Identical document listeners created separate reads/channels; every listener retained its recovery polling alongside Realtime.
- The retired weekly countdown still updated the shared game context every second during gameplay.
- Battleship requested a room snapshot every 1.5 seconds and performed another snapshot after successful commands, despite the command response already containing authoritative state.

## Implementation

| Work | New behavior |
| --- | --- |
| Paused session autosave | Save locally immediately. Upload only the latest queued state at a fixed 30-second deadline, without updating shared React state for every callback. |
| Explicit save, exit, visibility/pagehide, reconnect | Flush queued session; only one upload runs at a time. Page lifecycle uploads remain best-effort. |
| Failed/interrupted save or clear | Keep a small owner-scoped outbox receipt, restore it after reload, acknowledge only the matching receipt. An older acknowledgement cannot clear a newer pending save. |
| Account checkpoint | 30-second foreground/online cycle; preserve explicit lifecycle saves; exclude separately uploaded save envelopes, their mirrors and recovery backups from duplicate account payloads. |
| Inventory/profile | Skip clean inventory and acknowledged unchanged profile writes. Batch changes for 5 seconds; retry dirty inventory on reconnect/return. |
| Presence | 60-second visible/online heartbeat, immediate activity/identity changes; profile mutations no longer restart it. |
| Library/catalog | One library read every 5 minutes when idle; read again only after queued favorite writes. Catalog uses a 5-minute cache and shares simultaneous requests. Paid access checks still go to the server. |
| Document reads/listeners | Share simultaneous identical reads and exact subscriptions within an account; transaction reads remain fresh and version checked. |
| Realtime/recovery | Coalesce invalidations. Foreground normal recovery 120 seconds; rooms, queues and short-lived friend challenges use 30 seconds while healthy and 5 seconds while degraded. Realtime gameplay changes are dispatched immediately. |
| Failure handling | Exponential read retry delay, bounded at 120 seconds; hidden/offline clients skip recovery reads; clean up channels/timers on last unsubscribe. |
| Battleship | Poll every 3 seconds, skip hidden/offline polls, eliminate the extra read after successful commands. The 7-second freshness guard, authoritative actions, auth and rate controls are unchanged. Opponent updates can now take up to the poll interval plus network time. |
| Shared weekly UI | Countdown runs in launcher only, avoiding per-second context updates during a game. |

## Live read-only baseline

Project: `whjatkhhupeqfngakmee`. No production schema/data, Auth configuration, log settings, cron jobs or Edge Functions were changed.

At the initial audit, the previous 24-hour API log window contained 2,044 `arcadex_read`, 840 `arcadex_commit`, 771 `launcher_library_state`, and 1,748 `bs_room_read` requests. These include testing and multiple clients; they are not per-user rates or billed byte totals. Cumulative query statistics were last reset on 9 October 2026 and were not treated as daily traffic.

Verified `arcadex_read`/`arcadex_commit` exist and `arcadex_documents` is in `supabase_realtime`. Performance advisors reported informational unused indexes; these were retained. Statement logging is `ddl`; connection/disconnection logging is off and per-statement duration logging is disabled. Reducing requests/writes is the applicable first fix; disabling diagnostic logs would not fix the client loops.

## Verification and limits

- `npm run test:sync`: 14 passing behavioral tests, including 600 rapid autosaves → one latest-value upload, in-flight ordering, retry/cancel, durable save/clear recovery, owner isolation, shared subscription cleanup, Realtime delivery/fallback, hidden tabs, transaction reads, catalog caching and fresh premium access checks.
- Existing Battleship suites: 111 passing checks across engine, persistence, online integration, presence, matchmaking, rematch and squad online, using local PostgreSQL fixtures and verified-identity HTTP fixtures.
- Existing social load regression passed.
- `npm run lint`: passed.
- Production code build passed. This audit checkout retrieves the source and imported binary assets; the full public art packs are retained unchanged in GitHub and are not replicated here. The local build is a compilation check, not a complete deployable/game-asset package.
- No physical-phone FPS comparison or live multi-device playtest performed. No billed-egress reduction percentage is claimed.

After deploying the reviewed source from the complete repository, compare foreground idle, solo play, online match, hidden-tab and reconnect sessions. Check request counts, actual network bytes, frame timing, cloud-save recovery and 24-hour Supabase egress against a comparable baseline. Keep access/RLS/rate controls and operational logs enabled.
