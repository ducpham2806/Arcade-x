# Rental order and settlement core

This server-only module implements checkout and settlement rules with injected persistence, authentication and provider verification. It has no HTTP endpoint, production database adapter or payment-provider adapter yet. Nothing in `src/` imports it. Store checkout remains disabled. Do not expose the in-memory ledger or test verifier in a deployed handler.

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
7. Review UI: list mismatched/late/extra payments, partial refunds and cancellation races. An authorized resolution must have a mandatory reason, audit trail, idempotency key and atomic entitlement updates. This core deliberately has no automatic "approve review" path yet.
8. Existing account/game blocks and maintenance must still win during access checks after settlement. Receiving money records a paid entitlement; it never removes a block. Starter/admin grants remain separate sources. Do not wire `grantActive` as a replacement for the full access evaluator.

## Deferred decisions

- This is a prepaid rental, not automatic recurring billing. No card tokens or recurring charges are created.
- Full refund does not move later queued renewals forward. If a refunded earlier term creates a gap, handle dates/credit explicitly in the audited review flow. No silent rescheduling or double credit.
- Partial refunds, chargebacks/disputes, currency conversion, taxes/invoices and moving paid value between packages need explicit business rules and provider integration.
- Database/staging migration, live provider signature verification and cross-process concurrency have not been tested. The user deferred Supabase work on 2026-10-18.
