# One-shot flow: "make me a game" (`/prototype`)

Hub adaptation of the Claude-Code-Game-Studios 1.3.0 one-shot road
([Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios),
MIT). CCGS ships helper scripts (`one-shot-new.sh`, `one-shot-check.sh`, ...) for these steps;
this hub does not, so each step below says what to do with the tools the session has.

**Contents:** [1 Route](#1-route) · [2 Questions and brief](#2-questions-and-brief) ·
[3 Build](#3-build) · [4 Small check](#4-small-check) · [5 Handover](#5-handover) ·
[6 Change after play](#6-change-after-play) · [7 Grow it](#7-grow-it) ·
[8 Bring your own game](#8-bring-your-own-game)

## 1. Route

| What is set | Route |
|---|---|
| A quick test of one mechanic (`--spike`) | Spike: smallest throwaway build that answers one question |
| A game the user already has (`--from <path>`) | Section 8, then section 5 |
| `--path engine` / `--path paper` | Throwaway engine or paper prototype: one question, capped at one day, ends PROCEED / PIVOT / KILL |
| No engine, `engine.type: web`, or `--path html` | The one-shot: sections 2-5 |
| An engine is set | Engine prototype; offer the browser sketch as one option, not recommended |

Ask no question to choose the route. Prototype code never imports production code and
production code never imports from `prototypes/`. Three PIVOTs on one concept force a KILL
decision.

## 2. Questions and brief

1. **One round, at most about eight questions**, picked for the genre: the choices that shape the
   game, how it should feel, how it looks, how hard it is, the goal, and slice-or-quick-test.
   Show the usual answer with each so "you pick" works.
2. **A vague idea** ("a racing game") gets two or three one-line pitches first; "none of these"
   gets new ones, and what was said against the old ones becomes an Avoid line.
3. **Two genres in one idea** are combined system by system; the brief says which genre leads
   each system.
4. **Online play, VR, a phone or a console** get one plain line on what is built instead
   (a local browser build cannot prove networked feel).
5. **A copy of a named game**: ask one question (an original game in that genre, or that game
   with the user's own twist) and never build the copy.
6. Write `design/game-brief.md` from `docs/templates/game-brief-template.md`. **In your words** is
   kept word for word. Every field you filled is marked *(guessed)*, *(inferred)* or
   *(provisional)*. Images and sounds the user drops in `references/` (with a take / avoid / use
   line each in `references/notes.md`) shape the Look.

## 3. Build

Build in `prototypes/<name>/`: `index.html` that opens with a double-click, plus `config.js`.
Four hard rules:

1. **No emoji art.** Every figure, prop, tile, icon and HUD piece is drawn in code in the
   brief's Look; no plain circle or rectangle standing in for a figure; each enemy kind has its
   own silhouette.
2. **No copying a game.** A named game gives values (a timing, a range, a count), never its
   signature mechanic, layout, figures or names. Write one line to
   `prototypes/<name>/evidence/nearest-game.txt`: "Nearest game: <name>; this one differs in <what>".
3. **Keep the brief's words.** Every look, view and reference word in In your words is built as
   named, or listed as a miss with its reason, never silently swapped.
4. **Playable and not trivially easy.** It boots and plays to a win or a loss, and the brief's
   Challenge is built from the genre's usual starting values.

How to build:

- Every tuning value lives in `config.js` from the first line (`value`, `min`, `max`, `step`).
  Game logic runs on a fixed step, never on the real clock.
- Expose `window.game` (`scene`, `state`, `press`, `hold`, `step`) so the check can drive it.
- Build Build-order step 1 with the goal and the way to lose: a start, a ramp and an end. Each
  `in the slice` system for real, each `thin stand-in` working at its simplest, each `later`
  one left out.
- Day-one screens: start (title + controls) always; pause for real time; game over + restart
  for hard failure; results when it ends; mute when it has sound.
- Effects (hits, explosions, pickups, transitions) can come from `pixelfx`: its code-drawn effects meet the no-emoji rule and run in a plain canvas. Copy `src/core` and only the effects used into the game folder, with pixelfx's `LICENSE` and `NOTICE.md`.
- Write no robot player, simulator or auto-tuner. The user's play is the balance check.

## 4. Small check

About five minutes, in a headless browser (Playwright/Chromium):

1. Open the page; record console errors.
2. Press the keys that leave the title, then a few seconds of the game's own keys; confirm the
   state changes.
3. Take one screenshot of play and look at it against the brief.
4. Record four rows - **boots**, **responds**, **keeps your words**, **every figure drawn, no
   emoji** - each passed / failed / not assessed with why.

Fix text that is too small, overlapping or off screen, and screens that freeze, in **one**
round; list anything left as still broken. Then mark every brief line pass / missing / broken /
not assessed from the screenshots and the code. Evidence goes in `prototypes/<name>/evidence/`.

## 5. Handover

The card lists: how to play, the four check rows, the brief checklist score, what was fixed,
the nearest game, anything not built as said, what is still broken, what was guessed, the true
effort, and the screenshot path. It ends **"Not yet played by a person"**. Offer a commit and
the tag `one-shot/<name>` - the point every later change can return to. The verdict after play
is PROCEED (keep going), PIVOT or KILL; NOT ASSESSED while nobody has played it.

## 6. Change after play

- Check each request against the brief's **Keep**, **Avoid** and **Out of scope** first.
- Do what was asked; a bigger rework only when asked. Tuning goes into `config.js`.
- Light check before accepting: one scripted run and a screenshot of what the change touched.
  A balance change is checked by the user's next play.
- Each accepted change is one commit, `iteration N: <what>`. "Go back to iteration 2" (or to the
  `one-shot/<name>` tag) is a checkpoint.
- A Keep line can pin values (`pins: dash_speed 14, dash_time 0.12`); the check flags a pinned
  value that moved.
- **"Too easy" / "every part is the same"**: add at least one rule that raises pressure or gives
  a new choice (an escalating threat, a chase, a new hazard or tool) before moving any number.
- **"I hate it"**: offer fix, pivot or kill.
- **Tweak panel** on request: sliders for every `config.js` value (CCGS opens it on the backquote
  key or `?tune`); pasted values are written back with a feel-log line each.
- **Share**: build a `dist/` without the tweak panel and working files; for itch.io see
  `itch-publish` (hidden page, size limits).

## 7. Grow it

On PROCEED, ask one question: keep iterating, or grow it into a web project at the project root
(Vite + TypeScript, values in data files, one rule under test, `npm run dev | build | test |
smoke`, and a same-seed run that proves it still plays the same). Each step is its own commit;
tag the result `grown/<name>`. The one-shot folder is copied from and never changed. Afterwards,
**one feature a sitting**: build it, run smoke and the same-seed run, and ask to keep it as a
commit. Stories, epics and gates (`game-production-scrum`) only when asked, or in studio mode.

## 8. Bring your own game

Copy the existing browser game into `prototypes/<name>/` byte for byte (the original is only
read), commit it, tag `baseline/<name>`, screenshot it untouched, and write its brief from what
it shows (built features marked `[x]`). It can then be changed and grown like a one-shot.
