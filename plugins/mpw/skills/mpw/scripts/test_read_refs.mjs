#!/usr/bin/env node
// read_refs.mjs must cut sections at the right headings, and every
// "[file](references/...) §section" pointer in SKILL.md must resolve, so the
// section-scoped reading path stays usable when headings are renamed.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { BUNDLES, expandBundles, extractSection, parseHeadings, readTargets } from "./read_refs.mjs";

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
assert.equal(extractSection(sample, "Named-section").body, "## Named section\nnamed", "hyphens match spaces in titled keys");

// Overlap is deduplicated by source line, not text value, and requests keep
// their first-occurrence order. The repeated fence lines must both survive.
function expectedCoverage(targets, read) {
  const seen = new Set();
  const ordered = [];
  for (const target of targets) {
    const [file, raw] = target.split("#");
    const text = read(file);
    const specs = (raw ?? "").split(",").filter((spec) => spec.trim());
    for (const spec of specs.length ? specs : [null]) {
      const section = spec === null ? { from: 1, to: text.split("\n").length } : extractSection(text, spec);
      assert.equal(section.error, undefined);
      for (let line = section.from; line <= section.to; line += 1) {
        const key = `${file}:${line}`;
        if (!seen.has(key)) { seen.add(key); ordered.push(key); }
      }
    }
  }
  return ordered;
}

function actualCoverage(output, read) {
  const covered = [];
  const chunks = [...output.matchAll(/^==> (.+)\n([\s\S]*?)(?=^==> |$(?![\s\S]))/gm)];
  for (const [, header, body] of chunks) {
    const match = header.match(/^(.*?)(?: §.*?)?(?: \(L(\d+)-(\d+)\))?$/);
    const [, file, from, to] = match;
    const lines = read(file).split("\n");
    const start = from ? Number(from) : 1;
    const end = to ? Number(to) : lines.length;
    assert.equal(body.trimEnd(), lines.slice(start - 1, end).join("\n").trimEnd(), "fragment matches its source range");
    for (let line = start; line <= end; line += 1) covered.push(`${file}:${line}`);
  }
  return covered;
}

const sampleRead = () => sample;
for (const targets of [
  ["sample#3,3.1,3.2", "sample#3"],
  ["sample#3.1", "sample#3"],
  ["sample#3.2~0-1", "sample#3~Named section"],
  ["sample#3.1", "sample", "sample#Named section"],
  ["sample", "sample#3", "sample"],
  ["sample#Named section", "other#3", "sample#3.1", "sample#3"],
]) {
  const reads = [];
  const result = readTargets(targets, (file) => { reads.push(file); return sample; });
  assert.equal(result.error, undefined);
  assert.deepEqual(actualCoverage(result.text, sampleRead), expectedCoverage(targets, sampleRead));
  assert.equal(reads.length, new Set(targets.map((target) => target.split("#")[0])).size, "read each source only once per call");
}
assert.deepEqual(readTargets(["sample#missing"], sampleRead), { error: "sample: section not found: §missing" });
assert.deepEqual(readTargets(["sample"], () => { throw new Error("missing"); }), { error: "cannot read sample" });
assert.ok(readTargets(["sample#Named section~3"], sampleRead).error);
assert.equal(readTargets(["sample#3"], sampleRead).text, readTargets(["sample#3", "sample#3"], sampleRead).text);

// Real repeated/overlapping bundles: identical requested line coverage with
// fewer emitted bytes and exactly one read per distinct source.
const diskRead = (file) => fs.readFileSync(path.join(root, file), "utf8");
for (const names of [["gpt-image-portrait", "gpt-image-portrait"], ["gpt-image-new", "gpt-image-edit-structured"]]) {
  const targets = expandBundles(names.map((name) => `--bundle=${name}`)).targets;
  let reads = 0;
  const result = readTargets(targets, (file) => { reads += 1; return diskRead(file); });
  const separate = targets.map((target) => readTargets([target], diskRead).text).join("\n");
  assert.deepEqual(actualCoverage(result.text, diskRead), expectedCoverage(targets, diskRead));
  assert.ok(Buffer.byteLength(result.text) < Buffer.byteLength(separate), "overlapping bundles emit fewer bytes");
  assert.equal(reads, new Set(targets.map((target) => target.split("#")[0])).size);
  assert.ok(reads < targets.length, "overlapping bundles read fewer files");
  const cliResult = spawnSync(process.execPath, [path.join(root, "scripts/read_refs.mjs"), ...names.map((name) => `--bundle=${name}`)], { encoding: "utf8" });
  assert.equal(cliResult.status, 0, cliResult.stderr);
  assert.equal(cliResult.stdout, result.text + "\n", "CLI and API share exact deduplication");
}

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

// Installs can sit behind symlinks (macOS /tmp, linked skill dirs); the CLI
// must still run instead of exiting 0 with no output.
const linkDir = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-read-refs-"));
const linkPath = path.join(linkDir, "read_refs.mjs");
fs.symlinkSync(path.join(root, "scripts", "read_refs.mjs"), linkPath);
const viaLink = spawnSync(process.execPath, [linkPath, "references/image/surfaces.md#0"], { encoding: "utf8" });
fs.rmSync(linkDir, { recursive: true, force: true });
assert.equal(viaLink.status, 0, viaLink.stderr);
assert.match(viaLink.stdout, /^==> references\/image\/surfaces\.md §0/m, "symlinked CLI printed nothing");

// Alias paths share the real source; TOC ignores selectors and remains usable.
const sourcePath = "references/image/surfaces.md";
const aliasResult = readTargets([`${sourcePath}#0`, `${path.join(root, sourcePath)}#0`]);
assert.equal(aliasResult.text, readTargets([`${sourcePath}#0`]).text);
const tocResult = spawnSync(process.execPath, [path.join(root, "scripts/read_refs.mjs"), "--toc", `${sourcePath}#missing`, `${sourcePath}#0`], { encoding: "utf8" });
assert.equal(tocResult.status, 0, tocResult.stderr);
assert.equal((tocResult.stdout.match(/\(toc\)/g) ?? []).length, 1);
assert.match(tocResult.stdout, /\(L\d+, \d+ lines\)/);
const mixedErrors = spawnSync(process.execPath, [path.join(root, "scripts/read_refs.mjs"), `${sourcePath}#missing,0`, "no-such-file.md", `${sourcePath}#0`], { encoding: "utf8" });
assert.equal(mixedErrors.status, 1);
assert.match(mixedErrors.stderr, /section not found/);
assert.match(mixedErrors.stderr, /cannot read/);
assert.equal(mixedErrors.stdout, readTargets([`${sourcePath}#0`]).text + "\n", "CLI continues after errors without repeating valid content");
const noArgs = spawnSync(process.execPath, [path.join(root, "scripts/read_refs.mjs")], { encoding: "utf8" });
assert.equal(noArgs.status, 2);

// SKILL.md and reading-map.md pointers: the text after "§" must start with a
// heading's number (e.g. "3.2", "0-1") or its full title.
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

const failures = [];
let checked = 0;
for (const file of ["SKILL.md", "references/reading-map.md"]) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const base = path.dirname(path.join(root, file));
  for (const line of text.split("\n")) {
    const links = [...line.matchAll(/\]\(([^)#\s]+\.md)\)/g)];
    links.forEach((link, index) => {
      const start = link.index + link[0].length;
      const end = index + 1 < links.length ? links[index + 1].index : line.length;
      const tail = line.slice(start, end);
      const target = path.resolve(base, link[1]);
      if (!fs.existsSync(target)) {
        failures.push(file + " -> " + link[1] + " (missing)");
        return;
      }
      const keys = headingKeys(target);
      for (const match of tail.matchAll(/§/g)) {
        const candidate = tail.slice(match.index + 1);
        checked += 1;
        if (!pointerResolves(keys, candidate)) failures.push(file + ": " + link[1] + " §" + candidate.slice(0, 40));
      }
    });
  }
}
assert.ok(checked >= 15, "expected section pointers in SKILL.md and reading-map.md, found " + checked);
assert.deepEqual(failures, [], "unresolved section pointers");
const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");

// Named bundles: BUNDLES is the only definition. Every bundle must resolve, every
// bundle name in SKILL.md tables must exist, and every bundle must be named in
// SKILL.md so dead bundles do not accumulate. Extra read_refs arguments written
// in table rows must still resolve.
function shellWords(text) {
  return [...text.matchAll(/"([^"]*)"|(\S+)/g)].map((match) => match[1] ?? match[2]);
}
for (const [name, targets] of Object.entries(BUNDLES)) {
  assert.match(name, /^[a-z0-9-]+$/, "bundle names stay shell-safe: " + name);
  const result = readTargets(targets);
  assert.equal(result.error, undefined, "bundle " + name + " does not resolve: " + result.error);
  assert.ok(result.text.length > 100, "bundle " + name + " is empty");
  const originalChunks = targets.flatMap((target) => {
    const [file, raw] = target.split("#");
    const text = diskRead(file);
    if (!raw) return [`==> ${file}\n${text.trimEnd()}\n`];
    return raw.split(",").map((spec) => {
      const section = extractSection(text, spec);
      return `==> ${file} §${spec.trim()} (L${section.from}-${section.to})\n${section.body}\n`;
    });
  });
  assert.equal(result.text, originalChunks.join("\n"), "standalone bundle output remains unchanged: " + name);
}
assert.deepEqual(expandBundles(["--bundle", "video", "a.md#1", "--bundle=delegation"]).targets, [
  ...BUNDLES.video,
  "a.md#1",
  ...BUNDLES.delegation,
]);
assert.deepEqual(expandBundles(["--bundle", "nope"]).unknown, ["nope"]);

const bundleFailures = [];
// reading-map.md rows carry copy-ready read_refs arguments; they must resolve too.
for (const line of fs.readFileSync(path.join(root, "references", "reading-map.md"), "utf8").split("\n")) {
  if (!line.startsWith("|")) continue;
  for (const code of line.matchAll(/`([^`]*references\/[^`]*)`/g)) {
    for (const word of shellWords(code[1])) {
      if (word.startsWith("--")) continue;
      const [file, specs] = word.split("#");
      const full = path.join(root, file);
      if (!fs.existsSync(full)) { bundleFailures.push("reading-map: " + word); continue; }
      for (const spec of (specs ?? "").split(",").filter(Boolean)) {
        if (extractSection(fs.readFileSync(full, "utf8"), spec).error) bundleFailures.push("reading-map: " + word);
      }
    }
  }
}
const namedInSkill = new Set();
let bundleTable = false;
for (const line of skill.split("\n")) {
  if (!line.startsWith("|")) continue;
  if (line.includes("--bundle")) bundleTable = true;
  else if (line.startsWith("|---")) continue;
  else if (!line.includes("`")) bundleTable = false;
  if (bundleTable) {
    for (const code of line.matchAll(/`([a-z0-9-]+)`/g)) {
      if (!Object.hasOwn(BUNDLES, code[1])) bundleFailures.push("unknown bundle name " + code[1]);
      else namedInSkill.add(code[1]);
    }
  }
  for (const code of line.matchAll(/`([^`]*references\/[^`]*)`/g)) {
    for (const word of shellWords(code[1])) {
      const [file, specs] = word.split("#");
      const full = path.join(root, file);
      if (!fs.existsSync(full)) {
        bundleFailures.push(word);
        continue;
      }
      for (const spec of (specs ?? "").split(",").filter(Boolean)) {
        if (extractSection(fs.readFileSync(full, "utf8"), spec).error) bundleFailures.push(word);
      }
    }
  }
}
assert.deepEqual(bundleFailures, [], "unresolved read_refs bundles or arguments in SKILL.md");
assert.deepEqual([...namedInSkill].sort(), Object.keys(BUNDLES).sort(), "SKILL.md must name every bundle exactly");

const viaBundle = spawnSync(process.execPath, [path.join(root, "scripts", "read_refs.mjs"), "--bundle", "gpt-image-edit", "references/image/from-image.md#1"], { encoding: "utf8" });
assert.equal(viaBundle.status, 0, viaBundle.stderr);
assert.deepEqual(viaBundle.stdout.match(/^==> .*$/gm).map((line) => line.split(" (L")[0]), [
  "==> references/image/surfaces.md §0",
  "==> references/image/surface-contracts.md §3.2.1",
  "==> references/image/surface-contracts.md §3.2.3",
  "==> references/image/surface-contracts.md §3.3",
  "==> references/image/from-image.md §1",
]);
const unknownBundle = spawnSync(process.execPath, [path.join(root, "scripts", "read_refs.mjs"), "--bundle", "nope"], { encoding: "utf8" });
assert.equal(unknownBundle.status, 2);
assert.match(unknownBundle.stderr, /unknown bundle: nope/);
const listing = spawnSync(process.execPath, [path.join(root, "scripts", "read_refs.mjs"), "--bundles"], { encoding: "utf8" });
assert.equal(listing.status, 0, listing.stderr);
for (const name of Object.keys(BUNDLES)) assert.match(listing.stdout, new RegExp("^" + name + "  \\(\\d+ chars\\)$", "m"));
console.log("read_refs: section extraction ok; " + checked + " section pointers and " + Object.keys(BUNDLES).length + " named bundles resolve");
