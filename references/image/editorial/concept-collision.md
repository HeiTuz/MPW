# 에디토리얼 패션 — 컨셉-콜리전

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

## 15. 컨셉-콜리전 에디토리얼 그래머 (2026-07 패턴 증류 — 생성 캘리브레이션 미실시)

Format B([format-b.md](format-b.md) §1)의 특수형이다. **하나의 컨셉 충돌**(office utility × balletcore, 로맨틱 돌, 초현실 콜라주 등)을 문장으로 선언만 하지 않고 **의상 + 소품 + 포즈로 증명**하는 화보에 쓴다. [photo-vocab.md](photo-vocab.md) §7.4(필름)·[scene-craft.md](scene-craft.md) §8(포즈)·[scene-craft.md](scene-craft.md) §10(조명)·[tier2-safety.md](tier2-safety.md) §13(로컬리티)을 대체하지 않고 그 위에 조합 규칙만 얹는다. 원본 팩의 raw 프롬프트 산문은 복사하지 않고, 아래 재사용 규칙으로만 증류한다.

**그래머 체인 (Format B 슬롯의 특수 배열, 재배열 금지):**

```text
성인 가상 페르소나/정체성 앵커 → 헤어·뷰티 구체 → 컨셉 충돌(의상+소품으로 가시화) → 바디 포즈(가구/오브젝트 지오메트리 결속 또는 포착된 모션) → 배경 소재/색 → 빛 방향·그림자 거동 → 표정/시선 → 구도/네거티브 스페이스 → natural skin/매체 마감 → AR x:y
```

- **컨셉은 서술하지 말고 증명한다.** `balletcore × office utility`라고 쓰는 것으로 끝내지 않는다 — 발레 플랫·튜튜형 미디 스커트(발레)와 테일러드 블레이저·클립보드·머그컵·스캐너(오피스)를 **동시에** 프레임에 둬야 충돌이 읽힌다. 소품이 컨셉의 증거다.
- **소품 배치 3형(전부 긍정형 장면 서술):** (a) moodboard형 — 가방 내용물을 벽/바닥에 펼쳐 배열, (b) 부유형 — 오브젝트를 얇은 실·공중에 세로로 매달아 정지, (c) 콜라주형 — 배경에 미니 복제 피규어·떠 있는 테이블.
- **바디 포즈 = 한 절에 가구 지오메트리 + 신체.** `크롬 튜뷸러 체어에 무릎을 세우고 웅크려`, `등받이에 리본이 묶인 우드 체어에 languid recline·한쪽 다리 뻗음`처럼 가구 형태와 몸의 결속을 한 절로 묶는다. 또는 포착된 모션: `mid-step`, `arms outstretched mid-motion`, `one knee raised`, `walking mid-stride`.
- **raw 팩의 부정 서술은 긍정 전환.** 원본이 즐겨 쓰는 `no smile`·`no extra people`은 Tier-0 방출 프롬프트에서 금지([../compiler.md](../compiler.md) 철칙 2·E-NEG-001) — `무표정의 aloof gaze`, `프레임 안 인물 한 명`으로 재서술한다. 예외는 명시 선언된 Tier-2 캐노니컬 tail([tier2-safety.md](tier2-safety.md) §2)뿐이다.

### 15.1 조명·구도 이분 선택 (각 축에서 하나만)

| 축 | A 선택 | B 선택 |
|---|---|---|
| 조명 | `soft high-key strobe, near-shadowless 5500K` — 평면·에어리·매거진 클린 | `hard side strobe, long cast shadow` — 방향성 강한 드라마 |
| 구도 | `subject offset with generous negative space` — 카피·호흡 공간 | `centered symmetrical composition` — 아이코닉·정면성 |

두 조명을 겹치면 그림자 거동이 모순돼 판정 불가 이미지가 나온다. 한 컷은 각 축에서 하나만 고른다.

### 15.2 control token 보존 — 유명 사진 제어구

아래 두 구는 **장비 카탈로그 노이즈(철칙 4)나 콘텐츠 상표 모방(철칙 8)이 아니다.** 넓게 학습된 사진 제어 토큰이므로 [photo-vocab.md](photo-vocab.md) §7.4·[../compiler.md](../compiler.md) 철칙 10의 결과 병기 원칙으로 **보존**한다 — 반사적으로 삭제하지 않는다. [../compiler.md](../compiler.md) 철칙 4의 `Lens character:`·`Director signature:` 예외와 같은 계열이다.

| 제어구 | 병기할 관찰 결과 |
|---|---|
| `Portra film tonality` | warm skin, restrained saturation, gentle highlight roll-off, natural skin response |
| `medium-format clarity` | clean tonal separation, crisp garment edges, non-oversharpened rendering |

- 정확한 제품·상표·인물 묘사 규칙([../compiler.md](../compiler.md) 철칙 8)은 이와 **별개**다 — 필름 룩 토큰은 콘텐츠 상표가 아니다.
- 한 컷에 필름명은 여전히 1개 이하([tier2-safety.md](tier2-safety.md) §13). `Portra film tonality`는 필름 스택이 아니라 톤 앵커로 1회만 쓴다.

### 15.3 문화 앵커 보존 — 자격화 조건

`Korean woman`·`East Asian woman` 같은 정체성 앵커와 romanized 한국 뷰티어(`chok-chok skin`, `aegyo-sal`, 자격화된 `glass skin translucency`)는 **생성 제어력이 있을 때 보존**한다. [tier2-safety.md](tier2-safety.md) §13은 이들의 **무자격 남용**(국적 단독·과잉)을 버릴 뿐 반사적 삭제를 요구하지 않는다.

| 앵커 | 자격화 규칙 |
|---|---|
| `Korean woman` / `East Asian woman` | 성인 가상 페르소나로. 관찰 가능한 해부/스타일/마감과 페어. **국적에서 피부색·얼굴형·체형 추론 금지**([tier2-safety.md](tier2-safety.md) §13, 검증기 `E-NAT-SKIN`) |
| `chok-chok skin` / `aegyo-sal` | 로마자 유지 + 관찰 결과 병기: chok-chok → `hydrated dewy base`, aegyo-sal → `soft under-eye fullness` |
| `glass skin translucency` | **controlled beauty term.** `soft subsurface glow, 유리·플라스틱 광택 아님`으로 자격화. 무자격 사용은 [tier2-safety.md](tier2-safety.md) §13의 `glass skin 과잉` |

### 15.4 글로우 적층 금지 — 주 글로우 1 + 매트존

피부 마감 토큰(`dewy`, `luminous skin`, `subsurface glow/sheen`, `wet-look`, `glass skin`, `high-shine`)을 4종 이상 쌓으면 피부가 플라스틱·유리로 뭉갠다. **주 글로우 레시피 1개**를 고르고, 필요하면 전략적 **매트존**(`매트한 T존`, `semi-matte cheek`, `restrained sheen`)으로 대비를 준다. 검증기 `W-GLOW-STACK`(글로우 4종+ 매트존 부재).

malformed 피부 토큰 정규화: `micro skin texture AI`·`skin texture AI` 류는 관찰 언어로 — `natural skin texture, visible pores, fine vellus hair`. 검증기 `E-SKIN-AI`. 국적-피부 고정 톤(`yellow skin` 류)은 `E-NAT-SKIN` — 피부는 국적이 아니라 관찰(hydrated base, flushed cheeks)로 쓴다.

**완성 예제 — Tier-0 컨셉-콜리전(부정문 0, 검증기 `ok:true`·경고 0 확인 완료):**

```text
20대 후반 East Asian woman 1인 단독, chok-chok skin(dewy base)과 aegyo-sal, 슬릭백 번, 한국 남성지풍 클린 화보 컷, office utility × balletcore 충돌: 그레이 테일러드 블레이저와 새틴 발레 플랫, 클립보드·머그컵을 실로 매단 부유 소품, 리본 묶인 우드 체어에 languid recline·한쪽 다리 뻗음, 크림 심리스 배경, soft high-key strobe near-shadowless 5500K, 무표정의 aloof gaze, subject offset with generous negative space, 팔레트 #F2ECE1 #D8C7B0 #9FB0C4 #2B2A28, glass skin translucency는 유리 아닌 soft subsurface glow로 자격화 + 매트한 T존, natural skin texture, visible pores, subtle film grain, Portra film tonality, medium-format clarity(clean tonal separation), AR 3:4
```

실측: 564자. Tier-0이므로 부정문 0개다. 이 예제는 `scripts/fixtures/good/editorial_collision.txt` 회귀 기준선과 동일하다.
