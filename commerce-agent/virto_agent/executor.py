"""The deployment's tool executor: the reference one plus this platform's own failures.

``domain_error`` is the seam for exceptions the reference does not know. Without it every
one of these reaches the model as "the tool is temporarily unavailable", which is wrong
twice over: a configurable product is not an outage, and an expired credential is not
something the model should offer to retry.
"""

from __future__ import annotations

import logging

from commerce_common.streaming import ToolOutcome
from shopping_agent.executor import ShoppingToolExecutor

from .backend import NeedsConfiguration, UnknownCategory
from .context import SessionSignedOut
from .xapi import XapiUnauthorized

logger = logging.getLogger(__name__)

# The fence's cap on a name offered back to the model, and so on a name it can return.
CATEGORY_NAME_MAX = 60


class VirtoShoppingExecutor(ShoppingToolExecutor):
    needs_configuration_text = (
        "{detail} is built to order and is configured on its own product page, so it "
        "cannot be added from here. Say so, and offer to open the product page."
    )
    unknown_category_text = (
        "There is no category named {name} in this catalog, so nothing was searched. "
        "{recovery} Nothing here says the store has none of what the customer asked for, "
        "so do not tell them it does: the catalog's word for it is simply not the word "
        "you used."
    )
    category_candidates_text = "The catalog's nearest names are: {candidates}."
    top_level_categories_text = (
        "The catalog's top-level categories are: {top_level}. Search again with whichever "
        "of these covers what the customer wants, and use the category value shown in a "
        "product's attributes to go narrower."
    )
    no_vocabulary_text = (
        "Search again with no category at all and the customer's own words as the query."
    )
    signed_out_text = (
        "This session's sign-in is no longer valid, so nothing about the customer's "
        "account, cart, or orders can be read. Ask the customer to sign in again; do not "
        "offer to retry."
    )

    def domain_error(self, error: Exception) -> ToolOutcome | None:
        if isinstance(error, NeedsConfiguration):
            detail = self._sanitize(str(error), 200)
            return ToolOutcome.error(
                self.needs_configuration_text.format(detail=detail or "This product")
            )
        if isinstance(error, UnknownCategory):
            return ToolOutcome.error(
                self.unknown_category_text.format(
                    name=self._sanitize(error.name, CATEGORY_NAME_MAX),
                    recovery=self._category_recovery(error),
                )
            )
        if isinstance(error, (SessionSignedOut, XapiUnauthorized)):
            return ToolOutcome.error(self.signed_out_text)
        return super().domain_error(error)

    def _category_recovery(self, error: UnknownCategory) -> str:
        """What to do instead. The top row is the useful half: a name the catalog has no
        word for produces no near matches at all, and that is the common case."""
        parts = []
        if candidates := self._usable_names(error.candidates[:6]):
            parts.append(self.category_candidates_text.format(candidates=candidates))
        if top_level := self._usable_names(error.top_level):
            parts.append(self.top_level_categories_text.format(top_level=top_level))
        return " ".join(parts) if parts else self.no_vocabulary_text

    def _usable_names(self, names: list[str]) -> str:
        """Only names the model can send straight back. Sanitizing is not cosmetic here:
        the value has to resolve again as ``filters.category``, and one of this catalog's
        own names holds a U+2028, which the fence strips to a name no lookup will match.
        A name too long to survive the cap cannot round-trip either."""
        usable = [name for name in names if self._sanitize(name, CATEGORY_NAME_MAX) == name]
        if dropped := len(names) - len(usable):
            logger.warning("%d category name(s) cannot be offered to the model", dropped)
        return ", ".join(usable)
