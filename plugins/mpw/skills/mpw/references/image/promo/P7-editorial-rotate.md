# P7 editorial rotate — 회전한 패션 포스터

**레이아웃 권한:** 사진 또는 타이포 레인을 90도 회전해 읽기 축을 세로로 바꾸고, 양쪽 마진에 워드 단위 타이포를 배치한다. 회전 텍스트는 긴 문장이 아니라 짧은 단어만 쓴다.

**드롭인:** `the fashion photograph rotated ninety degrees inside a warm paper frame, vertical typography lanes running along both margins with one oversized grotesque word, one italic accent word and short serif footnotes, disciplined open margins and small coordinate arrows`

**마감 후보:** 별표 세 개를 하나의 장치로 계산하고, 여기에 바코드 또는 세로 마진 라벨 하나를 더한다.

**팔레트:** 종이색·잉크·사진에서 뽑은 액센트 1색의 3색 이내.

**실패 판정:** 사진만 회전하고 타입 축이 가로로 남거나, 긴 문장을 세로 회전해 읽을 수 없으면 실패다. `promo_text_effect: rotated_axis`. 끝 토큰 `AR 9:16` 또는 `AR 2:3`.
