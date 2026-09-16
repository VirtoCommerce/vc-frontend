# From the webinar

Source: <https://www.anthropic.com/webinars/building-claude-commerce-agents>, slides
captured while watching. This is framing that does not appear in either blog post, and one
slide reframes the UCP question in [06-market-context.md](06-market-context.md).

## Three ways to build agentic commerce

| | Where | Experience |
|---|---|---|
| 01 | **Within AI-native surfaces** | A shopping or merchant connector, so your systems are available as tools |
| 02 | **For people, on the open web** | Your site, driven by the agent |
| 03 | **In your own app** ← *their focus* | Your surface, with end-to-end control |

Spoken version: *"you build your own agent in your own app on your own data, and Claude is
the intelligence layer behind it, through the API, SDK, or CMA."*

This is the taxonomy the whole release sits inside, and it is worth adopting because it
separates three things that get argued about as if they were one choice.

**What it means for Virto.** These are not competing options for a platform vendor — they
are three surfaces our merchants need, and a platform can serve all three where an
individual merchant can usually only afford one. That is the differentiator:

- **01** is the UCP / connector track, epic [VCST-5201](https://virtocommerce.atlassian.net/browse/VCST-5201).
  Expose a Virto catalogue, cart and checkout as tools so somebody else's agent can shop it.
  We do the work once; every merchant on the platform becomes reachable.
- **02** is the one nobody owns: a browser agent driving our storefront as a person would.
  We do not control the agent, but we control whether the storefront is legible to one —
  which makes semantic markup, stable selectors and accessibility a commercial concern, not
  just a compliance one. Worth a note of its own; it is currently nobody's ticket.
- **03** is this spike. A first-party agent inside the merchant's storefront, where the
  merchant keeps the session, the data and the customer.

The honest reading is that **01 and 03 are both ours to build, in that order of certainty**:
01 is a spec to implement with a known shape, 03 is a product decision. 02 is a posture, not
a project.

## The ownership boundary

The clearest slide in the deck, and the one to reuse verbatim in any internal pitch:

| You own | Anthropic provides |
|---|---|
| Your data and catalog | Two agents |
| Your systems | Skills and tools |
| Your brand and policies | The UI the agent draws |
| Your customers and sellers | Guardrails |

Footer of the same slide: **"Your checkout · Any partner or protocol"**, under a box labelled
*"An open-source blueprint you own and can extend"*.

Two things follow from that footer:

1. It confirms what the code already showed — checkout is a handoff, and the blueprint takes
   no position on what completes it. For us that is our own checkout route, a quote, or a
   purchase request ([07-virto-fit-technical.md](07-virto-fit-technical.md)).
2. **"Any partner or protocol" makes UCP a complement, not a rival.** The agent builds the
   basket; the protocol can be what closes it. The two tracks meet at the checkout boundary
   rather than competing for it.

## Inside the two agents

The skills, as the deck names them — matching the directories in the repo:

| Shopping agent | Merchant agent |
|---|---|
| Search & discovery | Sales insights |
| Planning & goals | Inventory operations |
| Customer care | Marketing campaigns |
| Purchase research | Catalog & listings |
| Memory & personalization | Pricing & promotions |

Shared foundation, per the slide's footer bar: **Tools · Memory · UI components ·
Guardrails · 3 runtimes**.

Note "UI components" sitting at the same level as tools and guardrails. It is presented as
part of the product, not as sample code — consistent with the UI-as-typed-tools design in
[02-architecture.md](02-architecture.md), and it is the part our design system would
replace.
