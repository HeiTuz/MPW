# AGENTS.md — MPW 설치본 (GPT/Codex 호스트)

이 디렉터리는 MPW **설치 payload**다. 정본 저장소가 아니다 — 저장소 기여 규칙(커밋·리뷰·정본 단일성 유지보수)은 여기에 적용되지 않는다.

- 스킬 진입점은 `SKILL.md` 하나다. 프롬프트 작성·퇴고·라우팅 요청이 오면 `SKILL.md`를 읽고 그 계약을 따른다.
- 상세 규칙은 `references/`(templates·model-playbooks·adapters·image/*), 기계 계약은 `contracts/`, 컴파일러·검증기는 `scripts/`에 있다. 전부 이 디렉터리 기준 상대 경로로 유효하다.
- 이 트리를 제자리에서 편집하지 않는다. 수정은 정본 https://github.com/HeiTuz/MPW 에서 하고 installer로 재설치한다(`npx --yes github:HeiTuz/MPW -- --target codex --force`).
- 검증 경로는 `SKILL.md`와 `references/image/surfaces.md`에서 고른다. `check_prompt.mjs`의 기본값은 compiled 형식용이므로 자연어 프롬프트를 기본 명령에 맞춰 바꾸지 않는다. 핸드오프는 해당 `compile_*.py`의 실제 입력 계약을 따른다.
