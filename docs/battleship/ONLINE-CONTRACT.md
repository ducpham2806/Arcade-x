# Next milestone: authoritative hidden-state transport

The full protocol below remains a target. A staged 1vs1 foundation now exists in `server.ts`, `supabase/battleship/schema.sql` and `supabase/functions/battleship-room/`; it now has a browser client and room UI behind a disabled activation flag, and its primary API/private persistence are now deployed. The scheduler and real-account QA await explicit approval; see CLOUD-ACTIVATION.md. See P2-P3-CHECKPOINT.md for tested scope and activation gates.

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
