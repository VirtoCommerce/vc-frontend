# The engineering argument

Source: <https://claude.com/blog/the-anatomy-of-effective-commerce-agents>, cross-checked
against the repository.

This is the part worth taking even if we never use a line of their code.

## One agent with skills, not subagents

> "A single agent with skills consistently has outperformed both the one-prompt-for-
> everything design and the subagent design on quality, and often at a lower cost and
> latency per task."

The reasoning: a commerce conversation is tightly coupled across intents — a customer
drifts from search to comparison to a returns question and back, carrying the same cart and
the same stated constraints. Handing off to a subagent is a state-lossy operation, and it
adds a round trip. A skill is a directory with a `SKILL.md` that loads into the one
context instead.

Caveat worth keeping: this is a claim about **conversational commerce**, not a universal
law. The retail transformation PDF describes L'Oréal running Claude as orchestrator of 15+
specialised agents for internal analytics — a different shape of problem (fan-out over a
data platform), where the fan-out pays.

## Context in three tiers, for the cache

| Tier | Contents | Property |
|---|---|---|
| Global | System prompt, tool definitions | Byte-identical across sessions, cached |
| Session | Per-customer facts, conversation history | Per session |
| Volatile | Current time, current page | Placed **last**, after the cache breakpoint |

Reported result: 90–99% cache hit rate in production; cached reads cost ~10% of fresh
tokens and give 1.5–2× speed at ~100k-token scale. The repo's own verification advice: read
`cache_read_input_tokens` from the `turn_complete` event — zero on a second turn means the
prefix changed.

This is the same prefix-stability rule that applies to any Claude integration: render order
is `tools` → `system` → `messages`, and one byte anywhere in the prefix invalidates
everything after it.

## Tools call the real systems

Three rules they state:

1. **Build on what exists.** Tools call the production search, cart and inventory services,
   not reimplementations.
2. **Return shaped context.** Drop fields the model does not need; reshape a result so it
   carries the actionable next step.
3. **UI components are tools.** A product carousel, an itinerary, a seat map — each is a
   typed tool call with a validated schema, not markup parsed out of the model's prose.

Rule 3 is the structurally interesting one. The conversation history stays machine-readable
(the components are in the messages array, not in free text), the system prompt does not
bloat with tag definitions, and every value rendered can be joined from server records
before it reaches the screen. Domain-specific components are `PresentationExtension`s; the
verticals ship seven.

## The staging rule

> The model stages; humans or policy apply.

No tool moves money or changes business state. Writes produce staged changes that go
through the host's existing approval workflow. Only server-issued ids are accepted for
writes and renders, which structurally blocks a hallucinated id. Third-party content
(reviews, seller listings) is sanitised before the model sees it. Details in
[03-safety.md](03-safety.md).

## Evals: snapshots, not simulated conversations

Construct the state, append one user message, grade the final state and the rendered
response. They recommend 50–100 cases per user flow, covering:

- core traffic requests
- context-dependent behaviour
- safety and brand cases, checked byte-for-byte
- multi-capability requests that need two systems at once

Simulated-user conversations are explicitly not the recommended shape — they are slow,
noisy and grade the simulator as much as the agent.

## Memory is extracted, not saved by a tool

A separate process reads the conversation after the turn and creates or updates facts in a
database. Measured against a real-time `save_memory` tool: **13% higher fact recall**,
because the tool competes for the agent's attention mid-conversation.

Constraints in the code: a fact has a key ≤64 chars, a value ≤200 chars, one of three
categories, and passes a write filter on both paths. Identifier-shaped values are refused by
default.

## Model choice is measured, not assumed

Their method: sweep the whole eval suite across every candidate model and effort level
against your own traffic distribution. The non-obvious finding:

> "A more intelligent configuration sometimes wins on latency (most commonly on p90 and
> p99) despite slower tokens, because it plans its tool calls better."

Starting point, then measure: **Opus for the merchant agent** (analysis-heavy),
**Sonnet for the consumer agent** (latency-sensitive). The repo defaults match — see
[05-runtimes-and-deployment.md](05-runtimes-and-deployment.md).

## Other claims

Eager tool dispatch reportedly cuts multi-second gaps to a few hundred milliseconds.
Multi-team ownership follows systems, with CI running each domain's own eval set.

What is **not** disclosed anywhere: deployment scale, error rates, and any comparative
benchmark behind the architecture claims. The marketing numbers — carts up to 35% larger,
shoppers 60% more likely to complete a purchase — come with no methodology.
