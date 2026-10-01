# 런타임 어댑터 — 실행 환경별 로컬라이즈 지점

코어 스킬은 런타임 중립이다. 특정 에이전트 제품에 묶인 값(설치 위치, 호출 접두어, 모델 선택, per-role routing 지원 여부)은 전부 이 파일에서만 다룬다. 코어 파일은 `prime`/`planner`/`worker`/`critic`과 capability label만 쓴다.

## 공통 코어 참조

역할 책임과 capability 선택은 [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅이 유일한 정본이다. 이 파일은 설치 위치, 런타임 역할 매핑, 실제 모델 선택 위치, per-role routing이 없을 때의 fallback만 기록한다. 실제 모델명과 로컬 선택값은 각 런타임의 설정 파일, CLI 옵션, 또는 사용자의 세션 설정에 두며 private local selector를 하드코딩하지 않는다.

## 전달 채널 상한

채널별 상한 값은 이 문서에도 적지 않는다 — 각 런타임 배선(예: 메신저 채널 설정)에서 읽는다. 코어 파일(SKILL.md·references/templates/*·references/image/* 전체)은 채널을 익명으로만 지칭한다("상한 있는 메신저형 채널", "에이전트 CLI 무제한 표면").

## 기계 계약 인덱스

이 표는 배선 포인터다. 각 계약의 불변식·생산자 → 소비자 경계·실패 방식은 [contracts.md](contracts.md) 인터페이스 표가 정본이며 여기서 반복하지 않는다. 이 표는 스키마 파일·MPW 생성 명령·검증 경로·규칙 정본 문서의 위치만 준다.

계약 목록의 정본은 `contracts/manifest.json`이고 각 계약의 valid fixture는 `contracts/v1/fixtures/`에 있다. 계약이 추가되면 이 표에 행을 추가한다.

| 계약 | 스키마 (`contracts/v1/`) | MPW 생성 명령 | 검증 경로 | 규칙 정본 |
|---|---|---|---|---|
| `garden-recipe/v1` | `garden-recipe.schema.json` | MPW 스크립트 없음(외부 생산) | `contracts/validate.py` | [contracts.md](contracts.md) §GardenRecipe v1 |
| `prompt-bundle/v1` | `prompt-bundle.schema.json` | `scripts/compile_garden_recipe.py` | `contracts/validate.py` (`--recipe` 교차검증) | [garden-recipe-compiler.md](garden-recipe-compiler.md) · [contracts.md](contracts.md) §PromptBundle v1 |
| `image-production-handoff/v2` | `image-production-handoff.schema.json` | `scripts/compile_image_handoff.py` | `contracts/validate.py` · 보조 경로: 컴파일러 게이트 + `scripts/test_compile_image_handoff.py` | [image/image-production-handoff.md](image/image-production-handoff.md) |
| apparel-handoff (`schema_version: 1`) | `apparel-handoff.schema.json` | `scripts/compile_apparel_handoff.py` | `contracts/validate.py` (정수 discriminator라 `--schema apparel-handoff/v1`이 canonical path) · 보조 경로: 컴파일러 게이트 + `scripts/test_compile_apparel_handoff.py` | [image/apparel-compiler.md](image/apparel-compiler.md) · 런타임 소비는 아래 §의류 핸드오프 소비자 |
| `production-adapter-options/v1` | `production-adapter-options.schema.json` | MPW 스크립트 없음(외부 생산) | `contracts/validate.py` | 스키마가 정본 · 표면 판정 [image/surfaces.md](image/surfaces.md) §0 · 기계 계약 상세 [image/surface-contracts.md](image/surface-contracts.md) §1 |
| `imggen2-production-record/v1` | `imggen2-production-record.schema.json` | MPW 스크립트 없음(외부 생산) | `contracts/validate.py` | 스키마가 정본 · 표면 판정 [image/surfaces.md](image/surfaces.md) §0 · 기계 계약 상세 [image/surface-contracts.md](image/surface-contracts.md) §1 |
| `mpw-recompile-request/v1` | `mpw-recompile-request.schema.json` | MPW 스크립트 없음(외부 생산) | `contracts/validate.py` | 전용 문서 없음 — 스키마와 [contracts.md](contracts.md) 인터페이스 표 |
| `source-evidence-index/v1` | `source-evidence-index.schema.json` | MPW 스크립트 없음(외부 생산) | `contracts/validate.py` | 전용 문서 없음 — 스키마와 [contracts.md](contracts.md) 인터페이스 표 |

## 실행 배선의 적용 범위

아래 생성·소비자 호출은 사용자가 실행까지 요청하거나 실행 옵션을 선택한 경우에 현재 호스트 세션이 수행한다. 문안 작성만 요청하면 완성 프롬프트에서 멈추고 설치·연결 확인·생성 호출을 실행하지 않는다. 실행과 QC는 선택한 도구의 스킬·현재 계약을 따른다. 옵션 목록 자체도 [common.md](templates/common.md) §후속 선택이 허용할 때만 낸다.

## 의류 핸드오프 소비자

스키마·생성 명령·규칙 정본은 위 인덱스 표에 있다. 이 절은 런타임 소비 배선만 기록한다. 런타임은 네트워크 호출 없이 핸드오프 파일을 읽어 후보 작업을 준비한다. 이미지 생성 실행에서는 `ImgGen2`가 소비자이며, 핸드오프의 `unique_color_count`와 검증된 `vision_role_map`을 다시 확인한 뒤 동일한 전체 인벤토리를 가진 격리 작업을 만든다. 알 수 없는 버전이나 불일치는 자유형 프롬프트로 강등하지 않고 거부한다.

## 이미지 생성 실행 옵션 (ImgGen2)

IMAGE 컴파일을 마친 턴의 "다음" 목록 마지막 번호는, 아래 조건을 모두 만족하면 ImgGen2 실행 핸드오프다(메뉴 적용 조건은 [common.md](templates/common.md) §후속 선택).

- **산출물 형태**: ImgGen2가 소비할 수 있는 형태다 — ① gpt-image 계열 타깃의 단일 완성 프롬프트(`scripts/compile_image_handoff.py`로 `image-production-handoff/v2` 컴파일) ② 소비자 계약에 맞춘 매니페스트 배치([image/production.md](image/production.md) §인계 경로) ③ 이미 컴파일된 핸드오프 번들.
- **러너 존재**: 같은 호스트에 ImgGen2 스킬이 설치돼 있다. 없으면 옵션을 붙이지 않는다.
- **전용 실행 경로 없음**: 미드저니 붙여넣기(S3), Higgsfield MCP 연결 런타임, 사용자가 이미 지정한 다른 실행 도구가 있으면 그 경로가 우선이고 이 옵션은 뺀다.

옵션을 고르면 ImgGen2 스킬을 호출해 핸드오프/레코드를 넘긴다 — 전송·배치·QC·재개 규칙은 ImgGen2 자체 SKILL.md가 정본이며 여기 복제하지 않는다. 옵션 문구는 한 줄로: `N. imggen2로 바로 생성 — 이 프롬프트(배치) 그대로 실행`. 프롬프트 페이로드(코드블록 안)에는 러너·엔진 이름을 넣지 않는다.

## 이미지 생성 실행 옵션 (ima2)

사용자가 ima2·Prompt Studio를 지정했거나 해당 실행 옵션을 고르면 설치된 `ima2` 스킬에 완성 프롬프트와 별도의 설정·참조 역할을 전달한다. 이때 위 ImgGen2 실행 옵션을 중복 제안하지 않는다. 일반 이미지 요청의 기본 실행 경로는 바꾸지 않는다.

- **설치/발견**: 공식 `ima2-gen` 패키지와 로컬 `ima2` 스킬이 모두 필요하다. `ima2 --version`, `ima2 ping --json`, `ima2 models --kind image --json`으로 현재 설치·서버·모델 표면을 확인한다. 준비 상태는 실제 생성 품질의 증거가 아니다.
- **역할 매핑**: MPW는 요청과 보존 조건을 작성하고, ima2는 생성·편집·후보 비교와 작업 기록을 담당한다. 실행용 모델·설정은 프롬프트 코드블록 밖에 둔다.
- **모델 선택 위치**: 사용자 지정 또는 `ima2 defaults --json`의 명시적 경로를 사용한다. 완성 프롬프트는 지원되는 core 표면에서 `--mode direct --no-size-nudge`로 전달한다. Direct도 공급자 재작성을 완전히 차단한다고 보장하지 않으며, 참조·마스크·반환된 수정 프롬프트와 출력 검증은 ima2 스킬이 소유한다. (2026-09-06, ima2-gen 3.13.1 CLI 확인)
- **미지원 경로**: 모델·인증·파라미터가 없으면 다른 공급자로 자동 전환하지 않는다. ima2 CLI는 MPW의 `image-production-handoff/v2`·S1 JSONL·의류 핸드오프를 직접 소비하지 않는다. 기계 계약은 기존 소비자를 유지하고, JSON을 이미지 프롬프트로 붙여 넣거나 필드를 누락해 변환하지 않는다.

메뉴가 적용되는 턴에서 실행 옵션은 설치와 대상 표면이 확인됐을 때만 `N. ima2로 생성 — 이 프롬프트와 지정 설정으로 실행`으로 낸다. 상세 호출은 설치된 ima2 스킬과 현재 CLI 도움말을 따른다. 패키지 기준: [ima2-gen 3.13.1 core CLI](https://github.com/lidge-jun/ima2-gen/blob/d2afe6b2aa7d006e2cd9765aa632714f96435db2/bin/commands/gen.ts).


## 플러그인 호스트

MPW는 HeiTuz 마켓플레이스 플러그인 `mpw@heituz`로 배포한다. 카탈로그는 https://github.com/HeiTuz/heituz-plugins 이고, 본체는 이 저장소 `dist` 브랜치의 `plugins/mpw`다. 설치본은 호스트의 플러그인 캐시이며 직접 편집하지 않는다. 호스트 밖에서 스킬 폴더가 필요하면 `bunx --package github:HeiTuz/MPW heituzmpw -- --dest <path>`로 같은 payload를 복사한다. 설치된 MPW를 경로로 읽는 동반 도구는 `MPW_ROOT` → Codex 캐시 → Claude Code 캐시 순으로 찾는다.

### Codex

- 설치/발견: `codex plugin marketplace add HeiTuz/heituz-plugins` 후 `codex plugin add mpw@heituz`. 캐시는 `<CODEX_HOME>/plugins/cache/heituz/mpw/<버전>`이며 명시 호출은 `$mpw:mpw`다(플러그인 스킬은 `<플러그인>:<스킬>` 이름으로 등록된다).
- 이미지 생성 러너: Codex 실행은 `--sandbox workspace-write`를 사용해 작업공간에만 쓰기를 허용한다.
- 역할 매핑: Codex coding surface는 prime으로 운용한다. native subagent가 있으면 planner=read-only planning/research, worker=bounded implementation, critic=independent verifier로 할당한다.
- 모델 선택 위치: Codex profile, model picker, CLI config, or API caller configuration. 공개 routing vocabulary는 fast/read-only, balanced/agentic, strongest-reasoning/high-risk만 쓴다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다.
- 선택형 질문 도구: 이미지 프롬프트 인터뷰([image/prompt-interview.md](image/prompt-interview.md))는 세션에 노출된 `request_user_input` 계열 도구로 묻는다. Plan 모드의 `request_user_input`은 응답을 기다리고, Default 모드에 `request_user_input_async`가 있으면 그것을 쓴다. 문항 3개 이하, 문항당 선택지 2~3개, 추천안은 맨 앞에 두고 라벨 끝에 `(Recommended)`를 붙이며, 자유 답 칸은 도구가 자동으로 붙이므로 '기타'를 만들지 않는다. 두 도구 모두 없는 실행(예: `codex exec`)이면 번호 목록으로 묻는다.

### Claude Code

- 설치/발견: `claude plugin marketplace add HeiTuz/heituz-plugins` 후 `claude plugin install mpw@heituz`. 활성 캐시는 `~/.claude/plugins/installed_plugins.json`의 `installPath`이며 명시 호출은 `/mpw:mpw`다.
- 역할 매핑: 단일 Claude 세션이면 prime이 기본이다. 하위 에이전트나 task 기능이 있으면 planner는 read-only 조사, worker는 bounded edit/research, critic은 frozen artifact review로 보낸다.
- 모델 선택 위치: Claude 앱/CLI/프로젝트 설정. 이 저장소에는 모델명이나 plan 이름을 쓰지 않는다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다.
- 선택형 질문 도구: 이미지 프롬프트 인터뷰는 `AskUserQuestion`으로 묻는다. 한 번에 문항 4개 이하, 문항당 선택지 2~4개이며 자유 답 칸은 도구가 붙인다. 도구가 노출되지 않는 비대화형 실행이면 번호 목록으로 묻는다.

### ChatGPT

- 설치/발견: 워크스페이스 관리자가 Workspace settings → Plugins → Import marketplace에 카탈로그 저장소 URL을 넣는다. 대화에서 `@mpw`로 호출한다. 셸이 없는 대화 표면이면 SKILL.md 호스트 통합 블록의 무셸 경로를 따른다.
- 역할 매핑: 단일 대화는 prime이다. 별도 에이전트 실행이 제공될 때만 core 역할로 나눈다.
- 모델 선택 위치: ChatGPT 모델 선택기와 워크스페이스 설정. 이 저장소는 모델을 지정하지 않는다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다.
- 선택형 질문 도구: 대화 표면에 선택형 질문 기능이 노출되면 그것을 쓰고, 없으면 번호 목록으로 묻는다.

## 어댑터 작성 규칙

아키타입당 4항목만 기록한다: ① 설치/로드 방법 ② 역할 매핑 ③ 실제 모델 선택 위치 ④ per-role routing unavailable fallback. 코어 규칙을 복사하지 않는다. 코어와 충돌하는 어댑터 문장은 무효다.
