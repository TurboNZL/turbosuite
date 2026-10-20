# How this site uses turboengine

Pinned in `.turboengine.json` (the engine branch commit with the picker's themed drop-downs; see its `notes`). The engine is a reference: these are copies, updated on purpose.

| Engine module | Here |
|---|---|
| `appearance` / `themes-open` | `site/vendor/turbothemes/base.css` and `engine.global.js` copied from `themes-open/dist`. Started in `site/assets/site.js` with `persist`, `picker`, `source: false`, `fonts: 'none'`, `theme: 'system'`. The page uses hook classes (`.btn`, `.card`, `.chip`, `.bt-top`) and the palette variables only. |
| picker drop-downs | The engine's `<turbo-themes-picker>` now draws its own `.bt-menu` drop-downs (`enhanceSelects()`); the first version of this site used the older picker, whose native `<select>`s opened the operating system's list (plain grey in Liquid Glass). If you add a field of your own, give it `class="input"` and call `TurboThemes.enhanceSelects()`: `scripts/check-site.mjs` fails on a visible native select in the picker. |
| `motion` | `site/assets/motion.css`, unchanged. `tk-swap` for the screenshot tabs and the reveal. |
| `logos` | `scripts/gen-icons.mjs` + `scripts/logo/lib.mjs`; `branding/logo.json` is the bare mark; outputs in `site/`. Regenerate with `PLAYWRIGHT_MODULE=... node scripts/gen-icons.mjs --png`. |
| `release-pipeline` | `auto-pr.yml` (text changed), `release.yml` (the tag-and-release job only), `check.yml` (the site check, also on pull requests). |
| `guides-and-docs` | `CLAUDE.md`, `PROJECT_BRIEF.md`, `docs/development/`; no `docs/guides` (nothing to show in an app). |

## Taking a newer engine
`node scripts/engine-diff.mjs` in the engine compares an app's files with the modules, but this site's vendored files are the ones to compare by hand: copy `themes-open/dist/base.css` and `engine.global.js` again, run `npm run check`, look at the page in a few looks (picker), then update `ref`.

## What to port back to the engine
- A static-site recipe for `appearance`: `TurboThemes.start({ ... fonts: 'none', source: false })` with the open pack and no framework, and the CSP that goes with it (`style-src 'unsafe-inline'` is needed because the engine injects a `<style>`).
- `scripts/check-site.mjs` (headers applied from `_headers`, no outside request, no console error) could be a small `static-site` module.
