// Stages the duel-room Edge Function's rule sources from src/ (single source of truth for the
// browser and the authoritative server). No deployment is performed.
import { readFileSync, writeFileSync } from 'node:fs';
const root = 'supabase/functions/duel-room/';
const copy = (from, to, rewrites = []) => writeFileSync(root + to, rewrites.reduce((s, [a, b]) => { if (!s.includes(a)) throw new Error(`${from}: missing ${a}`); return s.replace(a, b); }, readFileSync(from, 'utf8')));
copy('src/games/xiangqi/rules.ts', 'xiangqi-rules.ts');
copy('src/games/caro-gomoku/rules.ts', 'caro-rules.ts');
copy('src/games/duel/rules.ts', 'rules.ts', [["from 'chess.js'", "from 'npm:chess.js@1.4.0'"], ["from '../xiangqi/rules'", "from './xiangqi-rules.ts'"], ["from '../caro-gomoku/rules'", "from './caro-rules.ts'"]]);
copy('src/games/duel/server.ts', 'server.ts', [["from './rules'", "from './rules.ts'"]]);
console.log('Staged duel-room Edge dependencies. No deployment performed.');
