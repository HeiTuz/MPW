#!/usr/bin/env node
// read_refs.mjs must cut sections at the right headings, and every
// "[file](references/...) §section" pointer in SKILL.md must resolve, so the
// section-scoped reading path stays usable when headings are renamed.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { extractSection, parseHeadings } from "./read_refs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const sample = [
  "# Title",
  "## 3. Parent",
  "parent body",
  "### 3.1 First child",
  "one",
  "~~~",
  "## 9. heading inside a fence",
  "~~~",
  "### 3.2 Second child",
  "two",
  "## 0-1. Other",
  "other",
  "## Named section",
  "named",
].join("\n");

assert.equal(extractSection(sample, "3").body.split("\n").at(-1), "two", "§3 covers its children");
assert.equal(extractSection(sample, "3.1").body, "### 3.1 First child\none\n~~~\n## 9. heading inside a fence\n~~~");
assert.equal(extractSection(sample, "3.2").body, "### 3.2 Second child\ntwo");
assert.ok(extractSection(sample, "0").error, "§0 must not match 0-1");
assert.equal(extractSection(sample, "0-1").body, "## 0-1. Other\nother");
assert.equal(extractSection(sample, "Named section").body, "## Named section\nnamed");
assert.equal(extractSection(sample, "3.2~0-1").body, "### 3.2 Second child\ntwo\n## 0-1. Other\nother");
assert.ok(extractSection(sample, "9").error, "headings inside fences are ignored");

const cli = spawnSync(process.execPath, [
  path.join(root, "scripts", "read_refs.mjs"),
  "references/image/surfaces.md#0",
  "references/image/surface-contracts.md#3.2,3.3",
], { cwd: "/", encoding: "utf8" });
assert.equal(cli.status, 0, cli.stderr);
assert.deepEqual(cli.stdout.match(/^==> .*$/gm).map((line) => line.split(" (L")[0]), [
  "==> references/image/surfaces.md §0",
  "==> references/image/surface-contracts.md §3.2",
  "==> references/image/surface-contracts.md §3.3",
]);
const missing = spawnSync(process.execPath, [path.join(root, "scripts", "read_refs.mjs"), "references/image/surfaces.md#no-such-section"], { encoding: "utf8" });
assert.equal(missing.status, 1);

// SKILL.md pointers: the text after "§" must start with a heading's number
// (e.g. "3.2", "0-1") or its full title.
function headingKeys(file) {
  const { headings } = parseHeadings(fs.readFileSync(file, "utf8"));
  return headings.map((heading) => {
    const title = heading.title.replace(/`/g, "").trim();
    const number = title.match(/^([0-9]+(?:[.-][0-9]+)*)/);
    return { title: title.toLowerCase(), number: number ? number[1] : null };
  });
}

function pointerResolves(keys, candidate) {
  const text = candidate.toLowerCase();
  return keys.some(({ title, number }) => {
    if (number && text.startsWith(number)) {
      const rest = text.slice(number.length);
      return !/^(?:[0-9]|[.-][0-9])/.test(rest);
    }
    return text.startsWith(title);
  });
}

const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
const failures = [];
let checked = 0;
for (const line of skill.split("\n")) {
  const links = [...line.matchAll(/\]\((references\/[^)#]+\.md)\)/g)];
  links.forEach((link, index) => {
    const start = link.index + link[0].length;
    const end = index + 1 < links.length ? links[index + 1].index : line.length;
    const tail = line.slice(start, end);
    const keys = headingKeys(path.join(root, link[1]));
    for (const match of tail.matchAll(/§/g)) {
      const candidate = tail.slice(match.index + 1);
      checked += 1;
      if (!pointerResolves(keys, candidate)) failures.push(link[1] + " §" + candidate.slice(0, 40));
    }
  });
}
assert.ok(checked >= 10, "expected SKILL.md section pointers, found " + checked);
assert.deepEqual(failures, [], "unresolved SKILL.md section pointers");
console.log("read_refs: section extraction ok; " + checked + " SKILL.md section pointers resolve");
