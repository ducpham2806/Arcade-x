---
name: ux-review
description: "Review launcher or game UX against AGENTS.md and touch/keyboard parity — modal sizing, tab stability, in-game toasts, force-update, HUD and controls."
argument-hint: "<screen, modal or game>"
user-invocable: true
---

# UX Review

## Checklist
1. **AGENTS.md modal rules**: full screen on phones (`w-full h-full`), desktop
   `sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl lg:max-w-5xl`, no short bottom sheets, grids
   `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, fixed frame across tabs with
   `flex-1 overflow-y-auto min-h-0 custom-scrollbar` content.
2. **In-game**: level-up/rewards use `LevelUpToast`, never a blocking modal; force update only
   when `activeGameId === null`.
3. **Controls**: touch pad shown on touch, hidden for keyboard/mouse; nothing covers the hero on
   844×390 landscape; tap targets ≥ 44 px.
4. **Readability**: canvas text via `readableCanvasText` (enforced by `test:readability`); contrast.
5. **Feedback**: every action has visible/audible response; errors explain what to do next.
6. **Parity**: compare phone, tablet, desktop (see `docs/PC-MOBILE-PARITY-AUDIT.md`).

## Method
Screenshots via Playwright at 390×844, 844×390, 820×1180, 1280×760; run `npm run test:modals`.
Use `ux-designer` for flows and `accessibility-specialist` for WCAG points.

## Output
Findings with screenshot paths and severity, then fixes; rule violations of `AGENTS.md` come first.
