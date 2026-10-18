import React, { useEffect, useRef, useState } from 'react';
import type { RentalQuote, CheckoutLink } from '../../shared/rental-checkout';
import type { OrderView } from '../../shared/rental-orders';
import { checkoutApi } from './checkout-api';
import { checkoutErrorText, safePaymentUrl, type CheckoutClient } from './checkout-client';
import { ordersApi } from './orders-api';
import { OrdersError, type OrdersClient } from './orders-client';
import { termOptions } from './api';
import './access-admin.css';
const states = { awaiting_payment: 'Chờ thanh toán', paid: 'Đã xác nhận thanh toán', cancelled: 'Đơn đã hủy', expired: 'Đơn đã hết hạn', review: 'Giao dịch cần đối soát', refunded: 'Đã hoàn tiền' };
const date = (v: string) => new Date(v).toLocaleString('vi-VN');
export function CheckoutFlow({ owner, offerId, initialOrderId, onBack, onHistory, api = checkoutApi, historyApi = ordersApi }: {
    owner: string;
    offerId?: string;
    initialOrderId?: string;
    onBack: () => void;
    onHistory: () => void;
    api?: CheckoutClient;
    historyApi?: OrdersClient;
}) {
    const [quote, setQuote] = useState<RentalQuote | null>(null), [order, setOrder] = useState<OrderView | null>(null), [link, setLink] = useState<CheckoutLink | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState('');
    const [loading, setLoading] = useState(false), [working, setWorking] = useState(false), [refreshing, setRefreshing] = useState(false), [revision, setRevision] = useState(0), [clock, setClock] = useState(Date.now()), [offset, setOffset] = useState(0);
    const alive = useRef(true), locked = useRef(false), checking = useRef(false), requests = useRef(new Set<AbortController>()), heading = useRef<HTMLHeadingElement>(null), request = useRef<{
        quoteKey: string;
        key: string;
    } | null>(null), orderRef = useRef<OrderView | null>(null);
    orderRef.current = order;
    useEffect(() => { alive.current = true; heading.current?.focus(); return () => { alive.current = false; for (const c of requests.current)
        c.abort(); }; }, []);
    useEffect(() => {
        if (!api.enabled)
            return;
        const c = new AbortController();
        requests.current.add(c);
        setLoading(true);
        setError('');
        if (!initialOrderId)
            setQuote(null);
        const task = initialOrderId ? historyApi.detail(owner, initialOrderId, c.signal).then(data => { if (alive.current) {
            setOrder(data.order);
            setOffset(Date.parse(data.serverTime) - Date.now());
        } }) : offerId ? api.quote(owner, offerId, c.signal).then(data => { if (alive.current) {
            setQuote(data);
            setOffset(Date.parse(data.serverTime) - Date.now());
        } }) : Promise.reject(new OrdersError('invalid_response'));
        void task.catch(e => { if (alive.current && e?.name !== 'AbortError')
            setError(checkoutErrorText(e)); }).finally(() => { requests.current.delete(c); if (alive.current)
            setLoading(false); });
        return () => c.abort();
    }, [owner, offerId, initialOrderId, api, historyApi, revision]);
    async function refresh() {
        const current = orderRef.current;
        if (!current || checking.current || locked.current)
            return;
        checking.current = true;
        setRefreshing(true);
        const c = new AbortController();
        requests.current.add(c);
        try {
            const data = await historyApi.detail(owner, current.id, c.signal);
            if (alive.current) {
                setOrder(data.order);
                setOffset(Date.parse(data.serverTime) - Date.now());
                if (data.order.state !== 'awaiting_payment')
                    setLink(null);
                setNotice('Trạng thái đơn đã được cập nhật.');
            }
        }
        catch (e) {
            if (alive.current && e?.name !== 'AbortError')
                setError(checkoutErrorText(e));
        }
        finally {
            checking.current = false;
            requests.current.delete(c);
            if (alive.current)
                setRefreshing(false);
        }
    }
    useEffect(() => { const onVisible = () => { if (document.visibilityState === 'visible')
        void refresh(); }; document.addEventListener('visibilitychange', onVisible); window.addEventListener('online', onVisible); const timer = setInterval(() => { setClock(Date.now()); if (document.visibilityState === 'visible' && orderRef.current?.state === 'awaiting_payment')
        void refresh(); }, 15000); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('online', onVisible); }; }, [owner, historyApi]);
    async function prepare() {
        if (locked.current || checking.current || !api.enabled || (!quote && !orderRef.current))
            return;
        locked.current = true;
        setWorking(true);
        setError('');
        setNotice('');
        const c = new AbortController();
        requests.current.add(c);
        try {
            let current = orderRef.current;
            if (!current) {
                const quoteKey = `${quote!.offerId}:${quote!.revision}`;
                if (request.current?.quoteKey !== quoteKey)
                    request.current = { quoteKey, key: crypto.randomUUID() };
                const created = await api.create(owner, { offerId: quote!.offerId, offerRevision: quote!.revision, requestKey: request.current.key }, c.signal);
                if (!alive.current)
                    return;
                current = created.order;
                orderRef.current = current;
                setOrder(current);
                setOffset(Date.parse(created.serverTime) - Date.now());
            }
            if (current.state !== 'awaiting_payment') {
                setNotice('Đơn đã đổi trạng thái. Hãy xem chi tiết bên dưới.');
                return;
            }
            const data = await api.begin(owner, current.id, c.signal);
            if (alive.current) {
                setLink(data);
                setOffset(Date.parse(data.serverTime) - Date.now());
                setClock(Date.now());
            }
        }
        catch (e) {
            if (alive.current && e?.name !== 'AbortError')
                setError(checkoutErrorText(e));
        }
        finally {
            locked.current = false;
            requests.current.delete(c);
            if (alive.current)
                setWorking(false);
        }
    }
    const now = clock + offset, expired = order && Date.parse(order.expiresAt) <= now, ready = link && Date.parse(link.expiresAt) > now && order?.state === 'awaiting_payment';
    const destination = ready ? safePaymentUrl(link.url) : null;
    return <div className="access-admin rental-checkout"><button className="launcher-secondary" disabled={working} onClick={onBack}>← Quay lại</button><h3 ref={heading} tabIndex={-1}>{order ? 'Thanh toán đơn thuê' : 'Xem lại gói thuê'}</h3>
 {!api.enabled ? <p className="access-note">Thanh toán chưa được kết nối. Bạn có thể xem lại gói và lịch sử đơn thuê.</p> : <>
 <p role="status" aria-live="polite">{loading ? 'Đang kiểm tra thông tin gói…' : working ? 'Đang chuẩn bị phiên thanh toán…' : notice}</p>{error && <p role="alert" className="orders-error">{error}</p>}
 {!order && <>{quote && <section><h4>{quote.title}</h4><div className="checkout-price">{quote.amount.toLocaleString('vi-VN')} ₫</div><p>{termOptions.find(t => t[0] === quote.term)?.[1]} · {quote.scope === 'all' ? 'Toàn bộ game' : quote.scope === 'bundle' ? 'Bộ game' : 'Một game'}</p>{quote.scope !== 'all' && <p>{quote.gameIds.join(' · ')}</p>}<p>Đơn có thời hạn chờ thanh toán 30 phút. Gói được cấp sau khi giao dịch được xác nhận; gia hạn cùng phạm vi sẽ nối tiếp thời gian còn lại.</p><button className="launcher-secondary" disabled={loading || working} onClick={() => void prepare()}>Xác nhận tạo đơn & chuẩn bị thanh toán</button></section>}
 <button className="launcher-secondary" disabled={loading || working} onClick={() => setRevision(v => v + 1)}>{quote ? 'Kiểm tra lại giá và gói' : 'Tải lại gói'}</button></>}
 {order && <section><span className={`order-state order-state-${order.state}`}>{states[order.state]}</span><h4>{order.title}</h4><div className="checkout-price">{order.amount.toLocaleString('vi-VN')} ₫</div><p>{termOptions.find(t => t[0] === order.term)?.[1]} · Mã đơn: <span className="access-id">{order.id}</span></p>
 {order.state === 'awaiting_payment' && <><p>Hạn thanh toán: {date(order.expiresAt)}</p>
 {ready && destination ? <div className="checkout-destination"><p>Trang thanh toán: <strong>{new URL(destination).hostname}</strong></p><p>Liên kết có hiệu lực đến {date(link.expiresAt)}.</p><a className="launcher-primary" href={destination} target="_blank" rel="noopener noreferrer" onClick={() => setNotice('Hoàn tất trên trang thanh toán rồi quay lại đây để kiểm tra trạng thái đơn.')}>Mở trang thanh toán ↗</a></div> : <button className="launcher-secondary" disabled={working || refreshing || !!expired} onClick={() => void prepare()}>{working ? 'Đang chuẩn bị…' : 'Chuẩn bị lại trang thanh toán'}</button>}
 <p>{expired ? 'Đã hết thời gian chờ. Hãy cập nhật trạng thái hoặc kiểm tra lịch sử trước khi đặt lại.' : 'Trạng thái sẽ tự kiểm tra mỗi 15 giây khi màn hình đang mở. Việc quay lại từ trang thanh toán chưa phải là xác nhận giao dịch.'}</p></>}
 {order.state === 'paid' && <><p>Đã ghi nhận thanh toán. Quyền thuê được áp dụng theo thời hạn dưới đây; hạn chế truy cập và bảo trì vẫn được áp dụng.</p>{order.grants.map((g, i) => <p key={i}>{g.revokedAt ? 'Đã thu hồi' : Date.parse(g.startsAt) > now ? 'Gia hạn bắt đầu' : 'Thời hạn'}: {date(g.startsAt)} → {date(g.expiresAt)}</p>)}</>}
 {order.state === 'review' && <p>Giao dịch cần được quản trị viên kiểm tra. Bạn có thể theo dõi kết quả trong Đơn thuê của tôi.</p>}
 {order.state === 'refunded' && <p>Đơn đã được ghi nhận hoàn tiền. Quyền thuê từ đơn này đã được thu hồi.</p>}
 <button className="launcher-secondary" disabled={working || refreshing} onClick={() => void refresh()}>{refreshing ? 'Đang kiểm tra…' : 'Kiểm tra trạng thái đơn'}</button>
 </section>}
 <button className="launcher-secondary" disabled={working} onClick={onHistory}>Đơn thuê của tôi</button>
 </>}
 </div>;
}
