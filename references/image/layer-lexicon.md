# 층별 토큰 사전

## 사용법

이미지 프롬프트의 층([image-brief.md](image-brief.md) §3)마다 쓸 수 있는 토큰과, 그 토큰이 화면에 만드는 모습이다.

- 열린 예시다. 이 가운데서 고르라는 목록이 아니고, 한 프롬프트에 몇 개를 넣으라는 할당도 없다. 장면에 맞는 것만 쓴다.
- 여기 없는 토큰도 그 문화권에서 그 뜻으로 실제로 쓰인다고 확실히 알면 쓸 수 있다. 뜻을 모르면 지어내지 않고 영어로 푼다.
- 토큰은 원어 표기 그대로 쓴다. 사용자가 한글 음차로 말하면(신중식, 코모레비) 이 표의 원어 표기(新中式, 木漏れ日)로 쓴다.
- "화면에 보이는 모습" 칸은 토큰 뒤에 이어 쓸 영어 문장의 바탕이다. 장면에 맞게 색·위치·수량을 바꿔 쓰고, 문장을 통째로 여러 프롬프트에 되풀이하지 않는다.
- "쓰는 자리" 칸은 어울리는 장면과 주의할 점이다. 영어권·프랑스권 룩은 영어 토큰으로 싣는다.
- 모델 아이덴티티가 있으면 Person 절의 토큰은 하나도 쓰지 않는다([image-brief.md](image-brief.md) §5-2).
- 브랜드·제품명(카메라, 필름, 패션, 소품)과 실존 인물 이름 가운데 룩을 가리키는 스타일 이름은 쓸 수 있다. 로고와 상표 글자는 화면에 그리지 않고, 실존 인물 이름을 얼굴·몸을 닮게 하는 용도로 쓰지 않는다.
- 넣지 않은 것: 교복·학생 연출처럼 미성년을 떠올리게 하는 차림과 자세, 성적 연출 어휘(신체 부위를 성적으로 강조하는 서술 포함), 일반 명사의 번역어.

출처: 공개 저장소 noahvisualsx/Iris b83de4c(MIT)의 한국·중국·일본·미국·프랑스편 트랙에서 실제로 쓰인 낱말과 8트랙 구조만 참고했다. 문장과 프리셋은 옮기지 않고 새로 썼으며, 생성 결과와 대조하지 않았다.

## Person

창조할 때 `## Person` 층에만 쓴다. 사용자가 그 외모를 원했거나 [image-brief.md](image-brief.md) §5-1 기본 인물에 맞을 때 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 冷白皮 | zh | Light skin with a cool, faintly pink undertone that stays even and pale under daylight. | 중국·한국 룩. 사용자가 원했을 때 |
| 骨相 | zh | A face shaped by clear brow-bone, cheekbone and jaw planes that catch directional light. | 측광·사광 인물 |
| 头小肩平 | zh | A small head over straight, level shoulders, so the neck and collarbones read long. | 전신·상반신 |
| 天鹅颈 | zh | A long upright neck with a clean line from the jaw to the collarbone. | 머리를 올린 인물 |
| 小顔 | ja | A small face in proportion to the head and shoulders, with a neat, narrow chin. | 일본 룩 |
| 奥二重 | ja | Eyelids with a narrow inner double fold that shows only as a thin crease near the outer corner. | 일본 룩. 사용자가 원했을 때 |
| freckles | en | A few pale tan freckles scattered across the bridge of the nose and the upper cheeks. | 프랑스 룩 기본 |
| sun-tanned skin | en | Warm golden-tan skin that is a shade deeper across the nose and shoulders. | 미국 룩 기본 |

## Optics

매체와 카메라가 만드는 모습이다. 장면 속 광원은 Light 절. 이 층은 한국어 토큰이 드물어 중국어·일본어·영어 토큰이 중심이다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 千禧CCD直闪 | zh | A 2000s compact digital camera fires its built-in flash straight at the subject, giving flat bright skin, small hot spots on the forehead and nose, a short dark shadow right behind and slightly cool, saturated color. | 밤 실내, 거울 셀피, 파티 스냅 |
| 机顶直闪 | zh | An on-camera flash from straight in front flattens the face into even bright light and drops the background to near black. | 밤 거리, 클럽, 실내 스냅 |
| ストロボ直焚き | ja | A bare strobe fired head-on turns the face into a bright pale oval with a crisp small shadow on the wall behind. | 일본 스트리트 스냅 |
| ノンフラッシュ | ja | Only ambient daylight lights the scene, so the skin has low contrast, gentle warm highlights and a softly washed background. | 낮 실내, 창가 |
| 漏光 | zh | An orange-red streak of light bleeds in from one edge of the frame and fades into the shadows. | 필름 스냅. 한 장에 한 줄기 |
| 胶片绿 | zh | Shadows lean cyan-green while highlights stay slightly warm, at calm, lowered saturation. | 필름 일상 |
| 港风 | zh | Warm red and amber color with green fluorescent spill in the shadows, like a 1990s Hong Kong film still. | 밤 골목, 복고 실내 |
| 水墨影调 | zh | Low-contrast gray-green tones with soft gradients and a matte, paper-like flatness across skin and background. | 新中式, 정원, 차실 |
| 雨过天青 | zh | A very desaturated pale cyan-gray cast over the whole frame, with a soft porcelain sheen on the highlights. | 新中式, 흐린 날 |
| 柔焦漫射 | zh | A gentle soft-focus diffusion puts a faint halo around the highlights while the face stays clear. | 낭만적 인물, 창가 |
| 抽帧 | zh | The face stays sharp while the lights and passers-by behind it smear into streaks, as with a slow shutter. | 밤 거리, 지하철 |
| 梦核 | zh | Hazy bloom, soft edges and washed pastel color make the frame look like a half-remembered home video. | 꿈 같은 일상 |
| レンズ収差 | ja | The frame edges stretch slightly and show faint purple-green fringing around bright windows, while the center stays sharp. | 역광 실내 |
| 減光 | ja | The corners fall off into soft darkness and pull the eye toward the lit center. | 필름 인물 |
| 動体ブレ | ja | A moving figure keeps one sharp flash-lit edge while the legs and coat trail into a faint horizontal blur. | 밤의 걷는 인물 |
| halation | en | A thin warm red-orange glow wraps around the brightest highlights and backlit hair edges. | 필름 역광 |
| bloom | en | Highlights spill softly past their edges, so skin and white fabric glow with a milky halo. | 꿈 같은 낮 장면 |
| lens flare | en | A faint arc of red, green and violet light enters from the frame edge where strong backlight hits the lens. | 해 질 녘 역광 |
| disposable camera look | en | A plastic lens softens the edges, color runs warm and the flash-lit subject sits in faintly darkened corners. | 여행·파티 스냅 |
| push processing | en | Contrast rises, color turns a little richer than the scene and the shadows carry dense, fine grain. | 밤·흐린 날 필름 |

## Pose

체중이 실린 곳과 손이 닿는 곳이 함께 보이게 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 짝다리 | ko | Weight sits on one leg while the other knee bends and the foot turns out, tilting the hips into a relaxed S-line. | 서 있는 전신 |
| 꽃받침 | ko | Both hands open under the chin like the petals of a flower, framing a smiling face. | 셀피, 친구 스냅 |
| 턱 괴기 | ko | One elbow rests on a table and the palm cradles the jaw, the head tilting into the hand. | 카페, 창가 |
| 손하트 | ko | The thumb and index finger cross at the tips to make a small heart held near the cheek. | 셀피, 친구 스냅 |
| 回眸 | zh | The back or shoulder turns to the camera while the head swings back over one shoulder, showing part of the cheek and one eye. | 걷는 장면, 계단 |
| 侧颜 | zh | The head turns into full profile, the forehead, nose and jaw drawn as one clean silhouette against a plain background. | 측광 인물 |
| 凭栏 | zh | She leans forward with both forearms on a stone or wooden railing, a distant view opening behind her. | 정원, 다리, 옥상 |
| 微扬下颌 | zh | The chin rises about ten degrees, stretching the neck so a side light cuts along the jaw. | 당당한 인물 |
| 撑伞 | zh | One hand holds an umbrella shaft at shoulder height, and the canopy throws a soft disc of shade over the head. | 비 오는 거리, 정원 |
| 盘腿坐 | zh | She sits cross-legged on a bed or mat, knees open and hands resting loosely in the lap. | 실내 일상 |
| ひょっこり | ja | Half the face peeks out past a door frame or wall edge, one eye visible and the shoulder cut off by the edge. | 장난스러운 스냅 |
| 片脚引き | ja | Weight rests on the front leg while the back leg trails with only the toe touching down, making a long diagonal from hip to ankle. | 전신 패션 |
| もたれ立ち | ja | The shoulders and back settle against a wall or shutter, one hand in a pocket and the torso in a loose curve. | 골목, 셔터 앞 |
| しゃがみ込み | ja | Knees bend deeply with the forearms resting on the thighs, seen from low so the shoes and curb fill the foreground. | 스트리트 |
| mid-stride | en | One heel lifts behind as the front foot plants, the arms swing and the coat hem trails the motion. | 횡단보도, 거리 |
| hands in coat pockets | en | Both hands sink into the coat pockets, shoulders slightly raised, standing square to the lens. | 겨울 거리 |
| hem spin | en | A coat or skirt flares out in a circle as she stops mid-turn and glances at the lens. | 패션 동세 |

## Outfit

원단이 빛에 반응하는 모습까지 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 원마일웨어 | ko | A heavy cotton loopback hoodie and jogger set in heather gray, soft and slightly slouchy at the cuffs. | 동네 외출 |
| 올블랙 | ko | Head-to-toe matte black pieces with sharp, plain tailoring, the only variation coming from each fabric's sheen. | 도시 미니멀 |
| 노카라 자켓 | ko | A collarless jacket with a clean round neckline and no lapels, cut close at the shoulders. | 출근룩 |
| 셋업 | ko | A matching top and trousers cut from the same fabric, so color and weave run unbroken from collar to hem. | 출근룩, 린넨 여름 |
| 고프코어 | ko | A stiff waterproof shell with taped seams and zip pockets worn over city clothes, its nylon catching flat highlights. | 아웃도어 도시룩 |
| 新中式 | zh | A modern Chinese-inspired garment with a straight, clean cut, a stand collar and small knot buttons, in heavy matte fabric. | 차실, 정원, 미술관 |
| 改良旗袍 | zh | A fitted silk dress with a stand collar and a modern hem that falls in one long smooth line. | 복고 실내, 정원 |
| 盘扣 | zh | Small knot buttons of twisted fabric cord fasten the neck opening and the front closure. | 新中式 세부 |
| 立领 | zh | A crisp upright band collar standing close around the neck. | 新中式 세부 |
| 斜襟 | zh | The front panel crosses diagonally from the collar down to the underarm and fastens at the side. | 新中式 세부 |
| 马面裙 | zh | A long skirt with flat panels at the front and back and fine pleats at the sides that open as she walks. | 정원, 명절 |
| 香云纱 | zh | A black silk with a faintly crinkled, slightly rubbery surface and a dark brown sheen at the folds. | 여름 新中式 |
| 云锦 | zh | A heavy brocade woven with swirling cloud shapes in shimmering gold thread on a dark ground. | 격식 있는 장면 |
| スカジャン | ja | A glossy satin bomber with dense embroidered tigers or flowers across the back and ribbed cuffs, catching sharp highlights along its folds. | 스트리트 |
| 藍染め | ja | Deep indigo cotton with uneven dye depth, pale resist patterns and slightly faded seams. | 일본 전통·수공 |
| 浴衣 | ja | A light cotton summer kimono in a bold seasonal print, wrapped and tied with a crisp obi bow at the back. | 여름 축제, 강가 |
| 甚平 | ja | A loose ramie top with side ties and short wide trousers in a dry, airy, slightly crinkled weave. | 여름 집 앞, 툇마루 |
| 再構築 | ja | A jacket rebuilt from mismatched panels, with raw frayed seams and stitching running in unexpected directions. | 실험적 패션 |
| quiet luxury | en | Plain cashmere, fine wool and clean tailoring in cream, camel and gray, with soft drape and no visible logos. | 고급스러운 도시룩 |
| relaxed tailoring | en | A drop-shoulder blazer and loose trousers fall in soft folds, sleeves pushed up and the line slightly slouched. | 출근룩, 갤러리 |
| selvedge denim | en | Heavy dark indigo denim with a red-edged seam showing on the rolled cuff and stiff, defined creases. | 아메리칸 캐주얼 |
| biker jacket | en | A scuffed black leather motorcycle jacket with metal zips and creased sleeves over a plain white tank. | 밤 거리 |

## Legwear

비침, 광택, 솔기, 무늬가 빛에 보이는 모습으로 쓴다. 다리가 화면에 있을 때만 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 검스 | ko | Sheer black stockings that let pale skin show through over the shins and knees and darken where the fabric is seen at an angle. | 겨울·가을 치마룩 |
| 살스 | ko | Near-invisible nude stockings that even the skin tone like a light veil and leave only a faint sheen on the shin. | 출근룩, 샌들 |
| 백심 스타킹 | ko | A thin dark seam runs straight up the back of each calf on sheer black nylon. | 복고 패션 |
| 발레코어 화이트 타이즈 | ko | Matte semi-opaque white tights with a soft, slightly chalky surface. | 발레코어 룩 |
| 5D 蝉翼 | zh | Hosiery so thin it nearly disappears, leaving only a faint satin sheen on the skin. | 여름 샌들 |
| 水光 | zh | A soft wet-looking gloss runs along the shin and catches window light in one long thin band. | 화보 |
| 暗金织线 | zh | A hairline of dark gold thread stays dull in soft light and flashes only when a side light sweeps across it. | 新中式 패션 |
| 10デニール | ja | An almost invisible film over the skin, with a faint sheen on the shin ridge and a slight tan tint where the fabric doubles at the ankle. | 일본 출근룩 |
| シアー | ja | Translucent knit lets the skin glow through at the knee while the sides of the calf deepen into a soft gradient. | 봄·가을 |
| マット | ja | An opaque, light-absorbing dark surface with almost no reflection and an even, velvet-like density. | 겨울 |
| リブ | ja | Fine vertical ribs run along the leg and catch tiny stripes of light. | 니트 타이츠 |
| opaque tights | en | Dense black tights with a smooth matte surface that hide the skin tone completely. | 겨울 |
| Swiss dot | en | Small round dots sit evenly on a light see-through ground like a fine curtain over the skin. | 봄 원피스 |
| ribbed crew socks | en | Thick vertical ribs bunch softly at the ankle above sneakers in clean white cotton. | 캐주얼 |

## Style

룩의 계열과 전체 팔레트다. 옷 하나하나는 Outfit, 장소는 Scene에 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 꾸안꾸 | ko | The look reads as put together without effort: neutral colors, clean lines, plain unbranded pieces and nothing that looks newly bought. | 한국 일상 패션 |
| 한남동 룩 | ko | Quiet, expensive layers in oat, ivory and tan, rich in texture but plain in shape. | 서울 고급 일상 |
| 걸크러쉬 | ko | A strong, confident look built on black leather, hard directional light and a level, unsmiling gaze. | 바이크, 밤 거리 |
| 인생네컷 | ko | A narrow vertical strip of four frames shot with flat direct flash in front of a plain colored backdrop. | 친구 스냅, 커플 |
| 新中式静奢 | zh | A restrained palette of black, ivory and jade, heavy matte fabrics and almost no ornament. | 新中式 화보 |
| 清冷 | zh | A cool, still mood with pale light, a composed face and no warm color cast. | 차분한 인물 |
| 大女主 | zh | A commanding presence: square shoulders, a level gaze held on the lens and nothing playful in the posture. | 리더·커리어 화보 |
| 国潮 | zh | Traditional motifs such as gold-woven patterns placed on modern streetwear cuts. | 거리 패션 |
| 海派 | zh | Art-deco details, fitted qipao cuts and wave-set hair against old brick and iron balconies. | 복고 상하이풍 |
| 禅意 | zh | Bare wood, raked gravel or still water with a single object and wide empty space around it. | 차실, 정원 |
| 塩系 | ja | A pale, muted palette with dry matte textures, minimal accessories and a cool, restrained attitude. | 일본 미니멀 |
| 古着 | ja | Faded cotton, softened collars and uneven wash marks mixed across layers with a lived-in, slightly crumpled finish. | 빈티지 거리 |
| 裏原宿 | ja | Graphic tees, deconstructed jackets and chunky boots mixed against narrow back-alley walls. | 도쿄 스트리트 |
| 和モダン | ja | Traditional Japanese silhouettes such as a haori-cut jacket paired with crisp modern tailoring. | 일본 전통·현대 |
| きれいめ | ja | Clean tailoring, a neutral palette and sharp creases in a polished, quiet commuter look. | 출근룩 |
| 抜け感 | ja | A deliberately loose look: an oversized shirt slipping off one shoulder, sleeves pushed up, nothing pulled tight. | 주말 일상 |
| Old Money | en | Cream knits, navy blazers and tweed in muted colors against dark wood and polished brass. | 클럽, 저택 |
| Clean Girl | en | Hair slicked tight, skin that looks lit from within, small gold hoops and neutral basics in bright morning light. | 아침 일상 |
| Downtown | en | Worn leather, slim denim and small shoulder bags in black and gray on a cobblestone city block. | 뉴욕풍 거리 |
| Coastal Minimalist | en | Pale linen, sand and white with sea-bleached wood and bright salt-air daylight. | 해변 |
| Parisian effortless | en | Tousled hair, a plain top and denim with one small accessory, as if nothing was adjusted before the shutter. | 파리풍 일상 |
| Y2K | en | Low-rise shapes, shiny silver and pastel gloss, tiny bags and rhinestone accents under flash. | 플래시 파티 |

## Hair and makeup

커트·질감·색과 화장 결과다. 피부 마감은 이 층 한 곳에만 쓴다. 모델 아이덴티티가 있으면 화장으로 만든 모습만 쓰고 타고난 생김새는 쓰지 않는다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 시스루뱅 | ko | A thin fringe of separated strands falls just above the brows, and the forehead shows between them. | 한국 일상 인물 |
| 잔머리 | ko | Fine short wisps curl along the hairline and temples and catch backlight as thin soft threads. | 역광 인물 |
| 히피펌 | ko | Tight small curls with puffy mid-length volume and a slightly frizzy, retro texture. | 캐주얼 |
| 여신 웨이브 | ko | Large smooth S-shaped waves with volume at the crown and a glossy finish past the shoulders. | 화보, 하객룩 |
| 집게핀 로우번 | ko | A loose low bun held by a claw clip, with a few strands falling free around the neck. | 집·카페 일상 |
| 촉촉피부 | ko | A thin dewy base leaves a soft sheen on the cheekbones and nose bridge while fine skin texture still shows through. | 자연광 인물 |
| 속광 | ko | The skin glows softly from within with a smooth satin sheen and no hard shine spots. | 뷰티 |
| 애교살 | ko | A pale pearl highlight along the lower lash line makes the area under the eyes look softly full. | 뷰티. 아이덴티티가 있으면 하이라이트 화장으로만 |
| 탕후루 립 | ko | A glassy translucent red-pink gloss with one tight bright highlight across the center of the lips. | 뷰티 클로즈업 |
| 딸기우유 블러셔 | ko | A diffuse milky-pink blush spreads over the cheeks and nose bridge with no defined edge. | 봄 인물 |
| 低发髻 | zh | Hair combed smoothly back and coiled into a small flat bun low at the nape, leaving the face and neck bare. | 新中式 |
| 港风大波浪 | zh | Voluminous glossy curls swept to one side in even S-shaped waves. | 港风 |
| 水波纹 | zh | Smooth rows of flat finger waves set close to the head with a high lacquered shine. | 海派 |
| 平直眉 | zh | Brows filled in along a level, straight line with a slightly longer tail in soft gray-brown. | 新中式, 清冷 |
| 半哑光 | zh | A semi-matte base with a faint satin glow only on the cheekbones and the bridge of the nose. | 新中式, 출근룩 |
| 豆沙唇 | zh | A dusty, muted rose-brown lip with a soft powdery finish. | 차분한 인물 |
| 朱唇 | zh | A velvet matte brick-leaning red lip with a sharply defined bow. | 港风, 海派 |
| 濡れ髪 | ja | Strands clump into glossy ribbons with a damp sheen, each section catching a fine highlight line. | 일본 화보 |
| 切りっぱなしボブ | ja | A blunt bob cut straight at the jaw with a crisp, heavy bottom edge. | 일본 일상 |
| ウルフカット | ja | Short choppy layers on top flowing into longer wispy ends at the nape. | 스트리트 |
| 透明感 | ja | A sheer, clear-looking base with cool undertones and light, barely-there color on the lids and lips. | 일본 뷰티 |
| 血色感チーク | ja | A soft warm flush floats over the cheekbones and fades into bare skin without visible edges. | 일본 뷰티 |
| ノーメイク風 | ja | A thin sheer base lets small freckles and texture show, with a balmy nude lip. | 자연광 일상 |
| glass lip | en | Clear high-shine gloss over a sheer tint forms one sharp highlight on the lower lip and a thin bright line along the upper lip. | 뷰티 클로즈업 |
| curtain bangs | en | Bangs part at the center and sweep outward across the cheekbones in a soft arc. | 프랑스·미국 룩 |

## Expression

시선이 닿는 곳과 눈꺼풀·입꼬리의 정도로 쓴다. 눈빛 반사(캐치라이트)는 Light 절.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 눈웃음 | ko | The eyes curve into soft crescents as the cheeks lift, while the mouth smiles only lightly. | 친근한 인물 |
| 멍때리기 | ko | An unfocused gaze drifts past the lens and the face goes slack, as if lost in thought. | 창가, 지하철 |
| 웃참 | ko | Lips pressed together and cheeks tight while the eyes crinkle, giving away a held-back laugh. | 친구 스냅 |
| 눈썹 까딱 | ko | One brow lifts slightly and the head tilts a touch, giving a measuring, unimpressed look. | 장난스러운 인물 |
| 似笑非笑 | zh | The corners of the lips lift barely a millimeter while the eyes stay calm, so it is unclear whether she is smiling. | 新中式, 清冷 |
| 垂眸 | zh | Lowered eyelids aim the gaze at the floor or a cup, and the lashes cast a thin shadow on the cheeks. | 차실, 독서 |
| 睥睨 | zh | The chin lifts and the gaze angles down along the nose toward the camera. | 大女主 |
| 若即若离 | zh | A soft glance slides away from the lens at the last moment, leaving the mouth relaxed. | 화보 |
| 从容 | zh | A relaxed jaw, slow-blinking eyes and an even, unhurried gaze. | 격식 있는 인물 |
| 蓄泪 | zh | A glassy line of water rests on the lower lids with slightly reddened rims, no tear falling. | 감정 인물 |
| 伏し目 | ja | The lids lower halfway and the gaze rests on something below the frame. | 일본 화보 |
| 流し目 | ja | The head faces the lens while only the eyes slide toward the corner. | 일본 화보 |
| 照れ笑い | ja | Lips press into a small curve, the cheeks flush and the eyes slip slightly away from the camera. | 일상 스냅 |
| 潤んだ瞳 | ja | A thin glossy rim of moisture along the lower lids catches window light, with slightly reddened corners. | 감정 인물 |
| アンニュイ | ja | Heavy lids, relaxed brows and a slightly parted mouth create a quiet, drifting stare. | 나른한 오후 |
| 問いかける眼差し | ja | The head tilts a few degrees, brows lifted slightly, eyes steady on the viewer as if waiting for an answer. | 화보 |
| Duchenne smile | en | The cheeks lift, small creases fan out from the outer eyes and the teeth show in a wide, genuine grin. | 미국 룩, 친구 |
| smirk | en | One corner of the mouth pulls up into a small crooked grin while the other side stays still. | 쿨한 인물 |
| deadpan | en | A completely still face with no muscle tension, eyes level on the lens. | 패션 화보 |
| sun-dazzled squint | en | The eyes narrow against bright sun, lashes lit gold and a small crease along the nose. | 해변, 한낮 |
| candid surprise | en | The brows jump, the eyes widen and the mouth opens slightly in an unposed reaction. | 스냅 |

## Props and nails

손에 든 것과 손톱이다. 손이 화면에 있을 때만 네일을 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 아아 | ko | An iced americano in a clear plastic cup: dark coffee, faceted ice and fine beads of condensation on the outside. | 한국 카페 일상 |
| 시럽 네일 | ko | Almond nails in a translucent blush jelly that shows the nail bed, topped with a thick high-gloss dome. | 한국 일상 |
| 자석네일 | ko | A bright band of light slides across a deep-toned nail and shifts as the finger turns. | 밤, 실내 |
| 미러 네일 | ko | Silver chrome nails with a mirror finish that reflect the room in curved streaks. | 파티, Y2K |
| 冰种翡翠 | zh | A translucent pale-to-deep green stone with a glassy, slightly foggy inner glow. | 新中式 |
| 平安扣 | zh | A flat jade disc with a round hole in the center, hanging from a thin cord. | 新中式 |
| 步摇 | zh | A hairpin with thin dangling strands of silver and beads that sway and flash as she moves. | 전통 머리 |
| 团扇 | zh | A round silk fan on a thin handle with a delicate embroidered flower. | 정원, 新中式 |
| 折扇 | zh | A folding fan with dark wooden ribs and a paper face with thin ink strokes, held half open. | 문인풍 |
| 紫砂 | zh | A small unglazed reddish-brown clay teapot with a fine, dry, sandy-looking surface. | 차실 |
| 建盏 | zh | A dark brown tea bowl whose inner glaze shows fine hair-like streaks that flash blue in the light. | 차실 |
| 冰透 | zh | A sheer nude-pink gloss over the nail that lets the natural nail show through. | 新中式, 자연스러운 손 |
| 车厘子红 | zh | A deep wine-red nail color with a glossy, translucent jelly depth. | 가을·겨울 |
| ラムネ瓶 | ja | An aqua-green glass soda bottle with a glass marble trapped in its neck and condensation on the surface. | 일본 여름 |
| 線香花火 | ja | Tiny orange sparks branch off a glowing bead at the tip of a thin paper stick, lighting the fingertips from below. | 일본 여름밤 |
| 風鈴 | ja | A thin glass wind bell with a painted pattern hangs on a short paper strip, catching a bright highlight. | 툇마루, 여름 |
| ビニール傘 | ja | A clear plastic umbrella covered in raindrops refracts the colored lights above the face. | 비 오는 밤 |
| べっ甲 | ja | Amber and brown translucent marbling swirls under a clear gloss, with the depth of polished shell. | 네일, 안경테, 집게핀 |
| ちゅるんネイル | ja | A thick clear jelly layer gives each nail a rounded, plump highlight and a slippery wet glow. | 일본 뷰티 |
| ミルキーグラデーション | ja | Creamy white fades into faint pink toward the tip with a pearly sheen and no hard edge. | 일본 뷰티 |
| French manicure | en | A sheer pink base with a thin white line across the tip of a short nail. | 프랑스 룩 |
| instant camera | en | A boxy pastel camera ejects a white-framed photo that is still pale and developing. | 여행·파티 |
| canvas tote | en | A thick natural cotton bag with sturdy handles that sags with what is inside. | 장보기, 일상 |

## Scene

장소와 그 표면 재료다. 장소 이름 토큰 뒤에는 그 장소가 화면에 보이는 재료와 물건을 쓴다.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 성수동 | ko | Old red-brick factories turned into cafés, with weathered brick, patched gray mortar and black steel-framed glass doors. | 서울 스트리트 |
| 삼청동 | ko | Worn stone steps and low tiled rooftops in soft afternoon light with muted earth tones. | 한옥 골목 |
| 익선동 한옥카페 | ko | Dark timber beams and paper-lit windows around a small courtyard in warm low light. | 한옥 카페 |
| 서울숲 은행나무길 | ko | A path under a yellow ginkgo canopy with fallen gold leaves on the ground. | 가을 산책 |
| 한강 억새 | ko | Tall golden reeds along a wide river, their feathery tips glowing when backlit by a low sun. | 가을 노을 |
| 지하철 2호선 | ko | A cool white metal subway carriage with steel handrails and even overhead light. | 서울 출퇴근 |
| 园林 | zh | A classical garden with winding stone paths, rock mounds, small ponds and white walls with dark tile caps. | 新中式 |
| 水榭 | zh | An open wooden pavilion on stilts over still water, its roof and columns doubled in the reflection. | 정원 |
| 漏窗 | zh | A wall opening filled with a patterned stone lattice that breaks the light into small shapes. | 정원, 차실 |
| 月亮门 | zh | A circular doorway cut through a white wall, framing bamboo beyond it. | 정원 프레이밍 |
| 青砖黛瓦 | zh | Gray-blue brick walls and dark curved roof tiles, glossy after rain. | 강남 수향, 골목 |
| 四合院 | zh | A square courtyard house with a red lacquered gate and low gray roofs around an open yard. | 베이징 |
| 红墙 | zh | A long flat wall of deep red plaster under a yellow tiled roof. | 베이징, 궁궐 |
| 唐楼 | zh | A narrow old apartment block with green iron grilles, wet asphalt and dim lamp light. | 홍콩 밤 |
| 茶寮 | zh | A small wood-paneled tearoom with a low table, a clay kettle and a paper screen glowing with daylight. | 新中式 |
| 縁側 | ja | A long, narrow wooden veranda along the outside of a house, boards worn smooth, opening onto a small garden. | 일본 시골집 |
| 和室 | ja | Woven tatami mats, paper screens glowing with diffused light and low furniture. | 일본 실내 |
| 竹林 | ja | Tall green bamboo stalks rising into a hazy canopy, with striped light on a mossy path. | 교토 |
| 町屋 | ja | A narrow wooden townhouse front with fine lattice windows along a quiet stone-paved lane. | 교토 골목 |
| 路地 | ja | A narrow lane between low buildings with potted plants and bundled cables overhead. | 일본 골목 |
| ガード下 | ja | A low arched space under a railway viaduct with red paper lanterns and drifting steam from a food counter. | 도쿄 밤 |
| 枯山水 | ja | Raked pale gravel in clean parallel lines around a few mossy rocks. | 선 정원 |
| brick loft | en | Exposed red brick, black steel windows and concrete floors lit by tall bare windows. | 뉴욕풍 실내 |
| Parisian café terrace | en | Rattan chairs and small round zinc tables along a sidewalk under cool gray daylight. | 파리풍 |
| Haussmann facade | en | Cream limestone fronts with wrought-iron balconies and tall shuttered windows. | 파리 거리 |

## Light

장면 속 광원의 방향과 그 빛이 표면에 만드는 결과다. 매체가 만드는 빛은 Optics 절.

| 토큰 | 언어 | 화면에 보이는 모습 | 쓰는 자리 |
|---|---|---|---|
| 윤슬 | ko | Low sun breaks into countless small bright glints dancing on the surface of the water. | 강·바다 |
| 노을 역광 | ko | The setting sun sits low behind the subject and traces the hair and shoulders with a warm amber outline. | 해 질 녘 |
| 丁达尔 | zh | Thin diagonal beams of light show through smoke, mist or haze in the air. | 숲, 차실의 김 |
| 逆光发丝金边 | zh | Backlight rims each loose strand of hair in thin gold while the face stays softly underexposed. | 역광 인물 |
| 百叶窗光 | zh | Parallel bars of warm sunlight from window blinds cross the face and the wall, with soft dark bands between. | 실내 오후 |
| 漏窗光影 | zh | Sun through a carved lattice window lays a pattern of small geometric shapes across a face, shoulder and table. | 新中式 |
| 阴天漫射 | zh | Overcast sky light wraps the face evenly, leaving cool, even skin and almost no cast shadow. | 흐린 날 |
| 眩光 | zh | Neon tubes glow with halos that bleed into the surrounding dark. | 밤 간판 |
| 雨后沥青倒影 | zh | Wet black asphalt mirrors the streetlights as long streaks and points of gold. | 비 갠 밤 |
| 木漏れ日 | ja | Sun filtering through leaves lands as coin-sized bright spots on surfaces, with cool green-tinted shade between them. | 숲, 툇마루, 공원 |
| 霧雨 | ja | Fine misty rain hangs in the lamplight, softening edges and leaving tiny droplets on hair and shoulders. | 비 오는 밤 |
| ネオンリフレクション | ja | Violet and magenta signs stretch into long wet streaks across dark asphalt and rim the skin with colored light. | 도쿄 밤 |
| マジックアワー | ja | Just after sunset the sky turns soft pink and blue and lights the face evenly with no hard shadow. | 해 진 직후 |
| golden hour | en | Low warm sun from one side throws long shadows and turns skin and fabric honey-gold. | 야외 |
| blue hour | en | A deep cobalt sky after sunset, with warm window light as a small contrast on the face. | 해 진 뒤 거리 |
| window light | en | Soft daylight from a window at one side lights the near cheek and shoulder and fades slowly across the face. | 실내 인물 |
| catchlight | en | A small crisp reflection of the main light sits in each pupil and makes the eyes look wet and alive. | 인물. 광원 모양을 함께 쓴다 |
| fluorescent cast | en | Overhead fluorescent tubes give the skin a faint green-cyan tint and flat, even shadows. | 지하철, 편의점, 사무실 |
