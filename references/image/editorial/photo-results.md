# 사진 결과 어휘

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) §원칙 > 이 파일.

요청을 가르는 화면 결과만 고른다. 표 전체를 채우지 않는다. 길이·상세도는 [../surfaces.md](../surfaces.md) §0-1·§0-2.

빛·거리·결·색은 보이는 상태로 적는다. 사용자가 장비나 특정 시각을 지정했으면 그대로 둔다. 배제는 원하는 상태로 쓴다. 품질 태그와 가중치 문법은 쓰지 않는다.

## 심도·원근
<!-- dict:depth_lens -->

원근이 찌그러지는 이유는 초점거리 숫자가 아니라 **카메라와 피사체 사이 거리**다. `85mm`보다 "물러서서 얼굴 면이 납작해졌다"가 원인에 가깝고, 바디명을 모르는 모델에도 전달된다. 장비 나열 대신 결과로 적는 근거는 [../compiler.md](../compiler.md) §결과로 쓴다.

| 축 | 결과 토큰 |
|---|---|
| 광각 느낌 | `subject near the lens, nearer forms larger than distant ones, frame taking in a broad field, edges gently pulled, focus holding front through rear` |
| 표준 | `perspective matching everyday seeing, body and room staying in scale` |
| 중망원 느낌 | `camera stepped back, facial planes holding flattering proportion, background pushed back and softened` |
| 망원/압축 | `camera far back, depth squeezed, planes stacked, figure lifted off a softened rear field`. 더 밀면 `rear field flattened into one plane right behind the figure` |
| 얕은 심도 | `shallow depth of field, eyes sharp with the shoulder line already falling off, background dissolved into creamy blur` |
| 깊은 심도(룩북) | `garment surface sharp from collar to hem, fabric weave resolvable, background separated by luminance step, not by defocus`(흐림 대신 밝기 차로 나눠야 옷 정보가 남는다) |
| 빈티지 보케 | `blur traces curve near the frame edges; the focused subject keeps a mellow tonal transition` |
| 아나모픽 | `broad cinema frame, streaks running sideways, oval glints` |
| 가장자리 감쇠 | `sharp central microtexture, soft edge focus falloff`(가운데 미세결은 또렷하고 가장자리만 천천히 풀림) |

전신 비율이 핵심일 때만 카메라 높이를 각도와 나눠 적는다.

| 축 | 결과 토큰 |
|---|---|
| 전신 표준 | `camera at the subject's waist-to-chest height, leg length rendered true, hip-to-hem line reading full`. 눈높이에서 내려보면 `lower body foreshortened, legs reading shorter`가 되므로 룩북에선 피한다 |
| 로우앵글 | `camera below waist height looking up, subject monumental, hemline dominant, ceiling or sky entering the frame` |
| 상반신·뷰티 | `camera at the subject's eye height, facial verticals staying parallel` |

## 빛
<!-- dict:lighting -->

얼굴을 고르게 비우는 클램셸은 선택할 수 있으나 기본값으로 넣지 않는다. 광질을 가르는 것은 장비 상표가 아니라 **피사체가 보는 광원의 겉보기 크기**다. 크고 가까우면 부드럽고, 작고 멀면 딱딱하다.

| 축 | 결과 토큰 |
|---|---|
| 패턴 — clamshell | `light from above angled down and a second source from below angled up, shadows under the eyes and jaw filled in, skin glowing evenly, twin catchlights stacked in each eye` |
| 패턴 — Rembrandt | `key from 45° above, triangle of light on the shadow-side cheek, eye on the shadow side still catching a highlight` |
| 패턴 — butterfly·loop | `key placed high and directly in front, small symmetric shadow under the nose, cheekbones defined by even falloff` / 키를 축에서 살짝 돌리면 `nose shadow looping onto the cheek, mild asymmetry` |
| 패턴 — split | `light striking one side of the face only, vertical division down the nose bridge, far side falling to near-black` |
| 패턴 — 뷰티디시 키 | `crisper shadow edge than a softbox, clearly defined round catchlight, skin texture retaining micro-contrast` |
| 질 — 소프트 | `soft diffuse key, shadow edge transitioning gradually, gentle gradient across the face`. 극단은 `very large source close to the subject, light wrapping continuously around the cheek` |
| 질 — 중간 | `moderately defined shadow edge, form modelled with a soft terminus` |
| 질 — 하드 | `small distant source, crisp shadow edge with a hard terminus, small bright specular highlight, texture strongly raked` |
| 질 — 레이킹 | `low-angle soft light, gentle relief shadows`(낮은 측면의 넓은 연질광이 돌출부만 밝히고 홈에는 완만한 그늘) |
| 비율 | 표기는 **키측:그림자측**, 배수가 곧 스톱이다. `1:1` 평탄(0스톱) / `2:1` 자연·그림자 디테일 유지(1스톱) / `4:1` 드라마틱(2스톱) / `8:1` 로우키·암부 near-black(3스톱). 숫자만 쓰지 않는다 — `key:fill 4:1, pronounced shadow side, shadow detail thinning`처럼 결과와 같이 적는다([../compiler.md](../compiler.md) §스타일은 화면 결과로) |
| 룩북 기본광 | `large soft key with a broad white bounce filling the shadow side, low overall contrast, every shadow still holding the seam and the fold`(옷이 주인공이므로 반사판으로 대비를 낮춘다) |
| 보조 | `cool edge rim isolating the contour`, `warm practical spill`, `window glow arriving from camera left`, `upward bounce opening the jaw shadow` |
| 시간광 | 해질 무렵의 따뜻한 낮은 광 / 블루아워의 찬 기운 / 한낮 톱라이트 = `short dense nose shadow, shadowed eye sockets` |
| 색온도 분리 | `split color-temperature lighting, warm key on skin, cool background wash`(인물이 앞으로 분리되고 공간이 깊어진다) / 변주 `cool key on subject, warm tungsten practical background` |
| 하이키 스튜디오 | `high-key white studio, large negative space, clean editorial margins`(흰 바탕과 긴 여백이 실루엣을 앞으로 민다) |

### 캐치라이트

각막에 찍힌 하이라이트 모양이 모디파이어 형태다. 클로즈업에서 값이 싸다.

| 소스 | 결과 토큰 |
|---|---|
| 옥타박스·뷰티디시 | `round soft-edged catchlight, one per eye` |
| 사각 소프트박스 | `rectangular catchlight, iris radial texture, aligned with key direction` |
| 스트립박스 | `tall narrow vertical catchlight` |
| 링 | `ring-shaped annular catchlight surrounding the pupil` |
| 클램셸 | `two stacked catchlights, larger above and fainter below` |
| 격자 창 | `catchlight divided by the window mullion into panes` |
| 흐린 하늘 | `broad diffuse catchlight filling the upper third of the iris` |
| 직사 스피드라이트 | `tiny pinpoint specular catchlight, very bright` |

## 색

자연스러운 피부색을 지켜야 하면 보정은 피부 밖 영역에 걸고 피부는 본래 톤에 둔다.

| 축 | 규칙 |
|---|---|
| 팔레트 | 정확 색이나 색 관계가 필요할 때만 지정. 색 이름으로 되면 코드값은 생략. 전문 레인은 그 레인의 색 계약을 따른다. |
| 색온도 | 켈빈 숫자 또는 `warm-3200 feel` / `neutral white` / `cool bias` |
| 조화 | 반대색 / 이웃색 / 세 점 삼각 |
| 룩 | 청록-주황 분리, 블리치 바이패스 대비, 채도 낮춘 뮤트, 하이라이트가 따뜻하게 꺾임 |
| 스킨 보호 기본 | `warm grade applied to background and negative space, skin left neutral and true to its own undertone` |
| 스킨 보호 — 저채도 | `desaturated overall palette with skin retaining natural warmth and blood tone` |
| 스킨 보호 — 틸 섀도 | `teal shift confined to the shadows and the background, skin midtones untouched` |
| 필름 결과 | Portra = 따뜻한 피부, 옅은 파스텔 중간톤, 하이라이트가 천천히 꺾임; Tri-X = 강한 흑백 대비와 보이는 입자; CineStill 800T = 텅스텐 밤 팔레트, 밝은 가장자리의 붉은 번짐 |

## 필름·매체 결과

한 컷에 매체 이름 하나. 이름만 쓰지 말고 피부·그림자·하이라이트 거동을 같이 적는다.

### 필름 스톡 결과
<!-- dict:film_stock -->

| 스톡 | 결과 묘사 | 어울리는 장면 | 영어 토큰 |
|---|---|---|---|
| Kodak Portra 400 | 부드러운 피부톤 · 크리미한 색감 · 낮은 대비 | 웨딩 · 인물 · 자연광 스냅 | `soft creamy skin, warm natural light, fine film grain` |
| Kodak Portra 800 | 크리미한 화이트 · 부드럽게 날린 하이라이트 · 로맨틱 | 웨딩 · 실내 인물 | `creamy white tones, soft blown-out highlights, warm glowing skin` |
| Kodak Gold 200 | 따뜻한 노란빛 · 선명한 색감 · 레트로 무드 | 일상 · 여행 · 가족사진 | `warm golden tones, everyday snapshot, retro feeling` |
| Fujifilm Pro 400H | 낮은 채도 · 부드러운 그린톤 · 청량함 | 숲 · 바다 · 자연 | `low saturation, soft green shift, dreamy softness` |
| Kodak Ektar 100 | 높은 채도 · 선명한 디테일 · 또렷함 | 풍경 · 건축 · 하늘 | `high saturation, sharp detail, vivid colors` |
| Ilford HP5 | 강한 명암 · 거친 그레인 · 흑백 다큐 무드 | 거리 스냅 · 흑백 인물 | `black and white, strong contrast, heavy grain` |

### 노출·기법 결과
<!-- dict:technique -->

| 기법 | 결과 묘사 | 영어 토큰 |
|---|---|---|
| Overexposure | 하이라이트를 밝게 날려 부드럽고 몽환적 | `soft overexposed highlights, bright airy atmosphere` |
| Highlight retention | 강한 햇빛에서도 흰 옷의 주름·가장자리를 남겨 싸구려 과노출을 피한다 | `retained white fabric detail, soft sun contrast, clean high-key exposure` |
| Underexposure | 그림자를 깊게 만들어 무게감 있는 분위기 | `slightly underexposed shadows, deep muted tones, dark cinematic mood` |
| Diffused light | 빛을 부드럽게 퍼뜨려 피부·경계가 자연스러움 | `soft diffused daylight, light filtered through sheer curtains` |
| Cross process | 색을 비현실적으로 변형한 실험적 필름 무드 | `cross-processed film colors, cyan color shift, unusual color palette` |
| Soft focus | 초점을 부드럽게 풀어 회상적·로맨틱 | `soft focus, dreamy blur, gentle lens softness` |
| Vignetting | 가장자리를 어둡게 해 시선을 중앙으로 | `subtle vignetting, center-focused composition` |
| Film grain | 필름 특유의 질감과 아날로그 분위기 | `fine film grain, visible analog texture` |

### 감성 묶음
<!-- dict:emotional_preset -->

| 감성 | 결과 묘사 | 키워드 블록 |
|---|---|---|
| 숲속 필름 | 습한 공기 · 낮은 채도 · 그린 그림자 | `Pro 400H-look, overexposed by one stop, green color shift, humid forest atmosphere, soft film grain` |
| 디스포저블 스냅 | 파스텔톤 · 핑크/크림 계열 · 소프트 포커스 | `disposable camera aesthetic, soft pastel tones, slight lens distortion, nostalgic snapshot` |
| 흐린 날 다큐 | 회색 하늘 · 다큐멘터리 무드 · 차분한 도시감 | `overcast diffused daylight, cool grey undertones, heavy visible grain, melancholic realism` |
| 시안 실험 | 시안·블루 색감 · 차갑고 몽환적 | `cross-processed film, cyan and blue shift, cool teal shadows, experimental film look` |
| 웨딩 필름 | 크리미한 화이트 · 자연광 · 로맨틱 | `Portra 800-look, creamy white tones, soft blown-out highlights, warm glowing skin` |
| 플래시 스냅 | 순간 포착 · 직사 플래시 · 생활감 | `snapshot aesthetic, direct flash, imperfect composition, natural unposed moment` |

## 구도
<!-- dict:composition -->

| 축 | 어휘 |
|---|---|
| 분할 | 삼등분 격자, 황금분할, 정면 아이콘 |
| 여백 | 카피를 놓을 비어 있는 면, 프레임 가장자리까지 이어지는 공간 |
| 유도 | 시선을 끄는 선, 눈길 궤적, 삼각으로 앉힌 안정, 소품 위계 = `prop contrast kept below the hero`(소품은 주인공보다 대비를 낮춰 맥락만 주고 가리지 않음) |
| 샷 사이즈 | 아주 가까운 얼굴 → 얼굴 → 허리 위 → 발끝까지 → 먼 전경 |
| 앵글 | 눈높이 / 아래에서 올려봄 / 위에서 내려봄 / 어깨 너머 / 기울인 프레임 |
| 거리 | 거리를 숫자로 적을지는 그 숫자가 화면을 가를 때만. 프레이밍으로 충분하면 만들지 않는다. |
| 커버 크롭 | `upper-body fashion close-up, tilted head crop, clean cover portrait`(얼굴·주얼리·의상 일부만 크게 잘라 뷰티와 패션 정보를 동시에 압축) |
| 커버 크롭 변주 | `gesture beauty crop`(손·주얼리가 얼굴 일부를 가림) / `asymmetric cover crop`(대각 축으로 밀어 비대칭) |
| 풀블리드 매크로 | `full-frame surface macro, texture filling the frame edge to edge, the surface itself as subject`(용기·배경 없이 질감이 주제가 됨) |

## 재질·마감
<!-- dict:material_finish -->

| 축 | 결과 토큰 |
|---|---|
| 표면 반응 | `butter-matte face`, `wet specks on high points`, `light traveling under the surface`, `thick paste with built ridges and metal sheen`(두꺼운 도포면·뭉친 가장자리), `tiny aerated pits, whipped matte density`(미세 기공·저광택), `limestone pitting, chalky dry plane`(균열·구멍 있는 흰 석회암 면), `crochet-raffia handwork`(수공예 질감) |
| 마감 | `faint analog grain`, `soft corner darkening`, `red bloom on bright rims`, `unmarked clean finish` |
| 피부 | `pores readable, vellus hair present, grain kept faint`, 얼굴 미세결, 약한 톤 기복 |
| 피부 — 촉촉 | `hydrated skin base, moisture-rich finish, dewy but natural skin` |
| 피부 — 유리알 투명 | `translucent skin clarity, visible texture, non-plastic glow`(반투명하되 모공은 유지) |
| 피부 — 꿀광 | `inner honey glow, warm luminous skin, subtle cheek highlight` |
| 피부 — 부분 매트 | `matte T-zone, controlled forehead shine, balanced dewy finish` |
| 피부 실패조건 짝 | `skin undertone preserved under split lighting` — 색온도가 갈린 조명에서 피부톤이 죽지 않게 같이 적는다 |
| 로고·워터마크 의도 | `clean, brand-free, copy-free finish` — 나머지 실패 축은 [실패 축의 결과형 재서술](#실패-축의-결과형-재서술) |

## 장르 조합
<!-- dict:genre_combo -->

| 장르 | 결과 토큰 묶음 |
|---|---|
| 패션 에디토리얼 | 큰 소프트키 + 중립 팔레트 + 얕은 초점면 + 지면형 여백 |
| 네온 누아르 | 현장 네온, 청록-주황 분리, 젖은 거리 반사, 낮은 기울기 |
| 스트리트 다큐 | 있는 빛만, 채도 한 단계 낮춤, 포착된 프레임, 앞뒤가 같이 읽힘 |
| 제품 히어로 | 소프트박스 그라데이션, 주인공만 받는 스폿, 찬 림, 지정 배경색 / 변주 아슬아슬한 적층 |
| 제품 플랫레이 | clean top-down flatlay + even soft light + generous margins + single hero with subordinate props |
| 한국 웹툰 | 부드러운 셀 그림자, 광택 있는 뷰티 마감, 이슬 하이라이트, 세로 스크롤 |

## 룩북 감도

### 화보와 갈리는 축

룩북은 명료·정확·반복, 화보는 서사다. 룩북은 담백한 배경·같은 앵글·고른 빛(화보는 장소가 내용), 스타일링을 줄여 구조·원단·디테일을 남김(화보는 겹침으로 긴장을 만듦), 컷마다 셋업을 고정(화보는 달라도 됨). 판매 컷과 화보 사이에 선다. 브랜드 이름 대신 아래 형식 특성으로 쓴다.

| 축 | 결과 토큰 |
|---|---|
| 의상 판독성 | `entire garment inside the frame with the hemline and both cuffs visible, seams and closures readable` |
| 실루엣 우선 | `silhouette separated from the background along its full outline, arms held away from the torso so the side seam reads` |
| 반복 프레이밍 | `identical camera height, distance and framing across every look, same key position, same pose repeated across colourways` |
| 배경 중립성 | `plain seamless backdrop in one flat tone, backdrop value one step away from the garment` |
| 로케이션 룩북 | `location reduced to a neutral architectural surface, signage kept out of frame` |
| 바닥 그림자 | `soft contact shadow directly beneath the feet only` |
| 표정·톤 일관성 | `neutral composed expression, gaze level to camera, same white balance and grade across the series` |
| 컷 — 풀렝스 | `full-length frame head to foot with margin above the crown and below the shoes` |
| 컷 — 3/4 | `three-quarter frame cut through the mid-thigh or the mid-calf, joints left intact` |
| 컷 — 백뷰·디테일 | `back view showing the yoke, back seam and hem from behind` / `close crop on the cuff, neckline or hem as worn, weave and stitch density resolvable` |
| 컷 — 무빙 | `walking mid-stride with fabric carrying momentum, one foot lifted` |
| 컷 — 플랫레이·고스트 | `garment laid flat on a plain surface, symmetric and wrinkle-free` / `garment holding its worn volume with the body absent inside` |

## 실패 축의 결과형 재서술

### 축별 재서술

배제는 원하는 상태로 되돌린다. 가운데 열은 대조용이며 프롬프트에 옮기지 않는다.

| 축 | 부정형(옮기지 않음) | 긍정형 재서술 |
|---|---|---|
| 손 기하 | extra fingers | `five separated fingers with natural knuckle articulation, one thumb per hand set apart` |
| 손–의상 접촉 | hands merging into fabric | `fingertips flat on the outside of the pocket edge, the pocket opening reading as its own line` |
| 손 회피(최저 리스크) | — | `hands relaxed behind the back` / `crop line above the wrists, hands entirely outside the frame` |
| 봉제·구조 | melted seams | `seams running continuously from shoulder to hem, stitch line visible at cuff and side` |
| 드레이프·두께 | impossible drape | `fabric falling with its own weight, folds originating at shoulder and waist, material thickness visible at hem and collar` |
| 패턴 정합 | mismatched pattern | `stripe alignment continuous across the side seam, pattern scale identical on every panel` |
| 의상 좌우 | asymmetric sleeves | `both sleeves ending at the same point on the wrist, placket straight down the centre front with evenly spaced buttons` |
| 신발·액세서리 | floating feet, broken chain | `both shoes symmetric with even sole thickness, both soles in full contact with the ground, one continuous chain with uniform link size, earrings matching as a pair` |
| 얼굴·눈 | deformed iris | `both irises circular and equal in diameter, matching catchlight in each eye, iris corneal reflex aligned symmetrically` |
| 신체 계수·비례 | extra limbs | `two arms and two legs, each traceable to one shoulder or hip joint, proportion around seven and a half heads` |
| 머리카락 경계 | melted hair | `hair strands separating cleanly against the background, flyaway strands at the crown` |
| 브랜드·문자 | logos, background text | `solid unmarked fabric face, clean brand-free finish, background surfaces plain, signage kept out of frame` |
| 장면 정합 | inconsistent shadows | `all cast shadows falling in the same direction from a single key camera left` |

## 표기 언어

언어와 정확 카피는 [../compiler.md](../compiler.md) §정확 카피, 인물·브랜드 보존은 [../compiler.md](../compiler.md) §제공된 피사체와 브랜드 보존을 따른다. 이 표의 영어 표현을 한국어와 겹쳐 넣지 않는다.
