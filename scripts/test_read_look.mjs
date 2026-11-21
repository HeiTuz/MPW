#!/usr/bin/env node
// Structure test for scripts/read_look.mjs on every look card: --outline and each branch read
// without error, keep every row the branch can use, drop 출처, and stay well under the whole card.
// Prose is not pinned.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { outline, readBranch, branchLetters, parseCard } from "./read_look.mjs";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const looks = path.join(scripts, "../references/image/looks");
const cards = fs.readdirSync(looks).filter((f) => f.endsWith(".md") && !["index.md", "LICENSE-Iris.md"].includes(f));
assert.ok(cards.length >= 28, `${cards.length} cards`);

const rowsOf = (section) => section.lines.filter((l) => /^\| /.test(l) && !/^\| (갈래|번호|세트|슬롯|항목|---)/.test(l));
const firstCell = (line) => line.replace(/^\| /, "").split(" | ")[0];
const hasBranch = (cell, letter) => /전부|모든 갈래/.test(cell) || new RegExp(`(^|[^A-Z])${letter}([^A-Z]|$)`).test(cell);
const bytes = (s) => Buffer.byteLength(s);

for (const file of cards) {
  const text = fs.readFileSync(path.join(looks, file), "utf8");
  const card = parseCard(text);
  const letters = branchLetters(text);
  assert.ok(letters.length >= 3, `${file}: branches ${letters}`);

  // Outline: the choosing sections are whole, every set and every pair has a line, nothing from the bodies leaks.
  const o = outline(text);
  assert.ok(o.startsWith("# "), `${file}: outline starts with the title`);
  for (const key of ["고정 사실", "갈래 고르기", "맞지 않는 것"]) assert.ok(o.includes(`## ${card.find(key).title}`), `${file}: outline has ${key}`);
  const sets = rowsOf(card.find("장면 세트"));
  const pairs = rowsOf(card.find("포즈·구도 쌍"));
  assert.equal(o.split("\n").filter((l) => /^- S\d+ /.test(l)).length, sets.length, `${file}: one outline line per set`);
  assert.equal(o.split("\n").filter((l) => /^- \d+ \[/.test(l)).length, pairs.length, `${file}: one outline line per pair`);
  assert.ok(!o.includes("## 출처") && !o.includes("## 끄는 고정 몫"), `${file}: outline leaves out 출처 and the fixed-slot table`);
  assert.ok(bytes(o) < bytes(text) / 2, `${file}: outline is under half of the card`);

  for (const letter of letters) {
    const result = readBranch(text, { branch: letter });
    assert.equal(result.error, undefined, `${file} ${letter}`);
    const b = result.text;
    assert.ok(b.includes(`## ${card.find("끄는 고정 몫").title}`), `${file} ${letter}: 끄는 고정 몫 whole`);
    assert.ok(!b.includes("## 출처"), `${file} ${letter}: no 출처`);
    // Every layer row of this branch (or 전부) is in the output, and no row of another branch is.
    for (const layer of card.layers) {
      for (const row of rowsOf(layer)) {
        assert.equal(b.includes(row), hasBranch(firstCell(row), letter), `${file} ${letter} ${layer.key}: ${row.slice(0, 40)}`);
      }
    }
    // Pairs of the branch come out whole; another branch's pair needs --pair.
    for (const row of pairs) {
      const cells = row.replace(/^\| /, "").split(" | ");
      assert.equal(b.includes(row), hasBranch(cells[1], letter), `${file} ${letter} pair ${cells[0]}`);
    }
    assert.ok(bytes(b) < bytes(text) * 0.7, `${file} ${letter}: branch read is well under the whole card`);
  }

  // One set and one (borrowed) pair on top of a branch.
  const firstSet = sets[0].replace(/^\| /, "").split(" | ");
  const setId = firstSet[0].split(" ")[0];
  const withSet = readBranch(text, { branch: letters[0], set: setId });
  assert.equal(withSet.error, undefined, `${file} ${setId}`);
  assert.ok(withSet.text.includes(sets[0]), `${file}: set ${setId} comes out whole`);
  assert.ok(!sets.slice(1).some((r) => withSet.text.includes(r)), `${file}: only the chosen set`);
  assert.equal(readBranch(text, { set: setId }).error, undefined, `${file}: --set alone gives the branch`);
  const lastPair = pairs.at(-1).replace(/^\| /, "").split(" | ")[0];
  const one = readBranch(text, { branch: letters[0], pair: lastPair });
  assert.equal(one.error, undefined, `${file} pair ${lastPair}`);
  assert.ok(one.text.includes(pairs.at(-1)) && one.text.split("\n").filter((l) => /^\| \d+ \|/.test(l)).length === 1, `${file}: --pair gives that pair only`);
}

// Bad input is an error, not an empty read.
const text = fs.readFileSync(path.join(looks, cards[0]), "utf8");
assert.match(readBranch(text, { branch: "Z" }).error, /branch not found/);
assert.match(readBranch(text, { branch: "A", set: "S99" }).error, /set not found/);
assert.match(readBranch(text, { branch: "A", pair: 99 }).error, /pair not found/);
assert.match(readBranch(text, {}).error, /--branch/);

// The documented commands run as printed.
const run = (...args) => spawnSync(process.execPath, [path.join(scripts, "read_look.mjs"), ...args], { encoding: "utf8" });
const slug = cards[0].replace(/\.md$/, "");
assert.equal(run(slug, "--outline").status, 0);
assert.equal(run(slug, "--branch", "A", "--set", "S1", "--pair", "2").status, 0);
assert.equal(run(`references/image/looks/${slug}.md`, "--outline").status, 0);
assert.equal(run(slug).status, 2);
assert.equal(run("no-such-card", "--outline").status, 2);
assert.equal(run(slug, "--branch", "Z").status, 2);

console.log(`read_look: ${cards.length} cards, outline and every branch read; image output NOT RUN.`);
