<div align="center">

<img src="https://raw.githubusercontent.com/HeiTuz/MPW/main/assets/hero.jpg" alt="MPW — 말을 결과로 컴파일합니다" width="100%">

# MPW

### AI에게 말은 그만 시키고, **결과를 내게 만드세요.**

“대충 잘해줘”를 결과물·검증·완료 기준이 박힌 실행 지시로 컴파일합니다.

[![Release](https://img.shields.io/github/v/release/HeiTuz/MPW?style=for-the-badge&color=00d8ff&labelColor=0d1117)](https://github.com/HeiTuz/MPW/releases/latest)
[![CI](https://img.shields.io/github/actions/workflow/status/HeiTuz/MPW/ci.yml?branch=main&style=for-the-badge&label=CI&color=00d8ff&labelColor=0d1117)](https://github.com/HeiTuz/MPW/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-00d8ff?style=for-the-badge&labelColor=0d1117)](LICENSE)
[![Install](https://img.shields.io/badge/install-30초-ffb000?style=for-the-badge&labelColor=0d1117)](#-30초면-붙습니다)

```sh
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw
```

</div>

---

## ⚡ 긴 프롬프트보다 중요한 건 끝난 작업

코드는 테스트를 통과해야 합니다. 리서치는 결론까지 가야 하고, 콘텐츠는 바로 쓸 수 있어야 합니다.
MPW는 짧은 요청 하나를 실행 → 검증 → 완료까지 밀어붙이는 프롬프트로 컴파일합니다.

| 그냥 던지면 | MPW를 통과하면 |
|---|---|
| “이 버그 고쳐줘” | 수정 범위 + 건드리면 안 되는 경계 + 통과해야 할 테스트 |
| “리서치해줘” | 조사 범위 + 근거 신뢰도 + 비교 기준 + 결론 형식 |
| “예쁘게 만들어줘” | 구도·조명·스타일·보존 요소가 박힌 장면 단위 제작 지시 |
| “팀으로 굴려줘” | 역할·권한·경계 + 최종 판정자 + 완료 증거 |

---

## 🎯 한 줄 요청이 하는 일

### 🔧 “고쳐줘”의 끝은 테스트 통과

> “이 버그 고쳐줘”를 코드 변경에서 끝내지 않습니다.

고칠 범위와 건드리지 말아야 할 경계를 잡고 통과해야 할 테스트를 박습니다. 판을 키우는 리팩터링 없이도 결과를 검증 가능한 상태까지 끌고 갑니다.

<br>

### 🤖 여러 에이전트, 한 목표

<img src="https://raw.githubusercontent.com/HeiTuz/MPW/main/assets/agents.jpg" alt="기획·구현·리뷰·검증이 하나의 결과물로 수렴" width="100%">

기획, 구현, 리뷰, 검증이 서로 다른 목표를 쫓으면 에이전트가 많을수록 더 빨리 망가집니다.

MPW는 역할과 경계를 정리해 여러 에이전트가 하나의 결과물을 향해 움직이게 합니다. 누가 판단하고 누가 실행하고 무엇으로 최종 판정할지를 처음부터 못 박습니다.

<br>

### 🔍 읽고 끝나지 않는 리서치

출처만 잔뜩 붙은 리서치는 브라우저 탭만 늘립니다.

조사 범위, 신뢰할 근거, 비교 기준, 결론의 형식을 잡아 바로 다음 행동으로 이어지는 답을 만듭니다.

<br>

### 🎬 이미지와 영상은 보이는 장면으로

형용사는 쌓지 않습니다. 모델이 무엇을 그려야 하는지 장면 단위로 지시합니다.

패션 화보, 브랜드 비주얼, 포스터, 카드뉴스, 제품 사진, 배경 편집까지 — 구도와 조명, 스타일, 보존해야 할 요소를 한 장면 안에 정리한 제작 지시를 만듭니다.

<img src="https://raw.githubusercontent.com/HeiTuz/MPW/main/assets/variations.jpg" alt="한 문장에서 100장의 서로 다른 자기완결 프롬프트로" width="100%">

한 문장 반복은 아이데이션이 아닙니다. “서브컬처·독립잡지 스타일 레퍼런스 100장”처럼 수량이 큰 요청은 내장 variation compiler가 맡습니다. 구도·시점·조명·팔레트·재질·공간 리듬을 서로 다르게 조합해 자기완결 프롬프트 JSONL을 뽑습니다.

```sh
python3 scripts/compile_image_variations.py --request request.json --count 100 --output variations.jsonl --seed 42
```

`locks`의 `composition`, `camera`, `lighting`, `palette`, `surface`, `rhythm`은 해당 축을 고정합니다. 남은 축만 변주하고, 만들 수 있는 고유 조합보다 큰 수량은 오류로 보고합니다.

> 이 단계는 외부 호출이나 이미지 QC를 실행하지 않습니다. 생성·재개·최종 이미지 수집은 호환 이미지 실행기가 맡습니다.

<br>

### ✂️ 틀린 축만 벱니다

톤만 바꾸고 싶다면 톤만. 구도만 바꾸고 싶다면 구도만.

바꿔야 할 축만 잡아 의도를 보존한 채 정밀하게 수정합니다. 좋았던 부분까지 갈아엎는 재작성은 하지 않습니다.

---

## 🙋 이런 사람이라면 맞습니다

- 결과 없이 말만 번듯한 AI 작업이 지겨운 사람
- 코딩·리서치·기획·콘텐츠 제작을 한 기준으로 굴리고 싶은 사람
- 여러 에이전트를 써도 통제력을 잃고 싶지 않은 사람
- 이미지 프롬프트를 “예쁜 말 모음”이 아니라 제작 지시로 쓰고 싶은 사람
- “완료했다”는 말보다 파일·링크·테스트·검증을 보고 싶은 사람

---

## 🚀 30초면 붙습니다

한 줄이면 설치기가 이 컴퓨터의 에이전트 환경을 자동 감지해 맞는 위치에 설치합니다.

```sh
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw
# 또는
bunx --package github:HeiTuz/MPW heituzmpw
```

<details>
<summary><b>자동 감지가 하는 일</b></summary>

<br>

- **감지 신호**: `~/.claude`, `~/.hermes`, `~/.codex` 같은 잘 알려진 스킬 디렉터리·CLI 설치 흔적만 봅니다. 비밀값이나 설정 파일 내용은 읽지 않습니다.
- **대화형 터미널**: 감지된 대상을 보여주고 하나 또는 여러 개를 선택·확인합니다.
- **CI·비대화형**: 절대 묻지 않습니다. 1개 감지 → 그대로 설치. 여러 개 감지 → `claude > hermes > codex` 우선순위의 첫 감지 대상. 0개 감지 → Claude Code 위치에 설치(문서화된 기본값).
- 명시 `--target`/`--dest`는 항상 자동 감지를 이깁니다.

</details>

### 어디에, 어떤 payload가 설치되나

| 대상 | 설치 위치 | payload |
|---|---|---|
| `claude` (기본값) | `~/.claude/skills/MPW` | 정본 트리 + Claude Code 진입 표면 |
| `hermes` | `~/.hermes/skills/prompt-writing/MPW` | 정본 트리 + Hermes 진입 표면 |
| `codex` / `gpt` | `~/.codex/skills/MPW` | 정본 트리 + GPT/Codex 진입 표면 |

자동 감지의 기본값은 Claude Code입니다. 어느 호스트로 설치하든 규칙 본문은 같고, 호스트 통합 표면(발동·도구 명칭·frontmatter)만 달라집니다 — 구조와 근거는 [호스트 어댑터 안내](https://github.com/HeiTuz/MPW/blob/main/agents/README.md)에 있습니다.

<details>
<summary><b>명시 설치 · 직접 설치</b></summary>

<br>

```sh
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw -- --target claude
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw -- --target hermes
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw -- --target codex     # --target gpt 동일
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw -- --target all       # 감지된 전부에 설치
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw -- --dest /custom/skills/MPW
```

재설치는 `--force`, 조용한 설치는 `--quiet`. `--target auto`는 기본 동작인 자동 감지를 명시적으로 켭니다.

소스에서 설치하려면 스킬 검색 경로 밖의 작업 디렉터리에서 체크아웃한 뒤 로컬 installer를 실행합니다:

```sh
git clone https://github.com/HeiTuz/MPW.git ./MPW-source
node ./MPW-source/scripts/install.mjs --target claude
# Hermes는 --target hermes, GPT/Codex는 --target codex
```

installer가 런타임 파일만 복사하고 선택한 호스트 오버레이를 적용합니다. 설치본에는 `agents/`가 들어가지 않아 스킬 진입점이 `SKILL.md` 하나로 유지됩니다.

</details>

### 🧩 플러그인으로 설치 (ChatGPT · Codex)

같은 스킬을 **플러그인**으로도 설치할 수 있습니다. 플러그인은 ChatGPT(Chat·Work)와 Codex가 공유하는 형식이라, 셸이 없는 ChatGPT 대화에서도 `@mpw`로 규칙을 불러 쓸 수 있습니다. 이 저장소는 `.agents/plugins/marketplace.json`으로 `heituz` 마켓플레이스를, `plugins/mpw/`로 플러그인 패키지를 제공합니다.

```sh
# Codex CLI · ChatGPT 데스크톱 앱(Codex)
codex plugin marketplace add HeiTuz/MPW      # 또는 로컬 체크아웃 경로
codex plugin add mpw@heituz

# Claude Code
claude plugin marketplace add HeiTuz/MPW
claude plugin install mpw@heituz --scope user   # 세션 안에서는 /plugin install mpw@heituz
```

설치 후 새 세션을 시작하면 Codex에서는 `$mpw`, Claude Code에서는 `/mpw:mpw`, ChatGPT 데스크톱 앱의 **Plugins → HeiTuz**에서 설치한 뒤 Chat·Work에서는 `@mpw`로 호출합니다. 저장소에는 ChatGPT·Codex용 `.agents/plugins/marketplace.json`과 Claude Code용 `.claude-plugin/marketplace.json`이 함께 있고 둘 다 같은 `plugins/mpw/`를 가리킵니다. 웹·모바일 ChatGPT에는 워크스페이스 게시(관리자) 또는 공개 디렉터리 제출을 거친 플러그인만 보입니다. 셸이 없는 표면에서는 검증기·컴파일러를 실행하지 않고 규칙만 적용하며, 스킬이 실측·검사를 수행했다고 주장하지 않습니다.

`plugins/mpw/`는 정본에서 생성한 산출물입니다(`npm run build:plugin`). 직접 편집하지 말고 정본을 고친 뒤 다시 생성하세요. `npm test`가 커밋된 산출물과 생성 결과의 일치를 검사합니다. 같은 머신에 `~/.codex/skills/MPW`·`~/.claude/skills/MPW` 독립 설치본이 함께 있으면 스킬 목록에 MPW가 두 번 보이므로, 한쪽만 쓰려면 플러그인(`[plugins."mpw@heituz"] enabled`, `claude plugin disable mpw@heituz`) 또는 독립 설치본(`[[skills.config]]`)을 끕니다.

### 💬 웹 ChatGPT에서는 커스텀 GPT로

로컬·저장소 마켓플레이스는 웹·모바일 ChatGPT에 보이지 않습니다(워크스페이스 게시나 공개 제출이 필요). 심사 없이 바로 쓰려면 정본에서 **커스텀 GPT 번들**을 만들어 GPT 빌더에 넣습니다.

```sh
npm run build:gpt      # build/gpt-bundle/ 생성 (gitignored)
```

생성된 `instructions.txt`를 GPT의 Instructions에 붙여넣고, 같은 폴더의 지식 파일 15개(인덱스 파일 + 정본 묶음 14개)를 Knowledge에 업로드합니다. 각 지식 파일은 정본 references를 `=== FILE: <경로> ===` 구분자로 묶은 것이라 SKILL.md의 상대 경로 참조가 인덱스를 통해 풀립니다. 셸이 없는 표면이므로 검증기·컴파일러는 돌지 않고 규칙만 적용하며, 실측·검사를 수행했다고 주장하지 않도록 지침에 적혀 있습니다. 정본을 고치면 번들을 다시 만들어 파일을 교체하세요.

### 🎨 통합 명령에서 필요한 스킬만 선택

이미지 생성까지 필요하면 ImgGen2 통합 설치기를 사용하세요. 일반 터미널에서는 **ImgGen2만 / MPW만 / 둘 다** 중 하나를 선택합니다.

```sh
npx --yes --allow-git=all --package github:HeiTuz/ImgGen2 imggen-imggen2
```

선택을 명시하고 두 스킬을 같은 호스트에 설치할 수도 있습니다.

```sh
# MPW만 Codex에 설치
npx --yes --allow-git=all --package github:HeiTuz/ImgGen2 imggen-imggen2 -- --component mpw --agent codex

# MPW와 ImgGen2를 함께 설치
npx --yes --allow-git=all --package github:HeiTuz/ImgGen2 imggen-imggen2 -- --component all --agent codex
```

통합 설치기의 `--agent`와 MPW 자체 설치기의 `--target`은 모두 호스트 선택입니다. 통합 설치기의 `--target`은 **ImgGen2 파일 경로**이므로 혼동하지 마세요. 비대화형 통합 명령에서 구성요소를 생략하면 ImgGen2만 설치합니다.

MPW만 선택하면 ImgGen2·Codex CLI·QC 설정을 설치하지 않습니다. MPW 자체 설치 명령도 계속 독립적으로 사용할 수 있습니다. 설치된 MPW를 갱신하려면 위 MPW 명령에 `--force`를 추가하세요. ImgGen2 도우미가 있다면 `imggen update --component mpw`로 MPW만 갱신할 수도 있습니다.

[통합 설치 옵션과 이미지 제작 사용법 →](https://github.com/HeiTuz/ImgGen2#설치)

---

## 💬 짧게 던지는 예시

### 작성 모델을 바꿔 사용할 때

MPW는 특정 작성 모델의 취향에 기대지 않고 요청의 모델·자료 역할·정확 문구·수량·보존 조건을 먼저 고정합니다. 한국어로 요청해도 새 프롬프트 본문은 영어가 기본이고 설명은 대화 언어를 따릅니다. 명시한 출력 언어·원문 재사용·부분 수정·정확 대사와 카피는 보존합니다. 같은 입력을 새로 작성한 문장은 모델마다 달라질 수 있습니다. 문자까지 같은 결과가 필요하면 승인된 프롬프트를 재사용하고, 부분 수정에서는 지정한 범위 밖 원문을 유지합니다.

검증은 두 층으로 나눕니다. `npm test`는 컴파일러·형식·설치·예시의 회귀 검사이며 실제 작성 모델을 호출하지 않습니다. 모델을 바꾼 뒤에는 [행동 평가 사례](scripts/fixtures/behavioral/cases.json)의 동일 요청을 새 대화에 제공하고 원 응답을 보존해 조건 누락·임의 추가·변경을 대조합니다. `expected`가 있는 재사용·부분 수정 사례는 문자 일치를 검사하고, 나머지는 `semantic_checks`로 판단합니다. 모델명·스킬 커밋·입력·실제 응답·실패·미실행을 함께 기록하며, 이 평가도 실제 이미지·영상 생성 품질을 입증하지는 않습니다.

```text
이 기능 구현하게 프롬프트 써줘.
실제 테스트까지 돌리고, 무관한 리팩터링은 하지 않게 해.
```

```text
이 리서치 요청을 의사결정용으로 바꿔줘.
출처 신뢰도와 결론의 한계도 분명히 남겨.
```

```text
이 상품 사진은 그대로 두고 배경만 서울의 새벽 골목으로 바꾸는 이미지 편집 프롬프트 만들어줘.
```

```text
이 팀 작업의 역할과 완료 기준을 정리해줘.
결과물을 합치는 사람과 검증하는 사람을 분리해.
```

---

<div align="center">

## 프롬프트의 가치는 결과로 증명됩니다

그럴듯한 문장만 남기는 프롬프트는 실패입니다.

### 실행할 수 있는 지시 · 확인할 수 있는 결과 · 완료를 증명하는 근거

**MPW는 AI의 답변을 작업 결과로 바꿉니다.**

<br>

```sh
npx --yes --allow-git=all --package github:HeiTuz/MPW heituzmpw
```

<br>

MIT License · [HeiTuz](https://github.com/HeiTuz)

</div>
