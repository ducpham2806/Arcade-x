// Stages the word-chain-room Edge Function's sources from src/ and the dictionary from public/
// (single source of truth for the browser and the authoritative server). No deployment.
import {copyFileSync,readFileSync,writeFileSync} from 'node:fs';
const root = 'supabase/functions/word-chain-room/';
export const STAGED = [
  ['src/games/word-chain/normalize.ts', 'normalize.ts', []],
  ['src/games/word-chain/rules.ts', 'rules.ts', [["from './normalize'", "from './normalize.ts'"]]],
  ['src/games/word-chain/lexicon.ts', 'lexicon.ts', [["from './normalize'", "from './normalize.ts'"], ["from './rules'", "from './rules.ts'"]]],
  ['src/games/word-chain/server.ts', 'server.ts', [["from './rules'", "from './rules.ts'"]]],
];
export const staged = (from, rewrites) => rewrites.reduce((s, [a, b]) => {if (!s.includes(a)) throw new Error(`${from}: missing ${a}`); return s.replace(a, b);}, readFileSync(from, 'utf8'));
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const [from, to, rewrites] of STAGED) writeFileSync(root + to, staged(from, rewrites));
  copyFileSync('public/games/word-chain/words.v1.json', root + 'words.v1.json');
  console.log('Staged word-chain-room Edge sources and dictionary. No deployment performed.');
}
