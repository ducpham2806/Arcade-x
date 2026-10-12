const path=require('node:path'),fs=require('node:fs');
const {setup,launch,drag}=require('./helpers.cjs');
const dir=process.env.QC_ARTIFACTS||path.join(process.cwd(),'test-results','manual');fs.mkdirSync(dir,{recursive:true});
(async()=>{const {browser,page}=await setup({width:390,height:844});const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
  await launch(page,'shikaku');await page.getByRole('button',{name:'Chơi thư giãn',exact:true}).click();
  const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('arcadex_save_v1_shikaku')).payload);
  const s=await read();const b=await page.getByTestId('shikaku-board').boundingBox();
  await page.screenshot({path:path.join(dir,'shikaku-before.png')});
  for(const r of s.puzzle.solution)await drag(page,[{x:b.x+(r.c+.5)*b.width/s.puzzle.size,y:b.y+(r.r+.5)*b.height/s.puzzle.size},{x:b.x+(r.c+r.w-.5)*b.width/s.puzzle.size,y:b.y+(r.r+r.h-.5)*b.height/s.puzzle.size}]);
  await page.getByRole('button',{name:'Câu tiếp theo'}).waitFor();
  await page.screenshot({path:path.join(dir,'shikaku-complete.png')});
  const after=await read();if(!after.completed||after.score!==1||errors.length)throw Error(JSON.stringify({after,errors}));
  await page.getByRole('button',{name:'Câu tiếp theo'}).click();if((await read()).completed)throw Error('Next puzzle did not start');
  fs.writeFileSync(path.join(dir,'shikaku-repro.json'),JSON.stringify({passed:true,score:after.score,completed:true,nextPuzzle:true,errors},null,2));console.log('Shikaku manual browser flow PASS');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
