(() => {
 const gameId='neon-runner',keys=['nr-best-run-scores','neon-run-campaign-choice','nr-story-v08','nr-campaign-lab-v03'];let booted=false;
 window.__ARCADEX_PAUSED__=true;window.__ARCADEX_MUTED__=true;
 window.__arcadexSnapshot=()=>({version:1,storage:Object.fromEntries(keys.flatMap(k=>{const v=localStorage.getItem(k);return v!==null&&v.length<=500000?[[k,v]]:[];}))});
 const save=()=>{if(booted)parent.postMessage({type:'arcadex:standalone-save',gameId,snapshot:window.__arcadexSnapshot()},location.origin);};
 const state=m=>{window.__ARCADEX_PAUSED__=!!m.isPaused;window.__ARCADEX_MUTED__=!!m.isMuted;};
 addEventListener('message',event=>{
  const m=event.data;if(event.source!==parent||event.origin!==location.origin||m?.gameId!==gameId)return;
  if(m.type==='arcadex:standalone-state'){state(m);return;}
  if(m.type!=='arcadex:standalone-init')return;state(m);if(booted)return;
  const owner=typeof m.owner==='string'?m.owner:'guest',ownerKey='arcadex:standalone-owner:'+gameId,previous=localStorage.getItem(ownerKey);
  if(previous&&previous!==owner)keys.forEach(k=>localStorage.removeItem(k));
  if(m.payload?.version===1&&m.payload.storage&&typeof m.payload.storage==='object'){
   keys.forEach(k=>localStorage.removeItem(k));for(const k of keys){const v=m.payload.storage[k];if(typeof v==='string'&&v.length<=500000)localStorage.setItem(k,v);}
  }
  localStorage.setItem(ownerKey,owner);booted=true;const script=document.createElement('script');script.src='game.js';document.body.append(script);
 });
 for(const type of ['keydown','keyup','pointerdown','pointermove','pointerup'])addEventListener(type,event=>{if(window.__ARCADEX_PAUSED__){event.preventDefault();event.stopImmediatePropagation();}},true);
 setInterval(save,3000);addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
 parent.postMessage({type:'arcadex:standalone-ready',gameId},location.origin);
})();
