import assert from 'node:assert/strict';
import {Engine,T} from '../../src/games/snake-legend/src/core';
import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {propStates,drawStoryProps,drawStoryPropLabels} from '../../src/games/snake-legend/src/story-props';
import {storyPropAssets} from '../../src/games/snake-legend/src/story-prop-assets';
import {capture,decode as decodeCheckpoint} from '../../src/games/snake-legend/src/checkpoint';
import {createHash} from 'node:crypto';import fs from 'node:fs';
// The shipped data URI must be the reviewed atlas, within its pre-production budget.
const bytes=Buffer.from(storyPropAssets.image.split(',')[1],'base64'),disk=fs.readFileSync('art/snake-legend/props-a2/story-props.webp');assert(bytes.equals(disk));assert(bytes.length<=180*1024);assert.equal(storyPropAssets.atlas.meta.decodedBytes,1048576);
for(const [id,a] of Object.entries(storyPropAssets.atlas.frames)){assert(a.frame.x>=2&&a.frame.y>=2&&a.frame.x+a.frame.w<=512&&a.frame.y+a.frame.h<=512,id);assert.deepEqual(a.pivot,{x:.5,y:.5});}
// The real puzzle trigger chooses the depressed state once, then remains latched.
const puzzle=STORY_LEVELS[5],p=puzzle.story!.switch!;
const engine=new Engine({...puzzle,start:{x:p.x-1.2,y:p.y},heading:0});assert.equal(propStates(engine).switch,'switch_off');assert.equal(propStates(engine).barrier,'closed');
for(let i=0;i<30;i++)engine.step({x:1,y:0,dash:false});assert(engine.switchOn);assert.equal(propStates(engine).switch,'switch_on');assert.equal(propStates(engine).exit,'exit_ready');assert.equal(propStates(engine).barrier,'open');
const restored=decodeCheckpoint(JSON.stringify(capture(engine,'props-checkpoint',[]))).engine;assert.deepEqual(propStates(restored),propStates(engine));
// Closed gate still blocks at its original collider; the latched gate permits passage.
const gate=puzzle.story!.gate!;const gateRun=()=>new Engine({...puzzle,start:{x:gate.x+gate.w/2,y:gate.y-2},heading:Math.PI/2});
const closed=gateRun(),open=gateRun();open.switchOn=true;for(let i=0;i<60;i++){closed.step({x:0,y:1,dash:false});open.step({x:0,y:1,dash:false});}assert(closed.pos.y<gate.y-T.headRadius+.001);assert(open.pos.y>gate.y+gate.h);
let depth=0;const arcs:any[]=[];const labels:string[]=[];const ctx:any={measureText:(s:string)=>({width:s.length*.22}),save(){depth++;},restore(){depth--;assert(depth>=0);},arc(...args:any[]){arcs.push(args);},fillText(s:string){labels.push(s);}};
for(const name of ['beginPath','fill','stroke','strokeRect','fillRect','setLineDash','roundRect'])ctx[name]=()=>{};
for(const arena of STORY_LEVELS)for(const ready of [false,true]){const e=new Engine(arena);e.goalReady=ready;e.switchOn=ready;const before=capture(e,'props-purity',[]);const drawn:string[]=[];drawStoryProps(ctx,e,(id)=>{drawn.push(id);return true;},()=>true,false);drawStoryPropLabels(ctx,e);assert.deepEqual(capture(e,'props-purity',[]),before);assert.equal(depth,0);assert.equal(drawn.length,arena.story!.goal==='timed_collect'?0:arena.story!.switch?2:1);
 // Decode/missing-image failures retain the primitive trigger markers.
 drawStoryProps(ctx,e,()=>false,()=>false,true);assert.equal(depth,0);
}
assert(labels.includes('VÀO CỔNG')&&labels.includes('CỔNG KHÓA')&&labels.includes('ĐÃ CHỐT ✓'));
const exitOnly=new Engine(STORY_LEVELS[0]);arcs.length=0;drawStoryProps(ctx,exitOnly,()=>true,()=>true,true);assert.equal(arcs[0][2],1,'exit marker matches engine trigger radius');arcs.length=0;drawStoryProps(ctx,engine,()=>true,()=>true,true);assert.equal(arcs[0][2],1,'switch marker matches engine trigger radius');
const bonus=new Engine(STORY_LEVELS[7]);assert.equal(propStates(bonus).exit,null);const lab=new Engine(0);assert.deepEqual(propStates(lab),{exit:null,switch:null,barrier:null});
console.log('PASS props: reviewed atlas hash '+createHash('sha256').update(bytes).digest('hex').slice(0,12)+', byte/texture budgets, real switch latch, checkpoint restore, gate collision, 20 level/state render cases, unchanged engine, timed bonus suppression, fallback');
