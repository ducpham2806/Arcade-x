import type { CheckoutCoordinator } from './checkout';
import { CommerceError, CommerceService } from './service';
import type { OrderCursor } from '../../shared/rental-orders';
import type { ReviewDecision, ReviewStatus } from '../../shared/rental-reviews';
const reviewBase = '/api/rentals/admin/reviews';
const base = '/api/rentals/orders';
const errorStatus: Record<string, number> = { checkout_order_changed: 409, checkout_in_progress: 409, checkout_session_expired: 409, checkout_provider_changed: 409, checkout_invalid_session: 503, checkout_invalid_url: 503, checkout_reference_conflict: 503, checkout_provider_unavailable: 503, admin_required: 403, admin_mfa_required: 403, admin_permission_required: 403, review_not_found: 404, invalid_review_decision: 400, review_stale: 409, review_closed: 409, review_grant_forbidden: 409, unauthenticated: 401, account_not_eligible: 403, order_not_found: 404,
    invalid_page: 400, invalid_request_key: 400, price_changed: 409, request_key_reused: 409, order_cannot_cancel: 409,
    checkout_disabled: 503, offer_unavailable: 409, game_unavailable: 409, invalid_offer: 409 };
function json(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store, private', 'Vary': 'Authorization', 'X-Content-Type-Options': 'nosniff' } });
}
class BoundaryError extends Error {
    constructor(public status: number, public code: string) { super(code); }
}
function bad(code: string): never { throw new BoundaryError(400, code); }
async function readBody(request: Request) {
    if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json')
        throw new BoundaryError(415, 'json_required');
    const declared = request.headers.get('content-length');
    if (declared && (!/^\d+$/.test(declared) || Number(declared) > 4096))
        throw new BoundaryError(413, 'body_too_large');
    const reader = request.body?.getReader();
    if (!reader)
        bad('invalid_body');
    let size = 0;
    const chunks: Uint8Array[] = [];
    try {
        for (;;) {
            const { done, value } = await reader.read();
            if (done)
                break;
            size += value.byteLength;
            if (size > 4096) {
                await reader.cancel();
                throw new BoundaryError(413, 'body_too_large');
            }
            chunks.push(value);
        }
    }
    finally {
        reader.releaseLock();
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
        bytes.set(chunk, offset);
        offset += chunk.length;
    }
    try {
        const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
        if (!value || typeof value !== 'object' || Array.isArray(value))
            bad('invalid_body');
        return value as Record<string, unknown>;
    }
    catch (e) {
        if (e instanceof BoundaryError)
            throw e;
        bad('invalid_json');
    }
}
function cursor(value: string | null): OrderCursor | null {
    if (value === null)
        return null;
    if (value.length > 1000)
        bad('invalid_page');
    try {
        const v = JSON.parse(value);
        if (!v || typeof v.id !== 'string' || typeof v.createdAt !== 'string' || Object.keys(v).some(k => !['id', 'createdAt'].includes(k)))
            bad('invalid_page');
        return v;
    }
    catch {
        bad('invalid_page');
    }
}
/** Host-independent boundary, not a deployed endpoint. Factory defaults disabled.
 * Production host must provide durable authenticated rate limiting before enabling it.
 * IdentityProvider independently verifies the bearer token on every service operation. */
export function createCommerceHandler(service: CommerceService, options: {
    enabled?: boolean;
    checkoutEnabled?: boolean;
    checkout?: CheckoutCoordinator;
    reviewEnabled?: boolean;
    allowRequest?: (request: Request) => Promise<boolean>;
} = {}) {
    return async (request: Request): Promise<Response> => {
        try {
            if (!options.enabled || !options.allowRequest)
                return json({ error: 'orders_unavailable' }, 503);
            const url = new URL(request.url);
            const quoteMatch = url.pathname.match(/^\/api\/rentals\/offers\/([A-Za-z0-9_-]{1,200})\/quote$/);
            const isReview = url.pathname === reviewBase || url.pathname.startsWith(reviewBase + '/');
            if (isReview && !options.reviewEnabled)
                return json({ error: 'reviews_unavailable' }, 503);
            if (!quoteMatch && !isReview && url.pathname !== base && !url.pathname.startsWith(base + '/'))
                return json({ error: 'not_found' }, 404);
            const auth = request.headers.get('authorization');
            if (!auth || !/^Bearer [^\s]{1,8192}$/.test(auth))
                return json({ error: 'unauthenticated' }, 401);
            if (!await options.allowRequest(request))
                return json({ error: 'rate_limited' }, 429);
            if (quoteMatch) {
                if (!options.checkoutEnabled || !options.checkout)
                    return json({ error: 'checkout_disabled' }, 503);
                if (request.method !== 'GET' || url.search)
                    return json({ error: 'method_not_allowed' }, 405);
                return json(await service.quote(auth.slice(7), quoteMatch[1]));
            }
            const session = auth.slice(7), parts = url.pathname.slice((isReview ? reviewBase : base).length).split('/').filter(Boolean);
            if (parts.length > 2 || parts.some(p => !/^[A-Za-z0-9_-]{1,200}$/.test(p)))
                bad('invalid_path');
            if (isReview) {
                if (!parts.length && request.method === 'GET') {
                    if ([...url.searchParams.keys()].some(k => !['limit', 'cursor', 'status'].includes(k)) || ['limit', 'cursor', 'status'].some(k => url.searchParams.getAll(k).length > 1))
                        bad('invalid_page');
                    const raw = url.searchParams.get('limit');
                    if (raw !== null && !/^\d{1,2}$/.test(raw))
                        bad('invalid_page');
                    return json(await service.listReviews(session, { limit: raw === null ? 20 : Number(raw), status: (url.searchParams.get('status') ?? 'open') as ReviewStatus | 'all', cursor: cursor(url.searchParams.get('cursor')) }));
                }
                if (url.search)
                    bad('unexpected_query');
                if (parts.length === 1 && request.method === 'GET')
                    return json(await service.reviewDetails(session, parts[0]));
                if (parts.length === 2 && parts[1] === 'decide' && request.method === 'POST') {
                    const body = await readBody(request);
                    if (Object.keys(body).some(k => !['action', 'expectedRevision', 'reason', 'requestKey'].includes(k)))
                        bad('unexpected_field');
                    return json(await service.decideReview(session, parts[0], body as unknown as ReviewDecision));
                }
                return json({ error: 'method_not_allowed' }, 405);
            }
            if (!parts.length && request.method === 'GET') {
                if ([...url.searchParams.keys()].some(k => !['limit', 'cursor'].includes(k)) || url.searchParams.getAll('limit').length > 1 || url.searchParams.getAll('cursor').length > 1)
                    bad('invalid_page');
                const raw = url.searchParams.get('limit');
                if (raw !== null && !/^\d{1,2}$/.test(raw))
                    bad('invalid_page');
                return json(await service.listOrders(session, { limit: raw === null ? 20 : Number(raw), cursor: cursor(url.searchParams.get('cursor')) }));
            }
            if (url.search)
                bad('unexpected_query');
            if (!parts.length && request.method === 'POST') {
                if (!options.checkoutEnabled || !options.checkout)
                    return json({ error: 'checkout_disabled' }, 503);
                const body = await readBody(request);
                if (Object.keys(body).some(k => !['offerId', 'offerRevision', 'requestKey'].includes(k)))
                    bad('unexpected_field');
                if (!['offerId', 'offerRevision', 'requestKey'].every(k => typeof body[k] === 'string' && (body[k] as string).length <= 200))
                    bad('invalid_body');
                const order = await service.createOrder(session, body as {
                    offerId: string;
                    offerRevision: string;
                    requestKey: string;
                });
                return json(await service.orderDetails(session, order.id), 201);
            }
            if (parts.length === 2 && parts[1] === 'checkout' && request.method === 'POST') {
                if (!options.checkoutEnabled || !options.checkout)
                    return json({ error: 'checkout_disabled' }, 503);
                const body = await readBody(request);
                if (Object.keys(body).length)
                    bad('unexpected_field');
                return json(await options.checkout.begin(session, parts[0]));
            }
            if (parts.length === 1 && request.method === 'GET')
                return json(await service.orderDetails(session, parts[0]));
            if (parts.length === 2 && parts[1] === 'cancel' && request.method === 'POST') {
                const body = await readBody(request);
                if (Object.keys(body).length)
                    bad('unexpected_field');
                await service.cancelOrder(session, parts[0]);
                return json(await service.orderDetails(session, parts[0]));
            }
            return json({ error: 'method_not_allowed' }, 405);
        }
        catch (e) {
            if (e instanceof BoundaryError)
                return json({ error: e.code }, e.status);
            if (e instanceof CommerceError)
                return json({ error: errorStatus[e.code] ? e.code : 'service_unavailable' }, errorStatus[e.code] ?? 503);
            return json({ error: 'service_unavailable' }, 503);
        }
    };
}
