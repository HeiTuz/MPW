#!/usr/bin/env node
// Build the mpw plugin directory from the canonical MPW tree.
//
//   node scripts/build_plugin.mjs [--out <dir>]   writes <dir>/plugins/mpw (default: build/plugin)
//   node scripts/build_plugin.mjs --check         builds into a temporary directory and validates it
//
// The plugin is never committed to main. scripts/release_plugin.mjs publishes the build on the
// dist branch, and the HeiTuz marketplace (github.com/HeiTuz/heituz-plugins) pins a dist tag.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installPayload } from "./install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PLUGIN_NAME = "mpw";
export const PLUGIN_REL = path.join("plugins", PLUGIN_NAME);
const REPOSITORY = "https://github.com/HeiTuz/MPW";
const AUTHOR = { name: "HeiTuz", url: "https://github.com/HeiTuz" };
const KEYWORDS = ["prompt", "prompt-writing", "delegation", "image-prompt", "korean"];

function readPackage(sourceRoot) {
  return JSON.parse(fs.readFileSync(path.join(sourceRoot, "package.json"), "utf8"));
}

export function pluginInterface() {
  return {
    displayName: "MPW — Prompt Writer",
    shortDescription: "거친 요청을 결과·검증까지 닫힌 프롬프트로 바꾸는 작성·검토 스킬",
    longDescription: "작업지시·시스템·자동화·팀 작업·업무·디자인·이미지·영상 프롬프트를 새로 작성하거나 검토·퇴고하고, 대상 모델·도구에 맞게 변환한다. 부분 수정은 지정한 축만 바꾸고 나머지 원문을 보존한다. 정본은 github.com/HeiTuz/MPW이다.",
    developerName: "HeiTuz",
    category: "Productivity",
    capabilities: ["Read"],
    websiteURL: REPOSITORY,
    defaultPrompt: [
      "이 작업을 위임하는 프롬프트를 작성해줘",
      "이 프롬프트를 검토하고 다듬어줘",
      "이 이미지 요청을 생성용 프롬프트로 바꿔줘",
    ],
    brandColor: "#1D4ED8",
    composerIcon: "./assets/icon.png",
    logo: "./assets/logo.png",
  };
}

export function codexManifest(version, license) {
  return {
    name: PLUGIN_NAME,
    version,
    description: pluginInterface().shortDescription,
    author: AUTHOR,
    homepage: REPOSITORY,
    repository: REPOSITORY,
    license,
    keywords: KEYWORDS,
    skills: "./skills/",
    interface: pluginInterface(),
  };
}

export function claudeManifest(version, license) {
  return {
    name: PLUGIN_NAME,
    version,
    description: pluginInterface().shortDescription,
    author: AUTHOR,
    homepage: REPOSITORY,
    repository: REPOSITORY,
    license,
    keywords: KEYWORDS,
  };
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function buildPlugin(outRoot, { sourceRoot = root } = {}) {
  const pkg = readPackage(sourceRoot);
  const license = pkg.license || "MIT";
  const pluginDir = path.join(outRoot, PLUGIN_REL);
  fs.rmSync(pluginDir, { recursive: true, force: true });
  installPayload({ sourceRoot, destination: path.join(pluginDir, "skills", PLUGIN_NAME) });
  writeJson(path.join(pluginDir, ".codex-plugin", "plugin.json"), codexManifest(pkg.version, license));
  writeJson(path.join(pluginDir, ".claude-plugin", "plugin.json"), claudeManifest(pkg.version, license));
  const icon = path.join(sourceRoot, "assets", "plugin-icon.png");
  fs.mkdirSync(path.join(pluginDir, "assets"), { recursive: true });
  fs.copyFileSync(icon, path.join(pluginDir, "assets", "icon.png"));
  fs.copyFileSync(icon, path.join(pluginDir, "assets", "logo.png"));
  fs.copyFileSync(path.join(sourceRoot, "LICENSE"), path.join(pluginDir, "LICENSE"));
  return pluginDir;
}

export function listFiles(base) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(path.relative(base, full).split(path.sep).join("/"));
    }
  };
  if (fs.existsSync(base)) walk(base);
  return out.sort();
}

const PRIVATE_HOME = /\/(?:Users|home)\/(eusin)\b/u;
const TEXT_SUFFIX = /\.(?:md|mjs|js|py|json|txt|yaml|yml)$/u;

export function validatePlugin(pluginDir, { sourceRoot = root } = {}) {
  const problems = [];
  const pkg = readPackage(sourceRoot);
  const files = listFiles(pluginDir);
  const skills = files.filter((file) => path.posix.basename(file) === "SKILL.md");
  if (skills.length !== 1 || skills[0] !== "skills/mpw/SKILL.md") problems.push("expected exactly one SKILL.md at skills/mpw/SKILL.md, found: " + skills.join(", "));
  for (const file of files) {
    if (/(^|\/)(?:docs-internal|agents|__pycache__|node_modules)(\/|$)/u.test(file) || /\.pyc$/u.test(file)) problems.push("excluded path shipped: " + file);
    if (file.split("/").some((part) => part.startsWith(".") && ![".codex-plugin", ".claude-plugin"].includes(part))) problems.push("hidden path shipped: " + file);
    if (TEXT_SUFFIX.test(file) && PRIVATE_HOME.test(fs.readFileSync(path.join(pluginDir, file), "utf8"))) problems.push("private home path shipped: " + file);
  }
  const skill = fs.readFileSync(path.join(pluginDir, "skills/mpw/SKILL.md"), "utf8");
  const frontmatter = /^---\n([\s\S]*?)\n---\n/u.exec(skill);
  if (!frontmatter || !/^name:\s*mpw\s*$/mu.test(frontmatter[1])) problems.push("skill frontmatter must declare name: mpw");
  if (!frontmatter || !new RegExp("^  version:\\s*\"?" + pkg.version.replace(/\./g, "\\.") + "\"?\\s*$", "mu").test(frontmatter[1])) problems.push("skill version must equal package.json " + pkg.version);
  if (!frontmatter || !/^  host_surface:\s*plugin\s*$/mu.test(frontmatter[1])) problems.push("skill must carry the plugin host surface");
  for (const [rel, required] of [[".codex-plugin/plugin.json", ["name", "version", "description", "skills", "interface"]], [".claude-plugin/plugin.json", ["name", "version", "description"]]]) {
    const file = path.join(pluginDir, rel);
    if (!fs.existsSync(file)) { problems.push("missing manifest " + rel); continue; }
    const manifest = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const key of required) if (!(key in manifest)) problems.push(rel + " lacks " + key);
    if (manifest.name !== PLUGIN_NAME) problems.push(rel + " name must be " + PLUGIN_NAME);
    if (manifest.version !== pkg.version) problems.push(rel + " version must be " + pkg.version);
  }
  const ui = pluginInterface();
  if (ui.defaultPrompt.length > 3 || ui.defaultPrompt.some((prompt) => prompt.length > 128)) problems.push("defaultPrompt allows at most 3 entries of 128 characters");
  for (const asset of [ui.composerIcon, ui.logo]) {
    const file = path.join(pluginDir, asset);
    if (!fs.existsSync(file) || !fs.readFileSync(file).subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) problems.push("interface asset must be a PNG under assets/: " + asset);
  }
  return { files: files.length, problems };
}

function parseArgs(argv) {
  const opts = { check: false, out: path.join(root, "build", "plugin") };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--check") opts.check = true;
    else if (argv[i] === "--out" && argv[i + 1]) opts.out = path.resolve(argv[++i]);
    else if (argv[i].startsWith("--out=")) opts.out = path.resolve(argv[i].slice(6));
    else throw new Error("unknown flag: " + argv[i]);
  }
  return opts;
}

function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const outRoot = opts.check ? fs.mkdtempSync(path.join(os.tmpdir(), "mpw-plugin-check-")) : opts.out;
  try {
    const dir = buildPlugin(outRoot);
    const { files, problems } = validatePlugin(dir);
    if (problems.length) {
      console.error("Plugin build failed validation:");
      for (const problem of problems.slice(0, 30)) console.error("  " + problem);
      return 1;
    }
    console.log((opts.check ? "OK — plugin build validates" : "Built " + dir) + " (" + files + " files)");
    return 0;
  } finally {
    if (opts.check) fs.rmSync(outRoot, { recursive: true, force: true });
  }
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) process.exitCode = main();
