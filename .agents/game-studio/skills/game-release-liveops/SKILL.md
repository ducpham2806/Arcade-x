---
name: game-release-liveops
description: Game release manager, build pipeline, localization, and LiveOps specialist based on Claude-Code-Game-Studios (/release-checklist, /launch-checklist, /changelog, /patch-notes, /hotfix, /day-one-patch, /localize). Manages release readiness gates, Semantic Versioning changelogs, player-facing patch notes, emergency hotfix workflows, localization string freezes, and post-launch LiveOps content. Use when preparing game builds for release, writing changelogs or patch notes, executing hotfixes, localizing game text, or planning LiveOps events.
---
# Game Release & LiveOps

Release Manager, Localization Lead, and LiveOps workflow skill that governs build readiness, store launch checklists, changelogs, emergency hotfixes, localization pipelines, and post-launch content updates.

## When to Use

- Preparing a game build for alpha, beta, demo, Steam Next Fest, or full launch (`/release-checklist`, `/launch-checklist`)
- Generating technical changelogs or player-facing patch notes (`/changelog`, `/patch-notes`)
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

### 2. Generate Changelogs & Player Patch Notes (`/changelog` & `/patch-notes`)

Maintain two distinct communication formats from git history and completed stories:

1. **Developer Changelog (`CHANGELOG.md`)**: Follow Keep a Changelog and Semantic Versioning (`MAJOR.MINOR.PATCH`), grouping commits under `Added`, `Changed`, `Fixed`, `Performance`, and `Breaking Changes` with story/bug IDs.
2. **Player-Facing Patch Notes (`production/release/patch-notes-vX.Y.Z.md`)**: Rewrite changes from the player's perspective:
   - Lead with exciting headline features and community-requested quality-of-life improvements.
   - Explain the *design intent* behind balance buffs/nerfs (why a weapon or enemy was tuned) rather than dumping raw variable diffs.
   - Never expose internal filenames or spoilers for unannounced content.

### 3. Manage Hotfix & Day-One Patch Workflows (`/hotfix` & `/day-one-patch`)

When an S0/S1 critical bug hits a live build:

1. **Isolate the Hotfix Branch**: Branch directly from the live release tag (`hotfix/vX.Y.Z+1`), never from an unstable `main`/`dev` branch containing half-finished next-sprint features.
2. **Minimal Surgical Fix**: Touch only the lines required to resolve the crash/exploit.
3. **Regression & Smoke Verification**: Run `game-qa-playtest` smoke checks and save-file compatibility checks before deploying.
4. **Back-Merge**: Merge the verified hotfix back into `main` immediately so the fix is not lost in future releases.

### 4. Run Localization Pipeline (`/localize`)

Enforce localization readiness across all UI and narrative files:

1. **String Extraction Audit**: Scan UI scenes and dialogue scripts for hardcoded user-facing strings and replace them with stable translation keys (`TR_UI_START_GAME`, `TR_DLG_NPC01_GREETING`) registered in the localization table (CSV/PO/JSON).
2. **UI Expansion & Font Check**: Verify UI containers support 30-40% text length expansion (for languages like German or Vietnamese) and CJK/diacritic glyph coverage without clipping or overlapping.
3. **Localization Freeze**: Enforce a string freeze window prior to release so translators can finalize keys without moving targets.

## Gotchas

- Never test only inside the game engine editor before a release; editor runs mask missing export filter patterns (such as `.json` or `.cfg` files excluded by default export settings) and case-sensitive filesystem mismatches.
- Never bundle experimental refactor commits into an emergency `/hotfix` branch.
