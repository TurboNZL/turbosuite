#!/usr/bin/env node
// Serves site/ and checks it in a real Chromium at desktop, tablet and phone widths. Fails on:
//   a request to any host but this one, a failed request, a console error or page error, a broken image,
//   sideways scrolling, a missing alt/width/height on an <img>, an engine that did not start, a local link that points nowhere.
// Usage: node scripts/check-site.mjs [--shots <dir>]
//   PLAYWRIGHT_MODULE=<path to playwright's index.mjs> if `playwright` is not resolvable (in the cloud sandbox: /opt/node-tools/node_modules/playwright/index.mjs)
//   CHROMIUM=<binary> (default: the one Playwright installed; in the cloud sandbox /opt/pw-browsers/chromium-1194/chrome-linux/chrome)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../site', import.meta.url)));
const argv = process.argv.slice(2), shotsDir = argv.includes('--shots') ? resolve(argv[argv.indexOf('--shots') + 1]) : null;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.webp': 'image/webp', '.json': 'application/json' };

// the headers Cloudflare Pages will send for every path (the `/*` block of site/_headers), so a policy that breaks the page fails here
const allHeaders = {};
{
  let on = false;
  for (const line of (await readFile(join(root, '_headers'), 'utf8')).split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!line.startsWith(' ')) { on = line.trim() === '/*'; continue; }
    if (on) { const i = line.indexOf(':'); allHeaders[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
  if (!allHeaders['Content-Security-Policy']) { console.log('FAIL site/_headers has no Content-Security-Policy in its /* block'); process.exit(1); }
}

const server = createServer(async (req, res) => {
  try {
    let p = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (p.endsWith('/')) p += 'index.html';
    const file = join(root, p);
    if (!file.startsWith(root)) throw new Error('outside');
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream', ...allHeaders });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const origin = `http://127.0.0.1:${server.address().port}`;

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const problems = [];
const bad = (where, msg) => { problems.push(`${where}: ${msg}`); console.log('FAIL', where, msg); };

for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 820, 1100], ['phone', 390, 844]]) {
  for (const scheme of ['dark', 'light']) {
    const tag = `${name}/${scheme}`;
    const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => bad(tag, `page error: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') bad(tag, `console ${m.type()}: ${m.text()}`); });
    page.on('request', (r) => { if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) bad(tag, `outside request: ${r.url()}`); });
    page.on('requestfailed', (r) => bad(tag, `request failed: ${r.url()} (${r.failure()?.errorText})`));
    page.on('response', (r) => { if (r.url().startsWith(origin) && r.status() >= 400) bad(tag, `HTTP ${r.status()}: ${r.url()}`); });
    await page.goto(origin + '/', { waitUntil: 'load' });
    // read the page the way a person does: bring each section into view and give it a moment, so lazy images load and every section reveals
    await page.evaluate(async () => { for (const el of document.querySelectorAll('.hero, section')) { el.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 450)); } window.scrollTo(0, 0); });
    // the reveal animation and the lazy images need a moment: wait for them instead of guessing
    await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 5000 }).catch(() => {});
    await page.waitForFunction(() => [...document.images].filter((i) => !i.closest('[hidden]')).every((i) => i.complete), null, { timeout: 8000 }).catch(() => {});
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const imgs = [...document.images];
      return {
        ui: de.dataset.ui, mode: de.dataset.mode, theme: de.dataset.theme,
        overflowX: de.scrollWidth - de.clientWidth,
        brokenImages: imgs.filter((i) => i.complete === false || (i.complete && i.naturalWidth === 0)).filter((i) => i.offsetParent !== null || i.closest('[hidden]') === null).map((i) => i.getAttribute('src')),
        loadedEager: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
        imgAttrs: imgs.filter((i) => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.getAttribute('src')),
        picker: !!customElements.get('turbo-themes-picker'),
        sections: ['apps', 'looks', 'engine', 'run'].filter((id) => !document.getElementById(id)),
        invisible: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length,
        h1: document.querySelectorAll('h1').length,
      };
    });
    console.log(tag, JSON.stringify({ ui: r.ui, mode: r.mode, theme: r.theme, overflowX: r.overflowX, images: r.loadedEager }));
    if (!r.ui || !r.theme) bad(tag, 'the theme engine did not set data-ui / data-theme');
    if (r.mode !== scheme) bad(tag, `expected data-mode=${scheme}, got ${r.mode} (the site should follow the device until a choice is saved)`);
    if (r.overflowX > 0) bad(tag, `sideways scroll of ${r.overflowX}px`);
    if (r.brokenImages.length) bad(tag, `broken images: ${r.brokenImages.join(', ')}`);
    if (r.imgAttrs.length) bad(tag, `images without alt/width/height: ${r.imgAttrs.join(', ')}`);
    if (!r.picker) bad(tag, '<turbo-themes-picker> is not defined');
    if (r.sections.length) bad(tag, `missing sections: ${r.sections.join(', ')}`);
    if (r.invisible) bad(tag, `${r.invisible} sections still invisible after scrolling through`);
    if (r.h1 !== 1) bad(tag, `expected one h1, found ${r.h1}`);
    if (shotsDir && scheme === 'dark') await page.screenshot({ path: join(shotsDir, `site-${name}.png`), fullPage: true });
    await ctx.close();
  }
}

// links that stay on the site must point at something
{
  const html = await readFile(join(root, 'index.html'), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:)/.test(u)) continue;
    if (u.startsWith('#')) { if (!ids.has(u.slice(1))) bad('links', `no element with id ${u}`); continue; }
    try { await stat(join(root, u.split('#')[0])); } catch { bad('links', `missing file ${u}`); }
  }
}

await browser.close();
server.close();
if (problems.length) { console.log(`\n${problems.length} problem(s)`); process.exit(1); }
console.log('\nsite ok');
