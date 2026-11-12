import assert from 'node:assert/strict';import {parseHTML} from 'linkedom';
import {blankCampaign,CAMPAIGN_KEY,mergeClear,isUnlocked,parseCampaign,saveClear} from '../../src/games/snake-legend/src/story-save';
import {CHECKPOINT_KEY,capture} from '../../src/games/snake-legend/src/checkpoint';
import {Engine,T} from '../../src/games/snake-legend/src/core';import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {mountJourney} from '../../src/games/snake-legend/src/journey';import {journeyProgress} from '../../src/games/snake-legend/src/journey-model';
import {runCampaignLevel,steer} from './campaign-driver';
const {window}=parseHTML('<html><body><main id="root"></main></body></html>');Object.assign(globalThis,{window,document:window.document});
const root=window.document.getElementById('root')! as unknown as HTMLElement;
const data=new Map<string,string>();const store={getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};
const listeners=new Set<()=>void>();const hooks:any={subscribeCampaign:(fn:()=>void)=>{listeners.add(fn);return()=>listeners.delete(fn);}};const choices:any[]=[];
const click=(s:string)=>root.querySelector<HTMLElement>(s)!.dispatchEvent(new window.Event('click',{bubbles:true}));
const state=blankCampaign();assert.deepEqual(journeyProgress(state),{completed:0,stars:0,recommended:0});
let hub=mountJourney(root,store,c=>choices.push(c),()=>{},hooks);assert.equal(root.querySelectorAll('[data-level]').length,10);
assert(root.querySelector<HTMLButtonElement>('[data-level="1"]')!.disabled);click('[data-action="play"]');assert.deepEqual(choices.pop(),{level:0,resume:false});
const unlocked=mergeClear(state,{runId:'test-clear',levelId:'1-1',time:20,score:50,stars:[true,true,false]});store.setItem(CAMPAIGN_KEY,JSON.stringify(unlocked));for(const f of listeners)f();
assert.equal(hub.getState().selectedLevel,'1-2');assert.equal(root.querySelector<HTMLButtonElement>('[data-level="1"]')!.disabled,false);assert.equal(root.querySelector('.journey-clears')!.textContent,'1/10 màn');
click('[data-level="0"]');for(const f of listeners)f();assert.equal(hub.getState().selectedLevel,'1-1');
hub.setHostPaused(true);click('[data-action="play"]');assert.equal(choices.length,0);hub.destroy();assert.equal(listeners.size,0);
// Actual serialized checkpoint remains untouched by passive journey navigation.
const engine=new Engine(STORY_LEVELS[1]);for(let i=0;i<20;i++)engine.step({x:1,y:0,dash:false});
const checkpoint=JSON.stringify(capture(engine,'run-resume',[]));store.setItem(CHECKPOINT_KEY,checkpoint);
hub=mountJourney(root,store,c=>choices.push(c),()=>{},hooks);assert.equal(hub.getState().selectedLevel,'1-2');assert.equal(root.querySelector('[data-action="play"]')!.textContent,'Tiếp tục màn 1-2');
click('[data-action="play"]');assert.deepEqual(choices.pop(),{level:1,resume:true});assert.equal(store.getItem(CHECKPOINT_KEY),checkpoint);
click('[data-action="fresh"]');assert.deepEqual(choices.pop(),{level:1,resume:false});assert.equal(store.getItem(CHECKPOINT_KEY),checkpoint);hub.destroy();
store.setItem(CHECKPOINT_KEY,'corrupt');hub=mountJourney(root,store,()=>{},()=>{});assert(root.querySelector('.journey-storage-note')!.textContent!.includes('Không đọc được'));assert.equal(store.getItem(CHECKPOINT_KEY),'corrupt');hub.destroy();
const full=blankCampaign();for(let i=1;i<=10;i++)full.levels['1-'+i]={stars:[true,true,true],bestScore:100,bestTime:20};assert.deepEqual(journeyProgress(full),{completed:10,stars:30,recommended:9});
console.log('PASS journey: locked levels, next-level recommendation, live progress refresh, preserved selection, pause, checkpoint resume/restart, corrupt save retention, all-clear summary, subscription cleanup');

const playedStorage = new Map<string, string>();
const playedStore = {
  getItem: (key: string) => playedStorage.get(key) ?? null,
  setItem: (key: string, value: string) => { playedStorage.set(key, value); },
};
const played = [];
for (const [index, arena] of STORY_LEVELS.entries()) {
  const levelId = arena.story!.id;
  const before = parseCampaign(playedStore.getItem(CAMPAIGN_KEY));
  assert(isUnlocked(before, index), levelId + ' must unlock from the prior clear');
  if (index < STORY_LEVELS.length - 1) assert(!isUnlocked(before, index + 1));

  if (levelId === '1-7') {
    const failed = new Engine(arena);
    // Approach the first river from below its bridge.
    while (failed.status === 'running' && failed.tick < T.hz * 20) {
      failed.step(steer(failed, { x: 34, y: 66 }));
    }
    assert.equal(failed.status, 'lost');
    assert.equal(failed.hearts, 0);
    assert.match(failed.lastEvent, /Rơi khỏi cầu/);
    assert(!isUnlocked(before, index + 1));
  }

  const {engine: run, tutorials} = runCampaignLevel(index);
  assert.equal(run.status, 'won', `Timed out or lost in ${levelId}: ${run.lastEvent}`);
  const stars = run.stars.filter(Boolean).length;
  assert(stars >= (index === 9 ? 1 : 3), levelId + ' did not earn the expected stars');
  if (levelId === '1-6') assert(run.switchOn);
  if (levelId === '1-7') assert.deepEqual([...run.passed], ['bridge-a', 'bridge-b', 'bridge-c']);
  if (levelId === '1-8') {
    assert.equal(run.time, 45);
    assert(run.secret && run.collected > 0);
  }
  if (levelId === '1-9') assert(run.encounters!.trapped.size > 0);
  if (levelId === '1-10') {
    assert.deepEqual(tutorials, [2, 3]);
    assert.equal(run.encounters!.state, 'defeated');
    assert.equal(run.encounters!.totalHits, 6);
  }

  const clear = {runId: 'campaign-smoke-' + levelId, levelId, time: run.time, score: run.score, stars: run.stars, secret: run.secret};
  const saved = saveClear(playedStore, clear);
  assert.deepEqual(saveClear(playedStore, clear), saved, 'same run must not create a duplicate receipt');
  const restored = parseCampaign(playedStore.getItem(CAMPAIGN_KEY));
  assert.deepEqual(restored.levels[levelId], {stars: run.stars, bestTime: run.time, bestScore: run.score});
  played.push({levelId, seconds: Number(run.time.toFixed(2)), stars, hearts: run.hearts});
}
const restored = parseCampaign(playedStore.getItem(CAMPAIGN_KEY));
assert.equal(restored.receipts.length, STORY_LEVELS.length);
assert.deepEqual(restored.secrets, ['r01']);
assert.deepEqual(journeyProgress(restored), {
  completed: STORY_LEVELS.length,
  stars: played.reduce((sum, result) => sum + result.stars, 0),
  recommended: STORY_LEVELS.length - 1,
});
console.log('PASS R01 campaign: ten engine wins, sequential unlocks, bridge loss and retry, six boss hits, persisted stars and jade');
console.table(played);
