#!/usr/bin/env node
// mix/* shapes the fixtures do not cover: what the one-name check skips (layer headings, the first line's medium or look phrase,
// the Finish closer, the Identity paragraph) and where a spaced phrase may stand. Text matching only; no image output is judged.
import assert from "node:assert/strict";
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

console.log("mix checks: one-name skips (heading, medium phrase, closer, Identity), spaced-phrase places, Expression phrases, quoted copy and photo-term columns pass; image output NOT RUN.");
