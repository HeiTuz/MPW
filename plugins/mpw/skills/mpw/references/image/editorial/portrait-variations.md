# 인물 시리즈의 축별 변주

인물 사진 시리즈에서 어떤 연출을 바꿨을 때 결과가 달라지는지 비교하거나, 요청한 프리셋을 컷별로 조합할 때 적용한다. 한 컷의 프리셋 조합은 한 컷으로 쓴다. 기준 원문 한 편의 특정 항목을 고치는 요청은 [common.md](../../templates/common.md) §기준 원문과 누적 수정을 따른다.

## 같은 기준에서 비교

1. 기준 장면과 바꿀 축을 먼저 정한다. 광학·톤, 포즈·프레이밍, 의상·소재는 비교할 수 있는 예다. 요청의 범위가 더 좁으면 그대로 둔다. 포즈만 바꿀 때는 프레임을 유지하고("포즈와 구도"를 함께 말했으면 둘 다 바꾼다), 색감만 바꿀 때는 조명 방향을 유지한다.
2. 바꾸지 않는 조건은 컷마다 같은 말로 전달한다. 프리셋은 그 컷에 허용된 축의 효과만 가져온다. 여러 축이나 조합을 명시했다면 요청한 짝과 순서를 따른다. 별도 기준 컷이나 가능한 모든 조합을 자동으로 증설하지 않는다.
3. 각 컷에 해당 장면과 보존 조건을 넣어 단독 실행할 수 있게 쓴다. 앞 컷이나 앞 문장을 읽어야 알 수 있는 표현으로 공통 조건을 생략하지 않는다. 참조가 없으면 같은 인물 **설정**을 쓰고 첨부나 실제 얼굴의 동일성을 가정하지 않는다.
4. 수량만 있고 바꿀 축이 없으면("같은 장면 8장") Pose와 Camera를 바꿀 축으로 본다. 룩 카드가 있으면 고른 갈래의 포즈·구도 쌍을 번호순으로 장수만큼 배정한다. 쌍이 모자랄 때 빌리는 순서와 컷 사이에 달라도 되는 줄은 [image-brief.md](../image-brief.md) §4 '룩 카드' 6항이 정한다. 카드가 없으면 몸 방향·카메라 높이·거리 조합이 겹치지 않게 장수만큼 짓는다. 나머지 조건은 컷마다 같은 말로 두되, Light의 방향은 카메라 기준(`camera left`) 대신 장면 기준(해가 바다 쪽 낮게 있다)으로 쓰고 컷마다 카메라가 돌아 얼굴의 밝은 쪽이 달라지면 그 한 문장만 컷별로 쓴다.

### 조합이 보존 조건과 겹칠 때

참조 역할은 [from-image.md](../from-image.md) §1, 인물과 제품의 권한 충돌은 [reference-authority-pitfalls.md](../reference-authority-pitfalls.md)를 따른다. 예를 들어 인물 마스터와 판매용 재킷을 고정한 컷에 가죽 소재 프리셋이 들어오면, 선택이 위임된 경우 고정 재킷을 보존하고 허가된 다른 축에만 조합을 적용한다. 소재 변경 자체가 필수라면 충돌하는 조건을 확인한다. 제품 고유색을 보존해야 할 때는 톤 변주를 배경·그림자에 한정하거나, 요청한 비교가 그렇게 성립하지 않으면 확인한다.

## 명시적 랜덤 요청

“랜덤 인물 프롬프트 하나”처럼 전반을 맡기면 [image-brief.md](../image-brief.md) §3의 기본 층을 모두 채운다. 인물 자체도 지어 채우는 것이라 `## Identity Reference` 조건절의 인물에 성별·20세 이상의 나이대·문화권을 정해 쓴다([image-brief.md](../image-brief.md) §5). 사용자가 아무것도 정하지 않으면 성별은 여성, 나이는 20~35세 안의 한 값, 문화권은 룩 단서가 가리키는 곳이고 단서가 없으면 동아시아다. “이 조건에서 조명만 랜덤 3개”는 조명만 뽑고 기존 장면·포즈·의상·인물·참조 역할을 각 컷에 유지한다. 한 축을 다시 뽑을 때는 직전 컷의 다른 축을 고정하고 교체할 후보에서 현재 값과 같은 세트의 다른 컷이 이미 쓴 값을 뺀다. 수량이 없으면 하나다. 룩 단서(문화권·장소·시대)가 있는 랜덤은 [image-brief.md](../image-brief.md) §4 '토큰 찾기'의 `--random`으로 층마다 뽑는다. 랜덤을 요청하지 않은 일반 요청과 비교 변주에는 난수 선택을 추가하지 않는다. 랜덤이 아닌 새 이미지 요청에서 맡긴 축은 [image-brief.md](../image-brief.md) §4를 따른다.

각 후보를 요청에 맞게 새로 쓰고, 장면·시간대·광원·포즈의 물리적 적합성과 사용자 제한을 먼저 대조한다. 두 축 이상을 뽑으면 각각을 독립적으로 뽑기보다 함께 쓸 수 있는 조합을 후보로 만든다. 전체를 맡긴 요청도 축을 따로따로 뽑지 않고 먼저 장면 분위기를 하나 정한 뒤 그 안에서 조합 후보를 만든다. 야간 실내라면 작은 램프의 반사광·천장에 튕긴 플래시처럼 가능한 조명을 검토한다. 한낮 햇빛이나 없는 창의 빛을 끼워 넣어 장면을 바꾸지 않는다. 인물과 의상 참조는 위의 보존 규칙을 따른다. 렌더 카피와 언어는 원래 계약을 유지한다. 지어 채우는 후보 인물은 조건절에 20세 이상의 나이를 쓴다. 로고·상표 글자는 그리지 않는다(브랜드명은 룩을 가리키는 토큰으로 쓸 수 있다). 비교 변주에서는 고정한 인물 층을 컷마다 같은 말로 유지하고, 인물 외모 축은 요청이 없으면 바꾸지 않는다.

- **난수 도구가 있는 경우:** `node scripts/draw_portrait_options.mjs`에 JSON을 표준입력으로 전달한다. `axes`는 허용된 축 이름 배열, `fixed`는 고정 축과 확인된 맥락, `options`는 후보 배열이다. 각 후보의 `changes`는 허용된 축만 모두 담고, `requires`는 있을 때만 해당 후보에 필요한 `fixed`의 값과 같은 문자열을 담는다. 필요하면 `count`를 보낸다. 축 이름(`axes` 항목과 `fixed`·`changes`·`requires`의 키)은 `^[a-z][a-z0-9_-]*$` 형식의 영문 소문자 식별자이고 값만 자유 문자열이다. 내부 표기 예시는 `axes: ["lighting"]`, `fixed: {"place":"indoors","time":"night"}`, `changes: {"lighting":"천장에 튕긴 플래시"}`, `requires: {"place":"indoors"}`다. 축 이름은 바뀌는 시각 정보의 이름으로 짓는다(예: `lighting`, `optics`, `color_grade`, `pose`, `framing`, `expression`, `wardrobe`, `legwear`, `hair_makeup`, `props`, `nails`, `setting`). 목록에 없는 축도 같은 형식으로 만든다. 원본 문장 전체나 정확 카피는 도구로 옮길 필요가 없다.
- **결과 적용:** 도구는 범위와 맥락이 맞는 후보에서 같은 문자열 조합을 한 번만 뽑는다. 같은 뜻의 후보는 도구 호출 전에 하나로 합친다. `status`가 `selected`일 때 `choices`의 선택만 문안에 적용한다. `locked_axes`, `no_eligible_options`, `insufficient_options`면 고정 조건을 풀거나 임의 후보로 채우지 않는다. 막힌 이유나 가능한 수를 밝히고 필요하면 사용자가 선택하게 한다.
- **난수 도구가 없는 경우:** 제약을 지키는 창작 변주만 제공하고 실제 난수로 골랐다고 보고하지 않는다. 난수 선택이 아니라 창작 변주라는 사실을 한 줄로 알린다. 요청한 수를 맞출 수 없으면 같은 기준을 따른다. 작성 도구의 선택은 이미지 생성 모델의 seed나 재현성·분포를 뜻하지 않는다.

각 컷은 선택한 축의 표현과 나머지 공통 조건을 갖춘 완성 문안으로 쓴다. 여러 축의 표현을 한 문안으로 합칠 때 같은 속성을 두 번 서술하지 않고, 장면이 정한 시간대·광원이 다른 축의 표현보다 우선한다. 기존 원문의 한 축을 뽑아 교체할 때도 지정한 부분만 바꾼다. 납품 형식과 [언어 규칙](../../templates/common.md#프롬프트-언어-결정)을 유지하고 내부 입력·후보와 중복 설명은 요청받았을 때만 보여 준다.

## 작성 예시

[common.md](../../templates/common.md) §프롬프트 언어 결정에 따른다. 아래는 참조 없이 Optics 층만 달리하는 두 컷을 기본 방식과 한국어 지정 방식으로 보여 준다. 성별과 외모 지정이 없으니 [image-brief.md](../image-brief.md) §5의 기본 인물을 조건절에 쓴다. 두 컷은 Optics 층(한국어 지정 문안은 광학 층)만 다르고 나머지 층은 글자 그대로 같다. 직광 플래시는 카메라가 만드는 빛이라 Light가 아니라 Optics에 둔다. 허리 위 구도라 Legwear 층은 뺐다. 납품에는 해당 방식만 적용하며 컷 수와 양식은 요청을 따른다.

### 다국어 기본 문안

```text
A waist-up studio profile portrait of a woman standing at a workbench in front of a plain gray wall, in a navy canvas jacket and holding a closed notebook.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old East Asian woman with a small face, a defined nose bridge, a clean jawline and clear, fair skin. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.

## Hair and makeup
straight bob — Dark brown hair cut to the jaw with a soft side part, one side tucked behind the ear so the jawline shows.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the nose bridge, and fine pores still show through it.
애교살 — A soft pearly band under the lower lashes with a faint shadow line beneath it.
점막 아이라인 — A hair-thin dark line along the upper lash roots defines the eye with no visible wing.
lips and cheeks — A sheer coral-pink lip tint with a soft edge and a diffuse rose blush that fades into the cheeks with no visible edge.

## Expression
off-lens gaze — Her eyes rest just past the lens, the lids relaxed and the brows level.
small smile — One corner of her mouth lifts slightly while the rest of the face stays calm.

## Outfit
canvas jacket — A navy cotton canvas jacket with a matte surface, worn open, with straight, heavy folds at the elbows.
white tee — A plain white cotton tee under it, with a soft round neckline that sits flat against the collarbones.

## Props and nails
closed notebook — A closed black linen-bound notebook held against her left hip, its cover matte with a single pale edge of pages showing.
short nails — Short rounded nails in a clear glossy coat that catches one small highlight each.

## Pose
weight shift — Her weight rests on the right leg, so the right shoulder sits slightly lower than the left.
hands — The left hand holds the notebook; the right hand rests on the edge of the workbench.

## Style
quiet workwear — The whole look reads as calm and practical: neutral colors, clean lines and plain unbranded pieces.
palette — Navy, white and warm gray, with the brown of the bench as the only warm color.

## Scene
workbench — A worn wooden workbench with a few marks from use stands in front of a plain gray wall, with nothing else in the frame.
floor line — The wall meets a pale concrete floor at the bottom edge of the frame.

## Light
window light — Soft daylight from a tall window at the camera's left wraps the face and the jacket, so the shadows on the right fade slowly.
wall bounce — Light reflected off the gray wall fills the shadow side of the jacket with a cool, even tone.
catchlight — A small window shaped point of light sits in each eye.

## Optics
ノンフラッシュ — Only the window light is used and the camera flash stays off, so the skin has low contrast, gentle warm highlights and a softly washed background.
muted color — The color is calm, with slightly lifted shadows and highlights on the jacket that roll off without clipping.

## Camera
vertical frame — A vertical 3:4 frame from the top of her head to her waist, shot from chest height about two meters away with a moderate telephoto lens so the face keeps natural proportions.
focus — The face and the notebook are sharp, and the bench edge in the foreground softens slightly.

## Finish
photograph — The whole frame reads as a real studio profile portrait photograph.
photorealistic — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the canvas, real marks on the wood.
real photograph — A real person photographed in a studio, never an illustration, anime frame, 3D render or plastic-skinned CGI.
```

```text
A waist-up studio profile portrait of a woman standing at a workbench in front of a plain gray wall, in a navy canvas jacket and holding a closed notebook.

## Identity Reference
If a model reference is provided, the woman in this photo is that model: take only the face shape and facial features from it, adapting them naturally to this scene's expression, angle and light, and keep her own skin tone. Hair, makeup and everything else follow this prompt. If none is provided, she is a 22-year-old East Asian woman with a small face, a defined nose bridge, a clean jawline and clear, fair skin. In either case she has 7.5-head proportions, a small head over level shoulders and a long neck.

## Hair and makeup
straight bob — Dark brown hair cut to the jaw with a soft side part, one side tucked behind the ear so the jawline shows.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the nose bridge, and fine pores still show through it.
애교살 — A soft pearly band under the lower lashes with a faint shadow line beneath it.
점막 아이라인 — A hair-thin dark line along the upper lash roots defines the eye with no visible wing.
lips and cheeks — A sheer coral-pink lip tint with a soft edge and a diffuse rose blush that fades into the cheeks with no visible edge.

## Expression
off-lens gaze — Her eyes rest just past the lens, the lids relaxed and the brows level.
small smile — One corner of her mouth lifts slightly while the rest of the face stays calm.

## Outfit
canvas jacket — A navy cotton canvas jacket with a matte surface, worn open, with straight, heavy folds at the elbows.
white tee — A plain white cotton tee under it, with a soft round neckline that sits flat against the collarbones.

## Props and nails
closed notebook — A closed black linen-bound notebook held against her left hip, its cover matte with a single pale edge of pages showing.
short nails — Short rounded nails in a clear glossy coat that catches one small highlight each.

## Pose
weight shift — Her weight rests on the right leg, so the right shoulder sits slightly lower than the left.
hands — The left hand holds the notebook; the right hand rests on the edge of the workbench.

## Style
quiet workwear — The whole look reads as calm and practical: neutral colors, clean lines and plain unbranded pieces.
palette — Navy, white and warm gray, with the brown of the bench as the only warm color.

## Scene
workbench — A worn wooden workbench with a few marks from use stands in front of a plain gray wall, with nothing else in the frame.
floor line — The wall meets a pale concrete floor at the bottom edge of the frame.

## Light
window light — Soft daylight from a tall window at the camera's left wraps the face and the jacket, so the shadows on the right fade slowly.
wall bounce — Light reflected off the gray wall fills the shadow side of the jacket with a cool, even tone.
catchlight — A small window shaped point of light sits in each eye.

## Optics
机顶直闪 — An on-camera flash fires straight from the front, flattening the face into even bright light, putting small hot spots on the forehead and nose, and throwing a short, hard shadow on the wall just behind her.
flash falloff — The background drops a stop darker than the face, and the navy jacket reads saturated with small bright reflections on its folds.

## Camera
vertical frame — A vertical 3:4 frame from the top of her head to her waist, shot from chest height about two meters away with a moderate telephoto lens so the face keeps natural proportions.
focus — The face and the notebook are sharp, and the bench edge in the foreground softens slightly.

## Finish
photograph — The whole frame reads as a real studio profile portrait photograph.
photorealistic — Ultra-realistic 8K photographic detail: real pores on the skin, real weave in the canvas, real marks on the wood.
real photograph — A real person photographed in a studio, never an illustration, anime frame, 3D render or plastic-skinned CGI.
```

### 한국어 지정 문안

```text
단색 회색 벽 앞 작업대에서 남색 캔버스 재킷을 입고 닫힌 노트를 든 성인 여성의 허리 위 인물 사진. 스튜디오 프로필 페이지용이다.

## 인물 참조
참조가 있으면 사진의 여성은 그 모델이고, 얼굴형과 이목구비만 가져와 장면의 표정·각도·빛에 맞추며 피부색은 그 모델 그대로 둔다. 헤어·메이크업 등은 프롬프트를 따른다. 없으면 얼굴이 작고 콧대가 또렷하며 턱선이 깨끗하고 피부가 맑고 흰 22세 동아시아 여성이다. 어느 쪽이든 머리가 작고 어깨선이 수평이며 목이 긴 7.5등신 비율이다.

## 헤어와 메이크업
단발 — 짙은 갈색 머리를 턱선 길이로 자르고 옆가르마를 탔으며, 한쪽은 귀 뒤로 넘겨 턱선이 드러난다.
촉촉피부 — 얇고 촉촉한 베이스가 광대와 콧등에 은은한 윤기를 남기고, 고운 모공은 그대로 비친다.
애교살 — 아래 속눈썹 밑에 은은한 진주빛 띠가 있고 그 아래로 옅은 그림자선이 진다.
속눈썹 라인 — 윗속눈썹 뿌리를 따라 머리카락처럼 가는 어두운 선이 눈매를 또렷하게 하고 꼬리는 빼지 않는다.
립과 볼 — 투명한 코랄 핑크 립 틴트가 가장자리를 부드럽게 두르고, 장밋빛 블러셔가 뺨에서 경계 없이 번진다.

## 표정
시선 이탈 — 눈은 렌즈 바로 옆을 향하고 눈꺼풀은 편안하며 눈썹은 수평이다.
옅은 미소 — 입꼬리 한쪽이 살짝 올라가고 나머지 얼굴은 차분하다.

## 의상
캔버스 재킷 — 남색 면 캔버스 재킷을 열어 입었고, 표면이 무광이며 팔꿈치에 곧고 묵직한 주름이 진다.
흰 티셔츠 — 안에 무지 흰 면 티셔츠를 입었고, 둥근 목선이 쇄골에 납작하게 닿는다.

## 소품과 네일
닫힌 노트 — 검은 린넨 표지의 닫힌 노트를 왼쪽 골반께에 대고 있고, 표지는 무광이며 옆면으로 종이 가장자리가 얇게 보인다.
짧은 네일 — 짧고 둥근 손톱에 투명하고 윤나는 코팅을 입혀 손톱마다 작은 하이라이트가 하나씩 맺힌다.

## 포즈
체중 이동 — 체중이 오른쪽 다리에 실려 오른쪽 어깨가 왼쪽보다 조금 낮다.
손 — 왼손은 노트를 들고 오른손은 작업대 가장자리에 얹는다.

## 스타일
조용한 워크웨어 — 전체가 차분하고 실용적으로 읽힌다. 무채색 계열, 깔끔한 선, 로고 없는 평범한 옷이다.
팔레트 — 남색, 흰색, 따뜻한 회색에 작업대의 갈색만 유일한 온색으로 둔다.

## 장면
작업대 — 사용 흔적이 있는 낡은 나무 작업대가 단색 회색 벽 앞에 서 있고 화면에는 다른 물건이 없다.
바닥선 — 화면 아래쪽에서 벽이 옅은 콘크리트 바닥과 만난다.

## 조명
창가 빛 — 카메라 왼쪽의 키 큰 창에서 든 부드러운 빛이 얼굴과 재킷을 감싸 오른쪽 그림자가 서서히 옅어진다.
벽 반사 — 회색 벽에 반사된 빛이 재킷의 그늘 쪽을 차갑고 고른 톤으로 채운다.
눈빛 반사 — 눈마다 작은 창문 모양의 빛점이 하나씩 맺힌다.

## 광학
ノンフラッシュ — 창에서 든 빛만 쓰고 카메라 플래시는 꺼 두어, 피부 대비가 낮고 하이라이트는 은은히 따뜻하며 배경은 부드럽게 바랜다.
차분한 색 — 그림자가 살짝 들려 있어 색이 차분하고, 재킷의 하이라이트는 날아가지 않고 부드럽게 넘어간다.

## 카메라
세로 프레임 — 머리 위부터 허리까지를 담는 3:4 세로 프레임이고, 카메라는 가슴 높이에서 이 미터쯤 떨어져 중망원 렌즈로 찍어 얼굴 비율이 자연스럽다.
초점 — 얼굴과 노트에 초점이 맞고 앞쪽 작업대 가장자리는 살짝 흐려진다.

## 마무리
실사 — 화면 전체가 실제 스튜디오 프로필 인물 사진으로 읽힌다.
극사실 — 캔버스의 실제 짜임, 티셔츠의 실제 주름, 나무의 실제 흠집이 보이는 극사실 사진 질감이다.
실사 촬영 — 실제 인물을 스튜디오에서 찍은 사진이며, 일러스트·애니메이션 프레임·삼차원 렌더·플라스틱 같은 컴퓨터 그래픽 피부가 아니다.
```

```text
단색 회색 벽 앞 작업대에서 남색 캔버스 재킷을 입고 닫힌 노트를 든 성인 여성의 허리 위 인물 사진. 스튜디오 프로필 페이지용이다.

## 인물 참조
참조가 있으면 사진의 여성은 그 모델이고, 얼굴형과 이목구비만 가져와 장면의 표정·각도·빛에 맞추며 피부색은 그 모델 그대로 둔다. 헤어·메이크업 등은 프롬프트를 따른다. 없으면 얼굴이 작고 콧대가 또렷하며 턱선이 깨끗하고 피부가 맑고 흰 22세 동아시아 여성이다. 어느 쪽이든 머리가 작고 어깨선이 수평이며 목이 긴 7.5등신 비율이다.

## 헤어와 메이크업
단발 — 짙은 갈색 머리를 턱선 길이로 자르고 옆가르마를 탔으며, 한쪽은 귀 뒤로 넘겨 턱선이 드러난다.
촉촉피부 — 얇고 촉촉한 베이스가 광대와 콧등에 은은한 윤기를 남기고, 고운 모공은 그대로 비친다.
애교살 — 아래 속눈썹 밑에 은은한 진주빛 띠가 있고 그 아래로 옅은 그림자선이 진다.
속눈썹 라인 — 윗속눈썹 뿌리를 따라 머리카락처럼 가는 어두운 선이 눈매를 또렷하게 하고 꼬리는 빼지 않는다.
립과 볼 — 투명한 코랄 핑크 립 틴트가 가장자리를 부드럽게 두르고, 장밋빛 블러셔가 뺨에서 경계 없이 번진다.

## 표정
시선 이탈 — 눈은 렌즈 바로 옆을 향하고 눈꺼풀은 편안하며 눈썹은 수평이다.
옅은 미소 — 입꼬리 한쪽이 살짝 올라가고 나머지 얼굴은 차분하다.

## 의상
캔버스 재킷 — 남색 면 캔버스 재킷을 열어 입었고, 표면이 무광이며 팔꿈치에 곧고 묵직한 주름이 진다.
흰 티셔츠 — 안에 무지 흰 면 티셔츠를 입었고, 둥근 목선이 쇄골에 납작하게 닿는다.

## 소품과 네일
닫힌 노트 — 검은 린넨 표지의 닫힌 노트를 왼쪽 골반께에 대고 있고, 표지는 무광이며 옆면으로 종이 가장자리가 얇게 보인다.
짧은 네일 — 짧고 둥근 손톱에 투명하고 윤나는 코팅을 입혀 손톱마다 작은 하이라이트가 하나씩 맺힌다.

## 포즈
체중 이동 — 체중이 오른쪽 다리에 실려 오른쪽 어깨가 왼쪽보다 조금 낮다.
손 — 왼손은 노트를 들고 오른손은 작업대 가장자리에 얹는다.

## 스타일
조용한 워크웨어 — 전체가 차분하고 실용적으로 읽힌다. 무채색 계열, 깔끔한 선, 로고 없는 평범한 옷이다.
팔레트 — 남색, 흰색, 따뜻한 회색에 작업대의 갈색만 유일한 온색으로 둔다.

## 장면
작업대 — 사용 흔적이 있는 낡은 나무 작업대가 단색 회색 벽 앞에 서 있고 화면에는 다른 물건이 없다.
바닥선 — 화면 아래쪽에서 벽이 옅은 콘크리트 바닥과 만난다.

## 조명
창가 빛 — 카메라 왼쪽의 키 큰 창에서 든 부드러운 빛이 얼굴과 재킷을 감싸 오른쪽 그림자가 서서히 옅어진다.
벽 반사 — 회색 벽에 반사된 빛이 재킷의 그늘 쪽을 차갑고 고른 톤으로 채운다.
눈빛 반사 — 눈마다 작은 창문 모양의 빛점이 하나씩 맺힌다.

## 광학
정면 플래시 — 카메라 위의 플래시가 정면에서 터져 얼굴을 고르고 밝게 펴고, 이마와 콧등에 작은 광점을 찍고, 바로 뒤 벽에 짧고 진한 그림자를 드리운다.
플래시 감쇠 — 배경은 얼굴보다 한 단계 어두워지고, 남색 재킷은 채도가 올라 주름마다 작은 반사가 생긴다.

## 카메라
세로 프레임 — 머리 위부터 허리까지를 담는 3:4 세로 프레임이고, 카메라는 가슴 높이에서 이 미터쯤 떨어져 중망원 렌즈로 찍어 얼굴 비율이 자연스럽다.
초점 — 얼굴과 노트에 초점이 맞고 앞쪽 작업대 가장자리는 살짝 흐려진다.

## 마무리
실사 — 화면 전체가 실제 스튜디오 프로필 인물 사진으로 읽힌다.
극사실 — 캔버스의 실제 짜임, 티셔츠의 실제 주름, 나무의 실제 흠집이 보이는 극사실 사진 질감이다.
실사 촬영 — 실제 인물을 스튜디오에서 찍은 사진이며, 일러스트·애니메이션 프레임·삼차원 렌더·플라스틱 같은 컴퓨터 그래픽 피부가 아니다.
```

연출 축을 분리해 조합하고 범위를 정해 뽑는 방식은 [Iris의 한국어 README](https://github.com/noahvisualsx/Iris/blob/main/README.ko.md)와 [웹 스튜디오](https://github.com/noahvisualsx/Iris/blob/main/index.html)를 참고했다. 검토한 Iris 커밋은 `b83de4c`(전체 SHA `b83de4cf5cb12f6c4572f01a922c258dd34a8087`, MIT)다. 외부 저장소의 문장·프리셋·코드는 옮기지 않았고, 이 문서의 규칙과 예문은 MPW용으로 작성했다.
