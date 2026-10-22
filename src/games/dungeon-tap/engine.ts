import { EquipmentItem, EquipmentSlot, AllyEquipmentItem, HeroAlly, ActiveSkill, TitanMonster, AllyEquipSlot } from './types';
import { generateMonsterForStage, getStoryChapterForStage } from './storyChapters';
import { STARTER_EQUIPMENT, generateLootItem } from './equipmentData';
import { generateAllyLootItem, calculateAllyItemPower } from './allyEquipmentData';
import { INITIAL_ALLIES, INITIAL_SKILLS } from './skillsAndAllies';
import { calculateHeroUpgradeCost, calculateAllyUpgradeCost, calculateSkillUpgradeCost, getHeroMilestoneData, getAllyMilestoneData, getSkillData, calculateItemBasePower } from './utils/upgradeMath';
import { roomFor, ROOM_RULES, STANCES, Stance, bossPhase, bossPattern, runeCost } from './director';

import {ENEMY_ROSTER,ENEMY_ROLES,enemyRole,EnemyRole,SQUAD_COUNTS,squadSpecies} from './enemyRoster';
export interface EncounterEnemy extends TitanMonster {species:number;role:EnemyRole;rank:'troop'|'champion'|'titan';guardHits:number;exposedFor:number;}
export interface DungeonState {
 version: 4; enemies:EncounterEnemy[]; encounterSerial:number; casterPulse:number; waveGoldBase:number; damageTotal:number; stage: number; maxStageReached: number; gold: number; heroLevel: number;
 equipped: Record<EquipmentSlot, EquipmentItem | null>; inventory: EquipmentItem[];
 allies: HeroAlly[]; skills: ActiveSkill[]; allyInventory: AllyEquipmentItem[];
 monstersSlain: number; bossesSlain: number; autoPickup: boolean;
 monster: TitanMonster; wave: number; farming: boolean; mana: number; bossTimer: number;
 combo: number; comboTTL: number; guardHits: number; exposed: number; encounterTime: number;
 parriedCycle: number; resolvedCycle: number; stance: Stance; runes: number;
 runeRanks: { blade: number; legion: number; fortune: number }; firstClears: number[];
 dryDrops: number; dryRare: number; seed: number; elapsed: number; lastTap: number;
 event: { id: number; text: string; kind: 'hit'|'crit'|'loot'|'win'|'parry'|'info' }; hitId: number;
 legacyMarks:number; earned: number; spent: number; pending: (EquipmentItem | AllyEquipmentItem)[];
}
export type Action = {type:'target';id:string} | { type:'tick'; dt:number } | { type:'tap' } | { type:'parry' } |
 { type:'cast'; id:ActiveSkill['id'] } | { type:'hero'; count:number } |
 { type:'ally'; id:string; count:number } | { type:'skill'; id:ActiveSkill['id']; count:number } |
 { type:'equip'; id:string; allyId?:string } | { type:'sell'; id:string; ally?:boolean } |
 { type:'sellAll'; ally?:boolean } | { type:'best'; ally?:boolean; allyId?:string } |
 { type:'upgradeItem'; id:string; count:number; allyId?:string; slot?:AllyEquipSlot } |
 { type:'retreat' } | { type:'boss' } | { type:'stage'; stage:number } |
 { type:'stance'; stance:Stance } | { type:'rune'; branch:Stance } |
 { type:'mark' } | { type:'pickup' } | { type:'autoPickup' };
const bounded = (n:unknown, fallback=0, max=1e120) => typeof n==='number' && Number.isFinite(n) && n>=0 ? Math.min(max,n) : fallback;
const integer = (n:unknown, fallback=1, max=1000) => Math.floor(bounded(n,fallback,max));
const clone = <T,>(v:T):T => JSON.parse(JSON.stringify(v));
const random = (s:DungeonState) => { s.seed = (Math.imul(1664525,s.seed)+1013904223)>>>0; return s.seed/4294967296; };
function tell(s:DungeonState,text:string,kind:DungeonState['event']['kind']='info') { s.event={id:s.event.id+1,text,kind}; }
export function spawn(stage:number, wave=1, farming=false):TitanMonster {
 const m=generateMonsterForStage(farming ? Math.max(1,stage-1) : stage);
 const room=farming ? 'scout' : roomFor(stage), rule=ROOM_RULES[room];
 // Story generator owns the original curve. Distribute one room's budget across waves.
 const hp=Math.round(m.maxHp * (m.isBoss ? rule.hp/5.5 : rule.hp/rule.waves));
 return {...m,id:`room-${stage}-${wave}-${farming}`,stage,hp,maxHp:hp,goldReward:Math.round(m.goldReward*(m.isBoss ? rule.gold/4.5 : rule.gold/rule.waves))};
}
/** Share one wave's existing budget; squad size does not multiply rewards. */
export function spawnSquad(stage:number,wave=1,farming=false,serial=0):EncounterEnemy[]{
 const budget=spawn(stage,wave,farming),ch=Math.min(7,getStoryChapterForStage(stage).id-1);
 if(budget.isBoss){const chapter=getStoryChapterForStage(stage),titan=stage===chapter.endStage||stage>200&&stage%20===0;return [{...budget,role:'boss',rank:titan?'titan':'champion',species:titan?-1:(Math.floor(stage/10)+serial)%6,guardHits:0,exposedFor:0,id:`boss-${stage}-${serial}`}];}
 const kind=farming?'scout':roomFor(stage),count=SQUAD_COUNTS[kind]||2;
 const species=squadSpecies(stage,wave,serial,count);
 const weights=species.map(i=>enemyRole(ch,i)==='guard'?1.3:enemyRole(ch,i)==='swarm'?.65:enemyRole(ch,i)==='caster'?.85:1),total=weights.reduce((a,b)=>a+b,0);
 let hpUsed=0,goldUsed=0;
 return species.map((variant,i)=>{const last=i===count-1,hp=last?budget.maxHp-hpUsed:Math.floor(budget.maxHp*weights[i]/total),gold=last?budget.goldReward-goldUsed:Math.floor(budget.goldReward*weights[i]/total);hpUsed+=hp;goldUsed+=gold;
 return {...budget,id:`unit-${stage}-${wave}-${serial}-${i}`,name:ENEMY_ROSTER[ch][variant],title:enemyRole(ch,variant),isBoss:false,hp,maxHp:hp,goldReward:gold,species:variant,role:enemyRole(ch,variant),rank:'troop',guardHits:0,exposedFor:0};});
}
function selectTarget(s:DungeonState,unit:EncounterEnemy){s.monster={...unit};s.guardHits=unit.guardHits;s.exposed=unit.exposedFor;}
function setWave(s:DungeonState){s.enemies=spawnSquad(s.stage,s.wave,s.farming,s.encounterSerial);selectTarget(s,s.enemies[0]);s.casterPulse=0;s.waveGoldBase=0;}
export function freshState(seed=72691):DungeonState {
 const enemies=spawnSquad(1);return { version:4,enemies,encounterSerial:0,casterPulse:0,waveGoldBase:0,damageTotal:0,stage:1,maxStageReached:1,gold:100,heroLevel:1,equipped:clone(STARTER_EQUIPMENT),inventory:[],
 allies:clone(INITIAL_ALLIES),skills:clone(INITIAL_SKILLS).map(tuneSkill),allyInventory:[],monstersSlain:0,bossesSlain:0,autoPickup:true,
 monster:enemies[0],wave:1,farming:false,mana:100,bossTimer:30,combo:0,comboTTL:0,guardHits:0,exposed:0,encounterTime:0,
 parriedCycle:-1,resolvedCycle:-1,stance:'blade',runes:0,runeRanks:{blade:0,legion:0,fortune:0},firstClears:[],dryDrops:0,dryRare:0,
 seed:seed>>>0,elapsed:0,lastTap:-1,event:{id:0,text:'Chạm vào Titan hoặc giữ Tấn công. Tầng 10 có boss đầu tiên.',kind:'info'},hitId:0,legacyMarks:0,earned:0,spent:0,pending:[] };
}
/** Validate a save before applying it. Transient combat is restarted; owned levels/items are retained. */
export function restoreState(raw:unknown,seed=72691):DungeonState {
 if(!raw || typeof raw!=='object'||Array.isArray(raw)) return freshState(seed);
 const p=raw as Partial<DungeonState>, s=freshState(seed);
 if((typeof p.stage==='number'&&p.stage>1000)||(typeof p.maxStageReached==='number'&&p.maxStageReached>1000)||(typeof p.heroLevel==='number'&&p.heroLevel>1000))throw new Error('Save vượt giới hạn tầng/cấp 1.000 của bản thử; không ghi đè dữ liệu.');
 s.stage=Math.max(1,integer(p.stage)); s.maxStageReached=Math.max(s.stage,integer(p.maxStageReached));
 s.heroLevel=Math.max(1,integer(p.heroLevel)); s.gold=bounded(p.gold,100); s.monstersSlain=integer(p.monstersSlain,0,1e9);s.bossesSlain=integer(p.bossesSlain,0,1e9);
 s.autoPickup=p.autoPickup!==false; s.stance=p.stance && p.stance in STANCES ? p.stance : 'blade';
 s.runes=integer(p.runes,0,1e6);s.firstClears=Array.isArray(p.firstClears)?[...new Set(p.firstClears.filter(n=>Number.isInteger(n)&&n>=10&&n<=1000&&n%10===0))]:[];
 for(const k of Object.keys(s.runeRanks) as Stance[]) s.runeRanks[k]=integer(p.runeRanks?.[k],0,10);
 const validGear=(it:any,ally=false)=>it&&typeof it.id==='string'&&typeof it.name==='string'&&
   (ally?['ally_weapon','ally_armor','ally_accessory']:['weapon','armor','helmet','cloak','ring']).includes(it.slot)&&
   ['common','rare','epic','legendary'].includes(it.rarity)&&['level','sellValue','upgradeCost',...(ally?['dpsBonusPercent','skillBonusPercent','cooldownReductionSec','teamBuffBonusPercent']:['tapDmgBonus','heroDmgBonus','critRateBonus','goldBonus'])].every(k=>typeof it[k]==='number'&&Number.isFinite(it[k])&&it[k]>=0&&it[k]<=1e120);
 const seen=new Set<string>();
 if(p.equipped)for(const slot of Object.keys(s.equipped) as EquipmentSlot[]) {const it=p.equipped[slot];if(validGear(it)&&it?.slot===slot&&!seen.has(it.id)){s.equipped[slot]=clone(it);seen.add(it.id);}}
 if(Array.isArray(p.inventory))s.inventory=p.inventory.filter(it=>{if(!validGear(it)||seen.has(it.id))return false;seen.add(it.id);return true;}).map(clone);
 if(Array.isArray(p.allies))s.allies=s.allies.map(base=>{const old=p.allies!.find(a=>a?.id===base.id);if(!old)return base;
   const a={...base,level:integer(old.level,base.level),unlocked:old.unlocked===true};a.currentDmg=Math.round(a.baseDmg*Math.pow(1.16,a.level)*getAllyMilestoneData(a.level).multiplier);a.upgradeCost=bounded(old.upgradeCost,base.upgradeCost);
   for(const key of ['equippedWeapon','equippedArmor','equippedAccessory'] as const){const it=old[key];if(validGear(it,true)&&it?.profession===base.profession&&!seen.has(it.id)){a[key]=clone(it);seen.add(it.id);}}
   a.currentSkillIndex=integer(old.currentSkillIndex,0,2);a.skills=base.skills.map(sk=>{const found=old.skills?.find(k=>k.id===sk.id);return {...sk,level:Math.max(1,integer(found?.level,1,500)),currentCooldown:Math.min(sk.cooldown,bounded(found?.currentCooldown,sk.cooldown))};});a.skill=a.skills[a.currentSkillIndex];return a;});
 if(Array.isArray(p.allyInventory))s.allyInventory=p.allyInventory.filter(it=>{if(!validGear(it,true)||seen.has(it.id))return false;seen.add(it.id);return true;}).map(clone);
 if(Array.isArray(p.skills))s.skills=s.skills.map(base=>{const old=p.skills!.find(k=>k?.id===base.id);const level=Math.max(1,integer(old?.level,1,500));return tuneSkill({...base,level,currentCooldown:Math.min(base.cooldown,bounded(old?.currentCooldown,0)),activeRemaining:0});});
 s.dryDrops=integer(p.dryDrops,0,7);s.dryRare=integer(p.dryRare,0,5);s.legacyMarks=integer(p.legacyMarks,0,1000);s.earned=bounded(p.earned);s.spent=bounded(p.spent);s.seed=integer(p.seed,seed,4294967295);
 // Pending items were already rolled. Persist them and dedupe against owned gear.
 if(Array.isArray(p.pending))s.pending=p.pending.filter(it=>{if(!(it&&typeof it==='object'&&validGear(it,'profession' in it))||seen.has(it.id))return false;seen.add(it.id);return true;}).map(clone);
 s.farming=p.farming===true&&s.stage%10===0;s.encounterSerial=integer(p.encounterSerial,0,1e9)+1;setWave(s);s.mana=Math.min(maxManaFor(s),bounded(p.mana,100));tell(s,'Tiến trình đã khôi phục. Trận hiện tại bắt đầu lại; không nhận thưởng offline.');return s;
}
export const markCost=(s:DungeonState)=>Math.min(1e120,Math.round(spawn(s.maxStageReached).goldReward*20*Math.pow(1.4,s.legacyMarks)));
export const maxManaFor=(s:DungeonState)=>100+Math.floor(s.heroLevel/5)*5;
const active=(s:DungeonState,id:ActiveSkill['id'])=>s.skills.find(k=>k.id===id&&k.activeRemaining>0);
export function statsFor(s:DungeonState) {
 const e=Object.values(s.equipped).filter(Boolean) as EquipmentItem[];
 const soften=(v:number,knee=300)=>Math.min(1200,v<=knee?v:knee+Math.log1p((v-knee)/100)*100);
 const sum=(k:keyof EquipmentItem)=>soften(e.reduce((n,it)=>n+Number(it[k]||0),0),k==='goldBonus'?150:300);
 const tap=Math.round(10*Math.pow(1.15,s.heroLevel-1)*getHeroMilestoneData(s.heroLevel).multiplier*(1+sum('tapDmgBonus')/100)*STANCES[s.stance].tap*(1+.04*s.runeRanks.blade));
 let dps=0;
 for(const a of s.allies.filter(a=>a.unlocked)){const gear=[a.equippedWeapon,a.equippedArmor,a.equippedAccessory];dps+=a.currentDmg*(1+soften(gear.reduce((n,it)=>n+(it?.dpsBonusPercent||0)+(it?.teamBuffBonusPercent||0),0))/100);}
 dps*= (1+sum('heroDmgBonus')/100)*STANCES[s.stance].ally*(1+.04*s.runeRanks.legion)*(active(s,'war_cry')?.multiplier||1);
 return {tap:Math.min(1e120,tap),dps:Math.min(1e120,dps),crit:active(s,'berserker_rage')?1:Math.min(.8,.05+sum('critRateBonus')/100),critMult:active(s,'berserker_rage')?.multiplier||2,
 gold:(1+sum('goldBonus')/100)*STANCES[s.stance].gold*(1+.04*s.runeRanks.fortune)*(active(s,'hand_of_midas')?.multiplier||1)};
}
function tuneSkill(k:ActiveSkill):ActiveSkill {const d=getSkillData(k.id,k.level);return {...k,multiplier:d.primaryValue,duration:k.id==='radiant_slash'?8:d.secondaryValue??k.duration,upgradeCost:calculateSkillUpgradeCost(k.baseUpgradeCost,k.level)};}
function pay(s:DungeonState,cost:number) {if(!Number.isFinite(cost)||cost<=0||s.gold<cost)return false;s.gold-=cost;s.spent+=cost;return true;}
function enter(s:DungeonState,stage:number,farming=false) {s.stage=stage;s.farming=farming;s.wave=1;s.encounterSerial++;setWave(s);s.bossTimer=30;s.encounterTime=0;s.guardHits=0;s.exposed=0;s.parriedCycle=-1;s.resolvedCycle=-1;}
function addGear(s:DungeonState,it:EquipmentItem|AllyEquipmentItem) {
 if(!s.autoPickup){s.pending=[...s.pending,it];return;}
 if('profession' in it)s.allyInventory=[it,...s.allyInventory];else s.inventory=[it,...s.inventory];
}
function defeat(s:DungeonState) {
 const boss=s.monster.isBoss,room=s.farming?'scout':roomFor(s.stage),rule=ROOM_RULES[room];
 const goldMult=statsFor(s).gold;const reward=Math.min(1e120,Math.round((s.waveGoldBase+s.monster.goldReward)*goldMult)-Math.round(s.waveGoldBase*goldMult));s.waveGoldBase+=s.monster.goldReward;s.gold=Math.min(1e120,s.gold+reward);s.earned+=reward;
 if(boss)s.bossesSlain++;else s.monstersSlain++;
 const killed=s.monster.id;s.enemies=s.enemies.filter(e=>e.id!==killed);
 if(s.enemies.length){selectTarget(s,s.enemies[0]);tell(s,`+${reward} vàng`,'win');return;}
 const lastWave=s.wave>=rule.waves;
 if(lastWave){s.dryDrops++;const drop=boss||s.dryDrops>=7||random(s)<(room==='elite'?.6:.28);
 if(drop){s.dryDrops=0;s.dryRare++;let it=generateLootItem(s.stage,undefined,()=>random(s));
   // Five consecutive sub-rare drops force the next item into at least rare.
   if(it.rarity!=='common')s.dryRare=0;
   else if(s.dryRare>=5){it={...it,rarity:'rare',name:'Bảo chứng · '+it.name,tapDmgBonus:Math.round(it.tapDmgBonus*1.8),heroDmgBonus:Math.round(it.heroDmgBonus*1.8),goldBonus:Math.round(it.goldBonus*1.8),baseLevelStats:undefined};s.dryRare=0;}
   addGear(s,it);tell(s,`+${Math.round(reward)} vàng · ${it.name}`,'loot');
 } else tell(s,`+${Math.round(reward)} vàng`,'win');
 if(boss||random(s)<.16)addGear(s,generateAllyLootItem(s.stage,undefined,undefined,()=>random(s)));
 }
 if(boss&&!s.firstClears.includes(s.stage)){s.firstClears=[...s.firstClears,s.stage];s.runes+=s.stage%20===0?2:1;tell(s,'Hạ Titan lần đầu! Nhận Ấn Titan để khắc sức mạnh vĩnh viễn.','win');}
 if(room==='caster')s.mana=Math.min(maxManaFor(s),s.mana+15);
 if(room==='rest')s.mana=Math.min(maxManaFor(s),s.mana+30);
 if(s.farming){s.encounterSerial++;setWave(s);s.encounterTime=0;return;}
 if(!lastWave){s.wave++;s.encounterSerial++;setWave(s);return;}
 const next=Math.min(1000,s.stage+1);s.maxStageReached=Math.max(s.maxStageReached,next);enter(s,next);
 if(next===1000&&s.firstClears.includes(1000))tell(s,'Đã chạm giới hạn bản thử: tầng 1.000. Có thể chơi lại để hoàn thiện trang bị.','info');
}
function damage(s:DungeonState,amount:number,source:'tap'|'skill'|'ally',crit=false) {
 if(s.monster.hp<=0||!Number.isFinite(amount)||amount<=0||s.encounterTime<.65)return;
 const boss=s.monster.isBoss,room=s.farming?'scout':roomFor(s.stage),unit=s.enemies.find(e=>e.id===s.monster.id);
 const guarded=boss||unit?.role==='guard';
 const phase=bossPhase(s.encounterTime,1,s.stage);
 if(source!=='ally'&&guarded){s.guardHits+=source==='skill'?3:1;if(s.guardHits>=(boss?bossPattern(s.stage).guard:8)){s.guardHits=0;s.exposed=3;tell(s,'PHÁ GIÁP · dồn sát thương!','parry');}}
 const exposed=s.exposed>0 || (boss&&phase.phase==='exposed');
 const armor=guarded&&!exposed?.65:1;
 const mult=(exposed?1.6:armor)*(active(s,'radiant_slash')?1+Math.min(.8,.5+((active(s,'radiant_slash')?.level||1)-1)*.03):1);
 const floor=boss&&s.encounterTime<bossPattern(s.stage).strikeAt?s.monster.maxHp*.4:0;
 const beforeHP=s.monster.hp;s.monster={...s.monster,hp:Math.max(floor,s.monster.hp-Math.max(.01,amount*mult))};s.damageTotal+=Math.max(0,beforeHP-s.monster.hp);if(unit){unit.hp=s.monster.hp;unit.maxHp=s.monster.maxHp;unit.guardHits=s.guardHits;unit.exposedFor=s.exposed;}s.hitId++;
 if(crit&&s.monster.hp>0)tell(s,`BẠO KÍCH ×${statsFor(s).critMult.toFixed(1)}`,'crit');
 if(s.monster.hp<=0)defeat(s);
}
export function reduceDungeon(state:DungeonState,action:Action):DungeonState {
 const s={...state,enemies:state.enemies.map(e=>({...e})),skills:state.skills.map(k=>({...k})),allies:state.allies.map(a=>({...a,skills:a.skills.map(k=>({...k}))})),runeRanks:{...state.runeRanks}};
 switch(action.type){
 case 'tick':{
  const dt=Math.min(.25,Math.max(0,action.dt));if(!dt)return state;s.elapsed+=dt;s.comboTTL=Math.max(0,s.comboTTL-dt);if(s.comboTTL===0)s.combo=0;
  for(const e of s.enemies)e.exposedFor=Math.max(0,e.exposedFor-dt);s.exposed=Math.max(0,s.exposed-dt);s.mana=Math.min(maxManaFor(s),s.mana+2*dt);s.encounterTime+=dt;
  for(const k of s.skills){k.currentCooldown=Math.max(0,k.currentCooldown-dt);k.activeRemaining=Math.max(0,k.activeRemaining-dt);}
  if(!s.monster.isBoss&&s.enemies.some(e=>e.role==='caster')){s.casterPulse+=dt;if(s.casterPulse>=5){s.casterPulse-=5;s.mana=Math.max(0,s.mana-3);tell(s,'Pháp sư hút 3 năng lượng · Hạ pháp sư để ngắt phép.','info');}}
  const stats=statsFor(s);let dps=stats.dps;
  const shadow=active(s,'shadow_clone');if(shadow)dps+=stats.tap*shadow.multiplier*4;
  const storm=active(s,'blade_storm');if(storm)dps+=stats.tap*storm.multiplier/ .4;
  // Each ally uses exactly one authoritative cooldown, rotating three distinct skills.
  for(const a of s.allies.filter(a=>a.unlocked)){
   const idx=a.currentSkillIndex||0,k=a.skills[idx];if(!k)continue;k.currentCooldown=Math.max(0,k.currentCooldown-dt);
   if(k.currentCooldown===0){const power=a.currentDmg*k.baseMultiplier*(1+.15*(k.level-1))*(1+(a.equippedWeapon?.skillBonusPercent||0)/100);
    if(k.effectType==='mana'||k.effectType==='buff')s.mana=Math.min(maxManaFor(s),s.mana+12+k.level);
    else if(k.effectType==='cd_reduction')s.skills=s.skills.map(sk=>({...sk,currentCooldown:Math.max(0,sk.currentCooldown-2)}));
    else dps+=power/dt;
    if(k.effectType==='quake'&&s.monster.isBoss)s.bossTimer=Math.min(30,s.bossTimer+1);
    a.currentSkillIndex=(idx+1)%a.skills.length;const next=a.skills[a.currentSkillIndex];next.currentCooldown=Math.max(3,k.cooldown-(a.equippedArmor?.cooldownReductionSec||0)-(a.equippedAccessory?.cooldownReductionSec||0));
   }a.skill={...a.skills[a.currentSkillIndex||0]};
  }
  const before=s.monster.id;damage(s,dps*dt,'ally');
  if(s.monster.isBoss&&s.monster.id===before){
   const phase=bossPhase(s.encounterTime,1,s.stage); // fixed cycle clock: HP never rewinds a telegraph
   s.bossTimer=Math.max(0,s.bossTimer-dt*(s.monster.hp/s.monster.maxHp<=.4?1.15:1));
   if(phase.t>=bossPattern(s.stage).strikeAt&&s.resolvedCycle<phase.cycle){s.resolvedCycle=phase.cycle;if(s.parriedCycle!==phase.cycle){const pattern=bossPattern(s.stage);s.bossTimer=Math.max(0,s.bossTimer-pattern.penalty);s.combo=0;if(pattern.effect==='siphon'||pattern.effect==='frost')s.mana=Math.max(0,s.mana-(pattern.effect==='siphon'?15:10));if(pattern.effect==='void')s.skills=s.skills.map(k=>({...k,currentCooldown:k.currentCooldown+1.5}));tell(s,`${pattern.name}! −${pattern.penalty} giây. ${pattern.hint}`,'info');}}
   if(s.bossTimer<=0){enter(s,s.stage,true);s.combo=0;tell(s,'Hết giờ · Giữ vàng và trang bị. Nâng cấp rồi tái đấu.','info');}
  }return s;
 }
 case 'target':{const unit=s.enemies.find(e=>e.id===action.id&&e.hp>0);if(!unit||unit.id===s.monster.id)return state;selectTarget(s,unit);return s;}
 case 'tap':{
  if(s.elapsed-s.lastTap<.09)return state;s.lastTap=s.elapsed;s.combo=Math.min(30,s.combo+1);s.comboTTL=1.4;
  s.mana=Math.min(maxManaFor(s),s.mana+3);const stat=statsFor(s),crit=random(s)<stat.crit;
  damage(s,(stat.tap*(1+.015*s.combo)*(crit?stat.critMult:1)+stat.dps*.12),'tap',crit);return s;
 }
 case 'parry':{
  if(!s.monster.isBoss)return state;const phase=bossPhase(s.encounterTime,1,s.stage);
  if(!phase.canParry||s.parriedCycle===phase.cycle)return state;
  s.parriedCycle=phase.cycle;s.exposed=3;const unit=s.enemies.find(e=>e.id===s.monster.id);if(unit)unit.exposedFor=3;s.mana=Math.min(maxManaFor(s),s.mana+10);tell(s,'ĐỠ HOÀN HẢO · +10 năng lượng · lộ lõi 3 giây','parry');return s;
 }
 case 'cast':{
  const k=s.skills.find(k=>k.id===action.id);if(!k||s.heroLevel<k.unlockLevel||k.currentCooldown>0||s.mana<k.manaCost)return state;
  s.mana-=k.manaCost;k.currentCooldown=k.cooldown;k.activeRemaining=k.duration;
  if(k.id==='war_cry')s.mana=Math.min(maxManaFor(s),s.mana+30+(k.level-1)*5);
  if(k.id==='heavenly_strike'||k.id==='radiant_slash')damage(s,statsFor(s).tap*k.multiplier,'skill',true);
  tell(s,k.name,'hit');return s;
 }
 case 'hero':{
  const count=Math.min(1000-s.heroLevel,integer(action.count,0,1000));if(count<=0)return state;const cost=calculateHeroUpgradeCost(s.heroLevel,count);if(!pay(s,cost))return state;s.heroLevel+=count;tell(s,`Kiếm sĩ cấp ${s.heroLevel}`,'loot');return s;
 }
 case 'ally':{
  const a=s.allies.find(a=>a.id===action.id);if(!a)return state;const n=a.unlocked?Math.min(1000-a.level,integer(action.count,0,1000)):1;if(n<=0)return state;
  const cost=a.unlocked?calculateAllyUpgradeCost(a.baseCost,a.level,n):a.upgradeCost;if(!pay(s,cost))return state;a.level=a.unlocked?a.level+n:1;a.unlocked=true;
  a.currentDmg=Math.round(a.baseDmg*Math.pow(1.16,a.level)*getAllyMilestoneData(a.level).multiplier);a.upgradeCost=calculateAllyUpgradeCost(a.baseCost,a.level,1);
  a.skills=a.skills.map(k=>({...k,level:1+Math.floor(a.level/5)}));a.skill=a.skills[a.currentSkillIndex||0];tell(s,`${a.name} cấp ${a.level}`,'loot');return s;
 }
 case 'skill':{
  const k=s.skills.find(k=>k.id===action.id);if(!k||s.heroLevel<k.unlockLevel)return state;const n=Math.min(500-k.level,integer(action.count,0,500));if(n<=0||!pay(s,calculateSkillUpgradeCost(k.baseUpgradeCost,k.level,n)))return state;
  s.skills=s.skills.map(sk=>sk.id===k.id?tuneSkill({...sk,level:sk.level+n}):sk);return s;
 }
 case 'equip':{
  if(action.allyId){const a=s.allies.find(a=>a.id===action.allyId&&a.unlocked),it=s.allyInventory.find(i=>i.id===action.id);if(!a||!it||a.profession!==it.profession)return state;
   const key=it.slot==='ally_weapon'?'equippedWeapon':it.slot==='ally_armor'?'equippedArmor':'equippedAccessory';const old=a[key];a[key]=it;s.allyInventory=s.allyInventory.filter(i=>i.id!==it.id);if(old)s.allyInventory=[...s.allyInventory,old];
  }else {const it=s.inventory.find(i=>i.id===action.id);if(!it)return state;const old=s.equipped[it.slot];s.equipped={...s.equipped,[it.slot]:it};s.inventory=s.inventory.filter(i=>i.id!==it.id);if(old)s.inventory=[...s.inventory,old];}return s;
 }
 case 'sell':{
  const inv=action.ally?s.allyInventory:s.inventory,it=inv.find(i=>i.id===action.id);if(!it)return state;s.gold+=it.sellValue;s.earned+=it.sellValue;
  if(action.ally)s.allyInventory=s.allyInventory.filter(i=>i.id!==it.id);else s.inventory=s.inventory.filter(i=>i.id!==it.id);return s;
 }
 case 'sellAll':{const inv=action.ally?s.allyInventory:s.inventory;const value=inv.reduce((n,it)=>n+it.sellValue,0);s.gold+=value;s.earned+=value;if(action.ally)s.allyInventory=[];else s.inventory=[];return s;}
 case 'best':{
  let cur=s;
  if(action.ally){for(const a of s.allies.filter(a=>a.unlocked&&(!action.allyId||a.id===action.allyId)))for(const slot of ['ally_weapon','ally_armor','ally_accessory'] as const){const key=slot==='ally_weapon'?'equippedWeapon':slot==='ally_armor'?'equippedArmor':'equippedAccessory';let best=a[key];
    for(const it of cur.allyInventory.filter(it=>it.profession===a.profession&&it.slot===slot))if(calculateAllyItemPower(it)>calculateAllyItemPower(best))best=it;
    if(best&&best.id!==a[key]?.id)cur=reduceDungeon(cur,{type:'equip',id:best.id,allyId:a.id});}
  }else for(const slot of Object.keys(s.equipped) as EquipmentSlot[]){let best=cur.equipped[slot];for(const it of cur.inventory.filter(it=>it.slot===slot))if(calculateItemBasePower(it)>calculateItemBasePower(best))best=it;if(best&&best.id!==cur.equipped[slot]?.id)cur=reduceDungeon(cur,{type:'equip',id:best.id});}
  return cur;
 }
 case 'upgradeItem':{
  if(action.allyId){const a=s.allies.find(a=>a.id===action.allyId);if(!a)return state;const key=action.slot==='ally_weapon'?'equippedWeapon':action.slot==='ally_armor'?'equippedArmor':'equippedAccessory';const it=a[key];if(!it||it.level>=20||!pay(s,it.upgradeCost))return state;
   a[key]={...it,level:it.level+1,dpsBonusPercent:Math.round(it.dpsBonusPercent*1.12),skillBonusPercent:Math.round(it.skillBonusPercent*1.12),cooldownReductionSec:Math.min(6,it.cooldownReductionSec+.3),teamBuffBonusPercent:Math.round(it.teamBuffBonusPercent*1.12),upgradeCost:Math.round(it.upgradeCost*1.45),sellValue:Math.round(it.sellValue*1.3)};return s;
  }
  const eq=Object.values(s.equipped).find(it=>it?.id===action.id),base=eq||s.inventory.find(it=>it.id===action.id);if(!base)return state;
  let it={...base,baseLevelStats:base.baseLevelStats||{tapDmgBonus:base.tapDmgBonus,heroDmgBonus:base.heroDmgBonus,critRateBonus:base.critRateBonus,goldBonus:base.goldBonus}};
  let n=0;const count=action.count===-1?1000:integer(action.count,0,1000);
  while(n<count&&it.level<20&&pay(s,it.upgradeCost)){n++;it={...it,level:it.level+1,tapDmgBonus:Math.round(it.tapDmgBonus*1.12),heroDmgBonus:Math.round(it.heroDmgBonus*1.12),critRateBonus:Math.min(45,it.critRateBonus+(it.critRateBonus?1:0)),goldBonus:Math.round(it.goldBonus*1.12),upgradeCost:Math.round(it.upgradeCost*1.45),sellValue:Math.round(it.sellValue*1.3)};}
  if(!n)return state;if(eq)s.equipped={...s.equipped,[it.slot]:it};else s.inventory=s.inventory.map(i=>i.id===it.id?it:i);return s;
 }
 case 'retreat':if(!s.monster.isBoss)return state;enter(s,s.stage,true);tell(s,'Cày vàng · Tái đấu khi sẵn sàng.');return s;
 case 'boss':if(s.stage%10!==0||!s.farming)return state;enter(s,s.stage);return s;
 case 'stage':if(!Number.isInteger(action.stage)||action.stage<1||action.stage>s.maxStageReached)return state;enter(s,action.stage);s.combo=0;return s;
 case 'stance':if(!(action.stance in STANCES))return state;s.stance=action.stance;return s;
 case 'rune':{const rank=s.runeRanks[action.branch];if(rank===undefined||rank>=10||s.runes<runeCost(rank))return state;s.runes-=runeCost(rank);s.runeRanks[action.branch]++;tell(s,'Đã khắc Ấn Titan · +4% sức mạnh nhánh','loot');return s;}
 case 'mark':if(s.maxStageReached<200||s.legacyMarks>=1000||!pay(s,markCost(s)))return state;s.legacyMarks++;tell(s,`Bia chiến tích bậc ${s.legacyMarks} · chỉ thay đổi danh hiệu, không tăng sát thương`,'loot');return s;
 case 'pickup':for(const it of s.pending){if('profession' in it)s.allyInventory=[it,...s.allyInventory];else s.inventory=[it,...s.inventory];}s.pending=[];return s;
 case 'autoPickup':s.autoPickup=!s.autoPickup;return s.autoPickup?reduceDungeon(s,{type:'pickup'}):s;
 default:return state;
 }
}
