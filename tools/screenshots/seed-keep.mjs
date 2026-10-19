const B = 'http://127.0.0.1:47901';
let cookie = '';
const call = async (m, p, b) => { const r = await fetch(B + p, { method: m, headers: { 'content-type': 'application/json', cookie }, body: b ? JSON.stringify(b) : undefined }); const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0]; const t = await r.text(); if (!r.ok) console.log(m, p, r.status, t.slice(0, 200)); try { return JSON.parse(t); } catch { return t; } };
await call('POST', '/api/auth/login', { username: 'demo', password: 'demo-password-1' });
const day = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const N = [
  { title: 'Renew passport', text: 'Photo, form, and the old passport. Takes about three weeks.', tags: ['life.admin'], onList: true, dueDate: day(3), pinned: true, percentDone: 0.25 },
  { title: 'Book dentist', tags: ['health'], onList: true, dueDate: day(1) },
  { title: 'Fix the bike light', text: 'New batteries first; if that is not it, the wiring at the hub.', tags: ['home.garage'], onList: true, percentDone: 0.5 },
  { title: 'Plan the Queenstown trip', text: '- Flights: look at Thursday vs Friday\n- Book the cabin before school holidays\n- **Check** the road to Glenorchy', tags: ['travel'], onList: true, dueDate: day(10), percentDone: 0.1 },
  { title: 'Water the tomatoes', tags: ['home.garden'], onList: true, dueDate: day(0) },
  { title: 'Send Sam the photos', tags: ['life.admin'], onList: true },
  { title: 'Reading list 2026', text: '## Finished\n- *The Dispossessed*\n- *A Psalm for the Wild-Built*\n\n## Next\n- *Piranesi*\n- *Braiding Sweetgrass*', tags: ['life.reading'], pinned: true },
  { title: 'Sourdough notes', text: 'Hydration **75%**, 20% starter, bulk 4 h at 24 C.\n\nFold every 30 minutes for the first two hours, then leave it alone. Cold proof overnight; bake at 240 C covered for 20 minutes, then uncovered for 20.', tags: ['home.food'] },
  { title: 'Router and network', text: 'Admin at 192.168.1.1. The Pi lives at .20 and runs the tunnel; do not change its address without updating the tunnel config.', tags: ['home.tech'] },
  { title: 'Gift ideas', text: 'Mum: the good secateurs. Dad: that book on tide pools. Sam: nothing, a day out.', tags: ['life.people'] },
  { title: 'Meeting notes: Thursday', text: 'Decided to ship the Friday build. Rollback plan is the previous tag. Follow up on the migration timeline next week.', tags: ['work'] },
  { title: 'Done: submit tax return', onList: true, archived: true, tags: ['life.admin'] },
];
for (const n of N.reverse()) await call('POST', '/api/notes', n);
console.log((await call('GET', '/api/notes')).length, 'notes');
