"""The shared session store: what a second worker sees, and what a lost race does."""

from __future__ import annotations

import pytest
from shopping_agent import Product, ShoppingSessionState

from virto_agent.session_store import SqliteSessionStore
from virto_agent.sessions import SessionConflictError


def store_over(path) -> SqliteSessionStore[ShoppingSessionState]:
    """A store as a separate worker would open it: same file, its own connection."""
    return SqliteSessionStore(ShoppingSessionState, path)


@pytest.fixture
def database(tmp_path):
    return tmp_path / "sessions.sqlite3"


def test_a_second_worker_reads_a_session_the_first_started(database) -> None:
    first = store_over(database)
    record = first.start("u-1")
    record.messages.append({"role": "user", "content": "hi"})
    first.save(record)

    second = store_over(database)
    loaded = second.require(record.session_id)

    assert loaded.user_id == "u-1"
    assert loaded.messages == [{"role": "user", "content": "hi"}]


def test_a_second_worker_sees_provenance_the_first_recorded(database) -> None:
    first = store_over(database)
    record = first.start("u-1")
    record.state.remember_products([Product(product_id="P-1", title="Bolt", price=1.0)])
    first.save(record)

    loaded = store_over(database).require(record.session_id)

    assert "P-1" in loaded.state.seen_products


def test_the_write_that_lost_the_race_is_refused(database) -> None:
    first = store_over(database)
    record = first.start("u-1")

    stale = store_over(database).require(record.session_id)
    record.state.remember_products([Product(product_id="P-1", title="Bolt", price=1.0)])
    first.save(record)

    stale.state.remember_products([Product(product_id="P-2", title="Nut", price=2.0)])
    with pytest.raises(SessionConflictError):
        store_over(database).save(stale)

    assert "P-1" in store_over(database).require(record.session_id).state.seen_products


def test_a_compacted_turn_rewrites_the_transcript(database) -> None:
    store = store_over(database)
    record = store.start("u-1")
    record.messages.extend([{"role": "user", "content": "one"}, {"role": "user", "content": "two"}])
    store.save(record)

    record.messages = [{"role": "user", "content": "compacted"}]
    record.stored_messages = 0
    store.save(record)

    assert store_over(database).require(record.session_id).messages == [
        {"role": "user", "content": "compacted"}
    ]


def test_ending_a_session_removes_its_transcript(database) -> None:
    store = store_over(database)
    record = store.start("u-1")
    record.messages.append({"role": "user", "content": "hi"})
    store.save(record)

    store.reset(record)

    assert store_over(database).read_state(record.session_id) is None
    assert store_over(database).read_messages(record.session_id) == []


def test_sessions_are_listed_per_principal(database) -> None:
    store = store_over(database)
    mine = store.start("u-1")
    store.start("u-2")

    assert store_over(database).session_ids_for_user("u-1") == [mine.session_id]
