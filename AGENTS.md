# AGENTS.md — 이 레포에서 일하는 에이전트 규칙

이 레포는 **MPW 스킬의 정본이자 유일한 실제 트리**다(2026-07-25 구조 전환). 하네스는 여기를 소비만 한다:

- `~/.claude/skills/MPW` — 런타임 멤버(SKILL.md·references·contracts·scripts·examples·package.json·LICENSE·README.md·AGENTS.md) 심링크
- `~/.hermes/skills/prompt-writing/MPW` — 동일

**레포 루트를 통째로 심링크하지 않는다.** `agents/`는 installer 오버레이 원본이고 설치본에는 들어간 적이 없는데, 루트를 심링크하면 hermes 인덱서가 `agents/claude/SKILL.md`·`agents/codex/SKILL.md`를 활성 스킬로 잡아 **같은 이름의 MPW가 3개**가 된다((2026-07 실측), 2026-07-25 확인). 런타임 멤버만 링크해 기존 배포 표면을 그대로 재현한다. 최상위 런타임 파일을 새로 추가하면 양쪽 링크도 추가해야 하며, 빠뜨리면 `~/.hermes/scripts/prompt_writing_doctrine_check.py`가 주간으로 잡는다.

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

## 검증 루틴 (변경 후 필수)

```sh
python3 scripts/lint.py               # 항상 — 라벨 실측·2000자·정본 단일성·유사문자
node scripts/check_prompt.mjs --test  # references/image/ 또는 검증기 변경 시 — 28 fixtures (S1-legacy·S3 소관, 표면·채널·엔진 컨텍스트 플래그 포함, S2 권위 아님)
cd scripts && for t in test_*.py; do python3 -m unittest "${t%.py}"; done   # 교차 스킬 계약 포함
python3 ~/.hermes/scripts/prompt_writing_doctrine_check.py                  # 표면 문서 ↔ 기계 계약 드리프트, 로스터 신선도
```

`test_adapter_master_integration.py`는 가드너·브리지와의 교차 배선을 검증한다. 이 테스트가 `setUpClass`에서 의존성 누락으로 죽으면 **통과가 아니라 무증상 실패**다 — 실제로 스킬 디렉터리 rename 이후 이 상태로 방치되어 `compiled_by` 불일치·API 드리프트 3건이 숨어 있었다(2026-07-25 수리). 스킵/에러를 green으로 읽지 않는다.

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
