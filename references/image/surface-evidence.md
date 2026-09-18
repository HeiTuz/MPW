# 표면·엔진 재검증 근거 — dated 스탬프 테이블

## 7. 재검증 — 외부 사실 근거·신선도 정본

**이 표가 이미지 레인 전체의 외부 사실(엔진·플랫폼·채널이 정하는 값·문법·능력) 근거·확인일 정본이다.** 다른 파일은 근거 표를 다시 만들지 않고 이 표를 가리킨다. **레지스터는 하나, 스탬프는 제자리** — 없애야 하는 것은 같은 사실의 두 번째 근거 표이지, 주장 옆에 붙은 인라인 dated 스탬프가 아니다. 그것들은 그 자리에 남는다.

**확인일은 "값을 확인한 날"과 "값이 없음을 확인한 날"을 모두 포함한다.** 근거가 없는 값은 이관·통합 뒤에도 **[미확인]**으로 남는다. [미확인]을 지우려면 근거부터 붙인다 — 표를 정리하면서 자격 표시를 떨어뜨리는 것은 정보 손실이다.

경계 둘. **플랫폼 로스터 스냅샷 날짜와 그 신선도 등급**은 [model-routing.md](model-routing.md) §5의 기계 마커가 소유하고, **Midjourney 문법·파라미터의 규칙 서술**은 [../midjourney-identity.md](../midjourney-identity.md)가 소유한다. 이 표는 그 사실들의 근거·확인일만 기록하고 규칙 문장을 복제하지 않는다.

| 항목 | 근거 | 확인일 |
|---|---|---|
| Midjourney 기본 버전 | 공식 [Version](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version): 기본 V8.2와 적용일 2026-07-24 재확인. 다른 파라미터 전체를 재검증한 것은 아님 | 2026-09-11 |
| Genjutsu 웹 기능·프롬프트·입력 수치 불일치 | 공식 [제품 안내와 예시](https://higgsfield.ai/genjutsu), [사용 가이드](https://higgsfield.ai/blog/higgsfield-genjutsu). 기능 선택·짧은 지시 근거. 입력 수치 차이는 §4.4에 기록; API·실제 생성은 미검증 | 2026-09-11 |
| S1 enum(ar·size·quality) | `contracts/v1/*.schema.json` 직접 읽음 | 2026-07-25 |
| S2 파라미터 축·모델 로스터 | Higgsfield MCP `models_list(limit:100)` 전체 95개·`has_more:false`; Soul 2.0·GPT Image 2·Recraft V4.1 `models_get` 교차 확인 | 2026-09-06 |
| `prompt-bundle/v1` 2000 | `contracts/v1/prompt-bundle.schema.json` 직접 읽음 — `text.maxLength` / `unicode_char_count.maximum` | 2026-07-25 |
| gpt-image 계열 32,000자 | OpenAI 이미지 생성 API 레퍼런스, 웹 확인 | 2026-07-25 |
| Soul 웹·MCP 색상 경계 | 현행 `models_get(soul_2)`에는 `quality`·`soul_id`만 있으며 `models_list`의 Soul Cinema도 동일. 두 모델에 `colors`·Color Transfer 전용 필드가 노출되지 않음. 웹 Soul HEX를 API 파라미터로 임의 변환하지 않음 | 2026-09-06 |
| Soul HEX 색상 입력 | Higgsfield 공식 [Soul 2.0](https://higgsfield.ai/soul-intro), [사용 안내](https://www.higgsfield.company/creator-hub/help-center/ai-models/how-do-i-use-soul-to-generate-images): Color Transfer의 참조 이미지 대표 팔레트 추출·기본 팔레트 선택. Soul 2.0·Soul Cinema 지원. 본문 코드 해석·추출 알고리즘·API 필드는 이 자료로 확정하지 않음 | 2026-09-06 |
| FLUX.2 본문 HEX | BFL 공식 [prompting guide](https://docs.bfl.ai/guides/prompting_guide_flux2): HEX 색상 지정과 물체별 연결을 안내. 생성 파일의 픽셀 일치 여부는 별도 검증 대상 | 2026-09-06 |
| GPT Image 네이티브 편집·이어쓰기 | OpenAI [image prompting guide](https://developers.openai.com/cookbook/examples/multimodal/image-gen-models-prompting-guide): 변경점·보존·추가 금지를 직접 명시하고 필요한 참조를 연결. 짧은 변경 지시가 가능하다는 근거이며 픽셀 동일성 보증은 아님 | 2026-09-05 |
| GPT Image 2.5 모델 선택·편집·이전 결과 입력 | OpenAI [Image prompting](https://developers.openai.com/api/docs/guides/image-prompting), GPT Image 2.5 탭: Flare/Sunburst 비교, 이행 절차, 프롬프팅 기본 8항, 참조 역할, 편집 패턴(번역·스타일 이식·의상 교체·참조 결합·컷아웃·스케치·제거·삽입), 용도별 예시(도해·UI·슬라이드·만화·역사·로고), 한 축씩 편집, 결과 검수. §3.2·§4.3·model-routing의 선택 기준 근거. 문서의 예시 출력은 생성 품질의 직접 검증이 아님 | 2026-09-16 |
| GPT Image 1·1.5 종료 예정 | 같은 문서의 GPT Image 1·1.5 탭과 공식 [deprecations](https://developers.openai.com/api/docs/deprecations): `gpt-image-1` 2026-10-23, `gpt-image-1.5` 2026-12-01 종료 예정. 규칙 서술은 [model-routing.md](model-routing.md) §4 | 2026-09-16 |
| GPT Image 2.5 직접 API 설정 | OpenAI [Image generation](https://developers.openai.com/api/docs/guides/image-generation), Overview·Customize Image Output: 두 모델 id, Responses 도구 model, quality·size·투명 출력. §4.3 소관이며 래퍼 지원 확인은 아님 | 2026-09-09 |
| Images 2.5 댓글·Sketch | OpenAI [출시 발표](https://openai.com/index/introducing-chatgpt-images-2-5/): UI 입력 기능과 참조·누적 편집 개선. 개별 호스트의 옵션이나 실제 생성 모델 증명은 아님 | 2026-09-09 |
| gpt-image-2 직접 API 알파·입력 충실도·마스크 | OpenAI [image generation guide](https://developers.openai.com/api/docs/guides/image-generation): 투명 배경은 preview, PNG/WebP; `input_fidelity` 생략; 마스크는 정확한 경계 보증이 아닌 가이드. 예제와 충돌 시 API 필드 정의 우선 | 2026-09-05 |
| Higgsfield gpt_image_2 직접 API와의 차이 | 현행 `models_get(gpt_image_2)`의 `parameters`에 `resolution`·`quality`만 있고 `background`·`input_fidelity` 없음. 직접 API 필드를 복사하지 않음 | 2026-09-05 |
| BytePlus ModelArk direct Seedream 5 Pro 모델·길이 | 공식 [Image generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)·API — `dola-seedream-5-0-pro-260628`, 영어 600단어 미만 권장, 1K/2K·PNG/JPEG. Higgsfield `seedream_v5_pro`와 별도 표면 | 2026-08-02 |
| Seedream 5 Pro 인터랙티브 편집 문법 | 공식 [interactive editing guide](https://docs.byteplus.com/en/docs/ModelArk/2582775) — 이미지별 0–999 정규화 좌표, `<point>x y</point>`, `<bbox>x1 y1 x2 y2</bbox>`, 다중 대상 식별·보존 영역 표기 | 2026-08-02 |
| BytePlus ModelArk direct Seedance 2.0 프롬프트 문법·길이 | 공식 [Seedance 2.0 series prompt guide](https://docs.byteplus.com/en/docs/ModelArk/2222480)와 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — 멀티모달 참조·편집·연장·트랙 연결, 1,000단어 미만 권장 | 2026-08-02 |
| Seedance 2.0 direct 입력 조합 | 공식 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — reference 이미지 0–9, 영상 0–3, 오디오 0–3; 이미지·영상 중 최소 1개 필요; first/last-frame와 multimodal-reference 시나리오 직접 혼용 불가; 참조 영상 합계 15초 이하 | 2026-08-02 |
| Seedance 2.0 direct 실인물 참조 입력 | 공식 [Video generation API](https://docs.byteplus.com/en/docs/modelark/1520757) — 실제 인물 얼굴이 든 이미지·영상의 일반 직접 업로드는 미지원; 신뢰된 원본 출력·프리셋 디지털 캐릭터·권리 확인 후 등록 자산 경로를 사용 | 2026-08-02 |
| Seedance 2.0 direct 결과 제약 | 공식 [prompt guide](https://docs.byteplus.com/en/docs/ModelArk/2222480) — 불필요 자막·로고·워터마크·중복 인물 교정에 짧은 명시 제약 사용. 규칙 서술은 [seedance-2.md](seedance-2.md) §공식 실패 제약 예외 | 2026-08-02 |
| Dreamina 웹 Seedance 2.5 프롬프트 계약 | ByteDance [Prompt Guide](https://bytedance.larkoffice.com/docx/A88jd0B47oAd8zxWp5ycZFMfnxh) — 자산별 역할·장면별 선택, 단계/종료 상태, 편집 master/scope/preserve, 경계 프레임 연장, 키프레임·스토리보드·오디오 표기. 규칙 서술은 [seedance-2-5.md](seedance-2-5.md) | 2026-08-03 |
| Dreamina 웹 Seedance 2.5 입력·UI 모드 | ByteDance [User Guide](https://bytedance.larkoffice.com/wiki/NjnWwvf4BiFYFLk2RzrcEgaunGf)와 Prompt Guide — 합계 최대 50개, 이미지 30장, 영상 10개·합계 30초, 오디오 10개·합계 30초, 일반 생성 4–30초·Long Video 30–180초, 480p/720p. Dreamina UI 값이며 ModelArk API·다른 래퍼에 복사 금지 | 2026-08-03 |
| Seedance 2.5 ModelArk 모델 id·API 요청 스키마 | Dreamina 공식 Lark 가이드는 웹 UI 표면만 설명한다. 현재 확인한 [ModelArk 모델 목록](https://docs.byteplus.com/en/docs/modelark/1159178)·Seedance API 문서에는 2.5 direct 계약이 없음 **[미확인]** — Dreamina UI·2.0 direct 값을 API로 자동 상속 금지 | 2026-08-03 |
| Midjourney 간결성 | 공식 [Prompt Basics](https://docs.midjourney.com/hc/en-us/articles/32023408776205-Prompt-Basics): 짧고 명확하게 쓰되 중요한 피사체·수량·구도는 명시. 40/60/80단어 경계는 제시하지 않음 | 2026-09-05 |
| 이미지 구체성·편집 | Google 공식 [Image generation guide](https://ai.google.dev/gemini-api/docs/image-generation): 필요한 세부·의도·참조 이미지의 변경점을 구체화하고 반복 편집. 모든 컷에 촬영 슬롯·HEX 개수를 강제하는 근거가 아님 | 2026-09-05 |
| Veo 대사·단일 클립 | Google [video best practices](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/best-practice): 발화는 콜론으로 구분하고 따옴표를 피함. 짧은 영상은 한 장면에 집중 | 2026-09-05 |
| Veo 제외 입력·지원 언어 | Google [negative prompts](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/video-gen-prompt-guide#negative-prompts)의 명사 목록은 네거티브 입력용. [Veo 3.1](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate)의 prompt language는 영어; 발화 언어와 별도 | 2026-09-05 |
| Grok 직접 이미지 설정·기본값 | xAI [image generation](https://docs.x.ai/developers/model-capabilities/images/generation): 현재 본문의 설정표를 확인. 검색 스니펫의 오래된 quality 기본값보다 원문 우선 | 2026-09-07 |
| Grok 이미지 편집·다중 입력 | xAI [image editing](https://docs.x.ai/developers/model-capabilities/images/editing), [multi-image editing](https://docs.x.ai/developers/model-capabilities/images/multi-image-editing): 입력 순서·비율·다중 편집·반복 편집 및 직접 편집 요청 형식 | 2026-09-07 |
| Grok 대화형 이미지 도구 | xAI [image generation tool](https://docs.x.ai/developers/tools/image-generation): 자연어 비율 지정·직접 엔드포인트와의 차이·이전 응답 상태 유지 | 2026-09-07 |
| Grok 이미지·문자 작성 정책 | xAI [Image 2.0 발표](https://x.ai/news/grok-imagine-image-2)의 편집·타이포그래피·레이아웃 설명. MPW의 정확 카피·보존 지시를 적용하는 근거이며 철자·픽셀 일치 보증은 아님 | 2026-09-07 |
| Grok 영상 입력 모드·움직임 | xAI [video generation](https://docs.x.ai/developers/model-capabilities/video/generation#request-modes), [image-to-video](https://docs.x.ai/developers/model-capabilities/video/image-to-video), [공식 영상 사용례](https://x.ai/grok/use-cases/video-generation): 모드 조합과 장면·행동·카메라·페이스 서술 | 2026-09-07 |
| Grok 참조 영상·음성 | xAI [reference-to-video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video): 시작 프레임과 참조의 구분, 프리셋 음성과 자체 오디오의 제공 범위 | 2026-09-07 |
| Grok 영상 참조 태그 시작 번호 | 같은 [reference-to-video](https://docs.x.ai/developers/model-capabilities/video/reference-to-video#reference-audio) 본문은 `<IMAGE_0>`부터, 예시는 `<IMAGE_1>`부터 표기. 시작 인덱스 충돌 **[미확인]** | 2026-09-07 |
| Grok 영상 편집·연장 설정 | xAI [video editing](https://docs.x.ai/developers/model-capabilities/video/editing), [video extension](https://docs.x.ai/developers/model-capabilities/video/extension): 편집 설정 상속과 연장 구간 길이 | 2026-09-07 |
| Grok prompt 공통 문자 상한·권장 단어수 | 확인한 xAI 이미지·영상 가이드에 공통 수치 미제시 **[미확인]** — 선택한 엔드포인트·UI 제한을 확인 | 2026-09-07 |
| Midjourney V8 참조 생성·편집 | 공식 [Edit Model](https://docs.midjourney.com/hc/en-us/articles/48495453462797-Edit-Model): V8.1/V8.2, 최대 4개 입력, 웹 첨부·Discord `--edit`. [Image Prompts](https://docs.midjourney.com/hc/en-us/articles/32040250122381-Image-Prompts)의 일반 장면 참조와 구분 | 2026-09-05 |
| Midjourney 문자 하드 상한(6,000자설) | 공식 출처 없음 **[미확인]** — 런타임에 정의된 실제 제한을 확인 | 2026-07-25 |
| Midjourney 문법·파라미터(`--no` 단일 명사·모더레이션 단어 단위 판독 / 무드보드 `--p` 참조·`--sw` 비호환·강도는 `--stylize` / `--sref` 텍스트 Best Practices) | 공식 문서·릴리스노트. **규칙 서술 정본은 [../midjourney-identity.md](../midjourney-identity.md) §5·§6·§7** | 2026-07-25 |
| Midjourney 스타일 참조의 역할 | 공식 [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)는 미학을 전달하는 기능으로 설명. 정체성 보존 기능으로 대체하지 않음 | 2026-09-05 |
| Midjourney V8 계열 `--sv` 기본값·유효 범위 | 공식 문서에 V7(1–6)·V6(1–4)만 있고 **V8 섹션 자체가 없다** **[미확인]** — 커뮤니티 수치를 기입하지 않는다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §3 | 2026-07-25 |
| Midjourney V8 계열 Draft Mode 호환 | [Draft 아티클](https://docs.midjourney.com/hc/en-us/articles/35577175650957-Draft-Conversational-Modes)은 V8.1/V8.2 웹 경로를 설명하나 [Version 표](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)는 미지원으로 표시. 문서 간 충돌 **[미확인]** — 선택한 UI에서 확인 | 2026-09-05 |
| Midjourney 무드보드 최대·권장 장수 | 공식 권장도 최댓값도 없고 **커뮤니티 수치가 서로 불일치**한다(5–10 / 8–12 / 최대 100) **[미확인]** — 숫자 대신 방향성만 쓴다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §7 | 2026-07-25 |
| Midjourney `--sw` 수치 조절표 | **커뮤니티 단일 출처뿐** **[미확인]** — 규범으로 쓰지 않는다. 규칙 서술은 [../midjourney-identity.md](../midjourney-identity.md) §6 | 2026-07-25 |
| Midjourney `--stylize` 에디토리얼 권장 대역 | **커뮤니티 단일·소수 출처뿐** **[미확인]** — 고정 시작 대역을 쓰지 않고 현재 설정에서 한 축씩 비교. 파라미터 범위는 [../midjourney-identity.md](../midjourney-identity.md) §3 소관 | 2026-07-25 |
| Midjourney 스타일 참조별 가중치 | 공식 [Style Reference](https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference)에 Discord `--sref URL1::2 URL2::1` 표기. 일반 본문의 Multi-Prompt `::` 비지원과 혼동해 전면 차단하지 않음 | 2026-09-05 |
| Higgsfield 이미지·영상 전 모델에 `negative_prompt` 없음(3D `tripo_3d`만 예외) | `models_list` 전체 종료 확인: 이미지 33·영상 39·오디오 6·3D 17, 후처리 포함. 모든 `parameters` 검사 | 2026-09-06 |
| Higgsfield 모델 길이 상한 | 전체 카탈로그에 `prompt` 상한 미선언; 현행 생성·비용 조회 도구의 `prompt`에도 상한 없음. 백엔드 실제 상한은 미공개 **[미확인]** | 2026-09-05 |
| Higgsfield 호출 롤·비용 조회·비율 보정 | 현행 생성·`estimate_image_cost`·`estimate_video_cost` 도구 정의 확인. canonical 롤을 백엔드 롤로 매핑하고 보정은 `adjustments`로 반환. 생성 결과는 이번에 검증하지 않음 | 2026-09-05 |
| Higgsfield `image` 롤과 `image_references` 롤의 **의미적 동작 차이** | 런타임 description에 서술이 없다 **[미확인]** — 롤 이름으로 동작 차이를 설명하지 않는다 | 2026-07-25 |
| `max` 미선언 모델의 레퍼런스 장수 상한 | 프리플라이트 통과 ≠ 생성 성공. 백엔드 상한 **[미확인]** | 2026-07-25 |
| Grok Imagine UI 지원 비율 목록 | 직접 API의 [비율 표](https://docs.x.ai/developers/model-capabilities/images/generation#aspect-ratio)는 확인했으나 현재 로그인 UI의 전체 선택지는 미관측 **[미확인]** — API 목록을 UI 목록으로 간주하지 않음 | 2026-09-07 |
| MiniMax H3 공식 프롬프트 지침 | [MiniMax-AI/MiniMax-H3](https://github.com/MiniMax-AI/MiniMax-H3) 저장소 `skills/h3-prompt-writing/`의 `SKILL.md`·`base-en.txt`·`ref-en.txt` 원문 확인 — 모드 5종(T2VA/I2VA/L2VA/FL2VA/Ref2VA), 기본 3필드·참조 6필드 섹션과 순서, `<Subject N>`/`<Picture N>`/`<Video N>`/`<Audio N>` 라벨·retention 마커·과업 접두, `<d>` 대사·`(Sx)` 화자·`[Shot N] At MM:SS.mmm` 컷 표기, 다이에제틱/사운드스케이프/비다이에제틱 3계층. 규칙 서술은 [minimax-h3.md](minimax-h3.md) | 2026-09-18 |
| MiniMax H3 공식 API 표면 | 공식 [video generation guide](https://platform.minimax.io/docs/guides/video-generation.md)와 [API 스키마](https://platform.minimax.io/docs/api-reference/video/generation/api/v2-video-generation.json) — `text` 필수·파트당 최대 7,000자, 별도 네거티브 필드 없음, 참조 이미지 ≤9·참조 영상 ≤3(각 2–15초·합계 15초)·참조 오디오 ≤3(동일)·혼합 합계 ≤12파일, `first_frame`/`last_frame`과 `reference_*` 상호배타, `ratio` enum `adaptive`·`21:9`·`16:9`·`4:3`·`1:1`·`3:4`·`9:16`(T2V는 구체값 필수·I2V는 adaptive), `MiniMax-H3` 768P/2K·4–15초 / `MiniMax-H3-Max` 480P/768P·5–15초·`prompt_expansion_mode`·T2V/I2V/Reference Generation 지원, 출력 24fps·32kHz 스테레오 | 2026-09-18 |
| Higgsfield `minimax_h3`·`minimax_h3_max` 로스터 | `models_get` 직접 조회 — `minimax_h3`: duration 4–15초(default 5)·resolution `2K` 단일·batch 1–4·`aspect_ratios` 7종, `minimax_h3_max`: duration 5–15초(default 5)·resolution 480p/768p·batch 1–4. `medias.roles` = start_image/end_image/image_references/video_references/audio_references. `negative_prompt` 계열 없음. `minimax_h3_max`의 롤 조합 지원은 실행 확인 필요 **[미확인]** | 2026-09-18 |
| MiniMax H3 실패 모드(서드파티 관측) | 커뮤니티 관측 — FL2VA 중간 구간 모프·다중 참조 속성 혼선·화면 텍스트 왜곡·오디오 밸런스. 공식 근거 아님. 규칙 서술은 [minimax-h3.md](minimax-h3.md) §실패 모드와 회피 | 2026-09-18 |
| MiniMax H3 오픈웨이트 라이선스 지역 제한 | HF [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/LICENSE)·[Q&A](https://huggingface.co/MiniMaxAI/MiniMax-H3/raw/main/docs/QA-about-License.md) — Excluded Territories = EU·영국·한국·미국(자체 호스팅은 별도 라이선스 신청), 공식 클라우드 API는 전 세계 사용 가능 | 2026-09-18 |
| Rentmeester v. Nike / selection-and-arrangement / idea-expression | 판례·해설 | 2026-07-25 |
| S3 2000자 | 붙여넣기 UX 제약 + 상한 있는 채널 배선의 합성. 그 표면의 보편 상수가 아니다 | — |
| 전달 채널 상한 | 런타임 배선 값 — 이 문서가 아니라 실행 런타임이 권한자([../adapters.md](../adapters.md)) | — |

확인일이 `—`인 행은 **합성값이거나 런타임이 소유한 값이라 날짜 스탬프의 대상이 아니라는 뜻**이고, **[미확인]** 행과 다르다 — 전자는 근거가 다른 곳에 있고, 후자는 근거가 없다. 둘은 배타다: **[미확인]** 행은 "없음을 확인한 날"을 반드시 갖고 `—`를 쓰지 않으며, `—` 행에는 **[미확인]**을 달지 않는다.

S2 항목은 플랫폼이 모델을 추가·제거하면 즉시 낡는다. 90일 넘게 재확인되지 않았으면 단정하지 말고 런타임 확인을 먼저 한다. 엔진 길이 상한도 같은 성질이다 — 모델 세대가 바뀌면 다시 확인한다.
