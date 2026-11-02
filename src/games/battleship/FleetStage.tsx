import React from 'react';
import {Board} from './Board';
import {lengthOf} from './engine';
import {boardCamera,cellPercent} from './projection';
const cam=boardCamera();
type Props=React.ComponentProps<typeof Board>&{onSwitch:()=>void;onRotate?:()=>void};
export function FleetStage({onSwitch,onRotate,...props}:Props){
 const {own,ghost,view}=props;
 const title=own?'HẠM ĐỘI CỦA BẠN':'BÀN ĐỐI THỦ';
 // ↻ sits just past the ship's end (right of a horizontal ship, beside the bow of a vertical one).
 const anchor=ghost?cellPercent(cam,ghost.row,ghost.col+(ghost.horizontal?lengthOf(ghost):1),view.size):{x:0,y:0};
 const x=anchor.x-2,y=anchor.y;
 return <div className="bs-dual-boards"><section className="bs-board-main" data-testid="board-main" data-side={own?'own':'enemy'}><div className="bs-board-caption">{title}<span>{view.size} × {view.size}</span></div><div className="bs-board-surface"><Board {...props}/>{own&&ghost&&onRotate&&<button className="bs-rotate" aria-label="Xoay tàu ngang hoặc dọc" title="Xoay tàu" disabled={props.paused} style={{left:`clamp(4px, ${x}%, calc(100% - 48px))`,top:`clamp(4px, calc(${y}% - 22px), calc(100% - 48px))`}} onClick={onRotate}>↻</button>}</div></section><button className="bs-board-mini" data-testid="board-mini" aria-label={`Phóng to ${own?'bàn đối thủ':'hạm đội của bạn'}`} onClick={onSwitch}><span>{own?'BÀN ĐỐI THỦ':'HẠM ĐỘI CỦA BẠN'}</span><Board {...props} own={!own} selected={null} ghost={null} interactive={false} flat/><small>CHẠM ĐỂ ĐỔI BÀN ⇅</small></button></div>;
}
