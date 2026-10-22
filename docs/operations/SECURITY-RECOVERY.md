# Security and recovery rollout

Status: preparation only. No production MFA configuration, backup job, restore,
provider integration or database permission migration has been executed by this change.
Keep all commerce rollout flags off until the gates below pass.

## 1. Administrative access

The server commerce review service now requires all three checks on every request:
- Current private admin membership inside the transaction.
- `aal2` from a server-verified session (missing assurance is denied).
- Explicit `reviews.read` for list/detail or `reviews.decide` for decisions,
  read from private storage inside the same transaction, before idempotency replay.

Do not derive assurance from request JSON, headers supplied as claims, user metadata,
or unverified JWT decoding. The identity adapter must verify session expiry,
issuer/audience and authenticity before returning assurance. Do not default production
sessions to aal2. The test fixture's synthetic assurance is not a real MFA adapter.
Grant both permissions to operators who must view and decide; grant only read to auditors.
No permission is implied by legacy admin membership. Revocation must affect the next request.

This protects the new review service only. Existing game/access administration SQL RPCs
still need separate private permission and MFA checks when Supabase work resumes.
No MFA enrollment UI is supplied yet; an administrator must complete MFA through the
future authentication integration before this protected service can be enabled.

Pending service configuration: enable MFA on GitHub, database and hosting accounts;
store recovery codes outside the application; use individual accounts; limit production
secrets to the server environment. Record owner and completion evidence, never secrets.

## 2. Backup inventory and ownership

Before accepting money, assign an operator and a second recovery operator. Inventory:
- Database schema, grants/RLS, users/auth configuration, orders, payments, receipts,
  review commands, grants, audit records, game progress and catalog configuration.
- Uploaded/game assets and object storage, separately from database backups.
- Source commit, migrations, build/runtime configuration and secret references.
  Secret values belong in a restricted vault, never this repository or backup reports.
- Payment provider event history and settlement exports used for reconciliation.

Proposed pilot targets (must be approved against actual service capability): recovery
point <= 24 hours, recovery time <= 4 hours. Do not promise these until a restore drill
has measured them. Choose tighter recovery points before increasing transaction volume.
Use encrypted backups with separate credentials, restricted deletion, off-project copies,
and documented retention/deletion policy. Monitor missed jobs and backup age; a successful
export alone is not proof of recoverability. Do not write an ad-hoc JSON export endpoint
that exposes user data or pretends to replace a transactional database backup.

## 3. Restore drill — isolated staging only

1. Record backup identifier/time, source commit, schema version, asset manifest and operator.
2. Create an isolated recovery environment. Disable commerce, scheduled jobs, outgoing
   notifications and real payment credentials/webhooks. Never restore over production
   as a routine test. Restrict access to restored personal data.
3. Restore the database using the hosting provider's supported process. Restore object
   data separately. Verify row counts and key/foreign-key constraints, permissions/RLS,
   required functions and asset hashes against the inventory.
4. Verify representative accounts: own-data isolation, foreign-account denial, expired
   and refunded access blocked, permanent starter ownership retained, maintenance gate,
   administrative MFA and each permission. Use existing automated suites plus adapter
   integration tests; the in-memory ledger is not restore evidence.
5. Compare provider settlements since the backup point with recovered payments/orders.
   Replay verified events through the normal idempotent settlement path in staging;
   check one grant per accepted order, no duplicate payment, no active refunded grant.
   Never repair money records by blindly editing balances or deleting event receipts.
6. Measure actual data loss window and elapsed recovery time. Record failures, remediation,
   evidence links and operator sign-off. Remove test personal-data copies under retention rules.

Production recovery is a separate incident decision: freeze writes/checkout, preserve
forensic evidence, choose a recovery point, reconcile all post-backup provider activity,
then validate access and explicitly authorize reopening. Rotate affected credentials
if compromise is suspected. Never enable payment jobs against an un-reconciled restore.

## Acceptance record (still pending)

| Gate | Evidence required | Status |
| --- | --- | --- |
| Server review MFA/permission unit tests | Commerce suite | Implemented locally |
| Real identity + private permission adapter | Staging integration tests | Pending |
| Existing admin RPC permission/MFA separation | Database tests | Deferred with Supabase |
| Hosting/GitHub/database account MFA | Operator confirmation | Pending |
| Scheduled backup and alerts | Successful job and missed-job alert | Pending |
| Isolated restore drill | Measured recovery point/time and checks | Pending |
| Object storage recovery | Manifest/hash verification | Pending |
| Production reconciliation and reopening | Incident runbook rehearsal | Pending |

Next implementation phase: reconciliation anomaly detection, then ownership/expiry and
maintenance policies, then the three-offer pilot. Supabase remains deferred; the existing
reminder for 19 October 2026 should be retained.
