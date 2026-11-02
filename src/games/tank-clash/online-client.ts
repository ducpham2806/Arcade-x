import { CONFIG, moveVehicle, neutral, validInput } from './engine.ts';
import type { State, Input, Tank } from './engine.ts';
import { NET, PROTOCOL, unpackGame } from './protocol.ts';
import type { StatePacket, PlayerId, RoomView, InputFrame } from './protocol.ts';
export const ROOM_ERRORS: Record<string,string> = {
  AUTH_REQUIRED:'Cần đăng nhập lại để vào phòng.', ACCESS_DENIED:'Tài khoản chưa được cấp quyền thử game này.',
  ROOM_MISSING:'Phòng không tồn tại hoặc máy chủ đã khởi động lại.',ROOM_EXPIRED:'Phòng đã hết hạn.',ROOM_FULL:'Phòng đã đủ hai người.',
  GAME_STARTED:'Trận đã bắt đầu. Chỉ người có ghế cũ mới kết nối lại được.',RESUME_EXPIRED:'Ghế đã hết thời gian giữ hoặc phiên phòng không còn.',
  PROTOCOL_MISMATCH:'Hai bản game khác phiên bản. Hãy tải lại bản mới.',SESSION_REPLACED:'Phiên này đã được mở ở kết nối khác.',
  SERVER_FULL:'Máy chủ đang đầy. Hãy thử lại sau.',ALREADY_IN_ROOM:'Tài khoản đang có ghế ở phòng khác.',BAD_PHASE:'Thao tác không còn hợp lệ với trạng thái phòng.',
};
type Resume = {endpoint:string;code:string;resumeToken:string;id:PlayerId};
export type OnlineOptions = { endpoint:string; getAccessToken?:()=>Promise<string|undefined>; storage?:Pick<Storage,'getItem'|'setItem'|'removeItem'>;
  storageKey?:string; socketFactory?:(url:string,protocol:string)=>WebSocket; now?:()=>number };
type PendingCommand={message:Record<string,unknown>;resolve:(value:boolean)=>void;reject:(error:Error)=>void;sentAt:number;createdAt:number};
const uuid=()=>Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('');
const sameAngle=(a:number,b:number,t:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*t;
export function roomEndpoint(value:string) {
  const u=new URL(value);if(u.protocol==='http:')u.protocol='ws:';if(u.protocol==='https:')u.protocol='wss:';
  if(!['ws:','wss:'].includes(u.protocol)||u.username||u.password||u.search||u.hash)throw new Error('Địa chỉ máy chủ phòng không hợp lệ.');
  if(u.pathname==='/')u.pathname='/room';return u.toString();
}
export class TankRoomClient {
  readonly endpoint:string; readonly now:()=>number;
  status:'idle'|'connecting'|'connected'|'reconnecting'|'error'|'closed'='idle'; notice='';
  id:PlayerId|null=null;room:RoomView|null=null;authority:State|null=null;rtt=0;wallsRevision=-1;lastPacket:StatePacket|null=null;
  private socket:WebSocket|null=null;private listeners=new Set<()=>void>();private timer:ReturnType<typeof setInterval>|null=null;
  private retryAt=0;private retryDelay=250;private disconnectAt=0;private stopped=false;private generation=0;private openAt=0;
  private name='';private action:'create'|'join'|'resume'='create';private code='';private token='';private seq=0;private epoch='';private lastSeq=-1;
  private pending:InputFrame[]=[];private unsent:InputFrame[]=[];private predicted:State|null=null;
  private frames:{at:number;epoch:string;state:State}[]=[];private receivedAt=0;private heartbeatAt=0;private lastPongAt=0;
  private correction={x:0,y:0,at:0};private commands=new Map<string,PendingCommand>();private lastSyncAt=0;
  metrics={sentBytes:0,receivedBytes:0,reconnects:0,corrections:0,maxCorrection:0,staleSnapshots:0};
  private options:OnlineOptions;
  constructor(options:OnlineOptions){this.options=options;this.endpoint=roomEndpoint(options.endpoint);this.now=options.now||(()=>performance.now());}
  subscribe(fn:()=>void){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
  private emit(){for(const listener of this.listeners)listener();}
  saved():Resume|null{
    try{const s=JSON.parse(this.options.storage?.getItem(this.options.storageKey||'tank-clash:p2')||'null');
      return s?.endpoint===this.endpoint&&/^[A-Z2-9]{6}$/.test(s.code)&&/^[a-f0-9]{64}$/.test(s.resumeToken)?s:null;}catch{return null;}
  }
  private save(){try{this.options.storage?.setItem(this.options.storageKey||'tank-clash:p2',JSON.stringify({endpoint:this.endpoint,code:this.code,resumeToken:this.token,id:this.id}));}catch{}}
  private forget(){try{this.options.storage?.removeItem(this.options.storageKey||'tank-clash:p2');}catch{}}
  connect(action:'create'|'join'|'resume',code='',name='Người chơi'){
    if(this.timer)throw new Error('Connection already started');
    this.action=action;this.code=code.trim().toUpperCase();this.name=name.slice(0,20);
    if(action==='resume'){const saved=this.saved();if(!saved){this.status='error';this.notice=ROOM_ERRORS.RESUME_EXPIRED;this.emit();return;}this.code=saved.code;this.token=saved.resumeToken;this.id=saved.id;}
    this.status='connecting';this.emit();this.timer=setInterval(()=>this.pump(),50);void this.open();
  }
  private async open(){
    if(this.stopped)return;const generation=++this.generation;this.openAt=this.now();
    try{
      if(this.options.getAccessToken&&new URL(this.endpoint).protocol!=='wss:'&&!['localhost','127.0.0.1','[::1]'].includes(new URL(this.endpoint).hostname)){this.terminal('Máy chủ dùng tài khoản cần địa chỉ wss:// an toàn.');return;}
      const accessToken=await this.options.getAccessToken?.();if(this.stopped||generation!==this.generation)return;
      const ws=this.options.socketFactory?.(this.endpoint,PROTOCOL)||new WebSocket(this.endpoint,PROTOCOL);this.socket=ws;
      ws.addEventListener('open',()=>{if(this.stopped||this.socket!==ws){ws.close();return;}this.lastPongAt=this.now();this.send({type:'hello',protocol:PROTOCOL,action:this.token?'resume':this.action,code:this.code,name:this.name,...(this.token?{resumeToken:this.token}:{}),...(accessToken?{accessToken}:{})});});
      ws.addEventListener('message',event=>{if(this.socket!==ws||this.stopped)return;this.metrics.receivedBytes+=typeof event.data==='string'?new TextEncoder().encode(event.data).length:0;let msg;try{msg=JSON.parse(event.data);}catch{return;}this.receive(msg);});
      ws.addEventListener('close',()=>this.lostTransport(ws));
      ws.addEventListener('error',()=>{});
    }catch{this.terminal(ROOM_ERRORS.AUTH_REQUIRED);}
  }
  private lostTransport(ws:WebSocket){
    if(this.socket!==ws||this.stopped)return;this.socket=null;this.pending=[];this.unsent=[];
    if(!this.token){this.terminal('Không kết nối được máy chủ phòng. Kiểm tra địa chỉ và bản server đang chạy.');return;}
    if(!this.disconnectAt)this.disconnectAt=this.now();this.status='reconnecting';this.notice='Đang kết nối lại, xe đã ngừng nhận thao tác.';
    this.retryAt=this.now()+this.retryDelay+Math.random()*this.retryDelay*.25;this.retryDelay=Math.min(this.retryDelay*2,3000);this.emit();
  }
  private dropTransport(){const ws=this.socket;if(ws){this.lostTransport(ws);ws.close();}}
  private send(message:unknown){const ws=this.socket;if(!ws||ws.readyState!==1||ws.bufferedAmount>65536)return false;const text=JSON.stringify(message);this.metrics.sentBytes+=new TextEncoder().encode(text).length;ws.send(text);return true;}
  private terminal(message:string){this.notice=message;this.status='error';this.stopped=true;this.forget();if(this.timer)clearInterval(this.timer);this.timer=null;this.socket?.close();this.socket=null;for(const p of this.commands.values())p.reject(new Error(message));this.commands.clear();this.emit();}
  private receive(msg:any){
    if(!msg||typeof msg!=='object')return;
    if(msg.type==='welcome'){
      if(msg.protocol!==PROTOCOL||!['a','b'].includes(msg.id)||typeof msg.resumeToken!=='string'){this.terminal(ROOM_ERRORS.PROTOCOL_MISMATCH);return;}
      const resumed=this.status==='reconnecting';this.id=msg.id;this.token=msg.resumeToken;this.code=msg.state.room.code;this.action='resume';
      this.status='connected';this.notice='';this.retryDelay=250;this.disconnectAt=0;this.pending=[];this.unsent=[];this.epoch='';this.lastSeq=-1;
      this.seq=msg.nextSeq;this.lastPongAt=this.now();this.receiveState(msg.state);this.save();if(resumed)this.metrics.reconnects++;
      for(const p of this.commands.values()){this.send(p.message);p.sentAt=this.now();}this.emit();return;
    }
    if(msg.type==='state'){if(this.status==='connected')this.receiveState(msg);return;}
    if(msg.type==='pong'){if(Number.isFinite(msg.at)){this.rtt=Math.max(0,this.now()-msg.at);this.lastPongAt=this.now();}return;}
    if(msg.type==='ack'){const p=this.commands.get(msg.opId);if(p){this.commands.delete(msg.opId);if(msg.ok)p.resolve(true);else{this.notice=ROOM_ERRORS[msg.error]||'Không thực hiện được thao tác.';p.resolve(false);this.emit();}}return;}
    if(msg.type==='error'){if(msg.fatal)this.terminal(ROOM_ERRORS[msg.code]||'Phiên phòng không còn hợp lệ.');else{this.notice=ROOM_ERRORS[msg.code]||'Thao tác chưa hợp lệ.';this.emit();}return;}
    if(msg.type==='shutdown')this.terminal('Máy chủ đã dừng. Trận này không được tính kết quả.');
  }
  private receiveState(packet:StatePacket){
    if(!Number.isSafeInteger(packet.seq)||packet.seq<=this.lastSeq){this.metrics.staleSnapshots++;return;}
    if(packet.game&&packet.wallsRevision!==this.wallsRevision&&!packet.walls){if(this.now()-this.lastSyncAt>250){this.send({type:'sync'});this.lastSyncAt=this.now();}return;}
    const at=this.now(),old=this.predicted?.tanks.find(t=>t.id===this.id),changedEpoch=packet.epoch!==this.epoch;
    if(changedEpoch){this.pending=[];this.unsent=[];this.frames=[];this.correction={x:0,y:0,at};this.seq=(packet.ack[this.id||'a']??-1)+1;}
    this.epoch=packet.epoch;this.lastSeq=packet.seq;this.lastPacket=packet;this.room=packet.room;this.receivedAt=at;
    if(packet.walls)this.wallsRevision=packet.wallsRevision;
    this.authority=unpackGame(packet,changedEpoch?null:this.authority);
    if(this.id)this.pending=this.pending.filter(f=>f.seq>packet.ack[this.id!]);
    this.predicted=this.authority?structuredClone(this.authority):null;
    if(this.predicted&&this.id){const own=this.predicted.tanks.find(t=>t.id===this.id)!;for(const frame of this.pending)moveVehicle(this.predicted,own,frame.input,1/CONFIG.hz);
      if(old&&!changedEpoch&&own.hp>0){const dx=old.x-own.x,dy=old.y-own.y,d=Math.hypot(dx,dy);if(d>.15){this.metrics.corrections++;this.metrics.maxCorrection=Math.max(this.metrics.maxCorrection,d);this.correction=d<80?{x:dx,y:dy,at}:{x:0,y:0,at};}}
      this.frames.push({at,epoch:this.epoch,state:structuredClone(this.authority!)});if(this.frames.length>10)this.frames.shift();}
    this.emit();
  }
  sample(input:Input){
    if(this.status!=='connected'||this.room?.phase!=='playing'||this.authority?.status!=='playing'||!this.id||!validInput(input)||!this.predicted)return;
    if(this.now()-this.receivedAt>NET.staleMs)return;
    if(this.pending.length>=NET.maxPending){this.dropTransport();return;}
    const frame={seq:this.seq++,input:{...input}};this.pending.push(frame);this.unsent.push(frame);
    moveVehicle(this.predicted,this.predicted.tanks.find(t=>t.id===this.id)!,input,1/CONFIG.hz);
    if(input.fire||input.shield||this.unsent.length>=NET.batchSize)this.flush();
  }
  private flush(){while(this.unsent.length){const frames=this.unsent.slice(0,NET.maxBatch);if(!this.send({type:'input',epoch:this.epoch,frames,wallsAck:this.wallsRevision}))break;this.unsent.splice(0,frames.length);}}
  private pump(){
    const now=this.now();if(this.stopped)return;
    if(this.status==='connecting'&&now-this.openAt>8000){this.terminal('Kết nối quá thời gian chờ. Kiểm tra địa chỉ máy chủ rồi thử lại.');return;}
    if(this.status==='reconnecting'){
      if(now-this.disconnectAt>NET.graceMs){this.terminal(ROOM_ERRORS.RESUME_EXPIRED);return;}
      if(this.socket&&now-this.openAt>6000)this.dropTransport();
      if(now>=this.retryAt&&!this.socket){this.retryAt=Infinity;void this.open();}return;
    }
    if(this.status!=='connected')return;
    this.flush();
    if(now-this.heartbeatAt>NET.heartbeatMs){this.send({type:'ping',at:now,wallsAck:this.wallsRevision});this.heartbeatAt=now;}
    if(now-this.lastPongAt>NET.staleMs){this.dropTransport();return;}
    for(const [opId,p]of this.commands){if(now-p.createdAt>12000){this.commands.delete(opId);p.reject(new Error('Thao tác hết thời gian chờ.'));}else if(now-p.sentAt>600){this.send(p.message);p.sentAt=now;}}
  }
  command(action:string,value?:boolean){
    if(this.stopped||!this.id||this.commands.size>=12)return Promise.reject(new Error('Chưa có kết nối phòng.'));
    const opId=uuid(),message={type:'command',opId,action,...(value===undefined?{}:{value})};
    return new Promise<boolean>((resolve,reject)=>{this.commands.set(opId,{message,resolve,reject,sentAt:this.now(),createdAt:this.now()});this.send(message);});
  }
  neutralize(){this.pending=[];this.unsent=[];if(this.status==='connected')void this.command('neutral').catch(()=>{});}
  displayState(at=this.now()):State|null{
    if(!this.predicted)return null;const s=structuredClone(this.predicted),own=s.tanks.find(t=>t.id===this.id);
    if(own&&own.hp>0){const t=Math.exp(-(at-this.correction.at)/80);own.x+=this.correction.x*t;own.y+=this.correction.y*t;}
    const target=at-100,before=[...this.frames].reverse().find(f=>f.at<=target),after=this.frames.find(f=>f.at>=target);
    if(before&&after&&before!==after&&before.epoch===after.epoch){const t=(target-before.at)/(after.at-before.at);
      for(const tank of s.tanks)if(tank.id!==this.id){const a=before.state.tanks.find(x=>x.id===tank.id),b=after.state.tanks.find(x=>x.id===tank.id);if(a&&b){tank.x=a.x+(b.x-a.x)*t;tank.y=a.y+(b.y-a.y)*t;tank.angle=sameAngle(a.angle,b.angle,t);tank.aim=sameAngle(a.aim,b.aim,t);}}
      for(const bullet of s.bullets){const a=before.state.bullets.find(b=>b.id===bullet.id),b=after.state.bullets.find(b=>b.id===bullet.id);if(a&&b&&a.bounces===b.bounces){bullet.x=a.x+(b.x-a.x)*t;bullet.y=a.y+(b.y-a.y)*t;}}}
    if(this.room?.phase==='playing'&&s.status==='playing'){s.time+=Math.min(.25,(at-this.receivedAt)/1000);s.remaining=Math.max(0,s.remaining-Math.min(.25,(at-this.receivedAt)/1000));}
    if(this.id)s.stats=s.statsByPlayer[this.id];return s;
  }
  countdownSeconds(){if(!this.lastPacket)return 0;return Math.max(0,Math.ceil((this.lastPacket.room.deadline-this.lastPacket.serverNow-(this.now()-this.receivedAt))/1000));}
  inviteLink(){const url=new URL(this.endpoint);url.protocol=url.protocol==='wss:'?'https:':'http:';url.pathname='/';url.hash='room='+this.code;return url.toString();}
  async leave(){if(!this.stopped&&this.id){let timer:ReturnType<typeof setTimeout>|undefined;try{await Promise.race([this.command('leave'),new Promise(r=>timer=setTimeout(r,700))]);}catch{}finally{clearTimeout(timer);}}this.forget();this.close();}
  close(){if(this.stopped&&this.status==='closed')return;this.stopped=true;this.generation++;this.status='closed';if(this.timer)clearInterval(this.timer);this.timer=null;this.socket?.close();this.socket=null;for(const p of this.commands.values())p.reject(new Error('Đã đóng kết nối.'));this.commands.clear();this.listeners.clear();this.pending=[];this.unsent=[];}
}
