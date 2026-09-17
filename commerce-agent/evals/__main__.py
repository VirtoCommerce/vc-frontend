"""The suite's three jobs.

    python -m evals run [case-or-tag ...]   live turns against QA, recorded and scored
    python -m evals replay                  re-score the recordings; no agent calls
    python -m evals report                  the last recordings as a table, with cost

``run`` is the only mode that spends model tokens and the only one that writes to the QA
cart. ``replay`` is what CI would run: it re-scores stored outcomes against the baseline of
known failures, so a new failure fails the build while a known one does not.

Cases run one at a time on purpose. They share one storefront cart, so a concurrent run
would have two cases rewriting each other's precondition.
"""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path
from typing import Any

from .harness import (
    Case,
    Harness,
    MissingCredential,
    judge_cost,
    load_cases,
    load_outcome,
    run_case,
    save_outcome,
    usage_cost,
)
from .scorers import Score, judge_verdict_is_stale, rubric_fingerprint, score_code, score_rubric

BASELINE = Path(__file__).resolve().parent / "baseline.json"


def load_baseline() -> dict[str, list[str]]:
    if not BASELINE.exists():
        return {}
    return dict(json.loads(BASELINE.read_text(encoding="utf-8")))


def is_known(baseline: dict[str, list[str]], case_id: str, scorer: str) -> bool:
    return scorer in baseline.get(case_id, [])


def print_case(case: Case, scores: list[Score], baseline: dict[str, list[str]]) -> tuple[int, int]:
    failed = [score for score in scores if not score.passed]
    new_failures = [score for score in failed if not is_known(baseline, case.id, score.scorer)]
    mark = "PASS" if not failed else ("known" if not new_failures else "FAIL")
    print(f"\n[{mark:5}] {case.id}  ({case.priority}, {', '.join(case.tags)})")
    for score in scores:
        flag = " " if score.passed else ("~" if is_known(baseline, case.id, score.scorer) else "!")
        print(f"   {flag} {score.mark:4} {score.scorer:20} {score.detail}")
    return len(failed), len(new_failures)


async def score_one(
    case: Case, outcome: dict[str, Any], *, allow_judge: bool
) -> tuple[list[Score], float]:
    """Code graders always; the judge only when its stored verdict is missing or stale.
    Returns what the judge cost, which is zero on every replay."""
    scores = score_code(case, outcome)
    if "rubric" not in case.expected:
        return scores, 0.0

    stored = outcome.get("judge")
    stale = judge_verdict_is_stale(stored, rubric_fingerprint(case))
    if stale and allow_judge:
        from anthropic import AsyncAnthropic

        async with AsyncAnthropic() as client:
            verdict, usage = await score_rubric(client, case, outcome)
        outcome["judge"] = {
            "fingerprint": rubric_fingerprint(case),
            "verdict": verdict.mark,
            "reason": verdict.detail,
            "usage": usage,
        }
        save_outcome(outcome)
        return [*scores, verdict], judge_cost(usage)

    if stored and not stale:
        return [
            *scores,
            Score("rubric", stored["verdict"] == "PASS", stored["reason"]),
        ], 0.0

    return [*scores, Score("rubric", False, "no verdict recorded; run live to grade it")], 0.0


async def command_run(selectors: list[str]) -> int:
    cases = load_cases(selectors or None)
    if not cases:
        print("no cases matched")
        return 1

    print(f"Running {len(cases)} case(s) live against QA. The test account's cart is rewritten.")
    harness = await Harness.build()
    spent = 0.0
    judged = 0.0
    failures = 0
    new_failures = 0
    baseline = load_baseline()

    try:
        for case in cases:
            if case.skip:
                print(f"\n[skip ] {case.id}  {case.skip}")
                continue
            outcome = await run_case(harness, case)
            save_outcome(outcome)
            spent += usage_cost(outcome)
            scores, judge_spend = await score_one(case, outcome, allow_judge=True)
            judged += judge_spend
            case_failures, case_new = print_case(case, scores, baseline)
            failures += case_failures
            new_failures += case_new
    finally:
        await harness.aclose()

    print(f"\n{len(cases)} case(s): {failures} failing assertion(s), {new_failures} not baselined.")
    print(
        f"Cost at the spike's rates: ${spent:.4f} agent turns + ${judged:.4f} judge "
        f"= ${spent + judged:.4f}."
    )
    return 1 if new_failures else 0


async def command_replay() -> int:
    cases = load_cases()
    baseline = load_baseline()
    missing = 0
    new_failures = 0

    for case in cases:
        outcome = load_outcome(case.id)
        if outcome is None:
            print(f"\n[pend ] {case.id}  no recording yet")
            missing += 1
            continue
        scores, _judge = await score_one(case, outcome, allow_judge=False)
        _, case_new = print_case(case, scores, baseline)
        new_failures += case_new

    if missing:
        # A dataset with no recordings is pending, never passing.
        print(f"\n{missing} case(s) have no recording; replay cannot pass them.")
    print(f"\n{new_failures} failure(s) not in the baseline.")
    return 1 if (new_failures or missing) else 0


def command_report() -> int:
    cases = load_cases()
    total = 0.0
    print(f"{'case':38} {'turns':>5} {'tools':>5} {'ms':>7} {'in':>7} {'cached':>8} {'out':>6} {'$':>8}")
    for case in cases:
        outcome = load_outcome(case.id)
        if outcome is None:
            print(f"{case.id:38} {'—':>5}")
            continue
        turns = outcome.get("turns", [])
        usage = [turn.get("usage") or {} for turn in turns]
        cost = usage_cost(outcome) + judge_cost((outcome.get("judge") or {}).get("usage"))
        total += cost
        print(
            f"{case.id:38} {len(turns):>5} "
            f"{sum(len(t.get('tool_calls', [])) for t in turns):>5} "
            f"{outcome.get('elapsed_ms', 0):>7} "
            f"{sum(u.get('input_tokens', 0) for u in usage):>7} "
            f"{sum(u.get('cache_read_input_tokens', 0) for u in usage):>8} "
            f"{sum(u.get('output_tokens', 0) for u in usage):>6} "
            f"{cost:>8.4f}"
        )
    print(f"\ntotal ${total:.4f} per full live run")
    return 0


def main(argv: list[str]) -> int:
    command = argv[1] if len(argv) > 1 else "replay"
    try:
        if command == "run":
            return asyncio.run(command_run(argv[2:]))
        if command == "replay":
            return asyncio.run(command_replay())
        if command == "report":
            return command_report()
    except MissingCredential as missing:
        print(f"error: {missing}")
        return 2
    print(__doc__)
    return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv))
