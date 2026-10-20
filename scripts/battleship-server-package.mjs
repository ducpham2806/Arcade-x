import {readFileSync,writeFileSync} from 'node:fs';
const root='supabase/functions/battleship-room/';
// Single source of truth for offline and authoritative server rules.
writeFileSync(root+'engine.ts',readFileSync('src/games/battleship/engine.ts'));
writeFileSync(root+'server.ts',readFileSync('src/games/battleship/server.ts','utf8').replace("from './engine'","from './engine.ts'"));
console.log('Staged Battleship Edge dependencies refreshed. No deployment performed.');
