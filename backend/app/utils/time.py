"""Timezone helpers. All report timestamps are stored as local (Malaysia) wall-clock time."""

from datetime import date, datetime
from zoneinfo import ZoneInfo

from app.core.config import get_settings

DB_TIMESTAMP_FORMAT = "%Y-%m-%d %H:%M:%S"


def local_now() -> datetime:
    return datetime.now(ZoneInfo(get_settings().timezone))


def local_today() -> date:
    return local_now().date()


def to_db_timestamp(value: datetime) -> str:
    return value.strftime(DB_TIMESTAMP_FORMAT)


def month_start(value: date) -> date:
    return value.replace(day=1)
