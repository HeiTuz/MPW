#!/usr/bin/env node
// Structure and wiring only: table shape, evidence grades, reader bundles, the engine checks
// of check_prompt.mjs, and the worked example. The wording of cells is not pinned and no
// image output is judged.
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { checkText } from "./check_prompt.mjs";
import { BUNDLES } from "./read_refs.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const doc = read("references/image/engine-levers.md");

const section = (number) => {
  const start = doc.search(new RegExp(`^## ${number}\\. `, "mu"));
  assert.ok(start >= 0, `section ${number}`);
  const rest = doc.slice(start + 3);
  const next = rest.search(/^## /mu);
  return next < 0 ? rest : rest.slice(0, next);
};
const cells = (body) => body.split("\n").filter((line) => line.startsWith("|") && !/^\|[-| ]+\|$/u.test(line)).slice(1)
  .map((line) => line.replace(/^\| /u, "").replace(/ \|$/u, "").split(" | "));

// §3 arrangement table: six columns, the six engine rows.
const layout = section(3);
const layoutRows = cells(layout);
assert.ok(layoutRows.length >= 7, `layout rows ${layoutRows.length}`);
for (const row of layoutRows) assert.equal(row.length, 6, `layout row: ${row[0]}`);
for (const name of ["GPT Image 웹", "Seedream ModelArk", "Nano Banana", "Midjourney", "Soul 2"]) {
  assert.ok(layoutRows.some((row) => row[0].startsWith(name)), `layout row ${name}`);
}

// §5 effect table: six columns, every cell carries an evidence grade or says there is none.
const grades = /`\[(?:실측|공식|Iris|문서|미검증)\]`/u;
const effects = cells(section(5).split(/^### /mu)[0]);
assert.ok(effects.length >= 13, `effect rows ${effects.length}`);
for (const row of effects) {
  assert.equal(row.length, 6, `effect row: ${row[0]}`);
  for (const cell of row.slice(1)) assert.ok(grades.test(cell) || /^없음$/u.test(cell), `cell without a grade in "${row[0]}": ${cell.slice(0, 50)}`);
}
for (const name of ["매체 고정", "얼굴 고정", "몸 비율", "필름·입자", "애니·CG 방지", "글자·로고·워터마크", "화면비", "언어"]) {
  assert.ok(effects.some((row) => row[0] === name), `effect ${name}`);
}
// §5.1: the Chinese cells of the 豆包·即梦 row, two columns, each carrying an evidence grade.
const chinese = cells(section(5).split(/^### /mu)[1] ?? "");
assert.ok(chinese.length >= 8, `Chinese cells ${chinese.length}`);
for (const row of chinese) {
  assert.equal(row.length, 2, `5.1 row: ${row[0]}`);
  assert.ok(grades.test(row[1]) && /\p{sc=Han}/u.test(row[1]), `5.1 cell without a grade or Chinese text: ${row[0]}`);
}
assert.ok(chinese.some((row) => row[0] === "언어"), "5.1 language cell");
// Soul: the anti-CG cell says not to write it, which check_prompt.mjs enforces below.
assert.match(effects.find((row) => row[0] === "애니·CG 방지")[5], /\*\*쓰지 않는다\.\*\*/u);

// Grades are defined once, and the two dated claims carry stamps.
for (const grade of ["실측", "공식", "Iris", "문서", "미검증"]) assert.match(section(2), new RegExp(`\\[${grade}\\]`, "u"));
assert.match(doc, /\(2026-07 실측\)/u);
assert.match(doc, /\(2026-08-02 확인\)/u);

// Reader bundles carry the file; the two paths named in SKILL.md exist.
for (const name of ["image-prompt-conversion", "image-other-engine"]) {
  assert.ok(BUNDLES[name]?.includes("references/image/engine-levers.md"), `${name} bundle`);
}
for (const name of ["image-other-engine", "image-prompt-conversion"]) {
  const result = spawnSync(process.execPath, ["scripts/read_refs.mjs", "--bundle", name], { cwd: root, encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes("엔진별 효과 장치"), `${name} output`);
}
assert.ok(BUNDLES["image-other-engine"].some((target) => target.startsWith("references/image/fixed-lines.md")), "other-engine bundle writes layers first");

// The worked examples: each form passes its own engine's checks cleanly; the Seedream text is
// under the word guidance; the same Seedream text moved to Soul trips the two cells that say
// not to write a ban tail and a film brand.
const blocks = [...doc.matchAll(/```text\n([\s\S]*?)```/gu)].map((match) => match[1].trim());
const engines = ["seedream", "nano-banana", "midjourney", "soul", "seedream"];
assert.equal(blocks.length, engines.length, "one example per engine");
blocks.forEach((block, index) => {
  const result = checkText(block, { engine: engines[index] });
  assert.deepEqual([...result.errors, ...result.warnings].map((item) => item.code), [], `example under ${engines[index]}`);
});
assert.ok(blocks[0].split(/\s+/u).length < 600, "seedream example under 600 words");
assert.match(blocks[2], / --ar 3:4 .*--no /u, "midjourney example keeps its flags");
assert.ok(/^\p{sc=Han}/u.test(blocks[4]) && !/\n/u.test(blocks[4]), "豆包·即梦 example is one Chinese paragraph");
const soul = new Set([...checkText(blocks[0], { engine: "soul" }).warnings].map((item) => item.code));
assert.ok(soul.has("coherence/engine-ban") && soul.has("coherence/engine-brand"), "seedream text under soul");

// Engine checks, one positive and one negative each.
const codes = (text, options) => {
  const result = checkText(text, options);
  return new Set([...result.errors, ...result.warnings].map((item) => item.code));
};
const layered = "A photograph of a woman.\n\n## Scene\nwindow — A tall window.\n\n## Light\nsoft — Soft light.";
assert.ok(codes(layered, { engine: "seedream" }).has("coherence/engine-layers"));
assert.ok(codes(layered, { engine: "midjourney" }).has("coherence/engine-layers"));
assert.ok(!codes(layered, { engine: "gpt-image" }).has("coherence/engine-layers"));
assert.ok(!codes("A photograph of a woman.\n\n## Scene\nwindow — A tall window.", { engine: "soul" }).has("coherence/engine-layers"), "one heading is not a layer prompt");
assert.ok(codes("A photo of a cat. --ar 3:4", { engine: "soul" }).has("coherence/engine-flag"));
assert.ok(codes("A photo of a cat. AR 3:4", { engine: "nano-banana" }).has("coherence/engine-flag"));
assert.ok(!codes("A photo of a cat. --ar 3:4", { engine: "midjourney" }).has("coherence/engine-flag"));
assert.ok(codes("A photo of a cat, never an illustration.", { engine: "nano-banana" }).has("coherence/engine-ban"));
assert.ok(codes("A photo of a cat, never an illustration.", { engine: "midjourney" }).has("coherence/engine-ban"));
assert.ok(!codes("A photo of a cat. --no illustration, anime, cgi", { engine: "midjourney" }).has("coherence/engine-ban"));
assert.ok(!codes("A photo of a cat, not an illustration.", { engine: "seedream" }).has("coherence/engine-ban"));
assert.ok(codes("Shot on Kodak Portra 400.", { engine: "soul" }).has("coherence/engine-brand"));
assert.ok(!codes("Shot on Kodak Portra 400.", { engine: "nano-banana" }).has("coherence/engine-brand"));

// The Finish `8K` exception: the first 8K inside "## Finish" is allowed in an assembled prompt, any other is not.
const finish = (body, extra = "") => `A real photograph of a cat.${extra}\n\n## Finish\n${body}`;
assert.ok(!codes(finish("超写实 — Ultra-realistic 8K photographic detail."), { profile: "assembled" }).has("phrasing/quality-tag"));
assert.ok(!codes(finish("超写实 — Ultra-realistic 8K photographic detail."), { profile: "assembled" }).has("phrasing/noise-trigger"));
assert.ok(codes(finish("超写实 — Ultra-realistic 8K photographic detail.", " An 8K shot."), { profile: "assembled" }).has("phrasing/quality-tag"));
assert.ok(codes(finish("实拍 — 8K. 超写实 — Ultra-realistic 8K detail."), { profile: "assembled" }).has("phrasing/quality-tag"));
assert.ok(!codes(finish("photorealistic — Ultra-realistic 8K photographic detail."), { profile: "assembled" }).has("phrasing/quality-tag"), "the Finish 8K exception does not depend on the realism token");
assert.ok(!codes(finish("극사실 — Ultra-realistic 8K photographic detail."), { profile: "assembled" }).has("phrasing/quality-tag"));
assert.ok(codes("An 8K photograph of a cat.", { profile: "assembled" }).has("phrasing/quality-tag"));
// The Korean Finish layer (`## 마무리`) carries the same one-time exception.
assert.ok(!codes("A real photograph of a cat.\n\n## 마무리\n극사실 — 8K 극사실적인 사진 디테일: 고양이 털의 실제 결.", { profile: "assembled" }).has("phrasing/quality-tag"));
assert.ok(codes("An 8K photograph of a cat.\n\n## 마무리\n극사실 — 8K 극사실적인 사진 디테일.", { profile: "assembled" }).has("phrasing/quality-tag"));

console.log("Engine levers PASS: table shape, grades, bundles, example, engine checks and the Finish 8K exception. No generation tested.");
