# 모델 플레이북 (표면층) — Capability-first

**이 파일이 역할·분해·모델 적응의 정본이다.** 모델명은 공개 라우팅 어휘가 아니다. 먼저 역할 권한을 정하고, 실제 모델·프로필 선택은 런타임 어댑터 또는 사용자 환경 설정에 둔다. 여기 없는 모델 능력·API 플래그를 지어내지 않는다.

**라우팅 계약 검토: 2026-09-05.** 아래 코어는 특정 공급자 우열 주장이 아니다. 모델별 행동 차이는 맨 아래 dated compatibility note에만 두고, 이미지/영상 엔진 주장은 references/image 계층의 dated note가 이긴다. 각 노트의 날짜로부터 6개월 이상 지났거나 해당 런타임 메이저 버전이 바뀌었으면 재검증 전까지 단정하지 않는다.

## 역할·권한 라우팅

| 역할 | 권한 | 대표 작업 | 최소 capability |
|---|---|---|---|
| `prime` / integrator | 결과 소유, 결정, 상태, 통합, 최종 검증, 완료 claim | 전체 goal, 다중 레인 통합, release 판정 | 계약에 필요한 capability; 고위험·광역 통합은 strongest-reasoning/high-risk |
| `planner` / architect | 읽기 전용 범위 파악, 옵션, 의존성, 위험, 수용 기준 설계 | 사전 조사, 경계 설계, acceptance matrix | 사실 확인은 fast/read-only; 아키텍처·고위험 판단은 strongest-reasoning/high-risk |
| `worker` / executor | 명시 목표와 acceptance가 있는 bounded slice 실행 | 파일 구현, 자료 조사, fixture 작성 | 작업에 맞는 capability; 쓰기·도구 실행은 해당 런타임의 agentic 권한으로 수행 |
| `critic` / verifier | frozen artifact와 같은 계약을 독립 검토 | code review, prompt review, release gate | 검토 범위에 맞는 capability; release·보안·광역 검토는 strongest-reasoning/high-risk |

라우팅 원칙:

1. **권한·작업 적합성·도구 지원·관측된 성공률·지연·사용 한도**로 고른다. 역할은 책임 범위이며 모델의 고정 서열이 아니다. 사용자가 지정한 모델과 런타임의 고정 역할 설정을 우선한다.
2. `prime`은 상태·결정·통합·최종 claim을 소유한다. worker가 "완료"를 주장해도 prime이 같은 표면으로 검증하기 전에는 완료가 아니다.
3. `planner`와 `critic`은 기본 read-only다. 둘 다 쓰는 경우 같은 frozen artifact와 같은 계약을 보게 하고, 둘 다 돌아온 뒤 prime이 결론을 합친다.
4. `worker`는 target, scope, acceptance, non-goals가 명시된 slice만 받는다. 누락된 acceptance를 worker에게 추론시키지 않는다.
5. per-role routing이 없으면 가능한 작업을 같은 모델에서 역할별로 순차 수행하고 권한·검증 범위를 유지한다. 같은 세션의 역할 전환이나 자기 검수를 독립 검토로 보고하지 않는다. 별도 검토자가 필수인 요청에서 지원이 없으면 그 미충족 조건을 명시한다. 모델명 고정이나 가상의 에이전트 호출로 대신하지 않는다.

## 컨텍스트 운용

컨텍스트는 시스템 지시·도구 결과·제공 자료·대화 이력이 함께 만드는 현재 추론 상태다. 중간 정보 소실, 관련 없는 내용의 오염, 정보가 많아져 판단이 퍼지는 산만을 별도로 점검한다.

위임은 작업을 나누는 것뿐 아니라 서로의 불필요한 이력을 섞지 않는 컨텍스트 격리 수단이다. 도구는 기능·호출 시점·반환 형식을 [contract.md](templates/contract.md) §도구 정의 문안에 따라 정해, 결과를 다음 판단에 바로 쓸 수 있게 한다.

작업 단위는 필요한 자료와 검증만 남겨 토큰을 쓰는 경제 단위로 자른다. 같은 결론에 필요 없는 반복 설명·도구 호출·이력 인용은 제거한다. 파일 참조를 지원하는 런타임에서는 새로 얻은 긴 로그를 파일로 남기고 경로를 인용해 필요할 때 다시 읽는다. 이미 보낸 대화 이력은 고쳐 쓰지 않는다. 위임 결과는 결론·증거 위치·미해결 항목을 담은 요약으로 받는다.

진행 중 새 지시는 기존 목표·완료 작업과 대조해 바뀐 조건에 반영한다. 상태 질문에 답한 뒤에는 진행하던 일을 계속하며, 명시된 취소·목표 교체는 따른다. 장기 작업의 요약에는 목표·제약·결정·완료 증거·미완료 항목·산출물과 자료의 식별자(경로·URL·ID), 겪은 문제와 처리 방식, 시도하거나 보류한 대안과 그 이유를 남긴다. 사용자 조건·합의와 재구성하기 어려운 이름·수치·날짜·정확한 문구·링크는 원문 그대로 둔다. 진행 문구는 실제 결과에 근거하고, 최종 답변은 중간 보고를 읽지 않아도 전체 결과를 알 수 있게 쓴다. 비동기 도구·중간 지시·컨텍스트 압축 지원은 실제 런타임에서 확인한다.

## 구조·분해 규칙

### Topology-first intake

작업이 여러 산출물·레인·컴포넌트를 가질 수 있으면 깊게 들어가기 전에 최상위 결과 목록부터 확정한다. 가장 잘 설명된 컴포넌트 하나가 형제 scope를 가리면 실패다.

프롬프트에 넣을 축약 문장:

```text
먼저 최상위 결과/컴포넌트 목록을 1회 열거하고, 누락된 형제가 없는지 확인한 뒤 각 항목의 acceptance를 채운다. 한 항목의 세부가 충분하다는 이유로 다른 항목의 scope를 생략하지 않는다.
```

### Validation-coupled decomposition

같은 acceptance/review 표면을 공유하는 일은 함께 둔다. 병렬화는 파일이 나뉘는지가 아니라 **검증이 독립적인지**로 판단한다.

| 같이 둔다 | 나눠도 된다 |
|---|---|
| 같은 API 계약을 바꾸는 구현+테스트 | 독립 문서/fixture 작성 |
| 한 UI 화면의 상태·스타일·접근성 | 서로 다른 페이지나 독립 컴포넌트 |
| 하나의 release claim에 묶인 버전·README·installer | 각 런타임 install smoke |
| 같은 schema를 읽고 쓰는 producer/consumer | read-only 조사와 bounded implementation |

### Join gate

독립 레인이 있으면 prime은 아래 join gate 전에는 최종 승인하지 않는다. planner·critic은 실제 배정했거나 사용자가 검토를 요구했을 때만 대기 대상이다. 선택하지 않은 역할을 완료 조건으로 새로 만들지 않는다.

```text
Join gate: 실제 배정한 worker 산출물과 요청된 planner/critic/verifier 검토가 모두 도착한 뒤 prime이 통합 검증한다. 검토 대상과 최종 산출물이 달라졌으면 영향받는 검증을 갱신한다. 배정한 레인의 필수 결과가 빠졌으면 완료가 아니라 pending/blocker다.
```

## Blocker classification

에스컬레이션은 human-only blocker에만 쓴다. 아래 표를 프롬프트에 맞게 압축해 넣는다.

| 분류 | 처리 |
|---|---|
| Resolvable | 파일 누락, 테스트 실패, 불명확한 내부 구현 선택, 재현 실패 초기 단계 → 탐색·대체 접근·최소 재현을 계속 |
| Scope-changing | 공개 API 변경, 비용/외부 호출, 데이터 삭제, product 방향 양자택일 → 선택지와 영향 정리 후 보고 |
| Human-only | 비밀값, 계정 권한, 승인 필요한 외부 발신, 사용자가 가진 원본 자료, 결과를 가르는 취향 결정 → 멈춰 질문 |

## Surface-matched evidence

검증 증거는 claim의 표면과 폭을 맞춘다.

| Claim | 맞는 증거 |
|---|---|
| CLI/installer가 작동한다 | 실제 명령 실행, 설치 위치의 파일 존재, help/error path |
| Web UI가 작동한다 | 실제 브라우저 조작, 콘솔/스크린샷/뷰포트 |
| API가 작동한다 | live process에 curl 또는 driver script |
| Prompt contract가 개선됐다 | fixture/길이/린트 + 예시 산출물이 새 규칙을 통과 |
| Release-ready다 | version sync, lint/test/smoke, public scan, diff check |

## 공통 적응 규칙

- 짧은 요청은 결과·제약을 앞에 둔다. 긴 자료는 지시와 구분하고, 자료 뒤에 실제 질문을 둔다. 같은 지시를 앞뒤에 통째로 복제하지 않는다.
- **지시문 길이·최종 답변 길이·추론 강도는 별개다.** 짧은 프롬프트나 답변을 위해 강도를 자동 변경하지 않는다. 기존 모델·설정을 유지하고 계약을 먼저 고친다. 단, 선택된 모델의 dated note가 추론량 조절을 설정부터 하라고 정하면 그 노트를 따른다. 설정 조정이 범위에 포함될 때만 실제 지원값으로 품질·비용·지연을 비교한다. 호출 문법은 [adapters.md](adapters.md)에서 확인한다.
- 내부 추론을 이미 하는 모델에 단계별 사고 공개·"더 깊게 생각해" 반복을 붙이지 않는다. 필요한 결론·근거·검증 결과를 요구한다.
- **모델 유형에 따라 지시의 입도를 바꾼다.** 내부 추론 모델에는 목표·성공 기준·실제 제약을 짧고 직접적으로 주고 방법은 맡기며, 기준을 충족할 때까지 반복하도록 요구한다. 추론 없이 지시를 따르는 모델에는 필요한 논리·절차·자료를 프롬프트 안에 명시한다. 같은 계열의 다른 스냅샷도 결과가 달라질 수 있으므로, 프로덕션 프롬프트는 스냅샷을 고정하고 평가 케이스로 변화를 잰다. 유형 판정은 실제 선택된 모델의 문서로 하고, 이름만으로 추정하지 않는다.
- API·시스템 프롬프트의 메시지 역할 분리·구획 순서·캐시 친화 배치·코드 관리는 [contract.md](templates/contract.md) §메시지 역할과 배치가 정본이다.
- 역할·예시·부정문은 요구를 명확히 하는 만큼만 둔다. 작성 기준은 [common.md](templates/common.md) §범용 조립 규칙, 구조화 출력·결측값은 [model.md](templates/model.md) §추출·분류가 정본이다.
- 모델 간 변환은 텍스트 프롬프트의 부분 수정으로 다룬다. 요구·정확 문자열·출력 계약·언어는 [common.md](templates/common.md) §기준 원문과 누적 수정에 따라 보존한다. 원 모델이나 표면에만 맞는 관용구와 배치는 제거·교체 후보로 삼고, 대상 모델의 dated note 중 이 작업에 필요한 보정만 적용한다. 바뀐 내용과 이유는 프롬프트 밖에 적는다. 이미지·영상 프롬프트의 엔진 간 변환은 [prompt-conversion.md](image/prompt-conversion.md) 소관이다.

## 목적 블록 (토큰 값어치 할 때만)

분야별 추가 조건은 필요한 것만 읽는다. 코딩·에이전트는 [delegation.md](templates/delegation.md) §도메인별 추가 조건, 리서치·팩트체크와 제공 자료 기반 응답은 [research.md](research.md) §판정 대상·§허용 근거 범위, 추출·분류는 [model.md](templates/model.md) §추출·분류가 소유한다. 영상은 [image/lanes.md](image/lanes.md) §영상 공통 규칙, 슬라이드는 [slides.md](slides.md) §`feeds` 계약과 아웃라인 계약을 따른다. 분량은 [image/surfaces.md](image/surfaces.md) §0-2, 이미지 슬롯 기본값은 [image/lanes.md](image/lanes.md) §이미지 슬롯 기본값을 따른다.

## 호환 노트

구체 모델명·공급자명·프로필명은 실제 프롬프트 동작 차이를 보존하는 dated note에서만 쓴다. 공개 canonical routing vocabulary로 승격하지 않는다. 런타임별 설치와 역할 매핑은 [adapters.md](adapters.md)가 유일한 표면이다.

**노트를 쓰는 규칙:** 관측한 행동 차이만 적는다. 세대·버전 번호로 우열을 주장하지 않는다. 노트가 없는 모델에는 코어 규칙만 적용하고, 없는 능력·플래그를 지어내지 않는다.

### 공급자 색인

날짜별 확인 범위를 유지한다. 해당 공급자의 불릿만 찾고, 다른 공급자의 배치·설정을 옮기지 않는다.

| 공급자 | 날짜 절과 찾을 항목 |
|---|---|
| OpenAI | 09-05 Astra/GPT-5.6, 09-16 권한·캐시, 09-24 추론·공유 스킬, 09-27 상세도·도구 |
| Anthropic | 09-05 문체, 09-24 서식, 09-25 이행·진행, 09-27 Opus/Fable 보강 |
| Google | 09-05·09-24 Gemini, 09-27 API 이행 |
| xAI | Grok 텍스트·리서치 |
| DeepSeek | 09-24 JSON Output |

### Grok 텍스트·리서치

**2026-09-07 공식 문서 확인.** 아래는 문서에 근거한 MPW 작성 정책이다. Grok Chat·xAI 직접 API·중개 서비스의 도구와 설정은 별도 계약이며, 이미지·영상 요청은 [image/grok-imagine.md](image/grok-imagine.md)로 보낸다.

- **리서치 범위를 구체화한다.** 질문·비교 축·자료 기간·필요한 근거와 출력 형태 중 결과를 가르는 것만 쓴다. 큰 조사는 첫 결과에서 부족한 축을 후속 질문으로 좁힌다. 일반 대화에 조사 절차를 덧붙이지 않는다. [공식 리서치 사용례](https://x.ai/grok/use-cases/research-synthesis), [Multi Agent prompting guide](https://docs.x.ai/developers/model-capabilities/text/multi-agent#prompting-guide).
- **검색 요청과 도구 설정을 구분한다.** Chat에는 필요한 웹·X 자료를 자연어로 요청한다. API에는 실제 연결된 `web_search`·`x_search`의 지원 필터를 사용한다. 도메인 필터와 X 계정·날짜 필터를 서로 복사하지 않는다. X 반응은 사실 확인 자료와 구분한다. [Web Search](https://docs.x.ai/developers/tools/web-search), [X Search](https://docs.x.ai/developers/tools/x-search).
- **주장별 근거를 요구한다.** 검색 중 수집된 `citations` URL 목록에는 최종 답변에 쓰지 않은 자료도 포함된다. 주장별 출처 대응·미확인 처리는 [research.md](research.md)를 따른다. 인라인 인용 설정만으로 인용 완비를 보장하지 않는다. [Citations](https://docs.x.ai/developers/tools/citations).
- **기계 출력은 소비자 스키마가 정한다.** 직접 API의 지원 스키마를 쓰되 필드 생략·`null`·결측을 구분한다. 자연어의 `JSON만` 지시를 구조 보장으로 표현하지 않는다. best-effort 제약과 사실 정확성은 소비자에서 검증한다. [Structured Outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs); 결측 정책은 [model.md](templates/model.md) §추출.
- **추론 설정을 자동 이식하지 않는다.** 공통 적응 규칙대로 출력 길이와 추론을 분리한다. 직접 API에서 일반 reasoning 모델의 effort는 깊이를, Multi Agent 변형은 참여 수를 제어하므로 모델·표면을 확인한다. `깊게 생각해`·사고 과정 공개 요구나 고정 effort를 프롬프트에 덧붙이지 않는다. [Reasoning](https://docs.x.ai/developers/model-capabilities/text/reasoning).

인용이 필요한 API 인계에만 설정 차이를 확인한다: 현재 직접 Responses API는 인라인 인용 기본 활성, xAI Python SDK의 gRPC chat은 opt-in이다. 웹 UI·래퍼에 같은 설정을 복사하지 않는다. 이 절의 확인일은 문서 기준이며 계정 가용성·실제 Grok 응답 품질을 검증한 날짜가 아니다.

### 2026-09-05 — 공식 문서 대조

아래는 확인일의 공급자 지침을 MPW에 적용한 작성 정책이다. 실제 선택된 모델에 해당하는 보정만 쓴다. 계정 가용성·모델 우열·실측 성능 보증이나 공통 API 설정표가 아니다.

- **OpenAI GPT-6 Astra / GPT-5.6**: Astra에서 불필요한 확인·긴 형식·과검증이 나타나면 이미 허가된 범위의 지속, 원하는 문체, 필요한 검증 폭을 짧게 명시한다. GPT-5.6은 기존에 효과가 있던 지침·예시·도구 설명에서 중복을 한 묶음씩 덜어 같은 사례로 비교한다. 짧은 답에서도 필수 사실·근거는 보존한다. [Astra 가이드](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices), [GPT-5.6 가이드](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6#prompting-best-practices).
- **Claude Fable 5.1 / Opus 5**: Fable 5.1의 진행 보고는 2026-09-25 노트의 해당 항목을 따른다. 과밀한 문장은 직접적인 표현·문단으로 풀되 필요한 표·목록까지 금지하지 않는다. Opus 5에서는 모든 작업에 검증·검토자를 덧붙이던 관성을 제거한다. 요청된 검사와 완료 증거는 유지한다. 추가 성향 보정은 2026-09-27 노트를 따른다. [Fable 5.1 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1), [Opus 5 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5).

### 2026-09-16 — OpenAI 프롬프팅·캐싱 문서 대조

아래는 확인일의 OpenAI 공식 문서를 MPW 작성 정책으로 옮긴 것이다. 직접 API 계약이며 다른 공급자·래퍼·대화 UI에 같은 값을 복사하지 않는다. [Prompting](https://developers.openai.com/api/docs/guides/prompting), [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering), [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices).

- **권한 사슬.** `instructions`와 developer 메시지의 우선순위 및 역할별 배치는 [contract.md](templates/contract.md) §메시지 역할과 배치를 따른다. 직접 API의 developer 메시지 구획 예시는 Identity → Instructions → Examples → Context이며 다른 공급자에 이식하지 않는다.
- **추론 모델.** 실제 모델에서 확인한 뒤 필요하면 developer 메시지 첫 줄의 `Formatting re-enabled`를 쓴다. 목표·제약·예시와 사고 과정에 관한 공통 작성 규칙은 §공통 적응 규칙과 2026-09-24 OpenAI 항목을 따른다.
- **프롬프트 캐시.** 고정 접두부·이력·도구 정의의 배치는 [contract.md](templates/contract.md) §메시지 역할과 배치를 따른다. 확인일 기준 GPT-5.6 이상은 최소 캐시 길이 1,024토큰, 쓰기 1.25×·읽기 0.1× 요율, implicit/explicit 모드와 요청당 최대 4개 브레이크포인트, 상위 `instructions`에는 explicit 브레이크포인트를 둘 수 없음. GPT-6 계열은 `configuration_update` 항목으로 접두부를 유지한 채 추론 강도를 바꾼다. 값은 모델·시점에 따라 달라지므로 인계 전에 현재 문서로 재확인한다. OpenAI에서는 tools 배열의 프리픽스를 고정하고 `tool_choice: none` 또는 `tool_choice`의 `allowed_tools` 모드로 호출 허용 범위만 바꿀 수 있다. [함수 호출 제어](https://developers.openai.com/api/docs/guides/function-calling) 참조.
- **프롬프트는 코드다.** 재사용 프롬프트 객체(`v1/prompts`, 프롬프트 ID·버전)는 2026-06-03부터 비권장, 2026-11-30 종료 예정이다. 새 작업은 코드 모듈·타입 있는 인자·fixture와 평가·배포 절차로 관리하고, 기존 프롬프트 ID 호출은 [이행 가이드](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object)를 따른다.
- **에이전트·코딩·프런트엔드.** 문서의 에이전트 권장은 완전 해결까지 지속·주요 단계의 도구 호출 전 설명·TODO 추적, 코딩 권장은 역할·도구 사용 예시·테스트 요구·마크다운 규약이며 [delegation.md](templates/delegation.md) §도메인별 추가 조건을 따른다. 프런트엔드 신규 앱에는 Tailwind CSS·shadcn/ui·Radix Themes, Lucide·Material Symbols·Heroicons, Motion을 권장하지만, 기존 코드베이스는 프로젝트 스택이 우선이며 [design.md](templates/design.md)의 조건을 따른다.


### 2026-09-24 — 형식 준수와 제공사별 적용 범위

실제 작성 응답의 형식 오류를 줄이기 위해 공식 문서를 대조했다. 아래는 문서 권고이며 모든 모델의 성능 보증이나 설정 변경 허가가 아니다. 공통 작성 절차는 [common.md](templates/common.md) §형식이 자주 어긋나는 요청을 따른다.

- **OpenAI:** 추론 모델에는 명확한 목표·제약과 구분자를 먼저 쓰고, 예시 없이 시작해 필요한 형식 경계에만 일치하는 예시를 추가한다. 사고 과정 공개를 요구하지 않는다. API의 `Formatting re-enabled` 안내를 모든 호스트·모델의 상용구로 넣지 않는다. [추론 모델 공식 가이드](https://developers.openai.com/api/docs/guides/reasoning-best-practices).
- **GPT-6 공유 스킬:** 공식 가이드의 행동 보정 예시는 Astra에서 관측된 것이므로 Sol·Luna에 적용할 때도 같은 작업으로 평가한다. 공유 스킬에서 Astra에 맞춘 간소화를 이유로 다른 작성 모델에 필요한 형식·보존 계약까지 지우지 않는다. 모델별 절차는 필요할 때만 붙이고 완료 조건은 유지한다. [GPT-6 가이드](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices), [공유 스킬 재검토 안내](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra).
- **Anthropic:** 원하는 출력 형태를 명시하고, 실제 과제와 닮은 다양한 예시 및 지시·입력 경계를 사용한다. 프롬프트의 서식도 답변 서식에 영향을 줄 수 있으므로 형식 예시가 출력 계약과 맞는지 확인한다. 문서의 3–5개 예시 권고를 타사 모델·단순 요청의 의무로 만들지 않는다. [공식 프롬프팅 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices).
- **Gemini:** 명확한 과제·제약, 일관된 구분자, 핵심 형식 지시의 앞쪽 배치와 긴 자료 뒤 구체 질문을 권고한다. few-shot 예시의 서식·공백·구분을 일관되게 유지하고 개수는 평가로 조정한다. 자세한 납품물이 필요하면 상세 범위를 적고, 구조화 출력의 값 정확성은 소비자에서 검사한다(두 항목은 2026-09-05 확인). 특정 모델용 날짜·지식 기준일 예시는 다른 모델에 복사하지 않는다. [공식 프롬프트 설계](https://ai.google.dev/gemini-api/docs/prompting-strategies), [구조화 출력](https://ai.google.dev/gemini-api/docs/structured-output#best-practices).
- **DeepSeek 직접 API:** JSON Output은 `response_format: {"type":"json_object"}`와 프롬프트 안 JSON 요구·형식 예시를 함께 사용하는 계약이다. 출력 토큰 부족에 따른 잘림과 문서에 명시된 빈 content 가능성을 검사한다. 이를 스키마 강제나 일반 채팅 UI 지원으로 설명하지 않는다. [JSON Output](https://api-docs.deepseek.com/guides/json_mode).

### 2026-09-25 — Claude 공식 가이드 재대조

**2026-09-25 공식 문서 확인.** [Best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), [Fable 5.1](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1), [Opus 5.5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5), [Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5). 과거 개별 페이지(XML 태그·멀티샷·긴 컨텍스트·시스템 프롬프트·prefill)는 Best practices의 절로 통합됐다. 실제 선택된 Claude 모델에 해당하는 보정만 쓰며, 응답 품질을 실측한 날짜가 아니다.

- **긴 자료는 위, 질문은 끝.** 긴 문서·입력을 질문·지시·예시보다 위에 두고 질문을 끝에 둔다. 문서마다 태그로 감싸고 출처 같은 메타데이터를 하위 태그로 둔다. 긴 문서 과제는 관련 부분을 먼저 인용하게 하면 초점이 잡힌다. 다른 공급자의 상위 지시 구획 순서를 Claude 프롬프트에 복사하지 않는다.
- **예시·서식.** 이유·대안·예시 작성의 일반 규칙은 [common.md](templates/common.md) §범용 조립 규칙이다. Claude 문서의 추가 사항만: 예시는 `<example>` 태그로 감싼다(수 권고는 2026-09-24 노트). 프롬프트의 Markdown을 줄이면 출력의 Markdown도 준다.
- **prefill 이전.** 최신 모델에 마지막 assistant 턴 prefill을 보내면 400 오류다. 형식 강제는 구조화 출력, 분류는 enum 필드를 가진 도구나 구조화 출력, 서두 생략은 "Respond directly without preamble" 같은 지시, 이어쓰기는 user 메시지로 옮긴다. Fable 5.1·Opus 5.5는 강제 tool choice도 거부하므로 `auto` + strict tool use 또는 구조화 출력으로 바꾸고 도구 적용 조건을 프롬프트에 적는다(마지막 조건은 2026-09-27 [이행 가이드](https://platform.claude.com/docs/en/models/opus-5-5/migration-guide) 확인).
- **사고 과정 출력 요구 금지.** Fable 5.1·Opus 5.5·Fable 5에서 응답 본문에 내부 추론을 쓰게 하는 지시는 `reasoning_extraction` 거절로 끝날 수 있고 서버 폴백도 재시도하지 않는다. 이행 시 "생각을 보여줘"·"단계별로 추론을 적어라"류를 지우고, 가시성은 thinking 블록 표시 설정으로 얻는다. Opus 5.5 채팅 시스템 프롬프트의 "답하기 전에 신중히 생각하라"도 제거 후보다.
- **추론량은 effort가 먼저.** Opus 5.5는 생각을 줄이려면 프롬프트보다 effort를 먼저 낮추라고 안내한다(기본 `medium`, Opus 5는 `high`). effort 이름은 모델 간 같은 양이 아니므로 모델을 바꾸면 기존 값을 옮기지 말고 평가로 다시 스윕한다. 반대로 Opus 5의 **답변 길이**는 effort로 줄지 않으므로 간결 지시를 프롬프트에 쓰고, 긴 시스템 프롬프트에는 끝부분에 짧은 리마인더를 둔다.
- **이력은 덧붙이기만.** Fable 5.1·Opus 5.5에서 이전 메시지·`system`·`tools`를 고쳐 쓰거나 이전 턴을 제자리 요약하면 이후 thinking 블록이 무효화돼 오류가 난다. 세션 중 새 지시는 대화 중 system 메시지로, 도구 변경은 전용 추가·제거 블록으로 보낸다. 무인 실행용 지속 문단처럼 시스템 프롬프트에 넣을 보강은 세션 첫 요청부터 넣는다.
- **Fable 5.1 진행 보고·병렬 호출.** 도구 연쇄 중 사용자용 업데이트가 줄어든다. 먼저 클라이언트가 진행 업데이트를 받는지 확인하고, "결과는 최종 응답에 모아라"류 억제 문구를 지운 뒤, 필요하면 언제·무엇을 보고할지 한 줄로 요구한다. 긴 에이전트 루프의 병렬 호출 지시는 도구 결과 뒤 턴 한정 system 메시지로 매 턴 새로 붙인다. 긴 비동기 작업에서 "다음엔 …하겠다"로 멈추면 공식 "Finish the whole task" 문단을 첫 문장 그대로 쓴다.
- **붙여넣은 외부 텍스트 표시.** Opus 5.5는 사용자 본인 문장과 다른 곳에서 붙여넣은 텍스트를 구분해 주면 그 안의 지시에 덜 끌려간다. 붙여넣은 블록마다 같은 짧은 무작위 id를 가진 여닫는 태그로 감싸고, 시스템 프롬프트에 그 태그의 의미를 설명한다.

### 2026-09-27 — 공식 가이드 재대조

**2026-09-27 공식 문서 확인.** 아래는 각 링크의 해당 모델·표면에 대한 작성 및 하네스 조건이다. 다른 모델의 실측 성능이나 계정 가용성을 보증하지 않는다.

- **Opus 5.5 진행 표시.** 도구 사이의 업데이트는 기본 표시에서 빈 thinking 블록으로 올 수 있다. 침묵이 보이면 프롬프트를 늘리기 전에 클라이언트의 `updates` 표시를 확인한다. 긴 턴 중 원문을 사용자에게 보내야 한다면 전송 도구를 첫 요청부터 선언한다. 사람이 지켜보는 작업에서 일정한 보고가 필요할 때는 system에 보고 시점과 형태를 적는다. 여러 도구 호출 동안 여전히 조용하면 하네스의 턴 한정 리마인더를 쓰되 반복은 두세 번에서 멈춘다. [진행 업데이트](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#user-facing-progress-updates).
- **Opus 5.5 무인 실행.** 사람이 응답하지 않는 루프에만 적용한다. 텍스트로 끝난 턴을 완료 증거로 삼지 않고, 실행자가 갱신한 할 일 목록에서 열린 항목과 막힘을 판정한다. 항목이 열려 있고 막힘이 없으면 그 항목을 짚는 짧은 user 이어하기 메시지를 보낸다. 같은 작업의 자동 이어하기는 두세 번 뒤 멈추고, 진행 중인 명령·서브에이전트 결과를 먼저 받는다. 조기 종료 유형과 허용할 종료 조건을 system에 구체적으로 적되 첫 요청부터 넣고, 사람의 확인이 필요한 행동을 우회하지 않는다. [무인 실행](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#unattended-agentic-runs).
- **Opus 5.5 추론 이행.** Opus 5에서 thinking을 끄던 통합은 `low`부터 품질과 지연을 재고, 생각 금지 규칙은 없앤다. 도구 전 발화 허용과 내부 태그 억제 같은 옛 완화 지시는 계속 필요한지 확인한다. 첫 응답 지연을 더 줄여야 할 때만 직접 답하도록 하는 공식 예시를 품질 측정과 함께 쓴다. 최상위 effort를 요청마다 바꾸면 캐시가 무효화되므로, 턴별 변경은 메시지 단위 effort 변경을 사용한다. 호출 문법은 [adapters.md](adapters.md)를 따른다. [추론과 캐시](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#calibrate-effort), [thinking-off 이행](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#prompts-written-for-thinking-disabled).
- **Opus 5 성향 보정.** 위임 하네스에는 독립적이고 큰 일만 위임한다는 기준이나 런타임 상한을 둔다. 몇 번의 도구 호출로 끝나는 일과 자기 검증은 위임 대상에서 뺀다. 앞선 발언의 정정은 코드·결론·결정에 영향이 있을 때만 짧게 보고하게 하고, 디스크 문서는 필요한 분량으로 맞춘다. 진행 서술에는 원하는 박자와 형태를 긍정적으로 적는다. Opus 5.5에는 공식 문서가 이 패턴을 출발점으로 제시하므로 같은 작업에서 확인한 뒤 쓴다. [Opus 5 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5), [Opus 5.5 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5).
- **Fable 5.1 검색·요약·편집.** 낮은 effort에서는 검색 대신 기억으로 답할 수 있다. 빠르게 바뀌는 고유명을 다룰 때만 해당 턴의 effort를 올리거나 §목적 블록의 리서치 조건을 system에 넣는다. 클라이언트측 요약에서는 §컨텍스트 운용의 보존 항목을 명시한다. 서버측 compaction에는 이미 보존 처리가 있다. 출처 요약·비교에서 인용 표시 없는 원문 재현이 나타나면, 일반적인 여러 예시 권고 대신 요청·응답·정답 이유를 갖춘 예시 하나로 간접화법과 표시된 짧은 인용을 보여 준다. 예시의 도구 표기는 실제 도구 이름을 쓴다. 변경 범위가 번지면 요청하거나 저장소 관례가 있는 경우에만 이웃 규모의 영구 테스트를 추가하고, 작은 수정은 부분 편집으로 요구한다. [검색과 요약](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1#search-triggering-at-low-effort), [인용](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1#quoting-retrieved-sources), [편집](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1#prefer-targeted-edits-over-whole-file-rewrites).
- **OpenAI 직접 API 상세도.** `text.verbosity`로 기본 답변 상세도를 정하고 프롬프트에는 필수 내용·구조·길이만 적는다. 이전 모델의 막연한 간결 지시가 여전히 도움이 되는지는 같은 사례로 확인한다. 공식 예시는 Astra 기준이다. Sol·Luna에 적용할 때는 2026-09-24 공유 스킬의 평가 단서를 따른다. 호출 문법은 [adapters.md](adapters.md)로 보내고 대화 UI·래퍼에는 설정을 복사하지 않는다. [Deployment checklist](https://developers.openai.com/api/docs/guides/deployment-checklist).
- **GPT-6 공유 스킬.** 스킬을 불러오는 developer/system 프롬프트에 사용자 명시 지시가 스킬 지침보다 우선함을 적는다. 스킬 때문에 확인 요청·중단·요청 이탈이 생길 때는 읽은 스킬 파일과 해당 지시를 짚게 한다. 문체 보정이 필요하면 결론 상투어와 요청하지 않은 대조 구문을 구체적으로 지목한다. Astra 기반 관찰을 Sol·Luna에 옮길 때는 2026-09-24 평가 단서를 따른다. [GPT-6 가이드](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices).
- **Gemini 3 직접 API 텍스트.** 샘플링 설정은 기본값을 유지하고 이전 워크플로에서 낮춰 둔 값은 제거한다. 단계별 사고 지시로 추론을 유도하던 프롬프트는 §공통 적응 규칙대로 지시를 덜어내고 `thinking_level` 설정을 인계한다. 지원값과 기본값은 인계 때 모델 문서에서 확인한다. [Gemini 3 가이드](https://ai.google.dev/gemini-api/docs/gemini-3), [프롬프트 전략](https://ai.google.dev/gemini-api/docs/prompting-strategies).
- **Opus 5.5 프런트엔드 기본값.** 방향 없는 요청에서 막연한 회피 지시만으로 기본 스타일이 사라지지 않는다. 사용자에게 필요한 디자인 방향을 정할 때는 [design.md](templates/design.md)의 구체 패턴 절차를 따르고 첫 결과에서 대체 패턴을 확인한다. [프런트엔드 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5#frontend-design-defaults).
- **도구 설명.** 정의·반환 계약의 공통 기준은 [contract.md](templates/contract.md) §도구 정의 문안이다. Anthropic의 `input_examples`는 도구의 `input_schema`를 통과해야 하며 잘못된 예시는 400 오류다. 서버 도구에는 지원되지 않고, client toolsets의 지원 범위도 구분한다. 같은 문서는 도구마다 설명을 최소 3–4문장으로 상세히 쓰도록 권고한다. OpenAI는 턴 시작 시 함수 수를 20개 미만으로 유지하는 것을 출발점으로 제안하며, 도구가 많으면 tool search로 필요한 정의를 지연 로드할 수 있다. 이는 해당 공급자 문서의 권고이며 보편 기준이 아니다. [Anthropic 도구 정의·예시](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use), [OpenAI 함수 정의](https://developers.openai.com/api/docs/guides/function-calling), [OpenAI tool search](https://developers.openai.com/api/docs/guides/tools-tool-search).
