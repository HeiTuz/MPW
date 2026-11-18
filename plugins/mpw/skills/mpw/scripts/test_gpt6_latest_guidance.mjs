#!/usr/bin/env node
// Documentation contract regressions; no model calls or performance claims.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, readTargets } from './read_refs.mjs';

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const playbook = read('references/model-playbooks.md');
const noteTarget = 'references/model-playbooks.md#2026-11-18';
const noteResult = readTargets([...BUNDLES['text-model-adapt'], noteTarget]);
assert.equal(noteResult.error, undefined, 'dated note must be retrievable');
const note = noteResult.text;
assert.match(note, /Astra 사례.*Sol에서도 .*따로 평가/);
assert.match(note, /모델 선택까지 요청받았을 때만/);
assert.match(note, /지정 모델·호스트 기본값·도구 권한을 유지/);
assert.match(note, /‘간결하게’가 겹치면 덜어내고.*필수 사실·근거.*형식과 정확 문구를 보존/);
assert.match(note, /최종 보고는 §컨텍스트 운용/);
assert.match(note, /같은 입력·출력 계약과 도구 조건에서 변경 전후를 비교/);
assert.match(note, /사용량·지연은 실행 기록에서 비교/);
assert.ok(note.includes('https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices'));
assert.doesNotMatch(note, /reasoning_effort|prompt_cache_options|max_output_tokens/);

const apiResult = readTargets(['references/adapters.md#OpenAI GPT-6.2']);
assert.equal(apiResult.error, undefined, 'direct API migration must be separately retrievable');
const api = apiResult.text;
assert.match(api, /`gpt-6\.2-astra`, `gpt-6\.2-sol`/);
assert.match(api, /도구 호출은 Responses/);
assert.match(api, /reasoning\.effort.*reasoning_effort.*신규 통합 `medium`.*`none`·`minimal` 이행은 `low`/);
assert.match(api, /Chat Completions 이행에서 `temperature`, `top_p`, `logprobs`, `top_logprobs`를 제거/);
assert.match(api, /Responses에서는 `temperature`, `top_p`, `top_logprobs`와 `include`의 `message\.output_text\.logprobs`를 제거/);
assert.match(api, /prompt_cache_retention.*prompt_cache_options\.ttl.*접두부를 유지/);
assert.match(api, /접두부 수정, 모델 다운그레이드, 최종 사용자 또는 조직 변경/);
assert.match(api, /요청 수준 `reasoning\.effort`를 유지하고 `configuration_update`를 입력 끝에 추가/);
assert.match(api, /incomplete_details\.reason.*max_output_tokens.*잘린 답변은 완료로 판정하지 않는다/);
assert.match(api, /usage\.output_tokens_details\.reasoning_tokens/);

// The entry bundle must expose the note via the provider index, not inject an
// Astra-specific delegation rule into capability-first core routing.
const adapt = readTargets(BUNDLES['text-model-adapt']);
assert.equal(adapt.error, undefined);
assert.match(adapt.text, /11-18 GPT-6\.2 Astra·Sol/);
assert.doesNotMatch(adapt.text, /기본 문체와 초기 확인 요청|prompt_cache_options/);
assert.doesNotMatch(note, /위임이 부족했던 다중 에이전트 작업/);
assert.match(readTargets(['references/model-playbooks.md#2026-11-05']).text, /위임이 부족했던 다중 에이전트 작업/);
const core = playbook.split('## 호환 노트')[0];
assert.doesNotMatch(core, /Astra|GPT-6\.2|Sol·Luna/);
assert.match(core, /사용자가 지정한 모델과 런타임의 고정 역할 설정을 우선/);
assert.match(core, /권한·검증 범위를 유지/);
assert.doesNotMatch(playbook, /Sol·Luna에 적용할 때|Astra 기반 관찰을 Sol·Luna에/);

// The existing permission and completion contract survives test calibration.
const delegation = readTargets(BUNDLES.delegation);
assert.equal(delegation.error, undefined);
assert.match(delegation.text, /범위·비용·외부 행동의 권한을 새로 부여하지 않는다/);
assert.match(delegation.text, /필요한 구현·동작 확인·문제 수정을 끝낸 상태/);
assert.match(delegation.text, /되돌릴 수 있는 가정은 밝혀 진행하고.*답과 무관한 작업은 계속/);
assert.match(delegation.text, /필수 검사를 완료하고/);
assert.match(delegation.text, /통과 후에는 새 변경·실패·열린 우려가 있을 때만 반복하거나 넓힌다/);
assert.match(note, /\[delegation\.md\]\(templates\/delegation\.md\)/);
assert.doesNotMatch(note, /새 변경·실패·열린 우려/, 'verification rule has one canonical home');
console.log('GPT-6.2 guidance: scoped routing, prompting, API compatibility and verification pass; model behavior NOT RUN');
