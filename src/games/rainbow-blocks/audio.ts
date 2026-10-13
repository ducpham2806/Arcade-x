// Original procedural audio; no remote audio or licensed samples required.
export class RainbowAudio {
 private ctx:AudioContext|null=null;private lastBeat=-1;
 unlock(){if(!this.ctx)this.ctx=new AudioContext();void this.ctx.resume();}
 sound(type:string,count=1,volume=.35){if(!this.ctx||this.ctx.state!=='running')return;const now=this.ctx.currentTime,notes=type==='clear'?[523,659,784,1047].slice(0,count):type==='level'?[659,784,1047]:type==='drop'?[110,65]:type==='over'?[330,247,165]:type==='hold'?[440,660]:[type==='rotate'?560:220];notes.forEach((f,i)=>{const o=this.ctx!.createOscillator(),g=this.ctx!.createGain();o.type=type==='drop'?'triangle':'sine';o.frequency.value=f;o.connect(g);g.connect(this.ctx!.destination);g.gain.setValueAtTime(0,now+i*.065);g.gain.linearRampToValueAtTime(volume*.18,now+i*.065+.008);g.gain.exponentialRampToValueAtTime(.001,now+i*.065+.15);o.start(now+i*.065);o.stop(now+i*.065+.17);});}
 music(tick:number,speed:number,volume:number){const beat=Math.floor(tick/(30-Math.min(10,speed)));if(beat===this.lastBeat)return;this.lastBeat=beat;if(beat%2===0)this.tone([262,330,392,330,294,349,440,349][beat%8],volume*.08);}
 private tone(f:number,volume:number){if(!this.ctx||this.ctx.state!=='running')return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),now=this.ctx.currentTime;o.type='triangle';o.frequency.value=f;o.connect(g);g.connect(this.ctx.destination);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+.2);o.start();o.stop(now+.22);}
 close(){void this.ctx?.close();this.ctx=null;}
}
