#!/usr/bin/env node
// Static guidance/routing regression. Scenario response quality and image
// quality need separate runs; bytes below are not model token measurements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkText } from './check_prompt.mjs';
import { BUNDLES, extractSection, readTargets } from './read_refs.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const contracts = read('references/image/surface-contracts.md');
const brief = read('references/image/image-brief.md');
const sec = id => {
  const r = extractSection(brief, id);
  assert.equal(r.error, undefined, `image-brief §${id}`);
  return r.body;
};
const ids = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
const [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10] = ids.map(sec);
const legacyPlanning = extractSection(contracts, '3.2.2').body;
const legacyNoise = extractSection(contracts, '3.2.4').body;
const surfaceDefaults = extractSection(read('references/image/surfaces.md'), '0').body;
assert.match(extractSection(read('references/image/surfaces.md'), '0-2').body, /image-brief\.md/);
assert.match(surfaceDefaults, /image-brief\.md/);

const evidence = extractSection(read('references/image/observed-examples.md'), '공개 라이브러리의 기획 패턴');
assert.equal(evidence.error, undefined);
assert.match(evidence.body, /185건.*이미지 156건, 영상 29건, 중복쌍 1개/s);
assert.match(evidence.body, /ChatGPT 표기는 5건뿐/);
assert.match(evidence.body, /의미를 정독하거나 결과 이미지를 대조한 평가는 아니다/);
assert.match(evidence.body, /원문 프롬프트·이미지 모음은 재배포하지 않는다/);

const sizes = {};
// §10 is read by part: 10.0 (how to read the examples) with 10.1 (person examples, portrait bundle) or 10.2 (no-person examples, new bundles).
const generation = [s1, s2, s3, s4, s5, s6, s7, s9];
const [s10read, s10person, s10scene] = ['10.0', '10.1', '10.2'].map(sec);
const s4cards = sec('룩 카드');
const s4parts = ['사용자가 준 것', '토큰 찾기', '비워 둔 층', '쓰기 전에 슬롯 표를 정한다', '문장 쓰는 법'].map(sec);
const expectedExamples = {
  'gpt-image-new': [s10read, s10scene],
  'gpt-image-new-structured': [s10read, s10scene],
  'gpt-image-portrait': [s10read, s10person],
};
const expectedSections = {
  'gpt-image-new': generation,
  'gpt-image-new-structured': generation,
  'gpt-image-portrait': generation,
  'gpt-image-extract': [s1, s2, s3, s5, s6, s9],
  // The edit routes read section 2.1 (where and how much original-language text) without the 2.2 wrong/right table.
  'gpt-image-edit': [s1, s6, s7, s8, s9],
  'gpt-image-edit-structured': [s1, s6, s7, s8, s9],
};
const s2place = sec('2.1');
for (const [name, targets] of Object.entries(BUNDLES)) {
  const result = readTargets(targets);
  assert.equal(result.error, undefined, name);
  assert.ok(!result.text.includes(evidence.body), `${name}: observation corpus should not be auto-loaded`);
  if (!name.startsWith('gpt-image')) continue;
  for (const id of ids) {
    const wanted = expectedSections[name].includes(sec(id));
    assert.equal(result.text.includes(sec(id)), wanted, `${name}: image-brief §${id} routing`);
  }
  assert.equal(result.text.includes(s2place), true, `${name}: image-brief §2.1 routing`);
  for (const part of [s10read, s10person, s10scene]) {
    assert.equal(result.text.includes(part), (expectedExamples[name] ?? []).includes(part), `${name}: image-brief §10 part routing`);
  }
  // The extraction bundle reads §4 by subsection without '룩 카드' (§12.0 carries its own card steps); the other §4 readers get it whole.
  if (expectedSections[name].includes(s4) || name === 'gpt-image-extract') {
    for (const part of s4parts) assert.ok(result.text.includes(part), `${name}: image-brief §4 subsection routing`);
    assert.equal(result.text.includes(s4cards), name !== 'gpt-image-extract', `${name}: image-brief §4 '룩 카드' routing`);
  }
  assert.ok(!result.text.includes(legacyPlanning), `${name}: §3.2.2 body must not be bundled`);
  assert.ok(!result.text.includes(legacyNoise), `${name}: §3.2.4 body must not be bundled`);
  sizes[name] = { utf8_bytes: Buffer.byteLength(result.text), codepoints: [...result.text].length };
}

// Structure only (prose is not pinned): every ```text example in image-brief is a
// layered prompt that passes the native checker at the default S3 channel limit.
const examples = [...brief.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
assert.ok(examples.length >= 5, 'image-brief keeps its layered examples');
// The section 12 example is the photo-extraction walk-through; it uses the full person layer set on purpose.
const extractExample = sec('12').match(/```text\n([\s\S]*?)\n```/)?.[1];
assert.ok(extractExample && examples.includes(extractExample), 'section 12 keeps its extraction example');
const headingSets = new Set();
for (const text of examples) {
  const lines = text.split('\n');
  assert.ok(!/^## /.test(lines[0]), 'first line is a one-sentence opener, not a heading');
  const heads = lines.filter(line => /^## .+$/.test(line)).map(line => line.slice(3));
  assert.ok(heads.length >= (/^Edit the attached/.test(text) ? 2 : 3), `example needs more layers: ${heads.join('|')}`);
  let inIdentity = false;
  for (const line of lines.slice(1)) {
    if (/^## /.test(line)) { inIdentity = line === '## Identity Reference'; continue; }
    if (line.trim() === '' || inIdentity) continue;
    assert.match(line, / — /, `layer line is token — sentence: ${line.slice(0, 60)}`);
  }
  assert.ok(!heads.some(h => /^(Negative|Avoid|Exclude|Constraints|Quality|Details)$/i.test(h)), 'no catch-all layer names');
  const key = heads.join('|');
  if (text !== extractExample) {
    assert.ok(!headingSets.has(key), 'examples use different layer sets');
    headingSets.add(key);
  }
  const result = checkText(text, { profile: 'native', surface: 's3', engine: 'gpt-image' });
  assert.deepEqual([result.errors.length, result.warnings.length], [0, 0], JSON.stringify(result));
  assert.ok(!/^The person in the attached image\b/.test(lines[0]), 'first line names the photo, not an identity anchor');
  assert.ok(!heads.includes('Person'), 'no Person layer');
  if (text.includes('## Identity Reference')) {
    assert.equal(heads[0], 'Identity Reference', 'Identity Reference is the first layer');
    assert.ok(heads.includes('Hair and makeup') && heads.includes('Expression'), 'identity keeps hair/makeup and expression layers');
  }
}
assert.ok(examples.some(t => t.includes('## Identity Reference')), 'a person example shows the identity section');
// Photo extraction example (structure, not prose): the first line opens with a medium name from the section 12.0 table, most
// token lines are native-language names, no token is a slot name, and the whole thing passes the native checker.
{
  const media = [...sec('12').matchAll(/^\| [^|\n]+ \| [^|\n]+ \| `(An? [^`]+)` \|(?: [^|\n]+ \|)?$/gm)].map(m => m[1].trim());
  assert.ok(media.length >= 8, `12.0 medium table rows: ${media.length}`);
  // §12.0 step 3: a called look card's first-line phrase wins over the table name, so a card's `medium` row also counts.
  const cardOpenings = fs.readdirSync(new URL('../references/image/looks/', import.meta.url)).filter(f => f.endsWith('.md') && f !== 'index.md')
    .flatMap(f => (read(`references/image/looks/${f}`).match(/^\| medium \| .*$/gm) || []).flatMap(row => [...row.matchAll(/`(An? [^`]+)`/g)].map(m => m[1].trim())));
  assert.ok([...media.filter(name => !name.includes('<')), ...cardOpenings].some(name => extractExample.startsWith(name)), 'extraction example opens with a 12.0 medium name or a look card first line');
  const layerLines = extractExample.split('\n').filter(line => / — /.test(line));
  const tokens = layerLines.map(line => line.split(' — ')[0]);
  const native = tokens.filter(token => /[^\x00-\x7f]/.test(token)).length;
  assert.ok(native / tokens.length >= 0.5, `native-language tokens ${native}/${tokens.length}`);
  const named = checkText(extractExample, { profile: 'native', surface: 's3', engine: 'gpt-image' });
  assert.ok(![...named.errors, ...named.warnings].some(item => item.code === 'token/slot-name'), 'extraction example uses no slot-name token');
  assert.ok(/^## Finish$/m.test(extractExample), 'extraction example ends with Finish');
  const extractText = readTargets(BUNDLES['gpt-image-extract']).text;
  assert.ok(!extractText.includes('# 룩 카드 색인') && extractText.includes('# 고정 몫'), 'extraction bundle carries fixed-lines.md and leaves the look-card index to read_look.mjs --list');
}
// Routing only: the photo-extraction bundle carries §12 and no other bundle does.
const s12 = sec('12');
for (const [name, targets] of Object.entries(BUNDLES)) {
  assert.equal(readTargets(targets).text.includes(s12), name === 'gpt-image-extract', `${name}: image-brief §12 routing`);
}

// Lexicon: per-layer tables (references/image/lexicon/*.md), one row per token, plus the small index.
const LAYER_FILES = {
  Optics: 'optics', Light: 'light', Pose: 'pose', Outfit: 'outfit', Legwear: 'legwear', Style: 'style',
  'Hair and makeup': 'hair-makeup', Expression: 'expression', 'Props and nails': 'props-nails', Scene: 'scene', Camera: 'camera',
};
const splitRow = line => line.replace(/^\| | \|$/g, '').split(/(?<!\\) \| /);
const index = read('references/image/layer-lexicon.md');
assert.ok(Buffer.byteLength(index) <= 12000, `lexicon index is ${Buffer.byteLength(index)} bytes`);
const lexiconRows = {};
for (const [layer, slug] of Object.entries(LAYER_FILES)) {
  const text = read(`references/image/lexicon/${slug}.md`);
  const seen = new Set();
  lexiconRows[layer] = [];
  let section = null;
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) { section = line.slice(3).trim(); assert.ok(['KR', 'CN', 'JP', 'US', 'FR'].includes(section), `${slug}: culture section ${section}`); continue; }
    if (!/^\| /.test(line) || /^\| (토큰|---)/.test(line)) continue;
    assert.ok(section, `${slug}: row before a culture section`);
    const cells = splitRow(line);
    assert.equal(cells.length, 6, `${slug}: 6 columns in ${line.slice(0, 40)}`);
    const [token, , culture, , looks, kind] = cells;
    assert.ok(token && !/[.。?？]$/.test(token), `${slug}: token ${token}`);
    assert.ok(culture.split(', ').every(c => ['KR', 'CN', 'JP', 'US', 'FR'].includes(c)) && culture.split(', ').includes(section), `${slug}: culture ${culture} in ${section}`);
    assert.ok(looks.length >= 12, `${slug}: looks column for ${token}`);
    assert.match(kind, /^(look|place|item|gear|brand|person-style)$/, `${slug}: kind for ${token}`);
    assert.ok(!seen.has(token.toLowerCase()), `${slug}: duplicate token ${token}`);
    seen.add(token.toLowerCase());
    lexiconRows[layer].push(token);
  }
  assert.ok(lexiconRows[layer].length >= (slug === 'camera' ? 20 : 50), `${slug}: ${lexiconRows[layer].length} rows`);
}
// The index counts and representative tokens must match the tables.
for (const [layer, slug] of Object.entries(LAYER_FILES)) {
  assert.ok(new RegExp(`\\| ${layer} \\| \\[lexicon/${slug}\\.md\\]\\(lexicon/${slug}\\.md\\) \\| ${lexiconRows[layer].length} \\|`).test(index), `index row count for ${layer}`);
  const part = index.split(`### ${layer}\n`)[1]?.split('\n###')[0] ?? '';
  const featured = part.split('\n').filter(l => l.includes(' — ')).map(l => l.split(' — ')[0]);
  assert.ok(featured.length >= 10, `index featured tokens for ${layer}`);
  for (const token of featured) assert.ok(lexiconRows[layer].includes(token), `index token ${token} is in ${slug}.md`);
}

// Review ceilings for reference-loading cost, not output length or API caps.
// Measured after the full lexicon merge: new 51655, portrait 58261, edit 18996 UTF-8 bytes;
// ceilings are about 10% above the measurement. Raised for 4.0.5 (new 56992 measured) after the
// photo extraction and token-fit rules grew sections 2-6. Raised again with fixed-lines.md and the
// Finish layer (new, portrait and extract grew by the file itself; the edit route grew about 500 bytes through sections 1, 6 and 9).
// Raised again with the look-card procedure (image-brief section 4), the Camera lexicon layer and the card lines in fixed-lines.md (new 81139, portrait 88028 measured).
// Raised again for photo extraction (step 4): fixed-lines.md gained the two extraction columns, the closer note and the Korean Finish form
// (new 82733, portrait 89622 measured); the extraction bundle now carries image-brief section 12 in full and the look-card index (93598 measured).
// Raised again (step 5b) for the Finish culture table, the realism replacement line and the cool-light blush line in fixed-lines.md plus the card-pair rule in image-brief section 4
// (new 85545, portrait 92434, extract 117544 measured). The ceilings are about 1.7% above the measurement.
// Raised again for the extraction bundle only: looks/index.md carries 28 card rows (22503 bytes, was 1 row) and the bundle measured 114072; the other bundles do not include the index.
// Raised again (step 7a) for the single value order, the scene-set rule, the candidate-card rule, the two-card split, the Korean Finish form, the no-cue makeup rule
// and the card-summary column in looks/index.md (new 93260, portrait 100321, edit 20934, extract 129204 measured; image-other-engine 111707 has no ceiling). The ceilings are about 1.7% above the measurement.
// Raised once more for the extraction bundle (step 7b): image-brief section 12.9 is now the card-fitted example with the longer card paragraph (extract 131111 measured, ceiling about 1.7% above).
// Raised once more for the extraction bundle (step 7c): the 28 card rows in looks/index.md carry the longer do-not-call word lists the card workers wrote (index 32962 bytes, was 26356; extract 138002 measured, ceiling about 1.7% above).
// Raised once more (step 8a, review fixes): the slot-table procedure with its worked table, the lens-source rule, the scene-set and branch rules, the two-card rules, the Korean 8K line and the
// Hair/Makeup split in image-brief sections 3-4 and fixed-lines.md (new 100912, portrait 107973, extract 145836 measured; edit 21012 stays under its own ceiling). The ceilings are about 1.7% above the measurement.
// Lowered (step 9) after rules written out in two places were cut to one place plus a pointer, and looks/index.md lost its name columns
// (the card head tables already held them; find_tokens reads them there): new 95371, portrait 102299, edit 20300, extract 117066 measured, ceilings about 2.5% above.
// Raised (second GPT Pro review): the slot-prefix, gaze-slot, scene-set place/prop, set-and-pair, first-line medium, framing and square variants, fine-grain realism, glass side, Legwear socks
// and card-format rules in image-brief.md and fixed-lines.md (new 98026, portrait 104954, edit 20377, extract 119731 measured, ceilings about 2.5% above).
// Raised (step 12a, second retest): the minor-only student rule, the male proportion line, the per-culture liner/grain/face-light/lens tokens, the two-step card read, the set tie-break,
// the pair-borrowing order and the Optics/Light line cap (new 104138, portrait 111066, edit 20536, extract 126048 measured, ceilings about 2.5% above).
// Lowered (step 13) after the step 12a rules were cut where one decision stood in two places or a paragraph restated what the script prints
// (new 102540, portrait 109468, edit 20501, extract 124450 measured, ceilings about 2% above).
// Lowered (step 14) after the request-wins rules replaced overlapping card sentences and the card-authoring paragraph moved to looks/index.md
// (new 102083, portrait 109011, edit 20303, extract 124463 measured, ceilings about 2% above).
// Lowered (token stage 1) with no rule text changed: bundles read layer-lexicon.md by 사용법 and 문화권 룩 묶음 only, fixed-lines.md ends with the 한국어 문안 section that no bundle reads by default,
// the extraction bundle skips fixed-lines Camera, and image-brief section 10 is read by part (new 81289, portrait 94914, edit 20303, extract 112588 measured, ceilings about 2% above).
// Token stage 2: the extraction bundle reads image-brief section 4 without its '룩 카드' subsection and no longer carries looks/index.md (section 12.0 now holds the extraction card steps
// and points at read_look.mjs --list), and every layer-lexicon reader gets back the 층별 파일 table that 사용법 1 points at (new 82424, portrait 96049, edit 20303, extract 94388 measured, ceilings about 2% above).
// Token stage 4: section 12.0 asks yes/no questions before a card is used (medium marks column, light, place for scene cards) and overlapping section 12 sentences were cut to pay for it
// (new 82855, portrait 96480, edit 20303, extract 94570 measured; ceilings unchanged, about 2% above).
// Raised (mix-language): image-brief section 2 rewritten as 2.1 (where original-language words go and how many) and 2.2 (wrong/right lines), and fixed-lines.md
// gained one culture-choice paragraph and the sentence-word tables (photo terms, texture words, expression phrases); the edit routes read 2.1 only. Overlapping sentences
// in section 2, section 12.2 and fixed-lines.md were cut first (new 87870, portrait 101373, edit 20799, extract 99566 measured, ceilings about 2% above).
// Lowered (mix-language polish): section 2.2's two wrong/right rows were folded into rules 3 and the frame sentence of 2.1, sentences that said one decision twice
// (2.1 table and rule 2, the token search and rule 2, the slot table and rules 2-3, 9-5, 12.2) and the per-culture variants of the grain and lens lines (now the
// sentence-word columns) were cut (new 87038, portrait 100543, edit 20602, extract 98507 measured, ceilings about 2% above).
assert.ok(sizes['gpt-image-new'].utf8_bytes <= 88800, `gpt-image-new is ${sizes['gpt-image-new'].utf8_bytes} bytes`);
assert.ok(sizes['gpt-image-portrait'].utf8_bytes <= 102600, `gpt-image-portrait is ${sizes['gpt-image-portrait'].utf8_bytes} bytes`);
// Raised (mix quantity): section 1 and 2.1 rule 4 now say the shrink order and the original-language compression, and 9-10 checks it (edit 21280, extract 101008 measured; ceilings just above, the count cap they replace is gone).
assert.ok(sizes['gpt-image-edit'].utf8_bytes <= 21400, `gpt-image-edit is ${sizes['gpt-image-edit'].utf8_bytes} bytes`);
assert.ok(sizes['gpt-image-extract'].utf8_bytes <= 101100, `gpt-image-extract is ${sizes['gpt-image-extract'].utf8_bytes} bytes`);
// Engine-levers section 8 (one worked example per engine) is read for the target engine only, so the two engine bundles stay without it (other-engine 118005, conversion 43779 measured, ceilings about 2% above).
for (const [name, ceiling] of [['image-other-engine', 120400], ['image-prompt-conversion', 44700]]) {
  const bytes = Buffer.byteLength(readTargets(BUNDLES[name]).text);
  assert.ok(bytes <= ceiling, `${name} is ${bytes} bytes`);
}

const scenarios = JSON.parse(read('scripts/fixtures/behavioral/image-planning.json')).cases;
assert.deepEqual(scenarios.map(c => c.id), [
  'planning-simple', 'planning-product', 'planning-editorial',
  'planning-exact-copy', 'planning-edit', 'planning-variants', 'planning-references',
  'planning-identity', 'planning-layer-followup',
]);
for (const item of scenarios) {
  assert.ok(item.request && item.semantic_checks.length >= 2, item.id);
  assert.equal(item.format.kind, 'code_blocks');
  assert.equal(item.format.count, item.id === 'planning-variants' ? 2 : 1);
}
console.log('Image planning guidance and context routing PASS. Nine response scenarios registered, not executed by this test.');
console.log(JSON.stringify(sizes, null, 2));
