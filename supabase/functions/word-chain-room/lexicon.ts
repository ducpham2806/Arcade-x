// The two-syllable dictionary (public/games/word-chain/words.v1.json, see SOURCES.md there):
// fetched once, then indexed by word key and by first syllable for live checks and bots.
import {syllableKey,wordKey} from './normalize.ts';
import type {Dictionary} from './rules.ts';

export const LEXICON_URL = '/games/word-chain/words.v1.json';
export type LexiconData = {version: number; source: string; license: string; count: number; words: string[]; openers: string[]};
export type Lexicon = Dictionary & {words: readonly string[]; source: string;
  /** Words starting with a syllable (by syllable key), most common first. */ startingWith: (syllable: string) => readonly string[]};

export function buildLexicon(data: LexiconData): Lexicon {
  const byKey = new Map<string, string>(), byStart = new Map<string, string[]>();
  for (const word of data.words) {
    const key = wordKey(word); if (!key) continue;
    byKey.set(key, word);
    const first = key.split(' ')[0];
    let list = byStart.get(first); if (!list) byStart.set(first, list = []);
    list.push(word);
  }
  return {words: data.words, openers: data.openers, source: data.source,
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
