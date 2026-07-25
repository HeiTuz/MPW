#!/usr/bin/env node
// .npmignore 삭제됨 — npm pack 검사가 대체 방어선
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "heituzmpw-installer-privacy-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, encoding: "utf8", ...options });
  assert.equal(result.status, 0, `${command} failed: ${result.stderr || result.stdout}`);
  return result.stdout;
}

function hasExcludedPath(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const name = entry.name;
    if (name.startsWith(".") || ["docs-internal", "__pycache__"].includes(name) || name.endsWith(".pyc")) return true;
    if (entry.isDirectory() && hasExcludedPath(path.join(dir, name))) return true;
  }
  return false;
}

try {
  const installDest = path.join(temp, "installed");
  run(process.execPath, ["scripts/install.mjs", "--dest", installDest, "--force", "--quiet"]);
  assert.equal(hasExcludedPath(installDest), false, "installer copied excluded local state");
  assert.equal(fs.existsSync(path.join(installDest, "agents")), false, "installer leaked distribution overlays");
  const forwardedDest = path.join(temp, "forwarded");
  run(process.execPath, ["scripts/install.mjs", "--", "--dest", forwardedDest, "--force", "--quiet"]);
  assert.equal(fs.existsSync(path.join(forwardedDest, "SKILL.md")), true, "forwarded -- arguments did not install");

  const packed = JSON.parse(run("npm", ["pack", "--dry-run", "--json"]));
  const names = packed[0].files.map((file) => file.path);
  const packageFiles = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).files;
  assert.equal(packageFiles.includes("agents/**"), true, "npm files allowlist omits agent overlays");
  if (fs.existsSync(path.join(root, "agents"))) {
    assert.equal(names.some((name) => name.startsWith("agents/")), true, "npm package omits agent overlays");
  }
  assert.equal(names.some((name) => /(^|\/)\.[^/]+|(^|\/)(?:docs-internal|__pycache__)(?:\/|$)|\.pyc$/u.test(name)), false,
    "npm package includes excluded local state");
  console.log("installer/package privacy allowlist: OK");
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
