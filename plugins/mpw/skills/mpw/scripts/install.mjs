#!/usr/bin/env node
// MPW skill payload builder and legacy CLI entry point.
//
// Since v3.0.0 MPW ships as the plugin mpw@heituz from the HeiTuz marketplace
// (https://github.com/HeiTuz/heituz-plugins). This module keeps two jobs:
//   1. installPayload(): materialize the plugin skill payload (canonical tree + agents/plugin overlay).
//      scripts/build_plugin.mjs and scripts/check_install_parity.mjs build on it.
//   2. The heituzmpw CLI: "--dest <path>" copies that payload into an explicit directory.
//      Host targets (--target claude|codex|gpt|hermes|all|auto) were removed; without --dest the CLI
//      prints plugin install guidance and exits 0 so older callers do not break.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
export const PAYLOAD_HOST = "plugin";

export const PLUGIN_GUIDANCE = [
  "MPW is distributed as the plugin mpw@heituz (https://github.com/HeiTuz/heituz-plugins).",
  "  Codex:       codex plugin marketplace add HeiTuz/heituz-plugins && codex plugin add mpw@heituz",
  "  Claude Code: claude plugin marketplace add HeiTuz/heituz-plugins && claude plugin install mpw@heituz",
  "  ChatGPT:     workspace admins import https://github.com/HeiTuz/heituz-plugins under Workspace settings > Plugins",
  "To copy the skill folder into another location, pass --dest <path>.",
].join("\n");

function usage(exitCode = 0) {
  const out = exitCode === 0 ? console.log : console.error;
  out(`MPW skill payload installer

${PLUGIN_GUIDANCE}

Usage:
  bunx --package github:HeiTuz/MPW heituzmpw -- --dest /custom/skills/MPW
  node scripts/install.mjs --dest /custom/skills/MPW

Options:
  --dest <path>   Copy the plugin skill payload into an explicit directory.
  --force         Replace an existing destination.
  --quiet         Print only errors.
  -h, --help      Show this help.
`);
  process.exit(exitCode);
}

export function parseArgs(argv) {
  const opts = { dest: null, force: false, quiet: false, legacyTarget: null };
  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i];
    if (argument === "-h" || argument === "--help") usage(0);
    if (argument === "--") continue;
    if (argument === "--force") { opts.force = true; continue; }
    if (argument === "--quiet") { opts.quiet = true; continue; }
    if (argument === "--target") {
      if (!argv[i + 1]) usage(2);
      opts.legacyTarget = argv[++i];
      continue;
    }
    if (argument.startsWith("--target=")) {
      opts.legacyTarget = argument.slice("--target=".length);
      continue;
    }
    if (argument === "--dest") {
      if (!argv[i + 1]) usage(2);
      opts.dest = argv[++i];
      continue;
    }
    if (argument.startsWith("--dest=")) {
      opts.dest = argument.slice("--dest=".length);
      continue;
    }
    console.error(`Unknown argument: ${argument}`);
    usage(2);
  }
  return opts;
}

function isEmptyDir(candidate) {
  return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory() && fs.readdirSync(candidate).length === 0;
}

export const ALLOWED_INSTALL_ROOTS = new Set([
  "AGENTS.md", "LICENSE", "README.md", "SKILL.md", "package.json",
  "agents", "contracts", "examples", "references", "scripts",
]);

const EXCLUDED_PARTS = new Set([".git", "node_modules", ".gjc", ".omx", "__pycache__", "docs-internal"]);

function isLocalStatePart(part) {
  return EXCLUDED_PARTS.has(part) || part.startsWith(".") ||
    /(?:\.pyc|\.bak(?:[.-].*)?|\.orig|\.rej|\.save|~)$/u.test(part);
}

export function shouldSkip(rel) {
  const parts = rel.split(path.sep);
  if (!ALLOWED_INSTALL_ROOTS.has(parts[0])) return true;
  if (parts[0] === "agents") return true;
  return parts.some(isLocalStatePart) ||
    rel === "package-lock.json" ||
    rel === "bun.lockb" ||
    rel === "bun.lock";
}

function copyCanonicalTree(current, destination, sourceRoot) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const from = path.join(current, entry.name);
    const rel = path.relative(sourceRoot, from);
    if (shouldSkip(rel)) continue;
    const to = path.join(destination, rel);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyCanonicalTree(from, destination, sourceRoot);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      fs.chmodSync(to, fs.statSync(from).mode & 0o777);
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(from);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      try { fs.symlinkSync(link, to); } catch (error) {
        if (error.code !== "EEXIST") throw error;
      }
    }
  }
}

function overlayEntryIsSafe(relative) {
  const parts = relative.split(path.sep);
  return !parts.some(isLocalStatePart);
}

function copyOverlayTree(current, destination, overlayRoot) {
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const from = path.join(current, entry.name);
    const rel = path.relative(overlayRoot, from);
    if (!overlayEntryIsSafe(rel)) continue;
    const to = path.join(destination, rel);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      copyOverlayTree(from, destination, overlayRoot);
    } else if (entry.isFile()) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
      fs.chmodSync(to, fs.statSync(from).mode & 0o777);
    }
  }
}

function validateOverlay(sourceRoot, host) {
  const overlay = path.join(sourceRoot, "agents", host);
  if (!fs.existsSync(overlay) || !fs.statSync(overlay).isDirectory()) {
    throw new Error(`Install source is missing the ${host} overlay`);
  }
  if (!fs.existsSync(path.join(overlay, "SKILL.md"))) {
    throw new Error(`Install source is missing agents/${host}/SKILL.md`);
  }
  const allowed = new Set(["AGENTS.md", "README.md", "SKILL.md"]);
  for (const entry of fs.readdirSync(overlay)) {
    if (!overlayEntryIsSafe(entry)) continue;
    if (!allowed.has(entry)) throw new Error(`Unsupported ${host} overlay entry: ${entry}`);
  }
  return overlay;
}

function countSkillEntries(directory) {
  let count = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const candidate = path.join(directory, entry.name);
    if (entry.isDirectory()) count += countSkillEntries(candidate);
    else if (entry.isFile() && entry.name === "SKILL.md") count += 1;
  }
  return count;
}

// host=null copies only the canonical tree (tests use this); the default applies agents/plugin.
export function installPayload({ sourceRoot = root, destination, host = PAYLOAD_HOST }) {
  fs.mkdirSync(destination, { recursive: true });
  copyCanonicalTree(sourceRoot, destination, sourceRoot);
  const overlay = host ? validateOverlay(sourceRoot, host) : null;
  if (overlay) copyOverlayTree(overlay, destination, overlay);
  if (fs.existsSync(path.join(destination, "agents"))) {
    throw new Error(`Install verification failed: agents/ must not appear in ${destination}`);
  }
  if (!fs.existsSync(path.join(destination, "SKILL.md"))) {
    throw new Error(`Install verification failed: SKILL.md missing in ${destination}`);
  }
  if (countSkillEntries(destination) !== 1) {
    throw new Error(`Install verification failed: expected exactly one SKILL.md in ${destination}`);
  }
}

function expandDestination(value, homeDir) {
  if (value === "~") return homeDir;
  if (value.startsWith("~/") || value.startsWith("~\\")) return path.join(homeDir, value.slice(2));
  return value;
}

function physicalPath(value) {
  let existing = path.resolve(value);
  const missing = [];
  while (!fs.existsSync(existing)) {
    missing.unshift(path.basename(existing));
    const parent = path.dirname(existing);
    if (parent === existing) break;
    existing = parent;
  }
  return path.resolve(fs.realpathSync(existing), ...missing);
}

function pathsOverlap(left, right) {
  const a = physicalPath(left);
  const b = physicalPath(right);
  return a === b || a.startsWith(b + path.sep) || b.startsWith(a + path.sep);
}

export function validateDestination(destination, homeDir, sourceRoot = root) {
  const resolved = physicalPath(destination);
  const filesystemRoot = path.parse(resolved).root;
  const protectedContainers = [
    ".claude", path.join(".claude", "skills"), path.join(".claude", "plugins"),
    ".codex", path.join(".codex", "skills"), path.join(".codex", "plugins"),
    ".agents", path.join(".agents", "skills"), path.join(".agents", "plugins"),
    ".hermes", path.join(".hermes", "skills"),
    ".gjc", path.join(".gjc", "agent"), path.join(".gjc", "agent", "skills"),
  ].map((relative) => physicalPath(path.resolve(homeDir, relative)));
  if (resolved === filesystemRoot || path.dirname(resolved) === filesystemRoot) {
    throw new Error(`Refusing unsafe install destination: ${resolved}`);
  }
  if (resolved === physicalPath(homeDir) || protectedContainers.includes(resolved) || pathsOverlap(resolved, sourceRoot)) {
    throw new Error(`Refusing unsafe install destination: ${resolved}`);
  }
}

export function installToDestination(destination, { sourceRoot = root, force = false, homeDir = os.homedir() } = {}) {
  validateDestination(destination, homeDir, sourceRoot);
  if (fs.existsSync(destination) && !isEmptyDir(destination) && !force) {
    throw new Error(`Destination already exists and is not empty: ${destination}\nUse --force to replace it.`);
  }
  const parent = path.dirname(destination);
  fs.mkdirSync(parent, { recursive: true });
  const stageRoot = fs.mkdtempSync(path.join(parent, ".heituzmpw-stage-"));
  const payload = path.join(stageRoot, "payload");
  const backup = `${destination}.heituzmpw-backup-${process.pid}-${Date.now()}`;
  try {
    installPayload({ sourceRoot, destination: payload });
    const hadDestination = fs.existsSync(destination);
    if (hadDestination) fs.renameSync(destination, backup);
    try {
      fs.renameSync(payload, destination);
    } catch (error) {
      if (hadDestination) fs.renameSync(backup, destination);
      throw error;
    }
    if (hadDestination) fs.rmSync(backup, { recursive: true, force: true });
  } finally {
    fs.rmSync(stageRoot, { recursive: true, force: true });
  }
}

export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const homeDir = os.homedir();
  if (opts.legacyTarget && !opts.quiet) {
    console.warn(`MPW installer: --target ${opts.legacyTarget} is no longer supported; host skill installs were replaced by the mpw@heituz plugin.`);
  }
  if (!opts.dest) {
    console.log(PLUGIN_GUIDANCE);
    return;
  }
  const destination = path.resolve(expandDestination(opts.dest, homeDir));
  installToDestination(destination, { force: opts.force, homeDir });
  if (!opts.quiet) console.log(`Installed MPW skill payload -> ${destination}`);
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
  }
}

if (isMainModule()) {
  main().catch((error) => {
    console.error(`MPW installer: ${error.message}`);
    process.exitCode = 1;
  });
}
