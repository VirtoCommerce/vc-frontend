# VCST-5979 — spike result

Start here. The other sixteen files are the working notes behind this one; the design
record with every measurement is `commerce-agent/CLAUDE.md`.

Dates: 15–17 September 2026. Branch `spike/VCST-5979-commerce-agents`, draft PR
[#2490](https://github.com/VirtoCommerce/vc-frontend/pull/2490).

---

## Verdict

**Yes, with one condition.** Anthropic's commerce-agents is a sensible base for a Virto
shopping agent, and the spike proved it by building one rather than by arguing it: all
thirteen `StorefrontBackend` methods now run live against the QA storefront from the
theme's own assistant page.

What makes it worth adopting is not the prompts or the skills — anyone can write those.
It is the harness: provenance gates, server-side enrichment of every rendered value, forced
grounding reads, the cache-stable request assembly. Those hold **on any model**, which is
what turns a demo into something a security review can pass.

The condition was the language: the blueprint is Python and Virto is .NET. **Settled — the
Python service is kept.** That was the gating decision, and it removes the one thing that
could have voided the scope below. It buys the harness intact: no port, no reimplementation
of the gates, the enrichment, the grounding rules or the turn loop. It costs a Python
runtime inside a .NET product line and a permanent fork of an unmaintained upstream —
neither is a blocker, both are now standing line items rather than open questions.

---

## What the ticket asked for, and what it got

| Asked | Delivered |
|---|---|
| A working local install with notes on what it takes | [01-what-it-is.md](01-what-it-is.md). Python 3.11+/Node 22, `pip install -r requirements.txt`, one `ANTHROPIC_API_KEY`. Anthropic's own demo apps were **not** run — `npm ci` was blocked early and never revisited |
| A mapping table `StorefrontBackend` ↔ x-api with the gaps | Below, and [07-virto-fit-technical.md](07-virto-fit-technical.md). Not a table any more — working code |
| A verdict | Above |
| A high-level plan and a rough POC estimate | [15-poc-estimate.md](15-poc-estimate.md) — the scope as an inventory: 5 presentation components plus 1 rebuilt, `search_policies` unstubbed, the cart→quote ending, history across a reload, the suite to ~50 cases; then six hardening areas before a customer can switch it on |
| Deployment notes: API key vs Bedrock / Vertex / Foundry | [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md). Platform choice is one client argument; Managed Agents is the one path to avoid, because none of the grounding rules run there |
| *(added)* `MerchantBackend`, read-only pass | **Not done.** Deferred whole, with an argument rather than a method-by-method check |

---

## What was built

About 9,500 lines, in 5.2 active hours of one supervised Claude Code session.

| | |
|---|---|
| `commerce-agent/` | FastAPI service on the Messages API runtime. 13 backend methods over x-api, SQLite session store shared across workers, per-request bearer forwarding, error relay. ~2,650 lines |
| `commerce-agent/evals/` + `tests/` | 63 tests; 6 eval cases in 3 twin pairs; a free `replay` mode for CI gated by a baseline. ~1,800 lines |
| `client-app/modules/commerce-agent/` | Assistant page under Account, SSE parsing, 2 of 8 presentation cards, progress lines. ~1,060 lines |
| `specs/VCST-5979-commerce-agents/` | These notes. ~2,200 lines |

Prototype-grade, not product-grade: it works and it is tested, and **nobody but its author
has read it**.

### The mapping, as implemented

| Method | State | x-api |
|---|---|---|
| `search_products`, `get_product_details` | live | `products`, `product` |
| `get_cart`, `add_to_cart`, `update_cart_item`, `remove_from_cart` | live | `cart`, `addItem`, `changeCartItemQuantity`, `removeCartItems` |
| `get_orders`, `get_order` | live | `orders`, `order` |
| `get_account_context` | live | `me` |
| `get_fulfillment_options` | live | `cart.availableShippingMethods` |
| `get_preferences` | **stub** | no equivalent — memory fills it |
| `search_policies` | **stub that raises** | CMS pages exist, search over them does not |
| `get_disclosure` | off | `enable_disclosures=False` |

Ten thin wrappers, exactly as predicted. The two stubs are the two gaps the reading
predicted too. `search_policies` is deliberately left switched **on** over its stub: a
terms question then forces the read, the tool answers "unavailable", and the agent says so
instead of answering the store's terms from model knowledge.

### What it costs

Measured, not modelled: **$0.0735** for a six-case eval run (~1.5¢ a case), 145k cached
input reads against 2.1k fresh — about **98.5% cache hit**. A ten-turn conversation is
roughly **$0.12**; a thousand a month, ~$120 in tokens. Tokens are not what makes this
expensive.

Two caveats found after the measurement: the prompt cache's default TTL is five minutes, so
a buyer who pauses to think pays a fresh cache write and $0.12 is a floor; and Anthropic's
own guidance is to choose model and effort by sweeping the eval suite, which six cases
cannot do.

---

## What only building could have found

The most valuable output of the spike, and none of it was predictable from the docs.

**A refused cart write answers HTTP 200.** x-api declines an `addItem` by returning the
mutation's normal payload with the reason in `validationErrors` — and that entry is not on
a later `cart` read. A document that does not select it cannot tell a refusal from a
success, and ours did not: the agent reported adding a line that was never created. This
generalises beyond Virto — **for every write path, find the refusal channel and prove it,
rather than assuming failure arrives as an error.**

**The search index is weaker than any design assumes.** No stemming, no synonyms, and
category names are not indexed: `"soft drinks"` as query text returns 0 while the category
of that name holds 17. Three live failures, three fixes. The one that mattered was giving
the model the catalogue's own vocabulary — nothing in the store maps one word onto another,
so no near-match list can bridge a synonym gap. Worth asking the platform team whether the
QA index is simply under-configured; the fixes do not depend on the answer.

**A blueprint field you need may not be serialized.** `Product.category` exists in the
contract and the reference's `compact_product` drops it, so the model never saw one real
category name. Read the serializer, not only the type.

**One grounding failure observed.** Asked about bolts, the agent said one was "already in
your cart" on a session that never called `get_cart` — invented from a stored preference.
The gates guard cart *writes*; nothing makes a *claim about* the cart require a read. That
is eval material, and it is the kind of gap a six-case suite does not catch.

---

## Where it fits

Two things sharpened during the spike and both change the framing.

**We already ship the other layer.** UCP MVP is done, MCP on .NET is done, conformance is
the open item. In Anthropic's own taxonomy — serve someone else's agent / serve the open
web / build your own agent — **row one is substantially built and row three is the one
missing**. These compose rather than compete: their README puts a platform's own MCP server
*inside* a backend method, with the gates still in front. This should be one programme with
the UCP epic, not a second candidate beside it.

**B2B is a better fit than the blueprint's own demos.** The endings it treats as edge cases
— hand the cart to a quote or a purchase order, quote the session account's contract price
— are first-class for us. Bulk reorder from a sentence is a stronger demo than anything in
the retail vertical. Details in [08-value-proposition.md](08-value-proposition.md).

---

## Decisions

**Settled: the Python service is kept.** The blueprint's packages are imported, not ported;
`commerce-agent/` stays the shape it is. Two consequences to carry: a Python runtime now
belongs to a .NET product line, and the fork is permanent — the upstream is explicitly
unmaintained, with 35 open PRs including real bug fixes that will never merge, so those are
ours to cherry-pick and then own.

Three remain open. None is the frontend's to make alone.

1. **Whose track** — frontend, platform, or joint — and how it sits beside the UCP epic
   (VCST-5201).
2. **Product or reference** — a module our merchants enable, or a blueprint partners fork.
   This decides whether PR #2490 is worth reviewing properly or is scaffolding to discard.
3. **Whose API key** — the merchant brings one, we resell tokens, or the customer's own
   cloud account via Bedrock/Vertex/Foundry. Decides whether budgets, rate limiting and
   abuse handling are ours to build before launch.

**Shopping agent first, merchant agent second** is proposed, not decided: the shopping agent
is plumbing over x-api we already ship, while the merchant agent needs an analytics surface
that does not exist.

---

## What is not done

Stated plainly, because the estimate depends on it.

- **`MerchantBackend` was never mapped.** The ticket asked for a read-only pass; the spike
  deferred it whole.
- **Anthropic's demo verticals were never run.** Each also serves `/showcase`, which renders
  every presentation component from fixtures with no backend and no key. Cheap, still worth
  doing.
- **`/review-commerce-agent` has not been tried** against what we built — the obvious next
  use of the plugin.
- **Answer quality is anecdotal.** Six eval cases against Anthropic's suggested 50–100 per
  flow, and the three search failures were found by a person using it, not by the suite.
- **Six of eight presentation cards** are not built; `agent-products.vue` is a hand-rolled
  grid that should sit on `VcProductCard`.
- **Cart, orders and fulfillment have never been exercised through a model turn** — only at
  API level.
- **Configurable products** have no answer: whether a configuration id can satisfy the cart
  provenance gate is still open, and none appeared in the QA data sampled.
- **Nobody has reviewed the code.** Budget review as the largest single line item on any
  follow-up; it does not get cheaper because the code appeared quickly.

---

## Recommended next step

With the language settled, take the three remaining decisions to their owners with
[15-poc-estimate.md](15-poc-estimate.md) in hand. None of them blocks starting the POC
scope; the one that comes closest is whose key, because it decides whether budgets and
rate limiting are built alongside the flow or bolted on after.

In parallel, half a day closes the two cheap gaps: run Anthropic's `retail` demo and its
`/showcase` page, then `/review-commerce-agent` against ours. And before anyone quotes a
quality number, widen the eval suite — the current six prove the harness, not the agent.
