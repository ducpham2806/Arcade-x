import React, {useEffect, useRef, useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {accessPreviewEnabled} from './api';
import {readRentalSession} from './orders-api';
import {createRentalTransport, OrdersError} from './orders-client';
import {reviewErrorText} from './review-client';
import type {ReconciliationPage, ReconciliationCode} from '../../shared/rental-reconciliation';
import type {OrderCursor} from '../../shared/rental-orders';
const labels: Record<ReconciliationCode,string> = {
 paid_without_grant:'Đã thanh toán nhưng thiếu quyền', duplicate_grants:'Một đơn có nhiều quyền',
 grant_owner_mismatch:'Quyền thuộc sai tài khoản', grant_coverage_mismatch:'Quyền không khớp phạm vi gói',
 invalid_grant_dates:'Thời hạn quyền không hợp lệ', refunded_unrevoked_grant:'Đã hoàn tiền nhưng chưa thu hồi quyền',
 unsettled_unrevoked_grant:'Quyền còn mở trên đơn chưa thanh toán', paid_payment_mismatch:'Thanh toán không khớp trạng thái hoặc số tiền đơn'
};
const enabled=accessPreviewEnabled && import.meta.env.VITE_RENTAL_RECONCILIATION_API==='true';
const request=createRentalTransport({enabled,readSession:readRentalSession});
export function ReconciliationAdmin({onBack}:{onBack:()=>void}) {
 const {currentUser}=useAuth();
 return <Panel key={currentUser?.id||'guest'} owner={currentUser?.id} onBack={onBack}/>;
}
function Panel({owner,onBack}:{owner?:string;onBack:()=>void}) {
 const [page,setPage]=useState<ReconciliationPage|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const controller=useRef<AbortController|null>(null),locked=useRef(false);
 useEffect(()=>()=>controller.current?.abort(),[]);
 async function scan(cursor:OrderCursor|null){
  if(!owner||locked.current)return;
  locked.current=true;setBusy(true);setError('');
  const c=new AbortController();controller.current=c;
  try{
   const data=await request(owner,'/admin/reconciliation'+(cursor?'?cursor='+encodeURIComponent(JSON.stringify(cursor)):''),'GET',c.signal);
   if(!data||!Number.isInteger(data.scanned)||data.scanned<0||data.scanned>50||!Array.isArray(data.findings)||data.findings.length>400||!data.findings.every(f=>f&&typeof f.orderId==='string'&&Object.hasOwn(labels,f.code))||!Number.isFinite(Date.parse(data.serverTime))||!(data.nextCursor===null||data.nextCursor&&typeof data.nextCursor.id==='string'&&Number.isFinite(Date.parse(data.nextCursor.createdAt))))throw new OrdersError('invalid_response');
   if(!c.signal.aborted)setPage(data);
  }catch(e){if(!c.signal.aborted)setError(reviewErrorText(e))}finally{locked.current=false;if(!c.signal.aborted)setBusy(false)}
 }
 return <div className="access-admin"><button className="launcher-secondary" onClick={onBack}>← Quản trị</button><h3>Kiểm tra tính nhất quán giao dịch</h3>
 <p>Kiểm tra tối đa 50 đơn mỗi lượt. Kết quả phản ánh dữ liệu nội bộ tại thời điểm quét; chưa so sánh trực tiếp với cổng thanh toán.</p>
 {!enabled?<p>Chức năng kiểm tra chưa được kết nối.</p>:<>
 <button className="launcher-secondary" disabled={busy||!owner} onClick={()=>void scan(null)}>Quét từ đầu</button>
 <p role="status">{busy?'Đang kiểm tra…':error}</p>
 {page&&<section><p>Đã kiểm tra {page.scanned} đơn trong lượt này · {new Date(page.serverTime).toLocaleString('vi-VN')}</p>
 {!page.findings.length&&<p>Không phát hiện sai lệch trong lượt này.</p>}
 {page.findings.map((f,i)=><article key={i}><div><strong>{labels[f.code]}</strong><p>Mã đơn: {f.orderId}</p></div></article>)}
 <p>Kiểm tra hồ sơ và chứng từ trước khi xử lý. Lượt quét không sửa đơn, quyền hoặc tiền.</p>
 {page.nextCursor?<button className="launcher-secondary" disabled={busy} onClick={()=>void scan(page.nextCursor)}>Kiểm tra 50 đơn tiếp theo</button>:<p>Đã tới cuối danh sách. Đơn mới hoặc thay đổi sau lượt quét sẽ được kiểm tra khi quét lại.</p>}
 </section>}
 </>}
 </div>;
}
