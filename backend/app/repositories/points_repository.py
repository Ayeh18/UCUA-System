from datetime import date
from typing import Any

from app.repositories.base import Repository

# Per-staff point totals for one period, computed from data_bank:
#   report_count = reports submitted
#   daily_points = days with at least one report
#   bonus_points = bonus_per_day x days with >= bonus_threshold reports
# Ties are broken by whoever reached their total first (earliest latest-report time).
_RANKED_POINTS_SQL = """
WITH daily AS (
    SELECT staff_id,
           date_time::date AS report_day,
           COUNT(*)        AS reports,
           MAX(date_time)  AS last_report_at
    FROM data_bank
    WHERE date_time >= %(period_start)s
    GROUP BY staff_id, date_time::date
),
totals AS (
    SELECT staff_id,
           SUM(reports)::int                                                AS report_count,
           COUNT(*)::int                                                    AS daily_points,
           (%(bonus_per_day)s * COUNT(*) FILTER (WHERE reports >= %(bonus_threshold)s))::int
                                                                            AS bonus_points,
           MAX(last_report_at)                                              AS last_report_at
    FROM daily
    GROUP BY staff_id
),
ranked AS (
    SELECT t.staff_id,
           u.name,
           t.report_count,
           t.daily_points,
           t.bonus_points,
           t.report_count + t.daily_points + t.bonus_points AS total_points,
           ROW_NUMBER() OVER (
               ORDER BY t.report_count + t.daily_points + t.bonus_points DESC, t.last_report_at ASC
           )::int AS rank
    FROM totals t
    LEFT JOIN users u ON u.staff_id = t.staff_id
)
SELECT * FROM ranked
WHERE rank <= %(limit)s OR staff_id = %(staff_id)s
ORDER BY rank
"""


class PointsRepository(Repository):
    def ranked_points(
        self,
        *,
        period_start: date,
        staff_id: str,
        limit: int,
        bonus_threshold: int,
        bonus_per_day: int,
    ) -> list[dict[str, Any]]:
        """Top `limit` rows of the period plus the given staff member's row (if they have one)."""
        return self.fetch_all(
            _RANKED_POINTS_SQL,
            {
                "period_start": f"{period_start.isoformat()} 00:00:00",
                "staff_id": staff_id,
                "limit": limit,
                "bonus_threshold": bonus_threshold,
                "bonus_per_day": bonus_per_day,
            },
        )

    def reports_on_day(self, staff_id: str, day: date) -> int:
        row = self.fetch_one(
            "SELECT COUNT(*)::int AS n FROM data_bank WHERE staff_id = %s AND date_time::date = %s",
            (staff_id, day.isoformat()),
        )
        return row["n"] if row else 0

    def upsert(
        self,
        *,
        staff_id: str,
        report_count: int,
        daily_points: int,
        bonus_points: int,
        total_points: int,
        period_start: date,
    ) -> None:
        """Keep the `points` table in sync for any reporting tools that read it directly."""
        self.execute(
            """
            INSERT INTO points (
                staff_id, report_count, daily_points, bonus_points, total_points,
                last_reset_date, updated_at
            )
            VALUES (%s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            ON CONFLICT (staff_id) DO UPDATE
            SET report_count    = EXCLUDED.report_count,
                daily_points    = EXCLUDED.daily_points,
                bonus_points    = EXCLUDED.bonus_points,
                total_points    = EXCLUDED.total_points,
                last_reset_date = EXCLUDED.last_reset_date,
                updated_at      = CURRENT_TIMESTAMP
            """,
            (staff_id, report_count, daily_points, bonus_points, total_points, period_start),
        )
