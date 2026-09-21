# Value: for our customers, their buyers, and our partners

The technical fit is in [07-virto-fit-technical.md](07-virto-fit-technical.md). This file is
the "why would anyone pay for it" half.

## The strategic point

A commerce platform vendor is on the winning side of Linas's bear case. His argument
against Anthropic is that if intelligence becomes interchangeable, value concentrates with
whoever owns the transaction, the catalogue and the customer relationship — platforms,
payment networks and merchants. That is us and our customers. Which means:

**The agent is a feature of the platform, not a product we resell.** We are not competing
with Claude; we are making Claude usable against a Virto catalogue, cart and order book in
days instead of months. The model is a swappable dependency — the platform keeps the
session, the data, the pricing rules and the checkout.

This also sets the honest limit on the pitch: we are not selling AI, we are selling the
integration and the guardrails. That is a more defensible thing to sell and a much easier
one to support.

## Who the customer is

A Virto customer is not necessarily one store with one owner. It may be a single brand, a
distributor, a wholesaler, or a **marketplace operator whose own customers are sellers** —
in which case the people this agent serves are two levels down. The blueprint
covers that shape explicitly: on a marketplace the seller is one more search dimension, and
the merchant agent acts for the operator the session names.

The statement that holds across all of them: **a conversational buying surface over the
customer's own catalogue, prices and rules, that they own and we maintain once.** The
sections below are that made specific.

## For the buyer

Conversation fits a professional buyer's job better than it fits a consumer's:

- **Reorder and bulk.** "Add the standard monthly order for site B, but double the gloves."
  Today that is a list page, a spreadsheet, or a call to a rep; in a conversation it is one
  sentence. The agent adds line by line today — `addBulkItemsCart` is not wired.
- **Find the right thing in a catalogue built for specialists.** Large catalogues are full
  of near-identical variants separated by attributes only an expert reads, and they are
  organised the way the business files them, not the way a buyer asks. The agent's
  comparison and option-filter behaviour is aimed exactly here. (One measured example of
  the vocabulary gap is in [09-risks-and-nuances.md](09-risks-and-nuances.md) — treat it as
  an illustration, not as the argument: how much of it is index configuration is a separate
  question for the platform team.)
- **"Where is my order and why is it late."** Over `getOrders` / `getOrder` — the single
  highest-volume support question, answered without a ticket, and the status is read from
  the order rather than recalled.
- **Close into a quote, not a card.** The natural B2B ending is a quote or a purchase
  request. The platform has both mutations; the agent does not call them yet. The agent
  builds the basket, a human closes.
- **Policies and terms, answered from the source.** The blueprint forces a read before the
  model answers, so no return window is invented. Today that read hits a stub and the agent
  says the lookup is unavailable, which is the honest half of the behaviour already
  working.

## For the business running the storefront

- **A sales-rep copilot.** The merchant agent's read half maps onto the Sales Rep Hub; the
  staging half suits somebody who proposes rather than commits. This is the Virto-shaped
  version of the merchant agent and the more interesting product. Caveat: it needs
  platform-side analytics that the storefront API does not have today.
- **Deflection with a floor under it.** The value is not "the bot answers everything", it is
  "the bot cannot quote a price that does not exist, cannot add a product that does not
  exist, and cannot change a listing without a human pressing approve." For an enterprise
  buyer, that floor is the sale.
- **Numbers to quote, with attribution.** Carts up to 35% larger and 60% more likely to
  complete a purchase are Anthropic's claims, not ours ([06-market-context.md](06-market-context.md)).
  Use them as market evidence with the source named, and commit only to what a pilot
  measures.
- **The scheduled agent, later.** Anthropic's own roadmap moves the merchant agent from
  answering questions to running on a cadence — continuous pricing, live inventory
  reaction, receivables chased ([11-webinar-slides.md](11-webinar-slides.md)). None of it
  ships today, but it is where the staged-change design pays off, and B2B finance ops is a
  gap in their blueprint that we are better placed to fill than they are: a recovered
  invoice is cash, which is a far easier number to defend than conversion lift.

## For partners and implementers

This is where the platform-vendor position pays, and it is the part most likely to be
under-appreciated internally.

- **A blueprint is a delivery accelerator.** A partner building a shopping agent for a
  client today is writing prompts, a tool layer, a safety story and an eval harness from
  nothing. Handing them a working reference plus a Virto backend implementation turns a
  research project into a configuration job.
- **`enable_*` switches are the productisation mechanism.** A system the client lacks is a
  flag, and flipping it removes the tools, the prompt lines and the grounding rule without
  touching anything else. That is exactly how a partner tailors one agent to many clients
  without forking prompts — and it means we can ship sensible defaults.
- **`brand_name`, `assistant_name`, `brand_voice`** are config on either agent. White-label
  is a settings screen, not a code change.
- **Presentation extensions are where a partner adds their vertical.** The verticals ship
  seven; a partner adds a configurator card, a spec-sheet comparison, a delivery-window
  picker. This is a natural place for paid customisation.
- **Bring-your-own-cloud is a config change.** Vertex, Bedrock, Foundry or an in-house
  gateway are one client argument ([05-runtimes-and-deployment.md](05-runtimes-and-deployment.md)).
  A client whose procurement will only allow Azure is not a rewrite. Enterprises ask this
  question early and a "yes" closes doors for competitors.
- **The compliance story is pre-assembled.** ISO 42001, the Trust Centre, the constitution,
  and — more useful — a safety model whose rules are enforced in code and can be shown to a
  reviewer line by line ([03-safety.md](03-safety.md)).

## How to demo it

**The script for what actually runs is [13-demo-script.md](13-demo-script.md)** — a drinks
reorder against the QA store, nine turns, with what each one proves and what not to show.
Use that one.

The argument it makes, in order: the agent finds the right thing in a catalogue whose
search does not reward plain language; a refused write is reported as a refusal rather than
as a success; it declines to invent a product, a price or a return window; and it remembers
a preference across a reload. The second and third of those are what sell to an enterprise.

Three demo beats named here before the build do **not** exist yet and belong to the POC
scope ([15-poc-estimate.md](15-poc-estimate.md)): turning the cart into a quote, answering
from a real policy page, and anything on the merchant side.

## What we should not claim

- Not a payment or checkout capability. Nothing in the blueprint places an order.
- Not autonomous merchandising. Every write is staged.
- No conversion uplift figure of our own until a pilot measures one.
- Not a maintained upstream — see the fork reality in [09-risks-and-nuances.md](09-risks-and-nuances.md).
