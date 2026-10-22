import type {RentalGrant} from './types';
/** Review-only proposal. No persistent grant changes or financial compensation. */
export function maintenanceCreditMs(grant: RentalGrant, incidents: {startsAt:string;endsAt:string;gameIds:string[];allGames:boolean}[]): number {
 const start=Date.parse(grant.startsAt), end=Date.parse(grant.expiresAt);
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start)throw new Error('invalid_grant_dates');
 if(grant.revokedAt)return 0;
 // For multi-game/Pass grants only full-coverage downtime qualifies automatically.
 // Partial catalog outages require manual assessment; do not multiply by game count.
 const ranges: [number,number][]=[];
 for(const i of incidents){
  const a=Date.parse(i.startsAt),b=Date.parse(i.endsAt);
  if(!Number.isFinite(a)||!Number.isFinite(b)||b<=a)throw new Error('invalid_incident_dates');
  if(!i.allGames&&(grant.allGames||!grant.gameIds.length||!grant.gameIds.every(g=>i.gameIds.includes(g))))continue;
  const from=Math.max(start,a),to=Math.min(end,b);
  if(to>from)ranges.push([from,to]);
 }
 ranges.sort((a,b)=>a[0]-b[0]);let total=0,left:number|null=null,right=0;
 for(const [a,b] of ranges){if(left===null||a>right){if(left!==null)total+=right-left;left=a;right=b}else right=Math.max(right,b)}
 return total+(left===null?0:right-left);
}
