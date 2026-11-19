# 이미지 프롬프트 작성 안내

## 1. 먼저 지킬 것

대상을 정하지 않았으면 ChatGPT 웹의 GPT Image 2.5(정본: [surfaces.md](surfaces.md) §0)에 넣을 자연어로 쓴다(직접 API 설정은 [surface-contracts.md](surface-contracts.md) 2.5 §4.3, 2.6 §4.5). 쓰기 전에 요청에서 정해진 것(문구, 수량, 비율, 지킬 것, 넣지 말 것)을 그대로 옮겨 둔다.

- 기존 프롬프트를 고치는 요청이면 이 파일의 §1 나머지 줄과 §2~§5를 적용하지 않는다. [../templates/common.md](../templates/common.md) §기준 원문과 누적 수정에 따라 요청한 부분만 바꾸고, 범위 밖에 든 [surface-contracts.md](surface-contracts.md) §3.2.4 어휘는 블록 밖 한 줄로 알린다.
- 출력: 이미지마다 코드블록 하나. 따로 쓸 프롬프트를 여럿 달라고 하면 블록마다 공통 조건을 다시 다 쓴다. 블록 밖에 안내 문서 이름, 절 번호, '예시'라는 말을 쓰지 않는다.
- 언어: 요청이 정했으면 따른다. 아니면 장면에 맞는 바탕 언어로 쓰고, 한국어·일본어·중국어 낱말이 더 짧고 정확하면(예: 애교살, 留白) 섞는다. 같은 뜻을 두 언어로 겹쳐 쓰지 않는다.
- 사람: 요청이나 첨부 사진에 없는 나이·성별·국적·인종·피부색·체형·얼굴형을 쓰지 않는다. 성별을 모르면 the person, the model로 쓰고 대명사는 they다. 성인임을 밝혀야 할 때만 adult를 쓴다. 어린이·청소년 요청을 성인으로 바꾸지 않고, 미성년 요청에 adult만 덧붙여 통과시키지 않는다. 사람이 없는 요청에는 사람을 넣지 않는다.
- 노출: 요청보다 더 드러내지 않고, 요청하지 않은 성적 연출이나 미성년을 떠올리게 하는 설정을 더하지 않는다.
- 화면 글자: 요청한 문구를 따옴표 안에 한 글자도 바꾸지 않고 한 번씩 쓴다. 위치, 크기 순서, 또렷하게 읽힐 것, 다른 글자는 넣지 않는다는 것을 함께 쓴다.
- 첨부 이미지: 있거나 첨부할 예정일 때만 번호, 역할(편집할 원본, 지킬 제품, 빛만 참고할 이미지, 스케치의 배치만/선화까지 등), 지킬 것과 가져오지 않을 것을 쓴다. 다른 대화용이면 블록 밖에 다시 첨부하라고 한 줄 안내한다. 없으면 reference, same face 같은 말을 쓰지 않는다.
- 쓰지 않는 말: 8K·ultra-detailed 같은 품질 태그, film grain·noise·dust particles(필름 사진을 요청했으면 subtle grain 한 번만, 사용자가 다른 입자 외형을 요청했으면 §3.2.4대로 위치·양을 한정해 한 번), 이유 없는 렌즈 mm, 요청에 없는 브랜드, 모델명·API 설정·로컬 파일 경로, 검수·재시도 절차. 비율은 요청했을 때만 한 번 쓴다.

사람·노출·언어의 정본은 [editorial/portrait-brief.md](editorial/portrait-brief.md) §인물 설정, [editorial-fashion.md](editorial-fashion.md) §노출 수위, [../templates/common.md](../templates/common.md) §프롬프트 언어 결정이다.

## 2. 새 이미지: 무엇을 쓸지

항상 쓴다(요청과 부딪치면 요청을 따른다): 첫 문장에 무엇을 만드는지와 용도, 주인공과 그 행동·상태, 화면 안 위치와 크롭. 사진이면 빛이 오는 방향과 그 빛이 만드는 그림자나 반사.

가장 자세히 쓸 것: 패션은 의상, 뷰티 근접은 요청한 머리·화장이 빛에 보이는 모습, 제품은 윤곽과 재질의 빛 반응, 포스터는 글자 위계와 배치, 그 밖에는 요청에 처음 나온 대상.

사용자가 축을 맡겼으면("알아서", "분위기 있게", 랜덤 요청) 그 축에서 장면에 맞는 것을 하나 고른다. 아래 표에 없는 축(카메라 높이, 색 그레이드, 심도)은 결과를 가를 때만 한 구절로 쓴다. 표의 나머지는 조건이 맞을 때만 쓰고 맞지 않으면 한 단어도 쓰지 않는다.

| 정보 | 쓰는 조건 |
|---|---|
| 배경·장소 | 배경이 보이면 한 구절. 장소가 이야기를 맡을 때만 재료와 시간대까지 |
| 소품 | 손에 쥐었거나 요청한 물건만, 한두 개 |
| 필터·매체(디카, 인스턴트, 빛샘) | 사용자가 말했거나 그 축을 맡겼을 때만 |
| 깨지기 쉬운 곳 | 실제로 있는 것 한두 개(물건을 쥔 손가락, 거울 반사, 작은 글자) |

다음 표는 사람이 나올 때만 쓴다. 동물·사물에는 쓰지 않는다.

| 정보 | 쓰는 조건 |
|---|---|
| 포즈 | 체중이 실린 곳과 손이 닿는 것 |
| 표정·시선 | 얼굴이 읽히는 크기면 시선이 닿는 곳과 눈·입 상태 |
| 의상 | 옷이 보이면 종류 한 구절. 패션이면 구조, 소재, 빛에 드러나는 모습, 주름 순. 스타킹·양말은 요청했거나 다리가 주인공일 때만 비침·광택·솔기로 |
| 헤어·메이크업·네일 | 뷰티 근접이거나 요청했을 때만. 피부 결은 [compiler.md](compiler.md) §피부·재질의 조건일 때만 |

## 3. 새 이미지: 모양

사용자가 형식·제목·순서를 정했으면 그대로 쓴다. 아니면 출발점은 한 문단이고 아래 경우에만 바꾼다.

- 화면 글자가 두 줄 이상이면 그 문구와 위치만 떼어 `TEXT:` 구획으로 쓴다.
- 따로 고칠 만한 정보 덩어리가 셋 이상이고 덩어리마다 두 문장 이상이면 덩어리마다 제목을 단다.
- 제목은 그 덩어리가 다루는 대상의 이름에 콜론을 붙인다(영어 프롬프트면 대문자). 구획 사이는 빈 줄로 띄운다. 제목이 넷 이상이면(`TEXT:`는 세지 않는다) 붙일 수 있는 덩어리를 합친다. 첫 문장(무엇을 만드는지)은 제목 없이 맨 위에 둔다.
- 문장이 하나뿐인 제목, 앞의 사실을 되풀이하는 구획, 금지만 모은 구획은 만들지 않는다.
- 금지는 요청했거나 이 장면에 실제 위험이 있을 때만 관련 문장 뒤에 한 문장으로 쓴다. "no A, no B" 나열이나 `Avoid:` 목록으로 쓰지 않는다.

아래 예시는 모양만 보여 준다. 장면·문장·제목을 결과에 옮기지 않는다.

한 문단:
```text
A candid photo of a person repotting a fern at a kitchen counter, framed from the waist up with the pot at lower right. They lean on the left forearm while the right hand presses soil around the roots, eyes on the pot. Morning light from a window at camera left lights the fronds and casts leaf shadows across the tiles.
```

글자만 떼어 낸 모양:
```text
A flat illustrated flyer for a neighborhood bike repair day: one bicycle wheel leans against a brick step in the upper half, with plain open space below.

TEXT: "FIX IT SATURDAY" large and centered under the wheel, and "Bring your bike, 10 am" small beneath it, each appearing once in crisp, legible letters. No other text.
```

덩어리 셋:
```text
A magazine photo of a beekeeper lifting a honeycomb frame from a hive in a field.

FRAME AND BEES: Both gloved hands hold the frame at chest height, tilted toward the camera. Capped comb covers most of it, and a few bees walk along the lower edge.

VEIL AND SMOKE: The mesh veil shades the face but keeps the eyes readable. A thin line of smoke drifts from a can on the hive lid.

LOW SUN: Late sun from behind the hive turns the wax amber and rims the veil. The grass behind blurs.
```

## 4. 원본 편집

세 가지를 쓴다. 바꿀 대상과 위치, 바뀐 뒤의 모습, 지킬 것. 지킬 것에는 사용자가 말한 것 전부와 바뀌면 티 나는 것 한두 개(얼굴, 제품 형태, 원본 크롭, 빛 방향)를 넣는다.

- 바꾸라고 한 것은 지킬 것에 넣지 않는다.
- 요청하지 않은 연출·조명·피부결·그레인·소품을 더하지 않고, 사진에 보이는 외형을 다시 묘사하지 않는다.
- 로컬 파일 경로를 첨부 대신 쓰지 않는다. 픽셀 단위로 같게 남는다고 약속하지 않는다(꼭 필요하면 합성 경로를 쓰고 생성과 구분한다).
- 사진 속 사람 수를 모르면 단수·복수를 정하지 말고 the subject로 쓴다.
- 이어지는 편집이면 직전에 마음에 든 결과를 원본으로 삼고 이번에 바꿀 것만 쓴다. 서로 독립한 여러 컷은 각각 원본에서 시작한다.
- 바꿀 곳이 셋 이상이면 `EDIT TARGETS:`와 `PRESERVE:` 두 구획으로 나누고 금지 문장은 `PRESERVE:` 안에 둔다. 아니면 한 문단으로 쓴다.

예시(한 문단, 모양만 본다):
```text
Edit the attached photo. Remove only the paper cup on the bench beside the subject and continue the wooden slats where it stood. Keep the subject and the original crop unchanged.
```

## 5. 내기 전에 확인

새로 쓴 문안에만 적용한다.

1. 요청에 없는 나이·성별·국적·인종·피부색·체형·얼굴형이 있는가? 있으면 지운다.
2. 요청한 문구·수량·비율·지킬 것이 모두 그대로 있는가?
3. 요청한 대상이 크롭 안에 있고, 광택·반사를 요청했으면 그것을 만드는 빛이 있는가?
4. 지워도 그림이 같은 문장이나 제목이 있는가? 있으면 지운다.
5. 예시의 장면·문장·제목을 옮겨 왔는가? 그랬다면 다시 쓴다.

## 6. 더 읽을 때

입자·잔머리 문제는 [surface-contracts.md](surface-contracts.md) §3.2.4, 라틴 낱자 철자·한글 글자·픽셀 보존·투명 배경은 같은 파일 §3.2.3, 사람·제품 참조의 보존 축은 [editorial/portrait-brief.md](editorial/portrait-brief.md) §참조 분기, 스타일링 어휘는 [editorial/styling-details.md](editorial/styling-details.md).
