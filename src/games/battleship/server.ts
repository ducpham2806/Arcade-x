/** Authoritative room core. Import on a trusted server only; never send Room to clients. */
import {createState,advanceTime,placeShip,clearFleet,setReady,fire,surrender,viewFor,shipId,type State,type Seat,type ShipType} from './engine';
export type Room={id:string;code:string;version:number;status:'waiting'|'active'|'closed';members:Partial<Record<Seat,string>>;state:State|null;createdAt:number;receipts:{id:string;actor:string;fingerprint:string;version:number}[]};
export interface RoomStore{
 create(room:Room):Promise<Room>;
 read(id:string):Promise<Room|null>;
 byCode(code:string):Promise<Room|null>;
 /** Atomic version check and replace. Must enforce one active room per identity across rooms. */
 cas(expectedVersion:number,next:Room):Promise<Room|null>;
 due(now:number):Promise<Room[]>;
}
export type Command=
 |{type:'place';shipType:ShipType;row:number;col:number;horizontal:boolean}
 |{type:'clear'}|{type:'ready';ready:boolean}
 |{type:'fire';row:number;col:number;turnId:number}|{type:'surrender'};
export class RoomError extends Error{constructor(public code:string,message:string){super(message);}}
const deny=(code:string,message:string):never=>{throw new RoomError(code,message);};
const seatFor=(room:Room,uid:string):Seat=>{const seat=(Object.entries(room.members) as [Seat,string][]).find(([,member])=>member===uid)?.[0];return seat||deny('NOT_MEMBER','Bạn không có quyền vào phòng này.');};
export function roomView(room:Room,uid:string){const seat=seatFor(room,uid);return {id:room.id,code:room.code,version:room.version,status:room.status,seat,memberCount:Object.keys(room.members).length,view:room.state?viewFor(room.state,seat):null};}
export class RoomServer{
 constructor(private store:RoomStore,private chooseFirst:()=>number=()=>crypto.getRandomValues(new Uint8Array(1))[0]%2){}
 async create(uid:string,id:string,code:string,now:number){
  if(!uid||!id||!/^[A-Z2-9]{6}$/.test(code))deny('BAD_REQUEST','Mã phòng không hợp lệ.');
  const room=await this.store.create({id,code,version:0,status:'waiting',members:{A1:uid},state:null,createdAt:now,receipts:[]});return roomView(room,uid);
 }
 async join(uid:string,rawCode:string,now:number){
  const code=rawCode.trim().toUpperCase();if(!/^[A-Z2-9]{6}$/.test(code))deny('BAD_CODE','Mã phòng phải gồm 6 ký tự.');
  for(let i=0;i<8;i++){
   const room=await this.store.byCode(code);if(!room)deny('NOT_FOUND','Phòng không tồn tại hoặc đã hết hạn.');
   if(room.status==='closed'||now-room.createdAt>=600000&&room.status==='waiting')deny('ROOM_CLOSED','Phòng đã đóng.');
   if(Object.values(room.members).includes(uid))return this.snapshot(uid,room.id,now);
   if(room.status!=='waiting'||room.members.B1)deny('ROOM_FULL','Phòng đã đủ người.');
   const next:Room={...room,version:room.version+1,status:'active',members:{...room.members,B1:uid},state:createState('duel',now,this.chooseFirst())};
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid);
  }return deny('CONFLICT','Phòng đang thay đổi. Hãy thử lại.');
 }
 async snapshot(uid:string,id:string,now:number){
  for(let i=0;i<8;i++){
   const room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');seatFor(room,uid);
   const next=this.expire(room,now);if(next===room)return roomView(room,uid);
   const saved=await this.store.cas(room.version,next);if(saved)return roomView(saved,uid);
  }return deny('CONFLICT','Phòng đang đồng bộ. Hãy thử lại.');
 }
 async command(uid:string,id:string,version:number,actionId:string,command:Command,now:number){
  if(typeof actionId!=='string'||!actionId||actionId.length>128)deny('BAD_ACTION','Mã thao tác không hợp lệ.');
  const fingerprint=JSON.stringify(command);
  for(let i=0;i<8;i++){
   const room=await this.store.read(id);if(!room)deny('NOT_FOUND','Phòng không tồn tại.');const seat=seatFor(room,uid);
   const receipt=room.receipts.find(r=>r.id===actionId&&r.actor===uid);
   if(receipt){if(receipt.fingerprint!==fingerprint)deny('ACTION_REUSED','Không được dùng lại mã thao tác cho lệnh khác.');return {...roomView(room,uid),duplicate:true,acceptedVersion:receipt.version};}
   const expired=this.expire(room,now);
   if(expired!==room){const saved=await this.store.cas(room.version,expired);if(!saved)continue;return deny('EXPIRED','Hết giờ. Hãy tải trạng thái mới trước khi thao tác.');}
   if(room.status!=='active'||!room.state)deny('NOT_ACTIVE','Phòng chưa bắt đầu hoặc đã kết thúc.');
   if(!Number.isInteger(version)||version!==room.version)deny('VERSION_CONFLICT','Bàn đã thay đổi. Hãy đồng bộ trước khi thử lại.');
   let state=room.state;
   switch(command.type){
    case 'place':state=placeShip(state,{id:shipId(seat,command.shipType),owner:seat,type:command.shipType,row:command.row,col:command.col,horizontal:command.horizontal});break;
    case 'clear':state=clearFleet(state,seat);break;
    case 'ready':if(typeof command.ready!=='boolean')deny('BAD_REQUEST','Trạng thái sẵn sàng không hợp lệ.');state=setReady(state,seat,command.ready,now);break;
    case 'fire':state=fire(state,seat,command.row,command.col,now,command.turnId,actionId);break;
    case 'surrender':state=surrender(state,seat);break;
    default:deny('BAD_COMMAND','Lệnh không được hỗ trợ.');
   }
   const next:Room={...room,state,version:room.version+1,status:state.phase==='finished'?'closed':'active',receipts:[...room.receipts,{id:actionId,actor:uid,fingerprint,version:room.version+1}]};
   const saved=await this.store.cas(room.version,next);if(saved)return {...roomView(saved,uid),duplicate:false,acceptedVersion:saved.version};
  }return deny('CONFLICT','Có thao tác đồng thời. Hãy đồng bộ rồi thử lại.');
 }
 private expire(room:Room,now:number):Room{
  if(room.status==='closed')return room;
  if(room.status==='waiting')return now-room.createdAt>=600000?{...room,status:'closed',version:room.version+1}:room;
  if(!room.state)return room;const state=advanceTime(room.state,now);return state===room.state?room:{...room,state,version:room.version+1};
 }
 /** Scheduler entrypoint: progresses time without any connected browser. */
 async tick(now:number){let updated=0;for(const room of await this.store.due(now)){const next=this.expire(room,now);if(next!==room&&await this.store.cas(room.version,next))updated++;}return {updated};}
}
