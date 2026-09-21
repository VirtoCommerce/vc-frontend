# What it is

Source: <https://claude.com/blog/claude-for-commerce-agents>, the repository README, and
the repository itself (`~/vc/commerce-agents`).

## The release

Published 2026-09-02 as `github.com/anthropics/commerce-agents`. Two agents, defined once
each (prompt, skills, tool contracts, gates) and runnable on three runtimes; four verticals
demonstrating both over the same libraries.

- **Shopping agent** — searches, compares, plans, fills the cart, answers order and policy
  questions, remembers what the customer says. Five skills: `search-discovery`,
  `purchase-research`, `planning-goals`, `customer-care`, `memory-personalization`.
- **Merchant agent** — explains performance, maintains listings, acts on inventory and
  order alerts, prices and promotes, drafts campaigns. Five skills: `performance-insights`,
  `catalog-listings`, `inventory-operations`, `pricing-promotions`, `marketing-campaigns`.

Verticals: `retail` (ACME), `travel` (date-bound inventory, itinerary presentation),
`telecom` (account context, plan matrix, server-authored fee disclosures), `entertainment`
(timed holds, waitlists, transfers, venue map, all-in fee disclosures).

## What it is not

Stated by Anthropic, and confirmed by reading the code: not a consumer shopping
destination, not a commerce protocol, not a payment processor. `StorefrontBackend` has no
method that places an order; `checkout` renders the cart for the host to complete. Every
merchant write is staged until a person approves it. Business rules, authorization and
compliance belong to the deployment.

## Licence and maintenance — read this before planning around it

Apache-2.0, and the README says plainly: *"This is a reference implementation; it is not
maintained and does not accept contributions."*

Measured 2026-09-16 via the GitHub API:

| | |
|---|---|
| Stars / forks | 2906 / 560 |
| Open issues + PRs | 35 |
| Created | 2026-09-01 |
| Last push | 2026-09-11 |

The open PRs include real bug fixes (`consider every occurrence when finding the longest
product token`, `parse skill frontmatter using complete fence lines`, `isolate in-memory
facts from caller mutations`) and dependency bumps. They are not being merged, and `main`
has not moved since the release.

**This is a pinned dependency, not a fork.** `requirements.txt` installs the three packages
from a commit and nothing is vendored or patched, so taking an upstream change would be a
SHA bump and a test run. The problem is not that we cannot take updates — it is that there
are none, and any fix we need is ours to write. That is when a fork begins.

## Layout

| Directory | Contents | pip package, import name |
|---|---|---|
| `commerce-common/` | Shared: config, fencing, memory, skills, grounding, presentation, executor frame, events | `commerce-common`, `commerce_common` |
| `shopping-agent/core/` | Types, `StorefrontBackend`, prompt, tool contracts, gates, executor | `shopping-agent-core`, `shopping_agent` |
| `shopping-agent/runtime-messages-api/` | `ShoppingAgent`, the turn loop | `shopping-agent-runtime` |
| `shopping-agent/runtime-agent-sdk/` | Same agent on the Agent SDK, with a console | `shopping-agent-sdk` |
| `shopping-agent/managed-agents/` | Manifest + storefront MCP server | — |
| `merchant-agent/*` | The same four shapes for the merchant role | `merchant-agent-*` |
| `examples/` | Four verticals, shared host code (`demo_common/`), shared web code (`web-shared/`) | — |
| `plugins/commerce-builder/` | The Claude Code plugin | — |
| `docs/` | `safety.md`, `backends.md`, `deployment.md` | — |

## Install — verified locally

Python 3.11+ and Node 22. Local run had Python 3.12.3 and Node 22.22.3.

```bash
git clone https://github.com/anthropics/commerce-agents.git && cd commerce-agents
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt       # seven editable packages + pinned deps
cp .env.example .env                  # add ANTHROPIC_API_KEY
(cd examples && npm ci)               # eight web apps in one workspace
python scripts/run_demo.py retail     # API :8000 + storefront :3000
```

`pip install` succeeded and `import shopping_agent, merchant_agent, commerce_common`
works. **The two Node lines above have not been run**: `npm ci` in `examples/` was blocked
by the local permission classifier early in the spike and never revisited, so Anthropic's
own demo apps have not been seen running. Worth doing — each app also serves `/showcase`,
which renders every presentation component from fixtures with no backend and no API key. Notable pins: `anthropic==0.122.0`, `claude-agent-sdk==0.2.139`, `mcp==1.29.0`,
`fastapi`, `uvicorn`, `pydantic`. The seven repo packages are deliberately unregistered on
PyPI and install only from their directories — CI asserts that.

Demo ports: storefront `3000`/`3001`/`3002`/`3003`, merchant portal `3100`-`3103`, one per
vertical. `--merchant` starts the portal instead, `--all` both.

## Scaffolding plugin

```bash
claude plugin marketplace add anthropics/commerce-agents
claude plugin install commerce-builder@claude-commerce-agents
/scaffold-commerce-agent a shopping assistant for our store
```

Also `/add-commerce-flow`, `/author-commerce-evals`, `/review-commerce-agent`. The plugin
reads the cloned repo as its reference, so the clone has to stay on disk.

Used in this spike: `/scaffold-commerce-agent` produced `commerce-agent/`, and
`/author-commerce-evals` its `evals/`. `/review-commerce-agent` has not been tried, and is
the obvious next use now that there is something to review.

## `.env` and keys

`.env.example` holds one variable, `ANTHROPIC_API_KEY`. Only the example API hosts
(`examples/demo_common/host.py`) read the `.env` file; the SDK consoles and MCP servers
read the environment only.
