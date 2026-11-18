#!/usr/bin/env node
// Reference dispatch and handoff contracts only. No image API calls.
import assert from 'node:assert/strict';
import { BUNDLES, readTargets } from './read_refs.mjs';

function textFor(target) {
  const result = readTargets([target]);
  assert.equal(result.error, undefined, target);
  return result.text;
}

const routing = textFor('references/image/model-routing.md#6');
assert.match(routing, /\[seedream-5-pro\.md\]\(seedream-5-pro\.md\)/);
assert.match(routing, /\[seedream-5-5\.md\]\(seedream-5-5\.md\).*5\.5 지정 시에만/);
for (const bundle of ['gpt-image-new', 'gpt-image-edit']) {
  assert.doesNotMatch(readTargets(BUNDLES[bundle]).text, /dola-seedream-5-5|Seedream 5\.5 — 생성/);
}

const editing = textFor('references/image/seedream-5-5.md#원본 편집');
assert.match(editing, /이어 편집을 요청받았을 때만 직전 결과를 다음 입력으로/);
assert.match(editing, /원본별 1회 편집.*생성 결과 재사용 금지.*조건이 우선/);
assert.match(editing, /각 원본을 독립적으로 편집/);
assert.match(editing, /대조하기 전 픽셀·색·형상 보존을 확정하지 않는다/);

const api = textFor('references/image/surface-contracts.md#4.7');
assert.match(api, /BytePlus 글로벌은 `dola-seedream-5-5-261028`, Volcengine 중국 Ark는 `doubao-seedream-5-5-261028`/);
assert.match(api, /래퍼는 실제 모델 ID와 필드를 확인/);
assert.match(api, /다중 참조는 최대 10장/);
assert.match(api, /background: transparent.*output_format: png.*입력에 알파 채널이 없어도/);
assert.match(api, /한 장을 입력.*layer_decomposition: true.*max_images.*바탕 한 장을 포함한 출력 상한 2–100\(기본 30\)/);
assert.match(api, /`background`는 생략.*`output_format`은 바탕에만.*레이어는 PNG/);
assert.match(api, /layer_decomposition_options\.text_recognition: true.*data\[\]\.text_recognition.*근사 스타일/);
assert.doesNotMatch(textFor('references/image/surface-contracts.md#1'), /seedream-5-5|layer_decomposition/);

const evidence = textFor('references/image/surface-evidence.md#7');
assert.match(evidence, /Seedream 5\.5 예시·직접 API.*BytePlus 글로벌 가이드.*Volcengine 중국 Ark 가이드.*Lark 프롬프트 가이드.*실제 생성 결과는 미확인/);
console.log('Seedream 5.5 guidance: explicit dispatch, original-only editing, model IDs, RGBA, layer and OCR boundaries pass; live generation NOT RUN');
