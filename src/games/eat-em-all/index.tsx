import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { GameComponentProps } from '../../types';
import type { ActivePowerUps, ElementMode, FallingItem, GameMode, ItemType, PowerUpType } from './types';
import { CAMPAIGN_STAGES, CHAPTERS } from './campaign';
import { bossPhase, quotaProgress, stageComplete } from './encounters';
import { getComboTier } from './config';
import { EatEmAllCanvas } from './EatEmAllCanvas';
import { eatAudio } from './audio';
import './journey.css';
import {Art} from './ArtIcon';
import {REGION_GLYPHS, worldUrl} from './art';

const SAVE_KEY = 'arcadex_eat_journey_v2';
type Charm = 'shelter' | 'spark' | 'rhythm';
type Save = { unlocked: number; stars: Record<number, number>; charm: Charm };
function readSave(): Save {
  try {
    const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    const legacy = Number(localStorage.getItem('arcadex_eat_em_all_unlocked_stage')) || 1;
    return { unlocked: Math.min(CAMPAIGN_STAGES.length, Math.max(1, Math.floor(Number(raw?.unlocked) || legacy))), stars: Object.fromEntries(Object.entries(raw?.stars && typeof raw.stars === 'object' ? raw.stars : {}).map(([k,v])=>[k,Math.max(0,Math.min(3,Math.floor(Number(v)||0)))])), charm: ['shelter','spark','rhythm'].includes(raw?.charm) ? raw.charm : 'shelter' };
  } catch { return { unlocked: 1, stars: {}, charm: 'shelter' }; }
}
const blankPowers = (): ActivePowerUps => ({ shield: false, shieldHits: 0, magnetTimer: 0, speedTimer: 0, slowmoTimer: 0 });

interface Run {
  mode: GameMode; stageId: number; element: ElementMode; score: number; lives: number; elapsed: number;
  counts: Partial<Record<ItemType,number>>; combo: number; maxCombo: number; comboUntil: number;
  energy: number; furyUntil: number; furyCount: number; bossHits: number; invulnerableUntil: number;
  powers: ActivePowerUps; eaten: number; hits: number; status: 'brief'|'playing'|'won'|'lost';
  message: string; messageUntil: number; charm: Charm;
}
function freshRun(stageId: number, mode: GameMode, charm: Charm): Run {
  return { mode, stageId, element:'ice', score:0, lives:3, elapsed:0, counts:{}, combo:0, maxCombo:0, comboUntil:0, energy:0, furyUntil:0, furyCount:0, bossHits:0, invulnerableUntil:0, powers:{ ...blankPowers(), shield:charm==='shelter', shieldHits:charm==='shelter'?1:0 }, eaten:0, hits:0, status:'brief', message:'', messageUntil:0, charm };
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
    run.status=won?'won':'lost';
    const s=CAMPAIGN_STAGES[run.stageId-1];
    if(won && run.mode==='target') {
      eatAudio.playWin();
      // Three independent stars: completion, damage discipline, rhythm mastery.
      const stars=1+Number(run.hits<=1)+Number(run.maxCombo>=Math.min(12,Math.ceil(s.targetCount/2)));
      if(!latest.current.isPracticeMode) {
        const prior=saveRef.current;
        const firstClear=!prior.stars[s.id];
        const next={...prior,unlocked:Math.min(CAMPAIGN_STAGES.length,Math.max(prior.unlocked,s.id+1)),stars:{...prior.stars,[s.id]:Math.max(prior.stars[s.id]||0,stars)}};
        saveRef.current=next; persist(next);
        // Rewards for first clear only; replay is for stars and score, no farming loop.
        if(firstClear && !rewardGuard.current) {
          rewardGuard.current=true;
          latest.current.bridge.grantCoins(100+s.chapter*25);
          latest.current.bridge.grantExp(50+s.chapter*15);
          if(s.id===5) latest.current.bridge.reportProgress('ach-eat-target-stage-5',5,true);
        }
      }
    } else if(!won) eatAudio.playHurt();
    if(run.mode==='endless') latest.current.bridge.reportProgress('ach-eat-endless-1500',run.score,true);
    force();
  },[force,persist]);

  const start = (stageId=selected, nextMode=mode) => {
    runRef.current=freshRun(stageId,nextMode,save.charm);
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
      const phase=bossPhase(run.elapsed);
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
  // Do not submit campaign clears as game-over: the launcher would unmount the story result.
  const exit = () => {const run=runRef.current;latest.current.onGameOver(run.score,{itemsEaten:run.eaten,maxCombo:run.maxCombo,furyActivated:run.furyCount});};
  const backToMap=()=>{setScreen('map');setSelected(r.stageId);setChapterId(stage.chapter);};
  const fury=r.furyUntil>r.elapsed;
  const remaining=Object.fromEntries(Object.entries(stage.targetItems).map(([k,n])=>[k,Math.max(0,(n||0)-(r.counts[k as ItemType]||0))]));
  const phase=bossPhase(r.elapsed);
  const countStars=(save.stars[selected]||0);

  return <div className="eat-journey" data-testid="eat-journey" data-chapter={screen==='map'?chapterId:stage.chapter} style={{'--eat-world':`url("${worldUrl}")`} as React.CSSProperties}>
    {screen==='map'?<div className="eat-scroll">
      <header className="eat-hero"><div><div className="eat-brand"><Art name="void" size={27}/><span>EAT EM ALL</span></div><div className="eat-eyebrow">Cuộc phiêu lưu của Nốm</div><h1 className="eat-title">TRÁI TIM<br/><em>HAI NGUYÊN TỐ</em></h1><p className="eat-sub">Băng nuôi mầm. Lửa thắp hy vọng.<br/>Tìm lại nhịp tim cho thế giới.</p></div><div className="eat-hero-nom"><div className="eat-hero-orbit"/><Art name="nom-dual-idle" size={210} label="Nốm, linh thú mang Băng và Lửa"/><Art name="ice" size={38} className="eat-orbit-ice"/><Art name="fire" size={38} className="eat-orbit-fire"/></div></header>
      <nav className="eat-tabs" aria-label="Chế độ">{([['target','Câu chuyện','book'],['endless','Sinh tồn','infinity'],['time','60 giây','clock']] as const).map(([id,label,icon])=><button key={id} aria-pressed={mode===id} onClick={()=>setMode(id)}><Art name={icon} size={24}/><span>{label}</span></button>)}</nav>
      {mode==='target'?<>
        <div className="eat-chapters">{CHAPTERS.map(c=><button key={c.id} className="eat-chapter" aria-pressed={chapterId===c.id} disabled={save.unlocked<c.startStage} onClick={()=>{setChapterId(c.id);setSelected(Math.min(save.unlocked,c.startStage));}}><Art name={save.unlocked<c.startStage?'lock':REGION_GLYPHS[c.id-1]} size={38}/><span><small>CHƯƠNG {c.id}</small><b>{c.title}</b><i className="eat-chapter-dots">{Array.from({length:6},(_,i)=><i key={i} className={save.stars[c.startStage+i]?'lit':''}/>)}</i></span></button>)}</div>
        <div className="eat-region"><div><div className="eat-eyebrow">{chapter.subtitle}</div><h2>{chapter.title}</h2></div><span className="eat-total-stars"><Art name="star" size={25}/>{Object.values(save.stars).reduce((a,b)=>a+(Number(b)||0),0)}</span></div>
        <div className="eat-map" aria-label="Bản đồ màn chơi"><div className="eat-map-scenery"/><svg className="eat-map-trail" viewBox="0 0 600 220" preserveAspectRatio="none" aria-hidden="true"><path d="M75 72Q170 15 300 72T525 72Q580 190 300 170T75 170"/></svg>{CAMPAIGN_STAGES.filter(s=>s.chapter===chapterId).map(s=><button key={s.id} className={`eat-node ${s.objective==='boss'?'boss-node':''}`} disabled={s.id>save.unlocked} aria-label={`Màn ${s.id}: ${s.title}`} aria-pressed={selected===s.id} onClick={()=>setSelected(s.id)}><div className="eat-node-medal">{s.id>save.unlocked?<Art name="lock" size={29}/>:s.objective==='boss'?<Art name={`guardian-${chapterId}-idle`} size={59}/>:s.objective==='rescue'?<Art name="gem" size={35}/>:<strong>{s.id}</strong>}</div><small>{s.title}</small><div className="eat-node-stars">{[1,2,3].map(n=><Art name="star" key={n} size={17} className={n<=(save.stars[s.id]||0)?'':'empty'}/>)}</div></button>)}</div>
        <section className="eat-brief"><div><div className="eat-eyebrow">MÀN {choice.id} · {choice.beat==='boss'?'Đối đầu thủ vệ':choice.objective==='rescue'?'Giải cứu ký ức':'Khám phá'}</div><h3>{choice.title}</h3><p>{choice.story}</p><div className="eat-goals">{Object.entries(choice.targetItems).map(([k,n])=><span key={k}><Art name={k} size={25}/> <b>{n}</b>{k==='gem'&&choice.objective==='rescue'?' linh hồn':''}</span>)}{choice.bossHits&&<span><Art name="power_shield" size={25}/> Phá {choice.bossHits} giáp</span>}<span><Art name="clock" size={23}/> {choice.timeLimit}s</span></div><p>{choice.description}</p></div><button className="eat-primary" onClick={()=>start()}> <Art name="play" size={26}/>{countStars?'CHƠI LẠI':'LÊN ĐƯỜNG'}</button></section>
      </>:<section className="eat-brief"><div><h3>{mode==='endless'?'Bụng đói bất tận':'Bữa tiệc chớp nhoáng'}</h3><p>{mode==='endless'?'Giữ ba trái tim qua các đợt rơi ngày càng nhanh. Chọn thời điểm dùng Fury để thoát hiểm.':'Một phút giữ nhịp, đổi hệ và tối ưu chuỗi ăn. Va chạm mất 100 điểm.'}</p></div><button className="eat-primary" onClick={()=>start()}><Art name="play" size={26}/>BẮT ĐẦU</button></section>}
      <div className="eat-eyebrow" style={{marginTop:20}}>Bùa đồng hành · chọn một</div><div className="eat-loadout">{CHARMS.map(c=><button className="eat-chip" key={c.id} title={c.description} disabled={save.unlocked<c.unlock} aria-pressed={save.charm===c.id} onClick={()=>persist({...save,charm:c.id})}><Art name={save.unlocked<c.unlock?'lock':c.id==='shelter'?'power_shield':c.id==='spark'?'fury_pill':'memory'} size={32}/>{c.name}</button>)}</div><p className="eat-sub">{CHARMS.find(c=>c.id===save.charm)?.description}</p>
      <div className="eat-map-footer"><span>Kéo để hứng · Đổi hệ · Chọn lúc tung Fury</span><button className="eat-secondary" onClick={()=>setShowArt(true)}><Art name="book" size={22}/> Sổ linh thú</button></div>
    </div>:<>
      <header className="eat-hud"><button className="eat-secondary" style={{margin:0,padding:'6px 10px'}} aria-label="Tạm dừng" onClick={()=>setPaused(true)}><Art name="pause" size={24}/></button><div><small>{r.mode==='target'?`MÀN ${stage.id} · ${CHAPTERS[stage.chapter-1].title}`:'THỬ THÁCH'}</small><div><strong>{r.score.toLocaleString()}</strong> <small> {r.combo>1?`×${getComboTier(r.combo).multiplier} · ${r.combo} chuỗi`:''}</small></div></div><div style={{textAlign:'right'}}><div aria-label={`${r.lives} mạng`}>{r.mode==='time'?<Art name="clock" size={23}/>:<span className="eat-hearts">{[1,2,3].map(n=><Art key={n} name="heart" size={23} className={n<=r.lives?'':'empty'}/>)}</span>}</div><small>{Math.max(0,Math.ceil((r.mode==='target'?stage.timeLimit:r.mode==='time'?60:0)-r.elapsed)) || (r.mode==='endless'?Math.floor(r.elapsed):0)}s {r.powers.shield?<Art name="power_shield" size={17}/>:null}</small></div></header>
      <div className="eat-goalbar">{r.mode==='target'?Object.entries(stage.targetItems).map(([k,n])=><span key={k} className={(r.counts[k as ItemType]||0)>=n!?'done':''}><Art name={k} size={24}/> <b>{Math.min(n!,r.counts[k as ItemType]||0)}/{n}</b>{k==='gem'&&stage.objective==='rescue'?' linh hồn':''}</span>):<span>{r.mode==='endless'?'Sống sót • Giữ nhịp • Vượt kỷ lục':'Ăn đúng hệ • Săn chuỗi điểm'}</span>}<span className={`eat-element-label ${r.element}`}><Art name={r.element} size={22}/>{r.element==='ice'?'BĂNG':'LỬA'}</span></div>
      <div className="eat-board"><EatEmAllCanvas key={attempt} playerMode={r.element} onSwitchMode={switchMode} isPaused={isPaused||paused||r.status!=='playing'} isGameOver={r.status==='won'||r.status==='lost'} isMuted={isMuted} lives={r.lives} furyActive={fury} speedMultiplier={r.mode==='target'?stage.fallSpeedMultiplier:1+Math.min(.8,r.elapsed/120)} spawnIntervalMs={r.mode==='target'?stage.spawnIntervalMs:Math.max(430,900-r.elapsed*2)} bombChance={.14} poisonChance={r.elapsed>20?.06:0} powerUpChance={.045} combo={r.combo} comboMultiplier={getComboTier(r.combo).multiplier} comboDecayRatio={Math.max(0,(r.comboUntil-r.elapsed)/(r.charm==='rhythm'?5:3.5))} activePowerUps={r.powers} currentTheme={r.mode==='target'?stage.theme:r.elapsed>60?'space':'night'} onEatItem={eat} onHitHazard={hurt} onCollectPowerUp={collect} onConsumeShield={consume} stageElapsed={r.elapsed} campaignStage={r.mode==='target'?stage:undefined} remainingTargets={remaining} skinId={bridge.getEquippedSkin?.()||'default'}/>
      {r.mode==='target'&&stage.objective==='boss'&&<div className={`eat-boss ${phase.warning?'warning':'open'}`}><div className="eat-boss-title">{stage.bossName} · {Math.max(0,(stage.bossHits||0)-r.bossHits)} giáp</div><div className="eat-boss-hint"><Art name={phase.element} size={20}/>{phase.warning?'Lõi sắp mở…':'Hứng đúng hệ để phản công'}</div><div className="eat-bar"><i style={{width:`${Math.max(0,1-r.bossHits/(stage.bossHits||1))*100}%`}}/></div></div>}
      {r.messageUntil>r.elapsed&&<div className="eat-narrator" role="status">{r.message}</div>}
      </div>
      <footer className="eat-controls"><button className={`eat-control element ${r.element}`} disabled={r.status!=='playing'||paused||isPaused} onClick={()=>{switchMode();eatAudio.playSwitch();}}><span className="eat-control-orb"><Art name={r.element} size={40}/></span><span><b>ĐỔI SANG {r.element==='ice'?'LỬA':'BĂNG'}</b><small>Chạm để đổi hệ · Space</small></span><Art name={r.element==='ice'?'fire':'ice'} size={24}/></button><button className={`eat-control fury ${r.energy>=100?'ready':''} ${fury?'active':''}`} disabled={r.energy<100||fury||r.status!=='playing'||paused||isPaused} onClick={activateFury}><Art name="fury_pill" size={38}/><span><b>{fury?`FURY ${Math.ceil(r.furyUntil-r.elapsed)}s`:r.energy>=100?'TUNG FURY':`FURY ${Math.floor(r.energy)}%`}</b><small>{r.energy>=100?'Sẵn sàng · F':'Ăn đúng hệ để tích năng lượng'}</small><i className="eat-energy-track"><i style={{width:`${fury?100:r.energy}%`}}/></i></span></button></footer>
      {r.status==='brief'&&<div className="eat-overlay"><section className="eat-dialog"><div className="eat-dialog-art"><Art name={stage.objective==='boss'?`guardian-${stage.chapter}-idle`:'nom-dual-idle'} size={156}/></div><div className="eat-eyebrow">{r.mode==='target'?`CHƯƠNG ${stage.chapter} · MÀN ${stage.id}`:'THỬ THÁCH'}</div><h2>{r.mode==='target'?stage.title:'Bữa tiệc bắt đầu'}</h2><p>{r.mode==='target'?stage.story:'Đổi Băng/Lửa để ăn đúng hệ. Để dành Fury cho thời khắc khó nhất.'}</p><p>{r.mode==='target'?stage.description:''}</p><div className="eat-tutorial"><span><Art name="ice" size={33}/><Art name="fire" size={33}/><b>Hứng đúng hệ</b></span><span><Art name="bomb" size={33}/><Art name="poison" size={33}/><b>Né nguy hiểm</b></span></div><button className="eat-primary" onClick={()=>{r.status='playing';setPaused(false);force();}}>ĐÃ SẴN SÀNG →</button><button className="eat-secondary" onClick={backToMap}>Về bản đồ</button></section></div>}
      {paused&&r.status==='playing'&&<div className="eat-overlay"><section className="eat-dialog"><Art name="nom-dual-sleep" size={150}/><h2>Nghỉ một nhịp</h2><p>{stage.title}</p><button className="eat-primary" onClick={()=>setPaused(false)}>TIẾP TỤC</button><button className="eat-secondary" onClick={backToMap}>Về bản đồ</button></section></div>}
      {(r.status==='won'||r.status==='lost')&&<div className="eat-overlay"><section className="eat-dialog"><Art name={r.status==='won'?'nom-dual-happy':'nom-dual-hurt'} size={150}/><div className="eat-eyebrow">{r.status==='won'?'MỘT NHỊP TIM TRỞ LẠI':'NỐM CẦN BẠN'}</div><h2>{r.status==='won'?(r.mode==='target'?'Vùng đất thức giấc!':'Bữa tiệc trọn vẹn!'):'Thử một lối đi khác'}</h2>{r.status==='won'&&r.mode==='target'&&<div className="eat-result-stars">{[1,2,3].map(n=><Art key={n} name="star" size={44} className={n<=1+Number(r.hits<=1)+Number(r.maxCombo>=Math.min(12,Math.ceil(stage.targetCount/2)))?'':'empty'}/>)}</div>}<p>{r.status==='won'?(r.mode==='target'?stage.resolution:'Một phút đã khép lại. Thử giữ combo lâu hơn để vượt kỷ lục của chính mình!'):r.lives<=0?'Giữ khoảng trống để né. Fury sẵn sàng không tự kích hoạt — hãy dùng khi bị dồn ép.':'Chưa đủ mục tiêu trước khi cổng khép lại. Ưu tiên món còn thiếu trên thanh mục tiêu.'}</p><p>{r.score.toLocaleString()} điểm · Combo tốt nhất {r.maxCombo}<br/>{r.hits} lần trúng đòn · {Math.floor(r.elapsed)} giây</p>{r.mode==='target'&&r.status==='won'&&stage.id<CAMPAIGN_STAGES.length?<button className="eat-primary" onClick={()=>start(stage.id+1,'target')}>CHƯƠNG TIẾP CỦA NỐM →</button>:<button className="eat-primary" onClick={()=>start(r.stageId,r.mode)}>CHƠI LẠI →</button>}<button className="eat-secondary" onClick={backToMap}><Art name="map" size={22}/> Bản đồ</button> <button className="eat-secondary" onClick={exit}>Kết thúc lượt</button></section></div>}
    </>}
    {showArt&&<div className="eat-overlay"><section className="eat-artbook" role="dialog" aria-modal="true" aria-label="Sổ linh thú"><header><div><div className="eat-eyebrow">BÁCH KHOA THẾ GIỚI</div><h2>Sổ linh thú</h2></div><button className="eat-secondary" aria-label="Đóng sổ" onClick={()=>setShowArt(false)}><Art name="close" size={23}/></button></header><div className="eat-artbook-content"><h3>Hai nguyên tố, một người bạn</h3><div className="eat-artbook-row">{(['idle','eat','hurt','fury','happy','sleep'] as const).map((pose,i)=><figure key={pose}><Art name={`nom-dual-${pose}`} size={115}/><figcaption>{['Chờ đợi','Ngon quá!','Trúng đòn','Cuồng nộ','Hân hoan','Nghỉ ngơi'][i]}</figcaption></figure>)}</div><h3>Những người giữ nhịp tim</h3><div className="eat-guardian-gallery">{CHAPTERS.map(c=><figure key={c.id}><Art name={`guardian-${c.id}-idle`} size={150}/><figcaption>{CAMPAIGN_STAGES[c.endStage-1].bossName}</figcaption></figure>)}</div><h3>Thức ăn & bảo vật</h3><div className="eat-item-gallery">{['ice','fire','star','gem','heart','bomb','poison','fury_pill','power_shield','power_magnet','power_speed','power_slowmo'].map((key,i)=><figure key={key}><Art name={key} size={52}/><figcaption>{['Tinh thể băng','Hạt lửa','Sao mật','Linh hồn sáng','Trái tim','Hạt bom','Bình độc','Năng lượng','Khiên','Nam châm','Tăng tốc','Chậm thời gian'][i]}</figcaption></figure>)}</div></div><footer><button className="eat-primary" onClick={()=>setShowArt(false)}>TRỞ VỀ HÀNH TRÌNH</button></footer></section></div>}
  </div>;
};
