import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const validator = fileURLToPath(new URL("./check_prompt.mjs", import.meta.url));

// Exercise stdin and the public JSON contract, without importing validator code.
function check(input, { errors = [], warnings = [] } = {}) {
  const result = spawnSync(process.execPath, [validator, "--profile", "assembled"], {
    input,
    encoding: "utf8",
    timeout: 10_000,
  });
  assert.ifError(result.error);
  assert.equal(result.signal, null, "validator must exit normally");
  assert.equal(result.status, errors.length === 0 ? 0 : 1, "CLI exit status");

  const report = JSON.parse(result.stdout);
  assert.equal(report.mode, "text");
  assert.equal(report.profile, "assembled");
  assert.equal(report.ok, errors.length === 0, "validation outcome");
  assert.deepEqual(
    report.errors.map(({ code }) => code).sort(),
    [...errors].sort(),
    "exact error codes",
  );
  assert.deepEqual(
    report.warnings.map(({ code }) => code).sort(),
    [...warnings].sort(),
    "exact warning codes",
  );
}

test("all five editorial control phrases coexist without diagnostics", () => {
  check(
    "An East Asian woman inspects a brass telescope at an observatory workbench. " +
    "Use Portra film tonality and medium-format clarity, with glass skin translucency " +
    "and a chok-chok finish under side window light.",
  );
});

for (const [name, input, code] of [
  [
    "micro prefix rejects fabricated skin texture",
    "An astronomer at a workbench has micro skin texture under a soft key light.",
    "portrait/skin-token",
  ],
  [
    "AI suffix rejects fabricated skin texture",
    "An astronomer at a workbench has realistic skin AI under a soft key light.",
    "portrait/skin-token",
  ],
  [
    "English skin color shorthand fails independently",
    "An East Asian woman at an observatory workbench has yellow undertone skin.",
    "portrait/nationality-skin",
  ],
  [
    "Korean skin color shorthand fails independently",
    "관측대 작업대에 앉은 동아시아 여성의 노란 피부를 부드러운 키 라이트로 비춘다.",
    "portrait/nationality-skin",
  ],
]) {
  test(name, () => check(input, { errors: [code] }));
}

test("matte and soft light do not hide either portrait error", () => {
  check(
    "관측대 작업대의 동아시아 여성. 노란 피부와 yellow undertone skin, " +
    "micro skin texture와 realistic skin AI를 지정한다. 부드러운 키 라이트와 매트 마감.",
    { errors: ["portrait/skin-token", "portrait/nationality-skin"] },
  );
});

const threeGlow =
  "An astronomer with dewy cheeks, luminous skin and wet-look highlights.";
const fourGlow = `${threeGlow} Add subsurface glow.`;
const fiveGlow = `${fourGlow} Add glass skin translucency.`;

test("three distinct glow types remain below the warning threshold", () => {
  check(threeGlow);
});

test("repeating three glow types does not count as six types", () => {
  check(`${threeGlow} ${threeGlow}`);
});

test("subsurface glow, sheen and scatter count as one glow family", () => {
  check(
    "An astronomer with dewy cheeks, luminous skin, subsurface glow, " +
    "subsurface sheen and subsurface scatter.",
  );
});

for (const [count, input] of [[4, fourGlow], [5, fiveGlow]]) {
  test(`${count} distinct glow types warn but still succeed without matte`, () => {
    check(input, { warnings: ["portrait/glow-stack"] });
  });

  test(`Korean matte qualification clears the ${count}-type glow warning`, () => {
    check(`${input} 매트한 T존 대비.`);
  });
}

const instructionWords =
  "micro skin texture; realistic skin AI; yellow undertone skin; " +
  "dewy, luminous skin, wet-look, subsurface glow; 4K [DOME] --ar 3:2; sample plate.";

test("unquoted copy vocabulary activates the corresponding instruction checks", () => {
  check(instructionWords, {
    errors: [
      "portrait/skin-token",
      "portrait/nationality-skin",
      "phrasing/quality-tag",
      "syntax/placeholder",
      "syntax/foreign-flag",
    ],
    warnings: ["portrait/glow-stack"],
  });
});

for (const [style, open, close] of [
  ["straight", '"', '"'],
  ["curly", "\u201c", "\u201d"],
]) {
  test(`${style} quoted copy cannot activate instruction checks`, () => {
    check(`Set a legible headline exactly once: ${open}${instructionWords}${close}.`);
  });

  test(`${style} quoted fourth glow type cannot reach the warning threshold`, () => {
    check(
      `${threeGlow} Set a legible caption exactly once: ${open}subsurface glow${close}.`,
    );
  });

  test(`${style} quoted Korean matte cannot suppress an instruction warning`, () => {
    check(
      `${fourGlow} Set a legible caption exactly once: ${open}무광${close}.`,
      { warnings: ["portrait/glow-stack"] },
    );
  });
}
