# Boom Buddies v2 — Arcade-x review integration

- Added launcher registry entry and responsive native host; the recovered reviewed game mounts into its own React root, without an iframe.
- Kept movement/joystick/explosion changes from Smooth Controls v2.
- Extracted 944 embedded assets to public/boom; assets are local and included by the existing PWA precache.
- Host pause/resume, sound mute and restart connect to the game. The internal progression remains in the prototype device-local save; no platform score, currency or cloud progression is awarded by this prototype.
- Development catalog includes the reviewed entry even when the remote catalog does not have it yet. Production remote-catalog registration is still pending; do not treat this as a production release.
- Review launcher embeds all game assets for offline use. Hid review navigation tools while a game is open so they cannot obscure the joystick.

Validation: TypeScript and production build pass. All 18 Smooth Controls checks rerun successfully. Two integrated launcher checks cover 390×844 and 1440×900, game launch, movement, screen bounds, pause/resume and mute button, no obscuring review tools and no runtime errors.

Source provenance: Boom's original TypeScript files were unavailable; runtime.js is the recovered, patched v1 preview bundle with its dependency license notices retained. The rest of Arcade-x uses the existing source snapshot with Cosmic v3 review changes preserved.

Status: no GitHub push, frontend publish or Supabase production changes. Cosmic SQL review remains unapplied. This package is for review and further development, not confirmation of production rollout.
