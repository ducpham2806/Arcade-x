import { CommerceError } from './service';
import type { CommerceRepository, IdentityProvider, CheckoutProvider, CheckoutRecord, Order, Transaction } from './types';
import type { CheckoutLink } from '../../shared/rental-checkout';
const fail = (code: string): never => { throw new CommerceError(code); };
export class CheckoutCoordinator {
    private origins: Set<string>;
    constructor(private repo: CommerceRepository, private identity: IdentityProvider, private provider: CheckoutProvider, private namespace: string, allowedOrigins: string[], private clock: () => Date = () => new Date(), private id: () => string = () => crypto.randomUUID()) {
        if (!/^[A-Za-z0-9_-]{1,50}$/.test(namespace) || !/^[A-Za-z0-9_-]{1,50}$/.test(provider.id) || !allowedOrigins.length)
            fail('checkout_invalid_configuration');
        this.origins = new Set(allowedOrigins.map(v => { const u = this.url(v); if (u.pathname !== '/' || u.search || u.hash)
            fail('checkout_invalid_configuration'); return u.origin; }));
    }
    private url(value: string) { try {
        const u = new URL(value);
        if (u.protocol !== 'https:' || u.username || u.password)
            fail('checkout_invalid_url');
        return u;
    }
    catch {
        fail('checkout_invalid_url');
    } }
    private publicLink(c: CheckoutRecord): CheckoutLink {
        const u = this.url(c.url!);
        if (!this.origins.has(u.origin) || !c.expiresAt || Date.parse(c.expiresAt) <= this.clock().getTime())
            fail('checkout_session_expired');
        return { orderId: c.orderId, url: u.href, expiresAt: c.expiresAt, serverTime: this.clock().toISOString() };
    }
    private async eligible(tx: Transaction, owner: string, orderId: string): Promise<Order> {
        const order = await tx.order(orderId);
        if (!order || order.ownerId !== owner)
            fail('order_not_found');
        const account = await tx.account(owner);
        if (!account?.registered || !account.pilot || account.blocked)
            fail('account_not_eligible');
        if (!await tx.checkoutEnabled())
            fail('checkout_disabled');
        if (order.state !== 'awaiting_payment' || Date.parse(order.expiresAt) <= this.clock().getTime())
            fail('checkout_order_changed');
        if (!await tx.gamesAvailable(order.offer.gameIds, order.offer.scope === 'all'))
            fail('game_unavailable');
        return order;
    }
    async begin(session: unknown, orderId: string): Promise<CheckoutLink> {
        const actor = await this.identity.requireUser(session);
        const reservation = await this.repo.transaction(async (tx) => {
            const order = await this.eligible(tx, actor.id, orderId), old = await tx.checkout(orderId);
            if (old && (old.provider !== this.provider.id || old.requestKey !== `${this.namespace}:${this.provider.id}:${orderId}`))
                fail('checkout_provider_changed');
            if (old?.state === 'ready')
                return { order, record: old, ready: true };
            if (old && Date.parse(old.leaseUntil) > this.clock().getTime())
                fail('checkout_in_progress');
            const record: CheckoutRecord = { orderId, provider: this.provider.id, requestKey: old?.requestKey ?? `${this.namespace}:${this.provider.id}:${orderId}`,
                leaseToken: this.id(), leaseUntil: new Date(this.clock().getTime() + 45000).toISOString(), state: 'creating' };
            await tx.putCheckout(record);
            await tx.audit({ action: 'checkout_reserved', targetId: orderId, actor: actor.id, at: this.clock().toISOString(), reason: 'Reserve idempotent provider session' });
            return { order, record, ready: false };
        });
        if (reservation.ready)
            return this.publicLink(reservation.record);
        const { record, order } = reservation;
        try {
            // External request is outside the database transaction. Retries use the same key.
            const result = await this.provider.create({ orderId, amount: order.offer.amount, currency: order.offer.currency, expiresAt: order.expiresAt, idempotencyKey: record.requestKey });
            const u = this.url(result.url);
            if (!this.origins.has(u.origin) || result.orderId !== orderId || result.amount !== order.offer.amount || result.currency !== order.offer.currency || typeof result.reference !== 'string' || !result.reference.trim() || result.reference.length > 200 || typeof result.expiresAt !== 'string' || !Number.isFinite(Date.parse(result.expiresAt)) || Date.parse(result.expiresAt) <= this.clock().getTime() || Date.parse(result.expiresAt) > Date.parse(order.expiresAt))
                fail('checkout_invalid_session');
            return await this.repo.transaction(async (tx) => {
                const current = await tx.checkout(orderId);
                if (!current || current.leaseToken !== record.leaseToken)
                    fail('checkout_in_progress');
                await this.eligible(tx, actor.id, orderId);
                const collision = await tx.checkoutByReference(this.provider.id, result.reference);
                if (collision && collision.orderId !== orderId)
                    fail('checkout_reference_conflict');
                const ready: CheckoutRecord = { ...record, state: 'ready', reference: result.reference, url: u.href, expiresAt: result.expiresAt };
                await tx.putCheckout(ready);
                await tx.audit({ action: 'checkout_ready', targetId: orderId, actor: actor.id, at: this.clock().toISOString(), reason: 'Provider session verified against order snapshot' });
                return this.publicLink(ready);
            });
        }
        catch (e) {
            // Retain the immutable key for ambiguous provider outcomes; never create a new payment.
            await this.repo.transaction(async (tx) => {
                const current = await tx.checkout(orderId);
                if (current?.leaseToken === record.leaseToken && current.state === 'creating') {
                    current.leaseUntil = this.clock().toISOString();
                    await tx.putCheckout(current);
                    await tx.audit({ action: 'checkout_retry_required', targetId: orderId, actor: actor.id, at: this.clock().toISOString(), reason: 'Provider session could not be confirmed' });
                }
            });
            if (e instanceof CommerceError)
                throw e;
            fail('checkout_provider_unavailable');
        }
    }
}
