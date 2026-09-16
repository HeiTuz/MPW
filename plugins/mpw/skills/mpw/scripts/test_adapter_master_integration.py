#!/usr/bin/env python3
"""Cross-repository contract and closed-loop integration verification."""
from __future__ import annotations

import importlib.util
import json
import os
import subprocess
import sys
import unittest
from pathlib import Path
from typing import Any

MASTER_ROOT = Path(__file__).resolve().parents[1]


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
EXTERNAL_INTEGRATION_OPT_OUT = "MPW_ALLOW_MISSING_EXTERNAL_INTEGRATION"


def external_dependency_paths() -> tuple[Path, ...]:
    return (
        loop_path(IMAGE_ROOT),
        loop_path(DESIGN_ROOT),
        BRIDGE_ROOT / "scripts/higgsfield_job.py",
        PROMPT_KNOWLEDGE_ROOT / PROMPT_KNOWLEDGE_SCRIPT,
    )


def external_dependencies_available() -> bool:
    missing = [path for path in external_dependency_paths() if not path.is_file()]
    if not missing:
        return True
    if os.environ.get(EXTERNAL_INTEGRATION_OPT_OUT) == "1":
        return False
    raise RuntimeError(
        "external integration dependencies missing; configure the four root "
        f"environment variables or set {EXTERNAL_INTEGRATION_OPT_OUT}=1 to opt out: "
        + ", ".join(str(path) for path in missing)
    )


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
        if not external_dependencies_available():
            raise unittest.SkipTest("external integration explicitly opted out")
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


class ExternalDependencyPolicyTests(unittest.TestCase):
    def test_missing_roots_fail_without_explicit_opt_out(self) -> None:
        env = os.environ.copy()
        nonexistent = MASTER_ROOT / ".dependency-policy-test-missing"
        env.update({
            "IMAGE_REFERENCE_ADAPTER_ROOT": str(nonexistent / "image"),
            "DESIGN_REFERENCE_ADAPTER_ROOT": str(nonexistent / "design"),
            "HIGGSFIELD_BRIDGE_ROOT": str(nonexistent / "bridge"),
        })
        env.pop(EXTERNAL_INTEGRATION_OPT_OUT, None)
        result = subprocess.run(
            [sys.executable, __file__, "--dependency-check-only"],
            env=env,
            capture_output=True,
            text=True,
            check=False,
        )
        self.assertNotEqual(0, result.returncode, result.stdout + result.stderr)
        self.assertIn("external integration dependencies missing", result.stderr)


if __name__ == "__main__":
    if "--dependency-check-only" in sys.argv:
        external_dependencies_available()
        sys.exit(0)
    unittest.main(verbosity=2)
