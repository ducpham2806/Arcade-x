import assert from 'node:assert/strict';
import {Engine} from '../../src/games/snake-legend/src/core';
import {STORY_LEVELS} from '../../src/games/snake-legend/src/story-data';
import {capture} from '../../src/games/snake-legend/src/checkpoint';
import {drawMotherRig,drawSnakeExpression,motherLegAngle,snakeExpression} from '../../src/games/snake-legend/src/character-motion';
import {R01_NOTES,chapterSummary,chapterEnding} from '../../src/games/snake-legend/src/chapter-content';
import {blankCampaign} from '../../src/games/snake-legend/src/story-save';

let depth=0,draws=0;const rotations:number[]=[];
const c:any={save(){depth++;},restore(){assert(--depth>=0);},drawImage(){draws++;},rotate(n:number){assert(Number.isFinite(n));rotations.push(n);}};
for(const key of ['translate','scale','beginPath','ellipse','fill','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','closePath','clip','stroke'])c[key]=()=>{};
const image={} as CanvasImageSource,frame={x:2,y:134,w:256,h:256},e=new Engine(STORY_LEVELS[9]),enc=e.encounters!;
for(const state of ['idle','telegraph','attack','recovery','weak','hurt','phase_change','defeated'] as const)for(const reduced of [false,true]){
 enc.state=state;enc.timer=20;
 const before=capture(e,'rig-purity',[]);draws=0;
 drawMotherRig(c,enc,e.time,image,frame,{x:0,y:0},7.2,reduced);
 assert.equal(draws,reduced?1:9);assert.equal(depth,0);assert.deepEqual(capture(e,'rig-purity',[]),before);
 for(let pair=0;pair<4;pair++)for(const side of [-1,1])for(const time of [0,.12,.4,1,1.6,12]){
  const angle=motherLegAngle(enc,time,pair,side,reduced);assert(Math.abs(angle)<=.141);
  assert.equal(angle,motherLegAngle(enc,time,pair,side,reduced),'pause repeats same rig pose');
  if(reduced)assert.equal(angle,0);
 }
}
enc.state='idle';assert(Math.abs(motherLegAngle(enc,0,1,1)-motherLegAngle(enc,1.6,1,1))<1e-12,'idle loop seam');
assert.notEqual(motherLegAngle(enc,0,0,1),motherLegAngle(enc,.4,0,1),'limb articulation, not a static still');
const snake=new Engine(STORY_LEVELS[0]);snake.tick=184;
assert(snakeExpression(snake).blink>.9);
const before=capture(snake,'head-purity',[]);drawSnakeExpression(c,snake,image,frame,{x:0,y:0},1.35,Math.PI);assert.equal(depth,0);assert.deepEqual(capture(snake,'head-purity',[]),before);
snake.lastPickup=snake.time-.15;assert(snakeExpression(snake).chew>.99);snake.dashing=true;assert.equal(snakeExpression(snake).tongue,0);assert.equal(snakeExpression(snake).determined,true);
const reduced=snakeExpression(snake,true);snake.tick=999;assert.deepEqual(snakeExpression(snake,true),reduced);snake.status='lost';assert.equal(snakeExpression(snake,true).blink,1);

assert.equal(R01_NOTES.length,10);for(const note of R01_NOTES)assert(note.read&&note.tip&&note.clear);
const campaign=blankCampaign(),blank=JSON.stringify(campaign);assert.equal(chapterSummary(campaign).complete,false);assert.equal(JSON.stringify(campaign),blank);
for(let i=1;i<=10;i++)campaign.levels[`1-${i}`]={stars:[true,true,i!==7],bestTime:30,bestScore:100};
assert.deepEqual(chapterSummary(campaign),{completed:10,stars:29,complete:true,perfect:false,masteryLevel:6,secret:false});assert.match(chapterEnding(campaign).collection,/vẫn chờ/);
campaign.secrets=['r01'];campaign.levels['1-7'].stars[2]=true;assert.equal(chapterSummary(campaign).perfect,true);assert.match(chapterEnding(campaign).collection,/Đã tìm thấy/);assert.match(chapterEnding(campaign).replay,/30 sao/);
console.log('PASS R01 character motion/content: 8 boss states, 8 articulated limbs, fixed pivot, loop seam, reduced still, head blink/chew/dash/loss, unchanged checkpoint, 10 notes, ending/29→30-star replay/optional secret');
