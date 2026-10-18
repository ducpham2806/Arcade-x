import React,{useEffect,useRef,useState} from 'react';
import {accessRpc,termOptions} from './api';
import type {Offer} from './store-api';
type Config={offers:Offer[];trials:{enabled:boolean;max_runs:number}[]};
const blank=()=>({id:null as string|null,title:'',scope:'game' as Offer['scope'],game_ids:[] as string[],term:'30d',price:'',active:false});
export function StoreAdmin({games}:{games:{id:string;title:string}[]}){
 const [data,setData]=useState<Config|null>(null),[draft,setDraft]=useState(blank),[reason,setReason]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[enabled,setEnabled]=useState(false),[limit,setLimit]=useState(1);
 const alive=useRef(true),locked=useRef(false);
 async function load(){const next=await accessRpc<Config>('launcher_store_admin');if(alive.current){setData(next);setEnabled(next.trials[0]?.enabled??false);setLimit(next.trials[0]?.max_runs??1)}}
 useEffect(()=>{alive.current=true;void load().catch(e=>{if(alive.current)setError(String(e))});return()=>{alive.current=false}},[]);
 async function save(trial:boolean){if(locked.current||reason.trim().length<3)return;locked.current=true;setBusy(true);setError('');try{
  if(trial)await accessRpc('launcher_admin_configure_trial',{p_enabled:enabled,p_max_runs:limit,p_reason:reason.trim()});
  else await accessRpc('launcher_admin_save_offer',{p_id:draft.id,p_title:draft.title.trim(),p_scope:draft.scope,p_game_ids:draft.game_ids,p_term:draft.term,p_price:Number(draft.price),p_active:draft.active,p_reason:reason.trim()});
  if(!alive.current)return;await load();setReason('');if(!trial)setDraft(blank());setError('Đã lưu cấu hình và nhật ký.');
 }catch(e){if(alive.current)setError(e instanceof Error?e.message:'Chưa lưu được cấu hình.')}finally{locked.current=false;if(alive.current)setBusy(false)}}
 const valid=draft.title.trim().length>=3&&Number.isSafeInteger(Number(draft.price))&&Number(draft.price)>0&&Number(draft.price)<=100000000&&(draft.scope==='all'||draft.scope==='game'&&draft.game_ids.length===1||draft.scope==='bundle'&&draft.game_ids.length>=2);
 return <section><h4>Danh mục gói & lượt thử</h4><p>Chỉ hiển thị cho nhóm thử nghiệm. Mỗi gói là một thời hạn với giá riêng; chưa tạo đơn hoặc thu tiền. Lượt thử được tính ngay khi bắt đầu bàn mới.</p>
 <p role="status">{busy?'Đang lưu…':error}</p>
 {!data?<button onClick={()=>void load().catch(e=>setError(String(e)))}>Tải lại cấu hình</button>:<>
 <div className="access-fields"><label>Gói cần sửa<select value={draft.id||''} onChange={e=>{const o=data.offers.find(o=>o.id===e.target.value);setDraft(o?{...o,price:String(o.price_vnd)}:blank())}}><option value="">Tạo gói mới</option>{data.offers.map(o=><option key={o.id} value={o.id}>{o.title} · {o.term}{o.active?'':' · Đã ẩn'}</option>)}</select></label>
 <label>Tên gói<input maxLength={100} value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
 <label>Phạm vi<select value={draft.scope} onChange={e=>setDraft({...draft,scope:e.target.value as Offer['scope'],game_ids:[]})}><option value="game">Một game</option><option value="bundle">Bộ game</option><option value="all">Toàn bộ game</option></select></label>
 <label>Thời hạn<select value={draft.term} onChange={e=>setDraft({...draft,term:e.target.value})}>{termOptions.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
 <label>Giá (VNĐ)<input type="number" min={1} max={100000000} step={1} value={draft.price} onChange={e=>setDraft({...draft,price:e.target.value})}/></label></div>
 {draft.scope!=='all'&&<fieldset><legend>Game trong gói</legend>{games.map(g=><label key={g.id} className="access-checkbox"><input type="checkbox" checked={draft.game_ids.includes(g.id)} onChange={e=>setDraft({...draft,game_ids:e.target.checked?(draft.scope==='game'?[g.id]:[...draft.game_ids,g.id]):draft.game_ids.filter(id=>id!==g.id)})}/>{g.title}</label>)}</fieldset>}
 <label className="access-checkbox"><input type="checkbox" checked={draft.active} onChange={e=>setDraft({...draft,active:e.target.checked})}/>Hiển thị gói trong cửa hàng thử nghiệm</label>
 <label>Lý do thay đổi (bắt buộc)<textarea maxLength={500} value={reason} onChange={e=>setReason(e.target.value)}/></label>
 <button className="launcher-secondary" disabled={busy||!valid||reason.trim().length<3} onClick={()=>void save(false)}>Lưu gói</button>
 <h4>Chơi thử 2048</h4><label className="access-checkbox"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Cho phép tài khoản thử chơi 2048 đang khóa</label>
 <label>Số bàn tối đa mỗi tài khoản<input type="number" min={1} max={10} step={1} value={limit} onChange={e=>setLimit(Number(e.target.value))}/></label><p>Tăng giới hạn cho thêm lượt; giảm giới hạn không xóa bàn đã lưu. Game miễn phí hoặc đã có quyền đầy đủ dùng nút Chơi ngay.</p>
 <button className="launcher-secondary" disabled={busy||reason.trim().length<3||!Number.isInteger(limit)||limit<1||limit>10} onClick={()=>void save(true)}>Lưu cấu hình chơi thử</button>
 </>}
 </section>
}
