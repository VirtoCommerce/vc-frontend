# Risks and nuances

Ordered by how much they should change a decision.

## Structural

**The upstream does not exist.** Apache-2.0, "not maintained, does not accept
contributions", 35 open issues and PRs unmerged including real bug fixes. Whatever we adopt
is a hard fork from day one — no security patches, no dependency bumps, no upstream fixes
for the bugs strangers have already found. Budget for maintenance from the start, and
cherry-pick the open PRs during the fork rather than inheriting known bugs.

**Python in a .NET product line.** The single biggest architectural decision
([07-virto-fit-technical.md](07-virto-fit-technical.md)). Running the Python service is
free for a spike and expensive as a product: packaging, deployment, on-call, and a skills
gap on the team. Porting the harness to .NET is a real project — the interfaces are small,
the harness is not. Decide this deliberately, at platform level, before a demo becomes a
commitment by accident.

**The merchant agent has no data source today.** `get_business_snapshot` and
`query_metrics` have no counterpart in the storefront API, and the sales-rep order scope is
creator-scoped by design. A merchant-side pilot is platform work, not plumbing. Do not
promise both agents on the same timeline.

## Product and legal

**Accessibility.** A streaming conversational surface is easy to ship inaccessible, and
the retail guide names ADA/WCAG explicitly. Screen-reader announcements for streamed
output, keyboard navigation through result cards, and focus management belong in v1. For
public-sector and large-enterprise buyers this is a procurement gate, not a nicety.

**Data residency and PII.** Conversation text goes to Anthropic. The blueprint keeps ids
and credentials server-side and validates memory facts (identifier-shaped values refused by
default), but the customer's own words still leave the deployment. Know the answer for EU
customers before the first sales conversation — and note that Bedrock/Vertex/Foundry
deployment is a genuine answer, not a deflection.

**Consent and audit trails.** The retail guide's own governance section calls for audit
trails showing consent status when personalising. Memory personalisation is a feature of
this blueprint; that makes consent a first-class requirement, not an afterthought.

**Generated content rules.** FTC guidance on accurate claims and disclosed endorsements
applies to anything the merchant agent drafts for marketing. The staging gate helps — a
human approves — but the approval surface has to make the claim reviewable.

## Technical nuances easy to miss

**Not every runtime enforces the same rules.** Grounding is fully forced only on the
Messages API path; the Agent SDK applies only the rules with a prefetch form, and **Managed
Agents applies none**. Managed Agents also ships with `require_host_approval=False` because
the platform's `always_ask` prompt substitutes for it. Picking a runtime is picking a safety
posture, and this is stated in `docs/safety.md` rather than anywhere prominent.

**Cache hit rate is the cost model.** The three-tier context design only pays if the prefix
stays byte-identical. A timestamp in the system prompt, a non-deterministic tool order, or
an unsorted JSON blob silently drops the hit rate and multiplies the bill roughly tenfold on
input. Verify with `cache_read_input_tokens` on `turn_complete`; zero on a second turn means
something is invalidating the prefix.

**Configurable products are a fourth shape.** Their model is plain / family / variant. Our
configurable products with `getProductConfigurations` and `changeCartConfiguredItem` do not
obviously fit, and the cart-provenance gate accepts only ids a tool returned this session.
Resolve this on paper before writing cart code.

**`search_policies` is load-bearing.** The blueprint forces a grounding read for terms and
post-purchase questions. We have no search over CMS content, so stubbing it weakens exactly
the flow the design is proudest of. Curated index first.

**Never return a stand-in zero.** `None` plus a note, or the agent will confidently report
a metric that does not exist. This is a discipline that has to survive code review, because
returning `0` always compiles.

**Family/variant id collisions.** Both share one namespace. If our parent and child ids can
coincide, the family id must be prefixed in the backend or writes will land on the wrong
record.

**The architecture claim is a claim.** "Single agent with skills beats subagents" is
Anthropic's measurement on their traffic, with no published benchmark. It is credible and
well-argued for conversational commerce, and the L'Oréal case in their own PDF shows the
opposite shape winning for analytics fan-out. Take it as a strong default, not a law.

## Found by building it, not by reading

Three things the notes above could not have predicted, all now fixed in
`commerce-agent/` and recorded with their measurements in its `CLAUDE.md`.

**A refused write can answer 200.** x-api declines an `addItem` by returning the mutation's
normal payload with the reason in `validationErrors` — and that entry is **not** on a later
`cart` read. A document that does not select it cannot tell a refusal from a success, and
ours did not: the agent reported "added 3 packs" for a line that was never created. This is
the general lesson, not a Virto quirk: for every write path, find the refusal channel and
prove it, rather than assuming failure arrives as an error.

**The search index is weaker than any design assumes.** No stemming, no synonyms, and
category names are not indexed at all: `"soft drinks"` as query text returns 0 while the
category of that name holds 17. It took three live failures to get right, and the fix that
mattered was giving the model the catalogue's own vocabulary when it guesses a category
name that does not exist — nothing in the store maps one word onto another, so no
near-match list can bridge a synonym gap. Whether the index is simply under-configured is
worth asking the platform team; the fixes are independent of the answer.

**A blueprint field you need may not be serialized.** `Product.category` exists in the
contract and `compact_product` drops it from search results, so the model could not learn a
single real category name. Read the serializer, not only the type.

## Commercial

**The marketing numbers are not ours.** 35% larger carts and 60% completion lift have no
published methodology. Cite with attribution; never forecast with them.

**Model cost is per-conversation and uncapped by default.** A shopping agent on a public
storefront is an unauthenticated surface where each conversation costs money. Rate limiting,
per-session budgets and abuse handling are the deployment's problem, and the blueprint says
so. This needs an answer before anything goes live.

**Positioning against UCP.** A customer who has heard of agentic commerce may ask why we
are not "just doing UCP". The answer is that they solve different problems
([06-market-context.md](06-market-context.md)) — but we need that answer written down before
somebody improvises it in a sales call.
