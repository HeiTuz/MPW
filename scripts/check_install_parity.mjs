#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  destinationForTarget,
  installPayload,
  shouldSkip,
} from "./install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOSTS = ["claude", "codex", "hermes"];

function sha256File(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function walkRel(dir) {
  const out = [];
  function rec(current, rel) {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const nextRel = rel ? `${rel}/${entry.name}` : entry.name;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) rec(full, nextRel);
      else out.push(nextRel.split(path.sep).join("/"));
    }
  }
  rec(dir, "");
  return out.sort();
}

function treeHashes(dir) {
  const files = {};
  for (const rel of walkRel(dir)) {
    files[rel] = sha256File(path.join(dir, ...rel.split("/")));
  }
  return files;
}

export function compareTrees(expectedDir, actualDir) {
  const expected = treeHashes(expectedDir);
  const actual = treeHashes(actualDir);
  const missing = Object.keys(expected).filter((key) => !(key in actual)).sort();
  const extra = Object.keys(actual).filter((key) => !(key in expected)).sort();
  const changed = Object.keys(expected)
    .filter((key) => key in actual && expected[key] !== actual[key])
    .sort();
  return {
    files: Object.keys(expected).length,
    missing,
    extra,
    changed,
    mismatch: changed,
  };
}

export function runtimePayloadChangedSince(rev, sourceRoot = root) {
  const listed = spawnSync("git", ["diff", "--name-only", `${rev}..HEAD`], {
    cwd: sourceRoot,
    encoding: "utf8",
  });
  if (listed.status !== 0) {
    throw new Error(listed.stderr || listed.stdout || `git diff failed for ${rev}`);
  }
  return listed.stdout.split("\n").filter(Boolean).filter((rel) => {
    if (!shouldSkip(rel)) return true;
    return /^agents\/(claude|codex|hermes)\/(SKILL|AGENTS|README)\.md$/.test(rel);
  });
}

export function untrackedShipped(sourceRoot = root) {
  const listed = spawnSync("git", ["ls-files", "-z", "--others", "--exclude-standard"], {
    cwd: sourceRoot,
    encoding: "utf8",
  });
  if (listed.status !== 0) return [];
  return listed.stdout.split("\0").filter(Boolean).filter((rel) => !shouldSkip(rel));
}

function parseArgs(argv) {
  const opts = {
    home: os.homedir(),
    target: "all",
    json: false,
    dests: {},
    changedSince: null,
    out: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const argument = argv[i];
    if (argument === "--json") {
      opts.json = true;
      continue;
    }
    if (argument === "--home") {
      if (!argv[i + 1]) throw new Error("missing --home value");
      opts.home = argv[++i];
      continue;
    }
    if (argument.startsWith("--home=")) {
      opts.home = argument.slice("--home=".length);
      continue;
    }
    if (argument === "--target") {
      if (!argv[i + 1]) throw new Error("missing --target value");
      opts.target = argv[++i];
      continue;
    }
    if (argument.startsWith("--target=")) {
      opts.target = argument.slice("--target=".length);
      continue;
    }
    if (argument === "--dest") {
      if (!argv[i + 1]) throw new Error("`--dest` needs host=path");
      const spec = argv[++i];
      const eq = spec.indexOf("=");
      if (eq < 1) throw new Error("`--dest` needs host=path");
      opts.dests[spec.slice(0, eq)] = spec.slice(eq + 1);
      continue;
    }
    if (argument.startsWith("--dest=")) {
      const spec = argument.slice("--dest=".length);
      const eq = spec.indexOf("=");
      if (eq < 1) throw new Error("`--dest` needs host=path");
      opts.dests[spec.slice(0, eq)] = spec.slice(eq + 1);
      continue;
    }
    if (argument === "--changed-since") {
      if (!argv[i + 1]) throw new Error("missing --changed-since value");
      opts.changedSince = argv[++i];
      continue;
    }
    if (argument.startsWith("--changed-since=")) {
      opts.changedSince = argument.slice("--changed-since=".length);
      continue;
    }
    if (argument === "--out") {
      if (!argv[i + 1]) throw new Error("missing --out value");
      opts.out = argv[++i];
      continue;
    }
    throw new Error(`unknown flag: ${argument}`);
  }
  const normalized = String(opts.target || "all").toLowerCase();
  if (normalized === "all") opts.hosts = HOSTS.slice();
  else if (normalized === "gpt") opts.hosts = ["codex"];
  else if (HOSTS.includes(normalized)) opts.hosts = [normalized];
  else throw new Error(`unknown target: ${opts.target}`);
  for (const [host, destination] of Object.entries(opts.dests)) {
    if (!HOSTS.includes(host) || !destination) throw new Error("--dest requires a supported host and nonempty path");
  }
  return opts;
}

function reportHost(home, host, destOverride, sourceRoot) {
  const destination = destOverride || destinationForTarget(home, host);
  if (!fs.existsSync(destination)) {
    return { host, destination, status: "not_installed", files: 0, missing: [], extra: [], changed: [], mismatch: [] };
  }
  let actualStat;
  try {
    actualStat = fs.statSync(destination);
  } catch (error) {
    return { host, destination, status: "unreadable", error: String(error.message || error), files: 0, missing: [], extra: [], changed: [], mismatch: [] };
  }
  if (!actualStat.isDirectory()) {
    return { host, destination, status: "unreadable", error: "destination is not a directory", files: 0, missing: [], extra: [], changed: [], mismatch: [] };
  }
  const expectedRoot = fs.mkdtempSync(path.join(os.tmpdir(), `mpw-parity-${host}-`));
  try {
    installPayload({ sourceRoot, destination: expectedRoot, host });
    const diff = compareTrees(expectedRoot, destination);
    const status = (diff.missing.length || diff.extra.length || diff.changed.length) ? "mismatch" : "match";
    return { host, destination, status, ...diff };
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error)) throw error;
    return { host, destination, status: "unreadable", error: error.message, files: 0, missing: [], extra: [], changed: [], mismatch: [] };
  } finally {
    fs.rmSync(expectedRoot, { recursive: true, force: true });
  }
}

export function checkInstallParity(options = {}) {
  const opts = {
    home: options.home || os.homedir(),
    hosts: options.hosts || HOSTS,
    dests: options.dests || {},
    sourceRoot: options.sourceRoot || root,
  };
  return opts.hosts.map((host) => reportHost(opts.home, host, opts.dests[host], opts.sourceRoot));
}

function main(argv = process.argv.slice(2)) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    console.error(error.message || error);
    process.exit(2);
  }
  const hosts = checkInstallParity({
    home: opts.home,
    hosts: opts.hosts,
    dests: opts.dests,
    sourceRoot: root,
  });
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
  const report = {
    hosts,
    untracked_shipped: shipped,
    runtime_payload_changed: payloadChanged,
  };
  const text = JSON.stringify(report, null, 2);
  if (opts.json || opts.out) {
    if (opts.out) fs.writeFileSync(opts.out, `${text}\n`);
    if (opts.json) console.log(text);
  } else {
    for (const host of hosts) {
      const delta = [...host.missing, ...host.extra, ...host.changed];
      console.log(`${host.host}\t${host.status}\t${host.destination}\t${delta.length ? delta.join(",") : "-"}`);
    }
    if (shipped.length) {
      console.warn(`untracked_shipped\t${shipped.join(",")}`);
    }
    if (opts.changedSince) {
      console.log(`runtime_payload_changed\t${payloadChanged.length ? payloadChanged.join(",") : "no"}`);
    }
  }
  const unread = hosts.some((host) => host.status === "not_installed" || host.status === "unreadable");
  const mismatch = hosts.some((host) => host.status === "mismatch");
  if (unread) process.exit(2);
  if (mismatch) process.exit(1);
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

if (isMainModule()) {
  main();
}
