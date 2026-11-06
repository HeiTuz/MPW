#!/usr/bin/env node
// Text handoff only: no host API, installation, credentials, or routines.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

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

export function exportHandoff(out, { sourceRoot = root } = {}) {
  if (/^  host_surface: plugin$/m.test(fs.readFileSync(path.join(sourceRoot, 'SKILL.md'), 'utf8'))) {
    throw new Error('Export requires the canonical MPW checkout, not a plugin cache');
  }
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
  if (args.length !== 2 || args[0] !== '--out' || !args[1] || args[1].startsWith('--')) {
    throw new Error('Usage: node scripts/export_grok_bot.mjs --out <new-directory>');
  }
  const manifest = exportHandoff(path.resolve(args[1]));
  console.log(`Exported ${manifest.files.length} canonical sources; ${manifest.handoff.bytes} bytes. Host: NOT RUN.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error('export_grok_bot: ' + error.message); process.exitCode = 1; }
}
