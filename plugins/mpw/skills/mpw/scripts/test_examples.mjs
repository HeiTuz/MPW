#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const examplesDir = path.join(root, "examples");
const validator = path.join(root, "scripts", "check_prompt.mjs");
const examples = fs.readdirSync(examplesDir)
  .filter((name) => name.endsWith(".prompt.txt"))
  .sort();

if (examples.length === 0) {
  console.error("FAIL: no examples/*.prompt.txt files found");
  process.exit(1);
}

for (const name of examples) {
  const file = path.join(examplesDir, name);
  const result = spawnSync(process.execPath, [validator], {
    cwd: root,
    encoding: "utf8",
    input: fs.readFileSync(file, "utf8"),
  });
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    report = null;
  }
  if (result.status !== 0 || report?.ok !== true) {
    console.error(`FAIL ${name}`);
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(1);
  }
  console.log(`PASS ${name}`);
}
