#!/usr/bin/env node
// Search the per-layer token tables in references/image/lexicon/*.md. No dependencies, no data file: the tables are parsed directly.
// usage: node scripts/find_tokens.mjs --q "신중식,찻집" [--layers outfit,scene,camera] [--culture KR|CN|JP|US|FR] [--limit 6] [--json] [--aliases] [--random N]
// A query that names a look (왕가위, 港风, 홍콩 영화) also prints a "## Look card" block first: read that card before the layer rows.
// A query that only touches a card's "do not call" words (필카 감성, 폴라로이드), or shares two or more cues (비 오는 밤, 네온) with a card's summary, names and facts, prints a "## Look card candidates" block with one-line summaries instead.
// Rows print without their aliases (the search still matches them); --aliases adds them.
// Rows tagged 부분 (마당, 창살, 立领: part names of a culture's things) are called inside the English sentence, so they print once in a "## 문장 속 낱말" block after the layer rows instead of competing for the per-layer limit.
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
// A tag that is a look card's calling name (폴라로이드 빛샘, Kodak FunSaver) matches only a term equal to it, so "폴라로이드" does not pull every row linked to a Polaroid card.
// A term given as {q, exact:true} (a one-character word from a split phrase) scores only on an exact token, alias or tag match.
// A term given as {q, word:true} (a Latin word from a split phrase) matches inside a token, alias, tag or description only as a whole word ("vague" does not hit "Vaguelettes").
let lookNameTags = null;
const isLookNameTag = (tag) => {
  lookNameTags ??= new Set(loadLooks().flatMap((l) => l.names.map(squash)));
  return lookNameTags.has(squash(tag));
};
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
    else if (tags.some((t, i) => (isLookNameTag(t) ? same(t, sTags[i]) : part(t, sTags[i])))) best = 30;
    else if (row.culture.some((c) => c.toLowerCase() === q)) best = 20;
    else if (q.length >= 2 && (word ? hasWord(norm(row.looks), q) : norm(row.looks).includes(q))) best = 10;
    total += best;
  }
  return total;
}

// Decided per layer: a phrase (spaces, brackets or slashes inside) that matches nothing in that layer's rows is retried word by word there ("90년대 홍콩" -> 홍콩, "홍콩영화(왕가위 감성)" -> 홍콩영화, 왕가위).
// Digit-only words, one-character Latin words and filler words (감성, 느낌, 스타일, 룩, vibe) are dropped; a one-character Hangul or CJK word (비, 눈, 雨) is kept but scores on exact matches only; a Latin word matches whole words only.
// When the query called a look card, the card carries its own name and era: the words of the called name score on exact matches only
// ("Kodak Gold 200" must not hit a "gold thread" row), and era words (90년대, 90s, 1990s) are dropped from the split because the card sets the era.
const PHRASE_BREAK = /[\s()（）[\]【】「」『』/／]+/;
const FILLER_WORDS = new Set(['감성', '느낌', '스타일', '룩', 'vibe']);
const ERA_WORD = /^(\d{2,4}년대|\d{2,4}s|\d{2,4}代|\d{2,4}年代)$/;
function expandTerms(terms, rows, cardWords = new Set(), cardCalled = false) {
  return terms.flatMap((t) => {
    if (!PHRASE_BREAK.test(t) || rows.some((r) => scoreRow(r, [t]) > 0)) return [t];
    return t.split(PHRASE_BREAK)
      .filter((w) => w && !/^\d+$/.test(w) && !FILLER_WORDS.has(w) && !(w.length === 1 && /[a-z0-9]/.test(w)) && !(cardCalled && ERA_WORD.test(w)))
      .map((w) => (w.length === 1 || cardWords.has(w) ? { q: w, exact: true } : /^[a-z0-9'.-]+$/.test(w) ? { q: w, word: true } : w));
  });
}

// Look cards: references/image/looks/index.md lists one row per card ([slug](slug.md) | name | culture | branches | axis | summary). The names that call a card and the
// words that must not call it sit only in the card's own head table (rows `부르는 이름` and `부르지 않는 말`), so the index stays short for the model.
// A card is called when the raw query contains one of its names, the reverse of the row search above. The match ignores how the query was cut:
// commas, spaces and brackets are dropped between the characters of a name. Hangul and CJK names match as text; Latin names match whole words only,
// so a short name like "WKW" never fires inside another word.
// A multi-word name whose words are not written together still calls the card when every word is in the query, in any order, with at most one other word between them
// ("캘리포니아, 골든아워", "Gold Kodak 200"); words spread over the query ("a Kodak camera, a gold silk dress, ISO 200") call nothing.
// A name or do-not-call word with a negation right next to it (no Kodak Gold, Kodak Gold 말고, 不要...) is ignored.
// Called cards come out in the order their names first appear in the query, which decides the default card when two cards share an axis.
// A card that is not called but lists a query word as one it must not answer to is offered as a candidate with its summary.
const nameWords = (alias) => norm(alias).split(/[\s\-‐-―·・]+/).filter(Boolean);
const SEP_CHARS = '\\s\\-\\u2010-\\u2015\\u00b7\\u30fb,，、;；:：.。!！?？"\'“”‘’()（）\\[\\]【】「」『』/／';
const PUNCT = /[,，、;；:：.。!！?？"'“”‘’()（）[\]【】「」『』/／]+/g;
const strip = (s) => squash(s).replace(PUNCT, '');
const isLatin = (s) => /^[a-z0-9\s\-·.']+$/.test(norm(s));
const hasName = (name, raw, stripped) => {
  if (isLatin(name)) {
    const body = nameWords(name).map(escapeRe).join('[\\s\\-\\u00b7]*');
    return new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`).test(raw);
  }
  return stripped.includes(strip(name));
};
const spanRegexes = new Map();
function nameRegex(name) {
  if (!spanRegexes.has(name)) {
    const chars = [...strip(name)];
    spanRegexes.set(name, isLatin(name)
      ? new RegExp(`(?<![a-z0-9])${nameWords(name).map(escapeRe).join('[\\s\\-\\u00b7]*')}(?![a-z0-9])`, 'g')
      : chars.length ? new RegExp(chars.map(escapeRe).join(`[${SEP_CHARS}]*`), 'gu') : null);
  }
  return spanRegexes.get(name);
}
const spansOf = (name, text) => {
  const re = nameRegex(name);
  return re ? [...text.matchAll(re)].map((m) => ({ start: m.index, end: m.index + m[0].length })) : [];
};
const TOKEN = new RegExp(`[^${SEP_CHARS.replace('\\-\\u2010-\\u2015\\u00b7\\u30fb', '')}]+`, 'gu');
// The words of a multi-word name found as separate query words, in any order, with at most one other word inside the stretch they cover.
function scatteredSpan(name, text) {
  const words = norm(name).split(/\s+/).filter(Boolean);
  if (words.length < 2) return null;
  const tokens = [...text.matchAll(TOKEN)].map((m) => ({ s: squash(m[0]), start: m.index, end: m.index + m[0].length }));
  const slots = words.map((w) => tokens.flatMap((t, i) => ((isLatin(w) ? t.s === squash(w) : t.s.includes(squash(w))) ? [i] : [])));
  if (slots.some((found) => !found.length)) return null;
  let best = null;
  const walk = (k, picked) => {
    if (k === slots.length) {
      const lo = Math.min(...picked), hi = Math.max(...picked);
      if (hi - lo + 1 <= words.length + 1 && (!best || hi - lo < best.hi - best.lo)) best = { lo, hi };
      return;
    }
    for (const i of slots[k]) if (!picked.includes(i)) walk(k + 1, [...picked, i]);
  };
  walk(0, []);
  return best && { start: tokens[best.lo].start, end: tokens[best.hi].end };
}
// English negators come before the name, Korean and Japanese ones after it. Blanking a negated name lets the next word of the same phrase ("no Kodak Gold") count as negated too.
const NEG_BEFORE = /(?:(?<![\p{L}\p{N}])(?:no|not|without|never)|不要|不用|别用)\s*$/u;
const NEG_AFTER = /^\s*(?:말고|없이|빼고|제외|아닌|아니고|なし|無し|抜き)/u;
function maskNegated(text, looks) {
  const words = [...new Set(looks.flatMap((l) => [...l.names, ...l.avoid]))];
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (const w of words) {
      for (const { start, end } of spansOf(w, text)) {
        if (!NEG_BEFORE.test(text.slice(0, start)) && !NEG_AFTER.test(text.slice(end))) continue;
        text = text.slice(0, start) + ' '.repeat(end - start) + text.slice(end);
        changed = true;
      }
    }
    if (!changed) break;
  }
  return text;
}
// What a card says about how its look appears, for matching what a photo shows (rain, neon, a flash, a bench): the names, the do-not-call words, the index summary,
// the card's own medium, palette, time and light rows, and the 요청에 이 말이 있으면 cells of 갈래 고르기, in one string.
const cueText = (card, names, avoid, summary) => {
  const section = (key) => card.split(/^## /m).find((s) => s.startsWith(key)) ?? '';
  const facts = section('고정 사실').split('\n').filter((l) => /^\| (medium|palette|time|light-key) \|/.test(l)).map((l) => splitRow(l)[1]);
  const clues = section('갈래 고르기').split('\n').filter((l) => /^\| [A-Z]/.test(l)).map((l) => splitRow(l)[1]);
  const text = norm([...names, ...avoid, summary, ...facts, ...clues].join(' '));
  return { text, stripped: strip(text) };
};

export function loadLooks(dir = LOOKS_DIR) {
  const file = path.join(dir, 'index.md');
  if (!fs.existsSync(file)) return [];
  const looks = [];
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!/^\| /.test(line) || /^\| (slug|---)/.test(line)) continue;
    const cells = splitRow(line);
    if (cells.length !== 6) throw new Error(`looks/index.md: bad row: ${line.slice(0, 60)}`);
    const [slugCell, name, culture, branches, axis, summary] = cells;
    const slug = slugCell.replace(/^\[([^\]]+)\]\(\1\.md\)$/, '$1');
    if (!['매체', '장면'].includes(axis)) throw new Error(`looks/index.md: ${slug} axis must be 매체 or 장면: ${axis}`);
    if (!summary.trim()) throw new Error(`looks/index.md: ${slug} has no summary`);
    if (!fs.existsSync(path.join(dir, `${slug}.md`))) throw new Error(`looks/index.md: ${slug}.md is missing`);
    const card = fs.readFileSync(path.join(dir, `${slug}.md`), 'utf8');
    const title = (card.match(/^# (.+?)(?: — .*)?$/m) ?? [])[1] ?? slug;
    if (name !== title) throw new Error(`looks/index.md: ${slug} name ${name} is not the card title ${title}`);
    const meta = Object.fromEntries(card.split(/^## /m)[0].split('\n').filter((l) => /^\| /.test(l)).map(splitRow).filter((c) => c.length === 2));
    const names = list(meta['부르는 이름'] ?? ''), avoid = list(meta['부르지 않는 말'] ?? '');
    if (!names.length) throw new Error(`looks/${slug}.md: head table has no 부르는 이름 row`);
    looks.push({ slug, title, names, avoid, culture, branches, axis, summary, cues: cueText(card, names, avoid, summary), file: `references/image/looks/${slug}.md` });
  }
  return looks;
}

export function findLookCards(terms, dir = LOOKS_DIR) {
  const looks = loadLooks(dir);
  const raw = maskNegated(norm(terms.join(',')), looks);
  return looks.flatMap((look) => {
    const hits = look.names.flatMap((name) => {
      const span = spansOf(name, raw)[0] ?? scatteredSpan(name, raw);
      return span ? [{ name, ...span }] : [];
    });
    if (!hits.length) return [];
    const first = hits.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))[0];
    return [{ ...look, matched: first.name, at: first.start }];
  }).sort((a, b) => a.at - b.at);
}

const MAX_CANDIDATES = 6;
// Culture cues in a query, matched to the culture column of looks/index.md (KR CN JP US FR). Kana in the query also means JP.
const CULTURE_CUES = {
  KR: ['한국', '서울', '한강', '성수', '홍대', '한남', '이태원', '부산', '제주', 'Korea', 'Seoul'],
  JP: ['일본', '도쿄', '신주쿠', '오사카', '교토', '시부야', 'Japan', 'Tokyo'],
  CN: ['중국', '홍콩', '상하이', '베이징', 'China', 'Hong Kong', 'Shanghai'],
  US: ['미국', '뉴욕', '캘리포니아', 'LA', 'USA', 'New York', 'California'],
  FR: ['프랑스', '파리', 'France', 'Paris'],
};
const queryCultures = (raw, stripped) => new Set([
  ...Object.entries(CULTURE_CUES).filter(([, cues]) => cues.some((c) => hasName(c, raw, stripped))).map(([code]) => code),
  ...(/[\u3040-\u30ff]/.test(raw) ? ['JP'] : []),
]);
// Query words (filler, digits, era words and one-character words dropped) that appear in a card's do-not-call words, names or summary.
const queryWords = (terms) => [...new Set(terms.flatMap((t) => norm(t).split(PHRASE_BREAK)))]
  .filter((w) => w.length >= 2 && !/^\d+$/.test(w) && !FILLER_WORDS.has(w) && !ERA_WORD.test(w));
const wordHits = (look, words) => {
  const text = norm([...look.avoid, ...look.names, look.summary].join(' '));
  return words.filter((w) => (/^[a-z0-9'.-]+$/.test(w) ? hasWord(text, w) : text.includes(w))).length;
};
// The cues of a query: its comma terms, or its words when it has no comma. Words every card lists (photo, snap, person) cue nothing.
const GENERIC_CUES = new Set(['사진', '스냅', '인물', '이미지', '장면', 'photo', 'image', 'picture', 'snapshot', 'snap']);
const queryCues = (text) => {
  const terms = text.split(/[,，、]/).map((t) => t.trim()).filter(Boolean);
  return [...new Set(terms.length > 1 ? terms : text.trim().split(/\s+/))]
    .filter((c) => squash(c).length >= 2 && !/^\d+$/.test(c) && !FILLER_WORDS.has(c) && !ERA_WORD.test(c) && !GENERIC_CUES.has(c) && !/^[가-힣]는$/.test(c));
};
const cueHits = (look, cues) => cues.filter((c) => hasName(c, look.cues.text, look.cues.stripped));
// A card is offered when a query word is one of its do-not-call words (one is enough), or when two or more cues of the query are in what the card says about its look
// (비 오는 밤, 네온: a photo described by what it shows, not by the card's name). Candidates come out closest to the request first: a card of the culture the query points to,
// then more shared cues, then more query words in its words and summary, then index order. A card the query named and negated (no Kodak Gold) is not offered for shared cues.
// A card offered only for the same cues as a card above it (four cards on 네온, 우산) adds no reason and is dropped; a card with one more or other cue stays.
export function findLookCandidates(terms, called = [], dir = LOOKS_DIR) {
  const raw = norm(terms.join(','));
  const stripped = strip(raw);
  const looks = loadLooks(dir);
  const masked = maskNegated(raw, looks);
  const skip = new Set(called.map((c) => c.slug));
  const cultures = queryCultures(raw, stripped);
  const words = queryWords(terms);
  const cues = queryCues(masked);
  return looks
    .filter((look) => !skip.has(look.slug))
    .flatMap((look) => {
      const hits = look.avoid.filter((w) => spansOf(w, masked).length > 0);
      const shared = cueHits(look, cues);
      const negated = [...look.names, ...look.avoid].some((w) => spansOf(w, raw).length > 0 && spansOf(w, masked).length === 0);
      if (!hits.length && (negated || shared.length < 2)) return [];
      const inCulture = [...cultures].some((c) => look.culture.includes(c)) ? 1 : 0;
      return [{ ...look, matched: hits.length ? hits.sort((a, b) => b.length - a.length)[0] : shared.join(', '), avoidHit: hits.length > 0, cueList: shared, inCulture, shared: shared.length, hits: wordHits(look, words) }];
    })
    .map((c, i) => ({ ...c, i }))
    .sort((a, b) => b.inCulture - a.inCulture || b.shared - a.shared || b.hits - a.hits || a.i - b.i)
    .filter((c, k, all) => c.avoidHit || !all.slice(0, k).some((up) => up.cueList.join(',') === c.cueList.join(',')))
    .slice(0, MAX_CANDIDATES);
}

// Returns [{slug, title, matches:[row+score]}] with every match (sorted); callers cut to a limit or draw at random.
// `cards` are the look cards the query called (findLookCards); their matched names feed expandTerms.
export function search({ terms, layers = SLUGS, culture = null, dir = LEXICON_DIR, cards = [] }) {
  const picked = loadAll(dir).filter((l) => layers.includes(l.slug));
  const base = terms.map(norm).filter(Boolean);
  const cardWords = new Set(cards.flatMap((c) => nameWords(c.matched)));
  return picked.map(({ slug, title, rows }) => {
    const pool = rows.filter((r) => !culture || r.culture.includes(culture));
    const q = expandTerms(base, pool, cardWords, cards.length > 0);
    const matches = pool
      .map((r) => ({ ...r, score: scoreRow(r, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score);
    return { slug, title, matches };
  });
}

// Part-name rows (tag 부분) leave the layer lists and come back as one block of at most PART_LIMIT rows, best match first. The layer lists then hold only rows that can head a line.
// A row whose token or alias is one of the query terms prints whatever the limit (each named part must be called by its name, image-brief.md §2.1 rule 2); `more` counts the other rows left out.
export const PART_TAG = '부분';
export const PART_LIMIT = 4;
export function takeParts(results, limit = PART_LIMIT, terms = []) {
  const asked = new Set(terms.map(squash));
  const named = (m) => [m.token, ...m.aliases].some((name) => asked.has(squash(name)));
  const parts = [];
  const layers = results.map((l) => ({
    ...l,
    matches: l.matches.filter((m) => {
      if (!m.tags.includes(PART_TAG)) return true;
      parts.push({ ...m, layer: l.slug });
      return false;
    }),
  }));
  // Best score first, then one row per layer in turn, so a 한옥 query does not fill the block with scene rows and hide the 新中式 outfit parts.
  const queues = new Map();
  const exact = parts.filter(named);
  const rest = parts.filter((m) => !named(m));
  for (const m of rest.sort((a, b) => b.score - a.score)) queues.set(m.layer, [...(queues.get(m.layer) ?? []), m]);
  const room = Math.max(0, limit - exact.length);
  const turns = [];
  for (let i = 0; turns.length < Math.min(room, rest.length); i++) for (const q of queues.values()) if (q[i] && turns.length < room) turns.push(q[i]);
  return { layers, parts: [...exact, ...turns], more: rest.length - turns.length };
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

// Two ways to read a called card, one line each: for writing a new image (outline, then the branch with its set and pair) and for extracting a prompt from a photo (facts, then the branch without pairs).
const cardBlock = (cards) => (cards.length
  ? `## Look card\n${cards.map((c) => `${c.title} [${c.axis}] — ${c.file}\nnew image: node scripts/read_look.mjs ${c.slug} --outline, then --branch <A|B|C|D> [--set S<n>] [--pair <n>]\nextract: node scripts/read_look.mjs ${c.slug} --facts, then --branch <A|B|C|D> --no-pairs`).join('\n')}\n(Read the card before the layer rows below. Use a scene set only when the request names its place or prop, not a city or a kind of place alone; the request beats the card. No shell: open the card file. New image: in the same message as read_look --outline, run node scripts/read_refs.mjs "references/image/image-brief.md#룩 카드" once. Extraction: image-brief §12.0.)\n\n`
  : '');

const candidateBlock = (candidates, called) => (candidates.length
  ? `## Look card candidates\n(${called ? 'a card was named above, so read a candidate only as its second card.' : 'no card was named; if the request names no medium or look (a place name alone), write without a card.'} New image: read the first whose summary fits with \`node scripts/read_look.mjs <slug> --outline\` and, in the same message, \`node scripts/read_refs.mjs "references/image/image-brief.md#룩 카드"\` once; if none fits, write without a card. Photo extraction: a candidate is only a suggestion; check it with \`--facts\` only when the photo shows that medium's marks (image-brief §12.0), otherwise write without a card. [매체] cards name a film or camera, [장면] cards a place.)\n${candidates.map((c) => `- ${c.slug} · ${c.title} [${c.axis}, ${c.culture}] — ${c.summary}`).join('\n')}\n\n`
  : '');

// --limit above 6 is the long listing, so the hint asks for at least 7.
const partBlock = (parts, more = 0) => (parts.length
  ? `## 문장 속 낱말\n(part names: use inside the English sentence, not as a line head.)\n${parts.map((m) => `${m.token} — ${m.looks} [${m.culture.join(', ')}]`).join('\n')}\n${more ? `(+${more} more: --limit ${Math.max(7, parts.length + more)})\n` : ''}`
  : '');

// Rows are candidates for one image: the author picks the one that fits (image-brief.md slot table), so the prompt never carries the other rows or a choose-one line.
export const ROWS_ARE_CANDIDATES = '(layer rows are candidates: for one image pick the row that fits and write it; leave the other candidates and any "choose one" wording out of the prompt.)';

export function formatText(results, cards = [], candidates = [], { aliases = false } = {}, parts = [], more = 0) {
  const head = cardBlock(cards) + candidateBlock(candidates, cards.length > 0);
  if (results.every((l) => l.matches.length === 0) && !parts.length) {
    if (cards.length) return `${head}no layer rows matched; the card above carries the look.\n`;
    return `${head}no match in any layer. Use English tokens and sentences: original-language words come only from the lexicon, a look card, fixed-lines.md or the user (image-brief.md §2.1).\n`;
  }
  const layers = `${ROWS_ARE_CANDIDATES}\n` + results.map((l) => {
    const body = l.matches.length
      ? l.matches.map((m) => `${m.token} — ${m.looks}${aliases && m.aliases.length ? ` (${m.aliases.slice(0, 4).join(', ')})` : ''} [${m.kind}${m.tags.includes('소품 필요') ? ', 소품 필요' : ''}]`).join('\n')
      : 'no match';
    return `## ${l.title}\n${body}\n`;
  }).join('\n');
  return head + layers + (parts.length ? `\n${partBlock(parts, more)}` : '');
}

export function formatJson(results, terms, cards = [], candidates = [], parts = [], more = 0) {
  const layers = {};
  for (const l of results) {
    layers[l.slug] = l.matches.map(({ token, aliases, culture, tags, looks, kind, score }) => ({ token, aliases, culture, tags, looks, kind, score }));
  }
  return {
    query: terms,
    looks: cards.map(({ slug, title, axis, file, matched }) => ({ slug, title, axis, file, matched })),
    candidates: candidates.map(({ slug, title, axis, summary, file, matched }) => ({ slug, title, axis, summary, file, matched })),
    layers,
    words: parts.map(({ token, aliases, culture, tags, looks, kind, score, layer }) => ({ layer, token, aliases, culture, tags, looks, kind, score })),
    words_more: more,
  };
}

function parseArgs(argv) {
  const opts = { q: null, layers: SLUGS, culture: null, limit: 6, json: false, aliases: false, random: 0 };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--json') { opts.json = true; continue; }
    if (flag === '--aliases') { opts.aliases = true; continue; }
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
    const cards = findLookCards(opts.terms);
    let results = search({ ...opts, cards });
    let parts = [];
    let more = 0;
    if (opts.random) results = drawRandom(results, opts.random);
    else {
      // The block is short by default; a --limit above 6 asks for a long listing and gets as many parts.
      ({ layers: results, parts, more } = takeParts(results, opts.limit > 6 ? opts.limit : Math.min(opts.limit, PART_LIMIT), opts.terms));
      results = results.map((l) => ({ ...l, matches: l.matches.slice(0, opts.limit) }));
    }
    const candidates = findLookCandidates(opts.terms, cards);
    process.stdout.write(opts.json ? JSON.stringify(formatJson(results, opts.terms, cards, candidates, parts, more)) + '\n' : formatText(results, cards, candidates, opts, parts, more));
  } catch (error) {
    console.error(`find_tokens: ${error.message}`);
    process.exitCode = 2;
  }
}
