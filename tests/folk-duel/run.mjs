import {build} from 'esbuild';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const directory=mkdtempSync(path.join(tmpdir(),'arcadex-folk-'));
try{
 const file=path.join(directory,'tests.mjs');
 await build({entryPoints:['tests/folk-duel/folk-games.test.ts'],bundle:true,platform:'node',format:'esm',outfile:file});
 await import(pathToFileURL(file).href);
}finally{rmSync(directory,{recursive:true,force:true});}
