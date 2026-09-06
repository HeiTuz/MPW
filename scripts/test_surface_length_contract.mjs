#!/usr/bin/env node
// test_surface_length_contract.mjs — 표면/채널/엔진 컨텍스트 층 길이 구속 행동 테스트
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const tmpDir = mkdtempSync(join(tmpdir(), "mj-test-"));
const run = (args, input = null) => {
  const res = spawnSync("node", ["scripts/check_prompt.mjs", ...args], { cwd: process.cwd(), encoding: "utf8", input });
  return { exitCode: res.status, stdout: res.stdout, stderr: res.stderr };
};

const tests = [];

// (a) 무플래그 2100자 → E-OVERFLOW-2000, 메시지에 "전달 채널"
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const path = join(tmpDir, "test_a.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run([path]).stdout);
  const pass = res.ok === false && res.errors.some((e) => e.code === "E-OVERFLOW-2000" && e.msg.includes("전달 채널"));
  tests.push({ name: "(a) 무플래그 2100자 → E-OVERFLOW-2000 + 전달 채널", pass });
}

// (b) --surface s1 동일 입력 → E-OVERFLOW-2000, 메시지에 "기계 계약"
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const path = join(tmpDir, "test_b.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--surface", "s1", path]).stdout);
  const pass = res.ok === false && res.errors.some((e) => e.code === "E-OVERFLOW-2000" && e.msg.includes("기계 계약"));
  tests.push({ name: "(b) --surface s1 2100자 → E-OVERFLOW-2000 + 기계 계약", pass });
}

// (c) --surface s2 → 오버플로 에러 없음 / --surface s2 --channel bounded → 있음
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const path = join(tmpDir, "test_c.txt");
  writeFileSync(path, prompt);
  const res1 = JSON.parse(run(["--surface", "s2", path]).stdout);
  const pass1 = !res1.errors.some((e) => e.code.includes("OVERFLOW"));
  const res2 = JSON.parse(run(["--surface", "s2", "--channel", "bounded", path]).stdout);
  const pass2 = res2.errors.some((e) => e.code === "E-OVERFLOW-2000");
  tests.push({ name: "(c-i) --surface s2 → 오버플로 에러 없음", pass: pass1 });
  tests.push({ name: "(c-ii) --surface s2 --channel bounded → E-OVERFLOW-2000", pass: pass2 });
}

// (d) --surface s2 --engine higgsfield → 오버플로 에러 없음 + W-LENGTH-UNGATED
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const path = join(tmpDir, "test_d.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--surface", "s2", "--engine", "higgsfield", path]).stdout);
  const hasNoOverflow = !res.errors.some((e) => e.code.includes("OVERFLOW"));
  const hasWarning = res.warnings.some((w) => w.code === "W-LENGTH-UNGATED");
  tests.push({ name: "(d) --surface s2 --engine higgsfield → 오버플로 없음 + W-LENGTH-UNGATED", pass: hasNoOverflow && hasWarning });
}

// (e) 32001자 입력 + --surface s3 --channel unbounded → E-OVERFLOW-LIMIT, 메시지에 32000·"타깃 엔진"
{
  const prompt = "x".repeat(32001) + "\nAR 3:4";
  const path = join(tmpDir, "test_e.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--surface", "s3", "--channel", "unbounded", path]).stdout);
  const pass = res.ok === false && res.errors.some((e) => e.code === "E-OVERFLOW-LIMIT" && e.msg.includes("32000") && e.msg.includes("타깃 엔진"));
  tests.push({ name: "(e) 32001자 + --surface s3 --channel unbounded → E-OVERFLOW-LIMIT + 32000 + 타깃 엔진", pass });
}

// (f) MJ fixture + --engine midjourney → 에러가 정확히 E-ENGINE-SCOPE 1개, 메시지에 단어 수
{
  const res = JSON.parse(run(["--engine", "midjourney", "scripts/fixtures/bad/midjourney_engine.txt"]).stdout);
  const pass = res.ok === false && res.errors.length === 1 && res.errors[0].code === "E-ENGINE-SCOPE" && res.errors[0].msg.includes("단어");
  tests.push({ name: "(f) MJ fixture + --engine midjourney → 정확히 E-ENGINE-SCOPE 1개, 단어 수 포함", pass });
}

// (g) 우회 방지: jsonl rec surface=s2 + full_prompt 2100자 → 여전히 E-OVERFLOW-2000
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const rec = JSON.stringify({ id: "test-g", category: "C3", ar: "3:4", size: "1024x1536", quality: "high", surface: "s2", full_prompt: prompt, output_path: "out.png" });
  const path = join(tmpDir, "test_g.jsonl");
  writeFileSync(path, rec + "\n");
  const res = JSON.parse(run(["--jsonl", path]).stdout);
  const hasOverflow = res.results.some((r) => r.errors.some((e) => e.code === "E-OVERFLOW-2000"));
  tests.push({ name: "(g) jsonl rec surface=s2 2100자 → 계약층 불변식 E-OVERFLOW-2000", pass: hasOverflow });
}

// (h) 우선순위: rec.surface=s3 + CLI --surface s2 → CLI 승, 계약층 죽음 (text 모드 rec 주입 불가이므로 jsonl로 테스트하되 계약층 불변식 확인)
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const rec = JSON.stringify({ id: "test-h", category: "C3", ar: "3:4", size: "1024x1536", quality: "high", surface: "s3", full_prompt: prompt, output_path: "out.png" });
  const path = join(tmpDir, "test_h.jsonl");
  writeFileSync(path, rec + "\n");
  const res = JSON.parse(run(["--surface", "s2", "--jsonl", path]).stdout);
  // jsonl 모드에서는 계약층이 항상 살아 있으므로 E-OVERFLOW-2000 기대
  const hasOverflow = res.results.some((r) => r.errors.some((e) => e.code === "E-OVERFLOW-2000"));
  tests.push({ name: "(h) jsonl 모드 계약층 불변식 (surface 무관)", pass: hasOverflow });
}

// (i) 미지 플래그 흡수 금지: --surfce (오타) → E-INPUT-FLAG, exit≠0
{
  const prompt = "x".repeat(100) + "\nAR 3:4";
  const path = join(tmpDir, "test_i.txt");
  writeFileSync(path, prompt);
  const res = run(["--surfce", "s2", path]);
  const pass = res.exitCode !== 0 && res.stdout.includes("E-INPUT-FLAG");
  tests.push({ name: "(i) 미지 플래그 --surfce → E-INPUT-FLAG + exit≠0", pass });
}

// (i-2) --tier 관대 파싱 금지: 범위 밖·비숫자·경로형 값 → E-INPUT-FLAG, exit≠0
{
  const path = join(tmpDir, "test_i_tier.txt");
  writeFileSync(path, "x\nAR 3:4");
  const pass = ["5", "abc", path].every((value) => {
    const res = run(["--tier", value, path]);
    return res.exitCode !== 0 && res.stdout.includes("E-INPUT-FLAG");
  });
  tests.push({ name: "(i-2) --tier 5/abc/file.txt → 전부 E-INPUT-FLAG + exit≠0", pass });
}

// (j) MJ 엔진이 채널 층을 죽이지 못함: 무플래그 + --engine midjourney + 2100자 → E-ENGINE-SCOPE와 E-OVERFLOW-2000 공존
{
  const prompt = "word ".repeat(420).trim(); // 2099cp, 420단어
  const path = join(tmpDir, "test_j.txt");
  writeFileSync(path, prompt + "xx"); // 2101cp
  const res = JSON.parse(run(["--engine", "midjourney", path]).stdout);
  const codeSet = new Set(res.errors.map((e) => e.code));
  const pass = codeSet.has("E-ENGINE-SCOPE") && codeSet.has("E-OVERFLOW-2000");
  tests.push({ name: "(j) MJ + 2100자 무플래그 → E-ENGINE-SCOPE + E-OVERFLOW-2000 공존 (채널 층 생존)", pass });
}

// (k) MJ 엔진이 운영자 명시 채널 상한을 죽이지 못함: --engine midjourney --channel-limit 10 → E-OVERFLOW-LIMIT 공존
{
  const prompt = "a short midjourney style prompt about mountains";
  const path = join(tmpDir, "test_k.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--engine", "midjourney", "--channel-limit", "10", path]).stdout);
  const codeSet = new Set(res.errors.map((e) => e.code));
  const pass = codeSet.has("E-ENGINE-SCOPE") && codeSet.has("E-OVERFLOW-LIMIT");
  tests.push({ name: "(k) MJ + --channel-limit 10 → E-OVERFLOW-LIMIT 공존 (명시 채널 상한 생존)", pass });
}

// (l) jsonl rec.engine=midjourney + full_prompt 2100자 → 계약층 E-OVERFLOW-2000 + E-ENGINE-SCOPE 공존
{
  const prompt = "x".repeat(2100);
  const rec = JSON.stringify({ id: "test-l", category: "C3", ar: "3:4", size: "1024x1536", quality: "high", engine: "midjourney", full_prompt: prompt, output_path: "out.png" });
  const path = join(tmpDir, "test_l.jsonl");
  writeFileSync(path, rec + "\n");
  const res = JSON.parse(run(["--jsonl", path]).stdout);
  const codes = res.results.flatMap((r) => r.errors.map((e) => e.code));
  const pass = codes.includes("E-ENGINE-SCOPE") && codes.includes("E-OVERFLOW-2000");
  tests.push({ name: "(l) jsonl rec.engine=midjourney 2100자 → 계약층 E-OVERFLOW-2000 공존", pass });
}

// (m) 좁은 채널이 계약 위반을 세탁하지 못함: --surface s1 --channel-limit 1999 + 3000자 → E-OVERFLOW-LIMIT(채널)과 E-OVERFLOW-2000(계약) 둘 다
{
  const prompt = "x".repeat(3000) + "\nAR 3:4";
  const path = join(tmpDir, "test_m.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--surface", "s1", "--channel-limit", "1999", path]).stdout);
  const hasChannel = res.errors.some((e) => e.code === "E-OVERFLOW-LIMIT" && e.msg.includes("전달 채널") && e.msg.includes("1999"));
  const hasContract = res.errors.some((e) => e.code === "E-OVERFLOW-2000" && e.msg.includes("기계 계약"));
  tests.push({ name: "(m) s1 + 채널 1999 + 3000자 → 채널 E-OVERFLOW-LIMIT와 계약 E-OVERFLOW-2000 병존", pass: hasChannel && hasContract });
}

// (n) 레코드의 열거 밖 컨텍스트 값 → 배치 크래시가 아니라 레코드 단위 E-REC-CONTEXT, 다음 레코드는 계속 검증
{
  const good = readFileSync("scripts/fixtures/good/records.jsonl", "utf8").split(/\r?\n/).find((l) => l.trim());
  const bad = JSON.stringify({ id: "test-n-bad", category: "C3", ar: "3:4", size: "1024x1536", quality: "high", surface: {}, engine: "flux", channel_limit: -5, full_prompt: "x".repeat(2100), output_path: "out.png" }); // 2100cp — 오버플로 emit 경로(ctx.surface 소비)까지 크래시 면역을 핀
  const path = join(tmpDir, "test_n.jsonl");
  writeFileSync(path, bad + "\n" + good + "\n");
  const out = run(["--jsonl", path]);
  let pass = false;
  try {
    const res = JSON.parse(out.stdout);
    const first = res.results[0], second = res.results[1];
    const ctxErrs = first.errors.filter((e) => e.code === "E-REC-CONTEXT").length;
    pass = res.results.length === 2 && ctxErrs === 3 && second.ok === true && !res.results.some((r) => r.errors.some((e) => e.code === "E-INPUT"));
  } catch { pass = false; }
  tests.push({ name: "(n) rec 열거 밖 값(surface:{}/engine:flux/channel_limit:-5) → E-REC-CONTEXT 3건 + 다음 레코드 정상", pass });
}

// (o) --channel-limit 관대 파싱 금지: "1e9"·"5.9"·"2000abc" 전부 E-INPUT-FLAG + exit≠0
{
  const path = join(tmpDir, "test_o.txt");
  writeFileSync(path, "x\nAR 3:4");
  const pass = ["1e9", "5.9", "2000abc", "0"].every((v) => {
    const res = run(["--channel-limit", v, path]);
    return res.exitCode !== 0 && res.stdout.includes("E-INPUT-FLAG");
  });
  tests.push({ name: "(o) --channel-limit 1e9/5.9/2000abc/0 → 전부 E-INPUT-FLAG", pass });
}

// (p) S2 기본 엔진은 unknown — 엔진을 발명하지 않는다: --surface s2 단독 2100자 → 오버플로 없음 + W-LENGTH-UNGATED
{
  const prompt = "x".repeat(2100) + "\nAR 3:4";
  const path = join(tmpDir, "test_p.txt");
  writeFileSync(path, prompt);
  const res = JSON.parse(run(["--surface", "s2", path]).stdout);
  const pass = !res.errors.some((e) => e.code.includes("OVERFLOW")) && res.warnings.some((w) => w.code === "W-LENGTH-UNGATED");
  tests.push({ name: "(p) --surface s2 단독 → 엔진 unknown 기본, W-LENGTH-UNGATED", pass });
}

// (q) 곡선따옴표 리터럴 회귀 핀: “…” 카피가 따옴표로 감지되어야 함 (ASCII 정규화 사고 방지)
{
  const path1 = join(tmpDir, "test_q1.txt");
  writeFileSync(path1, "포스터 Scene: 아침 카페 테이블. Text-in-image: 상단 타이틀 “아침 커피”. Camera: 정면. Lighting: 자연광. Texture/Medium: 종이 질감.\nAR 3:4");
  const res1 = JSON.parse(run([path1]).stdout);
  const noQuoteErr = !res1.errors.some((e) => e.code === "E-TEXT-QUOTE");
  const path2 = join(tmpDir, "test_q2.txt");
  writeFileSync(path2, "포스터 Scene: 아침 카페 테이블. Text-in-image: 상단 타이틀 “아침 커피”, 하단 캡션 “아침 커피”. Camera: 정면. Lighting: 자연광. Texture/Medium: 종이 질감.\nAR 3:4");
  const res2 = JSON.parse(run([path2]).stdout);
  const dupCaught = res2.errors.some((e) => e.code === "E-TEXT-DUP");
  tests.push({ name: "(q) 곡선따옴표 “” 카피 감지 (E-TEXT-QUOTE 오탐 없음 + E-TEXT-DUP 검출)", pass: noQuoteErr && dupCaught });
}

// native는 opt-in 텍스트 검사다. compiled 계약과 파라미터 검증의 우회로가 아니어야 한다.
{
  const prompt = readFileSync("scripts/fixtures/good/native_product_edit.txt", "utf8");
  const invoke = (args = [], input = prompt) => {
    const result = run(["--profile", "native", ...args], input);
    return { ...JSON.parse(result.stdout), exitCode: result.exitCode };
  };
  const hasCode = (result, code) => !result.ok && result.exitCode !== 0 && result.errors.some((e) => e.code === code);
  const native = invoke();
  tests.push({ name: "native edit → AR/negative 오류 없이 텍스트 전용 결과 표시", pass:
    native.ok && native.exitCode === 0 && native.profile === "native" && native.validation_scope === "prompt-text-only"
    && native.format === null && native.tier === null
    && ["api_parameters", "input_images", "semantic_fidelity", "render_quality"].every((scope) => native.not_checked.includes(scope)) });

  const compiled = JSON.parse(run([], prompt).stdout);
  tests.push({ name: "동일 native 입력의 기본 compiled → 기존 AR/Tier 계약 유지", pass:
    !compiled.ok && compiled.profile === "compiled"
    && ["E-AR-END", "E-NEG-001"].every((code) => compiled.errors.some((e) => e.code === code)) });

  const conflictFlags = [
    ["--tier", "0"], ["--tier", "1"], ["--tier", "2"], ["--api"],
    ["--surface", "s1"], ["--jsonl", "scripts/fixtures/good/records.jsonl"],
  ];
  tests.push({ name: "native + tier 0/1/2·api·S1·jsonl → 명시 충돌 거부", pass:
    conflictFlags.every((flags) => hasCode(invoke(flags), "E-PROFILE-CONFLICT")) });

  tests.push({ name: "native + 다른 엔진 → E-ENGINE-SCOPE", pass:
    ["higgsfield", "midjourney", "unknown"].every((engine) => hasCode(invoke(["--engine", engine]), "E-ENGINE-SCOPE")) });
  tests.push({ name: "native 빈 입력·BOM/공백 입력 → E-PROMPT-EMPTY", pass:
    ["", "\uFEFF \n\t"].every((input) => hasCode(invoke([], input), "E-PROMPT-EMPTY")) });

  const record = JSON.parse(readFileSync("scripts/fixtures/good/records.jsonl", "utf8").split(/\r?\n/).find((line) => line.trim()));
  const path = join(tmpDir, "native_record_bypass.jsonl");
  writeFileSync(path, JSON.stringify({ ...record, profile: "native", full_prompt: prompt }));
  const batch = JSON.parse(run(["--jsonl", path]).stdout);
  tests.push({ name: "record.profile=native → compiled 계약을 유지하며 우회 거부", pass:
    !batch.ok && batch.profile === "compiled"
    && ["E-PROFILE-CONFLICT", "E-AR-END"].every((code) => batch.results[0].errors.some((e) => e.code === code)) });

  tests.push({ name: "native JSON body·malformed JSON·jsonl·fenced JSON → 텍스트 검사로 통과 불가", pass:
    ['{"prompt":"blue cup"}', '{"prompt":', '{"prompt":"cup"}\n{"prompt":"bowl"}', '```json\n{"prompt":"cup"}\n```']
      .every((input) => hasCode(invoke([], input), "E-NATIVE-INPUT")) });

  tests.push({ name: "native JSON body의 언어 없는·text·tilde 바깥 fence → 우회 거부", pass:
    ['```\n{"model":"gpt-image-2","prompt":"cup"}\n```', '```text\n{"prompt":"cup"}\n```', '~~~\n{"prompt":"cup"}\n~~~', '```\n[{"prompt":"cup"}]\n```']
      .every((input) => hasCode(invoke([], input), "E-NATIVE-INPUT"))
    && invoke([], '```\nChange the background to blue.\n```').ok });

  tests.push({ name: "native 숫자·boolean·중첩·빈 JSON 배열과 바깥 fence → 거부, 자연어 라벨·인용 카피 → 유지", pass:
    ['[1, 2]', '[true]', '[[1, 2]]', '[]', '[null]', '```\n[1, 2]\n```', '~~~text\n[true]\n~~~', '```\n[[1, 2]]\n````']
      .every((input) => hasCode(invoke([], input), "E-NATIVE-INPUT"))
    && ['[Reference image] Change only the background to pale blue.', 'Create a poster reading “[1, 2]” exactly once, legibly.']
      .every((input) => invoke([], input).ok) });

  tests.push({ name: "native 미지·누락 profile 및 jsonl 값 → E-INPUT-FLAG", pass:
    [["--profile", "unknown"], ["--profile"], ["--jsonl"], ["--jsonl", "--surface", "s3"]]
      .every((flags) => hasCode(invoke(flags), "E-INPUT-FLAG")) });

  const atEngineLimit = invoke(["--surface", "s2"], "x".repeat(32000));
  const aboveEngineLimit = invoke(["--surface", "s2"], "x".repeat(32001));
  tests.push({ name: "native S2 → GPT Image 32000자 경계 적용", pass:
    atEngineLimit.ok && hasCode(aboveEngineLimit, "E-OVERFLOW-LIMIT")
    && aboveEngineLimit.errors.some((e) => e.msg.includes("타깃 엔진")) });
  tests.push({ name: "native S3 → 기본 채널·명시 채널 한도와 엔진 한도 유지", pass:
    hasCode(invoke([], "x".repeat(2001)), "E-OVERFLOW-2000")
    && invoke(["--channel-limit", "10"], "x".repeat(10)).ok
    && hasCode(invoke(["--channel-limit", "10"], "x".repeat(11)), "E-OVERFLOW-LIMIT")
    && hasCode(invoke(["--channel", "unbounded"], "x".repeat(32001)), "E-OVERFLOW-LIMIT") });

  tests.push({ name: "native 부정형 가드 허용·새 타엔진 flag 거부", pass:
    invoke([], "Keep the original logo. No watermark.").ok
    && invoke([], "배경만 흰색으로 바꾸고 상품 로고를 보존한다. 그림자 추가 금지.").warnings.every((w) => w.code !== "W-NEG-KO")
    && hasCode(invoke([], "A blue cup --oref image.png"), "E-MJ-FLAG") });

  tests.push({ name: "native 구두점 뒤 타엔진 flag → 거부, 정확 인용 카피 → 보존", pass:
    ["A portrait (--oref ref.png)", "A cup,--quality 2", "A cup;--weird 5", "A cup：--weird 5"]
      .every((input) => hasCode(invoke([], input), "E-MJ-FLAG"))
    && ['Create a poster headline "A portrait (--oref ref.png)".', 'Create a poster headline “A cup,--quality 2”.']
      .every((input) => invoke([], input).ok) });

  const watermark = JSON.parse(run([], "원본 상품과 로고를 보존한다. no   watermark. AR 1:1").stdout);
  const hint = watermark.errors.find((e) => e.code === "E-NEG-001")?.hint ?? "";
  tests.push({ name: "watermark 재작성 제안 → 원본 로고를 제거하지 않음", pass:
    hint.includes("원본 로고는 보존") && !hint.includes("브랜드 없는") });
}

// JSONL must report per-row failures and validate approval scores without coercion.
{
  const base = { id: "audit", category: "C3", ar: "1:1", size: "1024x1024", quality: "high", full_prompt: "흰 배경 위 빨간 사과. AR 1:1", output_path: "out/audit.png" };
  const invokeRecords = (rows) => {
    const file = join(tmpDir, "audit-records.jsonl");
    writeFileSync(file, rows.map((row) => JSON.stringify(row)).join("\n"));
    return JSON.parse(run(["--jsonl", file]).stdout);
  };
  const mixed = invokeRecords([null, [], true, 17, base]);
  tests.push({ name: "JSONL 잘못된 행도 뒤의 정상 행까지 검사", pass:
    mixed.summary?.total === 5 && mixed.summary.pass === 1 && mixed.summary.fail === 4
    && mixed.results.slice(0, 4).every((r) => r.errors.some((e) => e.code === "E-REC-OBJECT")) });
  const approved = { ...base, status: "approved", qa: { goal_fit: 5, text_accuracy: 5, material_realism: 5, layout: 5 } };
  tests.push({ name: "QA 점수 범위·타입 오류로 승인 통과 불가", pass:
    [99, -1, "5", true, null].every((value) => {
      const report = invokeRecords([{ ...approved, qa: { ...approved.qa, goal_fit: value } }]);
      return !report.ok && report.results[0].errors.some((e) => e.code === "E-QA-GATE");
    }) && invokeRecords([approved]).ok });
  const textNA = { ...approved, qa: { ...approved.qa, text_accuracy: null } };
  tests.push({ name: "따옴표 종류와 무관하게 렌더 카피에 QA N/A 불가", pass:
    ['포스터에 "봄"을 또렷하게 렌더한다. AR 1:1', '포스터에 “봄”을 또렷하게 렌더한다. AR 1:1']
      .every((full_prompt) => !invokeRecords([{ ...textNA, full_prompt }]).ok)
    && invokeRecords([textNA]).ok });
  tests.push({ name: "공백뿐인 필수 ID·경로는 거부", pass:
    ["id", "output_path"].every((field) => !invokeRecords([{ ...base, [field]: "   " }]).ok) });
}

// Tier-2 must preserve the requested adult identity instead of imposing a demographic.
{
  const safety = "adult subject, non-nude fashion editorial, fully opaque clothing, secure garment coverage, non-sexual presentation";
  const tail = "no nudity, no nipple or genital exposure, no wardrobe malfunction";
  tests.push({ name: "Tier-2 안전 문구는 성별·민족·특정 나이·가상 인물을 강제하지 않음", pass:
    ["a 60-year-old Italian man in a wool suit, preserve the reference identity and seated pose", "a 35-year-old Black woman in a coat, preserve the reference identity"]
      .every((identity) => JSON.parse(run(["--tier", "2"], `${safety}, ${identity}, ${tail}, AR 2:3`).stdout).ok)
    && !JSON.parse(run(["--tier", "2"], `portrait, ${tail}, AR 2:3`).stdout).ok });
}

// Print results
console.log("표면/채널/엔진 컨텍스트 행동 테스트\n");
let fails = 0;
for (const t of tests) {
  console.log(`${t.pass ? "✓" : "✗"} ${t.name}`);
  if (!t.pass) fails++;
}

console.log(`\n${tests.length - fails}/${tests.length} tests passed`);

// Cleanup
rmSync(tmpDir, { recursive: true, force: true });

process.exit(fails ? 1 : 0);
