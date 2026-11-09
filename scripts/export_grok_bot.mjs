#!/usr/bin/env node
// Text handoff only: no host API, installation, credentials, or routines.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BUNDLES, extractSection } from './read_refs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

// Follow local Markdown dependencies from the canonical kernel. Preserve complete
// files (including their anchors), never maintain another copy of core policy.
export function collectSources(sourceRoot = root) {
  const pending = ['SKILL.md', 'references/adapters.md'];
  const sources = new Map();
  const physicalRoot = fs.realpathSync(sourceRoot);
  while (pending.length) {
    const rel = pending.shift();
    if (sources.has(rel)) continue;
    if (rel !== 'SKILL.md' && !['references/', 'examples/', 'contracts/'].some((prefix) => rel.startsWith(prefix))) {
      throw new Error('unsupported dependency: ' + rel);
    }
    const absolute = path.resolve(sourceRoot, rel);
    if (!fs.realpathSync(absolute).startsWith(physicalRoot + path.sep)) {
      throw new Error('dependency escapes source root: ' + rel);
    }
    const body = fs.readFileSync(absolute, 'utf8');
    sources.set(rel, body);
    for (const match of body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"\n]*")?\)/gu)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z][a-z0-9+.-]*:/iu.test(target)) continue;
      if (!target.endsWith('.md')) continue;
      const dependency = path.posix.normalize(path.posix.join(path.posix.dirname(rel), decodeURIComponent(target)));
      pending.push(dependency);
    }
  }
  return sources;
}

// Bundle definitions stay in read_refs; excerpts retain exact source line bytes.
export function collectBundle(bundle, sourceRoot = root) {
  if (!Object.hasOwn(BUNDLES, bundle)) throw new Error('unknown bundle: ' + bundle);
  const targets = ['SKILL.md', 'references/adapters.md#Grok Bot 개인 스킬 전달', ...BUNDLES[bundle]];
  const physicalRoot = fs.realpathSync(sourceRoot);
  const files = new Map();
  const selections = [];
  for (const target of new Set(targets)) {
    const [file, specList] = target.split('#');
    if (file !== 'SKILL.md' && (!file.startsWith('references/') || !file.endsWith('.md'))) throw new Error('unsupported bundle source: ' + file);
    const absolute = path.resolve(sourceRoot, file);
    if (!fs.realpathSync(absolute).startsWith(physicalRoot + path.sep)) throw new Error('dependency escapes source root: ' + file);
    const source = fs.readFileSync(absolute, 'utf8');
    files.set(file, { path: file, bytes: Buffer.byteLength(source), sha256: sha256(source) });
    for (const spec of specList === undefined ? [null] : specList.split(',')) {
      let body = source;
      let lines = null;
      if (spec !== null) {
        const section = extractSection(source, spec);
        if (section.error) throw new Error(file + ': ' + section.error);
        // extractSection trims trailing whitespace for display; use its line
        // bounds instead so provenance describes an exact contiguous slice.
        const rawLines = source.match(/[^\n]*\n|[^\n]+$/gu) || [];
        body = rawLines.slice(section.from - 1, section.to).join('');
        lines = { from: section.from, to: Math.min(section.to, rawLines.length) };
      }
      selections.push({ path: file, section: spec, lines, bytes: Buffer.byteLength(body), sha256: sha256(body), body });
    }
  }
  // This is a conservative inventory, not a dependency-closure claim. Links to
  // partial files still require checking their target section before use.
  const dependencies = new Map();
  for (const selection of selections) {
    for (const match of selection.body.matchAll(/\[[^\]\n]*\]\(([^\s)]+)(?:\s+"[^"\n]*")?\)/gu)) {
      const link = match[1];
      if (/^[a-z][a-z0-9+.-]*:/iu.test(link)) continue;
      const [file, anchor] = link.split('#');
      const target = file ? path.posix.normalize(path.posix.join(path.posix.dirname(selection.path), decodeURIComponent(file))) : selection.path;
      const whole = selections.some((s) => s.path === target && s.section === null);
      const partial = selections.some((s) => s.path === target);
      dependencies.set(selection.path + ':' + link, { from: selection.path, link, path: target, anchor: anchor ?? null,
        status: whole ? 'file included; anchor not validated' : partial ? 'partial file; target coverage NOT VERIFIED' : 'not included' });
    }
  }
  return { targets, files: [...files.values()], selections, dependencies: [...dependencies.values()] };
}

function exportBundle(out, sourceRoot, bundle) {
  const selected = collectBundle(bundle, sourceRoot);
  const pkg = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'package.json'), 'utf8'));
  const preamble = `# MPW ${pkg.version} — Grok Bot scoped handoff\n\nBundle: ${bundle}\nReal-host validation: NOT RUN.\n\n수동 검토·전달용 작성 지침이며 설치 도구가 아니다. 실제 사용자 작업 입력은 별도로 받는다. SKILL.md 전체와 Grok Bot 어댑터 절, 선택한 bundle의 파일·절만 포함한다. 다른 기능이나 전체 의존성 보존을 보증하지 않는다. 상대 링크는 Source 경로 기준이며 링크 자체가 본문 포함을 의미하지 않는다. manifest.json의 selections와 dependencies로 수신 범위를 확인한다. 필요한 절·파일·스크립트·스키마가 없거나 잘렸으면 해당 경로를 요청하고 의존 작업을 멈춘다. 코드 실행·저장·설치·공유·계정 연결·루틴 생성 권한은 이 전달문으로 생기지 않는다. 실제 호스트 수신·저장·활성화·모델 행동과 도구 검증은 NOT RUN이며 통과로 보고하지 않는다.\n\n`;
  const handoff = preamble + selected.selections.map((s) => `\n<!-- Source: ${s.path} | selection: ${s.section ?? 'whole file'} | lines: ${s.lines ? s.lines.from + '-' + s.lines.to : 'all'} | sha256: ${s.sha256} -->\n\n${s.body}\n<!-- End source: ${s.path} -->\n`).join('');
  const manifest = {
    format: 'mpw-text-handoff/v2', version: pkg.version, mode: 'bundle', bundle,
    host_validation: 'NOT RUN', source_repository: 'https://github.com/HeiTuz/MPW',
    scope: 'Selected sources only; dependency closure and unrelated capabilities NOT VERIFIED. Missing required material must be requested before dependent work.',
    targets: selected.targets, files: selected.files,
    selections: selected.selections.map(({ body, ...record }) => record), dependencies: selected.dependencies,
    handoff: { path: 'HANDOFF.md', bytes: Buffer.byteLength(handoff), sha256: sha256(handoff) },
  };
  fs.mkdirSync(out);
  fs.writeFileSync(path.join(out, 'HANDOFF.md'), handoff, { flag: 'wx' });
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}

export function exportHandoff(out, { sourceRoot = root, bundle = null } = {}) {
  if (/^  host_surface: plugin$/m.test(fs.readFileSync(path.join(sourceRoot, 'SKILL.md'), 'utf8'))) {
    throw new Error('Export requires the canonical MPW checkout, not a plugin cache');
  }
  if (bundle !== null) return exportBundle(out, sourceRoot, bundle);
  const sources = collectSources(sourceRoot); // Fail before creating an incomplete artifact.
  const pkg = JSON.parse(fs.readFileSync(path.join(sourceRoot, 'package.json'), 'utf8'));
  const records = [...sources].map(([file, body]) => ({ path: file, bytes: Buffer.byteLength(body), sha256: sha256(body) }));
  const preamble = `# MPW ${pkg.version} — Grok Bot handoff\n\nGenerated text for manual review; not an installer or native app manifest.\nReal-host validation: NOT RUN.\n\n사용자 전달 요청 예시: “아래 정본 자료를 읽고 MPW로 프롬프트를 작성해줘. 개인 스킬로 저장은 내가 별도로 요청할 때만 해줘.”\n\n이 문서는 작성 지침 묶음이다. 실제 작업 요청·입력 자료는 별도로 받는다. 먼저 Source: SKILL.md와 Source: references/adapters.md의 Grok Bot 절을 읽고 필요한 참고 파일을 찾는다. 각 Source 본문은 정본 그대로이며 상대 링크는 그 Source 경로 기준이다. 코드 실행·계정 연결·설치·스킬 저장·공유·루틴 생성은 이 전달문의 효과가 아니다. 스크립트나 스키마 등 여기 포함되지 않은 의존 자료가 필요하면 해당 경로를 요청하고 의존 작업을 멈춘다. 전체 수신 여부를 확인하고, 누락·잘림이나 실행하지 않은 검증을 성공으로 보고하지 않는다.\n\n`;
  const handoff = preamble + [...sources].map(([file, body]) => `\n<!-- Source: ${file} | sha256: ${sha256(body)} -->\n\n${body}\n<!-- End source: ${file} -->\n`).join('');
  const manifest = {
    format: 'mpw-text-handoff/v1', version: pkg.version,
    host_validation: 'NOT RUN', source_repository: 'https://github.com/HeiTuz/MPW',
    files: records, handoff: { path: 'HANDOFF.md', bytes: Buffer.byteLength(handoff), sha256: sha256(handoff) },
  };
  // Exclusive creation: no --force, recursive removal, cache writes, or overwrites.
  fs.mkdirSync(out);
  fs.writeFileSync(path.join(out, 'HANDOFF.md'), handoff, { flag: 'wx' });
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n', { flag: 'wx' });
  return manifest;
}

export function main(args = process.argv.slice(2)) {
  const usage = 'Usage: node scripts/export_grok_bot.mjs --out <new-directory> [--bundle <name>]';
  let out = null;
  let bundle = null;
  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i], value = args[i + 1];
    if (!value || value.startsWith('--')) throw new Error(usage);
    if (flag === '--out' && out === null) out = value;
    else if (flag === '--bundle' && bundle === null) bundle = value;
    else throw new Error(usage);
  }
  if (out === null) throw new Error(usage);
  const manifest = exportHandoff(path.resolve(out), { bundle });
  console.log(`Exported ${manifest.files.length} canonical sources; ${manifest.handoff.bytes} bytes. Host: NOT RUN.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error('export_grok_bot: ' + error.message); process.exitCode = 1; }
}
