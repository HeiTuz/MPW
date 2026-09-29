#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildPlugin, validatePlugin, listFiles } from "./build_plugin.mjs";

const temp = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-plugin-test-"));
try {
  const dir = buildPlugin(temp);
  const { files, problems } = validatePlugin(dir);
  assert.deepEqual(problems, [], problems.join("\n"));
  const shipped = listFiles(dir);
  for (const required of [".codex-plugin/plugin.json", ".claude-plugin/plugin.json", "assets/icon.png", "skills/mpw/SKILL.md", "skills/mpw/references/adapters.md", "skills/mpw/scripts/check_prompt.mjs", "skills/mpw/contracts/manifest.json"]) {
    assert.ok(shipped.includes(required), "plugin omits " + required);
  }
  assert.equal(fs.readFileSync(path.join(dir, "skills/mpw/SKILL.md"), "utf8").includes("host_surface: plugin"), true);
  console.log("plugin build: OK (" + files + " files)");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
