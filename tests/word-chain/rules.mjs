// Word-chain rules (src/games/word-chain/rules.ts), dictionary (words.v1.json) and practice bots.
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,statSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const out=mkdtempSync(join(tmpdir(),'word-chain-'));const req=createRequire(import.meta.url);
for(const f of ['rules','lexicon','bot','normalize'])await build({entryPoints:[`src/games/word-chain/${f}.ts`],bundle:true,platform:'node',format:'cjs',outfile:join(out,f+'.cjs'),logLevel:'silent'});
const R=req(join(out,'rules.cjs')),{buildLexicon,decodeLexiconData}=req(join(out,'lexicon.cjs')),{botMove}=req(join(out,'bot.cjs')),N=req(join(out,'normalize.cjs'));
const data=decodeLexiconData(JSON.parse(readFileSync('public/games/word-chain/words.v2.json','utf8')));const lex=buildLexicon(data);
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS',name);};
const two=[{seat:'P1',name:'An'},{seat:'P2',name:'Bình'}],four=[...two,{seat:'P3',name:'Chi'},{seat:'P4',name:'Dũng'}];
const ready=(m,t=1000)=>{for(const p of m.players)m=R.setReady(m,p.seat,true,t,lex);return m;};
const playing=(players=two,seed=7)=>R.advanceTime(ready(R.createMatch(players,0,seed)),1000+R.COUNTDOWN_MS,lex);
// A fresh reply that itself still has replies (keeps scripted matches going).
const answer=m=>{const used=new Set(m.words.map(x=>x.key)),fresh=lex.startingWith(R.need(m)).filter(w=>!used.has(N.wordKey(w)));return fresh.find(w=>lex.startingWith(w.split(' ')[1]).some(x=>!used.has(N.wordKey(x))&&x!==w))??fresh[0];};

test('dictionary: NFC, two syllables, unique keys, size budget, no blocked words',()=>{
 assert.equal(data.license,'CC BY-SA 4.0');assert.ok(data.words.length>=34512&&data.openers.length>1000);
 const keys=new Set();for(const w of data.words){assert.equal(w,w.normalize('NFC'));assert.equal(w.split(' ').length,2,w);const k=N.wordKey(w);assert.ok(k,w);assert.ok(!keys.has(k),'duplicate '+w);keys.add(k);}
 for(const bad of ['địt','lồn','cặc','đéo','buồi'])assert.ok(!data.words.some(w=>w.split(' ').includes(bad)),bad);
 assert.ok(statSync('public/games/word-chain/words.v2.json').size<400_000);
});
test('expanded lexicon preserves all legacy answers and opening seeds',()=>{
 const old=JSON.parse(readFileSync('public/games/word-chain/words.v1.json','utf8'));
 for(const w of old.words)assert.ok(lex.has(N.wordKey(w)),w);
 assert.deepEqual(data.openers,old.openers);
 assert.throws(()=>decodeLexiconData({version:2,count:2,words:'con mèo',openers:[0]}));
 assert.throws(()=>decodeLexiconData({version:2,count:1,words:'con mèo',openers:[1]}));
});
test('attested everyday answers absent from the old lexicon can be played',()=>{
 for(const word of ['bàn học','lá bài','nghĩ thầm','nhảy xổ','trắng mắt','quạt gió'])assert.ok(lex.has(N.wordKey(word)),word);
 const base=playing(two,7),m={...base,words:[{...base.words[0],word:'cái bàn',key:N.wordKey('cái bàn')}]};
 const result=R.submitWord(m,m.turn,'BÀN HỌC',5000,lex);
 assert.equal(result.result.ok,true);assert.equal(result.match.words.at(-1).word,'bàn học');
 assert.throws(()=>decodeLexiconData({version:2,codec:'prefix',count:1,words:'~mèo',openers:[0]}));
});
test('openers are common nouns that always have replies',()=>{for(const o of data.openers){assert.ok(keys(o));assert.ok(lex.startingWith(o.split(' ')[1]).length>=12,o);}function keys(o){return lex.has(N.wordKey(o));}});
test('tone placement and case do not matter',()=>{
 assert.equal(N.wordKey('Hoà Bình'),N.wordKey('hòa bình'));assert.equal(N.wordKey('thuỷ  thủ'),N.wordKey('thủy thủ'));
 assert.equal(N.wordKey('hòa'),N.wordKey('hòa'));assert.equal(N.wordKey('a1 b'),null);assert.notEqual(N.wordKey('ma'),N.wordKey('mà'));
});
test('ready phase: all ready starts the countdown, order and opener are seeded',()=>{
 const m=ready(R.createMatch(four,0,42));assert.equal(m.phase,'countdown');assert.equal(m.deadline,1000+R.COUNTDOWN_MS);
 assert.equal(m.order.length,4);assert.equal(m.words.length,1);assert.ok(data.openers.includes(m.words[0].word));
 assert.deepEqual(ready(R.createMatch(four,0,42)).order,m.order);
 const t=R.advanceTime(m,m.deadline,lex);assert.equal(t.phase,'turn');assert.equal(t.turn,m.order[0]);assert.equal(t.deadline,m.deadline+30_000);
});
test('ready deadline: unready players leave; with fewer than two ready the match is off',()=>{
 let m=R.createMatch(four,0,1);m=R.setReady(m,'P1',true,5,lex);m=R.setReady(m,'P3',true,6,lex);
 const t=R.advanceTime(m,R.READY_MS,lex);assert.equal(t.phase,'countdown');assert.deepEqual([...t.order].sort(),['P1','P3']);
 assert.equal(t.players.find(p=>p.seat==='P2').out.reason,'unready');
 let solo=R.setReady(R.createMatch(two,0,1),'P1',true,5,lex);solo=R.advanceTime(solo,R.READY_MS,lex);
 assert.equal(solo.phase,'finished');assert.equal(solo.reason,'not-enough-ready');assert.equal(solo.winner,null);
});
test('valid answer passes the turn; each rejection has its reason and the turn stays',()=>{
 let m=playing();const seat=m.turn,need=R.need(m);
 const bad=(word,reason,t)=>{const r=R.submitWord(m,seat,word,t,lex);assert.equal(r.result.ok,false);assert.equal(r.result.reason,reason,word);assert.equal(r.match.turn,seat);m=r.match;};
 bad('mèo','format',5000);bad('con mèo con','format',6000);bad('xyz abc','chain',7000);bad(need+' qqq','unknown',8000);
 const fast=R.submitWord(m,seat,'abc',8100,lex);assert.equal(fast.result.reason,'too-fast');
 const w=answer(m);const ok=R.submitWord(m,seat,w.toUpperCase(),9000,lex);assert.ok(ok.result.ok);assert.notEqual(ok.match.turn,seat);
 assert.equal(ok.match.words.at(-1).word,w);assert.equal(ok.match.deadline,9000+30_000);
 // Reusing a word (e.g. the opener itself when it chains) is refused.
 const again=ok.match;const prev=again.words.find(x=>x.word.split(' ')[0]===R.need(again));
 if(prev)assert.equal(R.checkWord(again,prev.word,lex).reason,'used');
 assert.throws(()=>R.submitWord(ok.match,seat,w,10000,lex),e=>e.code==='NOT_YOUR_TURN');
});
test('timeout eliminates the player at the deadline and the last one standing wins',()=>{
 let m=playing(four,3);const first=m.turn;
 m=R.advanceTime(m,m.deadline,lex);assert.equal(m.players.find(p=>p.seat===first).out.reason,'timeout');assert.equal(m.players.find(p=>p.seat===first).out.place,4);
 m=R.advanceTime(m,m.deadline+ 2*30_000,lex);assert.equal(m.phase,'finished');assert.equal(m.reason,'last-standing');
 const s=R.standings(m);assert.deepEqual(s.map(x=>x.place),[1,2,3,4]);assert.equal(s[0].seat,m.winner);
});
test('answer time shrinks by round: 30 s, then 20 s from round 4, 15 s from round 7',()=>{
 assert.deepEqual([1,3,4,6,7,20].map(R.turnMs),[30000,30000,20000,20000,15000,15000]);
 let m=playing(two,9),t=m.deadline-29_000;const seen=[];
 for(let i=0;i<14&&m.phase==='turn';i++){const r=R.submitWord(m,m.turn,answer(m),t,lex);m=r.match;seen.push([m.round,m.deadline-t]);t+=1000;}
 assert.deepEqual(seen.slice(0,7).map(x=>x[0]),[1,2,2,3,3,4,4]);assert.equal(seen.find(x=>x[0]===4)[1],20000);assert.equal(seen.find(x=>x[0]===7)[1],15000);
});
test('forfeit: during your turn the next player goes; with two left the other wins',()=>{
 let m=playing(two,5);const a=m.turn,b=m.order.find(s=>s!==a);
 m=R.forfeit(m,a,'forfeit',2000,lex);assert.equal(m.phase,'finished');assert.equal(m.winner,b);
 let q=playing(four,5);const off=q.order[2];q=R.forfeit(q,off,'absent',2000,lex);assert.equal(q.phase,'turn');assert.equal(q.players.find(p=>p.seat===off).out.reason,'absent');
});
test('bots: easy and hard answer validly from the dictionary and never reuse words',()=>{
 for(const level of ['easy','hard']){let m=playing(four,11),t=4000,seed=1;const rand=()=>((seed=seed*16807%2147483647)/2147483647);
  for(let i=0;i<60&&m.phase==='turn';i++){const mv=botMove(m,lex,level,rand);
   if(mv.word===null){m=R.advanceTime(m,m.deadline,lex);t=m.deadline-R.turnMs(m.round);continue;}
   assert.ok(mv.delayMs>0&&mv.delayMs<R.turnMs(m.round),'delay');t+=mv.delayMs;const r=R.submitWord(m,m.turn,mv.word,t,lex);assert.ok(r.result.ok,`${level} ${mv.word}`);m=r.match;}
  assert.ok(m.words.length>4,level);}
});
console.log(`word-chain rules: ${checks} checks passed`);
