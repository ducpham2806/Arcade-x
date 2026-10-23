import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp');}catch{sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp');}
export const sources=JSON.parse(fs.readFileSync('art/launcher/tech-art-sources.json','utf8'));
export async function exportRasterIcon(id){
 const source=sources[id];if(!source)return null;
 const bytes=fs.readFileSync(source.master);
 const sourceHash=createHash('sha256').update(bytes).digest('hex');
 if(sourceHash!==source.sourceSHA256)throw new Error('Unverified icon source: '+id);
 const metadata=await sharp(bytes).metadata();
 if(metadata.width!==metadata.height)throw new Error('Icon master must be square: '+id);
 const icon=await sharp(bytes).resize(512,512,{fit:'contain'}).webp({quality:88,effort:6}).toBuffer();
 if(icon.length>150000)throw new Error('Icon exceeds 150 KB: '+id);
 const hash=createHash('sha256').update(icon).digest('hex');
 const url='/game-art/icons/'+id+'.techart-'+hash.slice(0,12)+'.webp';
 fs.mkdirSync('public/game-art/icons',{recursive:true});
 fs.writeFileSync('public'+url,icon);
 // Keep legacy consumers correct too; runtime uses the immutable hashed path.
 fs.writeFileSync('public/game-art/icons/'+id+'.webp',icon);
 return {url,bytes:icon.length,sha256:hash,sourceSHA256:sourceHash,sourceFileName:source.sourceFileName,sourceLibraryFileId:source.sourceLibraryFileId};
}
