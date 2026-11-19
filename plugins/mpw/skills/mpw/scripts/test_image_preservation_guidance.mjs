import assert from 'node:assert/strict';
import fs from 'node:fs';
import { checkText } from './check_prompt.mjs';
import { fileURLToPath } from 'node:url';

// Guidance and deterministic checker regressions; no image or writing-model behavior is tested.
const root = new URL('../references/image/', import.meta.url);
const read = (name) => fs.readFileSync(fileURLToPath(new URL(name, root)), 'utf8');
let count = 0;
const check = (name, fn) => { fn(); count++; console.log('PASS ' + name); };
const brief = read('image-brief.md');
const collision = read('editorial/concept-collision.md');
const fromImage = read('from-image.md');
check('nonsexual child requests retain their requested age', () => {
  assert.match(brief, /비성적인 어린이·청소년 인물 요청을 임의로 성인으로 바꾸지 않는다/);
  assert.match(brief, /성인 라벨만 덧붙여 허용 가능한 요청으로 취급하지 않는다/);
});
check('texture edits preserve user choices rather than replacing all skin detail', () => {
  assert.match(collision, /모공·잔털로 일괄 치환하지 않는다/);
  assert.match(collision, /사용자가 지정한 피부색·질감과 기준 원문의 수정 범위를 보존한다/);
  assert.doesNotMatch(collision, /네 개 이상 쌓으면/);
});
check('same-model recompilation never assumes automatic reproduction', () => {
  assert.match(fromImage, /모델이 같다는 이유로 불확실한 조건을 자동 삭제하지 않는다/);
  assert.match(fromImage, /모델이 같다는 이유로 유지 조건을 삭제하지 않았다/);
  assert.doesNotMatch(fromImage, /자동으로 온다|어차피 다시 나오지만|이때만 싣는다/);
});
check('missing garment analysis contract keeps the direct-observation fallback', () => {
  assert.match(fromImage, /계약이 없으면 §3 관찰 레코드로 직접 작성했다/);
});
check('scale correction keeps count and does not invent measurements', () => {
  const realism = read('realism.md');
  assert.match(realism, /요청된 수량·크기·소재를 유지/);
  assert.match(realism, /없으면 측정값처럼 수치를 만들지 않는다/);
  assert.doesNotMatch(realism, /수백~수천 개 밀도로 명시|높이·폭을 피사체 신체 기준 실측값으로 명시/);
});
check('series setup is conditional on the requested comparison', () => {
  const fashion = read('editorial-fashion.md');
  assert.match(fashion, /동일 셋업의 비교 룩북을 요청했다면/);
  assert.match(fashion, /시리즈에는 이 셋업이나 한 축 변경을 강제하지 않는다/);
});
check('requested labels survive uncertain rendering', () => {
  const triage = read('portrait-reference-moderation-triage.md');
  assert.match(triage, /Preserve labels and exact copy the user requested/);
  assert.match(triage, /not silent removal/);
  assert.doesNotMatch(triage, /no text labels unless/);
});
check('lighting ratio distinguishes stops and source ratio', () => {
  const photo = read('editorial/photo-results.md');
  assert.match(photo, /2배 차이가 1스톱/);
  assert.match(photo, /광원 자체의 `key:fill` 비율과 키측:그림자측 밝기 비율을 같은 값으로 취급하지 않는다/);
  assert.doesNotMatch(photo, /배수가 곧 스톱/);
});
check('checker preserves requested skin texture and character color as review signals', () => {
  const source = 'Edit only the backdrop of the yellow skin character; preserve micro skin texture and the supplied color.';
  const result = checkText(source, { profile: 'assembled' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  for (const code of ['portrait/skin-token', 'portrait/nationality-skin']) {
    const warning = result.warnings.find((item) => item.code === code);
    assert.ok(warning, code);
    assert.match(warning.hint, /Preserve requested/);
    assert.match(warning.hint, /partial-edit scope/);
  }
  assert.match(result.warnings.find((item) => item.code === 'portrait/nationality-skin').message, /not evidence of nationality inference/);
  const native = checkText(source, { profile: 'native' });
  assert.ok(![...native.errors, ...native.warnings].some((item) => ['portrait/skin-token', 'portrait/nationality-skin'].includes(item.code)));
});
check('checker glow heuristic does not prescribe matte or predict failure', () => {
  const result = checkText('Preserve dewy cheeks, luminous skin, glass skin and wet-look highlights.', { profile: 'assembled' });
  assert.equal(result.ok, true);
  const warning = result.warnings.find((item) => item.code === 'portrait/glow-stack');
  assert.match(warning.message, /heuristic, not a prediction/);
  assert.match(warning.hint, /do not automatically add matte regions or remove gloss terms/);
});
check('checker skin repetition preserves area-specific conditions without a forced heading', () => {
  const result = checkText('FACE: Visible pores on cheeks.\n\nARMS: Natural pores on forearms.', { profile: 'assembled' });
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  const diagnostic = result.warnings.find((item) => item.code === 'portrait/skin-repeat');
  assert.ok(diagnostic);
  assert.match(diagnostic.hint, /distinct areas/);
  assert.match(diagnostic.hint, /Preserve requested texture, color, area, degree and partial-edit scope/);
  assert.match(diagnostic.hint, /without forcing a heading/);
  assert.doesNotMatch(diagnostic.hint, /CONSTRAINTS/);
});
check('quoted exact skin copy stays outside portrait diagnostics', () => {
  const result = checkText('Set the headline exactly once: "micro skin texture yellow skin dewy luminous skin glass skin wet-look".', { profile: 'assembled' });
  assert.ok(![...result.errors, ...result.warnings].some((item) => item.code.startsWith('portrait/')));
});
console.log(`${count} image preservation guidance checks passed (model behavior NOT RUN)`);
