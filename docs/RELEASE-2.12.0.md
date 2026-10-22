# ArcadeX 2.12.0 · All Worlds

22 games. Quán Nhậu Tycoon is excluded by the owner's instruction; Rắn Săn Mồi remains in development and is not included.

The release merges the six game/system branches based on `c143446375eb7bbfa003e75418dad0403d3ce7f2`: Block Breaker, Boom Buddies, Cosmic Defend, Eat Em All, subscription foundation, and Battleship. It adds the reviewed Dungeon Titan v6.3 source patch, Neon Run v0.14 from clean Site source `8e1b771`, and the Cosmic Defend v5 learning/recovery design. Previous Cosmic v2/v3/v4 replay engines remain frozen.

All 22 games have separate 512 px icons and 1280 × 640 promotional banners, with editable SVG masters and WebP runtime exports. The gallery is `review/arcadex-art-all-worlds.html`.

## Build and release

Use Node 24. Run `npm ci`, `npm run lint`, `npm run build`, and `npm run test:full-release`. Deploy the contents of `dist/`, with `index.html`, `_headers` and `_redirects` at the deployment root. Serve through HTTP/HTTPS; the production build is not a file-URL application.

When publishing against an existing Supabase catalog, apply `supabase/releases/catalog-all-worlds.sql` after the existing launcher schema. It adds Battleship only if absent and updates the legacy Neon title. Existing pricing, maintenance and access overrides are preserved. Subscription/commerce backend activation and production payment configuration are separate rollout steps; building this release does not change live database configuration.

## Verification scope

TypeScript and production build; all registered game packages and artwork paths; game-specific engine/DOM suites; account-isolated Neon progress; frame origin/source validation; old Cosmic replay parity; new Cosmic learning phrases and safe recovery; Neon VM checks and actual-physics route drivers; local PostgreSQL fixtures for Battleship and commerce.

Chromium is unavailable in the build environment, so a fresh browser pass across all 22 games and physical-phone performance/audio are unverified. VM/DOM tests are not pixel-layout or human difficulty ratings. Live multiplayer tests with real accounts are separate from fixture-backed protocol tests.
