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

## Cost sketch for a pilot

Nothing measured yet — this is arithmetic to be replaced by a real trace, and it is
deliberately rough.

A shopping turn on Sonnet 5 with a cached ~30k-token prefix and a few hundred fresh tokens
lands in the fractions-of-a-cent range for input, with output the larger half. The design
levers are the ones the blueprint already pulls: keep the prefix byte-stable so the cache
holds, shape tool results so they are small, and keep the loop short with
`max_tool_iterations`. The merchant agent is the expensive one (Opus, analysis delegate)
and it is also the one with the fewest concurrent users — that asymmetry is deliberate.

**Measure before quoting anything to a customer**: `cache_read_input_tokens` on
`turn_complete`, and cost per completed task rather than per request.
