# MPW — Hermes 설치본

이 디렉터리는 MPW의 Hermes 설치 payload다. 호스트 중립 정본 위에 Hermes용 `SKILL.md`·`AGENTS.md`·이 안내문 오버레이를 적용한다.

- 스킬 진입점: `SKILL.md` (디스패치 커널)
- 설치 위치: `~/.hermes/skills/prompt-writing/MPW`
- 역할 매핑·호출 문법: [references/adapters.md](references/adapters.md) §Hermes
- 정본·문서: https://github.com/HeiTuz/MPW

이 트리는 설치 산출물이다. 수정은 정본 저장소에서 하고 installer로 재설치한다(`npx --yes github:HeiTuz/MPW -- --target hermes --force`).
