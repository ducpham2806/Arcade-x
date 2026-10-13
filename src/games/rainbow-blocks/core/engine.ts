import levels from '../data/levels.json' with {type:'json'};
import scoring from '../data/scoring.json' with {type:'json'};
import {KINDS,cells,kicks,type Kind,type Piece} from './pieces';
export type Action='MOVE_LEFT'|'MOVE_RIGHT'|'SOFT_DROP'|'HARD_DROP'|'ROTATE_CW'|'ROTATE_CCW'|'ROTATE_180'|'HOLD';
export type Mode='highest_score'|'free_play'|'time_attack'|'custom_speed'|'sprint_40';
export type Options={mode:Mode;duration:number;speed:number;speedUp:boolean;rotate180:boolean};
export const DEFAULT_OPTIONS:Options={mode:'highest_score',duration:120,speed:1,speedUp:true,rotate180:false};
export const STEP=1000/60;
export type ReplayInput={tick:number;action:Action};
export type Event={id:number;type:'lock'|'drop'|'clear'|'level'|'hold'|'over';rows:number[];points:number;label:string;tick:number;piece?:Piece;fromY?:number};
export type State={version:1;seed:number;rng:number;options:Options;board:(Kind|null)[][];active:Piece|null;queue:Kind[];hold:Kind|null;holdUsed:boolean;score:number;level:number;lines:number;rainbows:number;maxCombo:number;combo:number;b2b:boolean;tick:number;elapsed:number;gravity:number;lock:number;resets:number;lastRotation:boolean;phase:'playing'|'clearing'|'over';clearRows:number[];delay:number;pieces:number;undoLeft:number;events:Event[];eventId:number;replay:ReplayInput[];buffer:ReplayInput[];reason:string};
export const emptyBoard=():State['board']=>Array.from({length:22},()=>Array(10).fill(null));
export class RainbowEngine {
 s:State; private undoState:State|null=null;
 constructor(seed:number,options:Options=DEFAULT_OPTIONS){
  this.s={version:1,seed:seed>>>0,rng:seed>>>0,options:{...options},board:emptyBoard(),active:null,queue:[],hold:null,holdUsed:false,score:0,level:1,lines:0,rainbows:0,maxCombo:0,combo:-1,b2b:false,tick:0,elapsed:0,gravity:0,lock:0,resets:0,lastRotation:false,phase:'playing',clearRows:[],delay:0,pieces:0,undoLeft:3,events:[],eventId:0,replay:[],buffer:[],reason:''};
  this.fillQueue();this.spawn();
 }
 static restore(raw:unknown):RainbowEngine|null{
  const s=raw as State;
  if(s?.version!==1||!Array.isArray(s.board)||s.board.length!==22||s.board.some(r=>!Array.isArray(r)||r.length!==10||r.some(k=>k!==null&&!KINDS.includes(k)))||!Number.isFinite(s.score)||!s.options||!Array.isArray(s.queue)||!Array.isArray(s.replay)||!['playing','clearing'].includes(s.phase))return null;
  const e=new RainbowEngine(s.seed,s.options);e.s=structuredClone(s);return e;
 }
 private random(){let t=this.s.rng+=0x6D2B79F5;this.s.rng>>>=0;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;}
 private fillQueue(){while(this.s.queue.length<7){const bag=[...KINDS];for(let i=6;i>0;i--){const j=Math.floor(this.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}this.s.queue.push(...bag);}}
 fits(p:Piece){return cells(p).every(([x,y])=>x>=0&&x<10&&y>=0&&y<22&&!this.s.board[y][x]);}
 grounded(){const p=this.s.active;return !!p&&!this.fits({...p,y:p.y+1});}
 ghost(){const p=this.s.active;if(!p)return null;const g={...p};while(this.fits({...g,y:g.y+1}))g.y++;return g;}
 private emit(type:Event['type'],rows:number[]=[],points=0,label='',extra:Partial<Event>={}){this.s.events.push({id:++this.s.eventId,type,rows,points,label,tick:this.s.tick,...extra});this.s.events=this.s.events.slice(-12);}
 private spawn(kind?:Kind){
  const s=this.s;this.fillQueue();s.active={kind:kind??s.queue.shift()!,rotation:0,x:3,y:0};this.fillQueue();s.gravity=0;s.lock=0;s.resets=0;s.lastRotation=false;
  if(!this.fits(s.active))this.finish('topout');
 }
 private moved(p:Piece,rotation=false){const s=this.s;const wasGrounded=this.grounded();s.active=p;s.lastRotation=rotation;if(wasGrounded&&s.resets<levels.maxLockResets){s.lock=0;s.resets++;}return true;}
 private rotate(direction:1|-1){const p=this.s.active;if(!p)return false;const to=(p.rotation+direction+4)%4;for(const [dx,dy] of kicks(p.kind,p.rotation,to)){const next={...p,rotation:to,x:p.x+dx,y:p.y-dy};if(this.fits(next))return this.moved(next,true);}return false;}
 action(action:Action,record=true){
  const s=this.s;if(s.phase==='over')return false;
  if(record)s.replay.push({tick:s.tick,action});
  if(s.phase==='clearing'){s.buffer.push({tick:s.tick,action});s.buffer=s.buffer.slice(-6);return false;}
  const p=s.active;if(!p)return false;
  if(action==='MOVE_LEFT'||action==='MOVE_RIGHT'){const next={...p,x:p.x+(action==='MOVE_LEFT'?-1:1)};return this.fits(next)&&this.moved(next);}
  if(action==='ROTATE_CW')return this.rotate(1);
  if(action==='ROTATE_CCW')return this.rotate(-1);
  if(action==='ROTATE_180'&&s.options.rotate180){const original={...p},oldLock=s.lock,oldResets=s.resets,oldRotation=s.lastRotation;if(this.rotate(1)&&this.rotate(1))return true;s.active=original;s.lock=oldLock;s.resets=oldResets;s.lastRotation=oldRotation;return false;}
  if(action==='SOFT_DROP'){if(this.fits({...p,y:p.y+1})){s.active={...p,y:p.y+1};s.lastRotation=false;s.score++;this.updateLevel();return true;}return false;}
  if(action==='HARD_DROP'){const g=this.ghost()!;s.score+=(g.y-p.y)*2;this.emit('drop',[],0,'',{piece:g,fromY:p.y});s.active=g;this.updateLevel();this.lockPiece();return true;}
  if(action==='HOLD'&&!s.holdUsed){const old=s.hold;s.hold=p.kind;s.holdUsed=true;this.spawn(old??undefined);this.emit('hold');return true;}
  return false;
 }
 speed(){const s=this.s;const fixed=s.options.mode==='custom_speed'||(s.options.mode==='free_play'&&!s.options.speedUp);if(fixed&&!s.options.speedUp)return s.options.speed;if(s.options.mode==='sprint_40')return 1;const speed=levels.levels[Math.min(12,s.level-1)].cellsPerSecond;return s.options.mode==='custom_speed'?Math.min(60,speed+s.options.speed-1):speed;}
 private updateLevel(){const s=this.s,score=s.score*(s.options.mode==='time_attack'?levels.timeAttackScoreDivisor:1);let level=levels.levels.filter(l=>score>=l.scoreFrom).at(-1)!.level;if(score>=102000)level=13+Math.floor((score-102000)/20000);if(level>s.level){s.level=level;this.emit('level',[],0,'LEVEL UP');}}
 private lockPiece(){
  const s=this.s,p=s.active!;if(s.options.mode==='free_play')this.undoState=structuredClone(s);
  const coords=cells(p);if(coords.every(([,y])=>y<2)){this.finish('topout');return;}
  const cx=p.x+1,cy=p.y+1;
  const spin=p.kind==='T'&&s.lastRotation&&[[-1,-1],[1,-1],[-1,1],[1,1]].filter(([dx,dy])=>{const x=cx+dx,y=cy+dy;return x<0||x>=10||y<0||y>=22||!!s.board[y][x];}).length>=3;
  for(const [x,y] of coords)s.board[y][x]=p.kind;
  s.pieces++;s.active=null;s.holdUsed=false;this.emit('lock',[],0,'',{piece:p});
  const rows=s.board.flatMap((row,y)=>row.every(Boolean)?[y]:[]);
  if(!rows.length){s.combo=-1;this.spawn();return;}
  s.combo++;s.maxCombo=Math.max(s.maxCombo,s.combo);s.lines+=rows.length;if(rows.length===4)s.rainbows++;
  const difficult=rows.length===4||spin,mult=s.options.mode==='custom_speed'?0.5+s.options.speed/20*1.5:1;
  const base=spin?[0,scoring.tspin.single,scoring.tspin.double,scoring.tspin.triple][rows.length]:[0,scoring.lineClear.single,scoring.lineClear.double,scoring.lineClear.triple,scoring.lineClear.quad][rows.length];
  const perfect=s.board.every((row,y)=>rows.includes(y)||row.every(c=>!c));
  const points=Math.round((base*(difficult&&s.b2b?scoring.backToBackMultiplier:1)+scoring.comboPerStep*Math.max(0,s.combo)+(perfect?scoring.perfectClear:0))*(s.level+1)*mult);
  const b2b=difficult&&s.b2b;s.b2b=difficult;s.score+=points;
  this.emit('clear',rows,points,perfect?'PERFECT CLEAR':spin?'T-SPIN':['','SINGLE','DOUBLE','TRIPLE','RAINBOW'][rows.length]+(b2b?' · B2B':''));this.updateLevel();
  s.clearRows=rows;s.phase='clearing';s.delay=rows.length===4?700:250+rows.length*50+100;
 }
 tick(){
  const s=this.s;if(s.phase==='over')return;s.tick++;s.elapsed+=STEP;
  if(s.phase==='clearing'){
   s.delay-=STEP;if(s.delay>0)return;
   s.board=[...Array.from({length:s.clearRows.length},()=>Array(10).fill(null)),...s.board.filter((_,y)=>!s.clearRows.includes(y))];s.clearRows=[];s.phase='playing';
   if(s.options.mode==='sprint_40'&&s.lines>=40){this.finish('sprint');return;}
   if(s.options.mode==='time_attack'&&s.elapsed>=s.options.duration*1000){this.finish('time');return;}
   this.spawn();const buffered=s.buffer.filter(a=>s.tick-a.tick<=6);s.buffer=[];for(const a of buffered)this.action(a.action,false);return;
  }
  if(s.options.mode==='time_attack'&&s.elapsed>=s.options.duration*1000){this.finish('time');return;}
  s.gravity+=STEP*this.speed()/1000;
  while(s.gravity>=1){s.gravity--;const p=s.active;if(p&&this.fits({...p,y:p.y+1})){s.active={...p,y:p.y+1};s.lastRotation=false;}else break;}
  if(this.grounded()){s.lock+=STEP;if(s.lock>=(s.level>=10?levels.lockDelayMs.fromLevel10:levels.lockDelayMs.default))this.lockPiece();}
 }
 finish(reason='ended'){if(this.s.phase==='over')return;this.s.phase='over';this.s.reason=reason;this.emit('over');}
 undo(){if(this.s.options.mode!=='free_play'||!this.undoState||this.s.undoLeft<=0)return false;const left=this.s.undoLeft-1,elapsed=this.s.elapsed,tick=this.s.tick;this.s=structuredClone(this.undoState);this.s.undoLeft=left;this.s.elapsed=elapsed;this.s.tick=tick;this.s.phase='playing';this.s.events=[];this.undoState=null;return true;}
 snapshot(){return structuredClone(this.s);}
}
export function replay(seed:number,options:Options,inputs:ReplayInput[],ticks:number){const e=new RainbowEngine(seed,options);let i=0;while(e.s.tick<=ticks&&e.s.phase!=='over'){while(i<inputs.length&&inputs[i].tick===e.s.tick)e.action(inputs[i++].action,false);if(e.s.tick===ticks)break;e.tick();}return e.s;}
