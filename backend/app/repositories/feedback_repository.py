from app.repositories.base import Repository


class FeedbackRepository(Repository):
    def create(self, *, staff_id: str, name: str, feedback_type: str, message: str, date_time: str) -> None:
        self.execute(
            """
            INSERT INTO feedback (staff_id, name, feedback_type, message, date_time)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (staff_id, name, feedback_type, message, date_time),
        )
