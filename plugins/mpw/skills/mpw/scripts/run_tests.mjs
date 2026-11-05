#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scriptsDir = path.join(root, "scripts");

function listed(prefix, suffix) {
  return fs.readdirSync(scriptsDir).filter((name) => name.startsWith(prefix) && name.endsWith(suffix)).sort();
}

const steps = [];
for (const name of listed("test_", ".py")) {
  steps.push({ name, command: "python3", args: [path.join("scripts", name)] });
}
for (const name of listed("test_", ".mjs")) {
  steps.push({ name, command: process.execPath, args: [path.join("scripts", name)] });
}
steps.push({
  name: "check_prompt.mjs --test",
  command: process.execPath,
  args: [path.join("scripts", "check_prompt.mjs"), "--test"],
});

// This suite covers the supported MPW tree. Historical external diagnostics
// live in tools/legacy and are intentionally outside scripts/ discovery.
console.log("Supported MPW suite (legacy external integrations excluded)");
const failed = [];
for (const step of steps) {
  console.log(`--- ${step.name}`);
  const result = spawnSync(step.command, step.args, { cwd: root, stdio: "inherit", env: process.env });
  if ((result.status ?? 1) !== 0) failed.push(step.name);
}

console.log(failed.length ? "FAIL" : "PASS");
console.log(`summary failed=${failed.length}${failed.length ? ` (${failed.join(", ")})` : ""}`);
process.exit(failed.length ? 1 : 0);
