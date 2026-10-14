import { BoardMatrix, cloneBoard, getLegalMovesForPiece, findKing, PieceColor } from './rules';
export type XiangqiMove = { from: [number,number]; to: [number,number] };
const VALUES: Record<string,number>={k:100000,r:900,c:450,h:400,e:200,a:200,p:100};
const opposite=(c:PieceColor):PieceColor=>c==='r'?'b':'r';
export function xiangqiMoves(board:BoardMatrix,color:PieceColor):XiangqiMove[]{
 const moves:XiangqiMove[]=[];
 for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(board[r][c]?.color===color)
  for(const to of getLegalMovesForPiece(board,r,c))moves.push({from:[r,c],to});
 return moves.sort((a,b)=>(VALUES[board[b.to[0]][b.to[1]]?.type||'']||0)-(VALUES[board[a.to[0]][a.to[1]]?.type||'']||0));
}
export function applyXiangqi(board:BoardMatrix,m:XiangqiMove){const b=cloneBoard(board);b[m.to[0]][m.to[1]]=b[m.from[0]][m.from[1]];b[m.from[0]][m.from[1]]=null;return b;}
export function evaluateXiangqi(board:BoardMatrix,color:PieceColor):number{
 if(!findKing(board,color))return -1000000;
 if(!findKing(board,opposite(color)))return 1000000;
 let score=0;
 for(let r=0;r<10;r++)for(let c=0;c<9;c++){
  const p=board[r][c];if(!p)continue;
  const advance=p.color==='r'?9-r:r;
  const bonus=p.type==='p'?(advance>=5?80:0)+advance*5:p.type==='h'||p.type==='c'?12-Math.abs(4-c)*3:0;
  score+=(p.color===color?1:-1)*((VALUES[p.type]||0)+bonus);
 }
 return score;
}
export function getBestXiangqiMove(board:BoardMatrix,botColor:PieceColor='b',difficulty:'easy'|'medium'|'hard'='hard'):XiangqiMove|null{
 const moves=xiangqiMoves(board,botColor);if(!moves.length)return null;
 const deadline=performance.now()+(difficulty==='hard'?700:250);
 const timeout={};
 const search=(b:BoardMatrix,color:PieceColor,depth:number,alpha:number,beta:number):number=>{
  if(performance.now()>deadline)throw timeout;
  if(!findKing(b,color))return -1000000-depth;
  if(!findKing(b,opposite(color)))return 1000000+depth;
  if(!depth)return evaluateXiangqi(b,color);
  const options=xiangqiMoves(b,color);if(!options.length)return -1000000-depth;
  let best=-Infinity;
  for(const m of options){const v=-search(applyXiangqi(b,m),opposite(color),depth-1,-beta,-alpha);best=Math.max(best,v);alpha=Math.max(alpha,v);if(alpha>=beta)break;}
  return best;
 };
 let best=moves[0];
 for(let depth=1;depth<=(difficulty==='easy'?1:difficulty==='medium'?2:3);depth++){
  let candidate=best,value=-Infinity;
  try{
   for(const m of moves){let v=-search(applyXiangqi(board,m),opposite(botColor),depth-1,-Infinity,Infinity);if(difficulty==='easy')v+=Math.random()*140;if(v>value){value=v;candidate=m;}}
   best=candidate;
  }catch(e){if(e!==timeout)throw e;break;}
 }
 return best;
}
