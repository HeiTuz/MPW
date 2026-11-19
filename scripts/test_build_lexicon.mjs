#!/usr/bin/env node
// build_lexicon.mjs: merge, exclusion, malformed-row and override behavior on a tiny synthetic input.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, renderLayer, LAYERS } from './build_lexicon.mjs';

const row = (over) => ({ token: '木漏れ日', lang: 'ja', layer: 'Light', aliases: ['코모레비'], culture: 'JP', tags: ['낮'], looks_like: 'Light drops through leaves as moving coins on skin and cloth.', kind: 'look', presets: [1], ...over });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lexicon-'));
fs.writeFileSync(path.join(dir, 'a.json'), JSON.stringify([
  row({}),
  row({ token: ' `木漏れ日` ', aliases: ['komorebi'], culture: 'KR', tags: ['숲'], looks_like: 'Light drops through leaves as moving coins on skin and cloth, softly.' }),
  row({ token: 'Bad layer', layer: 'Nope' }),
  row({ token: '교복 룩', lang: 'ko', layer: 'Outfit', culture: 'KR' }),
  row({ token: 'Pipe | name', lang: 'en', layer: 'Scene', culture: 'US' }),
  row({ token: 'Dropped', lang: 'en', layer: 'Scene', culture: 'US' }),
]));
const { merged, report } = build(dir, { overrides: { drop: [{ layer: 'Scene', tokens: ['Dropped'] }, { tokens: ['Never there'] }] } });
assert.equal(report.input_rows, 6);
assert.equal(report.malformed['bad-layer'], 1);
assert.equal(report.excluded, 1);
assert.equal(report.dropped_by_override, 1);
assert.deepEqual(report.stale_overrides, ['drop Never there']);
assert.equal(merged.length, 2);
const komorebi = merged.find((r) => r.token === '木漏れ日');
assert.deepEqual(komorebi.aliases, ['코모레비', 'komorebi']);
assert.deepEqual(komorebi.culture, ['KR', 'JP']);
assert.equal(komorebi.primary, 'JP');
assert.match(komorebi.looks_like, /softly\.$/);
const scene = renderLayer('Scene', merged.filter((r) => r.layer === 'Scene'));
assert.match(scene, /\| Pipe \\\| name \|/);
assert.ok(LAYERS.length === 10);
console.log('PASS build_lexicon');
