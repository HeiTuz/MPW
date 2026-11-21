# 룩 카드 색인

룩 하나가 모든 층에 무엇을 넣는지 한 파일에 적은 것이 룩 카드다. 사용자가 룩 이름을 말했으면 층을 채우기 전에 그 룩의 카드를 읽는다. 카드를 찾는 길은 `node scripts/find_tokens.mjs --q "<요청 문구>"`다. 질의에 카드 머리 표의 `부르는 이름`이 하나라도 들어 있으면 출력 맨 위에 `## Look card` 블록이 카드 경로와 읽는 명령을 요청에서 이름이 먼저 나온 순서로 내고, `부르지 않는 말`만 걸린 카드는 `## Look card candidates`로 낸다. 이름의 낱말이 질의에서 서로 붙어 있거나 사이에 한 낱말 이내일 때만 부른 것으로 치고(쉼표로 끊겨도 된다), 흩어져 있으면 후보로 내린다. 이름 바로 앞뒤에 부정 표현(`no`, `not`, `without`, `말고`, `없이`, `빼고`, `아닌`, `不要`, `なし`)이 있으면 그 이름은 카드를 부르지 않는다. 카드는 두 단계로 읽는다. `node scripts/read_look.mjs <slug> --outline`으로 갈래·세트·쌍을 정하고, `--branch <갈래> [--set S<n>] [--pair <n>]`로 그 갈래만 읽는다(카드 한 장이 30KB를 넘는다). 통째로 읽으려면 `node scripts/read_refs.mjs references/image/looks/<slug>.md`나 아래 표의 링크를 연다.

카드 한 장의 절 구성, 층별 줄을 쓰는 방식, 우선순위는 [image-brief.md](../image-brief.md) §4 '룩 카드'가 정본이다. 카드 안의 `끄는 고정 몫`은 [fixed-lines.md](../fixed-lines.md)의 슬롯 이름으로 적는다. 카드를 새로 쓰거나 고칠 때는 palette를 갈래·필름별 행으로 쓰고 예외 구절을 한 행에 합치지 않으며, Scene 줄은 건축·재료·배치만 말하고 빛은 Light 층이 말하게 하고, 세트 묶음에는 쓰는 값만 두고 Iris 원문 값은 `출처` 절에 두며, Optics의 본체 줄은 센서·포맷·렌즈 같은 사실만 말하고 연출(soft glow, warm cast)은 입자·톤 슬롯에 쓴다.

| slug | 이름 | 문화권 | 갈래 | 축 | 요약 |
|---|---|---|---|---|---|
| [wong-kar-wai](wong-kar-wai.md) | 王家卫 · 港风 | CN | A 重庆森林(기본); B 花样年华; C 堕落天使; D 阿飞正传 | 장면 | 텅스텐 시네마 네거티브의 홍콩 영화 스틸(A·C는 90년대, B·D는 60년대). 밤 네온, 붉은·호박 빛에 녹청 그림자 |
| [california-golden-hour](california-golden-hour.md) | 加州 골든아워 · California golden hour | US | A 태평양 역광(기본); B 사막 로드트립; C 도시·리조트 낙조; D 포트라 데이라이트 | 장면 | 포트라 필름의 캘리포니아 낙조 스냅. 낮은 해 역광, 꿀빛 금색과 바다 남색 그림자 |
| [forbidden-city-vermilion-gold](forbidden-city-vermilion-gold.md) | 故宫朱红暖金 · 宫廷历史胶片 | CN | A 朱红宫墙(기본); B 金顶落日; C 殿堂幽光; D 古柏古刹 | 장면 | 베이징 궁궐 앞 현대 인물 사진. 朱红 궁담과 금빛 기와, 따뜻한 시네마 톤 |
| [fujifilm-classic-neg](fujifilm-classic-neg.md) | 富士经典负片 · クラシックネガ | JP | A 街角クラシックネガ(기본); B 空気感ハイキー; C 夜の高感度; D リバーサルと白黒 | 매체 | 후지 필름으로 찍은 일본 일상 스냅. 청록 그림자와 낮춘 채도 |
| [iphone-native-selfie](iphone-native-selfie.md) | 아이폰 원본 셀카 · iPhone native selfie | KR | A 전면 셀카(기본); B 거울 셀카; C 초광각 스냅; D 어두운 곳 스냅 | 매체 | 아이폰 전·후면 카메라의 서울 일상 셀카·스냅. 정확한 폰 색, 창과 하늘이 부드럽게 날아감 |
| [japan-ccd-daylight](japan-ccd-daylight.md) | 日系CCD日光 · コンデジ | JP | A 商店街スナップ(기본); B 並木道の日差し; C 窓辺の光; D 西日と夕暮れ | 매체 | 소형 CCD 콤팩트의 일본 낮 스냅. 채도 높은 디지털 색, 하늘이 순백으로 날아감 |
| [japan-dv-dreamcore](japan-dv-dreamcore.md) | 古早DV梦核 · 低保真录像带 | JP | A ホームビデオ日常(기본); B テープ劣化; C インターレース広角; D ドリームコア光 | 매체 | MiniDV·VHS-C 캠코더 한 프레임. 번짐과 노이즈, 눌린 채도에 안개 낀 하이라이트 |
| [japan-provia-astia-film](japan-provia-astia-film.md) | 日系Provia·Astia · プロビア アスティア | JP | A 街角コンパクト(기본); B 大口径の木漏れ日; C 中判・窓辺の静けさ; D 湘南の海と光 | 매체 | 후지 슬라이드 필름과 고급 렌즈의 일본 낮 인물 사진. 맑고 정확한 자연색 |
| [jiangnan-misty-softfocus](jiangnan-misty-softfocus.md) | 江南烟雨柔焦 · 晨雾茶室漫射光 | CN | A 梅雨青砖(기본); B 晨雾漫散; C 黑柔水光; D 茶室微光 | 장면 | 비·안개·찻김에 하이라이트가 번지는 강남 인물 사진. 월백·청회색의 낮은 채도 |
| [kodak-gold-200](kodak-gold-200.md) | Kodak Gold 200 · 코닥 골드 200 | US | A Highway Daylight(기본); B Amber Open Country; C Main Street Interior; D Dusk Fairground | 매체 | Kodak Gold 200 소형 필름 카메라 스냅. 노랑·빨강 원색과 따뜻한 적갈색 그림자 |
| [kodak-portra-400-natural-light](kodak-portra-400-natural-light.md) | 柯达Portra 400 · Portra 400 portrait | US | A City Daylight Candid(기본); B Window Light Morning; C East Coast Autumn; D Medium Format Air | 매체 | 포트라 400의 자연광 인물 사진. 복숭아빛 피부와 크림·카멜의 따뜻하고 낮은 채도 |
| [korea-old-film-light-leak](korea-old-film-light-leak.md) | 폴라로이드 빛샘 · 필름 라이트 리크 | KR | A 서울 일상 필름(기본); B 폴라로이드·빛샘; C 빛바랜·번진; D 흑백·암실 | 매체 | 값싼 필름과 즉석사진 인화지의 서울 스냅. 빛샘, 바랜 꿀색, 노랗게 바랜 흰 테두리 |
| [museum-cold-light-minimal](museum-cold-light-minimal.md) | 当代美术馆冷光极简 · 美术馆冷光 | CN | A 冷光展厅(기본); B 纯黑白灰阶; C 暗厅孤光; D 棚拍净白 | 장면 | 미술관 건축광 아래 현대 중국 인물 사진. 순백과 콘크리트 회색, 차가운 천창 확산광 |
| [neo-chinese-ink](neo-chinese-ink.md) | 新中式水墨 · 水墨影调 | CN | A 水墨宣纸(기본); B 青绿竹影; C 焦墨黑白; D 素绢茶室 | 장면 | 중형 디지털의 수묵풍 중국 인물 사진. 먹 검정과 화선지 흰색, 흐린 확산광 |
| [new-york-overcast-cool-grey](new-york-overcast-cool-grey.md) | New York overcast cool grey · NYC cool grey | US | A Overcast Downtown(기본); B Black-and-White Street; C Wet Asphalt and Glass; D Bodega Night | 장면 | 흐린 뉴욕 거리의 다큐 스냅. 차가운 회색 계열, 직사광 없는 확산광 |
| [nouvelle-vague-16mm](nouvelle-vague-16mm.md) | Nouvelle Vague 16mm · 누벨바그 | FR | A Rive Gauche(기본); B Noir et Blanc; C Plein jour; D Gros plan | 장면 | 16mm 시네마 네거티브의 1960년대 파리 영화 스틸. 눌린 채도, 따뜻한 청회색 그림자 |
| [paris-soft-grey-diffuse](paris-soft-grey-diffuse.md) | Lumière grise de Paris · 파리 소프트 그레이 | FR | A Ciel couvert(기본); B Pierre blanche; C Après la pluie; D Ombre douce | 장면 | 35mm 컬러 네거티브의 흐린 파리 오후 스냅. 석회암 아이보리와 옅은 청회색, 방향 없는 확산광 |
| [rainy-night-shinjuku](rainy-night-shinjuku.md) | 雨夜新宿 · 東京ノワール | JP | A 歌舞伎町ネオンの路面(기본); B 渋谷と銀座の雨; C 高みと車窓の光跡; D 深夜の黒階調 | 장면 | 비 오는 밤 도쿄 네온 영화 스틸. 차가운 보라와 시안, 젖은 노면의 광택 검정 |
| [rolleiflex-glass-reflection](rolleiflex-glass-reflection.md) | Rolleiflex 유리 이중 반사 · 롤라이플렉스 | FR (파리) | A Reflet de vitrine(기본); B Heure bleue; C Miroirs de rue | 매체 | 롤라이플렉스 6x6 필름의 파리 유리창 이중 반사 스냅. 눌린 포트라 톤 |
| [seoul-cafe-warm-diffuse](seoul-cafe-warm-diffuse.md) | 서울 카페 웜톤 · 웜톤 확산광 | KR | A 카페·가게 오후(기본); B 창가·침실 자연광; C 램프·촛불 밤; D 해질녘·겨울 역광 | 장면 | 서울 카페와 집 안의 디지털 스냅. 창과 갓에 걸러진 따뜻한 확산광, 오트와 모카색 |
| [seoul-cool-porcelain](seoul-cool-porcelain.md) | 쿨톤 도자기 피부 · 블루 그레이 미니멀 | KR | A 창가 흐린 날(기본); B 갤러리 천창광; C 스튜디오 플랫 라이팅; D 야외 냉기 | 장면 | 서울 인물 사진. 흐린 날 확산광, 차가운 흰 하이라이트와 회청의 낮은 채도 |
| [seoul-night-cinema](seoul-night-cinema.md) | 서울 밤 시네마 · Seoul night cinema | KR | A 차창 불빛(기본); B 투톤 네온; C 가로등 불빛; D 냉백 야경 | 장면 | 서울 밤 영화 스틸. 시안 그림자, 마젠타·보라 네온, 후미등의 붉은 점 |
| [south-france-summer-overexposure](south-france-summer-overexposure.md) | 남프랑스 한여름 과노출 · Soleil du Midi | FR | A Côte d'Azur(기본); B Pierre et volets; C Champs et oliveraie; D Dernières lueurs | 장면 | 포트라 필름의 남프랑스 한여름 스냅. 노출을 넉넉히 줘 하이라이트가 흰색 쪽으로 밀리고 바다는 코발트 |
| [trix-humanist-bw](trix-humanist-bw.md) | Kodak Tri-X · 트라이엑스 | FR | A Le moment décisif(기본); B Nuit et pluie; C Demi-teintes; D Grain fin | 매체 | Tri-X 35mm 흑백 은염의 파리 거리 인문 사진. 순흑에서 순백까지 은회색 계조 |
| [utsurundesu-disposable](utsurundesu-disposable.md) | 写ルンです · 일회용 카메라 | JP | A 夜街ストロボ(기본); B 屋内ストロボ; C 昼のノンフラッシュと逆光; D 海辺と水中 | 매체 | 写ルンです 일회용 카메라 스냅. 정면 내장 플래시, 높은 채도, 배경이 검게 떨어짐 |
| [venice-beach-polaroid-light-leak](venice-beach-polaroid-light-leak.md) | Venice Beach Polaroid · Road-trip light leak | US | A Venice Beach Polaroid(기본); B Road-Trip Light Leak; C Toy Camera Dream; D Roadside Flash Snapshot | 매체 | 즉석 인화지와 낡은 필름의 캘리포니아 해변 스냅. 빛샘, 크림 노랑, 바랜 흰 테두리 |
| [vermeer-window-light](vermeer-window-light.md) | Vermeer · 베르메르 | FR | A Fenêtre de Vermeer(기본); B Lumière filtrée; C Clair-obscur argentique; D Heure bleue et flamme | 장면 | 창 하나의 빛으로 찍은 파리 35mm 필름 포트레이트. 유화 같은 깊은 그림자, 오커와 번트 엄버 |
| [y2k-ccd-flash](y2k-ccd-flash.md) | 千禧CCD直闪 · 밀레니엄 직부 플래시 | KR / CN / US | A 首尔CCD(기본); B 夜间硬闪; C 狗仔直闪 | 매체 | 정면 플래시 한 발의 밤 스냅(소형 CCD 등). 가까운 면은 차가운 흰색, 배경은 순흑 |

- `이름`은 카드 제목이다. 카드를 부르는 말 목록(`부르는 이름`·`부르지 않는 말`)은 각 카드의 머리 표에만 있고 검색기가 읽는다. `부르는 이름`에는 그 룩만 가리키는 말만 넣고, 도시 이름 하나(`홍콩`, `도쿄`)나 흔한 말은 `부르지 않는 말`에 적는다(홍콩 여행 스냅이 왕가위 카드로 읽히지 않게).
- `축`은 카드의 정체다. `매체`는 이름이 필름·카메라·인화지 같은 매체인 카드, `장면`은 장소·빛·시대·감독이 이름인 카드다. 카드 둘이 불리면 [image-brief.md](../image-brief.md) §4 '룩 카드' 7항으로 역할을 나눈다.
- 이 폴더의 카드는 Iris(MIT) 프리셋의 구성과 디테일을 층별로 옮긴 것이다. 고지 전문은 [LICENSE-Iris.md](LICENSE-Iris.md).

