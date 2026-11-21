#!/usr/bin/env node
// Read a look card in steps so a model need not load a 30-40KB file whole.
//
//   node scripts/read_look.mjs --list
//   node scripts/read_look.mjs <slug|path> --outline
//   node scripts/read_look.mjs <slug|path> --facts
//   node scripts/read_look.mjs <slug|path> --branch A [--no-pairs] [--set S1] [--pair 2]
//   node scripts/read_look.mjs <slug|path> --set S1 [--pair 2] --only [--branch A]
//
// --list     one line per card from looks/index.md (slug, name, culture, axis, summary) to find a card by what a photo shows.
// --facts    for extracting a prompt from a photo: the head table, 고정 사실, 갈래 고르기 and 맞지 않는 것 (no set clues, no pair summary).
// --outline  title and header table, 고정 사실, 갈래 고르기, the name and clue (장소·소품·시간대·의상)
//            of each scene set, the number/branch/Pose token/Camera token of each pose-camera pair,
//            and 맞지 않는 것. Enough to choose the branch, the set and the pair.
// --branch   끄는 고정 몫 whole, the rows of every layer table whose 갈래 cell holds that branch
//            (or 전부), the chosen set's whole bundle, the chosen pair (all pairs of the branch when
//            --pair is left out). --set alone also gives the branch; --pair
//            may name a pair of another branch (a borrowed pair). With --set, the lines the bundle names
//            by token (a lip, a prop, a Pose) come out too, whichever branch row holds them.
//            --no-pairs leaves out the pair table (a set's named pair lines still come out).
// --only     with --set (and --pair): after the branch was read, add only the chosen set's bundle, the lines it names
//            that the branch read did not print, and the chosen pair. The fixed-slot table and branch rows are not repeated.
// Printed output leaves out the 이유 column of 끄는 고정 몫, the Iris 근거 column of 갈래 고르기 and the source marks
// like (滤镜 #091); --full prints the card text as written.
// A bare slug resolves to references/image/looks/<slug>.md under the skill root.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LOOKS = path.join(skillRoot, "references/image/looks");

const splitRow = (line) => line.replace(/^\| | \|$/g, "").split(/(?<!\\) \| /);
const isRow = (line) => /^\| /.test(line);
const isHeadOrRule = (line) => /^\| (갈래|번호|세트|슬롯|항목|---)/.test(line);
const tokenOf = (cell) => cell.match(/^(.+?) — /)?.[1] ?? cell.split(/ — |\. /)[0];
// Does a 갈래 cell ("A", "A, C", "전부") include this branch?
const covers = (cell, letter) => /전부|모든 갈래/.test(cell) || (cell.match(/[A-Z]/g) ?? []).includes(letter);

// Maintenance notes that do not help write a prompt: the 이유 column of 끄는 고정 몫, the Iris 근거 column of 갈래 고르기 and source marks
// like (滤镜 #091), (神态 #048 #079) or (风格/01 #004). A bracket with Latin or Hangul text, such as (S2 전용), is not a source mark.
const SOURCE_MARK = / ?\((?=[^()]*#)[\u4e00-\u9fff/\d#,~–\s-]+\)/g;
// A mark that opens a longer bracket, "(滤镜 #061. 단서: …)" or "(KR 滤镜 #101. 쌍 1과 짝이다)": only the mark goes, the rest stays.
const SOURCE_LEAD = /\((?:[A-Z]{2} )?(?:[\u4e00-\u9fff]+[/\d]* ?#\d[\d #~–]*(?:, )?)+\. /g;
const DROP_COLUMNS = ["이유", "Iris 근거"];
const dropMarks = (line) => line.replace(SOURCE_MARK, "").replace(SOURCE_LEAD, "(");
export function slim(text) {
  let drop = false;
  return text.split("\n").map((line) => {
    if (!line.startsWith("|")) {
      drop = false;
      return dropMarks(line);
    }
    if (isRow(line) && /^\| (슬롯|갈래) \|/.test(line)) drop = DROP_COLUMNS.includes(splitRow(line).at(-1));
    if (!drop) return dropMarks(line);
    if (/^\|[-| ]+\|$/.test(line)) return line.replace(/---\|$/, "");
    const cells = splitRow(line);
    cells.pop();
    return dropMarks(`| ${cells.join(" | ")} |`);
  }).join("\n");
}

export function parseCard(text) {
  const lines = text.split("\n");
  const sections = [];
  let head = [];
  let cur = null;
  let fence = false;
  for (const line of lines) {
    if (/^ {0,3}(`{3,}|~{3,})/.test(line)) fence = !fence;
    if (!fence && /^## /.test(line)) {
      cur = { title: line.slice(3).trim(), key: line.slice(3).replace(/\s*\(.*$/, "").trim(), lines: [] };
      sections.push(cur);
    } else if (cur) cur.lines.push(line);
    else head.push(line);
  }
  const find = (key) => sections.find((s) => s.key === key);
  // Layer tables are the sections whose table starts with 갈래 | 슬롯 | 줄.
  const layers = sections.filter((s) => s.lines.some((l) => /^\| 갈래 \| 슬롯 \| 줄 \|/.test(l)));
  return { head, sections, find, layers };
}

// Does the text name this token? Case and width are ignored; a token that starts or ends with a Latin
// letter or digit must not sit inside a longer word.
const mentions = (text, token) => {
  const t = token.normalize("NFKC").toLowerCase().trim();
  if (t.length < 2) return false;
  const esc = t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const before = /^[a-z0-9]/.test(t) ? "(?<![a-z0-9])" : "";
  const after = /[a-z0-9]$/.test(t) ? "(?![a-z0-9])" : "";
  return new RegExp(before + esc + after).test(text.normalize("NFKC").toLowerCase());
};
// The bundle without its clue segments (장소·소품·시간대·의상), which are plain description.
const bundleBody = (bundle) => bundle.split(" / ").filter((seg) => !/^(단서:\s*)?(장소|소품|시간대|의상)(?=\s|$)/.test(seg)).join(" / ");

const body = (section) => section.lines.join("\n").replace(/\s+$/, "");
const block = (section) => `## ${section.title}\n${body(section)}`;

// "단서: 장소 … / 소품 … / 시간대 … / 의상 … / Hair …": keep the leading segments that name a category.
function clueOf(bundle) {
  const segments = bundle.replace(/^단서:\s*/, "").split(" / ");
  const out = [];
  for (const segment of segments) {
    if (!/^(장소|소품|시간대|의상)(?=\s|$)/.test(segment)) break;
    out.push(segment);
  }
  return out.join(" / ");
}

export function outline(text, { sets: withSets = true, pairs: withPairs = true, full = false } = {}) {
  const card = parseCard(text);
  const parts = [card.head.join("\n").replace(/\s+$/, "")];
  for (const key of ["고정 사실", "갈래 고르기"]) {
    const s = card.find(key);
    if (s) parts.push(block(s));
  }
  const sets = withSets && card.find("장면 세트");
  if (sets) {
    const rows = sets.lines.filter((l) => isRow(l) && !isHeadOrRule(l)).map(splitRow);
    parts.push(`## 장면 세트 (이름과 단서만. 묶음 본문은 --branch <갈래> --set <S번호>)\n${rows.map(([name, branches, bundle]) => `- ${name} [${branches}] — ${clueOf(bundle) || "단서 없음"}`).join("\n")}`);
  }
  const pairs = withPairs && card.find("포즈·구도 쌍");
  if (pairs) {
    const rows = pairs.lines.filter((l) => isRow(l) && !isHeadOrRule(l)).map(splitRow);
    parts.push(`## 포즈·구도 쌍 (번호 · 갈래 · Pose 토큰 · Camera 토큰. 문장은 --branch <갈래> [--pair <번호>])\n${rows.map(([n, branches, pose, camera]) => `- ${n} [${branches}] ${tokenOf(pose)} · ${tokenOf(camera)}`).join("\n")}`);
  }
  const avoid = card.find("맞지 않는 것");
  if (avoid) parts.push(block(avoid));
  const out = `${parts.join("\n\n")}\n`;
  return full ? out : slim(out);
}

// The facts read for extracting a prompt from a photo: no set clues, no pair summary.
export const facts = (text, { full = false } = {}) => outline(text, { sets: false, pairs: false, full });

export function branchLetters(text) {
  const choose = parseCard(text).find("갈래 고르기");
  const rows = choose ? choose.lines.filter((l) => isRow(l) && !isHeadOrRule(l)).map(splitRow) : [];
  return rows.map((r) => r[0].match(/^[A-Z]/)?.[0]).filter(Boolean);
}

export function readBranch(text, { branch = null, set = null, pair = null, noPairs = false, only = false, full = false } = {}) {
  if (only && set === null) return { error: "--only needs --set <S번호>" };
  if (noPairs && pair !== null) return { error: "--no-pairs and --pair cannot be used together" };
  const card = parseCard(text);
  const out = [card.head.find((l) => /^# /.test(l)) ?? ""];
  const notes = [];
  const setsSection = card.find("장면 세트");
  const setRows = setsSection ? setsSection.lines.filter((l) => isRow(l) && !isHeadOrRule(l)) : [];
  let setRow = null;
  if (set !== null) {
    const id = String(set).toUpperCase();
    setRow = setRows.find((l) => splitRow(l)[0].toUpperCase().startsWith(`${id} `) || splitRow(l)[0].toUpperCase() === id);
    if (!setRow) return { error: `set not found: ${set} (sets: ${setRows.map((l) => splitRow(l)[0].split(" ")[0]).join(", ")})` };
    const setBranch = splitRow(setRow)[1].match(/[A-Z]/)?.[0];
    if (branch === null) branch = setBranch;
    else if (setBranch && setBranch !== branch) notes.push(`note: ${id} belongs to branch ${setBranch}; the branch rows below are branch ${branch}. A set's branch wins (image-brief §4 룩 카드 1항).`);
  }
  if (branch === null) return { error: "give --branch <A|B|...> (or --set <S번호>)" };
  branch = String(branch).toUpperCase();
  const known = branchLetters(text);
  if (known.length && !known.includes(branch)) return { error: `branch not found: ${branch} (branches: ${known.join(", ")})` };

  const fixed = card.find("끄는 고정 몫");
  if (fixed && !only) out.push(block(fixed));
  for (const layer of only ? [] : card.layers) {
    const header = layer.lines.filter((l) => /^\| (갈래|---)/.test(l)).slice(0, 2);
    const rows = layer.lines.filter((l) => isRow(l) && !isHeadOrRule(l) && covers(splitRow(l)[0], branch));
    if (rows.length) out.push(`## ${layer.key} (갈래 ${branch})\n${[...header, ...rows].join("\n")}`);
  }
  if (setRow) {
    const header = setsSection.lines.filter((l) => /^\| (세트|---)/.test(l)).slice(0, 2);
    out.push(`## 장면 세트 (고른 세트)\n${[...header, setRow].join("\n")}`);
  }
  const pairsSection = card.find("포즈·구도 쌍");
  let pairRows = [];
  if (pairsSection) {
    const header = pairsSection.lines.filter((l) => /^\| (번호|---)/.test(l)).slice(0, 2);
    const all = pairsSection.lines.filter((l) => isRow(l) && !isHeadOrRule(l));
    // No pair table without --pair when --no-pairs or --only says the branch's pairs are not wanted (or were read before).
    const picked = pair !== null ? all.filter((l) => splitRow(l)[0] === String(pair)) : noPairs || only ? [] : all.filter((l) => covers(splitRow(l)[1], branch));
    if (pair !== null && picked.length === 0) return { error: `pair not found: ${pair} (pairs: ${all.map((l) => splitRow(l)[0]).join(", ")})` };
    if (picked.length) out.push(`## 포즈·구도 쌍 (${pair === null ? `갈래 ${branch} 전부` : `쌍 ${pair}`})\n${[...header, ...picked].join("\n")}`);
    pairRows = all.filter((l) => !picked.includes(l));
  }
  if (setRow) {
    // Lines the bundle names by token that the branch read above did not print (another branch's row, another pair).
    const text = bundleBody(splitRow(setRow)[2] ?? "");
    const named = [];
    // A token the branch read already prints (濡れ髪 for A) is not repeated from another branch's row, whose sentence is that branch's variant.
    const printed = new Set(card.layers.flatMap((layer) => layer.lines.filter((l) => isRow(l) && !isHeadOrRule(l) && covers(splitRow(l)[0], branch)).map((l) => tokenOf(splitRow(l)[2] ?? "").toLowerCase())));
    for (const layer of card.layers) {
      const header = layer.lines.filter((l) => /^\| (갈래|---)/.test(l)).slice(0, 2);
      const rows = layer.lines.filter((l) => isRow(l) && !isHeadOrRule(l) && !covers(splitRow(l)[0], branch) && !printed.has(tokenOf(splitRow(l)[2] ?? "").toLowerCase()) && mentions(text, tokenOf(splitRow(l)[2] ?? "")));
      if (rows.length) named.push(`### ${layer.key}\n${[...header, ...rows].join("\n")}`);
    }
    const pairHeader = pairsSection ? pairsSection.lines.filter((l) => /^\| (번호|---)/.test(l)).slice(0, 2) : [];
    const pairNamed = pairRows.filter((l) => [2, 3].some((i) => mentions(text, tokenOf(splitRow(l)[i] ?? ""))));
    if (pairNamed.length) named.push(`### 포즈·구도 쌍\n${[...pairHeader, ...pairNamed].join("\n")}`);
    if (named.length) out.push(`## 세트가 가리키는 줄 (묶음이 토큰 이름으로 부른 줄 가운데 위에 없는 것)\n${named.join("\n\n")}`);
  }
  const result = `${[...notes, ...out].join("\n\n")}\n`;
  return { text: full ? result : slim(result) };
}

export function resolveCard(arg) {
  if (/[\\/]/.test(arg) || arg.endsWith(".md")) return path.isAbsolute(arg) ? arg : fs.existsSync(path.join(skillRoot, arg)) ? path.join(skillRoot, arg) : arg;
  return path.join(LOOKS, `${arg}.md`);
}

function valueOf(argv, flag) {
  const i = argv.indexOf(flag);
  return i === -1 ? null : argv[i + 1] ?? "";
}

// One line per card from looks/index.md: slug, culture and axis, name, summary. The 갈래 column and the head paragraph are left out.
export function listCards(indexText) {
  const lines = [];
  for (const line of indexText.split("\n")) {
    if (!isRow(line) || /^\| (slug|---)/.test(line)) continue;
    const [slugCell, name, culture, , axis, summary] = splitRow(line);
    const slug = slugCell.replace(/^\[([^\]]+)\]\(\1\.md\)$/, "$1");
    lines.push(`- ${slug} [${culture}, ${axis}] ${name} — ${summary}`);
  }
  return `${lines.join("\n")}\n`;
}

const USAGE = `usage:
  read_look.mjs --list
  read_look.mjs <slug|path> --outline | --facts
  read_look.mjs <slug|path> --branch <A|B|C|D> [--no-pairs] [--set S<n>] [--pair <n>]
  read_look.mjs <slug|path> --set S<n> [--pair <n>] --only [--branch <A|B|C|D>]
  add --full to print the card text as written (with the 이유 column and source marks)`;
const VALUE_FLAGS = ["--branch", "--set", "--pair"];

function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(USAGE);
    return 0;
  }
  if (argv.includes("--list")) {
    try {
      process.stdout.write(listCards(fs.readFileSync(path.join(LOOKS, "index.md"), "utf8")));
    } catch {
      console.error("read_look: cannot read looks/index.md");
      return 2;
    }
    return 0;
  }
  const target = argv.find((a, i) => !a.startsWith("--") && !VALUE_FLAGS.includes(argv[i - 1]));
  const wantsOutline = argv.includes("--outline"), wantsFacts = argv.includes("--facts");
  const branch = valueOf(argv, "--branch"), set = valueOf(argv, "--set"), pair = valueOf(argv, "--pair");
  const full = argv.includes("--full");
  if (!target || (!wantsOutline && !wantsFacts && branch === null && set === null)) {
    console.error(USAGE);
    return 2;
  }
  let text;
  try {
    text = fs.readFileSync(resolveCard(target), "utf8");
  } catch {
    console.error(`read_look: cannot read ${target}`);
    return 2;
  }
  if (wantsOutline || wantsFacts) {
    process.stdout.write(wantsFacts && !wantsOutline ? facts(text, { full }) : outline(text, { full }));
    return 0;
  }
  const result = readBranch(text, { branch, set, pair, noPairs: argv.includes("--no-pairs"), only: argv.includes("--only"), full });
  if (result.error) {
    console.error(`read_look: ${result.error}`);
    return 2;
  }
  process.stdout.write(result.text);
  return 0;
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) process.exit(main(process.argv.slice(2)));
