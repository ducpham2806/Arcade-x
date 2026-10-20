/** Battleship rules v1. Pure state transitions: no DOM, renderer, storage or network. */
export type Mode = 'duel' | 'squad';
export type Team = 0 | 1;
export type Seat = 'A1' | 'B1' | 'A2' | 'B2';
export type Phase = 'placement' | 'battle' | 'finished';
export type ShipType = 'carrier' | 'battleship' | 'heavy-cruiser' | 'light-cruiser' | 'destroyer';
export const FLEET: ReadonlyArray<{type: ShipType; length: number; label: string}> = [
  {type:'carrier',length:5,label:'Tàu sân bay'}, {type:'battleship',length:4,label:'Thiết giáp hạm'},
  {type:'heavy-cruiser',length:3,label:'Tuần dương hạm'}, {type:'light-cruiser',length:3,label:'Tuần dương nhẹ'},
  {type:'destroyer',length:2,label:'Khu trục hạm'},
];
export const TURN_MS = 30_000;
export type Ship = {id: string; owner: Seat; type: ShipType; row: number; col: number; horizontal: boolean};
export type Shot = {id: string; turn: number; actor: Seat; target: Team; row: number; col: number; hit: boolean; sunk: string | null; revealedCells?: {row:number;col:number}[]; at: number};
export type TurnEvent = {turn: number; actor: Seat; kind: 'shot' | 'timeout'; at: number};
export type State = {
  rulesVersion: 1; mode: Mode; size: number; phase: Phase; seats: Seat[]; first: number;
  boards: Record<Team, Ship[]>; ready: Seat[]; shots: Shot[]; events: TurnEvent[];
  turn: number; turnIndex: number; deadline: number; winner: Team | null; reason: 'fleet' | 'surrender' | null;
};
export class RuleError extends Error {}
const requireRule = (condition: boolean, message: string) => { if (!condition) throw new RuleError(message); };
export const teamOf = (seat: Seat): Team => seat.startsWith('A') ? 0 : 1;
export const enemyOf = (seat: Seat): Team => teamOf(seat) === 0 ? 1 : 0;
export const activeSeat = (state: State): Seat => state.seats[state.turnIndex];
export const shipId = (seat: Seat, type: ShipType) => `${seat}:${type}`;
export const lengthOf = (ship: Pick<Ship, 'type'>) => FLEET.find(f => f.type === ship.type)!.length;
export function cellsOf(ship: Ship) {
  return Array.from({length:lengthOf(ship)}, (_, i) => ({row:ship.row+(ship.horizontal?0:i),col:ship.col+(ship.horizontal?i:0)}));
}
export function seeded(seed: number) { let x=seed>>>0; return () => { x+=0x6D2B79F5; let t=Math.imul(x^(x>>>15),1|x); t^=t+Math.imul(t^(t>>>7),61|t); return ((t^(t>>>14))>>>0)/4294967296; }; }
export function createState(mode: Mode='duel', now=Date.now(), first=0): State {
  const seats: Seat[]=mode==='squad'?['A1','B1','A2','B2']:['A1','B1'];
  requireRule(Number.isFinite(now) && Number.isInteger(first) && first>=0 && first<seats.length,'Cấu hình trận không hợp lệ.');
  return {rulesVersion:1,mode,size:mode==='squad'?14:10,seats,first,phase:'placement',boards:{0:[],1:[]},ready:[],shots:[],events:[],turn:1,turnIndex:first,deadline:now+(mode==='squad'?180_000:120_000),winner:null,reason:null};
}
export function placementError(state: State, ship: Ship): string | null {
  if (!state.seats.includes(ship.owner) || !FLEET.some(f=>f.type===ship.type) || ship.id!==shipId(ship.owner,ship.type)) return 'Tàu hoặc người sở hữu không hợp lệ.';
  if (!Number.isInteger(ship.row)||!Number.isInteger(ship.col)||typeof ship.horizontal!=='boolean') return 'Tọa độ không hợp lệ.';
  const cells=cellsOf(ship);
  if(cells.some(c=>c.row<0||c.col<0||c.row>=state.size||c.col>=state.size)) return 'Tàu vượt biên bàn.';
  if(state.mode==='squad') { const start=ship.owner.endsWith('1')?0:7; if(cells.some(c=>c.row<start||c.row>=start+7))return 'Tàu phải nằm trong khu vực của người đặt.'; }
  const occupied=new Set(state.boards[teamOf(ship.owner)].filter(s=>s.id!==ship.id).flatMap(cellsOf).map(c=>`${c.row},${c.col}`));
  if(cells.some(c=>occupied.has(`${c.row},${c.col}`)))return 'Tàu chồng lên tàu khác.';
  return null;
}
export function placeShip(state: State, ship: Ship): State {
  requireRule(state.phase==='placement','Giai đoạn đặt tàu đã kết thúc.');
  requireRule(!state.ready.includes(ship.owner),'Hủy sẵn sàng trước khi sửa tàu.');
  const error=placementError(state,ship); requireRule(!error,error||'Vị trí sai.');
  const team=teamOf(ship.owner);
  return {...state,boards:{...state.boards,[team]:[...state.boards[team].filter(s=>s.id!==ship.id),{...ship}]}};
}
export function clearFleet(state: State, seat: Seat): State {
  requireRule(state.phase==='placement'&&state.seats.includes(seat)&&!state.ready.includes(seat),'Không thể xóa tàu lúc này.');
  const team=teamOf(seat); return {...state,boards:{...state.boards,[team]:state.boards[team].filter(s=>s.owner!==seat)}};
}
/** Backtracking over shuffled legal candidates. Preserves ships already placed. */
export function autoPlace(state: State, seat: Seat, rng=seeded(1)): State {
  requireRule(state.phase==='placement'&&state.seats.includes(seat)&&!state.ready.includes(seat),'Không thể tự đặt tàu lúc này.');
  const missing=FLEET.filter(f=>!state.boards[teamOf(seat)].some(s=>s.id===shipId(seat,f.type)));
  function solve(current: State, index: number): State | null {
    if(index===missing.length)return current;
    const type=missing[index].type,candidates: Ship[]=[];
    for(let row=0;row<current.size;row++)for(let col=0;col<current.size;col++)for(const horizontal of [false,true]){
      const ship={id:shipId(seat,type),owner:seat,type,row,col,horizontal};if(!placementError(current,ship))candidates.push(ship);
    }
    for(let i=candidates.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[candidates[i],candidates[j]]=[candidates[j],candidates[i]];}
    for(const ship of candidates){const found=solve(placeShip(current,ship),index+1);if(found)return found;}
    return null;
  }
  const result=solve(state,0);requireRule(!!result,'Không còn cách đặt tàu hợp lệ.');return result!;
}
export function setReady(state: State, seat: Seat, ready: boolean, now=Date.now()): State {
  requireRule(state.phase==='placement'&&state.seats.includes(seat),'Không thể đổi trạng thái sẵn sàng.');
  if(ready)requireRule(FLEET.every(f=>state.boards[teamOf(seat)].some(s=>s.id===shipId(seat,f.type))),'Hãy đặt đủ 5 tàu.');
  const next={...state,ready:ready?[...new Set([...state.ready,seat])]:state.ready.filter(s=>s!==seat)};
  return next.ready.length===next.seats.length?{...next,phase:'battle',deadline:now+TURN_MS}:next;
}
function nextTurn(state: State, at: number): State {return {...state,turn:state.turn+1,turnIndex:(state.turnIndex+1)%state.seats.length,deadline:at+TURN_MS};}
/** Timer processing deliberately owns expiry; animations cannot extend a turn. */
export function advanceTime(state: State, now=Date.now()): State {
  if(now<state.deadline||state.phase==='finished')return state;
  if(state.phase==='placement'){
    let result=state;const start=state.deadline;
    for(const seat of state.seats)if(!result.ready.includes(seat)) {result=autoPlace(result,seat,seeded(start+state.seats.indexOf(seat)));result=setReady(result,seat,true,start);}
    return advanceTime(result,now);
  }
  const count=Math.floor((now-state.deadline)/TURN_MS)+1;
  // Compact large offline gaps; retain the most recent 128 timeout events.
  const events=Array.from({length:Math.min(count,128)},(_,i)=>{const offset=Math.max(0,count-128)+i;return {turn:state.turn+offset,actor:state.seats[(state.turnIndex+offset)%state.seats.length],kind:'timeout' as const,at:state.deadline+offset*TURN_MS};});
  return {...state,turn:state.turn+count,turnIndex:(state.turnIndex+count)%state.seats.length,deadline:state.deadline+count*TURN_MS,events:[...state.events,...events].slice(-128)};
}
export function fire(state: State, actor: Seat, row: number, col: number, now: number, expectedTurn: number, actionId: string): State {
  // Idempotent retries do not consume a new turn, including retry of the winning shot.
  if(state.shots.some(s=>s.id===actionId&&s.actor===actor))return state;
  requireRule(state.phase==='battle','Trận chưa bắt đầu hoặc đã kết thúc.');
  requireRule(now<state.deadline,'Hết giờ. Bạn đã mất lượt.');
  requireRule(expectedTurn===state.turn&&activeSeat(state)===actor,'Không phải lượt của bạn.');
  requireRule(typeof actionId==='string'&&actionId.length>0&&actionId.length<=128&&!state.shots.some(s=>s.id===actionId),'Mã phát bắn không hợp lệ.');
  requireRule(Number.isInteger(row)&&Number.isInteger(col)&&row>=0&&col>=0&&row<state.size&&col<state.size,'Tọa độ ngoài bàn.');
  const target=enemyOf(actor);
  requireRule(!state.shots.some(s=>s.target===target&&s.row===row&&s.col===col),'Ô này đã được bắn.');
  const ship=state.boards[target].find(s=>cellsOf(s).some(c=>c.row===row&&c.col===col));
  const hits=new Set(state.shots.filter(s=>s.target===target&&s.hit).map(s=>`${s.row},${s.col}`));hits.add(`${row},${col}`);
  const sunk=ship&&cellsOf(ship).every(c=>hits.has(`${c.row},${c.col}`))?ship.id:null;
  const shot: Shot={id:actionId,turn:state.turn,actor,target,row,col,hit:!!ship,sunk,...(sunk&&ship?{revealedCells:cellsOf(ship)}:{}),at:now};
  const next={...state,shots:[...state.shots,shot],events:[...state.events,{turn:state.turn,actor,kind:'shot' as const,at:now}].slice(-128)};
  const won=state.boards[target].length>0&&state.boards[target].every(s=>cellsOf(s).every(c=>hits.has(`${c.row},${c.col}`)));
  return won?{...next,phase:'finished',winner:teamOf(actor),reason:'fleet'}:nextTurn(next,now);
}
export function surrender(state: State, actor: Seat): State {
  requireRule(state.phase==='battle'&&state.seats.includes(actor),'Không thể đầu hàng.');
  requireRule(state.mode==='duel','Đầu hàng đội cần hai người đồng thuận.');
  return {...state,phase:'finished',winner:enemyOf(actor),reason:'surrender'};
}
/** Safe DTO for the renderer/network. Never expose enemy hull coordinates until sunk. */
export function viewFor(state: State, seat: Seat) {
  const ownTeam=teamOf(seat),enemy=enemyOf(seat),sunkIds=new Set(state.shots.filter(s=>s.target===enemy&&s.sunk).map(s=>s.sunk));
  return {rulesVersion:state.rulesVersion,mode:state.mode,size:state.size,phase:state.phase,turn:state.turn,activeSeat:activeSeat(state),deadline:state.deadline,winner:state.winner,reason:state.reason,
    ready:[...state.ready],own:state.boards[ownTeam].map(s=>({...s})),revealedEnemy:state.boards[enemy].filter(s=>sunkIds.has(s.id)).map(s=>({...s})),
    shots:state.shots.map(s=>({...s,...(s.revealedCells?{revealedCells:s.revealedCells.map(c=>({...c}))}:{})})),enemyFleetCount:state.mode==='squad'?10:5,enemySunk:sunkIds.size};
}
