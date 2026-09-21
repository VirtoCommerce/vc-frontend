# Open questions and next steps

Updated 2026-09-17, after the spike stopped reading and started building. What follows is
the current state, not the original one: the section that used to say "nothing here comes
from running the agent" is gone because that is no longer true.

## Settled by building

A working shopping agent now runs against the QA storefront — `commerce-agent/` (the
service) and `client-app/modules/commerce-agent/` (the assistant page), 10,082 added lines
on branch `spike/VCST-5979-commerce-agents`, draft PR
[#2490](https://github.com/VirtoCommerce/vc-frontend/pull/2490). That answered five things
reading could not:

- **The contract holds.** Twelve of the interface's fourteen methods are implemented, and
  **ten run live against x-api** — all ten thin wrappers, as
  [07-virto-fit-technical.md](07-virto-fit-technical.md) predicted. Catalog, cart, orders,
  account and fulfillment are live. `get_preferences` and `search_policies` are deliberate
  stubs, exactly the gaps that file named; `checkout_handoff` uses the blueprint's default
  and `get_disclosure` is switched off.
- **The filter grammar works as written**: `price.usd:(10 TO 100)`, `category.subtree:`,
  `productfamilyid:… is:product,variation`, sort ids. `SearchFilters` maps onto it without a
  new backend method.
- **Cost is measured, not arithmetic.** $0.0735 for a six-case eval run, ~1.2¢ a case, 145k
  cached input reads against 2.1k fresh — about 98.5% cache hit. A ten-turn conversation is
  roughly $0.12. Numbers and the caveat are in
  [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md).
- **The error surface is worse than a spec would suggest.** x-api declines a cart write with
  **HTTP 200 and an empty cart**, the reason living only on the mutation payload. That is
  the single most important implementation finding and it generalizes: every write path
  needs its refusal channel checked, not assumed.
- **Search needed real design work.** The store's text index has no stemming, no synonyms
  and does not index category names, so "soft drinks" as text returns 0 against 17 in the
  category of that name. Three live failures and three fixes, all recorded with their
  measurements in `commerce-agent/CLAUDE.md`. Whether the QA index is simply
  under-configured is a fair question for the platform team; the fixes do not depend on it.

## Still not verified

- **The demo verticals have never been run.** `npm ci` in `examples/` was blocked early and
  never revisited, so Anthropic's own storefront and merchant portal have not been seen
  running. Cheap and still worth doing: each app serves `/showcase`, which renders every
  presentation component from fixtures with no backend and no API key.
- **`/review-commerce-agent`** — the plugin command that audits an existing agent — has not
  been tried against what we built. It is the obvious next use of the plugin now that there
  is something to review.
- **`MerchantBackend` was never mapped.** The ticket asked for a lighter read-only pass and
  the spike deferred it whole. The reasoning (no analytics source in the storefront API)
  is in [07-virto-fit-technical.md](07-virto-fit-technical.md), but it is an argument, not a
  method-by-method check.
- **Answer quality is anecdotal.** Six eval cases against Anthropic's own suggestion of
  50–100 per flow ([14-what-the-blog-says.md](14-what-the-blog-says.md)). Three search
  failures were found by a person using it, not by the suite — which is the definition of
  insufficient coverage.
- **Configurable products.** Whether a configuration id can satisfy the cart provenance
  gate is still an open design question; no configurable product appeared in the QA data
  sampled.
- **The demo script's own turns 2, 4, 5 and 6** are proven at API level only; the model has
  not been in the loop for them ([13-demo-script.md](13-demo-script.md)).

## Decisions

**Settled: the Python service is kept.** Called out from the start as the real obstacle —
not the contract — and it was the one that gated the rest. The blueprint's packages are
imported and pinned, not ported or vendored, so updates are a SHA bump; the standing cost
is that none will come, and every fix we need is ours. The other standing cost is a Python
runtime inside a .NET product line.

**Settled: it is a module we ship**, not a blueprint partners fork. That raises the bar on
PR #2490 rather than lowering it: the search tuning there is fitted to the QA catalogue and
has to become configuration before it runs on a catalogue we have never seen.

Two remain open, neither of them the frontend's to make alone.

1. **Whose track**: frontend, platform, or joint, and how it sits beside the UCP epic
   (VCST-5201). Both answers are defensible; drifting between them is not.
2. **Whose API key**: the customer brings their own, or we resell tokens. Decides whether
   per-session budgets, abuse handling and rate limiting are ours to build before launch.
   Trade-offs in [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md); note that
   Bedrock, Vertex and Foundry make "the customer's own cloud account" a fourth answer.

**Shopping agent first, merchant agent second** is proposed here rather than decided — on
the grounds that the shopping agent is plumbing over x-api we already ship while the
merchant agent needs an analytics surface that does not exist. Worth confirming with
whoever owns the platform roadmap.

## What a decision needs next

1. Take [15-poc-estimate.md](15-poc-estimate.md) to the two decisions above. It is the
   deliverable the ticket asked for, stated as an inventory of changes — every component,
   stub, mutation and hardening area named — so it can be re-costed by whoever ends up
   owning the work.
2. Run Anthropic's `retail` demo and its `/showcase` page, then `/review-commerce-agent`
   against ours. Half a day, closes the two cheap gaps above.
3. Widen the eval suite before trusting any quality claim — the current six prove the
   harness, not the agent.
