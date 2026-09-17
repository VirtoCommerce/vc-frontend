# Demo script

One conversation, nine turns, on the real QA catalogue: **an office manager at [E2E Test]
Contoso Ltd. restocking the office drinks for the week.** Nothing is mocked — real
products, the organisation's own contract prices, the same cart the storefront uses.

Roughly **$0.11 of model tokens** for a full run. Each turn takes 3–30 seconds; that pause
is the agent searching, and it is worth narrating rather than apologising for.

## Why this scenario

A drinks restock is a genuine B2B repeat purchase, and it is the one corner of this
catalogue where **every product carries a real order minimum and maximum** — which is what
makes turns 2 to 5 possible without inventing anything. The whole cast was verified against
QA on 2026-09-16:

| Role in the script | Product | id | Price | Min | Max | Stock |
|---|---|---|---|---|---|---|
| the staple | Coca Cola Regular Retail Pack Cans 24x330ml | `ffd1bc36-4756-4e6a-88ee-0d7ae70d539c` | $14 | **7** | 39 | in |
| the alternative | Coca Cola Regular 6x330ml | `8b7282ad-d318-42f4-9c19-e2d9b388e06f` | $25 | — | 23 | in |
| the one that is out | Coca Cola Cherry Can 8x330ml | `7131dea0-8b81-4bbd-bb38-549a5d467bf4` | $45 | — | 32 | **out** |
| the low ceiling | PEPSI COLA REGULAR CRATE 28X0.20L | `8d77666d-70d7-4b3c-a071-a2d0f376d63f` | $25 | — | **7** | in |
| the one we do not sell | Red Bull | — | — | — | — | — |
| the preference | six Fanta lines (Mango, Peach, Pineapple, Orange 330ml/500ml/2L) | — | $21–89 | varies | varies | in |

The store carries 4,550 products, of which **28 have an order minimum** — nearly all of
them drinks and snacks. That is why the scenario is drinks and not fasteners.

## Before you start

```bash
# 1. the agent service — two workers, so the shared session store is exercised as deployed
cd commerce-agent && .venv/bin/uvicorn virto_agent.service:app --port 8087 --workers 2

# 2. the theme (APP_AGENT_URL=http://localhost:8087 in .env.local)
yarn dev
```

Then, signed in as the QA test account:

- empty the cart at `https://localhost:3000/cart`, so the counter movement in turn 3 is
  unambiguous;
- open `https://localhost:3000/account/assistant`;
- keep **the cart counter in the header visible** — it is part of the demo;
- `curl -s localhost:8087/api/health` should name the model and the loaded skills.

Turns are written in English because the catalogue is.

---

## Act 1 — it finds the right thing

### 1. "no"

**Watch:** text streams in word by word; product cards appear **while the agent is still
writing**; suggestion chips follow.

**Say:** the model chose which products to show and why. It did **not** supply the price,
the image or the title — it sent ids and a one-line reason, and the server joined the rest
from the catalogue. That is the reason it cannot quote a wrong price: it never quotes a
price at all. And these are this organisation's contract prices, not list prices.

---

## Act 2 — the failure that teaches it

### 2. "add 3 packs of the Coca Cola 24-can retail pack"

Its minimum is 7.

**Watch:** it does **not** report success. It says the store sells that item from 7 to 39,
and offers 7.

**Say — this is the centre of the demo:** x-api refuses this write by returning **HTTP 200
with an empty cart**, with the reason in a side channel that disappears from the next read.
Two weeks ago the agent read that as success and would have told the customer it had added
3 packs that do not exist. The refusal is now turned into a sentence the model can act on —
*"You can order from 7 to 39 items"* — so it recovers **inside the same turn**, with no
extra round trip and no dead end. Every error path gets that treatment. It is deliberate
design work, not something the framework hands you.

### 3. "yes, make it 7"

**Watch:** the **cart counter in the header moves during the answer**, not after it.

**Say:** the agent writes to the same cart the storefront uses, over the same API. The
storefront is told the cart changed and refreshes itself.

---

## Act 3 — the other edges

### 4. "add 20 crates of Pepsi as well"

The Pepsi crate has a maximum of 7.

**Watch:** the same mechanism at the other end of the range — it offers 7, not 20.

**Say:** one rule, both directions, and the number in the answer came from the platform,
not from the model.

### 5. "we'll take the Cherry Coke too"

That line is out of stock.

**Watch:** it says so and names what it can actually sell instead.

**Say:** out of stock is answered from stock data with the in-stock siblings named. No
"let me check for you", no promise to source it.

### 6. "actually, make it 500 packs of the regular retail pack"

**Watch:** it adds up to 24 in total and says the quantity was limited.

**Say:** that 24 is **our** cap, not the store's — a per-item ceiling enforced in code so
no conversation can run away with the cart. The store's own ceiling for this item is 39.
Two independent limits, both checked before anything is written.

---

## Act 4 — what it refuses to make up

### 7. "do you have Red Bull?"

**Watch:** it searches, finds none, and says so — offering the colas it really found.

**Say:** no invented SKU, no "we can order it in". If the catalogue does not have it, that
is the answer.

### 8. "what is your return window on drinks?"

**Watch:** it states no number and says it cannot look the store's policy up.

**Say, plainly — this one is honest about a gap:** a terms question forces a policy read
before the model is allowed to answer, and we have not wired a policy index yet, so the
tool answers "unavailable" and the agent refuses to fill the silence from its own
knowledge. Without that rule it would cheerfully have said "30 days" — and the site footer
says 14. A curated policy index is the next piece of work; this is what the design buys us
until then.

---

## Act 5 — it remembers (optional, needs a reload)

### 9. "our office drinks Fanta, by the way"

Then **reload the page** — a new session — and ask *"what have you got for the office
fridge?"*

**Watch:** Fanta is picked out, with a reason citing the preference.

**Say:** the fact is stored against the person, not the conversation, and only after a
separate pass that reads the customer's own words — never tool results. Anything that looks
like an identifier is refused. The buyer can list and delete their own facts.

---

## Technical appendix, for a security or architecture reviewer

```bash
# a session id on its own authorises nothing
curl -s -o /dev/null -w '%{http_code}\n' localhost:8087/api/memory \
  -H "X-Session-Id: <a real session id>"                            # 401

# the same id with the right bearer
curl -s -o /dev/null -w '%{http_code}\n' localhost:8087/api/memory \
  -H "X-Session-Id: <same id>" -H "Authorization: Bearer <token>"   # 200

# the behavioural suite, re-scored from recordings; no model calls, free
cd commerce-agent && .venv/bin/python -m evals replay
.venv/bin/python -m evals report    # tokens, latency and cost per case
```

- The bearer travels on **every** request and is stored nowhere; the model never sees it. A
  leaked session id is inert, and a refreshed token needs no handshake.
- Two workers share sessions through SQLite, so this is not a single-process toy.
- The eval report shows **145k cached input tokens against 2.1k fresh**. Without prompt
  caching the same run would cost 4.6× more. A ten-turn conversation is about $0.12.
- Six eval cases in three twin pairs: each "should serve" is paired with a "must refuse".

---

## Do not demo

These components exist as events but have no card in the theme yet, so they render as a
grey "component not rendered" notice:

| Component | Status |
|---|---|
| `order_status` | next to build |
| `checkout` | next to build |
| `comparison`, `plan`, `guide` | not started |

So **avoid** "compare these two", "plan my order for the month", "where is my order",
"check me out". If someone asks anyway, the honest answer is that the agent already
produces the data for all of them — the payload is visible in the notice — and what is
missing is our Vue rendering, with Anthropic's React reference to work from.

Also not built: the B2B ending (turn the cart into a quote or a purchase request), bulk add
from a list, and keeping the conversation across a page reload.

---

## Rehearse first

Turns 2, 4, 5 and 6 are proven **at the API level but not yet through a full conversation**
— the model has not been in the loop for them. Run the script once before showing anyone
(~$0.11) and note where the wording surprises you.

Two known roughnesses: a plural search that comes back empty is retried once with fuzzy
matching, which adds a second or two; and the agent may take three tool rounds before it
answers.
