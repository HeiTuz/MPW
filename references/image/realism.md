현실감 레이어 소관: 생성 결과가 "찍은 사진(real photograph)"처럼 읽히게 만드는 크로스엔진 규칙. 실사 서브레인 전용.

# 현실감(photorealism) 레이어 — 실사 크로스엔진 정본

우선순위: lanes.md §레인 게이트 카드 > compiler.md 철칙 > editorial-fashion.md > 이 파일.

이 파일은 gpt-image-2·Higgsfield·COMPOSITE·영상에서 이미지가 AI 티 없이 실사로 읽히게 하는 실패-처방·불완전성·게이트를 모은다. 기존 어휘는 **재정의하지 않고 참조만** 한다: 피부 토큰=compiler.md 철칙 7, 추상 무드어·장비·하중 토큰→시각 증거 환원=철칙 3·4·10, 사진 어휘 풀=editorial/photo-vocab.md §7, 소재 빛반응=editorial/scene-craft.md §9, 조명 레시피=editorial/scene-craft.md §10, 포즈 방향 규칙=editorial/scene-craft.md §8, 한국 리얼리티=editorial/tier2-safety.md §13, 배경합성=lanes.md §배경 합성 레인, 영상=lanes.md §영상 공통 규칙.

**발동 대상:** 실사 서브레인 — 인물·화보·제품·음식·라이프스타일 스틸·배경합성·실사 영상. 판정: categories.md photoreal 열. **면제:** 비실사(일러스트·타이포·아이콘 C9·만화 C10·인포그래픽 C6·카드뉴스 C7·덱 C12·타이포 아트).

**네거티브 정책:** 아래 현실감 처방은 원하는 화면 상태를 중심으로 쓴다. 네이티브 입력의 보존·배제 제약과 전용 필드 분기는 [surfaces.md](surfaces.md) §4를 따른다. 명시된 MPW 컴파일 형식의 Tier 정책은 [compiler.md](compiler.md) §2를 유지하며 모든 모델에 일반화하지 않는다.

## 1. 현실감 실패 모드 → 긍정형 처방

compiler.md 발전표(피부·조명·필름 3행)와 **상보** — 그 3행은 복제하지 않는다.

| 증상 | 근본 원인 | 긍정형 처방 토큰 | 엔진 메모 |
|---|---|---|---|
| 플라스틱 피부·과매끈 | 미화 형용사, 결 토큰 부재 | `natural skin texture, visible pores, fine vellus hair, subtle tonal variation, under-eye texture, unretouched`(정본 철칙 7) | 공통. Higgsfield는 `flawless/porcelain/glass skin` 회피 + 같은 결 토큰 병기 |
| 균일·무방향 조명 | 광원 방향·비율 미지정 | 단일 key 방향 1개(`soft light from camera left`) + `key:fill 2:1` + 그림자 거동(정본 editorial/photo-vocab.md §7.2·editorial/scene-craft.md §10) | 공통 |
| 물리 불가 그림자·반사·캐치라이트 | 그림자·반사·catchlight 방향이 광원과 불일치, 다중 그림자·부유 | 그림자·specular·catchlight 방향=key 1개로 고정, `contact/grounding shadow` 명시, 반사 내용=주변 지오메트리 일치 | 공통. 배경합성은 §4 |
| 과포화·HDR·글로시 AI 룩 | 채도·로컬 대비 과다, 광고식 과선명 | `muted/desaturated`(글로벌 −8~−12), `gentle highlight roll-off, lifted blacks`, 필름 룩 병기. 다큐 레지스터면 `raw photo, taken on a real camera, available light, unposed feel, mundane environment`로 낮춤(시네마틱 키아트 목적이면 유지) | gpt-image-2 HEX+켈빈 억제 / Higgsfield 저채도·필름 프리셋. 레지스터 토큰 개별 효능 (미검증) |
| 비현실적 완벽 대칭·정돈 | 대칭 얼굴·정중 구도·stock pose | `natural facial asymmetry, catchlights in both eyes, not perfectly identical`, off-center `rule of thirds`, `candid/unposed, in-between moment`, 한쪽에만 잔머리 | 텍스트·구조 레인은 긍정형 토큰 / Soul ID는 실사 학습이 대칭 완화 — 훈련이 담당(정본 lanes.md §인물·사실감 이미지 레인) |
| 배경 인물·소품 붕괴 | 배경 군중·텍스트 세밀 지정 | 배경 인물=`distant motion-blur silhouettes, no identifiable faces`, 소품 수 축소+거리 m, 간판=`abstract light shapes, no readable text`, 배경=`follows perspective, consistent vanishing point`(전부 긍정형 재서술) | 공통 |
| 렌즈 물리 부재 | 심도·왜곡·플레어·압축이 초점거리와 불일치 | 한 컷 한 렌즈 character 통일: 얕은 심도면 배경 일관 blur+보케, 광각이면 `mild edge stretch`, 망원이면 `compressed perspective, flattened planes`, 플레어·비네트는 광원 방향 일치(정본 editorial/photo-vocab.md §7.1) | 공통. 바디명 대신 결과·mm character(철칙 4, 세컨드 패스도 바디명 저신뢰로 수렴) |
| 재질 광택 획일화 | 모든 소재 같은 광택·micro texture 부재 | 소재별 빛 반응 차등(정본 editorial/scene-craft.md §9): 레더 hard highlight 단절 / 스웨이드 흡수 / 실크 흐르는 하이라이트 / 유리 `fingerprints, soft reflection` / 금속 `anisotropic highlights` | 공통. 제품·실내 컷에 특히 |
| 합성 광원·색온도·그레인·원근 불일치 | 피사체-배경 통합 미흡 | §4 배경합성 정합 참조 | COMPOSITE 전용 |
| 비현실적 질량·toy-like 설치물 | 신체 대비 스케일·수량 밀도·하중 기하학·중력·접촉 증명 부재 | **신체 스케일 락:** 높이·폭을 피사체 신체 기준 실측값으로 명시(예: 2.4~2.8m 높이, 1.8~2.2m 폭 무거운 베이스, 상단 테이퍼링). **수량 밀도:** 수백~수천 개 밀도로 명시, "몇 개 초대형 소품" 회피. **하중 지지 지오메트리:** 넓은 베이스, 상단 테이퍼링, 무게 중심이 피사체 아래. **중력·압축:** 하층 무게 압축, 중층 팽창·처짐, 상층 밀착+앉은 지점 흔적 보임. **접촉 증명:** 접지 그림자, 압력 흔적, 소재 변형, 간격, 사실적 더미 지오메트리. **지지 현실성:** 보이는 표면은 요청 소재 정합, 숨겨진 지지는 암시로 충분(명시 불요) | 인물·라이프스타일. Compact clause: `<소품>을 신체 정합으로 표현: 높이 <실측>, 폭 <실측> 무거운 베이스, 상단 테이퍼링. 수백~수천 개 실제 <아이템> 밀도, 초대형 소품 아님. 하층 압축, 중층 팽창·처짐, 상층 밀착+앉은 자리 흔적. 접지 그림자·압력·변형·간격 보이게. 보이는 표면은 <소재>, 숨겨진 지지 허용.` |

## 2. 불완전성 어휘 (의도된 불완전성)

필요한 표현만 고르는 선택 사전이다. **불완전성을 의무로 추가하지 않는다.** 특히 원본 상품에 없는 지문·마모·먼지·주름을 만들어 현실감을 보강하지 않는다. 한국 로컬리티 결합 어휘는 editorial/tier2-safety.md §13을 참조한다.

| 축 | 압축 토큰 | 정본 교차 |
|---|---|---|
| 피부 | `visible pores, fine vellus hair, subtle tonal variation, under-eye texture, slight redness at nose/ears` | 철칙 7 |
| 헤어 | `flyaway strands, 잔머리 몇 가닥, uneven parting` | editorial/tier2-safety.md §13 |
| 직물 | `natural creases, fold shadows, slight tension where a hand grips` | editorial/scene-craft.md §9 |
| 소품·생활감 | `lived-in props, slight wear, asymmetric placement, dust/fingerprints on surfaces` | editorial/tier2-safety.md §13 리얼리티 축 |
| 노출 | `minor exposure unevenness, slightly blown highlight, lifted black` | editorial/photo-vocab.md §7.4 |
| 광학·그레인 | `subtle film grain, gentle vignette, halation around bright edges, faint handheld tilt, natural optical softness` | editorial/photo-vocab.md §7.6 |
| 구도·비대칭 | `natural facial asymmetry, catchlights in both eyes, not perfectly identical, off-center framing, candid/unposed moment` | 이 파일 정본 |

| 레인 | 필요할 때 고를 표현 | 보존 우선 |
|---|---|---|
| 인물·화보 | 요청한 피부·헤어·직물의 질감 | 원본 얼굴·피부를 임의로 미화하거나 거칠게 만들지 않음 |
| 제품·음식 | 해당 소재의 빛 반응 | 상품의 상태·색·표면 정보 유지 |
| 라이프스타일 | 요청에 맞는 생활감·자연광 | 새 소품·오염을 자동으로 만들지 않음 |
| 배경합성 | 원본과 맞는 접지·그레인(§4) | 사용자 무그림자·무접촉 조건 우선 |

## 3. 현실감 게이트 (조건부)

실사 요청에서 **명시 조건이나 관측된 실패와 관련된 항목만** 확인한다. 이는 내부 검사이며 아래 목록을 프롬프트에 복사하라는 뜻이 아니다. 비실사 레인에는 적용하지 않는다. 영상은 §6을 추가로 본다.

- [ ] 요청한 조명·시점·재질이 서로 모순되지 않는가? 방향이 중요하면 뷰어 기준으로 구별한다.
- [ ] 원본 보존 요청에 새 피부·그레인·마모·색감이 추가되지 않았는가?
- [ ] 관련 실패를 교정할 때 그 축만 구체화했는가? 색 이름·부드러운 그림자 등으로 충분하면 켈빈·거리·광량비를 만들지 않는다.
- [ ] 참조 이미지·프리셋·실행 파라미터가 이미 전달한 조건을 반복하지 않았는가?

실사라는 이유만으로 촬영 슬롯이나 안티-AI 토큰의 최소 개수를 정하지 않는다. 선택한 전문 엔진의 실제 계약은 해당 엔진 문서를 따른다.

## 4. 배경합성 정합 — 5축 + 통합 증분

정본은 lanes.md §배경 합성 레인(항목 5~7: 재조명 다이얼·통합·판정) — 아래는 그 위 **증분**만(축+대표 토큰, 문장 나열 금지).

- **정합 확인 축:** 광원 방향 · 색온도 · 접지 그림자 · 그레인/노이즈 · 원근. 원본과의 관계로 지정하고, 실측값이 없으면 K·m 수치를 만들지 않는다. 그림자가 없는 상품 컷처럼 사용자 조건이 있으면 그 조건을 따른다.
- **엣지 통합:** `atmospheric edge blending`(halo·cutout 윤곽의 긍정형 대안), 피사체 샤프니스=배경 일치(`no pasted high-res subject`).
- **반사에 피사체 포함:** 유리·금속 반사가 피사체를 미세 포함, 방 지오메트리 따름.
- **바닥 재질 반응:** 접지부가 바닥에 눌림(카펫 압입·젖은 바닥), 접지 그림자가 바닥 결·거칠기 따름; 습식 반사는 피사체 바로 아래 수직·표면 거칠기로 흐림.

## 5. 엔진별 실사 레버 (검증 스탬프 주의 — AGENTS.md)

- **gpt-image-2:** 관측한 과포화·평면성 실패에 해당 색·빛 조건만 보강한다. 수치 추가만으로 품질이 오른다고 보장하지 않는다. 네거티브 정책은 compiler.md §2를 따른다.
- **인물·사실감 레인:** 프리셋이 실제로 전달한 조건은 반복하지 않는다. 프리셋별 세부 실사 메커니즘은 미검증이며 단정하지 않는다. 정본은 lanes.md §인물·사실감 이미지 레인이다.
- **COMPOSITE:** §4의 원본 정합과 재조명 다이얼을 확인한다. 연산 금지 계약은 lanes.md §배경 합성 레인을 따른다.

## 6. 영상 실사 증분

정본은 [lanes.md](lanes.md) §영상 공통 규칙이다. 아래는 실사 영상에 필요한 경우만 적용하는 증분이며, 스틸 §3도 키프레임의 실제 요구에 맞춰 적용한다.

- **시간 일관성:** 프레임 간 정체성·의상·텍스처·조명 유지; 조명은 피사체·카메라가 움직일 때만 이동.
- **모션 블러 물리성:** 블러 방향=이동 방향, 정지 배경은 카메라 무브 없으면 샤프.
- **카메라 관성:** `handheld micro-jitter, natural inertia`, 급격한 불가능 점프 없음; 모션은 물리 동사(lanes.md §영상 공통 규칙).
- **신체·접지 물리:** `weight shift before stepping, realistic foot contact, no sliding feet`; 배경 지오메트리 안정(벽·문틀 안 휘어짐).
- **실패 교정:** 깜박임·얼굴 변형·미끄러짐 등 실제 관측한 실패만 보강한다. 제약의 문법과 입력 위치는 [surfaces.md](surfaces.md) §4를 따른다.
- **엔진 메모:** Higgsfield 영상은 프리셋이 카메라 모션 흡수, Soul ID가 identity drift 완화(훈련). 프리셋·모션 세부 실사 효능 (미검증).
