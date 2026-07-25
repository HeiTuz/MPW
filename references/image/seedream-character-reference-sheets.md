# Seedream 캐릭터 베이스·턴어라운드 어댑터

## 적용 조건

기존 3×3 얼굴 각도 시트를 identity reference로 사용해 Seedream 계열에서 단일 캐릭터 베이스 사진 또는 1×4 전신 턴어라운드를 만들 때 적용한다. 버전별 기능은 추정하지 않고 UI에서 실제 제공되는 비율·레퍼런스 입력만 쓴다.

## 지시 순서

Seedream용 프롬프트는 다음 우선순위를 유지한다.

1. 산출물·레이아웃: single photograph 또는 single 3:4 canvas containing a 1×4 row.
2. 실제 프레이밍: `top of hair to mid-thigh` 또는 `hair to soles`.
3. 체형 기하: 추상적인 curvy 라벨만 쓰지 말고 `slender lean body, narrow shoulders, slim arms, small waist, broad pelvis, rounded high hips, full glutes, curved upper thighs`처럼 실루엣을 적는다. `lean and visibly defined`는 큰 근육이 아니라 낮은 체지방에서 오는 선명도로 풀어 쓴다.
4. 베이스 의상: 몸을 압축하거나 가리지 않는 fitted sports-bra top + fitted short shorts. 사용자가 흰색을 지정하면 `pure white matte stretch fabric`과 `no off-white or gray color shift`를 함께 고정한다.
5. 정체성·헤어: 3×3 시트를 sole identity reference로 선언하고 식별점만 짧게 쓴다.
6. 촬영: eye-level, 70–85 mm look, minimal perspective distortion, neutral studio.
7. 마지막에 identity, body silhouette, outfit, framing 우선순위를 재고정한다.

## 구도 충돌

- `beauty upper-body shot`은 얼굴 중심 크롭을 유도해 골반과 쇼츠가 잘릴 수 있다. 골반까지 필요한 단일 베이스는 `three-quarter character base portrait, top of hair to mid-thigh`로 쓴다.
- `170 cm, eight heads tall`은 전신이 보일 때만 판정 가능하다. 미드타이 크롭에서는 전체 키를 보장한다고 쓰지 않는다.
- 1×4 전신 시트는 `front / three-quarter / profile / back` 순서와 동일 baseline·scale·camera height를 고정한다.
- 큰 골반은 `hips visibly wider than shoulders from every angle`과 `strong smooth S-curve from waist to hips`를 함께 써야 직선 체형으로 약화되는 것을 줄인다.

## 헤어와 실루엣

풍성한 장발 웨이브가 허리·골반을 가리면 체형 레퍼런스로 실패한다. 헤어 정체성은 유지하되 `hair stays clear of the waist and outer hip contours`; 후면뷰는 `falls mainly down the center of the back`으로 배치한다.

## 판정

- 단일 베이스: 얼굴 동일성, 허리·골반·쇼츠·허벅지 상단이 모두 보이는가.
- 1×4 전신: 같은 인물·체형·스케일이며 정수리부터 발바닥까지 보이는가.
- 실패: 얼굴 위주 크롭, 직선형 골반, 의상의 체형 압축, 헤어의 외곽 실루엣 차폐, 패널별 키·골반·다리 길이 드리프트.

**길이 상한은 실행 표면이 정한다** — 정본은 [surfaces.md](surfaces.md) §0-1이다. 사람이 Seedream 입력창에 직접 붙여넣는 경로(S3)의 전형적 배선에서는 유효 상한이 블록당 2000자로 떨어지고, Higgsfield MCP처럼 모델 id로 호출하는 플랫폼 파라미터 표면(S2)은 그 표면 자체가 길이 상한을 계약으로 갖지 않는다(나머지 두 층은 살아 있다). 어느 쪽이든 길이를 줄여야 하면 얼굴 해부학 반복과 긴 부정 목록을 먼저 줄이고 산출물·프레이밍·체형·의상·정체성 순서는 보존한다.
