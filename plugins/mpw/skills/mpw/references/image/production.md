# 대량 생성 인계와 프롬프트 검증기

## 적용 범위

이 문서는 다중 컷의 제작 인계, 시리즈 운용, 텍스트 프롬프트 검증 경계를 설명한다. 이미지 표면과 파라미터는 [surfaces.md](surfaces.md), S1 기계 계약은 [계약 색인](../../contracts/manifest.json)과 `contracts/validate.py`가 정본이다. 두 계약을 혼용하지 않는다.

사용자에게 바로 전달할 네이티브 이미지 문안은 GPT Image 2.5의 자연어 계약을 따른다. MPW 조립 형식·전문 레인·기계 레코드를 요청한 경우에만 해당 계약을 적용한다. 네이티브 문안은 API 본문이나 기계 레코드가 아니며, 프롬프트 검증은 모델 호출·파라미터·참조 전달·렌더 결과를 증명하지 않는다.

## 인계 경로

1. 요청을 표면과 산출물로 분류하고, 지시된 표면의 길이·파라미터·참조 규칙을 확인한다.
2. 생성 대상, 보존할 기준 원본, 컷별 차이를 정리한다. 독립 컷은 각각 완성 프롬프트로 둔다.
3. 프롬프트와 실행 설정을 분리한다. S1이면 프로토콜 스키마에 맞춰 컴파일하고 `python3 contracts/validate.py`로 검증한다. S2·S3이면 실제 도구에 맞는 자연어와 입력 역할을 전달한다.
4. 배치 manifest는 활성 소비자 계약에 맞춰 검증한다. 프롬프트 필드 호환, 파일 경로, 참조, 실행 소유권, QC는 각각의 소비자가 소유하며 텍스트 검증으로 대신하지 않는다.
5. 초회 샘플은 해당 소비자의 pilot/QC 경로로 확인한 뒤, 승인된 범위에서만 나머지 컷을 진행한다. 결과 파일, 매니페스트, QC 기록을 서로 연결하고 실제 확인한 상태만 보고한다.

배치 크기는 소비자가 선언한 상한을 넘기지 않는다. 프로젝트별 러너에는 작업공간 쓰기만 허용하는 샌드박스를 적용한다. 호출에 붙이는 실행 지시는 다음과 같다.

```text
Produce one image from the preceding brief through the authorized generation surface.
Place the completed artifact at {output_path}, keeping that destination unchanged.
Return its verified local path after the save succeeds.
```

러너 보고는 확인된 파일 경로, 컷별 실패 사유, 배치의 완료 수와 실패 수를 구분한다. 파일이 실제 저장되기 전에는 성공으로 보고하지 않는다.

## 시리즈 운영

제품별 컷 구성과 색상 변형의 권한은 [product-multicut-consistency.md](product-multicut-consistency.md)를 따른다.

- 먼저 고정할 요소를 정한다. 제품 형상·브랜드 표기·인물 정체성·장면의 핵심 중 요청에 해당하는 것만 잠근다.
- 각 컷에는 달라지는 축과 유지되는 축을 명시한다. 차이가 없는 독립 생성을 같은 컷의 변주라고 부르지 않는다.
- 대표 컷을 확인한 뒤 나머지 컷에 적용할 변경을 좁힌다. 기준 이미지가 제공되면 이미지별 역할과 보존 대상을 함께 적는다.
- 출력 파일은 컷별 고유 경로에 둔다. 덮어쓰기, 다른 작업의 파일 재사용, 확인되지 않은 자동 재시도는 하지 않는다.
- 매니페스트·참조·설정이 바뀌면 이전 승인과 같은 작업으로 간주하지 않는다. 소비자의 재개·재시도 계약을 따른다.

## 검증기

검증기는 프롬프트 텍스트 계약만 검사한다. 컴파일된 산출물에는 `--profile assembled`, 네이티브 GPT Image 문안에는 `--profile native --engine gpt-image`를 사용한다. 프로필별 입력·플래그·길이 층은 검증기 도움말과 테스트 계약을 따른다. S1 기계 산출은 이 검사기 대신 `contracts/validate.py`를 반드시 실행한다.

길이는 계약·전달 채널·대상 엔진 층 중 가장 좁은 상한으로 판정하며, 구속 층이 아니어도 계약 위반은 따로 보고한다. 채널을 지정하지 않은 S3에서는 보수적 기본 채널 상한 2000자를 가정한다. 이는 S3 자체의 상한 선언이 아니다. 상한 없는 CLI·데스크톱 전달은 `--channel unbounded`, 측정된 유한 상한은 `--channel-limit N`으로 지정한다. 기본 가정으로 실패한 경우 검증기 메시지의 전달 채널 안내를 확인한다.

manifest 검사는 한 행에 하나의 객체를 받는다. 필수 텍스트는 `prompt` 또는 `full_prompt`이며, 각 행의 오류를 다른 행과 독립적으로 보고한다. 오래된 매니페스트는 이 텍스트 입력 호환만 이용할 수 있다. 구 필드가 현재 계약임을 뜻하지 않는다.

검증기 통과는 실제 생성, 렌더 품질, 픽셀 보존, 시각 QC의 증거가 아니다. [텍스트 예시](../../examples/README.md)는 네이티브 프로필로 검사하며 실제 이미지를 생성한 결과가 아니다.

## 검증기 코드

아래 표는 검증기 코드의 단일 정본이다. 정확한 코드 집합 비교는 코드에 대응하는 검증기 테스트가 맡는다.

| 코드 | 심각도·프로필 | 발생 조건 |
|---|---|---|
| `input/flag` | 오류, 공통 | 알 수 없는 플래그·값·조합, 값 누락, 잘못된 수치, 중복 플래그 또는 위치 인자 |
| `input/unreadable` | 오류, 공통 | 입력 또는 매니페스트 파일 읽기 실패 |
| `input/empty` | 오류, 공통 | 빈 입력, BOM·공백만 있는 입력, 비율 토큰·색값만 있는 입력 |
| `input/structured-body` | 오류, native | JSON·JSONL·배열·API 본문 입력, 코드 펜스 포함 |
| `input/engine-scope` | 오류, 공통 | native에서 gpt-image 이외 엔진, assembled에서 midjourney |
| `length/contract` | 오류, 공통 | 계약 상한 초과. 더 좁은 층이 구속해도 별도 보고 |
| `length/channel` | 오류, 공통 | 명시·기본·가정 채널 상한 초과 |
| `length/engine` | 오류, 공통 | 알려진 엔진 길이 상한 초과 |
| `length/ungated` | 경고, 공통 | 수치 길이 상한이 적용되지 않음 |
| `copy/unquoted` | 오류, 공통 | 카피 지시가 있으나 인용된 카피가 없음 |
| `copy/repeated` | 오류, 공통 | 잠금 예외가 아닌 동일 인용 카피 반복 |
| `copy/repeated-lock` | 경고, native | 편집 보존 문맥에서 같은 카피를 재인용 |
| `copy/role-missing` | 경고, 공통 | 서로 다른 카피 둘 이상에 역할·위치 구분이 없음 |
| `copy/mixed-script` | 경고, 공통 | 하나의 카피 문자열에 한글과 라틴 문자가 혼재 |
| `copy/render-guard-missing` | 경고, 공통 | 렌더 의도에 읽기 쉬움·단일 렌더 조건이 없음 |
| `syntax/leading-meta` | 오류, 공통 | 입력 앞에 비율·픽셀·크기 메타데이터가 있음 |
| `syntax/placeholder` | 오류, 공통 | 치환되지 않은 대문자 슬롯 또는 이중 중괄호 |
| `syntax/weight` | 오류, 공통 | 어댑터 가중치 문법 |
| `syntax/foreign-flag` | 오류, 공통 | assembled의 금지 플래그 또는 native 인용 밖 플래그 |
| `syntax/section-sign` | 경고, 공통 | 지시 텍스트에 섹션 기호가 남음 |
| `syntax/ratio-token` | 경고, 공통 | 본문 끝에 비율 토큰이 붙음 |
| `phrasing/exclusion-list` | native 경고, assembled 오류 | 제외 구획 라벨 또는 부정 항목의 나열 |
| `phrasing/negation` | 경고, assembled | 영어 부정문을 원하는 결과 상태로 바꿀 수 있음 |
| `phrasing/ko-negation` | 경고, assembled | 한국어 지시형 부정문을 긍정형 결과로 바꿀 수 있음 |
| `phrasing/quality-tag` | 오류, assembled | 품질 태그 사용 |
| `phrasing/vague-adjective` | 경고, 공통 | 결과를 판정하기 어려운 평가형 수식어 |
| `portrait/skin-token` | 오류, assembled | 조합이 금지된 피부 질감 토큰 |
| `portrait/nationality-skin` | 오류, assembled | 국적·인종으로 피부색을 고정 |
| `portrait/glow-stack` | 경고, assembled | 매트 한정 없이 광택 표현이 과도하게 겹침 |
| `manifest/parse` | 오류, manifest | JSON 행 파싱 실패 |
| `manifest/not-object` | 오류, manifest | 행이 객체가 아님 |
| `manifest/empty` | 오류, manifest | 매니페스트에 행이 없음 |
| `manifest/missing-field` | 오류, manifest | id 또는 프롬프트 텍스트가 없거나 공백 |
| `manifest/duplicate-id` | 오류, manifest | 뒤 행에서 id가 중복됨 |

### 하네스 코드

아래 코드는 테스트 하네스 결과이며 검증기 코드 집합에 포함하지 않는다.

| 코드 | 발생 조건 |
|---|---|
| `harness/empty-cases` | cases가 배열이 아니거나 비어 있음 |
| `harness/unregistered-fixture` | pass/fail 폴더의 파일이 cases에 등록되지 않음 |
| `harness/uncovered-code` | 사례 기대값에 없는 검증기 코드가 있음. 커버리지 보고 전용 |
| `harness/self-check` | 하네스 비교기의 자기 점검 실패 |
