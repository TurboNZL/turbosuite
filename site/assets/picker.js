/* The look picker: a dialog with the colour palettes and UI styles of the engine's open pack, and a small mock of this page that follows
   the option under the pointer (hover and focus move the mock; only a click changes the real page).
   Built on the engine's headless controller (TurboThemes ... picker()); that is how themes/docs/PICKER.md says a picker should preview a look,
   instead of re-theming the real page while the pointer moves. No dependencies, no network: the mock shows this site's own screenshots. */
(function () {
  'use strict';
  var T = window.TurboThemes;
  var open = document.querySelectorAll('[data-look-open]');
  if (!T || !open.length) return;

  window.siteLook = function (themes) {
    var picker = themes.picker();
    var SITE_LOOK = { theme: 'default', ui: 'default' };
    var tone = 'all';

    var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
    var labelOf = function (list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i].label; return id; };
    var allThemes = function () { return picker.themes().reduce(function (a, g) { return a.concat(g.items); }, []); };

    // ---- the dialog
    var dlg = el('dialog', 'look');
    dlg.setAttribute('aria-labelledby', 'look-h');
    var head = el('div', 'look-head');
    var h = el('h2', null, 'Change the look'); h.id = 'look-h';
    var close = el('button', 'btn', 'Done'); close.type = 'button'; close.setAttribute('data-close', '');
    head.append(h, close);

    var body = el('div', 'look-body');
    var lists = el('div', 'look-lists');
    var side = el('aside', 'look-side');

    // colours
    var secC = el('section', 'look-sec');
    var hc = el('div', 'look-sec-head');
    hc.append(el('h3', null, 'Colours'));
    var filter = el('div', 'look-filter'); filter.setAttribute('role', 'group'); filter.setAttribute('aria-label', 'Show colours');
    var tones = {};
    [['all', 'All'], ['dark', 'Dark'], ['light', 'Light']].forEach(function (t) {
      var b = el('button', 'look-tone', t[1]); b.type = 'button'; b.setAttribute('aria-pressed', t[0] === 'all' ? 'true' : 'false');
      b.addEventListener('click', function () { tone = t[0]; Object.keys(tones).forEach(function (k) { tones[k].setAttribute('aria-pressed', k === tone ? 'true' : 'false'); }); drawColours(); });
      tones[t[0]] = b; filter.append(b);
    });
    hc.append(filter);
    var colourBox = el('div', 'look-colours');
    secC.append(hc, colourBox);

    // styles
    var secS = el('section', 'look-sec');
    var hs = el('div', 'look-sec-head'); hs.append(el('h3', null, 'Style'));
    var styleBox = el('div', 'look-styles'); styleBox.setAttribute('role', 'radiogroup'); styleBox.setAttribute('aria-label', 'Style');
    var matching = el('button', 'btn look-matching', 'Use the colours made for this style'); matching.type = 'button';
    secS.append(hs, styleBox, matching);

    var reset = el('button', 'look-reset', 'Back to the site’s own look'); reset.type = 'button';
    lists.append(secC, secS, reset);

    // ---- the mock: a small copy of this page, drawn with the real hook classes
    var mock = el('div', 'look-mock'); mock.setAttribute('role', 'img'); mock.setAttribute('aria-label', 'A small preview of this page in the colours and style under the pointer');
    mock.innerHTML =
      '<div class="bt-top mock-top"><span class="mock-brand"><i class="mock-dot"></i>TurboSuite</span><span class="mock-nav"><span>Apps</span><span>Looks</span><span>About</span></span><span class="btn btn-accent mock-btn">Look</span></div>' +
      '<div class="mock-body">' +
        '<p class="mock-eyebrow">Eight apps and a toolkit</p>' +
        '<p class="mock-h">Small apps for ordinary jobs.</p>' +
        '<p class="mock-p">Open source, vibecoded, and honest about it.</p>' +
        '<div class="mock-shot card"><img class="shot-dark" src="/img/screens/music-desk-albums-dark.webp" width="1440" height="900" alt="" loading="lazy"><img class="shot-light" src="/img/screens/music-desk-albums-light.webp" width="1440" height="900" alt="" loading="lazy"></div>' +
        '<div class="mock-row"><span class="btn btn-accent">Get it</span><span class="btn">Source</span><span class="chip">Android</span><span class="chip">Web</span></div>' +
        '<div class="mock-input input">Search the apps…</div>' +
      '</div>';
    var noteMock = el('p', 'look-note', 'Not the real page. Hover an option to try it, click to apply.');
    var now = el('p', 'look-now'); now.setAttribute('aria-live', 'polite');
    side.append(mock, noteMock, now);

    body.append(lists, side);
    dlg.append(head, body);
    document.body.append(dlg);

    // ---- the mock follows an option
    var setKeys = [];
    function showInMock(theme, ui) {
      var def, vars;
      try { def = T.resolveTheme(theme); vars = T.themeStyle(theme); } catch (e) { return; }
      setKeys.forEach(function (k) { mock.style.removeProperty(k); });
      setKeys = [];
      mock.dataset.theme = def.id;
      mock.dataset.mode = def.dark ? 'dark' : 'light';
      mock.dataset.ui = T.effectiveUi(ui);
      Object.keys(vars).forEach(function (k) { if (k.indexOf('--') === 0) { mock.style.setProperty(k, vars[k]); setKeys.push(k); } else { mock.style[k] = vars[k]; } });
    }
    var kept = function () { var a = picker.getState().appearance; return { theme: a.theme, ui: a.ui }; };
    var backToKept = function () { var k = kept(); showInMock(k.theme, k.ui); };

    // ---- the lists
    function chip(t) {
      var b = el('button', 'look-chip'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.id = t.id; if (t.note) b.title = t.note;
      var sw = el('span', 'look-sw');
      if (t.colors) { ['bg', 'surface', 'accent', 'text'].forEach(function (k) { var i = document.createElement('i'); i.style.background = t.colors[k]; sw.append(i); }); }
      else sw.classList.add('look-sw-device');
      b.append(sw, el('span', 'look-name', t.label));
      var over = function () { showInMock(t.id, kept().ui); };
      b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') over(); });
      b.addEventListener('focus', over);
      b.addEventListener('pointerleave', backToKept);
      b.addEventListener('blur', backToKept);
      b.addEventListener('click', function () { picker.set({ theme: t.id }); });
      return b;
    }
    function drawColours() {
      colourBox.textContent = '';
      picker.themes(tone === 'all' ? undefined : tone).forEach(function (g) {
        if (!g.items.length) return;
        var wrap = el('div', 'look-group'); var gh = el('h4', null, g.label); gh.id = 'look-g-' + g.id;
        var grid = el('div', 'look-grid'); grid.setAttribute('role', 'radiogroup'); grid.setAttribute('aria-labelledby', gh.id);
        g.items.forEach(function (t) { grid.append(chip(t)); });
        wrap.append(gh, grid); colourBox.append(wrap);
      });
      mark();
    }
    function drawStyles() {
      styleBox.textContent = '';
      picker.styles().forEach(function (s) {
        var b = el('button', 'look-style'); b.type = 'button'; b.setAttribute('role', 'radio'); b.dataset.id = s.id;
        b.append(el('span', 'look-name', s.label), el('span', 'look-desc', s.description));
        var over = function () { showInMock(kept().theme, s.id); };
        b.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'touch') over(); });
        b.addEventListener('focus', over);
        b.addEventListener('pointerleave', backToKept);
        b.addEventListener('blur', backToKept);
        b.addEventListener('click', function () { picker.set({ ui: s.id }); });
        styleBox.append(b);
      });
      mark();
    }
    function mark() {
      var a = picker.getState().appearance;
      colourBox.querySelectorAll('.look-chip').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.id === a.theme ? 'true' : 'false'); });
      styleBox.querySelectorAll('.look-style').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.id === a.ui ? 'true' : 'false'); });
      now.textContent = '';
      now.append('Colours: ', el('b', null, labelOf(allThemes(), a.theme)), ' · Style: ', el('b', null, labelOf(picker.styles(), a.ui)));
      backToKept();
    }
    matching.addEventListener('pointerenter', function () { var m = picker.matchingTheme(kept().ui); if (m) showInMock(m, kept().ui); });
    matching.addEventListener('focus', function () { var m = picker.matchingTheme(kept().ui); if (m) showInMock(m, kept().ui); });
    matching.addEventListener('pointerleave', backToKept);
    matching.addEventListener('blur', backToKept);
    matching.addEventListener('click', function () { var m = picker.matchingTheme(kept().ui); if (m) picker.set({ theme: m }); });
    reset.addEventListener('click', function () { picker.set(SITE_LOOK); });

    drawColours(); drawStyles();
    picker.subscribe(mark);

    // ---- opening and closing
    var opener = null;
    function openIt(e) { opener = e.currentTarget; if (!dlg.open) dlg.showModal(); mark(); }
    open.forEach(function (b) { b.hidden = false; b.addEventListener('click', openIt); });
    close.addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  };
})();
