# Links

Everything read or referenced for this spike. Marked ✅ where the content was read in full
for these notes.

## Primary — Anthropic

| Link | What it is |
|---|---|
| ✅ <https://claude.com/blog/claude-for-commerce-agents> | The announcement (2026-09-02) |
| ✅ <https://claude.com/blog/the-anatomy-of-effective-commerce-agents> | The engineering deep-dive — single agent + skills, context tiers, caching, UI-as-tools, evals, memory, model selection. Basis of [02-architecture.md](02-architecture.md) |
| ✅ <https://github.com/anthropics/commerce-agents> | The repository (Apache-2.0, unmaintained). Cloned to `~/vc/commerce-agents` |
| ✅ <https://claude.com/solutions/commerce> | The commerce hub — demos, claims, logos, and the link index everything else hangs off |
| ✅ <https://resources.anthropic.com/hubfs/The-Enterprise-AI-Transformation-Guide-for-Retail.pdf> | 20pp C-level retail playbook (Jan 2026): readiness matrix + Shopify / L'Oréal / Lotte case studies |
| ✅ <https://claude.com/blog/claude-managed-agents> | Managed Agents — hosted harness, $0.08/session-hour, public beta |
| <https://www.anthropic.com/webinars/building-claude-commerce-agents> | Webinar (video, not watched) |

## Repository docs (in the clone)

| Path | What it is |
|---|---|
| ✅ `README.md` | Quick start, layout, the three runtimes, "making it yours" |
| ✅ `docs/backends.md` | The mapping guide: identity, ordered flows, checkout, product options, missing figures |
| ✅ `docs/safety.md` | Every enforced rule with its module, and what is only asked of the model |
| ✅ `docs/deployment.md` | Platform support matrix, model ids per platform, client wiring |
| `CLAUDE.md`, `plugins/commerce-builder/` | The Claude Code scaffolding plugin |

## Platform documentation

| Link | What it is |
|---|---|
| <https://platform.claude.com/docs/en/build-with-claude/working-with-messages> | Messages API |
| <https://code.claude.com/docs/en/agent-sdk/overview> | Claude Agent SDK |
| <https://platform.claude.com/docs/en/managed-agents/overview> | Managed Agents |
| <https://platform.claude.com/docs/en/about-claude/pricing> | Model and Managed Agents pricing |
| <https://platform.claude.com/docs/en/home> | Docs root |
| <https://console.anthropic.com/> | Console — API keys, session traces |

## Case studies cited in the retail guide

| Link | Numbers |
|---|---|
| <https://claude.com/customers/shopify> | Sidekick; merchants reach first sales in days not weeks |
| <https://claude.com/customers/loreal> | 99.9% analytics accuracy (from 90%), 44k monthly users, 2.5M msg/month |
| <https://claude.com/customers/lotte-homeshopping> | "Moni"; 30-40% reduction in QA delays |

## Third-party reading

| Link | Angle |
|---|---|
| ✅ <https://linas.substack.com/p/claude-commerce-agents> | Strategic: merchant-control counter-position vs. AI shopping gateways; bear case for model vendors |
| ✅ [MarkTechPost write-up](https://www.marktechpost.com/2026/09/03/anthropic-released-claude-commerce-agents-an-apache-2-0-blueprint-for-shopping-and-merchant-agents-across-retail-travel-telecom-and-entertainment/) | Technical summary; notes the undisclosed benchmarks |
| <https://www.explainx.ai/blog/claude-commerce-agents-open-source-blueprint-september-2026> | Overview (not read) |
| <https://coursiv.io/blog/claude-commerce-agents> | Overview (not read) |

## Governance and compliance referenced by the retail guide

| Link | Why it matters here |
|---|---|
| <https://www.anthropic.com/news/anthropic-achieves-iso-42001-certification-for-responsible-ai> | Certification to cite in enterprise procurement |
| <https://www.anthropic.com/news/claudes-constitution> | Model behaviour principles |
| <https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback> | Technical foundation |
| <https://trust.anthropic.com/> | Trust centre — the artefact security review will ask for |
| <https://www.w3.org/WAI/standards-guidelines/wcag/> and <https://www.ada.gov/> | Accessibility obligations for the chat surface itself |
| <https://www.ftc.gov/business-guidance/advertising-marketing/endorsements-influencers-reviews> | Rules on generated marketing claims and synthetic reviews |

## Ours

| Link | What |
|---|---|
| <https://virtocommerce.atlassian.net/browse/VCST-5979> | This spike |
| <https://virtocommerce.atlassian.net/browse/VCST-5139> | UCP / Shopify / BigCommerce spike (done) |
| <https://virtocommerce.atlassian.net/browse/VCST-5201> | UCP epic |
| <https://virtocommerce.atlassian.net/browse/VCST-5159> | Module Federation — the plugin-delivery pattern this would reuse |
