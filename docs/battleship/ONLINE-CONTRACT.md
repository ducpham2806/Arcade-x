# Next milestone: authoritative hidden-state transport

Current implementation supports registered-account 1vs1 rooms and casual matchmaking. Normal Edge v7, persistence, timeout worker, presence and archive maintenance are live. Source/review UI is updated; the launcher has not been published. Online 2vs2, rematch and team pings below remain targets. See P2-P3-CHECKPOINT.md and MATCHMAKING.md for current scope.

## Server state

Keep State from engine.ts in a private store; bind authenticated user IDs to seats. Only the server may call fire/advanceTime for an online match. The browser receives a viewFor DTO filtered to its own team and publicly sunk enemy hulls. Never send the full State or bot placements to an online client. The full engine state in the browser is intentional only for offline practice.

## Commands

CreateRoom {mode}; JoinRoom {roomCode}; Queue {mode,partyId?}; CancelQueue {requestId};
Place {matchId,shipType,row,col,horizontal,version,actionId}; Ready {matchId,ready,version,actionId};
Fire {matchId,row,col,turnId,version,actionId}; Rejoin {matchId,lastVersion};
TeamPing {matchId,row,col,actionId}; ProposeSurrender/AcceptSurrender {matchId,proposalId};
Rematch {matchId,actionId}.

Actor is derived from the authenticated session. Ignore any client-supplied actor/team/result/deadline. Check room membership, ruleset, phase, action ID, turn ID/version and receive time in one atomic transition. Reply with {accepted,version,view,lastEvent,serverNow,deadline} or a typed rejection. The same accepted action ID returns its original result even after the turn advances.

## Timer and reconnect requirements

A server scheduler must progress expired turns even with every client closed. Keep deadlines absolute; animation durations never change them. Decide the exact-at-deadline race inside the same transaction/lock as shot acceptance. Reconnect returns fresh filtered snapshot plus version; missing events trigger a snapshot reload.

1vs1: reconnect grace proposal 90s, turns continue and time out normally; grace expiry forfeits a disconnected player. 2vs2: grace then teammate may control the absent seat, without changing rotation. Both teams absent -> cancel; no winner claim from a client. These rules require backend tests before activation.

## Tests before shipping

4 independent accounts, unauthorized room reads, enemy board REST/subscription access, late shot/timeout race, replayed action IDs, duplicate queue/room joins, five players joining four seats, friend party preservation, missing realtime events, tab suspension, reconnect at victory, both teams disconnect, result exactly once, and consistent entitlements.

## Presence checkpoint — 2026-10-21

See CLOUD-ACTIVATION.md for the current authoritative status. Disconnect/reconnect grace is 90 seconds, independent of the 30-second shot clock. A single absent battle player forfeits; both absent close without a winner; preparation absence cancels. Heartbeats use a service-only RPC, five-second write throttle, no gameplay version increment and an atomic expiry guard. Apply presence.sql after schema.sql/worker.sql. Normal Edge version 6 and presence migration are live. The online flag is enabled in source, but no launcher deployment occurred.

Validation: 90 automated checks plus TypeScript; cloud worker and presence/CAS fixtures; 390px browser room create/join, prepare and fire. Actual v6 Auth-account rerun was blocked by automatic review; v5 account evidence is historical. Remaining work: retention/cron-history management, release checks and physical-device network/performance playtests, then matchmaking and online 2vs2.
