#!/usr/bin/env python3
"""Golden prompt professionalism checks for the merged MPW output contract."""
import json
import re
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GOLDEN_DIR = ROOT / "scripts" / "fixtures" / "golden"
EXPECTED_IDS = {
    "new-write",
    "revision",
    "delta",
    "system-prompt",
    "research-factcheck",
    "coding-agent",
    "business",
    "image-video",
}
DENYLIST = (
    re.compile(r"공냥이|gongnyang|specal1849|gpt-image-2|Higgsfield|Soul", re.IGNORECASE),
    re.compile(r"화보|에디토리얼|editorial|film grain|golden hour|rim light", re.IGNORECASE),
    re.compile(r"#[0-9A-Fa-f]{6}"),
    re.compile(r"\bAR\s+\d+\s*:\s*\d+", re.IGNORECASE),
)
VAGUE_WORD_DENYLIST = (
    ("적절히", re.compile(r"적절히")),
    ("알아서", re.compile(r"알아서")),
    ("잘 정리", re.compile(r"잘 정리")),
    ("최대한 자세히", re.compile(r"최대한 자세히")),
    ("최대한 빨리", re.compile(r"최대한 빨리")),
    ("필요하면", re.compile(r"필요하면")),
    ("중요한 것 위주", re.compile(r"중요한 것 위주")),
    ("완벽하게", re.compile(r"완벽하게")),
    ("깔끔하게", re.compile(r"깔끔하게")),
    ("고급스럽게", re.compile(r"고급스럽게")),
    ("nicely", re.compile(r"\bnicely\b", re.IGNORECASE)),
    ("properly", re.compile(r"\bproperly\b", re.IGNORECASE)),
    ("in detail", re.compile(r"\bin detail\b", re.IGNORECASE)),
)


def matching_vague_word(text: str) -> str | None:
    return next((term for term, pattern in VAGUE_WORD_DENYLIST if pattern.search(text)), None)


def has_denylisted_term(text: str) -> bool:
    return any(pattern.search(text) for pattern in DENYLIST)


def without_frontmatter(text: str) -> str:
    if not text.startswith("---"):
        return text
    end = re.search(r"^---\s*$", text[3:], re.MULTILINE)
    return text[3 + end.end():] if end else text


class OutputProfessionalismTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        manifest = json.loads((GOLDEN_DIR / "manifest.json").read_text(encoding="utf-8"))
        cls.entries = []
        for entry in manifest:
            payload = json.loads((GOLDEN_DIR / entry["file"]).read_text(encoding="utf-8"))
            cls.entries.append((entry["id"], payload))

    def test_manifest_has_exactly_the_contracted_ids(self):
        self.assertEqual({entry_id for entry_id, _ in self.entries}, EXPECTED_IDS)
        self.assertEqual(len(self.entries), len(EXPECTED_IDS))

    def test_all_expected_prompts_fit_the_codepoint_limit(self):
        for entry_id, payload in self.entries:
            expected = payload["expected"]
            prompts = expected.values() if entry_id == "image-video" else (expected,)
            for prompt in prompts:
                self.assertLessEqual(len(prompt), 2000, f"{entry_id} exceeds 2000 code points")

    def test_non_image_expected_prompts_have_no_image_lane_terms(self):
        for entry_id, payload in self.entries:
            if entry_id == "image-video":
                continue
            self.assertFalse(has_denylisted_term(payload["expected"]), entry_id)

    def test_non_image_expected_prompts_have_no_vague_words(self):
        for entry_id, payload in self.entries:
            if entry_id == "image-video":
                continue
            matched_term = matching_vague_word(payload["expected"])
            self.assertIsNone(matched_term, f"{entry_id}: {matched_term}")

    def test_execution_goldens_have_judgeable_completion_criteria(self):
        completion_criteria = re.compile(
            r"완료 기준|## 완료|완료 조건|Definition of Done|Completion criteria|\bDoD\b|반환 형식|Response format",
            re.IGNORECASE,
        )
        for entry_id, payload in self.entries:
            if entry_id in {"new-write", "coding-agent", "system-prompt"}:
                self.assertRegex(payload["expected"], completion_criteria, entry_id)

    def test_image_expected_passes_native_prompt_validator(self):
        image = next(payload["expected"]["image"] for entry_id, payload in self.entries if entry_id == "image-video")
        result = subprocess.run(
            ["node", "scripts/check_prompt.mjs", "--profile", "native", "--surface", "s3"],
            cwd=ROOT,
            input=image,
            text=True,
            capture_output=True,
            check=False,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        report = json.loads(result.stdout)
        self.assertTrue(report["ok"])

    def test_video_expected_preserves_subject_and_motion_without_engine_template(self):
        video = next(payload["expected"]["video"] for entry_id, payload in self.entries if entry_id == "image-video")
        self.assertTrue(video.strip(), "video golden must contain a prompt")
        self.assertRegex(video, r"도서관|책|library|books", "video must preserve the requested subject")
        self.assertRegex(video, r"움직|이동|move|camera|카메라", "video must specify a visible movement")
        self.assertNotRegex(video, r"(?m)^씬\s+\d+\s*$", "generic video prompt must not require named scenes")
        self.assertNotRegex(video, r"(?m)^카메라 모션:", "generic video prompt must not require a template label")
        self.assertNotRegex(video, r"(?m)^Dialogue\s+-", "generic video prompt must not invent a dialogue format")
        self.assertNotRegex(video, r"(?m)^네거티브:", "generic video prompt must not invent an inline negative field")

    def test_generic_docs_do_not_leak_image_lane_terms(self):
        for path in [ROOT / "SKILL.md", ROOT / "references" / "templates.md",
                     *sorted((ROOT / "references" / "templates").glob("*.md"))]:
            body = without_frontmatter(path.read_text(encoding="utf-8"))
            for line_number, line in enumerate(body.splitlines(), start=1):
                if "references/image/" in line:
                    continue
                self.assertFalse(has_denylisted_term(line), f"{path.relative_to(ROOT)}:{line_number}: {line}")


if __name__ == "__main__":
    unittest.main()
