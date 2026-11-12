import type {Page} from '@playwright/test';
/** Test-only observation of native resources; no clock, input, engine or render changes. */
export async function observeSnakeResources(page:Page){
 await page.addInitScript(()=>{
  const fromSnake=()=>new Error().stack?.includes('/src/games/snake-legend/');
  const frames=new Set<number>(),observers=new Set<ResizeObserver>(),contexts=new Set<AudioContext>();
  const listeners=new Set<{target:EventTarget;type:string;listener:any;capture:boolean}>();
  const intervals:number[]=[];let previous=0;
  const nativeRaf=window.requestAnimationFrame.bind(window),nativeCancel=window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame=callback=>{
   if(!fromSnake())return nativeRaf(callback);
   const id=nativeRaf(time=>{frames.delete(id);if(previous)intervals.push(time-previous);if(intervals.length>600)intervals.shift();previous=time;callback(time);});frames.add(id);return id;
  };
  window.cancelAnimationFrame=id=>{frames.delete(id);nativeCancel(id);};
  const NativeObserver=window.ResizeObserver;
  window.ResizeObserver=class extends NativeObserver{
   constructor(callback:ResizeObserverCallback){super(callback);if(fromSnake())observers.add(this);}
   disconnect(){observers.delete(this);super.disconnect();}
  };
  const NativeAudio=window.AudioContext;
  window.AudioContext=class extends NativeAudio{
   constructor(options?:AudioContextOptions){super(options);if(fromSnake())contexts.add(this);}
   close(){return super.close().finally(()=>contexts.delete(this));}
  };
  const nativeAdd=EventTarget.prototype.addEventListener,nativeRemove=EventTarget.prototype.removeEventListener;
  (EventTarget.prototype as any).addEventListener=function(type,listener,options){
   nativeAdd.call(this,type,listener,options);
   if(!listener||this!==window&&this!==document||!fromSnake()||options?.signal?.aborted)return;
   const capture=typeof options==='boolean'?options:!!options?.capture;
   if([...listeners].some(record=>record.target===this&&record.type===type&&record.listener===listener&&record.capture===capture))return;
   const record={target:this,type,listener,capture};listeners.add(record);
   if(options?.signal)nativeAdd.call(options.signal,'abort',()=>listeners.delete(record),{once:true});
  };
  (EventTarget.prototype as any).removeEventListener=function(type,listener,options){
   nativeRemove.call(this,type,listener,options);const capture=typeof options==='boolean'?options:!!options?.capture;
   for(const record of listeners)if(record.target===this&&record.type===type&&record.listener===listener&&record.capture===capture)listeners.delete(record);
  };
  (window as any).__snakeResources={resetTimings(){intervals.length=0;previous=0;},snapshot(){const sorted=[...intervals].sort((a,b)=>a-b);return {raf:frames.size,resizeObservers:observers.size,globalListeners:listeners.size,audioContexts:contexts.size,audioStates:[...contexts].map(c=>c.state),renderFrames:intervals.length,renderP95Ms:sorted.length?sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.95))]:null};}};
 });
}
export function snakeResources(page:Page){return page.evaluate(()=>(window as any).__snakeResources.snapshot());}
