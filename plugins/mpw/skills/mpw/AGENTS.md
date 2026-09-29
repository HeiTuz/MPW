# AGENTS.md — MPW 플러그인 payload (Codex·Claude Code·ChatGPT)

이 디렉터리는 HeiTuz 마켓플레이스 플러그인 `mpw@heituz`에 번들된 MPW **스킬 payload**다. 정본 저장소가 아니다 — 저장소 기여 규칙(커밋·리뷰·정본 단일성 유지보수)은 여기에 적용되지 않는다.

- 스킬 진입점은 `SKILL.md` 하나다. 프롬프트 작성·퇴고·라우팅 요청이 오면 `SKILL.md`를 읽고 그 계약을 따른다.
- 상세 규칙은 `references/`(templates·model-playbooks·adapters·image/*), 기계 계약은 `contracts/`, 컴파일러·검증기는 `scripts/`에 있다. 전부 이 디렉터리 기준 상대 경로로 유효하다.
- 이 트리를 제자리에서 편집하지 않는다. 수정은 정본 https://github.com/HeiTuz/MPW 에서 하고 새 릴리스를 마켓플레이스(https://github.com/HeiTuz/heituz-plugins)에서 받는다.
- 검증 명령과 프로필은 `references/image/surface-contracts.md` §3.1, 표면별 체크는 `references/image/surfaces.md` §6에서 고른다. 기본 프로필은 native이며 MPW 조립 산출물만 assembled로 검사한다. 핸드오프는 해당 `compile_*.py`의 실제 입력 계약을 따른다.
