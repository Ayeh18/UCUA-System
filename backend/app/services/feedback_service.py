from psycopg2.extensions import connection as PgConnection

from app.core.exceptions import NotFoundError
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.user_repository import UserRepository
from app.schemas.feedback import FeedbackRequest
from app.utils.time import local_now, to_db_timestamp


class FeedbackService:
    def __init__(self, conn: PgConnection) -> None:
        self.conn = conn
        self.users = UserRepository(conn)
        self.feedback = FeedbackRepository(conn)

    def submit(self, staff_id: str, data: FeedbackRequest) -> None:
        reporter = self.users.get_reporter_details(staff_id)
        if not reporter:
            raise NotFoundError("Staff not found")

        self.feedback.create(
            staff_id=staff_id,
            name=reporter["name"],
            feedback_type=data.feedback_type.value,
            message=data.message,
            date_time=to_db_timestamp(local_now()),
        )
        self.conn.commit()
