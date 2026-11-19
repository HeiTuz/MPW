#!/usr/bin/env node
// Safety scan of the per-layer lexicon tables: no excluded category in any column (token, aliases, tags, looks, kind).
// Categories come from the renewal decision: nothing that evokes minors, nothing that reads as sexual staging.
import assert from 'node:assert/strict';
import { loadAll } from './find_tokens.mjs';

const CATEGORIES = {
  // Minor-evoking: school uniforms, students, lolita, child-coded words.
  minor: [
    /교복/, /학생/, /여고/, /女子高生/, /\bJK\b/, /制服/, /校服/, /セーラー服/, /로리타/, /ロリ/, /lolita/i,
    /소녀/, /少女/, /school\s?girl/i, /\bteen/i, /\bschool\s?uniform/i, /\bstudent/i,
  ],
  // Sexual staging: fetish codes, body-part emphasis, intimate-scene clichés.
  sexual: [
    /가터/, /garter/i, /망사/, /fishnet/i, /절대영역/, /絶対領域/, /란제리/, /lingerie/i, /페티시/, /fetish/i,
    /seductive/i, /sensual/i, /純欲/, /纯欲/, /黑丝/, /白丝/, /肉丝/, /油亮/,
  ],
};
const COLUMNS = ['token', 'aliases', 'tags', 'looks', 'kind'];

const hits = [];
for (const { slug, rows } of loadAll()) {
  for (const row of rows) {
    for (const column of COLUMNS) {
      const value = Array.isArray(row[column]) ? row[column].join('; ') : row[column];
      for (const [category, patterns] of Object.entries(CATEGORIES)) {
        for (const re of patterns) {
          if (re.test(value)) hits.push(`${slug}.md [${category}] ${row.token} / ${column}: ${re}`);
        }
      }
    }
  }
}
assert.equal(hits.length, 0, `${hits.length} lexicon cells hit an exclusion category:\n${hits.join('\n')}`);
console.log('lexicon exclusions: 0 hits');
