// Local opt-in preview; the ignored env file contains public URL/key only.
import {build} from 'esbuild';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const values=Object.fromEntries(readFileSync('.env.tank-staging.local','utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim().replace(/^['"]|['"]$/g,'')];}));
const config={url:values.VITE_SUPABASE_URL,key:values.VITE_SUPABASE_PUBLISHABLE_KEY};
if(config.url!=='https://khqipuipeawzlkqmdzdg.supabase.co'||!config.key?.startsWith('sb_publishable_'))throw Error('Matching staging public URL/key required.');
const {outputFiles}=await build({entryPoints:['src/games/word-chain/staging-preview.tsx'],bundle:true,write:false,platform:'browser',format:'iife',minify:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"','import.meta.env':'{}'},outfile:'word-chain-staging.js'});
const js=outputFiles.find(f=>f.path.endsWith('.js')).text,css=outputFiles.find(f=>f.path.endsWith('.css'))?.text??'';
mkdirSync('review',{recursive:true});
writeFileSync('review/word-chain-staging.html',`<!doctype html><html lang="vi"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Nối Từ · staging</title><style>${css}</style><div id="root"></div><script>globalThis.__WORD_CHAIN_STAGING__=${JSON.stringify(config)};<\/script><script>${js.replace(/<\/script/gi,'<\\/script')}<\/script></html>`);
console.log('Built review/word-chain-staging.html (public configuration only).');
