import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { OrderCursor } from '../../shared/rental-orders';
import type { ReviewStatus, ReviewAction, ReviewView, ReviewDecision } from '../../shared/rental-reviews';
import { reviewApi } from './review-api';
import { reviewErrorText, reviewReasons, grantReasons, type ReviewClient } from './review-client';
import './access-admin.css';
const orderLabels = { awaiting_payment: 'Chờ thanh toán', paid: 'Đã thanh toán', cancelled: 'Đã hủy', expired: 'Hết hạn', review: 'Cần đối soát', refunded: 'Đã hoàn tiền' };
const labels: Record<ReviewStatus, string> = { open: 'Cần xử lý', awaiting_refund: 'Chờ hoàn tiền', resolved: 'Đã xử lý' };
const actions: Record<ReviewAction, string> = { grant_access: 'Xác nhận thanh toán & cấp quyền', queue_refund: 'Đưa vào danh sách chờ hoàn tiền', dismiss: 'Đóng hồ sơ, giữ nguyên đơn', note: 'Thêm ghi chú' };
const effects: Record<ReviewAction, string> = { grant_access: 'Ghi nhận thanh toán và cấp thời hạn thuê theo đơn. Nếu cùng gói đang còn hạn, thời gian mới được cộng tiếp.', queue_refund: 'Ghi nhận cần hoàn tiền. Thao tác này chưa chuyển tiền cho khách; cần hoàn tiền qua cổng thanh toán.', dismiss: 'Đóng hồ sơ đối soát. Giữ nguyên trạng thái đơn, quyền chơi và tiền.', note: 'Lưu ghi chú vào hồ sơ và nhật ký, giữ nguyên quyền chơi và trạng thái thanh toán.' };
const date = (v: string) => new Date(v).toLocaleString('vi-VN');
const money = (v: number, currency: string) => `${v.toLocaleString('vi-VN')} ${currency === 'VND' ? '₫' : currency}`;
export function ReviewAdmin({ onBack }: {
    onBack: () => void;
}) { const { currentUser } = useAuth(); return <ReviewPanel key={currentUser?.id || 'guest'} owner={currentUser?.id} onBack={onBack}/>; }
export function ReviewPanel({ owner, onBack, api = reviewApi }: {
    owner?: string;
    onBack: () => void;
    api?: ReviewClient;
}) {
    const [rows, setRows] = useState<ReviewView[]>([]), [cursor, setCursor] = useState<OrderCursor | null>(null), [status, setStatus] = useState<ReviewStatus | 'all'>('open'), [query, setQuery] = useState('');
    const [selected, setSelected] = useState<string | null>(null), [detail, setDetail] = useState<ReviewView | null>(null), [loading, setLoading] = useState(false), [more, setMore] = useState(false), [fetching, setFetching] = useState(false), [saving, setSaving] = useState(false);
    const [error, setError] = useState(''), [detailError, setDetailError] = useState(''), [message, setMessage] = useState(''), [revision, setRevision] = useState(0), [detailRevision, setDetailRevision] = useState(0), [loaded, setLoaded] = useState(false);
    const [action, setAction] = useState<ReviewAction>('note'), [reason, setReason] = useState(''), [confirm, setConfirm] = useState(false);
    const alive = useRef(true), seq = useRef(0), detailSeq = useRef(0), locked = useRef(false), paging = useRef(false), requests = useRef(new Set<AbortController>()), detailHeading = useRef<HTMLHeadingElement>(null), heading = useRef<HTMLHeadingElement>(null);
    useEffect(() => { if (detail)
        detailHeading.current?.focus(); }, [detail?.id]);
    const command = useRef<{
        fingerprint: string;
        requestKey: string;
    } | null>(null);
    useEffect(() => { alive.current = true; heading.current?.focus(); return () => { alive.current = false; seq.current++; detailSeq.current++; for (const c of requests.current)
        c.abort(); }; }, []);
    useEffect(() => {
        const n = ++seq.current;
        if (!owner || !api.enabled)
            return;
        const c = new AbortController();
        requests.current.add(c);
        setLoading(true);
        setLoaded(false);
        setError('');
        setRows([]);
        setCursor(null);
        void api.list(owner, status, null, c.signal).then(data => { if (alive.current && n === seq.current) {
            setRows(data.reviews);
            setCursor(data.nextCursor);
            setLoaded(true);
        } }).catch(e => { if (alive.current && n === seq.current && e?.name !== 'AbortError') {
            setError(reviewErrorText(e));
            setDetail(null);
            setSelected(null);
        } }).finally(() => { requests.current.delete(c); if (alive.current && n === seq.current)
            setLoading(false); });
        return () => c.abort();
    }, [owner, api, status, revision]);
    useEffect(() => {
        const n = ++detailSeq.current;
        setDetail(null);
        setConfirm(false);
        setReason('');
        setAction('note');
        if (!owner || !selected || !api.enabled)
            return;
        const c = new AbortController();
        requests.current.add(c);
        setFetching(true);
        setDetailError('');
        void api.detail(owner, selected, c.signal).then(data => { if (alive.current && n === detailSeq.current)
            setDetail(data.review); }).catch(e => { if (alive.current && n === detailSeq.current && e?.name !== 'AbortError')
            setDetailError(reviewErrorText(e)); }).finally(() => { requests.current.delete(c); if (alive.current && n === detailSeq.current)
            setFetching(false); });
        return () => c.abort();
    }, [owner, api, selected, detailRevision]);
    async function loadMore() {
        if (!owner || !cursor || paging.current || loading)
            return;
        paging.current = true;
        setMore(true);
        const n = seq.current, c = new AbortController();
        requests.current.add(c);
        try {
            const data = await api.list(owner, status, cursor, c.signal);
            if (alive.current && n === seq.current) {
                setRows(old => [...old, ...data.reviews.filter(r => !old.some(o => o.id === r.id))]);
                setCursor(data.nextCursor);
            }
        }
        catch (e) {
            if (alive.current && n === seq.current && e?.name !== 'AbortError')
                setError(reviewErrorText(e));
        }
        finally {
            paging.current = false;
            requests.current.delete(c);
            if (alive.current)
                setMore(false);
        }
    }
    async function apply() {
        if (!owner || !detail || locked.current || reason.trim().length < 3)
            return;
        locked.current = true;
        setSaving(true);
        setDetailError('');
        setMessage('');
        const payload = { action, expectedRevision: detail.revision, reason: reason.trim() }, fingerprint = JSON.stringify([detail.id, payload]);
        if (command.current?.fingerprint !== fingerprint)
            command.current = { fingerprint, requestKey: crypto.randomUUID() };
        const input: ReviewDecision = { ...payload, requestKey: command.current.requestKey }, c = new AbortController();
        requests.current.add(c);
        try {
            const data = await api.decide(owner, detail.id, input, c.signal);
            if (alive.current) {
                setDetail(data.review);
                setRows(old => old.map(r => r.id === data.review.id ? data.review : r).filter(r => status === 'all' || r.status === status));
                setConfirm(false);
                setReason('');
                setAction('note');
                setMessage('Đã lưu thao tác và nhật ký.');
            }
        }
        catch (e) {
            if (alive.current && e?.name !== 'AbortError') {
                setMessage(reviewErrorText(e));
                setConfirm(false);
                setDetailRevision(v => v + 1);
            }
        }
        finally {
            locked.current = false;
            requests.current.delete(c);
            if (alive.current)
                setSaving(false);
        }
    }
    const filtered = rows.filter(r => [r.id, r.orderId, r.ownerId, r.title, r.event.paymentId].join(' ').toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi')));
    return <div className="access-admin review-admin"><button className="launcher-secondary" disabled={saving} onClick={onBack}>← Quản trị quyền chơi</button><h3 ref={heading} tabIndex={-1}>Đối soát thanh toán</h3>
 {!owner ? <p>Đăng nhập bằng tài khoản quản trị để đối soát.</p> : !api.enabled ? <p className="access-note">Đối soát chưa được kết nối. Khi dịch vụ được mở, giao dịch cần kiểm tra sẽ xuất hiện tại đây cùng số tiền, đơn thuê và lịch sử xử lý.</p> : <>
 <p className="access-note">Chỉ thao tác trên giao dịch đã xác minh. Cấp quyền không gỡ khóa tài khoản hoặc bảo trì game. Chờ hoàn tiền là công việc cần xử lý, không phải xác nhận đã chuyển tiền.</p>
 <div className="access-fields"><label>Trạng thái<select disabled={saving || more} value={status} onChange={e => { setSelected(null); setMessage(''); setStatus(e.target.value as ReviewStatus | 'all'); }}>{Object.entries(labels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}<option value="all">Tất cả</option></select></label><label>Tìm trong hồ sơ đã tải<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Mã đơn, tài khoản, giao dịch…"/></label></div>
 <button className="launcher-secondary" disabled={loading || saving || more} onClick={() => { setRevision(v => v + 1); setDetailRevision(v => v + 1); setMessage(''); }}>Cập nhật đối soát</button>
 <p role="status" aria-live="polite">{loading ? 'Đang tải danh sách…' : message}</p>{error && <p className="orders-error" role="alert">{error}</p>}
 <div className={`review-layout ${selected ? 'has-selection' : ''}`}><div className="review-queue">
 {loaded && !rows.length && <p>Không có hồ sơ ở trạng thái này.</p>}{loaded && rows.length > 0 && !filtered.length && <p>Không có kết quả trong {rows.length} hồ sơ đã tải.</p>}
 {filtered.map(r => <button key={r.id} disabled={saving} className={`review-row ${selected === r.id ? 'review-row-selected' : ''}`} onClick={() => { setSelected(r.id); setMessage(''); }} aria-pressed={selected === r.id}>
 <span className={`order-state review-state-${r.status}`}>{labels[r.status]}</span><strong>{r.title}</strong><span>{reviewReasons[r.reason] || 'Giao dịch cần kiểm tra'}</span><span>{money(r.event.amount, r.event.currency)} · {date(r.createdAt)}</span><small>Đơn {r.orderId}</small></button>)}
 {cursor && <button className="launcher-secondary" disabled={loading || more || saving} onClick={() => void loadMore()}>{more ? 'Đang tải thêm…' : 'Tải thêm hồ sơ'}</button>}<p className="launcher-small">Đã tải {rows.length} hồ sơ.</p>
 </div><div className="review-detail">{selected && <button className="launcher-secondary review-mobile-back" disabled={saving} onClick={() => { setSelected(null); heading.current?.focus(); }}>← Danh sách đối soát</button>}
 {!selected ? <p>Chọn một hồ sơ để xem số tiền và lịch sử.</p> : <>
 {fetching && <p role="status">Đang lấy hồ sơ mới nhất…</p>}{detailError && <><p role="alert" className="orders-error">{detailError}</p><button className="launcher-secondary" disabled={fetching || saving} onClick={() => setDetailRevision(v => v + 1)}>Tải lại hồ sơ</button></>}
 {detail && <section><span className={`order-state review-state-${detail.status}`}>{labels[detail.status]}</span><h4 ref={detailHeading} tabIndex={-1}>{detail.title}</h4><p>{reviewReasons[detail.reason] || 'Giao dịch cần kiểm tra'}</p>
 <dl className="review-facts"><div><dt>Trạng thái đơn</dt><dd>{orderLabels[detail.orderState]}</dd></div><div><dt>Đơn thuê</dt><dd>{detail.orderId}</dd></div><div><dt>Tài khoản</dt><dd>{detail.ownerId}</dd></div><div><dt>Cổng thanh toán</dt><dd>{detail.event.provider}</dd></div><div><dt>Mã giao dịch</dt><dd>{detail.event.paymentId}</dd></div><div><dt>Thời gian giao dịch</dt><dd>{date(detail.event.occurredAt)}</dd></div></dl>
 <div className="review-amounts"><div><span>Giá trên đơn</span><strong>{money(detail.expectedAmount, detail.expectedCurrency)}</strong></div><div><span>{detail.event.kind === 'refunded' ? 'Số tiền hoàn lũy kế' : 'Số tiền giao dịch'}</span><strong>{money(detail.event.amount, detail.event.currency)}</strong></div><div><span>Chênh lệch</span><strong>{detail.event.currency === detail.expectedCurrency ? money(detail.event.amount - detail.expectedAmount, detail.expectedCurrency) : 'Khác loại tiền'}</strong></div></div>
 {!detail.canGrant && detail.status !== 'resolved' && <p>{grantReasons[detail.grantBlockReason || ''] || 'Chưa đủ điều kiện cấp quyền.'}</p>}
 <h4>Lịch sử xử lý gần nhất</h4>{!detail.history.length ? <p>Chưa có thao tác đối soát.</p> : detail.history.map((h, i) => <article key={i}><div><strong>{h.action === 'provider_refund' ? 'Đã xác minh hoàn tiền' : actions[h.action]}</strong><p>{h.reason}</p><small>{date(h.at)} · {h.actorId}</small></div></article>)}
 {detail.status !== 'resolved' && <div className="review-decision"><label>Thao tác<select disabled={saving} value={action} onChange={e => { setAction(e.target.value as ReviewAction); setConfirm(false); }}>{Object.entries(actions).map(([id, label]) => <option key={id} value={id} disabled={id === 'grant_access' && !detail.canGrant}>{label}</option>)}</select></label><p>{effects[action]}</p>
 <label>Lý do bắt buộc<textarea disabled={saving} minLength={3} maxLength={500} value={reason} onChange={e => { setReason(e.target.value); setConfirm(false); }} placeholder="Kết quả kiểm tra và căn cứ xử lý"/></label>
 {!confirm ? <button className="launcher-secondary" disabled={saving || reason.trim().length < 3 || (action === 'grant_access' && !detail.canGrant)} onClick={() => setConfirm(true)}>Kiểm tra thao tác</button> : <div className="order-confirm" role="region" aria-label="Xác nhận đối soát"><strong>{actions[action]}</strong><p>Đơn {detail.orderId} · Tài khoản {detail.ownerId}</p><p>{effects[action]}</p><p>Lý do: {reason.trim()}</p><div className="access-actions"><button className="launcher-secondary" disabled={saving} onClick={() => setConfirm(false)}>Quay lại sửa</button><button className="launcher-secondary" disabled={saving} onClick={() => void apply()}>{saving ? 'Đang lưu…' : 'Xác nhận lưu đối soát'}</button></div></div>}
 </div>}
 </section>}
 </>}
 </div></div>
 </>}
 </div>;
}
