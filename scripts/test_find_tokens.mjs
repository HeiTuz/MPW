#!/usr/bin/env node
// Structure tests for scripts/find_tokens.mjs and the lexicon tables it reads. Prose in the tables is not pinned.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CULTURES, LEXICON_DIR, SLUGS, drawRandom, loadAll, search } from './find_tokens.mjs';

const scripts = path.dirname(fileURLToPath(import.meta.url));
const cli = path.join(scripts, 'find_tokens.mjs');
const run = (args, file = cli) => spawnSync(process.execPath, [file, ...args], { encoding: 'utf8' });
const tokensOf = (terms, opts = {}, limit = 6) =>
  search({ terms, ...opts }).flatMap((l) => l.matches.slice(0, limit).map((m) => m.token));

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
  ['프리쿠라', 'プリクラ'], ['유카타', '浴衣'], ['고다르', 'Godard'], ['치파오', '旗袍'],
];
for (const [query, token] of aliasCases) assert.ok(tokensOf([query]).includes(token), `${query} -> ${token}`);
// Width and case do not matter.
assert.ok(tokensOf(['ＣＣＤ 카메라']).includes('CCD 카메라') && tokensOf(['kodak portra 400']).includes('Kodak Portra 400'));

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
const nonsense = 'zzqxjv';
let out = run(['--q', nonsense, '--layers', 'scene,pose']);
assert.equal(out.status, 0, out.stderr);
assert.match(out.stdout, /no match in any layer/);
assert.ok(!/## /.test(out.stdout), 'a fully empty result prints one line, not layer headings');
out = run(['--q', '신중식', '--layers', 'style,scene', '--limit', '2']);
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
const results = search({ terms: ['카페'], layers: ['scene', 'expression'], culture: 'KR' });
const drawn = drawRandom(results, 2, () => 0);
for (let i = 0; i < results.length; i++) {
  const m = results[i].matches;
  assert.ok(m.length >= 2);
  assert.deepEqual(drawn[i].matches.map((x) => x.token), [m[0].token, m.at(-1).token]);
}
assert.deepEqual(drawRandom(search({ terms: [nonsense], layers: ['scene'] }), 2, () => 0)[0].matches, []);
out = run(['--q', '카페', '--layers', 'scene,expression', '--random', '2', '--json']);
for (const rows of Object.values(JSON.parse(out.stdout).layers)) assert.equal(rows.length, 2);

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
