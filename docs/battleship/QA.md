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
