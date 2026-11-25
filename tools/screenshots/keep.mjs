import { session } from './lib.mjs';
const login = async (p) => {
  await p.goto('http://127.0.0.1:5304/', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  await p.locator('input').first().fill('demo');
  await p.locator('input[type=password]').first().fill('demo-password-1');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(2500);
};
for (const [tag, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const s = await session({ w, h });
  await login(s.p);
  await s.shot(`keep-${tag}-home`);
  await s.close();
}
{ // the Keep-style wall of cards
  const s = await session({ w: 1440, h: 900, storage: { 'turbokeep.settings': { viewStyle: 'wall' } } });
  await login(s.p);
  await s.p.getByText('All notes', { exact: true }).first().click().catch(() => {});
  await s.shot('keep-desk-wall', 1500);
  await s.close();
}
