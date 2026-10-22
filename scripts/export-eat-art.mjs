import {build} from 'esbuild';
import {mkdir,writeFile,rm,stat} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
const tmp=path.resolve('.eat-art-export.mjs');
try{
 await build({entryPoints:['src/games/eat-em-all/art.ts'],bundle:true,platform:'node',format:'esm',outfile:tmp,loader:{'.webp':'dataurl'}});
 const {ART_SOURCES}=await import(pathToFileURL(tmp).href);
 const destination='src/games/eat-em-all/assets/svg';await mkdir(destination,{recursive:true});
 const manifest={version:3,style:'storybook-fantasy',lighting:'upper-left',background:'world.webp',assets:[]};
 for(const [key,source] of Object.entries(ART_SOURCES)){
  if(Buffer.byteLength(source)>8*1024)throw Error(`${key} exceeds 8 KiB SVG budget`);
  if(/<script|<foreignObject|https?:\/\/(?!www.w3.org)/.test(source))throw Error(`Unexpected external or executable SVG content: ${key}`);
  const size=key.startsWith('nom')?256:key.startsWith('guardian')?320:128;
  await writeFile(`${destination}/${key}.svg`,source);
  manifest.assets.push({id:key,file:`svg/${key}.svg`,width:size,height:size,pivot:[.5,.5],rasterCache:key.startsWith('guardian')?256:key.startsWith('nom')?192:96,bytes:Buffer.byteLength(source)});
 }
 const worldBytes=(await stat('src/games/eat-em-all/assets/world.webp')).size;if(worldBytes>250*1024)throw Error('World bitmap budget exceeded');
 manifest.worldBytes=worldBytes;manifest.sourceCount=manifest.assets.length;
 await writeFile('src/games/eat-em-all/assets/manifest.json',JSON.stringify(manifest,null,2)+'\n');
 console.log(`Exported ${manifest.assets.length} SVG assets; world ${Math.round(worldBytes/1024)} KiB; all asset budgets passed.`);
}finally{await rm(tmp,{force:true});}
