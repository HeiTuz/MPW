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

// Finish tokens come from a per-culture table (CN KR JP FR and English) and the realism line has a low-resolution replacement.
const finishTable = text.split(/^## Finish$/mu)[1]?.split(/^- `closer`/mu)[0] ?? "";
for (const culture of ["CN", "KR", "JP", "FR", "US·그 밖"]) assert.match(finishTable, new RegExp(`^\\| ${culture}[^|]* \\| \`[^\`]+\` \\| \`[^\`]+\` \\| \`[^\`]+\` \\|$`, "mu"), `Finish token row ${culture}`);
assert.match(text, /`native resolution — The frame holds the resolution of a <그 매체>/u, "realism replacement line for low-resolution media");

// Beautifying lines are conditioned on an adult; a child or student turns them off.
assert.match(text, /\*\*성인 인물에만\*\*/u);
assert.match(text, /아이·학생[^\n]*미화 줄[^\n]*끈다/u);
assert.match(text, /^성인이고 얼굴이 보일 때만 붙인다\./mu);

// 8K appears only on instruction lines: the realism line and the Korean form (its note and its realism line, which carry 8K like the English line).
// The one-time 8K rule itself lives in image-brief.md section 4 ('문장 쓰는 법').
const eightK = text.split("\n").filter((line) => /8K/u.test(line));
assert.equal(eightK.length, 3, `8K lines: ${eightK.map((line) => line.slice(0, 30)).join(" | ")}`);
assert.ok(eightK.every((line) => /^- `realism`:|^한국어 문안|^극사실 — 8K /u.test(line)), "8K only in the realism line and the Korean form");
assert.equal(text.match(/^극사실 — 8K /mu)?.length, 1, "the Korean realism line carries 8K");
// The lens line is the one natural-perspective line (CN token 自然透视, every other culture English), and the retired token is gone from the instructions.
assert.match(text, /^- `lens`: `<토큰> — [^\n]*`自然透视`[^\n]*`natural perspective`/mu);
assert.ok(!/无畸变/u.test(text), "the lens token is 自然透视");
// The culture-fixed tokens liner, face-light and grain are per culture, so no Chinese token is the only form (CN first, the others after it).
for (const [slot, cn, others] of [["liner", "内眼线", ["점막 아이라인", "インライン", "tightline"]], ["face-light", "立体光", ["soft key light"]]]) {
  const bullet = text.split(new RegExp(`^- \`${slot}\`:`, "mu"))[1]?.split(/^- /mu)[0] ?? "";
  assert.ok(bullet.includes(cn) && others.every((token) => bullet.includes(token)), `${slot} tokens per culture`);
}
const noise = text.match(/^- `grain`\(디지털[^\n]*/mu)?.[0] ?? "";
for (const token of ["数码噪点", "디지털 노이즈", "デジタルノイズ", "digital noise"]) assert.ok(noise.includes(token), `digital noise token ${token}`);
const filmGrain = text.match(/^- `grain`\(필름[^\n]*/mu)?.[0] ?? "";
for (const token of ["胶片颗粒", "필름 그레인", "粒状感", "film grain"]) assert.ok(filmGrain.includes(token), `film grain token ${token}`);
assert.match(brief, /fixed-lines\.md/);
console.log(`Fixed lines: ${slots.length} slots, ${lines.length} lines, five cultures covered; image output NOT RUN.`);
