# 에디토리얼 패션 — 택소노미·Persona DNA

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

## 4. 패션 스타일 택소노미 21종

명명 규칙: 폴더 `NN_<snake>`, 스타일 ID `STY-NN`, 룩 ID `STY-NN-LMM`. (폴더 `NN_<snake>` 명명은 별도 룩북 프로젝트의 아카이브 규칙이다 — 이 레포에는 해당 폴더 트리가 없으며 스타일 ID `STY-NN`·룩 ID `STY-NN-LMM` 표기만 쓴다.) 카탈로그 필드: ID / 슬러그 / 한글명 / 무드 한 줄 / 레퍼런스 인덱스. Tier-2 레인 필수 스타일은 `STY-15 boudoir_editorial`, `STY-17 resort_beach`다. 이 둘은 명시 선언된 Tier-2 컴플라이언스 레인에서만 작성한다.

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

스타일 카드를 요청했을 때 참고할 항목이다. 결과를 구분하는 내용만 남기며 일반 이미지 프롬프트의 필수 슬롯으로 사용하지 않는다. 길이·상세도는 [../surfaces.md](../surfaces.md) §0-1·§0-2를 따른다.

| 블록 | 선택 내용 |
|---|---|
| 정의 한 줄 | 해당 스타일이 다른 20종과 갈리는 기준 1문장 |
| 무드보드 키워드 | 톤·조명·컬러·소재·헤어메이크업 |
| 컬렉션 | 사용자 지정 브랜드를 유지. 새 설정이 필요하고 지정되지 않았을 때만 가상 브랜드 |
| 추천 페르소나 | P-NN 1순위·2순위 |
| 카메라 방향 | 결과를 구분하는 lens character 또는 샷 사이즈. 거리값은 필요한 경우만 |
| 조명 방향 | 조명이 스타일을 구분할 때 그림자·하이라이트 결과 |
| 컬러 그레이딩 | 요청한 필름 반응·색 관계. 정확 색이 필요할 때만 HEX |
| 룩 리스트 | 요청한 룩 범위 |
| 셀렉트 기준 | 성공/실패 판정문 |
| 꼭 들어갈 디테일 | 소재·마감·포즈·배경 중 해당 스타일 식별 요소 |
## 5. Persona DNA + Gold DNA

### 5.1 Persona DNA 고정 순서

동일 가상 인물의 시리즈를 요청했을 때 쓰는 상세 참조 순서다. 선택한 신원 단서는 컷 간 유지하며, 원본 이미지가 신원을 정하면 보이는 정보를 보존하고 새 외모를 덧붙이지 않는다. 모든 컷에 아래 필드를 채우거나 정해진 줄 수를 맞출 필요는 없다.

| 순서 | 필드 | 작성 규칙 |
|---|---|---|
| 1 | ethnicity+age | 사용자·참조가 정한 인물 정보를 보존한다. 새 가상 인물을 요청했을 때만 필요한 설정을 제안하고, Tier-2 안전 문구는 [tier2-safety.md](tier2-safety.md) §2로 분리한다 |
| 2 | hair | 길이·질감·스타일. 예: 낮게 묶은 로우 번, 짧은 웨이브 단발 |
| 3 | eye | 쌍꺼풀·홍채색·눈매. 실존 인물 닮은꼴 금지 |
| 4 | beauty mark | 요청에 있거나 원본에서 확인된 경우만 위치 유지 |
| 5 | lip finish | matte rose, sheer berry, satin nude 등 표면감 |
| 6 | outfit | 원본 의상 또는 요청한 소재·핏/디테일. 브랜드·정확 색상은 필요한 경우만 |
| 7 | background | 요청한 배경과 소품 관계. HEX·거리값은 결과를 가를 때만 |
| 8 | camera distance | 필요한 샷 사이즈·프레이밍 또는 주어진 거리값 |

### 5.2 Gold DNA — 기존 367 골드 샘플의 상세 작성 관례

기존 샘플의 관례를 기록한 참고표다. 이 표의 빈도·개수·블록을 새 프롬프트의 보편 의무로 옮기지 않는다. 아래 긴 조합도 요청 결과를 바꾸는 요소만 선택한다.

| 축 | 기존 샘플의 관례 |
|---|---|
| 카메라 | 중형·필름 바디 선호. 렌즈 빈도 35>50>85>24mm. 기존 기록에서 `Lens character:` 블록(초점거리·평면성·왜곡 적음·배경 분리)은 골드 100/100에 포함 |
| 필름/컬러 | Portra·desaturated·teal&orange·CineStill 800T 빈출. Film 3파트 = `[필름] emulation — [스킨], [섀도], [하이라이트]. [매거진] roll-off` |
| 조명 | `key:fill X:1`과 결과 어휘를 함께 사용한 상세 관례([photo-vocab.md](photo-vocab.md) §7.2). neon/practical/golden hour/창광 |
| 구도 | 카메라 거리 m, rule of thirds, 영문 포즈(`contrapposto` 등). 기존 기록에서 `Director signature:` 라인은 골드 100/100에 포함 |
| 무드 | light+color+expression 트리플. 예: `melancholic — desaturated cool, low key, downcast` |
| 페르소나 | ethnicity+age → hair → eye(쌍꺼풀·홍채색) → beauty mark(점 보통 1개) → lip finish → outfit(가상 브랜드+소재+HEX) → 배경 HEX → 카메라 거리 m. 4~7줄 |
| 퀄리티 앵커 | 전부 긍정형: `eye-focus AF`, `natural skin texture, visible pores, subtle film grain`, `natural facial asymmetry, catchlights in both eyes, not perfectly identical`, 클로징 `The look must be unmistakable to a non-photographer viewer.`, `clean, brand-free, copy-free finish` |
| 배경 | 솔리드 컬러는 HEX, 소품은 m 거리 명시 |

기존 v1→v2 업그레이드 기록 7종: Lens character 블록 / Director signature 라인 / 클로징 명령문 / 페르소나 세분화(홍채·점·립피니시·쌍꺼풀) / Film 3파트 / 배경 HEX+소품 거리 / [format-b.md](format-b.md) §1 publication tier. 새 요청에 이 일곱 항목을 일괄 추가하지 않는다.
