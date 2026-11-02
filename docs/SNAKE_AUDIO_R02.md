# R01 audio feedback R02 — 2026-11-02

Three new named events now accompany real engine changes: a filtered air swoosh
on the first active Dash tick, a warm modal bell when the boss weakness opens,
and a lower wooden/gong accent when the boss changes phase. Holding Dash does
not loop the cue. Damage, victory and other critical events keep priority.

The setting remains opt-in and uses the existing saved volume/mute preferences.
There is no background audio loop or automatic context creation. Settings now
span the full game frame on mobile and include an explicit **Nghe thử** button.
This menu preview can play while gameplay is paused; closing settings, muting,
zeroing volume, host pause or teardown cancels pending previews.

## Implementation and production route

The three clips are generated offline by [build-snake-audio.py](../scripts/build-snake-audio.py)
using seeded filtered noise and damped inharmonic resonances. They are procedural
audio, not AI-generated recordings or licensed external samples. The script
records the source hashes and measurements in [manifest.json](../art/snake-legend/audio-r02/manifest.json).
There are no square/saw oscillators or runtime synthesis loops. Existing eleven
SFX remain; this iteration does not claim a replacement of the whole audio bank.

| Cue | Duration | Source bytes | Source peak |
| --- | --- | --- | --- |
| Dash | 0.30s | 26,504 | 0.179993 |
| Weakness opens | 0.62s | 54,728 | 0.190002 |
| Boss phase change | 0.82s | 72,368 | 0.179993 |

All new sources are mono 44.1kHz PCM16 with zero-valued first/last samples and
shaped attack/release envelopes. Total new bytes are 153,600, within the 180 KiB
budget. A [2.44s listening reel](../art/snake-legend/audio-r02/listening-reel.wav)
plays Dash, weakness, then phase transition, with silence between them. Listening
on physical speakers/headphones and final subjective mix approval remain open.

## Mixer lifecycle and budgets

- Four managed one-shot voices maximum. Each event declares cooldown, priority,
  voice limit and gain. Lower priorities cannot evict a full critical set.
- Tiny bounded pitch/gain variations avoid exact mechanical repetition. They
  live in the audio mixer and cannot affect simulation or verifier output.
- The master bus connects once, decoded buffers are cached, and failed decodes
  wait for the full bank to settle before retrying only missing buffers.
- `resume()` is invoked synchronously from the initiating gesture before decode
  or cloud-preparation awaits. This is an implementation improvement, not an
  iPhone/Safari autoplay certification.
- Master/host gain stays <=1; SFX gain <=0.8; all source peaks <=0.199982. The
  conservative four-voice sum bound is 0.639942 full scale (about -3.88 dBFS),
  before the default 45% user gain. No limiter or new DSP chain is introduced.
- The full bank is estimated at 1,262,928 decoded bytes at 48kHz mono, within
  the 2 MiB target. The real Chromium context reported 1,160,296 decoded bytes
  across all fourteen buffers. Other device rates and CPU timings need profiling.

Native Web Audio named-event mixing is retained under the prototype exception
of the sound-designer skill. Production middleware/music/ambience sign-off is not
implied. The patch adds no polling, account reads, database writes or intervals.

## Verification

`npm run test:snake-audio` passes source equality, PCM/peak/memory budgets,
opt-in gesture unlock, single bus/decode caching, menu-preview isolation,
cooldowns, per-event caps, priority ceiling, mute/volume/pause cleanup, late decode
cancellation, concurrent failure/retry behavior and actual engine Dash/boss
transitions. Audio snapshot reads/events do not mutate engine checkpoints.

Props, boss, journey and cloud regression tests pass. TypeScript, Snake preview
build and preview-package checks pass. The standalone HTML export is 2,178,176
bytes, includes its assets, and excludes React/account clients. No engine,
content-signature, map, replay verifier, reward or save-protocol change is included.

Real Chromium QA before the preview interruption:
- Initial audio-review screen reported `uncreated`, 0 buffers and 0 voices.
- Clicked all three new event buttons. Fourteen buffers decoded; playback started.
- Tạm dừng âm reported `suspended`, 0 active voices.
- In the real story settings at a 360x800 iframe, Nghe thử was disabled with
  sound off, enabled after checking Bật âm thanh, and reported successful playback
  from the paused menu. This covered the full-frame settings implementation.

The internal preview then stopped serving files (404, later connection refused).
A managed stop/start restored a response but still returned 404 for the known
HTML entry despite the local file existing. Final standalone browser boot and
screenshot capture are therefore not verified in this iteration. The tested
source, build/package checks and exported file are retained; no alternate server
or browser-control method was substituted.

## Open release gates

M2 still requires human audio listening/mix approval, physical Android/iOS/Safari
checks, authored character/boss animation, terrain polish and full-account
launcher UI play/save/reload. This is a completed SFX-feedback iteration, not a
release-ready game or a completed overall roadmap. No production deployment.
