# Midjourney — 캐릭터 시트·전신 레퍼런스

## 적용 조건

사용자가 Midjourney에 인물 레퍼런스를 주고 캐릭터 시트·턴어라운드·전신 고정을 요구할 때 적용한다. 문법·파라미터·슬롯·무드보드 정본은 [midjourney-identity.md](midjourney-identity.md)이고, 이 파일은 **캐릭터 시트의 산문 규칙과 판정 기준**만 갖는다.

**먼저 버전 경로부터 정한다.** 캐릭터 시트는 정의상 동일 인물 요구인데, 현행 기본 모델 V8.2를 포함한 V8 계열에는 인물 정체성을 고정하는 네이티브 수단이 없다(`--cref`=V6·Niji6, `--oref`=V7). midjourney-identity.md §2의 두 갈래 중 하나를 사용자에게 명시하고 고르게 한 뒤에 시트를 조립한다.

- **동일성이 목적이면** `--v 7` + `--oref <URL>` + `--ow`로 내려간다. Omni는 이미지 1장만 받는다. V8 계열 상태로 Omni 슬롯에 이미지를 넣으면 잡이 조용히 V7로 실행되므로, 버전을 명시하지 않으면 사용자는 자기가 뭘 돌렸는지 모른다.
- **V8 계열을 유지해야 하면** 동일성을 포기하고 감도만 잡는다. 이때 시트는 "같은 인물의 여러 각도"가 아니라 "같은 설계 언어의 여러 각도"이며, 산출물에 그렇게 적는다.

## 파라미터 계약

- 레퍼런스 고정 문법과 슬롯 선택은 midjourney-identity.md §6이 정본이다. 구도·의상이 복사되면 대개 레퍼런스를 Image Prompt 슬롯에 넣은 것이므로 `--sref`로 옮기는 게 1차 처방이다.
- 이미지 영향도 조절축은 **`--iw`**(0–3, 기본 1)이다. V8 계열·V7 모두 공식 지원되며, 추정 플래그가 아니다. V7 Omni 경로에서는 `--ow`(1–1000, 기본 100, 400 이하 권장)가 별도 축으로 붙는다.
- 네거티브는 `--no`에 **단일 명사만 쉼표로** 나열한다(midjourney-identity.md §5). `--no modern clothing` 같은 다어절 구는 모더레이션이 단어를 독립적으로 읽어 의상을 통째로 지운다 — 캐릭터 시트에서 특히 치명적이다.
- 길이는 문자 수가 아니라 단어 수로 잰다(midjourney-identity.md §8). 전신 보장 문구를 중복으로 쌓다 보면 예산을 금방 넘기므로, 아래 3번의 중복 고정은 필요한 만큼만 쓴다.

## 프롬프트 구조

1. `character turnaround sheet` + 한 캔버스의 뷰 수·순서를 첫 문장에 고정한다.
2. `face identity is the highest priority` 뒤에 **관찰된** 얼굴·헤어 식별점을 짧게 적는다. 실존인물·국적·나이를 추정하지 않는다.
3. 전신 보장은 `entire figure fully visible from hair to feet`, `both feet visible`, `camera positioned far enough back`, `generous space above head and below feet`로 중복 고정한다.
4. 체형 수치는 시각 비례로 번역한다: `170 cm-tall fashion proportion, approximately 7.5 heads tall, long-leg balanced silhouette`. 생성 모델이 실제 단위를 측정하지 않으므로 "정확한 신장"이라고 약속하지 않는다.
5. 턴어라운드는 `front / three-quarter / side profile / back` 순서, neutral A-pose, 팔을 몸통에서 약간 분리, 동일한 의상·조명·간격을 명시한다.

## 판정

- 얼굴 고정 품질은 얼굴이 보이는 전면·3/4·측면에서만 판단한다. 후면뷰는 얼굴 불가시가 정상이다.
- 한 이미지에 다중 뷰를 넣으면 동일성은 강한 유도이지 절대 보증이 아니다.
- 드리프트가 있으면 순서대로 확인한다: ① 레퍼런스가 어느 슬롯에 들어갔는가 ② `--iw`(또는 V7 경로의 `--ow`)가 적정한가 ③ 그래도 남으면 텍스트에서 의상과 피사체를 과잉 특정해 레퍼런스가 들어올 자리를 없앤다. 새 금지어를 쌓는 것은 마지막 수단이다.
- 각도 세트를 통제해야 하는데 한 캔버스 시트가 흔들리면 midjourney-identity.md §11의 독립 잡 시퀀스로 전환한다. `--repeat`은 한 각도의 변형만 만들고, 완성 이미지에서 파라미터가 자동 제거되므로 재실행 시 손으로 다시 붙여야 한다.
