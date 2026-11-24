#!/usr/bin/env node
// check_prompt.mjs warns when a prompt hands the pose choice to the model (phrasing/pick-one) or lists poses in the Pose layer (coherence/pose-options). One image is one pose.
import assert from "node:assert/strict";
import { checkText } from "./check_prompt.mjs";

const PICK = "phrasing/pick-one";
const POSE = "coherence/pose-options";
const head = "A woman by a window, one photograph.\n\n## Scene\nroom — A bright room with one window.\n\n";
const codes = (text, options = {}) => checkText(text, options).warnings.map((warning) => warning.code);
const withPose = (...lines) => `${head}## Pose\n${lines.join("\n")}\n`;

for (const phrase of [
  "Choose exactly one of the poses.", "Choose only one pose.", "choose one of these.", "Pick exactly one pose.", "Pick one pose.",
  "Select one of the poses.", "Use one of the following poses.", "Use any one of these poses.", "다음 중 하나를 쓴다.", "이 중 하나를 골라 그린다.", "포즈는 하나를 고르세요.",
  "Pose: choose one of these.", "- Pick one pose.", "You must choose exactly one.", "Please choose one of the poses.",
]) {
  for (const profile of ["native", "assembled"]) assert.ok(codes(`${phrase}\n${head}`, { profile }).includes(PICK), `${profile}: ${phrase}`);
}
for (const phrase of [
  "She picks one flower from the basket.", "She can pick one up from the shelf.", "One of her hands rests on the rail.", "The coat hangs on either side of the door.",
  "The left or right hand holds the cup.", "She chose one dress.", "Only one window is lit.",
  "Her fingers are about to pick one petal off the daisy.", "She will choose one of the two cups on the tray.", "The vendor lets her select one of the oranges.",
  "꽃 하나를 골라 든 손이 가슴께에 있다.", "진열대에서 반지 하나를 고르는 순간의 손.", "다음 중 하나라도 빠지면 어색하다는 듯 웃는다.", "她挑一朵, 꽃 하나를 골라 귀에 꽂는다.",
]) assert.ok(!codes(`${phrase}\n${head}`).includes(PICK), phrase);
assert.ok(!codes(`A sign reads "Choose one of the following".\n${head}`).includes(PICK), "quoted copy is not read");

for (const lines of [
  ["1. Standing, hands in the pockets.", "2. Sitting on the sill."],
  ["1) Standing.", "2) Seated."],
  ["- Standing at the window.", "- Sitting on the sill."],
  ["Option A — standing at the window.", "Option B — sitting on the sill."],
  ["Pose 1 — standing at the window.", "Pose 2 — sitting on the sill."],
  ["stance — She is standing or sitting on the sill."],
  ["stance — Leaning on the frame or walking toward the camera."],
  ["stance — Walking, standing, or sitting on the sill."],
  ["자세 — 창가에 서 있거나 또는 창턱에 앉아 있다."],
  ["stance — She stands at the window; or sits on the sill; or leans on the frame; or kneels."],
  ["Options: standing at the window; sitting on the sill; leaning on the frame; walking toward camera."],
  ["Pose: one of standing, sitting, leaning, walking."],
  ["stance — Standing at the window, or", "sitting on the sill."],
]) assert.ok(codes(withPose(...lines)).includes(POSE), lines.join(" / "));
// The layer heading may differ in case, level or trailing words.
for (const heading of ["## POSE", "## Pose and hands", "### Pose", "## 포즈"]) assert.ok(codes(`${head}${heading}\n1. Standing.\n2. Sitting.\n`).includes(POSE), heading);
assert.ok(!codes(`${head}## Posed props\n1. Standing lamp.\n2. Sitting cushion.\n`).includes(POSE), "a layer that only starts with the letters pose");

for (const lines of [
  ["weight shift — Her weight rests on the right leg, either side of the frame stays clear.", "hands — One of her hands holds the strap while the left or right hand rests in the pocket.", "turn — The shoulders face the window and the head turns back toward the lens."],
  ["stance — She stands at the window with one hand on the frame."],
  ["- Standing at the window."],
  ["stance — Standing with the weight on one leg, the right hand on the hip or the sill."],
  ["stance — standing tall, not leaning or sitting"],
  ["stance — seated on the step, never lying or kneeling"],
  ["stance — kneeling on one knee to tie a lace, the other foot flat — no standing or walking blur"],
  ["stance — Seated on the step, leaning forward; the hands rest on the knees."],
]) assert.ok(!codes(withPose(...lines)).includes(POSE), lines.join(" / "));
// Only the Pose layer is read for lists: the same lines elsewhere pass.
assert.ok(!codes(`${head}## Props\n1. A cup.\n2. A book.\nstance — standing or sitting.\n`).includes(POSE));

// Both are warnings, never errors.
assert.equal(checkText(withPose("1. Standing.", "2. Sitting.")).ok, true);
