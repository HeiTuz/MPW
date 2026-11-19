#!/usr/bin/env node
// Merge extracted lexicon rows (JSON arrays) into the per-layer lexicon tables.
// usage: node scripts/build_lexicon.mjs <rows-dir> [--out <dir>] [--overrides <file>] [--index <file>] [--dry]
// Pipeline: normalize -> validate -> exclusion filter -> overrides (drop, patch) -> merge by token+layer -> write.
// Source JSON never enters the repo; re-running reproduces every file from <rows-dir> + the overrides file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const LAYERS = [
  ['Optics', 'optics'], ['Light', 'light'], ['Pose', 'pose'], ['Outfit', 'outfit'], ['Legwear', 'legwear'],
  ['Style', 'style'], ['Hair and makeup', 'hair-makeup'], ['Expression', 'expression'],
  ['Props and nails', 'props-nails'], ['Scene', 'scene'],
];
export const CULTURES = ['KR', 'CN', 'JP', 'US', 'FR'];
const LANGS = new Set(['ko', 'zh', 'ja', 'en', 'fr']);
const KINDS = new Set(['look', 'place', 'item', 'gear', 'brand', 'person-style']);
const LAYER_SLUG = new Map(LAYERS);
const LANG_CULTURE = { ko: 'KR', zh: 'CN', ja: 'JP', fr: 'FR' };
const MAX_ALIASES = 12;
const MAX_TAGS = 8;
export const HEAD = ['토큰', '별칭', '문화권', '태그', '화면에 보이는 모습', '종류'];

// Exclusion categories (user decision 2026-11-19): minor-evoking, sexualized vocabulary, body-part emphasis.
const EXCLUDE_TOKEN = new RegExp([
  '교복', '制服', '校服', '学生服', '女子高', 'セーラー服', 'ブルマ', '体操服', 'ランドセル', 'school ?girl', 'school uniform',
  'ロリ', 'lolita', '萝莉', '페티시', 'fetish', '絶対領域', '绝对领域', '性感', '情趣', '诱惑', 'セクシー', '섹시',
  'lingerie', 'garter ?belt', 'ガーターベルト', 'ガーターストッキング', '가터',
].join('|'), 'iu');
const EXCLUDE_LOOK = new RegExp([
  'fetish', 'seductive', 'erotic', 'sensual', 'provocative', 'sexy', 'lingerie', 'cleavage', 'nipple', 'buttock', 'crotch',
  'bondage', 'school ?girl', 'school uniform', 'lolita',
  '(?:bare|exposed|naked)[^.]{0,24}thigh', 'thigh[^.]{0,24}(?:exposed|bare skin|gap)',
].join('|'), 'iu');

// μ (Greek) is spelled mju: lint rejects lookalike letters.
const clean = (s) => String(s ?? '').normalize('NFC').replace(/μ/g, 'mju').replace(/[`\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
const key = (s) => s.normalize('NFKC').toLowerCase();
const uniq = (list, skip = '') => {
  const seen = new Set(skip ? [key(skip)] : []);
  const out = [];
  for (const v of list) { const k = key(v); if (v && !seen.has(k)) { seen.add(k); out.push(v); } }
  return out;
};
const strings = (v) => (Array.isArray(v) ? v : []).filter((x) => typeof x === 'string').map(clean).filter(Boolean);

function normalizeRow(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'not-object' };
  if (typeof raw.token !== 'string' || typeof raw.looks_like !== 'string') return { error: 'missing-text' };
  const row = {
    token: clean(raw.token),
    lang: clean(raw.lang), layer: clean(raw.layer), culture: clean(raw.culture).toUpperCase(), kind: clean(raw.kind),
    aliases: strings(raw.aliases), tags: strings(raw.tags), looks_like: clean(raw.looks_like),
  };
  if (!row.token || row.token.length > 40) return { error: 'bad-token' };
  if (/[.。?？]$/u.test(row.token) || row.token.split(" ").length > 5) return { error: 'sentence-token' };
  if (!LAYER_SLUG.has(row.layer)) return { error: 'bad-layer' };
  if (!LANGS.has(row.lang)) return { error: 'bad-lang' };
  if (!CULTURES.includes(row.culture)) return { error: 'bad-culture' };
  if (!KINDS.has(row.kind)) return { error: 'bad-kind' };
  if (row.looks_like.length < 12) return { error: 'empty-looks' };
  return { row };
}

function excluded(row) {
  const names = [row.token, ...row.aliases, ...row.tags].join(' ');
  return EXCLUDE_TOKEN.test(names) || EXCLUDE_LOOK.test(row.looks_like);
}

export function applyOverrides(rows, overrides) {
  const stale = [];
  const match = (row, o) => key(row.token) === key(o.token) && (!o.layer || row.layer === o.layer);
  // drop entries: {layer?, tokens: [...], why} (one reason per group) or a single {token, layer?}.
  const drops = (overrides.drop ?? []).flatMap((d) => (d.tokens ?? [d.token]).map((token) => ({ token, layer: d.layer })));
  let dropped = 0;
  for (const d of drops) {
    const before = rows.length;
    rows = rows.filter((row) => !match(row, d));
    if (rows.length === before) stale.push(`drop ${d.token}`);
    dropped += before - rows.length;
  }
  for (const p of overrides.patch ?? []) {
    let hit = 0;
    for (const row of rows) {
      if (!match(row, p)) continue;
      hit++;
      const set = p.set ?? {};
      for (const f of ['token', 'layer', 'lang', 'culture', 'kind', 'looks_like']) if (set[f] !== undefined) row[f] = set[f];
      if (set.remove_aliases) row.aliases = row.aliases.filter((a) => !set.remove_aliases.some((r) => key(r) === key(a)));
      if (set.aliases) row.aliases = uniq([...row.aliases, ...set.aliases]);
      if (set.tags) row.tags = uniq([...row.tags, ...set.tags]);
    }
    if (!hit) stale.push(`patch ${p.token}`);
  }
  const added = [];
  for (const raw of overrides.add ?? []) {
    const { row, error } = normalizeRow(raw);
    if (error) stale.push(`add ${raw.token}: ${error}`);
    else added.push(row);
  }
  return { rows: [...rows, ...added], dropped, stale };
}

export function mergeRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const k = `${row.layer}\u0000${key(row.token)}`;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(row);
  }
  const merged = [];
  for (const list of groups.values()) {
    const first = list[0];
    const cult = new Map();
    for (const r of list) cult.set(r.culture, (cult.get(r.culture) ?? 0) + 1);
    const best = list.reduce((a, b) => (b.looks_like.length > a.looks_like.length ? b : a));
    // The source track is not always the token's own culture (a Korean track can carry Chinese tokens): CJK/French tokens file under their own culture.
    const own = LANG_CULTURE[best.lang];
    if (own) cult.set(own, (cult.get(own) ?? 0) + 1000);
    const cultures = [...cult.keys()].sort((a, b) => CULTURES.indexOf(a) - CULTURES.indexOf(b));
    const primary = [...cult.entries()].sort((a, b) => b[1] - a[1] || CULTURES.indexOf(a[0]) - CULTURES.indexOf(b[0]))[0][0];
    const kindCount = new Map();
    for (const r of list) kindCount.set(r.kind, (kindCount.get(r.kind) ?? 0) + 1);
    merged.push({
      token: first.token, lang: best.lang, layer: first.layer, culture: cultures, primary,
      kind: [...kindCount.entries()].sort((a, b) => b[1] - a[1])[0][0],
      aliases: uniq(list.flatMap((r) => r.aliases), first.token).slice(0, MAX_ALIASES),
      tags: uniq(list.flatMap((r) => r.tags)).slice(0, MAX_TAGS),
      looks_like: best.looks_like,
    });
  }
  return merged;
}

const cell = (s) => s.replace(/\|/g, '\\|');
export const rowLine = (r) => `| ${[r.token, r.aliases.join('; '), r.culture.join(', '), r.tags.join('; '), r.looks_like, r.kind].map(cell).join(' | ')} |`;

export function renderLayer(layer, rows) {
  const out = [
    `# ${layer} 토큰`, '',
    `${layer} 층에서 쓰는 원어 토큰 사전이다. 한 줄이 한 토큰이다. 문화권 절(\`## KR\` 등)로 나뉘고 사용법은 [layer-lexicon.md](../layer-lexicon.md)에 있다.`,
  ];
  for (const culture of CULTURES) {
    const part = rows.filter((r) => r.primary === culture)
      .sort((a, b) => a.kind.localeCompare(b.kind) || a.token.localeCompare(b.token, 'en'));
    if (!part.length) continue;
    out.push('', `## ${culture}`, '', `| ${HEAD.join(' | ')} |`, `|${HEAD.map(() => '---').join('|')}|`, ...part.map(rowLine));
  }
  return out.join('\n') + '\n';
}

export function build(inputDir, { overrides = {} } = {}) {
  const report = { files: 0, input_rows: 0, malformed: {}, excluded: 0, dropped_by_override: 0, stale_overrides: [], merged_from: 0, rows: 0 };
  let rows = [];
  for (const f of fs.readdirSync(inputDir).filter((n) => n.endsWith('.json')).sort()) {
    report.files++;
    const data = JSON.parse(fs.readFileSync(path.join(inputDir, f), 'utf8'));
    for (const raw of Array.isArray(data) ? data : data.rows ?? []) {
      report.input_rows++;
      const { row, error } = normalizeRow(raw);
      if (error) { report.malformed[error] = (report.malformed[error] ?? 0) + 1; continue; }
      if (excluded(row)) { report.excluded++; continue; }
      rows.push(row);
    }
  }
  const applied = applyOverrides(rows, overrides);
  report.dropped_by_override = applied.dropped;
  report.stale_overrides = applied.stale;
  report.merged_from = applied.rows.length;
  const merged = mergeRows(applied.rows);
  report.rows = merged.length;
  return { merged, report };
}

function countsBlock(merged) {
  const lines = [`| 층 | 파일 | 행 수 | ${CULTURES.join(' | ')} |`, `|---|---|---|${CULTURES.map(() => '---').join('|')}|`];
  for (const [layer, slug] of LAYERS) {
    const rows = merged.filter((r) => r.layer === layer);
    lines.push(`| ${layer} | [lexicon/${slug}.md](lexicon/${slug}.md) | ${rows.length} | ${CULTURES.map((c) => rows.filter((r) => r.primary === c).length).join(' | ')} |`);
  }
  return lines.join('\n');
}

function main(argv) {
  const args = argv.slice(2);
  const opt = (name, dflt) => { const i = args.indexOf(name); return i < 0 ? dflt : args.splice(i, 2)[1]; };
  const dry = args.includes('--dry');
  if (dry) args.splice(args.indexOf('--dry'), 1);
  const outDir = path.resolve(root, opt('--out', 'references/image/lexicon'));
  const overridesFile = path.resolve(root, opt('--overrides', 'scripts/lexicon_overrides.json'));
  const indexFile = path.resolve(root, opt('--index', 'references/image/layer-lexicon.md'));
  const inputDir = args[0];
  if (!inputDir || !fs.existsSync(inputDir)) {
    console.error('usage: build_lexicon.mjs <rows-dir> [--out dir] [--overrides file] [--index file] [--dry]');
    process.exit(2);
  }
  const overrides = fs.existsSync(overridesFile) ? JSON.parse(fs.readFileSync(overridesFile, 'utf8')) : {};
  const { merged, report } = build(path.resolve(inputDir), { overrides });
  report.by_layer = {}; report.by_lang = {}; report.by_kind = {}; report.bytes = {};
  for (const r of merged) {
    report.by_layer[r.layer] = (report.by_layer[r.layer] ?? 0) + 1;
    report.by_lang[r.lang] = (report.by_lang[r.lang] ?? 0) + 1;
    report.by_kind[r.kind] = (report.by_kind[r.kind] ?? 0) + 1;
  }
  if (!dry) {
    fs.mkdirSync(outDir, { recursive: true });
    for (const [layer, slug] of LAYERS) {
      const text = renderLayer(layer, merged.filter((r) => r.layer === layer));
      fs.writeFileSync(path.join(outDir, `${slug}.md`), text);
      report.bytes[slug] = Buffer.byteLength(text);
    }
    if (fs.existsSync(indexFile)) {
      const src = fs.readFileSync(indexFile, 'utf8');
      const re = /(<!-- lexicon-counts:start -->\n)[\s\S]*?(<!-- lexicon-counts:end -->)/;
      if (re.test(src)) fs.writeFileSync(indexFile, src.replace(re, `$1${countsBlock(merged)}\n$2`));
    }
  }
  console.log(JSON.stringify(report, null, 1));
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) main(process.argv);
