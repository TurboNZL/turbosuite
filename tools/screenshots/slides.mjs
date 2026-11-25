import { session } from './lib.mjs';
// A three-slide deck: a title slide, a slide with a picture, and a bullet slide, in the "Ocean" theme.
const MD = process.env.MEDIA || 'media';
const s = await session({ w: 1440, h: 900 }); const { p, shot } = s;
await p.goto('http://127.0.0.1:5303/edit?new=pptx', { waitUntil: 'load' }); await p.waitForTimeout(2000);
const slideMenu = async (...path) => { await p.getByText('Slide', { exact: true }).first().click(); await p.waitForTimeout(250); for (const [i, label] of path.entries()) { const it = p.getByText(label, { exact: true }).first(); if (i < path.length - 1) await it.hover(); else await it.click(); await p.waitForTimeout(300); } };
const edit = async (hint, text, more = []) => { const bb = await p.locator('.slide-hint', { hasText: hint }).first().boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2; await p.mouse.click(cx, cy); await p.waitForTimeout(250); await p.mouse.dblclick(cx, cy); await p.waitForTimeout(400); await p.keyboard.press('Control+A'); await p.keyboard.type(text); for (const m of more) { await p.keyboard.press('Enter'); await p.keyboard.type(m); } await p.keyboard.press('Escape'); await p.waitForTimeout(300); };
const newSlide = async (layout) => { await p.getByText('New slide', { exact: true }).first().click(); await p.waitForTimeout(600); await slideMenu('Apply layout', layout); };
await edit('add title', 'Queenstown, in four days');
await edit('add subtitle', 'Where we are going, and what to pack');
await newSlide('Title only');
await edit('add title', 'Friday: the Routeburn day walk');
await p.locator('input[type=file]').last().setInputFiles(`${MD}/keep/trip.jpg`); await p.waitForTimeout(900);
await newSlide('Title and body');
await edit('add title', 'Packing list');
await edit('add text', 'Boots and two pairs of socks', ['Rain jacket', 'Headtorch and spare batteries', 'Two litres of water, snacks', 'Paper map']);
// the theme goes on last: it restyles every slide (and replaces any slide background)
await slideMenu('Change theme', process.env.DECK_THEME || 'Ocean');
await p.mouse.click(95, 215); await p.waitForTimeout(700);   // show the picture slide
await shot('docs-desk-slides', 600);
await s.close();
