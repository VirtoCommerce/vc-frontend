"""The failures this platform has that the reference executor does not know about."""

from __future__ import annotations

from virto_agent.backend import NeedsConfiguration, UnknownCategory
from virto_agent.context import SessionSignedOut
from virto_agent.executor import VirtoShoppingExecutor
from virto_agent.xapi import XapiUnauthorized


def outcome_for(error: Exception) -> str:
    """``domain_error`` reads only the class's own text and its class-level fence, so the
    executor is built without its runtime: a real one needs a live agent's skills and
    state, and none of that is in the path under test."""
    result = object.__new__(VirtoShoppingExecutor).domain_error(error)
    assert result is not None, f"{type(error).__name__} reached the model as an outage"
    assert result.is_error
    return result.result_text


def test_a_category_the_catalog_lacks_names_what_it_does_have() -> None:
    text = outcome_for(
        UnknownCategory("helmets", ["Head Protection"], ["Safety And Protection", "Tools"])
    )

    assert "helmets" in text
    assert "Head Protection" in text
    assert "Safety And Protection, Tools" in text


def test_a_word_the_catalog_has_no_near_name_for_still_gets_its_vocabulary() -> None:
    """"Beverages" matched no category name at all here, so near misses are empty and the
    top row is the whole recovery."""
    text = outcome_for(UnknownCategory("beverages", [], ["Drinks And Food", "Soft Drinks"]))

    assert "Drinks And Food, Soft Drinks" in text
    assert "nearest names" not in text


def test_the_model_is_told_not_to_read_the_miss_as_an_empty_store() -> None:
    """The failure this replaces: a dropped filter, then "we do not sell helmets"."""
    text = outcome_for(UnknownCategory("helmets", [], []))

    assert "do not tell them" in text
    assert "no category at all" in text


def test_a_configurable_product_is_not_reported_as_an_outage() -> None:
    assert "product page" in outcome_for(NeedsConfiguration("A built-to-order desk"))


def test_an_expired_credential_asks_for_a_sign_in_rather_than_a_retry() -> None:
    for error in (SessionSignedOut("s"), XapiUnauthorized("nope")):
        text = outcome_for(error)
        assert "sign in again" in text
        assert "do not offer to retry" in text.lower()


def test_a_name_the_model_could_not_send_back_is_not_offered() -> None:
    """This catalog really holds one: *Medical<U+2028>goods*, which the fence strips to
    *Medicalgoods* - a name no lookup resolves."""
    text = outcome_for(UnknownCategory("helmets", [], ["Medical\u2028goods", "Tools"]))

    assert "Tools" in text
    assert "Medical" not in text
