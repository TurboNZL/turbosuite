# Deploying to Cloudflare Pages

The site is plain files in `site/`. There is nothing to build.

## One-time setup (the owner does this in the Cloudflare dashboard; menu wording moves around, the settings below are what matters)
1. **Workers & Pages > Create > Pages > Connect to Git**, and pick `TurboNZL/turbosuite`. If the repository is not listed, give the Cloudflare GitHub app access to it (GitHub > Settings > Applications > Cloudflare Workers & Pages > Configure).
2. Settings for the project:
   - Production branch: `main`
   - Framework preset: `None`
   - Build command: *(leave empty)*
   - Build output directory: `site`
3. Save and deploy. The first deploy gives a `*.pages.dev` address; open it and look at the page.
4. **Custom domains > Set up a custom domain**: enter the subdomain on the PrismaLite domain (for example `suite.<your domain>`). If the domain's DNS is in the same Cloudflare account, Cloudflare adds the record itself; otherwise it shows the CNAME to create.

Every push to another branch gets a preview deployment, and this repository's `check` workflow runs on pull requests.

## Headers
`site/_headers` is read by Pages. It sets a strict Content-Security-Policy (no inline scripts, nothing from other hosts), and cache times. If you add anything that loads from another host (an analytics script, a web font), the policy and `scripts/check-site.mjs` will both refuse it on purpose: change the policy deliberately, not around it.

## After the domain is known
- Add `<link rel="canonical">` and a social preview (`og:image` must be an absolute URL on the new domain; use a real screenshot, for example `img/screens/turbomusic-home.webp`).
- Not done in the first version because the domain was not known.

## Releases
Merges to `main` also tag a release (`.github/workflows/release.yml`). That is for consistency with the apps; Cloudflare deploys from the branch, not from the tag.
