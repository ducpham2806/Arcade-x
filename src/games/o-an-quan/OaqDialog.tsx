import React,{useRef} from 'react';
import {X} from 'lucide-react';
import {useFolkDialogFocus} from '../folk-duel/useFolkDialogFocus';
export function OaqDialog({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
 const ref=useRef<HTMLDivElement>(null);
 useFolkDialogFocus(ref,onClose);
 return <div className="oaq-overlay" role="dialog" aria-modal="true" aria-label={title} data-modal-skin="authored" ref={ref}>
  <section className="oaq-dialog"><header><div><span className="oaq-eyebrow">Ô ĂN QUAN · SÂN ĐÌNH</span><h2>{title}</h2></div><button className="oaq-icon-button" onClick={onClose} aria-label="Đóng cửa sổ"><X/></button></header><div className="oaq-dialog-body">{children}</div></section>
 </div>;
}
