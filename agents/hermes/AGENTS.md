# AGENTS.md — MPW 설치본 (Hermes 호스트)

이 디렉터리는 MPW 설치 payload이며 정본 저장소가 아니다. 저장소 기여 규칙과 릴리스 절차는 여기에서 실행하지 않는다.

- 진입점은 `SKILL.md` 하나다.
- 상세 규칙은 `references/`, 기계 계약은 `contracts/`, 컴파일러·검증기는 `scripts/`에 있다.
- 설치본을 직접 편집하지 않는다. 수정은 정본 저장소에서 하고 installer로 재설치한다.
- 검증 경로는 `SKILL.md`와 `references/image/surfaces.md`에서 고른다. `check_prompt.mjs`의 기본값은 compiled 형식용이므로 자연어 프롬프트를 기본 명령에 맞춰 바꾸지 않는다. 핸드오프는 해당 `compile_*.py`의 실제 입력 계약을 따른다.
