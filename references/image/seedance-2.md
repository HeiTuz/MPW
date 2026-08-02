# Seedance 2.0 멀티모달 영상 어댑터

## 적용 경계

이 문서는 **BytePlus ModelArk direct의 Dreamina Seedance 2.0 series** 프롬프트 문법을 정본으로 삼는다. Higgsfield의 `seedance_2_0`·`seedance_2_0_mini`는 별도 S2 모델 id이므로, 미디어 롤·파라미터·입력 상한은 그 런타임 정의를 우선한다. 공식 문법의 적용 가능성이 확인되지 않은 래퍼에 ModelArk 파라미터를 복사하지 않는다. 외부 사실과 확인일은 [surfaces.md](surfaces.md) §7이 정본이다.

**Seedance 2.5는 이 문서의 별칭이 아니다.** 공식 ModelArk 모델 id·API·프롬프트 계약이 확인되기 전에는 2.0 규칙, 길이, 미디어 상한을 자동 상속하지 않는다.

## 작업 분기

프롬프트를 쓰기 전에 작업을 하나로 고정한다.

| 작업 | 핵심 계약 |
|---|---|
| 신규 멀티모달 생성 | 각 자산에서 가져올 축을 지정해 새 영상을 생성 |
| 영상 편집 | 기준 `Video N`의 타임라인을 유지하고 지정 요소만 추가·제거·교체 |
| 영상 연장 | `Video N` 앞 또는 뒤에 이어질 새 사건을 기술 |
| 트랙 연결 | 입력 영상 순서와 전환 사건을 명시해 하나의 연속 흐름으로 연결 |

서로 다른 작업을 한 문단에 섞지 않는다. 편집과 연장이 모두 필요하면 단계별 프롬프트로 나눈다.

## 레퍼런스 권한 지도

업로드 순서와 같은 번호를 사용하고 각 자산에서 가져올 차원을 하나씩 선언한다.

| 자산 | 대표 권한 |
|---|---|
| `Image N` | 피사체·의상·제품·장면·구도 |
| `Video N` | 행동·카메라 움직임·스타일·특수효과·사운드 효과 |
| `Audio N` | 음색·리듬·분위기·발화 특성 |

하나의 이미지에 인물이 여러 명이면 대상마다 2–3개의 안정적인 정적 특징(의상·헤어·위치·소품)을 붙여 고유 이름을 정의한다. 이후 같은 이름과 같은 `Image N` 대응을 유지한다.

```text
Define the woman in Image 1 wearing a cobalt coat, a blunt black bob, and silver hoop earrings as Mina. Use Mina's appearance from Image 1, the handheld forward-tracking camera movement from Video 1, and the low warm voice timbre from Audio 1.
```

`reference this`·`make it similar`처럼 전달 축이 없는 표현은 쓰지 않는다. 입력 자산 전체를 재묘사하지 않고 어떤 축을 잠그는지만 말한다.

## 신규 생성

기본 조립 순서는 다음이다.

```text
precise subject + action details + scene/environment + lighting/color + camera movement + visual style + observable quality + necessary constraints
```

먼저 “누가 무엇을 하는가”를 고정하고, 공간과 분위기, 촬영 방식, 시간 순서를 붙인다. 한 씬의 지배 행동과 지배 카메라 모션은 각각 하나를 우선한다. 복합 사건은 `Shot 1`, `Shot 2`처럼 시간 순서로 분리한다.

## 영상 편집

편집 기준 영상과 바꿀 범위를 먼저 쓴다. 언급하지 않은 영역을 재창작 대상으로 열지 않는다.

```text
Add: At [timestamp/timing] and [spatial location] in Video N, add [element and behavior].
Remove: Remove [element] from Video N, keeping the remaining timeline, motion, camera work, lighting, and audio unchanged.
Replace: Replace [source element] in Video N with [target element from Image N], preserving the original motion, timing, camera work, and scene interaction.
```

`strictly edit Video N`이 기준 영상의 소유권을 잠그고, 다른 자산은 지정 축만 공급한다. 여러 편집은 시간·공간 위치가 겹치지 않을 때만 한 프롬프트에 둔다.

## 영상 연장·트랙 연결

연장은 방향과 새 사건을 함께 쓴다.

```text
Extend Video 1 forward: after the door closes, the camera holds on the empty hallway as the ceiling lights switch off one by one.
```

```text
Generate content before Video 1: begin with an over-the-shoulder shot of the same man entering the room, then connect seamlessly to Video 1.
```

트랙 연결은 입력 순서와 전환 사건을 명시한다.

```text
Video 1. When the falling leaf touches the ground, it bursts into golden particles. The particles fill the frame and resolve into the opening composition of Video 2.
```

단일 공간에서 이어지는 대화·감정 진행·한 경로 이동은 연장을 우선한다. 사건 전환·추격·격투·몽타주처럼 시간 구조가 크게 바뀌면 씬을 별도 생성해 연결한다.

## 대사·오디오·텍스트

- 대사는 화자·감정·언어를 명시하고 정확 문자열을 큰따옴표로 감싼다.
- 음색 레퍼런스는 `Audio N`의 번호와 관찰 가능한 음성 특징을 함께 쓴다.
- 자막·슬로건·말풍선이 필요하면 문자열, 등장 시점, 위치, 등장 방식, 시각 속성을 지정한다.
- 오디오 생성 on/off는 `generate_audio` 파라미터다. 프롬프트에는 대사·SFX·앰비언스의 내용만 둔다.

## 공식 실패 제약 예외

영상 레인의 기본값은 긍정형·명사형 배제지만, **ModelArk direct Seedance 2.0 공식 가이드가 특정 실패를 교정하기 위해 권장하는 짧은 결과 제약은 허용한다.** 이 예외를 다른 엔진의 범용 네거티브 정책으로 확장하지 않는다.

- 불필요한 자막: `Keep it subtitle-free. Avoid generating any text or subtitles.`
- 로고·워터마크: `Do not generate logos or watermarks.`
- 중복 인물: 인물별 `Image N` 대응을 먼저 고정하고, 마지막에 같은 외형·의상·액세서리를 가진 복제 인물이 같은 프레임에 나타나지 않도록 짧게 제한한다.
- 스타일 드리프트: 금지문을 늘리기보다 목표 스타일을 화면 결과로 다시 잠근다. 필요하면 먼저 참조 이미지를 목표 스타일로 변환한다.

중복 인물 교정에서는 독립적인 1인 참조를 우선한다. 여러 사람이 있는 사진이나 한 장에 여러 각도를 모은 시트는 대상 대응을 흔들 수 있다. 전체 대본을 그대로 붙이지 않고 현재 생성 구간에 필요한 사건만 남긴다.

## 표면·입력 게이트

ModelArk direct에서는 아래 조합을 프롬프트 작성 전에 확인한다. 값과 확인일의 정본은 [surfaces.md](surfaces.md) §7이다.

- 멀티모달 reference와 strict first/last-frame 모드는 API 시나리오가 다르다. 직접 혼용하지 않는다.
- 오디오만 단독 입력하지 않는다. 참조 이미지 또는 영상이 최소 하나 필요하다.
- 실제 인물 얼굴이 포함된 참조 이미지·영상을 일반 URL/Base64 입력으로 직접 보내지 않는다. ModelArk가 허용하는 신뢰된 Seedance/Seedream 원본 출력, 프리셋 디지털 캐릭터, 또는 권리 확인을 거쳐 등록된 실인물 자산 경로 중 해당 계정에 실제로 열린 방법을 사용한다. 어느 경로도 없으면 입력 게이트 실패다.
- 미디어 번호는 실제 전송 순서와 일치한다.
- 프롬프트 권장 길이는 표면별 엔진 예산을 따르고 단어 수로 실측한다.
- 해상도·비율·duration·오디오 on/off는 API 파라미터로 넘기고 산문에 반복하지 않는다.

## 판정

- 작업이 신규 생성·편집·연장·연결 중 하나로 고정됐는가.
- 모든 `Image N`·`Video N`·`Audio N`에 실제 입력이 있고 권한 축이 선언됐는가.
- 인물 이름과 참조 번호가 전 구간에서 일관되는가.
- 시간 순서, 지배 행동, 카메라 움직임이 서로 충돌하지 않는가.
- 편집 프롬프트가 기준 영상의 보존 범위를 명시하는가.
- 공식 실패 제약 예외가 실제 관측 실패에만 좁게 사용됐는가.
- 2.5 미확인 기능을 2.0 규칙으로 추정하지 않았는가.
