from pydantic import BaseModel, EmailStr

from app.schemas.common import NonEmptyStr, OptionalStr


class UserProfile(BaseModel):
    staff_id: str
    name: str | None = None
    username: str | None = None
    display_name: str
    email: str | None = None
    phone: str | None = None
    designation: str | None = None
    department: str | None = None
    profile_pic_url: str | None = None


class UpdateProfileRequest(BaseModel):
    username: NonEmptyStr
    email: EmailStr | None = None
    phone: OptionalStr = ""
    designation: OptionalStr = ""
    department: OptionalStr = ""
