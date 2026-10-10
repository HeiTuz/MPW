#!/usr/bin/env node
// Compare installed mpw@heituz plugin caches with a fresh build of this tree.
//
//   node scripts/check_install_parity.mjs [--target all|codex|claude] [--json] [--out <file>]
//                                         [--home <dir>] [--codex-home <dir>] [--claude-home <dir>]
//                                         [--changed-since <rev>]
// Exit codes: 0 all match, 1 mismatch, 2 not installed / unreadable / bad arguments.
// Host runtime lock files (.in_use/) are reported under "runtime" and never count as a mismatch.
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildPlugin, PLUGIN_NAME } from "./build_plugin.mjs";
import { shouldSkip } from "./install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOSTS = ["codex", "claude"];
export const MARKETPLACE = "heituz";

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function walkRel(dir) {
  const out = [];
  function rec(current, rel) {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const nextRel = rel ? rel + "/" + entry.name : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) rec(full, nextRel);
      else out.push(nextRel);
    }
  }
  rec(dir, "");
  return out.sort();
}

function treeHashes(dir) {
  const files = {};
  for (const rel of walkRel(dir)) files[rel] = sha256File(path.join(dir, ...rel.split("/")));
  return files;
}

// Host runtime bookkeeping inside an installed cache (Claude Code's .in_use/<pid> lock files) is not payload.
export function isHostRuntimeEntry(rel) {
  return /^\.in_use(?:\/|$)/u.test(rel);
}

export function compareTrees(expectedDir, actualDir) {
  const expected = treeHashes(expectedDir);
  const actual = treeHashes(actualDir);
  const missing = Object.keys(expected).filter((key) => !(key in actual)).sort();
  const runtime = Object.keys(actual).filter((key) => !(key in expected) && isHostRuntimeEntry(key)).sort();
  const extra = Object.keys(actual).filter((key) => !(key in expected) && !isHostRuntimeEntry(key)).sort();
  const changed = Object.keys(expected).filter((key) => key in actual && expected[key] !== actual[key]).sort();
  return { files: Object.keys(expected).length, missing, extra, changed, runtime };
}

function versionKey(value) {
  return value.split(/[.+-]/u).map((part) => (/^\d+$/u.test(part) ? part.padStart(8, "0") : part)).join(".");
}

// Codex keeps plugin caches under <CODEX_HOME>/plugins/cache/<marketplace>/<plugin>/<version>.
export function codexPluginRoot(codexHome) {
  const base = path.join(codexHome, "plugins", "cache", MARKETPLACE, PLUGIN_NAME);
  if (!fs.existsSync(base)) return null;
  const versions = fs.readdirSync(base, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (!versions.length) return null;
  versions.sort((a, b) => versionKey(a).localeCompare(versionKey(b)));
  return path.join(base, versions[versions.length - 1]);
}

// Claude Code records the active cache in <CLAUDE_HOME>/plugins/installed_plugins.json.
export function claudePluginRoot(claudeHome) {
  const registry = path.join(claudeHome, "plugins", "installed_plugins.json");
  if (!fs.existsSync(registry)) return null;
  const entries = JSON.parse(fs.readFileSync(registry, "utf8")).plugins?.[PLUGIN_NAME + "@" + MARKETPLACE];
  const entry = Array.isArray(entries) ? entries.find((item) => item.scope === "user") || entries[0] : null;
  return entry?.installPath && fs.existsSync(entry.installPath) ? entry.installPath : null;
}

export function runtimePayloadChangedSince(rev, sourceRoot = root) {
  const listed = spawnSync("git", ["diff", "--name-only", rev + "..HEAD"], { cwd: sourceRoot, encoding: "utf8" });
  if (listed.status !== 0) throw new Error(listed.stderr || listed.stdout || "git diff failed for " + rev);
  return listed.stdout.split("\n").filter(Boolean).filter((rel) => {
    if (!shouldSkip(rel)) return true;
    return /^agents\/plugin\/(SKILL|AGENTS|README)\.md$/u.test(rel) || rel === "assets/plugin-icon.png";
  });
}

export function untrackedShipped(sourceRoot = root) {
  const listed = spawnSync("git", ["ls-files", "-z", "--others", "--exclude-standard"], { cwd: sourceRoot, encoding: "utf8" });
  if (listed.status !== 0) return [];
  return listed.stdout.split("\0").filter(Boolean).filter((rel) => !shouldSkip(rel));
}

function parseArgs(argv) {
  const home = os.homedir();
  const opts = { target: "all", json: false, out: null, changedSince: null, home, codexHome: null, claudeHome: null };
  const takes = { "--target": "target", "--out": "out", "--changed-since": "changedSince", "--home": "home", "--codex-home": "codexHome", "--claude-home": "claudeHome" };
  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i];
    if (argument === "--json") { opts.json = true; continue; }
    const [flag, inline] = argument.includes("=") ? [argument.slice(0, argument.indexOf("=")), argument.slice(argument.indexOf("=") + 1)] : [argument, null];
    if (flag in takes) {
      const value = inline ?? argv[++i];
      if (!value) throw new Error("missing " + flag + " value");
      opts[takes[flag]] = value;
      continue;
    }
    throw new Error("unknown flag: " + argument);
  }
  const target = String(opts.target).toLowerCase();
  if (target === "all") opts.hosts = HOSTS.slice();
  else if (target === "gpt") opts.hosts = ["codex"];
  else if (HOSTS.includes(target)) opts.hosts = [target];
  else throw new Error("unknown target: " + opts.target);
  opts.codexHome ||= process.env.CODEX_HOME || path.join(opts.home, ".codex");
  opts.claudeHome ||= path.join(opts.home, ".claude");
  return opts;
}

export function checkInstallParity({ hosts = HOSTS, codexHome, claudeHome, sourceRoot = root } = {}) {
  const expectedRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-parity-"));
  try {
    const expected = buildPlugin(expectedRoot, { sourceRoot });
    return hosts.map((host) => {
      let destination = null;
      try {
        destination = host === "codex" ? codexPluginRoot(codexHome) : claudePluginRoot(claudeHome);
      } catch (error) {
        return { host, destination, status: "unreadable", error: String(error.message || error), files: 0, missing: [], extra: [], changed: [] };
      }
      if (!destination) return { host, destination, status: "not_installed", files: 0, missing: [], extra: [], changed: [] };
      const diff = compareTrees(expected, destination);
      const status = diff.missing.length || diff.extra.length || diff.changed.length ? "mismatch" : "match";
      return { host, destination, status, ...diff };
    });
  } finally {
    fs.rmSync(expectedRoot, { recursive: true, force: true });
  }
}

function main(argv = process.argv.slice(2)) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    console.error(error.message || error);
    process.exit(2);
  }
  const hosts = checkInstallParity({ hosts: opts.hosts, codexHome: opts.codexHome, claudeHome: opts.claudeHome });
  const shipped = untrackedShipped(root);
  let payloadChanged = [];
  if (opts.changedSince) {
    try {
      payloadChanged = runtimePayloadChangedSince(opts.changedSince, root);
    } catch (error) {
      console.error(error.message || error);
      process.exit(2);
    }
  }
  const report = { hosts, untracked_shipped: shipped, runtime_payload_changed: payloadChanged };
  const text = JSON.stringify(report, null, 2);
  if (opts.out) fs.writeFileSync(opts.out, text + "\n");
  if (opts.json) console.log(text);
  if (!opts.json) {
    for (const host of hosts) {
      const delta = [...host.missing, ...host.extra, ...host.changed];
      console.log(host.host + "\t" + host.status + "\t" + (host.destination || "-") + "\t" + (delta.length ? delta.join(",") : "-") + (host.runtime?.length ? "\truntime:" + host.runtime.join(",") : ""));
    }
    if (shipped.length) console.warn("untracked_shipped\t" + shipped.join(","));
    if (opts.changedSince) console.log("runtime_payload_changed\t" + (payloadChanged.length ? payloadChanged.join(",") : "no"));
  }
  if (hosts.some((host) => host.status === "not_installed" || host.status === "unreadable")) process.exit(2);
  if (hosts.some((host) => host.status === "mismatch")) process.exit(1);
  process.exit(0);
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) main();
