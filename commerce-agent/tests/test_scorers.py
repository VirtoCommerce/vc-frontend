"""The graders themselves: a scorer that silently passes is worse than no suite."""

from __future__ import annotations

from typing import Any

from evals.harness import Case
from evals.scorers import judge_verdict_is_stale, rubric_fingerprint, score_code


def outcome(**overrides: Any) -> dict[str, Any]:
    turn = {
        "message": "add one pack",
        "reply": "Added the galvanized pack. Cart now has 1 item.",
        "tool_calls": [{"tool": "search_products", "input": {}}, {"tool": "add_to_cart", "input": {}}],
        "tool_results": [{"tool": "add_to_cart", "status": "ok", "summary": "Added"}],
        "ui": [{"component": "products", "payload": {}}],
        "usage": {},
    }
    turn.update(overrides.pop("turn", {}))
    base = {
        "case_id": "t",
        "turns": [turn],
        "cart_after": {"items": [{"product_id": "P-1", "quantity": 2, "title": "Bolt"}], "item_count": 1},
    }
    base.update(overrides)
    return base


def case(**expected: Any) -> Case:
    return Case(id="t", turns=["add one pack"], expected=expected)


def results(scored: list) -> dict[str, bool]:
    return {score.scorer: score.passed for score in scored}


def test_a_tool_the_turn_never_called_fails_its_assertion() -> None:
    assert results(score_code(case(calls_tool=["get_orders"]), outcome())) == {"calls_tool": False}


def test_first_tool_reads_the_first_call_of_the_turn() -> None:
    scored = score_code(case(first_tool="search_products", first_tool_not="add_to_cart"), outcome())
    assert results(scored) == {"first_tool": True, "first_tool_not": True}


def test_reply_omits_is_case_insensitive() -> None:
    assert results(score_code(case(reply_omits=["ADDED THE GALVANIZED"]), outcome()))["reply_omits"] is False


def test_the_quantity_cap_passes_under_the_ceiling_and_fails_over_it() -> None:
    assert results(score_code(case(cart_max_quantity={"P-1": 24}), outcome()))["cart_max_quantity"]
    assert not results(score_code(case(cart_max_quantity={"P-1": 1}), outcome()))["cart_max_quantity"]


def test_the_suggestions_call_does_not_count_against_the_tool_cap() -> None:
    noisy = outcome(
        turn={
            "tool_calls": [
                {"tool": "search_products", "input": {}},
                {"tool": "present_suggestions", "input": {}},
            ]
        }
    )
    assert results(score_code(case(max_tool_calls=1), noisy))["max_tool_calls"]


def test_an_expectation_with_no_scorer_fails_rather_than_passing_silently() -> None:
    assert results(score_code(case(invented_key=["x"]), outcome())) == {"invented_key": False}


def test_a_stored_verdict_is_stale_once_the_rubric_changes() -> None:
    first = case(rubric="PASS if it says yes. FAIL otherwise.")
    stored = {"fingerprint": rubric_fingerprint(first), "verdict": "PASS", "reason": ""}

    assert not judge_verdict_is_stale(stored, rubric_fingerprint(first))
    assert judge_verdict_is_stale(stored, rubric_fingerprint(case(rubric="PASS if it says no.")))
    assert judge_verdict_is_stale(None, rubric_fingerprint(first))
