#!/usr/bin/env node
// Structure tests for the look cards in references/image/looks/. Prose inside the cards is not pinned:
// only sections, table shapes, branch letters, slot names, dictionary membership, the index and the card lookup.
//   node scripts/test_look_cards.mjs                                         every card and the index (what npm test runs)
//   node scripts/test_look_cards.mjs --card <slug> --pending <file>          one card while its index line and dictionary rows are still
//                                                                            only in <file> (card-authoring guide: <slug>.additions.md)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import { LOOKS_DIR, LEXICON_DIR, findLookCards, loadAll, loadLooks } from './find_tokens.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const norm = (s) => s.normalize('NFKC').toLowerCase().trim();
const splitRow = (line) => line.replace(/^\| | \|$/g, '').split(/(?<!\\) \| /);
const list = (cell) => cell.split(';').map((s) => s.trim()).filter(Boolean);

// Section order every card follows (design 1.1). Layer sections come between the fixed-slot table and the scene sets.
const LAYERS = {
  'Hair and makeup': 'hair-makeup', Expression: 'expression', Outfit: 'outfit', Legwear: 'legwear', 'Props and nails': 'props-nails',
  Style: 'style', Scene: 'scene', Light: 'light', Optics: 'optics',
};
const HEAD = ['고정 사실', '갈래 고르기', '끄는 고정 몫'];
const TAIL = ['장면 세트', '포즈·구도 쌍', '맞지 않는 것', '출처'];
// Generic labels that are slot names rather than dictionary words; image-brief examples use them the same way.
const GENERIC_TOKENS = new Set(['palette']);

const tableRows = (body) => body.split('\n').filter((l) => /^\| /.test(l) && !/^\| (갈래|항목|슬롯|세트|번호|---)/.test(l)).map(splitRow);
function sections(text) {
  const out = []; let cur = null;
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) { cur = { title: line.slice(3).trim(), body: '' }; out.push(cur); } else if (cur) cur.body += line + '\n';
  }
  return out;
}
const lineOf = (cell) => {
  const m = cell.match(/^(.+?) — (.+)$/);
  return m ? { token: m[1], sentence: m[2] } : null;
};

const argv = process.argv.slice(2);
const argOf = (flag) => (argv.includes(flag) ? argv[argv.indexOf(flag) + 1] : null);
const onlyCard = argOf('--card'), pendingFile = argOf('--pending');
assert.ok(!pendingFile || onlyCard, '--pending needs --card <slug>');

// A pending additions file lists dictionary rows and the index row a card worker has not merged yet:
//   ### lexicon/scene.md CN   (rows under it start with "| ")      ### looks/index.md   (one table row)
function readPending(file) {
  const rows = {}; const index = [];
  let target = null;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const h = line.match(/^### (lexicon\/([a-z-]+)\.md|looks\/index\.md)\b/);
    if (h) { target = h[2] ?? 'index'; continue; }
    if (/^#{1,2} /.test(line)) { target = null; continue; }
    if (target && /^\| /.test(line) && !/^\| (토큰|slug|---)/.test(line)) {
      if (target === 'index') index.push(line); else (rows[target] ??= []).push(line);
    }
  }
  return { rows, index };
}
const pending = pendingFile ? readPending(pendingFile) : { rows: {}, index: [] };

// Dictionary: token or alias, any layer file (and per layer for the section a line sits in).
const layerRows = Object.fromEntries(loadAll().map((l) => [l.slug, l.rows]));
for (const [slug, lines] of Object.entries(pending.rows)) {
  assert.ok(layerRows[slug], `pending rows name an unknown layer file lexicon/${slug}.md`);
  for (const line of lines) {
    const cells = splitRow(line);
    assert.equal(cells.length, 6, `pending ${slug} row needs 6 columns: ${line.slice(0, 50)}`);
    layerRows[slug].push({ token: cells[0], aliases: list(cells[1]) });
  }
}
const inLayer = (slug, token) => layerRows[slug].some((r) => norm(r.token) === norm(token) || r.aliases.some((a) => norm(a) === norm(token)));

// fixed-lines slot names: every backticked word of a bullet's head.
const fixed = fs.readFileSync(path.join(root, 'references/image/fixed-lines.md'), 'utf8');
const FIXED_SLOTS = new Set(fixed.split('\n').filter((l) => /^- `/.test(l)).flatMap((l) => [...l.split(':')[0].matchAll(/`([a-z-]+)`/g)].map((m) => m[1])));
assert.ok(['face-clear', 'base', 'lip', 'face-light', 'catchlight', 'grain', 'framing', 'ratio', 'lens', 'closer'].every((s) => FIXED_SLOTS.has(s)), 'fixed-lines slot list');

// Index and files agree. In single-card mode the card's own index row may still be pending: lookups then run on a temporary copy.
let looks = loadLooks();
let looksDir = LOOKS_DIR;
const cardFiles = fs.readdirSync(LOOKS_DIR).filter((f) => f.endsWith('.md') && !['index.md', 'LICENSE-Iris.md'].includes(f)).map((f) => f.slice(0, -3)).sort();
if (onlyCard) {
  assert.ok(cardFiles.includes(onlyCard), `looks/${onlyCard}.md does not exist`);
  if (!looks.some((l) => l.slug === onlyCard)) {
    assert.equal(pending.index.length, 1, `${onlyCard} is not in looks/index.md and ${pendingFile ?? 'no --pending file'} has ${pending.index.length} index rows (need exactly 1)`);
    looksDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mpw-look-cards-'));
    for (const f of fs.readdirSync(LOOKS_DIR)) fs.copyFileSync(path.join(LOOKS_DIR, f), path.join(looksDir, f));
    fs.appendFileSync(path.join(looksDir, 'index.md'), `\n${pending.index[0]}\n`);
    looks = loadLooks(looksDir);
  }
} else {
  assert.deepEqual(looks.map((l) => l.slug).sort(), cardFiles, 'looks/index.md rows equal card files');
}
assert.ok(looks.length >= 1);
assert.ok(fs.readFileSync(path.join(LOOKS_DIR, 'LICENSE-Iris.md'), 'utf8').includes('Permission is hereby granted, free of charge'), 'MIT notice is in LICENSE-Iris.md');
const seenNames = new Map();

for (const look of looks) {
  const mine = !onlyCard || look.slug === onlyCard;
  const where = `looks/${look.slug}.md`;
  const text = fs.readFileSync(path.join(LOOKS_DIR, `${look.slug}.md`), 'utf8');
  for (const n of look.names) {
    assert.ok(!seenNames.has(norm(n)), `${where}: name ${n} already belongs to ${seenNames.get(norm(n))}`);
    seenNames.set(norm(n), look.slug);
  }
  if (!mine) continue;
  assert.match(text, /^# .+/, `${where}: title`);
  const secs = sections(text);
  const titles = secs.map((s) => s.title);
  const has = (name) => titles.findIndex((t) => t === name || t.startsWith(`${name} (`));
  const layerIdx = Object.keys(LAYERS).map(has).filter((i) => i >= 0);

  // Required sections exist and come in the card order.
  const order = [...HEAD.map(has), ...layerIdx, ...TAIL.map(has)];
  assert.ok(order.every((i) => i >= 0), `${where}: missing section among ${[...HEAD, ...TAIL].join(', ')}`);
  assert.deepEqual(order, [...order].sort((a, b) => a - b), `${where}: sections out of order`);
  assert.ok(layerIdx.length >= 6, `${where}: only ${layerIdx.length} layer sections`);
  assert.ok(layerIdx.every((i, k) => k === 0 || i > layerIdx[k - 1]) && Object.keys(LAYERS).map(has).filter((i) => i >= 0).length === layerIdx.length, `${where}: layer sections out of order`);
  assert.ok(titles.every((t) => [...HEAD, ...TAIL, ...Object.keys(LAYERS)].some((n) => t === n || t.startsWith(`${n} (`))), `${where}: unknown section in ${titles.join(' | ')}`);

  // Meta table: names equal the index row; the do-not-call words are not names.
  const head = text.split(/^## /m)[0];
  const meta = Object.fromEntries(tableRows(head).map(([k, v]) => [k, v]));
  for (const key of ['부르는 이름', '부르지 않는 말', '문화권', '기본 갈래']) assert.ok(meta[key], `${where}: meta ${key}`);
  assert.deepEqual(list(meta['부르는 이름']), look.names, `${where}: names differ from looks/index.md`);
  assert.deepEqual(list(meta['부르지 않는 말']), look.avoid, `${where}: avoid words differ from looks/index.md`);
  assert.ok(['매체', '장면'].includes(look.axis), `${where}: index axis ${look.axis} must be 매체 or 장면`);
  assert.ok(look.avoid.length >= 1 && look.avoid.every((w) => !look.names.some((n) => norm(n) === norm(w))), `${where}: an avoid word is also a name`);

  // Branches: letters from the table; the default is one of them.
  const branchRows = tableRows(secs[has('갈래 고르기')].body);
  const letters = branchRows.map((r) => r[0].match(/^([A-Z]) /)?.[1]);
  assert.ok(letters.length >= 2 && letters.every(Boolean) && new Set(letters).size === letters.length, `${where}: branch table letters ${letters}`);
  assert.ok(letters.includes(meta['기본 갈래']), `${where}: default branch ${meta['기본 갈래']}`);
  assert.ok(branchRows.every((r) => r.length === 4 && r[1] && r[2]), `${where}: branch rows have 4 cells`);
  const branchOk = (cell) => cell === '전부' || cell.split(/,\s*/).every((x) => letters.includes(x));

  // Fixed facts: medium (first line in backticks) and closer exist.
  const facts = Object.fromEntries(tableRows(secs[has('고정 사실')].body).map(([k, v]) => [k, v]));
  assert.match(facts.medium ?? '', /`A [^`]+`/, `${where}: medium row needs the first line in backticks`);
  assert.match(facts.closer ?? '', /^`[^`]+`$/, `${where}: closer row`);

  // Slots the card turns off or takes over exist in fixed-lines.md.
  for (const [slot] of tableRows(secs[has('끄는 고정 몫')].body)) {
    for (const name of slot.split(/,\s*/)) assert.ok(FIXED_SLOTS.has(name), `${where}: 끄는 고정 몫 slot ${name} is not a fixed-lines slot`);
  }

  // Layer lines: 갈래 | 슬롯 | `토큰 — 영어 문장`, a dictionary token, branches that exist.
  let lines = 0;
  for (const [layer, slug] of Object.entries(LAYERS)) {
    const i = has(layer);
    if (i < 0) continue;
    const rows = tableRows(secs[i].body);
    assert.ok(rows.length >= 2, `${where}: ${layer} has ${rows.length} lines`);
    for (const r of rows) {
      assert.equal(r.length, 3, `${where}: ${layer} row shape ${r[0]}`);
      const [br, slot, cell] = r;
      assert.ok(branchOk(br), `${where}: ${layer} branch ${br}`);
      assert.match(slot, /^[a-z][a-z0-9-]*$/, `${where}: ${layer} slot ${slot}`);
      const m = lineOf(cell);
      assert.ok(m, `${where}: ${layer} line is not 토큰 — 문장: ${cell.slice(0, 40)}`);
      assert.match(m.sentence, /[A-Za-z]{3,}/, `${where}: ${layer} ${m.token} sentence is not English`);
      assert.ok(GENERIC_TOKENS.has(m.token) || inLayer(slug, m.token), `${where}: ${layer} token ${m.token} is not a ${slug}.md token or alias`);
      lines++;
    }
  }
  assert.ok(lines >= 40, `${where}: ${lines} layer lines`);

  // Scene sets: 4 to 6, one branch each, bundles of at least three layer values.
  const sets = tableRows(secs[has('장면 세트')].body);
  assert.ok(sets.length >= 4 && sets.length <= 6, `${where}: ${sets.length} scene sets`);
  for (const [name, br, bundle] of sets) {
    assert.ok(name && letters.includes(br), `${where}: set ${name} branch ${br}`);
    assert.ok(bundle.split(' / ').length >= 3, `${where}: set ${name} has fewer than 3 values`);
  }

  // Pose and Camera pairs: numbered 1..N without gaps, at least 10, both cells are lines with dictionary tokens.
  const pairs = tableRows(secs[has('포즈·구도 쌍')].body);
  assert.deepEqual(pairs.map((r) => Number(r[0])), pairs.map((_, k) => k + 1), `${where}: pair numbers`);
  assert.ok(pairs.length >= 10, `${where}: ${pairs.length} pairs`);
  for (const [n, br, pose, cam] of pairs) {
    assert.ok(branchOk(br), `${where}: pair ${n} branch ${br}`);
    for (const [cell, slug, label] of [[pose, 'pose', 'Pose'], [cam, 'camera', 'Camera']]) {
      const m = lineOf(cell);
      assert.ok(m && /[A-Za-z]{3,}/.test(m.sentence), `${where}: pair ${n} ${label} is not 토큰 — 문장`);
      assert.ok(inLayer(slug, m.token), `${where}: pair ${n} ${label} token ${m.token} is not a ${slug}.md token or alias`);
    }
  }

  // Source section names Iris, MIT and the notice file.
  const src = secs[has('출처')].body;
  assert.ok(/Iris/.test(src) && /MIT/.test(src) && /LICENSE-Iris\.md/.test(src), `${where}: 출처 names Iris, MIT and LICENSE-Iris.md`);

  // Lookup: every name calls this card; no do-not-call word does.
  for (const n of look.names) assert.ok(findLookCards([n], looksDir).some((c) => c.slug === look.slug), `${where}: name ${n} does not call the card`);
  for (const w of look.avoid) assert.ok(!findLookCards([w], looksDir).some((c) => c.slug === look.slug), `${where}: avoid word ${w} calls the card`);
}

// Phrase queries from real requests reach the Wong Kar-wai card, and ordinary queries call no card (shipped cards only).
if (!onlyCard) {
  const WKW = 'wong-kar-wai';
  for (const q of ['90년대 홍콩영화(왕가위 감성)', '왕가위', '港风', '홍콩 영화', '신중식,왕가위', '90s Hong Kong film (Wong Kar-wai vibe)']) {
    assert.ok(findLookCards([q]).some((c) => c.slug === WKW), `query ${q} should call ${WKW}`);
  }
  // Every other card is reached by one Korean and one native-language name inside a sentence.
  const CALLS = {
    'california-golden-hour': ['캘리포니아 골든아워 느낌의 인물 사진', 'California golden hour portrait'],
    'forbidden-city-vermilion-gold': ['고궁 주홍 웜골드 인물', '故宫朱红暖金 人像'],
    'fujifilm-classic-neg': ['후지 클래식 네거티브로 찍은 듯한 스냅', 'Fujifilm Classic Neg street snap'],
    'iphone-native-selfie': ['아이폰 원본 셀카 느낌', 'iPhone native selfie look'],
    'japan-ccd-daylight': ['일본 CCD 감성 스냅', '日系CCD日光 人像'],
    'japan-dv-dreamcore': ['몽핵 캠코더 장면', '古早DV梦核'],
    'japan-provia-astia-film': ['프로비아 슬라이드 필름 인물', 'Fujichrome Astia portrait'],
    'jiangnan-misty-softfocus': ['강남 연우 소프트 포커스 인물', '江南烟雨柔焦'],
    'kodak-gold-200': ['코닥 골드 200으로 찍은 여름 사진', 'Kodak Gold 200 snapshot'],
    'kodak-portra-400-natural-light': ['포트라 400 자연광 인물', '柯达Portra 400 人像'],
    'korea-old-film-light-leak': ['폴라로이드 빛샘 인물', '古早胶片 漏光'],
    'museum-cold-light-minimal': ['현대 미술관 냉광 미니멀 화보', '当代美术馆冷光极简'],
    'neo-chinese-ink': ['신중식 수묵 인물 사진', '新中式水墨影调'],
    'new-york-overcast-cool-grey': ['뉴욕 쿨 그레이 거리 스냅', 'New York overcast cool grey street'],
    'nouvelle-vague-16mm': ['누벨바그 느낌의 파리 스틸', 'Nouvelle Vague'],
    'paris-soft-grey-diffuse': ['파리 소프트 그레이 확산광', 'Lumière grise de Paris'],
    'rainy-night-shinjuku': ['비 오는 신주쿠 밤 인물', '雨夜新宿'],
    'rolleiflex-glass-reflection': ['롤라이플렉스 유리 이중 반사', 'Reflet de vitrine'],
    'seoul-cafe-warm-diffuse': ['서울 카페 웜톤 확산광', '首尔咖啡馆与居家暖调漫射'],
    'seoul-cool-porcelain': ['청랭 도자기 피부 화보', 'Cool porcelain skin portrait'],
    'seoul-night-cinema': ['서울 밤 시네마 택시 장면', 'Seoul night cinema'],
    'south-france-summer-overexposure': ['남프랑스 한여름 과노출 사진', 'Soleil du Midi'],
    'trix-humanist-bw': ['트라이엑스 흑백 인문 사진', 'Tri-X humanist street'],
    'utsurundesu-disposable': ['우츠룬데스 일회용 카메라 사진', '写ルンです'],
    'venice-beach-polaroid-light-leak': ['베니스 비치 폴라로이드 인물', 'Venice Beach Polaroid'],
    'vermeer-window-light': ['베르메르 창가 빛 인물', 'Vermeer window light'],
    'y2k-ccd-flash': ['천희 CCD 직섬 야간 스냅', '千禧CCD直闪'],
  };
  for (const [slug, queries] of Object.entries(CALLS)) {
    assert.ok(looks.some((l) => l.slug === slug), `CALLS lists unknown card ${slug}`);
    for (const q of queries) assert.ok(findLookCards([q]).some((c) => c.slug === slug), `query ${q} should call ${slug}`);
  }
  assert.deepEqual(looks.map((l) => l.slug).filter((s) => s !== WKW && !(s in CALLS)), [], 'every card has a CALLS entry');
  // Latin names match whole words, and a city name alone calls nothing.
  for (const q of ['wkwk', 'twkwt', '홍콩', 'Hong Kong', '홍콩 여행 스냅', '신중식,찻집', '老钱风']) {
    assert.deepEqual(findLookCards([q]).map((c) => c.slug), [], `query ${q} should call no card`);
  }
}
// Dictionary dirs are real directories (guards the constants the CLI uses).
assert.ok(fs.statSync(LEXICON_DIR).isDirectory() && fs.statSync(LOOKS_DIR).isDirectory());
if (looksDir !== LOOKS_DIR) fs.rmSync(looksDir, { recursive: true, force: true });
console.log(`ok test_look_cards (${onlyCard ? `card ${onlyCard}` : `${looks.length} card${looks.length === 1 ? '' : 's'}`})`);
