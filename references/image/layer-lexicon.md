# 층별 토큰 사전 색인

이미지 프롬프트의 층([image-brief.md](image-brief.md) §3)마다 쓸 원어 토큰이 `lexicon/` 아래 층별 표에 있다. 한 줄이 한 토큰이다. **층별 md 표가 정본**이고 이 파일은 표를 찾는 법과 축약본이다.

## 사용법

1. 층을 정하고 아래 층 표에서 그 층 파일을 연다. Identity Reference 층은 표가 없고 [image-brief.md](image-brief.md) §5를 따른다.
2. 검색: `node scripts/find_tokens.mjs --q "신중식,찻집" --layers outfit,scene --limit 6`. 한글 음차·붙여 쓴 형태·태그·영어도 된다. `--culture KR`로 좁히고 `--random 1`로 층마다 하나 뽑는다. 못 돌리면 `grep -n "신중식" references/image/lexicon/*.md`로 찾는다.
3. 열은 토큰, 별칭, 문화권, 태그, 화면에 보이는 모습, 종류다. 토큰은 원어 그대로 쓰고, 그 뒤 문장은 "화면에 보이는 모습"을 바탕으로 장면에 맞게 영어로 새로 쓴다. 문장을 통째로 되풀이하지 않는다.
4. 표는 열린 예시다. 개수 할당은 없고 장면에 맞는 것만 쓴다. 일반 명사도 원어가 더 짧거나 그 문화권의 모습을 함께 부르면 원어로 쓴다. 표에 없어도 그 문화권에서 그 뜻으로 쓰이는 것을 확실히 알면 쓰고, 모르면 지어내지 않고 영어로 푼다.
5. 사용자가 음차로 말하면(신중식, 코모레비) 표의 원어 표기(新中式, 木漏れ日)로 쓴다.
6. 모델 아이덴티티가 있으면 외모 서술은 빼고 헤어·메이크업·표정 층은 쓴다([image-brief.md](image-brief.md) §5).
7. 브랜드·제품명과 룩을 가리키는 실존 인물 이름(감독, 건축가, 스타일 아이콘)은 쓸 수 있다. 로고·상표 글자는 그리지 않고, 실존 인물의 얼굴·몸을 닮게 하는 용도로는 쓰지 않는다.

아이·학생 항목은 태그 `아동·학생`이 붙고, `--random`에서만 빠지며 관능 어휘를 붙이지 않는다. 넣지 않은 것: 실존 인물의 얼굴·몸을 닮게 하는 항목. 출처: noahvisualsx/Iris b83de4c(MIT)에서 낱말만 참고했고 문장·프리셋은 옮기지 않았다.

## 층별 파일

<!-- lexicon-counts:start -->
| 층 | 파일 | 행 수 | KR | CN | JP | US | FR |
|---|---|---|---|---|---|---|---|
| Optics | [lexicon/optics.md](lexicon/optics.md) | 371 | 15 | 34 | 162 | 126 | 34 |
| Light | [lexicon/light.md](lexicon/light.md) | 189 | 18 | 56 | 21 | 70 | 24 |
| Pose | [lexicon/pose.md](lexicon/pose.md) | 353 | 27 | 117 | 49 | 97 | 63 |
| Outfit | [lexicon/outfit.md](lexicon/outfit.md) | 585 | 130 | 103 | 155 | 91 | 106 |
| Legwear | [lexicon/legwear.md](lexicon/legwear.md) | 253 | 43 | 55 | 60 | 62 | 33 |
| Style | [lexicon/style.md](lexicon/style.md) | 649 | 122 | 63 | 138 | 191 | 135 |
| Hair and makeup | [lexicon/hair-makeup.md](lexicon/hair-makeup.md) | 444 | 90 | 113 | 85 | 98 | 58 |
| Expression | [lexicon/expression.md](lexicon/expression.md) | 344 | 84 | 67 | 71 | 55 | 67 |
| Props and nails | [lexicon/props-nails.md](lexicon/props-nails.md) | 517 | 66 | 101 | 151 | 99 | 100 |
| Scene | [lexicon/scene.md](lexicon/scene.md) | 966 | 174 | 176 | 204 | 239 | 173 |
<!-- lexicon-counts:end -->

## 문화권 룩 묶음

- Optics: KR CCD 카메라·필카 감성 · CN 千禧CCD·水墨影调 · JP 写ルンです·필름 銘柄 · US 필름 스톡·플래시 · FR Aaton·Cartier-Bresson
- Light: KR 윤슬·빛내림 · CN 丁达尔·霓虹灯牌 · JP 木漏れ日·西日·行灯 · US 골든아워·네온 · FR clair-obscur·contre-jour
- Pose: KR 셀카·짝다리 · CN 回眸·托腮 · JP ひょっこり·相合傘 · US 차·길거리 · FR 소수
- Outfit: KR 한복·스트리트 · CN 旗袍·汉服 · JP 浴衣·古着·アメカジ · US 프레피·웨스턴 · FR Marinière·트위드
- Legwear: KR 스타킹 무늬·소재 · CN 丝袜 소재 · JP 足袋·ニーソ · US denier 표기 · FR bas couture
- Style: KR 꾸안꾸·Y2K · CN 新中式·国潮·港风 · JP 森ガール·昭和レトロ · US 프레피·고프코어 · FR Nouvelle Vague·Parisian Chic
- Hair and makeup: KR 물광·시스루뱅 · CN 簪·冷白皮 · JP 涙袋·姫カット·透明感 · US 웨이브·립 · FR teint nu·bob
- Expression: KR 눈웃음·무표정 · CN 似笑非笑·冷眼 · JP はにかみ·胸キュン · US 윙크·squint · FR moue·lassitude chic
- Props and nails: KR 텀블러·네일 · CN 文房·茶器·玉 · JP 和小物·ネイル · US 소다·주얼리 · FR 베레·빵·향수
- Scene: KR 성수·한강·한옥 · CN 胡同·园林·外滩 · JP 渋谷·喫茶店 · US 뉴욕·캘리포니아 · FR 파리 카페·다리

## 대표 토큰

표를 못 읽을 때 이 축약본만으로 쓴다. 형식은 `토큰 — 한 줄 모습`이고 모두 표의 같은 행을 줄인 것이다.

### Optics
千禧CCD — hard flat contrast, clipped highlights
千禧CCD直闪 — CCD compact, flat on-camera flash
漏光 — orange-red light bleeding in at an edge
ストロボ直焚き — strobe straight on, flat bright face
ノンフラッシュ — ambient light, soft contrast, grain
写ルンです — disposable camera, vignette, grain
暗角 — dark corners, bright center
抽帧 — repeated frames, ghosting trails
Kodak Portra 400 — warm low-contrast negative film
CineStill 800T — tungsten film, red halation

### Light
丁达尔 — visible straight beams in hazy air
木漏れ日 — dappled spots of light through leaves
西日 — low sideways orange afternoon sun
百叶窗光影 — parallel bright and dark bands
霓虹灯牌 — colored neon spilling on faces and wet ground
蓝调时刻 — deep blue dusk with warm city lights
黄金时刻 — low warm golden light outlining the figure
钠灯路灯 — heavy orange-yellow sodium light
伦勃朗光 — bright triangle on the shadowed cheek
heure bleue — blue dusk with small amber lamps

### Pose
回眸 — head turned back over the shoulder
萌袖 — hands pulled inside long sleeves
짝다리 — weight on one leg, hip out
꽃받침 — both hands fanned under the chin
ひょっこり — peeking out from behind an edge
相合傘 — two people under one umbrella
肩寄せ — head resting on the other's shoulder
比耶 — V sign beside the face
거울 셀카 — phone toward a mirror, whole outfit shown
托腮 — hand propping the chin or cheek

### Outfit
旗袍 — fitted sheath, stand collar, frog buttons
汉服 — layered robes, crossed collar, wide sleeves
马面裙 — flat front panel, pleated sides
盘扣 — small knotted cloth buttons
スカジャン — satin souvenir jacket with back embroidery
藍染 — uneven deep indigo cotton
兵児帯 — soft gathered sash tied in a bow
浴衣 — light summer kimono with a wide sash
한복 — short wrapped jacket over a full skirt
바시티 자켓 — wool body, leather sleeves, ribbed trim

### Legwear
后中缝 — one thin seam up the back of the leg
足袋 — split-toe cotton ankle covers
網タイツ — open diamond mesh, net-like shadows
つま先スルー — sheer toe with no reinforcement
15 denier semi-sheer — matte semi-sheer, sculpted leg
black sheer tights — black edges, see-through center
backseam tights — sheer, dark seam at the back
Bas couture — fully fashioned, center back seam
레이스 스타킹 — openwork floral lace, skin showing
오픈토 스타킹 — sheer tights, toes uncovered

### Style
新中式 — modern cuts with Chinese details, matte silk
国潮 — Chinese motifs in streetwear proportions
老钱风 — unflashy heavy knits and wool tailoring
港风 — nineties Hong Kong red, black, velvet
松弛感 — loose, soft creases, no seam tension
森ガール — loose layered natural knits and lace
昭和レトロ — faded warm tones, worn enamel objects
侘び寂び — rough handmade, quiet imperfection
꾸안꾸 — well-fitted basics that look thrown on
Y2K — low-rise, crop tees, chrome, gloss

### Hair and makeup
丸子头 — long hair in a loose high round bun
黑长直 — blunt-ended long black straight hair
姫カット — cheek-length side locks, straight fringe
涙袋メイク — shimmer and shadow on the under-eye band
쌩얼 — no foundation, pores and lip color showing
애교살 — pearly shimmer under the lower lashes
물광 피부 — wet gloss on cheeks and nose bridge
커튼 뱅 — center-parted fringe sweeping outward
冷白皮 — cool pink-neutral base, bluish-white highlight
透明感 — sheer low-coverage base, correcting tint

### Expression
似笑非笑 — mouth corner up a millimetre, level eyes
欲语还休 — lips part, eyes lower, words held back
眼尾泛红 — outer eye corners flushed pink-red
눈웃음 — eyes curving into crescents
애교 — head tilt, pursed lips, playful gesture
코 찡긋 — crinkled nose, small smile
はにかみ — eyes slide off lens, shy small smile
小悪魔スマイル — one mouth corner higher, mischief
胸キュン — wide shining eyes, small startled smile
Sourire en coin — one mouth corner, calm knowing eyes

### Props and nails
团扇 — round silk fan, painted pattern shows through
折扇 — folding fan with pleats in light and shade
紫砂壶 — small matte sandy clay teapot
建盏 — thick black-glazed bowl, hare's-fur streaks
油纸伞 — oiled-paper umbrella glowing in rain
風鈴 — glass bell with a swaying paper slip
金継ぎ — raised gold lines like mended cracks
아아 — clear cup of iced americano, condensation
水光甲 — mirror-gloss nails with window streaks
青花美甲 — blue porcelain brushwork on white nails

### Scene
新天地 — grey shikumen brick beside modern glass
胡同 — narrow grey-brick lane, courtyard doors
苏州园林 — white walls, rockeries, lattice windows, pond
성수동 — board-marked concrete, converted factories
한강공원 — grassy riverside park, bridges, open sky
을지로 — back alleys, metal shutters, bare bulbs
渋谷スクランブル交差点 — diagonal crosswalk, crowds, LED screens
純喫茶 — dim coffee parlor, velvet, warm tungsten
銭湯 — bathhouse wall painted with Mt. Fuji
Route 66 — straight two-lane road, old gas station
