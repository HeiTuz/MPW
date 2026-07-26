# 이미지 타이포그래피·레이아웃

**운영 정본:** 렌더 텍스트가 있는 컷(C3 포스터·C4 도감 라벨·C6 인포그래픽·C7 카드뉴스)은 이 파일을 먼저 적용한다. 긍정형·결과 서술 원칙과 예외 관리는 **철칙: compiler.md**를 참조한다.


**클리어존 규칙 (2026-07 실측).** 롤 라벨마다 카피 주변 클리어존을 함께 선언한다 — 위치·크기만 지정하면 장면 요소(전구 스트링·소품·패턴)가 글자를 관통해 가독성이 깨진다. 예: `headline "봄밤 야시장" — 상단 중앙, 주변은 하늘 단색 클리어존, 장식 요소 배치 없음`. 실측: 클리어존 미선언 서브헤드가 알전구 줄과 겹쳐 가독 저하, 헤드라인(여백 확보)은 완벽 렌더.

## 1. 영역 문법

### 1.1 3×3 그리드

| KO | EN 토큰 | KO | EN 토큰 | KO | EN 토큰 |
|---|---|---|---|---|---|
| 좌상 | `top-left corner` | 상중 | `top-center` | 우상 | `top-right corner` |
| 중좌 | `middle-left` | 정중앙 | `dead center` | 우중 | `middle-right` |
| 좌하 | `bottom-left corner` | 하중 | `bottom-center` | 우하 | `bottom-right corner` |

### 1.2 밴드 시스템

| 영역 | EN 토큰 | 용도 |
|---|---|---|
| 상단 1/3 타이틀 밴드 | `title band occupying the top third` | 포스터 headline, 이벤트명 |
| 중앙띠 | `central horizontal band across the middle` | 메시지·제품·주요 도형 |
| 하단 캡션 밴드 | `bottom caption band` | 날짜·장소·가격·주석 |

### 1.3 세이프에어리어·여백·정렬

| 항목 | 토큰 |
|---|---|
| 가장자리 마진 | `clear margin of ~5% on all edges` |
| 헤드라인 호흡 | `generous negative space around the headline` |
| 중앙 정렬 대칭 | `centered symmetrical composition` |
| 좌측 정렬 | `left-aligned ragged-right text block` |
| 저스티파이 | `justified text block, even left and right edges` |

### 1.4 드롭인 예시

| 목적 | 드롭인 |
|---|---|
| 상단 타이틀 | `headline "겨울, 서울" centered in the title band occupying the top third, generous negative space around the headline` |
| 하단 일정 | `caption "2026.01.10 - 02.28" in the bottom caption band, left-aligned ragged-right, clear margin of ~5% on all edges` |
| 배지·가격 | `small badge in the top-right corner, price callout at middle-right` |

| 실측 | 결과 |
|---|---|
| v2 실험 C | 영역 문법은 전 패턴에서 느슨한 서술 이상. 밴드 P1 5.0 vs 4.5, 캡션밴드·3x2 그리드 동률 만점. 서브 영역 정밀 준수(테두리 마진·좌측 정렬 축자 이행)에서 우세. 확정 채택. |

## 2. 롤 라벨 블록

카피 2개 이상이면 각 블록에 롤 이름을 먼저 붙이고 따옴표 카피를 뒤에 둔다. `headline "…", subhead "…"` 패턴은 위계 임의 배분을 줄이고 검증기 `W-TEXT-ROLE`을 회피한다.

| 롤 | 크기 위계 언어 | 추천 영역 |
|---|---|---|
| headline | `dominant headline, roughly one-third of canvas width` | 상단 1/3 타이틀 밴드 |
| subhead | `subhead at half the headline size` | headline 바로 아래, 같은 정렬 |
| callout | `small floating label with a hairline leader line` | 중좌/우중, 제품 주변 |
| caption | `small caption text` | 하단 캡션 밴드 |
| badge | `compact pill-shaped badge` | 우상 코너 |
| CTA | `button-style CTA, high-contrast fill` | 하중 |

| 목적 | 드롭인 |
|---|---|
| 헤드라인+서브 | `headline "국물의 계절" dominant, roughly one-third of canvas width; subhead "12월 한정 메뉴" at half the headline size, directly below` |
| 제품 콜아웃 | `callout "320g" as a small floating label with a hairline leader line to the jar, middle-right` |
| CTA | `CTA "지금 예약" as a button-style pill at bottom-center, white text on #B76E79` |

## 3. 폰트 어휘 KO+EN

폰트명과 상표 서체명을 쓰지 않고 계열+성격으로 서술한다. 상표 관련 원칙은 **철칙: compiler.md**를 참조한다.

| KO 계열 | EN 토큰 |
|---|---|
| 명조/세리프 | `bold serif`, `high-contrast didone`, `elegant thin serif` |
| 돋움/고딕/산세리프 | `clean geometric sans-serif`, `modern grotesque sans` |
| 콘덴스드 | `condensed sans-serif, tall narrow letterforms` |
| 매거진 마스트헤드 | `oversized high-contrast serif, magazine masthead scale` |
| 캘리그래피/손글씨 | `Korean brush calligraphy`, `casual handwritten script` |
| 모노스페이스 | `monospace, typewriter character` |

| 속성 | 허용 토큰 | 적용 |
|---|---|---|
| Weight | `hairline` / `light` / `medium` / `bold` / `black` | `얇게` 대신 weight 단어 사용 |
| 케이스 | `ALL CAPS` / `Title Case` / `all lowercase` | 영문 카피에만 적용 |
| 자간 | `wide letter-spacing` / `tight kerning` | 한글 타이틀은 `wide letter-spacing` 궁합 우세 |
| 텍스트 색 | `headline in #0F1D30 on a #F7F4EC field` | HEX로 고정 |

| 드롭인 예시 |
|---|
| `headline "설맞이 특가" in bold high-contrast didone serif, black weight, wide letter-spacing, #1E3A5F` |
| `subhead in light geometric sans-serif, ALL CAPS, tight kerning, #B76E79` |
| `headline in oversized high-contrast serif, magazine masthead scale, black type on white` |

**매거진 마스트헤드.** 얇은 획과 굵은 획의 큰 대비가 사진 위에 잡지 표지급 권위를 만든다 — 커버·배너·에디토리얼 레이아웃에 쓴다. 정확한 색을 고정해야 하면 `black type on white`를 위 텍스트 색 규칙대로 HEX로 치환한다.

## 4. 정확 문자열 프로토콜

| 번호 | 규칙 | 실패 코드·주의 |
|---|---|---|
| 1 | 정확한 문구는 반드시 `text reads "오늘 더 따뜻해요"`처럼 따옴표 안에 둔다. | 같은 카피 2회 쓰면 2회 렌더, `E-TEXT-DUP`. |
| 2 | 오탈자 민감 카피에는 `verbatim, no extra characters`를 붙인다. | Tier-1 승격 조건에서만 사용한다. |
| 3 | 한글 스펠아웃 금지. 하이픈 풀어쓰기(`"붉-은 벽-돌"`)는 하이픈이 글자로 렌더된 실측 사고가 있다. | v2 실험 A: 고스트 하이픈 7개. |
| 4 | 한 따옴표 문자열 안 KO+EN 혼합 금지. | `W-TEXT-MIXLANG`. |
| 5 | 렌더 라벨에는 실제 문구만 둔다. | `[TITLE]`·`{상품명}`은 그대로 렌더, `E-SLOT-LEAK`. |
| 6 | 한글은 로마자 변환 금지. | `render the Hangul characters exactly as given`을 쓰고 `gyeoul`식 로마자 지시를 쓰지 않는다. |

### 4.1 언어 라벨 분리

| 언어 | 드롭인 |
|---|---|
| Korean | `Korean text: "겨울 세일"` |
| English | `English text: "WINTER SALE"` |

## 5. Tier-1 가독 가드

### 5.1 기본값

렌더 텍스트가 있는 모든 컷에 Tier-0 긍정형 기본값 1줄을 1회 넣는다.

```text
모든 텍스트는 한 번씩만, 완벽히 또렷하게
```

### 5.2 Tier-1 승격 시 방출 규칙

Tier-1 결합 공식과 화이트리스트의 정본은 [compiler.md](compiler.md) §2 철칙 2다. 이 파일은 값을 복제하지 않고 아래 승격 조건만 소유한다.

### 5.3 승격 조건

| 조건 | 예 |
|---|---|
| 텍스트 블록 3개 이상 | headline+subhead+caption+badge |
| KO/EN 혼합 카피 | 한글 타이틀 + 영문 태그라인 |
| 실패 후 재시도 | 중복 렌더·유령 글리프 나온 컷 리트라이 |
| 밀집 텍스트 산출물 | 카드뉴스 본문 · 인포그래픽 · 도감 라벨 |

| 유효 조건 | 오류 |
|---|---|
| 프롬프트에 렌더 텍스트(따옴표 카피/Text-in-image)가 실제로 있을 때만 사용 | 텍스트 없음 + 사용 = `E-NEG-TIER` |
| jsonl `tier: 1` 또는 러너 `--tier 1` 선언 필요 | 티어 선언 없음 + 화이트리스트 사용 = `E-NEG-TIER` |

## 6. 그리드·멀티패널

철칙 예외 관리는 **철칙: compiler.md**를 참조한다. 그리드는 단일 산출물 그 자체일 때만 캔버스 내부에서 허용한다.

| 허용 내부 그리드 | 예 |
|---|---|
| C7 카드뉴스 한 장 내부 그리드 | tip 3분할 |
| C10 만화 A전략 멀티패널 통합 1페이지 | 4-panel vertical strip |
| C4 `comparison_grid` | 한 도감 컷 안 비교 매트릭스 |

| 금지 | 처리 |
|---|---|
| 독립 컷 여러 개를 한 캔버스에 배치해 호출 수를 줄이는 방식 | N개 별도 행으로 분리 |

| 그리드 스펙 | 토큰 |
|---|---|
| 3×2 카드 | `3x2 grid of six cards, equal gutters` |
| 4패널 세로 | `4-panel vertical strip, thin white gutters` |
| 2×2 비교 | `2x2 comparison grid with a hairline divider` |

패널마다 `카메라앵글 + 장면 + 감정`을 반복하고, 화풍·팔레트 문장은 그리드 전체에 1회만 둔다.

```text
Panel 1: establishing wide shot, 주인공이 카페 문을 연다.
Panel 2: close-up on her surprised face, 말풍선 "어?"
Panel 3: reaction shot, warm rim light, 말풍선 "왔구나"
```

## 7. 캔버스 크기 레버·밀집 텍스트 페어링

**실측 사실:** 글리프 정확도는 캔버스의 픽셀 높이에 비례한다. v2 실험 A, 2×2×2에서 긴 변 2048 정사각은 한글 카피 전 반복 만점(12/12)이고 실패는 전부 1024에서 발생했다. quality(medium vs high)는 이 실험에서 유의차가 없었다.

**따라서 규칙은 "특정 픽셀값을 쓴다"가 아니라 "해상도 축을 그 표면의 최상단으로 올린다"이다.** 카피 정확도가 크리티컬하면 1~2줄이어도 해상도 축을 먼저 올린다. 표면 판정과 값 소관의 정본은 [surfaces.md](surfaces.md)다.

| 표면 | 해상도 축을 올리는 방법 |
|---|---|
| S1 기계 계약 | 스키마가 제공하는 `size`·`quality` 축에서 목적을 만족하는 값. 구체 enum·매핑은 `contracts/v1/*.schema.json`과 `contracts/validate.py` |
| S1-legacy 벌크 | 벌크 러너가 제공하는 size·quality 값 안에서 올린다. 구체 값은 [production.md](production.md) §2 |
| S2 플랫폼 파라미터 | 선택 모델의 런타임 정의가 실제로 제공하는 `resolution`·`quality`·`mode` 축만 사용하고, 없는 축이나 픽셀 size를 만들지 않는다 |
| S3 붙여넣기 | 파라미터가 없으므로 UI 라벨 줄로 고지하고 본문에는 쓰지 않는다 |

| 텍스트량 | 품질 축 | 해상도 축 |
|---|---|---|
| 텍스트 블록 3개 이상 또는 작은 활자(캡션·라벨·본문) | 선택 표면이 제공하는 최상단 | 선택 표면이 제공하는 최상단 |
| 짧은 카피 1~2줄(타이틀+서브) | 기본값으로 판독 가능하면 유지 | 표면 기본값으로 판독 가능하면 유지 |
| 카드뉴스 본문·인포그래픽·도감 라벨(밀집) | 선택 표면이 제공하는 최상단 필수 | 선택 표면이 제공하는 최상단 필수 |

**S1-legacy 실측·검증기** (`scripts/check_prompt.mjs` 소관, 다른 표면의 권위 아님):

| 실측·검증기 | 값 |
|---|---|
| 긴 변 2048 한글 정확도 | 12/12 |
| 실패 위치 | 전부 1024 |
| 고밀도 렌더 실측 | 한글 400~800자, 40컷 |
| 텍스트 heavy + `quality≠high` | `W-TEXT-QUALITY` |
| 1536 장변 사용 | 1536 장변 6종 안에서 해결 |
| 커스텀 size | 이미지 생성 러너 경로 밖이면 `E-SIZE-LOCK` |

## 8. 한글 렌더 실패 증상 → 교정 레버 순서도

발전 규칙: 실패 후 재시도는 아래 순서만 사용한다. 앞 단계가 적용되지 않는 사유가 있을 때 다음 단계로 간다.

| 순서 | 실패 증상 | 적용 레버 | 조치 | 다음 단계 조건 |
|---|---|---|---|---|
| 1 | 글자 형태가 뭉개짐, 유령 글리프, 획 누락 | 타이포 구체화 | 롤 라벨, 따옴표, 계열+weight+자간+HEX, Tier-1 캐노니컬 결합을 적용한다. | 같은 문자열이 계속 틀리면 2로 이동 |
| 2 | 작은 캡션·라벨·본문이 흐림 | 캔버스 확대 | 해상도 축을 한 단계 올린다 — §7 표대로 표면이 허용하는 다음 티어로(S1-legacy면 1024 장변 → 1536 장변, 정사각 밀집물은 긴 변 2048). | 표면 최상단에서도 실패하면 3으로 이동 |
| 3 | 카피 길이가 레이아웃을 밀어냄 | 카피 축소 | 문장 수와 줄 수를 줄이고 핵심 명사·숫자·날짜만 남긴다. | 정보량을 줄일 수 없으면 4로 이동 |
| 4 | 정보량이 한 컷 용량을 초과 | 컷 분할 | 카드뉴스·인포그래픽을 N행으로 분리하고 각 행은 1개 메시지만 담는다. | 분할 후 각 컷에 1~3단 위계 재적용 |

## 9. 빠른 조립표

| 산출물 | 필수 조합 |
|---|---|
| 한국어 포스터 | 영역 문법 + 롤 라벨 + 폰트 계열 + 따옴표 + 기본 가독 가드 |
| KO/EN 포스터 | 언어 라벨 분리 + Tier-1 + 1536 장변 이상 |
| 도감 라벨 | callout/caption + 2048 우선 + `quality: high` |
| 카드뉴스 본문 | 내부 그리드 + 2048 우선 + 컷 분할 우선 |
| 타이포 아트 | `look-and-concept.md` T축 + Tier-1 + 2048 레버 |
