#!/usr/bin/env python3
"""Negative smoke coverage for lint.py documentation and contract invariants."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


LINT_PATH = Path(__file__).with_name("lint.py")
SPEC = importlib.util.spec_from_file_location("heituz_lint", LINT_PATH)
lint = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lint)


class LintInvariantSmokeTests(unittest.TestCase):
    def test_symlinked_script_uses_invoked_payload_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp) / "installed"
            root.mkdir()
            (root / "scripts").symlink_to(LINT_PATH.parent.resolve(), target_is_directory=True)
            spec = importlib.util.spec_from_file_location("linked_lint", root / "scripts/lint.py")
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
            self.assertEqual(root, module.ROOT)


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
            "S1은 quality high, S1·S2·S3는 surfaces.md의 표면별 정책을 참조한다.",
            "S2는 런타임 정의를 따른다. S1은 resolution 4k를 쓴다.",
            "| S1·S2·S3 | S1 quality high, 나머지는 surfaces.md 참조 |",
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

    def test_i19_pins_seed_direct_wrapper_and_version_boundaries(self):
        texts = {
            "references/image/seedream-5-pro.md": (
                "BytePlus ModelArk direct\n"
                "Higgsfield의 `seedream_v5_pro`는 별도 S2 모델 id"
            ),
            "references/image/seedance-2.md": (
                "BytePlus ModelArk direct\n"
                "Higgsfield의 `seedance_2_0`·`seedance_2_0_mini`는 별도 S2 모델 id\n"
                "Seedance 2.5는 이 문서의 별칭이 아니다\n"
                "2.0 규칙, 길이, 미디어 상한을 자동 상속하지 않는다\n"
                "실제 인물 얼굴이 포함된 참조 이미지·영상을 일반 URL/Base64 입력으로 직접 보내지 않는다"
            ),
            "references/image/seedance-2-5.md": (
                "Dreamina 웹의 Seedance 2.5 UI\n"
                "BytePlus ModelArk direct의 모델 id·API 요청 스키마를 증명하지 않으며\n"
                "Seedance 2.0 direct 계약을 2.5로 상속시키지 않는다\n"
                "Higgsfield나 다른 래퍼"
            ),
            "references/image/lanes.md": (
                "ModelArk direct Seedance 2.0의 세부 규칙은 [seedance-2.md](seedance-2.md)를 따르며, Higgsfield나 2.5에 자동 상속하지 않는다"
            ),
            "references/image/surface-evidence.md": (
                "Dreamina 웹 Seedance 2.5 프롬프트 계약\n"
                "Seedance 2.5 ModelArk 모델 id·API 요청 스키마\n"
                "Dreamina UI·2.0 direct 값을 API로 자동 상속 금지"
            ),
        }
        errors = []
        lint.check_seed_engine_boundaries(texts, errors)
        self.assertEqual([], errors)

        reworded = dict(texts)
        reworded["references/image/seedance-2.md"] = reworded["references/image/seedance-2.md"].replace(
            "2.0 규칙, 길이, 미디어 상한을 자동 상속하지 않는다",
            "길이와 미디어 상한을 포함한 2.0 규칙은 2.5로 상속시키지 않는다",
        )
        errors = []
        lint.check_seed_engine_boundaries(reworded, errors)
        self.assertEqual([], errors)

        for phrase in ("2.0 규칙, 길이, 미디어 상한을 자동 상속하지 않는다",):
            texts["references/image/seedance-2.md"] = texts["references/image/seedance-2.md"].replace(phrase, "")
        errors = []
        lint.check_seed_engine_boundaries(texts, errors)
        self.assertTrue(any("[I19]" in error and "no inheritance" in error for error in errors), errors)

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

    def test_i1_allows_installed_host_overlay_entrypoint(self):
        texts = {name: "safe text" for name in lint.CORE_RUNTIME_NAME_FILES}
        texts["SKILL.md"] = "---\nmetadata:\n  host_surface: codex\n---\nCodex host integration"
        errors = []
        lint.check_runtime_names(texts, errors)
        self.assertEqual([], errors)

    def test_i2_ignores_whitelist_sources_omitted_from_installed_payload(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "SKILL.md").write_text("safe\n", encoding="utf-8")
            errors = []
            lint.check_plaintext_paths(root, errors)
        self.assertEqual([], errors)
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

    def test_i20_rejects_backup_artifact_in_published_directory(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "package.json").write_text(
                json.dumps({"files": ["references/**", "!**/*.bak*"]}), encoding="utf-8"
            )
            (root / "references" / "image").mkdir(parents=True)
            (root / "references" / "image" / "director.md").write_text("# canon\n", encoding="utf-8")
            (root / "references" / "image" / "director.md.bak-measured-20260729").write_text("# stale\n", encoding="utf-8")
            (root / "references" / "image" / "notes.md.orig").write_text("# stale\n", encoding="utf-8")
            (root / "references" / "image" / "draft.md~").write_text("# stale\n", encoding="utf-8")
            (root / "references" / "feedback.md").write_text("# canon\n", encoding="utf-8")
            (root / "docs-internal").mkdir()
            (root / "docs-internal" / "notes.md.bak-local").write_text("# private\n", encoding="utf-8")
            errors = []
            lint.check_distribution_artifacts(root, errors)
        self.assertTrue(any("director.md.bak-measured-20260729" in error and "[I20]" in error for error in errors), errors)
        self.assertTrue(any("notes.md.orig" in error for error in errors), errors)
        self.assertTrue(any("draft.md~" in error for error in errors), errors)
        self.assertFalse(any("feedback.md" in error for error in errors), errors)
        self.assertFalse(any("docs-internal" in error for error in errors), errors)

    def test_documentation_scan_includes_references_outside_files(self):
        names = lint.documentation_scan_files(lint.ROOT)
        self.assertIn("SKILL.md", names)
        self.assertIn("references/garden-recipe-compiler.md", names)
        self.assertNotIn("references/garden-recipe-compiler.md", lint.FILES)
        errors = []
        lint.check_labels("references/new-topic.md", "(120자 실측)\n```text\nshort\n```\n", errors)
        self.assertTrue(any("label 120자" in error for error in errors), errors)

    def test_bare_range_label_is_not_measured(self):
        errors = []
        lint.check_labels("references/garden-recipe-compiler.md", "각 블록(각각 1~2000자)\n", errors)
        self.assertEqual([], errors)

    def test_i1_rejects_image_generate_tool_name(self):
        texts = {name: "safe text" for name in lint.CORE_RUNTIME_NAME_FILES}
        texts["references/image/from-image.md"] = "call image_generate now"
        errors = []
        lint.check_runtime_names(texts, errors)
        self.assertTrue(any("image_generate" in error and "[I1]" in error for error in errors), errors)

    def test_i2_rejects_reachable_orphan_whitelist_entry(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references").mkdir()
            (root / "SKILL.md").write_text("[templates](references/templates.md)\n", encoding="utf-8")
            (root / "references" / "templates.md").write_text("# templates\n", encoding="utf-8")
            original = lint.ORPHAN_REFERENCE_WHITELIST
            lint.ORPHAN_REFERENCE_WHITELIST = {"references/templates.md"}
            try:
                errors = []
                lint.check_links_and_orphans(root, errors)
            finally:
                lint.ORPHAN_REFERENCE_WHITELIST = original
        self.assertTrue(any("orphan whitelist entry is now reachable" in error for error in errors), errors)

    def test_i2_docs_internal_only_name_is_unresolved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "SKILL.md").write_text("compiler.md\n", encoding="utf-8")
            (root / "docs-internal").mkdir()
            (root / "docs-internal" / "compiler.md").write_text("# hidden\n", encoding="utf-8")
            errors = []
            lint.check_plaintext_paths(root, errors)
        self.assertTrue(any("broken plaintext path pointer" in error for error in errors), errors)
        self.assertFalse(any("ambiguous" in error for error in errors), errors)

    def test_i2_ambiguous_bare_path_pointer(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "SKILL.md").write_text("compiler.md\n", encoding="utf-8")
            (root / "references").mkdir()
            (root / "examples").mkdir()
            (root / "references" / "compiler.md").write_text("# a\n", encoding="utf-8")
            (root / "examples" / "compiler.md").write_text("# b\n", encoding="utf-8")
            errors = []
            lint.check_plaintext_paths(root, errors)
        self.assertTrue(any("ambiguous bare path pointer" in error for error in errors), errors)

    def test_i11_rejects_schema_enum_cardinality(self):
        errors = []
        lint.check_schema_enum_counts({"references/image/sample.md": "값은 `ar` 5종이다."}, errors)
        self.assertTrue(any("[I11]" in error for error in errors), errors)
        errors = []
        lint.check_schema_enum_counts({"references/image/sample.md": "관측 예시 6종은 이 패턴 밖이다."}, errors)
        self.assertEqual([], errors)

    def test_i21_compares_production_table_and_validator(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references" / "image").mkdir(parents=True)
            (root / "scripts").mkdir()
            (root / "references" / "image" / "production.md").write_text(
                "## 검증기 코드\n\n`input/empty` `length/channel`\n",
                encoding="utf-8",
            )
            (root / "scripts" / "check_prompt.mjs").write_text(
                'const CODE = "input/empty";\nconst OTHER = "copy/unquoted";\n',
                encoding="utf-8",
            )
            errors = []
            lint.check_validator_code_table(root, errors)
        self.assertTrue(any("copy/unquoted" in error for error in errors), errors)
        self.assertTrue(any("length/channel" in error for error in errors), errors)

    def test_i22_matches_retired_token_hash(self):
        digest = lint.token_fingerprint("retiredtoken")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references").mkdir()
            (root / "references" / "note.md").write_text("safe retiredtoken here\n", encoding="utf-8")
            errors = []
            lint.check_retired_name_hashes(root, errors, hashes={digest})
        self.assertTrue(any("[I22]" in error for error in errors), errors)

    def test_i22_normalizes_before_matching_identifier_tokens(self):
        digest = lint.token_fingerprint("sample_identifier")
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "note.md").write_text("ＳＡＭＰＬＥ＿ＩＤＥＮＴＩＦＩＥＲ", encoding="utf-8")
            errors = []
            lint.check_retired_name_hashes(root, errors, hashes={digest})
        self.assertTrue(any("[I22]" in error for error in errors), errors)

    def test_i21_missing_code_table_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references" / "image").mkdir(parents=True)
            (root / "references" / "image" / "production.md").write_text("# Handoff\n", encoding="utf-8")
            errors = []
            lint.check_validator_code_table(root, errors)
        self.assertTrue(any("[I21]" in error for error in errors), errors)

    def test_i21_empty_extractions_fail(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references" / "image").mkdir(parents=True)
            (root / "scripts").mkdir()
            (root / "references" / "image" / "production.md").write_text(
                "## 검증기 코드\n", encoding="utf-8"
            )
            (root / "scripts" / "check_prompt.mjs").write_text("", encoding="utf-8")
            errors = []
            lint.check_validator_code_table(root, errors)
        self.assertTrue(any("[I21]" in error for error in errors), errors)

    def test_i22_empty_configuration_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            errors = []
            lint.check_retired_name_hashes(Path(directory), errors, hashes=set())
        self.assertTrue(any("[I22]" in error for error in errors), errors)

    def test_i22_text_read_error_fails(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "note.md").write_text("sample", encoding="utf-8")
            errors = []
            with patch.object(Path, "read_text", side_effect=PermissionError("denied")):
                lint.check_retired_name_hashes(root, errors, hashes={"0123456789abcdef"})
        self.assertTrue(any("[I22]" in error for error in errors), errors)

    def test_i22_invalid_text_encoding_fails_but_image_bytes_are_excluded(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            note = root / "note.md"
            note.write_bytes(b"\xffsample")
            (root / "photo.jpg").write_bytes(b"\xff\xd8\xff")
            errors = []
            lint.check_retired_name_hashes(root, errors, hashes={"0123456789abcdef"})
            self.assertTrue(any("note.md" in error and "[I22]" in error for error in errors), errors)
            self.assertFalse(any("photo.jpg" in error for error in errors), errors)
            note.unlink()
            errors = []
            lint.check_retired_name_hashes(root, errors, hashes={"0123456789abcdef"})
            self.assertEqual([], errors)

    def test_i22b_allows_soul_layers_and_rejects_catalog_ids(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            image = root / "references" / "image"
            image.mkdir(parents=True)
            layer = "L" + str(3)
            catalog = "C" + str(3)
            (image / "soul-v2-director.md").write_text(f"layer {layer} stays\n", encoding="utf-8")
            (image / "compiler.md").write_text(f"catalog {catalog} row\n", encoding="utf-8")
            errors = []
            lint.check_code_family_shapes(root, errors)
        self.assertTrue(any("compiler.md" in error and catalog in error for error in errors), errors)
        self.assertFalse(any("soul-v2-director.md" in error for error in errors), errors)

    def test_i23_requires_named_anchor_when_file_exists(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "references" / "image").mkdir(parents=True)
            (root / "references" / "image" / "compiler.md").write_text("# old title\n", encoding="utf-8")
            errors = []
            lint.check_named_anchors(root, errors)
        self.assertTrue(any("[I23]" in error and "compiler.md" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
