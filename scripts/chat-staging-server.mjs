// Isolated staging process: real staging Auth + Tank authority. Never uses production.
import {readFileSync,readdirSync} from 'node:fs';import {join,extname} from 'node:path';
import {createTankRoomServer,supabaseAuthenticator} from '../server/tank-clash-room/server.mjs';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY;
if(url!=='https://khqipuipeawzlkqmdzdg.supabase.co'||!key?.startsWith('sb_publishable_'))throw Error('Only arcade-x-staging public configuration is accepted.');
const hosted=process.env.RENDER==='true';
const origin=hosted?process.env.RENDER_EXTERNAL_URL:'http://127.0.0.1:4335';
if(!origin||hosted&&!/^https:\/\/[a-z0-9-]+\.onrender\.com$/.test(origin))throw Error('Exact staging origin required.');
const assets=new Map(),types={'.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg'};
for(const dir of ['public/games/battleship','public/games/word-chain'])for(const relative of readdirSync(dir,{recursive:true})){const file=join(dir,String(relative)),type=types[extname(file)];if(type)assets.set('/'+file.slice('public/'.length),{bytes:readFileSync(file),type});}
const server=await createTankRoomServer({port:hosted?Number(process.env.PORT):4335,host:hosted?'0.0.0.0':'127.0.0.1',allowedOrigins:[origin],allowLocalOrigins:false,allowMissingOrigin:false,maxConnections:16,detailedHealth:false,metricsEnabled:false,authenticate:supabaseAuthenticator({url,anonKey:key,requireRegistered:true}),review:{html:readFileSync('deliverables/chat-staging-review.html','utf8'),supabaseUrl:url,publishableKey:key,assets}});
console.log(`Chat staging ready: ${origin}/review · registered staging Auth only`);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>void server.close({notify:true}).then(()=>process.exit(0)));
