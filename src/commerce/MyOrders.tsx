import {CheckoutFlow} from './CheckoutFlow';
import {checkoutApi} from './checkout-api';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { OrderCursor, OrderState, OrderView } from '../../shared/rental-orders';
import { ordersApi } from './orders-api';
import { orderErrorText, type OrdersClient } from './orders-client';
import { termOptions } from './api';
import './access-admin.css';
const stateNames: Record<OrderState, string> = { awaiting_payment: 'Chờ thanh toán', paid: 'Đã thanh toán', cancelled: 'Đã hủy', expired: 'Đơn hết hạn', review: 'Cần đối soát', refunded: 'Đã hoàn tiền' };
const date = (value: string) => new Date(value).toLocaleString('vi-VN');
export function MyOrders({ onBack }: {
    onBack: () => void;
}) { const { currentUser } = useAuth(); return <OrderHistory key={currentUser?.id || 'guest'} owner={currentUser?.id} onBack={onBack}/>; }
export function OrderHistory({ owner, onBack, api = ordersApi }: {
    owner?: string;
    onBack: () => void;
    api?: OrdersClient;
}) {
    const [checkoutOrder,setCheckoutOrder]=useState<string|null>(null);
    const [rows, setRows] = useState<OrderView[]>([]), [cursor, setCursor] = useState<OrderCursor | null>(null), [error, setError] = useState(''), [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false), [more, setMore] = useState(false), [cancelling, setCancelling] = useState<string | null>(null), [confirm, setConfirm] = useState<string | null>(null), [expanded, setExpanded] = useState<string | null>(null);
    const [revision, setRevision] = useState(0), [filter, setFilter] = useState('all'), [clock, setClock] = useState(Date.now()), [offset, setOffset] = useState(0), [hasLoaded, setHasLoaded] = useState(false);
    const alive = useRef(true), generation = useRef(0), locked = useRef(false), paging = useRef(false), requests = useRef(new Set<AbortController>());
    const heading = useRef<HTMLHeadingElement>(null);
    useEffect(() => { heading.current?.focus(); }, []);
    const pending = rows.some(o => o.state === 'awaiting_payment');
    useEffect(() => { alive.current = true; return () => { alive.current = false; generation.current++; for (const c of requests.current)
        c.abort(); }; }, []);
    useEffect(() => { const refresh = () => { if (!checkoutOrder&&document.visibilityState === 'visible' && !locked.current && !paging.current)
        setRevision(v => v + 1); }; document.addEventListener('visibilitychange', refresh); window.addEventListener('online', refresh); return () => { document.removeEventListener('visibilitychange', refresh); window.removeEventListener('online', refresh); }; }, [checkoutOrder]);
    useEffect(() => { const timer = setInterval(() => { setClock(Date.now()); if (!checkoutOrder&&pending && rows.length <= 20 && document.visibilityState === 'visible' && !locked.current && !paging.current)
        setRevision(v => v + 1); }, 20000); return () => clearInterval(timer); }, [pending, rows.length, checkoutOrder]);
    useEffect(() => {
        const seq = ++generation.current;
        if (!owner || !api.enabled||checkoutOrder)
            return;
        const controller = new AbortController();
        requests.current.add(controller);
        setLoading(true);
        setError('');
        void api.list(owner, null, controller.signal).then(data => { if (alive.current && seq === generation.current) {
            setRows(data.orders);
            setCursor(data.nextCursor);
            setOffset(Date.parse(data.serverTime) - Date.now());
            setClock(Date.now());
            setHasLoaded(true);
        } })
            .catch(e => { if (alive.current && seq === generation.current && e?.name !== 'AbortError') {
            setRows([]);
            setCursor(null);
            setHasLoaded(false);
            setError(orderErrorText(e));
        } })
            .finally(() => { requests.current.delete(controller); if (alive.current && seq === generation.current)
            setLoading(false); });
        return () => { controller.abort(); };
    }, [owner, api, revision, checkoutOrder]);
    async function loadMore() {
        if (!owner || !cursor || paging.current || loading)
            return;
        paging.current = true;
        setMore(true);
        setError('');
        const seq = generation.current, c = new AbortController();
        requests.current.add(c);
        try {
            const data = await api.list(owner, cursor, c.signal);
            if (alive.current && seq === generation.current) {
                setRows(old => [...old, ...data.orders.filter(o => !old.some(v => v.id === o.id))]);
                setCursor(data.nextCursor);
            }
        }
        catch (e) {
            if (alive.current && seq === generation.current && e?.name !== 'AbortError')
                setError(orderErrorText(e));
        }
        finally {
            paging.current = false;
            requests.current.delete(c);
            if (alive.current)
                setMore(false);
        }
    }
    async function cancel(id: string) {
        if (!owner || locked.current)
            return;
        locked.current = true;
        setCancelling(id);
        setError('');
        setMessage('');
        const c = new AbortController();
        requests.current.add(c);
        try {
            const data = await api.cancel(owner, id, c.signal);
            if (alive.current) {
                setRows(old => old.map(o => o.id === id ? data.order : o));
                setOffset(Date.parse(data.serverTime) - Date.now());
                setConfirm(null);
                setMessage(data.order.state === 'cancelled' ? 'Đã hủy đơn.' : 'Trạng thái đơn đã được cập nhật.');
            }
        }
        catch (e) {
            if (alive.current && e?.name !== 'AbortError') {
                setMessage(orderErrorText(e));
                setConfirm(null);
                setRevision(v => v + 1);
            }
        }
        finally {
            locked.current = false;
            requests.current.delete(c);
            if (alive.current)
                setCancelling(null);
        }
    }
    const now = clock + offset, visible = rows.filter(o => filter === 'all' || o.state === filter);
    if(checkoutOrder&&owner)return <CheckoutFlow owner={owner} initialOrderId={checkoutOrder} onBack={()=>{setCheckoutOrder(null);setRevision(v=>v+1)}} onHistory={()=>{setCheckoutOrder(null);setRevision(v=>v+1)}}/>;
    return <div className="access-admin rental-orders"><button className="launcher-secondary" onClick={onBack}>← Quay lại</button><h3 ref={heading} tabIndex={-1}>Đơn thuê của tôi</h3>
 {!owner ? <p>Đăng nhập để xem đơn thuê trong tài khoản.</p> : !api.enabled ? <p className="access-note">Lịch sử đơn thuê chưa được mở. Khi dịch vụ được kết nối, bạn có thể xem trạng thái, thời hạn và hủy đơn chưa thanh toán tại đây.</p> : <>
  <div className="access-actions"><button className="launcher-secondary" disabled={loading || more || !!cancelling} onClick={() => { setMessage(''); setRevision(v => v + 1); }}>Cập nhật danh sách</button><label>Lọc các đơn đã tải<select value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Tất cả</option>{Object.entries(stateNames).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
  <p role="status" aria-live="polite">{loading ? 'Đang tải đơn…' : message}</p>{error && <p role="alert" className="orders-error">{error}</p>}
  {hasLoaded && !rows.length && !loading && <p>Bạn chưa có đơn thuê nào.</p>}{hasLoaded && rows.length > 0 && !visible.length && <p>Chưa có đơn phù hợp trong {rows.length} đơn đã tải.</p>}
  <div className="orders-list">{visible.map(o => {
                const timedOut = o.state === 'awaiting_payment' && Date.parse(o.expiresAt) <= now;
                return <section key={o.id} className="rental-order">
   <div className="order-heading"><div><span className={`order-state order-state-${o.state}`}>{stateNames[o.state]}</span><h4>{o.title}</h4><p>{termOptions.find(t => t[0] === o.term)?.[1]} · {o.scope === 'all' ? 'Toàn bộ game' : o.scope === 'bundle' ? 'Bộ game' : 'Một game'}</p></div><strong>{o.amount.toLocaleString('vi-VN')} ₫</strong></div>
   <p>Mã đơn: <span className="access-id">{o.id}</span></p><p>Tạo lúc {date(o.createdAt)}</p>
   {o.state === 'awaiting_payment' && <p>{timedOut ? 'Đã hết thời gian chờ trên đồng hồ. Cập nhật để xác nhận trạng thái đơn.' : `Hạn thanh toán: ${date(o.expiresAt)}`}</p>}
   {o.state === 'review' && <p>Giao dịch đang cần đối soát. Quyền thuê sẽ được xác nhận sau khi kiểm tra.</p>}
   {o.state === 'paid' && <p>Thanh toán đã được ghi nhận. Thời gian chơi áp dụng theo quyền được cấp bên dưới; bảo trì và hạn chế truy cập vẫn được áp dụng.</p>}
   {o.state === 'refunded' && <p>Đơn đã được ghi nhận hoàn tiền. Quyền thuê từ đơn này đã được thu hồi.</p>}
   <div className="access-actions"><button className="launcher-secondary" aria-expanded={expanded === o.id} onClick={() => setExpanded(expanded === o.id ? null : o.id)}>{expanded === o.id ? 'Thu gọn' : 'Chi tiết thời hạn'}</button>
    {o.state==='awaiting_payment'&&checkoutApi.enabled&&<button className="launcher-secondary" disabled={loading||!!cancelling||timedOut} onClick={()=>setCheckoutOrder(o.id)}>Tiếp tục thanh toán</button>}
    {o.state === 'awaiting_payment' && <button className="launcher-secondary" disabled={loading || !!cancelling || timedOut} onClick={() => setConfirm(o.id)}>Hủy đơn</button>}</div>
   {expanded === o.id && <div className="order-details">{o.paidAt && <p>Ghi nhận thanh toán: {date(o.paidAt)}</p>}{o.scope !== 'all' && <p>Game: {o.gameIds.join(' · ')}</p>}
    {!o.grants.length ? <p>Chưa có quyền thuê được cấp từ đơn này.</p> : o.grants.map((g, i) => <div key={i}><strong>{g.revokedAt ? 'Đã thu hồi' : Date.parse(g.expiresAt) <= now ? 'Đã hết hạn' : Date.parse(g.startsAt) > now ? 'Đang chờ đến lượt gia hạn' : 'Còn hiệu lực'}</strong><p>{date(g.startsAt)} → {date(g.expiresAt)}</p>{g.revokedAt && <p>Thu hồi lúc {date(g.revokedAt)}</p>}</div>)}
   </div>}
   {confirm === o.id && o.state === 'awaiting_payment' && <div className="order-confirm" role="region" aria-label="Xác nhận hủy đơn"><strong>Hủy đơn này?</strong><p>Nếu bạn vừa thanh toán, hãy cập nhật trạng thái trước khi hủy để tránh phải đối soát.</p><div className="access-actions"><button className="launcher-secondary" disabled={!!cancelling} onClick={() => setConfirm(null)}>Giữ đơn</button><button className="launcher-secondary" disabled={!!cancelling || loading} onClick={() => void cancel(o.id)}>{cancelling === o.id ? 'Đang hủy…' : 'Xác nhận hủy đơn'}</button></div></div>}
  </section>;
            })}</div>
  {cursor && <button className="launcher-secondary" disabled={loading || more || !!cancelling} onClick={() => void loadMore()}>{more ? 'Đang tải thêm…' : 'Tải thêm đơn'}</button>}
  <p className="launcher-small">Đã tải {rows.length} đơn. {rows.length <= 20 ? 'Trang đầu tự kiểm tra mỗi 20 giây khi có đơn chờ thanh toán.' : 'Bấm Cập nhật danh sách để tải lại trang đầu và kiểm tra trạng thái mới.'} Tiến trình chơi vẫn được giữ khi gói hết hạn.</p>
 </>}
 </div>;
}
