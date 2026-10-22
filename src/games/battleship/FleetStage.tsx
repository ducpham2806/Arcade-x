import React from 'react';
import {Board} from './Board';
import {lengthOf} from './engine';
type Props=React.ComponentProps<typeof Board>&{onSwitch:()=>void;onRotate?:()=>void};
export function FleetStage({onSwitch,onRotate,...props}:Props){
 const {own,ghost,view}=props;
 const title=own?'HẠM ĐỘI CỦA BẠN':'BÀN ĐỐI THỦ';
 const x=ghost?4.25+91.5*(ghost.col+(ghost.horizontal?lengthOf(ghost):1))/view.size:0;
 const y=ghost?4.25+91.5*(ghost.row+.5)/view.size:0;
 return <div className="bs-dual-boards"><section className="bs-board-main" data-testid="board-main" data-side={own?'own':'enemy'}><div className="bs-board-caption">{title}<span>{view.size} × {view.size}</span></div><div className="bs-board-surface"><Board {...props}/>{own&&ghost&&onRotate&&<button className="bs-rotate" aria-label="Xoay tàu ngang hoặc dọc" title="Xoay tàu" disabled={props.paused} style={{left:`clamp(4px, ${x}%, calc(100% - 48px))`,top:`clamp(4px, ${y}%, calc(100% - 48px))`}} onClick={onRotate}>↻</button>}</div></section><button className="bs-board-mini" data-testid="board-mini" aria-label={`Phóng to ${own?'bàn đối thủ':'hạm đội của bạn'}`} onClick={onSwitch}><span>{own?'BÀN ĐỐI THỦ':'HẠM ĐỘI CỦA BẠN'}</span><Board {...props} own={!own} selected={null} ghost={null} interactive={false}/><small>CHẠM ĐỂ ĐỔI BÀN ⇅</small></button></div>;
}
