from fastapi import APIRouter, status

from app.api.deps import DbConnection
from app.schemas.auth import LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, conn: DbConnection) -> TokenResponse:
    return AuthService(conn).login(body.staff_id, body.password)


@router.post("/register", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, conn: DbConnection) -> MessageResponse:
    AuthService(conn).register(body)
    return MessageResponse(message="User registered successfully.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(body: ResetPasswordRequest, conn: DbConnection) -> MessageResponse:
    AuthService(conn).reset_password(body.staff_id, body.new_password)
    return MessageResponse(message="Password reset successfully.")
