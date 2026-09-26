# FLUX (Black Forest Labs) — 생성·편집 프롬프트

`FLUX` / `FLUX.2` / `flux_kontext`가 지정됐을 때 읽는다. 모델 후보와 변형(`pro`/`flex`/`max`)·해상도 같은 실행 레버는 [model-routing.md](model-routing.md)와 [surfaces.md](surfaces.md) §4 소관이며 여기서 다시 정의하지 않는다. 입력 이미지가 있으면 [from-image.md](from-image.md)의 입력 역할·보존 규칙을 먼저 적용한다. 외부 사실과 확인일은 [surface-evidence.md](surface-evidence.md) §7이 정본이다.

**경계.** FLUX.2 생성과 `flux_kontext` 계열 지시 기반 편집은 같은 문법이 아니다. Midjourney `--` 플래그, Dreamina·Seedance의 `@Image`·`[Scene]` 블록, Grok의 `--ar` 금지 규칙을 이 엔진에 그대로 옮기지 않는다. 이 문서는 보낼 문장 작성만 다루며 API 요청 스키마나 모델 성능을 보증하지 않는다.

## 작성 원칙

- **결과 어휘로 환원한다.** 장비·렌즈·필름 스톡·EXIF 나열은 결과를 기술하는 어휘로 바꾼다(`Fujifilm GFX 100S, 110mm` 대신 `medium-format clarity, shallow depth of field`). 카메라·필름 어휘 사전은 [editorial/photo-vocab.md](editorial/photo-vocab.md)가 정본이다.
- **색은 본문 HEX로.** 색과 적용 대상의 연결 규칙은 [surface-contracts.md](surface-contracts.md) §4.1을 따른다.
- **짧은 완결 산문이 기본.** `Camera:`·`Lighting:` 같은 라벨 행은 분리가 실제로 도움이 될 때만 쓰고, 라벨을 채우기 위한 내용을 만들지 않는다.
- 산출물 언어는 [../templates/common.md](../templates/common.md) §프롬프트 언어 결정을 따른다.

## 관측 패턴 (재서술)

- **제품 스틸은 조명·카피 공간·금지를 짧게 분리** (관측 2026-09, 출처 4건): 조명의 방향과 성격, 비워 둘 영역, 빼려는 요소를 대신할 원하는 상태(`unbranded`, `clean surface`)를 한두 문장으로 끊어 적는다. 제외 명사 나열은 쓰지 않는다([surface-contracts.md](surface-contracts.md) §4).
- **매체·광원 대비를 결과 어휘로** (관측 2026-09, 출처 3건): 필름 스톡 이름과 렌즈 수치 대신 매체 특성(medium-format clarity, fine grain)과 광원 대비(overcast daylight + warm tungsten)를 쓴다.
- **글리프 렌더는 구성 방식부터 잠근다** (관측 2026-09, 출처 1건): 화면 전체가 글리프로 구성된다는 사실과 글리프 종류를 먼저 쓰고 배경·스캔라인·발광을 뒤에 붙인다.

## 관측된 외부 예시 (재서술)

공개 FLUX 프롬프트를 MPW 형식으로 다시 썼다. 원문 복사가 아니며 장비명·EXIF·상표·실존 작품명은 결과 어휘로 환원하거나 제외했다. 품질 실측이 아니라 관측 스탬프다.

제품 스틸 — 최소 라벨과 카피 공간 (관측 2026-09, 출처 1건):

```text
Matte charcoal pour-over kettle on a warm concrete counter. Soft key from the left, cool rim light. Empty upper frame for copy, clean unbranded surfaces.
```

제품 스틸 — 단일 스포트라이트 (관측 2026-09, 출처 1건):

```text
A single amber whiskey bottle on a dark walnut table under one hard side spotlight, with a strong specular highlight on the glass and the liquid glowing warm; the background falls off to black. Commercial product still, macro register, crisp label and glass detail.
```

문서 인물 — 창가 자연광과 실내 텅스텐 (관측 2026-09, 출처 1건):

```text
A woman with natural red hair sits by a rain-streaked cafe window, hands wrapped around a ceramic mug, looking out. Late-afternoon overcast daylight from the left meets warm interior tungsten; shallow depth of field, medium-format clarity, film emulation with slightly desaturated greens. Intimate documentary feel.
```

문서 인물 — 골든아워 클로즈업 (관측 2026-09, 출처 1건):

```text
Close-up portrait of an elderly fisherman with weathered skin, pale eyes, and white stubble, in a salt-faded canvas jacket on a weathered harbor dock at golden hour. Warm directional light catches the left side of his face; shallow depth of field turns the background masts into soft circles of light. Natural skin texture, documentary portrait register.
```

스타일 — 글리프 렌더 초상 (관측 2026-09, 출처 1건):

```text
Portrait of a woman with long wavy hair built entirely from glowing green terminal glyphs — hash marks, digits, code fragments — on solid black, with CRT scanlines and phosphor glow. High contrast, sharp glyph edges.
```

야경 — 수면 반사 (관측 2026-09, 출처 1건):

```text
Bioluminescent waves on a night beach, long-exposure look, electric-blue glow in the surf, stars reflected on wet sand under a dark sky.
```

무드 장면 — 비 오는 네온 거리 (관측 2026-09, 출처 1건):

```text
Rain-slicked city street at night, neon signs reflected on wet asphalt, a lone pedestrian with an umbrella, deep atmospheric perspective, moody cinematic register.
```

인테리어 — 채광 중심 (관측 2026-09, 출처 1건):

```text
Minimalist Japandi living room interior, natural wood and linen, a large window with diffused daylight, unoccupied, architecture-photography register.
```

## 적용 한계

예시는 공개 블로그·SNS 프롬프트를 한 건씩 재서술한 것이다. 생성 품질과 프롬프트 준수율은 실측하지 않았고, 모델 버전이 바뀌면 다시 판정한다. 인물 예시의 얼굴은 특정 실존 인물이 아니다.
