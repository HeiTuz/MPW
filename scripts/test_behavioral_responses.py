#!/usr/bin/env python3
"""Tests for the offline behavioral response checker CLI."""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CHECKER = ROOT / "scripts" / "check_behavioral_responses.py"


class BehavioralResponseCheckerTests(unittest.TestCase):
    def run_checker(self, cases, responses, *, reviews=None):
        with tempfile.TemporaryDirectory() as directory:
            temporary = Path(directory)
            case_path = temporary / "cases.json"
            response_path = temporary / "responses.json"
            case_path.write_text(json.dumps(cases), encoding="utf-8")
            response_path.write_text(json.dumps(responses), encoding="utf-8")
            command = [
                sys.executable, str(CHECKER), "--cases", str(case_path),
                "--responses", str(response_path), "--model", "test-model",
                "--revision", "r1",
            ]
            if reviews is not None:
                review_path = temporary / "reviews.json"
                review_path.write_text(json.dumps(reviews), encoding="utf-8")
                command.extend(["--reviews", str(review_path)])
            return subprocess.run(command, capture_output=True, text=True, check=False)

    def report(self, result):
        self.assertIn(result.returncode, (0, 1), result.stderr)
        return json.loads(result.stdout)

    def test_fence_and_whitespace_drift_fail_exact_string_expectations(self):
        cases = {"cases": [{"id": "exact", "expected": "answer"}]}
        result = self.run_checker(cases, [{"id": "exact", "response": "```text\nanswer\n```"}],
                                  reviews=[{"id": "exact", "verdict": "pass", "reason": "reviewed"}])
        report = self.report(result)
        self.assertEqual(1, result.returncode)
        self.assertEqual("failed", report["results"][0]["status"])
        self.assertTrue(report["results"][0]["errors"])

    def test_missing_response_is_not_run(self):
        report = self.report(self.run_checker([{"id": "a", "expected": "x"}], []))
        self.assertEqual("not_run", report["results"][0]["status"])

    def test_duplicate_and_unknown_response_ids_are_input_errors(self):
        cases = [{"id": "a", "expected": "x"}]
        for responses in (
            [{"id": "a", "response": "x"}, {"id": "a", "response": "x"}],
            [{"id": "unknown", "response": "x"}],
        ):
            with self.subTest(responses=responses):
                result = self.run_checker(cases, responses)
                self.assertEqual(2, result.returncode)
                self.assertTrue(result.stderr)

    def test_non_string_response_is_input_error(self):
        result = self.run_checker([{"id": "a"}], [{"id": "a", "response": 4}])
        self.assertEqual(2, result.returncode)

    def test_json_format_requires_whole_response_to_parse(self):
        cases = [{"id": "json", "format": {"kind": "json", "keys": ["ok"]}}]
        for response in ('{"ok": true}', 'prose {"ok": true}'):
            with self.subTest(response=response):
                result = self.run_checker(cases, [{"id": "json", "response": response}],
                                         reviews=[{"id": "json", "verdict": "pass", "reason": "reviewed"}])
                self.assertEqual("passed" if response.startswith("{") else "failed",
                                 self.report(result)["results"][0]["status"])

    def test_json_format_rejects_nonfinite_numbers_and_duplicate_keys_at_any_depth(self):
        cases = [{"id": "json", "format": {"kind": "json", "keys": ["value"]}}]
        responses = (
            '{"value": NaN}', '{"value": Infinity}', '{"value": -Infinity}',
            '{"value": 1, "value": 2}', '{"value": {"nested": 1, "nested": 2}}',
        )
        for response in responses:
            with self.subTest(response=response):
                result = self.run_checker(cases, [{"id": "json", "response": response}],
                                          reviews=[{"id": "json", "verdict": "pass", "reason": "reviewed"}])
                item = self.report(result)["results"][0]
                self.assertEqual("failed", item["status"])
                self.assertTrue(item["errors"])

    def test_code_blocks_require_exact_count_and_no_outside_prose(self):
        cases = [{"id": "blocks", "format": {"kind": "code_blocks", "count": 1}}]
        responses = (
            ("```python\nprint(1)\n```", "passed"),
            ("~~~~python\nprint(1)\n~~~~~", "passed"),
            ("````python\nprint(1)\n`````", "passed"),
            ("````python\nprint(1)\n```", "failed"),
            ("intro\n```python\nprint(1)\n```", "failed"),
            ("```inline```", "failed"),
            ("```\n```", "failed"),
            ("```python\nprint(1)\n", "failed"),
            ("```python\nprint(1)\n```\n```", "failed"),
        )
        for response, expected_status in responses:
            with self.subTest(response=response):
                result = self.run_checker(cases, [{"id": "blocks", "response": response}],
                                         reviews=[{"id": "blocks", "verdict": "pass", "reason": "reviewed"}])
                self.assertEqual(expected_status, self.report(result)["results"][0]["status"])

    def test_plain_format_rejects_tilde_fenced_block(self):
        cases = [{"id": "plain", "format": {"kind": "plain"}}]
        response = "~~~json\n{}\n~~~"
        result = self.run_checker(cases, [{"id": "plain", "response": response}],
                                  reviews=[{"id": "plain", "verdict": "pass", "reason": "reviewed"}])
        self.assertEqual("failed", self.report(result)["results"][0]["status"])

    def test_preserved_strings_are_checked_in_declared_order(self):
        cases = [{"id": "ordered", "preserved_strings": ["first", "second"]}]
        result = self.run_checker(cases, [{"id": "ordered", "response": "second then first"}],
                                  reviews=[{"id": "ordered", "verdict": "pass", "reason": "reviewed"}])
        report = self.report(result)
        self.assertEqual("failed", report["results"][0]["status"])
        self.assertTrue(report["results"][0]["errors"])

    def test_preserved_strings_cannot_overlap(self):
        cases = [{"id": "overlap", "preserved_strings": ["firstsecond", "second"]}]
        result = self.run_checker(cases, [{"id": "overlap", "response": "firstsecond"}],
                                  reviews=[{"id": "overlap", "verdict": "pass", "reason": "reviewed"}])
        self.assertEqual("failed", self.report(result)["results"][0]["status"])

    def test_empty_response_fails(self):
        result = self.run_checker([{"id": "empty"}], [{"id": "empty", "response": ""}],
                                  reviews=[{"id": "empty", "verdict": "pass", "reason": "reviewed"}])
        self.assertEqual("failed", self.report(result)["results"][0]["status"])

    def test_manual_failure_fails_and_missing_review_cannot_pass(self):
        cases = [{"id": "a", "expected": "x"}, {"id": "b", "expected": "y"}]
        responses = [{"id": "a", "response": "x"}, {"id": "b", "response": "y"}]
        result = self.run_checker(cases, responses,
                                  reviews=[{"id": "a", "verdict": "fail", "reason": "wrong tone"}])
        report = self.report(result)
        self.assertEqual("failed", report["results"][0]["status"])
        self.assertEqual("needs_review", report["results"][1]["status"])

    def test_valid_mechanical_and_manual_pass_reports_metadata_and_counts(self):
        cases = [{"id": "a", "expected": "x"}]
        result = self.run_checker(cases, [{"id": "a", "response": "x"}],
                                  reviews=[{"id": "a", "verdict": "pass", "reason": "matches"}])
        report = self.report(result)
        self.assertEqual(0, result.returncode)
        self.assertTrue(report["ok"])
        self.assertEqual({"passed": 1, "failed": 0, "needs_review": 0, "not_run": 0}, report["counts"])
        self.assertEqual("test-model", report["model"])
        self.assertEqual("r1", report["revision"])

    def test_semantic_rubric_is_reported_without_automatic_grading(self):
        case = {"id": "semantic", "expected": ["must include cause"],
                "semantic_checks": ["explain tradeoff"], "forbidden": ["claim certainty"]}
        result = self.run_checker([case], [{"id": "semantic", "response": "anything"}])
        item = self.report(result)["results"][0]
        self.assertEqual("needs_review", item["status"])
        self.assertEqual(["must include cause"], item["unreviewed_semantic_criteria"]["expected"])
        self.assertEqual(["claim certainty"], item["unreviewed_semantic_criteria"]["forbidden"])

    def test_unknown_case_keys_do_not_silently_skip_checks(self):
        result = self.run_checker([{"id": "a", "formt": {"kind": "plain"}}],
                                  [{"id": "a", "response": "anything"}],
                                  reviews=[{"id": "a", "verdict": "pass", "reason": "checked"}])
        self.assertEqual(2, result.returncode)

    def test_plain_rejects_indented_and_quoted_fence_wrappers(self):
        for response in ("    ```text\nbody\n    ```", "> ~~~text\n> body\n> ~~~"):
            result = self.run_checker([{"id": "a", "format": {"kind": "plain"}}],
                                      [{"id": "a", "response": response}],
                                      reviews=[{"id": "a", "verdict": "pass", "reason": "checked"}])
            self.assertEqual("failed", self.report(result)["results"][0]["status"])

    def test_invalid_review_and_format_configuration_are_input_errors(self):
        for invalid_format in ({"kind": "unknown"}, None):
            with self.subTest(format=invalid_format):
                case = [{"id": "a", "format": invalid_format}]
                self.assertEqual(2, self.run_checker(case, []).returncode)
        valid_case = [{"id": "a"}]
        for review in ([{"id": "a", "verdict": "maybe", "reason": "reason"}],
                       [{"id": "a", "verdict": "pass", "reason": "  "}]):
            with self.subTest(review=review):
                self.assertEqual(2, self.run_checker(valid_case, [], reviews=review).returncode)


if __name__ == "__main__":
    unittest.main()
