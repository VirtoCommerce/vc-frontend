"""A cart write x-api answered 200 to, having written nothing, must not read as success."""

from __future__ import annotations

import pytest
from shopping_agent import Unavailable

from virto_agent import cart_errors
from virto_agent.backend import VirtoStorefrontBackend

UNAVAILABLE = {
    "errorCode": "CART_PRODUCT_UNAVAILABLE",
    "errorMessage": (
        "Product with ID no-such-product-id-0000 was not added to cart. "
        "The product is not longer available for purchase."
    ),
    "objectId": "no-such-product-id-0000",
    "objectType": "CatalogProduct",
}

TOO_MANY = {
    "errorCode": "PRODUCT_FFC_QTY",
    "errorMessage": "Product with Id dae730 was not added to cart. Available quantity is 26.",
    "objectId": "dae730",
    "objectType": "CatalogProduct",
}


def test_a_write_that_went_through_says_nothing() -> None:
    assert cart_errors.failure_text([]) is None
    assert cart_errors.failure_text(None) is None


def test_the_quantity_refusal_keeps_the_number_the_customer_can_have() -> None:
    text = cart_errors.failure_text([TOO_MANY], product_id="dae730")

    assert text is not None
    assert "Available quantity is 26" in text
    assert "Offer the quantity the message names" in text


def test_an_unsellable_product_tells_the_model_not_to_retry_the_id() -> None:
    text = cart_errors.failure_text([UNAVAILABLE], product_id="no-such-product-id-0000")

    assert text is not None
    assert "Do not retry this product id" in text


def test_an_error_about_another_line_does_not_explain_this_write() -> None:
    text = cart_errors.failure_text([UNAVAILABLE, TOO_MANY], product_id="dae730")

    assert text is not None
    assert "Available quantity is 26" in text


def test_a_code_we_have_not_seen_still_stops_the_lie(caplog: pytest.LogCaptureFixture) -> None:
    unknown = {"errorCode": "SOMETHING_NEW", "errorMessage": "Nope.", "objectId": "p-1"}

    text = cart_errors.failure_text([unknown], product_id="p-1")

    assert text is not None
    assert "Nope." in text
    assert "Nothing was written" in text
    assert "SOMETHING_NEW" in caplog.text


def test_a_refusal_with_no_message_still_names_its_code() -> None:
    text = cart_errors.failure_text([{"errorCode": "BARE_CODE"}])

    assert text is not None
    assert "BARE_CODE" in text


def test_control_characters_and_padding_do_not_survive_into_the_tool_result() -> None:
    noisy = {"errorCode": "PRODUCT_FFC_QTY", "errorMessage": "Available\x00\n\n   quantity is 26."}

    text = cart_errors.failure_text([noisy])

    assert text is not None
    assert "Available quantity is 26." in text


def test_the_backend_relays_a_refusal_as_unavailable() -> None:
    data = {"addItem": {"id": "cart-1", "validationErrors": [TOO_MANY]}}

    with pytest.raises(Unavailable) as refused:
        VirtoStorefrontBackend._raise_if_refused(data, "addItem", product_id="dae730")

    assert "Available quantity is 26" in str(refused.value)


def test_the_backend_stays_quiet_when_the_write_landed() -> None:
    VirtoStorefrontBackend._raise_if_refused({"addItem": {"id": "cart-1"}}, "addItem")


BELOW_MINIMUM = {
    "errorCode": "PRODUCT_MIN_MAX_QTY",
    "errorMessage": "You can order from 7 to 39 items",
    "objectId": "ffd1bc36",
    "objectType": "CatalogProduct",
}


def test_a_bare_platform_message_is_told_which_product_it_is_about() -> None:
    text = cart_errors.failure_text([BELOW_MINIMUM], product_id="ffd1bc36")

    assert text is not None
    assert text.startswith("ffd1bc36: You can order from 7 to 39 items")
    assert "inside the range the message names" in text


def test_a_message_that_already_names_the_product_is_not_prefixed_twice() -> None:
    text = cart_errors.failure_text([TOO_MANY], product_id="dae730")

    assert text is not None
    assert not text.startswith("dae730: ")
