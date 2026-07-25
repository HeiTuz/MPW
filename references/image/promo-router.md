홍보판촉물 레이아웃 라우터 소관: 정보성 C7 카드와 디자인 홍보물 `promo_poster`를 분리하고, 선택한 P 패턴 하나만 점진적으로 로드한다. 공통 이미지 철칙은 [compiler.md](compiler.md), 룩 L1~L8은 [look-and-concept.md](look-and-concept.md), 정확 카피는 [typography.md](typography.md)가 정본이다.

# 홍보판촉물 P1~P8 라우터

## 1. C7 정보 카드와 promo 분기

| 요청의 주목적 | 라우팅 | 판정 |
|---|---|---|
| 팁·요약·체크리스트·캐러셀처럼 정보를 빠르게 전달 | C7 `sns_cover`; 이 라우터를 로드하지 않음 | 카드·배지·소품 밀도가 정보 탐색을 돕는다. |
| 제품·패션·전시·브랜드의 인상을 한 장의 디자인 물건으로 각인 | C3/C5 + `cut_type: promo_poster`; 아래 P 하나 선택 | 초대형 타이포가 피사체와 물리적으로 얽히고 여백 긴장이 남는다. |

`홍보`, `프로모션`, `포스터`라는 단어만으로 C7을 고르지 않는다. 정보 전달이 주목적일 때만 C7이고, 시각 캠페인·판촉 디자인이 주목적이면 promo다.

## 2. 점진 로딩

아래 표에서 **P 하나를 고른 뒤 해당 파일 하나만 읽는다.** 한 산출물에는 P 패턴 하나만 허용한다. 두 패턴의 느낌이 모두 필요하면 컷을 둘로 나누고 각 컷에 하나씩 적용한다.

| 신호 | P | 상세 파일 | 기본 AR |
|---|---|---|---|
| 글자 안 사진, 매거진 커버 | P1 typomask | [promo/P1-typomask.md](promo/P1-typomask.md) | 4:5 |
| 글자가 무대·계단·빛의 공간 | P2 typo-environment | [promo/P2-typo-environment.md](promo/P2-typo-environment.md) | 2:3 |
| 단품 제품, 큰 글자 뒤·앞 겹침 | P3 oversized crop+occlusion | [promo/P3-crop-occlusion.md](promo/P3-crop-occlusion.md) | 4:5 또는 1:1 |
| 동일 DNA의 캠페인 시리즈 | P4 color campaign | [promo/P4-color-campaign.md](promo/P4-color-campaign.md) | 1:1 또는 4:5 |
| 디자인 스튜디오·아카이브·화면 속 화면 | P5 meta-UI | [promo/P5-meta-ui.md](promo/P5-meta-ui.md) | 4:5 또는 9:16 |
| 스트리트·Y2K·스크랩 콜라주 | P6 street collage | [promo/P6-street-collage.md](promo/P6-street-collage.md) | 4:5 |
| 패션·전시, 회전한 읽기 축 | P7 editorial rotate | [promo/P7-editorial-rotate.md](promo/P7-editorial-rotate.md) | 9:16 또는 2:3 |
| 럭셔리 제품군의 단색 무대 | P8 monochrome staging | [promo/P8-monochrome-staging.md](promo/P8-monochrome-staging.md) | 3:4 |

**공통 각주:** 위 `기본 AR`은 표면 판정 이후의 후보다. S1 기계 계약은 `contracts/v1/*.schema.json`의 enum, S2는 모델의 `aspect_ratios`, S1-legacy는 [production.md](production.md) §2가 최종 판정한다([surfaces.md](surfaces.md) §1·§2). 각 P 파일의 끝 토큰 AR 표기는 S3 붙여넣기·S1-legacy 벌크(jsonl, E-AR-END 필수) 표면 한정이다 — S1 기계 계약·S2 플랫폼에서는 비율이 파라미터이므로 본문 AR을 두지 않는다(정본: [compiler.md](compiler.md) 철칙 1·§5).

## 3. P/L 권한 계약

- **P**는 레이아웃·타이포 위계·타이포와 피사체의 물리 관계만 결정한다.
- **L**은 색·빛·질감만 결정한다. P의 크롭·회전·오클루전·배치 구조를 덮어쓰지 않는다.
- 기본 조합은 P 1개 + L 1개다. P를 고르지 못하면 질문하지 말고 위 표의 가장 가까운 하나를 택한다.
- 팔레트 권한은 하나만 둔다. P가 2~3색을 지정하면 `palette_authority: P`, `palette_sources: ["P"]`로 기록하고 L의 HEX는 버린 채 빛·질감만 가져온다. P가 팔레트를 열어 두었을 때만 L을 권한자로 삼는다.
- `scripts/check_prompt.mjs --jsonl`은 promo 레코드의 `promo_pattern`, `palette_authority`, `palette_sources`를 검사한다. 두 팔레트 소스가 남으면 방출 실패다.

## 4. promo 방출 게이트

1. 헤드라인이 장식 오버레이가 아니라 피사체를 가리거나, 피사체 뒤로 지나가거나, 마스크·압출·지지 구조로 작동한다.
2. 최종 HEX는 중복 제거 후 2~3색 하드 락이다.
3. 마감 장치는 바코드·메타 행·크롭마크·에디션 번호·세로 마진 라벨·스탬프·종이 물성 중 1~3개다.
4. 3D 클레이 히어로 + 소품 3~5개 + 배지 2~3개인 C7 밀도 문법으로 후퇴하지 않는다.
5. `korean_copy`는 따옴표 안에 정확히 1회만 렌더한다.
6. `promo_text_effect`가 `mask` 또는 `extrusion`이면 한글 안전권은 2음절까지다. 3음절 이상은 카피 축소나 효과 변경 전에는 방출하지 않는다.
7. P5의 UI는 실제 앱 화면이 아니라 종이에 인쇄된 메타 그래픽으로 서술한다.

`check_prompt.mjs`의 promo 에러는 이 게이트의 기계 검증 범위다. 시각적 물리 관계와 실제 화면 품질은 생성 후 QC에서 별도로 판정한다.

## 5. 보류 범위

이 라우터가 결합하는 룩 정본은 L1~L8이다. 구현 본문이 없는 L9는 라우팅·기능으로 추가하지 않는다.
