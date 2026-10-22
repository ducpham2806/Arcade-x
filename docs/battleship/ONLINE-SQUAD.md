# Online 2vs2 rooms — v1, 2026-10-21

## Player experience and protocol

A registered user creates a private squad room and shares its six-character code. The host stays A1. Guests choose an available team or use automatic seating; unfilled guest seats may change team during the waiting lobby. Four occupied seats start preparation automatically. Fewer players cannot see/place fleets or start battle. Leaving or exceeding reconnect grace during lobby/preparation cancels the room without a winner; the current version does not replace players mid-match.

Teams are A1+A2 and B1+B2. The existing squad rules use a 14×14 sea, ten ships per team and five per player. Seats ending in 1 place only in rows A–G; seats ending in 2 use H–N. The renderer shades the other sector and outlines teammate ships. All teammates see the entire friendly board; enemy hulls stay private until sunk. Only the actor's own five ships may be edited, cleared or readied. Four ready votes start battle, or the existing 180-second preparation deadline auto-fills missing fleets for present players.

Turns follow A1 → B1 → A2 → B2 from a random initial seat. Each turn remains thirty seconds; a hit changes turn and expiry skips without firing. Public snapshots include roster seats/readiness and connection timestamps, never UIDs, full state, match request metadata or unrevealed enemy hulls. Online squad room creation/join uses the same registered-Auth binding, write budgets, CAS version and action receipts as 1vs1. Casual automatic matchmaking remains 1vs1 only.

## Team safety

- A single missing squad member does not forfeit the whole team. During battle, after ninety seconds the connected teammate may fire for that missing seat only when its turn arrives. The server derives this control; the client cannot choose its actor. Returning to an open match refreshes presence and revokes temporary control. Original seat rotation and deadline do not change.
- A takeover CAS checks the missing seat's latest heartbeat under the room row lock. A stale delegated shot is rejected if that player already returned, even though presence updates do not increment gameplay version.
- Explicit Leave marks that seat departed and allows immediate teammate control. The departed identity cannot submit more commands except safe replay of an already accepted action. Its active-room slot is released for another room while the previous team continues.
- If both members of one team are absent past grace or have left, the other team wins. If both teams are wholly absent, cancel with no winner. The worker selects whole-team absence and turn deadlines, avoiding repeated HTTP ticks solely because one seat is missing.
- Surrender requires both teammates' votes. A vote can be withdrawn until the second is accepted. Votes are shown only to their own team. A player cannot vote for another seat or the opposite team. If the only remaining player wants to exit, explicit Leave ends the remaining team's participation.
- Waiting-room cancellation, preparation cancellation and explicit departure are surfaced separately from a normal fleet victory. The UI always shows own/enemy/teammate turn and indicates delegated control.

## Validation and deployment

133 automated checks and TypeScript pass; twenty-two new four-client HTTP-handler/PostgreSQL-PGlite tests cover lobby/team races, fifth join, team ownership/sector limits, shared views, four-way rotation, takeover and return, atomic heartbeat rejection, surrender agreement, leaving/released identity, worker team loss and abandonment. Fixture Auth is used locally, not real accounts.

Migration `battleship_online_squad_rooms_v1` replaces only existing room create/CAS/touch/due/match functions and indexes using canonical schema/presence/matchmaking SQL. Normal Edge v8 is live with JWT verification, no QA administration route and no new Auth accounts. Cloud synthetic squad fixtures verified one lost-team worker victory, both-team cancellation with null winner, successful recovered-seat pulse and stale takeover-CAS rejection. All fixtures were closed. Browser execution stays denied on private-state RPCs.

At 390px, browser RoomLab QA created a squad, joined B/C/D by code, prepared/readied all four players, fired as A1 and B1 and observed A2 teammate turn. A1's own-fleet count stayed 0/5 while A2's five ships were present, then became 5/5 after auto-placement. Enemy fleet count is ten; two boards remain present, width=scrollWidth=360px.

The review laboratory is explicitly a local four-player simulation. No current-version four-real-account network test, physical-device performance pass, full launcher build, main merge or launcher publication is claimed. Remaining work includes rematch, sound, squad party matchmaking/team pings and release verification. No ranked/economy feature was added.
