# Snake save/session QA — 2026-11-02

Baseline: local campaign hydration commit `8698e84` on `feat/snake-cloud-progress`.
SDK: Supabase JS/Auth 2.117.3. Target checked against launcher public config:
`whjatkhhupeqfngakmee` (Arcade-x, PostgreSQL 17.11.0.003).

## Real service checks completed

The opt-in runner uses the real R01 engine, real Auth session, LauncherSnakeBinding,
HostCompletion, replay recorder/outbox, deployed snake-complete verifier and database.
The renderer/full launcher DOM is not involved in this runner.

A reserved disposable email fixture was created only after Auth settings confirmed
email auto-confirm, so no email delivery was requested. Its existing service-only
Snake test-actor grant lasted 15 minutes and had rewards disabled. No shared feature
flag, Auth configuration, migration or deployed function changed.

The final run passed:

1. State read and ticket issuance with a real authenticated user.
2. Engine input replay: 1,268 ticks / 21.133333333333333 seconds, 209 points,
   three stars on 1-1. Real elapsed play time was respected before submission.
3. Real commit followed by an injected lost HTTP acknowledgement. The durable
   outbox retained the pending result. Destroy/reopen and retry used the same
   ticket; no second revision or reward was created.
4. Fresh device storage hydrated the same level/stars from the real state endpoint.
5. Injected offline read retained the prior snapshot; explicit retry recovered.
6. Real Auth refresh preserved the owner and save-session factory.
7. Real SDK sign-out cleared the binding snapshot and prevented further state calls.

Independent database verification before cleanup: revision **1**, receipt count
**1**, level **1-1**, three stars, score **209**, Snake Gold/Gem **0/0**, and no
remaining Auth session for that fixture.

## Timeout adjustment and local regressions

The 10-second runs encountered a state timeout and an unacknowledged retry. The
initial harness also had a closed-stdin setup failure; none of these runs count as
passing. Recorded successful final HTTP times ranged from 534 ms to 9,275 ms,
including an 8,369 ms complete request. Network/cold-request latency is a likely
factor; the original failed retry did not capture its exact transport exception.

The preview now explicitly supplies a 30-second cancellable save timeout to
state/start/complete through `SNAKE_SAVE_TIMEOUT_MS`. No polling or automatic
proof retry was introduced. The final real service run used that same 30-second
value; the constant was then shared between runner and preview.

`npm run test:snake-session` passed seven local regression groups using the real
SDK with controlled HTTP: expired fixture session refresh, TOKEN_REFRESHED without
factory replacement, SIGNED_OUT, account isolation after closure, client expiry
before HTTP, an 11-second state response, and late-response rejection after closure.
`npm run test:snake-cloud` also passed the campaign merge/isolation/quota suite.

## Cleanup verified

All four reserved Auth fixtures created during setup/diagnosis were signed out and
removed with exact owner/email predicates. Snake fixture rows were removed before
Auth cleanup. Initial/final Auth account counts both **74**. Final Snake counts:
accounts **0**, test actors **0**, runs **0**, receipts **0**. Global Snake feature
and reward flags stayed **false** throughout. No existing user data was targeted.

## Reproduction

Local checks (no remote writes):

```sh
npm run test:snake-cloud
npm run test:snake-session
npm run lint
npm run build:snake-preview
```

Live runner: `npm run test:snake-live -- --live` in an interactive TTY. It prints
`AWAIT_ACTOR` with a disposable owner/job, then waits for the maintainer to register
that exact owner through existing `snake_register_test_actor(owner, job, false)`.
Type `go` only after registration. The runner prints `CLEANUP_REQUIRED` after
sign-out even on failure. The maintainer must remove only that printed fixture's
receipts/runs/account/test-actor/Auth user and verify counts. Credentials and tokens
are generated/kept in process memory; they are never written to artifacts or logs.
Do not run it as unattended CI or enable shared rewards to make it pass.

## Remaining gates

- Full launcher UI: sign-in → play/win → save → reload, mobile controls/layout.
- Actual wall-clock JWT expiry against the deployed issuer. A real token refresh
  was checked; the expiry regression uses a fixture token and controlled Auth HTTP.
- Physical Android/iOS/Safari and production audio/art/M2 human playtest gates.

This is service/client integration evidence, not full UI/device/release sign-off.
