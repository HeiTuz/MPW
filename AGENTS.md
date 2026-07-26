# AGENTS.md — 이 레포에서 일하는 에이전트 규칙

이 레포는 **MPW 스킬의 정본이자 유일한 실제 트리**다(2026-07-25 구조 전환). 하네스는 여기를 소비만 한다:

- `~/.claude/skills/MPW` — 런타임 멤버(SKILL.md·references·contracts·scripts·examples·package.json·LICENSE·README.md·AGENTS.md) 심링크
- `~/.hermes/skills/prompt-writing/MPW` — 동일

**레포 루트를 통째로 심링크하지 않는다.** `agents/`는 installer 오버레이 원본이고 설치본에는 들어간 적이 없는데, 루트를 심링크하면 호스트 인덱서가 `agents/claude/SKILL.md`·`agents/codex/SKILL.md`를 활성 스킬로 잡아 **같은 이름의 MPW가 3개**가 된다((2026-07 실측), 2026-07-25 확인). 런타임 멤버만 링크해 기존 배포 표면을 그대로 재현한다. 최상위 런타임 파일을 새로 추가하면 양쪽 링크도 추가해야 하며, 빠뜨리면 아래 §검증 루틴의 운영자 전용 doctrine 검사가 주간으로 잡는다.

편집은 여기서 한다 — 설치 경로에서 편집하지 않는다. 그게 v2.11~v2.13이 사라진 원인이었다. 공개 배포(`github:HeiTuz/MPW`)는 푸시 이후에만 유효하다.

## 하드라인 (위반 = 완료 아님)

1. **정본 단일성** — 규칙은 한 곳에서 1회 정의, 다른 파일은 참조만. 같은 규칙을 두 파일에 다시 쓰면 드리프트가 시작된다. 현재 정본 배치:
   - 조립 구조(의존 순서·축별 단일 권한·배제·체인): `references/prompt-graph.md`
   - **실행 표면(S1/S2/S3)과 길이·비율·해상도·파라미터 소관: `references/image/surfaces.md`** — 다른 파일의 사이즈·길이 문장이 이 파일과 충돌하면 이 파일이 이긴다
   - 목적축 → 모델 후보 라우팅(플랫폼 로스터 dated snapshot): `references/image/model-routing.md`
   - 네거티브 Tier 정책·철칙: `references/image/compiler.md`
   - 레인별 게이트(필수 요소·네거티브 정책): `references/image/lanes.md` §레인 게이트 카드
   - 이미지 슬롯 기본값: `references/image/lanes.md` §이미지 슬롯 기본값
   - 추론 불가 슬롯 목록: `references/templates.md` §슬롯 자동 채움
   - S1 기계 계약 값(ar·size·quality enum): **문서가 아니라 `contracts/v1/*.schema.json`**. 문서는 스키마 값을 복제하지 않는다
   - S1-legacy 벌크 jsonl 스키마: `references/image/production.md` §2
   - 영상 규칙: `references/image/lanes.md` §영상 공통 규칙
   - 계약 갱신·미러 sync 절차: `references/contracts.md`
2. **기존 강점 후퇴 금지** — 위임 계약 6요소, **길이는 어림짐작이 아니라 실측**, 산출은 한 블록, 이미지 자기완결, 게이트 필요성 테스트, 레인 게이트 카드, 축별 단일 권한. (지켜야 할 것은 *실측*이지 특정 숫자가 아니다 — 상한은 채널·타깃·계약 중 가장 좁은 것이 준다.)
2-1. **길이·비율·해상도를 보편 상수로 되돌리지 않는다.** 이들은 표면의 속성이다. "모든 프롬프트는 2000자", "size는 6종" 같은 무조건 문장을 다시 들이면 하류 스키마와 어긋난다 — 실제로 기계 계약(`ar` 5종·`size` 3종)과 문서(8종·6종)가 어긋난 채 방치된 전례가 있다.
3. **예시 라벨 = 실측** — `(N자 실측)` 라벨은 뒤따르는 ```text 블록의 실제 문자수와 정확히 일치해야 한다. 예시를 고치면 라벨을 재계산한다. "약 N자" 표기 금지.
4. **모델·엔진 주장은 스탬프와 함께** — 근거 없는 모델 능력/플래그 서술 금지. 검증된 주장엔 날짜 스탬프(예: (YYYY-MM 실측)), 스탬프 6개월 경과 시 재검증 후 갱신. 플랫폼 로스터(`model-routing.md`)는 더 짧다: 30일 이내는 그대로, 30~90일은 파라미터를 런타임 확인, 90일 초과는 목록부터 다시 뜬다. **모델이 사라졌다고 결론내기 전에 목록 페이지네이션을 끝까지 따라간다** — 2026-07-21에 이 확인을 빠뜨려 "Seedream 계열 전체 소멸"로 오판한 전례가 있다.
4-1. **파라미터를 산문 규칙으로 승격하지 않는다** — 실행자가 레버로 갖는 축(비율·해상도·품질·길이·오디오·팔레트 배열·프리셋·장르)은 어휘·철칙이 아니라 `surfaces.md` §4 소관이다. 가드너 제안이 이 축의 후보를 올려도 반려한다.
5. **런타임 고유명은 `references/adapters.md`에만** — 코어 파일(SKILL.md·templates.md·image/*)에 특정 에이전트 제품명을 다시 들이지 않는다. 모델·엔진명(gpt-image-2, Higgsfield 등)은 허용.
6. **엔진 표면 문서에 자동 반영 경로는 없다** — `references/image/{grok-imagine,seedream-character-reference-sheets,midjourney-feed-diagnosis}.md`는 엔진별 붙여넣기 문법·시트 변환·피드 진단을 담는다. 이 트리는 자동 수집기가 제자리에서 패치하는 대상이 아니다. 새 엔진 관측은 **검토된 패치 제안 → 사용자 승인 → 정본 릴리스** 경로로만 들어온다. 관측 결과를 직접 커밋하지 말고 제안으로 올린다.
6-1. **인물 동일성과 운영자 취향은 이 레포가 보유하지 않는다** — 실존 인물을 관측해 만든 얼굴 기하·identity lock, 그리고 특정 운영자의 실루엣·팔레트 기본값은 여기에 두지 않는다(초상·퍼블리시티, 그리고 취향은 보편 규칙이 아니라는 두 이유). 이 트리의 문서는 **축과 절차**를 적고 구체 토큰 세트는 각 설치가 공급한다. `references/**`는 배포 파일 목록에 글롭으로 포함되므로, 여기 넣는 순간 옵트인 게이트 없이 공개된다.

## 검증 루틴 (변경 후 필수)

```sh
python3 scripts/lint.py               # 항상 — 라벨 실측·2000자·정본 단일성·유사문자
node scripts/check_prompt.mjs --test  # references/image/ 또는 검증기 변경 시 — fixture 전수(S1-legacy·S3 소관, 표면·채널·엔진 컨텍스트 플래그 포함, S2 권위 아님)
(cd scripts && suite_rc=0; for t in test_*.py; do [ "$t" = test_adapter_master_integration.py ] && continue; echo "--- $t"; python3 -m unittest "${t%.py}" || suite_rc=1; done; test "$suite_rc" -eq 0)  # repo-local 전수, 실패 누적
```

운영자 전용 doctrine 검사는 이 레포 밖의 설치별 도구이며 공개 소비자의 필수 검증 단계가 아니다. 실행할 때는 검사기 경로를 `MPW_DOCTRINE_CHECKER`로 주입하고, exit code가 아니라 stdout이 비어 있는지를 합격 조건으로 판정한다:

```sh
doctrine_output="$(python3 "$MPW_DOCTRINE_CHECKER")" && test -z "$doctrine_output"
```

`test_adapter_master_integration.py`는 가드너·브리지와의 교차 배선을 검증한다. 이 테스트가 `setUpClass`에서 의존성 누락으로 죽으면 **통과가 아니라 무증상 실패**다 — 실제로 스킬 디렉터리 rename 이후 이 상태로 방치되어 `compiled_by` 불일치·API 드리프트 3건이 숨어 있었다(2026-07-25 수리). 스킵/에러를 green으로 읽지 않는다.

위 repo-local 루프는 이 모듈만 명시적으로 제외한다. 교차계약은 아래 네 경로를 주입한 별도 명령이 필수이며, 두 명령의 결과를 합쳐 전체 검증으로 판정한다. 루프 마지막 모듈의 성공이 앞선 실패를 덮지 않도록 실패 상태를 누적한다.

동반 레포 경로는 **환경변수로만** 주입한다(`IMAGE_REFERENCE_ADAPTER_ROOT`·`DESIGN_REFERENCE_ADAPTER_ROOT`·`HIGGSFIELD_BRIDGE_ROOT`·`PROMPT_KNOWLEDGE_ADAPTER_ROOT`). 자동 탐색은 없다 — 머신마다 다른 결과가 나오고 공개 배포물이 남의 홈 디렉터리 배치를 가정하게 되기 때문이다. 넷 중 하나라도 없으면 이 테스트는 **실패로 멈춘다**. `npm test`는 `MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION=1`을 달고 이 단계를 부르므로 동반 레포가 없는 체크아웃에서도 그린이지만, 그때 교차 배선 5건은 **돌지 않은 것**이다. 교차 계약을 실제로 검증하려면 네 경로를 주입해 직접 부른다:

```sh
IMAGE_REFERENCE_ADAPTER_ROOT=<path> DESIGN_REFERENCE_ADAPTER_ROOT=<path> HIGGSFIELD_BRIDGE_ROOT=<path> \
PROMPT_KNOWLEDGE_ADAPTER_ROOT=<path> \
  python3 scripts/test_adapter_master_integration.py
```

prompt-knowledge 가드너는 loop 모듈이 없고 스킬 스크립트가 직접 레시피를 조립한다. 계약 미러만 들고 검증에서 빠져 있던 사각지대였다(2026-07-27 편입).

검증기(`check_prompt.mjs`)와 문서 규칙이 어긋나면 어느 쪽이 맞는지 판정하고 한쪽을 고쳐 정렬한다 — 괴리를 남기는 게 최악이다(2026-07 캘리브레이션에서 헤더형 감지·조명 토큰 괴리를 이렇게 잡았다).

## 배포 게이트 — 세션 종료 전 필수

규칙·버전을 바꾼 세션은 아래를 통과해야 "배포 완료"다. 로컬 green은 배포가 아니다.

1. **롤백 폭탄 주의**: `imggen update`는 MPW를 GitHub에서 재설치한다. 푸시되지 않은 로컬 개선분은 업데이트 한 번에 통째로 구버전으로 덮인다. 2026-07-16에 v2.11~v2.13 세 릴리스분이 설치 트리에만 존재한 채 발견됐다 — 소비자 스킬의 fallback 관용 동작(가드너 사전 등) 때문에 겉으로는 멀쩡해 보여서 알아차리기 어렵다.
2. **버전 일치 확인(필수)**: 종료 전에 원격 버전이 로컬 SKILL.md/package.json과 같은지 직접 확인한다:
   ```sh
   curl -s https://raw.githubusercontent.com/HeiTuz/MPW/main/package.json | python3 -c "import json,sys; print(json.load(sys.stdin)['version'])"
   ```
   값이 다르면 미배포 상태이며 세션을 끝낼 수 없다.
3. **업스트림 절차**: 설치 트리의 편집분을 이 저장소에 반영(설치 트리 루트 `README.md`는 hermes 오버레이 산출물이므로 루트로 복사 금지, `agents/` 오버레이 본문은 canonical SKILL.md와 재동기화 + frontmatter version/canonical_source 갱신) → `npm test` exit 0 → 영어 커밋 → push → CI green 확인.

## 작업 방식

- 규칙 신설·변경 전에 해당 정본 파일을 먼저 읽는다. `SKILL.md`는 디스패치 커널 — 상세를 넣지 말고 references로 내린다(커널 비대화 금지).
- 큰 규칙 변경(레인 정책·모드 라우팅·게이트)은 반영 후 architect류 read-only 리뷰 1회를 거치고, 발견을 수정한 뒤 완료 처리한다.
- 이미지 어휘 추가는 가능하면 실측 캘리브레이션(실제 생성 대조)으로 뒷받침하고 `(YYYY-MM 실측)` 스탬프를 단다. `examples/`가 회귀 기준선이다 — 컴파일 규칙을 바꾸면 examples의 요청 3종을 재컴파일해 검증기 통과를 확인한다.
- 커밋 메시지는 영어, 변경 요지+검증 결과 포함. 관련 없는 리팩토링 금지.
