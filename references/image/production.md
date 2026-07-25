# 이미지 양산·jsonl·검증기 운영

**운영 정본:** 라이브러리·배치·챕터 단위 이미지 생성은 이 파일을 따른다. 프롬프트 본문 규칙은 `look-and-concept.md`와 `typography.md`, 컴파일 금지·예외 원칙은 **철칙: compiler.md**를 참조한다. 이미지 생성 계약의 사용 절차와 스키마 검증은 [image-production-handoff.md](image-production-handoff.md)를 참조한다.

## 1. 이 파일의 적용 범위 — S1-legacy 벌크 경로

**이 파일이 기술하는 `prompts.jsonl` 벌크 스키마는 레거시 벌크 러너 경로(S1-legacy)다.** 표면 판정은 [surfaces.md](surfaces.md)가 선행하며, 아래 값을 다른 표면으로 옮기지 않는다.

| 표면 | 이 파일이 적용되나 | 정본 |
|---|---|---|
| S1 기계 계약(MPW→ImgGen2) | **아니오** — `ar` 5종·`size` 3종·`quality` 3종 | `contracts/v1/*.schema.json` + `contracts/validate.py` |
| S1-legacy 벌크 jsonl | **예** — 아래 표 | 이 파일 §2 |
| S2 플랫폼 파라미터 | **아니오** — 픽셀 개념 없음 | 모델 런타임 정의 |
| S3 붙여넣기 | **아니오** — 파라미터 없음 | [surfaces.md](surfaces.md) §3 |

**두 S1 경로는 값 집합이 다르다.** 기계 계약에서 쓸 수 있는 값은 **`contracts/v1/*.schema.json`의 enum이 전부이며, 문서의 어떤 목록도 예시일 뿐 권위가 아니다.** 아래 S1-legacy 표의 값이 그 enum에 없으면 기계 계약 경로에서는 쓸 수 없고, 쓰면 `production_geometry_mismatch`로 거부된다(2026-07-25 확인 시점 기준 예시: 비율 `2:3`·`3:2`·`4:5`, 픽셀 `1792x1024`·`1024x1792`·`2048x2048`이 스키마에 없었다 — 이 예시가 최신이라고 가정하지 말고 스키마를 직접 읽어라). 아래 표를 근거로 기계 계약 값을 정하지 마라.

### S1-legacy 벌크 러너 팩트

| 항목 | 값 | 운영 규칙 |
|---|---|---|
| 최대변 | 3840px | 초과 시 `E-SIZE-EDGE`. |
| 각 변 배수 | 16배수 | 위반 시 `E-SIZE-MULT`. |
| 비율 | ≤3:1 | 초과 시 `E-SIZE-RATIO`. |
| 총픽셀 | 655,360~8,294,400 | 범위 밖이면 `E-SIZE-PIXELS`. |
| 사이즈락 6종 | `1024x1024`, `1536x1024`, `1024x1536`, `1792x1024`, `1024x1792`, `2048x2048` | 벌크 러너 하드 제약의 안전 부분집합. **기계 계약 경로에는 적용되지 않는다.** |
| 투명 배경 | 이 벌크 경로에서 미지원(2026-07 실측) | 생성 단계는 단색 배경으로 설계하고, 컷아웃은 후속 단계(`remove_background`)로 명시한다. "비목표"가 아니라 다음 단계다. |
| quality | 작은/밀집 텍스트는 `medium` 이상, 다컷·미세 글자는 `high` | `auto` 금지, `E-REC-QUALITY`. **이 `auto` 금지는 이 경로 한정이다** — S2에서는 `auto`가 유효한 비율값이다. |
| 텍스트 고밀도 실측 | 한글 400~800자, 40컷 | 밀집 텍스트는 2048 또는 1536 장변과 `quality: high`를 우선한다. |
| 이미지 생성 러너 | 이미지 생성 툴 전용 size/quality 플래그에 의존하지 않는다. | size/quality는 산문 지시 + jsonl 필드로 전달한다. |
| 배치 크기 | 호출당 ≤10장 | 초과분은 호출을 쪼갠다. |

재검증: 위 값은 (2026-07 실측) 기준이다. 벌크 러너가 바뀌면 즉시 낡는다. 90일 넘게 재확인되지 않았으면 단정하지 말고 실제 러너로 확인한다.

**검증기 소관:** `scripts/check_prompt.mjs`는 이 S1-legacy 벌크 규칙(사이즈락 6종·ar↔size 매핑·`quality auto` 금지)과 표면/채널/엔진 컨텍스트 기반 길이 구속을 검사한다. 길이는 `--surface`(s1|s2|s3), `--channel`(bounded|unbounded)·`--channel-limit`, `--engine`(gpt-image|higgsfield|midjourney|unknown)이 주는 3층 컨텍스트 중 가장 좁은 상한이 구속한다. 표면 미지정이면 S3를 가정하고, 엔진 미지정이면 S2에서만 unknown(상한 미상 → `W-LENGTH-UNGATED` 경고), 그 외 표면은 gpt-image를 기본값으로 쓴다. jsonl 모드에서는 기계 계약 상한(스키마 2000자 코드포인트)이 무조건 살아 있고(표면·엔진 필드로 우회 불가), 더 좁은 채널 상한이 구속해도 계약 위반은 별도 `E-OVERFLOW-2000`으로 함께 보고된다. `--engine midjourney`는 구조 판정을 스코프 거부(`E-ENGINE-SCOPE`)하되 채널·계약 층의 문자 상한 판정은 그대로 적용한다 — 미드저니 자체 길이는 단어 수 소관이다(surfaces.md §0-1). **S2 플랫폼 파라미터 표면의 권위가 아니다** — 표면을 `s2`로 선언하면 길이 판정은 층 모델을 따르지만, size·구조 게이트는 여전히 S1-legacy 문법 기준이다. S2는 모델 런타임 정의로 검증한다.

## 2. prompts.jsonl 스키마

1줄이 1프롬프트 JSON이다. `full_prompt`는 러너가 그대로 소비한다. 프롬프트 끝에는 AR만 두고 앞 브래킷·`Negative:` 섹션을 두지 않는다.

```jsonc
{
  "id": "C1-LEVITATION-001",
  "category": "C1", "cut_type": "levitation_catalog", "title": "...",
  "format": "A",
  "tier": 0,
  "lane": "standard",
  "palette": ["#F7F4EC", "#B76E79"],
  "ar": "3:4", "size": "1024x1536",
  "quality": "medium",
  "output_format": "webp", "output_compression": 82,
  "full_prompt": "<순수 서술 ... 끝에 AR 3:4>",
  "labels": ["TRENCH COAT"], "korean_copy": "오늘 더 따뜻해요",
  "status": "draft",
  "qa": {"goal_fit": 0, "text_accuracy": 0, "material_realism": 0, "layout": 0},
  "output_path": "04_output/webp/C1/....webp",
  "teaching_point": "..."
}
```

| 필드 | 값 | 필수·판정 |
|---|---|---|
| `id` | 고유키 `C{n}-{CUT}-{NNN}` | 필수, 중복 시 `E-REC-DUPID`. |
| `category` | `C1` 등 | 필수. |
| `cut_type` | 컷 타입 | 권장. |
| `title` | 제목 | 권장. |
| `format` | `A` 또는 `B` | 생략 시 자동 판별. |
| `tier` | `0`, `1`, `2` | 기본 0. |
| `lane` | `standard` 또는 `editorial` | `editorial`이면 tier 2. |
| `surface` | `s1`·`s2`·`s3` | 선택. 길이 컨텍스트 전용 필드(러너 레코드 소관 — imggen2 스키마 인스턴스의 필드가 아님). CLI `--surface`가 우선하며, jsonl에서는 어느 값이든 기계 계약 상한이 유지된다. |
| `engine` | `gpt-image`·`higgsfield`·`midjourney`·`unknown` | 선택. 타깃 엔진 층. 열거 밖 값은 `E-REC-CONTEXT`. |
| `channel` | `bounded`·`unbounded` | 선택. 전달 채널 층. |
| `channel_limit` | 양의 정수 | 선택. 런타임에서 실측한 채널 상한 주입(`bounded` 함의). |
| `palette` | HEX 배열 | full_prompt 반영 누락 시 `W-PALETTE-MISS`. |
| `promo_pattern` | `P1`~`P8` | `cut_type: promo_poster`일 때 필수. 선택 파일은 `promo-router.md` 정본. |
| `tp_pattern` | `TP1`~`TP14` | `cut_type: typography_poster`일 때 필수. 라우팅·공통 계약은 `typography-poster-router.md`, 패턴별 관찰 시그니처·실패·재시도 계약은 `typography-poster-patterns.md` 정본. |
| `legibility_target` | `exact_primary` 또는 `repeated_texture` | TP 타이포의 정확 카피/반복 텍스처 의미를 고정한다. TP2·TP14만 `repeated_texture`. |
| `palette_sources` | TP 포스터는 `["TP"]` | 구조·팔레트 권한을 단일화한다. promo는 기존 P/L 규칙을 따른다. |
| `material_graft` | 선택 문자열 | TP7 재질을 TP2/TP3 표면에 이식할 때만 사용하며 두 번째 구조 권한자가 될 수 없다. |
| `look_preset` | `L1`~`L8` | promo에서 필수. L9는 구현 본문이 없어 금지. |
| `promo_text_effect` | P별 canonical effect | P1 mask, P2 extrusion, P3/P6 occlusion, P4 interlock, P5 printed_meta_ui, P7 rotated_axis, P8 staging. |
| `promo_subject` | 비어 있지 않은 문자열 | 타이포와 물리적으로 얽히는 주 피사체. `full_prompt`에 그대로 등장해야 한다. |
| `finishing_devices` | 문자열 배열 1~3개 | 바코드·메타 행·크롭마크·에디션 번호·세로 라벨·스탬프·종이 물성 등 실제 선택한 장치만 기록. |
| `palette_authority` | `P` 또는 `L` | promo에서 필수. |
| `palette_sources` | `["P"]` 또는 `["L"]` | 권한자와 같은 단일 소스만 허용. |
| `ar` | `1:1`, `2:3`, `3:4`, `4:5`, `3:2`, `4:3`, `16:9`, `9:16` | 8종 목록 밖이면 `E-AR-ENUM`; 프롬프트 끝과 다르면 `E-REC-ARMATCH`. |
| `size` | 사이즈락 6종 | 필수, ar 매핑 불일치 시 `E-SIZE-AR`. |
| `quality` | `low`, `medium`, `high` | 필수, `auto` 금지. |
| `output_format` | `webp` 등 | 운영 출력 포맷. |
| `output_compression` | 82, 텍스트 많으면 88 | 텍스트 많으면 88. |
| `full_prompt` | 순수 서술 + 끝의 `AR x:y` | 필수. |
| `labels` | 렌더·분류 라벨 배열 | 선택. |
| `korean_copy` | 한국어 카피 | 텍스트 검증 트리거. |
| `status` | `draft`→`queued`→`generated`→`approved`/`rejected`→`retry` | 운영 상태. |
| `qa` | `goal_fit`, `text_accuracy`, `material_realism`, `layout` | 합격선: 평균 ≥4 AND `text_accuracy ≥ 4`. |
| `output_path` | 저장 경로 | 필수. |
| `teaching_point` | 20~80자 | 교육용일 때만 사용. |

## 3. format/tier/lane 결정

| 항목 | 값 | 결정 규칙 |
|---|---|---|
| Format A | 섹션형 프롬프트 | `Scene:`, `Camera:`, `Lighting:`, `Color grading:`, `Texture/Medium:`, `Text-in-image:` 중 3개 이상이면 A. |
| Format B | 플랫 콤마형 단문 | 팔레트 또는 HEX 3개 이상 + 끝의 `AR x:y`가 있으면 B. |
| Tier 0 | 기본 | 렌더 텍스트가 없거나 긍정형 가드만 쓰는 일반 컷. |
| Tier 1 | 텍스트 가독 가드 | 렌더 텍스트, KO/EN 혼합, 텍스트 3블록 이상, 실패 후 재시도, 밀집 텍스트. |
| Tier 2 | editorial lane | `lane: "editorial"` 또는 명시 `tier: 2`. 휴리스틱 승격 불가. |

| 티어 결정 우선순위 | 적용 |
|---|---|
| 1 | `--tier` 플래그 |
| 2 | jsonl `tier` 필드 |
| 3 | jsonl `lane` 필드: `editorial` → 2 |
| 4 | 휴리스틱: 렌더 텍스트 → 1 |
| 제한 | Tier-2는 휴리스틱 승격 불가 |

## 4. 완성 예시 — Format A

### 4.1 컴파일 결과

```text
한국어 이벤트 포스터, 상업 인쇄 완성도.
Scene: 화면 상단 1/3에 굵은 세리프 메인 타이틀, 중앙에 달과 야시장 일러스트, 하단은 카피용 여백. 정돈된 매거진 레이아웃.
Camera: 정면 평면 구성, 중앙 대칭 정렬, 풀블리드.
Lighting: 부드러운 소프트박스 균등광, 옅은 콘택트 섀도로 깊이.
Color grading: 딥네이비 #0F1D30 배경, 크림 #F7F4EC 타이틀, 로즈골드 #B76E79 액센트는 달 테두리에만.
Texture/Medium: 매트 아트지 질감, 미세 그레인, 인쇄 톤.
Text-in-image: "봄밤 야시장" 상단 중앙(굵은 세리프), "4.20 SAT 6PM" 하단(콘덴스드 산세리프). 모든 텍스트는 한 번씩만, 완벽히 또렷하게.
AR 4:5
```

### 4.2 jsonl 1줄

```json
{"id":"C3-EVENT-001","category":"C3","cut_type":"event_promo","title":"봄밤 야시장","format":"A","tier":1,"lane":"standard","palette":["#0F1D30","#F7F4EC","#B76E79"],"ar":"4:5","size":"1024x1536","quality":"high","output_format":"webp","output_compression":88,"full_prompt":"한국어 이벤트 포스터, 상업 인쇄 완성도. Scene: ... AR 4:5","korean_copy":"봄밤 야시장","status":"draft","qa":{"goal_fit":0,"text_accuracy":0,"material_realism":0,"layout":0},"output_path":"out/C3-EVENT-001.webp"}
```

`full_prompt`만 떼어 `node ../../scripts/check_prompt.mjs`에 넣으면 `ok:true`가 기준이다.

## 5. 완성 예시 — Format B

Format B는 플랫 콤마형 단문 350~450자다. Tier 2 + lane editorial에서는 SAFETY_ASSERT가 피사체절 선두에 오고, NEGATIVE_TAIL이 `AR 2:3` 직전에 정확히 1회 온다.

```json
{"id":"C1-HWABO-001","category":"C1","cut_type":"editorial_solo","title":"아침 창가 라운지웨어","format":"B","tier":2,"lane":"editorial","palette":["#F7F4EC","#D9C7B8","#B76E79"],"ar":"2:3","size":"1024x1536","quality":"high","output_format":"webp","output_compression":82,"full_prompt":"adult Korean woman in her late 20s, 25+, original character, non-nude fashion editorial styling, fully opaque fabric, covered chest line, editorial upright pose, 갸름한 얼굴, 다크브라운 단발 헤어, 한국 남성지풍 클린 화보 컷, 창가의 아침빛 아래 커튼을 잡은 포즈, 크림 새틴 라운지웨어 셋업, 무릎 위 3/4 구도, soft window light, shallow DoF, 팔레트 #F7F4EC #D9C7B8 #B76E79, subtle film grain, no nudity, no nipple or genital exposure, no wardrobe malfunction, no extra people, no text, no watermark, AR 2:3","status":"draft","qa":{"goal_fit":0,"text_accuracy":0,"material_realism":0,"layout":0},"output_path":"out/C1-HWABO-001.webp"}
```

| 슬롯 순서 | 값 |
|---|---|
| 1 | 피사체(SAFETY_ASSERT) |
| 2 | 얼굴 |
| 3 | 헤어 |
| 4 | 장르앵커 |
| 5 | 장면/포즈 |
| 6 | 의상 |
| 7 | 구도 |
| 8 | 조명 |
| 9 | 팔레트 #HEX×3~5 |
| 10 | 질감 |
| 11 | Tier-2 tail |
| 12 | AR |

| Tier-2 tail 규칙 | 오류 |
|---|---|
| SAFETY_ASSERT와 페어 | 단독이면 `E-TIER2-PAIR`. |
| 캐노니컬 고정 순서의 부분집합만 허용 | 추가·중복·순서 변경은 `E-TIER2-EXTRA`. |
| 위치는 AR 직전 | 위반 시 `E-TIER2-POS`. |
| 정확히 1회 | 2회 이상이면 `E-TIER2-DUP`. |

## 6. AUTHORING_GUIDE 8섹션 변형

라이브러리·교육용에서 챕터 단위로 변수를 통제할 때 쓴다. 기본 6섹션과 별개 체계다. **§ 라벨은 작성 메타데이터다 — `full_prompt` 방출 전에 일반 헤더/문장으로 변환하며, 본문에 `§`가 남으면 검증기 W-SECTION-MARK 대상이다.**

| 섹션 | 이름 | 내용 |
|---|---|---|
| §1 | 목적·용도 | 산출물의 사용처와 목표 |
| §2 | 핵심 브리프·장면 | 장면 핵심 문장 |
| §3 | 필수 요소(엔티티 속성) | 피사체·속성·필수 오브젝트 |
| §4 | 맥락·환경 | 장소·시간·상황 |
| §5 | 구도·공간 | 카메라·프레임·그리드 |
| §6 | 빛·색·재질·매체 | 조명·HEX·질감·매체 |
| §7 | 제약(영어 키워드 2~3) | 필요한 영어 제약 키워드 2~3개 |
| §8 | 출력 | `{ar} · {size} · PNG` |

| 운영 규칙 | 값 |
|---|---|
| `sections_present` | 쓸 섹션만 렌더한다. |
| 챕터 고정 | §1·§2·§7은 전 행 동일. |
| 변수 위치 | §5 또는 §6 한 곳만 바꾼다. |
| `teaching_point` | 20~80자, 교육용일 때만. |

## 7. 이미지 생성 러너 호출 골격

배치는 챕터 단위다. 한 세션 N=8~20개, 호출당 ≤10장으로 쪼갠다. 실행 명령은 프로젝트별 래퍼를 쓰되 `--sandbox workspace-write`에 해당하는 작업공간 쓰기 샌드박스 설정을 유지한다.

```text
이미지 생성 러너 실행 --sandbox workspace-write
```

각 `full_prompt` 끝에 아래 태스크를 붙인다.

```text
TASK: Use the image_generation tool to create the image described above.
After generation, copy the output file to this exact path: {output_path}.
Reply only with the saved file path.
```

| 러너 출력 | 형식 |
|---|---|
| 이미지별 성공 | `SAVED: <path>` 1줄 |
| 이미지별 실패 | `FAILED: <id> <reason>` |
| 챕터 종료 | `DONE chapter={slug} success=N failures=N` |
| 중간 요약 | 금지 |
| 러너 역할 | 생성 후 복사만 수행 |

## 8. 검증기 사용법

검증기 경로는 이 파일 위치 기준 `../../scripts/check_prompt.mjs`다. 이 섹션은 사용법 문서이며, 생성 문서 작성 중 검증·린트 실행을 요구하지 않는다.

| 모드 | 명령 형식 |
|---|---|
| 파일 1개 | `node ../../scripts/check_prompt.mjs <file>` |
| stdin | `node ../../scripts/check_prompt.mjs` |
| jsonl | `node ../../scripts/check_prompt.mjs --jsonl <file>` |
| 티어 강제 | `node ../../scripts/check_prompt.mjs --tier <0|1|2> <file>` |
| 표면 지정 | `node ../../scripts/check_prompt.mjs --surface <s1|s2|s3> <file>` |
| 채널 상한 | `node ../../scripts/check_prompt.mjs --channel <bounded|unbounded> <file>` 또는 `--channel-limit <양의 정수>` |
| 엔진 지정 | `node ../../scripts/check_prompt.mjs --engine <gpt-image|higgsfield|midjourney|unknown> <file>` |
| API 모드 | `node ../../scripts/check_prompt.mjs --api --jsonl <file>` |
| 자체 fixture | `node ../../scripts/check_prompt.mjs --test` |

| 판정 | 의미 |
|---|---|
| `ok:true` | errors 0개. warnings는 검토 대상. |
| `ok:false` | errors 1개 이상. 생성 전 수정. |
| jsonl summary | `total`, `pass`, `fail`로 배치 단위 합격률 확인. |

## 9. 에러·워닝 코드 표

### 9.1 크기·레코드

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-SIZE-EDGE` | 최대 변 3840px 초과 | 사이즈락 6종으로 변경. |
| `E-SIZE-MULT` | 가로·세로가 16배수 아님 | 16배수 size로 변경. |
| `E-SIZE-RATIO` | 종횡비 3:1 초과 | 허용 AR로 변경. |
| `E-SIZE-PIXELS` | 총픽셀 655,360~8,294,400 밖 | 사이즈락 6종으로 변경. |
| `E-SIZE-LOCK` | size가 6종 화이트리스트 밖 | 추천 허용 size로 변경. `--api`에서는 warning 강등. |
| `E-SIZE-AR` | `ar`와 `size` 매핑 불일치 | AR 매핑표에 맞게 수정. |
| `E-AR-ENUM` | `ar`이 8종 목록 밖 | 허용 ar(`1:1`, `2:3`, `3:4`, `4:5`, `3:2`, `4:3`, `16:9`, `9:16`)로 교체. |
| `E-REC-FIELD` | 필수 필드 누락 | `id`, `category`, `ar`, `size`, `quality`, `full_prompt`, `output_path` 채움. |
| `E-REC-DUPID` | id 중복 | id 고유화. |
| `E-REC-QUALITY` | `quality: "auto"` | `low`, `medium`, `high` 중 하나로 명시. |
| `E-REC-JSON` | jsonl 라인 파싱 실패 | 해당 라인을 JSON 1객체로 수정. |
| `E-REC-ARMATCH` | full_prompt 끝 AR과 record.ar 불일치 | 두 값을 일치. |

### 9.2 포맷·프롬프트 구조

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-AR-END` | 끝에 `AR x:y` 없음 | 프롬프트 맨 끝에 AR 토큰 추가. |
| `E-CAT-LANG` | 매체/카테고리 언어 없음 | 첫 절에 결과물 장르 추가. |
| `E-CAM-LANG` | 카메라·구도·레이아웃 언어 없음 | 구도·레이아웃 토큰 추가. |
| `E-LIGHT-LANG` | 조명 지시 없음 | 조명 토큰 추가. |
| `E-TEX-LANG` | 재질·질감·매체 디테일 없음 | Texture/Medium 또는 질감 토큰 추가. |
| `E-FMT-B-HEX` | Format B HEX 3~5개 범위 밖 | HEX 3~5개로 수정. |
| `E-HEAD-BRACKET` | 앞머리 `[AR x:y SIZE wxh]` 브래킷 | size는 필드로 이동, 프롬프트 끝에는 AR만 남김. |
| `E-SLOT-LEAK` | `[TITLE]`류 슬롯 잔존 | 실제 값으로 치환. |
| `E-SD-VOCAB` | 폐기 품질태그 사용 | 결과 상태·카메라·질감 토큰으로 교체. |
| `E-WEIGHT` | `(word:1.3)` 가중치 문법 | 자연어 서술로 교체. |
| `E-MJ-FLAG` | `--ar/--v/--no`식 플래그 | jsonl 필드와 끝 AR 토큰으로 교체. |

### 9.3 TP 타이포그래피 포스터

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-TP-PATTERN` | TP1~TP14 밖이거나 패턴 누락 | TP 하나를 선택. |
| `E-TP-LEGIBILITY` | 레그빌리티 값 누락 또는 TP2/TP14 밖의 `repeated_texture` | 허용 패턴과 목표를 정렬. |
| `E-TP-PALETTE` | 팔레트 권한이 `["TP"]` 단일 소스가 아님 | TP 하나만 권한자로 기록. |
| `E-TP-PALETTE-RANGE` | TP 팔레트가 HEX 2~4개 밖 | TP 우선 범위 2~4개로 수정. |
| `E-TP-GRAFT` | TP7 표면 재질 형식·대상 위반 | `TP7 surface material: …`을 TP2/TP3에만 사용. |
| `E-TP-DUP-GUARD` | 반복 텍스처에 `no duplicate text` 사용 | 반복부에서 해당 가드를 제거. |
| `E-TP-TEXTURE` | 반복부의 텍스처 선언 누락 | 비판독 `text-like texture`로 선언. |
| `E-TP-REPEATED-GUARDS` | 반복 텍스처의 잔여 가드 누락 | `no invented glyphs`와 `no watermark`를 모두 추가. |
| `E-TP-EXACT-PRIMARY` | exact primary의 따옴표 카피 누락 | 주 카피를 따옴표 안에 고정. |
| `E-TP-EXACT-GUARD` | exact primary의 중복 방지 가드 누락 | `no duplicate text`를 추가. |

### 9.4 텍스트·티어·네거티브

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-TEXT-QUOTE` | Text-in-image/korean_copy가 있는데 따옴표 카피 0개 | 렌더 카피를 따옴표로 고정. |
| `E-TEXT-DUP` | 동일 따옴표 카피 2회 이상 | 모든 카피를 1회만 남김. |
| `E-NEG-SECTION` | `Negative:` 섹션 존재 | 긍정형 결과 서술로 통합. |
| `E-NEG-TIER` | 티어 미선언 상태에서 Tier-1/2 화이트리스트 사용 또는 렌더 텍스트 없이 Tier-1 사용 | `tier`·`--tier` 선언 또는 문구 제거. |
| `E-NEG-001` | 화이트리스트 밖 영어 부정문 | 원하는 결과 상태를 구체 명사로 재작성. |
| `E-TIER2-DUP` | NEGATIVE_TAIL 2회 이상 | 정확히 1회만 남김. |
| `E-TIER2-EXTRA` | tail 항목 추가·중복·순서 변경 | 캐노니컬 순서의 부분집합으로 수정. |
| `E-TIER2-POS` | NEGATIVE_TAIL이 AR 직전이 아님 | AR 직전 마지막 절로 이동. |
| `E-TIER2-PAIR` | tail 단독 사용 | SAFETY_ASSERT 앵커 3개 이상과 페어. |

### 9.5 promo 라우팅·게이트

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-PROMO-ROUTE` | `promo_poster`가 C7로 라우팅됨 | C3/C5 + P 패턴으로 이동. |
| `E-PROMO-PATTERN` | P1~P8 단일 선택 없음 | 라우터에서 P 하나 선택. |
| `E-PROMO-LOOK` | L1~L8 단일 룩 없음 | 구현된 L 하나 선택. |
| `E-PROMO-EFFECT` | P와 `promo_text_effect`가 불일치 | P별 canonical effect로 정렬. |
| `E-PROMO-SUBJECT` | `promo_subject`가 없거나 prompt에 없음 | 타이포와 얽히는 주 피사체를 명시. |
| `E-PROMO-PALETTE-CONFLICT` | P/L 팔레트 권한이 둘이거나 메타 불일치 | 권한과 source를 하나로 축소. |
| `E-PROMO-COLOR-LOCK` | 최종 HEX가 2~3색 밖 | 권한 팔레트만 남김. |
| `E-PROMO-TYPE-STRUCTURE` | 타이포와 피사체의 물리 관계 없음 | 마스크·압출·가림·회전·인쇄 구조를 명시. |
| `E-PROMO-FINISH` | 마감 장치가 1~3개 밖 | 허용 장치 1~3개만 유지. |
| `E-PROMO-CARD-DRIFT` | C7 소품·배지 밀도로 후퇴 | 정보 장치를 걷고 위계·여백 긴장 복구. |
| `E-PROMO-COPY` | 정확 카피가 1회가 아님 | `korean_copy`를 따옴표 안에 1회. |
| `E-PROMO-KO-MASK-LEN` | 한글 마스킹·압출이 3음절 이상 | 2음절로 축소하거나 효과 변경. |
| `E-PROMO-METAUI` | P5가 실제 앱 화면으로 읽힘 | 인쇄된 메타 그래픽으로 재서술. |

### 9.6 길이·컨텍스트

| 코드 | 조건 | 조치 |
|---|---|---|
| `E-OVERFLOW-2000` | 기계 계약(스키마) 또는 기본 채널 배선의 상한 초과 | 장식 → 중복 → 방법 설명 순으로 감량, 그래도 넘으면 컷 분리. |
| `E-OVERFLOW-LIMIT` | 기본 배선 밖 유한 상한(엔진 32,000 또는 실측 채널 값) 초과 | 같은 감량 절차. 메시지의 구속 층·상한을 확인. |
| `E-ENGINE-SCOPE` | `--engine midjourney` 선언 | 이 검증기로 구조 판정 불가 — 미드저니 단어 대역은 surfaces.md §0-1 소관. 채널·계약 층 문자 판정은 함께 보고됨. |
| `E-REC-CONTEXT` | 레코드 surface/engine/channel/channel_limit의 열거·타입 위반 | 허용 값으로 수정. |
| `E-INPUT-FLAG` | CLI 플래그의 열거 밖 값 또는 미지 플래그 | 플래그 철자·값 수정. |
| `W-LENGTH-UNGATED` | 세 층 모두 수치 상한 없음 | 신호 밀도로 관리(surfaces.md §0-1). |

### 9.7 워닝

| 코드 | 조건 | 조치 |
|---|---|---|
| `W-SHORT-A` | Format A 프롬프트가 짧음 | 시각 명세 보강. |
| `W-LEN-B` | Format B 길이 300~550자 밴드 밖 | 350~450자 타깃으로 조정. |
| `W-HEX-MISS` | HEX 팔레트 없음 | 장면 팔레트와 일치하는 HEX가 최종 3~5개가 되도록를 HEX로 추가. |
| `W-TEXT-ROLE` | 따옴표 카피 2개 이상인데 롤 라벨 없음 | headline/subhead/caption 등 롤 추가. |
| `W-TEXT-MIXLANG` | 한 따옴표 문자열 안 KO+EN 혼합 | 언어별 라벨 분리. |
| `W-TEXT-GUARD` | 텍스트가 있는데 가독성/반복 가드 없음 | 기본 가독 가드 추가. |
| `W-SECTION-MARK` | 본문에 `§` 기호 사용 | 헤더 형식으로 변경. |
| `W-FILLER` | 죽은 형용사 잔존 | 수치·몸 반응·구체 예시로 환원. |
| `W-HWABO-TOKEN` | 화보 실패 토큰 감지 | 단정한 스타일링 어휘로 교체. |
| `W-PALETTE-MISS` | record palette가 full_prompt에 반영되지 않음 | full_prompt에 HEX 반영. |
| `W-TEXT-QUALITY` | 텍스트 heavy record인데 `quality`가 `high`가 아님 | `quality: "high"`로 변경. |

## 10. 양산 배치 전 체크리스트

발전 규칙: 배치 실행 전 아래 표를 위에서 아래로 확인한다.

| 순서 | 체크 | 합격 기준 | 실패 시 조치 |
|---|---|---|---|
| 1 | 입력 행 수 | 호출당 ≤10장 | 10장 단위로 분할 |
| 2 | id | 전 행 고유 | 중복 id 재번호화 |
| 3 | format/tier/lane | Format A/B, tier, lane 결정 완료 | 티어 우선순위 표로 재결정 |
| 4 | size/ar | AR 매핑과 사이즈락 6종 일치 | 허용 size로 교체 |
| 5 | quality | 텍스트 heavy는 `high`, `auto` 0개 | `quality` 수정 |
| 6 | full_prompt 끝 | 전 행 `AR x:y`로 종료 | 끝 토큰 수정 |
| 7 | 팔레트 | 핵심 HEX가 full_prompt에 반영 | 누락 HEX 추가 |
| 8 | 텍스트 | 따옴표·롤 라벨·가독 가드 적용 | `typography.md` 순서도 적용 |
| 9 | 금지 구조 | 앞 브래킷·`Negative:`·슬롯 잔존 0개 | 긍정형 서술과 실제 값으로 교체 |
| 10 | output_path | 저장 경로가 행별로 다름 | 경로 고유화 |
| 11 | 투명 배경 | 생성 프롬프트에 투명 요구 0개 | 투명이 필요하면 후속 컷아웃 단계(`remove_background`)로 표기 |
| 12 | QA 필드 | `goal_fit`, `text_accuracy`, `material_realism`, `layout` 존재 | 누락 필드 추가 |

## 11. AR↔size 매핑 (S1-legacy 벌크 한정)

**이 표는 §1이 선언한 S1-legacy 벌크 경로에만 적용된다.** 기계 계약(S1)의 `ar`↔`size` 매핑은 `contracts/validate.py`의 `GEOMETRY`가 판정하며 값 집합이 더 좁다. 이 표의 행을 기계 계약 경로로 옮기지 마라.

| AR | 허용 size |
|---|---|
| `1:1` | `1024x1024`, `2048x2048` |
| `2:3` | `1024x1536` |
| `3:4` | `1024x1536` |
| `4:5` | `1024x1536` |
| `3:2` | `1536x1024` |
| `4:3` | `1536x1024` |
| `16:9` | `1792x1024` |
| `9:16` | `1024x1792` |
