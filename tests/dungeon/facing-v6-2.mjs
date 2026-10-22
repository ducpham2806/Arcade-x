import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
await build({stdin:{contents:`export {TitanArt} from './src/games/dungeon-tap/components/TitanArt';export {BattlefieldV6} from './src/games/dungeon-tap/components/BattlefieldV6';export {freshState,reduceDungeon} from './src/games/dungeon-tap/engine';export {createElement} from 'react';export {renderToStaticMarkup} from 'react-dom/server';`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile:'/tmp/dungeon-facing-v62.cjs',format:'cjs',loader:{'.webp':'dataurl'}});
const {TitanArt,BattlefieldV6,freshState,reduceDungeon,createElement:h,renderToStaticMarkup:render}=await import('/tmp/dungeon-facing-v62.cjs');
const dom=node=>parseHTML(`<main>${render(node)}</main>`).document;
const noop=()=>{};
let s=freshState();s.allies=s.allies.map(a=>({...a,unlocked:true}));
const field=dom(h(BattlefieldV6,{s,send:noop,paused:false,hold:noop,stop:noop,openHero:noop,openAlly:noop}));
assert.equal(field.querySelectorAll('.v6-companion').length,6);
for(let i=0;i<6;i++){
 const right=[2,3,5].includes(i),actor=field.querySelector(`.v6-seat-${i}>.dt-actor`);
 assert.equal(actor.dataset.facing,right?'left':'right');
 assert.equal(actor.classList.contains('dt-face-mirrored'),right);
 assert.ok(!actor.parentElement.classList.contains('dt-face-mirrored'),'Never mirror button, labels or hit region');
}
assert.equal(field.querySelector('.v6-hero>.dt-actor').dataset.facing,'right');
assert.equal(field.querySelector('.v6-hero-level').textContent,String(s.heroLevel));
for(const unit of field.querySelectorAll('.v6-enemy'))assert.equal(unit.querySelector('.dt-actor').dataset.facing,'left');
// Source direction differs: new extras already face left, old goblins face right.
for(const pose of ['idle','attack']){
 const old=dom(h(TitanArt,{chapter:1,enemyVariant:0,pose,facing:'left'})).querySelector('.dt-actor');
 const extra=dom(h(TitanArt,{chapter:1,enemyVariant:3,pose,facing:'left'})).querySelector('.dt-actor');
 assert.ok(old.classList.contains('dt-face-mirrored'));assert.ok(!extra.classList.contains('dt-face-mirrored'));
}
// Dragon walk/step already face left; idle needs mirroring. Gallery remains authored.
for(const [pose,mirror] of [['idle',true],['walk',false],['step',false],['windup',false],['recovery',false]])assert.equal(dom(h(TitanArt,{chapter:5,boss:true,pose,facing:'left'})).querySelector('.dt-actor').classList.contains('dt-face-mirrored'),mirror);
assert.ok(!dom(h(TitanArt,{chapter:1,profession:'mage'})).querySelector('.dt-actor').classList.contains('dt-face-mirrored'));
console.log('PASS: six companion seats face inward; hero faces right; enemy sprites face left; native-left atlas exceptions retained; labels and source gallery unmirrored. DOM/SSR only.');
