# 읽기 비용 실측

측정 단위: UTF-8 코드포인트(문자 수, `wc -m`). 읽기 순서의 정본은 `SKILL.md` §필요한 자료만 읽는다의 묶음 표와 `scripts/read_refs.mjs`의 `BUNDLES`다. 이 파일은 실측 기록일 뿐 규칙을 소유하지 않는다.

## 2026-10-11 — 이름 묶음(3.3.8)

커널 `SKILL.md` 8,749자. 묶음 글자 수는 `node scripts/read_refs.mjs --bundles` 출력이며, 합계 = 커널 + 묶음. 묶음 뒤에 덧붙이는 절(예: `references/image/from-image.md#1` 2,125자, 공급자 날짜 절, 엔진 어댑터 절)은 포함하지 않았다.

| 묶음 | 읽는 것 | 묶음 | 커널+묶음 |
|---|---|---|---|
| `gpt-image-new` | `references/image/surfaces.md#0` + `references/image/surface-contracts.md#3.2` | 6,788 | 15,537 |
| `gpt-image-new-structured` | `references/image/surfaces.md#0` + `references/image/surface-contracts.md#3.2,3.4` | 7,604 | 16,353 |
| `gpt-image-portrait` | `references/image/surfaces.md#0` + `references/image/surface-contracts.md#3.2` + `references/image/editorial/portrait-brief.md` + `references/image/compiler.md#피부·재질` | 12,852 | 21,601 |
| `gpt-image-edit` | `references/image/surfaces.md#0` + `references/image/surface-contracts.md#3.2,3.3` | 9,216 | 17,965 |
| `gpt-image-edit-structured` | `references/image/surfaces.md#0` + `references/image/surface-contracts.md#3.2,3.3,3.4` | 10,032 | 18,781 |
| `video` | `references/image/surfaces.md#0` + `references/image/lanes.md#영상 공통 규칙` | 7,074 | 15,823 |
| `delegation` | `references/templates/delegation.md` | 1,601 | 10,350 |
| `text-model-adapt` | `references/model-playbooks.md#공통 적응 규칙,공급자 색인` | 1,654 | 10,403 |
| `image-prompt-conversion` | `references/image/prompt-conversion.md` + `references/image/model-routing.md#6` | 5,278 | 14,027 |

커널만 읽는 요청(단순 텍스트·검토·부분 수정)은 8,749자다. 2026-09-17 대비 커널이 커진 것은 행동 구분 표·출력 형식 표·검수 규칙이 들어왔기 때문이고, 이미지 브랜치는 surfaces 전체 대신 §0과 표면 계약 §3.x만 읽어 19,784 → 15,537(`gpt-image-new`)로 내려갔다. 토큰으로는 커널 `SKILL.md`가 5,537, `gpt-image-portrait` 묶음이 6,482, `video` 묶음이 약 3,600이었다(2026-10-11 새 세션 2건의 Codex 도구 출력 `original token count` 실측). 커널은 `head`로 잘라 읽지 말라고 적지만, 같은 실측에서 인물 화보 세션이 `max_output_tokens: 3000`을 스스로 걸어 `portrait-brief.md` 절 대부분이 중간 잘림으로 빠졌고, 영상 세션은 4,000으로 걸어 온전히 받았다. 잘림은 `head`보다 호출 측 출력 토큰 상한 축소에서 먼저 생긴다.

## 2026-09-17 — 분할 직후(기록)

측정 단위는 같다. "읽는다" = 당시 브랜치 매니페스트에 적힌 파일·절만 읽는다.
before = 분할 전(커밋 2fda185 시점) — 텍스트 브랜치는 templates.md 전체(17,850), 이미지 브랜치는 surfaces.md 전체(30,511)를 읽었다.

| 브랜치 | 읽는 것 (after) | before | after |
|---|---|---|---|
| TEXT-SIMPLE | SKILL.md만 | 6,348 | 6,076 |
| TEXT-DELEGATION·CONTRACT | SKILL + common + delegation + contract | 24,198 | 18,098 |
| GOAL | SKILL + common + delegation + goal | 24,198 | 17,067 |
| TEAM | SKILL + common + delegation + team + model-playbooks | 35,303 | 28,490 |
| MODEL | SKILL + common + model | 24,198 | 17,263 |
| BUSINESS | SKILL + common + delegation + business (+design 시 +567, +slides 시 +2,123) | 24,198 | 18,792 |
| IMAGE (S3 표면 예시) | SKILL + surfaces §0–§0-2·§6 + model-routing §4 + lanes §레인 게이트 카드 + surface-contracts §3 | 61,478 | 19,784 |
| VIDEO | IMAGE 순서 + lanes §영상 공통(5,516) + 엔진 파일 | 61,478+ | 25,300+엔진 파일 |
| COMPOSITE | IMAGE 순서 + lanes §배경 합성(1,478) | 61,478+ | 21,262+ |
| DELTA·REVIEW | SKILL.md만(기준 원문이 컴파일형이면 해당 브랜치 파일 추가) | 6,348 | 6,076 |

모든 브랜치가 before보다 낮다. TEXT-SIMPLE·DELTA·REVIEW는 커널만 읽는다.

당시 브랜치 → 읽기 순서 표는 이후 커널의 묶음 표와 `BUNDLES`로 대체됐다.

## 분할 맵

- `references/templates.md` → 인덱스(외부 소비자 호환 경로). 실물은 `references/templates/` 8개 파일.
- `references/image/surfaces.md` → §0·§0-1·§0-2·§6(공통 판정)만 유지. §1–§5는 `surface-contracts.md`, §7 재검증 표는 `surface-evidence.md`.
