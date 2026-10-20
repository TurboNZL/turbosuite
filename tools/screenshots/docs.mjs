import { session } from './lib.mjs';
// ---- document
{
  const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
  await p.goto('http://127.0.0.1:5303/edit?new=docx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.locator('.ProseMirror, [contenteditable=true]').first().click();
  const t = async (x) => { await p.keyboard.type(x, { delay: 4 }); };
  await t('# Q4 planning notes'); await p.keyboard.press('Enter');
  await t('Where we are, what ships next, and what we are deliberately not doing this quarter.'); await p.keyboard.press('Enter');
  await t('## What shipped'); await p.keyboard.press('Enter');
  await t('- Offline mode for the shopping list'); await p.keyboard.press('Enter');
  await t('Faster sync after a long gap'); await p.keyboard.press('Enter');
  await t('Themes that follow the device'); await p.keyboard.press('Enter'); await p.keyboard.press('Enter');
  await t('## Next up'); await p.keyboard.press('Enter');
  await t('The Android build needs a widget. The server needs a proper restore test, not just a backup. Everything else waits until those two are done and boring.');
  await shot('docs-desk-doc', 800);
  await s.close();
}
// ---- spreadsheet
{
  const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
  await p.goto('http://127.0.0.1:5303/edit?new=xlsx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  await p.mouse.click(300, 188);
  const rows = [['Month', 'Income', 'Rent', 'Food', 'Transport', 'Saved'], ['May', '4180', '1850', '600', '64', '1666'], ['June', '4180', '1850', '655', '82', '1593'], ['July', '4500', '1850', '580', '70', '2000'], ['August', '4180', '1850', '702', '91', '1537'], ['September', '4180', '1850', '618', '77', '1635'], ['October', '4180', '1850', '600', '64', '1666']];
  for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) { await p.mouse.click(302 + 96 * c, 188 + 24 * r); await p.keyboard.type(rows[r][c]); await p.keyboard.press('Enter'); }
  await p.mouse.click(300, 188);
  await shot('docs-desk-sheet', 800);
  await s.close();
}
// ---- slides
{
  const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
  await p.goto('http://127.0.0.1:5303/edit?new=pptx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
  const edit = async (label, text) => { await p.getByText(label, { exact: true }).first().dblclick(); await p.waitForTimeout(300); const tb = p.getByRole('textbox', { name: 'Slide text' }).first(); await tb.click(); await p.keyboard.press('Control+A'); await p.keyboard.type(text); await p.mouse.click(1000, 700); await p.waitForTimeout(300); };
  await edit('Presentation title', 'Quarterly review');
  await edit('Subtitle', 'What shipped, and what is next');
  await shot('docs-desk-slides', 800);
  await s.close();
}
