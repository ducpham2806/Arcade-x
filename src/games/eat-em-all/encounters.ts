import type { ElementMode,ItemType } from './types';
import type { CampaignStage } from './campaign';
const LANES={cascade:[0,1,2,3,4,3,2,1],alternating:[1,1,3,3,0,0,4,4],crosswind:[0,2,4,1,3,4,2,0],corridor:[2,2,1,1,2,2,3,3],spiral:[2,1,0,1,2,3,4,3],boss:[1,2,3,2,0,1,4,3]};
export type Beat='lead'|'burst'|'feint'|'breather'|'climax';
const PHRASES:Beat[][]=[
 ['lead','lead','burst','burst','burst','feint','feint','lead','burst','burst','breather','breather'],
 ['lead','burst','burst','feint','feint','lead','breather','burst','burst','burst','lead','breather'],
 ['lead','feint','feint','burst','burst','burst','breather','lead','burst','burst','lead','breather'],
 ['lead','burst','burst','lead','feint','feint','breather','burst','burst','lead','breather','breather'],
];
export function seededUnit(stageId:number,sequence:number,salt=0){let n=Math.imul(stageId+17,374761393)^Math.imul(sequence+1,668265263)^Math.imul(salt+7,1274126177);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
export function quotaProgress(stage:CampaignStage,counts:Partial<Record<ItemType,number>>){return Object.entries(stage.targetItems).reduce((sum,[k,n])=>sum+Math.min(n||0,counts[k as ItemType]||0),0);}
export function encounterBeat(stage:CampaignStage,sequence:number,counts:Partial<Record<ItemType,number>>):Beat {
 if(sequence<4)return 'lead';
 const phrase=Math.floor(sequence/12);const profile=Math.floor(seededUnit(stage.id,phrase,8)*PHRASES.length);
 const beat=PHRASES[profile][sequence%12];
 if(quotaProgress(stage,counts)/stage.targetCount>=.8&&beat==='burst')return 'climax';
 return beat;
}
export interface BossPhase {element:ElementMode;vulnerable:boolean;warning:boolean;phase:'warning'|'attack'|'open'|'recover';attack:string;lanes:number[];safeLane:number;switchSoon:boolean;cycle:number}
const BOSSES=[
 {warn:1.6,attack:1.4,open:5,recover:2,name:'Rễ siết'},
 {warn:1.8,attack:2.1,open:5.7,recover:1.8,name:'Búa đôi'},
 {warn:2.2,attack:1.8,open:6.2,recover:2,name:'Thủy triều'},
 {warn:1.6,attack:1.4,open:4.8,recover:1.8,name:'Nhịp gãy'},
];
export function bossPhase(elapsed:number,chapter=1):BossPhase {
 const c=Math.max(1,Math.min(4,chapter)),spec=BOSSES[c-1],period=spec.warn+spec.attack+spec.open+spec.recover;
 const cycle=Math.floor(elapsed/period),t=elapsed-cycle*period,openAt=spec.warn+spec.attack;
 const phase=t<spec.warn?'warning':t<openAt?'attack':t<openAt+spec.open?'open':'recover';
 const halfway=openAt+spec.open/2;const secondCore=c===4&&phase==='open'&&t>=halfway;
 const element:ElementMode=(cycle+Number(secondCore))%2?'fire':'ice';
 const safeLane=c===1?[1,3,2][cycle%3]:c===2?2:c===3?(cycle%2?1:3):cycle%2?2:1;
 const lanes=c===1?[0,1,3,4].filter(l=>l!==safeLane):c===2?[0,4]:c===3?(cycle%2?[2,4]:[0,2]):cycle%2?[0,4]:[2,4];
 return {element,vulnerable:phase==='open',warning:phase==='warning',phase,attack:spec.name,lanes,safeLane,switchSoon:c===4&&phase==='open'&&t>=halfway-.65&&t<halfway,cycle};
}
export interface DropPlan {type:ItemType;lane:number;drift:number;speed:number;speedClass:'slow'|'normal'|'fast'|'rush';beat:Beat;intervalMs:number;warningSeconds:number;flightSeconds:number;trick:'none'|'overtake-lead'|'overtake-pass'}
/** Different speeds are deterministic per object, so retries preserve learnable beats. */
export function planDrop(stage:CampaignStage,sequence:number,counts:Partial<Record<ItemType,number>>,elapsed:number):DropPlan {
 const beat=encounterBeat(stage,sequence,counts),chapter=stage.chapter;
 const profile=Math.floor(sequence/12),phrase=Math.floor(seededUnit(stage.id,profile,8)*PHRASES.length);
 const slot=sequence%12;
 // The feint pair belongs to a fixed phrase: deficits may change food, not its timing.
 const firstFeint=PHRASES[phrase].indexOf('feint');
 const canFeint=stage.id>=3&&stage.objective!=='boss';
 const trick=canFeint&&slot===firstFeint?'overtake-lead':canFeint&&slot===firstFeint+1?'overtake-pass':'none';
 const roll=seededUnit(stage.id,sequence,1),jitter=seededUnit(stage.id,sequence,2);
 let speedClass:DropPlan['speedClass']=roll<.25?'slow':roll<.65?'normal':roll<.9||chapter<3?'fast':'rush';
 let factor=speedClass==='slow'?.65+jitter*.2:speedClass==='normal'?.95+jitter*.15:speedClass==='fast'?1.25+jitter*.25:1.65+jitter*.2;
 if(stage.id<=2){factor=.85+jitter*.3;speedClass='normal';}
 if(trick==='overtake-lead'){factor=.72;speedClass='slow';}
 if(trick==='overtake-pass'){factor=chapter>=3?1.7:1.45;speedClass=chapter>=3?'rush':'fast';}
 const pressure=quotaProgress(stage,counts)/stage.targetCount>=.65?1.06:1;
 const flightSeconds=Math.max(1.25,3.1/(stage.fallSpeedMultiplier*factor*pressure));
 const speed=3.1/flightSeconds;
 const warningSeconds=speedClass==='rush'?.55:speedClass==='fast'?.32:0;
 const needed=(Object.entries(stage.targetItems) as [ItemType,number][]).filter(([k,n])=>(counts[k]||0)<n);
 const hazardRate=stage.bombChance+stage.poisonChance;
 const hazardEvery=Math.max(5,Math.round((stage.beat==='teach'?1.3:stage.beat==='rest'?1.2:1)/Math.max(.01,hazardRate)));
 const supportEvery=Math.max(18,Math.round(1/(stage.powerUpChance||.055)));
 let lane=LANES[stage.pattern][sequence%LANES[stage.pattern].length];
 if(trick!=='none'){const anchor=sequence-(trick==='overtake-pass'?1:0);lane=1+Math.floor(seededUnit(stage.id,anchor,4)*3);}
 let type:ItemType=needed.length?needed[Math.floor(sequence/(stage.pattern==='alternating'?3:1))%needed.length][0]:sequence%2?'fire':'ice';
 if(trick!=='none'){
  // Same-element/universal pairs avoid an unavoidable last-instant mode conflict.
  const anchor=sequence-(trick==='overtake-pass'?1:0);const elements=(['ice','fire'] as ItemType[]).filter(k=>stage.targetItems[k]);
  type=elements.length?elements[Math.floor(seededUnit(stage.id,anchor,6)*elements.length)]:'star';
 }
 const boss=bossPhase(elapsed,chapter);
 if(hazardRate>0&&sequence>5&&sequence%hazardEvery===hazardEvery-1&&trick==='none'&&beat!=='breather')type=stage.poisonChance>0&&sequence%2?'poison':'bomb';
 else if(sequence>0&&sequence%supportEvery===0&&trick==='none')type='power_shield';
 if(stage.objective==='boss'){
  const arrival=bossPhase(elapsed+flightSeconds+warningSeconds,chapter);
  if(boss.phase==='attack'&&sequence%3!==2){type=chapter===3?'poison':'bomb';lane=boss.lanes[sequence%boss.lanes.length];}
  else if(arrival.vulnerable&&sequence%3!==0)type=arrival.element;
  if(boss.phase==='attack'&&type!=='bomb'&&type!=='poison')lane=boss.safeLane;
 }
 let drift=stage.pattern==='crosswind'?(sequence%2?-.75:.75):stage.pattern==='spiral'?(lane-2)*.15:0;
 if(trick!=='none')drift=0;
 if(stage.objective==='boss'&&chapter===3)drift=boss.cycle%2?-.75:.75;
 const rhythm:Record<Beat,number>={lead:1,burst:.37,feint:.42,breather:1.65,climax:.31};
 let intervalMs=stage.spawnIntervalMs*rhythm[beat]*(.93+seededUnit(stage.id,sequence,9)*.14);
 if(stage.id<=2)intervalMs=stage.spawnIntervalMs*(beat==='breather'?1.25:beat==='burst'?.7:.95);
 if(stage.beat==='rest')intervalMs*=1.12;
 if(stage.objective==='boss')intervalMs*=boss.phase==='attack'?.72:boss.phase==='recover'?1.35:1;
 intervalMs=Math.max(230,Math.min(1850,intervalMs));
 return {type,lane,drift,speed,speedClass,beat,intervalMs,warningSeconds,flightSeconds,trick};
}
export interface AirspaceItem {type:ItemType;x:number;y:number;vx:number;vy:number;warningLeft?:number}
/** Retain a safe corridor and separate conflicting catch windows, or defer this spawn. */
export function safeDropLane(plan:DropPlan,now:number,catchY:number,width:number,margin:number,items:AirspaceItem[]):number|null {
 const targetTime=now+plan.warningSeconds+plan.flightSeconds;
 const positions=Array.from({length:5},(_,i)=>margin+(width-margin*2)*i/4);
 const incompatible=(type:ItemType)=>type==='bomb'||type==='poison'||plan.type==='bomb'||plan.type==='poison'||(type==='ice'&&plan.type==='fire')||(type==='fire'&&plan.type==='ice');
 const threats=items.filter(it=>!it.type.startsWith('power_')&&it.y<catchY&&it.vy>0).map(it=>{const delay=it.warningLeft||0;const travel=(catchY-it.y)/it.vy;return {type:it.type,at:now+delay+travel,x:Math.max(30,Math.min(width-30,it.x+it.vx*travel))};});
 const candidates=[plan.lane,...positions.map((_,i)=>i).filter(i=>i!==plan.lane).sort((a,b)=>Math.abs(a-plan.lane)-Math.abs(b-plan.lane))];
 for(const lane of candidates){const x=Math.max(30,Math.min(width-30,positions[lane]+plan.drift*35*plan.flightSeconds));
  if(threats.some(it=>Math.abs(it.at-targetTime)<.45&&Math.abs(it.x-x)<70&&(incompatible(it.type)||(it.type===plan.type&&plan.trick!=='overtake-pass'))))continue;
  if(plan.type==='bomb'||plan.type==='poison'){
   const hazards=threats.filter(it=>(it.type==='bomb'||it.type==='poison')&&Math.abs(it.at-targetTime)<.7);
   const blocked=positions.map(pos=>hazards.some(it=>Math.abs(it.x-pos)<65)||Math.abs(x-pos)<65);
   if(blocked.every(Boolean))continue;
  }
  return lane;
 }
 return null;
}
export function stageComplete(stage:CampaignStage,counts:Partial<Record<ItemType,number>>,bossHits:number){return quotaProgress(stage,counts)>=stage.targetCount&&(stage.objective!=='boss'||bossHits>=(stage.bossHits||0));}
export function retryHint(stage:CampaignStage,counts:Partial<Record<ItemType,number>>,energy:number){
 const needed=Object.entries(stage.targetItems).map(([k,n])=>({k,left:Math.max(0,(n||0)-(counts[k as ItemType]||0))})).filter(v=>v.left>0);
 const total=needed.reduce((sum,v)=>sum+v.left,0);
 if(total>0&&total<=3){const labels:Record<string,string>={ice:'Băng',fire:'Lửa',star:'Sao',gem:'linh hồn'};return `Còn ${needed.map(v=>`${v.left} ${labels[v.k]||v.k}`).join(' · ')}`;}
 if(energy>=100)return 'Fury đã sẵn sàng — dùng để thoát hiểm';
 return 'Nhường món chậm, đón món nhanh trước';
}
