# POC scope

The deliverable VCST-5979 asked for, written against working code rather than a design.
**Stated as an inventory of changes, not as hours** — every row names the artefact it
creates or touches, so the size can be read off the list and re-costed by whoever owns the
work.

**The Python service is kept** — settled, so everything below stands on its own rather than
on an assumption. The blueprint's packages are imported, not ported.

---

## What exists today

Counted on branch `spike/VCST-5979-commerce-agents`, draft PR
[#2490](https://github.com/VirtoCommerce/vc-frontend/pull/2490).

### Service — `commerce-agent/virto_agent/`, 2,651 lines, 13 modules

| Module | Lines | Holds |
|---|---|---|
| `backend.py` | 732 | `VirtoStorefrontBackend` — all 13 `StorefrontBackend` methods |
| `xapi.py` | 403 | GraphQL client, documents, read-only retry, connection pooling |
| `mapping.py` | 403 | x-api → blueprint types; family/variant; visible attributes; order status |
| `service.py` | 234 | FastAPI app, session start, principal resolution, 403 on token mismatch |
| `sessions.py` | 185 | Verbatim copy of the reference's `demo_common/sessions.py` |
| `session_store.py` | 164 | SQLite WAL store, compare-and-set on version, shared across workers |
| `host.py` | 163 | `build_app`, `append_user_turn`, `stream_turn` — copied from the reference |
| `cart_errors.py` | 104 | `validationErrors` → the sentence the model acts on |
| `config.py` | 89 | `domain_search_notes`, lexicon additions, switches |
| `executor.py` | 87 | `domain_error` mappings: `NeedsConfiguration`, `UnknownCategory`, `SessionSignedOut` |
| `settings.py`, `context.py`, `__init__.py` | 87 | Store defaults, per-turn context, exports |

### Tests and evals — 1,785 lines

9 test modules plus `stubs.py` (992 lines): `test_backend_search`, `test_cart_errors`,
`test_executor`, `test_mapping`, `test_prompt_stability`, `test_scorers`,
`test_session_store`, `test_smoke_turn`, `test_xapi_client`.

Eval harness (793 lines): `harness.py`, `scorers.py`, `__main__.py`, plus `cases.json`,
`baseline.json` and 6 recordings. Six cases in three twin pairs —
`cart-claim-001/002`, `cart-002`/`cart-003`, `policy-001`/`catalog-001`.

### Theme module — `client-app/modules/commerce-agent/`, 1,016 lines, 13 files

`index.ts` (71) route + menu registration behind `isCommerceAgentEnabled()`;
`api/agent-api.ts` (112) SSE frame parser; `composables/useCommerceAgent.ts` (157) global
state, token read at call time; `pages/assistant.vue` (54);
`components/agent-conversation.vue` (155), `agent-products.vue` (89),
`agent-suggestions.vue` (31); `types.ts` (102); `constants.ts` (10); `locales/en.json`,
`locales/ru.json`; two test files (235).

### Skills

Indexed: `search-discovery`, `planning-goals`, `memory-personalization`.
Parked in `skills/_staged/`: `purchase-research`, `customer-care` — both open on
`search_policies`, which is a stub.

---

## What the POC adds

One B2B buyer flow end to end, shown to customers, not opened to the public.

### 1. Presentation components — 5 new, 1 rebuilt

Eight components exist in the blueprint. Two are built, one is off, five are missing. Each
has a payload model in `shopping-agent/core/shopping_agent/tools/presentation.py` and a
React reference under `examples/retail/storefront-web/components/generative/`.

| Component | New file | Payload model | React reference | Depends on |
|---|---|---|---|---|
| `order_status` | `components/agent-order-status.vue` | `PresentOrderStatusPayload` | `OrderStatusCard.tsx` (185) | account module's order rows |
| `checkout` | `components/agent-checkout.vue` | `CheckoutPayload` | `CheckoutSummary.tsx` (135) | theme's `/checkout` route |
| `comparison` | `components/agent-comparison.vue` | `PresentComparisonPayload` | `ComparisonGrid.tsx` (112) | — |
| `plan` | `components/agent-plan.vue` | `PresentPlanPayload` | `PlanChecklist.tsx` (102) | — |
| `guide` | `components/agent-guide.vue` | `PresentGuidePayload` | `GuideCard.tsx` (31) | — |
| `products` | **rebuild** `components/agent-products.vue` | `PresentProductsPayload` | `ProductCarousel.tsx` (373) | `ui-kit/…/product-card/vc-product-card.vue` |
| `disclosure` | not built | — | — | stays unregistered while `enable_disclosures=False` |

Each component must tolerate a partial payload: the harness emits `ui_partial` while the
tool's arguments are still streaming, so two of four products arrive before the rest.
`agent-products.vue` is currently a hand-rolled grid and must move onto `VcProductCard` —
composed, not modified, since ui-kit is off limits.

Also touched: `types.ts` (payload types per component), `agent-conversation.vue` (the
component router), both `locales/*.json`.

### 2. Unstub `search_policies`

`backend.py` — replace the raising stub with a lookup over a curated set of policy pages.
Two parts, and the first is not an engineering activity:

- decide **which** CMS pages are policy (returns, shipping, terms, payment terms, warranty)
- an index the backend can search — `getPage` / `getPageDocument` give the content, x-api
  gives no search over it

Unblocks the two parked skills: moving `purchase-research` and `customer-care` out of
`skills/_staged/` is what `/add-commerce-flow` does, and each needs its own eval cases.

### 3. B2B ending — cart to quote or purchase request

The close that makes this B2B rather than a retail toy. New backend surface plus a
component.

- `backend.py` — `checkout_handoff` returns the quote route instead of `[]`, or a new
  domain tool stages the quote
- x-api operations, all currently **unexercised by this service**: `createQuoteFromCart`,
  `submitQuoteRequest`; optionally `createPurchaseRequestFromDocuments`
- `config.py` — prompt notes telling the agent when the close is a quote rather than a
  checkout
- the `checkout` component above gains a second shape
- eval cases: a positive (cart becomes a quote) and its twin (no quote staged when the
  customer did not ask)

### 4. Conversation history across a reload

The store already persists the transcript; this is wiring plus UI.

- `service.py` — a route returning the session's turns
- `agent-api.ts`, `useCommerceAgent.ts` — hydrate on mount
- `assistant.vue` — render restored turns, including their `ui` payloads

### 5. Eval suite to roughly 50 cases

Six cases prove the harness; Anthropic's own guidance is 50–100 per flow. Per flow, in
twin pairs:

- **search-discovery** — category resolution, the synonym gap, text-and-category ANDing,
  minimum order quantity, families and variants
- **cart** — provenance, the options gate, caps, the `validationErrors` refusal path
- **orders** — status read, no claim without a read
- **memory** — written, refused, and a stored fact changing the next pick
- **grounding** — the observed failure: a claim *about* the cart with no `get_cart` in the
  turn
- **poisoned fixtures** — eval-only listings and reviews carrying instructions, under a
  third-party seller, plus a benign counterpart in the same niche. Three vectors minimum:
  write to the cart, remember something, a false claim. Our `customer-reviews` module makes
  this a real vector, not a hypothetical

Touches `evals/cases.json`, new recordings, a re-baselined `baseline.json`. The floor is
live API calls against QA, which do not compress.

---

## Before a customer can switch it on

Not in the POC, not optional if it faces real buyers.

| Area | Change |
|---|---|
| Spend control | Per-session and per-tenant token budgets; rate limiting per principal; abuse handling on an unauthenticated-adjacent surface |
| Data lifecycle | Retention and deletion for `data/sessions.sqlite3` and `data/.memory-store.json`; deletion on account close; the memory store is file-backed today |
| Audit | Log hygiene (no bearer, no PII in logs); an audit trail for every cart write the agent makes |
| Accessibility | Screen-reader announcements for streamed output, keyboard navigation through result cards, focus management. WCAG is a procurement gate for enterprise and public-sector buyers |
| Deployment | Packaging the Python service; monitoring; a real session store if SQLite is not it — that is the six `SessionStore` methods in `session_store.py` moved onto Redis or Postgres, nothing above the subclass changes |
| Guests | Refused at session start today. A guest principal is a decision plus a code path |

---

## Explicitly out of scope

- **The merchant agent.** `MerchantBackend` was never mapped. Its read half needs an
  analytics surface x-api does not have.
- **Configurable products.** `NeedsConfiguration` refuses the add and points at the product
  page. Whether a configuration id can satisfy the cart provenance gate is unresolved, and
  no configurable product appeared in the QA data sampled.
- **`changeCartConfiguredItem`**, multi-seller carts, `get_disclosure`.
- **Anthropic's demo verticals** and `/review-commerce-agent` — cheap, unrun, and worth
  doing before any of the above, but not POC scope.

---

## Running cost

Measured, not modelled: **~$0.12 per ten-turn conversation** on Sonnet 5 with the cache
holding near 98.5%. A thousand conversations a month is roughly **$120 in tokens**.

Two caveats found after the measurement
([14-what-the-blog-says.md](14-what-the-blog-says.md)): the prompt cache's default TTL is
five minutes, so a buyer who pauses to think pays a fresh cache write and $0.12 is a floor;
and Anthropic's own guidance is to pick model and effort by sweeping the eval suite, which
six cases cannot do.

---

## The .NET road

Not taken. Recorded because the reasoning stays relevant if the runtime is ever
reconsidered: a port means `commerce-common` plus the shopping agent's core and its
Messages-API runtime — prompt assembly, tool registry, fencing, grounding gates,
presentation enrichment, executor, streaming, memory — before any of the scope above
starts. The design survives a port unchanged: the backend mapping, the search findings, the
error relay and the component list are all in `commerce-agent/CLAUDE.md` and are
language-independent.

---

## Not scope, but on the schedule

- **Review.** 9,500 lines nobody but the author has read. This is the largest single item
  on any follow-up and it does not shrink because the code appeared quickly.
- **The three open decisions** in [10-open-questions.md](10-open-questions.md). Other
  people's calendar weeks. None blocks starting, but whose key shapes the hardening list.
- **Backend work.** Everything above is service-and-frontend except the quote ending, which
  touches x-api mutations this service has never called.
- **Design.** A human designer's iterations on the cards; the brief and references are
  delivered.
