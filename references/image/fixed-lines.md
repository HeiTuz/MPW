# 고정 몫: 층마다 늘 붙는 줄

GPT Image 웹·대상 미정인 새 이미지(인물 사진과 인물 없는 사진)에서 사용자가 말하지 않은 칸을 채우는 줄이다. 층의 모양·첫 줄·채우는 순서는 [image-brief.md](image-brief.md)가 정하고, 이 파일은 그 위에 붙는 줄과 끄는 조건만 정한다. 이 파일의 토큰(`立体光`, `数码噪点`, `无畸变`, `实拍`, `超写实`, `真人实拍`)은 사전에 없어도 그대로 쓴다. `<…>` 자리는 장면에 맞게 채운다. 요청한 룩에 카드가 있으면([looks/index.md](looks/index.md)) 아래 끄는 조건의 '룩'은 그 카드의 `끄는 고정 몫`을 뜻한다.

## 절차

1. 사용자 값과 요청한 룩으로 층을 먼저 채운다. 룩 카드가 있으면 카드의 고정 사실, 고른 갈래의 줄, `끄는 고정 몫`이 먼저이고, 카드가 채웠거나 끈 슬롯에는 아래 줄을 붙이지 않는다.
2. 아래 표를 위에서 아래로 내려가며 줄마다 묻는다. 이 줄의 슬롯이 이미 채워졌나? 예면 건너뛴다. 끄는 조건에 걸리나? 예면 건너뛴다. 둘 다 아니면 그 층에 줄을 붙인다. 사용자가 그 줄의 내용을 빼 달라거나 정하지 말라고 했으면 그 줄도 건너뛴다(맨얼굴, "입자는 필요 없어", "나이는 정하지 마").
3. 다 쓴 뒤 슬롯 시트를 머릿속으로 한 번 훑는다(답변에 쓰지 않는다): 입술 하나, 베이스 하나, 캐치라이트 하나, 얼굴 빛 하나, 장소 하나, 시간대 하나, 화면비 하나, 입자 하나. 둘이면 뒤에 붙인 것을 지운다.

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
- 문화권 공식과 문단 끝의 비율 문장(`In either case…`)은 **성인 인물에만** 붙는다. 아이·학생으로 요청됐거나 그렇게 보이면 공식 대신 `a child`·`a student` 같은 말만 쓰고, 비율 문장과 아래 Hair and makeup의 미화 줄(base·under-eye·liner·blush·lip)을 모두 끈다. 아이·학생에게는 관능 어휘와 노출 연출을 붙이지 않는다.
- 남성 인물: `a 22-year-old <culture> man with a defined jawline and a lean build`만 쓴다. 메이크업 줄은 사용자가 원할 때만 붙인다.
- 모델 참조가 첨부되면 문단의 조건절 덕에 문화권 공식은 저절로 무시되고, `keep her own skin tone`이 참조의 피부색을 지킨다.
- 실존 인물을 닮게 하는 이름·얼굴 기하는 쓰지 않는다.

## Hair and makeup

성인이고 얼굴이 보일 때만 붙인다.

- `face-clear`: `face clear — The hair falls away from the face, tucked behind one ear, so the brows, eyes and jawline stay clear.` 끄는 조건: 사용자나 룩 카드가 머리가 얼굴을 지나가길 원함(앞머리, 젖은 머리, 바람), 뒷모습.
- `base`: 문화권마다 한 줄. 끄는 조건: 사용자나 카드가 베이스를 정함, 맨얼굴.
  - KR `물광 피부 — A thin glossy base leaves a soft wet sheen on the cheekbones and nose bridge while pores still show.`
  - CN `冷白瓷肌 — A semi-matte cool porcelain base with a faint satin glow only on the high points.`
  - JP `透明感 — A sheer, low-coverage base with a faint cool correcting tint, so the skin reads clear and light.`
  - US `Skin Tint — A sheer tint that evens the color but leaves freckles and texture, with a soft glow on the cheekbones.`
  - FR `Teint nu — A bare-looking base with almost no coverage and natural color left on the cheeks.`
- `under-eye`: KR `애교살`, CN `卧蚕`, JP `涙袋メイク` 가운데 문화권에 맞는 토큰으로 `<토큰> — A soft pearly band under the lower lashes with a faint shadow line beneath it.` US·FR은 이 줄이 없다. 끄는 조건: 사용자나 카드가 눈 화장을 정함, 맨얼굴.
- `liner`: `内眼线 — A hair-thin dark line along the upper lash roots defines the eye with no visible wing.` 끄는 조건: 사용자나 카드가 아이라인을 정함, 맨얼굴.
- `blush`: 끄는 조건은 사용자가 블러셔를 정함, 카드가 블러셔를 정하거나 끔, 맨얼굴.
  - KR `딸기우유 블러셔 — A soft milky pink blush spreads wide across the cheeks and nose and fades into the base with no hard edge.`
  - CN `rose blush — A soft rose wash sits high on the cheekbones and melts into the base with no visible edge.`
  - JP `桜色チーク — A soft sakura-pink wash of blush between the cheeks and temples melts into the base.`
  - US `Coral Blush — Coral-pink color on the cheeks with a slight shimmer that reads fresh and warm.`
  - FR `Rougeur naturelle — A soft pink flush on the cheeks and the tops of the ears melts into the base with no powder edge.`
- `lip`: 끄는 조건은 사용자나 카드가 입술을 정함, 맨얼굴.
  - KR `그라데이션 립 — Lip color is pressed into the center of the lips and blurred outward so it fades softly toward the edges.`
  - CN `豆沙唇 — A muted rosy-brown matte lip with a softly blurred edge and no gloss.`
  - JP `水紅 — A thin, translucent coral-red lip color, soft and slightly sheer, like stained paper.`
  - US `Glazed Lips — Soft peach-beige lips under a milky gloss, shiny in the center.`
  - FR `Bouche mordue — Deep red lip color dotted in the center of the lips and tapped outward so it fades with no sharp outline.`

## Light

- `face-light`: `立体光 — The key light falls from slightly above and to one side, so the nose bridge, cheekbones and lips carry soft highlights and the far cheek turns gently into shadow.` 끄는 조건: 사용자나 룩 카드가 얼굴 빛을 이미 정함(네온 분할, 직광 플래시, 역광 실루엣), 얼굴이 안 보임.
- `catchlight`: `catchlight — A small <창·램프·하늘> shaped point of light sits in each eye.` 끄는 조건: 사용자나 카드가 캐치라이트를 정함, 눈이 안 보임(뒷모습, 선글라스, 감은 눈). 빛 사실이라 Light 층에 쓴다.

## Optics

- `grain`(필름 매체): `胶片颗粒 — Fine, even film grain sits across the whole frame, slightly heavier in the shadows.` 끄는 조건: 매체가 필름이 아님, 카드가 입자 줄을 줌, 사용자가 입자의 양을 정함이나 입자를 빼 달라고 함.
- `grain`(디지털 매체): `数码噪点 — Very fine digital noise sits only in the darkest parts of the frame.` 끄는 조건: 매체가 디카·폰이 아님, 카드가 입자 줄을 줌, 사용자가 입자를 정함이나 빼 달라고 함.

입자는 화면 전체에 고르게 쓴다. 양은 사용자가 정하고, 정하지 않았으면 위 문장이다.

## Camera

- `framing`+`ratio`: `vertical frame — A vertical 3:4 frame from <위> to <아래>, <인물의 자리 한 구절>.` 사용자 비율이 없고 비율 설정이 없는 표면이면 인물 사진은 3:4 세로다. 사용자 비율이 있으면 그 비율과 방향으로 쓴다. 층의 중심에 따라 프레이밍을 고른다.

  | 중심 층 | 프레이밍 |
  |---|---|
  | Outfit·Legwear | 머리부터 발끝, 중망원 |
  | Hair and makeup·Expression | 가슴 위, 눈높이 |
  | Props and nails | 허리 위, 손이 프레임 안 |
  | 그 밖 | 허리 위 |

  끄는 조건: 사용자가 프레이밍을 정함, 카드의 포즈·구도 쌍이 프레임 범위를 직접 말함(비율은 그대로 쓴다), 비율을 API `size` 같은 설정으로 넘김(이때는 비율만 빼고 프레이밍은 쓴다).
- `lens`: `无畸变 — The camera stands back with a standard-to-moderate telephoto lens at eye level, so the face keeps natural proportions with no wide-angle stretch on the nose or forehead.` 끄는 조건: 셀카, POV, 광각·어안 룩, 사용자나 카드가 렌즈를 정함(카드의 `长焦压缩`·`超广角畸变` 줄 등).

## Finish

마지막 층이다. 사진 매체의 새 이미지에 붙는다. 빛에 관한 사실은 쓰지 않는다(빛은 Light 층의 몫이다).

- `closer`: `<카드 closer> — The whole frame reads as <첫 줄의 매체>, not a <반대 매체>.` 카드의 고정 사실이 closer 토큰을 주면 그것을 쓰고(왕가위 카드는 `港片剧照`, 반대 매체는 스냅·화보), 카드가 없으면 `实拍 — The whole frame reads as a real <첫 줄의 매체> photograph.`를 쓴다. 첫 줄이 부른 매체 이름을 그대로 다시 부른다. 끄는 조건 없음.
- `realism`: `超写实 — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the fabric, real wear on the surfaces.` 인물 없는 사진은 `real <장면의 재질 둘> and real wear on the surfaces`로 바꾼다. 끄는 조건: 그림·3D 매체를 요청함. 사용자가 피부 디테일을 빼 달라고 했으면 `real pores on the skin,`만 뺀다.
- `anti-cg`: `真人实拍 — A real person photographed on location, never an illustration, anime frame, 3D render or plastic-skinned CGI.` 인물 없는 사진은 `real photograph — A real photograph of a real <장소·사물>, never an illustration, 3D render or CGI.`를 쓴다. 끄는 조건: 그림·애니·3D를 요청함.

`8K`는 이 층의 `超写实` 줄에만 쓰고 다른 층에는 쓰지 않는다.

## 입력 용도별로 붙는 것

| 고정 몫 | 새 이미지, 참조 없음 | 새 이미지, 인물 참조 | 사진 추출 | 원본 편집 | 아이·학생 | 인물 없는 사진 |
|---|---|---|---|---|---|---|
| 문화권 공식(미화) | 붙임 | 조건절에 있지만 참조가 이김 | 참조 없이 쓸 용도면 붙임, 사진 속 얼굴은 옮기지 않음 | 없음 | 끔 | 없음 |
| skin-tone keep | 문단에 있음 | 작동 | 문단에 있음 | 없음 | 문단에 있음 | 없음 |
| 비율 문장 | 붙임 | 붙임 | 몸이 보이면 붙임 | 없음 | 끔 | 없음 |
| face-clear | 붙임 | 붙임 | 사진이 정함 | 없음 | 붙임 | 없음 |
| 메이크업 5슬롯(base·under-eye·liner·blush·lip) | 비어 있는 슬롯만 | 비어 있는 슬롯만 | 보이는 슬롯은 사진, 판독이 흐린 슬롯만 | 없음 | 끔 | 없음 |
| catchlight | 붙임 | 붙임 | 보이면 | 없음 | 붙임 | 없음 |
| face-light | 붙임 | 같음 | 사진의 빛 | 없음 | 붙임 | 없음 |
| grain | 매체가 필름·디카면 | 같음 | 사진에 보이는 양 | 없음 | 같음 | 같음 |
| framing·ratio | 3:4 세로 기본 | 같음 | 사진의 비율 | 원본 크롭 | 같음 | 기본 비율 없음 |
| lens 무왜곡 | 붙임 | 붙임 | 사진대로 | 없음 | 붙임 | 없음 |
| Finish 3줄 | 붙임 | 붙임 | 붙임(매체가 사진이면) | 없음 | 붙임 | 붙임(사람 문장 대신 장소 문장) |

편집에 아무것도 붙이지 않는 이유는 작업의 성격이다. 편집은 원본에서 지정한 곳만 바꾸는 일이라, 미화·입자·실사 줄을 더하면 사용자가 지키라고 한 얼굴과 질감이 바뀐다.
