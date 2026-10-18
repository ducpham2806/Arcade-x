import type { RentalQuote, CheckoutLink, CreateRentalOrder } from '../../shared/rental-checkout';
import type { OrderView } from '../../shared/rental-orders';
import { createRentalTransport, OrdersError, orderErrorText, validOrder, type RentalClientOptions } from './orders-client';
export interface CheckoutClient {
    enabled: boolean;
    quote(owner: string, offerId: string, signal?: AbortSignal): Promise<RentalQuote>;
    create(owner: string, input: CreateRentalOrder, signal?: AbortSignal): Promise<{
        order: OrderView;
        serverTime: string;
    }>;
    begin(owner: string, orderId: string, signal?: AbortSignal): Promise<CheckoutLink>;
}
const date = (v: unknown) => typeof v === 'string' && Number.isFinite(Date.parse(v));
const id = (v: unknown) => typeof v === 'string' && /^[A-Za-z0-9_-]{1,200}$/.test(v);
export function safePaymentUrl(value: string) { try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password ? u.href : null;
}
catch {
    return null;
} }
export function createCheckoutClient(options: RentalClientOptions): CheckoutClient {
    const request = createRentalTransport(options);
    return { enabled: options.enabled,
        async quote(owner, offerId, signal) {
            if (!id(offerId))
                throw new OrdersError('invalid_response');
            const q = await request(owner, `/offers/${offerId}/quote`, 'GET', signal);
            if (!q || q.offerId !== offerId || typeof q.revision !== 'string' || !q.revision || typeof q.title !== 'string' || !['game', 'bundle', 'all'].includes(q.scope) || !Array.isArray(q.gameIds) || !q.gameIds.every(v => typeof v === 'string') || !['7d', '14d', '30d', '3m', '6m', '1y'].includes(q.term) || !Number.isSafeInteger(q.amount) || q.amount <= 0 || q.currency !== 'VND' || !date(q.serverTime))
                throw new OrdersError('invalid_response');
            return q as RentalQuote;
        },
        async create(owner, input, signal) { const data = await request(owner, '/orders', 'POST', signal, input); if (!validOrder(data?.order) || !date(data?.serverTime))
            throw new OrdersError('invalid_response'); return data as {
            order: OrderView;
            serverTime: string;
        }; },
        async begin(owner, orderId, signal) {
            if (!id(orderId))
                throw new OrdersError('invalid_response');
            const data = await request(owner, `/orders/${orderId}/checkout`, 'POST', signal);
            if (!data || data.orderId !== orderId || typeof data.url !== 'string' || !safePaymentUrl(data.url) || !date(data.expiresAt) || !date(data.serverTime) || Date.parse(data.expiresAt) <= Date.parse(data.serverTime))
                throw new OrdersError('invalid_response');
            return data as CheckoutLink;
        } };
}
export function checkoutErrorText(e: unknown) {
    const code = e instanceof OrdersError ? e.code : '';
    return ({
        checkout_disabled: 'Thanh toán chưa được mở. Bạn có thể quay lại xem gói hoặc đơn thuê.', price_changed: 'Giá hoặc nội dung gói đã thay đổi. Hãy tải lại gói rồi kiểm tra trước khi tạo đơn.',
        checkout_order_changed: 'Đơn đã thay đổi hoặc hết hạn. Hãy kiểm tra trạng thái mới nhất.', checkout_in_progress: 'Phiên thanh toán đang được chuẩn bị. Hãy chờ một chút rồi thử lại với đơn này.',
        checkout_session_expired: 'Phiên thanh toán đã hết hạn. Hãy kiểm tra đơn thuê trước khi đặt lại.', checkout_provider_changed: 'Phiên thanh toán cũ chưa thể tiếp tục. Hãy kiểm tra đơn và liên hệ quản trị viên nếu cần.',
        checkout_provider_unavailable: 'Chưa kết nối được cổng thanh toán. Đơn của bạn vẫn được giữ; hãy thử lại sau.', checkout_invalid_session: 'Chưa xác nhận được phiên thanh toán hợp lệ. Hãy thử lại hoặc kiểm tra đơn thuê.',
        account_not_eligible: 'Tài khoản chưa được mở tính năng thuê hoặc đang có hạn chế truy cập.', game_unavailable: 'Game trong gói hiện chưa sẵn sàng. Hãy quay lại sau.', offer_unavailable: 'Gói này hiện chưa có sẵn. Hãy quay lại danh mục gói.'
    } as Record<string, string>)[code] || orderErrorText(e);
}
