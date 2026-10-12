#!/usr/bin/env python3
"""Collect local generation evidence; never generate, publish or edit source runs."""
from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
from pathlib import Path
import re
import tempfile
from datetime import datetime, timezone

VERSION = 2
TERMINAL = {'post_ready', 'held', 'blocked'}
DONE_ATTEMPTS = {'generated', 'passed', 'failed_review', 'failed', 'not_submitted'}
LEGACY_VISUAL_KEYS = ('opens', 'concept_match', 'complete', 'no_unintended_text_or_logo', 'form_ok')


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def encoded(value) -> bytes:
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode()


def read_json(path: Path):
    return json.loads(path.read_bytes())


def file_hash(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def atomic_write(path: Path, value):
    path.parent.mkdir(parents=True, exist_ok=True, mode=0o700)
    data = encoded(value)
    if path.exists() and path.read_bytes() == data:
        return
    fd, name = tempfile.mkstemp(dir=path.parent, prefix='.' + path.name)
    try:
        with os.fdopen(fd, 'wb') as out:
            out.write(data)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def local_file(run: Path, value: str) -> Path:
    path = Path(value)
    path = (path if path.is_absolute() else run / path).resolve()
    if not path.is_relative_to(run.resolve()):
        raise ValueError('image outside run directory')
    return path


def leased_run(runs_root: Path):
    path = runs_root.parent / '.lease.json'
    if not path.exists():
        return None
    lease = read_json(path)
    if not isinstance(lease, dict) or not isinstance(lease.get('expires_at'), str) or not lease.get('run'):
        raise ValueError('invalid lease record')
    expires = datetime.fromisoformat(lease['expires_at'].replace('Z', '+00:00'))
    if expires.tzinfo is None:
        raise ValueError('lease timestamp has no timezone')
    return lease['run'] if expires > datetime.now(timezone.utc) else None


def build_attempt(run: Path, attempt: dict, prompt: dict) -> dict:
    if attempt.get('prompt_sha256') != prompt.get('sha256'):
        raise ValueError('prompt_sha256 mismatch')
    auto = attempt.get('auto_review') or {}
    visual = attempt.get('visual_review') or {}
    rows = visual.get('images') or []
    if len({r['index'] for r in rows}) != len(rows):
        raise ValueError('duplicate visual review index')
    reviews = {r['index']: r for r in rows}
    selected = attempt.get('selected') or []
    if visual and selected != visual.get('selected', []):
        raise ValueError('selected differs from visual review')
    if 'passing' in visual:
        passing = set(visual['passing'])
        verdict_source = 'recorded_passing'
    else:
        # Old records predate optional photo_style/person_prominent checks.
        passing = {r['index'] for r in rows if all(r.get(k) is True for k in LEGACY_VISUAL_KEYS)
                   and all(r.get(k, True) is True for k in ('photo_style', 'person_prominent'))}
        verdict_source = 'legacy_recorded_checks' if rows else 'no_visual_verdict'
    usable = set(auto['usable']) if 'usable' in auto else None
    if not set(selected).issubset(passing) or (usable is not None and not passing.issubset(usable)):
        raise ValueError('selected/passing/usable verdict mismatch')
    revoked = attempt.get('revoked')
    images = []
    indexes = set()
    for im in attempt.get('images', []):
        idx = im['index']
        if idx in indexes:
            raise ValueError('duplicate image index')
        indexes.add(idx)
        path = local_file(run, im['file'])
        actual = file_hash(path)
        if actual != im.get('sha256'):
            raise ValueError(f'image {idx}: sha256 mismatch')
        row = reviews.get(idx)
        chosen = idx in selected
        if chosen:
            outcome = 'selected'
        elif idx in passing:
            outcome = 'passed_not_selected'
        elif usable is not None and idx not in usable:
            outcome = 'auto_rejected'
        elif row:
            outcome = 'failed_review'
        else:
            outcome = 'unreviewed'
        images.append({'index': idx, 'file': str(path), 'sha256': actual,
                       'bytes': path.stat().st_size, 'source': im.get('source'),
                       'character': im.get('character'), 'selected': chosen and not bool(revoked),
                       'was_selected': chosen, 'review_outcome': outcome,
                       'outcome': 'revoked' if revoked else outcome, 'visual_review': row})
    if (not (set(selected) | passing | set(reviews)).issubset(indexes)
            or (usable is not None and not usable.issubset(indexes))):
        raise ValueError('review/selection references missing image')
    return {'n': attempt['n'], 'status': attempt['status'],
            'prompt_sha256': attempt['prompt_sha256'], 'batch_size': attempt.get('batch_size'),
            'generated_count': len(images), 'selected_count': 0 if revoked else len(selected),
            'previously_selected_count': len(selected) if revoked else 0,
            'revoked': revoked, 'verdict_source': verdict_source,
            'job_id': attempt.get('job_id'), 'jobs': attempt.get('jobs', []),
            'calls': [{k: c[k] for k in ('i', 'count', 'status', 'character', 'result', 'error') if k in c}
                      for c in attempt.get('calls', [])],
            'character_batch': attempt.get('character_batch', []),
            'reason': attempt.get('reason'), 'images': images, 'auto_review': auto,
            'visual_review': visual, 'generated_at': attempt.get('generated_at')}


def build_run(run: Path):
    state_path = run / 'state.json'
    if not state_path.exists():
        return [], [{'run': run.name, 'reason': 'not_started'}]
    before = state_path.read_bytes()
    state = json.loads(before)
    if not isinstance(state, dict):
        raise ValueError('state must be an object')
    if state.get('run') != run.name:
        raise ValueError('run identity mismatch')
    if state.get('status') not in TERMINAL:
        return [], [{'run': run.name, 'reason': 'in_progress', 'status': state.get('status')}]
    cases, issues = [], []
    catalog = {}
    snapshots = [(x, 'superseded') for x in state.get('superseded', [])] + [(state, 'current')]
    for snapshot, status in snapshots:
        for lane, prompt in (snapshot.get('prompts') or {}).items():
            if not isinstance(prompt.get('prompt_text'), str) or not prompt['prompt_text'].strip():
                raise ValueError('missing generation prompt')
            if digest(prompt['prompt_text'].strip().encode()) != prompt.get('sha256'):
                raise ValueError('generation prompt content hash mismatch')
            catalog[(lane, prompt['sha256'])] = (prompt, snapshot.get('concept'), status)
    groups = {}
    for a in state.get('attempts', []):
        key = (a.get('lane'), a.get('prompt_sha256'))
        issue = {'run': run.name, 'lane': key[0], 'prompt_sha256': key[1], 'attempt': a.get('n')}
        if a.get('status') not in DONE_ATTEMPTS:
            issues.append({**issue, 'reason': 'attempt_in_progress'})
            continue
        if key not in catalog:
            issues.append({**issue, 'reason': 'quarantined', 'detail': 'no matching current or archived prompt_sha256'})
            continue
        try:
            groups.setdefault(key, []).append(build_attempt(run, a, catalog[key][0]))
        except (ValueError, OSError, KeyError, TypeError) as exc:
            issues.append({**issue, 'reason': 'quarantined', 'detail': str(exc)})
    # Only state.attempts is enumerated; archived attempts are duplicate snapshots.
    lookup = {(a['n'], im['index']): im for group in groups.values() for a in group for im in a['images']}
    for im in (state.get('post') or {}).get('images', []):
        origin = lookup.get((im.get('attempt'), im.get('index')))
        if not origin or origin['sha256'] != im.get('sha256') or not origin['selected']:
            issues.append({'run': run.name, 'reason': 'quarantined',
                           'detail': 'post image linkage mismatch', 'attempt': im.get('attempt')})
            return [], issues
    for (lane, sha), attempts in groups.items():
        prompt, concept, prompt_status = catalog[(lane, sha)]
        # Failed submissions remain diagnostics, not negative image examples.
        if not any(a['images'] for a in attempts):
            issues.append({'run': run.name, 'lane': lane, 'prompt_sha256': sha, 'reason': 'no_verified_results'})
            continue
        post_images = []
        attempt_numbers = {a['n'] for a in attempts}
        for im in (state.get('post') or {}).get('images', []):
            if im.get('lane') != lane or im.get('attempt') not in attempt_numbers:
                continue
            post_images.append({k: im.get(k) for k in ('attempt', 'index', 'sha256', 'order')})
        refs = prompt.get('mpw_refs_read') or []
        provenance = ('external_extract_preserved' if refs == ['n/a'] else
                      'mpw_referenced' if refs else 'unknown')
        # Do not infer a generation engine from a public label, author model, or character.
        case = {'schema_version': VERSION, 'run': run.name, 'lane': lane,
                'source_state': str(state_path), 'status': state['status'],
                'concept': concept, 'prompt_status': prompt_status,
                'assigned_params': (state.get('assigned_params') or {}).get(lane) if prompt_status == 'current' else None,
                'prompt': prompt, 'prompt_provenance': provenance,
                'runtime_model': None, 'runtime_model_note': 'Use job receipts; target_model can be a public label.',
                'attempts': attempts, 'post_images': post_images,
                'diagnostics': [i for i in issues if (i.get('lane'), i.get('prompt_sha256')) == (lane, sha)],
                'evidence_scope': 'generation prompt and recorded review; no causal effect or new visual review asserted'}
        case_id = f'{run.name}--{lane}--{sha}'
        if not re.fullmatch(r'[\w.-]+', case_id):
            raise ValueError('invalid case identifier')
        case['case_id'] = case_id
        case['revision'] = digest(encoded(case))
        cases.append(case)
    if state_path.read_bytes() != before:
        return [], [{'run': run.name, 'reason': 'changed_during_collection'}]
    return cases, issues


def decisions(path: Path):
    result = set()
    if not path.exists():
        return result
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line)
        if (not isinstance(row, dict) or
                row.get('decision') not in {'adopt', 'merge', 'hold', 'discard'} or
                not row.get('reason') or not row.get('case_id') or not row.get('revision')):
            raise ValueError(f'invalid decision line {n}')
        result.add((row['case_id'], row['revision']))
    return result


def collect(runs_root: Path, output: Path):
    runs_root, output = runs_root.resolve(), output.resolve()
    if not runs_root.is_dir():
        raise ValueError('runs root does not exist')
    if output.is_relative_to(runs_root):
        raise ValueError('output must be outside source runs')
    done = decisions(output / 'decisions.jsonl')
    active = leased_run(runs_root)
    cases, issues = [], []
    for run in sorted(runs_root.iterdir()):
        if not run.is_dir() or not re.fullmatch(r'\d{4}-\d{2}-\d{2}(?:-[\w-]+)?', run.name):
            continue
        if run.name == active:
            issues.append({'run': run.name, 'reason': 'active_lease'})
            continue
        try:
            rows, errors = build_run(run)
            cases.extend(rows)
            issues.extend(errors)
        except (ValueError, OSError, KeyError, TypeError) as exc:
            issues.append({'run': run.name, 'reason': 'quarantined', 'detail': str(exc)})
    # A producer may acquire its lease after the initial read.
    active_after = leased_run(runs_root)
    if active_after:
        cases = [case for case in cases if case['run'] != active_after]
        if active_after != active:
            issues.append({'run': active_after, 'reason': 'lease_acquired_during_collection'})
    entries = []
    for case in cases:
        rel = Path('cases') / case['case_id'] / (case['revision'] + '.json')
        atomic_write(output / rel, case)
        entries.append({'case_id': case['case_id'], 'revision': case['revision'],
                        'file': str(output / rel), 'run': case['run'], 'lane': case['lane'],
                        'images': sum(a['generated_count'] for a in case['attempts']),
                        'selected': sum(a['selected_count'] for a in case['attempts']),
                        'pending': (case['case_id'], case['revision']) not in done})
    index = {'schema_version': VERSION, 'runs_root': str(runs_root), 'cases': entries,
             'pending': [e for e in entries if e['pending']], 'issues': issues}
    atomic_write(output / 'index.json', index)
    return {'cases': len(entries), 'images': sum(e['images'] for e in entries),
            'pending': len(index['pending']), 'issues': len(issues), 'index': str(output / 'index.json')}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--runs-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args(argv)
    # Validate before even creating the output lock/directory inside a source tree.
    if not args.runs_root.is_dir() or args.output.resolve().is_relative_to(args.runs_root.resolve()):
        print(json.dumps({'status': 'error', 'error': 'require an existing runs root and output outside it'}))
        return 1
    args.output.mkdir(parents=True, exist_ok=True, mode=0o700)
    with (args.output / '.collect.lock').open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print(json.dumps({'status': 'busy'}))
            return 0
        try:
            print(json.dumps(collect(args.runs_root, args.output), ensure_ascii=False))
            return 0
        except (ValueError, OSError) as exc:
            print(json.dumps({'status': 'error', 'error': str(exc)}, ensure_ascii=False))
            return 1


if __name__ == '__main__':
    raise SystemExit(main())
