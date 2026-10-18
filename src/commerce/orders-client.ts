import type { OrderCursor, OrderPage, OrderView } from '../../shared/rental-orders';
export class OrdersError extends Error {
    constructor(public code: string) { super(code); }
}
export interface OrdersClient {
    enabled: boolean;
    list(owner: string, cursor?: OrderCursor | null, signal?: AbortSignal): Promise<OrderPage>;
    detail(owner: string, id: string, signal?: AbortSignal): Promise<{
        order: OrderView;
        serverTime: string;
    }>;
    cancel(owner: string, id: string, signal?: AbortSignal): Promise<{
        order: OrderView;
        serverTime: string;
    }>;
}
const states = ['awaiting_payment', 'paid', 'cancelled', 'expired', 'review', 'refunded'];
const terms = ['7d', '14d', '30d', '3m', '6m', '1y'];
const date = (x: unknown) => typeof x === 'string' && Number.isFinite(Date.parse(x));
const validId = (x: unknown) => typeof x === 'string' && /^[A-Za-z0-9_-]{1,200}$/.test(x);
export function validOrder(o: any): o is OrderView { return o && validId(o.id) && typeof o.title === 'string' && ['game', 'bundle', 'all'].includes(o.scope) && Array.isArray(o.gameIds) && o.gameIds.every(x => typeof x === 'string') && terms.includes(o.term) && Number.isSafeInteger(o.amount) && o.amount > 0 && o.currency === 'VND' && states.includes(o.state) && date(o.createdAt) && date(o.expiresAt) && (o.paidAt === undefined || date(o.paidAt)) && Array.isArray(o.grants) && o.grants.every(g => g && date(g.startsAt) && date(g.expiresAt) && (g.revokedAt === undefined || date(g.revokedAt))); }
const validCursor = (c: any) => c === null || c && validId(c.id) && date(c.createdAt);
export type RentalClientOptions = {
    enabled: boolean;
    readSession: () => Promise<{
        owner: string;
        token: string;
    } | null>;
    fetcher?: typeof fetch;
};
export function createRentalTransport(options: RentalClientOptions) {
    const fetcher = options.fetcher ?? fetch;
    async function request(owner: string, path: string, method: string, signal?: AbortSignal, payload: unknown = {}) {
        if (!options.enabled)
            throw new OrdersError('orders_unavailable');
        const controller = new AbortController();
        const abort = () => controller.abort();
        signal?.addEventListener('abort', abort, { once: true });
        if (signal?.aborted)
            abort();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const session = await options.readSession();
            if (!session || session.owner !== owner)
                throw new OrdersError('account_changed');
            controller.signal.throwIfAborted();
            const response = await fetcher('/api/rentals' + path, { method, headers: { Authorization: `Bearer ${session.token}`, ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {}) },
                ...(method === 'POST' ? { body: JSON.stringify(payload) } : {}), cache: 'no-store', credentials: 'omit', signal: controller.signal, redirect: 'error' });
            const body = await response.json().catch(() => { throw new OrdersError('invalid_response'); });
            const latest = await options.readSession();
            if (!latest || latest.owner !== owner)
                throw new OrdersError('account_changed');
            controller.signal.throwIfAborted();
            if (!response.ok)
                throw new OrdersError(typeof body?.error === 'string' ? body.error : 'service_unavailable');
            return body;
        }
        catch (e) {
            if (controller.signal.aborted) {
                if (signal?.aborted)
                    throw new DOMException('Aborted', 'AbortError');
                throw new OrdersError('request_timeout');
            }
            if (e instanceof OrdersError)
                throw e;
            throw new OrdersError('network_error');
        }
        finally {
            clearTimeout(timer);
            signal?.removeEventListener('abort', abort);
        }
    }
    return request;
}
export function createOrdersClient(options: RentalClientOptions): OrdersClient {
    const transport = createRentalTransport(options);
    const request = (owner: string, path: string, method: string, signal?: AbortSignal) => transport(owner, '/orders' + path, method, signal);
    async function detail(owner: string, id: string, method: string, signal?: AbortSignal) {
        if (!validId(id))
            throw new OrdersError('invalid_response');
        const data = await request(owner, `/${encodeURIComponent(id)}${method === 'POST' ? '/cancel' : ''}`, method, signal);
        if (!validOrder(data?.order) || !date(data?.serverTime))
            throw new OrdersError('invalid_response');
        return data as {
            order: OrderView;
            serverTime: string;
        };
    }
    return { enabled: options.enabled,
        async list(owner, cursor, signal) {
            const params = new URLSearchParams({ limit: '20' });
            if (cursor)
                params.set('cursor', JSON.stringify(cursor));
            const data = await request(owner, '?' + params, 'GET', signal);
            if (!data || !Array.isArray(data.orders) || data.orders.length > 20 || !data.orders.every(validOrder) || !date(data.serverTime) || !validCursor(data.nextCursor))
                throw new OrdersError('invalid_response');
            return data as OrderPage;
        },
        detail: (owner, id, signal) => detail(owner, id, 'GET', signal), cancel: (owner, id, signal) => detail(owner, id, 'POST', signal) };
}
export function orderErrorText(e: unknown): string {
    const code = e instanceof OrdersError ? e.code : '';
    return ({ orders_unavailable: 'Lịch sử đơn thuê chưa được mở. Các đơn sẽ xuất hiện tại đây khi dịch vụ được kết nối.',
        account_changed: 'Tài khoản đã thay đổi. Hãy mở lại lịch sử đơn.', unauthenticated: 'Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.',
        order_cannot_cancel: 'Đơn đã thay đổi trạng thái nên không thể hủy. Hãy cập nhật để kiểm tra.', order_not_found: 'Không tìm thấy đơn trong tài khoản này.',
        rate_limited: 'Bạn thao tác hơi nhanh. Hãy chờ một chút rồi thử lại.', request_timeout: 'Yêu cầu mất nhiều thời gian. Hãy cập nhật để kiểm tra kết quả trước khi thử lại.',
        invalid_response: 'Chưa nhận được dữ liệu đơn hợp lệ. Hãy thử lại sau.', network_error: 'Chưa kết nối được dịch vụ. Hãy kiểm tra mạng rồi thử lại.' } as Record<string, string>)[code] || 'Dịch vụ đơn thuê tạm thời chưa sẵn sàng. Hãy thử lại sau.';
}
