# 층별 토큰 사전 색인

이미지 프롬프트의 층([image-brief.md](image-brief.md) §3)마다 쓸 원어 토큰이 `lexicon/` 아래 층별 표에 있다. 한 줄이 한 토큰이다. 이 파일은 표를 찾는 법과 대표 토큰 축약본이다.

## 사용법

1. 층을 정하고 아래 층 표에서 그 층 파일을 연다. 인물 층(Person)은 표가 없고 기본 인물은 [image-brief.md](image-brief.md) §5-1을 따른다.
2. 검색: `node scripts/find_tokens.mjs --q "신중식,찻집" --layers outfit,scene --limit 6`. 한글 음차·태그·영어 단어도 된다. `--culture KR`로 좁히고 `--random 1`로 층마다 하나 뽑는다. 못 돌리면 `grep -n "신중식" references/image/lexicon/*.md`나 `node scripts/read_refs.mjs references/image/lexicon/pose.md#KR`로 읽는다.
3. 표의 열은 토큰, 별칭, 문화권, 태그, 화면에 보이는 모습, 종류다. 토큰은 원어 그대로 프롬프트에 쓰고, 그 뒤에 "화면에 보이는 모습"을 바탕으로 장면에 맞게 영어 문장을 새로 쓴다. 색·위치·수량은 장면에 맞게 바꾸고, 문장을 통째로 되풀이하지 않는다.
4. 표는 열린 예시다. 한 프롬프트에 몇 개를 넣으라는 할당이 없고, 장면에 맞는 것만 쓴다. 표에 없어도 그 문화권에서 그 뜻으로 실제로 쓰인다고 확실히 알면 쓸 수 있다. 뜻을 모르면 지어내지 않고 영어로 푼다.
5. 사용자가 한글 음차로 말하면(신중식, 코모레비) 표의 원어 표기(新中式, 木漏れ日)로 쓴다.
6. 모델 아이덴티티가 있으면 외모 서술은 쓰지 않고 헤어·메이크업·표정 층은 그대로 쓴다([image-brief.md](image-brief.md) §5-2).
7. 브랜드·제품명과 룩을 가리키는 실존 인물 이름(감독, 건축가, 스타일 아이콘)은 쓸 수 있다. 로고와 상표 글자는 화면에 그리지 않고, 실존 인물의 얼굴·몸을 닮게 하는 용도로 쓰지 않는다.

넣지 않은 것: 미성년을 떠올리게 하는 차림과 놀이 맥락, 성적 연출 어휘, 일반 명사의 번역어. 출처: 공개 저장소 noahvisualsx/Iris b83de4c(MIT)에서 낱말만 참고했다. 문장과 프리셋은 옮기지 않았고 모습 문장은 새로 썼으며 생성 결과와 대조하지 않았다.

## 층별 파일

<!-- lexicon-counts:start -->
| 층 | 파일 | 행 수 | KR | CN | JP | US | FR |
|---|---|---|---|---|---|---|---|
| Optics | [lexicon/optics.md](lexicon/optics.md) | 370 | 9 | 50 | 129 | 150 | 32 |
| Light | [lexicon/light.md](lexicon/light.md) | 153 | 11 | 54 | 24 | 41 | 23 |
| Pose | [lexicon/pose.md](lexicon/pose.md) | 282 | 6 | 106 | 20 | 100 | 50 |
| Outfit | [lexicon/outfit.md](lexicon/outfit.md) | 296 | 54 | 64 | 86 | 46 | 46 |
| Legwear | [lexicon/legwear.md](lexicon/legwear.md) | 255 | 35 | 53 | 58 | 61 | 48 |
| Style | [lexicon/style.md](lexicon/style.md) | 575 | 80 | 66 | 72 | 224 | 133 |
| Hair and makeup | [lexicon/hair-makeup.md](lexicon/hair-makeup.md) | 368 | 77 | 94 | 58 | 94 | 45 |
| Expression | [lexicon/expression.md](lexicon/expression.md) | 340 | 87 | 44 | 73 | 59 | 77 |
| Props and nails | [lexicon/props-nails.md](lexicon/props-nails.md) | 412 | 47 | 72 | 128 | 84 | 81 |
| Scene | [lexicon/scene.md](lexicon/scene.md) | 848 | 128 | 182 | 162 | 224 | 152 |
<!-- lexicon-counts:end -->

## 문화권 룩 묶음

- Optics: KR 디카·라이트 리크 · CN 千禧CCD·水墨影调 · JP 使い捨て·コンデジ·필름 銘柄 · US 필름 스톡·카메라 바디 · FR 16mm·라이카 렌즈
- Light: KR 창가·네온·캣아이 · CN 竹林漏光·霓虹 · JP 木漏れ日·西日·提灯 · US 골든아워·모텔 네온 · FR 흐린 파리·contre-jour
- Pose: KR 셀카·꽃받침 · CN 回眸·정원·고전 소품 · JP ひょっこり·相合傘 · US 차·길거리·스케이트 · FR 카페·서점·창가
- Outfit: KR 스트리트 · CN 旗袍·汉服 · JP 古着·和装·アメカジ · US 프레피·웨스턴 · FR marinière·트위드
- Legwear: KR 검스·살스 · CN 肉丝 · JP 足袋·ニーソ · US 데니어 표기 · FR bas couture
- Style: KR 올드머니·Y2K·한옥 · CN 新中式·国潮·港风 · JP 森ガール·昭和レトロ · US 프레피·고프코어 · FR Nouvelle Vague·Parisian chic
- Hair and makeup: KR 물광·펌 · CN 簪·盘发·朱唇 · JP 涙袋·姫カット · US 웨이브·립 · FR teint nu·bob
- Expression: KR 눈웃음·무표정 · CN 四字 표현·冷眼 · JP はにかみ·胸キュン · US 윙크·squint·선글라스 · FR moue·lassitude chic
- Props and nails: KR 텀블러·네일 · CN 文房·茶器·玉 · JP 和小物·ネイル · US 소다·주얼리 · FR 베레·빵·향수
- Scene: KR 성수·한강·한옥 · CN 胡同·园林·外滩 · JP 渋谷·喫茶店 · US 뉴욕·캘리포니아 · FR 파리 카페·다리

## 대표 토큰

표를 못 읽을 때 이 축약본만으로 쓴다. 형식은 `토큰 — 한 줄 모습`.

### Optics
千禧CCD — 2000s compact-digital flash look
直闪 — flat on-camera flash, dark background
漏光 — orange light leak at the frame edge
ストロボ直焚き — bare strobe, bright pale face
ノンフラッシュ — soft ambient daylight, low contrast
写ルンです — disposable film camera snapshot
Y2K CCD — cool blue-cast early digicam
暗角 — dark corners, bright center
抽帧 — sharp face, smeared lights behind
Kodak Portra 400 — soft warm film skin tones
CineStill 800T — tungsten film, red halation
Polaroid SX-70 — instant print, soft contrast

### Light
丁达尔 — visible light beams through haze
木漏れ日 — dappled light through leaves
西日 — low orange afternoon sun indoors
百叶窗光影 — slatted blind shadow stripes
霓虹灯牌 — colored neon sign spill
蓝调时刻 — deep blue dusk light
黄金时刻 — warm low golden sun
钠灯路灯 — orange sodium street lamp
机顶硬闪 — hard on-camera flash
烟雨漫射眼神光 — soft misty window catchlight
伦勃朗光 — cheek triangle in dark
heure bleue — blue hour in Paris

### Pose
回眸 — head turned back over the shoulder
萌袖 — hands hidden in long sleeves
美人靠 — leaning on a curved pavilion rail
짝다리 — weight on one leg, hip tilted
꽃받침 — both hands under the chin
ひょっこり — peeking in from the frame edge
相合傘 — two people under one umbrella
肩寄せ — leaning shoulder to shoulder
比耶 — V sign beside the face
スマホ下顎隠し — phone covering the lower face
Hem Twirl Stop — mid-twirl with the hem flaring

### Outfit
旗袍 — fitted stand-collar sheath dress
汉服 — wide-sleeved traditional robes
马面裙 — pleated panel skirt with side flaps
盘扣 — knotted cloth frog buttons
スカジャン — embroidered souvenir bomber
藍染 — indigo-dyed cotton
兵児帯 — soft knotted kimono sash
甚平 — short summer kimono set
바시티 자켓 — wool body, leather sleeves
Marinière — navy-striped boat-neck top
Petite robe noire — simple short black dress

### Legwear
肉丝 — flesh-tone sheer hosiery
5D蝉翼肉丝 — near-invisible ultra-thin hosiery
后中缝 — seam up the back of the leg
暗金提花 — gold thread woven into sheer tights
渐变中缝 — back seam fading black to pale
검스 — sheer black tights
살스 — skin-tone stockings
데니아 — denier thickness shown by opacity
backseam tights — retro seamed tights
Bas couture — fully fashioned seamed stockings
Collant 15D noir classique — thin plain black tights

### Style
新中式 — modern Chinese tailoring with classic motifs
国潮 — Chinese motifs in street fashion
老钱风 — quiet, understated expensive look
港风 — 1990s Hong Kong film color
松弛感 — relaxed, unforced ease
森ガール — layered soft natural forest look
昭和レトロ — Showa-era retro Japan
侘び寂び — worn, quiet imperfect beauty
꾸안꾸 — effortless but styled
Y2K — chrome, gloss, early-2000s pop
Nouvelle Vague — French new-wave film look
王家卫 — smeared neon, saturated red-green

### Hair and makeup
丸子头 — hair in a round top bun
黑长直 — long straight black hair
姫カット — straight cheek-length side locks
涙袋メイク — highlighted under-eye bags
ぴえんメイク — pink-red tearful eye makeup
쌩얼 — bare, no-makeup skin
애교살 — puffy lower lash line
물광 피부 — wet glossy skin
커튼 뱅 — curtain bangs
手推波 — pressed finger waves
Glass Hair — mirror-smooth shiny hair
Teint nu — bare skin with a natural sheen

### Expression
似笑非笑 — half smile that is not a smile
欲语还休 — about to speak, then holding back
眼尾泛红 — reddened outer eye corners
눈웃음 — eyes curving into a smile
애교 — head tilt with playful gestures
코 찡긋 — crinkled nose, small smile
はにかむ視線 — shy glance, slight blush
小悪魔スマイル — teasing, mischievous smile
胸キュン — flustered, heart-fluttering look
Sourire en coin — smile on one corner
Nonchalance parisienne — bored, effortless calm

### Props and nails
团扇 — round silk hand fan
折扇 — folding fan, ribs and paper
紫砂壶 — red clay teapot
建盏 — black-glazed tea bowl
油纸伞 — oiled-paper umbrella
風鈴 — glass wind chime with paper slip
金継ぎ — gold-seamed repaired ceramic
스탠리 텀블러 — large insulated tumbler
水光甲 — glassy sheer nails
青花美甲 — blue-and-white porcelain nails
Jelly Nails — translucent candy-gel nails
French Tip — pale base, white tips

### Scene
新天地 — Shanghai stone-gate lanes with bars
胡同 — Beijing alley, grey brick
苏州园林 — garden with rockery and windows
성수동 — brick factory cafes
한강 — riverside park, picnic, sunset
을지로 — printing alleys, hip bars
渋谷スクランブル交差点 — crowded scramble crossing
純喫茶 — Showa coffee shop, velvet seats
銭湯 — public bathhouse, tile, steam
Route 66 — desert highway, gas station
Pacific Coast Highway — coastal road, cliffs
Montmartre — steep stairs, zinc rooftops
