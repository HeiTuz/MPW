#!/usr/bin/env python3
"""Regression tests for lint.py review and measurement stamp checks."""
import importlib.util
from datetime import date
from pathlib import Path
import unittest


LINT_PATH = Path(__file__).with_name("lint.py")
SPEC = importlib.util.spec_from_file_location("heituz_lint", LINT_PATH)
lint = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(lint)


class SixMonthsBeforeTests(unittest.TestCase):
    def test_year_boundary_and_end_of_month_clamping(self):
        self.assertEqual(lint.six_months_before(date(2026, 1, 31)), date(2025, 7, 31))
        self.assertEqual(lint.six_months_before(date(2026, 8, 31)), date(2026, 2, 28))
        self.assertEqual(lint.six_months_before(date(2024, 8, 31)), date(2024, 2, 29))


class ReviewStampTests(unittest.TestCase):
    TODAY = date(2026, 8, 31)

    def check(self, value):
        errors = []
        lint.check_review_stamps(
            {field: value for field in lint.REVIEW_STAMP_FIELDS}, errors, self.TODAY
        )
        return errors

    def test_fresh_and_exact_cutoff_pass(self):
        self.assertEqual(self.check("2026-08-31"), [])
        self.assertEqual(self.check("2026-02-28"), [])

    def test_one_day_ahead_is_timezone_skew_not_a_typo(self):
        # An author east of UTC stamps their local date; CI ages it in UTC and
        # reads it one day ahead. Exactly one day is tolerated, two is not.
        self.assertEqual(self.check("2026-09-01"), [])
        self.assertIn("future-dated review stamp", self.check("2026-09-02")[0])

    def test_stale_future_invalid_and_date_object(self):
        self.assertIn("6-month re-verification", self.check("2026-02-27")[0])
        self.assertIn("future-dated review stamp", self.check("2026-09-02")[0])
        self.assertIn("must be a YYYY-MM-DD string", self.check("invalid")[0])
        self.assertEqual(self.check(date(2026, 8, 31)), [])


class MeasurementStampTests(unittest.TestCase):
    TODAY = date(2026, 8, 31)

    def check(self, text):
        errors = []
        lint.check_measurement_stamps("fixture.md", text, errors, self.TODAY)
        return errors

    def test_age_future_invalid_month_and_suffix(self):
        self.assertEqual(self.check("(2026-02 실측)"), [])
        self.assertIn("6-month re-verification", self.check("(2026-01 실측)")[0])
        self.assertIn("future-dated measurement stamp", self.check("(2026-09 실측)")[0])
        self.assertIn("invalid measurement stamp", self.check("(2026-13 실측)")[0])
        self.assertEqual(self.check("(2026-07 실측, 40컷)"), [])

    def test_unclosed_multiline_stamp_is_not_canonical_but_near_missed(self):
        text = "(2026-02 실측, 계속\n다음 줄)"
        self.assertEqual(self.check(text), [])
        errors = []
        lint.check_measurement_near_misses("fixture.md", text, errors)
        self.assertIn("noncanonical measurement stamp", errors[0])


class NearMissTests(unittest.TestCase):
    def test_detects_only_date_bearing_noncanonical_forms(self):
        errors = []
        lint.check_measurement_near_misses("fixture.md", "실측 2026-07", errors)
        self.assertIn("fixture.md:1: noncanonical measurement stamp", errors[0])
        for text in ("(312자 실측)", "실측: 215자", "plain 2026-07"):
            errors = []
            lint.check_measurement_near_misses("fixture.md", text, errors)
            self.assertEqual(errors, [])
    def test_repository_markdown_scope_includes_agents_and_examples(self):
        from tempfile import TemporaryDirectory

        with TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "agents").mkdir()
            (root / "examples").mkdir()
            (root / ".cache").mkdir()
            (root / "agents" / "AGENTS.md").write_text("agent", encoding="utf-8")
            (root / "examples" / "README.md").write_text("example", encoding="utf-8")
            (root / ".cache" / "ignored.md").write_text("ignored", encoding="utf-8")
            names = {
                path.relative_to(root).as_posix()
                for path in lint.markdown_files(root)
            }

        self.assertEqual(names, {"agents/AGENTS.md", "examples/README.md"})


class FrontmatterParserTests(unittest.TestCase):
    def test_fallback_matches_pyyaml_for_review_fields(self):
        frontmatter = """version: 2.12.0
metadata:
  model_claims_reviewed_at: \"2026-07-07\"
  role_routing_reviewed_at: 2026-07-10
model_claims_reviewed_at: 2031-01-01
"""
        _, fallback = lint.parse_frontmatter(frontmatter, use_yaml=False)
        _, yaml_metadata = lint.parse_frontmatter(frontmatter, use_yaml=True)
        self.assertEqual(fallback, yaml_metadata)
        self.assertNotIn("2031-01-01", fallback.values())

    def test_fallback_matches_pyyaml_with_blank_lines_and_comments(self):
        frontmatter = """version: 2.12.0
metadata:
  category: prompt-writing
  # 검증 스탬프
  model_claims_reviewed_at: 2026-07-07  # 주석
"""
        keep = "  role_routing_reviewed_at: \"2026-07-10\"\n"
        frontmatter += "\n" + keep + "updated: 2026-07-16\n"
        _, fallback = lint.parse_frontmatter(frontmatter, use_yaml=False)
        _, yaml_metadata = lint.parse_frontmatter(frontmatter, use_yaml=True)
        review = {field: yaml_metadata.get(field) for field in lint.REVIEW_STAMP_FIELDS}
        self.assertEqual(fallback, review)
        self.assertEqual(fallback["model_claims_reviewed_at"], "2026-07-07")
        self.assertEqual(fallback["role_routing_reviewed_at"], "2026-07-10")


if __name__ == "__main__":
    unittest.main()
