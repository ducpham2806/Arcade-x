# PC and mobile parity review — 2026-10-13

Base source: `acebecc0af15ac5be645ca596fe062a117c8c38d` from `ducpham2806/Arcade-x`.
Published Netlify deployment at inspection: `05343c115527645df1c4283b7a4af5bf0c3aa838`.
This review does not push Git or publish Netlify.

## Findings and changes

- Blossom uses one shared engine and VFX component on desktop and mobile. Normal-motion effects worked in the actual launcher at 390, 1440 and 1920 px; there was no separate desktop engine to merge.
- The downloadable launcher embedded only Blossom branding, while the independent mobile review embedded runtime assets. The launcher exporter now embeds flowers, special items, the required animation sheets and audio.
- Reduced motion disabled animation on initially transparent sprite sheets, making them invisible. It now shows a static middle frame and retains a 650 ms minimum impact interval before completion.
- Wide touch-enabled PCs were classified as mobile. Layout now follows viewport width while retaining touch input.
- The release metadata is 2.8.0, Desktop & Mobile. Existing game data and update-install protection during active gameplay are preserved.

## Verification scope

- Blossom: six effect types, board alignment, sun three-row/three-column geometry, rainbow targeting, and effects finishing before one combined result at mobile and two PC widths.
- Reduced motion: visible feedback and result timing at mobile and PC widths.
- Downloadable launcher: offline sprite rendering at mobile and PC widths, plus touch-PC layout and resize behavior.
- All 19 games in main: opening, viewport fit, available controls, exit controls and JavaScript errors at 390 and 1440 px.
- Boom Buddies: the separately preserved latest prototype was checked at the same two widths. Its source was not present in main; this review does not replace or recreate that prototype.
- Launcher: existing profile, settings, leaderboard, game details, share and account/theme regression checks.

These checks do not exhaust every game level, online multiplayer session, or browser/GPU combination. The deployed website remains unchanged; its older deployment and a user's particular cached version must not be conflated with the newly tested review.
