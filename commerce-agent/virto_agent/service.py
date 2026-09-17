"""The service: one agent, one shared session store, and the routes the theme calls.

    uvicorn virto_agent.service:app --port 8080

Identity is presented on every request and stored nowhere. The storefront already holds a
valid access token for each call it makes, so it sends that token with every request here:
``POST /api/session`` verifies it against x-api's ``me`` and binds the principal it
resolves to a fresh session id, and every later request carries that session id **and** a
bearer, which must resolve to the same principal. Two consequences worth stating:

* A leaked session id authorizes nothing on its own.
* Nothing has to refresh a credential: the storefront's own refresh cycle is the only one,
  and the next request simply carries the newer token.

No route body and no tool argument names a customer or an organization. Sessions live in
SQLite, so several workers share them.
"""

# Route parameters are annotated with dependencies built at call time, so this module
# evaluates its annotations eagerly (no ``from __future__ import annotations``).

import os
import time
from pathlib import Path
from typing import Annotated, Any

from commerce_common.memory import JsonFileMemoryStore, MemoryStore
from dotenv import load_dotenv
from fastapi import Header, HTTPException
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel, Field
from shopping_agent import PageContext, ShoppingSessionState
from shopping_agent_runtime import ShoppingAgent

from . import xapi
from .backend import VirtoStorefrontBackend
from .config import build_shopping_config
from .context import VirtoSessionContext
from .executor import VirtoShoppingExecutor
from .host import append_user_turn, build_app, stream_turn
from .session_store import SqliteSessionStore
from .sessions import SessionRecord, session_dependency
from .settings import Settings

MODULE_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = MODULE_ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)

# Credentials before anything reads them: ANTHROPIC_API_KEY is read by the Anthropic client
# when the agent is constructed below, and the XAPI_* values by Settings. A variable
# already exported in the shell wins over the file.
load_dotenv(MODULE_ROOT / ".env", override=False)

# How long a verified token is trusted to still mean the same principal before ``me`` is
# asked again. Short, because it bounds how long a revoked token keeps working; long
# enough that a conversation does not pay a round trip per turn.
PRINCIPAL_CACHE_SECONDS = 60.0


class VirtoSessionState(ShoppingSessionState):
    """The reference state plus the caller's clock. The agent reads only
    ``seen_products``; the timezone rides along so every turn of the session is answered
    in the customer's local time rather than the server's."""

    timezone: str | None = None


settings = Settings.from_env()
client = xapi.XapiClient(settings.xapi_endpoint, timeout=settings.request_timeout_s)
backend = VirtoStorefrontBackend(client=client, settings=settings)
memory_store: MemoryStore = JsonFileMemoryStore(DATA_DIR / ".memory-store.json")
agent = ShoppingAgent(
    backend=backend,
    skills_dir=MODULE_ROOT / "skills",
    config=build_shopping_config(),
    memory_store=memory_store,
    executor_class=VirtoShoppingExecutor,
)
sessions = SqliteSessionStore(VirtoSessionState, DATA_DIR / "sessions.sqlite3")

app = build_app("Virto commerce agent", on_shutdown=[client.aclose])
CurrentSession = session_dependency(sessions, "/api/session")
Bearer = Annotated[str | None, Header(alias="Authorization")]

# token -> (principal, verified_at). Purely an optimization: losing it costs one `me` call.
_principals: dict[str, tuple[str, float]] = {}


class StartSessionRequest(BaseModel):
    # The caller's IANA zone, so "next Tuesday" means their Tuesday. No identity here:
    # the principal comes from the verified token, never from the body.
    timezone: str | None = Field(default=None, max_length=64)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    page: PageContext | None = None


class MemoryFactRef(BaseModel):
    key: str = Field(min_length=1, max_length=64)


def bearer_of(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Bearer token required")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Bearer token required")
    return token


async def principal_for(token: str) -> tuple[str, dict[str, Any]]:
    """The user id this token resolves to, asked of x-api and briefly cached.

    This is the line real authentication replaces if the token ever stops being the
    storefront's: whatever verifies the caller, it yields a principal it proved.
    """
    cached = _principals.get(token)
    if cached and time.monotonic() - cached[1] < PRINCIPAL_CACHE_SECONDS:
        return cached[0], {}

    try:
        data = await client.execute(xapi.GET_ME, {}, token=token)
    except xapi.XapiUnauthorized as rejected:
        _principals.pop(token, None)
        raise HTTPException(status_code=401, detail="The access token was rejected") from rejected

    me = data.get("me") or {}
    user_id = str(me.get("id") or "")
    if not user_id:
        # TODO: guests. A guest is a principal too — bind one, mark the session, and let
        # the account reads raise so the model asks the customer to sign in.
        raise HTTPException(status_code=401, detail="Sign in before starting a session")

    _principals[token] = (user_id, time.monotonic())
    return user_id, me


async def context_for(
    record: SessionRecord[VirtoSessionState],
    authorization: str | None,
    page: PageContext | None = None,
) -> VirtoSessionContext:
    """The request's own bearer, checked to still mean this session's principal, on the
    context the backend acts with. A token for a different customer cannot resume someone
    else's session, and the token never outlives the request."""
    token = bearer_of(authorization)
    principal, _ = await principal_for(token)
    if principal != record.user_id:
        raise HTTPException(status_code=403, detail="This session belongs to another account")

    return VirtoSessionContext(
        session_id=record.session_id,
        user_id=record.user_id,
        page=page or PageContext(),
        timezone=record.state.timezone,
        access_token=token,
    )


@app.post("/api/session")
async def start_session(
    request: StartSessionRequest | None = None, authorization: Bearer = None
) -> dict:
    token = bearer_of(authorization)
    user_id, me = await principal_for(token)

    record = sessions.start(user_id)
    record.state.timezone = (request or StartSessionRequest()).timezone
    sessions.save(record)

    contact = me.get("contact") or {}
    return {
        "session_id": record.session_id,
        "name": contact.get("fullName"),
        "organization": (contact.get("organization") or {}).get("name"),
    }


@app.post("/api/chat")
async def chat(
    request: ChatRequest, record: CurrentSession, authorization: Bearer = None
) -> StreamingResponse:
    session = await context_for(record, authorization, request.page)
    append_user_turn(record, request.message, "App events")
    return stream_turn(agent, sessions, record, session)


@app.get("/api/memory")
async def get_memory(record: CurrentSession, authorization: Bearer = None) -> dict:
    await context_for(record, authorization)
    facts = await memory_store.get_facts(record.user_id)
    return {"facts": [fact.model_dump(mode="json") for fact in facts]}


@app.delete("/api/memory")
async def delete_memory_fact(
    ref: MemoryFactRef, record: CurrentSession, authorization: Bearer = None
) -> dict:
    """A fact key travels in the body, so it never reaches a URL or an access log."""
    await context_for(record, authorization)
    if not await memory_store.delete_fact(record.user_id, ref.key):
        raise HTTPException(status_code=404, detail="No such fact")
    return {"ok": True, "deleted": ref.key}


@app.post("/api/session/end")
async def end_session(record: CurrentSession, authorization: Bearer = None) -> dict:
    await context_for(record, authorization)
    sessions.reset(record)
    return {"ok": True}


# A debug harness, off unless AGENT_DEV_UI=1: it takes an x-api token in a form field, which
# belongs on a developer's machine and nowhere else. The product UI is the theme's.
if os.environ.get("AGENT_DEV_UI") == "1":

    @app.get("/dev", response_class=HTMLResponse)
    async def dev_viewer() -> str:
        return (Path(__file__).resolve().parent / "devui.html").read_text(encoding="utf-8")


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {
        "ok": True,
        "model": agent.config.model,
        "skills": agent.skills.names,
        "xapi": settings.xapi_endpoint,
    }


__all__ = ["agent", "app", "backend", "sessions"]
