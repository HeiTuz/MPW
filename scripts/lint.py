#!/usr/bin/env python3
"""MPW self-lint.

Checks the skill's own hardlines against its files:
- every measured-length label — "(N자 실측)" / "실측: N자" / "N자 실측" / bare "(…, N자)"
  — matches the adjacent ```text block's body length across ALL core files.
  Count method = trimmed body, code points (equivalent to check_prompt.mjs's
  trimmed .length and to grapheme count for this repo's BMP/no-combining text;
  blocks containing combining marks or ZWJ fail loudly instead of miscounting).
  Labels bind to the nearest ```text fence before or after within BIND_WINDOW
  chars; far references (checklist/table mentions) must match some block in the
  same file.
- every ```text example block is <= 2000 chars (all core files)
- no approximate labels (`약 N자`)
- YAML frontmatter parses and carries version + dated model/role review stamps (rejects future dates; re-verify after 6 calendar months)
- canonical inline `(YYYY-MM 실측...)` measurement stamps are current, non-future, and used across all repository-owned Markdown
- no Cyrillic/Greek lookalike letters
- canonical rules defined exactly once (gate necessity test, non-inferable slot list)
- package.json version matches SKILL.md frontmatter version
- runtime/model names and operator-specific address stay out of core prompt files except image/video engine names
- Tier-2 frozen strings byte-identical 3-way: editorial/tier2-safety.md §2 code blocks
  (SSOT) == compiler.md §2 inline copy == check_prompt.mjs SAFETY_ASSERT/TAIL constants;
  ANCHORS remains a containment guard for runtime anchor drift.

Exit 0 on pass, 1 on any failure. No dependencies beyond PyYAML (optional:
falls back to a minimal frontmatter parse when PyYAML is missing).
"""
import calendar, json, re, sys, unicodedata, pathlib
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent.parent
FILES = ["SKILL.md", "references/image/from-image.md", "references/templates.md", "references/model-playbooks.md", "references/adapters.md",
         "references/prompt-graph.md", "references/image/surfaces.md", "references/image/model-routing.md",
         "references/image/lanes.md", "references/image/compiler.md", "references/image/categories.md",
         "references/image/editorial-fashion.md", "references/image/editorial/format-b.md",
         "references/image/editorial/tier2-safety.md", "references/image/editorial/taxonomy-dna.md",
         "references/image/editorial/photo-vocab.md", "references/image/editorial/scene-craft.md",
         "references/image/editorial/concept-collision.md", "references/image/look-and-concept.md",
         "references/image/typography.md", "references/image/production.md",
         "references/image/realism.md", "references/midjourney-character-sheets.md",
         "references/midjourney-identity.md"]
SSOT = "references/image/editorial/tier2-safety.md"   # Tier-2 동결 문자열 정본 (§2 코드블록)
COMPILER = "references/image/compiler.md"
VALIDATOR = ROOT / "scripts" / "check_prompt.mjs"
# check_prompt.mjs ANCHORS 구조 고정. E-TIER2-PAIR는 앵커 3개 이상이 잡혀야 tail 단독을
# 허용하므로, 앵커가 줄거나 무차별해지면 그 게이트가 조용히 죽는다. 대조 코퍼스는 안전
# 문구가 전혀 없는 일반 프롬프트이며 앵커는 여기 거의 걸리지 않아야 한다.
ANCHOR_COUNT = 5
ANCHOR_PAIR_THRESHOLD = 3
ANCHOR_CONTROL_CORPUS = (
    "Korean event poster, bold serif headline, neon night market scene, four-color palette, "
    "commercial print finish, legible hangul copy, wide establishing composition"
)
# 라벨 3+1포맷: "N자 실측"(괄호형 포함) / "실측: N자" / bare "(…, N자)" — "블록당 N자"(규칙 문구)와
# "제3자" 같은 비라벨은 제외. bare 포맷은 실길이 라벨만 대상(N >= 50).
LABEL_PATTERNS = [r"(?<!블록당 )(?<!\d)(\d+)자 실측", r"실측:\s*(\d+)자", r"(?<!제)(?<!\d)(\d+)자\)"]
STAMP_FUTURE_SKEW_DAYS = 1  # author-local vs CI-UTC date skew
BARE_PATTERN_MIN = 50
BIND_WINDOW = 200  # 라벨-코드블록 펜스 간 인접 판정 거리(문자)
MEASUREMENT_STAMP_PATTERN = re.compile(r"\((\d{4})-(\d{2}) 실측[^)\n]*\)")
REVIEW_STAMP_FIELDS = ("model_claims_reviewed_at", "role_routing_reviewed_at")
LINK_PATTERN = re.compile(r"(?<!!)\[[^\]]*\]\(([^\n)]+)\)")
PLAIN_PATH_PATTERN = re.compile(
    r"(?<![\w/{*/])((?:\.\.?/)*(?:(?:[A-Za-z0-9_-]+/)+)?[A-Za-z0-9_-]+\.(?:md|py))(?![\w/}*])"
)
RUNTIME_NAME_PATTERNS = (
    r"\bHermes\b", r"\bClaude\b", r"\bCodex\b", r"\bGJC\b",
    r"\bSol\b", r"\bTerra\b", r"\bLuna\b", r"\bOpus\b", r"\bSonnet\b",
    r"\bBoss\b", r"(?:이|해당|우리) 사용자(?:의)?\s+(?:기본|선호|설정|취향)",
)
CORE_RUNTIME_NAME_FILES = (
    "SKILL.md",
    "references/templates.md",
    "references/model-playbooks.md",
    *(
        path.relative_to(ROOT).as_posix()
        for path in sorted((ROOT / "references" / "image").rglob("*.md"))
    ),
)
# External/conceptual filenames used as examples, not package pointers. A resolved
# path or removed mention makes its entry stale and therefore fails.
PLAIN_PATH_WHITELIST = {
    ("agents/README.md", "CLAUDE.md"),
    ("agents/README.md", "INSTALL_FOR_AGENTS.md"),
    ("references/templates.md", "summary.md"),
}
# These operational references are deliberately not dispatched from the compact
# SKILL.md kernel. Keep exceptions explicit: a deleted or newly reachable file
# must not silently remain here.
# 고아 레퍼런스 화이트리스트 — 도달 불가능하지만 공개 문서 목적인 파일들만 기록.
# 현재 비어있음: 모든 문서가 도달 가능해야 함(장기 미사용은 git 청소 대상).
ORPHAN_REFERENCE_WHITELIST = set()


def fail(msgs):
    for m in msgs: print("FAIL", m)
    sys.exit(1)


def measured_len(body):
    """트림된 본문 코드포인트 수 — check_prompt.mjs의 trim() 후 .length와 등가."""
    return len(body.strip())


def grapheme_unsafe(body):
    return any(unicodedata.combining(c) or c == "\u200d" for c in body)


def line_of(s, pos):
    return s.count("\n", 0, pos) + 1


def six_months_before(today):
    """오늘 기준 6 calendar months 전의 같은 날(없는 날짜는 월말)."""
    month_index = today.year * 12 + today.month - 1 - 6
    year, month_zero_based = divmod(month_index, 12)
    month = month_zero_based + 1
    return date(year, month, min(today.day, calendar.monthrange(year, month)[1]))


def parse_frontmatter(fm, use_yaml=True):
    """Parse frontmatter consistently with and without optional PyYAML."""
    if use_yaml:
        try:
            import yaml
        except ImportError:
            pass
        else:
            parsed = yaml.safe_load(fm) or {}
            metadata = parsed.get("metadata") or {}
            return parsed.get("version"), {
                field: value.isoformat() if isinstance(value, date) else value
                for field, value in metadata.items()
            }

    vm = re.search(r"^version:\s*([^\n]+)", fm, re.M)
    version = vm.group(1).strip().strip("\"'") if vm else None
    metadata = {}
    # metadata 블록: 들여쓴 항목 + 빈 줄 + 주석 줄까지 포함, 다음 최상위 키에서 종료 (PyYAML과 동일 범위)
    block = re.search(r"^metadata:\s*\n((?:^(?: {2}.*|[ \t]*(?:#.*)?)(?:\n|$))*)", fm, re.M)
    if block:
        for field in REVIEW_STAMP_FIELDS:
            stamp = re.search(rf"^ {{2}}{field}:\s*(?:\"([^\"\n]*)\"|'([^'\n]*)'|([^#\n]*))", block.group(1), re.M)
            if stamp:
                value = next(g for g in stamp.groups() if g is not None).strip()
                if value:
                    metadata[field] = value
    return version, metadata


def check_review_stamps(metadata, errors, today):
    cutoff = six_months_before(today)
    for field in REVIEW_STAMP_FIELDS:
        value = metadata.get(field)
        if isinstance(value, date):
            value = value.isoformat()
        if not value:
            errors.append(f"frontmatter: {field} missing")
            continue
        if not isinstance(value, str) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}", value):
            errors.append(f"frontmatter: {field} must be a YYYY-MM-DD string")
            continue
        try:
            reviewed_at = date.fromisoformat(value)
        except ValueError:
            errors.append(f"frontmatter: {field} must be a valid YYYY-MM-DD date")
            continue
        # Stamps are written in the author's local timezone; CI ages them in UTC,
        # so a stamp written today can read one day ahead. Tolerate exactly that.
        # A real typo (a year out) is hundreds of days ahead and still caught.
        if (reviewed_at - today).days > STAMP_FUTURE_SKEW_DAYS:
            errors.append(f"frontmatter: {field} {value} violates — future-dated review stamp")
        elif reviewed_at < cutoff:
            errors.append(f"frontmatter: {field} {value} violates the 6-month re-verification rule (AGENTS.md hardline 4)")


def check_measurement_stamps(f, s, errors, today):
    for match in MEASUREMENT_STAMP_PATTERN.finditer(s):
        year, month = map(int, match.groups())
        stamp = match.group(0)
        line = line_of(s, match.start())
        if not 1 <= month <= 12:
            errors.append(f"{f}:{line}: invalid measurement stamp {stamp}")
        elif (year, month) > (today.year, today.month):
            errors.append(f"{f}:{line}: measurement stamp {stamp} violates — future-dated measurement stamp")
        elif (today.year - year) * 12 + today.month - month > 6:
            errors.append(f"{f}:{line}: measurement stamp {stamp} violates the 6-month re-verification rule (AGENTS.md hardline 4)")


def check_measurement_near_misses(f, s, errors):
    canonical_spans = [match.span() for match in MEASUREMENT_STAMP_PATTERN.finditer(s)]
    pattern = re.compile(r"실측[^\n]{0,12}\d{4}-\d{2}|\d{4}-\d{2}[^\n]{0,12}실측")
    for match in pattern.finditer(s):
        if any(start <= match.start() and match.end() <= end for start, end in canonical_spans):
            continue
        errors.append(
            f"{f}:{line_of(s, match.start())}: noncanonical measurement stamp — use (YYYY-MM 실측) form"
        )


def check_universal_2000_regression(text, errors, filename="references/templates.md"):
    """I0: must not turn a surface-specific limit into a universal constant."""
    patterns = (
        r"(?:모든|전부|각|항상|언제나|무조건|일괄)\s*(?:프롬프트|출력|블록)[^\n.]{0,80}2000\s*자",
        r"2000\s*자[^\n.]{0,80}(?:모든|전부|각|항상|언제나|무조건|일괄)\s*(?:프롬프트|출력|블록)",
        r"전역\s*2000\s*자(?![^\n.]{0,24}(?:없|아닌|아님|않))",
        r"(?:표면|채널|엔진)[^\n.]{0,20}(?:무관|상관없)[^\n.]{0,40}2000\s*자",
        r"(?:프롬프트|출력|블록)[^\n.]{0,20}(?:항상|언제나|무조건|일괄)[^\n.]{0,60}2000\s*자",
    )
    for pat in patterns:
        match = re.search(pat, text, re.I)
        if match:
            errors.append(
                f"{filename}:{line_of(text, match.start())}: [I0] universal 2000-character rule regression"
            )


def check_mj_flag_sync(root, errors):
    """I16: Grok gate-card MJ flags and the validator constant stay byte-identical."""
    doc_path = root / "references" / "image" / "grok-imagine.md"
    validator_path = root / "scripts" / "check_prompt.mjs"
    try:
        doc = doc_path.read_text(encoding="utf-8")
        validator = validator_path.read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"[I16] MJ flag sync input missing — {exc}")
        return
    gate = re.search(r"^## 게이트 카드\s*$\n(.*?)(?=^## |\Z)", doc, re.M | re.S)
    constant = re.search(r'const BANNED_MJ_FLAGS = \[([^\]]*)\];', validator)
    if not gate or not constant:
        errors.append("[I16] MJ flag sync source is not parseable")
        return
    documented = list(dict.fromkeys(re.findall(r"`--([a-z][a-z0-9-]*)\b", gate.group(1), re.I)))
    implemented = re.findall(r'"([a-z][a-z0-9-]*)"', constant.group(1), re.I)
    if "\0".join(documented).encode("utf-8") != "\0".join(implemented).encode("utf-8"):
        errors.append(
            "[I16] Grok gate-card Midjourney flags and check_prompt.mjs BANNED_MJ_FLAGS byte mismatch"
        )


def check_runtime_names(texts, errors):
    """I1: runtime-specific names and operator address do not belong in core."""
    for f in CORE_RUNTIME_NAME_FILES:
        scan_text = texts[f]
        if f == "references/model-playbooks.md":
            scan_text = scan_text.split("\n## 호환 노트", 1)[0]
        for pat in RUNTIME_NAME_PATTERNS:
            match = re.search(pat, scan_text)
            if match:
                errors.append(
                    f"{f}:{line_of(scan_text, match.start())}: [I1] runtime/operator token belongs in references/adapters.md or dated compatibility notes, not core ({match.group(0)})"
                )


def markdown_files(root):
    """Repository-owned Markdown only; hidden caches and local session traces are not documentation."""
    excluded = {"node_modules", "docs-internal", "__pycache__"}
    return sorted(
        path for path in root.rglob("*.md")
        if not any(part.startswith(".") or part in excluded for part in path.relative_to(root).parts)
    )


def markdown_link_target(raw):
    """Return a local path component, ignoring anchors, titles, and external URI schemes."""
    raw = raw.strip()
    if raw.startswith("<"):
        end = raw.find(">")
        if end == -1:
            return None
        raw = raw[1:end]
    else:
        raw = raw.split(None, 1)[0]
    target = raw.split("#", 1)[0]
    if not target or "://" in target or target.startswith(("mailto:", "/")):
        return None
    return target


def link_base(root, source):
    """Installer overlays link as if copied into the payload root, not under agents/."""
    relative = source.relative_to(root)
    return root if relative.parts[0] == "agents" else source.parent

def check_plaintext_paths(root, errors):
    """I2: path-like prose/code pointers resolve; routers use graph-visible links."""
    files = markdown_files(root)
    repository_files = [path for path in root.rglob("*") if path.is_file()]
    unresolved = set()
    for source in files:
        source_name = source.relative_to(root).as_posix()
        text = source.read_text(encoding="utf-8")
        # Markdown links are validated and added to the reachability graph below.
        scan_text = LINK_PATTERN.sub(lambda match: " " * len(match.group(0)), text)
        seen = set()
        for match in PLAIN_PATH_PATTERN.finditer(scan_text):
            target = match.group(1)
            key = (source_name, target)
            if key in seen:
                continue
            seen.add(key)
            relative = (link_base(root, source) / target).resolve()
            root_relative = (root / target).resolve()
            bare_match = "/" not in target and any(
                path.name == target for path in repository_files
            )
            resolved = relative.is_file() or root_relative.is_file() or bare_match
            if not resolved:
                unresolved.add(key)
                continue
            if source.name.endswith("-router.md") and target.endswith(".md"):
                errors.append(
                    f"{source_name}:{line_of(text, match.start())}: [I2] router path pointer must be a Markdown link ({target})"
                )

    stale = PLAIN_PATH_WHITELIST - unresolved
    for source_name, target in sorted(stale):
        errors.append(
            f"{source_name}: [I2] plaintext path whitelist entry is stale ({target})"
        )
    for source_name, target in sorted(unresolved - PLAIN_PATH_WHITELIST):
        errors.append(f"{source_name}: [I2] broken plaintext path pointer ({target})")



def check_links_and_orphans(root, errors):
    """I2: validate local Markdown links and require canonical reachability for references."""
    files = markdown_files(root)
    doc_names = {path.relative_to(root).as_posix() for path in files}
    graph = {name: set() for name in doc_names}
    for source in files:
        source_name = source.relative_to(root).as_posix()
        text = source.read_text(encoding="utf-8")
        for match in LINK_PATTERN.finditer(text):
            target = markdown_link_target(match.group(1))
            if target is None:
                continue
            resolved = (link_base(root, source) / target).resolve()
            try:
                relative = resolved.relative_to(root.resolve())
            except ValueError:
                errors.append(f"{source_name}:{line_of(text, match.start())}: [I2] relative link escapes repository ({target})")
                continue
            target_name = relative.as_posix()
            if not resolved.is_file():
                errors.append(f"{source_name}:{line_of(text, match.start())}: [I2] broken relative link ({target})")
            elif target_name in graph:
                graph[source_name].add(target_name)

    reachable = set()
    pending = ["SKILL.md"]
    while pending:
        current = pending.pop()
        if current in reachable:
            continue
        reachable.add(current)
        pending.extend(graph.get(current, set()) - reachable)

    references = {name for name in doc_names if name.startswith("references/")}
    stale = ORPHAN_REFERENCE_WHITELIST - references
    for name in sorted(stale):
        errors.append(f"{name}: [I2] orphan whitelist entry no longer names a reference")
    for name in sorted(references - reachable - ORPHAN_REFERENCE_WHITELIST):
        errors.append(f"{name}: [I2] orphan reference is not reachable from SKILL.md")


def check_key_fill_ratios(root, errors):
    """I6: key:fill uses key-side:shadow-side notation; 1:n reverses its meaning."""
    pattern = re.compile(r"\bkey\s*:\s*fill\s+(\d+)\s*:\s*(\d+)\b", re.I)
    for path in markdown_files(root):
        text = path.read_text(encoding="utf-8")
        for match in pattern.finditer(text):
            key_val, fill_val = int(match.group(1)), int(match.group(2))
            if key_val == 1 and fill_val >= 2:  # 1:n where n >= 2 (all reversed ratios)
                name = path.relative_to(root).as_posix()
                errors.append(f"{name}:{line_of(text, match.start())}: [I6] key:fill ratio must be key-side:shadow-side, not 1:{fill_val}")


def skill_body_without_host_surface(text, is_overlay=False):
    """Normalize the only allowed overlay differences before comparing rule bodies."""
    frontmatter = re.match(r"---\n.*?\n---\n", text, re.S)
    if not frontmatter:
        return None
    body = text[frontmatter.end():]
    if not is_overlay:
        return body
    body = re.sub(r"^(\n?)# MPW — 디스패치 커널 \([^)\n]+ 표면\)\n\n", r"\1# MPW — 디스패치 커널\n\n", body)
    body = re.sub(r"^(\n?# MPW — 디스패치 커널\n\n)> \*\*호스트 통합 —.*?\n\n", r"\1", body, count=1, flags=re.S)
    return body


def check_agent_skill_sync(root, canonical_text, errors):
    """I14: each host overlay must preserve the canonical rule body exactly."""
    canonical_body = skill_body_without_host_surface(canonical_text)
    if canonical_body is None:
        return
    canonical_version, _ = parse_frontmatter(re.match(r"---\n(.*?)\n---\n", canonical_text, re.S).group(1))
    for path in sorted((root / "agents").glob("*/SKILL.md")):
        host = path.parent.name
        name = path.relative_to(root).as_posix()
        text = path.read_text(encoding="utf-8")
        match = re.match(r"---\n(.*?)\n---\n", text, re.S)
        overlay_body = skill_body_without_host_surface(text, is_overlay=True)
        if not match or overlay_body is None:
            errors.append(f"{name}: [I14] missing parseable frontmatter or host integration block")
            continue
        _, metadata = parse_frontmatter(match.group(1))
        host_surface = re.search(r"^  host_surface:\s*([^\n#]+)", match.group(1), re.M)
        source = re.search(r"^  canonical_source:\s*[\"']?([^\n\"']+)", match.group(1), re.M)
        if not host_surface or host_surface.group(1).strip().strip("\"'") != host:
            errors.append(f"{name}: [I14] host_surface must match overlay directory ({host})")
        expected_source = f"HeiTuz/MPW SKILL.md v{canonical_version}"
        if not source or source.group(1).strip() != expected_source:
            errors.append(f"{name}: [I14] canonical_source must be {expected_source}")
        if text == canonical_text:
            errors.append(f"{name}: [I14] overlay must retain host migration evidence")
        if overlay_body != canonical_body:
            errors.append(f"{name}: [I14] rule body drift from SKILL.md")


def check_contract_index_table(root, errors):
    """I15 — adapters.md 기계 계약 인덱스 표가 manifest의 계약 전부를 담는지.

    manifest·validate.py·테스트는 계약 추가 시 함께 움직이지만(test_contracts.py가
    강제) 인덱스 표는 사람 규칙으로만 유지돼 조용히 낡는다.
    """
    manifest_path = root / "contracts" / "manifest.json"
    adapters_path = root / "references" / "adapters.md"
    if not manifest_path.is_file() or not adapters_path.is_file():
        return
    try:
        files = json.loads(manifest_path.read_text(encoding="utf-8"))["files"]
    except Exception as e:  # noqa: BLE001
        errors.append(f"contracts/manifest.json: [I15] 읽기 실패 — {e}")
        return
    schemas = sorted(
        rel.rsplit("/", 1)[-1]
        for rel in files
        if rel.startswith("v1/") and rel.endswith(".schema.json")
    )
    table = adapters_path.read_text(encoding="utf-8")
    for name in schemas:
        if name not in table:
            errors.append(
                f"references/adapters.md: [I15] 기계 계약 인덱스 표에 {name} 행이 없다"
                " — manifest에 계약이 추가되면 표도 갱신한다"
            )


def check_labels(f, s, errors):
    blocks = [(m.start(), m.end(), m.group(1)) for m in re.finditer(r"```text\n(.*?)```", s, re.S)]
    lengths = {measured_len(b) for _, _, b in blocks}
    seen = set()
    for pi, pat in enumerate(LABEL_PATTERNS):
        for lm in re.finditer(pat, s):
            span = lm.span(1)
            if span in seen:
                continue
            seen.add(span)
            n = int(lm.group(1))
            if pi == 2 and n < BARE_PATTERN_MIN:
                continue
            fwd = next(((b[0] - lm.end(), b) for b in blocks if b[0] >= lm.end()), None)
            back = None
            for b in blocks:
                if b[1] <= lm.start():
                    back = (lm.start() - b[1], b)
            cands = [c for c in (fwd, back) if c is not None and c[0] <= BIND_WINDOW]
            ln = line_of(s, lm.start())
            if cands:
                body = min(cands, key=lambda c: c[0])[1][2]
                if grapheme_unsafe(body):
                    errors.append(f"{f}:{ln}: text block has combining marks/ZWJ — grapheme 재측정 필요")
                actual = measured_len(body)
                if actual != n:
                    errors.append(f"{f}:{ln}: label {n}자 != 실측 {actual}자 (인접 text 블록)")
            elif n not in lengths:
                errors.append(f"{f}:{ln}: label {n}자 — 인접 블록 없음 + 파일 내 어떤 text 블록과도 불일치")


def check_example_lengths(filename, text, errors):
    for i, body in enumerate(re.findall(r"```text\n(.*?)```", text, re.S)):
        actual = measured_len(body)
        if actual > 2000:
            errors.append(f"{filename}: text block #{i} is {actual} chars (> 2000)")


def check_frozen_strings(texts, errors):
    """Tier-2 동결 문자열 3자 byte 대조: SSOT(editorial/tier2-safety.md §2) / compiler.md 인라인 / check_prompt.mjs SAFETY_ASSERT 상수."""
    ssot = texts.get(SSOT, "")
    comp = texts.get(COMPILER, "")

    def ssot_block(header):
        m = re.search(re.escape(header) + r".*?```text\n(.*?)```", ssot, re.S)
        return m.group(1).strip() if m else None

    a = ssot_block("**SAFETY_ASSERT")
    t = ssot_block("**NEGATIVE_TAIL")
    if a is None or t is None:
        errors.append(f"{SSOT}: §2 SAFETY_ASSERT/NEGATIVE_TAIL SSOT 코드블록을 찾지 못함")
        return
    ca = re.search(r"SAFETY_ASSERT: `([^`]+)`", comp)
    ct = re.search(r"NEGATIVE_TAIL: `([^`]+)`", comp)
    if not ca or not ct:
        errors.append(f"{COMPILER}: §2 인라인 SAFETY_ASSERT/NEGATIVE_TAIL 복사본을 찾지 못함")
    else:
        if ca.group(1).encode("utf-8") != a.encode("utf-8"):
            errors.append(f"{COMPILER}: SAFETY_ASSERT 인라인 복사본이 SSOT({SSOT} §2)와 byte 불일치")
        if ct.group(1).encode("utf-8") != t.encode("utf-8"):
            errors.append(f"{COMPILER}: NEGATIVE_TAIL 인라인 복사본이 SSOT({SSOT} §2)와 byte 불일치")
    try:
        mjs = VALIDATOR.read_text(encoding="utf-8")
    except OSError:
        errors.append("scripts/check_prompt.mjs missing — 동결 문자열 대조 불가")
        return
    mt = re.search(r"const TAIL = \[(.*?)\];", mjs)
    if not mt:
        errors.append("check_prompt.mjs: TAIL 상수를 찾지 못함")
    elif ", ".join(re.findall(r'"([^"]*)"', mt.group(1))).encode("utf-8") != t.encode("utf-8"):
        errors.append("check_prompt.mjs: TAIL 상수가 SSOT NEGATIVE_TAIL과 byte 불일치")
    va = re.search(r'const SAFETY_ASSERT = "([^"]*)";', mjs)
    if not va:
        errors.append("check_prompt.mjs: SAFETY_ASSERT 상수를 찾지 못함")
    elif va.group(1).encode("utf-8") != a.encode("utf-8"):
        errors.append("check_prompt.mjs: SAFETY_ASSERT 상수가 SSOT SAFETY_ASSERT과 byte 불일치")
    ma = re.search(r"const ANCHORS = \[(.*?)\];", mjs)
    if not ma:
        errors.append("check_prompt.mjs: ANCHORS 상수를 찾지 못함")
    else:
        anchor_variants = []
        for pat in re.findall(r"/((?:[^/\\]|\\.)*)/", ma.group(1)):
            lit = pat.replace("\\+", "+")
            m2 = re.match(r"^(.*)\(\?\:([^)]*)\)(.*)$", lit)
            variants = [m2.group(1) + alt + m2.group(3) for alt in m2.group(2).split("|")] if m2 else [lit]
            anchor_variants.append((pat, variants))
            if not any(v.lower() in a.lower() for v in variants):
                errors.append(f"check_prompt.mjs: ANCHORS 패턴 /{pat}/ 이 SSOT SAFETY_ASSERT에 없음")
        # Containment alone is not a guard: /a/, /e/, /o/ are all "in" SAFETY_ASSERT, so a
        # one-letter rewrite makes E-TIER2-PAIR unreachable while every gate stays green.
        # Pin the arity and require the set to stay discriminating against a prompt that
        # carries no safety assert at all.
        if len(anchor_variants) != ANCHOR_COUNT:
            errors.append(
                f"check_prompt.mjs: ANCHORS는 {ANCHOR_COUNT}개여야 함 (현재 {len(anchor_variants)}개) — "
                "개수가 줄면 E-TIER2-PAIR 페어 임계가 무의미해진다"
            )
        matched = [pat for pat, variants in anchor_variants
                   if any(v.lower() in ANCHOR_CONTROL_CORPUS.lower() for v in variants)]
        if len(matched) >= ANCHOR_PAIR_THRESHOLD:
            errors.append(
                "check_prompt.mjs: ANCHORS가 안전 문구 없는 대조 프롬프트에 "
                f"{len(matched)}개 매치({', '.join('/' + p + '/' for p in matched)}) — "
                f"{ANCHOR_PAIR_THRESHOLD}개 이상이면 Tier-2 tail 단독 게이트가 무력화된다"
            )


def main():
    errors = []
    today = date.today()
    missing = [f for f in FILES if not (ROOT / f).exists()]
    if missing:
        fail([f"missing file: {m}" for m in missing])
    texts = {f: (ROOT / f).read_text(encoding="utf-8") for f in FILES}
    stamp_files = [
        path.relative_to(ROOT).as_posix()
        for path in markdown_files(ROOT)
    ]
    stamp_texts = {f: (ROOT / f).read_text(encoding="utf-8") for f in stamp_files}
    runtime_texts = {
        f: (ROOT / f).read_text(encoding="utf-8")
        for f in CORE_RUNTIME_NAME_FILES
    }

    # frontmatter
    skill = texts["SKILL.md"]
    m = re.match(r"---\n(.*?)\n---\n", skill, re.S)
    if not m:
        errors.append("SKILL.md: no frontmatter")
    else:
        fm = m.group(1)
        skill_version, metadata = parse_frontmatter(fm)
        if not skill_version:
            errors.append("frontmatter: version missing")
        check_review_stamps(metadata, errors, today)

        try:
            pkg_version = json.loads((ROOT / "package.json").read_text(encoding="utf-8")).get("version")
            if skill_version and pkg_version != skill_version:
                errors.append(f"version mismatch: package.json {pkg_version} != SKILL.md {skill_version}")
        except Exception as e:
            errors.append(f"package.json version check failed: {e}")

    # I0 — templates, SKILL, and references/** (except surfaces.md) may describe a surface-specific 2000-character contract,
    # never a universal prompt constant.
    check_targets = ["references/templates.md", "SKILL.md"]
    check_targets += [f for f in texts.keys() if f.startswith("references/") and f != "references/image/surfaces.md"]
    for f in check_targets:
        if f in texts:
            check_universal_2000_regression(texts[f], errors, f)

    check_contract_index_table(ROOT, errors)
    check_mj_flag_sync(ROOT, errors)

    # label == adjacent block length (전 FILES)
    for f, s in texts.items():
        check_labels(f, s, errors)

    # dated measurement stamps and near-misses (all repository-owned Markdown)
    for f, s in stamp_texts.items():
        check_measurement_stamps(f, s, errors, today)
        check_measurement_near_misses(f, s, errors)
    # all example blocks at or under the trimmed 2000-character contract (전 FILES)
    for f, s in texts.items():
        check_example_lengths(f, s, errors)

    # no approximate labels
    for f, s in texts.items():
        if re.search(r"약 [\d,]+자", s):
            errors.append(f"{f}: approximate length label found")

    # lookalike scan
    for f, s in texts.items():
        bad = sorted({c for c in s if unicodedata.category(c).startswith("L")
                      and ("CYRILLIC" in unicodedata.name(c, "") or "GREEK" in unicodedata.name(c, ""))})
        if bad:
            errors.append(f"{f}: lookalike letters {bad}")

    # canonical single definitions
    if skill.count("게이트 필요성 테스트** —") != 1:
        errors.append("gate necessity test must be defined exactly once in SKILL.md")
    tm = texts.get("references/templates.md", "")
    if tm.count("질문이 정당한 유일 목록 (정본)") != 1:
        errors.append("non-inferable slot canon must appear exactly once in templates.md")

    # I1 — host names remain in adapters and host overlays, not the core.
    check_runtime_names(runtime_texts, errors)

    # I2 / I6 / I14 scan the full repository-owned documentation surface.
    check_links_and_orphans(ROOT, errors)
    check_plaintext_paths(ROOT, errors)
    check_key_fill_ratios(ROOT, errors)
    check_agent_skill_sync(ROOT, skill, errors)

    # Tier-2 동결 문자열 3자 byte 대조
    check_frozen_strings(texts, errors)

    if errors: fail(errors)
    total_labels = sum(len(re.findall(p, s)) for p in LABEL_PATTERNS[:2] for s in texts.values())
    print(f"OK — {len(texts)} files, {total_labels} measured labels, all checks passed")


if __name__ == "__main__":
    main()
