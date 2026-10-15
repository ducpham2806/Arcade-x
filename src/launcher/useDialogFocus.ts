import {useEffect,useRef} from 'react';
export function useDialogFocus(onEscape?:()=>void, enabled=true){
 const ref=useRef<HTMLElement>(null);const close=useRef(onEscape);close.current=onEscape;
 useEffect(()=>{
  if(!enabled)return;
  const previous=document.activeElement as HTMLElement|null;const panel=ref.current;if(!panel)return;
  const focusable=()=>Array.from(panel.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select,summary,[tabindex="0"]')).filter(el=>el.getClientRects().length);
  (focusable()[0]||panel).focus();
  const key=(event:KeyboardEvent)=>{
   if(event.key==='Escape'&&close.current){event.preventDefault();event.stopPropagation();close.current();}
   if(event.key!=='Tab')return;const elements=focusable();const first=elements[0],last=elements.at(-1);
   if(!first){event.preventDefault();return;}
   if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus();}
  };panel.addEventListener('keydown',key);return()=>{panel.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[enabled]);return ref;
}

