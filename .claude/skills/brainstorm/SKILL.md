---
name: brainstorm
description: "Brainstorm a new ArcadeX game or feature that fits the launcher — pillars, core loop, MVP scope, reuse of existing systems, risks."
argument-hint: "[theme or constraint]"
user-invocable: true
---

# Brainstorm

## Constraints of the platform
Web PWA, Canvas 2D, plays in short sessions on phones (portrait and landscape) and desktop,
offline after first load, shared launcher progression (coins, XP, quests, shop, leaderboards),
optional Supabase online features. Check `src/games/registry.ts` to avoid duplicating a genre
already covered, and never recreate a specific existing commercial game.

## Flow
1. Generate 5–8 distinct concepts (one line each: fantasy, verb, twist).
2. Shortlist 2–3 with `creative-director` (identity, fit with the launcher) and `game-designer`
   (core loop, progression).
3. For the pick: 3 pillars, 30-second loop, session loop, progression hooks into launcher rewards,
   controls on touch and keyboard, art/audio needs, systems reused from other games.
4. MVP scope (what ships first), stretch goals, risks, and how it will be tested
   (engine test + `test:games` entry).

Present options and a recommendation; write a doc in `docs/` only when the owner picks one.
