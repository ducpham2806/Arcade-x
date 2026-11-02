// Perspective board maths (src/games/battleship/projection.ts): every cell centre maps back to
// its own cell, near rows draw larger than far rows, and points off the board hit nothing.
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const out=mkdtempSync(join(tmpdir(),'battleship-projection-'));const req=createRequire(import.meta.url);
await build({entryPoints:['src/games/battleship/projection.ts'],bundle:true,platform:'node',format:'cjs',outfile:join(out,'projection.cjs'),logLevel:'silent'});
const {boardCamera,cellAt,cellPercent,BOARD_CANVAS}=req(join(out,'projection.cjs'));
const cam=boardCamera();let checks=0;
for(const size of [10,14])for(let row=0;row<size;row++)for(let col=0;col<size;col++){
 const p=cam.project((col+.5)/size,(row+.5)/size);
 assert.ok(p.x>0&&p.x<BOARD_CANVAS.width&&p.y>0&&p.y<BOARD_CANVAS.height,`cell ${row},${col} of ${size} is off canvas`);
 assert.deepEqual(cellAt(cam,p.x,p.y,size),{row,col});
 const q=cam.unproject(p.x,p.y);assert.ok(Math.abs(q.u-(col+.5)/size)<1e-9&&Math.abs(q.v-(row+.5)/size)<1e-9);checks++;
}
const far=cam.project(1,0).x-cam.project(0,0).x,near=cam.project(1,1).x-cam.project(0,1).x;
assert.ok(near>far*1.15,'near edge should be wider than the far edge');
const above=cam.project(.5,.5,.1),water=cam.project(.5,.5,0);assert.ok(above.y<water.y,'height lifts points up the screen');
assert.equal(cellAt(cam,4,4,10),null);assert.equal(cellAt(cam,BOARD_CANVAS.width/2,BOARD_CANVAS.height-4,10),null);
const pc=cellPercent(cam,0,0,10);assert.ok(pc.x>0&&pc.x<100&&pc.y>0&&pc.y<100);
console.log(`battleship projection: ${checks+4} checks passed`);
