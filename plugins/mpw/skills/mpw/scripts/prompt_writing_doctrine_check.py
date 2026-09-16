#!/usr/bin/env python3
"""Weekly no-agent doctrine check for canonical HeiTuz checkouts.

Healthy runs are silent and always exit zero so a finding is a human work item,
not a failed cron lane.  Proposal exports are read as a backlog only; this
runner never edits, applies, or archives them.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path

MPW = Path(__file__).resolve().parents[1]
CANONICAL_ROOT = MPW.parent
DEFAULT_STATE = Path.home() / ".codex" / "state" / "prompt-writing-doctrine" / "backlog.json"
DEFAULT_GARDEN_ROOTS = {
    "image": Path.home() / ".codex" / "image-reference-garden",
    "design": Path.home() / ".codex" / "design-reference-garden",
    "prompt-knowledge": Path.home() / ".codex" / "prompt-knowledge-garden",
}
ROSTER_FRESH_DAYS = 30
ROSTER_STALE_DAYS = 90
FUTURE_SKEW_DAYS = 1
BACKLOG_GROWTH = 5
BACKLOG_AGE_DAYS = 45
AGE_REMINDER_DAYS = 30
ROSTER_MARKER_RE = re.compile(r"<!--\s*roster-snapshot:\s*(\d{4}-\d{2}-\d{2})\s*-->")
ABSENT_FROM_S1 = {"ar": ("2:3", "4:5", "3:2"), "size": ("1792x1024", "1024x1792", "2048x2048")}
REQUIRED_IN_S1 = {
    "ar": ("1:1", "3:4", "4:3", "9:16", "16:9"),
    "size": ("1024x1024", "1536x1024", "1024x1536"),
    "quality": ("low", "medium", "high"),
}
S1_ENUM_SCHEMAS = (
    "contracts/v1/production-adapter-options.schema.json",
    "contracts/v1/imggen2-production-record.schema.json",
)
LENGTH_CONTRACTS = (
    ("contracts/v1/prompt-bundle.schema.json", ("$defs", "promptBlock", "properties", "text", "maxLength"), 2000),
    ("contracts/v1/prompt-bundle.schema.json", ("$defs", "promptBlock", "properties", "unicode_char_count", "maximum"), 2000),
)


def today() -> date:
    return datetime.now(timezone.utc).date()


def parse_day(value: object) -> date | None:
    try:
        return datetime.strptime(str(value), "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def read_state(path: Path) -> tuple[dict, dict]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001 - a corrupt reminder must re-baseline silently
        return {}, {}
    if not isinstance(data, dict):
        return {}, {}
    roots, roster = data.get("roots"), data.get("roster")
    return (roots if isinstance(roots, dict) else {}, roster if isinstance(roster, dict) else {})


def write_state(path: Path, roots: dict, roster: dict) -> str | None:
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        tmp = path.with_suffix(path.suffix + ".tmp")
        tmp.write_text(json.dumps({"version": 1, "updated_at": today().isoformat(), "roots": roots, "roster": roster}, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        tmp.replace(path)
    except Exception as exc:  # noqa: BLE001
        return f"- doctrine-check state could not be written to {path}: {exc}"
    return None


def check_roster_age(mpw: Path, state: dict, now: date) -> list[str]:
    path = mpw / "references/image/model-routing.md"
    if not path.is_file():
        return [f"- model-routing.md missing at {path} — S2 model routing has no snapshot"]
    markers = ROSTER_MARKER_RE.findall(path.read_text(encoding="utf-8"))
    if not markers:
        return ["- model-routing.md carries no `<!-- roster-snapshot: YYYY-MM-DD -->` marker — the snapshot age cannot be checked."]
    if len(set(markers)) > 1:
        return [f"- model-routing.md has conflicting roster-snapshot markers: {sorted(set(markers))}"]
    try:
        snapshot = datetime.strptime(markers[0], "%Y-%m-%d").date()
    except ValueError:
        return [f"- model-routing.md roster-snapshot marker unparseable: {markers[0]}"]
    age = (now - snapshot).days
    if age < -FUTURE_SKEW_DAYS:
        return [f"- roster snapshot is future-dated ({snapshot}, {-age}d ahead) — fix the date."]
    if age > ROSTER_STALE_DAYS:
        tier, line = "stale", f"- platform roster snapshot is {age}d old ({snapshot}) — over {ROSTER_STALE_DAYS}d; re-list models."
    elif age > ROSTER_FRESH_DAYS:
        tier, line = "aging", f"- platform roster snapshot is {age}d old ({snapshot}) — verify parameters at runtime before compiling."
    else:
        state.pop("roster", None)
        return []
    prior = state.get("roster") if isinstance(state.get("roster"), dict) else {}
    acknowledged = parse_day(prior.get("ack"))
    if prior.get("tier") == tier and prior.get("snapshot") == markers[0] and acknowledged and (now - acknowledged).days < AGE_REMINDER_DAYS:
        return []
    state["roster"] = {"tier": tier, "snapshot": markers[0], "ack": now.isoformat()}
    return [line]


def load_schema(mpw: Path, relative: str) -> tuple[dict | None, str | None]:
    path = mpw / relative
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except FileNotFoundError:
        return None, f"- S1 schema missing at {path} — surfaces.md points at a file that is not there"
    except (OSError, json.JSONDecodeError) as exc:
        return None, f"- S1 schema unreadable ({path.name}): {exc}"


def dig(value: dict, parts: tuple[str, ...]):
    node: object = value
    for part in parts:
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
    return node


def check_contract_drift(mpw: Path) -> list[str]:
    lines: list[str] = []
    for relative in S1_ENUM_SCHEMAS:
        schema, error = load_schema(mpw, relative)
        if error:
            lines.append(error)
            continue
        for field in sorted(set(ABSENT_FROM_S1) | set(REQUIRED_IN_S1)):
            enum = (schema or {}).get("properties", {}).get(field, {}).get("enum")
            if not isinstance(enum, list):
                lines.append(f"- {Path(relative).name} has no {field} enum — docs claim it is the authority")
                continue
            appeared = [item for item in ABSENT_FROM_S1.get(field, ()) if item in enum]
            missing = [item for item in REQUIRED_IN_S1.get(field, ()) if item not in enum]
            if appeared:
                lines.append(f"- {Path(relative).name} {field} now includes {', '.join(appeared)} — reconcile prose and schema.")
            if missing:
                lines.append(f"- {Path(relative).name} {field} lost {', '.join(missing)} — reconcile prose and schema.")
    for relative, parts, expected in LENGTH_CONTRACTS:
        schema, error = load_schema(mpw, relative)
        if error:
            lines.append(error)
        elif dig(schema or {}, parts) != expected:
            lines.append(f"- {Path(relative).name} {'.'.join(parts)} is not {expected} — the documented length contract drifted.")
    return lines


def check_dictionary_reachable(canonical_root: Path) -> list[str]:
    gardener = canonical_root / "image-reference-gardener"
    script = gardener / "scripts/image_reference_garden.py"
    if not script.is_file():
        return []
    try:
        scripts_dir = str(script.parent)
        sys.path.insert(0, scripts_dir)
        spec = importlib.util.spec_from_file_location("_doctrine_image_gardener", script)
        if spec is None or spec.loader is None:
            return ["- image gardener module could not be loaded for the dictionary check"]
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        entries, source = module.load_editorial_dictionary(gardener)
    except Exception as exc:  # noqa: BLE001
        return [f"- image gardener dictionary check errored: {exc}"]
    finally:
        if str(script.parent) in sys.path:
            sys.path.remove(str(script.parent))
    return [] if entries else [f"- image gardener cannot reach the MPW editorial dictionary (source={source})"]


def check_contract_mirrors(mpw: Path, canonical_root: Path) -> list[str]:
    destinations = [canonical_root / name for name in ("image-reference-gardener", "design-reference-gardener", "prompt-knowledge-gardener") if (canonical_root / name).is_dir()]
    if not destinations:
        return []
    proc = subprocess.run([sys.executable, str(mpw / "scripts/sync_contracts.py"), *sum((["--dest", str(dest)] for dest in destinations), [])], capture_output=True, text=True, check=False, timeout=60)
    if proc.returncode == 0:
        return []
    detail = (proc.stdout + "\n" + proc.stderr).strip().splitlines()[:8]
    return ["- contract mirrors drifted from MPW/contracts — rerun scripts/sync_contracts.py --sync:", *[f"  {line}" for line in detail]]


def check_backlog(previous: dict, roots: dict[str, Path], now: date) -> tuple[list[str], dict]:
    lines: list[str] = []
    next_state: dict = {}
    for name, root in roots.items():
        exports = root / "exports"
        if not exports.is_dir():
            continue
        try:
            proposals = [path for path in exports.glob("*.md") if path.is_file()]
            oldest = min(proposals, key=lambda path: path.stat().st_mtime) if proposals else None
        except OSError as exc:
            lines.append(f"- {name} exports scan error: {exc}")
            continue
        age = (datetime.now(timezone.utc) - datetime.fromtimestamp(oldest.stat().st_mtime, timezone.utc)).days if oldest else 0
        entry = previous.get(name) if isinstance(previous.get(name), dict) else None
        if not entry or not isinstance(entry.get("count"), int):
            next_state[name] = {"count": len(proposals), "age_ack": now.isoformat()}
            continue
        baseline = entry["count"]
        age_ack = parse_day(entry.get("age_ack")) or now
        if len(proposals) - baseline >= BACKLOG_GROWTH:
            lines.append(f"- {name}: backlog grew {baseline} → {len(proposals)} unreviewed proposal(s) in exports/ (+{len(proposals) - baseline}, oldest {age}d) — triage or archive; proposals never auto-apply.")
            baseline = len(proposals)
        elif len(proposals) < baseline:
            baseline = len(proposals)
        if oldest and age > BACKLOG_AGE_DAYS and (now - age_ack).days >= AGE_REMINDER_DAYS:
            lines.append(f"- {name}: oldest unreviewed proposal is {age}d old ({oldest.name}) — decide or archive it; proposals never auto-apply.")
            age_ack = now
        next_state[name] = {"count": baseline, "age_ack": age_ack.isoformat()}
    for name, entry in previous.items():
        if name not in next_state and isinstance(entry, dict):
            next_state[name] = entry
    return lines, next_state


def parse_garden_roots(values: list[str] | None) -> dict[str, Path]:
    roots = dict(DEFAULT_GARDEN_ROOTS)
    for value in values or []:
        name, separator, raw_path = value.partition("=")
        if not separator or not name or not raw_path:
            raise ValueError("--garden-root must be NAME=PATH")
        roots[name] = Path(raw_path).expanduser().resolve()
    return roots


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--state", help="Reminder state path (default: MPW_DOCTRINE_STATE or ~/.codex/state/prompt-writing-doctrine/backlog.json)")
    parser.add_argument("--canonical-root", default=str(CANONICAL_ROOT), help="Canonical HeiTuz checkout root for sibling checks")
    parser.add_argument("--garden-root", action="append", help="Backlog root override as NAME=PATH; repeatable")
    args = parser.parse_args(argv)
    state = Path(args.state or os.environ.get("MPW_DOCTRINE_STATE") or DEFAULT_STATE).expanduser().resolve()
    canonical_root = Path(args.canonical_root).expanduser().resolve()
    if not MPW.is_dir():
        print(f"prompt-writing doctrine check FAILED: canonical MPW checkout missing at {MPW}")
        return 0
    previous, roster = read_state(state)
    now = today()
    lines: list[str] = []
    for check in (
        lambda: check_roster_age(MPW, roster, now),
        lambda: check_contract_drift(MPW),
        lambda: check_dictionary_reachable(canonical_root),
        lambda: check_contract_mirrors(MPW, canonical_root),
    ):
        try:
            lines.extend(check())
        except Exception as exc:  # noqa: BLE001 - all findings must remain reportable
            lines.append(f"- doctrine check errored: {exc}")
    try:
        backlog_lines, next_roots = check_backlog(previous, parse_garden_roots(args.garden_root), now)
        lines.extend(backlog_lines)
    except Exception as exc:  # noqa: BLE001
        next_roots = previous
        lines.append(f"- check_backlog errored: {exc}")
    error = write_state(state, next_roots, roster)
    if error:
        lines.append(error)
    if lines:
        print("prompt-writing doctrine check:")
        print(*dict.fromkeys(lines), sep="\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
