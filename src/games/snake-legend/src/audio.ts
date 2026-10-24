import {audioAssets} from './audio-assets';
export const SOUND_EVENTS={
 eat:{asset:'sfx_eat_1',cooldown:.075,priority:1,limit:2,gain:.65},gold:{asset:'sfx_eat_gold',cooldown:.12,priority:2,limit:1,gain:.7},poison:{asset:'sfx_eat_poison',cooldown:.25,priority:3,limit:1,gain:.65},damage:{asset:'sfx_hit',cooldown:.3,priority:4,limit:1,gain:.7},switch:{asset:'sfx_switch',cooldown:.2,priority:2,limit:1,gain:.7},gate:{asset:'sfx_gate_open',cooldown:.5,priority:2,limit:1,gain:.6},bossWarn:{asset:'sfx_boss_warn',cooldown:.5,priority:3,limit:1,gain:.55},bossHit:{asset:'sfx_boss_weak_hit',cooldown:.3,priority:4,limit:1,gain:.8},win:{asset:'sfx_win',cooldown:1,priority:5,limit:1,gain:.7},lose:{asset:'sfx_die',cooldown:1,priority:5,limit:1,gain:.65},secret:{asset:'sfx_gem',cooldown:.5,priority:3,limit:1,gain:.7}
} as const;
export type SoundEvent=keyof typeof SOUND_EVENTS;
export class GameAudio{
 private context?:AudioContext;private master?:GainNode;private buffers=new Map<string,AudioBuffer>();private loading?:Promise<void>;private voices:{event:SoundEvent;source:AudioBufferSourceNode;gain:GainNode;priority:number;serial:number}[]=[];private last=new Map<SoundEvent,number>();private serial=0;private disposed=false;private paused=true;private muted=false;
 enabled=false;volume=.45;private hostVolume=1;ready=false;error='';
 constructor(private create:()=>AudioContext=()=>{const Constructor=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;return new Constructor();}){}
 get activeVoices(){return this.voices.length;}
 setEnabled(value:boolean){this.enabled=value;if(!value){this.ready=false;this.stop();void this.context?.suspend().catch(()=>{});}}
 setVolume(value:number){this.volume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;this.applyVolume();}
 setHostVolume(value:number){this.hostVolume=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;if(!this.hostVolume)this.stop();this.applyVolume();}
 setMuted(value:boolean){this.muted=value;if(value)this.stop();this.applyVolume();}
 setPaused(value:boolean){this.paused=value;if(value){this.stop();void this.context?.suspend().catch(()=>{});}}
 private applyVolume(){if(this.context&&this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*this.hostVolume,this.context.currentTime,.015);}
 async unlock(){if(this.disposed||!this.enabled||this.muted)return false;try{
  const c=this.context??=this.create();this.master??=c.createGain();this.master.gain.value=this.muted?0:this.volume*this.hostVolume;this.master.disconnect();this.master.connect(c.destination);
  // Resume is invoked synchronously inside the user gesture before awaiting decode.
  const resumed=c.resume();this.loading??=Promise.all(Object.entries(audioAssets).map(async([id,base64])=>{const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const buffer=await c.decodeAudioData(bytes.buffer);if(!this.disposed)this.buffers.set(id,buffer);})).then(()=>{});
  await Promise.all([resumed,this.loading]);if(this.disposed||!this.enabled||this.muted)return false;this.ready=c.state==='running';this.error=this.ready?'':'Trình duyệt chưa cho phát âm thanh; bấm Bắt đầu hoặc Tiếp tục.';return this.ready;
 }catch{if(!this.disposed){this.ready=false;this.loading=undefined;this.error='Chưa phát được âm thanh. Có thể tắt/bật lại; game vẫn chơi bình thường.';}return false;}}
 emit(event:SoundEvent){const c=this.context,def=SOUND_EVENTS[event];if(this.disposed||!this.enabled||this.paused||this.muted||this.volume*this.hostVolume<=0||!this.ready||!c||c.state!=='running')return false;const buffer=this.buffers.get(def.asset);if(!buffer)return false;const now=c.currentTime;if(now-(this.last.get(event)??-Infinity)<def.cooldown)return false;
  const same=this.voices.filter(v=>v.event===event);if(same.length>=def.limit)this.release(same[0]);if(this.voices.length>=4){const steal=[...this.voices].sort((a,b)=>a.priority-b.priority||a.serial-b.serial)[0];if(steal.priority>def.priority)return false;this.release(steal);}
  const source=c.createBufferSource(),gain=c.createGain();source.buffer=buffer;source.loop=false;gain.gain.value=def.gain;source.connect(gain);gain.connect(this.master!);const voice={event,source,gain,priority:def.priority,serial:++this.serial};this.voices.push(voice);source.onended=()=>this.release(voice,false);this.last.set(event,now);try{source.start();return true;}catch{this.release(voice);return false;}
 }
 private release(v:typeof this.voices[number],stop=true){const index=this.voices.indexOf(v);if(index<0)return;this.voices.splice(index,1);v.source.onended=null;if(stop)try{v.source.stop();}catch{}v.source.disconnect();v.gain.disconnect();}
 stop(){for(const v of [...this.voices])this.release(v);this.last.clear();}
 destroy(){if(this.disposed)return;this.disposed=true;this.stop();this.ready=false;this.buffers.clear();this.master?.disconnect();void this.context?.close().catch(()=>{});}
}
export type AudioSnapshot={status:string;hearts:number;length:number;collected:number;flowers:number;poison:number;switchOn:boolean;goal:boolean;secret:boolean;bossState?:string;bossHits:number};
export function audioEvents(before:AudioSnapshot,after:AudioSnapshot):SoundEvent[]{
 if(before.status!==after.status)return [after.status==='won'?'win':'lose'];
 if(after.hearts<before.hearts)return ['damage'];if(after.bossHits>before.bossHits)return ['bossHit'];if(!before.secret&&after.secret)return ['secret'];if(after.poison>before.poison)return ['poison'];if(after.switchOn&&!before.switchOn)return ['switch'];if(after.goal&&!before.goal)return ['gate'];if(after.bossState==='telegraph'&&before.bossState!=='telegraph')return ['bossWarn'];if(after.collected>before.collected||after.flowers>before.flowers)return [after.length-before.length>=3?'gold':'eat'];return [];
}
