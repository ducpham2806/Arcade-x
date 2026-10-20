# Battleship P0 audit and implementation checkpoint

Date: 2026-10-21 (Asia/Ho_Chi_Minh)
Repository: ducpham2806/Arcade-x
Audited base commit: c143446375eb7bbfa003e75418dad0403d3ce7f2

## Confirmed integration points

- `src/games/registry.ts`: packageLazy registers a React game module; engine/assets load after selection.
- `src/games/packageAssets.json`: per-game asset preload manifest. Battleship adds 38 WebP files, 1,218,358 bytes total. No source PNG sheets are loaded by gameplay.
- `src/launcher/catalog.ts`: local review entry when the server catalog has not published a game. No catalog rows changed remotely.
- `src/games/gameUiPolicy.ts` and `GameWrapper.tsx`: preserve the authored naval UI, full viewport and scrolling/touch on mobile. Platform pause prop suspends the solo timer and bot scheduling.
- `src/visuals/gameArt.tsx` and `FeaturedCarousel.tsx`: distinct fleet artwork and review banner copy.
- `GameComponentProps`: local prototype accepts platform pause; does not call economy rewards, leaderboard, or account-match writes. Result summary stays inside the game, preventing double rewards. The wrapper skips unsupported practice autosave and labels exit honestly; GameSaveGate does not claim a saved match.

## Online reuse boundary (source audit, not live backend verification)

`src/types/multiplayerCore.ts` defines `players.host` / `players.guest`, a shared `boardState`, and one player turn UID. `src/services/matchmakingService.ts` receives client-calculated `newBoardState` and win checks in submitMove; `handleTimeout` ends a game. This is not a valid Battleship protocol for hidden hulls, four seats or timeout-as-skip. `src/services/multiplayer.ts` also uses a two-player board model. Preserve these modules for their current games.

Reuse account identity and social invitations only after membership/auth review. Do not send hidden hull arrays through existing shared boardState or Realtime room payloads. An access-controlled server adapter and timeout worker are required before opening online play. No live Supabase settings, database schema, functions, secrets, or Netlify configuration were changed in this checkpoint.

## Implemented milestone

- P1 rules: placement, rotation, collision/bounds/ownership checks; deterministic backtracking auto-placement preserving existing ships; ready gate; preparation expiry; immutable transitions; 30s turns; skip on timeout; duplicate/stale shot rejection; idempotent retries; hit/sunk/fleet victory; surrender for duel; deterministic four-seat rotation and 14x14 sectors.
- P2 first playable slice: fair easy/normal bot using public observations; solo 1vs1 and 2vs2 practice with three bots; US/JP fleet appearance; ocean/missile/explosion/splash/fire/smoke; small-cell 5x5 aim controls; keyboard selection; help; reduced motion; 1.8s result reveal; rematch changes first side; optional local practice counters.
- Review HTML is self-contained and offline; no account, network or installed server is required.

## Validation

See test-results.json and QA.md. Tested rules/bot engine with 200 placement seeds, 20 full bot duels and 4 full squad bot matches. TypeScript project check passes. Real browser manual actions verified placement -> auto-fill -> ready -> shot -> bot reply; mobile layout is tested in a 390px iframe, not a physical phone.

## Remaining plan (not completed)

P2: interactive guided tutorial beyond the help screen; broader human playtest, hull footprint refit and physical mobile profiling. Ocean is animated from a still texture, not fluid simulation. Short sprite loops retain the asset pack's visual-review limits.
P3: authenticated authoritative 1vs1 room and queue; secret-state storage, filtered snapshots, server timer, reconnect, idempotent results.
P4: authenticated 2vs2 rooms/party queue, private team pings/chat, seat takeover, unanimous surrender/rematch.
P5: final damaged/sunk hulls, sound, production atlases, subscription/catalog gating, cache lifecycle and final launcher art.
P6: multi-account end-to-end online tests, slow-network/reconnect tests, exploit checks and human balancing. No online test result is claimed here.
