# TurboSuite: project handoff

Read this first, then `PROJECT_BRIEF.md`. This file is the running state and decision log: update it whenever a decision or the state changes.

## Engine
This site is pinned to TurboNZL/turboengine (see `.turboengine.json`; `docs/development/ENGINE.md` says which modules are used and how). The engine is a **reference, not a dependency**: its modules are working code copied into apps. Before building something that every app would want (the look, motion, logos, release naming), look in the engine's `modules/` first and copy from it rather than inventing a new one. If you improve a module here, say so in the session log so it can be ported back.

## User preferences (how to work with them)
- Don't waste their usage. Fact-check and double-check yourself; use web search liberally.
- They write casually; reply in normal capitalised prose.
- Put effort into verifying against real runs, not only unit tests.
- A merged PR cannot take new work: restart the branch from main for follow-up changes. Commit trailers as the harness gives them.
- **No AI image generation, ever, on this site.** Only real screenshots of the running apps (and the apps' own icons). If an app changes, capture it again with `tools/screenshots`.

## Decisions made (don't re-ask)
| Topic | Decision |
|---|---|
| What it is | A static marketing site for the apps whose repositories start with `turbo` (music, pantry, keep, cut, docs, budget). Not turboengine itself, not PrismaCore or tether. |
| Hosting | Cloudflare Pages on a subdomain of the owner's PrismaLite domain (the domain is set in Cloudflare, not in this repo; there is no canonical URL or `og:image` in the page for that reason). Output directory `site`, no build command. |
| Stack | Plain HTML, CSS and one small script. No framework, no bundler: nothing to build, nothing to break. `site/index.html` was produced from a data table once and is now edited by hand. |
| Look | The engine's **open** theme pack (`themes-open/dist`), not the full one: it is a public site, so no third-party names or trade dress in the picker. Follows the device's light/dark until the visitor chooses (`theme: 'system'`), then remembers it. Fonts `none`, updates off: the page makes no third-party request, and the check fails if it ever does. |
| Motion | `motion.css` unchanged. Only `tk-swap` (screenshot tabs and the scroll reveal). Never `tk-arrive` on big blocks: it animates `max-height`. |
| Security | A strict CSP in `site/_headers` (`script-src 'self'`, so no inline scripts; `style-src` needs `'unsafe-inline'` because the engine injects a `<style>`). `scripts/check-site.mjs` applies the same headers, so a policy that breaks the page fails the check. |
| Logo | The bare engine mark (`branding/logo.json`, no emblem). The six app icons are copied from each app's repo; TurboBudget has no engine logo yet (its own bars-on-gradient `favicon.svg`). |
| Accuracy | Claims on the page come from each app's README and CLAUDE.md, checked against its release workflow. Where the app's own notes say "unverified" (TurboPantry's and TurboKeep's Android builds were never run on a device) the page says "early" or stays plain. |

## Repo layout
See `README.md`.

## What exists and is tested
- The page, checked by `scripts/check-site.mjs` in a real Chromium at 1440, 820 and 390 px in dark and light: no outside request, no console error, no broken image or link, no sideways scroll, theme engine running, every section reveals. Also run by hand: the picker opens, changes the look under the CSP and the choice survives a reload.
- Not verified: Safari and Firefox; the page on a real phone; Cloudflare Pages itself (nothing here can reach it): see `docs/development/DEPLOY.md`.

## Hard-won gotchas
- **Look at every screenshot before using it.** `turbomusic-light` is not in TurboMusic's pinned theme bundle and was silently ignored, so a "light" capture was dark and its caption was wrong. Use `light`.
- **TurboKeep never reaches network idle**; TurboBudget amounts are signed (withdrawals negative); TurboDocs slide text commits with Escape. The rest is in `tools/screenshots/README.md`.
- The scroll reveal hides sections until they intersect (only when the script runs). A test that scrolls faster than the browser delivers observer callbacks will see hidden sections: scroll section by section, as the check does.
- Lazy images in a hidden tab are not loaded until the tab is shown. The tab buttons start loading on hover/focus.
- TurboBudget's in-app name is still **BudgetTrack**; the page calls it TurboBudget (its repository) and says so. Change both together if the owner renames it.
- TurboCut's "update available" notice shows in a dev checkout only; the home screen was left out of the captures for that reason.

## Session log
- 2026-10-19: created the repo (main with LICENSE and README, then the site on a work branch). Captured all screenshots from real runs of the six apps with invented sample data (`tools/screenshots`), built the page, added the check, headers and workflows. Engine pin `078343d`.
