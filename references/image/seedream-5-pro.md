# Seedream 5 Pro 생성·인터랙티브 편집 어댑터

## 적용 경계

이 문서는 **BytePlus ModelArk direct의 `dola-seedream-5-0-pro-*`** 또는 같은 인터랙티브 문법을 실제로 제공하는 Seedream 5 Pro 표면에만 적용한다. Higgsfield의 `seedream_v5_pro`는 별도 S2 모델 id다. 이름이 비슷하다는 이유로 ModelArk의 모델 id·해상도·좌표 문법을 복사하지 말고, 그 플랫폼의 런타임 정의가 해당 기능을 노출할 때만 사용한다. 외부 사실과 확인일은 [surfaces.md](surfaces.md) §7이 정본이다.

캐릭터 베이스·1×4 턴어라운드에는 이 문서 위에 [seedream-character-reference-sheets.md](seedream-character-reference-sheets.md)를 추가 적용한다.

## 작업 분기

| 요청 | 컴파일 방식 |
|---|---|
| 텍스트→이미지 | 피사체 + 행동 + 환경을 자연어로 연결하고, 필요한 미학 축만 스타일·색·조명·구도로 보강 |
| 단일 이미지 편집 | 편집 대상 → 변경 연산 → 변경 결과 → 보존 대상을 한 문단에 명시 |
| 다중 이미지 편집 | `Image 1`, `Image 2`처럼 업로드 순서와 같은 번호를 사용하고 이미지마다 가져올 축을 하나씩 선언 |
| 위치 지정 편집 | 자연어 편집 지시와 `<point>` 또는 `<bbox>` 좌표 토큰을 결합 |

프롬프트는 쉼표 키워드 더미보다 일관된 자연어를 우선한다. 중요한 대상·변경을 앞에 두고 장식·중복을 제거한다. 렌더할 정확 문자열은 큰따옴표로 감싼다.

## 다중 이미지 권한

첫 문장에서 각 입력의 역할을 고정한다. `inspired by Image 2`처럼 무엇을 옮기는지 불명확한 표현은 쓰지 않는다.

```text
Use Image 1 as the immutable subject and composition base. Replace only the outfit in Image 1 with the complete outfit from Image 2. Preserve Image 1's face, body proportions, pose, camera, background, and lighting unchanged.
```

- 이미지 번호는 실제 API/UI 업로드 순서와 일치한다.
- 한 이미지가 전달하는 축(피사체·의상·스타일·장면·레이아웃)을 프롬프트에서 장황하게 재묘사하지 않는다.
- `replace`, `add`, `remove`, `recolor`, `restyle`, `place`처럼 편집 연산을 하나의 동사로 먼저 고정한다.
- 변경하지 않을 축은 필요한 것만 짧게 열거한다. 포괄적인 `everything else`만으로 보존 정확도를 주장하지 않는다.

## 인터랙티브 좌표 문법

ModelArk direct의 인터랙티브 편집은 이미지별 정규화 좌표를 프롬프트에 넣는다. 좌표는 해당 이미지의 왼쪽 위를 `(0, 0)`, 오른쪽 아래를 `(999, 999)`로 하는 범위다.

| 선택 | 토큰 | 용도 |
|---|---|---|
| 점 | `<point>x y</point>` | 점 주변의 대상을 모델이 판정해 편집 |
| 영역 | `<bbox>x1 y1 x2 y2</bbox>` | 왼쪽 위와 오른쪽 아래로 편집 범위를 고정 |

좌표는 화면의 원본 이미지 영역을 기준으로 계산한다. 캔버스 줌·팬이 있으면 먼저 포인터 좌표를 이미지 내부 좌표로 바꾼 뒤 0–999로 정규화한다. 직접 계산하지 않은 좌표를 추정해 쓰지 않는다.

```text
Replace the person on the left in Image 1 <bbox>120 180 640 760</bbox> with a silver service robot. Keep the flower arrangement in Image 1 <bbox>700 120 920 360</bbox> unchanged.
```

```text
Use the subject from Image 2 <bbox>118 331 933 871</bbox> to replace the subject in Image 1 <bbox>179 283 796 986</bbox>. Preserve Image 1's camera position, background, lighting direction, and all content outside the target box.
```

## 모호성 해소

- 하나의 bbox에 대상이 여러 개면 `the person on the left`, `the cat wearing a hat`, `the foreground flower`처럼 안정적인 시각 특징과 위치를 함께 쓴다.
- 보존해야 하는 특정 물체도 bbox로 표시하고 `keep unchanged` 또는 `do not modify`로 잠근다.
- 점 하나가 여러 물체의 경계에 걸리면 point 대신 bbox를 쓴다.
- 교차 이미지 편집은 이미지 번호와 각 이미지의 좌표 토큰을 모두 붙인다.

## 표면·길이 게이트

- ModelArk direct의 권장 프롬프트 길이와 모델 파라미터는 [surfaces.md](surfaces.md) §0-1·§7을 따른다.
- 해상도·출력 형식·프롬프트 최적화 모드는 API 파라미터다. 산문에 반복하지 않는다.
- `dola-seedream-5-0-pro-*`와 Higgsfield `seedream_v5_pro`의 파라미터를 상호 복사하지 않는다.
- 위치 지정 UI나 API가 좌표 토큰을 지원하지 않으면 일반 자연어 편집으로 강등하고, 좌표가 강제된다고 주장하지 않는다.

## 판정

- 이미지 번호별 역할이 하나로 고정됐는가.
- 변경 연산과 대상이 첫 문장에서 식별되는가.
- 좌표가 실제 이미지 선택에서 계산됐고 올바른 이미지 번호에 붙었는가.
- 보존 대상과 편집 대상의 bbox가 의도치 않게 겹치지 않는가.
- 파라미터 축이 산문에 중복되지 않았는가.

