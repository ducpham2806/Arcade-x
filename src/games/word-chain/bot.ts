// Practice opponents. Easy bots favour everyday words, think slowly and sometimes blank;
// hard bots answer fast and pick words that leave the next player the fewest replies.
import {wordKey} from './normalize';
import {need,turnMs,type Match} from './rules';
import type {Lexicon} from './lexicon';

export type BotLevel = 'easy' | 'hard';
export type BotMove = {word: string | null; delayMs: number};

export function botMove(m: Match, lex: Lexicon, level: BotLevel, random: () => number): BotMove {
  const used = new Set(m.words.map(w => w.key)), limit = turnMs(m.round);
  const options = lex.startingWith(need(m)).filter(w => !used.has(wordKey(w)!));
  const think = (min: number, max: number) => Math.min(limit - 1500, Math.round(min + random() * (max - min)));
  if (level === 'easy') {
    const blank = Math.min(.35, .06 + .025 * m.round);
    if (!options.length || random() < blank) return {word: null, delayMs: limit};
    const common = options.slice(0, Math.max(6, Math.ceil(options.length * .25)));
    return {word: common[Math.floor(random() * common.length)], delayMs: think(2500, 8000)};
  }
  if (!options.length || random() < .02 + .004 * m.round) return {word: null, delayMs: limit};
  // Fewest replies left for the next player; ties broken at random among the best few.
  const replies = (w: string) => lex.startingWith(w.split(' ')[1]).filter(x => !used.has(wordKey(x)!) && x !== w).length;
  const ranked = options.slice(0, 400).map(w => ({w, r: replies(w)})).sort((a, b) => a.r - b.r);
  const best = ranked.slice(0, 3);
  return {word: best[Math.floor(random() * best.length)].w, delayMs: think(1500, 4500)};
}
