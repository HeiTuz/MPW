# 엔진별 효과 장치: 층 문안을 엔진에 맞게 펴는 표

같은 장면을 GPT Image·Seedream·Nano Banana·Midjourney·Soul 2 어느 쪽으로 써도 같은 느낌(매체, 얼굴, 몸 비율, 입자, 실사감)이 나오게 하는 표다. 엔진마다 그 효과를 내는 문구와 자리가 다르다. 이 파일은 그 문구·자리·근거 등급만 정한다. 비율·해상도·품질 같은 호출 설정과 엔진 문법의 세부는 각 엔진 문서와 [surfaces.md](surfaces.md)가 정본이고, 여기서 다시 정의하지 않는다.

다음 두 경우에 읽는다.

- 다른 엔진을 지정한 새 이미지. 먼저 GPT Image 층 문안으로 쓰고(§1) 그 엔진에 편다(§4).
- 기존 프롬프트를 다른 엔진으로 바꾸는 변환. 원문에서 효과 장치를 찾아(§6) 이름으로 되돌리고 대상 칸으로 다시 쓴다(§4, §5).

## 1. 먼저 층 문안을 쓴다

다른 엔진을 지정한 새 이미지도 처음에는 GPT Image 모양의 층 문안으로 쓴다. 룩 카드·고정 몫·첫 줄·Finish가 모두 그 모양으로 정의돼 있어서다([image-brief.md](image-brief.md) §1~§4, [fixed-lines.md](fixed-lines.md), 카드가 있으면 `looks/<slug>.md`). 층 문안을 다 쓴 다음에 이 파일로 엔진에 맞게 옮긴다. 층 문안을 건너뛰고 처음부터 엔진 문법으로 쓰면 카드와 고정 몫이 붙을 자리가 없다.

## 2. 근거 등급

표의 칸마다 끝에 등급이 붙는다. 칸의 문구가 어디서 왔고 효과가 어디까지 확인됐는지 가리킨다.

| 등급 | 뜻 |
|---|---|
| `[실측]` | 이 레포가 생성해서 잰 결과다. Soul 2는 [soul-v2-director.md](soul-v2-director.md)의 유료 스모크 라운드를 쓴다(2026-07 실측) |
| `[공식]` | 엔진 공식 문서가 권하는 방식이다. 근거와 확인일은 [surface-evidence.md](surface-evidence.md) §7에 있다(Seedream 5 Pro 2026-08-02 확인, Nano Banana 2026-10-02 확인) |
| `[Iris]` | Iris 저자가 프리셋과 README에서 쓰고 효과가 있다고 주장한 문구다. 생성으로 확인된 적 없다 |
| `[문서]` | 그 엔진의 MPW 문서가 정한 문법이다. 값과 근거는 그 문서에 있다 |
| `[미검증]` | 칸을 채우려고 정한 문구다. 근거가 없다 |

`[Iris]`와 `[미검증]` 칸은 틀릴 수 있다. 그래도 쓰는 이유는, 비워 두면 그 효과가 엔진 기본값에 맡겨지기 때문이다. 생성으로 쌍 비교를 한 뒤 등급을 바꾼다(§7).

## 3. 층 → 엔진 배열표

층 문안의 문장을 이 표의 순서로 이어 붙여 그 엔진의 형식을 만든다. 이어 붙일 때 원어는 이 규칙을 따른다(이 문단은 엔진 형식으로 펼 때 원어를 남기는 규칙의 정본이다. 원어의 자리·양·이름은 [image-brief.md](image-brief.md) §2.1이 정본이고, 다른 문서는 이 둘을 가리킨다).

- **펴는 것은 모양이지 원어가 아니다.** 층 헤더(`## 층`)와 `토큰 — ` 줄 머리를 없애고 문장으로 잇는 것이 '펴기'다. 원어를 영어로 번역하는 일이 아니다. 영어 문장 뼈대는 그대로 두고, [image-brief.md](image-brief.md) §2.1이 정한 원어(문화에 속한 것의 이름, 사전 토큰, 표정의 기색 낱말, 사진 용어, 질감·빛 낱말)를 그 문장 안에 그대로 둔다. §5 장치 칸의 문구는 칸에 적힌 그대로 쓴다.
- **머리를 떼면 토큰은 문장 안의 이름이 된다.** `正红唇 — A matte…` 줄은 `…a matte 正红唇…`처럼 그 문장의 명사구 안에서 원어로 부르고, 영어 이름으로 바꾸지 않는다. 한 물건은 한 이름이다(§2.1 3항).
- **형식과 길이가 먼저이고 내용은 줄이지 않는다.** 한 문단, 순서, 길이 상한, 부정 표현 자리는 엔진 행이 이긴다. 원어 낱말도 단어로 센다. 길이가 넘으면 원어가 아니라 일반 묘사의 둘째 문장부터 줄이고(줄이는 순서는 행의 마지막 칸), 미화·메이크업·실사·금지 문장은 빼지 않는다.
- **예외는 근거가 적힌 엔진뿐이다.** 그 엔진이 원어를 못 읽는다는 근거가 문서에 있을 때만 행의 '원어' 칸이 따로 정하고, 칸에 그 근거를 적는다. 근거 없이 `[문서]`·`[미검증]`이라는 이유로 원어를 영어로 풀지 않는다. 풀어야 하는 엔진에서는 사전 행의 모습 칸·영어 별칭, [fixed-lines.md](fixed-lines.md) §문장 속 낱말의 '뜻' 칸, §4의 Identity 낱말 꼴에서 가져오고 새로 번역하지 않는다.

문장은 장면 사실이라 그대로 가져온다.

| 엔진·표면 | 형식 | 펴는 순서 | 설정으로 빠지는 것 | 원어 | 길이·줄이는 순서 |
|---|---|---|---|---|---|
| GPT Image 웹 | 첫 줄 + `## 층` | 그대로 | 없음(비율은 Camera 줄) | 그대로 | 10,000자. image-brief §1 순서 |
| GPT Image API | 같음 | 그대로 | `size`, `quality` | 그대로 | 32,000자 |
| Seedream ModelArk(영어) | 한 문단 | 매체 문장, 참조 역할, 몸 비율 문장, 장소와 자세, 소품과 시선, 헤어·메이크업, 의상·레그웨어, 배경과 글자 상태, 빛, Optics, 입자, Camera, 실사 문장, 끝 문장(매체와 금지) | `size`, 출력 형식 | 위 규칙대로 영어 문장 안에 남긴다. 영어 600단어 상한은 길이 권장이고(§5 '언어') 원어를 막는 근거가 아니다. 영어 토큰과 `Black Pro-Mist` 같은 필터·렌즈 상표도 그대로 둔다 | 영어 600단어 미만. 줄이는 순서: 고정 메이크업 줄의 수식어, 배경 인물·소품의 둘째 묘사, 층별 둘째 문장. 룩을 정하는 Optics·Light의 사실과 사용자가 말한 소품은 끝까지 남긴다 |
| Seedream 豆包·即梦 | 중문 한 문단 | 위와 같음 | UI의 비율 | 중문 토큰과 CN 칸 낱말은 문장의 말이고, KR·JP 원어도 위 규칙대로 그 글자로 남긴다(§5.1 '언어'). 장치 문구는 §5.1 | 표면 상한은 미확인 |
| Nano Banana | 서술 문장 몇 개 | 동사 작업 문장(매체), 참조 역할, 용도 한 줄, 배경(Scene), 중간(Light), 전경 인물(Pose, Outfit, Hair and makeup, Expression, Props), 촬영 용어(Camera, Optics, 필름), 실사 | 비율, 해상도 | 짧은 원어 낱말과 한국어 표정 구절은 남길 수 있다. 근거가 있는 예외다: 권장 언어 목록 밖 언어는 결과가 떨어질 수 있다([nano-banana.md](nano-banana.md) 한계) | 용도와 배경 문장부터 줄인다 |
| Midjourney | 짧은 서술 + 파라미터 | 매체, 피사체와 행동, 의상, 장소와 빛, 색·필름, 파라미터(`--ar` `--oref` `--no` `--raw`) | 파라미터 | 위 규칙대로 짧은 원어 이름을 구절 안에 남긴다(구절은 영어 뼈대) | 층마다 한 구절, 룩을 정하는 층(Optics·Light)만 두 구절. 단어 수 경계는 없다([surfaces.md](surfaces.md) §0-1) |
| Soul 2 | 용어 스택 | 구도 관용어, 피사체, 의상, 장소, 빛 관용어, 발색 | `soul_id`, 비율 | 위 규칙대로 짧은 원어 이름을 용어 안에 남긴다(용어 스택은 영어 뼈대) | 금지 문장 없음 |

- 요청이 "Seedream"이라고만 하면 `Seedream ModelArk(영어)` 행이 기본이다(영어 한 문단, 비율은 `size`). 가정한 표면은 블록 밖에 한 줄로 밝힌다. Seedream 5.5를 지정했을 때도 이 행을 쓴다([seedream-5-5.md](seedream-5-5.md)도 층 문안을 이 표로 펴라고 한다). 이 행이 이 레포의 Seedream 문서가 다루는 표면이다(BytePlus ModelArk direct, 영어 문안). Higgsfield `seedream_v5_pro`는 별도 표면이라 문장 형식만 이 행을 쓰고 모델 id·파라미터는 런타임 정의로 확인한다([seedream-5-pro.md](seedream-5-pro.md) 적용 경계). `Seedream 豆包·即梦` 행은 이 레포에 표면 문서가 없는 중국 표면이라 중문 한 문단 형식이 `[Iris]` 수준이고 영어 600단어 기준을 적용하지 않는다. 그 행의 장치 문구는 §5의 영어 칸이 아니라 §5.1의 중문 칸을 쓴다. 5.5에서 그 칸의 효과는 확인되지 않았다.
- Soul 2는 Higgsfield의 `soul_2`다. 모델 id가 요청에 이미 있으면 그 id가 라우팅이고, 이 표는 문장 쪽만 맡는다([model-routing.md](model-routing.md) §4).
- 이 표에 없는 엔진(Flux·Grok Imagine·Higgsfield의 다른 모델 등)은 그 엔진 문서의 형식이 먼저이고, §5의 칸을 가까운 열에서 빌려 쓰지 않는다. 층 문안의 Finish 세 줄과 Identity 조건문(문화권 공식 포함)은 빼지 않고 그 엔진 문서의 형식 안에서 자연어 문장으로 남긴다.
- 엔진 문서가 정한 문법(Midjourney 파라미터 표기, Soul의 구도 자리, Nano Banana의 참조 슬롯)은 이 표보다 그 문서가 먼저다.

## 4. 두 단계로 옮긴다

1. **펴기.** §3의 그 엔진 행 순서대로 층 문안의 문장을 이어 붙인다. 원어는 §3 규칙대로 남긴다(그 행의 '원어' 칸이 예외를 정했으면 그 칸). '설정으로 빠지는 것'은 본문에서 지우고 블록 밖에 설정으로 적는다. `토큰 — ` 머리는 떼고 그 토큰을 문장 안 이름으로 옮긴다(Midjourney·Soul은 문장을 구절로 줄인다).
2. **장치 붙이기.** §5의 효과 표를 위에서 아래로 내려가며 줄마다 묻는다. 이 장면에 이 효과가 있나(인물이 있다, 필름 매체다, 사진 매체다)? 있으면 대상 엔진 칸의 문구를 칸이 정한 자리에 넣는다. 단 몸 비율은 원문에 비율 문장(`In either case…`)이 있을 때만 붙인다. 아이·학생이거나 카드·사용자가 끈 문단에서 빠진 문장은 사람이 있다는 이유로 되살리지 않는다. 칸이 '쓰지 않는다'이면 층 문안에 있던 해당 줄을 뺀다(Soul의 anti-cg 줄). 층 문안에서 이미 같은 효과를 낸 줄(Finish의 closer·realism·anti-cg, 문화권 공식의 비율 문장)은 그 칸의 문구로 바꾸고 둘을 겹쳐 쓰지 않는다.
3. **대조.** 층 문안의 장면 사실(의상, 소품, 장소, 빛, 자세, 시선)이 하나도 빠지지 않았는지 본다. 장치가 장면 사실과 부딪히면 장면 사실이 이긴다. 대체값으로 바꾸지 않는다. 그 뒤 `node scripts/check_prompt.mjs --engine <대상> --source <층 문안 파일>`을 돌린다. `--source`는 원어 이름이 펴기에서 남았는지 본다([production.md](production.md)).

**참조가 없을 때.** '얼굴 고정' 칸은 사용자가 참조 얼굴을 실제로 붙일 때만 쓴다. 참조가 없으면 그 칸을 쓰지 않고 층 문안의 Identity 조건문 `If none is provided,` 뒤 인물(문화권 공식)을 인물 문장으로 쓴다. 공식의 원어는 §3 규칙대로 남긴다. Seedream은 매체 문장 바로 뒤 둘째 문장으로 쓴다(`She is a 22-year-old Chinese woman with 清冷 bone structure: a 巴掌脸, a straight 鼻梁, a clean 下颌线 and 冷白皮.`). Midjourney는 `a woman`처럼 성별·나이대 구절만 쓰고 얼굴 서술은 [midjourney-identity.md](../midjourney-identity.md) §8대로 요청이나 오류 교정에 필요할 때만 구절로 줄여 넣는다. Nano Banana는 인물 문장 안에, Soul은 피사체 항에 성별·나이·문화권 구절(`a 22-year-old Chinese woman`)로 줄여 넣는다. '원어' 칸이 원어를 못 남기는 엔진(근거가 적힌 엔진뿐)에서는 공식의 원어를 이 꼴로 푼다: `얼굴형`·`脸型`·`輪郭` face shape, `이목구비`·`五官`·`顔立ち` facial features, `小脸`·`작은 얼굴`·`小顔`·`巴掌脸` a small face, `오똑한 콧대` a defined nose bridge, `鼻梁` nose bridge, `턱선`·`下颌线` jawline, `맑고 흰 피부`·`色白の肌` clear, fair skin, `쿨톤` cool-toned, `순한 이목구비` soft, low-contrast features, `やさしい顔立ち` gentle features, `清冷` cool, composed, `冷白皮` cool fair skin, `7.5등신`·`7.5頭身` 7.5-head proportions, `小头` a small head, `直角肩`·`직각 어깨` level shoulders, `天鹅颈`·`목선` a long neck / neckline.

변환(기존 프롬프트를 다른 엔진으로)은 1단계 앞에 원문의 효과 장치를 이름으로 되돌리는 일이 붙고, 2단계에서 붙이는 장치는 원문이 노린 효과만이다([prompt-conversion.md](prompt-conversion.md) §2, 이 파일 §6).

**원문이 층 문안이 아닐 때.** 문단형이거나 다른 엔진 형식의 원문은 층 문안을 먼저 새로 만들지 않고, 원문 문장을 §3의 그 엔진 행 순서로 바로 펴며 원문의 효과 장치만 §6의 단서대로 이름으로 되돌려 대상 칸으로 바꾼다. 원문이 층 문안(`## 층`, `토큰 — 문장`)이면 줄을 그대로 이어 붙인다. 대상이 GPT Image면 `node scripts/read_refs.mjs references/image/image-brief.md#1,3`의 층 모양(첫 줄 + `## 층`)으로 옮기고, 원문에 실사·금지 꼬리 같은 단서(§6)가 있을 때만 그 효과를 `## Finish`의 `closer`·`realism`·`anti-cg` 줄([fixed-lines.md](fixed-lines.md))로 옮긴다. 단서가 없으면 Finish를 새로 붙이지 않는다.

**사진 추출**도 층 문안을 먼저 쓰고([image-brief.md](image-brief.md) §12) 위 순서(펴기, 장치 붙이기, 대조)로 편다. 장치의 근거는 원문 단서(§6)가 아니라 사진에서 읽은 것이다. 효과마다 사진이 그 자리에 무엇을 보였는지를 묻는다.

- 매체 고정·애니·CG 방지: 매체 판별이 사진이면 붙인다. 매체 이름은 image-brief §12.0의 것이다.
- 필름·입자, 렌즈 왜곡, 화면비: 사진에서 잰 값대로 쓴다. 입자는 보이는 양만 쓰고 안 보이면 칸을 비운다. 광각·셀카 사진이면 렌즈 왜곡 칸을 쓰지 않는다. 화면비는 사진의 비율을 대상 엔진의 설정으로 넘긴다(ModelArk `size`, Midjourney `--ar 4:3`).
- 얼굴 고정: 사용자가 참조 얼굴을 붙여 같은 연출을 재현할 때만 그 엔진의 '얼굴 고정' 칸을 쓴다(Seedream `Use Image 1 only for the woman's identity…` 문장, Midjourney `--oref`, Soul `soul_id`). 참조가 없으면 그 칸을 쓰지 않고, 문화권 공식을 인물 문장으로 쓰며(나이·성별·체형 인상은 사진대로, `in her early twenties`처럼 넓게: image-brief §12.3) 사진 속 얼굴은 옮기지 않는다.
- Soul은 카메라·필름 상표명 대신 발색으로 쓰고(`crisp digital color, clipped white sky`) anti-cg 줄은 뺀다. Nano Banana는 매체를 동사 문장에 넣는다(`Create a compact digital camera snapshot of …`).
- 몸 비율·손가락 칸은 사진에 그 대상이 보일 때만 붙인다.

## 5. 효과 × 엔진 표

칸은 `쓰는 문구 · 자리 · 근거 등급` 순서다. 맨 아래 '언어' 행은 문안 전체의 언어다.

| 효과 | GPT Image | Seedream | Nano Banana | Midjourney | Soul 2 |
|---|---|---|---|---|---|
| 매체 고정 | 첫 줄 맨 앞에 매체 이름, 끝 Finish `closer` 줄이 같은 이름을 한 번 더 부른다 · 처음과 끝 · `[문서]`, 효과는 `[Iris]` | 첫 문장이 매체, 끝 문장이 `…as a still from <매체>` · 처음과 끝 · 중요한 것을 앞에 두는 것은 `[공식]`, 끝 반복은 `[Iris]` | 첫 문장을 동사로 `Create a <매체> of …`, 필름·카메라 이름도 쓸 수 있다 · 처음 · `[공식]` | 첫 구절 `<매체>,`. `--raw`는 매체 이름만으로 스타일이 흐를 때만 · 처음과 파라미터 · 구절은 `[미검증]`, `--raw`는 `[문서]` | 용어 스택의 첫 항은 §3의 구도 관용어(`A medium shot of a woman …`)이고 매체는 발색 항 끝에 `a real photograph`로 한 번 쓴다. 필름 상표명은 쓰지 않고 발색으로 쓴다 · 구도 항과 끝 · 상표명이 필름 테두리를 그렸다 `[실측]` |
| 얼굴 고정 | `## Identity Reference` 조건 문단, `keep her own skin tone` 포함 · 첫 층 · `[문서]` image-brief §5 | `Use Image 1 only for the woman's identity: keep her face shape, facial features and natural skin tone, and do not take her clothes, hair, background or pose from Image 1.` · 매체 문장 바로 뒤 · 이미지마다 역할 하나는 `[공식]`, 옷·배경·자세를 가져오지 않는다는 단서는 `[Iris]` | `Use the attached photo for her face; everything else comes from this description.` · 첫 문장 뒤 · 참조 역할은 `[공식]` | `--oref <url>`(V7, `--ow`는 필요할 때만), V8은 Edit Model(웹은 Attach to prompt, Discord는 파라미터 구간의 `--edit URL1 URL2`) · 파라미터 · `[문서]` midjourney-identity §2 | `soul_id` · 파라미터 · `[문서]` |
| 몸 비율 | Identity 문단의 마지막 문장(fixed-lines.md 문화권 행의 `<비율 문장>`, 남성이면 남성용 문장) · 첫 층 · `[Iris]` | 얼굴 문장 바로 뒤에 같은 문장 · 둘째 문장 · `[Iris]` | 인물 문장 안에 같은 구절 · 인물 문장 · `[미검증]` | `tall slender figure, small head` · 피사체 구절 · `[미검증]` | 구도 관용어(전신이면 `A full-body shot`, 허리 위면 `A medium shot`)와 `statuesque proportions` · 구도 항 · 수치보다 관용 명칭이 통했다 `[실측]`, 이 구절 자체는 `[미검증]` |
| 미화 메이크업 | Hair and makeup 슬롯 줄(fixed-lines.md) · 헤어 층 · `[Iris]` | 한 문장으로 압축한 메이크업(`Matte base, …, a muted rosy-brown matte lip.`) · 헤어 문장 뒤 · `[Iris]` | 같은 내용의 서술 문장 · 인물 문장 뒤 · `[미검증]` | 낱말 3~4개 · 피사체 구절 · `[미검증]` | 메이크업 용어와 결 토큰. `flawless`·`porcelain`·`glass skin` 같은 미화어는 쓰지 않는다 · 용어 스택 · realism.md §1 `[문서]` |
| 피부 실사감 | Finish realism 줄 `<realism 토큰> — Ultra-realistic 8K photographic detail: real pores on the skin, …` · 끝 · 꼬리는 `[Iris]`, `8K`는 `[미검증]` | 끝 앞 문장 `Ultra-realistic photographic detail with real skin pores, <옷감> weave and <표면> …` · 끝 앞 · `[Iris]` | `Photorealistic, with natural skin texture and visible pores.` · 끝 · `[미검증]` | 품질은 `--q` 설정이고 `--raw`는 매체 고정 칸의 조건일 때만 · 파라미터 · `[문서]` | 결 토큰 `natural skin texture, visible pores` · 용어 스택 · `[미검증]` |
| 필름·입자 | Optics `<필름 입자 토큰> — Fine, even film grain … across the whole frame` 한 번(카드·사용자 줄이 굵기를 말했으면 그 줄. 디지털 매체는 fixed-lines.md의 디지털 노이즈 토큰) · Optics · `[Iris]`. GPT의 화면 노이즈 위험은 커뮤니티 보고(surface-contracts.md §3.2.4) | 원문의 입자 줄이 말한 굵기와 규격(`coarse 16mm grain`, 중간 입자 등)을 그대로 옮긴 `<굵기·규격> film grain across the whole frame.` 한 번 · Camera 앞 · `[Iris]` | 스톡 이름과 원문의 굵기를 그대로 옮긴 `with <굵기> film grain` · Optics 문장 · 필름 질감은 `[공식]` | 스톡 이름과 원문의 굵기를 그대로 옮긴 `<굵기> grain` · 색·필름 구절 · `[미검증]` | 상표 없이 원문의 굵기를 그대로 옮긴 `<굵기> grain`. 검정은 층 문안의 palette 사실을 따라 눌린 검정이면 `deep pressed blacks`, 사실이 없을 때만 `softly lifted blacks` · 용어 스택 끝 · `[실측]` |
| 빛 | Light 층: 광원 위치와 결과. 카드가 빛을 정하면 고정 얼굴 빛은 끈다 · Light · `[문서]` | 장면 문장 뒤 한 문장: 광원, 방향, 눈빛 · 장면 뒤 · 조명으로 미학을 보강하는 것은 `[공식]` | 배경, 중간, 전경 순서 안의 빛 문장 · 중간 · `[공식]` | 짧은 구절 `red and green neon split light` · 장소·빛 구절 · `[미검증]` | 관용 조명 명칭(`Paramount lighting`) · 빛 관용어 항 · `[실측]` |
| 화면비 | 웹: Camera 줄 한 번(인물 기본 3:4). API: `size`, 본문에 쓰지 않는다 · Camera 또는 설정 · `[문서]` | ModelArk: `size` 파라미터. 설정이 없는 채팅 표면만 끝에 `3:4 vertical` 한 번 · 설정 또는 끝 · 파라미터는 `[공식]`. Iris는 본문에 두 번 썼지만 이득 근거가 없다 | 호출 설정. 본문에 `--ar`을 쓰지 않는다 · 설정 · `[문서]` | `--ar 3:4` · 파라미터 · `[공식]` 문법 | 파라미터 · 설정 · `[문서]` |
| 렌즈 왜곡 | Camera `lens` 줄(fixed-lines.md). 카드가 광각·셀카면 끈다 · Camera · `[Iris]` | 구도 문장에 `standard-to-moderate telephoto lens`(원문 렌즈 줄이 값을 정했으면 그 값) · Camera 문장 · `[Iris]` | 원문이 렌즈·카메라 높이를 정했으면 그 값을 옮기고, 정하지 않았을 때만 `85mm portrait lens, eye level` · Camera 문장 · 렌즈 용어 허용은 `[공식]` | 원문이 렌즈를 정했으면 그 값, 아니면 `85mm portrait` · 구절 · `[미검증]` | `A medium shot`, `eye level` · 구도 항 · 관용 명칭 `[실측]` |
| 애니·CG 방지 | Finish anti-cg 줄 `<anti-cg 토큰> — …never an illustration, anime frame, 3D render or plastic-skinned CGI.` · 끝 · `[Iris]` | 끝 문장 `…not an illustration, anime, 3D render or plastic CGI` · 끝 · `[Iris]` | 부정 없이 `a real photograph of a real person` · 끝의 실사 문장 안 · 원하는 상태로 쓰는 것은 `[공식]` | `--no illustration, anime, cgi` · 파라미터 · 문법은 `[공식]`(단어마다 따로 읽힌다), 효과는 `[미검증]` | **쓰지 않는다.** `a real photograph`만 쓴다 · 발색 항 끝 · 언급하면 그린다 `[실측]` |
| 글자·로고·워터마크 | 간판은 Scene에 `blurred past reading` 상태로 · Scene · `[문서]` | 끝 문장 `…with no on-screen text, watermark or collage border` · 끝 · `[Iris]` | `the signs glow as unreadable color` · Scene 문장 · 원하는 상태로 쓰는 것은 `[공식]` | `--no text, watermark` · 파라미터 · `[공식]` 문법 | `every surface plain and unlettered` · 용어 스택 · `[실측]` |
| 손·손가락 | 손이 물건을 쥐면 Props·Pose에 접촉 상태 한 구절(`her fingers wrap around the sleeve`) · 해당 층 · `[미검증]` | 끝 문장에 `…or extra fingers` · 끝 · `[Iris]` | `five fingers wrapped around the cup` · 인물 문장 · `[미검증]` | 없음 | 없음 |
| 의상 정확도 | Outfit의 원단과 빛 반응 · Outfit · `[문서]` | 원단 이름과 `real fabric drape and weave` · 의상 문장 · `[Iris]` | 원단 이름과 빛 반응 · 의상 문장 · `[미검증]` | 원단 이름 낱말 · 의상 구절 · `[미검증]` | 의상 정확도가 우선한다 · soul-v2-director 지시 우선순위 `[문서]` |
| 언어 | 영어 뼈대와 원어 이름·낱말(image-brief §2) · `[문서]` | ModelArk는 영어 뼈대에 원어 이름·낱말(§3 규칙), 영어 600단어 미만(원어도 단어로 센다). 600단어 권장은 `[공식]`(2026-08-02 확인)이고 원어를 남기는 쪽은 `[문서]`다. 豆包·即梦·火山의 중국 표면은 중문 `[Iris]`, 그 표면의 권장은 `[미검증]` | 영어 또는 한국어 · `[공식]` 권장 언어 목록 | 영어 뼈대에 짧은 원어 이름(§3 규칙) · `[문서]` | 영어 뼈대에 짧은 원어 이름(§3 규칙) · `[문서]` |

표 밖 규칙 여섯.

- **고정 장치와 선택 장치.** 칸이 장면의 조건(사람이 있다, 사진 매체다)만 보고 붙이라고 정한 고정 장치(Seedream의 끝 문장 전체: 매체 고정, 실사 문장, 애니·CG 방지, 글자·워터마크, 손가락 꼬리)는 원문에 단서가 없어도 붙인다. 원문에 그 효과의 단서가 있어야 붙는 것은 선택 장치(몸 비율, 필름 입자, 얼굴 고정)다. "원문에 없던 효과는 새로 넣지 않는다"([prompt-conversion.md](prompt-conversion.md) §3)는 장면의 내용과 선택 장치에 해당한다.
- **모든 장치는 장면 사실 뒤다.** 장치가 장면 사실(소품, 자세, 의상, 시선)과 부딪히면 장면 사실이 이긴다. 머리카락이 얼굴을 가리는 룩이면 '가림 금지'를 넣지 않고, 광각 룩이면 렌즈 왜곡 칸을 쓰지 않는다.
- **금지 문장은 칸이 정한 것만 쓴다.** 위 표의 금지 한 문장(애니·CG, 글자·워터마크, 손가락)은 묶음으로 늘려 쓰지 않는다. 사용자가 직접 빼 달라고 한 것은 장치가 아니라 내용이라 그 엔진의 배제 형식으로 쓴다([surface-contracts.md](surface-contracts.md) §4).
- **같은 효과를 두 칸이 내지 않게 한다.** 층 문안이 이미 낸 효과(Finish 줄, 문화권 공식의 비율 문장)를 장치 칸으로 바꿨으면 원래 줄은 뺀다.
- **입자는 원문의 것을 옮긴다.** 필름 입자의 굵기·규격은 층 문안의 입자 줄이 말한 것을 그대로 옮기고(줄이 없으면 `fine`), 디지털 매체의 노이즈(디지털 노이즈 줄)는 필름·입자 칸을 쓰지 않고 `very fine digital noise only in the darkest parts of the frame` 한 구절로 옮긴다.
- **저해상 매체는 모공 칸을 쓰지 않는다.** 층 문안의 realism 줄이 `native resolution` 줄이면([fixed-lines.md](fixed-lines.md) Finish) '피부 실사감' 칸의 모공 문구(`real skin pores`, `visible pores`)를 붙이지 않고, 그 줄의 매체 해상도를 대상 엔진의 말로 옮긴다(Seedream은 끝 앞 문장 `Soft edges and smeared fine texture, the resolution of a 480-line camcorder.`, Nano Banana와 Soul은 같은 뜻의 서술 한 구절, Midjourney는 `soft low-resolution camcorder frame` 같은 구절).

### 5.1 Seedream 豆包·即梦 중문 칸

§3의 `Seedream 豆包·即梦` 행에 쓰는 중문 칸이다. 자리와 고정·선택 장치의 구분은 §5의 Seedream 열과 같고 문구만 중문이다. 칸은 `쓰는 문구 · 자리 · 근거 등급` 순서이고 등급은 §5 Seedream 칸을 따른다. 한글·가나가 섞인 중문 문단이 豆包·即梦 표면에서 어떻게 나오는지와 그 표면의 길이·언어 권장은 확인하지 않았다.

| 효과 | 쓰는 문구 · 자리 · 근거 등급 |
|---|---|
| 매체 고정 | 첫 문장이 매체(`一张1990年代香港电影剧照，用钨丝灯电影负片拍摄。`), 끝 문장이 `像一部…里的一帧`으로 같은 매체를 한 번 더 부른다 · 처음과 끝 · `[Iris]` |
| 얼굴 고정 | `只用图1确定人物身份：保留她的脸型、五官和自然肤色，不要取用图1的服装、发型、背景或姿势。` 참조를 실제로 붙일 때만 · 매체 문장 바로 뒤 · `[Iris]` |
| 몸 비율 | fixed-lines.md 문화권 행의 `<비율 문장>`을 중문으로(CN 행은 `她有7.5头身的比例，小头配直角肩和天鹅颈。`). KR·JP 행은 그 행의 `7.5등신`·`7.5頭身`을 문장 안에 그대로 둔다 · 얼굴 문장 바로 뒤 · `[Iris]` |
| 미화 메이크업 | 한 문장으로 압축한 메이크업(`无粉感底妆，哑光不泛油光，自然的野生眉，柔和的豆沙唇。`) · 헤어 문장 뒤 · `[Iris]` |
| 피부 실사감 | `真实的摄影细节：真实的皮肤毛孔、羊毛的织纹和湿漉漉的瓷砖。`처럼 옷감·표면을 장면의 것으로 바꾼다(저해상 매체는 §5 표 밖 마지막 규칙대로 모공 구절을 빼고 그 해상도를 쓴다) · 끝 앞 문장 · `[Iris]` |
| 필름·입자 | 원문 입자 줄의 굵기·규격을 옮긴 `整个画面是细腻均匀的35mm颗粒。` 한 번 · Camera 앞 · `[Iris]` |
| 렌즈 왜곡 | `用标准至中长焦镜头拍摄，让她的脸保持自然的比例，没有广角拉伸。`(원문 렌즈 줄이 값을 정했으면 그 값, 카드가 광각·셀카면 쓰지 않는다) · Camera 문장 · `[Iris]` |
| 애니·CG·글자·손가락 | 끝 문장 `…不是插画、动漫、3D渲染或塑料感CGI，画面中没有文字、水印、拼贴边框，也没有多余的手指。` 고정 장치라 단서 없이 붙는다 · 끝 · `[Iris]` |
| 화면비 | UI의 비율. 설정이 없는 채팅 표면만 끝에 `3:4竖版`을 한 번 · 설정 또는 끝 · `[Iris]` |
| 언어 | 중문 한 문단이 뼈대다. 중문 토큰과 CN 칸 낱말은 문장의 말이다. KR·JP 원어(사전 토큰, 표정·질감 낱말)는 번역하지 않고 그 글자로 중문 문장 안에 둔다(`坐在한옥 카페的窗边`, `手里的文庫本`). 영어로 남는 것은 상표·필름·렌즈 이름(`Kodak Vision3 500T`)이다. 원어를 `中文（原語）`로 병기하지 않는다([image-brief.md](image-brief.md) §2.1 5항) · 문안 전체 · 중문 뼈대는 `[Iris]`, 원어를 남기는 쪽은 `[문서]` |

## 6. 원문에서 효과 장치 찾기 (변환할 때)

기존 프롬프트를 다른 엔진으로 옮길 때 원문의 효과 장치를 찾는 단서다. 줄마다 원문에 단서가 있으면 그 효과를 노린 것이다. 선택 장치는 단서가 있는 효과만 적용하고 고정 장치는 단서 없이도 붙는다(§5 표 밖 첫 규칙).

| 효과 | 원문의 단서 |
|---|---|
| 얼굴 고정 | 참조 이미지 언급, `reference`, `参考图`, `--oref`, `soul_id`, `Image 1` |
| 몸 비율 | `头身`, `등신`, `proportion`, `long legs`, `头肩比` |
| 필름·입자 | 필름 스톡 이름, `grain`, `颗粒`, `film` |
| 디지털 노이즈 | `噪点`·`数码噪点`·`digital noise`(디카·폰 매체의 줄. 필름 입자와 한 묶음으로 보지 않는다) |
| 렌즈 왜곡 | `mm`, `wide-angle`, `广角`, `畸变`, `selfie` |
| 애니·CG 방지 | `anime`, `3D`, `CGI`, `二次元`, `卡通`, `photorealistic`, 사진 매체 선언 |
| 글자·로고·워터마크 | `text`, `logo`, `watermark`, `文字`, `水印` |
| 화면비 | `x:y`, `--ar`, `竖版`, `portrait canvas` |
| 손·손가락 | `fingers`, `hands`, `手指` |

장치와 내용의 경계는 이렇게 가른다. 원문 끝에 붙은 고정 꼬리(실사 꼬리, 금지 꼬리, 본문 비율)는 장치다. 원문 장면에 나오는 소품·자세·의상은 내용이다. 사용자가 직접 쓴 금지(`no hat`, 간판 글자 정확 문구)도 내용이다. 경계가 애매하면 내용으로 두고 그대로 옮긴다.

## 7. 이 표를 검증하려면

`[Iris]`와 `[미검증]` 칸은 한 축만 바꾼 쌍(장치 있음과 없음, 같은 엔진, 같은 장면, 장당 4장 이상)으로 생성해 보고 등급을 바꾼다. 축마다 판정을 하나씩 둔다. 얼굴 동일성(참조 대비), 몸 비율(머리 길이 대 키), 애니·3D 판정, 글자·워터마크 유무, 입자 분포(배경 균일 밴드 밝기 폭)다. 생성은 사용자 승인이 있어야 하고 이 파일의 칸은 결과가 나오기 전에는 등급을 올리지 않는다.

## 8. 본보기: 홍콩 장면을 다섯 엔진으로

[image-brief.md](image-brief.md) §10의 홍콩 층 문안(인물, 참조 없이 필름 룩과 중국어 토큰)을 §3의 행으로 폈다. 층 문안의 장면 사실(자세, 의상, 소품, 시선, 빛)은 다섯 본보기에서 같다. 원어(`骑楼`·`王家卫`·`卧蚕`·`霓虹灯牌`·`高光`·`暗部` 등)는 §3 규칙대로 Seedream·Midjourney·Soul 본보기의 영어 문장 안에 남겼다(Nano Banana는 근거가 적힌 예외라 영어로 풀었다). `Kodak Vision3 500T`는 필름 이름이라 Soul을 뺀 셋에 남겼다. 비율 3:4는 설정이나 파라미터로 넘겨 Seedream·Nano Banana 본문에 없다.

### 8.1 Seedream ModelArk(영어), 인물 참조를 붙이는 경우

장치는 얼굴 고정, 몸 비율, 실사 문장, 끝 문장이다. 얼굴 고정, 렌즈, 매체 고정 끝 문장은 §5 칸의 영어 문구 그대로이고 원어는 층 문안에서 온 것만 남겼다. 층 문안의 `vertical frame` 줄은 `size`로 빠졌고, 간판 글자는 끝 문장 한 곳에서만 막아 Scene의 `blurred past reading`은 뺐다. 입자는 칸의 문구 한 줄이라 층 문안의 `조금 더 짙게`는 옮기지 않았다.

(2516자 실측)
```text
A 1990s Hong Kong film still shot on tungsten cinema negative. Use Image 1 only for the woman's identity: keep her face shape, facial features and natural skin tone, and do not take her clothes, hair, background or pose from Image 1. She has 7.5-head proportions, 小头 over 直角肩 and 天鹅颈. She shelters under a 骑楼 on an old Kowloon street at night in the rain, her left shoulder resting against a tiled pillar with a closed rolling shutter behind her, weight in her left hip, left hand deep in her coat pocket. She holds a white paper take-out coffee cup with a brown sleeve at chest height in her right hand, steam rising and catching red light, and looks far down the street to the right with a 惆怅, waiting look, not at the camera. Her hair is a loose 1990s 王家卫 perm grazing the collarbones, tucked behind the right ear, a few damp strands loose on the far side. A 无粉感底妆 shine-free 哑光 base, full natural 野生眉, a soft pearly 卧蚕 band under the lower lashes, a hair-thin upper liner, a muted rosy-brown 豆沙唇 and glossy 红指甲. She wears a deep crimson silk 吊带裙 under a man's oversized black wool coat hanging open from her shoulders, the wool beaded with rain and the satin throwing a long liquid highlight where neon reaches it. Rain sheets off the arcade edge in a bright curtain; across the street dense red and green 霓虹灯牌 stack up an old tenement over black mirror-wet asphalt. The mood is 重庆森林: saturated neon, one still figure, everything else streaking past. A red 霓虹灯牌 at the left lights the left side of her face and the silk, green tube light edges her right cheek, the two colors meeting along her nose, thin red and green streaks mirror in her irises, and every light wears a cold halo of mist while the falling rain catches the neon in short bright streaks. Kodak Vision3 500T color: red-orange 高光, teal-green 暗部, deep pressed blacks, 红色光晕 around the brightest tubes, and 抽帧 ghost trails on the rain, passing umbrellas and a cyclist while she stays sharp. Fine even 35mm 颗粒 across the whole frame. Shot from across the 骑楼 with a standard-to-moderate telephoto lens that keeps her face in natural proportion with no 广角 stretch, waist-up, her in the left third, a blurred umbrella edge in the lower right foreground. Ultra-realistic photographic detail with real skin pores, wool weave and wet tile. This is a real person photographed on location as a still from a 1990s Hong Kong feature film, not an illustration, anime, 3D render or plastic CGI, with no on-screen text, watermark, collage border or extra fingers.
```

참조가 없으면 §4의 '참조가 없을 때'대로 둘째 문장을 `She is a 22-year-old Chinese woman with 清冷 bone structure: a 巴掌脸, a straight 鼻梁, a clean 下颌线 and 冷白皮.`으로 바꾼다(`清冷`·`巴掌脸`·`冷白皮`는 §3 규칙대로 영어 문장 안에 남긴다). 설정이 없는 채팅 표면이면 끝에 `3:4 vertical`을 한 번 쓴다.

### 8.2 Nano Banana, 인물 참조를 붙이는 경우

동사로 시작하는 작업 문장, 참조 역할 문장, 배경에서 전경으로 가는 단계, 촬영 용어, 부정 없는 실사 문장 순서다. 요청에 용도가 없어 용도 한 줄은 뺐다. 손가락은 쥐는 모양으로 한 구절만 썼다.

(2168자 실측)
```text
Create a photograph that reads as a still from a 1990s Hong Kong feature film, shot on tungsten cinema negative. Use the attached photo for her face; everything else comes from this description.

Background: a covered shop arcade on an old Kowloon street at night, square pillars clad in small worn tiles and a closed rolling shutter behind her. Rain sheets off the arcade edge in a bright curtain, and across the street dense red and green neon signs stack up an old tenement, glowing as unreadable color over black, mirror-wet asphalt. Midground: a red neon sign at the left lights the left side of her face and the silk, green tube light edges her right cheek, thin red and green streaks mirror in her irises, and every light wears a cold halo of mist. Foreground: a woman with 7.5-head proportions, a small head over level shoulders and a long neck, leans her left shoulder against a tiled pillar, weight in her left hip, left hand deep in her coat pocket. Five fingers wrap around a white paper coffee cup with a brown sleeve in her right hand at chest height, steam rising and catching red light, and she looks far down the street to the right, wistful, not at the camera. Her hair is a loose 1990s Wong Kar-wai perm grazing the collarbones, tucked behind the right ear. She has a matte shine-free base, full natural brows, a soft pearly band under the lower lashes, a hair-thin upper liner, a muted rosy-brown matte lip and glossy red nails. She wears a deep crimson silk slip dress under a man's oversized black wool coat hanging open from her shoulders, the wool beaded with rain and the satin throwing a long liquid highlight where neon reaches it.

Shot from across the arcade with a standard-to-moderate telephoto lens, waist-up, her in the left third and a blurred umbrella edge in the lower right foreground. The film is Kodak Vision3 500T color: red-orange highlights, teal-green shadows, red halation around the brightest tubes, step-printed ghost trails on the rain and a passing cyclist while she stays sharp, and fine film grain across the whole frame. Photorealistic, with natural skin texture and visible pores: a real photograph of a real person.
```

### 8.3 Midjourney, 참조 없이

한 줄의 구절 목록이다. 금지는 `--no`, 비율은 `--ar`로 나가고 본문에 문장이 없다. 필름 룩이라 매체 이름만으로 스타일이 흐르기 쉬워 `--raw`를 썼고(매체 고정 칸의 조건), 간판 글자는 `--no text`가 맡아 본문에서 뺐다. 몸 비율과 매체는 구절로 줄였다. 필름 스톡 이름, 프레임 범위, 왼쪽 삼분의 일 배치, 주머니에 넣은 손, 전경의 우산은 층 문안의 장면 사실이라 구절로 남겼다. 얼굴 참조를 붙이면 V7은 `--oref <url>`을 파라미터 구간에 더하고, V8은 Edit Model에 참조를 연결한다(웹은 Attach to prompt, Discord는 파라미터 구간의 `--edit URL1 URL2`, [midjourney-identity.md](../midjourney-identity.md) §2).

(787자 실측)
```text
1990s Hong Kong film still on Kodak Vision3 500T tungsten cinema negative, waist-up, a woman in a loose 1990s perm sheltering under a 骑楼 at night in the rain, in the left third of the frame, shoulder against a tiled pillar, left hand deep in her coat pocket, a white paper coffee cup at her chest with steam rising, looking far down the street, a blurred black umbrella edge in the lower right foreground, tall slender figure, small head, deep crimson silk 吊带裙 under an oversized black wool coat, muted rosy-brown lip, glossy 红指甲, dense red and green 霓虹灯牌 across the street, red neon light on her left cheek and green on her right, black mirror-wet asphalt, rain streaks, 红色光晕, 抽帧 ghost trails, teal-green shadows, fine grain --ar 3:4 --raw --no illustration, anime, cgi, text, watermark
```

### 8.4 Soul 2, 참조 없이

구도 관용어가 머리 명사이고, 뒤는 용어 스택이다. 인물은 참조가 없으니 문화권 공식을 성별·나이·문화권 구절로 줄여 피사체 항에 넣었다. 금지 꼬리와 필름 상표명(`Kodak Vision3 500T`)은 없고 발색으로 풀었으며, 매체는 발색 항 끝의 `a real photograph` 하나다. 이 장면의 palette가 눌린 검정이라 `softly lifted blacks`는 쓰지 않았다. 글자 억제는 `every surface plain and unlettered`로 쓴다.

(1037자 실측)
```text
A medium shot of a 22-year-old Chinese woman with statuesque proportions sheltering under a 骑楼 on an old Kowloon street at night in the rain, her left shoulder on a tiled pillar, weight in her left hip, left hand deep in her coat pocket, a white paper coffee cup at her chest with steam rising, her gaze far down the street to the right, wistful. Loose 1990s perm grazing the collarbones, matte shine-free base, full natural brows, muted rosy-brown matte lip, glossy 红指甲. Deep crimson silk 吊带裙 under an oversized black wool coat, the wool beaded with rain, a long liquid highlight on the satin. Dense red and green 霓虹灯牌 tubes stacked up a tenement across the street, every surface plain and unlettered, black mirror-wet asphalt, rain sheeting off the 骑楼 edge. Red neon on the left side of her face, green tube light on her right cheek, a cold halo of mist around every light. Tungsten-balanced cinema color: red-orange highlights, teal-green shadows, deep pressed blacks, 红色光晕, 抽帧 ghost trails on the rain, fine grain, a real photograph.
```

### 8.5 Seedream 豆包·即梦, 인물 참조를 붙이는 경우

8.1의 장면 사실을 §5.1의 칸으로 옮긴 중문 한 문단이다. 이 장면의 원어(`骑楼`·`王家卫`·`卧蚕`·`霓虹灯牌`·`高光`·`暗部`·`抽帧`)는 중문의 말이라 따로 남길 것이 없고, 영어로 남은 것은 `Kodak Vision3 500T`뿐이다. 한글·가나 원어 이름이 있는 장면은 §5.1 '언어' 칸대로 그 글자 그대로 둔다. 비율 3:4는 UI 설정이라 본문에 없고, 간판 글자는 8.1처럼 끝 문장 한 곳에서만 막는다.

(832자 실측)
```text
一张1990年代香港电影剧照，用钨丝灯电影负片拍摄。只用图1确定人物身份：保留她的脸型、五官和自然肤色，不要取用图1的服装、发型、背景或姿势。她有7.5头身的比例，小头配直角肩和天鹅颈。夜里下着雨，她在九龙一条老街的骑楼下避雨，左肩靠着贴满小瓷砖的柱子，身后是拉下的卷闸门，重心落在左胯，左手深插在大衣口袋里。右手在胸口高度握着一杯带棕色杯套的白色纸质外带咖啡，热气升起，沾着红光；她望向街的远处右侧，神情惆怅，像在等人，没有看镜头。头发是松散的1990年代王家卫式卷发，垂到锁骨，别在右耳后，远侧有几缕潮湿的碎发。无粉感底妆，哑光不泛油光，自然的野生眉，下睫毛下一道柔和的珍珠色卧蚕，极细的上眼线，柔和的豆沙唇和亮泽的红指甲。她穿一条深红色真丝吊带裙，外面披着男式的黑色宽大羊毛大衣，大衣从肩上敞开垂下，羊毛上挂着雨珠，霓虹照到的地方，缎面拉出一道长长的流动高光。雨水从骑楼边缘垂成一道明亮的雨帘；街对面密密匝匝的红绿霓虹灯牌堆满一栋老楼，映在镜面般湿亮的黑色柏油路上。整个画面像《重庆森林》：饱和的霓虹，一个静止的人，其余一切都在飞掠而过。左侧一块红色霓虹灯牌照亮她脸的左侧和丝绸，绿色灯管勾出右脸颊的边缘，两种颜色在鼻梁处相遇，红绿细光映在虹膜里，每盏灯都罩着一圈冷冷的雾晕，落下的雨在霓虹里划出短而亮的光痕。Kodak Vision3 500T色彩：红橙色的高光，青绿色的暗部，浓重压实的黑色，最亮的灯管周围一圈红色光晕，雨丝、路过的雨伞和一位骑车人拖着抽帧的重影，而她始终清晰。整个画面是细腻均匀的35mm颗粒。从骑楼对面用标准至中长焦镜头拍摄，让她的脸保持自然的比例，没有广角拉伸，取景到腰部，她在画面左三分之一处，右下前景有一角虚化的雨伞边缘。真实的摄影细节：真实的皮肤毛孔、羊毛的织纹和湿漉漉的瓷砖。这是在现场拍下的真人，像一部1990年代香港电影里的一帧，不是插画、动漫、3D渲染或塑料感CGI，画面中没有文字、水印、拼贴边框，也没有多余的手指。
```

같은 층 문안을 이 다섯 형식으로 옮겼을 때 효과가 같은지는 확인되지 않았다(§7). `node scripts/check_prompt.mjs --engine <엔진>`은 형식이 칸을 지켰는지(층 제목 잔류, 본문의 플래그, 엔진이 쓰지 않는 금지 꼬리, Soul의 필름 상표명)만 본다.
