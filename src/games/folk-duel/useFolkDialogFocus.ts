import {useEffect,useRef,type RefObject} from 'react';
/** A modal owns keyboard focus and gives it back to its opener. */
export function useFolkDialogFocus(ref:RefObject<HTMLElement|null>,onClose:()=>void){
 const close=useRef(onClose);close.current=onClose;
 useEffect(()=>{
  const node=ref.current,previous=document.activeElement as HTMLElement|null;
  const buttons=()=>Array.from(node?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input,select,[tabindex="0"]')??[]);
  buttons()[0]?.focus();
  const key=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();}
   if(e.key==='Tab'){const a=buttons(),first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
  };
  node?.addEventListener('keydown',key);return()=>{node?.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[ref]);
}
