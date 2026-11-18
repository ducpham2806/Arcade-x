const feeds=new Map<string,any[]>(),listeners=new Set<()=>void>();let sequence=0,fail=false;
const key=(scope:string,target:string)=>scope+':'+target;
const profile={id:'review-B',username:'Bình',avatar:'🐱',level:3,bio:'',favorite:'caro-gomoku',online:true};
function messages(scope:string,target:string){const k=key(scope,target);if(!feeds.has(k))feeds.set(k,[{id:'history-'+k,sender:'review-B',text:'Chào bạn! Cùng chơi nhé.',profile,created_at:new Date(Date.now()-10000).toISOString()}]);return feeds.get(k)!;}
export async function socialAction(actor:string,action:string,target='',text='',scope='global'):Promise<any>{
 if(action==='read')return messages(scope,target);
 if(action==='send'){if(fail)throw Error('Mất kết nối thử nghiệm');messages(scope,target).push({id:'sent-'+(++sequence),sender:actor,text,profile:{...profile,id:actor,username:'Bạn',avatar:'🎮'},created_at:new Date().toISOString()});listeners.forEach(fn=>fn());return {};}
 if(action==='relations')return [{sender:'review-B',target:actor,status:'accepted',profile}];
 if(action==='inbox')return [];
 if(action==='profile')return profile;
 return [];
}
export function watchSocial(read:()=>Promise<any>,receive:(data:any)=>void,error:(e:Error)=>void){let disposed=false;const run=()=>read().then(data=>{if(!disposed)receive(data);}).catch(error);listeners.add(run);void run();return()=>{disposed=true;listeners.delete(run);};}
(window as any).chatFixture={incoming:(scope='global',target='')=>{messages(scope,target).push({id:'incoming-'+(++sequence),sender:'review-B',text:'Nước này hay quá! 👏',profile,created_at:new Date().toISOString()});listeners.forEach(fn=>fn());},fail:(value:boolean)=>{fail=value;},watchers:()=>listeners.size};
