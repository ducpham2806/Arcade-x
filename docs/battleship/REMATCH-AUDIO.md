# Rematch and audio — 2026-10-21

## Player behavior

After an ordinary finished match, every participant may confirm or withdraw a rematch for 120 seconds. Two confirmations are required in duel, four in squad. Everyone retains their team and seat, enters a new preparation phase and places a fresh fleet. The first seat rotates by one. Old results remain intact. Cancelled/disconnected rooms and rooms with departed seats cannot restart this way. A participant already in another active room prevents creation; the result dialog explains the error. The 120-second invitation is a product default to evaluate during playtesting.

Consent receipts, all-member locks and child creation are one database transaction. Lost responses and duplicate final confirmations resolve to the same child. Snapshot refresh of the old room follows its child, and a retry of the old winning command returns the new room without replaying it. The service-only RPC never grants browser database access. Redirects follow up to eight linked rooms per request; long rematch chains should resume using the latest room ID retained by the client.

## Audio prototype

Native WebAudio is an isolated adapter behind named gameplay events: launch, hit, miss, sunk, own turn, win/loss, placement and ready. No new licensed recordings or music are used. This is a procedural playtest sound pass, not a finished cinematic mix or FMOD integration. Gameplay owns events; the adapter owns graph, voices and lifecycle, allowing replacement with authored audio later.

AudioContext is created/resumed only after a user gesture. Local mute persists; launcher mute, pause, inactive simulated client and document visibility also gate playback. Muting/hiding stops current and scheduled voices and suspends output; becoming visible requires another gesture. Leaving disposes the context. Unsupported audio fails quietly. Every voice has a finite stop time, maximum eight current/scheduled voices, master gain 0.12; no loops or ticking countdown. No actual loudness/clipping certification is claimed.

Fresh accepted shots emit one launch plus impact aligned to the remaining 720ms missile flight; reduced motion removes flight delay. First/rejoined snapshots are silent, and muted history is consumed so reconnecting or unmuting does not replay old shots/results. Sound remains optional; all outcomes and turns are visible without it.

## Evidence and release limits

- 14 rematch checks: actual handler/client with PostgreSQL/PGlite and fixture Auth; duel/squad consensus, replay, uncertain response, expiry, active-room exclusion and privilege denial.
- 10 audio checks: pure event tracker plus injected fake WebAudio validates gesture gate, finite sources, eight-voice cap, mute/pause/hidden/exit behavior and history deduplication.
- Live cloud synthetic UID fixture: two independent concurrent final confirmations returned one child; empty fleets/shots/readiness, parent result preserved, browser RPC denied, fixtures closed. No Auth users created and no privileged QA route enabled.
- Mobile browser local lab at 390px: all four players prepared, team surrendered with two votes, rematched with four votes, returned to 0/5 fleet and 0/4 readiness. Two canvases and width=scrollWidth=360. First voter also followed the new room. Audio state running after gesture, muted after toggle; returning to a simulated player required Resume audio.
- TypeScript and standalone review build pass. Total automated checks: 157. Full launcher build, four registered-account live flow, actual iOS/Android listening, headphone mix and network/performance tests remain before publication. No main merge or launcher publication performed.
