# Higgsfield Genjutsu — 기존 영상 변환 프롬프트

**2026-09-11 공식 안내 확인.** Genjutsu·겐주츠·겐쥬츠를 지정한 기존 영상 변환에 적용한다. 신규 T2V·I2V 연출 문법으로 바꾸지 않는다. 입력 한도·표면·미확인 기능과 공식 근거는 [surface-contracts.md](surface-contracts.md) §4.4와 [surface-evidence.md](surface-evidence.md) §7이 정본이다. 실제 생성 비교는 하지 않았다.

## 목적에 맞는 기능

| 기능 | 작성할 변화 |
|---|---|
| Motion Transfer | 원본 동작·카메라·타이밍을 바탕으로 인물·장소·룩을 다시 구성 |
| Object Swap | 원본의 특정 인물·의상·제품·장소 등 대상만 교체 |

새 동작·카메라 경로·컷을 요구하면 이 보존 목적과 충돌하는지 먼저 판정한다. 원본 연장이나 음성 재생성을 지원한다고 추정하지 않는다.

## 짧은 변경 지시

공식 안내는 프리셋만 사용하거나 짧은 설명을 더하는 방식을 제시한다. 아래는 이를 적용한 **MPW 작성법**이며 공식 고정 문법은 아니다.

- **대상 → 변경 결과/참조 → 필요한 보존 조건** 순으로 짧게 쓴다. 원본 사건을 새 스토리보드로 풀거나 렌즈·조명 수식을 자동으로 더하지 않는다.
- 대상이 여럿이면 위치·의상·행동 역할로 식별한다. 참조는 인물·의상·제품·장소 중 무엇을 공급하는지 연결한다. 실제 입력창의 첨부 대응을 따르며 `@Image` 같은 다른 모델의 토큰을 가져오지 않는다.
- Object Swap은 변경 밖의 유지 조건, Motion Transfer는 원본 움직임과 새 외형의 대응을 명확히 한다. 유지할 액세서리·로고처럼 중요한 세부만 덧붙인다.
- 프리셋이 이미 의도를 충족하면 불필요한 본문을 만들지 않는다. 사용자가 프롬프트를 요청했다면 짧은 완성본을 제공한다. 숫자형 권장 길이를 새로 만들지 않는다.

## 작성 예시

아래는 공식 예문을 복제하지 않은 MPW 예시다. 해당 참조가 첨부된 경우에만 사용하고, 파일이 없으면 준비할 자산으로 표시한다.

**Object Swap — 의상만 교체**

```text
Change the jacket worn by the dancer on the left to the cropped denim jacket in the wardrobe reference. Keep the dancer's face, trousers, movements, and the surrounding shot unchanged.
```

**Motion Transfer — 인물과 장소 재구성**

```text
Recast the solo dancer using the character reference and place the performance in the greenhouse from the location reference. Preserve the source choreography, camera movement, and timing.
```

## 검수 범위

프롬프트 검수에서는 대상·참조 대응과 원본 보존 조건의 충돌을 본다. 생성 검수까지 요청받으면 원본과 전체 구간을 비교해 대상 추적·가림 뒤 외형·접촉·움직임·타이밍·교체 밖의 변화를 확인한다. 보존 지시는 픽셀 동일성 보장이 아니다. 프롬프트 작성 완료와 실제 영상 품질 검증을 구분한다.
