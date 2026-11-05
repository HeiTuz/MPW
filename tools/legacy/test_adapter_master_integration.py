#!/usr/bin/env python3
"""Unsupported legacy cross-repository diagnostic, not an MPW release gate.

Requires all four original external repositories. This historical harness is
retained for manual investigation only, is not distributed with the plugin,
and makes no compatibility promise for the retired integrations. Missing
sources are always errors; the former opt-out variable is no longer honored.
"""
from __future__ import annotations

import importlib.util
import json
import os
import re
import subprocess
import sys
import unittest
from pathlib import Path
from typing import Any
from unittest.mock import patch

MASTER_ROOT = Path(__file__).resolve().parents[2]


def skill_root(env_name: str) -> Path:
    """Resolve a companion root only from an explicit environment input."""
    configured = os.environ.get(env_name)
    if configured:
        return Path(configured)
    return MASTER_ROOT / ".external-integration-unconfigured" / env_name


IMAGE_ROOT = skill_root("IMAGE_REFERENCE_ADAPTER_ROOT")
DESIGN_ROOT = skill_root("DESIGN_REFERENCE_ADAPTER_ROOT")
# The per-skill loop module kept its old name in some installs.
LOOP_FILENAMES = ("gardener_loop.py", "adapter_loop.py")


def loop_path(root: Path) -> Path:
    return next(
        (root / "scripts" / name for name in LOOP_FILENAMES if (root / "scripts" / name).is_file()),
        root / "scripts" / LOOP_FILENAMES[0],
    )
BRIDGE_ROOT = skill_root("HIGGSFIELD_BRIDGE_ROOT")
# The prompt-knowledge gardener carries the same contract mirror but has no
# loop module: its analysis-to-recipe assembler lives in the skill script.
PROMPT_KNOWLEDGE_ROOT = skill_root("PROMPT_KNOWLEDGE_ADAPTER_ROOT")
PROMPT_KNOWLEDGE_SCRIPT = "scripts/prompt_knowledge_garden.py"
CONTRACT_ROOT = Path(os.environ.get("MASTER_PROMPT_CONTRACT_ROOT", MASTER_ROOT / "contracts"))
COMPILER_ROOT = Path(os.environ.get("MASTER_PROMPT_COMPILER_ROOT", MASTER_ROOT))
# Intended pre-wash companion paths. Each pair must still appear until WU-D
# rewrites the companion; unused pairs fail as stale.
COMPANION_POINTER_ALLOWLIST: set[tuple[str, str]] = {
    ("scripts/image_reference_garden.py", "references/image/editorial/photo-vocab.md"),
    ("references/gardener.md", "references/image/editorial/photo-vocab.md"),
}


def external_dependency_paths() -> tuple[Path, ...]:
    return (
        loop_path(IMAGE_ROOT),
        loop_path(DESIGN_ROOT),
        BRIDGE_ROOT / "scripts/higgsfield_job.py",
        PROMPT_KNOWLEDGE_ROOT / PROMPT_KNOWLEDGE_SCRIPT,
    )


EXTERNAL_ROOT_ENV = (
    "IMAGE_REFERENCE_ADAPTER_ROOT",
    "DESIGN_REFERENCE_ADAPTER_ROOT",
    "HIGGSFIELD_BRIDGE_ROOT",
    "PROMPT_KNOWLEDGE_ADAPTER_ROOT",
)


def external_dependencies_available() -> bool:
    """Require every explicitly configured legacy source, without an opt-out."""
    unconfigured = [name for name in EXTERNAL_ROOT_ENV if not os.environ.get(name)]
    missing = [str(path) for path in external_dependency_paths() if not path.is_file()]
    if unconfigured or missing:
        details = []
        if unconfigured:
            details.append("unset root variables: " + ", ".join(unconfigured))
        if missing:
            details.append("missing files: " + ", ".join(missing))
        raise RuntimeError(
            "unsupported legacy external integration dependencies missing; "
            "configure all four root environment variables. " + "; ".join(details)
        )
    return True


def load_module(name: str, path: Path) -> Any:
    spec = importlib.util.spec_from_file_location(name, path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load integration module: {name}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AdapterMasterIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        external_dependencies_available()
        required = [
            CONTRACT_ROOT / "validate.py",
            CONTRACT_ROOT / "v1/fixtures/garden-recipe.image.valid.json",
            CONTRACT_ROOT / "v1/fixtures/garden-recipe.design.valid.json",
            COMPILER_ROOT / "scripts/compile_garden_recipe.py",
            *external_dependency_paths(),
        ]
        missing = [str(path) for path in required if not path.is_file()]
        if missing:
            raise RuntimeError("integration dependencies missing: " + ", ".join(missing))
        os.environ["MASTER_PROMPT_CONTRACT_ROOT"] = str(CONTRACT_ROOT)
        cls.contracts = load_module("integration_contracts", CONTRACT_ROOT / "validate.py")
        cls.compiler = load_module("integration_compiler", COMPILER_ROOT / "scripts/compile_garden_recipe.py")
        cls.image_loop = load_module("integration_image_loop", loop_path(IMAGE_ROOT))
        cls.design_loop = load_module("integration_design_loop", loop_path(DESIGN_ROOT))
        cls.bridge = load_module("integration_higgsfield_bridge", BRIDGE_ROOT / "scripts/higgsfield_job.py")
        cls.prompt_knowledge = load_module(
            "integration_prompt_knowledge", PROMPT_KNOWLEDGE_ROOT / PROMPT_KNOWLEDGE_SCRIPT
        )
        cls.image_recipe = json.loads((CONTRACT_ROOT / "v1/fixtures/garden-recipe.image.valid.json").read_text(encoding="utf-8"))
        cls.design_recipe = json.loads((CONTRACT_ROOT / "v1/fixtures/garden-recipe.design.valid.json").read_text(encoding="utf-8"))

    def test_canonical_recipes_cross_adapter_validation_boundary(self) -> None:
        self.assertEqual([], self.image_loop.recipe_contract_errors(
            self.image_recipe,
            reference_id=self.image_recipe["source"]["reference_id"],
            lane="photo_editorial",
        ))
        self.assertEqual([], self.design_loop.recipe_contract_errors(
            self.design_recipe,
            reference_id=self.design_recipe["source"]["reference_id"],
            lane="ui_layout",
        ))

    def test_machine_handoff_carries_complete_private_recipe(self) -> None:
        handoff = self.image_loop.build_compile_handoff(
            self.image_recipe,
            reference_id=self.image_recipe["source"]["reference_id"],
            lane="photo_editorial",
            now=__import__("datetime").datetime(2026, 7, 11, tzinfo=__import__("datetime").timezone.utc),
        )
        self.assertEqual(self.image_recipe, handoff.get("garden_recipe"))
        self.assertEqual([], self.image_loop.privacy_errors(handoff))

    def test_compile_bundle_and_legacy_bridge_remain_compatible(self) -> None:
        bundle = self.compiler.compile_recipe(self.image_recipe)
        self.assertEqual([], self.contracts.validate_document(bundle, self.image_recipe))
        self.assertEqual(self.image_recipe["locks"], bundle["handoff"]["immutable_locks"])
        self.assertTrue(all(len(block["text"]) <= 2000 for block in bundle["handoff"]["prompt_blocks"]))
        legacy = self.compiler.legacy_bridge_bundle(bundle)
        job = {
            "schema_version": "higgsfield-job/v1",
            "mode": "prompt_only",
            "intent": {"goal": self.image_recipe["intended_use"]["goal"], "lane": "photo_still"},
            "executor": {"kind": "web_ui", "target": "higgsfield_web"},
            "payload_kind": "compiled_prompt",
            "prompt_bundle": legacy,
            "media": [],
        }
        self.assertEqual([], self.bridge.schema_errors(job))

    def test_prompt_knowledge_recipe_compiles_and_keeps_token_provenance(self) -> None:
        """The prompt-knowledge gardener assembles recipes too, so its output
        has to clear the same contract and compiler the image lane does."""
        fixture = (
            PROMPT_KNOWLEDGE_ROOT
            / "scripts/fixtures/prompt-knowledge-analysis/image-doctrine.expected.json"
        )
        analysis = json.loads(fixture.read_text(encoding="utf-8"))
        recipe = self.prompt_knowledge.build_garden_recipe(analysis)
        self.assertEqual([], self.contracts.validate_document(recipe))

        observation_ids = {
            item["observation_id"]
            for axis in recipe["observations"].values()
            for item in axis.get("items", [])
        }
        cited = [token for token in recipe["qualified_tokens"] if "source_ref" in token]
        self.assertTrue(cited, "the fixture must exercise the provenance handoff")
        for token in cited:
            self.assertIn(token["status"], {"explicit", "derived"})
            self.assertTrue(set(token["source_ref"]) <= observation_ids)

        bundle = self.compiler.compile_recipe(recipe)
        self.assertEqual([], self.contracts.validate_document(bundle, recipe))

    def test_feedback_is_explicit_scoped_and_proposal_only(self) -> None:
        module = self.image_loop
        now = __import__("datetime").datetime(2026, 7, 11, tzinfo=__import__("datetime").timezone.utc)
        event = module.build_source_feedback(
            reference_id=self.image_recipe["source"]["reference_id"],
            analysis_id=self.image_recipe["source"]["reference_id"],
            scope="image_reference",
            decision="accept_evidence",
            reason_codes=["evidence_confirmed"],
            field_pointers=[],
            now=now,
        )
        self.assertEqual("accept_evidence", event["decision"])
        candidates = module.feedback_candidates([event], lane="image_reference")
        self.assertEqual(1, len(candidates))
        self.assertEqual({
            "feedback_id": event["feedback_id"],
            "reference_id": self.image_recipe["source"]["reference_id"],
            "analysis_id": self.image_recipe["source"]["reference_id"],
            "decision": "accept_evidence",
            "reason_codes": ["evidence_confirmed"],
            "field_pointers": [],
            "status": "source_fact_only",
        }, candidates[0])
        with self.assertRaisesRegex(ValueError, "path_or_url_forbidden"):
            module.build_source_feedback(
                reference_id=self.image_recipe["source"]["reference_id"],
                analysis_id="/Users/private/original.jpg",
                scope="image_reference",
                decision="accept_evidence",
                reason_codes=["evidence_confirmed"],
                field_pointers=[],
                now=now,
            )

    def test_companion_pointers_into_mpw_resolve(self) -> None:
        pointer = re.compile(
            r"(?:MPW/)?references/(?:image|templates)/[\w./-]+\.md|MPW/references/[\w./-]+\.md"
        )
        allowed = COMPANION_POINTER_ALLOWLIST
        seen: set[tuple[str, str]] = set()
        failures: list[str] = []
        roots = {
            "image": IMAGE_ROOT,
            "design": DESIGN_ROOT,
            "bridge": BRIDGE_ROOT,
            "prompt-knowledge": PROMPT_KNOWLEDGE_ROOT,
        }
        for label, companion in roots.items():
            listed = subprocess.run(
                ["git", "ls-files"],
                cwd=companion,
                capture_output=True,
                text=True,
                check=False,
            )
            if listed.returncode != 0:
                failures.append(f"{label}: git ls-files failed")
                continue
            for rel in listed.stdout.splitlines():
                if Path(rel).name.startswith("test_") and rel.endswith(".py"):
                    continue
                if not rel.endswith((".md", ".json", ".txt", ".mjs", ".py")):
                    continue
                path = companion / rel
                if not path.is_file():
                    continue
                try:
                    text = path.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    continue
                for line_no, line in enumerate(text.splitlines(), start=1):
                    for match in pointer.finditer(line):
                        target = match.group(0)
                        if target.startswith("MPW/"):
                            target = target[len("MPW/"):]
                        local = (companion / target).resolve()
                        try:
                            local.relative_to(companion.resolve())
                        except ValueError:
                            local_ok = False
                        else:
                            local_ok = local.is_file()
                        if local_ok:
                            continue
                        key = (rel, target)
                        seen.add(key)
                        if key in allowed:
                            continue
                        dest = MASTER_ROOT / target
                        if not dest.is_file():
                            failures.append(f"{label}:{rel}:{line_no} -> {target}")
        stale = sorted(allowed - seen)
        for source, target in stale:
            failures.append(f"stale companion pointer allowlist: {source} -> {target}")
        self.assertEqual([], failures)

    def test_editorial_dictionary_has_eight_sections(self) -> None:
        garden_path = IMAGE_ROOT / "scripts" / "image_reference_garden.py"
        with patch.dict(sys.modules, {"gardener_loop": self.image_loop}):
            garden = load_module("integration_editorial_dictionary", garden_path)
        entries, source = garden.load_editorial_dictionary(IMAGE_ROOT, str(MASTER_ROOT))
        self.assertEqual(
            str(MASTER_ROOT / "references/image/editorial/photo-results.md"), source
        )
        required = {
            "depth_lens",
            "lighting",
            "film_stock",
            "technique",
            "emotional_preset",
            "composition",
            "material_finish",
            "genre_combo",
        }
        counts: dict[str, int] = {key: 0 for key in required}
        for entry in entries:
            section = str(entry.get("section") or "")
            if section in counts:
                counts[section] += 1
        missing = sorted(key for key, count in counts.items() if count < 1)
        self.assertEqual([], missing, f"editorial dictionary sections without entries: {counts}")


class ExternalDependencyPolicyTests(unittest.TestCase):
    """Boundary checks need no external sources and make no compatibility claim."""

    def dependency_check(
        self, overrides: dict[str, str], args: tuple[str, ...] = ("--dependency-check-only",)
    ) -> subprocess.CompletedProcess:
        env = os.environ.copy()
        for name in (*EXTERNAL_ROOT_ENV, "MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION"):
            env.pop(name, None)
        env.update(overrides)
        return subprocess.run(
            [sys.executable, __file__, *args],
            env=env, capture_output=True, text=True, check=False,
        )

    def assert_missing_dependencies(self, result: subprocess.CompletedProcess) -> None:
        self.assertNotEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("UNSUPPORTED LEGACY DIAGNOSTIC", result.stderr)
        self.assertIn("external integration dependencies missing", result.stderr)
        self.assertNotIn("NOT RUN", result.stdout + result.stderr)

    def test_missing_roots_fail(self) -> None:
        result = self.dependency_check({})
        self.assert_missing_dependencies(result)
        for name in EXTERNAL_ROOT_ENV:
            self.assertIn(name, result.stderr)

    def test_relocated_harness_resolves_authoritative_core(self) -> None:
        self.assertTrue((MASTER_ROOT / "contracts/validate.py").is_file())
        self.assertTrue((MASTER_ROOT / "scripts/compile_garden_recipe.py").is_file())

    def test_integration_setup_cannot_turn_missing_roots_into_a_skip(self) -> None:
        result = self.dependency_check(
            {"MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION": "1"}, ("AdapterMasterIntegrationTests",)
        )
        self.assert_missing_dependencies(result)
        self.assertIn("FAILED (errors=1)", result.stderr)
        self.assertNotIn("skipped", result.stderr)

    def test_old_opt_out_does_not_suppress_missing_roots(self) -> None:
        result = self.dependency_check({"MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION": "1"})
        self.assert_missing_dependencies(result)

    def test_partial_roots_fail_even_with_old_opt_out(self) -> None:
        result = self.dependency_check({
            "IMAGE_REFERENCE_ADAPTER_ROOT": str(MASTER_ROOT / ".dependency-policy-test-missing" / "image"),
            "MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION": "1",
        })
        self.assert_missing_dependencies(result)
        self.assertIn("unset root variables:", result.stderr)
        self.assertIn("missing files:", result.stderr)

    def test_all_configured_but_missing_sources_fail(self) -> None:
        result = self.dependency_check({
            name: str(MASTER_ROOT / ".dependency-policy-test-missing" / name)
            for name in EXTERNAL_ROOT_ENV
        })
        self.assert_missing_dependencies(result)
        self.assertNotIn("unset root variables:", result.stderr)
        self.assertIn("missing files:", result.stderr)


if __name__ == "__main__":
    print("UNSUPPORTED LEGACY DIAGNOSTIC: not part of MPW compatibility or release validation", file=sys.stderr)
    if "--dependency-check-only" in sys.argv:
        external_dependencies_available()
        sys.exit(0)
    unittest.main(verbosity=2)
