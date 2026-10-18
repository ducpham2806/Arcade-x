import React,{useEffect,useRef,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {useLauncher} from '../launcher/LauncherContext';
import {useDialogFocus} from '../launcher/useDialogFocus';
import {termOptions} from './api';
import {startTrial,storeCatalog,type StoreCatalog,type TrialRun} from './store-api';
import {OrderHistory} from './MyOrders';
import {TrialExperience} from './TrialExperience';
import './access-admin.css';
export function StoreModal({onClose,initialGameId}:{onClose:()=>void;initialGameId?:string}){const {currentUser}=useAuth();return <StoreAccount key={currentUser?.id||'guest'} owner={currentUser?.id} initialGameId={initialGameId} onClose={onClose}/>}
function StoreAccount({owner,initialGameId,onClose}:{owner?:string;initialGameId?:string;onClose:()=>void}){
 const {catalog}=useLauncher();const [data,setData]=useState<StoreCatalog|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [term,setTerm]=useState('30d');const [scope,setScope]=useState('all-types');const [run,setRun]=useState<TrialRun|null>(null);const [revision,setRevision]=useState(0);
 const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false}},[]);
 const [showOrders,setShowOrders]=useState(false);
 const ref=useDialogFocus(run?undefined:onClose);
 useEffect(()=>{let alive=true;if(!owner)return;setBusy(true);setError('');void storeCatalog().then(d=>{if(alive)setData(d)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'Chưa tải được cửa hàng.')}).finally(()=>{if(alive)setBusy(false)});return()=>{alive=false}},[owner,revision]);
 const offers=data?.offers.filter(o=>o.term===term&&(scope==='all-types'||o.scope===scope)&&(!initialGameId||o.scope==='all'||o.game_ids.includes(initialGameId)))||[];
 const trial=data?.trials.find(t=>t.game_id==='tile-2048');
 const title=(id:string)=>catalog.games.find(g=>g.id===id)?.title||id;
 return <div className="platform-ui launcher-dialog-overlay"><section className="launcher-dialog subscription-store" ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="store-title">
  <header><div><p className="launcher-eyebrow">ARCADE-X</p><h2 id="store-title">{run?'Chơi thử 2048':showOrders?'Đơn thuê của tôi':'Gói game'}</h2></div>{!run&&<button aria-label="Đóng cửa hàng" className="launcher-icon" onClick={onClose}>×</button>}</header>
  <div className="launcher-dialog-body access-admin">
   {run?<TrialExperience key={run.id} run={run} onClose={()=>{setRun(null);setRevision(r=>r+1)}}/>:showOrders?<OrderHistory owner={owner} onBack={()=>setShowOrders(false)}/>:<>
    <button className="launcher-secondary" onClick={()=>setShowOrders(true)}>Đơn thuê của tôi</button>
    <p className="access-note">Cửa hàng đang thử nghiệm. Chưa nhận thanh toán; giá chỉ xuất hiện khi quản trị viên đã cấu hình.</p>
    {!owner?<p>Đăng nhập rồi mở lại để xem gói và lượt chơi thử của bạn.</p>:<>
     <p role="status">{busy?'Đang tải…':error}</p>{error&&<button className="launcher-secondary" onClick={()=>setRevision(r=>r+1)}>Tải lại</button>}
     {trial&&(!initialGameId||initialGameId==='tile-2048')&&<section><h3>Chơi thử 2048</h3><p>Chế độ cổ điển. Đã dùng {trial.used}/{trial.max_runs} lượt. Khi thoát, bạn có thể tiếp tục cùng bàn trong 24 giờ kể từ lúc bắt đầu.</p><button disabled={busy||(!trial.resumable&&trial.used>=trial.max_runs)} className="launcher-secondary" onClick={async()=>{setBusy(true);setError('');try{const next=await startTrial(owner);if(alive.current)setRun(next)}catch(e){setError(e instanceof Error?e.message:'Chưa bắt đầu được demo.')}finally{setBusy(false)}}}>{trial.resumable?'Tiếp tục bàn thử':'Bắt đầu chơi thử'}</button></section>}
     <div className="access-fields"><label>Loại gói<select value={scope} onChange={e=>setScope(e.target.value)}><option value="all-types">Tất cả</option><option value="game">Thuê một game</option><option value="bundle">Bộ game</option><option value="all">Arcade Pass</option></select></label><label>Thời hạn<select value={term} onChange={e=>setTerm(e.target.value)}>{termOptions.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
     {initialGameId&&<p>Gói dành cho {title(initialGameId)}</p>}
     <div className="store-offers">{offers.map(o=><section key={o.id}><p>{o.scope==='all'?'ARCADE PASS':o.scope==='bundle'?'BỘ GAME':'MỘT GAME'}</p><h3>{o.title}</h3><strong>{o.price_vnd.toLocaleString('vi-VN')} ₫</strong><p>{termOptions.find(t=>t[0]===o.term)?.[1]}</p><p>{o.scope==='all'?'Toàn bộ game trong danh mục gói':o.game_ids.map(title).join(' · ')}</p><button className="launcher-secondary" disabled>Chưa mở thanh toán</button></section>)}</div>
     {data&&!offers.length&&<p>Chưa có gói cho lựa chọn này. Bạn có thể đổi thời hạn hoặc loại gói.</p>}
    </>}
   </>}
  </div>
 </section></div>
}
