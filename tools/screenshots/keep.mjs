import { session } from './lib.mjs';
for (const [tag, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
  const s = await session({ w, h });
  const { p, shot } = s;
  await p.goto('http://127.0.0.1:5304/', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  await shot(`keep-${tag}-login`);
  await p.getByLabel(/user/i).first().fill('demo').catch(async () => p.locator('input').first().fill('demo'));
  await p.locator('input[type=password]').first().fill('demo-password-1');
  await p.keyboard.press('Enter');
  await p.waitForTimeout(2500);
  await shot(`keep-${tag}-home`);
  await s.close();
}
