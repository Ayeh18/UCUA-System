from typing import Any

from app.repositories.base import Repository

# Staff IDs are matched case-insensitively everywhere, as the original login did.
_PROFILE_COLUMNS = "staff_id, name, username, email, phone_number, designation, department, profile_pic"


class UserRepository(Repository):
    def get_credentials(self, staff_id: str) -> dict[str, Any] | None:
        return self.fetch_one(
            "SELECT staff_id, password FROM users WHERE LOWER(staff_id) = LOWER(%s)",
            (staff_id,),
        )

    def exists(self, staff_id: str) -> bool:
        return (
            self.fetch_one("SELECT 1 FROM users WHERE LOWER(staff_id) = LOWER(%s)", (staff_id,)) is not None
        )

    def get_profile(self, staff_id: str) -> dict[str, Any] | None:
        return self.fetch_one(
            f"SELECT {_PROFILE_COLUMNS} FROM users WHERE LOWER(staff_id) = LOWER(%s)",
            (staff_id,),
        )

    def get_reporter_details(self, staff_id: str) -> dict[str, Any] | None:
        return self.fetch_one(
            "SELECT name, department, designation FROM users WHERE LOWER(staff_id) = LOWER(%s)",
            (staff_id,),
        )

    def create(
        self,
        *,
        staff_id: str,
        password_hash: str,
        name: str,
        designation: str,
        department: str,
        dept_qhse: str,
        phone: str,
        email: str | None,
        user_type: str,
    ) -> None:
        self.execute(
            """
            INSERT INTO users (
                staff_id, password, name, designation,
                department, dept_qhse, phone_number, email, user_type
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (staff_id, password_hash, name, designation, department, dept_qhse, phone, email, user_type),
        )

    def update_password(self, staff_id: str, password_hash: str) -> int:
        return self.execute(
            "UPDATE users SET password = %s WHERE LOWER(staff_id) = LOWER(%s)",
            (password_hash, staff_id),
        )

    def update_profile(
        self,
        staff_id: str,
        *,
        username: str,
        email: str | None,
        phone: str,
        designation: str,
        department: str,
    ) -> int:
        return self.execute(
            """
            UPDATE users
            SET username = %s, email = %s, phone_number = %s, designation = %s, department = %s
            WHERE LOWER(staff_id) = LOWER(%s)
            """,
            (username, email, phone, designation, department, staff_id),
        )

    def update_profile_pic(self, staff_id: str, path: str) -> int:
        return self.execute(
            "UPDATE users SET profile_pic = %s WHERE LOWER(staff_id) = LOWER(%s)",
            (path, staff_id),
        )
