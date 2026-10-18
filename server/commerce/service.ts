import type { OrderCursor, OrderPage, OrderView } from '../../shared/rental-orders';
import type { CommerceRepository, IdentityProvider, PaymentVerifier, Offer, Order, PaymentEvent, Settlement, Term, Transaction, RentalGrant } from './types';
export class CommerceError extends Error {
    constructor(public code: string) { super(code); this.name = 'CommerceError'; }
}
const fail = (code: string): never => { throw new CommerceError(code); };
const terms: Term[] = ['7d', '14d', '30d', '3m', '6m', '1y'];
const validMoney = (n: number) => Number.isSafeInteger(n) && n > 0 && n <= 100000000;
const key = (...parts: string[]) => JSON.stringify(parts);
export const coverageKey = (offer: Pick<Offer, 'scope' | 'gameIds'>) => key(offer.scope === 'all' ? 'all' : 'games', ...offer.gameIds.slice().sort());
export function addTerm(start: string, term: Term): string {
    const date = new Date(start);
    if (!Number.isFinite(date.getTime()) || !terms.includes(term))
        fail('invalid_term');
    if (term.endsWith('d'))
        date.setUTCDate(date.getUTCDate() + Number(term.slice(0, -1)));
    else {
        const day = date.getUTCDate();
        date.setUTCDate(1);
        date.setUTCMonth(date.getUTCMonth() + (term === '1y' ? 12 : Number(term.slice(0, -1))));
        const last = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
        date.setUTCDate(Math.min(day, last));
    }
    return date.toISOString();
}
export function grantActive(grant: RentalGrant, at: string): boolean {
    const now = Date.parse(at);
    return !grant.revokedAt && Date.parse(grant.startsAt) <= now && now < Date.parse(grant.expiresAt);
}
function validateOffer(o: Offer) {
    if (!o.active || !o.revision || o.currency !== 'VND' || !validMoney(o.amount) || !terms.includes(o.term) || !o.title.trim())
        fail('offer_unavailable');
    if (new Set(o.gameIds).size !== o.gameIds.length || o.gameIds.some(id => !id))
        fail('invalid_offer');
    if (!(o.scope === 'all' && o.gameIds.length === 0 || o.scope === 'game' && o.gameIds.length === 1 || o.scope === 'bundle' && o.gameIds.length >= 2))
        fail('invalid_offer');
}
function validateEvent(e: PaymentEvent, now: Date) {
    if (!e || ![e.provider, e.eventId, e.paymentId, e.orderId].every(x => typeof x === 'string' && x.length > 0 && x.length <= 200) || !['paid', 'refunded'].includes(e.kind) || !validMoney(e.amount) || typeof e.currency !== 'string' || typeof e.occurredAt !== 'string' || !Number.isFinite(Date.parse(e.occurredAt)) || Date.parse(e.occurredAt) > now.getTime() + 60000)
        fail('invalid_payment_event');
}
export class CommerceService {
    constructor(private repo: CommerceRepository, private identity: IdentityProvider, private verifier: PaymentVerifier, private clock: () => Date = () => new Date(), private id: () => string = () => crypto.randomUUID()) { }
    async createOrder(session: unknown, input: {
        offerId: string;
        offerRevision: string;
        requestKey: string;
    }): Promise<Order> {
        const actor = await this.identity.requireUser(session);
        if (!input || typeof input.requestKey !== 'string' || typeof input.offerId !== 'string' || typeof input.offerRevision !== 'string' || !input.offerId || !input.offerRevision || !/^[A-Za-z0-9_-]{16,100}$/.test(input.requestKey))
            fail('invalid_request_key');
        return this.repo.transaction(async (tx) => {
            const account = await tx.account(actor.id);
            if (!account?.registered || !account.pilot || account.blocked)
                fail('account_not_eligible');
            const old = await tx.orderByRequest(actor.id, input.requestKey);
            if (old) {
                if (old.offer.id !== input.offerId || old.offer.revision !== input.offerRevision)
                    fail('request_key_reused');
                return this.expire(tx, old);
            }
            if (!await tx.checkoutEnabled())
                fail('checkout_disabled');
            const offer = await tx.offer(input.offerId);
            if (!offer)
                fail('offer_unavailable');
            validateOffer(offer);
            if (offer.revision !== input.offerRevision)
                fail('price_changed');
            if (!await tx.gamesAvailable(offer.gameIds, offer.scope === 'all'))
                fail('game_unavailable');
            const now = this.clock();
            const order: Order = { id: this.id(), ownerId: actor.id, requestKey: input.requestKey, offer: structuredClone(offer),
                createdAt: now.toISOString(), expiresAt: new Date(now.getTime() + 30 * 60000).toISOString(), state: 'awaiting_payment' };
            await tx.putOrder(order);
            await this.audit(tx, 'order_created', order.id, actor.id, 'Server price snapshot');
            return order;
        });
    }
    async getOrder(session: unknown, orderId: string): Promise<Order> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            const order = await tx.order(orderId);
            if (!order || order.ownerId !== actor.id)
                fail('order_not_found');
            return this.expire(tx, order);
        });
    }
    async listOrders(session: unknown, options: {
        limit?: number;
        cursor?: OrderCursor | null;
    } = {}): Promise<OrderPage> {
        const actor = await this.identity.requireUser(session);
        const limit = options.limit ?? 20, cursor = options.cursor ?? null;
        if (!Number.isInteger(limit) || limit < 1 || limit > 50)
            fail('invalid_page');
        if (cursor && (!cursor.id || typeof cursor.id !== 'string' || cursor.id.length > 200 || typeof cursor.createdAt !== 'string' || !Number.isFinite(Date.parse(cursor.createdAt))))
            fail('invalid_page');
        return this.repo.transaction(async (tx) => {
            const rows = await tx.orders(actor.id, cursor, limit + 1);
            // Defense in depth if a persistence adapter omits its owner predicate.
            if (rows.some(o => o.ownerId !== actor.id))
                fail('repository_owner_mismatch');
            const grants = await tx.grants(actor.id), orders: OrderView[] = [];
            for (const row of rows.slice(0, limit))
                orders.push(this.present(await this.expire(tx, row), grants));
            const last = rows[Math.min(rows.length, limit) - 1];
            return { orders, nextCursor: rows.length > limit ? { createdAt: last.createdAt, id: last.id } : null, serverTime: this.clock().toISOString() };
        });
    }
    async orderDetails(session: unknown, id: string): Promise<{
        order: OrderView;
        serverTime: string;
    }> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            const order = await tx.order(id);
            if (!order || order.ownerId !== actor.id)
                fail('order_not_found');
            return { order: this.present(await this.expire(tx, order), await tx.grants(actor.id)), serverTime: this.clock().toISOString() };
        });
    }
    private present(order: Order, grants: RentalGrant[]): OrderView {
        return { id: order.id, title: order.offer.title, scope: order.offer.scope, gameIds: [...order.offer.gameIds], term: order.offer.term,
            amount: order.offer.amount, currency: order.offer.currency, state: order.state, createdAt: order.createdAt, expiresAt: order.expiresAt,
            ...(order.paidAt ? { paidAt: order.paidAt } : {}), grants: grants.filter(g => g.orderId === order.id && g.ownerId === order.ownerId)
                .map(g => ({ startsAt: g.startsAt, expiresAt: g.expiresAt, ...(g.revokedAt ? { revokedAt: g.revokedAt } : {}) })) };
    }
    async cancelOrder(session: unknown, orderId: string): Promise<Order> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            const order = await tx.order(orderId);
            if (!order || order.ownerId !== actor.id)
                fail('order_not_found');
            await this.expire(tx, order);
            if (order.state === 'cancelled' || order.state === 'expired')
                return order;
            if (order.state !== 'awaiting_payment')
                fail('order_cannot_cancel');
            order.state = 'cancelled';
            await tx.putOrder(order);
            await this.audit(tx, 'order_cancelled', order.id, actor.id, 'Cancelled before payment');
            return order;
        });
    }
    private async expire(tx: Transaction, order: Order) {
        if (order.state === 'awaiting_payment' && Date.parse(order.expiresAt) <= this.clock().getTime()) {
            order.state = 'expired';
            await tx.putOrder(order);
            await this.audit(tx, 'order_expired', order.id, 'system', 'Payment window elapsed');
        }
        return order;
    }
    /** The only payment entry point: no public method accepting an unverified event. */
    async handleWebhook(rawBody: Uint8Array, headers: Readonly<Record<string, string>>): Promise<Settlement> {
        const e = await this.verifier.verify(rawBody, headers);
        validateEvent(e, this.clock());
        const eventKey = key(e.provider, e.eventId), paymentKey = key(e.provider, e.paymentId);
        const fingerprint = JSON.stringify([e.provider, e.eventId, e.paymentId, e.orderId, e.kind, e.amount, e.currency, e.occurredAt]);
        return this.repo.transaction(async (tx) => {
            const receipt = await tx.event(eventKey);
            if (receipt) {
                if (receipt.fingerprint !== fingerprint)
                    fail('event_id_conflict');
                return receipt.result;
            }
            const order = await tx.order(e.orderId);
            if (!order)
                fail('unknown_order');
            const previous = await tx.payment(paymentKey);
            if (previous && previous.orderId !== order.id)
                fail('payment_order_conflict');
            const finish = async (result: Settlement) => { await tx.putEvent(eventKey, { fingerprint, result }); await this.audit(tx, `payment_${result.outcome}`, order.id, e.provider, result.reason || e.kind); return result; };
            const review = async (reason: string) => {
                if (!previous)
                    await tx.putPayment({ key: paymentKey, orderId: order.id, state: 'review', amount: e.kind === 'paid' ? e.amount : 0, currency: e.currency, refundedTotal: e.kind === 'refunded' ? e.amount : 0 });
                if (order.state !== 'paid' && order.state !== 'refunded') {
                    order.state = 'review';
                    await tx.putOrder(order);
                }
                return finish({ outcome: 'review', orderId: order.id, reason });
            };
            if (e.currency !== order.offer.currency)
                return review('currency_mismatch');
            if (e.kind === 'refunded') {
                if (e.amount !== order.offer.amount)
                    return review('partial_or_excess_refund');
                if (previous?.state === 'refunded')
                    return finish({ outcome: 'duplicate', orderId: order.id });
                await tx.putPayment({ key: paymentKey, orderId: order.id, state: 'refunded', amount: previous?.amount ?? 0, currency: e.currency, refundedTotal: e.amount });
                // A refund for a second accidental payment must not revoke the accepted payment.
                if (!order.paymentKey || order.paymentKey === paymentKey) {
                    order.state = 'refunded';
                    await tx.putOrder(order);
                    for (const grant of await tx.grants(order.ownerId))
                        if (grant.orderId === order.id && !grant.revokedAt) {
                            grant.revokedAt = this.clock().toISOString();
                            await tx.putGrant(grant);
                        }
                }
                return finish({ outcome: 'refunded', orderId: order.id });
            }
            if (e.amount !== order.offer.amount)
                return review('amount_mismatch');
            if (previous?.state === 'refunded')
                return finish({ outcome: 'duplicate', orderId: order.id, reason: 'already_refunded' });
            if (previous?.state === 'paid')
                return finish({ outcome: 'duplicate', orderId: order.id });
            if (previous?.state === 'review')
                return review('payment_requires_review');
            if (order.state === 'paid')
                return review('extra_payment');
            if (!['awaiting_payment', 'expired'].includes(order.state))
                return review('order_not_payable');
            if (Date.parse(e.occurredAt) < Date.parse(order.createdAt) || Date.parse(e.occurredAt) >= Date.parse(order.expiresAt))
                return review('outside_payment_window');
            const now = this.clock().toISOString(), coverage = coverageKey(order.offer);
            let start = now;
            for (const grant of await tx.grants(order.ownerId))
                if (!grant.revokedAt && grant.coverageKey === coverage && Date.parse(grant.expiresAt) > Date.parse(start))
                    start = grant.expiresAt;
            const grant: RentalGrant = { id: this.id(), orderId: order.id, ownerId: order.ownerId, coverageKey: coverage,
                gameIds: [...order.offer.gameIds], allGames: order.offer.scope === 'all', startsAt: start, expiresAt: addTerm(start, order.offer.term) };
            await tx.putGrant(grant);
            order.state = 'paid';
            order.paidAt = now;
            order.paymentKey = paymentKey;
            await tx.putOrder(order);
            await tx.putPayment({ key: paymentKey, orderId: order.id, state: 'paid', amount: e.amount, currency: e.currency, refundedTotal: 0 });
            return finish({ outcome: 'unlocked', orderId: order.id });
        });
    }
    private audit(tx: Transaction, action: string, targetId: string, actor: string, reason: string) { return tx.audit({ action, targetId, actor, reason, at: this.clock().toISOString() }); }
}
