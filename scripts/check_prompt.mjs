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
  skinToken: { code: "portrait/skin-token", severity: { native: null, assembled: "error" }, intent: "Describe skin observations rather than synthetic texture tokens." },
  skinColor: { code: "portrait/nationality-skin", severity: { native: null, assembled: "error" }, intent: "Avoid assigning stereotyped fixed skin colors." },
  glow: { code: "portrait/glow-stack", severity: { native: null, assembled: "warning" }, intent: "Balance multiple distinct shine effects with matte regions." },
  skinRepeat: { code: "portrait/skin-repeat", severity: { native: "warning", assembled: "error" }, intent: "State skin surface texture once instead of repeating it across sections." },
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
    "--engine": ["gpt-image", "unknown", "midjourney", "higgsfield"],
  };
  const valued = new Set([...Object.keys(choices), "--manifest", "--channel-limit"]);
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
  } else if (options.channel === "bounded" || (options.channel === undefined && result.surface === "s3")) {
    layers.push({ kind: "channel", limit: 2000, assumed: options.channel === undefined });
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
  if (/(?:\b(?:ar|aspect\s+ratio)|비율)\s*[:：=]?\s*\d+\s*:\s*\d+\s*$/iu.test(instruction)) {
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

function inspectSkinRepeat(result, instruction) {
  const skinTexture = /\b(?:skin[ -](?:texture|detail|pores?|grain)|fine skin detail|(?:visible|natural|open)\s+pores|pores?\s+(?:vary|visible|remain)|vellus\s+hair|(?:naturally\s+)?textured\s+skin|skin\s+remains\s+(?:naturally\s+)?textured|airbrushed)\b|피부\s*(?:결|질감|모공)|모공|잔털/iu;
  const blocks = instruction.split(/\r?\n(?=[A-Z][A-Z0-9 &/,'’-]{1,40}:|\s*\r?\n)/u).map((block) => block.trim()).filter(Boolean);
  const hits = blocks.filter((block) => skinTexture.test(block));
  if (hits.length >= 2) emit(result, CODE_REGISTRY.skinRepeat, `Skin surface texture appears in ${hits.length} separate sections.`, { hint: "Keep one texture statement with its area and degree; move preservation to CONSTRAINTS once." });
}

function inspectPortrait(result, instruction) {
  evidence(result, CODE_REGISTRY.skinToken,
    snippets(/\bmicro[ -]?(?:skin(?:[ -]?texture)?|pores?|texture)\b|\b(?:realistic[ -]?)?skin(?:[ -]?texture)?[ -]?ai\b|마이크로\s*(?:피부\s*)?(?:질감|피부결)|(?:사실적(?:인)?\s*)?피부(?:\s*(?:질감|결))?\s*AI/giu, instruction),
    "Synthetic skin tokens", "Describe visible pores, fine facial hair and natural texture.");
  evidence(result, CODE_REGISTRY.skinColor,
    snippets(/\byellow(?:ish)?(?:[ -]+undertone)?[ -]+skin\b|(?:노란|누런|황색)\s*피부/giu, instruction),
    "Fixed skin color shorthand", "Describe observed hydration or blush rather than assigning a nationality a color.");
  const shine = [
    /\bdewy\b/iu, /\bluminous\s+skin\b/iu, /\bglass\s+skin\b/iu,
    /\bsubsurface\s+(?:glow|sheen|scatter)\b/iu, /\bwet[ -]look\b/iu,
    /\bhigh[ -]shine\b/iu, /\bglossy\s+skin\b/iu, /\bglistening\s+skin\b/iu,
  ].filter((pattern) => pattern.test(instruction));
  const matte = /\b(?:(?:semi|soft)[ -])?matte\b|무광|매트|반무광|\b(?:restrained|controlled)\s+sheen\b/iu;
  if (shine.length >= 4 && !matte.test(instruction)) emit(result, CODE_REGISTRY.glow, `${shine.length} distinct skin shine effects have no matte qualifier.`, { hint: "Choose one main sheen and place matte regions deliberately." });
}

export function checkText(input, options = {}) {
  const result = textResult(options);
  const text = input.startsWith("\uFEFF") ? input.slice(1) : input;
  measure(text, result, options);
  const { quotes, instruction } = copyViews(text);
  const structured = result.profile === "native" && structuredBody(text);
  if (isEmpty(text, quotes) && !structured) {
    emit(result, CODE_REGISTRY.empty, "The prompt has no depictable content or nonempty quoted copy.");
    return result;
  }
  if (result.profile === "native" && result.engine !== "gpt-image") {
    emit(result, CODE_REGISTRY.engineScope, "The native profile accepts GPT Image natural language only.", { hint: "Use the selected engine's own syntax validator for other engines." });
    return result;
  }
  if (result.profile === "assembled" && result.engine === "midjourney") {
    const words = text.trim().split(/\s+/u).length;
    emit(result, CODE_REGISTRY.engineScope, `단어 수: ${words}. This checker does not judge Midjourney syntax; channel and machine-contract character limits still apply. See surfaces.md §0-1.`);
    return result;
  }
  if (structured) {
    emit(result, CODE_REGISTRY.structured, "A structured request body is not a natural-language image prompt.");
    return result;
  }
  inspectCopy(result, quotes, instruction);
  inspectSyntax(result, instruction);
  inspectPhrasing(result, instruction);
  inspectSkinRepeat(result, instruction);
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

if (isMainModule()) {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--test") {
    const result = await runHarness();
    process.exitCode = result.ok ? 0 : 1;
  } else {
    const result = await execute(args);
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  }
}
