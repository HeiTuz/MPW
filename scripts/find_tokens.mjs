#!/usr/bin/env node
// Search the per-layer token tables in references/image/lexicon/*.md. No dependencies, no data file: the tables are parsed directly.
// usage: node scripts/find_tokens.mjs --q "신중식,찻집" [--layers outfit,scene,camera] [--culture KR|CN|JP|US|FR] [--limit 6] [--json] [--random N]
// A query that names a look (왕가위, 港风, 홍콩 영화) also prints a "## Look card" block first: read that card before the layer rows.
import { randomInt } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { drawPortraitOptions } from './draw_portrait_options.mjs';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
export const LEXICON_DIR = path.resolve(scriptsDir, '..', 'references', 'image', 'lexicon');
export const LOOKS_DIR = path.resolve(scriptsDir, '..', 'references', 'image', 'looks');
export const SLUGS = ['optics', 'light', 'pose', 'outfit', 'legwear', 'style', 'hair-makeup', 'expression', 'props-nails', 'scene', 'camera'];
export const CULTURES = ['KR', 'CN', 'JP', 'US', 'FR'];
const COLS = 6;

const norm = (s) => s.normalize('NFKC').toLowerCase();
// Spacing variants match too: "시스루뱅" finds "시스루 뱅" (spaces, hyphens and middle dots are dropped on both sides).
// The squashed form never matches inside a word: it must equal a whole token or alias, or be its start (so "한복" does not hit "젖은 듯한 복고 컬").
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

const escapeRe = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const hasWord = (text, w) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(w)}(?![\\p{L}\\p{N}])`, 'u').test(text);
// Per query term: token/alias exact 100/90, partial 60/50, tag 30, culture code 20, looks 10. A row scores the sum over terms.
// A term given as {q, exact:true} (a one-character word from a split phrase) scores only on an exact token, alias or tag match.
// A term given as {q, word:true} (a Latin word from a split phrase) matches inside a token, alias, tag or description only as a whole word ("vague" does not hit "Vaguelettes").
function scoreRow(row, terms) {
  let total = 0;
  const token = norm(row.token), sToken = squash(row.token);
  const aliases = row.aliases.map(norm), sAliases = row.aliases.map(squash);
  const tags = row.tags.map(norm), sTags = row.tags.map(squash);
  for (const item of terms) {
    const q = item.q ?? item, exact = item.exact === true, word = item.word === true;
    const sq = squash(q);
    const same = (plain, squashed) => plain === q || (sq && squashed === sq);
    // Plain terms match a substring (or the squashed start); word terms match a whole word only.
    const part = word ? (plain) => hasWord(plain, q) : (plain, squashed) => plain.includes(q) || (sq && squashed.startsWith(sq));
    let best = 0;
    if (same(token, sToken)) best = 100;
    else if (aliases.some((a, i) => same(a, sAliases[i]))) best = 90;
    else if (exact) best = tags.some((t, i) => same(t, sTags[i])) ? 30 : 0;
    else if (part(token, sToken)) best = 60;
    else if (aliases.some((a, i) => part(a, sAliases[i]))) best = 50;
    else if (tags.some((t, i) => part(t, sTags[i]))) best = 30;
    else if (row.culture.some((c) => c.toLowerCase() === q)) best = 20;
    else if (q.length >= 2 && (word ? hasWord(norm(row.looks), q) : norm(row.looks).includes(q))) best = 10;
    total += best;
  }
  return total;
}

// Decided per layer: a phrase (spaces, brackets or slashes inside) that matches nothing in that layer's rows is retried word by word there ("90년대 홍콩" -> 홍콩, "홍콩영화(왕가위 감성)" -> 홍콩영화, 왕가위).
// Digit-only words, one-character Latin words and filler words (감성, 느낌, 스타일, 룩, vibe) are dropped; a one-character Hangul or CJK word (비, 눈, 雨) is kept but scores on exact matches only; a Latin word matches whole words only.
const PHRASE_BREAK = /[\s()（）[\]【】「」『』/／]+/;
const FILLER_WORDS = new Set(['감성', '느낌', '스타일', '룩', 'vibe']);
function expandTerms(terms, rows) {
  return terms.flatMap((t) => {
    if (!PHRASE_BREAK.test(t) || rows.some((r) => scoreRow(r, [t]) > 0)) return [t];
    return t.split(PHRASE_BREAK)
      .filter((w) => w && !/^\d+$/.test(w) && !FILLER_WORDS.has(w) && !(w.length === 1 && /[a-z0-9]/.test(w)))
      .map((w) => (w.length === 1 ? { q: w, exact: true } : /^[a-z0-9'.-]+$/.test(w) ? { q: w, word: true } : w));
  });
}

// Look cards: references/image/looks/index.md lists one row per card (slug | names | words that must not call it | culture | branches).
// A card is called when the raw query contains one of its names, the reverse of the row search above. Hangul and CJK names match as text
// (spaces and brackets ignored); Latin names match whole words only, so a short name like "WKW" never fires inside another word.
const nameWords = (alias) => norm(alias).split(/[\s\-\u2010-\u2015\u00b7\u30fb]+/).filter(Boolean);
export function loadLooks(dir = LOOKS_DIR) {
  const file = path.join(dir, 'index.md');
  if (!fs.existsSync(file)) return [];
  const looks = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!/^\| /.test(line) || /^\| (slug|---)/.test(line)) continue;
    const cells = splitRow(line);
    if (cells.length !== 5) throw new Error(`looks/index.md: bad row: ${line.slice(0, 60)}`);
    const [slug, names, avoid, culture, branches] = cells;
    if (!fs.existsSync(path.join(dir, `${slug}.md`))) throw new Error(`looks/index.md: ${slug}.md is missing`);
    const card = fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8');
    const title = (card.match(/^# (.+?)(?: — .*)?$/m) ?? [])[1] ?? slug;
    looks.push({ slug, title, names: list(names), avoid: list(avoid), culture, branches, file: `references/image/looks/${slug}.md` });
  }
  return looks;
}

export function findLookCards(terms, dir = LOOKS_DIR) {
  const raw = norm(terms.join(','));
  const squashed = squash(raw);
  return loadLooks(dir).flatMap((look) => {
    const name = look.names.find((n) => {
      if (/^[a-z0-9\s\-\u00b7.']+$/.test(norm(n))) {
        const body = nameWords(n).map(escapeRe).join('[\\s\\-\\u00b7]*');
        return new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`).test(raw);
      }
      return squashed.includes(squash(n));
    });
    return name ? [{ ...look, matched: name }] : [];
  });
}

// Returns [{slug, title, matches:[row+score]}] with every match (sorted); callers cut to a limit or draw at random.
export function search({ terms, layers = SLUGS, culture = null, dir = LEXICON_DIR }) {
  const picked = loadAll(dir).filter((l) => layers.includes(l.slug));
  const base = terms.map(norm).filter(Boolean);
  return picked.map(({ slug, title, rows }) => {
    const pool = rows.filter((r) => !culture || r.culture.includes(culture));
    const q = expandTerms(base, pool);
    const matches = pool
      .map((r) => ({ ...r, score: scoreRow(r, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return { slug, title, matches };
  });
}

// Random picks reuse draw_portrait_options so the draw works the same way (crypto.randomInt unless a picker is injected).
// Rows tagged MINOR_TAG (children and students) are never drawn at random; a direct search still returns them.
export const MINOR_TAG = '아동·학생';
export function drawRandom(results, count, pickIndex = randomInt) {
  return results.map((full) => {
    const layer = { ...full, matches: full.matches.filter((m) => !m.tags.includes(MINOR_TAG)) };
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

const cardBlock = (cards) => (cards.length
  ? `## Look card\n${cards.map((c) => `${c.title} — ${c.file}\nread: node scripts/read_refs.mjs ${c.file}`).join('\n')}\n(read the card before the layer rows below; it fills the layers this look carries)\n\n`
  : '');

export function formatText(results, cards = []) {
  if (results.every((l) => l.matches.length === 0)) {
    return cards.length
      ? `${cardBlock(cards)}no layer rows matched; the card above carries the look.\n`
      : 'no match in any layer. Use English tokens and sentences unless you know an original-language term for sure (image-brief.md §2, §4).\n';
  }
  return cardBlock(cards) + results.map((l) => {
    const body = l.matches.length
      ? l.matches.map((m) => `${m.token} — ${m.looks}${m.aliases.length ? ` (${m.aliases.slice(0, 4).join(', ')})` : ''} [${m.kind}]`).join('\n')
      : 'no match';
    return `## ${l.title}\n${body}\n`;
  }).join('\n');
}

export function formatJson(results, terms, cards = []) {
  const layers = {};
  for (const l of results) {
    layers[l.slug] = l.matches.map(({ token, aliases, culture, tags, looks, kind, score }) => ({ token, aliases, culture, tags, looks, kind, score }));
  }
  return { query: terms, looks: cards.map(({ slug, title, file, matched }) => ({ slug, title, file, matched })), layers };
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
    const argv = process.argv.slice(2);
    if (argv.includes('--help') || argv.includes('-h')) {
      process.stdout.write(`${fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(0, 3).filter((l) => l.startsWith('//')).map((l) => l.slice(3)).join('\n')}\n`);
      process.exit(0);
    }
    const opts = parseArgs(argv);
    let results = search(opts);
    results = opts.random ? drawRandom(results, opts.random) : results.map((l) => ({ ...l, matches: l.matches.slice(0, opts.limit) }));
    const cards = findLookCards(opts.terms);
    process.stdout.write(opts.json ? JSON.stringify(formatJson(results, opts.terms, cards)) + '\n' : formatText(results, cards));
  } catch (error) {
    console.error(`find_tokens: ${error.message}`);
    process.exitCode = 2;
  }
}
