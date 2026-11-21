#!/usr/bin/env node
// check_prompt.mjs takes the prompt file as a positional argument or as --file, and prints its usage on --help.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseFlags } from "./check_prompt.mjs";

const checker = path.join(path.dirname(fileURLToPath(import.meta.url)), "check_prompt.mjs");
const run = (...args) => spawnSync(process.execPath, [checker, ...args], { encoding: "utf8" });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-check-cli-"));
try {
  const file = path.join(dir, "prompt.txt");
  fs.writeFileSync(file, "A natural-light photograph of a woman sitting on a park bench in the afternoon.\n");

  // --help: usage on stdout, exit 0, and it names the file argument, --file and the main options.
  const help = run("--help");
  assert.equal(help.status, 0, help.stderr);
  for (const word of ["usage: node scripts/check_prompt.mjs", "--file", "--profile", "--engine", "--manifest", "stdin"]) assert.ok(help.stdout.includes(word), `--help mentions ${word}`);
  assert.ok(help.stdout.split("\n").length <= 20, "usage fits one screen");
  assert.equal(run("-h").stdout, help.stdout);

  // --file <path> reads the same input as the positional path and gives the same result.
  const positional = run(file);
  const viaFile = run("--file", file);
  assert.equal(viaFile.status, positional.status, viaFile.stderr);
  assert.equal(viaFile.stdout, positional.stdout);
  assert.equal(JSON.parse(viaFile.stdout).mode, "text");
  assert.ok(!/input\/flag/.test(viaFile.stdout), "--file is not an unknown option");

  // One input only: both spellings together, or --file with no value, are flag errors; a missing file is unreadable, not a crash.
  assert.match(run(file, "--file", file).stdout, /input\/flag/);
  assert.ok(parseFlags(["--file"]).errors.length > 0);
  assert.deepEqual(parseFlags(["--file", file, "--profile", "assembled"]).errors, []);
  assert.equal(parseFlags(["--file", file]).options.input, file);
  assert.match(run("--file", path.join(dir, "missing.txt")).stdout, /input\/unreadable/);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log("check_prompt: --help prints the usage; --file reads the same input as the positional file");
