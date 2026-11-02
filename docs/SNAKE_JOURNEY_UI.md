# R01 journey UI — iteration 1, 2026-11-02

The game now opens on a chapter journey before mounting a live engine. The screen
reuses the approved chapter banner, lists all ten authored R01 levels, shows local
plus hydrated campaign stars, and recommends the first unlocked unfinished level.
A completed chapter recommends its last level for replay; no unreleased region is
shown as playable. Engine rules, maps, reward amounts and verifier digest are unchanged.

## Player flow and rules

Purpose: make the next action clear and preserve a player's interrupted run.
Inputs: choose an unlocked level, start, resume an existing checkpoint, explicitly
restart it, or enter the controls lab. Outputs: selected-level goal, lesson, three
star objectives and best time/score; then the matching authored level or checkpoint.
Locked nodes explain which preceding level opens them.

Starting another level is explicit and warns when it would replace a checkpoint.
Passive journey entry/level selection does not write or clear that checkpoint.
Resume restores a valid unlocked checkpoint paused, so the snake cannot move before
the player is ready. Completed-run receipts suppress obsolete resume suggestions.
Invalid or inaccessible storage is reported while the old data is retained.

Cloud campaign subscriptions update unlocks/stars without rebuilding the screen or
changing a level the player explicitly selected. They do not start a run or issue
network reads. Host pause blocks actions; leaving gameplay saves its checkpoint and
destroys its renderer/audio/input session. The journey itself creates no RAF loop.
Lab navigation and wrapper restart remain supported.

Desktop uses independent route/detail scroll areas. Mobile presents the selected
objective and action first, with the route below it. Selecting a mobile route node
returns to that objective; reduced-motion preference disables smooth scrolling.
Three-star objectives are a native collapsible section on mobile. The chapter header
and footer stay stable while its content scrolls.

## Evidence

- `npm run test:snake-journey`: locked/unlocked rules, recommended next level,
  cloud subscription updates, explicit selection retention, pause gating, actual
  checkpoint decode/resume/restart choices, corrupt checkpoint retention, all-clear
  totals and subscription cleanup pass.
- `npm run test:snake-cloud`: campaign merge/isolation/quota regression passes.
- TypeScript and Vite preview build pass (existing cross-game asset/chunk warnings).
- Actual Chromium inspected at desktop and 360×800 iframe viewport. Journey → intro
  → play → journey → resume restored the local 1-1 checkpoint paused at 0.7 seconds.
  This was the real renderer and local save path, without account/backend fixtures.
- The exported single HTML boots the same journey. It embeds its code, CSS, banner
  and existing game assets, uses browser-local saves and has no Auth/React clients.
  File-protocol storage permissions still depend on the browser used to open it.

## Review and reproduction

`npm run export:snake-journey` writes `dist/Snake_Legend_Journey_Playtest.html`.
For local development, `/tests/snake/journey-review.html` has desktop and actual
360px iframe presets. It is a review entry, not a production registry entry.

The in-game art/animation is still the A1 candidate; this iteration improves chapter
navigation and save continuity. Boss animation, terrain/audio polish, full-account
launcher UI, actual wall-clock JWT expiry and physical-device gates remain open.

Follow-up: [R01 boss feedback](SNAKE_BOSS_FEEDBACK.md) adds telegraphs, weakness
countdowns and still-image feedback. Authored boss animation remains open.
