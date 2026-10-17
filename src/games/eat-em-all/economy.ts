/** v4 finite campaign economy. Values are first-play hypotheses; see simulation report. */
export const ECONOMY_VERSION=4;
export const CAMPAIGN_COIN_CAP=3900;
export const CAMPAIGN_XP_CAP=2100;
export const MAX_STARS=72;
export const AURAS=[
 {id:'grove',name:'Mầm xanh',icon:'seed',cost:6,color:'#a8deb5'},
 {id:'ember',name:'Tàn lửa',icon:'fire',cost:9,color:'#f3bc7e'},
 {id:'tide',name:'Giọt nhớ',icon:'memory',cost:12,color:'#9ccde5'},
 {id:'astral',name:'Tinh vân',icon:'star',cost:18,color:'#c4a6e7'},
 {id:'heart',name:'Song tâm',icon:'heart',cost:27,color:'#f4c3ad'},
] as const;
export type AuraId=typeof AURAS[number]['id'];
export interface EconomySave {ownedAuras:AuraId[];equippedAura:AuraId|null;coinsGranted:number;xpGranted:number}
export function totalStars(stars:Record<number,number>){return Array.from({length:24},(_,i)=>Math.max(0,Math.min(3,Math.floor(Number(stars[i+1])||0)))).reduce((a,b)=>a+b,0);}
export function starWallet(stars:Record<number,number>,owned:readonly AuraId[]){return Math.max(0,totalStars(stars)-AURAS.filter(a=>owned.includes(a.id)).reduce((sum,a)=>sum+a.cost,0));}
export function normalizeEconomy(raw:any,stars:Record<number,number>):EconomySave {
 // Existing v2/v3 clear rewards are credited to the same lifetime ceilings.
 const legacyCoins=Object.keys(stars).reduce((sum,id)=>{const n=Number(id);return sum+(n>=1&&n<=24&&stars[n]>0?100+Math.ceil(n/6)*25:0);},0);
 const legacyXp=Object.keys(stars).reduce((sum,id)=>{const n=Number(id);return sum+(n>=1&&n<=24&&stars[n]>0?50+Math.ceil(n/6)*15:0);},0);
 let budget=totalStars(stars);const ownedAuras:AuraId[]=[];
 for(const a of AURAS){if(Array.isArray(raw?.ownedAuras)&&raw.ownedAuras.includes(a.id)&&budget>=a.cost){ownedAuras.push(a.id);budget-=a.cost;}}
 return {ownedAuras,equippedAura:ownedAuras.includes(raw?.equippedAura)?raw.equippedAura:null,coinsGranted:Math.max(0,Math.min(CAMPAIGN_COIN_CAP,Math.floor(Number(raw?.coinsGranted) || legacyCoins))),xpGranted:Math.max(0,Math.min(CAMPAIGN_XP_CAP,Math.floor(Number(raw?.xpGranted) || legacyXp)))};
}
export function clearReward(stageId:number,priorStars:number,nextStars:number,ledger:Pick<EconomySave,'coinsGranted'|'xpGranted'>){
 const earnedStars=Math.max(0,Math.min(3,nextStars)-Math.min(3,priorStars));
 const first=priorStars===0;
 const boss=first&&stageId%6===0;
 return {earnedStars,coins:Math.max(0,Math.min(CAMPAIGN_COIN_CAP-ledger.coinsGranted,(first?100:0)+earnedStars*10+(boss?195:0))),xp:Math.max(0,Math.min(CAMPAIGN_XP_CAP-ledger.xpGranted,(first?40:0)+earnedStars*10+(boss?105:0)))};
}
export function purchaseAura(stars:Record<number,number>,economy:EconomySave,id:AuraId):EconomySave|null {
 const aura=AURAS.find(a=>a.id===id);if(!aura)return null;
 if(economy.ownedAuras.includes(id))return {...economy,equippedAura:id};
 if(starWallet(stars,economy.ownedAuras)<aura.cost)return null;
 return {...economy,ownedAuras:[...economy.ownedAuras,id],equippedAura:id};
}
/** Bounded local audit trail + integration hook. No network or personal identifiers. */
export function recordEconomyEvent(kind:string,details:Record<string,string|number>){
 const event={version:ECONOMY_VERSION,kind,at:Date.now(),...details};
 try{const key='arcadex_eat_economy_events_v4';const raw=JSON.parse(localStorage.getItem(key)||'[]');const recent=Array.isArray(raw)?raw.slice(-49):[];localStorage.setItem(key,JSON.stringify([...recent,event]));}catch{/* Storage failure cannot block a match. */}
 if(typeof window!=='undefined'&&typeof window.CustomEvent==='function')window.dispatchEvent(new window.CustomEvent('arcadex:eat-economy',{detail:event}));
}
