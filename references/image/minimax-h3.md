# MiniMax H3 — 영상 생성·참조 프롬프트

Higgsfield 로스터의 `minimax_h3`·`minimax_h3_max` 또는 공식 MiniMax H3 표면(`MiniMax-H3`·`MiniMax-H3-Max`)이 지정됐을 때 읽는다. 비율·해상도·duration·batch 같은 실행 레버는 [surfaces.md](surfaces.md)와 [model-routing.md](model-routing.md) 소관이며 여기서 다시 정의하지 않는다. 외부 사실의 근거·확인일은 [surface-evidence.md](surface-evidence.md) §7이 정본이다.

**경계.** Dreamina의 `@Image N`·`[Scene]` 블록, Higgsfield `medias.roles` 토큰, Grok의 참조 태그, Seedance의 direct 계약을 이 엔진에 이식하지 않는다. 이 문서는 공식 프롬프트 지침([MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3) `skills/h3-prompt-writing/`의 `SKILL.md`·`base-en.txt`·`ref-en.txt`, 2026-09-18 원문 확인)에 근거한 문장 작성만 다루며, API 요청 스키마와 생성 품질을 보증하지 않는다.

## 모드 체계

공식 지침은 입력 조합을 다섯 모드로 구분한다(2026-09-18 확인).

| 모드 | 입력 | 작성 초점 |
|---|---|---|
| T2VA | 텍스트만 | 전체 시청각 타임라인을 텍스트로 구성 |
| I2VA | 텍스트 + 첫 프레임 이미지 | 첫 프레임을 앵커로 앞으로 전개 |
| L2VA | 텍스트 + 끝 프레임 이미지 | 그럴듯한 이전 상태를 추론해 끝 프레임에 수렴 |
| FL2VA | 텍스트 + 첫·끝 프레임 이미지 | 두 프레임을 잇는 연속 경로 |
| Ref2VA | 텍스트 + 참조 이미지/영상/오디오 | 참조의 정의·보존·재사용 관계 |

**입력 가족을 섞지 않는다.** 공식 API에서 프레임 계열(`first_frame`·`last_frame`)과 참조 계열(`reference_image`·`reference_video`·`reference_audio`)은 상호배타다(2026-09-18 API 스키마 확인). 첫 프레임과 인물 참조를 함께 쓰고 싶은 요청은 어느 계열로 갈지 사용자와 정하거나, 프레임 입력 자체에 필요한 외형을 담는다.

라벨형 구조는 공식 지침의 재서술 형식이다. API는 `text` 하나만 필수로 요구하고 자유 문장도 받으므로, 아래 구조는 강제 스키마가 아니라 공식이 권장하는 작성 형식이다 — H3-Context-IR이 산출하는 구조화 표현에 맞춘 형태다.

## 라벨 섹션 구조

기본 모드(T2VA·I2VA·FL2VA·L2VA)는 세 필드를 이 순서로 쓴다:

```text
integrated_multimodal_description: ...
overall_soundscape: ...
non_diegetic_music: ...
```

- `integrated_multimodal_description`: 시각 스타일·구도·피사체·행동·샷·대사·다이에제틱 소리를 재생 순서로 쓰는 본문.
- `overall_soundscape`: 전 구간의 앰비언스·물리 동작음·비언어 인간음을 1–4문장으로. 대사·노래·특정 샷에 동기된 소리는 본문에 두고 여기서 반복하지 않는다. 완전 무음을 명시 요청받았을 때만 `N/A`.
- `non_diegetic_music`: 등장인물이 들을 수 없는 관객 전용 음악을 악기·템포·다이내믹 변화로 1–3문장. 없으면 `N/A`. 인물이 듣는 음악(라디오·연주·노래)은 다이에제틱이므로 본문에 쓴다.

프레임 모드는 모드별 고정 지시문을 첫 줄에 두고 빈 줄 하나 뒤에 세 필드를 쓴다(공식 형식):

- I2VA: `For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.`
- FL2VA: `How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the S.SS-second mark of the target video.`
- L2VA: `How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.`

`S.SS`는 요청한 영상 길이를 소수 둘째 자리까지 쓴 값이다.

Ref2VA(전체 참조)는 여섯 섹션을 이 순서로 쓴다:

```text
subject_definitions: ...
summary: ...
retention_analysis: ...
detailed_description: ...
overall_soundscape: ...
non_diegetic_music: ...
```

- `subject_definitions`: 따로 추적할 참조 내용마다 한 줄씩 라벨·참조 역할·핵심 특징을 정의한다.
- `summary`: 과업 접두를 대괄호로 시작하는 짧은 한 문단. 과업 유형은 `keyframe completion` / `reference generation` / `video editing` / `video continuation` / `audio reuse` / `audio reference`이고, 복수면 ` + `로 결합한다. 영상·오디오가 있다는 사실만으로 해당 과업이 생기지 않는다 — 카메라·리듬만 가져오는 참조 영상은 `reference generation`이다.
- `retention_analysis`: 라벨마다 한 줄로 등장 샷과 관계 마커를 쓴다(§참조 역할).
- `detailed_description`: 샷별 상세 본문. 생성 과업은 공식 권장이 영어 350–500단어이며, 대사가 많으면 발화 타임라인 수용을 우선한다. 기본 모드와 달리 스타일은 `[Shot 1]` 앞에 한두 문장으로 먼저 세운다.
- 끝의 두 섹션은 기본 모드와 같은 정의다.

**서술은 영어로 쓴다.** 대사·가사와 화면에 실제 보이는 텍스트만 원어를 유지한다 — 대사·가사는 `<d>` 태그 안에, 화면 표기 텍스트는 큰따옴표 안에 원문 그대로 둔다.

## 참조 역할

네 종류 라벨을 쓰고, 한 번 배정한 라벨은 모든 섹션에서 같은 의미를 유지한다.

| 라벨 | 역할 |
|---|---|
| `<Subject N>` | 참조에서 추상화한 재사용 가능한 시각 내용 — 인물·동물·사물·장소·의상·소품·스타일·동작·표정·포즈 |
| `<Picture N>` | 첫/끝/키프레임·편집 키프레임·구도 앵커·스토리보드 기준으로 쓰는 참조 이미지 |
| `<Video N>` | 편집 원본·연장 출발점·전체 시간 구조(카메라·컷·리듬)를 주는 참조 영상 |
| `<Audio N>` | 복사하거나 특성을 참조하는 오디오 신호 |

- 한 주체를 여러 자산이 정의할 수 있고(예: 외형은 `<Picture 1>`, 걸음 동작은 `<Video 1>`), 한 자산이 여러 주체를 공급할 수 있다. 각 주체가 어느 자산의 어느 축을 쓰는지 정의에 밝힌다.
- `<Picture N>`이 다른 항목의 출처 표시에만 쓰이고 따로 분석·사용되지 않으면 그 항목의 정의 안에서 인용하고 별도 줄을 만들지 않는다.
- 참조 영상 속 인물·사물·동작·효과를 화면 내용으로 재사용하면 `<Subject N>`으로 정의한다. `<Video N>`은 편집 원본·연장·구조 참조에만 쓰며 주체 라벨을 대신하지 않는다.
- `<Video N>`과 `<Audio N>` 번호는 카테고리별로 독립이다 — 같은 파일에서 와도 `<Video 1>`과 `<Audio 2>`가 될 수 있고, 소리가 든 참조 영상이라고 `<Audio N>`이 자동으로 생기지 않는다.
- `<Audio N>`이 특정 화자의 음색 참조이면 그 화자의 전역 `(Sx)`를 재사용해 `<Subject N> (Sx)`로 정의한다. 오디오 정의에서 새 번호를 매기지 않는다.
- 프롬프트 라벨과 실제 파일의 바인딩은 표면의 업로드 순서·role 배선이 정한다. 공식이 문서화한 범위는 "라벨 번호는 카테고리 내 순서이며 모든 섹션에서 일관"까지다 — 번호가 업로드 순서에 자동 매핑된다는 규칙은 [미확인] — Higgsfield 경유 1회 관측에서는 참조 이미지 2장을 순서대로 넣고 `<Picture 1>`·`<Picture 2>`로 배치를 지정한 결과가 지정한 순서대로 화면에 나타났다(2026-09 실측).

`retention_analysis`는 라벨당 한 줄로 관계 마커를 붙인다 — 공식 형식의 고정 영어 값이다:

- 시각 내용(`<Subject N>`·`<Picture N>`·`<Video N>`): `fully_preserved` / `partially_preserved` / `attribute_transfer` / `weak_reference`
- 오디오(`<Audio N>`): `fully_copy` / `partially_copy` / `reference` / `weak_reference`

타깃 영상에 새로 추가한 행동·배경·사건은 참조 충실도 손실로 세지 않는다.

공식 API의 참조 상한(2026-09-18 확인): 참조 이미지 최대 9장, 참조 영상 최대 3개·각 2–15초·합계 15초 이하, 참조 오디오 최대 3개·각 2–15초·합계 15초 이하, 혼합 입력 합계 12파일 이하. 래퍼 표면의 상한·롤은 그 표면의 실제 계약을 확인한다.

## 오디오

소리를 세 계층으로 나눠 쓴다 — 다이에제틱 소리(대사·노래·현장 동작음·인물이 듣는 음악)는 본문에 화면 사건과 함께 쓰고, 전 구간 앰비언스는 `overall_soundscape`에, 관객 전용 BGM은 `non_diegetic_music`에 둔다.

- **화자 ID**: 발화·노래·오프스크린 인간음을 내는 주체는 `(S1)`·`(S2)` 안정 ID를 받고 샷을 넘어 유지한다. 여럿이 동시에 말하면 `(S1,S2)`를 쓴다. 첫 등장에 음색·피치·말속도·화면 내/외 여부 같은 식별 정보를 쓰고, 발화하지 않는 인물에는 ID를 붙이지 않는다. `<Subject N>`으로 정의된 주체가 말하면 `<Subject N> (Sx)` 형태로 둘 다 쓴다.
- **대사·가사**: `<d>[Language] 원문</d>` 형식이다(2026-09-18 공식 원문 확인 — 프롬프트 지침과 API 양쪽에서 같은 표기다). 화자 식별·ID·전달 방식은 `<d>` 밖에 쓰고, 언어 태그와 원문은 안에 둔다. 원문은 단어·문장부호를 고치지 않고 보존한다. 재사용·재연기되는 원문도 마찬가지며, 알아들을 수 없는 구간은 추측하지 말고 `[unclear]`로 쓴다.
- **보이스오버·컷 경계**: 보이스오버는 `says in an off-screen voiceover`라고 쓰고 직후에 해당 화면 인물의 입이 닫혀 있음을 명시한다. 컷을 넘는 대사는 `<scenetrans>`와 연속 서술로, 영상 끝에서 잘리는 발화는 `<cutoff>`로 표기한다.
- **오디오 참조**: `<Audio N>`은 신호 복사(`fully_copy`·`partially_copy`)와 특성 참조(`reference` — 음색·리듬·음악 스타일·대사 내용·사운드 질감·비트·연속성)를 구분한다. 음색만 참조할 때 원본 대사를 타깃에 옮기지 않는다. 재사용 사운드트랙 안의 보컬 표현은 `(Sx)`를 만들지 말고 `<Audio N>`을 음원으로 쓴다. 오디오 참조가 사운드스케이프와 BGM 양쪽을 주면 해당하는 각 섹션에 관계를 쓴다.
- **볼륨·균형**: 음악의 존재감은 다이내믹 서술로 준다(점점 커지다 사라지는 식). BGM이 대사를 덮지 않게 하는 명시 서술은 서드파티 관측상 회피법으로 보고됐으나 공식 보증은 아니다.

## 시간과 카메라

- 서술의 시간 예산은 요청한 영상 길이와 맞춘다. 공식 지침은 묘사된 타임라인을 요청 길이(4–15초)에 맞추라고 지시한다. 실제로 요청할 수 있는 길이는 표면마다 다르므로 [surface-evidence.md](surface-evidence.md) §7을 따른다.
- 첫 샷 `[Shot 1]`에는 타임스탬프를 붙이지 않는다. 이후 샷은 `[Shot N] At MM:SS.mmm, ...`으로 컷 시점을 표기한다. 일반 전환은 `the camera cuts to`·`the shot cuts to` 등으로 쓰고, 명시 요청이 있을 때만 cross-dissolve·fade·wipe를 쓴다. 컷은 새 정보(피사체·공간·상태·시점·시간)를 도입할 때만 쓰고, 거리·각도만 바뀌면 카메라 모션으로 처리한다.
- 카메라 모션은 `motion type + amplitude + speed` 세 축으로, 샷 안의 자연어 동작으로 쓴다. 어휘: `Zoom In/Out`, `Push In/Pull Out`, `Pan Left/Right`, `Truck Left/Right`, `Tilt Up/Down`, `Pedestal Up/Down`, `Arc Shot`, `Tracking Shot`, `Static Shot`, `Shake Slightly/Strongly`, `POV`, `Roll Clockwise/Counterclockwise` + 의미 있을 때만 `with small/large amplitude`·`at slow/fast speed`. 문장 끝에 라벨을 쌓지 않는다.
- 모드별 권장 구조: I2VA = 첫 프레임 앵커 → 동작 시작 → 연속 전개 → 결과·반응. FL2VA = 첫 프레임 상태 → 관측 가능한 중간 변화 → 차이의 점진적 축소 → 끝 프레임 상태, 단일 샷을 기본으로 한다. L2VA = 그럴듯한 이전 상태 → 명시적 행동·전환 경로 → 마지막 샷의 점진적 수렴 → 끝 프레임 도달.
- 샷 시작의 스타일 토큰 예: `live-action`, `cinematic`, `2D-animated`, `3D CG`, `claymation`, `watercolor`, `vintage film`. 추상 수식어("cinematic하다"는 평가만 나열)보다 구체적 시청각 세부를 쓴다.

## 부정 표현

공식 API·프롬프트 지침에 별도 네거티브 필드는 없다(2026-09-18 확인). `no glasses`·`without cars` 같은 부정 프레이밍이 모델의 주의를 오히려 그 대상으로 끈다는 것과, 원하는 상태를 긍정으로 쓰는 회피법은 모두 서드파티 관측이며 공식 근거가 아니다. 배제 조건의 표면 분기는 [surface-contracts.md](surface-contracts.md) §4를 따른다.

## 실패 모드와 회피

아래는 전부 서드파티 관측이며 공식 확인이 아니다(관측 2026-09).

- **FL2VA 중간 구간 모프**: 첫·끝 프레임의 자세·각도 차이가 크면 중간에서 형태가 뭉개진다. 중간 경유 동작을 샷 안에 써서 연속 경로를 주고, 물리적으로 급격한 비약을 요구하지 않는다.
- **다중 참조 속성 혼선**: 여러 참조 인물의 의상·헤어가 섞인다. `subject_definitions`에서 각 주체를 분리해 정의하고, 화면 좌·우 위치를 `detailed_description`에 명시한다.
- **화면 텍스트 왜곡**: 화면 내 간판·문서 텍스트가 깨진다. 긴 문장 대신 1–3단어의 짧은 표기를 큰따옴표로 넣는다.
- **오디오 밸런스**: 립싱크 어긋남, BGM이 대사를 덮음. `overall_soundscape`·`non_diegetic_music`에 음량감(예: `softly in the background`)을 쓴다.

## 재서술 예시

공식 예시가 아니라 공식 구조에 맞춰 MPW 형식으로 새로 쓴 작성이다. 비율·해상도·duration은 표면의 파라미터로 따로 전달한다.

T2VA — 텍스트만으로 만드는 두 샷 구성:

```text
integrated_multimodal_description: [Shot 1] Live-action, a medium shot frames a night-market vendor flipping a small pancake on a round griddle, steam rising into the cold air. The vendor, a middle-aged woman with a low, unhurried voice (S1), calls out: <d>[Korean] 하나 더 구워드릴게요.</d> The batter sizzles as she lifts the edge with a spatula. [Shot 2] At 00:04.000, the camera cuts to a close-up of the pancake landing on a paper tray, its edges still crisping.

overall_soundscape: Busy market ambience with distant chatter and clinking coins, with the griddle sizzling steadily underneath.

non_diegetic_music: N/A
```

I2VA — 첫 프레임 앵커에서 전개:

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action, cinematic, the cyclist shown in <Picture 1> keeps her waiting position at the crosswalk, preserving her rain jacket, helmet, and the wet street layout. The camera trucks left with small amplitude at slow speed as the signal turns green and she pushes off, tires hissing on the wet asphalt. She glances back once and, in a bright, clipped voice, (S1) says: <d>[English] Clear on the right!</d>

overall_soundscape: Rain eases to a drizzle over a soft traffic hum; a pedestrian signal beeps twice and tires hiss on wet pavement.

non_diegetic_music: A sparse marimba pulse at a moderate tempo that fades under the street ambience by the end.
```

Ref2VA — 인물·소품·음색 참조 (섹션 구조 예시. `detailed_description`은 축약본이며 실제 생성 과업은 위 공식 권장 분량을 따른다):

```text
subject_definitions:
<Subject 1> is the barista in <Picture 1>, a young man with short black hair, round glasses, and a green canvas apron.
<Subject 2> is the ceramic espresso cup in <Picture 2>, white with a hairline crack near the handle.
<Audio 1> is the voice-timbre reference for <Subject 1> (S1), containing a calm spoken Korean vocal layer.

summary:
[reference generation + audio reference] The target video shows <Subject 1> serving <Subject 2> across a cafe counter and speaking one line in the timbre referenced from <Audio 1>.

retention_analysis:
<Subject 1> (appears in [Shot 1]): fully_preserved - his face, glasses, and green apron are retained.
<Subject 2> (appears in [Shot 1]): fully_preserved - the white cup and its handle crack are retained.
<Audio 1>: reference - its calm timbre guides the line delivery without copying the original signal.

detailed_description:
The target video is in a warm, naturalistic cafe style with soft morning light.
[Shot 1] A medium shot frames <Subject 1> behind the counter of a small cafe with wooden shelves. He slides <Subject 2> forward across the counter toward the customer side. Using the calm voice timbre referenced from <Audio 1>, <Subject 1> (S1) says: <d>[Korean] 여기 있습니다, 조심히 드세요.</d> The camera pushes in with small amplitude at slow speed toward the cup as steam rises.

overall_soundscape:
Quiet cafe room tone with a low grinder hum and a soft cup-on-counter contact sound.

non_diegetic_music:
N/A
```

## 적용 한계

- 라벨형 구조는 공식 지침의 재서술 형식이며 API의 강제 입력 스키마가 아니다 — `content[]`의 `text` 하나가 필수 요건이고 자유 문장도 받는다.
- 표면별 값이 다르다. 공식 API(`MiniMax-H3`·`MiniMax-H3-Max`)와 Higgsfield 래퍼(`minimax_h3`·`minimax_h3_max`)는 해상도·duration·지원 모드·참조 롤이 서로 다르다. 값과 확인일, Higgsfield 경유 참조 조합 실측은 [surface-evidence.md](surface-evidence.md) §7의 MiniMax H3 API 표면·Higgsfield 로스터·참조 실측 행이 정본이며 여기서 다시 적지 않는다.
- 출력은 영상과 오디오를 함께 생성한다(프레임레이트·샘플레이트는 [surface-evidence.md](surface-evidence.md) §7). 오픈웨이트 배포 변형은 H3-Base-FL2VA(텍스트+첫/끝 프레임)·H3-Base-Ref2VA(참조) 두 계열이고, H3-Context-IR(입력 해석·구조화)과 H3-Regenerate-2K(2K 재생성)는 호스팅 구성 요소다.
- "작성 가이드는 따옴표 대사를 쓴다"는 서드파티 보고가 있었으나, 현행 공식 지침은 대사를 `<d>[Language] 원문</d>`으로 문서화한다(2026-09-18 원문 확인). 큰따옴표는 화면 표기 텍스트용이다.
- 사용 제약: 오픈웨이트 라이선스는 EU·영국·한국·미국을 제외 지역으로 두고 해당 지역의 자체 호스팅은 별도 라이선스 신청이 필요하며, 공식 클라우드 API는 전 세계에서 쓸 수 있다(2026-09-18 확인). 프롬프트 작성과 별개의 배포 제약이다.
- 위 예시는 구조에 맞춰 새로 쓴 것이며 생성 품질·지시 준수를 실측하지 않았다. 실패 모드는 서드파티 관측이고, 모델·표면이 갱신되면 다시 판정한다.
