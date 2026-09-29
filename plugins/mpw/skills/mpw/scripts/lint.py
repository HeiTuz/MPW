#!/usr/bin/env python3
"""MPW self-lint.

Checks the skill's own hardlines against its files:
- every measured-length label — "(N자 실측)" / "실측: N자" / "N자 실측" / bare "(…, N자)"
  — matches the adjacent ```text block's body length across ALL core files.
  Labels count trimmed example bodies in Unicode code points. The prompt checker
  measures untrimmed input after removing a leading BOM. Blocks containing
  combining marks or ZWJ fail loudly instead of miscounting.
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
- documentation scan for labels, example caps, approximate lengths, lookalikes, and I0
  covers SKILL.md plus every references/** Markdown file; FILES is the required-existence list
- I21 compares validator area/name codes with the production.md code table in both directions
- I22 hashes published tokens against a retired-name set (hashes filled at integration)
- directories published wholesale by the package.json `files` manifest carry canon only:
  backup/duplicate artifacts (*.bak, *.bak-<suffix>, *.orig, *.rej, *.save, *~) fail instead
  of shipping a second stale copy of a canonical file

Exit 0 on pass, 1 on any failure. No dependencies beyond PyYAML (optional:
falls back to a minimal frontmatter parse when PyYAML is missing).
"""
import calendar, hashlib, json, re, sys, unicodedata, pathlib
from datetime import date

ROOT = pathlib.Path(__file__).absolute().parent.parent
FILES = [
    "SKILL.md",
    "references/templates/common.md",
    "references/templates/delegation.md",
    "references/templates/contract.md",
    "references/templates/model.md",
    "references/model-playbooks.md",
    "references/adapters.md",
    "references/image/surfaces.md",
    "references/image/surface-contracts.md",
    "references/image/model-routing.md",
    "references/image/compiler.md",
    "references/image/text-structure.md",
    "references/image/production.md",
    "references/image/editorial-fashion.md",
    "references/image/editorial/photo-results.md",
    "references/image/observed-examples.md",
]
VALIDATOR = ROOT / "scripts" / "check_prompt.mjs"
PRODUCTION = "references/image/production.md"
# 라벨 3+1포맷: "N자 실측"(괄호형 포함) / "실측: N자" / bare "(…, N자)" — "블록당 N자"(규칙 문구)와
# "제3자" 같은 비라벨, "1~2000자)" 범위 표기는 제외. bare 포맷은 실길이 라벨만 대상(N >= 50).
LABEL_PATTERNS = [r"(?<!블록당 )(?<!\d)(\d+)자 실측", r"실측:\s*(\d+)자", r"(?<!제)(?<![~〜-])(?<!\d)(\d+)자\)"]
STAMP_FUTURE_SKEW_DAYS = 1  # author-local vs CI-UTC date skew
BARE_PATTERN_MIN = 50
BIND_WINDOW = 200  # 라벨-코드블록 펜스 간 인접 판정 거리(문자)
MEASUREMENT_STAMP_PATTERN = re.compile(r"\((\d{4})-(\d{2}) 실측[^)\n]*\)")
VERIFICATION_STAMP_PATTERN = re.compile(
    r"\((\d{4})-(\d{2})(?:-\d{2})?[^)\n]*?(?:확인|대조|검증)[^)\n]*\)"
)
STAMP_DATE_PATTERN = re.compile(r"(\d{4})-(\d{2})(?:-(\d{2}))?")
VALIDATOR_CODE_AREAS = ("input", "length", "copy", "syntax", "phrasing", "portrait", "manifest")
VALIDATOR_CODE_RE = re.compile(
    rf"(?:`|['\"])((?:{'|'.join(VALIDATOR_CODE_AREAS)})/[a-z0-9-]+)(?:`|['\"])"
)
HARNESS_CODES = frozenset({
    "harness/empty-cases",
    "harness/unregistered-fixture",
    "harness/uncovered-code",
    "harness/self-check",
})
# Lead fills 16-hex prefixes at integration. Plain retired names stay in scratchpad/handoff only.
RETIRED_NAME_HASHES = frozenset({
    "dad117306c830476",
    "85f46a2c90325b9b",
    "9023cfc3635b10c1",
    "50b8d76060fea43b",
    "5ad71c3fe3118ff8",
    "6cffa1bd7c4f72b2",
    "9f092397e9d96873",
    "8cc52660d89e45a2",
    "18908c310358f68d",
    "ad46c9aff5cbcc2b",
    "5a503ebc075e4123",
    "9a8dc2fd757fa9fd",
    "918f3b6e4f45a1ad",
    "411cd411e4576ea4",
    "f6b0e40ec18ac97b",
    "11aa175aa9517f22",
    "88fce2d5c4debcca",
    "2c3cfae82612d90f",
    "400f4ed05eead032",
    "b146f3649b5fbd5a",
    "6738375dd65b5deb",
    "e6dbb7e9242f6da0",
    "4ac6e296c1a70572",
    "06cd8c0878d46731",
})
TOKEN_RE = re.compile(r"[0-9A-Za-z가-힣_-]{2,}")
ENUM_COUNT_RE = re.compile(r"`?(ar|size|quality)`?\s*\d+종")
CODE_FAMILY_RE = re.compile(
    r"(?<![A-Za-z0-9])(?:C(?:1[0-2]|[1-9])|P(?:1[0-2]|[1-9])|TP(?:1[0-7]|[1-9])|L[1-9])(?![A-Za-z0-9])"
)
SOUL_LAYER_ALLOW = re.compile(r"(?<![A-Za-z0-9])L[1-4](?![A-Za-z0-9])")
NAMED_ANCHORS = {
    "references/image/compiler.md": (
        "# 이미지 프롬프트 조립 원칙",
        "## 적용 범위",
        "## 원칙",
        "### 결과로 쓴다",
        "### 필요한 수치만",
        "### 제공된 피사체와 브랜드 보존",
        "### 정확 카피",
        "### 후속 조판 경계",
        "### 피부·재질",
        "### 스타일은 화면 결과로",
        "### 독립 컷은 따로",
        "### 제외 조건의 형식",
        "### 실행 메타는 본문 밖",
        "## 조립 프롬프트 검사",
        "## 읽을 자료",
    ),
    "references/image/text-structure.md": (
        "## 먼저 가를 것",
        "## 산출물별 고정 요소",
        "## 이미지 안의 글자",
        "## 글자와 이미지의 관계",
        "## 판독 대상과 반복 텍스처",
        "## 시리즈·덱 일관성",
        "## 무드·스타일 단어",
        "## 점검",
    ),
    "references/image/editorial-fashion.md": (
        "## 읽을 자료",
        "## 인물 스틸 기본",
        "## 노출 수위가 있는 패션 요청",
        "## 시리즈·룩북",
        "## 점검",
    ),
    "references/image/editorial/photo-results.md": (
        "## 심도·원근",
        "## 빛",
        "## 색",
        "## 필름·매체 결과",
        "### 필름 스톡 결과",
        "### 노출·기법 결과",
        "### 감성 묶음",
        "## 구도",
        "## 재질·마감",
        "## 장르 조합",
        "## 룩북 감도",
        "## 실패 축의 결과형 재서술",
        "## 표기 언어",
    ),
    "references/image/editorial/locality.md": ("## 로컬리티 매트릭스", "## 판정"),
    "references/image/editorial/scene-craft.md": (
        "## 포즈·시선",
        "## 소재·질감",
        "## 조명 레시피",
        "## 시즌·로케이션 무드",
    ),
    "references/image/editorial/concept-collision.md": (
        "## 컨셉 충돌 문법",
        "### 조명·구도 양자택일",
        "### 제어구 보존",
        "### 문화 앵커 자격",
        "### 글로우 적층 제한",
        "## 예시",
    ),
    "references/image/production.md": (
        "## 적용 범위",
        "## 인계 경로",
        "## 시리즈 운영",
        "## 검증기",
        "## 검증기 코드",
    ),
}
OWNED_EXCLUDED_DIRS = frozenset({"node_modules", "docs-internal", "__pycache__", "build"})
REVIEW_STAMP_FIELDS = ("model_claims_reviewed_at", "role_routing_reviewed_at")
LINK_PATTERN = re.compile(r"(?<!!)\[[^\]]*\]\(([^\n)]+)\)")
PLAIN_PATH_PATTERN = re.compile(
    r"(?<![\w/{*/])((?:\.\.?/)*(?:(?:[A-Za-z0-9_-]+/)+)?[A-Za-z0-9_-]+\.(?:md|py))(?![\w/}*])"
)
RUNTIME_NAME_PATTERNS = (
    r"\bHermes\b", r"\bClaude\b", r"\bCodex\b", r"\bGJC\b",
    r"\bSol\b", r"\bTerra\b", r"\bLuna\b", r"\bOpus\b", r"\bSonnet\b",
    r"\bBoss\b", r"(?:이|해당|우리) 사용자(?:의)?\s+(?:기본|선호|설정|취향)",
    r"\bimage_generate\b",
)


def core_runtime_name_files(root):
    """SKILL plus references top-level (except adapters) and the template/image trees."""
    names = ["SKILL.md"]
    refs = root / "references"
    if refs.is_dir():
        for path in sorted(refs.glob("*.md")):
            rel = path.relative_to(root).as_posix()
            if rel != "references/adapters.md":
                names.append(rel)
        for sub in ("templates", "image"):
            folder = refs / sub
            if folder.is_dir():
                names.extend(
                    path.relative_to(root).as_posix()
                    for path in sorted(folder.rglob("*.md"))
                )
    return tuple(dict.fromkeys(names))


CORE_RUNTIME_NAME_FILES = core_runtime_name_files(ROOT)
# External/conceptual filenames used as examples, not package pointers. A resolved
# path or removed mention makes its entry stale and therefore fails.
PLAIN_PATH_WHITELIST = set()
# These operational references are deliberately not dispatched from the compact
# SKILL.md kernel. Keep exceptions explicit: a deleted or newly reachable file
# must not silently remain here.
# 고아 레퍼런스 화이트리스트 — 도달 불가능하지만 공개 문서 목적인 파일들만 기록.
# 현재 비어있음: 모든 문서가 도달 가능해야 함(장기 미사용은 git 청소 대상).
# templates.md는 외부 소비자(prompt-knowledge-gardener 등)가 참조하는 호환 인덱스로
# 의도적으로 커널 링크 그래프 밖에 둔다.
ORPHAN_REFERENCE_WHITELIST = {"references/templates.md"}


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
            return parsed.get("version", metadata.get("version")), {
                field: value.isoformat() if isinstance(value, date) else value
                for field, value in metadata.items()
            }

    vm = re.search(r"^version:\s*([^\n]+)", fm, re.M)
    version = vm.group(1).strip().strip("\"'") if vm else None
    metadata = {}
    # metadata 블록: 들여쓴 항목 + 빈 줄 + 주석 줄까지 포함, 다음 최상위 키에서 종료 (PyYAML과 동일 범위)
    block = re.search(r"^metadata:\s*\n((?:^(?: {2}.*|[ \t]*(?:#.*)?)(?:\n|$))*)", fm, re.M)
    if block:
        for field in (*REVIEW_STAMP_FIELDS, "version"):
            stamp = re.search(rf"^ {{2}}{field}:\s*(?:\"([^\"\n]*)\"|'([^'\n]*)'|([^#\n]*))", block.group(1), re.M)
            if stamp:
                value = next(g for g in stamp.groups() if g is not None).strip()
                if value:
                    metadata[field] = value
    return version or metadata.get("version"), metadata


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


def check_verification_stamps(f, s, errors, today):
    """I-adjacent: '(YYYY-MM[-DD] …확인|대조|검증…)' ages like measurement stamps."""
    measurement_spans = [match.span() for match in MEASUREMENT_STAMP_PATTERN.finditer(s)]
    for match in VERIFICATION_STAMP_PATTERN.finditer(s):
        if any(start <= match.start() and match.end() <= end for start, end in measurement_spans):
            continue
        dates = []
        for year_s, month_s, _day in STAMP_DATE_PATTERN.findall(match.group(0)):
            year, month = int(year_s), int(month_s)
            if 1 <= month <= 12:
                dates.append((year, month))
        line = line_of(s, match.start())
        stamp = match.group(0)
        if not dates:
            errors.append(f"{f}:{line}: invalid verification stamp {stamp}")
            continue
        year, month = max(dates)
        if (year, month) > (today.year, today.month):
            errors.append(f"{f}:{line}: verification stamp {stamp} violates — future-dated verification stamp")
        elif (today.year - year) * 12 + today.month - month > 6:
            errors.append(
                f"{f}:{line}: verification stamp {stamp} violates the 6-month re-verification rule (AGENTS.md hardline 4)"
            )


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


def check_s2_parameter_redefinition(text, errors, filename):
    """I17: S2 runtime values belong to surfaces/model-routing, not prose rules."""
    s2_tokens = list(re.finditer(r"(?<![A-Za-z0-9_])S2(?![A-Za-z0-9_])", text, re.I))
    concrete_value = re.compile(
        r"(?:"
        r"`*(?:resolution|해상도)`*(?:은|는|을|를)?[ \t]*(?::|=)?[ \t\r\n]*"
        r"`*(?:\d+(?:\.\d+)?k|low|medium|high|basic|최상단|중간[ \t]*티어)`*"
        r"|"
        r"`*(?:quality|품질)`*(?:은|는|을|를)?[ \t]*(?::|=)?[ \t\r\n]*"
        r"`*(?:low|medium|high|basic|최상단|중간[ \t]*티어)`*"
        r")",
        re.I,
    )
    clause_boundary = re.compile(r"[.!?。|;；—·]")
    for token in s2_tokens:
        line_start = text.rfind("\n", 0, token.start()) + 1
        found_line_end = text.find("\n", token.end())
        line_end = len(text) if found_line_end == -1 else found_line_end
        line = text[line_start:line_end]
        local_start = token.start() - line_start
        local_end = token.end() - line_start
        if "|" in line:
            cells = line.split("|")
            cell_index = line[:local_start].count("|")
            if cell_index < len(cells):
                label_cell = cells[cell_index]
                # A dedicated S2 row owns the immediately adjacent value cell.
                # A combined S1·S2·S3 pointer row does not make its S1 values S2 rules.
                if not re.search(r"(?<![A-Za-z0-9_])S[13](?![A-Za-z0-9_])", label_cell, re.I):
                    adjacent = label_cell
                    if cell_index + 1 < len(cells):
                        adjacent += " " + cells[cell_index + 1]
                    if concrete_value.search(adjacent):
                        errors.append(
                            f"{filename}:{line_of(text, token.start())}: [I17] S2 runtime parameter values redefined outside surfaces/model-routing"
                        )
                        return
        left_boundaries = list(clause_boundary.finditer(line, 0, local_start))
        clause_start = left_boundaries[-1].end() if left_boundaries else 0
        right_boundary = clause_boundary.search(line, local_end)
        clause_end = right_boundary.start() if right_boundary else len(line)
        forward = line[local_end:clause_end]
        if concrete_value.search(forward):
            errors.append(
                f"{filename}:{line_of(text, token.start())}: [I17] S2 runtime parameter values redefined outside surfaces/model-routing"
            )
            return
        backward = line[clause_start:local_end]
        for value in concrete_value.finditer(backward):
            between = line[clause_start + value.end():local_start]
            # A preceding machine-contract clause may name its canonical value before
            # a later "S1·S2·S3는 surfaces 참조" pointer. That is not an S2 rule.
            if re.search(r"(?<![A-Za-z0-9_])S1(?![A-Za-z0-9_])", between, re.I):
                continue
            # Reversed declarations stay clause-local: "quality high를 S2에서".
            # A longer gap usually crosses into a new sentence or table clause.
            if len(between) > 32 or re.search(r"[.!?。]|—", between):
                continue
            errors.append(
                f"{filename}:{line_of(text, token.start())}: [I17] S2 runtime parameter values redefined outside surfaces/model-routing"
            )
            return
        # A label-only line may put the concrete declaration on the next line.
        # Do not scan arbitrary following prose: that recreates cross-row false positives.
        label_tail = line[local_end:]
        if re.fullmatch(
            r"(?:는|면|에서|에서는)?(?:[ \t]*(?:플랫폼|파라미터|platform))?[ \t]*[:：][ \t]*",
            label_tail,
            re.I,
        ):
            next_lines = text[line_end + 1:].splitlines()[:2]
            if concrete_value.search("\n".join(next_lines)):
                errors.append(
                    f"{filename}:{line_of(text, token.start())}: [I17] S2 runtime parameter values redefined outside surfaces/model-routing"
                )
                return


def check_prompt_graph_canon(texts, errors):
    """I18: transient PromptGraph lifecycle has one documentation authority."""
    canonical = "references/prompt-graph.md"
    graph = texts.get(canonical, "")
    markers = (
        "PromptGraphIR/v0",
        "### 3-1. Extract",
        "### 3-2. Resolve",
        "### 3-3. Validate/Assemble",
        "### 3-4. Serialize",
        "### 3-5. Evaluate",
        "PG-SERIALIZE-LEAK",
    )
    for marker in markers:
        if marker not in graph:
            errors.append(f"{canonical}: [I18] prompt graph canon missing {marker!r}")
    owners = [name for name, text in texts.items() if "PromptGraphIR/v0" in text]
    if owners != [canonical]:
        errors.append(f"[I18] PromptGraphIR/v0 must be defined only in {canonical}; found {owners}")


def check_seed_engine_boundaries(texts, errors):
    """I19: direct/wrapper boundaries and the Seedance 2.5 gate stay explicit."""
    required = {
        "references/image/seedream-5-pro.md": (
            "BytePlus ModelArk direct",
            "Higgsfield의 `seedream_v5_pro`는 별도 S2 모델 id",
        ),
        "references/image/seedance-2.md": (
            "BytePlus ModelArk direct",
            "Higgsfield의 `seedance_2_0`·`seedance_2_0_mini`는 별도 S2 모델 id",
            "Seedance 2.5는 이 문서의 별칭이 아니다",
            "2.0 규칙, 길이, 미디어 상한을 자동 상속하지 않는다",
            "실제 인물 얼굴이 포함된 참조 이미지·영상을 일반 URL/Base64 입력으로 직접 보내지 않는다",
        ),
        "references/image/seedance-2-5.md": (
            "Dreamina 웹의 Seedance 2.5 UI",
            "BytePlus ModelArk direct의 모델 id·API 요청 스키마를 증명하지 않으며",
            "Seedance 2.0 direct 계약을 2.5로 상속시키지 않는다",
            "Higgsfield나 다른 래퍼",
        ),
        "references/image/lanes.md": (
            "ModelArk direct Seedance 2.0의 세부 규칙은 [seedance-2.md](seedance-2.md)를 따르며, Higgsfield나 2.5에 자동 상속하지 않는다",
        ),
        "references/image/surface-evidence.md": (
            "Dreamina 웹 Seedance 2.5 프롬프트 계약",
            "Seedance 2.5 ModelArk 모델 id·API 요청 스키마",
            "Dreamina UI·2.0 direct 값을 API로 자동 상속 금지",
        ),
    }
    for filename, markers in required.items():
        text = texts.get(filename, "")
        for marker in markers:
            if marker not in text:
                errors.append(f"{filename}: [I19] seed engine boundary marker missing: {marker}")


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
    for f in texts:
        scan_text = texts[f]
        # An installed host overlay replaces canonical SKILL.md and intentionally
        # names its runtime. Source checkouts have no host_surface here and still
        # receive the strict canonical scan; overlay bodies are checked by I14.
        if f == "SKILL.md" and re.search(r"^  host_surface:\s*[^\n]+", scan_text, re.M):
            continue
        if f == "references/model-playbooks.md":
            scan_text = scan_text.split("\n## 호환 노트", 1)[0]
        for pat in RUNTIME_NAME_PATTERNS:
            match = re.search(pat, scan_text)
            if match:
                errors.append(
                    f"{f}:{line_of(scan_text, match.start())}: [I1] runtime/operator token belongs in references/adapters.md or dated compatibility notes, not core ({match.group(0)})"
                )


def is_owned_relative(relative):
    return not any(part.startswith(".") or part in OWNED_EXCLUDED_DIRS for part in relative.parts)


def owned_files(root):
    """Repository-owned files; hidden caches, docs-internal, and scratch outputs are excluded."""
    return sorted(
        path for path in root.rglob("*")
        if path.is_file() and is_owned_relative(path.relative_to(root))
    )


def markdown_files(root):
    """Repository-owned Markdown only; hidden caches and local session traces are not documentation."""
    return sorted(path for path in owned_files(root) if path.suffix == ".md")


def documentation_scan_files(root):
    """Label, length, lookalike, and I0 surface: SKILL.md plus every references/** page."""
    names = ["SKILL.md"]
    names.extend(
        path.relative_to(root).as_posix()
        for path in markdown_files(root)
        if path.relative_to(root).as_posix().startswith("references/")
    )
    return list(dict.fromkeys(name for name in names if (root / name).is_file()))


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
    repository_files = owned_files(root)
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
            if relative.is_file() or root_relative.is_file():
                if source.name.endswith("-router.md") and target.endswith(".md"):
                    errors.append(
                        f"{source_name}:{line_of(text, match.start())}: [I2] router path pointer must be a Markdown link ({target})"
                    )
                continue
            bare_hits = (
                [path for path in repository_files if path.name == target]
                if "/" not in target
                else []
            )
            if len(bare_hits) > 1:
                names = ", ".join(path.relative_to(root).as_posix() for path in bare_hits)
                errors.append(
                    f"{source_name}:{line_of(text, match.start())}: [I2] ambiguous bare path pointer ({target}: {names})"
                )
                continue
            if len(bare_hits) != 1:
                unresolved.add(key)
                continue
            if source.name.endswith("-router.md") and target.endswith(".md"):
                errors.append(
                    f"{source_name}:{line_of(text, match.start())}: [I2] router path pointer must be a Markdown link ({target})"
                )

    # Installed payloads deliberately omit agents/. Only whitelist entries whose
    # source document exists in the current tree can become stale here.
    active_whitelist = {
        key for key in PLAIN_PATH_WHITELIST
        if (root / key[0]).is_file()
    }
    stale = active_whitelist - unresolved
    for source_name, target in sorted(stale):
        errors.append(
            f"{source_name}: [I2] plaintext path whitelist entry is stale ({target})"
        )
    for source_name, target in sorted(unresolved - active_whitelist):
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
    for name in sorted(ORPHAN_REFERENCE_WHITELIST & reachable):
        errors.append(f"{name}: [I2] orphan whitelist entry is now reachable from SKILL.md")
    for name in sorted(references - reachable - ORPHAN_REFERENCE_WHITELIST):
        errors.append(f"{name}: [I2] orphan reference is not reachable from SKILL.md")


ARTIFACT_SUFFIXES = re.compile(r"(?:\.bak(?:[-.][^/]*)?|\.orig|\.rej|\.save|~)$")


def published_directories(root):
    """Directories the npm `files` manifest ships wholesale (`dir/**` entries)."""
    manifest = root / "package.json"
    if not manifest.is_file():
        return []
    try:
        entries = json.loads(manifest.read_text(encoding="utf-8")).get("files", [])
    except (ValueError, OSError):
        return []
    directories = []
    for entry in entries:
        if not isinstance(entry, str) or entry.startswith("!") or not entry.endswith("/**"):
            continue
        candidate = root / entry[:-3]
        if candidate.is_dir():
            directories.append(candidate)
    return directories


def check_distribution_artifacts(root, errors):
    """I20: an editor backup inside a published directory is a second, stale copy that ships."""
    excluded = {"node_modules", "__pycache__"}
    for base in published_directories(root):
        for path in sorted(base.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(root)
            if any(part.startswith(".") or part in excluded for part in relative.parts):
                continue
            if ARTIFACT_SUFFIXES.search(path.name):
                errors.append(
                    f"{relative.as_posix()}: [I20] backup/duplicate artifact in a published directory "
                    "(delete it or keep it outside the repository)"
                )


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


def extract_validator_codes(text):
    return {code for code in VALIDATOR_CODE_RE.findall(text) if code not in HARNESS_CODES}


def check_validator_code_table(root, errors):
    """I21: area/name codes in check_prompt.mjs and production.md ## 검증기 코드 match both ways."""
    production_path = root / PRODUCTION
    validator_path = root / "scripts" / "check_prompt.mjs"
    try:
        production = production_path.read_text(encoding="utf-8")
    except OSError as exc:
        errors.append(f"[I21] {PRODUCTION} unreadable — {exc}")
        return
    heading = re.search(r"^## 검증기 코드\s*$", production, re.M)
    if not heading:
        errors.append(f"[I21] {PRODUCTION} is missing its validator code table")
        return
    rest = production[heading.end():]
    next_heading = re.search(r"^## ", rest, re.M)
    end = heading.end() + next_heading.start() if next_heading else len(production)
    section = production[heading.start():end]
    documented = extract_validator_codes(section)
    try:
        implemented = extract_validator_codes(validator_path.read_text(encoding="utf-8"))
    except OSError as exc:
        errors.append(f"[I21] scripts/check_prompt.mjs unreadable — {exc}")
        return
    if not documented or not implemented:
        errors.append("[I21] validator codes and their documentation must both be nonempty")
        return
    missing_doc = sorted(implemented - documented)
    missing_code = sorted(documented - implemented)
    if missing_doc:
        errors.append(f"[I21] production.md missing validator codes: {', '.join(missing_doc)}")
    if missing_code:
        errors.append(f"[I21] check_prompt.mjs missing documented codes: {', '.join(missing_code)}")


def token_fingerprint(text):
    return hashlib.sha256(unicodedata.normalize("NFKC", text).lower().encode("utf-8")).hexdigest()[:16]


def check_retired_name_hashes(root, errors, hashes=None):
    """I22: published tokens and adjacent pairs must not match retired-name prefixes."""
    digest_set = RETIRED_NAME_HASHES if hashes is None else hashes
    if not digest_set:
        errors.append("[I22] retired-name fingerprint configuration is empty")
        return
    for path in owned_files(root):
        rel = path.relative_to(root).as_posix()
        if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif", ".webp", ".ico"}:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as exc:
            errors.append(f"{rel}: [I22] cannot inspect distribution text — {exc}")
            continue
        tokens = TOKEN_RE.findall(unicodedata.normalize("NFKC", text).lower())
        for token in tokens:
            digest = token_fingerprint(token)
            if digest in digest_set:
                errors.append(f"{rel}: [I22] retired name token hash {digest}")
        for left, right in zip(tokens, tokens[1:]):
            digest = token_fingerprint(f"{left} {right}")
            if digest in digest_set:
                errors.append(f"{rel}: [I22] retired name pair hash {digest}")


def check_code_family_shapes(root, errors):
    """I22b: retired catalog ids (C/P/TP/L families) stay out of image docs and examples."""
    scopes = []
    for folder in (root / "references" / "image", root / "examples"):
        if folder.is_dir():
            scopes.extend(path for path in folder.rglob("*") if path.is_file() and is_owned_relative(path.relative_to(root)))
    for path in scopes:
        rel = path.relative_to(root).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        for match in CODE_FAMILY_RE.finditer(text):
            token = match.group(0)
            if rel == "references/image/soul-v2-director.md" and SOUL_LAYER_ALLOW.fullmatch(token):
                continue
            errors.append(f"{rel}:{line_of(text, match.start())}: [I22b] retired code-family token {token}")


def check_named_anchors(root, errors):
    """I23: frozen heading strings exist when the owning file is present."""
    for rel, headings in NAMED_ANCHORS.items():
        path = root / rel
        if not path.is_file():
            continue
        text = path.read_text(encoding="utf-8")
        for heading in headings:
            if heading not in text:
                errors.append(f"{rel}: [I23] missing named anchor {heading}")


def check_schema_enum_counts(texts, errors):
    """Optional surface-routing-11: documents must not restated schema enum cardinalities."""
    for name, text in texts.items():
        if not name.startswith("references/") or name == "AGENTS.md":
            continue
        for match in ENUM_COUNT_RE.finditer(text):
            errors.append(
                f"{name}:{line_of(text, match.start())}: [I11] schema enum cardinality restated ({match.group(0)})"
            )


def main():
    errors = []
    today = date.today()
    missing = [f for f in FILES if not (ROOT / f).exists()]
    if missing:
        fail([f"missing file: {m}" for m in missing])
    scan_files = documentation_scan_files(ROOT)
    texts = {f: (ROOT / f).read_text(encoding="utf-8") for f in scan_files}
    stamp_files = [
        path.relative_to(ROOT).as_posix()
        for path in markdown_files(ROOT)
    ]
    stamp_texts = {f: (ROOT / f).read_text(encoding="utf-8") for f in stamp_files}
    runtime_names = core_runtime_name_files(ROOT)
    runtime_texts = {
        f: (ROOT / f).read_text(encoding="utf-8")
        for f in runtime_names
        if (ROOT / f).is_file()
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

    # I0 — templates, SKILL, and references/** (except the surface-contract files) may describe
    # a surface-specific 2000-character contract, never a universal prompt constant.
    check_targets = ["references/templates.md", "SKILL.md"]
    check_targets += [f for f in texts.keys() if f.startswith("references/") and f not in {
        "references/image/surfaces.md",
        "references/image/surface-contracts.md",
        "references/image/surface-evidence.md",
    }]
    for f in check_targets:
        if f in texts:
            check_universal_2000_regression(texts[f], errors, f)

    # I17 — concrete S2 runtime values live in surfaces.md or the dated model roster.
    for f, s in stamp_texts.items():
        if f.startswith("references/") and f not in {
            "references/image/surfaces.md",
            "references/image/surface-contracts.md",
            "references/image/surface-evidence.md",
            "references/image/model-routing.md",
        }:
            check_s2_parameter_redefinition(s, errors, f)

    check_prompt_graph_canon(stamp_texts, errors)
    check_seed_engine_boundaries(stamp_texts, errors)

    check_contract_index_table(ROOT, errors)
    check_mj_flag_sync(ROOT, errors)

    # label == adjacent block length (전 FILES)
    for f, s in texts.items():
        check_labels(f, s, errors)

    # dated measurement/verification stamps and near-misses (all repository-owned Markdown)
    for f, s in stamp_texts.items():
        check_measurement_stamps(f, s, errors, today)
        check_verification_stamps(f, s, errors, today)
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
    delegation = texts.get("references/templates/delegation.md", "")
    if delegation.count("게이트 필요성 테스트** —") != 1:
        errors.append("gate necessity test must be defined exactly once in references/templates/delegation.md")
    if skill.count("게이트 필요성 테스트** —") != 0:
        errors.append("gate necessity test must not be defined in SKILL.md (delegation.md owns it)")
    tm = texts.get("references/templates/common.md", "")
    if tm.count("추론 불가 슬롯 — 질문이 필요한 기준 (정본)") != 1:
        errors.append("non-inferable slot canon must appear exactly once in references/templates/common.md")

    # I1 — host names remain in adapters and host overlays, not the core.
    check_runtime_names(runtime_texts, errors)

    # I2 / I6 / I14 scan the full repository-owned documentation surface.
    check_links_and_orphans(ROOT, errors)
    check_plaintext_paths(ROOT, errors)
    check_key_fill_ratios(ROOT, errors)
    check_agent_skill_sync(ROOT, skill, errors)

    # I20 — published directories carry canon only, never backup/duplicate artifacts.
    check_distribution_artifacts(ROOT, errors)

    check_validator_code_table(ROOT, errors)
    check_retired_name_hashes(ROOT, errors)
    check_code_family_shapes(ROOT, errors)
    check_named_anchors(ROOT, errors)
    check_schema_enum_counts(texts, errors)

    if errors: fail(errors)
    total_labels = sum(len(re.findall(p, s)) for p in LABEL_PATTERNS[:2] for s in texts.values())
    print(f"OK — {len(texts)} files, {total_labels} measured labels, all checks passed")


if __name__ == "__main__":
    main()
