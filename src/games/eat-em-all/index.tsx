import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import type { ActivePowerUps, ElementMode, FallingItem, GameMode, ItemType, PowerUpType } from './types';
import { CAMPAIGN_STAGES, CHAPTERS } from './campaign';
import { bossPhase, stageComplete, retryHint } from './encounters';
import { getComboTier } from './config';
import { EatEmAllCanvas } from './EatEmAllCanvas';
import { eatAudio } from './audio';
import './journey.css';
import {Art} from './ArtIcon';
import {VictoryResult} from './VictoryResult';
import {CELEBRATION_SECONDS} from './victory';
import {REGION_GLYPHS, worldUrl} from './art';
import {AURAS, clearReward, normalizeEconomy, purchaseAura, recordEconomyEvent, starWallet, totalStars} from './economy';
import type {EconomySave, AuraId} from './economy';

const SAVE_KEY = 'arcadex_eat_journey_v2';
type Charm = 'shelter' | 'spark' | 'rhythm';
type Save = { unlocked: number; stars: Record<number, number>; charm: Charm; economy:EconomySave };
function readSave(): Save {
  try {
    const raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
    const legacy=Number(localStorage.getItem('arcadex_eat_em_all_unlocked_stage'))||1;
    const stars=Object.fromEntries(Array.from({length:24},(_,i)=>[i+1,Math.max(0,Math.min(3,Math.floor(Number(raw?.stars?.[i+1])||0)))]));
    return {unlocked:Math.min(24,Math.max(1,Math.floor(Number(raw?.unlocked)||legacy))),stars,charm:['shelter','spark','rhythm'].includes(raw?.charm)?raw.charm:'shelter',economy:normalizeEconomy(raw?.economy,stars)};
  }catch{return {unlocked:1,stars:{},charm:'shelter',economy:normalizeEconomy(null,{})};}
}
const blankPowers = (): ActivePowerUps => ({ shield: false, shieldHits: 0, magnetTimer: 0, speedTimer: 0, slowmoTimer: 0 });

interface Run {
  mode: GameMode; stageId: number; element: ElementMode; score: number; lives: number; elapsed: number;
  counts: Partial<Record<ItemType,number>>; combo: number; maxCombo: number; comboUntil: number;
  energy: number; furyUntil: number; furyCount: number; bossHits: number; invulnerableUntil: number;
  powers: ActivePowerUps; eaten: number; hits: number; status: 'playing'|'celebrating'|'won'|'lost';
  celebrationTime:number;
  reward:{coins:number;xp:number;earnedStars:number};
  message: string; messageUntil: number; charm: Charm;
}
function freshRun(stageId: number, mode: GameMode, charm: Charm): Run {
  return { mode, stageId, element:'ice', score:0, lives:3, elapsed:0, counts:{}, combo:0, maxCombo:0, comboUntil:0, energy:0, furyUntil:0, furyCount:0, bossHits:0, invulnerableUntil:0, powers:{ ...blankPowers(), shield:charm==='shelter', shieldHits:charm==='shelter'?1:0 }, eaten:0, hits:0, status:'playing',celebrationTime:0,reward:{coins:0,xp:0,earnedStars:0}, message:'', messageUntil:0, charm };
}
const CHARMS: {id:Charm;name:string;description:string;unlock:number}[] = [
  {id:'shelter',name:'Vỏ ấm',description:'Bắt đầu với một khiên; hợp khi khám phá màn mới.',unlock:1},
  {id:'spark',name:'Tàn lửa',description:'Nạp Fury nhanh hơn 25%; đổi lấy việc không có khiên đầu màn.',unlock:7},
  {id:'rhythm',name:'Nhịp rừng',description:'Giữ combo 5 giây thay vì 3,5 giây; hợp săn điểm.',unlock:13},
];

export const EatEmAllGame: React.FC<GameComponentProps> = ({ bridge, isPaused, isMuted, onGameOver, isPracticeMode }) => {
  const [save,setSave] = useState<Save>(readSave);
  const [selected,setSelected] = useState(() => readSave().unlocked);
  const [chapterId,setChapterId] = useState(() => CAMPAIGN_STAGES[readSave().unlocked-1].chapter);
  const [mode,setMode] = useState<GameMode>('target');
  const [screen,setScreen] = useState<'map'|'run'>('map');
  const [showShop,setShowShop]=useState(false);
  const [showInfo,setShowInfo]=useState(false);
  const [shopNotice,setShopNotice]=useState('');
  const [showArt,setShowArt] = useState(false);
  const [paused,setPaused] = useState(false);
  const [attempt,setAttempt] = useState(0);
  const [,redraw] = useState(0);
  const runRef = useRef<Run>(freshRun(selected,mode,save.charm));
  const latest = useRef({ bridge, onGameOver, isPracticeMode });
  latest.current = { bridge,onGameOver,isPracticeMode };
  const r = runRef.current;
  const stage = CAMPAIGN_STAGES[r.stageId-1];
  const choice = CAMPAIGN_STAGES[selected-1];
  const chapter = CHAPTERS.find(c=>c.id===chapterId)!;
  const force = useCallback(() => redraw(n=>n+1),[]);
  const persist = useCallback((next:Save) => { setSave(next); try { localStorage.setItem(SAVE_KEY,JSON.stringify(next)); } catch { /* Play remains available when storage is full. */ } },[]);
  const saveRef=useRef(save); saveRef.current=save;
  const rewardGuard=useRef(false);
  useEffect(()=>{ eatAudio.setMuted(isMuted); },[isMuted]);

  const finish = useCallback((won:boolean) => {
    const run=runRef.current;
    if(run.status!=='playing') return;
    run.status=won?'celebrating':'lost';run.celebrationTime=0;
    const s=CAMPAIGN_STAGES[run.stageId-1];
    if(won && run.mode==='target') {
      eatAudio.playWin();
      // Three independent stars: completion, damage discipline, rhythm mastery.
      const stars=1+Number(run.hits<=1)+Number(run.maxCombo>=Math.min(12,Math.ceil(s.targetCount/2)));
      if(!latest.current.isPracticeMode) {
        const prior=saveRef.current;
        const previous=prior.stars[s.id]||0;
        const reward=clearReward(s.id,previous,stars,prior.economy);
        run.reward=reward;
        const next={...prior,unlocked:Math.min(24,Math.max(prior.unlocked,s.id+1)),stars:{...prior.stars,[s.id]:Math.max(previous,stars)},economy:{...prior.economy,coinsGranted:prior.economy.coinsGranted+reward.coins,xpGranted:prior.economy.xpGranted+reward.xp}};
        saveRef.current=next;persist(next);
        if(!rewardGuard.current){
          rewardGuard.current=true;
          if(reward.coins)latest.current.bridge.grantCoins(reward.coins);
          if(reward.xp)latest.current.bridge.grantExp(reward.xp);
          recordEconomyEvent(previous?'mastery':'first_clear',{stage:s.id,coins:reward.coins,xp:reward.xp,stars:reward.earnedStars,wallet:starWallet(next.stars,next.economy.ownedAuras)});
          if(!previous&&s.id===5)latest.current.bridge.reportProgress('ach-eat-target-stage-5',5,true);
        }
      }
    } else if(!won) eatAudio.playHurt();
    if(run.mode==='endless') latest.current.bridge.reportProgress('ach-eat-endless-1500',run.score,true);
    force();
  },[force,persist]);

  const start = (stageId=selected, nextMode=mode) => {
    const id=Math.max(1,Math.min(24,stageId));
    runRef.current=freshRun(id,nextMode,save.charm);
    runRef.current.message=CAMPAIGN_STAGES[id-1].subtitle;runRef.current.messageUntil=2.8;
    setSelected(id);setChapterId(CAMPAIGN_STAGES[id-1].chapter);setShowInfo(false);
    rewardGuard.current=false;setPaused(false);setAttempt(n=>n+1);setScreen('run');force();
  };
  const switchMode=useCallback(()=>{
    const run=runRef.current;if(run.status!=='playing')return;
    run.element=run.element==='ice'?'fire':'ice';force();
  },[force]);
  const activateFury=useCallback(()=>{
    const run=runRef.current;if(run.status!=='playing'||run.energy<100||run.furyUntil>run.elapsed)return;
    run.energy=0;run.furyUntil=run.elapsed+5;run.furyCount++;
    eatAudio.playFuryStart();latest.current.bridge.reportProgress('ach-eat-fury-master',1);force();
  },[force]);
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(e.code==='KeyF'&&!e.repeat&&!isPaused&&!paused){e.preventDefault();activateFury();}};
    window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
  },[activateFury,isPaused,paused]);

  const eat=useCallback((item:FallingItem)=>{
    const run=runRef.current;if(run.status!=='playing')return;
    const s=CAMPAIGN_STAGES[run.stageId-1];
    const fury=run.furyUntil>run.elapsed;
    run.eaten++;run.counts[item.type]=(run.counts[item.type]||0)+1;
    run.combo++;run.maxCombo=Math.max(run.combo,run.maxCombo);run.comboUntil=run.elapsed+(run.charm==='rhythm'?5:3.5);
    const base=item.type==='gem'?100:item.type==='star'?50:20;
    run.score+=base*(fury?5:getComboTier(run.combo).multiplier);
    if(!fury)run.energy=Math.min(100,run.energy+(item.type==='fury_pill'?25:6)*(run.charm==='spark'?1.25:1));
    if(item.type==='heart')run.lives=Math.min(3,run.lives+1);
    if(run.mode==='target'&&s.objective==='boss') {
      const phase=bossPhase(run.elapsed,s.chapter);
      if(phase.vulnerable && item.type===phase.element) {
        run.bossHits++;run.message='Lõi cộng hưởng! −1 giáp';run.messageUntil=run.elapsed+1;
      }
    }
    if(run.combo===15)latest.current.bridge.reportProgress('ach-eat-combo-master',15,true);
    latest.current.bridge.reportProgress('ach-eat-first-game',1);
    if(run.mode==='target'&&stageComplete(s,run.counts,run.bossHits))finish(true);
    force();
  },[force,finish]);
  const hurt=useCallback(()=>{
    const run=runRef.current;if(run.status!=='playing'||run.elapsed<run.invulnerableUntil)return;
    run.invulnerableUntil=run.elapsed+1.25;run.combo=0;run.hits++;
    run.message='Đổi hệ đúng màu • Né đường bom';run.messageUntil=run.elapsed+2;
    if(run.mode==='time')run.score=Math.max(0,run.score-100);
    else {run.lives--;if(run.lives<=0)finish(false);}
    force();
  },[finish,force]);
  const collect=useCallback((type:PowerUpType)=>{
    const run=runRef.current;if(run.status!=='playing')return;
    if(type==='shield'){run.powers.shield=true;run.powers.shieldHits=1;}
    if(type==='magnet')run.powers.magnetTimer=6;
    if(type==='speed')run.powers.speedTimer=6;
    if(type==='slowmo')run.powers.slowmoTimer=5;
    latest.current.bridge.reportProgress('ach-eat-powerup-collector',1);force();
  },[force]);
  const consume=useCallback(()=>{runRef.current.powers.shield=false;runRef.current.powers.shieldHits=0;force();},[force]);

  useEffect(()=>{
    if(screen!=='run'||paused||isPaused||r.status!=='playing')return;
    let last=performance.now();
    const timer=window.setInterval(()=>{
      const run=runRef.current;if(run.status!=='playing')return;
      const now=performance.now();const dt=Math.min(.2,(now-last)/1000);last=now;
      if(document.hidden)return;
      run.elapsed+=dt;
      if(run.elapsed>run.comboUntil)run.combo=0;
      run.powers={...run.powers,magnetTimer:Math.max(0,run.powers.magnetTimer-dt),speedTimer:Math.max(0,run.powers.speedTimer-dt),slowmoTimer:Math.max(0,run.powers.slowmoTimer-dt)};
      const s=CAMPAIGN_STAGES[run.stageId-1];
      if(run.mode==='target'&&run.elapsed>=s.timeLimit)finish(false);
      if(run.mode==='time'&&run.elapsed>=60)finish(true);
      force();
    },100);
    return()=>clearInterval(timer);
  },[screen,paused,isPaused,r.status,finish,force]);
  useEffect(()=>{
    if(screen!=='run'||r.status!=='celebrating'||paused||isPaused)return;
    let last=performance.now();
    const timer=window.setInterval(()=>{
      const run=runRef.current;if(run.status!=='celebrating')return;
      const now=performance.now();const dt=Math.min(.1,(now-last)/1000);last=now;
      if(document.hidden)return;
      run.celebrationTime=Math.min(CELEBRATION_SECONDS,run.celebrationTime+dt);
      if(run.celebrationTime>=CELEBRATION_SECONDS-1e-8)run.status='won';
      force();
    },32);
    return()=>window.clearInterval(timer);
  },[screen,r.status,paused,isPaused,force]);
  // Do not submit campaign clears as game-over: the launcher would unmount the story result.
  const exit = () => {const run=runRef.current;latest.current.onGameOver(run.score,{itemsEaten:run.eaten,maxCombo:run.maxCombo,furyActivated:run.furyCount});};
  const backToMap=()=>{const id=r.status==='won'&&r.mode==='target'?Math.min(24,r.stageId+1):r.stageId;setScreen('map');setSelected(id);setChapterId(CAMPAIGN_STAGES[id-1].chapter);};
  const buyAura=(id:AuraId)=>{const prior=saveRef.current;const next=purchaseAura(prior.stars,prior.economy,id);if(next){const updated={...prior,economy:next};saveRef.current=updated;persist(updated);recordEconomyEvent(prior.economy.ownedAuras.includes(id)?'equip':'purchase',{aura:id,starsSpent:prior.economy.ownedAuras.includes(id)?0:AURAS.find(a=>a.id===id)!.cost,wallet:starWallet(prior.stars,next.ownedAuras)});setShopNotice('Đã trang bị');}else setShopNotice('Cần thêm sao');};
  const fury=r.furyUntil>r.elapsed;
  const remaining=Object.fromEntries(Object.entries(stage.targetItems).map(([k,n])=>[k,Math.max(0,(n||0)-(r.counts[k as ItemType]||0))]));
  const phase=bossPhase(r.elapsed,stage.chapter);

  return <div className="eat-journey" data-testid="eat-journey" data-chapter={screen==='map'?chapterId:stage.chapter} style={{'--eat-world':`url("${worldUrl}")`} as React.CSSProperties}>
    {screen==='map'?<div className="eat-lobby">
      <header className="eat-lobby-top"><div className="eat-brand"><Art name="void" size={25}/><span>EAT EM ALL</span></div><div className="eat-lobby-tools"><button className="eat-wallet" aria-label="Cửa hàng hào quang" title="Cửa hàng hào quang" onClick={()=>{setShowShop(true);setShopNotice('');}}><Art name="star" size={25}/><b>{starWallet(save.stars,save.economy.ownedAuras)}</b><span>+</span></button><button className="eat-icon-btn" aria-label="Sổ linh thú" title="Sổ linh thú" onClick={()=>setShowArt(true)}><Art name="book" size={25}/></button></div></header>
      <div className="eat-lobby-hero"><div className="eat-lobby-logo">TRÁI TIM<em>HAI NGUYÊN TỐ</em></div><div className="eat-lobby-mascot"><Art name="nom-dual-idle" size={150}/>{save.economy.equippedAura&&<Art className="eat-equipped-aura" name={AURAS.find(a=>a.id===save.economy.equippedAura)!.icon} size={34}/>}</div></div>
      <nav className="eat-modes" aria-label="Chế độ">{([['target','Câu chuyện','map'],['endless','Sinh tồn','infinity'],['time','60 giây','clock']] as const).map(([id,label,icon])=><button key={id} aria-label={label} title={label} aria-pressed={mode===id} onClick={()=>setMode(id)}><Art name={icon} size={25}/>{mode===id&&<span>{label}</span>}</button>)}</nav>
      {mode==='target'?<>
        <nav className="eat-worlds" aria-label="Chương">{CHAPTERS.map(c=><button key={c.id} aria-label={`Chương ${c.id}: ${c.title}`} title={c.title} aria-pressed={chapterId===c.id} disabled={save.unlocked<c.startStage} onClick={()=>{setChapterId(c.id);setSelected(Math.min(save.unlocked,c.startStage));}}><Art name={save.unlocked<c.startStage?'lock':REGION_GLYPHS[c.id-1]} size={35}/><span>{c.id}</span></button>)}</nav>
        <div className="eat-lobby-region"><h2>{chapter.title}</h2><button className="eat-icon-btn small" aria-label="Câu chuyện và hướng dẫn" title="Câu chuyện và hướng dẫn" onClick={()=>setShowInfo(true)}><Art name="book" size={20}/></button></div>
        <div className="eat-map eat-quick-map" aria-label="Bản đồ màn chơi"><div className="eat-map-scenery"/><svg className="eat-map-trail" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true"><path d="M75 72Q170 15 300 72T525 72Q580 190 300 170T75 170"/></svg>{CAMPAIGN_STAGES.filter(s=>s.chapter===chapterId).map(s=><button key={s.id} className={`eat-node ${s.objective==='boss'?'boss-node':''}`} disabled={s.id>save.unlocked} aria-label={`Chơi màn ${s.id}: ${s.title}`} title={s.title} aria-pressed={selected===s.id} onClick={()=>start(s.id,'target')}><div className="eat-node-medal">{s.id>save.unlocked?<Art name="lock" size={27}/>:s.objective==='boss'?<Art name={`guardian-${chapterId}-idle`} size={53}/>:s.objective==='rescue'?<Art name="gem" size={31}/>:<strong>{s.id}</strong>}</div><span className="eat-node-number">{s.objective!=='gather'?s.id:''}</span><div className="eat-node-stars">{[1,2,3].map(n=><Art name="star" key={n} size={15} className={n<=(save.stars[s.id]||0)?'':'empty'}/>)}</div></button>)}</div>
      </>:<div className="eat-arcade-tile"><Art name={mode==='endless'?'infinity':'clock'} size={95}/><b>{mode==='endless'?'Sinh tồn':'60 giây'}</b><span><Art name="heart" size={25}/>{mode==='endless'?'3':'∞'} <Art name="crown" size={25}/></span></div>}
      <div className="eat-quick-start"><button className="eat-primary" aria-label={mode==='target'?`Chơi màn ${selected}`:'Chơi ngay'} onClick={()=>start()}><Art name="play" size={26}/> CHƠI {mode==='target'&&<span className="eat-stage-badge">{selected}</span>}</button>{mode==='target'&&<div className="eat-start-goals">{Object.entries(choice.targetItems).map(([k,n])=><span key={k}><Art name={k} size={20}/>{n}</span>)}{choice.objective==='boss'&&<span><Art name="power_shield" size={20}/>{choice.bossHits}</span>}</div>}</div>
      <footer className="eat-lobby-bottom"><div className="eat-charm-icons" aria-label="Bùa đồng hành">{CHARMS.map(c=><button key={c.id} className="eat-icon-btn" title={`${c.name}: ${c.description}`} aria-label={c.name} disabled={save.unlocked<c.unlock} aria-pressed={save.charm===c.id} onClick={()=>persist({...save,charm:c.id})}><Art name={save.unlocked<c.unlock?'lock':c.id==='shelter'?'power_shield':c.id==='spark'?'fury_pill':'memory'} size={29}/></button>)}</div><span className="eat-mastery-count"><Art name="star" size={21}/>{totalStars(save.stars)}/72</span></footer>
    </div>:<>
      <header className="eat-hud"><button className="eat-secondary" style={{margin:0,padding:'6px 10px'}} aria-label="Tạm dừng" disabled={r.status!=='playing'} onClick={()=>setPaused(true)}><Art name="pause" size={24}/></button><div><small>{r.mode==='target'?`MÀN ${stage.id} · ${CHAPTERS[stage.chapter-1].title}`:'THỬ THÁCH'}</small><div><strong>{r.score.toLocaleString()}</strong> <small> {r.combo>1?`×${getComboTier(r.combo).multiplier} · ${r.combo} chuỗi`:''}</small></div></div><div style={{textAlign:'right'}}><div aria-label={`${r.lives} mạng`}>{r.mode==='time'?<Art name="clock" size={23}/>:<span className="eat-hearts">{[1,2,3].map(n=><Art key={n} name="heart" size={23} className={n<=r.lives?'':'empty'}/>)}</span>}</div><small>{Math.max(0,Math.ceil((r.mode==='target'?stage.timeLimit:r.mode==='time'?60:0)-r.elapsed)) || (r.mode==='endless'?Math.floor(r.elapsed):0)}s {r.powers.shield?<Art name="power_shield" size={17}/>:null}</small></div></header>
      <div className="eat-goalbar">{r.mode==='target'?Object.entries(stage.targetItems).map(([k,n])=><span key={k} className={(r.counts[k as ItemType]||0)>=n!?'done':''}><Art name={k} size={24}/> <b>{Math.min(n!,r.counts[k as ItemType]||0)}/{n}</b>{k==='gem'&&stage.objective==='rescue'?' linh hồn':''}</span>):<span>{r.mode==='endless'?'Sống sót • Giữ nhịp • Vượt kỷ lục':'Ăn đúng hệ • Săn chuỗi điểm'}</span>}<span className={`eat-element-label ${r.element}`}><Art name={r.element} size={22}/>{r.element==='ice'?'BĂNG':'LỬA'}</span></div>
      <div className="eat-board"><EatEmAllCanvas key={attempt} celebrating={r.status==='celebrating'} celebrationPaused={isPaused||paused} celebrationProgress={r.celebrationTime/CELEBRATION_SECONDS} playerMode={r.element} onSwitchMode={switchMode} isPaused={isPaused||paused||r.status!=='playing'} isGameOver={r.status==='won'||r.status==='lost'} isMuted={isMuted} lives={r.lives} furyActive={fury} speedMultiplier={r.mode==='target'?stage.fallSpeedMultiplier:1+Math.min(.8,r.elapsed/120)} spawnIntervalMs={r.mode==='target'?stage.spawnIntervalMs:Math.max(430,900-r.elapsed*2)} bombChance={.14} poisonChance={r.elapsed>20?.06:0} powerUpChance={.045} combo={r.combo} comboMultiplier={getComboTier(r.combo).multiplier} comboDecayRatio={Math.max(0,(r.comboUntil-r.elapsed)/(r.charm==='rhythm'?5:3.5))} activePowerUps={r.powers} currentTheme={r.mode==='target'?stage.theme:r.elapsed>60?'space':'night'} onEatItem={eat} onHitHazard={hurt} onCollectPowerUp={collect} onConsumeShield={consume} stageElapsed={r.elapsed} campaignStage={r.mode==='target'?stage:undefined} remainingTargets={remaining} auraId={save.economy.equippedAura} skinId={bridge.getEquippedSkin?.()||'default'}/>
      {r.mode==='target'&&stage.objective==='boss'&&<div className={`eat-boss ${phase.vulnerable?'open':'warning'}`}><div className="eat-boss-title">{stage.bossName} · {Math.max(0,(stage.bossHits||0)-r.bossHits)} giáp</div><div className="eat-boss-hint"><Art name={phase.element} size={20}/>{phase.switchSoon?'Sắp đổi hệ!':phase.phase==='warning'?phase.attack:phase.phase==='attack'?'Né đòn!':phase.vulnerable?'Hứng đúng hệ để phản công':'Hồi nhịp'}</div><div className="eat-bar"><i style={{width:`${Math.max(0,1-r.bossHits/(stage.bossHits||1))*100}%`}}/></div></div>}
      {r.messageUntil>r.elapsed&&<div className="eat-narrator" role="status">{r.message}</div>}
      </div>
      {r.status==='celebrating'&&<div className="eat-victory-callout" role="status"><Art name="crown" size={35}/><strong>CHIẾN THẮNG!</strong><div>{r.mode==='target'&&Object.keys(stage.targetItems).map(k=><Art name={k} key={k} size={25}/>)}</div></div>}
      <footer className="eat-controls"><button className={`eat-control element ${r.element}`} disabled={r.status!=='playing'||paused||isPaused} onClick={()=>{switchMode();eatAudio.playSwitch();}}><span className="eat-control-orb"><Art name={r.element} size={40}/></span><span><b>ĐỔI SANG {r.element==='ice'?'LỬA':'BĂNG'}</b><small>Chạm để đổi hệ · Space</small></span><Art name={r.element==='ice'?'fire':'ice'} size={24}/></button><button className={`eat-control fury ${r.energy>=100?'ready':''} ${fury?'active':''}`} disabled={r.energy<100||fury||r.status!=='playing'||paused||isPaused} onClick={activateFury}><Art name="fury_pill" size={38}/><span><b>{fury?`FURY ${Math.ceil(r.furyUntil-r.elapsed)}s`:r.energy>=100?'TUNG FURY':`FURY ${Math.floor(r.energy)}%`}</b><small>{r.energy>=100?'Sẵn sàng · F':'Ăn đúng hệ để tích năng lượng'}</small><i className="eat-energy-track"><i style={{width:`${fury?100:r.energy}%`}}/></i></span></button></footer>
      {paused&&r.status==='playing'&&<div className="eat-overlay"><section className="eat-dialog"><Art name="nom-dual-sleep" size={150}/><h2>Nghỉ một nhịp</h2><p>{stage.title}</p><button className="eat-primary" onClick={()=>setPaused(false)}>TIẾP TỤC</button><button className="eat-secondary" onClick={backToMap}>Về bản đồ</button></section></div>}
      {(r.status==='won'||r.status==='lost')&&<VictoryResult key={attempt} won={r.status==='won'} mode={r.mode} stage={stage} counts={r.counts} bossHits={r.bossHits} eaten={r.eaten} score={r.score} stars={1+Number(r.hits<=1)+Number(r.maxCombo>=Math.min(12,Math.ceil(stage.targetCount/2)))} reward={r.reward} hint={r.status==='lost'?retryHint(stage,r.counts,r.energy):undefined} paused={isPaused||paused||showInfo} onNext={()=>start(r.mode==='target'&&r.status==='won'&&stage.id<24?stage.id+1:r.stageId,r.mode)} onMap={backToMap} onStory={()=>setShowInfo(true)} onExit={exit}/>}
    </>}
    {showInfo&&<div className="eat-overlay"><section className="eat-dialog" role="dialog" aria-label="Câu chuyện và hướng dẫn"><Art name={screen==='run'&&r.status==='won'?'nom-dual-happy':'nom-dual-idle'} size={120}/><h2>{screen==='run'?stage.title:choice.title}</h2><p>{screen==='run'&&r.status==='won'?stage.resolution:(screen==='run'?stage:choice).story}</p><p>{(screen==='run'?stage:choice).description}</p><div className="eat-tutorial"><span><Art name="ice" size={30}/><Art name="fire" size={30}/><b>Hứng đúng hệ</b></span><span><Art name="bomb" size={30}/><Art name="poison" size={30}/><b>Né nguy hiểm</b></span></div><button className="eat-primary" aria-label="Đóng câu chuyện" onClick={()=>setShowInfo(false)}><Art name="check" size={24}/> ĐÃ HIỂU</button></section></div>}
    {showShop&&<div className="eat-overlay"><section className="eat-artbook eat-shop" role="dialog" aria-label="Cửa hàng hào quang"><header><div><h2>Hào quang</h2><span className="eat-shop-wallet"><Art name="star" size={25}/>{starWallet(save.stars,save.economy.ownedAuras)}</span></div><button className="eat-icon-btn" aria-label="Đóng cửa hàng" onClick={()=>setShowShop(false)}><Art name="close" size={23}/></button></header><div className="eat-artbook-content"><p className="eat-shop-note">Sao mở hào quang, không giảm sao màn chơi.</p><div className="eat-aura-grid">{AURAS.map(a=>{const owned=save.economy.ownedAuras.includes(a.id);const equipped=save.economy.equippedAura===a.id;return <button className={`eat-aura-card ${equipped?'equipped':''}`} key={a.id} aria-label={`${owned?'Trang bị':'Mua'} ${a.name}`} title={a.name} disabled={equipped||(!owned&&starWallet(save.stars,save.economy.ownedAuras)<a.cost)||isPracticeMode} onClick={()=>buyAura(a.id)}><div className="eat-aura-preview" style={{'--aura-color':a.color} as React.CSSProperties}><Art name="nom-dual-idle" size={100}/><Art name={a.icon} size={38}/></div><b>{a.name}</b><span>{equipped?<Art name="check" size={22}/>:owned?'DÙNG':<><Art name="star" size={22}/>{a.cost}</>}</span></button>;})}</div><button className="eat-secondary" disabled={!save.economy.equippedAura} onClick={()=>persist({...save,economy:{...save.economy,equippedAura:null}})}>Mặc định</button><p role="status" className="eat-shop-notice">{shopNotice}</p></div><footer><button className="eat-primary" onClick={()=>setShowShop(false)}><Art name="map" size={24}/> TRỞ VỀ</button></footer></section></div>}
    {showArt&&<div className="eat-overlay"><section className="eat-artbook" role="dialog" aria-modal="true" aria-label="Sổ linh thú"><header><div><div className="eat-eyebrow">BÁCH KHOA THẾ GIỚI</div><h2>Sổ linh thú</h2></div><button className="eat-secondary" aria-label="Đóng sổ" onClick={()=>setShowArt(false)}><Art name="close" size={23}/></button></header><div className="eat-artbook-content"><h3>Hai nguyên tố, một người bạn</h3><div className="eat-artbook-row">{(['idle','eat','hurt','fury','happy','sleep'] as const).map((pose,i)=><figure key={pose}><Art name={`nom-dual-${pose}`} size={115}/><figcaption>{['Chờ đợi','Ngon quá!','Trúng đòn','Cuồng nộ','Hân hoan','Nghỉ ngơi'][i]}</figcaption></figure>)}</div><h3>Những người giữ nhịp tim</h3><div className="eat-guardian-gallery">{CHAPTERS.map(c=><figure key={c.id}><Art name={`guardian-${c.id}-idle`} size={150}/><figcaption>{CAMPAIGN_STAGES[c.endStage-1].bossName}</figcaption></figure>)}</div><h3>Thức ăn & bảo vật</h3><div className="eat-item-gallery">{['ice','fire','star','gem','heart','bomb','poison','fury_pill','power_shield','power_magnet','power_speed','power_slowmo'].map((key,i)=><figure key={key}><Art name={key} size={52}/><figcaption>{['Tinh thể băng','Hạt lửa','Sao mật','Linh hồn sáng','Trái tim','Hạt bom','Bình độc','Năng lượng','Khiên','Nam châm','Tăng tốc','Chậm thời gian'][i]}</figcaption></figure>)}</div></div><footer><button className="eat-primary" onClick={()=>setShowArt(false)}>TRỞ VỀ HÀNH TRÌNH</button></footer></section></div>}
  </div>;
};
