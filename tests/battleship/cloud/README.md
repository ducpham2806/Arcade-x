# Cloud QA (explicit approval only)

These modules are server-side test sources, never imported by the normal API, launcher or npm test suite. Running them creates three disposable admin-confirmed Auth users per run, sends no email, makes actual authenticated HTTP calls and deletes the users afterward. The user approved this workflow on 2026-10-21.

`qa-module.ts` covers account isolation, room create/join, own-only fleets, readiness, idempotent shots, worker denial, reconnect and surrender. `full-match-module.ts` runs a complete scripted fleet match in bounded batches to avoid the cloud QA environment's request cap. Its target choices use private test-fixture state in trusted code, so this is a protocol/result test, not a fair-bot or human balance test.

For an approved test deployment only, copy the selected module beside the Edge runtime files, rewrite its store import to `./store.ts`, and add its route only inside the existing verified worker-token branch. The full-match route accepts a continuation from the previous response; that continuation encrypts account JWTs and test state with AES-GCM using a server-derived key, expires in ten minutes, and must never be printed or checked into Git. Forward it database-to-function directly.

The initial full-match batch makes five shots; continuation batches make up to twelve. Absolute turn deadlines and scheduler expiry remain active between batches. Terminal success/failure closes any still-open test room and deletes the accounts. If interrupted, resume within the token expiry or perform cleanup using only the run-tagged test accounts.

After testing, deploy the normal four-file API bundle with no QA imports or route. Confirm valid-worker QA requests return 403, normal tick returns 200, zero run-tagged Auth users remain and no test rooms are active. Remove continuation ciphertext from transient QA responses while retaining sanitized reports.
