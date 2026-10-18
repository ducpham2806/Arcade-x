import type { OrderView } from './rental-orders';
export interface RentalQuote {
    offerId: string;
    revision: string;
    title: string;
    scope: OrderView['scope'];
    gameIds: string[];
    term: OrderView['term'];
    amount: number;
    currency: 'VND';
    serverTime: string;
}
export interface CheckoutLink {
    orderId: string;
    url: string;
    expiresAt: string;
    serverTime: string;
}
export interface CreateRentalOrder {
    offerId: string;
    offerRevision: string;
    requestKey: string;
}
