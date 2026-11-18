// Reproducible deploy artifacts only. No credentials, API calls or deployment.
import {build} from 'esbuild';import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';import {resolve,join} from 'node:path';import {createHash} from 'node:crypto';
const dir=resolve(process.argv[2]||'/private/tmp/arcadex-chat-staging');mkdirSync(dir,{recursive:true});
const hash=value=>createHash('sha256').update(value).digest('hex'),artifacts=[];
for(const game of ['word-chain','battleship']){const file=join(dir,game+'-room-index.ts');await build({entryPoints:[`supabase/functions/${game}-room/index.ts`],bundle:true,platform:'neutral',format:'esm',target:'es2022',outfile:file,minify:true,legalComments:'none'});const bytes=readFileSync(file);artifacts.push({file,bytes:bytes.length,sha256:hash(bytes)});}
const sources=['supabase/word-chain/schema.sql',...['schema','presence','matchmaking','rematch'].map(name=>`supabase/battleship/${name}.sql`)];
const sql='-- Only arcade-x-staging: khqipuipeawzlkqmdzdg. Never production.\nbegin;\n'+sources.map(file=>'-- Source: '+file+'\n'+readFileSync(file,'utf8')).join('\n')+"\ncommit;\nselect to_regprocedure('public.bs_room_read(text)') is not null as battleship_ready,to_regprocedure('public.wc_room_read(text)') is not null as word_chain_ready;\n";
const file=join(dir,'chat-staging-schema.sql');writeFileSync(file,sql);artifacts.push({file,bytes:Buffer.byteLength(sql),sha256:hash(sql)});
const manifest={project:'khqipuipeawzlkqmdzdg',scope:'Generated sources, no deployment or credentials',artifacts,sources:sources.map(file=>({file,sha256:hash(readFileSync(file))}))};writeFileSync(join(dir,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest,null,2));
