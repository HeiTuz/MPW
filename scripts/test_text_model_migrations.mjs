#!/usr/bin/env node
// Documentation-contract regression only: no API execution or quality inference.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, readTargets } from './read_refs.mjs';
const read = f => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
const playbook = read('references/model-playbooks.md');
const adapters = read('references/adapters.md');
const get = (file, anchor) => {
  const result = readTargets([`${file}#${anchor}`]);
  assert.equal(result.error, undefined, `reader must resolve ${anchor}`);
  return result.text;
};
let failed = 0;
function check(name, run) {
  try { run(); console.log(`PASS ${name}`); }
  catch (error) { failed++; console.error(`FAIL ${name}: ${error.message}`); }
}
check('Sonnet JSON reasoning cue is a narrow exception, not disclosure', () => {
  const note = get('references/model-playbooks.md', '2026-11-09');
  assert.match(note, /Sonnet 5\.5/);
  assert.match(note, /계산·규칙 적용·순위/);
  assert.match(note, /Think the problem through before you answer\./);
  assert.match(note, /내부 추론 공개.*요구하지 않는다/);
  assert.match(note, /단순 추출.*다른 Claude 모델.*자동 적용하지 않는다/);
  assert.ok(note.includes('https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#reasoning-tasks-with-json-output'));
});
check('Sonnet API contract rejects truncated-but-parseable JSON and incompatible thinking', () => {
  const api = get('references/adapters.md', 'Sonnet 5.5 JSON');
  assert.match(api, /adaptive/);
  assert.match(api, /도구 없는.*between_tools.*효과가 없다/);
  assert.match(api, /xhigh.*max.*between_tools.*400/);
  assert.match(api, /stop_reason.*max_tokens.*JSON.*파싱.*실패/);
  assert.match(api, /예산.*재시도/);
  assert.match(api, /다른 Claude 모델.*이식하지 않는다/);
});
check('Gemini 4 Argon Cloud migration removes incompatible fields without endpoint broadening', () => {
  const api = get('references/adapters.md', 'Gemini 4 Argon');
  assert.match(api, /Gemini Enterprise Agent Platform/);
  assert.match(api, /thinking_budget.*MINIMAL.*400/);
  assert.match(api, /LOW.*MEDIUM.*HIGH/);
  assert.match(api, /temperature.*top_p.*top_k.*효과가 없.*제거/);
  assert.match(api, /cached_content.*미지원.*제거/);
  assert.match(api, /캐시 원문.*기존 권한.*보존/);
  assert.match(api, /원문을 읽을 수 없으면.*입력 누락.*중단/);
  assert.match(api, /다른 엔드포인트·중개 서비스·대화 UI.*일반화하지 않는다/);
  assert.match(api, /2026-11-07.*최초 도입일.*아니다/);
  assert.ok(api.includes('https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/get-started-with-gemini-4?hl=en'));
});
check('reader dispatch and canonical separation preserve other-model defaults', () => {
  const adapt = readTargets(BUNDLES['text-model-adapt']);
  assert.equal(adapt.error, undefined);
  assert.match(adapt.text, /11-09 Sonnet JSON/);
  assert.match(adapt.text, /11-09 Gemini 4 Argon/);
  const note = get('references/model-playbooks.md', '2026-11-09');
  assert.match(note, /\[adapters\.md\]\(adapters\.md\)/);
  assert.doesNotMatch(note, /cached_content|stop_reason|thinking_budget/);
  assert.doesNotMatch(playbook.split('## 호환 노트')[0], /Sonnet 5\.5|Gemini 4 Argon|Think the problem through/);
  assert.equal((playbook + adapters).split('Think the problem through before you answer.').length - 1, 1);
});
console.log(`Text model migration documentation: ${4 - failed}/4 passed; model/API behavior NOT RUN`);
process.exitCode = failed ? 1 : 0;
