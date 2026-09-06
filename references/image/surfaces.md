# 실행 표면 계약 (S1·S2·S3) — IMAGE·COMPOSITE·영상 공통 선행 판정

**이 파일이 길이·비율·해상도·품질·파라미터 소관의 정본이다.** 다른 파일의 사이즈·길이 문장이 이 파일과 충돌하면 이 파일이 이긴다.

프롬프트를 쓰기 전에 **어느 표면으로 나가는지**부터 정한다. 같은 모델이라도 표면이 다르면 계약이 다르다. 예: `gpt-image-2`는 기계 핸드오프(S1)에서 픽셀 `size` 필드를 갖고, Higgsfield MCP(S2)에서는 픽셀 개념 없이 `aspect_ratio` + `resolution` 티어를 갖는다. 표면을 정하지 않고 쓴 규칙은 둘 다 틀린다.

## 0. 표면 판정 — 한 줄 질문

| 질문 | 답 | 표면 |
|---|---|---|
| 산출물이 PromptBundle·ImageProductionHandoff 등 명시된 공유 스키마 계약으로 넘어가나? | 예 | **S1 기계 핸드오프** |
| 실행기가 모델 id와 파라미터를 받는 직접 API·플랫폼 API/MCP인가? | 예 | **S2 API·플랫폼 파라미터** |
| 사람이 웹/앱 입력창에 직접 붙여넣나? | 예 | **S3 붙여넣기 UI** |

JSON 형식 자체가 S1을 뜻하지 않는다. 플랫폼 호출 인자를 JSON으로 쓰는 요청은 S2다. 미지정이면 S3로 가정하고, 결과에 영향을 주는 가정만 짧게 알린다. 표면이 바뀌면 필드·길이·참조 전달을 다시 검증한다.

**표면을 정했으면 질문이 하나 더 남는다 — 이 산출물이 사용자에게 나가는 전달 채널은 무엇인가.**

| 질문 | 답 | 결과 |
|---|---|---|
| 산출물이 메시지당 문자 상한이 있는 채널로 나가나? | 예 | 표면 계약 **위에** 채널 상한이 겹친다 → §0-1 |
| 상한 없는 채널(에이전트 CLI·데스크톱 앱)로 나가나? | 예 | 표면·엔진 계약만 남는다 |

**어디에 붙여넣는가와 어느 엔진이 받는가는 다른 축이다.** 같은 미드저니 프롬프트라도 상한 있는 메신저로 보내면 채널이 먼저 끊고, 같은 채널이라도 타깃이 바뀌면 엔진 상한이 바뀐다. 두 축을 하나로 뭉치면 둘 다 틀린다.

## 0-1. 길이 — 세 층에서 오고 가장 좁은 것이 이긴다

**전역 2000자 하드라인은 없다.** 길이 상한은 서로 독립인 세 층에서 오고, **가장 좁은 것이 구속한다.** 어느 층도 다른 층을 대체하지 않는다.

| 층 | 무엇이 정하나 | 값 |
|---|---|---|
| **전달 채널** | 산출물이 사용자에게 실제로 나가는 경로 | 메시지당 상한이 있는 메신저형 채널 = 그 채널의 상한(현행 메신저 배선 2000) / 에이전트 CLI·데스크톱 앱 = 실질 제약 없음 |
| **타깃 엔진** | 프롬프트를 실제로 읽는 모델 | Midjourney = 짧고 명확한 서술 권장, 공식 단어수 경계 미제시 / gpt-image 계열 = 32,000자 / BytePlus ModelArk direct Seedream 5 Pro = 영어 600단어 미만 권장 / BytePlus ModelArk direct Seedance 2.0 = 1,000단어 미만 권장 / Higgsfield 모델 = 미공개 **[미확인]** → 신호 밀도로 관리 |
| **기계 계약** | 스키마 필드 제약 | `prompt-bundle/v1` `text.maxLength: 2000` + `unicode_char_count ≤ 2000` |

32,000자를 받는 엔진이라도 상한 있는 채널로 나가면 채널이 먼저 끊고, 채널이 무제한이라도 `prompt-bundle/v1`로 직렬화하면 스키마가 하드라인이다. 상한은 채워야 할 목표 분량이 아니다.

**미드저니의 간결성은 단어 수로 관찰하되, 단어 수만으로 합격·실패를 정하지 않는다.** 공식 가이드는 짧고 명확한 묘사와 중요한 세부의 명시를 함께 권한다. 이전의 40/60/80단어 경계에는 공식 근거가 없어 사용하지 않는다. 문자 상한이 있는 채널·계약은 별도로 실측한다. 출처와 확인일은 §7이 정본이다.

전달 채널의 구체적 런타임 이름과 채널별 상한 값은 코어 파일이 아니라 [../adapters.md](../adapters.md) 소관이다 — 여기서는 "채널 상한이 있는가, 그래서 그것이 가장 좁은가"만 판정한다. 값이 필요하면 문서가 아니라 그 런타임에서 읽는다.

## 0-2. 기본 분량 — 가장 짧은 완결본

모든 모드에서 **필수 요구를 빠짐없이 전달하는 짧은 초안**부터 쓴다. 이는 MPW의 작성 정책이며 모델의 입력 한도나 성능 보증이 아니다. 최소 글자수·단어수·섹션별 할당량은 없다.

| 요청 | 기본 형태 | 늘리는 조건 |
|---|---|---|
| 일반 작업·업무 | 짧은 자연어 문장으로 결과·입력·핵심 조건 | 여러 산출물, 접근 자료, 검증·권한 경계가 실제로 필요할 때 |
| 단일 이미지 생성 | 한 문단에 피사체·행동/구도·결정적인 시각 조건 | 정확 카피, 다중 패널의 관계, 전문 레인의 명시 계약이 있을 때 |
| 기존 이미지 편집 | 바꿀 부분·보존할 부분·출력 조건 | 대상 구분이나 편집 영역이 모호할 때 |

작성 뒤 각 문장을 지워도 목표·범위·정확 문구·수량·보존 조건·완료 판정이 같은지 본다. 같으면 지우고, 달라지면 남긴다. 장황한 역할 설정·절차 중계·품질 형용사·반복 금지문부터 줄인다. 단어를 쉼표로 과밀하게 쌓거나 의미를 흐리는 축약어로 압축하지 않는다.

**프롬프트 길이와 산출물 분량은 별개다.** 상세 보고서·긴 원문·정확 스키마·독립 컷별 계약이 필요한 요청은 그 요구를 유지한다. 사용자가 충분한 디테일을 줬으면 보존하고, 짧게 만들려고 요구를 삭제하거나 긴 입력을 요약본으로 대체하지 않는다. 실패를 확인한 뒤에는 실패 축만 보강하며 매번 전체 지시를 늘리지 않는다.

## 1. S1 — 기계 핸드오프 (MPW → ImgGen2 계약 경로)

**정본은 문서가 아니라 스키마다.** `contracts/v1/production-adapter-options.schema.json`, `contracts/v1/imggen2-production-record.schema.json`이 유일한 권위이며, 이 파일은 스키마 값을 복제하지 않는다. 값이 궁금하면 스키마를 읽는다.

- 허용 `ar`·`size`·`quality`·`output_format`은 **스키마 enum이 전부**다. 문서 어딘가에서 본 비율·픽셀값이 스키마에 없으면 그 값은 쓸 수 없다.
- `ar`↔`size` 매핑은 `contracts/validate.py`의 `GEOMETRY` 표가 판정한다. 불일치는 `production_geometry_mismatch`로 거부된다.
- 길이 계약: 스키마 필드 제약이 하드라인이다. `prompt-bundle/v1`의 블록은 `text.maxLength: 2000` + `unicode_char_count ≤ 2000`을 **계약으로** 갖는다(2026-07-25 스키마 직접 확인) — 같은 숫자지만 근거가 붙여넣기 UX가 아니라 스키마라는 점이 다르다. 다른 필드의 상한(경로 500 등)도 스키마가 정한다.
- 컴파일 전 `python3 contracts/validate.py`로 실제 검증한다. 문서 대조로 갈음하지 않는다.

**금지:** 스키마에 없는 비율·픽셀·품질값을 "문서에 있으니 된다"고 산출하는 것. 스키마 enum 밖 값은 컴파일 실패로 처리한다.

## 2. S2 — API·플랫폼 파라미터 (직접 API·Higgsfield MCP 등)

**모델 정의로 지원 범위를 확인하고, 실제 호출 도구의 스키마로 전송 형식을 정한다.** 모델 후보 선택은 [model-routing.md](model-routing.md)를 따르고, `parameters` / `aspect_ratios` / 미디어 지원을 런타임에서 확인한다.

- **런타임 확인이 문서보다 우선한다.** 현재 모델 상세 조회가 반환한 파라미터가 정본이다. Higgsfield는 현재 `models_list`·`models_get`을 제공하며 이전 도구 이름을 고정하지 않는다. [model-routing.md](model-routing.md)의 스냅샷은 후보를 좁히는 용도다.
- **해상도 필드를 지어내지 않는다.** 모델별 `resolution`·`quality` 티어나 선언된 픽셀 필드를 쓴다. `gpt_image_2`의 티어에 S1의 `size` 값을 이식하지 않는다.
- **픽셀 필드도 모델별이다.** 현재 `seedream_v5_pro`와 `marketing_studio_video`에는 `width`/`height`, `clipify`에는 `max_height`, `autosprite`에는 `frame_size`가 있다(2026-09-05 런타임 확인). 필요한 축이 선언돼 있으면 그 필드를 쓰고, 없으면 만들지 않는다. 숫자 범위와 조합은 현재 정의로 확인한다.
- **비율은 모델별로 다르다.** 같은 `4:5`도 어떤 모델엔 있고 어떤 모델엔 없다. 모델의 `aspect_ratios` 배열 밖 값을 쓰지 않으며, `auto`가 배열에 있으면 유효한 선택지다(전역 `auto` 금지 규칙은 S1 한정이다).
- **`aspect_ratios`가 빈 배열이면 일반 `aspect_ratio` 값을 지어내지 않는다.** `clipify`의 `clip_aspect`처럼 별도 필드가 있는지 확인하고, 없으면 입력 이미지·모델 기본값을 따른다. 요청 비율을 충족할 수 없을 때만 지원 모델·후처리 등 필요한 대안을 검토한다.
- **레퍼런스는 실제 호출 도구가 허용하는 롤로 전달한다.** 현재 Higgsfield 호출 스키마는 `image`·`start_image`·`end_image`·`video`·`audio`·`ref_element`를 받고 모델별 백엔드 롤로 매핑한다. 카탈로그의 `image_references` 등을 호출 enum에 그대로 복사하지 않는다. 입력별 역할·핵심 보존 조건은 짧게 쓰되 보이는 외형 전체를 반복하지 않는다.
- **필드별 유효성과 조합의 유효성을 구분한다.** 모델·입력 모드·참조 롤·장수·길이·해상도의 조합을 현재 스키마와 공식 모드 제한으로 확인한다. 시작 프레임과 정체성 참조가 각각 지원돼도 함께 쓸 수 있다고 가정하지 않는다.
- **길이: 이 표면 자체는 상한을 계약으로 갖지 않는다. 그렇다고 무제한이라는 뜻은 아니다** — §0-1의 나머지 두 층이 그대로 살아 있다. 타깃 모델의 상한(Higgsfield 모델은 미공개 **[미확인]** — 근거·확인일은 §7)과 전달 채널 상한 중 좁은 쪽이 구속하고, 둘 다 넉넉하면 그때 신호 밀도로 관리한다. "S2니까 길이 제한 없음"으로 끝내지 않는다.
- **비용·보정 확인은 읽기 전용 도구로 한다.** 현재 Higgsfield의 `estimate_image_cost`·`estimate_video_cost`에서 `adjustments`를 확인한다. `generate_image`·`generate_video`는 작업을 제출하므로 과거 `get_cost:true` 방식을 재사용하지 않는다. 비용 조회 성공은 생성 결과 검증이 아니다.

## 3. S3 — 붙여넣기 UI (사람이 직접 입력창에 붙여넣음)

사용자가 UI 설정·참조 입력과 본문을 함께 사용한다. UI가 담당하는 값까지 프롬프트에 몰아넣지 않는다.

- **길이는 §0-1의 실제 상한으로 잰다. S3라서 자동으로 2000자인 것이 아니다.** 상한이 있거나 길이를 표시할 때는 공백 포함 문자 수를 실측한다. 숫자를 어림잡아 쓰지 않는다.
- **Midjourney는 단어 수로 간결성을 살핀다.** 전달 채널에 문자 상한이 있으면 문자 수도 별도로 검증한다. 단어 수가 문자 상한 검증을 대체하지 않는다.
- 경로 참조 금지, 자기완결. 초과하면 장식 → 중복 → 방법 설명 순으로 줄인다. 필수 조건을 보존해도 넘으면 전달 경로·제약 조정을 확인한다. 요청된 한 컷을 길이 때문에 임의로 나누지 않는다.
- UI에서 고르는 값(비율·프리셋·품질·길이)은 프롬프트 본문이 아니라 **별도 라벨 한 줄**로 전달한다. 실제 설정이 없는 대화형 도구에서 자연어 요청을 지원하는 축은 본문에 남긴다(예: 아래 §4.2 Grok 대화형 이미지 도구).

### 3.1 네이티브 프롬프트와 MPW 컴파일 형식

모델이 받는 자연어와 MPW의 A/B·Tier·벌크 레코드는 별도 계약이다. 일반 GPT Image 편집에 `Scene/Camera/...`, 고정 네거티브 꼬리, 끝 `AR`를 새로 붙이지 않는다. 사용자가 MPW 컴파일 형식·전문 레인·기계 레코드를 지정한 경우에만 그 형식을 적용한다.

`check_prompt.mjs`의 기본 `compiled` 프로필은 기존 MPW 형식용이다. **직접 GPT Image API·UI의 네이티브 자연어**에는 `--profile native --engine gpt-image`와 실제 `--surface`·`--channel`을 명시한다. 네이티브 검사는 영어 부정형 편집 제약을 허용하고 끝 AR를 요구하지 않는다. JSONL·명시 Tier 계약을 우회하는 옵션이 아니며 API 필드, 참조 전달, 픽셀 보존, 생성 품질을 검증하지 않는다. Higgsfield 래퍼의 길이·요청 계약을 대신하지 않으며 S2 전체 요청은 현재 도구·API 스키마로 별도 확인한다.

## 4. 파라미터 우선 규칙 (S1·S2 공통)

**파라미터로 표현되는 축은 산문에 중복 기술하지 않는다.** 파라미터와 산문이 어긋나면 결과가 흔들린다. 설정과 지시문을 구분하는 원칙은 [../model-playbooks.md](../model-playbooks.md) §공통 적응 규칙과 같다.

| 축 | 파라미터가 있으면 | 산문에는 |
|---|---|---|
| 비율 | `aspect_ratio` / `ar` | 쓰지 않는다. MPW 컴파일 S3만 끝 `AR x:y`, 설정이 있는 네이티브 UI는 별도 설정 |
| 해상도·품질 | `resolution` / `quality` / `mode` | 쓰지 않는다 |
| 팔레트 | 실제 지원하는 색상·팔레트 필드 또는 UI 색상 입력 | 같은 색값은 중복하지 않고, 입력이 표현하지 못하는 적용 대상·역할만 보완. 아래 색상 계약 참조 |
| 영상 길이 | `duration` (모델별 **열거값 또는 범위**) | 쓰지 않는다. 임의 초 지정 금지 |
| 오디오 | `generate_audio` / `sound` | 대사·SFX **내용**만. on/off는 파라미터 |
| 장르 톤 | `genre` — **enum이 모델마다 다르다.** 값을 쓰기 전에 그 모델의 옵션을 런타임 확인한다 | 장르 라벨 대신 화면 결과만 |
| 속도 효과 | `speedramp` / `slow_motion` | 쓰지 않는다 |
| 멀티샷 | `multi_shots` + `multi_prompt` | 샷 경계를 산문으로 흉내내지 않는다 |
| 프롬프트 준수 | `cfg_scale` | "지시를 정확히 따르라" 같은 메타 지시 금지 |
| 시작·끝 프레임 | `start_image` / `end_image` 롤 | 입력 역할·핵심 보존 조건과 움직임만. 외형 전체를 반복하지 않는다 |
| 프리셋 | `preset_id` (**image-to-video 전용**) | 프리셋 이름을 본문에 쓰지 않는다 |
| 스타일·브랜드킷 | `style_id` / `brand_kit_id` / `product_ids` | 로고·색 규격을 본문에 복제하지 않는다 |
| 네거티브·배제 | 실제 지원하는 필드·인라인 문법·자연어 제약으로 구분 | 아래 3분기 |

**한 블록은 한 입력 문자열을 뜻하지 않는다.** API 요청이면 `prompt`와 별도 제약 필드를 같은 JSON 객체에 담는다. UI가 두 입력란을 제공하면 한 블록 안에서 입력란을 구분한다. 필드명과 제외 명사 목록을 양성 프롬프트 본문에 섞지 않는다.

| 엔진의 네거티브 형태 | 산출 |
|---|---|
| **인라인 문법이 있다** (Midjourney `--no`) | 블록 안 프롬프트 문자열에 그대로 둔다. `--no`는 단일 명사만 쉼표로 — 모더레이션이 단어를 독립적으로 읽어 다어절 구를 오탐한다 |
| **별도 필드가 있다** (예: 직접 Veo API의 `negativePrompt`, `tripo_3d`의 `negative_prompt`) | 해당 필드로 보낸다. 필드명·명사 목록 문법은 실제 엔진 계약을 따른다 |
| **별도 필드가 없다** (현재 Higgsfield 이미지·영상 모델, GPT Image) | 원하는 결과 상태를 우선 서술한다. 지시 기반 모델에서는 변경 범위·보존·추가 금지 같은 짧은 자연어 제약도 쓴다. 제외할 명사만 본문에 나열하지 않는다 |

필드가 없다는 것은 **자연어 부정문을 이해하지 못한다는 뜻이 아니다.** GPT Image 공식 가이드는 바꿀 부분과 보존할 부분, 추가 금지를 직접 명시한다. MPW의 `compiled` 프로필과 명시된 Tier-0/1/2 계약은 [compiler.md](compiler.md) §2대로 유지하고, 이를 모든 네이티브 모델의 문법으로 일반화하지 않는다. 근거·확인일은 §7에 있다.

**산문이 소유하는 것:** 장면·피사체·행동·공간, 조명의 방향과 화면 결과, 카메라 시점·거리, 질감·소재, 렌더될 정확 카피, 실패 조건.

**반례 처리:** 파라미터를 넣었는데 결과가 무시하면, 산문을 덧붙이기 전에 ① 파라미터가 그 모델에 실제로 존재하는지 ② 값이 허용 enum 안인지를 먼저 확인한다. 둘 다 통과했는데도 무시되면 그때만 산문 1회 보강을 허용하고, 그 사실을 dated note로 남긴다.

### 4.1 색상 계약 — HEX·팔레트 입력·참조 색감

**색이 결과를 가르는 작업에는 HEX를 적극 활용한다.** 브랜드 색·포스터 배색·제품 컬러웨이·시리즈 팔레트가 대표적이다. 짧은 프롬프트에서도 필요한 색 코드는 남긴다. 색 개수나 비율을 채우기 위해 새 색을 추가하지 않으며, 원본 제품색 보존 요청을 임의 재색칠로 바꾸지 않는다.

- **본문 HEX:** 색마다 적용 대상과 역할을 연결한다. 예: `배경은 따뜻한 크림 #F5F1E8, 제목은 버건디 #722F37`. 코드만 나열하거나 화면 전체의 컬러 그레이드와 특정 물체의 고유색을 혼동하지 않는다. FLUX.2의 본문 HEX 지원은 §7의 공식 가이드로 확인되지만, 다른 모델의 반영 정도는 해당 표면의 문서·관측으로 판정한다.
- **전용 색상 입력:** 현재 도구·UI가 같은 색을 지정할 수 있으면 그 입력을 사용한다. 전역 팔레트가 물체별 배정을 표현하지 못하면 본문에 배경·의상·강조색의 역할만 보완한다. 웹 기능에서 API 필드명을 추측하지 않는다.
- **Soul HEX:** 공식적으로 확인한 것은 Soul 2.0·Soul Cinema 웹의 `Color Transfer`에서 참조 이미지의 대표 팔레트를 가져오거나 기본 팔레트를 고르는 기능이다. 본문 HEX 해석이나 임의 코드 직접 입력을 지원한다는 근거로 쓰지 않는다. 색 추출 알고리즘·색별 면적비·물체별 배정 규칙은 확인되지 않았다. 참조 색감과 본문 색 지시가 충돌하면 사용자 지정 색을 우선해 참조를 조정한다.
- **색 정확도:** 팔레트 유도와 출력 픽셀의 정확한 RGB 일치를 구분한다. 정확한 납품 색이 필요할 때만 최종 파일의 지정 영역·색 공간에서 확인한다. 조명과 재질 때문에 생긴 명암을 일괄 색 불일치로 판정하지 않는다.

### 4.2 Grok — 표면과 입력 모드

**2026-09-07 공식 문서 확인.** Grok Chat, Imagine UI, 직접 API, Higgsfield 같은 래퍼를 구분한다. 아래 직접 API 값은 해당 표면의 문서 스냅샷이며 다른 표면에 상속하지 않는다. 계정별 가용성·영상 모드별 허용 길이와 해상도는 선택한 모델에서 확인한다.

| 표면 | 설정·프롬프트 계약 |
|---|---|
| Imagine UI(S3) | 현재 화면에 있는 비율·품질·길이 설정은 본문 밖에 둔다. UI 모드 이름을 직접 API 모델 ID로 추측하지 않는다 |
| 대화형 `image_generation` 도구 | 도구에 크기·형식 파라미터가 없으므로 필요한 비율은 `세로 9:16`처럼 **대화 요청 본문에** 쓴다. 정확한 prompt 문자열·해상도 제어가 필요하면 직접 이미지 엔드포인트가 맞는지 판단한다 |
| 직접 이미지 API(S2) | `aspect_ratio`·`resolution`·`quality`·`n`은 설정으로 분리. 현재 `grok-imagine-image-2.0`의 해상도는 `1k`/`2k`, quality는 `low`/`medium`/`auto`. quality 기본 `auto`는 생성에 `low`, 편집에 `medium`을 사용하므로 중요할 때만 지원값을 명시한다. 다른 모델에 `quality`를 복사하지 않는다 |
| 직접 영상 API(S2) | 생성·이미지 시작·참조·편집·연장 중 실제 입력 모드를 먼저 정한다. `duration`·비율·해상도는 해당 모드가 받는 설정만 사용한다 |
| Higgsfield·기타 래퍼(S2) | 그 래퍼의 모델 ID·미디어 역할·파라미터가 권한자다. 직접 API ID·음성 태그·품질값을 그대로 복사하지 않는다 |

직접 API의 입력 계약:

- **이미지 편집:** 한 이미지 또는 여러 입력을 실제로 연결한다. 다중 편집은 최대 5개이며 기본 출력 비율은 첫 입력을 따른다. 기하 보존 편집은 기준 이미지와 요청 비율을 일치시킨다. 직접 편집은 JSON 요청이며, multipart를 보내는 OpenAI SDK의 `images.edit()` 호출을 그대로 쓰지 않는다.
- **이어쓰기:** 직접 편집은 직전 결과를 다음 입력으로 전달한다. 대화형 도구는 이전 응답·이미지 항목이 유지된 대화 상태를 이어야 한다. 텍스트의 `직전 결과`가 이미지 전달이나 상태 연결을 대신하지 않는다.
- **영상 입력:** image-to-video는 시작 프레임, reference-to-video는 첫 프레임을 고정하지 않는 시각·음성 참조다. `image`와 `reference_images`를 한 요청에 함께 넣지 않는다. 첫·끝 프레임 지원을 참조 모드에서 임의로 만들어내지 않는다.
- **영상 편집·연장:** 편집 출력의 길이·비율은 입력에서 이어받고 해상도는 최대 720p이며, 생성용 설정으로 덮어쓰지 않는다. 연장의 `duration`은 전체 길이가 아니라 **추가 구간** 길이다.
- **참조 음성:** 현재 `grok-imagine-video-1.5`의 `reference_audios`는 프리셋 `voice_id`를 받는다. 임의 녹음 파일을 일반 계정의 음성 참조로 인계하지 않는다. 자체 음성 파일은 별도 제공 대상이다. 화자·대사와 실제 연결된 음성의 역할을 함께 정한다.
- **영상 참조 태그:** 공식 본문의 이미지 태그 시작 번호와 예제가 서로 달라 시작 인덱스는 **[미확인]**이다. 프롬프트 작성에서는 역할을 명확히 하고, API 인계가 필요할 때 선택 표면의 실제 매핑을 확인한다. 문서 예시의 번호를 추측해 연결하지 않는다.

Grok 전용 공통 prompt 문자 상한·최적 단어수는 확인한 가이드에 제시되지 않았다 **[미확인]**. §0-1의 실제 채널·기계 계약 상한을 적용하고, 알려지지 않은 숫자를 강제하지 않는다. 자연어 작성은 [grok-imagine.md](grok-imagine.md), 근거는 §7을 따른다.

## 5. 네이티브 출력과 후처리

원하는 출력을 선택한 모델·표면이 직접 지원하면 그 기능을 쓴다. 지원하지 않는 경우에 배경 제거·아웃페인트·업스케일·리프레임·립싱크를 **후속 단계로 명시**한다.

| 필요 | 처리 |
|---|---|
| 투명 배경 / 컷아웃 | 직접 투명 출력을 지원하면 해당 배경·파일 형식을 지정한다. 지원하지 않는 경로만 단색 배경 생성 → `remove_background`로 이어간다 |
| 캔버스 확장 | `outpaint` |
| 해상도 상향 | `topaz_image` / `bytedance_image_upscale` (영상은 `topaz_video` / `bytedance_video_upscale`) |
| 영상 비율 변경 | `reframe` |
| 벡터·SVG 계열 자산 | 후처리가 아니라 **모델 선택** — `recraft_v4_1` `model_type: vector` |

텍스트 렌더와 사용자 요청에 따른 후속 조판의 경계는 [compiler.md](compiler.md) 철칙 9를 따른다. 후속 조판을 포함한 요청은 정확 카피·폰트·위치·편집 가능 형식과 배경 이미지를 함께 인계하고, 생성된 결과와 합성된 결과를 구분한다.

**OpenAI 직접 API (2026-09-05 확인):** `gpt-image-2`의 투명 배경은 preview이며 `background: transparent`와 PNG/WebP를 함께 쓴다. JPEG는 투명 출력에 쓰지 않는다. `input_fidelity`는 자동 high이므로 보내지 않는다. 마스크는 편집 가이드이며 경계 밖 픽셀의 바이트 보존을 보장하지 않는다. API 설명과 Cookbook 예제의 인자가 다르면 현재 API 정의를 우선한다. **Higgsfield의 `gpt_image_2`는 별도 표면**이며 현재 모델 상세에는 `background`·`input_fidelity`가 없으므로 이 인자를 복사하지 않는다. S1도 스키마에 없는 필드를 추가하지 않는다.

## 6. 표면별 체크

- [ ] S1: 값이 전부 `contracts/v1` 스키마 enum 안이고 `validate.py`를 실제로 통과했다
- [ ] S2: 모델 id·입력 모드를 골랐고, 쓴 파라미터·비율·미디어 롤의 조합이 지원된다
- [ ] S3: **그 경로의 예산**을 실측으로 통과(채널 배선이 상한을 주면 그 값, 아니면 타깃 엔진 단위), 자기완결, 경로 참조 0개
- [ ] 길이를 채널·타깃 엔진·기계 계약 **세 층 중 가장 좁은 것**으로 쟀다. 미드저니 타깃이면 `wc -w` 단어 수로 쟀다
- [ ] 배제 조건이 실제 입력 형식에 맞는다 — 인라인 문법 / 별도 필드 / 원하는 상태와 짧은 자연어 제약
- [ ] S1·S2: 파라미터로 되는 축이 산문에 중복되지 않았고 별도 제외 목록이 본문에 섞이지 않았다
- [ ] 후처리 필요분이 "비목표"가 아니라 후속 단계로 표기됐다

## 7. 재검증 — 외부 사실 근거·신선도 정본

**이 표가 이미지 레인 전체의 외부 사실(엔진·플랫폼·채널이 정하는 값·문법·능력) 근거·확인일 정본이다.** 다른 파일은 근거 표를 다시 만들지 않고 이 표를 가리킨다. **레지스터는 하나, 스탬프는 제자리** — 없애야 하는 것은 같은 사실의 두 번째 근거 표이지, 주장 옆에 붙은 인라인 dated 스탬프가 아니다. 그것들은 그 자리에 남는다.

**확인일은 "값을 확인한 날"과 "값이 없음을 확인한 날"을 모두 포함한다.** 근거가 없는 값은 이관·통합 뒤에도 **[미확인]**으로 남는다. [미확인]을 지우려면 근거부터 붙인다 — 표를 정리하면서 자격 표시를 떨어뜨리는 것은 정보 손실이다.

경계 둘. **플랫폼 로스터 스냅샷 날짜와 그 신선도 등급**은 [model-routing.md](model-routing.md) §5의 기계 마커가 소유하고, **Midjourney 문법·파라미터의 규칙 서술**은 [../midjourney-identity.md](../midjourney-identity.md)가 소유한다. 이 표는 그 사실들의 근거·확인일만 기록하고 규칙 문장을 복제하지 않는다.

| 항목 | 근거 | 확인일 |
|---|---|---|
| S1 enum(ar·size·quality) | `contracts/v1/*.schema.json` 직접 읽음 | 2026-07-25 |
| S2 파라미터 축·모델 로스터 | Higgsfield MCP `models_list(limit:100)` 전체 95개·`has_more:false`; Soul 2.0·GPT Image 2·Recraft V4.1 `models_get` 교차 확인 | 2026-09-06 |
| `prompt-bundle/v1` 2000 | `contracts/v1/prompt-bundle.schema.json` 직접 읽음 — `text.maxLength` / `unicode_char_count.maximum` | 2026-07-25 |
| gpt-image 계열 32,000자 | OpenAI 이미지 생성 API 레퍼런스, 웹 확인 | 2026-07-25 |
| Soul 웹·MCP 색상 경계 | 현행 `models_get(soul_2)`에는 `quality`·`soul_id`만 있으며 `models_list`의 Soul Cinema도 동일. 두 모델에 `colors`·Color Transfer 전용 필드가 노출되지 않음. 웹 Soul HEX를 API 파라미터로 임의 변환하지 않음 | 2026-09-06 |
| Soul HEX 색상 입력 | Higgsfield 공식 [Soul 2.0](https://higgsfield.ai/soul-intro), [사용 안내](https://www.higgsfield.company/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images): Color Transfer의 참조 이미지 대표 팔레트 추출·기본 팔레트 선택. Soul 2.0·Soul Cinema 지원. 본문 코드 해석·추출 알고리즘·API 필드는 이 자료로 확정하지 않음 | 2026-09-06 |
| FLUX.2 본문 HEX | BFL 공식 [prompting guide](https://docs.bfl.ai/guides/prompting_guide_flux2): HEX 색상 지정과 물체별 연결을 안내. 생성 파일의 픽셀 일치 여부는 별도 검증 대상 | 2026-09-06 |
| GPT Image 네이티브 편집·이어쓰기 | OpenAI [image prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide): 변경점·보존·추가 금지를 직접 명시하고 필요한 참조를 연결. 짧은 변경 지시가 가능하다는 근거이며 픽셀 동일성 보증은 아님 | 2026-09-05 |
| gpt-image-2 직접 API 알파·입력 충실도·마스크 | OpenAI [image generation guide](https://developers.openai.com/api/docs/guides/image-generation): 투명 배경은 preview, PNG/WebP; `input_fidelity` 생략; 마스크는 정확한 경계 보증이 아닌 가이드. 예제와 충돌 시 API 필드 정의 우선 | 2026-09-05 |
| Higgsfield gpt_image_2 직접 API와의 차이 | 현행 `models_get(gpt_image_2)`의 `parameters`에 `resolution`·`quality`만 있고 `background`·`input_fidelity` 없음. 직접 API 필드를 복사하지 않음 | 2026-09-05 |
| BytePlus ModelArk direct Seedream 5 Pro 모델·길이 | 공식 [Image generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)·API — `dola-seedream-5-0-pro-260628`, 영어 600단어 미만 권장, 1K/2K·PNG/JPEG. Higgsfield `seedream_v5_pro`와 별도 표면 | 2026-08-02 |
| Seedream 5 Pro 인터랙티브 편집 문법 | 공식 [interactive editing guide](https://docs.byteplus.com/en/docs/ModelArk/2582775) — 이미지별 0–999 정규화 좌표, `<point>x y</point>`, `<bbox>x1 y1 x2 y2</bbox>`, 다중 대상 식별·보존 영역 표기 | 2026-08-02 |
| BytePlus ModelArk direct Seedance 2.0 프롬프트 문법·길이 | 공식 [Seedance 2.0 series prompt guide](https://docs.byteplus.com/en/docs/ModelArk/2222480)와 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — 멀티모달 참조·편집·연장·트랙 연결, 1,000단어 미만 권장 | 2026-08-02 |
| Seedance 2.0 direct 입력 조합 | 공식 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — reference 이미지 0–9, 영상 0–3, 오디오 0–3; 이미지·영상 중 최소 1개 필요; first/last-frame와 multimodal-reference 시나리오 직접 혼용 불가; 참조 영상 합계 15초 이하 | 2026-08-02 |
| Seedance 2.0 direct 실인물 참조 입력 | 공식 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — 실제 인물 얼굴이 든 이미지·영상의 일반 직접 업로드는 미지원; 신뢰된 원본 출력·프리셋 디지털 캐릭터·권리 확인 후 등록 자산 경로를 사용 | 2026-08-02 |
| Seedance 2.0 direct 결과 제약 | 공식 [prompt guide](https://docs.byteplus.com/en/docs/ModelArk/2222480) — 불필요 자막·로고·워터마크·중복 인물 교정에 짧은 명시 제약 사용. 규칙 서술은 [seedance-2.md](seedance-2.md) §공식 실패 제약 예외 | 2026-08-02 |
| Dreamina 웹 Seedance 2.5 프롬프트 계약 | ByteDance [Prompt Guide](https://bytedance.larkoffice.com/docx/A88jd0B47oAd8zxWp5ycZFMfnxh) — 자산별 역할·장면별 선택, 단계/종료 상태, 편집 master/scope/preserve, 경계 프레임 연장, 키프레임·스토리보드·오디오 표기. 규칙 서술은 [seedance-2-5.md](seedance-2-5.md) | 2026-08-03 |
| Dreamina 웹 Seedance 2.5 입력·UI 모드 | ByteDance [User Guide](https://bytedance.larkoffice.com/wiki/NjnWwvf4BiFYFLk2RzrcEgaunGf)와 Prompt Guide — 합계 최대 50개, 이미지 30장, 영상 10개·합계 30초, 오디오 10개·합계 30초, 일반 생성 4–30초·Long Video 30–180초, 480p/720p. Dreamina UI 값이며 ModelArk API·다른 래퍼에 복사 금지 | 2026-08-03 |
| Seedance 2.5 ModelArk 모델 id·API 요청 스키마 | Dreamina 공식 Lark 가이드는 웹 UI 표면만 설명한다. 현재 확인한 [ModelArk 모델 목록](https://docs.byteplus.com/en/docs/modelark/1159178)·Seedance API 문서에는 2.5 direct 계약이 없음 **[미확인]** — Dreamina UI·2.0 direct 값을 API로 자동 상속 금지 | 2026-08-03 |
| Midjourney 간결성 | 공식 [Prompt Basics](https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics): 짧고 명확하게 쓰되 중요한 피사체·수량·구도는 명시. 40/60/80단어 경계는 제시하지 않음 | 2026-09-05 |
| 이미지 구체성·편집 | Google 공식 [Image generation guide](https://ai.google.dev/gemini-api/docs/image-generation): 필요한 세부·의도·참조 이미지의 변경점을 구체화하고 반복 편집. 모든 컷에 촬영 슬롯·HEX 개수를 강제하는 근거가 아님 | 2026-09-05 |
| Veo 대사·단일 클립 | Google [video best practices](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice): 발화는 콜론으로 구분하고 따옴표를 피함. 짧은 영상은 한 장면에 집중 | 2026-09-05 |
| Veo 제외 입력·지원 언어 | Google [negative prompts](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide#negative-prompts)의 명사 목록은 네거티브 입력용. [Veo 3.1](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate)의 prompt language는 영어; 발화 언어와 별도 | 2026-09-05 |
| Grok 직접 이미지 설정·기본값 | xAI [image generation](https://docs.x.ai/developers/model-capabilities/images/generation): 현재 본문의 설정표를 확인. 검색 스니펫의 오래된 quality 기본값보다 원문 우선 | 2026-09-07 |
| Grok 이미지 편집·다중 입력 | xAI [image editing](https://docs.x.ai/developers/model-capabilities/images/editing), [multi-image editing](https://docs.x.ai/developers/model-capabilities/images/multi-image-editing): 입력 순서·비율·다중 편집·반복 편집 및 직접 편집 요청 형식 | 2026-09-07 |
| Grok 대화형 이미지 도구 | xAI [image generation tool](https://docs.x.ai/developers/tools/image-generation): 자연어 비율 지정·직접 엔드포인트와의 차이·이전 응답 상태 유지 | 2026-09-07 |
| Grok 이미지·문자 작성 정책 | xAI [Image 2.0 발표](https://x.ai/news/grok-imagine-image-2)의 편집·타이포그래피·레이아웃 설명. MPW의 정확 카피·보존 지시를 적용하는 근거이며 철자·픽셀 일치 보증은 아님 | 2026-09-07 |
| Grok 영상 입력 모드·움직임 | xAI [video generation](https://docs.x.ai/developers/model-capabilities/video/generation#request-modes), [image-to-video](https://docs.x.ai/developers/model-capabilities/video/image-to-video), [공식 영상 사용례](https://x.ai/grok/use-cases/video-generation): 모드 조합과 장면·행동·카메라·페이스 서술 | 2026-09-07 |
| Grok 참조 영상·음성 | xAI [reference-to-video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video): 시작 프레임과 참조의 구분, 프리셋 음성과 자체 오디오의 제공 범위 | 2026-09-07 |
| Grok 영상 참조 태그 시작 번호 | 같은 [reference-to-video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video#reference-audio) 본문은 `<IMAGE_0>`부터, 예시는 `<IMAGE_1>`부터 표기. 시작 인덱스 충돌 **[미확인]** | 2026-09-07 |
| Grok 영상 편집·연장 설정 | xAI [video editing](https://docs.x.ai/developers/model-capabilities/video/editing), [video extension](https://docs.x.ai/developers/model-capabilities/video/extension): 편집 설정 상속과 연장 구간 길이 | 2026-09-07 |
| Grok prompt 공통 문자 상한·권장 단어수 | 확인한 xAI 이미지·영상 가이드에 공통 수치 미제시 **[미확인]** — 선택한 엔드포인트·UI 제한을 확인 | 2026-09-07 |
| Midjourney V8 참조 생성·편집 | 공식 [Edit Model](https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model): V8.1/V8.2, 최대 4개 입력, 웹 첨부·Discord `--edit`. [Image Prompts](https://docs.midjourney.com/hc/en-us/articles/32040250122381-Image-Prompts)의 일반 장면 참조와 구분 | 2026-09-05 |
| Midjourney 문자 하드 상한(6,000자설) | 공식 출처 없음 **[미확인]** — 런타임에 정의된 실제 제한을 확인 | 2026-07-25 |
| Midjourney 문법·파라미터(`--no` 단일 명사·모더레이션 단어 단위 판독 / 무드보드 `--p` 참조·`--sw` 비호환·강도는 `--stylize` / `--sref` 텍스트 Best Practices) | 공식 문서·릴리스노트. **규칙 서술 정본은 [../midjourney-identity.md](../midjourney-identity.md) §5·§6·§7** | 2026-07-25 |
| Midjourney 스타일 참조의 역할 | 공식 [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)는 미학을 전달하는 기능으로 설명. 정체성 보존 기능으로 대체하지 않음 | 2026-09-05 |
| Midjourney V8 계열 `--sv` 기본값·유효 범위 | 공식 문서에 V7(1–6)·V6(1–4)만 있고 **V8 섹션 자체가 없다** **[미확인]** — 커뮤니티 수치를 기입하지 않는다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §3 | 2026-07-25 |
| Midjourney V8 계열 Draft Mode 호환 | [Draft 아티클](https://docs.midjourney.com/hc/en-us/articles/35577175650957-Draft-Conversational-Modes)은 V8.1/V8.2 웹 경로를 설명하나 [Version 표](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)는 미지원으로 표시. 문서 간 충돌 **[미확인]** — 선택한 UI에서 확인 | 2026-09-05 |
| Midjourney 무드보드 최대·권장 장수 | 공식 권장도 최댓값도 없고 **커뮤니티 수치가 서로 불일치**한다(5–10 / 8–12 / 최대 100) **[미확인]** — 숫자 대신 방향성만 쓴다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §7 | 2026-07-25 |
| Midjourney `--sw` 수치 조절표 | **커뮤니티 단일 출처뿐** **[미확인]** — 규범으로 쓰지 않는다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §6 | 2026-07-25 |
| Midjourney `--stylize` 에디토리얼 권장 대역 | **커뮤니티 단일·소수 출처뿐** **[미확인]** — 고정 시작 대역을 쓰지 않고 현재 설정에서 한 축씩 비교. 파라미터 범위는 [../midjourney-identity.md](../midjourney-identity.md) §3 소관 | 2026-07-25 |
| Midjourney 스타일 참조별 가중치 | 공식 [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)에 Discord `--sref URL1::2 URL2::1` 표기. 일반 본문의 Multi-Prompt `::` 비지원과 혼동해 전면 차단하지 않음 | 2026-09-05 |
| Higgsfield 이미지·영상 전 모델에 `negative_prompt` 없음(3D `tripo_3d`만 예외) | `models_list` 전체 종료 확인: 이미지 33·영상 39·오디오 6·3D 17, 후처리 포함. 모든 `parameters` 검사 | 2026-09-06 |
| Higgsfield 모델 길이 상한 | 전체 카탈로그에 `prompt` 상한 미선언; 현행 생성·비용 조회 도구의 `prompt`에도 상한 없음. 백엔드 실제 상한은 미공개 **[미확인]** | 2026-09-05 |
| Higgsfield 호출 롤·비용 조회·비율 보정 | 현행 생성·`estimate_image_cost`·`estimate_video_cost` 도구 정의 확인. canonical 롤을 백엔드 롤로 매핑하고 보정은 `adjustments`로 반환. 생성 결과는 이번에 검증하지 않음 | 2026-09-05 |
| Higgsfield `image` 롤과 `image_references` 롤의 **의미적 동작 차이** | 런타임 description에 서술이 없다 **[미확인]** — 롤 이름으로 동작 차이를 설명하지 않는다 | 2026-07-25 |
| `max` 미선언 모델의 레퍼런스 장수 상한 | 프리플라이트 통과 ≠ 생성 성공. 백엔드 상한 **[미확인]** | 2026-07-25 |
| Grok Imagine UI 지원 비율 목록 | 직접 API의 [비율 표](https://docs.x.ai/developers/model-capabilities/images/generation#aspect-ratio)는 확인했으나 현재 로그인 UI의 전체 선택지는 미관측 **[미확인]** — API 목록을 UI 목록으로 간주하지 않음 | 2026-09-07 |
| Rentmeester v. Nike / selection-and-arrangement / idea-expression | 판례·해설 | 2026-07-25 |
| S3 2000자 | 붙여넣기 UX 제약 + 상한 있는 채널 배선의 합성. 그 표면의 보편 상수가 아니다 | — |
| 전달 채널 상한 | 런타임 배선 값 — 이 문서가 아니라 실행 런타임이 권한자([../adapters.md](../adapters.md)) | — |

확인일이 `—`인 행은 **합성값이거나 런타임이 소유한 값이라 날짜 스탬프의 대상이 아니라는 뜻**이고, **[미확인]** 행과 다르다 — 전자는 근거가 다른 곳에 있고, 후자는 근거가 없다. 둘은 배타다: **[미확인]** 행은 "없음을 확인한 날"을 반드시 갖고 `—`를 쓰지 않으며, `—` 행에는 **[미확인]**을 달지 않는다.

S2 항목은 플랫폼이 모델을 추가·제거하면 즉시 낡는다. 90일 넘게 재확인되지 않았으면 단정하지 말고 런타임 확인을 먼저 한다. 엔진 길이 상한도 같은 성질이다 — 모델 세대가 바뀌면 다시 확인한다.
