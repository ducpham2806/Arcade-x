// Export the existing immutable offline pack; do not overwrite applied migrations with a new pack.
import fs from "node:fs";
import { generatePuzzle } from "../src/games/word-cross/engine.ts";
const root = new URL("../", import.meta.url);
const pack = fs
  .readFileSync(new URL("src/games/word-cross/data/lexicon.json", root), "utf8")
  .trim();
const seed =
  "-- Offline lexicon pack 1, Unlicense source: dwyl/english-words. See game data/SOURCES.md.\nbegin;\ninsert into public.word_cross_packs(version,lexicon,source) values(1,'" +
  pack +
  "'::jsonb,'dwyl/english-words; Unlicense; pack 1');\nupdate public.launcher_games set short_description='200 màn, 5 chế độ và 117.597 từ offline',content_version=greatest(content_version,2),updated_at=now() where id='word-cross';\ncommit;\n";
fs.writeFileSync(
  new URL("supabase/migrations/202610110007_word_cross_lexicon.sql", root),
  seed,
);
const schema = fs.readFileSync(
  new URL("supabase/migrations/202610110006_word_cross.sql", root),
  "utf8",
);
const clean = (s) => s.replace(/^\s*(begin|commit);\s*$/gim, "");
fs.writeFileSync(
  new URL("supabase/word-cross-upgrade.sql", root),
  "-- Run ONCE after platform, identity and launcher migrations.\nbegin;\n" +
    clean(schema) +
    clean(seed) +
    "\ncommit;\n",
);
const fixtures = [];
for (const level of [1, 3, 4, 25, 26, 60, 61, 91, 120, 121, 200])
  for (const s of [0, 1, 4294967295]) {
    const avoid = ["CAT", "DOG"];
    fixtures.push(
      `(${level},${s},array['CAT','DOG'],'${JSON.stringify(generatePuzzle(level, s, avoid))}'::jsonb)`,
    );
  }
fs.writeFileSync(
  new URL("tests/word-cross-fixtures.sql", root),
  "-- Golden frontend boards for SQL parity; generated with pack 1. Test database only.\ncreate table public.word_cross_testfixtures(level integer,seed bigint,avoid text[],puzzle jsonb);\ninsert into public.word_cross_testfixtures values\n" +
    fixtures.join(",\n") +
    ";\n",
);
console.log(
  `Exported pack 1 and ${fixtures.length} client/SQL parity fixtures.`,
);
