import React,{useEffect,useRef,useState} from 'react';
import {useAuth} from '../context/AuthContext';
import {accessPreviewEnabled,accessRpc,adminState,adminCommand,termOptions,type AdminState} from './api';
import './access-admin.css';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const date=(value:string|null)=>value?new Date(value).toLocaleString('vi-VN'):'Không hết hạn';
export function AccessAdminEntry({onOpen}:{onOpen:()=>void}){
 const {currentUser}=useAuth();const [allowed,setAllowed]=useState(false);
 useEffect(()=>{let alive=true;setAllowed(false);if(accessPreviewEnabled&&currentUser)void accessRpc<boolean>('launcher_is_admin').then(v=>{if(alive)setAllowed(v===true)}).catch(()=>{});return()=>{alive=false}},[currentUser?.id]);
 return allowed?<section><h3>Quản trị</h3><button className="launcher-secondary" onClick={onOpen}>Quyền chơi & bảo trì</button></section>:null;
}
export function AccessAdmin({onBack}:{onBack:()=>void}){
 const {currentUser}=useAuth();return <AdminContent key={currentUser?.id||'guest'} onBack={onBack}/>;
}
function AdminContent({onBack}:{onBack:()=>void}){
 const [state,setState]=useState<AdminState|null>(null);const [userInput,setUserInput]=useState('');const [user,setUser]=useState<string|null>(null);
 const [starter,setStarter]=useState<string[]>(['','','']);const [starterEnabled,setStarterEnabled]=useState(false);
 const [game,setGame]=useState('');const [term,setTerm]=useState('30d');const [reason,setReason]=useState('');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const [pending,setPending]=useState<{action:string;payload:Record<string,unknown>;label:string}|null>(null);
 const sequence=useRef(0);const alive=useRef(true);const submitting=useRef(false);
 useEffect(()=>{alive.current=true;return()=>{alive.current=false;sequence.current++}},[]);
 async function load(target:string|null){const seq=++sequence.current;setBusy(true);setMessage('');try{const next=await adminState(target);if(alive.current&&seq===sequence.current){setState(next);setStarter(next.starter.game_ids.length===3?next.starter.game_ids:['','','']);setStarterEnabled(next.starter.enabled);setUser(target);setPending(null)}}catch(e){if(alive.current&&seq===sequence.current){setState(null);setMessage(e instanceof Error?e.message:'Không tải được quyền.')}}finally{if(alive.current&&seq===sequence.current)setBusy(false)}}
 useEffect(()=>{void load(null)},[]);
 async function apply(){if(!pending||reason.trim().length<3||submitting.current)return;submitting.current=true;setBusy(true);setMessage('');try{if(pending.action==='starter_config')await accessRpc('launcher_admin_set_starter',{...pending.payload,p_reason:reason.trim()});else await adminCommand(pending.action,pending.payload,reason.trim());if(!alive.current)return;setPending(null);setReason('');await load(user);if(alive.current)setMessage('Đã lưu thay đổi và nhật ký.')}catch(e){if(alive.current)setMessage(e instanceof Error?e.message:'Chưa lưu được.')}finally{submitting.current=false;if(alive.current)setBusy(false)}}
 const choose=(action:string,payload:Record<string,unknown>,label:string)=>{setPending({action,payload,label});setReason('');setMessage('')};
 return <div className="access-admin">
  <button className="launcher-secondary" onClick={onBack}>← Cài đặt</button>
  <h3>Quyền chơi & bảo trì</h3>
  <p className="access-note">Bản thử phân quyền. Thanh toán chưa được bật. Thay đổi bảo trì áp dụng cho mọi tài khoản trên cơ sở dữ liệu đang kết nối.</p>
  <p role="status" aria-live="polite">{busy?'Đang xử lý…':message}</p>
  {!state&&!busy&&<button className="launcher-secondary" onClick={()=>void load(user)}>Tải lại</button>}
  {state&&<>
   <section><h4>Phạm vi thử nghiệm</h4><p>{state.mode==='off'?'Đang tắt: dùng quy tắc hiện tại.':'Đang thử: áp dụng chặn mới cho tài khoản trong danh sách thử.'}</p>
    <button disabled={busy} className="launcher-secondary" onClick={()=>choose('mode',{mode:state.mode==='off'?'pilot':'off'},state.mode==='off'?'Bật chế độ thử cho danh sách đã chọn':'Tắt chế độ thử')}>{state.mode==='off'?'Bật chế độ thử':'Tắt chế độ thử'}</button>
   </section>
   <section><h4>Bộ 3 game tặng khi đăng ký</h4><p>Chọn đủ 3 game. Thay đổi chỉ áp dụng cho tài khoản chưa nhận quà; người đã nhận giữ nguyên bộ cũ. Trong bản này chỉ tài khoản thử được nhận.</p>
    <div className="access-fields">{starter.map((selected,index)=><label key={index}>Game {index+1}<select value={selected} onChange={e=>setStarter(values=>values.map((v,i)=>i===index?e.target.value:v))}><option value="">Chọn game</option>{state.games.filter(g=>g.status==='published').map(g=><option key={g.id} value={g.id} disabled={starter.some((id,i)=>i!==index&&id===g.id)}>{g.title}</option>)}</select></label>)}</div>
    <label className="access-checkbox"><input type="checkbox" checked={starterEnabled} onChange={e=>setStarterEnabled(e.target.checked)}/>Tự tặng cho tài khoản thử chưa nhận quà</label>
    <button disabled={busy||starter.some(id=>!id)||new Set(starter).size!==3} className="launcher-secondary" onClick={()=>choose('starter_config',{p_game_ids:starter,p_enabled:starterEnabled},'Lưu cấu hình bộ 3 game miễn phí')}>Lưu bộ quà</button>
   </section>
   <section><h4>Tra cứu người chơi</h4><form onSubmit={e=>{e.preventDefault();if(uuid.test(userInput.trim()))void load(userInput.trim());else setMessage('Nhập UUID tài khoản Supabase hợp lệ.')}}>
    <label>Mã tài khoản (UUID)<input value={userInput} onChange={e=>setUserInput(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" required/></label><button disabled={busy} className="launcher-secondary">Tra cứu</button>
   </form>
   {user&&<><p className="access-id">Đang xem: {user}</p><button className="launcher-secondary" disabled={busy} onClick={()=>choose('pilot',{user_id:user,enabled:!state.pilot},state.pilot?'Bỏ người này khỏi danh sách thử':'Thêm người này vào danh sách thử')}>{state.pilot?'Bỏ khỏi danh sách thử':'Thêm vào danh sách thử'}</button>
    <div className="access-fields"><label>Phạm vi<select value={game} onChange={e=>setGame(e.target.value)}><option value="">Toàn bộ game / tài khoản</option>{state.games.map(g=><option key={g.id} value={g.id}>{g.title}</option>)}</select></label>
     <label>Thời hạn cấp quyền<select value={term} onChange={e=>setTerm(e.target.value)}>{termOptions.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
    <div className="access-actions"><button disabled={busy} className="launcher-secondary" onClick={()=>choose('grant',{user_id:user,game_id:game||null,all_games:!game,term},`Cấp quyền ${game||'toàn bộ game'} · ${termOptions.find(t=>t[0]===term)?.[1]}`)}>Cấp quyền</button>
     <button disabled={busy} className="launcher-secondary" onClick={()=>choose('block',{user_id:user,game_id:game||null},game?`Chặn game ${game}`:'Chặn toàn bộ tài khoản')}>Chặn truy cập</button>
     <button disabled={busy||!game} className="launcher-secondary" onClick={async()=>{setBusy(true);try{const r=await accessRpc<{allowed:boolean;reason:string}>('launcher_admin_check_access',{p_user:user,p_game:game});if(alive.current)setMessage(`Theo bộ quy tắc mới: ${r.allowed?'ĐƯỢC CHƠI':'BỊ KHÓA'} (${r.reason}).`)}catch(e){if(alive.current)setMessage(String(e))}finally{if(alive.current)setBusy(false)}}}>Kiểm tra quyền game</button></div>
    <h4>Quyền đã cấp</h4>{!state.entitlements.length&&<p>Chưa có quyền được cấp.</p>}
    {state.entitlements.map(e=><article key={e.id}><div><strong>{e.all_games?'Toàn bộ game':e.game_id}</strong><p>{e.source} · {e.revoked_at?'Đã thu hồi':e.expires_at&&Date.parse(e.expires_at)<=Date.now()?'Hết hạn':Date.parse(e.starts_at)>Date.now()?'Chưa bắt đầu':'Còn hiệu lực'}</p><p>{date(e.starts_at)} → {date(e.expires_at)}</p></div>{e.source==='admin'&&!e.revoked_at&&<button disabled={busy} className="launcher-secondary" onClick={()=>choose('revoke',{id:e.id},'Thu hồi quyền cấp tay này')}>Thu hồi</button>}</article>)}
    <h4>Hạn chế truy cập</h4>{!state.blocks.length&&<p>Không có hạn chế.</p>}{state.blocks.map(b=><article key={b.id}><div><strong>{b.game_id||'Toàn tài khoản'}</strong><p>{b.reason} · {b.revoked_at?'Đã gỡ':b.expires_at&&Date.parse(b.expires_at)<=Date.now()?'Hết hạn':'Đang chặn'}</p></div>{!b.revoked_at&&<button disabled={busy} className="launcher-secondary" onClick={()=>choose('unblock',{id:b.id},'Gỡ hạn chế truy cập này')}>Gỡ chặn</button>}</article>)}
   </>}
   </section>
   <section><h4>Bảo trì game</h4>{state.games.filter(g=>['published','maintenance'].includes(g.status)).map(g=><article key={g.id}><div><strong>{g.title}</strong><p>{g.status==='maintenance'?'Đang bảo trì':'Đang hoạt động'}</p></div><button className="launcher-secondary" disabled={busy} onClick={()=>choose('maintenance',{game_id:g.id,status:g.status==='maintenance'?'published':'maintenance'},`${g.status==='maintenance'?'Mở lại':'Bảo trì'} ${g.title}`)}>{g.status==='maintenance'?'Mở lại':'Bảo trì'}</button></article>)}</section>
   <section><h4>Nhật ký gần nhất</h4>{state.audit.map(a=><article key={a.id}><div><strong>{a.action}</strong><p>{a.reason}</p><small>{date(a.created_at)} · {a.target_id}</small></div></article>)}</section>
  </>}
  {pending&&<div className="access-confirm" role="region" aria-label="Xác nhận thay đổi"><strong>{pending.label}</strong><p>Kiểm tra đúng tài khoản và phạm vi trước khi lưu.</p><label>Lý do bắt buộc<textarea value={reason} onChange={e=>setReason(e.target.value)} maxLength={500} minLength={3}/></label><div className="access-actions"><button className="launcher-secondary" disabled={busy} onClick={()=>setPending(null)}>Hủy</button><button className="launcher-secondary" disabled={busy||reason.trim().length<3} onClick={()=>void apply()}>Xác nhận lưu</button></div></div>}
 </div>;
}
