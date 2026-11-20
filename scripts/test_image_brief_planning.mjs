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
const generation = [s1, s2, s3, s4, s5, s6, s7, s9, s10];
const expectedSections = {
  'gpt-image-new': generation,
  'gpt-image-new-structured': generation,
  'gpt-image-portrait': generation,
  'gpt-image-extract': [s1, s2, s3, s4, s5, s6, s9],
  'gpt-image-edit': [s1, s2, s6, s7, s8, s9],
  'gpt-image-edit-structured': [s1, s2, s6, s7, s8, s9],
};
for (const [name, targets] of Object.entries(BUNDLES)) {
  const result = readTargets(targets);
  assert.equal(result.error, undefined, name);
  assert.ok(!result.text.includes(evidence.body), `${name}: observation corpus should not be auto-loaded`);
  if (!name.startsWith('gpt-image')) continue;
  for (const id of ids) {
    const wanted = expectedSections[name].includes(sec(id));
    assert.equal(result.text.includes(sec(id)), wanted, `${name}: image-brief §${id} routing`);
  }
  assert.ok(!result.text.includes(legacyPlanning), `${name}: §3.2.2 body must not be bundled`);
  assert.ok(!result.text.includes(legacyNoise), `${name}: §3.2.4 body must not be bundled`);
  sizes[name] = { utf8_bytes: Buffer.byteLength(result.text), codepoints: [...result.text].length };
}

// Structure only (prose is not pinned): every ```text example in image-brief is a
// layered prompt that passes the native checker at the default S3 channel limit.
const examples = [...brief.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
assert.ok(examples.length >= 5, 'image-brief keeps its layered examples');
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
  assert.ok(!headingSets.has(key), 'examples use different layer sets');
  headingSets.add(key);
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
// Routing only: the photo-extraction bundle carries §12 and no other bundle does.
const s12 = sec('12');
for (const [name, targets] of Object.entries(BUNDLES)) {
  assert.equal(readTargets(targets).text.includes(s12), name === 'gpt-image-extract', `${name}: image-brief §12 routing`);
}

// Lexicon: per-layer tables (references/image/lexicon/*.md), one row per token, plus the small index.
const LAYER_FILES = {
  Optics: 'optics', Light: 'light', Pose: 'pose', Outfit: 'outfit', Legwear: 'legwear', Style: 'style',
  'Hair and makeup': 'hair-makeup', Expression: 'expression', 'Props and nails': 'props-nails', Scene: 'scene',
};
const splitRow = line => line.replace(/^\| | \|$/g, '').split(/(?<!\\) \| /);
const index = read('references/image/layer-lexicon.md');
assert.ok(Buffer.byteLength(index) <= 10340, `lexicon index is ${Buffer.byteLength(index)} bytes`);
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
  assert.ok(lexiconRows[layer].length >= 50, `${slug}: ${lexiconRows[layer].length} rows`);
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
// photo extraction and token-fit rules grew sections 2-6.
assert.ok(sizes['gpt-image-new'].utf8_bytes <= 60000);
assert.ok(sizes['gpt-image-portrait'].utf8_bytes <= 67000);
assert.ok(sizes['gpt-image-edit'].utf8_bytes <= 20900);

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
