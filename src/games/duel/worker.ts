import {getBestChessMove} from '../chess/aiBot';
import {getBestBotMove} from '../caro-gomoku/aiBot';
import {getBestXiangqiMove} from '../xiangqi/aiBot';
self.onmessage=({data})=>{
 try{
  const {game,args,id}=data;
  const move=game==='chess'?getBestChessMove(...args as [string,any]):game==='xiangqi'?getBestXiangqiMove(...args as [any,any,any]):getBestBotMove(...args as [any,any,any]);
  self.postMessage({id,move});
 }catch(e){self.postMessage({id:data.id,error:String(e)});}
};
