"""A session store several workers can share.

The reference store keeps sessions in one process's memory, which silently splits sessions
between workers. This puts the same six storage methods over SQLite in WAL mode, so every
worker on the host reads and writes one file, and ``write_state`` stays the compare-and-set
the contract asks for: a request that lost a race writes nothing and is told to retry.

SQLite is the honest floor, not the ceiling. It is dependency-free and correct for several
workers on one machine; several machines want Postgres or Redis behind these same six
methods. Nothing above this class changes when that happens.

No credential is stored here. The caller's bearer travels with each request and reaches the
backend on the session context; what persists is the principal, the provenance state, and
the transcript.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from pathlib import Path
from typing import Any, TypeVar

from pydantic import BaseModel

from .sessions import SessionConflictError, SessionStore

StateT = TypeVar("StateT", bound=BaseModel)

_SCHEMA = """
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL,
    version    INTEGER NOT NULL,
    document   TEXT NOT NULL,
    updated_at REAL NOT NULL DEFAULT (julianday('now'))
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS messages (
    session_id TEXT NOT NULL,
    position   INTEGER NOT NULL,
    body       TEXT NOT NULL,
    PRIMARY KEY (session_id, position)
);
"""


class SqliteSessionStore(SessionStore[StateT]):
    def __init__(self, state_type: type[StateT], path: Path) -> None:
        super().__init__(state_type)
        path.parent.mkdir(parents=True, exist_ok=True)
        self._path = path
        # One connection per thread: FastAPI runs sync route code in a worker pool, and a
        # SQLite connection may not cross threads.
        self._local = threading.local()
        with self._connect() as connection:
            connection.executescript(_SCHEMA)

    def _connect(self) -> sqlite3.Connection:
        connection: sqlite3.Connection | None = getattr(self._local, "connection", None)
        if connection is None:
            connection = sqlite3.connect(self._path, isolation_level=None, timeout=10)
            connection.execute("PRAGMA journal_mode=WAL")
            connection.execute("PRAGMA synchronous=NORMAL")
            connection.execute("PRAGMA busy_timeout=10000")
            self._local.connection = connection
        return connection

    def close(self) -> None:
        connection: sqlite3.Connection | None = getattr(self._local, "connection", None)
        if connection is not None:
            connection.close()
            self._local.connection = None

    # -- Storage ---------------------------------------------------------------------

    def read_state(self, session_id: str) -> tuple[int, dict[str, Any]] | None:
        row = self._connect().execute(
            "SELECT version, document FROM sessions WHERE session_id = ?", (session_id,)
        ).fetchone()
        return (int(row[0]), json.loads(row[1])) if row else None

    def write_state(self, session_id: str, document: dict[str, Any], version: int) -> None:
        """Insert at version 0, otherwise update only while the stored version is still
        ``version``. Both statements are one write, so two workers racing on a session
        cannot both succeed."""
        body = json.dumps(document, ensure_ascii=False)
        connection = self._connect()
        if version == 0:
            try:
                connection.execute(
                    "INSERT INTO sessions (session_id, user_id, version, document) "
                    "VALUES (?, ?, 1, ?)",
                    (session_id, str(document.get("user_id") or ""), body),
                )
            except sqlite3.IntegrityError as exists:
                raise SessionConflictError(session_id) from exists
            return

        updated = connection.execute(
            "UPDATE sessions SET version = version + 1, document = ?, "
            "updated_at = julianday('now') WHERE session_id = ? AND version = ?",
            (body, session_id, version),
        )
        if updated.rowcount != 1:
            raise SessionConflictError(session_id)

    def read_messages(self, session_id: str) -> list[dict[str, Any]]:
        rows = self._connect().execute(
            "SELECT body FROM messages WHERE session_id = ? ORDER BY position", (session_id,)
        ).fetchall()
        return [json.loads(row[0]) for row in rows]

    def write_messages(
        self, session_id: str, messages: list[dict[str, Any]], start: int
    ) -> None:
        """Replace the transcript from ``start`` on: an append in the usual case, a rewrite
        of the tail after a turn compacted it."""
        connection = self._connect()
        connection.execute("BEGIN IMMEDIATE")
        try:
            connection.execute(
                "DELETE FROM messages WHERE session_id = ? AND position >= ?", (session_id, start)
            )
            connection.executemany(
                "INSERT INTO messages (session_id, position, body) VALUES (?, ?, ?)",
                [
                    (session_id, start + offset, json.dumps(message, ensure_ascii=False))
                    for offset, message in enumerate(messages)
                ],
            )
        except Exception:
            connection.execute("ROLLBACK")
            raise
        connection.execute("COMMIT")

    def delete(self, session_id: str) -> None:
        connection = self._connect()
        connection.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
        connection.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))

    def session_ids_for_user(self, user_id: str) -> list[str]:
        rows = self._connect().execute(
            "SELECT session_id FROM sessions WHERE user_id = ?", (user_id,)
        ).fetchall()
        return [str(row[0]) for row in rows]

    # -- Housekeeping ------------------------------------------------------------------

    def drop_older_than(self, days: float) -> int:
        """Delete sessions untouched for ``days``; returns how many went. Expiry is the
        store's, as the contract says, and this is the whole of it."""
        connection = self._connect()
        connection.execute(
            "DELETE FROM messages WHERE session_id IN "
            "(SELECT session_id FROM sessions WHERE updated_at < julianday('now') - ?)",
            (days,),
        )
        dropped = connection.execute(
            "DELETE FROM sessions WHERE updated_at < julianday('now') - ?", (days,)
        )
        return dropped.rowcount
