# R01 audio feedback R02

Sonic identity: soft, organic, readable. Preserve the existing opt-in sound
setting; no autoplay, background beep loop or external audio request.

New non-diegetic feedback events:
- dash: one short filtered air swoosh on the rising edge of actual Dash.
- bossWeak: warm inharmonic bell when the existing weak state opens.
- bossPhase: low wooden/gong accent when the phase number increases.

Budget before production: <=4 managed SFX voices; each event has an explicit
cooldown, priority and limit. New files <=180 KiB total, mono 44.1kHz PCM16, <=1s
per cue, peak <=0.20 full scale. Whole decoded bank <=2 MiB. No timers, polling,
loops or runtime synthesis. Existing native Web Audio event mixer is retained for
this prototype; middleware and device profiling remain release gates.

Production route: deterministic offline physical/modal synthesis with NumPy and
SciPy (filtered air + damped inharmonic resonances); no AI audio generation is
claimed. No square/saw oscillators or chiptune loop. Source script is reproducible.
All timing/damage/state decisions remain in the engine, never in the audio bank.
