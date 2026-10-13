import {createPortal} from 'react-dom';
import React from 'react';
import {Home,RotateCcw,Share2,Download} from 'lucide-react';
import {GameArtwork} from '../visuals/gameArt';
import {useDialogFocus} from './useDialogFocus';
import {useAuth} from '../context/AuthContext';
export function PostGameSummary({gameId,title,score,isBest,recap,onReplay,onHome,onShare,onDownload}:{gameId:string;title:string;score:number;isBest:boolean;recap:string|null;onReplay:()=>void;onHome:()=>void;onShare:()=>void;onDownload:()=>void}){
 const ref=useDialogFocus(onHome);const {isGuest}=useAuth();
 return createPortal(<div className="launcher-dialog-overlay"><section ref={ref} role="dialog" aria-modal="true" aria-labelledby="result-title" tabIndex={-1} className="launcher-dialog launcher-result">
  <header><div className="text-left"><p className="launcher-eyebrow">VÁN CHƠI CỦA BẠN</p><h2 id="result-title">{title} · Hoàn thành!</h2></div></header><div className="launcher-dialog-body"><div className="guide-art"><GameArtwork gameId={gameId}/></div>{isBest&&<span className="result-best">Kỷ lục cá nhân mới!</span>}<div className="result-score">{score.toLocaleString()}</div><p>Điểm của ván vừa chơi</p><p className="launcher-small mt-3">{isGuest?'Kết quả khách được lưu trên thiết bị này.':'Kết quả được lưu trên thiết bị và đồng bộ khi có kết nối.'}</p>
   <details><summary>Chia sẻ kết quả</summary>{recap&&<img src={recap} alt={`Kết quả ${title}`}/>}<div className="flex gap-3 justify-center mt-3"><button id="btn-gameover-recap-share" className="launcher-secondary" onClick={onShare}><Share2 size={17}/>Chia sẻ</button><button id="btn-gameover-download-recap" className="launcher-secondary" disabled={!recap} onClick={onDownload}><Download size={17}/>Tải ảnh</button></div></details>
  </div><footer><button id="btn-gameover-home" className="launcher-secondary" onClick={onHome}><Home size={18}/>Về thư viện</button><button id="btn-gameover-replay" className="launcher-primary" onClick={onReplay}><RotateCcw size={18}/>Chơi lại</button></footer>
 </section></div>,document.body);
}

