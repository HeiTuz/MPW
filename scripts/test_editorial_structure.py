#!/usr/bin/env python3
"""Structural regression tests for the editorial router and frozen strings."""
import importlib.util
from pathlib import Path
import re
import tempfile
import unittest


ROOT = Path(__file__).resolve().parent.parent
EDITORIAL = ROOT / "references" / "image" / "editorial"
ROUTER = ROOT / "references" / "image" / "editorial-fashion.md"
LINT_PATH = Path(__file__).with_name("lint.py")
SPEC = importlib.util.spec_from_file_location("heituz_lint", LINT_PATH)
lint = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lint)


def router_assignments(router_text):
    """Return the § number to editorial topic filename mapping from the router table."""
    rows = []
    for line in router_text.splitlines():
        match = re.fullmatch(r"\| §(\d+) \| .*? \| \[.*?\]\(([^ )]+)\) \|", line)
        if match:
            rows.append((int(match.group(1)), match.group(2)))
    return rows


class EditorialStructureTests(unittest.TestCase):
    def setUp(self):
        self.router_text = ROUTER.read_text(encoding="utf-8")
        self.assignments = router_assignments(self.router_text)
        self.topic_files = sorted(EDITORIAL.glob("*.md"))

    def test_router_covers_sections_and_topics_exactly(self):
        self.assertEqual([section for section, _ in self.assignments], list(range(1, 16)))
        self.assertTrue(all(link.startswith("editorial/") for _, link in self.assignments))
        linked = {Path(link).name for _, link in self.assignments}
        self.assertEqual(linked, {path.name for path in self.topic_files})
        self.assertTrue(all((EDITORIAL / filename).is_file() for filename in linked))

    def test_headings_match_router_assignments_globally(self):
        headings = {}
        for path in self.topic_files:
            for line in path.read_text(encoding="utf-8").splitlines():
                match = re.match(r"^## (\d+)\.", line)
                if match:
                    section = int(match.group(1))
                    self.assertNotIn(section, headings, f"§{section} appears more than once")
                    headings[section] = f"editorial/{path.name}"
        self.assertEqual(dict(self.assignments), headings)

    def test_topics_are_linted_and_size_bounded(self):
        for path in self.topic_files:
            relative = path.relative_to(ROOT).as_posix()
            self.assertIn(relative, lint.FILES)
            self.assertLess(path.stat().st_size, 20480, f"{relative} is too large")

    def test_frozen_strings_have_three_way_byte_identity(self):
        errors = []
        texts = {name: (ROOT / name).read_text(encoding="utf-8") for name in lint.FILES}
        lint.check_frozen_strings(texts, errors)
        self.assertEqual(errors, [])

    def test_non_anchor_mutation_rejects_validator_constant(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            ssot_path = root / lint.SSOT
            compiler_path = root / lint.COMPILER
            validator_path = root / "scripts" / "check_prompt.mjs"
            for source, destination in (
                (ROOT / lint.SSOT, ssot_path),
                (ROOT / lint.COMPILER, compiler_path),
                (ROOT / "scripts" / "check_prompt.mjs", validator_path),
            ):
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(source.read_text(encoding="utf-8"), encoding="utf-8")
            for path in (ssot_path, compiler_path):
                path.write_text(
                    path.read_text(encoding="utf-8").replace(
                        "fashion editorial styling", "fashion editorial style"
                    ),
                    encoding="utf-8",
                )
            texts = {
                lint.SSOT: ssot_path.read_text(encoding="utf-8"),
                lint.COMPILER: compiler_path.read_text(encoding="utf-8"),
            }
            original_validator = lint.VALIDATOR
            try:
                lint.VALIDATOR = validator_path
                errors = []
                lint.check_frozen_strings(texts, errors)
            finally:
                lint.VALIDATOR = original_validator
            self.assertTrue(
                any("SAFETY_ASSERT 상수가 SSOT SAFETY_ASSERT과 byte 불일치" in error for error in errors),
                errors,
            )

    def _frozen_errors_with_anchors(self, anchors_literal):
        """Run check_frozen_strings against a validator copy whose ANCHORS were rewritten."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            validator_path = root / "scripts" / "check_prompt.mjs"
            validator_path.parent.mkdir(parents=True, exist_ok=True)
            source = (ROOT / "scripts" / "check_prompt.mjs").read_text(encoding="utf-8")
            patched = re.sub(
                r"const ANCHORS = \[.*?\];",
                f"const ANCHORS = [{anchors_literal}];",
                source,
                count=1,
            )
            self.assertNotEqual(source, patched, "ANCHORS constant not found to rewrite")
            validator_path.write_text(patched, encoding="utf-8")
            texts = {name: (ROOT / name).read_text(encoding="utf-8") for name in lint.FILES}
            original_validator = lint.VALIDATOR
            try:
                lint.VALIDATOR = validator_path
                errors = []
                lint.check_frozen_strings(texts, errors)
            finally:
                lint.VALIDATOR = original_validator
            return errors

    def test_indiscriminate_anchors_are_rejected(self):
        """Substring containment alone is not a guard: /a/, /e/, /o/ are each "in"
        SAFETY_ASSERT, so a one-letter rewrite would make E-TIER2-PAIR unreachable
        while every gate stayed green. The control corpus must catch that."""
        errors = self._frozen_errors_with_anchors("/a/i, /e/i, /o/i")
        self.assertTrue(
            any("안전 문구 없는 대조 프롬프트에" in error for error in errors),
            errors,
        )

    def test_dropping_an_anchor_is_rejected(self):
        """Fewer than the pinned count makes the >=3 pairing threshold trivially
        satisfiable by the remaining anchors."""
        errors = self._frozen_errors_with_anchors("/25\\+/, /original character/i")
        self.assertTrue(
            any("ANCHORS는 5개여야 함" in error for error in errors),
            errors,
        )

    def test_missing_router_row_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            router_copy = Path(tmp) / "editorial-fashion.md"
            router_copy.write_text(self.router_text, encoding="utf-8")
            router_copy.write_text(
                router_copy.read_text(encoding="utf-8").replace(
                    "| §15 | 컨셉-콜리전 에디토리얼 그래머 | [editorial/concept-collision.md](editorial/concept-collision.md) |\n",
                    "",
                ),
                encoding="utf-8",
            )
            self.assertNotEqual(
                [section for section, _ in router_assignments(router_copy.read_text(encoding="utf-8"))],
                list(range(1, 16)),
            )



if __name__ == "__main__":
    unittest.main()
