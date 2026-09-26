import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkManifest, checkText, parseFlags } from "./check_prompt.mjs";

const scripts = dirname(fileURLToPath(import.meta.url));
const validator = resolve(scripts, "check_prompt.mjs");
const fixture = (name) => resolve(scripts, "fixtures/prompt-checks", name);
const temp = await mkdtemp(resolve(tmpdir(), "mpw-prompt-surface-"));
const manifestPath = resolve(temp, "rows.jsonl");
let scenarios = 0;

function invoke(args, input = "") {
  return new Promise((accept, reject) => {
    const child = execFile(process.execPath, [validator, ...args], { timeout: 15000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && (!Number.isInteger(error.code) || error.killed || error.signal)) {
        reject(error);
        return;
      }
      try {
        assert.equal(stderr, "");
        accept({ status: error?.code ?? 0, result: JSON.parse(stdout) });
      } catch (failure) {
        reject(failure);
      }
    });
    child.stdin.end(input);
  });
}

function codes(result, kind) {
  return new Set([...(result[kind] ?? []), ...(result.rows ?? []).flatMap((row) => row[kind])].map((entry) => entry.code));
}

function verify(name, result, errors = [], warnings = [], absent = []) {
  assert.deepEqual(codes(result, "errors"), new Set(errors), name);
  assert.equal(result.ok, errors.length === 0, name);
  for (const code of warnings) assert.ok(codes(result, "warnings").has(code), `${name}: ${code}`);
  for (const code of absent) assert.ok(!codes(result, "warnings").has(code), `${name}: unexpected ${code}`);
  assert.deepEqual(new Set(result.scope.unchecked), new Set(["input_images", "api_parameters", "render_quality", "semantic_fidelity"]));
  assert.deepEqual(result.scope.checked, ["prompt_text"]);
  for (const row of [result, ...(result.rows ?? [])]) {
    for (const entry of [...row.errors, ...row.warnings]) {
      assert.equal(typeof entry.message, "string");
      assert.ok(entry.message.length > 0);
      if (entry.evidence) assert.ok(entry.evidence.length <= 5);
    }
  }
  scenarios += 1;
  return result;
}

async function cli(name, input, args = [], errors = [], warnings = [], absent = []) {
  const { status, result } = await invoke(args, input);
  assert.equal(status, errors.length ? 1 : 0, name);
  return verify(name, result, errors, warnings, absent);
}

function unit(name, input, options = {}, errors = [], warnings = [], absent = []) {
  return verify(name, checkText(input, options), errors, warnings, absent);
}

async function manifest(name, rows, args = [], errors = []) {
  const input = Array.isArray(rows) ? rows.map((row) => JSON.stringify(row)).join("\n") : rows;
  await writeFile(manifestPath, input);
  return cli(name, "", [...args, "--manifest", manifestPath], errors);
}

try {
  const long = "나".repeat(2100);
  const assumed = await cli("default channel", long, [], ["length/channel"]);
  assert.equal(assumed.length.binding, "channel");
  assert.deepEqual(assumed.length.layers[0], { kind: "channel", limit: 2000, assumed: true });
  const contract = await cli("machine handoff", long, ["--surface", "s1"], ["length/contract"]);
  assert.equal(contract.length.binding, "contract");
  assert.ok(!contract.length.layers.some((layer) => layer.kind === "channel"));
  await cli("direct API", long, ["--surface", "s2"]);
  await cli("bounded API delivery", long, ["--surface", "s2", "--channel", "bounded"], ["length/channel"]);
  const unknown = await cli("platform ceiling unknown", long, ["--profile", "assembled", "--surface", "s2", "--engine", "higgsfield"], [], ["length/ungated"]);
  assert.deepEqual(unknown.length.layers, []);
  assert.equal(unknown.length.binding, null);
  await cli("native platform scope", long, ["--surface", "s2", "--engine", "higgsfield"], ["input/engine-scope"]);
  await cli("engine over boundary", "界".repeat(32001), ["--surface", "s3", "--channel", "unbounded"], ["length/engine"]);
  const cabin = await readFile(fixture("fail/input-cabin-engine.txt"), "utf8");
  await cli("external syntax short circuit", cabin, ["--profile", "assembled", "--engine", "midjourney"], ["input/engine-scope"]);
  for (const profile of ["native", "assembled"]) {
    await cli(`long engine scope ${profile}`, "ridge ".repeat(400), ["--profile", profile, "--engine", "midjourney"], ["length/channel", "input/engine-scope"]);
  }
  await cli("explicit narrow external engine", "Mountain ridges beside a lake.", ["--profile", "assembled", "--engine", "midjourney", "--channel-limit", "10"], ["length/channel", "input/engine-scope"]);
  const dual = await cli("both machine and channel failures", "山".repeat(3000), ["--surface", "s1", "--channel-limit", "1999"], ["length/channel", "length/contract"]);
  assert.equal(dual.length.binding, "channel");
  assert.deepEqual(dual.length.layers.map((layer) => layer.limit), [2000, 1999, 32000]);
  const tie = unit("equal ceilings prefer machine", long, { surface: "s1", channelLimit: 2000 }, ["length/contract"]);
  assert.equal(tie.length.binding, "contract");
  const engineTie = unit("channel wins engine tie", "山".repeat(32001), { surface: "s2", channelLimit: 32000 }, ["length/channel"]);
  assert.equal(engineTie.length.binding, "channel");
  await cli("assembled API engine default", long, ["--profile", "assembled", "--surface", "s2"], [], ["length/ungated"]);
  await cli("bounded explicit limit at boundary", "字".repeat(500), ["--channel", "bounded", "--channel-limit", "500"]);

  const invalidArguments = [
    ["--surafce", "s1"], ["--profile", "compiled"], ["--profile", "invented"],
    ["--profile", manifestPath], ["--profile"],
    ["--tier", "2"], ["--api-downgrade"], ["--jsonl", manifestPath],
    ["--channel-limit", "2e3"], ["--channel-limit", "3.5"], ["--channel-limit", "50px"],
    ["--channel-limit", "0"], ["--channel-limit", "-5"], ["--channel-limit", "+5"],
    ["--channel-limit", ""], ["--channel-limit", " 5"], ["--channel-limit", "５"],
    ["--channel", "unbounded", "--channel-limit", "500"],
    ["--manifest"], ["--manifest", "--surface", "s1"], [manifestPath, "--manifest", manifestPath],
    ["--surface", "s1", "--surface", "s2"], ["--profile", "native", "--profile", "native"],
    ["one.txt", "two.txt"], ["--engine", "other"], ["--channel", "other"], ["--surface", "s4"],
    ["--test", "--profile", "native"], ["--test", "--test"], ["--unknown"],
  ];
  for (const args of invalidArguments) {
    assert.ok(parseFlags(args).errors.length > 0);
    await cli(`reject arguments ${args.join(" ")}`, "A paper kite.", args, ["input/flag"]);
  }
  await cli("leading zero positive limit", "abc", ["--channel-limit", "0003"]);
  await cli("large decimal limit", "abc", ["--channel-limit", "999999999999999999999999999999999999"]);
  assert.deepEqual(parseFlags(["--profile", "assembled", "--surface", "s2"]).errors, []);

  const mug = await readFile(fixture("pass/input-mug-edit.txt"), "utf8");
  const native = await cli("natural product edit", mug, [], [], [], ["phrasing/negation", "phrasing/ko-negation", "phrasing/exclusion-list"]);
  assert.equal(native.profile, "native");
  assert.deepEqual(new Set(Object.keys(native)), new Set(["ok", "mode", "profile", "surface", "engine", "scope", "length", "errors", "warnings"]));
  await cli("assembled product edit", mug, ["--profile", "assembled"], [], ["phrasing/negation"], ["syntax/ratio-token"]);
  await cli("native machine contract allowed", "竹".repeat(2001), ["--profile", "native", "--surface", "s1"], ["length/contract"]);
  for (const engine of ["higgsfield", "midjourney", "unknown"]) {
    await cli(`native engine ${engine}`, "A painted wooden door.", ["--engine", engine], ["input/engine-scope"]);
  }
  for (const blank of ["", "\uFEFF \t\n", "AR 3:2", "aspect ratio: 5:4 #aabbcc", "16:9", "#123 #12345678", "---"]) {
    await cli("empty content", blank, [], ["input/empty"]);
  }
  await cli("quoted symbols render content", '"#123" exactly once.');
  await cli("pictograph is content", "🌿");
  const measured = await cli("unicode and whitespace retained", "\uFEFF 🪴\n", ["--channel-limit", "3"]);
  assert.equal(measured.length.codepoints, 3);
  assert.equal(unit("remove one BOM only", "\uFEFF\uFEFF木").length.codepoints, 2);
  await cli("length precedes empty", " ".repeat(2001), [], ["length/channel", "input/empty"]);

  const structured = ['{"prompt":"a roof"}', '{"prompt":', '{"a":1}\n{"b":2}', '[{"prompt":"a roof"}]', '["unfinished"', "[1,2]", "[true,false]", "[[3]]", "[]", "[null]"];
  for (const input of structured) {
    await cli("structured body", input, [], ["input/structured-body"]);
    for (const [open, close] of [["```", "```"], ["```text", "````"], ["~~~", "~~~~"]]) {
      unit("structured fenced body", `${open}\n${input}\n${close}`, {}, ["input/structured-body"]);
    }
    unit("structured unclosed fence", `\`\`\`text\n${input}`, {}, ["input/structured-body"]);
  }
  for (const label of ["json", "JSONL", "ndjson", "yaml", "YML"]) {
    await cli("structured information string", `~~~${label}\nA cedar chest.\n~~~~`, [], ["input/structured-body"]);
  }
  await cli("plain fenced edit", "```text\nReplace the wall paint with pale blue.\n```");
  await cli("unclosed plain fenced edit", "~~~text\nKeep the original mug handle.");
  await cli("reference label", "[Input image 3] Replace the sofa fabric with teal wool.");
  await cli("bracket numeral copy", 'Poster headline: “{41} [2027]” appears once and is readable.');
  await cli("engine exact boundary", "a".repeat(32000), ["--surface", "s2"]);
  await cli("engine one over", "a".repeat(32001), ["--surface", "s2"], ["length/engine"]);
  await cli("default one over", "a".repeat(2001), [], ["length/channel"]);
  await cli("channel exact boundary", "a".repeat(10), ["--channel-limit", "10"]);
  await cli("channel one over", "a".repeat(11), ["--channel-limit", "10"], ["length/channel"]);
  await cli("unbounded still engine gated", "a".repeat(32001), ["--channel", "unbounded"], ["length/engine"]);
  await cli("Korean native constraint", "원본 로고를 유지한다. 그림자 추가 금지.", [], [], [], ["phrasing/ko-negation"]);

  for (const punctuation of ["", "(", ",", ";", "："]) {
    await cli("punctuation before flag", `${punctuation}--reference photo`, [], ["syntax/foreign-flag"]);
  }
  for (const [open, close] of [['"', '"'], ["“", "”"]]) {
    await cli("flag copy is data", `Headline: ${open}--reference${close} is legible and appears once.`);
    unit("all instruction tokens shielded", `Headline: ${open}4K --ar NO FEAR [WORDS] § (silk:1.2)${close} appears once.`, { profile: "assembled" });
  }
  await cli("word internal double hyphen", "A well--worn wooden bench.");
  const chain = "A tiled counter; no jars, no tools and no people.";
  await cli("native exclusion warning", chain, [], [], ["phrasing/exclusion-list"]);
  await cli("assembled exclusion error", chain, ["--profile", "assembled"], ["phrasing/exclusion-list"], [], ["phrasing/negation"]);
  for (const connector of [", ", "; ", " and ", " or ", ", and "]) {
    unit("joined exclusion items", `A plate; no crumbs${connector}without spoons.`, { profile: "assembled" }, ["phrasing/exclusion-list"], [], ["phrasing/negation"]);
  }
  unit("independent negative sentences", "No crumbs. No spoons.", { profile: "assembled" }, [], ["phrasing/negation"]);
  for (const label of ["Negative", "Negative prompt", "Negatives", "Avoid", "Exclude", "Exclusions", "Do not include", "Don't include", "제외", "제외 요소", "네거티브", "금지 요소", "피할 것"]) {
    unit("exclusion label", `A cup.\n${label}: dust, paper.`, { profile: "assembled" }, ["phrasing/exclusion-list"], [], ["phrasing/negation"]);
  }
  unit("negative space and absence states", "Negative space surrounds a plate. 텍스트 없음. 무지 배경.", { profile: "assembled" }, [], [], ["phrasing/negation", "phrasing/ko-negation", "phrasing/exclusion-list"]);
  unit("quoted exclusion label", 'Headline: "Negative: no rain, no wind" appears once.', { profile: "assembled" }, [], [], ["phrasing/negation", "phrasing/exclusion-list"]);
  const preservation = await cli("preservation negation guidance", "Preserve the original product and logo. No watermark.", ["--profile", "assembled"], [], ["phrasing/negation"]);
  assert.equal(typeof preservation.warnings.find((entry) => entry.code === "phrasing/negation").hint, "string");

  await cli("curved cafe copy", '카피: “차 한 잔”을 또렷하게 한 번만 메뉴판에 넣는다.');
  await cli("curved cafe repeated", '상단 “차 한 잔”, 하단 “차 한 잔”을 또렷하게 배치한다.', [], ["copy/repeated"]);
  for (const label of ["카피", "문구", "헤드라인", "표기 문구", "이미지 속 글자", "캡션 문구", "Copy", "Headline", "Tagline", "On-image text", "Lettering", "Caption text"]) {
    unit("copy label with no quotes", `A flyer. ${label}：opening soon; readable.`, {}, ["copy/unquoted"]);
  }
  unit("label embedded in sentence", "Describe the copy: as paper texture.");
  unit("roles and guards inside quotes do not count", '"title readable" and "caption legible"', {}, [], ["copy/role-missing", "copy/render-guard-missing"]);
  unit("normalized duplicate", '"a   b" and “a b” at top, legible.', {}, ["copy/repeated"]);
  unit("edit preservation lock", 'Edit image 2. Headline: "Sale" appears once. Keep “Sale” unchanged.', {}, [], ["copy/repeated-lock"]);
  unit("all repeated uses must preserve", 'Edit image 2. "Sale" appears once. Keep "Sale". Print "Sale".', {}, ["copy/repeated"]);
  unit("preservation word in copy is not a verb", 'Edit image 2. "keep" appears once. Print "keep".', {}, ["copy/repeated"]);
  unit("no editing signal", 'Headline: "Sale" appears once. Keep "Sale".', {}, ["copy/repeated"]);
  unit("assembled repeats always fail", 'Edit original image. "Sale" appears once. Keep "Sale".', { profile: "assembled" }, ["copy/repeated"]);
  for (const separator of [".", "?", "!", ";", "\n", "。"]) {
    unit("preservation sentence does not leak", `Edit source image. "Sale" appears once. Keep the border${separator} Print "Sale".`, {}, ["copy/repeated"]);
  }
  for (const verb of ["preserve", "retain", "leave as is", "do not change", "don't alter", "never modify", "유지", "보존", "그대로 둔다", "바꾸지", "변경하지"]) {
    unit("preservation verb forms", `Edit original image. "Sale" appears once. ${verb} "Sale".`, {}, [], ["copy/repeated-lock"]);
  }
  const museumEdit = "Edit the museum display photograph by changing the plinth fabric to burgundy.";
  const museumLabel = 'The engraved label reads "Tide Compass" and is legible.';
  const museumLock = '"Tide Compass" must stay exactly as it is.';
  await cli("museum label stays as it is", `${museumEdit} ${museumLabel} ${museumLock}`, [], [], ["copy/repeated-lock"]);
  for (const verb of ["stay", "remain", "stays", "remains"]) {
    for (const state of ["as it is", "exactly as it is", "as is", "unchanged", "exactly unchanged"]) {
      unit("stay or remain preservation predicate", `${museumEdit} ${museumLabel} "Tide Compass" ${verb} ${state}.`, {}, [], ["copy/repeated-lock"]);
    }
  }
  unit("all museum rementions are locked", `${museumEdit} ${museumLabel} ${museumLock} "Tide Compass" must remain as it is.`, {}, [], ["copy/repeated-lock"]);
  unit("first museum mention alone locks nothing", `${museumEdit} ${museumLock} Add "Tide Compass" below the case.`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  unit("later unlocked museum mention rejects", `${museumEdit} ${museumLabel} ${museumLock} Add "Tide Compass" below the case.`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  unit("middle unlocked museum mention rejects", `${museumEdit} ${museumLabel} Add "Tide Compass" below the case. ${museumLock}`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  unit("museum lock requires editing context", `${museumLabel} ${museumLock}`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  for (const unrelated of ["must stay beside the compass", "must remain visible", "must stay near the instrument as it is photographed"]) {
    unit("unrelated stay or remain is not preservation", `${museumEdit} ${museumLabel} "Tide Compass" ${unrelated}.`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  }
  unit("quoted museum preservation words are data", `${museumEdit} ${museumLabel} Repeat "Tide Compass" beside "must stay exactly as it is".`, {}, ["copy/repeated"], [], ["copy/repeated-lock"]);
  unit("museum preservation stays native only", `${museumEdit} ${museumLabel} ${museumLock}`, { profile: "assembled" }, ["copy/repeated"], [], ["copy/repeated-lock"]);
  unit("ratios are not numeric emphasis", "A frame with (16:9) crop and [한글] detail.");
  unit("adapter emphasis", "A vase <ceramic:0.7>.", {}, ["syntax/weight"]);
  unit("mixed case labels permitted", "[Living Room] A wool chair.");
  unit("assembled unknown engine content checked", "A lake, masterpiece.", { profile: "assembled", surface: "s2" }, ["phrasing/quality-tag"], ["length/ungated"]);
  const qualityTags = ["masterpiece", "best quality", "top quality", "highest quality", "4K", "8K", "16K", "UHD", "ultra detailed", "ultra-detailed", "hyper detailed", "extremely detailed", "insanely-detailed", "trending on artstation", "featured on behance", "award winning", "octane render", "unreal engine"];
  for (const tag of qualityTags) unit("quality token", `A lake; ${tag}.`, { profile: "assembled" }, ["phrasing/quality-tag"]);
  unit("quality token boundaries", "High-quality leather, sharp focus, SKU4K, UHDscreen, perfectible.", { profile: "assembled" }, [], [], ["phrasing/vague-adjective"]);

  const recovery = await manifest("nonobject row recovery", [null, [], true, 17, { id: "valid", prompt: "A clay pot." }], [], ["manifest/not-object"]);
  assert.deepEqual(recovery.summary, { total: 5, passed: 1, failed: 4 });
  assert.ok(recovery.rows.slice(0, 4).every((row) => row.errors[0].code === "manifest/not-object"));
  const parseRecovery = await manifest("parse recovery and line numbers", 'broken\n\n{"id":"ok","prompt":"A reed basket."}', [], ["manifest/parse"]);
  assert.equal(parseRecovery.rows[1].line, 3);
  assert.equal(parseRecovery.rows[1].ok, true);
  await manifest("blank identifier", [{ id: " ", prompt: "A pot." }], [], ["manifest/missing-field"]);
  await manifest("blank prompt", [{ id: "one", prompt: " \t " }], [], ["manifest/missing-field"]);
  await manifest("prompt precedence", [{ id: "one", prompt: null, full_prompt: "A pot." }], [], ["manifest/missing-field"]);
  await manifest("alternate text and ignored path", [{ id: "one", full_prompt: "A pot.", output_path: " " }]);
  const duplicate = await manifest("trimmed duplicate identifier", [{ id: "same", prompt: "A pot." }, { id: " same ", prompt: "A fern." }], [], ["manifest/duplicate-id"]);
  assert.equal(duplicate.rows[0].ok, true);
  assert.equal(duplicate.rows[1].ok, false);
  await manifest("default manifest ceiling", [{ id: "one", prompt: long }], [], ["length/contract"]);
  const padding = await manifest("manifest whitespace counted", [{ id: "one", prompt: "Pot." + " ".repeat(2100) }], [], ["length/contract"]);
  assert.equal(padding.rows[0].length.codepoints, 2104);
  await manifest("row cannot change routing", [{ id: "one", prompt: long, surface: "s2", engine: "unknown", channel: "unbounded" }], [], ["length/contract"]);
  await manifest("explicit manifest API surface", [{ id: "one", prompt: long }], ["--surface", "s2"]);
  await manifest("manifest engine ceiling", [{ id: "one", prompt: "x".repeat(32001) }], ["--surface", "s2"], ["length/engine"]);
  const routed = await manifest("CLI owns profile", [{ id: "one", prompt: "A pot. No dust.", profile: "assembled" }]);
  assert.equal(routed.profile, "native");
  assert.ok(!codes(routed, "warnings").has("phrasing/negation"));
  verify("manifest assembled unknown ceiling", checkManifest(JSON.stringify({ id: "one", prompt: long }), { profile: "assembled", surface: "s2" }), [], ["length/ungated"]);
  await manifest("empty manifest", "", [], ["manifest/empty"]);
  await manifest("blank manifest lines", " \n\t\n", [], ["manifest/empty"]);
  const missing = resolve(temp, "does-not-exist.txt");
  await cli("unreadable text", "", [missing], ["input/unreadable"]);
  await cli("directory is not text file", "", [temp], ["input/unreadable"]);
  await cli("unreadable manifest", "", ["--manifest", missing], ["input/unreadable"]);
  await cli("directory is not manifest", "", ["--manifest", temp], ["input/unreadable"]);
  const saved = resolve(temp, "prompt.txt");
  await writeFile(saved, "A stone bowl.");
  await cli("positional file entry point", "", [saved]);
} finally {
  await rm(temp, { recursive: true, force: true });
}
console.log(`Surface and text contracts: ${scenarios} scenarios passed; temporary inputs removed.`);
