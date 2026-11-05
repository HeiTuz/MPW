#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import shutil
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "prompt_writing_doctrine_check.py"
SPEC = importlib.util.spec_from_file_location("doctrine_check", SCRIPT)
assert SPEC and SPEC.loader
DOCTRINE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(DOCTRINE)


class DoctrineRunnerTests(unittest.TestCase):
    def test_defaults_are_codex_owned_and_canonical(self) -> None:
        self.assertEqual(ROOT, DOCTRINE.MPW)
        self.assertEqual(ROOT.parent, DOCTRINE.CANONICAL_ROOT)
        self.assertIn(".codex", str(DOCTRINE.DEFAULT_STATE))
        self.assertNotIn(".hermes", SCRIPT.read_text(encoding="utf-8"))

    def test_backlog_first_run_baselines_then_reports_growth_without_auto_apply(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            exports = root / "exports"
            exports.mkdir()
            for index in range(5):
                (exports / f"proposal-{index}.md").write_text("proposal", encoding="utf-8")
            now = DOCTRINE.today()
            lines, state = DOCTRINE.check_backlog({}, {"prompt-knowledge": root}, now)
            self.assertEqual([], lines)
            self.assertEqual(5, state["prompt-knowledge"]["count"])
            for index in range(5, 10):
                (exports / f"proposal-{index}.md").write_text("proposal", encoding="utf-8")
            lines, state = DOCTRINE.check_backlog(state, {"prompt-knowledge": root}, now)
            self.assertEqual(10, state["prompt-knowledge"]["count"])
            self.assertEqual(1, len(lines))
            self.assertIn("never auto-apply", lines[0])

    def test_state_round_trip_and_healthy_runner_are_silent(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            state = temp / "state.json"
            legacy_roots = {"image": {"count": 7, "age_ack": "2026-07-25"}}
            state.write_text(json.dumps({"roots": legacy_roots, "roster": {}}), encoding="utf-8")
            # A healthy fixture must not age with the real repository roster.
            mpw = temp / "MPW"
            shutil.copytree(ROOT / "contracts", mpw / "contracts")
            roster = mpw / "references" / "image" / "model-routing.md"
            roster.parent.mkdir(parents=True)
            roster.write_text("<!-- roster-snapshot: 2026-07-25 -->\n", encoding="utf-8")
            out = io.StringIO()
            with (
                patch.object(DOCTRINE, "MPW", mpw),
                patch.object(DOCTRINE, "today", return_value=date(2026, 7, 26)),
                patch.object(DOCTRINE, "check_dictionary_reachable") as dictionary,
                patch.object(DOCTRINE, "check_contract_mirrors") as mirrors,
                patch.object(DOCTRINE, "parse_garden_roots") as garden_roots,
                patch.object(DOCTRINE, "check_backlog") as backlog,
                contextlib.redirect_stdout(out),
            ):
                self.assertEqual(
                    0,
                    DOCTRINE.main(["--state", str(state)]),
                )
                for legacy_check in (dictionary, mirrors, garden_roots, backlog):
                    legacy_check.assert_not_called()
            self.assertEqual("", out.getvalue())
            self.assertTrue(state.is_file())
            payload = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(1, payload["version"])
            self.assertEqual(legacy_roots, payload["roots"])

    def test_default_still_reports_roster_and_contract_findings(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            state = Path(directory) / "state.json"
            out = io.StringIO()
            with (
                patch.object(DOCTRINE, "check_roster_age", return_value=["- roster finding"]) as roster,
                patch.object(DOCTRINE, "check_contract_drift", return_value=["- contract finding"]) as contracts,
                contextlib.redirect_stdout(out),
            ):
                self.assertEqual(0, DOCTRINE.main(["--state", str(state)]))
            roster.assert_called_once()
            contracts.assert_called_once_with(ROOT)
            self.assertIn("roster finding", out.getvalue())
            self.assertIn("contract finding", out.getvalue())
            self.assertNotIn("legacy", out.getvalue())

    def test_legacy_roots_require_explicit_diagnostic_opt_in(self) -> None:
        for option in (["--canonical-root", "/tmp/checkouts"], ["--garden-root", "image=/tmp/garden"]):
            with self.subTest(option=option):
                error = io.StringIO()
                with contextlib.redirect_stderr(error), self.assertRaises(SystemExit) as failure:
                    DOCTRINE.main(option)
                self.assertEqual(2, failure.exception.code)
                self.assertIn("require --legacy-integrations", error.getvalue())

    def test_legacy_opt_in_runs_each_diagnostic_and_preserves_findings(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            state = temp / "state.json"
            roots = {"image": temp / "garden"}
            out = io.StringIO()
            with (
                patch.object(DOCTRINE, "check_roster_age", return_value=[]) as roster,
                patch.object(DOCTRINE, "check_contract_drift", return_value=[]) as contracts,
                patch.object(DOCTRINE, "check_dictionary_reachable", return_value=["- dictionary finding"]) as dictionary,
                patch.object(DOCTRINE, "check_contract_mirrors", return_value=["- mirror finding"]) as mirrors,
                patch.object(DOCTRINE, "parse_garden_roots", return_value=roots) as garden_roots,
                patch.object(DOCTRINE, "check_backlog", return_value=(["- backlog finding"], {})) as backlog,
                contextlib.redirect_stdout(out),
            ):
                self.assertEqual(0, DOCTRINE.main([
                    "--state", str(state), "--legacy-integrations",
                    "--canonical-root", str(temp), "--garden-root", f"image={roots['image']}",
                ]))
            roster.assert_called_once()
            contracts.assert_called_once_with(ROOT)
            dictionary.assert_called_once_with(temp)
            mirrors.assert_called_once_with(ROOT, temp)
            garden_roots.assert_called_once_with([f"image={roots['image']}"])
            backlog.assert_called_once()
            self.assertEqual(roots, backlog.call_args.args[1])
            for finding in ("dictionary finding", "mirror finding", "backlog finding"):
                self.assertIn(finding, out.getvalue())
            self.assertIn("unsupported, not a full compatibility check or release gate", out.getvalue())

    def test_missing_legacy_dependencies_are_not_reported_as_success(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            temp = Path(directory)
            roots = {name: temp / name for name in DOCTRINE.DEFAULT_GARDEN_ROOTS}
            out = io.StringIO()
            with (
                patch.object(DOCTRINE, "check_roster_age", return_value=[]),
                patch.object(DOCTRINE, "check_contract_drift", return_value=[]),
                patch.object(DOCTRINE, "DEFAULT_GARDEN_ROOTS", roots),
                patch.object(DOCTRINE.subprocess, "run") as process,
                contextlib.redirect_stdout(out),
            ):
                self.assertEqual(0, DOCTRINE.main([
                    "--state", str(temp / "state.json"), "--legacy-integrations",
                    "--canonical-root", str(temp),
                ]))
            process.assert_not_called()
            self.assertEqual(7, out.getvalue().count("NOT RUN"))
            self.assertIn("legacy dictionary check NOT RUN", out.getvalue())
            for name in roots:
                self.assertIn(f"legacy {name} backlog check NOT RUN", out.getvalue())

    def test_roster_acknowledgement_suppresses_repeat_signal(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            mpw = Path(directory)
            path = mpw / "references" / "image" / "model-routing.md"
            path.parent.mkdir(parents=True)
            stale = DOCTRINE.today() - timedelta(days=DOCTRINE.ROSTER_STALE_DAYS + 1)
            path.write_text(f"<!-- roster-snapshot: {stale.isoformat()} -->\n", encoding="utf-8")
            state: dict = {}
            self.assertTrue(DOCTRINE.check_roster_age(mpw, state, DOCTRINE.today()))
            self.assertEqual([], DOCTRINE.check_roster_age(mpw, state, DOCTRINE.today()))


if __name__ == "__main__":
    unittest.main()
