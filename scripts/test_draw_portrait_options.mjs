#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { drawPortraitOptions } from './draw_portrait_options.mjs';
import { readTargets } from './read_refs.mjs';

const fixed = {
  place: 'indoors', time: 'night', subject: 'Image 1 인물 마스터',
  wardrobe: 'Image 2 남색 캔버스 재킷', pose: '의자에 앉아 정면',
  language: 'Korean only', copy: '小滿',
};
const lighting = {
  axes: ['lighting'], fixed,
  options: [
    { changes: { lighting: '흰 천장에 튕긴 플래시' }, requires: { place: 'indoors', time: 'night' } },
    { changes: { lighting: '오후 창가 빛' }, requires: { time: 'day' } },
    { changes: { lighting: '작은 책상 램프의 간접광' }, requires: { time: 'night' } },
    { changes: { lighting: '가로등 불빛' }, requires: { place: 'outdoors' } },
    { changes: { lighting: '작은 소프트박스의 측광' }, requires: { place: 'indoors' } },
    { changes: { lighting: '흰 천장에 튕긴 플래시 ' } },
    { changes: { lighting: '광원', wardrobe: '가죽 재킷' } },
    { changes: { pose: '서서 옆 보기' } },
    { changes: { lighting: '벽난로 불빛' }, requires: { fireplace: 'present' } },
  ],
};
const snapshot = structuredClone(lighting);
const limits = [];
const selected = drawPortraitOptions({ ...lighting, count: 3 }, max => { limits.push(max); return 0; });
assert.deepEqual(limits, [3, 2, 1], 'one draw per result without replacement');
assert.deepEqual(selected, { status: 'selected', choices: [
  { lighting: '흰 천장에 튕긴 플래시' },
  { lighting: '작은 소프트박스의 측광' },
  { lighting: '작은 책상 램프의 간접광' },
] });
assert.deepEqual(lighting, snapshot, 'context, identity, wardrobe, language and copy are untouched');

const prior = { ...fixed, finish: 'fine film grain', lighting: selected.choices[0].lighting };
const reroll = drawPortraitOptions({ ...lighting, fixed: { ...fixed, finish: prior.finish },
  options: lighting.options.filter(option => option.changes.lighting?.trim() !== prior.lighting) }, () => 0);
assert.deepEqual(reroll.choices, [{ lighting: '작은 책상 램프의 간접광' }]);
assert.deepEqual({ ...prior, ...reroll.choices[0] }, { ...prior, lighting: '작은 책상 램프의 간접광' });

const coherent = { lighting: 'direct flash', scene: '밤의 실내 작업실' };
assert.deepEqual(drawPortraitOptions({ axes: ['scene', 'lighting'], options: [
  { changes: { scene: '흐린 날의 정원' } }, { changes: coherent },
] }, () => 0), { status: 'selected', choices: [coherent] });

const forbiddenDraw = () => assert.fail('must not draw when no valid answer can be produced');
assert.deepEqual(drawPortraitOptions({ ...lighting, axes: ['lighting', 'wardrobe'] }, forbiddenDraw),
  { status: 'locked_axes', axes: ['wardrobe'] });
assert.deepEqual(drawPortraitOptions({ ...lighting, count: 4 }, forbiddenDraw),
  { status: 'insufficient_options', requested: 4, available: 3 });
assert.deepEqual(drawPortraitOptions({ ...lighting, options: [lighting.options[1]] }, forbiddenDraw),
  { status: 'no_eligible_options', requested: 1, available: 0 });
assert.throws(() => drawPortraitOptions({ ...lighting, count: 0 }), /positive integer/);

const script = fileURLToPath(new URL('./draw_portrait_options.mjs', import.meta.url));
const cli = request => spawnSync(process.execPath, [script], { input: JSON.stringify(request), encoding: 'utf8' });
const actual = cli(lighting);
assert.equal(actual.status, 0, actual.stderr);
const actualChoices = JSON.parse(actual.stdout).choices;
assert.equal(actualChoices.length, 1);
assert.ok(selected.choices.some(choice => choice.lighting === actualChoices[0].lighting));
assert.equal(cli({ ...lighting, options: [] }).status, 1);
assert.equal(cli({ axes: [] }).status, 2);

const target = 'references/image/editorial/portrait-variations.md#명시적 랜덤 요청';
const guidance = readTargets([target]);
assert.equal(guidance.error, undefined);
assert.match(guidance.text, /일반 요청의 창작 보완과 비교 변주에는 난수 선택을 추가하지 않는다/);
assert.match(guidance.text, /한 축을 다시 뽑을 때는 직전 컷의 다른 축을 고정/);
assert.match(guidance.text, /도구가 없는 경우.*창작 변주만 제공하고 실제 난수로 골랐다고 보고하지 않는다/);
assert.match(guidance.text, /기존 원문의 한 축.*지정한 부분만 바꾼다.*언어 규칙/);
console.log('Portrait draw: real CLI RNG, eligible options, locks, scoped reroll and no replacement pass. No model or image calls.');
