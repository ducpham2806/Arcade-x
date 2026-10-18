import type { RentalQuote } from '../../shared/rental-checkout';
import type { ReviewStatus, ReviewPage, ReviewView, ReviewReply, ReviewDecision } from '../../shared/rental-reviews';
import type { OrderCursor, OrderPage, OrderView } from '../../shared/rental-orders';
import type { CommerceRepository, IdentityProvider, PaymentVerifier, Offer, Order, PaymentEvent, Settlement, Term, Transaction, RentalGrant, ReviewCase } from './types';
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
    async quote(session: unknown, offerId: string): Promise<RentalQuote> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            const account = await tx.account(actor.id);
            if (!account?.registered || !account.pilot || account.blocked)
                fail('account_not_eligible');
            if (!await tx.checkoutEnabled())
                fail('checkout_disabled');
            const offer = await tx.offer(offerId);
            if (!offer)
                fail('offer_unavailable');
            validateOffer(offer);
            if (!await tx.gamesAvailable(offer.gameIds, offer.scope === 'all'))
                fail('game_unavailable');
            return { offerId: offer.id, revision: offer.revision, title: offer.title, scope: offer.scope, gameIds: [...offer.gameIds], term: offer.term, amount: offer.amount, currency: offer.currency, serverTime: this.clock().toISOString() };
        });
    }
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
                const at = this.clock().toISOString();
                await tx.putReview({ id: this.id(), orderId: order.id, paymentKey, reason, event: { provider: e.provider, eventId: e.eventId, paymentId: e.paymentId, orderId: e.orderId, kind: e.kind, amount: e.amount, currency: e.currency, occurredAt: e.occurredAt },
                    status: 'open', revision: 1, createdAt: at, updatedAt: at, history: [] });
                return finish({ outcome: 'review', orderId: order.id, reason });
            };
            const expectedCurrency = e.kind === 'refunded' && previous && previous.amount > 0 ? previous.currency : order.offer.currency;
            if (e.currency !== expectedCurrency)
                return review('currency_mismatch');
            if (e.kind === 'refunded') {
                const refundable = previous && previous.amount > 0 ? previous.amount : order.offer.amount;
                if (e.amount !== refundable)
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
                for (const c of await tx.reviewsForPayment(paymentKey)) {
                    c.status = 'resolved';
                    c.revision++;
                    c.updatedAt = this.clock().toISOString();
                    c.history.push({ action: 'provider_refund', actorId: e.provider, reason: 'Verified full refund received', at: c.updatedAt });
                    await tx.putReview(c);
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
            await this.grantPayment(tx, order, paymentKey, e.amount, e.currency);
            return finish({ outcome: 'unlocked', orderId: order.id });
        });
    }
    async listReviews(session: unknown, options: {
        status?: ReviewStatus | 'all';
        limit?: number;
        cursor?: OrderCursor | null;
    } = {}): Promise<ReviewPage> {
        const actor = await this.identity.requireUser(session), status = options.status ?? 'open', limit = options.limit ?? 20, cursor = options.cursor ?? null;
        return this.repo.transaction(async (tx) => {
            await this.requireAdmin(tx, actor.id);
            if (!['open', 'awaiting_refund', 'resolved', 'all'].includes(status) || !Number.isInteger(limit) || limit < 1 || limit > 50 || cursor && (!cursor.id || typeof cursor.id !== 'string' || cursor.id.length > 200 || typeof cursor.createdAt !== 'string' || !Number.isFinite(Date.parse(cursor.createdAt))))
                fail('invalid_page');
            const rows = await tx.reviews(status, cursor, limit + 1), reviews: ReviewView[] = [];
            for (const c of rows.slice(0, limit))
                reviews.push(await this.reviewView(tx, c));
            const last = rows[Math.min(rows.length, limit) - 1];
            return { reviews, nextCursor: rows.length > limit ? { createdAt: last.createdAt, id: last.id } : null, serverTime: this.clock().toISOString() };
        });
    }
    async reviewDetails(session: unknown, id: string): Promise<ReviewReply> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            await this.requireAdmin(tx, actor.id);
            const c = await tx.review(id);
            if (!c)
                fail('review_not_found');
            return { review: await this.reviewView(tx, c), serverTime: this.clock().toISOString() };
        });
    }
    async decideReview(session: unknown, id: string, input: ReviewDecision): Promise<ReviewReply> {
        const actor = await this.identity.requireUser(session);
        return this.repo.transaction(async (tx) => {
            await this.requireAdmin(tx, actor.id);
            if (!input || !['grant_access', 'queue_refund', 'dismiss', 'note'].includes(input.action) || !Number.isSafeInteger(input.expectedRevision) || input.expectedRevision < 1 || typeof input.reason !== 'string' || input.reason.trim().length < 3 || input.reason.trim().length > 500 || typeof input.requestKey !== 'string' || !/^[A-Za-z0-9_-]{16,100}$/.test(input.requestKey))
                fail('invalid_review_decision');
            const reason = input.reason.trim(), fingerprint = JSON.stringify([id, input.action, input.expectedRevision, reason]);
            const previous = await tx.reviewCommand(actor.id, input.requestKey);
            if (previous) {
                if (previous.fingerprint !== fingerprint || previous.reviewId !== id)
                    fail('request_key_reused');
                const saved = await tx.review(id);
                if (!saved)
                    fail('review_not_found');
                return { review: await this.reviewView(tx, saved), serverTime: this.clock().toISOString() };
            }
            const c = await tx.review(id);
            if (!c)
                fail('review_not_found');
            if (c.revision !== input.expectedRevision)
                fail('review_stale');
            if (c.status === 'resolved')
                fail('review_closed');
            const before = structuredClone(c), view = await this.reviewView(tx, c);
            if (input.action === 'grant_access') {
                if (!view.canGrant)
                    fail('review_grant_forbidden');
                const order = await tx.order(c.orderId);
                await this.grantPayment(tx, order!, c.paymentKey, c.event.amount, c.event.currency);
                c.status = 'resolved';
            }
            else if (input.action === 'queue_refund')
                c.status = 'awaiting_refund';
            else if (input.action === 'dismiss')
                c.status = 'resolved';
            c.revision++;
            c.updatedAt = this.clock().toISOString();
            c.history.push({ action: input.action, actorId: actor.id, reason, at: c.updatedAt });
            await tx.putReview(c);
            await tx.audit({ action: 'review_' + input.action, targetId: c.id, actor: actor.id, at: c.updatedAt, reason, before, after: structuredClone(c) });
            await tx.putReviewCommand({ adminId: actor.id, requestKey: input.requestKey, fingerprint, reviewId: id });
            return { review: await this.reviewView(tx, c), serverTime: this.clock().toISOString() };
        });
    }
    private async requireAdmin(tx: Transaction, id: string) {
        if (!await tx.isAdmin(id))
            fail('admin_required');
    }
    private async reviewView(tx: Transaction, c: ReviewCase): Promise<ReviewView> {
        const o = await tx.order(c.orderId);
        if (!o)
            fail('review_not_found');
        const p = await tx.payment(c.paymentKey), account = await tx.account(o.ownerId);
        const grants = await tx.grants(o.ownerId);
        const blocked = c.status !== 'open' ? 'not_open' : c.event.kind !== 'paid' ? 'refund_event' :
            c.event.currency !== o.offer.currency || c.event.amount !== o.offer.amount ? 'amount_or_currency_mismatch' :
                !p || p.state !== 'review' || p.orderId !== o.id || p.amount !== c.event.amount || p.currency !== c.event.currency || p.refundedTotal > 0 ? 'payment_not_eligible' :
                    o.paymentKey || !['review', 'cancelled', 'expired', 'awaiting_payment'].includes(o.state) ? 'order_already_settled' :
                        !account?.registered ? 'account_unavailable' : grants.some(g => g.orderId === o.id) ? 'grant_exists' : null;
        return { id: c.id, orderId: o.id, ownerId: o.ownerId, title: o.offer.title, orderState: o.state, expectedAmount: o.offer.amount, expectedCurrency: o.offer.currency,
            reason: c.reason, status: c.status, event: { provider: c.event.provider, eventId: c.event.eventId, paymentId: c.event.paymentId, kind: c.event.kind, amount: c.event.amount, currency: c.event.currency, occurredAt: c.event.occurredAt }, revision: c.revision, createdAt: c.createdAt, updatedAt: c.updatedAt,
            canGrant: blocked === null, grantBlockReason: blocked, history: c.history.slice(-20).map(h => ({ ...h })) };
    }
    private async grantPayment(tx: Transaction, order: Order, paymentKey: string, amount: number, currency: string) {
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
        await tx.putPayment({ key: paymentKey, orderId: order.id, state: 'paid', amount, currency, refundedTotal: 0 });
    }
    private audit(tx: Transaction, action: string, targetId: string, actor: string, reason: string) { return tx.audit({ action, targetId, actor, reason, at: this.clock().toISOString() }); }
}
