from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

from psycopg2.extensions import connection as PgConnection
from psycopg2.extras import RealDictCursor


class Repository:
    """Base class giving repositories a dict-returning cursor on the request's connection."""

    def __init__(self, conn: PgConnection) -> None:
        self.conn = conn

    @contextmanager
    def cursor(self) -> Iterator[RealDictCursor]:
        with self.conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur

    def fetch_one(self, sql: str, params: tuple[Any, ...] | dict[str, Any] = ()) -> dict[str, Any] | None:
        with self.cursor() as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
            return dict(row) if row else None

    def fetch_all(self, sql: str, params: tuple[Any, ...] | dict[str, Any] = ()) -> list[dict[str, Any]]:
        with self.cursor() as cur:
            cur.execute(sql, params)
            return [dict(row) for row in cur.fetchall()]

    def execute(self, sql: str, params: tuple[Any, ...] | dict[str, Any] = ()) -> int:
        with self.cursor() as cur:
            cur.execute(sql, params)
            return cur.rowcount
