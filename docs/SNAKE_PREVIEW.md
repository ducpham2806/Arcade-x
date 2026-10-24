# Snake Legend — launcher integration checkpoint

24 October 2026 · Asia/Ho_Chi_Minh. Baseline: `b211a336634ac66f9f84cd2bac6dc7e48794ab3e`.

## Delivered

The recovered v0.15 client now mounts in a separate `/preview/snake/` entry using
the actual AuthProvider, LauncherProvider, PlayerProvider, InventoryProvider and
GameProvider. The entry uses the existing GameWrapper and a packageLazy loader;
it does not register Snake in the production registry or subscription catalog.
The ordinary `npm run build` excludes the preview engine and marketing images.

The wrapper skips its legacy save reads, periodic auto-save and suspend writes
for Snake. Snake owns checkpoints, its completion outbox and its summary. The
restart button dispatches the existing Snake restart event. Auth changes close
the binding and stop the previous account's game. No database, Auth settings,
feature flags, wallet, reward settings or backend deployment changed here.

The recovered ImageGen icon (512×512, 52,592 bytes) and banner (1600×534,
190,658 bytes) are imported with hashed output names. Loading, header and help
use the same icon through optional metadata artwork. Their source PNGs and
SHA-256/budget manifest are in `art/launcher/snake-legend`. These are marketing
images; in-game A1 art/animation is still a candidate. Tech-art limits are
150,000 bytes for the icon and 240,000 bytes for the banner; both pass.

## Build and review

```sh
npm ci
npm run lint
npm run build
npm run build:snake-preview
npm run test:snake-preview
npm run test:full-release
```

Serve `dist` with existing static host routing and open `/preview/snake/`.
Netlify deploy-preview context runs both builds; production runs only the first.
The main service worker excludes the preview navigation path and preview files
from its precache. The preview does not install another service worker.

## Evidence and limits

- Full TypeScript check and both Vite builds pass. Existing large-chunk warnings
  remain; no claim of physical-device performance is made.
- Emitted-manifest checks pass: engine/wrapper deferred until Play, deep-link
  asset URLs, artwork hashes/budgets, production/catalog exclusion, no second SW.
- Full-release regression passes: 22 games, 841 resources, existing icons and
  account/pause/frame checks preserved.
- Recovered standalone v0.15 suite rerun: 224 logic checks and 7 host React/DOM
  groups pass (including guest denial, token refresh without remount, lost-ack
  retry and cleanup). These use controlled HTTP fixtures, not live user login.
- Actual Chromium preview inspected at desktop and within 360×800/320×568
  frames. Hero and original artwork render; compact CTA wrapping corrected.
- This browser reported that the auth server could not be reached. Guest landing
  works, but authenticated full-launcher play/save/reload and real JWT expiry
  were not exercised. Do not treat this as live E2E sign-off.

## Next priority

1. Authenticated launcher E2E against the existing controlled backend: win/save,
   reload state, lost network/retry, logout/account switch and actual JWT expiry.
   Global backend feature/reward flags remain disabled; normal users may need
   the existing local-only fallback after ticket denial. Do not enable rewards
   just to make this test pass.
2. Authoritative cloud progress hydration and device conflict handling. The
   validated server snapshot is displayed only; checkpoint/campaign restore is
   still local. Snake Gold/Gem remain separate from launcher currency.
3. A1/A2 animation, production audio and M2 human/device/performance gates.

No production merge or release readiness is implied by this checkpoint.
