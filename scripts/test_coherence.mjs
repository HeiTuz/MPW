#!/usr/bin/env node
// Text matching only: coherence/* heuristics of check_prompt.mjs. No image output is judged.
import assert from "node:assert/strict";
import { checkText } from "./check_prompt.mjs";

const codes = (text, options) => {
  const result = checkText(text, options);
  return [...result.errors, ...result.warnings].map((item) => item.code).filter((code) => /^(?:coherence|token)\//u.test(code));
};
const has = (text, code, options) => assert.ok(codes(text, options).includes(code), `${code}: ${text}`);
const lacks = (text, code, options) => assert.ok(!codes(text, options).includes(code), `${code} should not fire: ${text}`);

// occlusion: hair over the face only counts next to a face-clear line.
has("Wet bangs fall across her eyes and brows. The brows and eyes stay clear.", "coherence/occlusion");
lacks("Wet bangs fall across her eyes and brows.", "coherence/occlusion");
lacks("The hair is tucked behind her ear so the brows and eyes stay clear.", "coherence/occlusion");
lacks("Her hair does not fall across her eyes, so the brows stay clear.", "coherence/occlusion");

// focal: two lenses, or a wide lens next to the undistorted-face line; film formats are not lenses.
has("A 24mm lens. An 85mm lens.", "coherence/focal");
has("A 24mm lens up close, with no wide-angle stretch on the nose.", "coherence/focal");
has("A wide-angle lens up close, undistorted face.", "coherence/focal");
lacks("Shot on 35mm film grain with a 50mm lens.", "coherence/focal");
lacks("A 35mm film still and a 35mm cinema negative look.", "coherence/focal");
lacks("A 50mm lens and a 50 mm lens.", "coherence/focal");
lacks("A moderate telephoto lens with no wide-angle stretch on the nose.", "coherence/focal");

// identity-skin: skin colour outside the identity paragraph while the reference tone is kept.
const identity = "## Identity Reference\nIf a model reference is provided, keep her own skin tone. If none is provided, she has cool fair skin.\n\n";
has(`${identity}## Hair and makeup\nbase — A pale skin finish with a faint glow.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\nbase — A matte finish with a faint glow.`, "coherence/identity-skin");
lacks("## Hair and makeup\nbase — A pale skin finish with a faint glow.", "coherence/identity-skin");
// The natural color is flagged; a finish the makeup makes and light on the skin are not.
has(`${identity}## Hair and makeup\nbase — A base that leaves warm golden skin with a faint glow.`, "coherence/identity-skin");
has(`${identity}## Style\nlook — Tan skin against white linen.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\nbase — A semi-matte porcelain finish with a faint satin glow only on the high points.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\nbase — A glass skin finish: a thin glossy base with a soft wet sheen.`, "coherence/identity-skin");
// A porcelain base token inside Hair and makeup is a makeup finish; porcelain or the natural cold white outside it, or 冷白皮 anywhere, is still a skin color.
lacks(`${identity}## Hair and makeup\n冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\n微光冷瓷肌 — A cool porcelain base with a faint satin glow.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\nbase — A cool-toned porcelain skin finish with a faint satin glow.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\n도자기 피부 — A cool porcelain-skin base with a faint satin glow.`, "coherence/identity-skin");
has(`${identity}## Style\nlook — Porcelain skin against white linen.`, "coherence/identity-skin");
has(`${identity}## Hair and makeup\n冷白皮 — Cool fair skin with a faint glow.`, "coherence/identity-skin");
lacks(`${identity}## Light\nlow sun — A sun-warmed glow lies on the skin of her shoulders, and a neon tint falls on the cheek.`, "coherence/identity-skin");
lacks(`${identity}## Light\nwarm light — Warm light on her skin turns the shadow side amber.`, "coherence/identity-skin");

// ratio-dup: known ratios only, counted over the whole prompt; times and ratios in quotes are not ratios.
has("A vertical 3:4 frame. The 3:4 frame leaves space above.", "coherence/ratio-dup");
has("A 16:9 frame, later called 4:3.", "coherence/ratio-dup");
lacks("A vertical 3:4 frame.", "coherence/ratio-dup");
lacks("A poster that says \"11:30\" and \"3:4\", framed 16:9.", "coherence/ratio-dup");

// decimal is an error.
assert.equal(checkText("She has 7。5-head proportions.").ok, false);
lacks("She has 7.5-head proportions at f/1.4.", "coherence/decimal");

// slot-dup: lips inside Hair and makeup, the catchlight anywhere.
has("## Hair and makeup\nlip tint — A sheer coral lip tint.\nbitten — A deep red lip tapped outward.", "coherence/slot-dup");
lacks("## Hair and makeup\nlips and cheeks — A sheer coral lip tint and a rose blush.\n\n## Props and nails\nlipstick — A lipstick tube in her hand.", "coherence/slot-dup");
has("## Light\ncatchlight — A small window shaped point of light sits in each eye.\n\n## Expression\ngaze — A glint in both eyes, her catchlight bright.", "coherence/slot-dup");
lacks("## Light\ncatchlight — A small window shaped point of light sits in each eye.", "coherence/slot-dup");

// day-night.
has("A woman on a rainy night. Hard midday sun throws short shadows.", "coherence/day-night");
lacks("A woman at midday under hard sun, her daylight white balance neutral.", "coherence/day-night");
lacks("A woman on a rainy night under a sodium lamp.", "coherence/day-night");

// Scope: native checks for other engines still run these; assembled midjourney stops at engine-scope but keeps them.
has("A 24mm lens. An 85mm lens.", "coherence/focal", { engine: "higgsfield" });
has("A 24mm lens. An 85mm lens.", "coherence/focal", { profile: "assembled", engine: "midjourney" });
// token/slot-name: a layer-line token that names the slot; names of the thing shown and flat prompts pass.
has("## Hair and makeup\nhair color — Long straight black hair.", "token/slot-name");
has("## Scene\npassersby — People walk the sidewalk.\nroad surface — Gray asphalt.", "token/slot-name");
lacks("## Hair and makeup\n黒髪ロング — Long straight black hair.\nwind-blown strands — Loose strands lift.", "token/slot-name");
lacks("## Light\ncast shadows — Short hard shadows fall toward the camera.\ncatchlight — A small bright patch sits in each eye.", "token/slot-name");
lacks("A woman with hair color — dark brown — stands in the street.", "token/slot-name");
lacks("hair color — Long straight black hair, before any layer heading.", "token/slot-name");
// The slot tokens fixed-lines.md and the card frame define are allowed; the layer and category names are not.
has("## Props and nails\nnails — Short bare nails with a faint gloss.", "token/slot-name");
has("## Outfit\noutfit — A white shirt.", "token/slot-name");
has("## Scene\nbackground — A narrow shopping street.", "token/slot-name");
has("## Light\nlighting — Midday sun from behind.", "token/slot-name");
for (const token of ["face clear", "catchlight", "palette", "vertical frame", "horizontal frame", "focus", "hands"]) {
  lacks(`## Camera\n${token} — A line that fills the ${token} slot.`, "token/slot-name");
}

console.log("Coherence matching: occlusion, focal, identity-skin, ratio-dup, decimal, slot-dup, day-night and token/slot-name cases pass; image output NOT RUN.");
