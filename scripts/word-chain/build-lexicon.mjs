#!/usr/bin/env node
// Build public/games/word-chain/words.v1.json from the Wiktionary-derived which-dialect-vi
// package (CC BY-SA 4.0). Usage: node scripts/word-chain/build-lexicon.mjs [--check]
// Downloads the pinned tarball, verifies its checksum, keeps two-syllable common words and writes
// the list sorted by frequency (most common first). Deterministic: --check fails on any drift.
import {build} from 'esbuild';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {BLOCK_SYLLABLES,BLOCK_GLOSS,VIETNAMESE} from './source-policy.mjs';

const SOURCE={name:'which-dialect-vi',version:'0.2.0',tarball:'https://registry.npmjs.org/which-dialect-vi/-/which-dialect-vi-0.2.0.tgz',shasum:'a53d8b87a204666cc5f020d744089ab8b35c6925'};
const OUT='public/games/word-chain/words.v2.json',LEGACY='public/games/word-chain/words.v1.json';
// Syllables that make a word unsuitable for an all-ages game, and gloss words that mark slurs,
// vulgar or sexual senses. A word is dropped if any syllable or any gloss matches.

const tmp=mkdtempSync(join(tmpdir(),'word-chain-lexicon-'));
const tgz=join(tmp,'src.tgz');
execFileSync('curl',['-sSfL','-o',tgz,SOURCE.tarball]);
const sum=createHash('sha1').update(readFileSync(tgz)).digest('hex');
if(sum!==SOURCE.shasum)throw new Error(`checksum mismatch: ${sum}`);
execFileSync('tar',['-xzf',tgz,'-C',tmp]);
const out=join(tmp,'normalize.cjs');
await build({entryPoints:['src/games/word-chain/normalize.ts'],bundle:true,platform:'node',format:'cjs',outfile:out,logLevel:'silent'});
const {wordKey,syllableKey,clean}=createRequire(import.meta.url)(out);

const dir=join(tmp,'package/data/words');const entries=new Map();
for(const f of readdirSync(dir).sort())for(const [head,list] of Object.entries(JSON.parse(readFileSync(join(dir,f),'utf8'))))entries.set(head,list);
const blockedKeys=new Set(BLOCK_SYLLABLES.filter(s=>!s.includes('~')&&!s.includes(' ')).map(syllableKey));
const kept=new Map();// key -> {word, freq}
for(const [head,list] of entries){
 const word=clean(head),parts=word.split(' ');
 if(head!==head.toLowerCase()||parts.length!==2||!parts.every(p=>VIETNAMESE.test(p)))continue;
 if(list.every(e=>e.pos==='name'))continue;
 const glosses=list.flatMap(e=>(e.senses||[]).flatMap(s=>s.glosses||[])).join(' | ');
 if(BLOCK_GLOSS.test(glosses)||/^(misspelling|nonstandard spelling) of/i.test(glosses))continue;
 const key=wordKey(word);if(!key||key.split(' ').some(k=>blockedKeys.has(k)))continue;
 const freq=Math.max(0,...list.map(e=>e.frequency||0)),noun=list.some(e=>e.pos==='noun');
 const prev=kept.get(key);if(!prev||freq>prev.freq)kept.set(key,{word,freq,noun});
}
const words=[...kept.values()].sort((a,b)=>b.freq-a.freq||(a.word<b.word?-1:a.word>b.word?1:0));
// Continuations per first syllable, to pick openers that are never dead ends.
const starts=new Map();for(const {word} of words){const k=syllableKey(word.split(' ')[0]);starts.set(k,(starts.get(k)||0)+1);}
// Openers: common nouns with two different syllables whose last syllable starts at least 12 words.
const openers=words.filter(w=>{const [a,b]=w.word.split(' ');return w.noun&&a!==b&&w.freq>=3&&(starts.get(syllableKey(b))||0)>=12;}).map(w=>w.word);
const legacyJson=JSON.stringify({version:1,source:`${SOURCE.name}@${SOURCE.version} (Wiktionary via Kaikki.org, CC BY-SA 4.0)`,license:'CC BY-SA 4.0',count:words.length,words:words.map(w=>w.word),openers})+'\n';
// Preserve the existing common-word ranking and opening pool. New dictionary entries
// are valid answers, appended after the frequency-ranked base rather than used as obscure openers.
const supplementFile='data/word-chain/viwiktionary-20261002.json';
const supplementBytes=readFileSync(supplementFile);
if(createHash('sha256').update(supplementBytes).digest('hex')!=='5b94ebc783a309c68f9d241e75dd107ec044be13f173132d9f5541e440d25306')throw Error('Supplement snapshot changed; reimport/review its provenance.');
const supplement=JSON.parse(supplementBytes);
for(const raw of supplement.words){
 const word=clean(raw),parts=word.split(' '),key=wordKey(word);
 if(parts.length!==2||!parts.every(p=>VIETNAMESE.test(p))||!key||key.split(' ').some(k=>blockedKeys.has(k))||kept.has(key))continue;
 kept.set(key,{word,freq:0,noun:false});words.push({word,freq:0,noun:false});
}
const indices=new Map(words.map((w,i)=>[w.word,i]));
let previous='';const packedWords=words.map(({word})=>{const [first,second]=word.split(' '),token=first===previous?'~'+second:word;previous=first;return token;}).join('|');
const revision=createHash('sha256').update(words.map(w=>w.word).join('\n')).digest('hex');
const json=JSON.stringify({version:2,codec:'prefix',revision,source:`${SOURCE.name}@${SOURCE.version} + Vietnamese Wiktionary ${supplement.dumpDate} (Kaikki.org, CC BY-SA 4.0)`,license:'CC BY-SA 4.0',count:words.length,words:packedWords,openers:openers.map(w=>indices.get(w))})+'\n';
const runtimeURL=`/games/word-chain/words.v2-${revision.slice(0,12)}.json`,runtimeFile='public'+runtimeURL;
const versionFile='src/games/word-chain/lexicon-version.ts';
const versionSource=`// Generated by scripts/word-chain/build-lexicon.mjs.\nexport const LEXICON_URL = '${runtimeURL}';\nexport const LEXICON_REVISION = '${revision}';\n`;
const packageFile='src/games/packageAssets.json',packages=JSON.parse(readFileSync(packageFile,'utf8'));
packages['word-chain']=packages['word-chain'].map(url=>/^\/games\/word-chain\/words\.v\d+(?:-[a-f0-9]{12})?\.json$/.test(url)?runtimeURL:url);
const packageJson=JSON.stringify(packages,null,2)+'\n';
if(process.argv.includes('--check')){
 if(!existsSync(OUT)||readFileSync(OUT,'utf8')!==json||readFileSync(LEGACY,'utf8')!==legacyJson||readFileSync(packageFile,'utf8')!==packageJson||!existsSync(runtimeFile)||readFileSync(runtimeFile,'utf8')!==json||!existsSync(versionFile)||readFileSync(versionFile,'utf8')!==versionSource){console.error(`${OUT}, version or package map is out of date`);process.exit(1);}
 console.log(JSON.stringify({words:words.length,openers:openers.length,status:'up to date'}));
}else{writeFileSync(LEGACY,legacyJson);writeFileSync(OUT,json);writeFileSync(runtimeFile,json);writeFileSync(versionFile,versionSource);writeFileSync(packageFile,packageJson);console.log(JSON.stringify({out:OUT,runtimeURL,words:words.length,openers:openers.length,bytes:Buffer.byteLength(json)}));}
