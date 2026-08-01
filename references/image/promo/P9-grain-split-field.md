# P9 grain split field — 그레인 색면 분할

**레이아웃 권한:** 평평한 고채도 색면 두 장이 판면을 세로 또는 가로 한 줄로 나누되, 경계선만 좁은 인쇄 그레인 점묘 대역으로 부서져 두 색이 알갱이 단위로 서로 물린다. 유기적 도형 하나가 그 경계를 밟고 앉아 화면의 유일한 스케일 기준이 되고, 초대형 평면 대문자가 한쪽 색면 위에 누워 좌우 재단선까지 폭을 밟는다. 깊이는 원근이 아니라 색 분리와 잉크 알갱이가 만든다.

**드롭인:** `two flat saturated color fields dividing the plate along one boundary that dissolves into a narrow strip of coarse printed grain stippling while both fields stay solid to their edges, a single organic shape resting across that boundary as the sole scale marker, held perfectly flat as one even ink area, uniform halftone tooth laid over the whole surface, the headline set in bold flat display capitals lying on one field and spanning the full trim width with the outer strokes touching both trim edges, one small satellite line held in the outer margin, offset lithograph poster stock under even flat light`

**마감 후보:** 균일 망점 결(종이 물성)은 상수. 에디션 번호 또는 크롭마크 중 1개만 추가한다.

**팔레트:** 주 색면·대비 색면·활자 잉크 3색 하드 락(시작값 `#EE4A24` `#1D1D1A` `#E1D0A7`). 그레인 대역에는 별도 HEX를 두지 않는다 — 두 색면 잉크가 알갱이 단위로 섞이는 결과로만 서술한다.

**실패 판정:** 경계가 매끈한 벡터 선으로 남으면 도형 두 장을 겹친 디지털 합성으로 실패다. 점묘 대역은 판면 폭 7% 안팎의 좁은 띠로 못 박고 색면 본체는 solid를 유지한다 — 넓으면 색 분리가 사라지고 얇으면 알갱이가 안 남는다. 유기 도형에 명암·볼륨이 생기면 판면 평면성이 깨지므로 `held perfectly flat as one even ink area`를 함께 붙인다.

**카피 안전:** 한글 헤드는 2~5음절. 자수가 늘수록 획이 얇아지므로 글자폭이 재단선에 닿는 결과(`spanning the full trim width, the outer strokes touching both trim edges`)를 명시해야 블리드 압력이 유지된다. 위성 텍스트는 바깥 마진 1행, 활자 잉크색 그대로. `promo_text_effect: trim_span`. 끝 토큰 `AR 2:3`.
