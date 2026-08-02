#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import importlib.util
import io
import json
import tempfile
import unittest
from datetime import timedelta
from pathlib import Path

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
            garden = temp / "garden"
            garden.mkdir()
            out = io.StringIO()
            with contextlib.redirect_stdout(out):
                self.assertEqual(
                    0,
                    DOCTRINE.main(
                        [
                            "--state", str(state),
                            "--canonical-root", str(temp),
                            "--garden-root", f"prompt-knowledge={garden}",
                        ]
                    ),
                )
            self.assertEqual("", out.getvalue())
            self.assertTrue(state.is_file())
            payload = json.loads(state.read_text(encoding="utf-8"))
            self.assertEqual(1, payload["version"])

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
