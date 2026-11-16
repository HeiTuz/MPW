#!/usr/bin/env node
// Static instruction-boundary checks plus real read_refs CLI routing.
// Does not execute a writing model or validate generated image/video quality.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { extractSection } from './read_refs.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const section = (file, heading) => {
  const result = extractSection(read(file), heading);
  assert.equal(result.error, undefined, `${file}#${heading}`);
  return result.body;
};
const image = 'references/image/';
const failure = section(`${image}minimax-h3.md`, '실패 모드와 회피');
assert.match(failure, /문구를 자유롭게 정할 수 있을 때만 1–3단어/);
assert.match(failure, /compiler\.md.*§정확 카피·§후속 조판 경계/);
assert.doesNotMatch(failure, /긴 문장 대신 1–3단어/);

const conversion = section(`${image}prompt-conversion.md`, '3');
assert.match(conversion, /surface-contracts\.md.*§4/);
assert.match(conversion, /변경 금지·보존·추가 금지를 긍정형으로 바꾸느라 의미를 약화하지 않는다/);
assert.match(conversion, /compiler\.md.*§제외 조건의 형식/);
assert.doesNotMatch(conversion, /없으면 원하는 상태의 서술로 바꾼다/);

const defaults = section(`${image}lanes.md`, '이미지 슬롯 기본값');
assert.match(defaults, /길이 미지정이면.*duration.*지원값/);
assert.match(defaults, /명시 길이와 지원값이 충돌하면.*common\.md.*§쓰기 전에 정할 것/);
assert.match(defaults, /임의로 반올림하지 않는다/);
assert.doesNotMatch(defaults, /요청에 가장 가까운 값/);

const sheet = section(`${image}ghost-character-reference-sheet.md`, '1');
assert.match(sheet, /common\.md.*§프롬프트 언어 결정/);
assert.match(sheet, /메모의 포함 여부.*§답변 형식 세부/);
assert.doesNotMatch(sheet, /영어 생성 프롬프트 한 블록.*한국어 출처/);
assert.match(section(`${image}ghost-character-reference-sheet.md`, '5'), /출력 계약이 메모를 허용할 때/);

// Ensure the named canonical targets really resolve, not merely link to files.
for (const heading of ['정확 카피', '후속 조판 경계', '제외 조건의 형식']) {
  section(`${image}compiler.md`, heading);
}
for (const heading of ['쓰기 전에 정할 것', '프롬프트 언어 결정', '답변 형식 세부']) {
  section('references/templates/common.md', heading);
}

// Reproduce the actual reader process used by writers: each boundary survives
// section/bundle loading, without pulling GPT Image new-generation planning in.
const cases = [
  { args: ['--bundle', 'image-prompt-conversion'], expected: conversion },
  { args: [`${image}minimax-h3.md#실패 모드와 회피`], expected: failure },
  { args: [`${image}lanes.md#이미지 슬롯 기본값`], expected: defaults },
  { args: [`${image}ghost-character-reference-sheet.md#1,5`], expected: sheet },
];
const planning = section(`${image}surface-contracts.md`, '3.2.2');
for (const { args, expected } of cases) {
  const result = spawnSync(process.execPath, ['scripts/read_refs.mjs', ...args], {
    cwd: root, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(expected), args.join(' '));
  assert.ok(!result.stdout.includes(planning), `GPT Image planning leaked: ${args.join(' ')}`);
}
console.log('Image engine boundaries PASS: static checks and four real reader CLI paths. No model-response or generation-quality test.');
