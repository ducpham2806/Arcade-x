import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,rmSync,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
const manifest=JSON.parse(readFileSync('art/folk/oaq-v1/manifest.json','utf8'));
function dimensions(data,file){
 if(file.endsWith('.png')){assert.equal(data.subarray(1,4).toString(),'PNG');return [data.readUInt32BE(16),data.readUInt32BE(20),data[25]===6];}
 assert.equal(data.subarray(0,4).toString(),'RIFF');assert.equal(data.subarray(8,12).toString(),'WEBP');
 for(let i=12;i<data.length;){const id=data.subarray(i,i+4).toString(),n=data.readUInt32LE(i+4),p=i+8;
  if(id==='VP8L'){assert.equal(data[p],0x2f);const v=data.readUInt32LE(p+1);return [(v&0x3fff)+1,((v>>>14)&0x3fff)+1,!!((v>>>28)&1)];}
  if(id==='VP8X')return [data.readUIntLE(p+4,3)+1,data.readUIntLE(p+7,3)+1,!!(data[p]&16)];i=p+n+(n%2);
 }throw new Error('No image header: '+file);
}
let bytes=0,decoded=0;
for(const file of manifest.files){
 const data=readFileSync(file.path),size=dimensions(data,file.path);
 assert.equal(data.length,file.bytes,file.path);assert.equal(createHash('sha256').update(data).digest('hex'),file.sha256,file.path);
 assert.deepEqual(size.slice(0,2),file.dimensions,file.path);if(file.alpha_required)assert(size[2],file.path+' needs alpha');
 assert(file.source.generation_id&&file.license&&file.technical_checks_passed,file.path+' needs provenance and technical QA');
 if(file.role==='runtime'){bytes+=data.length;decoded+=size[0]*size[1]*4;}
}
assert(bytes<=manifest.runtime_budget_bytes,'Folk art download budget');assert(decoded<=manifest.decoded_rgba_budget_bytes,'Folk decoded texture budget');
const temp=mkdtempSync(path.join(tmpdir(),'folk-art-check-'));
try{
 const outfile=path.join(temp,'art.mjs');await build({stdin:{contents:"export * from './src/games/o-an-quan/art'; export {FOLK_SKINS_CATALOG} from './src/games/folk-duel/skins-catalog';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',outfile});
 const art=await import(pathToFileURL(outfile).href);
 const skins=art.FOLK_SKINS_CATALOG.filter(s=>s.game==='o-an-quan');assert.equal(skins.length,12);
 for(const skin of skins){const mapping=skin.category==='oaq_stones'?art.STONE_FRAMES:skin.category==='oaq_hand'?art.HAND_FRAMES:art.BOARD_FRAMES;assert.deepEqual(mapping[skin.id],manifest.skins[skin.id],skin.id);}
 for(const [x,y,w,h] of [...art.PROP_RECTS,...art.HAND_RECTS,...Object.values(art.BOARD_FRAMES)])assert(x>=0&&y>=0&&w>0&&h>0&&x+w<=1254&&y+h<=1254,'atlas crop outside texture');
}finally{rmSync(temp,{recursive:true,force:true});}
const report={status:'PASS',files:manifest.files.length,oaqSkins:12,runtimeBytes:bytes,decodedBytes:decoded,note:'Header/hash/provenance/atlas checks; native visual inspection is separate.'};
mkdirSync('test-results/folk-assets',{recursive:true});writeFileSync('test-results/folk-assets/report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
