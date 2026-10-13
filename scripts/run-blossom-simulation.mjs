import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({
  entryPoints: ["scripts/blossom-simulate.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "/tmp/blossom-simulate.mjs",
});
const result = spawnSync(
  process.execPath,
  ["/tmp/blossom-simulate.mjs", ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
