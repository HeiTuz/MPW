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

assert.match(textFor(...BUNDLES.map), /지정 축 비교·프리셋 조합 또는 명시적 인물·패션 랜덤 요청.*portrait-variations\.md/);
assert.match(textFor(...BUNDLES['gpt-image-portrait']), /지정 축 비교나 프리셋 조합, 명시적 랜덤 요청.*portrait-variations\.md/);
for (const route of ['gpt-image-new', 'gpt-image-portrait', 'gpt-image-edit', 'video']) {
  assert.ok(!BUNDLES[route].some(target => target.startsWith(variationPath)), route);
  assert.doesNotMatch(textFor(...BUNDLES[route]), /# 인물 시리즈의 축별 변주|draw_portrait_options\.mjs/, route);
}

// The edit route only points to the random-request section; it must not load the body.
assert.ok(textFor(...BUNDLES['gpt-image-edit']).includes('editorial/portrait-variations.md'), 'edit route pointer');

const guidance = textFor(variationPath);
for (const heading of ['## 같은 기준에서 비교', '### 조합이 보존 조건과 겹칠 때', '## 명시적 랜덤 요청']) assert.ok(guidance.includes(heading), heading);
for (const link of ['../from-image.md', '../reference-authority-pitfalls.md', '../image-brief.md']) assert.ok(guidance.includes(`](${link})`), link);
// Each example is a layered prompt; the two cuts of a section differ only inside the optics layer.
const exampleCuts = text => [...text.matchAll(/```text\n([\s\S]*?)\n```/g)].map(match => match[1]);
const headingsOf = cut => cut.split('\n').filter(line => /^## /.test(line));
const withoutLayer = (cut, layer) => cut.split(/\n(?=## )/).filter(part => !part.startsWith(`## ${layer}\n`)).join('\n');
const mixed = exampleCuts(textFor(`${variationPath}#다국어 기본 문안`));
const korean = exampleCuts(textFor(`${variationPath}#한국어 지정 문안`));
assert.equal(mixed.length, 2);
assert.equal(korean.length, 2);
for (const [cuts, layer] of [[mixed, 'Optics'], [korean, '광학']]) {
  for (const cut of cuts) {
    assert.ok(headingsOf(cut).length >= 3, 'layered cut has three or more ## layers');
    assert.ok(headingsOf(cut).includes(`## ${layer}`), `${layer} layer present`);
    assert.doesNotMatch(cut, /첨부|참조|앞 컷|\b(?:reference|attached)\b|3:4/i);
  }
  assert.deepEqual(headingsOf(cuts[0]), headingsOf(cuts[1]), 'both cuts use the same layers');
  assert.equal(withoutLayer(cuts[0], layer), withoutLayer(cuts[1], layer), 'only the optics layer differs');
  assert.notEqual(cuts[0], cuts[1], 'the two cuts differ in optics');
}
assert.ok(korean.every(cut => !/[A-Za-z\p{Script=Han}]/u.test(cut)));

for (const path of ['SKILL.md', 'agents/plugin/SKILL.md', 'README.md', 'references/image/surface-contracts.md']) {
  assert.doesNotMatch(read(path), /새 이미지·영상 생성 모델 프롬프트는 영어|새 이미지 프롬프트는 영어 기본|이미지·영상 생성 프롬프트는 영어/, path);
}
console.log('Portrait variations: selective reads, reference boundaries, matching example cuts and multilingual defaults pass. Model behavior NOT RUN.');
