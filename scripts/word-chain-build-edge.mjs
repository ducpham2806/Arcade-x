// Single-file artifact for the Supabase dashboard editor; never deploys or reads credentials.
import {build} from 'esbuild';
import {mkdirSync,readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {createHash} from 'node:crypto';
const file=resolve(process.argv[2]??'/private/tmp/word-chain-room-index.ts');
mkdirSync(dirname(file),{recursive:true});
await build({entryPoints:['supabase/functions/word-chain-room/index.ts'],bundle:true,platform:'neutral',format:'esm',target:'es2022',outfile:file,minify:true,legalComments:'none'});
const bytes=readFileSync(file);console.log(JSON.stringify({file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}));
