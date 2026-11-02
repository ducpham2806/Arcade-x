import {clamp,T} from './core';
import {B01,type Encounters} from './encounters';

// Presentation reads simulation ticks only: pause/checkpoint/replay keep every cue aligned.
export function bossCue(encounter:Encounters,length:number){
 const e=encounter,state=e.state;
 const duration=state==='telegraph'?B01.telegraph[e.phase-1]:state==='attack'?B01.attack:state==='recovery'?B01.recovery:state==='weak'?B01.weak:0;
 const remaining=duration?clamp(e.timer/T.hz,0,duration):0;
 const phaseTask=e.phase===1?'Chờ đòn tơ':e.phase===2?'Dụ nhện con vào tơ':length<16?`Ăn táo · dài ${length}/16`:`Nối cột A + B · ${e.anchors.filter(Boolean).length}/2`;
 const labels={idle:phaseTask,telegraph:'NÉ DẢI TƠ',attack:'TƠ ĐANG BẮN',recovery:'Chuẩn bị Dash',weak:'DASH VÀO VÒNG NGỌC',hurt:'HÚC TRÚNG!',phase_change:`CHUYỂN PHA ${e.phase}`,defeated:'ĐÃ HẠ NHỆN MẸ · ĐẾN CỔNG'};
 return {state,label:labels[state],remaining,fraction:duration?remaining/duration:0,timed:duration>0,hits:clamp(e.totalHits,0,6),hold:clamp(e.anchorTicks/(B01.hold*T.hz),0,1)};
}

// Small transforms of the approved still; these are feedback, not authored sprite animation.
export function bossPose(e:Encounters,time:number,reducedMotion=false){
 const progress=e.state==='telegraph'?1-clamp(e.timer/(B01.telegraph[e.phase-1]*T.hz),0,1):0;
 const breathing=reducedMotion?0:Math.sin(time*3)*.012;
 const recoil=e.state==='hurt'&&!reducedMotion?Math.sin((.6-e.timer/T.hz)*24)*.1:0;
 return {x:recoil,y:e.state==='attack'?.12:e.state==='telegraph'?-.1*progress:0,scaleX:1+(e.state==='telegraph'?.035*progress:e.state==='weak'?-.025:breathing),scaleY:1+(e.state==='telegraph'?-.035*progress:e.state==='weak'?.025:-breathing),opacity:e.state==='defeated'?.45:1};
}
