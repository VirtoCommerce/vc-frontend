"""Process-level plumbing, copied from ``examples/demo_common/host.py`` in the reference
(Apache-2.0) and trimmed to what a single-role service needs: the app, background tasks,
the user-turn append, and the SSE response one chat turn streams.

What changed from the copy: the demo's credential loading and its ``DemoStorefront``
protocol are gone, and ``build_app`` takes the allowed hosts and origins from the
environment rather than assuming loopback, because this service is called by the theme.
"""

from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import AsyncIterator, Awaitable, Callable, Coroutine, Sequence
from contextlib import asynccontextmanager
from typing import Any, Protocol

import anthropic
from commerce_common.streaming import AgentEvent, to_sse
from commerce_common.turn import session_tag
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.responses import StreamingResponse

from .sessions import SessionConflictError, SessionRecord, SessionStore

logger = logging.getLogger(__name__)

# The event loop holds only weak references to tasks, so fire-and-forget work (memory
# extraction after a turn) is kept alive here until it completes.
_background_tasks: set[asyncio.Task[Any]] = set()


def spawn_background(coro: Coroutine[Any, Any, object]) -> None:
    task = asyncio.get_running_loop().create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


def _lifespan(
    on_startup: Sequence[Callable[[], Awaitable[None]]],
    on_shutdown: Sequence[Callable[[], Awaitable[None]]],
):
    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        for step in on_startup:
            await step()
        yield
        for step in on_shutdown:
            await step()

    return lifespan


def build_app(
    title: str,
    on_startup: Sequence[Callable[[], Awaitable[None]]] = (),
    on_shutdown: Sequence[Callable[[], Awaitable[None]]] = (),
) -> FastAPI:
    """The app, answering only to the host names in ``AGENT_ALLOWED_HOSTS`` (loopback by
    default) and the origins in ``AGENT_ALLOWED_ORIGINS``. Rejecting other Host headers
    stops DNS rebinding, which CORS does not."""
    logging.basicConfig(
        level=os.environ.get("AGENT_LOG_LEVEL", "INFO").upper(),
        format="%(levelname)s %(name)s: %(message)s",
    )
    logging.getLogger("httpx").setLevel(logging.WARNING)
    extra_hosts = [
        host.strip().rsplit(":", 1)[0] if ":" in host.strip() else host.strip()
        for host in os.environ.get("AGENT_ALLOWED_HOSTS", "").split(",")
    ]
    app = FastAPI(
        title=title, version="0.1.0", lifespan=_lifespan(on_startup, on_shutdown)
    )
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", *(host for host in extra_hosts if host)],
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=os.environ.get(
            "AGENT_ALLOWED_ORIGINS", r"https?://(localhost|127\.0\.0\.1)(:\d+)?"
        ),
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return app


class TurnAgent(Protocol):
    def stream_turn(
        self, messages: list[dict[str, Any]], session: Any, state: Any
    ) -> AsyncIterator[AgentEvent]: ...

    async def update_memory(self, messages: list[dict[str, Any]], session: Any) -> Any: ...


def append_user_turn(record: SessionRecord[Any], message: str, events_label: str) -> None:
    """Add the user's message to the transcript, preceded by a note listing what happened
    outside the conversation since the last reply, when anything did."""
    if not record.pending_app_events:
        record.messages.append({"role": "user", "content": message})
        return
    note = f"[{events_label} since your last reply: " + " ".join(record.pending_app_events) + "]"
    record.pending_app_events.clear()
    record.messages.append(
        {
            "role": "user",
            "content": [{"type": "text", "text": note}, {"type": "text", "text": message}],
        }
    )


def stream_turn(
    agent: TurnAgent,
    sessions: SessionStore[Any],
    record: SessionRecord[Any],
    session: Any,
) -> StreamingResponse:
    """Stream one turn as SSE; the record is written back once the stream has ended (the
    request dependency wrote back before it began). Memory extraction runs after the
    response has streamed."""

    async def event_stream() -> AsyncIterator[str]:
        try:
            async for event in agent.stream_turn(record.messages, session, record.state):
                if event.type == "turn_complete" and event.data.get("results_cleared"):
                    record.stored_messages = 0  # earlier messages changed: rewrite the transcript
                yield to_sse(event)
        except anthropic.AuthenticationError:
            logger.exception("chat turn failed: API authentication")
            yield to_sse(
                AgentEvent.error(
                    "The assistant is not configured with valid Anthropic API credentials."
                )
            )
        except Exception:  # the client gets a safe event, the log gets the rest
            logger.exception("chat turn failed")
            yield to_sse(AgentEvent.error("Something went wrong on our side. Please try again."))
        else:
            spawn_background(agent.update_memory(record.messages, session))

    def write_back() -> None:
        try:
            sessions.save(record)
        except SessionConflictError:
            # Another request wrote the session while the turn streamed. The turn is the
            # larger write, so it goes in over that version.
            record.version = (sessions.read_state(record.session_id) or (0, {}))[0]
            logger.warning(
                "session %s: a write raced the turn; the turn wins", session_tag(record.session_id)
            )
            sessions.save(record)

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        background=BackgroundTask(write_back),
    )
