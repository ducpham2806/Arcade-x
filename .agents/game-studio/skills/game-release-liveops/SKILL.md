---
name: game-release-liveops
description: Game release manager, build pipeline, localization, and LiveOps specialist based on Claude-Code-Game-Studios 1.3 (/release-checklist, /launch-checklist, /write-changelog, /patch-notes, /hotfix, /day-one-patch, /localize). Manages release readiness gates, Semantic Versioning changelogs, player-facing patch notes, sharing a browser one-shot, emergency hotfix workflows, localization string freezes, and post-launch LiveOps content. Use when preparing game builds for release, writing changelogs or patch notes, sharing a prototype, executing hotfixes, localizing game text, or planning LiveOps events. Not for store-page uploads (steam-publish, itch-publish) or Unity build size (unity-build-size).
---
# Game Release & LiveOps

Release Manager, Localization Lead, and LiveOps workflow skill that governs build readiness, store launch checklists, changelogs, emergency hotfixes, localization pipelines, and post-launch content updates.

## When to Use

- Preparing a game build for alpha, beta, demo, Steam Next Fest, or full launch (`/release-checklist`, `/launch-checklist`)
- Generating technical changelogs or player-facing patch notes (`/write-changelog`, formerly `/changelog`; `/patch-notes`)
- Sharing or exporting a browser one-shot or grown web game (a `dist/` build, a hidden itch.io page or a web link)
- Executing an emergency hotfix or day-one patch workflow (`/hotfix`, `/day-one-patch`)
- Auditing and extracting user-facing strings for localization (`/localize`)
- Planning post-launch seasonal events, telemetry hooks, and community updates

## Steps

### 1. Execute Release & Launch Checklists (`/release-checklist` & `/launch-checklist`)

Verify every release gate in `production/release/` before tagging a build or pushing to distribution platforms (Steam, itch.io, mobile/console stores):

1. **Build & Packaging Integrity**:
   - Strip debug overlays, cheat keys, god-mode toggles, and verbose development logging from release export presets.
   - Verify export templates, signing certificates, app icons, splash screens, and EULA/credits screens.
   - Test the standalone exported binary outside the editor on a clean directory (catching case-sensitive file path bugs and unexported resource filters).
2. **Save Data & Migration Safety**:
   - Verify backward compatibility for existing player save files (`save_version` migration scripts tested against older save fixtures).
3. **Platform & Store Readiness**:
   - Confirm resolution scaling (16:9, 16:10 Steam Deck, ultrawide), controller disconnect handling, audio mute-on-focus-loss, and store achievement/cloud-save hooks.

### 2. Generate Changelogs & Player Patch Notes (`/write-changelog` & `/patch-notes`)

Maintain two distinct communication formats from git history and completed stories:

1. **Developer Changelog (`CHANGELOG.md`)**: Follow Keep a Changelog and Semantic Versioning (`MAJOR.MINOR.PATCH`), grouping commits under `Added`, `Changed`, `Fixed`, `Performance`, and `Breaking Changes` with story/bug IDs.
2. **Player-Facing Patch Notes (`production/release/patch-notes-vX.Y.Z.md`)**: Rewrite changes from the player's perspective:
   - Lead with exciting headline features and community-requested quality-of-life improvements.
   - Explain the *design intent* behind balance buffs/nerfs (why a weapon or enemy was tuned) rather than dumping raw variable diffs.
   - Never expose internal filenames or spoilers for unannounced content.

### 3. Share a Browser Prototype

1. Build `prototypes/<name>/dist/` without the tweak panel (`tune.js`) and working files (`evidence/`, notes); for a grown game, use `npm run build`.
2. For itch.io, zip the build with `index.html` at the zip root and check it against itch.io's HTML5 limits before upload (see `itch-publish`); a hidden or draft page is the usual first share.
3. Say plainly what the link exposes; never publish to a public page without the user's yes.

### 4. Manage Hotfix & Day-One Patch Workflows (`/hotfix` & `/day-one-patch`)

When an S0/S1 critical bug hits a live build:

1. **Isolate the Hotfix Branch**: Branch directly from the live release tag (`hotfix/vX.Y.Z+1`), never from an unstable `main`/`dev` branch containing half-finished next-sprint features.
2. **Minimal Surgical Fix**: Touch only the lines required to resolve the crash/exploit.
3. **Regression & Smoke Verification**: Run `game-qa-playtest` smoke checks and save-file compatibility checks before deploying.
4. **Back-Merge**: Merge the verified hotfix back into `main` immediately so the fix is not lost in future releases.

### 5. Run Localization Pipeline (`/localize`)

Enforce localization readiness across all UI and narrative files:

1. **String Extraction Audit**: Scan UI scenes and dialogue scripts for hardcoded user-facing strings and replace them with stable translation keys (`TR_UI_START_GAME`, `TR_DLG_NPC01_GREETING`) registered in the localization table (CSV/PO/JSON).
2. **UI Expansion & Font Check**: Verify UI containers support 30-40% text length expansion (for languages like German or Vietnamese) and CJK/diacritic glyph coverage without clipping or overlapping.
3. **Localization Freeze**: Enforce a string freeze window prior to release so translators can finalize keys without moving targets.

## Gotchas

- Never test only inside the game engine editor before a release; editor runs mask missing export filter patterns (such as `.json` or `.cfg` files excluded by default export settings) and case-sensitive filesystem mismatches.
- Never bundle experimental refactor commits into an emergency `/hotfix` branch.
- The old command names (`/changelog`, `/settings`, `/help`) still work: say the new name once (`/write-changelog`, `/project-settings`, `/next-step`) and run it.
- A localization freeze is enforced at write time: warn on any edit to frozen string keys during the freeze window.
