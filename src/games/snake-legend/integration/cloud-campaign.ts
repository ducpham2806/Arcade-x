import {CAMPAIGN_KEY,parseCampaign,type Campaign,type StorageLike,type Stars} from '../src/story-save';
import type {VerifiedResult} from './verified-result';

// Campaign unlocks are monotonic. Local progress is never submitted as verified
// proof, and cloud wallet values never enter local campaign/checkpoint storage.
export function mergeCampaigns(local:Campaign,remote:Campaign):Campaign{
 local=parseCampaign(JSON.stringify(local));remote=parseCampaign(JSON.stringify(remote));
 const levels={...local.levels};
 for(const [id,p] of Object.entries(remote.levels)){
  const old=levels[id];
  levels[id]=old?{stars:p.stars.map((v,i)=>v||old.stars[i]) as Stars,bestTime:Math.min(p.bestTime,old.bestTime),bestScore:Math.max(p.bestScore,old.bestScore)}:structuredClone(p);
 }
 return {...local,levels,secrets:[...new Set([...local.secrets,...remote.secrets])]};
}

export function hydrateCampaign(store:StorageLike,snapshot:VerifiedResult['snapshot']):boolean{
 const remote=parseCampaign(JSON.stringify({version:1,contentVersion:'r01-10-v1',levels:snapshot.levels,secrets:snapshot.secrets,receipts:[]}));
 const local=parseCampaign(store.getItem(CAMPAIGN_KEY));
 const next=mergeCampaigns(local,remote),raw=JSON.stringify(next);
 if(raw===JSON.stringify(local))return false;
 store.setItem(CAMPAIGN_KEY,raw);return true;
}
