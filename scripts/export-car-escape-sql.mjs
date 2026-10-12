import fs from "node:fs";
const root = new URL("../", import.meta.url);
const levels = JSON.parse(
  fs.readFileSync(new URL("src/games/car-escape/levels.json", root), "utf8"),
);
if (levels.length !== 100) throw new Error("Expected 100 boards");
const rows = [
  "-- Authoritative campaign v2, generated from levels.json. Do not edit independently.",
  "begin;",
];
for (const b of levels) {
  const board = JSON.stringify({
    size: b.size,
    targetRow: b.targetRow,
    vehicles: b.vehicles,
  }).replaceAll("'", "''");
  rows.push(
    `insert into public.car_escape_levels(level,board,optimal_moves,mode,move_limit,time_limit_ms) values(${b.level},'${board}'::jsonb,${b.optimalMoves},'${b.mode}',${b.moveLimit ?? "null"},${b.timeLimitMs ?? "null"});`,
  );
}
rows.push(
  "update public.launcher_games set short_description='100 màn isometric, giải cứu xe vàng và chinh phục 3 sao',content_version=2,updated_at=now() where id='car-escape';",
  "commit;",
);
const seed = rows.join("\n") + "\n";
fs.writeFileSync(
  new URL("supabase/migrations/202610110004_car_escape_campaign.sql", root),
  seed,
);
const schema = fs.readFileSync(
  new URL("supabase/migrations/202610110003_car_escape.sql", root),
  "utf8",
);
const withoutTransactions = (s) => s.replace(/^\s*(begin|commit);\s*$/gim, "");
fs.writeFileSync(
  new URL("supabase/car-escape-upgrade.sql", root),
  "-- Run ONCE after base, identity and launcher migrations.\nbegin;\n" +
    [
      schema,
      seed,
      fs.readFileSync(
        new URL(
          "supabase/migrations/202610110005_car_escape_2d_metadata.sql",
          root,
        ),
        "utf8",
      ),
    ]
      .map(withoutTransactions)
      .join("\n") +
    "\ncommit;\n",
);
