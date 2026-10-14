import {build} from 'esbuild';
import fs from 'node:fs';
const {outputFiles}=await build({entryPoints:['src/games/duel/worker.ts'],bundle:true,write:false,format:'iife',minify:true});
fs.writeFileSync('src/games/duel/worker-source.json',JSON.stringify(outputFiles[0].text));
