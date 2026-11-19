#!/usr/bin/env node
import assert from 'node:assert/strict';
import { loadAll } from './find_tokens.mjs';

// Safety scan of the per-layer lexicon tables: nothing that directly names a minor, in any column (token, aliases, tags, looks, kind).
// Adult fashion and styling vocabulary (lingerie looks, hosiery, glamour, 少女感, teen-film or lolita styles used as adult fashion genres) is allowed.
const CATEGORIES = {
  // Minors named directly: school-age girls and students, school uniforms of middle and high schools, children and child events.
  minor: [
    /여고생/, /여중생/, /중학생/, /고등학생/, /중고생/, /초등/, /어린이/, /아동/, /유치원/, /키즈/,
    /女子高生/, /女子中学生/, /女子校生/, /中学生/, /高校生/, /小学生/, /\bJK\b/, /\bJC\b/, /七五三/, /セーラー服/, /学生服/, /校服/, /学生制服/, /儿童/, /小朋友/,
    /school\s?girl/i, /\bschool\s?boy/i, /\bmiddle.?school/i, /\bhigh.?school(er)?\b/i, /\bchild(ren)?\b/i, /\bkids?\b/i, /\bminor\b/i, /\btoddler/i, /\bunderage/i,
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
