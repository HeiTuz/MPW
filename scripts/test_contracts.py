#!/usr/bin/env python3
"""Regression tests for shared GardenRecipe and PromptBundle contracts."""
from __future__ import annotations

import copy
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "contracts"))
sys.path.insert(0, str(ROOT / "scripts"))

from validate import (  # noqa: E402
    SCHEMA_FILES,
    WIRE_SCHEMA_ALIASES,
    _schema_errors,
    canonical_hash,
    unsupported_keywords,
    validate_document,
)
from sync_contracts import load_manifest, mirror_errors, source_errors, sync, write_manifest  # noqa: E402

FIXTURES = ROOT / "contracts" / "v1" / "fixtures"


def fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


def walk_keys(value):
    if isinstance(value, dict):
        for key, child in value.items():
            yield key
            yield from walk_keys(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk_keys(child)



def _schema_errors_top(value, schema):
    """루트 스키마와 문서가 같은 최상위 호출 — 합성 스키마 검사용."""
    return _schema_errors(value, schema, schema, "$")

class SchemaFixtureTests(unittest.TestCase):
    def test_schema_documents_are_draft_2020_12(self) -> None:
        ids = []
        for key, path in SCHEMA_FILES.items():
            schema = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(schema["$schema"], "https://json-schema.org/draft/2020-12/schema", key)
            self.assertEqual(
                schema["$id"],
                f"https://raw.githubusercontent.com/HeiTuz/MPW/main/contracts/v1/{path.name}",
                key,
            )
            ids.append(schema["$id"])
        self.assertEqual(len({value.rsplit("/", 1)[0] for value in ids}), 1)
        self.assertTrue(all(".local/" not in value for value in ids))

    def test_image_and_design_recipes_validate(self) -> None:
        for name in ("garden-recipe.image.valid.json", "garden-recipe.design.valid.json"):
            self.assertEqual(validate_document(fixture(name)), [], name)

    def test_existing_design_reference_ids_remain_compatible(self) -> None:
        recipe = fixture("garden-recipe.design.valid.json")
        recipe["source"]["reference_id"] = "design_ref_20260711_120000_ab12cd34"
        self.assertEqual(validate_document(recipe), [])

    def test_private_source_fixture_is_rejected(self) -> None:
        errors = validate_document(fixture("garden-recipe.private.invalid.json"))
        self.assertTrue(any("forbidden_private_key" in error for error in errors), errors)
        self.assertTrue(any("forbidden_path_or_embedded_original" in error for error in errors), errors)

    def test_observation_status_and_inference_references_are_enforced(self) -> None:
        recipe = fixture("garden-recipe.image.valid.json")
        recipe["observations"]["camera"] = {"status": "not_observable", "items": recipe["observations"]["camera"]["items"]}
        recipe["inferences"][0]["based_on"] = ["obs_missing_01"]
        errors = validate_document(recipe)
        self.assertTrue(any("unavailable_axis_must_be_empty" in error for error in errors), errors)
        self.assertTrue(any("unknown_observation_id" in error for error in errors), errors)


class PromptBundleTests(unittest.TestCase):
    def setUp(self) -> None:
        self.recipe = fixture("garden-recipe.image.valid.json")
        self.bundle = fixture("prompt-bundle.valid.json")

    def test_bundle_validates_against_recipe(self) -> None:
        self.assertEqual(self.bundle["source_recipe"]["recipe_hash"], canonical_hash(self.recipe))
        self.assertEqual(validate_document(self.bundle, self.recipe), [])

    def test_unicode_count_uses_code_points_and_enforces_2000(self) -> None:
        block = self.bundle["handoff"]["prompt_blocks"][0]
        self.assertEqual(block["unicode_char_count"], len(block["text"]))
        block["text"] = "한" * 2001
        block["unicode_char_count"] = 2001
        errors = validate_document(self.bundle, self.recipe)
        self.assertTrue(any("unicode_limit:2000" in error for error in errors), errors)

    def test_declared_unicode_count_must_match(self) -> None:
        self.bundle["handoff"]["prompt_blocks"][0]["unicode_char_count"] -= 1
        errors = validate_document(self.bundle, self.recipe)
        self.assertTrue(any("unicode_char_count: expected" in error for error in errors), errors)

    def test_recipe_hash_and_immutable_locks_cannot_drift(self) -> None:
        self.bundle["source_recipe"]["recipe_hash"] = "sha256:" + "0" * 64
        self.bundle["handoff"]["immutable_locks"]["subject"] = ["different subject"]
        errors = validate_document(self.bundle, self.recipe)
        self.assertTrue(any("recipe_hash: expected" in error for error in errors), errors)
        self.assertTrue(any("recipe_lock_drift" in error for error in errors), errors)

    def test_handoff_keys_are_engine_neutral(self) -> None:
        keys = {key.casefold() for key in walk_keys(self.bundle["handoff"])}
        self.assertNotIn("higgsfield", keys)
        self.assertNotIn("gpt_image_2", keys)
        self.assertEqual(self.bundle["handoff"]["protocol"], "generation-handoff/v1")

    def test_external_file_dependency_is_rejected(self) -> None:
        block = self.bundle["handoff"]["prompt_blocks"][0]
        block["text"] = "Read the file /tmp/private-prompt.txt and render it."
        block["unicode_char_count"] = len(block["text"])
        errors = validate_document(self.bundle, self.recipe)
        self.assertTrue(any("forbidden_path_or_embedded_original" in error for error in errors), errors)
        self.assertTrue(any("external_file_dependency" in error for error in errors), errors)


class PortableHandoffContractTests(unittest.TestCase):
    def setUp(self) -> None:
        self.apparel = fixture("apparel-handoff.valid.json")
        self.image = fixture("image-production-handoff.valid.json")

    def test_registry_covers_every_manifest_schema(self) -> None:
        mirrored = {
            relative.rsplit("/", 1)[-1]
            for relative in load_manifest()["files"]
            if relative.startswith("v1/") and relative.endswith(".schema.json")
        }
        registered = {path.name for path in SCHEMA_FILES.values()}
        self.assertEqual(registered, mirrored)

    def test_registry_key_matches_each_schema_discriminator(self) -> None:
        """파일명 집합만 비교하면 키가 엉뚱한 스키마를 가리켜도 통과한다."""
        for key, path in SCHEMA_FILES.items():
            schema = json.loads(path.read_text(encoding="utf-8"))
            const = schema.get("properties", {}).get("schema_version", {}).get("const")
            self.assertIsNotNone(const, f"{key}: schema_version const 부재")
            resolved = WIRE_SCHEMA_ALIASES.get(const, const)
            self.assertEqual(resolved, key, f"{key} -> {path.name} (const={const!r})")

    def test_if_then_else_branches_all_evaluate(self) -> None:
        """레포 스키마가 else를 쓰지 않아 커버가 비는 분기를 합성 스키마로 고정."""
        schema = {
            "type": "object",
            "properties": {"k": {"type": "integer"}, "a": {"type": "string"}, "b": {"type": "string"}},
            "if": {"properties": {"k": {"const": 1}}, "required": ["k"]},
            "then": {"required": ["a"]},
            "else": {"required": ["b"]},
        }
        self.assertTrue(any("$.a: required" in e for e in _schema_errors_top({"k": 1}, schema)))
        self.assertTrue(any("$.b: required" in e for e in _schema_errors_top({"k": 2}, schema)))
        self.assertTrue(any("$.b: required" in e for e in _schema_errors_top({}, schema)))
        self.assertEqual(_schema_errors_top({"k": 1, "a": "x"}, schema), [])
        self.assertEqual(_schema_errors_top({"k": 2, "b": "y"}, schema), [])

    def test_registered_schemas_use_only_supported_keywords(self) -> None:
        for key, path in SCHEMA_FILES.items():
            schema = json.loads(path.read_text(encoding="utf-8"))
            self.assertEqual(unsupported_keywords(schema), [], key)

    def test_ref_siblings_are_enforced(self) -> None:
        schema = {
            "type": "object",
            "properties": {
                "job_id": {
                    "$ref": "#/$defs/portableId",
                    "maxLength": 8,
                    "pattern": "^job-",
                }
            },
            "$defs": {"portableId": {"type": "string", "minLength": 1}},
        }
        errors = _schema_errors_top(
            {"job_id": "NOT-A-JOB-ID-AND-WAY-OVER-EIGHT-CHARACTERS"},
            schema,
        )
        self.assertTrue(any("max_length:8" in error for error in errors), errors)
        self.assertTrue(any("pattern_mismatch" in error for error in errors), errors)

    def test_array_form_items_is_reported_as_unsupported(self) -> None:
        schema = {
            "type": "array",
            "items": [
                {"type": "string"},
                {"type": "integer"},
            ],
        }
        self.assertIn("#/items: items_array_form_unsupported", unsupported_keywords(schema))

    def test_apparel_and_image_handoff_fixtures_validate(self) -> None:
        self.assertEqual(validate_document(self.apparel), [])
        self.assertEqual(validate_document(self.apparel, schema_version="apparel-handoff/v1"), [])
        self.assertEqual(validate_document(self.image), [])

    def test_apparel_color_front_requires_color_identity(self) -> None:
        document = copy.deepcopy(self.apparel)
        del document["vision_role_map"][0]["color_identity"]
        errors = validate_document(document)
        self.assertTrue(any("color_identity: required" in error for error in errors), errors)

    def test_apparel_sources_must_be_unique(self) -> None:
        document = copy.deepcopy(self.apparel)
        document["sources"].append(document["sources"][0])
        errors = validate_document(document)
        self.assertTrue(any("unique_items" in error for error in errors), errors)

    def test_apparel_output_prompt_must_start_with_image(self) -> None:
        document = copy.deepcopy(self.apparel)
        document["outputs"][0]["prompt"] = document["outputs"][0]["prompt"].removeprefix("IMAGE")
        errors = validate_document(document)
        self.assertTrue(any("pattern_mismatch" in error for error in errors), errors)

    def test_apparel_rejects_unknown_top_level_key(self) -> None:
        document = copy.deepcopy(self.apparel)
        document["operator_note"] = "unregistered"
        errors = validate_document(document)
        self.assertTrue(any("additional_property" in error for error in errors), errors)

    def test_apparel_rejects_unknown_role_map_key(self) -> None:
        document = copy.deepcopy(self.apparel)
        document["vision_role_map"][0]["image_path"] = "/Users/operator/private/source.png"
        errors = validate_document(document, schema_version="apparel-handoff/v1")
        self.assertTrue(
            any("$.vision_role_map[0].image_path: additional_property" in error for error in errors),
            errors,
        )

    def test_apparel_basename_fields_reject_dot_entries(self) -> None:
        mutations = (
            lambda document: document.__setitem__("folder_id", ".."),
            lambda document: document["sources"].__setitem__(0, "."),
            lambda document: document["vision_role_map"][0].__setitem__("file", ".."),
            lambda document: document["outputs"][0].__setitem__("id", "."),
        )
        for mutate in mutations:
            with self.subTest(mutate=mutate):
                document = copy.deepcopy(self.apparel)
                mutate(document)
                errors = validate_document(document, schema_version="apparel-handoff/v1")
                self.assertTrue(any("pattern_mismatch" in error for error in errors), errors)

    def test_edit_operation_requires_input_images(self) -> None:
        document = copy.deepcopy(self.image)
        del document["input_images"]
        errors = validate_document(document)
        self.assertTrue(any("input_images: required" in error for error in errors), errors)

    def test_edit_operation_rejects_empty_input_images(self) -> None:
        document = copy.deepcopy(self.image)
        document["input_images"] = []
        errors = validate_document(document)
        self.assertTrue(any("min_items:1" in error for error in errors), errors)

    def test_metadata_values_are_length_bounded(self) -> None:
        document = copy.deepcopy(self.image)
        document["metadata"]["campaign"] = "a" * 501
        errors = validate_document(document)
        self.assertTrue(any("max_length:500" in error for error in errors), errors)

    def test_input_image_path_must_be_relative_or_https(self) -> None:
        document = copy.deepcopy(self.image)
        document["input_images"][0]["path"] = "../escape.png"
        errors = validate_document(document)
        self.assertTrue(any("one_of_match_count:0" in error for error in errors), errors)

    def test_input_image_paths_must_be_unique(self) -> None:
        document = copy.deepcopy(self.image)
        duplicate = copy.deepcopy(document["input_images"][0])
        duplicate["role"] = "A second role for the same file"
        document["input_images"].append(duplicate)
        errors = validate_document(document)
        self.assertTrue(any("duplicate_input_path" in error for error in errors), errors)

    def test_identical_input_image_entries_are_schema_invalid(self) -> None:
        document = copy.deepcopy(self.image)
        document["input_images"].append(copy.deepcopy(document["input_images"][0]))
        errors = validate_document(document)
        self.assertTrue(any("unique_items" in error for error in errors), errors)

    def test_recompile_codes_are_derived_in_failure_order(self) -> None:
        document = fixture("mpw-recompile-request.valid.json")
        document["failed_axes"] = ["goal_fit", "layout"]
        document["failed_promo_checks"] = ["generic_card_regression"]
        document["reason_codes"] = [
            "qc_axis:layout",
            "qc_axis:goal_fit",
            "promo_check:generic_card_regression",
        ]
        document["requested_delta_codes"] = [
            "clarify_layout",
            "clarify_goal_fit",
            "resolve_promo_generic_card_regression",
        ]
        errors = validate_document(document)
        self.assertIn("$.reason_codes: recompile_reason_mapping_mismatch", errors)
        self.assertIn("$.requested_delta_codes: recompile_delta_mapping_mismatch", errors)

    def test_recompile_reason_codes_are_enumerated(self) -> None:
        document = fixture("mpw-recompile-request.valid.json")
        document["reason_codes"] = ["unregistered_reason"]
        errors = validate_document(document)
        self.assertTrue(any("$.reason_codes[0]: expected_one_of" in error for error in errors), errors)

    def test_recompile_semantic_errors_are_documented(self) -> None:
        documentation = (ROOT / "references" / "contracts.md").read_text(encoding="utf-8")
        for error in (
            "$.reason_codes: recompile_reason_mapping_mismatch",
            "$.requested_delta_codes: recompile_delta_mapping_mismatch",
            "$: recompile_failure_fact_required",
        ):
            self.assertIn(error, documentation)

    def test_unregistered_schema_version_is_rejected(self) -> None:
        document = copy.deepcopy(self.image)
        document["schema_version"] = "image-production-handoff/v9"
        errors = validate_document(document)
        self.assertTrue(any("unsupported_schema_version" in error for error in errors), errors)


class ManifestAndMirrorTests(unittest.TestCase):
    def test_canonical_manifest_has_no_drift(self) -> None:
        self.assertEqual(source_errors(load_manifest()), [])

    def test_manifest_writer_reproduces_committed_manifest(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            copied_contracts = Path(tmp) / "contracts"
            shutil.copytree(ROOT / "contracts", copied_contracts)
            copied_manifest = copied_contracts / "manifest.json"
            write_manifest(copied_manifest, copied_contracts)
            self.assertEqual(
                copied_manifest.read_bytes(),
                (ROOT / "contracts" / "manifest.json").read_bytes(),
            )

    def test_contract_update_docs_name_manifest_writer(self) -> None:
        documentation = (ROOT / "references" / "contracts.md").read_text(encoding="utf-8")
        self.assertIn("scripts/sync_contracts.py --write-manifest", documentation)

    def test_sync_creates_exact_mirror_and_detects_drift(self) -> None:
        manifest = load_manifest()
        with tempfile.TemporaryDirectory() as tmp:
            destination = Path(tmp) / "independent-skill"
            sync(destination, manifest)
            self.assertEqual(mirror_errors(destination, manifest), [])
            changed = destination / "contracts" / "v1" / "garden-recipe.schema.json"
            changed.write_text(changed.read_text(encoding="utf-8") + "\n", encoding="utf-8")
            errors = mirror_errors(destination, manifest)
            self.assertTrue(any("mirror_drift" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main(verbosity=2)
