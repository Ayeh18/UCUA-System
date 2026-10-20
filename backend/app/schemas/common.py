from typing import Annotated

from pydantic import AfterValidator, BaseModel, StringConstraints

from app.core.security import BCRYPT_MAX_BYTES

NonEmptyStr = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=255)]
OptionalStr = Annotated[str, StringConstraints(strip_whitespace=True, max_length=255)]
LongText = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=5000)]
StaffId = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=50)]

MIN_PASSWORD_LENGTH = 6


def _check_password(value: str) -> str:
    if len(value) < MIN_PASSWORD_LENGTH:
        raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters long")
    if len(value.encode("utf-8")) > BCRYPT_MAX_BYTES:
        raise ValueError(f"Password must be at most {BCRYPT_MAX_BYTES} bytes long")
    return value


Password = Annotated[str, AfterValidator(_check_password)]


class MessageResponse(BaseModel):
    message: str
