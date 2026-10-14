# Duel upgrade — 2026-10-15

## Implemented
- Caro: terminal win detection, immediate win before defense at every difficulty,
  hard 3-ply search with bounded candidates. Explicit Gomoku >=5 rules.
- Xiangqi: iterative alpha-beta 1/2/3-ply with material/position evaluation,
  terminal loss detection, bounded compute budget, rook-for-pawn trap avoided.
- Chess: iterative time-bounded 2/4-ply search, immediate mate priority. Own
  engine, not Stockfish; displayed bot labels are no longer grandmaster claims.
- All three bots execute in self-contained Blob workers. Cancellation prevents
  replies after navigation/restart; failures show a restart action.
- Shared queue Elo proximity filter (150 initially, progressively up to 600),
  nearest-first ordering, stale-entry filtering and active queue heartbeat.
- Shared modal cleans subscriptions on all close paths and invalidates stale
  callbacks. One Xiangqi matchmaking modal. Legacy RED/BLACK side encoding kept.
- Connection banners, persisted recent room resume, explicit synchronization
  errors, full-size keyboard-trapped learning dialog.
- Daily exercises, idempotent lesson progress, streaks and earned badges.
- Board snapshots, post-match worker suggestions, legal sandbox replay of a
  selected position. Live-game assistance is locked; training changes no Elo.
- Local Caro first-to-two series, starting sides alternate on replay.
- Optional Vietnamese Xiangqi piece names and invalid-move explanations.
- Personal monthly online-match statistics, seasonal badges, named friend groups
  linked to private-room invitation flow.

## Boundaries
The season tab is personal statistics, not a global season leaderboard. Groups
are a personal organizer, not a shared tournament service. The starter exercise
catalog contains four puzzles (one Caro, two chess, one Xiangqi); daily selection
reuses that initial catalog. Analysis is a suggested legal continuation, not a
Stockfish accuracy score or full blunder classification. Reconnect uses the
existing room subscription and polling; it does not pause online clocks or grant
an automatic disconnect victory. No production schema migration or deployment.

## Verification
npm run test:duel covers tactical regressions, mate, time budget, Elo filtering,
worker execution and real React DOM hub interaction using Linkedom. TypeScript
and production build required. Browser/touch QA and two-device online play were
not available in this environment; no claim of having verified them.
