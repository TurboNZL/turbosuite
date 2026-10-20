# TurboSuite: project brief

The long-lived "why and what": goals, who it is for, rules the site must keep, architecture, roadmap with done-criteria. `CLAUDE.md` is the running log; this file changes rarely.

## Goal and user
One public page that shows what the TurboSuite apps are, honestly, to someone who has never heard of them (and to the owner's own friends and household who will install them). It lives on a subdomain of the owner's PrismaLite domain.

## Feature inventory
- Hero, one section per app (what it is, four plain features, where it runs, links to its releases and source, real screenshots with tabs), a "same app, different looks" section, a short "one engine" section, a "where each one runs" table, and a footer that says plainly the screenshots are real.
- The visitor can change the page's look with the engine's picker; the choice is remembered.

## Rules that must not be broken
0. **Be plain that the apps are vibecoded**: an AI writes the code, a person supplies the vision, and the apps were made for personal use first (third person on the page, never "I", and without repeating the owner's name). Never present them as hand-written or as products built for everyone. (Hero line, the `#about` section, a chip per app, the footer.)
1. Only real screenshots of the running apps. No generated, drawn or mocked-up images. Say so on the page.
2. No third-party requests, scripts, fonts or trackers. `scripts/check-site.mjs` enforces it.
3. Never claim what an app's own notes say is unverified. Check the app's README, CLAUDE.md and release workflow before changing a claim.
4. The page is complete without JavaScript (screenshots all show, sections visible).
5. Follow the engine: versions `vYYYY.M.N`, lowercase asset names, themes on (neutral pack here), one motion language, one logo family.

## Architecture
Static files in `site/`; Cloudflare Pages serves them with the headers in `site/_headers`. Vendored engine pieces live in `site/vendor/` and `site/assets/motion.css`; `.turboengine.json` records the commit they came from.

## Roadmap (with done-criteria)
- Done: first version of the page, check, headers, workflows.
- Next: attach the domain in Cloudflare; add a social-preview image and canonical URL once the domain is known (use a real screenshot); recapture screenshots when an app changes noticeably; add TurboBudget to the engine's logo module and use its emblem icon here.
- Done when: the live page passes `npm run check` against a preview deployment and the owner has clicked through every link.

## Glossary
- **Open pack**: the engine's neutral theme set (`themes-open`), free of other companies' names and trade dress.
- **Suite**: the six apps whose repositories start with `turbo` (not turboengine, which is their shared reference).
