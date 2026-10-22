import React, {useEffect,useRef,useState} from 'react';
import type {GameComponentProps} from '../types';

export const STANDALONE_STORAGE={'neon-runner':['nr-best-run-scores','neon-run-campaign-choice','nr-story-v08','nr-campaign-lab-v03']};
type Snapshot={version:1;storage:Record<string,string>};
export function validStandaloneSnapshot(gameId:string,value:unknown):value is Snapshot {
 const row=value as Snapshot,keys=STANDALONE_STORAGE[gameId];
 return !!keys&&row?.version===1&&!!row.storage&&typeof row.storage==='object'&&!Array.isArray(row.storage)&&Object.entries(row.storage).every(([k,v])=>keys.includes(k)&&typeof v==='string'&&v.length<=500_000)&&JSON.stringify(row).length<1_000_000;
}
export function StandaloneGame({gameId,title,src,bridge,isPaused,isMuted}:GameComponentProps&{gameId:string;title:string;src:string}){
 const frame=useRef<HTMLIFrameElement>(null),live=useRef({bridge,isPaused,isMuted});live.current={bridge,isPaused,isMuted};
 const [saved,setSaved]=useState<{payload:Snapshot|null;owner:string}|null>(null),[error,setError]=useState('');
 useEffect(()=>{let active=true;Promise.resolve(bridge.loadGameState()).then(value=>{
  if(!active)return;if(value&&!validStandaloneSnapshot(gameId,value)){try{if(!localStorage.getItem('arcadex_legacy_neon_runner_save'))localStorage.setItem('arcadex_legacy_neon_runner_save',JSON.stringify(value));}catch{}}
  let owner='guest';try{owner=JSON.parse(localStorage.getItem('arcadex_player_profile')||'{}').id||owner;}catch{}
  setSaved({payload:validStandaloneSnapshot(gameId,value)?value:null,owner});
 }).catch(()=>{if(active)setError('Chưa đọc được tiến trình. Hãy mở lại game.');});return()=>{active=false;};},[bridge,gameId]);
 const sync=()=>{if(saved)frame.current?.contentWindow?.postMessage({type:'arcadex:standalone-init',gameId,...saved,isPaused:live.current.isPaused,isMuted:live.current.isMuted},location.origin);};
 useEffect(()=>{if(!saved)return;const childWindow=frame.current?.contentWindow;const receive=(event:MessageEvent)=>{
  if(event.source!==frame.current?.contentWindow||event.origin!==location.origin||event.data?.gameId!==gameId)return;
  if(event.data.type==='arcadex:standalone-ready')sync();
  if(event.data.type==='arcadex:standalone-save'&&validStandaloneSnapshot(gameId,event.data.snapshot))void Promise.resolve(live.current.bridge.saveGameState(event.data.snapshot)).catch(()=>setError('Chưa lưu được tiến trình. Hãy kiểm tra dung lượng thiết bị.'));
 };window.addEventListener('message',receive);return()=>{try{const snapshot=(childWindow as Window&{__arcadexSnapshot?:()=>Snapshot})?.__arcadexSnapshot?.();if(validStandaloneSnapshot(gameId,snapshot))void Promise.resolve(live.current.bridge.saveGameState(snapshot)).catch(()=>{});}catch{}window.removeEventListener('message',receive);};},[saved,gameId]);
 useEffect(()=>{frame.current?.contentWindow?.postMessage({type:'arcadex:standalone-state',gameId,isPaused,isMuted},location.origin);},[gameId,isPaused,isMuted]);
 if(!saved)return <p role="status" className="p-8">{error||'Đang khôi phục tiến trình…'}</p>;
 return <div style={{width:'100%',height:'100%',position:'relative'}}>{error&&<p role="status" style={{position:'absolute',top:4,left:8,zIndex:2,background:'#18243b',color:'#fff',padding:8}}>{error}</p>}<iframe ref={frame} src={src} title={title} onLoad={sync} sandbox="allow-scripts allow-same-origin" style={{display:'block',width:'100%',height:'100%',border:0,background:'#0a1420',pointerEvents:isPaused?'none':'auto'}}/></div>;
}
