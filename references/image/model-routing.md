# 모델 라우팅 — 목적축 → 후보 모델 (S2 플랫폼 표면)

**이 파일은 후보를 좁히는 용도다. 파라미터의 정본이 아니다.** 후보 순서는 작업 목적별 작성 지침이며 성능 실측 순위가 아니다. 실제 파라미터·비율·미디어 롤은 현재 모델 상세 조회가 이긴다. 표면 판정은 [surfaces.md](surfaces.md)가 선행한다.

"Higgsfield"는 엔진 하나가 아니라 여러 공급자의 모델을 호스팅하는 **플랫폼**이다. "Higgsfield로 간다"는 라우팅 결정이 아니며, 목적축에서 **모델 id**까지 내려가야 결정이 끝난다.

## 1. 이미지 — 목적축 라우팅

| 목적 | 1순위 | 대안 | 결정 파라미터 |
|---|---|---|---|
| 정확한 텍스트 렌더·타이포·로고 배치 | `openai_hazel` ⚠️비율제약 | `nano_banana_pro`, `gpt_image_2` | `quality`(hazel) / `resolution`(nbp, gpt) |
| 다이어그램·인포그래픽·도해 | `nano_banana_pro` | `openai_hazel`, `gpt_image_2` | `resolution: 2k~4k` |
| 벡터 로고·아이콘·플랫 브랜드 자산 | `recraft_v4_1` | — | `model_type: vector`/`utility_vector`, `colors[]`, `background_color` |
| 제품컷·목업(깨끗·정면·예측가능) | `recraft_v4_1` `model_type: utility` | `marketing_studio_image` | `background_color`, `resolution` |
| 인물 사실감·UGC·패션 에디토리얼 | `soul_2` (=`soul_v2`) | `nano_banana_2`, `seedream_v5_pro` | `quality: 1.5k/2k`, `soul_id` |
| 동일 인물 시리즈 | `soul_2` + `soul_id` | `soul_cast`(시네마틱 아이덴티티) | `soul_id` |
| 시네마 스틸·컨셉아트 | `soul_cinematic` | `cinematic_studio_2_5` | `quality` / `resolution: 4k` |
| 지시 기반 편집·변형 | `seedream_v5_pro` | `seedream_v5_lite`, `flux_kontext`, `openai_hazel` | `resolution: 1k/1.5k/2k` |
| 스타일 전이·컨텍스트 편집 | `flux_kontext` | `seedream_v5_pro` | — |
| 프롬프트 준수 정밀도 | `flux_2` | `nano_banana_pro` | `variant: pro/flex/max`, `resolution` |
| 초고해상(4K 이상) | `seedream_v4_5` (`quality: high` ~6K) | `nano_banana_2/pro`, `gpt_image_2`, `cinematic_studio_2_5` (4k) | `quality` / `resolution` |
| 광각·와이드 비율(21:9 등) | `kling_omni_image` | `nano_banana_*`, `seedream_v5_pro`, `recraft_v4_1` | `aspect_ratios` 배열 확인 |
| 표현적·고대비 크리에이티브 | `grok_image` | `grok_image_2_0`, `flux_2` | `mode`(grok_image) / `quality`(grok_image_2_0) |
| 빠르고 싼 시안 스윕 | `z_image` | `nano_banana`, `nano_banana_2_lite` | `thinking: MINIMAL/HIGH`(lite) |
| DTC 광고 크리에이티브 | `ms_image` | `marketing_studio_image` | `style_id`(**필수**), `brand_kit_id`, `product_ids` |
| 게임 스프라이트 시트 | `autosprite` | — | `kind`, `frame_count`, `frame_size`, `video_tier` |
| 모델 선택이 실제로 무의미할 때 | `image_auto` | — | 없음 |

**⚠️비율제약 — `openai_hazel`은 요구 비율을 못 낼 수 있다.** `aspect_ratios`가 `1:1`·`3:2`·`2:3`·`auto` 4종뿐이다(2026-09-06 런타임 확인). 즉 **타이포 포스터 라우터의 `9:16`, promo 라우터의 `4:5`, 덱·배너의 `16:9`는 이 모델의 명시 지원 비율이 아니다.**

- 정사각·세로 `2:3`·가로 `3:2`면 `openai_hazel` 그대로 간다(텍스트 렌더 축의 1순위는 유지).
- **그 밖의 세로/와이드 비율이 필요하면 `nano_banana_pro`로 내려간다** — `1:1`·`3:2`·`2:3`·`4:3`·`3:4`·`4:5`·`5:4`·`9:16`·`16:9`·`21:9`(2026-09-06 런타임 확인)로 위 세 요구를 모두 흡수한다.
- `gpt_image_2`는 `16:9`·`9:16`·`21:9`를 지원하지만 `4:5`는 없다(2026-09-06 런타임 확인). 요구 비율이 맞을 때 대안으로 쓴다.

**표 전체에 적용:** 1순위는 목적축 기준이며 비율을 보장하지 않는다. 레인이 비율을 요구하면 후보를 고른 뒤 그 모델의 `aspect_ratios`를 반드시 대조하고, 없으면 대안 열로 내려간다(규칙 4).

**후처리·확장용**: `image_background_remover`, `outpaint`, `flux_2_pro_outpaint`, `topaz_image`, `topaz_image_generative`, `bytedance_image_upscale`.

**네거티브 지원과 길이 상한은 이 표에 없다 — §3을 본다.** 이 표의 어느 행을 고르든 그 모델엔 `negative_prompt`가 없다.

## 2. 영상 — 목적축 라우팅

| 목적 | 1순위 | 대안 | 결정 파라미터 |
|---|---|---|---|
| 최고급 시네마틱 | `veo3_1` | `cinematic_studio_3_0`, `kling3_0` | `quality: basic/high/ultra`, `variant`, `duration: 4/6/8` |
| 장르 제어·다중 샷 | `cinematic_studio_video_v2` | `kling3_0` | `genre`, `multi_shots`, `cfg_scale`, `speedramp`, `mode` |
| 레퍼런스 기반 아이덴티티 유지 | `seedance_2_0` | `seedance_2_0_mini`, `gemini_omni` | `image_references`/`video_references`/`audio_references`, `mode`, `resolution` |
| 참조 기반 편집·연장 | `seedance_2_5` | — | `mode: omni_reference/video_edit/video_extension`, `extension_mode`, `duration: 4~30` |
| 제품·멀티 SKU 커머스 | `seedance_2_0` | `marketing_studio_video` | `product_ids`(MS), `generate_audio` |
| 물리·표정 자연스러움 | `minimax_hailuo` | `kling2_6` | `variant`, `duration: 6/10`, `resolution` |
| 오디오 동기·캐릭터 일관 | `wan2_7` | `kling3_0`, `seedance_2_0` | `duration: 2~15`, `resolution` |
| 시작·끝 프레임 지정 | `seedance_2_0`, `minimax_hailuo`, `kling3_0`, `wan2_7` | `veo3_1_lite` | `start_image` / `end_image` 롤 |
| 빠르고 싼 배치 | `veo3_1_lite` | `kling3_0_turbo`, `seedance_2_0_mini` | `generate_audio: false` |
| 실험적·스타일라이즈 | `wan2_6` | `grok_video` | `quality`, `duration: 5/10/15` |
| 프리셋 바이럴 템플릿(i2v) | `higgsfield_preset` | — | `preset_id`(**필수**, 현재 프리셋 조회 도구) |
| 마케팅 UGC·릴스 | `marketing_studio_video` | — | `mode`(프리셋 slug), `hook_id`/`setting_id`; 추가 참조 필드는 현재 도구 정의 확인 |
| 유튜브 → 숏폼 클립 | `clipify` | — | `clips_num`, `clip_aspect`, 자막 파라미터 |

**후처리 전용**: `video_background_remover`/`sam_3_video`, `topaz_video`, `bytedance_video_upscale`, `video_upscale`, `video_deflicker`, `sync_so`(립싱크), `reframe`.

**네거티브 지원과 길이 상한은 이 표에 없다 — §3을 본다.** 영상 쪽도 마찬가지로 `negative_prompt`를 가진 모델이 하나도 없다.

## 3. 네거티브·길이 — 엔진 쪽 사실

**길이 판정의 정본은 [surfaces.md](surfaces.md)다.** 이 표는 표면 계약이 아니라 **엔진·모델이 자기 쪽에서 거는 상한**만 기록한다. 실제 상한은 세 층에서 온다 — 전달 채널 / 타깃 엔진 / 기계 계약 — 그리고 **가장 좁은 것이 이긴다.** 상한 있는 메신저형 채널로 나가면 엔진이 32,000자를 받아도 채널이 이긴다. 전역 2,000자 하드라인은 없다. 구체 배선과 값은 [adapters.md](../adapters.md)·런타임 소관이다. **이 절의 값에 대한 근거·확인일 정본은 [surfaces.md](surfaces.md) §7이다 — 여기서 다시 스탬프하지 않는다.**

| 엔진·모델군 | 별도 네거티브 필드·문법 | 길이 상한(엔진 쪽) |
|---|---|---|
| Higgsfield 로스터 **이미지 전 모델** | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| Higgsfield 로스터 **영상 전 모델** | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| `gpt_image_2` (Higgsfield 경유) | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| gpt-image-2 (OpenAI API 직결) | 네거티브 필드 없음 | 32,000자 |
| Midjourney (붙여넣기 + `--` 플래그) | `--no` 인라인 | [surfaces.md](surfaces.md) §0-1·§0-2의 간결성 기준 |
| `tripo_3d` (3D 축, 아래 각주) | `negative_prompt` 파라미터 있음 | 런타임 정의에 상한 없음 |

전수 확인의 방법과 모델 수는 [surfaces.md](surfaces.md) §7의 해당 행에 있다.

**필드 부재는 자연어 부정문 금지를 뜻하지 않는다.** 산출 형태·자연어 보존 제약·별도 제외 입력란의 구분은 [surfaces.md](surfaces.md) §3.1·§4만 따른다. 별도 필드 내용을 일반 프롬프트 끝에 붙이지 않는다.

**Midjourney의 길이·간결성 판정은 [surfaces.md](surfaces.md) §0-1·§0-2가 정본이다.** 이 표는 모델 로스터의 날짜를 갱신하거나 확인되지 않은 수치 경계를 만들지 않는다.

**3D·오디오 축은 이 파일의 범위 밖이다.** §1·§2 목적축 표는 이미지·영상만 다룬다. `tripo_3d`는 현재 로스터에서 `negative_prompt`를 갖는 예외라 명시한다. 다른 출력 유형의 라우팅이 필요하면 현재 목록부터 조회한다. 전수 조회 범위는 [surfaces.md](surfaces.md) §7에 있다.

## 4. 라우팅 규칙

**0. 미지정 기본값은 `gpt_image_2`다.** 이미지 요청에 타깃이 안 적혀 있으면 이 설치의 기본 이미지 타깃으로 간다. §1 목적축 표는 요청이 목적을 드러낼 때 후보를 좁히는 도구이지, 아무 신호도 없는 요청에 억지로 돌리는 분류기가 아니다. 경로는 둘이다 — Higgsfield 로스터의 `gpt_image_2`와 OpenAI API 직결. 어느 쪽인지는 [surfaces.md](surfaces.md) §0 표면 판정이 정하고, 길이·네거티브는 §3의 해당 행을 본다.

- **Higgsfield는 모델 id로 지정되어 들어온다.** `soul_2`·`nano_banana_pro`·`seedream_v5_pro` 같은 id가 요청에 이미 있으면 그 자체가 라우팅 결정이다. §1·§2 표를 건너뛰고 현재 모델 상세 조회로 직행한다.
- **Midjourney는 이 로스터에 없다.** 붙여넣기 입력창 + `--` 플래그를 쓰는 별도 표면이며, 사용자가 명시적으로 요청했을 때만 간다. 미지정 요청이 Midjourney로 흘러가지 않는다.

1. **사용자가 모델을 지정하면 그대로 쓴다.** 지정이 없을 때만 이 표를 쓴다.
2. **여러 목적도 요청된 한 컷 안에서 함께 충족한다.** "정확한 한글 카피 + 인물 사실감"이면 두 조건을 지원하는 후보를 고른다. 컷 분리는 사용자가 원하거나, 한 컷으로 충족할 수 없는 제약을 설명하고 변경에 동의한 경우에만 한다.
3. **모델을 바꾸면 달라지는 문법·파라미터만 조정한다.** 유효한 장면·카피·보존 조건은 유지한다. Soul 전용 구성은 [soul-v2-director.md](soul-v2-director.md)를 참고하되 필요한 축만 쓴다.
4. **지원 비율·해상도와 입력 조합을 확인하고 사용자 요구를 보존한다.** 개별 필드가 유효해도 모드·참조 롤·길이·해상도 조합이 지원된다는 뜻은 아니다. 요청 비율이 없으면 지원하는 후보를 고른다. 모델과 비율이 모두 고정돼 충돌하면 필요한 선택만 묻고 임의로 바꾸지 않는다. **`aspect_ratios`가 빈 배열이면** 그 필드를 넘기지 않고 모델별 입력·기본값을 확인한다([surfaces.md](surfaces.md) §2). 빈 배열만으로 부적합하다고 단정하지 않는다.
5. **영상 길이는 임의 값이 아니다.** 열거값(`5/10`, `4/8/12`, `6/10`)인 모델과 범위(`3~15`, `4~15`)인 모델이 섞여 있다. 스토리보드의 씬 길이를 모델 제약에 맞춘다.
6. **네거티브와 길이는 §3이 정본이다.** 이 플랫폼의 이미지·영상 모델에 `negative_prompt`가 없다는 것은 플랫폼 사실이지 모든 엔진에 대한 일반 원칙이 아니다. 사실·산출 분기·예외를 여기서 되풀이하지 않는다.
7. **엔진을 골랐으면 그 엔진의 표면 문법을 따른다.** 모델 선택(이 파일)과 실제로 써넣는 문법은 다른 축이다. 아래 어댑터의 적용 표면을 확인하고, 파라미터는 [surfaces.md](surfaces.md)와 해당 표면의 실제 계약을 따른다.
   - [grok-imagine.md](grok-imagine.md) — Grok 이미지·영상 자연어 작성. Imagine UI·대화형 이미지 도구·직접 API·래퍼 경계를 구분한다. Higgsfield 모델 선택은 위 §1·§2, 대화·리서치용 Grok은 [../model-playbooks.md](../model-playbooks.md) 소관이다.
   - [../midjourney-identity.md](../midjourney-identity.md) — 일반 Image Prompt·V8 Edit Model·V7 Omni의 입력 역할과 문법. 지정 버전을 유지하며 목적에 맞는 참조 기능을 선택한다.
   - [seedream-5-pro.md](seedream-5-pro.md) — BytePlus ModelArk direct Seedream 5 Pro의 자연어·다중 이미지·`<point>`/`<bbox>` 인터랙티브 편집 문법. Higgsfield `seedream_v5_pro`에는 런타임 기능 확인 없이 좌표·파라미터를 복사하지 않는다.
   - [seedream-character-reference-sheets.md](seedream-character-reference-sheets.md) — 3×3 identity 입력을 단일 베이스·1×4 전신 시트로 바꾸는 구도·체형·헤어 차폐 규칙.
   - [seedance-2.md](seedance-2.md) — BytePlus ModelArk direct Seedance 2.0의 멀티모달 참조·편집·연장·트랙 연결 문법. 2.5 규칙을 자동 상속하지 않는다.
   - [seedance-2-5.md](seedance-2-5.md) — Dreamina 웹 Seedance 2.5의 멀티레퍼런스·장편·편집·연장·키프레임·스토리보드·클레이 렌더러 붙여넣기 문법. ModelArk API 계약이 아니다.
   - [midjourney-feed-diagnosis.md](midjourney-feed-diagnosis.md) — 연속 피드에서 프로필 스택·chaos·stylize·Variation 계보를 분리하는 진단·ablation 절차.

## 5. 스냅샷 신선도

이 절이 소유하는 것은 **로스터 스냅샷 날짜와 그 신선도 등급**뿐이다. 개별 외부 사실의 근거·확인일은 [surfaces.md](surfaces.md) §7이 정본이다.

<!-- roster-snapshot: 2026-09-06 -->
<!-- 위 마커가 신선도 검사의 유일한 기계 앵커다. 로스터를 다시 뜨면 이 날짜만 고치면 되고,
     아래 산문은 자유롭게 써도 검사에 영향을 주지 않는다. 마커가 없으면 검사가 loud하게 실패한다. -->

이 표는 **2026-09-06** `models_list`의 전체 목록(`has_more:false`)과 주요 후보의 `models_get` 확인에 근거한다. 모델 추가·제거·파라미터 변경은 공지 없이 일어난다. 도구 이름은 현재 제공된 모델 목록·상세 조회 기능을 따르며 과거 `models_explore` 이름을 가정하지 않는다.

- 30일 이내: 그대로 후보 선택에 쓴다.
- 30~90일: 후보 선택에는 쓰되, 파라미터는 반드시 현재 모델 상세 조회로 확인한다.
- 90일 초과: 표를 근거로 단정하지 않는다. 목록부터 다시 뜬다.

과거 오판 기록: 2026-07-21에 "Seedream 계열 전체 소멸"로 결론냈으나 실제로는 `list` 페이지네이션 미진행에 따른 오판이었다. **모델이 사라졌다고 결론내기 전에 `has_more`를 끝까지 따라간다.**
