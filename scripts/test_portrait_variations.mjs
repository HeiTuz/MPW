#!/usr/bin/env node
// Checks reference dispatch and authored examples. No model or image calls.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, readTargets } from './read_refs.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const variationPath = 'references/image/editorial/portrait-variations.md';
function textFor(...targets) {
  const result = readTargets(targets);
  assert.equal(result.error, undefined, targets.join(', '));
  return result.text;
}

assert.match(textFor(...BUNDLES.map), /지정한 축의 비교 변주나 프리셋 조합.*portrait-variations\.md/);
assert.match(textFor(...BUNDLES['gpt-image-portrait']), /지정 축을 비교하거나 프리셋을 조합해 달라는 요청.*portrait-variations\.md/);
for (const route of ['gpt-image-new', 'gpt-image-portrait', 'gpt-image-edit', 'video']) {
  assert.ok(!BUNDLES[route].some(target => target.startsWith(variationPath)), route);
  assert.doesNotMatch(textFor(...BUNDLES[route]), /# 인물 시리즈의 축별 변주/, route);
}

const guidance = textFor(variationPath);
assert.match(guidance, /기준 원문 한 편.*§기준 원문과 누적 수정/);
assert.match(guidance, /포즈만 바꿀 때는 프레임을 유지.*색감만 바꿀 때는 조명 방향을 유지/);
assert.match(guidance, /여러 축이나 조합을 명시했다면 요청한 짝과 순서/);
assert.match(guidance, /참조가 없으면 같은 인물 \*\*설정\*\*.*실제 얼굴의 동일성을 가정하지 않는다/);
assert.match(guidance, /고정 재킷을 보존.*소재 변경 자체가 필수라면 충돌하는 조건을 확인/);

const exampleCuts = text => [...text.matchAll(/```text\n([^\n]+)\n```/g)].map(match => match[1]);
const mixed = exampleCuts(textFor(`${variationPath}#다국어 기본 문안`));
const korean = exampleCuts(textFor(`${variationPath}#한국어 지정 문안`));
assert.equal(mixed.length, 2);
assert.equal(korean.length, 2);
for (const cut of [...mixed, ...korean]) {
  assert.equal(cut.split('. ')[0], mixed[0].split('. ')[0], 'the subject, crop, wardrobe and setting stay constant');
  assert.doesNotMatch(cut, /첨부|참조|앞 컷|\b(?:reference|attached)\b|3:4/i);
}
assert.match(mixed[0], /부드러운 overcast window light로 그림자가 서서히 옅어지고 색감은 차분하다/);
assert.match(korean[0], /흐린 날.*창가 빛.*색감은 차분/);
assert.match(mixed[1], /소형 디지털카메라의 direct flash로 그림자 경계가 또렷하고 대비가 강하다/);
assert.match(korean[1], /소형 디지털카메라의 직광 플래시로 그림자 경계가 또렷하고 대비가 강하다/);
assert.ok(korean.every(cut => !/[A-Za-z\p{Script=Han}]/u.test(cut)));

const language = textFor('references/templates/common.md#프롬프트 언어 결정');
assert.match(language, /영어·한국어·일본어·중국어.*한 문안에 조합한다.*바탕 언어도 장면에 맞춘다/);
assert.match(language, /서로 다른 시각 정보.*같은 뜻의 병기·반복과 언어 수 맞추기는 생략/);
assert.match(language, /명시 언어·형식, 원문과 정확 카피, 확인된 수신 엔진 제약.*우선/);
assert.match(language, /부분 수정은 지정된 표현만 고친다/);
assert.match(language, /새 영상 생성 모델에 직접 넣는 프롬프트는 영어가 기본/);
assert.match(language, /`촉촉피부`.*`木漏れ日`.*`留白`.*`direct flash`.*장면에 필요한 표현만/);
for (const path of ['SKILL.md', 'agents/plugin/SKILL.md', 'README.md', 'references/image/surface-contracts.md']) {
  assert.doesNotMatch(read(path), /새 이미지·영상 생성 모델 프롬프트는 영어|새 이미지 프롬프트는 영어 기본|이미지·영상 생성 프롬프트는 영어/, path);
}
console.log('Portrait variations: selective reads, reference boundaries, matching example cuts and multilingual defaults pass. Model behavior NOT RUN.');
