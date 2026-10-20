# Battleship: tutorial and authoritative-room foundation

## Delivered

The review build has a seven-step, untimed interactive lesson. Players place and rotate a carrier, attempt an invalid overlap, complete preparation, miss, hit and sink a destroyer. The lesson explains its fixed coordinates and skips opponent replies; normal bot matches retain normal rules, hidden boards and 30-second turns. Completion can enter a real bot match or repeat the lesson.

The staged online core supports 1vs1 room creation and room codes, verified identity-to-seat binding, filtered snapshots, placement, readiness, firing, surrender, versioned atomic updates, action replay receipts and timeout advancement. The browser cannot select its actor or receive unrevealed enemy hulls. Persistence prevents a user occupying multiple active rooms. A service-only SQL interface stores full room state behind RLS with browser execution revoked. An Edge handler verifies bearer tokens with Auth before forwarding commands.

Run `npm run prepare:battleship-server` after changing the canonical engine or server source. Generated Edge copies must match those sources. SQL is staged in `supabase/battleship/schema.sql`; it has not been applied as a live migration.

## Evidence and limits

59 automated checks pass: 24 engine, 17 tutorial/server simulations, 10 actual PostgreSQL schema/privilege checks using PGlite, and 8 mocked Edge HTTP/Auth tests. Full source TypeScript passes. Mobile browser QA completed the lesson and entered normal bot preparation without horizontal overflow at 390px. These results do not establish live online reliability. PGlite tests use a single local session; real multi-session contention still needs verification.

Read-only backend preflight found no Battleship schema/functions and no installed pg_cron/pg_net scheduler extensions in the Arcade-x project. No live database or Edge changes were made.

## Next activation work

1. Install staged schema on an isolated development backend and deploy the room function with JWT verification enabled. Keep service credentials server-only.
2. Connect a privileged scheduler to timeout processing; verify turn expiry with both clients closed, backlog processing and exact-deadline races. Add request rate limits and expired-room cleanup.
3. Test two registered accounts, unauthorized third-party reads/writes, concurrent PostgreSQL sessions, lost responses, replay, reconnect and completion. Implement disconnect grace before promising that behavior.
4. Connect create/join-by-code UI and filtered snapshot refresh; expose online mode only after end-to-end checks.
5. Add matchmaking and 2vs2 online as later work. Current 2vs2 review mode remains local practice against bots.

Remaining P2 work includes broader human playtesting, physical mobile performance, hull footprint art review and sound. No full launcher production build or production deployment is claimed.
