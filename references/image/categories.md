이미지 카테고리 패턴 소관: 텍스트·구조 이미지 레인 프롬프트의 C1~C12 컷타입·기본 AR·필수 디테일·공통 DNA를 고른다. 우선순위: lanes.md §레인 게이트 카드가 이 파일보다 우선.

# 카테고리 패턴 — C1~C12

철칙: `compiler.md`. 이 파일은 철칙 전문을 반복하지 않는다. 표현은 긍정형 기본 + 티어 화이트리스트만 쓴다. 장면 배제는 "텍스트 없음"·"여백"처럼 원하는 상태로 쓰고, 텍스트 렌더 가드와 화보 컴플라이언스 페어는 `compiler.md`의 티어 규칙을 따른다.
이 파일의 `기본 AR`은 표면 판정 이후의 후보다. S1 기계 계약은 `contracts/v1/*.schema.json`의 enum, S2는 모델의 `aspect_ratios`, S1-legacy는 [production.md](production.md) §2가 최종 판정한다([surfaces.md](surfaces.md) §1·§2).

## 공통 시각 DNA

| 축 | 기본값 |
|---|---|
| 시스템 톤 | 플로팅 라벨 + 헤어라인 리더선 / HEX 정밀 팔레트 / 재질 매크로 / softbox + rim light / 매거진 여백 |
| 웜 아이보리 | `#F7F4EC` · `#B76E79` |
| 월해 다크 | `#0F1D30` · `#1E3A5F` · `#B76E79` |
| 테크 뉴트럴 | `#F2F3F5` · `#11151A` · `#3B82F6` |
| 참조 성격 | 패션 에디토리얼은 persona DNA·Lens character·Director signature·Film 3파트를 결합하고, 카메라·조명은 결과 기반 어휘로 쓴다. |

## 발전: 카테고리 선택 결정트리

| 요청 명사/신호 | 1차 매핑 | photoreal | 확장 규칙 | 틀린 선택 / 맞는 선택 |
|---|---|---|---|---|
| 화보, 룩북, 착장, 모델, 글래머 | C1 | y | 단독 인물 화보면 포맷 B, 의상 도감·룩북이면 포맷 A | 텍스트 포스터로 처리하면 틀렸고, 인물/의상 슬롯을 먼저 채우면 맞다. |
| 스킨케어, 립, 크림, 세럼, 물방울 | C2 | y | 제형·피부 접점·패키지 표면을 필수화 | 제품명만 크게 쓰면 틀렸고, 제형 물리를 보이면 맞다. |
| 포스터, 행사, 전시, 메뉴, 카피 중심 | C3 | n | 정확 한글 카피·타입 위계·여백 시스템 우선 | 배경 일러스트만 만들면 틀렸고, 읽히는 타이포가 주연이면 맞다. |
| 제품 설명, 분해도, 콜아웃, 비교 | C4 | y | 중앙 제품·리더선·부품명·스케일 관계 | 광고 컷이면 틀렸고, 도감 구조면 맞다. |
| 캠페인, 런칭, 향수, 커버 | C5 | y | 히어로 1개 + 타이포 시스템 1개 | 소품을 여러 개 주연화하면 틀렸고, 하나의 캠페인 키비주얼이면 맞다. |
| 인포그래픽, 플로우, 차트, 구조도 | C6 | n | 복잡하면 단순화 금지. 노드·연결·수치를 문장화 | 카드 4개로 도망치면 틀렸고, 복잡도를 유지하면 맞다. |
| 카드뉴스, 썸네일, 캐러셀, 팁 | C7 | n | 커버는 상단 40% 헤드라인 + 3D 히어로 오브젝트 | 여백형 잡지 컷이면 틀렸고, 피드에서 읽히는 밀도면 맞다. |
| 브랜드 목업, 패키지, 쇼핑백, 간판 | C8 | y | 가상 브랜드명·인쇄 마감·표면 재질 | 실재 상표 모방이면 틀렸고, 가상 브랜드 시스템이면 맞다. |
| 아이콘, 앱아이콘, 이모지, 클레이 | C9 | n | 단일 오브젝트/세트 개수·재질·베벨·그림자 | 글자가 들어가면 틀렸고, 형태와 재질만으로 읽히면 맞다. |
| 만화, 웹툰, 패널, 말풍선 | C10 | n | 통합 페이지 A 또는 컷 단위 생성 B 중 선택 | 패널 수가 빠지면 틀렸고, 컷별 비트가 있으면 맞다. |
| 키아트, 티저, 드라마, 영화 포스터 | C11 | y | negative space·장르 광 레시피·하단 1/8 밴드 | 제목 공간이 없으면 틀렸고, 타이틀 트리트먼트 자리가 있으면 맞다. |
| PPT, 발표자료, 덱, 슬라이드 | C12 | n | 덱 DNA 블록을 전 슬라이드에 반복 | 매 장 스타일이 흔들리면 틀렸고, DNA 블록이 고정되면 맞다. |

## C1 패션

| 항목 | 내용 |
|---|---|
| 컷타입 | `levitation_catalog` · `ghost_mannequin` · `flatlay_spec` · `lookbook_model` · `runway_motion` · `editorial_poster` |
| 기본 AR | 룩북/제품 전신 `3:4`, 플랫레이 `1:1`, 포스터 `4:5` |
| 필수 디테일 | 의상 순서·핏·원단·액세서리 배치·바디/마네킹 노출, 카탈로그 요청이 있으면 라벨 |
| 패턴 | `Scene / Camera / Lighting / Color grading / Texture/Medium / Text-in-image / AR` |
| 특수 라우팅 | 단독 인물 화보(글래머 에디토리얼)는 포맷 B. 플랫 콤마형 단문, 슬롯 12종, Tier-2 문구를 적용한다. |

판정: 옷의 순서·핏·원단이 빠지면 틀렸고, 착장 구조가 한눈에 읽히면 맞다.

## C2 뷰티

| 항목 | 내용 |
|---|---|
| 컷타입 | `texture_swatch` · `water_droplet` · `splash_flow` · `powder_burst` · `cream_smear` · `hero_glow` · `ingredient_macro` |
| 기본 AR | `1:1` 또는 `3:4` |
| 필수 디테일 | 제형 질감·물방울/스플래시 물리·패키지 표면·피부/제품 접점·매크로 재질 반응 |
| 빛/표면 | 클린 스튜디오광·반사·성분 매크로. 하이라이트 `#FFFFFF`는 하얗게 날아가지 않게 제어한다. |

판정: 제품만 세워두면 틀렸고, 제형이 손끝·피부·표면에서 물리적으로 보이면 맞다.

## C3 한국어 포스터

| 항목 | 내용 |
|---|---|
| 컷타입 | `film_poster` · `typographic_minimal` · `event_promo` · `cafe_menu` · `exhibition` · `retro_korean` · `drama_poster` · `editorial_quote` |
| 기본 AR | `4:5` 또는 `2:3`, 모바일 포스터 `9:16` |
| 필수 디테일 | 정확한 한글 타이틀·부제·장소/시간 메타(요청 시)·여백 시스템·타입 위계·또렷한 텍스트 |
| 항상 추가 | `모든 텍스트는 한 번씩만, 완벽히 또렷하게.` |

판정: 이미지가 예뻐도 카피가 안 읽히면 틀렸고, 타이틀→부제→메타 순서가 보이면 맞다.

## C4 제품 도감

| 항목 | 내용 |
|---|---|
| 컷타입 | `exploded_view` · `hero_callout` · `cutaway` · `comparison_grid` · `blueprint` · `lineup_family` |
| 기본 AR | `3:4`, 가로 비교 `16:9` |
| 필수 디테일 | 제품 중앙·콜아웃 라벨·헤어라인 리더선·부품명·단면 재질·스케일 관계. 제품명/라벨은 보이는 면에 단독 배치하고 리더선·소품이 가리지 않게 한다 |
| 도감 언어 | 헤어라인 리더선, 플로팅 라벨 박스, 블루프린트 그리드, 분해 레이어 |

판정: 광고 사진처럼 보이면 틀렸고, 부품과 구조를 설명하는 도감이면 맞다.

다장 제품 컷(멀티컷/컬러웨이/인벤토리) 요청이면 [product-multicut-consistency.md](product-multicut-consistency.md)를 참조한다.

## C5 캠페인 포스터

| 항목 | 내용 |
|---|---|
| 컷타입 | `fashion_campaign` · `beauty_campaign` · `cosmetic_launch` · `perfume_campaign` · `lookbook_cover` |
| 기본 AR | `4:5`, 에디토리얼 포스터 `2:3` |
| 필수 디테일 | 히어로 제품/모델·캠페인 타이틀·서포팅 라인·브랜드형 비주얼 방향·여백 통제. 주변 소품은 히어로보다 낮은 대비·작은 면적으로 종속시키고, 라벨 가독성·반사·접지 그림자를 명시한다 |
| 밀도 | 히어로 하나 + 타이포 시스템 하나로 정리한다. 과밀하게 만들지 않는다. |

판정: 모든 요소가 주연이면 틀렸고, 히어로 하나가 캠페인을 대표하면 맞다.

## C6 인포그래픽

| 항목 | 내용 |
|---|---|
| 컷타입 | `poster_dense`(기본) · `flow_process` · `cutaway` · `diagram_vertical` · `layered_stack` · `cycle_loop` · `diagram_horizontal` · `comparison` |
| 기본 AR | 세로 `2:3`, 가로 `16:9` |
| 필수 디테일 | 섹션 수·읽기 순서·라벨·아이콘/다이어그램·데이터 위계 |
| 위계 | 핵심 메시지 1개를 압도적으로 크게, 나머지는 계단식 축소. 시선은 큰 것→작은 것 순서로 흐르게 만든다. |
| 명시 레이아웃 | 번호 섹션 밴드, 화살표, 컬럼, 적층 레이어, 중앙 다이어그램, 측면 콜아웃 |

### C6 밀도 2모드

| 모드 | 사용 조건 | 작성법 |
|---|---|---|
| **포스터형 `poster_dense` 기본** | 기본값 | 섹션 밴드 4~6개 + 섹션마다 번호·헤더. 셀마다 아이콘/미니 일러스트. **히어로 요소 1개**(실사급 렌더 — 김 나는 컵, 단면 등)를 상단 또는 중앙에 둔다. 장식 막대·게이지·미니 지도·비교표를 보조로 깔아 밀도를 채운다. 배경은 종이·크라프트·빈티지 등 질감 있는 톤. **품질 축과 해상도 축을 선택 표면이 실제로 제공하는 값 안에서 올린다** — 한글 정확도가 캔버스 픽셀 높이에 비례한다는 실측이 근거이고, 특정 픽셀값 지시가 아니다. 표면 판정과 값 소관은 [surfaces.md](surfaces.md), S1 기계 계약 enum은 `contracts/v1/*.schema.json`, S1-legacy 벌크 값은 [production.md](production.md) §2가 정본이다. 이 파일은 값을 다시 정의하지 않는다. |
| **플로우형** | 요청이 단계/순서를 명시할 때만 | 3~5스텝 전용. 라운드 카드 + 화살표. 미니멀 플로우로 도망치면 맨입력보다 못해진다(실측: 4카드 플로우는 나이브 고밀도 컷에 짐). |

### C6 복잡 도표 돌파 전술

어려운 도표도 단순화로 도망치지 말고 정면 시도한다. 요청이 복잡하면 프롬프트도 그 복잡도를 담는다.

| 전술 | 작성법 |
|---|---|
| 연결을 문장으로 그린다 | 노드마다 위치를 좌표처럼 박는다(상단 중앙·좌측 컬럼 둘째 등). 화살표는 출발→도착·스타일·라벨까지 명시한다. 예: `labeled arrow from the X node curving down to the Y node`. 연결이 많을수록 더 구체화한다. |
| 수치는 이중 앵커 | 숫자를 큰 타이포로 따옴표 고정 + 막대·게이지·파이는 그 수치의 비율감이 눈에 보이게 지시한다. 예: `bar filled to roughly 38 percent`. 타이포가 정확도를 맡고 도형이 직관을 맡는다. |
| 핵심 라벨만 고정 | 핵심 라벨은 따옴표 고정, 셀 디테일은 `every cell filled with genuine short Korean caption sentences, fully written in real hangul`로 자유 작성한다. 밀도를 깎지 않고 정확도만 배분한다. |
| 재시도는 축 변경 | 결과가 무너지면 ① 레이아웃 지시 구체화 ② 해상도·품질 축을 표면 최상단으로 상향([surfaces.md](surfaces.md)) ③ 클러스터별 컷 분할. 복잡도는 유지하고 캔버스만 분할한다. 도표 포기는 선택지가 아니다. |

### C6 유형별 돌파 레시피 7종

| 유형 | 문법 |
|---|---|
| 분기 플로우차트 | 그리드를 먼저 선언하고 노드를 좌표로 배치. `three-column flowchart grid, decision diamond at center column second row`. 분기 화살표는 라벨 포함: `"YES" labeled arrow branching right, "NO" labeled arrow continuing down`. |
| 다대다/네트워크 | 허브-스포크로 뭉개지 않는다. 연결 수를 세어 박는다: `seven distinct labeled connection lines`. 교차 지점은 `crossing lines drawn with small bridge gaps at intersections`. 노드 배치는 원형/격자 중 하나를 명시한다. |
| 계층도/조직도/적층 | 층 수와 층별 노드 수를 전부 선언한다. `three-tier hierarchy: one box on top tier, three on middle, five on bottom, connecting lines between tiers`. 적층은 `exploded layered stack, each layer floating with side label`. |
| 사이클 | 방향·스텝 수·화살표 곡률을 쓴다. `five-step circular cycle running clockwise, curved arrows between adjacent steps, step numbers inside each node`. |
| 단면/해부 | 리더선 + 번호 콜아웃. `numbered leader lines from each internal part to callout labels on the side margin`. 내부 부위 수를 명시해 라벨 개수를 고정한다. |
| 비교표 | 열 수·행 수·헤더를 선언하고 셀은 자유 작성 존으로 둔다. `two-column comparison table with four rows, bold header band, every cell filled with genuine short Korean caption sentences`. |
| 정밀 데이터 차트 | 축·눈금·시리즈를 문장으로 그린다. `vertical bar chart, y-axis gridlines labeled 0/25/50/75/100, four bars of visibly different heights` + 각 값은 막대 위 숫자 라벨로 따옴표 고정. 눈금 숫자까지 정확해야 하면 그 숫자들도 따옴표 카피에 포함한다. |

### C6 고밀도 텍스트 슬라이드 실측

(2026-07 실측, 40컷 검증): 슬라이드당 렌더 한글 **400~800자도 정면 가능**하다. "gpt-image-2는 도해를 못 그린다"는 반증됨.

| 레버 | 내용 |
|---|---|
| 캔버스 세로 높이 | 텍스트 정확도의 1차 레버. 초와이드 21:9는 400자에서 글자가 작아져 뭉개진다. 텍스트가 빽빽하면 16:9(세로 실측 950px 전후)·2:3·1:1로 세로를 확보한다. **아래 정규화 동작은 S1-legacy 벌크 러너 한정이다**(사이즈 락 6종 정본: [production.md](production.md) §1, 표면 판정은 [surfaces.md](surfaces.md), 경로 구분은 [compiler.md](compiler.md) §5): 6종 밖의 초와이드 비율은 러너가 최근접 프리셋으로 정규화하므로 정확도는 6종 안의 세로 확보 비율 선택으로 번다. 다른 표면에서는 그 표면이 허용하는 비율 집합(S1은 스키마 `ar` enum, S2는 모델의 `aspect_ratios`) 안에서 세로가 가장 큰 값을 고른다. |
| 자유 작성 존 | 크리티컬 라벨(제목·섹션 헤더)만 따옴표 고정, 나머지는 `each card contains a bold Korean title plus two to three sentences of genuine Korean explanatory text, densely filled, fully written in real hangul, every caption is a real sentence carrying real meaning`. 모델이 개념적으로 맞는 설명을 스스로 채운다. placeholder 금지는 부정문 대신 `all text lines fully written out as complete hangul words`로 쓴다. |
| 완벽주의 해제 | 소규모 오탈자·간헐 뭉개짐을 허용하면 슬라이드당 20~30개 텍스트 블록을 채울 수 있다. 이 밀도에서 중간중간 뭉개진 컷·소규모 오탈자는 정상 산출이다. 치명 카피만 따옴표로 지키고 나머지는 자유 존에 맡긴 뒤, 걸리는 컷만 재생성한다. 후처리 합성 금지. |

## C7 카드뉴스
C7은 팁·요약·캐러셀 같은 **정보성 후킹** 전용이다. 제품·브랜드·패션의 디자인 홍보물은 C7 밀도 문법을 쓰지 않고 [promo-router.md](promo-router.md)에서 C3/C5 `promo_poster` + P1~P8 하나로 분기한다.

| 항목 | 내용 |
|---|---|
| 컷타입 | `sns_cover`(기본) · `sns_content` · `tip_card` · `viral_hook` · `qna_card` · `list_card` · `editorial_cover` · `editorial_content` |
| 기본 AR | `1:1`, 세로 에디토리얼 카드 `2:3` |
| 정확 카피 | 헤드라인 + 서브 2~3개까지 따옴표 고정. 배지·칩 속 짧은 단어는 오탈자 허용 존 |
| 에디토리얼형 | 여백·매거진 톤 요청이 명시될 때만 쓴다. |

### C7 SNS 썸네일 문법 — `sns_cover` 기본

피드에서 멈추게 하는 건 여백이 아니라 밀도다(실측: 매거진 여백형은 나이브 고밀도 컷에 짐).

| 요소 | 작성법 |
|---|---|
| 헤드라인 | 초대형 헤드라인이 상단 40% 이상. 핵심 키워드는 색 교체·형광 하이라이트·박스 반전으로 분리한다. |
| 배경 | 2톤 색 블로킹(밝은 필드 + 딥 톤 바닥) 또는 두꺼운 프레임 밴드. 브랜드 팔레트 3색 고정. |
| 히어로 | 3D 입체 히어로 오브젝트 1개(soft clay/plastic 렌더) + 주제 소품 3~5개(동전·계산기·영수증 류)를 하단 존에 둔다. R축 "눈이 여기저기 튀어다니는" 드롭인과 결합해 볼거리 밀도를 확보한다. |
| 강조 장치 | 리본 밴드 · 스티커 칩 · 넘버 뱃지 · 체크리스트 미니카드 · 말풍선 배지 · 스파클 중 2~3개를 배치한다. |
| 캐러셀 신호 | 하단 페이지 인디케이터 점 3개 또는 `→` 신호. |
| 본문 카드 | `sns_content`는 커버보다 밀도 한 단계 낮춘다. 타이틀→불릿 2~3개→미니 일러스트의 읽기 위계, 텍스트 존/그래픽 존 분리. |

판정: 피드에서 텍스트가 작으면 틀렸고, 상단 40% 헤드라인과 하단 히어로가 즉시 읽히면 맞다.

## C8 브랜딩 목업

| 항목 | 내용 |
|---|---|
| 컷타입 | `food_pkg` · `cosmetic_pkg` · `stationery_set` · `signage` · `app_icon_mockup` · `shopping_bag` · `brand_flatlay` · `label_tag` |
| 기본 AR | `1:1` · `2:3` · `16:9` |
| 필수 디테일 | 브랜드명·로고/라벨 배치·기재 재질·인쇄 마감·목업 표면·상업 사진 |
| 마감 | 종이·포일·유리·플라스틱·패브릭·엠보싱·무광/유광 마감 명시 |

판정: 브랜드명이 실재 상표처럼 보이면 틀렸고, 가상 브랜드의 재질·인쇄 체계가 보이면 맞다.

## C9 3D 아이콘

| 항목 | 내용 |
|---|---|
| 컷타입 | `ui_component` · `clay_object` · `icon_set` · `app_icon` · `isometric_scene` · `glass_icon` · `emoji_3d` · `logo_mark` |
| 기본 AR | `1:1`, 아이콘 프레젠테이션 시트 `2:3` |
| 필수 디테일 | 단일 오브젝트 또는 세트 개수·재질·베벨·그림자·배경 그라데이션, 텍스트 없음(텍스트 요청이 있을 때만 예외) |
| 강한 마무리 | `단일 앱 아이콘, 텍스트 없음. AR 1:1` |

판정: 설명 문구에 기대면 틀렸고, 형태·베벨·재질만으로 기능이 읽히면 맞다.

## C10 만화

| 항목 | 내용 |
|---|---|
| 컷타입 | `dynamic_irregular` · `page_grid` · `page_4koma` · `strip_vertical` · `splash_page` · `splash_inset` · `action_spread` · `page_12cut` |
| 기본 AR | 페이지 `2:3`, 세로 웹툰 `9:16`, 4컷/그리드 `1:1`, 액션 스프레드 `16:9` |
| 필수 디테일 | 장르·퍼블리케이션 품질·패널 수·거터·읽기 방향·컷별 비트·말풍선/SFX·잉킹/컬러 스타일 |
| 패턴 | 오프닝 미디엄 문장 → 레이아웃 문장 → 컷 시퀀스 → 화풍 문장 → 팔레트 문장 → 텍스트 가독 문장 → `AR` |
| 대사 | 한글 대사 4~10자, 컷당 말풍선 1~2개. 다컷은 표면 조건화([surfaces.md](surfaces.md): S1-legacy 벌크면 quality high·2048, S1·S2·S3는 [surfaces.md](surfaces.md)의 표면별 정책 참조) |

### C10 두 전략

| 전략 | 사용 조건 | 작성법 |
|---|---|---|
| **A. 멀티패널 통합 1페이지** | 캐릭터 일관성이 우선 | 표면 조건화([surfaces.md](surfaces.md): S1-legacy 벌크면 quality high·2048). 컷마다 `카메라앵글+장면+감정`. establishing→close-up→reaction. 감정 피크 1회·마지막 회수. 다이나믹 레이아웃(사선거터·broken-border·cross-panel·비정형컷) 40%+. |
| **B. 컷 단위 생성 후 조판** | 정밀 통제가 우선 | 1컷=1호출. persona 블록 반복. "프레임 안엔 인물 한 명, 단독 포트레이트" 긍정 단언. |

한국 웹툰(S07): soft cel shading · glossy K-beauty lips · dewy blush · vertical-scroll · 3:4/4:5.

판정: 스토리 순서가 안 보이면 틀렸고, 패널별 비트와 감정 피크가 보이면 맞다.

## C11 시네마틱 키아트

| 항목 | 내용 |
|---|---|
| 컷타입 | `teaser_keyart` · `character_one_sheet` · `ensemble_montage` · `vista_wide` · `poster_2x3` |
| 기본 AR | `16:9`, `3:2`, 포스터는 `2:3` (픽셀값은 표면별: [surfaces.md](surfaces.md) S1 기계 계약→스키마 enum, S1-legacy→production.md §11 사이즈락 6종 안에서, S2→모델 정의, S3→UI 라벨) |
| 언어 | 영문 포맷 A 사용. 라벨 6섹션 그대로, 본문은 영어. 시네마틱 어휘 밀도가 영어에서 높다. |
| 필수 공간 | 타이틀 트리트먼트용 negative space 확보(상단 밴드 또는 중앙 여백을 Scene에 명시), billing-block 대비 하단 1/8 클린 밴드 |
| 타이틀 렌더 | 실제로 렌더할 때는 롤 블록(headline/billing) 적용, Tier-1 결합 공식 1회 |
| 캐릭터 구성 | 캐릭터 원시트는 단독 인물 + contrapposto + rim 분리. 앙상블 몽타주는 크기 위계(주연 대형·조연 중형·배경 비스타)를 명시. |

### C11 장르별 광 레시피

| 장르 | 레시피 |
|---|---|
| 네온 사이버펑크 | practical neon glow, teal&orange, wet reflective street |
| 스릴러 저조도 | low key, hard rim, deep shadow pools |
| 판타지 골든 | golden hour volumetric light, warm haze |

판정: 제목을 얹을 자리가 없으면 틀렸고, negative space와 하단 1/8 밴드가 있으면 맞다.

## C12 프레젠테이션 / 슬라이드 덱

| 항목 | 내용 |
|---|---|
| 컷타입 | `cover_slide` · `agenda_slide` · `section_divider` · `content_slide` · `data_slide` · `quote_slide` · `closing_slide` |
| 기본 AR | `16:9` **덱 전체 고정** (픽셀값은 표면별: [surfaces.md](surfaces.md) S1 기계 계약→스키마 enum, S1-legacy→production.md §11 사이즈락 6종, S2→모델 정의), 밀집 콘텐츠 슬라이드는 표면별 품질 조건 ([surfaces.md](surfaces.md)) |
| 필수 디테일 | **덱 DNA 블록** — 배경·팔레트 HEX·타이포 계열·장식 모티프를 한 문장으로 묶어 전 슬라이드에 동일 문구로 반복한다. 시리즈 일관성의 핵심이며, C10 A전략의 화풍 문장과 같은 원리다. |
| 바뀌는 것 | 슬라이드마다 레이아웃·카피·비주얼만 바꾼다. |
| 텍스트 예산 | 슬라이드당 텍스트 블록 **4개 이하**(타이틀 + 불릿 2~3). 본문은 문장 대신 짧은 구 단위. 문장형 본문은 오탈자율이 뛴다. 소규모 오탈자 허용 전제로 운용하고, 크리티컬 카피만 따옴표 고정한다. |
| 1행 원칙 | 1행 = 1슬라이드 = 1호출. 덱은 jsonl 챕터로 관리한다. 렌더 텍스트가 항상 있으므로 기본 Tier-1 승격 후보(텍스트 블록 3개+ 조건). |
| 룩 | 룩 프리셋 1개를 골라 덱 DNA 블록에 인라인한다. |

### C12 레이아웃 패턴

| 타입 | 문법 |
|---|---|
| `cover` | 타이틀 밴드 + 풀블리드 비주얼 |
| `content` | 좌 텍스트 컬럼 + 우 비주얼, 또는 상하 분할 |
| `data` | 큰 숫자 타이포 중심 + 비율감 도형. C6 돌파 전술 준용 |
| `divider` | 섹션 번호 + 한 줄 타이틀, 여백 위주 |

판정: 슬라이드마다 다른 브랜드처럼 보이면 틀렸고, 덱 DNA 블록이 반복되어 한 세트로 보이면 맞다.
