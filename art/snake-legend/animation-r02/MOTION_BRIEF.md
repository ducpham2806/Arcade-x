# Character animation handoff — R01

Status: prepared; no video generation route available in this session.
The capability check reported video `none`, and resolve --kind video returned
`status: no-route` (exit 3). Do not substitute a character sheet or claim finished
animation. Existing A1 stills remain the accepted identity references.

## Tiểu Xà

Reference: a1_master/head, body, tail from src assets; light upper left, green
painted scales, cream mouth, same eye proportions, top-down facing right.
Idle: 1.2s seamless, gentle blink and tongue flick, fixed neck registration.
Dash: 0.6s seamless, determined eyes, subtle cheek squash, no translation or FX.
Eat: 0.3s one-shot, mouth opens then closes; return exactly to idle rest pose.
Keep all actions at the existing head size 1.35u, fixed center (0.5,0.5).

## Nhện Mẹ

Reference: a1_master/spider_mother; purple body, eight legs, gold joints, cream
face, jade/leaf marks, top-down facing screen-bottom. Same abdomen proportions.
Idle: 1.6s seamless, alternating mirrored leg-pair micro shifts and breathing.
Telegraph: 0.8-0.9s engine-owned, legs brace and body lowers, root fixed.
Attack: 0.45s, face leans forward then settles; no generated thread/projectile.
Recovery: 1s, legs uncurl into the idle rest pose.
Weak: 2s loopable, underside clearly exposed; do not paint the gameplay ring.
Hurt: 0.6s one-shot, recoil returns forward, never reverse attack frames.
All frames share source pivot (0.5,0.3), size 7.2u. Clip alpha must preserve moving
leg edges. Root movement <=0.12u. Damage, weak trigger and timing remain engine-owned.

Before integration: key/registration QA, identity/leg-count review at 24/48/96px,
three-loop seam review, light/dark alpha review, packed PNG atlas size <=1024x1024
per character, no per-frame bbox resizing, reduced-motion still fallback. Retain
raw clips and prompts, then select/finish/package with video2dsprite.

## Runtime follow-up14/11/2026

[Articulation rig](RUNTIME-RIG.md) adds code-authored motion on the existing master while the video route remains unavailable. Original rawclip/frame requirements above are not claimed complete by this alternate runtime implementation.
