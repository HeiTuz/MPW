# 읽기 지도 — 묶음 밖의 판단

[SKILL.md](../SKILL.md) §필요한 자료만 읽는다의 묶음 표가 다루지 않는 요청은 아래 행에서 필요한 자료만 고른다. 절이 적힌 자료는 그 절만 `node scripts/read_refs.mjs`로 읽는다.

| 필요한 판단 | 읽을 자료 |
|---|---|
| 텍스트 구조·질문·수신자 적응이 복잡함, 사진 연출의 `/키워드` | [common.md](templates/common.md); 키워드는 §사진 연출의 슬래시 키워드 |
| 리서치·추출·분류·목록 처리 | [model.md](templates/model.md); 출처 판정은 [research.md](research.md), 실행 단위 사이 입력·출력이 얽히면 [prompt-graph.md](prompt-graph.md) §5 |
| 업무 고유 형식 | [business.md](templates/business.md); 덱은 [slides.md](slides.md), UI는 [design.md](templates/design.md) |
| 지정 엔진의 문법·파라미터·길이 제한, 모델 추천 | [surfaces.md](image/surfaces.md) → [surface-contracts.md](image/surface-contracts.md)의 해당 표면만; 엔진 어댑터는 [model-routing.md](image/model-routing.md) §6, 모델 추천만 §1·§2와 §4. 대상 미정의 자연어 초안에는 API 조회·모델 선정을 요구하지 않는다 |
| 참조 이미지의 역할·관찰이 필요함 | [from-image.md](image/from-image.md) §1. 원본 편집은 변경·보존 조건으로 바로 작성하고 상세 관찰·취향 변주는 요청될 때만 |
| 캐릭터시트·고스트 캐릭터 레퍼런스 | 양식 선택은 [ghost-character-reference-sheet.md](image/ghost-character-reference-sheet.md) §1 |
| 원본별 편집이 아닌 제품 사진 여러 컷의 새 생성 | [product-multicut-consistency.md](image/product-multicut-consistency.md) |
| 합성·전문 이미지·영상 연출 | [lanes.md](image/lanes.md)의 해당 절만 |
| HyperFrames 프로젝트를 만드는 에이전트에게 줄 제작·수정 지시 | [hyperframes-prompting.md](hyperframes-prompting.md). 영상 생성 모델의 단일 클립 프롬프트와 구별한다 |
| 팀 역할·권한 라우팅, 실제 호출 배선 | [model-playbooks.md](model-playbooks.md) §역할·권한 라우팅~§Surface-matched evidence; 배선만 [adapters.md](adapters.md) |
| 명시된 MPW 기계 형식 | [contracts.md](contracts.md), GardenRecipe·PromptBundle은 [garden-recipe-compiler.md](garden-recipe-compiler.md). 자연어 초안에 컴파일 형식을 강제하지 않는다 |

절이 적히지 않은 긴 자료는 `--toc`로 제목을 보고 필요한 절만 읽는다. 예시의 숫자·도구·취향은 기본 요구가 아니다.
