#!/usr/bin/env node
// Writes site/index.html and site/about/index.html from the data below. The output is committed (Cloudflare Pages serves site/ as it is, no build step);
// run this after changing the copy or the list of screenshots:  node scripts/make-pages.mjs
// Every screenshot exists twice, <name>-dark.webp and <name>-light.webp (tools/screenshots), and the page shows the one that matches the current look.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const site = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const GH = 'https://github.com/TurboNZL';
const SCREENS = join(site, 'img', 'screens');

// shots: [file, tab label, caption, width, height]; phones: [file, caption]
const apps = [
  { id: 'turbomusic', name: 'TurboMusic', color: '#a855f7', kind: 'App', icon: 'turbomusic',
    tag: 'Rank your music by asking one question: which is better?',
    body: 'A music library manager for someone who owns their files and cares what ranks first. Head-to-head votes become a 0 to 10 rating for every track, and everything keeps working offline.',
    facts: [['Votes', 'An append-only log. Ratings are replayed from it, so voting on several devices merges cleanly.'], ['Playing', 'A real queue, rules like “always play B right after A”, crossfade, a ten-band equaliser and synced lyrics.'], ['Library', 'Eras, albums, releases and notes, with search chips like <code>artist:</code> and <code>rating:</code>.'], ['Sync', 'Each client holds the whole library and syncs with a small server, for example on a Raspberry Pi.']],
    runs: ['Web (installable)', 'Windows', 'Linux', 'Android and Android Auto', 'self-hosted server'], status: 'Feature complete and in daily use, says its README.', licence: 'MIT',
    where: 'Web, desktop and Android clients with a small server (a Pi works)', port: '47813', blurb: 'Library manager that ranks tracks by head-to-head votes.',
    links: [['Get it', 'turbomusic/releases', true], ['Source', 'turbomusic']],
    shots: [['music-desk-home', 'Home', 'Home: the weekly recap, library stats and a month of listening.', 1440, 900], ['music-desk-albums', 'Albums', 'The album grid, every cover a picture of its own.', 1440, 900], ['music-desk-rank', 'Rank', 'Head to head: two tracks, one question.', 1440, 900], ['music-desk-album', 'An album', 'An album page with per-track ratings and its releases.', 1440, 900], ['music-desk-tracks', 'Tracks', 'All tracks, sorted by rating.', 1440, 900]] },
  { id: 'turbopantry', name: 'TurboPantry', color: '#3ddc97', kind: 'App', icon: 'turbopantry',
    tag: 'A recipe box, a pantry and a shopping list that stays in sync.',
    body: 'Import recipes from websites, keep them in one place, and add only the ingredients you are missing to a list shared by everyone in the home.',
    facts: [['Recipes', 'A recipe shows what you already have and adds just the rest to the list. Scale servings, switch unit modes, mark “I cooked this”.'], ['Shopping', 'The list updates live on every phone; ticking things off puts them in the pantry.'], ['On a phone', 'Built phone first: bottom navigation, big touch targets, steppers instead of typing.'], ['Hosting', 'A few accounts on one self-hosted server, and no paid service anywhere.']],
    runs: ['Web (phone first)', 'self-hosted server', 'Android (early)'], status: 'The web app is the main thing; the Android build is early.', licence: 'MIT',
    where: 'A self-hosted server with a phone-first web app, and an early Android app', port: '47900', blurb: 'Recipe box, pantry and a shared shopping list.',
    links: [['Get it', 'turbopantry/releases', true], ['Source', 'turbopantry']],
    shots: [['pantry-desk-recipes', 'Recipes', 'The recipe box.', 1440, 900], ['pantry-desk-recipe', 'A recipe', 'A recipe with its ingredients checked against the pantry.', 1440, 900], ['pantry-desk-shopping', 'Shopping list', 'The shared shopping list, grouped by section of the shop.', 1440, 900]],
    phones: [['pantry-phone-recipes', 'The recipe box on a phone.'], ['pantry-phone-pantry', 'The pantry: what is in the house and how much.'], ['pantry-phone-shopping', 'The shopping list on a phone.']] },
  { id: 'turbokeep', name: 'TurboKeep', color: '#ffb020', kind: 'App', icon: 'turbokeep',
    tag: 'To-dos and notes in one small app.',
    body: 'There is one kind of thing: you type something and it is on your list. Tick it to finish it, or send it to tags to keep it.',
    facts: [['Tags', 'With emoji and colour that tint the items, nested, and an optional wall of cards.'], ['Careful', 'Warns instead of overwriting when the same item changed on another device.'], ['Leaving', 'Imports and exports Standard Notes, Vikunja and its own backup, so you can go at any time.'], ['Android', 'An app with a home-screen widget, quick add and a share target.']],
    runs: ['Web', 'Android', 'self-hosted server'], status: 'Web and server first; the Android app is early.', licence: 'MIT',
    where: 'A self-hosted server (a systemd service, one command to install), web and Android', port: '47901', blurb: 'To-dos and notes, tags, import and export.',
    links: [['Get it', 'turbokeep/releases', true], ['Source', 'turbokeep']],
    shots: [['keep-desk-home', 'Tasks', 'Tasks, with tags on the left and what is due soon beside them.', 1440, 900], ['keep-desk-wall', 'The wall', 'The same notes as a wall of cards, tinted by their tags.', 1440, 900], ['keep-desk-note', 'A note', 'A note opened in place in the list.', 1440, 900]],
    phones: [['keep-phone-home', 'TurboKeep on a phone.']] },
  { id: 'turbocut', name: 'TurboCut', color: '#14c8d8', kind: 'App', icon: 'turbocut',
    tag: 'A lightweight video editor for short vertical clips.',
    body: 'A multi-track editor for short vertical videos, and longer 16:9 edits too, with automatic captions built in.',
    facts: [['Timeline', 'Multi-track video and audio at 60 fps, with keyframes on every setting.'], ['Captions', 'Automatic captions from a local Whisper model, with caption styles and fonts.'], ['Files', 'Exports MP4 or WebM in the app. Projects are small <code>.turbocut</code> files.'], ['One codebase', 'Web, wrapped for Windows and Ubuntu (Electron) and Android (Capacitor).']],
    runs: ['Windows', 'Ubuntu', 'Android', 'Web'], status: 'Builds for each platform; every push publishes a release.', licence: 'MIT',
    where: 'Windows, Ubuntu and Android apps, or served from a web bundle', port: 'the web server takes <code>--port</code>', blurb: 'Multi-track video editor with automatic captions.',
    links: [['Get it', 'turbocut/releases', true], ['Source', 'turbocut']],
    shots: [['cut-desk-edit', null, 'Two clips on the timeline with captions on their own track. The footage is a drawn sample clip, not a camera recording.', 1440, 900]] },
  { id: 'turbodocs', name: 'TurboDocs', color: '#1fc8a9', kind: 'App', icon: 'turbodocs',
    tag: 'Documents, spreadsheets and presentations as small apps in one shell.',
    body: 'Docs, Sheets and Slides install into one themed desktop shell and open and save real Word, Excel and PowerPoint files.',
    facts: [['Docs', 'Edits <code>.docx</code>, Markdown and plain text, pageless.'], ['Sheets', 'Opens <code>.xlsx</code> and <code>.csv</code>. Formulas are kept, but not calculated yet.'], ['Slides', 'Edits <code>.pptx</code> with a full-screen show and speaker notes.'], ['The shell', 'Add or remove each app in Settings; the desktop shell updates itself.']],
    runs: ['Linux', 'Windows', 'Desktop (Electron)'], status: 'All three apps open, edit and save.', licence: 'MIT',
    where: 'A desktop app for Linux and Windows', port: 'none', blurb: 'Docs, Sheets and Slides in one themed shell.',
    links: [['Get it', 'turbodocs/releases', true], ['Source', 'turbodocs']],
    note: 'Opening and saving files needs the desktop app. These captures are of the web client, which runs the same editors.',
    shots: [['docs-desk-doc', 'Docs', 'A document in Docs, with a picture in it.', 1440, 900], ['docs-desk-sheet', 'Sheets', 'A small spreadsheet in Sheets.', 1440, 900], ['docs-desk-slides', 'Slides', 'A three-slide deck in Slides, one slide with a picture.', 1440, 900]] },
  { id: 'turbobudget', name: 'TurboBudget', color: '#1068f4', kind: 'App', icon: 'turbobudget',
    tag: 'A budget that runs entirely in your browser.',
    body: 'Accounts, subscriptions, debts, interest, taxes, a history timeline and a lot of graphs. There is no server and no account: your data never leaves your device.',
    facts: [['Money in, out', 'Transactions, transfers between accounts and categories, with undo on delete.'], ['Recurring', 'Subscriptions from daily to every two years, yours, someone else’s, or a loan with a person.'], ['Debts', 'Repayment history, plus an NZ student loan preset.'], ['Your data', 'Lives in your browser and in <code>.db</code> files you export yourself.']],
    runs: ['Browser only', 'no account', 'NZD, USD, EUR'], status: 'Runs entirely in the browser.', licence: 'MIT',
    where: 'A static page in your browser, nothing to host but the files', port: 'none', blurb: 'Accounts, subscriptions, debts and graphs, in the browser.',
    links: [['Open the web app', 'https://web.turbobudget.prismalite.org', true, true], ['Get it', 'turbobudget/releases'], ['Source', 'turbobudget']],
    note: 'Runs entirely in your browser, so the web app is the app. Saved data is kept per address, so it stays on the device and address you used.',
    shots: [['budget-desk-accounts', 'Accounts', 'Accounts and recent transactions.', 1440, 900], ['budget-desk-subs', 'Subscriptions', 'Recurring payments, with a projection.', 1440, 900], ['budget-desk-debts', 'Debts', 'Money owed, and money owed to you.', 1440, 560], ['budget-desk-graphs', 'Graphs', 'Spending by category, debt by person and balances.', 1440, 900]] },
  { id: 'turbobox', name: 'TurboBox', color: '#a6e22e', kind: 'App', icon: 'turbobox',
    tag: 'Keeps your web pages running in the background.',
    body: 'An Android app for pinning a video, a stream or a web app, opening it with one tap, running two at once, and keeping them alive with the screen off. It can record what you missed, and a workflow can click through a page for you.',
    facts: [['Pinned pages', 'Up to four running at once, as tabs or in a split view, with a small floating window to keep one up while you use another app.'], ['Sound', 'Choose the microphone, mute a page for good, and set page and microphone volume separately.'], ['Missed it?', 'A recording buffer: step away and the page keeps recording; come back and play what you missed faster than real time.'], ['Privacy', 'No server, no account, no analytics. Pages, sign-ins and recordings stay on the phone.']],
    runs: ['Android 8 or newer'], status: 'Early. Its README says it was checked off a phone and may need fixes on a real device.', licence: 'MIT',
    where: 'An Android app. No server, no account', port: 'none', blurb: 'Android app that keeps pinned web pages running with the screen off.',
    links: [['Get it', 'turbobox/releases', true], ['Source', 'turbobox']],
    nopic: ['No screenshots yet', 'TurboBox is an Android app, and the captures on this page are made by running each app on a computer. Nothing here could run it on a phone, so rather than show a mock-up there is nothing to show. Its README has the details.'] },
  { id: 'turbomc-server', name: 'TurboMC Server', color: '#4a78c9', kind: 'App', icon: 'turbomc-server',
    tag: 'Run, update and manage your Minecraft servers from one familiar window.',
    body: 'A desktop app that keeps every Minecraft server in one list, the way Prism Launcher keeps game installs: pick a version, install mods or plugins from Modrinth, change versions with one click, and start the server with a live console. No Docker, no panel, no web server to babysit.',
    facts: [['Install', 'Vanilla, Paper, Purpur or Fabric, with the download checked against the provider’s checksum when one is published.'], ['Console', 'Start, stop with a save, or kill. Type commands, search the log, warnings and errors in colour.'], ['Changes', 'Switch software or version from one page. Nothing updates on its own, and a world backup is taken before a version change.'], ['A fork', 'It is a fork of Prism Launcher and is not affiliated with that project, Mojang or Microsoft.']],
    runs: ['Linux (.deb, rolling nightly)', 'Windows and macOS planned'], status: 'Early development. The Linux package is built by an untested CI job.', licence: 'GPL-3.0 (a fork of Prism Launcher)',
    where: 'A desktop app built with Qt 6 and C++ (Linux .deb as a rolling nightly)', port: 'none', blurb: 'Desktop app for installing and running Minecraft servers.',
    links: [['Nightly build', 'turbomc-server/releases/tag/nightly', true], ['Source', 'turbomc-server']],
    nopic: ['No screenshots yet', 'TurboMC Server has to be built with Qt 6.8, which was not available where these captures were made, so it has not been run for this page. TurboUI below draws a screen of the same kind with its own renderer.'] },
  { id: 'turboui', name: 'TurboUI', color: '#e8571f', kind: 'Toolkit', icon: null, tile: 'UI',
    tag: 'One way to describe a screen, drawn natively on each platform.',
    body: 'Not an app: a toolkit. A screen is written once, in Rust, from plain building blocks (boxes, text) and named theme tokens. TurboUI works out where everything goes, and a thin backend per platform draws the result. TurboMC Server is its first user.',
    facts: [['Themes', 'Palettes are generated from the engine’s real colour themes, with a flat style and a Liquid Glass one, so the colours match the web apps exactly.'], ['Backends', 'Desktop through GPUI, and a software renderer that is also the reference. Android, iOS and the web are not started.'], ['Checked by', 'Layout tests and golden-image tests that need no GPU, plus a test that the real GPUI output matches the reference.'], ['Missing', 'Text input, scrolling, hover, images and animation. It is version zero.']],
    runs: ['Rust 1.88 or newer', 'cargo test'], status: 'Version zero. Layout and the reference renderer are tested.', licence: 'MIT',
    where: 'A Rust workspace: <code>cargo run -p turboui-demo</code>', port: 'none', blurb: 'Rust toolkit that lays a screen out once and draws it natively.',
    links: [['Source', 'turboui', true]],
    shots: [['turboui-demo', null, 'TurboUI’s demo screen, a server list in the style of TurboMC Server, drawn by TurboUI’s own software renderer.', 1200, 760]] },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const plain = (s) => s.replace(/<[^>]+>/g, '');
const num = (i) => String(i + 1).padStart(2, '0');

function pic(file, w, h, alt, { lazy = true, priority = false, cls = '' } = {}) {
  const a = lazy ? ' loading="lazy" decoding="async"' : priority ? ' fetchpriority="high"' : '';
  return ['dark', 'light'].map((m) => {
    const src = `img/screens/${file}-${m}.webp`;
    if (!existsSync(join(site, src))) throw new Error(`missing ${src}`);
    return `<img class="shot-${m}${cls ? ' ' + cls : ''}" src="/${src}" width="${w}" height="${h}" alt="${esc(alt)}"${a}>`;
  }).join('');
}

function linkHtml([label, href, primary, ext]) {
  const url = /^https?:/.test(href) ? href : `${GH}/${href}`;
  return primary ? `<a class="btn btn-accent" href="${url}"${ext ? ' rel="noopener"' : ''}>${label}</a>` : `<a class="textlink" href="${url}">${label}</a>`;
}

function appHtml(a, i) {
  const rail = `<div class="rail"><span class="num" aria-hidden="true">${num(i)}</span>${a.icon ? `<img src="/img/apps/${a.icon}.png" width="64" height="64" alt="">` : `<span class="ui-tile" style="width:4.2rem;height:4.2rem;font-size:1.5rem;margin-top:1rem" aria-hidden="true">${a.tile}</span>`}<dl><div><dt>Kind</dt><dd>${a.kind}</dd></div><div><dt>Status</dt><dd>${a.status}</dd></div><div><dt>Licence</dt><dd>${a.licence}</dd></div></dl></div>`;
  let show = '';
  if (a.shots) {
    const tabs = a.shots.length > 1 ? `<div class="tabs" role="group" aria-label="${a.name} screenshots">${a.shots.map((s, j) => `<button type="button" class="tab bt-tab" aria-pressed="${j === 0}" data-show="${j}">${s[1]}</button>`).join('')}</div>` : '';
    const figs = a.shots.map((s) => `<figure class="stage" data-shot><div class="shot card frame">${pic(s[0], s[3], s[4], s[2])}</div><figcaption>${s[2]}</figcaption></figure>`).join('');
    const phones = a.phones ? `<div class="phones">${a.phones.map((p) => `<figure><div class="shot card frame phone">${pic(p[0], 390, 844, p[1])}</div><figcaption>${p[1]}</figcaption></figure>`).join('')}</div>` : '';
    show = `<div class="showcase"><div class="stage-wrap" data-tabs>${tabs}${figs}</div>${phones}</div>`;
  } else if (a.nopic) show = `<div class="showcase"><div class="nopic"><strong>${a.nopic[0]}</strong><p>${a.nopic[1]}</p></div></div>`;
  return `
  <section class="app reveal" id="${a.id}" style="--app:${a.color}" aria-labelledby="${a.id}-h">
    <div class="wrap app-grid">
      ${rail}
      <div class="app-main">
        <h2 id="${a.id}-h">${a.name}</h2>
        <p class="tag">${a.tag}</p>
        <p class="body">${a.body}</p>
        <dl class="facts">${a.facts.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>
        <p class="runs-on">Runs on: <b>${a.runs.join('</b> · <b>')}</b></p>
        <div class="links">${a.links.map(linkHtml).join('')}</div>
        ${a.note ? `<p class="note">${a.note}</p>` : ''}
        ${show}
      </div>
    </div>
  </section>`;
}

const head = (title, desc, path, extra = '') => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0b0b0e">
<meta name="color-scheme" content="dark light">
<link rel="canonical" href="https://turbosuite.prismalite.org${path}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="TurboSuite">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="https://turbosuite.prismalite.org${path}">
<meta property="og:image" content="https://turbosuite.prismalite.org/og.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/icon-192.png">
${extra}<script src="/assets/boot.js"></script>
<link rel="stylesheet" href="/vendor/turbothemes/base.css">
<link rel="stylesheet" href="/assets/motion.css">
<link rel="stylesheet" href="/assets/site.css">
</head>`;

const top = (here) => `<body>
<a class="skip" href="#main">Skip to the content</a>

<header class="site-top bt-top">
  <div class="wrap">
    <a class="brand" href="/"><img src="/icon-192.png" width="32" height="32" alt=""><span>TurboSuite</span></a>
    <nav class="site-nav" aria-label="Sections">
      <a href="/#apps">Apps</a>
      <a class="opt" href="/#looks">Looks</a>
      <a class="opt" href="/#engine">Engine</a>
      <a class="opt" href="/#run">Run it</a>
      <a href="/about/"${here === 'about' ? ' aria-current="page"' : ''}>About</a>
    </nav>
    <button type="button" class="btn look-open" data-look-open hidden>Look</button>
  </div>
</header>
`;

const foot = `
<footer class="site-foot">
  <div class="wrap">
    <div>
      <h2>TurboSuite</h2>
      <p>Small apps that look, move and update the same way. They are vibecoded and made for personal use first: <a href="/about/">read the whole note</a>.</p>
      <p>Every screenshot on this site is a real capture of the running app, filled with sample data and sample pictures. Nothing is generated by an image model.</p>
    </div>
    <div>
      <h2>Elsewhere</h2>
      <ul><li><a href="${GH}">All the apps on GitHub</a></li><li><a href="${GH}/turboengine">turboengine</a>, the shared reference</li><li><a href="${GH}/turbosuite">This site’s source</a></li></ul>
    </div>
    <div>
      <h2>Licences, privacy</h2>
      <p>The apps are MIT licensed, except TurboMC Server, which is GPL-3.0 because it is a fork of Prism Launcher.</p>
      <p>This site loads no third-party scripts, fonts or trackers.</p>
    </div>
  </div>
</footer>

<script src="/vendor/turbothemes/engine.global.js"></script>
<script src="/assets/picker.js"></script>
<script src="/assets/site.js"></script>
</body>
</html>
`;

// ------------------------------------------------------------------ the home page
const shotsCount = apps.filter((a) => a.shots).length;
const index = `${head('TurboSuite: small vibecoded apps that look and update the same way', `TurboSuite: ${apps.filter((a) => a.kind === 'App').map((a) => a.name).join(', ')} and the TurboUI toolkit. Vibecoded apps made for personal use first. Open source, real screenshots, one shared engine.`, '/', '<link rel="prefetch" href="/about/">\n')}
${top('home')}
<main id="main">
  <div class="hero" id="top">
    <div class="wrap hero-grid">
      <div>
        <p class="kicker">${apps.filter((a) => a.kind === 'App').length} apps and a toolkit · open source</p>
        <h1>Small apps for <span class="hl">ordinary jobs</span>, built to feel like one.</h1>
        <p class="lede">Music you rank, recipes that talk to your shopping list, notes, video, documents, a budget, a browser that stays awake and a window for Minecraft servers. Every one is open source, and they all look, move and update the same way.</p>
        <div class="cta">
          <a class="btn btn-accent" href="#apps">See the apps</a>
          <button type="button" class="btn look-open" data-look-open hidden>Try another look</button>
        </div>
        <p class="hero-note"><strong>Vibecoded, for personal use first.</strong> An AI writes the code. These are not hand-written apps; they are one person’s vision, made to fit one life. <a href="/about/">Read the note</a></p>
      </div>
      <div class="collage">
        <figure class="shot card frame shot-main" style="margin:0">${pic('music-desk-albums', 1440, 900, 'TurboMusic’s album grid, every album with its own cover', { lazy: false, priority: true })}</figure>
        <figure class="shot card frame shot-phone a">${pic('pantry-phone-shopping', 390, 844, 'TurboPantry’s shopping list on a phone', { lazy: false, priority: true })}</figure>
        <figure class="shot card frame shot-phone b">${pic('keep-phone-home', 390, 844, 'TurboKeep’s task list on a phone', { lazy: false, priority: true })}</figure>
      </div>
    </div>
  </div>

  <section id="apps" class="reveal" aria-labelledby="apps-h" style="padding-bottom:1.5rem">
    <div class="wrap">
      <div class="sec-head">
        <p class="kicker">In this suite</p>
        <h2 id="apps-h">What is here</h2>
        <p>Eight apps and one toolkit, in the order they were made. Pick one to jump to it.</p>
      </div>
      <ol class="index">
${apps.map((a, i) => `        <li><a href="#${a.id}"><span class="n">${num(i)}</span><span class="nm">${a.icon ? `<img src="/img/apps/${a.icon}.png" width="32" height="32" alt="">` : `<span class="ui-tile" style="--app:${a.color};width:1.9rem;height:1.9rem;font-size:.7rem" aria-hidden="true">${a.tile}</span>`}${a.name}</span><span class="what">${a.blurb}</span><span class="meta"><b>${a.kind}</b> · ${plain(a.runs[0])}</span></a></li>`).join('\n')}
      </ol>
    </div>
  </section>

  <div id="app-list">
${apps.map(appHtml).join('\n')}
  </div>

  <section id="looks" class="band reveal" aria-labelledby="looks-h">
    <div class="wrap">
      <div class="sec-head">
        <p class="kicker">Looks</p>
        <h2 id="looks-h">One app, as many looks as you like</h2>
        <p>Every app uses the same theme engine, so a look is a setting, not a rebuild. Below is TurboMusic’s album page in four of them. This page uses the same engine: press <b>Look</b> in the corner to change it, and the screenshots follow (every capture exists in a dark and a light version).</p>
      </div>
      <div class="looks">
        <figure class="shot card frame"><img src="/img/screens/turbomusic-look-dark.webp" width="1440" height="560" alt="Albums page in TurboMusic with its own dark palette" loading="lazy" decoding="async"><figcaption><span>Own dark palette, Standard v2</span><span>TurboMusic</span></figcaption></figure>
        <figure class="shot card frame"><img src="/img/screens/turbomusic-look-light.webp" width="1440" height="560" alt="Albums page in TurboMusic with the light palette" loading="lazy" decoding="async"><figcaption><span>Light palette, Standard v2</span><span>TurboMusic</span></figcaption></figure>
        <figure class="shot card frame"><img src="/img/screens/turbomusic-look-glass.webp" width="1440" height="560" alt="Albums page in TurboMusic in the Glass lens style" loading="lazy" decoding="async"><figcaption><span>Glass lens</span><span>TurboMusic</span></figcaption></figure>
        <figure class="shot card frame"><img src="/img/screens/turbomusic-look-cyber.webp" width="1440" height="560" alt="Albums page in TurboMusic in the Neon night style" loading="lazy" decoding="async"><figcaption><span>Neon night</span><span>TurboMusic</span></figcaption></figure>
      </div>
      <p class="fine">The apps carry up to 33 UI styles and 75 colour palettes. This site loads the neutral set (9 styles, 29 palettes), the one the engine keeps free of other companies’ names and trade dress. The screenshots come in two versions, dark and light, and follow whichever palette is active; they do not follow each palette’s exact colours.</p>
    </div>
  </section>

  <section id="engine" class="reveal" aria-labelledby="engine-h">
    <div class="wrap">
      <div class="sec-head">
        <p class="kicker">Underneath</p>
        <h2 id="engine-h">One engine underneath</h2>
        <p>The apps do not share a library. They share a reference: <a href="${GH}/turboengine">turboengine</a> holds working modules that each app copies, pins to a commit and upgrades on purpose. That is why they feel alike without being tied together.</p>
      </div>
      <div class="cols">
        <div><span class="kicker-n">01</span><h3>Themes, layouts, motion</h3><p>One theme package, one set of hook classes, one motion language: new things arrive, a replaced list swaps, a panel slides in, a window pops.</p></div>
        <div><span class="kicker-n">02</span><h3>Releases that update themselves</h3><p>Every merge to <code>main</code> becomes a release, numbered by year, month and a counter (like <code>v2026.10.3</code>), and the installed apps update themselves from it.</p></div>
        <div><span class="kicker-n">03</span><h3>A logo you can tell apart</h3><p>The engine mark is the same everywhere; each app adds its own emblem in its own colour.</p><div class="logo-family">${apps.filter((a) => a.icon).map((a) => `<img src="/img/apps/${a.icon}.png" width="38" height="38" alt="" loading="lazy">`).join('')}</div></div>
      </div>
    </div>
  </section>

  <section id="run" class="band reveal" aria-labelledby="run-h">
    <div class="wrap">
      <div class="sec-head">
        <p class="kicker">Hosting</p>
        <h2 id="run-h">Where each one runs</h2>
        <p>Your data stays on your own machines. Server apps each take their own port, so several can live on one Raspberry Pi.</p>
      </div>
      <div class="table-wrap">
        <table class="runs">
          <thead><tr><th scope="col">Name</th><th scope="col">Runs as</th><th scope="col">Port</th><th scope="col">Licence</th></tr></thead>
          <tbody>
${apps.map((a) => `            <tr><td>${a.name}</td><td>${a.where}</td><td>${/^\d+$/.test(a.port) ? `<code>${a.port}</code>` : a.port}</td><td>${a.licence}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>
      <p class="fine">Servers sit happily behind a Cloudflare Tunnel with Access. Each app’s README has the one-command installer and the details.</p>
    </div>
  </section>
</main>
${foot}`;

// ------------------------------------------------------------------ the about page
const about = `${head('About TurboSuite: vibecoded, for personal use first', 'TurboSuite’s apps are vibecoded: an AI writes the code, one person supplies the vision. They are made for personal use first, and not presented as hand-written work.', '/about/', '<link rel="prefetch" href="/">\n')}
${top('about')}
<main id="main">
  <div class="about-hero">
    <div class="wrap">
      <p class="kicker">About this suite</p>
      <h1>Vibecoded, and <span class="hl">for personal use first</span>.</h1>
      <p class="lede">Read this before you install anything. It says plainly how the apps on this site are made, what they are for, and what that means if you want to use one.</p>
      <div class="notice">
        <h2>In one paragraph</h2>
        <p>Every app on this site is <strong>vibecoded</strong>: Turbo tells an AI (Claude) what is wanted, looks at what comes back, and steers until it is right. The code was not written by hand, and it is not presented as hand-crafted work. What comes from a person is the vision: what each app is for, how it should feel, what it must never do, and every decision about it.</p>
      </div>
    </div>
  </div>

  <div class="wrap about-grid" style="padding-bottom:1rem">
    <div class="rail-label">How it works</div>
    <div class="prose">
      <h2>What “vibecoded” means here</h2>
      <p>A person describes an app in plain words, an AI writes it, and the person runs it, reads what came back, and says what is wrong. Round after round, until it does what was wanted. The person decides; the AI types.</p>
      <p>That is a different thing from software written by hand, and it should not be mistaken for it. These apps are not hand-crafted, and nothing on this site says they are.</p>
      <ul>
        <li><strong>From a person:</strong> what each app is for, the way it should feel, what it must never do, and every decision about how it behaves.</li>
        <li><strong>From the AI:</strong> the code, and the tests that go with it.</li>
        <li><strong>Checked by running it:</strong> where an app’s own notes say something has not been run, such as on a phone, this site says so too, and calls the app early.</li>
      </ul>
    </div>
  </div>

  <div class="wrap about-grid" style="padding-bottom:1rem">
    <div class="rail-label">For personal use</div>
    <div class="prose">
      <h2>Made to fit one life first</h2>
      <p>The apps exist because they were wanted for everyday life, so they fit those habits before anyone else’s. If they suit you too, great. Expect rough edges, and expect them to change when those needs do.</p>
      <p>They are shared because they are open source and might be useful, not because they are products built for everyone. Read an app’s README before you rely on it, and keep your own backups of anything you cannot lose.</p>
    </div>
  </div>

  <div class="wrap about-grid" style="padding-bottom:1rem">
    <div class="rail-label">The pictures</div>
    <div class="prose">
      <h2>About the screenshots</h2>
      <p>Every screenshot is a real capture of the running app, taken with a script in a real browser. Nothing on this site is drawn, mocked up or made by an image model to look like an app.</p>
      <ul>
        <li><strong>The data is invented.</strong> The artists, recipes, notes, budget and videos are made up for the captures.</li>
        <li><strong>The pictures inside the apps are drawn by a script.</strong> The album covers, recipe pictures and the clip in TurboCut are simple drawings made with code, standing in for the real photos a real library would have. They are not photographs.</li>
        <li><strong>Each capture is made twice,</strong> in a dark and a light version, and the page shows the one that matches the look you have chosen.</li>
        <li><strong>Two apps have no screenshots.</strong> TurboBox is an Android app and TurboMC Server needs a Qt build, and neither could be run where the captures were made.</li>
      </ul>
    </div>
  </div>

  <div class="wrap about-grid" style="padding-bottom:3rem">
    <div class="rail-label">Licences</div>
    <div class="prose">
      <h2>Licences and independence</h2>
      <p>The apps are MIT licensed. The exception is TurboMC Server, which is a fork of Prism Launcher and so uses the GPL-3.0. It is not affiliated with, endorsed by or supported by the Prism Launcher project, Mojang or Microsoft.</p>
      <p>This site loads no third-party scripts, fonts or trackers.</p>
      <p><a class="textlink" href="/#apps">Back to the apps</a></p>
    </div>
  </div>
</main>
${foot}`;

writeFileSync(join(site, 'index.html'), index);
mkdirSync(join(site, 'about'), { recursive: true });
writeFileSync(join(site, 'about', 'index.html'), about);
console.log(`wrote site/index.html (${index.length} bytes) and site/about/index.html (${about.length} bytes); ${shotsCount} apps with captures`);
