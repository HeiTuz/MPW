#!/usr/bin/env node
// Text matching only: coherence/* heuristics of check_prompt.mjs. No image output is judged.
import assert from "node:assert/strict";
import { checkText } from "./check_prompt.mjs";
import { loadAll } from "./find_tokens.mjs";

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
lacks("A 35mm photograph shot on a 50mm lens.", "coherence/focal");
has("A 35mm photograph shot on a 50mm lens with an 85mm lens beside it.", "coherence/focal");
lacks("A moderate telephoto lens with no wide-angle stretch on the nose.", "coherence/focal");
has("A 24mm lens up close. 自然透视 — the face keeps natural perspective.", "coherence/focal", { profile: "native" });
has("A wide-angle lens up close, 自然透视 face.", "coherence/focal");
has("A wide-angle lens up close, natural perspective face.", "coherence/focal");
lacks("natural perspective — The camera stands back with a standard-to-moderate telephoto lens, so the face keeps natural perspective.", "coherence/focal");
// Original-language lens words: the wide forms count, but the bare 广角 of the lens fixed line ("no 广角 stretch") does not.
has("A 超广角 lens up close. 自然透视 — the face keeps natural perspective.", "coherence/focal");
has("A 広角レンズ up close, natural perspective face.", "coherence/focal");
lacks("自然透视 — The camera stands back with a 标准至中长焦 lens, so the face keeps natural perspective with no 广角 stretch on the nose or forehead.", "coherence/focal");

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
has(`${identity}## Style\nlook — 맑고 흰 피부 against white linen.`, "coherence/identity-skin");
has(`${identity}## Style\nlook — 色白の肌 against white linen.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\n冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\n微光冷瓷肌 — A cool porcelain base with a faint satin glow.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\nbase — A cool-toned porcelain skin finish with a faint satin glow.`, "coherence/identity-skin");
lacks(`${identity}## Hair and makeup\n도자기 피부 — A cool porcelain-skin base with a faint satin glow.`, "coherence/identity-skin");
has(`${identity}## Style\nlook — Porcelain skin against white linen.`, "coherence/identity-skin");
has(`${identity}## Hair and makeup\n冷白皮 — Cool fair skin with a faint glow.`, "coherence/identity-skin");
lacks(`${identity}## Light\nlow sun — A sun-warmed glow lies on the skin of her shoulders, and a neon tint falls on the cheek.`, "coherence/identity-skin");
lacks(`${identity}## Light\nwarm light — Warm light on her skin turns the shadow side amber.`, "coherence/identity-skin");

// A split makeup layer (`## Makeup`) is read like Hair and makeup: porcelain base passes, two lip lines count.
lacks(`${identity}## Makeup\n冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.`, "coherence/identity-skin");
has(`${identity}## Hair\nlong hair — Long dark hair.\n\n## Makeup\nlip tint — A sheer coral lip tint.\nbitten — A deep red lip tapped outward.`, "coherence/slot-dup");
lacks(`## Hair\nlip-length bob — A bob ending at the lips.\n\n## Makeup\nlip tint — A sheer coral lip tint.`, "coherence/slot-dup");

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
has("## Light\n창문 캐치라이트 — A soft rectangular highlight sits in the upper part of each iris.\n\n## Expression\ngaze — A glint in both eyes, her catchlight bright.", "coherence/slot-dup");
has("## Light\nキャッチライト — A small window point of light in each eye.\n\n## Expression\ngaze — A catchlight bright in both eyes.", "coherence/slot-dup");

// day-night.
has("A woman on a rainy night. Hard midday sun throws short shadows.", "coherence/day-night");
lacks("A woman at midday under hard sun, her daylight white balance neutral.", "coherence/day-night");
lacks("A woman on a rainy night under a sodium lamp.", "coherence/day-night");
// Korean words: 한밤, 심야, 야경, 밤하늘, 밤에 against 한낮, 정오, 대낮. 밤 alone is also the chestnut, 밤색 is a brown, 야채 is not 야경 and 정오각형 is a pentagon.
has("A woman on a 한밤 street. 정오 sun overhead.", "coherence/day-night");
has("심야 편의점 앞, 한낮의 햇빛 같은 직사광.", "coherence/day-night");
has("A woman under the 밤하늘 at 대낮 light.", "coherence/day-night");
has("A woman walking 밤에 under 한낮 sun.", "coherence/day-night");
lacks("A market stall selling roasted 밤 in paper cones, Noon Sunlight.", "coherence/day-night");
lacks("An old woman peels 밤을 on a straw mat under 한낮 sun.", "coherence/day-night");
lacks("A pentagon sign shaped like a 정오각형 in the dark night.", "coherence/day-night");
lacks("A woman in a 밤색 coat at 정오.", "coherence/day-night");
lacks("A woman on a 한밤 street under a 가로등.", "coherence/day-night");
lacks("A woman at 정오 beside a market of 야채 stalls.", "coherence/day-night");
// Line heads carry it too: a night-only Scene row beside a midday-only Light row, in any language; two night rows, or a night row with a plain Light row, are one time of day.
const dayNight = (scene, light) => `A candid street photograph of a woman.\n\n## Scene\n${scene} — A place.\n\n## Light\n${light} — Some light.`;
has(dayNight("夜市", "正午顶光"), "coherence/day-night");
has(dayNight("심야식당", "직사광"), "coherence/day-night");
has(dayNight("花火大会", "Harsh Midday Sun"), "coherence/day-night");
has(dayNight("tennis club court", "Moonlight"), "coherence/day-night");
lacks(dayNight("夜市", "Moonlight"), "coherence/day-night");
lacks(dayNight("편의점", "직사광"), "coherence/day-night");
lacks(dayNight("한강 야경", "窓辺の光"), "coherence/day-night");
// A landmark or street seen by day and by night carries no time tag: it does not clash with midday light. Limit: a night view written for a landmark must name the night itself (밤 베란다, 심야식당).
lacks(dayNight("東京タワー", "직사광"), "coherence/day-night");
lacks(dayNight("维多利亚港", "Noon Sunlight"), "coherence/day-night");
lacks(dayNight("Sacré-Cœur", "Moonlight"), "coherence/day-night");
// The warning names the heads that gave the cue.
assert.ok(checkText(dayNight("夜市", "正午顶光")).warnings.find((item) => item.code === "coherence/day-night").message.includes("夜市"), "day-night names the heads");

// legwear: a Legwear stockings or tights line next to an Outfit garment that covers the whole leg, read through the lexicon rows so any language's head counts.
const legs = (outfit, legwear, outfitSentence = "A garment.", legSentence = "A line.") => `A natural-light photograph of a woman on a street.\n\n## Outfit\n${outfit} — ${outfitSentence}\n\n## Legwear\n${legwear} — ${legSentence}`;
has(legs("와이드 팬츠", "스타킹"), "coherence/legwear");
has(legs("阔腿裤", "黑丝"), "coherence/legwear");
has(legs("デニムパンツ", "黒タイツ"), "coherence/legwear");
has(legs("Pantalon à pinces", "Collant noir"), "coherence/legwear");
has(legs("ロングスカート", "ストッキング"), "coherence/legwear");
// A head with no row is read as English: trousers or tights as a word, not shorts, knee socks or bare legs.
has(legs("linen trousers", "black tights"), "coherence/legwear");
lacks(legs("linen shorts", "black tights"), "coherence/legwear");
lacks(legs("linen trousers", "knee socks"), "coherence/legwear");
lacks(legs("linen trousers", "bare legs"), "coherence/legwear");
// A short skirt, knee socks, ankle socks and bare legs leave nothing to hide; a slit, rips or a cropped hem in the Outfit sentence, or a rip in the Legwear sentence, show the leg on purpose.
lacks(legs("플리츠 스커트", "스타킹"), "coherence/legwear");
lacks(legs("와이드 팬츠", "니삭스"), "coherence/legwear");
lacks(legs("와이드 팬츠", "素足"), "coherence/legwear");
lacks(legs("와이드 팬츠", "스타킹", "Wide trousers with a long slit up each leg."), "coherence/legwear");
lacks(legs("와이드 팬츠", "스타킹", "Wide trousers, cropped at the shin."), "coherence/legwear");
lacks(legs("Cotton Maxi Dress", "damask tights", "A dress faintly translucent where the low sun comes through."), "coherence/legwear");
lacks(legs("와이드 팬츠", "데미지 스타킹", "Wide trousers.", "Tights with torn holes."), "coherence/legwear");
lacks("A photograph.\n\n## Legwear\n스타킹 — Fine sheer stockings.", "coherence/legwear");
lacks("A photograph.\n\n## Outfit\n와이드 팬츠 — Wide trousers.", "coherence/legwear");
// Hems that stop above the ankle show the stockings: the ankle, the strip between hem and shoe, a lifted hem in either sentence leaves the warning out. No cue, the clash stays.
lacks(legs("ワイドパンツ", "黒ストッキング", "Wide trousers whose hem stops just above the ankle bone.", "Sheer stockings show in the strip of ankle."), "coherence/legwear");
lacks(legs("ロングスカート", "シアータイツ", "A long skirt that ends a hand's width above the shoes.", "Sheer tights."), "coherence/legwear");
lacks(legs("와이드 팬츠", "스타킹", "Wide trousers.", "Nude stockings visible between the hem and the loafers."), "coherence/legwear");
lacks(legs("ankle-length trousers", "black sheer tights"), "coherence/legwear");
has(legs("와이드 팬츠", "스타킹", "Wide trousers falling to the floor.", "Black stockings."), "coherence/legwear");
has(legs("floor-length trousers", "black tights"), "coherence/legwear");
// Long garments of every culture: kimono, yukata, hanbok skirt, mamianqun, gowns. A bare jacket (저고리) and short or ankle-baring rows do not.
has(legs("着物", "黒ストッキング"), "coherence/legwear");
has(legs("기모노", "스타킹"), "coherence/legwear");
has(legs("浴衣", "シアータイツ"), "coherence/legwear");
has(legs("한복", "스타킹"), "coherence/legwear");
has(legs("马面裙", "丝袜"), "coherence/legwear");
has(legs("Chiffon Maxi", "스타킹"), "coherence/legwear");
has(legs("와이드 팬츠", "시스루 스타킹"), "coherence/legwear");
has(legs("슬랙스", "Collants opaques"), "coherence/legwear");
has(legs("슬랙스", "low-rise sheer tights"), "coherence/legwear");
lacks(legs("저고리", "스타킹"), "coherence/legwear");
lacks(legs("Pantalon cigarette", "스타킹"), "coherence/legwear");

// body-dir: an Expression row that turns the body away beside a Pose row that faces the camera square on (or the reverse); the rows that agree, or no body tag, pass.
const dir = (expression, pose) => `A natural-light photograph of a woman on a terrace.\n\n## Expression\n${expression} — A look.\n\n## Pose\n${pose} — A pose.`;
has(dir("뒤돌아 꽂히는 시선", "前置自拍"), "coherence/body-dir");
has(dir("Turnaround Laugh", "気をつけ"), "coherence/body-dir");
has(dir("Retrait hautain", "Skateboard Stand"), "coherence/body-dir");
lacks(dir("뒤돌아 꽂히는 시선", "뒤돌아보기"), "coherence/body-dir");
lacks(dir("담담한 눈빛", "前置自拍"), "coherence/body-dir");
lacks(dir("뒤돌아 꽂히는 시선", "seated turn"), "coherence/body-dir");
lacks("A photograph.\n\n## Pose\n前置自拍 — A front-facing selfie.\n\n## Pose and hands\n뒤돌아보기 — Body faces away.", "coherence/body-dir");

// pose-place: a Pose row that needs a place (car, rail, stair, bed, sofa, water's edge, road, elevator) when nothing outside the Pose layer shows it.
// The place is shown by an English word in the opener or any other layer, or by the English description of any line-head row outside Pose (택시 뒷좌석 describes a taxi).
const place = (pose, scene, opener = "A natural-light photograph of a woman.") => `${opener}\n\n## Pose\n${pose} — A pose.\n\n## Scene\n${scene}`;
has(place("Car Window Lean", "terrace — A pale stone terrace."), "coherence/pose-place");
has(place("계단에 앉기", "plain — A plain grey wall."), "coherence/pose-place");
has(place("趴栏杆", "plain — A plain grey wall."), "coherence/pose-place");
has(place("누워서 폰 보기", "plain — A plain grey wall."), "coherence/pose-place");
has(place("Un genou sur le canapé", "plain — A plain grey wall."), "coherence/pose-place");
has(place("Wet Sand Stretch", "plain — A plain grey wall."), "coherence/pose-place");
has(place("Highway Stance", "plain — A plain grey wall."), "coherence/pose-place");
has(place("엘리베이터 셀카", "plain — A plain grey wall."), "coherence/pose-place");
lacks(place("Car Window Lean", "택시 뒷좌석 — The city moves past."), "coherence/pose-place");
lacks(place("Car Window Lean", "lot — A lot with a parked hatchback."), "coherence/pose-place");
lacks(place("Car Window Lean", "plain — A plain grey wall.", "A photograph of a woman beside a car."), "coherence/pose-place");
lacks(place("계단에 앉기", "石板街 — A narrow lane."), "coherence/pose-place");
lacks(place("누워서 폰 보기", "원룸 — A compact room."), "coherence/pose-place");
lacks(place("seated turn", "plain — A plain grey wall."), "coherence/pose-place");
// The scene may name the place in its own language: a native word in the opener, a line head or a sentence shows it as an English word does.
lacks(place("계단에 앉기", "달동네 골목 — Worn concrete 계단 climb between two red-brick houses."), "coherence/pose-place");
lacks(place("下楼梯", "旋转楼梯 — A spiral 楼梯 of white marble."), "coherence/pose-place");
lacks(place("台阶驻足垂眸", "石の階段 — Moss-covered 階段 lead up to a vermilion shrine gate."), "coherence/pose-place");
lacks(place("凭栏远眺", "江边步道 — A waist-high iron 栏杆 along the river."), "coherence/pose-place");
lacks(place("凭桥看水", "石拱桥 — A stone arch 桥 over a narrow canal."), "coherence/pose-place");
lacks(place("엘리베이터 셀카", "엘리베이터 — The mirrored walls of a small 엘리베이터 cabin."), "coherence/pose-place");
lacks(place("누워서 폰 보기", "plain — A plain grey wall.", "A woman on her 침대 at night."), "coherence/pose-place");
// Poses whose row is not about one place carry no place tag: a lean against a wall, a towel for wet hair.
lacks(place("Arms Folded Lean", "brick wall — A sunlit red-brick wall."), "coherence/pose-place");
lacks(place("擦头发", "욕실 — A white-tiled bathroom."), "coherence/pose-place");
// A head's tags count only when every row of that name in that layer has them; a layer named Posture is the Pose layer too.
has(dir("뒤돌아 꽂히는 시선", "前置自拍").replace("## Pose", "## Posture"), "coherence/body-dir");

// Every tag these checks read names something the checks know: each tagged row, written alone, fires its code. A name that another row of the same layer also carries
// as an alias (백심 스타킹) is read as no tag at all (every row of a head must have it), so those rows are skipped here.
const key = (text) => text.normalize("NFKC").toLowerCase().replace(/[\s\-\u00b7\u30fb]+/gu, "");
const taggedRows = (slug, tag) => {
  const rows = loadAll().find((layer) => layer.slug === slug).rows;
  return rows.filter((row) => row.tags.includes(tag) && !rows.some((other) => other !== row && [other.token, ...other.aliases].some((name) => key(name) === key(row.token))));
};
const fires = (text, code) => checkText(text, { profile: "native", surface: "s3", engine: "gpt-image" }).warnings.some((item) => item.code === code);
const kinds = loadAll().find((layer) => layer.slug === "pose").rows.flatMap((row) => row.tags.filter((tag) => tag.startsWith("장소:")));
assert.ok(kinds.length > 40 && new Set(kinds).size === 8, "eight place kinds in use");
for (const kind of new Set(kinds)) {
  for (const row of taggedRows("pose", kind)) assert.ok(fires(place(row.token, "plain — A plain grey wall."), "coherence/pose-place"), `pose-place: ${row.token} ${kind}`);
}
for (const row of taggedRows("outfit", "긴 기장")) assert.ok(fires(legs(row.token, "ストッキング"), "coherence/legwear"), `legwear Outfit row: ${row.token}`);
for (const row of taggedRows("legwear", "스타킹류")) assert.ok(fires(legs("와이드 팬츠", row.token), "coherence/legwear"), `legwear Legwear row: ${row.token}`);
for (const row of taggedRows("expression", "몸:등")) assert.ok(fires(dir(row.token, "前置自拍"), "coherence/body-dir"), `body-dir Expression row: ${row.token}`);
for (const row of taggedRows("pose", "몸:정면")) assert.ok(fires(dir("뒤돌아 꽂히는 시선", row.token), "coherence/body-dir"), `body-dir Pose row: ${row.token}`);
for (const [slug, layer] of [["light", "Light"], ["scene", "Scene"]]) {
  for (const row of taggedRows(slug, "밤 한정")) assert.ok(fires(`A photograph.\n\n## ${layer}\n${row.token} — A line.\n\n## Light\nHarsh Midday Sun — Some light.`, "coherence/day-night"), `day-night night row: ${slug} ${row.token}`);
  for (const row of taggedRows(slug, "한낮 한정")) assert.ok(fires(`A photograph.\n\n## ${layer}\n${row.token} — A line.\n\n## Scene\n夜市 — A line.`, "coherence/day-night"), `day-night midday row: ${slug} ${row.token}`);
}

console.log("Coherence matching: occlusion, focal, identity-skin, ratio-dup, decimal, slot-dup, day-night, legwear, body-dir, pose-place and token/slot-name cases pass; image output NOT RUN.");
