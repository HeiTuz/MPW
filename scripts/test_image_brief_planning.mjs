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
const [s1, s2, s3, s4, s5, s6] = ['1', '2', '3', '4', '5', '6'].map(sec);
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
const expectedSections = {
  'gpt-image-new': [s1, s2, s3, s5, s6],
  'gpt-image-new-structured': [s1, s2, s3, s5, s6],
  'gpt-image-portrait': [s1, s2, s3, s5, s6],
  'gpt-image-edit': [s1, s4, s5, s6],
  'gpt-image-edit-structured': [s1, s4, s5, s6],
};
for (const [name, targets] of Object.entries(BUNDLES)) {
  const result = readTargets(targets);
  assert.equal(result.error, undefined, name);
  assert.ok(!result.text.includes(evidence.body), `${name}: observation corpus should not be auto-loaded`);
  if (!name.startsWith('gpt-image')) continue;
  for (const id of ['1', '2', '3', '4', '5', '6']) {
    const wanted = expectedSections[name].includes(sec(id));
    assert.equal(result.text.includes(sec(id)), wanted, `${name}: image-brief §${id} routing`);
  }
  assert.ok(!result.text.includes(legacyPlanning), `${name}: §3.2.2 body must not be bundled`);
  assert.ok(!result.text.includes(legacyNoise), `${name}: §3.2.4 body must not be bundled`);
  sizes[name] = { utf8_bytes: Buffer.byteLength(result.text), codepoints: [...result.text].length };
}

// Every ```text example in image-brief passes the native checker, and the
// examples differ in shape: distinct heading sets, no SHOT/SUBJECT-style
// skeleton, no negative-list labels.
const examples = [...brief.matchAll(/```text\n([\s\S]*?)\n```/g)].map(m => m[1]);
assert.ok(examples.length >= 4, 'image-brief keeps its shape examples');
const headingSets = new Set();
for (const text of examples) {
  const result = checkText(text, { profile: 'native', surface: 's3', engine: 'gpt-image' });
  assert.deepEqual([result.errors.length, result.warnings.length], [0, 0], JSON.stringify(result));
  const heads = [...text.matchAll(/^([A-Z][A-Z ]+):/gm)].map(m => m[1]);
  if (heads.length) headingSets.add(heads.join('|'));
  const skeleton = ['SHOT', 'SUBJECT', 'WARDROBE', 'LIGHT', 'CONSTRAINTS'].filter(h => heads.includes(h));
  assert.ok(skeleton.length < 3, 'example reuses the fixed skeleton');
  assert.doesNotMatch(text, /^(EXCLUDE|NEGATIVE|AVOID)\b/m);
}
assert.equal(headingSets.size, examples.filter(t => /^[A-Z][A-Z ]+:/m.test(t)).length, 'each sectioned example uses a different heading set');

// Review ceilings for reference-loading cost, not output length or API caps.
// Measured after C2 (image-brief routing): new 10364, portrait 19835 after C3,
// edit 12163 UTF-8 bytes (edit still carries surface-contracts §3.3 until C4).
assert.ok(sizes['gpt-image-new'].utf8_bytes <= 10500);
assert.ok(sizes['gpt-image-portrait'].utf8_bytes <= 20000);
assert.ok(sizes['gpt-image-edit'].utf8_bytes <= 12300);

const scenarios = JSON.parse(read('scripts/fixtures/behavioral/image-planning.json')).cases;
assert.deepEqual(scenarios.map(c => c.id), [
  'planning-simple', 'planning-product', 'planning-editorial',
  'planning-exact-copy', 'planning-edit', 'planning-variants', 'planning-references',
]);
for (const item of scenarios) {
  assert.ok(item.request && item.semantic_checks.length >= 2, item.id);
  assert.equal(item.format.kind, 'code_blocks');
  assert.equal(item.format.count, item.id === 'planning-variants' ? 2 : 1);
}
console.log('Image planning guidance and context routing PASS. Seven response scenarios registered, not executed by this test.');
console.log(JSON.stringify(sizes, null, 2));
