# Battleship development status — 2026-10-21

This file is the current status; prior checkpoint wording is retained in Git history. Evidence is in CLOUD-ACTIVATION.md, cloud-deployment-results.json and individual test reports.

| Work item | Current state |
|---|---|
| Core ship placement, rotation, firing, sinking, victory, 30-second turns | Implemented and tested |
| Bot 1vs1, local 2vs2 practice with three bots | Implemented |
| Mobile two stacked boards, tap mini to swap, direct tap to fire, contextual rotation | Implemented; browser QA |
| Steel US/JP-inspired hull art, ocean/missile/impact/fire effects | Integrated; physical-device performance/art review pending |
| Interactive seven-step tutorial | Implemented |
| Online 1vs1 by room code | Backend and source UI implemented |
| Registered-account binding, hidden enemy fleet DTO, request budget, atomic actions/replay | Implemented; historical v5 real-account test and current local pipeline tests |
| Background turn worker, 90-second reconnect grace/forfeit | Live backend |
| Reversible cold archive of closed rooms and cron logs | Live owner-only hourly maintenance; permanent archive purge/export policy pending |
| Casual 1vs1 matchmaking | Implemented this milestone; SQL migration and current normal Edge v8 live; source/review UI updated |
| Online 2vs2: four seats, team lobby, team visibility, reconnect/team controls | Implemented by room code; see ONLINE-SQUAD.md |
| Online rematch and optional team pings | Not implemented |
| Sound pass and mobile audio lifecycle/mute validation | Pending |
| Real-account test of current backend, full launcher build, device network/performance QA | Pending before release |
| Main merge and launcher publication | Not performed |

## Latest result

133 automated checks plus TypeScript pass. The 14 new tests cover pairing, duplicate requests, uncertain responses, cancellation races, private-room isolation, absent hosts, queue grants, request budget and gameplay after pairing. Real cloud SQL contention selected one winner for a waiting seat; the other caller remained queued. Test rooms were closed and no new Auth accounts created. Mobile browser QA found/cancelled/restarted and paired two simulated players with both boards visible and no horizontal overflow.

The QA administration route remains closed. It is not required by players or matchmaking. Current v8 four-account token/device tests remain a release check; do not present local Auth fixtures or synthetic SQL UIDs as a real account/device test.

## Next sequence

1. Add online rematch and sound; validate mobile audio permissions/lifecycle and muted mode.
2. Finish four registered-account/device and full launcher integration checks; prepare a limited release. Keep source work on the development branch until release.
3. Extend casual matchmaking to squad parties and optionally add team pings; current automatic queue remains 1vs1.

The fixed 30-second turn rule and the approved mobile board layout remain unchanged. Avoid adding ranked ratings or monetization to this game milestone.

## Latest squad follow-up

Online 2vs2 by code now supports a four-seat lobby, team choice/switch before filling, shared 14×14 friendly boards, four ready votes, thirty-second rotation, delegated absent-seat firing with an atomic heartbeat guard, and two-vote surrender. Active-room constraints exclude explicitly departed seats so leaving does not block joining a new room. The normal Edge v8 and squad migration are live. Twenty-two additional tests pass, and cloud worker fixtures for single-team loss/both-team abandonment and a stale takeover race pass; no new Auth users were created. Mobile browser QA joined four simulated players, prepared all fleets, fired two turns and showed the teammate turn without horizontal overflow. See ONLINE-SQUAD.md.
