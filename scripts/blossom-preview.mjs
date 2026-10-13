import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd(),
  out = process.argv[2] || path.resolve(root, "../blossom-blast-review.html");
const built = await build({
  entryPoints: ["src/games/hex-match/blossom/preview.tsx"],
  bundle: true,
  write: false,
  format: "iife",
  minify: true,
  outfile: "preview.js",
  define: { "process.env.NODE_ENV": '"production"' },
  loader: { ".woff2": "dataurl" },
  external: ["/blossom/*"],
});
const scripts = built.outputFiles.find((f) => f.path.endsWith(".js")).text,
  css = built.outputFiles.find((f) => f.path.endsWith(".css")).text;
const assets = {};
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(png|wav|ogg|woff2)$/.test(p)) {
      const rel = path
        .relative(path.join(root, "public/blossom"), p)
        .split(path.sep)
        .join("/");
      if (
        !rel.startsWith("png/anim/") ||
        /anim_fx_(blast_|bloom_bomb|rainbow_burst|sun_burst|special_merge|chain_spark)/.test(
          rel,
        )
      )
        assets[rel] =
          `data:${p.endsWith(".png") ? "image/png" : p.endsWith(".wav") ? "audio/wav" : p.endsWith(".ogg") ? "audio/ogg" : "font/woff2"};base64,${fs.readFileSync(p).toString("base64")}`;
    }
  }
};
walk(path.join(root, "public/blossom"));
const inlineCSS = css.replace(
  /url\(["']?\/blossom\/([^"')]+)["']?\)/g,
  (_, p) => `url("${assets[p]}")`,
);
const shell = fs
  .readFileSync("blossom-review.html", "utf8")
  .replace(
    '<script type="module" src="/src/games/hex-match/blossom/preview.tsx"></script>',
    "",
  );
const html = shell
  .replace("</head>", `<style>${inlineCSS}</style></head>`)
  .replace(
    "</body>",
    () =>
      `<script>window.__BLOSSOM_INLINE_ASSETS__=${JSON.stringify(assets)};<\/script><script>${scripts.replaceAll("</script", "<\\/script")}<\/script></body>`,
  );
fs.writeFileSync(out, html);
console.log(
  JSON.stringify({
    out,
    bytes: Buffer.byteLength(html),
    assets: Object.keys(assets).length,
  }),
);
