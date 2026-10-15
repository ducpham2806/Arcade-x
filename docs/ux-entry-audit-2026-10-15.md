# Game entry audit — 2.11.0

Scope: source review of all 21 registered games and deployed desktop browser entry smoke checks. This is not a complete playthrough of every level, multiplayer session, or physical-device test.

Shared changes: cartridge artwork/title launches directly; detail/rules stay separately available; the shared pre-game guide is optional via the game title; legacy stages scroll from the top instead of forcing viewport-height children into a centered stage. Game package download remains visible and mandatory only when assets are missing. Nine authored game interfaces retain their native palettes.

| Game | UI policy | Entry path checked |
| --- | --- | --- |
| Chess | Launcher | New lobby → AI → board; difficulty remembered |
| Xiangqi | Launcher | New lobby → AI → board |
| Caro/Gomoku | Launcher | New lobby → AI → board |
| Scoodoku | Launcher | Quick campaign → board, map optional |
| Draw A Shape | Launcher | Quick classic → board |
| Eat Em All | Launcher | Start → gameplay |
| Tile 2048 | Launcher | Direct board |
| Mummy | Launcher | Direct board |
| Fill The Space | Launcher | Direct puzzle controls |
| Dungeon Tap | Launcher | Direct gameplay HUD |
| Neon Runner | Launcher | Direct runner controls |
| Cyber Blade Slice | Launcher | Direct stage controls |
| Rainbow Blocks | Authored | Play now → board |
| Blocker | Authored | Free play → board; campaign remains selectable |
| Car Escape | Authored | Play level 1 → board |
| Shikaku | Authored | Relaxed play → board; size inline |
| Word Cross | Authored | Select level 1 → board |
| Cosmic Defense | Authored | New direct mission launch → flight HUD |
| Blossom / Hex Match | Authored | Existing preparation and skippable story checked; primary start now launches first unfinished accessible level without the equipment dialog. Level selection retains preparation. |
| Boom Buddies | Authored | Journey → equipment → start; first chapter story/tutorial has skip control |
| Block Breaker | Authored | Journey → first chapter intro → launch board |

Chess lobby was visually verified at the top of the available viewport. Its old full-screen minimum height and vertical distribution caused the displaced content. Shared online room UI uses a spacious desktop dialog and full-height mobile layout.

An additional launch race was fixed: when guest identity restoration completes during authorization, recheck access once under the settled identity and continue the same click. Repeated identity changes still abort; premium access is never inherited across identities.

Validation: TypeScript, production build, React entry regression (direct artwork launch, separate details, one-click AI, remembered difficulty, identity recheck allow/deny), PWA package isolation for all 21 registrations, play-first authentication, and bounded social conflict/polling regressions.

Remaining verification limits: real-phone layout and touch ergonomics, full campaigns, online matchmaking against another player, and renewed-install PWA upgrade lifecycle require broader testing. Browser package preparation can take time on an uncached game; it is loading rather than an extra confirmation step.
