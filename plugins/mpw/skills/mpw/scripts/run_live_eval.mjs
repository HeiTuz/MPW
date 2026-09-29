#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { codexPluginRoot } from "./check_install_parity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultCases = path.join(root, "scripts/fixtures/behavioral/cases.json");
const checker = path.join(root, "scripts/check_behavioral_responses.py");

function parseArgs(argv) {
  const options = { cases: defaultCases, out: null, concurrency: 2, timeout: 300, dryRun: false, runnerCommand: null, reviews: null, ids: null, models: null };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--dry-run") { options.dryRun = true; continue; }
    const names = { "--models": "models", "--cases": "cases", "--ids": "ids", "--out": "out", "--concurrency": "concurrency", "--timeout": "timeout", "--runner-command": "runnerCommand", "--reviews": "reviews" };
    if (!Object.hasOwn(names, key) || index + 1 >= argv.length || argv[index + 1].startsWith("--")) throw new Error(`unknown option or missing value: ${key}`);
    options[names[key]] = argv[++index];
  }
  if (!options.models) throw new Error("--models is required");
  for (const key of ["models", "ids"]) {
    if (options[key] !== null) {
      options[key] = options[key].split(",").map((value) => value.trim());
      if (options[key].some((value) => !value) || new Set(options[key]).size !== options[key].length) throw new Error(`invalid --${key}`);
    }
  }
  for (const key of ["concurrency", "timeout"]) {
    options[key] = Number(options[key]);
    if (!Number.isSafeInteger(options[key]) || options[key] < 1) throw new Error(`--${key} must be a positive integer`);
  }
  if (options.runnerCommand !== null && !options.runnerCommand.trim()) throw new Error("--runner-command must not be empty");
  if (options.reviews && options.models.length > 1) throw new Error("--reviews holds one model's semantic verdicts; run each model separately with its own review file");
  options.cases = path.resolve(options.cases);
  if (options.out) options.out = path.resolve(options.out);
  if (options.reviews) options.reviews = path.resolve(options.reviews);
  return options;
}

function commandWords(template) {
  const words = [];
  let word = "";
  let quote = null;
  let started = false;
  for (let index = 0; index < template.length; index += 1) {
    const char = template[index];
    if (char === "\\" && quote !== "'") {
      if (++index >= template.length) throw new Error("trailing escape in --runner-command");
      word += template[index]; started = true;
    } else if (char === quote) {
      quote = null;
    } else if (!quote && (char === "'" || char === '"')) {
      quote = char; started = true;
    } else if (!quote && /\s/.test(char)) {
      if (started) { words.push(word); word = ""; started = false; }
    } else {
      word += char; started = true;
    }
  }
  if (quote) throw new Error("unclosed quote in --runner-command");
  if (started) words.push(word);
  if (!words.length) throw new Error("empty --runner-command");
  return words;
}

function slug(value) {
  return value.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "") || "model";
}

function installedSkill() {
  const codexHome = process.env.CODEX_HOME || path.join(os.homedir(), ".codex");
  const pluginRoot = codexPluginRoot(codexHome);
  const location = pluginRoot ? path.join(pluginRoot, "skills", "mpw") : path.join(codexHome, "plugins", "cache", "heituz", "mpw");
  try {
    const actual = fs.realpathSync(location);
    const skill = fs.readFileSync(path.join(actual, "SKILL.md"), "utf8");
    const frontmatter = skill.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const version = frontmatter?.[1].match(/^\s*version:\s*["']?([^\s"']+)/m)?.[1] ?? "unknown";
    return { path: actual, version };
  } catch (error) {
    return { path: location, version: "unavailable", error: error.message };
  }
}

function loadCases(file, ids) {
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const cases = Array.isArray(source) ? source : source.cases;
  if (!Array.isArray(cases) || !cases.length) throw new Error("cases must be a nonempty list");
  const known = new Set();
  for (const item of cases) {
    if (!item || typeof item.id !== "string" || !item.id || typeof item.request !== "string" || !item.request || known.has(item.id)) throw new Error("each case needs a unique id and nonempty request");
    known.add(item.id);
  }
  if (ids) {
    const unknown = ids.filter((id) => !known.has(id));
    if (unknown.length) throw new Error(`unknown case id: ${unknown.join(", ")}`);
  }
  return { known, cases: cases.filter((item) => !ids || ids.includes(item.id)) };
}

function selectedReviews(file, known, selected) {
  const records = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!Array.isArray(records)) throw new Error("reviews JSON must be a list");
  const unknown = records.filter((record) => !known.has(record?.id)).map((record) => String(record?.id));
  if (unknown.length) throw new Error(`unknown review id: ${unknown.join(", ")}`);
  return records.filter((record) => selected.has(record.id));
}

function promptFor(item) {
  return item.context ? `${item.request}\n\n${item.context}` : item.request;
}

function runnerSpec(options, values, prompt) {
  if (options.runnerCommand === null) {
    return ["codex", "exec", "-m", values.model, "--ephemeral", "--skip-git-repo-check", "-s", "read-only", "-C", values.cwd, "-o", values.out_file, prompt];
  }
  return commandWords(options.runnerCommand).map((word) => word.replace(/\{(model|prompt_file|out_file|cwd)\}/g, (_, key) => values[key]));
}

function displayCommand(words) {
  return words.map((word) => /^[A-Za-z0-9_./:=+-]+$/.test(word) ? word : `'${word.replace(/'/g, "'\\''")}'`).join(" ");
}

function runCommand(words, cwd, timeoutSeconds, stdoutFile, stderrFile) {
  return new Promise((resolve) => {
    const stdout = fs.createWriteStream(stdoutFile);
    const stderr = fs.createWriteStream(stderrFile);
    let timedOut = false;
    let settled = false;
    // A separate process group lets a timeout stop the runner and anything it started.
    const child = spawn(words[0], words.slice(1), { cwd, stdio: ["ignore", "pipe", "pipe"], detached: true });
    child.stdout.pipe(stdout);
    child.stderr.pipe(stderr);
    const finish = (error, code, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      stdout.end(); stderr.end();
      resolve({ error: error?.message ?? null, code, signal, timedOut });
    };
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-child.pid, "SIGKILL"); } catch { child.kill("SIGKILL"); }
      child.stdout.destroy(); child.stderr.destroy();
      finish(null, null, "SIGKILL");
    }, timeoutSeconds * 1000);
    child.on("error", (error) => finish(error, null, null));
    child.on("close", (code, signal) => finish(null, code, signal));
  });
}

async function pool(items, concurrency, worker) {
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) await worker(items[cursor++]);
  }));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { known, cases } = loadCases(options.cases, options.ids);
  const reviews = options.reviews ? selectedReviews(options.reviews, known, new Set(cases.map((item) => item.id))) : null;
  const slugs = options.models.map(slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("model names collide after filename normalization");
  const out = options.out ?? (options.dryRun ? path.join(os.tmpdir(), "mpw-live-eval-preview") : fs.mkdtempSync(path.join(os.tmpdir(), "mpw-live-eval-")));
  const jobs = options.models.flatMap((model, modelIndex) => cases.map((item, caseIndex) => ({ model, modelSlug: slugs[modelIndex], item, caseIndex })));
  if (options.dryRun) {
    for (const job of jobs) {
      const folder = path.join(out, job.modelSlug, `${job.caseIndex + 1}-${slug(job.item.id)}`);
      const values = { model: job.model, cwd: path.join(folder, "cwd"), prompt_file: path.join(folder, "prompt.txt"), out_file: path.join(folder, "response.txt") };
      console.log(displayCommand(runnerSpec(options, values, promptFor(job.item))));
    }
    return 0;
  }
  if (fs.existsSync(out) && fs.readdirSync(out).length) throw new Error(`result directory is not empty: ${out}`);
  fs.mkdirSync(out, { recursive: true });
  // Criteria and reviews stay in the result directory; model working directories live elsewhere
  // so a tool-using model cannot reach them through a relative path from its cwd.
  const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mpw-live-eval-work-"));
  const evaluatedCases = path.join(out, "cases.json");
  fs.writeFileSync(evaluatedCases, `${JSON.stringify({ cases }, null, 2)}\n`);
  let reviewFile = null;
  if (reviews) {
    reviewFile = path.join(out, "reviews-selected.json");
    fs.writeFileSync(reviewFile, `${JSON.stringify(reviews, null, 2)}\n`);
  }
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  if (head.status !== 0) throw new Error(`git rev-parse HEAD failed: ${head.stderr.trim()}`);
  const installed = installedSkill();
  const revision = `source=${head.stdout.trim()}; installed=${installed.path}@${installed.version}`;
  const records = [];
  await pool(jobs, options.concurrency, async (job) => {
    const folder = path.join(out, job.modelSlug, `${job.caseIndex + 1}-${slug(job.item.id)}`);
    const work = path.join(workRoot, job.modelSlug, `${job.caseIndex + 1}-${slug(job.item.id)}`);
    const cwd = path.join(work, "cwd");
    fs.mkdirSync(cwd, { recursive: true });
    fs.mkdirSync(folder, { recursive: true });
    const prompt = promptFor(job.item);
    const values = { model: job.model, cwd, prompt_file: path.join(work, "prompt.txt"), out_file: path.join(work, "response.txt") };
    fs.writeFileSync(values.prompt_file, prompt);
    fs.writeFileSync(path.join(folder, "prompt.txt"), prompt);
    const command = runnerSpec(options, values, prompt);
    const result = await runCommand(command, cwd, options.timeout, path.join(folder, "stdout.log"), path.join(folder, "stderr.log"));
    let response = "";
    if (!result.error && !result.timedOut && result.code === 0) {
      try { response = fs.readFileSync(values.out_file, "utf8"); } catch { /* recorded below */ }
    }
    if (response) fs.writeFileSync(path.join(folder, "response.txt"), response);
    const logs = ["stdout.log", "stderr.log"].map((name) => { try { return fs.readFileSync(path.join(folder, name), "utf8"); } catch { return ""; } }).join("\n");
    const criteriaAccess = /fixtures\/behavioral|skill_behavior_cases|semantic_checks|reviews-selected\.json/.test(logs);
    let reason = null;
    if (result.timedOut) reason = `timeout after ${options.timeout}s`;
    else if (result.error) reason = result.error;
    else if (result.code !== 0) reason = `runner exited ${result.code}${result.signal ? ` (${result.signal})` : ""}`;
    else if (!response.trim()) reason = "empty response";
    records.push({ model: job.model, id: job.item.id, command, folder, status: reason ? "not_run" : "collected", reason, launchError: Boolean(result.error), criteriaAccess, response: reason ? null : response });
  });
  fs.rmSync(workRoot, { recursive: true, force: true });
  const summaries = [];
  const launchErrors = records.filter((record) => record.launchError).map(({ model, id, reason }) => ({ model, id, reason }));
  for (const [index, model] of options.models.entries()) {
    const modelRecords = cases.map((item) => records.find((record) => record.model === model && record.id === item.id));
    const responseFile = path.join(out, `responses-${slugs[index]}.json`);
    fs.writeFileSync(responseFile, `${JSON.stringify(modelRecords.filter((record) => record.status === "collected").map(({ id, response }) => ({ id, response })), null, 2)}\n`);
    const command = ["python3", checker, "--cases", evaluatedCases, "--responses", responseFile, "--model", model, "--revision", revision];
    if (reviewFile) command.push("--reviews", reviewFile);
    const checked = spawnSync(command[0], command.slice(1), { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    fs.writeFileSync(path.join(out, `check-${slugs[index]}.json`), checked.stdout || "");
    if (checked.stderr) fs.writeFileSync(path.join(out, `check-${slugs[index]}.stderr.log`), checked.stderr);
    let counts = null;
    try { counts = JSON.parse(checked.stdout).counts; } catch { /* checker error appears in summary */ }
    summaries.push({ model, responses: responseFile, checker_exit: checked.status ?? 2, counts, failures: modelRecords.filter((record) => record.reason).map(({ id, reason }) => ({ id, reason })), criteria_access_suspected: modelRecords.filter((record) => record.criteriaAccess).map(({ id }) => id), checker_error: checked.error?.message ?? (checked.stderr.trim() || null) });
  }
  const summary = { cases: options.cases, evaluated_cases: evaluatedCases, selected_ids: cases.map((item) => item.id), revision: { source_head: head.stdout.trim(), installed_skill: installed }, runner: options.runnerCommand ?? "codex exec", launch_errors: launchErrors, results: summaries };
  fs.writeFileSync(path.join(out, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`results: ${out}`);
  for (const item of summaries) console.log(`${item.model}: checker=${item.checker_exit} ${JSON.stringify(item.counts)}${item.failures.length ? ` not_run=${JSON.stringify(item.failures)}` : ""}${item.criteria_access_suspected.length ? ` criteria_access_suspected=${JSON.stringify(item.criteria_access_suspected)}` : ""}`);
  const codes = summaries.map((item) => item.checker_exit);
  return launchErrors.length || codes.includes(2) ? 2 : codes.includes(1) ? 1 : codes.includes(3) ? 3 : 0;
}

main().then((code) => { process.exitCode = code; }).catch((error) => {
  console.error(`run_live_eval: ${error.message}`);
  process.exitCode = 2;
});
