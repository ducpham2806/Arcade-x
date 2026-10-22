import type { OrderCursor } from './rental-orders';
export type ReconciliationCode = 'paid_without_grant' | 'duplicate_grants' | 'grant_owner_mismatch' | 'grant_coverage_mismatch' | 'invalid_grant_dates' | 'refunded_unrevoked_grant' | 'unsettled_unrevoked_grant' | 'paid_payment_mismatch';
export interface ReconciliationFinding { orderId: string; code: ReconciliationCode }
export interface ReconciliationPage { findings: ReconciliationFinding[]; scanned: number; nextCursor: OrderCursor | null; serverTime: string }
