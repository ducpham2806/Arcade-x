const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const file=path.join(__dirname,'../../public/standalone/neon-run/game.js'),source=fs.readFileSync(file,'utf8');
const els=new Map(),events={};let draws=0;
function el(){return{textContent:'',hidden:false,value:'auto',style:{setProperty(){}},handlers:{},replaceChildren(){},setAttribute(name,value){(this.attributes??={})[name]=value},addEventListener(type,fn){(this.handlers[type]??=[]).push(fn)},append(){},setPointerCapture(){},getContext(){return new Proxy({drawImage(im,...args){assert(im);args.forEach(n=>assert(Number.isFinite(n)));if(args.length===8){assert(args[0]>=0&&args[1]>=0&&args[0]+args[2]<=im.width&&args[1]+args[3]<=im.height,"image crop stays inside source")}draws++}},{get:(o,k)=>o[k]||(()=>{})})}}}
// Reads pixel size from PNG or WebP (VP8L / VP8 / VP8X) headers.
function imageSize(b){if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){const kind=b.toString('ascii',12,16);if(kind==='VP8L'){const v=b.readUInt32LE(21);return [(v&16383)+1,((v>>14)&16383)+1]}if(kind==='VP8X')return [b.readUIntLE(24,3)+1,b.readUIntLE(27,3)+1];return [b.readUInt16LE(26)&16383,b.readUInt16LE(28)&16383]}return [b.readUInt32BE(16),b.readUInt32BE(20)]}
class Img{set src(uri){const b=fs.readFileSync(path.join(__dirname,'../../public/standalone/neon-run',uri));[this.width,this.height]=imageSize(b);this.onload()}}
const c={__NEON_QA_NO_AUTOSTORY__:true,console,Math,JSON,Set,Number,Object,Promise,Image:Img,localStorage:{getItem:()=>null,setItem(){}},document:{querySelector(s){if(!els.has(s))els.set(s,el());return els.get(s)},createElement:el,addEventListener(){}},addEventListener(name,fn){events[name]=fn},events,requestAnimationFrame(){}};c.window=c;vm.createContext(c);vm.runInContext(source,c);const run=s=>vm.runInContext(s,c);let passed=0;const ok=(expr,msg)=>{assert(run(expr),msg);passed++};
setImmediate(()=>{
 ok('art.ready','asset loading');ok('LEVELS.length===40','campaign');ok('Object.keys(HERO_SHEETS).length===3','skins');
 for(let i=0;i<40;i++){
  run(`art.manual='auto';load(${i});draw()`);ok('p.x===60','spawn '+i);
  run('p.x=L.cp+5;p.y=316;p.ground=true;step(1/120)');ok('checkpoint','checkpoint '+i);
  run('L.memories[0].taken=true;die();step(.45)');ok('art.dying>0&&deaths===1','death hold '+i);run('step(.46)');ok('art.dying===0&&!L.memories[0].taken','respawn rollback '+i);
  run(`load(${i});L.objects.filter(o=>o.kind==='mission'||o.kind==='delivery').forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);if(L.boss)L.boss.dead=true;p.x=L.exit;p.y=316;interact()`);ok('won&&art.action===\'celebrate\'','finish anim '+i);run('step(1.4)');ok("$('#result').hidden",'celebrate before popup '+i);run('step(.11)');ok("!$('#result').hidden",'result '+i);
 }
 run("load(0);L.enemies=[];L.hazards=[];p.y=316;p.ground=true;input.right=true;step(.05)");ok("art.action==='run'",'running');run('input.right=false;p.vx=0;p.ground=true;step(.01)');ok("art.action==='idle'",'idle');
 run('p.y=200;p.ground=false;p.vy=-200;step(.01)');ok("art.action==='jump'&&artFrame()>=2&&artFrame()<=3",'jump rise');run('p.vy=400;step(.01)');ok('artFrame()>=6','jump fall');
 run('p.y=315;p.vy=200;p.ground=false;step(.02)');ok("art.action==='land'",'landing');run('damage()');ok("art.action==='hurt'&&p.hp===2",'hurt');
 run('load(16);p.y=316;p.ground=true;dash();step(.01)');ok("art.action==='dash'",'dash');
 for(const skin of ['neo','skin-garden','skin-night'])for(const action of ['idle','run','jump','land','dash','hurt','death','celebrate']){
  run(`art.skin='${skin}';art.manual='${action}';art.time=0;artChoose();var startX=p.x;step(.07);draw();if(p.x!==startX)throw Error('manual physics moved')`);ok(`art.action==='${action}'`,'manual '+skin+action);
  const before=run('artFrame()');run("$('#frameStep').onclick()");ok(`artFrame()===${(before+1)%run('ANIM_META[art.action].frames.length')}`,'frame step '+skin+action);run('art.rate=1');
 }
 for(const action of ['jump','land','dash','hurt','death','celebrate']){run(`art.manual='${action}';artSet('${action}');art.time=ANIM_META['${action}'].duration_ms/1000*3;`);ok(`artFrame()===ANIM_META['${action}'].frames.length-1`,'oneshot holds '+action)}
 run("art.manual='auto';load(0);p.y=100;p.ground=false;artSet('jump');var stages=[];for(const v of [-445,-300,-150,-30,30,150,300,500]){p.vy=v;stages.push(artFrame());art.time+=.13}");ok('stages.every((v,i)=>!i||v>=stages[i-1])','jump phases monotonic');
 run("art.manual='run';artSet('run');var visited=new Set();for(let t=0;t<600;t+=25){art.time=t/1000;visited.add(artFrame())}");ok('visited.size===12','all 12 run phases');
 run("art.manual='auto';art.rate=1;load(0);pause(true);const px=p.x;step(1)");ok('p.x===px','pause');
 for(const [id,e] of Object.entries(run('ENEMY_META'))){for(const action of Object.keys(e.clips)){run(`enemyReview.id='${id}';enemyReview.action='${action}';enemyReview.started=art.sim;$('#enemyPanel').open=true;drawEnemyReview()`);ok(`enemyFrame('${id}','${action}',99999)<ENEMY_META['${id}'].clips['${action}'].rects.length`,'enemy frame bound '+id+action);if(!e.clips[action].loop)ok(`enemyFrame('${id}','${action}',99999)===ENEMY_META['${id}'].clips['${action}'].rects.length-1`,'enemy oneshot hold '+id+action)}}
 for(const i of [7,15,23,31,39]){
  run(`art.manual='auto';load(${i});p.x=L.boss.arena[0]+80;p.y=316;bossStep(2,350)`);ok("L.boss.phase==='tell'&&bossVisual(L.boss).action==='telegraph'",'boss telegraph '+i);
  run('bossStep(1.1,350)');ok("L.boss.phase==='attack'&&bossVisual(L.boss).action==='attack'",'boss attack '+i);
  run('var visualBefore=JSON.stringify([L.boss.hp,L.boss.x,L.boss.y,L.boss.w,L.boss.h,L.boss.timer,p.hp]);for(let j=0;j<20;j++)renderBossAnimation()');ok('visualBefore===JSON.stringify([L.boss.hp,L.boss.x,L.boss.y,L.boss.w,L.boss.h,L.boss.timer,p.hp])','renderer cannot mutate damage/collider '+i);
  run('bossStep(1.2,350)');ok("L.boss.phase==='recover'&&bossVisual(L.boss).action==='recovery'",'boss recovery '+i);
  run('p.x=L.boss.x+10;p.y=L.boss.y-30;p.vy=100;var oldHP=L.boss.hp;bossStep(.01,L.boss.y)');ok('L.boss.hp===oldHP-1','gameplay owns stomp damage '+i);
 }
 run("load(2);var victim=L.enemies[0];L.platforms=[{x:0,y:350,w:1000,h:90}];Object.assign(victim,{x:400,y:324,a:380,b:440});p.x=victim.x;p.y=victim.y-33;p.vy=100;p.ground=false;input.left=input.right=false;step(.01)");ok('victim.dead&&Number.isFinite(victim.artDefeatAt)','stomp starts enemy visual defeat');run('var beforeHP=p.hp;art.sim+=.2;mobRender(victim)');ok('p.hp===beforeHP','defeat render causes no damage');

 // New attack is an explicit gameplay event, independently of animation.
 for(const i of [7,15,23,31,39])for(const skin of ['neo','skin-garden','skin-night']){
  run(`load(${i});L.objects.forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);art.skin='${skin}';p.x=L.boss.x-100;p.y=316;p.face=1;var hp=L.boss.hp;attackBoss()`);
  ok('L.boss.hp===hp','closed armor blocks pulse '+i+skin);
  run("clock+=1;L.boss.phase='recover';L.boss.y=286;p.x=L.boss.x-500;attackBoss()");ok('L.boss.hp===hp','out of range '+i+skin);
  run('clock+=1;p.x=L.boss.x-100;p.face=-1;attackBoss()');ok('L.boss.hp===hp','wrong facing '+i+skin);
  run('clock+=1;p.face=1;p.y=20;attackBoss()');ok('L.boss.hp===hp','vertical miss '+i+skin);
  run('clock+=1;p.y=316;pause(true);attackBoss()');ok('L.boss.hp===hp','pause blocks attack '+i+skin);
  run("pause(false);art.manual='run';attackBoss()");ok('L.boss.hp===hp','preview blocks attack '+i+skin);
  run("art.manual='auto';art.dying=.5;attackBoss()");ok('L.boss.hp===hp','death blocks attack '+i+skin);
  run('art.dying=0;updateBossGuide()');ok("$('#attack').hidden===false&&!$('#attack').disabled&&canHitBoss()",'ready affordance '+i+skin);
  run("events.keydown({code:'KeyJ',repeat:false,preventDefault(){}})");ok("L.boss.hp===hp-1&&L.boss.lastHitSource==='pulse'",'J deals one damage '+i+skin);
  run("L.boss.phase='recover';$('#attack').onclick()");ok('L.boss.hp===hp-1','cooldown blocks duplicate '+i+skin);
  run("clock+=1;$('#attack').onclick()");ok('L.boss.hp===hp-2','touch button attack '+i+skin);
  run("while(!L.boss.dead){clock+=1;L.boss.phase='recover';attackBoss()}var killedHP=L.boss.hp;attackBoss();updateBossGuide();draw()");ok("L.boss.hp===0&&challengeDone&&$('#attack').disabled",'defeat gated '+i+skin);
  run('bossStep(.01,350)');ok('!won','victory beat '+i+skin);
  run('clock+=.9;bossStep(.01,350)');ok('won&&objective()','boss auto completes level '+i+skin);
  run('step(1.51)');ok("!$('#result').hidden",'results opens automatically '+i+skin);
 }
 run("load(7);p.x=L.boss.x+L.boss.w+90;p.y=316;p.face=-1;L.boss.phase='recover';L.boss.y=286;var hp=L.boss.hp;attackBoss()");ok('L.boss.hp===hp-1','left facing pulse works');
 run("load(0);updateBossGuide()");ok("!$('#attack').hidden&&$('#bossGuide').hidden",'boss health hidden and patrol attack visible in ordinary levels');

 // Environment pilot toggles never change physics or objective data.
 for(const i of [0,8,16,24,32]){
  run(`load(${i});var initialEnvironmentState=JSON.stringify(state());var initialPlayer=JSON.stringify(p);for(let n=0;n<20;n++){environmentSettings.enabled=n%2===0;environmentSettings.near=n%3===0;draw()}`);
  ok('initialEnvironmentState===JSON.stringify(state())&&initialPlayer===JSON.stringify(p)','environment rendering is pure '+i);
  run('environmentSettings.enabled=true;environmentSettings.near=true');ok('environmentPilot()','selected pilot '+i);
  run('cam=L.width-W;draw();var e=ENV_META.worlds[L.world]');ok('1536-Math.min(Math.round(cam*.18),1536-W)>=W','mid coverage '+i);ok('3072-Math.min(Math.round(cam*.1),3072-W)>=W','far coverage '+i);
  run('var spans=environmentCopyPositions(1536,1.12,-2345.6)');ok('spans[0]<=0&&spans[spans.length-1]+1536>=W&&spans.every(Number.isInteger)','negative camera wrap '+i);
  run('var spans=environmentCopyPositions(1536,1.12,3000.5)');ok('spans[0]<=0&&spans[spans.length-1]+1536>=W','fractional camera wrap '+i);
  // Identical controller traces in old/new art, walking through a tile and collider join.
  const traces=[];
  for(const enabled of [false,true]){
   run(`load(${i});environmentSettings.enabled=${enabled};L.platforms=[{x:0,y:350,w:333,h:90},{x:333,y:350,w:627,h:90}];L.movers=[];L.enemies=[];L.hazards=[];L.gates=[];L.winds=[];L.springs=[];p.x=100;p.y=316;p.ground=true;input.left=false;input.right=true;var trace=[];for(let n=0;n<300;n++){step(1/120);trace.push([p.x,p.y,p.ground]);}input.right=false`);
   ok('p.x>600&&trace.every(t=>t[1]===316&&t[2])','controller crosses material/collider seams '+i+enabled);traces.push(run('JSON.stringify(trace)'));
  }
  ok(JSON.stringify(traces[0])===JSON.stringify(traces[1]),'old/new controller identical '+i);
 }
 for(let i=0;i<40;i++){run(`load(${i});environmentSettings.enabled=true`);ok(`environmentPilot()===true`,'all campaign maps '+i)}
 run("$('#pilot4').onclick()");ok('idx===32','pilot button');run("$('#compareEnvironment').onclick()");ok('!environmentPilot()','comparison toggle');run("$('#compareEnvironment').onclick();$('#nearEnvironment').onclick()");ok('environmentPilot()&&!environmentSettings.near','near toggle');

 // Story ownership and all new phase-specific visuals.
 ok('Object.keys(STORY_SCENES).length===12','12 canonical scenes');ok('Object.keys(ENCOUNTER_IMAGES).length===5','five encounter atlases');
 for(const id of Object.keys(run('STORY_SCENES'))){
  run(`load(7);openStory('${id}','replay');var sceneClock=clock,sceneX=p.x,sceneHP=p.hp;step(.2);damage();die();dash();attackBoss();interact();draw()`);
  ok('narrative.active&&clock===sceneClock&&p.x===sceneX&&p.hp===sceneHP&&art.dying===0','modal freezes gameplay '+id);
  run("while(narrative.active)storyNext()");ok('!won&&!narrative.active','replay does not finish '+id);
 }
 run("globalThis.__NEON_QA_NO_AUTOSTORY__=false;narrative.seen.clear();load(0)");ok("narrative.active&&narrative.scene==='arrival1'",'auto intro');run('closeStory();load(0)');ok('!narrative.active','retry skips seen intro');
 run("L.objects.filter(o=>o.kind==='mission').forEach(o=>o.done=true);checkRescueStory()");ok("narrative.scene==='pip-rescue'",'Pip rescue trigger');run('closeStory()');
 run("load(2);L.objects.filter(o=>o.kind==='mission').forEach(o=>o.done=true);checkRescueStory()");ok("narrative.scene==='engineer-rescue'",'engineer trigger');run('closeStory()');
 for(const i of [7,15,23,31,39]){
  run(`load(${i});L.objects.forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);L.boss.dead=true;L.boss.hp=0;finish()`);ok(`narrative.active&&narrative.scene==='boss${Math.floor(i/8)+1}'&&!won`,'outro precedes result '+i);
  run('closeStory()');ok('won&&L.boss.storyDone','skip resolves boss victory '+i);if(i===39)ok('narrative.repaired','skip still repairs source');
 }
 run("load(39);L.objects.forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);L.boss.dead=true;L.boss.hp=0;narrative.repaired=false;finish();while(narrative.active)storyNext()");ok('won&&narrative.repaired','full ending repairs and finishes');
 run("load(39);L.objects.forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);L.boss.dead=true;finish();load(8)");ok('idx===8&&!won&&!L.boss','level change cancels old callback');run('closeStory()');ok('!won','old callback cannot win new level');
 run("globalThis.__NEON_QA_NO_AUTOSTORY__=true;load(7);narrative.repaired=false;openStory('boss5','replay');closeStory()");ok('!won&&!narrative.repaired&&!L.boss.storyDone','journal replay has zero progress side effects');
 function pointer(id,type,pointerId){const el=els.get('#'+id);for(const fn of el.handlers[type]||[])fn({pointerId,preventDefault(){}})}
 for(const release of ['pointerup','pointercancel','lostpointercapture']){
  run('load(16);p.y=316;p.ground=true');pointer('right','pointerdown',1);pointer('jump','pointerdown',2);ok('input.right&&input.jump&&touch.right.size===1&&touch.jump.size===1','multi touch active '+release);run('step(.05)');ok('p.vx>0&&p.vy<0','move plus jump '+release);pointer('right',release,1);pointer('jump',release,2);ok('!input.right&&!input.jump','multi touch released '+release);
 }
 run('load(16)');pointer('right','pointerdown',4);run("openStory('arrival3')");ok('!input.right&&touch.right.size===0','modal clears held touch');pointer('jump','pointerdown',9);ok('!input.jump','touch blocked by story');run('closeStory()');pointer('jump','pointerup',9);ok('!input.jump&&buffer===0','closing story cannot jump stale press');
 pointer('right','pointerdown',5);run('events.orientationchange()');ok('paused&&!input.right&&touch.right.size===0','orientation clears and pauses');run('pause(false)');pointer('right','pointerdown',6);run('events.blur()');ok('paused&&!input.right','blur clears touch');
 for(const i of [7,15,23,31,39])for(const phase of ['tell','attack','recover']){
  run(`load(${i});L.boss.phase='${phase}';L.boss.timer=.4;var damageState=JSON.stringify([p.hp,L.boss.hp,L.boss.x,L.boss.timer,L.boss.phase,L.boss.projectiles]);for(let n=0;n<10;n++){drawEncounterProps();drawEncounterTelegraph();drawEncounterBodyFX()}`);
  ok('damageState===JSON.stringify([p.hp,L.boss.hp,L.boss.x,L.boss.timer,L.boss.phase,L.boss.projectiles])','VFX never damages or advances phase '+i+phase);
 }
 run("load(31);L.boss.phase='tell';L.boss.targetX=700;experience.reduced=true;drawEncounterTelegraph();var fxHP=L.boss.hp;$('#lowFx').onclick()");ok('!experience.reduced&&L.boss.hp===fxHP','FX mode is presentation only');

 run("load(0);$('#levelsMenu').onclick();var menuX=p.x;step(1)");ok("globalThis.neonMenuOpen&&!$('#campaignHome').hidden&&p.x===menuX",'campaign menu freezes play');run("$('#closeCampaign').onclick()");ok("!globalThis.neonMenuOpen&&$('#campaignHome').hidden",'menu closes');run("openCampaign();$('#homeSkin').value='skin-night';playCampaign(24)");ok("idx===24&&!globalThis.neonMenuOpen&&art.skin==='skin-night'&&!paused",'world selection loads selected skin');
 for(let i=0;i<40;i++){run(`load(${i});environmentSettings.enabled=true;cam=L.width-W;draw();var layerCoverage=ENV_META.worlds[L.world].layers.filter(l=>l.id!=='near').every(l=>{const width=ENV_IMAGES[L.world+'-'+l.id].width*l.scale;return width-Math.min(Math.round(cam*l.factor),Math.max(0,width-W))>=W})`);ok('layerCoverage','all campaign background coverage '+i)}

 run("load(39);globalThis.__NEON_QA_NO_AUTOSTORY__=false;L.objects.forEach(o=>o.done=true);L.tokens.forEach(o=>o.taken=true);L.boss.dead=true;finish();closeStory();var afterEnding=JSON.stringify(best);closeStory();finish()");ok('afterEnding===JSON.stringify(best)&&won','ending resolves only once');

 // Game-style navigation, keyboard ownership and progressive comic pages.
 run("load(16);openCampaign(false,'journey');var frozenX=p.x,frozenClock=clock;events.keydown({code:'ArrowRight',repeat:false,preventDefault(){}});events.keydown({code:'KeyR',repeat:false,preventDefault(){}});step(.2)");ok('idx===16&&p.x===frozenX&&clock===frozenClock&&!input.right','menu owns keyboard');
 run("menuWorld=5;menuStage=39;renderJourney();selectStage(39);$('#launchStage').onclick()");ok('idx===39&&!globalThis.neonMenuOpen','route deploys selected boss stage');
 run("showPauseMenu();var pauseX=p.x;events.keydown({code:'KeyR',repeat:false,preventDefault(){}});step(.5)");ok("!$('#pauseOverlay').hidden&&paused&&p.x===pauseX",'pause panel owns retry input');run("events.keydown({code:'Escape',repeat:false,preventDefault(){}})");ok("$('#pauseOverlay').hidden&&!paused&&!input.right",'escape resumes cleanly');
 run("globalThis.__NEON_QA_NO_AUTOSTORY__=true;load(0);openStory('pip-rescue','replay');var storyX=p.x,storyClock=clock;experience.reduced=false;resetComicBeat();events.keydown({code:'Space',repeat:false,preventDefault(){}})");ok('narrative.page===0&&comic.full&&p.x===storyX&&clock===storyClock&&!input.jump','first advance reveals current speech only');
 run("events.keydown({code:'Space',repeat:false,preventDefault(){}})");ok("narrative.page===1&&$('#comicText0').textContent===STORY_SCENES['pip-rescue'].pages[0].text&&$('#comicText2').textContent==='';",'previous panel remains and future speech hidden');
 run("step(.4)");ok("comic.revealed>0&&!comic.full&&clock===storyClock",'story text reveals while gameplay frozen');run("closeStory();openStory('boss5','replay');experience.reduced=true;renderStoryText();var sheetBefore=comicScenePage();storyNext();storyNext();storyNext()");ok('comicScenePage()===sheetBefore+1&&comic.full','fourth beat turns to next comic page');run('closeStory();experience.reduced=false');
 run("openCampaign(false,'wardrobe');openJournal();step(.1);events.keydown({code:'Escape',repeat:false,preventDefault(){}})");ok("!narrative.active&&globalThis.neonMenuOpen&&!$('#campaignHome').hidden",'journal returns to menu without leaking input');run('hideCampaign()');

 // V-pad owns one pointer; horizontal deadzone, reversal, cancellation and multi-touch jump.
 function pad(type,x,id=20){for(const fn of els.get('#vpad').handlers[type]||[])fn({pointerId:id,clientX:x,preventDefault(){}})}
 run("globalThis.__NEON_QA_NO_AUTOSTORY__=true;globalThis.neonMenuOpen=false;closeStory();load(16);$('#vpad').getBoundingClientRect=()=>({left:0,width:120});p.y=316;p.ground=true");
 pad('pointerdown',115);ok('input.right&&!input.left&&virtualPad.pointer===20','pad drag right');
 pointer('jump','pointerdown',21);ok('input.right&&input.jump&&buffer>0','pad and jump held together');pointer('jump','pointerup',21);
 pad('pointermove',5);ok('input.left&&!input.right','pad reverses without lift');pad('pointermove',65);ok('!input.left&&!input.right','pad center deadzone');
 pad('pointermove',115,22);ok('!input.right&&virtualPad.pointer===20','other finger cannot steal pad');pad('pointermove',115);pad('pointercancel',115);ok('!input.left&&!input.right&&virtualPad.pointer===null','cancel releases pad');
 pad('pointerdown',5);run('showPauseMenu()');ok('virtualPad.pointer===null&&!input.left&&touch.left.size===0','pause resets active pad');pad('pointerdown',115);ok('virtualPad.pointer===null&&!input.right','paused input blocked');run('closePauseMenu()');
 pad('pointerdown',115);run("openStory('arrival3','replay')");ok('virtualPad.pointer===null&&!input.right','story resets active pad');run('closeStory()');pad('pointerdown',5);pad('lostpointercapture',5);ok('virtualPad.pointer===null&&!input.left','lost capture releases pad');
 run("load(7);p.x=L.boss.x-100;p.y=316;p.face=1;L.boss.phase='recover';L.boss.y=286;updateBossGuide();var pointerHP=L.boss.hp");pointer('attack','pointerdown',30);ok('L.boss.hp===pointerHP-1','icon attack fires on pointerdown');pointer('attack','pointerup',30);run("$('#attack').onclick({detail:1})");ok('L.boss.hp===pointerHP-1','synthetic click cannot duplicate attack');
 run("load(0);draw()");ok("$('#dash').hidden&&!$('#attack').hidden",'unavailable actions hidden');run("load(16);updateExperienceUI()");ok("!$('#dash').hidden",'dash icon appears when unlocked');

 // Results stay in the game; scores/stars animate without granting twice.
 run("globalThis.neonMenuOpen=false;load(0);L.memories.forEach(c=>c.taken=true);L.objects.forEach(o=>o.done=true);L.coins.forEach(c=>c.taken=true);if(L.enemies[0])L.enemies[0].dead=true;elapsed=74;finish();var awardedScore=resultState.score;step(1.4)");ok("$('#result').hidden&&awardedScore>1000",'victory precedes popup');run('step(.11)');ok("!$('#result').hidden&&resultState.started&&resultState.time<1.35",'popup starts score count');run("for(let j=0;j<20;j++)tickResults(.1)");ok("$('#resultScore').textContent===awardedScore.toLocaleString('vi-VN')&&$('#resultStar2').attributes['data-earned']==='true'",'three stars and score finish counting');run('var previousScores=JSON.stringify(bestScores);finish()');ok('previousScores===JSON.stringify(bestScores)','repeat finish cannot grant score again');run("$('#resultHome').onclick()");ok("globalThis.neonMenuOpen&&$('#result').hidden",'result home enters title menu');run('playCampaign(0)');ok("!won&&$('#result').hidden&&!input.right",'next run clears result');
 // Each later checkpoint updates the respawn location and snapshot.
 for(let i=0;i<40;i++){run(`load(${i});L.enemies=[];L.hazards=[];L.gates=[];L.movers=[];L.winds=[];var marks=[...L.checkpoints];for(const mark of marks){p.x=mark+5;p.y=316;p.ground=true;step(1/120);if(savedCheckpointX!==mark)throw Error('checkpoint missed '+mark);die();step(.91);if(p.x!==mark+30)throw Error('wrong respawn '+mark)}`);ok('checkpoint','extended checkpoint restore '+i)}
 for(const [width,height] of [[915,412],[740,330],[360,230],[412,280]]){run(`load(0);$('#game').getBoundingClientRect=()=>({width:${width},height:${height}});var playerBeforeResize=JSON.stringify(p);resizeGameViewport()`);ok(`canvas.width===W&&canvas.height===420&&Math.abs(W/420-${width}/${height})<.003&&JSON.stringify(p)===playerBeforeResize`,'viewport fills without moving player '+width+'x'+height)}
 run("$('#game').getBoundingClientRect=()=>({width:960,height:420});resizeGameViewport()");
 for(let i=0;i<40;i++){run(`load(${i});var validPatrols=L.enemies.every(e=>L.platforms.some(s=>Math.abs(s.y-e.y-e.h)<2&&s.x<=e.a&&s.x+s.w>=e.b+e.w));`);ok('validPatrols','patrols remain supported '+i)}

 // Circuit contracts: targets own their connected bridge/gate/vent, including death rollback.
 for(let i=0;i<40;i++){
  run(`load(${i});var refs=L.gates.map(g=>g.requires).concat(L.platforms.map(s=>s.enabledBy).filter(Boolean));`);
  ok('refs.every(id=>routeItem(id))&&L.memories.length===3','all mechanism links resolve '+i);
  run('finish()');ok('!won','unfinished route cannot award completion '+i);
 }
 run("load(3);var bridge=L.platforms.find(s=>s.enabledBy);var consoleObject=routeItem(bridge.enabledBy);snapshot=state()");ok('!routePlatformActive(bridge)','unpowered bridge has no collision');
 run('cargo=true;p.x=consoleObject.x;p.y=consoleObject.y;interact()');ok('routePlatformActive(bridge)&&L.gates.filter(g=>g.requires===consoleObject.id).every(gateOpen)','console powers bridge and matching gate');
 run('restore(snapshot)');ok('!routePlatformActive(bridge)','death before saved power restores bridge off');
 run('routeItem(bridge.enabledBy).done=true;snapshot=state();routeItem(bridge.enabledBy).done=false;restore(snapshot)');ok('routePlatformActive(bridge)','saved power survives checkpoint restore');
 run("load(24);var ventHazard=L.hazards[0];clock=4-ventHazard.phase;p.x=ventHazard.x;p.y=ventHazard.y+18;p.inv=0;var ventHP=p.hp;step(.01)");ok('p.hp===ventHP-1','raised vent damages at its real height');
 run('routeItem(ventHazard.disabledBy).done=true');ok("vent(ventHazard)==='CHỜ'",'pressure valve disables linked vent');
 run("load(2);var guard=L.enemies[0];Object.assign(guard,{x:200,y:324,a:180,b:230});p.x=135;p.y=316;p.face=1;var attackClock=clock;attackBoss()");ok('guard.dead','pulse can defeat patrol from safe approach');
 run('var pulseBefore=combat.pulse;attackBoss()');ok('combat.pulse===pulseBefore','patrol attack respects cooldown');
 run("load(2);guard=L.enemies[0];Object.assign(guard,{x:200,y:324,a:180,b:230});p.x=135;p.y=316;p.face=-1;attackBoss()");ok('!guard.dead','patrol attack respects facing');
 run('clock+=1;p.face=1;L.platforms.push({x:p.x+35,y:p.y-20,w:10,h:100});attackBoss()');ok('!guard.dead','pulse cannot attack through solid wall');
 run('var beforeRouteRender=JSON.stringify(state());drawRouteLinks();updateRouteCue()');ok('beforeRouteRender===JSON.stringify(state())','route guidance does not grant progress');

 for(const index of [0,8,16,24,32]){run(`load(${index});cam=0;for(const h of [18,90,250,360])drawEnvironmentTerrain({x:0,y:420-h,w:500,h})`);ok('true','terrain source bounds at all column heights '+index)}
 // v0.14 progression and mission contracts.
 for(let i=0;i<40;i++){
  run(`load(${i})`);ok(`L.width===3600+${i}*260&&L.enemies.length===${i}+2`,'strict campaign length/enemy progression '+i);
  ok("L.missionMode!=='purge'||L.objects.some(o=>o.guardIds?.length>0)",'purge has real guards '+i);
  ok('new Set(L.enemies.map(e=>e.species)).size===L.enemyTypes.length','enemy roster actually placed '+i);
 }
 run("load(5);var scanner=L.objects[0];p.x=scanner.x;p.y=scanner.y;interact()");ok('!scanner.done&&scanner.scanUntil>clock','survey starts timed scan');
 run('clock+=1.3;routeStep()');ok('scanner.done','scan completes while nearby');
 run("load(5);scanner=L.objects[0];p.x=scanner.x;p.y=scanner.y;interact();p.x+=150;clock+=.5;routeStep()");ok('!scanner.done&&!scanner.scanUntil','leaving scan cancels progress');
 run("load(4);var locked=L.objects[0];locked.guardIds=[L.enemies[0].id];p.x=locked.x;p.y=locked.y;interact()");ok('!locked.done','living guard blocks purge interaction');
 run('L.enemies[0].dead=true;interact()');ok('locked.done','defeated guard unlocks purge interaction');
 const result={status:'pass',assertions:passed,draw_calls:draws,levels:40,skins:3,actions_per_skin:8,enemy_entities:10,boss_phases:3,environment_levels:40,narrative_scenes:12,encounter_atlases:5,mobile_pointer_checks:true,comic_panels_per_page:3,comic_sheets:13,menu_keyboard_ownership:true,vpad_checks:true,immersive_results:true,extended_levels:40,notes:'Node VM DOM/canvas simulation; not actual browser visual QA. Boss pulse tested on all five bosses and three skins; keyboard, touch, range, armor, cooldown, guards and automatic victory.'};console.log(JSON.stringify(result));fs.writeFileSync(path.resolve('test-results/neon-gameplay-qa.json'),JSON.stringify(result,null,2));
});
