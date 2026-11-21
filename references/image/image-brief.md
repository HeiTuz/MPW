# 이미지 프롬프트 작성 안내

## 1. 완성본의 모양

대상을 따로 정하지 않았으면 ChatGPT 웹의 GPT Image에 붙여 넣을 프롬프트를 쓴다(대상 판정은 [surfaces.md](surfaces.md) §0, 직접 API 설정은 [surface-contracts.md](surface-contracts.md) 2.5 §4.3, 2.6 §4.5). 다른 엔진을 지정했으면 이 모양으로 먼저 쓰고 [engine-levers.md](engine-levers.md)로 그 엔진에 편다(표에 없는 엔진은 그 엔진 문서의 형식). 사용자가 형식·제목·순서를 정했으면 그대로 쓴다.

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

- 첫 줄은 제목 없이 맨 위에 두는, 이 사진의 이름을 말하는 한 문장이다. 어떤 사진인가(매체·장르), 누가 무엇을 하는 어떤 순간인가(사람은 성별 정도만), 이 사진을 다른 사진과 가르는 것(핵심 자세·소품·장소 가운데 가장 강한 것)을 쓴다. 국적·타고난 피부색·얼굴 서술은 쓰지 않는다. 층끼리 부딪치면 첫 줄이 기준이다. 새 이미지의 첫 줄은 매체 이름으로 시작한다(§3).
- 층은 `## 영어 이름`으로 시작하고, 층 사이는 빈 줄 하나로 띄운다. 사용자가 프롬프트 언어를 지정하면 층 이름도 그 언어로 쓴다.
- 층 안의 줄은 모두 `토큰 — 문장` 꼴이다(`## Identity Reference` 층만 예외다. 문단 하나를 쓴다, §5). 토큰은 원어 토큰(§2)이나 짧은 영어 이름이다. 문장은 영어 한두 문장이다. 대상을 묘사하는 명사구로 시작해도 되지만, 무엇이 어디에 어떻게 보이는지까지 이어 쓴다.
- 단어를 쉼표로 늘어놓지 않는다. `soft light, film look, warm tone` 같은 나열은 엔진이 제멋대로 읽는다.
- 층마다 2~6줄(§3 표가 1줄을 허용한 층, `## Keep`, `## Identity Reference`만 예외). 룩 카드의 Optics와 Light는 8줄까지 쓴다(매체·필름·입자·하이라이트·렌즈·톤이 각각 줄이다). 가장 공들인 층(사용자가 가장 공들여 말한 것)은 4~6줄로 가장 자세히 쓴다. 단순 장면도 층은 셋 이상이다.
- 한 슬롯은 주인 층이 한 번 정한다(§3 슬롯 표). 피부 마감은 Hair and makeup 한 곳에서만 말한다.
- 길이는 10,000자 이하다(공백·줄바꿈 포함, ChatGPT 웹 입력창에 붙여 넣는 기본 경로의 상한, 근거는 [surfaces.md](surfaces.md) §0-1). 인물은 보통 3,000~6,000자, 단순 장면은 1,000~2,500자가 된다. 넘으면 같은 말 반복, 화면에 안 보이는 줄, 덜 중요한 층의 셋째 줄부터 지운다. 층 자체는 지우지 않는다. 호출자가 더 좁은 상한이나 다른 단위(바이트)를 정했으면 그것이 먼저이고, 그 단위로 직접 재어 맞춘다.
- 결과를 PromptBundle·ImageProductionHandoff 같은 기계 계약으로 넘기면 그 계약의 2,000자가 이긴다. 줄 수를 줄여 맞추고, 잘라 내지 않는다. 줄이는 순서: `## Finish`와 고정 몫 줄 모두 → Legwear와 Props and nails를 1줄로 → Style을 1줄로 → 나머지 층의 둘째 줄부터 뒤에서 앞으로. 이 순서로도 안 맞을 때만 §3 표가 '빼는 경우'로 허용한 층부터 뺀다.

## 2. 언어와 원어 토큰

- 영어·한국어·일본어·중국어 가운데 그 자리에 가장 짧고 정확한 말을 고른다. 영어가 뼈대다. 위치, 수량, 방향, 관계, 빛, 크기는 영어 문장으로 쓴다. 긴 영어 설명을 짧은 원어 표현으로 줄일 수 있으면 원어를 쓴다(구절도 된다). 토큰 자리에는 원어 표기 그대로 쓴다(꾸안꾸, 촉촉피부, 시스루뱅, 冷白皮, 千禧CCD直闪, 新中式, 木漏れ日, 透明感).
- 토큰 뒤 문장은 번역이 아니라 그 토큰이 화면에 만드는 결과다.
- 한 층에 같은 언어의 원어 토큰을 여럿 써도 되고(`伏し目`과 `半開き唇`), 층마다·프롬프트마다 언어 비율 기준은 없다.
- 쓸 수 있는 원어 토큰은 [layer-lexicon.md](layer-lexicon.md)가 가리키는 층별 표(`lexicon/`)에 있는 것과, 그 문화권에서 그 뜻으로 실제로 쓰인다고 확실히 아는 것뿐이다. 뜻을 모르거나 실제로 쓰이는지 모르면 지어내지 않고 영어 토큰과 영어 문장으로 쓴다. 그 밖의 문화권(프랑스어 등)은 사전에 오른 토큰만 쓴다.
- 사용자가 한글 음차로 말해도 사전의 원어 표기로 쓴다: 신중식 → 新中式, 코모레비 → 木漏れ日, 시오케이 → 塩系. 사전에 없고 뜻도 모르면 영어로 풀고, 어떻게 풀었는지 블록 밖에 한 줄로 알린다.
- 사용자가 준 룩 이름은 토큰 자리에 그대로 둔다. 그냥 설명하는 말(그림자 부드럽게, 물결 그림자)은 영어 토큰으로 옮기고 문장으로 푼다.
- 장면의 문화권과 다른 문화권의 토큰도 그 뜻이 장면의 모습과 맞으면 쓸 수 있다(홍콩 밤거리의 `雨の夜`).
- 쓰지 않는 경우: 같은 뜻을 두 언어로 병기하기, 네 언어를 매번 채우려는 것, 원어가 영어보다 길고 더하는 뜻도 없는 자리에 원어를 넣기.
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

그 단위 하나가 층 하나다.

### 인물 이미지의 기본 층

사람이 나오면 아래 층을 이 순서로 모두 쓰는 것이 기본이다. 화면에 안 보이는 부위의 층만 뺀다.

| 층 | 통제하는 것 | 빼는 경우 |
|---|---|---|
| Identity Reference | 누구인가: 참조가 있으면 그 얼굴, 없으면 지어 채운 인물(§5). 첫 층이다 | 빼지 않는다 |
| Hair and makeup | 커트·가르마·앞머리·질감·색, 베이스 마감, 눈·볼·입술 화장, 눈썹 정리 | 뒷모습이라 얼굴이 안 보이면 헤어만 쓴다. 메이크업 줄이 하나도 없으면(남성·아이·학생, 맨얼굴, 뒷모습) 층 이름을 `Hair`로 쓴다. 고정 몫과 카드 줄이 합쳐 6줄을 넘으면 `Hair`(헤어, face clear)와 `Makeup`(베이스부터 입술까지) 두 층으로 나눈다 |
| Expression | 시선이 닿는 곳, 눈꺼풀·눈썹·입꼬리의 정도, 미세한 움직임 | 얼굴이 작아 안 읽히면 1줄로 줄인다 |
| Outfit | 단품, 원단, 핏, 여밈, 신발·가방, 원단이 빛에 반응하는 모습 | 얼굴 클로즈업이라 옷이 안 보일 때 |
| Legwear | 스타킹·타이츠·양말의 비침, 광택, 솔기, 무늬, 주름 | 다리가 화면 밖일 때(상반신, 앉아서 탁자에 가려질 때)나 바지·긴 치마가 다리를 가릴 때. 다리가 보이는데 양말·스타킹류가 없으면 빼지 않고 `bare legs — ...` 한 줄로 쓴다(피부 톤은 쓰지 않는다) |
| Props and nails | 손에 든 것, 장신구, 손톱 모양·색·마감 | 손도 소품도 화면에 없을 때 |
| Pose | 체중이 실린 곳, 손이 닿는 곳, 몸과 고개의 각도 | 빼지 않는다 |
| Style | 룩의 계열, 전체 색 팔레트, 시대감, 분위기 | 빼지 않는다 |
| Scene | 장소, 표면 재료, 배경의 물건·사람, 시간대가 보이는 단서 | 단색 배경이면 1줄 |
| Light | 장면 속 광원(해, 창, 가로등, 간판)의 방향과 그 빛이 만든 하이라이트·그림자·반사, 날씨와 안개 | 빼지 않는다 |
| Optics | 매체가 만드는 모습: 카메라에 달린 플래시, 필름·디카의 색 반응, 하이라이트 처리, 렌즈 플레어·비네팅, 입자 | 빼지 않는다 |
| Camera | 프레이밍, 카메라 높이와 거리, 초점과 심도, 비율. 유리 너머 줄(물방울 창, 유리창 이중 반사)은 카메라가 유리 반대편에 있을 때만 쓰고, 카메라와 인물이 같은 차 안·방 안이면 창은 인물 옆이나 뒤에 둔다 | 빼지 않는다 |
| Finish | 마지막 층. 첫 줄의 매체를 다시 부르는 닫는 말, 실사·품질 줄, 금지 한 줄([fixed-lines.md](fixed-lines.md)) | 그림·3D 매체를 요청했을 때 |

- 빛 둘을 가르는 기준: 장면 안에 있는 광원은 Light, 카메라와 매체가 만드는 것(직광 플래시, 빛샘, 색 쏠림)은 Optics다. 하이라이트가 날아가거나 그림자가 잠기는 정도는 광원이 어디 있든 Optics에 쓰고, Light에는 하이라이트·그림자의 자리와 모양만 쓴다.
- Style에는 계열과 팔레트만 쓴다. 옷 하나하나는 Outfit, 장소는 Scene에 쓴다.
- 더 잘게 나눈다: 한 층에 사용자가 따로 바꿀 만한 것이 둘 들어 있거나, 그 층이 요청의 중심이라 5줄을 넘으면 둘로 나눈다. 예: 뷰티 클로즈업은 Hair / Makeup, 레이어드 패션은 Outerwear / Inner layers, 네일이 주인공이면 Props / Nails. 나눈 층도 2~6줄이다. 줄이 상한(룩 카드를 쓰는 Optics·Light는 8줄)을 넘으면 같은 사실을 두 번 말하는 줄부터 뺀다(Optics는 카메라 본체 줄이 비네팅·플래시를 이미 말했으면 그 줄을 다시 쓰지 않는다).

새 이미지의 매체는 첫 줄과 마지막 층 `## Finish`가 두 번 붙잡는다. 첫 줄은 매체 이름으로 시작하고(`A candid street-style photograph`, `A 35mm film still`, `A studio portrait photograph`, 룩 카드가 있으면 카드 고정 사실의 첫 줄 매체. 요청이 매체를 말하지 않고 카드도 없으면 `A natural-light photograph of …`(실내 인공광이면 `A warm lamp-lit photograph of …`)이고 입자는 디지털 노이즈 줄이다), Optics는 그 매체가 화면에 만드는 결과를 쓰고, Finish의 closer가 같은 매체 이름을 한 번 더 부른다. 층마다 붙는 고정 몫과 Finish의 줄은 [fixed-lines.md](fixed-lines.md)가 정하고, 고정 몫은 슬롯당 한 줄을 넘지 않는다.

한 슬롯(한 사실이 들어가는 자리)은 아래 주인 층이 정한다. 다른 층은 그 값을 결과로 되받아 쓸 수 있고, 남의 층에 슬롯 값이 새로 생기면 주인 층으로 옮긴다. 렌즈만 예외다. 렌즈를 말하는 줄은 프롬프트 전체에서 정확히 하나이고, Camera 층이나 Optics 층 어느 쪽에 있어도 된다(카메라 본체 줄이 렌즈를 포함하면 그 줄이 렌즈 줄이다). 렌즈가 여러 출처에서 오면 세트의 렌즈, 쌍의 렌즈, 갈래의 본체·렌즈 줄, 고정 몫 `lens` 순으로 앞선 것 하나만 쓰고, 다른 줄에서는 렌즈 말(mm, 렌즈 종류)을 뺀다. 렌즈 줄을 새로 지어 넣지 않는다.

| 슬롯 | 주인 층 |
|---|---|
| 매체 이름 | 첫 줄과 Finish |
| 장소 | Scene |
| 시간대·날씨 | Light |
| 장면 속 광원·얼굴 빛 | Light |
| 캐치라이트 | Light |
| 매체가 만드는 빛(플래시·할레이션·빛샘) | Optics |
| 손에 든 물건 | Props and nails (손의 자세는 Pose) |
| 시선 대상 | Expression |
| 입술·베이스·눈썹 | Hair and makeup(나눴으면 Makeup) |
| 얼굴·체형·나이 | Identity Reference |
| 표정 낱말 | Expression |
| 입자 | Optics |
| 프레이밍·심도·비율 | Camera |
| 렌즈 | 렌즈를 말하는 줄 하나(Camera 또는 Optics) |
| 실사·품질·금지 | Finish |
| 팔레트 | Style |

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

- `Details`, `Quality`, `Style notes`, `Constraints`, `Negative`처럼 대상이 아닌 이름의 층은 쓰지 않는다. 예외는 마지막 층 `## Finish` 하나다(위 표의 Finish 행, 사진이면 인물이 없어도 둔다).
- 빛은 거의 항상 따로 층으로 둔다. 시간대·안개처럼 빛을 바꾸는 것도 빛 층에 넣는다.

## 4. 층 채우기

다른 엔진을 지정한 새 이미지도 이 절로 층 문안을 먼저 채우고 [engine-levers.md](engine-levers.md) §4로 그 엔진에 편다. 기존 프롬프트를 다른 엔진 형식으로 정제할 때는 §11의 다른 엔진 줄이 먼저다.

### 사용자가 준 것

- 사용자가 준 룩 이름·정밀 토큰은 토큰 자리에 그대로(음차는 원어 표기로) 두고, 문장으로 화면 결과를 풀어 보강한다.
- 사용자가 준 문구, 수량, 비율, 지킬 것, 뺄 것은 빠짐없이 맞는 층에 넣는다.
- 사용자가 가장 공들여 말한 것이 가장 자세한 층이 된다.

### 토큰 찾기

요청에 룩 단서(문화권, 장소, 시대, 장르, 소품, 카메라)가 있으면 층을 채우기 전에 요청의 단서로 먼저 검색한다.

1. 단서를 쉼표로 이어 질의어로 쓴다. 한국어·영어·원어 모두 된다(별칭에 한글 음차가 들어 있다). 층을 좁히면 `--layers outfit,scene`, 문화권을 좁히면 `--culture KR`(KR CN JP US FR). 예: `node scripts/find_tokens.mjs --q "신중식,찻집" --limit 6` 띄어 쓴 문구가 한 곳도 안 걸리면 도구가 낱말로 나눠 다시 찾는다. 쉼표로 끊어 넣는 것이 가장 잘 맞는다(룩 이름은 쉼표나 띄어쓰기로 끊겨도 카드가 뜬다). 핵심 단서의 결과가 엉뚱한 행뿐이면 그 단서 하나로 `--layers`를 좁혀 한 번 더 검색한다. 룩(문화권·시대·장르)이 정해진 새 장면이면(카드가 있는 룩은 아래 '룩 카드'가 먼저다) 첫 검색에서 그 룩의 토큰이 나오지 않은 보이는 층(Pose, Light, Optics, Scene 포함)을 모두 `--layers`에 넣어 그 룩의 단서로 한 번 더 찾는다. 예(층 목록은 예일 뿐이다): `node scripts/find_tokens.mjs --q "홍콩" --layers pose,optics,expression,props-nails`. 그 층에 그 룩의 행이 있으면 장면에 맞는 것을 골라 쓴다(룩이 Style 한 층이 아니라 보이는 층 전체에 실린다). Camera는 `--layers camera`에서 구도·렌즈 행을 찾는다. 결과 맨 위에 `## Look card`나 `## Look card candidates` 블록이 있으면 아래 '룩 카드'를 먼저 따른다. 카드를 읽은 뒤에는 카드가 줄을 주지 않은 보이는 층만 `--layers`로 한 번 더 찾는다. 추출(§12)과 정제(§11)에서도 같은 검색으로 보이는 것의 이름을 찾고, 사진·원문에 없는 룩 요소는 더하지 않는다.
2. 결과는 층 제목 아래 `토큰 — 화면에 보이는 모습 (별칭) [종류]` 줄이다. 장면에 맞는 것을 층마다 골라 `토큰 — 문장`의 토큰으로 쓰고, 문장은 결과 문장을 옮기지 않고 장면(사진이나 원문)에 보이는 대로 다시 쓴다. 사전 설명의 세부(예: 팔의 위치)가 장면과 다르면 문장에 옮기지 않는다. 토큰 자리에는 층 이름·범주 이름이 아니라 그 모습을 부르는 이름을 쓴다(영어든 원어든): `港风西装`, `花衬衫`, `Hong Kong 90s oversized suit`은 좋고 `hair color`, `outfit`, `nails`, `background`, `lighting`은 층·범주 이름이라 나쁘다. 고정 몫과 카드 틀이 정한 슬롯 토큰(`face clear`, `catchlight`, `palette`, `vertical frame`·`horizontal frame`, `focus`, `hands`)은 그대로 쓴다. 종류가 `look`인 토큰(필름·카메라·문화권 룩처럼 결과 전체를 부르는 말)은 장면이 그 룩의 이름으로 불릴 만하면 쓰고, 그 룩을 정하는 특징이 장면과 반대일 때만 쓰지 않는다(새 이미지에서 그 룩을 골랐으면 장면을 그 룩에 맞춘다). 그 밖의 종류(`item`·`place`·`gear`·`brand`·`person-style`)는 핵심 뜻이 맞으면 쓴다. 사전 행이 사용자가 말하지 않은 하위 종류를 뜻하면(예: 그냥 유리병인데 컷 크리스털 병 행) 핵심 뜻이 맞지 않는 것으로 본다. 종류 옆에 `소품 필요`가 붙은 Pose 행은 그 소품이 장면에 있을 때만 쓴다. `no match`이거나 일치한 행이 모두 장면과 맞지 않는 층은 영어 토큰과 영어 문장으로 쓴다. 단 §2대로 그 뜻으로 쓰인다고 확실히 아는 원어가 있으면 그 원어를 쓴다. 맞는 원어 토큰은 쓰고, 영어로 바꾸는 것은 §2 '쓰지 않는 경우'뿐이다(길이는 읽는 말의 수로 본다). 일반 명사도 원어가 더 짧거나 그 문화권의 모습을 함께 부르면 원어를 쓴다(`털 슬리퍼`, `钨丝灯`, `窓際席`).
3. 스크립트를 못 돌리면 [layer-lexicon.md](layer-lexicon.md)의 층별 대표 토큰에서 고르거나, `node scripts/read_refs.mjs references/image/lexicon/scene.md#KR`처럼 층·문화권 절을 읽는다.
4. 랜덤 요청이면 같은 명령에 `--random 1`을 붙여 층마다 일치한 행 중 하나를 난수로 뽑는다([editorial/portrait-variations.md](editorial/portrait-variations.md) §명시적 랜덤 요청).

### 룩 카드

검색 결과 맨 위에 `## Look card` 블록이 나오면 그 룩의 카드가 있다([looks/index.md](looks/index.md)). 카드는 30KB가 넘으니 두 단계로 읽는다. 블록의 `read:` 명령(`node scripts/read_look.mjs <slug> --outline`)으로 갈래·세트·쌍을 정하고, `branch:` 명령 모양(`node scripts/read_look.mjs <slug> --branch A --set S1 --pair 2`)으로 그 갈래·세트·쌍만 읽는다(`--set`은 묶음이 이름으로 부른 다른 갈래 줄도 낸다). 셸이 없으면 카드 파일을 통째로 읽는다. 카드가 없는 룩은 '비워 둔 층'의 순서대로 쓴다. 카드 둘이 불리면(7항) 카드마다 두 단계를 따로 돌린다.

`## Look card candidates` 블록(카드 이름·축·한 줄 요약·읽는 명령)은 이름이 정확히 불린 카드는 없고, 질의의 말(필카, 폴라로이드, 카페 감성)이 카드가 단독으로는 부르지 않는 말로 걸렸다는 뜻이다(후보는 요청과 가까운 순서로 나온다). 맨 위 후보의 요약이 요청의 매체·분위기와 맞으면 그 카드를 `read:` 명령으로 읽고 아래 절차를 따르고, 안 맞으면 다음 후보를 본다. 맞는 후보가 없거나 요청이 매체나 룩을 말하지 않았으면(장소 이름만 있으면) 카드 없이 쓴다. `## Look card`가 함께 있으면 후보는 7항의 둘째 카드로 쓸 때만 읽는다. 요청이 말한 매체(흑백, 필름 종류, 카메라 종류)를 불린 카드가 이미 정했으면(누벨바그의 흑백 갈래) 후보는 읽지 않고, 불린 카드가 정하지 않은 매체이면 그 매체의 `매체` 후보 카드를 둘째 카드로 읽는다.

1. 갈래를 고른다. 장면 세트를 먼저 본다(4항). 세트를 쓰면 갈래는 그 세트가 속한 갈래다. 세트를 안 쓰면 카드 `갈래 고르기` 표에서 요청에 단서 말이 있는 갈래를 쓴다. 두 갈래 단서가 섞이면 매체·색을 정하는 단서(흑백, 필름 종류, 카메라 종류)가 이기고, 그다음은 시대·의상, 장소, 소품 순이다. 단서가 룩 이름뿐이거나 두 갈래에 다 있는 말(양쪽 갈래의 장소)뿐이면 카드의 기본 갈래다.
2. 첫 줄은 카드 `고정 사실`의 첫 줄 매체로 시작하되, 그 안의 매체·포맷·필름 구절은 고른 본체·필름 줄에서 가져온다(세트 번호는 기준이 아니고, 아무 줄도 고르지 않았을 때만 카드의 기본 구절이다). 그 안의 장소·시간 낱말이 요청과 다르면 요청의 장소·시간으로 바꾼다(서울 밤 시네마 카드를 집 안 낮 장면에 쓰면 `Seoul night`를 그 장소·시간으로). `## Finish`의 closer는 카드의 closer 토큰을, realism·anti-cg 토큰은 카드의 문화권 행을 쓴다(fixed-lines.md의 Finish 표).
3. 슬롯마다 값이 둘 이상이면 '비워 둔 층'의 한 줄 순서를 따른다. 사용자 값이 카드 고정 사실과 반대이면(왕가위인데 "한낮") 사용자 값을 쓰고, 그 값에 물린 슬롯(빛, 매체의 색 반응, 입자)도 사용자 쪽으로 맞춘다. 나머지 슬롯은 카드대로 둔다. 인물이 아이·학생이거나 남성이면 카드의 메이크업·네일 색·Legwear 줄은 [fixed-lines.md](fixed-lines.md) 'Identity Reference'의 아이·학생·남성 처리를 따른다.
4. 층별 줄은 장면에 맞는 줄을 골라 `토큰 — 문장`으로 쓰고, 문장은 카드 줄을 베끼지 않고 장면의 자리·방향·색에 맞게 다시 쓴다. 카드 줄이 장면과 맞지 않으면(유카타에 검은 타이츠 줄) 쓰지 않고 장면에 맞는 줄을 고른다. 줄이 요청과 다른 사실을 한 구절에만 담고 있으면(세트의 걷는 중 ↔ 요청의 기다림) 그 구절만 요청대로 고쳐 쓰고 나머지는 그대로 쓴다. 장면 세트는 요청의 장소·소품·시간대·의상 네 범주 가운데 둘 이상이 그 세트와 같고 그 가운데 장소나 소품이 하나는 들어 있으면 그 세트를 통째로 쓴다(세트 머리의 `단서` 낱말은 찾기용이고 판정은 네 범주로만 한다. 포즈·구도·카메라 낱말은 세지 않는다. 시간대는 낮·해질녘·밤처럼 큰 구간이 같으면 같다). 사용자가 다르게 말한 칸만 사용자 값으로 바꾼다. 사용자 말이 여러 층에 걸리면(불꽃놀이를 올려다봄: 장소 Scene, 동작 Pose, 시선 Expression) 그 말이 직접 정하는 칸만 사용자 값이고 나머지는 세트 값으로 두되, 사용자 값과 부딪히는 세트·갈래 줄(깊은 밤 세트에 비 오는 밤 줄)은 건너뛴다. 세트가 여럿 맞으면 같은 범주가 가장 많은 세트, 동수면 장소가 같은 세트, 그다음 소품이 같은 세트, 그래도 같으면 번호가 앞선 세트다. 요청의 지명이 세트 지명을 포함하는 넓은 이름이면(신주쿠 ⊃ 가부키초) 같은 장소이고, 그 안의 다른 곳을 말하면(신주쿠 횡단보도) 장소 칸은 사용자 값이다. 하나만 같거나 하나도 없거나 시간대·의상만 겹치면 세트 없이 갈래 줄로 쓴다. 예(왕가위 카드): 요청이 "90년대 홍콩, 오래된 아파트 거실에서 위스키 한 잔, 밤"이면 장소(아파트 거실)·소품(위스키)·시간대(밤)가 S1과 같으니 S1의 헤어·립·의상·빛·Optics·표정 값을 모두 쓰고, 사용자가 "청바지"라고 했으면 Outfit만 사용자 값이다. 갈래는 S1이 속한 갈래이고, 사용자가 말한 "90년대"는 시대 칸에 그대로 남는다. 요청이 "네온 거리에서 커피 한 잔"뿐이면 장소(네온 거리) 하나만 S4와 같으니 세트 없이 갈래 줄로 쓴다.
5. Pose와 Camera는 `포즈·구도 쌍` 표에서 한 번호의 쌍으로 고른다. 세트가 Pose를 주면 쌍의 Pose는 붙이지 않고, 세트가 Camera를 말하지 않을 때만 쌍의 Camera 줄을 빌리며, 세트 묶음에 `쌍 N만`·`쌍 없음`이 적혀 있으면 그대로 따른다. 사용자가 포즈나 구도를 말했으면 그 말이 먼저다. 한 장이면 고른 갈래의 쌍 가운데 요청의 동작과 같은 것, 없으면 요청의 프레임 범위와 같은 것, 그것도 없으면 그 갈래의 첫 쌍이다. 요청의 동작(산책 등)이 어느 쌍과도 맞지 않으면 Pose는 요청대로 쓰고 Camera 줄만 가장 가까운 쌍에서 가져온다. 가까움은 Camera 줄(프레임 범위와 카메라 높이)로 잰다. 가져온 Camera 줄이 프레임 범위를 말하지 않으면 범위는 요청의 Pose에 보이는 몸으로 정한다(발이 나오면 머리부터 발끝). `맞지 않는 것`은 그 룩이 아닌 요소의 목록이고, 요청이 그것을 정했으면 사용자 값이 이긴다.
6. 같은 장면을 여러 장 달라고 하면서 바꿀 축을 말하지 않았으면, 고른 갈래의 쌍을 번호순으로 장수만큼 배정한다. 한 세트 안에서 쌍을 되풀이하지 않는다. 쌍이 모자라면 다른 갈래에서 빌린다. 고정한 Scene·Outfit과 부딪히지 않는 쌍을 번호순으로 먼저 쓰고 부딪히는 쌍은 그다음에 쓰되, 부딪히는 쌍은 Camera 줄만 쓰고 Pose는 장면에 맞게 고쳐 쓴다. 나머지 층은 블록마다 글자 그대로 같게 두되, 손에 든 물건이 포즈의 일부인 컷(메뉴판으로 얼굴을 가림)은 Props 층의 그 줄만 달라도 된다. 여러 장의 Light는 방향을 `camera left` 같은 카메라 기준 대신 장면 기준(해가 바다 쪽 낮게 있다, 간판이 길 건너편에 있다)으로 쓰고, 컷마다 카메라가 돌아 얼굴의 밝은 쪽이 달라지면 그 한 문장만 컷별로 쓴다. 사용자가 축을 말했으면 그 축만 쌍 목록에서 바꾸고 나머지는 고정한다("포즈만"이면 Camera는 고정, "포즈와 구도"처럼 둘을 말했으면 둘 다 쌍으로 바꾼다). 생성 표면이 프롬프트 하나로 여러 장을 뽑으면 블록 밖에 "포즈를 다르게 받으려면 블록을 하나씩 넣는다"는 한 줄을 쓴다. 쌍 배정표는 사용자가 달라고 했을 때만 답변에 넣는다.
7. 요청이 카드 둘을 부르면 색인(`looks/index.md`)의 `축` 열로 역할을 나눈다. `매체` 카드가 정하는 것: 첫 줄 매체, Optics, Finish closer, 입자, 화면 모양(비율), lens·realism·grain 슬롯의 끄기 처리, 그림자와 색의 성격(팔레트의 색 반응). `장면` 카드가 정하는 것: 갈래, 장면 세트, 포즈·구도 쌍, 장소, 시간대, 빛의 방향, 의상, 헤어, 메이크업, 팔레트의 색 구성, 나머지 슬롯의 끄기 처리, Identity·Finish의 문화권 행. 매체 카드의 갈래는 요청과 맞는 것이 없으면 고르지 않고 `전부` 줄만 쓴다. 예: `캘리포니아 골든아워, Kodak Gold 200`이면 Kodak Gold 200 카드가 필름 매체의 첫 줄·입자·closer·색 반응을 쓰고 캘리포니아 카드가 해변 낙조 장면을 채운다. 두 카드가 같은 축이면 요청에서 먼저 나온 이름의 카드가 기본이고(`find_tokens`가 `## Look card`를 그 순서로 낸다), 다른 카드에서는 기본 카드의 값과 부딪히지 않는 줄만 가져온다. 두 카드의 색이 반대이면(Portra의 복숭아색, 뉴욕의 차가운 회색) 장면 카드가 전체 색을 정하고, 매체 카드는 그 안에서 필름이 기우는 쪽만 말한다(하이라이트는 크림색, 그림자는 청회색). 같은 슬롯에 두 카드가 줄을 주면 매체에 속한 슬롯(입자·톤·하이라이트·화면 모양)은 매체 카드, 그 밖(블러셔 같은 메이크업, 장소, 의상)은 장면 카드가 이긴다. 쌍 번호는 `장면` 카드의 번호다. `매체` 카드의 `끄는 고정 몫`에서 쌍 번호를 조건으로 건 처리는 적용하지 않고 모든 쌍에 해당하는 처리만 쓴다. `매체` 카드의 첫 줄에서 장면을 말하는 구절(Gold 200의 `sunlit Americana`)은 쓰지 않고 매체 구절만 쓴다.

카드를 새로 쓰거나 고칠 때는 palette를 갈래·필름별 행으로 쓰고 예외 구절을 한 행에 합치지 않으며, Scene 줄은 건축·재료·배치만 말하고 빛은 Light 층이 말하게 하고, 세트 묶음에는 쓰는 값만 두고 Iris 원문 값은 `출처` 절에 두며, Optics의 본체 줄은 센서·포맷·렌즈 같은 사실만 말하고 연출(soft glow, warm cast)은 입자·톤 슬롯에 쓴다.

### 비워 둔 층

- 비워 둔 층은 이미지의 목적과 이미 정해진 층에 맞게 구체적으로 지어 채운다. 화면에 보이는 층은 비워 두지 않는다.
- 한 슬롯에 값이 둘 이상이면 이 순서에서 앞선 것을 쓴다: 사용자가 말한 값 → (사진 추출이면) 사진에 보이는 값 → 고른 장면 세트의 값 → 고른 갈래의 카드 줄 → 카드의 고정 사실 → [fixed-lines.md](fixed-lines.md)의 고정 몫(카드 `끄는 고정 몫`이 끈 슬롯에는 붙이지 않는다) → 토큰 찾기로 찾은 검색 행 → 지어 채운 값. 카드나 세트가 없으면 그 단계는 건너뛴다.
- 층끼리 맞춘다. 밤이면 Light와 Optics가 같은 밤이고, 비가 오면 Outfit의 원단이 젖고, Style의 팔레트가 Outfit과 Scene의 색과 같다.

### 쓰기 전에 슬롯 표를 정한다

층을 쓰기 전에 슬롯마다 값과 출처를 한 번 정한다. 머릿속 표이고 답변에 쓰지 않는다. 슬롯: 매체, 필름·센서, 화면 모양(비율), 렌즈, 심도, 입자·노이즈, 해상도(realism), 시간대, 주광원, 팔레트, 장소, 의상, 헤어, 베이스, 입술, 블러셔, 포즈, 시선, 카메라 자리, 프레임 범위. Pose·세트가 시선을 정하면 Expression의 다른 시선 줄을 대신한다. 슬롯 이름이 하이픈 앞부분을 공유하면 접미사로 가른다. 조건 변형(`-mono`·`-wet`·`-bulb`·`tone-<본체>`처럼 '이런 경우에는 이 줄')은 기본 줄과 하나만 쓴다(`palette`·`palette-mono`, `lip`·`lip-satin`). 다른 물건·부위(`outfit-outer`와 `outfit-inner`, `hair`와 `hair-pin`)는 함께 쓴다. 판단이 안 서면 두 문장이 같은 것을 다르게 말하면 하나만, 다른 것을 말하면 함께 쓴다. 출처는 위 '비워 둔 층'의 한 줄 순서의 한 단계다. 표를 다 채운 다음 그 표대로 층을 쓴다. 카드 줄·고정 몫 줄·엔진 장치는 표의 값을 문장으로 표현할 뿐 값을 다시 고르지 않는다. 쓰다가 줄이 표와 다르면 줄을 고친다.

본보기(요청: 서울 밤, 택시 뒷좌석, 영화 같은 느낌. 서울 밤 시네마 카드, 세트 S1, 쌍 1):

```
매체       low-light digital camera 영화 스틸 — 카드 고정 사실
필름·센서  디지털, 필름 없음 — 카드
화면 모양  3:4 세로 — 고정 몫
렌즈       표준~중망원, 렌즈 줄은 `natural perspective` 하나 — 고정 몫(세트·쌍·갈래가 렌즈를 말하지 않음)
심도       배경 보케 — 갈래 줄
입자·노이즈 가장 어두운 곳의 디지털 노이즈 — 고정 몫
해상도     8K 줄 — 고정 몫
시간대     깊은 밤 — 세트 S1
주광원     차창 밖 후미등과 간판 — 세트 S1
팔레트     청록·보라, 붉은 후미등 하나 — 갈래 줄
장소       택시 뒷좌석 — 사용자 말
의상·헤어  보트넥 니트, 검은 긴 생머리 — 세트 S1
베이스·입술·블러셔  카드 줄, 블러셔는 차가운 빛이라 muted rose — 카드와 고정 몫
포즈       옆으로 앉아 창 쪽을 봄 — 쌍 1
카메라 자리  좌석 건너편에서 유리 반사 너머로 — 쌍 1
프레임 범위  머리부터 허리 — 고정 몫(쌍 1이 범위를 말하지 않음)
```

### 문장 쓰는 법

문장은 눈에 보이는 물리 결과로 쓴다.

- 빛: 광원이 어디 있는지, 그리고 그 빛이 표면에 만드는 하이라이트·그림자·반사.
- 포즈: 체중이 실린 다리, 손이 닿는 물건이나 몸의 자리, 어깨와 고개의 방향.
- 재질: 빛을 받았을 때 반사하는지, 흩는지, 비치는지, 어떻게 접히고 늘어지는지.
- 표정: 시선이 닿는 곳, 눈꺼풀과 입꼬리가 움직인 정도.
- beautiful, stunning, perfect 같은 형용사 대신 그렇게 보이는 원인을 쓴다. 품질 태그(8K, ultra-detailed, masterpiece)는 `## Finish`의 realism 줄에 `8K` 한 번만 두고 다른 층에는 쓰지 않는다.
- 색온도 숫자와 "이 필름·카메라가 이 색을 만든다"는 서술은 장비의 물리 법칙이 아니라 이 룩의 연출 값이다. 카드·세트의 켈빈 숫자도 문장에 옮기지 않고 색(따뜻한 호박색, 차가운 청백색)으로 쓴다.
- 입자는 Optics 한 줄에 쓴다. 필름 입자와 디지털 노이즈의 범위·양·끄는 조건은 [fixed-lines.md](fixed-lines.md)의 `grain`이다. 입자 어휘가 GPT Image 화면 노이즈를 부른다는 보고([surface-contracts.md](surface-contracts.md) §3.2.4)는 생성 대조가 없어 새 문안의 금지 근거로 쓰지 않는다.

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
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, <인물 설정>. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.
```

- 마지막 비율 문장(`In either case…`)은 성인 인물에만 쓰고, 아이·학생이면 뺀다.
- `<인물 설정>`이 인물을 정하는 자리다. 사용자가 인물을 지정했으면 그 설정을, 지정하지 않았으면 아래 기본 인물(문화권 공식)을 쓴다. 문단의 "woman"·"her"·"she"는 남성이거나 성별을 정하지 않았으면 첫 줄의 지칭에 맞춰 "man"·"his"·"he"나 "person"·"their"·"they"로 바꿔 쓴다. 남성이면 마지막 비율 문장은 남성용 문장으로 바꿔 쓴다([fixed-lines.md](fixed-lines.md) 남성 인물). `create a new person suited to the scene` 원문은 사용자가 인물을 정하지 않은 범용 템플릿을 달라고 했을 때만 쓴다.
- 호출자·사용자가 그대로 붙여 넣으라고 완성 문단(저장된 아이덴티티 문단 등)을 주면 그 문단을 글자 그대로 이 구획에 넣는다. 그 문단에 나이가 없어도 나이를 덧붙이거나 고치지 않는다(§9-2의 나이 확인은 내가 지은 인물에만 해당한다). 외모·분위기 값만 준 경우는 이 예외가 아니라 아래 기본 인물 규칙을 따른다. 아이·학생에 관한 §6의 지킴은 이 예외와 무관하게 그대로다.
- 얼굴형·이목구비·타고난 피부색(fair, pale, tan, 冷白皮처럼 사람의 속성)·나이는 조건절 안에만 쓴다. 체형 비율은 같은 문단의 `In either case` 문장 한 곳에만 쓴다. 타고난 생김새(애교살의 볼록함 자체, 입술 두께, 눈매)도 쓰지 않는다. 화장이 만든 피부 마감(porcelain finish, glass skin, matte base)은 Hair and makeup에, 빛이 피부에 만든 결과(sun-warmed glow on the skin, neon tint on the cheek)는 Light·Style에 쓸 수 있다. 화장과 스타일링으로 만든 것(블러셔, 립 색과 마감, 아이라인, 눈썹을 채운 모양, 헤어 커트와 색)은 쓴다.
- 참조의 고개 각도와 시선을 그대로 따르지 않도록 Expression이나 Pose에 장면에 맞는 각도와 시선을 쓴다.
- 사용자가 모델 사진을 첨부한다고 했는데 이 대화에 이미지가 없으면 블록 밖에 한 줄로 인물 사진을 함께 첨부하라고 알린다.
- 따로 `## Person` 층은 두지 않는다.

### 기본 인물

요청에 성별·나이·외모가 없으면 조건절의 마지막 문장에 [fixed-lines.md](fixed-lines.md)의 문화권 공식을 쓴다(기본은 22세 여성이다). 사용자가 준 값(성별, 나이, 분위기, 외모의 일부)은 그 값만 바꾸고 나머지는 그 표를 쓴다.

- 헤어·메이크업·의상의 기본값은 조건절이 아니라 각 층에서 장면에 맞게 지어 채운다(§4).
- 미화는 [fixed-lines.md](fixed-lines.md)의 문화권 공식과 메이크업 슬롯 줄로만 넣는다. 성인 인물에만 넣고, 아이·학생에는 넣지 않는다.
- 아이·학생 판정(새 이미지와 §12.3 사진 추출 모두): 아이·어린이, 초·중·고 학생(초등학생·중학생·고등학생·여고생·남고생), 교복 차림, 초·중·고 학교 장소(교실, 운동장, 하굣길), 대학 표시 없는 `학생`이라는 말 가운데 하나라도 있으면 학생으로 다루고, 처리는 [fixed-lines.md](fixed-lines.md) 'Identity Reference'가 정한다. 대학생·대학원생·대학 캠퍼스·대학 도서관은 성인으로 다룬다. 흰 셔츠와 조끼 같은 차림만으로는 성인으로 본다.
- 인물을 지어 채울 때 나이는 20세 이상으로 쓴다(기본 22세). 비성적인 어린이·청소년 인물 요청을 임의로 성인으로 바꾸지 않는다. 미성년을 가리키는 요청에 성인 라벨만 덧붙여 허용 가능한 요청으로 취급하지 않는다(나이 숫자만 덧붙이는 것도 같다). 기본 인물은 요청에 나이가 없을 때만 쓴다. 사용자가 숫자 나이를 정하지 말라고 했으면 숫자 대신 `an adult`로 쓴다(사용자 말이 이긴다).
- "랜덤 인물", "다양하게"처럼 인물 자체를 맡기면 기본 인물을 되풀이하지 않고 [editorial/portrait-variations.md](editorial/portrait-variations.md)를 따른다. 이때도 조건절의 인물 나이는 20~35세 안에서 고른다. 성별·나이대·문화권은 사용자 말, 룩 단서, 없으면 여성·20~35세·동아시아 순으로 정한다. 인물을 지어 채우는 모든 경로(기본 인물, 랜덤, 변주, 자동 확장)가 같다.

## 6. 화면 글자와 지어내지 않는 것

- 정확한 문구: 사용자가 준 문구를 따옴표 안에 한 글자도 바꾸지 않고 한 번만 쓴다. 그 줄에 위치, 크기, 서체, 또렷하게 읽힐 것, 한 번만 나온다는 것을 함께 쓰고, 다른 글자가 없다는 문장을 같은 층에 한 줄 둔다. 글자는 `Text`나 `Label` 같은 층에 모은다.
- 사용자가 문구를 주지 않았으면 글자를 지어내지 않는다. 간판·포장·화면은 `no readable lettering`처럼 보이는 상태로 쓴다.
- 브랜드·제품명(카메라, 필름, 패션, 소품 등)은 룩을 가리키는 말로 쓸 수 있다. 로고와 상표 글자는 새로 그리지 않는다(사용자가 지키라고 한 제품·의상 참조의 실제 로고·라벨은 그대로 둔다). 실존 인물의 이름은 스타일을 가리킬 때만 쓰고(예: Godard, Jane Birkin), 그 사람의 얼굴이나 몸을 닮게 하는 용도로는 쓰지 않는다.
- 첨부하지 않은 참조를 말하지 않는다(reference, same face). `## Identity Reference` 구획만 예외다.
- 아이·학생이 나오는 이미지도 만든다. 교복과 학생 연출도 쓸 수 있고, 스쿨룩·프레피·하이틴은 성인 패션 장르다. 지키는 것은 둘이다: 미성년을 성적으로 그리지 않는다(아이·학생이 나오는 이미지에는 관능 어휘와 노출 연출을 붙이지 않는다), 실존 인물의 얼굴·몸을 닮게 하지 않는다.
- 금지 문장은 네 경우에 쓴다: 사용자가 빼 달라고 한 것, 정확 문구 밖의 글자, 편집에서 지킬 것, `## Finish`의 금지 한 줄. 관련 층 안에 한 문장으로 쓰고, `no X, no Y`처럼 늘어놓지 않는다. 그 밖에 비워 두고 싶은 것은 보이는 상태로 쓴다("the table is bare", "the street is empty").
- 비율은 Camera 층에 한 번 쓴다(인물 사진의 기본 비율은 [fixed-lines.md](fixed-lines.md)가 정한다. 다른 엔진은 그 엔진의 비율·배제 표기가 먼저. Midjourney는 `--ar`·`--no`). 모델명, API 설정, 로컬 파일 경로, 검수 절차는 쓰지 않는다.

## 7. 후속 수정: 한 층만 바꾸기

1. 직전 프롬프트가 원문이다([../templates/common.md](../templates/common.md) §기준 원문과 누적 수정).
2. 바꾸라는 층만 새로 쓴다. 그 층도 2~6줄이다.
3. 첫 줄과 다른 층은 글자 그대로 둔다. 단어 하나, 쉼표 하나도 바꾸지 않는다. 사진의 이름 자체가 바뀌는 요청(장소나 핵심 자세를 바꾸는 요청)일 때만 첫 줄을 고친다.
4. 다른 층에 새 층과 부딪치는 문장이 있으면 그 문장만 고치고, 블록 밖에 어느 문장을 왜 고쳤는지 한 줄 쓴다(예: 빛을 차갑게 바꾸면 따뜻한 블러셔 줄도 고친다).
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

새 이미지는 모두 본다. 첨부 이미지 편집은 1·3·7·8·9·10만 본다. 기계 계약이면 2·11보다 §1의 줄이는 순서가 우선한다.

1. 첫 줄이 이 사진의 이름을 말하는 제목 없는 한 문장이고(국적·피부색·얼굴 서술이 없다), 층이 셋 이상이며(편집은 바꿀 층과 Keep), 모든 줄이 `토큰 — 문장`인가(`## Identity Reference` 문단은 예외)? 쉼표로 늘어놓은 단어 줄이 없는가?
2. 사람이 나오면 `## Identity Reference`가 첫 층이고 `## Person` 층이 없으며, 화면에 보이는 기본 층이 다 있는가? 안 보이는 부위의 층만 뺐는가? 인물을 내가 지었다면(기본·랜덤·다양하게) 조건절에 20세 이상의 나이가 있는가(§5의 범용 템플릿 원문, 정해 준 인물 문단, 아이·학생은 예외)?
3. 사용자가 준 문구·수량·비율·지킬 것·뺄 것·룩 이름이 다 있는가?
4. 빛마다 방향과 그 결과(하이라이트, 그림자, 반사)가 있는가? 층끼리 시간대와 날씨가 맞는가?
5. 원어 토큰마다 사전에 있거나 확실히 아는 말인가? 음차를 원어 표기로 바꿨는가? 뒤 문장이 번역이 아니라 화면 결과인가?
6. 사람이 나오면 `## Identity Reference`의 조건문이 있고 조건절 밖에 얼굴형·이목구비·타고난 피부색·나이 서술이 없으며 체형은 `In either case` 문장 한 곳뿐이고, Hair and makeup과 Expression은 있는가?
7. 같은 슬롯을 두 층에 쓰지 않았는가(입술·베이스·캐치라이트·얼굴 빛·장소·시간대·화면비·입자)? 조건 변형 슬롯(`palette`·`palette-mono`)이 하나만 남았는가? 피부 마감이 한 층에만 있는가?
8. §6을 어겼는가(지어낸 글자, 새 로고·상표 글자, 얼굴·몸을 닮게 하는 실존 인물 이름, `## Finish` 밖의 품질 태그·금지, 늘어놓은 금지)?
9. 후속 수정이면 바꾸라는 층 밖의 줄이 글자 그대로인가?
10. 10,000자 이하인가? 기계 계약으로 넘기면 그 계약의 상한 안인가?
11. 새 이미지면 첫 줄이 매체 이름으로 시작하고 마지막 층 `## Finish`가 그 매체를 다시 부르는가? 룩 카드가 있으면 첫 줄이 카드의 첫 줄 매체이고 Finish에 카드 closer가 있으며, 카드가 끈 슬롯에 고정 몫을 붙이지 않았는가?

## 10. 완성 예시

층의 모양과 채우는 정도만 본다. 장면, 문장, 층 이름을 결과에 옮기지 않는다.

인물, 참조 없이 기본 인물(요청: 가을 성수동 카페 앞에서 찍은 패션 스냅, 전신):
```text
A clean digital street-style photograph: a woman pausing outside a converted red-brick café in Seongsu-dong on an autumn afternoon, a stone-beige trench open over a charcoal skirt, shot full-length.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old Korean woman with a 청순 face: soft, low-contrast features, a small face, a defined nose bridge, a clean jawline and fair, cool-toned skin. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.

## Hair and makeup
시스루뱅 — A thin fringe of separated strands falls just above the brows, and the forehead shows between the strands.
long hair — Dark brown hair falls straight past the shoulders, tucked behind the left ear so the earlobe and jawline show, with a few fine strands lifting in the breeze.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the bridge of the nose, and fine pores still show through it.
애교살 — A soft pearly band under the lower lashes with a faint shadow line beneath it.
점막 아이라인 — A hair-thin dark line along the upper lash roots defines the eye with no visible wing.
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
디지털 노이즈 — Very fine digital noise sits only in the darkest parts of the frame.

## Camera
full-length frame — A vertical 3:4 frame from the top of her head to her shoes, shot from chest height about four meters away with a moderate telephoto lens, so the brick wall stays flat and straight behind her.
focus — She is sharp from hair to loafers; the door and the bench at the frame edges soften slightly.

## Finish
실사 — The whole frame reads as a real clean digital street-style photograph.
극사실 — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the wool and knit, real wear on the brick.
실사 촬영 — A real person photographed on location, never an illustration, anime frame, 3D render or plastic-skinned CGI.
```

인물, 참조 없이 필름 룩과 중국어 토큰(요청: 90년대 홍콩영화 여주인공. 비 오는 밤, 네온 처마 밑에서 커피 한 잔 들고 멀리 보는 한 장면):
```text
A 1990s Hong Kong film still shot on tungsten cinema negative: a woman sheltering under a neon-lit shop arcade in the night rain, a paper coffee cup in her hand, looking far down the street while the city smears past her.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old Chinese woman with 清冷 bone structure: a small 巴掌脸 face, a straight defined nose bridge, a clean jawline and cool fair 冷白皮 skin. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.

## Hair and makeup
王家卫 — A loose 1990s perm grazing the collarbones, airy and slightly undone, the rain-damp ends clumping into soft ropes.
face clear — The near side is tucked behind her right ear so the eye, brow and cheekbone stay clear, while a few damp strands fall loose on the far side of her face.
无粉感底妆 — A matte, shine-free base that still reads as skin, even under the colored light.
野生眉 — Full, natural brows brushed up with the hairs left visible, slightly darker than the hair.
卧蚕 — A soft pearly band under the lower lashes and a hair-thin dark line along the upper lash roots make the eyes look bright and defined.
豆沙唇 — A muted rosy-brown matte lip with a softly blurred edge and no gloss.

## Expression
惆怅 — The inner brows lift a little and the eyes look far off, the lips pressed lightly together.
far gaze — Her eyes are fixed on something at the far end of the street to frame right, not on the lens, as if waiting for someone who is late.

## Outfit
吊带裙 — A deep crimson silk slip dress with thin straps; the satin throws a long liquid highlight down the front wherever the neon reaches it.
oversized wool coat — A man's boxy black wool coat hangs open from her shoulders, a size too big, its shoulders dark and beaded where the rain caught them.

## Props and nails
paper coffee cup — A white paper take-out cup with a plain brown sleeve and flat lid, held in her right hand at chest height, a thin curl of steam rising and catching red light.
红指甲 — Glossy opaque red polish on medium oval nails, each nail holding a small sharp highlight against the cup.

## Pose
靠墙斜倚 — Her left shoulder and back rest against a tiled arcade pillar, her weight sunk into the left hip.
still body — She does not move: the coffee stays at her chest, the left hand stays deep in the coat pocket, and only the steam and the rain around her are in motion.

## Style
重庆森林 — Chungking Express city mood: saturated neon color, a lone still figure, and everything around her streaking past.
palette — Crimson silk, black wool, wet black asphalt, with red and green neon light and nothing pastel or daylight-white anywhere in the frame.

## Scene
骑楼 — A covered shop arcade along an old Kowloon street, square pillars clad in small worn tiles, a closed rolling shutter behind her.
九龙霓虹 — Across the street, dense overlapping neon signs stack up the face of an old tenement, red and green tubes clashing in the haze, every sign blurred past reading.
wet street — Rain sheets off the arcade edge in a bright curtain, and the asphalt beyond is black and mirror-wet.

## Light
霓虹双色侧光 — A red neon sign at camera left lights the left side of her face and the silk, while green tube light from farther down the street edges her right cheek and shoulder, the two colors meeting along her nose.
彩色霓虹眼神光 — Thin red and green neon strips mirror as colored streaks in her irises.
雨夜 — Every sign and lamp wears a soft cold halo of mist, and the falling rain catches the neon as short bright streaks.

## Optics
Kodak Vision3 500T — Tungsten-balanced cinema negative color: red-orange highlights on skin and silk, shadows leaning teal-green, blacks pressed deep with only a little detail left in them.
抽帧 — The rain, the passing umbrellas and a cyclist behind her smear into stuttering ghost trails while she stays sharp, as if step-printed.
红色光晕 — Each bright neon tube blooms a soft red halation glow around its edges.
胶片颗粒 — Fine, even 35mm film grain sits across the whole frame, a little heavier in the shadows of the street.

## Camera
前景遮挡 — Shot from across the arcade with a passing black umbrella edge blurred across the lower right corner of the frame.
自然透视 — The camera stands back with a standard-to-moderate telephoto lens, so the face keeps natural perspective with no wide-angle stretch on the nose or forehead.
vertical frame — A vertical 3:4 frame from the top of her head to her waist, with her in the left third and the street glow filling the rest.

## Finish
港片剧照 — The whole frame reads as a still from a 1990s Hong Kong feature film, not a street snapshot or a fashion shoot.
超写实 — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the wool, real water on the tiles.
真人实拍 — A real person photographed on location, never an illustration, anime frame, 3D render or plastic-skinned CGI.
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

## Finish
photograph — The whole frame reads as a real clean product photograph.
photorealistic — Ultra-realistic 8K photographic detail: real amber glass, real brushed metal and real pits in the travertine.
real photograph — A real photograph of a real bottle on a real stone slab, never an illustration, 3D render or CGI.
```

단순 장면, 일본어 토큰(요청: 일본 시골집 툇마루에서 낮잠 자는 고양이 사진):
```text
A quiet natural-light photograph of a cat napping on the wooden veranda of an old Japanese country house in early summer.

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

## Finish
写真 — The whole frame reads as a real natural-light photograph.
高精細 — Ultra-realistic 8K photographic detail: real fur on the cat, real grain in the boards and real wear on the paper doors.
実写 — A real photograph of a real cat on a real veranda, never an illustration, 3D render or CGI.
```

## 11. 기존 프롬프트를 정제·교정할 때

기존 이미지 프롬프트 전체를 "정제·교정·퇴고·검토 및 개선·다듬어 줘"라고 하면, GPT Image 대상이거나 대상 엔진이 정해지지 않았을 때는 새로 쓸 때와 같은 모양(§1)과 언어(§2)로 옮겨 쓴다. 다른 엔진을 지정했으면 아래 다른 엔진 항목의 우선순위를 따른다. 영어 산문 문단을 그대로 두고 문장만 손보는 것은 정제가 아니다.

- 바꾸는 것: 모양과 말. 첫 줄 한 문장, `## 층`, 층 안은 `토큰 — 영어 문장`으로 나눈다(GPT Image 대상이거나 엔진 미정일 때).
- 바꾸지 않는 것: 원문이 말한 화면의 사실(자세, 의상, 소품, 빛, 색, 구도). 빼거나 바꾸거나 지어내지 않는다.
- 토큰은 §4 '토큰 찾기'대로 찾고 쓴다. 문장은 사전의 설명이 아니라 원문에 있는 그대로 쓰고, 맞는 말이 없으면 영어로 둔다.
- 다른 엔진(Midjourney·Higgsfield Soul·Flux·Grok 등)을 지정했으면 `## 층` 모양과 `토큰 — 영어 문장` 형식은 쓰지 않는다. 그 엔진 문서가 정한 형식(길이, 문장·요소 순서, 부정 표현, 옵션 표기 등)이 먼저다. 그 안에서 원어가 더 짧고 정확한 자리에만 원어를 쓰고, 원어 때문에 길어지거나 그 형식과 어긋나면 쓰지 않는다. 원문의 옵션·파라미터(`--ar`, `--s`, `--no` 등)는 지우거나 위치·형식을 바꾸거나 본문 문장으로 풀지 않고 그대로 둔다. 원어 혼용은 옵션 구간을 건드리지 않는다. 확인된 엔진 입력 제약은 [common.md](../templates/common.md) §프롬프트 언어 결정 3항대로 우선한다. 원문의 효과 장치(얼굴 잠금·체형 문장·금지 꼬리 등)를 엔진을 바꿔 옮길 때는 [engine-levers.md](engine-levers.md) §5와 [prompt-conversion.md](prompt-conversion.md) §2를 따른다.
- 일부만 바꿔 달라는 요청("조명만 저녁빛으로")은 §7을 따른다. 그 부분만 고치고 나머지는 원문 모양·언어 그대로 둔다.
- 사용자가 "그대로 줘"라고 했거나 언어·형식·정확 카피를 정했거나, 호출자가 고칠 범위를 한정했으면(예: "문장 내용은 바꾸지 말고 다섯 가지만") 그 지정이 먼저다.
- 원문에 `## Identity Reference` 층이나 그대로 두라고 한 구획이 있으면 글자 그대로 둔다. 인물이 나오는데 그 층이 없으면 §5의 조건문을 더하고, 조건절에는 원문이 말한 성별·나이만 반영한다(조건절은 화면 사실이 아니라 지어내기가 아니다). 원문에 없는 Outfit·Expression 같은 층은 채우지 않으며, §9-2의 기본 층 확인은 이 경우 Identity Reference 하나에만 적용한다.

전후 예시(Light 층 하나).

```
Before: Sunlight comes through the leaves and falls in small scattered spots on her face and shirt, with cool shade around.
After:
## Light
木漏れ日 — Sunlight filtered through leaves breaks into scattered soft-edged spots of light that shift over her face and shirt against cool shade.
```

## 12. 사진을 보고 프롬프트를 쓸 때

첨부한 사진을 보여 주며 "이 사진 프롬프트로 뽑아 줘", "똑같이 만들 프롬프트를 써 줘"라고 하는 요청이다. 목적은 그 프롬프트로 만든 이미지가 원본 사진의 느낌을 되살리는 것이다. 느낌은 사물의 목록보다 매체, 빛, 색보정이 만든다. 그래서 추출은 사진에 보이는 것을 그 룩의 이름으로 부르고, 그 룩이 정하는 매체·빛·색 반응을 함께 싣는 일이다. 모양(§1), 언어(§2), 층 고르기(§3), 토큰 찾기와 문장 쓰는 법(§4), 인물(§5), 화면 글자(§6)는 새 이미지와 같다. 다른 점은 아래와 같다.

- 새 이미지는 의도를 읽어 비워 둔 층을 지어 채운다. 추출은 사진에 보이는 것을 채우고(보이는 칸·흐린 칸·화면 밖은 §12.0), 그 이름은 룩 카드·사전·확실한 원어에서 먼저 찾는다(§12.2). 의도를 읽어 층을 지어 채우는 §4 '비워 둔 층'은 적용하지 않는다.
- 사진을 고치라는 요청은 §8, 사진 속 인물의 얼굴을 참조로 쓰라는 요청은 §5다. 이 절은 사진을 보고 그 사진을 다시 만들 새 프롬프트를 쓰는 경우다.
- 입력이 사용자가 만든 생성물이고 원래 프롬프트가 대화에 있으면 [from-image.md](from-image.md) §4.5가 먼저이고, 생성물의 깨진 글자·아티팩트는 from-image.md §4.2·§4.4를 따른다. 그 밖의 사진은 이 절이다.
- 다른 엔진을 지정했으면 이 절로 층 문안을 먼저 쓰고 [engine-levers.md](engine-levers.md) §4로 그 엔진에 편다. 사진 추출에만 있는 차이는 같은 문서 §4의 '사진 추출' 문단이다. 사용자가 참조 얼굴을 실제로 붙일 때만 §12.3의 Identity 문단이 그 문서 §5의 '얼굴 고정' 칸으로 바뀐다. 참조가 없으면 그 칸을 쓰지 않고 문화권 공식을 인물 문장으로 쓴다(같은 문서 §4). 그 표에 없는 엔진이면 그 엔진 문서의 형식이 먼저이고, §12.1 표의 층 이름은 읽을 항목의 묶음으로만 쓴다.

### 12.0 먼저 정한다: 매체와 룩

층을 쓰기 전에 매체와 룩부터 정한다. 매체와 빛, 색보정은 다시 뽑을 때 가장 먼저 어긋나는 것이고, 첫 줄과 Optics와 `## Finish`가 모두 매체에 묶인다.

**1. 매체.** 사진의 단서와 가장 많이 맞는 행을 고른다.

| 매체 | 보는 단서 | 첫 줄 매체 이름 |
|---|---|---|
| 영화 스틸 | 와이드 비율·레터박스, 텅스텐 색 쏠림, 할레이션, 로키, 움직임 잔상, 고른 입자 | `A <시대·장소> film still shot on <stock 계열>` |
| 35mm 필름 스냅 | 3:2, 입자, 하이라이트가 부드럽게 풀림, 가장자리 비네팅, 필름 특유의 피부색 | `A 35mm film snapshot` |
| 일회용·토이 카메라 | 강한 비네팅, 플래시 직광, 플라스틱 렌즈의 무름 | `A disposable-camera snapshot` |
| 콤팩트 디카(コンデジ·CCD) | 4:3, 깊은 심도(パンフォーカス), 하이라이트가 하드하게 날아감(白飛び), 약간 과한 샤프닝, 조금 높은 채도, 고운 디지털 노이즈 | `A compact digital camera snapshot` |
| 폰 카메라 | 4:3·16:9, HDR로 하늘이 살아 있음, 얼굴 스무딩, 인물 모드의 어색한 배경 흐림 경계 | `A smartphone photo` |
| 폰 셀카 | 팔 뻗은 근접, 광각 가장자리의 늘어남, 시선이 화면 쪽 | `A front-camera selfie` |
| 직광 플래시 스냅 | 평평하게 밝은 얼굴, 바로 뒤의 짧고 진한 그림자, 배경이 급히 어두워짐 | `A direct-flash snapshot` |
| 에디토리얼(DSLR·미러리스) | 얕은 심도와 크림 같은 보케, 계산된 조명, 3:2 | `An editorial portrait` |

- 비율은 파일 크기에서 잰다(2000×1497이면 4:3). 단서 둘 이상이 같은 매체를 가리키면 그 매체이고, 갈리면 심도와 하이라이트 처리로 정한다(필름은 풀리고 디지털은 끊긴다).
- 정한 매체는 세 곳에 같은 이름으로 쓴다. 첫 줄의 매체 이름, Optics(그 매체가 이 사진에 만든 결과: 하이라이트 처리, 색, 샤프닝, 입자·노이즈. 하늘이 날아갔으면 `白飛び` 같은 이름으로 범위와 함께 쓴다), `## Finish`의 closer.

**2. 룩 카드.**

1. 매체, 장소·시대 단서, 빛의 성격을 쉼표로 이어 `find_tokens`에 넣는다(`node scripts/find_tokens.mjs --q "コンデジ,商店街,逆光,日本"`). 결과 맨 위에 `## Look card`가 나오면 그 카드가 후보다.
2. 후보 카드를 `read:` 명령으로 읽고, 카드의 `고정 사실` 표와 사진을 맞춘다. 대조 항목은 `medium`, `time`, `light-key`, `palette`, `lens` 다섯이다. 셋 이상 맞으면 그 카드를 쓴다. 후보가 둘이면 맞는 항목이 많은 쪽, 같으면 `medium`이 맞는 쪽이다. `medium`이 사진과 다르면 셋이 맞아도 쓰지 않는다. 카드의 첫 줄·closer·Optics가 그 매체로 쓰여 있다.
3. 쓰기로 했으면 첫 줄 매체와 closer 토큰은 카드의 것을 쓰고(위 표의 첫 줄 문구와 카드의 첫 줄이 다르면 카드가 이긴다), 카드가 가진 이름(토큰)과 Optics·Style의 표현을 빌려 쓴다.
4. 카드 값과 사진 값이 다르면 화면에 보이는 칸은 사진이 이긴다(순서는 §4 '비워 둔 층'의 한 줄이다). 카드가 얕은 심도를 말해도 사진이 깊은 심도면 `パンフォーカス`다. 사진에 없는 소품·의상은 카드에서 들이지 않는다.
5. 맞는 항목이 둘 이하이거나 카드가 없으면 카드 없이 층 검색만 쓴다. 이때도 첫 줄은 위 표의 매체로 시작한다.

**3. 보이는 칸과 안 보이는 칸.**

- 화면에 보이는 칸은 사진이 정한다.
- 화면 밖(잘린 다리, 프레임 밖의 손)은 비운다. 카드나 고정 몫으로 채우면 프레이밍이 바뀐다. Camera에 어디서 잘렸는지만 쓴다.
- 화면 안에 있는데 판독이 흐린 칸(작게 잡힌 얼굴의 입술색, 배경 간판의 종류, 아주 작은 손톱)은 카드 값, 카드가 없으면 [fixed-lines.md](fixed-lines.md)의 고정 몫으로 채운다. 비워 두면 생성기가 무난한 값으로 채워 사진의 느낌이 빠지기 쉽다. 뒤판·안감·로고 글자·혼용률처럼 정체를 지어내야 하는 값은 이 경우에도 쓰지 않는다.

### 12.1 보는 순서

1. 주 피사체를 정한다. 얼굴에 초점이 맞고, 크게 잡히고, 구도 중심에 있는 사람이다. 헷갈리면 초점이 맞고 가장 큰 사람이다. 흐리거나 작거나 잘렸거나 뒷모습인 사람은 배경 인물이다.
   - 0명(정물·공간)이면 §3의 인물이 아닌 이미지 층을 고르고 `## Identity Reference`는 쓰지 않는다.
   - 1명이면 §5를 따른다.
   - 2명 이상이면 사용자가 얼굴 참조를 붙일 인물을 정했을 때만 그 인물에게 조건문을 쓰고 위치로 가리킨다(`the woman on frame left`). 정하지 않았으면 조건문 없이 모든 인물을 Hair and makeup·Expression·Outfit·Pose로 쓴다. 이 경우 §5의 Identity Reference 항상 두기와 §9-2·§9-6의 Identity Reference 확인은 적용하지 않는다.
   - 배경 인물은 Scene에 수, 위치, 흐린 정도, 걷는 방향, 대략의 옷 색만 쓴다.
   - 거울에 비친 모습은 사람 수에 세지 않는다. 한 사람과 그 반사상이 함께 보여도 1명이다. 반사 사진이라는 사실은 한 곳에만 쓴다. Pose에 `거울 셀카`·`ミラーセルフィー` 같은 거울 셀카 토큰을 쓰면 Camera에는 반사 사진이라는 말을 다시 쓰지 않고, 거울에 대해서는 테두리가 보이면 그 위치, 실물과 반사상이 함께 보이면 둘의 배치만 쓴다. 토큰을 쓰지 않으면 Camera에 `A mirror selfie; the mirror frame is out of shot`처럼 한 마디를 더한다. 어느 쪽이든 프레이밍·카메라 높이·초점은 평소대로 쓴다. 폰과 손의 위치는 Pose에만 쓰고, Props and nails에는 폰의 종류·색·케이스만 쓴다.
2. 아래 항목을 사진에서 읽는다. 읽히는 것을 해당 층에 쓴다(화면 안인데 판독이 흐린 칸은 §12.0). 읽은 것마다 이름을 붙이는 방법은 §12.2다.

| 읽을 것 | 쓸 층 | 볼 점 |
|---|---|---|
| 구도 | Camera | 앵글, 카메라 높이, 거리, 어디서 잘렸는지, 여백, 초점과 심도 |
| 장소 | Scene | 장소 종류, 바닥·벽 재료, 배경의 물건, 공간의 깊이 |
| 포즈·시선·손 | Pose, Expression | 몸통이 카메라에 정면인지 측면인지와 어느 쪽 어깨·등이 보이는지, 다리와 무릎이 화면 어느 쪽으로 뻗는지, 체중이 실린 곳, 손이 닿는 대상, 손에 든 물건의 높이, 몸에 닿는 자리, 얼굴·몸과의 상대 위치(`below the chin, not covering the face`), 몸과 고개의 각도, 시선이 닿는 곳 |
| 헤어·메이크업 | Hair and makeup | 길이, 가르마, 결, 머리 전체의 바탕색과 빛이 닿은 가닥의 색(따로 쓴다), 베이스 마감, 눈·볼·입술의 색과 마감 |
| 의상 | Outfit, Legwear | 아이템마다 실루엣, 소재, 색, 디테일, 착용 상태 |
| 소품 | Props and nails | 종류, 크기, 색, 손과의 관계 |
| 빛 | Light | 광원 방향, 크기, 하드·소프트, 그림자 모양과 가장자리, 하이라이트 자리 |
| 색보정·질감 | Optics, Style | 밝기 키, 대비와 블랙 포인트, 가장 밝은 곳이 날아간 범위와 그림자가 잠긴 범위, 화이트밸런스와 색 쏠림, 어두운 곳과 밝은 곳의 색, 채도, 지배색, 입자 |

- 좌우는 화면 기준(`frame left`)과 인물 기준(`her left hand`)을 구별해 쓴다. 거울에 비친 사진은 좌우를 화면 기준으로만 쓰고 인물 기준 좌우는 쓰지 않는다. Pose 예: `the phone is held at frame right below the chin, not covering the face, and her other hand rests at frame left on the hip`.
- 몸의 방향은 Pose의 첫 줄에 쓴다. 무릎이나 손 같은 부위의 위치만 쓰면 정면 자세로 그려진다(`seated side-on to the camera, knees pointing to frame left, the far shoulder and upper back visible at frame right`).
- 대비는 본 만큼만 쓴다. 날아간 곳과 잠긴 곳은 Optics 한 곳에만, 범위와 함께 쓴다(`small clipped highlights on the cheekbone and shoulder; shadows fall to near black inside the wardrobe`). 실제보다 넓게 쓰지 않고, 날아간 곳이나 잠긴 곳이 있으면 그 범위를 `soft`나 `medium` 같은 가운데 말로 누그러뜨리지 않는다. 광원의 하드·소프트는 Light에 본 대로 쓴다. 머리색도 빛이 닿은 가닥의 색을 머리 전체의 색으로 쓰지 않는다.
- 빛과 색보정은 사진을 다시 뽑을 때 가장 먼저 어긋나는 것이라 다른 층에 묻히면 안 된다. Light와 Optics를 각각 따로 층으로 쓰고, 지배색 팔레트는 Style에 쓴다.
- 읽는 근거가 흐릴 때의 출발점. 광원은 하이라이트가 있는 쪽이고 그림자가 떨어지는 쪽의 반대편이다. 그림자가 카메라 쪽으로 떨어지고 머리·어깨 가장자리에 빛 테가 있는데 얼굴이 고르게 밝으면 해는 인물 뒤쪽이고 얼굴은 바닥·하늘의 반사광이 밝힌 것이다(§12.9의 `逆光`). 카메라 높이는 수평선과 바닥 선이 화면 어디에 있는지로 본다. 색 쏠림은 흰 물체나 회색 면이 어느 쪽으로 기우는지로 본다. 블랙 포인트는 가장 어두운 면이 순검정인지 떠 있는지로 본다. 각도·밝기·색온도처럼 정도가 있는 값을 두 말 사이에서 못 고르겠으면 `slightly`, `about` 같은 정도 말로 가운데에 둔다. 색 이름·재질처럼 범주가 갈리는 값은 가운데 값을 만들지 않고 아래 상위어 규칙을 따른다. 색이나 재질을 확정할 수 없으면 확실한 범위까지의 상위어(`metallic`)를 쓰고, 그보다 좁은 값(`gold`, `silver`)을 고르는 것은 추측이라 쓰지 않는다. 화면 밖·판독이 흐린 칸은 §12.0, 근거가 약한 빼지 않는 층은 §12.2다.

### 12.2 이름 붙이기와 쓰는 법

이름을 먼저 붙이고 문장을 쓴다. 느낌은 이름에서 오고, 이름 없이 영어로 풀어 쓰면 생성기가 무난한 쪽으로 읽는다.

1. **이름 목록부터.** 관찰을 끝내면 문장을 쓰기 전에, 보이는 것의 이름을 층별로 적어 둔다. 이름은 사진의 문화권 말로 부른다(일본 거리면 일본어, 한국 거리면 한국어). 목록을 쉼표로 이어 한 번에 검색한다. 예: `node scripts/find_tokens.mjs --q "商店街,電柱,通行人,黒髪ロング,白シャツ,スマホ,逆光,白飛び,パンフォーカス" --culture JP`. 문화권은 KR CN JP US FR 중에서 고른다.
2. **찾는 순서.** 룩 카드의 줄, 사전의 행, 그 문화권에서 그 뜻으로 확실히 쓰는 말(§2가 허용한다), 영어 순이다. 사전에 아직 없어도 그 뜻으로 확실히 쓰는 말이면 쓴다(일본 거리의 `日除け`).
3. **층·범주 이름은 토큰이 아니다**(§4 '토큰 찾기' 2항, 슬롯 토큰 예외도 그 항). `passersby`, `road surface` 같은 칸 이름은 검사기 `token/slot-name`이 경고한다.

   | 층·범주 이름이라 나쁜 토큰 | 그 대상의 이름 |
   |---|---|
   | `hair color` | `黒髪ロング` |
   | `outfit` | `白シャツ`, `ニットベスト` |
   | `passersby` | `通行人` |
   | `road surface` | `マンホール` |
   | `lighting` | `逆光` |
   | `background` | `商店街` |

   영어로 쓸 때도 `cast shadows`, `wind-blown strands`처럼 그 대상의 이름을 쓴다.
4. **문장 안에도 원어 명사를 섞는다.** 문장은 영어 뼈대로 쓰되, 이름이 따로 있는 사물이 나오면 그 원어 명사를 그대로 둔다. 한 문장에 둘까지, 풀이는 덧붙이지 않는다. 예(§12.9 본보기에서): `Concrete poles line the right side and recede down the street, with 電線 cables criss-crossing the white sky between them.` `A narrow street of small two- and three-story shops recedes behind her, with a yellow 日除け awning at left …` `… a person in a dark hoodie rides a ママチャリ left of center …`

문장은 이렇게 쓴다.

- 사진에 없는 소품·배경·장식은 더하지 않는다. 예외는 §12.3의 고정 몫(매체가 사진이면 Finish 세 줄, 몸이 보이는 성인이면 비율 문장)과, 판독이 흐린 칸의 카드·고정 몫 값(§12.0)이다. 잘린 발, 가려진 손, 보이지 않는 뒷면은 지어내지 않고 Camera의 프레이밍으로만 쓴다.
- 읽히는 것이 한 줄뿐이면 그 층은 한 줄로 둔다(§1의 2줄 규칙보다 이 줄이 먼저다). 사진에서 안 보이는 부위의 층은 §3대로 뺀다. §3에서 빼지 않는 층(Style·Light·Optics·Camera·Pose)은 근거가 약해도 가장 확실한 한 줄을 `slightly`, `about` 같은 정도 말로 둔다.
- 분위기·태도 같은 해석어는 같은 줄 문장에서 보이는 근거로 받친다. 근거를 못 대면 쓰지 않는다.
- 정도를 붙인다(`slightly`, `half`, `about 45 degrees`). 계절·날씨는 낙엽, 젖은 노면, 옷차림 같은 단서가 있을 때만 쓴다.
- 길이는 §1의 상한 안이다. 넘으면 같은 말 반복부터 지우고, 보이는 것을 지워서 맞추지 않는다.

### 12.3 인물

- 사진 속 인물의 얼굴 생김새(이목구비, 얼굴형, 점, 피부 톤)는 옮기지 않는다. `## Identity Reference`는 §5의 조건문 문안 그대로 쓰고, `If none is provided,` 뒤에는 [fixed-lines.md](fixed-lines.md)의 문화권 공식을 쓴다. 문화권은 사진 속 사람의 얼굴이 아니라 장소·간판·글자 같은 장면 단서로 정한다. 단서가 없으면 그 표의 '한·중·일 단서도 없음' 행이다. 체형은 문단 끝의 비율 문장 한 곳에만 쓴다.
- 사진에서 보이는 성별과 대략의 나이대(성인/아이)는 §5에서 사용자가 준 값처럼 다뤄 그 값만 바꾼다. 아이·학생으로 보이고(판정은 §5의 기준) 완성 문단이 없으면 [fixed-lines.md](fixed-lines.md) 'Identity Reference'의 아이·학생 처리를 쓴다(숫자 없는 `a child`·`a student`, 비율 문장과 미화 줄을 끈다). 이 인물은 §9-2가 말하는 내가 지은 인물(20세 이상 나이 확인)에 해당하지 않으며, 조건절의 나이를 성인으로 바꾸지 않는다. 호출자·사용자가 완성 문단을 줬으면 §5의 그 예외가 먼저이므로 사진의 나이대로 고치지 않는다.
- 헤어·메이크업·표정·포즈는 층으로 자세히 쓴다. 피부는 메이크업 마감과 보정 수준만 쓴다.
- 붙는 고정 몫은 fixed-lines.md '입력 용도별로 붙는 것'의 사진 추출 두 열이 정한다. 참조 없이 쓰는 추출은 누가 붙여 넣어도 그 사진의 느낌이 나와야 하므로 문화권 공식이 조건절에 들어가고, 참조 얼굴로 재현하는 추출은 같은 문단을 쓰되 얼굴과 피부색은 참조가 정한다. 눈이 맨눈으로 보이면 `eyes left almost bare`처럼 쓴다.
- 사진 속 인물이 아이·학생으로 보이면 §6의 두 지킴을 그대로 따른다.

### 12.4 사진에 찍힌 표식

- 사진 속 로고, 브랜드 마크, 브랜드 글자, 워터마크, 잡지 제호는 옮겨 적지 않는다. 그 자리는 무지 표면으로 쓰고 위치·재료·색은 그대로 쓴다(`a plain unmarked chest area`). 작거나 일부만 보여도, 브랜드 글자인지 애매해도 같다. 상표 글자는 생성기가 깨뜨려 그리기 쉽고 그러면 느낌이 더 크게 깨진다. 색 띠·위치·재료를 남겨 같은 인상을 준다(본보기의 편의점 간판).
- 이것은 사진에 찍힌 표식을 화면에 다시 그리지 않는다는 것만 정한다. §6이 허용하는, 룩을 가리키는 브랜드명 토큰(카메라, 필름 이름 등)은 그대로 쓸 수 있다. 앞의 것은 화면에 그리는 일이고 뒤의 것은 룩을 부르는 말이다.
- 사진 속 물건의 브랜드 고유 기능명·부품명(예: 폰 뒷면의 자석 링을 부르는 상표 기능명)은 화면에 그리는 물건을 가리키므로 일반 명칭으로 쓴다(`a magnetic ring on the phone back`).
- 브랜드와 무관한 일반 글자로 읽은 것은 §6 첫째 줄의 사용자가 준 문구로 본다(§6 둘째 줄보다 이 줄이 먼저다). 원문 그대로 따옴표에 넣고 위치, 크기, 서체, 한 번만 나온다는 것을 쓴다. 읽을 수 없는 글자가 함께 있으면 "다른 글자가 없다"는 문장 대신 그 글자의 위치와 판독 불가 상태(`small illegible lettering`)를 쓴다.

### 12.5 변경 요청이 함께 올 때

"뽑아 줘, 배경만 흰색으로"처럼 바꿀 것이 붙으면 그 요소만 새로 쓰고 나머지는 사진대로 쓴다. 바뀐 요소를 원래 모습처럼 풀어 쓰지 않는다. 그 변경이 만드는 물리 결과(흰 배경이면 반사광이 밝아지고 그림자가 옅어진다)는 Light와 Optics에 반영한다. 말하지 않은 요소는 바꾸지 않는다. 이 경우도 새 프롬프트이므로 §8의 `Edit the attached photo` 모양은 쓰지 않는다.

### 12.6 여러 장을 한 번에

- 한 장에 코드블록 하나, 첨부 순서대로 쓴다.
- 같은 촬영 세트면 첫 줄과 사진마다 다른 층(Expression, Pose, Props and nails, Camera)만 다르게 쓰고, 나머지 층(Identity Reference, Hair and makeup, Outfit, Style, Scene, Light, Optics, Finish)은 블록마다 글자 그대로 같은 문장을 쓴다. 세트 안에서 고정 층 가운데 어느 것이든 사진에서 실제로 달라졌으면 그 층만 바꾼다.
- 서로 무관한 사진이면 각자 독립으로 쓴다.

### 12.7 내기 전에 확인

§9 머리말보다 이 줄이 먼저다. §9의 1~8·10·11을 본다(2와 6은 §12.1의 다인 예외를 따르고, 9는 후속 수정용이라 보지 않는다). 더해서 본다. 첫 줄이 §12.0 표의 매체 이름으로 시작하는가? 토큰 자리에 칸 이름(`hair color`, `passersby`, `road surface`)이 없고 원어로 부를 수 있는 것은 원어로 불렀는가? 판독이 흐린 칸을 비워 두지 않았는가? 화면 밖을 채우지 않았는가? 사진에 없는 소품·배경을 더하지 않았는가? 정체를 지어내야 하는 값(뒤판, 로고 글자)을 쓰지 않았는가? 로고·브랜드 글자·워터마크를 옮겨 적지 않았는가? Light와 Optics가 따로 있고 각각 방향·결과를 말하는가? 인물의 얼굴·체형을 조건절 밖에 쓰지 않았는가?

### 12.8 재현 확인: 어긋나면 무엇부터 보나

추출본으로 만든 이미지가 원본과 다르면 이 순서로 하나씩 본다. 앞의 것이 맞기 전에는 뒤를 고치지 않는다.

1. 빛: 광원 방향, 역광 여부, 하늘·하이라이트가 날아간 범위
2. 색보정: 화이트밸런스, 채도, 대비, 검정의 깊이
3. 매체: 심도, 샤프닝, 입자·노이즈(디카가 필름처럼, 필름이 폰처럼 나오지 않았나)
4. 구도: 프레이밍, 카메라 높이, 피사체 위치
5. 장소의 큰 요소: 간판 줄무늬, 차양 색, 전봇대
6. 자세·소품
7. 헤어·메이크업·의상 세부

고칠 때는 어긋난 층 하나만 다시 쓰고 나머지는 글자 그대로 둔다(§7). 가로 400px 썸네일에서 보이지 않는 차이는 고치지 않는다. 머리색의 미세한 차이, 손에 든 물건의 높이, 행인의 위치, 머리 가닥 수는 모델의 한계로 보고 문장을 더 붙여 쫓지 않는다. 같은 문안으로 다시 뽑아 고른다.

### 12.9 본보기: 일본 상점가 낮 스냅 (카드를 맞춰 쓴 판)

4:3 비율, 깊은 심도, 하얗게 날아간 하늘, 선명한 디지털 엣지가 보이는 사진이다. 아래는 §12.0~12.3을 차례로 따라, 맞는 룩 카드를 붙여 쓴 결과다. 읽는 순서만 따르고 장면, 문장, 층 이름을 다른 사진에 옮기지 않는다.

- 매체: 4:3, 깊은 심도, 하늘의 白飛び, 선명한 엣지가 모두 콤팩트 디카를 가리킨다. 첫 줄과 Optics와 Finish가 이 매체를 부른다.
- 룩 카드: `find_tokens --q "コンデジ,商店街,逆光,日本"`의 맨 위에 `日系CCD日光 · コンデジ`가 떴다. §12.0의 다섯 항목 대조가 모두 맞았다: medium은 소형 센서 콤팩트 스냅, time은 해가 하늘에 있는 낮, light-key는 직사 역광과 그늘, palette는 채도 높은 색과 순백의 하늘, lens는 깊은 심도다. 갈래는 A 商店街スナップ로 읽었다. 카드에서 가져온 것: 첫 줄 문구, closer `コンデジ`, realism 자리의 `native resolution` 줄(`8K`와 모공 줄은 쓰지 않는다), 입자 `デジタルノイズ`, 끈 `lens` 몫(Optics의 `コンデジ`가 렌즈를 말한다), JP 문화권의 Finish 토큰(`実写`). 카드의 장면 세트와 쌍은 이 사진과 맞지 않아 쓰지 않았고, 보이는 칸은 모두 사진 값이다.
- 이름 목록: 商店街, コンビニ, 電柱, 通行人, マンホール, 落ち葉, 黒髪ロング, ほつれ毛, 素肌感, 白シャツ, ベスト, ショルダーバッグ, スマホ, 素爪, カメラ目線, 半開き唇, 立ち止まり, 逆光, 影, コンデジ, 白飛び, 黒つぶれ, パンフォーカス, 日常スナップ를 일본어로 먼저 적고 층별로 검색했다. 사전에 있는 것은 그 표기로, 없는 것은 확실한 일본어라 그대로 썼다.
- 사람은 젊은 성인으로 읽혀 기본 성인 공식을 썼다. 흰 셔츠와 검은 베스트, 숄더백은 교복풍으로 읽힐 수 있지만 학교 표식과 학교 장소가 없어 `制服` 같은 말은 쓰지 않았다. 사진 속 인물이 학생으로 보이면 §12.3의 학생 처리로 바꾼다. 편의점 로고는 색 띠만 남겼고 얼굴 생김새는 옮기지 않았다. 좌우는 헷갈리는 곳만 화면 기준으로 썼다.

```text
A Japanese everyday compact digital camera snapshot shot on a small-sensor CCD compact: a woman with long wind-tossed dark hair stands stopped on a sunlit shopping street, a silver phone held low in both hands, her eyes meeting the lens while the sky behind her clips to white.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old Japanese woman with a soft 透明感 look: a small face, gentle features and clear, fair skin. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.

## Hair and makeup
黒髪ロング — Long dark hair, black with a brown cast, falls well past the chest in loose layers with a soft center part, and turns lighter brown wherever the sun passes through its edges.
ほつれ毛 — Fine flyaway strands lift sideways at frame left of her face and drift across her cheek, while a longer lock swings off her shoulder at frame right.
素肌感 — A sheer, natural base that leaves the skin looking bare and evenly bright, with the eyes left almost unmade and only a thin soft pink tint on the lips.

## Expression
カメラ目線 — Her dark eyes look straight into the lens under level lids and level brows, calm and slightly wary, as if she glanced up from her phone just as the shutter went.
半開き唇 — The lips part by a thin gap with the jaw relaxed and no smile, and the chin dips very slightly toward the lens.

## Outfit
白シャツ — A white cotton shirt with an open collar and long sleeves, the sunlit sleeve and shoulder nearly clipping to white while the folds in shade stay pale blue-gray.
ベスト — A black sleeveless V-neck vest over the shirt, smooth and matte, its plain unmarked front sinking to flat black in shade.
ショルダーバッグ — A black boxy bag hangs at her hip from a long strap over her shoulder at frame right, with a zip pocket on its front, a small metal buckle and one soft highlight along its top edge.

## Props and nails
スマホ — A silver smartphone with rounded edges is held low in both hands at frame left, tilted so its glossy back and metal rim face the camera and catch one small hard sun glint.
素爪 — Short natural nails with a faint pink tone and no polish.

## Pose
立ち止まり — She stands still in the street with her torso angled about 30 degrees toward frame left and her shoulders nearly level, her head turned back toward the lens.
両手持ち — Both elbows stay bent close to her ribs and both hands hold the phone at waist-to-chest height at frame left, well below the chin and clear of her face.

## Style
日常スナップ — An everyday snapshot of an ordinary person caught between errands, in plain clothes and an unposed stance.
palette — White shirt, black vest and bag, gray asphalt, yellow and green awnings, an orange, green and red striped sign and a sky washed out to white.

## Scene
商店街 — A narrow street of small two- and three-story shops recedes behind her, with a yellow 日除け awning at left, green awnings on both sides, shuttered fronts at frame right and a parked bicycle with a basket beside an outdoor air-conditioner unit.
コンビニ — A convenience store at upper left has a sign reduced to bands of orange, green and red with no readable mark or lettering.
電柱 — Concrete poles line the right side and recede down the street, with 電線 cables criss-crossing the white sky between them.
通行人 — About eight small, sharp pedestrians in dark jackets walk the street and the sidewalks, several carrying white plastic bags or backpacks, a person in a dark hoodie rides a ママチャリ left of center, and a silver minivan comes up the far end of the street.
マンホール — A round iron manhole cover sits in the gray asphalt at lower left beside diagonal white lane lines and a strip of green paint at the far left edge.
落ち葉 — A few brown maple leaves lie on the paving stones at lower right beside her bag, the only sign of the season.

## Light
逆光 — The sun stands high behind her toward frame right, rimming her hair and the shoulders of her white shirt with a bright edge while her face stays in soft open shade, lit by the pavement and the sky.
影 — The buildings at right throw a wide dark shadow across the sidewalk, and the pedestrians and the cyclist cast short hard-edged shadows toward the camera and frame left.
catchlight — A faint small bright point from the open sky sits in each eye.

## Optics
コンデジ — A pocket compact with a tiny CCD sensor: sharp from front to back, slightly strong sharpening and slightly oversaturated yellow and green awnings under clean daylight white balance.
白飛び — The sky above the roofs and the sunlit edge of her shirt sleeve clip to flat white with no detail left in them.
黒つぶれ — The black vest and bag sink to near-flat black with almost no fold detail.
デジタルノイズ — Very fine digital noise sits only in the darkest shop interiors and under the awnings.

## Camera
パンフォーカス — Everything from her hands to the car at the far end of the street stays in focus, with no background blur.
horizontal frame — A horizontal 4:3 frame cut at her hips, her face on the vertical center line and the shoulder and bag filling the right half while the street recedes through the left, shot at about her eye level from roughly 1.5 meters with a slightly wide lens.

## Finish
コンデジ — The whole frame reads as an everyday compact digital camera snapshot, not a fashion shoot.
native resolution — The frame holds the resolution of a small-sensor CCD compact and no more: crisp but over-sharpened edges, clipped highlights and skin that shows no individual pores.
実写 — A real person photographed on location, never an illustration, anime frame, 3D render or plastic-skinned CGI.
```
