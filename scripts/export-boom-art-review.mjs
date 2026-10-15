// Build an offline art inspector; this does not claim to be a launcher deployment.
import fs from'node:fs/promises';import path from'node:path';
const out=process.argv[2]||'deliverables/bomb-buddies-art-v3-review.html';const root='public/boom/art-v3';
const manifest=JSON.parse(await fs.readFile(root+'/manifest.json','utf8'));const assets={};for(const asset of manifest.assets)assets['art-v3/'+asset.file]='data:image/webp;base64,'+(await fs.readFile(root+'/'+asset.file)).toString('base64');
const art=(await fs.readFile('src/games/boom-buddies/art-v3.js','utf8')).replaceAll('export ','');
const costumes=JSON.parse(await fs.readFile(root+'/cosmetics.json','utf8'));
let html=await fs.readFile('docs/boom-art-review.html','utf8');html=html.replace(/<link rel="stylesheet"[^>]*>/,'').replace(/<button id="play">.*?<\/button>/,'').replace(/<select id="chapter".*?<\/select>/,'').replace(/<div id="game" hidden><\/div>/,'');
html=html.replace(/import\{BOSS_IDS[^\n]+\n/,art+'\nconst ART_ASSETS='+JSON.stringify(assets)+';\n');html=html.replace("const costumes=await fetch('/boom/art-v3/cosmetics.json').then(r=>r.json());",'const costumes='+JSON.stringify(costumes)+';');
html=html.replace("i.src='/boom/'+file",'i.src=ART_ASSETS[file]');html=html.replace("document.querySelector('#chapter').add(new Option('Boss '+(index+1)+' · '+names[index],index));",'');
html=html.replace("'/boom/'+iconPath(id,cosmetic)","ART_ASSETS[iconPath(id,cosmetic)]");
// HTML construction has a literal /boom/ prefix; use the atlas's embedded data URLs.
html=html.replace("src=\"/boom/'+iconPath(id,cosmetic)+'\"", "src=\"'+ART_ASSETS[iconPath(id,cosmetic)]+'\"");
const start=html.indexOf('async function start()');const end=html.indexOf('window.__artReview=',start);if(start>=0)html=html.slice(0,start)+html.slice(end);
html=html.replace("let mounted=false;",'');
await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,html);console.log(JSON.stringify({file:path.resolve(out),bytes:Buffer.byteLength(html),assets:manifest.assets.length}));
