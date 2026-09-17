# What a POC would cost

The deliverable VCST-5979 asked for and the spike had not produced. Written 2026-09-17
against working code rather than a design, which is the only reason the numbers are worth
anything.

**Everything below assumes the Python service is kept.** A .NET port is a different
exercise and is estimated separately at the end — that decision comes first
([10-open-questions.md](10-open-questions.md)).

## Already paid for

The spike left roughly 9,500 lines on branch `spike/VCST-5979-commerce-agents`
(PR [#2490](https://github.com/VirtoCommerce/vc-frontend/pull/2490)):

| | Lines | State |
|---|---|---|
| Agent service (`commerce-agent/virto_agent/`) | ~2,650 | All 13 backend methods live over x-api; sessions in SQLite across workers; per-request bearer; error relay |
| Tests + evals | ~1,800 | 63 tests, 6 eval cases in 3 twin pairs, free replay mode for CI |
| Theme module (`client-app/modules/commerce-agent/`) | ~1,000 | Assistant page, SSE parsing, 2 of 8 cards, progress lines |
| Spike notes | ~2,200 | This directory |

This is prototype-grade, not product-grade: it works, it is tested, and it has not been
reviewed by anyone but its author.

## To a demonstrable POC

Scope: one B2B buyer flow end to end, shown to customers, not opened to the public.

| Work | Estimate | Note |
|---|---|---|
| The 5 remaining presentation components | 4–6 d | `order_status` and `checkout` first; React reference exists for each, our UI Kit covers most of it ([the Jira comment](https://virtocommerce.atlassian.net/browse/VCST-5979) has the references) |
| Rebuild `agent-products.vue` on `VcProductCard` | 1 d | Currently a hand-rolled grid |
| Curated policy index for `search_policies` | 2–3 d | Until it exists the agent refuses every terms question, which is honest but visibly thin |
| Conversation history across a reload | 2–3 d | Options recorded during the spike; the store already persists the transcript |
| B2B ending: cart → quote or purchase request | 3–4 d | `createQuoteFromCart` / `submitQuoteRequest` exist; this is the close that makes it B2B rather than a retail toy |
| Eval suite to ~50 cases on the served flows | 4–5 d | Anthropic's own floor; the three search failures were found by a person, not the suite |
| Design pass on the cards | — | Designer's, in parallel; brief and references already delivered |
| **Subtotal** | **16–22 d** | ~4 working weeks for one developer |

## From POC to something a customer can switch on

Not in the POC, and not optional if it ever faces real buyers:

| Work | Estimate | Why |
|---|---|---|
| Per-session and per-tenant token budgets, rate limiting, abuse handling | 3–5 d | Only if we hold the key — see decision 4 in [10-open-questions.md](10-open-questions.md) |
| Retention and deletion: sessions, memory, deletion on account close | 2–3 d | `drop_older_than` is unused and `memory_retention_days` is unset today |
| Log hygiene and an audit trail for cart writes | 2 d | [03-safety.md](03-safety.md) lists what a deployment owns |
| Accessibility pass on a streaming surface | 2–3 d | [09-risks-and-nuances.md](09-risks-and-nuances.md) |
| Deployment, monitoring, a real session store if SQLite is not it | 3–5 d | Our compute, our DevOps |
| Merchant agent | — | Second phase; blocked on an analytics surface that does not exist |
| **Subtotal** | **12–18 d** | |

## Running cost

Measured, not modelled: **~$0.12 per ten-turn conversation** on Sonnet 5 with the cache
holding at ~98.5%. A thousand conversations a month is about **$120 in tokens** — the
tokens are not what makes this expensive.

Two caveats found after the measurement, both in
[14-what-the-blog-says.md](14-what-the-blog-says.md): the prompt cache has a five-minute
TTL, so a buyer who pauses to think pays a fresh cache write and the figure above is a
floor; and Anthropic's own guidance is to pick model and effort by sweeping the eval
suite, which six cases cannot do.

## If the answer is .NET

Add a port of `commerce-common` plus the shopping agent's core and its Messages-API
runtime — prompt assembly, tool registry, fencing, grounding, gates, executor, streaming —
before any of the above starts. Anthropic's own porting guidance is module-by-module with
the names kept, and the reference carries the tests to port with it. Reckon **6–10 weeks**
on top, and accept that our port is then a fork with no upstream.

Patterns-only is the third road: keep nothing, reuse the design. The spike's notes and
`commerce-agent/CLAUDE.md` are already that deliverable, at zero further cost.

## Honest error bars

These are one developer's ranges from a prototype they wrote themselves, which is the
optimistic end of every estimate. The numbers assume: x-api needs no backend change for
the POC scope (true for everything above except the quote/purchase-request ending, which is
unexercised), the Python decision goes the easy way, and no regulated-vertical requirement
appears. Each of those failing adds weeks, not days.
