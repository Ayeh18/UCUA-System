from fastapi import APIRouter

from app.api.deps import CurrentStaffId, DbConnection
from app.schemas.dashboard import DashboardSummary
from app.services.points_service import PointsService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard(staff_id: CurrentStaffId, conn: DbConnection) -> DashboardSummary:
    """The caller's points for the current month plus the monthly leaderboard."""
    return PointsService(conn).get_dashboard(staff_id)
