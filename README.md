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
bunx --package github:HeiTuz/MPW heituzmpw
```

</div>

---

## ⚡ 긴 프롬프트보다 중요한 건 끝난 작업

코드는 테스트를 통과해야 합니다. 리서치는 결론까지 가야 하고, 콘텐츠는 바로 쓸 수 있어야 합니다.
MPW는 요청한 결과와 조건을 보존한 완성 프롬프트를 만듭니다. 단순 요청은 바로 쓰고, 실행·시스템·이미지·영상의 전문 규칙은 필요한 경우에만 적용합니다. 대상 모델을 정하지 않아도 자연어 초안을 쓸 수 있으며, 프롬프트 작성만 요청하면 그 안의 작업을 실행하지 않습니다.

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

MPW는 HeiTuz 마켓플레이스의 플러그인 `mpw@heituz`로 설치합니다. 마켓플레이스를 한 번 추가해 두면 앞으로 나오는 HeiTuz 스킬도 같은 곳에서 설치할 수 있습니다.

**Codex**

```sh
codex plugin marketplace add HeiTuz/heituz-plugins
codex plugin add mpw@heituz
```

**Claude Code**

```sh
claude plugin marketplace add HeiTuz/heituz-plugins
claude plugin install mpw@heituz
```

**ChatGPT (워크스페이스)**: 관리자가 Workspace settings → Plugins → Add → Import marketplace에 `https://github.com/HeiTuz/heituz-plugins`를 넣으면 워크스페이스 플러그인 목록에 올라옵니다.

설치한 뒤 새 세션을 열면 적용됩니다. "프롬프트 만들어줘"처럼 요청하면 자동으로 발동하고, 직접 부를 때는 Codex `$mpw:mpw`, Claude Code `/mpw:mpw`, ChatGPT `@mpw`를 씁니다.

업데이트는 `mpw update` 한 줄입니다. 설치된 Codex·Claude Code를 찾아 heituz 마켓플레이스를 새로 고치고 `mpw@heituz`를 최신 버전으로 받은 뒤, 갱신 전후 버전을 보여 줍니다. 한쪽만 갱신하려면 `--codex`나 `--claude`를, 실행할 명령만 보려면 `--dry-run`을 붙입니다. 설치된 버전은 `mpw version`으로 확인합니다.

```sh
npm install -g github:HeiTuz/MPW   # mpw 명령 설치 (한 번만)
mpw update
```

전역 설치 없이 `bunx --package github:HeiTuz/MPW mpw update`로 실행해도 됩니다. `mpw` 명령이 하는 일은 호스트별로 아래 두 줄을 실행하는 것과 같습니다.

```sh
codex plugin marketplace upgrade heituz && codex plugin add mpw@heituz
claude plugin marketplace update heituz && claude plugin update mpw@heituz
```

<details>
<summary><b>다른 에이전트 · 스킬 폴더로 직접 설치</b></summary>

<br>

플러그인을 지원하지 않는 에이전트에는 같은 스킬 payload를 원하는 폴더로 복사할 수 있습니다.

```sh
bunx --package github:HeiTuz/MPW heituzmpw -- --dest /custom/skills/MPW
```

재설치는 `--force`, 조용한 설치는 `--quiet`입니다. 소스 체크아웃에서는 `node scripts/install.mjs --dest <path>`, 플러그인 폴더 자체는 `node scripts/build_plugin.mjs --out <dir>`로 만듭니다.

</details>

<details>
<summary><b>2.x에서 옮겨오기</b></summary>

<br>

3.0.0부터 호스트별 스킬 설치(`--target claude|codex|gpt|hermes|all`)와 Hermes·Grok Bot 지원이 없어졌습니다. `--target`은 경고만 남기고 무시됩니다. 플러그인을 설치한 뒤 예전 설치본(`~/.codex/skills/MPW`, `~/.claude/skills/MPW`, `~/.hermes/skills/prompt-writing/MPW`)을 지우세요. 둘 다 있으면 MPW가 두 번 보입니다.

</details>

이미지 생성까지 필요하면 [ImgGen2](https://github.com/HeiTuz/ImgGen2#설치)를 함께 설치하세요.

---


## 이미지 문서·검증기 이행

이미지 문안은 기본 `native` 프로필로 검사하며, MPW 조립 산출물에는 `--profile assembled`를 명시합니다. 종료 코드와 진단 코드표는 [production.md](references/image/production.md) §검증기가 소유합니다. 이전 옵션은 별칭 없이 제거되어 `input/flag`로 거절됩니다.

배치 텍스트는 `node scripts/check_prompt.mjs --manifest jobs.jsonl`로 확인합니다. 각 행의 `id`와 `prompt` 또는 `full_prompt`만 읽으며 나머지 옛 메타데이터를 검증하거나 해석하지 않습니다. 실행 핸드오프 스키마 검사는 `contracts/validate.py`로 별도 수행합니다.

홍보물·글자 중심 포스터의 결정 기준은 [text-structure.md](references/image/text-structure.md), 사진 결과 사전은 [photo-results.md](references/image/editorial/photo-results.md)에 있습니다. 삭제된 개별 패턴·프리셋 문서의 링크는 새 정본으로 바꿉니다. 예시는 생성 결과가 아닌 텍스트 3종이며 검사 통과가 이미지 품질을 증명하지 않습니다.

## 💬 짧게 던지는 예시

### 작성 모델을 바꿔 사용할 때

MPW는 특정 작성 모델의 취향에 기대지 않고 요청의 모델·자료 역할·정확 문구·수량·보존 조건을 먼저 고정합니다. 프롬프트 본문의 언어는 규칙으로 정합니다 — 명시된 출력 언어가 우선이고, 기존 프롬프트 재사용·개선·부분 수정은 원문 언어를 유지하며, 이미지·영상 생성 프롬프트는 영어, 그 외 프롬프트는 수신자와 작업 컨텍스트의 언어를 씁니다. 설명은 대화 언어를 따릅니다. 명시한 출력 언어·원문 재사용·부분 수정·정확 대사와 카피는 보존합니다. 같은 입력을 새로 작성한 문장은 모델마다 달라질 수 있습니다. 문자까지 같은 결과가 필요하면 승인된 프롬프트를 재사용하고, 부분 수정에서는 지정한 범위 밖 원문을 유지합니다.

검증은 두 층으로 나눕니다. `npm test`는 컴파일러·형식·설치·예시의 회귀 검사이며 실제 작성 모델을 호출하지 않습니다. 모델을 바꾼 뒤에는 [행동 평가 사례](scripts/fixtures/behavioral/cases.json)의 동일 요청을 새 대화에 제공하고 원 응답을 보존해 조건 누락·임의 추가·변경을 대조합니다. `expected`가 있는 재사용·부분 수정 사례는 문자 일치를 검사하고, 나머지는 `semantic_checks`로 판단합니다. 모델명·스킬 커밋·입력·실제 응답·실패·미실행을 함께 기록하며, 이 평가도 실제 이미지·영상 생성 품질을 입증하지는 않습니다. [추가 경계 사례](scripts/fixtures/skill_behavior_cases.json)는 제공 자료 보존, 검토와 개선의 구분, 조건의 적용 대상, 미확인 집계와 실제 0건, 창작 재량을 점검합니다. 이 파일의 `expected`·`forbidden`은 의미 기준 배열이며 응답의 `request`·`context` 충족 여부를 평가합니다.

후속 요청의 기준 원문과 누적 변경은 모델을 바꿔도 유지합니다. “MPW로 다시 정리해”만으로 원문을 요약하지 않으며, 명시적인 전면 재작성·축약 요청은 따릅니다. “본문만”은 코드펜스 없는 원문, “JSON만”은 유효한 JSON을 뜻합니다. 지금 프롬프트를 쓰는 모델의 답변 형식과 그 프롬프트를 받을 모델의 결과 형식을 구분합니다.

#### 실제 작성 응답 평가

모델에는 사례의 `request`와 `context`만 전달하고, 판정 기준과 정답은 평가자에게 분리합니다. 원 응답을 `[{"id":"case-id","response":"원 응답"}]` 형태의 JSON 배열로 보관합니다. 의미 검토 결과는 별도 JSON 배열의 `id`, `verdict`(`pass` 또는 `fail`), `reason`에 근거와 함께 기록합니다. 같은 모델의 자기 채점을 독립 검증으로 보지 않습니다.

`node scripts/run_live_eval.mjs --models model-a,model-b`는 사례마다 새 격리된 `codex exec`를 실행하고 원 응답·로그·채점 JSON·요약을 결과 디렉터리에 보관합니다. `--ids id-a,id-b`는 일부 사례만, `--out 경로`는 빈 결과 디렉터리, `--concurrency N`과 `--timeout 초`는 실행 한도, `--dry-run`은 명령 확인에 사용합니다. 기본 결과 디렉터리는 임시 디렉터리입니다. `--runner-command`는 테스트용 명령 템플릿이며 `{model}`·`{prompt_file}`·`{out_file}`·`{cwd}`를 치환합니다. 의미 검토 파일은 한 모델의 응답에 대한 판정이므로 모델 하나를 실행할 때만 `--reviews 경로`로 전달하고, `--ids`로 고른 사례의 판정만 채점에 씁니다. 실행 실패·빈 응답은 `not_run`으로 기록하고, 의미 검토가 없으면 채점 결과는 `needs_review`로 남습니다. 모델은 결과 디렉터리 밖의 임시 작업 디렉터리에서 실행되지만 읽기 범위 자체를 막지는 않으므로, 로그에 채점 기준 파일 접근 흔적이 있으면 `criteria_access_suspected`로 표시합니다. 버전끼리 비교할 때는 평소 설정·인증·다른 스킬을 연결한 평가 전용 `CODEX_HOME`을 버전마다 만들고, 그 안의 MPW 사본에서 `scripts/fixtures/behavioral`과 `scripts/fixtures/skill_behavior_cases.json`을 빼 둡니다. 도구를 쓰는 모델이 설치본의 사례 파일에서 채점 기준을 찾아 읽은 경우가 실제로 관측됐습니다. 실행기는 `CODEX_HOME`을 이어받고 평가한 사본의 경로와 버전을 요약에 기록합니다.

```sh
python3 scripts/check_behavioral_responses.py \
  --responses responses.json --reviews reviews.json \
  --model actual-model-id --revision tested-skill-revision
```

이 도구는 외부 모델을 호출하지 않습니다. 원문 일치, 명시한 코드블록·JSON 형식, 보존 문자열을 기계 검사합니다. 코드펜스를 벗기거나 문구를 고쳐 통과시키지 않습니다. 의미 검토가 없으면 `needs_review`, 응답이 없으면 `not_run`, 기계 검사나 의미 검토 실패는 `failed`입니다. `code_blocks` 형식은 `outside_prose: allow`일 때만 블록 밖 짧은 메모를 허용합니다. 종료 코드는 전체 통과 0, 실제 실패 1, 잘못된 입력 2, 검토 대기·미실행만 남은 경우 3입니다. 형식 검사만으로 의미·실행·이미지 품질을 보증하지 않습니다. `--cases`로 [추가 경계 사례](scripts/fixtures/skill_behavior_cases.json)도 입력할 수 있습니다. 그 파일의 CLI 검증 사례처럼 작성 모델 실행 대상이 아닌 항목은 별도 도구 검사로 구분하고 미실행을 성공에 합산하지 않습니다.

평가 기록에는 실제 모델 ID·추론 설정, 스킬 커밋 또는 미커밋 트리 해시, 사례 파일·원 응답·검토 근거, 실패·미실행을 남깁니다. 독립 대화 대신 한 세션에서 여러 사례를 작성했다면 배치 평가라고 표시합니다. 부분 재검증으로 전체 모델 호환성을 선언하지 않습니다.

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
bunx --package github:HeiTuz/MPW heituzmpw
```

<br>

MIT License · [HeiTuz](https://github.com/HeiTuz)

</div>
