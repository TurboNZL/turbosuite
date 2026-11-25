# TurboSuite

The public website for **TurboSuite**, the apps built for personal use: **TurboMusic, TurboPantry, TurboKeep, TurboCut, TurboDocs, TurboBudget, TurboBox and TurboMC Server**, plus the **TurboUI** toolkit. They are vibecoded (an AI writes the code from the owner's direction) and the site says so plainly, on its own page (`/about/`). It is a static site (HTML, CSS and a little JavaScript, no build step) meant for Cloudflare Pages, and every screenshot on it is a real capture of the running app, never a generated image. Each capture exists in a dark and a light version and the page shows the one that matches the look the visitor picked.

Built on [TurboNZL/turboengine](https://github.com/TurboNZL/turboengine): the theme engine (neutral pack), a picker with a live mock-page preview built on the engine's headless controller, the engine's motion language, and the engine logo family. `.turboengine.json` says which commit and modules.

## What is here
```
site/                  what Cloudflare Pages serves (output directory: site)
  index.html           the page (written by scripts/make-pages.mjs, committed)
  about/index.html     the vibecoded note, its own page (prefetched from the home page)
  assets/              site.css, site.js, picker.js, boot.js, motion.css (the engine's, unchanged)
  vendor/turbothemes/  base.css + engine.global.js from the engine's themes-open pack
  img/screens/         the screenshots (WebP, <name>-dark / <name>-light), img/apps/ the apps' own icons
  og.png               the social-preview image (a crop of one capture)
  _headers             security headers (a strict Content-Security-Policy) and cache rules
scripts/make-pages.mjs  the copy and the list of screenshots; run it after changing either
scripts/check-site.mjs loads both pages in Chromium and fails on anything broken
scripts/gen-icons.mjs  the engine's logo generator (branding/logo.json)
tools/screenshots/     how every screenshot was made, and the scripts to make them again
docs/development/      DEPLOY.md (Cloudflare Pages), ENGINE.md
```

## Run it
```
npm install
node scripts/make-pages.mjs   # after editing the copy or the screenshot list
npm run serve          # http://localhost:4173
npm run check          # needs Chromium: npx playwright install chromium
```

## Deploy
Cloudflare Pages, connected to this repository, production branch `main`, no build command, output directory `site`. The steps, including the custom domain, are in [docs/development/DEPLOY.md](docs/development/DEPLOY.md).

## Releases
Every merge to `main` gets a version tag and a GitHub release (`vYYYY.M.N`) like every app in the suite; Cloudflare deploys `main` by itself.

## License
MIT, see `LICENSE`. The app icons and screenshots show the suite's own apps (TurboMC Server is GPL-3.0; see its repository).
