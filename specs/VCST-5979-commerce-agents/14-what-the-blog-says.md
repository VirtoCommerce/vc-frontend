# What Anthropic's own blog says, measured against what we built

Three posts, read 2026-09-17, after the service and the theme module were already running.
Everything before this file came from the reference repository, its `docs/`, the
`commerce-builder` skills and the webinar — **not** from these. So this is a check on work
already done, which makes the agreements worth as much as the gaps.

| Post | Date | What it is |
|---|---|---|
| [Building commerce agents with Claude](https://claude.com/blog/claude-for-commerce-agents) | 2 Sep | The announcement: the blueprint, the two roles, partners, business numbers |
| [The anatomy of effective commerce agents](https://claude.com/blog/the-anatomy-of-effective-commerce-agents) | 2 Sep | The engineering guide |
| [Reducing cost and improving performance with Claude Platform](https://claude.com/blog/reducing-cost-and-improving-performance-with-claude-platform) | 8 Sep | Not commerce, but directly about our bill |

## 1. The numbers the spike was missing

> "Retailers running shopping agents on Claude have seen carts **up to 35% larger** and
> shoppers **60% more likely to complete a purchase**."

These are the only public figures Anthropic gives for business effect, and
[09-recommendation.md](09-recommendation.md) has none. Treat them as vendor-reported and
unaudited; they still belong in the case, attributed.

Named in the same post: Shopify, Priceline, Intuit, Klaviyo, Wix, Zomato, Fetch, Square as
customers, and Accenture, Mastercard and Visa as ecosystem partners. Deployment is offered
on Bedrock, Microsoft Foundry and Vertex as well as the Anthropic API — which bears on the
open "whose key" question in [04-cost-model.md](04-cost-model.md): a customer's own cloud
account is a fourth answer we had not listed.

**To verify, not to copy:** `commerce-agent/CLAUDE.md` records the repository as
"explicitly unmaintained" (its own README says so), while the announcement presents it as a
live product with partners. Most likely both are true — a blueprint you fork, not an SDK
they patch — but the wording in our record should be checked rather than repeated.

## 2. What the anatomy post confirms

Arrived at independently, which is the useful part:

| Its rule | Where ours lives |
|---|---|
| "Include error instructions instead of error codes" | `cart_errors.py`, and `UnknownCategory` through the executor's `domain_error` |
| "Build agent tools on top of your core systems and logic" | Why the category filter resolves against the catalog's own tree instead of being folded into query text |
| "Return the fields the model reasons with and drop the rest" | Our own GraphQL documents rather than the theme's fragments |
| Snapshot evals, not simulated conversations | `evals/harness.py`: set the state, append one message, grade the end |
| Server-issued ids only for writes and renders | The cart provenance gate over `seen_products` |
| Caps enforced on resulting state, writes serialized per session | Caps 24/item and 100 lines; `_cart_locks` comes with the reference |
| "No model tool call moves money" | No payment or order-placement code; `checkout` hands off to the theme's route |
| UI components rendered as tool calls | The eight presentation tools |
| Sonnet for the consumer-facing agent | `claude-sonnet-5` |
| 90–99% cache hit rate in production | Measured 145k cached reads against 2.1k fresh — about 98.5% |

One rule settles a decision taken the day before it was read: **load into the system prompt
what is relevant to "a third or more of your traffic"**. The catalog's 117 top-level
category names are fetched from x-api once per process and reach the model only inside the
`UnknownCategory` error, never in the cached prompt. A category miss is nowhere near a
third of traffic, so that is the right side of the line.

## 3. What it says that we have not done

1. **Eval coverage.** "50–100 eval cases per user flow is a good starting point." We have
   **six in total**, and none of the post's coverage types beyond core requests:
   context-dependent (screen references, carried-over constraints, memory), injection from
   both the user and the data plane, interface (right component, item caps, no internal ids
   on screen), and multi-capability requests. This is the largest single gap and it blocks
   the next item.
2. **Model and effort chosen by measurement.** The post says sweep the whole suite; we
   picked `claude-sonnet-5` by reasoning alone. Six cases cannot decide it.
3. **Memory read in three layers.** We have always-in-context and per-turn prefetch. There
   is no lookup tool for the rest.
4. **`eager_input_streaming: true`** on the presentation tools, to skip buffering on
   token-level streams. Neither we nor the reference sets it.

## 4. What the cost post says, applied to us

1. **Instruction anti-patterns: "14.6% lower cost and 5.3% higher accuracy"** after
   removing verification rituals, thoroughness boosters, mandatory step procedures, stale
   few-shot examples and contradictory rules. `domain_search_notes` roughly doubled on
   2026-09-16 and several error texts were written the same day, so ours is exactly the
   prompt that wants auditing. Free to do; the `claude-api` skill carries `prompt-audit`.
2. **Cache TTL is five minutes by default**, and `commerce_common/prompt_assembly.py` asks
   for plain `{"type": "ephemeral"}`. Our shape is a person typing between turns, so a
   thinking pause past five minutes pays a fresh write — which means the demo script's
   "$0.11 per run" is a floor, not an estimate. A one-hour TTL costs 2× on write against
   1.25×, so this is a measurement, not an obvious switch.
3. **Pre-warm the cache with a `max_tokens: 0` request at session start.** We already have
   `POST /api/session` firing on page load, minutes before the first message; the write
   would happen on the first turn anyway, so for a session that is used this is latency
   bought for nothing.
4. **`defer_loading` for rarely-used tools.** Eight presentation tools, several of which a
   given turn will never call.

## 5. Done on the strength of this reading

**"Show the work."** The post asks for "plain-language progress lines per tool call"
against a turn that takes 3–30 seconds. The service already emitted them — every tool call
carries a model-written `status`, sanitized server-side, which the runtime puts on the
`tool_call` event as `label` — and the theme was discarding the event. It now renders each
one as it arrives and marks it settled or failed when the matching `tool_result` lands. The
tool's name and arguments stay off screen: they are internals, and the arguments can carry
ids.
