# Ghost Character Reference Sheet — 프롬프트 양식

사용자가 제공한 고스트 캐릭터시트 명세(v1.0)를 MPW의 **프롬프트 작성** 흐름에 맞게 재서술한 양식이다. 원문을 옮겨 싣지 않았다. 이미지 모델 성능을 보장하는 문서가 아니다.

## 1. 적용과 납품

- 캐릭터시트·캐릭터 시트·character reference sheet의 양식은 이 절이 아래 순서로 정한다. 어느 경우든 엔진 문법·파라미터는 해당 엔진 문서를 따른다.
  1. 사용자가 구도(고스트 시트·턴어라운드·1×4·얼굴 각도표·패널 수·기존 양식)를 지정하면 그 구도를 쓴다. 그 구도를 다루는 엔진 전용 문서가 있으면 작성 규칙도 그 문서가 정한다: Midjourney는 [midjourney-character-sheets.md](../midjourney-character-sheets.md), Seedream 베이스·1×4 턴어라운드는 [seedream-character-reference-sheets.md](seedream-character-reference-sheets.md).
  2. 구도 지정이 없고 대상 엔진이 Midjourney이면 [midjourney-character-sheets.md](../midjourney-character-sheets.md)의 기본 순서를 쓴다.
  3. 그 밖의 경우 이 3패널 양식이 기본이다. 단, 참조 이미지 없이 새 캐릭터를 설계하는 시트는 원본 근거를 옮기는 이 양식의 대상이 아니며 일반 이미지 프롬프트로 작성한다.
- 완성 프롬프트는 컴파일 형식이 아닌 네이티브 자연어 브리프다([surface-contracts.md](surface-contracts.md) §3.1). 3:2 가로(미지원이면 16:9)는 본문에 쓰지 않고 표면의 비율 레버로 전달한다. 전달할 레버가 없는 붙여넣기 표면에서만 `wide landscape`를 본문에 남긴다.
- MPW는 실제 입력을 연결한 **영어 생성 프롬프트 한 블록**과 한국어 출처·한계 메모를 낸다. 프롬프트 작성 요청만으로 이미지를 생성하거나 재생성하지 않는다. 재사용 양식 요청에는 가변 슬롯을 남겨도 된다. 첨부가 없으면 아래 양식을 제공하고 이미지를 관찰했다고 주장하지 않는다.
- 생성까지 요청받은 경우에만 사용 가능한 생성 경로로 넘긴다. 도구·파라미터·비율·길이 지원은 [surfaces.md](surfaces.md), 실제 참조 연결은 [from-image.md](from-image.md)를 따른다. 지원하지 않는 입력 연결을 가능하다고 쓰지 않는다.
- 원 명세는 별도의 상위 캐릭터 레퍼런스 팩 명세(v5.2)에 붙는 애드온이며, 그 상위 명세는 이 레포에 없다. 사용자가 상위 명세를 함께 제공하면 그 규칙을 따르되, 후면 원본이 없을 때 CENTER를 추정해 그리는 허용만 이 양식의 예외로 유지한다. 제공되지 않으면 이 문서만으로 작성하고 상위 명세를 확인했다고 쓰지 않는다. 이 시트는 full-character/wardrobe 원본 참조를 대체하지 않는다.

## 2. 입력 판정과 분기

첨부 전부를 직접 보고 각 이미지에 실제 연결 가능한 ID를 부여한다. ID의 순서는 식별용이며 역할 판정 근거가 아니다. 얼굴 가시성·방향·신체의 보이는 범위·의상·장신구·가림·품질과 identity/wardrobe/full-character 근거 강도(LOW/MEDIUM/HIGH)를 기록한다. 역할은 IDENTITY_CANDIDATE / WARDROBE_CANDIDATE / FULL_CHARACTER_CANDIDATE / SUPPORTING_REFERENCE / AMBIGUOUS 중 복수 지정할 수 있다.

업로드 순서·파일명·사용자 라벨만으로 역할을 확정하지 않는다. 사용자가 지정한 역할은 존중하되 실제 근거가 부족하면 부족하다고 남긴다. 얼굴이 보인다는 이유만으로 의상 모델을 얼굴 기준으로 승격하지 않는다. 한 이미지가 여러 근거를 제공할 수 있다.

각 축의 가장 강한 근거를 선택한다: Identity Source(얼굴·헤어), Wardrobe Source(의상), Body Source Front(실제 정면 착용 신체), Rear Source(실제 후면, 선택). 서로 다른 얼굴·충돌하는 의상을 섞지 않는다. 가장 강한 단일 기준을 선택하고 충돌을 밝힌다. 같은 인물이라고 지정된 이미지가 명백히 다른 사람이며 기준 선택을 바꾸는 충돌이면 확인한다. 다른 작은 빈칸은 관찰로 처리한다.

| 입력 | LEFT의 신체 기준 | Case |
|---|---|---|
| 얼굴 + 의상 착용 사진 | 의상 착용자의 정면 신체. 그 얼굴은 사용하지 않음 | 1 |
| 얼굴 + 의류 단독/마네킹 사진, 또는 사용자가 착용자 체형 사용 금지 | 일반 중립 전시 신체. 얼굴에서 체형 추론 금지 | 2 |
| 얼굴·의상·신체가 함께 보이는 이미지 | 같은 이미지의 실제 정면 | 3 |
| 다중·부분·후면 포함 등 | 패널별 근거를 위 원칙으로 판정 | 4 |

| 패널 | 상태 선택 |
|---|---|
| LEFT | 실제 정면 신체+의상: GENERATED. Case 2: COMPOSITE-DERIVED. 의상 또는 필요한 정면 근거 부족: UNAVAILABLE |
| CENTER | 실제 후면: GENERATED. 일부만 실제 후면: INFERRED(실제 근거 영역 별도 명시). 후면 없음: INFERRED. 추정 최소 입력 부족: UNAVAILABLE |
| RIGHT | 충분한 얼굴 근거: GENERATED. 부족: UNAVAILABLE |

CENTER 추정의 최소 입력은 의상 근거 + 정면 신체 기준(또는 Case 2 전시 신체) + 헤어 근거다. 완전한 후면 원본이 있는 경우 이 추정용 최소 조건을 기계적으로 요구하지 않는다. 부분 후면의 나머지를 채울 최소 근거가 없으면 보이는 범위만 유지하고 한계를 보고한다. 후면의 헤어/의상이 선택 기준과 충돌하면 그 후면을 무시하고 추정 분기로 간다. UNAVAILABLE 패널은 위치를 유지한 빈 회색 영역이다.

## 3. 양식 조립 규칙

아래 슬롯은 관찰한 값 또는 실제 연결된 참조 표현으로 채운다. 완성 프롬프트에는 조건문·미해결 슬롯을 남기지 않고 각 패널에 맞는 분기만 넣는다.

- `SOURCE_MAP`: 각 실제 이미지 ID와 권한. 얼굴/헤어는 Identity, 의상은 Wardrobe, 신체는 Front Body가 정한다. 참조 ID는 모델에 전달된 이미지와 대응해야 한다.
- `MEDIUM`: 원본 사진 또는 원본 일러스트 스타일. 새 스타일을 만들지 않는다.
- `FRONT_BODY_AND_CROP`: 정면 신체 기준 또는 Case 2 중립 전시 신체와 **관찰 가능한 범위**. 잘린 원본은 패널 가장자리에서 같은 범위로 끝낸다. 보이지 않는 다리·손·신발·밑단을 추가하지 않는다. Case 2도 공급된 의류만 표시하고 필요한 영역만 크롭한다. 옷을 추가하거나 얼굴에서 키·체형을 추론하지 않는다.
- `FRONT_POSE`: 중립 정면 자세. 손·소매 안쪽·가린 면을 발명해야 자세를 바꿀 수 있다면 해당 팔다리의 원본 자세를 유지한다. 실제 측면/후면 신체를 정면으로 돌려 만들지 않는다.
- `REAR_EVIDENCE`: 후면 원본이 있으면 보이는 부분을 그대로 유지한다. 추정 영역만 plain continuation을 허용한다. 같은 신체 비율·색·소재·실루엣·길이·밑단과 기존 소매·깃을 이어 그린다. 모르는 뒤판은 평범한 무장식 면이다. 앞에서 구조가 명확히 이어지는 후드·스트랩 등만 유지한다. 새로운 로고·프린트·주머니·지퍼·단추·벨트·트임·패널·장식은 금지한다. 신발은 앞에서 확인된 같은 신발의 단순한 뒤꿈치/뒤축만 표현한다.
- `REAR_HAIR`: 얼굴 기준의 색·길이·질감·부피·가르마를 가장 평범하게 이어 그린다. 원본에 없는 묶음·땋음·번·언더컷·염색·장신구를 추가하지 않는다. 목·목덜미는 얼굴 기준 피부색이며 새 점·문신은 없다. 추정 후면은 얼굴을 전혀 보이지 않는다. 실제 후면 원본에 보이는 미세 윤곽만 보존할 수 있고 확대해 얼굴을 만들지 않는다.
- `IDENTITY_VIEW`: 얼굴 기준의 실제 방향·표정·나이감·피부·식별점을 유지한다. 비정면 얼굴을 회전해 안 보이는 기하를 만들지 않는다. 미소 제거 등으로 얼굴을 바꾸지 않으며 가능한 범위만 중립화한다. 상반신 의상은 Wardrobe 기준이고 표시 목적일 뿐 의상 권한은 없다. 목선이 불명확하면 확인 가능한 크롭으로 제한하고 새 목선을 발명하지 않는다.
- 장신구: LEFT의 머리 부착물과 목걸이·초커·펜던트는 아래로 늘어진 부분까지 제거한다. 확인된 시계·팔찌·벨트·몸 스트랩은 유지한다. CENTER는 실제로 뒷면에서 보일 근거가 있는 것만, RIGHT는 얼굴 원본의 안경·귀걸이·헤어 장신구와 identity 소유가 확인된 목 장신구만 유지한다. 몸 장신구는 bust에 표시하지 않는다. 보이지 않음은 부재나 다른 참조로의 소유 이전을 뜻하지 않는다.
- 원문의 “글자·로고 없음”은 시트에 새로 추가하는 표시를 금지한다. 원본 의류에 이미 있는 글자·로고는 의상 보존을 우선한다. 제거 요청이 따로 있으면 따른다. 뒤판에 새 로고를 만들 수 있다는 뜻은 아니다.
- LEFT/CENTER는 같은 스케일·어깨 높이와 (발이 보이면) 발 기준선, 부분 크롭이면 동일한 하단 크롭 기준을 쓴다. LEFT를 늘려 머리 빈자리를 채우지 않는다. 전신 요구보다 원본의 가시 범위가 우선이다.
- 넓은 목선의 노출 쇄골·가슴은 보존한다. “목선 안쪽은 의류만”은 실제 의류 개구부의 안쪽 면에 한정한다. 원본에 없는 안감·칼라·목선 구조를 만들어 피부를 가리지 않는다.

## 4. 생성 프롬프트 골격

UNAVAILABLE 패널은 해당 패널 본문 전체를 `Leave the [LEFT/CENTER/RIGHT] zone entirely empty, showing only the same flat neutral gray background, with no figure, outline, icon or placeholder.`로 교체한다. 다른 패널은 이동하지 않는다. 후면 추정 규칙은 실제 추정 영역이 있는 경우에만 조립한다.

```text
Create ONE wide landscape character reference sheet. Reference authority: <<SOURCE_MAP>>.

<<MEDIUM>>, continuous flat neutral mid-gray background, soft even lighting. Three equal-width zones with clear gray margins: LEFT front identity-blocked figure; CENTER rear figure; RIGHT identity bust. The sheet holds only these three figures on the plain background. Preserve original garment markings. No redesign or beautification.

LEFT: <<FRONT_BODY_AND_CROP>>. <<FRONT_POSE>>. Preserve exactly the clothing, construction, fit, colors, materials and supplied footwear/legwear in <<WARDROBE_SOURCE>>. The body's upper boundary follows the upper edge of the clavicles; gray background appears above it. Head, hair, ears, entire neck and all head/neck accessories, including hanging portions, are absent. Preserve shoulders, clavicles, exposed chest and ALL garments, including collars, cowls, high necks, straps and lapels above that boundary. Keep only source-consistent surfaces within actual garment openings; no invented lining covering bare chest. The boundary reads as a clean garment-display edge.

CENTER: Direct rear view. <<REAR_EVIDENCE>>. <<REAR_HAIR>>. Head, hair, neck and nape remain present. <<REAR_FACE_VISIBILITY>>. Match LEFT's proportions, scale, shoulder height and supported lower framing/feet baseline. Same wardrobe; no new distinctive rear details.

RIGHT: Chest-up bust from <<IDENTITY_SOURCE>>. <<IDENTITY_VIEW>>. Preserve facial geometry, age, skin, marks, hair and identity-owned accessories. Wear the supported upper garment of <<WARDROBE_SOURCE>>. Keep the source's makeup, skin texture, apparent age, ethnicity and gender as seen.

Only source-supported regions, except specified plain rear continuation. Never extend cropped sources into unseen limbs or shoes. Keep unavailable zones empty gray, without outlines/placeholders; never move other panels into them.
```

`REAR_FACE_VISIBILITY`는 추정 후면이면 `No face, cheek, jaw or eye is visible.`, 실제 후면이면 `Preserve only any minor contour actually visible in the rear source; reveal no additional facial features.`로 쓴다. 원문에서 금지한 해부·공포를 유도하는 머리 제거 표현 대신 LEFT의 보이는 경계와 보존 의류를 긍정형으로 기술한다.

길이 상한이 있는 채널([surfaces.md](surfaces.md) §0-1)에서 넘치면 슬롯 안의 반복 서술과 보조 금지문부터 줄인다. 패널 배치, LEFT 경계, 참조 권한(`SOURCE_MAP`), UNAVAILABLE 처리는 줄이지 않는다.

## 5. 출처 메모와 검수

프롬프트 납품 메모에는 Case, Identity/Wardrobe/Front Body/Rear 기준과 확신, 패널별 **계획 상태**, UNKNOWN 범위·충돌, `이미지 미생성 / 시각 QC 미실시`를 적는다. 재사용 양식만 만들었다면 출처와 상태는 입력 후 결정이라고 한다. GENERATED는 계획값이며 실제 생성 완료 주장이 아니다.

생성도 수행한 경우에만 실제 결과를 원본과 대조한다. 실패 코드는 A 목 잔여/절단면, B 목선 훼손, C 머리 잔여, D 어깨·쇄골 훼손, E 후면 얼굴/과잉 추정, F 의상 변경, G 얼굴 변경, H 순서/수량, I 빈 패널 채움, J 추가 글자/장식, K 해부·공포, L 크기 불일치, M 근거 없는 신체 확장, N 앞뒤 머리 상태 전파다. 기존 의류 표시는 J 실패가 아니다.

실제 생성까지 승인된 실행에서 실패가 있으면 해당 결함만 교정하는 보존 지시로 최대 2회 재시도한다. 알 수 없는 잡 상태를 새 작업으로 대체하거나 새 비용·권한 경계를 넘지 않는다. 여전히 실패하면 최선 결과와 남은 코드를 보고하며 PASS로 부르지 않는다. 생성 후에는 이미지 먼저, 위 출처 정보·실제 패널 상태·한계·충돌·QC 결과·재시도 횟수를 짧게 붙인다.

추정 후면은 INFERRED이며 신체·의복 구조·헤어·연속성의 사실 근거가 아니다. COMPOSITE-DERIVED 전시 신체도 실제 체형 권한이 없다. 생성 결과로 원본에 없던 정보가 있었다고 입증하지 않는다. 모든 생성 시트는 사용자 명시 승인 전 UNAPPROVED이며 canonical reference로 승격하지 않는다.
