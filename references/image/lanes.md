# IMAGE·COMPOSITE·영상 라우트에서만 로드

## 0. 선행 판정 — 표면부터 정한다

**[surfaces.md](surfaces.md)를 먼저 읽는다.** 산출물이 기계 계약(S1)·플랫폼 파라미터(S2)·붙여넣기 UI(S3) 중 어디로 나가는지에 따라 길이·비율·해상도 계약이 통째로 달라진다. 이 파일의 레인 규칙은 그 위에 얹힌다.

- 파라미터로 표현되는 축(비율·해상도·품질·길이·오디오·팔레트·프리셋)은 **산문에 중복 기술하지 않는다**([surfaces.md](surfaces.md) §4).
- 사이즈·길이 문장이 [surfaces.md](surfaces.md)와 충돌하면 surfaces.md가 이긴다.

## 레인 게이트 카드

레인별 네거티브·비율·길이·필수 요소는 여기서 판정한다. 단일 IMAGE·COMPOSITE 편집은 메인 지시와 보존·배제 제약을 하나의 블록으로 통합한다.

| 레인 | 네거티브 정책 | 비율/AR | 길이 | 필수 요소 |
|---|---|---|---|---|
| 텍스트·구조 이미지 | Tier-0 긍정형 / 텍스트 렌더 Tier-1 / 명시 선언 시 Tier-2. 토큰·승격 정본: [compiler.md](compiler.md) §2 | S3는 끝 `AR x:y`, S1·S2는 파라미터 | 표면별([surfaces.md](surfaces.md)) | 장면 팔레트와 일치하는 HEX 3~5(팔레트 파라미터가 있는 모델은 파라미터 우선), 독립 컷 1행=1컷 |
| 인물·사실감 이미지 | 긍정형 | 모델의 `aspect_ratios` 안에서 | 표면별 | 모델 id 결정([model-routing.md](model-routing.md)), Soul 계열은 4레이어 순서·카메라 1·렌즈 1·브랜드 앵커 ≤1+1 ([soul-v2-director.md](soul-v2-director.md)), 동일 인물은 `soul_id` |
| COMPOSITE | 연산 금지 계약은 부정형 허용, 장면은 긍정형 | 입력과 같은 프레임 | 표면별 | 작업 재정의, 재조명 다이얼 1단, 접지 그림자·그레인 통일, 실패 조건 |
| 영상 | 명사 나열, 부정문 금지 | 모델의 `aspect_ratios` 안에서 | 씬당(표면별) | 스토리보드, 씬당 지배 모션 1개, 씬 길이가 모델 `duration` 허용값과 일치, 비영어 대사 영어 지문 |
| DESIGN 오버레이 | 실행 모드에 따름 | — | 표면별 | 방향 잠금, 시각 테제, 일반적 결과 회피, 뷰포트 검증 |
| TP1–TP14 typography poster | TP 공통 긍정형 + TP2/TP14의 반복 텍스처 예외 | 라우터 표의 후보 AR | 표면별 | TP 하나의 구조 권한, TP 단일 팔레트 권한과 HEX 2~4(공통 3~5보다 우선), 관찰 시그니처·실패 조건·첫 재시도 델타 |
| 이미지 입력 (레인 선행 게이트) | 선택된 레인의 정책을 따름 | 입력 프레임 또는 선택된 모델의 `aspect_ratios` 안에서 | 표면별 | 입력 이미지의 역할 선언(레퍼런스 / 편집 대상 / 시작·끝 프레임), 슬롯이 전달하는 것은 프롬프트에서 재묘사 금지. 판정과 레인 배정은 [from-image.md](from-image.md) |

**길이 열 "표면별"의 뜻:** 상한은 전달 채널 · 타깃 엔진(Midjourney는 문자 수가 아니라 **단어 수**) · 기계 계약 세 층에서 오고 **가장 좁은 것이 구속한다**. 전역 2000자 하드라인은 없다. 값과 판정은 [surfaces.md](surfaces.md) §0-1이 정본이다.

**"모델의 `aspect_ratios` 안에서"의 예외 — 빈 배열:** 그 모델은 비율을 파라미터로 받지 않는다는 뜻이므로 **비율을 넘기지 않고 입력 이미지·모델 기본값을 따른다**(예: `minimax_hailuo`, `autosprite`, `clipify`). 게이트 실패로 처리하지 않는다. 정본은 [surfaces.md](surfaces.md) §2다.

실사 서브레인에는 광원 방향·색온도·카메라/렌즈·불완전성·긍정형 안티-AI 앵커를 추가한다. 실사 영상은 시간 일관성·모션 블러 물리성·접지 물리를 더한다. 면제와 정본은 [realism.md](realism.md) §3·§6이다.

## 엔진 라우팅

**모델 후보 결정의 정본은 [model-routing.md](model-routing.md)다.** 목적축(정확 텍스트·벡터 로고·인물 사실감·동일 인물·지시 편집·초고해상·프롬프트 준수·제품 광고·영상 각 축)에서 **모델 id까지** 내려간 뒤에야 라우팅이 끝난다. "Higgsfield로 간다"는 라우팅 결정이 아니다 — 플랫폼 하나에 이미지 ~20종·영상 ~20종이 올라가 있다.

여기서는 레인만 가른다.

| 요청 신호 | 레인 |
|---|---|
| 정확한 텍스트 렌더, 포스터, 카드뉴스, 인포그래픽, 제품 도감, 타이포 포스터, 레이아웃·브랜딩 목업·아이콘·만화 | **텍스트·구조 이미지** — 정밀 컴파일 [compiler.md](compiler.md), TP 라우팅 [typography-poster-router.md](typography-poster-router.md) |
| 인물 사실감, 패션 스틸, 동일 인물, 카메라 모션 | **인물·사실감 이미지** / **영상** |
| 원본 피사체 보존과 배경 교체 | **COMPOSITE** |

표면과 모델이 명시되면 따른다. 두 목적이 한 컷에 겹치면 컷을 분리한다. 룩·조명·기법 라벨은 단독 명사가 아니라 화면 결과와 병기한다. 한국 로컬리티는 관찰 가능한 공간·의상·조명 단서로 쓰며 국적에서 외형을 추론하지 않는다. 안전 매트릭스는 [editorial/tier2-safety.md](editorial/tier2-safety.md) §13이다.

## 텍스트·구조 이미지 레인

<!-- 구 §gpt-image-2 레인 — 2026-07-25 개명. 다른 파일의 옛 이름 참조는 이 절을 가리킨다. -->

첫 줄에 핵심 장면을 둔 뒤 Scene(피사체·행동·공간) → Camera(시점·거리·화면 결과) → Lighting(방향·그림자) → Color grading(팔레트·색온도·HEX 3~5) → Texture/Medium → 선택 Text-in-image 순으로 작성한다. S3(붙여넣기)에서는 끝에 `AR x:y`만 두고, S1·S2에서는 비율을 파라미터로 넘긴다.

- 배제 장면은 긍정형으로 재서술한다.
- Tier 정책·토큰·결합 공식은 [compiler.md](compiler.md) §2가 정본이다.
- 실재 인물·상표 대신 가상 페르소나·브랜드를 쓴다.
- 여러 독립 컷은 한 캔버스에 묶지 않는다. 한 줄은 한 컷·한 호출이다.
- S3는 경로 참조와 오버플로우 문서를 금지한다. 초과하면 감량 후 컷을 분리한다.
- 제품·캠페인은 hero object, readable label, 반사·접지 그림자, 소품 위계를 명시한다(2026-07 실측).
- 팔레트 파라미터(`colors[]`·`background_color`)를 가진 모델에서는 HEX를 본문에 반복하지 않고 파라미터로 넘긴다.
- 벡터·SVG 계열 자산이 필요하면 본문 지시가 아니라 모델을 바꾼다([model-routing.md](model-routing.md)).

정밀 컴파일의 정본은 [compiler.md](compiler.md), 카테고리는 [categories.md](categories.md), 패션은 [editorial-fashion.md](editorial-fashion.md), 룩은 [look-and-concept.md](look-and-concept.md), 타이포는 [typography.md](typography.md), 양산은 [production.md](production.md)이다.

## 인물·사실감 이미지 레인

<!-- 구 §Higgsfield 레인 — 2026-07-25 개명. 다른 파일의 옛 이름 참조는 이 절을 가리킨다. -->

프레이밍, 인물 아이덴티티, 모션은 서로 다른 작업으로 분리한다. 모델 후보는 [model-routing.md](model-routing.md)에서 고른다.

**Soul 계열(`soul_2`/`soul_v2`/`soul_cinematic`) 프롬프트 설계 정본은 [soul-v2-director.md](soul-v2-director.md)다**: 비주얼 명사구 한 문단, 빈 품질어 금지, 4레이어 고정 순서(피사체·의상·동작·구도 → 미학·브랜드 앵커·환경 → 조명·그림자 → 카메라·렌즈·모션·질감), 지시 우선순위(정체성 > 의복 구조 > 포즈 > 카메라 > 배경 > 미학 > 조명 > 필름 > 장식), 카메라 바디 1·주 렌즈 1, 브랜드 앵커 최대 주1+보조1. **이 4레이어 구조는 Soul 전용이다** — 다른 모델로 옮길 때 그대로 복사하지 않는다.

- 동일 인물은 `soul_id` 파라미터로 잠근다. 텍스트 묘사만으로 동일 인물을 보존했다고 주장하지 않는다.
- 비율·품질은 파라미터다(`quality: 1.5k/2k` 등). 본문에 쓰지 않는다.
- 전역 색감은 수동 HEX 묶음 대신 레퍼런스 이미지로 제어할 수 있다. 레퍼런스는 `medias.roles`로 전달하고 프롬프트에서 다시 묘사하지 않는다.
- **프리셋을 스틸의 필수 요소로 두지 않는다.** MCP 로스터에서 `preset_id` 파라미터를 갖는 것은 영상 경로뿐이다(2026-07-25 확인) — 이미지 모델 중 이 파라미터를 가진 것은 없다. 웹 UI에 스타일 프리셋이 보인다면 그건 UI 라벨이며 프롬프트 본문에 쓰는 값이 아니다.
- 정확한 렌더 카피가 필요하면 텍스트 특화 모델의 별도 컷으로 분리한다.

### 얼굴 참조 민감도 오탐 대응

얼굴 참조 입력에서 `Output may contain sensitive content`가 돌아오면 프롬프트를 장황하게 순화하지 않는다. `identity`, `blend`, `synthesize`, `four reference faces`, `ID-photo`, `morph`, 상세 얼굴 해부학처럼 얼굴조작으로 읽히는 메타 설명을 제거하고, 결과 화면·각도·렌즈·조명만 짧게 쓴다. 참조 이미지는 미디어 슬롯이 전달하므로 프롬프트에서 다시 설명하지 않는다. 한 장의 AI 생성 참조로도 같은 오류가 나면 입력 얼굴 자체의 분류 오탐 가능성이 높다. 이때 재인코딩·메타데이터 삭제·얼굴 크롭을 반복하지 말고 다른 참조 컷이나 다른 모델을 사용한다. 3×3 캐릭터 시트는 `character-development sheet`·패널별 각도·일관된 촬영 조건으로 기술하며 다른 엔진의 URL/플래그를 섞지 않는다.

**같은 원칙이 Tier-2 화보 레인에도 적용된다**([compiler.md](compiler.md) §2): 신체·연령 메타 서술을 길게 덧붙이는 것은 분류기 오탐을 줄이는 게 아니라 늘릴 수 있다. 고정 문자열을 반사적으로 붙이지 말고 해당 레인이 명시 선언됐을 때만 쓴다.

## 배경 합성 레인 (COMPOSITE)

첫 문단에 이것이 생성이 아닌 픽셀 고정 합성임을 선언한다. 원본은 최종 캔버스이며 피사체 픽셀은 read-only, 생성 허용 영역은 배경뿐이다.

1. **프레임 락**: 입력과 같은 크기·비율, 크롭·줌·팬·재중앙·여백 재배분 금지.
2. **피사체 락**: 리샘플·워핑·포즈 재구성·실루엣 변경 금지.
3. **정체성·의상 보호**: 기하·자연 비대칭·피부 질감·직물 패턴을 보존한다.
4. **배경 규칙**: 신규 외부 배경만 생성하고, 원근은 카메라 지오메트리 또는 수동 정합 중 하나로 맞춘다.
5. **재조명 다이얼**: A 무접촉 / B 부분 허용(노출 ±0.3 stop, 환경 틴트 ≤0.2, 피부 언더톤 보존 ≥0.75) / C 전면 재계산 중 하나를 명시한다.
6. **통합**: 광원 방향과 맞는 접지 그림자, 피사체·배경의 일관된 그레인, 자연스러운 에지를 요구한다.
7. **판정·실패**: 동일인 인식이 미적 개선보다 우선이며, 피사체 이동·캔버스 변경·얼굴 재드로잉·직물 변형·원근 불일치·떠 있는 발은 실패로 처리한다.

연산 금지는 이 레인에서 필요한 계약이다. 장면 내용은 긍정형으로 쓴다. 긴 불리언 스택은 캐노니컬 문장으로 병합하고, 픽셀 고정 지원 여부가 불명확한 엔진은 확인 노트를 남긴다.

### 압축 규칙

긴 `SYSTEM OVERRIDE` 헤더나 반복되는 절대 금지 조항을 프롬프트에 복사하지 않는다. 다음 5단계로 압축한다:

1. 한 가지 작업 선언 (배경 합성, 픽셀 고정)
2. 캔버스/피사체/정체성/의상 락
3. 제한된 톤/조명 통합
4. 배경 위치 단서 팩
5. 짧은 실패 조항

### 적격 키워드

규칙 1~7에서 다루지 않는 추가 제약들을 간결히 지정:

- **recognition over beauty**: 미화보다 동일인 인식을 우선. 얼굴 평균화·대칭 보정·피부 스무딩 금지.
- **background clipping allowance**: 배경 오브제를 살리려 카메라를 움직이지 않는다. 잠긴 프레임 밖 요소는 잘림.
- **passive perspective match**: 카메라 재추정/보정 없이 기존 사진 시점에 배경 깊이만 정합.
- **environment cue pack**: 장소를 로고·간판 아닌 재료·시간·빛·필수 구조물로 정의.

### Compact clause template

```text
This is a pixel-bound background replacement composite, not free image generation. Preserve the original canvas, crop, aspect ratio, subject position, subject bounding box, pose, silhouette, face geometry, expression, hair edges, garment color/pattern/texture, and foot contact exactly. The original subject photo is the immutable base layer; subject pixels are read-only. Generate only a new external background plate that fills the locked canvas; background elements may be clipped by the frame. Keep face recognition and garment fidelity above beauty or composition improvement. Apply only bounded tone matching: preserve face hue/microtexture and garment hue/chroma, with bounded global grade only (±0.3 stop, tint ≤0.2, undertone ≥0.75). Add realistic contact shadow, matching grain, clean edge integration, no halo or pasted-on separation. If any crop, recentering, subject shift, resize, pose change, face redraw, or garment reinterpretation occurs, the edit fails.
```

## 영상 공통 규칙

스토리보드(씬 순서·길이·설명·카메라·오디오)를 먼저 만들고 씬별 프롬프트를 작성한다. 씬마다 지배 카메라 모션 1개와 핵심 행동 1개만 둔다. 대사는 따옴표로, SFX·앰비언스는 명시한다. 비영어 대사는 `Dialogue - {Character}: ({emotion} in Korean) "대사"`처럼 영어 지문으로 언어를 표시한다.

**파라미터로 되는 것은 프롬프트에 쓰지 않는다**([surfaces.md](surfaces.md) §4). 최근 영상 모델은 아래 축을 대부분 파라미터로 갖는다 — 산문으로 흉내내면 파라미터와 충돌한다.

| 산문에 쓰기 쉬운 것 | 실제 파라미터 |
|---|---|
| "5초 클립으로" | `duration` — **모델별 열거값 또는 범위**. 스토리보드 씬 길이를 여기에 맞춘다 |
| "슬로우모션으로" | `speedramp` / `slow_motion` |
| "느와르 톤으로" | `genre` — **옵션 목록이 모델마다 다르다.** 예: `cinematic_studio_video_v2`엔 `noir`가 아예 없고 `cinematic_studio_3_0`엔 있다(2026-07-25 런타임 확인). 특정 목록을 외워 쓰지 말고 그 모델의 enum을 확인한다 |
| "무음으로" / "소리 넣어줘" | `generate_audio` / `sound` |
| "1080p로" | `resolution` / `mode` / `quality` |
| "지시를 정확히 따라라" | `cfg_scale` |
| "컷이 세 번 바뀌고…" | `multi_shots` + `multi_prompt` |
| "이 이미지로 시작해서 저 이미지로 끝나게" | `start_image` / `end_image` 미디어 롤 |

네거티브는 이 플랫폼의 **이미지·영상 생성 모델에는** 파라미터가 없다(2026-07-25 로스터 전수 확인, 3D 계열 `tripo_3d` 제외). 배제는 `wall, frame` 같은 명사 나열로 본문에 쓰고 `no walls` 같은 부정문은 쓰지 않는다. `negative_prompt` 파라미터를 가진 다른 엔진에서는 그 파라미터를 쓴다.

image-to-video에서는 입력 이미지를 재묘사하지 말고 변화·동작·오디오만 적는다. 본문은 화면 행동·환경·분위기·오디오에 집중한다.

## 이미지 슬롯 기본값

| 레인 | 빈 슬롯 기본값 |
|---|---|
| IMAGE | 피사체는 요청 명사·소재, 컷타입은 요청 용도로 채운다. 비율은 포스터 세로·배너/덱 16:9·SNS 1:1 관례에서 고르되 **선택한 모델의 `aspect_ratios` 안**에서 고른다(2:3·4:5는 모델마다 있고 없다). **배열이 비어 있으면 비율을 넘기지 않고 입력 이미지·모델 기본값을 따른다**([surfaces.md](surfaces.md) §2). 정확한 렌더 카피는 질문 후보이고 텍스트 없는 컷은 생략한다. |
| COMPOSITE | 원본 이미지는 필수다. 재조명 다이얼이 없으면 B, 배경 무드가 없으면 원본 조명과 어울리는 로케이션 하나를 가정한다. |
| 영상 | 씬 길이는 모델 `duration` 허용값 중 요청에 가장 가까운 값. 오디오 미지정이면 대사·SFX가 스토리보드에 있을 때만 켠다. |
| DESIGN | 방향은 제품 도메인에서 저위험 하나를 가정으로 선언하고, 하드 제약은 저장소 증거에서 채운다. |
