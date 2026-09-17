"""This deployment's agent config: the only place the prompt's deployment knobs are set.

Every field marked (prompt) in ``BaseAgentConfig`` renders into the cached half of the
system prompt, so these values are constant for the process and changing one invalidates
the prompt cache. The lexicon tuples are assigned whole, which replaces the reference
defaults, so each one below repeats the defaults it keeps.
"""

from __future__ import annotations

from shopping_agent import ShoppingAgentConfig

DOMAIN_SEARCH_NOTES = (
    "Prices and availability are resolved for the organization this session is signed in "
    "for, so a figure you quote is that account's contract price and not a list price. "
    "Put B2B dimensions in filters.attributes under the property name the catalog uses "
    "(pack size, unit of measure, manufacturer part number, material). "
    "The query text and filters.category narrow in two different ways and a search that "
    "carries both returns only what satisfies both. The text is matched against product "
    "titles and descriptions only, with no stemming, no synonyms and no knowledge of "
    "category names; filters.category is matched against the catalog's own tree and "
    "returns everything filed under that category. So the text is for what the customer "
    "specifically named - a brand, a flavor, a size, a finish, a part number - and the "
    "category is for the kind of thing they want. Leave the query text empty when the "
    "kind is the whole request: repeating the kind as text narrows the category down to "
    "whichever titles happen to spell that word, which is a handful of brands rather than "
    "the aisle, and the customer never asked for those brands. "
    "Neither text nor category is reliably the better way to name a kind on its own, so a "
    "search with only one of them that comes back empty or thin is worth sending the "
    "other way round before you conclude anything. "
    "filters.category takes the catalog's own name for a category. A name it does not use "
    "searches nothing and is reported back to you along with the catalog's own names; "
    "that report says nothing about what is in the catalog, so never read it as the store "
    "having none of what was asked for. Every product you get back carries the name of "
    "the category it is filed under, which is how you find the narrower names. "
    "Many items are sold in fixed packs with an order minimum and maximum, both in "
    "attributes as minimum_order_quantity and maximum_order_quantity where the catalog "
    "sets them, and a quantity you add must respect both."
)

# Measured on QA rather than assumed. Each on its own: as a category "printers" returns 20
# against 3 as text and "soft drinks" 17 against 0, while as text "bolts" returns 20 against
# 9 and "juice" 17 against 2 - so neither is a preference, only a thing to try both ways.
# Together is the opposite, and is a rule: "soda" inside Soft Drinks returns 3 of the
# aisle's 17, all of them Fanta, because no other drink spells "Soda" in its title.

# The reference tuples plus the vocabulary of a B2B buyer. Assigning replaces the
# defaults, so the reference terms are repeated here rather than appended.
POLICY_INTENT_TERMS = ShoppingAgentConfig.model_fields["policy_intent_terms"].default + (
    "quote",
    "quotes",
    "purchase order",
    "po",
    "credit terms",
    "payment terms",
    "net 30",
    "lead time",
    "minimum order",
    "moq",
    "contract price",
    "freight",
)

ORDER_INTENT_TERMS = ShoppingAgentConfig.model_fields["order_intent_terms"].default + (
    "invoice",
    "invoices",
    "purchase order",
    "po",
    "quote request",
)


def build_shopping_config() -> ShoppingAgentConfig:
    return ShoppingAgentConfig(
        brand_name="Virto Commerce",
        assistant_name="the Virto shopping assistant",
        brand_voice="direct, specific, and businesslike",
        domain_search_notes=DOMAIN_SEARCH_NOTES,
        policy_intent_terms=POLICY_INTENT_TERMS,
        order_intent_terms=ORDER_INTENT_TERMS,
        # product_id_patterns keeps the reference's two shapes. TODO: the catalog's own
        # sku shape is unknown until a QA product code is in hand; until it is added the
        # catalog grounding rule fires only on ids that happen to match those shapes.
        # Systems: policies stay ON over a stub backend deliberately — a terms question
        # then hits an unavailable tool and the agent says so, which is the whole point of
        # the gate. Disclosures are off: server-authored fee boxes are a regulated-vertical
        # concern, not a B2B distributor's.
        enable_disclosures=False,
    )
