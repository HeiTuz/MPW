# Codex canonical-ownership transfer — 2026-08-02

## Operational definition

Codex is the canonical editor and local-commit owner for the six `~/HeiTuz/<name>` source trees. Claude Code and Hermes are consumers: they may read and run installed skills, but they must not edit canonical trees, hand-edit install paths, bump versions, or push releases. A copied host overlay is a consumer artifact and is valid only when it carries canonical-source metadata and its non-overlay payload matches the source tree.

## Install-model decision

**Chosen: option 1 — keep `~/HeiTuz` as canonical and designate Codex as the principal editor.** Codex's installed skill remains a copied host overlay, but the edit surface is the canonical source tree, not `~/.codex/skills/*`. The doctrine checker now accepts that copied MPW artifact only when its `canonical_source` version matches and every installed non-overlay file hashes to the canonical tree. Claude Code/Hermes symlink views remain link-enforced.

**Rejected option 2 — convert Codex installs to member symlinks.** This would remove the existing host-overlay distribution model and make the Codex-specific entry surface indistinguishable from the canonical payload; it would also undermine the installer contract that deliberately applies `agents/codex/`.

**Rejected option 3 — add a host-specific doctrine exception that merely suppresses the warning.** This would make the checker quiet without proving that the copied artifact came from the current canonical tree. The chosen parity check preserves fail-closed drift detection.

## Action matrix

| Action | Codex | Claude Code | Hermes |
|---|---|---|---|
| Edit canonical `~/HeiTuz/<name>` | allowed | prohibited | prohibited |
| Commit canonical changes locally | allowed | prohibited | prohibited |
| Hand-edit installed payload | prohibited; regenerate from source | prohibited | prohibited |
| Version bump | separate release approval | prohibited | prohibited |
| Release push | separate release approval | prohibited | prohibited |
| Read/run installed skill | allowed | allowed | allowed |

`~/src/MPW-release` remains outside this transfer and was not touched.

## Handoff payload receipt

Source: final amended stage-1 review report commit `e1357df9ba478102aeec390fe80ea87a84ef8690` in `~/HeiTuz/MPW/docs-internal/review-2026-08-02.md`.

1. `[MPW] AGENTS.md:3-10` — **반영함**: MPW policy now names Codex's canonical edit/local-commit surface, consumer paths, copied Codex overlay, and release boundaries.
2. `[MPW] AGENTS.md:43-59` — **반영함**: doctrine/install policy now distinguishes symlink consumers from the parity-checked Codex copy.
3. `[ImgGen2] AGENTS.md` — **반영함**: added repository ownership policy and copied `agents/codex` artifact boundary.
4. `[ImgGen2] agents/README.md:7-13` — **반영함**: root policy now states that copied overlays are generated consumer artifacts and the canonical root remains the edit surface.
5. `[image-reference-gardener] AGENTS.md:3-11` — **반영함**: added Codex editor and Claude/Hermes consumer ownership.
6. `[design-reference-gardener] AGENTS.md:3-15` — **반영함**: added Codex editor and Claude/Hermes consumer ownership.
7. `[prompt-knowledge-gardener] AGENTS.md:3-11` — **반영함**: added Codex editor and Claude/Hermes consumer ownership.
8. `[higgsfield-prompt-bridge] AGENTS.md:3-5` — **반영함**: added Codex editor and Claude/Hermes consumer ownership.
9. `[host] ~/CLAUDE.md:63-70` — **반영함**: added the six-tree ownership definition and action prohibitions.
10. `[host] ~/AGENTS.md` — **반영함**: added the HeiTuz ownership boundary to the orchestration policy.
11. `[doctrine] ~/.hermes/scripts/prompt_writing_doctrine_check.py:384-456` — **반영함**: symlink paths remain enforced; Codex MPW copied payloads pass only on canonical-source metadata and payload hash parity.
12. `[design-reference-gardener] scripts/gardener_loop.py:253-266` — **반영함**: the canonical wire owner is now `MPW`; the paired test was updated and passed in design commit `90fb0c40be1ce2641c81f9c7012874b41ac9be7c`.

No payload line was marked unrelated: all twelve ownership lines changed the transfer's ownership definition, install semantics, or enforcement.
The later independent gardener review added four relevant authority lines: the design compiler-owner drift is **반영함** as item 12; image manifest/pending transaction defects are **반영함** in image commit `3aa197c4567dc65861418f317864f17a579462e8`; design URL secret persistence is **반영함** in design commit `41d196e031805e70e8374c53742eeb1fe8e57388`; migration residue under `~/src/MPW-release` is **무관함(금지된 비목표)**. No ownership payload line is silently omitted.
Final gate hardening is included in the current source: copied MPW/ImgGen2 overlays now use exact payload and host-overlay parity, symlink farms require the complete approved member set and exact canonical targets, and dangling optional installs are reported. Hermes ImgGen2 was refreshed offline to the canonical version.

## Remaining risks

- Copied host overlays can become stale after a canonical edit until the installer is run; the checker detects stale present or dangling artifacts, but it cannot regenerate them.
- The pre-existing `~/HeiTuz/ImgGen2/.codegraph/.gitignore` deletion remains untouched and uncommitted.
- Actor ownership is procedural rather than an ACL: the host and repository policies prohibit consumer-side edits, while the checker enforces topology and payload integrity rather than actor identity.
- No version bump, remote push, or release deployment was performed.
