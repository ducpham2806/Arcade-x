# R01 · content inventory · 14/11/2026

Scope: the existing10-level Thảo Nguyên Xanh chapter. The owner explicitly confirmed “Hoàn thiện trọn R01 hiện tại” on14/11. Finish this chapter rather than adding another map/boss/shop.

## Content available in the candidate

| Level | Authored play content | Player-facing read / closure |
|---|---|---|
| 1-1 | Collect5apples, find exit | Steering/continuous travel; first success leads to Dash |
| 1-2 | Length10, optional gold, Dash star | Energy/release/turning; deliberate speed |
| 1-3 | Length12, fence route, clean-body star | Wide turns, sliding walls; managing a longer tail |
| 1-4 | Length15, poison/optional gold | Poison−2without heart loss; safe outer route |
| 1-5 | Collect8flowers, regrowing apples | Flower vs growth goal; return to central exit |
| 1-6 | Latch switch, persistent open barrier | Switch stays on; return route does not require holding it |
| 1-7 | Cross3distinct bridges | Align before crossing; water failure and island recovery |
| 1-8 | 45s golden rain, optional secret | Automatic time-based finish; rain shadows and optional jade |
| 1-9 | Length20, spider warning/chase/trap | Web slows player, traps enemy; optional technique star |
| 1-10 | Nhện Mẹ3phases/6hits, weak point, exit | Shot warning, web bait, length16/anchors A+B; chapter resolution |

All10have an intro, lesson, optional third-star task, field notes and a distinct win conclusion. `chapter-content.ts` adds presentation copy outside the signed story-data envelope so dialogue changes cannot invalidate checkpoints or alter verifier content signatures.

## Character motion

`character-motion.ts` uses the same painted A1 master. Tiểu Xà adds blink/tongue/chew/Dash/loss/win expressions. Nhện Mẹ articulates8registered limbs and retains the body/face pivot through all8encounter states. Reduced motion preserves the static boss master, suppresses cosmetic head/celebration motion and retains essential attack/weakness cues.

This is a code-authored Canvas rig, not image-to-video output or independently authored animation sheets. Source pixels and atlas metadata remain unchanged. The original [motion brief](../../art/snake-legend/animation-r02/MOTION_BRIEF.md) still records the unavailable video route; [runtime route](../../art/snake-legend/animation-r02/RUNTIME-RIG.md) documents the implementation and budgets. Final human art/animation sign-off is still required.

## Ending and replay

Clearing all10shows the chapter's resolution and earned star total. 29/30recommends the first level with a missing star; 30/30offers replay without resetting best scores. Secret text reflects the saved secret rather than awarding it from the ending UI. The final result leads to “Xem kết chương”; if the clear cannot be stored, the new transition must retry/keep the result until durable storage succeeds.

Phone entry shows the chapter conclusion before the route; choosing a mastery level brings its detail and Play button into view. The existing scroll body handles long copy; no new full-screen modal or changing outer frame is introduced.

## Existing assets and remaining acceptance

Props A2, terrain, food, spiderling,14SFX and launcher artwork are reused. This patch does not compose a soundtrack, generate video, grant game/launcher currency, add new levels, deploy backend or change save formats. Production audio listening, authored-video work if retained as a separate deliverable, human M2 and physical Android/iPhone/FPS/heap remain open; code/fixture success does not close those gates.

[Technical evidence](../qa/SNAKE-R01-CONTENT-2026-11-14.md), [acceptance](R01-ACCEPTANCE.md), [task card](../plans/SNAKE.md).
