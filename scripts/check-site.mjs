#!/usr/bin/env node
// Serves site/ and checks it in a real Chromium at desktop, tablet and phone widths. Fails on:
//   a request to any host but this one, a failed request, a console error or page error, a broken image,
//   sideways scrolling, a missing alt/width/height on an <img>, an engine that did not start, a local link that points nowhere,
//   a page that is not dark by default, screenshots that do not follow the look (dark/light), a picker whose preview moves the real page,
//   a header that is not at the top or a covered control in any of the nine UI styles, a button without a pointer cursor,
//   the vibecoded notice missing from the home page, the about page or the footer, an about page that is not prefetched.
// Usage: node scripts/check-site.mjs [--shots <dir>]
//   PLAYWRIGHT_MODULE=<path to playwright's index.mjs> if `playwright` is not resolvable (in the cloud sandbox: /opt/node-tools/node_modules/playwright/index.mjs)
//   CHROMIUM=<binary> (default: the one Playwright installed)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../site', import.meta.url)));
const argv = process.argv.slice(2), shotsDir = argv.includes('--shots') ? resolve(argv[argv.indexOf('--shots') + 1]) : null;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.json': 'application/json' };

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

function watch(page, tag) {
  const seen = [];
  page.on('pageerror', (e) => bad(tag, `page error: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') bad(tag, `console ${m.type()}: ${m.text()}`); });
  page.on('request', (r) => { seen.push(new URL(r.url()).pathname); if (!r.url().startsWith(origin) && !r.url().startsWith('data:')) bad(tag, `outside request: ${r.url()}`); });
  page.on('requestfailed', (r) => bad(tag, `request failed: ${r.url()} (${r.failure()?.errorText})`));
  page.on('response', (r) => { if (r.url().startsWith(origin) && r.status() >= 400) bad(tag, `HTTP ${r.status()}: ${r.url()}`); });
  return seen;
}
// read the page the way a person does: bring each section into view and give it a moment, so lazy images load and every section reveals
async function readThrough(page) {
  await page.evaluate(async () => { for (const el of document.querySelectorAll('.hero, .about-hero, section, .about-grid')) { el.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 400)); } window.scrollTo(0, 0); });
  await page.waitForFunction(() => [...document.querySelectorAll('.reveal')].every((e) => getComputedStyle(e).opacity === '1'), null, { timeout: 5000 }).catch(() => {});
  await page.waitForFunction(() => [...document.images].filter((i) => i.offsetParent !== null).every((i) => i.complete), null, { timeout: 8000 }).catch(() => {});
}

const PAGES = [['home', '/'], ['about', '/about/']];
for (const [pname, path] of PAGES) {
  for (const [name, width, height] of [['desktop', 1440, 900], ['tablet', 820, 1100], ['phone', 390, 844]]) {
    for (const scheme of ['dark', 'light']) {
      const tag = `${pname}/${name}/${scheme}`;
      const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: scheme });
      const page = await ctx.newPage();
      const seen = watch(page, tag);
      await page.goto(origin + path, { waitUntil: 'load' });
      await readThrough(page);
      const r = await page.evaluate(() => {
        const de = document.documentElement, imgs = [...document.images], shown = imgs.filter((i) => i.offsetParent !== null);
        return {
          ui: de.dataset.ui, mode: de.dataset.mode, theme: de.dataset.theme,
          overflowX: de.scrollWidth - de.clientWidth,
          broken: shown.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute('src')),
          shownCount: shown.length,
          visibleLight: shown.filter((i) => i.classList.contains('shot-light')).length,
          imgAttrs: imgs.filter((i) => !i.hasAttribute('alt') || !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.getAttribute('src')),
          lookButton: !!document.querySelector('[data-look-open]:not([hidden])'),
          invisible: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length,
          h1: document.querySelectorAll('h1').length,
          prefetch: [...document.querySelectorAll('link[rel=prefetch]')].map((l) => l.getAttribute('href')),
        };
      });
      console.log(tag, JSON.stringify({ ui: r.ui, mode: r.mode, theme: r.theme, overflowX: r.overflowX, imagesShown: r.shownCount }));
      if (!r.ui || !r.theme) bad(tag, 'the theme engine did not set data-ui / data-theme');
      if (r.mode !== 'dark') bad(tag, `the site should be dark until a look is chosen, even on a ${scheme} device (got data-mode=${r.mode})`);
      if (r.visibleLight) bad(tag, `${r.visibleLight} light screenshots are showing while the look is dark`);
      if (r.overflowX > 0) bad(tag, `sideways scroll of ${r.overflowX}px`);
      if (r.broken.length) bad(tag, `broken images: ${r.broken.join(', ')}`);
      if (r.imgAttrs.length) bad(tag, `images without alt/width/height: ${r.imgAttrs.join(', ')}`);
      if (!r.lookButton) bad(tag, 'the Look button is not shown');
      if (r.invisible) bad(tag, `${r.invisible} sections still invisible after scrolling through`);
      if (r.h1 !== 1) bad(tag, `expected one h1, found ${r.h1}`);
      const other = pname === 'home' ? '/about/' : '/';
      if (!r.prefetch.includes(other)) bad(tag, `no <link rel="prefetch" href="${other}">`);
      if (name === 'desktop' && scheme === 'dark') {
        await page.waitForTimeout(600);
        if (!seen.includes(other)) bad(tag, `${other} was not prefetched (no request for it before any click)`);
      }
      if (shotsDir && scheme === 'dark') await page.screenshot({ path: join(shotsDir, `site-${pname}-${name}.png`), fullPage: true });
      await ctx.close();
    }
  }
}

// the standing rule: the page says plainly that the apps are vibecoded, in the hero, on its own page and in the footer
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  watch(page, 'notice');
  await page.goto(origin + '/', { waitUntil: 'load' });
  const home = await page.evaluate(() => ({ hero: document.querySelector('.hero-note')?.textContent ?? '', heroLink: document.querySelector('.hero-note a')?.getAttribute('href'), foot: document.querySelector('.site-foot')?.textContent ?? '', footLink: !!document.querySelector('.site-foot a[href="/about/"]'), nav: !!document.querySelector('.site-nav a[href="/about/"]') }));
  if (!/vibecoded/i.test(home.hero) || !/personal use/i.test(home.hero)) bad('notice', 'the hero must say, plainly, that the apps are vibecoded and for personal use first');
  if (home.heroLink !== '/about/') bad('notice', 'the hero note must link to /about/');
  if (!/vibecoded/i.test(home.foot) || !home.footLink) bad('notice', 'the footer must say the suite is vibecoded and link to /about/');
  if (!home.nav) bad('notice', 'the top bar must link to /about/');
  // opening it needs no extra load: it is an ordinary link to a page that was already prefetched
  await page.click('.hero-note a');
  await page.waitForURL('**/about/');
  const about = await page.evaluate(() => ({ text: document.querySelector('main')?.textContent ?? '', h1: document.querySelector('h1')?.textContent ?? '' }));
  if (!/vibecoded/i.test(about.h1)) bad('notice', 'the about page headline must say vibecoded');
  if (!/not hand-?crafted|not written by hand/i.test(about.text)) bad('notice', 'the about page must say the code is not hand-written');
  if (/\bI\b(?!\.)/.test(about.text.replace(/\bI\.[A-Z]/g, ''))) bad('notice', 'the about page must not speak in the first person');
  await ctx.close();
}

// no JavaScript: the page is complete (every screenshot there, the sections visible, the dark captures showing)
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  const page = await ctx.newPage();
  watch(page, 'no-js');
  await page.goto(origin + '/', { waitUntil: 'load' });
  const r = await page.evaluate(() => ({ hiddenShots: [...document.querySelectorAll('[data-shot]')].filter((e) => e.offsetParent === null).length, invisible: [...document.querySelectorAll('.reveal')].filter((e) => getComputedStyle(e).opacity !== '1').length, tabs: [...document.querySelectorAll('.tabs')].filter((e) => e.offsetParent !== null).length, lightShown: [...document.images].filter((i) => i.classList.contains('shot-light') && i.offsetParent !== null).length, look: !!document.querySelector('[data-look-open]:not([hidden])') }));
  if (r.hiddenShots) bad('no-js', `${r.hiddenShots} screenshots hidden without JavaScript`);
  if (r.invisible) bad('no-js', `${r.invisible} sections invisible without JavaScript`);
  if (r.tabs) bad('no-js', 'tab buttons are shown without JavaScript');
  if (r.lightShown) bad('no-js', 'light screenshots show without JavaScript');
  if (r.look) bad('no-js', 'the Look button shows without JavaScript (it would do nothing)');
  await ctx.close();
}

// every UI style the page can wear: the header must sit at the very top (a Liquid Glass `.btn { position: relative }` once turned the skip link into a 36px gap above it),
// nothing may be covered, and every button must show a pointer
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => bad('styles', `page error: ${e.message}`));
  await page.goto(origin + '/', { waitUntil: 'load' });
  const uis = ['default', 'soft', 'bevel', 'toolbar', 'liquid', 'terminal', 'lcd', 'neon', 'material']; // the open pack's nine UI styles
  for (const ui of uis) {
    await page.evaluate((u) => window.__turbothemesEngine.apply({ theme: 'default', ui: u }), ui);
    await page.waitForTimeout(350);
    const r = await page.evaluate(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const top = Math.round(document.querySelector('.site-top').getBoundingClientRect().top);
      const skipIsBtn = document.querySelector('.skip').classList.contains('btn');
      // bring each one into view first (a larger style pushes the hero below the fold, and elementFromPoint is null off screen)
      const covered = [...document.querySelectorAll('.site-nav a, .cta .btn, .look-open, .hero-note a, .index a')].filter((e) => { e.scrollIntoView({ block: 'center', behavior: 'instant' }); const b = e.getClientRects()[0] ?? e.getBoundingClientRect(); if (!b.width) return false; const t = document.elementFromPoint(b.left + Math.min(b.width / 2, 40), b.top + b.height / 2); return !(t === e || e.contains(t)); }).map((e) => e.textContent.trim().slice(0, 24) || e.getAttribute('title'));
      window.scrollTo({ top: 0, behavior: 'instant' });
      return { top, skipIsBtn, covered };
    });
    const noPointer = await page.evaluate(() => [...document.querySelectorAll('button:not(:disabled), .btn:not(:disabled)')].filter((b) => { const x = b.getBoundingClientRect(); return x.width > 0 && x.height > 0 && getComputedStyle(b).cursor !== 'pointer'; }).map((b) => (b.textContent || '').trim().slice(0, 20)));
    if (noPointer.length) bad(`style ${ui}`, `no pointer cursor on: ${[...new Set(noPointer)].join(', ')}`);
    if (r.top !== 0) bad(`style ${ui}`, `the header is ${r.top}px down at the top of the page`);
    if (r.skipIsBtn) bad(`style ${ui}`, 'the skip link must not use .btn');
    if (r.covered.length) bad(`style ${ui}`, `covered: ${r.covered.join(', ')}`);
  }
  console.log('styles', uis.join(','), 'ok');
  await ctx.close();
}

// the picker: opens, previews in its own mock (never on the real page), applies on click, remembers the choice, and the screenshots follow the look
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, colorScheme: 'dark' });
  const page = await ctx.newPage();
  watch(page, 'picker');
  await page.goto(origin + '/', { waitUntil: 'load' });
  const real = () => page.evaluate(() => ({ theme: document.documentElement.dataset.theme, ui: document.documentElement.dataset.ui, mode: document.documentElement.dataset.mode }));
  const start = await real();
  await page.locator('.site-top [data-look-open]').click();
  if (!(await page.locator('dialog.look').evaluate((d) => d.open))) bad('picker', 'the Look button did not open the picker');
  const mock = () => page.locator('.look-mock').evaluate((m) => ({ theme: m.dataset.theme, ui: m.dataset.ui, mode: m.dataset.mode, lightShown: getComputedStyle(m.querySelector('.shot-light')).display !== 'none', darkShown: getComputedStyle(m.querySelector('.shot-dark')).display !== 'none' }));
  const m0 = await mock();
  if (m0.theme !== start.theme) bad('picker', `the mock starts as ${m0.theme}, the page is ${start.theme}`);
  const native = await page.evaluate(() => [...document.querySelectorAll('dialog.look select')].filter((x) => x.getBoundingClientRect().width > 2).length);
  if (native) bad('picker', `${native} native <select> in the picker`);
  // hover a light palette: the mock changes, the real page does not
  const light = page.locator('.look-chip[data-id="light"]');
  await light.hover();
  const m1 = await mock(), r1 = await real();
  if (m1.theme !== 'light' || m1.mode !== 'light') bad('picker', `hovering Light did not change the mock (${m1.theme}/${m1.mode})`);
  if (!m1.lightShown || m1.darkShown) bad('picker', 'the mock did not show its light screenshot for a light palette');
  if (r1.theme !== start.theme) bad('picker', 'hovering an option changed the real page (it must only move the mock)');
  // hover a style: the mock takes it, with the current colours
  await page.locator('.look-style[data-id="liquid"]').hover();
  const m2 = await mock(), r2 = await real();
  if (m2.ui !== 'liquid') bad('picker', `hovering a style did not change the mock (${m2.ui})`);
  if (r2.ui !== start.ui) bad('picker', 'hovering a style changed the real page');
  await page.mouse.move(5, 5);
  const m3 = await mock();
  if (m3.theme !== start.theme || m3.ui !== start.ui) bad('picker', 'the mock did not go back to the current look when the pointer left');
  // click applies; the screenshots follow
  await light.click();
  const r4 = await real();
  if (r4.theme !== 'light' || r4.mode !== 'light') bad('picker', `choosing Light did not change the page (${r4.theme}/${r4.mode})`);
  await page.locator('dialog.look .look-close, dialog.look [data-close]').first().click();
  await page.evaluate(() => document.querySelector('#apps').scrollIntoView());
  await page.evaluate(async () => { for (const el of document.querySelectorAll('.app')) { el.scrollIntoView({ block: 'center' }); await new Promise((r) => setTimeout(r, 250)); } });
  await page.waitForFunction(() => [...document.images].filter((i) => i.offsetParent !== null).every((i) => i.complete), null, { timeout: 8000 }).catch(() => {});
  const sw = await page.evaluate(() => { const shown = [...document.images].filter((i) => i.offsetParent !== null && i.closest('.shot') && !i.closest('dialog')); return { dark: shown.filter((i) => i.classList.contains('shot-dark')).length, light: shown.filter((i) => i.classList.contains('shot-light')).length, broken: shown.filter((i) => !i.complete || !i.naturalWidth).length }; });
  if (sw.dark || !sw.light) bad('picker', `with a light look the screenshots should be the light ones (dark shown: ${sw.dark}, light shown: ${sw.light})`);
  if (sw.broken) bad('picker', `${sw.broken} light screenshots failed to load`);
  // closing returns focus to the button, and the choice survives a reload
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'load' });
  const r5 = await real();
  if (r5.theme !== 'light') bad('picker', `the choice did not survive a reload (${r5.theme})`);
  // Escape closes it
  await page.locator('.site-top [data-look-open]').click();
  await page.keyboard.press('Escape');
  if (await page.locator('dialog.look').evaluate((d) => d.open)) bad('picker', 'Escape did not close the picker');
  const focused = await page.evaluate(() => document.activeElement?.matches('[data-look-open]'));
  if (!focused) bad('picker', 'closing the picker did not give focus back to the Look button');
  // "back to the site's own look"
  await page.locator('.site-top [data-look-open]').click();
  await page.locator('.look-reset').click();
  const r6 = await real();
  if (r6.theme !== 'default' || r6.ui !== 'default') bad('picker', `"Back to the site’s own look" gave ${r6.theme}/${r6.ui}`);
  console.log('picker ok');
  await ctx.close();
}

// links that stay on the site must point at something
{
  for (const f of ['index.html', 'about/index.html']) {
    const html = await readFile(join(root, f), 'utf8');
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const u = m[1];
      if (/^(https?:|mailto:|data:)/.test(u)) continue;
      const [file, hash] = u.split('#');
      if (!file) { if (!ids.has(hash)) bad(`links ${f}`, `no element with id #${hash}`); continue; }
      const target = file.endsWith('/') ? file + 'index.html' : file;
      try { await stat(join(root, target)); } catch { bad(`links ${f}`, `missing file ${u}`); }
    }
  }
}

await browser.close();
server.close();
if (problems.length) { console.log(`\n${problems.length} problem(s)`); process.exit(1); }
console.log('\nsite ok');
