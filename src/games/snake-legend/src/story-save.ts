import {assertSchema} from './schema';
import {campaignSchema,clearSchema} from './contracts';
export const CAMPAIGN_KEY='snake-legend:r01-blockout:v1';
export type Stars=[boolean,boolean,boolean];
export type Progress={stars:Stars;bestTime:number;bestScore:number};
export type Campaign={version:1;contentVersion:'r01-10-v1';levels:Record<string,Progress>;secrets:string[];receipts:string[]};
export type StorageLike=Pick<Storage,'getItem'|'setItem'>;
export type Clear={runId:string;levelId:string;time:number;score:number;stars:Stars;secret?:boolean};
export const blankCampaign=():Campaign=>({version:1,contentVersion:'r01-10-v1',levels:{},secrets:[],receipts:[]});
export function parseCampaign(raw:string|null):Campaign{
 if(raw===null)return blankCampaign();if(raw.length>65536)throw Error('Campaign too large');const d=JSON.parse(raw);assertSchema(campaignSchema,d);
 if(!d||d.version!==1||!['r01-3-v1','r01-6-v1','r01-10-v1'].includes(d.contentVersion)||!d.levels||Array.isArray(d.levels)||typeof d.levels!=='object'||!Array.isArray(d.receipts)||d.receipts.length>128||!d.receipts.every((r:unknown)=>typeof r==='string'&&r.length<100))throw Error('Tiến trình lưu không hợp lệ');
 for(const [id,p] of Object.entries(d.levels) as [string,Progress][]){if(!['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','1-9','1-10'].includes(id)||!p||!Array.isArray(p.stars)||p.stars.length!==3||!p.stars.every(v=>typeof v==='boolean')||p.stars[0]!==true||!Number.isFinite(p.bestTime)||p.bestTime<=0||!Number.isSafeInteger(p.bestScore)||p.bestScore<0)throw Error('Tiến trình lưu không hợp lệ');}
 if(d.secrets!==undefined&&(!Array.isArray(d.secrets)||d.secrets.some((id:unknown)=>id!=='r01')))throw Error('Invalid secrets');return {...d,secrets:d.secrets??[],contentVersion:'r01-10-v1'};
}
export function loadCampaign(store:StorageLike):{data:Campaign;error:string}{try{return {data:parseCampaign(store.getItem(CAMPAIGN_KEY)),error:''};}catch{return {data:blankCampaign(),error:'Không đọc được tiến trình. Bản cũ được giữ nguyên; lượt chơi mới vẫn hoạt động.'};}}
export function mergeClear(data:Campaign,run:Clear):Campaign{
 assertSchema(clearSchema,run);
 if(!['1-1','1-2','1-3','1-4','1-5','1-6','1-7','1-8','1-9','1-10'].includes(run.levelId)||!run.runId||run.runId.length>=100||!Number.isFinite(run.time)||run.time<=0||!Number.isSafeInteger(run.score)||run.score<0||run.stars.length!==3||!run.stars.every(v=>typeof v==='boolean')||!run.stars[0])throw Error('Invalid clear');
 if(run.secret!==undefined&&typeof run.secret!=='boolean')throw Error('Invalid secret');if(run.secret&&run.levelId!=='1-8')throw Error('Invalid secret source');
 if(data.receipts.includes(run.runId))return data;
 const old=data.levels[run.levelId];const stars=run.stars.map((v,i)=>v||!!old?.stars[i]) as Stars;
 return {...data,secrets:run.secret?['r01']:data.secrets,levels:{...data.levels,[run.levelId]:{stars,bestTime:Math.min(old?.bestTime??Infinity,run.time),bestScore:Math.max(old?.bestScore??0,run.score)}},receipts:[...data.receipts,run.runId].slice(-128)};
}
export function saveClear(store:StorageLike,run:Clear):Campaign{const old=parseCampaign(store.getItem(CAMPAIGN_KEY)),next=mergeClear(old,run);store.setItem(CAMPAIGN_KEY,JSON.stringify(next));return next;}
export const isUnlocked=(data:Campaign,index:number)=>index===0||Boolean(data.levels[`1-${index}`]?.stars[0]);

export function saveClears(store:StorageLike,runs:Clear[]):Campaign{let next=parseCampaign(store.getItem(CAMPAIGN_KEY));for(const run of runs)next=mergeClear(next,run);store.setItem(CAMPAIGN_KEY,JSON.stringify(next));return next;}
