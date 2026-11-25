import { session } from './lib.mjs';
const MD = process.env.MEDIA || 'media';
// ---- document: a short trip plan with a picture
{
  const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
  await p.goto('http://127.0.0.1:5303/edit?new=docx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.locator('.ProseMirror, [contenteditable=true]').first().click();
  const t = async (x) => { await p.keyboard.type(x, { delay: 3 }); };
  await t('# Queenstown, a long weekend'); await p.keyboard.press('Enter');
  await t('Four days, one rental car, and a deliberately loose plan. This is the version to share before booking anything.'); await p.keyboard.press('Enter');
  await p.locator('button[aria-label="Insert image"], button[title="Insert image"]').first().click({ trial: true }).catch(() => {});
  await p.locator('input[type=file][accept^="image"]').first().setInputFiles(`${MD}/keep/trip.jpg`); await p.waitForTimeout(900);
  await p.keyboard.press('ArrowDown'); await p.keyboard.press('End');
  await t('## The plan'); await p.keyboard.press('Enter');
  await t('- Thursday: fly in, collect the car, early night'); await p.keyboard.press('Enter');
  await t('Friday: the Routeburn day walk, weather permitting'); await p.keyboard.press('Enter');
  await t('Saturday: Glenorchy and the long way back'); await p.keyboard.press('Enter');
  await t('Sunday: slow breakfast, then the airport'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  await t('## Still to decide'); await p.keyboard.press('Enter');
  await t('Whether to book the cabin before the school holidays. Check the road to Glenorchy the morning of.');
  await p.keyboard.press('Control+Home'); await p.waitForTimeout(300);
  await shot('docs-desk-doc', 800);
  await s.close();
}
// ---- spreadsheet: a small household budget, typed with Tab and Enter
{
  const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
  await p.goto('http://127.0.0.1:5303/edit?new=xlsx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.mouse.click(96, 142); await p.waitForTimeout(200);
  const rows = [['Month', 'Income', 'Rent', 'Groceries', 'Transport', 'Eating out', 'Saved'], ['June', '4180', '1850', '655', '82', '120', '1473'], ['July', '4500', '1850', '580', '70', '95', '1905'], ['August', '4180', '1850', '702', '91', '140', '1397'], ['September', '4180', '1850', '618', '77', '88', '1547'], ['October', '4180', '1850', '600', '64', '110', '1556'], ['November', '4320', '1850', '640', '70', '130', '1630'], ['December', '4180', '1850', '780', '95', '210', '1245']];
  for (const row of rows) { for (let c = 0; c < row.length; c++) { await p.keyboard.type(row[c]); await p.keyboard.press(c === row.length - 1 ? 'Enter' : 'Tab'); } await p.keyboard.press('Home'); }
  await p.mouse.click(96, 142); await p.waitForTimeout(300);
  await shot('docs-desk-sheet', 800);
  await s.close();
}
