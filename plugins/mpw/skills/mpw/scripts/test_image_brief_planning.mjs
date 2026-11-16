#!/usr/bin/env node
// Static guidance/routing regression. Scenario response quality and image
// quality need separate runs; bytes below are not model token measurements.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, extractSection, readTargets } from './read_refs.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const contracts = read('references/image/surface-contracts.md');
const planning = extractSection(contracts, '3.2.2').body;
for (const rule of [
  '무엇이 읽혀야 하는지', '맡겨진 축에서만',
  '어느 대상의 어디에서 무엇이 보이는지',
  '서로 떨어뜨리면 관계가 흐려지는 조건은 한 구획에',
  '독립적으로 수정할 조건만 나눈다',
  '단순 장면은 짧은 보존·배제 조건이 있어도 한 문단',
  '사용자 헤딩·순서·정보 배치',
  '부분 수정이나 원문 보존 요청에는 이 창작 기본값을 적용하지 않는다',
  '특정 어휘의 생성 효과 검증이 아니다',
]) assert.ok(planning.includes(rule), `Missing planning boundary: ${rule}`);
assert.doesNotMatch(planning, /다음 중 하나라도 있으면/);
assert.match(planning, /선택 예시이며 기본 헤딩 세트가 아니다/);
assert.match(planning, /observed-examples\.md#공개-라이브러리의-기획-패턴/);
assert.match(extractSection(read('references/image/surfaces.md'), '0-2').body,
  /기획·구획 선택은 .*§3\.2\.2/);

const evidence = extractSection(read('references/image/observed-examples.md'), '공개 라이브러리의 기획 패턴');
assert.equal(evidence.error, undefined);
assert.match(evidence.body, /185건.*이미지 156건, 영상 29건, 중복쌍 1개/s);
assert.match(evidence.body, /ChatGPT 표기는 5건뿐/);
assert.match(evidence.body, /의미를 정독하거나 결과 이미지를 대조한 평가는 아니다/);
assert.match(evidence.body, /원문 프롬프트·이미지 모음은 재배포하지 않는다/);

const sizes = {};
for (const [name, targets] of Object.entries(BUNDLES)) {
  const result = readTargets(targets);
  assert.equal(result.error, undefined, name);
  const isNewImage = ['gpt-image-new', 'gpt-image-new-structured', 'gpt-image-portrait'].includes(name);
  assert.equal(result.text.includes(planning), isNewImage, `${name}: planning routing changed`);
  assert.ok(!result.text.includes(evidence.body), `${name}: observation corpus should not be auto-loaded`);
  if (isNewImage || name.startsWith('gpt-image-edit')) {
    sizes[name] = { utf8_bytes: Buffer.byteLength(result.text), codepoints: [...result.text].length };
  }
}
// Review ceilings for reference-loading cost, not output length or API caps.
// Baseline 3.4.5: new 23353, portrait 35733, edit 13415 UTF-8 bytes.
assert.ok(sizes['gpt-image-new'].utf8_bytes <= 24000);
assert.ok(sizes['gpt-image-portrait'].utf8_bytes <= 36500);
assert.ok(sizes['gpt-image-edit'].utf8_bytes <= 14000);

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
