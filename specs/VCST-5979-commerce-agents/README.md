# Claude Commerce Agents — spike notes (VCST-5979)

Research notes for [VCST-5979](https://virtocommerce.atlassian.net/browse/VCST-5979).
Everything here comes from primary sources read in full: the two Anthropic blog posts, the
cloned repository and its docs, and the material linked from `claude.com/solutions/commerce`.
Third-party commentary is marked as such.

| File | Covers |
|---|---|
| [00-links.md](00-links.md) | Every source, marked by whether it was read |
| [01-what-it-is.md](01-what-it-is.md) | The release, repo layout, licence and maintenance status, verified install |
| [02-architecture.md](02-architecture.md) | The engineering argument: one agent + skills, context tiers, caching, UI as tools, evals, memory |
| [03-safety.md](03-safety.md) | What the harness enforces in code vs. what it asks of the model |
| [04-backend-contract.md](04-backend-contract.md) | `StorefrontBackend` / `MerchantBackend` and the five mapping decisions |
| [05-runtimes-and-deployment.md](05-runtimes-and-deployment.md) | Messages API vs Agent SDK vs Managed Agents, platform matrix, model ids, cost |
| [06-market-context.md](06-market-context.md) | Solutions page, the retail PDF, third-party reading, and how this relates to UCP |
| [07-virto-fit-technical.md](07-virto-fit-technical.md) | x-api mapping, the three gaps, B2B specifics, where it would live, the Python problem |
| [08-value-proposition.md](08-value-proposition.md) | Value for buyers, merchants and partners; how to demo it; what not to claim |
| [09-risks-and-nuances.md](09-risks-and-nuances.md) | Risks ordered by decision impact, and the details easy to miss |
| [10-open-questions.md](10-open-questions.md) | What is unverified, what needs deciding, what happens next |
| [11-webinar-slides.md](11-webinar-slides.md) | The three ways to build agentic commerce, the ownership boundary, the anatomy sequence, the proactive roadmap |
| [12-anatomy-in-code.md](12-anatomy-in-code.md) | What a commerce agent actually is: the parts, one turn end to end, and the three pieces we would write |
| [13-demo-script.md](13-demo-script.md) | The demo of what is built: the turns to type, what each proves, and what not to show |
| [14-what-the-blog-says.md](14-what-the-blog-says.md) | Anthropic's three blog posts against what we built: what they confirm, what we are missing, what it costs |

## One paragraph

Anthropic published a working reference implementation of two commerce agents — a
customer-facing shopping agent and a back-office merchant agent — under Apache-2.0, plus
four runnable verticals and a Claude Code scaffolding plugin. It is explicitly not
maintained and takes no contributions, so the value is the patterns and the code you fork,
not a dependency you track. It is not a protocol and not a payment path: nothing in it
places an order or charges a card. A deployment integrates by implementing two Python
interfaces over its own catalog, cart, order, analytics and pricing systems.

## Current reading

Ten of the shopping agent's thirteen backend methods are a thin wrapper over an x-api
operation we already ship, and the B2B endings the blueprint treats as edge cases — hand the
cart to a quote or a purchase order, quote the session account's contract price — are
first-class for us. That makes a shopping-agent pilot mostly plumbing. The merchant agent is
a second phase: its analytics methods have no source in the storefront API today.

The genuine obstacle is not the contract, it is that the blueprint is Python and Virto is
.NET. Free to ignore for a spike, expensive to decide by accident for a product.

## Status

Cloned to `~/vc/commerce-agents`, Python side installed and importing. The demo web apps
are not installed (`npm ci` pending) and no live conversation has been run (no
`ANTHROPIC_API_KEY`). Nothing here depends on running the demos; what would change is
listed in [10-open-questions.md](10-open-questions.md).
