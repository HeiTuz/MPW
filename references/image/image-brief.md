# 이미지 프롬프트 작성 안내

## 1. 완성본의 모양

대상을 따로 정하지 않았으면 ChatGPT 웹의 GPT Image에 붙여 넣을 프롬프트를 쓴다(대상 판정은 [surfaces.md](surfaces.md) §0, 직접 API 설정은 [surface-contracts.md](surface-contracts.md) 2.5 §4.3, 2.6 §4.5). 다른 엔진을 지정했으면 그 엔진 문서의 형식을 따른다. 사용자가 형식·제목·순서를 정했으면 그대로 쓴다.

- 이미지 하나에 코드블록 하나. 따로 쓸 프롬프트를 여럿 달라고 하면 블록마다 모든 층을 다시 다 쓴다.
- 블록 밖에는 꼭 필요한 안내만 한 줄씩 쓴다(첨부할 이미지, 후속 수정에서 고친 문장, 뜻을 몰라 풀어 쓴 토큰). 안내 문서 이름, 절 번호, '예시'라는 말은 쓰지 않는다.

모든 프롬프트는 이 모양이다. 단순한 요청도 같다.

```
<첫 줄: 이 사진의 이름이 되는 한 문장>

## <층 이름>
<토큰> — <그 토큰이 화면에 만드는 모습을 풀어 쓴 영어 문장.>
<토큰> — <영어 문장.>

## <층 이름>
<토큰> — <영어 문장.>
```

- 첫 줄은 제목 없이 맨 위에 두는, 이 사진의 이름을 말하는 한 문장이다. 어떤 사진인가(매체·장르), 누가 무엇을 하는 어떤 순간인가(사람은 성별 정도만), 이 사진을 다른 사진과 가르는 것(핵심 자세·소품·장소 가운데 가장 강한 것)을 쓴다. 국적·피부색·얼굴 서술은 쓰지 않는다. 층끼리 부딪치면 첫 줄이 기준이다.
- 층은 `## 영어 이름`으로 시작하고, 층 사이는 빈 줄 하나로 띄운다. 사용자가 프롬프트 언어를 지정하면 층 이름도 그 언어로 쓴다.
- 층 안의 줄은 모두 `토큰 — 문장` 꼴이다(`## Identity Reference` 층만 예외다. 문단 하나를 쓴다, §5). 토큰은 원어 토큰(§2)이나 짧은 영어 이름이다. 문장은 영어 한두 문장이다. 대상을 묘사하는 명사구로 시작해도 되지만, 무엇이 어디에 어떻게 보이는지까지 이어 쓴다.
- 단어를 쉼표로 늘어놓지 않는다. `soft light, film look, warm tone` 같은 나열은 엔진이 제멋대로 읽는다.
- 층마다 2~5줄(§3 표가 1줄을 허용한 층과 `## Identity Reference`만 예외). 첫눈에 읽혀야 할 층(사용자가 가장 공들여 말한 것)은 4~5줄로 가장 자세히 쓴다. 단순 장면도 층은 셋 이상이다.
- 한 사실은 한 층에만 쓴다. 피부 마감은 Hair and makeup 한 곳에서만 말한다.
- 길이는 10,000자 이하다(공백·줄바꿈 포함, ChatGPT 웹 입력창에 붙여 넣는 기본 경로의 상한, 근거는 [surfaces.md](surfaces.md) §0-1). 인물은 보통 3,000~6,000자, 단순 장면은 1,000~2,500자가 된다. 넘으면 같은 말 반복, 화면에 안 보이는 줄, 덜 중요한 층의 셋째 줄부터 지운다. 층 자체는 지우지 않는다. 호출자가 더 좁은 상한이나 다른 단위(바이트)를 정했으면 그것이 먼저이고, 그 단위로 직접 재어 맞춘다.
- 결과를 PromptBundle·ImageProductionHandoff 같은 기계 계약으로 넘기면 그 계약의 2,000자가 이긴다. 줄 수를 줄여 맞추고, 잘라 내지 않는다. 줄이는 순서: Legwear와 Props and nails를 1줄로 → Style을 1줄로 → 나머지 층의 둘째 줄부터 뒤에서 앞으로. 이 순서로도 안 맞을 때만 §3 표가 '빼는 경우'로 허용한 층부터 뺀다. 이 경우 §9-2의 '기본 층이 다 있는가'보다 이 줄이 우선한다.

## 2. 언어와 원어 토큰

- 영어·한국어·일본어·중국어 가운데 그 자리에 가장 짧고 정확한 말을 고른다. 영어가 뼈대다. 위치, 수량, 방향, 관계, 빛, 크기는 영어 문장으로 쓴다. 긴 영어 설명을 짧은 원어 표현으로 줄일 수 있으면 원어를 쓴다(구절도 된다). 토큰 자리에는 원어 표기 그대로 쓴다(꾸안꾸, 촉촉피부, 시스루뱅, 冷白皮, 千禧CCD直闪, 新中式, 木漏れ日, 透明感).
- 토큰 뒤 문장은 번역이 아니라 그 토큰이 화면에 만드는 결과다.
- 한 층에 같은 언어의 원어 토큰을 여럿 써도 되고(`伏し目`과 `半開き唇`), 층마다·프롬프트마다 언어 비율 기준은 없으며, 줄마다 그 자리에 가장 짧고 정확한 말을 고른다.
- 쓸 수 있는 원어 토큰은 [layer-lexicon.md](layer-lexicon.md)가 가리키는 층별 표(`lexicon/`)에 있는 것과, 그 문화권에서 그 뜻으로 실제로 쓰인다고 확실히 아는 것뿐이다. 뜻을 모르거나 실제로 쓰이는지 모르면 지어내지 않고 영어 토큰과 영어 문장으로 쓴다.
- 사용자가 한글 음차로 말해도 사전의 원어 표기로 쓴다: 신중식 → 新中式, 코모레비 → 木漏れ日, 시오케이 → 塩系. 사전에 없고 뜻도 모르면 영어로 풀고, 어떻게 풀었는지 블록 밖에 한 줄로 알린다.
- 사용자가 준 룩 이름은 토큰 자리에 그대로 둔다. 그냥 설명하는 말(그림자 부드럽게, 물결 그림자)은 영어 토큰으로 옮기고 문장으로 푼다.
- 쓰지 않는 경우: 같은 뜻을 두 언어로 병기하기, 네 언어를 매번 채우려는 것, 영어가 더 짧고 정확한 자리에 원어를 억지로 넣기.
- 화면 글자는 사용자가 준 문구를 그 언어 그대로 쓴다. 기존 프롬프트의 일부만 고칠 때는 원문 언어를 유지한다([../templates/common.md](../templates/common.md) §프롬프트 언어 결정). 전체를 정제·교정할 때는 §11을 따른다.

| 틀린 줄 | 틀린 이유 | 맞는 줄 |
|---|---|---|
| `신중식 — A quiet documentary portrait with muted film color.` | 음차로 썼고, 뜻을 몰라 엉뚱하게 지어냈다 | `新中式 — A modern Chinese-inspired look: clean straight cuts, small traditional details such as a stand collar and knot buttons, and heavy matte fabric.` |
| `시스루뱅 — see-through bangs` | 번역일 뿐 화면 결과가 없다 | `시스루뱅 — A thin fringe of separated strands with the forehead showing between them.` |
| `透明感 (a clear, airy look) — Skin and light read clear.` | 같은 뜻을 두 언어로 병기했고 문장이 화면 결과를 말하지 않는다 | `透明感 — Skin and air read clear and light: low contrast, a soft cool tint, and highlights that fade gently.` |
| `夏の夕暮れ` | 토큰만 있고 화면 결과를 말하는 문장이 없다 | `夏の夕暮れ — The sky fades from pale orange to blue-gray, and the warm air softens the distant poles.` |

## 3. 층 고르기

층은 이 질문으로 고른다.

> 이 그림을 다시 뽑을 때 "이것만 바꿔 줘"라는 말이 나올 단위는 무엇인가?

그 단위 하나가 층 하나다. 층을 나눠 두면 한 층만 바꿔도 나머지 층의 문장이 흔들리지 않는다.

### 인물 이미지의 기본 층

사람이 나오면 아래 층을 이 순서로 모두 쓰는 것이 기본이다. 화면에 안 보이는 부위의 층만 뺀다.

| 층 | 통제하는 것 | 빼는 경우 |
|---|---|---|
| Identity Reference | 누구인가: 참조가 있으면 그 얼굴, 없으면 지어 채운 인물(§5). 첫 층이다 | 빼지 않는다 |
| Hair and makeup | 커트·가르마·앞머리·질감·색, 베이스 마감, 눈·볼·입술 화장, 눈썹 정리 | 뒷모습이라 얼굴이 안 보이면 헤어만 쓴다 |
| Expression | 시선이 닿는 곳, 눈꺼풀·눈썹·입꼬리의 정도, 미세한 움직임 | 얼굴이 작아 안 읽히면 1줄로 줄인다 |
| Outfit | 단품, 원단, 핏, 여밈, 신발·가방, 원단이 빛에 반응하는 모습 | 얼굴 클로즈업이라 옷이 안 보일 때 |
| Legwear | 스타킹·타이츠·양말의 비침, 광택, 솔기, 무늬, 주름 | 다리가 화면 밖일 때(상반신, 앉아서 탁자에 가려질 때) |
| Props and nails | 손에 든 것, 장신구, 손톱 모양·색·마감 | 손도 소품도 화면에 없을 때 |
| Pose | 체중이 실린 곳, 손이 닿는 곳, 몸과 고개의 각도 | 빼지 않는다 |
| Style | 룩의 계열, 전체 색 팔레트, 시대감, 분위기 | 빼지 않는다 |
| Scene | 장소, 표면 재료, 배경의 물건·사람, 시간대가 보이는 단서 | 단색 배경이면 1줄 |
| Light | 장면 속 광원(해, 창, 가로등, 간판)의 방향과 그 빛이 만든 하이라이트·그림자·반사, 날씨와 안개 | 빼지 않는다 |
| Optics | 매체가 만드는 모습: 카메라에 달린 플래시, 필름·디카의 색 반응, 하이라이트 처리, 렌즈 플레어·비네팅, 입자 | 빼지 않는다 |
| Camera | 프레이밍, 카메라 높이와 거리, 초점과 심도, 사용자가 요청한 비율 | 빼지 않는다 |

- 빛 둘을 가르는 기준: 장면 안에 있는 광원은 Light, 카메라와 매체가 만드는 것(직광 플래시, 빛샘, 색 쏠림)은 Optics다.
- Style에는 계열과 팔레트만 쓴다. 옷 하나하나는 Outfit, 장소는 Scene에 쓴다.
- 더 잘게 나눈다: 한 층에 사용자가 따로 바꿀 만한 것이 둘 들어 있거나, 그 층이 요청의 중심이라 5줄을 넘으면 둘로 나눈다. 예: 뷰티 클로즈업은 Hair / Makeup, 레이어드 패션은 Outerwear / Inner layers, 네일이 주인공이면 Props / Nails. 나눈 층도 2~5줄이다.

### 인물이 아닌 이미지

종류에 맞는 층을 고른다. 아래는 자주 나오는 층의 열린 예다. 그대로 고르지 말고 층 이름은 그 층이 다루는 대상으로 짓는다(`Bottle`, `Wet street`, `Latte`).

| 이미지 | 자주 나오는 층 |
|---|---|
| 제품 | 제품 형태와 재질, 라벨·글자(있을 때), 바닥과 배경, 빛과 그림자, 카메라 |
| 포스터·광고 | Text, Layout, 그림 영역(대상 이름으로), Color, Light |
| 풍경 | 주된 지형이나 건물, 땅·물, 하늘과 날씨, Light, Optics, Camera |
| 동물 | 동물의 자세와 털, 장소, Light, Camera |
| 음식 | 요리, 그릇과 테이블, 김·소스 같은 상태, Light, Camera |
| 실내 | 방의 구조, 가구, 재료, Light, Camera |

도해·슬라이드·UI·만화·로고는 [surface-contracts.md](surface-contracts.md) §3.4의 형식을 이 모양 위에 얹는다.

- `Details`, `Quality`, `Style notes`, `Constraints`, `Negative`처럼 대상이 아닌 이름은 쓰지 않는다. 금지만 모은 층은 만들지 않는다.
- 빛은 거의 항상 따로 층으로 둔다. 시간대·안개처럼 빛을 바꾸는 것도 빛 층에 넣는다. 가장 자주 바꾸는 단위라서다.

## 4. 층 채우기

### 사용자가 준 것

- 사용자가 준 룩 이름·정밀 토큰은 토큰 자리에 그대로(음차는 원어 표기로) 두고, 문장으로 화면 결과를 풀어 보강한다.
- 사용자가 준 문구, 수량, 비율, 지킬 것, 뺄 것은 빠짐없이 맞는 층에 넣는다.
- 사용자가 가장 공들여 말한 것이 가장 자세한 층이 된다.

### 토큰 찾기

요청에 룩 단서(문화권, 장소, 시대, 장르, 소품, 카메라)가 있으면 층을 채우기 전에 검색을 한 번 돌린다.

1. 단서를 쉼표로 이어 질의어로 쓴다. 한국어·영어·원어 모두 된다(별칭에 한글 음차가 들어 있다). 층을 좁히면 `--layers outfit,scene`, 문화권을 좁히면 `--culture KR`(KR CN JP US FR). 예: `node scripts/find_tokens.mjs --q "신중식,찻집" --limit 6`
2. 결과는 층 제목 아래 `토큰 — 화면에 보이는 모습 (별칭)` 줄이다. 장면에 맞는 것을 층마다 골라 `토큰 — 문장`의 토큰으로 쓰고, 문장은 장면에 맞게 다시 쓴다. 결과 문장을 통째로 옮기지 않는다. 포즈·장면·아이템 토큰은 핵심 뜻이 맞으면 쓰고, 문장은 사전의 설명이 아니라 장면(사진이나 원문)에 보이는 대로 쓴다. 사전 설명의 세부(예: 팔의 위치)가 장면과 다르면 옮기지 않는다. 필름·카메라·문화권 룩처럼 결과 전체를 부르는 룩 토큰은 그 모습과 정확히 맞을 때만 쓴다. `no match`인 층은 영어 토큰과 영어 문장으로 쓴다.
3. 스크립트를 못 돌리면 [layer-lexicon.md](layer-lexicon.md)의 층별 대표 토큰에서 고르거나, `node scripts/read_refs.mjs references/image/lexicon/scene.md#KR`처럼 층·문화권 절을 읽는다.
4. 사전에 없고 확실히 알지 못하는 토큰은 지어내지 않는다. 영어로 풀어 쓴다.
5. 랜덤 요청이면 같은 명령에 `--random 1`을 붙여 층마다 일치한 행 중 하나를 난수로 뽑는다([editorial/portrait-variations.md](editorial/portrait-variations.md) §명시적 랜덤 요청).

### 비워 둔 층

- 비워 둔 층은 이미지의 목적과 이미 정해진 층에 맞게 구체적으로 지어 채운다. 화면에 보이는 층은 비워 두지 않는다.
- 고르는 순서: ① 사용자가 준 룩·장소·문화권과 맞는 것 ② 위 '토큰 찾기'로 찾은 그 층 표의 행 ③ 그 장면에서 자연스러운 것.
- 층끼리 맞춘다. 밤이면 Light와 Optics가 같은 밤이고, 비가 오면 Outfit의 원단이 젖고, Style의 팔레트가 Outfit과 Scene의 색과 같다.
- 사용자 말과 지어 채운 것이 부딪치면 사용자 말이 이긴다.

### 문장 쓰는 법

문장은 눈에 보이는 물리 결과로 쓴다.

- 빛: 광원이 어디 있는지, 그리고 그 빛이 표면에 만드는 하이라이트·그림자·반사.
- 포즈: 체중이 실린 다리, 손이 닿는 물건이나 몸의 자리, 어깨와 고개의 방향.
- 재질: 빛을 받았을 때 반사하는지, 흩는지, 비치는지, 어떻게 접히고 늘어지는지.
- 표정: 시선이 닿는 곳, 눈꺼풀과 입꼬리가 움직인 정도.
- beautiful, stunning, perfect 같은 형용사 대신 그렇게 보이는 원인을 쓴다. 8K, ultra-detailed, masterpiece 같은 품질 태그는 쓰지 않는다.
- film grain, grainy, noise texture 같은 말은 GPT Image에서 화면 전체에 입자를 깔 수 있다. 입자가 필요하면 Optics 한 줄에서 어디에 얼마나 있는지 쓴다(fine grain only in the dark shadows). 세부는 [surface-contracts.md](surface-contracts.md) §3.2.4.

라벨을 모습으로 푸는 예:

| 라벨 | 풀어 쓸 모습 |
|---|---|
| 창가 자연광 | 창 쪽 뺨과 어깨가 밝고 반대쪽으로 천천히 어두워진다. 눈마다 창 모양 빛점 하나 |
| 해 질 녘 역광 | 해가 피사체 뒤 낮게 있다. 머리카락·털 가장자리에 빛 테, 앞면은 부드러운 그늘, 카메라 쪽으로 긴 그림자 |
| 흐린 날 빛 | 그림자 경계가 없고 피부가 고르게 밝다. 색이 차분하게 가라앉는다 |
| 블라인드 빛 | 평행한 빛 띠와 그늘 띠가 얼굴과 벽을 가로지른다 |
| 젖은 노면의 네온 | 네온 색이 세로로 길게 늘어져 비치고, 빗방울 닿는 곳에서 물결로 깨진다 |
| 안개 | 멀수록 대비와 채도가 떨어지고, 광원 둘레에 넓은 후광이 생긴다 |
| 카메라 직광 플래시 | 얼굴이 평평하게 밝고 이마·콧등에 작은 반사점, 바로 뒤 벽에 짧고 진한 그림자, 배경은 급히 어두워진다 |
| 한쪽 다리에 체중 | 한 다리로 서고 반대 무릎이 살짝 굽어, 골반이 기울며 몸이 S자가 된다 |
| 기대 서기 | 어깨나 등이 벽·난간에 닿고 체중이 그쪽으로 기운다. 발은 가볍게 교차한다 |
| 무광 재질 | 정반사가 없다. 빛 쪽은 짙은 회색, 반대쪽은 깊은 검정 |
| 실크·새틴 | 접힌 곳마다 길고 가는 하이라이트 띠가 생기고 움직임을 따라 옮겨 간다 |
| 얇게 비치는 원단 | 역광에 안쪽 윤곽이 비치고, 천이 겹친 곳만 진해진다 |
| 굵은 니트 | 짜임 줄이 보이고, 역광에 가장자리 섬유가 보송하게 빛난다 |
| 글래스 립 | 아랫입술 가운데 날카로운 하이라이트 하나, 윗입술 산을 따라 가는 빛선 |
| 옅은 미소 | 입꼬리가 1mm쯤 올라가고 눈은 그대로다 |
| 내리깐 눈 | 눈꺼풀이 반쯤 내려오고 속눈썹 그림자가 뺨에 떨어진다 |

## 5. 인물

사람이 나오는 프롬프트에는 `## Identity Reference` 층을 첫 층으로 항상 둔다. 본문은 조건문 문단 하나다. 모델 참조가 있으면 얼굴만 그 모델에서 가져오고, 없으면 마지막 문장의 인물을 쓴다. 그래서 프롬프트 하나가 참조가 있든 없든 그대로 쓰인다.

```
## Identity Reference
If a model reference is provided, the person in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light. Hair, makeup and everything else follow this prompt. If none is provided, <인물 설정>.
```

- 참조에서 가져오는 것은 얼굴형과 이목구비뿐이다. 헤어·메이크업과 그 밖의 전부는 프롬프트가 정한다. 얼굴을 지나치게 고정하지 않고 장면의 표정·각도·빛에 자연스럽게 맞춘다.
- `<인물 설정>`이 인물을 정하는 자리다. 사용자가 인물을 지정했으면 그 설정을, 지정하지 않았으면 아래 기본 인물을 쓴다. 문단의 "the person in this photo"는 첫 줄의 지칭에 맞춰 "the woman in this photo"처럼 바꿔 써도 된다. 인물 프롬프트의 기본은 항상 기본 인물 문장이다(요청에 없으면 Iris 기본: 22세 동아시아 여성, 룩의 문화권에 맞춰 조정). `create a new person suited to the scene` 원문은 사용자가 인물을 정하지 않은 범용 템플릿을 달라고 했을 때만 쓴다.
- 호출자·사용자가 저장된 아이덴티티 문단이나 인물 설정을 통째로 정해 주면 그 문단을 글자 그대로 이 구획에 넣는다. 그 문단에 나이가 없어도 나이를 덧붙이거나 고치지 않는다(§9-2의 나이 확인은 내가 지은 인물에만 해당한다). 아이·학생에 관한 §6의 지킴은 이 예외와 무관하게 그대로다.
- 조건절 밖의 층에는 얼굴형·이목구비·피부색·체형·나이 서술을 쓰지 않는다. 타고난 생김새(애교살의 볼록함 자체, 입술 두께, 눈매)도 쓰지 않는다. Hair and makeup과 Expression은 항상 쓴다. 화장과 스타일링으로 만든 것(블러셔, 립 색과 마감, 아이라인, 눈썹을 채운 모양, 헤어 커트와 색)은 쓰고, 눈빛 반사(캐치라이트)는 Light에 쓴다.
- 참조의 고개 각도와 시선을 그대로 따르지 않도록 Expression이나 Pose에 장면에 맞는 각도와 시선을 쓴다.
- 사용자가 모델 사진을 첨부한다고 했는데 이 대화에 이미지가 없으면 블록 밖에 한 줄로 인물 사진을 함께 첨부하라고 알린다.
- 따로 `## Person` 층은 두지 않는다.

### 기본 인물

요청에 성별·나이·외모가 없으면 조건절의 마지막 문장에 아래 기본 인물을 쓴다(Iris 프리셋이 기본으로 잡는 인물 설정을 따른 것이다: 22세 동아시아 여성). 사용자가 준 값(성별, 나이, 분위기, 외모의 일부)은 그 값만 바꾸고 나머지는 기본값을 쓴다.

| 요청한 룩의 문화권 | `If none is provided,` 뒤에 쓸 문장 |
|---|---|
| 한국·중국·일본, 또는 단서 없음 | she is a 22-year-old East Asian woman with a small face and a slender build. |
| 미국 | she is a 22-year-old American woman with defined cheekbones and a healthy, balanced build. |
| 프랑스 | she is a 22-year-old French woman with clean defined bone structure and a slender build. |
| 그 밖의 문화권 | 그 지역의 22세 여성. 얼굴은 골격이 또렷하다는 정도, 체형은 날씬하다는 정도만 쓴다 |

- 외모 서술은 조건절 한 곳에만 둔다. 다른 층에서 얼굴형이나 체형을 다시 말하지 않는다.
- 헤어·메이크업·의상의 기본값은 조건절이 아니라 각 층에서 장면에 맞게 지어 채운다(§4).
- 기본 인물과 사용자가 요청한 값 밖에서 flawless·porcelain-perfect 같은 미화어나 얼굴 비율 이상형 문구를 더하지 않는다.
- 인물을 지어 채울 때 나이는 20세 이상으로 쓴다(기본 22세). 비성적인 어린이·청소년 인물 요청을 임의로 성인으로 바꾸지 않는다. 미성년을 가리키는 요청에 성인 라벨만 덧붙여 허용 가능한 요청으로 취급하지 않는다(나이 숫자만 덧붙이는 것도 같다). 기본 인물은 요청에 나이가 없을 때만 쓴다. 사용자가 숫자 나이를 정하지 말라고 했으면 숫자 대신 `an adult`로 쓴다(사용자 말이 이긴다).
- "랜덤 인물", "다양하게"처럼 인물 자체를 맡기면 기본 인물을 되풀이하지 않고 [editorial/portrait-variations.md](editorial/portrait-variations.md)를 따른다. 이때도 조건절의 인물 나이는 20~35세 안에서 고른다. 성별·나이대·문화권은 사용자 말, 룩 단서, 없으면 여성·20~35세·동아시아 순으로 정한다. 인물을 지어 채우는 모든 경로(기본 인물, 랜덤, 변주, 자동 확장)가 같다.

## 6. 화면 글자와 지어내지 않는 것

- 정확한 문구: 사용자가 준 문구를 따옴표 안에 한 글자도 바꾸지 않고 한 번만 쓴다. 그 줄에 위치, 크기, 서체, 또렷하게 읽힐 것, 한 번만 나온다는 것을 함께 쓰고, 다른 글자가 없다는 문장을 같은 층에 한 줄 둔다. 글자는 `Text`나 `Label` 같은 층에 모은다.
- 사용자가 문구를 주지 않았으면 글자를 지어내지 않는다. 간판·포장·화면은 `no readable lettering`처럼 보이는 상태로 쓴다.
- 브랜드·제품명(카메라, 필름, 패션, 소품 등)은 룩을 가리키는 말로 쓸 수 있다. 로고와 상표 글자는 화면에 그리지 않는다. 실존 인물의 이름은 스타일을 가리킬 때만 쓰고(예: Godard, Jane Birkin), 그 사람의 얼굴이나 몸을 닮게 하는 용도로는 쓰지 않는다.
- 첨부하지 않은 참조를 말하지 않는다(reference, same face). `## Identity Reference` 구획만 예외다.
- 아이·학생이 나오는 이미지도 만든다. 교복과 학생 연출도 쓸 수 있고, 스쿨룩·프레피·하이틴은 성인 패션 장르다. 지키는 것은 둘이다: 미성년을 성적으로 그리지 않는다(아이·학생이 나오는 이미지에는 관능 어휘와 노출 연출을 붙이지 않는다), 실존 인물의 얼굴·몸을 닮게 하지 않는다.
- 금지 문장은 세 경우에만 쓴다: 사용자가 빼 달라고 한 것, 정확 문구 밖의 글자, 편집에서 지킬 것. 관련 층 안에 한 문장으로 쓰고, `no X, no Y`처럼 늘어놓지 않는다. 그 밖에 비워 두고 싶은 것은 보이는 상태로 쓴다("the table is bare", "the street is empty").
- 비율은 사용자가 요청했을 때만 Camera 층에 한 번 쓴다. 모델명, API 설정, 로컬 파일 경로, 검수 절차는 쓰지 않는다.

## 7. 후속 수정: 한 층만 바꾸기

1. 직전 프롬프트가 원문이다([../templates/common.md](../templates/common.md) §기준 원문과 누적 수정).
2. 바꾸라는 층만 새로 쓴다. 그 층도 2~5줄이다.
3. 첫 줄과 다른 층은 글자 그대로 둔다. 단어 하나, 쉼표 하나도 바꾸지 않는다. 사진의 이름 자체가 바뀌는 요청(장소나 핵심 자세를 바꾸는 요청)일 때만 첫 줄을 고친다.
4. 다른 층에 새 층과 부딪치는 문장이 있으면 그 문장만 고치고, 블록 밖에 어느 문장을 왜 고쳤는지 한 줄 쓴다. 그래서 시간대·안개는 처음부터 Light에 둔다.
5. 층을 더해 달라고 하면 맞는 자리에 층 하나를 넣고 나머지는 그대로 둔다.

## 8. 첨부 이미지 편집

모양은 §1과 같다. 첫 줄은 `Edit the attached photo of <무엇>.`이고, 바꿀 곳마다 층 하나, 마지막에 `## Keep` 층을 둔다.

- 바꿀 층에는 바꿀 대상과 위치, 바뀐 뒤의 모습(빛을 받는 모습까지)을 쓴다.
- `## Keep`에는 사용자가 지키라고 한 것 전부와 바뀌면 티 나는 것 한두 개(얼굴, 제품 형태, 원본 크롭, 빛 방향)를 쓴다. 금지 문장은 Keep에만 둔다. 바꾸라고 한 것은 Keep에 넣지 않는다.
- 편집에서는 비운 층을 지어 채우지 않는다. 요청하지 않은 조명·피부 결·입자·소품을 더하지 않고, 사진에 이미 보이는 외형을 다시 묘사하지 않는다.
- 로컬 파일 경로를 첨부 대신 쓰지 않는다. 픽셀 단위로 같게 남는다고 약속하지 않는다.
- 사진 속 사람 수를 모르면 the subject로 쓴다.
- 이어지는 편집이면 직전에 마음에 든 결과를 원본으로 삼고 이번에 바꿀 것만 쓴다.
- 편집 패턴과 글자·투명 배경 세부는 [surface-contracts.md](surface-contracts.md) §3.3·§3.2.3.

```text
Edit the attached photo of a living room.

## Sofa fabric
corduroy upholstery — Change only the sofa upholstery from gray linen to rust-colored corduroy: narrow vertical ribs run down the backrest and seat cushions, each rib catching the window light on one side and leaving a thin shadow line on the other.
seams — The cushion seams, piping and creases stay where they are in the original, now in the new fabric.

## Keep
unchanged — Keep the room, the sofa's shape and position, the window light direction and the original crop exactly as they are.
```

## 9. 내기 전에 확인

새 이미지는 모두 본다. 첨부 이미지 편집은 1·3·7·8·9·10만 본다.

1. 첫 줄이 이 사진의 이름을 말하는 제목 없는 한 문장이고(국적·피부색·얼굴 서술이 없다), 층이 셋 이상이며(편집은 바꿀 층과 Keep), 모든 줄이 `토큰 — 문장`인가(`## Identity Reference` 문단은 예외)? 쉼표로 늘어놓은 단어 줄이 없는가?
2. 사람이 나오면 `## Identity Reference`가 첫 층이고 `## Person` 층이 없으며, 화면에 보이는 기본 층이 다 있는가? 안 보이는 부위의 층만 뺐는가? 인물을 내가 지었다면(기본·랜덤·다양하게) 조건절에 20세 이상의 나이가 있는가(사용자가 범용 템플릿을 달라고 해 `create a new person suited to the scene` 원문을 쓴 경우, 호출자·사용자가 인물 문단을 통째로 정해 준 경우는 예외)? (기계 계약이면 §1의 줄이는 순서가 우선한다.)
3. 사용자가 준 문구·수량·비율·지킬 것·뺄 것·룩 이름이 다 있는가?
4. 빛마다 방향과 그 결과(하이라이트, 그림자, 반사)가 있는가? 층끼리 시간대와 날씨가 맞는가?
5. 원어 토큰마다 사전에 있거나 확실히 아는 말인가? 음차를 원어 표기로 바꿨는가? 뒤 문장이 번역이 아니라 화면 결과인가?
6. 사람이 나오면 `## Identity Reference`의 조건문이 있고 조건절 밖에 얼굴·체형·나이·피부색 서술이 하나도 없으며, Hair and makeup과 Expression은 있는가?
7. 한 사실을 두 층에 쓰지 않았는가? 피부 마감이 한 층에만 있는가?
8. §6을 어겼는가(지어낸 글자, 로고·상표 글자, 얼굴·몸을 닮게 하는 실존 인물 이름, 품질 태그, 늘어놓은 금지)?
9. 후속 수정이면 바꾸라는 층 밖의 줄이 글자 그대로인가?
10. 10,000자 이하인가? 기계 계약으로 넘기면 그 계약의 상한 안인가?

## 10. 완성 예시

층의 모양과 채우는 정도만 본다. 장면, 문장, 층 이름을 결과에 옮기지 않는다.

인물, 참조 없이 기본 인물(요청: 가을 성수동 카페 앞에서 찍은 패션 스냅, 전신):
```text
A full-length autumn street-style photograph of a woman pausing outside a converted red-brick café in Seongsu-dong, a stone-beige trench open over a charcoal skirt.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old East Asian woman with a small face and a slender build.

## Hair and makeup
시스루뱅 — A thin fringe of separated strands falls just above the brows, and the forehead shows between the strands.
long hair — Dark brown hair falls straight past the shoulders, tucked behind the left ear so the earlobe and jawline show, with a few fine strands lifting in the breeze.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the bridge of the nose, and fine pores still show through it.
lips and cheeks — A sheer coral-pink lip tint with a little gloss at the center of the lower lip, and a diffuse rose blush that fades into the cheeks with no visible edge.

## Expression
off-lens gaze — Her eyes rest on a point just past the lens to the lower right, the lids relaxed.
small smile — One corner of her mouth lifts slightly while the rest of the face stays calm, as if someone just called her name.

## Outfit
oversized trench — A stone-beige cotton gabardine trench cut wide through the shoulders, worn open, the belt hanging loose at both sides and the hem swinging just below the knee.
knit and skirt — An ivory fine-gauge knit tucked into a charcoal wool midi skirt; the knit has a soft matte surface and the skirt falls in straight, heavy folds.
shoes and bag — Black leather loafers with a low heel, and a small black leather shoulder bag pressed under the left arm.

## Legwear
30D charcoal tights — Semi-sheer charcoal tights let the skin tone show faintly over the shins and knees, while the sides of the calves read darker where the fabric is seen at an angle.
matte finish — The tights have a soft matte surface, with only a faint highlight line running down the front of each shin.

## Props and nails
아아 — An iced americano in a clear plastic cup held in the right hand at hip height: dark coffee, faceted ice and fine beads of condensation wetting her fingertips.
시럽 네일 — Short almond nails in a translucent blush jelly that shows the pale nail bed, each topped with a thick glossy coat that catches one small highlight.

## Pose
weight shift — Her weight rests on the right leg, the left knee bends slightly and the left foot turns out, so the hips tilt into a gentle S-line.
hands — The right hand holds the cup; the left hand hooks under the bag strap at chest height.
turn — The shoulders face three-quarters to the camera's left while the head turns back toward the lens.

## Style
꾸안꾸 — The whole look reads as put together without effort: neutral colors, clean lines, plain unbranded pieces and nothing that looks newly bought.
palette — Stone beige, ivory, charcoal and black, warmed only by the red brick behind her.

## Scene
성수동 — A Seoul neighborhood where old red-brick factories became cafés: the wall behind her is weathered red brick with patched gray mortar, and a black steel-framed glass door sits at the right edge.
sidewalk — Gray paving stones with a few fallen ginkgo leaves near her feet and an empty wooden bench beside the door.

## Light
late-afternoon sun — Low autumn sun from camera left skims across the brick so each brick edge throws a small shadow; it lights the left side of her face and the trench, and the right side falls into soft shadow.
brick bounce — Warm light reflected off the wall fills the shadow side of the coat with a faint orange tint.
highlights — The sun turns the ice in the cup bright and puts a small white catchlight in each eye.

## Optics
clean digital color — Natural color with gently lifted shadows, and highlights on the trench that roll off smoothly instead of clipping to white.
white balance — Daylight white balance keeps the ivory knit neutral and the brick a true red-brown.

## Camera
full-length frame — A vertical frame from the top of her head to her shoes, shot from chest height about four meters away with a moderate telephoto lens, so the brick wall stays flat and straight behind her.
focus — She is sharp from hair to loafers; the door and the bench at the frame edges soften slightly.
```

인물, 참조를 첨부하는 경우와 중국어 토큰(요청: 내 캐릭터 사진 첨부할게. 신중식 느낌 찻집 화보, 허리 위까지):
```text
A magazine portrait of a woman in an ink-black stand-collar jacket sitting by a lattice window in a quiet Chinese tearoom, holding a small white teacup, framed from the waist up.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old East Asian woman with a small face and a slender build.

## Hair and makeup
低发髻 — Dark hair is combed smoothly back from the face and coiled into a small flat bun low at the nape, leaving the neck and ears bare.
发簪 — A slim pale-green jade hairpin passes through the bun and catches a narrow highlight along its length.
平直眉 — The brows are filled in soft gray-brown along a level, straight line with a slightly longer tail.
无粉感底妆 — A powder-free base: the face looks smooth and soft, with a faint satin glow only on the cheekbones and the bridge of the nose.
豆沙唇 — A dusty rose-brown lip color with a soft powdery finish and no gloss.

## Expression
垂眸 — Her eyelids are lowered toward the teacup, and the lashes cast a thin shadow on the upper cheeks.
似笑非笑 — The corners of her lips lift barely a millimeter while the eyes stay calm, so it is hard to tell whether she is smiling.
head angle — Her face turns three-quarters to the camera's right with the chin slightly lowered, toward the light from the lattice window.

## Outfit
立领 — A crisp stand collar rises close around the neck of a clean, straight-cut jacket in heavy ink-black silk.
盘扣 — Three small knot buttons of twisted fabric cord fasten a front panel that crosses diagonally from the collar to the right underarm.
香云纱 — The silk has a faintly crinkled surface and a dark brown sheen where it folds at the elbows and waist.

## Props and nails
紫砂壶 — A small unglazed reddish-brown clay teapot with a fine, dry, sandy-looking surface sits on the table beside her right hand.
teacup — She holds a small white porcelain cup with both hands at chest height, pale green tea inside and a thin line of steam rising from it.
冰透美甲 — Short rounded nails in a sheer nude-pink gloss that lets the natural nail show through.

## Pose
seated lean — She sits upright on a low wooden stool, forearms resting on the edge of a dark wooden table and her weight tipped slightly forward.
shoulders — Shoulders level and relaxed, elbows close to the body, both hands around the cup.

## Style
新中式 — A modern Chinese-inspired look: traditional details kept small so it reads as current clothing rather than costume.
静奢风 — Quiet modern Chinese luxury: a restrained palette of black, ivory and celadon, heavy matte fabrics and almost no ornament.
清冷感 — A cool, still mood with a composed face and no warm color cast anywhere in the frame.

## Scene
茶室 — A small wood-paneled tearoom with a low dark table, a paper-shaded lamp off to one side and a single branch of white plum in a celadon vase.
漏窗 — Behind her, a white plaster wall holds a round window filled with a carved stone lattice, with green bamboo leaves showing through the openings.

## Light
几何光影 — Late-morning sun comes through the lattice window behind her left shoulder and lays a pattern of small diamond shapes across the table, her shoulder and one sleeve.
wall bounce — Daylight reflected off the white plaster fills her face softly, so the shadows stay gray-brown instead of black.
steam — The backlight catches the steam above the cup as a pale, glowing curl.

## Optics
黑柔滤镜 — A gentle diffusion filter puts a faint halo around the brightest lattice openings while her face stays clear.
muted color — Low-contrast color with slightly lifted blacks and a cool celadon tone in the shadows.

## Camera
留白 — A vertical waist-up frame with her in the right third and the left third left as open plaster wall.
eye level — The camera sits at her eye level about two meters away, focused on her eyes and hands; the lattice window softens slightly behind her.
```

제품, 정확 문구(요청: 앰버 유리 세럼 병 제품컷. 라벨 문구 "LUMEN 01", 물결 그림자):
```text
A clean product photograph of one amber glass serum bottle with a dropper cap standing on pale stone, for the main image of an online shop listing.

## Bottle
amber glass — A small round amber glass bottle with straight shoulders; light passes through the glass, and the serum inside glows honey-orange where the light enters and turns deep brown toward the edges.
dropper cap — A matte black rubber bulb on a brushed-gold collar, the collar showing one narrow bright line along its top edge.
fill level — The bottle is two thirds full, and the top of the liquid shows as a thin bright curve through the glass.

## Label
label text — A cream paper label wraps the front of the bottle, and the exact text "LUMEN 01" appears once on it, centered, in thin black capital letters that are crisp and legible.
plain paper — The label carries only this text on an even matte paper surface.

## Stone surface
travertine — The bottle stands on a pale travertine slab with small natural pits and a honed finish that scatters light instead of shining.
backdrop — Behind it rises a smooth warm-white plaster wall, slightly out of focus, meeting the slab in a soft gradient.

## Water caustics
ripples of light — A glass of water just out of frame at the upper right throws bright, wavy lines of light across the slab and the lower half of the bottle.
between the lines — The stone between the bright lines stays in soft shadow, so the pattern reads as a net of light, sharpest near the base of the bottle.

## Light and shadow
hard sun from the upper right — One small hard light high at the right, like late-morning sun, keeps the caustics crisp and casts a short, clean shadow of the bottle toward the lower left.
glass glow — Light passing through the bottle throws a small amber patch onto the stone inside its shadow.
contact shadow — A thin dark line where the base meets the stone keeps the bottle sitting on the surface instead of floating.

## Camera
product view — The camera is level with the label, the bottle centered with even space on both sides and a little more space above than below.
focus — The label and the front edge of the bottle are sharp, and the wall behind softens into a smooth gradient.
```

단순 장면, 일본어 토큰(요청: 일본 시골집 툇마루에서 낮잠 자는 고양이 사진):
```text
A quiet photograph of a cat napping on the wooden veranda of an old Japanese country house in early summer.

## Cat
curled sleep — A gray tabby sleeps curled on its side, chin resting on one front paw and the tail wrapped around its hind feet.
coat — Short gray fur with dark mackerel stripes; on the sunlit flank the fur looks paler and soft.
stillness — The eyes are closed and the whiskers lie relaxed against the boards.

## Veranda
縁側 — A long, narrow wooden veranda along the outside of the house, its boards worn smooth and darker along the grain, with paper sliding doors half open behind the cat.
garden edge — A small garden of moss and a few round stones lies just below the edge of the boards.

## Light
木漏れ日 — Midday sun filters through a maple beside the house and lands as coin-sized bright spots on the boards and the cat's back, with cool green-tinted shade between them.
paper door glow — The sliding doors behind glow soft white, lit from windows on the far side of the room.

## Camera
low angle — The camera sits at board height about a meter and a half from the cat, with the cat in the lower left third and the veranda running toward the upper right.
focus — The cat's face is sharp; the garden and the far end of the veranda soften.
```

## 11. 기존 프롬프트를 정제·교정할 때

기존 이미지 프롬프트 전체를 "정제·교정·퇴고·검토 및 개선·다듬어 줘"라고 하면, GPT Image 대상이거나 대상 엔진이 정해지지 않았을 때는 새로 쓸 때와 같은 모양(§1)과 언어(§2)로 옮겨 쓴다. 다른 엔진을 지정했으면 아래 마지막 규칙의 우선순위를 따른다. 영어 산문 문단을 그대로 두고 문장만 손보는 것은 정제가 아니다.

- 바꾸는 것: 모양과 말. 첫 줄 한 문장, `## 층`, 층 안은 `토큰 — 영어 문장`으로 나눈다(GPT Image 대상이거나 엔진 미정일 때). 원어가 더 짧고 정확한 자리에는 원어 토큰을 쓴다.
- 바꾸지 않는 것: 원문이 말한 화면의 사실(자세, 의상, 소품, 빛, 색, 구도). 빼거나 바꾸거나 지어내지 않는다.
- 룩 토큰(필름·카메라·문화권 룩)은 원문 내용과 정확히 맞을 때만 쓴다. 포즈·장면·아이템 토큰은 핵심 뜻이 맞으면 쓰고, 문장은 사전의 설명이 아니라 원문에 있는 그대로 쓴다(§4 '토큰 찾기'). `node scripts/find_tokens.mjs --q "찾을 말"`로 찾고, 맞는 말이 없으면 영어로 둔다. 억지로 채우지 않는다.
- 다른 엔진(Midjourney·Higgsfield Soul·Flux·Grok 등)을 지정했으면 `## 층` 모양과 `토큰 — 영어 문장` 형식은 쓰지 않는다. 그 엔진 문서가 정한 형식(길이, 문장·요소 순서, 부정 표현, 옵션 표기 등)이 먼저다. 그 안에서 원어가 더 짧고 정확한 자리에만 원어를 쓰고, 원어 때문에 길어지거나 그 형식과 어긋나면 쓰지 않는다. 원문의 옵션·파라미터(`--ar`, `--s`, `--no` 등)는 지우거나 위치·형식을 바꾸거나 본문 문장으로 풀지 않고 그대로 둔다. 원어 혼용은 옵션 구간을 건드리지 않는다. 확인된 엔진 입력 제약은 [common.md](../templates/common.md) §프롬프트 언어 결정 3항대로 우선한다.
- 일부만 바꿔 달라는 요청("조명만 저녁빛으로")은 §7을 따른다. 그 부분만 고치고 나머지는 원문 모양·언어 그대로 둔다.
- 사용자가 "그대로 줘"라고 했거나 언어·형식·정확 카피를 정했거나, 호출자가 고칠 범위를 한정했으면(예: "문장 내용은 바꾸지 말고 다섯 가지만") 그 지정이 먼저다.
- 원문에 `## Identity Reference` 층이나 그대로 두라고 한 구획이 있으면 글자 그대로 둔다.

전후 예시(Light 층 하나).

```
Before: Sunlight comes through the leaves and falls in small scattered spots on her face and shirt, with cool shade around.
After:
## Light
木漏れ日 — Sunlight filtered through leaves breaks into scattered soft-edged spots of light that shift over her face and shirt against cool shade.
```

## 12. 사진을 보고 프롬프트를 쓸 때

첨부한 사진을 보여 주며 "이 사진 프롬프트로 뽑아 줘", "똑같이 만들 프롬프트를 써 줘"라고 하는 요청이다. 모양(§1), 언어(§2), 층 고르기(§3), 토큰 찾기와 문장 쓰는 법(§4), 인물(§5), 화면 글자(§6)는 새 이미지와 같다. 다른 점은 하나다.

- 새 이미지는 의도를 읽어 비워 둔 층을 지어 채운다. 추출은 사진에 보이는 것만 채운다. §4의 '비워 둔 층' 규칙은 적용하지 않는다.
- 사진을 고치라는 요청은 §8, 사진 속 인물의 얼굴을 참조로 쓰라는 요청은 §5다. 이 절은 사진을 보고 그 사진을 다시 만들 새 프롬프트를 쓰는 경우다.
- 입력이 사용자가 만든 생성물이고 원래 프롬프트가 대화에 있으면 [from-image.md](from-image.md) §4.5가 먼저이고, 생성물의 깨진 글자·아티팩트는 from-image.md §4.2·§4.4를 따른다. 그 밖의 사진은 이 절이다.
- 다른 엔진을 지정했으면 §11의 다른 엔진 줄(`## 층` 모양을 쓰지 않는다)과 같다. 그 엔진 문서의 형식이 먼저이다. 이때 §12.1 표의 층 이름은 읽을 항목의 묶음으로만 쓰고, §12.3의 조건문은 그 엔진 문서의 인물 참조 방식으로 바꾼다. 남는 것은 관찰 항목, 보이는 것만 쓰기, 얼굴·체형 미전사, 표식 무지 처리다.

### 12.1 보는 순서

1. 주 피사체를 정한다. 얼굴에 초점이 맞고, 크게 잡히고, 구도 중심에 있는 사람이다. 헷갈리면 초점이 맞고 가장 큰 사람이다. 흐리거나 작거나 잘렸거나 뒷모습인 사람은 배경 인물이다.
   - 0명(정물·공간)이면 §3의 인물이 아닌 이미지 층을 고르고 `## Identity Reference`는 쓰지 않는다.
   - 1명이면 §5를 따른다.
   - 2명 이상이면 사용자가 얼굴 참조를 붙일 인물을 정했을 때만 그 인물에게 조건문을 쓰고 위치로 가리킨다(`the woman on frame left`). 정하지 않았으면 조건문 없이 모든 인물을 Hair and makeup·Expression·Outfit·Pose로 쓴다. 이 경우 §5의 Identity Reference 항상 두기와 §9-2·§9-6의 Identity Reference 확인은 적용하지 않는다.
   - 배경 인물은 Scene에 수, 위치, 흐린 정도, 걷는 방향, 대략의 옷 색만 쓴다.
2. 아래 항목을 사진에서 읽는다. 읽히는 것만 해당 층에 쓴다.

| 읽을 것 | 쓸 층 | 볼 점 |
|---|---|---|
| 구도 | Camera | 앵글, 카메라 높이, 거리, 어디서 잘렸는지, 여백, 초점과 심도 |
| 장소 | Scene | 장소 종류, 바닥·벽 재료, 배경의 물건, 공간의 깊이 |
| 포즈·시선·손 | Pose, Expression | 체중이 실린 곳, 손이 닿는 대상, 몸과 고개의 각도, 시선이 닿는 곳 |
| 헤어·메이크업 | Hair and makeup | 길이, 가르마, 결, 색, 베이스 마감, 눈·볼·입술의 색과 마감 |
| 의상 | Outfit, Legwear | 아이템마다 실루엣, 소재, 색, 디테일, 착용 상태 |
| 소품 | Props and nails | 종류, 크기, 색, 손과의 관계 |
| 빛 | Light | 광원 방향, 크기, 하드·소프트, 그림자 모양과 가장자리, 하이라이트 자리 |
| 색보정·질감 | Optics, Style | 밝기 키, 대비와 블랙 포인트, 화이트밸런스와 색 쏠림, 어두운 곳과 밝은 곳의 색, 채도, 지배색, 입자 |

- 좌우는 화면 기준(`frame left`)과 인물 기준(`her left hand`)을 구별해 쓴다. 거울에 비친 사진은 좌우를 화면 기준으로만 쓰고 인물 기준 좌우는 쓰지 않는다.
- 빛과 색보정은 사진을 다시 뽑을 때 가장 먼저 어긋나는 것이라 다른 층에 묻히면 안 된다. Light와 Optics를 각각 따로 층으로 쓰고, 지배색 팔레트는 Style에 쓴다.
- 읽는 근거가 흐릴 때의 출발점. 광원은 하이라이트가 있는 쪽이고 그림자가 떨어지는 쪽의 반대편이다. 카메라 높이는 수평선과 바닥 선이 화면 어디에 있는지로 본다. 색 쏠림은 흰 물체나 회색 면이 어느 쪽으로 기우는지로 본다. 블랙 포인트는 가장 어두운 면이 순검정인지 떠 있는지로 본다. 두 말 사이에서 못 고르겠으면 `slightly`, `about` 같은 정도 말로 가운데에 둔다. 색이나 재질을 확정할 수 없으면 확실한 범위까지의 상위어(`metallic`)를 쓰고, 그보다 좁은 값(`gold`, `silver`)을 고르는 것은 추측이라 쓰지 않는다. 읽을 근거가 없으면 그 줄은 쓰지 않는다. 단 §3에서 빼지 않는 층은 근거가 약해도 가장 확실한 한 줄을 정도 말로 둔다(§12.2).

### 12.2 쓰는 법

- 보이는 사실이 기준이다. 사진에 없는 소품, 배경, 장식, 효과를 더하지 않는다. 잘린 발, 가려진 손, 보이지 않는 뒷면은 지어내지 않고 Camera의 프레이밍으로만 쓴다.
- 읽히는 것이 한 줄뿐이면 그 층은 한 줄로 둔다(§1의 2줄 규칙보다 이 줄이 먼저다). 사진에서 안 보이는 부위의 층은 §3대로 뺀다. §3에서 빼지 않는 층(Style·Light·Optics·Camera·Pose)은 근거가 약해도 가장 확실한 한 줄을 `slightly`, `about` 같은 정도 말로 둔다.
- 분위기·태도 같은 해석어는 같은 줄 문장에서 보이는 근거로 받친다. 근거를 못 대면 쓰지 않는다.
- 정도를 붙인다(`slightly`, `half`, `about 45 degrees`). 계절·날씨는 낙엽, 젖은 노면, 옷차림 같은 단서가 있을 때만 쓴다.
- 룩 토큰(필름, 카메라, 문화권 룩)은 사진에 보이는 결과가 그 토큰의 모습과 정확히 맞을 때만 쓴다. 맞는 말이 없으면 영어 토큰과 문장으로 쓴다.
- 포즈·장면·아이템 토큰은 핵심 뜻이 맞으면 쓰고, 뒤 문장은 사전의 설명이 아니라 사진에 보이는 대로 쓴다. 사전 설명의 세부(예: 팔의 위치)가 사진과 다르면 옮기지 않는다(§4 '토큰 찾기').
- 길이는 §1의 상한 안이다(10,000자, 호출자가 더 좁게 정했으면 그 값). 넘으면 같은 말 반복부터 지우고, 보이는 것을 지워서 맞추지 않는다.

### 12.3 인물

- 사진 속 인물의 얼굴 생김새와 체형(이목구비, 얼굴형, 점, 피부 톤)은 쓰지 않는다. `## Identity Reference`는 §5의 조건문 문안 그대로 쓰고, `If none is provided,` 뒤는 §5 규칙(기본 인물이나 사용자가 정한 인물)을 따른다. 사진 속 사람의 외모를 옮겨 적지 않는다.
- 사진에서 보이는 성별과 대략의 나이대(성인/아이)는 §5에서 사용자가 준 값처럼 다뤄 그 값만 바꾸고, 그 밖의 외모(얼굴형·이목구비·체형·피부색)는 옮기지 않는다. 아이·학생으로 보이면 조건절의 나이를 성인으로 바꾸지 않는다.
- 헤어·메이크업·표정·포즈는 층으로 자세히 쓴다. 피부는 메이크업 마감과 보정 수준만 쓴다.
- 사진 속 인물이 아이·학생으로 보이면 §6의 두 지킴을 그대로 따른다.

### 12.4 사진에 찍힌 표식

- 사진 속 로고, 브랜드 마크, 브랜드 글자, 워터마크, 잡지 제호는 옮겨 적지 않는다. 그 자리는 무지 표면으로 쓰고 위치·재료·색은 그대로 쓴다(`a plain unmarked chest area`). 작거나 일부만 보여도, 브랜드 글자인지 애매해도 같다.
- 이것은 사진에 찍힌 표식을 화면에 다시 그리지 않는다는 것만 정한다. §6이 허용하는, 룩을 가리키는 브랜드명 토큰(카메라, 필름 이름 등)은 그대로 쓸 수 있다. 앞의 것은 화면에 그리는 일이고 뒤의 것은 룩을 부르는 말이다.
- 사진 속 물건의 브랜드 고유 기능명·부품명(예: 폰 뒷면의 자석 링을 부르는 상표 기능명)은 화면에 그리는 물건을 가리키므로 일반 명칭으로 쓴다(`a magnetic ring on the phone back`).
- 브랜드와 무관한 일반 글자로 읽은 것은 §6 첫째 줄의 사용자가 준 문구로 본다(§6 둘째 줄보다 이 줄이 먼저다). 원문 그대로 따옴표에 넣고 위치, 크기, 서체, 한 번만 나온다는 것을 쓴다. 읽을 수 없는 글자가 함께 있으면 "다른 글자가 없다"는 문장 대신 그 글자의 위치와 판독 불가 상태(`small illegible lettering`)를 쓴다.

### 12.5 변경 요청이 함께 올 때

"뽑아 줘, 배경만 흰색으로"처럼 바꿀 것이 붙으면 그 요소만 새로 쓰고 나머지는 사진대로 쓴다. 바뀐 요소를 원래 모습처럼 풀어 쓰지 않는다. 그 변경이 만드는 물리 결과(흰 배경이면 반사광이 밝아지고 그림자가 옅어진다)는 Light와 Optics에 반영한다. 말하지 않은 요소는 바꾸지 않는다. 이 경우도 새 프롬프트이므로 §8의 `Edit the attached photo` 모양은 쓰지 않는다.

### 12.6 여러 장을 한 번에

- 한 장에 코드블록 하나, 첨부 순서대로 쓴다.
- 같은 촬영 세트면 첫 줄과 사진마다 다른 층(Expression, Pose, Props and nails, Camera)만 다르게 쓰고, 나머지 층(Identity Reference, Hair and makeup, Outfit, Style, Scene, Light, Optics)은 블록마다 글자 그대로 같은 문장을 쓴다. 세트 안에서 고정 층 가운데 어느 것이든 사진에서 실제로 달라졌으면 그 층만 바꾼다.
- 서로 무관한 사진이면 각자 독립으로 쓴다.

### 12.7 내기 전에 확인

§9 머리말보다 이 줄이 먼저다. §9의 1~8·10을 본다(2와 6은 §12.1의 다인 예외를 따르고, 9는 후속 수정용이라 보지 않는다). 더해서 본다. 사진에 없는 요소를 더하지 않았는가? 읽히지 않은 줄을 지어내지 않았는가? 로고·브랜드 글자·워터마크를 옮겨 적지 않았는가? Light와 Optics가 따로 있고 각각 방향·결과를 말하는가? 인물의 얼굴·체형을 조건절 밖에 쓰지 않았는가?

층 몇 개만 본 모양(보이는 근거로 해석을 받치고, 표식 자리를 무지로 쓴 모습). 장면, 문장, 층 이름을 결과에 옮기지 않는다.

```
## Outfit
crewneck sweatshirt — A heavyweight gray-melange cotton sweatshirt worn loose, the sleeves pushed to the forearms; the chest is a plain unmarked surface.

## Light
window light — A large window out of frame to the left lights the left cheek and arm; the shadows on the right fall soft-edged and stay gray, not black, because the white wall bounces light back.

## Optics
faded grade — A slightly faded look: the blacks are lifted to dark gray and the whites lean faintly warm, with low contrast overall.
```
