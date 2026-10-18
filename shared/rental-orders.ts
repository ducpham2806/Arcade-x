/** Public order DTOs. Never send internal payment IDs, owner IDs or request keys. */
export type OrderState = 'awaiting_payment' | 'paid' | 'cancelled' | 'expired' | 'review' | 'refunded';
export interface OrderCursor {
    createdAt: string;
    id: string;
}
export interface OrderView {
    id: string;
    title: string;
    scope: 'game' | 'bundle' | 'all';
    gameIds: string[];
    term: '7d' | '14d' | '30d' | '3m' | '6m' | '1y';
    amount: number;
    currency: 'VND';
    state: OrderState;
    createdAt: string;
    expiresAt: string;
    paidAt?: string;
    grants: {
        startsAt: string;
        expiresAt: string;
        revokedAt?: string;
    }[];
}
export interface OrderPage {
    orders: OrderView[];
    nextCursor: OrderCursor | null;
    serverTime: string;
}
