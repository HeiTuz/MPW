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
const common = section('3.2.3');
const generation = section('3.2.2');
const edit = section('3.3');
const whole = section('3.2');
for (const child of [web, common]) assert.ok(whole.includes(child), 'Whole §3.2 retains each child');
for (const phrase of ['웹 프롬프트에 넣지 않는다', '로컬 파일 경로를 첨부 대신 쓰지 않는다', '경계 밖 보존을 보장하지 않는다']) {
  assert.ok(web.includes(phrase), `Missing web/input boundary: ${phrase}`);
}
for (const phrase of ['**사실성과 제약.**', '**눈에 보이는 세부:**', '**정확한 글자:**', '**검수:**', '픽셀 보존 보증이 아니다', '실제 알파 채널', '검수 절차는 수신자가 작업 에이전트이면']) {
  assert.ok(common.includes(phrase), `Missing shared rule: ${phrase}`);
}
assert.match(edit, /§3\.2\.1.*§3\.2\.3/);
assert.match(edit, /image-brief\.md/, '§3.3 points to the edit writing rules');
assert.match(common, /image-brief\.md/, '§3.2.3 points to the reference/edit rules');
assert.ok(!edit.includes('EXCLUDE:'), '§3.3 keeps no EXCLUDE example');
const defaults = extractSection(surfaces, '0').body;
assert.match(defaults, /image-brief\.md/, 'surfaces §0 links to image-brief.md');

const briefText = fs.readFileSync(path.join(root, 'references/image/image-brief.md'), 'utf8');
const brief = (id) => {
  const result = extractSection(briefText, id);
  assert.equal(result.error, undefined, `Missing image-brief §${id}`);
  return result.body;
};
for (const name of ['gpt-image-edit', 'gpt-image-edit-structured']) {
  const result = readTargets(BUNDLES[name]);
  assert.equal(result.error, undefined, name);
  for (const required of [brief('1'), brief('8'), edit]) assert.ok(result.text.includes(required), `${name} drops a common/edit section`);
  for (const absent of [brief('3'), brief('4'), brief('10'), generation]) assert.ok(!result.text.includes(absent), `${name} loads a generation-only section`);
  assert.doesNotMatch(result.text, /Create a vertical editorial fashion photo|\*\*구조 선택 —/);
  assert.equal(result.text.includes(section('3.4')), name.endsWith('-structured'), `${name} purpose-specific routing`);
}
for (const name of ['gpt-image-new', 'gpt-image-new-structured']) {
  const result = readTargets(BUNDLES[name]);
  assert.equal(result.error, undefined, name);
  for (const required of [brief('3'), brief('토큰 찾기'), brief('문장 쓰는 법')]) assert.ok(result.text.includes(required), `${name} drops a generation section`);
  assert.ok(!result.text.includes(brief('룩 카드')), `${name} reads the look-card subsection only when a card is called`);
  assert.ok(!result.text.includes(brief('8')), `${name} loads the edit-only section`);
  assert.ok(!result.text.includes(section('3.2.4')), `${name} loads the noise detail section`);
}
console.log('Image edit routing: image-brief §1·§8 and §3.3 retained for edits; generation-only §3·§4·§10 excluded; generation bundles carry §3·§4 and exclude §8.');
