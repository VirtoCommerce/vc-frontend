"""One turn end to end, against a scripted model and a stub backend.

The first test is the agent alone. The second is the same turn through the chat route,
which is what proves the session store: the transcript the store hands back on the next
load holds the turn.
"""

from __future__ import annotations

from pathlib import Path

from commerce_common.testing import FakeClient, text_message
from fastapi.testclient import TestClient
from shopping_agent import ShoppingSessionContext
from shopping_agent_runtime import ShoppingAgent
from stubs import StubBackend

from virto_agent import service
from virto_agent.config import build_shopping_config

SKILLS_DIR = Path(__file__).resolve().parent.parent / "skills"


def build_agent(*replies: str) -> ShoppingAgent:
    return ShoppingAgent(
        backend=StubBackend(),
        skills_dir=SKILLS_DIR,
        config=build_shopping_config(),
        client=FakeClient([text_message(reply) for reply in replies]),
    )


async def test_one_turn_streams_text() -> None:
    agent = build_agent("hello")
    session = ShoppingSessionContext(session_id="s-1", user_id="u-1")
    messages: list[dict] = [{"role": "user", "content": "hi"}]

    events = [event async for event in agent.stream_turn(messages, session)]

    assert [event.data["text"] for event in events if event.type == "text_delta"] == ["hello"]
    assert any(event.type == "turn_complete" for event in events)


def test_indexed_skills_are_the_three_the_record_names() -> None:
    assert build_agent().skills.names == [
        "memory-personalization",
        "planning-goals",
        "search-discovery",
    ]


def signed_in(monkeypatch, principals: dict[str, str]) -> None:
    """x-api answers `me` from a token-to-user map, so a test can hold two accounts."""
    monkeypatch.setattr(service.agent, "backend", StubBackend())

    async def fake_me(document, variables, *, token=None):
        user_id = principals.get(token)
        if user_id is None:
            raise service.xapi.XapiUnauthorized("rejected")
        return {"me": {"id": user_id, "contact": {"fullName": "Test Buyer"}}}

    monkeypatch.setattr(service.client, "execute", fake_me)
    service._principals.clear()


def start(http, token: str):
    return http.post(
        "/api/session",
        json={"timezone": "Europe/Vilnius"},
        headers={"Authorization": f"Bearer {token}"},
    )


def test_chat_route_writes_the_turn_into_the_session_store(monkeypatch) -> None:
    signed_in(monkeypatch, {"token-a": "u-1"})
    monkeypatch.setattr(service.agent, "client", FakeClient([text_message("hello")]))

    with TestClient(service.app, base_url="http://localhost") as http:
        started = start(http, "token-a")
        assert started.status_code == 200
        session_id = started.json()["session_id"]

        replied = http.post(
            "/api/chat",
            json={"message": "hi"},
            headers={"X-Session-Id": session_id, "Authorization": "Bearer token-a"},
        )
        assert replied.status_code == 200
        assert "event: text_delta" in replied.text

    record = service.sessions.require(session_id)
    assert [message["role"] for message in record.messages] == ["user", "assistant"]
    assert record.state.timezone == "Europe/Vilnius"


def test_a_session_id_alone_does_not_authorize_a_turn(monkeypatch) -> None:
    signed_in(monkeypatch, {"token-a": "u-1"})

    with TestClient(service.app, base_url="http://localhost") as http:
        session_id = start(http, "token-a").json()["session_id"]

        replied = http.post("/api/chat", json={"message": "hi"}, headers={"X-Session-Id": session_id})

    assert replied.status_code == 401


def test_another_account_cannot_resume_the_session(monkeypatch) -> None:
    signed_in(monkeypatch, {"token-a": "u-1", "token-b": "u-2"})

    with TestClient(service.app, base_url="http://localhost") as http:
        session_id = start(http, "token-a").json()["session_id"]

        replied = http.post(
            "/api/chat",
            json={"message": "hi"},
            headers={"X-Session-Id": session_id, "Authorization": "Bearer token-b"},
        )

    assert replied.status_code == 403


def test_a_refreshed_token_keeps_the_same_session(monkeypatch) -> None:
    """The storefront refreshes on its own schedule; the next request simply carries the
    newer token, and nothing here has to know a refresh happened."""
    signed_in(monkeypatch, {"token-old": "u-1", "token-new": "u-1"})
    monkeypatch.setattr(service.agent, "client", FakeClient([text_message("still here")]))

    with TestClient(service.app, base_url="http://localhost") as http:
        session_id = start(http, "token-old").json()["session_id"]

        replied = http.post(
            "/api/chat",
            json={"message": "hi"},
            headers={"X-Session-Id": session_id, "Authorization": "Bearer token-new"},
        )

    assert replied.status_code == 200
    assert "still here" in replied.text
