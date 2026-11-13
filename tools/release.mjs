// Release ships in one step.
//   node tools/release.mjs              mark every ship dated today or earlier as shipped
//   node tools/release.mjs --all        mark every ship as shipped, whatever its date
//   node tools/release.mjs --dry        show what would change, write nothing
// Links come from data/release-urls.json ({ "slug": "https://..." }).
// A link is only filled when the ship has no url yet. Then sync.mjs runs.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const args = new Set(process.argv.slice(2));
const all = args.has('--all'), dry = args.has('--dry');

const j = JSON.parse(fs.readFileSync(new URL('days.json', root), 'utf8'));
const urlFile = new URL('data/release-urls.json', root);
const urls = fs.existsSync(urlFile) ? JSON.parse(fs.readFileSync(urlFile, 'utf8')) : {};

const m = /^([+-])(\d\d):?(\d\d)$/.exec(j.timezone_offset || '+00:00');
const off = (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]) * 60000;
const today = new Date(Date.now() + off).toISOString().slice(0, 10);

let shipped = 0, linked = 0;
for (const d of j.days) {
  if (d.status !== 'shipped' && (all || d.day <= today)) { d.status = 'shipped'; shipped++; console.log('ship  #' + d.slot + ' ' + d.name); }
  if (!d.url && urls[d.slug]) { d.url = urls[d.slug]; linked++; console.log('link  #' + d.slot + ' ' + d.name + ' -> ' + d.url); }
}
const total = j.days.filter(d => d.status === 'shipped').length;
const nolink = j.days.filter(d => d.status === 'shipped' && !d.url).map(d => d.name);
console.log(shipped + ' newly shipped, ' + linked + ' link(s) added, ' + total + ' of ' + j.days.length + ' shipped (local date ' + today + ').');
if (nolink.length) console.log('Shipped with no link yet (' + nolink.length + '): ' + nolink.join(', '));
if (dry) { console.log('Dry run, nothing written.'); process.exit(0); }

fs.writeFileSync(new URL('days.json', root), JSON.stringify(j, null, 1) + '\n');
execFileSync(process.execPath, [new URL('tools/sync.mjs', root).pathname], { stdio: 'inherit' });
