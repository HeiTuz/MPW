#!/usr/bin/env node
// Structure test for scripts/read_look.mjs on every look card: --outline, --facts and each branch read
// without error, keep every row the branch can use, drop 출처, the 이유 column and the source marks, and stay well under the whole card.
// --full prints the rows as written; --list reads the index; --only adds a set to a branch already read. Prose is not pinned.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { outline, facts, readBranch, branchLetters, parseCard, listCards } from "./read_look.mjs";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const looks = path.join(scripts, "../references/image/looks");
const cards = fs.readdirSync(looks).filter((f) => f.endsWith(".md") && !["index.md", "LICENSE-Iris.md"].includes(f));
assert.ok(cards.length >= 28, `${cards.length} cards`);

const rowsOf = (section) => section.lines.filter((l) => /^\| /.test(l) && !/^\| (갈래|번호|세트|슬롯|항목|---)/.test(l));
const firstCell = (line) => line.replace(/^\| /, "").split(" | ")[0];
const hasBranch = (cell, letter) => /전부|모든 갈래/.test(cell) || new RegExp(`(^|[^A-Z])${letter}([^A-Z]|$)`).test(cell);
const bytes = (s) => Buffer.byteLength(s);
// A source mark: Chinese category words and a # number, like (滤镜 #091), (神态 #048 #079) or (风格/01 #004). Checked here without read_look's regexp.
const SOURCE = /[\u4e00-\u9fff]+(?:\/\d+)?(?: \d+)? #\d/;
const KEPT_MARK = /\([^()#]*(?:전용|장면일 때)[^()#]*\)/g;
function assertSlim(file, label, full, slimmed, card) {
  assert.ok(/#\d/.test(full), `${file} ${label}: the full read still has the source numbers`);
  assert.ok(!SOURCE.test(slimmed), `${file} ${label}: no source mark in the printed read`);
  assert.ok(!/^\| 슬롯 \| 처리 \| 이유 \|/m.test(slimmed), `${file} ${label}: no 이유 header`);
  for (const row of rowsOf(card.find("끄는 고정 몫"))) {
    const cells = row.replace(/^\| /, "").replace(/ \|$/, "").split(/(?<!\\) \| /);
    assert.equal(cells.length, 3, `${file}: 끄는 고정 몫 rows have three cells`);
    assert.ok(slimmed.includes(`| ${cells[0]} | ${cells[1].slice(0, 20)}`), `${file} ${label}: row ${cells[0]} keeps slot and 처리`);
    assert.ok(!slimmed.includes(cells[2]), `${file} ${label}: row ${cells[0]} leaves out its 이유`);
  }
  // A mark that tells when a line applies, (S2 전용) or (투명 우산 장면일 때), stays.
  for (const mark of full.match(KEPT_MARK) ?? []) assert.ok(slimmed.includes(mark), `${file} ${label}: ${mark} stays`);
}

// Largest printed read over the 28 cards, by command (see the ceilings after the loops).
const biggest = { outline: 0, facts: 0, branch: 0, branchNoPairs: 0 };
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
  biggest.outline = Math.max(biggest.outline, bytes(o));

  // --facts: the head table, 고정 사실, 갈래 고르기 and 맞지 않는 것 only; no set clues, no pair summary, no source column.
  const f = facts(text);
  assert.ok(f.startsWith("# ") && f.includes("| 부르는 이름 |"), `${file}: facts starts with the title and the head table`);
  for (const key of ["고정 사실", "갈래 고르기", "맞지 않는 것"]) assert.ok(f.includes(`## ${card.find(key).title}`), `${file}: facts has ${key}`);
  assert.ok(!f.includes("## 장면 세트") && !f.includes("## 포즈·구도 쌍") && !f.includes("## 끄는 고정 몫"), `${file}: facts leaves out sets, pairs and the fixed-slot table`);
  assert.ok(!f.includes("Iris 근거") && !SOURCE.test(f), `${file}: facts has no source column or mark`);
  assert.ok(bytes(f) < bytes(o), `${file}: facts is smaller than the outline`);
  biggest.facts = Math.max(biggest.facts, bytes(f));

  for (const letter of letters) {
    const result = readBranch(text, { branch: letter, full: true });
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

    // The printed read drops the 이유 column and the source marks and keeps the rest; --no-pairs drops only the pair table.
    const slimmed = readBranch(text, { branch: letter }).text;
    assertSlim(file, `${letter}`, b, slimmed, card);
    const noPairs = readBranch(text, { branch: letter, noPairs: true });
    assert.equal(noPairs.error, undefined, `${file} ${letter} --no-pairs`);
    assert.ok(!noPairs.text.includes("## 포즈·구도 쌍"), `${file} ${letter}: --no-pairs has no pair table`);
    assert.equal(noPairs.text, slimmed.replace(/\n## 포즈·구도 쌍[^\n]*\n(?:\|[^\n]*\n?)+/, ""), `${file} ${letter}: --no-pairs is the branch read minus the pair table`);
    biggest.branch = Math.max(biggest.branch, bytes(slimmed));
    biggest.branchNoPairs = Math.max(biggest.branchNoPairs, bytes(noPairs.text));
  }

  // One set and one (borrowed) pair on top of a branch.
  const firstSet = sets[0].replace(/^\| /, "").split(" | ");
  const setId = firstSet[0].split(" ")[0];
  const withSet = readBranch(text, { branch: letters[0], set: setId, full: true });
  assert.equal(withSet.error, undefined, `${file} ${setId}`);
  assert.ok(withSet.text.includes(sets[0]), `${file}: set ${setId} comes out whole`);
  assert.ok(!sets.slice(1).some((r) => withSet.text.includes(r)), `${file}: only the chosen set`);
  assert.equal(readBranch(text, { set: setId }).error, undefined, `${file}: --set alone gives the branch`);
  const lastPair = pairs.at(-1).replace(/^\| /, "").split(" | ")[0];
  const one = readBranch(text, { branch: letters[0], pair: lastPair, full: true });
  assert.equal(one.error, undefined, `${file} pair ${lastPair}`);
  assert.ok(one.text.includes(pairs.at(-1)) && one.text.split("\n").filter((l) => /^\| \d+ \|/.test(l)).length === 1, `${file}: --pair gives that pair only`);

  // --only adds a set (and a pair) to a branch already read: no fixed-slot table, no branch rows, no pair table without --pair.
  const only = readBranch(text, { branch: letters[0], set: setId, pair: lastPair, only: true, full: true });
  assert.equal(only.error, undefined, `${file} ${setId} --only`);
  assert.ok(only.text.includes(sets[0]) && only.text.includes(pairs.at(-1)), `${file}: --only has the set and the pair whole`);
  assert.ok(!only.text.includes("## 끄는 고정 몫") && !/^## .+ \(갈래 [A-Z]\)$/m.test(only.text), `${file}: --only does not repeat the fixed-slot table or the branch rows`);
  assert.ok(bytes(only.text) < bytes(withSet.text), `${file}: --only is smaller than the same read without it`);
  const onlySet = readBranch(text, { set: setId, only: true, full: true }).text;
  assert.ok(!/^## 포즈·구도 쌍/m.test(onlySet), `${file}: --only without --pair prints no pair table`);
  // Whatever the full read of the set names (lines of other branches, other pairs) is still named by --only.
  const named = (t) => (t.split("## 세트가 가리키는 줄")[1] ?? "").split("\n").filter((l) => l.startsWith("| "));
  const keep = readBranch(text, { set: setId, full: true }).text;
  for (const line of named(keep)) assert.ok(named(onlySet).includes(line), `${file} ${setId}: --only keeps the named line ${line.slice(0, 40)}`);
}

// --set: every card line whose head token the bundle names is in the output, whichever branch row holds it.
// Checked without read_look's matcher: a plain substring test with a letter/digit guard on the edges.
const isAlnum = (c) => c !== undefined && /[a-z0-9]/.test(c);
const names = (text, token) => {
  const t = token.normalize("NFKC").toLowerCase();
  const x = text.normalize("NFKC").toLowerCase();
  if (t.length < 2) return false;
  for (let i = x.indexOf(t); i !== -1; i = x.indexOf(t, i + 1)) {
    if (!(isAlnum(t[0]) && isAlnum(x[i - 1])) && !(isAlnum(t.at(-1)) && isAlnum(x[i + t.length]))) return true;
  }
  return false;
};
const headOf = (cell) => cell.match(/^(.+?) — /)?.[1] ?? null;
let namedChecks = 0;
for (const file of cards) {
  const text = fs.readFileSync(path.join(looks, file), "utf8");
  const card = parseCard(text);
  const heads = [];
  for (const layer of card.layers) for (const row of rowsOf(layer)) heads.push(headOf(row.replace(/^\| /, "").split(" | ")[2]));
  for (const row of rowsOf(card.find("포즈·구도 쌍"))) { const c = row.replace(/^\| /, "").split(" | "); heads.push(headOf(c[2]), headOf(c[3])); }
  for (const row of rowsOf(card.find("장면 세트"))) {
    const cells = row.replace(/^\| /, "").split(" | ");
    const id = cells[0].split(" ")[0];
    const bundle = cells.slice(2).join(" | ").replace(/ \|$/, "").split(" / ").filter((seg) => !/^(단서:\s*)?(장소|소품|시간대|의상)(\s|$)/.test(seg)).join(" / ");
    const out = readBranch(text, { branch: cells[1].match(/[A-Z]/)[0], set: id });
    assert.equal(out.error, undefined, `${file} ${id}`);
    const printedHeads = out.text.split("\n").filter((l) => l.startsWith("| ")).flatMap((l) => l.replace(/^\| /, "").split(" | ").map(headOf));
    for (const head of new Set(heads.filter(Boolean))) {
      if (!names(bundle, head)) continue;
      namedChecks++;
      assert.ok(printedHeads.includes(head), `${file} ${id}: the bundle names ${head} but --set does not print its line`);
    }
  }
}
assert.ok(namedChecks > 300, `${namedChecks} set-token checks`);

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

assert.equal(run(slug, "--facts").status, 0);
assert.equal(run(slug, "--branch", "A", "--no-pairs").status, 0);
assert.equal(run(slug, "--set", "S1", "--pair", "1", "--only").status, 0);
assert.equal(run(slug, "--branch", "A", "--full").stdout, readBranch(text, { branch: "A", full: true }).text);
assert.equal(run(slug, "--only").status, 2, "--only needs --set");
assert.equal(run(slug, "--branch", "A", "--no-pairs", "--pair", "1").status, 2, "--no-pairs and --pair conflict");
assert.equal(run("--help").status, 0);

// --list: one line per card from the index, the 갈래 column and the head paragraph left out, small enough to read whole.
{
  const listed = run("--list");
  assert.equal(listed.status, 0);
  const lines = listed.stdout.trim().split("\n");
  assert.equal(lines.length, cards.length, "one line per card");
  for (const file of cards) assert.ok(lines.some((l) => l.startsWith(`- ${file.replace(/\.md$/, "")} [`)), `${file} is listed`);
  assert.ok(lines.every((l) => / \[[A-Z]{2}.*, (매체|장면)\] .+ — .+/.test(l)), "slug, culture and axis, name, summary on each line");
  assert.ok(!listed.stdout.includes("갈래") && !/重庆森林|Highway Daylight/.test(listed.stdout), "the 갈래 column is left out");
  assert.ok(bytes(listed.stdout) <= 6144, `--list is ${bytes(listed.stdout)} bytes`);
  assert.equal(listCards("| slug | 이름 |\n|---|---|\n| [a-b](a-b.md) | N | KR | A x(기본) | 장면 | 요약 |\n"), "- a-b [KR, 장면] N — 요약\n");
}

// Output size regression: the largest printed read over the 28 cards stays under the measured size plus 5%.
// (facts 8629, outline 10253, branch 14897, branch --no-pairs 13116 when these ceilings were set.) A card that grows past one needs a look at what it added.
const ceilings = { facts: 9100, outline: 10800, branch: 15700, branchNoPairs: 13800 };
for (const [name, limit] of Object.entries(ceilings)) assert.ok(biggest[name] <= limit, `${name}: largest read ${biggest[name]} bytes is over ${limit}`);

console.log(`read_look: ${cards.length} cards, outline, facts and every branch read; ${namedChecks} set-named tokens all printed with --set; image output NOT RUN.`);
