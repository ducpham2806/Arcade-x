# Online matchmaking and move synchronization — 2026-10-15

## Root causes and repair
The old queue scanned once before writing its own waiting entry. Two simultaneous
entrants could both see an empty list, then wait forever because no later scan ran.
Both Caro and the standard chess/Xiangqi service had that flow.

Both now use startOnlineQueue: publish before scanning, scan every three seconds,
read both entries with CAS, and create one room plus claim both entries in a single
commit. A per-search token protects a replacement search from old cleanup callbacks.
Waiting timestamps use the server transform; queue heartbeats do not run while
probing to avoid unnecessary CAS conflicts. Elo expansion accounts for either
entrant's wait. Matched entries can recover an existing active room.

Chess previously mutated its local board and ignored false/failed move commits.
Rejected writes could leave the local board ahead of the server. It now locks an
in-flight move, waits for acknowledgement and restores the pre-move board after a
failure unless a newer authoritative board has already arrived. The common move
bridge checks the expected board before commit, reports errors and clears stale
errors on a successful snapshot. Xiangqi and Caro surface failed sends too.

Online subscriptions use Realtime invalidation plus a 1.5-second polling fallback,
refresh on focus/network return, and distinguish degraded Realtime from fatal
queue errors. Realtime degradation does not cancel an otherwise usable queue.

## Actual server verification
The configured Arcade-x project's arcadex_read/commit/bind functions, participant
membership, SELECT/RLS policy and Realtime publication were inspected. Two separate
anonymous sessions could bind different guest profiles and read each other's queue.
The repair needed no schema migration or weaker access policy.

The real client service code (isolated identity adapters only) then passed:
- simultaneous queue entry for Caro, chess and Xiangqi: same room, one delivery each;
- host and guest moves visible from the other's authenticated session;
- out-of-turn moves rejected; stale expected-board writes rejected in standard games;
- observer subscription/polling delivered the final board for all three games.

No test completed a ranked match or awarded Elo. The four audit identities, their
bindings, queue entries and three rooms were removed after testing.

Run the live audit deliberately with `node tests/online/live.mjs --live`; it creates
isolated anonymous audit identities and writes a cleanup list under /tmp. Admin
cleanup is required after a manual run. Do not add it to normal CI.

TypeScript, production build and the existing duel engine/DOM/worker checks passed.
This verifies service/backend transport, not manual two-browser/touch play. Existing
production hosting remains separate from the reviewed HTML and main source update.
