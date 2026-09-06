# 에디토리얼 패션 — Format B·템플릿·Soul 교차

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

## 1. Format B 정식 스펙 — 화보 플랫 콤마형

Format B는 라벨 섹션(`Scene:` 등) 없이 자연어 문장이나 콤마 절로 쓰는 형식이다. 요청을 전달하는 짧은 문장을 기본으로 하고, 상세 화보를 조합할 때만 아래 슬롯을 참고한다. 레코드의 `format: "B"` 값은 그대로 유지한다.

**상세 조립 시 참고 순서 — 요청 결과를 바꾸는 슬롯만 선택:**

```text
피사체 → 얼굴/헤어 → 장르/장면/포즈 → 의상 → 구도 → 조명 → 팔레트 → 질감 → [Tier-2 tail] → [S3 한정 AR x:y]
```

| 규칙 | 값 |
|---|---|
| 길이·슬롯 | [../surfaces.md](../surfaces.md) §0-1·§0-2를 따른다. 이 형식에 별도 최소·목표 길이를 두지 않는다. |
| 기본 AR | 표면별 기본값과 유효성 판정은 [../compiler.md](../compiler.md) §4 표가 정본 |
| 장르앵커 | 요청한 화보 성격이나 배치 일관성을 정할 때만 쓴다. `한국 남성지풍 클린 화보 컷`은 선택 예시다. |
| 팔레트 | 색상 지정이 결과를 바꿀 때만 쓴다. 일반 Format B에는 HEX 개수 의무가 없으며, 전문 레인을 선택했다면 해당 팔레트 계약을 따른다. |
| 끝 토큰 | S3 표면에서만 `AR x:y` 하나. S1·S2는 본문 AR 0개. 정본: [../compiler.md](../compiler.md) 철칙 1·§5 |
| Tier-2 tail | 선언된 tier 2에서만, [tier2-safety.md](tier2-safety.md) §2 규칙대로 선택한 시각 명세 뒤 · AR 직전 |

- 요청한 주피사체와 인원수를 앞에 둔다. `1인 단독`은 단독 컷을 요청했을 때만 쓴다. Tier-2 선언은 해당 레인의 정본을 따른다.
- 얼굴·헤어·의상·조명·질감을 빈칸 채우기 위해 추가하지 않는다. 원본 보존이나 정확 카피처럼 요청한 조건은 생략하지 않는다.
- 검증기 탐지: 라벨 섹션 <3 + 팔레트 키워드 또는 HEX≥3 + 끝 AR + 평탄 단문 → Format B로 자동 판정. 이는 기존 레코드의 표현 형태를 분류하는 힌트이며, B로 판별되도록 팔레트나 문장을 덧붙이라는 요구가 아니다.

**상세 예제 — Tier-0 (일반 안전 화보, 네거티브 0개):** 여러 축을 지정한 기존 예시이며 일반 프롬프트의 길이·슬롯 의무가 아니다.

```text
20대 후반 한국 여성 모델 1인 단독, 차분한 자신감이 도는 표정과 natural skin texture, visible pores, subtle film grain 은은한 윤기, 낮게 묶은 로우 번 헤어에 잔머리 몇 가닥, 한국 남성지풍 클린 화보 컷, 미니멀한 스튜디오 세트에서 우드 스툴에 걸터앉아 상체를 곧게 세우고 정면을 응시하는 포즈, 아이보리 오버사이즈 울 코트에 크림 터틀넥 니트와 하이웨이스트 와이드 슬랙스, 전신이 여유 있게 담기는 세로 구도 아이레벨 시점 상하 여백 넉넉, 부드러운 창가 자연광이 왼쪽에서 들어와 얼굴에 잔잔한 하이라이트와 긴 소프트 섀도, 팔레트 #F5F0E8 #D8CBB8 #8A7A66 #2E2A26, 매트한 울 질감과 니트 짜임 디테일에 미세한 필름 그레인, AR 2:3
```

실측: 400자. Tier 0이므로 부정문 0개다.

S1-legacy jsonl 레코드로 쓸 때([../production.md](../production.md) §2):

```json
{"id": "hwabo_001", "ar": "2:3", "size": "1024x1536", "format": "B", "tier": 0, "quality": "high", "full_prompt": "…위 프롬프트 전문…"}
```

- `ar`과 프롬프트 끝 `AR` 토큰이 다르면 `E-REC-ARMATCH`.
- `size`가 6종 밖이면 `E-SIZE-LOCK`.
- `palette`를 지정한 record는 해당 색이 `full_prompt`에도 반영되어야 한다(`W-PALETTE-MISS`). 일반 컷의 무팔레트 자체는 결함이 아니다.

### 1.1 슬롯 토큰 시스템 — 작성 단계 전용

아래 대괄호 슬롯은 상세 작성·변주 단계의 내부 표기다. 필요한 슬롯만 선택하고, 방출 직전에 선택한 슬롯을 실문구로 치환한다. 쓰지 않는 슬롯은 제거한다.

| 슬롯 | 정의 (1줄) | 채움 예 |
|---|---|---|
| `[PERSONA_LOCK]` | 동일 가상 인물의 시리즈를 요청한 경우에만 쓰는 컷 간 일관성 단서 | 20대 후반 한국 여성 모델, 균형 잡힌 이목구비, 컷마다 동일 문구 |
| `[SOLO_ASSERT]` | 프레임 내 인물 1인 단독 선언 | 1인 단독, 프레임 안에 인물 한 명 |
| `[EDITORIAL_TONE]` | 요청한 상업 화보/룩북 맥락을 정하는 장르 단서 | 한국 남성지풍 클린 화보 컷 |
| `[POSE_CONFIDENCE]` | 절제된 자신감의 바디랭귀지. 유혹 어휘 대체 | 상체를 곧게 세운 자세, 정면 응시, 턱 살짝 든 |
| `[SILHOUETTE]` | 신체가 아니라 실루엣 라인을 서술 | 길게 떨어지는 바디라인, 깨끗한 허리 라인, 목과 어깨 선 |
| `[OUTFIT_SCHEMA]` | 결과를 가르는 의상 색·소재·의류종·핏/디테일. 원본 의상 보존 요청이면 새 의상을 설계하지 않는다 | 크림색 새틴 로브 세트, 발목 길이, 여유로운 핏 |
| `[GARMENT_SAFE_SET]` | 검증된 안전 의상 조합 풀에서 선택 | 테일러드 블레이저 + 불투명 이너 + 하이웨이스트 팬츠 |
| `[CAMERA_SLOT]` | 렌즈감·거리·시점·여백 중 결과를 가르는 정보 | 85mm 느낌, 전신 세로, 아이레벨, 여백 넉넉 |
| `[LIGHT_MOMENT]` | 요청에 필요한 시간대·방향·광질·그림자 결과 | 골든아워 사이드라이트, 길게 눕는 소프트 섀도 |
| `[COLOR_BREATH]` | 필요한 색 관계 또는 정확 색상 지정 | 팔레트 웜 뉴트럴 #F2E8DA #D9B48F #24303B |
| `[SAFETY_ASSERT]` | Tier-2 성인·비노출 선언. [tier2-safety.md](tier2-safety.md) §2 동결 문구 그대로 | [tier2-safety.md](tier2-safety.md) §2 참조. 수정 금지 |
| `[NEGATIVE_TAIL]` | Tier-2 전용 화이트리스트 부정 꼬리. [tier2-safety.md](tier2-safety.md) §2 동결 문구 | [tier2-safety.md](tier2-safety.md) §2 참조. 수정 금지 |

> SAFETY_ASSERT/NEGATIVE_TAIL의 유일한 정본은 [tier2-safety.md](tier2-safety.md) §2다. 이 파일에는 동결 문자열을 두지 않으며, 사용할 때 해당 문서에서 byte-for-byte로 인용한다.


배치 변주는 요청에서 바꾸도록 한 축만 조합한다. 인물수·원본 정보처럼 고정한 조건은 유지하며, 안전 선언은 명시된 Tier-2 레인에서만 정본대로 고정한다.

방출 규칙: 최종 프롬프트는 선택한 슬롯이 모두 치환된 상태여야 한다. 대괄호 토큰이 한 글자라도 남으면 검증기 `E-SLOT-LEAK`. 슬롯 표기는 이 문서와 배치 설계 메모 안에서만 산다. 철칙: ../compiler.md.
## 6. MASTER_TEMPLATE_V4 — 10섹션 페이스트 블록

판정문: **단독 인물 화보는 짧은 Format B 우선**이다. V4 10섹션은 해당 상세 양식을 요청한 룩북/챕터 시퀀스용이다. 아래 섹션·개수 규칙을 일반 화보의 필수 조건으로 옮기지 않는다. (레거시 주의: V4의 메타 필드·8룩 폴더 규칙은 별도 룩북 프로젝트 체계에서 온 것이다. 이 레포의 러너 레코드 스키마([../production.md](../production.md) §2)에는 없는 필드이며, 예제·fixtures·검증기는 전부 Format A/B 체계다 — V4 메타를 jsonl 필드로 승격하지 않는다.)

| 섹션 | 내용 |
|---|---|
| §0 Creative Direction | 사진가 voice 한 단락 |
| §1 목적/용도 | 컬렉션명 + publication tier |
| §2 핵심 브리프·페르소나·장면 | 나이+캐스팅 + 미감 어휘 A/B/C에서 5~8개 |
| §3 필수 요소/Material | 의상 HEX·소재·핏, 배경 HEX+거리 |
| §4 환경 호흡 | 피부톤↔배경 HEX 색온도/밝기 통합 단락. 필수 |
| §5 빛의 모먼트 | L1~L6 여섯 줄, 장비 스펙은 결과로 환원 |
| §6 구도/공간 | C-NN + `Lens character:` + `Director signature:` |
| §7 재질/매체 | Texture + Film 3파트 |
| §8 제약 | 긍정형 스타일링 가이드로 작성. 예: `modest styling, tasteful editorial framing` |
| §9 narrative link | 전후 컷과 이어지는 제스처·색·공간 단서 |
| §10 출력 | `{ar} · {size}` |
| 메타 | look_id / style / look_title / ar / size / persona / collection / composition / chapter / status / output_path |

작성 원칙:

- 8룩 = 5챕터 시퀀스(1-ARRIVAL / 2-STILLNESS / 3-MATERIAL / 4-GESTURE / 5-ESCAPE).
- Composition C-NN은 8룩 unique. AR 7종: 2:3·4:5·1:1·3:2·9:16·16:9·4:3.
- §2 페르소나는 8룩 char-by-char 동일. 얼굴 일관성 목적이다.
- §5 L1~L6 전부 한 줄씩, 장비명 대신 결과. §6 `Lens character:` + `Director signature:` 필수.
- 미감 어휘를 사용하고 해부학/클리니컬 어휘는 쓰지 않는다. 이미지 첨부 없이 텍스트만으로 작성한다.
## 12. Format B ↔ Higgsfield Soul 교차 규칙

같은 화보 요청이라도 표면이 다르면 어휘를 변환한다. **gpt-image-2 Format B**는 §1의 짧은 자연어 기본형과 [../compiler.md](../compiler.md) §4의 표면별 슬롯·AR 규칙을 따른다. 팔레트·장르·렌즈감은 요청 결과를 바꿀 때만 남기며, Tier-2 assert/tail 페어는 명시된 레인에서만 유지한다.

**Higgsfield 플랫폼에서 Soul V2를 선택했을 때**는 [../soul-v2-director.md](../soul-v2-director.md)의 참조 순서에 맞춰 필요한 시각 조건만 한 문단에 쓴다. 비율·품질·참조·정체성 기능은 현재 모델과 호출 도구가 실제로 제공하는 것만 사용한다. 스틸 프리셋이나 훈련 절차를 필수로 가정하지 않는다. UI가 전달한 팔레트·무드는 본문에 반복하지 않고 HEX 개수를 채우지 않는다. 카피가 필요하면 같은 결과물의 요구로 유지하고 모델·편집 지원을 확인한다. 얼굴 참조가 정체성을 전달하면 외모를 반복해 새로 설계하지 않는다.

새 브랜드 설정이 필요한 경우 Format B는 가상 컬렉션·가상 라벨을 쓰고, Soul 레인은 디자인 앵커로 주1+보조1까지 허용하되 로고·텍스트 렌더와 의복 구조 치환은 금지한다. 공통으로 자기완결과 원본·정확 카피 보존을 지킨다. 길이·상세도는 [../surfaces.md](../surfaces.md) §0-1·§0-2, 인물·피부·네거티브의 적용 조건은 [../compiler.md](../compiler.md)의 해당 철칙을 따른다.

| 요청 요소 | Format B 변환 | Soul 변환 |
|---|---|---|
| 비율 | S3에서만 끝 토큰, 그 밖의 표면은 [../compiler.md](../compiler.md) §4의 파라미터 규칙 | `[프리셋: Flash Editorial · 비율 2:3 — UI에서 선택]` 라벨 |
| 장르 | 요청한 장르를 구분할 때만 짧게 명시 | 실제 프리셋이 전달하지 않은 장르 조건만 본문에 |
| 안전 | Tier-2면 assert 첫 절 + tail AR 직전 | 긍정형 안전 스타일링 문장. 고정 tail을 본문에 억지 삽입하지 않음 |
| 조명 | 필요한 경우 `부드러운 창가 자연광이 왼쪽에서...` 같은 결과 절 | L3 골격: `direct on-camera flash, rapid highlight falloff, dense background shadow` 식 키라이트 방향·경도 명시 |
| 팔레트 | 지정 색이나 색 관계가 결과를 바꿀 때만 포함 | `Color signature` 레퍼런스 1~20장으로 전역 톤 전달. 필요 시 `observed_palette` 3~5개는 soft handoff/QC metadata만 |
| 브랜드 | 가상 컬렉션·가상 라벨 | 디자인 앵커 ≤1+1 (매핑: [../soul-v2-director.md](../soul-v2-director.md)), 로고 렌더 금지 |
| 카메라·질감 | 구도나 표면 표현을 정할 때 결과 기반으로 압축 | 필요한 빛·심도·소재 결과만 선택 (선택 로직: [../soul-v2-director.md](../soul-v2-director.md)) |
| 텍스트 | 필요 시 gpt-image-2 텍스트 렌더 가드 사용 | 카피와 출력 수를 보존하고 실제 모델·편집 지원 확인 |

Soul 스틸의 상세 예시 ([../soul-v2-director.md](../soul-v2-director.md) 참조 순서, 필수 슬롯 아님):

```text
[프리셋: Flash Editorial · 비율 2:3 | Color signature: cool urban night reference 1장 — UI에서 선택/업로드]
late-20s Korean woman, 짧은 웨이브 단발, 무광 블랙 레더 재킷에 실버 이어커프, 밤의 도심 주차장 콘크리트 기둥 앞에 단독으로 서서 카메라를 정면으로 응시, three-quarter 구도 아이레벨, Y2K street snap 무드, 어두운 콘크리트와 소듐등 톤 배경, direct on-camera flash 특유의 강한 정면광과 rapid highlight falloff, 뒤로 짙게 떨어지는 dense shadow, Contax G2, 35mm lens, Fujifilm Superia 400 color response, cracked patent leather reflections, natural skin texture, visible pores, subtle film grain.
```
## 14. 작성 체크리스트

| 체크 | 통과 기준 |
|---|---|
| Format B | 필요한 내용만 자연어로 작성, 라벨 섹션 없음, AR은 해당 표면 규칙 준수 |
| 길이 | [../surfaces.md](../surfaces.md) §0-1·§0-2에 따라 실측하며, 짧음 자체는 결함이 아님 |
| 팔레트 | 요청이나 전문 레인에서 지정한 경우만 포함. 지정한 record와 prompt는 일치 |
| 페르소나 | 요청한 인원수·원본 정보를 보존하며 새 인물 설정은 필요한 범위에서만 작성 |
| 한국 로컬리티 | 요청한 로컬리티를 판정할 수 있는 단서만 사용. 축 개수를 채우지 않음 |
| 브랜드 | 요청한 원본과 정확 카피를 보존하고 불필요한 가상 컬렉션·라벨을 추가하지 않음 |
| 피부 | 인물·피부 표현의 적용 조건은 [../compiler.md](../compiler.md)의 해당 철칙 참조 |
| Tier-2 | SAFETY_ASSERT byte-for-byte, NEGATIVE_TAIL byte-for-byte 또는 순서 보존 부분집합, tail 단독 금지, 휴리스틱 승격 금지 |
| 의상 | 요청한 의상 구조·원본 정보를 보존하고 결과를 가르는 속성만 명시 |
| 사진 어휘 | 장비명 직접 나열보다 빛·심도·질감·색 결과 |
| 언어 혼용 | 필요한 기술 토큰만 사용. 지정 렌더 카피는 원문 보존(compiler.md §6·§7) |
| 철칙 참조 | 철칙 전문 복사 금지. 철칙: ../compiler.md 참조 |
