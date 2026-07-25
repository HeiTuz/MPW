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
