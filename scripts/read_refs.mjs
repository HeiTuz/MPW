#!/usr/bin/env node
// Print only the requested Markdown sections so one call can load several
// reference sections instead of whole files.
//
//   node scripts/read_refs.mjs references/image/surfaces.md#0 references/image/surface-contracts.md#3.2
//   node scripts/read_refs.mjs "references/templates/common.md#기준 원문과 누적 수정"
//   node scripts/read_refs.mjs "references/model-playbooks.md#역할·권한 라우팅~Surface-matched evidence"
//   node scripts/read_refs.mjs --toc references/image/lanes.md
//
// A section runs from its heading to the next heading of the same or higher
// level. "#A,B" reads several sections, "#A~B" reads from A through the end of B,
// and a path without "#" prints the whole file. Relative paths resolve against
// the skill root first, then the current directory.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

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

function normalize(value) {
  return value.replace(/^§/, "").replace(/`/g, "").trim().toLowerCase();
}

// "3" matches "3. S3 — ..." but not "3.1 ..."; "0" does not match "0-1. ...".
function numberedKeyMatches(title, key) {
  if (!/^[0-9]/.test(key)) return false;
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}(?:\\.(?![0-9])|\\s|$)`).test(title);
}

export function findHeading(headings, rawKey) {
  const key = normalize(rawKey);
  if (!key) return -1;
  const titles = headings.map((heading) => normalize(heading.title));
  if (/^[0-9]+(?:[.-][0-9]+)*$/.test(key)) {
    return titles.findIndex((title) => numberedKeyMatches(title, key));
  }
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

function main(argv) {
  const toc = argv.includes("--toc");
  const targets = argv.filter((arg) => arg !== "--toc");
  if (targets.length === 0) {
    console.error("usage: read_refs.mjs [--toc] <file>[#section[,section|~section]] ...");
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
