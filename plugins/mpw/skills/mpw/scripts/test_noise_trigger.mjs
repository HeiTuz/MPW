#!/usr/bin/env node
// Text matching only: no image generation or noise-reduction claim.
import assert from "node:assert/strict";
import { checkText } from "./check_prompt.mjs";

const CODE = "phrasing/noise-trigger";
const flagged = (text, options) => checkText(text, options).warnings.find((item) => item.code === CODE)?.evidence ?? [];

const warn = [
  ["An ultra-detailed 8k portrait with film grain, no text, no watermark.", ["ultra-detailed", "8k", "film grain"]],
  ["LIGHT: Kodak Portra look with film grain, no flash.", ["film grain"]],
  ["LIGHT: soft window light, no flash, fine film grain.", ["film grain"]],
  ["Do not change the face; add heavy film grain.", ["film grain"]],
  ["새벽 항구, 필름 그레인, 초고화질, 글자 없이.", ["필름 그레인", "초고화질"]],
  ["A hyperdetailed market street with intricate details and floating particles.", ["hyperdetailed", "intricate details", "floating particles"]],
  ["Soft tones with film grain and no text.", ["film grain"]],
];
for (const [text, expected] of warn) assert.deepEqual(flagged(text), expected, text);

const quiet = [
  "No film grain, speckled noise or gritty texture.",
  "CONSTRAINTS: No film grain, speckled noise or gritty texture.",
  "Keep the sky clean: no film grain, gritty texture or noise.",
  "A harbor at dawn with the film grain removed.",
  "A film-grain-free product shot on a white sweep.",
  "Nothing here is grainy.",
  "Remove the noise and grain from this image. Keep every line, edge and detail unchanged.",
  "필름 그레인, 입자감 없이 고른 하늘.",
  "초고화질 표현은 쓰지 않는다.",
  "A poster with the headline \"8K FILM GRAIN NIGHT\" in white.",
  "A few dust motes inside the window beam only.",
  "Glitter on the eyelids and a textured background wall.",
];
for (const text of quiet) assert.deepEqual(flagged(text), [], text);

// Scope: GPT Image only, and a warning in both profiles.
const sample = "A harbor with heavy film grain.";
assert.deepEqual(flagged(sample, { profile: "assembled", surface: "s2", engine: "higgsfield" }), []);
assert.deepEqual(flagged(sample, { profile: "assembled" }), ["film grain"]);
assert.equal(checkText(sample).ok, true);
console.log(`Noise trigger matching: ${warn.length} flagged and ${quiet.length} quiet inputs pass; image output NOT RUN.`);
