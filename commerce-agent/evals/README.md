# Evals

Behavioural tests for what the **model** decides. `../tests/` covers the deterministic code
— mapping, gates, the session store, prompt stability — with no network; these drive real
turns against the QA storefront and grade what came back.

```bash
python -m evals run          # live turns, recorded and scored          ~$0.07
python -m evals run cart     # one case, or every case with that tag
python -m evals replay       # re-score the recordings; no API access, free
python -m evals report       # tokens, latency and cost per case
```

`run` needs `ANTHROPIC_API_KEY`, `EVAL_USERNAME` and `EVAL_PASSWORD` in `../.env`.

## Deliberately small

Six cases, three twin pairs, one trial each. This is a spike: the suite exists to show the
harness works and to price it, not to cover the agent. Every live run is metered and the
total is printed, so adding a case is a decision with a number attached — about 1.2¢ each at
today's shape.

| Pair | Serves | Refuses / limits |
|---|---|---|
| cart-claim | answers what is in the cart, having been given it | claims nothing about a cart it never read |
| quantity | adds the pack that was asked for | clamps 500 to the 24-per-item cap and says so |
| grounding | reports honestly that titanium bolts are not in the catalog | states no return window while `search_policies` is a stub |

Every case that should succeed is paired with a neighbour that must not, which is the point:
a suite of happy paths measures nothing about the thing that worries a merchant. The
cart-claim pair also stops the obvious over-correction — an agent that simply never mentions
the cart passes the first case and fails its twin.

## What a case looks like

`cases.json`, a subset of the shape in the `commerce-evals` skill. `state` is the
precondition (`cart`, `seen_products`, `memory`), `turns` is the customer's message, and
`expected` holds only the keys the case is about. Ids are real QA catalog ids.

Two graders per case, over different artefacts:

- **code graders** read what the turn *did* — `calls_tool`, `never_calls`, `first_tool`,
  `ui_components`, `reply_includes` / `reply_omits`, `cart_contains` / `cart_not_contains`,
  `cart_item_count`, `cart_quantities`, `cart_max_quantity`, `max_tool_calls`, `gate_held`.
- **`rubric`** goes to a judge (`claude-haiku-4-5-20251001`, temperature 0) that reads what
  the reply *claimed*. The verdict is stored with the recording and re-asked only when the
  judge model or the rubric text changes, so `replay` costs nothing.

## Live state

A run **rewrites the QA test account's cart**: each case empties it and rebuilds its
precondition. Nothing else is written — no order is placed, and memory is an in-process
store seeded per case, never the service's `data/.memory-store.json`. Cases run one at a
time because they share that one cart.

## Grading the case, not the route

When a live run takes a route the case did not expect and the answer was right, the case is
widened. Two of the six were wrong on their first run and both were the case's fault:

- `cart-claim-002` asserted a `get_cart` call. The cart is **prefetched** into the turn's
  context, so a correct answer needs no tool call at all.
- `cart-claim-001`'s rubric failed a card reason that only cited the remembered preference,
  then a suggestion chip offering to add to the cart. Neither is a claim about what the cart
  holds; the rubric now says so.

Recording that distinction is the discipline — a case that fails after a change means either
the change broke the behaviour or the case encoded a stale one, and the commit says which.

## CI

`replay` is the mode built for CI — **not yet wired into one**; no workflow references this
directory. It re-scores the stored recordings against `baseline.json`, a map of
`case-id → [known failing scorers]`. A new failure fails the build; a baselined one does
not. A case with no recording is *pending*, never passing. Re-record and refresh the baseline
in the same change as any prompt, skill or runtime change.

## Not covered yet

Memory writes (a remark kept, an identifier refused, a stored fact changing the next pick),
prompt injection inside a product description, order status, and the checkout handoff. Each
needs either a flow that is not built or an eval-only fixture; they are the next ten cases,
not these six.
