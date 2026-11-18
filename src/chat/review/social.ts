// Staging harness only exercises native match transports, never production social data.
export async function socialAction(_actor:string,action:string):Promise<any>{
 if(['read','inbox','relations','search'].includes(action))return [];
 if(action==='heartbeat')return {};
 throw new Error('Bản staging này chỉ mở chat Trận.');
}
export function watchSocial<T>(read:()=>Promise<T>,receive:(data:T)=>void,fail:(e:Error)=>void,ms=5000){let alive=true;const run=()=>read().then(data=>{if(alive)receive(data);}).catch(e=>{if(alive)fail(e);});void run();const timer=setInterval(()=>{if(!document.hidden&&navigator.onLine)void run();},ms);return()=>{alive=false;clearInterval(timer);};}
