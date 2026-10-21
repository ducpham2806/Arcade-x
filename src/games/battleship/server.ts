/** Authoritative room core. Import on a trusted server only; never send Room to clients. */
import {createState,advanceTime,autoPlace,seeded,placeShip,clearFleet,setReady,fire,surrender,viewFor,shipId,type State,type Seat,type ShipType,type Mode,type Team,teamOf,activeSeat} from './engine';
export const RECONNECT_MS=90_000;
export type Room={rematchVotes?:Seat[];rematchRoomId?:string;rematchOf?:string;mode?:Mode;departed?:Seat[];surrenderVotes?:Seat[];takeoverGuard?:{seat:Seat;cutoff:number};matchmaking?:boolean;matchRequests?:Record<string,string>;lastSeen?:Partial<Record<Seat,number>>;closedAt?:number;closeReason?:'disconnect'|'abandoned'|'cancelled'|'expired';expiryGuard?:{cutoff:number;seats:Seat[]};id:string;code:string;version:number;status:'waiting'|'active'|'closed';members:Partial<Record<Seat,string>>;state:State|null;createdAt:number;receipts:{id:string;actor:string;fingerprint:string;version:number}[]};
export interface RoomStore{
 create(room:Room):Promise<Room>;
 rematch?(id:string,uid:string,version:number,actionId:string,fingerprint:string,agree:boolean,now:number,nextId:string,code:string,state:State):Promise<Room>;
 match?(uid:string,id:string,code:string,state:State,now:number):Promise<Room>;
 read(id:string):Promise<Room|null>;
 byCode(code:string):Promise<Room|null>;
 /** Atomic version check and replace. Must enforce one active room per identity across rooms. */
 cas(expectedVersion:number,next:Room):Promise<Room|null>;
 due(now:number):Promise<Room[]>;
 /** Room-row locked pulse, without changing gameplay version. */
 touch?(id:string,uid:string,now:number):Promise<Room|null>;
}
export type Command=
 |{type:'place';shipType:ShipType;row:number;col:number;horizontal:boolean}
 |{type:'rematch';agree:boolean}|{type:'team';team:Team}|{type:'cancel-search'}|{type:'auto'}|{type:'leave'}|{type:'clear'}|{type:'ready';ready:boolean}
 |{type:'fire';row:number;col:number;turnId:number}|{type:'surrender';agree?:boolean};
export class RoomError extends Error{constructor(public code:string,message:string){super(message);}}
const deny=(code:string,message:string):never=>{throw new RoomError(code,message);};
const seatFor=(room:Room,uid:string):Seat=>{const seat=(Object.entries(room.members) as [Seat,string][]).find(([,member])=>member===uid)?.[0];return seat||deny('NOT_MEMBER','Bạn không có quyền vào phòng này.');};
const seatsFor=(room:Room):Seat[]=>room.mode==='squad'||room.state?.mode==='squad'?['A1','B1','A2','B2']:['A1','B1'];
const inactive=(room:Room,seat:Seat,now:number)=>!!room.departed?.includes(seat)||(room.lastSeen?.[seat]??room.createdAt)<=now-RECONNECT_MS;
const controlFor=(room:Room,seat:Seat,now:number):Seat=>{const actor=room.state?activeSeat(room.state):seat;return room.state?.mode==='squad'&&room.state.phase==='battle'&&teamOf(actor)===teamOf(seat)&&inactive(room,actor,now)&&!room.departed?.includes(seat)?actor:seat;};
export function roomView(room:Room,uid:string,now=Date.now()){
 const seat=seatFor(room,uid),seats=seatsFor(room),peers=seats.filter(s=>s!==seat&&!!room.members[s]);
 return {rematch:{votes:room.rematchVotes||[],until:(room.closedAt||0)+120000,available:room.status==='closed'&&room.state?.phase==='finished'&&!room.closeReason&&!room.departed?.length&&now<(room.closedAt||0)+120000},mode:room.mode||room.state?.mode||'duel',capacity:seats.length,left:!!room.departed?.includes(seat),controlSeat:controlFor(room,seat,now),
  roster:seats.map(s=>({seat:s,occupied:!!room.members[s],ready:!!room.state?.ready.includes(s),left:!!room.departed?.includes(s),lastSeen:room.lastSeen?.[s]??room.createdAt})),
  surrenderVotes:(room.surrenderVotes||[]).filter(s=>teamOf(s)===teamOf(seat)),matchmaking:!!room.matchmaking,id:room.id,code:room.code,version:room.version,status:room.status,seat,memberCount:Object.keys(room.members).length,closeReason:room.closeReason,
  connection:{ownLastSeen:room.lastSeen?.[seat]??room.createdAt,opponentLastSeen:Math.max(room.createdAt,...peers.filter(s=>teamOf(s)!==teamOf(seat)).map(s=>room.lastSeen?.[s]??room.createdAt)),graceMs:RECONNECT_MS},view:room.state?viewFor(room.state,seat):null};
}
export class RoomServer{
 constructor(private store:RoomStore,private chooseFirst:()=>number=()=>crypto.getRandomValues(new Uint8Array(1))[0]){}
 async create(uid:string,id:string,code:string,now:number,mode:Mode='duel'){
  if(!['duel','squad'].includes(mode))deny('BAD_MODE','Chế độ phòng không hợp lệ.');
  if(!uid||!id||!/^[A-Z2-9]{6}$/.test(code))deny('BAD_REQUEST','Mã phòng không hợp lệ.');
  const room=await this.store.create({mode,id,code,version:0,status:'waiting',members:{A1:uid},lastSeen:{A1:now},state:null,createdAt:now,receipts:[]});return this.snapshot(uid,room.id,now);
 }
 async match(uid:string,id:string,code:string,now:number){
  if(!uid||!id||!/^[A-Z2-9]{6}$/.test(code))deny('BAD_REQUEST','Yêu cầu tìm trận không hợp lệ.');
  if(!this.store.match)deny('UNAVAILABLE','Tìm trận chưa sẵn sàng.');
  const room=await this.store.match!(uid,id,code,createState('duel',now,this.chooseFirst()%2),now);
  return this.snapshot(uid,room.id,now);
 }
 async join(uid:string,rawCode:string,now:number,team?:Team){
  if(team!==undefined&&team!==0&&team!==1)deny('BAD_TEAM','Phe không hợp lệ.');
  const code=rawCode.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))deny('BAD_CODE','Mã phòng phải gồm 6 ký tự.');
  for(let i=0;i<8;i++){
   const room=await this.store.byCode(code);if(!room)deny('NOT_FOUND','Phòng không tồn tại hoặc đã hết hạn.');
   if(Object.values(room.members).includes(uid))return this.snapshot(uid,room.id,now);
   const expired=this.expire(room,now);if(expired!==room){if(!await this.store.cas(room.version,expired))continue;deny('ROOM_CLOSED','Phòng đã đóng.');}
   if(room.status==='closed'||now-room.createdAt>=600000&&room.status==='waiting')deny('ROOM_CLOSED','Phòng đã đóng.');
   if(room.matchmaking)deny('QUEUE_ONLY','Phòng tìm trận chỉ nhận người qua tìm trận tự động.');
   if(room.status!=='waiting')deny('ROOM_FULL','Phòng đã đủ người.');
   const seats=seatsFor(room),seat=seats.find(s=>!room.members[s]&&(team===undefined||teamOf(s)===team));
   if(!seat)deny('ROOM_FULL','Phe đã đủ người. Hãy chọn phe khác hoặc một phòng khác.');
   const members={...room.members,[seat]:uid},full=Object.keys(members).length===seats.length;
   const next:Room={...room,version:room.version+1,status:full?'active':'waiting',members,lastSeen:{...room.lastSeen,[seat]:now},state:full?createState(room.mode||'duel',now,this.chooseFirst()%seats.length):null};
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid,now);
  }return deny('CONFLICT','Phòng đang thay đổi. Hãy thử lại.');
 }
 async snapshot(uid:string,id:string,now:number){
  for(let i=0;i<8;i++){
   const room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');seatFor(room,uid);
   if(room.rematchRoomId){id=room.rematchRoomId;continue;}
   const next=this.expire(room,now);if(next!==room&&next.status!=='closed')next.lastSeen={...next.lastSeen,[seatFor(room,uid)]:now};if(next===room){const touched=await this.store.touch?.(id,uid,now);return roomView(touched||room,uid,now);}
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid,now);
  }return deny('CONFLICT','Phòng đang đồng bộ. Hãy thử lại.');
 }
 async command(uid:string,id:string,version:number,actionId:string,command:Command,now:number){
  if(typeof actionId!=='string'||!actionId||actionId.length>128)deny('BAD_ACTION','Mã thao tác không hợp lệ.');
  const fingerprint=JSON.stringify(command);
  if(command.type==='rematch'){
   if(!Number.isInteger(version)||typeof command.agree!=='boolean'||!this.store.rematch)deny('BAD_REQUEST','Không thể đấu lại lúc này.');
   const room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');seatFor(room,uid);
   const bytes=crypto.getRandomValues(new Uint8Array(16));const nextId=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
   const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',code=Array.from(crypto.getRandomValues(new Uint8Array(6)),n=>chars[n%32]).join('');
   const state=createState(room.state?.mode||'duel',now,((room.state?.first||0)+1)%seatsFor(room).length);
   const result=await this.store.rematch!(id,uid,version,actionId,fingerprint,command.agree,now,nextId,code,state);
   return this.snapshot(uid,result.id,now);
  }
  for(let i=0;i<8;i++){
   let room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');const seat=seatFor(room,uid);
   const receipt=room.receipts.find(r=>r.id===actionId&&r.actor===uid);
   if(receipt){if(receipt.fingerprint!==fingerprint)deny('ACTION_REUSED','Không được dùng lại mã thao tác cho lệnh khác.');return {...(room.rematchRoomId?await this.snapshot(uid,room.rematchRoomId,now):roomView(room,uid,now)),duplicate:true,acceptedVersion:receipt.version};}
   const expired=this.expire(room,now);
   if(expired!==room){if(expired.status!=='closed')expired.lastSeen={...expired.lastSeen,[seat]:now};const saved=await this.store.cas(room.version,expired);if(!saved)continue;return deny('EXPIRED','Hết giờ. Hãy tải trạng thái mới trước khi thao tác.');}
   room=await this.store.touch?.(id,uid,now)||room;
   if(room.departed?.includes(seat))deny('LEFT_ROOM','Bạn đã rời trận này.');
   if(command.type==='team'){
    if(room.mode!=='squad'||room.status!=='waiting'||(command.team!==0&&command.team!==1))deny('BAD_TEAM','Chỉ đổi phe trong phòng chờ 2vs2.');
    if(seat==='A1')deny('HOST_SEAT','Chủ phòng giữ ghế A1.');
    if(version!==room.version)deny('VERSION_CONFLICT','Phòng đã thay đổi. Hãy đồng bộ.');
    const target=seatsFor(room).find(s=>teamOf(s)===command.team&&(!room.members[s]||s===seat));
    if(!target)deny('ROOM_FULL','Phe này đã đủ người.');
    const members={...room.members};delete members[seat];members[target]=uid;
    const lastSeen={...room.lastSeen};delete lastSeen[seat];lastSeen[target]=now;
    const next:Room={...room,members,lastSeen,version:room.version+1,receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
    const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid,now);continue;
   }
   if(command.type==='leave'&&room.state?.mode==='squad'&&room.state.phase==='battle'){
    if(version!==room.version)deny('VERSION_CONFLICT','Bàn đã thay đổi. Hãy đồng bộ.');
    const next=this.expire({...room,departed:[...new Set([...(room.departed||[]),seat])]},now);
    next.version=room.version+1;next.receipts=[...room.receipts,{id:actionId,actor:uid,fingerprint,version:next.version}];
    const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid,now);continue;
   }
   if(command.type==='cancel-search'&&(!room.matchmaking||room.status!=='waiting'))deny('QUEUE_MATCHED','Đã ghép đối thủ. Hãy đồng bộ để vào phần đặt tàu.');
   if((command.type==='leave'||command.type==='cancel-search')&&room.status!=='closed'){
    if(version!==room.version)deny('VERSION_CONFLICT','Phòng đã thay đổi. Hãy đồng bộ rồi thử lại.');
    const state=room.state?.phase==='battle'?surrender(room.state,seat):room.state;
    const next:Room={...room,state,status:'closed',closedAt:now,...(state?.phase!=='finished'?{closeReason:'cancelled' as const}:{}),version:room.version+1,receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
    const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid,now);continue;
   }
   if(room.status!=='active'||!room.state)deny('NOT_ACTIVE','Phòng chưa bắt đầu hoặc đã kết thúc.');
   if(!Number.isInteger(version)||version!==room.version)deny('VERSION_CONFLICT','Bàn đã thay đổi. Hãy đồng bộ trước khi thử lại.');
   let state=room.state;let takeoverGuard:Room['takeoverGuard'];let surrenderVotes=room.surrenderVotes;
   switch(command.type){
    case 'place':state=placeShip(state,{id:shipId(seat,command.shipType),owner:seat,type:command.shipType,row:command.row,col:command.col,horizontal:command.horizontal});break;
    case 'auto':state=autoPlace(state,seat,seeded(now));break;
    case 'clear':state=clearFleet(state,seat);break;
    case 'ready':if(typeof command.ready!=='boolean')deny('BAD_REQUEST','Trạng thái sẵn sàng không hợp lệ.');state=setReady(state,seat,command.ready,now);break;
    case 'fire':{const actor=controlFor(room,seat,now);if(actor!==seat&&!room.departed?.includes(actor))takeoverGuard={seat:actor,cutoff:now-RECONNECT_MS};state=fire(state,actor,command.row,command.col,now,command.turnId,actionId);break;}
    case 'surrender':
     if(state.mode==='duel')state=surrender(state,seat);
     else {if(state.phase!=='battle'||(command.agree!==undefined&&typeof command.agree!=='boolean'))deny('BAD_REQUEST','Chỉ đề nghị đầu hàng khi đang chiến đấu.');
      surrenderVotes=command.agree===false?(room.surrenderVotes||[]).filter(s=>s!==seat):[...new Set([...(room.surrenderVotes||[]),seat])];
      if(state.seats.filter(s=>teamOf(s)===teamOf(seat)).every(s=>surrenderVotes!.includes(s)))state={...state,phase:'finished',winner:teamOf(seat)===0?1:0,reason:'surrender'};
     }break;
    default:deny('BAD_COMMAND','Lệnh không được hỗ trợ.');
   }
   const next:Room={...room,state,surrenderVotes,...(takeoverGuard?{takeoverGuard}:{}),version:room.version+1,status:state.phase==='finished'?'closed':'active',...(state.phase==='finished'?{closedAt:now}:{}),receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
   const saved=await this.store.cas(room.version,next);if(saved)return {...roomView(saved,uid,now),duplicate:false,acceptedVersion:saved.version};
  }return deny('CONFLICT','Có thao tác đồng thời. Hãy đồng bộ rồi thử lại.');
 }
 private expire(room:Room,now:number):Room{
  if(room.status==='closed')return room;
  const seats=Object.keys(room.members) as Seat[],cutoff=now-RECONNECT_MS;
  const absent=seats.filter(seat=>(room.lastSeen?.[seat]??room.createdAt)<=cutoff);
  if(room.state?.mode==='squad'&&room.state.phase==='battle'){
   const lost=[0,1].filter(team=>room.state!.seats.filter(s=>teamOf(s)===team).every(s=>inactive(room,s,now)));
   if(lost.length){const both=lost.length===2;return {...room,state:both?{...room.state,winner:null}:{...room.state,phase:'finished',winner:lost[0]===0?1:0,reason:'surrender'},status:'closed',version:room.version+1,closedAt:now,closeReason:both?'abandoned':'disconnect',expiryGuard:{cutoff,seats:absent.filter(s=>!room.departed?.includes(s)&& (both||teamOf(s)===lost[0]))}};}
  }else if(absent.length){
   const both=absent.length===seats.length;
   const state=room.state?.phase==='battle'&&!both?{...room.state,phase:'finished' as const,winner:teamOf(absent[0])===0?1 as const:0 as const,reason:'surrender' as const}:room.state;
   return {...room,state,status:'closed',version:room.version+1,closedAt:now,closeReason:both?'abandoned':state?.phase==='finished'?'disconnect':'cancelled',expiryGuard:{cutoff,seats:absent}};
  }
  if(room.status==='waiting')return now-room.createdAt>=600000?{...room,status:'closed',closedAt:now,closeReason:'expired',version:room.version+1}:room;
  if(!room.state)return room;const state=advanceTime(room.state,now);return state===room.state?room:{...room,state,version:room.version+1};
 }
 /** Scheduler entrypoint: progresses time without any connected browser. */
 async tick(now:number){let updated=0;for(const room of await this.store.due(now)){const next=this.expire(room,now);if(next!==room&&await this.store.cas(room.version,next))updated++;}return {updated};}
}
