from fastapi import APIRouter

from app.api.deps import DbConnection
from app.repositories.lookup_repository import LookupRepository

router = APIRouter(prefix="/lookups", tags=["lookups"])


@router.get("/locations", response_model=list[str])
def list_locations(conn: DbConnection) -> list[str]:
    return LookupRepository(conn).list_locations()


@router.get("/companies", response_model=list[str])
def list_companies(conn: DbConnection) -> list[str]:
    return LookupRepository(conn).list_companies()
