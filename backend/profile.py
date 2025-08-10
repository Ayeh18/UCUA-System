from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from fastapi.security import OAuth2PasswordBearer
from fastapi.staticfiles import StaticFiles
from jose import jwt, JWTError, ExpiredSignatureError
from pydantic import BaseModel
from config import SECRET_KEY, ALGORITHM, conn
from typing import Optional
import os
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
router = APIRouter()

class UserProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    staffId: str
    designation: Optional[str] = None
    department: Optional[str] = None
    profile_pic: Optional[str] = None

def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        staff_id = payload.get("sub")
        if not staff_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing subject")
        return staff_id
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/profile", response_model=UserProfile)
def get_user_profile(staff_id: str = Depends(get_current_user)):
    cur = conn.cursor()
    try:
        cur.execute("""
            SELECT username, email, phone_number, staff_id, designation, department, profile_pic
            FROM users
            WHERE LOWER(staff_id) = LOWER(%s)
        """, (staff_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        username, email, phone, staff_id, designation, department, profile_pic = row
        public_pic_url = f"/uploads/{os.path.basename(profile_pic)}" if profile_pic else None

        return UserProfile(
            username=username,
            email=email,
            phone=phone,
            staffId=staff_id,
            designation=designation,
            department=department,
            profile_pic=public_pic_url
        )
    finally:
        cur.close()

@router.post("/upload-profile-pic", response_model=UserProfile)
async def upload_profile_pic(
    profile_pic: UploadFile = File(...),
    staff_id: str = Depends(get_current_user)
):
    valid_types = ["image/jpeg", "image/png"]
    if profile_pic.content_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG or PNG allowed.")

    file_ext = os.path.splitext(profile_pic.filename)[1]
    unique_name = f"profile_{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    try:
        with open(file_path, "wb") as f:
            f.write(await profile_pic.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    cur = conn.cursor()
    try:
        # Get current profile_pic path to delete
        cur.execute("SELECT profile_pic FROM users WHERE LOWER(staff_id) = LOWER(%s)", (staff_id,))
        old = cur.fetchone()
        if old and old[0]:
            old_path = old[0]
            # Only delete if file exists and is not the same as the new one
            if os.path.exists(old_path) and old_path != file_path:
                try:
                    os.remove(old_path)
                except Exception as e:
                    print(f"Warning: failed to remove old profile pic: {e}")

        cur.execute("""
            UPDATE users SET profile_pic = %s WHERE LOWER(staff_id) = LOWER(%s)
        """, (file_path, staff_id))
        conn.commit()

        # Fetch updated profile
        cur.execute("""
            SELECT username, email, phone_number, staff_id, designation, department, profile_pic
            FROM users WHERE LOWER(staff_id) = LOWER(%s)
        """, (staff_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="User not found")

        username, email, phone, staff_id, designation, department, profile_pic = row
        public_pic_url = f"/uploads/{os.path.basename(profile_pic)}" if profile_pic else None

        return UserProfile(
            username=username,
            email=email,
            phone=phone,
            staffId=staff_id,
            designation=designation,
            department=department,
            profile_pic=public_pic_url
        )
    finally:
        cur.close()
