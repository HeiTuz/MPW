# Dreamina Seedance 2.5 붙여넣기 어댑터

이 문서는 **Dreamina 웹의 Seedance 2.5 UI**에서 멀티레퍼런스 생성·장편 생성·영상 편집·연장·키프레임·스토리보드·클레이 렌더러 프롬프트를 조립하는 S3 어댑터다. 외부 사실과 확인일은 [surfaces.md](surfaces.md) §7이 정본이다.

**경계부터 잠근다.** 이 문서는 BytePlus ModelArk direct의 모델 id·API 요청 스키마를 증명하지 않으며, [seedance-2.md](seedance-2.md)의 Seedance 2.0 direct 계약을 2.5로 상속시키지 않는다. Higgsfield나 다른 래퍼의 `medias.roles`·파라미터에도 이 UI 값을 복사하지 않는다. Dreamina에서 비율·해상도·duration·모드를 고를 수 있으면 그 값은 UI 레버가 권한자이고 프롬프트 산문에 중복하지 않는다.

## 입력 게이트

Dreamina 공식 가이드 기준(2026-08-03 확인):

- 멀티레퍼런스는 합계 최대 50개다. 이미지 최대 30장(각 4K 이하), 영상 최대 10개·합계 30초 이하, 오디오 최대 10개·합계 30초 이하 범위 안에서 조립한다.
- 안정성 권장치는 능력 상한과 다르다. 피사체 이미지에는 서로 다른 주체 1–8개, 주체 영상에는 1–5개, 편집 기준 영상은 20초 미만, 영상 편집용 참조 이미지는 1–5장을 우선한다.
- 같은 주체의 여러 시점은 한 장의 콜라주보다 독립 이미지로 나누고, `@Image N`마다 어느 시점인지 선언한다.
- 참조가 늘수록 전부 한 장면에 소환하지 않는다. **현재 장면에 필요한 자산만 선택**하게 만드는 것이 목표다.
- Dreamina가 공개하지 않은 프롬프트 길이 상한은 숫자로 만들지 않는다. 전달 채널·기계 계약이 더 좁지 않으면 신호 밀도로 관리한다.

## 공통 컴파일 순서

1. **모드 선언** — 신규 생성 / 30초 생성 / Long Video / 편집 / 순방향 연장 / 역방향 연장 / 키프레임 / 스토리보드 / 클레이 렌더러 중 하나를 먼저 고른다.
2. **자산 역할 선언** — 자산마다 별칭, 공급 축, 쓰지 않을 축을 한 줄로 쓴다. 이미지 안의 텍스트 라벨에 대응 관계를 맡기지 않는다.
3. **주체 프로필** — 중요한 인물·제품·소품은 외형, 소유 소품, 행동 범위, 배제할 다른 주체의 속성을 한곳에 모은다.
4. **장면 패킷** — 장면마다 `Use` → `Event` → `End state` 순서로 쓴다. 한 단계에는 주된 상태 변화 하나만 둔다.
5. **연속성 잠금** — identity, 의상, 소품 소유권·개수, 공간 방향, 카메라 축, 오디오 관계 중 실제로 이어져야 하는 축만 끝에서 잠근다.

```text
[References]
<Character A> corresponds to @Image 1. Use facial features, hairstyle, and clothing only; ignore the background.
<Prop A> corresponds to @Image 2. Use structure, material, and color only.
@Video 1 defines <Character A>'s motion and pacing only; ignore its identity, clothing, and scene.
@Audio 1 defines <Character A>'s voice and the specified dialogue only.

[Scene 1]
Use: <Character A>, <Prop A>, and the motion from @Video 1.
Event: <one primary visible change>.
End state: <directly observable positions, ownership, and scene state>.

[Maintain]
Keep <Character A>'s identity and clothing, <Prop A>'s count and ownership, the camera axis, and @Audio 1's speaker relationship consistent.
```

`@Images 1–4가 각 인물을 정의한다`처럼 대응을 뭉개지 않는다. 각 번호를 각 주체에 개별 매핑한다. 같은 물체의 앞·옆·뒤 시점이라면 모두 같은 한 개체를 정의하며 출력에도 한 개체만 유지한다고 명시한다.

## 30초와 Long Video

30초 안에 여러 사건이 있으면 연속 단계로 나누고 각 단계의 끝에서 화면에 남아야 할 상태를 쓴다. 타임스탬프 구간은 연속·비중첩으로 두며, 편집 프레임의 절대 보장이 아니라 **사건의 시간 예산**으로 취급한다. 한 구간에 너무 많은 사건이나 초당 반복 횟수를 밀어 넣지 않는다.

```text
[Stage 1 | 0–10s]
Initial state: <visible opening state>.
Primary event: <one state change>.
End state: <visible handoff state>.

[Stage 2 | 10–20s]
Continue from Stage 1: <state that remains true>.
Primary event: <one state change>.
End state: <visible handoff state>.

[Stage 3 | 20–30s]
Primary event: <closing event>.
End state: <final visible state>.
```

Dreamina의 `Long Video`는 30–180초를 고르는 별도 UI 모드다(2026-08-03 확인). 모드·duration·비율·해상도는 UI에서 설정하고, 프롬프트는 위 단계 계약을 필요한 길이만큼 확장한다. 한 단계가 앞 단계의 상태를 실제로 이어받지 않으면 장편이 아니라 독립 장면 묶음이 된다.

## 영상 편집

편집 기준 영상은 하나의 master로 선언한다. 편집 목표, 대상 참조의 역할, 변경 범위, 보존 범위를 분리한다. 대상 교체는 새 대상이 원 대상의 등장·동작·가림·퇴장 타임라인을 상속하도록 쓴다.

```text
[Edit Goal]
Edit @Video 1. During <time range>, replace only <source object> with <target object> from @Image 1.

[Master]
@Video 1 is the sole editing master for action, composition, camera movement, occlusion, audio, and event order.

[Target Reference]
@Image 1 defines only <target object's appearance, structure, and material>; ignore its background and composition.

[Edit Scope]
Modify only <object and region>. Keep exactly <count> target instance(s).

[Timeline Inheritance]
The target inherits every appearance, motion, occlusion, and exit of the source, including timing, path, and speed changes.

[Preserve]
Keep all unmentioned people, props, scene structure, camera work, cuts, dialogue, ambience, and event order from @Video 1 unchanged.
```

배경 교체는 `주체 실루엣 밖의 배경`만 변경 범위로 두고 주체 identity·얼굴·헤어·의상·표정·위치·크기·동작을 보존한다. 오디오 편집은 화자 또는 소리 범주, 바꿀 내용, 유지할 다른 대사·립싱크·BGM·앰비언스·효과음을 구분한다.

## 영상 연장

순방향 연장은 원본 마지막 프레임이 새 구간의 첫 프레임을 지배한다. 역방향 연장은 새 구간의 마지막 프레임이 원본 첫 프레임과 이어져야 한다. 추가 참조는 새 주체·소품·오디오를 공급할 수 있지만 경계 프레임의 구도 권한을 덮지 못한다.

```text
@Video 1 is the source video to extend <forward|backward>.

[Boundary]
<Forward: the extension opens directly from @Video 1's last frame.>
<Backward: the extension ends in @Video 1's first-frame state.>
Match subject pose and orientation, prop position, spatial relationships, camera position and composition, lighting, and motion direction at the boundary.

[New Event]
<one continuous action or event before or after the source>.

[Continuity]
Keep identity, clothing, prop structure and count, background layout, and axis of action continuous. Do not duplicate or split a subject.
```

검수는 경계 한 프레임의 픽셀 일치가 아니라 경계 양쪽과 전체 연장 구간의 자연스러운 상태 연결로 판정한다.

## 키프레임·스토리보드·클레이 렌더러

- 첫·마지막 프레임은 한 문장으로 묶지 말고 각각 `@Image 1 is the first frame`, `@Image 2 is the last frame`으로 선언한다. 두 이미지의 비율은 같게 준비하고, 다른 참조는 지정 속성만 보충한다.
- 다중 키프레임은 독립 이미지를 순서대로 놓고 각 이미지가 나타내는 **단계 종료 상태**를 쓴다. 키프레임은 순서와 앵커 상태를 정하지 중간 모든 프레임을 복제하지 않는다.
- 스토리보드 그리드는 읽기 순서를 먼저 쓰고, 패널마다 주체 행동·샷 사이즈/카메라·최종 스타일·오디오를 연결한다. 공식 권장대로 15패널 이하의 단순 선화·도식과 최소 텍스트를 우선한다(2026-08-03 확인).
- 거친 클레이/화이트 모델은 motion, camera, 동선, 위치, 명암 변화의 blockout으로만 쓴다. 주체·장면·스타일은 별도로 정의하고, 팔다리·날개가 있으면 동작의 시작–중간–끝을 쓴다.
- 정밀 클레이 모델은 기존 geometry·구조를 master로 두고 구간별 재질·조명·스타일을 렌더링한다. 궤적선·좌표선·카메라 콘은 출력에 이식하지 않을 간섭 정보로 지정한다.

## 오디오·텍스트

자연어만으로도 쓸 수 있다. 음악·효과음·대사·자막을 서로 분리해야 할 때만 Dreamina 표기를 사용한다.

| 종류 | 표기 |
|---|---|
| 음악 | `(music description)` |
| 효과음 | `<sound effect>` |
| 대사 | `{exact dialogue}` |
| 자막 | `【exact subtitle】` |

비중국어 대사는 언어와 필요한 지역 변이, 전달 방식, 화자를 대사 앞에서 명시한다. UI의 오디오 on/off나 duration을 산문으로 대신하지 않는다.

## 판정

- Dreamina UI 2.5와 ModelArk direct 2.0/API 계약이 섞이지 않았는가.
- 모든 참조 번호에 별칭·공급 축·배제 축이 있고 장면별 `Use`가 선택됐는가.
- 복합 사건이 단계별 하나의 주된 상태 변화와 관측 가능한 `End state`를 갖는가.
- 편집은 sole master·변경 범위·보존 범위·timeline inheritance가 분리됐는가.
- 연장은 방향과 경계 프레임 권한자가 명확한가.
- 키프레임·스토리보드·클레이가 복제 지시가 아니라 순서·구도·motion/geometry 권한으로 쓰였는가.
- UI 레버가 소유하는 비율·해상도·duration·모드가 산문에 중복되지 않았는가.
