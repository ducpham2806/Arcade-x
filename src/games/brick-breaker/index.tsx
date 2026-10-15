import React,{useEffect,useRef} from 'react';
import type {GameComponentProps} from '../../types';
declare global {interface Window {__CHRONICLES_HTML__?:string}}
// Reuse the existing reviewed Chronicles engine; its progress remains on this device.
export default function BrickBreakerGame({isPaused,isMuted}:GameComponentProps){
 const frame=useRef<HTMLIFrameElement>(null);const state=useRef({isPaused,isMuted});state.current={isPaused,isMuted};
 const sync=()=>frame.current?.contentWindow?.postMessage({type:'arcadex:chronicles-state',...state.current},'*');
 useEffect(sync,[isPaused,isMuted]);
 return <iframe ref={frame} title="Block Breaker · Chronicles of the Shattered Realms" src={window.__CHRONICLES_HTML__?undefined:'/chronicles-realms/index.html'} srcDoc={window.__CHRONICLES_HTML__} onLoad={sync} sandbox="allow-scripts allow-same-origin" style={{display:'block',width:'100%',height:'100%',border:0,background:'#090e1e',pointerEvents:isPaused?'none':'auto'}}/>;
}
