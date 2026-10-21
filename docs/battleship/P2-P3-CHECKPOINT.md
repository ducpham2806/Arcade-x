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

## Follow-up: room UI and client integration

Added the create/join-by-code UI, server-derived seat views, readiness, direct tap-to-fire, server-side auto-placement, cancellation and surrender on leave. The HTTP client uses the existing registered Arcade-x session and the same resolved public backend configuration as the launcher. It serializes mutations, keeps uncertain requests for exact action-ID retry, refreshes on version rejection, discards older snapshots, estimates server clock offset and blocks play on stale synchronization. Resume storage contains only room IDs under the verified user ID, including a create request ID before its response is known.

The renderer now accounts for the viewer team, so a B1 client maps incoming and outgoing shots to the correct board. Animations use the estimated server time. The service-only SQL request budget allows 90 reads and 30 writes per minute per identity. The scheduler operation requires the exact server credential; ordinary user JWTs cannot call it. The staged scheduler SQL checks Vault prerequisites, requests a tick every 10 seconds only when due rooms exist, and keeps credentials out of the browser and repository. This script has not been installed or executed on a cloud database.

The review HTML now includes a clearly labeled two-player local room laboratory. It runs the same room core in the browser strictly for review, with two separate client instances, a shared local store and a simulated network toggle. It does not provide actual network play, durable persistence, Auth or a background worker after the page is closed. The production game entrypoint excludes RoomLab and its local authority; a bundle-graph check verifies this.

The Supabase development-branch request returned `Branching is supported only on the Pro plan or above`. No branch was created and no cloud schema, function or scheduler was changed. This is a limitation of branch provisioning, not a claim that Battleship itself requires a Pro subscription. A separate designated development project is another route. The online feature flag remains false until cloud activation and account tests succeed.

Validation: 74 passing checks (24 engine, 17 tutorial/server, 11 PostgreSQL privilege/rate-budget, 9 Edge-handler, 13 client/handler/PostgreSQL pipeline and bundle isolation). Pipeline Auth responses are fixtures and requests are in-process HTTP-shaped requests; they do not replace real-token, real-network, multi-session PostgreSQL or cloud scheduler tests.

Managed-browser mobile QA: A created a room; B entered its displayed code; both auto-placed and readied; A fired and B received and returned a shot; a simulated network failure retained a pending A shot and retry produced exactly one additional shot. Both boards stayed visible. B game width and scrollWidth both measured 360px inside the 390px review frame. The real-online entry displayed the intentional pre-release gate. A browser compatibility issue with randomUUID on non-secure preview origins was fixed with a UUID generator using crypto.getRandomValues.

Still required before activation: an isolated development backend, actual deployment, Vault credentials and scheduler monitoring, real registered accounts, disconnect grace/forfeit, retention cleanup and performance checks. Matchmaking and online 2vs2 remain later work. The local practice modes are unchanged.

## Cloud activation follow-up (2026-10-21)

The primary room API and private persistence schema are now live. See CLOUD-ACTIVATION.md and cloud-deployment-results.json for the current state, cloud permission/HTTP/CAS checks and the two explicit approval blockers. The online frontend flag is still false. Earlier no-deployment descriptions above are historical checkpoints. No account-creation QA route or scheduler has been activated.

## Approved cloud verification completed

The 10-second scheduler is active. Real Auth account/isolation checks and a complete scripted fleet match passed; cloud timeouts progressed an unattended fixture. All temporary accounts were deleted, test rooms closed and the QA administration route removed (old route returns 403; normal worker returns 200). See CLOUD-ACTIVATION.md, cloud-auth-reports.json and cloud-deployment-results.json. Earlier approval-blocked notes are historical and are now resolved. Online frontend activation remains off pending the remaining disconnect/retention and release work.

## Presence checkpoint — 2026-10-21

See CLOUD-ACTIVATION.md for the current authoritative status. Disconnect/reconnect grace is 90 seconds, independent of the 30-second shot clock. A single absent battle player forfeits; both absent close without a winner; preparation absence cancels. Heartbeats use a service-only RPC, five-second write throttle, no gameplay version increment and an atomic expiry guard. Apply presence.sql after schema.sql/worker.sql. Normal Edge version 6 and presence migration are live. The online flag is enabled in source, but no launcher deployment occurred.

Validation: 90 automated checks plus TypeScript; cloud worker and presence/CAS fixtures; 390px browser room create/join, prepare and fire. Actual v6 Auth-account rerun was blocked by automatic review; v5 account evidence is historical. Remaining work: retention/cron-history management, release checks and physical-device network/performance playtests, then matchmaking and online 2vs2.

## Maintenance and temporary QA tooling — 2026-10-21

Migration battleship_reversible_maintenance_v1 is live. The hourly owner-only maintenance archives closed rooms and completed Battleship cron history older than seven days and removes stale transient rate windows. An actual cloud fixture was archived with full recovery marker intact; repeat invocation changed nothing. The hourly cron is active; a future scheduled run has not yet been observed. No active rooms were present or modified. Archives have RLS and no browser/service grants. Archive storage is retained; no permanent purge/export policy is enabled. See MAINTENANCE.md for limits, pause and restoration.

97 local checks plus TypeScript pass (seven new maintenance/bundle checks). Temporary QA builder can generate an explicitly requested ten-minute worker-protected wrapper while leaving the canonical normal API unchanged. QA is still closed on Edge v6; no new Auth accounts were created. QA-ADMIN-GUIDE.vi.md explains exact open/test/close steps without exposing service or worker credentials. Launcher publication and physical-device release tests remain pending.
