import controls from './data/controls.json' with {type:'json'};
import type {Action} from './core/engine';
export type Command=Action|'PAUSE'|'RESTART';
export type InputSettings={das:number;arr:number;sdf:number;bindings:Record<string,string[]>};
export const DEFAULT_INPUT:InputSettings={das:controls.timing.DASms,arr:controls.timing.ARRms,sdf:20,bindings:controls.keyboard};
// Keyboard, touch and gamepad all enter the same action stream. OS repeats are ignored.
export class InputManager {
 private held=new Map<string,{action:Command;age:number;repeat:number;order:number}>();private order=0;private softAge=0;
 constructor(public send:(action:Command)=>void,public settings:InputSettings=DEFAULT_INPUT){}
 binding(code:string){return Object.entries(this.settings.bindings).find(([,codes])=>codes.includes(code))?.[0] as Command|undefined;}
 press(source:string,action:Command){if(this.held.has(source))return;this.held.set(source,{action,age:0,repeat:0,order:++this.order});if(action!=='RESTART')this.send(action);}
 release(source:string){this.held.delete(source);}
 clear(){this.held.clear();this.softAge=0;}
 update(ms:number,speed:number){
  let direction:{action:Command;age:number;repeat:number;order:number}|undefined;
  for(const h of this.held.values()){h.age+=ms;if(h.action==='MOVE_LEFT'||h.action==='MOVE_RIGHT'){if(!direction||h.order>direction.order)direction=h;}if(h.action==='RESTART'&&h.age>=1000&&h.repeat===0){this.send('RESTART');h.repeat=1;}}
  if(direction&&direction.age>=this.settings.das){if(direction.age-ms<this.settings.das)this.send(direction.action);direction.repeat+=ms;if(this.settings.arr===0){for(let i=0;i<10;i++)this.send(direction.action);}else while(direction.repeat>=this.settings.arr){direction.repeat-=this.settings.arr;this.send(direction.action);}}
  if([...this.held.values()].some(h=>h.action==='SOFT_DROP')){this.softAge+=ms;const interval=Math.min(50,1000/(Math.max(1,speed)*this.settings.sdf));while(this.softAge>=interval){this.softAge-=interval;this.send('SOFT_DROP');}}else this.softAge=0;
 }
}
