# Buildtober 2026 site

Live: https://kitsunetech1.github.io/buildtober-site/ (buildtober.xyz once DNS lands). MIT, see LICENSE.

One static page: hero countdown, a Mon-Sun October calendar with one card per project on its day, a plain list with pitches for phones, and a footer. No build step, no framework, no CDN, works offline.

Files: `index.html`, `style.css`, `app.js`, `days.json` (data), `days.js` (mirror of days.json, see below), `img/<slug>.svg`, `CNAME`, `.nojekyll`.

## Update a project
Edit `days.json`. Set `"status": "shipped"` and `"url": "https://..."` on the entry. Cards with no url show "soon". Then refresh the mirror (needed only so the page also works when opened from disk via file://, where browsers block fetch):

    node -e "const fs=require('fs');fs.writeFileSync('days.js','window.BUILDTOBER_DAYS='+fs.readFileSync('days.json','utf8')+';\n')"

On GitHub Pages the page reads days.json directly. The source list is `../data/days.json`; this copy only adds `image`, `slug`, `hue` and is sorted by day.

## Swap an image
Drop a 16:9 PNG/JPG/WebP into `img/` and change that entry's `"image"` in `days.json` (and refresh `days.js`). The placeholder SVGs are flat tiles with the slot number.

## Hosting on GitHub Pages
Repo `KitsuneTech1/buildtober-site`. Either publish this `site/` folder (Settings > Pages > GitHub Actions with a static-site workflow that uploads `site`), or copy its contents to the repo root or `/docs` and pick that in Settings > Pages. `CNAME` holds `buildtober.xyz`; `.nojekyll` stops Jekyll processing.

## Point buildtober.xyz at Pages
At the registrar's DNS:
- A records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
- CNAME `www` -> `kitsunetech1.github.io`
Then set the custom domain in Settings > Pages and tick Enforce HTTPS once the cert issues.

Countdown target: 2026-10-31 23:59 America/Chicago (fixed -05:00 offset in app.js).
