import {RoomError} from './server.ts';
import type {State} from './engine.ts';
import type {Room,RoomStore} from './server.ts';
/** Only construct with server credentials from the Edge environment, never in browser code. */
export class PostgresRoomStore implements RoomStore{
 constructor(private url:string,private serviceKey:string){}
 private async rpc<T>(name:string,args:unknown):Promise<T>{
  const response=await fetch(`${this.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:this.serviceKey,Authorization:`Bearer ${this.serviceKey}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
  if(!response.ok){let message='';try{message=(await response.json()).message||'';}catch{}
   if(message.includes('identity already has an active'))throw new RoomError('ACTIVE_ROOM','Bạn đang có phòng đang mở. Hãy rời phòng trước khi tìm trận mới.');
   if(message.includes('room ID conflict'))throw new RoomError('REQUEST_CONFLICT','Yêu cầu đã được dùng cho phòng khác. Hãy thử lại từ sảnh.');
   throw new Error(`Room persistence failed (${response.status}).`);}
  return response.json();
 }
 workerAllowed(token:string){return this.rpc<boolean>('bs_room_worker',{p_token:token});}
 takeRequest(uid:string,kind:'read'|'write'){return this.rpc<boolean>('bs_room_rate',{p_uid:uid,p_kind:kind});}
 match(uid:string,id:string,code:string,state:State,now:number){return this.rpc<Room>('bs_room_match',{p_uid:uid,p_id:id,p_code:code,p_state:state,p_now:now});}
 create(room:Room){return this.rpc<Room>('bs_room_create',{p_room:room});}
 read(id:string){return this.rpc<Room|null>('bs_room_read',{p_id:id});}
 byCode(code:string){return this.rpc<Room|null>('bs_room_by_code',{p_code:code});}
 cas(version:number,next:Room){return this.rpc<Room|null>('bs_room_cas',{p_version:version,p_room:next});}
 touch(id:string,uid:string,now:number){return this.rpc<Room|null>('bs_room_touch',{p_id:id,p_uid:uid,p_now:now});}
 due(now:number){return this.rpc<Room[]>('bs_room_due',{p_now:now});}
}
