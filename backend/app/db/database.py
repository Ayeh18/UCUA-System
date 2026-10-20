"""PostgreSQL connection pool.

The original code shared one global connection across every request, which is not thread-safe,
never recovered after a dropped connection, and let one failed transaction poison all others.
Each request now borrows its own connection from a pool and commits or rolls back on exit.
"""

import logging
import threading
from collections.abc import Iterator
from contextlib import contextmanager

import psycopg2
from psycopg2.extensions import connection as PgConnection
from psycopg2.pool import ThreadedConnectionPool

from app.core.config import get_settings

logger = logging.getLogger(__name__)

_pool: ThreadedConnectionPool | None = None
# psycopg2's pool raises immediately when exhausted; the semaphore makes callers wait instead.
_slots: threading.BoundedSemaphore | None = None


def init_pool() -> None:
    global _pool, _slots
    if _pool is not None:
        return
    settings = get_settings()
    # minconn=0 keeps startup from failing when the database is briefly unavailable.
    _pool = ThreadedConnectionPool(minconn=0, maxconn=settings.db_pool_max_size, dsn=settings.database_url)
    _slots = threading.BoundedSemaphore(settings.db_pool_max_size)
    logger.info("Database pool initialised (max %s connections)", settings.db_pool_max_size)


def close_pool() -> None:
    global _pool, _slots
    if _pool is not None:
        _pool.closeall()
    _pool = None
    _slots = None


@contextmanager
def connection() -> Iterator[PgConnection]:
    """Borrow a pooled connection; commit on success, roll back on any exception."""
    if _pool is None or _slots is None:
        raise RuntimeError("Database pool is not initialised; call init_pool() first")

    with _slots:
        conn = _pool.getconn()
        discard = False
        try:
            yield conn
            conn.commit()
        except psycopg2.OperationalError:
            discard = True  # connection is likely broken; don't hand it to the next request
            raise
        except BaseException:
            if not conn.closed:
                conn.rollback()
            raise
        finally:
            _pool.putconn(conn, close=discard or bool(conn.closed))


def get_db() -> Iterator[PgConnection]:
    """FastAPI dependency yielding a transactional connection for one request."""
    with connection() as conn:
        yield conn


def ping() -> bool:
    try:
        with connection() as conn, conn.cursor() as cur:
            cur.execute("SELECT 1")
            return True
    except Exception:
        logger.exception("Database health check failed")
        return False
