# 런타임 어댑터 — 실행 환경별 로컬라이즈 지점

코어 스킬은 런타임 중립이다. 특정 에이전트 제품에 묶인 값(설치 위치, 호출 접두어, 모델 선택, per-role routing 지원 여부)은 전부 이 파일에서만 다룬다. 코어 파일은 `prime`/`planner`/`worker`/`critic`과 capability label만 쓴다.

## 공통 코어 참조

역할 책임과 capability 선택은 [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅이 유일한 정본이다. 이 파일은 설치 위치, 런타임 역할 매핑, 실제 모델 선택 위치, per-role routing이 없을 때의 fallback만 기록한다. 실제 모델명과 로컬 선택값은 각 런타임의 설정 파일, CLI 옵션, 또는 사용자의 세션 설정에 두며 private local selector를 하드코딩하지 않는다.

## 전달 채널 상한

채널별 상한 값은 이 문서에도 적지 않는다 — 각 런타임 배선(예: 메신저 채널 설정)에서 읽는다. 코어 파일(SKILL.md·references/templates/*·references/image/* 전체)은 채널을 익명으로만 지칭한다("상한 있는 메신저형 채널", "에이전트 CLI 무제한 표면").

## 기계 계약 인덱스

이 표는 배선 포인터다. 각 계약의 불변식·생산자 → 소비자 경계·실패 방식은 [contracts.md](contracts.md) 인터페이스 표가 정본이며 여기서 반복하지 않는다. 이 표는 스키마 파일·MPW 생성 명령·검증 경로·규칙 정본 문서의 위치만 준다.

외부 구현의 지원 범위는 [contracts.md](contracts.md) §지원 범위를 따른다. 계약을 보존한다는 사실만으로 특정 외부 실행기의 호환성을 보증하지 않는다.

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
- 선택형 질문 도구 (2026-10 도구 계약 확인): 이미지 프롬프트 인터뷰([image/prompt-interview.md](image/prompt-interview.md))는 현재 모드의 질문 도구로 묻는다. Plan 모드의 `request_user_input`은 답을 기다려 결과로 돌려준다. 문항 1~3개, 문항당 선택지 2~3개, 추천안은 맨 앞에 두고 라벨 끝에 `(Recommended)`를 붙이며 자유 답 칸은 도구가 붙인다. Default 모드의 `request_user_input_async`는 **즉시 반환되고 답은 나중에 새 사용자 메시지로 온다.** 질문 객체는 `title`과 선택지 문자열 `options`이고, 맨 앞 선택지가 미리 선택돼 보여도 자동 제출되지 않는다. 호출한 뒤 최종 응답을 보내 턴을 끝내지 않는다. 답과 무관한 작업만 진행하고, 답이 없으면 새 입력이 오면 일찍 깨는 대기 도구(`clock.sleep`, 30초 단위)로 기다린다. 그런 대기 도구가 세션에 없으면 비동기 상자를 띄우지 않고 번호 목록으로 묻고 그 메시지로 턴을 마친다. 깨어나면 새 메시지를 확인하고, 미응답이면 같은 질문을 다시 띄우지 않고 다시 기다린다. 답과 무관한 메시지에 깨어났으면 그 메시지를 처리한 뒤 계속 기다린다. 약 10분이 지나도 답이 없으면 인터뷰 규칙대로 질문을 본문에 남기고 멈춘다. `wait`처럼 실행 중인 셀을 기다리는 도구나 셸 sleep은 새 입력에 깨지 않으므로 쓰지 않는다. 질문 도구가 없으면(예: `codex exec`) 번호 목록으로 묻고 그 메시지로 턴을 마친다.

### Claude Code

- 설치/발견: `claude plugin marketplace add HeiTuz/heituz-plugins` 후 `claude plugin install mpw@heituz`. 활성 캐시는 `~/.claude/plugins/installed_plugins.json`의 `installPath`이며 명시 호출은 `/mpw:mpw`다.
- 역할 매핑: 단일 Claude 세션이면 prime이 기본이다. 하위 에이전트나 task 기능이 있으면 planner는 read-only 조사, worker는 bounded edit/research, critic은 frozen artifact review로 보낸다.
- 모델 선택 위치: Claude 앱/CLI/프로젝트 설정. 이 저장소에는 모델명이나 plan 이름을 쓰지 않는다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다.
- 선택형 질문 도구 (2026-10 공식 문서 확인): 이미지 프롬프트 인터뷰는 `AskUserQuestion`으로 묻는다. 답할 때까지 실행이 멈추고 답이 도구 결과로 돌아오므로 별도 대기는 필요 없다. 한 번에 문항 4개 이하, 문항당 선택지 2~4개이며 인터뷰의 더 좁은 상한을 따르고, 자유 답 칸은 도구가 붙인다. 결과에 실제 답이 있는지 확인한 뒤 이어간다. `askUserQuestionTimeout`을 켠 환경에서 시간이 지나 돌아오면 그때까지 고른 선택지가 함께 제출되므로 그 답은 살리고, 답하지 않은 문항만 다시 띄우거나 본문에 남기고 멈춘다. 시간 경과·빈 응답·오류 자체를 선택이나 위임으로 보고 최종 프롬프트로 넘어가지 않는다. 도구가 없는 비대화형 실행이면 번호 목록으로 묻는다.

### ChatGPT

- 설치/발견: 워크스페이스 관리자가 Workspace settings → Plugins → Import marketplace에 카탈로그 저장소 URL을 넣는다. 대화에서 `@mpw`로 호출한다. 셸이 없는 대화 표면이면 SKILL.md 호스트 통합 블록의 무셸 경로를 따른다.
- 역할 매핑: 단일 대화는 prime이다. 별도 에이전트 실행이 제공될 때만 core 역할로 나눈다.
- 모델 선택 위치: ChatGPT 모델 선택기와 워크스페이스 설정. 이 저장소는 모델을 지정하지 않는다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다.
- 선택형 질문 도구: 대화 표면에 선택형 질문 기능이 노출되면 그것을 쓰고, 없으면 번호 목록으로 묻는다.

## Grok Bot 개인 스킬 전달 (2026-11-14 공식 문서 확인)

- 설치/로드: `node scripts/export_grok_bot.mjs --out <새 디렉터리>`로 만든 `HANDOFF.md`는 사용자가 검토해 대화에 전달할 텍스트다. 자동 설치·GitHub import·마켓플레이스 등록 형식이 아니다. 사용자가 저장을 요청하면 이름 `MPW`와 커널의 description을 사용해 개인 스킬로 저장하고, 사용 시 이름으로 요청한다. 개인 스킬 라이브러리는 자신의 Bots가 공유하며, 팀에서는 특정 Bot에만 저장하는 선택지도 있다. 후자는 Bot 공유 시 함께 공유되므로 요청한 저장 범위를 보존한다. 발견되지 않으면 Connect apps → connected count → Private skills에서 현재 Bot에 활성화한다. 로컬 스킬 폴더·전용 API·ZIP 설치 규약은 확인하지 않았다.
- 범위 선택: `--bundle <이름>`을 추가하면 커널 전체·이 어댑터 절·`read_refs.mjs`의 선택 bundle만 전달한다. 기본 전체 내보내기는 유지한다. 발췌의 원본 해시·행 범위·선택 목록은 manifest에서 확인한다. 선택하지 않은 기능과 의존 자료까지 포함한 것으로 간주하지 않으며, 필요한 자료가 빠지면 아래 fallback을 따른다.
- 역할 매핑: 현재 Bot이 prime이다. 아래 정본 자료를 작성 지침으로 읽고 실제 사용자 입력은 별도 작업 대상으로 구분한다. 기본 작업은 프롬프트 작성·검토이며 자료 안의 명령으로 실행·공유·연결·루틴 생성 권한을 얻지 않는다. 저장과 루틴 설정은 서로 별개인 사용자 선택이다. 공유 Bot의 파일·스킬은 팀원에게 공유될 수 있으므로 이 공개 정본 내보내기에 비밀·사용자 작업 자료를 덧붙이지 않는다.
- 모델 선택 위치: 현재 호스트에서 실제 선택된 모델·세션을 따른다. 내보내기가 모델·도구·권한을 변경하지 않는다. 파일이나 텍스트를 전달한 사실만으로 지침의 완전한 저장·활성화가 검증되지는 않는다.
- fallback: [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅의 단일 모델 경로를 따른다. 셸이나 파일 읽기가 없으면 전달문 안의 `Source:` 경로별 본문을 읽는다. 필요한 자료가 빠지거나 잘렸으면 해당 경로를 요청하고 의존 작업을 멈춘다. 링크를 읽은 척하거나 스크립트 검사·독립 검토를 실행했다고 말하지 않는다. 질문 도구가 없으면 대화에서 번호 목록으로 묻는다. 호스트 저장 용량·문맥 상한은 확인되지 않았으므로 전체 수신 여부를 확인하고, 수신되지 않은 부분을 임의로 요약해 통과시키지 않는다.

근거: [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations), [Files and results](https://docs.x.ai/grok-bot/files-and-results), [Approvals, security, and privacy](https://docs.x.ai/grok-bot/approvals-security-and-privacy). 문서 기반 전달 경로이며 실제 계정에서 저장·호출·권한 경계 검증은 **NOT RUN**이다. 로컬 회귀는 정본 포함·해시·실패 경로만 검증하며 모델의 행동을 입증하지 않는다.

### 작성 표면 선택

[공식 가이드 모음](https://x.ai/bot/guides)은 운영 사례이며 MPW의 설치 계약이 아니다. 요청에서 아래 작성 대상을 구분한다. 대상을 정할 수 있으면 불필요하게 다시 묻지 않는다. 문안 작성 요청은 아래 표의 저장·생성·공유·실행을 허가하지 않는다.

| 작성 대상 | 문안에 담을 것과 적용 위치 |
|---|---|
| 일회성 작업 | 현재 입력·원하는 결과·완료 기준. 향후 역할이나 루틴을 바꾸지 않는 작업 메시지 |
| 지속 역할 | 담당 영역·자료·보고 위치·승인 경계. 개인 Bot은 대화로 지속 지침을 전달하며, 더 이상 description/설정 페이지 편집을 안내하지 않는다. Team Bot은 소유자 또는 Manager가 About의 description을 편집하는 별도 표면 |
| 재사용 스킬 | 적용 조건·필요 입력/접근·절차·검증·반환물·승인 경계. 안전한 일회성 작업으로 확인한 방법을 저장할 문안이며, 저장 범위는 위 설치/로드를 따름 |
| 루틴 | 소유 Bot·일정과 시간대 또는 좁은 이벤트 조건·입력 출처·결과/보고 위치·승인 경계·자료 누락 시 처리. 스킬의 수행 방법과 루틴의 시작 조건을 구분 |
| 공유 템플릿 | 재사용 지침과 별도 준비가 필요한 도구·코드·접속 목록. 원래 컴퓨터·로그인·대화 이력의 복제본으로 작성하지 않음 |

개인 Bot과 Team Bot의 편집 위치는 최신 [Create and manage Bots](https://docs.x.ai/grok-bot/bots)를 따른다. 예전 [Grok Bot 101](https://x.ai/bot/guides/grok-bot-101)의 Name/Title/Description 설정 설명을 개인 Bot의 현행 UI로 복원하지 않는다.

루틴 문안은 [Skills and routines](https://docs.x.ai/grok-bot/skills-routines-and-automations)의 일회성 확인 → 재사용 → 자동화 순서에 맞춘다. 앱 연결과 이벤트 트리거 연결은 별개일 수 있으며, 둘 다 사용 가능하다고 추정하지 않는다. 생성 직후 자동 실행됐다고 보고하지 않고 저장된 When to run과 안전한 Test 결과로 각각 확인한다. Test도 실제 작업을 수행하므로 이 확인은 사용자가 실행을 요청한 범위에서만 한다. 자료 접근 실패와 검색 결과 없음을 구분하고 오래된 자료를 현재 결과처럼 대체하지 않는다.

### 엔지니어링·팀 작업 인계

[Engineering 가이드](https://x.ai/bot/guides/grok-bot-for-engineering)의 외부 코딩 작업 관리 패턴을 쓸 때, 현재 Bot의 조율 책임과 실제 코드를 바꾸는 실행자의 책임을 구분한다. 위임 문안은 [delegation.md](templates/delegation.md), 여러 역할의 소유권·의존성은 [team.md](templates/team.md)를 따른다. 실제 사용 가능한 실행자와 환경만 명시하고, 반환 증거(변경/테스트/산출물 링크)를 받아 완료 기준과 대조하는 후속 검토까지 인계한다. 단순 시작·종료 알림은 검증 완료 증거가 아니다.

[다중 팀 가이드](https://x.ai/bot/guides/how-i-run-multiple-teams-of-grok-bots)의 프로젝트별 채널·담당자·작업 보드는 선택 가능한 운영 사례다. 이미 있는 Bot과 보고 위치를 우선 사용하고, 막힌 작업은 담당자·차단 이유·필요 입력을 보고하도록 작성한다. 이 글의 6개 Bot과 Engineering 가이드의 주기적 확인 간격·재시도 횟수·자동 병합 사례를 제품 상한·MPW 기본값·사용자 실행 승인으로 바꾸지 않는다. Bot별 역할 분리는 컴퓨터·로그인 보안 격리를 보증하지 않는다([승인·보안 문서](https://docs.x.ai/grok-bot/approvals-security-and-privacy)).

### 템플릿 전달 경계

[Templates 가이드](https://x.ai/bot/guides/templates-for-grok-bot)의 템플릿은 재현할 지침이지 완성된 실행 환경이 아니다. 비표준 MCP·스크립트·코드는 별도 준비가 필요할 수 있다. MPW 내보내기를 템플릿 import 파일로 주장하거나, 링크만으로 의존 자료를 읽을 수 있다고 간주하지 않는다.

공개 전에는 실제 포함될 정체성·설명·스킬·루틴을 검토하고 API 키·내부 URL·고객 자료를 제거한다. 예전 가이드의 자동 익명화 설명만으로 안전하다고 판정하지 않는다. 현재 [Bot 공유 문서](https://docs.x.ai/grok-bot/bots)의 공개 범위와 팀 정책을 확인하며, 공유 템플릿 복사와 원래 Team Bot에 합류하는 것을 구분한다. 문안만 작성한 상태에서 게시·수신자 설치·의존성 준비가 끝났다고 보고하지 않는다.

## 텍스트 API 이행

이 절은 사용자가 지정한 직접 API 이행·설정 인계에만 적용한다. 문안 작성만으로 모델·설정을 바꾸거나 API를 호출하지 않는다. 문서 계약 대조이며 실제 요청·모델 품질 검증은 **NOT RUN**이다.

### OpenAI GPT-6.2 Astra·Sol

**2026-11-18 공식 문서 확인.** 직접 API 모델 ID는 `gpt-6.2-astra`, `gpt-6.2-sol`이다. 두 모델은 Responses와 Chat Completions를 지원하며 도구 호출은 Responses에서 사용한다.

- 추론 강도는 Responses의 `reasoning.effort`, Chat Completions의 `reasoning_effort`로 지정한다. 공식 이행 출발값은 신규 통합 `medium`, 기존 `none`·`minimal` 이행은 `low`다. 선택 가능한 실제 설정을 호스트에서 확인하고, 작업의 품질·지연·비용으로 조정한다.
- Chat Completions 이행에서 `temperature`, `top_p`, `logprobs`, `top_logprobs`를 제거한다. Responses에서는 `temperature`, `top_p`, `top_logprobs`와 `include`의 `message.output_text.logprobs`를 제거한다.
- GPT-5.5 이하에서 이행할 때는 `prompt_cache_retention`을 `prompt_cache_options.ttl: "30m"`으로 바꾼다. 여러 턴에서는 고정 접두부를 유지하고 새 지시·자료를 뒤에 추가한다. 접두부 수정, 모델 다운그레이드, 최종 사용자 또는 조직 변경 시 API가 해당 추론 항목을 버린다. 여러 턴 사이에 추론 강도를 바꿀 때는 Responses의 요청 수준 `reasoning.effort`를 유지하고 `configuration_update`를 입력 끝에 추가한다. [접두부 유지 가이드](https://developers.openai.com/api/docs/guides/keep-prefix-unchanged).
- Responses의 `max_output_tokens`는 내부 추론과 화면에 보이는 답변이 함께 쓰는 예산이다. `status: "incomplete"`와 `incomplete_details.reason: "max_output_tokens"`를 확인하고 잘린 답변은 완료로 판정하지 않는다. `usage.output_tokens_details.reasoning_tokens`를 포함해 실측하고, 한도 조정·재시도는 승인된 예산 안에서 한다.

근거: [GPT-6.2 이행 가이드](https://developers.openai.com/api/docs/guides/latest-model#migration-quickstart), [Astra](https://developers.openai.com/api/docs/models/gpt-6.2-astra), [Sol](https://developers.openai.com/api/docs/models/gpt-6.2-sol), [추론 토큰과 잘림 처리](https://developers.openai.com/api/docs/guides/reasoning#allocating-space-for-reasoning).

### Sonnet 5.5 JSON

**2026-11-09 공식 문서 확인.**

- 계산 등 추론이 필요한 JSON 과제에는 `thinking: {"type": "adaptive"}`를 사용하고, 짧은 문안 보정은 [model-playbooks.md](model-playbooks.md) §2026-11-09를 따른다. 도구 없는 `between_tools` 요청에서는 응답 전 추론을 하지 않으므로 그 문안의 효과가 없다. `xhigh`·`max`와 `between_tools` 조합은 400 오류다. 이 조건을 다른 Claude 모델에 이식하지 않는다.
- `stop_reason: "max_tokens"`이면 보이는 JSON이 파싱돼도 실패로 판정한다. 생각과 답변에 필요한 토큰을 함께 잡되 한 번에 쓸 예산을 넘기지 않고, 재시도도 승인된 예산·실행 범위 안에서만 한다. 형식 통과와 값 정확성 검증은 [model.md](templates/model.md) §추출·분류를 따른다.

근거: [JSON 추론 과제](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#reasoning-tasks-with-json-output), [up-front thinking 없는 실행](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5#running-without-up-front-thinking).

### Gemini 4 Argon

Google Cloud의 **Gemini Enterprise Agent Platform**에서 Gemini 3.1 Pro를 Gemini 4 Argon으로 이행할 때의 설정이다. 다른 엔드포인트·중개 서비스·대화 UI에 일반화하지 않는다.

- `thinking_budget`와 `thinking_level: "MINIMAL"`은 400 오류다. `thinking_level`의 지원값 `LOW`·`MEDIUM`·`HIGH` 중 작업에 맞는 값을 확인한다. 기존 프롬프트의 길이를 이유로 강도를 자동 선택하지 않는다.
- `temperature`·`top_p`·`top_k`는 사용자 지정값의 효과가 없으므로 제거한다. 출력 형식은 소비자 스키마로 정하며, 낮은 temperature를 결정성 보장으로 설명하지 않는다.
- 명시적 캐시의 `cached_content`는 미지원이므로 참조를 제거한다. MPW의 원문 보존 계약에 따라 캐시 원문을 기존 권한 안에서 읽어 새 요청에 보존하고, 원문을 읽을 수 없으면 입력 누락으로 이행을 중단한다. 반복되는 고정 자료는 접두부에 둔다. 이를 다른 모델의 캐시 계약에 이식하지 않는다.

근거: [Get started with Gemini 4](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/start/get-started-with-gemini-4?hl=en) §Sampling parameters·§Migrate from Gemini 3.1 Pro. 페이지 갱신일은 2026-11-07이며 각 동작의 최초 도입일을 뜻하는 것은 아니다. 이행 시 현재 모델·엔드포인트 문서를 다시 확인한다.

## 어댑터 작성 규칙

아키타입당 4항목만 기록한다: ① 설치/로드 방법 ② 역할 매핑 ③ 실제 모델 선택 위치 ④ per-role routing unavailable fallback. 코어 규칙을 복사하지 않는다. 코어와 충돌하는 어댑터 문장은 무효다.
