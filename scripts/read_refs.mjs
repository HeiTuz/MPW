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
//
// A section runs from its heading to the next heading of the same or higher
// level. "#A,B" reads several sections, "#A~B" reads from A through the end of B,
// and a path without "#" prints the whole file. Relative paths resolve against
// the skill root first, then the current directory.
//
// "--bundle <name>" expands to the ready-made target list below, so the common
// starting sets in SKILL.md need no hand-copied, shell-quoted arguments. Extra
// targets after a bundle are read in order. "--bundles" lists every bundle with
// its targets and current character count. BUNDLES is the only definition of
// these sets; SKILL.md refers to them by name.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const BUNDLES = {
  // 대상 미정·GPT Image 새 이미지. 도해·슬라이드·UI·만화·로고는 -structured.
  "gpt-image-new": ["references/image/surfaces.md#0", "references/image/surface-contracts.md#3.2"],
  "gpt-image-new-structured": ["references/image/surfaces.md#0", "references/image/surface-contracts.md#3.2,3.4"],
  // 대상 미정·GPT Image 인물·셀피·패션 화보 새 이미지.
  "gpt-image-portrait": [
    "references/image/surfaces.md#0",
    "references/image/surface-contracts.md#3.2",
    "references/image/editorial/portrait-brief.md",
    "references/image/compiler.md#피부·재질",
  ],
  // 대상 미정·GPT Image 원본 편집. 참조 사진의 역할·관찰이 필요하면 from-image.md#1을 덧붙인다.
  "gpt-image-edit": ["references/image/surfaces.md#0", "references/image/surface-contracts.md#3.2,3.3"],
  "gpt-image-edit-structured": ["references/image/surfaces.md#0", "references/image/surface-contracts.md#3.2,3.3,3.4"],
  // 영상 생성.
  video: ["references/image/surfaces.md#0", "references/image/lanes.md#영상 공통 규칙"],
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
  // 리서치·추출·분류·목록 처리.
  research: ["references/templates/model.md", "references/research.md"],
  // 텍스트 모델 적응·변환. 색인이 가리키는 공급자의 날짜 절을 덧붙인다.
  "text-model-adapt": ["references/model-playbooks.md#공통 적응 규칙,공급자 색인"],
  // 이미지·영상 프롬프트의 엔진 간 변환. §6 색인이 가리키는 엔진 어댑터 절을 덧붙인다.
  "image-prompt-conversion": ["references/image/prompt-conversion.md", "references/image/model-routing.md#6"],
};

export function parseHeadings(text) {
  const lines = text.split("\n");
  const headings = [];
  let fence = null;
  lines.forEach((line, index) => {
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      if (fence === null) fence = fenceMatch[1];
      else if (fenceMatch[1] === fence) fence = null;
      return;
    }
    if (fence !== null) return;
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

export function extractSection(text, spec) {
  const { lines, headings } = parseHeadings(text);
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
  return { from: from + 1, to, body: lines.slice(from, to).join("\n").replace(/\s+$/, "") };
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

// Read every target of one bundle; returns the printed text or the first error.
export function readTargets(targets, read = (file) => fs.readFileSync(resolvePath(file), "utf8")) {
  const chunks = [];
  for (const target of targets) {
    const hash = target.indexOf("#");
    const file = hash === -1 ? target : target.slice(0, hash);
    const specs = hash === -1 ? [] : target.slice(hash + 1).split(",").filter((spec) => spec.trim());
    let text;
    try {
      text = read(file);
    } catch {
      return { error: `cannot read ${file}` };
    }
    if (specs.length === 0) {
      chunks.push(`==> ${file}\n${text.replace(/\s+$/, "")}\n`);
      continue;
    }
    for (const spec of specs) {
      const section = extractSection(text, spec);
      if (section.error) return { error: `${file}: ${section.error}` };
      chunks.push(`==> ${file} §${spec.trim()} (L${section.from}-${section.to})\n${section.body}\n`);
    }
  }
  return { text: chunks.join("\n") };
}

function listBundles() {
  return Object.entries(BUNDLES)
    .map(([name, targets]) => {
      const result = readTargets(targets);
      const size = result.error ? `error: ${result.error}` : `${[...result.text].length} chars`;
      return `${name}  (${size})\n${targets.map((target) => `  ${target}`).join("\n")}`;
    })
    .join("\n");
}

function main(argv) {
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
    console.error("usage: read_refs.mjs [--toc] [--bundle <name>] <file>[#section[,section|~section]] ...  |  --bundles");
    return 2;
  }
  let failed = 0;
  for (const target of targets) {
    const hash = target.indexOf("#");
    const file = hash === -1 ? target : target.slice(0, hash);
    const specs = hash === -1 ? [] : target.slice(hash + 1).split(",").filter((spec) => spec.trim());
    let text;
    try {
      text = fs.readFileSync(resolvePath(file), "utf8");
    } catch {
      console.error(`read_refs: cannot read ${file}`);
      failed += 1;
      continue;
    }
    if (toc) {
      console.log(`==> ${file} (toc)\n${tableOfContents(text)}\n`);
      continue;
    }
    if (specs.length === 0) {
      console.log(`==> ${file}\n${text.replace(/\s+$/, "")}\n`);
      continue;
    }
    for (const spec of specs) {
      const section = extractSection(text, spec);
      if (section.error) {
        console.error(`read_refs: ${file}: ${section.error}`);
        console.error(tableOfContents(text));
        failed += 1;
        continue;
      }
      console.log(`==> ${file} §${spec.trim()} (L${section.from}-${section.to})\n${section.body}\n`);
    }
  }
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
