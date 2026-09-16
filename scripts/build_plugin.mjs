#!/usr/bin/env node
// Build the ChatGPT/Codex plugin package from the canonical MPW tree.
// Output: plugins/mpw/ (portable plugin.json + .codex-plugin compatibility manifest + skills/mpw payload)
// and the repo marketplace at .agents/plugins/marketplace.json.
// "--check" rebuilds into a temporary directory and fails when the committed artifact differs.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { installPayload } from "./install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN_NAME = "mpw";
const MARKETPLACE_NAME = "heituz";
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

const INTERFACE = {
  displayName: "MPW — Prompt Writer",
  shortDescription: "프롬프트 작성·검토·모델 적응 스킬 (HeiTuz MPW)",
  longDescription: "요청의 목표·맥락·제약·완료 기준을 실행자가 바로 쓸 수 있는 프롬프트로 만든다. 작업지시·시스템·자동화·팀 작업·업무·디자인·이미지·영상 프롬프트를 작성·퇴고하고 대상 모델·도구에 맞게 변환한다. 정본은 github.com/HeiTuz/MPW이며 이 플러그인은 그 스킬 payload를 번들한다.",
  developerName: "HeiTuz",
  category: "Productivity",
  capabilities: ["Read"],
  websiteURL: "https://github.com/HeiTuz/MPW",
  defaultPrompt: [
    "@mpw 이 작업을 위임하는 프롬프트를 작성해줘",
    "@mpw 이 프롬프트를 검토하고 다듬어줘",
  ],
  brandColor: "#1F2937",
};

function portableManifest() {
  return {
    $schema: "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
    name: PLUGIN_NAME,
    version: pkg.version,
    description: INTERFACE.shortDescription,
    author: { name: "HeiTuz", url: "https://github.com/HeiTuz" },
    homepage: "https://github.com/HeiTuz/MPW",
    repository: "https://github.com/HeiTuz/MPW",
    license: pkg.license || "MIT",
    keywords: ["prompt", "prompt-writing", "delegation", "image-prompt", "korean"],
    extensions: { "com.openai": { interface: INTERFACE } },
  };
}

function compatibilityManifest() {
  return {
    name: PLUGIN_NAME,
    version: pkg.version,
    description: INTERFACE.shortDescription,
    author: { name: "HeiTuz", url: "https://github.com/HeiTuz" },
    homepage: "https://github.com/HeiTuz/MPW",
    repository: "https://github.com/HeiTuz/MPW",
    license: pkg.license || "MIT",
    keywords: ["prompt", "prompt-writing", "delegation", "image-prompt", "korean"],
    skills: "./skills/",
    interface: INTERFACE,
  };
}

function marketplace() {
  return {
    name: MARKETPLACE_NAME,
    interface: { displayName: "HeiTuz" },
    plugins: [
      {
        name: PLUGIN_NAME,
        source: { source: "local", path: "./plugins/mpw" },
        policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" },
        category: "Productivity",
      },
    ],
  };
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

export function buildPlugin(destinationRoot, { sourceRoot = root } = {}) {
  const pluginDir = path.join(destinationRoot, "plugins", PLUGIN_NAME);
  fs.rmSync(pluginDir, { recursive: true, force: true });
  installPayload({ sourceRoot, destination: path.join(pluginDir, "skills", PLUGIN_NAME), host: "plugin" });
  writeJson(path.join(pluginDir, "plugin.json"), portableManifest());
  writeJson(path.join(pluginDir, ".codex-plugin", "plugin.json"), compatibilityManifest());
  writeJson(path.join(destinationRoot, ".agents", "plugins", "marketplace.json"), marketplace());
  return pluginDir;
}

function listFiles(base) {
  const out = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else out.push(path.relative(base, full));
    }
  };
  if (fs.existsSync(base)) walk(base);
  return out.sort();
}

export function diffPluginTrees(expectedRoot, actualRoot) {
  const problems = [];
  for (const rel of ["plugins/mpw", ".agents/plugins/marketplace.json"]) {
    const a = path.join(expectedRoot, rel);
    const b = path.join(actualRoot, rel);
    const isFile = fs.existsSync(a) && fs.statSync(a).isFile();
    const expected = isFile ? [""] : listFiles(a);
    const actual = isFile ? (fs.existsSync(b) ? [""] : []) : listFiles(b);
    for (const f of expected) if (!actual.includes(f)) problems.push("missing in committed artifact: " + path.join(rel, f));
    for (const f of actual) if (!expected.includes(f)) problems.push("stale file in committed artifact: " + path.join(rel, f));
    for (const f of expected) {
      if (!actual.includes(f)) continue;
      if (!fs.readFileSync(path.join(a, f)).equals(fs.readFileSync(path.join(b, f)))) problems.push("content differs: " + path.join(rel, f));
    }
  }
  return problems;
}

async function main(argv = process.argv.slice(2)) {
  const check = argv.includes("--check");
  if (check) {
    const temp = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-plugin-check-"));
    try {
      buildPlugin(temp);
      const problems = diffPluginTrees(temp, root);
      if (problems.length) {
        console.error("Plugin artifact is out of date; run: node scripts/build_plugin.mjs");
        for (const p of problems.slice(0, 20)) console.error("  " + p);
        return 1;
      }
      console.log("OK — plugins/mpw and .agents/plugins/marketplace.json match the canonical build (" + listFiles(path.join(root, "plugins", PLUGIN_NAME)).length + " files)");
      return 0;
    } finally {
      fs.rmSync(temp, { recursive: true, force: true });
    }
  }
  const dir = buildPlugin(root);
  console.log("Built " + path.relative(root, dir) + " (" + listFiles(dir).length + " files) and .agents/plugins/marketplace.json");
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}

