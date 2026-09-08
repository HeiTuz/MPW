# 영상 프롬프트 작업 예시와 하네스 인계

필요할 때만 로드한다. 규칙은 [lanes.md](lanes.md) §영상 공통 규칙, 입력/설정/길이는 [surfaces.md](surfaces.md), 모델 선택은 [model-routing.md](model-routing.md)가 소유한다. 이 문서는 슬롯 의무나 새 API 스키마를 만들지 않는다.

## 필요한 절만 선택

- 참조가 여럿이거나 모드가 바뀜 → §참조 역할을 나누는 예
- 이미지에서 동작을 시작함 → §시작 이미지와 움직임을 나누는 예
- 대사·음향 요청 → §화자와 사건을 연결하는 예
- 연출이 밋밋하거나 다른 콘셉트 요청 → §추상적인 주문을 연출로 바꾸는 예
- 결과가 의도와 다름 → §결과를 보고 수정하는 예
- 제작기로 전달하거나 생성 비교 → §제작 하네스에서 소비하는 방법·§비교 검수 예

## 참조 역할을 나누는 예

목표: 같은 인물 외형으로 새 장면을 만들되 참조 영상에서는 카메라 이동만 사용한다. 아래는 외형·카메라 참조를 허용하는 표면을 선택하고 실제 파일 대응을 확인한 경우의 자연어 예다. `Image 1`·`Video 1`은 공통 API 필드가 아니며, 구체 문법은 해당 엔진 참조를 따른다.

```text
Use Image 1 for the character's appearance and clothing. Use Video 1 for the camera's lateral movement only. The character stands beside a display table and turns her head toward the lens. A pale gallery wall is behind the table.
```

기록 예: 이미지=외형, 영상=카메라 이동, 본문=새 행동·장소. I2V로 변경하면 이미지가 첫 화면을 결정하는지부터 다시 판정한다. 이 예에 맞추려고 사용자가 고른 모델을 임의 교체하지 않는다.

## 시작 이미지와 움직임을 나누는 예

목표: 손이 카메라 밑면을 받치는 순간이 읽히는 시연 컷. I2V 시작 이미지에서 카메라는 손바닥 바로 위에 있고, 손과 밑면이 보이는지 먼저 확인한다. 이미 손바닥에 놓여 있거나 손이 잘렸다면 입력 수정이 먼저다. 이미지의 의상·배경을 다시 나열할 필요는 없다.

```text
The right hand gently lowers the camera onto the open left palm, stopping when the flat base rests on it. Both hands and the camera base remain visible. The camera view stays fixed; the existing clothing and camera details remain consistent.
```

모델·시작 이미지·길이·해상도는 해당 표면의 설정으로 별도 전달한다. 위 문장은 일반 작성 예시이며 특정 모델에서 성공을 실측한 프롬프트가 아니다. 촬영 카메라와 소품 카메라가 혼동되면 `camera view`와 물체 식별 표현을 조정한다.

## 새로 등장하는 대상이 있는 예

시작 이미지에 빈 책상이 있고 프레임 밖의 손이 물체를 놓는 요청이라면, 새 대상에 필요한 시각 정보를 써야 한다.

```text
An adult hand enters from the right and sets a small brass key on the center of the table, then withdraws. The key settles flat and remains in view. Locked overhead view.
```

T2V로 바꾸면 책상·공간·빛 등 이미지가 맡던 조건 중 실제 필요한 내용도 함께 작성한다. 모드만 바꾸고 동일 문장을 무조건 재사용하지 않는다.

## 화자와 사건을 연결하는 예

목표: 오디오 지원 모드에서 Mina가 말한 뒤 사진의 한 부분을 가리킨다. 화자와 참조 인물이 연결되어 있고, 사용자가 대사·현장음을 요청한 상황이다.

```text
Mina looks at the print and says: 이 부분을 봐주세요. After speaking, she points to its lower corner. Audio: quiet room tone and a soft rustle of paper as her hand moves.
```

대사 문법은 해당 표면에 맞춘다. 검수에서는 말한 인물·정확한 대사·가리키는 시점을 각각 확인한다. 위 예문은 한국어 발음이나 입 모양의 품질을 실측한 결과가 아니다.

## 추상적인 주문을 연출로 바꾸는 예

[lanes.md](lanes.md) §연출을 고르는 기준을 적용한 작성 예다. 특정 엔진에서 생성·비교한 결과가 아니다. 아래는 서로 다른 브리프이며, 한 요청에 전부 붙이거나 고정 템플릿으로 쓰지 않는다. 실제 실행에서는 선택한 표면의 설정과 문법에 맞춘다.

### 소재를 행동으로 보여주는 패션 컷

요청 예: “이 코트 사진을 영상으로. 몸을 틀 때 원단 무게가 느껴지게, 카메라는 고정.” 시작 사진에서 인물과 코트 밑단이 보이고 회전할 공간이 있다는 전제다. `luxury, cinematic, flowing fabric`을 쌓는 대신 몸과 옷이 멈추는 시차를 선택했다.

```text
With her feet planted, she turns her upper body to the left and stops. The coat hem follows a moment later, swings once, then settles against her legs. The camera stays fixed, keeping the hem in view. Preserve the coat's cut, closures, and fabric color.
```

화면에 없는 원단이나 강풍을 추가하지 않았다. 납품 전에는 몸의 회전과 옷자락의 반응이 이어지는지, 코트 구조가 보존되는지 영상에서 확인해야 한다.

### 새 콘셉트는 관객이 발견하는 순서를 바꾸기

요청 예: “코트 광고를 아예 다른 콘셉트로. 새 장소·구도도 가능.” 첫 예가 소재의 반응을 보는 컷이라면 이번은 코트가 주인 없는 물건처럼 보이다가 착용자가 드러나는 T2V 컷이다. 장소·프레이밍을 바꿀 권한이 없는 부분 수정에는 쓰지 않는다.

```text
A black wool coat appears to hang alone behind a narrow gap between two concrete walls in a stark gallery. The camera slides sideways past the near wall, revealing an adult woman already wearing the coat, her face initially hidden by the wall. As her face comes into view, she turns her eyes toward the lens. The camera settles on her and the coat, framed by the gap.
```

인물이 새로 생기는 변신이 아니라 전경의 가림이 풀리는 공개다. 제품 원본을 보존하는 작업이라면 이 자유 기획의 외형을 그대로 적용하지 말고, 실제 제품 참조가 가능한 입력 모드로 옮긴다.

### 움직이지 않는 선택도 연출

요청 예: “창가 인물 사진. 얼굴과 자세 그대로, 조용히 커튼만 움직여.” 인물과 커튼이 보이는 I2V 입력을 전제로 한다.

```text
The curtain beside the seated person gently lifts toward the window, then drifts back. The person keeps the same pose and expression. The camera remains locked in the original framing.
```

카메라 접근·눈 맞춤·반전을 넣지 않아야 이 요청을 지킨 것이다. 앞의 두 예처럼 공개나 소재 시연을 자동 적용하면 실패다.

### 작성 결과를 검토할 경계 사례

아래는 사람이 새 작성본을 읽고 판단하는 사례다. 특정 단어 포함 여부를 검사하는 자동 점수나 실제 생성 품질 테스트가 아니다.

| 입력 요청 | 통과하는 판단 | 실패하는 판단 |
|---|---|---|
| “같은 장면, 카메라만 고정으로” | 카메라 문구와 직접 충돌하는 부분만 수정 | 사건·소품·빛까지 새로 기획 |
| “카메라가 다가가도 손의 접촉이 보여야 해” | 끝 구도에서도 접촉 부위를 읽을 수 있게 서술 | 눈 클로즈업을 덧붙여 손을 화면 밖으로 밀어냄 |
| “새 콘셉트, 장소도 자유” | 기존 안과 다른 사건 또는 공개 방식을 선택 | 같은 걷기·줌에 색·렌즈·품질 형용사만 교체 |
| “물방울이 위로 떨어지는 초현실 컷” | 요청한 역방향 움직임과 주변 반응을 구성 | 물리적 자연스러움을 이유로 아래로 수정 |
| “걷는 도중 다음 컷으로 이어져” | 화면상 진행 방향과 계속되는 걸음을 유지 | 모든 예를 따라 마지막에 멈추고 렌즈를 응시 |
| “시작 사진에는 손만, 열쇠를 놓는 장면” | 열쇠가 어디서 어떻게 들어오는지와 형태 보충 | I2V는 외형 묘사를 금한다며 새 물체 설명 삭제 |

## 결과를 보고 수정하는 예

| 관측한 실패 | 다음에 확인할 것 | 수정 범위 예 |
|---|---|---|
| 물체가 움직이지 않음 | 시작 사진에 이미 도착 상태가 있는가 | 시작 프레임 교체 후 같은 동작 지시 비교 |
| 피사체 대신 화면 전체가 이동 | 피사체 이동과 촬영 시점이 구분되는가 | 카메라 지시만 명확히 |
| 장면이 중간에 바뀜 | 전환 표현·행동 수와 가용 시간이 충돌하는가 | 불필요한 전환 제거 또는 지원되는 길이/분할 |
| 손·소품이 바뀜 | 입력에서 필요한 형태가 보이고 식별되는가 | 기준 이미지/보존 축을 재검토 |
| 프롬프트를 고쳐도 같은 움직임이 반복됨 | 입력의 흐림·먼지·자세가 그 동작을 암시하는가 | 입력 단서 수정 또는 시작 이미지 교체 |
| 말하는 사람이나 행동 대상이 바뀜 | 이름·참조·대사·물체 대응이 모호한가 | 화자/대상 대응만 명확히 |
| 끝 자세가 편집에 쓰기 어려움 | 필요한 도착 상태가 정의됐는가 | 끝 행동·정지 또는 지원되는 끝 프레임 검토 |
| 원본 세부가 재해석됨 | 생성적 변화가 필요한 샷인가 | 원본 기반 편집·마스크·그래픽 움직임도 비교 |
| 검토 문장과 결과 작업 기록이 다름 | 실행기가 고정 접두·접미를 붙였는가 | 실제 전송 문장을 다시 검토 |

## 제작 하네스에서 소비하는 방법

[lanes.md](lanes.md) §영상 공통 규칙의 인계 원칙을 적용한 기록 예다. 기존 제작 스키마에 대응되는 필드가 있다면 다음 정보를 담는 방식이 가능하다.

| 기록 예 | 용도 |
|---|---|
| `shot_id`, 표면/모드, 입력 역할과 파일 해시 | 검토 대상 샷과 자료 식별 |
| 설정, 최종 문장과 해시, 지침 파일/해시 | 작성에 사용한 조건과 인계 내용 비교 |
| 검토 내용·수정 이유, 영상 품질·사실 검수 상태 | 문장 검토와 결과 검수를 구별 |

예를 들어 dry-run에 접미 문구가 추가되어 있다면 검토본과 전송본의 차이를 확인할 수 있다. 반대로 패키지에 지침 파일과 해시가 들어 있다는 사실만으로 실제 프롬프트 검토를 수행했다고 판정할 수는 없다. 이 예는 새 필수 스키마나 영상 재생성 요청이 아니다.

## 비교 검수 예

예: “손이 물체를 내려놓고 접촉한 상태에서 멈춤”을 필수 사건으로 정한 뒤, 방향 설명만 다른 두 문장을 같은 입력·모델·설정에서 비교한다. 이 비교에서는 예산에 맞춰 반복 표본을 모으고, seed가 있으면 함께 기록할 수 있다. 표본 수나 seed는 품질·재현성을 보증하는 값이 아니다.

| 검수 기록 예 | 판정할 내용 |
|---|---|
| 행동 | 내려놓기와 멈춤이 모두 수행됐는가 |
| 대상 결합 | 지정한 손이 올바른 물체를 다뤘는가 |
| 연속성 | 접촉 전후 위치·형태가 이어지는가 |
| 보존 | 필요한 식별 정보가 유지되는가 |
| 편집 사용성 | 목적에 맞는 시작·끝과 연속 구간이 있는가 |
| 음향 사용 시 | 화자·대사·타이밍이 맞는가 |

예를 들어 외관은 좋지만 물체를 내려놓지 않았다면 이 샷의 필수 사건은 실패다. 실패 구간을 기록하면 다음 수정에서 접촉 전 자세를 바꿀지, 동작 문장을 바꿀지 비교할 수 있다. 이 검수표는 선택 가능한 적용 예이며 생성 실행 권한을 부여하지 않는다.

## 근거와 적용 한계

2026-09-08 확인. [Runway Academy](https://academy.runwayml.com/guides/prompting-guide)의 입력 모션 단서·순차 지시·I2V 예외, [Runway Gen-4](https://help.runwayml.com/hc/en-us/articles/39789879462419-Gen-4-Video-Prompting-Guide)의 점진적 수정, [Google Cloud](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/best-practice)의 단일 장면·I2V 가이드를 참고했다. 위 예시와 하네스 기록 방식은 MPW 설계이며 모델 성능 보증이 아니다.

[Google DeepMind의 Veo 예시](https://deepmind.google/models/veo/prompt-guide/)는 긴 동작 묘사와 따옴표 대사를 포함한다. 따라서 짧은 문장·따옴표 회피를 모든 모델의 강제 문법으로 만들지 않는다. 실제 표면별 문법을 적용한다. [xAI 영상 API 문서](https://docs.x.ai/developers/model-capabilities/video/generation)의 직접 API 설정도 별도 실행기나 웹 UI에 자동 이식하지 않는다.


상세 조사 반영(2026-09-08 공식 본문 확인): [Runway T2V](https://help.runwayml.com/hc/en-us/articles/42460036199443-Text-to-Video-Prompting-Guide)는 고정 공식·이상적인 길이를 두지 않고, [I2V](https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide)는 이미지와 움직임 정보의 역할을 구별한다. [xAI reference-to-video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video)는 외형 참조와 첫 프레임 고정을 구별한다. [Kling 3.0](https://kling.ai/quickstart/klingai-video-3-model-user-guide)의 샷·화자 구분과 [MiniMax](https://platform.minimax.io/docs/guides/video-generation)의 입력 역할도 참고했다. 각 표면의 문법·토큰을 다른 모델에 복사하지 않는다.

[Runway 공식 YouTube](https://www.youtube.com/watch?v=OLWd5O1O66s&t=56)(2025-04-01 게시)는 2026-09-08 자동 자막에서 피사체·카메라 지시를 확인했다. 영상 전체의 시각 비교는 하지 않았다. [Google 메타 프롬프팅 사례](https://blog.google/products-and-platforms/products/gemini/meta-prompting-veo-gemini-tips/)(2025-12-08 게시)는 아이디어 확장과 최종 문장을 분리하는 설계에 참고한 제작자 사례이며, 프롬프트 길이의 효과를 입증한 통제 실험이 아니다.

[VBench-2.0](https://arxiv.org/abs/2503.21755)의 초록과 [T2V-CompBench](https://t2v-compbench-2025.github.io/)의 저자 페이지를 2026-09-08 확인해 행동·관계·연속성 검수의 참고로 삼았다. 위 검수표는 논문의 벤치마크 구현이 아니라 제작용 제안이며, 모델 순위나 품질 향상 수치를 주장하지 않는다.
