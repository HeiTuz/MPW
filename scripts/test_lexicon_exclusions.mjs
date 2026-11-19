#!/usr/bin/env node
// Lexicon policy: the dictionary may contain child and student vocabulary. Rows tagged 아동·학생 must carry no sensual wording,
// and the random draw never picks them. Prose is not pinned beyond this vocabulary scan.
import assert from 'node:assert/strict';
import { MINOR_TAG, drawRandom, loadAll, search } from './find_tokens.mjs';

const SENSUAL = [
  /sensual/i, /seductive/i, /\bsexy/i, /\bsexual/i, /erotic/i, /provocative/i, /alluring/i, /lingerie/i, /garter/i, /cleavage/i, /\bnude\b/i, /\btopless/i, /\bsultry/i,
  /관능/, /섹시/, /란제리/, /가터/, /노출/, /야한/, /유혹/, /純欲/, /纯欲/, /絶対領域/, /絶対領域/, /절대영역/, /性感/, /诱惑/, /色気/, /セクシー/, /ランジェリー/, /ガーター/, /sensuel/i, /séduct/i, /lingerie/i,
];
const COLUMNS = ['token', 'aliases', 'looks'];

const tagged = [];
const hits = [];
for (const { slug, rows } of loadAll()) {
  for (const row of rows) {
    if (!row.tags.includes(MINOR_TAG)) continue;
    tagged.push({ slug, token: row.token });
    for (const column of COLUMNS) {
      const value = Array.isArray(row[column]) ? row[column].join('; ') : row[column];
      for (const re of SENSUAL) if (re.test(value)) hits.push(`${slug}.md ${row.token} / ${column}: ${re}`);
    }
  }
}
assert.ok(tagged.length > 0, 'no row carries the 아동·학생 tag');
assert.equal(hits.length, 0, `${hits.length} tagged cells carry sensual wording:\n${hits.join('\n')}`);

const tokens = tagged.map((r) => r.token);
const drawn = drawRandom(search({ terms: tokens }), 1000);
for (const layer of drawn) for (const m of layer.matches) assert.ok(!m.tags.includes(MINOR_TAG), `random drew ${m.token}`);
console.log(`lexicon exclusions: ${tagged.length} tagged rows, 0 sensual hits, 0 random draws`);
