/* TurboNZL site: starts the theme engine, wires the screenshot tabs and the scroll reveal. No dependencies, no network.
   The page is complete without any of this (see the .js gate in site.css): the screenshots all show, the sections are all visible. */
(function () {
  'use strict';

  // ---- the look: the neutral pack of turbothemes, following the device's light/dark until the visitor picks one (the picker remembers the choice)
  try {
    TurboThemes.start({
      persist: true,                 // the visitor's choice survives a reload
      picker: true,                  // enables <turbo-themes-picker>
      source: false,                 // no theme downloads: the page uses the pack it ships with
      autoUpdate: false,
      fonts: 'none',                 // system fonts; the page makes no request to a font host
      appearance: { theme: 'system', ui: 'default' },
    });
  } catch (err) {
    console.warn('turbothemes did not start; the page keeps its default colours', err);
  }

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- screenshot tabs: a replaced image swaps (tk-swap), nothing else moves
  document.querySelectorAll('[data-tabs]').forEach(function (box) {
    var shots = Array.prototype.slice.call(box.querySelectorAll('[data-shot]'));
    var buttons = Array.prototype.slice.call(box.querySelectorAll('[data-show]'));
    if (shots.length < 2 || buttons.length !== shots.length) return;
    function show(i, animate) {
      shots.forEach(function (s, j) { s.hidden = j !== i; });
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      if (animate && !reduced) {
        var s = shots[i];
        s.classList.remove('tk-swap');
        void s.offsetWidth; // restart the animation
        s.classList.add('tk-swap');
      }
    }
    // images are lazy and the hidden ones are not drawn: start loading the one a pointer is heading for
    function warm(i) { var img = shots[i].querySelector('img'); if (img) img.loading = 'eager'; }
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () { show(i, true); });
      b.addEventListener('pointerenter', function () { warm(i); });
      b.addEventListener('focus', function () { warm(i); });
    });
    show(0, false);
  });

  // ---- sections arrive as they scroll in
  var reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in', 'tk-swap');
        seen.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    reveal.forEach(function (el) { seen.observe(el); });
  } else {
    reveal.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- the top bar shows where you are
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function mark() {
    var line = window.innerHeight * 0.35, current = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= line) current = i; });
    links.forEach(function (a, i) { if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', mark, { passive: true });
  mark();
})();
