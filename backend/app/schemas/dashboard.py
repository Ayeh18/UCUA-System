from datetime import date

from pydantic import BaseModel


class PointsBreakdown(BaseModel):
    report_count: int = 0
    daily_points: int = 0
    bonus_points: int = 0
    total_points: int = 0


class UserStats(PointsBreakdown):
    reports_today: int = 0
    daily_point_earned_today: bool = False
    bonus_earned_today: bool = False
    rank: int | None = None


class LeaderboardEntry(BaseModel):
    rank: int
    staff_id: str
    name: str | None = None
    reports: int
    points: int


class DashboardSummary(BaseModel):
    period_start: date
    current_user: str
    stats: UserStats
    leaderboard: list[LeaderboardEntry]
