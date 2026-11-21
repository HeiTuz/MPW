# 룩 카드 색인

룩 하나가 모든 층에 무엇을 넣는지 한 파일에 적은 것이 룩 카드다. 사용자가 룩 이름을 말했으면 층을 채우기 전에 그 룩의 카드를 읽는다. 카드를 찾는 길은 `node scripts/find_tokens.mjs --q "<요청 문구>"`다. 질의에 아래 부르는 이름이 하나라도 들어 있으면 출력 맨 위에 `## Look card` 블록이 카드 경로와 읽는 명령을 낸다. 카드는 `node scripts/read_refs.mjs references/image/looks/<slug>.md`로 읽는다(스크립트를 못 돌리면 이 표에서 파일을 직접 연다).

카드 한 장의 절 구성, 층별 줄을 쓰는 방식, 우선순위는 [image-brief.md](../image-brief.md) §4 '룩 카드'가 정본이다. 카드 안의 `끄는 고정 몫`은 [fixed-lines.md](../fixed-lines.md)의 슬롯 이름으로 적는다.

| slug | 부르는 이름 | 부르지 않는 말 | 문화권 | 갈래 |
|---|---|---|---|---|
| wong-kar-wai | 王家卫; 왕가위; Wong Kar-wai; WKW; 港风; 港片; 홍콩영화; 홍콩 영화; 90년대 홍콩; Hong Kong film; 重庆森林; 중경삼림; Chungking Express; 花样年华; 화양연화; In the Mood for Love; 堕落天使; 타락천사; Fallen Angels; 阿飞正传; 아비정전; Days of Being Wild | 홍콩; Hong Kong; 홍콩 여행; 홍콩 스냅 | CN | A 重庆森林(기본); B 花样年华; C 堕落天使; D 阿飞正传 |

- 부르는 이름에는 그 룩만 가리키는 말만 넣는다. 도시 이름 하나(`홍콩`, `도쿄`)나 흔한 말은 넣지 않는다. 홍콩 여행 스냅이 왕가위 카드로 읽히지 않게 하려는 것이고, 그런 말은 `부르지 않는 말`에 적는다.
- 카드가 둘 이상 불리면 둘 다 읽고, 요청 단서가 더 많이 맞는 카드를 주로 쓴다.
- 이 폴더의 카드는 Iris(MIT) 프리셋의 구성과 디테일을 층별로 옮긴 것이다. 고지 전문은 [LICENSE-Iris.md](LICENSE-Iris.md).

## 카드

- [wong-kar-wai.md](wong-kar-wai.md): 王家卫 · 港风 — 90년대 홍콩영화
