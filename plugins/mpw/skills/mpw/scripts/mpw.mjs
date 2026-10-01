#!/usr/bin/env node
// mpw — terminal helper for the installed mpw@heituz plugin.
//
//   mpw update [--codex] [--claude] [--dry-run]   refresh the heituz marketplace and update mpw@heituz
//   mpw version                                   show the installed mpw@heituz version per host
//
// Only hosts whose CLI is on PATH and that already have mpw@heituz installed are touched.
// Exit codes: 0 ok (including nothing to update), 1 a host update failed, 2 bad arguments.
import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { codexPluginRoot, claudePluginRoot, MARKETPLACE } from "./check_install_parity.mjs";
import { PLUGIN_NAME } from "./build_plugin.mjs";

const PLUGIN_ID = PLUGIN_NAME + "@" + MARKETPLACE;
const HOSTS = {
  codex: {
    label: "Codex",
    bin: "codex",
    root: () => codexPluginRoot(process.env.CODEX_HOME || path.join(os.homedir(), ".codex")),
    steps: [["plugin", "marketplace", "upgrade", MARKETPLACE], ["plugin", "add", PLUGIN_ID]],
    install: "codex plugin marketplace add HeiTuz/heituz-plugins && codex plugin add " + PLUGIN_ID,
    apply: "새 Codex 세션부터 적용됩니다.",
  },
  claude: {
    label: "Claude Code",
    bin: "claude",
    root: () => claudePluginRoot(path.join(os.homedir(), ".claude")),
    steps: [["plugin", "marketplace", "update", MARKETPLACE], ["plugin", "update", PLUGIN_ID]],
    install: "claude plugin marketplace add HeiTuz/heituz-plugins && claude plugin install " + PLUGIN_ID,
    apply: "Claude Code를 재시작하면 적용됩니다.",
  },
};

const USAGE = `Usage:
  mpw update [--codex] [--claude] [--dry-run]
  mpw version
  mpw help

update   heituz 마켓플레이스를 새로 고치고 설치된 ${PLUGIN_ID}를 최신 버전으로 갱신합니다.
         호스트를 지정하지 않으면 설치된 Codex·Claude Code를 모두 갱신합니다.
--dry-run 실행할 명령만 보여 줍니다.`;

function fail(message) {
  console.error("mpw: " + message);
  console.error(USAGE);
  return 2;
}

function hasCli(bin) {
  const probe = spawnSync(bin, ["--version"], { encoding: "utf8" });
  return !probe.error && probe.status === 0;
}

function installedVersion(host) {
  const root = HOSTS[host].root();
  return root ? path.basename(root) : null;
}

function version() {
  for (const [name, host] of Object.entries(HOSTS)) {
    console.log(host.label + ": " + (installedVersion(name) || "설치 안 됨"));
  }
  return 0;
}

function update(flags) {
  const selected = Object.keys(HOSTS).filter((name) => flags.has("--" + name));
  const targets = selected.length ? selected : Object.keys(HOSTS);
  const dryRun = flags.has("--dry-run");
  let failed = false;
  let updated = 0;
  for (const name of targets) {
    const host = HOSTS[name];
    if (!hasCli(host.bin)) {
      console.log(host.label + ": " + host.bin + " CLI가 없어 건너뜁니다.");
      continue;
    }
    const before = installedVersion(name);
    if (!before) {
      console.log(host.label + ": " + PLUGIN_ID + "가 설치돼 있지 않아 건너뜁니다. 설치: " + host.install);
      continue;
    }
    console.log(host.label + ": " + before + (dryRun ? " 갱신 예정" : " 갱신 중"));
    let ok = true;
    for (const args of host.steps) {
      console.log("  $ " + [host.bin, ...args].join(" "));
      if (dryRun) continue;
      const result = spawnSync(host.bin, args, { stdio: "inherit" });
      if (result.error || result.status !== 0) {
        console.error("  실패: " + [host.bin, ...args].join(" ") + " (exit " + (result.error ? result.error.code : result.status) + ")");
        ok = false;
        break;
      }
    }
    if (!ok) {
      failed = true;
      continue;
    }
    if (dryRun) continue;
    updated += 1;
    const after = installedVersion(name) || "확인 불가";
    console.log(host.label + ": " + (after === before ? "이미 최신 " + after : before + " -> " + after) + ". " + host.apply);
  }
  if (!dryRun && !updated && !failed) console.log("갱신할 설치본이 없습니다.");
  return failed ? 1 : 0;
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...rest] = argv;
  if (!command || command === "help" || command === "-h" || command === "--help") {
    console.log(USAGE);
    return command ? 0 : 2;
  }
  const known = new Set(["--codex", "--claude", "--dry-run"]);
  const unknown = rest.find((flag) => !known.has(flag));
  if (command === "update") {
    if (unknown) return fail("unknown flag: " + unknown);
    return update(new Set(rest));
  }
  if (command === "version") {
    if (rest.length) return fail("unknown flag: " + rest[0]);
    return version();
  }
  return fail("unknown command: " + command);
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
