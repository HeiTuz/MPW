#!/usr/bin/env node
// Exercise the actual runner in an isolated checkout, without external sources.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-test-runner-"));
const externalVariables = [
  "IMAGE_REFERENCE_ADAPTER_ROOT", "DESIGN_REFERENCE_ADAPTER_ROOT",
  "HIGGSFIELD_BRIDGE_ROOT", "PROMPT_KNOWLEDGE_ADAPTER_ROOT",
  "MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION",
];

function write(relative, contents) {
  const filename = path.join(temporary, relative);
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  fs.writeFileSync(filename, contents);
}

function run(overrides = {}) {
  const env = { ...process.env };
  for (const variable of externalVariables) delete env[variable];
  return spawnSync(process.execPath, [path.join(temporary, "scripts/run_tests.mjs")], {
    // The runner must resolve its own checkout instead of inheriting this cwd.
    cwd: os.tmpdir(), encoding: "utf8", env: { ...env, ...overrides }, timeout: 30000,
  });
}

function assertPass(result) {
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Supported MPW suite \(legacy external integrations excluded\)/u);
  assert.match(result.stdout, /^PASS$/mu);
  assert.match(result.stdout, /^summary failed=0$/mu);
  assert.doesNotMatch(result.stdout + result.stderr, /NOT RUN|opt-out|SHOULD_NOT_RUN/u);
}

try {
  fs.mkdirSync(path.join(temporary, "scripts"));
  fs.copyFileSync(path.join(root, "scripts/run_tests.mjs"), path.join(temporary, "scripts/run_tests.mjs"));
  write("scripts/test_00_python.py", 'print("PYTHON_RAN")\n');
  write("scripts/test_01_python.py", 'print("LATER_PYTHON_RAN")\n');
  write("scripts/test_00_node.mjs", 'console.log("NODE_RAN");\n');
  write("scripts/test_01_node.mjs", 'console.log("LATER_NODE_RAN");\n');
  write("scripts/check_prompt.mjs", 'import assert from "node:assert/strict";\nassert.deepEqual(process.argv.slice(2), ["--test"]);\nconsole.log("CHECKER_RAN");\n');
  write("scripts/not_a_test.py", 'raise RuntimeError("SHOULD_NOT_RUN")\n');
  write("scripts/fixtures/test_nested.py", 'raise RuntimeError("SHOULD_NOT_RUN")\n');
  write("tools/legacy/test_adapter_master_integration.py", 'raise RuntimeError("SHOULD_NOT_RUN")\n');

  let result = run();
  assertPass(result);
  for (const marker of ["PYTHON_RAN", "LATER_PYTHON_RAN", "NODE_RAN", "LATER_NODE_RAN", "CHECKER_RAN"]) {
    assert.ok(result.stdout.includes(marker), `test discovery missed ${marker}`);
  }
  assert.ok(result.stdout.indexOf("LATER_PYTHON_RAN") < result.stdout.indexOf("NODE_RAN"));
  assert.ok(result.stdout.indexOf("LATER_NODE_RAN") < result.stdout.indexOf("CHECKER_RAN"));

  // Stale, partial, and complete legacy configuration cannot change suite scope.
  assertPass(run({ IMAGE_REFERENCE_ADAPTER_ROOT: path.join(temporary, "missing-image") }));
  assertPass(run(Object.fromEntries(externalVariables.map((name) => [name, "missing"]))));
  assertPass(run({ MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION: "0" }));
  assertPass(run({ MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION: "1" }));

  // Every failure is retained, including a failing validator after passing tests.
  write("scripts/test_00_python.py", 'import sys\nprint("PYTHON_FAILED")\nsys.exit(3)\n');
  write("scripts/test_00_node.mjs", 'console.log("NODE_FAILED"); process.exit(4);\n');
  write("scripts/check_prompt.mjs", 'console.log("CHECKER_FAILED"); process.exit(5);\n');
  result = run();
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /^FAIL$/mu);
  assert.match(result.stdout, /summary failed=3 \(test_00_python.py, test_00_node.mjs, check_prompt.mjs --test\)/u);
  for (const marker of ["PYTHON_FAILED", "LATER_PYTHON_RAN", "NODE_FAILED", "LATER_NODE_RAN", "CHECKER_FAILED"]) {
    assert.ok(result.stdout.includes(marker), `runner stopped before ${marker}`);
  }

  // A process that cannot start must fail the suite, not become a green skip.
  write("scripts/test_00_node.mjs", 'console.log("NODE_RAN");\n');
  write("scripts/check_prompt.mjs", 'console.log("CHECKER_RAN");\n');
  result = run({ PATH: path.join(temporary, "no-executables") });
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /summary failed=2 \(test_00_python.py, test_01_python.py\)/u);
  assert.match(result.stdout, /LATER_NODE_RAN/u);
  assert.match(result.stdout, /CHECKER_RAN/u);
  console.log("supported test runner: discovery, legacy isolation, and failure aggregation OK");
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
