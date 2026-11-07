// Import a verified, local Kaikki archive; never downloads a mutable source implicitly.
// node scripts/word-chain/import-viwiktionary.mjs /path/to/raw-wiktextract-data.jsonl.gz
import {createReadStream,mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createGunzip} from 'node:zlib';
import {createInterface} from 'node:readline';
import {BLOCK_SYLLABLES,BLOCK_GLOSS,BLOCK_VI_GLOSS,VIETNAMESE} from './source-policy.mjs';
const archive=process.argv[2];
if(!archive)throw Error('Supply the local Kaikki viwiktionary archive.');
const expected='1f0abd21982660b5fc2eff5eb3fbacbed2d9fe8f476af794dbed0d927ffb8187';
const hash=createHash('sha256');for await(const chunk of createReadStream(archive))hash.update(chunk);
if(hash.digest('hex')!==expected)throw Error('Source checksum mismatch; review a new snapshot explicitly.');
const entries=new Map(),examples=new Map();let records=0;
const stream=createInterface({input:createReadStream(archive).pipe(createGunzip()),crlfDelay:Infinity});
for await(const line of stream){
 const e=JSON.parse(line);if(e.lang_code!=='vi')continue;records++;
 const word=e.word?.normalize('NFC').replace(/\s+/gu,' ').trim();
 if(!word)continue;
 const gloss=(e.senses??[]).flatMap(s=>s.glosses??[]).join(' | ');
 const tags=[...(e.tags??[]),...(e.senses??[]).flatMap(s=>s.tags??[])].join(' ');
 const unsafe=BLOCK_GLOSS.test(gloss)||BLOCK_GLOSS.test(tags)||BLOCK_VI_GLOSS.test(gloss)||word.split(' ').some(p=>BLOCK_SYLLABLES.includes(p));
 // Whole, attested two-syllable usage examples under a one-syllable native headword.
 // Never split a sentence into arbitrary adjacent pairs or admit foreign translations.
 if(!unsafe&&word===word.toLowerCase()&&VIETNAMESE.test(word)&&!['name','abbrev','character','romanization'].includes(e.pos)){
  for(const ex of (e.senses??[]).flatMap(s=>s.examples??[])){
   const raw=ex.text?.normalize('NFC').trim().replace(/[.!…]+$/u,'')??'',parts=raw.split(' ');
   if(parts.length!==2||parts[1]!==parts[1].toLowerCase())continue;
   const value=raw.toLowerCase();
   if(!value.split(' ').every(p=>VIETNAMESE.test(p))||!value.split(' ').includes(word)||value.split(' ').some(p=>BLOCK_SYLLABLES.includes(p)))continue;
   if(!examples.has(value))examples.set(value,word);
  }
 }
 if(word!==word.toLowerCase()||word.split(' ').length!==2||!word.split(' ').every(p=>VIETNAMESE.test(p)))continue;
 const row=entries.get(word)??{ordinary:false,blocked:false};
 row.ordinary ||= !['name','abbrev','character','romanization','prefix','suffix'].includes(e.pos);
 row.blocked ||= unsafe;
 entries.set(word,row);
}
const attested=[...examples].filter(([w])=>!entries.get(w)?.blocked).sort(([a],[b])=>a<b?-1:a>b?1:0);
const words=[...new Set([...entries].filter(([,r])=>r.ordinary&&!r.blocked).map(([w])=>w).concat(attested.map(([w])=>w)))].sort();
const out='data/word-chain/viwiktionary-20261002.json';mkdirSync('data/word-chain',{recursive:true});
const data={source:'Vietnamese Wiktionary via Kaikki/wiktextract',url:'https://kaikki.org/viwiktionary/raw-wiktextract-data.jsonl.gz',dumpDate:'2026-10-02',extractionDate:'2026-11-03',retrievedDate:'2026-11-07',archiveSha256:expected,license:'CC BY-SA 4.0',records,count:words.length,words,examples:attested.map(([word,head])=>({word,head}))};
const json=JSON.stringify(data)+'\n';writeFileSync(out,json);
console.log(JSON.stringify({out,records,words:words.length,bytes:Buffer.byteLength(json),sha256:createHash('sha256').update(json).digest('hex')}));
