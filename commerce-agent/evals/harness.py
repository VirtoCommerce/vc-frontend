"""The live executor: one agent for the run, a fresh session and memory per case, driven against QA.

    python -m evals run          # live turns, records each outcome
    python -m evals replay       # re-score the recordings, no API access
    python -m evals report       # the last run's table, with what it cost

A case runs against the **real QA storefront**, so the test account's cart is emptied and
rebuilt to the case's precondition before every turn. Nothing else is written: no order is
placed, and memory is an in-process store seeded per case, never the service's file.

Cost is the reason this suite is small. Every live turn is metered and the run prints what
it spent, so growing the suite is a decision with a number attached.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import httpx
from commerce_common.memory import InMemoryMemoryStore
from commerce_common.types import MemoryFact
from dotenv import load_dotenv
from shopping_agent import PageContext
from shopping_agent_runtime import ShoppingAgent

from virto_agent import xapi
from virto_agent.backend import VirtoStorefrontBackend
from virto_agent.config import build_shopping_config
from virto_agent.context import VirtoSessionContext
from virto_agent.executor import VirtoShoppingExecutor
from virto_agent.service import VirtoSessionState
from virto_agent.settings import Settings

EVALS_ROOT = Path(__file__).resolve().parent
MODULE_ROOT = EVALS_ROOT.parent
RECORDINGS = EVALS_ROOT / "recordings"
CASES_FILE = EVALS_ROOT / "cases.json"

load_dotenv(MODULE_ROOT / ".env", override=False)

# Per MTok, from specs/VCST-5979-commerce-agents/05-runtimes-and-deployment.md. A cached
# read is a tenth of fresh input and a cache write a quarter more, which is the whole
# argument for the stable prefix; the run report prices both so the effect is visible.
RATES = {
    "claude-sonnet-5": {"input": 2.0, "output": 10.0, "cache_read": 0.20, "cache_write": 2.50},
    "claude-haiku-4-5-20251001": {
        "input": 1.0,
        "output": 5.0,
        "cache_read": 0.10,
        "cache_write": 1.25,
    },
}


class MissingCredential(RuntimeError):
    pass


@dataclass(frozen=True)
class Case:
    id: str
    turns: list[str]
    expected: dict[str, Any]
    priority: str = "medium"
    difficulty: str = "medium"
    tags: list[str] = field(default_factory=list)
    state: dict[str, Any] = field(default_factory=dict)
    notes: str = ""
    skip: str | None = None

    @property
    def twin_of(self) -> str | None:
        return self.expected.get("_twin")


def load_cases(only: list[str] | None = None) -> list[Case]:
    raw = json.loads(CASES_FILE.read_text(encoding="utf-8"))
    cases = [Case(**entry) for entry in raw]
    if only:
        wanted = set(only)
        cases = [case for case in cases if case.id in wanted or set(case.tags) & wanted]
    return cases


async def storefront_token(settings: Settings, http: httpx.AsyncClient) -> str:
    """A bearer for the QA test account, the way the theme gets one.

    The account is a QA fixture and its password lives in this module's gitignored
    ``.env``; nothing here is a production credential.
    """
    username = os.environ.get("EVAL_USERNAME")
    password = os.environ.get("EVAL_PASSWORD")
    if not username or not password:
        raise MissingCredential(
            "EVAL_USERNAME and EVAL_PASSWORD must be set in commerce-agent/.env "
            "(the QA storefront account the evals shop as)"
        )

    base = settings.xapi_endpoint.removesuffix("/graphql")
    response = await http.post(
        f"{base}/connect/token",
        data={
            "grant_type": "password",
            "scope": "offline_access",
            "storeId": settings.store_id,
            "username": username,
            "password": password,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    if response.status_code != 200:
        raise MissingCredential(f"/connect/token refused the eval account ({response.status_code})")
    return str(response.json()["access_token"])


@dataclass
class Harness:
    """Everything a case needs, built once for the run."""

    agent: ShoppingAgent
    backend: VirtoStorefrontBackend
    client: xapi.XapiClient
    settings: Settings
    token: str
    user_id: str
    memory: InMemoryMemoryStore

    @classmethod
    async def build(cls) -> Harness:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            raise MissingCredential("ANTHROPIC_API_KEY must be set in commerce-agent/.env")

        settings = Settings.from_env()
        client = xapi.XapiClient(settings.xapi_endpoint, timeout=settings.request_timeout_s)
        async with httpx.AsyncClient(timeout=30) as http:
            token = await storefront_token(settings, http)

        me = (await client.execute(xapi.GET_ME, {}, token=token)).get("me") or {}
        user_id = str(me.get("id") or "")
        if not user_id:
            raise MissingCredential("The eval account's token resolves to no user")

        # One agent for the run, as the service builds one per process: the cached prefix
        # is the same bytes across cases, which is what makes a suite affordable. The
        # memory store is cleared and re-seeded per case instead of being rebuilt.
        backend = VirtoStorefrontBackend(client=client, settings=settings)
        memory = InMemoryMemoryStore()
        return cls(
            agent=ShoppingAgent(
                backend=backend,
                skills_dir=MODULE_ROOT / "skills",
                config=build_shopping_config(),
                memory_store=memory,
                executor_class=VirtoShoppingExecutor,
            ),
            backend=backend,
            client=client,
            settings=settings,
            token=token,
            user_id=user_id,
            memory=memory,
        )

    def context_for(self, case: Case) -> VirtoSessionContext:
        return VirtoSessionContext(
            session_id=f"eval-{case.id}"[:64],
            user_id=self.user_id,
            page=PageContext(),
            timezone="Europe/Belgrade",
            access_token=self.token,
        )

    async def aclose(self) -> None:
        await self.client.aclose()


async def apply_cart_state(
    harness: Harness, session: VirtoSessionContext, wanted: list[dict[str, Any]] | None
) -> None:
    """Make the live cart match the case's precondition. ``None`` leaves it untouched."""
    if wanted is None:
        return

    current = await harness.backend.get_cart(session)
    for item in current.items:
        await harness.backend.remove_from_cart(session, item.product_id)
    for line in wanted:
        await harness.backend.add_to_cart(session, line["product_id"], int(line.get("quantity", 1)))


async def apply_seen_products(
    harness: Harness,
    session: VirtoSessionContext,
    state: VirtoSessionState,
    product_ids: list[str],
) -> None:
    """Provenance the turn is allowed to assume, fetched as the session would have."""
    for product_id in product_ids:
        details = await harness.backend.get_product_details(session, product_id)
        if details is None:
            raise RuntimeError(f"seen_products id not in the catalog: {product_id}")
        state.remember_products([details])


async def seed_memory(
    store: InMemoryMemoryStore, user_id: str, facts: list[dict[str, Any]]
) -> None:
    """The case's precondition, and only it: the store is purged first so a fact seeded
    for one case cannot decide the next one."""
    await store.clear(user_id)
    if facts:
        await store.upsert_facts(
            user_id,
            [
                MemoryFact(
                    key=fact["key"],
                    value=fact["value"],
                    category=fact.get("category", "preference"),
                    source_session_id="eval-seed",
                )
                for fact in facts
            ],
        )


async def run_case(harness: Harness, case: Case) -> dict[str, Any]:
    """One case, live. Returns the outcome a scorer reads; nothing here grades."""
    session = harness.context_for(case)
    state = VirtoSessionState(timezone=session.timezone)

    await seed_memory(harness.memory, harness.user_id, case.state.get("memory", []))
    await apply_cart_state(harness, session, case.state.get("cart"))
    await apply_seen_products(harness, session, state, case.state.get("seen_products", []))

    messages: list[dict[str, Any]] = []
    turns: list[dict[str, Any]] = []
    started = time.monotonic()

    for turn_text in case.turns:
        messages.append({"role": "user", "content": turn_text})
        record: dict[str, Any] = {
            "message": turn_text,
            "reply": "",
            "tool_calls": [],
            "tool_results": [],
            "ui": [],
            "usage": {},
        }
        async for event in harness.agent.stream_turn(messages, session, state):
            if event.type == "text_delta":
                record["reply"] += event.data.get("text", "")
            elif event.type == "tool_call":
                record["tool_calls"].append(
                    {"tool": event.data.get("tool"), "input": event.data.get("input")}
                )
            elif event.type == "tool_result":
                record["tool_results"].append(
                    {
                        "tool": event.data.get("tool"),
                        "status": event.data.get("status"),
                        "reason": event.data.get("reason"),
                        "summary": (event.data.get("summary") or "")[:400],
                    }
                )
            elif event.type == "ui":
                record["ui"].append(
                    {"component": event.data.get("component"), "payload": event.data.get("payload")}
                )
            elif event.type == "cart_update":
                record["cart"] = event.data.get("cart")
            elif event.type == "turn_complete":
                record["usage"] = event.data.get("usage") or {}
                record["stop_reason"] = event.data.get("stop_reason")
            elif event.type == "error":
                record["error"] = event.data.get("message")
        turns.append(record)

    cart_after = await harness.backend.get_cart(session)

    return {
        "case_id": case.id,
        "model": harness.agent.config.model,
        "recorded_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "elapsed_ms": int((time.monotonic() - started) * 1000),
        "turns": turns,
        "cart_after": {
            "items": [
                {"product_id": item.product_id, "quantity": item.quantity, "title": item.title}
                for item in cart_after.items
            ],
            "item_count": cart_after.item_count,
            "subtotal": cart_after.subtotal,
        },
        "memory_after": [
            fact.model_dump(mode="json")
            for fact in await harness.memory.get_facts(harness.user_id)
        ],
    }


def usage_cost(outcome: dict[str, Any]) -> float:
    """What this recording's turns cost at the spike's published rates."""
    rate = RATES.get(outcome.get("model", ""), RATES["claude-sonnet-5"])
    total = 0.0
    for turn in outcome.get("turns", []):
        usage = turn.get("usage") or {}
        total += (usage.get("input_tokens", 0) * rate["input"]) / 1_000_000
        total += (usage.get("output_tokens", 0) * rate["output"]) / 1_000_000
        total += (usage.get("cache_read_input_tokens", 0) * rate["cache_read"]) / 1_000_000
        total += (usage.get("cache_creation_input_tokens", 0) * rate["cache_write"]) / 1_000_000
    return total


def judge_cost(usage: dict[str, int] | None) -> float:
    """What one verdict cost. Uncached: the judge sees a different transcript every time."""
    rate = RATES["claude-haiku-4-5-20251001"]
    usage = usage or {}
    return (
        usage.get("input_tokens", 0) * rate["input"]
        + usage.get("output_tokens", 0) * rate["output"]
    ) / 1_000_000


def save_outcome(outcome: dict[str, Any]) -> Path:
    RECORDINGS.mkdir(exist_ok=True)
    path = RECORDINGS / f"{outcome['case_id']}.json"
    path.write_text(json.dumps(outcome, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return path


def load_outcome(case_id: str) -> dict[str, Any] | None:
    path = RECORDINGS / f"{case_id}.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))
