import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sitePages, renderMarkdown} from '../../scripts/site-pages.mjs';

test('public pages form a complete, script-free set with no broken internal links', () => {
  const pages = sitePages();
  assert.equal(pages.size, 10);
  for (const [route, html] of pages) {
    assert.match(route, /^\/(huong-dan|thong-tin)\//);
    assert.match(html, /<html lang="vi">/);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.doesNotMatch(html, /<script|adsbygoogle|rel="canonical"/i);
    for (const link of html.matchAll(/href="(\/[^"]*)"/g)) assert.ok(link[1] === '/' || pages.has(link[1]), `${route}: ${link[1]}`);
  }
});
test('authoring escapes HTML, rejects executable links and validates the real canonical origin', () => {
  assert.match(renderMarkdown('# <script>alert(1)</script>'), /&lt;script&gt;/);
  assert.throws(() => renderMarkdown('[bad](javascript:alert)'), /Unsafe content link/);
  assert.throws(() => renderMarkdown('[bad](//evil.example/)'), /Unsafe content link/);
  assert.throws(() => sitePages('https://example.com/path'), /SITE_URL/);
  assert.throws(() => sitePages('http://example.com'), /SITE_URL/);
  assert.match(sitePages('https://example.com').get('/huong-dan/'), /rel="canonical" href="https:\/\/example.com\/huong-dan\/"/);
});
