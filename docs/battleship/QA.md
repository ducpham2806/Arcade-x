# Validation checkpoint

- `npm run test:battleship`: 24 checks, including 200 seeded placement configurations, 20 complete fair bot duels and 4 complete squad bot matches. Bot inputs contain only public shot observations and remaining lengths.
- `npm run lint`: TypeScript check across the source snapshot passes.
- `npm run preview:battleship`: browser bundle and all 38 embedded WebP files built; ~1.86 MB self-contained HTML, no third-party runtime requests.
- Browser QA: Chrome through the managed internal preview. Manually placed a carrier at A1, auto-filled only missing vessels, readied, selected an enemy coordinate and fired, observed bot reply and hidden enemy board. 390px mobile iframe: 14x14 shared board, prepared 5 ships, used C3 in the 5x5 aim grid and fired; UI reported hit. Measured game clientWidth=375 and scrollWidth=375, canvasWidth=359: no horizontal overflow in that viewport.
- Browser console errors observed were from the Chrome extension content-script metadata sender; no game error was observed. This is not a complete console trace for every state.
- Visual polish: final desktop board width constrained by viewport height; timer display clamped to 30s so stale render timestamps cannot flash 31s. Engine deadline was always exactly 30,000ms.
- No full launcher production artifact or unrelated game asset tree is packaged from this sparse source snapshot. Full application TypeScript is checked; the game review bundle is built independently. No claim of full-game regression or deploy validation.
- Not yet tested: physical Android/iOS, long-session FPS/memory, live online/auth/queue/room/reconnect, sound or full PWA offline lifecycle.

Known carryovers from art lab: hull source aspect ratios may underfill the logical 1xN footprint. The preview keeps a visible hull footprint and uniform sprite scale; never derives hitbox from image alpha. Ocean is still-texture distortion. Fire/smoke use short ambient crossfade samples. Their production art review remains open.

Browser follow-up on the final review build: 30s displayed at battle start; after leaving the player idle, the game reached turn 7 with zero human shots and continued bot attacks, without a timeout loss popup.

## Tutorial and server foundation checkpoint

- Aggregate `npm run test:battleship`: 59 passing checks (24 engine, 17 tutorial/server, 10 PostgreSQL persistence, 8 mocked Edge handler). `npm run lint` passes.
- Manually completed all seven tutorial actions in the managed browser at 390px: place, rotate, rejected overlap, ready, miss, hit and sink. Completion panel measured clientWidth=375 and scrollWidth=375. Play-with-bot entered normal preparation with 0/5 ships and a live clock. Final caption-only adjustment was bundled after this browser pass.
- Self-contained review HTML rebuilt with 38 embedded assets, 1,866,910 bytes.
- SQL privilege checks use PGlite PostgreSQL locally; Edge tests mock Auth and RPC. They are not live deployment, multi-session PostgreSQL contention or real account tests.
- No backend migration, Edge deployment or online UI activation occurred. Scheduler entrypoint is tested as a function, but no deployed scheduler invokes it.

## Dual-board mobile interaction update (2026-10-21)

This replaces the old tab-only view and separate fire confirmation in normal practice matches. Both boards are mounted in a vertical stack: a large active board and a small board below. Tapping the small board swaps them and cannot fire. The player's chosen board stays selected across turns; battle entry opens the enemy board. Both boards receive the same filtered DTO, so enemy hulls remain hidden.

A tap on an enemy cell fires immediately when legal; the engine still rejects repeated cells, expired turns and wrong actors. The optional 5x5 aim buttons also fire directly and are disabled while observing the own board or waiting for a turn. Keyboard arrows only move the cursor, Enter/Space activates the selected cell. A 44px rotate icon appears beside the selected ship footprint, both before placement and after placement. Invalid committed rotations preserve the prior ship.

Browser checked at 390px in the managed preview: placed a carrier, rotated it after placement, auto-filled, readied, swapped to the enemy board without taking a shot, then tapped the main canvas once. Human shot count changed from 0 to 1 and the turn changed to B1 without a fire button. Both canvases remained mounted, with clientWidth=375 and scrollWidth=375. Full 59-check suite and source TypeScript were rerun. Physical devices remain untested.

## Room client follow-up

See P2-P3-CHECKPOINT.md and online-integration-tests.json. Aggregate suite is now 74 checks; all pass along with TypeScript. Browser local A/B room flow and pending-shot retry were checked on mobile. The review laboratory is explicitly a same-device simulation, not cloud online. Actual Supabase development branching was unavailable on the current plan; no migration, function or scheduler was deployed. The real online activation flag stays off.

## Cloud backend checkpoint

78 local checks and TypeScript pass after dedicated worker authentication was added. See CLOUD-ACTIVATION.md for actual cloud metadata, HTTP denial and database CAS checks. The primary API is deployed with JWT verification; the scheduler and real-account tests remain blocked by automatic approval review. Online frontend activation remains off. No full online reliability claim is made.

## Approved cloud verification completed

The 10-second scheduler is active. Real Auth account/isolation checks and a complete scripted fleet match passed; cloud timeouts progressed an unattended fixture. All temporary accounts were deleted, test rooms closed and the QA administration route removed (old route returns 403; normal worker returns 200). See CLOUD-ACTIVATION.md, cloud-auth-reports.json and cloud-deployment-results.json. Earlier approval-blocked notes are historical and are now resolved. Online frontend activation remains off pending the remaining disconnect/retention and release work.

## Presence checkpoint — 2026-10-21

See CLOUD-ACTIVATION.md for the current authoritative status. Disconnect/reconnect grace is 90 seconds, independent of the 30-second shot clock. A single absent battle player forfeits; both absent close without a winner; preparation absence cancels. Heartbeats use a service-only RPC, five-second write throttle, no gameplay version increment and an atomic expiry guard. Apply presence.sql after schema.sql/worker.sql. Normal Edge version 6 and presence migration are live. The online flag is enabled in source, but no launcher deployment occurred.

Validation: 90 automated checks plus TypeScript; cloud worker and presence/CAS fixtures; 390px browser room create/join, prepare and fire. Actual v6 Auth-account rerun was blocked by automatic review; v5 account evidence is historical. Remaining work: retention/cron-history management, release checks and physical-device network/performance playtests, then matchmaking and online 2vs2.

## Maintenance and temporary QA tooling — 2026-10-21

Migration battleship_reversible_maintenance_v1 is live. The hourly owner-only maintenance archives closed rooms and completed Battleship cron history older than seven days and removes stale transient rate windows. An actual cloud fixture was archived with full recovery marker intact; repeat invocation changed nothing. The hourly cron is active; a future scheduled run has not yet been observed. No active rooms were present or modified. Archives have RLS and no browser/service grants. Archive storage is retained; no permanent purge/export policy is enabled. See MAINTENANCE.md for limits, pause and restoration.

97 local checks plus TypeScript pass (seven new maintenance/bundle checks). Temporary QA builder can generate an explicitly requested ten-minute worker-protected wrapper while leaving the canonical normal API unchanged. QA is still closed on Edge v6; no new Auth accounts were created. QA-ADMIN-GUIDE.vi.md explains exact open/test/close steps without exposing service or worker credentials. Launcher publication and physical-device release tests remain pending.

## Turn visibility UI — 2026-10-21

Added a shared sticky status above the boards for bot and online battles: own turn, teammate turn (local squad), opponent thinking, real remaining seconds, urgent final five seconds, expired turn transition, pause and stale synchronization. The clock is read from the existing deadline and does not modify rules or bot delays. The live region announces text changes, not every countdown tick; pulse respects reduced-motion settings. Full TypeScript and review bundle pass. In 390px browser RoomLab QA, one shot changed A from own to enemy state; the opponent banner read “Đang suy nghĩ và chọn ô bắn…” with countdown. Banner width/scrollWidth 342px, sticky position, both boards preserved. This is UI verification, not real-token/network QA. No launcher publication or backend change.
