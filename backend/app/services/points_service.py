"""Monthly gamification points.

Rules (unchanged from the original system):
  * +1 point per report submitted
  * +1 daily point for each day with at least one report
  * +5 bonus points for each day with 3 or more reports
Points reset at the start of every calendar month (local time).
"""

from datetime import date

from psycopg2.extensions import connection as PgConnection

from app.core.config import get_settings
from app.repositories.points_repository import PointsRepository
from app.schemas.dashboard import DashboardSummary, LeaderboardEntry, PointsBreakdown, UserStats
from app.utils.time import local_today, month_start

BONUS_THRESHOLD = 3
BONUS_POINTS_PER_DAY = 5


class PointsService:
    def __init__(self, conn: PgConnection) -> None:
        self.conn = conn
        self.points = PointsRepository(conn)

    def _ranked(self, staff_id: str, period_start: date, limit: int) -> list[dict]:
        return self.points.ranked_points(
            period_start=period_start,
            staff_id=staff_id,
            limit=limit,
            bonus_threshold=BONUS_THRESHOLD,
            bonus_per_day=BONUS_POINTS_PER_DAY,
        )

    def get_dashboard(self, staff_id: str) -> DashboardSummary:
        today = local_today()
        period_start = month_start(today)
        limit = get_settings().leaderboard_size

        rows = self._ranked(staff_id, period_start, limit)
        own_row = next((row for row in rows if row["staff_id"] == staff_id), None)
        reports_today = self.points.reports_on_day(staff_id, today)

        stats = UserStats(
            **(_breakdown(own_row).model_dump()),
            reports_today=reports_today,
            daily_point_earned_today=reports_today > 0,
            bonus_earned_today=reports_today >= BONUS_THRESHOLD,
            rank=own_row["rank"] if own_row else None,
        )
        leaderboard = [
            LeaderboardEntry(
                rank=row["rank"],
                staff_id=row["staff_id"],
                name=row.get("name"),
                reports=row["report_count"],
                points=row["total_points"],
            )
            for row in rows
            if row["rank"] <= limit
        ]
        return DashboardSummary(
            period_start=period_start,
            current_user=staff_id,
            stats=stats,
            leaderboard=leaderboard,
        )

    def sync_user_points(self, staff_id: str) -> None:
        """Recalculate and persist one user's points (called inside the report transaction)."""
        period_start = month_start(local_today())
        rows = self._ranked(staff_id, period_start, limit=0)
        breakdown = _breakdown(next((r for r in rows if r["staff_id"] == staff_id), None))
        self.points.upsert(staff_id=staff_id, period_start=period_start, **breakdown.model_dump())


def _breakdown(row: dict | None) -> PointsBreakdown:
    if not row:
        return PointsBreakdown()
    return PointsBreakdown(
        report_count=row["report_count"],
        daily_points=row["daily_points"],
        bonus_points=row["bonus_points"],
        total_points=row["total_points"],
    )
