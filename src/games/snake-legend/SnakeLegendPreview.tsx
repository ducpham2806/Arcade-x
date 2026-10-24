// Target: Arcade-x/src/games/snake-legend/SnakeLegendPreview.tsx.
// Load this entry only from the controlled preview route, under existing AuthProvider.
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {useAuth} from '../../context/AuthContext';
import {supabase,supabasePublicConfig} from '../../services/supabaseClient';
import {getRecoveryState} from '../../services/authRecovery';
import type {GameComponentProps} from '../../types';
import SnakeLegend from './SnakeLegend';
import {LauncherSnakeBinding} from './integration/launcher-binding';

function BoundGame({binding,...props}:GameComponentProps&{binding:LauncherSnakeBinding}){
 const view=useSyncExternalStore(binding.subscribe,binding.getView,binding.getView);
 if(view.status==='closed')return <p role="status">{view.message}</p>;
 return <div style={{height:'100%',display:'flex',flexDirection:'column',minHeight:0}}>
  <div role="status" aria-live="polite" style={{padding:'6px 10px',fontSize:12,background:'#e9efdf',color:'#234638',flexShrink:0}}>
   {view.message} {view.snapshot&&<span>· Bản {view.snapshot.revision} · {Object.keys(view.snapshot.levels).length}/10 màn xác thực · Snake Gold {view.snapshot.wallet.snake_gold} · Snake Gem {view.snapshot.wallet.snake_gem} </span>}
   <button type="button" disabled={view.status==='loading'} onClick={()=>void binding.refreshState()}>Tải lại tiến trình</button>
  </div>
  <div style={{flex:1,minHeight:0}}><SnakeLegend {...props} createSaveSession={binding.createSaveSession}/></div>
 </div>;
}

export default function SnakeLegendPreview(props:GameComponentProps){
 const {currentUser,isLoggedIn,isGuest}=useAuth();
 const owner=isLoggedIn&&!isGuest?currentUser?.id??null:null;
 const hostOwner=useRef(owner);hostOwner.current=owner;
 const [binding,setBinding]=useState<LauncherSnakeBinding|null>(null);
 useEffect(()=>{
  if(!owner||!supabase||!supabasePublicConfig.url||!supabasePublicConfig.key||getRecoveryState().status!=='idle')return;
  const next=new LauncherSnakeBinding({actorId:owner,auth:supabase.auth,hostOwner:()=>hostOwner.current,
   endpoint:supabasePublicConfig.url.replace(/\/$/,'')+'/functions/v1/snake-complete',publishableKey:supabasePublicConfig.key});
  const invalidate=()=>next.invalidate();
  window.addEventListener('arcadex:account_switching',invalidate);
  window.addEventListener('arcadex:auth_recovery',invalidate);
  next.connect();setBinding(next);void next.refreshState();
  return()=>{next.destroy();window.removeEventListener('arcadex:account_switching',invalidate);window.removeEventListener('arcadex:auth_recovery',invalidate);};
 },[owner]);
 if(!owner)return <p role="status">Đăng nhập tài khoản để thử lưu Snake trực tuyến.</p>;
 if(!binding||binding.actorId!==owner)return <p role="status">Đang chuẩn bị phiên tài khoản…</p>;
 return <BoundGame {...props} binding={binding}/>;
}
