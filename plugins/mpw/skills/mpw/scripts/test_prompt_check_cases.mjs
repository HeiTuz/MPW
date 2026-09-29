import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CODE_REGISTRY, checkText, runHarness } from "./check_prompt.mjs";

const scripts = dirname(fileURLToPath(import.meta.url));
const fixtureRoot = resolve(scripts, "fixtures/prompt-checks");
const validator = resolve(scripts, "check_prompt.mjs");
const cases = JSON.parse(await readFile(resolve(fixtureRoot, "cases.json"), "utf8"));
const coverageExceptions = {
  "length/contract": "Temporary inputs in test_surface_length_contract.mjs exercise the 2000 boundary.",
  "length/engine": "Temporary inputs in test_surface_length_contract.mjs exercise the 32000 boundary.",
  "input/unreadable": "The CLI tests use a missing path and a directory; neither is a registered fixture.",
};
const registryCodes = new Set(Object.values(CODE_REGISTRY).map((entry) => entry.code));
assert.equal(registryCodes.size, 34);
const validatorSource = await readFile(validator, "utf8");
for (const code of registryCodes) assert.equal(validatorSource.split(JSON.stringify(code)).length - 1, 1, code);
assert.ok(validatorSource.split("\n").includes('const BANNED_MJ_FLAGS = ["no", "ar", "p", "stylize", "v", "sref", "seed"];'));
const covered = new Set(cases.flatMap((item) => [...(item.expect.errors ?? []), ...(item.expect.warnings_include ?? [])]));
for (const code of covered) assert.ok(registryCodes.has(code), `Unregistered expected code: ${code}`);
for (const [code, reason] of Object.entries(coverageExceptions)) {
  assert.ok(reason.trim().length > 0);
  assert.ok(registryCodes.has(code));
  assert.ok(!covered.has(code), `Remove the obsolete coverage exception for ${code}`);
}
for (const code of registryCodes) assert.ok(covered.has(code) || Object.hasOwn(coverageExceptions, code), `Uncovered code: ${code}`);

function run(casesPath) {
  return new Promise((accept, reject) => {
    const env = { ...process.env };
    delete env.MPW_PROMPT_CHECK_CASES;
    if (casesPath) env.MPW_PROMPT_CHECK_CASES = casesPath;
    const child = execFile(process.execPath, [validator, "--test"], { env, timeout: 15000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      if (error && (!Number.isInteger(error.code) || error.killed || error.signal)) reject(error);
      else accept({ status: error?.code ?? 0, stdout, stderr });
    });
    child.stdin.end();
  });
}

let scenarios = 0;
const temp = await mkdtemp(resolve(tmpdir(), "mpw-prompt-cases-"));
try {
  const normal = await run();
  assert.equal(normal.status, 0, normal.stdout + normal.stderr);
  scenarios += 1;
  const direct = await runHarness(resolve(fixtureRoot, "cases.json"), () => {});
  assert.equal(direct.ok, true);
  assert.deepEqual(new Set(direct.uncovered), new Set(Object.keys(coverageExceptions)));
  scenarios += 1;

  const failing = cases.find((item) => item.input.startsWith("fail/") && item.expect.errors?.length === 1 && item.expect.errors[0] === "syntax/placeholder");
  assert.ok(failing);
  const absoluteInput = resolve(fixtureRoot, failing.input);
  const actual = checkText(await readFile(absoluteInput, "utf8"));
  assert.equal(actual.ok, false);
  assert.deepEqual([...new Set(actual.errors.map((item) => item.code))], failing.expect.errors);
  const temporaryCases = resolve(temp, "cases.json");
  async function inject(records, requiredTokens) {
    await writeFile(temporaryCases, JSON.stringify(records));
    const outcome = await run(temporaryCases);
    assert.equal(outcome.status, 1, outcome.stdout + outcome.stderr);
    for (const token of requiredTokens) assert.ok(outcome.stdout.includes(token), `Missing diagnostic token ${token}`);
    scenarios += 1;
  }
  // A declared but absent error must fail independently of the ok boolean.
  await inject([{
    ...failing, input: absoluteInput,
    expect: { ok: false, errors: [...failing.expect.errors, "input/empty"] },
  }], ["input/empty"]);
  // Removing the real error from the expectation must expose the undeclared code.
  await inject([{
    ...failing, input: absoluteInput, expect: { ok: false, errors: [] },
  }], failing.expect.errors);
  await inject([], ["harness/empty-cases"]);
  await inject({}, ["harness/empty-cases"]);
  await inject([
    { ...failing, input: absoluteInput },
    { ...failing, input: absoluteInput },
  ], ["harness/self-check"]);

  const passingInput = resolve(fixtureRoot, "pass/input-rain-shelter.txt");
  await inject([{
    case: "required warning absent", input: passingInput, args: [],
    expect: { ok: true, warnings_include: ["syntax/ratio-token"] },
  }], ["syntax/ratio-token"]);
  await inject([{
    case: "forbidden warning present", input: resolve(fixtureRoot, "pass/syntax-dock-ratio.txt"), args: [],
    expect: { ok: true, warnings_exclude: ["syntax/ratio-token"] },
  }], ["syntax/ratio-token"]);

  await writeFile(temporaryCases, JSON.stringify([{
    case: "absent optional fixture directories", input: "pass/absent.txt", args: [],
    expect: { ok: false, errors: ["input/unreadable"] },
  }]));
  const noDirectories = await run(temporaryCases);
  assert.equal(noDirectories.status, 0, noDirectories.stdout);
  scenarios += 1;

  const pass = resolve(temp, "pass");
  await mkdir(pass);
  await writeFile(resolve(pass, "listed.txt"), "A stone bridge crosses a narrow stream.");
  await writeFile(resolve(pass, "unlisted.txt"), "A wicker basket rests on a stool.");
  await writeFile(resolve(pass, ".ignored.txt"), "A hidden fixture is not registered.");
  await inject([{
    case: "registered input", input: "pass/listed.txt", args: [], expect: { ok: true },
  }], ["harness/unregistered-fixture", "unlisted.txt"]);
  await rm(resolve(pass, "unlisted.txt"));
  const hiddenIgnored = await run(temporaryCases);
  assert.equal(hiddenIgnored.status, 0, hiddenIgnored.stdout);
  scenarios += 1;

  await mkdir(resolve(pass, "nested"));
  await writeFile(resolve(pass, "nested/other.txt"), "A folded newspaper on a bench.");
  const nested = await run(temporaryCases);
  assert.equal(nested.status, 1);
  assert.ok(nested.stdout.includes("harness/unregistered-fixture"));
  assert.ok(nested.stdout.includes("other.txt"));
  scenarios += 1;
} finally {
  await rm(temp, { recursive: true, force: true });
}
console.log(`Prompt case harness: ${scenarios} scenarios passed; ${covered.size} fixture codes and ${Object.keys(coverageExceptions).length} justified boundary/IO exceptions.`);
