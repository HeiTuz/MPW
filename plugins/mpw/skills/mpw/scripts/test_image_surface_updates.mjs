#!/usr/bin/env node
// Documentation/reader regression only. No provider request or image-quality test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { readTargets } from './read_refs.mjs';
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const section = target => {
  const r = readTargets([target]);
  assert.equal(r.error, undefined, target);
  return r.text;
};
let failed = 0;
let passed = 0;
const check = (name, fn) => { try { fn(); passed++; console.log(`PASS ${name}`); } catch(e) { failed++; console.error(`FAIL ${name}: ${e.message}`); } };
check('Grok official authoring source is reachable without new prose defaults', () => {
  const doc = section('references/image/grok-imagine.md');
  assert.doesNotMatch(doc, /별도의 프롬프트 작성 가이드를 두지 않는다/);
  assert.match(doc, /https:\/\/docs\.x\.ai\/developers\/model-capabilities\/images\/prompting-guide/);
  assert.match(doc, /원본 로고·글자 보존/);
  assert.match(doc, /사용자 지정 언어/);
  assert.doesNotMatch(read('references/image/surface-evidence.md'), /공식 프롬프트 작성 가이드 페이지는 없음/);
});
check('Eight-reference request sees distinct direct and wrapper contracts', () => {
  const doc = section('references/image/surface-contracts.md#4.2');
  assert.match(doc, /`grok-imagine-video-1\.5`.*참조 이미지 최대 14장.*15초/);
  assert.match(doc, /`grok-imagine-video`.*참조 이미지 최대 7장.*10초/);
  assert.match(doc, /`grok_video_v15`.*참조 이미지 최대 7장/);
  assert.match(doc, /참조를 임의로 버리거나.*다른 공급자로 전환하지 않는다/);
  assert.match(doc, /<IMAGE_1>/);
  assert.match(doc, /프리셋 음성은 최대 3개/);
});
check('Twenty-frame GIF distinguishes wrapper declaration from direct API limit', () => {
  const direct = section('references/image/surface-contracts.md#4.5');
  const wrapper = section('references/image/surface-contracts.md#4.6');
  assert.match(direct, /`frame_count`는 2–16/);
  assert.doesNotMatch(direct, /2–64/);
  assert.match(wrapper, /`frame_count`는 2–64/);
  assert.match(wrapper, /`gpt_image_2_6`.*`gpt_image_2_6_flare`/);
  assert.match(wrapper, /`complexity`.*`markup`.*노출되지 않/);
  assert.match(wrapper, /실제 생성.*미검증/);
  assert.match(wrapper, /SVG.*참조 이미지.*받지 않/);
  assert.match(wrapper, /`image_references`.*`medias\[\]\.role`.*생성 도구 스키마.*매핑/);
  assert.match(wrapper, /모델 내부 역할명을 호출 enum으로 복사하지 않는다/);
});
check('Actual reader CLI retains separate sections and emits no load errors', () => {
  const r = spawnSync(process.execPath, ['scripts/read_refs.mjs', 'references/image/surface-contracts.md#4.2,4.5,4.6'], {encoding:'utf8'});
  assert.equal(r.status, 0, r.stderr);
  for(const value of ['14장', '2–16', '2–64', 'grok_video_v15']) assert.ok(r.stdout.includes(value), value);
});
check('Explicit 2.6 wrapper entry resolves its canonical section', () => {
  const entry = section('references/image/gpt-image-2-6.md');
  const row = entry.split('\n').find(line => line.startsWith('| Higgsfield의 명시적 2.6 요청 |'));
  assert.ok(row, 'Higgsfield entry row');
  const pointer = row.match(/\[surface-contracts\.md\]\(surface-contracts\.md\) §([\d.]+)/);
  assert.ok(pointer, 'canonical section pointer');
  assert.match(section(`references/image/surface-contracts.md#${pointer[1]}`), /`gpt_image_2_6`.*`gpt_image_2_6_flare`/);
});
check('Defaults, roster date and S1 protocol remain unchanged', () => {
  const routing = read('references/image/model-routing.md');
  assert.match(routing, /기본 생성 모델은 `gpt-image-2\.5-sunburst`/);
  assert.match(routing, /<!-- roster-snapshot: 2026-11-25 -->/);
  assert.match(routing, /2026-11-16.*gpt_image_2_6.*gpt_image_2_6_flare/);
  const schema = JSON.parse(read('contracts/v1/production-adapter-options.schema.json'));
  assert.equal(schema.properties.output_format.const, 'png');
  assert.deepEqual(schema.properties.quality.enum, ['low', 'medium', 'high']);
  for(const field of ['frame_count','markup','complexity']) assert.equal(schema.properties[field], undefined);
});
console.log(`Image surface documentation: ${passed}/${passed+failed} passed; API acceptance and image quality NOT RUN`);
process.exitCode = failed ? 1 : 0;
