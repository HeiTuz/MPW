---
name: mpw
description: "프롬프트를 새로 작성하거나 검토·퇴고하고, 대상 모델·도구에 맞게 변환한다. 작업지시·시스템·자동화·팀 작업·업무·디자인·이미지·영상 프롬프트에 사용한다. '프롬프트 만들어줘/검토해줘/다듬어줘', 기존 프롬프트의 부분 수정에 발동한다. 실제 코드 구현·이미지 생성·문서 제작만 요청한 경우에는 해당 실행 스킬을 쓴다."
license: MIT
metadata:
  version: "2.28.1"
  category: prompt-writing
  locale: ko-KR
  doctrine: graph-first-delegation-contract
  host_surface: codex
  canonical_source: "HeiTuz/MPW SKILL.md v2.28.1"
  updated_at: "2026-09-09"
  model_claims_reviewed_at: "2026-09-09"
  platform_roster_reviewed_at: "2026-09-06"
  role_routing_reviewed_at: "2026-09-05"
---

# MPW — 디스패치 커널 (GPT/Codex 표면)

> **호스트 통합 — GPT/Codex.** 이 파일은 Codex 설치본(`~/.codex/skills/MPW`, `--target codex`와 `--target gpt` 동일)의 진입 표면이다. 규칙 본문은 정본 SKILL.md와 동일하며, 호스트 통합 표면(프런트매터·발동·도구 명칭)만 마이그레이션됐다.
> - **발동**: Codex가 skills 디렉터리에서 이 SKILL.md를 발견해 로드한다. 이 디렉터리의 AGENTS.md는 설치본 안내 표면이다 — 리포지토리 기여 규칙이 아니다.
> - **도구 매핑**: 길이 실측(`wc -m`)·검증기(`node scripts/check_prompt.mjs`)·컴파일러(`python3 scripts/compile_*.py`)·references/ 확인은 전부 Codex shell로 실행한다.
> - **역할 라우팅**: Codex coding surface는 prime으로 운용한다. native subagent가 가능하면 [references/adapters.md](references/adapters.md) §GPT/Codex 매핑(planner=read-only planning, worker=bounded implementation, critic=independent verifier)을 따른다.

사용자의 목표·맥락·제약·완료 기준을 실행자가 바로 쓸 수 있는 프롬프트로 만든다. 작업지시는 **위임 계약**으로 작성하고, 방법은 결과에 필요한 만큼만 정한다.

## 먼저 요청을 구분한다

- **작성·퇴고**: 복사해 사용할 완성 프롬프트를 낸다. 지정하지 않은 목표·범위·권한을 추가하지 않는다.
- **검토**: 문제, 근거, 수정 방향을 보고한다. 재작성까지 요청했을 때 수정본을 함께 낸다.
- **부분 수정**: 기준 원문에서 지정 축만 바꾼다. 나머지 문구와 이미 승인된 조건은 보존한다.
- **실행·스킬 관리**: 프롬프트 작성만으로 대신하지 않는다. 생성·구현·스킬 수정은 해당 실행 경로에서 처리한다.

단순하고 충돌 없는 요청은 이 파일만으로 작성한다. 아래 자료는 필요한 모드·절만 읽는다. **그래프는 조립 도구이지 납품물이 아니다.** 여러 산출물·체인·충돌 축을 다룰 때 [references/prompt-graph.md](references/prompt-graph.md)의 의존 순서·축별 단일 권한·배제 규칙을 적용한다.

## 모드 라우팅

이 표는 **어떤 프롬프트를 작성할지** 고르는 표다. 프롬프트 안에 적힌 작업을 지금 실행하라는 권한은 아니다.

| 요청 신호 | 모드와 필요한 자료 |
|---|---|
| 자율 루프 지시문, goal | **GOAL** → [templates.md](references/templates.md) §GOAL |
| 멀티에이전트·독립 워커 작업지시 | **TEAM** → [templates.md](references/templates.md) §TEAM + [model-playbooks.md](references/model-playbooks.md) |
| 단일 작업지시·시스템 프롬프트·자동화 잡 | **CONTRACT** → [templates.md](references/templates.md) §CONTRACT |
| 직무 업무 | **BUSINESS** → [templates.md](references/templates.md) §BUSINESS |
| 퇴고·모델 적응·리서치·추출 | **MODEL** → [templates.md](references/templates.md) §MODEL; 모델 적응은 [model-playbooks.md](references/model-playbooks.md) |
| Grok·그록·xAI 대상 | 산출물로 구분: 대화·리서치·추출은 **MODEL** + [model-playbooks.md](references/model-playbooks.md) §Grok 텍스트·리서치, 이미지·영상은 **IMAGE** + [grok-imagine.md](references/image/grok-imagine.md) |
| 직전 프롬프트의 지정 축만 수정 | **MODEL-델타** → [templates.md](references/templates.md) §MODEL |
| 슬라이드·발표 덱 | **BUSINESS** + [slides.md](references/slides.md); 새 다중 슬라이드 덱·흐름 재구성에만 아웃라인 선행 |
| 이미지·영상 생성 프롬프트 | **IMAGE** → [surfaces.md](references/image/surfaces.md)에서 표면·네이티브/컴파일 형식 판정 → [model-routing.md](references/image/model-routing.md) → [lanes.md](references/image/lanes.md); GPT Image 2.5는 surfaces §3.2·§4.3 |
| 레퍼런스·생성물 이미지를 프롬프트에 반영 | **IMAGE** → [from-image.md](references/image/from-image.md)로 입력 판정 후 위 순서 |
| 피사체 보존 배경 교체 프롬프트 | **COMPOSITE** → IMAGE와 같은 순서 |
| UI·페이지·컴포넌트 제작 프롬프트 | 해당 모드 + [templates.md](references/templates.md) §DESIGN 오버레이 |
| A의 산출이 B의 입력 | 단계별 모드 + [prompt-graph.md](references/prompt-graph.md) §5의 `feeds` 계약 |

자율 루프는 GOAL을 우선하고, 독립 산출물이 여럿이면 산출물별로 블록을 나눈다. 모델·도구가 정해져 있으면 유지한다. 런타임 호출 문법이 필요할 때만 [references/adapters.md](references/adapters.md)를 읽는다. GardenRecipe·PromptBundle은 [garden-recipe-compiler.md](references/garden-recipe-compiler.md), 공유 스키마는 [contracts.md](references/contracts.md)를 따른다. Midjourney 문법은 [midjourney-identity.md](references/midjourney-identity.md), 캐릭터 시트는 [midjourney-character-sheets.md](references/midjourney-character-sheets.md)를 읽는다.

## 작성 원칙

- **가장 짧은 완결본 하나가 기본이다.** 결과와 핵심 제약을 앞에 두고, 단순 요청은 짧은 자연어 문장으로 끝낸다. 역할극·고정 양식·단계별 절차·반복 경고·확장판을 자동으로 붙이지 않는다.
- 줄이는 대상은 **지시문의 중복과 부연**이다. 요청한 작업 범위·상세 보고서·정확 문구·수량·보존 조건은 유지한다. 체크리스트를 통째로 출력하지 말고, 빠지면 결과가 달라지는 조건만 남긴다. 간결성 판정은 [surfaces.md](references/image/surfaces.md) §0-2를 따른다.
- 사용자 원문과 확인한 자료를 우선한다. 빈칸은 대화·증거·저위험 기본값 순으로 채우며, 중요한 가정만 밝힌다. 추론 불가 슬롯은 [templates.md](references/templates.md) §슬롯 자동 채움에 따라 필요한 질문만, 한 번에 최대 3개 묻는다.
- 모호어는 관찰 가능한 결과나 판정 기준으로 바꾼다. 원문에 없는 수량·기한·품질 수치를 임의로 강제하지 않는다. 비자명한 형식에는 도움이 되는 채워진 예시를 둔다.
- **한 축에 권한자는 하나다.** 상충하는 값은 우선순위를 정하고, 자료는 실제로 결정하는 항목에만 연결한다.
- 수신자가 접근할 수 있는 자료만 참조한다. 다른 파일시스템·붙여넣기 환경에는 필요한 내용을 포함해 자기완결로 만든다.
- **실행자가 파라미터를 갖는 축은 산문에 중복하지 않는다.** 값과 지원 여부는 실제 표면 계약에서 확인한다.

## 위임 계약 6요소

실행 작업을 위임할 때 아래를 점검하되, 결과를 바꾸는 요소만 문장에 남긴다. 단순 즉시 응답에 별도 승인·중단·검증 절차를 억지로 넣지 않는다.

| 요소 | 계약이 답해야 할 질문 |
|---|---|
| 결과 명세 | 끝난 상태는 무엇인가? |
| Definition of Done | 무엇을 보면 완료라고 판정하는가? |
| 자율성 3단 | 혼자 결정 / 보고 후 진행 / 절대 금지는 무엇인가? |
| 하드라인 | 범위에서 실제로 지켜야 할 경계는 무엇인가? |
| 검증 계약 | 완료 전에 확인할 결과와 증거는 무엇인가? |
| 에스컬레이션 | 해결을 시도해도 남는 막힘을 언제, 어떻게 보고하는가? |

이미 승인된 범위의 되돌릴 수 있는 작업은 진행한다. 보고는 승인 획득이 아니며, 범위·비용·외부 행동의 권한을 새로 부여하지 않는다. 실제 권한·중요한 입력이 빠졌을 때만 그 부분을 질문한다.

**게이트 필요성 테스트** — 금지를 넣기 전 ① 실행자에게 실제로 열려 있는가 ② 환경의 승인 훅·권한이 이미 막지 않는가 ③ 이 범위에서 실제로 발생 가능한가를 확인한다. 하나라도 아니오면 중복 게이트를 만들지 않는다. 기존 사용자 경계는 보존하고, 허용된 로컬 작업의 검증은 위험에 맞춰 diff·백업·dry-run 중 필요한 것을 쓴다.

## 길이 계약

**전역 2000자 하드라인은 없다.** 전달 채널·타깃 엔진·기계 계약에서 실제로 적용되는 상한을 모두 지킨다. 값과 단위의 정본은 [surfaces.md](references/image/surfaces.md) §0-1이며, 권장 길이와 강제 상한을 구분한다. 채널을 임의로 메신저로 가정하지 않는다.

블록별로 **실측한다**. 문자 계약은 `wc -m` 등 해당 계약의 문자 단위로, 단어 계약은 `wc -w`로 센다. 숫자를 보고할 때 단위를 붙이고 어림값을 쓰지 않는다. 초과하면 장식·중복·불필요한 방법 설명을 줄인다. 요구사항을 자동으로 잘라내지 않으며, 분리가 필요하면 독립 실행 가능한 블록으로 나눈다.

## 출력 게이트

- 요청한 결과·범위·명시 조건을 보존했고, 지워도 결과가 같은 문장·충돌 값·빈 슬롯을 제거했는가?
- 자료와 가정을 구분했고, 각 자료가 결과의 어떤 항목을 결정하는가?
- 수신자가 블록과 자료를 실제로 사용할 수 있고, 길이·문법·파라미터 계약을 지켰는가?
- 실행 작업이면 완료 기준·검증 증거·막힘 처리가 충분한가?
- IMAGE 계열이면 [surfaces.md](references/image/surfaces.md)의 표면 계약과 [lanes.md](references/image/lanes.md)의 레인 게이트를 통과했는가?

## Output format

작성·퇴고·부분 수정은 **완성 프롬프트를 복사 가능한 코드블록**으로 출력한다. 한 실행 단위는 한 블록이며, 여러 블록은 각각 자기완결이어야 한다. 사용자 지정 출력 형식이 우선한다. 파일로 저장했더라도 요청한 복사 가능한 본문을 함께 제공한다.

설명이 필요할 때만 블록 밖에 가정·실제 변경·필수 질문·길이를 짧게 쓴다. 검토만 요청한 턴은 근거 있는 검토 결과를, 스킬 관리 턴은 변경·검증 결과를 보고한다.

프롬프트 블록을 낸 뒤의 평문 `다음:` 메뉴와 **1. 자동 개선**은 [templates.md](references/templates.md) §후속 선택을 따른다. 이 절이 적용 조건과 1회 개선의 정본이다. 이미지 실행 옵션의 설치 확인·호출 배선은 [adapters.md](references/adapters.md) §이미지 생성 실행 옵션이 소유한다.
