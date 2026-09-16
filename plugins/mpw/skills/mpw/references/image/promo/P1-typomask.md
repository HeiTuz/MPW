# P1 typomask — 글자 안의 사진

**레이아웃 권한:** 초대형 단어의 획 안에 사진을 마스킹하고, 사진이 단어 아래 풀블리드 영역까지 이어져 타이포와 피사체가 한 평면이 되게 한다. 상단 단색 필드·하단 사진·얇은 메타 행으로 위계를 고정한다.

**드롭인:** `one giant ultra-bold headline spanning the full width, the subject photograph masked inside the letterforms and continuing as a full-bleed image below so type and image merge into one plane, a slim meta-information row near the top edge, disciplined open margins`

**마감 후보:** 작은 바코드 1개, 두 모서리 크롭마크. 둘 중 1~2개만 쓴다.

**팔레트:** P가 권한자면 밝은 필드·사진 핵심색·잉크의 3색으로 잠근다. L의 HEX는 제거한다.

**카피 안전:** 영문은 짧은 단어 하나. 한글 마스킹은 2음절까지이며 `promo_text_effect: mask`로 기록한다. 3음절 이상인 지정 카피는 줄이지 않고 [../promo-router.md](../promo-router.md) §4의 효과 충돌 절차를 따른다. 끝 토큰 `AR 4:5`.
