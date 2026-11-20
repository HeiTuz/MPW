#!/usr/bin/env node
// Structure tests for scripts/find_tokens.mjs and the lexicon tables it reads. Prose in the tables is not pinned.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CULTURES, LEXICON_DIR, MINOR_TAG, SLUGS, drawRandom, loadAll, search } from './find_tokens.mjs';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(scripts, 'find_tokens.mjs');
const run = (args, file = cli) => spawnSync(process.execPath, [file, ...args], { encoding: 'utf8' });
const tokensOf = (terms, opts = {}, limit = 6) =>
  search({ terms, ...opts }).flatMap((l) => l.matches.slice(0, limit).map((m) => m.token));

const nonsense = 'zzqxjv';

// Every table parses, rows have all columns, tokens are unique inside a layer, and the file list matches SLUGS.
assert.deepEqual(fs.readdirSync(LEXICON_DIR).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)).sort(), [...SLUGS].sort());
for (const { slug, rows } of loadAll()) {
  assert.ok(rows.length > 0, slug);
  const seen = new Set();
  for (const r of rows) {
    assert.ok(r.token && r.looks && r.kind && r.culture.length && r.culture.every((c) => CULTURES.includes(c)), `${slug}: ${r.token}`);
    assert.ok(!seen.has(r.token.toLowerCase()), `${slug}: duplicate ${r.token}`);
    seen.add(r.token.toLowerCase());
  }
}

// Hangul transliterations and other aliases find the original-language token.
const aliasCases = [
  ['신중식', '新中式'], ['코모레비', '木漏れ日'], ['자판기', '自販機'], ['왕가위', '王家卫'],
  ['프리쿠라', 'プリクラ'], ['유카타', '浴衣'], ['한복', '한복'], ['냉백피', '冷白皮'], ['투명감', '透明感'], ['시오케이', '塩系'], ['고다르', 'Jean-Luc Godard'], ['치파오', '旗袍'],
];
for (const [query, token] of aliasCases) assert.ok(tokensOf([query]).includes(token), `${query} -> ${token}`);
// Spacing, hyphen and middle-dot variants match: the spaced query finds the unspaced token, and an unspaced query finds the hyphenated alias.
for (const [query, token] of [['시스루 뱅', '시스루뱅'], ['시스루뱅', 'see-through bangs'], ['seethroughbangs', 'see-through bangs']]) {
  const found = search({ terms: [query] }).flatMap((l) => l.matches.flatMap((m) => [m.token, ...m.aliases]));
  assert.ok(found.includes(token), `${query} -> ${token}`);
}
// The squashed form never crosses word boundaries: "한복" must not hit an alias like "젖은 듯한 복고 컬" (it still finds the 한복 token).
for (const layer of search({ terms: ['한복'] })) {
  for (const m of layer.matches) {
    const direct = [m.token, ...m.aliases].some((x) => x.toLowerCase().includes('한복')) || m.tags.some((t) => t.includes('한복')) || m.looks.toLowerCase().includes('한복') || m.culture.includes('한복');
    assert.ok(direct, `${m.token} matched 한복 only across a word boundary`);
  }
}
// Width and case do not matter.
assert.ok(tokensOf(['ＣＣＤ 카메라']).includes('CCD 카메라') && tokensOf(['kodak portra 400']).includes('Kodak Portra 400'));

// A spaced phrase that matches nothing as written is retried word by word; one-character words are skipped.
assert.ok(tokensOf(['90년대 홍콩 영화']).includes('港风妆'), 'spaced phrase falls back to its words');
{
  // The split is decided per layer: layers where the phrase matches as written keep it, the others use its words.
  const hk = Object.fromEntries(search({ terms: ['90년대 홍콩'] }).map((l) => [l.slug, l.matches.map((m) => m.token)]));
  assert.ok(hk.outfit.includes('港风西装') && hk.pose.includes('倚门而立'), 'phrase reaches layers where only its words match');
  // A one-character Hangul word keeps its meaning but matches exactly only: rain rows appear, 첫눈 does not lead.
  const rain = search({ terms: ['비 오는 골목'], layers: ['scene'] })[0].matches.map((m) => m.token);
  assert.ok(rain.includes('비 오는 창가') && rain[0] !== '첫눈', 'one-character word 비 still finds rain rows');
}
assert.ok(search({ terms: [nonsense + ' ' + nonsense] }).every((l) => !l.matches.length));

// Layer and culture filters.
const sceneOnly = search({ terms: ['카페'], layers: ['scene'] });
assert.deepEqual(sceneOnly.map((l) => l.slug), ['scene']);
for (const layer of search({ terms: ['카페'], culture: 'KR' })) {
  for (const m of layer.matches) assert.ok(m.culture.includes('KR'), `${m.token} is not KR`);
}
assert.ok(search({ terms: ['카페'], culture: 'KR' }).some((l) => l.matches.length));

// Ranking: an exact token match outranks a substring match.
const komo = search({ terms: ['木漏れ日'], layers: ['light'] })[0].matches;
assert.equal(komo[0].token, '木漏れ日');

// CLI: empty results, JSON shape, limit, errors.
let out = run(['--q', nonsense, '--layers', 'scene,pose']);
assert.equal(out.status, 0, out.stderr);
assert.match(out.stdout, /no match in any layer/);
assert.ok(!/## /.test(out.stdout), 'a fully empty result prints one line, not layer headings');
out = run(['--q', '코티지코어', '--layers', 'style,scene', '--limit', '2']);
assert.match(out.stdout, /## Style\n.+ — .+/);
assert.match(out.stdout, /## Scene\nno match/);
assert.ok(out.stdout.split('\n').filter((l) => l.includes(' — ')).length <= 2, '--limit caps rows per layer');
out = run(['--q', '신중식,찻집', '--json', '--limit', '3']);
const json = JSON.parse(out.stdout);
assert.deepEqual(json.query, ['신중식', '찻집']);
assert.deepEqual(Object.keys(json.layers), SLUGS);
for (const rows of Object.values(json.layers)) {
  assert.ok(rows.length <= 3);
  for (const r of rows) assert.deepEqual(Object.keys(r), ['token', 'aliases', 'culture', 'tags', 'looks', 'kind', 'score']);
}
assert.equal(run(['--q', 'x', '--layers', 'nope']).status, 2);
assert.equal(run(['--q', 'x', '--culture', 'ZZ']).status, 2);
assert.equal(run([]).status, 2);

// --random: an injected picker makes the draw deterministic (index 0 each time: first match, then the last one).
const results = search({ terms: ['고요'], layers: ['scene', 'expression'], culture: 'KR' });
const drawn = drawRandom(results, 2, () => 0);
for (let i = 0; i < results.length; i++) {
  const m = results[i].matches;
  assert.ok(m.length >= 2);
  assert.deepEqual(drawn[i].matches.map((x) => x.token), [m[0].token, m.at(-1).token]);
}
assert.deepEqual(drawRandom(search({ terms: [nonsense], layers: ['scene'] }), 2, () => 0)[0].matches, []);
out = run(['--q', '고요', '--layers', 'scene,expression', '--random', '2', '--json']);
for (const rows of Object.values(JSON.parse(out.stdout).layers)) assert.equal(rows.length, 2);

// --random never draws a row tagged 아동·학생, while a direct search still returns it.
const minorRows = loadAll().flatMap((l) => l.rows.filter((r) => r.tags.includes(MINOR_TAG)).map((r) => ({ slug: l.slug, token: r.token })));
assert.ok(minorRows.length > 0);
const sample = minorRows[0];
const pool = search({ terms: [sample.token], layers: [sample.slug] });
assert.ok(pool[0].matches.some((m) => m.token === sample.token), 'direct search finds the tagged row');
for (const layer of drawRandom(search({ terms: minorRows.map((r) => r.token), layers: [sample.slug] }), 1000, () => 0)) {
  assert.ok(layer.matches.every((m) => !m.tags.includes(MINOR_TAG)), 'a tagged row was drawn at random');
}

// The CLI runs through a symlink (installs can sit behind one).
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mpw-find-tokens-'));
try {
  const link = path.join(tmp, 'find_tokens.mjs');
  fs.symlinkSync(cli, link);
  out = run(['--q', '코모레비', '--layers', 'light', '--limit', '1'], link);
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /## Light\n木漏れ日/);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Recall fixture: Korean requests, their query terms, and tokens that must come back.
const fx = JSON.parse(fs.readFileSync(path.join(scripts, 'fixtures', 'lexicon_recall.json'), 'utf8'));
assert.ok(fx.cases.length >= 20);
for (const c of fx.cases) for (const t of c.expect) assert.ok(!c.q.includes(t), `identity expectation: ${c.request} -> ${t}`);
const lexiconTokens = new Set(loadAll().flatMap((l) => l.rows.map((r) => r.token)));
const misses = [];
let sum = 0;
for (const c of fx.cases) {
  assert.ok(c.q.length && c.expect.length >= 3 && c.expect.length <= 6, c.request);
  for (const t of c.expect) assert.ok(lexiconTokens.has(t), `fixture token not in lexicon: ${t}`);
  const got = new Set(tokensOf(c.q, {}, fx.limit));
  const missed = c.expect.filter((t) => !got.has(t));
  if (missed.length) misses.push(`${c.request}: ${missed.join(', ')}`);
  sum += (c.expect.length - missed.length) / c.expect.length;
}
const mean = sum / fx.cases.length;
assert.ok(mean >= fx.min_mean_recall, `mean recall ${mean.toFixed(3)} < ${fx.min_mean_recall}\n${misses.join('\n')}`);
console.log(`find_tokens: ${fx.cases.length} cases, mean recall ${mean.toFixed(3)}${misses.length ? `; missed: ${misses.join(' / ')}` : ''}`);

// --help prints the usage and exits 0 instead of failing with "needs a value".
const help = run(['--help']);
assert.equal(help.status, 0, 'find_tokens --help exits 0');
assert.match(help.stdout, /usage: node scripts\/find_tokens\.mjs/);
