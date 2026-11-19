# 인물 시리즈의 축별 변주

인물 사진 시리즈에서 어떤 연출을 바꿨을 때 결과가 달라지는지 비교하거나, 요청한 프리셋을 컷별로 조합할 때 적용한다. 한 컷의 프리셋 조합은 한 컷으로 쓴다. 기준 원문 한 편의 특정 항목을 고치는 요청은 [common.md](../../templates/common.md) §기준 원문과 누적 수정을 따른다.

## 같은 기준에서 비교

1. 기준 장면과 바꿀 축을 먼저 정한다. 광학·톤, 포즈·프레이밍, 의상·소재는 비교할 수 있는 예다. 요청의 범위가 더 좁으면 그대로 둔다. 포즈만 바꿀 때는 프레임을 유지하고, 색감만 바꿀 때는 조명 방향을 유지한다.
2. 바꾸지 않는 조건은 컷마다 같은 말로 전달한다. 프리셋은 그 컷에 허용된 축의 효과만 가져온다. 여러 축이나 조합을 명시했다면 요청한 짝과 순서를 따른다. 별도 기준 컷이나 가능한 모든 조합을 자동으로 증설하지 않는다.
3. 각 컷에 해당 장면과 보존 조건을 넣어 단독 실행할 수 있게 쓴다. 앞 컷이나 앞 문장을 읽어야 알 수 있는 표현으로 공통 조건을 생략하지 않는다. 참조가 없으면 같은 인물 **설정**을 쓰고 첨부나 실제 얼굴의 동일성을 가정하지 않는다.

### 조합이 보존 조건과 겹칠 때

참조 역할은 [from-image.md](../from-image.md) §1, 인물과 제품의 권한 충돌은 [reference-authority-pitfalls.md](../reference-authority-pitfalls.md)를 따른다. 예를 들어 인물 마스터와 판매용 재킷을 고정한 컷에 가죽 소재 프리셋이 들어오면, 선택이 위임된 경우 고정 재킷을 보존하고 허가된 다른 축에만 조합을 적용한다. 소재 변경 자체가 필수라면 충돌하는 조건을 확인한다. 제품 고유색을 보존해야 할 때는 톤 변주를 배경·그림자에 한정하거나, 요청한 비교가 그렇게 성립하지 않으면 확인한다.

## 명시적 랜덤 요청

“랜덤 인물 프롬프트 하나”처럼 전반을 맡기면 비어 있는 연출 축에서 필요한 것만 고른다. “이 조건에서 조명만 랜덤 3개”는 조명만 뽑고 기존 장면·포즈·의상·인물·참조 역할을 각 컷에 유지한다. 한 축을 다시 뽑을 때는 직전 컷의 다른 축을 고정하고 교체할 후보에서 현재 값과 같은 세트의 다른 컷이 이미 쓴 값을 뺀다. 수량이 없으면 하나다. 룩 단서(문화권·장소·시대)가 있는 랜덤은 [image-brief.md](../image-brief.md) §4 '토큰 찾기'의 `--random`으로 층마다 뽑는다. 랜덤을 요청하지 않은 일반 요청과 비교 변주에는 난수 선택을 추가하지 않는다. 랜덤이 아닌 새 이미지 요청에서 맡긴 축은 [image-brief.md](../image-brief.md) §4를 따른다.

각 후보를 요청에 맞게 새로 쓰고, 장면·시간대·광원·포즈의 물리적 적합성과 사용자 제한을 먼저 대조한다. 두 축 이상을 뽑으면 각각을 독립적으로 뽑기보다 함께 쓸 수 있는 조합을 후보로 만든다. 전체를 맡긴 요청도 축을 따로따로 뽑지 않고 먼저 장면 분위기를 하나 정한 뒤 그 안에서 조합 후보를 만든다. 야간 실내라면 작은 램프의 반사광·천장에 튕긴 플래시처럼 가능한 조명을 검토한다. 한낮 햇빛이나 없는 창의 빛을 끼워 넣어 장면을 바꾸지 않는다. 인물과 의상 참조는 위의 보존 규칙을 따른다. 렌더 카피와 언어는 원래 계약을 유지한다. 국적·인종·피부·체형·숫자 나이·성적 표현·브랜드·로고는 자동으로 후보에 넣지 않는다.

- **난수 도구가 있는 경우:** `node scripts/draw_portrait_options.mjs`에 JSON을 표준입력으로 전달한다. `axes`는 허용된 축 이름 배열, `fixed`는 고정 축과 확인된 맥락, `options`는 후보 배열이다. 각 후보의 `changes`는 허용된 축만 모두 담고, `requires`는 있을 때만 해당 후보에 필요한 `fixed`의 값과 같은 문자열을 담는다. 필요하면 `count`를 보낸다. 축 이름(`axes` 항목과 `fixed`·`changes`·`requires`의 키)은 `^[a-z][a-z0-9_-]*$` 형식의 영문 소문자 식별자이고 값만 자유 문자열이다. 내부 표기 예시는 `axes: ["lighting"]`, `fixed: {"place":"indoors","time":"night"}`, `changes: {"lighting":"천장에 튕긴 플래시"}`, `requires: {"place":"indoors"}`다. 축 이름은 바뀌는 시각 정보의 이름으로 짓는다(예: `lighting`, `optics`, `color_grade`, `pose`, `framing`, `expression`, `wardrobe`, `legwear`, `hair_makeup`, `props`, `nails`, `setting`). 목록에 없는 축도 같은 형식으로 만든다. 원본 문장 전체나 정확 카피는 도구로 옮길 필요가 없다.
- **결과 적용:** 도구는 범위와 맥락이 맞는 후보에서 같은 문자열 조합을 한 번만 뽑는다. 같은 뜻의 후보는 도구 호출 전에 하나로 합친다. `status`가 `selected`일 때 `choices`의 선택만 문안에 적용한다. `locked_axes`, `no_eligible_options`, `insufficient_options`면 고정 조건을 풀거나 임의 후보로 채우지 않는다. 막힌 이유나 가능한 수를 밝히고 필요하면 사용자가 선택하게 한다.
- **난수 도구가 없는 경우:** 제약을 지키는 창작 변주만 제공하고 실제 난수로 골랐다고 보고하지 않는다. 난수 선택이 아니라 창작 변주라는 사실을 한 줄로 알린다. 요청한 수를 맞출 수 없으면 같은 기준을 따른다. 작성 도구의 선택은 이미지 생성 모델의 seed나 재현성·분포를 뜻하지 않는다.

각 컷은 선택한 축의 표현과 나머지 공통 조건을 갖춘 완성 문안으로 쓴다. 여러 축의 표현을 한 문안으로 합칠 때 같은 속성을 두 번 서술하지 않고, 장면이 정한 시간대·광원이 다른 축의 표현보다 우선한다. 기존 원문의 한 축을 뽑아 교체할 때도 지정한 부분만 바꾼다. 납품 형식과 [언어 규칙](../../templates/common.md#프롬프트-언어-결정)을 유지하고 내부 입력·후보와 중복 설명은 요청받았을 때만 보여 준다.

## 작성 예시

[common.md](../../templates/common.md) §프롬프트 언어 결정에 따른다. 아래는 참조 없이 Optics 층만 달리하는 두 컷을 기본 방식과 한국어 지정 방식으로 보여 준다. 성별과 외모 지정이 없으니 [image-brief.md](../image-brief.md) §5-1의 기본 인물을 쓰고, 인물 기본 층(§3)을 모두 갖춘다. 두 컷은 Optics 층(한국어 지정 문안은 광학 층)만 다르고 나머지 층은 글자 그대로 같다. 직광 플래시는 카메라가 만드는 빛이라 Light가 아니라 Optics에 둔다. 허리 위 구도라 Legwear 층은 뺐다. 납품에는 해당 방식만 적용하며 컷 수와 양식은 요청을 따른다.

### 다국어 기본 문안

```text
A waist-up portrait of one adult woman standing at a workbench in front of a plain gray wall, wearing a navy canvas jacket and holding a closed notebook, for a studio profile page.

## Person
default adult — A 22-year-old adult East Asian woman with a small face, clean defined bone structure and a crisp jawline.
build — A slender build with level shoulders and a long neck.
skin tone — Light skin with a cool undertone.

## Hair and makeup
straight bob — Dark brown hair cut to the jaw with a soft side part, one side tucked behind the ear so the jawline shows.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the nose bridge, and fine pores still show through it.

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

## Optics
ノンフラッシュ — Only the window light is used and the camera flash stays off, so the skin has low contrast, gentle warm highlights and a softly washed background.
muted color — The color is calm, with slightly lifted shadows and highlights on the jacket that roll off without clipping.

## Camera
waist-up frame — The camera sits at chest height about two meters away, with the frame running from the top of her head to her waist.
focus — The face and the notebook are sharp, and the bench edge in the foreground softens slightly.
```

```text
A waist-up portrait of one adult woman standing at a workbench in front of a plain gray wall, wearing a navy canvas jacket and holding a closed notebook, for a studio profile page.

## Person
default adult — A 22-year-old adult East Asian woman with a small face, clean defined bone structure and a crisp jawline.
build — A slender build with level shoulders and a long neck.
skin tone — Light skin with a cool undertone.

## Hair and makeup
straight bob — Dark brown hair cut to the jaw with a soft side part, one side tucked behind the ear so the jawline shows.
촉촉피부 — A thin dewy base leaves a soft sheen on the cheekbones and the nose bridge, and fine pores still show through it.

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

## Optics
机顶直闪 — An on-camera flash fires straight from the front, flattening the face into even bright light, putting small hot spots on the forehead and nose, and throwing a short, hard shadow on the wall just behind her.
flash falloff — The background drops a stop darker than the face, and the navy jacket reads saturated with small bright reflections on its folds.

## Camera
waist-up frame — The camera sits at chest height about two meters away, with the frame running from the top of her head to her waist.
focus — The face and the notebook are sharp, and the bench edge in the foreground softens slightly.
```

### 한국어 지정 문안

```text
단색 회색 벽 앞 작업대에서 남색 캔버스 재킷을 입고 닫힌 노트를 든 성인 여성의 허리 위 인물 사진. 스튜디오 프로필 페이지용이다.

## 인물
기본 성인 — 22세 성인 동아시아 여성으로, 얼굴이 작고 골격이 또렷하며 턱선이 깔끔하다.
체형 — 날씬한 체형에 어깨가 반듯하고 목이 길다.
피부 톤 — 차가운 언더톤의 밝은 피부다.

## 헤어와 메이크업
단발 — 짙은 갈색 머리를 턱선 길이로 자르고 옆가르마를 탔으며, 한쪽은 귀 뒤로 넘겨 턱선이 드러난다.
촉촉피부 — 얇고 촉촉한 베이스가 광대와 콧등에 은은한 윤기를 남기고, 고운 모공은 그대로 비친다.

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

## 광학
ノンフラッシュ — 창에서 든 빛만 쓰고 카메라 플래시는 꺼 두어, 피부 대비가 낮고 하이라이트는 은은히 따뜻하며 배경은 부드럽게 바랜다.
차분한 색 — 그림자가 살짝 들려 있어 색이 차분하고, 재킷의 하이라이트는 날아가지 않고 부드럽게 넘어간다.

## 카메라
허리 위 구도 — 카메라는 가슴 높이에서 이 미터쯤 떨어져 머리 위부터 허리까지를 담는다.
초점 — 얼굴과 노트에 초점이 맞고 앞쪽 작업대 가장자리는 살짝 흐려진다.
```

```text
단색 회색 벽 앞 작업대에서 남색 캔버스 재킷을 입고 닫힌 노트를 든 성인 여성의 허리 위 인물 사진. 스튜디오 프로필 페이지용이다.

## 인물
기본 성인 — 22세 성인 동아시아 여성으로, 얼굴이 작고 골격이 또렷하며 턱선이 깔끔하다.
체형 — 날씬한 체형에 어깨가 반듯하고 목이 길다.
피부 톤 — 차가운 언더톤의 밝은 피부다.

## 헤어와 메이크업
단발 — 짙은 갈색 머리를 턱선 길이로 자르고 옆가르마를 탔으며, 한쪽은 귀 뒤로 넘겨 턱선이 드러난다.
촉촉피부 — 얇고 촉촉한 베이스가 광대와 콧등에 은은한 윤기를 남기고, 고운 모공은 그대로 비친다.

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

## 광학
정면 플래시 — 카메라 위의 플래시가 정면에서 터져 얼굴을 고르고 밝게 펴고, 이마와 콧등에 작은 광점을 찍고, 바로 뒤 벽에 짧고 진한 그림자를 드리운다.
플래시 감쇠 — 배경은 얼굴보다 한 단계 어두워지고, 남색 재킷은 채도가 올라 주름마다 작은 반사가 생긴다.

## 카메라
허리 위 구도 — 카메라는 가슴 높이에서 이 미터쯤 떨어져 머리 위부터 허리까지를 담는다.
초점 — 얼굴과 노트에 초점이 맞고 앞쪽 작업대 가장자리는 살짝 흐려진다.
```

연출 축을 분리해 조합하고 범위를 정해 뽑는 방식은 [Iris의 한국어 README](https://github.com/noahvisualsx/Iris/blob/main/README.ko.md)와 [웹 스튜디오](https://github.com/noahvisualsx/Iris/blob/main/index.html)를 참고했다. 검토한 Iris 커밋은 `b83de4c`(전체 SHA `b83de4cf5cb12f6c4572f01a922c258dd34a8087`, MIT)다. 외부 저장소의 문장·프리셋·코드는 옮기지 않았고, 이 문서의 규칙과 예문은 MPW용으로 작성했다.
