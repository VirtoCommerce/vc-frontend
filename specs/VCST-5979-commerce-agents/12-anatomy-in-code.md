# What a commerce agent actually is, in code

Read out of the repository rather than the slides. The short answer: a **harness around one
Messages API loop**, where the only thing a deployment writes is a backend class. The
"interface" is not bolted on beside it — the UI is a subset of the tools.

## The parts

| Part | Where | What it does |
|---|---|---|
| Config | `shopping_agent/config.py` | `brand_name`, `assistant_name`, `brand_voice`, the `enable_*` switches, and every cap. **Determines the tool list and the prompt bytes**, so it is the deployment's whole dial set |
| System prompt | `shopping_agent/prompt.py` | Two halves: `build_static_system` (identity, the rules that apply on most turns, the skill index — byte-identical across turns, cached) and `build_dynamic_context` (per-request, after the cache breakpoint, inside the data fence, capped so a verbose backend cannot crowd out the rest) |
| Skills | `shopping-agent/skills/*/SKILL.md` | Five directories, one markdown file each: frontmatter (`name`, `description`) plus the flow's rules in prose |
| Tool registry | `shopping_agent/tools/registry.py` | The tool contracts in a fixed order, a pure function of the config |
| Executor | `commerce_common/execution.py` | Dispatch by name, clamp limits, run gates, split the `status` line, turn exceptions into tool outcomes |
| Gates | `shopping_agent/gates.py`, `merchant_agent/gates.py` | Provenance, caps, guardrails, host approval |
| Presentation | `commerce_common/presentation.py` + per-role `enrichment.py` | Validate the component schema, then join every id against server records |
| Grounding | `commerce_common/grounding.py` | Forces a read tool before the model answers certain message shapes |
| Turn loop | `commerce_common/turn.py` + per-runtime `orchestrator.py` | Streams, dispatches eagerly, caps iterations, compacts history, emits events |
| Memory | `commerce_common/memory.py` | Store, write filter, retention, post-turn extraction |
| **Backend** | `backend.py` (ABC) | **The only part we write** |

## Skills are loaded on demand, not pasted into the prompt

This is the detail that makes ten skills cost almost nothing. The prompt carries only the
*index* — each skill's name and one-line description. The body arrives through a tool:

> `load_skill` — "Load the rules of the flow whose entry in the skill index the request
> matches; **they are not in your prompt**. Call it in the same round as the flow's first
> read and follow them for the rest of the flow."

A `SKILL.md` is plain markdown. `search-discovery` opens with frontmatter naming when it
applies *and when it does not* ("Not needed when one search for the thing the customer named
answers the request"), then sections like "Read the request and phrase the search",
"Shortlist and recommendation", "When the item is for someone else". The rules are specific
and operational — *show three to six options with the recommendation first; when the
customer narrows to two to four finalists use `present_comparison` instead of another row of
cards; before saying several options fit under a figure, add up their prices.*

So a skill is not code and not a subagent. It is a **paged-in section of the prompt, scoped
to one flow**, which is why adding one changes no bytes for any other conversation.

## The tools are the product

Shopping agent, 22 tools, in three groups that matter:

**Reads and writes** — `search_products`, `get_product_details`, `get_cart`, `add_to_cart`,
`update_cart_item`, `remove_from_cart`, `get_preferences`, `get_orders`, `get_order_status`,
`search_policies`, `get_fulfillment_options`. Each one is a method on our backend.

**Memory** — `save_memory`, `recall_memories`.

**Presentation — this is the UI** — `present_products`, `present_comparison`, `present_plan`,
`present_guide`, `present_order_status`, `present_suggestions`, `present_disclosure`, and
`checkout`. Note where `checkout` sits: it is a *presentation* tool. It renders the cart; it
does not buy anything.

Plus `load_skill` and, when enabled, `web_search`.

Merchant agent, 23 tools: the eight reads, five `stage_*` writes, `apply_change` /
`discard_change` / `get_pending_changes`, memory, and four presentation tools
(`present_metrics`, `present_digest`, `present_change_preview`, `present_suggestions`).

## One turn, end to end

1. The host receives a message with a session id, loads the session, and calls
   `agent.stream_turn(messages, session, state)`.
2. The prompt is assembled: static half (cached), then the dynamic block — profile, cart,
   memory, page — fenced and placed after the breakpoint.
3. Grounding may force a read tool for this message shape via `tool_choice`.
4. The model streams. `EagerDispatcher` starts a tool call **as soon as its arguments finish
   parsing**, not when the sentence ends, so two searches run while Claude is still writing.
5. Each call goes through the executor: name checked against the registry, `status` line
   split off, limits clamped, gates run. A blocked call returns a normal result with status
   `blocked` and the gate's name; a failure returns an error result. **A tool exception never
   ends the turn.**
6. A presentation call is validated against its schema, then every product, order or metric
   on it is joined from server records; ids without provenance are dropped, and a component
   left with nothing is refused.
7. Events stream to the host: `text_delta`, `tool_call`, `ui`, `cart_update`
   (`change_update` on the merchant side), `turn_complete`. The `ui` event is what the front
   end renders — which is why the card appears before the turn finishes.
8. After `max_tool_iterations` rounds the loop forces a round without tools. Above
   `compact_history_above_tokens` the oldest tool results are dropped from the stored
   conversation.
9. `update_memory` runs after the turn, reading only the user's and assistant's text.

## What this means for us, concretely

Three pieces of work, in dependency order. **All three were since written** — the estimates
in each are left as they were, because comparing them with what it actually took is the
useful part.

> Built: `commerce-agent/virto_agent/` (1 and 2) and
> `client-app/modules/commerce-agent/` (3), on branch
> `spike/VCST-5979-commerce-agents`. Piece 1 was indeed the bulk and indeed ordinary
> API-client work — until the error translations, which were larger and more important than
> "plus" suggests ([09-risks-and-nuances.md](09-risks-and-nuances.md)). Piece 3 is two of
> eight components so far; the claim that they are ordinary components fed ordinary props
> held exactly.

**1. A backend class.** `VirtoStorefrontBackend(StorefrontBackend)` — roughly thirteen
methods over x-api (it was exactly thirteen) ([07-virto-fit-technical.md](07-virto-fit-technical.md)), plus the error
translations. This is the bulk of the integration and it is ordinary API-client work. Where
our existing MCP server already exposes catalog, cart or checkout, a backend method can call
it server-side instead of x-api directly, with the gates still in front
([06-market-context.md](06-market-context.md)).

**2. A host.** Session store binding the authenticated principal and its credential, an
HTTP endpoint that takes `X-Session-Id` and streams events as SSE, and whatever rate
limiting the key model demands. The `examples/demo_common/` code is a working reference for
exactly this and is the thing to read before writing ours.

**3. A front end.** A chat surface in the theme plus one Vue component per presentation tool
— products, comparison, plan, guide, order status, suggestions, cart/checkout card. These
render from the `ui` event's validated payload, which means **they are ordinary components
fed ordinary props**, not markdown parsing. Our design system replaces theirs here; the
schemas stay.

What we do *not* write: the prompt, the skills, the gates, the enrichment, the turn loop,
the memory pipeline. That is the part worth having, and it is also the part that makes the
Python-versus-.NET question expensive ([09-risks-and-nuances.md](09-risks-and-nuances.md)) —
porting the backend is a week, porting the harness is the project.

## One deployment's dial set

Worth stating separately, because it is how this becomes a product rather than a bespoke
build. Everything below is configuration, changing no code:

- `brand_name`, `assistant_name`, `brand_voice` — identity and tone
- `enable_*` — which systems exist; switching one off removes its tools, prompt lines and
  grounding rule on every path
- caps — `max_search_results`, `max_tool_iterations`, `compact_history_above_tokens`,
  per-item and line-count limits, price-move and promotion-depth guardrails
- `model`, `memory_model`, `analysis_model` — plain strings
- skills — a directory; adding a flow is adding a `SKILL.md`
- presentation extensions — a domain component registered as a typed tool
