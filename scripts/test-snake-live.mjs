import {build} from 'esbuild';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
if(!process.argv.includes('--live'))throw Error('Explicit --live required');
const temp=mkdtempSync(path.join(tmpdir(),'snake-live-'));
try{const file=path.join(temp,'test.mjs');await build({entryPoints:['tests/snake/live-save.test.ts'],bundle:true,platform:'node',format:'esm',outfile:file,external:['node:*']});await import(pathToFileURL(file).href);}finally{rmSync(temp,{recursive:true,force:true});}
