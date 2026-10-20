from fastapi import APIRouter, File, UploadFile

from app.api.deps import CurrentStaffId, DbConnection
from app.schemas.user import UpdateProfileRequest, UserProfile
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserProfile)
def get_my_profile(staff_id: CurrentStaffId, conn: DbConnection) -> UserProfile:
    return UserService(conn).get_profile(staff_id)


@router.put("/me", response_model=UserProfile)
def update_my_profile(
    body: UpdateProfileRequest, staff_id: CurrentStaffId, conn: DbConnection
) -> UserProfile:
    return UserService(conn).update_profile(staff_id, body)


@router.post("/me/avatar", response_model=UserProfile)
def upload_my_avatar(
    staff_id: CurrentStaffId,
    conn: DbConnection,
    profile_pic: UploadFile = File(..., description="JPEG, PNG or WebP image"),
) -> UserProfile:
    return UserService(conn).update_avatar(staff_id, profile_pic)
