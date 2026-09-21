# commerce-agent

## Commerce agent decision record

The scaffold's agreed plan. `/add-commerce-flow` and `/author-commerce-evals` read this
section; update it when a decision changes. No credential is recorded here.

**Role.** Shopping agent only. The merchant agent is a second phase: `MerchantBackend`'s
read half needs an analytics surface x-api does not have
(`specs/VCST-5979-commerce-agents/07-virto-fit-technical.md`).

**Reference.** `https://github.com/anthropics/commerce-agents` at
`fd4d59224ab96b43c6dc6888207c67b3bd5a24cf` (no tag), cloned locally at
`~/vc/commerce-agents`. Apache-2.0 and explicitly unmaintained, so the pin is the point.

**Layout.** Python; the packages are imported, not ported. `commerce-agent/` at the repo
root, importable as `virto_agent`. `requirements.txt` pins the three packages at the ref
above and the third-party versions the reference release was tested against. It joins
none of the theme's JS toolchain — eslint lints ts/vue, vitest coverage is `client-app/**`,
prettier has no Python parser — and carries its own `ruff check` and `pytest`.

**Shell and client.** Its own FastAPI service on the **Messages API runtime**: every
grounding rule is forced with `tool_choice` and memory extraction runs after the reply.
`virto_agent/sessions.py` is a verbatim copy of the reference's `demo_common/sessions.py`;
`virto_agent/host.py` copies `build_app`, `append_user_turn`, and `stream_turn`. Client
`AsyncAnthropic`, `model="claude-sonnet-5"`, `memory_model="claude-haiku-4-5-20251001"`,
against the Anthropic API directly. One live turn is verified: a three-round turn
(search, then the presentation calls) in 7.7s, with the rolling cache reading 9,360
tokens of the 10,055 it wrote within the turn.

**Identity.** One surface, the Vue theme. The theme presents the access token it already
holds on `POST /api/session` only; `virto_agent/service.py` verifies it by asking x-api for
`me`, and binds the principal it resolves to a fresh session id. Every later request
carries `X-Session-Id` alone — no route body and no tool argument names a customer or an
organization. **Every request carries the bearer as well**, and the service stores it
nowhere: `principal_for` re-resolves it against `me` (cached 60s per token) and refuses the
turn with 403 when it no longer resolves to the session's own principal. The token reaches
x-api on `VirtoSessionContext.access_token`, which lives for the turn only, so contract
prices and organization scoping resolve for the right account and the model never sees it.
A session id on its own therefore authorizes nothing — a leaked one is inert — and the
storefront's own refresh cycle is the only one there is: the next turn simply carries the
newer token. Clock: the caller's IANA `timezone`, taken at session start and carried on
`VirtoSessionState`.

Open: **guests** — not in v1; a token that resolves to no user is refused at session start.

**Backend methods.**

| Method | Wiring | x-api |
|---|---|---|
| `search_products`, `get_product_details` | live | `products`, `product` |
| `get_cart`, `add_to_cart`, `update_cart_item`, `remove_from_cart` | live | `cart`, `addItem`, `changeCartItemQuantity`, `removeCartItems` |
| `get_orders`, `get_order` | live | `orders`, `order` |
| `get_account_context` | live | `me` |
| `get_fulfillment_options` | live | `cart.availableShippingMethods` |
| `get_preferences` | **stub** — returns the bare principal | no equivalent; memory fills it |
| `search_policies` | **stub, raises** | CMS pages exist, search over them does not |
| `get_disclosure` | absent (`enable_disclosures=False`) | — |

`enable_policies` stays **on** over the stub deliberately: a terms question then forces
`search_policies`, the tool answers "temporarily unavailable", and the agent says so,
instead of answering the store's terms from model knowledge (which the prompt forbids
while the switch is on).

**Mapping decisions.**

- **Family / variant.** Family = a master `Product` with `hasVariations`; variants are
  fetched with `filter: "productfamilyid:<master> is:product,variation"`, as the theme's
  own variation picker does. Option values are the variation's `VARIATION`-type
  `properties`, grouped by name; `variant_of` is the master id.
- **Search results** carry option *names* with empty value lists, so the cart's options
  gate holds an add of a family and names what is still to choose; the values and the
  variant ids come from `get_product_details`, which the model needs anyway.
- **Families over 40 variants** are split by their leading option. `get_product_details`
  on the master returns one sub-family per leading-option value, under the synthesized
  opaque id `fam:<masterId>:<option>=<value>`, which the same method resolves back to that
  slice. Ids are opaque strings throughout, so a synthesized one travels like any other.
- **Configurable products** (`isConfigurable`) have no shape in the blueprint and the cart
  provenance gate has no answer for a configuration id. v1 marks them in `attributes` and
  refuses the add with `NeedsConfiguration`, mapped in `VirtoShoppingExecutor.domain_error`
  to "built to order on its own product page". `changeCartConfiguredItem` is out of scope.
  Open: whether a configuration id can satisfy the provenance gate, or whether they need a
  fourth catalog shape.
- **Price is request-dependent**: it resolves against the signed-in organization's
  contract. Stated in every `Product.attributes["price_context"]` and in
  `domain_search_notes`. One item from several sellers: no.
- **Cart writes are keyed by line item**, not product, so `update_cart_item` and
  `remove_from_cart` resolve the line id from a fresh read of the cart. `addItem` takes no
  idempotency key, so a retried add is a second add. `xapi.execute` therefore retries only
  reads (`is_read`, the document starts with `query`), once, on a dropped connection;
  `keepalive_expiry=20s` keeps an idle pool from handing out a socket the gateway closed.
- **A refused cart write answers 200.** x-api does not raise a GraphQL error when it
  declines an `addItem`: it returns the mutation's normal payload with the reason in
  `validationErrors`, and that entry is **not** on a later `cart` read. A mutation document
  that does not select it cannot tell a refusal from a write — ours did not, so the gate
  reported "Added X x999999" for a line that was never created. Every cart mutation now
  selects `validationErrors` and `virto_agent/cart_errors.py` turns the entry into the
  sentence the model acts on; the platform's own wording already carries the recovery
  ("Available quantity is 26.") and names ids, so it is relayed as written and only the
  instruction after it is ours — except that `PRODUCT_MIN_MAX_QTY`'s message is bare
  ("You can order from 7 to 39 items"), so a message that does not already name its
  subject is prefixed with the entry's `objectId`. Confirmed codes:
  `CART_PRODUCT_UNAVAILABLE`, `PRODUCT_FFC_QTY`, `PRODUCT_MIN_MAX_QTY`. An unmapped code
  is relayed the same way with a generic instruction
  and a logged warning — it still stops the lie, which is the part that matters, and the
  code earns its own advice only after a live failure produces it.
- **Search filters**: `category` carries a category **name**, exactly as the tool schema
  tells the model it does (`"Catalog category name."`), and the backend resolves it —
  `categories(query: <name>)` for the ids, `store` once per process for the catalog id,
  then `category.subtree:"<catalogId>/<categoryId>"`. Both lookups are cached per process.
  Three decisions, each measured rather than assumed:

  - **Only an exact name match counts**, compared case-insensitively. `categories` is a
    text search over 433 categories, so a near miss is common and confident: it answers
    "bolts" with *Flange Bolts* (9 products) beside the plain *Bolts* (32). Taking the
    first, or the shallowest, searches a different aisle than the one asked for and never
    says so.
  - **A name used more than once is searched as a union**, not picked between. The grammar
    takes comma-separated quoted values (`category.subtree:"c/a","c/b"`, verified live) and
    reads them as OR. This catalog files *Juice* at level 1 with nothing in it and again at
    level 2 with two products, and *Laptops* the same way round, so the earlier
    "shallowest wins" tie-break returned **zero** for both. The union returns what is
    there.
  - **A name the catalog has no category for raises `UnknownCategory`**, mapped in
    `VirtoShoppingExecutor.domain_error` to a sentence carrying **the catalog's own
    top-level category names** and forbidding the "the store has none" conclusion. It
    replaces dropping the filter silently, which is the worst of the three outcomes: the
    model believes it searched an aisle it never searched and reports the catalog's gap
    as the store's. Measured: `categories("helmets")` returns nothing, so the filter
    vanished, the empty query text then matched everything, and x-api answered with the
    catalog's first twenty products — printers — as if they were helmets.

    The top row is the load-bearing half, and it took a second live failure to learn why.
    Told only "no category named Beverages", the model tried "canned drinks" as a
    category, then plain text, then answered *"This store doesn't stock beverages for
    office restocking"* — against a catalogue with **Drinks And Food**, **Soft Drinks**,
    **Soda**, **Juice** and **Mineral water** at its top level. A near-miss list cannot
    help here: `categories("beverages")` matches no name at all, because the lookup is
    plain text matching and nothing in this store maps one word onto another. The
    catalog's own vocabulary is the only thing that bridges a synonym gap, so
    `_top_level_categories` reads all 433 categories once per process (`CATEGORY_TREE`)
    and keeps the 117 at level 1. It stays out of the cached prompt on purpose: it costs
    ~450 tokens only on the turn that needs it, and cannot go stale between restarts.
  - **Only a name the model can send straight back is offered.** `_usable_names` drops any
    name the fence would rewrite or truncate, because the value has to resolve again as
    `filters.category`. This catalog has one: *Medical*`U+2028`*goods*, which sanitizes to
    "Medicalgoods" and resolves to nothing.
  - **Every search result now carries its own category** in `attributes["category"]`
    (`mapping.visible_attributes`, from the product's `breadcrumbs`). The reference's
    `compact_product` drops `Product.category`, so without this the model never saw a
    single real category name — it could only guess them. A drinks search now comes back
    labelled `category: "Soda"`, which is how it learns names below the top row.

  For the same reason `search_products` now raises `NotOffered` when it is given neither
  text nor any filter: x-api answers that with the catalog's first page, which reads as an
  answer and is not one.

  This replaces the scaffold's first decision, which folded the category into the query
  text on the belief that x-api's filter takes an outline a model could not write. That
  was wrong twice: `categories` resolves a name, and the filter takes an id. It also broke
  the contract — a declared filter field that silently did nothing — against the
  blueprint's own rule that the schema works as declared and the webinar's first tool
  principle, *wrap your existing systems, don't rebuild them*. Folding a category into
  free text was rebuilding search on an index not built for it.

- **Figures the platform does not supply**: an order carries no tracking URL and no
  promised delivery date, so both stay unset rather than filled with a stand-in; a
  shipment's `deliveryDate` is used where the store records one. A shipping method quotes
  no ETA, so `FulfillmentOption.eta` carries the method's own description. Order status is
  the store's own dictionary — `mapping._ORDER_STATUS` covers the platform's shipped names
  and an unmapped one reads as "processing" with a logged warning.

### Verified against QA, 2026-09-16

Probed anonymously against `https://vcst-qa.govirto.com/graphql`. Catalog reads need no
bearer there, so search and details were exercised end to end before any token existed.

- `store(domain: "vcst-qa.govirto.com")` → `storeId: "B2B-store"`, `USD`, `en-US` — the
  defaults in `settings.py` are correct for QA.
- **Filter grammar works as written**: `price.usd:(10 TO 100)` (1139 hits, all in range),
  sort id `price-ascending` (cheapest first), and
  `productfamilyid:<master> is:product,variation` (returns exactly the family).
- **A master is returned among its own family rows and is purchasable.** `variant_of`
  must not self-reference; `product_from` drops it when the ids match.
- **Not every family carries `VARIATION` properties.** A camera family derives
  `Color / Resolution / Storage option` correctly; a carriage-bolt family with three
  variants carries none, and what distinguishes its rows (`FASTENER_LENGTH` 16/20/25mm)
  is typed `PRODUCT`. Such a family reads as a plain product with siblings: `options` is
  empty, the options gate does not hold an add, and the master is buyable, which is
  right for this data. The distinguishing values still reach the model in `attributes`.
  A master that is *not* buyable and has no options would reach `add_to_cart`, which
  raises `Unavailable` naming its in-stock variants.
- **`minVariationPrice` is null on the `product` query** — it is a search-index field, so
  details would have quoted the master's own price while search quoted the family's
  lowest. `mapping.family_price` computes the "from" price from the variants instead.
- **No configurable product appeared** in the pages sampled, so `NeedsConfiguration` has
  not been exercised against real data.
- **Probed the error surface, 2026-09-16** (x-api only, no model). `addItem` with an id
  that does not exist, `addItem` past available stock, `changeCartItemQuantity` on a line
  that is not in the cart and `addCoupon` with a nonsense code **all answer 200 and change
  nothing**; the only GraphQL error raised was an unusable `OPERATION_CANCELED` for a
  currency the store does not sell in. The usable channel is `validationErrors` on the
  mutation payload (above). Order minimums **are** in this catalog — the first sample
  (20 fasteners) had none, which was a bad sample, not an absent feature: Coca Cola
  Regular Retail Pack Cans 24x330ml (`ffd1bc36…`) carries `minQuantity: 7, maxQuantity:
  39`, and adding 6 returns `PRODUCT_MIN_MAX_QTY` with an empty cart while 7 succeeds.
  Both bounds now reach the model in `attributes` (`minimum_order_quantity`,
  `maximum_order_quantity`), so the well-behaved path is not to provoke the error at all.
- **The text index matches titles and descriptions only** — no stemming, no synonyms, and
  no category names. Measured: `"canned drinks"` → 0, `"soft drinks"` → 0 *though a
  category of that name exists*, `"drinks"` → 5, every one of them a mini fridge whose
  description contains the word. `"cans"` does find the sodas. The first live run of the
  demo died here: the agent searched for what the customer said, found fridges, and
  honestly reported that the store sells no canned drinks. The catalogue holds 4,550
  products, of which 28 carry an order minimum, nearly all of them drinks and snacks. The
  category filter above is the fix; the theme has the same index and navigates by category
  for the same reason.
- **A resolved category is still ANDed with the query text**, which is the second half of
  the same problem. Live run: the model sent `query="soda", category="drinks"` and got
  three of the aisle's seventeen products — the three whose titles say "Soda", all Fanta.
  A brand word behaves the other way round (`"cola"` in the same category returns four),
  which is the rule the notes now state: the query text is for what the customer named,
  the category for the kind, and the text is left empty when the kind is the whole
  request. An empty first pass inside a resolved category now falls back to the category
  alone, so a narrowing that empties the aisle shows the aisle; a narrowing that merely
  *thins* it cannot be distinguished from a deliberate one and is left to the prompt.
- **A category synonym the catalog does not use cannot resolve.** `"beverages"` and
  `"helmets"` both return nothing from `categories`, with or without `fuzzy` — a synonym
  gap, not a typo, and the store has 433 categories with names too varied to inline in the
  prompt. **Closed**: the miss now reaches the model as an instruction rather than as
  silence. No `_search_products` override was needed — `UnknownCategory` raised from the
  backend travels the executor's own `domain_error` seam, the same one
  `NeedsConfiguration` and `SessionSignedOut` use.
- **Text and category are not interchangeable, and neither wins.** Measured live, 2026-09-16,
  each kind-word sent both ways (`scripts/probe_search.py`, free to re-run — x-api only):

  | kind | as query text | as `filters.category` |
  |---|---|---|
  | printers | 3 | 20 |
  | soft drinks | 0 | 20 |
  | bolts | 20 | 20 |
  | juice | 17 | 2 |
  | laptops | 20 | 1 |
  | helmets | 14 | *no such category* |

  That is the evidence behind `domain_search_notes` telling the model to try the other way
  round rather than preferring one. It is also a fair question whether the QA index is
  simply under-configured — no stemming, no synonyms, category names unindexed — which is
  worth raising with the platform team; none of the corrections above depend on the answer.

Authenticated paths since: `me` resolves the principal on every session start and on every
turn (`principal_for`), and a full turn — search, then the presentation calls — renders in
the theme under two workers. **Still unexercised in a turn: orders and fulfillment**; cart writes are covered by the
`cart-002` and `cart-003` recordings, and `get_cart` arrives as a prefetch rather than a
model call and the property-term filter `"<name>":"<value>"`.

**One grounding failure observed, 2026-09-16.** Asked "what carriage bolts do you have?",
the agent answered "…the stainless steel one, already in your cart" and repeated it in the
pick's `reason`, on a one-turn session whose transcript holds `search_products` and the two
presentation calls and no `get_cart`. The only stored memory fact is
`material_preference: prefers stainless steel`; the cart state was invented from it. The
catalog grounding rule forces a search, and the cart provenance gate guards *writes* — no
gate makes a claim *about* the cart require a read. This is eval material, not a unit test:
it belongs in `evals/` as a case pinning `never_calls`/`reply_omits` on cart wording when no
cart read happened.

**Sessions.** `virto_agent/session_store.py`: a `SessionStore` subclass over **SQLite in
WAL mode** (`data/sessions.sqlite3`, thread-local connections), overriding the six storage
methods. `write_state` is a compare-and-set on the version — the insert asserts version 0,
the update asserts the version read — and raises `SessionConflictError` on the lost race;
`write_messages` runs in `BEGIN IMMEDIATE`. The record is written back by the request
dependency and again at stream end, so routes never call `save`. **Several uvicorn workers
share sessions**, verified with `--workers 2`; provenance travels in the persisted state.
`drop_older_than` is the expiry hook. Open: whether the deployment keeps SQLite or moves the
same six methods onto its own store (Redis, Postgres) — nothing above the subclass changes.

**Posture** single store (B2B, one seller). **Renderer** `components`.

**Components.** All eight are new cards; the theme module renders two of them so far.

Each one has two halves to read before writing the Vue. The **schema** says which fields
exist (`shopping-agent/core/shopping_agent/tools/presentation.py`) and `enrichment.py` says
which of them the server fills from its own records rather than the model — that is the
provenance guarantee, not a formatting detail. The **React reference** is the demo
storefront, not `docs/`, which carries nothing about UI. Read in this order: the payload
model, then `generative/index.tsx` (49 lines, the component router), then the one card.

| Component | Payload model | React reference (in the clone) | Theme card |
|---|---|---|---|
| `products` | `PresentProductsPayload` | `generative/ProductCarousel.tsx` (373) | `components/agent-products.vue` — hand-rolled grid, to be rebuilt on `VcProductCard` |
| `suggestions` | — (chips) | `web-shared/Suggestions.tsx` | `components/agent-suggestions.vue` |
| `order_status` | `PresentOrderStatusPayload` | `generative/OrderStatusCard.tsx` (185) | **next**, over the account module's order rows |
| `checkout` | `CheckoutPayload` | `generative/CheckoutSummary.tsx` (135) | **next**; hands off to the theme's `/checkout` route |
| `comparison` | `PresentComparisonPayload` | `generative/ComparisonGrid.tsx` (112) | not started |
| `plan` | `PresentPlanPayload` | `generative/PlanChecklist.tsx` (102) | not started |
| `guide` | `PresentGuidePayload` | `generative/GuideCard.tsx` (31) | not started |
| `disclosure` | `PresentDisclosurePayload` | — | unregistered while `enable_disclosures=False` |

React paths are under `~/vc/commerce-agents/examples/retail/storefront-web/components/`;
`web-shared/` is `~/vc/commerce-agents/examples/web-shared/`. Also worth reading there:
`protocol.ts` (the event list our `types.ts` mirrors), `turn.ts` (how a `ui_partial` is
replaced by its final `ui`), and `QuotedAsData.tsx` (catalog text shown as quoted data).

**Theme module.** `client-app/modules/commerce-agent/`, the repo's standard module shape:
`index.ts` registers the `assistant` route under Account and a menu item, gated by
`isCommerceAgentEnabled()` on `APP_AGENT_URL`; `api/agent-api.ts` holds the SSE frame
parser (the event list mirrors `commerce_common/streaming.py`, as
`examples/web-shared/protocol.ts` does in the reference);
`composables/useCommerceAgent.ts` is a `createGlobalState` that reads
`useAuth().headers.Authorization` **at call time**, so a refreshed token is picked up
without a handshake. `vite.config.ts` proxies `/agent-api` to `APP_AGENT_URL` in dev.

Two streaming gotchas, both found live. A turn's reply must be mutated through the
**reactive proxy** the array hands back (`turns.value[turns.value.length - 1]`), not the
object literal pushed into it: mutating the raw object bypasses Vue's proxy, so nothing
re-renders until the turn ends and the whole reply lands at once — the SSE stream was
working the entire time. And the agent writes to the cart over x-api directly, so nothing
invalidates the storefront's
own Apollo cache. `GetShortCart` is `cache-first`, which left the header counter on its
boot value; the module therefore republishes the `cart_update` payload and the page
refetches the short cart on it. `GetFullCart` is `cache-and-network` and needs nothing.

**Checkout handoff.** The theme's own `/checkout` route; `checkout_handoff` returns `[]`.
Open: the B2B endings — `createQuoteFromCart` / `submitQuoteRequest` and
`createPurchaseRequestFromDocuments` — which the spike argues are the better close.

**v1 index.** Indexed: `search-discovery`, `planning-goals`, `memory-personalization`.
Copied but parked in `skills/_staged/`: `purchase-research` and `customer-care`, because
both open on `search_policies`. `load_skills` reads direct children only, so the staged two
are not in the prompt's index; `/add-commerce-flow` moves one back up.

**Evals.** `evals/`, six cases in three twin pairs, one trial each — a spike-sized suite
whose job is to prove the harness and price it, not to cover the agent. Two graders per
case, as the webinar's "Getting to production" slide prescribes: code graders over the
turn's events and final state, and a `rubric` judge (`claude-haiku-4-5-20251001`,
temperature 0) over the reply. `python -m evals run` drives live turns against QA and
records each outcome; `replay` re-scores the recordings with no API access and is the CI
mode, gated by `baseline.json`. A stored judge verdict is keyed by a fingerprint of the
judge model plus the rubric text, so replay is free until either moves.

First full run, 2026-09-16: 6/6 pass, **$0.0735** for the run (~1.2¢ a case), 145k cached
input reads against 2.1k fresh — the same run without prompt caching would be about
$0.34. Two cases were wrong on their first pass and both were the case's fault, recorded
in `evals/README.md`: one pinned a `get_cart` call the prefetch makes unnecessary, and one
rubric read a suggestion chip offering to add to the cart as a claim about the cart.

**Gates.** Fence `storefront_data`; cart provenance over `seen_products`; the options gate;
caps 24 per item and 100 lines; the three grounding rules (policy, orders, catalog);
`tests/test_prompt_stability.py` asserts the cached system prompt is byte-identical across
builds.

- **Text and category are ANDed, and only the model knows which is which.** Second live
  failure on the same question: with the vocabulary in hand the model recovered from
  "Beverages" to `Soft Drinks` by itself — then sent `query="soda"` alongside it and got
  **3 of the aisle's 17, all Fanta**, because no other drink spells "Soda" in its title.
  The backend cannot fix this. `_first_hit` rung 2 falls back to the category when the
  first pass is **empty**, but a pass that merely *thins* the aisle is indistinguishable
  from a deliberate narrowing — padding a "Fanta" search out with non-Fanta would be
  worse. Whether a word is the customer's narrowing or the model's own restatement of the
  kind is a fact about the conversation, so it belongs in `domain_search_notes`: the text
  is for what the customer specifically named, and it is left empty when the kind is the
  whole request.

**`domain_search_notes`** (`virto_agent/config.py`): prices are the session
organization's contract prices, not list prices; B2B dimensions go in
`filters.attributes` under the catalog's property name (pack size, unit of measure,
manufacturer part number, material); a search carrying both query text and
`filters.category` returns only what satisfies **both**, so the text is for what the
customer specifically named (a brand, a flavor, a size, a part number) and is **left empty
when the kind of thing is the whole request**; on its own, neither text nor category is
reliably better for naming a kind, so a one-sided search that comes back empty or thin is
worth sending the other way round; a category name the catalog does not use searches
nothing and is reported back with the catalog's own names, which says nothing about what
the catalog holds; every result carries the category it is filed under; and many items are
sold in fixed packs whose `minimum_order_quantity` / `maximum_order_quantity` the model
must respect.

The category half was asserted the other way round first — "a product kind goes in
`filters.category`, never the query text" — and measurement disproved half of it. Used
**alone**, as a category "printers" returns 20 against 3 as text and "soft drinks" 17
against 0, while as text "bolts" returns 20 against 9 and "juice" 17 against 2: no
preference holds, so the note says to try both ways. Used **together** the original rule
was right and is kept: "soda" inside `Soft Drinks` returns 3 of 17.

**Lexicon additions** (assigned whole, so `config.py` repeats the reference defaults):
`policy_intent_terms` += quote, quotes, purchase order, po, credit terms, payment terms,
net 30, lead time, minimum order, moq, contract price, freight. `order_intent_terms` +=
invoice, invoices, purchase order, po, quote request. `product_id_patterns` keeps the
reference's two shapes — open: the catalog's own sku shape, which needs a real QA product
code.

**Memory.** On, with the reference defaults for `memory_retention_days` and
`memory_blocked_patterns`. File-backed (`data/.memory-store.json`), keyed by the principal.

**Assumptions taken for skipped interview questions.** Language and location (Python,
`commerce-agent/` in this repo); runtime and session store (own service, Messages API,
in-memory store with a TODO); the systems table above; posture (single store); surfaces
(one UI, `components`, no existing cards, the theme's own checkout); the v1 index; memory
on with defaults. The session-store assumption has since been replaced by the SQLite store
above, and the credential assumption by per-request bearer forwarding; both are recorded as
decisions, not assumptions.
