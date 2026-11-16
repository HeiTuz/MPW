#!/usr/bin/env node
// Documentation contract checks, not a model-response or visual-quality test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { extractSection } from './read_refs.mjs';

const read = name => fs.readFileSync(new URL(`../references/image/${name}.md`, import.meta.url), 'utf8');
const production = read('production');
assert.match(production, /엔진이 미지정일 때만 적용하며 명시된 다른 엔진을 바꾸지 않는다/);
assert.match(production, /실행 에이전트에 전달하는 지시이며 이미지 모델용 프롬프트 본문에는 붙이지 않는다/);
assert.match(production, /native\/S3의 자연어 `Aspect ratio`·`비율` 지시는 제외/);
const multi = read('product-multicut-consistency');
assert.doesNotMatch(multi, /One call = one image/);
assert.match(multi, /Keep the requested output count/);
assert.match(multi, /Lock a specified single colorway even when references contain other colors/);
assert.match(multi, /Cover every colorway only when requested/);
assert.match(multi, /Preserve a supplied cut plan, sequence, and framing/);
assert.match(multi, /Retry only within the authorized scope/);
assert.match(multi, /For a supported batch, review its cuts after it returns/);
assert.match(multi, /approve that result before using it as the next input/);
assert.match(multi, /Do not claim QC, saved files, or completed generation when only drafting prompts/);
const skeleton = extractSection(multi, 'Prompt skeleton');
assert.equal(skeleton.error, undefined);
assert.match(skeleton.body, /not a mandatory section set/);
assert.match(skeleton.body, /separate execution handoff, not this image prompt/);
assert.match(read('prompt-interview'), /이미 지정된 대상 엔진은 유지하고, 미지정이면/);
assert.equal(extractSection(read('surface-contracts'), '3.2.3').error, undefined);
console.log('Image production boundaries PASS (documentation only; no generation or QC performed).');
