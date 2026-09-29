# 관측된 이미지 프롬프트 예시

이 예시는 공개 프롬프트의 장면과 작성 방식을 MPW 문장으로 다시 쓴 기록이다. 각 사례는 출처 한 건의 관측이며 생성 품질이나 모델 준수율을 검증한 결과가 아니다. 엔진별 작성 규칙을 먼저 적용하고, 예시가 필요한 경우에만 읽는다.

## Midjourney

왜곡 배제를 짧은 파라미터로 분리한 실내 장면 (관측 2026-09, 출처 1건):

```text
living room, Scandinavian minimalism, oiled oak floor, whitewashed walls, pale oak credenza, low linen sofa, wool rug, greenery in a clay pot, soft north-facing daylight, camera at chest height, 24mm perspective, straight verticals, straight window frames, furniture resting firmly on the floor, balanced exposure, a lived-in book stack and throw blanket --no fisheye --ar 3:2
```

피부 표현을 원하는 상태로 적은 인물 컷 (관측 2026-09, 출처 1건):

```text
freckled auburn-haired woman glancing beyond the camera from a rooftop at sunset, a faint smile; distant windows blur behind her, backlight catches individual hair strands and leaves pores visible on her cheeks, editorial portrait with gentle background blur --ar 4:5 --raw
```

중심 구도를 유지한 호텔 내부 (관측 2026-09, 출처 1건):

```text
a perfectly symmetrical film-still composition of a grand hotel lobby in pastel pink and mint green with geometric Art Deco details, a concierge in a pressed uniform standing centered at the front desk, frontal camera angle, flat lighting, every object placed with obsessive precision, 35mm film grain, centered one-point perspective --ar 16:9 --s 350
```

창문 빛이 바닥까지 이어지는 흑백 장면 (관측 2026-09, 출처 1건):

```text
film noir scene, a detective in a fedora and trench coat standing in a dimly lit office, hard shadows from venetian blinds cutting across the walls and floor, cigarette smoke curling through a single shaft of light, wet street visible through the window, black and white high contrast photography, dramatic chiaroscuro lighting, shot on 35mm film with classic noir grain --ar 239:100 --no color
```

얼굴과 칼에만 세부를 집중한 일러스트 (관측 2026-09, 출처 1건):

```text
dynamic anime key visual of a swordswoman mid-strike, deep crimson robe breaking into jagged painterly shards, highest detail on face, hands and blade while the rest dissolves into abstract motion streaks, near-empty pale background, strong diagonal composition, localized motion blur, cold overexposed light with a single vivid crimson accent --ar 2:3 --stylize 300
```

정지한 인물과 이동하는 군중의 차이 (관측 2026-09, 출처 1건):

```text
street portrait of a man standing perfectly still in a crowded crosswalk, sharp focus on his face and coat, the crowd around him streaked with motion blur, shallow depth of field, muted urban palette, soft bokeh, filmic grade --ar 4:5
```

슬라이드 간 같은 스타일을 유지하는 사례 (관측 2026-09, 출처 1건): 스타일 설명은 유지하고 피사체와 동작, 슬라이드 번호만 바꾼다. 참조 연결은 [../midjourney-identity.md](../midjourney-identity.md) §6을 따른다.

```text
flat-design infographic illustration, woman in a coral blazer holding a piggy bank, clean white background, minimal geometric shapes, coral and navy palette, consistent line weight, editorial style, slide 3 of a finance tips series --ar 9:16 --style raw
```

## FLUX

짧은 조명과 빈 카피 공간을 지정한 제품 (관측 2026-09, 출처 1건):

```text
Matte charcoal pour-over kettle on a warm concrete counter. Soft key from the left, cool rim light. Empty upper frame for copy, clean unbranded surfaces.
```

유리의 반사를 강조한 제품 (관측 2026-09, 출처 1건):

```text
A single amber whiskey bottle on a dark walnut table under one hard side spotlight, with a strong specular highlight on the glass and the liquid glowing warm; the background falls off to black. Commercial product still, macro register, crisp label and glass detail.
```

창가의 찬 빛과 실내의 따뜻한 빛 (관측 2026-09, 출처 1건):

```text
A woman with natural red hair sits by a rain-streaked cafe window, hands wrapped around a ceramic mug, looking out. Late-afternoon overcast daylight from the left meets warm interior tungsten; shallow depth of field, medium-format clarity, film emulation with slightly desaturated greens. Intimate documentary feel.
```

항구에서 촬영한 인물 (관측 2026-09, 출처 1건):

```text
Close-up portrait of an elderly fisherman with weathered skin, pale eyes, and white stubble, in a salt-faded canvas jacket on a weathered harbor dock at golden hour. Warm directional light catches the left side of his face; shallow depth of field turns the background masts into soft circles of light. Natural skin texture, documentary portrait register.
```

글리프로 구성한 초상 (관측 2026-09, 출처 1건):

```text
Portrait of a woman with long wavy hair built entirely from glowing green terminal glyphs, hash marks, digits, code fragments on solid black, with CRT scanlines and phosphor glow. High contrast, sharp glyph edges.
```

수면 발광과 야간 풍경 (관측 2026-09, 출처 1건):

```text
Bioluminescent waves on a night beach, long-exposure look, electric-blue glow in the surf, stars reflected on wet sand under a dark sky.
```

젖은 거리의 반사 (관측 2026-09, 출처 1건):

```text
Rain-slicked city street at night, neon signs reflected on wet asphalt, a lone pedestrian with an umbrella, deep atmospheric perspective, moody cinematic register.
```

비어 있는 실내와 확산광 (관측 2026-09, 출처 1건):

```text
Minimalist Japandi living room interior, natural wood and linen, a large window with diffused daylight, unoccupied, architecture-photography register.
```

## Soul

얼굴 가까이에 손을 댄 인물 (관측 2026-09, 출처 1건):

```text
close portrait of a dark-haired woman winking with her chin against the back of one hand; stray fringe across her forehead, understated makeup and nude-pink lip sheen, uncovered shoulders against a cream backdrop, broad soft light and a quiet warm palette
```

차 안에서 측면 빛을 받은 인물 (관측 2026-09, 출처 1건):

```text
fashion still from a low viewpoint inside a car: a woman seated against dark leather wears a striped, loosely knitted halter top; late sunlight enters the side window and lights one cheek while the opposite side stays shaded, city buildings receding beyond the glass
```

Soul ID가 연결된 경우 이 두 관측 예시의 얼굴 설명을 정체성 고정 문구로 복사하지 않는다. 장면과 의복, 빛만 요청에 맞춰 고른다. 두 사례 모두 품질 실측은 하지 않았다.
