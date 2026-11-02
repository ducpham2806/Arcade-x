// Vietnamese text keys for the word-chain game. Players type with Telex/VNI or phone keyboards,
// which disagree on where the tone mark sits ("hoà" vs "hòa", "thuý" vs "thúy") and may send
// decomposed Unicode. A syllable's key is its letters without the tone mark plus a tone digit,
// so every spelling of the same syllable compares equal. No imports: also used by the lexicon
// build script and the Edge Function.

const TONES: Record<string, string> = {'̀': '2', '́': '1', '̉': '3', '̃': '4', '̣': '5'};
const LETTERS = /^[a-zđ̛̂̆]+$/;

/** Lowercase, NFC, single spaces, no surrounding space. */
export function clean(raw: string): string {
  return raw.normalize('NFC').toLowerCase().replace(/[\s ]+/g, ' ').trim();
}

/** Key for one syllable, or null when it is not made of Vietnamese letters. */
export function syllableKey(syllable: string): string | null {
  let tone = '0', base = '';
  for (const ch of syllable.normalize('NFD').toLowerCase()) {
    if (TONES[ch]) {if (tone !== '0') return null; tone = TONES[ch];}
    else base += ch;
  }
  if (!base || !LETTERS.test(base)) return null;
  return base.normalize('NFC') + tone;
}

export function syllables(raw: string): string[] {
  const c = clean(raw);
  return c ? c.split(' ') : [];
}

/** Key for a whole word (syllable keys joined by a space), or null if any syllable is invalid. */
export function wordKey(raw: string): string | null {
  const parts = syllables(raw), keys = parts.map(syllableKey);
  return keys.length && keys.every(Boolean) ? keys.join(' ') : null;
}
