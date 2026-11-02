> Update 2026-11-02: real service/client save, retry, second-device hydration, Auth refresh and sign-out checks have passed. See [SNAKE_LIVE_SAVE_QA.md](SNAKE_LIVE_SAVE_QA.md) for evidence, timeout adjustment, cleanup and remaining UI/JWT-expiry gates.

# Snake cloud campaign hydration — 2026-11-02

The authenticated binding now restores validated server campaign levels/stars into
its existing account-scoped storage. New mounts hydrate before the game reads
campaign progress. Mounted games subscribe to campaign changes, update unlocks
and stars without restarting the current run, and unsubscribe on destruction.

Conflict policy is monotonic: union completed levels, OR each star, minimum best
time, maximum best score, union secrets. Preserve local run receipts. Local-only
results remain local; this merge never sends them as proof, grants rewards, or
writes the launcher wallet. Engine checkpoints stay on the current device.

No polling, automatic outbox flush, database migration, feature/reward enablement
or deployment is introduced. A manual state read or verified completion supplies
the snapshot. Switching accounts invalidates the binding. Older snapshot revisions
are ignored; a failed storage write can retry the same snapshot revision.
Corrupt local campaigns remain intact and prevent hydration instead of resetting.

Validation: `npm run test:snake-cloud` exercises cloud merge/idempotence, local
receipt preservation, secrets, checkpoint/wallet isolation, corrupt storage,
account namespace, mounted subscriptions, hydration on a later mount, stale
revision, quota failure/retry and account invalidation using controlled HTTP.

Remaining: real authenticated launcher win/save/reload, actual token expiration,
network failure against the deployed endpoint, and physical-device testing.
This work restores campaign progress across devices; it does not transfer an
in-progress engine checkpoint or certify the local-only results as server results.
