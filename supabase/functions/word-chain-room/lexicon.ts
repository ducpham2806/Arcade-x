// The two-syllable dictionary (public/games/word-chain/words.v1.json, see SOURCES.md there):
// fetched once, then indexed by word key and by first syllable for live checks and bots.
import {syllableKey,wordKey} from './normalize.ts';
import type {Dictionary} from './rules.ts';

export const LEXICON_URL = '/games/word-chain/words.v2.json';
export type LexiconData = {version: number; revision?: string; source: string; license: string; count: number; words: string[]; openers: string[]};
export type PackedLexiconData = {version: 2; codec?: 'prefix'; revision?: string; source: string; license: string; count: number; words: string; openers: number[]};
export function decodeLexiconData(raw: LexiconData | PackedLexiconData): LexiconData {
  if(typeof raw.words!=='string')return raw as LexiconData;
  if(raw.version!==2)throw new Error('Phiên bản từ điển không được hỗ trợ.');
  const packed=raw as PackedLexiconData;let prefix='';
  if(packed.codec&&packed.codec!=='prefix')throw new Error('Phiên bản từ điển không được hỗ trợ.');
  const words=packed.words.split('|').map(token=>{
    if(packed.codec==='prefix'&&token.startsWith('~')){
      if(!prefix||token.length<2)throw new Error('Từ điển không đầy đủ.');
      return prefix+' '+token.slice(1);
    }
    prefix=token.split(' ')[0];return token;
  });
  if(words.length!==packed.count||!packed.openers.every(i=>Number.isInteger(i)&&i>=0&&i<words.length))throw new Error('Từ điển không đầy đủ.');
  return {...packed,words,openers:packed.openers.map(i=>words[i])};
}
export type Lexicon = Dictionary & {words: readonly string[]; source: string; revision: string;
  /** Words starting with a syllable (by syllable key), most common first. */ startingWith: (syllable: string) => readonly string[]};

export function buildLexicon(raw: LexiconData | PackedLexiconData): Lexicon {
  const data=decodeLexiconData(raw);
  const byKey = new Map<string, string>(), byStart = new Map<string, string[]>();
  for (const word of data.words) {
    const key = wordKey(word); if (!key) continue;
    byKey.set(key, word);
    const first = key.split(' ')[0];
    let list = byStart.get(first); if (!list) byStart.set(first, list = []);
    list.push(word);
  }
  return {words: data.words, openers: data.openers, source: data.source,revision:data.revision??'legacy-v1',
    has: key => byKey.has(key), display: key => byKey.get(key),
    startingWith: syllable => byStart.get(syllableKey(syllable) ?? '') ?? []};
}

let task: Promise<Lexicon> | null = null, loaded: Lexicon | null = null;
export function loadLexicon(): Promise<Lexicon> {
  return task ??= fetch(LEXICON_URL).then(r => {if (!r.ok) throw new Error(`Từ điển: HTTP ${r.status}`); return r.json();})
    .then((data: LexiconData) => loaded = buildLexicon(data))
    .catch(e => {task = null; throw e;});
}
export const getLexicon = () => loaded;
