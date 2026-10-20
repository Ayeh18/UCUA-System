from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import NonEmptyStr, Password, StaffId


class LoginRequest(BaseModel):
    staff_id: StaffId
    # Not validated against password rules so that legacy passwords can still log in.
    password: str = Field(min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(description="Token lifetime in seconds")


class RegisterRequest(BaseModel):
    staff_id: StaffId
    password: Password
    name: NonEmptyStr
    designation: NonEmptyStr
    department: NonEmptyStr
    dept_qhse: NonEmptyStr
    phone: NonEmptyStr
    email: EmailStr | None = None


class ResetPasswordRequest(BaseModel):
    staff_id: StaffId
    new_password: Password
