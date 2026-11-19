#!/usr/bin/env node
// Search the per-layer token tables in references/image/lexicon/*.md. No dependencies, no data file: the tables are parsed directly.
// usage: node scripts/find_tokens.mjs --q "신중식,찻집" [--layers outfit,scene] [--culture KR|CN|JP|US|FR] [--limit 6] [--json] [--random N]
import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drawPortraitOptions } from './draw_portrait_options.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const LEXICON_DIR = path.resolve(scriptsDir, '..', 'references', 'image', 'lexicon');
export const SLUGS = ['optics', 'light', 'pose', 'outfit', 'legwear', 'style', 'hair-makeup', 'expression', 'props-nails', 'scene'];
export const CULTURES = ['KR', 'CN', 'JP', 'US', 'FR'];
const COLS = 6;

const norm = (s) => s.normalize('NFKC').toLowerCase();
// Spacing variants match too: "시스루뱅" finds "시스루 뱅" (spaces, hyphens and middle dots are dropped on both sides).
const squash = (s) => norm(s).replace(/[\s\-\u2010-\u2015\u00b7\u30fb]+/g, '');
const splitRow = (line) => line.replace(/^\| | \|$/g, '').split(/(?<!\\) \| /).map((c) => c.replace(/\\\|/g, '|'));
const list = (cell) => cell.split(';').map((s) => s.trim()).filter(Boolean);

// Parse one layer file into rows. Throws on a malformed row so a broken table is never searched silently.
export function loadLayer(slug, dir = LEXICON_DIR) {
  const text = fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8');
  const title = (text.match(/^# (.+?)(?: 토큰)?$/m) ?? [])[1] ?? slug;
  const rows = [];
  let section = null;
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) { section = line.slice(3).trim(); continue; }
    if (!/^\| /.test(line) || /^\| (토큰|---)/.test(line)) continue;
    const cells = splitRow(line);
    if (cells.length !== COLS || !section) throw new Error(`${slug}.md: bad row: ${line.slice(0, 60)}`);
    const [token, aliases, culture, tags, looks, kind] = cells;
    rows.push({ token, aliases: list(aliases), culture: culture.split(',').map((c) => c.trim()), tags: list(tags), looks, kind, section });
  }
  return { slug, title, rows };
}

export const loadAll = (dir = LEXICON_DIR) => SLUGS.map((slug) => loadLayer(slug, dir));

// Per query term: token/alias exact 100/90, partial 60/50, tag 30, culture code 20, looks 10. A row scores the sum over terms.
function scoreRow(row, terms) {
  let total = 0;
  for (const q of terms) {
    const sq = squash(q);
    const token = norm(row.token), sToken = squash(row.token);
    const aliases = row.aliases.map(norm), sAliases = row.aliases.map(squash);
    const hit = (plain, squashed, test) => test(plain, q) || (sq && test(squashed, sq));
    let best = 0;
    if (hit(token, sToken, (a, b) => a === b)) best = 100;
    else if (aliases.some((a, i) => hit(a, sAliases[i], (x, y) => x === y))) best = 90;
    else if (hit(token, sToken, (a, b) => a.includes(b))) best = 60;
    else if (aliases.some((a, i) => hit(a, sAliases[i], (x, y) => x.includes(y)))) best = 50;
    else if (row.tags.some((t) => hit(norm(t), squash(t), (a, b) => a.includes(b)))) best = 30;
    else if (row.culture.some((c) => c.toLowerCase() === q)) best = 20;
    else if (q.length >= 2 && norm(row.looks).includes(q)) best = 10;
    total += best;
  }
  return total;
}

// Returns [{slug, title, matches:[row+score]}] with every match (sorted); callers cut to a limit or draw at random.
export function search({ terms, layers = SLUGS, culture = null, dir = LEXICON_DIR }) {
  const q = terms.map(norm).filter(Boolean);
  return loadAll(dir).filter((l) => layers.includes(l.slug)).map(({ slug, title, rows }) => {
    const matches = rows
      .filter((r) => !culture || r.culture.includes(culture))
      .map((r) => ({ ...r, score: scoreRow(r, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return { slug, title, matches };
  });
}

// Random picks reuse draw_portrait_options so the draw works the same way (crypto.randomInt unless a picker is injected).
export function drawRandom(results, count, pickIndex = randomInt) {
  return results.map((layer) => {
    const n = Math.min(count, layer.matches.length);
    if (n === 0) return { ...layer, matches: [] };
    const byToken = new Map(layer.matches.map((m) => [m.token, m]));
    const drawn = drawPortraitOptions({
      axes: ['pick'],
      options: layer.matches.map((m) => ({ changes: { pick: m.token } })),
      count: n,
    }, pickIndex);
    return { ...layer, matches: drawn.choices.map((c) => byToken.get(c.pick)) };
  });
}

export function formatText(results) {
  if (results.every((l) => l.matches.length === 0)) {
    return 'no match in any layer. Read references/image/layer-lexicon.md (the index) and pick from its representative tokens.\n';
  }
  return results.map((l) => {
    const body = l.matches.length
      ? l.matches.map((m) => `${m.token} — ${m.looks}${m.aliases.length ? ` (${m.aliases.slice(0, 4).join(', ')})` : ''}`).join('\n')
      : 'no match';
    return `## ${l.title}\n${body}\n`;
  }).join('\n');
}

export function formatJson(results, terms) {
  const layers = {};
  for (const l of results) {
    layers[l.slug] = l.matches.map(({ token, aliases, culture, tags, looks, kind, score }) => ({ token, aliases, culture, tags, looks, kind, score }));
  }
  return { query: terms, layers };
}

function parseArgs(argv) {
  const opts = { q: null, layers: SLUGS, culture: null, limit: 6, json: false, random: 0 };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--json') { opts.json = true; continue; }
    const value = argv[++i];
    if (value === undefined) throw new Error(`${flag} needs a value`);
    if (flag === '--q') opts.q = value;
    else if (flag === '--layers') opts.layers = value.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    else if (flag === '--culture') opts.culture = value.toUpperCase();
    else if (flag === '--limit') opts.limit = Number(value);
    else if (flag === '--random') opts.random = Number(value);
    else throw new Error(`unknown flag ${flag}`);
  }
  const bad = opts.layers.filter((l) => !SLUGS.includes(l));
  if (bad.length) throw new Error(`unknown layer ${bad.join(',')} (use ${SLUGS.join(', ')})`);
  if (opts.culture && !CULTURES.includes(opts.culture)) throw new Error(`--culture must be one of ${CULTURES.join('|')}`);
  if (!Number.isInteger(opts.limit) || opts.limit < 1) throw new Error('--limit must be a positive integer');
  if (!Number.isInteger(opts.random) || opts.random < 0) throw new Error('--random must be a non-negative integer');
  if (!opts.q) throw new Error('--q "term1,term2" is required');
  opts.terms = opts.q.split(',').map((s) => s.trim()).filter(Boolean);
  if (!opts.terms.length) throw new Error('--q has no terms');
  return opts;
}

// Installs can sit behind symlinks; compare real paths so the CLI still runs.
function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) {
  try {
    const opts = parseArgs(process.argv.slice(2));
    let results = search(opts);
    results = opts.random ? drawRandom(results, opts.random) : results.map((l) => ({ ...l, matches: l.matches.slice(0, opts.limit) }));
    process.stdout.write(opts.json ? JSON.stringify(formatJson(results, opts.terms)) + '\n' : formatText(results));
  } catch (error) {
    console.error(`find_tokens: ${error.message}`);
    process.exitCode = 2;
  }
}
