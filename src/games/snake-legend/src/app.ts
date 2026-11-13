import type {SaveSessionFactory} from './save-hooks';
import type {StorageLike} from './story-save';
import {mountGame as mountLab} from './lab-app';
import {mountStory} from './story-app';
import {mountJourney,type JourneyChoice,type JourneyArt} from './journey';
export function mountGame(root:HTMLElement,options:{createSaveSession?:SaveSessionFactory;artwork?:JourneyArt;storage?:StorageLike;reviewTools?:boolean}={}){
 let hostPaused=false,hostMuted=false,hostVolume:number|undefined,destroyed=false;
 let active:ReturnType<typeof mountStory>|ReturnType<typeof mountLab>|ReturnType<typeof mountJourney>;
 let rawStore:StorageLike;try{rawStore=options.storage??window.localStorage;}catch{rawStore={getItem(){throw Error('storage blocked');},setItem(){throw Error('storage blocked');}};}
 const completion=options.createSaveSession?.(rawStore),store=completion?.storage??rawStore;
 function applyHost(){active.setHostPaused(hostPaused);if('setMuted'in active)active.setMuted(hostMuted);if(hostVolume!==undefined&&'setHostVolume'in active)active.setHostVolume(hostVolume);}
 function showStory(choice:JourneyChoice={level:0,resume:true}){if(destroyed)return;active?.destroy();active=mountStory(root,showLab,completion,{levelIndex:choice.level,resumeCheckpoint:choice.resume,onJourney:showJourney,reviewTools:options.reviewTools});applyHost();}
 function showJourney(){if(destroyed)return;active?.destroy();active=mountJourney(root,store,showStory,showLab,completion,options.artwork,options.reviewTools);applyHost();}
 function showLab(){if(destroyed)return;active?.destroy();active=mountLab(root);const btn=document.createElement('button');btn.textContent='Về hành trình';btn.addEventListener('click',showJourney);root.querySelector('.top-actions')?.prepend(btn);applyHost();}
 showJourney();
 return {restart(){if(destroyed)return;if('restart'in active)active.restart();else if(!('selectedLevel'in active.getState())){showStory();(active as ReturnType<typeof mountStory>).restart();}},setMuted(v:boolean){hostMuted=v;if('setMuted'in active)active.setMuted(v);},setHostVolume(v:number){hostVolume=v;if('setHostVolume'in active)active.setHostVolume(v);},setHostPaused(v:boolean){hostPaused=v;active.setHostPaused(v);},pause(){active.pause();},getState(){return active.getState();},destroy(){if(destroyed)return;destroyed=true;active.destroy();completion?.destroy();}};
}
