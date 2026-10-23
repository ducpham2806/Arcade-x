import fs from 'node:fs';
import {sources,exportRasterIcon} from './tech-art-icons.mjs';
const mapping={};
const manifest=JSON.parse(fs.readFileSync('docs/launcher-art-manifest.json','utf8'));
const packages=JSON.parse(fs.readFileSync('src/games/packageAssets.json','utf8'));
for(const id of Object.keys(sources)){
 const icon=await exportRasterIcon(id);mapping[id]=icon.url;
 const row=manifest.find(row=>row.id===id);if(!row)throw Error('Unknown game '+id);
 Object.assign(row,{icon:icon.url,iconBytes:icon.bytes,sha256:icon.sha256,sourceType:'imagegen',sourceFileName:icon.sourceFileName,sourceLibraryFileId:icon.sourceLibraryFileId,sourceSHA256:icon.sourceSHA256});
 packages[id]=packages[id].map(url=>url.startsWith('/game-art/icons/')?icon.url:url);
 console.log(id+' '+icon.bytes+' bytes '+icon.sha256.slice(0,12));
}
fs.writeFileSync('src/visuals/rasterIcons.json',JSON.stringify(mapping,null,2)+'\n');
fs.writeFileSync('docs/launcher-art-manifest.json',JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync('src/games/packageAssets.json',JSON.stringify(packages,null,2)+'\n');
