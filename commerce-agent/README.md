# Virto shopping agent (VCST-5979 spike)

A shopping agent for a Virto storefront, built on the
[anthropics/commerce-agents](https://github.com/anthropics/commerce-agents) reference
packages, pinned at `fd4d592`. The reference supplies the prompt, tool contracts, gates,
grounding, presentation, memory and the turn loop; this module supplies the four things a
deployment owns:

| File | What it owns |
|---|---|
| `virto_agent/backend.py` | `StorefrontBackend` over x-api |
| `virto_agent/mapping.py` | which x-api object becomes which blueprint shape |
| `virto_agent/config.py` | the deployment's prompt knobs and lexicons |
| `virto_agent/executor.py` | this platform's own failures, mapped to conversation |
| `virto_agent/service.py` | the FastAPI service the theme calls |

The decision record — role, systems, identity, posture, flows, gates — is in the
repository's `CLAUDE.md` under **Commerce agent decision record**.

## Run it

```bash
python -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env            # ANTHROPIC_API_KEY, XAPI_ENDPOINT, XAPI_STORE_ID
.venv/bin/python -m uvicorn virto_agent.service:app --port 8080 --workers 1
```

**One worker.** The session store, the token store and the provenance state are in this
process's memory; a second worker splits sessions between processes with no error.

```bash
.venv/bin/ruff check .
.venv/bin/pytest
```

## The theme's side

```
POST /api/session        Authorization: Bearer <the theme's access token>, body {timezone}
                         → {session_id, name, organization}
POST /api/chat           X-Session-Id, body {message, page}  → SSE AgentEvent stream
GET/DELETE /api/memory   X-Session-Id
POST /api/session/end    X-Session-Id
GET  /api/health
```

After session start every request carries the session id alone. The event stream is the
one in `commerce_common/streaming.py`; `examples/web-shared/protocol.ts` in the reference
is the TypeScript mirror to start the theme's renderer from.

## What is not wired

- `search_policies` raises: x-api has no search over CMS pages. The policy grounding gate
  stays **on** over it on purpose — a terms question then hits an unavailable tool and the
  agent says so, rather than answering the store's terms from model knowledge.
- `get_preferences` returns the bare principal; memory fills it.
- `checkout_handoff` is the reference default (the theme's own `/checkout`). The B2B
  endings — `createQuoteFromCart`, `createPurchaseRequestFromDocuments` — are unwired.
- Configurable products are refused at the cart with a sentence, not added; see
  `NeedsConfiguration`.
- `purchase-research` and `customer-care` sit in `skills/_staged/` because both open on
  `search_policies`. `load_skills` reads direct children only, so they are not indexed.
