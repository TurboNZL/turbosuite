// PLAYWRIGHT_MODULE=<path to playwright's index.mjs> if `playwright` is not resolvable; CHROMIUM=<binary> to use a specific browser
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
export async function session({ w = 1440, h = 900, storage = {}, scale = 1, colorScheme = 'light' } = {}) {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale, colorScheme });
  await ctx.addInitScript((s) => { try { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch {} }, storage);
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  const shot = async (name, wait = 600) => { await p.waitForTimeout(wait); await p.screenshot({ path: `${process.env.OUT || 'raw'}/${name}.png` }); console.log('shot', name); };
  return { b, p, shot, errors, close: async () => { if (errors.length) console.log('page errors:', errors); await b.close(); } };
}
