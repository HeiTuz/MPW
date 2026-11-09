#!/usr/bin/env node
// Static routing/content-size regression only. These are byte budgets, not
// model token limits, actual host usage, output limits, or quality evaluation.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUNDLES, readTargets } from './read_refs.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const kernel = read('SKILL.md');
const kernelBytes = Buffer.byteLength(kernel);
assert.ok(kernelBytes <= 12000, `dispatch kernel grew to ${kernelBytes} bytes; review loading cost`);
assert.match(kernel, /단순 문안·그대로 재출력·제공 자료의 단순 추출에 묶음을 자동으로 붙이지 않는다/);
assert.match(kernel, /실제 코드 구현·이미지 생성·문서 제작만 요청한 경우에는 해당 실행 스킬/);
assert.match(kernel, /이미 읽은 절.*다시 읽고/);
assert.match(kernel, /링크만으로 연결 문서를 전부 펼치지 않는다/);

const route = name => {
  const result = readTargets(BUNDLES[name]);
  assert.equal(result.error, undefined, name);
  return result.text;
};
const extraction = route('extraction');
assert.match(extraction, /원문 밖 추측 금지/);
assert.match(extraction, /결측값/);
assert.match(extraction, /필수·non-null/);
assert.doesNotMatch(extraction, /팩트체크 축|다섯 단계|최신성 탐색 순서/);
assert.deepEqual(BUNDLES.extraction, ['references/templates/model.md#추출·분류']);

const research = route('research');
assert.match(research, /팩트체크 축/);
assert.doesNotMatch(research, /### 추출·분류|### 체인|### 목록·일괄 처리/);
assert.deepEqual(BUNDLES.research, ['references/templates/model.md#리서치', 'references/research.md']);
assert.match(route('batch'), /처리·실패·미처리/);
assert.doesNotMatch(route('batch'), /팩트체크 축|### 추출·분류/);
assert.match(route('delegation'), /코딩 작업에는 기존 패턴과 테스트/);
assert.doesNotMatch(route('delegation'), /GPT Image|팩트체크 축/);

// Starting context only; task inputs, tool wrappers, extra dependencies,
// reasoning and output are deliberately excluded. Exceeding a budget fails for
// review rather than trimming required guidance or claiming a runtime cap.
const ceilings = { extraction: 3000, batch: 1500, research: 7500, delegation: 4000, 'gpt-image-edit': 14000 };
const measurements = { kernel: { bytes: kernelBytes, codepoints: [...kernel].length } };
for (const [name, ceiling] of Object.entries(ceilings)) {
  const text = route(name);
  const bytes = Buffer.byteLength(text);
  assert.ok(bytes <= ceiling, `${name}: ${bytes} bytes exceeds ${ceiling}; review route scope`);
  measurements[name] = { reference_bytes: bytes, reference_codepoints: [...text].length, kernel_plus_reference_bytes: kernelBytes + bytes };
}
console.log('Static context routing passes; UTF-8 bytes/codepoints only, actual model token usage NOT MEASURED.');
console.log(JSON.stringify(measurements, null, 2));
