import source from './worker-source.json';
export function botMove<T>(game:'chess'|'xiangqi'|'caro',args:unknown[],signal?:AbortSignal):Promise<T>{
 return new Promise((resolve,reject)=>{
  if(signal?.aborted){reject(new DOMException('Cancelled','AbortError'));return;}
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  let worker:Worker;
  try{worker=new Worker(url);}catch(e){URL.revokeObjectURL(url);reject(e);return;}
  const cleanup=()=>{clearTimeout(timer);worker.terminate();URL.revokeObjectURL(url);signal?.removeEventListener('abort',abort);};
  const abort=()=>{cleanup();reject(new DOMException('Cancelled','AbortError'));};
  const timer=setTimeout(()=>{cleanup();reject(new Error('Bot chưa phản hồi. Hãy thử lại ván đấu.'));},10000);
  signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=({data})=>{cleanup();data.error?reject(new Error(data.error)):resolve(data.move);};
  worker.onerror=(event)=>{cleanup();reject(new Error(event.message||'Không chạy được bot.'));};
  worker.postMessage({id:1,game,args});
 });
}
