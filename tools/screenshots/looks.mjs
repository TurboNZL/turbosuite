import { session } from './lib.mjs';
const TOKEN = process.argv[2];
for (const [name, theme, ui] of [['dark', 'turbomusic', 'default'], ['light', 'light', 'default'], ['glass', 'default', 'liquid'], ['cyber', 'default', 'cyber']]) {
  const s = await session({ w: 1440, h: 900, storage: { 'turbomusic.settings': { serverUrl: 'http://127.0.0.1:5306', token: TOKEN, theme, ui, layout: 'side', themeUpdates: false } } });
  const { p, shot } = s;
  await p.goto('http://127.0.0.1:5306/', { waitUntil: 'load' });
  await p.waitForTimeout(4000);
  await p.getByRole('link', { name: 'Albums', exact: true }).first().click();
  await shot(`looks-music-${name}`, 1800);
  await s.close();
}
