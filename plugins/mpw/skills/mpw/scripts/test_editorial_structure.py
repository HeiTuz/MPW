#!/usr/bin/env python3
"""Structural tests for the editorial reader and topic size caps."""
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).resolve().parent.parent
EDITORIAL = ROOT / "references" / "image" / "editorial"
ROUTER = ROOT / "references" / "image" / "editorial-fashion.md"
FASHION_CHAR_LIMIT = 3500
TOPIC_BYTE_LIMIT = 20480

REQUIRED_FASHION_HEADINGS = (
    "## 읽을 자료",
    "## 인물 스틸 기본",
    "## 노출 수위가 있는 패션 요청",
    "## 시리즈·룩북",
    "## 점검",
)

DICT_MARKERS = (
    "<!-- dict:depth_lens -->",
    "<!-- dict:lighting -->",
    "<!-- dict:film_stock -->",
    "<!-- dict:technique -->",
    "<!-- dict:emotional_preset -->",
    "<!-- dict:composition -->",
    "<!-- dict:material_finish -->",
    "<!-- dict:genre_combo -->",
)


def router_links(router_text):
    """Return editorial/*.md targets listed in the reader table."""
    links = []
    for line in router_text.splitlines():
        match = re.search(r"\]\((editorial/[^ )]+)\)", line)
        if match:
            links.append(match.group(1))
    return links


class EditorialStructureTests(unittest.TestCase):
    def setUp(self):
        self.router_text = ROUTER.read_text(encoding="utf-8")
        self.links = router_links(self.router_text)
        self.topic_files = sorted(path for path in EDITORIAL.glob("*.md") if path.is_file())

    def test_router_links_equal_editorial_files(self):
        linked = {Path(link).name for link in self.links}
        on_disk = {path.name for path in self.topic_files}
        self.assertTrue(self.links, "reader table has no editorial links")
        self.assertTrue(all(link.startswith("editorial/") for link in self.links))
        self.assertEqual(linked, on_disk)
        self.assertTrue(all((EDITORIAL / Path(link).name).is_file() for link in self.links))

    def test_fashion_headings_and_size(self):
        for heading in REQUIRED_FASHION_HEADINGS:
            self.assertIn(heading, self.router_text)
        self.assertLessEqual(len(self.router_text), FASHION_CHAR_LIMIT)

    def test_topics_are_size_bounded(self):
        for path in self.topic_files:
            relative = path.relative_to(ROOT).as_posix()
            self.assertLess(path.stat().st_size, TOPIC_BYTE_LIMIT, f"{relative} is too large")

    def test_photo_results_machine_anchors(self):
        text = (EDITORIAL / "photo-results.md").read_text(encoding="utf-8")
        for marker in DICT_MARKERS:
            self.assertIn(marker, text, marker)

    def test_missing_router_row_is_rejected(self):
        dropped = re.sub(
            r"\| 두 컨셉을 한 컷에서 증명 \| \[editorial/concept-collision.md\]\(editorial/concept-collision.md\) \|\n",
            "",
            self.router_text,
        )
        self.assertNotEqual(
            {Path(link).name for link in router_links(dropped)},
            {path.name for path in self.topic_files},
        )


if __name__ == "__main__":
    unittest.main()
