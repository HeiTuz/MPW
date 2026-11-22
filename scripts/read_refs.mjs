#!/usr/bin/env node
// Print only the requested Markdown sections so one call can load several
// reference sections instead of whole files.
//
//   node scripts/read_refs.mjs references/image/surfaces.md#0 references/image/surface-contracts.md#3.2
//   node scripts/read_refs.mjs "references/templates/common.md#기준 원문과 누적 수정"
//   node scripts/read_refs.mjs "references/model-playbooks.md#역할·권한 라우팅~Surface-matched evidence"
//   node scripts/read_refs.mjs --toc references/image/lanes.md
//   node scripts/read_refs.mjs --bundle gpt-image-portrait references/image/from-image.md#1
//   node scripts/read_refs.mjs --bundles
//   node scripts/read_refs.mjs --bundle gpt-image-portrait --part 1/5
//
// A section runs from its heading to the next heading of the same or higher
// level. "#A,B" reads several sections, "#A~B" reads from A through the end of B,
// and a path without "#" prints the whole file. Repeated/overlapping requests
// emit each source line once, in first-request order, with source line ranges
// on any remaining fragments. Relative paths resolve against
// the skill root first, then the current directory.
//
// "--bundle <name>" expands to the ready-made target list below, so the common
// starting sets in SKILL.md need no hand-copied, shell-quoted arguments. Extra
// targets after a bundle are read in order. "--bundles" lists every bundle with
// its targets and current character count. BUNDLES is the only definition of
// these sets; SKILL.md refers to them by name.
//
// "--part n/m" prints only the n-th of m pieces of the output, cut at section
// boundaries (a long section may be cut between its subsections, and the cut
// piece gets its own "==>" line with its line range) so the pieces have about
// the same size. The first line says
// "part n of m, next: <command>", so a long bundle can be read piece by piece
// when one tool output cannot hold it.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 고정 몫 파일에서 기본으로 읽는 범위: 머리말~입력 용도별(맨 끝 '한국어 문안'은 프롬프트 언어가 한국어일 때만 따로 읽는다).
const FIXED_LINES = "references/image/fixed-lines.md#고정 몫: 층마다 늘 붙는 줄~입력 용도별로 붙는 것";
// 사진 추출은 Camera 절(프레이밍·렌즈 고정 줄)을 뺀다. 추출은 '입력 용도별' 표대로 사진의 비율·잘린 자리·렌즈를 쓴다.
const FIXED_LINES_EXTRACT = "references/image/fixed-lines.md#고정 몫: 층마다 늘 붙는 줄~Optics,Finish~입력 용도별로 붙는 것";
// 층별 토큰 사전 색인에서 사용법, 그 1항이 가리키는 층별 파일 표, 문화권 룩 묶음만 읽는다. 대표 토큰 표는 파일에 남아 있고 셸이 없을 때 직접 읽는다.
const LEXICON_INDEX = "references/image/layer-lexicon.md#사용법~문화권 룩 묶음";

export const BUNDLES = {
  // 대상 미정·GPT Image 새 이미지. 작성 규칙은 image-brief.md(§1~§7·§9~§11, 예시는 인물 없는 장면 §10.2), 층마다 붙는 고정 몫 fixed-lines.md, 층별 사전 색인(사용법·문화권 룩 묶음). 도해·슬라이드·UI·만화·로고는 -structured.
  "gpt-image-new": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2,3,4,5,6,7,9,10.0,10.2,11", FIXED_LINES, LEXICON_INDEX],
  "gpt-image-new-structured": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2,3,4,5,6,7,9,10.0,10.2,11", LEXICON_INDEX, "references/image/surface-contracts.md#3.4"],
  // 대상 미정·GPT Image 인물·셀피·패션 화보 새 이미지(예시는 인물 §10.1). 층 사전은 색인(layer-lexicon.md의 사용법·문화권 룩 묶음)만 읽는다. 층별 표는 find_tokens.mjs나 lexicon/ 절 읽기로 따로 찾는다. compiler.md 피부·재질은 GPT Image 새 이미지에 적용하지 않으므로 이 묶음에 넣지 않는다.
  "gpt-image-portrait": [
    "references/image/surfaces.md#0",
    "references/image/image-brief.md#1,2,3,4,5,6,7,9,10.0,10.1,11",
    "references/image/editorial/portrait-brief.md",
    FIXED_LINES,
    LEXICON_INDEX,
  ],
  // 대상 미정·GPT Image 원본 편집(image-brief §1·§2.1·§6~§9 + 편집 패턴 §3.3). 참조 사진의 역할·관찰이 필요하면 from-image.md#1을 덧붙인다.
  "gpt-image-edit": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2.1,6,7,8,9", "references/image/surface-contracts.md#3.3"],
  "gpt-image-edit-structured": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2.1,6,7,8,9", "references/image/surface-contracts.md#3.3,3.4"],
  // 대상 미정·GPT Image로 사진(첨부 이미지)을 보고 그 사진을 다시 만들 프롬프트를 쓸 때. 새 이미지 규칙에 §12 추출 규칙(매체 판별, 카드 대조, 원어 이름, 본보기)을 얹는다(§7 후속 수정·§8 편집·§10 예시·§11 정제는 뺀다).
  // §4는 '룩 카드' 하위 절(세트·쌍·여러 장 규칙)을 빼고 읽는다. 추출의 카드 절차는 §12.0이 자족하게 갖고, 카드 목록은 색인 파일 대신 read_look.mjs --list로 필요할 때만 읽는다.
  "gpt-image-extract": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2,3,사용자가 준 것~토큰 찾기,비워 둔 층~문장 쓰는 법,5,6,9,12", FIXED_LINES_EXTRACT, LEXICON_INDEX],
  // 영상 생성.
  video: ["references/image/surfaces.md#0", "references/image/lanes.md#영상 공통 규칙,이미지 슬롯 기본값"],
  // 실행 작업·자동화 지시.
  delegation: ["references/templates/delegation.md"],
  // 팀 작업 지시: 위임 계약 + TEAM 골격 + 역할·권한 라우팅.
  team: [
    "references/templates/delegation.md",
    "references/templates/team.md",
    "references/model-playbooks.md#역할·권한 라우팅~Surface-matched evidence",
  ],
  // 묶음 밖의 판단: 읽기 지도 표를 읽고 그 행의 절만 이어 읽는다.
  map: ["references/reading-map.md"],
  // 요청한 판단에만 읽기 범위를 맞춘다. 목록 처리는 필요한 묶음에 덧붙인다.
  research: ["references/templates/model.md#리서치", "references/research.md"],
  extraction: ["references/templates/model.md#추출·분류"],
  batch: ["references/templates/model.md#목록·일괄 처리"],
  // 텍스트 모델 적응·변환. 색인이 가리키는 공급자의 날짜 절을 덧붙인다.
  "text-model-adapt": ["references/model-playbooks.md#공통 적응 규칙,공급자 색인"],
  // 이미지·영상 프롬프트의 엔진 간 변환. §6 색인이 가리키는 엔진 어댑터 절을 덧붙인다.
  "image-prompt-conversion": ["references/image/prompt-conversion.md", "references/image/engine-levers.md", "references/image/model-routing.md#6"],
  // 다른 엔진(Seedream·Nano Banana·Midjourney·Soul)을 지정한 새 이미지. 층 문안은 gpt-image-new 묶음과 같은 규칙으로 먼저 쓰고 engine-levers.md로 그 엔진에 편다. 그 엔진 어댑터는 묶음에 실린 model-routing §6 색인이 가리키는 문서로 덧붙인다.
  "image-other-engine": ["references/image/surfaces.md#0", "references/image/image-brief.md#1,2,3,4,5,6,9,11", FIXED_LINES, LEXICON_INDEX, "references/image/engine-levers.md", "references/image/model-routing.md#6"],
};

export function parseHeadings(text) {
  const lines = text.split("\n");
  const headings = [];
  let fence = null;
  lines.forEach((line, index) => {
    // Parse CRLF like LF without rewriting the returned source lines/body.
    line = line.replace(/\r$/, "");
    const fenceMatch = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (fence !== null) {
      if (fenceMatch && fenceMatch[1][0] === fence[0] &&
          fenceMatch[1].length >= fence.length && /^[ \t]*$/.test(fenceMatch[2])) fence = null;
      return;
    }
    if (fenceMatch && !(fenceMatch[1][0] === "`" && fenceMatch[2].includes("`"))) {
      fence = fenceMatch[1];
      return;
    }
    const match = line.match(/^(#{1,6})\s+(.*?)\s*#*\s*$/);
    if (match) headings.push({ level: match[1].length, title: match[2], line: index });
  });
  return { lines, headings };
}

// Keys match case-insensitively; hyphens and spaces are interchangeable so an
// anchor-style "역할·권한-라우팅" still finds "역할·권한 라우팅". Numbered keys
// ("0-1", "3.2") are matched on the raw title before this normalization.
function normalize(value) {
  return value.replace(/^§/, "").replace(/`/g, "").trim().toLowerCase().replace(/[-\s]+/g, " ");
}

function rawKey(value) {
  return value.replace(/^§/, "").replace(/`/g, "").trim().toLowerCase();
}

// "3" matches "3. S3 — ..." but not "3.1 ..."; "0" does not match "0-1. ...".
function numberedKeyMatches(title, key) {
  if (!/^[0-9]/.test(key)) return false;
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}(?:\\.(?![0-9])|\\s|$)`).test(title);
}

export function findHeading(headings, rawKeyInput) {
  const numbered = rawKey(rawKeyInput);
  if (/^[0-9]+(?:[.-][0-9]+)*$/.test(numbered)) {
    return headings.findIndex((heading) => numberedKeyMatches(rawKey(heading.title), numbered));
  }
  const key = normalize(rawKeyInput);
  if (!key) return -1;
  const titles = headings.map((heading) => normalize(heading.title));
  const tests = [
    (title) => title === key,
    (title) => title.startsWith(key),
    (title) => title.includes(key),
  ];
  for (const test of tests) {
    const index = titles.findIndex(test);
    if (index !== -1) return index;
  }
  return -1;
}

function sectionEnd(headings, index, lineCount) {
  const { level } = headings[index];
  const next = headings.slice(index + 1).find((heading) => heading.level <= level);
  return next ? next.line : lineCount;
}

function sectionRange({ lines, headings }, spec) {
  const [startKey, endKey] = spec.split("~");
  const startIndex = findHeading(headings, startKey);
  if (startIndex === -1) return { error: `section not found: §${startKey.trim()}` };
  let endIndex = startIndex;
  if (endKey !== undefined) {
    endIndex = findHeading(headings, endKey);
    if (endIndex === -1) return { error: `section not found: §${endKey.trim()}` };
    if (endIndex < startIndex) return { error: `range ends before it starts: §${spec}` };
  }
  const from = headings[startIndex].line;
  const to = sectionEnd(headings, endIndex, lines.length);
  return { from: from + 1, to };
}

export function extractSection(text, spec) {
  const parsed = parseHeadings(text);
  const section = sectionRange(parsed, spec);
  if (section.error) return section;
  return { ...section, body: parsed.lines.slice(section.from - 1, section.to).join("\n").replace(/\s+$/, "") };
}

function resolvePath(file) {
  if (path.isAbsolute(file)) return file;
  const fromSkill = path.join(skillRoot, file);
  return fs.existsSync(fromSkill) ? fromSkill : file;
}

function tableOfContents(text) {
  const { lines, headings } = parseHeadings(text);
  return headings
    .map((heading, index) => {
      const size = sectionEnd(headings, index, lines.length) - heading.line;
      return `${"  ".repeat(heading.level - 1)}${heading.title}  (L${heading.line + 1}, ${size} lines)`;
    })
    .join("\n");
}

// Expand "--bundle <name>" / "--bundle=<name>" in place, keeping other targets in order.
export function expandBundles(argv) {
  const targets = [];
  const unknown = [];
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    let name = null;
    if (arg === "--bundle") {
      index += 1;
      name = argv[index] ?? "";
    } else if (arg.startsWith("--bundle=")) {
      name = arg.slice("--bundle=".length);
    }
    if (name === null) {
      targets.push(arg);
      continue;
    }
    if (Object.hasOwn(BUNDLES, name)) targets.push(...BUNDLES[name]);
    else unknown.push(name);
  }
  return { targets, unknown };
}

const readSource = (file) => fs.readFileSync(resolvePath(file), "utf8");

// One stream powers both the fail-fast API and the CLI's continue-on-error
// behavior. Cache parsing and source coverage for this call only. With the
// filesystem reader, aliases/symlinks share coverage; injected readers retain
// their own filename namespace.
function* targetChunks(targets, read, toc = false) {
  const sources = new Map();
  for (const target of targets) {
    const hash = target.indexOf("#");
    const file = hash === -1 ? target : target.slice(0, hash);
    const specs = hash === -1 ? [] : target.slice(hash + 1).split(",").filter((spec) => spec.trim());
    let source;
    try {
      const key = read === readSource ? fs.realpathSync(resolvePath(file)) : file;
      if (!sources.has(key)) {
        try {
          const text = read(file);
          const parsed = parseHeadings(text);
          sources.set(key, { text, ...parsed, seen: new Uint8Array(parsed.lines.length) });
        } catch {
          sources.set(key, { error: `cannot read ${file}` });
        }
      }
      source = sources.get(key);
    } catch {
      source = { error: `cannot read ${file}` };
    }
    if (source.error) {
      yield { error: source.error };
      continue;
    }
    if (toc) {
      if (!source.tocPrinted) {
        const chunk = `==> ${file} (toc)\n${tableOfContents(source.text)}\n`;
        const lines = chunk.split("\n");
        yield { chunk, lines, from: 0, to: lines.length, cuts: [] };
      }
      source.tocPrinted = true;
      continue;
    }
    for (const spec of specs.length ? specs : [null]) {
      const section = spec === null ? { from: 1, to: source.lines.length } : sectionRange(source, spec);
      if (section.error) {
        yield { error: `${file}: ${section.error}`, toc: tableOfContents(source.text) };
        continue;
      }
      // Subtract earlier selections rather than merging/reordering requests.
      // A child requested before its parent therefore keeps its original place.
      let line = section.from - 1;
      while (line < section.to) {
        if (source.seen[line]) { line += 1; continue; }
        const start = line;
        while (line < section.to && !source.seen[line]) source.seen[line++] = 1;
        const body = source.lines.slice(start, line).join("\n").replace(/\s+$/, "");
        const fullFile = spec === null && start === 0 && line === source.lines.length;
        const label = spec === null ? "" : ` §${spec.trim()}`;
        const range = fullFile ? "" : ` (L${start + 1}-${line})`;
        const cuts = source.headings.map((heading) => heading.line).filter((at) => at > start && at < line);
        yield { chunk: `==> ${file}${label}${range}\n${body}\n`, file, label, from: start, to: line, lines: source.lines, cuts };
      }
    }
  }
}

// Read targets with shared source/coverage caches; return text or the first error.
export function readTargets(targets, read = readSource) {
  const chunks = [];
  for (const result of targetChunks(targets, read)) {
    if (result.error) return { error: result.error };
    chunks.push(result.chunk);
  }
  return { text: chunks.join("\n") };
}

// One tool output holds about 24,000 bytes on the hosts tried (a 31 KB part was cut and saved to a file; a Korean character is 3 bytes), so --bundles says how many --part pieces a bundle needs.
export const PART_LIMIT_BYTES = 24000;
// Parts are planned 5% under the limit so a part near it is not cut by the host.
export const PART_TARGET_BYTES = Math.floor(PART_LIMIT_BYTES * 0.95);

export function partsNeeded(results, limit = PART_TARGET_BYTES) {
  const pieces = results.reduce((count, result) => count + result.cuts.length + 1, 0);
  for (let m = 1; m <= pieces; m += 1) {
    if (cutParts(results, m).every((part) => Buffer.byteLength(part.join("\n")) <= limit)) return m;
  }
  return Math.max(pieces, 1);
}

// For --part a chunk may be cut at the headings inside it, so one long section (image-brief §12) does not fill a part alone.
// Pieces of one chunk that land in the same part are joined back, so a cut adds a "==>" line only where a part ends.
export function cutParts(results, m) {
  const pieces = results.flatMap((result) => {
    const edges = [result.from, ...result.cuts, result.to];
    return edges.slice(1).map((to, index) => ({ result, from: edges[index], to }));
  });
  const owner = partitionChunks(pieces.map(({ result, from, to }) => result.lines.slice(from, to).join("\n")), m);
  const parts = Array.from({ length: m }, () => []);
  pieces.forEach((piece, index) => {
    const part = parts[owner[index]];
    const last = part.at(-1);
    if (last && last.result === piece.result) last.to = piece.to;
    else part.push({ ...piece });
  });
  return parts.map((part) => part.map(({ result, from, to }) => {
    if (from === result.from && to === result.to) return result.chunk;
    const body = result.lines.slice(from, to).join("\n").replace(/\s+$/, "");
    return `==> ${result.file}${result.label} (L${from + 1}-${to})\n${body}\n`;
  }));
}

function listBundles() {
  return Object.entries(BUNDLES)
    .map(([name, targets]) => {
      const chunks = [];
      let error = null;
      for (const result of targetChunks(targets, readSource)) {
        if (result.error) error = result.error;
        else chunks.push(result);
      }
      const text = chunks.map((result) => result.chunk).join("\n");
      const parts = partsNeeded(chunks);
      const size = error ? `error: ${error}` : `${[...text].length} chars, ${Buffer.byteLength(text)} bytes${parts > 1 ? `, read in ${parts} parts: --part 1/${parts}` : ""}`;
      return `${name}  (${size})\n${targets.map((target) => `  ${target}`).join("\n")}`;
    })
    .join("\n");
}

// "--part n/m" (or "--part=n/m") leaves argv and is returned apart from the other arguments.
export function parsePart(argv) {
  const rest = [];
  let part = null;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    let value;
    if (arg === "--part") {
      index += 1;
      value = argv[index] ?? "";
    } else if (arg.startsWith("--part=")) {
      value = arg.slice("--part=".length);
    } else {
      rest.push(arg);
      continue;
    }
    const match = /^(\d+)\/(\d+)$/.exec(value);
    if (!match || Number(match[1]) < 1 || Number(match[1]) > Number(match[2])) {
      return { error: `bad --part ${JSON.stringify(value)} (use n/m with 1 <= n <= m, for example 1/3)` };
    }
    part = { n: Number(match[1]), m: Number(match[2]) };
  }
  return { rest, part };
}

// Give each chunk to the part that holds the middle of it, so the parts stay in order and about equal in size.
// Sizes are bytes, the unit of the part limit (a Korean character is 3 bytes, a Latin one 1).
export function partitionChunks(chunks, m) {
  const sizes = chunks.map((chunk) => Buffer.byteLength(chunk));
  const total = sizes.reduce((sum, size) => sum + size, 0);
  let before = 0;
  return chunks.map((_, index) => {
    const middle = before + sizes[index] / 2;
    before += sizes[index];
    return total === 0 ? 0 : Math.min(m - 1, Math.floor((middle * m) / total));
  });
}

const shellQuote = (arg) => (/^[\w@%+=:,./#~-]+$/.test(arg) ? arg : `"${arg.replace(/(["\\$`])/g, "\\$1")}"`);

function main(rawArgv) {
  const parsed = parsePart(rawArgv);
  if (parsed.error) {
    console.error(`read_refs: ${parsed.error}`);
    return 2;
  }
  const argv = parsed.rest;
  if (argv.includes("--bundles")) {
    console.log(listBundles());
    return 0;
  }
  const toc = argv.includes("--toc");
  const { targets, unknown } = expandBundles(argv.filter((arg) => arg !== "--toc"));
  if (unknown.length) {
    console.error(`read_refs: unknown bundle: ${unknown.join(", ")} (available: ${Object.keys(BUNDLES).join(", ")})`);
    return 2;
  }
  if (targets.length === 0) {
    console.error("usage: read_refs.mjs [--toc] [--bundle <name>] [--part n/m] <file>[#section[,section|~section]] ...  |  --bundles");
    return 2;
  }
  let failed = 0;
  const results = [...targetChunks(targets, readSource, toc)];
  for (const result of results.filter((item) => item.error)) {
    console.error(`read_refs: ${result.error}`);
    if (result.toc) console.error(result.toc);
    failed += 1;
  }
  const found = results.filter((item) => !item.error);
  if (!parsed.part) {
    for (const item of found) console.log(item.chunk);
    return failed ? 1 : 0;
  }
  const { n, m } = parsed.part;
  const mine = cutParts(found, m)[n - 1];
  const next = n < m ? `next: node scripts/read_refs.mjs ${[...argv, "--part", `${n + 1}/${m}`].map(shellQuote).join(" ")}` : "last part";
  console.log(`part ${n} of ${m}, ${next}${mine.length ? "" : " (no section falls in this part)"}\n`);
  for (const chunk of mine) console.log(chunk);
  return failed ? 1 : 0;
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) {
  process.exit(main(process.argv.slice(2)));
}
