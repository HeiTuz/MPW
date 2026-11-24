#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { buildPlugin, validatePlugin, listFiles, hasPrivateHome } from "./build_plugin.mjs";

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
  // 이 파일도 payload로 나가므로 경로 리터럴을 쪼개서 쓴다
  const u = "/" + "Users/", h = "/" + "home/";
  assert.equal(hasPrivateHome(u + "someone-else/x.png"), true);
  assert.equal(hasPrivateHome("see " + h + "jdoe2/notes"), true);
  assert.equal(hasPrivateHome([u + "example/a", h + "user/b", u + "operator/c", u + "help", h + "person/d"].join(" ")), false);
  // jsonl은 검사 대상 확장자여야 한다
  fs.mkdirSync(path.join(dir, "skills/mpw/leak"), { recursive: true });
  fs.writeFileSync(path.join(dir, "skills/mpw/leak/row.jsonl"), '{"path":"' + u + 'someone-else/p.png"}\n');
  assert.ok(validatePlugin(dir).problems.some((p) => p.includes("private home path shipped: skills/mpw/leak/row.jsonl")));
  console.log("plugin build: OK (" + files + " files)");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
