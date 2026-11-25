// Sample pictures for the demo data. Drawn by code (SVG, rendered by Chromium): album covers, recipe pictures,
// and the frames of the two TurboCut clips. Not photographs and not made by an image model; they stand in for the
// pictures a real library would have, so the apps are not showing empty placeholders.
//   node media.mjs            -> media/covers/*.jpg, media/food/*.jpg, media/frames/<clip>/NNN.jpg (ffmpeg joins those, see README)
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? 'playwright');
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = process.env.MEDIA || 'media';
for (const d of ['covers', 'food', 'frames/morning', 'frames/closing', 'keep']) mkdirSync(`${OUT}/${d}`, { recursive: true });

const rng = (seed) => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const f = (n) => +n.toFixed(1);
const grain = (id = 'g', a = 0.18) => `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 ${a} 0"/></filter>`;
const wrap = (w, h, body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><defs>${defs}</defs>${body}</svg>`;

// ---------- album covers (800 x 800) ----------
const covers = {
  'low-tide-radio': () => wrap(800, 800, `
    <rect width="800" height="800" fill="url(#sky)"/>
    <circle cx="400" cy="430" r="150" fill="url(#sun)"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<path d="M0 ${470 + i * 34} q100 -${14 + i * 2} 200 0 t200 0 t200 0 t200 0 V800 H0Z" fill="hsl(${196 + i * 3} ${55 - i * 2}% ${38 - i * 3}%)" opacity="${0.92}"/>`).join('')}
    <text x="56" y="110" font-family="Inter Display" font-weight="800" font-size="74" fill="#fff6e6" letter-spacing="-2">LOW TIDE</text>
    <text x="58" y="168" font-family="Inter Display" font-weight="300" font-size="48" fill="#fff6e6" letter-spacing="12">RADIO</text>
    <text x="58" y="750" font-family="Inter" font-weight="500" font-size="26" fill="#ffe9c8" letter-spacing="6">HARBOUR LIGHTS</text>
    <rect width="800" height="800" filter="url(#g)"/>`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14305a"/><stop offset=".55" stop-color="#e0735a"/><stop offset="1" stop-color="#f6c177"/></linearGradient><radialGradient id="sun"><stop offset="0" stop-color="#fff2cc"/><stop offset="1" stop-color="#ffb35c"/></radialGradient>${grain()}`),
  'paper-lanterns': () => { const r = rng(11); return wrap(800, 800, `
    <rect width="800" height="800" fill="#12102b"/>
    ${Array.from({ length: 26 }, () => { const x = r() * 800, y = r() * 800, s = 28 + r() * 90, h = 14 + r() * 40; return `<g opacity="${f(0.55 + r() * 0.45)}"><circle cx="${f(x)}" cy="${f(y)}" r="${f(s * 1.9)}" fill="hsl(${h} 100% 55%)" opacity=".16"/><ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s * 0.62)}" ry="${f(s * 0.8)}" fill="hsl(${h} 95% ${58 + r() * 12}%)"/><rect x="${f(x - s * 0.18)}" y="${f(y - s * 0.86)}" width="${f(s * 0.36)}" height="${f(s * 0.1)}" fill="#3b2a1a"/></g>`; }).join('')}
    <rect width="800" height="800" fill="url(#vig)"/>
    <text x="400" y="690" text-anchor="middle" font-family="Charter" font-style="italic" font-size="84" fill="#fff1d6">Paper Lanterns</text>
    <text x="400" y="740" text-anchor="middle" font-family="Inter" font-size="22" letter-spacing="9" fill="#f1c88f">HARBOUR LIGHTS</text>
    <rect width="800" height="800" filter="url(#g)"/>`,
    `<radialGradient id="vig" cx=".5" cy=".4" r=".8"><stop offset=".5" stop-color="#12102b" stop-opacity="0"/><stop offset="1" stop-color="#05040f" stop-opacity=".85"/></radialGradient>${grain('g', 0.12)}`); },
  'furnace-hymns': () => wrap(800, 800, `
    <rect width="800" height="800" fill="#1a0f0c"/>
    ${[380, 320, 260, 200, 140, 80].map((r, i) => `<circle cx="400" cy="650" r="${r}" fill="none" stroke="hsl(${18 + i * 7} 92% ${46 + i * 5}%)" stroke-width="${22 - i * 2}"/>`).join('')}
    <rect y="650" width="800" height="150" fill="#1a0f0c"/>
    <path d="M0 650 H800" stroke="#e8571f" stroke-width="6"/>
    <text x="50" y="130" font-family="Inter Display" font-weight="900" font-size="104" fill="#f4e3c8" letter-spacing="-4">FURNACE</text>
    <text x="50" y="228" font-family="Inter Display" font-weight="900" font-size="104" fill="#e8571f" letter-spacing="-4">HYMNS</text>
    <text x="50" y="740" font-family="Inter" font-weight="600" font-size="28" fill="#f4e3c8" letter-spacing="8">THE EMBER ROOM</text>
    <rect width="800" height="800" filter="url(#g)"/>`, grain('g', 0.22)),
  'neon-circuit': () => wrap(800, 800, `
    <rect width="800" height="800" fill="url(#bg)"/>
    <circle cx="400" cy="400" r="190" fill="url(#sun)"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="180" y="${390 + i * 26}" width="440" height="${4 + i * 2.5}" fill="#1b0b3a"/>`).join('')}
    <rect y="470" width="800" height="330" fill="#14052e"/>
    ${Array.from({ length: 15 }, (_, i) => `<line x1="400" y1="470" x2="${-1200 + i * 200}" y2="800" stroke="#ff3ec9" stroke-width="2" opacity=".85"/>`).join('')}
    ${Array.from({ length: 9 }, (_, i) => `<line x1="0" y1="${470 + (i * i) * 5 + i * 8}" x2="800" y2="${470 + (i * i) * 5 + i * 8}" stroke="#3ee7ff" stroke-width="2" opacity=".8"/>`).join('')}
    <text x="400" y="110" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="92" fill="#fff" letter-spacing="14">NEON</text>
    <text x="400" y="190" text-anchor="middle" font-family="Inter Display" font-weight="300" font-size="62" fill="#3ee7ff" letter-spacing="30">CIRCUIT</text>
    <text x="400" y="770" text-anchor="middle" font-family="Inter" font-weight="600" font-size="24" fill="#ffc6f0" letter-spacing="10">NOVA CARTEL</text>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#190a45"/><stop offset="1" stop-color="#5b1a8c"/></linearGradient><linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe14d"/><stop offset="1" stop-color="#ff3e9a"/></linearGradient>`),
  'rooms-we-left': () => wrap(800, 800, `
    <rect width="800" height="800" fill="#ece0c8"/>
    <rect x="70" y="70" width="330" height="440" fill="#1f4e6b"/><rect x="400" y="70" width="330" height="200" fill="#d9a03a"/>
    <rect x="400" y="270" width="190" height="240" fill="#b8402e"/><rect x="590" y="270" width="140" height="240" fill="#2b2b2b"/>
    <rect x="130" y="140" width="110" height="160" fill="#ece0c8"/><rect x="250" y="140" width="110" height="160" fill="#ece0c8"/>
    <circle cx="660" cy="170" r="48" fill="#ece0c8"/>
    <text x="70" y="600" font-family="Inter Display" font-weight="800" font-size="86" fill="#1b1b1b" letter-spacing="-3">ROOMS WE</text>
    <text x="70" y="680" font-family="Inter Display" font-weight="800" font-size="86" fill="#b8402e" letter-spacing="-3">LEFT</text>
    <text x="72" y="748" font-family="Inter" font-weight="600" font-size="26" fill="#1b1b1b" letter-spacing="7">MARLOW QUARTET</text>
    <rect width="800" height="800" filter="url(#g)"/>`, grain('g', 0.28)),
  'long-field': () => wrap(800, 800, `
    <rect width="800" height="800" fill="url(#sky)"/>
    ${[['#9bb38a', 430, 0], ['#7f9b74', 500, 1], ['#5e7c58', 580, 2], ['#3f5c42', 670, 3]].map(([c, y, i]) => `<path d="M0 ${y} Q120 ${y - 60 - i * 8} 240 ${y - 20} T480 ${y - 30} T800 ${y - 50} V800 H0Z" fill="${c}"/>`).join('')}
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${40 + i * 55} 690 l14 -${60 + (i % 3) * 22} l14 ${60 + (i % 3) * 22}Z" fill="#26402b"/>`).join('')}
    <circle cx="560" cy="250" r="64" fill="#fbe9c0"/>
    <text x="56" y="112" font-family="Charter" font-weight="700" font-size="82" fill="#2d3b2a">The Long Field</text>
    <text x="58" y="160" font-family="Inter" font-size="22" letter-spacing="8" fill="#3f5c42">WILLOW &amp; THE WREN</text>
    <rect width="800" height="800" filter="url(#g)"/>`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6ecd6"/><stop offset="1" stop-color="#dfe7cf"/></linearGradient>${grain('g', 0.2)}`),
  'afterimage': () => { const r = rng(5); return wrap(800, 800, `
    <rect width="800" height="800" fill="#0a0a0f"/>
    ${Array.from({ length: 22 }, (_, j) => Array.from({ length: 22 }, (_, i) => { const d = Math.hypot(i - 11, j - 11); const s = Math.max(0, 15 - d * 1.15 + r() * 2); return s > 0.6 ? `<circle cx="${i * 36 + 22}" cy="${j * 36 + 22}" r="${f(s)}" fill="hsl(${190 + d * 9} 90% 62%)"/>` : ''; }).join('')).join('')}
    <text x="52" y="740" font-family="Inter Display" font-weight="200" font-size="110" fill="#fff" letter-spacing="-5">afterimage</text>
    <text x="56" y="62" font-family="Inter" font-size="22" letter-spacing="9" fill="#8fe3ff">NOVA CARTEL</text>`); },
  'small-hours': () => wrap(800, 800, `
    <rect width="800" height="800" fill="url(#bg)"/>
    <circle cx="560" cy="300" r="170" fill="#f4d9a8" opacity=".95"/><circle cx="610" cy="270" r="150" fill="#2a2150"/>
    ${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 197) % 800}" cy="${(i * 113) % 520}" r="${1 + (i % 3)}" fill="#fff" opacity="${0.4 + (i % 5) / 8}"/>`).join('')}
    <path d="M0 640 L120 540 L210 610 L330 500 L450 620 L560 540 L690 630 L800 560 V800 H0Z" fill="#171233"/>
    <path d="M0 720 L160 650 L300 710 L470 640 L640 710 L800 660 V800 H0Z" fill="#0d0a22"/>
    <text x="56" y="108" font-family="Charter" font-size="88" font-style="italic" fill="#f4d9a8">small hours</text>
    <text x="400" y="770" text-anchor="middle" font-family="Inter" font-size="22" letter-spacing="9" fill="#bdb3e8">MARLOW QUARTET</text>
    <rect width="800" height="800" filter="url(#g)"/>`,
    `<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2150"/><stop offset="1" stop-color="#6b3b6e"/></linearGradient>${grain('g', 0.15)}`),
};

// ---------- recipe pictures (1000 x 750): top-down, a plate on a table ----------
const table = (c1, c2) => `<rect width="1000" height="750" fill="url(#tb)"/>${[...Array(18)].map((_, i) => `<rect x="0" y="${i * 42}" width="1000" height="3" fill="#000" opacity=".06"/>`).join('')}`;
const tableDefs = (c1, c2) => `<linearGradient id="tb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter><filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>${grain('g', 0.16)}`;
const plate = (cx, cy, r, fill = '#f6f3ee') => `<circle cx="${cx + 10}" cy="${cy + 20}" r="${r}" fill="#000" opacity=".35" filter="url(#sh)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.86}" fill="none" stroke="#000" stroke-opacity=".07" stroke-width="6"/>`;
const blob = (x, y, rx, ry, rot, fill, extra = '') => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" transform="rotate(${f(rot)} ${f(x)} ${f(y)})" fill="${fill}" ${extra}/>`;
const food = {
  risotto: () => { const r = rng(3); let s = table('#6b4a33', '#4a3022') + plate(500, 375, 300) + `<circle cx="500" cy="375" r="235" fill="#e9dcb6"/>`;
    for (let i = 0; i < 520; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 225; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 9, 4, r() * 180, `hsl(${44 + r() * 8} ${35 + r() * 20}% ${80 + r() * 12}%)`); }
    for (let i = 0; i < 20; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 190; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 30 + r() * 14, 17 + r() * 6, r() * 180, `hsl(${28 + r() * 8} 38% ${42 + r() * 14}%)`) + blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 16, 7, r() * 180, '#bd9a6e', 'opacity=".6"'); }
    for (let i = 0; i < 38; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 200; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 8, 3.5, r() * 180, '#4f8a3c'); }
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = 60 + r() * 150; s += `<path d="M${f(500 + Math.cos(a) * d)} ${f(375 + Math.sin(a) * d)} l22 8" stroke="#fff6dc" stroke-width="5" stroke-linecap="round" opacity=".9"/>`; }
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', tableDefs('#6b4a33', '#4a3022')); },
  chicken: () => { const r = rng(8); let s = `<rect width="1000" height="750" fill="#5d6469"/>` + `<rect x="60" y="50" width="880" height="650" rx="26" fill="#2f3438"/><rect x="80" y="70" width="840" height="610" rx="18" fill="#868e94"/>`;
    for (let i = 0; i < 20; i++) { const x = 130 + r() * 740, y = 130 + r() * 500; s += `<rect x="${f(x)}" y="${f(y)}" width="${f(60 + r() * 30)}" height="${f(50 + r() * 26)}" rx="14" transform="rotate(${f(r() * 90)} ${f(x)} ${f(y)})" fill="hsl(${38 + r() * 8} 78% ${62 + r() * 10}%)" stroke="#b9792c" stroke-width="5"/>`; }
    for (let k = 0; k < 8; k++) { const x = 170 + (k % 4) * 205 + r() * 30, y = 190 + Math.floor(k / 4) * 260 + r() * 30; s += blob(x, y, 100, 52, -20 + r() * 40, `hsl(${27 + r() * 6} 82% ${42 + r() * 6}%)`, 'stroke="#7a3a12" stroke-width="5"') + blob(x - 22, y - 12, 56, 22, -20, '#f0a352', 'opacity=".5"'); }
    for (let k = 0; k < 3; k++) { const x = 250 + k * 250, y = 150 + (k % 2) * 380; s += `<circle cx="${x}" cy="${y}" r="62" fill="#f6d84c"/><circle cx="${x}" cy="${y}" r="46" fill="none" stroke="#fff3a6" stroke-width="4"/>${[0, 1, 2, 3, 4, 5].map((j) => `<line x1="${x}" y1="${y}" x2="${f(x + Math.cos(j * 1.047) * 46)}" y2="${f(y + Math.sin(j * 1.047) * 46)}" stroke="#fff3a6" stroke-width="3"/>`).join('')}`; }
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', grain('g', 0.12) + '<filter id="sh"/>'); },
  pancakes: () => { let s = table('#d9cdb8', '#bfb094') + plate(500, 390, 290, '#ffffff');
    for (let i = 0; i < 4; i++) s += `<ellipse cx="${500 + i * 4}" cy="${430 - i * 34}" rx="205" ry="66" fill="hsl(${32 - i} 70% ${48 + i * 3}%)"/><ellipse cx="${500 + i * 4}" cy="${418 - i * 34}" rx="205" ry="62" fill="hsl(${36 - i} 74% ${62 + i * 2}%)"/>`;
    const r = rng(4); for (let i = 0; i < 9; i++) { const a = i * 0.7; s += `<ellipse cx="${f(500 + Math.cos(a) * 95)}" cy="${f(262 + Math.sin(a) * 26)}" rx="42" ry="17" fill="#f7e7a8" stroke="#d8c06a" stroke-width="3"/>`; }
    s += `<path d="M360 300 C420 350 450 270 520 330 S 640 290 650 360" stroke="#b9561c" stroke-width="22" fill="none" stroke-linecap="round" opacity=".9"/>`;
    for (let i = 0; i < 60; i++) s += blob(380 + r() * 250, 270 + r() * 100, 3, 3, 0, '#7a4a1e', 'opacity=".55"');
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', tableDefs('#d9cdb8', '#bfb094')); },
  spaghetti: () => { const r = rng(12); let s = table('#3d3a38', '#262423') + plate(500, 375, 305, '#f2efe9') + `<circle cx="500" cy="375" r="215" fill="#d7a64c"/>`;
    for (let i = 0; i < 70; i++) { const a0 = r() * 6.28, rad = 40 + r() * 175, sw = 0.9 + r() * 1.6; s += `<path d="M${f(500 + Math.cos(a0) * rad)} ${f(375 + Math.sin(a0) * rad)} A ${f(rad)} ${f(rad * (0.7 + r() * 0.3))} ${f(r() * 90)} 0 1 ${f(500 + Math.cos(a0 + sw) * rad)} ${f(375 + Math.sin(a0 + sw) * rad)}" fill="none" stroke="hsl(${42 + r() * 6} ${70 + r() * 15}% ${58 + r() * 14}%)" stroke-width="${f(6 + r() * 4)}" stroke-linecap="round"/>`; }
    for (let i = 0; i < 26; i++) { const a = r() * 6.28, d = r() * 190; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 14, 8, r() * 180, '#fff3c4') + blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 9, 5, r() * 180, '#e9d38a', 'opacity=".8"'); }
    for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = r() * 195; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 9, 3.5, r() * 180, '#3f7d2c'); }
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = r() * 170; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 8, 4, r() * 180, '#c8281c'); }
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', tableDefs('#3d3a38', '#262423')); },
  dal: () => { const r = rng(21); let s = table('#8c5a2e', '#5e3b1d') + plate(500, 375, 300, '#2f4a56') + `<circle cx="500" cy="375" r="250" fill="#e2a024"/><circle cx="500" cy="375" r="250" fill="url(#sw)"/>`;
    s += `<path d="M360 330 C400 250 520 260 540 340 S 470 440 400 410" fill="none" stroke="#fff7e3" stroke-width="26" stroke-linecap="round" opacity=".92"/><path d="M400 410 C420 460 520 470 560 420" fill="none" stroke="#fff7e3" stroke-width="16" stroke-linecap="round" opacity=".8"/>`;
    for (let i = 0; i < 260; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 235; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 4 + r() * 3, 3, r() * 180, `hsl(${38 + r() * 10} 85% ${40 + r() * 20}%)`, 'opacity=".7"'); }
    for (let i = 0; i < 34; i++) { const a = r() * 6.28, d = 40 + r() * 190; s += blob(500 + Math.cos(a) * d, 375 + Math.sin(a) * d, 12, 5, r() * 180, '#3f8a3a'); }
    s += `<circle cx="820" cy="170" r="110" fill="#f4f0e6"/><circle cx="820" cy="170" r="92" fill="#fff"/>`; for (let i = 0; i < 120; i++) s += blob(820 + (r() - 0.5) * 160, 170 + (r() - 0.5) * 160, 8, 3.5, r() * 180, '#f3ecd8');
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', tableDefs('#8c5a2e', '#5e3b1d') + '<radialGradient id="sw"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#7b3c00" stop-opacity=".45"/></radialGradient>'); },
  greek: () => { const r = rng(30); let s = table('#c7b99c', '#a99a7b') + plate(500, 375, 310, '#2b5f7a') + `<circle cx="500" cy="375" r="262" fill="#f1efe6"/>`;
    for (let i = 0; i < 16; i++) { const a = i * 0.39 + r() * 0.2, d = 140 + r() * 70; const x = 500 + Math.cos(a) * d, y = 375 + Math.sin(a) * d; s += `<path d="M${f(x)} ${f(y)} m-46 0 a46 46 0 0 1 92 0 z" transform="rotate(${f(a * 57 + 90)} ${f(x)} ${f(y)})" fill="#d3311f"/><path d="M${f(x)} ${f(y)} m-30 0 a30 30 0 0 1 60 0 z" transform="rotate(${f(a * 57 + 90)} ${f(x)} ${f(y)})" fill="#ef6a4c" opacity=".8"/>`; }
    for (let i = 0; i < 22; i++) { const a = r() * 6.28, d = r() * 190; s += `<circle cx="${f(500 + Math.cos(a) * d)}" cy="${f(375 + Math.sin(a) * d)}" r="30" fill="#9fcb7d"/><circle cx="${f(500 + Math.cos(a) * d)}" cy="${f(375 + Math.sin(a) * d)}" r="21" fill="#d9ecb8"/><circle cx="${f(500 + Math.cos(a) * d)}" cy="${f(375 + Math.sin(a) * d)}" r="3" fill="#6ea85a"/>`; }
    for (let i = 0; i < 9; i++) { const a = r() * 6.28, d = r() * 150; s += `<circle cx="${f(500 + Math.cos(a) * d)}" cy="${f(375 + Math.sin(a) * d)}" r="30" fill="none" stroke="#b83a6b" stroke-width="7" opacity=".85"/>`; }
    s += `<rect x="410" y="320" width="190" height="110" rx="10" transform="rotate(-8 505 375)" fill="#fffdf3" stroke="#e8e2c9" stroke-width="4"/>`;
    for (let i = 0; i < 22; i++) s += blob(430 + r() * 150, 330 + r() * 90, 6, 4, r() * 180, '#4f7a2a', 'opacity=".65"');
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = 130 + r() * 110; s += `<ellipse cx="${f(500 + Math.cos(a) * d)}" cy="${f(375 + Math.sin(a) * d)}" rx="20" ry="13" fill="#2d1f2e"/><ellipse cx="${f(500 + Math.cos(a) * d - 4)}" cy="${f(375 + Math.sin(a) * d - 3)}" rx="6" ry="3" fill="#5c4a5e"/>`; }
    return wrap(1000, 750, s + '<rect width="1000" height="750" filter="url(#g)"/>', tableDefs('#c7b99c', '#a99a7b')); },
};

// ---------- a few more pictures (TurboKeep notes, the TurboDocs deck) ----------
const keep = {
  trip: () => wrap(1200, 700, `<rect width="1200" height="700" fill="url(#s)"/><circle cx="880" cy="190" r="70" fill="#fff0c8"/>${[['#8fa6c6', 380, 330], ['#6b84a8', 460, 250], ['#4a6288', 540, 190], ['#2f4468', 620, 120]].map(([c, y, h], i) => `<path d="M0 ${y} L${160 + i * 70} ${y - h} L${300 + i * 60} ${y - 40} L${470 + i * 40} ${y - h * 0.9} L${640 - i * 20} ${y - 30} L${830 - i * 40} ${y - h * 1.05} L${1000 - i * 30} ${y - 40} L1200 ${y - h * 0.6} V700 H0Z" fill="${c}"/>`).join('')}<path d="M0 640 Q300 580 600 630 T1200 600 V700 H0Z" fill="#1f3a52"/><path d="M0 660 Q300 620 600 650 T1200 630 V700 H0Z" fill="#17304a"/>`,
    `<linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9ac3e6"/><stop offset="1" stop-color="#f3e3cf"/></linearGradient>`),
  bread: () => wrap(1200, 700, `<rect width="1200" height="700" fill="#cdbba0"/><rect width="1200" height="700" fill="url(#w)"/><ellipse cx="620" cy="390" rx="360" ry="210" fill="#000" opacity=".25" filter="url(#b)"/><ellipse cx="600" cy="360" rx="350" ry="205" fill="#c88a3c"/><ellipse cx="600" cy="340" rx="330" ry="185" fill="#dba557"/>${[0, 1, 2, 3].map((i) => `<path d="M${330 + i * 120} 250 q${50} ${140} ${-30} ${210}" stroke="#f6e3bd" stroke-width="22" fill="none" stroke-linecap="round" opacity=".9"/>`).join('')}${Array.from({ length: 160 }, (_, i) => `<circle cx="${290 + (i * 97) % 640}" cy="${200 + (i * 61) % 320}" r="${2 + i % 3}" fill="#9a5f20" opacity=".35"/>`).join('')}`,
    `<filter id="b"><feGaussianBlur stdDeviation="22"/></filter><linearGradient id="w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>`),
};

// ---------- the TurboCut clips: 1080 x 1920, drawn per frame ----------
const clipFrame = (kind, t) => {
  const W = 1080, H = 1920;
  if (kind === 'morning') { // a sunrise over a harbour, the sun climbing and boats drifting
    const p = 0.3 + 0.7 * Math.min(1, t / 8), sunY = 1180 - p * 640, hue = 14 + p * 28;
    return wrap(W, H, `<rect width="${W}" height="${H}" fill="url(#sky)"/><circle cx="540" cy="${f(sunY)}" r="230" fill="#fff0c4" opacity=".28"/><circle cx="540" cy="${f(sunY)}" r="150" fill="url(#sun)"/>
      ${[0, 1, 2].map((i) => `<path d="M0 ${1180 - i * 40} L${180 + i * 90} ${1060 - i * 80} L${380 + i * 20} ${1180 - i * 40}Z M${600 - i * 80} ${1180 - i * 40} L${820 + i * 30} ${1020 - i * 70} L1080 ${1180 - i * 40} V1200 H0Z" fill="hsl(${230 - i * 8} 30% ${24 + i * 6}%)"/>`).join('')}
      <rect y="1180" width="${W}" height="740" fill="url(#sea)"/>
      ${Array.from({ length: 26 }, (_, i) => `<rect x="${f(300 + Math.sin(i * 1.7 + t * 1.5) * 90 + (i % 5) * 20)}" y="${1210 + i * 26}" width="${f(480 - i * 14)}" height="5" rx="3" fill="#fff1c9" opacity="${f(0.55 - i * 0.018)}"/>`).join('')}
      ${[[200, 1320, 1], [780, 1460, 1.4]].map(([x, y, s], i) => `<g transform="translate(${f(x + Math.sin(t * 0.8 + i) * 30)} ${f(y + Math.sin(t * 1.6 + i) * 6)}) scale(${s})"><path d="M-70 0 h140 l-26 34 h-88z" fill="#1b2230"/><path d="M0 -150 v146 M0 -146 l62 104 h-62z" stroke="#1b2230" stroke-width="5" fill="#f7e4c2"/></g>`).join('')}`,
      `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${236 - p * 20} 52% ${22 + p * 22}%)"/><stop offset=".6" stop-color="hsl(${hue + 6} 85% ${52 + p * 8}%)"/><stop offset="1" stop-color="hsl(${hue + 20} 90% 70%)"/></linearGradient><radialGradient id="sun"><stop offset="0" stop-color="#fffbe6"/><stop offset="1" stop-color="#ffb84a"/></radialGradient><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a068"/><stop offset=".3" stop-color="#2a4a7a"/><stop offset="1" stop-color="#101c34"/></linearGradient>`);
  }
  const p = t / 6; // closing: city lights at dusk with a slow pan
  return wrap(W, H, `<rect width="${W}" height="${H}" fill="url(#sky)"/>${Array.from({ length: 50 }, (_, i) => `<circle cx="${(i * 211) % W}" cy="${(i * 137) % 700}" r="${1 + (i % 3)}" fill="#fff" opacity="${f(0.3 + 0.4 * Math.abs(Math.sin(t * 2 + i)))}"/>`).join('')}
    <circle cx="${f(820 - p * 140)}" cy="360" r="110" fill="#fbe4b8"/><circle cx="${f(870 - p * 140)}" cy="335" r="98" fill="#4a2d7a"/>
    ${Array.from({ length: 16 }, (_, i) => { const x = i * 80 - 40 - p * 90, h = 380 + ((i * 97) % 520); return `<rect x="${f(x)}" y="${1500 - h}" width="76" height="${h + 420}" fill="hsl(255 35% ${12 + (i % 3) * 3}%)"/>${Array.from({ length: Math.floor(h / 56) }, (_, j) => (i * 7 + j * 3) % 4 ? `<rect x="${f(x + 12 + (j % 2) * 30)}" y="${1520 - h + j * 56}" width="22" height="30" fill="#ffd27a" opacity="${(i + j) % 5 ? 0.9 : 0.35}"/>` : '').join('')}`; }).join('')}`,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1240"/><stop offset=".55" stop-color="#8e3d83"/><stop offset="1" stop-color="#f08a6a"/></linearGradient>`);
};

const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await b.newPage({ viewport: { width: 800, height: 800 } });
const render = async (svg, w, h, path, q = 90) => { await page.setViewportSize({ width: w, height: h }); await page.setContent(`<body style="margin:0;background:#000">${svg}</body>`); await page.screenshot({ path, type: 'jpeg', quality: q }); };
for (const [k, fn] of Object.entries(covers)) { await render(fn(), 800, 800, `${OUT}/covers/${k}.jpg`); console.log('cover', k); }
for (const [k, fn] of Object.entries(food)) { await render(fn(), 1000, 750, `${OUT}/food/${k}.jpg`); console.log('food', k); }
for (const [k, fn] of Object.entries(keep)) { await render(fn(), 1200, 700, `${OUT}/keep/${k}.jpg`); console.log('keep', k); }
if (!process.env.NO_FRAMES) for (const [kind, secs] of [['morning', 8], ['closing', 6]]) {
  await page.setViewportSize({ width: 1080, height: 1920 });
  for (let i = 0; i < secs * 15; i++) { await page.setContent(`<body style="margin:0;background:#000">${clipFrame(kind, i / 15)}</body>`); await page.screenshot({ path: `${OUT}/frames/${kind}/${String(i).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 80 }); }
  console.log('frames', kind);
}
await b.close();
writeFileSync(`${OUT}/README.txt`, 'Drawn by tools/screenshots/media.mjs. Not photographs, not made by an image model.\n');
