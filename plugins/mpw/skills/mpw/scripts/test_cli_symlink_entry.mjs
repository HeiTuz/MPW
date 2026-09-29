#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const scripts = path.dirname(fileURLToPath(import.meta.url));
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-cli-link-"));
try {
  for (const name of ["check_prompt.mjs", "check_install_parity.mjs"]) {
    const link = path.join(temporary, name);
    fs.symlinkSync(path.join(scripts, name), link);
    const result = spawnSync(process.execPath, [link, "--unknown-flag"], { encoding: "utf8" });
    if (name === "check_prompt.mjs") {
      assert.equal(result.status, 1, result.stderr);
      assert.match(result.stdout, /input\/flag/, "symlinked prompt checker did not run");
    } else {
      assert.equal(result.status, 2, result.stderr);
      assert.match(result.stderr, /unknown flag/, "symlinked parity checker did not run");
    }
  }
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
console.log("symlinked checker CLIs run their entry points");
