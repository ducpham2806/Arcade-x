# Validation checkpoint

- `npm run test:battleship`: 24 checks, including 200 seeded placement configurations, 20 complete fair bot duels and 4 complete squad bot matches. Bot inputs contain only public shot observations and remaining lengths.
- `npm run lint`: TypeScript check across the source snapshot passes.
- `npm run preview:battleship`: browser bundle and all 38 embedded WebP files built; ~1.86 MB self-contained HTML, no third-party runtime requests.
- Browser QA: Chrome through the managed internal preview. Manually placed a carrier at A1, auto-filled only missing vessels, readied, selected an enemy coordinate and fired, observed bot reply and hidden enemy board. 390px mobile iframe: 14x14 shared board, prepared 5 ships, used C3 in the 5x5 aim grid and fired; UI reported hit. Measured game clientWidth=375 and scrollWidth=375, canvasWidth=359: no horizontal overflow in that viewport.
- Browser console errors observed were from the Chrome extension content-script metadata sender; no game error was observed. This is not a complete console trace for every state.
- Visual polish: final desktop board width constrained by viewport height; timer display clamped to 30s so stale render timestamps cannot flash 31s. Engine deadline was always exactly 30,000ms.
- No full launcher production artifact or unrelated game asset tree is packaged from this sparse source snapshot. Full application TypeScript is checked; the game review bundle is built independently. No claim of full-game regression or deploy validation.
- Not yet tested: physical Android/iOS, long-session FPS/memory, online/auth/queue/room/reconnect (not implemented), guided tutorial flow, sound or full PWA offline lifecycle.

Known carryovers from art lab: hull source aspect ratios may underfill the logical 1xN footprint. The preview keeps a visible hull footprint and uniform sprite scale; never derives hitbox from image alpha. Ocean is still-texture distortion. Fire/smoke use short ambient crossfade samples. Their production art review remains open.

Browser follow-up on the final review build: 30s displayed at battle start; after leaving the player idle, the game reached turn 7 with zero human shots and continued bot attacks, without a timeout loss popup.
