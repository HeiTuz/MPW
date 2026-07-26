#!/usr/bin/env python3
"""Negative smoke coverage for lint.py documentation and contract invariants."""
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

    def test_i17_rejects_s2_runtime_value_redefinition(self):
        for sentence in (
            "S2 플랫폼은 resolution 2k 이상 + quality high를 쓴다.",
            "S2면 resolution 2k 이상 + quality high를 쓴다.",
            "S2는 resolution 2k 이상 + quality high를 쓴다.",
            "S2에서는 resolution 2k 이상 + quality high를 쓴다.",
            "S2 quality high를 쓴다.",
            "S2 resolution 4k를 쓴다.",
            "S2 해상도 8k를 쓴다.",
            "quality high를 S2에서 쓴다.",
            "S2:\nresolution: 4k",
            "S2는 `resolution` `4k`를 쓴다.",
            "S2 플랫폼:\nresolution: 4k",
            "| S2 플랫폼 파라미터 | `resolution` 2k 이상 + `quality` 최상단 티어. |",
            "| S2 | resolution 4k |",
        ):
            with self.subTest(sentence=sentence):
                errors = []
                lint.check_s2_parameter_redefinition(
                    sentence,
                    errors,
                    "references/image/example.md",
                )
                self.assertTrue(any("[I17]" in error for error in errors), errors)

    def test_i17_allows_runtime_owned_s2_pointer(self):
        for sentence in (
            "S2는 선택 모델의 런타임 정의가 실제로 제공하는 축만 쓴다.",
            "S1-legacy는 quality high, S1·S2·S3는 surfaces.md의 표면별 정책을 참조한다.",
            "S2는 런타임 정의를 따른다. S1은 resolution 4k를 쓴다.",
            "| S1·S2·S3 | S1-legacy quality high, 나머지는 surfaces.md 참조 |",
        ):
            with self.subTest(sentence=sentence):
                errors = []
                lint.check_s2_parameter_redefinition(
                    sentence,
                    errors,
                    "references/image/example.md",
                )
                self.assertEqual([], errors)

    def test_i18_requires_single_prompt_graph_canon(self):
        graph = "\n".join((
            "PromptGraphIR/v0",
            "### 3-1. Extract",
            "### 3-2. Resolve",
            "### 3-3. Validate/Assemble",
            "### 3-4. Serialize",
            "### 3-5. Evaluate",
            "PG-SERIALIZE-LEAK",
        ))
        errors = []
        lint.check_prompt_graph_canon({"references/prompt-graph.md": graph}, errors)
        self.assertEqual([], errors)

        errors = []
        lint.check_prompt_graph_canon(
            {
                "references/prompt-graph.md": graph,
                "references/new-public-file.md": "PromptGraphIR/v0",
            },
            errors,
        )
        self.assertTrue(any("[I18]" in error for error in errors), errors)

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
