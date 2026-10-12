#!/usr/bin/env python3
"""Synthetic-fixture tests for collect_threads_feedback.py (collect/CLI paths, no real run data)."""
from __future__ import annotations

import contextlib
import copy
import fcntl
import hashlib
import io
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parent))
import collect_threads_feedback as C  # noqa: E402

PROMPT = 'Synthetic generation prompt for a test photograph.\n\nFRAME: vertical 4:5 aspect ratio.'
KEYS = ('opens', 'concept_match', 'complete', 'no_unintended_text_or_logo', 'form_ok',
        'person_prominent', 'photo_style')


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def review(index, **override):
    row = {'index': index, 'notes': 'synthetic'}
    row.update({k: True for k in KEYS})
    row.update(override)
    return row


class Fixture:
    """One synthetic run directory with real image files."""

    def __init__(self, root: Path, run='2026-01-02-lunch', lane='pinterest'):
        self.run, self.lane = run, lane
        self.dir = root / run
        self.dir.mkdir(parents=True)
        self.state = {
            'run': run, 'status': 'post_ready', 'lanes': [lane],
            'concept': {'title': 'synthetic concept'}, 'assigned_params': {lane: {'character': 'Alpha'}},
            'prompts': {lane: {'lane': lane, 'prompt_text': PROMPT, 'body': PROMPT,
                               'mpw_refs_read': ['n/a'], 'sha256': sha(PROMPT.encode())}},
            'attempts': [], 'post': None}

    def image(self, n, index):
        content = f'bytes-{n}-{index}'.encode()
        folder = self.dir / f'attempt-{n}'
        folder.mkdir(exist_ok=True)
        (folder / f'img-{index}.png').write_bytes(content)
        return {'index': index, 'file': f'attempt-{n}/img-{index}.png', 'sha256': sha(content),
                'source': f'synthetic:{n}:{index}'}

    def attempt(self, n, status='passed', images=4, selected=(0,), rows=None, **extra):
        att = {'n': n, 'lane': self.lane, 'status': status, 'batch_size': images, 'jobs': [],
               'prompt_sha256': self.state['prompts'][self.lane]['sha256'],
               'images': [self.image(n, i) for i in range(images)], 'selected': list(selected)}
        rows = [review(i) for i in range(images)] if rows is None else rows
        att['visual_review'] = {'reviewer': 'synthetic', 'selected': list(selected), 'images': rows,
                                'passing': [r['index'] for r in rows if all(r[k] for k in KEYS)]}
        att['auto_review'] = {'usable': list(range(images))}
        att.update(extra)
        self.state['attempts'].append(att)
        return att

    def post(self, n, indexes):
        att = next(a for a in self.state['attempts'] if a['n'] == n)
        by_index = {i['index']: i for i in att['images']}
        self.state['post'] = {'images': [
            {'order': k + 1, 'lane': self.lane, 'attempt': n, 'index': i, 'sha256': by_index[i]['sha256']}
            for k, i in enumerate(indexes)]}

    def write(self):
        (self.dir / 'state.json').write_text(json.dumps(self.state, ensure_ascii=False))
        return self.dir


def tree(root: Path):
    return {str(p.relative_to(root)): (sha(p.read_bytes()), p.stat().st_mtime_ns)
            for p in sorted(root.rglob('*')) if p.is_file() and p.name != '.collect.lock'}


class Base(unittest.TestCase):
    def setUp(self):
        tmp = tempfile.TemporaryDirectory()
        self.addCleanup(tmp.cleanup)
        self.tmp = Path(tmp.name)
        self.runs = self.tmp / 'runs'
        self.runs.mkdir()
        self.out = self.tmp / 'out'

    def fixture(self, **kw):
        return Fixture(self.runs, **kw)

    def valid(self, run='2026-01-02-lunch'):
        f = self.fixture(run=run)
        f.attempt(1, images=2, rows=[review(0), review(1)], selected=(0,))
        f.post(1, [0])
        f.write()
        return f

    def index(self):
        return json.loads((self.out / 'index.json').read_text())

    def cli(self, *args):
        buf = io.StringIO()
        with contextlib.redirect_stdout(buf):
            code = C.main(list(args))
        return code, json.loads(buf.getvalue().strip().splitlines()[-1])

    def cli_default(self):
        return self.cli('--runs-root', str(self.runs), '--output', str(self.out))

    def decide(self, lines):
        self.out.mkdir(parents=True, exist_ok=True)
        (self.out / 'decisions.jsonl').write_text('\n'.join(lines) + '\n')

    def write_lease(self, run, delta):
        expires = datetime.now(timezone.utc) + delta
        (self.tmp / '.lease.json').write_text(json.dumps(
            {'token': 'x', 'run': run, 'holder': 'synthetic', 'acquired_at': expires.isoformat(),
             'expires_at': expires.isoformat()}))


class CollectEvidenceTests(Base):
    def test_valid_run_end_to_end_without_touching_source(self):
        f = self.fixture()
        f.state['attempts'].append({'n': 1, 'lane': f.lane, 'status': 'failed', 'jobs': [], 'images': [],
                                    'prompt_sha256': f.state['prompts'][f.lane]['sha256'], 'reason': 'synthetic'})
        f.attempt(2, rows=[review(0), review(1), review(2, form_ok=False)], selected=(0,))  # index 3 unreviewed
        f.post(2, [0])
        f.write()
        before = tree(self.runs)
        result = C.collect(self.runs, self.out)
        self.assertEqual(tree(self.runs), before)
        self.assertEqual((result['cases'], result['images'], result['pending'], result['issues']), (1, 4, 1, 0))
        entry = self.index()['cases'][0]
        case = json.loads(Path(entry['file']).read_text())
        self.assertEqual(Path(entry['file']).name, entry['revision'] + '.json')
        self.assertEqual(entry['case_id'], f'{f.run}--{f.lane}--{sha(PROMPT.encode())}')
        self.assertEqual(case['prompt']['prompt_text'], PROMPT)
        self.assertEqual(case['prompt_provenance'], 'external_extract_preserved')
        self.assertIsNone(case['runtime_model'])
        failed, passed = case['attempts']
        self.assertEqual((failed['status'], failed['generated_count']), ('failed', 0))
        self.assertEqual({i['index']: i['outcome'] for i in passed['images']},
                         {0: 'selected', 1: 'passed_not_selected', 2: 'failed_review', 3: 'unreviewed'})
        for im in passed['images']:
            self.assertEqual(im['sha256'], sha(Path(im['file']).read_bytes()))
        self.assertEqual([p['index'] for p in case['post_images']], [0])

    def test_prompt_provenance_distinguishes_mpw_from_external_extract(self):
        for k, (refs, expected) in enumerate(((['n/a'], 'external_extract_preserved'),
                                              (['SKILL.md'], 'mpw_referenced'), ([], 'unknown')), 1):
            with self.subTest(refs=refs):
                f = self.fixture(run=f'2026-02-0{k}-lunch')
                f.state['prompts'][f.lane]['mpw_refs_read'] = refs
                f.attempt(1, images=1)
                f.write()
        C.collect(self.runs, self.out)
        got = {c['run']: json.loads(Path(c['file']).read_text())['prompt_provenance'] for c in self.index()['cases']}
        self.assertEqual(got, {'2026-02-01-lunch': 'external_extract_preserved',
                               '2026-02-02-lunch': 'mpw_referenced', '2026-02-03-lunch': 'unknown'})

    def test_prompt_hash_contract_strips_surrounding_whitespace(self):
        f = self.fixture()
        f.state['prompts'][f.lane]['prompt_text'] = '\n  ' + PROMPT + '\n\n'
        f.attempt(1, images=1)
        f.write()
        self.assertEqual(C.collect(self.runs, self.out)['cases'], 1)
        f.state['prompts'][f.lane]['prompt_text'] = PROMPT + ' edited'
        f.write()
        C.collect(self.runs, self.out)
        self.assertEqual(self.index()['cases'], [])
        self.assertTrue(any(i['reason'] == 'quarantined' for i in self.index()['issues']))

    def test_contamination_is_quarantined_and_other_runs_still_collected(self):
        def attempt_prompt(f): f.state['attempts'][0]['prompt_sha256'] = '0' * 64
        def prompt_text(f): f.state['prompts'][f.lane]['prompt_text'] += ' edited'
        def image_sha(f): f.state['attempts'][0]['images'][1]['sha256'] = '1' * 64
        def tampered(f): (f.dir / 'attempt-1' / 'img-0.png').write_bytes(b'tampered')
        def missing(f): (f.dir / 'attempt-1' / 'img-1.png').unlink()
        def outside(f):
            other = f.dir.parent.parent / 'outside.png'
            other.write_bytes(b'x')
            f.state['attempts'][0]['images'][0].update(file=str(other), sha256=sha(b'x'))
        def select_failed(f):
            f.state['attempts'][0]['selected'] = f.state['attempts'][0]['visual_review']['selected'] = [1]
            f.state['attempts'][0]['visual_review']['passing'] = [0]
        def passing_unusable(f): f.state['attempts'][0]['auto_review']['usable'] = [0]
        def usable_missing(f): f.state['attempts'][0]['auto_review']['usable'].append(9)
        def selection_drift(f): f.state['attempts'][0]['selected'] = [1]
        def duplicate_review(f): f.state['attempts'][0]['visual_review']['images'][1]['index'] = 0
        def review_missing_image(f): f.state['attempts'][0]['visual_review']['images'][1]['index'] = 9
        def post_sha(f): f.state['post']['images'][0]['sha256'] = '2' * 64
        def post_unselected(f): f.state['post']['images'][0]['index'] = 1
        def identity(f): f.state['run'] = '2026-09-09-lunch'
        scenarios = [attempt_prompt, prompt_text, image_sha, tampered, missing, outside, select_failed,
                     selection_drift, duplicate_review, review_missing_image, post_sha, post_unselected, identity,
                     passing_unusable, usable_missing]
        self.valid('2026-01-01-lunch')
        for k, mutate in enumerate(scenarios, 1):
            f = self.fixture(run=f'2026-04-{k:02d}-lunch')
            f.attempt(1, images=2, rows=[review(0), review(1)], selected=(0,))
            f.post(1, [0])
            mutate(f)
            f.write()
        result = C.collect(self.runs, self.out)
        self.assertEqual(result['cases'], 1)
        issues = self.index()['issues']
        quarantined = {i['run'] for i in issues if i['reason'] == 'quarantined'}
        self.assertEqual(quarantined, {f'2026-04-{k:02d}-lunch' for k in range(1, len(scenarios) + 1)})
        self.assertEqual([c['run'] for c in self.index()['cases']], ['2026-01-01-lunch'])

    def test_replan_groups_keep_revoked_denominators_and_reasons_with_original_prompt(self):
        f = self.fixture()
        old_prompt = copy.deepcopy(f.state['prompts'][f.lane])
        old_concept = {'title': 'original synthetic concept'}
        old_reason = 'original attempt withdrawn after review'
        f.attempt(1, status='failed_review', images=2, revoked={'reason': old_reason})
        old_attempt_copy = copy.deepcopy(f.state['attempts'][0])
        new_prompt = copy.deepcopy(old_prompt)
        new_prompt.update(prompt_text=PROMPT + ' Replacement.', body=PROMPT + ' Replacement.',
                          sha256=sha((PROMPT + ' Replacement.').encode()))
        f.state['prompts'][f.lane] = new_prompt
        f.state['concept'] = {'title': 'replacement synthetic concept'}
        new_reason = 'replacement trial withdrawn for another reason'
        f.attempt(2, status='failed_review', images=2, revoked={'reason': new_reason})
        f.attempt(3, images=2)
        f.post(3, [0])
        f.state['superseded'] = [{'concept': old_concept, 'prompts': {f.lane: old_prompt},
                                  'attempts': [old_attempt_copy]}]
        f.write()
        result = C.collect(self.runs, self.out)
        self.assertEqual((result['cases'], result['images']), (2, 6))
        data = self.index()
        self.assertEqual(data['issues'], [])
        groups = {json.loads(Path(e['file']).read_text())['prompt']['sha256']:
                  json.loads(Path(e['file']).read_text()) for e in data['cases']}
        old, new = groups[old_prompt['sha256']], groups[new_prompt['sha256']]
        self.assertEqual(old['concept'], old_concept)
        self.assertEqual(new['concept'], f.state['concept'])
        self.assertEqual([a['n'] for a in old['attempts']], [1])
        self.assertEqual([a['n'] for a in new['attempts']], [2, 3])
        self.assertEqual(old['attempts'][0]['revoked']['reason'], old_reason)
        self.assertEqual(new['attempts'][0]['revoked']['reason'], new_reason)
        self.assertNotIn(old_reason, json.dumps(new))
        self.assertNotIn(new_reason, json.dumps(old))
        self.assertEqual(old['post_images'], [])
        self.assertEqual([im['attempt'] for im in new['post_images']], [3])
        for group in (old, new):
            self.assertEqual(group['case_id'], f"{f.run}--{f.lane}--{group['prompt']['sha256']}")
            revoked = group['attempts'][0]
            self.assertEqual(revoked['generated_count'], 2)
            self.assertEqual(revoked['selected_count'], 0)
            self.assertEqual([im['outcome'] for im in revoked['images']], ['revoked', 'revoked'])
            self.assertEqual([im['selected'] for im in revoked['images']], [False, False])
            self.assertEqual([im['was_selected'] for im in revoked['images']], [True, False])
            self.assertEqual([im['review_outcome'] for im in revoked['images']],
                             ['selected', 'passed_not_selected'])
        self.assertEqual(sum(e['images'] for e in data['cases']), 6)
        self.assertEqual(sum(e['selected'] for e in data['cases']), 1)

    def test_corrupt_superseded_prompt_is_not_used_to_explain_old_attempt(self):
        f = self.fixture()
        old = copy.deepcopy(f.state['prompts'][f.lane])
        old['sha256'] = 'f' * 64
        f.state['superseded'] = [{'prompts': {f.lane: old}, 'concept': {'title': 'stale'}}]
        f.attempt(1, images=2, prompt_sha256=old['sha256'], revoked={'reason': 'old-only reason'})
        f.attempt(2, images=2)
        f.write()
        C.collect(self.runs, self.out)
        data = self.index()
        for entry in data['cases']:
            case = json.loads(Path(entry['file']).read_text())
            self.assertNotEqual(case['prompt']['sha256'], old['sha256'])
            self.assertNotIn('old-only reason', json.dumps(case))
        self.assertTrue(any(i['reason'] == 'quarantined' for i in data['issues']))

    def test_recorded_verdicts_and_legacy_rows_preserve_actual_review(self):
        f = self.fixture()
        rows = [review(0, noise_and_stains_ok=False), review(1), review(2, form_ok=False)]
        for row in rows:
            row.pop('photo_style')
        f.attempt(1, images=4, rows=[], selected=())
        a = f.state['attempts'][0]
        a['selected'] = [0]
        a['visual_review'] = {'reviewer': 'synthetic', 'images': rows, 'selected': [0], 'passing': [0, 1]}
        a['auto_review'] = {'usable': [0, 1, 2]}
        legacy = f.attempt(2, images=2)
        legacy['visual_review'].pop('passing')
        for row in legacy['visual_review']['images']:
            row.pop('photo_style')
            row.pop('person_prominent')
        f.post(1, [0])
        f.write()
        result = C.collect(self.runs, self.out)
        self.assertEqual((result['cases'], result['images'], result['issues']), (1, 6, 0))
        case = json.loads(Path(self.index()['cases'][0]['file']).read_text())
        recorded, fallback = case['attempts']
        self.assertEqual([im['outcome'] for im in recorded['images']],
                         ['selected', 'passed_not_selected', 'failed_review', 'auto_rejected'])
        self.assertFalse(recorded['images'][0]['visual_review']['noise_and_stains_ok'])
        self.assertEqual([im['outcome'] for im in fallback['images']], ['selected', 'passed_not_selected'])
        self.assertTrue(fallback.get('verdict_source'))
        self.assertNotEqual(fallback['verdict_source'], recorded.get('verdict_source'))

    def test_date_only_run_is_collected_through_cli(self):
        self.valid(run='2026-01-02')
        code, result = self.cli_default()
        self.assertEqual(code, 0)
        self.assertEqual((result['cases'], result['images'], result['issues']), (1, 2, 0))
        entry = self.index()['cases'][0]
        self.assertEqual(entry['run'], '2026-01-02')
        self.assertEqual(entry['case_id'], f'2026-01-02--pinterest--{sha(PROMPT.encode())}')

    def test_unfinished_work_and_non_run_entries_are_skipped(self):
        self.valid('2026-01-02-lunch')
        active = self.fixture(run='2026-01-03-lunch')
        active.state['status'] = 'active'
        active.attempt(1)
        active.write()
        mixed = self.fixture(run='2026-01-04-lunch')
        mixed.attempt(1)
        mixed.attempt(2, status='submitted', images=0, selected=(), rows=[])
        mixed.write()
        (self.runs / '2026-01-05-dinner').mkdir()
        (self.runs / 'notes').mkdir()
        (self.runs / 'notes' / 'state.json').write_text('garbage')
        C.collect(self.runs, self.out)
        data = self.index()
        reasons = {(i['run'], i['reason']) for i in data['issues']}
        self.assertEqual(reasons, {('2026-01-03-lunch', 'in_progress'), ('2026-01-04-lunch', 'attempt_in_progress'),
                                   ('2026-01-05-dinner', 'not_started')})
        mixed_case = next(c for c in data['cases'] if c['run'] == '2026-01-04-lunch')
        self.assertEqual(len(json.loads(Path(mixed_case['file']).read_text())['attempts']), 1)
        self.assertFalse(any((self.out / 'cases').glob('2026-01-03-lunch--*')))

    def test_lease_skips_only_the_leased_run_and_expired_lease_does_not(self):
        self.valid('2026-01-02-lunch')
        self.valid('2026-01-02-dinner')
        self.write_lease('2026-01-02-dinner', timedelta(hours=1))
        C.collect(self.runs, self.out)
        data = self.index()
        self.assertEqual([c['run'] for c in data['cases']], ['2026-01-02-lunch'])
        self.assertIn(('2026-01-02-dinner', 'active_lease'), {(i['run'], i['reason']) for i in data['issues']})
        self.write_lease('2026-01-02-dinner', timedelta(hours=-1))
        C.collect(self.runs, self.out)
        self.assertEqual(sorted(c['run'] for c in self.index()['cases']), ['2026-01-02-dinner', '2026-01-02-lunch'])
        (self.tmp / '.lease.json').unlink()
        self.assertEqual(C.collect(self.runs, self.out)['cases'], 2)

    def test_multi_character_batch_is_preserved(self):
        f = self.fixture()
        att = f.attempt(1, selected=(1, 3), character_batch=[{'character': 'Alpha', 'count': 2},
                                                              {'character': 'Beta', 'count': 2}])
        for im in att['images']:
            im['character'] = 'Alpha' if im['index'] < 2 else 'Beta'
        f.write()
        C.collect(self.runs, self.out)
        case = json.loads(Path(self.index()['cases'][0]['file']).read_text())
        images = case['attempts'][0]['images']
        self.assertEqual([i['character'] for i in images], ['Alpha', 'Alpha', 'Beta', 'Beta'])
        self.assertEqual([i['selected'] for i in images], [False, True, False, True])


class RevisionAndDecisionTests(Base):
    def test_rerun_is_idempotent_even_when_source_mtime_changes(self):
        f = self.valid()
        C.collect(self.runs, self.out)
        first = tree(self.out)
        state = f.dir / 'state.json'
        later = state.stat().st_mtime_ns + 5_000_000_000
        os.utime(state, ns=(later, later))
        C.collect(self.runs, self.out)
        self.assertEqual(tree(self.out), first)

    def test_review_change_makes_new_revision_and_decision_is_per_revision(self):
        f = self.valid()
        C.collect(self.runs, self.out)
        old = self.index()['cases'][0]
        self.decide([json.dumps({'case_id': old['case_id'], 'revision': old['revision'],
                                 'decision': 'adopt', 'reason': 'synthetic'})])
        self.assertEqual(C.collect(self.runs, self.out)['pending'], 0)
        self.assertEqual(self.index()['pending'], [])
        f.state['attempts'][0]['visual_review']['images'][1]['form_ok'] = False
        f.state['attempts'][0]['visual_review']['passing'] = [0]
        f.write()
        self.assertEqual(C.collect(self.runs, self.out)['pending'], 1)
        new = self.index()['cases'][0]
        self.assertNotEqual(new['revision'], old['revision'])
        self.assertTrue(new['pending'])
        self.assertTrue((self.out / 'cases' / old['case_id'] / (old['revision'] + '.json')).is_file())

    def test_selection_change_makes_new_revision(self):
        f = self.valid()
        C.collect(self.runs, self.out)
        old = self.index()['cases'][0]['revision']
        f.state['attempts'][0]['selected'] = f.state['attempts'][0]['visual_review']['selected'] = [1]
        f.post(1, [1])
        f.write()
        C.collect(self.runs, self.out)
        self.assertNotEqual(self.index()['cases'][0]['revision'], old)

    def test_unrelated_decisions_blank_lines_and_all_kinds_are_accepted(self):
        self.valid()
        rows = [json.dumps({'case_id': f'other-{i}', 'revision': 'r', 'decision': d, 'reason': 'ok'})
                for i, d in enumerate(('adopt', 'merge', 'hold', 'discard'))]
        self.decide(rows[:2] + ['', '   '] + rows[2:])
        self.assertEqual(C.collect(self.runs, self.out)['pending'], 1)

    def test_malformed_decision_fails_through_cli_without_publishing_an_index(self):
        self.valid()
        good = {'case_id': 'c', 'revision': 'r', 'decision': 'hold', 'reason': 'ok'}
        cases = {
            'not json': ['{ not json'],
            'unknown decision': [json.dumps({**good, 'decision': 'maybe'})],
            'empty reason': [json.dumps({**good, 'reason': ''})],
            'missing case_id': [json.dumps({k: v for k, v in good.items() if k != 'case_id'})],
            'missing revision': [json.dumps({k: v for k, v in good.items() if k != 'revision'})],
            'valid then invalid': [json.dumps(good), json.dumps({**good, 'decision': 'x'})],
        }
        for name, lines in cases.items():
            with self.subTest(name):
                self.decide(lines)
                code, out = self.cli_default()
                self.assertEqual((code, out['status']), (1, 'error'))
                self.assertFalse((self.out / 'index.json').exists())

    def test_non_object_decision_line_is_a_clean_cli_error(self):
        self.valid()
        self.decide(['[1, 2]'])
        code, out = self.cli_default()
        self.assertEqual((code, out['status']), (1, 'error'))


class CliTests(Base):
    def test_cli_success_summary_matches_index(self):
        self.valid()
        code, out = self.cli_default()
        self.assertEqual(code, 0)
        self.assertEqual((out['cases'], out['images'], out['pending'], out['issues']), (1, 2, 1, 0))
        self.assertEqual(Path(out['index']), (self.out / 'index.json').resolve())
        self.assertEqual(self.index()['runs_root'], str(self.runs.resolve()))

    def test_cli_errors_exit_1(self):
        self.valid()
        code, out = self.cli('--runs-root', str(self.tmp / 'missing'), '--output', str(self.out))
        self.assertEqual((code, out['status']), (1, 'error'))
        code, out = self.cli('--runs-root', str(self.runs), '--output', str(self.runs / 'out'))
        self.assertEqual((code, out['status']), (1, 'error'))
        self.assertFalse((self.runs / 'out').exists())

    def test_cli_malformed_lease_exits_1_instead_of_collecting(self):
        self.valid()
        (self.tmp / '.lease.json').write_text(json.dumps(
            {'run': '2026-01-02-lunch', 'expires_at': '2999-01-01T00:00:00'}))  # no timezone
        code, out = self.cli_default()
        self.assertEqual((code, out['status']), (1, 'error'))
        self.assertFalse((self.out / 'index.json').exists())

    def test_cli_busy_when_another_collector_holds_the_lock(self):
        self.valid()
        self.out.mkdir()
        with (self.out / '.collect.lock').open('a') as lock:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
            code, out = self.cli_default()
        self.assertEqual((code, out), (0, {'status': 'busy'}))
        self.assertFalse((self.out / 'index.json').exists())


if __name__ == '__main__':
    unittest.main()
