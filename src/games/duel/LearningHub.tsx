import React,{useState,useEffect} from 'react';
import {Chess,Square} from 'chess.js';
import {caroWinner} from '../caro-gomoku/aiBot';
import {BoardMatrix,getLegalMovesForPiece,hasLegalMoves} from '../xiangqi/rules';
import {applyXiangqi} from '../xiangqi/aiBot';
import {completeLesson,readProgress,recordDuel,localDay,seasonId,DuelGame,saveProgress} from './progress';
import {botMove} from './aiClient';
const names:Record<string,string>={k:'Tướng',a:'Sĩ',e:'Tượng',r:'Xe',c:'Pháo',h:'Mã',p:'Tốt'};
const puzzles={
 'caro-gomoku':[{title:'Thắng trước khi phòng thủ',tip:'Khi cả hai bên cùng đe dọa, hãy tìm nước thắng ngay.',board:{'3_7':'X','3_3':'O','4_7':'O','5_7':'O','6_7':'O','7_7':'O','4_3':'X','5_3':'X','6_3':'X','7_3':'X','0_0':'X'}}],
 chess:[{title:'Chiếu hết một nước',tip:'Phối hợp Hậu và Vua; kiểm tra các ô thoát của Vua đen.',fen:'7k/8/6QK/8/8/8/8/8 w - - 0 1'},{title:'Chiếu hết với Xe',tip:'Đẩy Vua đen vào hàng cuối; Vua trắng bảo vệ hàng thoát.',fen:'7k/8/6K1/8/8/8/8/R7 w - - 0 1'}],
 xiangqi:[{title:'Xe phối hợp khóa Tướng',tip:'Tướng đen bị chặn hai bên. Đưa Xe vào đường chiếu trên cột giữa.'}]
};
function xiangqiPuzzle():BoardMatrix{const b:BoardMatrix=Array.from({length:10},()=>Array(9).fill(null));for(const [r,c,type,color] of [[0,4,'k','b'],[0,3,'p','b'],[0,5,'p','b'],[9,4,'k','r'],[1,0,'r','r'],[2,4,'p','r']] as const)b[r][c]={id:`${r}-${c}`,type,color};return b;}
export function LearningHub({game,lobby,roomId,ended,result,matchKey,ranked,board,onResume,onInvite}:{game:DuelGame;lobby:boolean;roomId?:string|null;ended?:boolean;result?:'win'|'loss'|'draw';matchKey?:string;ranked?:boolean;board?:unknown;onResume:(id:string)=>void;onInvite:()=>void}){
 const [open,setOpen]=useState(false),[tab,setTab]=useState('daily'),[progress,setProgress]=useState(()=>readProgress(game));
 const [selected,setSelected]=useState<number|null>(null),[message,setMessage]=useState(''),[answer,setAnswer]=useState<number[]>([]),[group,setGroup]=useState(''),[review,setReview]=useState<any[]>(()=>{try{return JSON.parse(localStorage.getItem(`arcadex_duel_review_${game}`)||'[]');}catch{return [];}}),[reviewIndex,setReviewIndex]=useState(0),[busy,setBusy]=useState(false);
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement as HTMLElement|null;
  const dialog=document.querySelector('[aria-label="Trung tâm kỳ thủ"]');
  const focusable=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select,a[href]')||[]);
  focusable()[0]?.focus();
  const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();setOpen(false);}if(e.key==='Tab'){const items=focusable(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}};
  window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);previous?.focus();};
 },[open]);
 const roomKey=`arcadex_duel_resume_${game}`;const [savedRoom,setSavedRoom]=useState(()=>localStorage.getItem(roomKey));
 const [retryState,setRetryState]=useState<any>(null),[retrySide,setRetrySide]=useState<'r'|'b'>('r');
 const day=localDay();const dailyIndex=[...day].reduce((a,c)=>a+c.charCodeAt(0),0)%puzzles[game].length;const puzzle:any=puzzles[game][dailyIndex];
 useEffect(()=>{if(roomId&&!ended){localStorage.setItem(roomKey,roomId);setSavedRoom(roomId);}else if(ended){localStorage.removeItem(roomKey);setSavedRoom(null);}},[roomId,ended]);
 useEffect(()=>{if(ended&&result&&matchKey)setProgress(recordDuel(game,matchKey,result,!!ranked));},[ended,result,matchKey,ranked]);
 useEffect(()=>{if(!lobby&&!ended){setReview([]);setReviewIndex(0);}},[lobby,ended]);
 useEffect(()=>{if(board===undefined||lobby)return;setReview(prev=>{const key=JSON.stringify(board);if(prev.length&&JSON.stringify(prev.at(-1))===key)return prev;return [...prev,structuredClone(board)].slice(-300);});},[board,lobby]);
 useEffect(()=>{if(ended&&review.length)localStorage.setItem(`arcadex_duel_review_${game}`,JSON.stringify(review));},[ended,review]);

 const success=(ok:boolean)=>{setMessage(ok?'Chính xác! Bài hôm nay đã hoàn thành.':'Chưa đúng. Hãy thử lại; bạn không mất điểm.');if(ok){setAnswer([]);setProgress(completeLesson(game,String(dailyIndex)));}};
 const solve=(index:number)=>{
  if(tab==='review'&&retryState!==null){
   if(game==='caro-gomoku'){const x=Math.floor(index/15),y=index%15;if(retryState[`${x}_${y}`])return;const values=Object.values(retryState),symbol=values.filter(v=>v==='X').length>values.filter(v=>v==='O').length?'O':'X';const next={...retryState,[`${x}_${y}`]:symbol};setRetryState(next);setMessage(caroWinner(next)?`${symbol} thắng.`:'Tiếp tục thử nước đi của bên còn lại.');return;}
   if(selected===null){setSelected(index);return;}
   const from=selected;setSelected(null);
   if(game==='chess'){const c=new Chess(retryState),square=(n:number)=>(String.fromCharCode(97+n%8)+(8-Math.floor(n/8))) as Square;try{c.move({from:square(from),to:square(index),promotion:'q'});setRetryState(c.fen());setMessage(c.isCheckmate()?'Chiếu hết.':c.isDraw()?'Hòa.':'Nước hợp lệ. Hãy thử tiếp nước đáp của đối thủ.');}catch{setMessage('Nước không hợp lệ.');}return;}
   const b=retryState as BoardMatrix,r=Math.floor(from/9),col=from%9,tr=Math.floor(index/9),tc=index%9;
   if(b[r][col]?.color!==retrySide||!getLegalMovesForPiece(b,r,col).some(([a,c])=>a===tr&&c===tc)){setMessage('Nước không hợp lệ.');return;}
   const next=applyXiangqi(b,{from:[r,col],to:[tr,tc]});setRetryState(next);setRetrySide(retrySide==='r'?'b':'r');setMessage('Nước hợp lệ.');return;
  }
  if(game==='caro-gomoku'){const x=Math.floor(index/15),y=index%15;if(puzzle.board[`${x}_${y}`])return;success(caroWinner({...puzzle.board,[`${x}_${y}`]:'O'})==='O');return;}
  if(selected===null){setSelected(index);return;}
  const from=selected;setSelected(null);
  if(game==='chess'){const c=new Chess(puzzle.fen);const square=(n:number)=>(String.fromCharCode(97+n%8)+(8-Math.floor(n/8))) as Square;try{c.move({from:square(from),to:square(index),promotion:'q'});success(c.isCheckmate());}catch{setMessage('Nước đi không hợp lệ. Chọn quân của bạn rồi ô đích.');}}
  else{const b=xiangqiPuzzle(),r=Math.floor(from/9),col=from%9,tr=Math.floor(index/9),tc=index%9;if(b[r][col]?.color!=='r'||!getLegalMovesForPiece(b,r,col).some(([a,c])=>a===tr&&c===tc)){setMessage('Nước đi không hợp lệ.');return;}success(!hasLegalMoves(applyXiangqi(b,{from:[r,col],to:[tr,tc]}),'b'));}
 };
 const renderBoard=(state:any,interactive=false)=>{
  const size=game==='chess'?8:game==='xiangqi'?9:15,rows=game==='xiangqi'?10:size;
  let cells:any[];if(game==='chess'){try{cells=new Chess(state).board().flat();}catch{return <p>Chưa có thế cờ để xem.</p>;}}
  else if(game==='xiangqi'){try{cells=(typeof state==='string'?JSON.parse(state):state).flat();}catch{return <p>Chưa có thế cờ.</p>;}}
  else cells=Array.from({length:rows*size},(_,n)=>state?.[`${Math.floor(n/size)}_${n%size}`]);
  return <div className="grid mx-auto w-full max-w-[440px] border border-slate-600" style={{gridTemplateColumns:`repeat(${size},minmax(0,1fr))`}}>{cells.map((p,n)=><button type="button" disabled={!interactive} aria-label={`${Math.floor(n/size)+1},${n%size+1}${p?': '+(game==='xiangqi'?names[p.type]:game==='chess'?p.type:p):''}`} key={n} onClick={()=>solve(n)} className={`aspect-square border border-slate-500 text-black ${selected===n?'!bg-amber-300':(Math.floor(n/size)+n%size)%2?'bg-[#b0c4ad]':'bg-[#f5edda]'}`} style={{color:p?.color==='r'?'#a21722':'#142c42',fontSize:game==='caro-gomoku'?11:20,opacity:1}}>{game==='chess'&&p?({wk:'♔',wq:'♕',wr:'♖',wb:'♗',wn:'♘',wp:'♙',bk:'♚',bq:'♛',br:'♜',bb:'♝',bn:'♞',bp:'♟'} as any)[p.color+p.type]:game==='xiangqi'&&p?names[p.type]:p||''}</button>)}</div>;
 };
 const analyze=async()=>{const state=review[Math.min(reviewIndex,review.length-1)];if(!state||busy)return;setBusy(true);try{
  let text='';if(game==='chess'){const move=await botMove<any>('chess',[state,'hard']);text=move?`Thử ${move.from} → ${move.to}.`: 'Thế cờ đã kết thúc.';}
  else if(game==='caro-gomoku'){const values=Object.values(state),symbol=values.filter(v=>v==='X').length>values.filter(v=>v==='O').length?'O':'X';const move=await botMove<any>('caro',[state,symbol,'hard']);text=`Thử hàng ${move.x+1}, cột ${move.y+1} với ${symbol}.`;}
  else{setMessage('Chọn bên Đỏ hoặc Đen để phân tích thế cờ.');setBusy(false);return;}
  setMessage(text+' So sánh với nước đã đi ở thế tiếp theo.');
 }catch{setMessage('Chưa phân tích được. Hãy thử lại.');}finally{setBusy(false);}};
 const seasonRecords=(progress.records||[]).filter((r:any)=>r.ranked&&r.season===seasonId());const wins=seasonRecords.filter((r:any)=>r.result==='win').length;
 return <>
 <div className="game-learning-tools w-full max-w-3xl flex flex-wrap gap-2 py-2 text-sm"><button type="button" onClick={()=>{setOpen(true);setMessage('');}} className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-500 text-white">Luyện tập · Xem lại · Mùa đấu</button>{lobby&&savedRoom&&<button type="button" className="px-3 py-2 rounded-xl bg-indigo-700 text-white" onClick={()=>onResume(savedRoom)}>Trở lại phòng gần nhất</button>}</div>
 {open&&<div role="dialog" aria-modal="true" aria-label="Trung tâm kỳ thủ" className="fixed inset-0 z-[80] bg-slate-950/95 flex items-center justify-center p-0 sm:p-4"><section className="bg-slate-900 text-slate-100 w-full h-full sm:h-[92vh] sm:max-h-[900px] sm:max-w-4xl rounded-none sm:rounded-2xl flex flex-col border border-slate-600"><header className="p-4 flex justify-between"><div><h2 className="text-xl font-bold">Trung tâm kỳ thủ</h2>{roomId&&!ended&&<p className="text-xs text-amber-200">Đồng hồ trận online vẫn tiếp tục khi mở bảng này.</p>}</div><button type="button" aria-label="Đóng" onClick={()=>setOpen(false)}>✕</button></header><nav className="flex flex-wrap gap-2 px-4 pb-3">{[['daily','Bài hằng ngày'],['review','Xem lại trận'],['season','Mùa đấu'],['friends','Nhóm bạn']].map(([id,label])=><button type="button" aria-pressed={tab===id} key={id} onClick={()=>{setTab(id);setSelected(null);setMessage('');}} className={`rounded-lg px-3 py-2 ${tab===id?'bg-indigo-600':'bg-slate-800'}`}>{label}</button>)}</nav><div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
 {tab==='daily'&&<><h3 className="text-lg font-bold">{puzzle.title}</h3><p>{puzzle.tip}</p><p className="text-sm">{game==='caro-gomoku'?'Bạn cầm O. Chọn một ô để thắng ngay.':'Chọn quân của bạn rồi ô đích.'} · {day}</p>{renderBoard(game==='chess'?puzzle.fen:game==='xiangqi'?xiangqiPuzzle():puzzle.board,true)}<p role="status">{message}</p><p>Đã giải {progress.total||0} bài · Chuỗi {progress.streak||0} ngày</p><p>Giải 3 bài để mở huy hiệu 🌱 · 10 bài để mở 🧠</p></>}
 {tab==='review'&&<><p>Xem các thế cờ của trận đang chơi. Phân tích chỉ mở sau khi trận kết thúc.</p>{review.length>0?<><input aria-label="Chọn lượt xem lại" type="range" min="0" max={review.length-1} value={Math.min(reviewIndex,review.length-1)} onChange={e=>{setReviewIndex(Number(e.target.value));setRetryState(null);setSelected(null);setMessage('');}} className="w-full"/>{renderBoard(review[Math.min(reviewIndex,review.length-1)])}<p>Thế {reviewIndex+1}/{review.length}</p><button type="button" disabled={(!ended&&!lobby)||busy} className="rounded-lg px-3 py-2 bg-indigo-600 disabled:bg-slate-700" onClick={analyze}>{busy?'Đang phân tích…':'Gợi ý nước đi'}</button>{game==='xiangqi'&&(ended||lobby)&&(['r','b'] as const).map(color=><button className="p-2 bg-slate-700 rounded-lg ml-2" type="button" disabled={busy} key={color} onClick={async()=>{setBusy(true);try{const state=review[Math.min(reviewIndex,review.length-1)];const m=await botMove<any>('xiangqi',[typeof state==='string'?JSON.parse(state):state,color,'hard']);setMessage(m?`${color==='r'?'Đỏ':'Đen'}: ${m.from.map((n:number)=>n+1).join(',')} → ${m.to.map((n:number)=>n+1).join(',')}`:'Bên này không còn nước hợp lệ.');}finally{setBusy(false);}}}>{color==='r'?'Phân tích Đỏ':'Phân tích Đen'}</button>)}<button type="button" disabled={!ended&&!lobby} className="p-2 rounded-lg bg-slate-700" onClick={()=>{const state=review[Math.min(reviewIndex,review.length-1)];setRetryState(game==='xiangqi'&&typeof state==='string'?JSON.parse(state):structuredClone(state));setSelected(null);setMessage('Bàn thử riêng: các nước ở đây không thay đổi kết quả trận.');}}>Thử lại từ thế này</button>{retryState!==null&&<><h3>Bàn thử nước đi</h3>{game==='xiangqi'&&<button type="button" className="p-2 bg-slate-800 rounded" onClick={()=>setRetrySide(retrySide==='r'?'b':'r')}>Bên đi: {retrySide==='r'?'Đỏ':'Đen'}</button>}{renderBoard(retryState,true)}</>}<p role="status">{message}</p></>:<p>Bắt đầu một trận để lưu nước đi và xem lại ở đây.</p>}</>}
 {tab==='season'&&<><h3>Mùa {seasonId()}</h3><p>Thống kê trận online của bạn trong mùa: {seasonRecords.length} trận · {wins} thắng</p><p>Huy hiệu: {wins>=20?'🏆 Bậc thầy':wins>=5?'⚔️ Đấu sĩ':'🌱 Khởi đầu'}</p><p>ELO chính thức vẫn được tính theo kết quả trận online. Bài luyện và đấu máy không tăng thống kê mùa.</p><p>Huy hiệu luyện tập: {(progress.total||0)>=10?'🧠 Nhà chiến thuật':(progress.total||0)>=3?'🌱 Chăm luyện':'Chưa mở'}</p><p className="text-sm">Thống kê mùa và danh sách nhóm được lưu cùng tiến trình tài khoản; đây là hồ sơ cá nhân, chưa phải bảng xếp hạng mùa toàn máy chủ.</p></>}
 {tab==='friends'&&<><p>Lưu tên nhóm bạn để tổ chức các buổi đấu phòng riêng.</p><form onSubmit={e=>{e.preventDefault();const name=group.trim();if(!name)return;const p=readProgress(game);p.groups=Array.from(new Set([...(p.groups||[]),name])).slice(-20);saveProgress(game,p);setProgress(p);setGroup('');}} className="flex gap-2"><input aria-label="Tên nhóm" maxLength={40} value={group} onChange={e=>setGroup(e.target.value)} className="bg-slate-800 border rounded-lg p-2 text-white" required/><button className="p-2 bg-indigo-600 rounded-lg">Thêm nhóm</button></form>{(progress.groups||[]).map((name:string)=><div key={name} className="flex gap-3 items-center"><span>{name}</span><button type="button" onClick={()=>{setOpen(false);onInvite();}} className="bg-indigo-600 p-2 rounded-lg">Mở phòng mời bạn</button><button type="button" aria-label={`Xóa nhóm ${name}`} onClick={()=>{const p=readProgress(game);p.groups=(p.groups||[]).filter((n:string)=>n!==name);saveProgress(game,p);setProgress(p);}}>✕</button></div>)}<p>Tạo phòng riêng, sao chép mã hoặc link và gửi cho bạn bè. Nhóm ở đây là danh sách cá nhân.</p></>}
 </div></section></div>}
 </>;
}
