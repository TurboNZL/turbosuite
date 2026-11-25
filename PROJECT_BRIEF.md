# TurboSuite: project brief

The long-lived "why and what": goals, who it is for, rules the site must keep, architecture, roadmap with done-criteria. `CLAUDE.md` is the running log; this file changes rarely.

## Goal and user
One public page that shows what the TurboSuite apps are, honestly, to someone who has never heard of them (and to the owner's own friends and household who will install them). It lives on a subdomain of the owner's PrismaLite domain.

## Feature inventory
- Hero, an index of every app, one section per app (what it is, four plain facts, where it runs, status and licence, links, real screenshots with tabs; an honest "no screenshots yet" panel where the app could not be run), a "same app, different looks" section, a short "one engine" section, a "where each one runs" table, a footer, and a separate **About** page with the full vibecoded note.
- The visitor can change the page's look with a picker that previews in a mock page (the engine's headless controller); the choice is remembered, and the screenshots switch between their dark and light versions to match.

## Rules that must not be broken
0. **Be plain that the apps are vibecoded**: an AI writes the code, a person supplies the vision, and the apps were made for personal use first (third person on the page, never "I", and without repeating the owner's name). Never present them as hand-written or as products built for everyone. (Hero line, the top-bar link, the footer, and the full text on its own page, `/about/`.)
1. Only real screenshots of the running apps. No generated, drawn or mocked-up images of an *app*; the sample pictures inside the apps are drawn by script (no photo host was reachable), never by an image model, and the About page says so. Say that the screenshots are real captures on the page.
2. No third-party requests, scripts, fonts or trackers. `scripts/check-site.mjs` enforces it.
3. Never claim what an app's own notes say is unverified. Check the app's README, CLAUDE.md and release workflow before changing a claim.
4. The page is complete without JavaScript (screenshots all show, in their dark version; sections visible; the Look button, which needs JS, stays hidden).
5. Follow the engine: versions `vYYYY.M.N`, lowercase asset names, themes on (neutral pack here), one motion language, one logo family.

## Architecture
Static files in `site/`; Cloudflare Pages serves them with the headers in `site/_headers`. Vendored engine pieces live in `site/vendor/` and `site/assets/motion.css`; `.turboengine.json` records the commit they came from.

## Roadmap (with done-criteria)
- Done: first version of the page, check, headers, workflows; the 2026-11-25 rebuild (all public apps, dark/light captures that follow the look, human-leaning design, picker with a mock preview, `/about/`, canonical and Open Graph tags).
- Next: capture TurboBox (needs an Android emulator or a phone) and TurboMC Server (needs a Qt 6.8 build); swap the drawn sample pictures for real, licensed photos if they can be fetched; recapture screenshots when an app changes noticeably; per-palette captures if the two-version approach proves too coarse; an icon for TurboUI if the owner wants one.
- Done when: the live page passes `npm run check` against a preview deployment and the owner has clicked through every link.

## Glossary
- **Open pack**: the engine's neutral theme set (`themes-open`), free of other companies' names and trade dress.
- **Suite**: the public repositories that start with `turbo` and are apps or toolkits (not turboengine, which is their shared reference).
