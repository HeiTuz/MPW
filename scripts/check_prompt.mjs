import fs from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadAll } from "./find_tokens.mjs";

export const CODE_REGISTRY = Object.freeze({
  flag: { code: "input/flag", severity: { native: "error", assembled: "error" }, intent: "Accept only coherent documented arguments." },
  unreadable: { code: "input/unreadable", severity: { native: "error", assembled: "error" }, intent: "Report an unavailable input file." },
  empty: { code: "input/empty", severity: { native: "error", assembled: "error" }, intent: "Require something to depict or render." },
  structured: { code: "input/structured-body", severity: { native: "error", assembled: null }, intent: "Keep request records out of natural-language input." },
  engineScope: { code: "input/engine-scope", severity: { native: "error", assembled: "error" }, intent: "Stop content checks outside the supported engine scope." },
  contract: { code: "length/contract", severity: { native: "error", assembled: "error" }, intent: "Enforce the machine handoff character ceiling." },
  channel: { code: "length/channel", severity: { native: "error", assembled: "error" }, intent: "Enforce the binding delivery ceiling." },
  engine: { code: "length/engine", severity: { native: "error", assembled: "error" }, intent: "Enforce the binding engine ceiling." },
  engineWords: { code: "length/engine-words", severity: { native: "warning", assembled: "warning" }, intent: "Flag word counts over an engine's published word guidance." },
  ungated: { code: "length/ungated", severity: { native: "warning", assembled: "warning" }, intent: "Disclose that no numeric ceiling is known." },
  unquoted: { code: "copy/unquoted", severity: { native: "error", assembled: "error" }, intent: "Fix the exact text requested by a copy label." },
  repeated: { code: "copy/repeated", severity: { native: "error", assembled: "error" }, intent: "Avoid quoting the same rendered text repeatedly." },
  repeatedLock: { code: "copy/repeated-lock", severity: { native: "warning", assembled: null }, intent: "Recognize repeated text in an editing preservation sentence." },
  roleMissing: { code: "copy/role-missing", severity: { native: "warning", assembled: "warning" }, intent: "Give distinct copy a role or location." },
  mixedScript: { code: "copy/mixed-script", severity: { native: "warning", assembled: "warning" }, intent: "Explain mixed-script layout without changing supplied copy." },
  guardMissing: { code: "copy/render-guard-missing", severity: { native: "warning", assembled: "warning" }, intent: "Make text legibility or single rendering explicit." },
  leadingMeta: { code: "syntax/leading-meta", severity: { native: "error", assembled: "error" }, intent: "Separate leading execution settings from the image brief." },
  placeholder: { code: "syntax/placeholder", severity: { native: "error", assembled: "error" }, intent: "Resolve remaining substitution tokens." },
  weight: { code: "syntax/weight", severity: { native: "error", assembled: "error" }, intent: "Replace numeric emphasis notation with visual instructions." },
  foreignFlag: { code: "syntax/foreign-flag", severity: { native: "error", assembled: "error" }, intent: "Keep unsupported command flags out of image prose." },
  sectionSign: { code: "syntax/section-sign", severity: { native: "warning", assembled: "warning" }, intent: "Remove document section references from instructions." },
  ratioToken: { code: "syntax/ratio-token", severity: { native: "warning", assembled: "warning" }, intent: "Deliver a trailing ratio as a setting or separate label." },
  exclusion: { code: "phrasing/exclusion-list", severity: { native: "warning", assembled: "error" }, intent: "Describe desired contents instead of collected exclusions." },
  negation: { code: "phrasing/negation", severity: { native: null, assembled: "warning" }, intent: "Prefer concrete states while retaining preservation constraints." },
  koNegation: { code: "phrasing/ko-negation", severity: { native: null, assembled: "warning" }, intent: "Distinguish Korean prohibitions from descriptions of absence." },
  quality: { code: "phrasing/quality-tag", severity: { native: null, assembled: "error" }, intent: "Replace generic model quality tags with observable details." },
  vague: { code: "phrasing/vague-adjective", severity: { native: "warning", assembled: "warning" }, intent: "Ground evaluative adjectives in visible choices." },
  noise: { code: "phrasing/noise-trigger", severity: { native: "warning", assembled: "warning" }, intent: "Flag vocabulary reported to induce screen-wide grain on GPT Image." },
  skinToken: { code: "portrait/skin-token", severity: { native: null, assembled: "warning" }, intent: "Review ambiguous skin vocabulary without replacing requested texture." },
  skinColor: { code: "portrait/nationality-skin", severity: { native: null, assembled: "warning" }, intent: "Review color provenance without inferring nationality or discarding requested character color." },
  glow: { code: "portrait/glow-stack", severity: { native: null, assembled: "warning" }, intent: "Review possible overlap in shine descriptions; lexical counts do not predict image failure." },
  skinRepeat: { code: "portrait/skin-repeat", severity: { native: "warning", assembled: "warning" }, intent: "Review possible repetition while preserving distinct areas and partial-edit conditions." },
  occlusion: { code: "coherence/occlusion", severity: { native: "warning", assembled: "warning" }, intent: "Flag hair that covers the face next to a line that keeps the face clear." },
  focal: { code: "coherence/focal", severity: { native: "warning", assembled: "warning" }, intent: "Flag two focal lengths, or a wide lens beside an undistorted-face line." },
  identitySkin: { code: "coherence/identity-skin", severity: { native: "warning", assembled: "warning" }, intent: "Flag a skin color written outside the identity paragraph while the reference skin tone is kept." },
  ratioDup: { code: "coherence/ratio-dup", severity: { native: "warning", assembled: "warning" }, intent: "Flag an aspect ratio written more than once." },
  decimal: { code: "coherence/decimal", severity: { native: "error", assembled: "error" }, intent: "Reject a decimal point replaced by an ideographic full stop." },
  slotDup: { code: "coherence/slot-dup", severity: { native: "warning", assembled: "warning" }, intent: "Flag a slot filled twice: lips in Hair and makeup, or the catchlight." },
  dayNight: { code: "coherence/day-night", severity: { native: "warning", assembled: "warning" }, intent: "Flag a night cue next to midday light, in words or in the tags of the Light and Scene line-head rows." },
  legwear: { code: "coherence/legwear", severity: { native: "warning", assembled: "warning" }, intent: "Flag a stockings or tights line in Legwear next to an Outfit line whose garment covers the whole leg, read from the lexicon row tags." },
  bodyDir: { code: "coherence/body-dir", severity: { native: "warning", assembled: "warning" }, intent: "Flag an Expression row that turns the body away beside a Pose row that faces the camera square on, or the reverse, read from the lexicon row tags." },
  posePlace: { code: "coherence/pose-place", severity: { native: "warning", assembled: "warning" }, intent: "Flag a Pose row that needs a place (car, rail, stair, bed, sofa, water's edge, road, elevator) that nothing outside the Pose layer shows." },
  engineLayers: { code: "coherence/engine-layers", severity: { native: "warning", assembled: "warning" }, intent: "Flag GPT Image layer headings left in a prompt for another engine." },
  engineFlag: { code: "coherence/engine-flag", severity: { native: "warning", assembled: "warning" }, intent: "Flag a Midjourney flag or ratio token in the body of an engine that takes it as a setting." },
  engineBan: { code: "coherence/engine-ban", severity: { native: "warning", assembled: "warning" }, intent: "Flag a spoken ban on illustration or CGI where the engine's cell says to state the medium or use its own exclusion syntax." },
  slotName: { code: "token/slot-name", severity: { native: "warning", assembled: "warning" }, intent: "Flag a layer-line token that names the slot (hair color, passersby, road surface) instead of the thing shown." },
  mixLine: { code: "mix/line", severity: { native: "warning", assembled: null }, intent: "Flag a layer line with four or more original-language chunks, one with no English frame, or a spaced original-language phrase outside Expression and Style or twice in one line (image-brief.md §2)." },
  mixAmount: { code: "mix/amount", severity: { native: "warning", assembled: null }, intent: "Flag more original-language chunks in the layer sentences than 1.5 per layer line." },
  mixUnlisted: { code: "mix/unlisted", severity: { native: "warning", assembled: null }, intent: "Flag original-language words that no lexicon row, look card or fixed-lines.md carries." },
  mixRenamed: { code: "mix/renamed", severity: { native: "warning", assembled: null }, intent: "Flag one thing called by two names: another alias of a line-head token written outside its line." },
  mixCulture: { code: "mix/culture", severity: { native: "warning", assembled: null }, intent: "Flag a photo term from the other culture's column of fixed-lines.md (高光 in a JP scene, 白飛び in a KR or CN scene), the culture read from the Finish tokens, or from the language of the line heads and sentence words when there are none." },
  mixDropped: { code: "mix/dropped", severity: { native: "warning", assembled: "warning" }, intent: "With --source: flag original-language names of the layer prompt that are missing from its flattened form for another engine, or replaced by another alias of the same dictionary row." },
  mixThin: { code: "mix/thin", severity: { native: "warning", assembled: null }, intent: "Flag a KR, CN or JP photo prompt that barely mixes: no Finish layer in a person photo prompt, an owner (한복, 고궁) called without any of its part names in the original language, few original-language line heads, no photo term in Optics or Camera, or no expression word in Expression. For --engine seedream, midjourney and soul (one paragraph, no line heads): a person photo in a KR, CN or JP scene with fewer than three original-language words (engine-levers.md §3)." },
  pickOne: { code: "phrasing/pick-one", severity: { native: "warning", assembled: "warning" }, intent: "Flag wording that hands the choice to the model: the author writes one value and leaves no option list in the prompt." },
  poseOptions: { code: "coherence/pose-options", severity: { native: "warning", assembled: "warning" }, intent: "Flag a Pose layer that lists alternative poses (numbered or bulleted lines, or two posture words joined by or) instead of one pose." },
  engineBrand: { code: "coherence/engine-brand", severity: { native: "warning", assembled: "warning" }, intent: "Flag a film stock brand name in a Soul prompt, which draws the film border." },
  parse: { code: "manifest/parse", severity: { native: "error", assembled: "error" }, intent: "Report invalid JSON without losing subsequent rows." },
  notObject: { code: "manifest/not-object", severity: { native: "error", assembled: "error" }, intent: "Require an object for each manifest row." },
  manifestEmpty: { code: "manifest/empty", severity: { native: "error", assembled: "error" }, intent: "Require a nonblank manifest row." },
  missingField: { code: "manifest/missing-field", severity: { native: "error", assembled: "error" }, intent: "Require a nonblank id and selected text field." },
  duplicateId: { code: "manifest/duplicate-id", severity: { native: "error", assembled: "error" }, intent: "Reject only later occurrences of a trimmed id." },
});

const BANNED_MJ_FLAGS = ["no", "ar", "p", "stylize", "v", "sref", "seed"];
const HARNESS_CODES = Object.freeze({
  empty: "harness/empty-cases",
  unregistered: "harness/unregistered-fixture",
  uncovered: "harness/uncovered-code",
  selfCheck: "harness/self-check",
});
const modulePath = fileURLToPath(import.meta.url);
const defaultCases = resolve(dirname(modulePath), "fixtures/prompt-checks/cases.json");
const entriesByCode = new Map(Object.values(CODE_REGISTRY).map((entry) => [entry.code, entry]));

function scope() {
  return {
    checked: ["prompt_text"],
    unchecked: ["input_images", "api_parameters", "render_quality", "semantic_fidelity"],
  };
}

function diagnostic(code, message, details = {}) {
  if (!entriesByCode.has(code)) throw new Error(`Unregistered diagnostic: ${code}`);
  return { code, message, ...details };
}

function emit(result, entry, message, details = {}) {
  const item = diagnostic(entry.code, message, details);
  const severity = entry.severity[result.profile];
  if (severity === "error") {
    result.errors.push(item);
    result.ok = false;
  } else if (severity === "warning") {
    result.warnings.push(item);
  }
}

function textResult(options = {}) {
  const profile = options.profile ?? "native";
  const surface = options.surface ?? (options.manifest ? "s1" : "s3");
  const engine = options.engine ?? (profile === "assembled" && surface === "s2" ? "unknown" : "gpt-image");
  return { ok: true, mode: "text", profile, surface, engine, scope: scope(), length: null, errors: [], warnings: [] };
}

export function parseFlags(args) {
  const options = { profile: "native" };
  const errors = [];
  const seen = new Set();
  const choices = {
    "--profile": ["native", "assembled"],
    "--surface": ["s1", "s2", "s3"],
    "--channel": ["unbounded", "bounded"],
    "--engine": ["gpt-image", "unknown", "midjourney", "higgsfield", "seedream", "nano-banana", "soul"],
  };
  const valued = new Set([...Object.keys(choices), "--manifest", "--channel-limit", "--file", "--source"]);
  const reject = (message, details) => errors.push(diagnostic(CODE_REGISTRY.flag.code, message, details));
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("-")) {
      if (options.input !== undefined) reject("Only one positional input file is accepted.");
      else options.input = token;
      continue;
    }
    if (seen.has(token)) reject(`Repeated option: ${token}`);
    seen.add(token);
    if (token === "--test") {
      options.test = true;
      continue;
    }
    if (!valued.has(token)) {
      reject(`Unknown option: ${token}`, {
        hint: "This option may have been removed in this major version; consult the README migration section.",
      });
      continue;
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      reject(`A value is required after ${token}.`);
      continue;
    }
    index += 1;
    if (choices[token] && !choices[token].includes(value)) {
      reject(`Invalid value for ${token}: ${value}. Choose ${choices[token].join(", ")}.`);
    } else if (token === "--channel-limit") {
      if (!/^[0-9]+$/u.test(value) || BigInt(value) === 0n) {
        reject("The channel limit must be a positive decimal integer.");
      } else {
        const integer = BigInt(value);
        options.channelLimit = integer <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(integer) : integer.toString();
      }
    } else {
      options[token.slice(2)] = value;
    }
  }
  if (options.file !== undefined) {
    // --file <path> is the positional input spelled as an option.
    if (options.input !== undefined) reject("Give the input file once: positional or --file.");
    else options.input = options.file;
    delete options.file;
  }
  if (options.test && args.length !== 1) reject("--test must be used alone.");
  if (options.manifest !== undefined && options.input !== undefined) reject("A manifest cannot be combined with a positional input.");
  if (options.channel === "unbounded" && options.channelLimit !== undefined) reject("An unbounded channel cannot also have a channel limit.");
  if (options.source !== undefined) {
    if (options.manifest !== undefined) reject("--source cannot be combined with a manifest.");
    if (!DROPPED_ENGINES.has(options.engine) && options.engine !== "nano-banana") reject(`--source compares a flattened prompt with its layer prompt: add --engine ${[...DROPPED_ENGINES, "nano-banana"].join("|")}.`);
  }
  return { options, errors };
}

function measure(text, result, options) {
  const layers = [];
  if (result.surface === "s1") layers.push({ kind: "contract", limit: 2000, assumed: false });
  if (options.channelLimit !== undefined) {
    layers.push({ kind: "channel", limit: options.channelLimit, assumed: false });
  } else if (options.channel === "bounded") {
    layers.push({ kind: "channel", limit: 2000, assumed: false });
  } else if (options.channel === undefined && result.surface === "s3") {
    // Assumed ChatGPT-web paste cap (surfaces.md §0-1). It applies to every S3 prompt (image, video, text), not only images.
    layers.push({ kind: "channel", limit: 10000, assumed: true });
  }
  if (result.engine === "gpt-image") layers.push({ kind: "engine", limit: 32000, assumed: false });
  const binding = layers.reduce((best, layer) => best === null || BigInt(layer.limit) < BigInt(best.limit) ? layer : best, null);
  const codepoints = Array.from(text).length;
  result.length = { codepoints, layers, binding: binding?.kind ?? null };
  if (binding === null) {
    emit(result, CODE_REGISTRY.ungated, "No numeric length layer applies; manage signal density as described in surfaces.md §0-1.");
    return;
  }
  const names = { contract: "기계 계약", channel: "전달 채널", engine: "타깃 엔진" };
  for (const layer of layers) {
    if (codepoints <= BigInt(layer.limit) || (layer !== binding && layer.kind !== "contract")) continue;
    const assumption = layer.assumed ? " 채널 미지정 — 보수적 가정값." : "";
    emit(result, CODE_REGISTRY[layer.kind],
      `${names[layer.kind]}: ${codepoints} codepoints exceeds ${layer.limit}; surface=${result.surface}, engine=${result.engine}.${assumption}`,
      layer.assumed ? { hint: "Use --channel unbounded for an unlimited channel, or --channel-limit for its actual limit." } : {});
  }
}

// fixed-lines.md writes `8K` once, in the realism line of the closing "## Finish" layer (`## 마무리` in a Korean prompt).
// That one occurrence is the documented exception to the quality-tag rule, so the
// phrasing checks do not see it. Any other 8K or tag still counts.
function withoutFinishEightK(instruction) {
  const heading = /^##[ \t]+(?:Finish|마무리)[ \t]*$/imu.exec(instruction);
  if (!heading) return instruction;
  const start = heading.index + heading[0].length;
  const next = /^##[ \t]/mu.exec(instruction.slice(start));
  const end = next ? start + next.index : instruction.length;
  const section = instruction.slice(start, end).replace(/(?<![\p{L}\p{N}_])8K(?![\p{L}\p{N}_])/iu, "  ");
  return instruction.slice(0, start) + section + instruction.slice(end);
}

function copyViews(text) {
  const quotes = [];
  const instruction = text.replace(/"([^"\r\n]+)"|“([^”\r\n]+)”/gu, (whole, straight, curved, index) => {
    const value = (straight ?? curved).replace(/\s+/gu, " ").trim();
    if (value) quotes.push({ value, start: index, end: index + whole.length });
    return " ".repeat(whole.length);
  });
  return { quotes, instruction };
}

function isEmpty(text, quotes) {
  if (quotes.length) return false;
  const residue = text
    .replace(/#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{4}\b|#[0-9a-f]{3}\b/giu, "")
    .replace(/(?:(?:aspect\s+ratio|ar|비율)\s*[:：=]?\s*)?\d+\s*:\s*\d+/giu, "");
  return !/[\p{L}\p{N}\p{Extended_Pictographic}]/u.test(residue);
}

function structuredBody(text) {
  let body = text.trim();
  const opening = /^(`{3,}|~{3,})([^\r\n]*)(?:\r?\n|$)/u.exec(body);
  if (opening) {
    const label = opening[2].trim().split(/\s/u)[0].toLowerCase();
    if (["json", "jsonl", "ndjson", "yaml", "yml"].includes(label)) return true;
    body = body.slice(opening[0].length);
    const lines = body.split(/\r?\n/u);
    const last = lines.at(-1)?.trim() ?? "";
    if (last.length >= opening[1].length && [...last].every((char) => char === opening[1][0])) lines.pop();
    body = lines.join("\n").trim();
  }
  if (body.startsWith("{") || /^\[\s*[{"]/u.test(body)) return true;
  if (!body.startsWith("[")) return false;
  try {
    return Array.isArray(JSON.parse(body));
  } catch {
    return false;
  }
}

function sentenceAt(instruction, quote) {
  const boundary = /[.?!;\n\r。]/u;
  let start = quote.start;
  let end = quote.end;
  while (start > 0 && !boundary.test(instruction[start - 1])) start -= 1;
  while (end < instruction.length && !boundary.test(instruction[end])) end += 1;
  return instruction.slice(start, end);
}

function inspectCopy(result, quotes, instruction) {
  const labeled = /(?:^|[.?!;\n\r。])\s*(?:카피|문구|헤드라인|표기 문구|이미지 속 글자|캡션 문구|copy|headline|tagline|on-image text|lettering|caption text)\s*[:：]/iu.test(instruction);
  if (labeled && !quotes.length) emit(result, CODE_REGISTRY.unquoted, "A copy label has no quoted text.", { hint: "Enclose the exact rendered string in a pair of double quotes." });
  const byValue = new Map();
  for (const quote of quotes) {
    if (!byValue.has(quote.value)) byValue.set(quote.value, []);
    byValue.get(quote.value).push(quote);
  }
  const editing = /\b(?:edit|replace|original|source\s+image|input\s+image|image\s*\d+)\b|원본|편집|교체|수정/iu.test(instruction);
  const preservation = /\b(?:keep|preserve|retain|unchanged)\b|\b(?:stay|remain)s?\s+(?:exactly\s+)?as\s+(?:it\s+)?is\b|\bleave\b[^.?!;\n\r。]*\bas\s+is\b|\b(?:do\s+not|don['’]t|never|not)\s+(?:change|alter|modify)\b|유지|보존|그대로\s*(?:둔다|두|유지)|바꾸지|변경하지/iu;
  for (const [value, uses] of byValue) {
    if (uses.length > 1) {
      const locked = result.profile === "native" && editing && uses.slice(1).every((quote) => preservation.test(sentenceAt(instruction, quote)));
      emit(result, locked ? CODE_REGISTRY.repeatedLock : CODE_REGISTRY.repeated,
        locked ? `Repeated preservation copy: ${value}` : `Repeated rendered copy: ${value}`,
        { hint: "Quote each rendered string once, then refer to its role when possible." });
    }
    if (/\p{Script=Hangul}/u.test(value) && /\p{Script=Latin}/u.test(value)) {
      emit(result, CODE_REGISTRY.mixedScript, `Mixed-script copy: ${value}`, {
        hint: "Preserve user-specified mixed wording. Consider separate lines or roles only when designing new copy.",
      });
    }
  }
  const roles = /상단|하단|중앙|가운데|좌측|우측|모서리|제목|부제|헤드라인|캡션|라벨|말풍선|효과음|가격표|\b(?:top|bottom|center|centered|left|right|upper|lower|corner|title|subtitle|headline|subhead|tagline|caption|label|byline|price\s+tag)\b/iu;
  if (byValue.size > 1 && !roles.test(instruction)) emit(result, CODE_REGISTRY.roleMissing, "Distinct copy strings have no stated role or placement.");
  const guard = /또렷|선명하게\s*읽히|가독|철자\s*그대로|한\s*번만|정확히\s*한\s*번|\b(?:legible|readable|crisp\s+lettering|spelled\s+exactly|exactly\s+once|only\s+once|appears\s+once)\b/iu;
  if ((labeled || quotes.length > 0) && !guard.test(instruction)) emit(result, CODE_REGISTRY.guardMissing, "Rendered text has no legibility or single-render instruction.");
}

function snippets(pattern, text) {
  return [...text.matchAll(pattern)].map((match) => match[0].trim());
}

function evidence(result, entry, found, message, hint) {
  const unique = [...new Set(found)].slice(0, 5);
  if (unique.length) emit(result, entry, `${message}: ${unique.join(" | ")}`, { evidence: unique, ...(hint ? { hint } : {}) });
}

function inspectSyntax(result, instruction) {
  const leading = /^\[([^\]\r\n]*)\]/u.exec(instruction.trim());
  if (leading && Array.from(leading[0]).length <= 80 && /\d+\s*:\s*\d+|\d+\s*[x×]\s*\d+|\b(?:size|ratio)\b/iu.test(leading[1])) {
    emit(result, CODE_REGISTRY.leadingMeta, "Leading brackets contain execution size or ratio metadata.", { hint: "Put size and ratio in settings outside the prompt body." });
  }
  evidence(result, CODE_REGISTRY.placeholder, snippets(/\[[A-Z_]{3,}\]|\{\{\s*[A-Za-z_][A-Za-z_0-9]*\s*\}\}/gu, instruction),
    "Unresolved substitutions");
  // An integer weight counts only as SD syntax ("(cat:2)": lowercase-initial label, colon, one digit 0-3); "(Time 12:30)", "(Day:2)", "(Seed:42)" and "(fig:2)" are ordinary parentheses.
  const weights = [...instruction.matchAll(/\(([^()\r\n]+):\s*(?:\d*\.\d+)\s*\)|<([^<>\r\n]+):\s*(?:\d*\.\d+)\s*>|\((\p{Ll}[^()\r\n]*[\p{L}_-]):[0-3]\)|<(\p{Ll}[^<>\r\n]*[\p{L}_-]):[0-3]>/gu)]
    .filter((match) => /\p{L}/u.test(match[1] ?? match[2] ?? match[3] ?? match[4])
      && !/(?:^|[\s(])(?:fig|figs|figure|table|tab|ch|chapter|vol|no|ref|step|scene|shot|image|img|page|section|pp?|note|cf)\.?$/iu.test(match[3] ?? match[4] ?? ""))
    .map((match) => match[0]);
  evidence(result, CODE_REGISTRY.weight, weights, "Numeric emphasis notation is not image prose");
  const flags = result.profile === "native"
    ? snippets(/(?<![\p{L}\p{N}_-])--[A-Za-z][A-Za-z0-9_-]*/gu, instruction)
    : snippets(new RegExp(`--(?:${BANNED_MJ_FLAGS.join("|")})\\b`, "giu"), instruction);
  evidence(result, CODE_REGISTRY.foreignFlag, flags, "Unsupported flags in instructions",
    "Pass supported parameters separately, outside the image prompt.");
  if (instruction.includes("§")) emit(result, CODE_REGISTRY.sectionSign, "A document section sign is present; describe the instruction directly instead.");
  // S3 has no evidence that the requested ratio was delivered via a UI setting.
  // Keep natural-language ratio labels there; only legacy AR tokens are suspect.
  const ratioToken = result.profile === "native" && result.surface === "s3"
    ? /\bar\s*[:：=]?\s*\d+\s*[:：]\s*\d+\s*$/iu
    : /(?:\b(?:ar|aspect\s+ratio)|비율)\s*[:：=]?\s*\d+\s*[:：]\s*\d+\s*$/iu;
  if (ratioToken.test(instruction)) {
    emit(result, CODE_REGISTRY.ratioToken, "A ratio token ends the prompt.", { hint: "Move it to parameters, UI settings, or a separate label line; see surface-contracts.md §4." });
  }
}

function inspectPhrasing(result, instruction) {
  let remaining = instruction.replace(/\bnegative\s+space\b/giu, (text) => " ".repeat(text.length));
  const exclusions = [];
  const remove = (whole) => {
    exclusions.push(whole.trim());
    return " ".repeat(whole.length);
  };
  remaining = remaining.replace(/(?:^|[.?!;\n\r。])\s*(?:negative(?:\s+prompt)?|negatives|avoid|exclude|exclusions|do\s+not\s+include|don['’]t\s+include|제외(?:\s*요소)?|네거티브|금지\s*요소|피할\s*것)\s*[:：][^.?!\n\r。]*/giu, remove);
  // A noun item stays short and cannot consume a following connector or marker.
  const word = "(?!(?:and|or|no|without)\\b)[\\p{L}\\p{N}][\\p{L}\\p{N}'’_-]*";
  const item = `\\b(?:no|without)\\s+${word}(?:[ \\t]+${word}){0,4}`;
  const connector = "(?:[ \\t]*[,;][ \\t]*(?:(?:and|or)[ \\t]+)?|[ \\t]+(?:and|or)[ \\t]+)";
  remaining = remaining.replace(new RegExp(`${item}(?:${connector}${item})+`, "giu"), remove);
  evidence(result, CODE_REGISTRY.exclusion, exclusions, "Collected exclusions",
    "Describe the intended background, objects and headcount, for example a plain gray background with one person.");
  if (result.profile === "assembled") {
    evidence(result, CODE_REGISTRY.negation,
      snippets(/\b(?:never|avoid|exclude|without|no|free\s+of|devoid\s+of|don['’]t|do\s+not)\s+[\p{L}\p{N}][^,.;!?\n\r。]*/giu, remaining),
      "Negative instruction wording",
      "Name the concrete state that should be visible. Keep a separate preservation sentence for the original logo or brand.");
    evidence(result, CODE_REGISTRY.koNegation,
      snippets(/[^\s,.!?;\n\r。]{0,12}(?:금지|하지\s*마(?:세요|라)?|하지\s*않(?:도록|게)|(?<!하|바꾸|바꿔|바뀌|건드리|지우|없애|옮기|움직이|훼손하|손대|고치|달라지)지\s*(?:마(?:세요|라|십시오)|않(?:도록|게))(?![가-힣])|없어야|없도록|빼고|제외하고)[^,.!?;\n\r。]{0,12}/gu, remaining).slice(0, 3),
      "Korean directive negation", "State the visible result positively, for example 책상 위에는 책 한 권만 놓인다.");
    const tags = snippets(/(?<![\p{L}\p{N}_])(?:masterpiece|(?:best|top|highest)\s+quality|(?:4|8|16)k|uhd|(?:ultra|hyper|extremely|insanely)[ -]+detailed|trending\s+on\s+artstation|featured\s+on\s+behance|award[ -]+winning|octane\s+render|unreal\s+engine)(?![\p{L}\p{N}_])/giu, instruction);
    evidence(result, CODE_REGISTRY.quality, tags.map((tag) => tag.toLowerCase()), "Generic quality tags");
  }
  evidence(result, CODE_REGISTRY.vague,
    snippets(/(?<![\p{L}\p{N}_])(?:예쁘게|멋있게|근사하게|분위기\s+있게|느낌\s+있게|감각적으로|트렌디하게|힙하게|퀄리티\s+높게|완벽하게|고퀄로|gorgeous|breathtaking|epic|amazing|awesome|eye-catching|stunning|beautiful|perfect)(?![\p{L}\p{N}_])/giu, instruction),
    "Evaluative wording", "Specify the light, material or composition that creates the desired appearance.");
}

// surface-contracts.md §3.2.4; the checked subset is listed in production.md.
// Negation is scoped to the hit: an English negator before it in the same
// comma clause, a Korean or trailing negator after it, or a negated list that
// the clause continues. A sentence that only excludes grain is left alone.
const NOISE_TRIGGER = /(?<![\p{L}\p{N}_])(?:film[ -]grain|grainy|gritty|(?:analog|heavy|coarse|visible)\s+grain|iso\s+noise|noise\s+texture|(?:ultra|hyper|extremely|insanely)[ -]*detailed|micro[ -]?details?|intricate\s+details?|8k|(?:dust|floating|tiny)\s+particles|paper\s+grain|canvas\s+texture|rough\s+texture)(?![\p{L}\p{N}_])|필름\s*그레인|입자감|거친\s*(?:입자|질감)|초고화질|극세밀/giu;
const NOISE_NEGATOR = "(?:no|not|never|without|avoid\\w*|zero|nothing|free\\s+of|remov\\w*|reduc\\w*|denois\\w*|don['’]t)";
const NOISE_BEFORE = new RegExp(`(?<![\\p{L}\\p{N}_])${NOISE_NEGATOR}(?![\\p{L}\\p{N}_])`, "iu");
const NOISE_OPENS = new RegExp(`^\\s*(?:[A-Z][A-Z0-9 &/'’-]{1,40}:\\s*)?(?:do\\s+)?${NOISE_NEGATOR}(?![\\p{L}\\p{N}_])`, "u");
const NOISE_AFTER = /^[\s-]*(?:free|removed|eliminated)(?![\p{L}\p{N}_])|없이|없는|없게|없도록|없애|제거|금지|빼고|않/iu;

function inspectNoise(result, instruction) {
  // fixed-lines.md writes grain and 8K into new prompts, so only assembled text and edits are screened.
  if (result.engine !== "gpt-image") return;
  if (result.profile !== "assembled" && !/^\s*Edit the attached\b/u.test(instruction)) return;
  const hits = [];
  for (const segment of instruction.split(/(?<=[.?!。;])\s+|\r?\n/u)) {
    const clauses = segment.split(",").map((text) => ({
      text,
      found: [...text.matchAll(NOISE_TRIGGER)].map((match) => ({
        word: match[0].trim().toLowerCase(),
        negated: NOISE_BEFORE.test(text.slice(0, match.index)) || NOISE_AFTER.test(text.slice(match.index + match[0].length)),
      })),
    }));
    let carried = new RegExp(NOISE_OPENS.source, "iu").test(clauses[0].text);
    clauses.forEach((clause, index) => {
      // A new affirmative instruction is not another item in a negated list.
      // Keep this lexical boundary narrow; it does not judge the requested look.
      if (/^\s*(?:(?:and|but|then|however)\s+)?(?:add|use|include|introduce|apply|show|render|create|make|keep|give|place|retain|preserve)\b/iu.test(clause.text)) carried = false;
      // A bare list item is negated when a later item of the same list is.
      const listed = clause.found.length === 1 && clause.text.trim().length <= clause.found[0].word.length + 6
        && clauses.slice(index + 1).some((later) => later.found.some((hit) => hit.negated));
      for (const hit of clause.found) if (!hit.negated && !carried && !listed) hits.push(hit.word);
      if (clause.found.some((hit) => hit.negated)) carried = true;
    });
  }
  evidence(result, CODE_REGISTRY.noise, hits, "Reported vocabulary to review, not a verified grain prediction",
    "Not a deletion order: report it to the user, and keep it if that look was requested. In new prompts name the visible detail or tone instead.");
}

const KNOWN_RATIOS = "(?:1[:：]1|2[:：]3|3[:：]2|3[:：]4|4[:：]3|4[:：]5|5[:：]4|9[:：]16|16[:：]9|9[:：]21|21[:：]9|1[:：]2|2[:：]1|1[:：]3|3[:：]1|2\\.39[:：]1|1\\.85[:：]1)";
const SENTENCE_SPLIT = /(?<=[.?!。])\s+|\r?\n/u;

function layerSections(instruction) {
  const sections = [];
  let current = { name: null, lines: [] };
  sections.push(current);
  for (const line of instruction.split(/\r?\n/u)) {
    const heading = /^##\s+(.+?)\s*$/u.exec(line);
    if (heading) {
      current = { name: heading[1], lines: [] };
      sections.push(current);
    } else {
      current.lines.push(line);
    }
  }
  return sections;
}

// Engine-independent contradictions. Heuristics only: each one is a review prompt except the decimal point.
function inspectCoherence(result, text, instruction) {
  if (/\d。\d/u.test(text)) emit(result, CODE_REGISTRY.decimal, "A decimal point was replaced by an ideographic full stop.", { hint: "Write 7.5 and f/1.4 with an ASCII period." });
  const sentences = instruction.split(SENTENCE_SPLIT);
  const overFace = /\b(?:hair|strands?|fringe|bangs|curtains?)\b[^.\n]{0,60}\b(?:(?:falls?|falling|hangs?|drapes?)\s+(?:across|over)|(?:across|over)\s+(?:her|his|the|one|both)\s+(?:face|eyes?|brows?)|covers?|covering|hides?|hiding|veils?)\b[^.\n]{0,30}\b(?:face|eyes?|brows?)\b/iu;
  const keptClear = /\b(?:stays?|stay|kept|keeps?)\s+clear\b|\bno\s+(?:hair|strands?)\s+(?:across|over|covering)\b/iu;
  const awayFromFace = /\b(?:never|not|no|without|away from|off|tucked)\b/iu;
  if (sentences.some((sentence) => overFace.test(sentence) && !awayFromFace.test(sentence)) && keptClear.test(instruction)) {
    emit(result, CODE_REGISTRY.occlusion, "Hair is written over the face while another line keeps the face clear.", { hint: "Keep one: turn off the face-clear line when the look needs hair across the face." });
  }
  const mm = [...instruction.matchAll(/(?<![\p{L}\p{N}_.])(\d{1,3})\s?mm\b(?!\s+(?:film|grain|negative|stock|format|cinema|print|slide|super|photographs?|photos?|stills?|frames?|snapshots?|camera(?!\s+lens)))/giu)].map((match) => Number(match[1]));
  // A bare 广角 is not here: the lens fixed line writes "no 广角 stretch", so only the lens forms count.
  const wideWord = /\b(?:ultra[- ]?wide|fish[- ]?eye|wide[- ]angle\s+(?:lens|shot|view|selfie)|wide\s+lens)\b|超广角|广角镜头|广角 lens|広角レンズ|広角 lens/iu.test(instruction);
  const noStretch = /\bno\s+(?:wide[- ]angle\s+stretch|distortion)\b|\bundistorted\b|\bdistortion[- ]free\b|无畸变|自然透视|natural perspective/iu.test(instruction);
  if (new Set(mm).size >= 2 || (noStretch && (wideWord || mm.some((value) => value <= 28)))) {
    emit(result, CODE_REGISTRY.focal, "Focal lengths disagree: two different lenses, or a wide lens beside an undistorted-face line.", { hint: "Keep one lens statement in the Camera layer." });
  }
  const sections = layerSections(instruction);
  // A porcelain base is makeup (the CN base line is 冷白瓷肌), so it passes inside Hair and makeup; the same word elsewhere still reads as a natural color.
  const porcelainBase = /瓷肌|瓷肤|도자기 피부|포슬린 스킨|\bporcelain[- ](?:skin|finish)\b/giu;
  const outsideIdentity = sections.filter((section) => section.name !== "Identity Reference")
    .flatMap((section) => (/^(?:Hair and makeup|Makeup)$/iu.test(section.name ?? "") ? section.lines.map((line) => line.replace(porcelainBase, "")) : section.lines)).join("\n");
  const keepsTone = /\bkeeps?\s+(?:her|his|their)\s+own\s+skin\s+tone\b/iu.test(instruction);
  // Only the natural skin color (fair, pale, tan, 冷白皮) is flagged. A finish the makeup makes (porcelain finish, 瓷肌, glass skin; porcelain only inside Hair and makeup) and light on the skin
  // (sun-warmed glow on the skin, a neon tint on the cheek) pass: the color word must be a whole word next to "skin", at most one word between.
  const skinColor = snippets(/\b(?:fair|pale|porcelain|ivory|olive|tan(?:ned)?|golden|bronzed?|deep|dark|brown|cool|warm|milky)\b[ -]?(?:[\w-]+[ -]){0,1}skin\b|冷白皮|白皙|瓷肌|흰 피부|하얀 피부|色白|白い肌/giu, outsideIdentity);
  if (keepsTone && skinColor.length) {
    emit(result, CODE_REGISTRY.identitySkin, `A skin color is written outside the identity paragraph: ${[...new Set(skinColor)].slice(0, 3).join(" | ")}`, { hint: "The natural skin color belongs in the identity condition only; a reference keeps its own tone. Makeup finish and light on the skin are fine elsewhere." });
  }
  const ratios = instruction.match(new RegExp(`(?<![\\d:：.])${KNOWN_RATIOS}(?![\\d:：])`, "gu")) ?? [];
  if (ratios.length >= 2) emit(result, CODE_REGISTRY.ratioDup, `An aspect ratio is written ${ratios.length} times: ${[...new Set(ratios)].join(" | ")}`, { hint: "Write the ratio once, in the Camera layer." });
  const makeup = sections.find((section) => /^(?:Hair and makeup|Makeup)$/iu.test(section.name ?? ""));
  const lipLines = (makeup?.lines ?? []).filter((line) => /\b(?:lips?|lipstick)\b|唇|립|입술/iu.test(line));
  const catchLines = instruction.split(/\r?\n/u).filter((line) => /catch[- ]?lights?|eye[- ]?lights?|眼神光|캐치라이트|キャッチライト|\bglints?\s+in\s+(?:each|both|her|his)\s+eyes?|point of light sits in each eye/iu.test(line));
  if (lipLines.length >= 2 || catchLines.length >= 2) {
    emit(result, CODE_REGISTRY.slotDup, lipLines.length >= 2 ? `Hair and makeup has ${lipLines.length} lip lines.` : `The catchlight is written on ${catchLines.length} lines.`, { hint: "A slot is filled once: remove the later line." });
  }
  const layerFacts = inspectLayerFacts(result, sections);
  // Words, or the Light and Scene line heads whose lexicon rows are tagged night-only or midday-only (a head in any language reads the same). 밤 is also the chestnut: only 밤하늘, 밤거리, 밤에, 밤의, 밤중 count (not a bare 밤, 밤을, 밤이 or 밤색); "밤에 구운 밤" misreads and a bare "at 밤" is missed.
  const nightHeads = layerFacts.night, middayHeads = layerFacts.noon;
  const night = /\b(?:night(?:time)?|midnight|after dark)\b|深夜|夜晚|の夜|한밤|심야|야경|야간|夜景(?!モード)|夜空(?![色蓝藍])|真夜中|夜間|夜间|夜里|夜の街|(?<!\p{sc=Hangul})(?:밤(?:하늘|거리|중)(?:에서|에는|에도|에|으로|이|가|은|는|을|를|의|도|만|과|와|로)?|밤(?:에(?:는|도|만)?|의)|오늘밤(?:에|은|는|의)?)(?!\p{sc=Hangul})/iu.test(instruction) || nightHeads.length > 0;
  const midday = /\b(?:noon|midday|mid-day|noonday)\b|正午|中午|真昼|한낮|대낮|정오(?!각)/iu.test(instruction) || middayHeads.length > 0;
  if (night && midday) {
    const named = (heads) => (heads.length ? ` (${heads.slice(0, 2).join(", ")})` : "");
    emit(result, CODE_REGISTRY.dayNight, `A night cue${named(nightHeads)} and midday light${named(middayHeads)} appear in the same prompt.`, { hint: "Pick one time of day and make Light and Optics agree." });
  }
  inspectSlotNames(result, sections);
  inspectChoices(result, instruction);
  inspectEngine(result, instruction);
}

// One image is one pose: the author picks the value (image-brief.md slot table). A prompt that hands the choice to the model ("Choose exactly one") or lists poses makes a batch collapse onto one of them.
// The choose/pick/select verbs count only as a command (sentence start, after a colon, dash or bullet, or after "you must"): "She will choose one of the cups" and "pick one petal" describe the scene. Korean counts only 다음·아래·위·이·그 중 하나를/만, or an imperative ending: "꽃 하나를 골라 든 손" describes the scene. Limit: a bare "하나를 골라 그린다" is not caught.
const PICK_LEAD = "(?<=(?:^|[.!?:;—–(\\-*•])[ \\t]*(?:(?:please|now|then|just)\\s+|(?:you|the\\s+model|model)\\s+(?:should|must|may|can|will)\\s+)?)";
const PICK_ONE = new RegExp(`${PICK_LEAD}(?:(?:choose|select)\\s+(?:exactly\\s+|only\\s+)?one\\s+of\\b|(?:choose|pick|select)\\s+(?:exactly|only)\\s+one\\b|(?:choose|pick)\\s+one\\b(?!\\s+up\\b))|\\bone\\s+of\\s+the\\s+following\\b|\\bany\\s+one\\s+of\\s+(?:these|the\\s+following)\\b|(?<![\\p{L}\\p{N}])(?:다음|아래|위|이|그)\\s*중(?:에서)?\\s*(?:하나|한\\s*가지)(?:를|을|만|로)|하나(?:만|를)?\\s*(?:고르세요|고르시오|고르십시오|골라라|골라\\s*주세요|선택하세요|선택하시오)`, "gimu");
const POSE_LIST_LINE = /^\s*(?:\d{1,2}\s*[.)]\s|\(\d{1,2}\)\s|[-*•]\s+|(?:option|pose|variant|choice)\s+[A-Z0-9]\b|(?:옵션|포즈|자세)\s*\d)/iu;
// A posture word per stem; two different stems on either side of "or" is a list of poses ("standing or sitting"). A pose on one side only ("one hand on the rail or hip") is not.
const POSTURE = /\b(?:stand(?:s|ing)?|sit(?:s|ting)?|seated|lean(?:s|ing)?|walk(?:s|ing)?|kneel(?:s|ing)?|crouch(?:es|ing)?|squat(?:s|ting)?|lie|lies|lying|recline[ds]?|reclining|perch(?:es|ed)?|dancing|running)\b|서\s*있|앉|기대|걷|누워/giu;
const POSTURE_STEMS = [["stand", /^stand/], ["sit", /^(?:sit|seated)/], ["lean", /^lean/], ["walk", /^walk/], ["kneel", /^kneel/], ["crouch", /^crouch/], ["squat", /^squat/], ["lie", /^(?:lie|lying|reclin)/], ["perch", /^perch/], ["dance", /^danc/], ["run", /^runn/], ["서", /^서/], ["앉", /^앉/], ["기대", /^기대/], ["걷", /^걷/], ["누", /^누/]];
const POSTURE_OR = /\bor\b|또는|혹은|아니면/giu;
// A negated pair ("standing tall, not leaning or sitting", "no standing or walking blur") rules postures out, so the pose is already one.
const NEGATION = /\b(?:not|never|no|nor|without|avoid|instead\s+of|rather\s+than)\b|않|말고|없이|아닌/iu;
const postureStems = (text) => new Set(snippets(POSTURE, text).map((word) => POSTURE_STEMS.find(([, stem]) => stem.test(word.toLowerCase()))?.[0]));
// Semicolons stay inside a segment so "stands at the window; or sits on the sill" keeps its left side. Three different postures in one segment with no negation ("one of standing, sitting, leaning") is a list too; a two-posture list without "or" ("standing; sitting") is not caught.
function postureAlternatives(line) {
  const hits = [];
  for (const segment of line.split(/[.。]|\s[—–]\s/u)) {
    if (postureStems(segment).size >= 3 && !NEGATION.test(segment)) hits.push(segment.trim().slice(0, 80));
    for (const connector of segment.matchAll(POSTURE_OR)) {
      if (NEGATION.test(segment.slice(0, connector.index))) continue;
      const left = segment.slice(0, connector.index).replace(/[,;\s]+$/u, "").split(/[,;]/u).at(-1).split(/\s+/u).slice(-6).join(" ");
      const right = segment.slice(connector.index + connector[0].length).replace(/^[,;\s]+/u, "").split(/[,;]/u)[0].split(/\s+/u).slice(0, 6).join(" ");
      const [before, after] = [postureStems(left), postureStems(right)];
      if ([...before].some((stem) => [...after].some((other) => other !== stem))) hits.push(segment.trim().slice(0, 80));
    }
  }
  return hits;
}
// The Pose layer is any heading level whose name starts with pose, posture, 포즈 or 자세 ("## Pose and hands", "### POSE"). A line that ends or starts with "or" is joined to its neighbour so a wrapped "standing, or / sitting" reads as one.
function poseLines(instruction) {
  const lines = [];
  let inPose = false;
  for (const line of instruction.split(/\r?\n/u)) {
    const heading = /^#{1,6}\s+(.+?)\s*$/u.exec(line);
    if (heading) inPose = /^(?:poses?|posture)(?![\p{L}])|^(?:포즈|자세)/iu.test(heading[1]);
    else if (inPose && line.trim()) lines.push(line);
  }
  return lines.reduce((joined, line) => {
    if (joined.length && (/(?:\bor|또는|혹은|아니면)[,\s]*$/iu.test(joined.at(-1)) || /^\s*(?:or\b|또는|혹은|아니면)/iu.test(line))) joined[joined.length - 1] += ` ${line.trim()}`;
    else joined.push(line);
    return joined;
  }, []);
}
function inspectChoices(result, instruction) {
  evidence(result, CODE_REGISTRY.pickOne, snippets(PICK_ONE, instruction), "The prompt hands a choice to the model",
    "The author picks the value and writes it as one statement; leave no option list or choose-one wording in the prompt (image-brief.md slot table).");
  const lines = poseLines(instruction);
  const listed = lines.filter((line) => POSE_LIST_LINE.test(line));
  const alternatives = lines.flatMap(postureAlternatives);
  if (listed.length >= 2 || alternatives.length) {
    emit(result, CODE_REGISTRY.poseOptions, listed.length >= 2 ? `The Pose layer has ${listed.length} numbered or bulleted lines, a list of options.` : `The Pose layer joins different postures with "or": ${[...new Set(alternatives)].slice(0, 2).join(" | ")}`,
      { hint: "Write one pose: the author picks it, and weight shift, hands and turn are lines of that one pose. For several images, write one prompt per pose." });
  }
}

// image-brief.md §3 slot table: one slot, one owner layer. These checks read the line heads of layers through their lexicon rows, so a head in any language reads the same
// (와이드 팬츠, 阔腿裤 and wide-leg trousers are one row). Row tags the lexicon carries: 긴 기장 (Outfit: a garment that covers the whole leg), 스타킹류 (Legwear: stockings, tights),
// 몸:등 and 몸:정면 (Expression and Pose: the body turned away, square to the camera), 장소:<kind> (Pose: needs a car, rail, stair, bed, sofa, water's edge, road or elevator),
// 밤 한정 and 한낮 한정 (Light and Scene: night only, midday only). A tag counts only when every row of that head in that layer has it; a head with no row is read as English where noted. A warning, never an error.
const LAYER_KEY = { outfit: /^(?:Outfit|Outerwear|Clothing)\b/iu, legwear: /^(?:Legwear|Hosiery)\b/iu, pose: /^(?:Poses?|Posture)\b/iu, expression: /^Expression\b/iu, light: /^Light\b/iu, scene: /^Scene\b/iu };
// A visible-leg cue takes the legwear warning away: the stockings are meant to show. In the Outfit sentence it is a slit, rips, mesh, a cropped hem; in either sentence it is the ankle or the strip between hem and shoe
// ("the hem stops above the ankle", "show at the ankle between the hem and the loafers"). Limit: a real clash that also writes "show" or "ankle" goes unflagged.
const ANKLE_SHOWN = /\b(?:ankles?|above the (?:shoes|loafers|heels|sneakers|boots)|between the (?:hem|skirt|pant|trouser)s?|visible|shows?|showing|baring|lifted)\b/iu;
const LEG_SHOWN = new RegExp(`\\b(?:slits?|split|rips?|ripped|torn|tears?|distressed|holes?|cut-?outs?|sheer|see-through|translucent|transparent|semi-sheer|mesh|lace|cropped|openings?)\\b|${ANKLE_SHOWN.source}`, "iu");
const HOSE_SHOWN = new RegExp(`\\b(?:rips?|ripped|slits?|torn|holes?|cut-?outs?)\\b|${ANKLE_SHOWN.source}`, "iu");
const COVERS_HEAD = /\b(?:trousers|pants|jeans|slacks|chinos|jumpsuit|overalls|dungarees|leggings|joggers|sweatpants|culottes|maxi (?:dress|skirt)|floor[- ]length)\b/iu;
const SHORT_HEAD = /\b(?:shorts?|cropped|capris?|mini|ankle[- ]length)\b/iu;
const HOSE_HEAD = /\b(?:tights|stockings?|pantyhose|hosiery|nylons|fishnets?|collants?)\b/iu;
const NOT_HOSE = /\b(?:socks?|knee|ankle|thigh|bare|no|without)\b/iu;
// English words of each place kind, read in the opener and the layers outside Pose and in the English description of every line-head row outside Pose. Wide on purpose: a stray word means no warning.
const PLACE_WORDS = {
  차: /\b(?:cars?|taxis?|cabs?|vehicles?|trucks?|pickups?|vans?|minivans?|sedans?|hatchbacks?|wagons?|suvs?|jeeps?|coup[eé]s?|convertibles?|automobiles?|limousines?|buses|motorcycles?|windshield|headlights?|tail ?lights?|garage|driveway|parked|parking|(?:back|rear|passenger|driver'?s?) ?seat)\b/iu,
  난간: /\b(?:rails?|railings?|balustrades?|banisters?|handrails?|parapets?|guardrails?|guard rails?|balcon(?:y|ies)|terraces?|rooftops?|overlooks?|fences?|bridges?|fire escapes?|piers?|docks?)\b/iu,
  계단: /\b(?:stairs?|staircases?|stairways?|stairwells?|steps|stoops?|escalators?|landings?|porch(?:es)?|entrances?|doorsteps?|terraces?)\b/iu,
  침대: /\b(?:beds?|bedding|bedsheets?|sheets|bed ?linen|duvets?|quilts?|blankets?|pillows?|mattress(?:es)?|bedrooms?|bedside|headboards?|dorms?|apartments?|hotel rooms?)\b/iu,
  소파: /\b(?:sofas?|couch(?:es)?|settees?|canap[ée]s?|armchairs?|loveseats?|booths?|banquettes?|cushions?|living rooms?|lounges?)\b/iu,
  물가: /\b(?:beach(?:es)?|sand|shore(?:line)?s?|surf|sea|seaside|ocean|coast(?:al|line)?|waves?|lakes?|lakeside|rivers?|riverside|riverbanks?|ponds?|canals?|harbou?rs?|piers?|quays?|waterfront|bay|dunes?|pools?|fountains?|water)\b/iu,
  도로: /\b(?:roads?|streets?|highways?|asphalt|lanes?|avenues?|boulevards?|crossings?|crosswalks?|sidewalks?|curbs?|pavements?|alleys?|intersections?|motorways?|freeways?|routes?|paths?)\b/iu,
  엘리베이터: /\b(?:elevators?|lifts?|elevator cars?)\b/iu,
};
// The same kinds in the original languages a mixed prompt writes them in (Hangul, Han, kana have no \b). Wide on purpose, like the English list.
const PLACE_NATIVE = {
  차: /자동차|승용차|택시|차창|차량|汽车|轿车|出租车|车窗|车内|自動車|タクシー|車内|車窓/u,
  난간: /난간|펜스|울타리|베란다|발코니|테라스|옥상|옥탑|대교|철교|육교|栏杆|围栏|护栏|扶手|桥|阳台|露台|天台|屋顶|手すり|欄干|橋|ベランダ|バルコニー|屋上|フェンス/u,
  계단: /계단|층계|댓돌|툇마루|현관|에스컬레이터|楼梯|台阶|石阶|阶梯|门廊|门口|階段|石段|玄関|エスカレーター/u,
  침대: /침대|이불|베개|침구|침실|기숙사|床上|床边|床头|床单|被子|枕头|卧室|宿舍|ベッド|布団|寝室|枕/u,
  소파: /소파|쿠션|거실|라운지|沙发|客厅|抱枕|ソファ|クッション|カウチ|リビング/u,
  물가: /물가|바다|바닷가|해변|해안|강가|강변|호수|연못|수영장|분수|항구|부두|파도|모래|海|河|湖|江|池|港|码头|沙滩|喷泉|游泳池|水边|川|ビーチ|砂浜|プール|噴水|水辺|波/u,
  도로: /도로|골목|거리|횡단보도|인도|보도|차도|길가|马路|街|路|人行道|斑马线|道路|通り|道|横断歩道|歩道|路地/u,
  엘리베이터: /엘리베이터|승강기|电梯|升降机|エレベーター|エレベータ/u,
};
function layerLines(sections) {
  return sections.filter((section) => section.name && /^[A-Za-z]/u.test(section.name) && section.name !== "Identity Reference")
    .flatMap((section) => section.lines.flatMap((line) => {
      const match = LAYER_LINE.exec(line);
      return match ? [{ section: section.name, head: match[1].trim(), sentence: unquote(match[2]) }] : [];
    }));
}
function inspectLayerFacts(result, sections) {
  const lines = layerLines(sections);
  const facts = { night: [], noon: [] };
  if (!lines.length) return facts;
  const sources = mixSources();
  const rowsOf = (item, slug) => (sources?.rowsByName.get(mixKey(item.head)) ?? []).filter((row) => row.slug === slug);
  const tagsOf = (item, slug) => { const rows = rowsOf(item, slug); return rows.length ? rows[0].tags.filter((tag) => rows.every((row) => row.tags.includes(tag))) : []; };
  const inLayer = (key) => lines.filter((item) => LAYER_KEY[key].test(item.section));
  const tagged = (key, slug, tag) => inLayer(key).filter((item) => tagsOf(item, slug).includes(tag));
  const english = (key, slug, wanted, unwanted) => inLayer(key).filter((item) => !rowsOf(item, slug).length && wanted.test(item.head) && !unwanted.test(item.head));
  const named = (items) => items.map((item) => `${item.section} ${item.head}`);
  facts.night = named([...tagged("light", "light", "밤 한정"), ...tagged("scene", "scene", "밤 한정")]);
  facts.noon = named([...tagged("light", "light", "한낮 한정"), ...tagged("scene", "scene", "한낮 한정")]);

  const covers = [...tagged("outfit", "outfit", "긴 기장"), ...english("outfit", "outfit", COVERS_HEAD, SHORT_HEAD)].filter((item) => !LEG_SHOWN.test(item.sentence));
  const hose = [...tagged("legwear", "legwear", "스타킹류"), ...english("legwear", "legwear", HOSE_HEAD, NOT_HOSE)].filter((item) => !HOSE_SHOWN.test(item.sentence));
  if (covers.length && hose.length) {
    emit(result, CODE_REGISTRY.legwear, `${covers[0].head} (Outfit) covers the whole leg, yet Legwear writes ${hose[0].head}.`, { hint: "Legwear is left out when trousers or a long skirt cover the legs (image-brief.md §3). Drop the Legwear line, or keep it when a slit, rips or a cropped hem show the leg." });
  }

  const turned = [...tagged("expression", "expression", "몸:등"), ...tagged("pose", "pose", "몸:등")];
  const square = [...tagged("expression", "expression", "몸:정면"), ...tagged("pose", "pose", "몸:정면")];
  const isPose = (item) => LAYER_KEY.pose.test(item.section);
  const clash = turned.find((one) => square.some((other) => isPose(one) !== isPose(other)));
  if (clash) {
    const other = square.find((item) => isPose(item) !== isPose(clash));
    emit(result, CODE_REGISTRY.bodyDir, `${clash.head} (${clash.section}) turns the body away, ${other.head} (${other.section}) faces the camera square on.`, { hint: "The body angle belongs to Pose (image-brief.md §3 slot table): write the Expression line for the face only, or pick the Pose and Expression rows that agree." });
  }

  const first = unquote(sections.find((section) => section.name === null)?.lines.join(" ") ?? "");
  const outside = lines.filter((item) => !LAYER_KEY.pose.test(item.section));
  const unshown = [];
  for (const item of inLayer("pose")) {
    for (const tag of tagsOf(item, "pose")) {
      const kind = /^장소:(.+)$/u.exec(tag)?.[1];
      const words = kind && PLACE_WORDS[kind];
      if (!words) continue;
      const seen = (text) => words.test(text) || PLACE_NATIVE[kind].test(text);
      const shown = seen(first) || outside.some((other) => seen(`${other.head} ${other.sentence}`) || (sources?.rowsByName.get(mixKey(other.head)) ?? []).some((row) => words.test(row.looks)));
      if (!shown) unshown.push(`${item.head} (${kind})`);
    }
  }
  if (unshown.length) {
    emit(result, CODE_REGISTRY.posePlace, `${unshown.length} Pose row(s) need a place nothing else in the prompt shows: ${[...new Set(unshown)].slice(0, 3).join(" | ")}`, { hint: "Put the place the pose uses (the car, the rail, the stair, the bed) in Scene, or pick a pose that fits the scene." });
  }
  return facts;
}

// image-brief.md §12.2: a token names the thing shown, never a layer or category name. Slot tokens that fixed-lines.md and the look-card frame define (face clear, catchlight, palette, vertical frame, horizontal frame, focus, hands) are allowed. Only the `token — sentence` lines inside a layer are read.
const SLOT_NAMES = new Set(["hair color", "hair colour", "hair", "hairstyle", "makeup", "outfit", "clothing", "clothes", "pose", "expression", "background", "foreground", "scene", "setting", "location", "passersby", "passers-by", "people", "crowd", "road surface", "ground", "floor", "sky", "lighting", "light", "shadow", "shadows", "mood", "atmosphere", "color", "colors", "colour", "camera", "camera angle", "composition", "style", "medium", "nails", "nail", "props", "legwear", "optics"]);
function inspectSlotNames(result, sections) {
  const names = [];
  for (const section of sections) {
    if (!section.name) continue;
    for (const line of section.lines) {
      const token = /^([^—\n]{1,40}?)\s+—\s+\S/u.exec(line)?.[1].trim();
      if (token && SLOT_NAMES.has(token.toLowerCase())) names.push(token);
    }
  }
  if (names.length) emit(result, CODE_REGISTRY.slotName, `${names.length} token(s) name the slot, not the thing shown: ${[...new Set(names)].slice(0, 4).join(" | ")}`, { hint: "Name what is shown: a culture's thing in its own language (黒髪ロング, 商店街), anything else in English (manhole cover, cast shadows)." });
}

// image-brief.md §2: English sentences carry the prompt; original-language words sit only where a lexicon row, a look card, fixed-lines.md or the user put them.
// Only the `token — sentence` lines of layers with English names are read, so a prompt the user asked for in Korean (Korean headings) is skipped. Text matching only: no image output is judged.
const NATIVE_CHAR = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}]/u;
// A chunk is a run of original-language characters; Hangul words written with spaces between them count as one chunk.
const NATIVE_CHUNK = /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}][\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}ー〜・]*(?:[ ]+\p{sc=Hangul}+)*/gu;
const LAYER_LINE = /^([^—\n]{1,60}?)\s+—\s+(\S.*)$/u;
const KOREAN_PARTICLES = ["에서", "으로", "에는", "은", "는", "이", "가", "을", "를", "에", "의", "로", "과", "와", "도", "만"];
const mixKey = (text) => text.normalize("NFKC").toLowerCase().replace(/[\s\-\u00b7\u30fb]+/gu, "");
const chunksOf = (text) => text.match(NATIVE_CHUNK) ?? [];
const mixRoot = resolve(dirname(modulePath), "../references/image");
let mixKnown;
// Everything an original-language word may come from: lexicon tokens and aliases, and the original-language chunks in the table rows and backtick spans of fixed-lines.md
// (its sentence-word tables, identity formulas and fixed lines) and of the look cards, and the Identity template. The prose around them is left out, and so are the examples in image-brief.md, which must pass
// on these sources rather than vouch for themselves. If the lexicon cannot be read, the two checks that need it stay quiet instead of guessing.
function mixSources() {
  if (mixKnown !== undefined) return mixKnown;
  try {
    const known = new Set();
    const rowsByToken = new Map();
    const rowsByName = new Map();
    const everyRow = [];
    for (const layer of loadAll(resolve(mixRoot, "lexicon"))) {
      for (const row of layer.rows) {
        row.slug = layer.slug;
        for (const name of [row.token, ...row.aliases]) {
          known.add(mixKey(name));
          rowsByName.set(mixKey(name), [...(rowsByName.get(mixKey(name)) ?? []), row]);
        }
        const key = mixKey(row.token);
        rowsByToken.set(key, [...(rowsByToken.get(key) ?? []), row]);
        everyRow.push({ row, slug: layer.slug });
      }
    }
    // A 부분 row's first tag names what it is a part of (고름 → 한복, 박석 → 고궁; layer-lexicon.md). Each outfit or scene row that owns part rows, with the original-language names of its parts
    // (an alias that repeats the owner's own name, 한복 고름, does not count as the part's name).
    const ownersByName = new Map();
    for (const { row, slug } of everyRow) {
      if (row.tags.includes("부분") || (slug !== "outfit" && slug !== "scene")) continue;
      for (const name of [row.token, ...row.aliases]) ownersByName.set(mixKey(name), [...(ownersByName.get(mixKey(name)) ?? []), { row, slug }]);
    }
    const owners = new Map();
    for (const { row } of everyRow) {
      if (!row.tags.includes("부분")) continue;
      for (const owner of (ownersByName.get(mixKey(row.tags[0])) ?? []).filter((entry) => entry.row.culture.some((culture) => row.culture.includes(culture)))) {
        const ownKey = mixKey(owner.row.token);
        const names = [row.token, ...row.aliases.filter((alias) => NATIVE_CHAR.test(alias) && !mixKey(alias).includes(ownKey))];
        const entry = owners.get(owner.row) ?? { slug: owner.slug, parts: [], others: [] };
        entry.parts.push({ token: row.token, names });
        owners.set(owner.row, entry);
      }
    }
    // A 부분 row's first tag is not always an owner (立领 is tagged 단정함, 障子 전통): any 부분 row of the owner's layer and culture is one of its parts too.
    for (const [owner, entry] of owners) {
      for (const { row, slug } of everyRow) {
        if (slug !== entry.slug || !row.tags.includes("부분") || !row.culture.some((culture) => owner.culture.includes(culture))) continue;
        if (!entry.parts.some((part) => part.token === row.token)) entry.others.push({ token: row.token, names: [row.token, ...row.aliases.filter((alias) => NATIVE_CHAR.test(alias))] });
      }
    }
    // A space-joined chunk (순한 이목구비) also lists each of its words.
    const add = (text) => { for (const chunk of chunksOf(text)) for (const word of [chunk, ...chunk.split(/\s+/u)]) known.add(mixKey(word)); };
    const fixedLines = resolve(mixRoot, "fixed-lines.md");
    const files = [fixedLines];
    const looks = resolve(mixRoot, "looks");
    if (fs.existsSync(looks)) for (const name of fs.readdirSync(looks)) if (name.endsWith(".md")) files.push(resolve(looks, name));
    for (const file of files) {
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, "utf8");
      add(text.split("\n").filter((line) => line.startsWith("|")).join("\n"));
      add([...text.matchAll(/`([^`\n]+)`/gu)].map((match) => match[1]).join("\n"));
    }
    // The Identity Reference template of image-brief.md §5 (얼굴형, 이목구비), which a reference-role line may repeat; not the examples.
    const brief = resolve(mixRoot, "image-brief.md");
    if (fs.existsSync(brief)) add(fs.readFileSync(brief, "utf8").split("\n## 5. ")[1]?.match(/```\w*\n([\s\S]*?)```/u)?.[1] ?? "");
    // fixed-lines.md §문장 속 낱말: the Korean and Japanese expression phrases an Expression sentence bends, and the two photo-term columns.
    // The Finish table says which column a prompt uses: its KR and CN tokens mean the KR·CN column, its JP tokens the JP column.
    const phrases = [];
    const jpPhrases = [];
    const photo = { KRCN: new Set(), JP: new Set() };
    const finish = new Map();
    if (fs.existsSync(fixedLines)) {
      const text = fs.readFileSync(fixedLines, "utf8");
      const rows = (title) => (text.split(`\n${title}`)[1]?.split("\n\n")[1] ?? "").split("\n").slice(2).map((row) => row.split("|").map((cell) => cell.trim()));
      for (const cells of rows("표정 구절")) {
        if (/\p{sc=Hangul}/u.test(cells[2] ?? "")) phrases.push({ stems: cells[2].split(/\s+/u).map(stemKey), words: cells[2].split(/\s+/u).length });
        if (cells[3]?.length >= 5) jpPhrases.push(cells[3].slice(0, -2));
      }
      for (const cells of rows("사진 용어")) {
        if (cells[2]) photo.KRCN.add(mixKey(cells[2]));
        if (cells[3]) photo.JP.add(mixKey(cells[3]));
      }
      for (const line of (text.split("\n## Finish")[1] ?? "").split("\n")) {
        const cells = line.split("|").map((cell) => cell.trim());
        const group = /^(?:KR|CN)$/u.test(cells[1] ?? "") ? "KRCN" : cells[1] === "JP" ? "JP" : /^(?:US|FR)/u.test(cells[1] ?? "") ? "LATIN" : null;
        if (group) for (const token of cells.slice(2).join(" ").match(/`[^`]+`/gu) ?? []) finish.set(mixKey(token.slice(1, -1)), group);
      }
    }
    mixKnown = { known, rowsByToken, rowsByName, phrases, jpPhrases, photo, finish, owners };
  } catch {
    mixKnown = null;
  }
  return mixKnown;
}

// A Korean word's stem for matching a bent phrase: the particle or verb ending cut and the last syllable's final consonant dropped,
// so 눈꺼풀이 matches 눈꺼풀은, 나른하다 matches 나른한 and 차갑다 matches 차가운 (compared as decomposed jamo).
function stemKey(word) {
  const stem = /(?:하다|한다|진다|간다)$/u.test(word) ? word.slice(0, -2) : /다$/u.test(word) ? word.slice(0, -1) : word.replace(/(?:이|가|은|는)$/u, "");
  return stem.normalize("NFD").replace(/[\u11a8-\u11c2]$/u, "");
}

// An Expression chunk: a spaced Korean phrase carries every word of one or more table phrases, with three scene words at most beside them;
// a single word or a Chinese or Japanese chunk is listed, or bends a table word (two syllables or more) or a Japanese table phrase's ending.
function expressionListed(chunk, sources, heads) {
  if (!/\p{sc=Hangul}/u.test(chunk)) return isListed(chunk, sources.known, heads) || sources.jpPhrases.some((prefix) => chunk.startsWith(prefix));
  const words = chunk.split(/\s+/u).map((word) => word.normalize("NFD"));
  const found = sources.phrases.filter((phrase) => phrase.stems.every((stem) => words.some((word) => word.startsWith(stem))));
  if (words.length > 1) return found.length > 0 && words.length <= found.reduce((sum, phrase) => sum + phrase.words, 0) + 3;
  return isListed(chunk, sources.known, heads) || sources.phrases.some((phrase) => phrase.stems.some((stem) => stem.length >= 4 && words[0].startsWith(stem)));
}

function isListed(chunk, known, heads) {
  const key = mixKey(chunk);
  if (known.has(key) || heads.some((head) => head.includes(key))) return true;
  // A Korean particle on a listed word (마당은, 창살이) is still that word.
  return /^\p{sc=Hangul}+$/u.test(key) && KOREAN_PARTICLES.some((tail) => key.endsWith(tail) && known.has(key.slice(0, -tail.length)));
}

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
function aliasPattern(alias) {
  const body = escapeRegExp(alias);
  if (/\p{sc=Hangul}/u.test(alias)) return new RegExp(`(?<!\\p{sc=Hangul})${body}(?!\\p{sc=Hangul})`, "u");
  if (NATIVE_CHAR.test(alias)) return new RegExp(body, "u");
  return new RegExp(`(?<![\\p{L}\\p{N}])${body}(?![\\p{L}\\p{N}])`, "iu");
}

// Exact copy in quotes (a sign that reads "営業中") is the user's or the photo's text (image-brief.md §6, §12.4), not mixed-in words.
const unquote = (text) => text.replace(/"[^"\n]*"|“[^”\n]*”|「[^」\n]*」|『[^』\n]*』/gu, '""');
// A prompt that never writes a Finish layer: the machine contract ceiling (image-brief.md §1) or a drawn, painted or 3D medium in the first line.
const CONTRACT_LIMIT = 2000;
const NOT_PHOTO = /\b(?:illustration|illustrated|anime|manga|cartoon|3d|render(?:ed)?|painting|watercolou?r|drawing|sketch|vector|cgi)\b/iu;
const CUE_GROUP = (text) => { const found = ASIAN_SCENE.exec(text)?.[0]; return found ? (/japan|tokyo|osaka|kyoto|shibuya|shinjuku/iu.test(found) ? "JP" : "KRCN") : null; };

// The culture's column (KRCN or JP) of a prompt with no Finish tokens: the language most of its original-language chunks are in, the line heads and the sentence words together
// (a lexicon row of one culture counts for that culture, otherwise Hangul or Han counts KRCN and kana JP); a lead of fewer than three (one Japanese jacket name in a Paris scene) falls to the place cues of the first line and Scene, and no cue leaves it unread.
function proseCulture(lines, first, scene, sources) {
  const votes = { KRCN: 0, JP: 0 };
  for (const item of lines.filter((entry) => entry.section !== "Finish")) {
    for (const chunk of [...chunksOf(item.head), ...item.chunks]) {
      const cultures = new Set((sources.rowsByToken.get(mixKey(chunk)) ?? []).flatMap((row) => row.culture).filter((culture) => /^(?:KR|CN|JP)$/u.test(culture)));
      const group = !cultures.size ? null : cultures.has("JP") ? (cultures.size === 1 ? "JP" : null) : "KRCN";
      votes[group ?? (/[\p{sc=Hiragana}\p{sc=Katakana}]/u.test(chunk) ? "JP" : "KRCN")]++;
    }
  }
  if (Math.abs(votes.KRCN - votes.JP) >= 3) return votes.KRCN > votes.JP ? "KRCN" : "JP";
  return CUE_GROUP(`${first} ${scene}`);
}

// A 부분 row's owner (한복, 고궁) called at a line head or in the first line, but none of its parts named in the original language anywhere in the prompt: the parts were written out in English.
// The clothes' parts are read only when the prompt has an Outfit layer, so a face close-up that shows no sleeve or ribbon is not asked for one (image-brief.md §2.1).
function inspectParts(result, sections, lines, first, instruction, sources) {
  const text = mixKey(unquote(instruction));
  let shown = 0;
  for (const [row, { slug, parts, others }] of sources.owners) {
    if (shown >= 2 || !sections.some((section) => section.name === (slug === "outfit" ? "Outfit" : "Scene"))) continue;
    const names = [row.token, ...row.aliases].filter((name) => (NATIVE_CHAR.test(name) ? mixKey(name).length >= 2 : name.length >= 6));
    const called = names.some((name) => lines.some((item) => item.section !== "Finish" && mixKey(item.head).includes(mixKey(name))) || aliasPattern(name).test(first));
    if (!called || [...parts, ...others].some((part) => part.names.some((name) => text.includes(mixKey(name))))) continue;
    shown++;
    emit(result, CODE_REGISTRY.mixThin, `The prompt barely mixes languages: ${row.token} is called, but none of its part names is written in the original language (${[...parts, ...others].slice(0, 6).map((part) => part.token).join(" | ")}).`, { hint: "Call the parts the frame shows by these names inside the English sentence (find_tokens prints them under 문장 속 낱말) instead of describing them in English; leave out a part the frame does not show (image-brief.md §2.1)." });
  }
}

function inspectMix(result, instruction) {
  const sections = layerSections(instruction).filter((section) => section.name === null || /^[A-Za-z]/u.test(section.name));
  const lines = sections.filter((section) => section.name && section.name !== "Identity Reference")
    .flatMap((section) => section.lines.flatMap((line) => {
      const match = LAYER_LINE.exec(line);
      return match ? [{ section: section.name, head: match[1].trim(), sentence: unquote(match[2]), line }] : [];
    }));
  if (!lines.length) return;
  const count = (text, pattern) => (text.match(pattern) ?? []).length;
  const crowded = [];
  const frameless = [];
  let total = 0;
  // Line-head tokens are not counted: only the original-language chunks inside the sentences (image-brief.md §2.1 rule 4).
  for (const item of lines) {
    item.chunks = chunksOf(item.sentence);
    total += item.chunks.length;
    // A spaced phrase of three or more words goes only in Expression and Style, one a line.
    const phrases = item.chunks.filter((chunk) => chunk.split(/\s+/u).length >= 3).length;
    if (item.chunks.length >= 4 || phrases > (/^(?:Expression|Style)$/u.test(item.section) ? 1 : 0)) crowded.push(item);
    const native = count(item.sentence, /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Hangul}]/gu);
    if (native >= 6 && native > count(item.sentence, /[A-Za-z]/gu)) frameless.push(item);
  }
  const shown = (items) => items.slice(0, 3).map((item) => item.head).join(" | ");
  if (crowded.length || frameless.length) {
    const found = [...new Set([...crowded, ...frameless])];
    emit(result, CODE_REGISTRY.mixLine, `${found.length} layer line(s) mix too much original language: ${shown(found)}`, { hint: "Keep the sentence English and use original-language words only where §2 puts them: at most three a line, with an English frame around them, and a spaced phrase only in Expression and Style, one a line." });
  }
  if (lines.length >= 8 && total > 1.5 * lines.length) {
    emit(result, CODE_REGISTRY.mixAmount, `${total} original-language chunks in ${lines.length} layer lines (more than 1.5 per line).`, { hint: "Turn the photo-term and texture words back into English first (image-brief.md §2 rule 4)." });
  }
  const sources = mixSources();
  if (!sources) return;
  const heads = lines.map((item) => mixKey(item.head));
  const first = unquote(sections.find((section) => section.name === null)?.lines.join(" ") ?? "");
  const long = (chunk) => chunk.split(/\s+/u).length >= 3;
  // Expression sentences bend the table phrases (particles, endings, a few scene words), so they are read against the phrases themselves.
  const offTable = lines.filter((item) => item.section === "Expression").flatMap((item) => item.chunks)
    .filter((chunk) => !expressionListed(chunk, sources, heads));
  const unlisted = [
    // Line heads are not read: a head may be an original-language name the writer is sure of even without a lexicon row (image-brief.md §2.1 rule 1).
    ...lines.flatMap((item) => (item.section === "Expression" ? [] : item.chunks)),
    ...chunksOf(first),
  ].filter((chunk) => !isListed(chunk, sources.known, heads));
  // Other long phrases are the one Style phrase a line allows, or already a mix/line warning.
  const missing = [...new Set([...unlisted.filter((chunk) => !long(chunk)), ...offTable])];
  if (missing.length) {
    emit(result, CODE_REGISTRY.mixUnlisted, `${missing.length} original-language word(s) not in the lexicon, a look card or fixed-lines.md: ${missing.slice(0, 5).join(" | ")}`, { evidence: missing.slice(0, 5), hint: "Take original-language words only from the lexicon, a look card or fixed-lines.md, or the user's own words; write anything else in English (image-brief.md §2)." });
  }
  // What the one-name check reads: layer sentences and the scene part of the first line. Layer headings, the Identity paragraph (a fixed formula), the first line's medium or look-card
  // phrase (up to its first colon, comma or " of ") and the Finish closer that calls that medium again name no thing in the scene (image-brief.md §1, fixed-lines.md Finish).
  const opener = /:|,\s| of /u.exec(first);
  const named = [{ line: null, text: opener ? first.slice(opener.index) : first }, ...sections.filter((section) => section.name && section.name !== "Identity Reference")
    .flatMap((section) => section.lines.map((line) => ({ line, text: unquote(LAYER_LINE.exec(line)?.[2] ?? line) })))
    .filter((entry) => !/^The whole frame reads as\b/u.test(entry.text))];
  const renamed = [];
  for (const item of lines) {
    const rows = sources.rowsByToken.get(mixKey(item.head)) ?? [];
    if (!rows.length) continue;
    const outside = named.filter((entry) => entry.line !== item.line).map((entry) => entry.text).join("\n");
    const own = mixKey(item.head);
    for (const alias of new Set(rows.flatMap((row) => row.aliases))) {
      const key = mixKey(alias);
      const latin = !NATIVE_CHAR.test(alias);
      if (key.length < 2 || (latin && alias.split(/\s+/u).length < 2 && alias.length < 7) || own.includes(key) || key.includes(own)) continue;
      if (aliasPattern(alias).test(outside)) renamed.push(`${item.head} / ${alias}`);
    }
  }
  if (renamed.length) {
    emit(result, CODE_REGISTRY.mixRenamed, `One thing is called by two names: ${[...new Set(renamed)].slice(0, 3).join(" | ")}`, { hint: "Call a thing the same way from the first line to Finish: use the line-head token again, or the English name only if the thing has no row (image-brief.md §2 rule 3)." });
  }
  inspectParts(result, sections, lines, first, instruction, sources);
  // One photo-term column a prompt: the Finish tokens name the culture row (KR, CN or 단서 없음 the KR·CN column, JP the JP column); US·FR tokens, nothing is read.
  // No Finish tokens at all (no Finish layer, or slot-name heads) and not a drawn or 3D medium: the language of the line heads and sentence words names the column instead (proseCulture), so the checks below still run.
  const groups = new Set(lines.filter((item) => item.section === "Finish").map((item) => sources.finish.get(mixKey(item.head))).filter(Boolean));
  const finishLines = lines.filter((item) => item.section === "Finish");
  const person = sections.some((section) => section.name === "Identity Reference");
  const own = groups.size ? (groups.size === 1 && !groups.has("LATIN") ? [...groups][0] : null)
    : NOT_PHOTO.test(first) ? null : proseCulture(lines, first, sections.filter((section) => section.name === "Scene").flatMap((section) => section.lines).join(" "), sources);
  // Finish heads that are slot names (closer, realism, anti-cg) instead of the culture row's tokens: the prompt was written without the fixed-lines.md rows at all.
  if (person && finishLines.length && !groups.size) {
    emit(result, CODE_REGISTRY.mixThin, `The prompt barely mixes languages: the Finish line heads (${finishLines.slice(0, 3).map((item) => item.head).join(" | ")}) are not the culture row's tokens.`, { hint: "Pick the culture row in fixed-lines.md §문화권 고르기 (no cue: the KR row) and use its Finish tokens, Identity paragraph and §문장 속 낱말 column; name what is in the frame with lexicon tokens at the line heads (image-brief.md §2.1)." });
  }
  // image-brief.md §3: a photo always ends in Finish; only a machine contract (2,000 characters, so the layers are trimmed, §1) or a drawn or 3D medium leaves it out.
  const photo = sections.some((section) => /^(?:Optics|Camera)$/u.test(section.name ?? "")) && !NOT_PHOTO.test(first);
  if (person && photo && !sections.some((section) => section.name === "Finish") && result.surface !== "s1" && result.length.codepoints > CONTRACT_LIMIT) {
    emit(result, CODE_REGISTRY.mixThin, "A person photo prompt has no Finish layer, so its closer, realism and anti-cg line heads (the culture row's tokens) are missing.", { hint: "End with ## Finish: the three lines of the scene's culture row in fixed-lines.md ## Finish, unless the contract limit or a drawn or 3D medium leaves it out (image-brief.md §3)." });
  }
  if (own) {
    const other = own === "JP" ? "KRCN" : "JP";
    const wrong = lines.flatMap((item) => item.chunks).filter((chunk) => sources.photo[other].has(mixKey(chunk)) && !sources.photo[own].has(mixKey(chunk)));
    if (wrong.length) emit(result, CODE_REGISTRY.mixCulture, `Photo terms from the ${other === "JP" ? "JP" : "KR·CN"} column in a ${own === "JP" ? "JP" : "KR·CN"} prompt: ${[...new Set(wrong)].slice(0, 5).join(" | ")}`, { hint: "Take the photo terms from the column of the scene's culture in fixed-lines.md §문장 속 낱말 (the one its Finish tokens come from), or write them in English." });
    // French tokens belong to French scenes only (image-brief.md §2.1): a line head whose every lexicon row is FR does not go in a KR, CN or JP prompt.
    const french = lines.filter((item) => item.section !== "Finish").map((item) => item.head)
      .filter((head) => { const rows = sources.rowsByToken.get(mixKey(head)) ?? []; return rows.length && rows.every((row) => row.culture.length === 1 && row.culture[0] === "FR"); });
    if (french.length) emit(result, CODE_REGISTRY.mixCulture, `French tokens in a ${own === "JP" ? "JP" : "KR·CN"} prompt: ${[...new Set(french)].slice(0, 5).join(" | ")}`, { hint: "French tokens go only in a French scene. Search the scene's own culture first (find_tokens --culture KR, or JP, CN) and write the head in English when it has no row." });
    // A head whose every row belongs to the other side of KR·CN and JP (西日 in a Korean palace, 旗袍 in a Tokyo street) is another culture's word too.
    const asian = new Set(["KR", "CN", "JP"]);
    const aside = lines.filter((item) => item.section !== "Finish").map((item) => item.head).filter((head) => {
      const rows = sources.rowsByToken.get(mixKey(head)) ?? [];
      return rows.length && rows.every((row) => { const cultures = row.culture.filter((culture) => asian.has(culture)); return cultures.length && (own === "JP" ? !cultures.includes("JP") : cultures.every((culture) => culture === "JP")); });
    });
    if (aside.length) emit(result, CODE_REGISTRY.mixCulture, `${other === "JP" ? "JP" : "KR·CN"} tokens in a ${own === "JP" ? "JP" : "KR·CN"} prompt: ${[...new Set(aside)].slice(0, 5).join(" | ")}`, { hint: "Search the scene's own culture first (find_tokens --culture KR, or JP, CN) and write the head in English when it has no row." });
    // The mix is the point of the prompt (image-brief.md §2.1): with or without a look card, most line heads are lexicon tokens and the Optics, Camera and Expression sentences carry table words.
    const body = lines.filter((item) => item.section !== "Finish");
    const nativeHeads = body.filter((item) => NATIVE_CHAR.test(item.head)).length;
    const inSection = (pattern) => body.filter((item) => pattern.test(item.section));
    const optics = inSection(/^(?:Optics|Camera)$/u);
    const expression = inSection(/^Expression$/u);
    const thin = [];
    if (body.length >= 8 && nativeHeads * 3 < body.length) thin.push(`${nativeHeads} of ${body.length} line heads are original-language tokens`);
    if (optics.length && !optics.some((item) => item.chunks.some((chunk) => sources.photo[own].has(mixKey(chunk))) || sources.photo[own].has(mixKey(item.head)))) thin.push("no photo term in Optics or Camera");
    if (expression.length && !expression.some((item) => item.chunks.length || NATIVE_CHAR.test(item.head))) thin.push("no expression word in Expression");
    if (person && thin.length) emit(result, CODE_REGISTRY.mixThin, `The prompt barely mixes languages: ${thin.join("; ")}.`, { hint: "Name what is in the frame at the line heads in the scene's language: the lexicon token when find_tokens has a row, and without a row the everyday name people there use (린넨 팬츠, 선글라스, 카디건 / マウンテンパーカー, デニムスカート). Put photo terms from the scene's column of fixed-lines.md §문장 속 낱말 into the Optics and Camera sentences, and an expression word into Expression (image-brief.md §2.1)." });
  }
}

// engine-levers.md §3 keeps original-language names inside the English sentences of these engines' paragraphs (Nano Banana's cell limits them, so it is not read).
// A one-paragraph prompt has no line heads to count, so only the original-language words in the text are: a person in a KR, CN or JP scene with fewer than three is the flattening this rule exists to stop.
const MIX_ENGINES = new Set(["seedream", "midjourney", "soul"]);
const PERSON_WORD = /\b(?:woman|man|girl|boy|she|he|her|his)\b/iu;
// Only a person's culture ("Korean woman") or a KR, CN, JP place counts; a bare adjective ("Japanese selvedge denim" in Paris) does not.
const ASIAN_SCENE = /\b(?:(?:korean|chinese|japanese)\s+(?:\w+\s+){0,2}?(?:woman|women|man|men|girl|boy|lady|model|student|person)|korea|seoul|busan|china|hong kong|kowloon|shanghai|beijing|taipei|japan|tokyo|osaka|kyoto|shibuya|shinjuku|chungking|wong kar-wai)\b/iu;
function inspectEngineMix(result, instruction) {
  if (!MIX_ENGINES.has(result.engine) || !PERSON_WORD.test(instruction) || !ASIAN_SCENE.test(instruction)) return;
  const chunks = chunksOf(unquote(instruction));
  if (chunks.length >= 3) return;
  emit(result, CODE_REGISTRY.mixThin, `The prompt barely mixes languages: ${chunks.length} original-language word(s) in a ${result.engine} person photo prompt (fewer than three).`, { hint: "Keep the English sentence frame and leave the names, expression words, photo terms and texture or light words in their original language instead of translating them (engine-levers.md §3, image-brief.md §2.1)." });
}

// engine-levers.md §3 ("펴는 것은 모양이지 원어가 아니다") and §4 step 3: the flattened prompt keeps the original-language names of the layer prompt it was made from.
// --source gives that layer prompt. Its line-head tokens and its sentence words in Han, kana or Hangul must still be in the checked prompt (the Identity and Finish layers are left out: the engine's
// own cells replace their wording). A name that is gone, or whose row's other alias is written instead (文庫本 became paperback), is the flattening this rule exists to stop.
// Midjourney and Soul cut each layer to one phrase, so only line heads are read there and a layer counts as dropped only when none of its names is left. Nano Banana's cell lets its prompt gloss original-language words, so it is not read (scope.unchecked says so).
// A sentence cut for length leaves its names out too: the hint says so, and the finding is a warning.
const DROPPED_ENGINES = new Set(["seedream", "midjourney", "soul"]);
const KEPT_STEM = 4;
function sourceNames(sourceText, headsOnly) {
  const names = new Map();
  let layer = null;
  const add = (text) => {
    const key = mixKey(text);
    if (key && !names.has(key)) names.set(key, { text: text.trim(), layer });
  };
  for (const section of layerSections(unquote(sourceText))) {
    if (section.name !== null && (!/^[A-Za-z]/u.test(section.name) || /^(?:Finish|Identity Reference)$/u.test(section.name))) continue;
    layer = section.name;
    for (const line of section.lines) {
      const match = section.name === null ? null : LAYER_LINE.exec(line);
      if (match && NATIVE_CHAR.test(match[1])) add(match[1]);
      if (!headsOnly) for (const chunk of chunksOf(match ? match[2] : line)) add(chunk);
    }
  }
  return names;
}
// A Hangul word's stem in the target ("마당이" for 마당은); a spaced phrase counts when half of its words are there (a bent expression phrase).
function nameKept(name, targetKey, targetJamo) {
  if (targetKey.includes(mixKey(name))) return true;
  if (!/\p{sc=Hangul}/u.test(name)) return false;
  const words = name.split(/\s+/u);
  const found = words.filter((word) => { const stem = stemKey(word); return stem.length >= KEPT_STEM && targetJamo.includes(stem); }).length;
  return found > 0 && found * 2 >= words.length;
}
function inspectDropped(result, instruction, sourceText) {
  if (result.engine === "nano-banana") result.scope.unchecked.push("source_original_language_names");
  if (!DROPPED_ENGINES.has(result.engine)) return;
  const names = sourceNames(sourceText, result.engine !== "seedream");
  if (!names.size) return;
  const sources = mixSources();
  const target = unquote(instruction);
  const targetKey = mixKey(target);
  const targetJamo = target.normalize("NFD");
  const missing = [];
  const renamed = [];
  for (const [key, { text }] of names) {
    if (nameKept(text, targetKey, targetJamo)) continue;
    missing.push(text);
    const other = [...new Set((sources?.rowsByName.get(key) ?? []).flatMap((row) => [row.token, ...row.aliases]))]
      .filter((alias) => mixKey(alias) !== key && !mixKey(alias).includes(key) && !key.includes(mixKey(alias)) && mixKey(alias).length >= 2 && (NATIVE_CHAR.test(alias) || alias.split(/\s+/u).length >= 2 || alias.length >= 7))
      .find((alias) => aliasPattern(alias).test(target));
    if (other) renamed.push(`${text} → ${other}`);
  }
  if (!missing.length) return;
  const note = renamed.length ? ` (written under another name: ${renamed.slice(0, 3).join(" | ")})` : "";
  if (result.engine === "seedream") {
    evidence(result, CODE_REGISTRY.mixDropped, missing,
      `${missing.length} of ${names.size} original-language names of the layer prompt are not in this seedream prompt${note}`,
      "Flattening drops the line heads and the layer headings, not the names: call the thing by its original-language name inside the English sentence (engine-levers.md §3). A name left out only because a second sentence was cut for length can stay out.");
    return;
  }
  const byLayer = new Map();
  for (const { text, layer } of names.values()) byLayer.set(layer, [...(byLayer.get(layer) ?? []), text]);
  const lost = [...byLayer].filter(([, texts]) => texts.every((text) => missing.includes(text)));
  if (!lost.length) return;
  evidence(result, CODE_REGISTRY.mixDropped, lost.flatMap(([, texts]) => texts.slice(0, 1)),
    `${lost.length} of ${byLayer.size} layers of the layer prompt keep none of their original-language names in this ${result.engine} prompt${note}`,
    "This engine cuts each layer to one phrase, so keeping one name of a layer in its phrase is enough: use the original-language name there, not an English word for it (engine-levers.md §3).");
}

// engine-levers.md §5: the cells that say "do not write this" for one engine. Text matching only.
const LAYER_ENGINES = new Set(["seedream", "nano-banana", "soul", "midjourney"]);
function inspectEngine(result, instruction) {
  const engine = result.engine;
  if (!LAYER_ENGINES.has(engine)) return;
  const hint = "engine-levers.md §4 flattens a GPT Image layer prompt into this engine's form.";
  const headings = instruction.split(/\r?\n/u).filter((line) => /^##\s+\S/u.test(line));
  if (headings.length >= 2) emit(result, CODE_REGISTRY.engineLayers, `${headings.length} layer headings (## …) in a ${engine} prompt.`, { hint });
  if (engine !== "midjourney") {
    const flags = snippets(/(?<![\p{L}\p{N}_-])--(?:ar|no|oref|ow|sref|style|raw|stylize|q|v)(?![\p{L}\p{N}_-])|\bAR\s+\d{1,2}:\d{1,2}\b/giu, instruction);
    if (flags.length) emit(result, CODE_REGISTRY.engineFlag, `${engine} takes this as a call setting, not body text: ${[...new Set(flags)].slice(0, 3).join(" | ")}`, { hint: "Move it to the call setting and name it outside the prompt block." });
  }
  if (engine !== "seedream") {
    // A Midjourney exclusion lives in the --no flag, so only the body is scanned.
    const body = engine === "midjourney" ? instruction.replace(/--no\s[^\n]*?(?=\s--[a-z]|$)/gimu, " ") : instruction;
    const ban = snippets(/\b(?:never|not|no)\s+(?:an?\s+)?(?:illustration|anime|cartoon|3d\s+render|cgi)\b/giu, body);
    if (ban.length) {
      const where = engine === "midjourney" ? "Put it in --no illustration, anime, cgi." : "State the medium instead: a real photograph.";
      emit(result, CODE_REGISTRY.engineBan, `${engine}: spoken ban on illustration or CGI (${[...new Set(ban)].slice(0, 2).join(" | ")}).`, { hint: where });
    }
  }
  if (engine === "soul") {
    const brands = snippets(/\b(?:kodak|portra|ektachrome|ektar|fujifilm|fuji\s+(?:superia|velvia|provia|pro)|cinestill|vision3|ilford|tri-x)\b/giu, instruction);
    if (brands.length) emit(result, CODE_REGISTRY.engineBrand, `Soul: film brand in the prompt (${[...new Set(brands.map((name) => name.toLowerCase()))].slice(0, 3).join(" | ")}).`, { hint: "Say the color response instead: fine grain, softly lifted blacks (soul-v2-director.md, real-run rule 3)." });
  }
}

function inspectSkinRepeat(result, instruction) {
  const skinTexture = /\b(?:skin[ -](?:texture|detail|pores?|grain)|fine skin detail|(?:visible|natural|open)\s+pores|pores?\s+(?:vary|visible|remain)|vellus\s+hair|(?:naturally\s+)?textured\s+skin|skin\s+remains\s+(?:naturally\s+)?textured|airbrushed)\b|피부\s*(?:결|질감|모공)|모공|잔털/iu;
  const blocks = instruction.split(/\r?\n(?=[A-Z][A-Z0-9 &/,'’-]{1,40}:|\s*\r?\n)/u).map((block) => block.trim()).filter(Boolean);
  const hits = blocks.filter((block) => skinTexture.test(block));
  if (hits.length >= 2) emit(result, CODE_REGISTRY.skinRepeat, `Skin surface texture appears in ${hits.length} separate sections.`, { hint: "Check whether these sections repeat the same condition or describe distinct areas. Preserve requested texture, color, area, degree and partial-edit scope; consolidate only redundant wording without forcing a heading." });
}

function inspectPortrait(result, instruction) {
  evidence(result, CODE_REGISTRY.skinToken,
    snippets(/\bmicro[ -]?(?:skin(?:[ -]?texture)?|pores?|texture)\b|\b(?:realistic[ -]?)?skin(?:[ -]?texture)?[ -]?ai\b|마이크로\s*(?:피부\s*)?(?:질감|피부결)|(?:사실적(?:인)?\s*)?피부(?:\s*(?:질감|결))?\s*AI/giu, instruction),
    "Skin vocabulary to review, not proof of a defect", "Confirm the intended area and texture. Preserve requested texture, color and partial-edit scope; clarify only ambiguity, without automatically adding pores or fine facial hair.");
  evidence(result, CODE_REGISTRY.skinColor,
    snippets(/\byellow(?:ish)?(?:[ -]+undertone)?[ -]+skin\b|(?:노란|누런|황색)\s*피부/giu, instruction),
    "Skin color wording to review, not evidence of nationality inference", "Check whether the color is user-specified, observed or inferred from nationality. Preserve requested character color, area, texture and partial-edit scope; correct only unsupported inference, not the color word alone.");
  const shine = [
    /\bdewy\b/iu, /\bluminous\s+skin\b/iu, /\bglass\s+skin\b/iu,
    /\bsubsurface\s+(?:glow|sheen|scatter)\b/iu, /\bwet[ -]look\b/iu,
    /\bhigh[ -]shine\b/iu, /\bglossy\s+skin\b/iu, /\bglistening\s+skin\b/iu,
  ].filter((pattern) => pattern.test(instruction));
  const matte = /\b(?:(?:semi|soft)[ -])?matte\b|무광|매트|반무광|\b(?:restrained|controlled)\s+sheen\b/iu;
  if (shine.length >= 4 && !matte.test(instruction)) emit(result, CODE_REGISTRY.glow, `${shine.length} distinct shine terms trigger a review heuristic, not a prediction of image failure.`, { hint: "Check whether finishes conflict on the same area. Preserve requested sheen, color, texture and partial-edit scope; do not automatically add matte regions or remove gloss terms." });
}

export function checkText(input, options = {}) {
  const result = textResult(options);
  const text = input.startsWith("\uFEFF") ? input.slice(1) : input;
  measure(text, result, options);
  const views = copyViews(text);
  const { quotes } = views;
  const instruction = withoutFinishEightK(views.instruction);
  const structured = result.profile === "native" && structuredBody(text);
  if (isEmpty(text, quotes) && !structured) {
    emit(result, CODE_REGISTRY.empty, "The prompt has no depictable content or nonempty quoted copy.");
    return result;
  }
  const words = text.trim().split(/\s+/u).length;
  if (result.engine === "seedream" && words >= 600) {
    emit(result, CODE_REGISTRY.engineWords, `Seedream: ${words} words; the published guidance is under 600 English words (surfaces.md §0-1).`);
  }
  if (options.sourceText !== undefined) inspectDropped(result, instruction, options.sourceText);
  if (result.profile === "native" && result.engine !== "gpt-image") {
    // Other engines run inspectCoherence (which calls inspectEngine for the engine-levers.md §5 "do not write" cells) and inspectEngineMix; the GPT Image layer, copy and syntax checks are skipped, and the engine's own syntax is outside this checker.
    inspectCoherence(result, text, instruction);
    inspectEngineMix(result, instruction);
    return result;
  }
  if (result.profile === "assembled" && result.engine === "midjourney") {
    emit(result, CODE_REGISTRY.engineScope, `단어 수: ${words}. This checker does not judge Midjourney syntax; channel and machine-contract character limits still apply. See surfaces.md §0-1.`);
    inspectCoherence(result, text, instruction);
    return result;
  }
  if (structured) {
    emit(result, CODE_REGISTRY.structured, "A structured request body is not a natural-language image prompt.");
    return result;
  }
  inspectCopy(result, quotes, instruction);
  inspectSyntax(result, instruction);
  inspectPhrasing(result, instruction);
  inspectNoise(result, instruction);
  inspectSkinRepeat(result, instruction);
  inspectCoherence(result, text, instruction);
  if (result.engine === "gpt-image") inspectMix(result, instruction);
  if (result.profile === "assembled") inspectPortrait(result, instruction);
  return result;
}

export function checkManifest(input, options = {}) {
  const profile = options.profile ?? "native";
  const result = { ok: true, mode: "manifest", profile, scope: scope(), errors: [], warnings: [], rows: [], summary: { total: 0, passed: 0, failed: 0 } };
  const ids = new Set();
  const lines = input.split(/\r?\n/u);
  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].trim()) continue;
    const row = { line: index + 1, id: null, ok: true, length: null, errors: [], warnings: [], profile };
    result.rows.push(row);
    let record;
    try {
      record = JSON.parse(lines[index]);
    } catch {
      emit(row, CODE_REGISTRY.parse, `Invalid JSON on line ${row.line}.`);
      continue;
    }
    if (record === null || typeof record !== "object" || Array.isArray(record)) {
      emit(row, CODE_REGISTRY.notObject, `Line ${row.line} must contain an object.`);
      continue;
    }
    row.id = typeof record.id === "string" ? record.id.trim() : null;
    if (!row.id) emit(row, CODE_REGISTRY.missingField, `Line ${row.line} needs a nonblank string field: id.`);
    const field = Object.hasOwn(record, "prompt") ? "prompt" : "full_prompt";
    if (typeof record[field] !== "string" || !record[field].trim()) emit(row, CODE_REGISTRY.missingField, `Line ${row.line} needs a nonblank string field: ${field}.`);
    if (row.id) {
      if (ids.has(row.id)) emit(row, CODE_REGISTRY.duplicateId, `Duplicate id on line ${row.line}: ${row.id}`);
      ids.add(row.id);
    }
    if (!row.ok) continue;
    const checked = checkText(record[field], { ...options, manifest: true });
    Object.assign(row, { ok: checked.ok, length: checked.length, errors: checked.errors, warnings: checked.warnings });
  }
  for (const row of result.rows) delete row.profile;
  if (!result.rows.length) emit(result, CODE_REGISTRY.manifestEmpty, "The manifest has no nonblank rows.");
  result.summary.total = result.rows.length;
  result.summary.passed = result.rows.filter((row) => row.ok).length;
  result.summary.failed = result.summary.total - result.summary.passed;
  result.ok = result.errors.length === 0 && result.summary.total > 0 && result.summary.failed === 0;
  return result;
}

async function fileText(path) {
  if (!(await stat(path)).isFile()) throw new Error("Input is not a regular file.");
  return readFile(path, "utf8");
}

async function execute(args) {
  const { options, errors } = parseFlags(args);
  if (errors.length) return { ...textResult(options), ok: false, errors };
  let input;
  try {
    if (options.manifest !== undefined || options.input !== undefined) {
      input = await fileText(options.manifest ?? options.input);
    } else {
      const chunks = [];
      for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
      input = Buffer.concat(chunks).toString("utf8");
    }
  } catch (error) {
    const result = options.manifest !== undefined
      ? { ok: false, mode: "manifest", profile: options.profile, scope: scope(), errors: [], warnings: [], rows: [], summary: { total: 0, passed: 0, failed: 0 } }
      : textResult(options);
    emit(result, CODE_REGISTRY.unreadable, `Cannot read input: ${error.message}`);
    return result;
  }
  if (options.source !== undefined) {
    try {
      options.sourceText = await fileText(options.source);
    } catch (error) {
      const result = textResult(options);
      emit(result, CODE_REGISTRY.unreadable, `Cannot read the source layer prompt: ${error.message}`);
      return result;
    }
  }
  return options.manifest !== undefined ? checkManifest(input, options) : checkText(input, options);
}

function codeSet(result, kind) {
  return new Set([...(result[kind] ?? []), ...(result.rows ?? []).flatMap((row) => row[kind])].map((item) => item.code));
}

function compare(result, expect) {
  const actualErrors = codeSet(result, "errors");
  const actualWarnings = codeSet(result, "warnings");
  const declaredErrors = new Set(expect.errors ?? []);
  const missingErrors = [...declaredErrors].filter((code) => !actualErrors.has(code));
  const extraErrors = [...actualErrors].filter((code) => !declaredErrors.has(code));
  const missingWarnings = (expect.warnings_include ?? []).filter((code) => !actualWarnings.has(code));
  const forbiddenWarnings = (expect.warnings_exclude ?? []).filter((code) => actualWarnings.has(code));
  const ok = result.ok === expect.ok && [missingErrors, extraErrors, missingWarnings, forbiddenWarnings].every((items) => items.length === 0);
  return { ok, missingErrors, extraErrors, missingWarnings, forbiddenWarnings };
}

async function fixtureFiles(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await fixtureFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

export async function runHarness(casesPath = process.env.MPW_PROMPT_CHECK_CASES ?? defaultCases, writeLine = console.log) {
  let harnessFailed = false;
  const fail = (code, message) => {
    harnessFailed = true;
    writeLine(`${code}: ${message}`);
  };
  const first = CODE_REGISTRY.flag.code;
  const second = CODE_REGISTRY.empty.code;
  const fake = { ok: false, errors: [{ code: first }, { code: second }], warnings: [] };
  if (compare(fake, { ok: false, errors: [first] }).ok ||
      compare({ ...fake, errors: [{ code: first }] }, { ok: false, errors: [first, second] }).ok) {
    fail(HARNESS_CODES.selfCheck, "The error-set comparator accepted an extra or missing code.");
  }
  let cases;
  try {
    cases = JSON.parse(await fileText(casesPath));
  } catch (error) {
    fail(HARNESS_CODES.selfCheck, `Cannot load cases: ${error.message}`);
    cases = [];
  }
  if (!Array.isArray(cases) || cases.length === 0) {
    fail(HARNESS_CODES.empty, "Cases must be a nonempty array.");
    cases = [];
  }
  const base = dirname(resolve(casesPath));
  const registered = new Set();
  const names = new Set();
  const expectedCodes = new Set();
  let passed = 0;
  for (const item of cases) {
    if (!item || typeof item.case !== "string" || typeof item.input !== "string" ||
        !Array.isArray(item.args) || !item.args.every((arg) => typeof arg === "string") ||
        !item.expect || typeof item.expect.ok !== "boolean" ||
        ["errors", "warnings_include", "warnings_exclude"].some((key) => item.expect[key] !== undefined &&
          (!Array.isArray(item.expect[key]) || !item.expect[key].every((code) => typeof code === "string")))) {
      fail(HARNESS_CODES.selfCheck, "Invalid case record.");
      continue;
    }
    if (names.has(item.case)) fail(HARNESS_CODES.selfCheck, `Duplicate case name: ${item.case}`);
    names.add(item.case);
    const input = resolve(base, item.input);
    registered.add(input);
    for (const code of [...(item.expect.errors ?? []), ...(item.expect.warnings_include ?? [])]) expectedCodes.add(code);
    // A --source file is named relative to the cases file, like the input.
    const args = item.args.map((arg, index) => (item.args[index - 1] === "--source" ? resolve(base, arg) : arg));
    const result = await execute([...args, input]);
    const comparison = compare(result, item.expect);
    if (comparison.ok) {
      passed += 1;
      writeLine(`PASS ${item.case}`);
    } else {
      writeLine(`FAIL ${item.case}: ok actual=${result.ok} expected=${item.expect.ok}; missing errors=[${comparison.missingErrors}]; undeclared errors=[${comparison.extraErrors}]; missing warnings=[${comparison.missingWarnings}]; forbidden warnings=[${comparison.forbiddenWarnings}]`);
    }
  }
  const directories = await Promise.all(["pass", "fail"].map(async (name) => {
    const directory = resolve(base, name);
    return { directory, files: await fixtureFiles(directory) };
  }));
  if (directories.some(({ files }) => files !== null)) {
    for (const { directory, files: found } of directories) {
      const files = found ?? [];
      for (const file of files) {
        if (!registered.has(file)) fail(HARNESS_CODES.unregistered, relative(base, file));
      }
      for (const file of registered) {
        const location = relative(directory, file);
        if (location && !location.startsWith(`..${sep}`) && location !== ".." && !isAbsolute(location) &&
            !location.split(sep).some((part) => part.startsWith(".")) && !files.includes(file)) {
          fail(HARNESS_CODES.unregistered, `Registered fixture does not exist: ${relative(base, file)}`);
        }
      }
    }
  }
  const uncovered = [...entriesByCode.keys()].filter((code) => !expectedCodes.has(code));
  if (uncovered.length) writeLine(`${HARNESS_CODES.uncovered}: ${uncovered.join(", ")}`);
  writeLine(`${passed}/${cases.length} cases passed`);
  return { ok: !harnessFailed && passed === cases.length, passed, total: cases.length, uncovered };
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

export const USAGE = `usage: node scripts/check_prompt.mjs [<prompt-file> | --file <prompt-file>] [options]
  The prompt file is a positional argument or --file; with neither, the prompt is read from stdin.
  The result is JSON (ok, errors, warnings); the exit code is 1 when ok is false.
  --profile native|assembled     native (default) is a natural-language prompt; assembled is machine-assembled handoff text
  --surface s1|s2|s3             the execution surface
  --engine gpt-image|unknown|midjourney|higgsfield|seedream|nano-banana|soul
  --channel unbounded|bounded    --channel-limit <characters>
  --source <layer-prompt-file>   with --engine seedream|midjourney|soul: the GPT Image layer prompt this flattened prompt was made from; its original-language names must survive (nano-banana: accepted, not read)
  --manifest <file>              check a JSON-lines manifest instead of one prompt
  --test                         run the built-in cases (used alone)
  --help                         this text`;

if (isMainModule()) {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.log(USAGE);
  } else if (args.length === 1 && args[0] === "--test") {
    const result = await runHarness();
    process.exitCode = result.ok ? 0 : 1;
  } else {
    const result = await execute(args);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  }
}
