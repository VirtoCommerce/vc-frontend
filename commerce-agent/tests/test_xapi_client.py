"""The transport: what a dropped connection costs a read, and what it must not cost a write."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from virto_agent import xapi


def transport_of(*outcomes: Any) -> tuple[httpx.MockTransport, list[str]]:
    """Each outcome is raised if it is an exception, otherwise returned as the body."""
    seen: list[str] = []
    remaining = list(outcomes)

    def handle(request: httpx.Request) -> httpx.Response:
        seen.append(request.content.decode())
        outcome = remaining.pop(0)
        if isinstance(outcome, Exception):
            raise outcome
        return httpx.Response(200, json=outcome)

    return httpx.MockTransport(handle), seen


def client_over(transport: httpx.MockTransport) -> xapi.XapiClient:
    client = xapi.XapiClient("https://example.invalid/graphql")
    client._client = httpx.AsyncClient(transport=transport)
    return client


async def test_a_dropped_read_is_retried_once() -> None:
    transport, seen = transport_of(
        httpx.RemoteProtocolError("Server disconnected without sending a response."),
        {"data": {"products": {"items": []}}},
    )

    result = await client_over(transport).execute(xapi.SEARCH_PRODUCTS, {})

    assert result == {"products": {"items": []}}
    assert len(seen) == 2


async def test_a_dropped_write_is_not_retried() -> None:
    """`addItem` takes no idempotency key, so a retry would be a second line in the cart."""
    transport, seen = transport_of(
        httpx.RemoteProtocolError("Server disconnected without sending a response."),
        {"data": {"addItem": {"id": "c-1"}}},
    )

    with pytest.raises(httpx.RemoteProtocolError):
        await client_over(transport).execute(xapi.ADD_ITEM, {"command": {}})

    assert len(seen) == 1


async def test_a_graphql_error_is_not_a_transport_failure() -> None:
    transport, seen = transport_of({"errors": [{"message": "nope", "extensions": {"code": "X"}}]})

    with pytest.raises(xapi.XapiError):
        await client_over(transport).execute(xapi.SEARCH_PRODUCTS, {})

    assert len(seen) == 1


async def test_a_rejected_credential_is_its_own_failure() -> None:
    def handle(request: httpx.Request) -> httpx.Response:
        return httpx.Response(401)

    with pytest.raises(xapi.XapiUnauthorized):
        await client_over(httpx.MockTransport(handle)).execute(xapi.GET_ME, {})


def test_reads_and_writes_are_told_apart() -> None:
    assert xapi.is_read(xapi.SEARCH_PRODUCTS)
    assert xapi.is_read(xapi.GET_ME)
    assert not xapi.is_read(xapi.ADD_ITEM)
    assert not xapi.is_read(xapi.REMOVE_CART_ITEMS)
