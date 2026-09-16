# P12 signage collage anchor — 간판체 콜라주 + 고정 앵커

**레이아웃 권한:** 1도 색면 판면을 격자로 깔고 칸마다 배경색만 갈아끼우며 요소 배치 순서는 고정한다. 표제 자형은 칸마다 계열을 바꾸고(인라인 줄무늬·아웃라인 오프셋 그림자·계단형 비트맵·도트 조합), 초압축 슬랩 앵커 한 종이 매 칸 같은 하단 밴드에서 판면 폭을 꽉 채워 위계의 바닥을 만든다. 자형이 변수, 앵커·씰·여백 골격이 상수 — 이 역할 분리가 시리즈를 한 손에서 나온 것처럼 묶는다. 이 패턴의 물리 결속 대상은 피사체가 아니라 판면 골격 자체이며, 격자는 독립 컷 여러 장을 묶는 매트릭스가 아니라 한 산출물의 내부 패널 구성으로 서술한다 — 허용 여부의 정본은 compiler.md 철칙 6이다.

**컷 공식:** `[고정 골격 문장(격자·앵커 밴드·씰 코너·바닥 물성)] + [이 컷의 자형 계열 조합 1문장] + [이 컷의 앵커 단어]`

**드롭인:** `a grid of single-hue color-field panels with swapped hues and a fixed element order, each panel carrying a different display letterform — inline-striped, offset-shadow outline, pixel-stepped, dotted — while one ultra-condensed slab anchor fills the full panel width inside a fixed bottom band, its baseline locked to the bottom margin of every panel, a circular seal badge and a monospaced micro caption locked to the same corner, printed sheets resting on speckled stone under broad soft daylight`

**마감 후보:** 원형 씰 배지(스탬프) + 모노스페이스 극소 캡션(메타 행) + 비도공지 섬유 그레인(종이 물성) 중 1~3개. 씰·캡션은 매 판면 같은 모서리에 고정한다.

**팔레트:** 색면 기준색·앵커 잉크·액센트 3색 하드 락(시작값 `#DAE9BE` `#143212` `#F27A2C`). 색면과 앵커 잉크의 명도차를 크게 벌려야 자형 계열이 넷으로 갈려도 앵커가 먼저 읽힌다.

**실패 판정:** 앵커가 위성 캡션 크기로 내려앉아 위계가 평평해지면 실패다. `at a fixed lower band` 단독은 '가장자리 배치'로 약하게 해석되므로, 밴드의 위치와 점유 폭을 결과로 못 박는다(`fills the full panel width inside a fixed bottom band, its baseline locked to the bottom margin of every panel`).

**카피 안전:** 앵커 한글은 2~4음절 — 초압축 슬랩은 받침 있는 글자에서 획이 서로 붙는다. 정확도가 최우선이면 고밀도 정사각 사이즈로 승급한다(size는 실행 파라미터 — 표면 상한 정본은 surfaces.md §4, S1-legacy 레코드 필드는 production.md §2 소관). 위성 캡션은 모노스페이스 소자로 앵커의 1/8 이하 크기. `promo_text_effect: anchor_band`. 끝 토큰 `AR 4:5`.
