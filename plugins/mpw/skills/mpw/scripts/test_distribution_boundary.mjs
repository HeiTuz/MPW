#!/usr/bin/env node
// Verify the real npm archive -> plugin -> contract/compiler consumer boundary.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { buildPlugin, listFiles, validatePlugin } from "./build_plugin.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-distribution-boundary-"));
const env = { ...process.env, npm_config_cache: path.join(temporary, "npm-cache") };
for (const name of [
  "IMAGE_REFERENCE_ADAPTER_ROOT", "DESIGN_REFERENCE_ADAPTER_ROOT",
  "HIGGSFIELD_BRIDGE_ROOT", "PROMPT_KNOWLEDGE_ADAPTER_ROOT",
  "MASTER_PROMPT_CONTRACT_ROOT", "MASTER_PROMPT_COMPILER_ROOT",
  "MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION",
]) delete env[name];

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, encoding: "utf8", timeout: 120000 });
  assert.equal(result.status, 0, `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}

function assertNoLegacy(files, label) {
  assert.equal(files.some((name) => name.startsWith("tools/") || name.includes("test_adapter_master_integration.py")),
    false, `${label} ships unsupported legacy diagnostics`);
}

try {
  const [manifest] = JSON.parse(run("npm", ["pack", "--json", "--pack-destination", temporary]));
  assertNoLegacy(manifest.files.map((file) => file.path), "npm archive");
  run("tar", ["-xzf", path.join(temporary, manifest.filename), "-C", temporary]);
  const packedRoot = path.join(temporary, "package");
  const plugin = buildPlugin(path.join(temporary, "build"), { sourceRoot: packedRoot });
  const validation = validatePlugin(plugin, { sourceRoot: packedRoot });
  assert.deepEqual(validation.problems, [], validation.problems.join("\n"));
  const payload = path.join(plugin, "skills/mpw");
  assertNoLegacy(listFiles(payload), "plugin payload");

  // Preserve every canonical contract byte, not just a selected fixture/schema.
  const contractFiles = ["manifest.json", ...Object.keys(JSON.parse(fs.readFileSync(path.join(root, "contracts/manifest.json"), "utf8")).files)];
  for (const relative of contractFiles) {
    const expected = fs.readFileSync(path.join(root, "contracts", relative));
    assert.deepEqual(fs.readFileSync(path.join(payload, "contracts", relative)), expected, `changed or omitted contract ${relative}`);
  }

  // Run the actual supported compiler and schema suites in the distributed tree.
  // No fake external implementation can make these consumer checks pass.
  const compilers = fs.readdirSync(path.join(root, "scripts")).filter((name) => /^compile_.*\.py$/u.test(name)).sort();
  assert.ok(compilers.length > 0, "no core compilers discovered");
  const coreTests = ["test_contracts.py", ...compilers.map((name) => `test_${name}`)];
  for (const name of compilers) {
    assert.deepEqual(fs.readFileSync(path.join(payload, "scripts", name)), fs.readFileSync(path.join(root, "scripts", name)));
  }
  for (const name of coreTests) {
    run("python3", [path.join("scripts", name)], payload);
  }
  run(process.execPath, ["scripts/check_prompt.mjs", "--test"], payload);
  console.log(`distribution boundary: npm/plugin exclude legacy tools; ${contractFiles.length} contract files and ${coreTests.length} real core suites OK`);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
