# TEAM — 멀티에이전트 킥오프

## TEAM — 멀티에이전트 킥오프

**필수 코어**: 목표, 범위·비목표, 레인, 검증, 산출물. **조건부 확장**: 컨텍스트·경계·상세자료는 워커 판정을 바꿀 때만 넣는다. 같은 acceptance를 공유하는 구현과 검증은 같은 레인에 둔다.

```text
목표: <구체적 결과 하나>
범위: <대상> / 비목표: <명시적 제외>
작업 방식: <독립 검증 표면별 레인과 조율 규칙>
검증: <명령·시나리오·증거>
산출물: <파일·패치·보고서>
```

채워진 예시 (255자 실측):

```text
목표: acme-web 초기 로드 p95 를 3.2s에서 1.5s 이하로 내리는 패치 완성.
범위: ~/src/acme-web 로컬 브랜치 / 비목표: 디자인 변경, 백엔드 수정.
작업 방식: prime이 병목 인벤토리 확정 후 번들·폰트 레인을 분배하고, 같은 acceptance의 구현+검증은 한 레인에 둔다.
검증: scripts/perf.sh 3회 중앙값 p95 ≤ 1.5s, npm test 전체 통과.
산출물: 로컬 브랜치 + 수치 비교 보고서.
```

### TEAM 역할·분해

역할·capability·분해·join·blocker·증거 규칙의 정본은 [model-playbooks.md](../model-playbooks.md)다. 아래는 TEAM 골격의 `작업 방식` 필드에 넣는 압축 블록이며, 호출 접두어와 실제 모델 선택은 [adapters.md](../adapters.md)에서 채운다.

```text
작업 방식: prime이 최상위 결과 목록과 acceptance를 확정한 뒤, 검증 표면이 독립적인 slice만 worker에 배정한다. 같은 acceptance를 공유하는 구현+테스트는 한 레인에 둔다. worker는 target/scope/non-goals/acceptance 안에서 실행하고, prime은 실제 배정한 레인과 요청된 검토 결과를 받은 뒤 최종 frozen artifact를 통합 검증한다. human-only blocker만 질문한다.
```
