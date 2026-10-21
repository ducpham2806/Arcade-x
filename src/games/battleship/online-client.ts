import type {Mode,Team} from './engine';
import type {Command,roomView} from './server';
export type RoomSnapshot=ReturnType<typeof roomView>&{serverNow?:number};
export type RoomRequest={type:'create';requestId:string;mode?:Mode}|{type:'match';requestId:string}|{type:'join';code:string;team?:Team}|{type:'snapshot';roomId:string}|{type:'command';roomId:string;version:number;actionId:string;command:Command};
export interface RoomTransport{request(body:RoomRequest):Promise<RoomSnapshot>}
export class TransportError extends Error{constructor(public code:string,message:string,public uncertain=false){super(message);}}
export function httpRoomTransport(url:string,publishableKey:string,token:()=>Promise<string|null>,fetcher:typeof fetch=fetch):RoomTransport{
 return {async request(body){const bearer=await token();if(!bearer)throw new TransportError('AUTH_REQUIRED','Đăng nhập tài khoản Arcade-x để chơi online.');const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12000);try{
 const response=await fetcher(url,{method:'POST',signal:controller.signal,headers:{apikey:publishableKey,Authorization:`Bearer ${bearer}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
 let result:any;try{result=await response.json();}catch{throw new TransportError('INVALID_RESPONSE','Không đọc được phản hồi. Hãy đồng bộ lại.',true);}
 if(!response.ok)throw new TransportError(result.error||'HTTP_ERROR',result.message||(response.status===401?'Phiên đăng nhập đã hết hạn.':response.status===429?'Thao tác quá nhanh. Hãy chờ một chút.':'Không thể thực hiện thao tác.'),response.status>=500);
 if(!result||typeof result.id!=='string'||!Number.isInteger(result.version)||!['A1','B1','A2','B2'].includes(result.seat)||'state' in result||'members' in result)throw new TransportError('INVALID_RESPONSE','Trạng thái phòng không hợp lệ.',true);
 return result as RoomSnapshot;
 }catch(e){if(e instanceof TransportError)throw e;throw new TransportError('NETWORK','Mất kết nối. Kiểm tra rồi thử lại thao tác đang chờ.',true);}finally{clearTimeout(timeout);}}};
}
export function requestId(){const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
/** One mutation in flight. Unknown outcomes retain the exact request/action ID for safe retry. */
export class RoomClient{
 snapshot:RoomSnapshot|null=null;pending:RoomRequest|null=null;busy=false;notice='';lastSync=0;clockOffset=0;
 private listeners=new Set<()=>void>();private closed=false;
 constructor(private transport:RoomTransport,private clock=()=>Date.now(),private uuid=requestId){}
 subscribe(fn:()=>void){this.listeners.add(fn);return()=>{this.listeners.delete(fn);};}
 private emit(){if(!this.closed)this.listeners.forEach(fn=>fn());}
 private apply(next:RoomSnapshot,sentAt:number){if(this.snapshot?.id===next.id&&next.version<this.snapshot.version)return;this.snapshot=next;this.lastSync=this.clock();if(Number.isFinite(next.serverNow))this.clockOffset=next.serverNow!-(sentAt+this.lastSync)/2;}
 get fresh(){return this.lastSync>0&&this.clock()-this.lastSync<7000;}
 get now(){return this.clock()+this.clockOffset;}
 async submit(body:RoomRequest){if(this.busy||this.pending)return;this.pending=body;await this.retry();}
 async retry(){if(!this.pending||this.busy||this.closed)return;const body=this.pending;this.busy=true;this.emit();const sent=this.clock();try{this.apply(await this.transport.request(body),sent);this.pending=null;this.notice='';}catch(e){this.notice=e instanceof Error?e.message:'Không thể kết nối.';if(e instanceof TransportError&&!e.uncertain){this.pending=null;}}finally{this.busy=false;this.emit();}if(!this.pending&&this.snapshot&&body.type==='command'){const feedback=this.notice;await this.refresh();if(feedback){this.notice=feedback;this.emit();}}}
 match(){return this.submit({type:'match',requestId:this.uuid()});}
 create(mode:Mode='duel'){return this.submit({type:'create',requestId:this.uuid(),mode});}
 join(code:string,team?:Team){return this.submit({type:'join',code:code.trim().toUpperCase(),team});}
 async command(command:Command){if(!this.snapshot||!this.fresh){this.notice='Đang chờ đồng bộ trạng thái mới.';this.emit();return;}return this.submit({type:'command',roomId:this.snapshot.id,version:this.snapshot.version,actionId:this.uuid(),command});}
 async refresh(roomId=this.snapshot?.id){if(!roomId||this.busy||this.closed)return;this.busy=true;const sent=this.clock();try{this.apply(await this.transport.request({type:'snapshot',roomId}),sent);if(!this.pending)this.notice='';}catch(e){this.notice=e instanceof Error?e.message:'Mất kết nối.';}finally{this.busy=false;this.emit();}}
 resetClosed(){if(this.busy||this.pending||this.snapshot?.status!=='closed')return;this.snapshot=null;this.lastSync=0;this.notice='';this.emit();}
 close(){this.closed=true;this.listeners.clear();}
}
