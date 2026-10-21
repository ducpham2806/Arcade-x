/** Authoritative room core. Import on a trusted server only; never send Room to clients. */
import {createState,advanceTime,autoPlace,seeded,placeShip,clearFleet,setReady,fire,surrender,viewFor,shipId,type State,type Seat,type ShipType,teamOf} from './engine.ts';
export const RECONNECT_MS=90_000;
export type Room={lastSeen?:Partial<Record<Seat,number>>;closedAt?:number;closeReason?:'disconnect'|'abandoned'|'cancelled'|'expired';expiryGuard?:{cutoff:number;seats:Seat[]};id:string;code:string;version:number;status:'waiting'|'active'|'closed';members:Partial<Record<Seat,string>>;state:State|null;createdAt:number;receipts:{id:string;actor:string;fingerprint:string;version:number}[]};
export interface RoomStore{
 create(room:Room):Promise<Room>;
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
 |{type:'auto'}|{type:'leave'}|{type:'clear'}|{type:'ready';ready:boolean}
 |{type:'fire';row:number;col:number;turnId:number}|{type:'surrender'};
export class RoomError extends Error{constructor(public code:string,message:string){super(message);}}
const deny=(code:string,message:string):never=>{throw new RoomError(code,message);};
const seatFor=(room:Room,uid:string):Seat=>{const seat=(Object.entries(room.members) as [Seat,string][]).find(([,member])=>member===uid)?.[0];return seat||deny('NOT_MEMBER','Bạn không có quyền vào phòng này.');};
export function roomView(room:Room,uid:string){const seat=seatFor(room,uid);return {id:room.id,code:room.code,version:room.version,status:room.status,seat,memberCount:Object.keys(room.members).length,closeReason:room.closeReason,connection:{ownLastSeen:room.lastSeen?.[seat]??room.createdAt,opponentLastSeen:room.lastSeen?.[seat==='A1'?'B1':'A1']??room.createdAt,graceMs:RECONNECT_MS},view:room.state?viewFor(room.state,seat):null};}
export class RoomServer{
 constructor(private store:RoomStore,private chooseFirst:()=>number=()=>crypto.getRandomValues(new Uint8Array(1))[0]%2){}
 async create(uid:string,id:string,code:string,now:number){
  if(!uid||!id||!/^[A-Z2-9]{6}$/.test(code))deny('BAD_REQUEST','Mã phòng không hợp lệ.');
  const room=await this.store.create({id,code,version:0,status:'waiting',members:{A1:uid},lastSeen:{A1:now},state:null,createdAt:now,receipts:[]});return this.snapshot(uid,room.id,now);
 }
 async join(uid:string,rawCode:string,now:number){
  const code=rawCode.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))deny('BAD_CODE','Mã phòng phải gồm 6 ký tự.');
  for(let i=0;i<8;i++){
   const room=await this.store.byCode(code);if(!room)deny('NOT_FOUND','Phòng không tồn tại hoặc đã hết hạn.');
   if(Object.values(room.members).includes(uid))return this.snapshot(uid,room.id,now);
   const expired=this.expire(room,now);if(expired!==room){if(!await this.store.cas(room.version,expired))continue;deny('ROOM_CLOSED','Phòng đã đóng.');}
   if(room.status==='closed'||now-room.createdAt>=600000&&room.status==='waiting')deny('ROOM_CLOSED','Phòng đã đóng.');
   if(room.status!=='waiting'||room.members.B1)deny('ROOM_FULL','Phòng đã đủ người.');
   const next:Room={...room,version:room.version+1,status:'active',members:{...room.members,B1:uid},lastSeen:{...room.lastSeen,B1:now},state:createState('duel',now,this.chooseFirst())};
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid);
  }return deny('CONFLICT','Phòng đang thay đổi. Hãy thử lại.');
 }
 async snapshot(uid:string,id:string,now:number){
  for(let i=0;i<8;i++){
   const room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');seatFor(room,uid);
   const next=this.expire(room,now);if(next!==room&&next.status!=='closed')next.lastSeen={...next.lastSeen,[seatFor(room,uid)]:now};if(next===room){const touched=await this.store.touch?.(id,uid,now);return roomView(touched||room,uid);}
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid);
  }return deny('CONFLICT','Phòng đang đồng bộ. Hãy thử lại.');
 }
 async command(uid:string,id:string,version:number,actionId:string,command:Command,now:number){
  if(typeof actionId!=='string'||!actionId||actionId.length>128)deny('BAD_ACTION','Mã thao tác không hợp lệ.');
  const fingerprint=JSON.stringify(command);
  for(let i=0;i<8;i++){
   let room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');const seat=seatFor(room,uid);
   const receipt=room.receipts.find(r=>r.id===actionId&&r.actor===uid);
   if(receipt){if(receipt.fingerprint!==fingerprint)deny('ACTION_REUSED','Không được dùng lại mã thao tác cho lệnh khác.');return {...roomView(room,uid),duplicate:true,acceptedVersion:receipt.version};}
   const expired=this.expire(room,now);
   if(expired!==room){if(expired.status!=='closed')expired.lastSeen={...expired.lastSeen,[seat]:now};const saved=await this.store.cas(room.version,expired);if(!saved)continue;return deny('EXPIRED','Hết giờ. Hãy tải trạng thái mới trước khi thao tác.');}
   room=await this.store.touch?.(id,uid,now)||room;
   if(command.type==='leave'&&room.status!=='closed'){
    if(version!==room.version)deny('VERSION_CONFLICT','Phòng đã thay đổi. Hãy đồng bộ rồi thử lại.');
    const state=room.state?.phase==='battle'?surrender(room.state,seat):room.state;
    const next:Room={...room,state,status:'closed',closedAt:now,...(state?.phase!=='finished'?{closeReason:'cancelled' as const}:{}),version:room.version+1,receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
    const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid);continue;
   }
   if(room.status!=='active'||!room.state)deny('NOT_ACTIVE','Phòng chưa bắt đầu hoặc đã kết thúc.');
   if(!Number.isInteger(version)||version!==room.version)deny('VERSION_CONFLICT','Bàn đã thay đổi. Hãy đồng bộ trước khi thử lại.');
   let state=room.state;
   switch(command.type){
    case 'place':state=placeShip(state,{id:shipId(seat,command.shipType),owner:seat,type:command.shipType,row:command.row,col:command.col,horizontal:command.horizontal});break;
    case 'auto':state=autoPlace(state,seat,seeded(now));break;
    case 'clear':state=clearFleet(state,seat);break;
    case 'ready':if(typeof command.ready!=='boolean')deny('BAD_REQUEST','Trạng thái sẵn sàng không hợp lệ.');state=setReady(state,seat,command.ready,now);break;
    case 'fire':state=fire(state,seat,command.row,command.col,now,command.turnId,actionId);break;
    case 'surrender':state=surrender(state,seat);break;
    default:deny('BAD_COMMAND','Lệnh không được hỗ trợ.');
   }
   const next:Room={...room,state,version:room.version+1,status:state.phase==='finished'?'closed':'active',...(state.phase==='finished'?{closedAt:now}:{}),receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
   const saved=await this.store.cas(room.version,next);if(saved)return {...roomView(saved,uid),duplicate:false,acceptedVersion:saved.version};
  }return deny('CONFLICT','Có thao tác đồng thời. Hãy đồng bộ rồi thử lại.');
 }
 private expire(room:Room,now:number):Room{
  if(room.status==='closed')return room;
  const seats=Object.keys(room.members) as Seat[],cutoff=now-RECONNECT_MS;
  const absent=seats.filter(seat=>(room.lastSeen?.[seat]??room.createdAt)<=cutoff);
  if(absent.length){
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
