# TurboSuite

The public website for **TurboSuite**, the apps built for personal use: **TurboMusic, TurboPantry, TurboKeep, TurboCut, TurboDocs and TurboBudget**. They are vibecoded (an AI writes the code from the owner's direction) and the site says so plainly. It is a static site (HTML, CSS and a little JavaScript, no build step) meant for Cloudflare Pages, and every screenshot on it is a real capture of the running app, never a generated image.

Built on [TurboNZL/turboengine](https://github.com/TurboNZL/turboengine): the theme engine (neutral pack) and the picker on the page, the engine's motion language, and the engine logo family. `.turboengine.json` says which commit and modules.

## What is here
```
site/                  what Cloudflare Pages serves (output directory: site)
  index.html           the page
  assets/              site.css, site.js, boot.js, motion.css (the engine's, unchanged)
  vendor/turbothemes/  base.css + engine.global.js from the engine's themes-open pack
  img/screens/         the screenshots (WebP), img/apps/ the apps' own icons
  _headers             security headers (a strict Content-Security-Policy) and cache rules
scripts/check-site.mjs loads the page in Chromium and fails on anything broken
scripts/gen-icons.mjs  the engine's logo generator (branding/logo.json)
tools/screenshots/     how every screenshot was made, and the scripts to make them again
docs/development/      DEPLOY.md (Cloudflare Pages), ENGINE.md
```

## Run it
```
npm install
npm run serve          # http://localhost:4173
npm run check          # needs Chromium: npx playwright install chromium
```

## Deploy
Cloudflare Pages, connected to this repository, production branch `main`, no build command, output directory `site`. The steps, including the custom domain, are in [docs/development/DEPLOY.md](docs/development/DEPLOY.md).

## Releases
Every merge to `main` gets a version tag and a GitHub release (`vYYYY.M.N`) like every app in the suite; Cloudflare deploys `main` by itself.

## License
MIT, see `LICENSE`. The app icons and screenshots show the suite's own apps.
