# Market context

What Anthropic is selling around the code, and how the outside is reading it. Useful for
positioning, not for architecture.

## The commerce solutions page

<https://claude.com/solutions/commerce> is the hub; everything else hangs off it, including
the retail PDF below. It pitches two agent shapes (consumer, merchant), three build
approaches (Messages API, Agent SDK, Managed Agents), 8 live demos, and a wall of logos:
Priceline, Shopify, Klaviyo, Square, Wix, Fetch, Intuit, Zomato, Visa, Mastercard,
Accenture.

Claimed numbers, all without methodology: carts up to **35% larger**, shoppers **60% more
likely to complete a purchase**, **40%** higher conversion for small businesses (Vambe case
study), **85%** consumer openness to AI agents (Accenture). Treat these as marketing
anchors — usable in a deck with attribution, not as a forecast for a specific customer.

Safety claims on the page match what the code actually enforces (see
[03-safety.md](03-safety.md)): pricing and availability accuracy, cart and refund authority
limits with human escalation, structural prevention of fabricated prices and products,
merchant changes drafted for approval. That alignment is itself a selling point — the
marketing is not ahead of the implementation here.

## "The Enterprise AI Transformation Guide for Retail" (PDF, 20pp, Jan 2026)

Linked from the solutions page. A C-level change-management playbook, not engineering:
three steps (lay the foundation → launch a pilot → scale impact), then case studies.
Predates the commerce-agents release by seven months and shares no technical content with
it.

Two things in it we can actually use:

**The organisational readiness matrix** — eight dimensions scored 1-6: executive
commitment, customer data infrastructure, omnichannel integration, merchandising and
planning systems, peak-season resilience, brand and content governance, vendor and partner
ecosystem, store technology readiness. Scoring bands map to a recommended starting scope
(8-15: secure sponsorship and unify data first; 16-31: two or three pilots; 32-48: parallel
transformation). This is a ready-made discovery questionnaire for a customer conversation,
and half its rows are things a Virto deployment already answers.

**Three case studies with numbers:**

- *Shopify* — Claude powers Sidekick, translating merchant questions into ShopifyQL
  queries. Merchants reach first sales in days rather than weeks.
- *L'Oréal* — 99.9% accuracy on conversational analytics (from 90%), 44,000 monthly users,
  2.5M messages/month, 15,000 daily uniques. Architecture: Claude as orchestrator of 15+
  specialised agents over their Beauty Tech Data Platform, with identity and access
  controls enforced in the query path.
- *Lotte Homeshopping* — "Moni", a partner-facing QA assistant: 30-40% reduction in QA
  delays.

The guide also names governance obligations worth copying into any customer-facing pitch:
GDPR/CCPA consent with audit trails, brand-voice approval workflows for generated content,
**ADA/WCAG compliance for the chat interface itself**, and FTC rules on generated marketing
claims and synthetic reviews. The accessibility point is the one most likely to be
forgotten and the one most likely to matter for our enterprise customers.

## Third-party reading

[Linas](https://linas.substack.com/p/claude-commerce-agents) frames it strategically:
Anthropic is not fighting for the consumer gateway (where OpenAI's checkout retreated) but
embedding inside merchant infrastructure, so the merchant keeps the customer data, the
payment and the checkout — "a merchant-control counter-position to AI shopping gateways".
The opposing camp is Google/Shopify's UCP, Microsoft Copilot Checkout and Amazon Buy. His
bear case is the one to keep in mind: if open protocols and model routing make intelligence
interchangeable, the value concentrates with platforms, payment networks and merchants —
not with the model vendor. *For a commerce platform vendor, that bear case is our bull
case.*

[MarkTechPost](https://www.marktechpost.com/2026/09/03/anthropic-released-claude-commerce-agents-an-apache-2-0-blueprint-for-shopping-and-merchant-agents-across-retail-travel-telecom-and-entertainment/)
is mostly a faithful summary, with one fair criticism: the single-agent architecture is
presented as settled, while deployment scale, error rates and comparative benchmarks stay
undisclosed.

No substantive Hacker News thread about this specific release turned up in search — the
results were general AI-safety discussion, not commentary on the repo.

## We already ship the other layer

This is the part to get right before anyone frames this as a choice. Checked in Jira:

| | Item | State |
|---|---|---|
| UCP | [VCST-5126](https://virtocommerce.atlassian.net/browse/VCST-5126) MVP | Done |
| | [VCST-5544](https://virtocommerce.atlassian.net/browse/VCST-5544) Logging in UCP | Done |
| | [VCST-5378](https://virtocommerce.atlassian.net/browse/VCST-5378) Authenticated user flow | Testing |
| | [VCST-5538](https://virtocommerce.atlassian.net/browse/VCST-5538) Pass conformance tests | To do |
| | [VCST-5139](https://virtocommerce.atlassian.net/browse/VCST-5139) The original spike | Done |
| MCP | [VCST-5339](https://virtocommerce.atlassian.net/browse/VCST-5339) MCP on .NET | Done |
| | [VCST-5127](https://virtocommerce.atlassian.net/browse/VCST-5127) Docs: Virto Commerce MCP | Done |
| | [VCST-4753](https://virtocommerce.atlassian.net/browse/VCST-4753) vc onX MCP adapter | Done |

So in the webinar's taxonomy ([11-webinar-slides.md](11-webinar-slides.md)) **row 01 —
serving somebody else's agent — is substantially built. Row 03, our own agent, is the one
that does not exist.** The epic [VCST-5201](https://virtocommerce.atlassian.net/browse/VCST-5201)
still reads Draft, which understates how far the work has gone.

These are **not competing options** — they answer different questions:

| | MCP / UCP | Commerce Agents |
|---|---|---|
| What it is | Protocols for exposing catalogue, cart and checkout to somebody else's agent | A blueprint for building your own agent inside your own storefront |
| The artefact | A server and a spec to conform to | A codebase to fork |
| Who talks to the customer | Gemini, Claude Desktop, other consumer surfaces | Our storefront |
| Who owns the session and the data | The gateway | The merchant |
| What it gives you | Tools, reachable over a wire | Prompt, skills, provenance gates, UI components, memory, evals |
| What it does **not** give you | Any of that second column — point a generic client at an MCP server and it can state a price from its own prose, has no comparison card, and nothing structurally stops a write | Reachability. It does not make us visible from Gemini or ChatGPT |
| Effect on Virto | Largely built already | Does not exist yet |

**They compose.** The blueprint ships no connectors — *"both agents reach your systems
through the backend interfaces"* — and the README says what to do with a platform's own MCP
server: it *"is called from a backend method server-side; on Managed Agents the manifest
mounts it beside the role's server, and the provenance gates stay in front of every write."*
Our MCP server therefore becomes an implementation detail **inside** `StorefrontBackend`,
which cuts real work off the thirteen methods in
[07-virto-fit-technical.md](07-virto-fit-technical.md) rather than duplicating them.

A complete Virto position probably needs both: be discoverable through the gateways *and*
ship a first-party agent. They should be written up together, and Shopify sitting on both
sides (UCP co-author, Claude flagship customer) is the proof that this is not an either/or.

Anthropic's own webinar makes the same split explicit — its "three ways to build agentic
commerce" puts the connector play and the first-party agent in different boxes, and its
architecture slide ends the agent's work at *"your checkout · any partner or protocol"*.
The two tracks meet at the checkout boundary instead of competing for it. See
[11-webinar-slides.md](11-webinar-slides.md).
