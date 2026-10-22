import React from 'react';
/** Visible beside the boards throughout battle; the countdown uses the real turn deadline. */
export function TurnStatus({kind,remaining,seat,synced=true,paused=false}:{kind:'own'|'ally'|'enemy';remaining:number;seat?:string;synced?:boolean;paused?:boolean}){
 const waiting=kind!=='own';
 const title=paused?'ĐÃ TẠM DỪNG':!synced?'ĐANG ĐỒNG BỘ LƯỢT':remaining<=0?'ĐANG CHUYỂN LƯỢT':kind==='own'?'LƯỢT CỦA BẠN':kind==='ally'?'LƯỢT ĐỒNG ĐỘI':'LƯỢT ĐỐI THỦ';
 const detail=paused?'Tiếp tục để trở lại trận.':!synced?'Đang cập nhật trạng thái từ máy chủ…':remaining<=0?'Chờ cập nhật lượt tiếp theo…':waiting?'Đang suy nghĩ và chọn ô bắn…':'Chạm ô trên bàn đối thủ để bắn.';
 return <div className={`bs-turn-status bs-turn-status-${kind}`} data-testid="battle-turn-status"><i className={waiting&&synced&&!paused&&remaining>0?'bs-thinking':''} aria-hidden="true">{waiting?'◉':'⌖'}</i><div role="status" aria-live="polite" aria-atomic="true"><strong>{title}{seat&&synced&&!paused&&remaining>0?` · ${seat}`:''}</strong><small>{detail}</small></div><b className={remaining<=5?'bs-turn-last-seconds':''} aria-hidden="true">{paused||!synced?'—':`${remaining}s`}</b></div>;
}
