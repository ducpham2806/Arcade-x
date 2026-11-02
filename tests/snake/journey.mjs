import {build} from 'esbuild';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {pathToFileURL} from 'node:url';
const temp=mkdtempSync(path.join(tmpdir(),'snake-journey-'));
try{const file=path.join(temp,'test.cjs');await build({entryPoints:['tests/snake/journey.test.ts'],bundle:true,platform:'node',format:'cjs',outfile:file});await import(pathToFileURL(file).href);}finally{rmSync(temp,{recursive:true,force:true});}
