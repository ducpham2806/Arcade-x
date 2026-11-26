import { build } from "esbuild";
import fs from "node:fs";
import path from "node:path";
import painted from "../src/games/hex-match/blossom/painted.json" with { type: "json" };
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
const relativeArt = url => url.slice("/blossom/".length);
const includeLegacy = rel => !rel.startsWith("png/anim/") || /anim_fx_(blast_|bloom_bomb|rainbow_burst|sun_burst|special_merge|chain_spark)/.test(rel);
const paintedWebP = new Set(Object.entries(painted)
  .filter(([legacy]) => includeLegacy(legacy))
  .map(([, url]) => relativeArt(url)));
const directWebP = /^(?:gemini\/(?:world-(?:\d\d|garden|map)|ui-(?:panel|pill-(?:cream|green|gold)|leaf-ring))|vfx\/(?:bloom|merge-ring|portal))\.webp$/;
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.(png|webp|wav|ogg|woff2)$/.test(p)) {
      const rel = path
        .relative(path.join(root, "public/blossom"), p)
        .split(path.sep)
        .join("/");
      if (!includeLegacy(rel) || painted[rel]) continue;
      if (rel.endsWith(".webp") && !paintedWebP.has(rel) && !directWebP.test(rel)) continue;
      const mime = { ".png": "image/png", ".webp": "image/webp", ".wav": "audio/wav", ".ogg": "audio/ogg", ".woff2": "font/woff2" }[path.extname(p)];
      assets[rel] = `data:${mime};base64,${fs.readFileSync(p).toString("base64")}`;
    }
  }
};
walk(path.join(root, "public/blossom"));
const inlineCSS = css.replace(
  /url\(["']?\/blossom\/([^"')]+)["']?\)/g,
  (url, p) => assets[p] ? `url("${assets[p]}")` : url,
);
const shell = fs
  .readFileSync("blossom-review.html", "utf8")
  .replace(
    '<script type="module" src="/src/games/hex-match/blossom/preview.tsx"></script>',
    "",
  );
const pixelFxLicense = fs.readFileSync("public/blossom/vfx/PIXELFX-LICENSE.txt", "utf8");
const html = shell
  .replace("</head>", `<style>${inlineCSS}</style>\n<!-- PixelFX\n${pixelFxLicense}-->\n</head>`)
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
