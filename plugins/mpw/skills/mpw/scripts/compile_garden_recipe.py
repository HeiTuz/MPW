#!/usr/bin/env python3
"""Compile a validated GardenRecipe into a versioned PromptBundle."""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import sys
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
MAX_BLOCK_CHARS = 2000


class CompileError(ValueError):
    """A recipe cannot be compiled without violating the handoff contract."""


def _load_contract_api() -> tuple[Callable[..., list[str]], Callable[[Any], str], Callable[..., list[str]]]:
    contract_root = Path(os.environ.get("MASTER_PROMPT_CONTRACT_ROOT", ROOT / "contracts"))
    validator_path = contract_root / "validate.py"
    if not validator_path.is_file():
        raise CompileError(
            f"contract_validator_missing:{validator_path}; install or sync the authoritative contracts first"
        )
    spec = importlib.util.spec_from_file_location("master_prompt_contracts", validator_path)
    if spec is None or spec.loader is None:
        raise CompileError(f"contract_validator_unloadable:{validator_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    readiness = getattr(module, "recipe_readiness_errors", None)
    if not callable(readiness):
        raise CompileError(
            f"contract_validator_incompatible:{validator_path}; sync authoritative contracts with recipe readiness validation"
        )
    return module.validate_document, module.canonical_hash, readiness


def _strings(values: Any) -> list[str]:
    if not isinstance(values, list):
        return []
    return [value.strip() for value in values if isinstance(value, str) and value.strip()]


def _axis_values(recipe: dict[str, Any], axis: str) -> list[str]:
    evidence = recipe["observations"].get(axis, {})
    if evidence.get("status") != "observed":
        return []
    return [item["value"].strip() for item in evidence.get("items", []) if item.get("value", "").strip()]


def _render_tokens(tokens: list[dict[str, Any]]) -> list[str]:
    result = []
    for token in tokens:
        scene = f"; scene: {token['scene_fit']}" if token.get("scene_fit") else ""
        result.append(f"{token['term']} ({token['effect']}{scene})")
    return result


def _qualified_tokens(recipe: dict[str, Any]) -> list[str]:
    return _render_tokens(recipe["qualified_tokens"])


def _evidence_lines(recipe: dict[str, Any]) -> list[str]:
    labels = {
        "subject": "Subject",
        "camera": "Camera",
        "lighting": "Lighting",
        "layout": "Layout",
        "palette": "Palette",
    }
    lines: list[str] = []
    for axis, label in labels.items():
        values = _axis_values(recipe, axis)
        if values:
            lines.append(f"{label}: {'; '.join(values)}.")
    tokens = _qualified_tokens(recipe)
    if tokens:
        lines.append(f"Direction: {'; '.join(tokens)}.")
    inferences = [item["claim"].strip() for item in recipe["inferences"]]
    if inferences:
        lines.append(f"Qualified interpretation: {'; '.join(inferences)}.")
    return lines


def _lock_line(recipe: dict[str, Any]) -> str:
    locks = recipe["locks"]
    values = [
        *(f"identity={value}" for value in _strings(locks.get("identity"))),
        *(f"subject={value}" for value in _strings(locks.get("subject"))),
    ]
    return "Immutable locks: " + "; ".join(values) + "."


def _reference_line(recipe: dict[str, Any]) -> str:
    return (
        f"Reference: use the attached media identified by opaque ID "
        f"{recipe['source']['reference_id']} for evidence-backed visual guidance."
    )


def _positive_exclusion_line(recipe: dict[str, Any]) -> str:
    translated: list[str] = []
    for exclusion in _strings(recipe["exclusions"]):
        normalized = exclusion.casefold()
        if any(token in normalized for token in ("people", "person", "crowd")):
            translated.append("the frame contains only the locked subject count")
        elif normalized == "do not add logos, brands, or watermarks.":
            # The prompt-knowledge producer prohibits additions, not source marks.
            translated.append(
                "visible logos, branding, and watermarks match the source exactly, with only source-supported marks"
            )
        elif normalized in {
            f"{modifier} {mark}"
            for modifier in ("invented", "new", "additional", "extra")
            for mark in ("logo", "logos", "brand mark", "brand marks")
        }:
            translated.append("visible logos and lettering match the source exactly, with only source-supported marks")
        elif normalized in {"logo", "logos", "all logos", "brand", "brands", "branding", "all branding"}:
            translated.append("all visible surfaces have an unbranded clean finish")
        elif normalized in {"watermark", "watermarks", "all watermarks"}:
            translated.append("the finished image has a clean watermark-free finish")
        elif any(token in normalized for token in ("identity", "face drift")):
            translated.append("the same source identity remains stable")
        else:
            raise CompileError(f"untranslatable_positive_exclusion:{exclusion}")
    return "Positive boundaries: " + "; ".join(translated) + "."


def _render_higgsfield(recipe: dict[str, Any]) -> str:
    body_parts = [
        recipe["intended_use"]["goal"].strip(),
        *[line.removesuffix(".") for line in _evidence_lines(recipe)],
        _lock_line(recipe).removesuffix("."),
        _positive_exclusion_line(recipe).removesuffix("."),
        _reference_line(recipe).removesuffix("."),
    ]
    return ". ".join(body_parts) + "."


def _render_gpt_image(recipe: dict[str, Any]) -> str:
    sections = [
        f"Core scene: {recipe['intended_use']['goal'].strip()}",
        *_evidence_lines(recipe),
        _lock_line(recipe),
        _positive_exclusion_line(recipe),
        _reference_line(recipe),
        "Output: one finished, self-contained image with exact subject and layout continuity.",
    ]
    return "\n".join(sections)


def _render_composite(recipe: dict[str, Any]) -> str:
    sections = [
        "PIXEL-BOUND COMPOSITE — This is background-replacement compositing, not image generation. "
        "The source is a locked photographic plate defining the final canvas; subject pixels are read-only "
        "and only background pixels may be generated.",
        "FRAME LOCK: output dimensions and aspect ratio equal the input exactly; coordinates stay 1:1. "
        "Do not crop, zoom, pan, reframe, recenter, resample, warp, or redistribute margins.",
        f"BACKGROUND ONLY: {recipe['intended_use']['goal'].strip()}",
        *_evidence_lines(recipe),
        _lock_line(recipe),
        _positive_exclusion_line(recipe),
        "INTEGRATION: adapt only generated background lighting and texture to the unchanged source subject.",
        _reference_line(recipe),
        "FINAL INTENT: immediate same-subject recognition outranks aesthetic improvement; "
        "the background is supporting context and the locked subject is absolute.",
        "FAIL if subject pixels move, the canvas changes, the face is redrawn, fabric changes, "
        "perspective mismatches, or any immutable lock drifts.",
    ]
    return "\n".join(sections)


def _render_design(recipe: dict[str, Any]) -> str:
    subject = "; ".join(_axis_values(recipe, "subject")) or "the specified interface"
    layout = "; ".join(_axis_values(recipe, "layout")) or "the observed hierarchy"
    palette = "; ".join(_axis_values(recipe, "palette")) or "the observed color roles"
    direction = "; ".join(_qualified_tokens(recipe))
    layout_tokens = "; ".join(_render_tokens(recipe.get("layout_tokens", [])))
    sections = [
        f"Implementation goal: {recipe['intended_use']['goal'].strip()}",
        f"Direction lock: {direction}. Signature element: {layout}.",
        "Visual thesis:",
        f"1. Structure — {subject}; preserve {layout}.",
        f"2. Tone — {direction}; use {palette}.",
        f"3. Behavior — responsive adaptation must retain the same hierarchy and locked subjects.",
        f"Reference decomposition: structure={layout}; tone={direction}; color={palette}.",
        *([f"Qualified layout tokens: {layout_tokens}."] if layout_tokens else []),
        *_evidence_lines(recipe),
        _lock_line(recipe),
        f"Anti-slop constraints: {'; '.join(_strings(recipe['exclusions']))}.",
        _reference_line(recipe),
        "Viewport QC: verify hierarchy, clipping, overflow, and spacing at narrow and wide widths.",
    ]
    return "\n".join(sections)


def _render_generic_image(recipe: dict[str, Any]) -> str:
    return "\n".join([
        f"Goal: {recipe['intended_use']['goal'].strip()}",
        *_evidence_lines(recipe),
        _lock_line(recipe),
        _positive_exclusion_line(recipe),
        _reference_line(recipe),
        "Return one result that preserves all evidence-backed attributes.",
    ])


def _render_prompt(recipe: dict[str, Any]) -> str:
    intended = recipe["intended_use"]
    mode = intended["mode"]
    engine = intended["engine"]
    if mode == "IMAGE_COMPOSITE":
        return _render_composite(recipe)
    if mode == "DESIGN":
        return _render_design(recipe)
    if engine == "gpt-image-2":
        return _render_gpt_image(recipe)
    if engine == "higgsfield":
        return _render_higgsfield(recipe)
    return _render_generic_image(recipe)


def _variable_axes(recipe: dict[str, Any]) -> list[dict[str, Any]]:
    # GardenRecipe v1 has no explicit unlocked-axis permission. An empty array is
    # deliberate: the compiler must not invent degrees of freedom around locks.
    return []


def compile_recipe(recipe: dict[str, Any]) -> dict[str, Any]:
    validate_document, canonical_hash, readiness_errors = _load_contract_api()
    errors = validate_document(recipe)
    if errors:
        raise CompileError("garden_recipe_validation_failed:" + " | ".join(errors))
    if recipe.get("schema_version") != "garden-recipe/v1":
        raise CompileError("garden_recipe_validation_failed:unsupported GardenRecipe version")

    unresolved = readiness_errors(recipe)
    if unresolved:
        raise CompileError("garden_recipe_not_ready:" + " | ".join(unresolved))
    text = _render_prompt(recipe)
    count = len(text)
    if count > MAX_BLOCK_CHARS:
        raise CompileError(
            f"self_contained_prompt_overflow:{count}>{MAX_BLOCK_CHARS}; reduce the GardenRecipe without dropping locks or exclusions"
        )
    recipe_hash = canonical_hash(recipe)
    bundle_suffix = recipe_hash.removeprefix("sha256:")[:20]
    locks = recipe["locks"]
    exclusions = list(recipe["exclusions"])
    qc = [
        "Every immutable identity and subject lock matches the GardenRecipe exactly.",
        "Every negative constraint is absent from the generated result.",
        "The attached reference is used only for the stated evidence-backed visual guidance.",
        "Every prompt block is self-contained and at most 2000 Unicode characters.",
    ]
    bundle = {
        "schema_version": "prompt-bundle/v1",
        "bundle_version": 1,
        "bundle_id": f"pb_{bundle_suffix}",
        "source_recipe": {"recipe_id": recipe["recipe_id"], "recipe_hash": recipe_hash},
        "handoff": {
            "protocol": "generation-handoff/v1",
            "mode": recipe["intended_use"]["mode"],
            "engine": recipe["intended_use"]["engine"],
            "prompt_blocks": [{"block_id": f"block_{bundle_suffix}", "text": text, "unicode_char_count": count}],
            "immutable_locks": locks,
            "variable_axes": _variable_axes(recipe),
            "negative_constraints": exclusions,
            "reference_requirements": [{
                "reference_id": recipe["source"]["reference_id"],
                "purpose": "evidence-backed visual guidance and locked-attribute QC",
                "required": True,
            }],
            "qc_acceptance_criteria": qc,
        },
    }
    bundle_errors = validate_document(bundle, recipe)
    if bundle_errors:
        raise CompileError("prompt_bundle_validation_failed:" + " | ".join(bundle_errors))
    return bundle


def legacy_bridge_bundle(bundle: dict[str, Any]) -> dict[str, Any]:
    """Losslessly adapt v1 prompt blocks to the installed bridge's legacy shape."""
    return {
        "compiled_by": "MPW",
        "blocks": [
            {"text": block["text"]}
            for block in bundle["handoff"]["prompt_blocks"]
        ],
        "assumptions": ["Adapted from prompt-bundle/v1; authoritative locks and QC remain in the v1 handoff."],
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Compile a validated GardenRecipe JSON into PromptBundle JSON")
    parser.add_argument("recipe", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--format", choices=("prompt-bundle", "legacy-bridge"), default="prompt-bundle")
    args = parser.parse_args(argv)
    try:
        recipe = json.loads(args.recipe.read_text(encoding="utf-8"))
        bundle = compile_recipe(recipe)
        output = bundle if args.format == "prompt-bundle" else legacy_bridge_bundle(bundle)
    except (OSError, json.JSONDecodeError, CompileError) as exc:
        print(f"FAIL {exc}", file=sys.stderr)
        return 1
    rendered = json.dumps(output, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.output:
        args.output.write_text(rendered, encoding="utf-8")
    else:
        sys.stdout.write(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
