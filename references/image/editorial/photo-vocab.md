# 에디토리얼 패션 — 사진 어휘

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

## 7. 사진 어휘 풀 — 결과 기반 토큰

판정문: gpt-image-2에는 카메라·조명 장비명을 그대로 박지 말고 **결과(빛·심도·질감·색)**로 환원해서 쓴다. 표현은 긍정형 기본 + 티어 화이트리스트다. 장면 배제 부정문은 0개, `no ~`는 Tier-1/Tier-2 캐노니컬 문구로만 쓴다. SD 품질태그·가중치 문법은 쓰지 않는다.

### 7.1 심도·렌즈 character·카메라 높이 (결과로)

원근 왜곡을 만드는 건 초점거리가 아니라 **카메라–피사체 거리**다. 그래서 `85mm`보다 "카메라가 멀고 얼굴 평면이 눌렸다"는 결과가 인과적으로 정확하고, 장비명을 학습하지 않은 모델에도 전달된다. 철칙 4의 물리적 근거다.

| 축 | 결과 토큰 |
|---|---|
| 광각 느낌 | `camera close to the subject, near features enlarged relative to far ones, wide field of view, mild edge stretch, deep focus front-to-back` |
| 표준 | `natural perspective, proportions as the eye reads them, subject and setting in proportion` |
| 중망원(인물 기본) | `camera stepped back, facial planes holding flattering proportion, background pushed back and softened` |
| 망원/압축 | `distant camera position, compressed perspective, flattened planes, subject lifted from a soft background`. 더 밀면 `background collapsed into a flat plane directly behind the subject` |
| 얕은 심도 | `shallow depth of field, eyes sharp with the shoulder line already falling off, background dissolved into creamy blur` |
| 깊은 심도(룩북) | `garment surface sharp from collar to hem, fabric weave resolvable, background separated by luminance step, not by defocus`(블러 대신 톤 차이로 분리해야 옷의 정보가 남는다) |
| 빈티지 보케 | `swirly painterly bokeh, gentle vintage rendering` |
| 아나모픽 | `wide cinematic frame, horizontal flares, oval highlights` |
| 가장자리 감쇠 | `sharp central microtexture, soft edge focus falloff`(중심부 미세결은 선명, 프레임 가장자리만 점진적으로 풀림) |

**카메라 높이**가 전신 비율의 실제 지배 변수다. 앵글(§7.5)과 겹치지 않는 별개 축으로 명시한다.

| 축 | 결과 토큰 |
|---|---|
| 전신 표준 | `camera at the subject's waist-to-chest height, leg length rendered true, hip-to-hem line reading full`. 눈높이에서 내려보면 `lower body foreshortened, legs reading shorter`가 되므로 룩북에선 회피 |
| 로우앵글 | `camera below waist height looking up, subject monumental, hemline dominant, ceiling or sky entering the frame` |
| 상반신·뷰티 | `camera at the subject's eye height, facial verticals staying parallel` |

### 7.2 조명 (방향·질·결과)

**클램셸이 패션 에디토리얼·뷰티의 기본 셋업**이고, 지시가 없으면 여기서 출발한다. 광질을 가르는 건 장비가 아니라 **피사체에서 본 광원의 겉보기 크기**다 — 크고 가까우면 소프트, 작고 멀면 하드다.

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
| 질 — 레이킹 | `low-angle soft light, gentle relief shadows`(낮은 측면의 넓은 연질광이 돌출부만 밝히고 홈·굴곡엔 완만한 그림자) |
| 비율 | 표기는 **키측:그림자측**, 배수가 곧 스톱이다. `1:1` 평탄(0스톱) / `2:1` 자연·그림자 디테일 유지(1스톱) / `4:1` 드라마틱(2스톱) / `8:1` 로우키·암부 near-black(3스톱). 숫자 단독 금지 — `key:fill 4:1, pronounced shadow side, shadow detail thinning`처럼 결과와 병기한다(철칙 10) |
| 룩북 기본광 | `large soft key with a broad white bounce filling the shadow side, low overall contrast, every shadow still holding the seam and the fold`(옷이 주인공이므로 폴리보드 필로 대비를 낮춘다) |
| 보조 | `cool rim light separating the edge`, `warm practical glow`, `window light from camera left`, `bounce from below lifting the shadow under the jaw` |
| 시간광 | golden hour 따뜻한 저각광 / blue hour 차분한 한기 / 정오 톱라이트 = `short dense nose shadow, shadowed eye sockets` |
| 색온도 분리 | `split color-temperature lighting, warm key on skin, cool background wash`(인물이 앞으로 분리되고 공간 깊이가 생김) / 변주 `cool key on subject, warm tungsten practical background` |
| 하이키 스튜디오 | `high-key white studio, large negative space, clean editorial margins`(순백 배경과 긴 여백이 인물·의상 실루엣을 선명하게 밀어 올림) |

**캐치라이트 형태 = 모디파이어 형태의 각막 반사.** 클로즈업 리얼리즘의 가장 싼 레버다.

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

### 7.3 색·그레이딩 (HEX·켈빈·룩)

**그레이딩은 스킨 외 영역에 걸고 스킨은 중립으로 남긴다**(휘도 마스크). teal & orange를 얼굴에 그대로 걸어 피부가 오렌지로 무너지는 게 가장 흔한 실패다.

| 축 | 규칙 |
|---|---|
| 팔레트 | 항상 HEX 3~5개 |
| 색온도 | 켈빈 또는 `warm 3200K-feel` / `neutral` / `cool` |
| 조화 | complementary / analogous / triadic |
| 룩 | teal & orange, bleach bypass(저채도 고대비), desaturated muted, warm filmic roll-off |
| 스킨 보호 기본 | `warm grade applied to background and negative space, skin left neutral and true to its own undertone` |
| 스킨 보호 — 저채도 | `desaturated overall palette with skin retaining natural warmth and blood tone` |
| 스킨 보호 — 틸 섀도 | `teal shift confined to the shadows and the background, skin midtones untouched` |
| 필름 결과 | Portra 룩 = `warm skin, soft pastel midtones, gentle highlight roll-off`; Tri-X = `high-contrast monochrome, visible grain`; CineStill 800T = `tungsten night palette, soft red halation around highlights` |

### 7.4 필름/매체 3파트

```text
[필름 emulation] — [스킨], [섀도], [하이라이트]. [매거진/매체] characteristic roll-off
```

예: `Kodak Portra 400 emulation — warm luminous skin, soft green-leaning shadows, creamy highlights. Editorial magazine roll-off.`

배치 순서는 철칙 10의 조합 공식을 따른다. 예: `Kodak Portra 400 film photography, soft window light from camera left, slightly overexposed highlights, warm creamy skin tones, fine film grain, low contrast, quiet romantic mood.`

#### 필름 스톡 결과 사전 (단어 단독 금지 — 결과·장면과 병기)

| 스톡 | 결과 묘사 | 어울리는 장면 | 영어 토큰 |
|---|---|---|---|
| Kodak Portra 400 | 부드러운 피부톤 · 크리미한 색감 · 낮은 대비 | 웨딩 · 인물 · 자연광 스냅 | `soft creamy skin, warm natural light, fine film grain` |
| Kodak Portra 800 | 크리미한 화이트 · 부드럽게 날린 하이라이트 · 로맨틱 | 웨딩 · 실내 인물 | `creamy white tones, soft blown-out highlights, warm glowing skin` |
| Kodak Gold 200 | 따뜻한 노란빛 · 선명한 색감 · 레트로 무드 | 일상 · 여행 · 가족사진 | `warm golden tones, everyday snapshot, retro feeling` |
| Fujifilm Pro 400H | 낮은 채도 · 부드러운 그린톤 · 청량함 | 숲 · 바다 · 자연 | `low saturation, soft green shift, dreamy softness` |
| Kodak Ektar 100 | 높은 채도 · 선명한 디테일 · 또렷함 | 풍경 · 건축 · 하늘 | `high saturation, sharp detail, vivid colors` |
| Ilford HP5 | 강한 명암 · 거친 그레인 · 흑백 다큐 무드 | 거리 스냅 · 흑백 인물 | `black and white, strong contrast, heavy grain` |

#### 노출·기법 결과 사전

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

#### 감성 프리셋 (라벨 = 설명 + 키워드 블록, 필름/룩 이름과 병기)

| 감성 | 결과 묘사 | 키워드 블록 |
|---|---|---|
| 숲속 필름 | 습한 공기 · 낮은 채도 · 그린 그림자 | `Pro 400H-look, overexposed by one stop, green color shift, humid forest atmosphere, soft film grain` |
| 디스포저블 스냅 | 파스텔톤 · 핑크/크림 계열 · 소프트 포커스 | `disposable camera aesthetic, soft pastel tones, slight lens distortion, nostalgic snapshot` |
| 흐린 날 다큐 | 회색 하늘 · 다큐멘터리 무드 · 차분한 도시감 | `overcast diffused daylight, cool grey undertones, heavy visible grain, melancholic realism` |
| 시안 실험 | 시안·블루 색감 · 차갑고 몽환적 | `cross-processed film, cyan and blue shift, cool teal shadows, experimental film look` |
| 웨딩 필름 | 크리미한 화이트 · 자연광 · 로맨틱 | `Portra 800-look, creamy white tones, soft blown-out highlights, warm glowing skin` |
| 플래시 스냅 | 순간 포착 · 직사 플래시 · 생활감 | `snapshot aesthetic, direct flash, imperfect composition, natural unposed moment` |

### 7.5 구도·시지각

| 축 | 어휘 |
|---|---|
| 분할 | rule of thirds, golden ratio, centered iconic |
| 여백 | 카피용 여백 확보, 매거진 여백, Ma(여백의 호흡) |
| 유도 | leading lines, 시선 궤적, 삼각 안정, 소품 위계 = `subordinate prop contrast, context props below hero`(소품을 히어로보다 낮은 대비로 두어 맥락은 주되 주 피사체를 가리지 않음) |
| 샷 사이즈 | ECU(극클로즈업) → CU → MS(미디엄) → FS(전신) → EWS(원경) |
| 앵글 | eye-level / low(우러름) / high(내려봄) / over-the-shoulder / dutch(기울임) |
| 거리 | 카메라-피사체 거리를 m로 명시 |
| 커버 크롭 | `upper-body fashion close-up, tilted head crop, clean cover portrait`(얼굴·주얼리·의상 일부만 크게 잘라 뷰티와 패션 정보를 동시에 압축) |
| 커버 크롭 변주 | `gesture beauty crop`(손·주얼리가 얼굴 일부를 가림) / `asymmetric cover crop`(대각 축으로 밀어 비대칭) |
| 풀블리드 매크로 | `full-frame surface macro, texture filling the frame edge to edge, the surface itself as subject`(용기·배경 없이 질감이 주제가 됨) |

### 7.6 재질·후처리 (결과)

| 축 | 결과 토큰 |
|---|---|
| 표면 반응 | `matte buttery surface`, `wet specular highlights`, `translucent subsurface glow`, `thick applied paste, built-up edges, metallic sheen`(두꺼운 도포면·뭉친 가장자리), `fine aerated pores, matte whipped density`(미세 기공·저광택), `textured limestone surface, mineral pitting, chalky matte`(균열·구멍 있는 흰 석회암 면), `crochet and raffia texture, hand-made resort craft detail`(수공예 질감) |
| 마감 | `subtle film grain`, `gentle vignette`, `halation around bright edges`, `clean unbranded finish` |
| 피부 | `natural skin texture, visible pores, subtle film grain`, fine facial texture, soft tonal variation, fine vellus hair |
| 피부 — 촉촉 | `hydrated skin base, moisture-rich finish, dewy but natural skin` |
| 피부 — 유리알 투명 | `translucent skin clarity, visible texture, non-plastic glow`(반투명하되 모공은 유지) |
| 피부 — 꿀광 | `inner honey glow, warm luminous skin, subtle cheek highlight` |
| 피부 — 부분 매트 | `matte T-zone, controlled forehead shine, balanced dewy finish` |
| 피부 실패조건 짝 | `skin undertone preserved under split lighting` — §7.2 색온도 분리 조명에서 피부톤이 죽지 않게 병기 |
| 로고·워터마크 의도 | `clean, brand-free, copy-free finish` — 나머지 실패 축은 §7.9 |

### 7.7 장르 즉시조합

| 장르 | 결과 토큰 묶음 |
|---|---|
| 패션 에디토리얼 | soft diffuse key + neutral palette + shallow DoF + magazine margins |
| 네온 누아르 | practical neon glow, teal&orange, wet reflective street, low-angle dutch |
| 스트리트 다큐 | available light, slightly desaturated, candid framing, deep focus |
| 제품 히어로 | clean softbox gradient, single hero spotlight, cool rim, HEX 배경 / 변주 gravity-balanced stacking, implied instability(아슬아슬한 균형 구성) |
| 제품 플랫레이 | clean top-down flatlay + even soft light + generous margins + single hero with subordinate props |
| 한국 웹툰 | soft cel shading, glossy K-beauty finish, dewy highlights, vertical scroll |

#### 룩북 감도 — 화보와 갈리는 축

룩북의 목적은 명료성·정확성·일관성, 화보의 목적은 서사다. 룩북은 클린 배경·동일 앵글·균일 조명(화보는 로케이션이 곧 내용), 스타일링 절제로 구조·원단·디테일 보존(화보는 레이어링으로 긴장 생성), 전 컷 동일 셋업(화보는 컷마다 달라도 됨). 이커머스와 에디토리얼 사이에 선다. 브랜드 거명 대신 아래 형식 특성으로 쓴다.

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

### 7.8 국문/영문 혼용 규칙

정본은 [../compiler.md](../compiler.md) §7이다 — 장면 골격·무드·문화 부하 명사는 한국어, 기법 토큰(심도·조명·필름·포즈 술어)과 티어 고정 문구는 영어, 렌더 텍스트는 한 줄 한 언어. 이 파일의 어휘를 배치할 때 그 규칙을 따른다. 인물 신원은 고정 디테일로 쓰고, 실재 인물·상표 대신 가상 페르소나/브랜드를 쓴다.

### 7.9 실패 지점 → 긍정형 재서술

철칙 2 Tier-0은 부정문 0개다. 패션에서 실제로 무너지는 **축**만 긍정형으로 되돌린다. 가운데 열은 대조용이며 프롬프트에 옮기지 않는다.

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
