/** Deterministic sprite extraction/packing. No creative image edits or API calls.
 * Usage: node scripts/build-boom-art.mjs /absolute/path/to/source-map.json
 * Source map: {id: absoluteGeneratedPngPath}; prompts and provenance in art-v3/prompts.json.
 */
import fs from 'node:fs/promises';import path from 'node:path';import{createRequire}from'node:module';
const require=createRequire(import.meta.url);let sharp;try{sharp=require('sharp')}catch{sharp=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/sharp')}
import{BOSS_IDS,ENEMY_IDS,ITEM_IDS}from'../src/games/boom-buddies/art-v3.js';
const sources=JSON.parse(await fs.readFile(process.argv[2],'utf8'));const root='public/boom/art-v3';
const cosmetics=JSON.parse(await fs.readFile(new URL('../public/boom/art-v3/cosmetics.json',import.meta.url)));
for(const d of ['bosses','icons','icons/bosses','icons/cosmetics','tiles'])await fs.mkdir(path.join(root,d),{recursive:true});
const manifest={version:3,cellSizes:{boss:160,enemy:64,item:64,pip:64,tile:48},assets:[],sources:[]};
async function extract(file,cols,rows,index,size){const m=await sharp(file).metadata(),col=index%cols,row=Math.floor(index/cols),left=Math.floor(col*m.width/cols),top=Math.floor(row*m.height/rows),right=Math.floor((col+1)*m.width/cols),bottom=Math.floor((row+1)*m.height/rows);return sharp(file).extract({left,top,width:right-left,height:bottom-top}).resize(size,size,{kernel:'nearest'}).webp({lossless:true}).toBuffer()}
async function emit(name,buffer){const file=path.join(root,name);await fs.writeFile(file,buffer);const m=await sharp(buffer).metadata();manifest.assets.push({file:name,width:m.width,height:m.height,bytes:buffer.length,alpha:!!m.hasAlpha});}
async function sheet(id,source,cols,rows,size){const pieces=[];for(let i=0;i<cols*rows;i++)pieces.push({input:await extract(source,cols,rows,i,size),left:i%cols*size,top:Math.floor(i/cols)*size});await emit(id+'.webp',await sharp({create:{width:cols*size,height:rows*size,channels:4,background:'#00000000'}}).composite(pieces).webp({lossless:true}).toBuffer());}
for(const[id,file]of Object.entries(sources)){const m=await sharp(file).metadata();manifest.sources.push({id,width:m.width,height:m.height});}
for(const id of BOSS_IDS){const source=sources[id==='gau_ri_set'?'bear':id];await sheet('bosses/'+id,source,4,2,160);await emit('icons/bosses/'+id+'.webp',await extract(source,4,2,0,64));}
for(const suffix of['','-up','-side'])await sheet('enemies'+suffix,sources['enemies'+suffix],5,4,64);
for(const[id,index]of ENEMY_IDS.map((id,index)=>[id,index]))await emit('icons/'+id+'.webp',await extract(sources.enemies,5,4,index,64));
for(const[id,index]of ITEM_IDS.map((id,index)=>[id,index]))await emit('icons/'+id+'.webp',await extract(sources['items-alpha'],6,4,index,64));
const wardrobe=cosmetics.filter(c=>c.overlay),extras=cosmetics.filter(c=>!c.overlay);
for(const[id,index]of wardrobe.map((c,i)=>[c.id,i]))await emit('icons/cosmetics/'+id+'.webp',await extract(sources.wardrobe,6,10,index,64));
for(const[id,index]of extras.map((c,i)=>[c.id,i]))await emit('icons/cosmetics/'+id+'.webp',await extract(sources['extras-alpha'],5,8,index,64));
await sheet('pip',sources.pip,4,4,64);
for(let i=0;i<48;i++)await emit('tiles/'+i+'.webp',await extract(sources.tiles,6,8,i,48));
manifest.totalBytes=manifest.assets.reduce((n,a)=>n+a.bytes,0);manifest.decodedBytes=manifest.assets.reduce((n,a)=>n+a.width*a.height*4,0);
await fs.writeFile(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({files:manifest.assets.length,bytes:manifest.totalBytes,decodedBytes:manifest.decodedBytes}));
