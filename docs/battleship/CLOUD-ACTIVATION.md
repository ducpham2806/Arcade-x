# Battleship: cloud activation checkpoint — 2026-10-21

The Battleship database foundation and primary API are now deployed to the existing Arcade-x Supabase project (`whjatkhhupeqfngakmee`). The frontend online flag remains off. This checkpoint supersedes earlier statements that no backend had been deployed. No launcher or Netlify deployment occurred.

## Applied

- Migration `battleship_online_room_backend_v1` created only the Battleship private schema, three RLS-protected tables and seven service-only RPCs. Existing game schemas were not modified.
- Edge Function `battleship-room`, version 1, is ACTIVE with `verify_jwt=true`. It has no QA/account administration endpoint. Its normal routes verify registered users through Auth and bind their identities to seats.
- A dedicated 256-bit worker credential was generated inside the database and encrypted in Vault. Only its digest is available to the service-only verification RPC. No server credential was written into a browser artifact or Git.

## Verified on cloud

Metadata checks found browser SELECT=false on all three private tables, browser schema USAGE=false and browser EXECUTE=false on all seven RPCs. All three tables have RLS enabled. The worker digest matches the Vault credential; its plaintext was not returned by any query.

Four actual HTTP probes returned 401: missing token, malformed JWT, public anon JWT used as a user and a guessed worker credential. The guessed-worker rejection crossed the deployed handler and its service-only database RPC.

Two concurrently submitted native database CAS requests targeted the same fixture version: one succeeded and one was rejected. This checks the cloud database version guard; it is not a full concurrent gameplay test. The fixture used synthetic Battleship-only identifiers, was closed afterward and left zero active QA rooms. No Auth accounts were created.

The local suite now passes 78 checks, plus TypeScript: 24 engine, 17 tutorial/server, 12 persistence, 12 handler and 13 client/pipeline/bundle isolation. Local pipeline tests still use fixture Auth responses.

## Awaiting explicit approval

Automatic approval review rejected two actions:

1. A temporary worker-protected QA deployment that could create and delete three disposable Auth users on the shared project. The reviewer identified insufficiently narrow authorization and the risk of a privileged test endpoint. That deployment did not occur; its temporary source was removed. The primary API was separately deployed without it.
2. Installing pg_cron/pg_net and scheduling a recurring request every 10 seconds. The reviewer identified insufficient authorization for scheduler activation and its operational effects on the shared project. That migration did not run. A cloud query confirmed neither scheduler extension is installed. No alternative timer mechanism was activated.

The prepared scheduler template makes no HTTP request when no room is due. Its public anon JWT passes only the Edge gateway; the separate Vault worker credential is also required. This remains uninstalled pending approval.

Next: obtain approval for those concrete operations, activate/observe the scheduler, run real-account hidden-state/reconnect/result tests, remove the temporary QA capability immediately afterward, and only then enable online UI. Disconnect grace, retention cleanup, matchmaking and online 2vs2 remain open work.

## Advisor review

The three Battleship tables produce informational [RLS enabled without policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) findings. This is intentional default-deny: browsers have no grants and the trusted service role owns persistence. There were no Battleship SECURITY DEFINER warnings. Existing warnings in other game functions and Auth configuration were outside this change. See [database advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) and [password protection guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) for a separate platform review.
