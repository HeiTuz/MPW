#!/usr/bin/env node
// mpw update: runs each installed host's refresh + update commands, skips hosts without the plugin,
// and fails when a host command fails. Host CLIs are fakes on PATH that log their arguments.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cli = path.join(path.dirname(fileURLToPath(import.meta.url)), "mpw.mjs");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-cli-"));

function setup({ claudeInstalled = true, claudeFails = false } = {}) {
  const home = fs.mkdtempSync(path.join(temporary, "home-"));
  const bin = path.join(home, "bin");
  const log = path.join(home, "calls.log");
  const codexCache = path.join(home, ".codex", "plugins", "cache", "heituz", "mpw");
  fs.mkdirSync(path.join(codexCache, "3.2.2"), { recursive: true });
  fs.mkdirSync(bin);
  if (claudeInstalled) {
    const installPath = path.join(home, ".claude", "plugins", "cache", "heituz", "mpw", "3.2.2");
    fs.mkdirSync(installPath, { recursive: true });
    fs.writeFileSync(path.join(home, ".claude", "plugins", "installed_plugins.json"),
      JSON.stringify({ plugins: { "mpw@heituz": [{ scope: "user", installPath }] } }));
  }
  const fake = (name, body) => fs.writeFileSync(path.join(bin, name),
    "#!/bin/sh\necho \"" + name + " $*\" >> '" + log + "'\n" + body + "\nexit 0\n", { mode: 0o755 });
  fake("codex", "[ \"$1 $2\" = \"plugin add\" ] && mkdir -p '" + path.join(codexCache, "3.3.0") + "'");
  fake("claude", claudeFails ? "[ \"$2\" = update ] && [ \"$1\" = plugin ] && exit 1" : ":");
  return { home, log, env: { ...process.env, HOME: home, CODEX_HOME: path.join(home, ".codex"), PATH: bin + path.delimiter + process.env.PATH } };
}

function run(context, args) {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8", env: context.env });
  const calls = fs.existsSync(context.log) ? fs.readFileSync(context.log, "utf8").trim().split("\n").filter((line) => !line.endsWith("--version")) : [];
  return { ...result, calls };
}

try {
  let context = setup();
  let result = run(context, ["update"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [
    "codex plugin marketplace upgrade heituz",
    "codex plugin add mpw@heituz",
    "claude plugin marketplace update heituz",
    "claude plugin update mpw@heituz",
  ]);
  assert.match(result.stdout, /Codex: 3\.2\.2 -> 3\.3\.0/u);
  assert.match(result.stdout, /Claude Code: 이미 최신 3\.2\.2/u);

  context = setup();
  result = run(context, ["update", "--codex", "--dry-run"]);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [], "dry run must not call host update commands");
  assert.match(result.stdout, /\$ codex plugin add mpw@heituz/u);
  assert.doesNotMatch(result.stdout, /claude plugin/u);

  context = setup({ claudeInstalled: false });
  result = run(context, ["update"]);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(!result.calls.some((line) => line.startsWith("claude plugin")), "uninstalled host must be skipped");
  assert.match(result.stdout, /Claude Code: mpw@heituz가 설치돼 있지 않아 건너뜁니다/u);

  context = setup({ claudeFails: true });
  result = run(context, ["update"]);
  assert.equal(result.status, 1, "a failed host update must exit 1");
  assert.match(result.stderr, /실패: claude plugin update mpw@heituz/u);

  assert.equal(run(setup(), ["update", "--bogus"]).status, 2);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
console.log("mpw update runs installed hosts, skips missing installs, and reports failures");
