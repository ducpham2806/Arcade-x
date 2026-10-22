// esbuild is provided by the project's existing Vite toolchain.
import {build} from 'esbuild';
import {mkdir,rm} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const output=path.resolve('.eat-test-tmp');
await mkdir(output,{recursive:true});
try {
  for(const name of ['campaign','rhythm','art','economy','victory','ui-flow']) {
    const entry=`tests/eat-em-all/${name}.test.${name==='ui-flow'?'tsx':'ts'}`;
    const outfile=path.join(output,`${name}.mjs`);
    await build({entryPoints:[entry],bundle:true,platform:'node',format:'esm',outfile,packages:'external',loader:{'.css':'empty','.webp':'dataurl'},plugins:name==='ui-flow'?[{name:'callback-harness',setup(b){b.onLoad({filter:/EatEmAllCanvas\.tsx$/},()=>({contents:'export const EatEmAllCanvas=(props)=>{globalThis.__eatProps=props;return null}',loader:'js'}));}}]:[]});
    await import(pathToFileURL(outfile).href);
  }
}finally{await rm(output,{recursive:true,force:true});}
