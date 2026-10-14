export type DuelGame='chess'|'xiangqi'|'caro-gomoku';
export const localDay=(date=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
export const seasonId=(date=new Date())=>localDay(date).slice(0,7);
export function readProgress(game:DuelGame){try{return JSON.parse(localStorage.getItem(`arcadex_duel_${game}`)||'{}');}catch{return {};}}
export function saveProgress(game:DuelGame,p:any){localStorage.setItem(`arcadex_duel_${game}`,JSON.stringify(p));}
export function completeLesson(game:DuelGame,id:string,day=localDay()){
 const p=readProgress(game);p.solved=p.solved||{};const key=`${day}:${id}`;if(p.solved[key])return p;
 p.solved[key]=true;const previous=localDay(new Date(Date.now()-86400000));
 if(p.lastDay!==day)p.streak=p.lastDay===previous?(p.streak||0)+1:1;
 p.lastDay=day;p.total=(p.total||0)+1;saveProgress(game,p);return p;
}
export function recordDuel(game:DuelGame,id:string,result:'win'|'loss'|'draw',ranked:boolean){
 const p=readProgress(game);p.records=p.records||[];if(p.records.some((r:any)=>r.id===id))return p;
 p.records.unshift({id,result,ranked,season:seasonId(),at:Date.now()});p.records=p.records.slice(0,300);saveProgress(game,p);return p;
}
