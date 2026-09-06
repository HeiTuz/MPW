# 에디토리얼 패션 — Tier-2·안전·로컬리티

우선순위: [../lanes.md](../lanes.md) §레인 게이트 카드 > [../compiler.md](../compiler.md) 철칙 > 이 파일. 철칙 전문은 [../compiler.md](../compiler.md).

> **정본 선언:** 이 문서 §2의 코드블록이 Tier-2 고정 문구(SAFETY_ASSERT·NEGATIVE_TAIL)의 **유일한 문서 정본**이다. 예외는 기계 사본 둘 — [../compiler.md](../compiler.md) §2 인라인 복사본과 `scripts/check_prompt.mjs` 상수 — 뿐이며 `scripts/lint.py`가 3자 byte 대조로 잠근다. 그 밖의 문서·예제는 전문을 싣지 않고 요약+포인터 또는 `[SAFETY_ASSERT]`·`[NEGATIVE_TAIL]` 슬롯 표기만 둔다.

## 2. Tier-2 컴플라이언스 레인 (동결)

Tier-2는 **명시 선언 시에만** 활성화한다. 우선순위는 `--tier 2` 플래그 > jsonl `tier: 2` > jsonl `lane: "editorial"`다. **휴리스틱 승격 불가** — 검증기가 자동으로 켜주지 않는다. 아래 두 문구는 동결 스펙(SSOT)이다. **byte-for-byte 인용**하고 한 단어도 바꾸지 않는다.

이 계약은 성인 비노출 화보에만 적용한다. 안전 문구에 성별·민족·특정 연령대·가상 인물·포즈를 끼워 넣지 않는다. 사용자나 참조가 정한 인물과 자세는 별도로 보존한다. 요청과 이 레인의 의상·성인 조건이 맞지 않으면 사용자를 재설정하지 말고 실제 모델의 네이티브 지침과 적합한 레인으로 돌아간다. 2026-09-06 개정은 문구 범위를 바로잡은 것이며 생성 품질 재검증을 뜻하지 않는다.

**SAFETY_ASSERT (긍정형 — 피사체 절, 즉 프롬프트 첫 절에 배치):**

```text
adult subject, non-nude fashion editorial, fully opaque clothing, secure garment coverage, non-sexual presentation
```

**NEGATIVE_TAIL (고정 순서 — 정확히 1회, 트레일링 `AR x:y` 직전 마지막 절):**

```text
no nudity, no nipple or genital exposure, no wardrobe malfunction, no extra people, no text, no watermark
```

| 규칙 | 내용 | 위반 코드 |
|---|---|---|
| 배치 | assert = 피사체 절(맨 앞), tail = AR 직전 마지막 절 | `E-TIER2-POS` |
| 횟수 | tail 정확히 1회 | `E-TIER2-DUP` |
| 페어링 | **tail 단독 금지**. 성인·비노출 화보·불투명 의상·안정된 가림·비성적 표현의 안전 앵커 ≥3개가 있어야 tail 허용. 구형 기록의 covered chest·editorial upright도 검사 호환만 유지하며 새 작성에 강제하지 않는다 | `E-TIER2-PAIR` |
| 부분집합 | tail은 **순서 보존 부분집합만** 허용. 항목 삭제 OK, 임의 항목 추가 금지 | `E-TIER2-EXTRA` |
| 라벨 | `Negative:` 라벨 섹션은 전 티어 금지 | `E-NEG-SECTION` |
| 미선언 사용 | tier 0/1에서 tail 문구 사용 | `E-NEG-TIER` |

부분집합 예 — 요청된 인물 수·렌더 텍스트·원본의 표시와 충돌하는 항목은 삭제한다. 요청된 콘텐츠를 없애서 tail에 맞추지 않는다. 남은 항목의 순서는 그대로다.

```text
no nudity, no nipple or genital exposure, no wardrobe malfunction, no extra people
```

단, 항목을 끼워 넣거나(`no logo` 등) 순서를 바꾸면 `E-TIER2-EXTRA`다. 늘리고 싶은 제약은 tail이 아니라 본문 긍정형으로 해결한다. 예: 로고 → `브랜드 없는 클린 마감`.

**WHEN — 언제 Tier-2를 켜는가:**

| 상황 | Tier-2 |
|---|---|
| 명시적으로 Tier-2 레인을 선택한 글래머·에디토리얼 | 위 동결 계약 적용. 의상 키워드만으로 일반 요청을 승격하지 않는다 |
| 일반 화보(코트·니트·수트 등 비노출 의상) | 끔. [format-b.md](format-b.md) §1 Tier-0 형태 |
| photoreal 렌더 | 같은 소재라도 stylized보다 한 단계 더 보수적으로. 의상 어휘를 §3 원칙으로 한 칸 낮춤 |

**거부(refusal) 발생 시 대응 순서 (이 순서 고정):**

1. 의상 어휘를 더 안전한 쪽으로 교체한다. §3 치환 원칙 적용. 노출 서술 → 재단/실루엣 서술.
2. Tier-2 블록이 온전히 붙어 있는지 확인한다. assert 첫 절 + tail 마지막 절 + 페어링.

부정문을 늘리거나 표현을 우회적으로 비트는 건 대응이 아니다. 소재 자체를 안전한 서술로 바꾸는 것이 유일한 1차 수단이다.

과거 기록: **v2 실험 B, 10피사체×2암**에서 NEGATIVE_TAIL이 이미지에 글자로 렌더된 사례 **0/9**, 당시 compliance·goal_fit은 긍정형 단독 암과 동률이었다. 거부율 개선은 N=10에서 판정 불가(양 암 모두 명시적 refusal 0건). 이 작은 표본의 관측은 현재 모델·새 안전 문구의 누출 방지나 품질을 보증하지 않는다.

**완성 예제 — Tier-2 포함:**

```text
adult subject, non-nude fashion editorial, fully opaque clothing, secure garment coverage, non-sexual presentation, 맑은 눈매와 내추럴 메이크업, 느슨한 로우 번 헤어, 한국 남성지풍 클린 화보 컷, 리조트 풀 데크에 서서 어깨를 펴고 턱을 살짝 든 자세, 크림색 새틴 라운지 로브 세트와 발목 길이 와이드 팬츠 여유로운 핏, 전신 세로 구도 아이레벨 시점, 부드러운 골든아워 사이드라이트와 길게 눕는 그림자, 팔레트 #F2E8DA #D9B48F #7A8B99 #24303B, 새틴의 은은한 광택과 natural skin texture, visible pores, subtle film grain, no nudity, no nipple or genital exposure, no wardrobe malfunction, no extra people, no text, no watermark, AR 2:3
```

실측: 499자. Tier-2 동결 블록은 219자(SAFETY_ASSERT 114+NEGATIVE_TAIL 105)다. 길이는 [../surfaces.md](../surfaces.md) §0-1·§0-2를 따르며, 임의 분량에 맞추려고 동결 문구나 사용자 요구를 줄이지 않는다. jsonl: `{"ar": "2:3", "size": "1024x1536", "tier": 2, "lane": "editorial", "format": "B"}`.

체크: 안전 앵커 5종 존재 / 요청 인물·자세 보존 / tail 1회·AR 직전 / 캐노니컬 순서 그대로 / 대괄호 잔존 0.
## 3. 안전한 패션 서술 원칙 — 실루엣 우선

핵심 판정문: **"섹시한 신체"가 아니라 "성인 하이패션 실루엣"을 쓴다.** 실측상 해부학 중심(anatomy-forward) 문구는 실패하고, 의상·실루엣 중심(garment/silhouette-forward) 문구는 통과한다. 같은 컷도 서술 축을 바꾸면 결과가 갈린다.

| 실패 축 — 신체/노출 서술 | 성공 축 — 의상 디자인 서술 |
|---|---|
| 가슴 노출을 주제로 서술 | 네크라인을 의상 재단 디테일로 서술. 예: `구조적인 네크라인의 불투명 보디스` |
| 피부 노출 면적 강조 | 원단·핏·실루엣 강조. 예: `몸의 선을 따라 떨어지는 불투명 새틴` |
| seductive / provocative 류 무드 | `editorial poise`, `composed direct gaze`, `confident silhouette` |
| 신체 부위 나열 | `[SILHOUETTE]` 라인 어휘. 허리 라인, 어깨 선, 롱 레그 프로포션 |
| 노출 의상을 벗은 정도로 설명 | 제품 룩북 관점. 색·소재·의류종·재단·마감으로 설명 |

- 의상은 항상 패션 화보/룩북의 제품으로 다룬다. 시선의 목적어가 신체가 아니라 옷이 되게 한다.
- 의상 슬롯은 4요소(색·소재·의류종·핏/디테일)를 다 채운다. 요소가 빠질수록 모델이 노출 쪽으로 임의 보간할 여지가 커진다. `불투명(opaque)`은 노출성 의상 어휘가 하나라도 있으면 소재 수식어로 상시 부착한다.
- 반복 강조도 위험 신호다. 같은 노출 어휘를 컷마다 주제로 반복하면 단발성 사용보다 실패율이 뛴다. 배치에서는 노출성 어휘를 특정 컷 몇 개에만 두고 나머지는 다른 재단 축으로 분산한다.
- photoreal은 stylized/일러스트보다 판정이 엄격하다. 같은 의상이면 photoreal 쪽 어휘를 한 단계 보수적으로 쓴다.
- Tier-2는 성인 비노출 화보 계약을 따른다. 인물·원본 보존은 [../compiler.md](../compiler.md) 철칙 8을 따르고, 가상 페르소나로 자동 교체하지 않는다.
- 세부 생존/실패 토큰 표는 공개 문서에 두지 않는다. 로컬 상세판이 존재하면 그 토큰표를 우선 참조한다.
## 13. 한국 로컬리티·리얼리티 매트릭스 (2026-07 리서치 반영)

판정문: 로컬리티가 결과를 가를 때 관찰 가능한 스타일·공간·조명 단서를 쓴다. 얼굴형·피부색·체형을 국적에서 추론하지 않는다. 사용자 지정 인물·브랜드·장소와 원본 보존 요구는 [../compiler.md](../compiler.md) 철칙 8을 따른다. 아래 가상 설정·무로고 예시는 새 장면을 설계할 때의 선택지다.

| 축 | 채택 패턴 | 버리는 패턴 |
|---|---|---|
| 피사체 | 사용자·참조의 성인 인물, 제공된 나이대, 헤어 길이/질감, 립 피니시, 의상 소재·핏 | `Korean girl` 단독, 실존 아이돌/배우 닮은꼴, 미성년 암시 |
| 피부·얼굴 | `natural skin texture, visible pores, subtle film grain`, hydrated skin-like base, blurred rose lip tint, brushed brows, soft diffused color, fine vellus hair | porcelain/pale/yellow 같은 국적-피부 고정(검증기 E-NAT-SKIN), plastic skin, 무자격 glass skin 과잉(자격화는 [concept-collision.md](concept-collision.md) §15.3) |
| 헤어·뷰티 | 짧은 웨이브 단발, 로우 번, 잔머리, 투명한 베이스 메이크업, subtle blush처럼 보이는 스타일 | "K-beauty처럼" 단독, 완벽한 대칭/무결점 피부 |
| 의상 | 색·소재·의류종·핏/디테일 4요소 + 무로고 가상 컬렉션 | 실재 브랜드명, 노출/신체 중심 서술, 로고가 읽히는 의상 |
| 서울/한국 공간 | 성수 붉은 벽돌 창고형 파사드, 한남/한강진 갤러리 거리와 쇼룸 창 반사, 익선동 한옥 처마·목재 문틀, DDP 은회색 곡면 건축과 패션위크 플래시, 젖은 서울 골목의 전선·낮은 상가 셔터처럼 공간 구조·재료·빛으로 명시 | 유명 매장·상표 간판, 관광 스테레오타입만 나열, 읽히는 실재 로고 |
| 광고/잡지 톤 | 매거진 여백, editorial upright pose, direct on-camera flash, clamshell beauty, 창가 자연광, 무광 종이 질감 | "프리미엄/고급/트렌디" 같은 판정 불가 형용사 |
| 리얼리티 | 손이 소매를 잡아 직물 주름이 생김, 발 접지 그림자, 머리카락 잔결, 배경 반사와 피사체 림라이트 방향 일치 | bad hands/no AI 같은 부정 토큰, 손·발·배경 상호작용 생략 |
| 필름/컬러 | 필름명 1개 이하 + 결과 3파트: 스킨, 섀도, 하이라이트. 예: Portra = warm skin, soft pastel midtones, gentle highlight roll-off | Kodak/Fuji/CineStill/Portra를 한 컷에 다 쌓기, 8K/masterpiece/ultra-realistic |

실무 변환 규칙:
- "한국인 느낌" → 의도한 스타일을 구별하는 단서만 구체화하고, 원본 인물의 외형을 새로 설정하지 않는다. 축 개수를 채우지 않는다.
- "서울 감성" → 지역명보다 건물 재료·거리 폭·간판 처리·시간대 빛·팔레트 HEX를 쓴다. 간판은 `abstract light shapes, no readable real brand text`가 아니라 한국어로 "간판은 추상적 빛 형태, 읽히는 실재 상표 없음"처럼 장면 긍정형으로 쓴다.
- "AI 같지 않게" → `natural skin texture`, 접지 그림자, 직물 장력, 손-소품 접촉, 배경 반사/그레인 통일처럼 보이는 증거로 바꾼다.
- "필름톤" → 필름명은 앵커일 뿐이다. 한 컷엔 하나의 emulation만 쓰고, skin/shadow/highlight/halation/grain 결과를 직접 쓴다.
