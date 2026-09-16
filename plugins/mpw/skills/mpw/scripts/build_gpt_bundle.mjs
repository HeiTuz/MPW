#!/usr/bin/env node
// Build a Custom GPT bundle (web ChatGPT, no plugin review) from the canonical MPW tree.
// Output: build/gpt-bundle/ — instructions.txt (GPT "Instructions", <= 8000 chars) and <= 20 knowledge files.
// Knowledge files concatenate canonical references with "=== FILE: <path> ===" separators so
// SKILL.md's relative links can be resolved through the index file.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const OUT = path.join(root, "build", "gpt-bundle");
const MAX_FILES = 20;
const MAX_INSTRUCTIONS = 8000;

const GROUPS = [
  ["mpw-01-SKILL.md", ["SKILL.md"]],
  ["mpw-02-templates.md", ["references/templates.md"]],
  ["mpw-03-core-playbooks.md", ["references/model-playbooks.md", "references/prompt-graph.md", "references/adapters.md"]],
  ["mpw-04-core-contracts.md", ["references/contracts.md", "references/garden-recipe-compiler.md", "references/research.md", "references/slides.md",
    "references/midjourney-identity.md", "references/midjourney-character-sheets.md",
    "references/image-reference-editing-prompt-pitfalls.md", "references/image-reference-wardrobe-preservation-pitfall.md"]],
  ["mpw-05-image-surfaces.md", ["references/image/surfaces.md"]],
  ["mpw-06-image-routing-lanes.md", ["references/image/model-routing.md", "references/image/lanes.md"]],
  ["mpw-07-image-compiler-categories.md", ["references/image/compiler.md", "references/image/categories.md"]],
  ["mpw-08-image-production-from-image.md", ["references/image/production.md", "references/image/from-image.md", "references/image/image-production-handoff.md"]],
  ["mpw-09-image-look-typography.md", ["references/image/realism.md", "references/image/look-and-concept.md", "references/image/typography.md",
    "references/image/typography-poster-router.md", "references/image/typography-poster-patterns.md"]],
  ["mpw-10-image-editorial.md", ["references/image/editorial-fashion.md", "references/image/editorial/photo-vocab.md", "references/image/editorial/scene-craft.md",
    "references/image/editorial/format-b.md", "references/image/editorial/taxonomy-dna.md", "references/image/editorial/concept-collision.md", "references/image/editorial/tier2-safety.md"]],
  ["mpw-11-video.md", ["references/image/video-prompt-workflow.md", "references/image/seedance-2.md", "references/image/seedance-2-5.md",
    "references/image/higgsfield-genjutsu.md", "references/image/grok-imagine.md"]],
  ["mpw-12-image-models-promo.md", ["references/image/soul-v2-director.md", "references/image/seedream-5-pro.md", "references/image/seedream-character-reference-sheets.md",
    "references/image/apparel-compiler.md", "references/image/product-multicut-consistency.md", "references/image/midjourney-feed-diagnosis.md",
    "references/image/portrait-reference-moderation-triage.md", "references/image/promo-router.md"]],
  ["mpw-14-image-promo-patterns.md", "DIR:references/image/promo"],
  ["mpw-13-contracts-schemas.md", ["contracts/v1/prompt-bundle.schema.json", "contracts/v1/garden-recipe.schema.json"]],
];

function listMarkdown(dir) {
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.endsWith(".md")) out.push(path.relative(root, full));
    }
  };
  walk(dir);
  return out.sort();
}

function section(rel) {
  const body = fs.readFileSync(path.join(root, rel), "utf8");
  const head = "=== FILE: " + rel + " ===\n\n";
  if (rel.endsWith(".json")) return head + "~~~json\n" + body.trimEnd() + "\n~~~\n\n";
  return head + body.trimEnd() + "\n\n";
}

function instructions(index) {
  const lines = [
    "You are MPW (HeiTuz prompt writer) v" + pkg.version + ", running as a Custom GPT. Your job: turn the user's goal, context, constraints and completion criteria into a prompt an executor can use as-is; or review, polish, partially edit, or adapt a prompt to a target model or tool.",
    "",
    "Always begin a task by opening knowledge file mpw-01-SKILL.md and following it as the dispatch kernel. It routes to references by relative path (for example references/image/surfaces.md). Those files are packed into the knowledge files listed in mpw-00-index.md as sections headed \"=== FILE: <path> ===\". When SKILL.md tells you to read a path, open the mapped knowledge file and read that section only. Read only the mode and sections the request needs.",
    "",
    "Host surface: web ChatGPT without a shell. The validators, compilers and measurement commands named in the references (check_prompt.mjs, compile_*.py, wc -m, validate.py) are not available here. Apply their rules by reading; never claim a measurement, lint or validation was run. When a length limit applies, count the characters of the final text yourself and label the number as your own count. Where a step requires an absent tool, name it as a follow-up for the user's Codex, Claude Code or Hermes installation of MPW.",
    "",
    "Deliverables: output the finished prompt as one copyable code block per execution unit, self-contained (no path references the receiver cannot open). Prompt bodies default to English unless the request fixes another language or a base text is being partially edited; conversation, review notes and questions stay in the user's language. Keep exact strings, quantities, preservation conditions and output formats from the request; do not add goals, scope or permissions the user did not give. Prefer the shortest complete prompt; do not attach role play, fixed templates, step lists or few-shot bundles unless the request needs them.",
    "",
    "Modes (from SKILL.md): GOAL (autonomous loop), TEAM (multi-agent kickoff), CONTRACT (single task order, system prompt, automation job), BUSINESS, MODEL (polish, delta edit, research, extraction), IMAGE and COMPOSITE (image and video prompts: decide surface S1/S2/S3 and native vs compiled format in references/image/surfaces.md, then references/image/model-routing.md, then references/image/lanes.md), DESIGN overlay. For GPT Image the default model and selection branch live in references/image/model-routing.md section 4; state model choices as a separate label line, not inside the prompt body, and never claim a model was applied on a surface that has no selector.",
    "",
    "Review requests: report problems, evidence and fix direction; include a rewrite only when asked. Delta requests: change only the named axis and keep every other line verbatim. If a required input is missing (base text, exact copy, real identifiers, a decision only the user can make), ask one concise question and continue with whatever does not depend on it.",
    "",
    "Knowledge file index:",
  ];
  for (const [file, paths] of index) lines.push("- " + file + ": " + paths.join(", "));
  return lines.join("\n") + "\n";
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const groups = GROUPS.map(([file, paths]) => [file, typeof paths === "string" ? listMarkdown(path.join(root, paths.slice(4))) : paths])
    .sort((a, b) => a[0].localeCompare(b[0]));
  const covered = new Set(groups.flatMap(([, paths]) => paths));
  const all = [...listMarkdown(path.join(root, "references")), "SKILL.md"];
  const missing = all.filter((p) => !covered.has(p));
  if (missing.length) throw new Error("Reference files not packed into any knowledge file: " + missing.join(", "));
  const index = [];
  for (const [file, paths] of groups) {
    fs.writeFileSync(path.join(OUT, file), paths.map(section).join(""));
    index.push([file, paths]);
  }
  const indexText = "# MPW knowledge index (v" + pkg.version + ")\n\nEach knowledge file below concatenates canonical files as sections headed \"=== FILE: <path> ===\". When SKILL.md or a reference links to a path, open the knowledge file that owns it and read that section.\n\n" +
    index.map(([file, paths]) => "## " + file + "\n" + paths.map((p) => "- " + p).join("\n")).join("\n\n") + "\n";
  fs.writeFileSync(path.join(OUT, "mpw-00-index.md"), indexText);
  const text = instructions(index);
  if (text.length > MAX_INSTRUCTIONS) throw new Error("instructions.txt exceeds " + MAX_INSTRUCTIONS + " chars: " + text.length);
  fs.writeFileSync(path.join(OUT, "instructions.txt"), text);
  const knowledge = fs.readdirSync(OUT).filter((f) => f.endsWith(".md"));
  if (knowledge.length > MAX_FILES) throw new Error("knowledge file count " + knowledge.length + " exceeds " + MAX_FILES);
  const sizes = knowledge.map((f) => f + " " + fs.statSync(path.join(OUT, f)).size);
  console.log("Built " + path.relative(root, OUT) + ": instructions.txt (" + text.length + " chars), " + knowledge.length + " knowledge files\n" + sizes.join("\n"));
}

main();
