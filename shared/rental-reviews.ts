import type { OrderCursor, OrderState } from './rental-orders';
export type ReviewStatus = 'open' | 'awaiting_refund' | 'resolved';
export type ReviewAction = 'grant_access' | 'queue_refund' | 'dismiss' | 'note';
export interface ReviewEntry {
    action: ReviewAction | 'provider_refund';
    actorId: string;
    reason: string;
    at: string;
}
export interface ReviewView {
    id: string;
    orderId: string;
    ownerId: string;
    title: string;
    orderState: OrderState;
    expectedAmount: number;
    expectedCurrency: 'VND';
    reason: string;
    status: ReviewStatus;
    event: {
        provider: string;
        eventId: string;
        paymentId: string;
        kind: 'paid' | 'refunded';
        amount: number;
        currency: string;
        occurredAt: string;
    };
    revision: number;
    createdAt: string;
    updatedAt: string;
    canGrant: boolean;
    grantBlockReason: string | null;
    history: ReviewEntry[];
}
export interface ReviewPage {
    reviews: ReviewView[];
    nextCursor: OrderCursor | null;
    serverTime: string;
}
export interface ReviewReply {
    review: ReviewView;
    serverTime: string;
}
export interface ReviewDecision {
    action: ReviewAction;
    expectedRevision: number;
    reason: string;
    requestKey: string;
}
