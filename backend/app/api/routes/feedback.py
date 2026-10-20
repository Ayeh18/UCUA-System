from fastapi import APIRouter, status

from app.api.deps import CurrentStaffId, DbConnection
from app.schemas.common import MessageResponse
from app.schemas.feedback import FeedbackRequest
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(body: FeedbackRequest, staff_id: CurrentStaffId, conn: DbConnection) -> MessageResponse:
    FeedbackService(conn).submit(staff_id, body)
    return MessageResponse(message="Feedback submitted successfully")
