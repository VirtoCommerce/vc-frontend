# Open questions and next steps

## Not verified yet

Everything in these notes comes from reading source, not from running the agent. These
specifically would change if a demo run contradicted them:

- **No live conversation has been run.** No `ANTHROPIC_API_KEY` in the environment, so
  latency, cache behaviour and answer quality are all unobserved.
- **The demo web apps are not installed.** `npm ci` in `examples/` was blocked by the local
  permission classifier; the eight apps and the presentation components have not been seen
  running.
- **x-api field shapes.** Operation names were read from the theme's GraphQL folders. The
  filter grammar of `searchProducts` versus the blueprint's `SearchFilters`, and whether
  facets line up, are unchecked.
- **Configurable products.** Whether a configuration id satisfies the cart provenance gate
  is an open design question, not a known answer.
- **Cost.** The sketch in [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md) is
  arithmetic, not a measurement.

## Decisions that are not ours alone

- **Python service vs. .NET port vs. patterns-only.** Platform architecture, not frontend.
  Needs an owner.
- **Whose track is this?** Frontend, platform, or a joint one — and how it sits alongside
  the UCP epic (VCST-5201). Both answers are defensible; drifting between them is not.
- **Shopping agent first, merchant agent later** — proposed here on the grounds that the
  shopping agent is plumbing over existing x-api while the merchant agent needs an analytics
  surface that does not exist. Worth confirming with whoever owns the platform roadmap.
- **Is this productised or a reference?** A shipped module our merchants enable, versus a
  blueprint partners fork. That choice changes almost everything downstream.
- **Whose API key** — merchant brings their own, or we resell tokens. Decides whether abuse
  handling, per-session budgets and rate limiting are ours to build before launch. Cost
  model and trade-off table in [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md).

## Next steps for this spike

1. Install `examples/` and run `retail` and `travel` end to end; capture what the
   presentation components actually look like and how a turn feels.
2. Run the merchant portal: stage a price change, approve it, and confirm that an approval
   typed in chat does nothing.
3. Write a throwaway `StorefrontBackend` against the QA backend covering the four methods
   that carry a demo — `search_products`, `get_product_details`, `get_cart`, `add_to_cart` —
   and drive it from `smoke_chat.py`. This is the cheapest possible proof and it settles the
   filter-grammar question.
4. Try `/scaffold-commerce-agent` against our stack and see what it produces.
5. Take the B2B bulk-reorder demo from [08-value-proposition.md](08-value-proposition.md) as
   far as it will go; that is the artefact worth showing.
6. Write up the effort estimate for a POC and bring the Python-vs-.NET decision to whoever
   owns it.

## Blocked on

- `ANTHROPIC_API_KEY` for any live turn.
- Permission to run `npm ci` in `examples/` (external code with install scripts).
