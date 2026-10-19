import { session } from './lib.mjs';
const TOKEN = process.argv[2];
const storage = { 'turbopantry.settings': { serverUrl: '', token: TOKEN } };
for (const [tag, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const s = await session({ w, h, storage });
  const { p, shot } = s;
  await p.goto('http://127.0.0.1:5305/', { waitUntil: 'load' });
  await p.waitForTimeout(2000);
  await shot(`pantry-${tag}-recipes`);
  for (const [label, name] of [['Pantry', 'pantry'], ['Shopping', 'shopping']]) {
    await p.getByRole('link', { name: label }).first().click().catch(async () => p.getByText(label, { exact: true }).first().click());
    await shot(`pantry-${tag}-${name}`, 1200);
  }
  await p.getByText('Recipes', { exact: true }).first().click().catch(() => {});
  await p.waitForTimeout(800);
  await p.getByText('Weeknight mushroom risotto').first().click().catch((e) => console.log('open recipe fail'));
  await shot(`pantry-${tag}-recipe`, 1200);
  await s.close();
}
