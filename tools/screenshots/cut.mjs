import { session } from './lib.mjs';
const s = await session({ w: 1440, h: 900, storage: { 'turbocut.settings': { settingsVersion: 2, showHome: false } } });
const { p, shot } = s;
await p.goto('http://127.0.0.1:5302/', { waitUntil: 'load' });
await p.waitForFunction(() => window.turbocutApp, null, { timeout: 20000 });
for (const f of ['media/morning-clip.webm', 'media/closing-clip.webm']) {
  await p.getByRole('button', { name: 'File', exact: true }).click();
  const [ch] = await Promise.all([p.waitForEvent('filechooser'), p.getByRole('menuitem', { name: 'Import media…' }).click()]);
  await ch.setFiles(f);
  await p.waitForTimeout(1500);
}
const adds = p.getByRole('button', { name: 'Add', exact: true });
await adds.nth(0).click(); await p.waitForTimeout(500);
// move the playhead to the end of the first clip, then add the second
await p.evaluate(() => window.turbocutApp.store.seek?.(240));
await adds.nth(1).click(); await p.waitForTimeout(800);
await p.evaluate(() => {
  const a = window.turbocutApp, fps = a.store.project.fps || 30, f = (t) => Math.round(t * fps);
  const words = (arr) => arr.map(([text, s, e]) => ({ text, start: f(s), end: f(e) }));
  a.store.edit((pr) => { pr.captions = [
    { id: 'c1', start: f(0.4), end: f(2.6), text: 'Good morning, everyone', style: 'Default', words: words([['Good', .4, .9], ['morning,', 1, 1.8], ['everyone', 1.9, 2.6]]) },
    { id: 'c2', start: f(3), end: f(5.5), text: 'Here is the plan for today', style: 'Default', words: words([['Here', 3, 3.4], ['is', 3.5, 3.7], ['the', 3.8, 4], ['plan', 4.1, 4.6], ['for', 4.7, 4.9], ['today', 5, 5.5]]) },
    { id: 'c3', start: f(8.5), end: f(11), text: 'See you tomorrow', style: 'Default', words: words([['See', 8.5, 9], ['you', 9.1, 9.7], ['tomorrow', 9.8, 11]]) },
  ]; });
  a.store.setZoom?.(1.55);
  a.store.seek?.(f(4.2));
});
await p.getByRole('tab', { name: 'Captions' }).first().click().catch(() => p.getByText('Captions', { exact: true }).first().click());
await p.waitForTimeout(9000); await p.$eval('.tl-scroll', (e) => { e.scrollLeft = 0; }); await p.waitForTimeout(400);
await shot('cut-desk-edit', 500);
await s.close();
