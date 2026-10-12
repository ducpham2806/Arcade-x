import {test,expect} from '@playwright/test';
import {getLegalMovesForPiece,hasFlyingGenerals,isKingInCheck,type BoardMatrix} from '../../src/games/xiangqi/rules';
import {generateSudokuBoard,isBoardSolved,isSolvableWithEntry} from '../../src/games/scoodoku/generator';
test('QC-006: Xiangqi rejects move exposing own general to rook',()=>{
  const board:BoardMatrix=Array.from({length:10},()=>Array(9).fill(null));
  board[9][4]={id:'rk',type:'k',color:'r'};board[0][4]={id:'bk',type:'k',color:'b'};board[5][4]={id:'bp',type:'p',color:'b'};board[9][0]={id:'br',type:'r',color:'b'};board[9][2]={id:'rr',type:'r',color:'r'};
  expect(hasFlyingGenerals(board)).toBe(false);expect(getLegalMovesForPiece(board,9,2)).not.toContainEqual([8,2]);
});
function countSolutions(grid:number[][],bw:number,bh:number,n:number){let count=0;function solve(){if(count>=2)return;let target:[number,number]|null=null,opts:number[]=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!grid[r][c]){const candidates=[];for(let x=1;x<=n;x++){if(grid[r].includes(x)||grid.some(row=>row[c]===x))continue;let ok=true;for(let a=Math.floor(r/bh)*bh;a<Math.floor(r/bh)*bh+bh;a++)for(let b=Math.floor(c/bw)*bw;b<Math.floor(c/bw)*bw+bw;b++)if(grid[a][b]===x)ok=false;if(ok)candidates.push(x);}if(!candidates.length)return;if(!target||candidates.length<opts.length){target=[r,c];opts=candidates;}}if(!target){count++;return;}const[r,c]=target;for(const x of opts){grid[r][c]=x;solve();grid[r][c]=0;if(count>=2)return;}}solve();return count;}
test('QC-007: Sudoku generated puzzles have one solution',async({},info)=>{
  const original=Math.random;let seed=42;Math.random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
  const results:any[]=[];try{for(const [size,difficulty] of [['4x4','easy'],['4x4','medium'],['6x6','hard'],['9x9','medium'],['9x9','expert'],['staircase','expert'],['multigrid','hard']] as const){let multiple=0;for(let i=0;i<20;i++){const b=generateSudokuBoard(size,difficulty);if(countSolutions(b.cells.map(row=>row.map(c=>c.value||0)),b.boxWidth,b.boxHeight,b.dimension)!==1)multiple++;}results.push({size,difficulty,samples:20,multiple});}}finally{Math.random=original;}
  await info.attach('uniqueness-sample',{body:JSON.stringify(results),contentType:'application/json'});expect(results.every(r=>r.multiple===0)).toBe(true);
});

test('Xiangqi: cannon screen and horse leg exposure are illegal',()=>{
  const board:BoardMatrix=Array.from({length:10},()=>Array(9).fill(null));board[9][4]={id:'rk',type:'k',color:'r'};board[0][3]={id:'bk',type:'k',color:'b'};
  board[9][0]={id:'bc',type:'c',color:'b'};board[9][1]={id:'rp',type:'p',color:'r'};board[9][2]={id:'rr',type:'r',color:'r'};
  expect(isKingInCheck(board,'r')).toBe(false);expect(getLegalMovesForPiece(board,9,2)).not.toContainEqual([8,2]);
  board[9][0]=null;board[9][1]=null;board[9][2]=null;board[7][3]={id:'bh',type:'h',color:'b'};board[8][3]={id:'rr',type:'r',color:'r'};
  expect(isKingInCheck(board,'r')).toBe(false);expect(getLegalMovesForPiece(board,8,3)).not.toContainEqual([8,2]);
});
test('Xiangqi: king cannot enter a rook attack; crossed pawn attacks horizontally',()=>{
  const board:BoardMatrix=Array.from({length:10},()=>Array(9).fill(null));board[9][4]={id:'rk',type:'k',color:'r'};board[0][4]={id:'bk',type:'k',color:'b'};board[5][4]={id:'rp',type:'p',color:'r'};board[7][5]={id:'br',type:'r',color:'b'};
  expect(getLegalMovesForPiece(board,9,4)).not.toContainEqual([9,5]);expect(getLegalMovesForPiece(board,9,4)).toContainEqual([9,3]);
  board[9][4]=null;board[8][4]={id:'rk',type:'k',color:'r'};board[8][3]={id:'bp',type:'p',color:'b'};expect(isKingInCheck(board,'r')).toBe(true);
});
test('Sudoku: valid alternate solution from legacy puzzle is accepted',()=>{
  const b=generateSudokuBoard('4x4','easy');for(const row of b.cells)for(const c of row){c.value=null;c.isGiven=false;}
  const alternate=b.cells.map(row=>row.map(c=>c.solutionValue===1?2:c.solutionValue===2?1:c.solutionValue));
  const changed=b.cells.flat().find(c=>c.solutionValue===1)!;
  expect(isSolvableWithEntry(b,changed.row,changed.col,2)).toBe(true);
  const solved=b.cells.map((row,r)=>row.map((c,col)=>({...c,value:alternate[r][col]})));expect(isBoardSolved(solved)).toBe(true);
  solved[0][0].value=solved[0][1].value;expect(isBoardSolved(solved)).toBe(false);
});
