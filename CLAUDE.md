# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**운영 정본은 `AGENTS.md`다.** 하드라인(정본 단일성·실측 라벨·모델 주장 스탬프·런타임 고유명 격리), 핸드오프 의무, 배포 게이트, 상시 릴리스 승인 예외가 모두 거기 있다. 이 파일은 그걸 복제하지 않고 명령과 큰 구조만 적는다. 둘이 어긋나면 `AGENTS.md`가 이긴다.

## 이 레포가 무엇인가

MPW(프롬프트 작성 스킬)의 **정본이자 유일한 실제 트리**다. 산출물은 코드가 아니라 문서 규칙(`SKILL.md` + `references/**`)이고, `scripts/`는 그 규칙을 검사·컴파일·빌드·배포하는 도구다. 배포 형식은 플러그인 하나(`mpw@heituz`)다.

- `SKILL.md` — 디스패치 커널. 요청 판정·읽을 자료 안내만 두고 상세는 `references/`로 내린다(커널 비대화 금지).
- `references/` — 규칙 본문. 축별 정본 배치는 `AGENTS.md` 하드라인 1번 목록이 정한다(예: 실행 표면 S1/S2/S3는 `references/image/surfaces.md`, 조립 구조는 `references/prompt-graph.md`, 런타임 제품명은 `references/adapters.md`에만).
- `contracts/v1/*.schema.json` — S1 기계 계약 값(ar·size·quality enum)의 정본. 문서는 이 값을 복제하지 않는다. 동반 레포 미러 갱신은 `references/contracts.md` 절차와 `scripts/sync_contracts.py`.
- `agents/plugin/` — 플러그인 표면 오버레이. `agents/plugin/SKILL.md`는 정본 `SKILL.md`와 본문이 같고 frontmatter(`host_surface: plugin`, `canonical_source`)와 상단 호스트 통합 블록만 다르다. **정본 `SKILL.md`를 고치면 이 파일 본문도 동기화해야 한다.**
- `scripts/compile_*.py` — 이미지 핸드오프·변형·의류·가드너 레시피 컴파일러(계약 스키마 소비자).
- `scripts/check_prompt.mjs` — 완성 프롬프트 검증기. 문서 규칙과 어긋나면 어느 쪽이 맞는지 판정해 한쪽을 고친다.
- `scripts/read_refs.mjs` — references 파일·절을 모아 읽는 도구(`#A,B`, `#A~B`, `--toc`, `--bundle 이름`·`--bundles`; 묶음 정의는 이 스크립트의 `BUNDLES` 한 곳). 스킬 런타임도 이걸 쓴다.
- `docs-internal/` — 운영자 전용, gitignore 대상(배포 안 됨).

빌드 흐름: `scripts/build_plugin.mjs`가 정본 allowlist 트리에 `agents/plugin/` 오버레이를 덮어 `plugins/mpw/`를 만든다. 이 산출물은 `main`에 커밋하지 않고, `scripts/release_plugin.mjs`가 `dist` 브랜치에 커밋하고 `mpw-plugin-v<버전>` 태그를 단다. 공개 카탈로그는 별도 저장소 `HeiTuz/heituz-plugins`다.

**레포 루트를 스킬 검색 경로에 심링크하지 마라.** 루트와 `agents/plugin/`에 `SKILL.md`가 둘 있어 인덱서가 MPW를 중복으로 잡는다. 로컬 확인은 빌드 산출물이나 플러그인 캐시로 한다.

## 명령

```sh
npm test                      # lint.py → scripts/test_*.py, test_*.mjs 전부 → check_prompt.mjs --test → 교차 통합(경로 없으면 NOT RUN)
npm run lint                  # python3 scripts/lint.py — 실측 라벨·2000자 상한·frontmatter 스탬프 등 하드라인 검사
python3 scripts/test_contracts.py        # 단일 테스트: 해당 파일을 직접 실행 (Python)
node scripts/test_examples.mjs           # 단일 테스트: 해당 파일을 직접 실행 (Node)
node scripts/check_prompt.mjs --test     # 검증기 자체 케이스
node scripts/build_plugin.mjs --check    # 플러그인 빌드 검증 (CI와 동일)
node scripts/check_install_parity.mjs    # 릴리스 뒤 Codex·Claude 플러그인 캐시와 새 빌드 일치 확인
```

`scripts/run_tests.mjs`는 `scripts/` 안의 `test_` 접두 파일을 자동 수집하므로 새 테스트는 이름 규칙만 맞추면 스위트에 들어간다. 실패는 끝까지 누적해 마지막에 요약한다.

교차계약(`scripts/test_adapter_master_integration.py`)은 네 동반 레포 경로를 **환경변수로만** 받는다. `npm test`에서 "external integration NOT RUN"이 찍히면 green이어도 교차 배선은 검증되지 않은 것이다. 이 머신에서는:

```sh
IMAGE_REFERENCE_ADAPTER_ROOT=~/HeiTuz/image-reference-gardener \
DESIGN_REFERENCE_ADAPTER_ROOT=~/HeiTuz/design-reference-gardener \
HIGGSFIELD_BRIDGE_ROOT=~/HeiTuz/higgsfield-prompt-bridge \
PROMPT_KNOWLEDGE_ADAPTER_ROOT=~/HeiTuz/prompt-knowledge-gardener \
  python3 scripts/test_adapter_master_integration.py
```

doctrine 검사는 기본 reminder state를 건드리지 않도록 새 `--state`로 돌린다(빈 stdout을 "문제 없음"으로 읽지 않는다):

```sh
python3 scripts/prompt_writing_doctrine_check.py --state "$(mktemp -d)/backlog.json"
```

## 편집할 때 자주 걸리는 것

- 예시의 `(N자 실측)` 라벨은 뒤따르는 ```text 블록 길이와 정확히 일치해야 한다. 예시를 고치면 라벨을 다시 잰다(`lint.py`가 잡는다).
- `SKILL.md`·`package.json`의 버전과 `metadata.*_reviewed_at` 스탬프는 lint가 본다. 버전 범프와 push는 별도 릴리스 승인 대상이다.
- 커밋 메시지는 영어. 편집 후에는 `~/handoffs/MPW-<주제>-<타임스탬프>.md` 핸드오프를 남긴다(`AGENTS.md` §운영 소유권).
