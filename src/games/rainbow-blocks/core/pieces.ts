export const KINDS = ['I','O','T','S','Z','J','L'] as const;
export type Kind = typeof KINDS[number];
export type Cell = [number,number];
export type Piece = {kind:Kind;x:number;y:number;rotation:number};
const base:Record<Kind,Cell[]> = {
 I:[[0,1],[1,1],[2,1],[3,1]], O:[[1,0],[2,0],[1,1],[2,1]],
 T:[[1,0],[0,1],[1,1],[2,1]], S:[[1,0],[2,0],[0,1],[1,1]],
 Z:[[0,0],[1,0],[1,1],[2,1]], J:[[0,0],[0,1],[1,1],[2,1]], L:[[2,0],[0,1],[1,1],[2,1]],
};
export function shape(kind:Kind,rotation=0):Cell[]{
 let cells=base[kind].map(c=>[...c] as Cell);
 if(kind==='O')return cells;
 const size=kind==='I'?4:3;
 for(let r=0;r<rotation;r++)cells=cells.map(([x,y])=>[size-1-y,x]);
 return cells;
}
export const cells=(p:Piece):Cell[]=>shape(p.kind,p.rotation).map(([x,y])=>[x+p.x,y+p.y]);
// SRS uses an upward Y axis; negate it when applying to the downward board.
const normal:Record<string,Cell[]>={
 '0>1':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
 '1>0':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
 '1>2':[[0,0],[1,0],[1,-1],[0,2],[1,2]],
 '2>1':[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],
 '2>3':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
 '3>2':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
 '3>0':[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],
 '0>3':[[0,0],[1,0],[1,1],[0,-2],[1,-2]],
};
const line:Record<string,Cell[]>={
 '0>1':[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
 '1>0':[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
 '1>2':[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
 '2>1':[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
 '2>3':[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],
 '3>2':[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],
 '3>0':[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],
 '0>3':[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],
};
export const kicks=(kind:Kind,from:number,to:number):Cell[]=>kind==='O'?[[0,0]]:(kind==='I'?line:normal)[`${from}>${to}`];
