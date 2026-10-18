import React,{useEffect,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {myAccess,type MyAccessState} from './api';
import './access-admin.css';
const sourceLabel={starter:'Quà đăng ký',admin:'Admin cấp',payment:'Thanh toán'};
export function MyAccess({onBack}:{onBack:()=>void}){const {currentUser}=useAuth();return <MyAccessAccount key={currentUser?.id||'guest'} owner={currentUser?.id} onBack={onBack}/>}
function MyAccessAccount({owner,onBack}:{owner?:string;onBack:()=>void}){
 const [state,setState]=useState<MyAccessState|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [revision,setRevision]=useState(0);const [clock,setClock]=useState(Date.now());
 const [serverOffset,setServerOffset]=useState(0);
 useEffect(()=>{const timer=setInterval(()=>setClock(Date.now()),30000);return()=>clearInterval(timer)},[]);
 useEffect(()=>{const refresh=()=>{if(document.visibilityState==='visible')setRevision(x=>x+1)};document.addEventListener('visibilitychange',refresh);window.addEventListener('online',refresh);return()=>{document.removeEventListener('visibilitychange',refresh);window.removeEventListener('online',refresh)}},[]);
 useEffect(()=>{let alive=true;if(!owner){setState(null);return}setBusy(true);setError('');void myAccess(owner).then(data=>{if(alive){setState(data);setServerOffset(Date.parse(data.serverTime)-Date.now());setClock(Date.now())}}).catch(e=>{if(alive){setState(null);setError(e instanceof Error?e.message:'Chưa tải được quyền chơi.')}}).finally(()=>{if(alive)setBusy(false)});return()=>{alive=false}},[owner,revision]);
 const now=clock+serverOffset;const title=(id:string|null)=>state?.games.find(g=>g.id===id)?.title||id||'Toàn bộ game';
 return <div className="access-admin"><button className="launcher-secondary" onClick={onBack}>← Cài đặt</button><h3>Quyền chơi của tôi</h3>
  {!owner?<p>Đăng nhập để xem quyền chơi và quà đăng ký.</p>:<>
   <p role="status" aria-live="polite">{busy?'Đang kiểm tra quyền…':error}</p><button className="launcher-secondary" disabled={busy} onClick={()=>setRevision(x=>x+1)}>Cập nhật</button>
   {state&&<><section><h4>Quà đăng ký</h4>{state.starterGames.length?<><p>Bộ 3 game đã được lưu vào tài khoản.</p>{state.starterGames.map(id=><article key={id}><strong>{title(id)}</strong><span>Không hết hạn</span></article>)}</>:<p>Bộ quà chưa được kích hoạt cho tài khoản này.</p>}</section>
    <section><h4>Quyền đã cấp</h4>{!state.entitlements.length&&<p>Chưa có quyền thuê hoặc quyền được cấp riêng. Các game miễn phí vẫn theo danh mục hiện tại.</p>}
     {state.entitlements.map(e=>{const status=e.revoked_at?'Đã thu hồi':Date.parse(e.starts_at)>now?'Chưa bắt đầu':e.expires_at&&Date.parse(e.expires_at)<=now?'Đã hết hạn':'Còn hiệu lực';return <article key={e.id}><div><strong>{e.all_games?'Toàn bộ game':title(e.game_id)}</strong><p>{sourceLabel[e.source]} · {status}</p><p>Từ {new Date(e.starts_at).toLocaleString('vi-VN')}{e.expires_at?` đến ${new Date(e.expires_at).toLocaleString('vi-VN')}`:' · Không hết hạn'}</p></div></article>})}
    </section><p className="access-note">Hết hạn không xóa tiến độ. Bảo trì hoặc hạn chế truy cập có thể tạm ngừng quyền chơi dù gói vẫn còn hạn.</p>
   </>}
  </>}
 </div>
}
