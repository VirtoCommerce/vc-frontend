# Runtimes, platforms, models, cost

Sources: repository README and `docs/deployment.md`; Anthropic platform documentation for
the Managed Agents and model facts.

## Three runtimes, one agent definition

The prompt, skills, tool contracts and gates are shared. What differs is who runs the loop
and who hosts it.

### Messages API — the reference loop

The host owns everything. This is what the four example apps are built around.

```python
agent = ShoppingAgent(backend=your_backend, skills_dir=Path("shopping-agent/skills"),
                      config=ShoppingAgentConfig(brand_name="Your Store"))
async for event in agent.stream_turn(messages, session, state):
    ...   # text_delta, tool_call, ui, cart_update, turn_complete
await agent.update_memory(messages, session)   # this path only
```

Example hosts take the session id in an `X-Session-Id` header. This path has the **most**
enforcement: every grounding rule is forced with `tool_choice`, and memory extraction runs
here.

### Agent SDK — the SDK runs the loop

Same prompt, skills and tools; the host prefetches grounding reads and nothing runs after
the turn. Ships a console for each role.

```bash
python shopping-agent/runtime-agent-sdk/main.py --once "a two-person tent under $250"
python merchant-agent/runtime-agent-sdk/main.py   # approves staged changes with y/N
```

Only the grounding rules that have a prefetch form apply; the shopping terms rule has none.
Memory extraction is the host's to call.

### Managed Agents — Anthropic hosts the loop

A hosted agent over the same skills and contracts, calling your MCP server.

```bash
scripts/deploy_managed_agent.sh shopping-agent/managed-agents/shopping-agent   # --live deploys
```

Managed Agents is a suite of APIs where Anthropic runs the harness *and* hosts a per-session
container: sandboxed execution, state and memory, scoped permissions, scheduled runs,
inspectable traces in the Console. You create a persisted, versioned Agent config once and
open Sessions against it — `model`, `system` and `tools` live on the agent, never on the
session. Public beta; standard token rates plus **$0.08 per session-hour** of active
runtime.

**Important caveat for this blueprint: no grounding rules run on the Managed Agents path.**
The manifest also declares no analysis tool, and the merchant MCP server config sets
`require_host_approval=False` because the platform's own `always_ask` prompt on
`apply_change` is the approval instead.

### Which one for us

Messages API. We would be embedding a conversation in our own storefront with our own
session, our own auth and our own rendering, and that path carries the full gate set. The
Agent SDK is a console-shaped tool; Managed Agents trades away the grounding rules and adds
a per-session-hour cost for infrastructure we already have.

## Platform support

| Path | Anthropic API | Vertex AI | Bedrock | Foundry | In-house gateway |
|---|---|---|---|---|---|
| Messages API runtimes | Yes | Yes | Yes | Yes | Yes |
| Agent SDK runtimes | Yes | Yes | Yes | Yes | Yes |
| Managed Agents | Yes | No | No¹ | No | Yes² |
| Merchant analysis, hosted code execution | Yes | No | No | Yes³ | No |
| Merchant analysis, `execute_analysis_query` | Yes | Yes | Yes | Yes | Yes |

¹ On AWS it is reachable through Claude Platform on AWS, not Bedrock. ² Through a
pass-through proxy. ³ Foundry deployments hosted on Anthropic only.

Platform selection is one argument: `client=` on the agent for the Messages API runtimes,
`options.env` for the Agent SDK (`CLAUDE_CODE_USE_VERTEX=1`, `CLAUDE_CODE_USE_BEDROCK=1`,
`CLAUDE_CODE_USE_FOUNDRY=1`, or `ANTHROPIC_BASE_URL`). **This matters commercially**: a
customer who will only run on their own Azure or AWS account is a config change, not a
rewrite.

## Model ids and what they cost

The model is a plain string in the config. Each role config has `model` and `memory_model`;
the merchant config adds `analysis_model`. Nothing else reads the string.

| Field | Repo default | Rate (Anthropic API, per MTok in/out) |
|---|---|---|
| Shopping `model` | `claude-sonnet-5` | $2 / $10 |
| Merchant `model` | `claude-opus-5` | $5 / $25 |
| `memory_model` | `claude-haiku-4-5-20251001` | $1 / $5 |

Cached reads cost ~10% of fresh input tokens, which is why the 90–99% cache-hit design in
[02-architecture.md](02-architecture.md) is a cost feature and not just a latency one. Id
grammar differs by platform: Vertex writes dated snapshots with `@`; Bedrock Mantle takes
dateless `anthropic.` ids while the Invoke API takes inference-profile ids; Foundry takes a
deployment name. All three model fields go through one client, so all three must exist on
the platform you target.

## What this actually costs

"It is open source, so we only pay for the API" is the right instinct and an incomplete
bill. The licence is genuinely free; there are four cost lines behind it, and only the
first is a vendor invoice.

### 1. The licence: free, and permissive

Apache-2.0. We may fork it, modify it, ship it inside a closed commercial product, and
charge for that product. The obligations are to keep the licence text and the NOTICE file
and to state changes; there is no copyleft and no per-seat fee. The licence covers the
code — model usage is governed separately by Anthropic's commercial terms and usage policy.

### 2. Claude tokens — the only vendor line

Per conversation, at the rates in the table above, on the repo's Sonnet 5 default with a
cached ~30k-token prefix. The sketch below was arithmetic; it has since been **measured**,
and the measurement follows it:

| | Tokens | Rate | Cost |
|---|---|---|---|
| Cached prefix read | ~30k | ~$0.20/MTok (10% of input) | ~$0.006 |
| Fresh input (message + tool results) | ~3k | $2/MTok | ~$0.006 |
| Output | ~800 | $10/MTok | ~$0.008 |
| **One shopping turn** | | | **~$0.02** |

A ten-turn conversation lands around **$0.15–0.30**. The first turn costs more because a
cache write is billed at ~1.25×; memory extraction on Haiku is rounding error.

**Measured, 2026-09-16**, on our own agent against the QA storefront: a six-case eval run
cost **$0.0735** — about **1.5¢ per case** — reading 145k cached input tokens against 2.1k
fresh, a cache hit rate near **98.5%**. The same run without prompt caching would be about
4.6× more. A ten-turn conversation works out at roughly **$0.12**, so the arithmetic above
was the right order and slightly pessimistic.

Two things the measurement does not cover, both from
[14-what-the-blog-says.md](14-what-the-blog-says.md). The prompt cache's default TTL is
**five minutes**, and a buyer who pauses to think between turns pays a fresh cache write —
so $0.12 is a floor, not an average, and a one-hour TTL (2× on write against 1.25×) is a
measurement someone should make. And Anthropic's guidance is to choose model *and* effort
by sweeping a whole eval suite; ours has six cases, which cannot decide it.

The merchant agent costs several times more per turn (Opus, plus the analysis delegate) and
has orders of magnitude fewer concurrent users. That asymmetry is the whole reason the
repo defaults differ per role.

Levers, in the order they pay: keep the prefix byte-stable so the cache holds, shape tool
results so they are small, cap the loop with `max_tool_iterations`. **Measure before
quoting anything to a customer** — `cache_read_input_tokens` on `turn_complete`, and cost
per completed task rather than per request.

### 3. Running it — ours

The blueprint is code that has to live somewhere: the Python service, a session store, a
memory store, and whatever scaling a public storefront needs. Our compute, our DevOps.
Managed Agents would absorb this for $0.08/session-hour, but it also drops every grounding
rule, which is why we are not choosing it.

### 4. Maintaining the fork — ours, and the largest line

Not an invoice, but the biggest real cost. No upstream, no security patches, no dependency
bumps, and 35 open PRs including real bug fixes that nobody will merge
([09-risks-and-nuances.md](09-risks-and-nuances.md)).

### And if the customer insists on their own cloud

Bedrock and Vertex AI are partner-operated with their own pricing, not Anthropic's rate
card. Foundry bills through the Microsoft Marketplace at standard API rates.

## Open product question: whose key

This follows directly from the cost model and should be decided early, because it changes
the architecture of the service.

| | Merchant brings their own key | We resell tokens |
|---|---|---|
| Our COGS | Zero | Per conversation, per merchant |
| Abuse exposure | Theirs | **Ours** — a public storefront is an unauthenticated surface where every conversation costs money |
| Onboarding | Worse: they need an Anthropic account and a key | Better: it just works |
| Margin | None | Real |
| Rate limiting, budgets, quotas | Their problem | Must exist before launch |

Bring-your-own-key is the safe default for a first release and the one that lets a pilot
ship without a billing story. Reselling is the better product and needs per-session budgets,
rate limiting and abuse handling designed in, not added later. This is a product decision,
not a technical one.
