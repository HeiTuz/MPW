#!/usr/bin/env node
// layer-lexicon.md 색인의 행 수·문화권별 열 수가 lexicon/*.md 실제 행과 같은지만 대조한다.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const CULTURES = ['KR', 'CN', 'JP', 'US', 'FR'];
const index = read('references/image/layer-lexicon.md');
const block = index.split('<!-- lexicon-counts:start -->')[1]?.split('<!-- lexicon-counts:end -->')[0];
assert.ok(block, 'lexicon-counts block missing');

let checked = 0;
for (const line of block.split('\n').filter(l => /^\| .+\]\(lexicon\//.test(l))) {
  const cells = line.replace(/^\| | \|$/g, '').split(' | ');
  const slug = cells[1].match(/\]\(lexicon\/([^)]+)\.md\)/)[1];
  const [total, ...perCulture] = cells.slice(2).map(Number);
  const actual = Object.fromEntries(CULTURES.map(c => [c, 0]));
  let section = null;
  for (const row of read(`references/image/lexicon/${slug}.md`).split('\n')) {
    if (/^## /.test(row)) { section = row.slice(3).trim(); continue; }
    if (/^\| /.test(row) && !/^\| (토큰|---)/.test(row) && section in actual) actual[section]++;
  }
  assert.equal(total, Object.values(actual).reduce((a, b) => a + b, 0), `${slug}: total rows`);
  CULTURES.forEach((c, i) => assert.equal(perCulture[i], actual[c], `${slug}: ${c} rows`));
  checked++;
}
assert.equal(checked, 11, 'index lists 11 layers');
console.log(`ok test_lexicon_counts (${checked} layers)`);
