import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = fileURLToPath(new URL('../content/site/', import.meta.url));
const escape = text => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
// Deliberately small authoring format: text, headings, paragraphs, lists and safe links.
function inline(text) {
  const pattern = /\[([^\]]+)\]\(([^\s)]+)\)/g;
  let html = '', last = 0;
  for (const match of text.matchAll(pattern)) {
    const href = match[2];
    if (!/^\/(?!\/)/.test(href) && !/^https:\/\//.test(href)) throw new Error(`Unsafe content link: ${href}`);
    html += escape(text.slice(last, match.index)) + `<a href="${escape(href)}">${escape(match[1])}</a>`;
    last = match.index + match[0].length;
  }
  return html + escape(text.slice(last));
}
export function renderMarkdown(markdown) {
  let list = false;
  const html = [];
  for (const line of markdown.trim().split('\n')) {
    if (!line.startsWith('- ') && list) { html.push('</ul>'); list = false; }
    if (!line.trim()) continue;
    const heading = /^(#{1,3}) (.+)$/.exec(line);
    if (heading) html.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);
    else if (line.startsWith('- ')) {
      if (!list) { html.push('<ul>'); list = true; }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else html.push(`<p>${inline(line)}</p>`);
  }
  if (list) html.push('</ul>');
  return html.join('\n');
}
const css = `:root{font-family:system-ui,sans-serif;color:#243344;background:#f5f7f4;line-height:1.75}*{box-sizing:border-box}body{margin:0}header,main,footer{max-width:820px;margin:auto;padding:24px}header{border-bottom:1px solid #ced8cc}nav{display:flex;gap:12px 24px;flex-wrap:wrap}a{color:#245c34;text-underline-offset:4px;overflow-wrap:anywhere}a:focus-visible{outline:3px solid #947128;outline-offset:4px}h1{font-size:clamp(1.8rem,5vw,2.6rem);line-height:1.2;color:#183c26}h2{margin-top:2rem;font-size:1.35rem}p,li{max-width:70ch}li{margin:8px 0}footer{border-top:1px solid #ced8cc;font-size:.9rem}main{min-height:65vh}`;
function canonicalOrigin(value) {
  if (!value) return '';
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('SITE_URL must be an HTTPS origin without credentials, path, query or hash.');
  return url.origin;
}
export function sitePages(origin = '') {
  const canonical = canonicalOrigin(origin);
  const pages = new Map();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(file); continue; }
      if (!entry.name.endsWith('.md')) continue;
      const relative = path.relative(sourceRoot, file).replaceAll(path.sep, '/');
      const route = '/' + relative.replace(/\.md$/, '').replace(/\/index$/, '') + '/';
      const markdown = fs.readFileSync(file, 'utf8');
      const title = /^# (.+)$/m.exec(markdown)?.[1];
      const description = markdown.split('\n').find(line => line && !line.startsWith('#'));
      if (!title || !description) throw new Error(`Missing content metadata: ${relative}`);
      const document = `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escape(title)} | ArcadeX</title><meta name="description" content="${escape(description)}">${canonical ? `<link rel="canonical" href="${escape(canonical + route)}">` : ''}<style>${css}</style></head><body><header><nav aria-label="Điều hướng"><a href="/">ArcadeX · Chơi game</a><a href="/huong-dan/">Hướng dẫn</a><a href="/thong-tin/gioi-thieu/">Giới thiệu</a></nav></header><main>${renderMarkdown(markdown)}</main><footer><nav aria-label="Thông tin"><a href="/thong-tin/lien-he/">Liên hệ</a><a href="/thong-tin/quyen-rieng-tu/">Quyền riêng tư</a><a href="/thong-tin/noi-dung/">Nội dung và hình ảnh</a></nav><p>Cập nhật 11/11/2026 · ArcadeX</p></footer></body></html>`;
      pages.set(route, document);
    }
  }
  walk(sourceRoot);
  return pages;
}
export function sitePagesPlugin() {
  let origin = '';
  return {
    name: 'arcadex-public-content',
    configResolved(config) { origin = config.env.SITE_URL || process.env.SITE_URL || ''; },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!['GET', 'HEAD'].includes(req.method || '')) return next();
        const pathname = new URL(req.url || '/', 'http://localhost').pathname;
        if (!/^\/(huong-dan|thong-tin)(\/|$)/.test(pathname)) return next();
        const route = pathname.replace(/\/index\.html$/, '/').replace(/\/?$/, '/');
        const html = sitePages(origin).get(route);
        if (!html) { res.statusCode = 404; res.end('Không tìm thấy trang.'); return; }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(req.method === 'HEAD' ? '' : html);
      });
    },
    generateBundle() {
      const pages = sitePages(origin);
      for (const [route, source] of pages) this.emitFile({ type: 'asset', fileName: route.slice(1) + 'index.html', source });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${canonicalOrigin(origin)}/sitemap.xml\n` : ''}` });
      if (origin) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...pages.keys()].map(route => `<url><loc>${escape(canonicalOrigin(origin) + route)}</loc></url>`).join('')}</urlset>` });
    },
  };
}
