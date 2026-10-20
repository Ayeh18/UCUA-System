from enum import StrEnum

from pydantic import BaseModel

from app.schemas.common import LongText


class FeedbackType(StrEnum):
    SUGGESTION = "Suggestion"
    ISSUE = "Issue"
    COMMENT = "Comment"


class FeedbackRequest(BaseModel):
    feedback_type: FeedbackType
    message: LongText
