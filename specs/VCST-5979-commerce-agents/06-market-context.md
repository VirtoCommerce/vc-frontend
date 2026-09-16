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

## Overlap with the UCP spike

[VCST-5139](https://virtocommerce.atlassian.net/browse/VCST-5139) (done) covered the
Universal Commerce Protocol and its Shopify/BigCommerce support, under epic
[VCST-5201](https://virtocommerce.atlassian.net/browse/VCST-5201). These are **not
competing options for us** — they answer different questions:

| | UCP | Commerce Agents |
|---|---|---|
| What it is | A protocol for exposing a catalogue and checkout to somebody else's agent | A blueprint for building your own agent inside your own storefront |
| Who talks to the customer | Google/Gemini, other consumer surfaces | Our storefront |
| Who owns the session and the data | The gateway | The merchant |
| Effect on Virto | Implement the spec so our merchants are reachable | Ship an agent our merchants embed |

A complete Virto position probably needs both: be discoverable through the gateways *and*
ship a first-party agent. They should be written up together, and Shopify sitting on both
sides (UCP co-author, Claude flagship customer) is the proof that this is not an either/or.
