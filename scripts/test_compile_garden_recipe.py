#!/usr/bin/env python3
from __future__ import annotations

import copy
import contextlib
import importlib.util
import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = Path(os.environ.get("MASTER_PROMPT_CONTRACT_ROOT", ROOT / "contracts"))
FIXTURE = CONTRACT_ROOT / "v1" / "fixtures" / "garden-recipe.image.valid.json"
DESIGN_FIXTURE = CONTRACT_ROOT / "v1" / "fixtures" / "garden-recipe.design.valid.json"


def load_module(path: Path, name: str):
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class CompileGardenRecipeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not FIXTURE.is_file() or not DESIGN_FIXTURE.is_file():
            raise RuntimeError("authoritative contracts missing; sync contracts/ or set MASTER_PROMPT_CONTRACT_ROOT")
        cls.compiler = load_module(ROOT / "scripts" / "compile_garden_recipe.py", "recipe_compiler")
        cls.contracts = load_module(CONTRACT_ROOT / "validate.py", "contract_validator")
        cls.recipe = json.loads(FIXTURE.read_text(encoding="utf-8"))

    def test_compiles_valid_recipe_to_schema_valid_bundle(self) -> None:
        bundle = self.compiler.compile_recipe(copy.deepcopy(self.recipe))
        self.assertEqual([], self.contracts.validate_document(bundle, self.recipe))
        handoff = bundle["handoff"]
        self.assertEqual(self.recipe["locks"], handoff["immutable_locks"])
        self.assertEqual(self.recipe["exclusions"], handoff["negative_constraints"])
        self.assertEqual([], handoff["variable_axes"])
        self.assertTrue(handoff["reference_requirements"])
        self.assertTrue(handoff["qc_acceptance_criteria"])
        text = handoff["prompt_blocks"][0]["text"]
        self.assertNotIn("[프리셋:", text)
        self.assertNotIn("비율", text)
        self.assertNotIn("UI에서 선택/업로드", text)
        self.assertNotIn("Exclude:", text)
        self.assertNotIn("\n", text)
        # This handoff has no palette execution parameter, so the prompt carries it.
        self.assertIn("Palette: #C7B7A4.", text)
        self.assertIn("only source-supported marks", text)

    def test_higgsfield_does_not_inject_unrequested_aesthetic_tokens(self) -> None:
        for category in ("photo_editorial", "product_reference"):
            with self.subTest(category=category):
                recipe = copy.deepcopy(self.recipe)
                recipe["category"] = category
                text = self.compiler.compile_recipe(recipe)["handoff"]["prompt_blocks"][0]["text"]
                for token in ("natural skin texture", "visible pores", "film grain", "natural material texture", "contact shadows"):
                    self.assertNotIn(token, text)
                requested = "Use visible pores, subtle film grain, and coherent contact shadows."
                recipe["intended_use"]["goal"] += " " + requested
                text = self.compiler.compile_recipe(recipe)["handoff"]["prompt_blocks"][0]["text"]
                self.assertIn(requested, text)

    def test_higgsfield_renderer_preserves_distinct_explicit_palettes(self) -> None:
        palettes = (("#a1B2c3", "#445566"), ("#99AaBB", "#CcDdEe"))
        prompts: list[str] = []
        for values in palettes:
            with self.subTest(palette=values):
                recipe = copy.deepcopy(self.recipe)
                recipe["intended_use"]["engine"] = "higgsfield"
                evidence = recipe["observations"]["palette"]["items"][0]
                recipe["observations"]["palette"]["items"] = [
                    {**evidence, "observation_id": f"obs_palette_{index:02d}",
                     "value": value, "basis": "user_supplied"}
                    for index, value in enumerate(values, start=1)
                ]
                bundle = self.compiler.compile_recipe(recipe)
                self.assertEqual([], self.contracts.validate_document(bundle, recipe))
                block = bundle["handoff"]["prompt_blocks"][0]
                text = block["text"]
                self.assertIn(f"Palette: {'; '.join(values)}.", text)
                for value in values:
                    self.assertEqual(text.count(value), 1)
                self.assertEqual(block["unicode_char_count"], len(text))
                prompts.append(text)
        self.assertNotEqual(prompts[0], prompts[1])



    def test_design_recipe_routes_from_intended_use(self) -> None:
        recipe = json.loads(DESIGN_FIXTURE.read_text(encoding="utf-8"))
        bundle = self.compiler.compile_recipe(recipe)
        self.assertEqual([], self.contracts.validate_document(bundle, recipe))
        self.assertEqual("DESIGN", bundle["handoff"]["mode"])
        self.assertEqual("frontend-agent", bundle["handoff"]["engine"])
        self.assertEqual([], bundle["handoff"]["variable_axes"])
        text = bundle["handoff"]["prompt_blocks"][0]["text"]
        self.assertIn("Visual thesis:", text)
        self.assertIn("Reference decomposition:", text)
        self.assertIn("Viewport QC:", text)
        self.assertIn("Qualified layout tokens: twelve-column content grid", text)



    def test_composite_renderer_applies_preservation_gate(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["category"] = "composite_reference"
        recipe["intended_use"] = {
            "mode": "IMAGE_COMPOSITE",
            "engine": "generic-image",
            "goal": "Replace only the background with a quiet studio environment.",
        }
        pixel_lock = "every source subject pixel remains byte-for-byte unchanged"
        recipe["locks"]["subject"].append(pixel_lock)
        bundle = self.compiler.compile_recipe(recipe)
        self.assertEqual([], self.contracts.validate_document(bundle, recipe))
        text = bundle["handoff"]["prompt_blocks"][0]["text"]
        self.assertIn("PIXEL-BOUND COMPOSITE", text)
        self.assertIn("locked photographic plate", text)
        self.assertIn("coordinates stay 1:1", text)
        self.assertIn(recipe["intended_use"]["goal"], text)
        self.assertIn(pixel_lock, text)
        self.assertEqual(recipe["locks"], bundle["handoff"]["immutable_locks"])
        for inserted_permission in ("dial B", "±0.3", "≤0.2", "≤200K", "≥0.75", "unify subject/background grain"):
            self.assertNotIn(inserted_permission, text)
        self.assertIn("adapt only generated background", text)
        self.assertIn("FINAL INTENT:", text)
        self.assertIn("FAIL if", text)


    def test_gpt_image_renderer_preserves_requested_palette_without_inventing_colors(self) -> None:
        for mode in ("IMAGE", "IMAGE_COMPOSITE"):
            for palette in ("warm beige", "#C7B7A4", "#000000 #FFFFFF", "#111111 #222222 #333333 #444444 #555555 #666666"):
                with self.subTest(mode=mode, palette=palette):
                    recipe = copy.deepcopy(self.recipe)
                    recipe["intended_use"].update(engine="gpt-image-2", mode=mode)
                    recipe["observations"]["palette"]["items"][0]["value"] = palette
                    bundle = self.compiler.compile_recipe(recipe)
                    self.assertEqual([], self.contracts.validate_document(bundle, recipe))
                    text = bundle["handoff"]["prompt_blocks"][0]["text"]
                    self.assertIn(f"Palette: {palette}.", text)
                    self.assertEqual(text.count("#"), palette.count("#"))
                    self.assertNotIn("AR", text)
                    self.assertNotIn("Exclude:", text)

    def test_unresolved_required_inputs_block_compilation_with_actionable_reason(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        for code in ("exact_copy", "brand_text", "licensed_phrase", "missing_source_fact"):
            recipe["unresolved_inputs"] = [{
                "code": code,
                "slot": "headline",
                "source_reference_id": recipe["source"]["reference_id"],
                "required": True,
            }]
            with self.subTest(code=code):
                self.assertEqual([], self.contracts.validate_document(recipe))
                with self.assertRaises(self.compiler.CompileError) as failure:
                    self.compiler.compile_recipe(recipe)
                message = str(failure.exception)
                for detail in ("garden_recipe_not_ready", "required_input_unresolved", code, "headline", recipe["source"]["reference_id"]):
                    self.assertIn(detail, message)
        recipe["unresolved_inputs"] = []
        self.assertEqual([], self.contracts.validate_document(self.compiler.compile_recipe(recipe), recipe))

    def test_unresolved_cli_does_not_replace_an_existing_bundle(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["unresolved_inputs"] = [{
            "code": "exact_copy", "slot": "headline",
            "source_reference_id": recipe["source"]["reference_id"], "required": True,
        }]
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "recipe.json"
            output = Path(directory) / "bundle.json"
            source.write_text(json.dumps(recipe), encoding="utf-8")
            previous = json.dumps(self.compiler.compile_recipe(self.recipe), ensure_ascii=False)
            output.write_text(previous, encoding="utf-8")
            stderr = io.StringIO()
            with contextlib.redirect_stderr(stderr):
                result = self.compiler.main([str(source), "--output", str(output)])
            self.assertEqual(result, 1)
            self.assertIn("required_input_unresolved", stderr.getvalue())
            self.assertEqual(output.read_text(encoding="utf-8"), previous)

    def test_mode_engine_compatibility_matrix(self) -> None:
        valid = (
            ("DESIGN", "frontend-agent"),
            ("IMAGE", "gpt-image-2"),
            ("IMAGE_COMPOSITE", "higgsfield"),
            ("IMAGE", "generic-image"),
        )
        invalid = (
            ("DESIGN", "gpt-image-2"),
            ("DESIGN", "higgsfield"),
            ("DESIGN", "generic-image"),
            ("IMAGE", "frontend-agent"),
            ("IMAGE_COMPOSITE", "frontend-agent"),
        )
        for mode, engine in valid:
            with self.subTest(mode=mode, engine=engine, valid=True):
                recipe = copy.deepcopy(self.recipe)
                recipe["intended_use"].update(mode=mode, engine=engine)
                self.assertFalse(
                    any("incompatible_mode_engine" in error for error in self.contracts.validate_document(recipe))
                )
        for mode, engine in invalid:
            with self.subTest(mode=mode, engine=engine, valid=False):
                recipe = copy.deepcopy(self.recipe)
                recipe["intended_use"].update(mode=mode, engine=engine)
                errors = self.contracts.validate_document(recipe)
                self.assertIn("$.intended_use: incompatible_mode_engine", errors)

    def test_contract_root_override_is_documented(self) -> None:
        documentation = (ROOT / "references" / "garden-recipe-compiler.md").read_text(encoding="utf-8")
        self.assertIn("MASTER_PROMPT_CONTRACT_ROOT", documentation)
        self.assertIn("sync_contracts.py --dest", documentation)

    def test_low_confidence_valid_inference_is_not_dropped(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["inferences"][0]["confidence"] = 0.01
        claim = recipe["inferences"][0]["claim"]
        text = self.compiler.compile_recipe(recipe)["handoff"]["prompt_blocks"][0]["text"]
        self.assertIn(claim, text)

    def test_unicode_count_uses_code_points_and_stays_within_limit(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["intended_use"]["goal"] = "Create a quiet portrait 🎞️ with 한글 direction."
        block = self.compiler.compile_recipe(recipe)["handoff"]["prompt_blocks"][0]
        self.assertEqual(len(block["text"]), block["unicode_char_count"])
        self.assertLessEqual(block["unicode_char_count"], 2000)

    def test_rejects_contract_invalid_compiled_bundle(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["intended_use"]["goal"] = "Read the file for the requested portrait direction."
        with self.assertRaisesRegex(
            self.compiler.CompileError,
            "prompt_bundle_validation_failed:.*external_file_dependency",
        ):
            self.compiler.compile_recipe(recipe)

    def test_rejects_unvalidated_legacy_payload(self) -> None:
        with self.assertRaisesRegex(self.compiler.CompileError, "garden_recipe_validation_failed"):
            self.compiler.compile_recipe({"prompt": "legacy raw analysis"})

    def test_rejects_lock_drift_and_overflow(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["locks"]["subject"] = []
        with self.assertRaisesRegex(self.compiler.CompileError, "garden_recipe_validation_failed"):
            self.compiler.compile_recipe(recipe)

        recipe = copy.deepcopy(self.recipe)
        recipe["intended_use"]["goal"] = "가" * 1000
        recipe["locks"]["subject"] = ["나" * 500]
        recipe["exclusions"] = ["watermark"]
        with self.assertRaisesRegex(self.compiler.CompileError, "self_contained_prompt_overflow"):
            self.compiler.compile_recipe(recipe)

    def test_positive_lane_rejects_untranslatable_exclusion(self) -> None:
        for exclusion in ("sentinel forbidden artifact", "logo composition variations"):
            recipe = copy.deepcopy(self.recipe)
            recipe["exclusions"] = [exclusion]
            with self.assertRaisesRegex(self.compiler.CompileError, "untranslatable_positive_exclusion"):
                self.compiler.compile_recipe(recipe)

    def test_positive_exclusions_preserve_source_branding_and_identity(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["locks"] = {
            "identity": ["preserve the original source identity"],
            "subject": ["one supplied product bottle", "preserve the original ACME logo and lettering"],
        }
        for exclusion in ("invented logos", "new logos", "additional brand marks", "extra logos"):
            with self.subTest(exclusion=exclusion):
                recipe["exclusions"] = [exclusion, "identity drift"]
                bundle = self.compiler.compile_recipe(recipe)
                text = bundle["handoff"]["prompt_blocks"][0]["text"]
                self.assertEqual(recipe["locks"], bundle["handoff"]["immutable_locks"])
                self.assertEqual(recipe["exclusions"], bundle["handoff"]["negative_constraints"])
                self.assertIn("preserve the original ACME logo and lettering", text)
                self.assertIn("only source-supported marks", text)
                self.assertIn("same source identity", text)
                self.assertNotIn("unbranded", text)
                self.assertNotIn("fictional", text)

        recipe["locks"]["subject"] = ["one unbranded product bottle"]
        recipe["exclusions"] = ["all logos"]
        text = self.compiler.compile_recipe(recipe)["handoff"]["prompt_blocks"][0]["text"]
        self.assertIn("all visible surfaces have an unbranded clean finish", text)

    def test_prompt_knowledge_addition_ban_preserves_existing_source_marks(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["locks"]["subject"] = [
            "one supplied product bottle",
            "preserve the original ACME logo, branding, and source watermark",
        ]
        recipe["exclusions"] = ["Do not add logos, brands, or watermarks."]
        for mode, engine in (
            ("IMAGE", "gpt-image-2"),
            ("IMAGE", "higgsfield"),
            ("IMAGE", "generic-image"),
            ("IMAGE_COMPOSITE", "generic-image"),
        ):
            with self.subTest(mode=mode, engine=engine):
                recipe["intended_use"].update(mode=mode, engine=engine)
                bundle = self.compiler.compile_recipe(recipe)
                self.assertEqual([], self.contracts.validate_document(bundle, recipe))
                handoff = bundle["handoff"]
                text = handoff["prompt_blocks"][0]["text"]
                self.assertEqual(recipe["locks"], handoff["immutable_locks"])
                self.assertEqual(recipe["exclusions"], handoff["negative_constraints"])
                self.assertIn(recipe["locks"]["subject"][1], text)
                self.assertIn("logos, branding, and watermarks match the source exactly", text)
                self.assertIn("only source-supported marks", text)
                self.assertNotIn("unbranded", text)
                self.assertNotIn("watermark-free", text)

    def test_legacy_bridge_adapter_preserves_blocks(self) -> None:
        recipe = copy.deepcopy(self.recipe)
        recipe["exclusions"] = ["watermark"]
        bundle = self.compiler.compile_recipe(recipe)
        legacy = self.compiler.legacy_bridge_bundle(bundle)
        self.assertEqual("MPW", legacy["compiled_by"])
        self.assertEqual(
            [block["text"] for block in bundle["handoff"]["prompt_blocks"]],
            [block["text"] for block in legacy["blocks"]],
        )
        self.assertIn("clean watermark-free finish", legacy["blocks"][0]["text"])

    def test_cli_emits_machine_readable_failure(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "legacy.json"
            path.write_text('{"prompt":"raw"}', encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts" / "compile_garden_recipe.py"), str(path)],
                cwd=ROOT,
                env={**os.environ, "MASTER_PROMPT_CONTRACT_ROOT": str(CONTRACT_ROOT)},
                capture_output=True,
                text=True,
                check=False,
            )
        self.assertEqual(1, result.returncode)
        self.assertIn("garden_recipe_validation_failed", result.stderr)


if __name__ == "__main__":
    unittest.main()
