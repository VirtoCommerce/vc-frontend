"""The cached half of the prompt must be the same bytes on every request of a deployment.

Anything that varies here — a set iterated in hash order, a timestamp, a figure read from
a request — costs a cache write on every turn instead of a cache read.
"""

from __future__ import annotations

from pathlib import Path

from commerce_common.skills import SkillRegistry
from shopping_agent.prompt import build_static_system

from virto_agent.config import DOMAIN_SEARCH_NOTES, build_shopping_config

SKILLS = SkillRegistry.from_dir(Path(__file__).resolve().parent.parent / "skills")


def test_static_system_is_byte_identical_across_builds() -> None:
    config = build_shopping_config()
    assert build_static_system(config, SKILLS) == build_static_system(config, SKILLS)


def test_static_system_carries_the_deployment_lines() -> None:
    prompt = build_static_system(build_shopping_config(), SKILLS)
    assert DOMAIN_SEARCH_NOTES in prompt
    assert "Virto Commerce" in prompt
    # Policies stay on over a stub backend, so the prompt keeps the rule that store terms
    # are answered only from a retrieved passage.
    assert "search_policies" in prompt


def test_lexicons_extend_rather_than_replace_the_reference_terms() -> None:
    config = build_shopping_config()
    assert "purchase order" in config.policy_intent_terms
    assert "return" in config.policy_intent_terms
    assert "invoice" in config.order_intent_terms
    assert "tracking" in config.order_intent_terms
