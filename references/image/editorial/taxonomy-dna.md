# 에디토리얼 패션 — 택소노미·Persona DNA

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

## 4. 패션 스타일 택소노미 21종

명명 규칙: 폴더 `NN_<snake>`, 스타일 ID `STY-NN`, 룩 ID `STY-NN-LMM`. 카탈로그 필드: ID / 슬러그 / 한글명 / 무드 한 줄 / 레퍼런스 인덱스. Tier-2 레인 필수 스타일은 `STY-15 boudoir_editorial`, `STY-17 resort_beach`다. 이 둘은 명시 선언된 Tier-2 컴플라이언스 레인에서만 작성한다.

| ID | slug | 한글명 | 패션 무드 판정문 | Tier |
|---|---|---|---|---|
| STY-01 | minimal_clean | 미니멀 클린 | 절제된 선, 뉴트럴 팔레트, 여백이 제품성을 만든다 | 0 |
| STY-02 | old_money | 올드 머니 | 로고 대신 소재·테일러링·관리된 태도가 계급감을 만든다 | 0 |
| STY-03 | y2k_revival | Y2K 리바이벌 | 글로시 표면, 로우 콘트라스트 팝 컬러, 액세서리 레이어가 시대감을 만든다 | 0/1 |
| STY-04 | streetwear | 스트리트웨어 | 오버사이즈 실루엣, 그래픽 없는 가상 라벨, 도시 질감이 컷을 지배한다 | 0 |
| STY-05 | avant_garde | 아방가르드 | 비대칭 구조와 과장된 볼륨이 신체보다 의상 구조를 앞세운다 | 0/1 |
| STY-06 | vintage_film_90s | 90년대 빈티지 필름 | 저채도, visible grain, 카탈로그식 정면성이 회고적 질감을 만든다 | 0 |
| STY-07 | cyberpunk_neon | 사이버펑크 네온 | practical neon glow와 젖은 반사면이 색 대비를 만든다 | 0/1 |
| STY-08 | cottagecore | 코티지코어 | 자연광, 리넨·면, 부드러운 목가적 배경이 의상 촉감을 만든다 | 0 |
| STY-09 | dark_academia | 다크 아카데미아 | 울·트위드·가죽 제본 톤, 낮은 키 조명이 지적 긴장을 만든다 | 0 |
| STY-10 | kpop_idol | K-pop 아이돌 | 클린 뷰티, 샤프한 헤어, 무대 전 사진 같은 선명도가 중심이다 | 0/1 |
| STY-11 | japanese_mode | 재패니즈 모드 | 블랙 레이어, 비대칭 드레이프, 빈 공간이 형태를 읽게 한다 | 0 |
| STY-12 | parisian_chic | 파리지앵 시크 | 트렌치·셔츠·데님, 낮은 채도의 도시광이 무심한 정제를 만든다 | 0 |
| STY-13 | athleisure_sporty | 애슬레저 스포티 | 기능성 원단의 매트·탄성 질감과 활동 자세가 실루엣을 만든다 | 0 |
| STY-14 | workwear_utility | 워크웨어 유틸리티 | 포켓·스티치·캔버스 질감이 실용적 리듬을 만든다 | 0 |
| STY-15 | boudoir_editorial | 부두아르 에디토리얼 | 라운지웨어를 성인 하이패션 제품 컷으로 읽히게 한다 | 2 필수 |
| STY-16 | bridal_modern | 모던 브라이덜 | 불투명 화이트 소재, 구조적 드레이프, 절제된 의례성이 중심이다 | 0/1 |
| STY-17 | resort_beach | 리조트 비치 | 리조트웨어를 노출이 아니라 소재·레이어·햇빛 반응으로 읽힌다 | 2 필수 |
| STY-18 | corporate_power | 코퍼레이트 파워 | 수트 구조, 견고한 어깨선, 도시 유리 반사가 권위를 만든다 | 0 |
| STY-19 | couture_runway | 쿠튀르 런웨이 | 과장된 실루엣과 공예적 표면이 단일 제품 히어로가 된다 | 0/1 |
| STY-20 | film_noir | 필름 누아르 | low key, split light, 단색 대비가 신비감을 만든다 | 0/1 |
| STY-21 | kpop_editorial_minimal | K-pop 에디토리얼 미니멀 | 아이돌식 정돈된 얼굴광과 미니멀 세트가 병치된다 | 0 |

### 4.1 style_card 한 장 구조

| 블록 | 필수 내용 |
|---|---|
| 정의 한 줄 | 해당 스타일이 다른 20종과 갈리는 기준 1문장 |
| 무드보드 키워드 | 톤·조명·컬러·소재·헤어메이크업 |
| 컬렉션 | 메인+보조 가상 브랜드. 실재 상표 금지 |
| 추천 페르소나 | P-NN 1순위·2순위 |
| 카메라 디폴트 | 바디명보다 결과 기반 lens character, 거리 m, 샷 사이즈 |
| 조명 디폴트 | L-NN, key:fill, 그림자·하이라이트 결과 |
| 컬러 그레이딩 | 필름 시뮬 결과, HEX 3~5 |
| 룩 리스트 | L01~L05 |
| 셀렉트 기준 | 성공/실패 판정문 |
| 꼭 들어갈 디테일 | 소재·마감·포즈·배경 중 해당 스타일 식별 요소 |
## 5. Persona DNA + Gold DNA

### 5.1 Persona DNA 고정 순서

챕터 내 신원 드리프트 0을 목표로, 페르소나 블록은 8룩 전체에서 char-by-char 동일하게 반복한다.

| 순서 | 필드 | 작성 규칙 |
|---|---|---|
| 1 | ethnicity+age | `20대 후반 한국 여성 모델`, Tier-2면 `adult Korean woman in her late 20s, 25+` |
| 2 | hair | 길이·질감·스타일. 예: 낮게 묶은 로우 번, 짧은 웨이브 단발 |
| 3 | eye | 쌍꺼풀·홍채색·눈매. 실존 인물 닮은꼴 금지 |
| 4 | beauty mark | 점 보통 1개. 위치를 1곳으로 고정 |
| 5 | lip finish | matte rose, sheer berry, satin nude 등 표면감 |
| 6 | outfit | 가상 컬렉션, 소재, HEX, 핏/디테일 |
| 7 | background | 배경 HEX, 소품 거리 m |
| 8 | camera distance | 카메라-피사체 거리 m, 샷 사이즈 |

### 5.2 Gold DNA — 367 골드 샘플 공통 규칙

| 축 | 공통 규칙 |
|---|---|
| 카메라 | 중형·필름 바디 선호. 렌즈 빈도 35>50>85>24mm. `Lens character:` 블록(초점거리·평면성·왜곡 적음·배경 분리) = 골드 100/100 필수 |
| 필름/컬러 | Portra·desaturated·teal&orange·CineStill 800T 빈출. Film 3파트 = `[필름] emulation — [스킨], [섀도], [하이라이트]. [매거진] roll-off` |
| 조명 | 결과 어휘로 쓴다. `key:fill X:1` 비율 항상 명시(정본: [photo-vocab.md](photo-vocab.md) §7.2). neon/practical/golden hour/창광 |
| 구도 | 카메라 거리 m 명시, rule of thirds, 포즈는 영문 표기(`contrapposto` 등), `Director signature:` 라인 = 골드 100/100 필수 |
| 무드 | light+color+expression 트리플. 예: `melancholic — desaturated cool, low key, downcast` |
| 페르소나 | ethnicity+age → hair → eye(쌍꺼풀·홍채색) → beauty mark(점 보통 1개) → lip finish → outfit(가상 브랜드+소재+HEX) → 배경 HEX → 카메라 거리 m. 4~7줄 |
| 퀄리티 앵커 | 전부 긍정형: `eye-focus AF`, `natural skin texture, visible pores, subtle film grain`, `natural facial asymmetry, catchlights in both eyes, not perfectly identical`, 클로징 `The look must be unmistakable to a non-photographer viewer.`, `clean, brand-free, copy-free finish` |
| 배경 | 솔리드 컬러는 HEX, 소품은 m 거리 명시 |

v1→v2 업그레이드 7종: Lens character 블록 / Director signature 라인 / 클로징 명령문 / 페르소나 세분화(홍채·점·립피니시·쌍꺼풀) / Film 3파트 / 배경 HEX+소품 거리 / [format-b.md](format-b.md) §1 publication tier.
