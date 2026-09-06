import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("compile_image_variations", ROOT / "scripts" / "compile_image_variations.py")
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ImageVariationCompilerTests(unittest.TestCase):
    def request(self):
        return {
            "concept": "서브컬처 독립 잡지 같은 고양이 초상",
            "style": "anti-mainstream editorial, dry and strange",
            "locks": {"subject": "same fictional black cat", "text": "none"},
            "output_prefix": "images",
        }

    def test_hundred_variations_are_unique_deterministic_and_qc_free(self):
        first = MODULE.compile_variations(self.request(), 100, 17)
        second = MODULE.compile_variations(self.request(), 100, 17)
        self.assertEqual(first, second)
        self.assertEqual(len(first), 100)
        self.assertEqual(len({row["full_prompt"] for row in first}), 100)
        self.assertTrue(all(row["qc_required"] is False for row in first))
        self.assertTrue(all(row["metadata"]["ideation_batch"] is True for row in first))
        self.assertEqual(first[0]["output_path"], "images/001.png")
        self.assertEqual(first[-1]["output_path"], "images/100.png")
        self.assertTrue(all(len(row["full_prompt"]) <= 2000 for row in first))

    def test_single_request_is_strengthened(self):
        row = MODULE.compile_variations({"concept": "a blue cup", "style": "", "locks": {}, "output_prefix": "images"}, 1, 3)[0]
        self.assertNotEqual(row["full_prompt"], "a blue cup")
        self.assertIn("Composition:", row["full_prompt"])
        self.assertFalse(row["metadata"]["ideation_batch"])

    def test_known_axis_locks_replace_random_axis_instructions(self):
        request = self.request()
        request["locks"].update({
            "palette": "exact Pantone red and cream only",
            "composition": "centered packshot with equal margins",
        })
        rows = MODULE.compile_variations(request, 8, 3)
        self.assertEqual(len({row["full_prompt"] for row in rows}), 8)
        for row in rows:
            axes = row["metadata"]["variation_axes"]
            self.assertEqual(axes["palette"], "exact Pantone red and cream only")
            self.assertEqual(axes["composition"], "centered packshot with equal margins")
            self.assertIn("Palette: exact Pantone red and cream only.", row["full_prompt"])
            self.assertIn("Composition: centered packshot with equal margins.", row["full_prompt"])
            self.assertNotIn("palette=", row["full_prompt"])
            self.assertNotIn("composition=", row["full_prompt"])

    def test_all_axis_locks_allow_only_one_unique_record(self):
        request = self.request()
        request["locks"].update({name: f"fixed {name}" for name in MODULE.AXES})
        row = MODULE.compile_variations(request, 1, 3)[0]
        self.assertEqual(
            row["metadata"]["variation_axes"],
            {name: f"fixed {name}" for name in MODULE.AXES},
        )
        with self.assertRaisesRegex(ValueError, "exceeds the 1 unique variation"):
            MODULE.compile_variations(request, 2, 3)

    def test_count_cannot_exceed_remaining_unlocked_space(self):
        request = self.request()
        request["locks"].update({name: f"fixed {name}" for name in MODULE.AXES if name != "camera"})
        rows = MODULE.compile_variations(request, 8, 3)
        self.assertEqual(len({row["full_prompt"] for row in rows}), 8)
        with self.assertRaisesRegex(ValueError, "exceeds the 8 unique variation"):
            MODULE.compile_variations(request, 9, 3)

    def test_exact_text_and_logo_requirements_are_not_contradicted(self):
        request = self.request()
        request["locks"] = {
            "text": "render BLACKCRUNCH exactly",
            "logo": "preserve the supplied product logo exactly",
        }
        prompt = MODULE.compile_variations(request, 1, 3)[0]["full_prompt"]
        self.assertIn("text=render BLACKCRUNCH exactly", prompt)
        self.assertIn("logo=preserve the supplied product logo exactly", prompt)
        self.assertNotIn("accidental text", prompt)
        self.assertNotIn("logos", prompt)
        self.assertIn("Preserve every requested content element and mark exactly", prompt)

    def test_requested_watermark_and_ui_frame_are_not_prohibited(self):
        request = self.request()
        request["concept"] = "a software mockup inside a decorative UI frame"
        request["locks"] = {"watermark": "retain the supplied proof watermark"}
        prompt = MODULE.compile_variations(request, 1, 3)[0]["full_prompt"]
        self.assertIn("watermark=retain the supplied proof watermark", prompt)
        self.assertNotIn("avoid generic stock-image polish", prompt)
        self.assertNotIn("watermarks,", prompt)
        self.assertNotIn("decorative UI frames", prompt)

    def test_cli_writes_portable_jsonl_and_refuses_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            request = root / "request.json"
            output = root / "manifest.jsonl"
            request.write_text(json.dumps(self.request(), ensure_ascii=False), encoding="utf-8")
            self.assertEqual(MODULE.main(["--request", str(request), "--count", "3", "--output", str(output), "--seed", "9"]), 0)
            rows = [json.loads(line) for line in output.read_text(encoding="utf-8").splitlines()]
            self.assertEqual(len(rows), 3)
            self.assertEqual(MODULE.main(["--request", str(request), "--count", "3", "--output", str(output)]), 2)

    def test_invalid_inputs_fail_closed(self):
        with self.assertRaises(ValueError):
            MODULE.compile_variations(self.request(), 0)
        with self.assertRaises(ValueError):
            MODULE.compile_variations(self.request(), 1001)
        with self.assertRaises(ValueError):
            MODULE.compile_variations(self.request(), "2")
        with self.assertRaisesRegex(ValueError, "request locks"):
            MODULE.compile_variations({"concept": "x", "style": "", "output_prefix": "images"}, 1)
        with tempfile.TemporaryDirectory() as tmp:
            request = Path(tmp) / "bad.json"
            request.write_text(json.dumps({"concept": "x", "output_prefix": "../escape"}), encoding="utf-8")
            with self.assertRaises(ValueError):
                MODULE._request(request)


if __name__ == "__main__":
    unittest.main()
