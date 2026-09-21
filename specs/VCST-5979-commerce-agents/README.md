# Claude Commerce Agents — spike notes (VCST-5979)

Research notes for [VCST-5979](https://virtocommerce.atlassian.net/browse/VCST-5979).
Everything here comes from primary sources read in full: the two Anthropic blog posts, the
cloned repository and its docs, and the material linked from `claude.com/solutions/commerce`.
Third-party commentary is marked as such.

| File | Covers |
|---|---|
| **[RESULT.md](RESULT.md)** | **The spike result — verdict, what was built, what it costs, the decisions taken and the two still open. Start here** |
| [00-links.md](00-links.md) | Every source, marked by whether it was read |
| [01-what-it-is.md](01-what-it-is.md) | The release, repo layout, licence and maintenance status, verified install |
| [02-architecture.md](02-architecture.md) | The engineering argument: one agent + skills, context tiers, caching, UI as tools, evals, memory |
| [03-safety.md](03-safety.md) | What the harness enforces in code vs. what it asks of the model |
| [04-backend-contract.md](04-backend-contract.md) | `StorefrontBackend` / `MerchantBackend` and the five mapping decisions |
| [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md) | Messages API vs Agent SDK vs Managed Agents, platform matrix, model ids, cost |
| [06-market-context.md](06-market-context.md) | Solutions page, the retail PDF, third-party reading, and how this relates to UCP |
| [07-virto-fit-technical.md](07-virto-fit-technical.md) | x-api mapping, the three gaps, B2B specifics, where it lives, and the language decision with the reasoning behind it |
| [08-value-proposition.md](08-value-proposition.md) | Value for buyers, merchants and partners; how to demo it; what not to claim |
| [09-risks-and-nuances.md](09-risks-and-nuances.md) | Risks ordered by decision impact, and the details easy to miss |
| [10-open-questions.md](10-open-questions.md) | What is unverified, what needs deciding, what happens next |
| [11-webinar-slides.md](11-webinar-slides.md) | The three ways to build agentic commerce, the ownership boundary, the anatomy sequence, the proactive roadmap |
| [12-anatomy-in-code.md](12-anatomy-in-code.md) | What a commerce agent actually is: the parts, one turn end to end, and the three pieces we wrote |
| [13-demo-script.md](13-demo-script.md) | The demo of what is built: the turns to type, what each proves, and what not to show |
| [14-what-the-blog-says.md](14-what-the-blog-says.md) | Anthropic's three blog posts against what we built: what they confirm, what we are missing, what it costs |
| [15-poc-estimate.md](15-poc-estimate.md) | POC scope as an inventory of changes: what exists counted module by module, the five components and four workstreams a POC adds, hardening, and what is out of scope |

## One paragraph

Anthropic published a working reference implementation of two commerce agents — a
customer-facing shopping agent and a back-office merchant agent — under Apache-2.0, plus
four runnable verticals and a Claude Code scaffolding plugin. It is explicitly not
maintained and takes no contributions, so the value is the patterns and the code you fork,
not a dependency you track. It is not a protocol and not a payment path: nothing in it
places an order or charges a card. A deployment integrates by implementing two Python
interfaces over its own catalog, cart, order, analytics and pricing systems.

## Current reading

Ten of the shopping agent's backend methods are a thin wrapper over an x-api
operation we already ship, and the B2B endings the blueprint treats as edge cases — hand the
cart to a quote or a purchase order, quote the session account's contract price — are
first-class for us. That makes a shopping-agent pilot mostly plumbing. The merchant agent is
a second phase: its analytics methods have no source in the storefront API today.

The one real obstacle was never the contract but the language — the blueprint is Python and
Virto is .NET. That is settled: the Python service is kept, the packages are imported rather
than ported.

## Status

Updated 2026-09-17. The spike went past reading: a shopping agent now runs against the QA
storefront, in this repo, from the theme's own assistant page — `commerce-agent/` and
`client-app/modules/commerce-agent/`, 10,082 added lines across 85 files on branch
`spike/VCST-5979-commerce-agents`, draft PR
[#2490](https://github.com/VirtoCommerce/vc-frontend/pull/2490). Ten backend methods run
live over x-api, cost is measured rather than modelled, and the design record with every
measurement behind it is `commerce-agent/CLAUDE.md`.

What that settled, what it did not, and the two decisions still without an owner are in
[10-open-questions.md](10-open-questions.md); what a POC would cost is in
[15-poc-estimate.md](15-poc-estimate.md).

Still unrun: Anthropic's own demo verticals (`npm ci` in `examples/` was blocked early and
never revisited) and `/review-commerce-agent` against what we built.
