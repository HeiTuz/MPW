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
  if (name === "test_adapter_master_integration.py") continue;
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

const failed = [];
for (const step of steps) {
  console.log(`--- ${step.name}`);
  const result = spawnSync(step.command, step.args, { cwd: root, stdio: "inherit", env: process.env });
  if ((result.status ?? 1) !== 0) failed.push(step.name);
}

console.log("--- test_adapter_master_integration.py");
const integrationEnv = {
  ...process.env,
  MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION: process.env.MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION || "1",
};
const integration = spawnSync("python3", ["scripts/test_adapter_master_integration.py"], {
  cwd: root,
  encoding: "utf8",
  env: integrationEnv,
});
if (integration.stdout) process.stdout.write(integration.stdout);
if (integration.stderr) process.stderr.write(integration.stderr);
const notRun = /EXTERNAL INTEGRATION NOT RUN/.test(`${integration.stdout}\n${integration.stderr}`);
if ((integration.status ?? 1) !== 0) failed.push("test_adapter_master_integration.py");

console.log(failed.length ? "FAIL" : "PASS");
console.log(`summary failed=${failed.length}${failed.length ? ` (${failed.join(", ")})` : ""}`);
if (notRun) console.log("external integration NOT RUN");
process.exit(failed.length ? 1 : 0);
