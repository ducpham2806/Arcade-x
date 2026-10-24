import type {SaveSessionFactory} from './save-hooks';
import type {StorageLike} from './story-save';
import {mountGame as mountLab} from './lab-app';
import {mountStory} from './story-app';
export function mountGame(root:HTMLElement,options:{createSaveSession?:SaveSessionFactory}={}){let hostPaused=false,hostMuted=false,hostVolume:number|undefined,destroyed=false;let active:ReturnType<typeof mountStory>|ReturnType<typeof mountLab>;
 let rawStore:StorageLike;try{rawStore=window.localStorage;}catch{rawStore={getItem(){throw Error('storage blocked');},setItem(){throw Error('storage blocked');}};}
 const completion=options.createSaveSession?.(rawStore);
 function showStory(){if(destroyed)return;active?.destroy();active=mountStory(root,showLab,completion);active.setHostPaused(hostPaused);if('setMuted'in active)active.setMuted(hostMuted);if(hostVolume!==undefined&&'setHostVolume'in active)active.setHostVolume(hostVolume);}
 function showLab(){active?.destroy();active=mountLab(root);const btn=document.createElement('button');btn.textContent='Về cốt truyện';btn.addEventListener('click',showStory);root.querySelector('.top-actions')?.prepend(btn);active.setHostPaused(hostPaused);}
 showStory();return {restart(){if(destroyed)return;if('restart'in active)active.restart();else{showStory();(active as ReturnType<typeof mountStory>).restart();}},setMuted(v:boolean){hostMuted=v;if('setMuted'in active)active.setMuted(v);},setHostVolume(v:number){hostVolume=v;if('setHostVolume'in active)active.setHostVolume(v);},setHostPaused(v:boolean){hostPaused=v;active.setHostPaused(v);},pause(){active.pause();},getState(){return active.getState();},destroy(){if(destroyed)return;destroyed=true;active.destroy();completion?.destroy();}};
}
