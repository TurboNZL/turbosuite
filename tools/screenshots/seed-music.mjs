import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
const TOKEN = process.argv[2], B = 'http://127.0.0.1:47813', DEV = 'seed-demo';
const H = { Authorization: `Bearer ${TOKEN}` };
let t0 = Date.now() - 40 * 864e5;
const newId = (now) => { const hex = (n, l) => n.toString(16).padStart(l, '0'); const ts = hex(now, 12), r = [...randomBytes(10)].map((x) => hex(x, 2)).join(''); return `${ts.slice(0, 8)}-${ts.slice(8, 12)}-7${r.slice(0, 3)}-${((parseInt(r.slice(4, 6), 16) & 0x3f) | 0x80).toString(16).padStart(2, '0')}${r.slice(6, 8)}-${r.slice(8, 20)}`; };
let tick = t0; const id = () => newId(tick += 1000);
const rec = (table, data, extra = {}) => ({ table, id: extra.id ?? id(), updatedAt: Date.now(), deviceId: DEV, deleted: false, data });
// audio
const MEDIA = process.env.MEDIA || 'media', AUDIO = process.env.AUDIO || 'audio';
const put = async (path, type) => { const buf = readFileSync(path); const h = createHash('sha256').update(buf).digest('hex'); const r = await fetch(`${B}/api/files/${h}`, { method: 'PUT', headers: { ...H, 'content-type': type }, body: buf }); console.log('file', path, r.status); return h; };
const hashes = [];
for (let i = 1; i <= 4; i++) hashes.push(await put(`${AUDIO}/t${i}.mp3`, 'audio/mpeg'));
const coverOf = {};
for (const k of ['low-tide-radio', 'paper-lanterns', 'furnace-hymns', 'neon-circuit', 'rooms-we-left', 'long-field', 'afterimage', 'small-hours']) coverOf[k] = await put(`${MEDIA}/covers/${k}.jpg`, 'image/jpeg');
const records = [];
const genres = ['Indie rock', 'Dream pop', 'Electronic', 'Jazz', 'Folk'];
for (const g of genres) records.push(rec('genres', { name: g }));
const lib = [
  { artist: 'Harbour Lights', genre: 'Dream pop', albums: [
    { title: 'Low Tide Radio', key: 'low-tide-radio', date: '2024-03-08', tracks: [['Salt on the Glass', 9.1], ['Night Ferry', 8.4], ['Static Bloom', 7.2], ['Pale Signal', 6.6], ['Wake Me at Dawn', 8.8], ['The Long Way Round', 5.9], ['Harbour Master', 7.6]] },
    { title: 'Paper Lanterns', key: 'paper-lanterns', date: '2025-09-19', tracks: [['Cold Open', 7.7], ['Lantern Season', 9.4], ['Quiet Machines', 6.1], ['Glasshouse', 7.9], ['Slow Rain Again', 8.1], ['Ribbon', 6.8]] } ] },
  { artist: 'The Ember Room', genre: 'Indie rock', albums: [
    { title: 'Furnace Hymns', key: 'furnace-hymns', date: '2023-05-26', tracks: [['Coal Town', 8.9], ['Hammer and Bell', 7.4], ['Second Shift', 6.8], ['Ash Valley', 8.3], ['Ironbark', 5.5], ['Go Easy, Sunday', 9.0], ['Wire and Wood', 7.1]] } ] },
  { artist: 'Nova Cartel', genre: 'Electronic', albums: [
    { title: 'Neon Circuit', key: 'neon-circuit', date: '2025-01-31', tracks: [['Voltage Garden', 8.6], ['Midnight Relay', 9.2], ['Packet Loss', 6.4], ['Chrome Daydream', 7.8], ['Standby', 5.2], ['Sunset Protocol', 8.0]] },
    { title: 'afterimage', key: 'afterimage', date: '2026-02-13', tracks: [['Halftone', 8.7], ['Dot Matrix Heart', 7.5], ['Fade Out, Fade In', 9.1], ['Ghosting', 6.3], ['Lowlight', 7.0]] } ] },
  { artist: 'Marlow Quartet', genre: 'Jazz', albums: [
    { title: 'Rooms We Left', key: 'rooms-we-left', date: '2022-11-04', tracks: [['Blue Hour', 8.2], ['Brushwork', 7.0], ['The Landlord Waltz', 6.9], ['After Closing', 9.3], ['Spare Key', 7.7]] },
    { title: 'small hours', key: 'small-hours', date: '2024-10-11', tracks: [['Last Tram', 8.5], ['Moon in a Teacup', 9.0], ['Insomnia Bossa', 7.3], ['Quarter to Four', 8.8]] } ] },
  { artist: 'Willow & the Wren', genre: 'Folk', albums: [
    { title: 'The Long Field', key: 'long-field', date: '2023-08-18', tracks: [['Hedgerow', 7.9], ['Barley Moon', 8.6], ['Stone Wall Song', 6.7], ['River Meadow', 9.2], ['Pine and Pitch', 7.2], ['Homeward', 8.4]] } ] },
];
const tracks = [];
let hi = 0;
for (const a of lib) {
  const artistId = id();
  records.push(rec('artists', { name: a.artist, image: coverOf[a.albums[0].key], aliases: [] }, { id: artistId }));
  for (const al of a.albums) {
    const albumId = id(), releaseId = id(), trackIds = [];
    const credits = [{ artistId, role: ['Lead artist'] }];
    al.tracks.forEach(([title, q], i) => { const tid = id(); trackIds.push(tid); tracks.push({ id: tid, q }); records.push(rec('tracks', { title, credits, genres: [a.genre], albums: [{ albumId, order: i + 1 }], file: hashes[hi++ % 4], initialRating: null, spotifyUrl: null, geniusUrl: null, youtubeMusicUrl: null, bitrate: '96 kbps', bpm: null, key: null, memories: 0, syncWithAlbumCredits: true, queueRules: {} }, { id: tid })); });
    records.push(rec('albums', { title: al.title, credits, genres: [a.genre], cover: coverOf[al.key], defaultReleaseId: releaseId, trackOrder: trackIds }, { id: albumId }));
    records.push(rec('releases', { albumId, title: '', cover: coverOf[al.key], releaseDate: al.date, trackIds }, { id: releaseId }));
  }
}
// votes: pairs, winner decided by latent quality with noise
const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
for (let n = 0; n < 700; n++) {
  const a = tracks[Math.floor(rnd() * tracks.length)], b = tracks[Math.floor(rnd() * tracks.length)];
  if (a.id === b.id) continue;
  const win = a.q + (rnd() - 0.5) * 3 > b.q + (rnd() - 0.5) * 3 ? a : b;
  records.push({ table: 'votes', id: id(), updatedAt: Date.now(), deviceId: DEV, deleted: false, data: { trackAId: a.id, trackBId: b.id, winnerId: win.id, isEqual: false, timestamp: Date.now() - Math.floor(rnd() * 30 * 864e5) } });
}
// listening history: ~30 days of plays, favouring the higher-rated tracks and a daily rhythm
const sorted = [...tracks].sort((a, b) => b.q - a.q);
for (let n = 0; n < 420; n++) {
  const pick = sorted[Math.floor(Math.pow(rnd(), 1.7) * sorted.length)];
  const day = Math.floor(rnd() * 30), hour = 7 + Math.floor(rnd() * rnd() * 16);
  const ts = Date.now() - day * 864e5 - (24 - hour) * 36e5 + Math.floor(rnd() * 36e5);
  records.push({ table: 'playbackLogs', id: id(), updatedAt: Date.now(), deviceId: DEV, deleted: false, data: { trackId: pick.id, timestamp: ts, duration: 150 + Math.floor(rnd() * 120), length: 240, sourceType: null, sourceId: null, isSkip: rnd() < 0.08 } });
}
// a playlist
const fav = tracks.filter((t) => t.q >= 8.5).map((t) => t.id);
records.push(rec('playlists', { name: 'Top of the pile', description: 'What keeps winning', cover: coverOf['paper-lanterns'], createdAt: Date.now(), kind: 'tracks', trackIds: fav }));
for (let i = 0; i < records.length; i += 500) { const r = await fetch(`${B}/api/sync/push`, { method: 'POST', headers: { ...H, 'content-type': 'application/json' }, body: JSON.stringify({ records: records.slice(i, i + 500) }) }); console.log('push', r.status, (await r.text()).slice(0, 120)); }
