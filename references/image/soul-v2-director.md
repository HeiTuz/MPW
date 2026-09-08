# Higgsfield Soul V2 — 프롬프트 디렉터 정본

우선순위: [lanes.md](lanes.md) §레인 게이트 카드 > [compiler.md](compiler.md) 철칙 > 이 파일. 이 파일은 Soul V2 스틸 **프롬프트 텍스트 설계**만 소유한다. 실행(모델 ID·CLI/MCP 파라미터·soul_id·크레딧·QC 루프)은 공식 higgsfield-* 스킬이 정본이다.

## 핵심 원칙

1. **시각 결과 중심.** 필요한 장면·편집·보존 조건을 짧은 자연어나 명사구로 쓴다. 요청을 바꾸지 않는 역할 설정·부연은 넣지 않는다.
2. **빈 품질어 금지.** `photorealistic, ultra-realistic, beautiful, masterpiece, best quality, stunning, highly detailed, professional photography, 8K`와 구체 처리 없는 `cinematic`은 쓰지 않는다. 눈에 보이는 특성으로 치환한다: `visible skin pores, controlled specular highlights, dry wool fibers, dense silk sheen, fine halation, compressed flash shadows, low-saturation tungsten palette, coarse 35mm grain, soft highlight roll-off`.
3. **모든 토큰은 결과를 바꿔야 한다.** 결과에 보이지 않는 단어는 삭제한다.

## 지시 우선순위 (충돌 시 위가 이긴다)

1. 정체성 보존 → 2. 제품 디자인·의복 구조 → 3. 요구된 동작·포즈 → 4. 카메라 앵글·크롭 → 5. 배경·로케이션 → 6. 미학 방향 → 7. 조명 → 8. 카메라·필름 처리 → 9. 장식 디테일.

스타일링을 위해 제품 정확도나 정체성 일관성을 희생하지 않는다.

## 4레이어 참조 순서

상세 Soul 프롬프트를 조립할 때 아래 순서로 필요한 내용을 고른다. 모든 레이어·슬롯을 채우거나 촬영 장비를 새로 정할 의무는 없다. 사용자 지정 언어를 유지하고 한 문단으로 작성한다.

| 레이어 | 내용 | 골격 |
|---|---|---|
| L1 피사체·의상·동작·구도 | 성인 연령대, 젠더 표현, (제공 시) 민족, 정확한 실루엣·색·소재·봉제 디테일, 포즈/동작, 방향, 샷 사이즈·카메라 앵글 | `[adult subject], [identity], [exact silhouette+materials], [construction], [pose], [orientation], [shot size+angle]` |
| L2 미학·환경 | 에디토리얼 장르, 서브컬처/시대 영향, 브랜드 앵커(≤1+1), 로케이션·세트, 팔레트 | `[editorial direction], [primary brand language], [supporting aesthetic], [environment], [palette]` |
| L3 조명·분위기·그림자 | 키라이트 방향·질, 필 수준, 림, 그림자 경도·깊이, 색온도, 대기 효과, 하이라이트 거동 | `[key light+direction], [fill/contrast], [shadow quality], [atmosphere], [highlight behavior]` |
| L4 카메라·렌즈·모션·질감 | 결과를 가르는 심도·색 반응·소재 질감. 장비가 지정됐다면 바디·주 렌즈는 각각 최대 1개 | 필요한 `[DoF], [film/color], [texture]` |

- 물리적으로 모순되는 조명을 섞지 않는다 (`soft overcast + hard noon sun + neon night` 금지).
- 비율·품질·Color signature는 본문과 분리한다 ([lanes.md](lanes.md) §인물·사실감 이미지 레인, [surfaces.md](surfaces.md) §4). S1은 계약 필드, S2는 실제 호출 파라미터, S3는 UI 라벨 줄이 권한자다. 기본값은 설치가 공급하고, 없으면 [lanes.md](lanes.md) §이미지 슬롯 기본값 절차로 고른다.
- **훈련된 Soul ID 사용 시 L1의 얼굴·민족·정체성 서술은 soul_id가 권위다.** 프롬프트에는 장면·스타일·행동·의상만 쓰고 외모 반복으로 정체성을 고정하려 들지 않는다 (기존 레인 규칙 유지).

## 브랜드 = 디자인 앵커

실루엣·스타일링·서브컬처·에디토리얼 방향을 명확히 할 때만 브랜드를 쓴다. **주 1개 + 보조 1개 최대.** 브랜드 수프 금지. 브랜드가 실제 의복 구조를 대체하면 안 되고, 로고·텍스트·워터마크 렌더는 요청 없이는 금지한다.

| 방향 | 앵커 |
|---|---|
| 페미닌 프레피·영 럭셔리 | Miu Miu |
| 절제된 지적 미니멀리즘 | Prada, Jil Sander |
| 조각적 블랙 테일러링 | Rick Owens |
| 오버사이즈 어반 볼륨 | Balenciaga |
| 해체주의 테일러링 | Maison Margiela |
| 관능적 바디컨셔스 글램 | Mugler |
| 로맨틱 투명·텍스처 | Simone Rocha |
| 콰이어트 럭셔리·소프트 테일러링 | The Row |
| 유틸리티 테크니컬 | Stone Island, Arc'teryx Veilance |
| 고프코어 | Salomon, Oakley, And Wander |
| 미래주의 바디 아키텍처 | Courrèges, Coperni |
| 다크 재패니즈 아방가르드 | Yohji Yamamoto, Comme des Garçons |
| 슬릭 코리안 에디토리얼 | RECTO, Low Classic, Andersson Bell |

사용자가 특정 의복을 제공하면 그 실제 구조를 보존한다. 브랜드 시그니처로 갈아치우지 않는다.

## 카메라·렌즈·필름·조명 선택 로직

목적에 맞는 시스템 하나만 고른다. 미디엄 포맷 스튜디오 카메라로 raw 디스포저블 컨셉을 찍지 않는다.

| 목적 | 카메라 | 렌즈 | 필름/질감 | 조명 골격 |
|---|---|---|---|---|
| 럭셔리 스튜디오 패션 | Hasselblad X2D 100C / H6D / Phase One XF IQ4 | 80–110mm | Portra 160, fine grain, restrained saturation | `large directional softbox camera left, negative fill right, controlled deep shadows, narrow rim light` |
| 뷰티 포트레이트 | Phase One XF IQ4 / X2D | 100–120mm macro | fine pore detail, controlled skin highlights | `frontal octabox above lens, reflector below chin, low shadow depth` |
| 에디토리얼 로케이션 | Leica SL2-S / Canon R5 / (무빙) Sony Venice 2 | 50/65/85mm | Portra 400, warm skin, muted greens, soft grain | `golden-hour low warm backlight, soft reflector fill` 또는 `cool diffused overcast, low contrast` |
| 스트리트 스냅·Y2K | Contax G2 / Nikon F5 / Canon EOS-1V | 28/35/45mm | Superia 400, cool green cast, uneven grain, direct flash | `direct on-camera flash, rapid falloff, dense background shadow` |
| 시네마틱 내러티브 | ARRI Alexa 35/LF / Venice 2 + Cooke S4·Panavision Primo·Atlas Orion | 35/50/75mm (ana 40–75mm) | Vision3 500T, tungsten bias, restrained halation | `cool cyan side light, warm tungsten practicals, deep negative fill, volumetric haze` |
| 감시·raw 디지털 | MiniDV / early-2000s CCD | security perspective | clipped highlights, digital noise | (timestamp는 명시 요청 시만) |
| 나이트 패션 | 위 로케이션/스트리트 계열 | — | Portra 800, visible grain, warm practicals, soft halation | — |
| 새추레이티드 유스 | — | — | Ektar 100, saturated reds/blues, crisp contrast | — |
| 그리티 모노크롬 | — | — | Tri-X 400, dense black grain | — |

- 렌즈 의도: 24mm 환경 왜곡 / 28mm 에너지 스트리트 / 35mm 다큐 친밀 / 50mm 중립 시네마틱 / 65mm 정제 에디토리얼 / 80–85mm 패션 압축 / 100–120mm 뷰티·디테일 / 아나모픽 40–75mm 수평 플레어. 얼굴 비율 왜곡이 허용되지 않으면 24/28mm 금지.
- 장비를 쓸 때는 컷당 카메라 바디·주 렌즈 각각 최대 1개. 빛의 방향과 경도는 요청이나 관측 실패를 구분할 때만 명시한다.
- 질감은 소재 특정으로: `brushed wool fibers, dense satin highlights, translucent organza layering, creased technical nylon, cracked patent leather, visible denim twill, natural skin pores, flyaway hair strands`.
- 필름 스톡 언어는 색 반응·그레인 제어이지 물리 필름 프레임 허가가 아니다. 보더리스는 `digital color grade inspired by Kodak Portra 160` 형으로 쓴다.

## 이미지 모드

- 프롬프트 하나 = 한 프레임. 다중 장면·그리드·콜라주·contact sheet·diptych·split은 명시 요청 없이는 만들지 않으며, **부정형("no collage")으로도 레이아웃 어휘를 본문에 넣지 않는다** — Soul이 리터럴 렌더한다. 사용자가 N장을 요청하면 N개의 독립 싱글 포즈 프롬프트를 작성한다.
- 구도(클로즈업/체스트업/하프/스리쿼터/풀바디)를 항상 선언한다. 풀바디 요청이면 head-to-toe 가시성을 지킨다.
- 로고·텍스트·액세서리·잠금장치·포켓·심·하드웨어를 발명하지 않는다. 제품 중심 컷에서는 의복 정확도 > 브랜드 스타일링.

## 스틸을 영상으로 연결할 때

Soul 스틸을 시작 이미지 또는 외형 참조로 쓰려면 실제 영상 모델과 입력 역할을 별도로 선택한다. Soul의 `soul_id`나 스틸 작성 문법을 영상 모델의 기능으로 상속하지 않는다. 동작·카메라·음향은 [lanes.md](lanes.md) §영상 공통 규칙, 입력과 제약 전달은 [surfaces.md](surfaces.md)를 따른다.

2026-09-08 공식 모델 조회에서 `soul_2`는 `output_type:image`로 확인했다. 영상 지원 여부는 선택한 영상 모델의 현재 계약으로 확인한다.

## 오류 예방 토큰

요청과 직접 관련된 것만 골라 짧게 삽입한다. 스틸은 긍정형: `stable facial identity, anatomically continuous limbs, natural hands, unchanged garment construction, plain unbranded hardware, clean logo-free garments, coherent single-vanishing-point background`. 범용 네거티브 리스트를 모든 프롬프트에 달지 않는다.

## 일관성 락 (시리즈·컬러웨이·앞뒤 컷)

시리즈 요청이면 비주얼 마스터와 요청한 고정 축을 유지하고 지정된 변주 축만 바꾼다. 보존 후보는 인물·헤어·신체 비율, 의복 구조·재질·색, 피사체 스케일·프레이밍·조명·배경 톤이며 필요한 것만 쓴다. 컬러웨이·앞뒤 컷도 사용자 계약에 맞는 변화만 허용한다.

## 레퍼런스 이미지 처리

가장 명확한 풀뷰 = 실루엣 권위, 클로즈업 = 디테일·질감 권위, 앞/뒤/옆/안감 = 구조 권위. 같은 물리 디자인만 결합하고, 안 보이는 디테일은 발명하지 말고 보이는 의복과 일관된 최소 구조로 채운다. 비대칭 디자인은 그대로 보존하고, 착용 왜곡·일시적 주름은 패턴과 구분해 교정하되 의도된 드레이핑·개더·플리츠·디스트레싱·불규칙 헴은 보존한다. 단일 패스에서 레퍼런스가 결과에 누출되거나 탈취되면 설치가 공급한 대응 절차를 따르고, 없으면 권한 축을 하나씩 분리해 실패 축만 다시 컴파일한다.

## 산출 형식

1. **Optimized Soul V2 Prompt** — 복사 가능한 코드블록 1개. 필요한 내용만 한 문단으로 작성한다. 길이·상세도는 [surfaces.md](surfaces.md) §0-1·§0-2를 따른다. 실제 상한에 맞춰 줄일 때도 요청한 조건을 버리지 않는다.
2. **실행 설정** — S1은 계약 필드, S2는 현재 호출 도구의 파라미터로 전달한다. S3에서 실제 UI 선택이 필요할 때만 본문 밖에 `[프리셋/비율/Color signature — UI에서 선택]` 라벨을 둔다.
3. **디렉션 노트** — 설명이 필요할 때만 실제 선택·가정을 짧게 쓴다.
4. 유용할 때만 옵션(출력 타입·비율·길이·모션 강도)을 붙이고, 미지원 파라미터는 적지 않는다.

## 금지 행동

요청 전체 반복, 대화체 장문, 무관 미학 스택, 브랜드 >2, 렌즈 다중 혼용, 주야 조명 혼합, 의도 없는 스튜디오+다큐 혼합, 의복 디테일의 브랜드 시그니처 치환, 불필요 액세서리, 지시 없는 민족·연령·정체성·체형 변경, 한 출력 컷에 여러 대안 프롬프트나 프레임 혼합, 요청 없는 그리드·텍스트·로고, 빈 품질어 의존.

## 실측 법칙 — soul_2 (2026-07-29 라운드, 유료 스모크 40여 장)

한 세션에서 축을 하나씩 고립시켜 잰 결과다. 위 원칙과 겹치는 것은 뺐고, **반례로 확인된 것만** 남긴다.

### 1. 기하·수치가 아니라 **관용 명칭**을 듣는다

| 축 | 실패한 서술 | 통한 문구 |
|---|---|---|
| 카메라 높이 | `shot from a high vantage point looking down, the camera well above her…` (3판본) | **`A bird's-eye view`** |
| 화면 점유율 | 분수(`TWO THIRDS`)+검증문+교정 지시 → 93~97% 고정 | **`An extreme wide shot`** → 65% |
| 조명 | 광원 위치·각도 서술(5판본) | **`Paramount lighting`**(버터플라이의 정식 별칭) |

이 라운드에서는 각도·분수 등 본문 수치 지시가 의도한 결과와 어긋났다. Z축에 `25 degrees` + `pronounced`를 함께 쓰자 90°로 돌아간 사례가 있다. 같은 축에 서로 다른 크기 지시를 겹치지 말고, 재시도에서는 화면 결과나 관용 명칭으로 좁힌다. 이 관측을 모든 수치·색 코드가 작동하지 않는다는 모델 법칙으로 일반화하지 않는다.

**색상 보정(2026-09-06 공식 문서 확인):** 이전 메모의 HEX 실패 주장은 본문 코드 입력과 Soul HEX 기능을 구분하지 않았고, 이 절에 색상별 대조 결과도 남아 있지 않아 보편 규칙으로 유지하지 않는다. 색 제어는 [surfaces.md](surfaces.md) §4.1, 공식 근거는 같은 문서 §7을 따른다. 본문 HEX의 현재 반영률은 별도 생성 대조 전까지 미확인이다.

### 2. 언급하면 그린다 — 부정문만이 아니다

기존 doctrine은 레이아웃 어휘에만 이 규칙을 걸어두었으나, 실측 범위가 더 넓다.

- 부정문: `NO jacket, NO belt` → 재킷·벨트 등장. `never a panel layout` → 분할 레이아웃.
- **완화형 부정도 같다**: `almost no shadow`, `shadows barely closing`, `no other shadows on the backdrop`.
- **언급 횟수 자체가 누적된다**: 버터플라이 프롬프트에서 `shadow` 4회 → 벽에 큰 그림자. 코 밑 1회로 줄이자 사라짐(벽 밝기 폭 13.6 → 5.7, 픽셀 실측).
- 없애려면 **긍정 관용어**로 옮긴다: `shadowless`, `the backdrop staying clean and evenly lit`, `every surface plain and unlettered`.

### 3. 물건 이름을 부르면 그 물건이 화면에 나온다

| 부른 이름 | 나온 것 |
|---|---|
| `Kodak Portra 160` | 필름 스트립 테두리 + 가장자리 각인(`CORDRANRR-160`) |
| `octabox softbox`, `fill reflector`, `clamshell setup` | 조명 장비가 프레임 안에 |
| `seamless paper cyclorama` | 종이 롤의 좌우 가장자리 선 |
| `infinity cove … walls` | 벽 코너·벽감 |
| `inside a professional photo studio` | 스튜디오 집기 |

**빛·질감은 결과로만 말한다.** 필름은 상표명을 빼고 발색만(`fine grain, softly lifted blacks, smooth highlight roll-off`), 조명은 장비 대신 빛의 성질(`a source so broad that it wraps right around her`).

### 4. 축마다 **자리**가 다르다 (규칙 8의 세분)

| 축 | 듣는 자리 | 다른 자리에 두면 |
|---|---|---|
| 프레이밍(샷 사이즈·앵글) | **머리 명사** — `A high-angle wide shot of …` | — |
| 몸의 방향 | **독립 문장**(꼬리) | 쉼표 목록에 넣으면 죽는다 — 측면 90° 단독인데 정면 |
| 프레임 롤(더치) | 쉼표 절 | — |
| 얼굴 방향 | 쉼표 절 | 몸 방향과 독립이라 조합 가능 |

### 5. 산문보다 **용어 스택**

1,775자 산문 → 1,013자 용어 스택으로 바꾸자 같은 조건에서 점유율 70%→57%, 장면 밀도 상승. 이유 설명(`This matters because…`)·자기 검증문·완충 문구는 그림 지시에 필요 없다. `bare midriff` 세 단어가 문단 하나를 대신했다.

### 6. 몸의 방향은 세 자리로 **스냅**한다

정면·측면·후면만 안정점이다. 45°는 문구를 셋으로 바꿔도(과회전/정면/정면) 도달하지 못했다. **3/4 컷은 몸=측면 90° + 얼굴=렌즈 응시** 조합으로 만든다 — 두 축을 각자의 권한자로 쓰면 정확히 나온다.

### 7. 인물 조명 패턴은 **샷 사이즈에 종속**된다

버터플라이·루프·렘브란트·스플릿은 코 그림자 모양으로 정의되는 얼굴 세팅이다. 전신 컷에서는 얼굴이 프레임의 5% 미만이라 패턴이 판별되지 않는다. 전신에서 쓰려면 **몸에서 보이는 결과**(밝은 쪽/어두운 쪽, 계조의 경도)로 함께 적는다.

`butterfly`는 두 뜻이 겹친다 — 인물 패턴(Paramount)과 **그립 장비인 대형 실크 프레임**. 후자를 뜻한다면 정체는 그림자 모양이 아니라 광원 크기다.

### 8. 배경과 조명의 권한 분리

심리스 배경에 "인물이 배경에서 몇 걸음 앞에 선다"는 **거리 절**을 넣되, 그 절에 그림자를 언급하면 안 된다. 실측: 거리 절 없음 13.6 → 거리+그림자 언급 **53.7**(악화) → 거리만 **5.7**. 거리는 배경이, 그림자 유무는 조명이 단독으로 정한다.

### 검증 방법

**눈이 아니라 픽셀로 판정한다.** 이 라운드에서 "벽이 깨끗하다"고 두 번 잘못 보고했다. 배경 균일도는 인물을 뺀 좌우 밴드의 밝기 프로파일을 재서 폭으로 판정한다(균일 ≈ 5~7, 그림자 있음 ≈ 50+).

## 최종 체크

요청한 피사체·의복·포즈·구도·카피·출력 수를 보존했는가, 선택한 빛·재질·연속성 조건이 모순되지 않는가, 비요청 장비·장식·정체성을 추가하지 않았는가를 확인한다. 브랜드 앵커를 사용했다면 ≤1+1을 지킨다. 빠진 슬롯 수를 품질 결함으로 세지 않는다.
