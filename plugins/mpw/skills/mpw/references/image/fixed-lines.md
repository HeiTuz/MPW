# 고정 몫: 층마다 늘 붙는 줄

GPT Image(웹·API)·대상 미정인 새 이미지(인물 사진과 인물 없는 사진)와, 층 문안을 먼저 쓰고 엔진으로 펴는 다른 엔진의 새 이미지([engine-levers.md](engine-levers.md))에서 사용자가 말하지 않은 칸을 채우는 줄이다. 사진 추출에는 아래 '입력 용도별로 붙는 것'의 사진 추출 열이 정한 줄만 붙는다. 층의 모양·첫 줄·채우는 순서는 [image-brief.md](image-brief.md)가 정하고, 이 파일은 그 위에 붙는 줄과 끄는 조건만 정한다. 이 파일의 토큰(`liner`·`face-light`·`grain`·`lens`의 문화권별 토큰과 Finish 표의 토큰)은 사전에 없어도 그대로 쓴다. `<…>` 자리는 장면에 맞게 채운다. 요청한 룩에 카드가 있으면([looks/index.md](looks/index.md)) 아래 끄는 조건의 '룩'은 그 카드의 `끄는 고정 몫`을 뜻한다.

## 절차

1. 사용자 값과 요청한 룩으로 층을 먼저 채운다. 슬롯 하나에 값이 둘 이상일 때 무엇이 이기는지는 [image-brief.md](image-brief.md) §4 '비워 둔 층'의 한 줄 순서가 정한다(이 파일의 줄은 그 순서의 '고정 몫' 자리다). 룩 카드가 채웠거나 `끄는 고정 몫`으로 끈 슬롯에는 아래 줄을 붙이지 않는다(카드가 `realism`을 끄면 그 자리에 Finish의 `native resolution` 줄이 들어간다). 카드가 슬롯을 켠다고 적었으면 아래 각 줄의 일반 끄는 조건보다 그 처리가 먼저다.
2. 아래 표를 위에서 아래로 내려가며 줄마다 묻는다. 이 줄의 슬롯이 이미 채워졌나(카드·세트·사용자 줄이 그 줄의 사실을 이미 말했으면 채워진 것이다. 헤어 줄이 머리를 귀 뒤로 넘겼다고 썼으면 `face-clear`를 다시 쓰지 않는다)? 예면 건너뛴다. 끄는 조건에 걸리나? 예면 건너뛴다. 둘 다 아니면 그 층에 줄을 붙인다. 사용자가 그 줄의 내용을 빼 달라거나 정하지 말라고 했으면 그 줄도 건너뛴다(맨얼굴, "입자는 필요 없어", "나이는 정하지 마").
3. 다 쓴 뒤 [image-brief.md](image-brief.md) §9-7의 슬롯(입술·베이스·캐치라이트·얼굴 빛·장소·시간대·화면비·입자)이 하나씩인지 머릿속으로 훑는다. 둘이면 뒤에 붙인 것을 지운다.

기계 계약(PromptBundle 등)처럼 길이 상한이 좁으면 이 파일의 줄은 붙이지 않는다. Identity Reference 문단은 그대로 둔다.

## Identity Reference

문단 하나다(슬롯 identity·skin-tone·proportion). 문단 문안은 [image-brief.md](image-brief.md) §5가 정본이고, 그 `If none is provided,` 뒤에 아래 표의 `<문화권 공식>`을 쓴다. 성별에 맞춰 `woman`·`she`와 `man`·`he`를 바꾼다.

| 문화권 | `<문화권 공식>` |
|---|---|
| KR | she is a 22-year-old Korean woman with a 청순 face: soft, low-contrast features, a small face, a defined nose bridge, a clean jawline and fair, cool-toned skin |
| CN | she is a 22-year-old Chinese woman with 清冷 bone structure: a small 巴掌脸 face, a straight defined nose bridge, a clean jawline and cool fair 冷白皮 skin |
| JP | she is a 22-year-old Japanese woman with a soft 透明感 look: a small face, gentle features and clear, fair skin |
| US | she is a 22-year-old American woman with defined cheekbones, sun-warmed golden skin and a healthy, athletic build |
| FR | she is a 22-year-old French woman with clean defined bone structure, faint natural freckles across the nose and a slender build |
| 한·중·일 단서도 없음 | she is a 22-year-old East Asian woman with a small face, a defined nose bridge, a clean jawline and clear, fair skin |
| 그 밖 | she is a 22-year-old woman from <지역> with clearly defined bone structure and a slender build |

- 사용자가 나이·인종·외모 값을 줬으면 그 값만 바꾸고 나머지는 이 표를 쓴다. 숫자 나이를 정하지 말라고 했으면 `an adult`, 인종이나 체형을 정하지 말라고 했으면 그 말을 뺀다.
- 문화권 단서가 없으면 인물 공식은 '한·중·일 단서도 없음' 행(`East Asian`)이고 메이크업 줄(base·under-eye·liner·blush·lip)·grain 토큰·Finish는 KR 행이다.
- 문화권 공식과 문단 끝의 비율 문장(`In either case…`)은 **성인 인물에만** 붙는다. 아이·학생으로 요청됐거나 그렇게 보이면(판정은 image-brief.md §5) 공식 대신 `a child`·`a student` 같은 말만 쓰고(남성이면 같은 자리에 `a boy`·`a schoolboy`처럼 한 구절), 비율 문장과 아래 Hair and makeup의 미화 줄(base·under-eye·liner·blush·lip)을 모두 끈다. 룩 카드의 메이크업 줄(입술·블러셔·아이 메이크업)과 Legwear의 스타킹류 줄도 쓰지 않는다(양말은 쓴다). 그 밖의 층(Pose, Camera, Finish 포함)은 평소대로 쓴다(관능 어휘·노출은 image-brief.md §6).
- 대학생·대학원생은 성인이다(판정은 image-brief.md §5). 공식을 그대로 쓰고 `woman`·`man` 뒤에 `and university student`만 덧붙인다(`a 22-year-old Korean man and university student with a defined jawline and a lean build`). 비율 문장과 메이크업 줄도 성인대로 붙는다.
- 남성 인물: `a 22-year-old <culture> man with a defined jawline and a lean build`만 쓰고, 문단 끝 비율 문장은 `In either case he has natural 7.5-head proportions and level shoulders.`로 바꾼다. 고정 몫의 메이크업 줄과 룩 카드의 메이크업·네일 색·Legwear 줄은 사용자가 원할 때만 붙인다. 남성이 아이·학생이면 위 학생 처리가 먼저다.
- `identity`: 카드가 `끄는 고정 몫`의 `identity` 행에 덧붙임 구절을 주면, 참조가 없을 때 쓰는 인물 문장(`If none is provided, …`) 끝에 그 구절을 붙인다. 참조가 있을 때는 붙지 않는다(조건절이 참조의 피부색을 지킨다).

## Hair and makeup

성인이고 얼굴이 보일 때만 붙인다. `face-clear`만 예외로 아이·학생에게도 붙는다.

`base`·`under-eye`·`blush`·`lip`은 문화권마다 줄이 다르다. 문화권 단서가 없으면(위 Identity 표의 '한·중·일 단서도 없음' 행, 인물이 East Asian 기본이다) KR 줄을 토큰 그대로 쓴다. 인물이 `그 밖` 행이면 US 줄을 쓴다(영어 토큰). 아래 Finish 행 고르기와 같은 한 벌이다.

- `face-clear`: `face clear — The hair falls away from the face, tucked behind one ear, so the brows, eyes and jawline stay clear.` 끄는 조건: 사용자나 룩 카드가 얼굴을 가리는 머리(눈을 덮는 앞머리, 얼굴을 가로지르는 가닥, 얼굴에 붙는 바람맞은 머리)를 원함, 뒷모습. 이마가 비치는 시스루뱅과 젖은 머리는 걸리지 않는다.
- `base`: 문화권마다 한 줄(위 단서 없음·그 밖 규칙 포함). 끄는 조건: 사용자나 카드가 베이스를 정함, 맨얼굴.
  - KR `물광 피부 — A thin glossy base leaves a soft wet sheen on the cheekbones and nose bridge while pores still show.`
  - CN `冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.`
  - JP `透明感 — A sheer, low-coverage base with a faint cool correcting tint, so the skin reads clear and light.`
  - US `Skin Tint — A sheer tint that evens the color but leaves freckles and texture, with a soft glow on the cheekbones.`
  - FR `Teint nu — A bare-looking base with almost no coverage and natural color left on the cheeks.`
- `under-eye`: KR `애교살`, CN `卧蚕`, JP `涙袋メイク` 가운데 문화권에 맞는 토큰으로 `<토큰> — A soft pearly band under the lower lashes with a faint shadow line beneath it.` US·FR은 이 줄이 없다. 끄는 조건: 사용자나 카드가 눈 화장을 정함, 맨얼굴.
- `liner`: `<토큰> — A hair-thin dark line along the upper lash roots defines the eye with no visible wing.` 토큰은 CN `内眼线`, KR `점막 아이라인`, JP `インライン`, US·FR·그 밖 `tightline`. 끄는 조건: 사용자나 카드가 아이라인을 정함, 맨얼굴.
- `blush`: 끄는 조건은 사용자가 블러셔를 정함, 카드가 블러셔를 정하거나 끔, 맨얼굴.
  - KR `딸기우유 블러셔 — A soft milky pink blush spreads wide across the cheeks and nose and fades into the base with no hard edge.`
  - CN `rose blush — A soft rose wash sits high on the cheekbones and melts into the base with no visible edge.`
  - JP `桜色チーク — A soft sakura-pink wash of blush between the cheeks and temples melts into the base.`
  - US `Coral Blush — Coral-pink color on the cheeks with a slight shimmer that reads fresh and warm.`
  - FR `Rougeur naturelle — A soft pink flush on the cheeks and the tops of the ears melts into the base with no powder edge.`
  - 장면의 빛이 차가우면(흐린 날, 형광등, 푸른 시간, 회청 팔레트, 차가운 흰 플래시나 폰 화면빛) 어느 문화권이든 위 줄 대신 `muted rose blush — A low-saturation dusty-rose wash sits high on the cheeks and melts into the base with no visible edge.`를 쓴다. 후속 수정에서 Light만 차갑게 바꿀 때도 이 줄로 블러셔를 고친다.
- `lip`: 끄는 조건은 사용자나 카드가 입술을 정함, 맨얼굴.
  - KR `그라데이션 립 — Lip color is pressed into the center of the lips and blurred outward so it fades softly toward the edges.`
  - CN `豆沙唇 — A muted rosy-brown matte lip with a softly blurred edge and no gloss.`
  - JP `シアーリップ — A sheer coral-red tint on the lips, soft and slightly translucent, with the natural lip line still showing through.`
  - US `Glazed Lips — Soft peach-beige lips under a milky gloss, shiny in the center.`
  - FR `Bouche mordue — Deep red lip color dotted in the center of the lips and tapped outward so it fades with no sharp outline.`

## Light

- `face-light`: `<토큰> — The key light falls from slightly above and to one side, so the nose bridge, cheekbones and lips carry soft highlights and the far cheek turns gently into shadow.` 토큰은 CN `立体光`, 그 밖은 영어 `soft key light`다. 끄는 조건: 사용자나 룩 카드가 얼굴 빛을 이미 정함(네온 분할, 직광 플래시, 역광 실루엣), 장면의 빛이 방향 없는 확산광(흐린 날, 그늘, 안개), 얼굴이 안 보임.
- `catchlight`: `catchlight — A small <창·램프·하늘> shaped point of light sits in each eye.` `<…>`는 Light 층의 주광원으로 고른다(창, 실내등은 램프, 야외·흐린 날은 하늘). 끄는 조건: 사용자나 카드가 캐치라이트를 정함, 눈이 안 보임(뒷모습, 선글라스, 감은 눈). 빛 사실이라 Light 층에 쓴다.

## Optics

- `grain`(필름 매체): `<토큰> — Fine, even film grain sits across the whole frame, slightly heavier in the shadows.` 토큰은 CN `胶片颗粒`, KR `필름 그레인`, JP `粒状感`, US·FR·그 밖 `film grain`이다. 끄는 조건: 매체가 필름이 아님, 카드가 입자 줄을 줌, 사용자가 입자의 양을 정함이나 입자를 빼 달라고 함.
- `grain`(디지털 매체): `<토큰> — Very fine digital noise sits only in the darkest parts of the frame.` 토큰은 CN `数码噪点`, KR `디지털 노이즈`, JP `デジタルノイズ`, US·FR·그 밖 `digital noise`다. 끄는 조건: 매체가 디카·폰이 아님, 카드가 입자 줄을 줌, 사용자가 입자를 정함이나 빼 달라고 함.

필름 입자는 화면 전체에 고르게 쓰고, 디지털 노이즈는 가장 어두운 곳에만 쓴다. 양은 사용자가 정하고, 정하지 않았으면 위 문장이다.

## Camera

- `framing`+`ratio`: `vertical frame — A vertical 3:4 frame from <위> to <아래>, <인물의 자리 한 구절>.` 사용자 비율이 없고 비율 설정이 없는 표면이면 인물 사진은 3:4 세로다. 사용자 비율이 있으면 그 비율과 방향으로 쓴다. 쌍·세트·요청이 범위를 말하지 않으면 중심 층이 정한다. 중심 층은 요청이 말한 것이다: 옷·신발·전신 자세면 머리부터 발끝, 얼굴·화장·표정이면 가슴 위, 그 밖은 허리 위.

  | 중심 층 | 프레이밍 |
  |---|---|
  | Outfit·Legwear·전신 자세 | 머리부터 발끝, 중망원 |
  | Hair and makeup·Expression | 가슴 위, 눈높이 |
  | Props and nails | 허리 위, 손이 프레임 안 |
  | 그 밖 | 허리 위 |

  끄는 조건: 사용자가 프레이밍을 정함, 카드의 포즈·구도 쌍이 프레임 범위를 직접 말함(기본 줄의 위·아래 범위를 쓰지 않고 방향·비율 한 문장 `vertical frame — A vertical 3:4 frame.`만 쓰며 범위는 쌍의 Camera 줄에서 한 번만 말한다), 비율을 API `size` 같은 설정으로 넘김(이때는 비율만 빼고 프레이밍은 쓴다).
  카드의 `ratio` 행이 정사각이나 가로를 정했으면 `vertical frame`과 `A vertical 3:4 frame`을 통째로 바꾼다: `square frame — A square 1:1 frame from <위> to <아래>, <인물의 자리 한 구절>.`, `horizontal frame — A horizontal 4:3 frame from <위> to <아래>, <인물의 자리 한 구절>.`(비율은 카드가 정한 값이고 `vertical`을 남기지 않는다).
- `lens`: `<토큰> — The camera stands back with a standard-to-moderate telephoto lens, so the face keeps natural perspective with no wide-angle stretch on the nose or forehead.` 렌즈 줄 하나 규칙과 출처 순서는 image-brief.md §3. 카메라 높이는 쌍의 Camera 줄이나 위 `framing` 줄이 정한다. 끄는 조건: 셀카, POV, 광각·어안 룩, 사용자·카드·쌍이 렌즈를 정함(`长焦压缩`·`超广角畸变` 같은 렌즈 줄, 렌즈를 말하는 Optics의 카메라 본체 줄 포함). 토큰은 CN `自然透视`, 그 밖은 영어 `natural perspective`다.

## Finish

마지막 층이다. 사진 매체의 새 이미지에 붙는다. 빛에 관한 사실은 쓰지 않는다(빛은 Light 층의 몫이다). 세 줄의 토큰은 아래 표에서 문화권에 맞는 말로 고른다. 문장은 어느 문화권이든 영어다.

| 문화권 | `closer` 기본(카드가 없을 때) | `realism` 토큰 | `anti-cg` 토큰 |
|---|---|---|---|
| CN | `实拍` | `超写实` | `真人实拍` |
| KR | `실사` | `극사실` | `실사 촬영` |
| JP | `写真` | `高精細` | `実写` |
| FR | `Photographie` | `photoréaliste` | `prise de vue réelle` |
| US·그 밖(영어) | `photograph` | `photorealistic` | `real photograph` |

행은 룩 카드가 있으면 카드의 문화권(갈래가 다른 문화권의 장면을 정하면 갈래의 것)으로, 카드가 없으면 요청한 장소·말·사진 속 장소의 문화권으로 고른다. 문화권 단서가 없으면 KR 행이다(Identity의 '한·중·일 단서도 없음' 행). 인물이 `그 밖` 행이면 마지막 행이다. 사진 추출은 사진 속 장소의 문화권을 쓴다.

- `closer`: `<closer 토큰> — The whole frame reads as <첫 줄의 매체>, not a <반대 매체>.` 카드의 고정 사실이 closer 토큰을 주면 그것을 쓰고(왕가위 카드는 `港片剧照`, 반대 매체는 스냅·화보), 카드가 없으면 위 표의 `closer` 기본으로 `<closer 기본> — The whole frame reads as a real <첫 줄의 매체>.`를 쓴다. 매체 이름이 `photograph`·`snapshot`·`still`로 끝나지 않으면 끝에 `photograph`를 붙인다(`clean digital`이면 `a real clean digital photograph`, `candid street-style photograph`면 이름 그대로). 사진 추출에서 카드가 없으면 사진 문화권의 말로 부른 매체 이름도 closer 토큰이 된다(일본 스냅이면 `実写スナップ`). 끄는 조건 없음.
- `realism`: `<realism 토큰> — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the fabric, real wear on the surfaces.` 인물 없는 사진은 `real <장면의 재질 둘> and real wear on the surfaces`로 바꾼다. 끄는 조건: 그림·3D 매체를 요청함. 사용자가 피부 디테일을 빼 달라고 했으면 `real pores on the skin,`만 뺀다. 매체의 해상도가 낮으면 위 줄 대신 매체의 해상도를 말하는 줄을 쓴다. 해상도가 낮은 매체는 카드의 `끄는 고정 몫`에 `realism`이 적힌 경우, 그리고 카드가 없어도 첫 줄의 매체가 일회용·토이·인스턴트·폰·소형 CCD·비디오테이프(캠코더)인 경우다. 16mm 필름, 강하게 푸시한 흑백, 굵은 입자가 정체인 필름도 같다(그 매체의 입자가 모공을 가린다). 일반 35mm·중형 필름은 위 줄을 그대로 쓴다: `native resolution — The frame holds the resolution of a <그 매체> and no more: <그 매체가 만드는 질감 한 구절>.` 입자가 굵거나 해상도가 낮은 매체(캠코더, 토이, 일회용, 16mm, 강한 푸시)는 모공이 안 보이는 본보기를 쓴다: `native resolution — The frame holds the resolution of a 480-line camcorder and no more: soft edges, smeared fine texture and skin that shows no individual pores.`, 16mm이면 `native resolution — The frame holds the resolution of 16mm film and no more: coarse grain over softened fine detail and skin that shows no individual pores.` 입자가 고운 필름(푸시 없는 흑백)은 가장자리만 부드럽고 피부 결이 남는 본보기를 쓴다: `native resolution — The frame holds the resolution of fine-grained 35mm black-and-white film and no more: fine grain and slightly soft edges while the skin texture stays readable.` 이 줄에는 숫자 품질 표기를 쓰지 않는다. 금지 한 줄(`anti-cg`)은 그대로 붙는다.
- `anti-cg`: `<anti-cg 토큰> — A real person photographed on location, never an illustration, anime frame, 3D render or plastic-skinned CGI.` 인물 없는 사진은 `<anti-cg 토큰> — A real photograph of a real <장소·사물>, never an illustration, 3D render or CGI.`를 쓴다. 끄는 조건: 그림·애니·3D를 요청함.

한국어 문안(사용자가 프롬프트 언어를 한국어로 지정한 경우)은 층 이름(`## 마무리`)과 줄의 문장만 한국어로 쓴다. 토큰은 영어 문안과 같은 규칙으로 고른다. closer는 카드가 있으면 카드의 closer 토큰을 원어 그대로(왕가위 카드면 `港片剧照`), 카드가 없으면 위 표의 문화권 행 closer이고, realism·anti-cg 토큰도 그 문화권 행이다. 줄 뜻은 위 영어 줄과 같고(`realism` 줄에는 영어 줄처럼 `8K`를 넣는다), `3D`·`CGI`는 `삼차원`·`컴퓨터 그래픽`으로 풀어 쓴다. 인물 없는 사진도 같은 형태다. 나머지 고정 줄도 토큰은 그대로 두고 문장만 아래 한 벌처럼 옮긴다(`<…>` 자리는 장면에 맞게 채운다).

```text
## 머리카락과 메이크업
face clear — 머리카락이 얼굴에서 떨어져 한쪽 귀 뒤로 넘어가 있어 눈썹, 눈, 턱선이 가려지지 않는다.
물광 피부 — 얇고 윤기 있는 베이스가 광대뼈와 콧대에 촉촉한 광을 남기고, 모공은 그대로 비친다.

## 조명
soft key light — 주광이 조금 위쪽 한 방향에서 떨어져 콧대, 광대뼈, 입술에 부드러운 하이라이트가 얹히고 먼 쪽 뺨은 천천히 그림자로 넘어간다.
catchlight — 작은 <창·램프·하늘> 모양의 빛점이 양쪽 눈에 하나씩 맺힌다.

## 광학
디지털 노이즈 — 아주 고운 디지털 노이즈가 프레임의 가장 어두운 곳에만 깔린다.

## 카메라
vertical frame — <위>부터 <아래>까지 담는 3:4 세로 프레임이고, <인물의 자리 한 구절>.
natural perspective — 카메라가 표준에서 중망원 사이 렌즈로 물러서 있어 얼굴이 자연스러운 원근을 유지하고 코와 이마가 광각처럼 늘어나지 않는다.

## 마무리
실사 — 프레임 전체가 <첫 줄의 매체>로 읽히고 <반대 매체>가 아니다.
극사실 — 8K 극사실적인 사진 디테일: 피부의 실제 모공, 옷감의 실제 짜임, 표면의 실제 닳은 흔적.
실사 촬영 — 실제 인물을 현장에서 촬영한 사진이며 일러스트, 애니메이션 프레임, 삼차원 렌더, 컴퓨터 그래픽의 매끈한 피부가 아니다.
```

저해상 매체는 `극사실` 줄 자리에 아래 줄을 쓴다.

```text
native resolution — 프레임은 480라인 캠코더의 해상도만 담는다: 가장자리는 부드럽고 고운 질감은 번지며 피부에 모공이 하나하나 보이지 않는다.
```

## 입력 용도별로 붙는 것

| 고정 몫 | 새 이미지, 참조 없음 | 새 이미지, 인물 참조 | 사진 추출, 참조 없이 | 사진 추출, 참조 얼굴로 재현 | 원본 편집 | 아이·학생 | 인물 없는 사진 |
|---|---|---|---|---|---|---|---|
| 문화권 공식(미화) | 붙임 | 조건절에 있지만 참조가 이김 | 붙임. 문화권은 장면 단서로 정하고 사진 속 얼굴은 옮기지 않음 | 조건절에 있지만 참조가 이김 | 없음 | 끔 | 없음 |
| skin-tone keep | 문단에 있음 | 작동 | 문단에 있음 | 작동 | 없음 | 문단에 있음 | 없음 |
| 비율 문장 | 붙임 | 붙임 | 몸이 보이는 성인이면 붙임 | 같음 | 없음 | 끔 | 없음 |
| face-clear | 붙임 | 붙임 | 사진이 정함 | 같음 | 없음 | 붙임 | 없음 |
| 메이크업 5슬롯(base·under-eye·liner·blush·lip) | 비어 있는 슬롯만 | 비어 있는 슬롯만 | 보이는 슬롯은 사진. 판독이 흐린 슬롯만 카드, 고정 몫 순 | 같음(메이크업은 프롬프트가 정해 참조와 부딪히지 않음) | 없음 | 끔 | 없음 |
| catchlight | 붙임 | 붙임 | 눈에 보이면 | 같음 | 없음 | 붙임 | 없음 |
| face-light | 붙임 | 같음 | 사진의 빛대로 | 같음 | 없음 | 붙임 | 없음 |
| grain | 매체가 필름·디카면 | 같음 | 사진에 보이는 양을 Optics 한 줄로 | 같음 | 없음 | 같음 | 같음 |
| framing·ratio | 3:4 세로 기본 | 같음 | 사진의 비율과 잘린 자리 | 같음 | 원본 크롭 | 같음 | 기본 비율 없음 |
| lens 자연 원근 | 붙임 | 붙임 | 사진대로 | 같음 | 없음 | 붙임 | 없음 |
| Finish 3줄 | 붙임 | 붙임 | 붙임(매체가 사진이면). closer는 사진의 매체 이름 | 같음 | 없음 | 붙임 | 붙임(사람 문장 대신 장소 문장) |

사진 추출의 '화면 밖은 비우고 화면 안에서 판독이 흐린 칸만 채운다'는 규칙은 [image-brief.md](image-brief.md) §12.0이 정한다.
