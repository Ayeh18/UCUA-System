"""Shared FastAPI dependencies.

Previously every module defined its own copy of `get_current_user`, with three slightly
different behaviours. There is now exactly one.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from psycopg2.extensions import connection as PgConnection

from app.core.security import InvalidTokenError, decode_access_token
from app.db.database import get_db

_bearer = HTTPBearer(auto_error=False, description="JWT obtained from POST /auth/login")


def get_current_staff_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
) -> str:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        return decode_access_token(credentials.credentials)
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


DbConnection = Annotated[PgConnection, Depends(get_db)]
CurrentStaffId = Annotated[str, Depends(get_current_staff_id)]
