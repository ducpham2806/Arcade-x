import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const output=process.argv[2]||'/tmp/eat-em-all-journey-review.html';
const result=await build({entryPoints:['scripts/eat-journey-review.tsx'],bundle:true,minify:true,format:'iife',outfile:'eat-review.js',write:false,loader:{'.webp':'dataurl'},define:{'process.env.NODE_ENV':'"production"'}});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text;
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
let html=await readFile('eat-review.html','utf8');
html=html.replace('</head>',()=>`<style>${css}</style></head>`).replace('<script type="module" src="/scripts/eat-journey-review.tsx"></script>',()=>`<script>${js.replaceAll('</script','<\\/script')}</script>`);
await writeFile(output,html);console.log(output);
