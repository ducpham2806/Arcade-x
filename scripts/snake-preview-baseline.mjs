import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {createHash} from 'node:crypto';

export function readSnakePreviewProfile(root = 'dist/preview/snake') {
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'.vite/manifest.json'),'utf8'));
  const entries=Object.entries(manifest);
  const entry=entries.find(([,value])=>value.isEntry);
  const game=entries.find(([key])=>key.endsWith('/SnakeLegendPreview.tsx'));
  if(!entry || !game) throw new Error('Build root app, then build:snake-preview first.');
  const measure=file=>{const bytes=fs.readFileSync(path.join(root,file));return {file,raw:bytes.length,gzip:gzipSync(bytes).length,sha256:createHash('sha256').update(bytes).digest('hex')};};
  const initial=new Set();
  const visit=key=>{if(initial.has(key))return;initial.add(key);for(const dep of manifest[key].imports||[])visit(dep);};
  visit(entry[0]);
  const chunks=entries.filter(([,value])=>value.file.endsWith('.js')).map(([source,value])=>({source,...measure(value.file),initial:initial.has(source),imports:value.imports||[],dynamicImports:value.dynamicImports||[]}));
  const gameText=fs.readFileSync(path.join(root,game[1].file),'utf8');
  const seen=new Set();
  const embedded=['assets.ts','audio-assets.ts','audio-feedback-assets.ts','story-prop-assets.ts'].map(file=>{
    const source='src/games/snake-legend/src/'+file,text=fs.readFileSync(source,'utf8');let bytes=0,literals=0;
    for(const match of text.matchAll(/["']((?:data:[^"']+?;base64,)?[A-Za-z0-9+/=]{128,})["']/g)) {
      const value=match[1];if(seen.has(value)||!(gameText.includes('"'+value+'"')||gameText.includes("'"+value+"'")))continue;
      seen.add(value);bytes+=Buffer.byteLength(value);literals++;
    }
    return {source,sourceBytes:Buffer.byteLength(text),embeddedLiteralBytes:bytes,literals};
  });
  const gameSize=measure(game[1].file);
  const allEmbedded=embedded.reduce((sum,value)=>sum+value.embeddedLiteralBytes,0);
  return {
    sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
    snakeTree:execFileSync('git',['rev-parse','HEAD:src/games/snake-legend'],{encoding:'utf8'}).trim(),
    workingTreeChanges:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),
    mode:'built preview; gzip is Node zlib default estimate, not Netlify wire bytes',
    entry:measure(entry[1].file),initialChunks:chunks.filter(value=>value.initial),
    initialCss:[...new Set([...initial].flatMap(key=>manifest[key].css||[]))].map(measure),
    game:{...gameSize,css:(game[1].css||[]).map(measure),embeddedLiteralBytes:allEmbedded,embeddedShare:allEmbedded/gameSize.raw},
    embedded,largestChunks:[...chunks].sort((a,b)=>b.raw-a.raw).slice(0,5),chunks,
    publicChunkGate:{maxRawBytes:500*1024,ready:chunks.every(value=>value.raw<=500*1024),previewOnly:true},
  };
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const profile=readSnakePreviewProfile();
  fs.mkdirSync('test-results/snake-baseline',{recursive:true});
  fs.writeFileSync('test-results/snake-baseline/build-profile.json',JSON.stringify(profile,null,2)+'\n');
  console.log(JSON.stringify({sourceCommit:profile.sourceCommit,entry:profile.entry,game:profile.game,publicChunkGate:profile.publicChunkGate,report:'test-results/snake-baseline/build-profile.json'}));
}
