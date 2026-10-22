# Eat Em All — encounter rhythm v6

Implemented in the agreed order: individual fall speeds, authored bursts and recovery gaps, overtaking pairs, then four boss attack cycles.

## Fall and pacing

Each campaign object receives a deterministic speed and interval from its stage and sequence. Slow/normal/fast/rush use factors of 0.65–0.85 / 0.95–1.10 / 1.25–1.50 / 1.65–1.85 against stage speed. Rush begins in chapter 3. Stages 1–2 use only normal speeds (0.85–1.15) and remain hazard-free. Travel lasts at least 1.25 seconds. Fast and rush drops announce their lane with an icon for 0.32 and 0.55 seconds, respectively, and have visible trails.

Twelve-drop phrases alternate lead-in, compressed bursts, feints and recovery. Intervals range from 230 to 1850 ms; the base burst factor is 0.37 and recovery 1.65. At 80% quota, bursts become a 0.31 climax. Recovery stages have extra space. The first four objects are paced gently. Retry preserves the seed; collected targets and elapsed boss time can affect later scheduling.

From stage 3, non-boss phrases pair a slow object with a faster one in the same lane and element. The second arrives first. Same-element pairs avoid a forced instantaneous mode change. Other traffic can make the safety scheduler relocate a drop. Spawn safety projects catch windows, separates opposite elements/hazards, and delays a spawn by 150 ms when no lane is suitable. It also rejects hazards that would cover all five lane centers. This is a heuristic, not a proof that every human route can collect all goals.

## Boss cycles

| Chapter | Attack | Warning / attack / open / recovery | Behavior |
| --- | --- | --- | --- |
| 1 | Rễ siết | 1.6 / 1.4 / 5.0 / 2.0 s | Root barrage with a shifting safe lane |
| 2 | Búa đôi | 1.8 / 2.1 / 5.7 / 1.8 s | Two edge lanes attacked; center respite |
| 3 | Thủy triều | 2.2 / 1.8 / 6.2 / 2.0 s | Alternating poison lanes and sideways drift |
| 4 | Nhịp gãy | 1.6 / 1.4 / 4.8 / 1.8 s | Alternating attack lanes; core changes element halfway through its open window |

Boss lane tint/chevrons announce attacks; damage comes from the falling hazards. Chapter 4 gives a 0.65-second core-switch notice. Food types account for predicted arrival phase. Failure shows one concise hint: a near-complete missing quota, ready Fury, or fast-object priority.

## Validation

`npm run test:eat` checks 24 stages at 30/60/120 Hz for resource/time feasibility, 180 overtaking pairs, deterministic speed variety, four boss cycles, and 48 avoidance schedules at 360px and 900px widths. The resource collector is idealized; avoidance simulation checks only bomb/poison escape and does not establish human win rates. Existing economy, UI-flow and victory tests remain included. Isolated TypeScript and standalone export syntax pass. Actual Canvas2D rendering executes at 30/60/120 Hz with matching tutorial catches, correct foreground order and victory pose. Browser touch/CSS QA, device performance and human difficulty calibration remain unverified. No production deployment.

Reward values, free retries, one-tap Next and the 1.5-second victory presentation are retained. Standalone preview uses a stub bridge; its currency does not affect the Arcade-x account.
