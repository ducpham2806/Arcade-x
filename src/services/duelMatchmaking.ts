/** Match near skill first; progressively widen according to the older entrant. */
export function rankQueue<T extends {id:string;data:{uid:string;elo?:number;createdAt?:number;lastHeartbeat?:number}}>(candidates:T[],uid:string,elo:number,now=Date.now(),waitingSince=now):T[]{
 return candidates.filter(({data})=>{
  const age=now-(data.createdAt||now);
  const range=Math.min(600,150+Math.floor(Math.max(0,age,now-waitingSince)/15000)*100);
  return data.uid!==uid && now-(data.lastHeartbeat||data.createdAt||now)<120000 && age>=-10000 && Math.abs((data.elo||1200)-elo)<=range;
 }).sort((a,b)=>Math.abs((a.data.elo||1200)-elo)-Math.abs((b.data.elo||1200)-elo)||(a.data.createdAt||now)-(b.data.createdAt||now));
}
