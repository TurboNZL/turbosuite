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
| What it is | A static page for **TurboSuite**: the apps whose repositories start with `turbo` (music, pantry, keep, cut, docs, budget). Not turboengine itself, not PrismaCore or tether. |
| Names | **TurboSuite** is the name of the suite and of the site (header, title, eyebrow, logo label). **TurboNZL** is the owner's identity and the GitHub organisation: it stays in repository links and in "by TurboNZL", never as the site's own name. |
| Vibecoded notice | **A standing rule, not copy to tidy away:** the page must say, prominently and in plain words, that the apps are vibecoded (an AI writes the code), made for the owner's own use first, not their hand-written work, but their vision. It appears in the hero (`.vibe-hero`), in its own section (`#about`, "Read this first"), as a chip on every app, and in the footer. Do not shorten it to a small disclaimer, and do not describe the apps as hand-crafted. |
| TurboBudget | Renamed from BudgetTrack on 2026-10-20 (`TurboNZL/turbobudget`, branch `claude/gallant-thompson-8e52li`). Its section has an **Open the web app** button to `https://web.turbobudget.prismalite.org` (the Cloudflare Pages project `budget-track-d86.pages.dev` is meant to be attached to that name; the owner does that in the dashboard). Its mark is the bars on a tile (`public/icon.svg` in its repo, copied to `site/img/apps/turbobudget.svg`); its favicon is the bars alone in the theme's accent. Its screenshots were retaken after the rename. |
| Picker | `<turbo-themes-picker floating sections="theme,ui,wallpaper">`: no "Check for newer themes" row, because updates are off on this site and the button would do nothing. Its drop-downs are the engine's themed ones (never native selects). |
| Hosting | Cloudflare Pages on a subdomain of the owner's PrismaLite domain (the domain is set in Cloudflare, not in this repo; there is no canonical URL or `og:image` in the page for that reason). Output directory `site`, no build command. |
| Stack | Plain HTML, CSS and one small script. No framework, no bundler: nothing to build, nothing to break. `site/index.html` was produced from a data table once and is now edited by hand. |
| Look | The engine's **open** theme pack (`themes-open/dist`), not the full one: it is a public site, so no third-party names or trade dress in the picker. Follows the device's light/dark until the visitor chooses (`theme: 'system'`), then remembers it. Fonts `none`, updates off: the page makes no third-party request, and the check fails if it ever does. |
| Motion | `motion.css` unchanged. Only `tk-swap` (screenshot tabs and the scroll reveal). Never `tk-arrive` on big blocks: it animates `max-height`. |
| Security | A strict CSP in `site/_headers` (`script-src 'self'`, so no inline scripts; `style-src` needs `'unsafe-inline'` because the engine injects a `<style>`). `scripts/check-site.mjs` applies the same headers, so a policy that breaks the page fails the check. |
| Logo | The bare engine mark (`branding/logo.json`, name TurboSuite, no emblem). The six app icons are copied from each app's repo; TurboBudget keeps its own bars-on-gradient tile on purpose (the owner's choice: no engine ring or emblem for it). |
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
- **Never put `.btn` on an element that must stay out of the flow.** Liquid Glass sets `position: relative` on every `.btn`, which beat the skip link's `position: absolute` and left a 36px gap above the header. The skip link is its own class now, and `scripts/check-site.mjs` fails if the header is not at `top: 0` in any of the nine looks (checked both ways: it catches the bug when put back).
- The check measures what a visitor can click with `elementFromPoint`, so it scrolls each element into view first: a larger look (Green terminal) pushes the hero below the fold and an off-screen point reports nothing, which looks like "covered".
- "Buttons aren't clickable" was reported by the owner and **could not be reproduced**: every button, tab and link was clicked with real mouse clicks in Chromium at desktop and phone width in the default and Glass looks, nothing is covered in any of the nine looks, and each tab swaps to a loaded screenshot. If it comes back, get the browser, the address and which button, and check what the click did (a tab that does not switch is a JS problem; a link that does nothing is a link).
- TurboCut's "update available" notice shows in a dev checkout only; the home screen was left out of the captures for that reason.

## Session log
- 2026-10-20: after the first deploy (Cloudflare had published the repo root because the output directory was left at the default: set it to `site`, no build command): header text is TurboSuite; the vibecoded notice; TurboBudget's web-app button and retaken screenshots; skip-link gap fixed; picker without the update row; engine rebuilt with themed drop-downs (turboengine branch commit `42d3ea8`) and re-vendored; check now covers all nine looks and the picker.
- 2026-10-19: created the repo (main with LICENSE and README, then the site on a work branch). Captured all screenshots from real runs of the six apps with invented sample data (`tools/screenshots`), built the page, added the check, headers and workflows. Engine pin `078343d`.
