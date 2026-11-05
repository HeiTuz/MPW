#!/usr/bin/env node
// Documentation contract regressions; no model calls or performance claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, readTargets } from './read_refs.mjs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const playbook = read('references/model-playbooks.md');
const noteTarget = 'references/model-playbooks.md#2026-11-05';
const noteResult = readTargets([noteTarget]);
assert.equal(noteResult.error, undefined, 'dated note must be retrievable');
const note = noteResult.text;
assert.match(note, /Astra 관찰/);
assert.match(note, /GPT-6\.1 Sol·Terra/);
assert.match(note, /실제 선택한 GPT-6 모델과 작업/);
assert.match(note, /독립 작업.*시간을 줄이거나 품질을 높일 때/);
assert.match(note, /사람이 읽을 수 있는 문장/);
assert.match(note, /단어·숫자 사이.*공백/);
assert.match(note, /모든 모델·작업의 의무 위임 규칙이 아니다/);
assert.match(note, /모델 기본값·호스트 권한을 바꾸는 지시가 아니다/);
for (const anchor of ['prompting-best-practices', 'subagent-delegation', 'testing-and-verification']) {
  assert.ok(note.includes(`https://developers.openai.com/api/docs/guides/latest-model#${anchor}`));
}

// The entry bundle must expose the note via the provider index, not inject an
// Astra-specific delegation rule into capability-first core routing.
const adapt = readTargets(BUNDLES['text-model-adapt']);
assert.equal(adapt.error, undefined);
assert.match(adapt.text, /11-05 GPT-6 위임·평가/);
const core = playbook.split('## 호환 노트')[0];
assert.doesNotMatch(core, /Astra|GPT-6\.1|Sol·Luna/);
assert.match(core, /사용자가 지정한 모델과 런타임의 고정 역할 설정을 우선/);
assert.match(core, /권한·검증 범위를 유지/);
assert.doesNotMatch(playbook, /Sol·Luna에 적용할 때|Astra 기반 관찰을 Sol·Luna에/);

// The existing permission and completion contract survives test calibration.
const delegation = readTargets(BUNDLES.delegation);
assert.equal(delegation.error, undefined);
assert.match(delegation.text, /범위·비용·외부 행동의 권한을 새로 부여하지 않는다/);
assert.match(delegation.text, /필요한 구현·동작 확인·문제 수정을 끝낸 상태/);
assert.match(delegation.text, /필수 검사를 완료하고/);
assert.match(delegation.text, /통과 후에는 새 변경·실패·열린 우려가 있을 때만 반복하거나 넓힌다/);
assert.match(note, /\[delegation\.md\]\(templates\/delegation\.md\)/);
assert.doesNotMatch(note, /새 변경·실패·열린 우려/, 'verification rule has one canonical home');
console.log('GPT-6 latest guidance: dated reader dispatch, Astra scope, chosen-model evaluation, and permission/verification boundaries pass');
