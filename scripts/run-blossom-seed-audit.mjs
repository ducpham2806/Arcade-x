import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({
  entryPoints: ["scripts/blossom-seed-audit.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "/tmp/blossom-seed-audit.mjs",
});
const r = spawnSync(process.execPath, ["/tmp/blossom-seed-audit.mjs"], {
  stdio: "inherit",
});
process.exit(r.status ?? 1);
