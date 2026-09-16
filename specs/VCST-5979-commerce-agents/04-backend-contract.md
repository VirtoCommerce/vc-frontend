# The backend contract

Source: `shopping-agent/core/shopping_agent/backend.py`,
`merchant-agent/core/merchant_agent/backend.py`, `docs/backends.md`.

This is the whole integration surface. Two abstract Python classes; a deployment subclasses
them and calls its own systems. The method docstrings and `types.py` are the contract.

## `StorefrontBackend`

| Group | Methods |
|---|---|
| Catalog | `search_products`, `get_product_details` |
| Cart | `get_cart`, `add_to_cart`, `update_cart_item`, `remove_from_cart` |
| Customer | `get_preferences`, `checkout_handoff`, `get_account_context` |
| Orders and policies | `get_orders`, `get_order`, `search_policies` |
| Optional | `get_disclosure` (under `enable_disclosures`), `get_fulfillment_options` |

Types: `Product` / `ProductDetails`, `SearchFilters`, `Cart` / `CartItem`,
`CheckoutHandoff`, `UserPreferences`, `Order` / `OrderItem` / `OrderStatus`, `Policy`,
`Disclosure` / `DisclosureRow`, `FulfillmentOption`, `PageContext`,
`ShoppingSessionContext`, `ShoppingSessionState`.

Two exceptions the executor relays as conversation rather than failure: `NotOffered` (the
store does not sell this) and `Unavailable` (it does, but not now), each with its own
wording.

## `MerchantBackend`

| Group | Methods |
|---|---|
| Read | `get_business_snapshot`, `query_metrics`, `get_campaign_performance`, `search_listings`, `get_listing`, `get_inventory_alerts`, `get_order_issues`, `get_pricing_context` |
| Stage | `stage_listing_update`, `stage_price_update`, `stage_inventory_action`, `stage_promotion`, `stage_campaign` |
| Apply | `get_pending_changes`, `apply_change`, `discard_change` |
| Analysis | `execute_analysis_query`, `get_analysis_schema` |
| Context | `get_merchant_context` |

A merchant pilot implements the eight read methods and lets every write refuse — digests
and metrics then run with no write path at all.

## The five mapping decisions

`docs/backends.md` is structured as six steps. Condensed:

### 1. Identity is bound at session start, never passed as a tool argument

The host authenticates the caller and starts a session with the resolved principal — a
customer id for shopping, a merchant id plus an operator for merchant. Every backend method
receives that session and reads identity from it. **No route and no tool argument ever
carries a user id.** The credential travels with the session, never with the model: a
per-customer token on a session subclass or in a store the host fills at sign-in; a service
credential on the backend constructor.

A guest is a principal too — mark the session as guest, and when a read needs an account
(order history, saved addresses), raise an exception the executor turns into "ask the
customer to sign in". Signing in starts a new session.

### 2. Ordered flows are enforced in the backend, not the prompt

Keep the flow's state in the backend keyed by session; when a call arrives before its
prerequisite, raise your own exception class and map it in an executor subclass
(`domain_error`) so the tool result names the missing step instead of reading as a system
failure. For a deduplicated write, derive an idempotency key from the session id and a hash
of the cart lines. When the customer completes a step outside the conversation (a payment
page, a verification code), the host queues an app event on the session and the next turn
reads it.

### 3. Checkout hands off — three shapes

| Situation | The card does | You implement |
|---|---|---|
| Checkout is a route in your own app | Links to that route | Nothing; that is the default |
| Platform hosted checkout | Opens the hosted URL | `checkout_handoff` returns it |
| Marketplace, per-seller checkout | One link per seller | `checkout_handoff` returns one entry each |

The executor adds the handoff to the card's payload *after* the model's call, so the URL
never passes through the model. Example cards link `https` only.

### 4. Products are plain, family, or variant

| Shape | Recognised by | Agents do |
|---|---|---|
| Plain | No options | Search returns it; cart, price, restock take its id |
| Family | Has `options` (size: twin/queen/king) | Search returns it; details list variants. Cart, price and restock writes need a **variant** id; pause, promotion and content edits may name the family |
| Variant | Has `option_values` + `variant_of` | Returned inside its family's details, with its own id, price and stock |

A variant id goes wherever a product id goes — there is no separate variant-id field.
Family and variant ids share one namespace, so if a parent id can equal a child id, prefix
the family id in the backend. Search matches option values as well as attributes, so
`size = king` works as a filter.

Merchant writes against a family expand: a price update or restock naming a family is held
and pointed at the variant ids; a promotion expands to one line per variant, each counting
toward the items-per-change limit; pause/activate takes every variant off sale; a content
edit touches shared content.

If the domain prices under another field name (a nightly rate, a fare), add it to
`price_bearing_fields` on the merchant config or the price cap is not checked.

### 5. Return `None`, never a stand-in zero

For a figure the platform cannot supply, return `None` and say why in a short note.
Business snapshot returns `None` for traffic, conversion or AOV it lacks; a metric series
comes back empty with a note; merchant context carries a `limitations` list naming each
store-wide gap with one clause. The retail example declares two: a 90-day order history and
an email channel that reports no revenue.

### And: switch off what does not exist

A system the business lacks entirely — no cart on a referral surface, no order tracking —
is an `enable_*` switch turned off. That removes its tools, its prompt lines and its
grounding rule on every path, **changing no prompt bytes for anything else**. Flows that
need it park under `skills/_staged/`. The merchant config has the same switches for listing
edits, inventory, pricing and campaigns.
