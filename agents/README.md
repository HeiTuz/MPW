# agents/ — 플러그인 진입 오버레이

이 폴더는 MPW 플러그인 payload의 **진입 오버레이**다. 저장소 루트(SKILL.md + references/ + scripts/ + contracts/ + examples/)가 유일한 정본이며, `plugin/` 폴더는 그 위에 얹는 최소 진입 표면만 담는다 — 저장소 전체 포크가 아니다.

## 빌드 모델

```
plugins/mpw/skills/mpw = 정본 allowlist 트리 + agents/plugin/ 오버레이 (같은 이름 파일은 오버레이가 대체)
```

- `scripts/build_plugin.mjs`가 위 payload와 `.codex-plugin`·`.claude-plugin` 매니페스트를 만든다. 산출물에는 `agents/` 폴더가 들어가지 않아 스킬 진입점은 `SKILL.md` 정확히 하나다.
- 오버레이가 바꿀 수 있는 것은 **호스트 통합 표면**뿐이다: frontmatter, 발동/호출 안내, 도구 명칭 매핑, 진입 프레이밍. 스킬의 실제 규칙·동작은 정본과 동일해야 한다.
- 빌드 후에도 상대 참조(`references/`, `scripts/`, `contracts/`)는 전부 유효해야 한다.

| 폴더 | 내용 |
|---|---|
| `plugin/` | 플러그인 진입 표면(`SKILL.md` + payload 안내용 `AGENTS.md`): Codex·Claude Code·ChatGPT 발동 방식, 셸 유무별 도구 매핑, 역할 라우팅 노트 |

2026-09-30(v3.0.0)에 호스트별 스킬 오버레이(claude·codex·hermes)와 Grok Bot 비공개 스킬 문안을 제거하고 플러그인 오버레이 하나로 합쳤다. 이전 구조는 Git 이력에 남아 있다.

## 동기화 규칙 (드리프트 방지)

`agents/plugin/SKILL.md`의 규칙 본문은 정본 `SKILL.md`를 따라간다. 정본 SKILL.md를 수정하면 오버레이 본문도 같은 내용으로 갱신하고, 차이는 frontmatter(`host_surface`, `canonical_source`)와 상단 "호스트 통합" 블록에만 남긴다. 오버레이는 정본과 byte-identical이면 안 되고(마이그레이션 증거), 규칙 본문이 다르면 안 된다(동작 동일성) — `scripts/lint.py` I14가 검사한다. 런타임 고유명 규칙(AGENTS.md 하드라인 5)은 코어 파일에만 적용된다 — `agents/plugin/`은 `references/adapters.md`와 같은 런타임 어댑터 표면이므로 호스트 제품명을 쓸 수 있다.
