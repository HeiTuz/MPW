#!/usr/bin/env python3
from __future__ import annotations

import copy
import importlib.util
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("compile_apparel_handoff", ROOT / "scripts" / "compile_apparel_handoff.py")
compiler = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(compiler)
CONTRACT_SPEC = importlib.util.spec_from_file_location("contract_validator", ROOT / "contracts" / "validate.py")
contracts = importlib.util.module_from_spec(CONTRACT_SPEC)
assert CONTRACT_SPEC.loader is not None
CONTRACT_SPEC.loader.exec_module(contracts)


class ApparelHandoffCompilerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.source = self.root / "source"
        self.source.mkdir()
        for name in ("navy-front.png", "navy-back.png", "ivory-front.png", "detail.png"):
            (self.source / name).write_bytes(name.encode())
        self.request = {
            "schema_version": "apparel-compile-request/v1",
            "folder_id": "sku-001",
            "source_folder": str(self.source),
            "sources": ["navy-front.png", "navy-back.png", "ivory-front.png", "detail.png"],
            "vision_role_map": [
                {"file": "navy-front.png", "role": "color_front", "color_identity": "  NAVY  BLUE "},
                {"file": "navy-back.png", "role": "main_back", "color_identity": "navy blue"},
                {"file": "ivory-front.png", "role": "color_front", "color_identity": "ＩＶＯＲＹ"},
                {"file": "detail.png", "role": "fabric_detail", "color_identity": "navy blue"},
            ],
            "requested_outputs": [
                {
                    "id": "navy-front",
                    "filename": "navy-front.png",
                    "view": "front",
                    "cut_type": "ghost_cut",
                    "color_identity": "navy blue",
                    "product_description": "crew-neck knit top",
                    "visible_details": ["ribbed neckline", "centered chest print"],
                },
                {
                    "id": "ivory-front",
                    "filename": "ivory-front.png",
                    "view": "front",
                    "cut_type": "ghost_cut",
                    "color_identity": "ivory",
                    "product_description": "crew-neck knit top",
                    "visible_details": [],
                },
            ],
        }

    def tearDown(self) -> None:
        self.tmp.cleanup()

    def test_cut_type_and_pilot_are_delivered(self):
        self.request["pilot_source"] = "ivory-front.png"
        self.request["requested_outputs"][1]["cut_type"] = "clean_product_cut"
        outputs = compiler.compile_request(self.request)["outputs"]
        self.assertIn("ghost_cut (worn-shape", outputs[0]["prompt"])
        self.assertIn("clean_product_cut (flat or laid", outputs[1]["prompt"])
        for item in outputs:
            self.assertIn("source 3 as the pilot", item["prompt"])
            self.assertIn("shoulder, neck, and hem anchors", item["prompt"])
        self.assertIn("source 1 as the pilot", compiler.compile_request({k:v for k,v in self.request.items() if k != "pilot_source"})["outputs"][0]["prompt"])

    def test_detail_and_back_cannot_own_pilot_anchors(self):
        for source in ("detail.png", "navy-back.png"):
            request = copy.deepcopy(self.request)
            request["pilot_source"] = source
            with self.assertRaisesRegex(compiler.CompileError, "color_front"):
                compiler.compile_request(request)

    def test_missing_cut_and_unknown_fields_fail(self):
        for location in ("request", "output"):
            request = copy.deepcopy(self.request)
            target = request if location == "request" else request["requested_outputs"][0]
            target["identity_lock"] = "KEEP RED LABEL"
            with self.assertRaisesRegex(compiler.CompileError, "unsupported"):
                compiler.compile_request(request)
        request = copy.deepcopy(self.request)
        del request["requested_outputs"][0]["cut_type"]
        with self.assertRaisesRegex(compiler.CompileError, "cut_type"):
            compiler.compile_request(request)
        request = copy.deepcopy(self.request)
        request["pilot_source"] = "unattached.png"
        with self.assertRaisesRegex(compiler.CompileError, "pilot_source"):
            compiler.compile_request(request)

    def test_compiles_complete_portable_handoff(self) -> None:
        result = compiler.compile_request(self.request)
        self.assertEqual(result["normalized_color_identity"], ["navy blue", "ivory"])
        self.assertEqual(result["unique_color_count"], 2)
        self.assertEqual(result["sources"], self.request["sources"])
        self.assertEqual([item["id"] for item in result["outputs"]], ["navy-front", "ivory-front"])
        self.assertTrue(all(item["prompt"].startswith("IMAGE.") for item in result["outputs"]))
        self.assertTrue(all(len(item["prompt"]) <= 2000 for item in result["outputs"]))
        self.assertNotIn(str(self.source), "\n".join(item["prompt"] for item in result["outputs"]))

    def test_preserves_caller_relative_source_folder(self) -> None:
        relative_source = os.path.relpath(self.source, ROOT)
        self.request["source_folder"] = relative_source
        original_cwd = Path.cwd()
        try:
            os.chdir(ROOT)
            result = compiler.compile_request(self.request)
        finally:
            os.chdir(original_cwd)
        self.assertEqual(relative_source, result["source_folder"])
        self.assertFalse(Path(result["source_folder"]).is_absolute())

    def test_compiler_output_passes_apparel_handoff_schema(self) -> None:
        result = compiler.compile_request(self.request)
        self.assertEqual([], contracts.validate_document(result, schema_version="apparel-handoff/v1"))

    def test_generated_prompts_pass_compiled_tier_zero(self) -> None:
        result = compiler.compile_request(self.request)
        checker = ROOT / "scripts" / "check_prompt.mjs"
        for output in result["outputs"]:
            # The portable handoff owns geometry outside the prompt. Add only the
            # compiled checker's required S3 tail so its Tier-0 language checks can
            # exercise the exact generated body without changing the handoff.
            validation_prompt = f'{output["prompt"]} AR 1:1'
            checked = subprocess.run(
                ["node", str(checker), "--profile", "compiled", "--tier", "0", "--surface", "s3"],
                input=validation_prompt,
                text=True,
                capture_output=True,
                check=False,
            )
            report = json.loads(checked.stdout)
            self.assertEqual(0, checked.returncode, report)
            self.assertTrue(report["ok"], report)

    def test_rejects_uppercase_output_extension(self) -> None:
        request = copy.deepcopy(self.request)
        request["requested_outputs"][0]["filename"] = "NAVY-FRONT.PNG"
        with self.assertRaisesRegex(compiler.CompileError, "must end in .png"):
            compiler.compile_request(request)

    def test_rejects_extensionless_stem_the_schema_refuses(self) -> None:
        """A bare '.png' has no stem, so the schema pattern rejects it. The producer
        must refuse it too, or it emits a document the shared validator will not accept."""
        request = copy.deepcopy(self.request)
        request["requested_outputs"][0]["filename"] = ".png"
        with self.assertRaisesRegex(compiler.CompileError, "must end in .png"):
            compiler.compile_request(request)

    def test_duplicate_normalized_front_identity_counts_once(self) -> None:
        duplicate = dict(self.request["vision_role_map"][0])
        duplicate["file"] = "navy-back.png"
        duplicate["color_identity"] = "ＮＡＶＹ\u00a0 BLUE"
        duplicate["role"] = "color_front"
        request = copy.deepcopy(self.request)
        request["vision_role_map"].append(duplicate)
        result = compiler.compile_request(request)
        self.assertEqual(result["unique_color_count"], 2)

    def test_zero_front_colors_fails_blocked(self) -> None:
        request = copy.deepcopy(self.request)
        for row in request["vision_role_map"]:
            row["role"] = "detail"
        with self.assertRaisesRegex(compiler.CompileError, "blocked"):
            compiler.compile_request(request)

    def test_missing_front_identity_fails_closed(self) -> None:
        request = copy.deepcopy(self.request)
        del request["vision_role_map"][0]["color_identity"]
        with self.assertRaisesRegex(compiler.CompileError, "explicit color_identity"):
            compiler.compile_request(request)

    def test_unknown_role_map_fields_fail_closed(self) -> None:
        request = copy.deepcopy(self.request)
        request["vision_role_map"][0]["raw_caption"] = "private source caption"
        with self.assertRaisesRegex(compiler.CompileError, "unsupported fields: raw_caption"):
            compiler.compile_request(request)

    def test_role_map_does_not_infer_identity_from_filename(self) -> None:
        request = copy.deepcopy(self.request)
        request["vision_role_map"] = [{"file": "navy-front.png", "role": "color_front"}]
        with self.assertRaises(compiler.CompileError):
            compiler.compile_request(request)

    def test_missing_inventory_source_fails_closed(self) -> None:
        request = copy.deepcopy(self.request)
        request["sources"].append("missing-front.png")
        with self.assertRaisesRegex(compiler.CompileError, "missing inventory source"):
            compiler.compile_request(request)

    def test_role_map_source_must_be_in_complete_inventory(self) -> None:
        request = copy.deepcopy(self.request)
        request["sources"].remove("detail.png")
        with self.assertRaisesRegex(compiler.CompileError, "missing from inventory"):
            compiler.compile_request(request)

    def test_overlong_prompt_fails_closed(self) -> None:
        request = copy.deepcopy(self.request)
        request["requested_outputs"][0]["product_description"] = "x" * 2000
        with self.assertRaisesRegex(compiler.CompileError, "self_contained_prompt_overflow"):
            compiler.compile_request(request)

    def test_published_fixture_and_schema_are_well_formed(self) -> None:
        schema = json.loads((ROOT / "contracts" / "v1" / "apparel-handoff.schema.json").read_text(encoding="utf-8"))
        fixture = json.loads((ROOT / "contracts" / "v1" / "fixtures" / "apparel-handoff.valid.json").read_text(encoding="utf-8"))
        self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema")
        self.assertEqual(fixture["schema_version"], 1)
        self.assertEqual(fixture["unique_color_count"], len(fixture["normalized_color_identity"]))
        self.assertTrue(all(len(item["prompt"]) <= 2000 for item in fixture["outputs"]))


if __name__ == "__main__":
    unittest.main()
