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
| Names | **TurboSuite** is the name of the suite and of the site (header, title, eyebrow, logo label). The owner goes by **Turbo**; the GitHub organisation is **TurboNZL** because TurboNZ was taken (they also go by "turbo"). **Avoid the owner's name on the page**: "Turbo" appears once (the About section) and nothing says "TurboNZL" in visible text; the org stays only inside GitHub URLs. Pronouns were never stated: use they/them. |
| Vibecoded notice | **A standing rule, not copy to tidy away:** the page must say, prominently and in plain words, that the apps are vibecoded (an AI writes the code), made for personal use first, not hand-written work, but one person's vision. **Third person, never "I"** (the assistant is not the owner and must not speak as them), and **do not repeat the owner's name** or the phrase on every app (the per-app chip was removed as repetitive). It appears in the hero (`.vibe-hero`), in its own section (`#about`, "Read this first") and in the footer. Do not shorten it to a small disclaimer, and do not describe the apps as hand-crafted. |
| TurboBudget | Renamed from BudgetTrack on 2026-10-20 (`TurboNZL/turbobudget`, branch `claude/gallant-thompson-8e52li`). Its section has an **Open the web app** button to `https://web.turbobudget.prismalite.org` (the Cloudflare Pages project `budget-track-d86.pages.dev` is meant to be attached to that name; the owner does that in the dashboard). Its mark is the engine mark with the bars as the emblem (`public/icon-192.png` in its repo, copied to `site/img/apps/turbobudget.png`); its favicon is the bars alone in the theme's accent. Its screenshots were retaken after the rename. |
| Picker | `<turbo-themes-picker floating sections="theme,ui,wallpaper">`: no "Check for newer themes" row, because updates are off on this site and the button would do nothing. Its drop-downs are the engine's themed ones (never native selects). |
| Hosting | Cloudflare Pages on a subdomain of the owner's PrismaLite domain (the domain is set in Cloudflare, not in this repo; there is no canonical URL or `og:image` in the page for that reason). Output directory `site`, no build command. |
| Stack | Plain HTML, CSS and one small script. No framework, no bundler: nothing to build, nothing to break. `site/index.html` was produced from a data table once and is now edited by hand. |
| Look | The engine's **open** theme pack (`themes-open/dist`), not the full one: it is a public site, so no third-party names or trade dress in the picker. Follows the device's light/dark until the visitor chooses (`theme: 'system'`), then remembers it. Fonts `none`, updates off: the page makes no third-party request, and the check fails if it ever does. |
| Motion | `motion.css` unchanged. Only `tk-swap` (screenshot tabs and the scroll reveal). Never `tk-arrive` on big blocks: it animates `max-height`. |
| Security | A strict CSP in `site/_headers` (`script-src 'self'`, so no inline scripts; `style-src` needs `'unsafe-inline'` because the engine injects a `<style>`). `scripts/check-site.mjs` applies the same headers, so a policy that breaks the page fails the check. |
| Logo | The six app icons under `site/img/apps/` are **copies**, not links: they do not update by themselves when an app changes its mark (the CSP forbids loading images from other hosts, on purpose). Re-copy them when an app's logo changes: music/pantry/keep/docs `apps/web/public/icon-192.png`, cut `public/icon-192.png`, budget `public/icon-192.png`. (TurboBudget's own header logo and favicon, by contrast, are drawn live from the theme inside the app.) The site's own mark: the bare engine mark (`branding/logo.json`, name TurboSuite, no emblem). The six app icons are copied from each app's repo; TurboBudget now uses the engine mark too, with its bars as the emblem (changed 2026-10-20 at the owner's request; it was a bars-on-gradient tile before). |
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
- **"Buttons aren't clickable" meant the cursor, not the click.** The owner's report was that buttons did not change the cursor to a hand. Clicks always worked (every button, tab and link was clicked with real mouse clicks; nothing is covered in any of the nine looks), but native `<button>`s show an arrow unless told otherwise, and the engine's `base.css` never told them (Tailwind's reset did it for the React apps). Fixed in the engine (`.btn`, `.bt-nav`, `.bt-tab`, menu rows get `cursor: pointer`) and guarded here: `scripts/check-site.mjs` fails if a visible enabled button has any other cursor, in all nine looks (checked both ways: with the old CSS it names the 16 screenshot tabs and the Themes button). Lesson: when a report is vague, ask what the user sees; "not clickable" can mean the affordance, not the behaviour.
- **The notice's accent stripe is an inner bar, not a border** (`.vibe::before` / `.vibe-hero::before`, clipped by `overflow: hidden`), and its padding scales with `--card-r`. Liquid Glass sets `border: 0` on every `.card` (the stripe vanished) and rounds boxes to 22px+ (text met the curve). Anything on this page that needs a coloured edge should do the same, not use a border.
- TurboCut's "update available" notice shows in a dev checkout only; the home screen was left out of the captures for that reason.

## Session log
- 2026-10-20 (latest): the owner asked for less name use: the per-app "vibecoded for ..." chips are gone, the notice says "personal use", visible "TurboNZL" text is gone (footer link now "All the apps on GitHub"), "Turbo" appears once. Branch restarted from main (the earlier PRs were merged).
- 2026-10-20 (later): notice rewritten in the third person (the first draft spoke as the owner: "I"; the page is about TurboNZL, not by them in the first person); pointer cursor fixed in the engine and re-vendored; budget domain attached by the owner.
- 2026-10-20: after the first deploy (Cloudflare had published the repo root because the output directory was left at the default: set it to `site`, no build command): header text is TurboSuite; the vibecoded notice; TurboBudget's web-app button and retaken screenshots; skip-link gap fixed; picker without the update row; engine rebuilt with themed drop-downs (turboengine branch commit `42d3ea8`) and re-vendored; check now covers all nine looks and the picker.
- 2026-10-19: created the repo (main with LICENSE and README, then the site on a work branch). Captured all screenshots from real runs of the six apps with invented sample data (`tools/screenshots`), built the page, added the check, headers and workflows. Engine pin `078343d`.
- 2026-10-20 (logo): TurboBudget's icon is now the engine mark with the bars as its emblem; the site's copy (`site/img/apps/turbobudget.png`) and its four screenshots were replaced to match.
- 2026-10-20 (notice): padding/stripe fixed in the glass look (and made robust in all nine); branch restarted from main after the earlier PRs merged.
