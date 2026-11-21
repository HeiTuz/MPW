#!/usr/bin/env node
// Structure only: slot names, culture coverage, the adult-only condition and the line shape.
// The wording of the lines is not pinned and no image output is judged.
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
const text = read("references/image/fixed-lines.md");
const brief = read("references/image/image-brief.md");

// Slots: every "- `slot`(qualifier):" bullet names one slot once.
const slots = [...text.matchAll(/^- ((?:`[a-z-]+`)(?:\+`[a-z-]+`)?)(\([^)]*\))?:/gmu)].map((match) => match[1] + (match[2] ?? ""));
assert.ok(slots.length >= 12, `slot bullets: ${slots.join(", ")}`);
assert.equal(new Set(slots).size, slots.length, `duplicate slot names: ${slots.join(", ")}`);
for (const slot of ["`face-clear`", "`base`", "`under-eye`", "`liner`", "`blush`", "`lip`", "`face-light`", "`catchlight`", "`lens`", "`closer`", "`realism`", "`anti-cg`"]) {
  assert.ok(slots.includes(slot), `slot ${slot}`);
}
assert.ok(slots.some((slot) => slot.startsWith("`grain`(필름")) && slots.some((slot) => slot.startsWith("`grain`(디지털")), "grain has a film and a digital slot");

// Culture lines: the identity table and every culture-specific slot cover KR CN JP US FR.
const cultures = ["KR", "CN", "JP", "US", "FR"];
for (const culture of cultures) assert.match(text, new RegExp(`^\\| ${culture} \\| she is a 22-year-old`, "mu"), `identity formula ${culture}`);
for (const slot of ["base", "blush", "lip"]) {
  const part = text.split(new RegExp(`^- \`${slot}\`:`, "mu"))[1]?.split(/^- `/mu)[0] ?? "";
  for (const culture of cultures) assert.match(part, new RegExp(`^  - ${culture} \``, "mu"), `${slot} line for ${culture}`);
}

// Every quoted line has the `token — sentence.` shape.
const lines = [...text.matchAll(/`([^`\n]+ — [^`\n]+)`/gu)].map((match) => match[1]);
assert.ok(lines.length >= 25, `${lines.length} fixed lines`);
for (const line of lines) assert.match(line, /^[^—]+ — [A-Z<].*[.>]$/u, line);

// Beautifying lines are conditioned on an adult; a child or student turns them off.
assert.match(text, /\*\*성인 인물에만\*\*/u);
assert.match(text, /아이·학생[^\n]*미화 줄[^\n]*끈다/u);
assert.match(text, /^성인이고 얼굴이 보일 때만 붙인다\./mu);

// 8K appears once in the whole file as an instruction line, and the brief points here for it.
assert.equal((text.match(/8K/g) ?? []).length, 2, "8K only in the realism line and its one-time rule");
assert.match(brief, /fixed-lines\.md/);
console.log(`Fixed lines: ${slots.length} slots, ${lines.length} lines, five cultures covered; image output NOT RUN.`);
