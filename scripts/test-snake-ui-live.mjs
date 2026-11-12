import {build} from 'esbuild';
import {mkdtemp,rm,mkdir} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

// No credentials are read by Vite, written to disk, or passed on the command line.
// Keep this separate from Playwright Test: its traces/error-context can include login inputs.
const args=process.argv.slice(2);
if(args.some(arg=>!['--preflight','--live','--wait-for-expiry'].includes(arg)) || (args.includes('--wait-for-expiry')&&!args.includes('--live')) ||
   Number(args.includes('--preflight'))+Number(args.includes('--live'))!==1){
 console.error('Use --preflight or --live [--wait-for-expiry]');process.exitCode=2;
}else{
 await mkdir('test-results',{recursive:true});
 const temp=await mkdtemp(path.resolve('test-results/.snake-ui-live-'));
 try{
  const file=path.join(temp,'runner.mjs');
  await build({entryPoints:['tests/snake/ui-live-runner.ts'],bundle:true,platform:'node',format:'esm',outfile:file,external:['node:*','@playwright/test','@supabase/supabase-js','vite']});
  const {run}=await import(pathToFileURL(file).href);await run({live:args.includes('--live'),waitForExpiry:args.includes('--wait-for-expiry')});
 }catch{
  // Do not print SDK/browser errors: they can embed identity, HTTP bodies or filled inputs.
  console.error('Snake live UI runner failed. See its last stage; no raw exception was logged.');process.exitCode=1;
 }finally{await rm(temp,{recursive:true,force:true});}
}
