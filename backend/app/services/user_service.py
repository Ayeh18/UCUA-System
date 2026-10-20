from typing import Any

from fastapi import UploadFile
from psycopg2.extensions import connection as PgConnection

from app.core.config import get_settings
from app.core.exceptions import NotFoundError
from app.repositories.user_repository import UserRepository
from app.schemas.user import UpdateProfileRequest, UserProfile
from app.services.storage_service import AVATAR_KINDS, FileStorage, public_upload_url


def avatar_storage() -> FileStorage:
    settings = get_settings()
    return FileStorage(
        settings.upload_dir,
        allowed_kinds=AVATAR_KINDS,
        max_bytes=settings.max_upload_size_bytes,
        filename_prefix="profile_",
    )


def _to_profile(row: dict[str, Any]) -> UserProfile:
    username = row.get("username") or None
    return UserProfile(
        staff_id=row["staff_id"],
        name=row.get("name"),
        username=username,
        # Newly registered users have no username yet; fall back to their full name.
        display_name=username or row.get("name") or row["staff_id"],
        email=row.get("email"),
        phone=row.get("phone_number"),
        designation=row.get("designation"),
        department=row.get("department"),
        profile_pic_url=public_upload_url(row.get("profile_pic"), get_settings().upload_dir),
    )


class UserService:
    def __init__(self, conn: PgConnection, storage: FileStorage | None = None) -> None:
        self.conn = conn
        self.users = UserRepository(conn)
        self.storage = storage or avatar_storage()

    def _get_row(self, staff_id: str) -> dict[str, Any]:
        row = self.users.get_profile(staff_id)
        if not row:
            raise NotFoundError("User not found")
        return row

    def get_profile(self, staff_id: str) -> UserProfile:
        return _to_profile(self._get_row(staff_id))

    def update_profile(self, staff_id: str, data: UpdateProfileRequest) -> UserProfile:
        updated = self.users.update_profile(
            staff_id,
            username=data.username,
            email=str(data.email) if data.email else None,
            phone=data.phone,
            designation=data.designation,
            department=data.department,
        )
        if not updated:
            raise NotFoundError("User not found")
        self.conn.commit()
        return self.get_profile(staff_id)

    def update_avatar(self, staff_id: str, upload: UploadFile) -> UserProfile:
        old_path = self._get_row(staff_id).get("profile_pic")
        new_path = self.storage.save(upload)
        try:
            self.users.update_profile_pic(staff_id, new_path)
            self.conn.commit()
        except Exception:
            self.storage.delete(new_path)
            raise

        if old_path and old_path != new_path:
            self.storage.delete(old_path)
        return self.get_profile(staff_id)
