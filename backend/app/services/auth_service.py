import psycopg2.errors
from psycopg2.extensions import connection as PgConnection

from app.core.config import get_settings
from app.core.exceptions import AuthenticationError, ConflictError, NotFoundError
from app.core.security import create_access_token, hash_password, verify_password
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest, TokenResponse

# Staff in this department are registered as administrators.
ADMIN_DEPARTMENT = "qhse"

_INVALID_CREDENTIALS = "Invalid staff ID or password"


class AuthService:
    def __init__(self, conn: PgConnection) -> None:
        self.conn = conn
        self.users = UserRepository(conn)

    def login(self, staff_id: str, password: str) -> TokenResponse:
        user = self.users.get_credentials(staff_id)
        if not user or not verify_password(password, user["password"]):
            raise AuthenticationError(_INVALID_CREDENTIALS)

        settings = get_settings()
        return TokenResponse(
            access_token=create_access_token(user["staff_id"]),
            expires_in=settings.access_token_expire_minutes * 60,
        )

    def register(self, data: RegisterRequest) -> None:
        if self.users.exists(data.staff_id):
            raise ConflictError("This staff ID is already registered.")

        user_type = "admin" if data.department.lower() == ADMIN_DEPARTMENT else "user"
        try:
            self.users.create(
                staff_id=data.staff_id,
                password_hash=hash_password(data.password),
                name=data.name,
                designation=data.designation,
                department=data.department,
                dept_qhse=data.dept_qhse,
                phone=data.phone,
                email=str(data.email) if data.email else None,
                user_type=user_type,
            )
        except psycopg2.errors.UniqueViolation as exc:
            # Lost a race with a concurrent registration of the same staff ID.
            raise ConflictError("This staff ID is already registered.") from exc
        self.conn.commit()

    def reset_password(self, staff_id: str, new_password: str) -> None:
        updated = self.users.update_password(staff_id, hash_password(new_password))
        if not updated:
            raise NotFoundError("Staff ID not found.")
        self.conn.commit()
