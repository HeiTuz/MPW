# AGENTS.md — MPW 설치본 (Claude 호스트)

이 디렉터리는 MPW 설치 payload이며 정본 저장소가 아니다. 저장소 기여 규칙과 릴리스 절차는 여기에서 실행하지 않는다.

- 진입점은 `SKILL.md` 하나다.
- 상세 규칙은 `references/`, 기계 계약은 `contracts/`, 컴파일러·검증기는 `scripts/`에 있다.
- 설치본을 직접 편집하지 않는다. 수정은 정본 저장소에서 하고 installer로 재설치한다.
- 검증 명령과 프로필은 `references/image/surface-contracts.md` §3.1, 표면별 체크는 `references/image/surfaces.md` §6에서 고른다. 기본 프로필은 native이며 MPW 조립 산출물만 assembled로 검사한다. 핸드오프는 해당 `compile_*.py`의 실제 입력 계약을 따른다.
