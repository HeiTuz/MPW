# 대량 생성 인계와 프롬프트 검증기

## 적용 범위

이 문서는 다중 컷의 제작 인계, 시리즈 운용, 텍스트 프롬프트 검증 경계를 설명한다. 이미지 표면과 파라미터는 [surfaces.md](surfaces.md), S1 기계 계약은 [계약 색인](../../contracts/manifest.json)과 `contracts/validate.py`가 정본이다. 두 계약을 혼용하지 않는다.

사용자에게 바로 전달할 네이티브 이미지 문안은 [surfaces.md](surfaces.md) §0의 우선순위로 대상 엔진·표면을 정한 뒤 그 계약을 따른다. GPT Image 기본값은 엔진이 미지정일 때만 적용하며 명시된 다른 엔진을 바꾸지 않는다. MPW 조립 형식·전문 레인·기계 레코드를 요청한 경우에만 해당 계약을 적용한다. 네이티브 문안은 API 본문이나 기계 레코드가 아니며, 프롬프트 검증은 모델 호출·파라미터·참조 전달·렌더 결과를 증명하지 않는다.

## 인계 경로

1. 요청을 표면과 산출물로 분류하고, 지시된 표면의 길이·파라미터·참조 규칙을 확인한다.
2. 생성 대상, 보존할 기준 원본, 컷별 차이를 정리한다. 독립 컷은 각각 완성 프롬프트로 둔다.
3. 프롬프트와 실행 설정을 분리한다. S1이면 프로토콜 스키마에 맞춰 컴파일하고 `python3 contracts/validate.py`로 검증한다. S2·S3이면 실제 도구에 맞는 자연어와 입력 역할을 전달한다.
4. 배치 manifest는 활성 소비자 계약에 맞춰 검증한다. 프롬프트 필드 호환, 파일 경로, 참조, 실행 소유권, QC는 각각의 소비자가 소유하며 텍스트 검증으로 대신하지 않는다.
5. 초회 샘플은 해당 소비자의 pilot/QC 경로로 확인한 뒤, 승인된 범위에서만 나머지 컷을 진행한다. 결과 파일, 매니페스트, QC 기록을 서로 연결하고 실제 확인한 상태만 보고한다.

배치 크기는 소비자가 선언한 상한을 넘기지 않는다. 프로젝트별 러너에는 작업공간 쓰기만 허용하는 샌드박스를 적용한다. 아래는 실행 에이전트에 전달하는 지시이며 이미지 모델용 프롬프트 본문에는 붙이지 않는다([surface-contracts.md](surface-contracts.md) §3.2.3).

```text
Produce one image from the preceding brief through the authorized generation surface.
Place the completed artifact at {output_path}, keeping that destination unchanged.
Return its verified local path after the save succeeds.
```

러너 보고는 확인된 파일 경로, 컷별 실패 사유, 배치의 완료 수와 실패 수를 구분한다. 파일이 실제 저장되기 전에는 성공으로 보고하지 않는다.

## 시리즈 운영

제품별 컷 구성과 색상 변형의 권한은 [product-multicut-consistency.md](product-multicut-consistency.md)를 따른다.

- 같은 조건에서 좋은 결과를 고르는 **후보 배치**와 컷별 연출이 다른 **시리즈**를 구분한다. 후보 배치는 구도·표정이 비슷해도 요청에 맞는 품질을 기준으로 고를 수 있으며, 미선택을 곧 실패로 기록하지 않는다. 여러 장을 함께 쓰고 서로 다른 장면이나 구도가 요청됐다면 그 다양성 기준으로 선별하며 시리즈 규칙을 따른다. 원본 보존 요청에 다양성을 이유로 새 연출을 넣지 않는다.
- 먼저 고정할 요소를 정한다. 제품 형상·브랜드 표기·인물 정체성·장면의 핵심 중 요청에 해당하는 것만 잠근다.
- 의도한 시리즈에는 컷마다 달라지는 축과 유지되는 축을 명시한다. 차이가 없는 독립 생성을 같은 컷의 변주라고 부르지 않는다. 머리 각도·시선·크롭을 모두 고정해 놓고 `candid`나 반복 생성만으로 큰 변주를 요구하지 않는다. 다양성이 요청됐으면 변경 가능한 축을 정하고, 고정 조건과 충돌하지 않는지 확인한다. 재작성 전후에 길이와 연출 조건이 함께 바뀌었다면 길이만을 결과 차이의 원인으로 삼지 않는다.
- 대표 컷을 확인한 뒤 나머지 컷에 적용할 변경을 좁힌다. 기준 이미지가 제공되면 이미지별 역할과 보존 대상을 함께 적는다.
- 출력 파일은 컷별 고유 경로에 둔다. 덮어쓰기, 다른 작업의 파일 재사용, 확인되지 않은 자동 재시도는 하지 않는다.
- 매니페스트·참조·설정이 바뀌면 이전 승인과 같은 작업으로 간주하지 않는다. 소비자의 재개·재시도 계약을 따른다.

## 검증기

검증기는 프롬프트 텍스트 계약만 검사한다. 호출은 `node scripts/check_prompt.mjs <프롬프트 파일>`처럼 파일을 위치 인자나 `--file <프롬프트 파일>`로 준다(둘 다 없으면 표준입력을 읽고, 인자 목록은 `--help`). 결과는 JSON이고 `ok`·`errors`·`warnings`를 보며 `ok`가 false면 종료 코드가 1이다. 자주 쓰는 인자는 `--profile native|assembled`, `--engine`, `--channel`, `--channel-limit N`이다. 컴파일된 산출물에는 `--profile assembled`, 네이티브 GPT Image 문안에는 `--profile native --engine gpt-image`를 사용한다. 층 문안을 다른 엔진 형식으로 편 문안([engine-levers.md](engine-levers.md))은 `--engine seedream`·`nano-banana`·`soul`·`midjourney`로 돌려 길이와 `coherence/*`를 본다. 프로필별 입력·플래그·길이 층은 아래 검증기 코드 표와 `node scripts/check_prompt.mjs --test` 사례를 따른다. S1 기계 산출은 이 검사기 대신 `contracts/validate.py`를 반드시 실행한다.

길이는 계약·전달 채널·대상 엔진 층 중 가장 좁은 상한으로 판정하며, 구속 층이 아니어도 계약 위반은 따로 보고한다. 채널을 지정하지 않은 S3에서는 ChatGPT 웹 입력창 기준 기본 채널 상한 10000을 가정한다. 이는 S3 자체의 상한 선언이 아니다. 상한을 모르는 메신저형 전달은 `--channel bounded`(상한 2000)로 지정한다. 상한 없는 CLI·데스크톱 전달은 `--channel unbounded`, 측정된 유한 상한은 `--channel-limit N`으로 지정한다. 기본 가정으로 실패한 경우 검증기 메시지의 전달 채널 안내를 확인한다.

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
| `input/engine-scope` | 오류, 공통 | assembled에서 midjourney. native에서 gpt-image 이외 엔진은 이 코드 없이 길이와 `coherence/*`만 본다 |
| `length/contract` | 오류, 공통 | 계약 상한 초과. 더 좁은 층이 구속해도 별도 보고 |
| `length/channel` | 오류, 공통 | 명시·기본·가정 채널 상한 초과 |
| `length/engine` | 오류, 공통 | 알려진 엔진 길이 상한 초과 |
| `length/engine-words` | 경고, 공통 | `--engine seedream`의 단어 수가 600 이상(영어 600단어 미만 권장, [surfaces.md](surfaces.md) §0-1) |
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
| `syntax/ratio-token` | 경고, 공통 | 본문 끝에 구형 비율 토큰이 붙음. native/S3의 자연어 `Aspect ratio`·`비율` 지시는 제외 |
| `phrasing/exclusion-list` | native 경고, assembled 오류 | 제외 구획 라벨 또는 부정 항목의 나열 |
| `phrasing/negation` | 경고, assembled | 영어 부정문을 원하는 결과 상태로 바꿀 수 있음 |
| `phrasing/ko-negation` | 경고, assembled | 한국어 지시형 부정문을 긍정형 결과로 바꿀 수 있음 |
| `phrasing/quality-tag` | 오류, assembled | 품질 태그 사용. native 새 이미지 문안의 Finish `8K`([fixed-lines.md](fixed-lines.md))는 보지 않는다. assembled도 `## Finish` 층 안의 첫 `8K` 하나는 보지 않고, 다른 곳의 `8K`와 둘째 `8K`는 오류다 |
| `phrasing/vague-adjective` | 경고, 공통 | 결과를 판정하기 어려운 평가형 수식어 |
| `phrasing/pick-one` | 경고, 공통 | 모델에게 선택을 넘기는 문구. 영어 `choose (exactly·only) one`·`choose one of`·`pick (exactly·only) one`·`select one of`는 문장 첫머리·콜론·대시·글머리표 뒤나 `you must` 뒤의 명령일 때만 본다(`She will choose one of the cups`·`pick one petal`은 장면 묘사). `one of the following`, `any one of these`, 한국어 `다음·아래·위·이·그 중 하나를·만`과 `하나를 고르세요·골라라`. 작성자가 값을 하나로 정해 쓰고 선택지 목록을 프롬프트에 남기지 않는다. 따옴표 안 정확 문구는 보지 않는다 |
| `phrasing/noise-trigger` | 경고, gpt-image 엔진의 assembled와 `Edit the attached`로 시작하는 편집 문안(새 이미지 native 문안은 입자·`8K`를 [fixed-lines.md](fixed-lines.md)가 정하므로 보지 않는다) | 부정·제거 구문 밖에 [surface-contracts.md](surface-contracts.md) §3.2.4 표의 어휘가 있음. 입자·매체와 과잉 세부 행 전체, 부유 입자 행의 `particles` 계열, 거친 표면 행의 `paper grain`·`canvas texture`·`rough texture`·거친 질감만 본다. 사물로도 흔히 쓰는 `sparkles`·`glitter`·`textured background`와 한국어 먼지·종이 질감은 보지 않는다. 삭제 지시가 아니라 알림 후보 |
| `portrait/skin-token` | 경고, assembled | 피부 어휘의 의도를 검토하되 요청 질감·부위·부분 수정 범위를 보존 |
| `portrait/nationality-skin` | 경고, assembled | 색의 출처를 확인하며 요청 캐릭터색을 보존; 어휘만으로 국적 추론을 단정하지 않음 |
| `portrait/glow-stack` | 경고, assembled | 광택 어휘 중첩 검토 휴리스틱이며 실패 예측이나 매트 강제 아님 |
| `portrait/skin-repeat` | 경고 | 여러 구획의 피부 질감 표현을 검토하되 서로 다른 부위·부분 수정 조건을 보존 |
| `coherence/occlusion` | 경고, 공통 | 머리가 얼굴을 가린다는 문장과 얼굴을 비워 둔다는 문장(`stay clear`, `no hair across`)이 함께 있음 |
| `coherence/focal` | 경고, 공통 | 서로 다른 렌즈 mm가 둘 이상이거나, 광각 렌즈·28mm 이하와 자연 원근(`自然透视`·`natural perspective`·무왜곡) 문장이 함께 있음. 필름 규격(`35mm film`)은 세지 않는다 |
| `coherence/identity-skin` | 경고, 공통 | `keep her own skin tone`이 있는데 Identity Reference 밖 층에 피부색 서술이 있음 |
| `coherence/ratio-dup` | 경고, 공통 | 화면비(`3:4`, `16:9` 등 알려진 값)가 둘 이상 적힘 |
| `coherence/decimal` | 오류, 공통 | 소수점이 `。`로 바뀜(`7。5`) |
| `coherence/slot-dup` | 경고, 공통 | Hair and makeup(나눈 `Makeup` 층 포함)에 입술 줄이 둘 이상이거나, 캐치라이트를 적은 줄이 둘 이상 |
| `coherence/day-night` | 경고, 공통 | 밤 단서와 `noon`·`midday`가 한 문안에 함께 있음 |
| `coherence/pose-options` | 경고, 공통 | 이름이 `Pose`·`Posture`·`포즈`·`자세`로 시작하는 층(제목 수준·대소문자 무관, `## Pose and hands` 포함)에 번호·글머리표(`1.`, `2)`, `- `, `Option A`, `Pose 1`) 줄이 둘 이상이거나, 서로 다른 자세 낱말(standing·sitting·leaning·walking·kneeling·lying 등, 한국어 서 있·앉·기대·걷·누워)이 `or`·`또는`·`혹은`·`아니면`(`;`·줄바꿈 너머 포함)으로 묶이거나, 부정 없이 세 가지 이상 나열됨. 한 자세를 부위별로 나눈 줄(weight shift·hands·turn), `either side`·`left or right hand`, `not leaning or sitting`처럼 부정으로 배제하는 줄은 보지 않는다. 자세 둘을 `or` 없이 `;`로만 나열한 줄은 놓친다 |
| `coherence/engine-layers` | 경고, 엔진 한정 | `--engine seedream·nano-banana·soul·midjourney`에서 `## 층` 제목이 둘 이상. GPT Image 층 문안을 그 엔진 모양으로 펴지 않았다([engine-levers.md](engine-levers.md) §4) |
| `coherence/engine-flag` | 경고, 엔진 한정 | `--engine seedream·nano-banana·soul`의 본문에 `--ar`·`--no`·`--oref` 같은 Midjourney 플래그나 `AR 3:4`. 호출 설정으로 옮긴다 |
| `coherence/engine-ban` | 경고, 엔진 한정 | `--engine nano-banana·soul·midjourney`에서 `never·not·no` + `illustration·anime·cartoon·3D render·CGI`. Midjourney는 `--no`, 나머지는 `a real photograph` 같은 긍정 매체로(Seedream 칸은 이 문장을 쓴다) |
| `coherence/engine-brand` | 경고, 엔진 한정 | `--engine soul`에서 Kodak·Portra·Fujifilm·Vision3 같은 필름 상표명. 필름 테두리가 그려진 실측이 있다(soul-v2-director.md 실측 법칙 3) |
| `token/slot-name` | 경고, 공통 | 층 안 `토큰 — 문장` 줄의 토큰이 `hair color`·`passersby`·`road surface`·`background`·`lighting` 같은 칸 이름. 그 대상을 부르는 이름(`黒髪ロング`, `manhole cover`, `cast shadows`)으로 쓴다([image-brief.md](image-brief.md) §12.2) |
| `mix/line` | 경고, native·gpt-image | 층 줄 문장에 원어 덩어리가 넷 이상, 원어 글자가 라틴 글자보다 많은 줄(영어 뼈대 없음), 또는 띄어 쓴 원어 구절(낱말 셋 이상)이 Expression·Style 밖에 있거나 한 줄에 둘([image-brief.md](image-brief.md) §2.1 4항) |
| `mix/amount` | 경고, native·gpt-image | 층 줄이 여덟 이상이고 문장 안 원어 덩어리 합이 줄 수의 1.5배를 넘음(줄 머리 토큰은 세지 않는다) |
| `mix/unlisted` | 경고, native·gpt-image | 사전 토큰·별칭, 룩 카드와 fixed-lines.md의 표·백틱, Identity 틀에 없는 원어. 따옴표 안 정확 문구는 보지 않고, Expression의 띄어 쓴 구절은 표정 구절 표의 한 구절을 낱말마다 담고 장면 말은 셋까지다 |
| `mix/renamed` | 경고, native·gpt-image | 줄 머리 토큰의 다른 별칭이 다른 줄에 나옴(한 물건 두 이름). 층 제목, Identity 문단, 첫 줄의 매체·룩 구절, Finish closer는 보지 않는다 |
| `mix/culture` | 경고, native·gpt-image | Finish 토큰이 정한 문화권과 다른 사진 용어 칸의 낱말(JP 장면의 `高光`, KR·CN 장면의 `白飛び`)과 KR·CN·JP 장면의 프랑스어 줄 머리. KR·CN 장면의 일본어 줄 머리(`西日`)나 JP 장면의 KR·CN 줄 머리도 같다. Finish 토큰이 없고 그림·3D 매체도 아니면 줄 머리와 문장 속 원어가 가장 많은 쪽(사전 행의 문화권, 행이 없으면 글자: 한글·한자는 KR·CN, 가나는 JP)으로 문화권을 읽고, 차이가 3 미만이면 첫 줄·Scene의 장소 낱말로 읽는다. 단서가 없으면 읽지 않는다. US·FR 토큰이면 보지 않는다 |
| `mix/thin` | 경고, native·gpt-image, 엔진 한정 | 사람이 나오는 사진 프롬프트가 거의 섞지 않았을 때: Finish 줄 머리가 문화권 행의 낱말이 아님, 새 인물 사진 문안에 `## Finish` 층이 없음(`s1`이거나 2,000자 이하로 줄인 문안, 그림·3D 매체는 제외), 줄 머리나 첫 줄에서 부른 한복·和室 같은 것의 부분 이름(사전 `부분` 행: 첫 태그가 그것인 행과 같은 층·문화권의 다른 `부분` 행)이 원어로 하나도 없음(사람 없이도 보고, 옷은 Outfit 층이 있을 때만), KR·CN·JP 행인데 줄 머리 원어가 3분의 1 미만, Optics·Camera에 사진 용어 없음, Expression에 표정 낱말 없음. US·FR 행이면 보지 않는다. `--engine seedream·midjourney·soul`의 한 문단은 줄 머리가 없어 원어 낱말이 셋 미만인 것만 본다(영어 단서에 한국·중국·일본 장면 낱말이 있는 인물 사진일 때, [engine-levers.md](engine-levers.md) §3 원어 규칙). Nano Banana는 근거가 적힌 예외라 보지 않는다 |
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
