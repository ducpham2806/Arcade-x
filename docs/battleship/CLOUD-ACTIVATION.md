# Battleship: cloud activation checkpoint — 2026-10-21

The Battleship database foundation and primary API are now deployed to the existing Arcade-x Supabase project (`whjatkhhupeqfngakmee`). The source online flag is enabled for registered-account 1vs1 rooms after disconnect verification; the launcher has not been released. Retention and release checks remain pending. This checkpoint supersedes earlier statements that no backend had been deployed. No launcher or Netlify deployment occurred.

## Applied

- Migration `battleship_online_room_backend_v1` created only the Battleship private schema, three RLS-protected tables and seven service-only RPCs. Existing game schemas were not modified.
- Edge Function `battleship-room`, version 6, is ACTIVE with `verify_jwt=true`. It has no QA/account administration endpoint. Its normal routes verify registered users through Auth and bind their identities to seats.
- A dedicated 256-bit worker credential was generated inside the database and encrypted in Vault. Only its digest is available to the service-only verification RPC. No server credential was written into a browser artifact or Git.

## Verified on cloud

Metadata checks found browser SELECT=false on all three private tables, browser schema USAGE=false and browser EXECUTE=false on all eight RPCs. All three tables have RLS enabled. The worker digest matches the Vault credential; its plaintext was not returned by any query.

Four actual HTTP probes returned 401: missing token, malformed JWT, public anon JWT used as a user and a guessed worker credential. The guessed-worker rejection crossed the deployed handler and its service-only database RPC.

Two concurrently submitted native database CAS requests targeted the same fixture version: one succeeded and one was rejected. This checks the cloud database version guard; it is not a full concurrent gameplay test. The fixture used synthetic Battleship-only identifiers, was closed afterward and left zero active QA rooms. No Auth accounts were created.

The local suite now passes 90 checks, plus TypeScript: 24 engine, 17 tutorial/server, 12 persistence, 12 handler and 13 client/pipeline/bundle isolation and 12 presence checks. Local pipeline tests still use fixture Auth responses.

## Approval completed and cloud tests passed

The user explicitly approved the scheduler and disposable Auth account tests on 2026-10-21. Migration `battleship_online_timeout_worker_v1` installed pg_cron/pg_net and activated `battleship-room-timeouts` every 10 seconds. It invokes the Edge worker only when a room is due.

An isolated timer fixture progressed to turn 5 with a last event of `timeout` and zero shots, without any player snapshot requests. Four scheduled HTTP responses returned 200 and each reported one updated room. The fixture was then closed. The job had 68 successful executions at the final checkpoint; the final normal worker HTTP probe returned 200 with `updated=0`.

Real registered-account checks passed for create/join, seat binding, hidden enemy fleets, outsider read/write denial, readiness/deadline agreement, shot replay, worker access denial, reconnect and surrender. A complete scripted fleet match then passed in four batches: all five enemy ships sank, the winner was correct and retrying the winning action was harmless. Thirty actual shots were made; normal timeout processing remained active between test batches. Targets were selected from trusted fixture state strictly for protocol/result testing, not to assess bot fairness or game balance.

The initial runner hit its environment's request cap after its ten isolation/protocol checks. Splitting the full-match run into bounded batches resolved that test-harness limit. Three disposable accounts were used at a time; across diagnostic attempts nine were created and all nine deleted. A final database count found zero run-tagged Auth users and zero active rooms. No emails were sent. See `cloud-auth-reports.json` for sanitized reports, including the intermediate failures.

The temporary QA route was removed by deploying the normal four-file API as version 5. A request with a valid worker credential to the old QA operation returned 403; normal tick still returned 200. Continuation ciphertext was removed from transient QA responses. The continuation mechanism encrypted credentials with AES-GCM, expired after ten minutes, and never returned them in plaintext. No QA module is imported by the normal API or browser game.

No approval blocker remains for these completed operations. Remaining game work: disconnect grace/forfeit, retention and cron-history management, launcher integration release checks, then online UI activation. Matchmaking and online 2vs2 remain later milestones. The existing review HTML is unchanged and still labels its local room laboratory correctly.

## Advisor review

The three Battleship tables produce informational [RLS enabled without policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) findings. This is intentional default-deny: browsers have no grants and the trusted service role owns persistence. There were no Battleship SECURITY DEFINER warnings. Existing warnings in other game functions and Auth configuration were outside this change. See [database advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) for a separate platform review.

## Disconnect/reconnect completed

Migration `battleship_presence_and_reconnect_v1` and normal Edge version 6 are live. A server-authoritative heartbeat is throttled to five seconds and does not increment gameplay version or reset the turn clock. At 90 seconds a single absent battle player forfeits; both absent players close without a winner. Disconnect during preparation cancels without a winner. Returning before expiry recovers the filtered room; returning at or after expiry cannot revive it. The 10-second worker cadence can delay background closure by up to its scheduling/network latency; requests enforce the boundary immediately.

Expiry CAS rechecks the latest heartbeat under the room row lock and preserves newer heartbeat metadata when ordinary gameplay races it. Cloud checks verified single-player forfeiture, both-player abandonment with null winner/zero shots, and rejection of a stale forfeiture after a recovered heartbeat. All five presence fixtures are closed. Browser execution remains denied for all eight room RPCs.

Final local result: 90 checks and TypeScript pass. Mobile review QA created/joined a room, prepared both fleets, fired one shot with exactly one turn change, and verified the 90-second notice. Both canvases remained present; game width and scrollWidth were 360px inside the 390px frame. Actual-online entry correctly requires a registered Arcade-x session. The review local laboratory is still explicitly labeled as simulation.

Automatic approval review rejected reintroducing the temporary privileged Auth QA route for a current-version rerun. No route was restored and no new Auth accounts were created. Safer room-fixture/worker/database checks completed instead. Earlier real-account checks document version 5; version 6 has not been retested with real accounts. No launcher deployment, main merge, physical-device test, retention cleanup or matchmaking/online 2vs2 delivery is claimed.

## Maintenance and temporary QA tooling — 2026-10-21

Migration battleship_reversible_maintenance_v1 is live. The hourly owner-only maintenance archives closed rooms and completed Battleship cron history older than seven days and removes stale transient rate windows. An actual cloud fixture was archived with full recovery marker intact; repeat invocation changed nothing. The hourly cron is active; a future scheduled run has not yet been observed. No active rooms were present or modified. Archives have RLS and no browser/service grants. Archive storage is retained; no permanent purge/export policy is enabled. See MAINTENANCE.md for limits, pause and restoration.

97 local checks plus TypeScript pass (seven new maintenance/bundle checks). Temporary QA builder can generate an explicitly requested ten-minute worker-protected wrapper while leaving the canonical normal API unchanged. QA is still closed on Edge v6; no new Auth accounts were created. QA-ADMIN-GUIDE.vi.md explains exact open/test/close steps without exposing service or worker credentials. Launcher publication and physical-device release tests remain pending.

## Casual matchmaking — current Edge v7

Migration battleship_casual_matchmaking_v1 and the normal four-file API are live with JWT verification. No QA route or new Auth account was used. The service-only ninth room RPC atomically pairs public queue rooms while preserving friend-room isolation. A live waiting fixture and two concurrent native SQL requests produced one two-seat match and one remaining waiting room; both rooms were closed. Browser queue-RPC execution is denied. Current total: 111 local checks and TypeScript pass; mobile local laboratory search/cancel/research/pair passed. Real-token HTTP and physical-device pairing checks remain pending. No main merge or launcher deployment occurred. MATCHMAKING.md and P2-P3-CHECKPOINT.md describe current scope.

## Online squad rooms — current Edge v8

Migration battleship_online_squad_rooms_v1 and the normal four-file API are live, JWT verification enabled, QA route absent. Four-seat room creation/join/team switching and team-safe commands are implemented. The service-only persistence now handles squad returning-seat heartbeat and atomic delegated-shot guards and ignores explicitly departed seats in active-identity constraints. The existing nine room RPCs retain browser execute denial.

133 automated checks plus TypeScript pass. Three live synthetic squad fixtures showed recovered-seat stale-takeover rejection, worker victory for a wholly missing team, and cancellation/no winner for both teams missing. All fixtures closed; no new Auth accounts. Mobile local four-player QA created/joined/prepared all fleets and fired A1 and B1 with proper A2 teammate-turn status. ONLINE-SQUAD.md has the full behavior and limits. No current four-real-account/device test, main merge or launcher publication was performed.
