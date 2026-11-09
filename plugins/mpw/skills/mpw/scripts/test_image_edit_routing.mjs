#!/usr/bin/env node
// Documentation selection only: no image generation or model-quality claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLES, extractSection, readTargets } from './read_refs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contracts = fs.readFileSync(path.join(root, 'references/image/surface-contracts.md'), 'utf8');
const surfaces = fs.readFileSync(path.join(root, 'references/image/surfaces.md'), 'utf8');
const section = (id) => {
  const result = extractSection(contracts, id);
  assert.equal(result.error, undefined, `Missing section ${id}`);
  return result.body;
};
const web = section('3.2.1');
const generation = section('3.2.2');
const common = section('3.2.3');
const edit = section('3.3');
const whole = section('3.2');
for (const child of [web, generation, common]) assert.ok(whole.includes(child), 'Whole §3.2 retains each child');
for (const phrase of ['웹 프롬프트에 넣지 않는다', '로컬 파일 경로를 첨부 대신 쓰지 않는다', '경계 밖 보존을 보장하지 않는다']) {
  assert.ok(web.includes(phrase), `Missing web/input boundary: ${phrase}`);
}
for (const phrase of ['**사실성과 제약.**', '**눈에 보이는 세부:**', '**참조 역할:**', '**부분 편집:**', '**누적 편집:**', '**정확한 글자:**', '**검수:**', '픽셀 보존 보증이 아니다', '실제 알파 채널', '검수 절차는 수신자가 작업 에이전트이면']) {
  assert.ok(common.includes(phrase), `Missing shared rule: ${phrase}`);
}
assert.match(generation, /구조 선택/);
assert.match(generation, /Create a vertical editorial fashion photo/);
assert.match(generation, /editorial\/portrait-brief\.md/);
assert.match(edit, /§3\.2\.1.*§3\.2\.3/);
const defaults = extractSection(surfaces, '0').body;
assert.match(defaults, /새 생성이면 §3\.2 전체/);
assert.match(defaults, /원본 편집이면 §3\.2\.1.*§3\.2\.3.*§3\.3/);

for (const name of ['gpt-image-edit', 'gpt-image-edit-structured']) {
  const result = readTargets(BUNDLES[name]);
  assert.equal(result.error, undefined, name);
  for (const required of [web, common, edit]) assert.ok(result.text.includes(required), `${name} drops a common/edit section`);
  assert.ok(!result.text.includes(generation), `${name} loads the generation-only section`);
  assert.doesNotMatch(result.text, /Create a vertical editorial fashion photo|\*\*구조 선택 —/);
  assert.equal(result.text.includes(section('3.4')), name.endsWith('-structured'), `${name} purpose-specific routing`);
  const oldRoute = readTargets(['references/image/surfaces.md#0', `references/image/surface-contracts.md#3.2,3.3${name.endsWith('-structured') ? ',3.4' : ''}`]);
  assert.ok([...result.text].length < [...oldRoute.text].length, `${name} must reduce loaded characters`);
}
for (const name of ['gpt-image-new', 'gpt-image-new-structured']) {
  const result = readTargets(BUNDLES[name]);
  assert.equal(result.error, undefined, name);
  assert.ok(result.text.includes(whole), `${name} must retain the full generation contract`);
}
console.log('Image edit routing: common web/input/preservation/text/validation retained; generation-only construction/example excluded; generation bundles remain complete.');
