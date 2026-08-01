# 이미지 룩·컨셉 레이어

**운영 정본:** 룩 프리셋은 마감 톤, 컨셉 변수 축은 조형 언어다. 프롬프트 하나에는 사조(M) 최대 1개와 룩 프리셋(L) 최대 1개만 넣는다. 긍정형·결과 서술 원칙과 금지 표현은 **철칙: compiler.md**를 참조한다.

## 1. 사용 순서

| 단계 | 결정값 | 고정 규칙 |
|---|---|---|
| 1 | 피사체·목적 | 제품·인물·포스터·카드 등 산출물 종류를 먼저 확정한다. |
| 2 | L1~L9 룩 프리셋 | 마감 톤 1개만 선택한다. 프리셋 혼합은 팔레트 충돌로 금지한다. |
| 3 | M/R/X/T 축 | 컨셉 다변화가 필요할 때 축 1개만 선택한다. |
| 4 | HEX 팔레트 | 사조 HEX와 프리셋 HEX가 충돌하면 사조 HEX를 우선한다. |
| 5 | 컴파일 | 텍스트·레이아웃·티어 규칙은 `typography.md`, jsonl·러너 규칙은 `production.md`를 참조한다. |

## 2. 무드 요청어 → 프리셋 매핑 결정표

| 요청어 입력 | 판정 기준 | 선택 프리셋 | 배제 조건 |
|---|---|---|---|
| 럭셔리, 하이엔드, 백화점, 명품 | 여백·얇은 세리프·뮤트 팔레트가 핵심 | L1 럭셔리 에디토리얼 | 금박·시상식 톤이면 L8로 이동 |
| 영화 같은, 드라마틱, 무드 있는 | 얕은 심도·헤이즈·웜/쿨 그레이드가 핵심 | L2 시네마틱 그레이드 | 제품 판매용 흰 배경이면 L3로 이동 |
| 깔끔한 제품컷, 미니멀, 스토어 | 단일 제품·흰 무대·콘택트 섀도가 핵심 | L3 미니멀 프로덕트 | 타이포가 주인공이면 L4로 이동 |
| 타이포 중심, 그래픽, 전시 포스터 | 그리드·대형 산세리프·신호색 1점이 핵심 | L4 스위스 타이포 | 다크 SaaS UI면 L5로 이동 |
| 다크 테크, SaaS, 개발자, 대시보드 | 니어블랙·헤어라인·단일 글로우가 핵심 | L5 다크 테크 | 영화 스틸 질감이면 L2로 이동 |
| 레트로, 옛날 느낌, 다방, 국풍 | 오프셋 망점·바랜 종이·붓글씨가 핵심 | L6 코리안 레트로 인쇄 | 70s 유동 형태가 핵심이면 M9로 이동 |
| 부드러운, 교육, 워크숍, 친근한 | 파스텔 카드·라운드 도형·균등광이 핵심 | L7 소프트 파스텔 | 고급 초대장 톤이면 L8로 이동 |
| 시상식, 초대장, 연말, 골드 | 딥 컬러 필드·금박·엠보싱이 핵심 | L8 골드 포일 프리미엄 | 백화점 시즌 캠페인 톤이면 L1로 이동 |
| 홍대 감성, 인디, 필름 감성, 힙한 | 플래시 스냅의 니어블랙 폴오프·리소 2도 형광·라이트리크가 핵심 | L9 인디 플래시 리소 | 오프셋 망점·붓글씨 인쇄물 톤이면 L6로, 정제된 필름 스틸 그레이드면 L2로 이동 |

## 3. 룩 프리셋 9종 드롭인 블록

| 코드 | 성격 | 팔레트 | 드롭인 |
|---|---|---|---|
| L1 럭셔리 에디토리얼 | 과감한 여백 + 얇은 세리프 + 뮤트 팔레트. 백화점 시즌 캠페인 톤. | `#F5F1E8` 아이보리 필드 · `#1C1A17` 잉크 · `#8C7B6B` 토프 액센트 | `generous negative space dominating the frame, subject occupying under one third, elegant thin serif type, soft directional daylight with long gentle shadows, muted ivory field #F5F1E8, ink #1C1A17, taupe accent #8C7B6B, matte uncoated paper grain` |
| L2 시네마틱 그레이드 | 필름 스틸 한 장. 얕은 심도 + 컬러 그레이드 + 헤이즈. | `#0E1420` 딥 섀도 · `#D9A566` 웜 하이라이트 · `#4A6670` 스틸 블루 미드톤 | `single frame from a film, shallow DoF with background falling off softly, warm key against cool shadow pools, faint drifting haze catching the light, graded palette of deep shadow #0E1420, warm highlight #D9A566, steel-blue midtone #4A6670, fine photographic grain, subtle anamorphic-style horizontal flare` |
| L3 미니멀 프로덕트 | 흰 무대 위 제품 히어로. 그림자 하나로 존재감. | `#FAFAFA` 화이트 스테이지 · `#111111` 잉크 · 제품 고유색 1개 | `product hero on a seamless white stage #FAFAFA, perfectly clean single-subject composition, soft top-light with one crisp contact shadow anchoring the object, true-to-material color, polished surface reflections kept subtle, ink-black type #111111 only` |
| L4 스위스 타이포 | 그리드에 정직한 타이포그래피 포스터. 글자가 주인공. | `#F2F2EF` 오프화이트 · `#111111` 블랙 · `#E63329` 시그널 레드 1포인트 | `strict modernist grid layout, oversized grotesque sans-serif type as the dominant visual element, flat off-white field #F2F2EF, black #111111, one signal-red accent #E63329, flat matte print finish, asymmetric composition with disciplined alignment` |
| L5 다크 테크 | 순흑에 가까운 캔버스 + 헤어라인 + 단일 액센트 글로우. 개발자·SaaS 톤. | `#0B0D12` 니어블랙 · `#5EEAD4` 민트 글로우 · `#8B93A7` 딤 텍스트 | `near-black canvas #0B0D12, hairline borders instead of shadows, one restrained mint glow accent #5EEAD4, dim secondary text #8B93A7, crisp UI-card surfaces floating with subtle depth, dark technical premium mood` |
| L6 코리안 레트로 인쇄 | 70~90년대 한국 인쇄물. 오프셋 망점, 바랜 종이, 붓글씨 헤드라인. | `#E8DCC4` 바랜 크림 · `#B33A2B` 주홍 · `#274A78` 청람 | `vintage Korean offset-print poster, visible halftone dots and slight ink misregistration, aged cream paper #E8DCC4, vermilion #B33A2B and indigo-blue #274A78 spot inks, bold brush-stroke Korean headline, worn paper texture at the edges` |
| L7 소프트 파스텔 | 따뜻한 파스텔 카드 틴트 + 라운드 도형. 교육·워크숍·커뮤니티 톤. | `#FFF9F2` 웜 화이트 · `#FFD9C7` 피치 · `#CDE8DE` 민트 · `#D9D2F0` 라벤더 | `warm white canvas #FFF9F2, rounded card shapes tinted in soft peach #FFD9C7, mint #CDE8DE and lavender #D9D2F0, flat friendly illustration style with simple geometric characters, even soft lighting, paper-smooth matte finish` |
| L8 골드 포일 프리미엄 | 딥 컬러 필드 + 금박 모티프 + 엠보싱. 초대장·시상·연말 톤. | `#101A2E` 딥 네이비 또는 `#1A2E1E` 딥 그린 · `#C9A24B` 골드 포일 · `#F3EEE2` 크림 | `deep navy field #101A2E, embossed gold-foil motifs #C9A24B catching a soft raking light, cream type #F3EEE2, letterpress paper texture with debossed line ornaments, ceremonial premium finish` |
| L9 인디 플래시 리소 | 인디 신 감성 — 35mm 플래시 스냅의 니어블랙 폴오프 + 리소 2도 그레인 + 필름 라이트리크. 거칠지만 절제된 인쇄 톤. 난해함은 버리고 시그니파이어만 남긴다. | `#0B0D12` 니어블랙 · `#E8C4A8` 플래시 웜스킨 · `#FF48A0` 리소 핑크 · `#2A48C4` 리소 블루 · `#E8DCC4` 바랜 크림 | `direct on-camera flash with deep near-black falloff, 35mm film grain and halation, a soft light leak bleeding from one corner, riso two-tone accents in fluorescent pink #FF48A0 and rich blue #2A48C4 over aged cream #E8DCC4, gritty analog indie-scene finish that still reads as composed` |

## 4. 죽은 단어 환원 표

죽은 단어는 기준이 프롬프트 밖에 있어 평균값으로 수렴한다. `잘/예쁘게/고급스럽게/세련되게/감도있게`, `어워드 수준으로/전문가처럼/최고급`은 아래 경로로 환원한다. 검증기 `W-FILLER`가 잔존을 잡는다.

| 경로 | 방법 | 예 |
|---|---|---|
| 수치 | 여백 비율 %, 컬러 60/30/10, 텍스트 위계 단수 | `여백 60%, 메인 #F5F1E8 60 / 보조 #1C1A17 30 / 포인트 #8C7B6B 10, 위계 3단` |
| 몸 반응 | 감상자의 몸 반응으로 번역(R축) | `고급스럽게` → `목소리를 낮추고 조용히 보게 되는` |
| 구체 예시 | 원하는 결과물 장면 자체를 서술 | `어워드 수준` → 원하는 여백·타이포·마감을 실제 토큰으로 서술 |

## 5. M축 — 미학 사조 10종

| 코드 | 조형언어 | 팔레트 | 드롭인 |
|---|---|---|---|
| M1 바우하우스 | 기하 원·삼각·사각 프리미티브, 기능주의 그리드, 장식 0 | `#E63329` 적 · `#F2B705` 황 · `#1D4E89` 청 · `#111111` 흑 · `#F2F2EF` 오프화이트 | `Bauhaus-inspired composition of geometric primitives — circle, triangle, square — functionalist grid, primary red #E63329, yellow #F2B705, blue #1D4E89 on off-white #F2F2EF, flat matte print finish, form strictly following function` |
| M2 아르데코 | 방사 선셋버스트, 수직 강조, 계단형 대칭 프레임, 금속 라인 | `#101A2E` 딥네이비 · `#C9A24B` 골드 · `#2E6157` 딥그린 · `#F3EEE2` 크림 | `Art Deco geometry — radiating sunburst lines, stepped symmetric frame, vertical emphasis, gilded linework #C9A24B over deep navy #101A2E, cream detailing #F3EEE2, polished lacquer finish` |
| M3 멤피스 | 삐뚤어진 기하 + 스퀴글·지그재그, 클래시 배색, 계획된 장난기 | `#F25C9B` 핑크 · `#20B2AA` 틸 · `#F2B705` 옐로 · `#111111` 흑 라인 | `Memphis design language — tilted playful geometry, squiggles and zigzag patterns, clashing pink #F25C9B, teal #20B2AA, yellow #F2B705 with bold black outlines, flat pop finish, deliberate mismatch that still reads as one system` |
| M4 브루탈리즘 | 노출 구조·날것 질감, 오버사이즈 그로테스크 타이포, 장식 대신 구조 | `#C7C7C2` 콘크리트 그레이 · `#111111` 잉크 · 시그널 1색 `#E63329` | `brutalist composition — raw concrete texture, exposed structural blocks, oversized grotesque type as structure itself, concrete grey #C7C7C2, ink #111111, one signal accent #E63329, unpolished honest surfaces` |
| M5 데 스틸 | 수평·수직 격자만, 두꺼운 흑선 분할, 비대칭 균형 | `#E63329` 적 · `#F2B705` 황 · `#1D4E89` 청 · `#FFFFFF` 백 · `#111111` 흑선 | `De Stijl grid — strictly horizontal and vertical black dividing lines, asymmetric balance of rectangular fields in primary red #E63329, yellow #F2B705, blue #1D4E89 on white, flat poster finish` |
| M6 미드센추리 모던 | 유기적 부메랑·스타버스트·테이퍼드 레그 실루엣, 종이 질감 일러스트 | `#D9A54B` 머스터드 · `#6B7F3E` 올리브 · `#C65D34` 번트오렌지 · `#F0E7D8` 크림 | `mid-century modern illustration — organic boomerang and starburst motifs, tapered silhouettes, mustard #D9A54B, olive #6B7F3E, burnt orange #C65D34 on warm cream #F0E7D8, textured paper grain, flat screen-print feel` |
| M7 아르누보 | 식물 줄기 곡선, 유기적 장식 프레임, 손그림 라인워크 | `#7A8C5F` 세이지 · `#C9A24B` 골드 라인 · `#F3EEE2` 아이보리 · `#4A3B2A` 딥브라운 | `Art Nouveau linework — flowing botanical curves framing the subject, hand-drawn organic ornament, sage #7A8C5F and deep brown #4A3B2A with gilded line accents #C9A24B on ivory #F3EEE2, lithograph texture` |
| M8 구성주의 | 사선 다이내믹, 대각 분할, 포토몽타주 결합, 선동적 에너지 | `#B33A2B` 적 · `#111111` 흑 · `#E8DCC4` 바랜 크림 | `constructivist poster dynamics — aggressive diagonal composition, angular red #B33A2B and black #111111 planes slicing across aged cream #E8DCC4, photomontage-style subject placement, kinetic propaganda energy` |
| M9 사이키델릭 70s | 물결치는 유동 형태, 소용돌이 리듬, 고채도 클래시 | `#E85D1F` 오렌지 · `#7B4EA3` 퍼플 · `#3E8C4F` 그린 · `#F2B705` 옐로 | `70s psychedelic flow — melting liquid shapes and swirling rhythm, saturated clash of orange #E85D1F, purple #7B4EA3, green #3E8C4F, yellow #F2B705, wavy concentric contours, vintage offset print grain` |
| M10 와비사비 | 불완전의 미, 비대칭 여백, 자연 균열·얼룩, 손맛 남긴 마감 | `#B8AD9E` 흙빛 뉴트럴 · `#6E6558` 토프 · `#F0EBE2` 미색 · 안개빛 저채도 | `wabi-sabi restraint — asymmetric emptiness dominating the frame, natural imperfection kept visible (hairline cracks, uneven glaze, raw edges), earthen neutrals #B8AD9E #6E6558 on undyed field #F0EBE2, quiet handmade finish` |

## 6. R축 — 몸 반응 번역 8종

| 죽은 단어 | 몸 반응 | 역설계되는 것 | 드롭인 |
|---|---|---|---|
| 눈에 띄는 | 눈이 여기저기 튀어다닌다 | 빠른 리듬·볼거리 밀도·강대비 | `busy rhythmic composition that keeps the eye bouncing between focal points, dense with things to discover, high-contrast accents` |
| 고급스러운 | 목소리를 낮추고 조용히 보게 된다 | 여백 확보·정돈·장식 제거 | `hushed composition the viewer lowers their voice for — generous negative space, every element aligned, nothing decorative left` |
| 귀여운·위트 | 입가가 아주 작게 올라간다 | 어긋난 요소 1개·작은 서프라이즈 | `one playfully misaligned element and a tiny unexpected object that rewards a second look, restraint everywhere else` |
| 대담한 | 뭐 주나 싶어 목이 앞으로 빠진다 | 스케일 파괴·과감한 크롭 | `oversized focal subject cropped past the frame edge, scale that physically pulls the viewer forward` |
| 신뢰 가는 | 어깨가 내려가고 호흡이 느려진다 | 대칭·안정 수평선·차분한 채도 | `calm symmetric structure on a steady horizon, low-saturation composed palette, slow-breathing stability` |
| 식욕 도는 | 침이 고인다 | 윤기·김·단면 클로즈업 | `glistening surfaces and rising steam, cross-section detail close enough to reach for` |
| 긴장감 있는 | 숨을 잠깐 참게 된다 | 불안정 사선·타이트 크롭·딥 섀도 | `breath-holding stillness — unstable diagonal, tight claustrophobic crop, deep shadow pools` |
| 청량한 | 어깨에 소름이 살짝 돋는다 | 차가운 하이라이트·물방울·크리스프 | `goosebump-cold crisp highlights, condensation droplets, air that reads several degrees cooler` |

브랜드 보이스 변형은 로고·브랜딩 컨셉에서만 쓴다. 반응 대신 `이 브랜드가 길에서 자기 이름을 외친다면 — 소리 크기·발음·자세는?`을 한 줄로 정하고 시각 토큰으로 변환한다.

## 7. X축 — 모순 쌍 레이어 분리

| 항목 | 규칙 |
|---|---|
| 문제 | `감성적이면서 세련된`처럼 두 형용사를 한 레이어에 넣으면 모델이 평균을 낸다. |
| 해결 | 모순 쌍을 정한 뒤 형태/로고 · 팔레트 · 타이포 · 질감 · 조명 · 소품의 6층에 한쪽씩 배정한다. |
| 예 | 장난스럽지만 정교한: 형태=장난(비대칭 스티커 실루엣) / 타이포=정교(정밀 그리드 산세리프) / 팔레트=장난(클래시 1점) / 질감·조명=정교(클린 스튜디오, 균질광) |
| 쌍 예시 | 장난스럽지만 정교한 · 차갑지만 다정한 · 낡았지만 미래적인 · 시끄럽지만 미니멀한 · 묵직하지만 가벼워 보이는 |
| 방출 | 프롬프트에는 쌍 이름을 쓰지 않고 레이어별 배정 결과만 쓴다. |

## 8. 컬러 번역 — 음악·장면 → 팔레트

| 단계 | 산출 |
|---|---|
| 1 | 시간대 + 장소 + 행동 + 음악을 한 문장으로 쓴다. |
| 2 | 그 장면을 HEX 3~4색 + 비율(60/30/10)로 번역한다. 색마다 유래 한 줄을 둔다. |
| 3 | 번역된 팔레트를 Color grading 섹션에 넣는다. 장면 문장은 프롬프트에 넣지 않는다. |
| 제한 | 비율 합 100. 컨셉 seed 단계는 2~4색 가능하나 **최종 컴파일 시 컷당 3~5색으로 확장**한다(철칙: compiler.md). |

| 장면 문장 | 번역 예 |
|---|---|
| `한낮 12시 캘리포니아 해변, 아이스크림 먹으며 듣는 신나는 팝송` | `#FFD54F` 모래빛 60 / `#4FC3F7` 한낮 바다 30 / `#FF7043` 아이스크림 10 |
| `밤 9시, 불빛 반짝이는 한강다리를 건너며 듣는 피아노곡` | `#101A2E` 밤 강물 60 / `#D9A566` 다리 조명 25 / `#5EEAD4` 수면 반사 15 |

## 9. T축 — 타이포 아트 5기법

렌더 텍스트를 다루므로 Tier-1 결합 공식 1회가 필수다. 한글 카피는 표면별 캔버스 크기 설정([surfaces.md](surfaces.md): S1 기계 계약→스키마 enum, S1-legacy→production.md §11 사이즈락 6종 긴 변 2048, S2→모델 정의, S3→UI 라벨)을 적용한다. 영역 문법은 `typography.md`를 참조한다.

| 코드 | 기법 | 절차 | 드롭인 골격 | 완성 예 |
|---|---|---|---|---|
| T1 움직임 번역 | 대상을 그리지 않고 움직임의 성질만 글자에 싣는다. | 대상 선정 → 리듬/속도 추출 → 궤적/힘 분해 → 글자 성질로 번역 | `letterforms carrying the {rhythm and trajectory} of {motion} — the lettering as the only subject in the frame, the motion's energy living entirely in the strokes` | `Text-in-image: headline "파도" — letterforms carrying the surge of an incoming wave: strokes swelling thicker as they rise, crests breaking into fine spray at the stroke tips, baseline rolling like a swell — the lettering as the only subject in the frame, all of the wave's energy living inside the strokes. Deep sea ink #1D4E89 on foam-white field #F5F8FA, all text perfectly legible.` |
| T2 의성어·의태어 번역 | 소리의 결을 글자 형태로 옮긴다. 감정·장면을 더하면 결이 달라진다. | 의성어 선정 → 감정/장면 추가 → weight·edge로 번역 | `letterforms shaped by the texture of the sound "{의성어}" felt through {감정/장면}, weight and edges following the sound` | `Text-in-image: headline "사르르" — letterforms melting like butter on a warm pan: edges softening and gently drooping, the last syllable dissolving into a thin glossy pool beneath the baseline, weight thinning from first glyph to last. Warm butter yellow #F2B705 on cream field #FFF9F2.` |
| T3 의도 왜곡 | 왜곡 방향을 먼저 설계하고 그 방향으로만 일그러뜨린다. | 왜곡 방향 후보 나열 → 1개 선택 → 위치·강도 설계 → 가독 한계선 명시 | `deliberately distorted lettering — {선택한 왜곡} applied with intent, distortion stopping just before legibility breaks` | `Text-in-image: headline "야시장" — deliberately distorted lettering: each glyph sliced horizontally at its waist, the upper half shifted slightly right like a mis-registered print, distortion stopping just before legibility breaks. Hot pink #F25C9B strokes with an electric mint #5EEAD4 offset layer on near-black #0B0D12.` |
| T4 네거티브 스페이스 | 글자 속 여백에 상징을 숨긴다. 두 번째 봤을 때 발견되는 구조다. | 효과 좋은 글자 선택 → 카운터스페이스 지정 → 상징 1개 삽입 → 나머지 획 정리 | `a {상징} subtly hidden in the counterspace of the letter {글자}, invisible at first glance, discovered on the second` | `Text-in-image: wordmark "소풍" — a tiny kite silhouette subtly hidden inside the round counterspace of "ㅇ", invisible at first glance, discovered on the second look; every other stroke kept clean and geometric. Single ink #111111 on warm paper field #F5F1E8.` |
| T5 글자 안의 세계 | 글자 외곽을 창으로 삼아 내부에 하나의 축소 장면을 보이게 한다. | 글자 1개 선택 → 내부 장면 1개 지정 → 외곽선·내부 경계 분리 → 장면 규모를 글자 안에 고정 | `a miniature {scene} contained entirely within the letter {글자}, the letter's outer silhouette remaining crisp and readable` | `Text-in-image: headline "밤" — a miniature night market contained entirely within the counter and strokes of "밤": tiny warm stalls and hanging bulbs receding along one narrow lane, every scene element clipped to the letterforms; the outer silhouette remains crisp and readable. Deep navy #101A2E, warm lamp gold #D9A566, cream #F3EEE2.` |

| T축 보조 사실 | 값 |
|---|---|
| T1 대상 예 | 파도 · 심장박동 · 빗방울 · 고양이 착지 |
| T4 효과 좋은 영문 | `o c q d e a h` |
| T4 효과 좋은 한글 | `ㅇ ㅎ ㅁ ㅂ ㅅ ㄷ` |
| T3/T4 운영 | 렌더 편차가 커서 후보 3컷 이상 권장 |

## 10. 컨셉 프리플라이트

요청이 `컨셉부터`·`차별화되게`일 때만 컴파일 전에 수행한다. 산출은 컨셉 한 줄이며, 그다음은 평소처럼 컴파일한다.

| 수 | 작업 | 산출 |
|---|---|---|
| 1 | 뻔한 규칙 스캔 | 업종에서 모두가 당연시하는 암묵 규칙 3~5개를 나열한다. 정면으로 어겼을 때 신선하고 설득 이유가 서며 업종으로 인식되는 규칙 1개를 고른다. 위반 자체를 컨셉 코어로 삼는다. |
| 2 | 검색문장 역산 | `향 강하지 않은 핸드크림`, `원룸에 어울리는 작은 가전`처럼 현실 검색문장을 뽑고 수요 빈틈에서 컨셉을 역산한다. |

## 11. 양산 스윙·스윕 패턴

| 패턴 | 고정 | 변주 | 목적 |
|---|---|---|---|
| 1축 스윕 | 피사체·구도·조명·카피 | 축 값 1개 | 어떤 변수가 결과를 갈랐는지 추적한다. |
| M축 스윕 | 같은 제품·같은 기능 | M1~M10 중 N개 | 흔한 제품의 컨셉을 크게 벌린다. |
| 2단 패스 | 1차 생존 축 값 | R/X축 미세 조정 | 살아남은 컨셉을 반응·모순쌍으로 정밀화한다. |

```jsonl
{"id":"broom-m1","category":"C8","ar":"1:1","size":"1024x1024","full_prompt":"…(피사체·구도·조명 고정)… + M1 바우하우스 드롭인 … AR 1:1"}
{"id":"broom-m4","category":"C8","ar":"1:1","size":"1024x1024","full_prompt":"…(동일 고정)… + M4 브루탈리즘 드롭인 … AR 1:1"}
{"id":"broom-m10","category":"C8","ar":"1:1","size":"1024x1024","full_prompt":"…(동일 고정)… + M10 와비사비 드롭인 … AR 1:1"}
```

## 12. 실측 메모

| 항목 | 실측·운영 상태 |
|---|---|
| L5 | VOL.2 키비주얼·구조도에서 검증(2026-07-02, 한글 렌더 정확). |
| L1~L4·L6~L8 | 어휘 단위는 기존 실측 범위(photo-vocab·C3·C11) 안이지만 프리셋 단위 실측은 미완. 첫 사용 시 2컷 변주로 검증 후 확정 권장. |
| L9 | 프리셋 단위 실측 미완. 니어블랙 폴오프·리소 듀오톤·라이트리크 세 시그니처가 함께 있어야 톤이 성립한다 — 하나라도 빠지면 일반 필름 프리셋으로 퇴행한다. 첫 사용 시 2컷 변주로 검증 후 확정 권장. |
| M·R·X·T 전 축 | 어휘 단위는 기존 실측 범위(photo-vocab·C3·C8·C11) 안이지만 축 단위 실측은 미완. 첫 사용 시 2컷 변주 검증 후 확정 권장. |
| T3·T4 | 렌더 편차가 클 수 있어 후보 3컷 이상 권장. |
