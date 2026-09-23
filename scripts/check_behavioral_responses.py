#!/usr/bin/env python3
"""Check recorded model responses against mechanical MPW behavior cases."""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CASES = ROOT / "scripts" / "fixtures" / "behavioral" / "cases.json"
FENCE_OPEN = re.compile(r"^ {0,3}(`{3,}|~{3,})(.*)$")
FENCE_CLOSE = re.compile(r"^ {0,3}([`~]+)[ \t]*$")


class InputError(ValueError):
    """Raised when an input file or its configuration is invalid."""


def read_json(path: Path, label: str) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        raise InputError(f"cannot read {label} JSON {path}: {error}") from error


def require_string_list(value: Any, label: str, *, nonempty: bool = False) -> list[str]:
    if not isinstance(value, list) or any(not isinstance(item, str) for item in value):
        raise InputError(f"{label} must be a list of strings")
    if nonempty and any(not item for item in value):
        raise InputError(f"{label} entries must be nonempty strings")
    return value


def validate_format(value: Any, case_id: str) -> dict[str, Any] | None:
    label = f"case {case_id!r} format"
    if not isinstance(value, dict) or not isinstance(value.get("kind"), str):
        raise InputError(f"{label} must be an object with a kind")
    kind = value["kind"]
    if kind == "plain":
        if set(value) != {"kind"}:
            raise InputError(f"{label} plain format accepts only kind")
    elif kind == "code_blocks":
        if set(value) != {"kind", "count"} or isinstance(value.get("count"), bool) or not isinstance(value.get("count"), int) or value["count"] < 0:
            raise InputError(f"{label} code_blocks requires a nonnegative integer count")
    elif kind == "json":
        if set(value) - {"kind", "keys"}:
            raise InputError(f"{label} json format accepts only kind and keys")
        if "keys" in value:
            keys = require_string_list(value["keys"], f"{label} keys")
            if len(set(keys)) != len(keys):
                raise InputError(f"{label} keys must be unique")
    else:
        raise InputError(f"{label} has unsupported kind {kind!r}")
    return value


def load_cases(path: Path) -> list[dict[str, Any]]:
    value = read_json(path, "cases")
    if isinstance(value, dict):
        value = value.get("cases")
    if not isinstance(value, list):
        raise InputError("cases JSON must be a list or an object containing a cases list")
    cases: list[dict[str, Any]] = []
    seen: set[str] = set()
    for index, case in enumerate(value):
        if not isinstance(case, dict):
            raise InputError(f"case at index {index} must be an object")
        allowed = {"id", "request", "context", "letter", "expected", "forbidden",
                   "semantic_checks", "format", "preserved_strings"}
        if set(case) - allowed:
            raise InputError(f"unknown case keys at index {index}: {sorted(set(case) - allowed)}")
        case_id = case.get("id")
        if not isinstance(case_id, str) or not case_id:
            raise InputError(f"case at index {index} must have a nonempty string id")
        if case_id in seen:
            raise InputError(f"duplicate case id {case_id!r}")
        seen.add(case_id)
        if "expected" in case:
            expected = case["expected"]
            if isinstance(expected, list):
                require_string_list(expected, f"case {case_id!r} expected")
            elif not isinstance(expected, str):
                raise InputError(f"case {case_id!r} expected must be a string or list of strings")
        if "semantic_checks" in case:
            require_string_list(case["semantic_checks"], f"case {case_id!r} semantic_checks")
        if "forbidden" in case:
            require_string_list(case["forbidden"], f"case {case_id!r} forbidden")
        if "preserved_strings" in case:
            require_string_list(case["preserved_strings"], f"case {case_id!r} preserved_strings", nonempty=True)
        case["_format"] = validate_format(case["format"], case_id) if "format" in case else None
        cases.append(case)
    return cases


def load_records(path: Path, label: str, known_ids: set[str]) -> dict[str, dict[str, Any]]:
    records = read_json(path, label)
    if not isinstance(records, list):
        raise InputError(f"{label} JSON must be a list")
    result: dict[str, dict[str, Any]] = {}
    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise InputError(f"{label} entry at index {index} must be an object")
        record_id = record.get("id")
        if not isinstance(record_id, str) or not record_id:
            raise InputError(f"{label} entry at index {index} must have a nonempty string id")
        if record_id in result:
            raise InputError(f"duplicate {label} id {record_id!r}")
        if record_id not in known_ids:
            raise InputError(f"unknown {label} id {record_id!r}")
        if label == "responses":
            if not isinstance(record.get("response"), str):
                raise InputError(f"response for {record_id!r} must be a string")
        else:
            verdict = record.get("verdict")
            reason = record.get("reason")
            if verdict not in ("pass", "fail"):
                raise InputError(f"review verdict for {record_id!r} must be 'pass' or 'fail'")
            if not isinstance(reason, str) or not reason.strip():
                raise InputError(f"review reason for {record_id!r} must be a nonempty string")
        result[record_id] = record
    return result


def check_format(response: str, config: dict[str, Any] | None) -> list[str]:
    if config is None:
        return []
    kind = config["kind"]
    fence_count, fence_errors, outside, saw_fence = scan_fences(response)
    if kind == "plain":
        return ["response contains a fenced code block"] if re.search(r"(?m)^[ \t>]*(?:`{3,}|~{3,})", response) else []
    if kind == "code_blocks":
        errors = list(fence_errors)
        if fence_count != config["count"]:
            errors.append(f"expected {config['count']} fenced code blocks, found {fence_count}")
        if outside.strip():
            errors.append("response contains prose outside fenced code blocks")
        return errors
    try:
        parsed = json.loads(response, parse_constant=reject_json_constant,
                            object_pairs_hook=unique_json_object)
    except (json.JSONDecodeError, ValueError) as error:
        return [f"response is not valid whole-response JSON: {error}"]
    if "keys" in config:
        if not isinstance(parsed, dict):
            return ["JSON response must be an object when exact keys are configured"]
        if set(parsed) != set(config["keys"]):
            return [f"JSON keys must exactly match {config['keys']!r}"]
    return []


def reject_json_constant(value: str) -> None:
    raise ValueError(f"non-standard JSON constant {value}")


def unique_json_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    value: dict[str, Any] = {}
    for key, item in pairs:
        if key in value:
            raise ValueError(f"duplicate JSON object key {key!r}")
        value[key] = item
    return value


def scan_fences(response: str) -> tuple[int, list[str], str, bool]:
    lines = response.splitlines(keepends=True)
    outside: list[str] = []
    errors: list[str] = []
    count = 0
    saw_fence = False
    index = 0
    while index < len(lines):
        line = lines[index].rstrip("\r\n")
        opening = FENCE_OPEN.match(line)
        if opening is None or (opening.group(1)[0] == "`" and "`" in opening.group(2)):
            outside.append(lines[index])
            index += 1
            continue

        saw_fence = True
        marker = opening.group(1)[0]
        fence_length = len(opening.group(1))
        closing_index = index + 1
        while closing_index < len(lines):
            candidate = FENCE_CLOSE.match(lines[closing_index].rstrip("\r\n"))
            if (candidate is not None and candidate.group(1)[0] == marker
                    and len(candidate.group(1)) >= fence_length
                    and len(set(candidate.group(1))) == 1):
                break
            closing_index += 1

        if closing_index == len(lines):
            errors.append("response contains an unmatched fenced code block")
            index += 1
            continue

        body = "".join(lines[index + 1:closing_index])
        if not body.strip():
            errors.append("response contains an empty fenced code block")
        count += 1
        index = closing_index + 1

    return count, errors, "".join(outside), saw_fence


def semantic_criteria(case: dict[str, Any]) -> dict[str, list[str]]:
    criteria = {}
    for key in ("semantic_checks", "expected", "forbidden"):
        value = case.get(key)
        if isinstance(value, list) and value:
            criteria[key] = value
    return criteria


def check_case(case: dict[str, Any], response_record: dict[str, Any] | None,
               review: dict[str, Any] | None) -> dict[str, Any]:
    case_id = case["id"]
    result: dict[str, Any] = {
        "id": case_id,
        "status": "not_run",
        "errors": [],
        "manual_reason": review["reason"] if review else None,
        "unreviewed_semantic_criteria": semantic_criteria(case) if review is None else {},
    }
    if response_record is None:
        return result

    response = response_record["response"]
    errors: list[str] = []
    if not response.strip():
        errors.append("response is empty")
    expected = case.get("expected")
    if isinstance(expected, str) and response != expected:
        errors.append("response does not exactly equal expected string")
    errors.extend(check_format(response, case.get("_format")))
    if "preserved_strings" in case:
        cursor = 0
        for preserved in case["preserved_strings"]:
            position = response.find(preserved, cursor)
            if position < 0:
                errors.append(f"preserved string missing or out of order: {preserved!r}")
                break
            cursor = position + len(preserved)

    result["errors"] = errors
    if errors or (review and review["verdict"] == "fail"):
        result["status"] = "failed"
    elif review and review["verdict"] == "pass":
        result["status"] = "passed"
    else:
        result["status"] = "needs_review"
    return result


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--cases", type=Path, default=DEFAULT_CASES)
    parser.add_argument("--responses", type=Path, required=True)
    parser.add_argument("--model", required=True)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--reviews", type=Path)
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    try:
        cases = load_cases(args.cases)
        known_ids = {case["id"] for case in cases}
        responses = load_records(args.responses, "responses", known_ids)
        reviews = load_records(args.reviews, "reviews", known_ids) if args.reviews else {}
    except InputError as error:
        print(f"input error: {error}", file=sys.stderr)
        return 2

    results = [check_case(case, responses.get(case["id"]), reviews.get(case["id"])) for case in cases]
    counts = {status: sum(result["status"] == status for result in results)
              for status in ("passed", "failed", "needs_review", "not_run")}
    ok = bool(results) and counts["passed"] == len(results)
    report = {
        "model": args.model,
        "revision": args.revision,
        "counts": counts,
        "results": results,
        "ok": ok,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
