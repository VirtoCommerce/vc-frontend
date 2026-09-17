"""Turning a refused cart write into a sentence the model can act on.

x-api does not refuse a cart write with a GraphQL error. It answers **200 with the
mutation's normal payload** and puts the reason in ``validationErrors`` on that payload —
and the entry is gone from a later ``cart`` read, so it has to be taken off the mutation
result or it is lost. Probed against QA, 2026-09-16:

    addItem(productId: "no-such-product-id-0000")
      -> CART_PRODUCT_UNAVAILABLE
         "Product with ID no-such-product-id-0000 was not added to cart.
          The product is not longer available for purchase."

    addItem(productId: "dae730…", quantity: 999999)
      -> PRODUCT_FFC_QTY
         "Product with Id dae730… was not added to cart. Available quantity is 26."

    addItem(productId: "ffd1bc36…", quantity: 6)   # its minimum is 7
      -> PRODUCT_MIN_MAX_QTY
         "You can order from 7 to 39 items"

Without this module the backend reported both as success, the gate wrote
"Added dae730… x999999. Cart now has 1 item(s)", and the customer was told about a line
that does not exist.

The platform's own wording already carries the recovery — the number that *is* available —
and names ids rather than catalog text, which is what a tool result is allowed to say. So
the message is relayed as written and only the instruction after it is ours. A code we have
not seen is relayed the same way with a generic instruction and a logged warning: an
unmapped code still stops the lie, which is the part that matters.
"""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

MAX_DETAIL_CHARS = 300

_WHITESPACE = re.compile(r"\s+")
_CONTROL = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")

# Confirmed against QA. A code is added here only after a live failure has produced it:
# advice attached to a code that does not exist is advice that never runs.
# TODO: the shapes still to provoke — a product not orderable for the session's
# organization, a missing contract price. Each needs its own failure on QA before it earns
# a row.
CODE_ADVICE: dict[str, str] = {
    "CART_PRODUCT_UNAVAILABLE": (
        "Do not retry this product id. Say the store cannot sell it now and offer an "
        "alternative you have already shown."
    ),
    "PRODUCT_FFC_QTY": (
        "Offer the quantity the message names, or a larger pack, and add that instead. "
        "Do not repeat the quantity that was refused."
    ),
    "PRODUCT_MIN_MAX_QTY": (
        "Add a quantity inside the range the message names, or ask the customer which end "
        "of it they want. The range is the store's, not a stock level."
    ),
}

DEFAULT_ADVICE = (
    "Nothing was written. Tell the customer what the message says and offer the nearest "
    "thing you can actually add; do not retry the same call."
)


def clean(text: str) -> str:
    return _WHITESPACE.sub(" ", _CONTROL.sub("", text)).strip()[:MAX_DETAIL_CHARS]


def failure_text(errors: Any, *, product_id: str | None = None) -> str | None:
    """The sentence for the model, or ``None`` when the write went through.

    With ``product_id`` given, an entry about that product wins over an unrelated one, so
    an add is never explained by a complaint about some other line.
    """
    entries = [entry for entry in (errors or []) if isinstance(entry, dict)]
    if not entries:
        return None

    mine = [entry for entry in entries if str(entry.get("objectId") or "") == product_id]
    entry = (mine or entries)[0]

    code = str(entry.get("errorCode") or "")
    message = clean(str(entry.get("errorMessage") or ""))
    advice = CODE_ADVICE.get(code)
    if advice is None:
        logger.warning("unmapped cart validation code %r: %s", code, message)
        advice = DEFAULT_ADVICE

    if not message:
        return f"The cart refused the write ({code or 'no code'}). {advice}"

    # Not every platform message names its subject — PRODUCT_MIN_MAX_QTY is bare
    # ("You can order from 7 to 39 items") — and a tool result that does not say which
    # product it is about invites the model to guess. The id is on the entry either way.
    object_id = str(entry.get("objectId") or "")
    if object_id and object_id not in message:
        message = f"{object_id}: {message}"
    return f"{message} {advice}"
