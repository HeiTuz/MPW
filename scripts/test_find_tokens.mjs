#!/usr/bin/env node
// Structure tests for scripts/find_tokens.mjs and the lexicon tables it reads. Prose in the tables is not pinned.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CULTURES, LEXICON_DIR, MINOR_TAG, ROWS_ARE_CANDIDATES, SLUGS, drawRandom, findLookCards, loadAll, search } from './find_tokens.mjs';

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
  ['프리쿠라', 'プリクラ'], ['유카타', '浴衣'], ['한복', '한복'], ['냉백피', '쿨톤 새틴 베이스'], ['투명감', '透明感'], ['시오케이', '塩系'], ['고다르', 'Jean-Luc Godard'], ['치파오', '旗袍'],
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

// Camera is a layer of its own: `--layers camera` finds composition rows, and the moved telephoto row lives there.
assert.ok(SLUGS.includes('camera'));
assert.ok(tokensOf(['过肩'], { layers: ['camera'] }).includes('过肩镜头'), 'camera layer finds over-the-shoulder');
assert.ok(search({ terms: ['长焦压缩'], layers: ['optics'] })[0].matches.length === 0 && tokensOf(['长焦压缩'], { layers: ['camera'] }).includes('长焦压缩'), 'telephoto compression is a Camera row');

// Phrase queries: brackets and slashes split a phrase, filler words (감성, 느낌, 스타일, 룩, vibe) are dropped, Latin words match whole words only.
{
  const hk = tokensOf(['90년대 홍콩영화(왕가위 감성)']);
  assert.ok(hk.includes('王家卫'), 'bracketed phrase reaches 왕가위 rows');
  const withFiller = search({ terms: ['왕가위 감성'], layers: ['hair-makeup'] })[0].matches.map((m) => m.token);
  const without = search({ terms: ['왕가위'], layers: ['hair-makeup'] })[0].matches.map((m) => m.token);
  assert.deepEqual(withFiller, without, 'a filler word does not change the rows');
  assert.ok(tokensOf(['Nouvelle Vague']).every((t) => t !== 'Vaguelettes de la Seine'), 'a split Latin word does not match inside another word');
  assert.deepEqual(tokensOf(['홍콩/왕가위'], { layers: ['hair-makeup'] }).slice(0, 1), tokensOf(['왕가위'], { layers: ['hair-makeup'] }).slice(0, 1), 'a slash splits a phrase');
}

// Look cards: the CLI prints a "## Look card" block first when the query names a look, and says so in JSON.
for (const q of ['90년대 홍콩영화(왕가위 감성)', '왕가위', '港风', '홍콩 영화']) {
  out = run(['--q', q, '--limit', '2']);
  assert.equal(out.status, 0, out.stderr);
  assert.match(out.stdout, /^## Look card\n.+ — references\/image\/looks\/wong-kar-wai\.md\nnew image: node scripts\/read_look\.mjs wong-kar-wai --outline, then --branch <A\|B\|C\|D> \[--set S<n>\] \[--pair <n>\]\nextract: node scripts\/read_look\.mjs wong-kar-wai --facts, then --branch <A\|B\|C\|D> --no-pairs\n/, q);
  assert.deepEqual(JSON.parse(run(['--q', q, '--json']).stdout).looks.map((l) => l.slug), ['wong-kar-wai'], q);
}
for (const q of ['홍콩', '신중식,찻집', '老钱风', '홍콩 여행 스냅']) {
  out = run(['--q', q]);
  assert.ok(!/^## Look card$/m.test(out.stdout), `${q} calls no card`);
  assert.deepEqual(JSON.parse(run(['--q', q, '--json']).stdout).looks, []);
}
// The card is found however the query was cut: commas and brackets are ignored, and a name's words match in any order.
for (const q of ['캘리포니아, 골든아워, 해변, Kodak Gold 200', '골든아워 캘리포니아 해변,Gold Kodak 200', '캘리포니아(골든아워), Kodak Gold 200']) {
  assert.deepEqual(JSON.parse(run(['--q', q, '--json']).stdout).looks.map((l) => l.slug).sort(), ['california-golden-hour', 'kodak-gold-200'], q);
}
// A query that only touches a card's "do not call" words prints candidates with their summary and read command, never as a called card.
for (const [q, slug] of [['필카 감성, 한강', 'korea-old-film-light-leak'], ['일회용 카메라', 'korea-old-film-light-leak'], ['폴라로이드', 'venice-beach-polaroid-light-leak'], ['카페 감성', 'seoul-cafe-warm-diffuse']]) {
  out = run(['--q', q]);
  assert.ok(!/^## Look card$/m.test(out.stdout), `${q}: no called card`);
  assert.match(out.stdout, /^## Look card candidates\n/m, q);
  const json = JSON.parse(run(['--q', q, '--json']).stdout);
  assert.deepEqual(json.looks, [], q);
  assert.ok(json.candidates.some((c) => c.slug === slug && c.summary && c.file === `references/image/looks/${slug}.md`), `${q} offers ${slug}`);
  assert.ok(out.stdout.includes(`- ${slug} · `), `${q}: the candidate line names the slug`);
  assert.ok(out.stdout.includes('node scripts/read_look.mjs <slug> --outline') && out.stdout.includes('--facts'), `${q}: one line tells how to read a candidate`);
}
// Candidates come out closest to the request first: a culture cue (한강, 도쿄) puts that culture's card first, and the cap of 6 cuts after sorting.
{
  const first = (q) => JSON.parse(run(['--q', q, '--json']).stdout).candidates;
  assert.equal(first('필카 감성, 한강')[0].slug, 'korea-old-film-light-leak');
  assert.ok(['fujifilm-classic-neg', 'japan-provia-astia-film', 'utsurundesu-disposable'].includes(first('필카 감성, 도쿄')[0].slug));
  assert.ok(first('필카 감성, 도쿄').slice(0, 3).every((c) => /^(fujifilm|japan|utsurundesu)/.test(c.slug)), 'Japanese cards first');
  assert.ok(first('필카 감성').length >= 5);
}
// The generic disposable-camera word offers both disposable cards; the QuickSnap name belongs to the Japanese disposable card (it calls it, the Seoul film card only lists it as a candidate word).
assert.deepEqual(JSON.parse(run(['--q', '일회용 카메라', '--json']).stdout).candidates.map((c) => c.slug).filter((s) => ['utsurundesu-disposable', 'korea-old-film-light-leak'].includes(s)).sort(), ['korea-old-film-light-leak', 'utsurundesu-disposable']);
for (const q of ['후지 퀵스냅', 'Fujifilm QuickSnap']) assert.deepEqual(JSON.parse(run(['--q', q, '--json']).stdout).looks.map((l) => l.slug), ['utsurundesu-disposable'], q);
// A generic film word offers every film card that lists it, up to the cap, so the Seoul film card is not cut by the index order.
assert.ok(JSON.parse(run(['--q', '필카 감성', '--json']).stdout).candidates.length >= 5);
// A called card is not offered again as a candidate, and an ordinary query has no candidate block.
assert.ok(JSON.parse(run(['--q', '90년대 홍콩영화(왕가위 감성)', '--json']).stdout).candidates.every((c) => c.slug !== 'wong-kar-wai'));
assert.ok(!run(['--q', '老钱风']).stdout.includes('## Look card candidates'));
// One query can call a 장면 card and a 매체 card together; both come out with their axis so the brief can split the roles.
for (const q of ['캘리포니아 골든아워, Kodak Gold 200', '캘리포니아 골든아워 코닥 골드 200']) {
  const both = JSON.parse(run(['--q', q, '--json']).stdout).looks;
  assert.deepEqual(both.map((l) => [l.slug, l.axis]), [['california-golden-hour', '장면'], ['kodak-gold-200', '매체']], q);
  assert.match(run(['--q', q, '--limit', '1']).stdout, /^## Look card\n.+ \[장면\] — .+\nnew image: .+\nextract: .+\n.+ \[매체\] — .+\nnew image: /, q);
}
// A name's words that are scattered over the query call nothing (they stay candidates); a comma or one other word between them is fine.
{
  const looksOf = (q) => JSON.parse(run(['--q', q, '--json']).stdout);
  const scattered = looksOf('a Kodak camera, a gold silk dress, ISO 200');
  assert.deepEqual(scattered.looks, [], 'scattered words of Kodak Gold 200 call no card');
  assert.ok(scattered.candidates.some((c) => c.slug === 'kodak-gold-200'), 'the card stays a candidate');
  for (const q of ['Kodak, Gold, 200', 'Kodak Gold ISO 200', 'Kodak 200 gold', 'Kodak Gold 200, no flash']) assert.deepEqual(looksOf(q).looks.map((l) => l.slug), ['kodak-gold-200'], q);
  assert.deepEqual(looksOf('캘리포니아, 골든아워').looks.map((l) => l.slug), ['california-golden-hour']);
}
// A name with a negation next to it calls nothing and is not offered as a candidate either.
for (const q of ['no Kodak Gold, clean digital color', 'Kodak Gold 말고 디지털', '코닥 골드 200 말고 포트라', '不要 Kodak Gold 200', 'without Wong Kar-wai, a plain street']) {
  const json = JSON.parse(run(['--q', q, '--json']).stdout);
  assert.deepEqual(json.looks, [], q);
  assert.ok(json.candidates.every((c) => c.slug !== 'kodak-gold-200'), `${q}: the negated card is not offered`);
}
// Two cards come out in the order their names appear in the query, not in index order.
{
  const order = (q) => JSON.parse(run(['--q', q, '--json']).stdout).looks.map((l) => l.slug);
  assert.deepEqual(order('Kodak Gold 200, 캘리포니아 골든아워'), ['kodak-gold-200', 'california-golden-hour']);
  assert.deepEqual(order('캘리포니아 골든아워, Kodak Gold 200'), ['california-golden-hour', 'kodak-gold-200']);
  assert.match(run(['--q', 'Kodak Gold 200, 캘리포니아 골든아워', '--limit', '1']).stdout, /^## Look card\n.+ \[매체\] — .+\nnew image: .+\nextract: .+\n.+ \[장면\] — .+\nnew image: /);
}
// Nouvelle Vague has its own card now.
assert.deepEqual(JSON.parse(run(['--q', 'Nouvelle Vague', '--json']).stdout).looks.map((l) => l.slug), ['nouvelle-vague-16mm']);
// The card path in the block is the path read_refs.mjs reads (documented command works as printed).
{
  const block = run(['--q', '왕가위']).stdout;
  const cmd = block.match(/^new image: node (scripts\/read_look\.mjs) (\S+) (--outline), then /m);
  const readLook = (...args) => spawnSync(process.execPath, [path.join(scripts, '..', cmd[1]), cmd[2], ...args], { encoding: 'utf8', cwd: path.join(scripts, '..') });
  const read = readLook(cmd[3]);
  assert.equal(read.status, 0, read.stderr);
  assert.match(read.stdout, /^# 王家卫 · 港风/m);
  assert.equal(readLook('--branch', 'A', '--set', 'S1', '--pair', '1').status, 0, 'the new-image path runs as printed');
  assert.ok(block.match(/^extract: node scripts\/read_look\.mjs \S+ (--facts), then --branch <A\|B\|C\|D> (--no-pairs)$/m), 'the extract path is printed');
  assert.equal(readLook('--facts').status, 0, 'the extract path runs as printed');
  assert.equal(readLook('--branch', 'A', '--no-pairs').status, 0);
}

// A tag that is a look card's calling name matches only a term equal to it: the medium word "폴라로이드" does not pull the swimsuit rows the Polaroid cards use,
// while the card's own name still reaches them.
{
  const swim = (t) => /수영복|swimsuit|bikini/i.test(t);
  assert.ok(!tokensOf(['폴라로이드'], { layers: ['outfit'] }, 50).some(swim), 'a medium word does not match look-name tags by prefix');
  assert.ok(tokensOf(['폴라로이드 빛샘'], { layers: ['outfit'] }, 50).some(swim), 'the card name itself reaches the rows the card uses');
}
// When the query called a card, the words of its name score on exact matches only and era words are dropped from the layer search,
// so "Kodak Gold 200" does not hit a "gold thread" legwear row and "90년대 홍콩영화(왕가위 감성)" does not pull every 90s-tagged row.
{
  const gold = ['Kodak Gold 200'];
  assert.ok(search({ terms: gold, layers: ['legwear'] })[0].matches.length > 0, 'without a card the split word "gold" still matches');
  assert.equal(search({ terms: gold, layers: ['legwear'], cards: findLookCards(gold) })[0].matches.length, 0, 'with the card called it does not');
  const hk = ['90년대 홍콩영화(왕가위 감성)'];
  const optics = (cards) => search({ terms: hk, layers: ['optics'], cards })[0].matches.map((m) => m.token);
  assert.ok(optics([]).includes('Kodak FunSaver'), 'without a card the era word matches 90s-tagged rows');
  assert.ok(!optics(findLookCards(hk)).includes('Kodak FunSaver') && optics(findLookCards(hk)).includes('王家卫'), 'with the card called the era word is dropped and the look rows stay');
  assert.ok(tokensOf(['90년대 스타일'], { layers: ['legwear'] }, 50).includes('ルーズソックス'), 'a plain era query with no card still finds era rows');
}

// --help prints the usage and exits 0 instead of failing with "needs a value".
const help = run(['--help']);
assert.equal(help.status, 0, 'find_tokens --help exits 0');
assert.match(help.stdout, /usage: node scripts\/find_tokens\.mjs/);

// Aliases are searched but not printed unless --aliases asks: the same query finds the same tokens either way.
{
  const withAliases = run(['--q', '시스루뱅', '--layers', 'hair-makeup', '--aliases']).stdout;
  const without = run(['--q', '시스루뱅', '--layers', 'hair-makeup']).stdout;
  assert.ok(/ \([^)]+\) \[/.test(withAliases), '--aliases prints the alias list');
  assert.ok(!/ \([^)]+\) \[/.test(without), 'the default output has no alias list');
  assert.ok(/ \[(look|item|gear|place)(, 소품 필요)?\]$/m.test(without), 'the kind (and 소품 필요) stays');
  const tokens = (t) => t.split('\n').filter((l) => l.includes(' — ')).map((l) => l.split(' — ')[0]);
  assert.deepEqual(tokens(without), tokens(withAliases), 'the same rows come out');
  assert.ok(tokens(without).length > 0 && without.includes('소품 필요') === withAliases.includes('소품 필요'), '소품 필요 is kept');
  const props = run(['--q', '傘をさす', '--layers', 'pose']).stdout;
  assert.ok(/\[look(, 소품 필요)?\]/.test(props));
}

// Photo cues: a query that says what a photo shows (weather, light, place, medium) offers the cards whose summary, names and facts share two or more of those cues,
// the card with the most shared cues first. One shared word offers nothing unless it is one of a card's do-not-call words. Prose in the cards is not pinned.
{
  const candidates = (q) => JSON.parse(run(['--q', q, '--json']).stdout).candidates.map((c) => c.slug);
  const photos = [
    ['비 오는 밤,네온,젖은 도로,투명 우산', 'rainy-night-shinjuku'],
    ['雨夜,ネオン,透明傘', 'rainy-night-shinjuku'],
    ['비 오는 네온 밤거리', 'rainy-night-shinjuku'],
    ['낮,공원,벤치,디카', 'japan-ccd-daylight'],
    ['낮 공원 벤치 디카', 'japan-ccd-daylight'],
    ['카페,창가,오후', 'seoul-cafe-warm-diffuse'],
    ['플래시 터진 실내 스냅', 'y2k-ccd-flash'],
    ['흑백,거리', 'trix-humanist-bw'],
    ['석양,해변', 'california-golden-hour'],
  ];
  for (const [q, slug] of photos) assert.ok(candidates(q).slice(0, 3).includes(slug), `${q}: ${slug} is in the first three candidates (${candidates(q).join(', ')})`);
  for (const q of ['고양이, 툇마루, 낮잠', '고양이 툇마루 낮잠 한옥', '인물,여자,스냅,사진', '老钱风']) {
    assert.deepEqual(candidates(q), [], `${q}: nothing to offer`);
    assert.ok(!run(['--q', q]).stdout.includes('## Look card candidates'), `${q}: no candidate block`);
  }
  assert.ok(candidates('비 오는 밤,네온,젖은 도로,투명 우산,雨夜,ネオン').length <= 6, 'at most six');
  // A card offered only for the same cues as a card above it is dropped (several cards matched only 네온 and 우산 here).
  const reasons = JSON.parse(run(['--q', '네온,비,우산,신주쿠,밤,젖은 노면', '--json']).stdout).candidates.map((c) => c.matched);
  assert.equal(new Set(reasons).size, reasons.length, `no two candidates for the same cues: ${reasons.join(' / ')}`);
  // A cue on its own offers nothing; the old do-not-call rule still offers one card on one word.
  assert.deepEqual(candidates('雨夜'), []);
  assert.ok(candidates('네온사인').includes('rainy-night-shinjuku'));
  // A card the request names and negates is not offered for its cues.
  assert.ok(!candidates('no Kodak Gold, clean digital color').includes('kodak-gold-200'));
}

// Output size: the card block and the rows print shorter than before; ceilings are the measured size plus 5% (5076, 6109, 8189 bytes when set; the second became 6518 with the 문장 속 낱말 block of up to four rows, so its ceiling went from 6500 to 6850).
{
  const size = (args) => Buffer.byteLength(run(args).stdout);
  const queries = [
    [['--q', '비 오는 밤 신주쿠,투명 우산,여자', '--limit', '3'], 5400],
    [['--q', '툇마루,낮잠,고양이,한옥,오후 햇살,KR', '--limit', '4'], 6850],
    [['--q', '雨夜新宿,透明傘,女性,ネオン', '--limit', '6'], 8700],
  ];
  for (const [args, limit] of queries) assert.ok(size(args) <= limit, `${args[1]}: ${size(args)} bytes is over ${limit}`);
}

// Part-name rows (tag 부분): they print once in a "## 문장 속 낱말" block, no more than the block limit, one layer after another; layer lists hold only rows that can head a line.
{
  const out = run(['--q', '한옥,新中式']).stdout;
  const block = out.split('## 문장 속 낱말\n')[1];
  assert.ok(block, 'a 한옥 + 新中式 query prints the part block');
  const lines = block.trim().split('\n').slice(1).filter((line) => !line.startsWith('(+'));
  assert.ok(lines.length >= 2 && lines.length <= 4, `${lines.length} part rows`);
  const partRows = loadAll().flatMap((l) => l.rows.filter((r) => r.tags.includes('부분')).map((r) => ({ ...r, layer: l.slug })));
  const found = lines.map((line) => partRows.find((r) => line.startsWith(`${r.token} — ${r.looks}`)));
  assert.ok(found.every(Boolean), 'every printed part row is a 부분 row');
  assert.ok(new Set(found.map((r) => r.layer)).size >= 2, 'part rows come from more than one layer');
  const before = out.split('## 문장 속 낱말')[0];
  for (const line of lines) assert.ok(!before.includes(`${line.split(' — ')[0]} — `), 'a part row is not listed twice');
  const json = JSON.parse(run(['--q', '한옥,新中式', '--json']).stdout);
  assert.ok(json.words.length >= 2 && json.words.every((w) => w.tags.includes('부분')), 'json carries the part rows under words');
  assert.ok(!Object.values(json.layers).flat().some((m) => m.tags.includes('부분')), 'json layers carry no part rows');
  // A part row found by its own name still prints, and a query that touches no part prints no block.
  assert.ok(run(['--q', '마당']).stdout.includes('## 문장 속 낱말\n') && run(['--q', '마당']).stdout.includes('마당 — '));
  assert.ok(!run(['--q', '시스루뱅']).stdout.includes('문장 속 낱말'));
  // --limit above 6 lists more parts; --random leaves the tag alone.
  assert.ok(run(['--q', '한옥', '--limit', '12', '--layers', 'scene']).stdout.split('## 문장 속 낱말\n')[1].trim().split('\n').length > 5);
  assert.equal(run(['--q', '한옥', '--random', '2', '--layers', 'scene']).status, 0);
  // Parts named in the query all print past the block limit, and a cut block says how many rows it left out and which --limit shows them.
  const named = ['마당', '창살', '문살', '창호지', '기와', '처마', '돌담'];
  const full = run(['--q', `한옥,${named.join(',')}`, '--culture', 'KR']).stdout.split('## 문장 속 낱말\n')[1];
  for (const token of named) assert.ok(full.includes(`\n${token} — `), `${token} is named in the query and prints`);
  const cut = run(['--q', '한옥', '--culture', 'KR']).stdout.split('## 문장 속 낱말\n')[1];
  const more = /\(\+(\d+) more: --limit (\d+)\)/.exec(cut);
  assert.ok(more, 'a cut part block ends with a +N more line');
  const long = run(['--q', '한옥', '--culture', 'KR', '--limit', more[2]]).stdout.split('## 문장 속 낱말\n')[1];
  assert.ok(!long.includes('more: --limit') && long.trim().split('\n').length - 1 === 4 + Number(more[1]), 'the suggested --limit shows every part row');
  assert.equal(JSON.parse(run(['--q', '한옥', '--culture', 'KR', '--json']).stdout).words_more, Number(more[1]));
}
// The new part and expression rows are found by what a request calls them.
for (const [query, token] of [['한옥 마당', '마당'], ['창호지', '창호지'], ['오비', '帯'], ['개완', '盖碗'], ['멈칫', '멈칫'], ['쿄톤', 'きょとん'], ['북커버', 'ブックカバー']]) {
  assert.ok(search({ terms: [query] }).flatMap((l) => l.matches.map((m) => m.token)).includes(token), `${query} -> ${token}`);
}

// Layer rows are candidates for one image: the text output says so once, ahead of the layers; the empty result and the JSON output do not carry the line.
{
  const out = run(['--q', 'walking', '--layers', 'pose']).stdout;
  assert.equal(out.split(ROWS_ARE_CANDIDATES).length - 1, 1, 'the candidate line is printed once');
  assert.ok(out.indexOf(ROWS_ARE_CANDIDATES) < out.indexOf('## Pose'), 'the candidate line comes before the layers');
  assert.ok(!run(['--q', nonsense]).stdout.includes(ROWS_ARE_CANDIDATES), 'no rows, no candidate line');
  assert.ok(!run(['--q', 'walking', '--layers', 'pose', '--json']).stdout.includes(ROWS_ARE_CANDIDATES), 'JSON output is unchanged');
}
