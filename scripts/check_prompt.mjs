import fs from "node:fs";
import { readFile, readdir, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

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
  dayNight: { code: "coherence/day-night", severity: { native: "warning", assembled: "warning" }, intent: "Flag a night cue next to midday light." },
  engineLayers: { code: "coherence/engine-layers", severity: { native: "warning", assembled: "warning" }, intent: "Flag GPT Image layer headings left in a prompt for another engine." },
  engineFlag: { code: "coherence/engine-flag", severity: { native: "warning", assembled: "warning" }, intent: "Flag a Midjourney flag or ratio token in the body of an engine that takes it as a setting." },
  engineBan: { code: "coherence/engine-ban", severity: { native: "warning", assembled: "warning" }, intent: "Flag a spoken ban on illustration or CGI where the engine's cell says to state the medium or use its own exclusion syntax." },
  slotName: { code: "token/slot-name", severity: { native: "warning", assembled: "warning" }, intent: "Flag a layer-line token that names the slot (hair color, passersby, road surface) instead of the thing shown." },
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
  const valued = new Set([...Object.keys(choices), "--manifest", "--channel-limit", "--file"]);
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
  const weights = [...instruction.matchAll(/\(([^()\r\n]+):\s*(?:\d*\.\d+)\s*\)|<([^<>\r\n]+):\s*(?:\d*\.\d+)\s*>/gu)]
    .filter((match) => /\p{L}/u.test(match[1] ?? match[2])).map((match) => match[0]);
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
    ? /\bar\s*[:：=]?\s*\d+\s*:\s*\d+\s*$/iu
    : /(?:\b(?:ar|aspect\s+ratio)|비율)\s*[:：=]?\s*\d+\s*:\s*\d+\s*$/iu;
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
      snippets(/[^\s,.!?;\n\r。]{0,12}(?:금지|하지\s*마(?:세요|라)?|하지\s*않(?:도록|게)|없어야|없도록|빼고|제외하고)[^,.!?;\n\r。]{0,12}/gu, remaining).slice(0, 3),
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

const KNOWN_RATIOS = "(?:1:1|2:3|3:2|3:4|4:3|4:5|5:4|9:16|16:9|9:21|21:9|1:2|2:1|1:3|3:1|2\\.39:1|1\\.85:1)";
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
  const wideWord = /\b(?:ultra[- ]?wide|fish[- ]?eye|wide[- ]angle\s+(?:lens|shot|view|selfie)|wide\s+lens)\b/iu.test(instruction);
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
  const skinColor = snippets(/\b(?:fair|pale|porcelain|ivory|olive|tan(?:ned)?|golden|bronzed?|deep|dark|brown|cool|warm|milky)\b[ -]?(?:[\w-]+[ -]){0,1}skin\b|冷白皮|白皙|瓷肌/giu, outsideIdentity);
  if (keepsTone && skinColor.length) {
    emit(result, CODE_REGISTRY.identitySkin, `A skin color is written outside the identity paragraph: ${[...new Set(skinColor)].slice(0, 3).join(" | ")}`, { hint: "The natural skin color belongs in the identity condition only; a reference keeps its own tone. Makeup finish and light on the skin are fine elsewhere." });
  }
  const ratios = instruction.match(new RegExp(`(?<![\\d:.])${KNOWN_RATIOS}(?![\\d:])`, "gu")) ?? [];
  if (ratios.length >= 2) emit(result, CODE_REGISTRY.ratioDup, `An aspect ratio is written ${ratios.length} times: ${[...new Set(ratios)].join(" | ")}`, { hint: "Write the ratio once, in the Camera layer." });
  const makeup = sections.find((section) => /^(?:Hair and makeup|Makeup)$/iu.test(section.name ?? ""));
  const lipLines = (makeup?.lines ?? []).filter((line) => /\b(?:lips?|lipstick)\b|唇|립|입술/iu.test(line));
  const catchLines = instruction.split(/\r?\n/u).filter((line) => /catch[- ]?lights?|eye[- ]?lights?|眼神光|\bglints?\s+in\s+(?:each|both|her|his)\s+eyes?|point of light sits in each eye/iu.test(line));
  if (lipLines.length >= 2 || catchLines.length >= 2) {
    emit(result, CODE_REGISTRY.slotDup, lipLines.length >= 2 ? `Hair and makeup has ${lipLines.length} lip lines.` : `The catchlight is written on ${catchLines.length} lines.`, { hint: "A slot is filled once: remove the later line." });
  }
  if (/\b(?:night(?:time)?|midnight|after dark)\b|深夜|夜晚|の夜/iu.test(instruction) && /\b(?:noon|midday|mid-day|noonday)\b|正午|中午|真昼/iu.test(instruction)) {
    emit(result, CODE_REGISTRY.dayNight, "A night cue and midday light appear in the same prompt.", { hint: "Pick one time of day and make Light and Optics agree." });
  }
  inspectSlotNames(result, sections);
  inspectEngine(result, instruction);
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
  if (names.length) emit(result, CODE_REGISTRY.slotName, `${names.length} token(s) name the slot, not the thing shown: ${[...new Set(names)].slice(0, 4).join(" | ")}`, { hint: "Name what is shown in the photo's own language (黒髪ロング, 通行人, マンホール) or the thing itself in English (cast shadows)." });
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
  if (result.profile === "native" && result.engine !== "gpt-image") {
    // Only the engine-independent checks run for other engines; their own syntax is outside this checker.
    inspectCoherence(result, text, instruction);
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
    const result = await execute([...item.args, input]);
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
