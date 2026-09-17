# 모델 플레이북 (표면층) — Capability-first

**이 요약판이 운영 정본이다.** 모델명은 공개 라우팅 어휘가 아니다. 먼저 역할 권한을 정하고, 실제 모델·프로필 선택은 런타임 어댑터 또는 사용자 환경 설정에 둔다. 여기 없는 모델 능력·API 플래그를 지어내지 않는다.

**라우팅 계약 검토: 2026-09-05.** 아래 코어는 특정 공급자 우열 주장이 아니다. 모델별 행동 차이는 맨 아래 dated compatibility note에만 두고, 이미지/영상 엔진 주장은 templates/image 계층의 dated note가 이긴다. 각 노트의 날짜로부터 6개월 이상 지났거나 해당 런타임 메이저 버전이 바뀌었으면 재검증 전까지 단정하지 않는다.

## 역할·권한 라우팅

| 역할 | 권한 | 대표 작업 | 최소 capability |
|---|---|---|---|
| `prime` / integrator | 결과 소유, 결정, 상태, 통합, 최종 검증, 완료 claim | 전체 goal, 다중 레인 통합, release 판정 | 계약에 필요한 capability; 고위험·광역 통합은 strongest-reasoning/high-risk |
| `planner` / architect | 읽기 전용 범위 파악, 옵션, 의존성, 위험, 수용 기준 설계 | 사전 조사, 경계 설계, acceptance matrix | 사실 확인은 fast/read-only; 아키텍처·고위험 판단은 strongest-reasoning/high-risk |
| `worker` / executor | 명시 목표와 acceptance가 있는 bounded slice 실행 | 파일 구현, 자료 조사, fixture 작성 | 작업에 맞는 capability; 쓰기·도구 실행은 해당 런타임의 agentic 권한으로 수행 |
| `critic` / verifier | frozen artifact와 같은 계약을 독립 검토 | code review, prompt review, release gate | 검토 범위에 맞는 capability; release·보안·광역 검토는 strongest-reasoning/high-risk |

라우팅 원칙:

1. **권한을 만족하는 가장 낮은 capability**를 쓴다. 역할은 권한이고 capability는 난이도다. 특정 역할을 특정 강도에 영구 고정하지 않는다.
2. `prime`은 상태·결정·통합·최종 claim을 소유한다. worker가 "완료"를 주장해도 prime이 같은 표면으로 검증하기 전에는 완료가 아니다.
3. `planner`와 `critic`은 기본 read-only다. 둘 다 쓰는 경우 같은 frozen artifact와 같은 계약을 보게 하고, 둘 다 돌아온 뒤 prime이 결론을 합친다.
4. `worker`는 target, scope, acceptance, non-goals가 명시된 slice만 받는다. 누락된 acceptance를 worker에게 추론시키지 않는다.
5. per-role routing이 없는 런타임은 같은 모델에 역할 헤더만 붙인다. 역할 권한은 유지하고 모델명 고정은 하지 않는다.

## 컨텍스트 운용

컨텍스트는 시스템 지시·도구 결과·제공 자료·대화 이력이 함께 만드는 현재 추론 상태다. 중간 정보 소실, 관련 없는 내용의 오염, 정보가 많아져 판단이 퍼지는 산만을 별도로 점검한다.

위임은 작업을 나누는 것뿐 아니라 서로의 불필요한 이력을 섞지 않는 컨텍스트 격리 수단이다. 도구는 기능·호출 시점·반환 형식을 계약으로 정해, 결과를 다음 판단에 바로 쓸 수 있게 한다.

작업 단위는 필요한 자료와 검증만 남겨 토큰을 쓰는 경제 단위로 자른다. 같은 결론에 필요 없는 반복 설명·도구 호출·이력 인용은 제거한다.

진행 중 새 지시는 기존 목표·완료 작업과 대조해 바뀐 조건에 반영한다. 상태 질문에 답한 뒤에는 진행하던 일을 계속하며, 명시된 취소·목표 교체는 따른다. 장기 작업의 요약에는 목표·제약·결정·완료 증거·미완료 항목을 남긴다. 진행 문구는 실제 결과에 근거하고, 최종 답변은 중간 보고를 읽지 않아도 전체 결과를 알 수 있게 쓴다. 비동기 도구·중간 지시·컨텍스트 압축 지원은 실제 런타임에서 확인한다.

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
- **지시문 길이·최종 답변 길이·추론 강도는 별개다.** 짧은 프롬프트나 답변을 위해 강도를 자동 변경하지 않는다. 기존 모델·설정을 유지하고 계약을 먼저 고친다. 설정 조정이 범위에 포함될 때만 실제 지원값으로 품질·비용·지연을 비교한다. 호출 문법은 [adapters.md](adapters.md)에서 확인한다.
- 내부 추론을 이미 하는 모델에 단계별 사고 공개·"더 깊게 생각해" 반복을 붙이지 않는다. 필요한 결론·근거·검증 결과를 요구한다.
- **모델 유형에 따라 지시의 입도를 바꾼다.** 내부 추론 모델에는 목표·성공 기준·실제 제약을 짧고 직접적으로 주고 방법은 맡기며, 기준을 충족할 때까지 반복하도록 요구한다. 추론 없이 지시를 따르는 모델에는 필요한 논리·절차·자료를 프롬프트 안에 명시한다. 같은 계열의 다른 스냅샷도 결과가 달라질 수 있으므로, 프로덕션 프롬프트는 스냅샷을 고정하고 평가 케이스로 변화를 잰다. 유형 판정은 실제 선택된 모델의 문서로 하고, 이름만으로 추정하지 않는다.
- API·시스템 프롬프트의 메시지 역할 분리·구획 순서·캐시 친화 배치·코드 관리는 [contract.md](templates/contract.md) §메시지 역할과 배치가 정본이다.
- 역할·예시·부정문은 요구를 명확히 하는 만큼만 둔다. 작성 기준은 [common.md](templates/common.md) §범용 조립 규칙, 구조화 출력·결측값은 [model.md](templates/model.md) §추출이 정본이다.

## 목적 블록 (토큰 값어치 할 때만)

아래는 선택 사전이다. 해당 분야라는 이유만으로 모든 문장을 붙이지 않는다. 결과·핵심 제약만으로 충분하면 그것으로 끝내고, 실패를 막는 조건만 추가한다. 길이 정본은 [image/surfaces.md](image/surfaces.md) §0-2다.

- 코딩: 기존 패턴·테스트·스코프 경계·무관 리팩토링 금지. 에이전트형 코딩 지시에는 역할·작업 흐름, 실제 도구 호출 예시 1개, 변경 후 테스트와 패치 적용 결과의 실제 확인(도구가 성공을 보고해도 파일로 검증), 코드·경로·식별자의 마크다운 표기 규약 중 실패를 막는 것만 넣는다. 리뷰/평가: 커버리지와 필터링 분리 — 전 이슈를 신뢰도·심각도와 함께 보고, 필터링은 다운스트림("high만 보고" 생성 지시는 recall 붕괴).
- 리서치/팩트체크: 출처 투명성·불확실성·모순 처리·시점 확인.
- Grounded/RAG: 허용 근거가 제공 자료만인지 검색까지인지 정하고, 없는 정보·상충·추론의 처리 방식을 명시한다. 자료에 없는 사실을 지식으로 메우지 않는다. 날짜가 답을 바꿀 때만 확인된 현재 시점·자료 기준일을 넣으며, 모델의 knowledge cutoff나 연도를 임의 주입하지 않는다.
- 추출: [model.md](templates/model.md) §추출의 소비자 스키마·결측 계약을 따른다.
- 에이전트: 허가된 작업 지속(요청을 하위 작업으로 분해해 전부 끝낸 뒤 턴 종료), 가능한 런타임에서의 독립 읽기 병렬화, 빈 결과 복구, 완료 증거. 도구 호출 이유 설명은 결과를 바꾸는 주요 단계에만 요구하고, 단계가 많으면 TODO·루브릭으로 진행을 추적하게 한다. 검증 범위는 실제 변경과 필수 검사에 맞추며, 통과 뒤 추가 검사는 새 실패·수정·미해결 우려가 있을 때만 한다. 긴 작업의 상태 처리는 §컨텍스트 운용을 따른다.
- 영상: 입력 모드·장면·대사·배제 조건은 [image/lanes.md](image/lanes.md) §영상 공통 규칙을 따른다. 이 파일엔 중복 서술하지 않는다.
- 슬라이드: 정본은 [slides.md](slides.md)의 아웃라인 선행 계약·컷 규칙이다. 이 파일엔 중복 서술하지 않는다. 슬라이드 이미지는 [image/lanes.md](image/lanes.md) §이미지 슬롯 기본값을 따른다.

## 호환 노트

구체 모델명·공급자명·프로필명은 실제 프롬프트 동작 차이를 보존하는 dated note에서만 쓴다. 공개 canonical routing vocabulary로 승격하지 않는다. 런타임별 설치와 역할 매핑은 [adapters.md](adapters.md)가 유일한 표면이다.

**노트를 쓰는 규칙:** 관측한 행동 차이만 적는다. 세대·버전 번호로 우열을 주장하지 않는다. 노트가 없는 모델에는 코어 규칙만 적용하고, 없는 능력·플래그를 지어내지 않는다.

### Grok 텍스트·리서치

**2026-09-07 공식 문서 확인.** 아래는 문서에 근거한 MPW 작성 정책이다. Grok Chat·xAI 직접 API·중개 서비스의 도구와 설정은 별도 계약이며, 이미지·영상 요청은 [image/grok-imagine.md](image/grok-imagine.md)로 보낸다.

- **리서치 범위를 구체화한다.** 질문·비교 축·자료 기간·필요한 근거와 출력 형태 중 결과를 가르는 것만 쓴다. 큰 조사는 첫 결과에서 부족한 축을 후속 질문으로 좁힌다. 일반 대화에 조사 절차를 덧붙이지 않는다. [공식 리서치 사용례](https://x.ai/grok/use-cases/research-synthesis), [Multi Agent prompting guide](https://docs.x.ai/developers/model-capabilities/text/multi-agent#prompting-guide).
- **검색 요청과 도구 설정을 구분한다.** Chat에는 필요한 웹·X 자료를 자연어로 요청한다. API에는 실제 연결된 `web_search`·`x_search`의 지원 필터를 사용한다. 도메인 필터와 X 계정·날짜 필터를 서로 복사하지 않으며, 검색하지 못한 부분은 미확인으로 남긴다. X 반응은 사실 확인 자료와 구분한다. [Web Search](https://docs.x.ai/developers/tools/web-search), [X Search](https://docs.x.ai/developers/tools/x-search).
- **주장별 근거를 요구한다.** 검색 중 수집된 `citations` URL 목록에는 최종 답변에 쓰지 않은 자료도 포함된다. 중요한 주장 옆의 출처와 내용 일치를 확인하고 합의·충돌·추론을 구분한다. 인라인 인용 설정만으로 인용 완비를 보장하지 않는다. [Citations](https://docs.x.ai/developers/tools/citations).
- **기계 출력은 소비자 스키마가 정한다.** 직접 API의 지원 스키마를 쓰되 필드 생략·`null`·결측을 구분한다. 자연어의 `JSON만` 지시를 구조 보장으로 표현하지 않는다. best-effort 제약과 사실 정확성은 소비자에서 검증한다. [Structured Outputs](https://docs.x.ai/developers/model-capabilities/text/structured-outputs); 결측 정책은 [model.md](templates/model.md) §추출.
- **추론 설정을 자동 이식하지 않는다.** 공통 적응 규칙대로 출력 길이와 추론을 분리한다. 직접 API에서 일반 reasoning 모델의 effort는 깊이를, Multi Agent 변형은 참여 수를 제어하므로 모델·표면을 확인한다. `깊게 생각해`·사고 과정 공개 요구나 고정 effort를 프롬프트에 덧붙이지 않는다. [Reasoning](https://docs.x.ai/developers/model-capabilities/text/reasoning).

인용이 필요한 API 인계에만 설정 차이를 확인한다: 현재 직접 Responses API는 인라인 인용 기본 활성, xAI Python SDK의 gRPC chat은 opt-in이다. 웹 UI·래퍼에 같은 설정을 복사하지 않는다. 이 절의 확인일은 문서 기준이며 계정 가용성·실제 Grok 응답 품질을 검증한 날짜가 아니다.

### 2026-09-05 — 공식 문서 대조

아래는 확인일의 공급자 지침을 MPW에 적용한 작성 정책이다. 실제 선택된 모델에 해당하는 보정만 쓴다. 계정 가용성·모델 우열·실측 성능 보증이나 공통 API 설정표가 아니다.

- **OpenAI GPT-6 Astra / GPT-5.6**: Astra에서 불필요한 확인·긴 형식·과검증이 나타나면 이미 허가된 범위의 지속, 원하는 문체, 필요한 검증 폭을 짧게 명시한다. GPT-5.6은 기존에 효과가 있던 지침·예시·도구 설명에서 중복을 한 묶음씩 덜어 같은 사례로 비교한다. 짧은 답에서도 필수 사실·근거는 보존한다. [Astra 가이드](https://developers.openai.com/api/docs/guides/latest-model#prompting-best-practices), [GPT-5.6 가이드](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-5.6#prompting-best-practices).
- **Claude Fable 5.1 / Opus 5**: Fable 5.1의 긴 도구 작업에서 진행이 보이지 않으면 먼저 런타임의 표시 경로를 확인하고, 필요한 경우 짧은 진행 보고와 전체 결과 보고를 명시한다. 과밀한 문장은 직접적인 표현·문단으로 풀되 필요한 표·목록까지 금지하지 않는다. Opus 5의 답변 길이는 추론 강도와 따로 지시하고, 모든 작업에 검증·검토자를 덧붙이던 관성은 제거한다. 요청된 검사와 완료 증거는 유지한다. [Fable 5.1 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5-1), [Opus 5 가이드](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5).
- **Gemini 3 계열**: 직접적인 과제·제약을 쓰고, 긴 자료 뒤에 질문을 둔다. 자세한 납품물이 필요하면 필요한 상세 범위를 명시한다. 문서의 특정 Flash용 날짜·cutoff 예시를 다른 모델에 복제하지 않는다. 구조화 출력도 값의 정확성은 소비자에서 검증한다. [프롬프트 전략](https://ai.google.dev/gemini-api/docs/prompting-strategies#gemini-3), [구조화 출력](https://ai.google.dev/gemini-api/docs/structured-output#best-practices).

### 2026-09-16 — OpenAI 프롬프팅·캐싱 문서 대조

아래는 확인일의 OpenAI 공식 문서를 MPW 작성 정책으로 옮긴 것이다. 직접 API 계약이며 다른 공급자·래퍼·대화 UI에 같은 값을 복사하지 않는다. [Prompting](https://developers.openai.com/api/docs/guides/prompting), [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering), [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices).

- **권한 사슬.** `instructions` 파라미터와 developer 메시지가 `input`의 user 메시지보다 우선한다. 톤·역할·규칙·정답 예시는 상위에, 과제별 세부·자료는 user에 둔다. 문서가 제시한 developer 메시지 구획 순서는 Identity → Instructions → Examples → Context이며, Context는 요청마다 달라지므로 끝에 둔다. 규칙 서술은 [contract.md](templates/contract.md) §메시지 역할과 배치.
- **추론 모델.** 짧고 직접적인 지시, 사고 과정 요구 금지, 구분자(Markdown·XML·섹션 제목) 사용, zero-shot 먼저, 제약과 최종 목표의 구체화. 문서는 추론 모델을 목표만 주면 되는 선임, 일반 GPT 모델을 명시 지시가 필요한 신입에 비유한다. API의 추론 모델이 기본으로 Markdown을 생략하는 경우 developer 메시지 첫 줄의 `Formatting re-enabled`로 다시 켠다고 안내한다 — 실제 선택 모델에서 확인 후 쓴다.
- **프롬프트 캐시.** 안정된 지시·도구 정의·참고 자료를 접두부에 두고 타임스탬프·사용자별 값은 뒤로 보낸다. 이전 턴은 덧붙이기만 하며 요약·압축·절단은 접두부를 바꿔 재사용을 끊는다. 도구는 정의·순서·스키마를 유지하고 `tool_choice: none`·`allowed_tools`로 사용 여부만 바꾼다. 확인일 기준 GPT-5.6 이상은 최소 캐시 길이 1,024토큰, 쓰기 1.25×·읽기 0.1× 요율, implicit/explicit 모드와 요청당 최대 4개 브레이크포인트, 상위 `instructions`에는 explicit 브레이크포인트를 둘 수 없음. GPT-6 계열은 `configuration_update` 항목으로 접두부를 유지한 채 추론 강도를 바꾼다. 값은 모델·시점에 따라 달라지므로 인계 전에 현재 문서로 재확인한다.
- **프롬프트는 코드다.** 재사용 프롬프트 객체(`v1/prompts`, 프롬프트 ID·버전)는 2026-06-03부터 비권장, 2026-11-30 종료 예정이다. 새 작업은 코드 모듈·타입 있는 인자·fixture와 평가·배포 절차로 관리하고, 기존 프롬프트 ID 호출은 [이행 가이드](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object)를 따른다.
- **에이전트·코딩·프런트엔드.** 문서의 에이전트 권장은 완전 해결까지 지속·주요 단계의 도구 호출 전 설명·TODO 추적, 코딩 권장은 역할·도구 사용 예시·테스트 요구·마크다운 규약이며 §목적 블록에 반영했다. 프런트엔드 신규 앱에는 Tailwind CSS·shadcn/ui·Radix Themes, Lucide·Material Symbols·Heroicons, Motion을 권장하지만, 기존 코드베이스는 프로젝트 스택이 우선이며 [design.md](templates/design.md)의 조건을 따른다.
