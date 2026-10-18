import type { Order, Payment, RentalGrant } from './types';
import type { ReconciliationFinding } from '../../shared/rental-reconciliation';
/** Inspect one consistent snapshot; never repair financial records as a side effect. */
export function inspectOrder(order: Order, payment: Payment | null, grants: RentalGrant[]): ReconciliationFinding[] {
    const codes = new Set<ReconciliationFinding['code']>();
    const own = grants.filter(g => g.orderId === order.id);
    if (order.state === 'paid' && !own.length) codes.add('paid_without_grant');
    if (own.length > 1) codes.add('duplicate_grants');
    if (own.some(g => g.ownerId !== order.ownerId)) codes.add('grant_owner_mismatch');
    const coverage = JSON.stringify([order.offer.scope === 'all' ? 'all' : 'games', ...order.offer.gameIds.slice().sort()]);
    if (own.some(g => g.coverageKey !== coverage || g.allGames !== (order.offer.scope === 'all') || JSON.stringify([...g.gameIds].sort()) !== JSON.stringify([...order.offer.gameIds].sort()))) codes.add('grant_coverage_mismatch');
    if (own.some(g => !Number.isFinite(Date.parse(g.startsAt)) || !Number.isFinite(Date.parse(g.expiresAt)) || Date.parse(g.startsAt) >= Date.parse(g.expiresAt))) codes.add('invalid_grant_dates');
    const refunded = order.state === 'refunded' || payment?.state === 'refunded';
    if (refunded && own.some(g => !g.revokedAt)) codes.add('refunded_unrevoked_grant');
    if (!refunded && order.state !== 'paid' && own.some(g => !g.revokedAt)) codes.add('unsettled_unrevoked_grant');
    if (order.state === 'paid' && (!payment || payment.key !== order.paymentKey || payment.orderId !== order.id || payment.state !== 'paid' || payment.amount !== order.offer.amount || payment.currency !== order.offer.currency || payment.refundedTotal !== 0)) codes.add('paid_payment_mismatch');
    return [...codes].map(code => ({orderId: order.id, code}));
}
