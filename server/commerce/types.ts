import type { ReviewStatus, ReviewEntry } from '../../shared/rental-reviews';
import type { OrderCursor } from '../../shared/rental-orders';
/** Server-only contracts. Do not import this service into the browser bundle. */
export type Term = '7d' | '14d' | '30d' | '3m' | '6m' | '1y';
export type Scope = 'game' | 'bundle' | 'all';
export interface Offer {
    id: string;
    revision: string;
    title: string;
    scope: Scope;
    gameIds: string[];
    term: Term;
    amount: number;
    currency: 'VND';
    active: boolean;
}
export interface Account {
    registered: boolean;
    pilot: boolean;
    blocked: boolean;
}
export interface Order {
    id: string;
    ownerId: string;
    requestKey: string;
    offer: Offer;
    createdAt: string;
    expiresAt: string;
    state: 'awaiting_payment' | 'paid' | 'cancelled' | 'expired' | 'review' | 'refunded';
    paidAt?: string;
    paymentKey?: string;
}
export interface RentalGrant {
    id: string;
    orderId: string;
    ownerId: string;
    coverageKey: string;
    gameIds: string[];
    allGames: boolean;
    startsAt: string;
    expiresAt: string;
    revokedAt?: string;
}
/** Adapter must verify signature/authenticity and normalize the provider payload first.
 * Refund amount is TOTAL refunded for this payment, not an incremental refund delta. */
export interface PaymentEvent {
    provider: string;
    eventId: string;
    paymentId: string;
    orderId: string;
    kind: 'paid' | 'refunded';
    amount: number;
    currency: string;
    occurredAt: string;
}
export interface Payment {
    key: string;
    orderId: string;
    state: 'paid' | 'review' | 'refunded';
    amount: number;
    currency: string;
    refundedTotal: number;
}
export interface Settlement {
    outcome: 'unlocked' | 'duplicate' | 'review' | 'refunded';
    orderId: string;
    reason?: string;
}
export interface EventReceipt {
    fingerprint: string;
    result: Settlement;
}
export interface ReviewCase {
    id: string;
    orderId: string;
    paymentKey: string;
    reason: string;
    event: PaymentEvent;
    status: ReviewStatus;
    revision: number;
    createdAt: string;
    updatedAt: string;
    history: ReviewEntry[];
}
export interface ReviewCommand {
    adminId: string;
    requestKey: string;
    fingerprint: string;
    reviewId: string;
}
export interface Audit {
    action: string;
    targetId: string;
    actor: string;
    at: string;
    reason: string;
    before?: unknown;
    after?: unknown;
}
export interface Transaction {
    isAdmin(userId: string): Promise<boolean>;
    review(id: string): Promise<ReviewCase | null>;
    reviews(status: ReviewStatus | 'all', before: OrderCursor | null, limit: number): Promise<ReviewCase[]>;
    reviewsForPayment(paymentKey: string): Promise<ReviewCase[]>;
    putReview(review: ReviewCase): Promise<void>;
    reviewCommand(adminId: string, requestKey: string): Promise<ReviewCommand | null>;
    putReviewCommand(command: ReviewCommand): Promise<void>;
    checkoutEnabled(): Promise<boolean>;
    account(ownerId: string): Promise<Account | null>;
    offer(id: string): Promise<Offer | null>;
    gamesAvailable(ids: string[], allGames: boolean): Promise<boolean>;
    order(id: string): Promise<Order | null>;
    orderByRequest(ownerId: string, key: string): Promise<Order | null>;
    /** Owner predicate is mandatory. Sort createdAt DESC, id DESC; exclusive keyset cursor.
     * Return no more than limit rows; caller requests one lookahead row. */
    orders(ownerId: string, before: OrderCursor | null, limit: number): Promise<Order[]>;
    putOrder(order: Order): Promise<void>;
    payment(key: string): Promise<Payment | null>;
    putPayment(payment: Payment): Promise<void>;
    event(key: string): Promise<EventReceipt | null>;
    putEvent(key: string, receipt: EventReceipt): Promise<void>;
    grants(ownerId: string): Promise<RentalGrant[]>;
    putGrant(grant: RentalGrant): Promise<void>;
    audit(entry: Audit): Promise<void>;
}
/** Must be ACID/serializable including reads, audit, receipts, and grants.
 * Lock by owner for renewal and request dedupe, by order and provider/payment/event IDs
 * for settlement. Enforce unique keys in persistent storage. Retry serialization errors
 * inside the adapter; never retry only the grant insertion. */
export interface CommerceRepository {
    transaction<T>(work: (tx: Transaction) => Promise<T>): Promise<T>;
}
export interface IdentityProvider {
    /** Verify the session server-side, including expiry. Never trust a request userId. */
    requireUser(session: unknown): Promise<{
        id: string;
    }>;
}
export interface PaymentVerifier {
    /** Fail closed; validate raw bytes/signature, merchant, environment, replay window,
     * provider success status and trusted order reference. Never accept browser redirects. */
    verify(rawBody: Uint8Array, headers: Readonly<Record<string, string>>): Promise<PaymentEvent>;
}
