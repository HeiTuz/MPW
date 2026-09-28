#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = path.join(path.dirname(fileURLToPath(import.meta.url)), "run_live_eval.mjs");
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-live-eval-test-"));
try {
  const cases = path.join(temporary, "cases.json");
  const reviews = path.join(temporary, "reviews.json");
  const fake = path.join(temporary, "fake-runner.mjs");
  const calls = path.join(temporary, "calls.txt");
  fs.writeFileSync(cases, JSON.stringify({ cases: [
    { id: "exact", request: "EXACT", expected: "answer", format: { kind: "plain" } },
    { id: "semantic", request: "SEMANTIC", semantic_checks: ["review needed"], format: { kind: "plain" } },
    { id: "missing", request: "EMPTY", format: { kind: "plain" } },
    { id: "failed", request: "FAIL", format: { kind: "plain" } },
  ] }));
  fs.writeFileSync(reviews, JSON.stringify([{ id: "exact", verdict: "pass", reason: "exact response inspected" }]));
  fs.writeFileSync(fake, [
    'import fs from "node:fs";',
    'const [promptFile, outFile] = process.argv.slice(2);',
    'const prompt = fs.readFileSync(promptFile, "utf8");',
    'fs.appendFileSync(process.env.MPW_FAKE_CALLS, `${prompt}\\n`);',
    'if (prompt === "FAIL") process.exit(7);',
    'fs.writeFileSync(outFile, prompt === "EXACT" ? "answer" : prompt === "EMPTY" ? "" : "candidate");',
  ].join("\n"));
  const runner = `${process.execPath} ${fake} {prompt_file} {out_file}`;
  function run(extra, out) {
    return spawnSync(process.execPath, [script, "--models", "test-model", "--cases", cases,
      "--out", out, "--runner-command", runner, "--reviews", reviews, ...extra],
    { encoding: "utf8", env: { ...process.env, MPW_FAKE_CALLS: calls } });
  }

  const complete = path.join(temporary, "complete");
  const first = run(["--ids", "exact,semantic"], complete);
  assert.equal(first.status, 3, first.stderr + first.stdout);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(complete, "responses-test-model.json"), "utf8")).map((item) => item.id), ["exact", "semantic"]);
  const firstReport = JSON.parse(fs.readFileSync(path.join(complete, "check-test-model.json"), "utf8"));
  assert.deepEqual(firstReport.results.map((item) => item.status), ["passed", "needs_review"]);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(complete, "summary.json"), "utf8")).selected_ids, ["exact", "semantic"]);

  const passed = run(["--ids", "exact"], path.join(temporary, "passed"));
  assert.equal(passed.status, 0, passed.stderr + passed.stdout);

  const incomplete = path.join(temporary, "incomplete");
  const second = run([], incomplete);
  assert.equal(second.status, 3, second.stderr + second.stdout);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(incomplete, "responses-test-model.json"), "utf8")).map((item) => item.id), ["exact", "semantic"]);
  const report = JSON.parse(fs.readFileSync(path.join(incomplete, "check-test-model.json"), "utf8"));
  assert.deepEqual(report.results.map((item) => item.status), ["passed", "needs_review", "not_run", "not_run"]);
  const summary = JSON.parse(fs.readFileSync(path.join(incomplete, "summary.json"), "utf8"));
  assert.deepEqual(summary.results[0].failures, [{ id: "missing", reason: "empty response" }, { id: "failed", reason: "runner exited 7" }]);
  assert.equal(fs.existsSync(path.join(incomplete, "test-model", "4-failed", "stderr.log")), true);

  const before = fs.readFileSync(calls, "utf8");
  const preview = path.join(temporary, "preview");
  const dry = run(["--ids", "exact", "--dry-run"], preview);
  assert.equal(dry.status, 0, dry.stderr);
  assert.equal(dry.stdout.trim().split("\n").length, 1);
  assert.match(dry.stdout, /fake-runner\.mjs/);
  assert.equal(fs.existsSync(preview), false);
  assert.equal(fs.readFileSync(calls, "utf8"), before);

  const launch = spawnSync(process.execPath, [script, "--models", "test-model", "--cases", cases,
    "--ids", "exact", "--out", path.join(temporary, "launch-error"),
    "--runner-command", `${path.join(temporary, "missing-runner")} {out_file}`], { encoding: "utf8" });
  assert.equal(launch.status, 2, launch.stderr + launch.stdout);
  const launchSummary = JSON.parse(fs.readFileSync(path.join(temporary, "launch-error", "summary.json"), "utf8"));
  assert.equal(launchSummary.results[0].counts.not_run, 1);
  assert.equal(launchSummary.launch_errors.length, 1);

  // Option values that look like flags, empty runner templates and shared multi-model reviews are rejected.
  for (const argv of [["--models", "--dry-run"], ["--models", "test-model", "--runner-command", ""], ["--models", "a,b", "--reviews", reviews, "--dry-run"]]) {
    const rejected = spawnSync(process.execPath, [script, "--cases", cases, ...argv], { encoding: "utf8" });
    assert.equal(rejected.status, 2, JSON.stringify(argv) + rejected.stdout);
    assert.match(rejected.stderr, /run_live_eval:/);
  }

  // A review file covering more cases than --ids selects is narrowed; an id outside the case set is refused.
  const wideReviews = path.join(temporary, "wide-reviews.json");
  fs.writeFileSync(wideReviews, JSON.stringify([{ id: "exact", verdict: "pass", reason: "checked" }, { id: "semantic", verdict: "pass", reason: "checked" }]));
  const narrowed = spawnSync(process.execPath, [script, "--models", "test-model", "--cases", cases, "--ids", "exact", "--out", path.join(temporary, "narrowed"), "--runner-command", runner, "--reviews", wideReviews], { encoding: "utf8", env: { ...process.env, MPW_FAKE_CALLS: calls } });
  assert.equal(narrowed.status, 0, narrowed.stderr + narrowed.stdout);
  const strayReviews = path.join(temporary, "stray-reviews.json");
  fs.writeFileSync(strayReviews, JSON.stringify([{ id: "nope", verdict: "pass", reason: "checked" }]));
  const stray = spawnSync(process.execPath, [script, "--models", "test-model", "--cases", cases, "--ids", "exact", "--out", path.join(temporary, "stray"), "--runner-command", runner, "--reviews", strayReviews], { encoding: "utf8", env: { ...process.env, MPW_FAKE_CALLS: calls } });
  assert.equal(stray.status, 2, stray.stderr + stray.stdout);

  // The model runs outside the result directory, and a log that touches criteria files is flagged.
  const probe = path.join(temporary, "probe-runner.mjs");
  fs.writeFileSync(probe, [
    'import fs from "node:fs";',
    'const [promptFile, outFile] = process.argv.slice(2);',
    'if (fs.readFileSync(promptFile, "utf8") === "PEEK") console.log("cat scripts/fixtures/behavioral/cases.json");',
    'fs.writeFileSync(outFile, process.cwd());',
  ].join("\n"));
  const probeCases = path.join(temporary, "probe-cases.json");
  fs.writeFileSync(probeCases, JSON.stringify({ cases: [{ id: "where", request: "WHERE", format: { kind: "plain" } }, { id: "peek", request: "PEEK", format: { kind: "plain" } }] }));
  const probeOut = path.join(temporary, "probe");
  const probed = spawnSync(process.execPath, [script, "--models", "test-model", "--cases", probeCases, "--out", probeOut, "--runner-command", `${process.execPath} ${probe} {prompt_file} {out_file}`], { encoding: "utf8" });
  assert.equal(probed.status, 3, probed.stderr + probed.stdout);
  const probeResponses = JSON.parse(fs.readFileSync(path.join(probeOut, "responses-test-model.json"), "utf8"));
  for (const item of probeResponses) {
    assert.equal(item.response.startsWith(fs.realpathSync(probeOut)), false, item.response);
    assert.match(item.response, /mpw-live-eval-work-/);
    assert.equal(fs.existsSync(item.response), false, "model working directories are removed after the run");
  }
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(probeOut, "summary.json"), "utf8")).results[0].criteria_access_suspected, ["peek"]);

  // A timeout stops the runner's whole process group, including a grandchild holding the output pipe.
  const hang = path.join(temporary, "hang-runner.mjs");
  fs.writeFileSync(hang, ['import { spawn } from "node:child_process";', 'spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)"], { stdio: "inherit" });', "setTimeout(() => {}, 60000);"].join("\n"));
  const started = Date.now();
  const hung = spawnSync(process.execPath, [script, "--models", "test-model", "--cases", cases, "--ids", "exact", "--timeout", "1", "--out", path.join(temporary, "hang"), "--runner-command", `${process.execPath} ${hang}`], { encoding: "utf8", timeout: 30000 });
  assert.equal(hung.status, 3, hung.stderr + hung.stdout);
  assert.ok(Date.now() - started < 20000, "timeout did not release the process group");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(temporary, "hang", "summary.json"), "utf8")).results[0].failures, [{ id: "exact", reason: "timeout after 1s" }]);
} finally {
  fs.rmSync(temporary, { recursive: true, force: true });
}
console.log("live eval: collection, not_run, filtering, dry-run, option guards, review scoping, criteria isolation and timeouts ok");
