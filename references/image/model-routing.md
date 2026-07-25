# 모델 라우팅 — 목적축 → 후보 모델 (S2 플랫폼 표면)

**이 파일은 후보를 좁히는 용도다. 파라미터의 정본이 아니다.** 실제 파라미터·비율·미디어 롤은 런타임 확인(`models_explore`)이 이긴다. 표면 판정은 [surfaces.md](surfaces.md)가 선행한다.

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
| 표현적·고대비 크리에이티브 | `grok_image` | `flux_2` | `mode: std/quality` |
| 빠르고 싼 시안 스윕 | `z_image` | `nano_banana`, `nano_banana_2_lite` | `thinking: MINIMAL/HIGH`(lite) |
| DTC 광고 크리에이티브 | `ms_image` | `marketing_studio_image` | `style_id`(**필수**), `brand_kit_id`, `product_ids` |
| 게임 스프라이트 시트 | `autosprite` | — | `kind`, `frame_count`, `frame_size`, `video_tier` |
| 모델 선택이 실제로 무의미할 때 | `image_auto` | — | 없음 |

**⚠️비율제약 — `openai_hazel`은 요구 비율을 못 낼 수 있다.** `aspect_ratios`가 `1:1`·`3:2`·`2:3`·`auto` 4종뿐이다(2026-07-25 런타임 확인). 즉 **타이포 포스터 라우터의 `9:16`, promo 라우터의 `4:5`, 덱·배너의 `16:9`는 이 모델로 낼 수 없다.**

- 정사각·세로 `2:3`·가로 `3:2`면 `openai_hazel` 그대로 간다(텍스트 렌더 축의 1순위는 유지).
- **그 밖의 세로/와이드 비율이 필요하면 `nano_banana_pro`로 내려간다** — `1:1`·`3:2`·`2:3`·`4:3`·`3:4`·`4:5`·`5:4`·`9:16`·`16:9`·`21:9`(2026-07-25 런타임 확인)로 위 세 요구를 모두 흡수한다.
- `gpt_image_2`는 `16:9`·`9:16`은 되지만 `4:5`·`21:9`가 없다(2026-07-25 런타임 확인). 덱·숏폼 전용 대안으로만 쓴다.

**표 전체에 적용:** 1순위는 목적축 기준이며 비율을 보장하지 않는다. 레인이 비율을 요구하면 후보를 고른 뒤 그 모델의 `aspect_ratios`를 반드시 대조하고, 없으면 대안 열로 내려간다(규칙 4).

**후처리 전용**(생성 모델 아님): `image_background_remover`, `outpaint`, `topaz_image`, `topaz_image_generative`, `bytedance_image_upscale`.

**네거티브 지원과 길이 상한은 이 표에 없다 — §3을 본다.** 이 표의 어느 행을 고르든 그 모델엔 `negative_prompt`가 없다.

## 2. 영상 — 목적축 라우팅

| 목적 | 1순위 | 대안 | 결정 파라미터 |
|---|---|---|---|
| 최고급 시네마틱 | `veo3_1` | `cinematic_studio_3_0`, `kling3_0` | `quality: basic/high/ultra`, `variant`, `duration: 4/6/8` |
| 장르 제어·다중 샷 | `cinematic_studio_video_v2` | `kling3_0` | `genre`, `multi_shots`, `cfg_scale`, `speedramp`, `mode` |
| 레퍼런스 기반 아이덴티티 유지 | `seedance_2_0` | `seedance_2_0_mini`, `gemini_omni` | `image_references`/`video_references`/`audio_references`, `mode`, `resolution` |
| 제품·멀티 SKU 커머스 | `seedance_2_0` | `marketing_studio_video` | `product_ids`(MS), `generate_audio` |
| 물리·표정 자연스러움 | `minimax_hailuo` | `kling2_6` | `variant`, `duration: 6/10`, `resolution` |
| 오디오 동기·캐릭터 일관 | `wan2_7` | `kling3_0`, `seedance_2_0` | `duration: 2~15`, `resolution` |
| 시작·끝 프레임 지정 | `seedance_2_0`, `minimax_hailuo`, `kling3_0`, `wan2_7` | `veo3_1_lite` | `start_image` / `end_image` 롤 |
| 빠르고 싼 배치 | `veo3_1_lite` | `kling3_0_turbo`, `seedance_2_0_mini` | `generate_audio: false` |
| 실험적·스타일라이즈 | `wan2_6` | `grok_video` | `quality`, `duration: 5/10/15` |
| 프리셋 바이럴 템플릿(i2v) | `higgsfield_preset` | — | `preset_id`(**필수**, `presets_show`) |
| 마케팅 UGC·릴스 | `marketing_studio_video` | — | `mode`(프리셋 slug), `hook_id`/`setting_id` **또는** `ad_reference_id`(상호배타) |
| 유튜브 → 숏폼 클립 | `clipify` | — | `clips_num`, `clip_aspect`, 자막 파라미터 |

**후처리 전용**: `video_background_remover`/`sam_3_video`, `topaz_video`, `bytedance_video_upscale`, `video_upscale`, `video_deflicker`, `sync_so`(립싱크), `reframe`.

**네거티브 지원과 길이 상한은 이 표에 없다 — §3을 본다.** 영상 쪽도 마찬가지로 `negative_prompt`를 가진 모델이 하나도 없다.

## 3. 네거티브·길이 — 엔진 쪽 사실

**길이 판정의 정본은 [surfaces.md](surfaces.md)다.** 이 표는 표면 계약이 아니라 **엔진·모델이 자기 쪽에서 거는 상한**만 기록한다. 실제 상한은 세 층에서 온다 — 전달 채널 / 타깃 엔진 / 기계 계약 — 그리고 **가장 좁은 것이 이긴다.** 상한 있는 메신저형 채널로 나가면 엔진이 32,000자를 받아도 채널이 이긴다. 전역 2,000자 하드라인은 없다. 구체 배선과 값은 [adapters.md](../adapters.md)·런타임 소관이다. **이 절의 값에 대한 근거·확인일 정본은 [surfaces.md](surfaces.md) §7이다 — 여기서 다시 스탬프하지 않는다.**

| 엔진·모델군 | 네거티브 | 길이 상한(엔진 쪽) |
|---|---|---|
| Higgsfield 로스터 **이미지 전 모델** | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| Higgsfield 로스터 **영상 전 모델** | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| `gpt_image_2` (Higgsfield 경유) | 없음 | 런타임 정의에 상한 없음(전수 확인) / 백엔드 실제 상한 미공개 **[미확인]** → 신호 밀도 |
| gpt-image-2 (OpenAI API 직결) | 네거티브 필드 없음 | 32,000자 |
| Midjourney (붙여넣기 + `--` 플래그) | `--no` 인라인 | **단어 수** 40 권장 · 60 경고 · 80 초과 금지 |
| `tripo_3d` (3D 축, 아래 각주) | `negative_prompt` 파라미터 있음 | 런타임 정의에 상한 없음 |

전수 확인의 방법과 모델 수는 [surfaces.md](surfaces.md) §7의 해당 행에 있다.

**산출 형태는 엔진이 정하고, 어느 쪽이든 결과물은 한 블록이다.** 복사 한 번으로 끝나야 한다.

| 그 엔진의 네거티브 형태 | 산출 |
|---|---|
| 인라인 문법(`--no`) | 블록 안에 넣는다 |
| 별도 API 필드만 존재 | 같은 블록 안에 라벨 꼬리로 붙인다 — 두 번 복사시키지 않는다 |
| 아예 없음(Higgsfield 이미지·영상 전 모델, OpenAI 경로) | 긍정형으로 재서술한다 |

**`--no`는 단일 명사를 쉼표로만 나열한다.** 모더레이션이 값의 단어를 하나씩 독립적으로 읽으므로 다어절 구는 단어별로 갈려 오작동한다 — `--no modern clothing`이 "no clothing"으로 읽히는 식이다. 다어절 요구는 `--no`가 아니라 본문 긍정형으로 처리한다.

**Midjourney 길이는 문자가 아니라 단어로 잰다.** 위 40·60·80이 그 임계값이다. 별도로 회자되는 문자 하드 상한은 **[미확인]**이다([surfaces.md](surfaces.md) §7) — 어차피 실효 제약은 단어 쪽이 훨씬 좁으므로 단어로 관리하면 충분하다.

**3D 축 각주 — 이 파일의 범위 밖이다.** 로스터에는 3D 모델 14종이 별도로 올라가 있지만 §1·§2 목적축 표는 3D를 다루지 않는다. 위 표에 `tripo_3d`가 나오는 이유는 하나뿐이다: 로스터 전체에서 `negative_prompt`를 갖는 유일한 모델이라, "이 플랫폼엔 네거티브 파라미터가 없다"는 문장의 예외로 명시해야 한다. 3D 라우팅이 실제로 필요해지면 이 표를 늘리지 말고 런타임 목록부터 다시 뜬다.

## 4. 라우팅 규칙

**0. 미지정 기본값은 `gpt_image_2`다.** 이미지 요청에 타깃이 안 적혀 있으면 이 설치의 기본 이미지 타깃으로 간다. §1 목적축 표는 요청이 목적을 드러낼 때 후보를 좁히는 도구이지, 아무 신호도 없는 요청에 억지로 돌리는 분류기가 아니다. 경로는 둘이다 — Higgsfield 로스터의 `gpt_image_2`와 OpenAI API 직결. 어느 쪽인지는 [surfaces.md](surfaces.md) §0 표면 판정이 정하고, 길이·네거티브는 §3의 해당 행을 본다.

- **Higgsfield는 모델 id로 지정되어 들어온다.** `soul_2`·`nano_banana_pro`·`seedream_v5_pro` 같은 id가 요청에 이미 있으면 그 자체가 라우팅 결정이다. §1·§2 표를 건너뛰고 그 모델의 런타임 정의(`models_explore(action:"get")`)로 직행한다.
- **Midjourney는 이 로스터에 없다.** 붙여넣기 입력창 + `--` 플래그를 쓰는 별도 표면이며, 사용자가 명시적으로 요청했을 때만 간다. 미지정 요청이 Midjourney로 흘러가지 않는다.

1. **사용자가 모델을 지정하면 그대로 쓴다.** 지정이 없을 때만 이 표를 쓴다.
2. **목적이 둘이면 컷을 나눈다.** "정확한 한글 카피 + 인물 사실감"은 한 모델의 최적점이 아니다. 텍스트 컷과 인물 컷을 분리한다.
3. **모델을 바꾸면 프롬프트도 바꾼다.** 같은 문장을 다른 모델에 그대로 옮기지 않는다. 특히 Soul 계열의 4레이어 구조([soul-v2-director.md](soul-v2-director.md))는 Soul 전용이다.
4. **비율·해상도는 모델이 정한다.** 배열이 비어 있지 않은데 원하는 비율이 그 모델의 `aspect_ratios`에 없으면 모델을 바꾸거나 비율을 바꾼다. 프롬프트로 우회하지 않는다. **배열이 비어 있는 경우는 다르다** — `minimax_hailuo`·`autosprite`·`clipify`·`tripo_3d`처럼 빈 배열인 모델은 비율을 파라미터로 받지 않으므로 비율을 넘기지 않고 입력 이미지·모델 기본값을 따른다([surfaces.md](surfaces.md) §2). 이걸 "비율 없음 = 부적합"으로 읽고 1순위를 버리지 않는다.
5. **영상 길이는 임의 값이 아니다.** 열거값(`5/10`, `4/8/12`, `6/10`)인 모델과 범위(`3~15`, `4~15`)인 모델이 섞여 있다. 스토리보드의 씬 길이를 모델 제약에 맞춘다.
6. **네거티브와 길이는 §3이 정본이다.** 이 플랫폼의 이미지·영상 모델에 `negative_prompt`가 없다는 것은 플랫폼 사실이지 모든 엔진에 대한 일반 원칙이 아니다. 사실·산출 분기·예외를 여기서 되풀이하지 않는다.

## 5. 스냅샷 신선도

이 절이 소유하는 것은 **로스터 스냅샷 날짜와 그 신선도 등급**뿐이다. 개별 외부 사실의 근거·확인일은 [surfaces.md](surfaces.md) §7이 정본이다.

<!-- roster-snapshot: 2026-07-25 -->
<!-- 위 마커가 신선도 검사의 유일한 기계 앵커다. 로스터를 다시 뜨면 이 날짜만 고치면 되고,
     아래 산문은 자유롭게 써도 검사에 영향을 주지 않는다. 마커가 없으면 검사가 loud하게 실패한다. -->

이 표는 **2026-07-25** `models_explore(action:"list")` 실측 로스터 기반이다. 모델 추가·제거·파라미터 변경은 공지 없이 일어난다.

- 30일 이내: 그대로 후보 선택에 쓴다.
- 30~90일: 후보 선택에는 쓰되, 파라미터는 반드시 `models_explore(action:"get")`로 확인한다.
- 90일 초과: 표를 근거로 단정하지 않는다. 목록부터 다시 뜬다.

과거 오판 기록: 2026-07-21에 "Seedream 계열 전체 소멸"로 결론냈으나 실제로는 `list` 페이지네이션 미진행에 따른 오판이었다. **모델이 사라졌다고 결론내기 전에 `has_more`를 끝까지 따라간다.**
