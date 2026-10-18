# Rental order and settlement core

This server-only module implements checkout and settlement rules with injected persistence, authentication and provider verification. It has no deployed HTTP endpoint, production database adapter or payment-provider adapter yet. Nothing in `src/` imports it. Store checkout remains disabled. Do not expose the in-memory ledger or test verifier in a deployed handler.

Run `npm run test:commerce` for executable examples. No credentials or external services are required. `npm run lint` also type-checks the server module.

## Behavior implemented

- `createOrder`: server-authenticated account, registered pilot, no account block, server checkout flag, active offer and available games. The caller provides the offer revision, never the price. A changed revision requires a new quote. The order snapshots all offer fields, so later price/game edits cannot alter an existing purchase. The payment window is 30 minutes.
- Owner-only `getOrder`/`cancelOrder`. A pending order expires when read/cancelled/retried at the deadline. Access does not depend on an expiry scheduler. Repeated request keys recover the same order and cannot change the selected offer/revision. Keys are scoped to the owner. Blocked accounts cannot create/recover through checkout; history remains readable by the owner.
- `handleWebhook`: calls the mandatory verifier before looking up or changing any data. Matches VND amount, order and payment reference; snapshots and grants remain unchanged on mismatches. No public settlement method accepts browser payment-success claims.
- Both event IDs and payment IDs are deduplicated in the same transaction as the grant and audit. A reused event ID with a different payload or payment ID assigned to another order is rejected. Receipt replay returns its original acknowledgement; read the current order for current state.
- A valid on-time payment delivered late is accepted, with access beginning on receipt. A payment made at/after expiry, against a cancelled order, or on an order under review is sent to manual review. An already-created valid order can settle while new checkout is disabled.
- A new payment on an already-paid order is flagged as an extra payment; it cannot produce another grant. Mismatches or partial refunds remain in the review audit without automatically changing active access.
- Renewal of identical game coverage appends after nonrevoked grants with the same coverage. Equivalent bundle ordering does not matter. Different coverage starts immediately; no proration or cross-package upgrade credit. Calendar months/years clamp to the last valid UTC day. Day terms are UTC day additions. Access is start-inclusive and end-exclusive; `grantActive` evaluates this without a job.
- Full refund revokes only grants produced by the referenced accepted order. A refund before success leaves a tombstone so later success cannot open access. Refunding an extra payment does not revoke the accepted payment's grant. Refund notifications use the provider's cumulative refunded total, not per-refund deltas.

## Integration contracts to implement later

1. `IdentityProvider.requireUser`: verify the actual server session and expiry. Never take an owner ID from request JSON, redirect parameters or user-editable metadata. Rate-limit checkout at the authenticated endpoint.
2. `CommerceRepository`: durable ACID transaction covering all reads/writes, receipts and audits. Database constraints must enforce unique `(owner_id, request_key)`, `(provider, event_id)`, `(provider, payment_id)`, and the single grant group per order. Serialize orders and owner coverage during renewal. Use deterministic lock ordering and whole-transaction retries for serialization/deadlock errors. Network calls to a payment provider must remain outside database transactions. The in-memory test ledger demonstrates the contract, not real database concurrency.
3. Map the offer's `revision` to a durable version; map `amount`/`gameIds` to the existing offer fields. Map each grant group atomically to `launcher_entitlements`, including the source order and shared start/end dates for all games in a bundle. The legacy order/payment RPC must not remain an alternative route that bypasses this service. Reconcile prior payment records before switching.
4. `PaymentVerifier`: choose a provider, verify its documented signature against the original raw bytes; check merchant, test/live environment, provider status and freshness; normalize timestamps and refund totals. Include the verified provider namespace and trusted order reference. No default verifier is provided. Failed/cancelled provider statuses do not create a success event.
5. Provider initiation: persist the pending order first, then create a provider checkout session with the order ID and a provider idempotency key. Retry/reconcile session creation without creating a new order. Store the resulting provider reference through a separate durable transaction. Redirect return is informational; only verified settlement grants access.
6. HTTP boundary: create/cancel/history require server authentication and owner checks; the webhook uses provider authentication. Apply strict JSON/body limits and response/error mapping. Do not return raw errors, keys, raw webhook bodies or other owners' data. Persist unknown-order or invalid events in an operator-visible quarantine/retry flow before acknowledging to a provider.
7. Review UI: list mismatched/late/extra payments, partial refunds and cancellation races. An authorized resolution must have a mandatory reason, audit trail, idempotency key and atomic entitlement updates. The review service now supports guarded approval of verified matching payments; durable storage and production integration are still required.
8. Existing account/game blocks and maintenance must still win during access checks after settlement. Receiving money records a paid entitlement; it never removes a block. Starter/admin grants remain separate sources. Do not wire `grantActive` as a replacement for the full access evaluator.

## Deferred decisions

- This is a prepaid rental, not automatic recurring billing. No card tokens or recurring charges are created.
- Full refund does not move later queued renewals forward. If a refunded earlier term creates a gap, handle dates/credit explicitly in the audited review flow. No silent rescheduling or double credit.
- Partial refunds, chargebacks/disputes, currency conversion, taxes/invoices and moving paid value between packages need explicit business rules and provider integration.
- Database/staging migration, live provider signature verification and cross-process concurrency have not been tested. The user deferred Supabase work on 2026-10-18.

## Order history and HTTP boundary (step 4)

`createCommerceHandler` in `http.ts` is a host-independent `Request → Response` handler. It has no mounted route or production adapter in this PR. It defaults to disabled and refuses to run without an explicit host rate-limit callback. The host still needs to verify sessions through `IdentityProvider`, persist through the durable repository and supply real rate limiting.

| Method | Path | Operation |
| --- | --- | --- |
| GET | `/api/rentals/orders?limit=20&cursor=...` | Owner's newest orders, exclusive keyset pagination |
| GET | `/api/rentals/orders/:id` | Owner's order and grant dates |
| POST | `/api/rentals/orders` | Create from `{offerId, offerRevision, requestKey}` only |
| POST | `/api/rentals/orders/:id/cancel` | Cancel with an empty JSON object |

Every route requires a bearer token, independently verified by the service identity adapter. Owner and payment IDs are never accepted from the client. Responses use public DTOs in `shared/rental-orders.ts` and omit owner/request/provider payment IDs. Responses, including errors, use `Cache-Control: no-store, private` and `Vary: Authorization`. The handler has no CORS or cookie authentication. Use same-origin routing; do not add a wildcard credentialed proxy.

`Transaction.orders` must filter by owner before applying the cursor/limit, ordered by `(created_at DESC, id DESC)`. Cursor is the URL-encoded JSON `{createdAt,id}` from `nextCursor`, not a page offset; limit is 1–50, with one internal lookahead row. Use parameterized SQL and an owner/created_at/id index when implementing persistence. Grant reads must be owner-filtered in the same transaction. List/detail expire pending orders at the server deadline. List filtering is intentionally done in the UI only for rows already loaded, avoiding inconsistent pagination around lazy expiry.

JSON mutations are restricted to 4 KiB and explicit fields. Safe machine error codes map to 400/401/403/404/409/413/415/429/503; unexpected exceptions become a generic 503. Browser redirect results cannot settle an order. The history HTTP module does not expose a payment webhook.

Frontend entry points are Settings → Đơn thuê của tôi and the game storefront. `VITE_RENTAL_ORDERS_API=false` is independent of the access preview flag; leave it false until the host handler, durable repository and verified session adapter are ready. When disabled, history shows an unavailable state and performs no history API/session calls. It does not show demo orders. Store checkout remains disabled even when history is enabled.

The client checks the expected account before and after a request, validates returned data, uses abort/timeout and no-store requests, and never persists orders/tokens in a separate local cache. The screen is remounted on account switch, supports local status filtering, paginated loading, inline details, confirmation before cancellation and server-relative deadline labels. The first page polls every 20 seconds only while visible and awaiting payment; pagination pauses polling so it does not discard older loaded pages. Returning to the tab or reconnecting reloads the first page. Paid grant dates distinguish active, future renewal, expired and revoked grants.

Test coverage includes HTTP/client roundtrips with a test-only ledger: owner isolation, same-timestamp pagination, automatic expiry, cancellation/payment races, DTO redaction, field/body limits, disabled gates, account switches in flight and HTML fallback/malformed responses. Browser layout/focus checks and deployment remain pending staging.


## Admin review queue (step 5)

Verified abnormal events for a known order now create a private `ReviewCase` in the same transaction as payment/order/receipt/audit updates. Repeated delivery of the same event does not create another case. Unknown-order events and rejected signatures remain outside this queue; the production provider adapter still needs a quarantine/reconciliation path for them.

The admin screen is reached from Access administration → Đối soát giao dịch. It has server status filters, cursor pagination, local search, a list/detail layout, expected-versus-received amounts, order/account/payment references and the latest 20 history entries. Mobile switches between list and detail instead of placing detail after a long queue. Decisions require a reason (3–500 characters) and a separate confirmation step.

| Action | Effect |
| --- | --- |
| `note` | Append a note; preserve financial state and access |
| `queue_refund` | Mark work as awaiting refund; does not call a provider or transfer money |
| `dismiss` | Close this case; preserve order, payment and access state |
| `grant_access` | For eligible verified full matching payments only, record paid order and one rental grant using normal renewal rules |

Grant approval is denied for amount/currency mismatch, refund notifications, already-paid/refunded orders, an existing grant, a payment that is not in review, previous refunded value or an unregistered/missing owner. A late/cancelled order with a verified full matching payment may be approved explicitly with a reason. Approval starts the rental now or appends it to same-coverage rental time. Account/game restrictions and maintenance still apply in access evaluation.

Admin membership comes from `Transaction.isAdmin(userId)` inside every transaction, never client flags or JWT user metadata. `expectedRevision` rejects stale decisions; `(admin_id, request_key)` and its payload fingerprint make retries idempotent. Review update, optional grant/order/payment, command receipt and before/after audit must commit or roll back together. Membership revocation must take effect on the next read/write. Other cases referring to a newly-settled order may remain open for explicit closure; their grant eligibility becomes false.

A verified full refund resolves related cases and appends provider history, even after admin approval. When a known payment was underpaid or in a different currency, full-refund matching uses that payment's actual recorded amount/currency rather than the offer price. A refund of a secondary payment still leaves the primary paid entitlement intact. Partial refunds need manual review; this screen cannot initiate refunds, change received amounts, combine underpayments or reassign a payment to another owner/order. Closing a review does not change an order still marked review.

Additional transaction adapter methods: `review`, `reviews`, `reviewsForPayment`, `putReview`, `reviewCommand`, `putReviewCommand`, `isAdmin`. Store cases/history/command receipts in private RLS-protected tables; enforce unique admin command keys and lock the review, order, provider payment and owner coverage during decisions and provider settlement. Stable queue cursor is `(created_at DESC, id DESC)`. Use indexed status/created_at/id and payment-key lookups; never trust a UI-selected ID without the fresh membership check.

Additional unmounted HTTP routes:
- `GET /api/rentals/admin/reviews?status=open|awaiting_refund|resolved|all&limit=20&cursor=...`
- `GET /api/rentals/admin/reviews/:id`
- `POST /api/rentals/admin/reviews/:id/decide` with `{action,expectedRevision,reason,requestKey}` only.

The handler requires `enabled`, a rate-limit callback and independent `reviewEnabled:true`; the frontend requires access preview plus `VITE_RENTAL_REVIEW_API=true`. All default off. These gates do not enable payments. Leave them off until durable admin/queue/command/audit adapters are deployed. No fixture data is shown to admins in the unavailable state.

`npm run test:commerce` now runs 53 tests covering core, history, review service/HTTP/client, fresh role checks, retry/conflict handling, two admins, atomic rollback, approval/refund races, mismatched-payment refunds and independent readiness gates. The concurrency fixture serializes in memory; production database concurrency, browser layout/focus and live provider behavior still need staging verification.

## Quote, checkout session and payment handoff (step 6)

The storefront can now open a server-priced quote, explicitly create an order, prepare a provider session and show a user-clicked payment link in a new tab. Existing pending orders can continue through the same flow from history. The order's price is displayed again after creation. A changed offer revision requires rechecking the quote; a failed/ambiguous create retries the same request key while that flow remains open. A successfully-created order is retained when session preparation fails. Closing/reloading the flow can recover pending orders from history; do not automatically create a replacement order after a timeout.

The flow polls the authenticated order detail every 15 seconds while visible and pending, refreshes on return/reconnect and stops polling terminal states. Return URL/query parameters are never treated as payment proof. Payment-provider session creation grants no access. Only verified settlement updates the paid order and entitlements. The new-tab link includes noopener/noreferrer and shows its destination host and deadline.

New server components/contracts:
- `CommerceService.quote`: account/pilot/block, checkout flag, current offer revision/price and game availability are checked on the server. The quote is informational; order creation independently rechecks the version and snapshots the price.
- `CheckoutCoordinator.begin`: verify owner/session, current account eligibility, pending order/deadline, checkout flag and game availability. Reserve one immutable provider key per order in a durable transaction, call the injected provider outside the transaction, then recheck before exposing the URL.
- `CheckoutProvider.create`: must be idempotent for the same key even after ambiguous timeouts. Creating a session must not itself charge money. It must return the trusted order reference, exact snapshot amount/currency, unique provider reference, URL and expiry. This PR has no real provider adapter.
- `CheckoutRecord`: one row per order, unique provider/reference, immutable namespace/provider/order request key, lease token/deadline, ready URL/reference/expiry. Enforce those keys in durable storage. `checkout`, `checkoutByReference`, `putCheckout` join the transaction adapter contract.

A 45-second creation lease prevents concurrent provider calls. Recovery after lease expiry uses the same provider key. An older response cannot overwrite a newer reservation. Verified ready sessions are reused; expired sessions are not silently replaced with another payment. Provider/network or final persistence failure keeps the same key for reconciliation/retry. Lease/audit updates must be atomic, with whole-transaction retries. External provider creation can outlive a cancelled browser request; a host reconciler must recover using the immutable key and cancel the external session through provider APIs when appropriate. Cancelling an order does not currently cancel an external provider session; a subsequent payment follows the existing review rules.

Payment URLs require HTTPS, no embedded credentials and an exact configured origin allowlist. Provider output must match the order ID, integer VND amount and currency, a nonempty reference and a future expiry no later than the order deadline. Returned link DTOs omit provider references and idempotency/lease tokens. Namespace and provider ID must be stable and isolate merchant/test/live environments; a changed configuration cannot reuse another environment's record.

Additional unmounted HTTP routes:
- `GET /api/rentals/offers/:id/quote`
- `POST /api/rentals/orders/:id/checkout` with an empty JSON object.

Quote, order creation and session preparation require `checkoutEnabled:true` and an injected coordinator in the HTTP factory. Repository `checkoutEnabled()` is checked again. Frontend `VITE_RENTAL_CHECKOUT_API=true` additionally requires access preview and order API readiness. All defaults remain false. The old pilot catalog's `checkoutEnabled:false` remains unchanged; the new guarded quote endpoint is authoritative only after an explicit checkout rollout. No database migration or payment-provider credentials were introduced in this step.

Before enabling production: implement durable records/constraints, authenticated/rate-limited host routing, a chosen provider's official signature/session adapters, provider idempotency and expiry/cancellation verification, retry/reconciliation jobs, and staging browser/race tests. Ensure offer configuration clearly identifies the additional paid access beyond free/starter/permanent rights; quote/game-availability checks do not yet price discounts or suppress fully-owned packages automatically.

`npm run test:commerce` now has 67 tests, including quote changes, full client/HTTP flow, session reuse, duplicate preparation, timeout/lease recovery, stale responses, unique references, cancellation during an external call, malformed provider URLs/money/order/expiry and browser success-parameter rejection. Provider and transaction behavior is simulated; no live provider integration or browser QA is claimed.

### Security hardening: review MFA and least privilege

Review reads now require fresh `isAdmin`, server-verified `IdentityProvider` assurance
`aal2`, and `Transaction.hasPermission(userId, 'reviews.read')`. Decisions require
`reviews.decide` instead, including retried commands. Missing assurance or permissions
fails closed with HTTP 403; customer order endpoints remain unchanged. Production adapters
must implement the new contract before rollout; no permission is inherited from admin status.
See `docs/operations/SECURITY-RECOVERY.md` for the pending real MFA integration, legacy RPC
scope limitation, backup inventory, isolated restore drill and activation gates.

### Consistency checks, ownership and pilot policy

`GET /api/rentals/admin/reconciliation?cursor=...` requires the independent
`reconciliationEnabled` host gate, global enable/rate limit, verified MFA admin and
`reviews.read`. `reconcile` checks 50 orders per call in one consistent transaction:
missing/duplicate grants, owner/coverage/date corruption, unrevoked refunded or
unsettled grants, and paid-order payment mismatch. It never mutates the ledger.
`Transaction.reconciliationOrders` uses the same exclusive createdAt/id descending
cursor as order history; `grantsForOrder` must query by order regardless of owner.
The admin screen is gated by `VITE_RENTAL_RECONCILIATION_API=false` by default.
Pages are separate snapshots: repeat full scans for records changed during a run.

This is internal consistency detection, not provider settlement reconciliation.
Orphan provider payments, unknown orders, orphan grants, dropped webhooks and provider
settlement totals require additional provider/database scans before production.
No scheduler or notification destination is connected yet. A production job must use
a separate server-only identity/permission path, durable cursor/run records, overlap
prevention, deduplicated findings and monitored completion; do not store user MFA
session tokens in a cron job. Repairs must use verified events or reviewed audited
commands, not direct updates or replay of already-consumed receipts.

`permanentGameIds(owner)` is mandatory: authoritative free published games plus
currently effective, nonrevoked permanent entitlements, expanding permanent all-game
rights over the catalog. Exclude expired, future and timed rental grants. Read/lock
ownership consistently with order creation and settlement. Quotes, new orders and
checkout preparation refuse fully-owned finite offers. Partial bundles keep their
listed price and explicitly disclose that no per-game discount is applied. Pass
covers a changing catalog and is not compared to a finite owned list. Ownership
acquired after payment-session creation routes settlement to review; it never silently
consumes the payment as an unnecessary rental. Grant approval also rejects fully-owned
finite coverage. Actual provider refunds remain an external integration task.

`maintenanceCreditMs` is a pure review-only proposal helper: union overlapping incidents,
clip to the rental window, exclude revoked grants, count only full-coverage outages.
Partial bundle/Pass outages need manual assessment. It is not connected to a persistent
incident register or credit action and does not extend grants automatically. Future
application must dedupe incident/grant IDs, audit the decision, and shift queued renewals
atomically without double crediting. Do not advertise guaranteed automatic credits yet.

Store admin includes three inactive presets (one game 7d, bundle 30d, Pass 30d), with
no guessed prices or game choices. Existing six durations remain available. My Access
shows expiry within three days using server time; it is an in-app label, not a push/email
reminder. Expiration retains progress and starter rights; existing access evaluation
still enforces maintenance and blocks. No recurring billing is implemented.
