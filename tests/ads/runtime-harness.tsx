import React, {StrictMode, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {AdProvider} from '../../src/ads/AdProvider';
import {AdSlot} from '../../src/ads/AdSlot';
import {canRequestAd, placementAllowed, unknownConsent, type AdContext, type AdsConsent} from '../../src/ads/policy';
import {readAdsConfig, type AdsConfig} from '../../src/ads/config';
import {loadAdSenseSdk} from '../../src/ads/loader';
import {createGoogleAdapter} from '../../src/ads/google';
import {createAdsRuntime} from '../../src/ads/runtime';
import type {AdOutcome, DisplayAdsAdapter} from '../../src/ads/runtime';

// Synthetic IDs exist only in this local harness. Only the fake adapter receives them.
const config: AdsConfig = {enabled:true,siteReady:true,production:true,client:'ca-pub-0000000000000000',units:{L1:'0000000000',L2:'0000000001'}};
const granted: AdsConsent = {status:'granted',canRequestAds:true};
const metrics = {loads:0,requests:0,aborts:0};
let finishLoad: () => void = () => {};
let rejectLoad: () => void = () => {};
let loadTask: Promise<void> | undefined;
let outcome: AdOutcome | 'pending' = 'filled';
let finishRequest: () => void = () => {};
const fake: DisplayAdsAdapter = {
  load: () => loadTask ??= new Promise<void>((resolve,reject) => {metrics.loads++;finishLoad=resolve;rejectLoad=()=>reject(new Error('blocked'));}),
  request: (_element, signal) => {
    metrics.requests++;
    return new Promise(resolve => {
      if (outcome !== 'pending') {resolve(outcome);return;}
      finishRequest=()=>resolve('filled');
      signal.addEventListener('abort',()=>{metrics.aborts++;resolve('error');},{once:true});
    });
  },
};
function Harness() {
  const [consent,setConsent] = useState<AdsConsent>(()=>new URLSearchParams(location.search).has('granted')?granted:unknownConsent);
  const [blocked,setBlocked] = useState(false);
  const [game,setGame] = useState<string|null>(null);
  const [narrow,setNarrow] = useState(false);
  const [shown,setShown] = useState(true);
  const [filter,setFilter] = useState(false);
  const [revision,setRevision] = useState(0);
  Object.assign(window, {adsHarness:{metrics,config,granted,unknownConsent,canRequestAd,placementAllowed,readAdsConfig,
    consent:setConsent,block:setBlocked,game:setGame,narrow:setNarrow,show:setShown,filter:setFilter,
    remount:()=>setRevision(n=>n+1),load:async()=>{finishLoad();await loadTask;},failLoad:()=>rejectLoad(),outcome:(value:typeof outcome)=>{outcome=value;},finish:()=>finishRequest(),
    sdkStartWhileEligible:async () => {
      const frame=document.createElement('iframe');document.body.append(frame);const doc=frame.contentDocument!;
      let eligible=true;const starts:boolean[]=[];
      doc.head.append=(...nodes)=>{starts.push(eligible);queueMicrotask(()=>(nodes[0] as Node).dispatchEvent(new Event('load')));};
      const runtime=createAdsRuntime({load:client=>loadAdSenseSdk(doc,client,20),request:async()=> 'filled'},doc);
      const task=runtime.load(config.client);eligible=false;await task;frame.remove();return starts;
    },
    sdkTest:async (mode:'load'|'error'|'timeout') => {
      const frame=document.createElement('iframe'); document.body.append(frame);
      const doc=frame.contentDocument!;
      let appends=0;
      doc.head.append = (...nodes) => { appends++; if(mode!=='timeout') queueMicrotask(()=>(nodes[0] as Node).dispatchEvent(new Event(mode))); };
      const first=loadAdSenseSdk(doc,config.client,20);
      const second=loadAdSenseSdk(doc,config.client,20);
      const results=await Promise.allSettled([first,second]);
      const third=await loadAdSenseSdk(doc,config.client,20).then(()=>true,()=>false);
      const conflict=await loadAdSenseSdk(doc,'ca-pub-1111111111111111',20).then(()=>false,()=>true);
      frame.remove();return {same:first===second,appends,results:results.map(r=>r.status),third,conflict};
    },
    duplicatePush:async () => {
      const doc=document.implementation.createHTMLDocument();let pushes=0;
      Object.defineProperty(doc,'defaultView',{value:{adsbygoogle:{push:()=>{pushes++;}}}});
      const element=doc.createElement('ins');doc.body.append(element);const signal=new AbortController().signal;
      const first=createGoogleAdapter(doc,30).request(element,signal);
      const second=await createGoogleAdapter(doc,30).request(element,signal);
      element.setAttribute('data-ad-status','filled');return {first:await first,second,pushes};
    },
    googleStatus:async (status:string) => {
      const doc=document.implementation.createHTMLDocument();
      Object.defineProperty(doc,'defaultView',{value:{adsbygoogle:{push:()=>{}}}});
      const node=doc.createElement('ins');doc.body.append(node);
      const abort=new AbortController();
      const promise=createGoogleAdapter(doc,30).request(node,abort.signal);
      if(status==='abort') abort.abort();
      else node.setAttribute(status==='processing'?'data-adsbygoogle-status':'data-ad-status',status==='processing'?'done':status);
      return promise;
    },
  }});
  return <div className="arcade-launcher">
    <button id="play" onClick={()=>setGame('fixture-game')}>Chơi</button><button id="exit" onClick={()=>setGame(null)}>Thoát</button>
    <AdProvider key={revision} adapter={fake} hasContent config={config} consent={consent} activeGameId={game} blocked={blocked}>
      <div id="slot-container" style={{width:narrow?0:320}}>
        {shown&&<AdSlot placement={matchMedia('(max-width:767px)').matches?'L2':'L1'} blocked={filter}/>}
      </div>
    </AdProvider>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><Harness/></StrictMode>);
