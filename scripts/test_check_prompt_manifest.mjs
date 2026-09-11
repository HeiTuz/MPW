#!/usr/bin/env node
// check_prompt.mjs manifest 회귀 — 선언하지 않은 오류 코드가 fixture를 통과시키지 않아야 한다.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tempDir = mkdtempSync(join(tmpdir(), "mpw-check-prompt-manifest-"));
const manifestPath = join(tempDir, "manifest.json");

try {
  writeFileSync(manifestPath, JSON.stringify([{
    path: "fixtures/bad/weight_high.txt",
    mode: "text",
    expect: { ok: false, codes: [] },
  }]));
  const result = spawnSync(process.execPath, ["scripts/check_prompt.mjs", "--test"], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, MPW_PROMPT_MANIFEST: manifestPath },
  });
  const pass = result.status !== 0
    && result.stdout.includes("미선언코드:E-WEIGHT")
    && result.stdout.includes("0/1 fixtures green");
  if (!pass) {
    console.error("FAIL undeclared fixture error code was accepted");
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    process.exit(1);
  }
  console.log("PASS undeclared fixture error code is rejected");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
