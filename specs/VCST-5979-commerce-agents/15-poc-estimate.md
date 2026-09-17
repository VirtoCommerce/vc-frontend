# What a POC would cost

The deliverable VCST-5979 asked for. Written 2026-09-17 against working code rather than a
design, and **measured in supervised AI-development hours, not developer-days**, because
that is how the work was actually done and will be done.

**Everything below assumes the Python service is kept.** A .NET port is a different
exercise, costed at the end — that decision comes first
([10-open-questions.md](10-open-questions.md)).

## The calibration

This spike is its own estimating unit, which is the only reason the numbers below are worth
anything.

| | |
|---|---|
| Built in | **5.2 active hours** in one Claude Code session (Opus 5), 16–17 Sep |
| Steering | 50 messages from one developer; calendar span 27.7 h with the breaks |
| Produced | 9,543 lines — ~5,500 of code and tests, ~2,200 of notes, plus the PR and the Jira brief |
| Rate | ~1,000 lines of working, tested code per active hour |
| Model spend | ~$0.23 of Anthropic API for the agent's own live runs (evals and hand tests), separate from the cost of the Claude Code session itself |

**An hour here is a supervised hour.** The developer is at the keyboard the whole time —
steering, rejecting, testing in the browser. It is not unattended work, and it does not
parallelise by opening more sessions.

## Already paid for

| | Lines | State |
|---|---|---|
| Agent service (`commerce-agent/virto_agent/`) | ~2,650 | All 13 backend methods live over x-api; sessions in SQLite across workers; per-request bearer; error relay |
| Tests + evals | ~1,800 | 63 tests, 6 eval cases in 3 twin pairs, free replay mode for CI |
| Theme module (`client-app/modules/commerce-agent/`) | ~1,060 | Assistant page, SSE parsing, 2 of 8 cards, progress lines |
| Spike notes | ~2,200 | This directory |

Prototype-grade, not product-grade: it works, it is tested, and **nobody but its author has
reviewed it**. That matters more than the hours below.

## To a demonstrable POC

One B2B buyer flow end to end, shown to customers, not opened to the public.

| Work | Hours | Note |
|---|---|---|
| The 5 remaining presentation cards | 5–8 | React reference and payload schema exist for each; our UI Kit covers most of it. `order_status` and `checkout` first |
| Rebuild `agent-products.vue` on `VcProductCard` | ~1 | Currently a hand-rolled grid |
| Curated policy index for `search_policies` | 3–4 | Mostly *deciding which pages*, which is not an AI-speed activity |
| Conversation history across a reload | 2–3 | The store already persists the transcript; this is wiring plus UI |
| B2B ending: cart → quote or purchase request | 3–5 | `createQuoteFromCart` / `submitQuoteRequest` exist but are unexercised; this is the close that makes it B2B rather than a retail toy |
| Eval suite to ~50 cases | 4–6 | Authoring is fast; the floor is real API calls against QA, which do not compress |
| **Subtotal** | **18–27 h** | **3–5 working sessions** |

A designer works in parallel on the cards; brief and references are already delivered.
That is not in the hours above and does not add to them.

## Before a customer can switch it on

Not in the POC, not optional if it faces real buyers.

| Work | Hours |
|---|---|
| Per-session and per-tenant token budgets, rate limiting, abuse handling | 2–3 |
| Retention and deletion: sessions, memory, deletion on account close | 2–3 |
| Log hygiene and an audit trail for cart writes | 1–2 |
| Accessibility pass on a streaming surface | 2–3 |
| Deployment, monitoring, a real session store if SQLite is not it | 3–5 |
| **Subtotal** | **10–16 h** |

The merchant agent is a second phase and is not costed: it is blocked on an analytics
surface that does not exist.

## What does not compress

The hours above are the part AI is good at. These are not, and they are the real schedule:

- **Review.** 9,543 lines nobody else has read. A careful reviewer spends hours regardless
  of how fast the code appeared, and the ratio gets worse, not better, as the agent gets
  faster. Budget review as the largest single line item on this project.
- **The four decisions** in [10-open-questions.md](10-open-questions.md) — Python vs .NET,
  whose track, product vs reference, whose key. Calendar weeks of other people's attention,
  and every hour above is void if the first one goes the other way.
- **Anything needing a backend change.** Everything in the POC table is frontend-and-service
  work except the quote/purchase-request ending, which touches unexercised x-api mutations.
- **Design.** A human designer's iterations, in their own time.

## Running cost

Measured, not modelled: **~$0.12 per ten-turn conversation** on Sonnet 5 with the cache
holding near 98.5%. A thousand conversations a month is roughly **$120 in tokens**. Tokens
are not what makes this expensive.

Two caveats found after the measurement
([14-what-the-blog-says.md](14-what-the-blog-says.md)): the prompt cache's default TTL is
five minutes, so a buyer who pauses to think pays a fresh cache write and $0.12 is a floor;
and Anthropic's own guidance is to pick model and effort by sweeping the eval suite, which
six cases cannot do.

## If the answer is .NET

Port `commerce-common` plus the shopping agent's core and its Messages-API runtime — prompt
assembly, tool registry, fencing, grounding, gates, executor, streaming — before any of the
above starts. Porting is mechanical and well-specified, which is where an agent is
strongest, and the reference carries its own tests to port alongside. Reckon **40–60 hours**
of the same supervised work, and accept that the result is a fork with no upstream and a
review burden several times the size of this spike's.

Patterns-only is the third road: keep nothing, reuse the design. The spike notes and
`commerce-agent/CLAUDE.md` already are that deliverable, at no further cost.

## Honest error bars

The hours come from one calibration point — this spike — measured on work its own author
estimated. Known optimism: the POC scope needs no backend change except the quote ending;
the Python decision goes the easy way; no regulated-vertical requirement appears. Each of
those failing adds sessions, not minutes. And the biggest risk is not in this table at all:
code that appears at 1,000 lines an hour still has to be understood by someone who did not
write it.
