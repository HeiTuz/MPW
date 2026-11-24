#!/usr/bin/env node
// mix/* shapes the fixtures do not cover: what the one-name check skips (layer headings, the first line's medium or look phrase,
// the Finish closer, the Identity paragraph) and where a spaced phrase may stand. Text matching only; no image output is judged.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { checkText } from "./check_prompt.mjs";

const codes = (text) => {
  const result = checkText(text, { profile: "native", surface: "s3", engine: "gpt-image" });
  return [...result.errors, ...result.warnings].map((item) => item.code).filter((code) => code.startsWith("mix/"));
};
const has = (text, code) => assert.ok(codes(text).includes(code), `${code} expected:\n${text}`);
const lacks = (text, code) => assert.ok(!codes(text).includes(code), `${code} not expected: ${codes(text).join(", ")}\n${text}`);

// A layer heading in English is the layer's name, not a second name for the line-head thing (## Veranda over 縁側).
lacks("A quiet natural-light photograph of a cat napping on the wooden 縁側 of an old country house.\n\n## Veranda\n縁側 — Long wooden boards along the outside of the house, worn smooth.\ngarden edge — Moss and round stones lie below the 縁側.", "mix/renamed");
// The first line's medium phrase and the Finish closer name the medium, not a thing (compact digital camera beside the コンデジ line).
lacks("A Japanese everyday compact digital camera snapshot: a woman stands on a sunlit 商店街.\n\n## Optics\nコンデジ — A pocket compact with a tiny CCD sensor, sharp from front to back.\n白飛び — The sky clips to flat white.\n\n## Finish\nコンデジ — The whole frame reads as an everyday compact digital camera snapshot, not a fashion shoot.", "mix/renamed");
// A look card's first-line phrase may be the English name of a Style token (Tokyo noir beside 東京ノワール).
lacks("A rainy-night Tokyo noir film still shot on a large-sensor digital camera: a woman under a ビニール傘 in 歌舞伎町.\n\n## Style\n東京ノワール — Cold neon on black rain-slick streets.\npalette — Violet, cyan and black.", "mix/renamed");
// The scene part of the first line still counts: a paperback there is the 文庫本 under another name.
has("A natural-light photograph of a young woman reading a paperback by the window.\n\n## Props and nails\n文庫本 — A small book in a paper cover, held open in her left hand.\nnails — Short bare nails.", "mix/renamed");
// The Identity paragraph is a fixed formula: its 冷白皮 is not a second name for the 冷白瓷肌 base line.
lacks("A 1990s Hong Kong film still shot on tungsten cinema negative: a woman under a neon sign.\n\n## Identity Reference\nIf a model reference is provided, keep her own skin tone. If none is provided, she is a 22-year-old Chinese woman with a clean 下颌线 and 冷白皮.\n\n## Hair and makeup\n冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.\nface clear — The hair is tucked behind one ear.", "mix/renamed");

// One spaced phrase a line in Expression and Style; none elsewhere; two in one line is too many.
lacks("A natural-light photograph of a woman at a window seat.\n\n## Expression\n나른한 눈빛 — Her eyes rest past the lens, 눈꺼풀은 독서의 여운으로 아직 나른하다.\n\n## Style\n꾸안꾸 — The look reads as 힘 뺀 듯 갖춘 차림: soft neutrals and clean cuts.", "mix/line");
has("A natural-light photograph of a woman at a window seat.\n\n## Scene\n한옥 카페 — Dark beams overhead and 자갈 깔린 작은 마당 beyond the window.\nwindow — Wooden lattice divides the glass.", "mix/line");
has("A natural-light photograph of a woman at a window seat.\n\n## Expression\n멈칫 — 입술이 살짝 벌어지고 숨이 멎는다, her eyes up, 미간은 아직 편안한 채로 있다.\ngaze — She looks past the lens.", "mix/line");
// A long Expression phrase is built on a table phrase (눈꺼풀, 입술, 미간 …); one that is not is unlisted.
lacks("A natural-light photograph of a woman at a window seat.\n\n## Expression\n멈칫 — 입술이 살짝 벌어지고 미간은 편안하다, as if a sound pulled her out of the book.\ngaze — She looks past the lens.", "mix/unlisted");
has("A natural-light photograph of a woman at a window seat.\n\n## Expression\n멈칫 — 어깨가 굳고 숨이 잠깐 멎는다, as if a sound pulled her out of the book.\ngaze — She looks past the lens.", "mix/unlisted");

// Short Expression words are read too: a word no table, lexicon or card carries is unlisted, and a long phrase must carry every word of a table phrase.
has("A natural-light photograph of a woman at a window seat.\n\n## Expression\nwet eyes — Her 눈동자 trembles and her 슬픔 shows, her chin low.\ngaze — She looks past the lens.", "mix/unlisted");
has("A natural-light photograph of a woman at a window seat.\n\n## Expression\nsad face — Her chin drops and 표정이 아주 슬프고 몹시 외롭다, eyes on the floor.\ngaze — She looks past the lens.", "mix/unlisted");
lacks("A natural-light photograph of a woman at a window seat.\n\n## Expression\n멍때리기 — Her eyes rest on the window, 눈빛이 멍하고 차가운, as if she forgot the cup.\ngaze — She looks past the lens.", "mix/unlisted");
// Exact copy in quotes is the photo's or the user's text, not mixed-in words.
lacks("A natural-light photograph of a small shop front.\n\n## Scene\nshop sign — A white board over the door reads \"営業中\" in small black letters, the only text in the frame.\nchalkboard — A stand by the door reads \"오늘의 커피\" in chalk.", "mix/unlisted");
// One photo-term column a prompt, read from the Finish tokens: 高光 in a JP prompt and 白飛び in a KR prompt are the other column; 高光 in a KR prompt is not.
const finish = (realism, cg) => `\n\n## Finish\n${realism} — Ultra-realistic 8K photographic detail.\n${cg} — A real photograph, never an illustration, 3D render or CGI.`;
const optics = (word) => `A natural-light photograph of a woman by a window.\n\n## Optics\nclean color — Natural color with ${word} on the shirt that roll off smoothly.\nfocus — Her face is sharp.`;
has(optics("高光") + finish("高精細", "実写"), "mix/culture");
has(optics("白飛び") + finish("극사실", "실사 촬영"), "mix/culture");
lacks(optics("高光") + finish("극사실", "실사 촬영"), "mix/culture");
lacks(optics("最暗部") + finish("高精細", "実写"), "mix/culture");

// No Finish layer: the culture is read from the language of the line heads and sentence words, then from place cues, so the other mix checks still run.
const count = (text, code) => codes(text).filter((item) => item === code).length;
lacks(optics("高光"), "mix/culture");
// A lead of three decides: line heads and sentence words in one language against a single token of the other.
const light = (...heads) => "\n\n## Light\n" + heads.map((head) => `${head} — Soft low sun.`).join("\n");
has(optics("白飛び").replace("clean color", "깨끗한 색").replace("focus —", "초점 —") + light("노을빛", "그림자", "역광"), "mix/culture");
has(optics("高光").replace("clean color", "自然な色").replace("focus —", "ピント —") + light("西日", "木漏れ日", "逆光"), "mix/culture");
// One Japanese head in a Paris scene is not a JP prompt, so its French head is not out of place.
lacks("A street photograph of a young woman on the Seine embankment in Paris.\n\n## Outfit\nデニムジャケット — A snow-washed denim jacket.\n\n## Pose\nAdossée à la vitrine — Her back rests against a bookshop window.", "mix/culture");
// One Han chunk and one kana chunk tie, so the place decides; with no place cue nothing is read.
const tied = optics("高光 and 白飛び");
lacks(tied, "mix/culture");
has(tied.replace("a woman by", "a woman in Tokyo by"), "mix/culture");
has(tied.replace("a woman by", "a woman in Seoul by"), "mix/culture");

// A person photo ends in Finish; the contract ceiling and a drawn medium leave it out. The same prompt with its Finish layer has one mix/thin less.
const fixture = (name) => readFileSync(new URL(`./fixtures/prompt-checks/pass/${name}`, import.meta.url), "utf8");
const noFinish = fixture("mix-no-finish.txt");
const withFinish = fixture("mix-with-finish.txt");
const finishLayer = withFinish.slice(withFinish.indexOf("## Finish"));
assert.equal(count(noFinish, "mix/thin") - count(noFinish + "\n" + finishLayer, "mix/thin"), 1, "a Finish layer removes the missing-Finish warning");
const short = noFinish.split("\n\n").filter((block) => /^(?:A warm|## Identity|## Optics|## Camera)/u.test(block)).join("\n\n");
assert.ok(short.length < 2000);
const noFinishWarning = (text) => checkText(text, { profile: "native", surface: "s3", engine: "gpt-image" }).warnings.some((item) => /has no Finish layer/u.test(item.message));
assert.ok(noFinishWarning(noFinish) && !noFinishWarning(short), "under the 2,000-character contract ceiling no Finish layer is asked");
assert.ok(!noFinishWarning(noFinish.replace("A warm late-afternoon telephoto photograph", "A watercolor illustration")), "a drawn medium needs no Finish");

// A drawn medium with no Finish layer has no photo column to read; a part of the owner's layer and culture (立领 for 旗袍) satisfies it though its first tag names no owner;
// a line head that is only the other side's word (西日, a Japanese head, in a Korean scene) is flagged.
assert.equal(count(noFinish.replace("A warm late-afternoon telephoto photograph", "An anime illustration"), "mix/culture"), 0, "no culture column for a drawn medium");
assert.equal(count(noFinish, "mix/culture") - count(noFinish.replace("西日", "sunset glow"), "mix/culture"), 1, "a Japanese head in a Korean scene");
const qipao = "A natural-light photograph of a woman in a qipao.\n\n## Outfit\n旗袍 — A fitted ivory silk sheath with a high 立领.";
assert.equal(count(qipao, "mix/thin"), 0, "a part of the same layer and culture is enough");
assert.equal(count(qipao.replace("立领", "stand collar"), "mix/thin"), 1, "no part name at all");

// A thing with part names (한복: 고름, 동정 …) called at a line head or in the first line but with none of the part names in the prompt gets one mix/thin;
// a part name anywhere, or no Outfit layer for a clothes part, takes it away.
const named = noFinish.replace("a thin white collar strip along the neckline", "a thin white 동정 along the neckline");
assert.equal(count(noFinish, "mix/thin") - count(named, "mix/thin"), 1, "one part name satisfies the owner");
assert.equal(count(noFinish, "mix/thin") - count(noFinish.replace(/## Outfit[\s\S]*?(?=## Pose)/u, ""), "mix/thin"), 1, "clothes parts are asked for only when there is an Outfit layer");
assert.equal(count(withFinish, "mix/thin"), 0);
assert.equal(checkText(withFinish).warnings.length, 0, "the properly mixed hanbok prompt has no warning at all");

// --source: the layer prompt a flattened prompt came from. Its line-head names and sentence words must survive the flattening; engine-levers.md §3.
const layers = readFileSync(new URL("./fixtures/prompt-checks/source/mix-dropped-layers.txt", import.meta.url), "utf8");
const dropped = (text, engine = "seedream", source = layers) => {
  const result = checkText(text, { profile: "native", surface: "s3", engine, sourceText: source });
  return result.warnings.filter((item) => item.code === "mix/dropped");
};
const kept = readFileSync(new URL("./fixtures/prompt-checks/pass/mix-dropped-kept.txt", import.meta.url), "utf8");
assert.equal(dropped(kept).length, 0, "every name kept, a Korean particle bent (창살이)");
assert.equal(dropped(kept.replace("낮은 쪽머리", "low chignon")).length, 1, "one name gone");
assert.match(dropped(kept.replace("낮은 쪽머리", "low chignon"))[0].message, /1 of \d+ original-language names/u);
// A name written under another alias of its dictionary row is reported with the alias it became (惆怅 → wistful).
const hk = "A woman in a 1990s film still.\n\n## Expression\n惆怅 — She looks far down the street, waiting.";
const renamedText = dropped("A 1990s film still of a woman with a wistful, waiting look far down the street.", "seedream", hk);
assert.equal(renamedText.length, 1);
assert.match(renamedText[0].message, /written under another name: 惆怅 → wistful/u);
// Exact copy in quotes in the layer prompt is the photo's text, not a name to keep; Finish and Identity wording is the engine's own.
assert.equal(dropped("A photograph of a woman beside a shop.", "seedream", "A photograph of a woman beside a shop.\n\n## Scene\nshop sign — A board reads \"営業中\" over the door.\n\n## Finish\n실사 — A real photograph.").length, 0);
// Midjourney and Soul cut sentences to phrases: only the line heads are read there, a name inside a sentence is not.
const sentenceName = "A photograph of a woman.\n\n## Outfit\nwhite shirt — A crisp shirt with a thin 동정 along the neckline.";
assert.equal(dropped("a woman in a white shirt", "midjourney", sentenceName).length, 0);
assert.equal(dropped("a woman in a white shirt", "seedream", sentenceName).length, 1);
assert.equal(dropped("a woman in a hanbok", "soul", "A woman.\n\n## Outfit\n한복 — A short ivory jacket over a full skirt.").length, 1);
// Those cut each layer to one phrase: a layer is dropped only when none of its names is left, so one name of two in a layer passes and a layer with none is reported.
const twoNames = "A woman.\n\n## Hair and makeup\n王家卫 — A loose perm.\n豆沙唇 — A muted rosy-brown lip.\n\n## Outfit\n吊带裙 — A silk slip dress.";
assert.equal(dropped("a woman in a loose 王家卫 perm and a 吊带裙", "soul", twoNames).length, 0, "one of two names kept in a layer");
const lostLayer = dropped("a woman in a loose perm and a 吊带裙", "midjourney", twoNames);
assert.equal(lostLayer.length, 1);
assert.match(lostLayer[0].message, /1 of 2 layers/u);
assert.equal(dropped("a woman in a loose perm and a slip dress", "soul", twoNames)[0].message.match(/2 of 2 layers/u)?.length, 1);
// Nano Banana may gloss original-language words: not read, and the result says so.
const nano = checkText("A woman in a hanbok.", { profile: "native", surface: "s3", engine: "nano-banana", sourceText: "A woman.\n\n## Outfit\n한복 — A short ivory jacket." });
assert.ok(!nano.warnings.some((item) => item.code === "mix/dropped") && nano.scope.unchecked.includes("source_original_language_names"));
// No source, no check.
assert.equal(checkText("A woman in a hanbok.", { profile: "native", surface: "s3", engine: "seedream" }).warnings.filter((item) => item.code === "mix/dropped").length, 0);
// The CLI: a source with no flattening engine, or an unreadable one, is reported instead of silently ignored.
const cli = (...args) => spawnSync(process.execPath, [fileURLToPath(new URL("./check_prompt.mjs", import.meta.url)), ...args], { encoding: "utf8", input: "A woman in a hanbok." });
const noEngine = JSON.parse(cli("--source", "x.txt").stdout);
assert.ok(noEngine.errors.some((item) => item.code === "input/flag" && /--engine/u.test(item.message)));
const missing = JSON.parse(cli("--engine", "seedream", "--source", "/nonexistent/layers.txt").stdout);
assert.ok(missing.errors.some((item) => item.code === "input/unreadable"));

console.log("mix checks: one-name skips (heading, medium phrase, closer, Identity), spaced-phrase places, Expression phrases, quoted copy, photo-term columns and the --source flattening check pass; image output NOT RUN.");
