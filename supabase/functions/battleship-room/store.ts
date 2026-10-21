import type {Room,RoomStore} from './server.ts';
/** Only construct with server credentials from the Edge environment, never in browser code. */
export class PostgresRoomStore implements RoomStore{
 constructor(private url:string,private serviceKey:string){}
 private async rpc<T>(name:string,args:unknown):Promise<T>{
  const response=await fetch(`${this.url}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:this.serviceKey,Authorization:`Bearer ${this.serviceKey}`,'Content-Type':'application/json'},body:JSON.stringify(args)});
  if(!response.ok)throw new Error(`Room persistence failed (${response.status}).`);
  return response.json();
 }
 workerAllowed(token:string){return this.rpc<boolean>('bs_room_worker',{p_token:token});}
 takeRequest(uid:string,kind:'read'|'write'){return this.rpc<boolean>('bs_room_rate',{p_uid:uid,p_kind:kind});}
 create(room:Room){return this.rpc<Room>('bs_room_create',{p_room:room});}
 read(id:string){return this.rpc<Room|null>('bs_room_read',{p_id:id});}
 byCode(code:string){return this.rpc<Room|null>('bs_room_by_code',{p_code:code});}
 cas(version:number,next:Room){return this.rpc<Room|null>('bs_room_cas',{p_version:version,p_room:next});}
 due(now:number){return this.rpc<Room[]>('bs_room_due',{p_now:now});}
}
