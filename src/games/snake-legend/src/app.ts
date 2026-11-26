import type {SaveSessionFactory} from './save-hooks';
import type {StorageLike} from './story-save';
import {mountGame as mountLab} from './lab-app';
import {mountStory} from './story-app';
import {mountJourney,type JourneyChoice,type JourneyArt} from './journey';
import {campaignMap} from './campaign';
export function mountGame(root:HTMLElement,options:{createSaveSession?:SaveSessionFactory;artwork?:JourneyArt;storage?:StorageLike;reviewTools?:boolean}={}){
 let hostPaused=false,hostMuted=false,hostVolume:number|undefined,destroyed=false;
 let active:ReturnType<typeof mountStory>|ReturnType<typeof mountLab>|ReturnType<typeof mountJourney>;
 let rawStore:StorageLike;try{rawStore=options.storage??window.localStorage;}catch{rawStore={getItem(){throw Error('storage blocked');},setItem(){throw Error('storage blocked');}};}
 const completion=options.createSaveSession?.(rawStore),store=completion?.storage??rawStore;
 const startingMap=campaignMap(store);
 const recommended=startingMap.findIndex(entry=>entry.unlocked&&!entry.complete);
 let chapterIndex=recommended<0?startingMap.length-1:recommended;
 function applyHost(){active.setHostPaused(hostPaused);if('setMuted'in active)active.setMuted(hostMuted);if(hostVolume!==undefined&&'setHostVolume'in active)active.setHostVolume(hostVolume);}
 function showStory(choice:JourneyChoice={level:0,resume:true}){
  if(destroyed)return;
  const entry=campaignMap(store)[chapterIndex];
  if(!entry.unlocked){chapterIndex=0;showJourney();return;}
  active?.destroy();
  active=mountStory(root,showLab,chapterIndex===0?completion:undefined,{
   chapter:entry.chapter,levelIndex:choice.level,resumeCheckpoint:choice.resume,
   onJourney:showJourney,storage:store,reviewTools:options.reviewTools,
  });
  applyHost();
 }
 function showJourney(){
  if(destroyed)return;
  active?.destroy();
  active=mountJourney(root,store,showStory,showLab,completion,options.artwork,options.reviewTools,()=>showPractice('trials'),{
   index:chapterIndex,open(index){
    chapterIndex=index;
    showJourney();
    root.querySelector<HTMLButtonElement>('[data-chapter][aria-current="true"]')?.focus({preventScroll:true});
   },
  });
  applyHost();
 }
 function showLab(){showPractice('lab');}
 function showPractice(mode:'lab'|'trials'){
  if(destroyed)return;
  active?.destroy();active=mountLab(root,store,mode);
  const btn=document.createElement('button');btn.textContent='Về hành trình';
  if(mode==='trials'){btn.className='trial-return';btn.dataset.action='trial-return';}
  btn.addEventListener('click',()=>{
   showJourney();
   if(mode==='trials')root.querySelector<HTMLButtonElement>('[data-action="trials"]')?.focus({preventScroll:true});
  });
  root.querySelector('.top-actions')?.prepend(btn);applyHost();
 }
 showJourney();
 return {restart(){if(destroyed)return;if('restart'in active&&active.restart)active.restart();else if(!('selectedLevel'in active.getState())){showStory();(active as ReturnType<typeof mountStory>).restart();}},setMuted(v:boolean){hostMuted=v;if('setMuted'in active)active.setMuted(v);},setHostVolume(v:number){hostVolume=v;if('setHostVolume'in active)active.setHostVolume(v);},setHostPaused(v:boolean){hostPaused=v;active.setHostPaused(v);},pause(){active.pause();},getState(){return active.getState();},destroy(){if(destroyed)return;destroyed=true;active.destroy();completion?.destroy();}};
}
