// Run after editing days.json: node tools/sync.mjs
// 1. rewrites days.js (the file:// mirror of days.json)
// 2. writes a placeholder card img/<slug>.svg for any day that has none
import fs from 'node:fs';
const root = new URL('../', import.meta.url);
const j = JSON.parse(fs.readFileSync(new URL('days.json', root), 'utf8'));
fs.writeFileSync(new URL('days.js', root), 'window.BUILDTOBER_DAYS=' + JSON.stringify(j, null, 1) + ';\n');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let made = 0;
for (const d of j.days) {
  const slug = d.slug || String(d.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const file = new URL('img/' + slug + '.svg', root);
  if (fs.existsSync(file)) continue;
  const h = Number.isFinite(d.hue) ? d.hue : (d.slot * 47) % 360;
  const n = String(d.slot).padStart(2, '0');
  fs.writeFileSync(file, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" role="img" aria-label="${esc(d.name)}"><rect width="640" height="360" fill="hsl(${h},45%,20%)"/><rect y="300" width="640" height="60" fill="hsl(${h},45%,14%)"/><text x="32" y="170" font-family="Consolas,monospace" font-size="130" font-weight="700" fill="hsl(${h},80%,82%)">${n}</text><text x="32" y="236" font-family="Segoe UI,Arial,sans-serif" font-size="36" font-weight="700" fill="#fff">${esc(d.name)}</text></svg>\n`);
  made++;
}
console.log('days.js written, ' + made + ' placeholder card(s) made');
