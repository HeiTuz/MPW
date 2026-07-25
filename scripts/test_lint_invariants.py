#!/usr/bin/env python3
"""Negative smoke coverage for lint.py invariants I0, I1, I2, I6, and I14."""
import importlib.util
from pathlib import Path
import tempfile
import unittest


LINT_PATH = Path(__file__).with_name("lint.py")
SPEC = importlib.util.spec_from_file_location("heituz_lint", LINT_PATH)
lint = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lint)


class LintInvariantSmokeTests(unittest.TestCase):
    def test_i0_rejects_universal_2000_character_rule(self):
        for sentence in (
            "모든 프롬프트는 2000자 이하로 작성한다.",
            "프롬프트는 언제나 2000자 이내여야 한다.",
            "표면과 무관하게 상한은 항상 2000자다.",
        ):
            with self.subTest(sentence=sentence):
                errors = []
                lint.check_universal_2000_regression(sentence, errors)
                self.assertTrue(any("[I0]" in error for error in errors), errors)

    def test_text_block_cap_uses_trimmed_code_points(self):
        errors = []
        lint.check_example_lengths("sample.md", f"```text\n{'가' * 2000}\n```", errors)
        self.assertEqual([], errors)

        lint.check_example_lengths("sample.md", f"```text\n{'가' * 2001}\n```", errors)
        self.assertTrue(any("2001 chars (> 2000)" in error for error in errors), errors)

    def test_i16_rejects_mj_flag_drift(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references" / "image").mkdir(parents=True)
            (root / "scripts").mkdir()
            (root / "references" / "image" / "grok-imagine.md").write_text(
                "## 게이트 카드\n\n| 금지 | `--ar` / `--stylize` |\n\n## 다음\n",
                encoding="utf-8",
            )
            (root / "scripts" / "check_prompt.mjs").write_text(
                'const BANNED_MJ_FLAGS = ["ar"];\n',
                encoding="utf-8",
            )
            errors = []
            lint.check_mj_flag_sync(root, errors)
        self.assertTrue(any("[I16]" in error for error in errors), errors)

    def test_i1_rejects_runtime_name_in_core(self):
        texts = {name: "safe text" for name in lint.CORE_RUNTIME_NAME_FILES}
        texts["references/templates.md"] = "Codex 전용 규칙"
        errors = []
        lint.check_runtime_names(texts, errors)
        self.assertTrue(any("[I1]" in error for error in errors), errors)
    def test_i1_rejects_operator_address_in_image_core(self):
        texts = {name: "safe text" for name in lint.CORE_RUNTIME_NAME_FILES}
        texts["references/image/from-image.md"] = "이 사용자 기본값"
        errors = []
        lint.check_runtime_names(texts, errors)
        self.assertTrue(any("[I1]" in error for error in errors), errors)


    def test_i2_rejects_broken_relative_link_and_orphan(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references").mkdir()
            (root / "SKILL.md").write_text("[missing](references/missing.md)\n", encoding="utf-8")
            (root / "references" / "orphan.md").write_text("# orphan\n", encoding="utf-8")
            errors = []
            lint.check_links_and_orphans(root, errors)
        self.assertTrue(any("broken relative link" in error and "[I2]" in error for error in errors), errors)
        self.assertTrue(any("orphan reference" in error and "[I2]" in error for error in errors), errors)
    def test_i2_rejects_broken_plaintext_path_and_unlinked_router_pointer(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references").mkdir()
            (root / "SKILL.md").write_text("# skill\n", encoding="utf-8")
            (root / "references" / "target.md").write_text("# target\n", encoding="utf-8")
            router = root / "references" / "sample-router.md"
            router.write_text(
                "`missing-contract.md`\ntarget.md\n",
                encoding="utf-8",
            )
            errors = []
            lint.check_plaintext_paths(root, errors)
        self.assertTrue(any("broken plaintext path pointer" in error for error in errors), errors)
        self.assertTrue(any("router path pointer must be a Markdown link" in error for error in errors), errors)

    def test_i15_rejects_contract_index_table_drift(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "contracts").mkdir()
            (root / "references").mkdir()
            (root / "contracts" / "manifest.json").write_text(
                '{"files": {"v1/listed.schema.json": "x", "v1/missing.schema.json": "y"}}\n',
                encoding="utf-8",
            )
            (root / "references" / "adapters.md").write_text(
                "| 계약 | 스키마 |\n| --- | --- |\n| listed | `listed.schema.json` |\n",
                encoding="utf-8",
            )
            errors = []
            lint.check_contract_index_table(root, errors)
        self.assertTrue(any("missing.schema.json" in e and "[I15]" in e for e in errors), errors)
        self.assertFalse(any("listed.schema.json" in e for e in errors), errors)

    def test_i6_rejects_reversed_key_fill_ratio(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "SKILL.md").write_text("key:fill 1:3\n", encoding="utf-8")
            errors = []
            lint.check_key_fill_ratios(root, errors)
        self.assertTrue(any("[I6]" in error for error in errors), errors)

    def test_i14_rejects_overlay_body_drift(self):
        canonical = """---
version: 2.16.0
---
# MPW — 디스패치 커널

canonical rule\n"""
        overlay = """---
version: 2.16.0
metadata:
  host_surface: claude
  canonical_source: "HeiTuz/MPW SKILL.md v2.16.0"
---
# MPW — 디스패치 커널 (Claude Code 표면)

> **호스트 통합 — Claude Code.** host-only text

drifted rule\n"""
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "agents" / "claude").mkdir(parents=True)
            (root / "agents" / "claude" / "SKILL.md").write_text(overlay, encoding="utf-8")
            errors = []
            lint.check_agent_skill_sync(root, canonical, errors)
        self.assertTrue(any("[I14] rule body drift" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
