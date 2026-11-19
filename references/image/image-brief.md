# 이미지 프롬프트 작성 안내

## 1. 완성본의 모양

대상을 따로 정하지 않았으면 ChatGPT 웹의 GPT Image에 붙여 넣을 프롬프트를 쓴다(대상 판정은 [surfaces.md](surfaces.md) §0, 직접 API 설정은 [surface-contracts.md](surface-contracts.md) 2.5 §4.3, 2.6 §4.5). 다른 엔진을 지정했으면 그 엔진 문서의 형식을 따른다. 사용자가 형식·제목·순서를 정했으면 그대로 쓴다.

- 이미지 하나에 코드블록 하나. 따로 쓸 프롬프트를 여럿 달라고 하면 블록마다 모든 층을 다시 다 쓴다.
- 블록 밖에는 꼭 필요한 안내만 한 줄씩 쓴다(첨부할 이미지, 후속 수정에서 고친 문장, 뜻을 몰라 풀어 쓴 토큰). 안내 문서 이름, 절 번호, '예시'라는 말은 쓰지 않는다.

모든 프롬프트는 이 모양이다. 단순한 요청도 같다.

```
<첫 줄: 무엇을, 어떤 사진·그림으로, 어디에 쓰는지 한 문장>

## <층 이름>
<토큰> — <그 토큰이 화면에 만드는 모습을 풀어 쓴 영어 문장.>
<토큰> — <영어 문장.>

## <층 이름>
<토큰> — <영어 문장.>
```

- 첫 줄은 제목 없이 맨 위에 둔다. 모델 아이덴티티가 있으면 §5-2의 앵커로 시작한다.
- 층은 `## 영어 이름`으로 시작하고, 층 사이는 빈 줄 하나로 띄운다. 사용자가 프롬프트 언어를 지정하면 층 이름도 그 언어로 쓴다.
- 층 안의 줄은 모두 `토큰 — 문장` 꼴이다(`## Identity Reference` 층만 예외다. 문단 하나를 글자 그대로 둔다, §5-2). 토큰은 원어 토큰(§2)이나 짧은 영어 이름이다. 문장은 영어 한두 문장이다. 대상을 묘사하는 명사구로 시작해도 되지만, 무엇이 어디에 어떻게 보이는지까지 이어 쓴다.
- 단어를 쉼표로 늘어놓지 않는다. `soft light, film look, warm tone` 같은 나열은 엔진이 제멋대로 읽는다.
- 층마다 2~5줄(§3 표가 1줄을 허용한 층만 예외). 첫눈에 읽혀야 할 층(사용자가 가장 공들여 말한 것)은 4~5줄로 가장 자세히 쓴다. 단순 장면도 층은 셋 이상이다.
- 한 사실은 한 층에만 쓴다. 피부 마감은 Hair and makeup 한 곳에서만 말한다.
- 길이는 10,000자 이하다(공백·줄바꿈 포함, ChatGPT 웹 입력창에 붙여 넣는 기본 경로의 상한, 근거는 [surfaces.md](surfaces.md) §0-1). 인물은 보통 3,000~6,000자, 단순 장면은 1,000~2,500자가 된다. 넘으면 같은 말 반복, 화면에 안 보이는 줄, 덜 중요한 층의 셋째 줄부터 지운다. 층 자체는 지우지 않는다.
- 결과를 PromptBundle·ImageProductionHandoff 같은 기계 계약으로 넘기면 그 계약의 2,000자가 이긴다. 줄 수를 줄여 맞추고, 잘라 내지 않는다. 줄이는 순서: Legwear와 Props and nails를 1줄로 → Style을 1줄로 → 나머지 층의 둘째 줄부터 뒤에서 앞으로. 이 순서로도 안 맞을 때만 §3 표가 '빼는 경우'로 허용한 층부터 뺀다. 이 경우 §9-2의 '기본 층이 다 있는가'보다 이 줄이 우선한다.

## 2. 언어와 원어 토큰

- 뼈대는 영어다. 위치, 수량, 방향, 관계, 빛, 크기는 영어 문장으로 쓴다.
- 한국어·중국어·일본어 단어는 그 문화권의 룩을 한 단어로 정확히 가리킬 때만 토큰 자리에 원어 표기 그대로 쓴다(꾸안꾸, 촉촉피부, 시스루뱅, 冷白皮, 千禧CCD直闪, 新中式, 木漏れ日, 透明感). 영어로 옮기면 길어지거나 흐려지는 자리다.
- 토큰 뒤 문장은 번역이 아니라 그 토큰이 화면에 만드는 결과다.
- 쓸 수 있는 원어 토큰은 [layer-lexicon.md](layer-lexicon.md)가 가리키는 층별 표(`lexicon/`)에 있는 것과, 그 문화권에서 그 뜻으로 실제로 쓰인다고 확실히 아는 것뿐이다. 뜻을 모르거나 실제로 쓰이는지 모르면 지어내지 않고 영어 토큰과 영어 문장으로 쓴다.
- 사용자가 한글 음차로 말해도 사전의 원어 표기로 쓴다: 신중식 → 新中式, 코모레비 → 木漏れ日, 시오케이 → 塩系. 사전에 없고 뜻도 모르면 영어로 풀고, 어떻게 풀었는지 블록 밖에 한 줄로 알린다.
- 사용자가 준 룩 이름은 토큰 자리에 그대로 둔다. 그냥 설명하는 말(그림자 부드럽게, 물결 그림자)은 영어 토큰으로 옮기고 문장으로 푼다.
- 쓰지 않는 경우: 일반 명사를 외국어로 바꾸기(自動販売機, 窓), 같은 뜻을 두 언어로 한 번 더, 여러 언어를 고루 채우려는 것, 문화권과 상관없는 장면(흰 배경 제품, 해변의 강아지)에 억지로 넣기.
- 화면 글자는 사용자가 준 문구를 그 언어 그대로 쓴다. 기존 프롬프트를 고칠 때는 원문 언어를 유지한다([../templates/common.md](../templates/common.md) §프롬프트 언어 결정).

| 틀린 줄 | 틀린 이유 | 맞는 줄 |
|---|---|---|
| `신중식 — A quiet documentary portrait with muted film color.` | 음차로 썼고, 뜻을 몰라 엉뚱하게 지어냈다 | `新中式 — A modern Chinese-inspired jacket with a straight clean cut, a stand collar and small knot buttons, in heavy matte fabric.` |
| `시스루뱅 — see-through bangs` | 번역일 뿐 화면 결과가 없다 | `시스루뱅 — A thin fringe of separated strands with the forehead showing between them.` |
| `自動販売機 — A tall drink machine glows white.` | 일반 명사의 번역어다 | `vending machine — A tall drink vending machine glows white from behind its glass front.` |
| `夏の夕暮れ — A hot summer evening.` | 룩 토큰이 아닌 보통 구절이다 | `summer dusk — The sky fades from pale orange to blue-gray, and the warm air softens the distant poles.` |

## 3. 층 고르기

층은 이 질문으로 고른다.

> 이 그림을 다시 뽑을 때 "이것만 바꿔 줘"라는 말이 나올 단위는 무엇인가?

그 단위 하나가 층 하나다. 층을 나눠 두면 한 층만 바꿔도 나머지 층의 문장이 흔들리지 않는다.

### 인물 이미지의 기본 층

사람이 주인공이면 아래 층을 이 순서로 모두 쓰는 것이 기본이다. 화면에 안 보이는 부위의 층만 뺀다.

| 층 | 통제하는 것 | 빼는 경우 |
|---|---|---|
| Person 또는 Identity Reference | 누구인가(§5) | 빼지 않는다 |
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
2. 결과는 층 제목 아래 `토큰 — 화면에 보이는 모습 (별칭)` 줄이다. 장면에 맞는 것을 층마다 골라 `토큰 — 문장`의 토큰으로 쓰고, 문장은 장면에 맞게 다시 쓴다. 결과 문장을 통째로 옮기지 않는다. `no match`인 층은 영어 토큰과 영어 문장으로 쓴다.
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

### 5-1. 기본 인물

요청에 성별·나이·외모가 없으면 `## Person` 층에 아래 기본 인물을 쓴다(Iris 프리셋이 기본으로 잡는 인물 설정을 따른 것이다: 22세 동아시아 여성). 칸의 세 문장을 `default adult —`, `build —`, `skin tone —` 세 줄로 나눠 쓴다. 사용자가 준 값(성별, 나이, 분위기, 외모의 일부)은 그 값만 바꾸고 나머지는 기본값을 쓴다. 기본 인물은 언제나 성인이고 첫 줄에도 `adult`를 쓴다.

| 요청한 룩의 문화권 | Person 층에 쓸 기본 인물 |
|---|---|
| 한국·중국·일본, 또는 단서 없음 | A 22-year-old adult East Asian woman with a small face, clean defined bone structure and a crisp jawline. / A slender build with level shoulders and a long neck. / Light skin with a cool undertone. |
| 미국 | A 22-year-old adult American woman with defined cheekbones and a crisp jawline. / A healthy, balanced build with level shoulders. / Warm sun-tanned skin. |
| 프랑스 | A 22-year-old adult French woman with clean defined bone structure. / A slender build with level shoulders. / Light skin with a few pale freckles across the nose. |
| 그 밖의 문화권 | 그 지역의 22세 성인 여성. 얼굴은 골격이 또렷하다는 정도, 체형은 날씬하고 어깨가 반듯하다는 정도만 쓴다 |

- 외모 서술은 Person 층 한 곳에만 둔다. 다른 층에서 얼굴형이나 체형을 다시 말하지 않는다.
- 헤어·메이크업·의상의 기본값은 Person이 아니라 각 층에서 장면에 맞게 지어 채운다(§4).
- 기본 인물 칸과 사용자가 요청한 값 밖에서 flawless·porcelain-perfect 같은 미화어나 얼굴 비율 이상형 문구를 더하지 않는다.
- 비성적인 어린이·청소년 인물 요청을 임의로 성인으로 바꾸지 않는다. 미성년을 가리키는 요청에 성인 라벨만 덧붙여 허용 가능한 요청으로 취급하지 않는다. 기본 인물은 요청에 나이가 없을 때만 쓴다.
- "랜덤 인물", "다양하게"처럼 인물 자체를 맡기면 기본 인물을 되풀이하지 않고 [editorial/portrait-variations.md](editorial/portrait-variations.md)를 따른다. 이때도 인물은 성인이고, `## Person` 층(또는 첫 줄)에 `adult`와 20세 이상의 나이대를 쓴다(20~35세 안에서 고른다). 성별·나이대·문화권은 사용자 말, 룩 단서, 없으면 여성·20~35세·동아시아 순으로 정한다. 인물을 지어 채우는 모든 경로(기본 인물, 랜덤, 변주, 자동 확장)가 같다.

### 5-2. 모델 아이덴티티가 존재하는 경우

첨부한 참조 이미지나 저장된 아이덴티티가 인물을 정하는 경우다. 얼굴은 이미지가 정하고, 나머지는 프롬프트의 층이 정한다.

1. 첫 줄은 이 문장으로 시작한다. 괄호 안까지 그대로 쓰고, 성별을 알면 their를 her나 his로 바꾼다. 뒤에 무엇을 어떤 사진으로 찍는지 붙인다.
   `The person in the attached image, taking only their face and overall impression from it (not its pose, head angle, gaze, expression, hair, makeup, jewelry, clothing, background or lighting), <무엇을, 어떤 사진으로>.`
2. 둘째 층은 `## Identity Reference`다. 사용자가 준 아이덴티티 문단(저장된 문단)이 있으면 글자 하나 바꾸지 않고 그대로 넣는다. 없으면 이 문단을 쓴다.
   `The attached image is the identity reference for this person. Keep their facial identity so they read as the same person in a new photograph; their hair, makeup, expression, pose, clothing, light and camera come from the layers below.`
3. `## Person` 층은 쓰지 않는다. 얼굴형, 골격, 눈·코·입의 모양, 쌍꺼풀, 피부색, 주근깨, 나이, 민족, 체형도 어느 층에도 쓰지 않는다.
4. Hair and makeup과 Expression은 다른 층과 똑같이 2~5줄로 풍부하게 쓴다. 경계: 화장과 스타일링으로 만든 것(블러셔, 립 색과 마감, 아이라인, 눈 밑 펄 하이라이트, 눈썹을 채운 모양, 헤어 커트와 색)은 쓰고, 타고난 생김새(애교살의 볼록함 자체, 입술 두께, 눈매)는 쓰지 않는다. 눈빛 반사(캐치라이트)는 Light에 쓴다.
5. 고개 각도와 시선은 첨부 사진과 다르게 정해 Expression이나 Pose에 쓴다.
6. 나머지 층(Outfit, Legwear, Props and nails, Pose, Style, Scene, Light, Optics, Camera)은 §3·§4대로 쓴다.
7. 이 대화에 이미지가 첨부되지 않았으면 블록 밖에 한 줄로 인물 사진을 함께 첨부하라고 알린다.

## 6. 화면 글자와 지어내지 않는 것

- 정확한 문구: 사용자가 준 문구를 따옴표 안에 한 글자도 바꾸지 않고 한 번만 쓴다. 그 줄에 위치, 크기, 서체, 또렷하게 읽힐 것, 한 번만 나온다는 것을 함께 쓰고, 다른 글자가 없다는 문장을 같은 층에 한 줄 둔다. 글자는 `Text`나 `Label` 같은 층에 모은다.
- 사용자가 문구를 주지 않았으면 글자를 지어내지 않는다. 간판·포장·화면은 `no readable lettering`처럼 보이는 상태로 쓴다.
- 브랜드·제품명(카메라, 필름, 패션, 소품 등)은 룩을 가리키는 말로 쓸 수 있다. 로고와 상표 글자는 화면에 그리지 않는다. 실존 인물의 이름은 스타일을 가리킬 때만 쓰고(예: Godard, Jane Birkin), 그 사람의 얼굴이나 몸을 닮게 하는 용도로는 쓰지 않는다.
- 첨부하지 않은 참조를 말하지 않는다(reference, same face). §5-2만 예외다.
- 노출은 요청보다 더하지 않는다. 성적 연출과 미성년을 떠올리게 하는 설정·어휘(교복, 학생 연출 등)는 쓰지 않는다.
- 금지 문장은 세 경우에만 쓴다: 사용자가 빼 달라고 한 것, 정확 문구 밖의 글자, 편집에서 지킬 것. 관련 층 안에 한 문장으로 쓰고, `no X, no Y`처럼 늘어놓지 않는다. 그 밖에 비워 두고 싶은 것은 보이는 상태로 쓴다("the table is bare", "the street is empty").
- 비율은 사용자가 요청했을 때만 Camera 층에 한 번 쓴다. 모델명, API 설정, 로컬 파일 경로, 검수 절차는 쓰지 않는다.

## 7. 후속 수정: 한 층만 바꾸기

1. 직전 프롬프트가 원문이다([../templates/common.md](../templates/common.md) §기준 원문과 누적 수정).
2. 바꾸라는 층만 새로 쓴다. 그 층도 2~5줄이다.
3. 첫 줄과 다른 층은 글자 그대로 둔다. 단어 하나, 쉼표 하나도 바꾸지 않는다.
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

1. 첫 줄이 제목 없는 한 문장이고, 층이 셋 이상이며(편집은 바꿀 층과 Keep), 모든 줄이 `토큰 — 문장`인가(`## Identity Reference` 문단은 예외)? 쉼표로 늘어놓은 단어 줄이 없는가?
2. 사람이 나오면 Person(또는 Identity Reference)과 화면에 보이는 기본 층이 다 있는가? 안 보이는 부위의 층만 뺐는가? 인물을 내가 지었다면(기본·랜덤·다양하게) Person 층에 `adult`와 20세 이상의 나이가 있는가? (기계 계약이면 §1의 줄이는 순서가 우선한다.)
3. 사용자가 준 문구·수량·비율·지킬 것·뺄 것·룩 이름이 다 있는가?
4. 빛마다 방향과 그 결과(하이라이트, 그림자, 반사)가 있는가? 층끼리 시간대와 날씨가 맞는가?
5. 원어 토큰마다 사전에 있거나 확실히 아는 말인가? 음차를 원어 표기로 바꿨는가? 뒤 문장이 번역이 아니라 화면 결과인가?
6. 모델 아이덴티티가 있으면 첫 줄 앵커와 괄호, `## Identity Reference`가 있고, 얼굴·체형·나이·피부색 서술이 하나도 없으며, Hair and makeup과 Expression은 있는가?
7. 한 사실을 두 층에 쓰지 않았는가? 피부 마감이 한 층에만 있는가?
8. §6을 어겼는가(지어낸 글자, 로고·상표 글자, 얼굴·몸을 닮게 하는 실존 인물 이름, 품질 태그, 늘어놓은 금지)?
9. 후속 수정이면 바꾸라는 층 밖의 줄이 글자 그대로인가?
10. 10,000자 이하인가? 기계 계약으로 넘기면 그 계약의 상한 안인가?

## 10. 완성 예시

층의 모양과 채우는 정도만 본다. 장면, 문장, 층 이름을 결과에 옮기지 않는다.

인물, 기본 인물로 창조(요청: 가을 성수동 카페 앞에서 찍은 패션 스냅, 전신):
```text
A full-length street-style photograph of one adult woman pausing outside a converted red-brick café in Seongsu-dong on an autumn afternoon, for a fashion feed.

## Person
default adult — A 22-year-old adult East Asian woman with a small face, clean defined bone structure and a crisp jawline.
build — A slender build with level shoulders and a long neck; she stands tall without looking stiff.
skin tone — Light skin with a cool undertone.

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

모델 아이덴티티가 존재하는 경우, 중국어 토큰(요청: 내 캐릭터 사진 첨부할게. 신중식 느낌 찻집 화보, 허리 위까지):
```text
The person in the attached image, taking only her face and overall impression from it (not its pose, head angle, gaze, expression, hair, makeup, jewelry, clothing, background or lighting), photographed for a magazine portrait as she sits by a lattice window in a quiet Chinese tearoom, framed from the waist up.

## Identity Reference
The attached image is the identity reference for this person. Keep her facial identity so she reads as the same person in a new photograph; her hair, makeup, expression, pose, clothing, light and camera come from the layers below.

## Hair and makeup
低发髻 — Dark hair is combed smoothly back from the face and coiled into a small flat bun low at the nape, leaving the neck and ears bare.
发簪 — A slim pale-green jade hairpin passes through the bun and catches a narrow highlight along its length.
平直眉 — The brows are filled in soft gray-brown along a level, straight line with a slightly longer tail.
无粉感底妆 — A powder-free base: the face looks smooth and soft, with a faint satin glow only on the cheekbones and the bridge of the nose.
豆沙唇 — A dusty rose-brown lip color with a soft powdery finish and no gloss.

## Expression
垂眸 — Her eyelids are lowered toward the teacup, and the lashes cast a thin shadow on the upper cheeks.
似笑非笑 — The corners of her lips lift barely a millimeter while the eyes stay calm, so it is hard to tell whether she is smiling.
head angle — Her face turns three-quarters to the camera's right with the chin slightly lowered, an angle different from the attached photo.

## Outfit
新中式 — A modern Chinese-inspired jacket: a clean, straight cut in heavy ink-black silk, with traditional details kept small so it reads as current clothing rather than costume.
立领 — A crisp stand collar rises close around the neck.
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
