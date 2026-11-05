#!/usr/bin/env node
// Verify the documentation dispatch and surface boundaries. This does not call
// an image API or make claims about generated image quality.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLES, extractSection, readTargets } from './read_refs.mjs';
import { checkText } from './check_prompt.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const contracts = read('references/image/surface-contracts.md');
const routing = extractSection(read('references/image/model-routing.md'), '4').body;
const defaults = extractSection(read('references/image/surfaces.md'), '0').body;
const api = extractSection(contracts, '4.5').body;

assert.match(defaults, /2026-09-23 사용자 지정/);
assert.match(defaults, /ChatGPT 웹에서 GPT Image 2\.5/);
assert.match(routing, /기본 생성 모델은 `gpt-image-2\.5-sunburst`/);
const explicit26 = routing.indexOf('분기 A-2.');
const fallback25 = routing.indexOf('분기 B.');
assert.ok(explicit26 >= 0 && fallback25 >= 0 && explicit26 < fallback25, 'Explicit 2.6 must precede 2.5 fallbacks');
assert.match(routing, /API 설정은 같은 문서의 2\.5 §4\.3·2\.6 §4\.5/);
assert.match(routing, /기존 워크플로 이행 절차는 .*2\.5 §4\.3·2\.6 §4\.5/);
assert.match(routing, /2\.6 미지정 요청의 기존 기본값도 바꾸지 않는다/);
assert.match(routing, /gpt-image-2\.6-flare/);
assert.match(routing, /gpt-image-2\.6-sunburst/);
assert.match(read('references/image/model-routing.md'), /\[gpt-image-2-6\.md\]\(gpt-image-2-6\.md\)/);
assert.match(read('references/image/gpt-image-2-6.md'), /§4\.5/);

for (const bundle of ['gpt-image-new', 'gpt-image-edit', 'gpt-image-new-structured']) {
  const result = readTargets(BUNDLES[bundle]);
  assert.equal(result.error, undefined, bundle);
  const common = result.text;
  assert.match(common, /GPT Image 2\.5·2\.6/);
  assert.match(common, /2\.6.*§4\.5/);
}
for (const text of ['`complexity`', '`quality`', '`input_fidelity`', '`reasoning.summary`', '`output_format: svg`', '`n: 1`', '`frame_count`', '`frame_duration_ms`', '`markup`', '`mask`', '`prompt_rewriter`']) {
  assert.ok(api.includes(text), `Missing 2.6 contract distinction: ${text}`);
}
assert.match(api, /두 모델 모두 생략 시 `high`/);
assert.match(api, /S1 스키마·웹 UI·Higgsfield에 같은 기능이 있다고 가정하지 않는다/);
assert.match(api, /편집 출력이나 래스터 편집 입력으로 SVG를 쓰지 않는다/);
assert.match(api, /GIF.*편집 출력은 지원하지 않는다/);
assert.match(api, /원본 위에 평탄화하지 않는다/);
assert.match(api, /`mask`·`prompt_rewriter`와 함께 쓰지 않는다/);
assert.match(extractSection(contracts, '5').body, /GPT Image 2\.6 생성은 §4\.5/);

// The S2 additions must not silently alter the legacy S1 wire protocol.
const production = JSON.parse(read('contracts/v1/production-adapter-options.schema.json'));
assert.equal(production.properties.output_format.const, 'png');
assert.deepEqual(production.properties.quality.enum, ['low', 'medium', 'high']);
for (const field of ['complexity', 'markup', 'frame_count', 'frame_duration_ms']) {
  assert.equal(production.properties[field], undefined, `S2 ${field} leaked into S1`);
}

// Representative 2.6 briefs remain model-neutral natural language. Runtime
// settings belong outside the text and are not validated by this prose checker.
for (const prompt of [
  'Recolor only the vase inside the red circle to cobalt blue. Preserve its shape, the stems and the rest of the room. Remove the circle from the finished image.',
  'A green paper bird raises its wings, pauses, then returns to its starting pose. Keep the camera still and make the motion loop smoothly.',
  'Create a flat vector logo: one simple navy sailboat centered on a transparent background.',
]) {
  const result = checkText(prompt, { profile: 'native', surface: 's2', engine: 'gpt-image' });
  assert.equal(result.ok, true, JSON.stringify(result));
}
console.log('GPT Image 2.6 guidance: dispatch, preserved defaults, API boundaries, S1 compatibility, and 3 prose regressions pass');
